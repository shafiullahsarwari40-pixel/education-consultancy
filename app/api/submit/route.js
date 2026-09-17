import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin, isInvalidSupabaseApiKeyError } from '../../../lib/supabaseAdmin';
import { STUDENT_DOCUMENT_BUCKET, documentReference } from '../../../lib/documentStorage';
import { RequestError, readBoundedBody, textField, emailField, rateLimit } from '../_lib/request';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'horizon@horizon-edu.net';
// Vercel Functions cap request bodies at 4.5 MB. Keep multipart uploads below
// that platform limit, including form fields and boundary overhead.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const DOCUMENT_TYPES = ['passport', 'transcript', 'diploma', 'exam_sheet', 'id_card', 'photo'];
const FILE_TYPES = {
  'application/pdf': { extension: 'pdf', matches: (b) => b.subarray(0, 5).toString() === '%PDF-' },
  'image/jpeg': { extension: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: 'png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: 'webp', matches: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  'image/gif': { extension: 'gif', matches: (b) => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString()) },
};

async function sendNotificationEmail({ full_name, email, program, university, applicationId }) {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!host || !user || !pass) return;
  const port = Number(process.env.EMAIL_PORT || '587');
  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transporter.sendMail({
    from: user,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: 'New Student Application',
    text: `A new student application has been submitted.\n\nStudent Name: ${full_name}\nEmail: ${email}\nProgram: ${program}\nUniversity: ${university}\nApplication ID: ${applicationId}\n\nView the admin dashboard to review the application.`,
  });
}

async function sendTelegramNotification({ full_name, email, program, university, applicationId }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `New Student Application\n\nStudent Name: ${full_name}\nEmail: ${email}\nProgram: ${program}\nUniversity: ${university}\nApplication ID: ${applicationId}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Application notification service failed.');
}

async function validateDocuments(formData) {
  const files = [];
  let totalSize = 0;
  for (const docType of DOCUMENT_TYPES) {
    const file = formData.get(docType);
    if (!file || (typeof file !== 'string' && file.size === 0 && !file.name)) continue;
    if (typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      throw new RequestError(`Please choose a valid ${docType.replaceAll('_', ' ')} file.`);
    }
    if (!file.size || file.size > MAX_FILE_BYTES) throw new RequestError('Each document must be between 1 byte and 4 MB.');
    totalSize += file.size;
    if (totalSize > MAX_TOTAL_BYTES) throw new RequestError('Your documents must total 4 MB or less.', 413);
    const type = FILE_TYPES[file.type];
    if (!type) throw new RequestError('Documents must be PDF, JPG, PNG, WebP, or GIF files.');
    const signature = Buffer.from(await file.slice(0, 12).arrayBuffer());
    if (!type.matches(signature)) throw new RequestError(`The ${docType.replaceAll('_', ' ')} file does not match its file type. Please export it again.`);
    files.push({ docType, file, extension: type.extension });
  }
  return files;
}

export async function POST(request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) return NextResponse.json({ error: 'Please sign in before submitting an application.' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Applications are temporarily unavailable. Please contact our admissions team.' }, { status: 503 });

  let applicationId = null;
  let applicationSaved = false;
  const uploadedPaths = [];
  const uploadBucket = STUDENT_DOCUMENT_BUCKET;

  try {
    // Validate the session before accepting or parsing document uploads.
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      const unavailable = isInvalidSupabaseApiKeyError(userError);
      return NextResponse.json({ error: unavailable ? 'Applications are temporarily unavailable.' : 'Your session has expired. Please sign in again.' }, { status: unavailable ? 503 : 401 });
    }
    const user_id = userData.user.id;
    if (!rateLimit(`application:${user_id}`, 3)) {
      return NextResponse.json({ error: 'Please wait a minute before submitting again.' }, { status: 429, headers: { 'Retry-After': '60' } });
    }
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) throw new RequestError('Please submit the application form with its documents.', 415);
    const body = await readBoundedBody(request, MAX_TOTAL_BYTES + 128 * 1024);
    let formData;
    try {
      formData = await new Response(body, { headers: { 'Content-Type': contentType } }).formData();
    } catch {
      throw new RequestError('The application could not be read. Please try again.');
    }
    const fields = {
      full_name: textField(formData.get('full_name'), 'Full name', 200, true),
      email: emailField(formData.get('email')),
      phone: textField(formData.get('phone'), 'Phone', 40, true),
      mother_name: textField(formData.get('mother_name'), 'Mother’s name', 160),
      father_name: textField(formData.get('father_name'), 'Father’s name', 160),
      address: textField(formData.get('address'), 'Address', 500),
      country: textField(formData.get('country'), 'Country', 100),
      program: textField(formData.get('program'), 'Program', 160),
      university: textField(formData.get('university'), 'University', 200),
      message: textField(formData.get('message'), 'Message', 5000),
    };
    if (!/^[+()\d\s.\-]{6,40}$/.test(fields.phone)) throw new RequestError('Enter a valid phone number, including its country code.');
    const files = await validateDocuments(formData);

    const { data: application, error: appError } = await supabaseAdmin.from('applications')
      .insert([{ ...fields, user_id, application_status: 'submitted', status_updated_at: new Date().toISOString() }])
      .select('id').single();
    if (appError || !application) throw new Error('Application insert failed.', { cause: appError });
    applicationId = application.id;

    const documents = {};
    for (const { docType, file, extension } of files) {
      const filePath = `applications/${applicationId}/${docType}-${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabaseAdmin.storage.from(uploadBucket)
        .upload(filePath, new Uint8Array(await file.arrayBuffer()), { cacheControl: '0', upsert: false, contentType: file.type });
      if (uploadError) throw new Error('Document upload failed.', { cause: uploadError });
      uploadedPaths.push(filePath);
      documents[`${docType}_url`] = documentReference(uploadBucket, filePath);
    }
    if (Object.keys(documents).length) {
      const { error: docError } = await supabaseAdmin.from('application_documents').insert([{ application_id: applicationId, ...documents }]);
      if (docError) throw new Error('Document references could not be saved.', { cause: docError });
    }
    applicationSaved = true;

    // Notification failure must never turn a saved application into a failed submission.
    const notificationResults = await Promise.allSettled([
      supabaseAdmin.from('admin_notifications').insert([{
        application_id: applicationId, student_name: fields.full_name,
        student_email: fields.email, program: fields.program, university: fields.university, read: false,
      }]),
      sendNotificationEmail({ ...fields, applicationId }),
      sendTelegramNotification({ ...fields, applicationId }),
    ]);
    notificationResults.forEach((result) => {
      if (result.status === 'rejected' || result.value?.error) console.error('An application notification could not be delivered.');
    });
    return NextResponse.json({ success: true, applicationId });
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Application submission failed:', error?.message);
    if (applicationId && !applicationSaved) {
      // Compensate only for rows/files created by this request.
      try {
        const { error: documentError } = await supabaseAdmin.from('application_documents').delete().eq('application_id', applicationId);
        const { error: storageError } = uploadedPaths.length ? await supabaseAdmin.storage.from(uploadBucket).remove(uploadedPaths) : { error: null };
        const { error: deleteError } = await supabaseAdmin.from('applications').delete().eq('id', applicationId);
        if (documentError || storageError || deleteError) throw new Error('Incomplete cleanup');
      } catch {
        console.error('Application cleanup requires review:', applicationId);
        return NextResponse.json({ error: `Your application needs a manual document check. Please contact admissions with reference ${applicationId} before submitting again.`, applicationId }, { status: 500 });
      }
    }
    return NextResponse.json({ error: 'Your application could not be completed. Please try again or contact admissions.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAdminKeyMalformed, isInvalidSupabaseApiKeyError } from '../../../lib/supabaseAdmin';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'horizon@horizon-edu.net';
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = Number(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function sendNotificationEmail({ full_name, email, program, university, applicationId }) {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('Email configuration not set; skipping notification email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const subject = 'New Student Application';
  const text = `A new student application has been submitted.\n\nStudent Name: ${full_name}\nEmail: ${email}\nProgram: ${program}\nUniversity: ${university}\nApplication ID: ${applicationId}\n\nView the admin dashboard to review the application.`;

  await transporter.sendMail({
    from: `${EMAIL_USER}`,
    to: ADMIN_EMAIL,
    subject,
    text,
  });
}

async function sendTelegramNotification({ full_name, email, program, university, applicationId }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const message = encodeURIComponent(`New Student Application\n\nStudent Name: ${full_name}\nEmail: ${email}\nProgram: ${program}\nUniversity: ${university}\nApplication ID: ${applicationId}`);
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`;

  await fetch(url);
}

export async function POST(request) {
  if (!supabaseAdmin || supabaseAdminKeyMalformed) {
    return NextResponse.json(
      { error: 'Server auth configuration invalid. Check SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error('Form data parse error:', err);
    return NextResponse.json({ error: 'Unable to parse request body. The payload may be too large or malformed.' }, { status: 400 });
  }

  const full_name = formData.get('full_name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const mother_name = formData.get('mother_name') || '';
  const father_name = formData.get('father_name') || '';
  const address = formData.get('address') || '';
  const country = formData.get('country') || '';
  const program = formData.get('program') || '';
  const university = formData.get('university') || '';
  const message = formData.get('message') || '';

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    if (isInvalidSupabaseApiKeyError(userError)) {
      return NextResponse.json(
        { error: 'Server auth configuration invalid. Check SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
  }

  const user_id = userData.user.id;

  if (!full_name || !email || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data: applicationData, error: appError } = await supabaseAdmin
      .from('applications')
      .insert([{ full_name, email, phone, mother_name, father_name, address, country, program, university, message, user_id, application_status: 'submitted', status_updated_at: new Date().toISOString() }])
      .select();

    if (appError || !applicationData || applicationData.length === 0) {
      return NextResponse.json({ error: appError?.message || 'Failed to create application' }, { status: 500 });
    }

    const applicationId = applicationData[0].id;
    const uploadBucket = 'application-uploads';
    const documents = {};
    const docTypes = ['passport', 'transcript', 'diploma', 'exam_sheet', 'id_card', 'photo'];

    for (const docType of docTypes) {
      const file = formData.get(docType);
      if (!file || typeof file === 'string') continue;

      try {
        const timestamp = Date.now();
        const fileName = file.name || `${docType}-${timestamp}`;
        const filePath = `applications/${applicationId}/${docType}-${timestamp}-${fileName}`;
        const arrayBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabaseAdmin.storage
          .from(uploadBucket)
          .upload(filePath, new Uint8Array(arrayBuffer), {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${docType}:`, uploadError);
          return NextResponse.json({ error: `Upload failed for ${docType}: ${uploadError.message}` }, { status: 500 });
        }

        const { data: publicUrlData, error: urlError } = await supabaseAdmin.storage
          .from(uploadBucket)
          .getPublicUrl(filePath);

        if (urlError || !publicUrlData?.publicUrl) {
          return NextResponse.json({ error: `Failed to generate public URL for ${docType}` }, { status: 500 });
        }

        documents[`${docType}_url`] = publicUrlData.publicUrl;
      } catch (err) {
        console.error(`File processing error for ${docType}:`, err);
        return NextResponse.json({ error: `File processing error for ${docType}: ${err.message}` }, { status: 500 });
      }
    }

    if (Object.keys(documents).length > 0) {
      const docRecord = { application_id: applicationId, ...documents };
      const { error: docError } = await supabaseAdmin.from('application_documents').insert([docRecord]);
      if (docError) {
        console.error('Document insert error:', docError);
        return NextResponse.json({ error: docError.message || 'Failed to save application documents' }, { status: 500 });
      }
    }

    const notificationPayload = {
      application_id: applicationId,
      student_name: full_name,
      student_email: email,
      program,
      university,
      read: false,
    };

    const { error: notificationError } = await supabaseAdmin.from('admin_notifications').insert([notificationPayload]);
    if (notificationError) {
      console.error('Notification insert error:', notificationError);
    }

    try {
      await sendNotificationEmail({ full_name, email, program, university, applicationId });
    } catch (emailError) {
      console.error('Application notification email error:', emailError);
    }

    try {
      await sendTelegramNotification({ full_name, email, program, university, applicationId });
    } catch (telegramError) {
      console.error('Application Telegram notification error:', telegramError);
    }

    return NextResponse.json({ success: true, applicationId });
  } catch (err) {
    console.error('API submit error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

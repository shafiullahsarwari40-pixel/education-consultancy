import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAdminKeyMalformed, isInvalidSupabaseApiKeyError } from '../../../lib/supabaseAdmin';


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

    return NextResponse.json({ success: true, applicationId });
  } catch (err) {
    console.error('API submit error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

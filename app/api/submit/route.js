import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

const serverClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request) {
  if (!serverClient) {
    return NextResponse.json({ error: 'Server Supabase client not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
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

    if (!full_name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Create application record
    const { data: applicationData, error: appError } = await serverClient
      .from('applications')
      .insert([{ full_name, email, phone, mother_name, father_name, address, country, program, university, message }])
      .select();

    if (appError || !applicationData || applicationData.length === 0) {
      return NextResponse.json({ error: appError?.message || 'Failed to create application' }, { status: 500 });
    }

    const applicationId = applicationData[0].id;
    const uploadBucket = 'application-uploads';
    const documents = {};

    // Step 2: Upload files to storage
    const docTypes = ['passport', 'transcript', 'diploma', 'exam_sheet', 'id_card', 'photo'];
    for (const docType of docTypes) {
      const file = formData.get(docType);
      if (!file) continue;

      try {
        const timestamp = Date.now();
        const fileName = file.name || `${docType}-${timestamp}`;
        const filePath = `applications/${applicationId}/${docType}-${timestamp}-${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await serverClient.storage
          .from(uploadBucket)
          .upload(filePath, new Uint8Array(arrayBuffer), {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${docType}:`, uploadError);
          return NextResponse.json({ error: `Upload failed for ${docType}: ${uploadError.message}` }, { status: 500 });
        }

        const { data: publicUrlData } = serverClient.storage
          .from(uploadBucket)
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          return NextResponse.json({ error: `Failed to generate public URL for ${docType}` }, { status: 500 });
        }

        documents[`${docType}_url`] = publicUrlData.publicUrl;
      } catch (err) {
        console.error(`File processing error for ${docType}:`, err);
        return NextResponse.json({ error: `File processing error for ${docType}: ${err.message}` }, { status: 500 });
      }
    }

    // Step 3: Save document URLs if files were uploaded
    if (Object.keys(documents).length > 0) {
      const docRecord = { application_id: applicationId, ...documents };
      const { error: docError } = await serverClient.from('application_documents').insert([docRecord]);
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

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'horizon@horizon-edu.net';
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = Number(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

async function sendNotificationEmail({ name, email, subject, message }) {
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

  const mailSubject = `New contact message from ${name}`;
  const mailBody = `You have received a new contact request.

Name: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}
Message:
${message}

Reply to: ${email}`;

  await transporter.sendMail({
    from: `${EMAIL_USER}`,
    to: ADMIN_EMAIL,
    subject: mailSubject,
    text: mailBody,
  });
}

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server Supabase client not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('contact_messages').insert([
      {
        name,
        email,
        subject: subject || null,
        message,
      },
    ]);

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json({ error: error.message || 'Failed to save contact message.' }, { status: 500 });
    }

    try {
      await sendNotificationEmail({ name, email, subject, message });
    } catch (sendError) {
      console.error('Contact notification email error:', sendError);
      // Do not fail the request if email fails.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process contact message.' }, { status: 500 });
  }
}

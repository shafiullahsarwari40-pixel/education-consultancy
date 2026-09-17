import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import nodemailer from 'nodemailer';
import { RequestError, readJson, textField, emailField, rateLimit, requestAddress } from '../_lib/request';

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
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
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
    replyTo: email,
    text: mailBody,
  });
}

export async function POST(request) {
  if (!rateLimit(`contact:${requestAddress(request)}`, 5)) {
    return NextResponse.json({ error: 'Please wait a minute before sending another message.' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  try {
    const body = await readJson(request);
    const name = textField(body.name, 'Name', 120, true);
    const email = emailField(body.email);
    const subject = textField(body.subject, 'Subject', 200);
    const message = textField(body.message, 'Message', 5000, true);
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Contact service is temporarily unavailable. Please email horizon@horizon-edu.net.' }, { status: 503 });
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
      return NextResponse.json({ error: 'Your message could not be saved. Please try again or email horizon@horizon-edu.net.' }, { status: 500 });
    }

    try {
      await sendNotificationEmail({ name, email, subject, message });
    } catch (sendError) {
      console.error('Contact notification email error:', sendError);
      // Do not fail the request if email fails.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Unable to send your message. Please try again shortly.' }, { status: 500 });
  }
}

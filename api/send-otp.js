import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export default async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Received: ' + req.method });
  }
  try {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing fields' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('verification_codes')
      .upsert({ user_id: userId, code: otpCode, expires_at: expiresAt }, { onConflict: 'user_id' });
    if (dbError) throw dbError;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'CeTech Academy <info@cetechacademy.com>',
      to: email,
      subject: 'Your CeTech Verification Code',
      html: `<div style="font-family:sans-serif;text-align:center;padding:40px;background:#070b10;color:white;">
              <h2 style="color:#00d2ff;">Verify Your Identity</h2>
              <p style="font-size:18px;color:#cbd5e1;">Your 6-digit verification code is:</p>
              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0;padding:10px;background:rgba(255,255,255,0.1);border-radius:12px;">${otpCode}</div>
              <p style="font-size:14px;color:#94a3b8;">This code expires in 10 minutes.</p>
            </div>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('OTP Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

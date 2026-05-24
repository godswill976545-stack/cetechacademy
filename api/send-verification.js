import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_lib/email.js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_code: verificationCode,
        verification_expires_at: expiresAt.toISOString()
      })
      .eq('email', email);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to save verification code' });
    }

    await sendEmail({
      to: email,
      subject: 'Your Verification Code — CeTech Academy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin:0; padding:0; background:#f8fafc; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:40px auto;">
            <tr>
              <td style="padding:40px; background:#ffffff; border-radius:24px; border:1px solid #e2e8f0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="text-align:center; padding-bottom:32px;">
                      <h1 style="margin:0; font-size:24px; font-weight:700; color:#1e293b; font-family:'Space Grotesk',sans-serif;">
                        CeTech Academy
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <h2 style="margin:0 0 12px; font-size:20px; font-weight:600; color:#1e293b;">
                        Welcome${fullName ? ', ' + fullName : ''}!
                      </h2>
                      <p style="margin:0; font-size:16px; line-height:1.6; color:#64748b;">
                        Thank you for joining CeTech Academy. Please use the verification code below to activate your account.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:center; padding:32px 0;">
                      <div style="display:inline-block; padding:20px 40px; background:#f1f5f9; color:#007bff; border-radius:12px; font-size:32px; font-weight:700; letter-spacing:8px; border:2px dashed #007bff;">
                        ${verificationCode}
                      </div>
                      <p style="margin-top:16px; font-size:14px; color:#64748b;">This code expires in 30 minutes.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:24px; border-top:1px solid #e2e8f0;">
                      <p style="margin:0; font-size:13px; line-height:1.5; color:#94a3b8;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="text-align:center; padding-top:24px;">
                <p style="margin:0; font-size:12px; color:#94a3b8;">
                  &copy; ${new Date().getFullYear()} CeTech Academy. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

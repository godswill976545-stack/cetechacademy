const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  // CORS headers
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
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'CeTech Academy <noreply@cetechacademy.com>',
      to: email,
      subject: 'Verify your email — CeTech Academy',
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
                        Thanks for signing up. Please verify your email address to activate your account and start your learning journey.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:center; padding:32px 0;">
                      <a href="${process.env.VERCEL_URL || 'https://cetechacademy.com'}/login.html?verified=true&email=${encodeURIComponent(email)}"
                         style="display:inline-block; padding:16px 40px; background:#007bff; color:#ffffff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                        Verify My Email
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:24px; border-top:1px solid #e2e8f0;">
                      <p style="margin:0; font-size:13px; line-height:1.5; color:#94a3b8;">
                        If you didn't create an account, you can safely ignore this email.<br>
                        This link will expire in 24 hours.
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

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    return res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

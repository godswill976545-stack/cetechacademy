import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // Delete any existing codes for this user
    await supabase
      .from('verification_codes')
      .delete()
      .eq('user_id', user.id);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CeTech Academy <info@cetechacademy.com>',
        to: [email],
        subject: 'Your CeTech Academy Verification Code',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:30px;">
              <h1 style="color:#007bff;font-size:24px;margin:0;">CeTech Academy</h1>
            </div>
            <div style="background:#f8f9fa;border-radius:12px;padding:32px;text-align:center;">
              <h2 style="color:#333;font-size:20px;margin:0 0 16px;">Verify Your Email</h2>
              <p style="color:#666;font-size:14px;margin:0 0 24px;">Enter this 6-digit code to complete your registration:</p>
              <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#007bff;margin:24px 0;">${code}</div>
              <p style="color:#999;font-size:12px;margin:24px 0 0;">This code expires in 10 minutes.</p>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;">If you didn't create an account, ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Resend error:', emailRes.status, err);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    // Find matching code that hasn't expired
    const { data: storedCode, error: codeError } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('user_id', user.id)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !storedCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Delete used code
    await supabase
      .from('verification_codes')
      .delete()
      .eq('id', storedCode.id);

    // Mark user as verified in Supabase
    await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', user.id);

    // Verify email in Clerk via Backend API
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (secretKey && user.clerk_id) {
      try {
        // Get the user's email addresses from Clerk
        const clerkUserRes = await fetch(`https://api.clerk.com/v1/users/${user.clerk_id}`, {
          headers: { 'Authorization': `Bearer ${secretKey}` },
        });
        const clerkUser = await clerkUserRes.json();

        if (clerkUser.email_addresses?.length > 0) {
          const emailId = clerkUser.email_addresses[0].id;

          // Mark email as verified
          await fetch(`https://api.clerk.com/v1/users/${user.clerk_id}/email_addresses/${emailId}/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ strategy: 'admin' }),
          });
        }
      } catch (clerkErr) {
        console.error('Clerk email verify error:', clerkErr);
        // Continue anyway — user is verified in our DB
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

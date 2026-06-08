import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: 'CLERK_SECRET_KEY is missing' }, { status: 500 });
    }

    // Create user via Clerk Backend API
    const body: Record<string, unknown> = {
      email_address: [email],
      password,
    };
    if (firstName) body.first_name = firstName;
    if (lastName) body.last_name = lastName;

    const res = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.errors?.[0]?.message || data?.error || 'Failed to create account';
      return NextResponse.json({ error: msg, clerkStatus: res.status }, { status: 400 });
    }

    // Also insert into Supabase users table via webhook normally handles this,
    // but let's also do it here as a fallback
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const userId = data.id;
    const userUuid = crypto.randomUUID();

    // Check if already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!existing) {
      await supabase.from('users').insert({
        id: userUuid,
        clerk_id: userId,
        email,
        full_name: [firstName, lastName].filter(Boolean).join(' '),
        is_verified: false,
        payment_status: 'unpaid',
      });
    }

    return NextResponse.json({ userId, email });
  } catch (err: any) {
    console.error('Signup API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

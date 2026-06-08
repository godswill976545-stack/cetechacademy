import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, avatar_url, payment_status, is_verified')
      .eq('clerk_id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      supabaseUserId: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      paymentStatus: user.payment_status,
      isVerified: user.is_verified,
    });
  } catch (err: any) {
    console.error('Auth/me error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

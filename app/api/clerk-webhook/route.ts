import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headers = {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': req.headers.get('svix-signature') || '',
    };

    // Verify webhook signature
    if (webhookSecret) {
      const wh = new Webhook(webhookSecret);
      try {
        wh.verify(body, headers);
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const eventType = payload.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = payload.data;
      const email = email_addresses?.[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || '';

      if (!email) {
        return NextResponse.json({ error: 'No email provided' }, { status: 400 });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Check if user already exists
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', id)
        .single();

      if (!existing) {
        // Insert new user with a generated UUID
        const userUuid = crypto.randomUUID();
        const { error: insertError } = await supabaseAdmin.from('users').insert({
          id: userUuid,
          clerk_id: id,
          email,
          full_name: fullName,
          is_verified: true,
          payment_status: 'unpaid',
        });

        if (insertError) {
          console.error('Error inserting user:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // Track signup in PostHog
        try {
          const { PostHog } = await import('posthog-node');
          const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            flushAt: 1,
            flushInterval: 0,
          });
          posthog.capture({
            distinctId: id,
            event: 'user_signed_up',
            properties: { email, method: 'clerk' },
          });
          await posthog.shutdown();
        } catch (e) {
          console.error('PostHog tracking error:', e);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

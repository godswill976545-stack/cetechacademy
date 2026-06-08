import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET;

    const body = await req.text();

    if (secret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['verify']
      );
      const expectedSignature = Array.from(
        new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)))
      ).map(b => b.toString(16).padStart(2, '0')).join('');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);

    if (payload.event === 'charge.success') {
      const reference = payload.data.reference;
      const status = payload.data.status;
      const email = payload.data.customer?.email;

      if (reference && email && status === 'success') {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (user) {
          await supabaseAdmin.from('users').update({ payment_status: 'paid' }).eq('id', user.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

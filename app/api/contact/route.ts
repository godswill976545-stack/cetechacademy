import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, program } = await req.json();

    if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!program || typeof program !== 'string' || program.length < 2 || program.length > 100) {
      return NextResponse.json({ error: 'Invalid program' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CeTech Academy <info@cetechacademy.com>',
          to: ['info@cetechacademy.com'],
          subject: `New Inquiry: ${program}`,
          html: `
            <div style="font-family:sans-serif;padding:40px;">
              <h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
               <p><strong>Email:</strong> ${email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
               <p><strong>Program:</strong> ${program.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>`,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', res.status, err);
      }
    }

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

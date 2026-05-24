import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const defaultFrom = process.env.SMTP_FROM || 'CeTech Academy <noreply@cetechacademy.com>';

export async function sendEmail({ to, subject, html, from }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: from || defaultFrom,
    to,
    subject,
    html
  });
}

export { defaultFrom };

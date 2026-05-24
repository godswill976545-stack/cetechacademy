require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { helmet, xss, cors, cookieParser, apiLimiter, strictLimiter, csrfProtection, errorHandler } = require('./middleware/security');
const { validateContact, validateAuth } = require('./middleware/validation');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

// Security Middleware
app.use(helmet);
app.use(xss);
app.use(cors);
app.use(cookieParser);
app.use(express.json({ limit: '10kb' })); // Limit body size

// Apply global rate limit
app.use('/api/', apiLimiter);

// In-memory mock database
const inquiries = [];

// Simple health check endpoint
app.get('/api/health', csrfProtection, (req, res) => {
  res.json({ status: 'ok', message: 'CeTech Academy API is running' });
});

// --- Auth Endpoints ---

app.post('/api/auth/register', strictLimiter, csrfProtection, validateAuth, async (req, res) => {
  const { email, password, fullName } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (error) return res.status(error.status || 400).json({ error: error.message });
  res.status(201).json({ message: 'User registered successfully', data });
});

app.post('/api/auth/login', strictLimiter, csrfProtection, validateAuth, async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(error.status || 400).json({ error: error.message });

  // Set secure HttpOnly cookie for the session
  if (data.session) {
    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in * 1000
    });
    res.cookie('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  res.json({ message: 'Login successful', user: data.user });
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// --- Webhook & Contact ---

// FedaPay Webhook Placeholder
app.post('/api/fedapay/webhook', strictLimiter, async (req, res) => {
  // Webhooks usually have their own signature verification and bypass CSRF
  console.log('Webhook received', req.body);
  // TODO: Add signature verification and database update logic later
  res.status(200).send('Webhook received');
});

// Contact endpoint
app.post('/api/contact', strictLimiter, csrfProtection, validateContact, (req, res) => {
  const { name, email, program } = req.body;

  // Create inquiry record
  const newInquiry = {
    id: Date.now().toString(),
    name,
    email,
    program,
    date: new Date().toISOString()
  };

  // Add to our mock database
  inquiries.push(newInquiry);

  console.log('--- New Inquiry Received ---');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Program: ${program}`);
  console.log('----------------------------');

  res.status(201).json({ 
    success: true, 
    message: 'Inquiry submitted successfully',
    data: newInquiry
  });
});

// --- OTP / Email Verification Endpoints ---

app.post('/api/send-otp', strictLimiter, async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing fields' });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('verification_codes')
      .upsert({ user_id: userId, code: otpCode, expires_at: expiresAt }, { onConflict: 'user_id' });
    if (dbError) throw dbError;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'CeTech Academy <info@cetechacademy.com>',
      to: email,
      subject: 'Your CeTech Verification Code',
      html: `<div style="font-family:sans-serif;text-align:center;padding:40px;background:#070b10;color:white;">
              <h2 style="color:#00d2ff;">Verify Your Identity</h2>
              <p style="font-size:18px;color:#cbd5e1;">Your 6-digit verification code is:</p>
              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0;padding:10px;background:rgba(255,255,255,0.1);border-radius:12px;">${otpCode}</div>
              <p style="font-size:14px;color:#94a3b8;">This code expires in 10 minutes.</p>
            </div>`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-otp', strictLimiter, async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: 'Missing fields' });

    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .single();

    if (error || !data) return res.status(400).json({ error: 'Invalid code' });
    if (new Date(data.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });

    await supabase.from('verification_codes').delete().eq('user_id', userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Centralized Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

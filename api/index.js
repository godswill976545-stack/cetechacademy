const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { helmet, xss, cors, cookieParser, apiLimiter, strictLimiter, csrfProtection, errorHandler } = require('./middleware/security');
const { validateContact, validateAuth } = require('./middleware/validation');
const { authenticate } = require('./middleware/auth');

const app = express();

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
app.use(express.json({ limit: '10kb' }));

// Apply global rate limit
app.use('/api/', apiLimiter);

// In-memory mock database
const inquiries = [];

// Simple health check endpoint
app.get('/api/health', csrfProtection, (req, res) => {
  res.json({ status: 'ok', message: 'CeTech Academy API is running on Vercel' });
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
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  res.json({ message: 'Login successful', user: data.user });
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// FedaPay Webhook Placeholder
app.post('/api/fedapay/webhook', strictLimiter, async (req, res) => {
  console.log('Webhook received', req.body);
  res.status(200).send('Webhook received');
});

// Contact endpoint
app.post('/api/contact', strictLimiter, csrfProtection, validateContact, (req, res) => {
  const { name, email, program } = req.body;

  const newInquiry = {
    id: Date.now().toString(),
    name,
    email,
    program,
    date: new Date().toISOString()
  };

  inquiries.push(newInquiry);
  console.log('New Inquiry:', newInquiry);

  res.status(201).json({ 
    success: true, 
    message: 'Inquiry submitted successfully',
    data: newInquiry 
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase Client
// These should be set in Vercel Environment Variables
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory mock database (Note: this will reset on function cold starts)
const inquiries = [];

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CeTech Academy API is running on Vercel' });
});

// FedaPay Webhook Placeholder
app.post('/api/fedapay/webhook', async (req, res) => {
  console.log('Webhook received', req.body);
  res.status(200).send('Webhook received');
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, program } = req.body;

  if (!name || !email || !program) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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

module.exports = app;

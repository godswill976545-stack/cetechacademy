const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory mock database
const inquiries = [];

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CeTech Academy API is running' });
});

// FedaPay Webhook Placeholder
app.post('/api/fedapay/webhook', async (req, res) => {
  console.log('Webhook received', req.body);
  // TODO: Add signature verification and database update logic later
  res.status(200).send('Webhook received');
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, program } = req.body;

  // Basic validation
  if (!name || !email || !program) {
    return res.status(400).json({ error: 'Missing required fields', message: 'Please provide name, email, and program.' });
  }

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
    data: newInquiry // Optional: depending if we want to echo back
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

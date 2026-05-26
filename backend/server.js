require('dotenv').config();
const express = require('express');
const { helmet, xss, cors, cookieParser, apiLimiter, strictLimiter, csrfProtection, errorHandler } = require('./middleware/security');
const { validateContact } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({ status: 'ok', message: 'CeTech Academy API is running' });
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

// Centralized Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from 'express';
import { helmet, xss, cors, cookieParser, strictLimiter, csrfProtection, errorHandler } from '../../api/middleware/security.js';
import { validateContact } from '../../api/middleware/validation.js';

const app = express();

app.use(helmet);
app.use(xss);
app.use(cors);
app.use(cookieParser);
app.use(express.json());

app.post('*', strictLimiter, csrfProtection, validateContact, (req, res) => {
  const { name, email, program } = req.body;

  const newInquiry = {
    id: Date.now().toString(),
    name,
    email,
    program,
    date: new Date().toISOString(),
  };

  return res.status(201).json({
    success: true,
    message: "Inquiry submitted successfully",
    data: newInquiry,
  });
});

app.use(errorHandler);

export default app;


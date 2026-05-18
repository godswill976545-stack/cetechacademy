const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5176',
        'https://cetech-academy.vercel.app', // Update with real production domain
        /\.vercel\.app$/ // Allow Vercel preview deployments
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Rate limiter for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for sensitive routes (contact, webhooks)
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded for this action. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CSRF Protection Middleware (Double Submit Cookie Pattern)
const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // Set CSRF token on GET requests if not already present
        if (!req.cookies['XSRF-TOKEN']) {
            const token = require('crypto').randomBytes(32).toString('hex');
            res.cookie('XSRF-TOKEN', token, {
                httpOnly: false, // Accessible by JS for the header
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
        return next();
    }

    const csrfHeader = req.headers['x-xsrf-token'];
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or missing CSRF token'
        });
    }

    next();
};

// Centralized error handling
const errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(err.stack);
    }

    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: status === 500 ? 'Internal Server Error' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    helmet: helmet(),
    xss: xss(),
    cors: cors(corsOptions),
    cookieParser: cookieParser(),
    apiLimiter,
    strictLimiter,
    csrfProtection,
    errorHandler
};

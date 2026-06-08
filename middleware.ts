import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
  '/cookies',
  '/api/paystack-webhook',
  '/api/contact',
  '/api/clerk-webhook',
  '/api/debug-clerk',
]);

// Rate limiting
const ipCache = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100;
const WINDOW = 60 * 1000;
const EVICTION_INTERVAL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 10000;
let lastEviction = Date.now();

function evictStaleEntries() {
  const now = Date.now();
  if (now - lastEviction < EVICTION_INTERVAL) return;
  lastEviction = now;
  for (const [ip, data] of ipCache.entries()) {
    if (now - data.lastReset > WINDOW * 2) {
      ipCache.delete(ip);
    }
  }
  if (ipCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(ipCache.entries());
    entries.sort((a, b) => a[1].lastReset - b[1].lastReset);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([ip]) => ipCache.delete(ip));
  }
}

function rateLimit(request: NextRequest) {
  evictStaleEntries();
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const userData = ipCache.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  ipCache.set(ip, userData);

  if (userData.count > LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    );
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  // Apply rate limiting to API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResponse = rateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};

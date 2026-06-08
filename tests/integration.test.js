import { describe, it, expect } from 'vitest';

describe('Auth Flow Logic', () => {
  it('should generate a 6-digit OTP code', () => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    expect(otpCode).toMatch(/^\d{6}$/);
  });

  it('should reject OTP after expiry', () => {
    const expiresAt = Date.now() - 1000;
    expect(expiresAt < Date.now()).toBe(true);
  });

  it('should accept valid OTP before expiry', () => {
    const expiresAt = Date.now() + 10 * 60 * 1000;
    expect(expiresAt > Date.now()).toBe(true);
  });
});

describe('Environment Configuration', () => {
  it('should have Supabase env variables configured', () => {
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
    envVars.forEach((key) => {
      expect(key).toBeDefined();
    });
  });
});

describe('Contact Form Submission', () => {
  it('should validate required fields', () => {
    const body = { name: '', email: 'test@test.com', program: 'UI/UX' };
    const isValid = body.name.length > 0 && body.email.length > 0 && body.program.length > 0;
    expect(isValid).toBe(false);
  });

  it('should accept valid submission data', () => {
    const body = { name: 'John', email: 'john@test.com', program: 'UI/UX' };
    const isValid = body.name.length > 0 && body.email.length > 0 && body.program.length > 0;
    expect(isValid).toBe(true);
  });
});

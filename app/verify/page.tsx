'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useSignIn } from '@clerk/nextjs';
import Aurora from '@/components/Aurora';

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { signIn } = useSignIn();

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const pendingEmail = localStorage.getItem('pending_user_email');
    if (!pendingEmail) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newCode = [...code];
    pasteData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    const email = localStorage.getItem('pending_user_email');
    if (!email) {
      setFeedback({ message: 'No pending email found. Please sign up again.', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback({ message: '', type: '' });
    try {
      // Step 1: Verify OTP against our database
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Step 2: Redirect to login — user enters password to sign in
      localStorage.removeItem('pending_user_email');
      router.push('/login');
    } catch (error: any) {
      const msg = error?.message || 'Verification failed';
      setFeedback({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [code, router, signIn]);

  const handleResend = async () => {
    const email = localStorage.getItem('pending_user_email');
    if (!email) return;

    setResending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setFeedback({ message: 'A new verification code has been sent to your email.', type: 'success' });
    } catch (error: any) {
      setFeedback({ message: error.message || 'Failed to resend code.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('pending_user_email');
  };

  useEffect(() => {
    if (code.every(digit => digit !== '') && code.join('').length === 6) {
      handleVerify();
    }
  }, [code, handleVerify]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-950 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <Aurora
          colorStops={['#020617', '#007bff', '#00d2ff']}
          amplitude={1.0}
          blend={0.5}
        />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="mb-12 animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6 text-brand-400 border border-brand-500/20 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-heading">Verify Your Account</h1>
          <p className="text-slate-400">We've sent a 6-digit verification code to your email. Please enter it below to gain access.</p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border-brand-500/20 shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center gap-3 mb-10" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => { inputRefs.current[i] = el; }}
                className="otp-input w-12 h-16 text-center text-2xl font-bold rounded-2xl bg-brand-950/60 border border-brand-500/20 text-white focus:border-accent-400 focus:shadow-[0_0_15px_rgba(0,210,255,0.3)] outline-none transition-all"
              />
            ))}
          </div>

          {feedback.message && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${feedback.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {feedback.message}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || code.some(d => !d)}
            className="duo-btn duo-btn-lg duo-btn-primary w-full mb-6"
          >
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>

          <p className="text-slate-500 text-sm mb-6">
            Didn't receive the code?
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4 transition-colors ml-1"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>

          <div className="pt-6 border-t border-brand-500/10">
            <Link
              href="/"
              onClick={handleCancel}
              className="text-slate-500 hover:text-white text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Homepage / Start Over
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Aurora from '@/components/Aurora';

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const verifyOTP = useMutation(api.auth.mutations.verifyOTP);
  const resendOTP = useMutation(api.auth.mutations.resendOTP);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Check if user session exists
    const userId = localStorage.getItem('pending_user_id');
    if (!userId) {
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
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newCode = [...code];
    pasteData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    const userId = localStorage.getItem('pending_user_id');
    if (!userId) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP({ userId: userId as any, code: fullCode });
      if (result.success) {
        localStorage.setItem('user_verified', 'true');
        router.push('/portal');
      } else {
        alert(result.error || 'Invalid code. Please try again.');
      }
    } catch (error: any) {
      alert(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const userId = localStorage.getItem('pending_user_id');
    if (!userId) return;

    setResending(true);
    try {
      const result = await resendOTP({ userId: userId as any });
      if (result.success) {
        alert('A new verification code has been sent to your email.');
      } else {
        alert('Failed to resend code.');
      }
    } catch (error) {
      alert('Network error.');
    } finally {
      setResending(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('cetech_user');
    localStorage.removeItem('user_verified');
    localStorage.removeItem('pending_user_id');
    localStorage.removeItem('pending_user_email');
    localStorage.removeItem('otp_sent');
  };

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.every(digit => digit !== '') && code.join('').length === 6) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-950 relative overflow-hidden">
      {/* Aurora background */}
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
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => { inputRefs.current[i] = el; }}
                className="otp-input w-12 h-16 text-center text-2xl font-bold rounded-2xl bg-brand-950/60 border border-brand-500/20 text-white focus:border-accent-400 focus:shadow-[0_0_15px_rgba(0,210,255,0.3)] outline-none transition-all"
              />
            ))}
          </div>

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

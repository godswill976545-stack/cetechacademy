'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSignUp, useSignIn } from '@clerk/nextjs';
import Aurora from '@/components/Aurora';

export default function AuthPage({ type }: { type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const router = useRouter();
  const { signUp, errors: signUpErrors } = useSignUp();
  const { signIn, errors: signInErrors } = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      if (type === 'signup') {
        if (!signUp) throw new Error('Auth not ready');

        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Step 1: Create user via Clerk Backend API
        const signupRes = await fetch('/api/debug-clerk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
        const signupData = await signupRes.json();

        if (!signupRes.ok) {
          throw new Error(signupData.error || 'Failed to create account');
        }

        // Step 2: Send OTP via Resend
        const otpRes = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const otpData = await otpRes.json();

        if (!otpRes.ok) {
          throw new Error(otpData.error || 'Failed to send verification code');
        }

        // Step 3: Redirect to verify page
        localStorage.setItem('pending_user_email', email);
        router.push('/verify');
        return;
      } else {
        if (!signIn) throw new Error('Auth not ready');

        const { error } = await signIn.create({
          identifier: email,
          password,
        });

        if (error) throw error;

        // Check if sign-in is complete
        if (signIn.status === 'complete') {
          router.push('/portal');
          return;
        }

        // If verification needed, send OTP via Resend
        if (signIn.status === 'needs_first_factor') {
          const otpRes = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const otpData = await otpRes.json();

          if (!otpRes.ok) {
            throw new Error(otpData.error || 'Failed to send verification code');
          }

          localStorage.setItem('pending_user_email', email);
          router.push('/verify');
          return;
        }
      }
    } catch (error: any) {
      let errorMessage = 'Authentication failed';
      if (error?.errors?.[0]?.message) {
        errorMessage = error.errors[0].message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      console.error('Auth error:', error);
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <Aurora
          colorStops={['#020617', '#007bff', '#00d2ff']}
          amplitude={1.0}
          blend={0.5}
        />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group mb-6">
            <Image src="/assets/logo.png" alt="CeTech Academy" width={100} height={100} className="h-20 w-auto transition-transform duration-500 group-hover:scale-110" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{type === 'signup' ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-slate-400">{type === 'signup' ? 'Join the elite forge of digital architects' : 'Continue your journey to mastery'}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border-brand-500/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field w-full px-5 py-4 rounded-2xl"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full px-5 py-4 rounded-2xl"
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full px-5 py-4 rounded-2xl"
                placeholder="••••••••"
                minLength={8}
                required
              />
              {type === 'signup' && (
                <p className="text-slate-600 text-xs mt-2 ml-1">Min 8 characters, mix of upper, lower & numbers</p>
              )}
            </div>

            <div id="clerk-captcha" className="clerk-captcha" />

            <button
              type="submit"
              disabled={loading}
              className={`duo-btn duo-btn-primary w-full py-4 text-base ${feedback.type === 'error' ? 'error' : ''}`}
            >
              {loading ? 'Processing...' : (type === 'signup' ? 'Create Account' : 'Sign In')}
            </button>

            {feedback.message && (
              <div className={`auth-feedback visible ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              {type === 'signup' ? 'Already have an account?' : 'Don\'t have an account?'}
              <Link href={type === 'signup' ? '/login' : '/signup'} className="text-brand-400 font-bold ml-2 hover:text-brand-300 transition-colors">
                {type === 'signup' ? 'Sign In' : 'Get Started'}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

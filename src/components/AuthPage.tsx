'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAction } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useRouter } from 'next/navigation';
import Aurora from '@/components/Aurora';

export default function AuthPage({ type }: { type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const loginAction = useAction(api.auth.actions.loginUser);
  const registerAction = useAction(api.auth.actions.registerUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      let result;
      if (type === 'signup') {
        result = await registerAction({ email, password, fullName });
      } else {
        result = await loginAction({ email, password });
      }

      if (!result.success) throw new Error(result.error || 'Authentication failed');

      const currentUser = {
        _id: result.userId,
        email: result.email,
      };
      localStorage.setItem('cetech_user', JSON.stringify(currentUser));
      localStorage.setItem('pending_user_id', result.userId);
      localStorage.setItem('pending_user_email', result.email);
      localStorage.setItem('otp_sent', 'true');

      router.push('/verify');
    } catch (error: any) {
      setFeedback({ message: error.message || error.toString(), type: 'error' });
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
                required
              />
            </div>

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

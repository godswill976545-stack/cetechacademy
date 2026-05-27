'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Aurora from '@/components/Aurora';
import Script from 'next/script';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaymentPage() {
  const [firstName, setFirstname] = useState('');
  const [lastName, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('digital-marketing');
  const [price, setPrice] = useState(130000);

  const courses = [
    { id: 'digital-marketing', label: 'Digital Marketing', price: 130000 },
    { id: 'ui-ux-design', label: 'UI/UX Design', price: 150000 },
    { id: 'software-engineering', label: 'Software Engineering', price: 200000 },
    { id: 'ai-automation', label: 'AI Automation', price: 180000 },
    { id: 'data-analyst', label: 'Data Analyst', price: 200000 },
    { id: 'graphic-design', label: 'Graphic Design', price: 120000 },
    { id: 'pro-launch', label: 'CeTech Pro Launch', price: 100000 }
  ];

  useEffect(() => {
    const selected = courses.find(c => c.id === course);
    if (selected) setPrice(selected.price);
  }, [course]);

  const handlePaystackPayment = () => {
    if (!firstName || !lastName || !email) {
      alert('Please fill in all fields');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx', // Replace with actual key
      email: email,
      amount: price * 100,
      currency: 'NGN',
      callback: function(response: any) {
        alert('Payment successful! Transaction reference: ' + response.reference);
        window.location.href = '/portal';
      },
      onClose: function() {
        alert('Transaction cancelled');
      }
    });
    handler.openIframe();
  };

  return (
    <div className="antialiased bg-brand-950 text-slate-200 selection:bg-accent-400/30 selection:text-white min-h-screen">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <Aurora colorStops={['#020617', '#007bff', '#00d2ff']} amplitude={1.0} blend={0.5} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/assets/logo.png" alt="CeTech Academy" width={40} height={40} className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent-400 transition-colors">CeTech Academy</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-accent-400 transition-colors">Back to Home</Link>
        </nav>
      </header>

      <main className="relative z-10 flex items-center justify-center p-6 pt-32 pb-20">
        <div className="glass-panel rounded-3xl p-8 w-full max-w-lg border-slate-800 shadow-2xl animate-fade-in">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Complete Enrollment</h2>
            <p className="text-slate-400 text-sm">Please enter your details to proceed with the payment.</p>
          </header>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="input-group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="John"
                  className="input-field w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 transition-all outline-none"
                />
              </div>
              <div className="input-group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Doe"
                  className="input-field w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input-field w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 transition-all outline-none"
              />
            </div>

            <div className="input-group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Your Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 transition-all outline-none appearance-none cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.label} - ₦{c.price.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-slate-800 bg-slate-900/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-500">Course Tuition</span>
                <span className="text-sm font-bold text-white">₦{price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <span className="text-base font-bold text-white">Total Due</span>
                <span className="text-xl font-bold text-brand-400">₦{price.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePaystackPayment}
              className="duo-btn duo-btn-primary w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest"
            >
              Pay with Paystack
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-500">
                <span className="px-4 bg-brand-950">Or pay with crypto</span>
              </div>
            </div>

            <div className="flex justify-center">
              <a href="https://nowpayments.io/payment/?iid=6256773573&source=button" target="_blank" rel="noreferrer noopener" className="transition-transform hover:scale-105">
                <Image src="https://nowpayments.io/images/embeds/payment-button-white.svg" alt="Cryptocurrency payment button" width={300} height={60} style={{ width: '100%', maxWidth: '300px', borderRadius: '12px' }} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

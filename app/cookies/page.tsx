'use client';

import LegalLayout from '@/components/LegalLayout';

export default function CookiesPage() {
  return (
    <LegalLayout>
      <h1 className="text-4xl font-bold mb-8 text-white">Cookie Policy</h1>
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <p className="text-sm italic">Last updated: May 2026</p>

        <h2 className="text-2xl font-bold text-white mt-8">1. What Are Cookies?</h2>
        <p>Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work or work more efficiently.</p>

        <h2 className="text-2xl font-bold text-white mt-8">2. How We Use Cookies</h2>
        <p>We use cookies to understand how you use our website, to remember your preferences, and to improve your overall experience.</p>

        <h2 className="text-2xl font-bold text-white mt-8">3. Managing Cookies</h2>
        <p>Most web browsers allow you to control cookies through their settings. However, if you disable cookies, some features of our website may not function properly.</p>
      </div>
    </LegalLayout>
  );
}

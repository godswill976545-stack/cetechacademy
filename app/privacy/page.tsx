'use client';

import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <p className="text-sm italic">Last updated: May 2026</p>

        <h2 className="text-2xl font-bold text-white mt-8">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you register for a course, sign up for our newsletter, or contact us. This may include your name, email address, phone number, and payment information.</p>

        <h2 className="text-2xl font-bold text-white mt-8">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, process your transactions, and communicate with you about your account and our offerings.</p>

        <h2 className="text-2xl font-bold text-white mt-8">3. Data Security</h2>
        <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

        <h2 className="text-2xl font-bold text-white mt-8">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@cetechacademy.com.</p>
      </div>
    </LegalLayout>
  );
}

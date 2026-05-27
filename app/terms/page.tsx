'use client';

import LegalLayout from '@/components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout>
      <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
      <div className="space-y-6 text-slate-400 leading-relaxed">
        <p className="text-sm italic">Last updated: May 2026</p>

        <h2 className="text-2xl font-bold text-white mt-8">1. Acceptance of Terms</h2>
        <p>By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

        <h2 className="text-2xl font-bold text-white mt-8">2. Use of Services</h2>
        <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account information.</p>

        <h2 className="text-2xl font-bold text-white mt-8">3. Intellectual Property</h2>
        <p>All content and materials available on our services are the property of CeTech Academy and are protected by applicable intellectual property laws.</p>

        <h2 className="text-2xl font-bold text-white mt-8">4. Limitation of Liability</h2>
        <p>CeTech Academy shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our services.</p>
      </div>
    </LegalLayout>
  );
}

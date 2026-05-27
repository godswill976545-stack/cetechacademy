'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Aurora from '@/components/Aurora';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="antialiased bg-brand-950 text-slate-200 selection:bg-accent-400/30 selection:text-white min-h-screen">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <Aurora
          colorStops={['#020617', '#007bff', '#00d2ff']}
          amplitude={1.0}
          blend={0.5}
        />
        <div className="absolute inset-0 bg-brand-950/40"></div>
      </div>

      {/* Ambient Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-orb bg-brand-400/20 w-[600px] h-[600px] -top-48 -left-24 animate-pulse-glow"></div>
        <div className="ambient-orb bg-accent-200/10 w-[800px] h-[800px] -bottom-48 -right-24"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Legal navigation">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/assets/logo.png" alt="CeTech Academy" width={40} height={40} className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent-400 transition-colors">CeTech Academy</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-accent-400 transition-colors">Back to Home</Link>
        </nav>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <article className="glass-panel rounded-3xl p-8 md:p-12 border-slate-800">
            {children}
          </article>
        </div>
      </main>

      <footer className="relative z-10 py-12 border-t border-slate-800 bg-slate-900/30 text-center">
        <p className="text-slate-500 text-sm">&copy; 2026 CeTech Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}

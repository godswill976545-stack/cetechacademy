'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const storedUser = localStorage.getItem('cetech_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('cetech_user');
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cetech_user');
    localStorage.removeItem('user_verified');
    localStorage.removeItem('pending_user_id');
    localStorage.removeItem('pending_user_email');
    localStorage.removeItem('otp_sent');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-950 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/assets/logo.png"
              alt="CeTech Academy"
              width={80}
              height={80}
              className="h-14 md:h-20 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent-400 transition-colors">CeTech Academy</span>
        </Link>

        <div className="flex max-md:hidden items-center gap-8">
          <Link href="#about" className="text-sm font-medium text-slate-300 hover:text-accent-400 transition-colors">About</Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-accent-400 transition-colors">Pricing</Link>
          <Link href="#mentors" className="text-sm font-medium text-slate-300 hover:text-accent-400 transition-colors">Mentors</Link>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/login" className="duo-btn duo-btn-sm duo-btn-secondary">SIGN IN</Link>
                <Link href="/signup" className="duo-btn duo-btn-sm duo-btn-secondary">GET STARTED</Link>
              </>
            ) : (
              <>
                <Link href="/portal" className="duo-btn duo-btn-sm duo-btn-secondary">PORTAL</Link>
                <button onClick={handleLogout} className="duo-btn duo-btn-sm duo-btn-secondary">SIGN OUT</button>
              </>
            )}
          </div>
        </div>

        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <aside
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        <nav className={`absolute inset-x-0 top-[72px] transition-transform duration-500 ${
          isOpen ? 'translate-y-0 scale-100' : '-translate-y-5 scale-[0.95]'
        }`}>
          <div className="mx-4 rounded-3xl glass-panel border border-white/20 shadow-2xl overflow-hidden relative bg-brand-950/95">
            <div className="p-4 flex flex-col">
              <Link href="#about" onClick={() => setIsOpen(false)} className="px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 flex items-center justify-between group border-b border-white/5">
                About
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              </Link>
              <Link href="#pricing" onClick={() => setIsOpen(false)} className="px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 flex items-center justify-between group border-b border-white/5">
                Pricing
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              </Link>
              <Link href="#mentors" onClick={() => setIsOpen(false)} className="px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 flex items-center justify-between group border-b border-white/5">
                Mentors
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              </Link>
              <div className="mt-4 p-2 flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="duo-btn duo-btn-secondary">Sign In</Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)} className="duo-btn duo-btn-secondary">Get started</Link>
                  </>
                ) : (
                  <>
                    <Link href="/portal" onClick={() => setIsOpen(false)} className="duo-btn duo-btn-secondary">Portal</Link>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="duo-btn duo-btn-secondary">Sign Out</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </header>
  );
}

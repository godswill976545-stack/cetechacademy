'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Cpu, Award, TrendingUp, Menu, X, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Aurora from '@/components/Aurora';
import SectionReveal from '@/components/SectionReveal';

export default function AboutPage() {
  return (
    <div className="antialiased bg-brand-950 text-slate-200 selection:bg-accent-400/30 selection:text-white">
      <Navbar />

      <main className="relative z-10">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
          <Aurora
            colorStops={['#020617', '#007bff', '#00d2ff']}
            amplitude={1.0}
            blend={0.5}
          />
        </div>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="ambient-orb bg-brand-400/40 w-[800px] h-[800px] -top-96 -left-48 animate-pulse-glow"></div>
          <div className="ambient-orb bg-slate-300/40 w-[600px] h-[600px] top-1/2 right-0 translate-x-1/3 -translate-y-1/2"></div>
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
                Our Story
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white">
                Forging the Next Generation of <span className="text-gradient">Digital Architects.</span>
              </h1>
              <p className="text-slate-400 text-lg lg:text-xl font-light mb-10 max-w-lg leading-relaxed">
                We aren't just a learning platform; we are a forge for digital craftsmanship. We bridge the gap between academic theory and industry dominance.
              </p>
            </div>
            <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-panel rounded-[3rem] p-12 border-brand-500/20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Our Mission</h3>
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    To empower ambitious individuals across Africa with tactile, high-impact digital skills, enabling them to transition from beginners to highly sought-after professionals capable of generating real economic value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section className="py-32 px-6 relative z-10 bg-brand-950">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="text-center mb-20">
              <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">Our DNA</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Mastery Over Theory</h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">We believe that true skill is not learned in a textbook, but forged through repetition, failure, and real-world application.</p>
            </SectionReveal>

            <div className="grid md:grid-cols-3 gap-8">
              <SectionReveal stagger={1}>
                <article className="glass-panel interactive-card rounded-3xl group p-8 border-t-2 border-t-brand-500/50 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-8 text-brand-500 border border-brand-500/20">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">Tactile Learning</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Our approach focuses on "doing" from day one. We replace static lectures with project-driven modules that simulate real industry environments.</p>
                </article>
              </SectionReveal>

              <SectionReveal stagger={2}>
                <article className="glass-panel interactive-card rounded-3xl group p-8 border-t-2 border-t-accent-400/50 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-accent-400/10 flex items-center justify-center mb-8 text-accent-400 border border-accent-400/20">
                    <Award className="w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">Elite Mentorship</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Learn directly from practitioners who are actively shaping the digital landscape. No ivory tower theory—only battle-tested strategies.</p>
                </article>
              </SectionReveal>

              <SectionReveal stagger={3}>
                <article className="glass-panel interactive-card rounded-3xl group p-8 border-t-2 border-t-purple-500/50 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 text-purple-400 border border-purple-500/20">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">Income Engineering</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">We don't just teach you how to code or design; we teach you how to position yourself to earn, acquire clients, and scale your professional value.</p>
                </article>
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="py-32 px-6 relative z-10 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="text-center mb-20">
              <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">The Faculty</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">The Minds Behind the Mastery</h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">A collective of digital architects dedicated to forging the next wave of African tech talent.</p>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { name: 'Chukwudi Collins', role: 'Digital Strategist', img: '/assets/mentor_chukwudi.jpeg', color: 'brand' },
                { name: 'Nwankwor Chukwudalu E.', role: 'Creative Director', img: '/assets/mentor_nwankwor.PNG', color: 'accent' },
                { name: 'Obinna John', role: 'UI/UX Specialist', img: '/assets/mentor_obinna.jpeg', color: 'brand' }
              ].map((m, i) => (
                <SectionReveal key={i} stagger={i + 1} className="text-center group">
                  <div className={`relative rounded-full overflow-hidden aspect-square mb-6 w-48 h-48 mx-auto ring-4 ring-${m.color}-500/20 group-hover:ring-${m.color}-500/50 transition-all duration-500`}>
                    <Image src={m.img} alt={m.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{m.name}</h4>
                  <p className={`text-${m.color === 'brand' ? 'brand-500' : 'accent-400'} text-sm font-bold uppercase tracking-widest`}>{m.role}</p>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-6 relative z-10 text-center">
          <SectionReveal className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white">Ready to Forge Your Future?</h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">Stop consuming theory. Start building a career. Join a cohort of ambitious architects and master the digital craft.</p>
            <Link href="/login" className="duo-btn duo-btn-lg duo-btn-primary">Secure Your Spot</Link>
          </SectionReveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-slate-800 relative z-10 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image src="/assets/logo.png" alt="CeTech Academy" width={64} height={64} className="h-12 md:h-18 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-brand-900 transition-colors">CeTech Academy</span>
            </Link>
            <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">Empowering the next generation of African digital architects. We forge careers through rigorous, tactile mastery.</p>
          </div>
          <nav aria-label="Quick links">
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/about" className="text-white font-bold transition-colors text-sm">About Us</Link></li>
              <li><Link href="/#pricing" className="text-slate-500 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/#mentors" className="text-slate-500 hover:text-white transition-colors text-sm">Mentors</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}

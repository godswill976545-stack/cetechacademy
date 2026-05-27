'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  CheckCircle,
  Target,
  Award,
  Calendar,
  Monitor,
  Users,
  Sparkles,
  Layout,
  Terminal,
  Palette,
  TrendingUp,
  Database,
  Bot,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Rocket,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Aurora from '@/components/Aurora';
import Antigravity from '@/components/Antigravity';
import VariableProximity from '@/components/VariableProximity';
import BorderGlow from '@/components/BorderGlow';
import SectionReveal from '@/components/SectionReveal';

export default function Home() {
  const [showCourses, setShowCourses] = useState(false);
  const headlineRef = React.useRef(null);

  return (
    <div className="antialiased bg-brand-950 text-slate-200 selection:bg-accent-400/30 selection:text-white">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <Aurora
          colorStops={['#020617', '#007bff', '#00d2ff']}
          amplitude={1.0}
          blend={0.5}
        />
      </div>

      {/* Ambient Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-orb bg-brand-400/40 w-[800px] h-[800px] -top-96 -left-48 animate-pulse-glow"></div>
        <div className="ambient-orb bg-slate-300/40 w-[600px] h-[600px] top-1/2 right-0 translate-x-1/3 -translate-y-1/2"></div>
        <div className="ambient-orb bg-accent-200/50 w-[1000px] h-[1000px] -bottom-[500px] -left-1/4"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5IDYwaDFWMGgtMXY2MHptLTEgMHYxaDYwdi0xaC02MHoiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC4wNSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-50"></div>
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="hero-section min-h-screen relative flex items-center pt-20 overflow-hidden bg-transparent">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="animate-slide-up z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-accent-400/30 text-accent-400 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                </span>
                Enrollment Open for Q4 2026
              </div>

              <div ref={headlineRef}>
                <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-gradient">
                  <VariableProximity
                    label="Master the Digital Craft. Build the Future."
                    fromFontVariationSettings="'wght' 400"
                    toFontVariationSettings="'wght' 900"
                    containerRef={headlineRef}
                    radius={100}
                    falloff="gaussian"
                  />
                </h1>
              </div>

              <p className="text-slate-400 text-lg lg:text-xl font-light mb-10 max-w-lg leading-relaxed">
                Gain practical digital skills, build real-world experience, and position yourself to earn and stand out in today’s digital world.
              </p>

              <div className="flex flex-wrap items-center gap-8">
                <Link href="#pricing" className="duo-btn duo-btn-lg duo-btn-primary">
                  Secure Your Spot
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Link>
              </div>
            </div>

            <div className="relative animate-slide-up h-[500px] lg:h-[600px] flex items-center justify-center" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent rounded-[3rem] rotate-3 scale-105 blur-lg"></div>
              <div className="glass-panel rounded-[2.5rem] p-2 relative z-10 w-full h-full min-h-[500px]">
                <div className="rounded-[2rem] overflow-hidden relative bg-slate-900/30 border border-slate-800 w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0">
                    <Antigravity
                      count={300}
                      magnetRadius={6}
                      ringRadius={7}
                      color="#3b82f6"
                      autoAnimate={true}
                    />
                  </div>

                  <div className="absolute top-8 -left-8 glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 border-accent-400/20 shadow-lg animate-float">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Weekly Challenge</div>
                      <div className="font-bold text-white">Frontend Architecture</div>
                    </div>
                  </div>

                  <div className="absolute bottom-12 -right-6 glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 border-brand-500/20 shadow-lg animate-float" style={{ animationDelay: '-4s' }}>
                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Task Completed</div>
                      <div className="font-bold text-white">UI/UX Wireframing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-32 px-6 relative z-10 bg-brand-950">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <SectionReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
                Our Story
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                Forging the Next Generation of <span className="text-gradient">Digital Architects.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                CeTech Academy isn't just a learning platform; we are a forge for digital craftsmanship. We believe that true mastery comes from doing, not just watching. We bridge the gap between academic theory and industry dominance by focusing on tactile, project-driven learning.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Our Mission</h4>
                    <p className="text-slate-500 text-sm">Empowering African talent to create real economic value.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center text-accent-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Elite Quality</h4>
                    <p className="text-slate-500 text-sm">Industry-standard tooling and mentorship.</p>
                  </div>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal stagger={1}>
              <div className="glass-panel rounded-[3rem] p-12 border-brand-500/20 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="text-brand-400 font-bold uppercase tracking-widest text-xs mb-4">The Philosophy</div>
                  <h3 className="text-3xl font-bold text-white mb-6">Mastery Over Theory</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    We reject the "tutorial hell" loop. At CeTech, you learn by solving real problems, failing fast, and iterating until you reach a professional standard. We don't just teach you the tools; we teach you the architecture of thinking.
                  </p>
                  <div className="mt-8 pt-8 border-t border-slate-800 flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white">4+</div>
                      <div className="text-slate-500 text-xs">Months of Intensive Study</div>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div>
                      <div className="text-2xl font-bold text-white">100%</div>
                      <div className="text-slate-500 text-xs">Project-Based Learning</div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* PROGRAM LEVELS SECTION */}
        <section id="program" className="py-32 px-6 relative z-10 bg-brand-950">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="text-center mb-20">
              <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">The Journey</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Our Digital Career Program</h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">A structured 4-month program designed to take you from beginner to a confident, job-ready digital professional with skills you can start earning from.</p>
            </SectionReveal>

            <SectionReveal stagger={1} className="mb-16 max-w-3xl mx-auto">
              <div className="glass-panel rounded-[2rem] p-8 md:p-10 border-brand-500/15 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">4 Months</div>
                        <div className="text-xs text-slate-500">Immersive learning journey</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center text-accent-400 shrink-0">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Hybrid Format</div>
                        <div className="text-xs text-slate-500">Live sessions + recorded content</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">30 Students Max</div>
                        <div className="text-xs text-slate-500">Personalized mentorship</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center text-accent-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Flexible Tuition</div>
                        <div className="text-xs text-slate-500">Plans that fit your budget</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>

            <div className="grid lg:grid-cols-3 gap-12 relative">
              <div className="hidden lg:block absolute top-32 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-100 to-transparent z-0"></div>
              <div className="lg:hidden absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-brand-100 to-transparent z-0 -translate-x-1/2"></div>

              {/* Phases */}
              {[
                { phase: '01', title: 'Beginner Level (Foundation)', desc: 'Build a strong understanding of the digital space and develop essential foundational skills.', btn: 'Start Phase 01' },
                { phase: '02', title: 'Intermediate Level (Skill Building)', desc: 'Move from understanding to doing. Develop practical, hands-on skills and work on guided tasks.', btn: 'Join Phase 02' },
                { phase: '03', title: 'Advanced Level (Real-World Application)', desc: 'Bring everything together through real-world projects, portfolio development, and positioning.', btn: 'Master Phase 03' }
              ].map((p, i) => (
                <SectionReveal key={i} stagger={i + 1}>
                  <article className="glass-panel p-8 rounded-[2.5rem] border-brand-500/20 transition-all group relative z-10 shadow-md h-full flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-950 border-4 border-brand-500 flex items-center justify-center text-brand-500 z-20 shadow-[0_0_15px_rgba(0,123,255,0.5)]">
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit border border-brand-500/20">Phase {p.phase}</div>
                    <h4 className="text-2xl font-bold text-white mb-4">{p.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">{p.desc}</p>
                    <Link href="/login" className="duo-btn duo-btn-sm duo-btn-primary w-full">{p.btn}</Link>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CURRICULUM SECTION */}
        <section id="curriculum" className="py-32 px-6 relative z-10 bg-brand-950">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="text-center mb-20">
              <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">The Ecosystem</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Disciplines of Mastery</h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Curated paths designed to transform ambitious beginners into highly sought-after digital architects.</p>
            </SectionReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Layout, title: 'UI/UX Design', desc: 'Map immersive digital interfaces. Master Figma, user research, and interactive prototyping.', color: 'brand' },
                { icon: Terminal, title: 'Web Engineering', desc: 'Build the architecture of the web. From semantic HTML/CSS to advanced React.', color: 'brand' },
                { icon: Palette, title: 'Brand Identity', desc: 'Visual storytelling redefined. Learn color theory, typography, and cohesive identities.', color: 'brand' },
                { icon: TrendingUp, title: 'Growth Marketing', desc: 'Master data-driven strategies, SEO, and campaign engineering to dominate landscapes.', color: 'brand' },
                { icon: Database, title: 'Data Science', desc: 'Extract deep, actionable insights from complex ecosystems using Python and SQL.', color: 'brand' },
                { icon: Bot, title: 'AI & Automation', desc: 'Leverage AI and workflow automation to scale productivity and build intelligent tools.', color: 'brand' }
              ].map((c, i) => (
                <SectionReveal key={i} stagger={i % 3}>
                  <article className={`glass-panel interactive-card rounded-3xl group cursor-pointer overflow-hidden shadow-sm relative border-t-2 border-brand-500/30 h-full`}>
                    <div className="p-8">
                      <div className={`w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-8 text-brand-500 border border-brand-500/20 shadow-inner`}>
                        <c.icon className="w-7 h-7" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">{c.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">{c.desc}</p>
                      <span className="inline-flex items-center text-brand-400 text-sm font-bold group-hover:translate-x-2 transition-transform duration-300">
                        Explore Curriculum <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section className="py-32 px-6 relative z-10 bg-brand-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <SectionReveal>
                <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">Why CETECH?</h2>
                <h3 className="text-4xl lg:text-5xl font-bold mb-8 text-white">Why Choose CETECH Academy?</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: Code2, text: 'Practical, hands-on training building real projects', color: 'brand' },
                    { icon: Monitor, text: 'Hybrid format: live sessions + on-demand content', color: 'accent' },
                    { icon: Briefcase, text: 'Real-world projects for your portfolio', color: 'brand' },
                    { icon: Users, text: 'Personal mentorship from industry practitioners', color: 'accent' },
                    { icon: GraduationCap, text: 'Small cohorts capped at 30 students', color: 'brand' },
                    { icon: TrendingUp, text: 'Career-focused: designed for income and growth', color: 'accent' }
                  ].map((f, i) => (
                    <div key={i} className={`glass-panel interactive-card p-5 rounded-2xl border-${f.color}-500/10 group cursor-pointer flex items-center gap-4 transition-all duration-300 hover:border-${f.color}-500/30`}>
                      <div className={`w-10 h-10 rounded-xl bg-${f.color}-500/10 flex items-center justify-center text-${f.color}-500 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <f.icon className="w-5 h-5" />
                      </div>
                      <p className="text-slate-300 text-sm font-medium leading-snug">{f.text}</p>
                    </div>
                  ))}
                </div>
              </SectionReveal>

              <SectionReveal stagger={2}>
                <div className="glass-panel p-10 rounded-[3rem] border-brand-500/20 bg-brand-900 text-white text-center relative overflow-hidden h-full flex flex-col justify-center">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-brand-950/10 flex items-center justify-center mx-auto mb-8">
                      <Sparkles className="w-10 h-10 text-brand-400" />
                    </div>
                    <h4 className="text-3xl font-bold mb-4">Start Your Journey</h4>
                    <p className="text-brand-100/70 mb-10 text-lg">No experience needed. Just your willingness to learn and grow.</p>
                    <Link href="/login" className="duo-btn duo-btn-accent">Secure Your Spot</Link>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-32 px-6 relative bg-brand-950 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="text-center mb-20">
              <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">Investment</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Choose Your Path to Mastery</h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Elite programs designed for those ready to dominate the digital landscape.</p>
            </SectionReveal>

            <div className="flex justify-center">
              <button
                onClick={() => setShowCourses(!showCourses)}
                className="duo-btn duo-btn-secondary"
              >
                {showCourses ? 'Hide Courses' : 'View Full Courses & Fees'}
                {showCourses ? <ChevronUp className="w-6 h-6 ml-3" /> : <ChevronDown className="w-6 h-6 ml-3" />}
              </button>
            </div>

            {showCourses && (
              <div className="mt-16 animate-slide-up grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Megaphone, title: 'Digital Marketing', price: '₦130,000', desc: 'Master SEO, content strategy, and social media ecosystems.' },
                  { icon: Layout, title: 'UI/UX Design', price: '₦150,000', desc: 'Advanced Figma mastery and human-centric design systems.' },
                  { icon: Code2, title: 'Software Engineering', price: '₦200k - 250k', desc: 'Fullstack development with React, Node.js, and modern APIs.', featured: true },
                  { icon: Bot, title: 'AI Automation', price: '₦180,000', desc: 'Leveraging LLMs and workflow automation for productivity.' },
                  { icon: Database, title: 'Data Analyst', price: '₦200,000', desc: 'Python, SQL, and data visualization for business intelligence.' },
                  { icon: Palette, title: 'Graphic Design', price: '₦120,000', desc: 'Visual communication, branding, and typography mastery.' }
                ].map((c, i) => (
                  <article key={i} className={`glass-panel p-8 rounded-3xl border-slate-800 transition-all group ${c.featured ? 'border-brand-500/20 bg-brand-50/30 ring-1 ring-brand-500/10' : 'hover:border-brand-500/30'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-brand-500/${c.featured ? '20' : '10'} flex items-center justify-center text-brand-600`}>
                        <c.icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tuition</div>
                        <div className="text-xl font-bold text-white">{c.price}</div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{c.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{c.desc}</p>
                    <Link href="/login" className="duo-btn duo-btn-sm duo-btn-primary group-hover:translate-x-1 transition-transform">
                      Enroll Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </article>
                ))}

                {/* Special Program */}
                <div className="md:col-span-2 lg:col-span-3 mt-8 glass-panel p-8 rounded-3xl border-brand-500/30 bg-brand-900 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Rocket className="w-32 h-32 -rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-400/20 text-brand-300 text-[10px] font-bold uppercase tracking-widest mb-4">Accelerator Program</div>
                      <h4 className="text-3xl font-bold mb-2">CeTech Pro Launch</h4>
                      <p className="text-brand-100/70 max-w-xl">Launch Your Tech Career. Get Clients. Start Earning. The definitive bridge from learning to earning.</p>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Tuition</div>
                      <div className="text-4xl font-bold mb-6">₦100,000</div>
                      <Link href="/login" className="duo-btn duo-btn-accent">Join the Cohort</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MENTORS SECTION */}
        <section id="mentors" className="py-32 px-6 relative z-10 border-t border-slate-800 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <SectionReveal className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-3">The Faculty</h2>
                <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Meet the CeTech Team</h3>
                <p className="text-slate-400 text-lg">Our team is made up of passionate digital professionals dedicated to helping you gain practical skills, build confidence, and create real opportunities in the digital space.</p>
              </div>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start max-w-5xl">
              {[
                { name: 'Chukwudi Collins', role: 'Multi-skilled Digital Professional', desc: 'Full-stack expertise spanning design, development, and digital strategy.', img: '/assets/mentor_chukwudi.jpeg', color: 'brand' },
                { name: 'Nwankwor Chukwudalu E.', role: 'Visual Creative Professional', desc: 'Expert in visual storytelling, brand aesthetics, and creative direction.', img: '/assets/mentor_nwankwor.PNG', color: 'accent', offset: 'md:translate-y-6' },
                { name: 'Obinna John', role: 'Creative Designer', desc: 'Crafting compelling visual experiences with a keen eye for detail.', img: '/assets/mentor_obinna.jpeg', color: 'brand', offset: 'md:translate-y-12' }
              ].map((m, i) => (
                <SectionReveal key={i} stagger={i + 1} className={m.offset}>
                  <article className="group">
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] mb-6 bg-slate-100 shadow-xl">
                      <Image
                        src={m.img}
                        alt={m.name}
                        fill
                        className="object-cover transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className={`glass-panel p-5 rounded-2xl border-${m.color}-500/20 backdrop-blur-xl`}>
                          <h4 className="font-bold text-white text-lg">{m.name}</h4>
                          <p className={`text-${m.color}-500 text-xs font-bold tracking-wider uppercase mt-1`}>{m.role}</p>
                          <p className="text-slate-400 text-xs mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{m.desc}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-16 px-6 border-t border-slate-800 relative z-10 bg-slate-900/30">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <Image src="/assets/logo.png" alt="CeTech Academy" width={64} height={64} className="h-12 md:h-18 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="text-2xl font-bold tracking-tight text-white group-hover:text-brand-900 transition-colors">CeTech Academy</span>
              </Link>
              <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">Empowering the next generation of African digital architects. We forge careers through rigorous, tactile mastery.</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/1JBgGiieXV/?mibextid=wwXIfr" target="_blank" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-all shadow-md">
                  <Facebook className="w-5 h-5 fill-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <nav aria-label="Quick links">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Navigation</h4>
              <ul className="space-y-4">
                <li><Link href="#curriculum" className="text-slate-500 hover:text-brand-600 transition-colors text-sm">Curriculum</Link></li>
                <li><Link href="#pricing" className="text-slate-500 hover:text-brand-600 transition-colors text-sm">Pricing</Link></li>
                <li><Link href="#mentors" className="text-slate-500 hover:text-brand-600 transition-colors text-sm">Faculty</Link></li>
                <li><Link href="/login" className="text-slate-500 hover:text-brand-600 transition-colors text-sm">Student Login</Link></li>
              </ul>
            </nav>

            <nav aria-label="Legal links">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="/terms" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-slate-500 hover:text-white transition-colors text-sm">Cookie Policy</Link></li>
              </ul>
            </nav>
          </div>

          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">&copy; 2026 CeTech Academy. All rights reserved.</p>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              Designed with <Heart className="w-4 h-4 text-brand-500" /> for the future.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

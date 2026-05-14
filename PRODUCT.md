# PRODUCT.md - CETECH LEARNING PLATFORM | VERSION 1.0

## Executive Summary
CETech is an educational startup platform designed to provide a "College Board" style experience. The platform allows students to browse high-level courses, complete secure payments, and access structured learning modules containing high-definition video lessons and interactive quizzes.

## Users
- **Aspiring digital professionals in Africa**: Seeking job-ready skills.
- **Career switchers**: Looking for industry-ready portfolios and elite mentorship.
- **Students**: Seeking structured learning and certification.

## Brand & Tone
- **Tone**: Immersive, tactile, professional, futuristic, elite, empowering.
- **Visual Style**: High-end digital craftsmanship, glassmorphism, electric blue and cyan gradients, animated and interactive.
- **Color Palette**: 
  - Primary: #007bff (Electric Blue)
  - Accent: #00d2ff (Cyan)
  - Background: #070b10 (Deep Space Blue)
- **Voice**: Authoritative yet encouraging, focusing on mastery and industry readiness.

## Strategic Principles
1. **Mastery over Theory**: Focus on building real projects.
2. **Tactile Learning**: Immersive and interactive educational experience.
3. **Elite Mentorship**: Access to industry practitioners.

## Register
brand/product

## Anti-references
- Generic SaaS landing pages.
- Overly bright, clinical educational platforms.
- Static, non-interactive "brochureware".

## Technical Specifications
### System Architecture
- **Frontend**: React / Next.js (Deployed on Vercel)
- **Backend/DB**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Video Delivery**: Mux (Adaptive Bitrate Streaming)
- **Payments**: Paystack (Starter Business / Individual Account)

### Functional Requirements
- **Identity & Access Management**: SSO via Google Auth, Role-Based Access (Guest vs Student).
- **Content Delivery System**: Sidebar-driven navigation, Mux-optimized video, real-time progress tracking.
- **Payment Integration**: Paystack Starter account with automated provisioning via webhooks.

### Data Schema
- **profiles**: id, email, full_name, avatar_url
- **courses**: id, title, description, price, thumbnail_url
- **modules**: id, course_id, title, mux_playback_id, order_index
- **enrollments**: id, user_id, course_id, payment_status, created_at

## Security & Compliance
- **RLS**: Supabase Row Level Security to protect video metadata and quiz content.
- **ID Verification**: Paystack "Starter" compliance handled via National ID/Passport.

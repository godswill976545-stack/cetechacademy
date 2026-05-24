import { createClient } from '@supabase/supabase-js';
import { initIcons } from './src/icons';

const getEnv = (key) => {
    try {
        return import.meta.env[key] || '';
    } catch (e) {
        return '';
    }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://kohlegvunumiwxbhfbwb.supabase.co';
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaGxlZ3Z1bnVtaXd4YmhmYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODEyOTcsImV4cCI6MjA5MzA1NzI5N30.1A-ykiNp6KVZ9lfo0kd1xW157KJtukiTe7DUAE6uVf0';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const getPublicImageUrl = (path, bucket = 'assets') => {
    if (!supabase || !SUPABASE_URL) return null;
    if (path.startsWith('http')) return path;
    let cleanPath = path;
    if (path.startsWith(bucket + '/')) {
        cleanPath = path.replace(bucket + '/', '');
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return data?.publicUrl || null;
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('CeTech Academy initialized.');

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }

    // Auth State Handling
    const handleAuthState = async (user) => {
        if (!supabase) return;
        const guestEls = document.querySelectorAll('.auth-guest');
        const userEls = document.querySelectorAll('.auth-user');

        if (user) {
            guestEls.forEach(el => el.classList.add('hidden'));
            userEls.forEach(el => el.classList.remove('hidden'));
            if (window.location.pathname.includes('login.html') && localStorage.getItem('user_verified')) {
                window.location.href = '/frontend/portal.html';
            }
        } else {
            guestEls.forEach(el => el.classList.remove('hidden'));
            userEls.forEach(el => el.classList.add('hidden'));
        }

        if (user && !localStorage.getItem('user_verified') && !window.location.pathname.includes('verify.html')) {
            try {
                const otpResponse = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, email: user.email })
                });
                if (otpResponse.ok) {
                    localStorage.setItem('pending_user_id', user.id);
                    localStorage.setItem('pending_user_email', user.email);
                    localStorage.setItem('otp_sent', 'true');
                    window.location.href = 'verify.html';
                }
            } catch (e) { console.error('Auth Verification Error:', e); }
        }
    };

    if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
            handleAuthState(session?.user);
        });

        const { data: { session } } = await supabase.auth.getSession();
        handleAuthState(session?.user);
    }

    // Mobile menu
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
    const setMobileMenuOpen = (open) => {
        if (!mobileMenuButton || !mobileMenu) return;
        const icon = mobileMenuButton.querySelector('[data-lucide]');
        mobileMenuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (icon) icon.setAttribute('data-lucide', open ? 'x' : 'menu');
        if (open) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.offsetHeight;
            mobileMenu.classList.add('active');
        } else {
            mobileMenu.classList.remove('active');
            setTimeout(() => {
                if (!mobileMenu.classList.contains('active')) mobileMenu.classList.add('hidden');
            }, 300);
        }
        document.documentElement.classList.toggle('overflow-hidden', open);
        initIcons();
    };

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            setMobileMenuOpen(!expanded);
        });
        mobileMenu.querySelectorAll('a[href]').forEach(a => {
            a.addEventListener('click', () => setMobileMenuOpen(false));
        });
    }
    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.addEventListener('click', () => setMobileMenuOpen(false));
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
    });

    // Update image sources
    const updateImageSources = () => {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.closest('.hero-section')) return;
            const dataSrc = img.getAttribute('data-src');
            const supabaseUrl = getPublicImageUrl(dataSrc);
            img.onerror = () => {
                if (!img.getAttribute('data-fallback-tried')) {
                    img.setAttribute('data-fallback-tried', 'true');
                    img.src = dataSrc;
                }
            };
            img.src = supabaseUrl || dataSrc;
            img.removeAttribute('data-src');
        });
    };
    updateImageSources();

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        });
    }

    // Scroll reveal
    const revealEls = Array.from(document.querySelectorAll('.section-reveal'));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });
        revealEls.forEach(el => observer.observe(el));
    }

    // Logout
    const handleLogout = async () => {
        try {
            if (supabase) await supabase.auth.signOut();
        } catch (e) { console.error('Logout error:', e); }
        localStorage.removeItem('user_verified');
        localStorage.removeItem('pending_user_id');
        localStorage.removeItem('pending_user_email');
        localStorage.removeItem('otp_sent');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('logoutBtnMobile')?.addEventListener('click', handleLogout);

    // Login/Sign-up form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName')?.value;
            const submitBtn = document.getElementById('submitBtn');
            const authFeedback = document.getElementById('authFeedback');
            const isSignUp = document.getElementById('btnText').textContent.toLowerCase().includes('create');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            authFeedback.classList.remove('visible', 'error', 'success');

            try {
                if (!supabase) throw new Error('Auth unavailable');
                let authResponse;
                if (isSignUp) {
                    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
                    if (error) throw error;
                    authResponse = { data: { user: data.user } };
                } else {
                    authResponse = await supabase.auth.signInWithPassword({ email, password });
                }
                if (authResponse.error) throw authResponse.error;
                const user = authResponse.data.user;
                const otpResponse = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, email: user.email })
                });
                if (!otpResponse.ok) throw new Error('Failed to send verification code');
                localStorage.setItem('pending_user_id', user.id);
                localStorage.setItem('pending_user_email', user.email);
                localStorage.setItem('otp_sent', 'true');
                window.location.href = 'verify.html';
            } catch (error) {
                authFeedback.textContent = error.message;
                authFeedback.classList.add('visible', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
            }
        });
    }

    // Google OAuth
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            if (!supabase) return;
            try {
                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin }
                });
            } catch (error) { alert('Google Sign-In failed: ' + error.message); }
        });
    }

    // Lazy load React mounts for interactive components
    if (document.getElementById('headline-container')) {
        import('./HeadlineMount.jsx').catch(err => console.error('Failed to load HeadlineMount', err));
    }
    if (document.getElementById('antigravity-container')) {
        import('./AntigravityMount.jsx').catch(err => console.error('Failed to load AntigravityMount', err));
    }
    if (document.getElementById('aurora-bg')) {
        import('./AuroraMount.jsx').catch(err => console.error('Failed to load AuroraMount', err));
    }
    if (document.querySelector('.glow-target')) {
        import('./BorderGlowMount.jsx').catch(err => console.error('Failed to load BorderGlowMount', err));
    }
    if (document.querySelector('#curriculum article') || document.querySelector('#mentors article')) {
        import('./InteractiveMount.jsx').catch(err => console.error('Failed to load InteractiveMount', err));
    }

    initIcons();
});

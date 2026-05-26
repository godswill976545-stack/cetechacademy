import { initIcons } from './src/icons';

const getEnv = (key) => {
    try {
        return import.meta.env[key] || '';
    } catch (e) {
        return '';
    }
};

const CONVEX_URL = getEnv('VITE_CONVEX_URL') || '';

let convexClient = null;

async function getConvex() {
    if (convexClient) return convexClient;
    if (!CONVEX_URL) {
        console.warn('VITE_CONVEX_URL not set');
        return null;
    }
    const { ConvexClient } = await import('convex/browser');
    convexClient = new ConvexClient(CONVEX_URL);
    return convexClient;
}

let currentUser = null;

const getPublicImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Vite serves content from /public at the root /
    if (path.startsWith('assets/')) return '/' + path;
    return path;
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('CeTech Academy initialized.');

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }

    const client = await getConvex();
    const storedUser = localStorage.getItem('cetech_user');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch (e) {
            localStorage.removeItem('cetech_user');
        }
    }

    const handleAuthState = (user) => {
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
    };

    handleAuthState(currentUser);

    // Only redirect if we explicitly have a pending verification from a recent login/signup action
    const isPendingVerification = currentUser && !localStorage.getItem('user_verified');
    const hasSentOTP = localStorage.getItem('otp_sent') === 'true';
    const isNotOnVerifyPage = !window.location.pathname.includes('verify.html');

    if (isPendingVerification && hasSentOTP && isNotOnVerifyPage) {
        localStorage.setItem('pending_user_id', currentUser._id);
        localStorage.setItem('pending_user_email', currentUser.email);
        window.location.href = 'verify.html';
    } else if (isPendingVerification && !hasSentOTP && isNotOnVerifyPage) {
        // Ghost session from deleted database? Clear local state to allow fresh start.
        localStorage.removeItem('cetech_user');
        localStorage.removeItem('user_verified');
        currentUser = null;
        handleAuthState(null);
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
            const url = getPublicImageUrl(dataSrc);
            img.onerror = () => {
                if (!img.getAttribute('data-fallback-tried')) {
                    img.setAttribute('data-fallback-tried', 'true');
                    img.src = dataSrc;
                }
            };
            img.src = url || dataSrc;
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
            currentUser = null;
        } catch (e) { console.error('Logout error:', e); }
        localStorage.removeItem('cetech_user');
        localStorage.removeItem('user_verified');
        localStorage.removeItem('pending_user_id');
        localStorage.removeItem('pending_user_email');
        localStorage.removeItem('otp_sent');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('logoutBtnMobile')?.addEventListener('click', handleLogout);

    // Login/Sign-up form
    const authForm = document.getElementById('authForm') || document.getElementById('loginForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName')?.value;
            const submitBtn = document.getElementById('submitBtn');
            const authFeedback = document.getElementById('authFeedback');
                const btnTextEl = document.getElementById('btnText');
                const isSignUp = btnTextEl ? btnTextEl.textContent.toLowerCase().includes('create') : (window.location.pathname.includes('signup.html'));

            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            authFeedback.classList.remove('visible', 'error', 'success');

                try {
                    const c = await getConvex();
                    if (!c) throw new Error('Auth unavailable');

                    let result;
                    if (isSignUp) {
                        result = await c.action('auth/actions:registerUser', { email, password, fullName });
                    } else {
                        result = await c.action('auth/actions:loginUser', { email, password });
                    }

                    if (!result.success) throw new Error(result.error || 'Authentication failed');

                    currentUser = {
                        _id: result.userId,
                        email: result.email,
                    };
                    localStorage.setItem('cetech_user', JSON.stringify(currentUser));

                    localStorage.setItem('pending_user_id', result.userId);
                    localStorage.setItem('pending_user_email', result.email);
                    localStorage.setItem('otp_sent', 'true');
                    window.location.href = 'verify.html';
                } catch (error) {
                    authFeedback.textContent = error.message || error.toString();
                    authFeedback.classList.add('visible', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
                }
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

// CeTech Academy Interactions
// Safe access to environment variables
const getEnv = (key) => {
    try {
        return import.meta.env[key] || '';
    } catch (e) {
        return '';
    }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const supabaseLib = window.supabase;
const supabase = (supabaseLib?.createClient && SUPABASE_URL && SUPABASE_ANON_KEY)
    ? supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Allow index.html and login.html to be public
const currentPage = window.location.pathname;
const isPublicPage = currentPage.includes('index.html') || currentPage.endsWith('/') || currentPage.includes('login.html');

document.addEventListener('DOMContentLoaded', () => {
    console.log('CeTech Academy initialized.');

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
            // Force reflow
            mobileMenu.offsetHeight;
            mobileMenu.classList.add('active');
        } else {
            mobileMenu.classList.remove('active');
            setTimeout(() => {
                if (!mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
        }
        document.documentElement.classList.toggle('overflow-hidden', open);
        if (window.lucide?.createIcons) window.lucide.createIcons();
    };

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            setMobileMenuOpen(!expanded);
        });

        // Close when a menu link is clicked
        mobileMenu.querySelectorAll('a[href]').forEach((a) => {
            a.addEventListener('click', () => setMobileMenuOpen(false));
        });
    }

    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.addEventListener('click', () => setMobileMenuOpen(false));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
    });

    // Smooth scrolling for anchor links
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
                navbar.classList.add('shadow-lg', 'bg-white/95');
                navbar.classList.remove('bg-white/85');
            } else {
                navbar.classList.remove('shadow-lg', 'bg-white/95');
                navbar.classList.add('bg-white/85');
            }
        });
    }

    // Scroll reveal animations
    const revealEls = Array.from(document.querySelectorAll('.section-reveal'));
    const forceRevealAll = () => {
        revealEls.forEach((el) => el.classList.add('visible'));
    };

    if ('IntersectionObserver' in window) {
        // Opt-in to reveal animations (keeps content visible if JS never runs).
        document.documentElement.classList.add('reveal-ready');

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealEls.forEach(el => observer.observe(el));

        // Safety net: if something prevents observers from firing, never keep content hidden.
        window.addEventListener('load', () => {
            setTimeout(() => {
                const stillHidden = revealEls.some((el) => !el.classList.contains('visible'));
                if (stillHidden) forceRevealAll();
            }, 1200);
        });
    } else {
        forceRevealAll();
    }

    // Auth State Handling
    const updateAuthUI = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        
        const guestEls = document.querySelectorAll('.auth-guest');
        const userEls = document.querySelectorAll('.auth-user');
        
        if (user) {
            guestEls.forEach(el => el.classList.add('hidden'));
            userEls.forEach(el => el.classList.remove('hidden'));
            
            // Redirect logged-in users away from login page
            if (window.location.pathname.includes('login.html')) {
                window.location.href = '/frontend/portal.html';
            }
        } else {
            guestEls.forEach(el => el.classList.remove('hidden'));
            userEls.forEach(el => el.classList.add('hidden'));
        }
    };

    updateAuthUI();

    // Logout logic
    const handleLogout = async () => {
        try {
            if (supabase) {
                const { error } = await supabase.auth.signOut();
                if (error) console.error('Error signing out:', error.message);
            }
        } catch (e) {
            console.error('Logout error:', e);
        }
        localStorage.removeItem('supabase.auth.token');
        window.location.href = 'index.html';
    };

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('logoutBtnMobile')?.addEventListener('click', handleLogout);

    // Login/Sign Up form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Handle initial mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'signup') {
            if (window.setAuthMode) {
                window.setAuthMode('signup');
            } else {
                // Fallback if setAuthMode isn't ready
                const toggleMode = document.getElementById('toggleMode');
                if (toggleMode && toggleMode.textContent.includes('Create Account')) {
                    toggleMode.click();
                }
            }
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName')?.value;
            
            // Determine mode from the submit button text or title
            const btnText = document.getElementById('btnText');
            const btnIcon = document.getElementById('btnIcon');
            const submitBtn = document.getElementById('submitBtn');
            const authFeedback = document.getElementById('authFeedback');
            const isSignUp = btnText.textContent.toLowerCase().includes('create');

            // Reset states
            submitBtn.classList.remove('error', 'success');
            authFeedback.classList.remove('visible', 'error', 'success');
            authFeedback.textContent = '';

            // Basic Input Sanitization/Validation
            if (!email || !password) {
                showFeedback('Please fill in all fields.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFeedback('Please enter a valid email address.', 'error');
                return;
            }

            const originalBtnHtml = submitBtn.innerHTML;
            const originalIcon = btnIcon.getAttribute('data-lucide');

            setLoading(true);

            function setLoading(isLoading) {
                submitBtn.disabled = isLoading;
                if (isLoading) {
                    btnText.textContent = 'Processing...';
                    btnIcon.setAttribute('data-lucide', 'loader-2');
                    btnIcon.classList.add('animate-spin');
                } else {
                    btnText.textContent = isSignUp ? 'Create Account' : 'Sign In';
                    btnIcon.setAttribute('data-lucide', originalIcon);
                    btnIcon.classList.remove('animate-spin');
                }
                if (window.lucide) window.lucide.createIcons();
            }

            function showFeedback(message, type) {
                authFeedback.textContent = message;
                authFeedback.className = `auth-feedback visible ${type}`;
                if (type === 'error') {
                    submitBtn.classList.add('error');
                    setTimeout(() => submitBtn.classList.remove('error'), 500);
                } else if (type === 'success') {
                    submitBtn.classList.add('success');
                    btnIcon.setAttribute('data-lucide', 'check');
                    if (window.lucide) window.lucide.createIcons();
                }
            }

            try {
                if (!supabase) throw new Error('Auth is temporarily unavailable. Please refresh the page.');
                
                let authResponse;
                if (isSignUp) {
                    // SIGN UP
                    authResponse = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { full_name: fullName }
                        }
                    });
                } else {
                    // SIGN IN
                    authResponse = await supabase.auth.signInWithPassword({ email, password });
                }

                if (authResponse.error) throw authResponse.error;

                const user = authResponse.data.user;

                showFeedback(isSignUp ? 'Account created! Redirecting...' : 'Welcome back! Redirecting...', 'success');
                
                // Small delay to show success state
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (isSignUp) {
                    window.location.href = '/frontend/payment.html';
                } else {
                    // Check payment status from profiles table
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('payment_status')
                        .eq('id', user.id)
                        .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') {
                        throw profileError;
                    }

                    if (profile?.payment_status === 'paid') {
                        window.location.href = '/frontend/portal.html';
                    } else {
                        window.location.href = '/frontend/payment.html';
                    }
                }
            } catch (error) {
                const errorMessage = error.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                showFeedback(errorMessage, 'error');
                setLoading(false);
            }
        });
    }

    // Google OAuth Handler
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            if (!supabase) {
                alert('Auth is temporarily unavailable. Please refresh the page.');
                return;
            }

            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/payment`, // Redirect to payment after successful login
                    },
                });

                if (error) throw error;
            } catch (error) {
                alert('Google Sign-In failed: ' + error.message);
            }
        });
    }
});

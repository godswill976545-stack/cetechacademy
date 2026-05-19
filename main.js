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
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaGxlZ3Z1bnVtaXd4YmhmYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODEyOTcsImV4cCI6MjA5MzA1NzI5N30.1A-ykiNp6KVZ9lfo0kd1xW157KJtukiTe7DUAE6uVf0';
import { createClient } from '@supabase/supabase-js';
import { initIcons } from './src/icons';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * Utility to get public URL for images stored in Supabase Storage.
 * Falls back to local path if Supabase is not configured or if image not found.
 */
const getPublicImageUrl = (path, bucket = 'assets') => {
    if (!supabase || !SUPABASE_URL) return null;
    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Ensure we don't have double bucket in path if the path already starts with bucket name
    let cleanPath = path;
    if (path.startsWith(bucket + '/')) {
        cleanPath = path.replace(bucket + '/', '');
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return data?.publicUrl || null;
};

// Allow index.html and login.html to be public
const currentPage = window.location.pathname;
const isPublicPage = currentPage.includes('index.html') || currentPage.endsWith('/') || currentPage.includes('login.html');

document.addEventListener('DOMContentLoaded', () => {
    console.log('CeTech Academy initialized.');

    // Register Service Worker for Caching
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
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
        initIcons();
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

    // Update image sources to use Supabase Storage if available
    const updateImageSources = () => {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            // Skip images that should be lazy loaded or are above the fold
            if (img.closest('.hero-section')) return;

            const dataSrc = img.getAttribute('data-src');
            const supabaseUrl = getPublicImageUrl(dataSrc);

            // Add error handler to fallback to local asset if Supabase load fails
            img.onerror = () => {
                if (img.src !== window.location.origin + '/' + dataSrc && !img.getAttribute('data-fallback-tried')) {
                    console.log(`Failed to load from Supabase, falling back to local: ${dataSrc}`);
                    img.setAttribute('data-fallback-tried', 'true');
                    img.src = dataSrc;
                }
            };

            // Use Supabase URL if available, otherwise fallback to local asset
            img.src = supabaseUrl || dataSrc;
            img.removeAttribute('data-src');
        });
    };
    updateImageSources();

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
    initIcons();

    // Load critical interactive components immediately to improve LCP/FCP
    if (document.getElementById('headline-container')) {
        import('./HeadlineMount.jsx').catch(err => console.error('Failed to load HeadlineMount', err));
    }

    // Lazy load non-critical background/decorative components
    const loadLazyMounts = () => {
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
    };

    // Delay background components slightly to prioritize main content
    if (window.requestIdleCallback) {
        window.requestIdleCallback(loadLazyMounts, { timeout: 1000 });
    } else {
        setTimeout(loadLazyMounts, 1000);
    }

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

            if (password.length < 8) {
                showFeedback('Password must be at least 8 characters long.', 'error');
                return;
            }

            if (isSignUp && (!fullName || fullName.trim().length < 2)) {
                showFeedback('Please enter your full name.', 'error');
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
                initIcons();
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
                    initIcons();
                }
            }

            try {
                if (!supabase) throw new Error('Auth is temporarily unavailable. Please refresh the page.');
                
                let authResponse;
                if (isSignUp) {
                    // SIGN UP with OTP (sends 6-digit code via email)
                    authResponse = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            data: { full_name: fullName },
                            shouldCreateUser: true,
                        }
                    });
                } else {
                    // SIGN IN
                    authResponse = await supabase.auth.signInWithPassword({ email, password });
                }

                if (authResponse.error) throw authResponse.error;

                if (isSignUp) {
                    // Show verification code prompt
                    const verifyPrompt = document.getElementById('verifyPrompt');
                    const verifyEmailDisplay = document.getElementById('verifyEmailDisplay');
                    const formTitle = document.getElementById('formTitle');
                    const formSubtitle = document.getElementById('formSubtitle');

                    if (verifyPrompt) verifyPrompt.classList.remove('hidden');
                    if (verifyEmailDisplay) verifyEmailDisplay.textContent = email;
                    if (loginForm) loginForm.classList.add('hidden');
                    if (formTitle) formTitle.textContent = 'Enter Code';
                    if (formSubtitle) formSubtitle.textContent = 'We sent a 6-digit code to your email';

                    // Store email in session for verify/resend
                    sessionStorage.setItem('pendingVerificationEmail', email);
                    sessionStorage.setItem('pendingVerificationName', fullName || '');

                    setLoading(false);
                    initIcons();
                    // Focus first code input
                    setTimeout(() => document.querySelector('.code-input[data-index="0"]')?.focus(), 100);
                } else {
                    showFeedback('Welcome back! Redirecting...', 'success');
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const user = authResponse.data.user;
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

    // ===== CODE INPUT HANDLING =====
    const codeInputs = document.querySelectorAll('.code-input');
    const fullCodeInput = document.getElementById('fullCode');

    function updateFullCode() {
        let code = '';
        codeInputs.forEach(input => { code += input.value; });
        if (fullCodeInput) fullCodeInput.value = code;
        return code;
    }

    codeInputs.forEach((input, index) => {
        // Only allow digits
        input.addEventListener('input', (e) => {
            input.value = input.value.replace(/[^0-9]/g, '');
            updateFullCode();
            // Auto-focus next input
            if (input.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
            const digits = pasteData.split('');
            codeInputs.forEach((inp, i) => {
                if (digits[i]) inp.value = digits[i];
            });
            updateFullCode();
            const nextEmpty = Array.from(codeInputs).findIndex(inp => !inp.value);
            if (nextEmpty !== -1) codeInputs[nextEmpty].focus();
            else codeInputs[codeInputs.length - 1].focus();
        });
    });

    // ===== VERIFY CODE BUTTON =====
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', async () => {
            const code = updateFullCode();
            const email = sessionStorage.getItem('pendingVerificationEmail');
            const verifyCodeFeedback = document.getElementById('verifyCodeFeedback');

            if (!email) {
                verifyCodeFeedback.textContent = 'Session expired. Please sign up again.';
                verifyCodeFeedback.className = 'mt-3 text-sm text-center text-red-500';
                verifyCodeFeedback.classList.remove('hidden');
                return;
            }

            if (code.length !== 6) {
                verifyCodeFeedback.textContent = 'Please enter all 6 digits.';
                verifyCodeFeedback.className = 'mt-3 text-sm text-center text-red-500';
                verifyCodeFeedback.classList.remove('hidden');
                return;
            }

            verifyCodeBtn.disabled = true;
            verifyCodeBtn.querySelector('span').textContent = 'Verifying...';

            try {
                const { error } = await supabase.auth.verifyOtp({
                    email,
                    token: code,
                    type: 'signup',
                });

                if (error) throw error;

                // Success! Show success state
                verifyCodeFeedback.textContent = 'Email verified! Redirecting...';
                verifyCodeFeedback.className = 'mt-3 text-sm text-center text-green-600';
                verifyCodeFeedback.classList.remove('hidden');

                // Redirect to payment after short delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                window.location.href = '/frontend/payment.html';

            } catch (err) {
                verifyCodeFeedback.textContent = 'Invalid code. Please try again.';
                verifyCodeFeedback.className = 'mt-3 text-sm text-center text-red-500';
                verifyCodeFeedback.classList.remove('hidden');
                // Clear inputs
                codeInputs.forEach(inp => inp.value = '');
                updateFullCode();
                codeInputs[0].focus();
            }

            verifyCodeBtn.disabled = false;
            verifyCodeBtn.querySelector('span').textContent = 'Verify Email';
        });
    }

    // ===== RESEND CODE BUTTON =====
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            const resendFeedback = document.getElementById('resendFeedback');
            const resendBtnText = document.getElementById('resendBtnText');
            const email = sessionStorage.getItem('pendingVerificationEmail');
            const fullName = sessionStorage.getItem('pendingVerificationName') || '';

            if (!email) {
                resendFeedback.textContent = 'Session expired. Please sign up again.';
                resendFeedback.className = 'mt-2 text-xs text-red-500';
                resendFeedback.classList.remove('hidden');
                return;
            }

            resendBtn.disabled = true;
            resendBtnText.textContent = 'Sending...';

            try {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        data: { full_name: fullName },
                        shouldCreateUser: true,
                    }
                });

                if (error) throw error;

                resendFeedback.textContent = 'New code sent! Check your inbox.';
                resendFeedback.className = 'mt-2 text-xs text-green-600';

                // Clear inputs
                codeInputs.forEach(inp => inp.value = '');
                updateFullCode();
                codeInputs[0].focus();

            } catch (err) {
                resendFeedback.textContent = 'Failed to send. Try again.';
                resendFeedback.className = 'mt-2 text-xs text-red-500';
            }

            resendFeedback.classList.remove('hidden');
            resendBtnText.textContent = 'Resend Code';
            resendBtn.disabled = false;
        });
    }

    // ===== GOOGLE OAUTH HANDLER =====
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
                        redirectTo: `${window.location.origin}/payment`,
                    },
                });

                if (error) throw error;
            } catch (error) {
                alert('Google Sign-In failed: ' + error.message);
            }
        });
    }
});

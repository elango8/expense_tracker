/**
 * Authentication Module
 * Handles signup, login, and session management
 */

// Auth state management
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('user') !== null;
    },

    // Get current user
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Sign up new user
    signup(userData) {
        const user = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            createdAt: new Date().toISOString(),
            avatar: null
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.hideSignupModal();
        this.updateUI();

        // Show success toast
        if (typeof showToast === 'function') {
            showToast('Welcome to ExpenseTracker!', 'Account created successfully', 'success');
        }

        return user;
    },

    // Log in user
    login(email, password) {
        // For demo purposes, create a user session
        const existingUser = this.getUser();

        if (existingUser && existingUser.email === email) {
            this.hideSignupModal();
            this.updateUI();

            if (typeof showToast === 'function') {
                showToast('Welcome back!', 'Logged in successfully', 'success');
            }

            return existingUser;
        }

        // Create new session for demo
        const user = {
            id: Date.now().toString(),
            firstName: 'User',
            lastName: '',
            email: email,
            createdAt: new Date().toISOString(),
            avatar: null
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.hideSignupModal();
        this.updateUI();

        if (typeof showToast === 'function') {
            showToast('Welcome!', 'Logged in successfully', 'success');
        }

        return user;
    },

    // Log out user
    logout() {
        localStorage.removeItem('user');
        this.updateUI();

        if (typeof showToast === 'function') {
            showToast('Logged out', 'See you soon!', 'info');
        }

        // Redirect to home
        window.location.href = '../index.html';
    },

    // Update user data
    updateUser(userData) {
        const user = this.getUser();
        if (user) {
            const updatedUser = { ...user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.updateUI();
            return updatedUser;
        }
        return null;
    },

    // Show signup modal
    showSignupModal() {
        const modal = document.getElementById('signup-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Hide signup modal
    hideSignupModal() {
        const modal = document.getElementById('signup-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Update UI based on auth state
    updateUI() {
        const user = this.getUser();

        // Update sidebar user info
        const sidebarName = document.getElementById('sidebar-name');
        const sidebarAvatar = document.getElementById('sidebar-avatar');

        if (sidebarName && user) {
            sidebarName.textContent = user.firstName || 'User';
        }

        if (sidebarAvatar && user) {
            sidebarAvatar.textContent = (user.firstName || 'U').charAt(0).toUpperCase();
        }

        // Update any other auth-dependent elements
        document.querySelectorAll('[data-auth-only]').forEach(el => {
            el.style.display = user ? '' : 'none';
        });

        document.querySelectorAll('[data-guest-only]').forEach(el => {
            el.style.display = user ? 'none' : '';
        });
    },

    // Check protected action - show modal if not logged in
    requireAuth(callback) {
        if (this.isLoggedIn()) {
            if (callback) callback();
            return true;
        } else {
            this.showSignupModal();
            return false;
        }
    }
};

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = ['', 'weak', 'fair', 'good', 'strong', 'strong'];
    const texts = ['Password strength', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

    return {
        level: levels[strength],
        text: texts[strength],
        score: strength
    };
}

// Initialize auth UI
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (targetTab === 'signup') {
                signupForm?.classList.remove('hidden');
                loginForm?.classList.add('hidden');
            } else {
                signupForm?.classList.add('hidden');
                loginForm?.classList.remove('hidden');
            }
        });
    });

    // Switch links
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="login"]')?.click();
        });
    });

    document.querySelectorAll('.switch-to-signup').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="signup"]')?.click();
        });
    });

    // Password toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const result = checkPasswordStrength(passwordInput.value);

            if (strengthFill) {
                strengthFill.className = 'strength-fill';
                if (result.level) {
                    strengthFill.classList.add(result.level);
                }
            }

            if (strengthText) {
                strengthText.textContent = result.text;
            }
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const userData = {
                firstName: document.getElementById('firstName')?.value,
                lastName: document.getElementById('lastName')?.value,
                email: document.getElementById('email')?.value
            };

            Auth.signup(userData);

            // Redirect to stored destination or dashboard
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl || 'dashboard.html';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;

            Auth.login(email, password);

            // Redirect to stored destination or dashboard
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl || 'dashboard.html';
        });
    }

    // Modal signup form (on landing page)
    const modalSignupForm = document.getElementById('modal-signup-form');
    if (modalSignupForm) {
        modalSignupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const userData = {
                firstName: 'User',
                lastName: '',
                email: document.getElementById('modal-email')?.value
            };

            Auth.signup(userData);

            // Redirect to dashboard
            window.location.href = 'pages/dashboard.html';
        });
    }

    // Close modal
    const modalClose = document.querySelector('.signup-modal-close');
    const modalBackdrop = document.getElementById('signup-modal');

    if (modalClose) {
        modalClose.addEventListener('click', () => Auth.hideSignupModal());
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                Auth.hideSignupModal();
            }
        });
    }

    // Update UI on load
    Auth.updateUI();
});

// Export for use in other scripts
window.Auth = Auth;

/**
 * Expense Tracker - Theme Manager
 * Handles light/dark theme switching
 */

const ThemeManager = {
    init() {
        const savedTheme = Storage.getTheme();
        this.setTheme(savedTheme);
        this.bindEvents();
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.setTheme(theme);

        // Update toggle button icon
        const toggleBtns = document.querySelectorAll('.theme-toggle, #theme-switch');
        toggleBtns.forEach(btn => {
            if (btn.type === 'checkbox') {
                btn.checked = theme === 'dark';
            }
        });
    },

    toggleTheme() {
        const current = Storage.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    bindEvents() {
        // Theme toggle buttons in header
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });

        // Theme switch in settings
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                this.setTheme(e.target.checked ? 'dark' : 'light');
            });
        }
    }
};

/**
 * Expense Tracker - Navigation/Sidebar
 */
const Navigation = {
    init() {
        this.bindEvents();
        this.setActiveNav();
    },

    bindEvents() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay?.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar?.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // Close sidebar on nav item click (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar?.classList.remove('active');
                    overlay?.classList.remove('active');
                }
            });
        });
    },

    setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === 'dashboard.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
};

/**
 * Expense Tracker - Modal Manager
 */
const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    init() {
        // Close on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
                    modal.classList.remove('active');
                });
                document.body.style.overflow = '';
            }
        });

        // Close button handlers
        document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-backdrop');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navigation.init();
    Modal.init();
});

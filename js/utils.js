/**
 * Expense Tracker - Utility Functions
 */

const Utils = {
    // Category configuration with icons and colors
    categories: {
        food: { label: 'Food & Dining', icon: 'fa-utensils', color: '#ff6b6b' },
        travel: { label: 'Travel', icon: 'fa-plane', color: '#4ecdc4' },
        bills: { label: 'Bills & Utilities', icon: 'fa-file-invoice', color: '#45b7d1' },
        shopping: { label: 'Shopping', icon: 'fa-shopping-bag', color: '#96ceb4' },
        entertainment: { label: 'Entertainment', icon: 'fa-film', color: '#dda0dd' },
        health: { label: 'Health', icon: 'fa-heartbeat', color: '#98d8c8' },
        education: { label: 'Education', icon: 'fa-graduation-cap', color: '#f7dc6f' },
        others: { label: 'Others', icon: 'fa-ellipsis-h', color: '#bdc3c7' }
    },

    // Payment methods
    paymentMethods: {
        cash: { label: 'Cash', icon: 'fa-money-bill-wave' },
        card: { label: 'Card', icon: 'fa-credit-card' },
        upi: { label: 'UPI', icon: 'fa-mobile-alt' },
        bank: { label: 'Bank Transfer', icon: 'fa-university' }
    },

    /**
     * Format currency with proper symbol
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        const settings = Storage.getSettings();
        const symbol = settings.currencySymbol || '$';
        const num = parseFloat(amount) || 0;
        return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'relative')
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);

        switch (format) {
            case 'long':
                return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'relative':
                return this.getRelativeTime(d);
            case 'input':
                return d.toISOString().split('T')[0];
            default:
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    },

    /**
     * Get relative time string
     * @param {Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return this.formatDate(date, 'short');
    },

    /**
     * Get category info
     * @param {string} category - Category key
     * @returns {Object} Category info
     */
    getCategoryInfo(category) {
        return this.categories[category] || this.categories.others;
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <p class="toast-title">${this.getToastTitle(type)}</p>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    getToastIcon(type) {
        const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info' };
        return icons[type] || icons.info;
    },

    getToastTitle(type) {
        const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
        return titles[type] || titles.info;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Validate form fields
     * @param {Object} fields - Field values to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result { isValid, errors }
     */
    validateForm(fields, rules) {
        const errors = {};

        for (const [field, rule] of Object.entries(rules)) {
            const value = fields[field];

            if (rule.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${rule.label || field} is required`;
                continue;
            }

            if (rule.min && parseFloat(value) < rule.min) {
                errors[field] = `${rule.label || field} must be at least ${rule.min}`;
            }

            if (rule.max && parseFloat(value) > rule.max) {
                errors[field] = `${rule.label || field} must be less than ${rule.max}`;
            }
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    },

    /**
     * Generate chart colors
     * @param {number} count - Number of colors needed
     * @returns {Array} Array of colors
     */
    getChartColors(count) {
        const colors = Object.values(this.categories).map(c => c.color);
        return colors.slice(0, count);
    },

    /**
     * Calculate percentage change
     */
    calculateChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }
};

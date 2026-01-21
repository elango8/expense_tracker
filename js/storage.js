/**
 * Expense Tracker - Storage Module
 * Handles all LocalStorage operations for the application
 */

const Storage = {
    // Storage keys
    KEYS: {
        EXPENSES: 'expenseTracker_expenses',
        INCOME: 'expenseTracker_income',
        SETTINGS: 'expenseTracker_settings',
        THEME: 'expenseTracker_theme'
    },

    /**
     * Initialize storage with default values if empty
     */
    init() {
        if (!this.get(this.KEYS.EXPENSES)) {
            this.set(this.KEYS.EXPENSES, []);
        }
        if (!this.get(this.KEYS.INCOME)) {
            this.set(this.KEYS.INCOME, []);
        }
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, {
                currency: 'USD',
                currencySymbol: '$',
                dateFormat: 'MM/DD/YYYY'
            });
        }
    },

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading from storage: ${key}`, error);
            return null;
        }
    },

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to storage: ${key}`, error);
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from storage: ${key}`, error);
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
        this.init();
    },

    // ===== Expense Operations =====

    /**
     * Get all expenses
     * @returns {Array} Array of expense objects
     */
    getExpenses() {
        return this.get(this.KEYS.EXPENSES) || [];
    },

    /**
     * Add new expense
     * @param {Object} expense - Expense object
     * @returns {Object} Added expense with ID
     */
    addExpense(expense) {
        const expenses = this.getExpenses();
        const newExpense = {
            id: this.generateId(),
            ...expense,
            createdAt: new Date().toISOString()
        };
        expenses.unshift(newExpense);
        this.set(this.KEYS.EXPENSES, expenses);
        return newExpense;
    },

    /**
     * Update existing expense
     * @param {string} id - Expense ID
     * @param {Object} updates - Updated fields
     * @returns {Object|null} Updated expense or null
     */
    updateExpense(id, updates) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(this.KEYS.EXPENSES, expenses);
            return expenses[index];
        }
        return null;
    },

    /**
     * Delete expense
     * @param {string} id - Expense ID
     * @returns {boolean} Success status
     */
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        if (filtered.length !== expenses.length) {
            this.set(this.KEYS.EXPENSES, filtered);
            return true;
        }
        return false;
    },

    /**
     * Get expense by ID
     * @param {string} id - Expense ID
     * @returns {Object|null} Expense object or null
     */
    getExpenseById(id) {
        return this.getExpenses().find(e => e.id === id) || null;
    },

    // ===== Income Operations =====

    getIncome() {
        return this.get(this.KEYS.INCOME) || [];
    },

    addIncome(income) {
        const incomes = this.getIncome();
        const newIncome = {
            id: this.generateId(),
            ...income,
            createdAt: new Date().toISOString()
        };
        incomes.unshift(newIncome);
        this.set(this.KEYS.INCOME, incomes);
        return newIncome;
    },

    deleteIncome(id) {
        const incomes = this.getIncome();
        const filtered = incomes.filter(i => i.id !== id);
        this.set(this.KEYS.INCOME, filtered);
        return filtered.length !== incomes.length;
    },

    // ===== Settings Operations =====

    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {};
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        this.set(this.KEYS.SETTINGS, { ...settings, ...updates });
    },

    // ===== Theme Operations =====

    getTheme() {
        return this.get(this.KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        this.set(this.KEYS.THEME, theme);
    },

    // ===== Utility Functions =====

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Get filtered expenses
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered expenses
     */
    getFilteredExpenses(filters = {}) {
        let expenses = this.getExpenses();

        if (filters.category && filters.category !== 'all') {
            expenses = expenses.filter(e => e.category === filters.category);
        }

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            expenses = expenses.filter(e => new Date(e.date) >= start);
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59);
            expenses = expenses.filter(e => new Date(e.date) <= end);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            expenses = expenses.filter(e =>
                e.description?.toLowerCase().includes(search) ||
                e.category?.toLowerCase().includes(search) ||
                e.notes?.toLowerCase().includes(search)
            );
        }

        return expenses;
    },

    /**
     * Get expenses for a specific period
     * @param {string} period - 'today', 'week', 'month', 'year'
     * @returns {Array} Expenses within the period
     */
    getExpensesByPeriod(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return this.getExpenses();
        }

        return this.getFilteredExpenses({ startDate: startDate.toISOString() });
    },

    /**
     * Get total expenses amount
     * @param {Array} expenses - Optional expense array
     * @returns {number} Total amount
     */
    getTotalExpenses(expenses = null) {
        const data = expenses || this.getExpenses();
        return data.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    },

    /**
     * Get total income amount
     * @returns {number} Total income
     */
    getTotalIncome() {
        return this.getIncome().reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    },

    /**
     * Get expenses grouped by category
     * @param {Array} expenses - Optional expense array
     * @returns {Object} Category totals
     */
    getExpensesByCategory(expenses = null) {
        const data = expenses || this.getExpenses();
        return data.reduce((acc, e) => {
            const category = e.category || 'others';
            acc[category] = (acc[category] || 0) + (parseFloat(e.amount) || 0);
            return acc;
        }, {});
    },

    /**
     * Get monthly expense data for charts
     * @param {number} months - Number of months to retrieve
     * @returns {Array} Monthly data
     */
    getMonthlyData(months = 6) {
        const data = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthExpenses = this.getFilteredExpenses({
                startDate: date.toISOString(),
                endDate: monthEnd.toISOString()
            });

            data.push({
                month: date.toLocaleString('default', { month: 'short' }),
                year: date.getFullYear(),
                total: this.getTotalExpenses(monthExpenses),
                count: monthExpenses.length
            });
        }

        return data;
    }
};

// Initialize storage on load
Storage.init();

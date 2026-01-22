/**
 * Expense Tracker - Income Form Module
 */

const IncomeForm = {
    selectedCategory: null,
    selectedPayment: 'bank',

    init() {
        this.bindEvents();
        this.setDefaultDate();
    },

    bindEvents() {
        // Category selection
        document.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedCategory = e.currentTarget.dataset.category;
                this.clearError('category');
            });
        });

        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedPayment = e.currentTarget.dataset.method;
            });
        });

        // Form submission
        const form = document.getElementById('income-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Amount input formatting
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
                if (parts[1]?.length > 2) value = parts[0] + '.' + parts[1].slice(0, 2);
                e.target.value = value;
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }
    },

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },

    handleSubmit() {
        const formData = this.getFormData();
        const validation = this.validateForm(formData);

        if (!validation.isValid) {
            this.showErrors(validation.errors);
            return;
        }

        // Save income using Storage.addExpense with type 'income'
        const income = Storage.addExpense({
            type: 'income',
            amount: parseFloat(formData.amount),
            category: this.selectedCategory,
            paymentMethod: this.selectedPayment,
            date: formData.date,
            description: formData.description,
            notes: formData.notes
        });

        // Show success animation
        this.showSuccess();

        // Reset form after delay
        setTimeout(() => {
            this.resetForm();
            this.hideSuccess();
        }, 2000);
    },

    getFormData() {
        return {
            amount: document.getElementById('amount')?.value || '',
            date: document.getElementById('date')?.value || '',
            description: document.getElementById('description')?.value || '',
            notes: document.getElementById('notes')?.value || '',
            category: this.selectedCategory,
            paymentMethod: this.selectedPayment
        };
    },

    validateForm(data) {
        const errors = {};

        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.amount = 'Please enter a valid amount';
        }

        if (!this.selectedCategory) {
            errors.category = 'Please select an income source';
        }

        if (!data.date) {
            errors.date = 'Please select a date';
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    },

    showErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.remove());
        document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));

        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            if (input) {
                input.classList.add('error');
                const errorEl = document.createElement('div');
                errorEl.className = 'form-error';
                errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                input.parentElement.appendChild(errorEl);
            }

            if (field === 'category') {
                const categorySection = document.querySelector('.category-grid');
                if (categorySection) {
                    const errorEl = document.createElement('div');
                    errorEl.className = 'form-error';
                    errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                    categorySection.parentElement.appendChild(errorEl);
                }
            }
        }

        Utils.showToast('Please fix the errors in the form', 'error');
    },

    clearError(field) {
        const input = document.getElementById(field);
        if (input) {
            input.classList.remove('error');
            const error = input.parentElement.querySelector('.form-error');
            if (error) error.remove();
        }

        if (field === 'category') {
            const categorySection = document.querySelector('.category-grid');
            const error = categorySection?.parentElement.querySelector('.form-error');
            if (error) error.remove();
        }
    },

    showSuccess() {
        const overlay = document.getElementById('success-overlay');
        if (overlay) overlay.classList.add('active');
        Utils.showToast('Income added successfully!', 'success');
    },

    hideSuccess() {
        const overlay = document.getElementById('success-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    resetForm() {
        const form = document.getElementById('income-form');
        if (form) form.reset();

        this.selectedCategory = null;
        this.selectedPayment = 'bank';

        document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        document.querySelector('.payment-option[data-method="bank"]')?.classList.add('selected');
        document.querySelectorAll('.form-error').forEach(el => el.remove());
        document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));

        this.setDefaultDate();
    }
};

// Initialize if on add income page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('income-form')) {
        IncomeForm.init();
    }
});

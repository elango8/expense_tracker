/**
 * Expense Tracker - Settings Module
 */

const Settings = {
    init() {
        this.loadCurrentSettings();
        this.bindEvents();
    },

    bindEvents() {
        // Currency selection
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.updateCurrency(e.target.value);
            });
        }

        // Reset data button
        const resetBtn = document.getElementById('reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                Modal.open('reset-modal');
            });
        }

        // Confirm reset
        const confirmReset = document.getElementById('confirm-reset');
        if (confirmReset) {
            confirmReset.addEventListener('click', () => {
                this.resetAllData();
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import data
        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-file')?.click();
            });
        }

        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
        }

        // Add sample data
        const sampleBtn = document.getElementById('add-sample-data');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.addSampleData());
        }
    },

    loadCurrentSettings() {
        const settings = Storage.getSettings();

        // Set currency dropdown
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.value = settings.currency || 'USD';
        }

        // Set theme switch
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = Storage.getTheme() === 'dark';
        }

        // Load stats
        this.loadDataStats();
    },

    loadDataStats() {
        const expenses = Storage.getExpenses();
        const income = Storage.getIncome();

        const totalExpenses = document.getElementById('total-expenses-count');
        if (totalExpenses) totalExpenses.textContent = expenses.length;

        const totalIncome = document.getElementById('total-income-count');
        if (totalIncome) totalIncome.textContent = income.length;

        const storageUsed = document.getElementById('storage-used');
        if (storageUsed) {
            const size = new Blob([JSON.stringify(localStorage)]).size;
            storageUsed.textContent = this.formatBytes(size);
        }
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    updateCurrency(currency) {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
            'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$'
        };

        Storage.updateSettings({
            currency: currency,
            currencySymbol: symbols[currency] || '$'
        });

        Utils.showToast(`Currency updated to ${currency}`, 'success');
    },

    resetAllData() {
        Storage.clearAll();
        Utils.showToast('All data has been reset', 'success');
        Modal.close('reset-modal');
        this.loadDataStats();
    },

    exportData() {
        const data = {
            expenses: Storage.getExpenses(),
            income: Storage.getIncome(),
            settings: Storage.getSettings(),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showToast('Data exported successfully', 'success');
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.expenses) {
                    Storage.set(Storage.KEYS.EXPENSES, data.expenses);
                }
                if (data.income) {
                    Storage.set(Storage.KEYS.INCOME, data.income);
                }
                if (data.settings) {
                    Storage.set(Storage.KEYS.SETTINGS, data.settings);
                }

                Utils.showToast('Data imported successfully', 'success');
                this.loadDataStats();
            } catch (err) {
                Utils.showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    },

    addSampleData() {
        const categories = ['food', 'travel', 'bills', 'shopping', 'entertainment', 'health', 'education', 'others'];
        const paymentMethods = ['cash', 'card', 'upi', 'bank'];
        const descriptions = {
            food: ['Lunch at cafe', 'Groceries', 'Dinner with friends', 'Coffee', 'Pizza delivery'],
            travel: ['Uber ride', 'Gas station', 'Bus ticket', 'Parking fee', 'Metro card'],
            bills: ['Electricity bill', 'Internet bill', 'Phone bill', 'Water bill', 'Gas bill'],
            shopping: ['Amazon order', 'Clothes', 'Electronics', 'Home decor', 'Books'],
            entertainment: ['Netflix subscription', 'Movie tickets', 'Concert', 'Gaming', 'Spotify'],
            health: ['Medicine', 'Gym membership', 'Doctor visit', 'vitamins', 'Health checkup'],
            education: ['Online course', 'Books', 'Workshop', 'Certification', 'Stationery'],
            others: ['Gift', 'Donation', 'Repair', 'Miscellaneous', 'Subscription']
        };

        // Generate 30 sample expenses
        for (let i = 0; i < 30; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const desc = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));

            Storage.addExpense({
                amount: Math.floor(Math.random() * 200) + 10,
                category: category,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                date: date.toISOString().split('T')[0],
                description: desc,
                notes: ''
            });
        }

        // Add sample income
        Storage.addIncome({ amount: 5000, description: 'Salary', date: new Date().toISOString() });
        Storage.addIncome({ amount: 500, description: 'Freelance', date: new Date().toISOString() });

        Utils.showToast('Sample data added successfully', 'success');
        this.loadDataStats();
    }
};

// Initialize if on settings page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('settings-page')) {
        Settings.init();
    }
});

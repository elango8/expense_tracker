/**
 * Expense Tracker - Transactions Module
 */

const Transactions = {
    currentPage: 1,
    itemsPerPage: 10,
    filters: { search: '', category: 'all', dateRange: 'all' },
    editingId: null,

    init() {
        this.loadTransactions();
        this.bindEvents();
    },

    bindEvents() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadTransactions();
            }, 300));
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Date filter
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }

        // Edit form submission
        const editForm = document.getElementById('edit-expense-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEdit();
            });
        }
    },

    loadTransactions() {
        const container = document.getElementById('transactions-list');
        if (!container) return;

        let expenses = Storage.getExpenses();
        expenses = this.applyFilters(expenses);

        if (expenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-receipt"></i></div>
                            <h4 class="empty-state-title">No transactions found</h4>
                            <p class="empty-state-description">
                                ${this.filters.search || this.filters.category !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first expense'}
                            </p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Paginate
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = expenses.slice(start, start + this.itemsPerPage);

        container.innerHTML = paginated.map(t => this.createTableRow(t)).join('');
        this.updatePagination(expenses.length);
        this.bindRowEvents();
    },

    applyFilters(expenses) {
        let filtered = [...expenses];

        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(e =>
                e.description?.toLowerCase().includes(search) ||
                e.category?.toLowerCase().includes(search)
            );
        }

        if (this.filters.category !== 'all') {
            filtered = filtered.filter(e => e.category === this.filters.category);
        }

        if (this.filters.dateRange !== 'all') {
            const now = new Date();
            let startDate;
            switch (this.filters.dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }
            if (startDate) {
                filtered = filtered.filter(e => new Date(e.date) >= startDate);
            }
        }

        return filtered;
    },

    createTableRow(transaction) {
        const category = Utils.getCategoryInfo(transaction.category);
        return `
            <tr data-id="${transaction.id}">
                <td>
                    <div class="flex items-center gap-3">
                        <div class="transaction-icon ${transaction.category}">
                            <i class="fas ${category.icon}"></i>
                        </div>
                        <span>${transaction.description || 'No description'}</span>
                    </div>
                </td>
                <td><span class="badge badge-${transaction.category}">${category.label}</span></td>
                <td class="transaction-amount expense">-${Utils.formatCurrency(transaction.amount)}</td>
                <td>${Utils.formatDate(transaction.date)}</td>
                <td>${transaction.paymentMethod || 'Cash'}</td>
                <td>
                    <div class="transaction-actions">
                        <button class="action-btn edit" title="Edit" onclick="Transactions.openEdit('${transaction.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete" onclick="Transactions.openDelete('${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    bindRowEvents() {
        // Additional row event bindings if needed
    },

    updatePagination(total) {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(total / this.itemsPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="btn btn-sm btn-secondary" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="Transactions.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="text-sm text-secondary">Page ${this.currentPage} of ${totalPages}</span>
            <button class="btn btn-sm btn-secondary" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="Transactions.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadTransactions();
    },

    openDelete(id) {
        this.editingId = id;
        Modal.open('delete-modal');
    },

    confirmDelete() {
        if (this.editingId) {
            Storage.deleteExpense(this.editingId);
            Utils.showToast('Transaction deleted successfully', 'success');
            this.editingId = null;
            Modal.close('delete-modal');
            this.loadTransactions();
        }
    },

    openEdit(id) {
        this.editingId = id;
        const expense = Storage.getExpenseById(id);
        if (!expense) return;

        document.getElementById('edit-amount').value = expense.amount;
        document.getElementById('edit-description').value = expense.description || '';
        document.getElementById('edit-category').value = expense.category;
        document.getElementById('edit-date').value = Utils.formatDate(expense.date, 'input');
        document.getElementById('edit-notes').value = expense.notes || '';

        Modal.open('edit-modal');
    },

    saveEdit() {
        if (!this.editingId) return;

        const updates = {
            amount: parseFloat(document.getElementById('edit-amount').value),
            description: document.getElementById('edit-description').value,
            category: document.getElementById('edit-category').value,
            date: document.getElementById('edit-date').value,
            notes: document.getElementById('edit-notes').value
        };

        Storage.updateExpense(this.editingId, updates);
        Utils.showToast('Transaction updated successfully', 'success');
        this.editingId = null;
        Modal.close('edit-modal');
        this.loadTransactions();
    }
};

// Initialize if on transactions page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transactions-page')) {
        Transactions.init();
    }
});

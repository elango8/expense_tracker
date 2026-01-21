/**
 * Expense Tracker - Dashboard Module
 */

const Dashboard = {
    chart: null,
    categoryChart: null,
    currentPeriod: 'month',

    init() {
        this.loadSummaryCards();
        this.loadRecentTransactions();
        this.initCharts();
        this.bindEvents();
    },

    bindEvents() {
        // Date filter buttons
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.date-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.refreshData();
            });
        });
    },

    loadSummaryCards() {
        const expenses = Storage.getExpensesByPeriod(this.currentPeriod);
        const totalExpenses = Storage.getTotalExpenses(expenses);
        const totalIncome = Storage.getTotalIncome();
        const balance = totalIncome - Storage.getTotalExpenses();

        // Update income card
        const incomeEl = document.getElementById('total-income');
        if (incomeEl) incomeEl.textContent = Utils.formatCurrency(totalIncome);

        // Update expenses card
        const expenseEl = document.getElementById('total-expenses');
        if (expenseEl) expenseEl.textContent = Utils.formatCurrency(totalExpenses);

        // Update balance card
        const balanceEl = document.getElementById('remaining-balance');
        if (balanceEl) {
            balanceEl.textContent = Utils.formatCurrency(balance);
            balanceEl.parentElement?.classList.toggle('negative', balance < 0);
        }

        // Update transaction count
        const countEl = document.getElementById('transaction-count');
        if (countEl) countEl.textContent = expenses.length;
    },

    loadRecentTransactions(limit = 5) {
        const transactions = Storage.getExpenses().slice(0, limit);
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-receipt"></i></div>
                    <h4 class="empty-state-title">No transactions yet</h4>
                    <p class="empty-state-description">Start tracking your expenses by adding your first transaction.</p>
                    <a href="add-expense.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add Expense
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(t => this.createTransactionItem(t)).join('');
    },

    createTransactionItem(transaction) {
        const category = Utils.getCategoryInfo(transaction.category);
        return `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-icon ${transaction.category}">
                    <i class="fas ${category.icon}"></i>
                </div>
                <div class="transaction-info">
                    <p class="transaction-name">${transaction.description || category.label}</p>
                    <div class="transaction-meta">
                        <span>${category.label}</span>
                        <span>•</span>
                        <span>${transaction.paymentMethod || 'Cash'}</span>
                    </div>
                </div>
                <div class="transaction-amount-wrapper">
                    <p class="transaction-amount expense">-${Utils.formatCurrency(transaction.amount)}</p>
                    <p class="transaction-date">${Utils.formatDate(transaction.date, 'relative')}</p>
                </div>
            </div>
        `;
    },

    initCharts() {
        this.initExpenseChart();
        this.initCategoryChart();
    },

    initExpenseChart() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;

        const monthlyData = Storage.getMonthlyData(6);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(d => d.month),
                datasets: [{
                    label: 'Expenses',
                    data: monthlyData.map(d => d.total),
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4caf50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => Utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        grid: { color: 'rgba(100, 116, 139, 0.1)' },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => '$' + value
                        }
                    }
                }
            }
        });
    },

    initCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;

        const categoryData = Storage.getExpensesByCategory();
        const labels = Object.keys(categoryData).map(k => Utils.getCategoryInfo(k).label);
        const data = Object.values(categoryData);
        const colors = Object.keys(categoryData).map(k => Utils.getCategoryInfo(k).color);

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${Utils.formatCurrency(ctx.raw)}`
                        }
                    }
                }
            }
        });

        // Render category legend
        this.renderCategoryLegend(categoryData);
    },

    renderCategoryLegend(categoryData) {
        const container = document.getElementById('category-legend');
        if (!container) return;

        const total = Object.values(categoryData).reduce((a, b) => a + b, 0);

        container.innerHTML = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([key, value]) => {
                const cat = Utils.getCategoryInfo(key);
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `
                    <div class="category-item">
                        <span class="category-dot" style="background: ${cat.color}"></span>
                        <div class="category-info">
                            <span class="category-name">${cat.label}</span>
                            <span class="category-amount">${Utils.formatCurrency(value)}</span>
                        </div>
                        <span class="category-percent">${percent}%</span>
                    </div>
                `;
            }).join('');
    },

    refreshData() {
        this.loadSummaryCards();
        if (this.chart) {
            const monthlyData = Storage.getMonthlyData(6);
            this.chart.data.labels = monthlyData.map(d => d.month);
            this.chart.data.datasets[0].data = monthlyData.map(d => d.total);
            this.chart.update();
        }
    }
};

// Initialize dashboard if on dashboard page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-page')) {
        Dashboard.init();
    }
});

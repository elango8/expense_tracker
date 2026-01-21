/**
 * Expense Tracker - Analytics Module
 */

const Analytics = {
    monthlyChart: null,
    categoryChart: null,
    trendChart: null,

    init() {
        this.loadSummaryStats();
        this.initCharts();
        this.bindEvents();
    },

    bindEvents() {
        // Year selector
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', () => this.refreshCharts());
        }
    },

    loadSummaryStats() {
        const expenses = Storage.getExpenses();
        const thisMonth = Storage.getExpensesByPeriod('month');
        const lastMonth = this.getLastMonthExpenses();

        const thisMonthTotal = Storage.getTotalExpenses(thisMonth);
        const lastMonthTotal = Storage.getTotalExpenses(lastMonth);
        const change = Utils.calculateChange(thisMonthTotal, lastMonthTotal);

        // Update stats
        const monthlySpendEl = document.getElementById('monthly-spend');
        if (monthlySpendEl) monthlySpendEl.textContent = Utils.formatCurrency(thisMonthTotal);

        const changeEl = document.getElementById('monthly-change');
        if (changeEl) {
            changeEl.innerHTML = `
                <i class="fas fa-${change >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(change)}% vs last month
            `;
            changeEl.className = `trend-indicator ${change >= 0 ? 'up' : 'down'}`;
        }

        const avgDaily = thisMonthTotal / new Date().getDate();
        const avgEl = document.getElementById('avg-daily');
        if (avgEl) avgEl.textContent = Utils.formatCurrency(avgDaily);

        const topCategory = this.getTopCategory(thisMonth);
        const topCatEl = document.getElementById('top-category');
        if (topCatEl && topCategory) {
            topCatEl.textContent = Utils.getCategoryInfo(topCategory).label;
        }
    },

    getLastMonthExpenses() {
        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        return Storage.getFilteredExpenses({
            startDate: lastMonthStart.toISOString(),
            endDate: lastMonthEnd.toISOString()
        });
    },

    getTopCategory(expenses) {
        const byCategory = Storage.getExpensesByCategory(expenses);
        let top = null;
        let max = 0;
        for (const [cat, amount] of Object.entries(byCategory)) {
            if (amount > max) {
                max = amount;
                top = cat;
            }
        }
        return top;
    },

    initCharts() {
        this.initMonthlyChart();
        this.initCategoryPieChart();
        this.initTrendChart();
    },

    initMonthlyChart() {
        const ctx = document.getElementById('monthly-chart');
        if (!ctx) return;

        const data = Storage.getMonthlyData(12);

        this.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Expenses',
                    data: data.map(d => d.total),
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => Utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: {
                        grid: { color: 'rgba(100, 116, 139, 0.1)' },
                        ticks: { color: '#64748b', callback: (v) => '$' + v }
                    }
                }
            }
        });
    },

    initCategoryPieChart() {
        const ctx = document.getElementById('category-pie-chart');
        if (!ctx) return;

        const categoryData = Storage.getExpensesByCategory();
        const labels = Object.keys(categoryData).map(k => Utils.getCategoryInfo(k).label);
        const data = Object.values(categoryData);
        const colors = Object.keys(categoryData).map(k => Utils.getCategoryInfo(k).color);

        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 15, usePointStyle: true, color: '#64748b' }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        padding: 12,
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((ctx.raw / total) * 100).toFixed(1);
                                return `${ctx.label}: ${Utils.formatCurrency(ctx.raw)} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    initTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        const weeklyData = this.getWeeklyTrend();

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.map(d => d.label),
                datasets: [{
                    label: 'Daily Spending',
                    data: weeklyData.map(d => d.total),
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        padding: 12,
                        callbacks: { label: (ctx) => Utils.formatCurrency(ctx.raw) }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: {
                        grid: { color: 'rgba(100, 116, 139, 0.1)' },
                        ticks: { color: '#64748b', callback: (v) => '$' + v }
                    }
                }
            }
        });
    },

    getWeeklyTrend() {
        const data = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const dayExpenses = Storage.getFilteredExpenses({
                startDate: date.toISOString(),
                endDate: nextDay.toISOString()
            });

            data.push({
                label: days[date.getDay()],
                total: Storage.getTotalExpenses(dayExpenses)
            });
        }

        return data;
    },

    refreshCharts() {
        if (this.monthlyChart) {
            const data = Storage.getMonthlyData(12);
            this.monthlyChart.data.labels = data.map(d => d.month);
            this.monthlyChart.data.datasets[0].data = data.map(d => d.total);
            this.monthlyChart.update();
        }
    }
};

// Initialize if on analytics page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('analytics-page')) {
        Analytics.init();
    }
});

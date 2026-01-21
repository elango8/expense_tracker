/**
 * Profile Page Module
 * Handles profile display and editing
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.getUser();

    // If no user, redirect to signup
    if (!user) {
        window.location.href = 'signup.html';
        return;
    }

    // Populate user data
    populateUserData(user);

    // Load stats
    loadProfileStats();

    // Setup edit functionality
    setupEditProfile();

    // Setup logout
    setupLogout();
});

function populateUserData(user) {
    // Profile header
    const avatarInitial = document.getElementById('avatar-initial');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const memberSince = document.getElementById('member-since');
    const sidebarName = document.getElementById('sidebar-name');
    const sidebarAvatar = document.getElementById('sidebar-avatar');

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
    const initial = (user.firstName || 'U').charAt(0).toUpperCase();

    if (avatarInitial) avatarInitial.textContent = initial;
    if (profileName) profileName.textContent = fullName;
    if (profileEmail) profileEmail.textContent = user.email || 'No email set';
    if (sidebarName) sidebarName.textContent = user.firstName || 'User';
    if (sidebarAvatar) sidebarAvatar.textContent = initial;

    if (memberSince && user.createdAt) {
        const date = new Date(user.createdAt);
        const options = { month: 'short', year: 'numeric' };
        memberSince.textContent = `Joined ${date.toLocaleDateString('en-US', options)}`;
    }

    // Personal info display
    const displayFirstname = document.getElementById('display-firstname');
    const displayLastname = document.getElementById('display-lastname');
    const displayEmail = document.getElementById('display-email');
    const displayPhone = document.getElementById('display-phone');

    if (displayFirstname) displayFirstname.textContent = user.firstName || '-';
    if (displayLastname) displayLastname.textContent = user.lastName || '-';
    if (displayEmail) displayEmail.textContent = user.email || '-';
    if (displayPhone) displayPhone.textContent = user.phone || '-';

    // Edit form fields
    const editFirstname = document.getElementById('edit-firstname');
    const editLastname = document.getElementById('edit-lastname');
    const editEmail = document.getElementById('edit-email');
    const editPhone = document.getElementById('edit-phone');

    if (editFirstname) editFirstname.value = user.firstName || '';
    if (editLastname) editLastname.value = user.lastName || '';
    if (editEmail) editEmail.value = user.email || '';
    if (editPhone) editPhone.value = user.phone || '';
}

function loadProfileStats() {
    // Get transactions from storage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Calculate stats
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += parseFloat(t.amount);
        } else {
            totalExpense += parseFloat(t.amount);
        }
    });

    const settings = JSON.parse(localStorage.getItem('settings')) || { currency: '$' };
    const currency = settings.currency || '$';

    const savingsRate = totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : 0;

    // Update UI
    const totalTransactions = document.getElementById('total-transactions');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const savingsRateEl = document.getElementById('savings-rate');

    if (totalTransactions) totalTransactions.textContent = transactions.length;
    if (totalIncomeEl) totalIncomeEl.textContent = `${currency}${totalIncome.toLocaleString()}`;
    if (totalExpenseEl) totalExpenseEl.textContent = `${currency}${totalExpense.toLocaleString()}`;
    if (savingsRateEl) savingsRateEl.textContent = `${savingsRate}%`;
}

function setupEditProfile() {
    const editBtn = document.getElementById('edit-personal-btn');
    const cancelBtn = document.getElementById('cancel-personal-edit');
    const infoDisplay = document.getElementById('personal-info-display');
    const editForm = document.getElementById('personal-info-form');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            infoDisplay?.classList.add('hidden');
            editForm?.classList.remove('hidden');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editForm?.classList.add('hidden');
            infoDisplay?.classList.remove('hidden');
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const userData = {
                firstName: document.getElementById('edit-firstname')?.value,
                lastName: document.getElementById('edit-lastname')?.value,
                email: document.getElementById('edit-email')?.value,
                phone: document.getElementById('edit-phone')?.value
            };

            const updatedUser = Auth.updateUser(userData);

            if (updatedUser) {
                populateUserData(updatedUser);
                editForm.classList.add('hidden');
                infoDisplay?.classList.remove('hidden');

                if (typeof showToast === 'function') {
                    showToast('Profile Updated', 'Your changes have been saved', 'success');
                }
            }
        });
    }

    // Edit profile button in header
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editBtn?.click();
            // Scroll to personal info section
            infoDisplay?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    }

    // Delete account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                if (confirm('This will permanently delete all your data. Continue?')) {
                    localStorage.clear();
                    window.location.href = '../index.html';
                }
            }
        });
    }
}

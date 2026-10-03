// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3000/api/expenses";

// DOM
const expensesTableBody = document.getElementById('expenses-table-body');
const expenseForm = document.getElementById('expense-form');
const editForm = document.getElementById('edit-form');
const categoryFilter = document.getElementById('category-filter');
const loadingSpinner = document.getElementById('loading-spinner');
const alertContainer = document.getElementById('alert-container');

// Summary Cards
const totalAmountCard = document.getElementById('total-amount');
const totalCountCard = document.getElementById('total-count');
const maxExpenseCard = document.getElementById('max-expense');


// Theme
const themeToggleBtn = document.getElementById('theme-toggle');



let currentExpenses = [];


document.addEventListener('DOMContentLoaded', refresh);

// ==========================================
// 1. API Calls (get, add, update, delete)
// ==========================================

async function getExpenses() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server Error`);
    }
    return await response.json();
}

async function addExpense(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to add the expense.');
    }
    return await response.json();
}

async function updateExpense(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to modify the expense.');
    }
    return await response.json();
}

async function deleteExpense(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to delete the expense.');
    }
    return await response.json();
}

// ==========================================
// 2. Orchestration & Rendering Functions
// ==========================================

async function refresh() {
    showSpinner(true);
    hideAlert();
    try {
        currentExpenses = await getExpenses();
        renderSummary(currentExpenses);
        applyFilter();
    } catch (error) {
        showAlert(error.message || 'Failed to connect to the server; ensure the backend is running.');
    } finally {
        showSpinner(false);
    }
}

function renderSummary(list) {
    if (!list || list.length === 0) {
        totalAmountCard.textContent = '$0.00';
        totalCountCard.textContent = '0';
        maxExpenseCard.textContent = '$0.00';
        return;
    }

    const total = list.reduce((sum, item) => sum + Number(item.amount), 0);
    const count = list.length;
    const max = Math.max(...list.map(item => Number(item.amount))); //...=> spread operator

    totalAmountCard.textContent = `$${total.toFixed(2)}`;
    totalCountCard.textContent = count;
    maxExpenseCard.textContent = `$${max.toFixed(2)}`;
}

function renderTable(list) {
    expensesTableBody.innerHTML = '';

    if (!list || list.length === 0) {
        expensesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">There are no expenses to display.</td>
      </tr>
    `;
        return;
    }

    list.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${escapeHtml(item.title)}</td>
      <td>$${Number(item.amount).toFixed(2)}</td>
      <td><span class="badge ${getCategoryBadgeClass(item.category)}">${item.category}</span></td>
      <td>${item.date}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id})">modify</button>
        <button class="btn btn-sm btn-outline-danger" onclick="handleDelete(${item.id})">Delete</button>
      </td>
    `;
        expensesTableBody.appendChild(tr);
    });
}

function applyFilter() {
    const selectedCategory = categoryFilter ? categoryFilter.value : 'All';
    if (selectedCategory === 'All' || !selectedCategory) {
        renderTable(currentExpenses);
    } else {
        const filtered = currentExpenses.filter(item => item.category === selectedCategory);
        renderTable(filtered);
    }
}

if (categoryFilter) {

    categoryFilter.addEventListener('change', applyFilter);
}

// ==========================================
// 3. Form Event Handlers
// ==========================================

if (expenseForm) {

    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const title = document.getElementById('title').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
            showAlert('Please fill in all fields correctly and ensure the amount is greater than zero.');
            return;
        }

        showSpinner(true);

        try {
            await addExpense({ title, amount, category, date });
            expenseForm.reset();
            await refresh();
        } catch (error) {
            showAlert(error.message);
        } finally {
            showSpinner(false);
        }
    });

}

function openEditModal(id) {
    const expense = currentExpenses.find(item => item.id === id);
    if (!expense) return;

    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-title').value = expense.title;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;

    const modalElement = document.getElementById('editModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const id = document.getElementById('edit-id').value;
        const title = document.getElementById('edit-title').value.trim();
        const amount = parseFloat(document.getElementById('edit-amount').value);
        const category = document.getElementById('edit-category').value;
        const date = document.getElementById('edit-date').value;

        if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
            alert('Please ensure the accuracy of the data entered for the modification.');
            return;
        }

        showSpinner(true);
        try {
            await updateExpense(id, { title, amount, category, date });

            const modalElement = document.getElementById('editModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

            await refresh();
        } catch (error) {
            showAlert(error.message);
        } finally {
            showSpinner(false);
        }
    });
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    hideAlert();
    showSpinner(true);
    try {
        await deleteExpense(id);
        await refresh();
    } catch (error) {
        showAlert(error.message);
    } finally {
        showSpinner(false);
    }
}

// ==========================================
// 4. Helper Functions (Spinner, Alert, Badge)
// ==========================================

function showSpinner(show) {
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('d-none', !show);
    }
}

function showAlert(message) {
    if (alertContainer) {
        alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    }
}

function hideAlert() {
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

function getCategoryBadgeClass(category) {
    switch (category) {
        case 'Food': return 'bg-success';
        case 'Transport': return 'bg-info text-dark';
        case 'Bills': return 'bg-warning text-dark';
        case 'Entertainment': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn)
        themeToggleBtn.textContent = '☀️ Light Mode';
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
}



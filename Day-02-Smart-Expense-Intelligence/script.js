
// 1. Get HTML elements
const expenseForm = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

// 2. Load saved transactions
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

// 3. Add transaction
expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!description || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date
    };

    transactions.push(transaction);

    saveTransactions();
    updateDashboard();

    expenseForm.reset();
});

// 4. Save transactions in LocalStorage
function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// Update dashboard
function updateDashboard() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    totalIncome.textContent = "₹" + income.toFixed(2);
    totalExpenses.textContent = "₹" + expenses.toFixed(2);
    totalBalance.textContent = "₹" + (income - expenses).toFixed(2);

    displayTransactions();
    updateCharts();
    updateInsights();
}


// Update all charts
function updateCharts() {

    // Category-wise expense totals
    const categoryTotals = {};

    transactions.forEach(function(transaction) {
        if (transaction.type === "expense") {
            categoryTotals[transaction.category] =
                (categoryTotals[transaction.category] || 0) +
                transaction.amount;
        }
    });

    // Expense doughnut chart
    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(
        document.getElementById("expenseChart"),
        {
            type: "doughnut",
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: [
                        "#10b981", "#3b82f6", "#f59e0b",
                        "#ef4444", "#8b5cf6", "#ec4899", "#64748b"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Income vs expenses chart
    let income = 0;
    let expenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    if (incomeExpenseChart) incomeExpenseChart.destroy();

    incomeExpenseChart = new Chart(
        document.getElementById("incomeExpenseChart"),
        {
            type: "bar",
            data: {
                labels: ["Income", "Expenses"],
                datasets: [{
                    label: "Amount (₹)",
                    data: [income, expenses],
                    backgroundColor: ["#10b981", "#ef4444"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Last 6 months spending trend
    const monthlyData = {};
    const monthLabels = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        const key = date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0");

        monthlyData[key] = 0;

        monthLabels.push({
            key: key,
            label: date.toLocaleString("en-IN", { month: "short" })
        });
    }

    transactions.forEach(function(transaction) {
        if (transaction.type === "expense") {
            const month = transaction.date.slice(0, 7);

            if (Object.hasOwn(monthlyData, month)) {
                monthlyData[month] += transaction.amount;
            }
        }
    });

    if (monthlyTrendChart) monthlyTrendChart.destroy();

    monthlyTrendChart = new Chart(
        document.getElementById("monthlyTrendChart"),
        {
            type: "line",
            data: {
                labels: monthLabels.map(function(month) {
                    return month.label;
                }),
                datasets: [{
                    label: "Monthly Expenses (₹)",
                    data: monthLabels.map(function(month) {
                        return monthlyData[month.key];
                    }),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16,185,129,0.15)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );
}


// Calculate monthly financial insights
function updateInsights() {

    const now = new Date();

    const currentMonth = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0");

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    const categoryTotals = {};

    transactions.forEach(function(transaction) {

        if (transaction.date.slice(0, 7) !== currentMonth) {
            return;
        }

        if (transaction.type === "income") {
            monthlyIncome += transaction.amount;
        } else {
            monthlyExpenses += transaction.amount;

            categoryTotals[transaction.category] =
                (categoryTotals[transaction.category] || 0) +
                transaction.amount;
        }
    });

    // Find highest spending category
    let topCategory = "None";
    let highestAmount = 0;

    for (const category in categoryTotals) {
        if (categoryTotals[category] > highestAmount) {
            highestAmount = categoryTotals[category];
            topCategory = category;
        }
    }

    // Average daily spending over elapsed calendar days
    const daysElapsed = now.getDate();
    const dailyAverage = monthlyExpenses / daysElapsed;

    document.getElementById("monthlyIncome").textContent =
        "₹" + monthlyIncome.toFixed(2);

    document.getElementById("monthlyExpenses").textContent =
        "₹" + monthlyExpenses.toFixed(2);

    document.getElementById("topCategory").textContent =
        topCategory;

    document.getElementById("dailyAverage").textContent =
        "₹" + dailyAverage.toFixed(2);
}


// 6. Display transactions

function displayTransactions() {
    const searchValue = document
        .getElementById("searchInput").value.toLowerCase();

    const typeFilter = document.getElementById("filterType").value;
    const categoryFilter = document.getElementById("filterCategory").value;

    transactionList.innerHTML = "";

    const filteredTransactions = transactions.filter(function(transaction) {
        const matchesSearch = transaction.description
            .toLowerCase()
            .includes(searchValue);

        const matchesType =
            typeFilter === "all" || transaction.type === typeFilter;

        const matchesCategory =
            categoryFilter === "all" || transaction.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = "<p>No matching transactions found.</p>";
        return;
    }

    filteredTransactions.slice().reverse().forEach(function(transaction) {
        const item = document.createElement("div");
        item.className = "transaction-item";

        item.innerHTML = `
            <div>
                <strong>${escapeHTML(transaction.description)}</strong>
                <p>${escapeHTML(transaction.category)} · ${escapeHTML(transaction.date)}</p>
            </div>

            <div>
                <strong>
                    ${transaction.type === "income" ? "+" : "-"}
                    ₹${transaction.amount.toFixed(2)}
                </strong>

                <button class="delete-btn" data-id="${transaction.id}">
                    Delete
                </button>
            </div>
        `;

        transactionList.appendChild(item);
    });
}


// 7. Basic HTML escaping for user-entered text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

// 8. Expense category chart
let expenseChart;
let incomeExpenseChart;
let monthlyTrendChart;

function updateCharts() {
    const categoryTotals = {};

    transactions.forEach(function(transaction) {
        if (transaction.type === "expense") {
            categoryTotals[transaction.category] =
                (categoryTotals[transaction.category] || 0) +
                transaction.amount;
        }
    });

    const expenseCanvas = document.getElementById("expenseChart");
    const incomeExpenseCanvas = document.getElementById("incomeExpenseChart");

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(expenseCanvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#64748b"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    let income = 0;
    let expenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    if (incomeExpenseChart) incomeExpenseChart.destroy();

    incomeExpenseChart = new Chart(incomeExpenseCanvas, {
        type: "bar",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                label: "Amount (₹)",
                data: [income, expenses],
                backgroundColor: ["#10b981", "#ef4444"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 9. Load dashboard when page opens
updateDashboard();

function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    updateDashboard();
}

// Search and filter events
document.getElementById("searchInput").addEventListener("input", displayTransactions);

document.getElementById("filterType").addEventListener("change", displayTransactions);

document.getElementById("filterCategory").addEventListener("change", displayTransactions);

// Delete button event
transactionList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        const id = Number(event.target.dataset.id);
        deleteTransaction(id);
    }
});

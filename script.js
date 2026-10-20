
let expenses = [];
let editIndex = -1;

// Get today's date in local time.
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load previously saved expenses.
function loadExpenses() {
    try {
        const savedExpenses = localStorage.getItem("expenses");

        if (savedExpenses) {
            const parsedExpenses = JSON.parse(savedExpenses);

            if (Array.isArray(parsedExpenses)) {
                expenses = parsedExpenses
                    .filter(expense =>
                        expense &&
                        typeof expense.name === "string" &&
                        Number.isFinite(Number(expense.amount)) &&
                        Number(expense.amount) > 0
                    )
                    .map(expense => ({
                        name: expense.name,
                        amount: Number(expense.amount),
                        category: expense.category || "Other",
                        // Support expenses saved before dates were added.
                        date: expense.date || ""
                    }));
            }
        }
    } catch (error) {
        console.error("Could not load saved expenses:", error);
        expenses = [];
    }
}

// Save expenses to browser storage.
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Update total spending and expense count.
function updateSummary() {
    const total = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
    }, 0);

    document.getElementById("total").textContent = total.toFixed(2);
    document.getElementById("count").textContent = expenses.length;
}

// Display expenses and apply the selected category filter.
function displayExpenses() {
    const list = document.getElementById("expenseList");
    const emptyMessage = document.getElementById("emptyMessage");
    const selectedCategory =
        document.getElementById("filterCategory").value;

    list.innerHTML = "";

    const visibleExpenses = expenses
        .map((expense, index) => ({ expense, index }))
        .filter(({ expense }) => {
            return selectedCategory === "All" ||
                expense.category === selectedCategory;
        });

    visibleExpenses.forEach(({ expense, index }) => {
        const item = document.createElement("li");
        item.className = "expense-item";

        const details = document.createElement("div");
        details.className = "expense-details";

        const name = document.createElement("p");
        name.className = "expense-name";
        name.textContent = expense.name;

        const meta = document.createElement("p");
        meta.className = "expense-meta";

        const formattedDate = expense.date
            ? new Date(`${expense.date}T12:00:00`).toLocaleDateString(
                undefined,
                { year: "numeric", month: "short", day: "numeric" }
            )
            : "Date not recorded";

        meta.textContent = `${expense.category} · ${formattedDate}`;

        const amount = document.createElement("p");
        amount.className = "expense-amount";
        amount.textContent = `$${Number(expense.amount).toFixed(2)}`;

        details.append(name, meta, amount);

        const actions = document.createElement("div");
        actions.className = "expense-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editExpense(index));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteExpense(index));

        actions.append(editButton, deleteButton);
        item.append(details, actions);
        list.appendChild(item);
    });

    emptyMessage.hidden = visibleExpenses.length !== 0;

    if (expenses.length === 0) {
        emptyMessage.textContent =
            "No expenses yet. Add your first expense above.";
    } else if (visibleExpenses.length === 0) {
        emptyMessage.textContent =
            "No expenses found in this category.";
    }

    updateSummary();
}

// Add a new expense or save changes to an existing one.
function addExpense(event) {
    event.preventDefault();

    const nameInput = document.getElementById("expense");
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("expenseDate");

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || !amountInput.value.trim() || !category || !date) {
        alert("Please complete all fields.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter an amount greater than zero.");
        return;
    }

    if (date > getTodayDate()) {
        alert("The expense date cannot be in the future.");
        return;
    }

    const expense = {
        name,
        amount,
        category,
        date
    };

    if (editIndex === -1) {
        expenses.push(expense);
    } else {
        expenses[editIndex] = expense;
    }

    saveExpenses();
    resetForm();
    displayExpenses();
}

// Load an expense into the form for editing.
function editExpense(index) {
    if (index < 0 || index >= expenses.length) {
        return;
    }

    const expense = expenses[index];

    document.getElementById("expense").value = expense.name;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("expenseDate").value =
        expense.date || getTodayDate();

    editIndex = index;

    document.getElementById("formTitle").textContent = "Edit Expense";
    document.getElementById("submitBtn").textContent = "Save Changes";
    document.getElementById("cancelEditBtn").hidden = false;

    document.getElementById("expense").focus();
}

// Delete an expense after asking for confirmation.
function deleteExpense(index) {
    if (index < 0 || index >= expenses.length) {
        return;
    }

    const confirmed = confirm(
        `Delete "${expenses[index].name}"? This action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    expenses.splice(index, 1);

    if (editIndex === index) {
        resetForm();
    } else if (editIndex > index) {
        editIndex--;
    }

    saveExpenses();
    displayExpenses();
}

// Reset the form and leave edit mode.
function resetForm() {
    editIndex = -1;

    document.getElementById("expenseForm").reset();
    document.getElementById("expenseDate").value = getTodayDate();
    document.getElementById("formTitle").textContent = "Add an Expense";
    document.getElementById("submitBtn").textContent = "Add Expense";
    document.getElementById("cancelEditBtn").hidden = true;
}

// Filter expenses by category.
function filterExpenses() {
    displayExpenses();
}

// Connect the form and filter controls.
document.getElementById("expenseForm").addEventListener("submit", addExpense);

document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

document.getElementById("filterCategory").addEventListener(
    "change",
    filterExpenses
);

// Start the application.
loadExpenses();
resetForm();
displayExpenses();

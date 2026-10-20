
let expenses = [];
let total = 0;
let editIndex = -1;

// Load saved expenses
let savedExpenses = localStorage.getItem("expenses");

if (savedExpenses) {
    try {
        expenses = JSON.parse(savedExpenses);

        if (!Array.isArray(expenses)) {
            expenses = [];
        }
    } catch (error) {
        expenses = [];
    }
}

// Calculate total spending
function calculateTotal() {
    total = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
    }, 0);
}

// Update total and expense count
function updateSummary() {
    calculateTotal();

    document.getElementById("total").textContent =
        total.toFixed(2);

    document.getElementById("count").textContent =
        expenses.length;
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Display expenses and apply category filter
function displayExpenses() {
    const list = document.getElementById("expenseList");
    const selectedCategory =
        document.getElementById("filterCategory").value;

    list.innerHTML = "";

    expenses.forEach((expense, index) => {
        if (
            selectedCategory !== "All" &&
            expense.category !== selectedCategory
        ) {
            return;
        }

        const item = document.createElement("li");

        const details = document.createElement("span");
        details.textContent =
            `${expense.name} - $${Number(expense.amount).toFixed(2)} - ${expense.category}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.onclick = () => EditExpense(index);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => DeleteExpense(index);

        item.append(details, editButton, deleteButton);
        list.appendChild(item);
    });

    updateSummary();
}

// Add a new expense or update an existing expense
function AddExpense() {
    const expenseInput = document.getElementById("expense");
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");

    const expense = expenseInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (
        expense === "" ||
        amountInput.value.trim() === "" ||
        category === ""
    ) {
        alert("Please enter an expense, amount, and category.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than zero.");
        return;
    }

    const expenseObject = {
        name: expense,
        amount: amount,
        category: category
    };

    if (editIndex === -1) {
        expenses.push(expenseObject);
    } else {
        expenses[editIndex] = expenseObject;
        editIndex = -1;
    }

    saveExpenses();
    displayExpenses();
    clearInputs();

    document.getElementById("submitBtn").textContent = "Add Expense";
    document.getElementById("cancelEditBtn").hidden = true;
}

// Clear input fields
function clearInputs() {
    document.getElementById("expense").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
}

// Edit an existing expense
function EditExpense(index) {
    if (index < 0 || index >= expenses.length) {
        return;
    }

    document.getElementById("expense").value =
        expenses[index].name;

    document.getElementById("amount").value =
        expenses[index].amount;

    document.getElementById("category").value =
        expenses[index].category;

    editIndex = index;

    document.getElementById("submitBtn").textContent = "Save Changes";
    document.getElementById("cancelEditBtn").hidden = false;
}

// Cancel editing
function cancelEdit() {
    editIndex = -1;
    clearInputs();

    document.getElementById("submitBtn").textContent = "Add Expense";
    document.getElementById("cancelEditBtn").hidden = true;
}

// Delete an expense after confirmation
function DeleteExpense(index) {
    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
        return;
    }

    if (index < 0 || index >= expenses.length) {
        return;
    }

    expenses.splice(index, 1);

    // Reset edit mode if the edited expense was deleted
    if (editIndex === index) {
        cancelEdit();
    } else if (editIndex > index) {
        editIndex--;
    }

    saveExpenses();
    displayExpenses();
}

// Filter expenses by category
function filterExpenses() {
    displayExpenses();
}

// Display saved expenses when the page loads
displayExpenses();

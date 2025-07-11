document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const subcategory = document.getElementById("subcategory").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;
  const description = document.getElementById("description").value;

  const expenseNote = {
    id: Date.now().toString(),
    category: "Expenses",
    title,
    subcategory,
    amount,
    currency,
    description,
    date: new Date().toISOString().split("T")[0]
  };

  // Save to localStorage under "notes" key
  const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  allNotes.push(expenseNote);
  localStorage.setItem("notes", JSON.stringify(allNotes));

  // Optional: Reset form
  e.target.reset();

  // Refresh UI or reload page
  alert("Expense added!");
  loadExpenses(); // Optional, if you're displaying a list
});

function loadExpenses() {
  const list = document.getElementById("expenseList");
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const expenses = notes.filter(note => note.category === "Expenses");

  if (expenses.length === 0) {
    list.innerHTML = "No expenses yet.";
    return;
  }

  list.innerHTML = "";
  expenses.forEach(note => {
    const li = document.createElement("li");
    li.textContent = `${note.title} - ${note.currency}${note.amount.toFixed(2)} (${note.subcategory})`;
    list.appendChild(li);
  });
}

window.onload = loadExpenses;
// Inside expenses.js

// ... (other code, e.g., form submission listener) ...

function addExpenseToDisplay(expense) {
    const expenseList = document.getElementById('expenseList'); // Get the <ul> element

    // Create the new list item (<li>) and its content
    const listItem = document.createElement('li');
    listItem.classList.add('expense-item'); // Add class for styling, if you have one

    // Populate the list item with expense details
    listItem.innerHTML = `
        <div class="expense-info">
            <span class="expense-date">${expense.date}</span>
            <span class="expense-title">${expense.title}</span>
            <span class="expense-category">${expense.subcategory}</span>
            <span class="expense-amount">${expense.currency} ${expense.amount.toFixed(2)}</span>
            <p class="expense-description">${expense.description || 'No description'}</p>
        </div>
        <div class="expense-actions">
            <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
            <button class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
    `;

    // --- THIS IS THE KEY CHANGE ---
    // Instead of: expenseList.appendChild(listItem);
    expenseList.prepend(listItem); // This adds the new item to the beginning of the list

    // Or, if you want to be more explicit with insertBefore:
    // const firstChild = expenseList.firstChild;
    // expenseList.insertBefore(listItem, firstChild);


    // Hide the "No expenses recorded yet" message if it's visible
    const noExpensesMessage = document.getElementById('noExpensesMessage');
    if (noExpensesMessage) {
        noExpensesMessage.style.display = 'none';
    }
}

// ... (rest of your expenses.js code, including loading saved expenses) ...

// Example of how you might call addExpenseToDisplay after a new expense is saved:
// document.getElementById('expenseForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//     const newExpense = {
//         date: document.getElementById('expenseDate').value,
//         title: document.getElementById('title').value,
//         subcategory: document.getElementById('subcategory').value,
//         amount: parseFloat(document.getElementById('amount').value),
//         currency: document.getElementById('currency').value,
//         description: document.getElementById('description').value
//     };
//
//     // Assuming you have a way to save to localStorage or a database
//     // saveExpense(newExpense);
//
//     addExpenseToDisplay(newExpense); // Display the new expense at the top
//
//     this.reset(); // Clear the form
// });

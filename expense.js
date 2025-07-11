// Function to generate a unique ID for notes
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Function to safely parse float
function parseAmount(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

// Global variable to hold ALL notes (expenses, income, casual)
// This array is the single source of truth for all notes across the application.
let allNotes = [];
let currentView = 'card'; // Default view for expenses page

// Get references to DOM elements
const expenseForm = document.getElementById('expenseForm');
const titleInput = document.getElementById('title');
const subcategorySelect = document.getElementById('subcategory');
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const expenseDateInput = document.getElementById('expenseDate'); // Added to get date from form

const cardViewContainer = document.getElementById('cardViewContainer');
const tableViewContainer = document.getElementById('tableViewContainer');
const expensesTableBody = document.getElementById('expensesTableBody');
const totalExpensesCell = document.getElementById('totalExpensesCell'); // This seems to be for a total row in the table

const cardViewBtn = document.getElementById('cardViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');

const noExpensesMessageCard = document.getElementById('noExpensesMessageCard'); // Assuming you have this div for card view
const noExpensesMessageTable = document.getElementById('noExpensesMessageTable'); // Assuming you have this for table view

// Export buttons (assuming they exist in your HTML)
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');


window.onload = function () {
    loadAllNotes(); // Load all notes from localStorage
    console.log("Expenses page loaded with notes:", allNotes); // Debugging log

    // Set today's date as default for the date input
    expenseDateInput.value = new Date().toISOString().split('T')[0];

    renderExpenses(currentView); // Filter and render only expense notes
    updateTotalsRow(); // Update totals based on current expenses

    // Add event listeners to export buttons
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportExpensesToCSV);
    }
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportExpensesToPDF);
    }
};

// --- Data Management Functions ---

/**
 * Loads all notes from localStorage into the global `allNotes` array.
 */
function loadAllNotes() {
    allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
}

/**
 * Saves the current state of the global `allNotes` array to localStorage.
 */
function saveAllNotes() {
    localStorage.setItem("notes", JSON.stringify(allNotes));
    console.log("All notes saved to localStorage:", allNotes); // Debugging log
}

// --- CRUD Operations ---

// Add Expense
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newExpense = {
        id: generateUniqueId(),
        date: expenseDateInput.value, // Get date from the form input
        category: 'Expenses', // Hardcoded for this page
        title: titleInput.value.trim(),
        subcategory: subcategorySelect.value,
        amount: parseAmount(amountInput.value),
        currency: currencySelect.value,
        description: '' // No description field in form, so leave empty
    };

    if (newExpense.title === "" || newExpense.amount <= 0) {
        alert("Please enter a valid title and amount (greater than 0).");
        return;
    }

    allNotes.push(newExpense); // Add new expense to the main allNotes array
    saveAllNotes();            // IMPORTANT: Save the entire allNotes array after adding!
    renderExpenses(currentView); // Re-render with the new expense
    updateTotalsRow();
    expenseForm.reset();       // Clear the form
    expenseDateInput.value = new Date().toISOString().split('T')[0]; // Reset date to today
});

// Delete Expense (made globally accessible for onclick in HTML)
window.deleteExpense = function(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        // Filter out the note with the given ID from allNotes
        allNotes = allNotes.filter(note => note.id !== id);
        saveAllNotes();            // IMPORTANT: Save the updated allNotes array after deleting!
        renderExpenses(currentView); // Re-render to reflect deletion
        updateTotalsRow();
    }
};

// --- Rendering Functions ---

/**
 * Renders only the 'Expenses' category notes into both card and table views.
 * @param {'card'|'table'} viewType - The current view mode ('card' or 'table').
 */
function renderExpenses(viewType = currentView) {
    cardViewContainer.innerHTML = ''; // Clear card container
    expensesTableBody.innerHTML = ''; // Clear table body

    // Filter only expense notes for rendering on this page, then reverse for LIFO (newest first) display
    const expensesToRender = allNotes.filter(note => note.category === "Expenses").reverse();

    if (expensesToRender.length === 0) {
        const noExpensesMessage = "No expenses added yet. Use the form above to add your first expense!";
        // Show/hide messages based on their existence in the HTML
        if (noExpensesMessageCard) {
            noExpensesMessageCard.innerHTML = `<p>${noExpensesMessage}</p>`;
            noExpensesMessageCard.style.display = 'block';
        }
        if (noExpensesMessageTable) {
            noExpensesMessageTable.innerHTML = `<tr><td colspan="8" class="no-notes-message" style="text-align: center; color: #777;">${noExpensesMessage}</td></tr>`;
            noExpensesMessageTable.style.display = 'table-row'; // Use table-row for table messages
        }
        switchView(viewType, false); // Just switch visibility, no re-rendering
        return;
    } else {
        // Hide "no expenses" messages if there are expenses to display
        if (noExpensesMessageCard) noExpensesMessageCard.style.display = 'none';
        if (noExpensesMessageTable) noExpensesMessageTable.style.display = 'none';
    }

    let serialNo = 1;
    expensesToRender.forEach(expense => {
        // --- Render as Card ---
        const cardDiv = document.createElement("div");
        cardDiv.className = 'expense-card';
        cardDiv.innerHTML = `
            <h4>${expense.title || 'No Title'}</h4>
            <p><strong>Subcategory:</strong> ${expense.subcategory || '-'}</p>
            <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
            ${expense.description ? `<p><strong>Description:</strong> ${expense.description}</p>` : ''}
            <p class="card-amount">${expense.currency} ${expense.amount ? expense.amount.toFixed(2) : '0.00'}</p>
            <div class="card-actions">
                <button onclick="deleteExpense('${expense.id}')" title="Delete Expense"><i class="fas fa-trash-alt"></i></button>
                </div>
        `;
        cardViewContainer.appendChild(cardDiv);

        // --- Render as Table Row ---
        const row = document.createElement("tr");
        row.className = 'expense-row'; // Specific class for expense rows
        row.innerHTML = `
            <td>${serialNo++}</td>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.title || '-'}</td>
            <td>${expense.subcategory || '-'}</td>
            <td>${expense.description || '-'}</td>
            <td>${expense.currency || '-'}</td>
            <td>${expense.amount ? expense.amount.toFixed(2) : '0.00'}</td>
            <td>
                <button onclick="deleteExpense('${expense.id}')" class="table-action-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
        `;
        expensesTableBody.appendChild(row);
    });

    switchView(viewType, false); // Set initial visibility without re-rendering
}

// --- Totals Calculation ---
/**
 * Updates the total expenses displayed in the dashboard or table footer.
 */
function updateTotalsRow() {
    let totalExpenses = 0;
    // Filter only expense notes for calculation
    const currentExpenses = allNotes.filter(note => note.category === "Expenses");
    currentExpenses.forEach(expense => {
        totalExpenses += parseAmount(expense.amount);
    });
    // Ensure the element exists before trying to set textContent
    if (totalExpensesCell) {
        totalExpensesCell.textContent = totalExpenses.toFixed(2);
    }
}

// --- View Switching Logic ---
/**
 * Switches between card and table views for displaying expenses.
 * @param {'card'|'table'} viewType - The view mode to switch to.
 * @param {boolean} triggerRender - Whether to re-render notes after switching view.
 */
function switchView(viewType, triggerRender = true) {
    currentView = viewType; // Update global state

    // Update button active state
    cardViewBtn.classList.remove('active-view');
    tableViewBtn.classList.remove('active-view');

    if (viewType === 'card') {
        cardViewBtn.classList.add('active-view');
        cardViewContainer.classList.remove('hidden-view');
        tableViewContainer.classList.add('hidden-view');
    } else { // viewType === 'table'
        tableViewBtn.classList.add('active-view');
        cardViewContainer.classList.add('hidden-view');
        tableViewContainer.classList.remove('hidden-view');
    }

    // Re-render notes only if triggered by button click, not on initial load
    if (triggerRender) {
        renderExpenses(currentView); // Ensure it re-renders based on current viewType
    }
}

// Event listeners for view toggle buttons
cardViewBtn.addEventListener('click', () => switchView('card'));
tableViewBtn.addEventListener('click', () => switchView('table'));

// --- Export Functions (Specific to Expenses) ---

/**
 * Exports current expense notes to a CSV file.
 */
function exportExpensesToCSV() {
    const expensesToExport = allNotes.filter(note => note.category === "Expenses"); // Filter for export

    if (expensesToExport.length === 0) {
        alert("No expenses to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "S.No.,Date,Title,Subcategory,Description,Currency,Amount\n"; // Header row

    let serialNo = 1;
    // Export in LIFO order (newest first) for consistency with display
    [...expensesToExport].reverse().forEach(expense => { // Use spread to avoid modifying original array
        const date = new Date(expense.date).toLocaleDateString();
        // Escape double quotes in string fields
        const title = `"${(expense.title || '').replace(/"/g, '""')}"`;
        const subcategory = `"${(expense.subcategory || '').replace(/"/g, '""')}"`;
        const description = `"${(expense.description || '').replace(/"/g, '""')}"`;
        const currency = `"${(expense.currency || '').replace(/"/g, '""')}"`;
        const amount = expense.amount ? expense.amount.toFixed(2) : '0.00';

        const row = `${serialNo++},${date},${title},${subcategory},${description},${currency},${amount}\n`;
        csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "notenest_expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exports current expense notes to a PDF file using jsPDF and autoTable.
 */
function exportExpensesToPDF() {
    // Ensure jsPDF is loaded
    if (typeof window.jsPDF === 'undefined' || typeof window.jspdf.plugin.autotable === 'undefined') {
        alert("PDF export libraries not loaded. Please ensure jspdf.umd.min.js and jspdf.plugin.autotable.js are correctly linked.");
        return;
    }

    const expensesToExport = allNotes.filter(note => note.category === "Expenses"); // Filter for export

    if (expensesToExport.length === 0) {
        alert("No expenses to export!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tableData = [];
    let serialNo = 1;
    // Export in LIFO order (newest first) for consistency with display
    [...expensesToExport].reverse().forEach(expense => { // Use spread to avoid modifying original array
        tableData.push([
            serialNo++,
            new Date(expense.date).toLocaleDateString(),
            expense.title || '-',
            expense.subcategory || '-',
            expense.description || '-',
            expense.currency || '-',
            expense.amount ? expense.amount.toFixed(2) : '0.00'
        ]);
    });

    const headers = [
        ["S.No.", "Date", "Title", "Subcategory", "Description", "Currency", "Amount"] // Removed '₹' from Amount header, currency is its own column
    ];

    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 20,
        headStyles: { fillColor: [59, 139, 111], textColor: [255, 255, 255] },
        didDrawPage: function(data) {
            doc.setFontSize(18);
            doc.setTextColor(59, 139, 111);
            doc.text("NoteNest - Expenses Report", data.settings.margin.left, 15);
        },
        styles: {
            fontSize: 10,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' }, // S.No.
            1: { cellWidth: 20, halign: 'center' }, // Date
            2: { cellWidth: 30 }, // Title
            3: { cellWidth: 25 }, // Subcategory
            4: { cellWidth: 40 }, // Description
            5: { cellWidth: 20, halign: 'center' }, // Currency
            6: { cellWidth: 25, halign: 'right' }  // Amount
        }
    });

    const finalY = doc.autoTable.previous.finalY;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    // Ensure the total is correctly calculated and referenced
    const currentTotalExpenses = allNotes
        .filter(note => note.category === "Expenses")
        .reduce((sum, note) => sum + parseAmount(note.amount), 0)
        .toFixed(2);
    doc.text(`Total Expenses: ₹${currentTotalExpenses}`, data.settings.margin.left, finalY + 10);

    doc.save("notenest_expenses_report.pdf");
}
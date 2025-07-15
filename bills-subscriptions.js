// Add this line at the very beginning of your JS file
console.log("bills-subscriptions.js is running and loaded!");


// Subcategories for each main category
const subcategoryMap = {
    "OTT": ["Netflix", "Amazon Prime", "Hotstar", "SonyLIV", "Zee5", "YouTube Premium", "Apple TV+", "Others"],
    "Home Bills": ["Electricity", "Water", "Gas", "Rent", "Maintenance", "Others"],
    "Education": ["School Fees", "Online Courses", "Books", "Others"],
    "EMI/Loans": ["Car Loan", "Home Loan", "Personal Loan", "Credit Card EMI", "Others"],
    "Fitness & Wellness": ["Gym", "Yoga", "Meditation", "Others"],
    "Internet & Mobile": ["Internet", "Mobile Recharge", "Others"],
    "Others": ["Others"]
};

// Global variable to keep track of the current view (card or table)
let currentView = "card"; // Default view

/**
 * Safely gets an HTML element by ID and logs an error if not found.
 * This helps pinpoint if an element is missing in the HTML.
 * @param {string} id The ID of the element to retrieve.
 * @returns {HTMLElement|null} The element if found, otherwise null.
 */
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Error: HTML element with ID "${id}" not found. Please check your HTML file.`);
    }
    return element;
}

// Populate subcategories dropdown based on main category selection
function populateSubcategories() {
    const mainCatSelect = getElement("mainCategory");
    const subCatSelect = getElement("subCategory");
    const customSubCategoryInput = getElement("customSubCategory");

    if (!mainCatSelect || !subCatSelect || !customSubCategoryInput) return;

    const mainCat = mainCatSelect.value;
    subCatSelect.innerHTML = '<option value="" disabled selected>Select Subcategory</option>';

    if (subcategoryMap[mainCat]) {
        subcategoryMap[mainCat].forEach(sc => {
            const opt = document.createElement("option");
            opt.value = sc;
            opt.textContent = sc;
            subCatSelect.appendChild(opt);
        });
    }
    customSubCategoryInput.style.display = "none"; // Ensure custom input is hidden by default
}

// Show/hide custom subcategory textbox if "Others" is selected
function toggleCustomSubcategory() {
    const subCatSelect = getElement("subCategory");
    const customSubCategoryInput = getElement("customSubCategory");
    if (!subCatSelect || !customSubCategoryInput) return;

    const selected = subCatSelect.value;
    customSubCategoryInput.style.display = (selected === "Others") ? "block" : "none";
}

// Show/hide custom payment type textbox if "Others" is selected
function toggleCustomPaymentType() {
    const paymentTypeSelect = getElement("paymentType");
    const customPaymentTypeInput = getElement("customPaymentType");
    if (!paymentTypeSelect || !customPaymentTypeInput) return;

    const selected = paymentTypeSelect.value;
    customPaymentTypeInput.style.display = (selected === "Others") ? "block" : "none";
}

// --- Bill/Subscription Form Submission Logic ---
const billForm = getElement("billForm");
if (billForm) {
    billForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        // Safely get all form elements by their IDs
        const dateInput = getElement("date");
        const mainCategorySelect = getElement("mainCategory");
        const subCategorySelect = getElement("subCategory");
        const customSubCategoryInput = getElement("customSubCategory");
        const titleInput = getElement("title");
        const descriptionInput = getElement("description");
        const amountInput = getElement("amount");
        const currencyCountrySelect = getElement("currencyCountry");
        const typeSelect = getElement("type"); // This is "Expense" or "Income"
        const autopayCheckbox = getElement("autopay");
        const paymentTypeSelect = getElement("paymentType");
        const customPaymentTypeInput = getElement("customPaymentType");

        // Basic validation: Check if essential form elements are present
        if (!dateInput || !mainCategorySelect || !subCategorySelect || !titleInput ||
            !amountInput || !currencyCountrySelect || !typeSelect || !paymentTypeSelect) {
            console.error("Critical form elements are missing. Cannot process submission.");
            alert("Please ensure all required form fields are present in the HTML and have correct IDs.");
            return;
        }

        let currency = '';
        let country = '';
        if (currencyCountrySelect.value === "Others") {
            // Handle "Others" for currencyCountry - you might want a dedicated input for this
            currency = 'Unknown Currency';
            country = 'Unknown Country';
        } else {
            [currency, country] = currencyCountrySelect.value.split(" - ");
            country = country || "Unknown"; // Fallback if split doesn't yield a country
        }


        // Determine the final subcategory value (either selected or custom)
        let subcategoryValue = subCategorySelect.value;
        if (subcategoryValue === "Others" && customSubCategoryInput) {
            const custom = customSubCategoryInput.value.trim();
            if (custom) subcategoryValue = custom;
        }

        // Determine the final payment type value (either selected or custom)
        let paymentType = paymentTypeSelect.value;
        if (paymentType === "Others" && customPaymentTypeInput) {
            const custom = customPaymentTypeInput.value.trim();
            if (custom) paymentType = custom;
        }

        // Validate and parse the amount to ensure it's a valid positive number
        const amountValue = parseFloat(amountInput.value);
        if (isNaN(amountValue) || amountValue <= 0) {
            console.error("Invalid amount entered:", amountInput.value);
            alert("Please enter a valid positive numeric amount for the bill/subscription.");
            return;
        }

        // Create the new bill object
        const newBill = {
            id: Date.now(), // Unique ID for later deletion/editing
            date: dateInput.value,
            mainCategory: mainCategorySelect.value,
            subCategory: subcategoryValue,
            title: titleInput.value.trim(),
            description: descriptionInput ? descriptionInput.value.trim() : '',
            amount: amountValue,
            currencyCountry: `${currency} - ${country}`,
            type: typeSelect.value, // "Expense" or "Income"
            autopay: autopayCheckbox ? autopayCheckbox.checked : false,
            paymentType: paymentType
        };

        try {
            // --- Save to 'bills' in localStorage ---
            const bills = JSON.parse(localStorage.getItem("bills") || "[]");
            bills.push(newBill);
            localStorage.setItem("bills", JSON.stringify(bills));
            console.log("Successfully saved bill to 'bills' in localStorage:", newBill);

            // --- Also save a simplified version to 'notes' for reports ---
            // For a 'Bills & Subscriptions' page, typically all entries are considered expenses for reporting.
            const notes = JSON.parse(localStorage.getItem("notes") || "[]");
            notes.push({
                date: newBill.date,
                title: newBill.title,
                description: newBill.description,
                amount: newBill.amount,
                category: "Expenses", // For reports, classifying as Expense
                subcategory: `Bills & Subscriptions - ${newBill.mainCategory} > ${newBill.subCategory}`,
                currency: currency,
                country: country
            });
            localStorage.setItem("notes", JSON.stringify(notes));
            console.log("Successfully saved expense to 'notes' in localStorage:", notes[notes.length - 1]);

        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            alert("Failed to save bill. Please check the browser console for details.");
            return; // Stop execution if localStorage save fails
        }

        // --- Reset form and update display after successful save ---
        this.reset();
        if (dateInput) {
            dateInput.value = new Date().toISOString().split("T")[0]; // Reset date to current
        }
        populateSubcategories(); // Re-initialize subcategory dropdown
        toggleCustomPaymentType(); // Hide custom payment type input if it was visible
        console.log("Form reset. Calling loadBills() to update the display.");
        loadBills(); // Reload bills to display the new entry
    });
} else {
    console.error("Initialization Error: The form with ID 'billForm' was not found.");
}

// --- Load and Display Bills ---
function loadBills() {
    const tbody = getElement("billsTableBody");
    const cardViewContainer = getElement("cardViewContainer");
    const noBillsMessage = getElement("noBillsMessage");
    const totalBillsCell = getElement("totalBillsCell");

    if (!tbody || !cardViewContainer || !noBillsMessage || !totalBillsCell) {
        console.error("Missing display elements. Cannot load bills.");
        return;
    }

    try {
        const bills = JSON.parse(localStorage.getItem("bills") || "[]");
        console.log("Bills retrieved from localStorage:", bills);

        const filterMonthSelect = getElement("filterMonth");
        const filterYearSelect = getElement("filterYear");
        const selectedMonth = filterMonthSelect?.value || "all";
        const selectedYear = filterYearSelect?.value || "all";

        const filteredBills = bills.filter(bill => {
            const d = new Date(bill.date);
            const matchMonth = selectedMonth === "all" || d.getMonth() === parseInt(selectedMonth);
            const matchYear = selectedYear === "all" || d.getFullYear() === parseInt(selectedYear);
            return matchMonth && matchYear;
        });

        // Calculate total for expenses
        let totalExpenses = 0;
        filteredBills.forEach(bill => {
            if (bill.type === "Expense") {
                totalExpenses += bill.amount;
            }
        });
        totalBillsCell.textContent = totalExpenses.toFixed(2);

        // Show/hide no bills message
        if (filteredBills.length === 0) {
            noBillsMessage.style.display = "block";
            tbody.innerHTML = ''; // Ensure table is empty
            cardViewContainer.innerHTML = ''; // Ensure cards are empty
            return;
        } else {
            noBillsMessage.style.display = "none";
        }

        // Render based on current view
        if (currentView === "table") {
            renderBillsTable(filteredBills, tbody);
            cardViewContainer.innerHTML = ''; // Clear card view
        } else { // Default to card view
            renderBillsCards(filteredBills, cardViewContainer);
            tbody.innerHTML = ''; // Clear table view
        }

        console.log(`Displayed ${filteredBills.length} filtered bills.`);
    } catch (error) {
        console.error("Error loading or parsing bills from localStorage:", error);
        tbody.innerHTML = `<tr><td colspan="11" style="color: red;">Error loading bills. Check console for details.</td></tr>`;
        cardViewContainer.innerHTML = `<p style="color: red;">Error loading bills. Check console for details.</p>`;
    }
}

// Render bills in table format
function renderBillsTable(bills, tbody) {
    tbody.innerHTML = ""; // Clear existing rows
    bills.forEach((bill, index) => {
        const row = document.createElement("tr");
        row.dataset.id = bill.id; // Store ID for potential future actions
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(bill.date).toLocaleDateString()}</td>
            <td>${bill.mainCategory || '-'}</td>
            <td>${bill.subCategory || '-'}</td>
            <td>${bill.title || '-'}</td>
            <td>${(bill.amount || 0).toFixed(2)}</td>
            <td>${bill.type || '-'}</td>
            <td>${bill.currencyCountry.split(' - ')[0] || '-'}</td> <td>${bill.paymentType || "-"}</td>
            <td>${bill.autopay ? "Yes" : "No"}</td>
            <td>${bill.description || "-"}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${bill.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${bill.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    // Attach event listeners for delete buttons
    tbody.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteBill);
    });
    // Attach event listeners for edit buttons (implement handleDeleteBill separately)
    tbody.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditBill);
    });
}

// Render bills in card format
function renderBillsCards(bills, container) {
    container.innerHTML = ""; // Clear existing cards
    bills.forEach(bill => {
        const card = document.createElement("div");
        card.classList.add("bill-card");
        card.dataset.id = bill.id; // Store ID for potential future actions
        card.innerHTML = `
            <div class="card-header">
                <h3>${bill.title || 'No Title'}</h3>
                <span class="bill-amount">${(bill.amount || 0).toFixed(2)} ${bill.currencyCountry.split(' - ')[0] || ''}</span>
            </div>
            <div class="card-body">
                <p><strong>Due Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
                <p><strong>Category:</strong> ${bill.mainCategory} > ${bill.subCategory || 'N/A'}</p>
                <p><strong>Type:</strong> <span class="bill-type ${bill.type.toLowerCase()}">${bill.type}</span></p>
                <p><strong>Payment:</strong> ${bill.paymentType || 'N/A'}</p>
                <p><strong>Autopay:</strong> ${bill.autopay ? 'Yes' : 'No'}</p>
                ${bill.description ? `<p class="bill-description">${bill.description}</p>` : ''}
            </div>
            <div class="card-actions">
                <button class="action-btn edit-btn" data-id="${bill.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" data-id="${bill.id}"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    // Attach event listeners for delete buttons
    container.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteBill);
    });
    // Attach event listeners for edit buttons
    container.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditBill);
    });
}

// Function to handle bill deletion
function handleDeleteBill(event) {
    const billIdToDelete = parseInt(event.currentTarget.dataset.id);
    if (!confirm("Are you sure you want to delete this bill/subscription?")) {
        return;
    }

    try {
        let bills = JSON.parse(localStorage.getItem("bills") || "[]");
        const initialLength = bills.length;
        bills = bills.filter(bill => bill.id !== billIdToDelete);
        localStorage.setItem("bills", JSON.stringify(bills));

        if (bills.length < initialLength) {
            console.log(`Bill with ID ${billIdToDelete} deleted.`);
            alert("Bill deleted successfully!");
        } else {
            console.warn(`Bill with ID ${billIdToDelete} not found for deletion.`);
        }
        loadBills(); // Reload the list after deletion
    } catch (error) {
        console.error("Error deleting bill from localStorage:", error);
        alert("There was an error deleting the bill.");
    }
}

// Function to handle bill editing (placeholder)
function handleEditBill(event) {
    const billIdToEdit = parseInt(event.currentTarget.dataset.id);
    alert(`Edit functionality for Bill ID: ${billIdToEdit} (Not yet implemented)`);
    // Here you would typically populate the form with the bill's data
    // and change the form button to "Update" instead of "Add"
}


// Populate the year filter dropdown (e.g., from 2020 to the current year + 1)
function populateYearDropdown() {
    const yearSelect = getElement("filterYear");
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="all">All</option>';
    // Loop to include years from 2020 up to the current year + 1 (for future planning)
    for (let y = currentYear + 1; y >= 2020; y--) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }
}

// --- View Toggling Functions ---
function toggleView(viewType) {
    const cardViewBtn = getElement("cardViewBtn");
    const tableViewBtn = getElement("tableViewBtn");
    const cardViewContainer = getElement("cardViewContainer");
    const tableViewContainer = getElement("tableViewContainer");

    if (!cardViewBtn || !tableViewBtn || !cardViewContainer || !tableViewContainer) {
        console.error("View toggle elements not found.");
        return;
    }

    // Update active class on buttons
    if (viewType === "card") {
        cardViewBtn.classList.add("active-view");
        tableViewBtn.classList.remove("active-view");
        cardViewContainer.classList.remove("hidden-view");
        tableViewContainer.classList.add("hidden-view");
        currentView = "card";
    } else if (viewType === "table") {
        tableViewBtn.classList.add("active-view");
        cardViewBtn.classList.remove("active-view");
        tableViewContainer.classList.remove("hidden-view");
        cardViewContainer.classList.add("hidden-view");
        currentView = "table";
    }
    loadBills(); // Reload bills to display in the new view
}

// --- Export Functions (Stubs - detailed implementation depends on your requirements) ---

function exportToCsv() {
    const bills = JSON.parse(localStorage.getItem("bills") || "[]");
    if (bills.length === 0) {
        alert("No bills to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // Add header row
    csvContent += "ID,Date,Main Category,Subcategory,Title,Description,Amount,Currency,Country,Type,Autopay,Payment Type\n";

    // Add data rows
    bills.forEach(bill => {
        let row = [
            bill.id,
            new Date(bill.date).toLocaleDateString(),
            bill.mainCategory,
            bill.subCategory,
            `"${bill.title.replace(/"/g, '""')}"`, // Handle commas and quotes in title
            `"${(bill.description || '').replace(/"/g, '""')}"`, // Handle commas and quotes in description
            bill.amount.toFixed(2),
            bill.currencyCountry.split(' - ')[0],
            bill.currencyCountry.split(' - ')[1],
            bill.type,
            bill.autopay ? "Yes" : "No",
            bill.paymentType
        ].join(',');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bills_subscriptions.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    alert("Bills exported to CSV!");
}

function exportToPdf() {
    const bills = JSON.parse(localStorage.getItem("bills") || "[]");
    if (bills.length === 0) {
        alert("No bills to export!");
        return;
    }

    // Assuming jsPDF and jspdf-autotable are loaded
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tableColumn = ["S.No.", "Due Date", "Category", "Subcategory", "Title", "Amount", "Type", "Currency", "Payment", "Autopay"];
    const tableRows = [];

    bills.forEach((bill, index) => {
        const billData = [
            index + 1,
            new Date(bill.date).toLocaleDateString(),
            bill.mainCategory,
            bill.subCategory,
            bill.title,
            (bill.amount || 0).toFixed(2),
            bill.type,
            bill.currencyCountry.split(' - ')[0],
            bill.paymentType,
            bill.autopay ? "Yes" : "No"
        ];
        tableRows.push(billData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Bills & Subscriptions Report", 14, 15);
    doc.save("bills_subscriptions_report.pdf");
    alert("Bills exported to PDF!");
}


// --- Page Initialization on Load ---
window.onload = () => {
    console.log("Page fully loaded. Starting initialization...");

    const dateInput = getElement("date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0]; // Set default date input to today
    }

    // Initialize dropdowns and load existing data
    populateSubcategories();
    populateYearDropdown();
    // Ensure the correct view is displayed initially
    toggleView(currentView); // This will call loadBills() internally

    // Attach event listeners to filter controls
    getElement("filterMonth")?.addEventListener("change", loadBills);
    getElement("filterYear")?.addEventListener("change", loadBills);

    // Attach event listeners for custom input toggles
    getElement("paymentType")?.addEventListener("change", toggleCustomPaymentType);
    getElement("subCategory")?.addEventListener("change", toggleCustomSubcategory);

    // Attach event listeners for view toggles
    getElement("cardViewBtn")?.addEventListener("click", () => toggleView("card"));
    getElement("tableViewBtn")?.addEventListener("click", () => toggleView("table"));

    // Attach event listeners for export buttons
    getElement("exportCsvBtn")?.addEventListener("click", exportToCsv);
    getElement("exportPdfBtn")?.addEventListener("click", exportToPdf);

    console.log("Initialization complete. Ready for user interaction.");
};

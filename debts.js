    // Add this line at the very beginning of your JS file to confirm it's loading
    console.log("debts.js is running and loaded!");

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

    // Function to toggle custom lender input based on debt type selection
    function toggleLenderInput() {
        // In this debts.html, there isn't a specific custom input for "Other" lenders,
        // so this function might not be strictly necessary unless you add one later.
        // However, the `onchange="toggleLenderInput()"` is present in HTML, so we define it.
        // If you intend to have a custom lender input when "Other" is selected in Type,
        // you would add an input field in HTML and logic here to show/hide it.
        // For now, it just ensures the function exists as referenced in HTML.
        console.log("Debt type changed. If 'Other' type required a custom lender input, its visibility would be handled here.");
    }

    // --- Debt/Loan Form Submission Logic ---
    const debtForm = getElement("debtForm");
    if (debtForm) {
        debtForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent default form submission

            // Safely get all form elements by their IDs
            const debtDateInput = getElement("debtDate");
            const titleInput = getElement("title");
            const typeSelect = getElement("type");
            const lenderInput = getElement("lender");
            const amountInput = getElement("amount");
            const currencySelect = getElement("currency");
            const interestRateInput = getElement("interestRate");
            const repaymentTermInput = getElement("repaymentTerm");
            const descriptionInput = getElement("description");

            // Basic validation: Check if essential form elements are present
            if (!debtDateInput || !titleInput || !typeSelect || !amountInput || !currencySelect) {
                console.error("Critical form elements are missing. Cannot process submission.");
                alert("Please ensure all required form fields are present in the HTML and have correct IDs.");
                return;
            }

            // Validate and parse the amount to ensure it's a valid positive number
            const amountValue = parseFloat(amountInput.value);
            if (isNaN(amountValue) || amountValue <= 0) {
                console.error("Invalid amount entered:", amountInput.value);
                alert("Please enter a valid positive numeric amount for the debt/loan.");
                return;
            }

            const interestRateValue = parseFloat(interestRateInput.value) || 0; // Default to 0 if not entered
            const repaymentTermValue = parseInt(repaymentTermInput.value) || 0; // Default to 0 if not entered

            // Create the new debt object
            const newDebt = {
                id: Date.now(), // Unique ID for later deletion/editing
                date: debtDateInput.value,
                title: titleInput.value.trim(),
                type: typeSelect.value,
                lender: lenderInput ? lenderInput.value.trim() : '',
                amount: amountValue,
                currency: currencySelect.value,
                interestRate: interestRateValue,
                repaymentTerm: repaymentTermValue,
                description: descriptionInput ? descriptionInput.value.trim() : ''
            };

            try {
                // --- Save to 'debts' in localStorage ---
                const debts = JSON.parse(localStorage.getItem("debts") || "[]");
                debts.push(newDebt);
                localStorage.setItem("debts", JSON.stringify(debts));
                console.log("Successfully saved debt to 'debts' in localStorage:", newDebt);

                // --- Also save to 'notes' for reports, categorizing as an expense if applicable ---
                // For debts, it's more about tracking liability than an immediate expense/income transaction.
                // If you want debts to show up in a general 'Notes' report for overview, you might simplify it.
                // For this specific 'Debts & Loans' page, we primarily focus on the 'debts' localStorage item.
                // If you *do* want a simplified version in 'notes' for a generalized report page:
                const notes = JSON.parse(localStorage.getItem("notes") || "[]");
                notes.push({
                    date: newDebt.date,
                    title: `Debt: ${newDebt.title}`,
                    description: `Loan from ${newDebt.lender || 'N/A'}. Amount: ${newDebt.currency} ${newDebt.amount.toFixed(2)}.`,
                    amount: newDebt.amount, // Record the original debt amount
                    category: "Debts/Loans", // A new category for your reports
                    subcategory: newDebt.type,
                    currency: newDebt.currency,
                    country: "N/A" // Country might not be directly available, or needs a new input
                });
                localStorage.setItem("notes", JSON.stringify(notes));
                console.log("Successfully added simplified debt to 'notes' for reports.");

            } catch (error) {
                console.error("Error saving data to localStorage:", error);
                alert("Failed to save debt. Please check the browser console for details.");
                return; // Stop execution if localStorage save fails
            }

            // --- Reset form and update display after successful save ---
            this.reset();
            if (debtDateInput) {
                debtDateInput.value = new Date().toISOString().split("T")[0]; // Reset date to current
            }
            console.log("Form reset. Calling loadDebts() to update the display.");
            loadDebts(); // Reload debts to display the new entry
        });
    } else {
        console.error("Initialization Error: The form with ID 'debtForm' was not found.");
    }

    // --- Load and Display Debts ---
    function loadDebts() {
        const tbody = getElement("debtsTableBody");
        const cardViewContainer = getElement("cardViewContainer");
        const noDebtsMessage = getElement("noDebtsMessage");
        const totalDebtCell = getElement("totalDebtCell"); // Changed from totalBillsCell

        if (!tbody || !cardViewContainer || !noDebtsMessage || !totalDebtCell) {
            console.error("Missing display elements. Cannot load debts.");
            return;
        }

        try {
            const debts = JSON.parse(localStorage.getItem("debts") || "[]");
            console.log("Debts retrieved from localStorage:", debts);

            // Calculate total original debt
            let totalOriginalDebt = 0;
            debts.forEach(debt => {
                totalOriginalDebt += debt.amount;
            });
            totalDebtCell.textContent = totalOriginalDebt.toFixed(2);

            // Show/hide no debts message
            if (debts.length === 0) {
                noDebtsMessage.style.display = "block";
                tbody.innerHTML = ''; // Ensure table is empty
                cardViewContainer.innerHTML = ''; // Ensure cards are empty
                return;
            } else {
                noDebtsMessage.style.display = "none";
            }

            // Render based on current view
            if (currentView === "table") {
                renderDebtsTable(debts, tbody);
                cardViewContainer.innerHTML = ''; // Clear card view
            } else { // Default to card view
                renderDebtsCards(debts, cardViewContainer);
                tbody.innerHTML = ''; // Clear table view
            }

            console.log(`Displayed ${debts.length} debts.`);
        } catch (error) {
            console.error("Error loading or parsing debts from localStorage:", error);
            tbody.innerHTML = `<tr><td colspan="11" style="color: red;">Error loading debts. Check console for details.</td></tr>`;
            cardViewContainer.innerHTML = `<p style="color: red;">Error loading debts. Check console for details.</p>`;
        }
    }

    // Render debts in table format
    function renderDebtsTable(debts, tbody) {
        tbody.innerHTML = ""; // Clear existing rows
        debts.forEach((debt, index) => {
            const row = document.createElement("tr");
            row.dataset.id = debt.id; // Store ID for potential future actions
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${new Date(debt.date).toLocaleDateString()}</td>
                <td>${debt.title || '-'}</td>
                <td>${debt.type || '-'}</td>
                <td>${debt.lender || '-'}</td>
                <td>${(debt.amount || 0).toFixed(2)}</td>
                <td>${debt.currency || '-'}</td>
                <td>${debt.interestRate ? debt.interestRate.toFixed(2) : '-'}</td>
                <td>${debt.repaymentTerm || '-'}</td>
                <td>${debt.description || "-"}</td>
                <td>
                    <button class="table-action-btn edit-btn" data-id="${debt.id}"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete-btn" data-id="${debt.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
        // Attach event listeners for delete buttons
        tbody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteDebt);
        });
        // Attach event listeners for edit buttons
        tbody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditDebt);
        });
    }

    // Render debts in card format
    function renderDebtsCards(debts, container) {
        container.innerHTML = ""; // Clear existing cards
        debts.forEach(debt => {
            const card = document.createElement("div");
            card.classList.add("debt-card");
            card.dataset.id = debt.id; // Store ID for potential future actions
            card.innerHTML = `
                <h4>${debt.title || 'No Title'}</h4>
                <p><strong>Type:</strong> ${debt.type || 'N/A'}</p>
                <p><strong>Lender:</strong> ${debt.lender || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(debt.date).toLocaleDateString()}</p>
                <p class="card-amount">Amount: ${debt.currency} ${(debt.amount || 0).toFixed(2)}</p>
                ${debt.interestRate ? `<p><strong>Interest:</strong> ${debt.interestRate.toFixed(2)}%</p>` : ''}
                ${debt.repaymentTerm ? `<p><strong>Term:</strong> ${debt.repaymentTerm} months</p>` : ''}
                ${debt.description ? `<p class="debt-description">${debt.description}</p>` : ''}
                <div class="card-actions">
                    <button class="action-btn edit-btn" data-id="${debt.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn delete-btn" data-id="${debt.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
        // Attach event listeners for delete buttons
        container.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteDebt);
        });
        // Attach event listeners for edit buttons
        container.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditDebt);
        });
    }

    // Function to handle debt deletion
    function handleDeleteDebt(event) {
        const debtIdToDelete = parseInt(event.currentTarget.dataset.id);
        if (!confirm("Are you sure you want to delete this debt/loan entry?")) {
            return;
        }

        try {
            let debts = JSON.parse(localStorage.getItem("debts") || "[]");
            const initialLength = debts.length;
            debts = debts.filter(debt => debt.id !== debtIdToDelete);
            localStorage.setItem("debts", JSON.stringify(debts));

            if (debts.length < initialLength) {
                console.log(`Debt with ID ${debtIdToDelete} deleted.`);
                alert("Debt entry deleted successfully!");
            } else {
                console.warn(`Debt with ID ${debtIdToDelete} not found for deletion.`);
            }
            loadDebts(); // Reload the list after deletion
        } catch (error) {
            console.error("Error deleting debt from localStorage:", error);
            alert("There was an error deleting the debt entry.");
        }
    }

    // Function to handle debt editing (placeholder)
    function handleEditDebt(event) {
        const debtIdToEdit = parseInt(event.currentTarget.dataset.id);
        alert(`Edit functionality for Debt ID: ${debtIdToEdit} (Not yet implemented)`);
        // Here you would typically populate the form with the debt's data
        // and change the form button to "Update" instead of "Add"
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
        loadDebts(); // Reload debts to display in the new view
    }

    // --- Export Functions ---
    function exportToCsv() {
        const debts = JSON.parse(localStorage.getItem("debts") || "[]");
        if (debts.length === 0) {
            alert("No debts to export!");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        // Add header row
        csvContent += "ID,Date,Title,Type,Lender,Original Amount,Currency,Interest Rate (%),Repayment Term (Months),Description\n";

        // Add data rows
        debts.forEach(debt => {
            let row = [
                debt.id,
                new Date(debt.date).toLocaleDateString(),
                `"${debt.title.replace(/"/g, '""')}"`, // Handle commas and quotes in title
                debt.type,
                `"${(debt.lender || '').replace(/"/g, '""')}"`,
                debt.amount.toFixed(2),
                debt.currency,
                debt.interestRate ? debt.interestRate.toFixed(2) : '',
                debt.repaymentTerm || '',
                `"${(debt.description || '').replace(/"/g, '""')}"` // Handle commas and quotes in description
            ].join(',');
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "debts_loans.csv");
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        alert("Debts and Loans exported to CSV!");
    }

    function exportToPdf() {
        const debts = JSON.parse(localStorage.getItem("debts") || "[]");
        if (debts.length === 0) {
            alert("No debts to export!");
            return;
        }

        // Assuming jsPDF and jspdf-autotable are loaded
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const tableColumn = ["S.No.", "Date", "Title", "Type", "Lender", "Amount", "Currency", "Interest (%)", "Term (Months)"]; // Shorter for PDF
        const tableRows = [];

        debts.forEach((debt, index) => {
            const debtData = [
                index + 1,
                new Date(debt.date).toLocaleDateString(),
                debt.title,
                debt.type,
                debt.lender || 'N/A',
                (debt.amount || 0).toFixed(2),
                debt.currency,
                debt.interestRate ? debt.interestRate.toFixed(2) : 'N/A',
                debt.repaymentTerm || 'N/A'
            ];
            tableRows.push(debtData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Debts & Loans Report", 14, 15);
        doc.save("debts_loans_report.pdf");
        alert("Debts and Loans exported to PDF!");
    }


    // --- Page Initialization on Load ---
    window.onload = () => {
        console.log("Page fully loaded. Starting initialization for debts.js...");

        // This part is already handled by the inline script in your HTML
        // function getTodayDate() { ... } and document.addEventListener('DOMContentLoaded', ...)
        // So, we don't need to duplicate it here if it's already working from HTML.

        // Attach event listeners for view toggles
        getElement("cardViewBtn")?.addEventListener("click", () => toggleView("card"));
        getElement("tableViewBtn")?.addEventListener("click", () => toggleView("table"));

        // Attach event listeners for export buttons
        getElement("exportCsvBtn")?.addEventListener("click", exportToCsv);
        getElement("exportPdfBtn")?.addEventListener("click", exportToPdf);

        // Initial load of debts
        loadDebts();
        console.log("Initialization complete. Ready for user interaction on debts page.");
    };

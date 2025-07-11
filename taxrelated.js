document.addEventListener('DOMContentLoaded', () => {
    const taxForm = document.getElementById('taxForm');
    const taxDateInput = document.getElementById('taxDate');
    const titleInput = document.getElementById('title');
    const typeSelect = document.getElementById('type');
    const amountInput = document.getElementById('amount');
    const currencySelect = document.getElementById('currency');
    const descriptionTextarea = document.getElementById('description');

    const cardViewContainer = document.getElementById('cardViewContainer');
    const tableViewContainer = document.getElementById('tableViewContainer');
    const taxTableBody = document.getElementById('taxTableBody');
    const noTaxNotesMessage = document.getElementById('noTaxNotesMessage');
    const totalTaxAmountCell = document.getElementById('totalTaxAmountCell');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    // Load tax notes from localStorage, or initialize as an empty array
    let taxNotes = JSON.parse(localStorage.getItem('taxRelated')) || [];

    // Set today's date as default
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    taxDateInput.value = `${yyyy}-${mm}-${dd}`;

    // Function to save tax notes to localStorage and re-render
    const saveTaxNotes = () => {
        localStorage.setItem('taxRelated', JSON.stringify(taxNotes));
        renderTaxNotes(); // Re-render after any change
    };

    // Function to render tax notes in both card and table view
    const renderTaxNotes = () => {
        cardViewContainer.innerHTML = '';
        taxTableBody.innerHTML = '';
        let totalAmountRecorded = 0;

        if (taxNotes.length === 0) {
            noTaxNotesMessage.style.display = 'block';
            tableViewContainer.classList.add('hidden-view');
            cardViewContainer.classList.remove('card-grid-container'); // Remove grid if no items
            exportCsvBtn.disabled = true;
            exportPdfBtn.disabled = true;
        } else {
            noTaxNotesMessage.style.display = 'none';
            cardViewContainer.classList.add('card-grid-container'); // Add grid if items exist
            exportCsvBtn.disabled = false;
            exportPdfBtn.disabled = false;

            taxNotes.forEach((note, index) => {
                // Card View
                const card = document.createElement('div');
                card.classList.add('tax-card');
                card.innerHTML = `
                    <div class="card-header">
                        <span class="tax-title">${note.title}</span>
                        <span class="tax-amount">${note.currency} ${parseFloat(note.amount || 0).toFixed(2)}</span>
                    </div>
                    <div class="card-body">
                        <p class="tax-type"><i class="fas fa-tag"></i> ${note.type}</p>
                        <p class="tax-date"><i class="fas fa-calendar-alt"></i> ${note.date}</p>
                        <p class="tax-description">${note.description || 'No description'}</p>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-id="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                cardViewContainer.appendChild(card);

                // Table View
                const row = taxTableBody.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${note.date}</td>
                    <td>${note.title}</td>
                    <td>${note.type}</td>
                    <td>${parseFloat(note.amount || 0).toFixed(2)}</td>
                    <td>${note.currency}</td>
                    <td>${note.description || '-'}</td>
                    <td>
                        <button class="edit-btn icon-btn" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn icon-btn" data-id="${index}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;

                totalAmountRecorded += parseFloat(note.amount || 0);
            });
        }
        totalTaxAmountCell.textContent = parseFloat(totalAmountRecorded).toFixed(2);
    };

    // Add new tax note
    taxForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newTaxNote = {
            id: Date.now().toString(), // Unique ID for each entry
            date: taxDateInput.value,
            title: titleInput.value,
            type: typeSelect.value,
            amount: amountInput.value ? parseFloat(amountInput.value) : 0, // Amount is optional, default to 0
            currency: currencySelect.value,
            description: descriptionTextarea.value.trim()
        };

        taxNotes.push(newTaxNote);
        saveTaxNotes(); // Save to localStorage and re-render
        taxForm.reset();
        taxDateInput.value = `${yyyy}-${mm}-${dd}`; // Reset date to today after submission
    });

    // Handle Edit and Delete operations (Event Delegation)
    cardViewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to delete this tax note?')) {
                taxNotes.splice(index, 1);
                saveTaxNotes();
            }
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.id;
            editTaxNote(index);
        }
    });

    taxTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to delete this tax note?')) {
                taxNotes.splice(index, 1);
                saveTaxNotes();
            }
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.id;
            editTaxNote(index);
        }
    });

    // Function to populate form for editing a tax note
    const editTaxNote = (index) => {
        const noteToEdit = taxNotes[index];
        taxDateInput.value = noteToEdit.date;
        titleInput.value = noteToEdit.title;
        typeSelect.value = noteToEdit.type;
        amountInput.value = noteToEdit.amount || '';
        currencySelect.value = noteToEdit.currency;
        descriptionTextarea.value = noteToEdit.description || '';

        // Remove the note from the array as it's being edited.
        // It will be re-added (or an updated version) when the form is submitted.
        taxNotes.splice(index, 1);
        saveTaxNotes(); // Re-render to reflect the removal for editing
    };

    // View Toggles
    cardViewBtn.addEventListener('click', () => {
        cardViewBtn.classList.add('active-view');
        tableViewBtn.classList.remove('active-view');
        cardViewContainer.classList.remove('hidden-view');
        tableViewContainer.classList.add('hidden-view');
    });

    tableViewBtn.addEventListener('click', () => {
        tableViewBtn.classList.add('active-view');
        cardViewBtn.classList.remove('active-view');
        tableViewContainer.classList.remove('hidden-view');
        cardViewContainer.classList.add('hidden-view');
    });

    // Export to CSV
    exportCsvBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "S.No.,Date,Title,Type,Amount,Currency,Description\n";

        taxNotes.forEach((note, index) => {
            const escapedDescription = (note.description || '').replace(/"/g, '""');
            const escapedTitle = note.title.replace(/"/g, '""');

            const row = `${index + 1},"${note.date}","${escapedTitle}","${note.type}",${note.amount || ''},"${note.currency}","${escapedDescription}"\n`;
            csvContent += row;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tax_related_notes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Tax Related Report", 14, 22);

        const tableColumn = ["S.No.", "Date", "Title", "Type", "Amount", "Currency", "Description"];
        const tableRows = [];

        taxNotes.forEach((note, index) => {
            const taxData = [
                index + 1,
                note.date,
                note.title,
                note.type,
                parseFloat(note.amount || 0).toFixed(2),
                note.currency,
                note.description || '-'
            ];
            tableRows.push(taxData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: {
                fontSize: 10,
                cellPadding: 2,
                halign: 'center'
            },
            headStyles: {
                fillColor: [33, 150, 243], // Blue header for PDF
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'center' }, // S.No.
                1: { halign: 'center' }, // Date
                4: { halign: 'right' },  // Amount
                5: { halign: 'center' }  // Currency
            },
            foot: [['', '', '', 'Total Amount Recorded:', parseFloat(taxNotes.reduce((sum, note) => sum + (note.amount || 0), 0)).toFixed(2), '', '']],
            footStyles: {
                fontStyle: 'bold',
                halign: 'right',
                fillColor: [187, 222, 251], // Light blue footer
                textColor: [26, 35, 126]
            }
        });

        doc.save('tax_related_report.pdf');
    });

    // Initial render when the page loads
    renderTaxNotes();
});


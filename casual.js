// Add this line at the very beginning of your JS file to confirm it's loading
console.log("casual.js is running and loaded!");

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

// --- Casual Note Form Submission Logic ---
const casualForm = getElement("casualForm");
if (casualForm) {
    casualForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        // Safely get all form elements by their IDs
        const titleInput = getElement("title");
        const typeSelect = getElement("type");
        const contentInput = getElement("content");

        // Basic validation: Check if essential form elements are present
        if (!titleInput || !typeSelect || !contentInput) {
            console.error("Critical form elements are missing. Cannot process submission.");
            alert("Please ensure all required form fields are present in the HTML and have correct IDs.");
            return;
        }

        // Create the new casual note object
        const newNote = {
            id: Date.now(), // Unique ID for later deletion/editing
            date: new Date().toISOString().split('T')[0], // Current date
            title: titleInput.value.trim(),
            type: typeSelect.value,
            content: contentInput.value.trim()
        };

        // Basic validation for content
        if (!newNote.title || !newNote.content) {
            alert("Please enter both a title and content for your note.");
            return;
        }

        try {
            // --- Save to 'casualNotes' in localStorage ---
            const casualNotes = JSON.parse(localStorage.getItem("casualNotes") || "[]");
            casualNotes.push(newNote);
            localStorage.setItem("casualNotes", JSON.stringify(casualNotes));
            console.log("Successfully saved casual note to 'casualNotes' in localStorage:", newNote);

            // --- Also save a simplified version to 'notes' for general reports ---
            // Assuming 'notes' is a general collection for all types of entries
            const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
            allNotes.push({
                id: newNote.id, // Re-use the same ID
                date: newNote.date,
                title: `Casual Note: ${newNote.title}`,
                description: newNote.content,
                category: "Casual Notes",
                subcategory: newNote.type,
                amount: 0, // Casual notes typically don't have an amount
                currency: "N/A",
                country: "N/A"
            });
            localStorage.setItem("notes", JSON.stringify(allNotes));
            console.log("Successfully added simplified casual note to 'notes' for reports.");

        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            alert("Failed to save note. Please check the browser console for details.");
            return; // Stop execution if localStorage save fails
        }

        // --- Reset form and update display after successful save ---
        this.reset();
        console.log("Form reset. Calling loadCasualNotes() to update the display.");
        loadCasualNotes(); // Reload notes to display the new entry
    });
} else {
    console.error("Initialization Error: The form with ID 'casualForm' was not found.");
}

// --- Load and Display Casual Notes ---
function loadCasualNotes() {
    const casualListContainer = getElement("casualList");
    const noCasualNotesMessage = getElement("noCasualNotesMessage");

    if (!casualListContainer || !noCasualNotesMessage) {
        console.error("Missing display element: casualList or noCasualNotesMessage. Cannot load casual notes.");
        return;
    }

    try {
        const casualNotes = JSON.parse(localStorage.getItem("casualNotes") || "[]");
        console.log("Casual notes retrieved from localStorage:", casualNotes);

        if (casualNotes.length === 0) {
            noCasualNotesMessage.style.display = "block"; // Show message
            casualListContainer.innerHTML = ''; // Ensure list is empty
            return;
        } else {
            noCasualNotesMessage.style.display = "none"; // Hide message
        }

        casualListContainer.innerHTML = ''; // Clear existing notes

        casualNotes.forEach(note => {
            const noteCard = document.createElement("div");
            noteCard.classList.add("note-card"); // Add a class for styling
            noteCard.dataset.id = note.id; // Store ID for actions

            noteCard.innerHTML = `
                <div class="note-card-header">
                    <h4>${note.title || 'No Title'}</h4>
                    <span class="note-type">${note.type || 'N/A'}</span>
                </div>
                <p class="note-content">${note.content || 'No content'}</p>
                <p class="note-date">Added on: ${new Date(note.date).toLocaleDateString()}</p>
                <div class="note-card-actions">
                    <button class="action-button edit-btn" data-id="${note.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-button delete-btn" data-id="${note.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            casualListContainer.appendChild(noteCard);
        });

        // Attach event listeners for delete buttons
        casualListContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteNote);
        });

        // Attach event listeners for edit buttons (placeholder)
        casualListContainer.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditNote);
        });

        console.log(`Displayed ${casualNotes.length} casual notes.`);
    } catch (error) {
        console.error("Error loading or parsing casual notes from localStorage:", error);
        casualListContainer.innerHTML = `<p style="color: red;">Error loading notes. Check console for details.</p>`;
    }
}

// Function to handle note deletion
function handleDeleteNote(event) {
    const noteIdToDelete = parseInt(event.currentTarget.dataset.id);
    if (!confirm("Are you sure you want to delete this casual note?")) {
        return;
    }

    try {
        let casualNotes = JSON.parse(localStorage.getItem("casualNotes") || "[]");
        const initialLength = casualNotes.length;
        casualNotes = casualNotes.filter(note => note.id !== noteIdToDelete);
        localStorage.setItem("casualNotes", JSON.stringify(casualNotes));

        // Also remove from general 'notes' if it was added there
        let allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
        allNotes = allNotes.filter(note => note.id !== noteIdToDelete); // Assuming same ID is used
        localStorage.setItem("notes", JSON.stringify(allNotes));

        if (casualNotes.length < initialLength) {
            console.log(`Casual note with ID ${noteIdToDelete} deleted.`);
            alert("Casual note deleted successfully!");
        } else {
            console.warn(`Casual note with ID ${noteIdToDelete} not found for deletion.`);
        }
        loadCasualNotes(); // Reload the list after deletion
    } catch (error) {
        console.error("Error deleting casual note from localStorage:", error);
        alert("There was an error deleting the note.");
    }
}

// Function to handle note editing (placeholder)
function handleEditNote(event) {
    const noteIdToEdit = parseInt(event.currentTarget.dataset.id);
    alert(`Edit functionality for Casual Note ID: ${noteIdToEdit} (Not yet implemented)`);
    // Here you would typically:
    // 1. Find the note in localStorage by ID.
    // 2. Populate the form fields with the note's data.
    // 3. Change the form button to "Update Note" and add logic to handle the update.
}

// --- Export Functions ---
function exportToCsv() {
    const casualNotes = JSON.parse(localStorage.getItem("casualNotes") || "[]");
    if (casualNotes.length === 0) {
        alert("No casual notes to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // Add header row
    csvContent += "ID,Date,Title,Type,Content\n";

    // Add data rows
    casualNotes.forEach(note => {
        // Enclose content in quotes and escape internal quotes for CSV safety
        const escapedContent = `"${(note.content || '').replace(/"/g, '""')}"`;
        const escapedTitle = `"${(note.title || '').replace(/"/g, '""')}"`;
        let row = [
            note.id,
            new Date(note.date).toLocaleDateString(),
            escapedTitle,
            note.type,
            escapedContent
        ].join(',');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "casual_notes.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    alert("Casual notes exported to CSV!");
}

function exportToPdf() {
    const casualNotes = JSON.parse(localStorage.getItem("casualNotes") || "[]");
    if (casualNotes.length === 0) {
        alert("No casual notes to export!");
        return;
    }

    // Assuming jsPDF and jspdf-autotable are loaded
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tableColumn = ["S.No.", "Date", "Title", "Type", "Content"];
    const tableRows = [];

    casualNotes.forEach((note, index) => {
        const noteData = [
            index + 1,
            new Date(note.date).toLocaleDateString(),
            note.title,
            note.type,
            note.content
        ];
        tableRows.push(noteData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Casual Notes Report", 14, 15);
    doc.save("casual_notes_report.pdf");
    alert("Casual notes exported to PDF!");
}


// --- Page Initialization on Load ---
window.onload = () => {
    console.log("Page fully loaded. Starting initialization for casual.js...");

    // Attach event listeners for export buttons
    getElement("exportCsvBtn")?.addEventListener("click", exportToCsv);
    getElement("exportPdfBtn")?.addEventListener("click", exportToPdf);

    // Initial load of casual notes
    loadCasualNotes();

    console.log("Initialization complete. Ready for user interaction on casual notes page.");
};

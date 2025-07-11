// Ensure the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    renderAllNotes();
});

function renderAllNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const tbody = document.getElementById("allNotesReportBody");
    tbody.innerHTML = "";

    let totalExpenses = 0;
    let totalIncome = 0;

    notes.forEach((note, index) => {
        const tr = document.createElement("tr");

        const isExpense = note.category === "Expenses";
        const isIncome = note.category === "Income";
        const isCasual = note.category === "Casual Note";

        // Update totals
        if (isExpense) totalExpenses += note.amount || 0;
        if (isIncome) totalIncome += note.amount || 0;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(note.date).toLocaleDateString()}</td>
            <td>${note.title}</td>
            <td>${note.subcategory}</td>
            <td>${note.description || '-'}</td>
            <td>${note.currency}</td>
            <td style="color: ${isExpense ? '#e74c3c' : '#aaa'};">${isExpense ? note.amount.toFixed(2) : ''}</td>
            <td style="color: ${isIncome ? '#2ecc71' : '#aaa'};">${isIncome ? note.amount.toFixed(2) : ''}</td>
            <td style="color: ${isCasual ? '#e67e22' : '#aaa'};">${isCasual ? note.description || 'Note' : ''}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("totalExpensesCell").textContent = totalExpenses.toFixed(2);
    document.getElementById("totalIncomeCell").textContent = totalIncome.toFixed(2);
}

// 🟩 Export to CSV
function exportAllToCSV() {
    const rows = [["S.No.", "Date", "Title", "Subcategory", "Description", "Currency", "Expenses (₹)", "Income (₹)", "Casual Note"]];
    const notes = JSON.parse(localStorage.getItem("notes")) || [];

    let totalExpenses = 0;
    let totalIncome = 0;

    notes.forEach((note, index) => {
        if (note.category === "Expenses") totalExpenses += note.amount || 0;
        if (note.category === "Income") totalIncome += note.amount || 0;

        rows.push([
            index + 1,
            new Date(note.date).toLocaleDateString(),
            note.title,
            note.subcategory,
            note.description || '',
            note.currency,
            note.category === "Expenses" ? note.amount.toFixed(2) : '',
            note.category === "Income" ? note.amount.toFixed(2) : '',
            note.category === "Casual Note" ? note.description || 'Note' : ''
        ]);
    });

    // Add totals row
    rows.push([
        "", "", "", "", "Totals", "", totalExpenses.toFixed(2), totalIncome.toFixed(2), ""
    ]);

    const csvContent = rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `NoteNest_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 🟦 Export to PDF (with highlighted totals row)
function exportAllToPDF() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    if (notes.length === 0) {
        alert("No data to export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text("NoteNest Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let totalExpenses = 0;
    let totalIncome = 0;

    const tableData = notes.map((note, index) => {
        if (note.category === "Expenses") totalExpenses += note.amount || 0;
        if (note.category === "Income") totalIncome += note.amount || 0;

        return [
            index + 1,
            new Date(note.date).toLocaleDateString(),
            note.title,
            note.subcategory,
            note.description || '-',
            note.currency,
            note.category === "Expenses" ? note.amount.toFixed(2) : '',
            note.category === "Income" ? note.amount.toFixed(2) : '',
            note.category === "Casual Note" ? (note.description || 'Note') : ''
        ];
    });

    // Add totals row
    const totalsRow = ["", "", "", "", "Totals", "", totalExpenses.toFixed(2), totalIncome.toFixed(2), ""];
    tableData.push(totalsRow);
    const lastRowIndex = tableData.length - 1;

    doc.autoTable({
        head: [["S.No.", "Date", "Title", "Subcategory", "Description", "Currency", "Expenses (₹)", "Income (₹)", "Casual Note"]],
        body: tableData,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 200] },
        styles: { fontSize: 9 },
        margin: { top: 25 },
        didParseCell: function (data) {
            if (data.row.index === lastRowIndex && data.section === 'body') {
                data.cell.styles.fillColor = [255, 255, 150]; // Light yellow
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [0, 0, 0]; // Black text
            }
        }
    });

    doc.save(`NoteNest_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goalForm');
    const goalTitleInput = document.getElementById('goalTitle');
    const goalTypeSelect = document.getElementById('goalType');
    const targetAmountInput = document.getElementById('targetAmount');
    const currentAmountInput = document.getElementById('currentAmount');
    const targetDateInput = document.getElementById('targetDate');
    const statusSelect = document.getElementById('status');
    const descriptionTextarea = document.getElementById('description');

    const cardViewContainer = document.getElementById('cardViewContainer');
    const tableViewContainer = document.getElementById('tableViewContainer');
    const goalsTableBody = document.getElementById('goalsTableBody');
    const noGoalsMessage = document.getElementById('noGoalsMessage');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    // Load goals from localStorage, or initialize as an empty array
    let goals = JSON.parse(localStorage.getItem('goals')) || [];

    // Set today's date as default for target date (can be changed by user)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    targetDateInput.value = `${yyyy}-${mm}-${dd}`;

    // Function to save goals to localStorage and re-render
    const saveGoals = () => {
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals(); // Re-render after any change
    };

    // Function to calculate progress
    const calculateProgress = (current, target) => {
        if (target <= 0) return 0; // Avoid division by zero or negative targets
        const progress = (current / target) * 100;
        return Math.min(100, Math.max(0, progress)); // Cap between 0 and 100
    };

    // Function to render goals in both card and table view
    const renderGoals = () => {
        cardViewContainer.innerHTML = '';
        goalsTableBody.innerHTML = '';

        if (goals.length === 0) {
            noGoalsMessage.style.display = 'block';
            tableViewContainer.classList.add('hidden-view');
            cardViewContainer.classList.remove('card-grid-container'); // Remove grid if no items
            exportCsvBtn.disabled = true;
            exportPdfBtn.disabled = true;
        } else {
            noGoalsMessage.style.display = 'none';
            cardViewContainer.classList.add('card-grid-container'); // Add grid if items exist
            exportCsvBtn.disabled = false;
            exportPdfBtn.disabled = false;

            goals.forEach((goal, index) => {
                const progressPercentage = calculateProgress(goal.currentAmount, goal.targetAmount);
                const isFinancialGoal = goal.goalType === 'Financial';

                // Card View
                const card = document.createElement('div');
                card.classList.add('goal-card');
                card.innerHTML = `
                    <div class="card-header">
                        <span class="goal-title">${goal.title}</span>
                        <span class="goal-status status-${goal.status.toLowerCase().replace(/\s/g, '-') || 'other'}">${goal.status}</span>
                    </div>
                    <div class="card-body">
                        <p class="goal-type"><i class="fas fa-tag"></i> Type: ${goal.goalType}</p>
                        ${isFinancialGoal ? `<p class="goal-amounts">Target: ₹${parseFloat(goal.targetAmount).toFixed(2)} | Current: ₹${parseFloat(goal.currentAmount).toFixed(2)}</p>` : ''}
                        <p class="goal-date"><i class="fas fa-calendar-alt"></i> Target Date: ${goal.targetDate}</p>
                        <p class="goal-description">${goal.description || 'No description'}</p>
                        ${isFinancialGoal ? `
                            <div class="card-progress-bar">
                                <div class="card-progress" style="width: ${progressPercentage}%;"></div>
                            </div>
                            <p class="card-progress-text">${progressPercentage.toFixed(1)}% Complete</p>
                        ` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-id="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                cardViewContainer.appendChild(card);

                // Table View
                const row = goalsTableBody.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${goal.title}</td>
                    <td>${goal.goalType}</td>
                    <td>${isFinancialGoal ? `₹${parseFloat(goal.targetAmount).toFixed(2)}` : '-'}</td>
                    <td>${isFinancialGoal ? `₹${parseFloat(goal.currentAmount).toFixed(2)}` : '-'}</td>
                    <td>${isFinancialGoal ? `${progressPercentage.toFixed(1)}%` : '-'}</td>
                    <td>${goal.targetDate}</td>
                    <td><span class="goal-status status-${goal.status.toLowerCase().replace(/\s/g, '-') || 'other'}">${goal.status}</span></td>
                    <td>${goal.description || '-'}</td>
                    <td>
                        <button class="edit-btn icon-btn" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn icon-btn" data-id="${index}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
            });
        }
    };

    // Add new goal
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isFinancial = goalTypeSelect.value === 'Financial';
        let targetAmount = isFinancial ? parseFloat(targetAmountInput.value) : 0;
        let currentAmount = isFinancial ? parseFloat(currentAmountInput.value) : 0;

        // Basic validation
        if (!goalTitleInput.value.trim() || !goalTypeSelect.value || !targetDateInput.value) {
            alert('Please fill in all required fields: Title, Type, and Target Date.');
            return;
        }
        if (isFinancial && (isNaN(targetAmount) || targetAmount <= 0)) {
            alert('For Financial goals, Target Amount must be a positive number.');
            return;
        }
        if (isFinancial && (isNaN(currentAmount) || currentAmount < 0)) {
            alert('For Financial goals, Current Amount must be a non-negative number.');
            return;
        }
        if (currentAmount > targetAmount && isFinancial) {
            alert('Current Amount cannot exceed Target Amount for financial goals.');
            return;
        }


        const newGoal = {
            id: Date.now().toString(), // Unique ID for each entry
            title: goalTitleInput.value.trim(),
            goalType: goalTypeSelect.value,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            targetDate: targetDateInput.value,
            status: statusSelect.value,
            description: descriptionTextarea.value.trim()
        };

        goals.push(newGoal);
        saveGoals(); // Save to localStorage and re-render
        goalForm.reset();
        targetDateInput.value = `${yyyy}-${mm}-${dd}`; // Reset date to today after submission
        // Reset financial specific fields
        targetAmountInput.value = '';
        currentAmountInput.value = '0.00';
    });

    // Handle Edit and Delete operations (Event Delegation)
    cardViewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to delete this goal?')) {
                goals.splice(index, 1);
                saveGoals();
            }
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.id;
            editGoal(index);
        }
    });

    goalsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to delete this goal?')) {
                goals.splice(index, 1);
                saveGoals();
            }
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.id;
            editGoal(index);
        }
    });

    // Function to populate form for editing a goal
    const editGoal = (index) => {
        const goalToEdit = goals[index];
        goalTitleInput.value = goalToEdit.title;
        goalTypeSelect.value = goalToEdit.goalType;
        targetAmountInput.value = goalToEdit.targetAmount || '';
        currentAmountInput.value = goalToEdit.currentAmount || '0.00';
        targetDateInput.value = goalToEdit.targetDate;
        statusSelect.value = goalToEdit.status;
        descriptionTextarea.value = goalToEdit.description || '';

        // Remove the goal from the array as it's being edited.
        // It will be re-added (or an updated version) when the form is submitted.
        goals.splice(index, 1);
        saveGoals(); // Re-render to reflect the removal for editing
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
        csvContent += "S.No.,Title,Type,Target Amount,Current Amount,Progress (%),Target Date,Status,Description\n";

        goals.forEach((goal, index) => {
            const progressPercentage = calculateProgress(goal.currentAmount, goal.targetAmount);
            const escapedDescription = (goal.description || '').replace(/"/g, '""');
            const escapedTitle = goal.title.replace(/"/g, '""');

            const row = `${index + 1},"${escapedTitle}","${goal.goalType}",${goal.targetAmount || ''},${goal.currentAmount || ''},${progressPercentage.toFixed(1)},"${goal.targetDate}","${goal.status}","${escapedDescription}"\n`;
            csvContent += row;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "goals_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape'); // Use landscape for more columns

        doc.setFontSize(18);
        doc.text("Goals Report", 14, 22);

        const tableColumn = ["S.No.", "Title", "Type", "Target Amount", "Current Amount", "Progress (%)", "Target Date", "Status", "Description"];
        const tableRows = [];

        goals.forEach((goal, index) => {
            const progressPercentage = calculateProgress(goal.currentAmount, goal.targetAmount);
            const goalData = [
                index + 1,
                goal.title,
                goal.goalType,
                goal.goalType === 'Financial' ? parseFloat(goal.targetAmount).toFixed(2) : '-',
                goal.goalType === 'Financial' ? parseFloat(goal.currentAmount).toFixed(2) : '-',
                goal.goalType === 'Financial' ? `${progressPercentage.toFixed(1)}%` : '-',
                goal.targetDate,
                goal.status,
                goal.description || '-'
            ];
            tableRows.push(goalData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: {
                fontSize: 8, // Smaller font for more columns
                cellPadding: 2,
                halign: 'center'
            },
            headStyles: {
                fillColor: [126, 87, 194], // Purple header for PDF
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // S.No.
                1: { cellWidth: 30 }, // Title
                2: { cellWidth: 20 }, // Type
                3: { cellWidth: 20, halign: 'right' }, // Target Amount
                4: { cellWidth: 20, halign: 'right' }, // Current Amount
                5: { cellWidth: 15, halign: 'center' }, // Progress
                6: { cellWidth: 18, halign: 'center' }, // Target Date
                7: { cellWidth: 20, halign: 'center' }, // Status
                8: { cellWidth: 40 } // Description
            },
            // No footer for total amounts as goals are not directly summed like expenses/income
        });

        doc.save('goals_report.pdf');
    });

    // Initial render when the page loads
    renderGoals();
});

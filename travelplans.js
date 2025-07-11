// --- REMINDER LOGIC START ---

function saveTravelReminder(planId, planTitle, startDate, reminderTime) {
    if (!startDate || !reminderTime) return;
    const reminderDateTime = new Date(`${startDate}T${reminderTime}`);
    if (isNaN(reminderDateTime.getTime())) return;

    const reminder = { id: planId, title: planTitle, dateTime: reminderDateTime.toISOString(), triggered: false };
    let reminders = JSON.parse(localStorage.getItem('travelReminders')) || [];
    const idx = reminders.findIndex(r => r.id === planId);
    if (idx > -1) reminders[idx] = reminder;
    else reminders.push(reminder);
    localStorage.setItem('travelReminders', JSON.stringify(reminders));
}

function triggerTravelReminder(reminder) {
    const alarmSound = document.getElementById('alarmSound');
    if (alarmSound) {
        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {
            const display = document.getElementById('professionalReminderDisplay');
            const title = document.getElementById('reminderTitle');
            const msg = document.getElementById('reminderMessage');
            title.textContent = "Sound Blocked!";
            msg.innerHTML = `Click on the page to enable sound for "${reminder.title}".`;
            display.style.display = 'flex';
            display.style.animation = 'none';
        });
    }
    const display = document.getElementById('professionalReminderDisplay');
    const title = document.getElementById('reminderTitle');
    const msg = document.getElementById('reminderMessage');
    title.textContent = `Travel Reminder: ${reminder.title}`;
    msg.innerHTML = `Your trip starts soon on <strong>${new Date(reminder.dateTime).toLocaleDateString()}</strong>!`;
    display.style.display = 'flex';
    display.style.animation = 'fadeInOut 8s forwards';
    setTimeout(() => {
        if (display.style.display === 'flex' && display.style.animation !== 'none') {
            display.style.display = 'none';
        }
    }, 8000);
}

function checkAllTravelReminders() {
    let reminders = JSON.parse(localStorage.getItem('travelReminders')) || [];
    const now = new Date(), buffer = 60000;
    reminders.forEach(reminder => {
        const dt = new Date(reminder.dateTime);
        if (!reminder.triggered && dt <= now && dt.getTime() + buffer >= now.getTime()) {
            triggerTravelReminder(reminder);
            reminder.triggered = true;
        }
    });
    localStorage.setItem('travelReminders', JSON.stringify(reminders));
}

setInterval(checkAllTravelReminders, 60000);

// --- FORMAT HELPERS ---
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// --- RENDER LOGIC ---
function renderTravelPlans() {
    const cardViewContainer = document.getElementById('cardViewContainer');
    const travelTableBody = document.getElementById('travelTableBody');
    const noTravelPlansMessage = document.getElementById('noTravelPlansMessage');

    cardViewContainer.innerHTML = '';
    travelTableBody.innerHTML = '';

    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    if (plans.length === 0) {
        noTravelPlansMessage.style.display = 'block';
        return;
    }
    noTravelPlansMessage.style.display = 'none';

    plans.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    plans.forEach((plan, index) => {
        const card = document.createElement('div');
        card.classList.add('travel-plan-card');
        card.dataset.planId = plan.id;
        card.innerHTML = `
            <h3>${plan.planTitle}</h3>
            <p><strong>Destination:</strong> ${plan.destination || 'N/A'}</p>
            <p><strong>Dates:</strong> ${formatDateForDisplay(plan.startDate)} to ${formatDateForDisplay(plan.endDate)}</p>
            <p><strong>Budget:</strong> ${plan.currency || '$'} ${parseFloat(plan.budgetAmount || 0).toFixed(2)}</p>
            <p><strong>Status:</strong> <span class="status-${plan.status.toLowerCase().replace(/\s/g, '-')}">${plan.status}</span></p>
            ${plan.notes ? `<p><strong>Notes:</strong> ${plan.notes.substring(0, 100)}...</p>` : ''}
            ${plan.reminderTime ? `<p class="reminder-text"><strong>Reminder:</strong> ${formatDateForDisplay(plan.startDate)} at ${plan.reminderTime}</p>` : ''}
            <div class="card-actions">
                <button class="edit-plan-btn" data-id="${plan.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-plan-btn" data-id="${plan.id}"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        `;
        cardViewContainer.appendChild(card);

        const row = travelTableBody.insertRow();
        row.dataset.planId = plan.id;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${plan.planTitle}</td>
            <td>${plan.destination || 'N/A'}</td>
            <td>${formatDateForDisplay(plan.startDate)}</td>
            <td>${formatDateForDisplay(plan.endDate)}</td>
            <td>${parseFloat(plan.budgetAmount || 0).toFixed(2)}</td>
            <td>${plan.currency || '$'}</td>
            <td><span class="status-${plan.status.toLowerCase().replace(/\s/g, '-')}">${plan.status}</span></td>
            <td>${plan.notes || 'N/A'}</td>
            <td>
                <button class="edit-plan-btn" data-id="${plan.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-plan-btn" data-id="${plan.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });

    document.querySelectorAll('.edit-plan-btn').forEach(btn => btn.onclick = e => editTravelPlan(+e.currentTarget.dataset.id));
    document.querySelectorAll('.delete-plan-btn').forEach(btn => btn.onclick = e => deleteTravelPlan(+e.currentTarget.dataset.id));

    updateTotalBudget();
}

document.getElementById('travelPlanForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const planId = Date.now();
    const planTitle = document.getElementById('planTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const destination = document.getElementById('destination').value;
    const budgetAmount = parseFloat(document.getElementById('budgetAmount').value) || 0;
    const currency = document.getElementById('currency').value;
    const status = document.getElementById('status').value;
    const notes = document.getElementById('notes').value;
    const reminderTime = document.getElementById('reminderTime').value;

    const newPlan = { id: planId, planTitle, startDate, endDate, destination, budgetAmount, currency, status, notes, reminderTime };
    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    plans.push(newPlan);
    localStorage.setItem('travelPlans', JSON.stringify(plans));
    saveTravelReminder(planId, planTitle, startDate, reminderTime);
    this.reset();
    renderTravelPlans();
});

function editTravelPlan(id) {
    console.log("Edit plan ID:", id);
    alert(`Edit functionality isn't implemented yet (ID ${id})`);
}

function deleteTravelPlan(id) {
    if (!confirm("Delete this plan?")) return;
    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem('travelPlans', JSON.stringify(plans));
    let reminders = JSON.parse(localStorage.getItem('travelReminders')) || [];
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('travelReminders', JSON.stringify(reminders));
    renderTravelPlans();
}

function updateTotalBudget() {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    const total = plans.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
    const cell = document.getElementById('totalBudgetCell');
    if (cell) cell.textContent = total.toFixed(2);
}

document.getElementById('cardViewBtn').onclick = () => {
    document.getElementById('cardViewContainer').classList.remove('hidden-view');
    document.getElementById('tableViewContainer').classList.add('hidden-view');
};
document.getElementById('tableViewBtn').onclick = () => {
    document.getElementById('cardViewContainer').classList.add('hidden-view');
    document.getElementById('tableViewContainer').classList.remove('hidden-view');
};

// --- EXPORT TO CSV ---
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    if (plans.length === 0) return alert("No data to export");

    let csv = 'S.No.,Title,Destination,Start Date,End Date,Budget,Currency,Status,Notes\n';
    plans.forEach((p, i) => {
        const notesEsc = p.notes.replace(/"/g, '""');
        csv += `${i+1},"${p.planTitle}","${p.destination}","${formatDateForDisplay(p.startDate)}","${formatDateForDisplay(p.endDate)}","${p.budgetAmount.toFixed(2)}","${p.currency}","${p.status}","${notesEsc}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `travel_plans_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
});

// --- EXPORT TO PDF ---
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    if (plans.length === 0) return alert("No data to export");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text("Travel Plans Report", 14, 20);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

    const rows = plans.map((p, i) => [
        i+1,
        p.planTitle,
        p.destination,
        formatDateForDisplay(p.startDate),
        formatDateForDisplay(p.endDate),
        `${p.currency} ${p.budgetAmount.toFixed(2)}`,
        p.status
    ]);

    doc.autoTable({
        head: [['#','Title','Destination','Start','End','Budget','Status']],
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
        margin: { top: 30 }
    });

    doc.save(`travel_plans_${new Date().toISOString().split('T')[0]}.pdf`);
});

// --- INIT ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    const sd = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0];
    if (sd) sd.value = today;

    renderTravelPlans();
    checkAllTravelReminders();
});

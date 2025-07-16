// travelplans.js

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
    const now = new Date(), buffer = 60000; // 60 seconds buffer
    reminders.forEach(reminder => {
        const dt = new Date(reminder.dateTime);
        // Trigger if reminder is due and hasn't been triggered yet, within a small buffer
        if (!reminder.triggered && dt <= now && dt.getTime() + buffer >= now.getTime()) {
            triggerTravelReminder(reminder);
            reminder.triggered = true; // Mark as triggered
        }
    });
    localStorage.setItem('travelReminders', JSON.stringify(reminders));
}

// Check reminders every minute
setInterval(checkAllTravelReminders, 60000);

// --- FORMAT HELPERS ---
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// --- CITY TO IMAGE MAPPING (IMPORTANT: EXPAND THIS LIST!) ---
const DEFAULT_CITY_IMAGE = "https://media.istockphoto.com/id/1497396873/photo/ready-for-starting-my-beach-holiday.jpg?s=612x612&w=0&k=20&c=Rfb7IbYAZR1hNTF6KUDYq8CVu9Yr4wRgK2VLZIZyORY="; // Generic placeholder image

const cityImages = {
    // --- Indian Cities & States ---
    "Hyderabad": DEFAULT_CITY_IMAGE,
    "Mumbai": DEFAULT_CITY_IMAGE,
    "Delhi": DEFAULT_CITY_IMAGE,
    "Bengaluru": DEFAULT_CITY_IMAGE,
    "Chennai": DEFAULT_CITY_IMAGE,
    "Kolkata": DEFAULT_CITY_IMAGE,
    "Pune": DEFAULT_CITY_IMAGE,
    "Ahmedabad": DEFAULT_CITY_IMAGE,
    "Jaipur": DEFAULT_CITY_IMAGE,
    "Lucknow": DEFAULT_CITY_IMAGE,
    "Chandigarh": DEFAULT_CITY_IMAGE,
    "Goa": DEFAULT_CITY_IMAGE,
    "Kochi": DEFAULT_CITY_IMAGE,
    "Srinagar": DEFAULT_CITY_IMAGE,
    "Udaipur": DEFAULT_CITY_IMAGE,
    "Varanasi": DEFAULT_CITY_IMAGE,
    "Amritsar": DEFAULT_CITY_IMAGE,
    "Bhopal": DEFAULT_CITY_IMAGE,
    "Indore": DEFAULT_CITY_IMAGE,
    "Mysuru": DEFAULT_CITY_IMAGE,
    "Shimla": DEFAULT_CITY_IMAGE,
    "Darjeeling": DEFAULT_CITY_IMAGE,
    "Agra": DEFAULT_CITY_IMAGE,
    "Thiruvananthapuram": DEFAULT_CITY_IMAGE,
    "Bhubaneswar": DEFAULT_CITY_IMAGE,
    "Patna": DEFAULT_CITY_IMAGE,
    "Guwahati": DEFAULT_CITY_IMAGE,
    "Ranchi": DEFAULT_CITY_IMAGE,
    "Dehradun": DEFAULT_CITY_IMAGE,
    "Gangtok": DEFAULT_CITY_IMAGE,
    "Shillong": DEFAULT_CITY_IMAGE,
    "Itanagar": DEFAULT_CITY_IMAGE,
    "Aizawl": DEFAULT_CITY_IMAGE,
    "Kohima": DEFAULT_CITY_IMAGE,
    "Imphal": DEFAULT_CITY_IMAGE,
    "Agartala": DEFAULT_CITY_IMAGE,
    "Panaji": DEFAULT_CITY_IMAGE,
    "Port Blair": DEFAULT_CITY_IMAGE,
    "Visakhapatnam": DEFAULT_CITY_IMAGE,
    "Amaravati": DEFAULT_CITY_IMAGE,
    "Raipur": DEFAULT_CITY_IMAGE,
    "Gandhinagar": DEFAULT_CITY_IMAGE,
    "Puducherry": DEFAULT_CITY_IMAGE,
    "Leh": DEFAULT_CITY_IMAGE,
    "Jammu": DEFAULT_CITY_IMAGE,
    "Nagpur": DEFAULT_CITY_IMAGE,
    "Surat": DEFAULT_CITY_IMAGE,
    "Kanpur": DEFAULT_CITY_IMAGE,
    "Nashik": DEFAULT_CITY_IMAGE,
    "Coimbatore": DEFAULT_CITY_IMAGE,
    "Madurai": DEFAULT_CITY_IMAGE,
    "Tiruchirappalli": DEFAULT_CITY_IMAGE,
    "Vellore": DEFAULT_CITY_IMAGE,
    "Salem": DEFAULT_CITY_IMAGE,
    "Kozhikode": DEFAULT_CITY_IMAGE,
    "Mangaluru": DEFAULT_CITY_IMAGE,
    "Nellore": DEFAULT_CITY_IMAGE,
    "Warangal": DEFAULT_CITY_IMAGE,
    "Vijayawada": DEFAULT_CITY_IMAGE,
    "Jodhpur": DEFAULT_CITY_IMAGE,
    "Bikaner": DEFAULT_CITY_IMAGE,
    "Jaisalmer": DEFAULT_CITY_IMAGE,
    "Ajmer": DEFAULT_CITY_IMAGE,
    "Pushkar": DEFAULT_CITY_IMAGE,
    "Gwalior": DEFAULT_CITY_IMAGE,
    "Jabalpur": DEFAULT_CITY_IMAGE,
    "Ujjain": DEFAULT_CITY_IMAGE,
    "Rishikesh": DEFAULT_CITY_IMAGE,
    "Haridwar": DEFAULT_CITY_IMAGE,
    "Nainital": DEFAULT_CITY_IMAGE,
    "Mussoorie": DEFAULT_CITY_IMAGE,
    "Manali": DEFAULT_CITY_IMAGE,
    "Dharamshala": DEFAULT_CITY_IMAGE,
    "Alappuzha": DEFAULT_CITY_IMAGE,
    "Thrissur": DEFAULT_CITY_IMAGE,
    "Kollam": DEFAULT_CITY_IMAGE,
    "Alleppey": DEFAULT_CITY_IMAGE,
    "Hampi": DEFAULT_CITY_IMAGE,
    "Dispur": DEFAULT_CITY_IMAGE,
    "Kavaratti": DEFAULT_CITY_IMAGE,
    "Daman": DEFAULT_CITY_IMAGE,
    "Silvassa": DEFAULT_CITY_IMAGE,

    // --- International Cities ---
    "New York": DEFAULT_CITY_IMAGE,
    "London": DEFAULT_CITY_IMAGE,
    "Paris": DEFAULT_CITY_IMAGE,
    "Dubai": DEFAULT_CITY_IMAGE,
    "Singapore": DEFAULT_CITY_IMAGE,
    "Sydney": DEFAULT_CITY_IMAGE,
    "Rome": DEFAULT_CITY_IMAGE,
    "Tokyo": DEFAULT_CITY_IMAGE,
    "San Francisco": DEFAULT_CITY_IMAGE,
    "Rio de Janeiro": DEFAULT_CITY_IMAGE,
    "Cairo": DEFAULT_CITY_IMAGE,
    "Bangkok": DEFAULT_CITY_IMAGE,
    "Berlin": DEFAULT_CITY_IMAGE,
    "Barcelona": DEFAULT_CITY_IMAGE,
    "Amsterdam": DEFAULT_CITY_IMAGE,
    "Toronto": DEFAULT_CITY_IMAGE,
    "Vancouver": DEFAULT_CITY_IMAGE,
    "Mexico City": DEFAULT_CITY_IMAGE,
    "Buenos Aires": DEFAULT_CITY_IMAGE,
    "Cape Town": DEFAULT_CITY_IMAGE,
    "Moscow": DEFAULT_CITY_IMAGE,
    "Beijing": DEFAULT_CITY_IMAGE,
    "Shanghai": DEFAULT_CITY_IMAGE,
    "Seoul": DEFAULT_CITY_IMAGE,
    "Istanbul": DEFAULT_CITY_IMAGE,
    "Prague": DEFAULT_CITY_IMAGE,
    "Vienna": DEFAULT_CITY_IMAGE,
    "Lisbon": DEFAULT_CITY_IMAGE,
    "Dublin": DEFAULT_CITY_IMAGE,
    "Edinburgh": DEFAULT_CITY_IMAGE,
    "Zurich": DEFAULT_CITY_IMAGE,
    "Geneva": DEFAULT_CITY_IMAGE,
    "Helsinki": DEFAULT_CITY_IMAGE,
    "Oslo": DEFAULT_CITY_IMAGE,
    "Stockholm": DEFAULT_CITY_IMAGE,
    "Copenhagen": DEFAULT_CITY_IMAGE,
    "Brussels": DEFAULT_CITY_IMAGE,
    "Warsaw": DEFAULT_CITY_IMAGE,
    "Budapest": DEFAULT_CITY_IMAGE,
    "Athens": DEFAULT_CITY_IMAGE,
    "Marrakech": DEFAULT_CITY_IMAGE,
    "Nairobi": DEFAULT_CITY_IMAGE,
    "Johannesburg": DEFAULT_CITY_IMAGE,
    "Kyoto": DEFAULT_CITY_IMAGE,
    "Osaka": DEFAULT_CITY_IMAGE,
    "Hong Kong": DEFAULT_CITY_IMAGE,
    "Kuala Lumpur": DEFAULT_CITY_IMAGE,
    "Manila": DEFAULT_CITY_IMAGE,
    "Jakarta": DEFAULT_CITY_IMAGE,
    "Phuket": DEFAULT_CITY_IMAGE,
    "Hanoi": DEFAULT_CITY_IMAGE,
    "Ho Chi Minh City": DEFAULT_CITY_IMAGE,
    "Santiago": DEFAULT_CITY_IMAGE,
    "Lima": DEFAULT_CITY_IMAGE,
    "Bogota": DEFAULT_CITY_IMAGE,
    "Caracas": DEFAULT_CITY_IMAGE,
    "Quito": DEFAULT_CITY_IMAGE,
    "Reykjavik": DEFAULT_CITY_IMAGE,
    "Other": DEFAULT_CITY_IMAGE,
    "Other (Not Listed)": DEFAULT_CITY_IMAGE
};


// --- RENDER LOGIC FOR MAIN TRAVEL PLANS SECTION ---
function renderTravelPlans() {
    const cardViewContainer = document.getElementById('cardViewContainer');
    const travelTableBody = document.getElementById('travelTableBody');
    const noTravelPlansMessage = document.getElementById('noTravelPlansMessage');

    // Ensure elements exist before trying to manipulate them
    if (!cardViewContainer || !travelTableBody || !noTravelPlansMessage) {
        console.error("Missing DOM elements for rendering travel plans. Please check your HTML structure.");
        return;
    }

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

        // Use plan.city for image lookup, falling back to destinationCity then default
        // This makes it consistent with the 'city' property expected by script.js
        const imageKey = plan.city || plan.destinationCity; // Prefer 'city' if it exists, otherwise use 'destinationCity'
        const cardImage = cityImages[imageKey] || DEFAULT_CITY_IMAGE;
        const travelersList = (plan.travelers && plan.travelers.length > 0) ? plan.travelers.join(', ') : 'N/A';

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${cardImage}" alt="${imageKey || 'Destination'}" class="card-image">
            </div>
            <div class="card-content">
                <h3>${plan.planTitle}</h3>
                <p><strong>Country:</strong> ${plan.destinationCountry || 'N/A'}</p>
                <p><strong>City/State:</strong> ${plan.city || plan.destinationCity || 'N/A'}</p>
                <p><strong>Travelers:</strong> ${travelersList}</p>
                <p><strong>Dates:</strong> ${formatDateForDisplay(plan.startDate)} to ${formatDateForDisplay(plan.endDate)}</p>
                <p><strong>Budget:</strong> ${plan.currency || '₹'} ${parseFloat(plan.budgetAmount || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="status-${(plan.status || 'Planning').toLowerCase().replace(/\s/g, '-')}">${plan.status || 'Planning'}</span></p>
                ${plan.notes ? `<p class="card-notes"><strong>Notes:</strong> ${plan.notes.substring(0, 100)}${plan.notes.length > 100 ? '...' : ''}</p>` : ''}
                ${plan.reminderTime ? `<p class="reminder-text"><i class="fas fa-bell"></i> <strong>Reminder:</strong> ${formatDateForDisplay(plan.startDate)} at ${plan.reminderTime}</p>` : ''}
            </div>
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
            <td>${plan.destinationCountry || 'N/A'}</td>
            <td>${plan.city || plan.destinationCity || 'N/A'}</td>
            <td>${travelersList}</td>
            <td>${formatDateForDisplay(plan.startDate)}</td>
            <td>${formatDateForDisplay(plan.endDate)}</td>
            <td>${parseFloat(plan.budgetAmount || 0).toFixed(2)}</td>
            <td>${plan.currency || '₹'}</td>
            <td><span class="status-${(plan.status || 'Planning').toLowerCase().replace(/\s/g, '-')}">${plan.status || 'Planning'}</span></td>
            <td>${plan.notes ? plan.notes.substring(0, 50) + (plan.notes.length > 50 ? '...' : '') : 'N/A'}</td>
            <td>
                <button class="edit-plan-btn" data-id="${plan.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-plan-btn" data-id="${plan.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        travelTableBody.appendChild(row);
    });

    // Event listeners are attached here after elements are rendered
    document.querySelectorAll('.edit-plan-btn').forEach(btn => btn.addEventListener('click', (e) => {
        loadTravelPlanForEdit(parseInt(e.currentTarget.dataset.id));
    }));
    document.querySelectorAll('.delete-plan-btn').forEach(btn => btn.addEventListener('click', (e) => {
        deleteTravelPlan(parseInt(e.currentTarget.dataset.id));
    }));

    updateTotalBudget();
}


// --- TRAVELER INPUT MANAGEMENT FUNCTIONS ---
function addTravelerInput(initialValue = '') {
    const travelersContainer = document.getElementById('travelersContainer');
    if (!travelersContainer) {
        console.error("Travelers container not found.");
        return;
    }
    const travelerCount = travelersContainer.children.length + 1; // For placeholder and id

    const inputGroup = document.createElement('div');
    inputGroup.classList.add('traveler-input-group');
    inputGroup.innerHTML = `
        <input type="text" class="traveler-name" placeholder="Traveler Name ${travelerCount}" value="${initialValue}" />
        <button type="button" class="remove-traveler-btn" title="Remove Traveler"><i class="fas fa-minus-circle"></i></button>
    `;
    travelersContainer.appendChild(inputGroup);

    // Attach event listener to the new remove button
    inputGroup.querySelector('.remove-traveler-btn').addEventListener('click', function() {
        inputGroup.remove();
        updateTravelerPlaceholders();
    });

    updateTravelerPlaceholders();
}

function updateTravelerPlaceholders() {
    const travelerInputs = document.querySelectorAll('.traveler-name');
    travelerInputs.forEach((input, index) => {
        input.placeholder = `Traveler Name ${index + 1}`;
    });

    const removeButtons = document.querySelectorAll('.remove-traveler-btn');
    if (removeButtons.length > 0) {
        // Show all remove buttons if there's more than one input
        if (travelerInputs.length > 1) {
            removeButtons.forEach(btn => btn.style.display = 'inline-block');
        } else {
            // Hide remove button if only one traveler input
            removeButtons.forEach(btn => btn.style.display = 'none');
        }
    }
}


// --- FORM SUBMISSION AND CRUD OPERATIONS ---
document.getElementById('travelPlanForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Crucial: Prevents default form submission (page reload)

    console.log("Travel plan form submitted. Attempting to save..."); // Debugging log

    const planIdInput = document.getElementById('travelPlanId');
    const isEdit = planIdInput && planIdInput.value !== ''; // Check if planIdInput exists before accessing value
    // Using Date.now() for new IDs; ensure script.js's generateUniqueId doesn't clash if also used
    const id = isEdit ? parseInt(planIdInput.value) : Date.now(); 

    // Get input values (add null checks for robustness)
    const planTitle = document.getElementById('planTitle')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    const destinationCountry = document.getElementById('destinationCountry')?.value || '';
    const destinationCity = document.getElementById('destinationCity')?.value || ''; // Capture this value
    const budgetAmount = parseFloat(document.getElementById('budgetAmount')?.value) || 0;
    const currency = document.getElementById('currency')?.value || '₹';
    const status = document.getElementById('status')?.value || 'Planning';
    const notes = document.getElementById('notes')?.value || '';
    const reminderTime = document.getElementById('reminderTime')?.value || '';

    // Capture all traveler names
    const travelerNameInputs = document.querySelectorAll('.traveler-name');
    const travelers = Array.from(travelerNameInputs)
                                    .map(input => input.value.trim())
                                    .filter(name => name !== ''); // Only keep non-empty names

    // Use the default image URL directly, ensuring consistency
    const imageUrl = DEFAULT_CITY_IMAGE;

    const newPlan = {
        id: id,
        planTitle,
        startDate,
        endDate,
        destinationCountry,
        city: destinationCity, // *** IMPORTANT: Use 'city' here to match script.js TravelPlan typedef ***
        travelers,
        imageUrl,
        budgetAmount,
        currency,
        status,
        notes,
        reminderTime
    };

    console.log("New plan object to save:", newPlan); // Debugging log

    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];

    if (isEdit) {
        plans = plans.map(plan => plan.id === id ? newPlan : plan);
        console.log("Plan updated. New plans array:", plans); // Debugging log
    } else {
        plans.push(newPlan);
        console.log("New plan added. New plans array:", plans); // Debugging log
    }

    try {
        localStorage.setItem('travelPlans', JSON.stringify(plans));
        console.log("Travel plans successfully saved to localStorage."); // Debugging log
    } catch (e) {
        console.error("Error saving to localStorage:", e);
        alert("Error saving your travel plan. Local Storage might be full or blocked.");
    }

    saveTravelReminder(id, planTitle, startDate, reminderTime);

    // Reset form and UI
    this.reset();
    if (planIdInput) planIdInput.value = ''; // Reset hidden ID field

    // Update button text and icon
    const addButton = document.querySelector('.add-button');
    if (addButton) {
        addButton.textContent = ' Add Plan';
        if (addButton.firstElementChild && addButton.firstElementChild.tagName === 'I') {
            addButton.firstElementChild.remove();
        }
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-plus-circle');
        addButton.prepend(icon);
    }

    // Clear and re-add the first traveler input after reset
    const travelersContainer = document.getElementById('travelersContainer');
    if (travelersContainer) {
        travelersContainer.innerHTML = ''; // Clear all existing traveler inputs
        addTravelerInput(''); // Re-add the initial empty traveler input
    }
    updateTravelerPlaceholders(); // Ensure correct placeholder and button visibility

    renderTravelPlans(); // Update main travel plans section

    // IMPORTANT: Call renderDashboardUpcomingTrips from the GLOBAL SCOPE or via a global event
    // Ensure script.js is loaded first or this will be undefined.
    if (typeof window.renderDashboardUpcomingTrips === 'function') {
        console.log("Calling renderDashboardUpcomingTrips from travelplans.js");
        window.renderDashboardUpcomingTrips(); // Call the function from script.js
    } else {
        console.warn("window.renderDashboardUpcomingTrips not found. Dashboard will not auto-update immediately.");
        console.warn("This usually means script.js hasn't loaded or executed yet. Check script loading order.");
    }
});

function loadTravelPlanForEdit(id) {
    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    const planToEdit = plans.find(p => p.id === id);

    if (planToEdit) {
        document.getElementById('travelPlanId').value = planToEdit.id;
        document.getElementById('planTitle').value = planToEdit.planTitle;
        document.getElementById('startDate').value = planToEdit.startDate;
        document.getElementById('endDate').value = planToEdit.endDate;
        document.getElementById('destinationCountry').value = planToEdit.destinationCountry;
        document.getElementById('destinationCity').value = planToEdit.city || planToEdit.destinationCity || ''; // Read from 'city' or 'destinationCity'

        // Load travelers
        const travelersContainer = document.getElementById('travelersContainer');
        if (travelersContainer) {
            travelersContainer.innerHTML = ''; // Clear existing inputs
        }

        if (planToEdit.travelers && planToEdit.travelers.length > 0) {
            planToEdit.travelers.forEach(travelerName => {
                addTravelerInput(travelerName); // Re-use the add function to populate
            });
        } else {
            // If no travelers saved, add a single empty input
            addTravelerInput('');
        }
        updateTravelerPlaceholders(); // Ensure correct placeholders and button visibility

        document.getElementById('budgetAmount').value = planToEdit.budgetAmount;
        document.getElementById('currency').value = planToEdit.currency;
        document.getElementById('status').value = planToEdit.status;
        document.getElementById('notes').value = planToEdit.notes;
        document.getElementById('reminderTime').value = planToEdit.reminderTime || '';

        const addButton = document.querySelector('.add-button');
        if (addButton) {
            addButton.textContent = ' Update Plan';
            if (addButton.firstElementChild && addButton.firstElementChild.tagName === 'I') {
                addButton.firstElementChild.remove();
            }
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-save');
            addButton.prepend(icon);
        }

        // Scroll to form (optional, but good for UX)
        const formElement = document.getElementById('travelPlanForm');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }

    } else {
        console.error("Plan not found for editing:", id);
        alert("Travel plan not found!");
    }
}


function deleteTravelPlan(id) {
    if (!confirm("Are you sure you want to delete this travel plan?")) return;
    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem('travelPlans', JSON.stringify(plans));
    let reminders = JSON.parse(localStorage.getItem('travelReminders')) || [];
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('travelReminders', JSON.stringify(reminders));
    renderTravelPlans(); // Update main travel plans section

    // IMPORTANT: Call renderDashboardUpcomingTrips from the GLOBAL SCOPE or via a global event
    if (typeof window.renderDashboardUpcomingTrips === 'function') {
        console.log("Calling renderDashboardUpcomingTrips from travelplans.js after deletion");
        window.renderDashboardUpcomingTrips(); // Call the function from script.js
    } else {
        console.warn("window.renderDashboardUpcomingTrips not found. Dashboard will not auto-update immediately.");
    }
}

function updateTotalBudget() {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    const total = plans.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
    const cell = document.getElementById('totalBudgetCell');
    if (cell) cell.textContent = total.toFixed(2);
}

// --- INITIALIZATION ---
// This ensures that the functions are called when the DOM is ready.
// It's important to render initial data.
document.addEventListener('DOMContentLoaded', () => {
    // Add initial traveler input field on page load
    addTravelerInput('');
    updateTravelerPlaceholders();

    renderTravelPlans();
    checkAllTravelReminders(); // Initial check for any overdue reminders
});

// Event listener for adding new traveler inputs
document.getElementById('addTravelerBtn')?.addEventListener('click', () => addTravelerInput(''));
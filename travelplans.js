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
    // Ensure the date is interpreted as local to avoid timezone issues with display
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// --- CITY TO IMAGE MAPPING (IMPORTANT: EXPAND THIS LIST!) ---
// This object maps city/state names to their corresponding image URLs.
// URLs are now Pinterest-style placeholders where applicable.
const cityImages = {
    // --- Indian Cities & States ---
    "Hyderabad": "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/depositphotos669042260xl-1734400332096.jpg", // Kept as user-provided
    "Mumbai, Maharashtra": "https://i.pinimg.com/564x/mock-mumbai-gateway.jpg", // Pinterest placeholder
    "Delhi": "https://i.pinimg.com/564x/mock-delhi-redfort.jpg", // Pinterest placeholder
    "Bengaluru, Karnataka": "https://i.pinimg.com/564x/mock-bengaluru-garden.jpg", // Pinterest placeholder
    "Chennai, Tamil Nadu": "https://i.ibb.co/5cQ1d9g/chennai-placeholder.jpg", // Chennai keeps its own image (original IBB placeholder, if you want a Pinterest one, find and replace)
    "Kolkata, West Bengal": "https://i.pinimg.com/564x/mock-kolkata-howrah.jpg", // Pinterest placeholder
    "Pune, Maharashtra": "https://i.pinimg.com/564x/mock-pune-fort.jpg", // Pinterest placeholder
    "Ahmedabad, Gujarat": "https://i.pinimg.com/564x/mock-ahmedabad-sidi.jpg", // Pinterest placeholder
    "Jaipur, Rajasthan": "https://i.pinimg.com/564x/mock-jaipur-palace.jpg", // Pinterest placeholder
    "Lucknow, Uttar Pradesh": "https://i.pinimg.com/564x/mock-lucknow-bara.jpg", // Pinterest placeholder
    "Chandigarh": "https://i.pinimg.com/564x/mock-chandigarh-rock.jpg", // Pinterest placeholder
    "Goa": "https://i.pinimg.com/564x/mock-goa-beach.jpg", // Pinterest placeholder
    "Kochi, Kerala": "https://i.pinimg.com/564x/mock-kochi-fisher.jpg", // Pinterest placeholder
    "Srinagar, Jammu and Kashmir": "https://i.pinimg.com/564x/mock-srinagar-dal.jpg", // Pinterest placeholder
    "Udaipur, Rajasthan": "https://i.pinimg.com/564x/mock-udaipur-lake.jpg", // Pinterest placeholder
    "Varanasi, Uttar Pradesh": "https://i.pinimg.com/564x/mock-varanasi-ghat.jpg", // Pinterest placeholder
    "Amritsar, Punjab": "https://i.pinimg.com/564x/mock-amritsar-golden.jpg", // Pinterest placeholder
    "Bhopal, Madhya Pradesh": "https://i.pinimg.com/564x/mock-bhopal-lake.jpg", // Pinterest placeholder
    "Indore, Madhya Pradesh": "https://i.pinimg.com/564x/mock-indore-palace.jpg", // Pinterest placeholder
    "Mysuru, Karnataka": "https://i.pinimg.com/564x/mock-mysuru-palace.jpg", // Pinterest placeholder
    "Shimla, Himachal Pradesh": "https://i.pinimg.com/564x/mock-shimla-mountains.jpg", // Pinterest placeholder
    "Darjeeling, West Bengal": "https://i.pinimg.com/564x/mock-darjeeling-himalayan.jpg", // Pinterest placeholder
    "Agra, Uttar Pradesh": "https://i.pinimg.com/564x/mock-agra-tajmahal.jpg", // Pinterest placeholder
    "Thiruvananthapuram, Kerala": "https://i.pinimg.com/564x/mock-thiruvananthapuram-temple.jpg", // Pinterest placeholder
    "Bhubaneswar, Odisha": "https://i.pinimg.com/564x/mock-bhubaneswar-lingaraj.jpg", // Pinterest placeholder
    "Patna, Bihar": "https://i.pinimg.com/564x/mock-patna-gandhi.jpg", // Pinterest placeholder
    "Guwahati, Assam": "https://i.pinimg.com/564x/mock-guwahati-brahmaputra.jpg", // Pinterest placeholder
    "Ranchi, Jharkhand": "https://i.pinimg.com/564x/mock-ranchi-waterfall.jpg", // Pinterest placeholder
    "Dehradun, Uttarakhand": "https://i.pinimg.com/564x/mock-dehradun-forest.jpg", // Pinterest placeholder
    "Gangtok, Sikkim": "https://i.pinimg.com/564x/mock-gangtok-monastery.jpg", // Pinterest placeholder
    "Shillong, Meghalaya": "https://i.pinimg.com/564x/mock-shillong-waterfall.jpg", // Pinterest placeholder
    "Itanagar, Arunachal Pradesh": "https://i.pinimg.com/564x/mock-itanagar-fort.jpg", // Pinterest placeholder
    "Aizawl, Mizoram": "https://i.pinimg.com/564x/mock-aizawl-hills.jpg", // Pinterest placeholder
    "Kohima, Nagaland": "https://i.pinimg.com/564x/mock-kohima-cemetary.jpg", // Pinterest placeholder
    "Imphal, Manipur": "https://i.pinimg.com/564x/mock-imphal-loktak.jpg", // Pinterest placeholder
    "Agartala, Tripura": "https://i.pinimg.com/564x/mock-agartala-palace.jpg", // Pinterest placeholder
    "Panaji, Goa": "https://i.pinimg.com/564x/mock-goa-beach.jpg", // Pinterest placeholder (duplicate for clarity)
    "Port Blair, Andaman and Nicobar Islands": "https://i.pinimg.com/564x/mock-portblair-cellular.jpg", // Pinterest placeholder
    "Visakhapatnam, Andhra Pradesh": "https://i.pinimg.com/564x/mock-visakhapatnam-beach.jpg", // Pinterest placeholder
    "Amaravati, Andhra Pradesh": "https://i.pinimg.com/564x/mock-amaravati-stupa.jpg", // Pinterest placeholder
    "Raipur, Chhattisgarh": "https://i.pinimg.com/564x/mock-raipur-temple.jpg", // Pinterest placeholder
    "Gandhinagar, Gujarat": "https://i.pinimg.com/564x/mock-gandhinagar-akshardham.jpg", // Pinterest placeholder
    "Puducherry": "https://i.pinimg.com/564x/mock-puducherry-french.jpg", // Pinterest placeholder
    "Leh, Ladakh": "https://i.pinimg.com/564x/mock-leh-monastery.jpg", // Pinterest placeholder
    "Jammu, Jammu and Kashmir": "https://i.pinimg.com/564x/mock-jammu-temple.jpg", // Pinterest placeholder
    "Nagpur, Maharashtra": "https://i.pinimg.com/564x/mock-nagpur-orange.jpg", // Pinterest placeholder
    "Surat, Gujarat": "https://i.pinimg.com/564x/mock-surat-diamond.jpg", // Pinterest placeholder
    "Kanpur, Uttar Pradesh": "https://i.pinimg.com/564x/mock-kanpur-leather.jpg", // Pinterest placeholder
    "Nashik, Maharashtra": "https://i.pinimg.com/564x/mock-nashik-vineyard.jpg", // Pinterest placeholder

    // ALL OTHER TAMIL NADU LOCATIONS GET THE NEW IMAGE (User-provided)
    "Coimbatore, Tamil Nadu": "https://www.tusktravel.com/blog/wp-content/uploads/2023/01/Tamil-Nadu-Visit-in-March.jpg",
    "Madurai, Tamil Nadu": "https://www.tusktravel.com/blog/wp-content/uploads/2023/01/Tamil-Nadu-Visit-in-March.jpg",
    "Tiruchirappalli, Tamil Nadu": "https://www.tusktravel.com/blog/wp-content/uploads/2023/01/Tamil-Nadu-Visit-in-March.jpg",
    "Vellore, Tamil Nadu": "https://www.tusktravel.com/blog/wp-content/uploads/2023/01/Tamil-Nadu-Visit-in-March.jpg",
    "Salem, Tamil Nadu": "https://www.tusktravel.com/blog/wp-content/uploads/2023/01/Tamil-Nadu-Visit-in-March.jpg",
    "Kozhikode, Kerala": "https://i.pinimg.com/564x/mock-kozhikode-beach.jpg", // Pinterest placeholder
    "Mangaluru, Karnataka": "https://i.pinimg.com/564x/mock-mangaluru-temple.jpg", // Pinterest placeholder
    "Nellore, Andhra Pradesh": "https://i.pinimg.com/564x/mock-nellore-lake.jpg", // Pinterest placeholder
    "Warangal, Telangana": "https://i.pinimg.com/564x/mock-warangal-fort.jpg", // Pinterest placeholder
    "Vijayawada, Andhra Pradesh": "https://i.pinimg.com/564x/mock-vijayawada-kanakadurgamma.jpg", // Pinterest placeholder
    "Jodhpur, Rajasthan": "https://i.pinimg.com/564x/mock-jodhpur-bluecity.jpg", // Pinterest placeholder
    "Bikaner, Rajasthan": "https://i.pinimg.com/564x/mock-bikaner-junagarh.jpg", // Pinterest placeholder
    "Jaisalmer, Rajasthan": "https://i.pinimg.com/564x/mock-jaisalmer-goldenfort.jpg", // Pinterest placeholder
    "Ajmer, Rajasthan": "https://i.pinimg.com/564x/mock-ajmer-dargah.jpg", // Pinterest placeholder
    "Pushkar, Rajasthan": "https://i.pinimg.com/564x/mock-pushkar-camel.jpg", // Pinterest placeholder
    "Gwalior, Madhya Pradesh": "https://i.pinimg.com/564x/mock-gwalior-fort.jpg", // Pinterest placeholder
    "Jabalpur, Madhya Pradesh": "https://i.pinimg.com/564x/mock-jabalpur-marble.jpg", // Pinterest placeholder
    "Ujjain, Madhya Pradesh": "https://i.pinimg.com/564x/mock-ujjain-mahakaleshwar.jpg", // Pinterest placeholder
    "Rishikesh, Uttarakhand": "https://i.pinimg.com/564x/mock-rishikesh-ganges.jpg", // Pinterest placeholder
    "Haridwar, Uttarakhand": "https://i.pinimg.com/564x/mock-haridwar-ganga.jpg", // Pinterest placeholder
    "Nainital, Uttarakhand": "https://i.pinimg.com/564x/mock-nainital-lake.jpg", // Pinterest placeholder
    "Mussoorie, Uttarakhand": "https://i.pinimg.com/564x/mock-mussoorie-hills.jpg", // Pinterest placeholder
    "Manali, Himachal Pradesh": "https://i.pinimg.com/564x/mock-manali-valley.jpg", // Pinterest placeholder
    "Dharamshala, Himachal Pradesh": "https://i.pinimg.com/564x/mock-dharamshala-mcleodganj.jpg", // Pinterest placeholder
    "Alappuzha, Kerala": "https://i.pinimg.com/564x/mock-alappuzha-backwaters.jpg", // Pinterest placeholder
    "Thrissur, Kerala": "https://i.pinimg.com/564x/mock-thrissur-pooram.jpg", // Pinterest placeholder
    "Kollam, Kerala": "https://i.pinimg.com/564x/mock-kollam-beach.jpg", // Pinterest placeholder
    "Alleppey, Kerala": "https://i.pinimg.com/564x/mock-alappuzha-backwaters.jpg", // Pinterest placeholder (same as Alappuzha)
    "Hampi, Karnataka": "https://i.pinimg.com/564x/mock-hampi-ruins.jpg", // Pinterest placeholder
    "Dispur, Assam": "https://i.pinimg.com/564x/mock-dispur-assam.jpg", // Pinterest placeholder
    "Kavaratti, Lakshadweep": "https://i.pinimg.com/564x/mock-kavaratti-island.jpg", // Pinterest placeholder
    "Daman, Daman & Diu": "https://i.pinimg.com/564x/mock-daman-beach.jpg", // Pinterest placeholder
    "Silvassa, Dadra & Nagar Haveli": "https://i.pinimg.com/564x/mock-silvassa-garden.jpg", // Pinterest placeholder

    // --- International Cities ---
    "New York": "https://i.pinimg.com/564x/mock-newyork-skyline.jpg", // Pinterest placeholder
    "London": "https://i.pinimg.com/564x/mock-london-bridge.jpg", // Pinterest placeholder
    "Paris": "https://i.pinimg.com/564x/mock-paris-eiffel.jpg", // Pinterest placeholder
    "Dubai": "https://i.pinimg.com/564x/mock-dubai-burjkhalifa.jpg", // Pinterest placeholder
    "Singapore": "https://i.pinimg.com/564x/mock-singapore-gardens.jpg", // Pinterest placeholder
    "Sydney": "https://i.pinimg.com/564x/mock-sydney-opera.jpg", // Pinterest placeholder
    "Rome": "https://i.pinimg.com/564x/mock-rome-colosseum.jpg", // Pinterest placeholder
    "Tokyo": "https://i.pinimg.com/564x/mock-tokyo-skytree.jpg", // Pinterest placeholder
    "San Francisco": "https://i.pinimg.com/564x/mock-sanfrancisco-golden.jpg", // Pinterest placeholder
    "Rio de Janeiro": "https://i.pinimg.com/564x/mock-rio-christ.jpg", // Pinterest placeholder
    "Cairo": "https://i.pinimg.com/564x/mock-cairo-pyramids.jpg", // Pinterest placeholder
    "Bangkok": "https://i.pinimg.com/564x/mock-bangkok-temple.jpg", // Pinterest placeholder
    "Berlin": "https://i.pinimg.com/564x/mock-berlin-gate.jpg", // Pinterest placeholder
    "Barcelona": "https://i.pinimg.com/564x/mock-barcelona-sagrada.jpg", // Pinterest placeholder
    "Amsterdam": "https://i.pinimg.com/564x/mock-amsterdam-canal.jpg", // Pinterest placeholder
    "Toronto": "https://i.pinimg.com/564x/mock-toronto-cntower.jpg", // Pinterest placeholder
    "Vancouver": "https://i.pinimg.com/564x/mock-vancouver-mountains.jpg", // Pinterest placeholder
    "Mexico City": "https://i.pinimg.com/564x/mock-mexicocity-zocalo.jpg", // Pinterest placeholder
    "Buenos Aires": "https://i.pinimg.com/564x/mock-buenosaires-obelisco.jpg", // Pinterest placeholder
    "Cape Town": "https://i.pinimg.com/564x/mock-capetown-tablemountain.jpg", // Pinterest placeholder
    "Moscow": "https://i.pinimg.com/564x/mock-moscow-redsquare.jpg", // Pinterest placeholder
    "Beijing": "https://i.pinimg.com/564x/mock-beijing-greatwall.jpg", // Pinterest placeholder
    "Shanghai": "https://i.pinimg.com/564x/mock-shanghai-bund.jpg", // Pinterest placeholder
    "Seoul": "https://i.pinimg.com/564x/mock-seoul-palace.jpg", // Pinterest placeholder
    "Istanbul": "https://i.pinimg.com/564x/mock-istanbul-hagia.jpg", // Pinterest placeholder
    "Prague": "https://i.pinimg.com/564x/mock-prague-charles.jpg", // Pinterest placeholder
    "Vienna": "https://i.pinimg.com/564x/mock-vienna-palace.jpg", // Pinterest placeholder
    "Lisbon": "https://i.pinimg.com/564x/mock-lisbon-tram.jpg", // Pinterest placeholder
    "Dublin": "https://i.pinimg.com/564x/mock-dublin-castle.jpg", // Pinterest placeholder
    "Edinburgh": "https://i.pinimg.com/564x/mock-edinburgh-castle.jpg", // Pinterest placeholder
    "Zurich": "https://i.pinimg.com/564x/mock-zurich-lake.jpg", // Pinterest placeholder
    "Geneva": "https://i.pinimg.com/564x/mock-geneva-lake.jpg", // Pinterest placeholder
    "Helsinki": "https://i.pinimg.com/564x/mock-helsinki-cathedral.jpg", // Pinterest placeholder
    "Oslo": "https://i.pinimg.com/564x/mock-oslo-opera.jpg", // Pinterest placeholder
    "Stockholm": "https://i.pinimg.com/564x/mock-stockholm-gamla.jpg", // Pinterest placeholder
    "Copenhagen": "https://i.pinimg.com/564x/mock-copenhagen-nyhavn.jpg", // Pinterest placeholder
    "Brussels": "https://i.pinimg.com/564x/mock-brussels-grandplace.jpg", // Pinterest placeholder
    "Warsaw": "https://i.pinimg.com/564x/mock-warsaw-oldtown.jpg", // Pinterest placeholder
    "Budapest": "https://i.pinimg.com/564x/mock-budapest-parliament.jpg", // Pinterest placeholder
    "Athens": "https://i.pinimg.com/564x/mock-athens-acropolis.jpg", // Pinterest placeholder
    "Marrakech": "https://i.pinimg.com/564x/mock-marrakech-square.jpg", // Pinterest placeholder
    "Nairobi": "https://i.pinimg.com/564x/mock-nairobi-safari.jpg", // Pinterest placeholder
    "Johannesburg": "https://i.pinimg.com/564x/mock-johannesburg-city.jpg", // Pinterest placeholder
    "Kyoto": "https://i.pinimg.com/564x/mock-kyoto-bamboo.jpg", // Pinterest placeholder
    "Osaka": "https://i.pinimg.com/564x/mock-osaka-castle.jpg", // Pinterest placeholder
    "Hong Kong": "https://i.pinimg.com/564x/mock-hongkong-victoria.jpg", // Pinterest placeholder
    "Kuala Lumpur": "https://i.pinimg.com/564x/mock-kualalumpur-towers.jpg", // Pinterest placeholder
    "Manila": "https://i.pinimg.com/564x/mock-manila-intramuros.jpg", // Pinterest placeholder
    "Jakarta": "https://i.pinimg.com/564x/mock-jakarta-monas.jpg", // Pinterest placeholder
    "Phuket": "https://i.pinimg.com/564x/mock-phuket-beach.jpg", // Pinterest placeholder
    "Hanoi": "https://i.pinimg.com/564x/mock-hanoi-bay.jpg", // Pinterest placeholder
    "Ho Chi Minh City": "https://i.pinimg.com/564x/mock-hochiminh-pagoda.jpg", // Pinterest placeholder
    "Santiago": "https://i.pinimg.com/564x/mock-santiago-andes.jpg", // Pinterest placeholder
    "Lima": "https://i.pinimg.com/564x/mock-lima-miraflores.jpg", // Pinterest placeholder
    "Bogota": "https://i.pinimg.com/564x/mock-bogota-monserrate.jpg", // Pinterest placeholder
    "Caracas": "https://i.pinimg.com/564x/mock-caracas-avila.jpg", // Pinterest placeholder
    "Quito": "https://i.pinimg.com/564x/mock-quito-equator.jpg", // Pinterest placeholder
    "Reykjavik": "https://i.pinimg.com/564x/mock-reykjavik-hallgrimskirkja.jpg", // Pinterest placeholder
    // Generic fallback for "Other" or unlisted
    "Other": "https://i.pinimg.com/564x/mock-generic-travel.jpg", // Pinterest placeholder
    "Other (Not Listed)": "https://i.pinimg.com/564x/mock-generic-travel.jpg" // Pinterest placeholder
};

const DEFAULT_CITY_IMAGE = "https://i.pinimg.com/564x/mock-generic-travel.jpg"; // Updated default to Pinterest placeholder


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

        // Use the stored imageUrl, or fall back to default if not present or "Other"
        const cardImage = plan.imageUrl && plan.imageUrl !== 'undefined' ? plan.imageUrl : DEFAULT_CITY_IMAGE;

        card.style.backgroundImage = `url('${cardImage}')`; // Set background image
        card.innerHTML = `
            <div class="card-content">
                <h3>${plan.planTitle}</h3>
                <p><strong>Country:</strong> ${plan.destination || 'N/A'}</p>
                <p><strong>City/State:</strong> ${plan.city || 'N/A'}</p>
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
            <td>${plan.destination || 'N/A'}</td>
            <td>${plan.city || 'N/A'}</td> <td>${formatDateForDisplay(plan.startDate)}</td>
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
    });

    document.querySelectorAll('.edit-plan-btn').forEach(btn => btn.onclick = e => loadTravelPlanForEdit(+e.currentTarget.dataset.id)); // Changed to load for edit
    document.querySelectorAll('.delete-plan-btn').forEach(btn => btn.onclick = e => deleteTravelPlan(+e.currentTarget.dataset.id));

    updateTotalBudget();
}

document.getElementById('travelPlanForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const planIdInput = document.getElementById('travelPlanId');
    const isEdit = planIdInput.value !== '';
    const id = isEdit ? parseInt(planIdInput.value) : Date.now(); // Use existing ID if editing

    const planTitle = document.getElementById('planTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const destination = document.getElementById('destination').value;
    const tripCity = document.getElementById('tripCity').value; // Get the city/state value
    const budgetAmount = parseFloat(document.getElementById('budgetAmount').value) || 0;
    const currency = document.getElementById('currency').value;
    const status = document.getElementById('status').value;
    const notes = document.getElementById('notes').value;
    const reminderTime = document.getElementById('reminderTime').value;

    // --- DEBUGGING LOGS ---
    console.log("--- Form Submission Debugging ---");
    console.log("Captured Destination (Country):", destination);
    console.log("Captured Trip City (input value):", tripCity);
    // --- END DEBUGGING LOGS ---

    // Determine the image URL based on the city/state entered
    // Use .trim() and match case carefully with cityImages keys
    const cityKey = tripCity.trim();
    const imageUrl = cityImages[cityKey] || DEFAULT_CITY_IMAGE; // Fallback for unmatched cities

    // --- DEBUGGING LOGS ---
    console.log("CityImages key attempted (after .trim()):", cityKey);
    console.log("Resolved Image URL:", imageUrl);
    console.log("---------------------------------");
    // --- END DEBUGGING LOGS ---

    /**
     * @typedef {Object} TravelPlan
     * @property {number} id - Unique ID for the travel plan.
     * @property {string} planTitle - A title for the trip.
     * @property {string} startDate - Start date of the trip (YYYY-MM-DD).
     * @property {string} endDate - End date of the trip (YYYY-MM-DD).
     * @property {string} destination - The selected country (from dropdown).
     * @property {string} city - The specific city/state of the destination.
     * @property {string} imageUrl - URL of the image associated with the city.
     * @property {number} budgetAmount - The budgeted amount.
     * @property {string} currency - The currency symbol.
     * @property {string} status - Current status of the plan (Planning, Booked, etc.).
     * @property {string} notes - Additional notes or itinerary.
     * @property {string} reminderTime - Optional time for the reminder (HH:MM).
     */
    const newPlan = {
        id: id,
        planTitle,
        startDate,
        endDate,
        destination,
        city: tripCity, // Save the city/state
        imageUrl,      // Save the image URL
        budgetAmount,
        currency,
        status,
        notes,
        reminderTime
    };

    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];

    if (isEdit) {
        plans = plans.map(plan => plan.id === id ? newPlan : plan);
    } else {
        plans.push(newPlan);
    }

    localStorage.setItem('travelPlans', JSON.stringify(plans));
    saveTravelReminder(id, planTitle, startDate, reminderTime); // Use the correct ID for reminder

    this.reset();
    planIdInput.value = ''; // Clear ID after submission
    document.querySelector('.add-button').textContent = ' Add Plan'; // Reset button text
    document.querySelector('.add-button').prepend(document.createElement('i')).classList.add('fas', 'fa-plus-circle');

    renderTravelPlans(); // Crucial for instant update!
});

// Function to load a travel plan's data into the form for editing
function loadTravelPlanForEdit(id) {
    let plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    const planToEdit = plans.find(p => p.id === id);

    if (planToEdit) {
        document.getElementById('travelPlanId').value = planToEdit.id;
        document.getElementById('planTitle').value = planToEdit.planTitle;
        document.getElementById('startDate').value = planToEdit.startDate;
        document.getElementById('endDate').value = planToEdit.endDate;
        document.getElementById('destination').value = planToEdit.destination;
        document.getElementById('tripCity').value = planToEdit.city; // Populate city field
        document.getElementById('budgetAmount').value = planToEdit.budgetAmount;
        document.getElementById('currency').value = planToEdit.currency;
        document.getElementById('status').value = planToEdit.status;
        document.getElementById('notes').value = planToEdit.notes;
        document.getElementById('reminderTime').value = planToEdit.reminderTime || '';

        // Change button text to "Update Plan"
        document.querySelector('.add-button').textContent = ' Update Plan';
        document.querySelector('.add-button').prepend(document.createElement('i')).classList.add('fas', 'fa-save');

        // Scroll to the form
        document.getElementById('travelPlanForm').scrollIntoView({ behavior: 'smooth' });
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
    renderTravelPlans(); // Crucial for instant update!
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
    document.getElementById('cardViewBtn').classList.add('active-view');
    document.getElementById('tableViewBtn').classList.remove('active-view');
};
document.getElementById('tableViewBtn').onclick = () => {
    document.getElementById('cardViewContainer').classList.add('hidden-view');
    document.getElementById('tableViewContainer').classList.remove('hidden-view');
    document.getElementById('cardViewBtn').classList.remove('active-view');
    document.getElementById('tableViewBtn').classList.add('active-view');
};


// --- EXPORT TO CSV ---
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    if (plans.length === 0) {
        alert("No data to export to CSV.");
        return;
    }

    // Updated headers for country and city
    let csv = 'S.No.,Title,Destination (Country),City/State,Start Date,End Date,Budget,Currency,Status,Notes\n';
    plans.forEach((p, i) => {
        // Ensure notes are properly escaped for CSV
        const notesEsc = p.notes ? `"${p.notes.replace(/"/g, '""')}"` : 'N/A';
        const planTitleEsc = p.planTitle ? `"${p.planTitle.replace(/"/g, '""')}"` : 'N/A';
        const destinationEsc = p.destination ? `"${p.destination.replace(/"/g, '""')}"` : 'N/A';
        const cityEsc = p.city ? `"${p.city.replace(/"/g, '""')}"` : 'N/A';

        csv += `${i+1},${planTitleEsc},${destinationEsc},${cityEsc},"${formatDateForDisplay(p.startDate)}","${formatDateForDisplay(p.endDate)}","${(p.budgetAmount || 0).toFixed(2)}","${p.currency || '₹'}",${p.status || 'Planning'},${notesEsc}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `travel_plans_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); // Append link to body
    a.click();
    document.body.removeChild(a); // Clean up
});

// --- EXPORT TO PDF ---
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const plans = JSON.parse(localStorage.getItem('travelPlans')) || [];
    if (plans.length === 0) {
        alert("No data to export to PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // 'landscape' for wider tables

    doc.setFontSize(16);
    doc.text("Travel Plans Report", 14, 20);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

    const rows = plans.map((p, i) => [
        i + 1,
        p.planTitle || 'N/A',
        p.destination || 'N/A',
        p.city || 'N/A', // Added City/State column for PDF
        formatDateForDisplay(p.startDate),
        formatDateForDisplay(p.endDate),
        `${p.currency || '₹'} ${(p.budgetAmount || 0).toFixed(2)}`,
        p.status || 'Planning'
    ]);

    doc.autoTable({
        head: [['#', 'Title', 'Country', 'City/State', 'Start', 'End', 'Budget', 'Status']], // Updated headers
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
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

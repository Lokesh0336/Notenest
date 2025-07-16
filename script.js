// script.js

/**
 * @typedef {Object} Note
 * @property {string} id - A unique identifier for the note.
 * @property {string} title - The title of the note.
 * @property {'Income'|'Expenses'|'Casual Note'} category - The category of the note.
 * @property {string} subcategory - The subcategory (e.g., 'Salary', 'Food', 'Reminder').
 * @property {number} amount - The monetary amount associated with the note (0 for casual notes without amount).
 * @property {string} currency - The currency symbol (e.g., '₹', '$').
 * @property {string} country - The country associated with the currency (e.g., 'India', 'United States').
 * @property {string} [description] - An optional description for the note.
 * @property {string} date - The date of the note in 'YYYY-MM-DD' format.
 */

/**
 * @typedef {Object} TravelPlan
 * @property {string} id - Unique ID for the travel plan.
 * @property {string} destinationCountry - The country or main region (e.g., "India", "United States").
 * @property {string} city - The specific city (e.g., "Hyderabad", "New York").
 * @property {string} startDate - Start date of the trip (YYYY-MM-DD).
 * @property {string} endDate - End date of the trip (YYYY-MM-DD).
 * @property {string} budgetCurrency - Currency for the budget (e.g., '₹', '$').
 * @property {number} budgetAmount - Total budget for the trip.
 * @property {string} status - Current status ('Planning', 'Booked', 'Completed', 'Cancelled').
 * @property {string} [notes] - Optional notes for the travel plan.
 * @property {string} [reminderTime] - Optional time for a reminder.
 */

// Utility function to generate a unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Subcategories data
const subcategoriesData = {
    Expenses: ['Food', 'Bills', 'Shopping', 'Travel', 'Healthcare', 'Loan', 'Tax', 'Savings', 'Insurance', 'Others'],
    Income: ['Salary', 'Freelance', 'Business', 'Investments', 'Interest', 'Gift', 'Others'],
    "Casual Note": ['Reminder', 'Idea', 'Misc']
};

// Function to populate subcategories dropdown (global for onchange event)
function populateSubcategories() {
    const category = document.getElementById('category').value;
    const subcategorySelect = document.getElementById('subcategory');
    subcategorySelect.innerHTML = '<option value="" disabled selected>-- Select Subcategory --</option>'; // Reset options

    if (subcategoriesData[category]) {
        subcategoriesData[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
    }
}

// Global slideshow variables and functions (for dashboard upcoming trips)
let slideIndex = 1; // Start with 1 for human-readable slide numbers
let slideshowInterval;
const AUTO_SLIDE_DELAY = 5000; // 5 seconds for auto-slide

// Function to navigate slideshow forward/backward
function plusSlides(n) {
    showSlides(slideIndex += n);
    resetSlideshowTimer();
}

// Function to go to a specific slide
function currentSlide(n) {
    showSlides(slideIndex = n);
    resetSlideshowTimer();
}

// Function to display specific slide (for upcoming trips slideshow)
function showSlides(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");

    if (slides.length === 0) {
        return;
    }

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Ensure the current slide is displayed as 'flex' for its internal content alignment
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = "flex"; // Changed to flex
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += " active";
    }
}

// Function to start the automatic slideshow
function startSlideshow() {
    clearInterval(slideshowInterval); // Clear any existing interval
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length > 1) { // Only start if there's more than one slide
        slideshowInterval = setInterval(() => {
            plusSlides(1);
        }, AUTO_SLIDE_DELAY);
    }
}

// Function to reset the slideshow timer on manual navigation
function resetSlideshowTimer() {
    clearInterval(slideshowInterval);
    startSlideshow();
}


// Function to delete notes
function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        /** @type {Note[]} */
        let currentNotes = JSON.parse(localStorage.getItem("notes")) || [];
        currentNotes = currentNotes.filter(note => note.id !== id);
        saveNotes(currentNotes);

        // Re-render notes using the current view (card/table)
        renderNotes(document.getElementById("filterCategory").value, currentViewNotes);
        updateCategoryChart();
        updateTotals();
    }
}

// Define variables globally or within the scope where they are used
let currentViewNotes = 'card'; // Set card view as default for notes

// Needs to be accessible by updateCategoryChart
let categoryChartInstance;

// Everything within window.onload ensures the DOM is fully loaded before script runs
window.onload = function () {
    // DOM Element References (caching them for performance)
    const cardViewContainerNotes = document.getElementById('cardViewContainerNotes');
    const tableViewContainerNotes = document.getElementById('tableViewContainerNotes');
    const notesTableBody = document.getElementById('notesTableBody');
    // Renamed IDs for notes view buttons to avoid conflict with travelplans.js
    const cardViewBtnNotes = document.getElementById('cardViewBtnNotes');
    const tableViewBtnNotes = document.getElementById('tableViewBtnNotes');

    const dashboardTotalIncome = document.getElementById('dashboardTotalIncome');
    const dashboardTotalExpenses = document.getElementById('dashboardTotalExpenses');
    const dashboardCasualCount = document.getElementById('dashboardCasualCount');
    const dashboardCasualAmount = document.getElementById('dashboardCasualAmount');
    const noteForm = document.getElementById("noteForm");
    const filterCategorySelect = document.getElementById("filterCategory");
    const noNotesMessage = document.getElementById('noNotesMessage');

    // Elements for upcoming trips slideshow
    const upcomingTripsSection = document.getElementById('upcoming-trips-section');
    const slideshowContainer = document.querySelector('.slideshow-container'); // Get the container
    const tripSlidesContainer = document.getElementById('tripSlides');
    const slideshowDotsContainer = document.getElementById('slideshow-dots');
    const noUpcomingTripsMessage = document.getElementById('noUpcomingTripsMessage');

    // Navigation buttons for slideshow (for dashboard upcoming trips)
    const prevButton = document.querySelector('#upcoming-trips-section .prev');
    const nextButton = document.querySelector('#upcoming-trips-section .next');


    // Function to save notes to localStorage
    function saveNotes(notesArray) {
        try {
            localStorage.setItem("notes", JSON.stringify(notesArray));
        } catch (e) {
            console.error("Error saving notes to localStorage:", e);
            alert("Could not save notes. Your browser's storage might be full or blocked.");
        }
    }

    // Event listener for adding a new note via form submission
    noteForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const currencyCountryValue = document.getElementById("currencyCountry").value;
        const [currency, country] = currencyCountryValue.split(" - ");

        /** @type {Note} */
        const newNote = {
            id: generateUniqueId(),
            title: document.getElementById("noteTitle").value.trim(),
            category: document.getElementById("category").value,
            subcategory: document.getElementById("subcategory").value,
            amount: parseFloat(document.getElementById("amount").value || 0),
            currency: currency.trim(),
            country: country ? country.trim() : "Others",
            description: document.getElementById("description").value.trim() || "",
            date: document.getElementById("noteDate").value
        };

        if (!newNote.title || !newNote.category || !newNote.subcategory) {
            alert("Please fill in all required fields (Title, Category, Subcategory).");
            return;
        }
        if (newNote.category !== 'Casual Note' && newNote.amount <= 0) {
            alert("Amount must be greater than 0 for Expenses and Income notes.");
            return;
        }

        /** @type {Note[]} */
        let currentNotes = JSON.parse(localStorage.getItem("notes")) || [];
        currentNotes.push(newNote);
        saveNotes(currentNotes);

        // Re-render and update all dashboard components
        renderNotes(filterCategorySelect.value, currentViewNotes);
        updateCategoryChart();
        updateTotals();

        // Reset the form
        this.reset();
        document.getElementById("noteDate").value = new Date().toISOString().split('T')[0];
        populateSubcategories();
    });

    // Function to render notes into both card and table views
    function renderNotes(filter = "All", viewType = currentViewNotes) {
        /** @type {Note[]} */
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const filtered = filter === "All" ? sortedNotes : sortedNotes.filter(n => n.category === filter);

        cardViewContainerNotes.innerHTML = "";
        notesTableBody.innerHTML = "";

        if (filtered.length === 0) {
            noNotesMessage.classList.remove('hidden');
            cardViewContainerNotes.innerHTML = "";
            notesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #777; padding: 20px;">No notes match your filter.</td></tr>`;
        } else {
            noNotesMessage.classList.add('hidden');
        }

        // Populate Card View
        filtered.forEach(note => {
            const div = document.createElement("div");
            div.className = `note-card ${note.category.toLowerCase().replace(/\s/g, '-')}`;
            const amountDisplay = (note.category === 'Casual Note' && (note.amount || 0) === 0)
                                     ? `<span class="casual-description-display">Description: ${note.description || 'N/A'}</span>`
                                     : `<span class="${note.category === 'Expenses' ? 'expense-amount' : 'income-amount'}">${note.currency}${(note.amount || 0).toFixed(2)}</span>`;

            div.innerHTML = `
                <h4>${note.title}</h4>
                <p class="category-info"><strong>${note.category} &gt; ${note.subcategory}</strong></p>
                <p class="card-amount-display">${amountDisplay}</p>
                <p class="date-country">${note.country} &bull; ${new Date(note.date).toLocaleDateString()}</p>
                ${(note.category !== 'Casual Note' || (note.amount || 0) > 0) && note.description ? `<p class="description-text">Description: ${note.description}</p>` : ""}
                <div class="card-actions">
                    <button onclick="deleteNote('${note.id}')" title="Delete Note" class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            cardViewContainerNotes.appendChild(div);
        });

        // Populate Table View
        filtered.forEach(note => {
            const row = document.createElement("tr");
            row.className = `${note.category.toLowerCase().replace(/\s/g, '-')}-row`;

            const tableAmountDisplay = (note.category === 'Casual Note' && (note.amount || 0) === 0)
                                            ? '-'
                                            : `${note.currency}${(note.amount || 0).toFixed(2)}`;

            const amountClass = note.category === 'Expenses' ? 'expense-amount-table' : (note.category === 'Income' ? 'income-amount-table' : '');
            const currencySymbol = note.currency || '-';
            const countryName = note.country || '-';

            row.innerHTML = `
                <td>${note.title}</td>
                <td>${note.category}</td>
                <td>${note.subcategory}</td>
                <td class="${amountClass}">${tableAmountDisplay}</td>
                <td>${currencySymbol}</td>
                <td>${countryName}</td>
                <td>${new Date(note.date).toLocaleDateString()}</td>
                <td>${note.description || '-'}</td>
                <td>
                    <button onclick="deleteNote('${note.id}')" class="table-action-btn delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            notesTableBody.appendChild(row);
        });

        switchViewNotes(viewType, false); // Use switchViewNotes
    }

    // Event listener for filtering notes by category dropdown
    filterCategorySelect.addEventListener("change", function () {
        renderNotes(this.value, currentViewNotes); // Use currentViewNotes
    });

    function updateCategoryChart() {
        /** @type {Note[]} */
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        const ctx = document.getElementById("categoryChart").getContext("2d");
        const totals = { Expenses: 0, Income: 0, 'Casual Note': 0 };
        let casualNoteCount = 0;

        notes.forEach(note => {
            if (note.category === 'Casual Note') {
                casualNoteCount++;
                if ((note.amount || 0) > 0) {
                    totals['Casual Note'] += note.amount;
                }
            } else if (totals[note.category] !== undefined) {
                totals[note.category] += note.amount || 0;
            }
        });

        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Expenses', 'Income', 'Casual Notes'],
                datasets: [{
                    data: [totals.Expenses, totals.Income, totals['Casual Note']],
                    backgroundColor: ['#f94144', '#43aa8b', '#577590'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 13,
                                family: 'Poppins'
                            },
                            color: '#333'
                        }
                    },
                    tooltip: {
                        bodyFont: { size: 12, family: 'Poppins' },
                        titleFont: { size: 14, family: 'Poppins', weight: 'bold' },
                        padding: 10,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    if (context.label === 'Casual Notes') {
                                        if (totals['Casual Note'] > 0) {
                                            label += '₹' + totals['Casual Note'].toFixed(2);
                                        } else {
                                            label += casualNoteCount + ' items';
                                        }
                                    } else {
                                        label += '₹' + context.parsed.toFixed(2);
                                    }
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Function to update dashboard total income, expenses, and casual note count
    function updateTotals() {
        /** @type {Note[]} */
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        let income = 0, expenses = 0, casualCount = 0;
        let casualAmountTotal = 0;

        notes.forEach(note => {
            if (note.category === "Income") income += note.amount || 0;
            else if (note.category === "Expenses") expenses += note.amount || 0;
            else if (note.category === "Casual Note") {
                casualCount++;
                casualAmountTotal += note.amount || 0;
            }
        });

        dashboardTotalIncome.textContent = `Total: ₹${income.toFixed(2)}`;
        dashboardTotalExpenses.textContent = `Total: ₹${expenses.toFixed(2)}`;
        dashboardCasualCount.textContent = casualCount;
        dashboardCasualAmount.textContent = casualAmountTotal.toFixed(2);
    }

    // View Switching Logic for Card/Table view for NOTES
    function switchViewNotes(viewType, triggerRender = true) {
        currentViewNotes = viewType;

        cardViewBtnNotes.classList.remove('active-view');
        tableViewBtnNotes.classList.remove('active-view');

        if (viewType === 'card') {
            cardViewBtnNotes.classList.add('active-view');
            cardViewContainerNotes.classList.remove('hidden-view');
            tableViewContainerNotes.classList.add('hidden-view');
        } else {
            tableViewBtnNotes.classList.add('active-view');
            cardViewContainerNotes.classList.add('hidden-view');
            tableViewContainerNotes.classList.remove('hidden-view');
        }

        if (triggerRender) {
            renderNotes(filterCategorySelect.value, currentViewNotes);
        }
    }

    // Event listeners for notes view toggle buttons
    if (cardViewBtnNotes) { // Check if element exists before adding listener
        cardViewBtnNotes.addEventListener('click', () => switchViewNotes('card'));
    }
    if (tableViewBtnNotes) { // Check if element exists before adding listener
        tableViewBtnNotes.addEventListener('click', () => switchViewNotes('table'));
    }


    // --- CODE FOR UPCOMING TRIPS SLIDESHOW ON DASHBOARD ---

    // Function to render upcoming trips slideshow for the Dashboard
    function renderDashboardUpcomingTrips() {
        /** @type {TravelPlan[]} */
        const allTravelPlans = JSON.parse(localStorage.getItem("travelPlans") || "[]");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        // Filter for "Planning" or "Booked" status AND start date today or in the future
        const upcomingTrips = allTravelPlans.filter(plan => {
            const planStartDate = new Date(plan.startDate);
            planStartDate.setHours(0, 0, 0, 0);
            return (plan.status === 'Planning' || plan.status === 'Booked') && planStartDate >= today;
        }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by closest date first

        // Debugging: Check how many upcoming trips are found
        console.log("Found upcoming trips:", upcomingTrips.length, upcomingTrips);


        if (!slideshowContainer || !tripSlidesContainer || !slideshowDotsContainer || !noUpcomingTripsMessage || !prevButton || !nextButton) {
            console.error("One or more dashboard upcoming trips elements not found. Skipping dashboard rendering.");
            return;
        }

        tripSlidesContainer.innerHTML = ''; // Clear previous slides
        slideshowDotsContainer.innerHTML = ''; // Clear previous dots

        if (upcomingTrips.length === 0) {
            noUpcomingTripsMessage.classList.remove('hidden');
            // Hide navigation buttons and dots if no trips
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            clearInterval(slideshowInterval); // Stop auto-slide if no trips
            slideshowContainer.style.display = 'none'; // Hide the entire slideshow container
            return;
        } else {
            noUpcomingTripsMessage.classList.add('hidden');
            slideshowContainer.style.display = 'block'; // Show the entire slideshow container

            // Show navigation buttons only if there's more than one trip
            if (upcomingTrips.length > 1) {
                prevButton.style.display = 'flex'; // Use flex to center arrow
                nextButton.style.display = 'flex'; // Use flex to center arrow
                slideshowDotsContainer.style.display = 'block'; // Show dots
            } else { // Only one trip, hide arrows and dots
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
                slideshowDotsContainer.style.display = 'none';
            }
        }

        upcomingTrips.forEach((plan, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('mySlides', 'fade', 'dashboard-upcoming-trip-card');

            // --- Refined City/Country Display Logic ---
            let locationParts = [];
            // Ensure city and country are treated as valid strings, trimming whitespace
            const city = (plan.city && typeof plan.city === 'string') ? plan.city.trim() : '';
            const country = (plan.destinationCountry && typeof plan.destinationCountry === 'string') ? plan.destinationCountry.trim() : '';

            // Debugging: Log the raw values and processed values
            console.log(`Processing Plan ID: ${plan.id}`);
            console.log(`  Raw City: '${plan.city}', Raw Country: '${plan.destinationCountry}'`);
            console.log(`  Trimmed City: '${city}', Trimmed Country: '${country}'`);

            if (city !== '') {
                locationParts.push(city);
            }
            if (country !== '') {
                locationParts.push(country);
            }
            const locationDisplay = locationParts.length > 0 ? locationParts.join(', ') : 'N/A';
            console.log(`  Final Location Display: '${locationDisplay}'`);


            // The `trip-details-overlay` will now have a plain background color via CSS
            slideDiv.innerHTML = `
                <div class="numbertext">${index + 1} / ${upcomingTrips.length}</div>
                <div class="trip-details-overlay">
                     <h4 class="trip-title">${plan.planTitle}</h4>
                     <p class="trip-destination">${locationDisplay}</p>
                     <p class="trip-dates">${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}</p>
                     <p class="trip-travelers">Travelers: ${(plan.travelers && plan.travelers.length > 0) ? plan.travelers.join(', ') : 'N/A'}</p>
                     <p class="trip-budget">Budget: ${plan.budgetCurrency || '₹'} ${parseFloat(plan.budgetAmount || 0).toFixed(2)}</p>
                     <p class="trip-status">Status: <span class="status-${(plan.status || 'Planning').toLowerCase().replace(/\s/g, '-')}">${plan.status || 'Planning'}</span></p>
                </div>
            `;
            tripSlidesContainer.appendChild(slideDiv);

            const dotSpan = document.createElement('span');
            dotSpan.classList.add('dot');
            dotSpan.onclick = () => currentSlide(index + 1);
            slideshowDotsContainer.appendChild(dotSpan);
        });

        // Initialize slideshow
        slideIndex = 0; // Reset slide index before showing first slide (showSlides will increment it to 1)
        showSlides(1); // Show the first slide (which is index 0 in array, but 1 for human count)
        startSlideshow(); // Start auto-slide (will only run if >1 slide)
    }

    // Expose renderDashboardUpcomingTrips to the global scope if travelplans.js needs to call it
    window.renderDashboardUpcomingTrips = renderDashboardUpcomingTrips;

    // Initial renders and updates when the page loads
    document.getElementById("noteDate").value = new Date().toISOString().split('T')[0]; // Set default date for quick note
    populateSubcategories(); // Initial population for quick note form
    renderNotes(filterCategorySelect.value, currentViewNotes); // Render notes (expenses/income/casual)
    updateCategoryChart(); // Update dashboard chart
    updateTotals(); // Update dashboard total income/expenses/casual counts

    // Crucially, call the dashboard trip rendering after all elements are loaded
    renderDashboardUpcomingTrips();


    // Event listener for tab switching to re-render relevant sections
    document.addEventListener('DOMContentLoaded', () => {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');

                // If the travel plans tab is clicked, re-render it
                if (tabId === 'travel-plans-section') {
                    if (typeof renderTravelPlans === 'function') {
                        renderTravelPlans(); // Ensure the main travel plans table/cards are updated
                    }
                }
                // If the dashboard tab is clicked, re-render it
                if (tabId === 'dashboard-section') {
                    renderDashboardUpcomingTrips(); // Refresh dashboard on tab switch
                }
            });
        });

        // Activate default tab on load (e.g., dashboard)
        const defaultTab = document.querySelector('.tab-button.active');
        if (defaultTab) {
            defaultTab.click(); // Simulate a click to activate and render its content
        } else {
            // Fallback if no active class, activate the first tab or a specific one
            const firstTab = document.querySelector('.tab-button');
            if (firstTab) {
                firstTab.click();
            } else {
                // If no tabs, just render the dashboard content if it's visible by default
                renderDashboardUpcomingTrips();
            }
        }
    });

}; // End of window.onload

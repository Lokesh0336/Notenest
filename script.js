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
 * @property {string} planTitle - A title for the trip (e.g., "Europe Adventure").
 * @property {string} destination - The travel destination.
 * @property {string} startDate - Start date of the trip (YYYY-MM-DD).
 * @property {string} endDate - End date of the trip (YYYY-MM-DD).
 * @property {string} budgetCurrency - Currency for the budget (e.g., '₹', '$').
 * @property {number} budgetAmount - Total budget for the trip.
 * @property {string} status - Current status ('Planning', 'Booked', 'Completed', 'Cancelled').
 * @property {string} [notes] - Optional notes for the travel plan.
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

// Slideshow variables
let slideIndex = 0;
let slideshowInterval;
const AUTO_SLIDE_DELAY = 5000; // 5 seconds for auto-slide

// Global functions for slideshow navigation (made truly global)
function plusSlides(n) {
    showSlides(slideIndex += n);
    resetSlideshowTimer();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetSlideshowTimer();
}

// Function to display specific slide (made truly global)
function showSlides(n) {
    const slides = document.getElementsByClassName("trip-slide");
    const dots = document.getElementsByClassName("dot");

    if (slides.length === 0) { // No slides to show
        return;
    }

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Ensure slideIndex is valid for array access
    if (slideIndex - 1 >= 0 && slideIndex - 1 < slides.length) {
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }
}

// Function to start the automatic slideshow (made truly global)
function startSlideshow() {
    clearInterval(slideshowInterval); // Ensure only one interval is running
    const slides = document.getElementsByClassName("trip-slide");
    if (slides.length > 0) { // Only start if there are slides
        slideshowInterval = setInterval(() => {
            plusSlides(1);
        }, AUTO_SLIDE_DELAY);
    }
}

// Function to reset the slideshow timer on manual navigation (made truly global)
function resetSlideshowTimer() {
    clearInterval(slideshowInterval);
    startSlideshow();
}


// Function to delete notes (made truly global)
function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        /** @type {Note[]} */
        let currentNotes = JSON.parse(localStorage.getItem("notes")) || [];
        currentNotes = currentNotes.filter(note => note.id !== id);
        saveNotes(currentNotes);

        // Re-render and update UI to reflect changes
        // Access elements from within the window.onload scope, or pass them
        // For simplicity, we'll refetch them if needed, or rely on functions
        // being called from within the onload scope.
        // The render and update functions are within the onload scope, so direct call should be fine after initialization.
        renderNotes(document.getElementById("filterCategory").value, currentView); // currentView needs to be accessible
        updateCategoryChart();
        updateTotals();
    }
}

// Define variables globally or within the scope where they are used
let currentView = 'card'; // Set card view as default, needs to be accessible by deleteNote
let categoryChartInstance; // Needs to be accessible by updateCategoryChart

// Everything within window.onload ensures the DOM is fully loaded before script runs
window.onload = function () {
    // DOM Element References (caching them for performance)
    const cardViewContainer = document.getElementById('cardViewContainer');
    const tableViewContainer = document.getElementById('tableViewContainer');
    const notesTableBody = document.getElementById('notesTableBody');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const dashboardTotalIncome = document.getElementById('dashboardTotalIncome');
    const dashboardTotalExpenses = document.getElementById('dashboardTotalExpenses');
    const dashboardCasualCount = document.getElementById('dashboardCasualCount');
    const dashboardCasualAmount = document.getElementById('dashboardCasualAmount');
    // const calculatorToggle = document.getElementById('calculator-toggle'); // This element doesn't seem to be in index.html, comment out if not present
    // const calculatorIframe = document.getElementById('calculator-iframe'); // This element doesn't seem to be in index.html, comment out if not present
    const noteForm = document.getElementById("noteForm");
    const filterCategorySelect = document.getElementById("filterCategory");
    const noNotesMessage = document.getElementById('noNotesMessage');

    // Elements for upcoming trips slideshow
    const upcomingTripsSection = document.getElementById('upcoming-trips-section');
    const tripSlidesContainer = document.getElementById('tripSlides');
    const slideshowDotsContainer = document.getElementById('slideshow-dots');
    const noUpcomingTripsMessage = document.getElementById('noUpcomingTripsMessage'); // Corrected ID

    // Function to save notes to localStorage
    function saveNotes(notesArray) {
        try {
            localStorage.setItem("notes", JSON.stringify(notesArray));
            console.log("Notes saved successfully.");
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
        renderNotes(filterCategorySelect.value, currentView);
        updateCategoryChart();
        updateTotals();

        // Reset the form
        this.reset();
        document.getElementById("noteDate").value = new Date().toISOString().split('T')[0];
        populateSubcategories();
    });

    // Function to render notes into both card and table views
    function renderNotes(filter = "All", viewType = currentView) {
        /** @type {Note[]} */
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const filtered = filter === "All" ? sortedNotes : sortedNotes.filter(n => n.category === filter);

        cardViewContainer.innerHTML = "";
        notesTableBody.innerHTML = "";

        if (filtered.length === 0) {
            noNotesMessage.classList.remove('hidden');
            cardViewContainer.innerHTML = "";
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
            cardViewContainer.appendChild(div);
        });

        // Populate Table View
        filtered.forEach(note => {
            const row = document.createElement("tr");
            row.className = `${note.category.toLowerCase().replace(/\s/g, '-')}-row`;

            const tableAmountDisplay = (note.category === 'Casual Note' && (note.amount || 0) === 0)
                                            ? '-'
                                            : `${note.currency}${(note.amount || 0).toFixed(2)}`;

            const amountClass = note.category === 'Expenses' ? 'expense-amount-table' : (note.category === 'Income' ? 'income-amount-table' : '');
            // Corrected: currencyCountry is not directly stored as a single string field on Note, but currency and country are.
            // If you want a combined display, use the separate fields.
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

        switchView(viewType, false);
    }

    // Event listener for filtering notes by category dropdown
    filterCategorySelect.addEventListener("change", function () {
        renderNotes(this.value, currentView);
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

    // View Switching Logic for Card/Table view
    function switchView(viewType, triggerRender = true) {
        currentView = viewType;

        cardViewBtn.classList.remove('active-view');
        tableViewBtn.classList.remove('active-view');

        if (viewType === 'card') {
            cardViewBtn.classList.add('active-view');
            cardViewContainer.classList.remove('hidden-view');
            tableViewContainer.classList.add('hidden-view');
        } else {
            tableViewBtn.classList.add('active-view');
            cardViewContainer.classList.add('hidden-view');
            tableViewContainer.classList.remove('hidden-view');
        }

        if (triggerRender) {
            renderNotes(filterCategorySelect.value, currentView);
        }
    }

    // Event listeners for view toggle buttons
    cardViewBtn.addEventListener('click', () => switchView('card'));
    tableViewBtn.addEventListener('click', () => switchView('table'));

    // // Calculator Toggle Functionality - Commented out as elements are not in index.html
    // if (calculatorToggle && calculatorIframe) {
    //     calculatorToggle.addEventListener('click', function (event) {
    //         event.preventDefault();
    //         calculatorIframe.classList.toggle('active');
    //         if (calculatorIframe.classList.contains('active')) {
    //             calculatorIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         }
    //     });
    // }


    // Function to get only upcoming travel plans with 'Planning' or 'Booked' status
    function getUpcomingTrips() {
        /** @type {TravelPlan[]} */
        const allTravelPlans = JSON.parse(localStorage.getItem("travelPlans") || "[]");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        // Filter for "Planning" or "Booked" status AND start date today or in the future
        return allTravelPlans.filter(plan => {
            const planStartDate = new Date(plan.startDate);
            planStartDate.setHours(0, 0, 0, 0); // Normalize plan's start date

            const isRelevantStatus = plan.status === 'Planning' || plan.status === 'Booked';
            const isUpcoming = planStartDate >= today;

            return isRelevantStatus && isUpcoming;
        }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by start date ascending
    }

    // Function to render the upcoming trips slideshow
    function renderUpcomingTripsSlideshow() {
        const upcomingTrips = getUpcomingTrips();

        tripSlidesContainer.innerHTML = ''; // Clear previous slides
        slideshowDotsContainer.innerHTML = ''; // Clear previous dots
        clearInterval(slideshowInterval); // Clear any existing auto-slide interval

        const prevButton = document.querySelector('#upcoming-trips-section .prev');
        const nextButton = document.querySelector('#upcoming-trips-section .next');

        if (upcomingTrips.length === 0) {
            // If no upcoming trips, hide the slideshow container and show the message
            tripSlidesContainer.style.display = 'none';
            slideshowDotsContainer.style.display = 'none';
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            noUpcomingTripsMessage.classList.remove('hidden'); // Show "no trips" message
        } else {
            // If trips exist, show the slideshow container and hide the message
            tripSlidesContainer.style.display = 'flex'; // Use flex for horizontal slides
            slideshowDotsContainer.style.display = 'block';
            if (prevButton) prevButton.style.display = 'block';
            if (nextButton) nextButton.style.display = 'block';
            noUpcomingTripsMessage.classList.add('hidden'); // Hide "no trips" message

            upcomingTrips.forEach((trip, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'trip-slide fade';

                const startDate = new Date(trip.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const endDate = new Date(trip.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                slideDiv.innerHTML = `
                    <h4>${trip.planTitle || trip.destination}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> Destination: ${trip.destination}</p>
                    <p><i class="fas fa-calendar-alt"></i> Dates: ${startDate} - ${endDate}</p>
                    <p><i class="fas fa-money-bill-wave"></i> Budget: ${trip.budgetCurrency}${(trip.budgetAmount || 0).toFixed(2)}</p>
                    <p><i class="fas fa-tasks"></i> Status: <span class="status-${trip.status.toLowerCase()}">${trip.status}</span></p>
                    ${trip.notes ? `<p><i class="fas fa-info-circle"></i> Notes: ${trip.notes}</p>` : ''}
                `;
                tripSlidesContainer.appendChild(slideDiv);

                const dotSpan = document.createElement('span');
                dotSpan.className = 'dot';
                dotSpan.onclick = () => currentSlide(index + 1);
                slideshowDotsContainer.appendChild(dotSpan);
            });

            slideIndex = 0; // Reset slide index for fresh start
            showSlides(1); // Show the first slide
            startSlideshow(); // Start auto-sliding
        }
    }

    // Initialize the date input to today's date
    document.getElementById("noteDate").value = new Date().toISOString().split('T')[0];

    // Initial render calls on page load
    populateSubcategories(); // Populate subcategories for the default selected category
    renderNotes("All", "card"); // Render all notes initially in card view
    updateCategoryChart(); // Update chart with initial data
    updateTotals(); // Update income/expense totals
    renderUpcomingTripsSlideshow(); // Render upcoming trips slideshow on page load

    // Listen for changes in localStorage to update travel plans
    window.addEventListener('storage', (event) => {
        if (event.key === 'travelPlans') {
            console.log("travelPlans localStorage changed. Updating slideshow.");
            renderUpcomingTripsSlideshow();
        }
        if (event.key === 'notes') { // Also listen for notes changes
            console.log("Notes localStorage changed. Updating dashboard.");
            renderNotes(filterCategorySelect.value, currentView);
            updateCategoryChart();
            updateTotals();
        }
    });
}; // End of window.onload

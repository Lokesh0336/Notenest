// Subcategories for each main category
const subcategoryMap = {
  "OTT": ["Netflix", "Amazon Prime", "Hotstar", "SonyLIV", "Zee5", "YouTube Premium", "Apple TV+", "Others"],
  "Home Bills": ["Electricity", "Water", "Gas", "Rent", "Maintenance", "Others"],
  "Education": ["School Fees", "Online Courses", "Books", "Others"],
  "EMI/Loans": ["Car Loan", "Home Loan", "Personal Loan", "Credit Card EMI", "Others"],
  "Fitness & Wellness": ["Gym", "Yoga", "Meditation", "Others"],
  "Internet & Mobile": ["Internet", "Mobile Recharge", "Others"],
  "Others": ["Others"]
};

// Populate subcategories
function populateSubcategories() {
  const mainCat = document.getElementById("mainCategory").value;
  const subCat = document.getElementById("subCategory");
  const customInput = document.getElementById("customSubCategory");

  subCat.innerHTML = '<option value="" disabled selected>Select Subcategory</option>';

  if (subcategoryMap[mainCat]) {
    subcategoryMap[mainCat].forEach(sc => {
      const opt = document.createElement("option");
      opt.value = sc;
      opt.textContent = sc;
      subCat.appendChild(opt);
    });
  }

  customInput.style.display = "none";
}

// Show textbox if subcategory is "Others"
function toggleCustomSubcategory() {
  const selected = document.getElementById("subCategory").value;
  const customInput = document.getElementById("customSubCategory");
  customInput.style.display = (selected === "Others") ? "block" : "none";
}

// Show textbox if payment type is "Others"
function toggleCustomPaymentType() {
  const selected = document.getElementById("paymentType").value;
  const customInput = document.getElementById("customPaymentType");
  customInput.style.display = (selected === "Others") ? "block" : "none";
}

// Save new bill/subscription
document.getElementById("billForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const [currency, country] = document.getElementById("currencyCountry").value.split(" - ");

  // Handle subcategory
  let subcategoryValue = document.getElementById("subCategory").value;
  if (subcategoryValue === "Others") {
    const custom = document.getElementById("customSubCategory").value.trim();
    if (custom) subcategoryValue = custom;
  }

  // Handle payment type
  let paymentType = document.getElementById("paymentType").value;
  if (paymentType === "Others") {
    const custom = document.getElementById("customPaymentType").value.trim();
    if (custom) paymentType = custom;
  }

  const newBill = {
    date: document.getElementById("date").value,
    mainCategory: document.getElementById("mainCategory").value,
    subCategory: subcategoryValue,
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    amount: parseFloat(document.getElementById("amount").value),
    currencyCountry: `${currency} - ${country}`,
    type: document.getElementById("type").value,
    autopay: document.getElementById("autopay").checked,
    paymentType: paymentType
  };

  // Save in localStorage (bills)
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push(newBill);
  localStorage.setItem("bills", JSON.stringify(bills));

  // Also save to 'notes' for Reports (mark as Expense)
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push({
    date: newBill.date,
    title: newBill.title,
    description: newBill.description,
    amount: newBill.amount,
    category: "Expenses",  // <--- Important: classify as Expense
    subcategory: `Bills & Subscriptions - ${newBill.mainCategory} > ${newBill.subCategory}`,
    currency: currency,
    country: country || "Unknown"
  });
  localStorage.setItem("notes", JSON.stringify(notes));

  // Reset form
  this.reset();
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  populateSubcategories();
  toggleCustomPaymentType();
  loadBills();
});

// Load bills and filter by month & year
function loadBills() {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const tbody = document.getElementById("billsTableBody");
  const selectedMonth = document.getElementById("filterMonth")?.value || "all";
  const selectedYear = document.getElementById("filterYear")?.value || "all";
  tbody.innerHTML = "";

  const filtered = bills.filter(bill => {
    const d = new Date(bill.date);
    const matchMonth = selectedMonth === "all" || d.getMonth() === parseInt(selectedMonth);
    const matchYear = selectedYear === "all" || d.getFullYear() === parseInt(selectedYear);
    return matchMonth && matchYear;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11">No entries found for selected month/year.</td></tr>`;
    return;
  }

  filtered.forEach((bill, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${new Date(bill.date).toLocaleDateString()}</td>
      <td>${bill.mainCategory}</td>
      <td>${bill.subCategory}</td>
      <td>${bill.title}</td>
      <td>${bill.amount.toFixed(2)}</td>
      <td>${bill.type}</td>
      <td>${bill.currencyCountry}</td>
      <td>${bill.paymentType || "-"}</td>
      <td>${bill.autopay ? "Yes" : "No"}</td>
      <td>${bill.description || "-"}</td>
    `;
    tbody.appendChild(row);
  });
}

// Populate year filter dropdown
function populateYearDropdown() {
  const yearSelect = document.getElementById("filterYear");
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '<option value="all">All</option>';
  for (let y = currentYear; y >= 2020; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

// Navigation buttons
function goHome() {
  window.location.href = "index.html";
}
function goReports() {
  window.location.href = "reports.html";
}

// Page load setup
window.onload = () => {
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  populateSubcategories();
  populateYearDropdown();
  loadBills();

  document.getElementById("filterMonth")?.addEventListener("change", loadBills);
  document.getElementById("filterYear")?.addEventListener("change", loadBills);
  document.getElementById("paymentType")?.addEventListener("change", toggleCustomPaymentType);
  document.getElementById("subCategory")?.addEventListener("change", toggleCustomSubcategory);
};

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("incomeForm");
  const incomeList = document.getElementById("incomeList");

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const subcategory = document.getElementById("subcategory").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const currency = document.getElementById("currency").value;

    if (!title || isNaN(amount)) {
      alert("Please enter valid title and amount.");
      return;
    }

    const incomeNote = {
      id: Date.now().toString(),
      category: "Income",
      title,
      subcategory,
      amount,
      currency,
      description: "-",
      date: new Date().toISOString().split("T")[0]
    };

    // Save to localStorage
    const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    allNotes.push(incomeNote);
    localStorage.setItem("notes", JSON.stringify(allNotes));

    // Reset form and reload income list
    form.reset();
    alert("Income added!");
    loadIncome();
  });

  // Load and display income notes
  function loadIncome() {
    const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const incomeNotes = allNotes.filter(note => note.category === "Income");

    if (incomeNotes.length === 0) {
      incomeList.innerHTML = "<p>No income recorded yet.</p>";
      return;
    }

    incomeList.innerHTML = "<ul>";
    incomeNotes.forEach(note => {
      incomeList.innerHTML += `
        <li>
          <strong>${note.title}</strong> - 
          ${note.currency}${note.amount.toFixed(2)} 
          (${note.subcategory}) - 
          <small>${note.date}</small>
        </li>
      `;
    });
    incomeList.innerHTML += "</ul>";
  }

  // Initial load
  loadIncome();
});

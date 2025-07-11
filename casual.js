// Retrieve existing notes from localStorage
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Handle form submission
document.getElementById("casualForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;
  const content = document.getElementById("content").value.trim();

  if (!title || !type || !content) {
    alert("Please fill out all fields.");
    return;
  }

  const casualNote = {
    title,
    category: "Casual",
    subcategory: type,
    amount: 0,
    currency: "-",
    country: "-",
    content,
    date: new Date().toISOString()
  };

  // Save to notes
  notes.push(casualNote);
  localStorage.setItem("notes", JSON.stringify(notes));

  renderCasualNotes();
  this.reset();
});

// Display casual notes on the page
function renderCasualNotes() {
  const list = document.getElementById("casualList");
  list.innerHTML = "";

  const filtered = notes.filter(n => n.category === "Casual");

  if (filtered.length === 0) {
    list.textContent = "No casual notes yet.";
    return;
  }

  filtered.forEach(note => {
    const div = document.createElement("div");
    div.className = "casual-entry";
    div.innerHTML = `
      <strong>${note.title}</strong><br/>
      Type: ${note.subcategory}<br/>
      <em>${new Date(note.date).toLocaleDateString()}</em>
      <p>${note.content}</p>
    `;
    list.appendChild(div);
  });
}

// Load existing notes when the page loads
window.onload = () => {
  renderCasualNotes();
};

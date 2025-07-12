document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const cardViewContainer = document.getElementById("cardViewContainer");
    const tableBody = document.getElementById("todosTableBody");
    const noTodosMessage = document.getElementById("noTodosMessage");
    const cardViewBtn = document.getElementById("cardViewBtn");
    const tableViewBtn = document.getElementById("tableViewBtn");
    const tableViewContainer = document.getElementById("tableViewContainer");

    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");

    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    renderTodos();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const title = document.getElementById("todo-title").value.trim();
        const description = document.getElementById("todo-description").value.trim();
        const category = document.getElementById("todo-category").value;
        const days = Array.from(document.querySelectorAll('input[name="todo-day"]:checked')).map(cb => cb.value);

        if (!title || days.length === 0) {
            alert("Please enter a title and select at least one day.");
            return;
        }

        const todo = {
            id: Date.now(),
            title,
            description,
            category,
            days,
            createdAt: new Date().toLocaleString()
        };

        todos.push(todo);
        localStorage.setItem("todos", JSON.stringify(todos));
        renderTodos();
        form.reset();
    });

    function renderTodos() {
        cardViewContainer.innerHTML = "";
        tableBody.innerHTML = "";

        if (todos.length === 0) {
            noTodosMessage.style.display = "block";
            return;
        } else {
            noTodosMessage.style.display = "none";
        }

        todos.forEach((todo, index) => {
            // CARD
            const card = document.createElement("div");
            card.className = "todo-card";
            card.innerHTML = `
                <div class="card-title">${todo.title}</div>
                <div class="card-description">${todo.description || ""}</div>
                <div class="card-meta">
                    <span><i class="fas fa-tags"></i> ${todo.category}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${todo.days.join(", ")}</span>
                    <span><i class="fas fa-clock"></i> ${todo.createdAt}</span>
                </div>
                <div class="card-actions">
                    <button class="delete-btn" data-id="${todo.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cardViewContainer.appendChild(card);

            // TABLE
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${todo.title}</td>
                <td>${todo.description || ""}</td>
                <td>${todo.category}</td>
                <td>${todo.days.join(", ")}</td>
                <td>${todo.createdAt}</td>
                <td>
                    <button class="delete-btn" data-id="${todo.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                todos = todos.filter(todo => todo.id !== id);
                localStorage.setItem("todos", JSON.stringify(todos));
                renderTodos();
            });
        });
    }

    // Toggle Views
    cardViewBtn.addEventListener("click", () => {
        cardViewBtn.classList.add("active-view");
        tableViewBtn.classList.remove("active-view");
        cardViewContainer.style.display = "grid";
        tableViewContainer.classList.add("hidden-view");
    });

    tableViewBtn.addEventListener("click", () => {
        tableViewBtn.classList.add("active-view");
        cardViewBtn.classList.remove("active-view");
        cardViewContainer.style.display = "none";
        tableViewContainer.classList.remove("hidden-view");
    });

    // Export to CSV
    exportCsvBtn.addEventListener("click", () => {
        if (todos.length === 0) return alert("No data to export!");

        let csv = 'S.No.,Title,Description,Category,Days,Created At\n';
        todos.forEach((t, i) => {
            const desc = t.description ? t.description.replace(/"/g, '""') : '';
            csv += `${i + 1},"${t.title}","${desc}","${t.category}","${t.days.join(", ")}","${t.createdAt}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `todo_list_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    });

    // Export to PDF
    exportPdfBtn.addEventListener("click", () => {
        if (todos.length === 0) return alert("No data to export!");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        doc.setFontSize(16);
        doc.text("To-Do Task Report", 14, 20);
        doc.setFontSize(9);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

        const rows = todos.map((t, i) => [
            i + 1,
            t.title,
            t.description,
            t.category,
            t.days.join(", "),
            t.createdAt
        ]);

        doc.autoTable({
            head: [['#', 'Title', 'Description', 'Category', 'Days', 'Created At']],
            body: rows,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244], textColor: 255 },
            margin: { top: 30 }
        });

        doc.save(`todo_list_${new Date().toISOString().split('T')[0]}.pdf`);
    });
});

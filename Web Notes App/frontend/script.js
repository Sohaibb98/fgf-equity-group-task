const API_URL = "http://127.0.0.1:8000/notes/";
let allNotes = [];
let editingNoteId = null;

// Fetch and render all notes
async function fetchNotes() {
  try {
    const res = await fetch(API_URL);
    allNotes = await res.json();
    renderNotes(allNotes);
  } catch (err) {
    console.error("Failed to fetch notes", err);
  }
}

function renderNotes(notes) {
  const tbody = document.getElementById("notesBody");
  tbody.innerHTML = "";

  // Sort by newest date first
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  notes.forEach(note => {
    const row = document.createElement("tr");

    if (editingNoteId === note.id) {
      // Edit mode row
      row.innerHTML = `
        <td><input type="text" class="edit-title" value="${note.title}"></td>
        <td><textarea class="edit-details">${note.details}</textarea></td>
        <td>${new Date(note.date).toLocaleString()}</td>
        <td class="action-cell">
          <button class="save-btn" title="Save Changes">✔</button>
          <button class="cancel-btn" title="Cancel Edit">❌</button>
          <button class="delete-btn" title="Delete Note">🗑</button>
        </td>
      `;

      const titleInput = row.querySelector(".edit-title");
      const detailsInput = row.querySelector(".edit-details");
      const saveBtn = row.querySelector(".save-btn");
      const cancelBtn = row.querySelector(".cancel-btn");
      const deleteBtn = row.querySelector(".delete-btn");

      setTimeout(() => titleInput.focus(), 0);

      const saveFn = () => saveEdit(note, titleInput.value.trim(), detailsInput.value.trim());

      titleInput.addEventListener("keydown", e => {
        if (e.key === "Enter") saveFn();
      });

      saveBtn.addEventListener("click", saveFn);

      cancelBtn.addEventListener("click", () => {
        editingNoteId = null;
        renderNotes(notes);
      });

      deleteBtn.addEventListener("click", () => deleteNote(note));

    } else {
      // Normal read-only row
      row.innerHTML = `
        <td>${note.title}</td>
        <td>${note.details.replace(/\n/g, "<br>")}</td>
        <td>${new Date(note.date).toLocaleString()}</td>
        <td class="action-cell">
          <button class="delete-btn" title="Delete Note">🗑</button>
        </td>
      `;

      const deleteBtn = row.querySelector(".delete-btn");

      // Click row to edit, except delete button
      row.addEventListener("click", e => {
        if (!e.target.classList.contains("delete-btn")) {
          editingNoteId = note.id;
          renderNotes(notes);
        }
      });

      deleteBtn.addEventListener("click", () => deleteNote(note));
    }

    tbody.appendChild(row);
  });
}

// Save edited note (PATCH)
async function saveEdit(note, newTitle, newDetails) {
  if (!newTitle || !newDetails) return alert("Both fields required!");

  try {
    const res = await fetch(`${API_URL}${note.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, details: newDetails })
    });

    if (res.ok) {
      editingNoteId = null;
      fetchNotes();
    } else {
      alert("Failed to update note");
    }
  } catch (err) {
    console.error("Error updating note", err);
  }
}

// Search notes
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  editingNoteId = null; // cancel edit mode when searching

  const filtered = allNotes.filter(note =>
    `${note.title} ${note.details}`.toLowerCase().includes(query)
  );
  renderNotes(filtered);
});

// Add new note
const noteForm = document.getElementById("noteForm");
noteForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const details = document.getElementById("details").value.trim();

  if (!title || !details) return alert("Both fields required!");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, details })
    });

    if (res.ok) {
      document.getElementById("title").value = "";
      document.getElementById("details").value = "";
      fetchNotes();
    } else {
      alert("Error adding note");
    }
  } catch (err) {
    console.error("Error adding note", err);
  }
});

// Delete note
async function deleteNote(note) {
  if (!confirm(`Delete note: "${note.title}"?`)) return;

  try {
    const res = await fetch(`${API_URL}${note.id}/`, { method: "DELETE" });
    if (res.ok) {
      fetchNotes();
    } else {
      alert("Failed to delete note");
    }
  } catch (err) {
    console.error("Error deleting note", err);
  }
}

// Initial load
fetchNotes();

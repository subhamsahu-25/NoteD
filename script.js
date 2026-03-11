document.addEventListener("DOMContentLoaded", () => {
  const NOTES_PER_PAGE = 5;

  const state = {
    notes: [],
    currentPage: 1,
  };

  const notesContainer = document.getElementById('notes-container');
  const pagination = document.getElementById('pagination');
  const pageNumbers = document.getElementById('page-numbers');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const saveBtn = document.getElementById('save-btn');
  const titleInput = document.getElementById('note-title-input');
  const contentInput = document.getElementById('note-content-input');
  const noteCountBadge = document.getElementById('note-count');
  const toast = document.getElementById('toast');

  // load notes from localStorage
  function loadNotesFromStorage() {
    state.notes = JSON.parse(localStorage.getItem("notes")) || [];
  }

  // save notes to localStorage
  function saveNotesToStorage() {
    localStorage.setItem("notes", JSON.stringify(state.notes));
  }

  // add a note
  function addNote(title, content) {
    if (content === "") return;

    const note = {
      id: Date.now(),
      title: title,
      content: content,
      createdAt: new Date(),
    };
    state.notes.push(note);
    saveNotesToStorage();
    titleInput.value = "";
    contentInput.value = "";
    state.currentPage = 1;
    render();
    showToast("Note added!");
  }

  // get total number of pages
  function getTotalPages(notes) {
    return Math.ceil(notes.length / NOTES_PER_PAGE);
  }

  // get notes for current page
  function getPageNotes(notes) {
    const start = (state.currentPage - 1) * NOTES_PER_PAGE;
    const end = start + NOTES_PER_PAGE;
    return notes.slice(start, end);
  }

  // render notes
  function renderNotes(note) {
    const li = document.createElement("li");
    li.setAttribute("data-id", note.id);
    li.classList.add("note-card");
    li.innerHTML = `
      <div class="note-title" contenteditable="true">${note.title || "Untitled"}</div>
      <div class="note-content" contenteditable="true">${note.content}</div>
      <div class="note-meta">
        <span class="note-date">🕐 ${new Date(note.createdAt).toLocaleString()}</span>
        <div class="note-actions">
          <button class="btn btn-danger btn-icon">Delete</button>
        </div>
      </div>
    `;

    // Edit
    const titleEl = li.querySelector(".note-title");
    const contentEl = li.querySelector(".note-content");

    titleEl.addEventListener("blur", () => {
      note.title = titleEl.innerText.trim();
      saveNotesToStorage();
    });

    contentEl.addEventListener("blur", () => {
      note.content = contentEl.innerText.trim();
      saveNotesToStorage();
    });

    // Delete
    li.querySelector(".btn-danger").addEventListener("click", (e) => {
      e.stopPropagation();
      state.notes = state.notes.filter((n) => n.id !== note.id);
      saveNotesToStorage();
      render();
    });

    notesContainer.appendChild(li);
  }

  // render empty state
  function renderEmptyState() {
    const empty = document.createElement("div");
    empty.classList.add("empty-state");
    empty.innerHTML = `
    <div class="empty-icon">📝</div>
    <h3>No notes yet</h3>
    <p>Add a note above to get started</p>
  `;
    notesContainer.appendChild(empty);
  }

  // render pagination
  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    pageNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.classList.add('page-btn');
      btn.textContent = i;
      if (i === state.currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.currentPage = i;
        render();
      });
      pageNumbers.appendChild(btn);
    }

    pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;

    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage === totalPages;
  }

  // render notes
  function render() {
    notesContainer.innerHTML = '';
    noteCountBadge.textContent = `${state.notes.length} notes`;

    const pageNotes = getPageNotes(state.notes);

    if (state.notes.length === 0) {
      renderEmptyState();
    } else {
      pageNotes.forEach(renderNotes);
    }

    renderPagination(getTotalPages(state.notes));
  }

  // Save button
  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    addNote(title, content);
  });

  // Prev page
  prevBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      render();
    }
  });

  // Next page
  nextBtn.addEventListener('click', () => {
    if (state.currentPage < getTotalPages(state.notes)) {
      state.currentPage++;
      render();
    }
  });

  // Toast msg
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function init() {
    loadNotesFromStorage();
    render();
  }

  init();
});
// AI Study Planner - Notes Management Module

const NotesManager = {
  notes: [],
  activeNoteId: null,
  autoSaveTimer: null,

  init() {
    this.loadNotes();
    this.setupEventListeners();
  },

  setupEventListeners() {
    const createBtn = document.getElementById('create-note-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.createNewNote());
    }

    const noteBody = document.getElementById('active-note-textarea');
    if (noteBody) {
      noteBody.addEventListener('input', () => this.triggerAutoSave());
    }

    const noteTitle = document.getElementById('active-note-title-input');
    if (noteTitle) {
      noteTitle.addEventListener('input', () => this.triggerAutoSave());
    }

    const noteSubjectSelect = document.getElementById('active-note-subject-select');
    if (noteSubjectSelect) {
      noteSubjectSelect.addEventListener('change', () => this.triggerAutoSave());
    }

    const searchInput = document.getElementById('notes-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderNotesList());
    }

    const filterSubject = document.getElementById('notes-filter-subject');
    if (filterSubject) {
      filterSubject.addEventListener('change', () => this.renderNotesList());
    }
  },

  loadNotes() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    
    // Seed default notes if empty
    this.notes = StorageManager.load(`notes_${activeExam}`, [
      {
        id: "note_1",
        title: "Important Formulas & Equations",
        subject: "Physics",
        content: "1. Work Energy Theorem: W_net = Delta K\n2. Rotational Inertia of Disc: I = (1/2) * M * R^2\n3. Coulomb's Law: F = k * q1 * q2 / r^2\n4. Gauss's Law: Phi = Q_enclosed / epsilon_0\n\nRemember: Tension is maximum at the bottom-most point of a vertical circular motion loop.",
        updatedAt: new Date().toISOString()
      },
      {
        id: "note_2",
        title: "Named Reactions in Organic Chemistry",
        subject: "Chemistry",
        content: "Aldol Condensation:\n- Reactant: Aldehydes or Ketones with alpha-H.\n- Reagent: Dilute NaOH / KOH.\n- Product: beta-hydroxyaldehyde (aldol) or beta-hydroxyketone (ketol).\n\nCannizzaro Reaction:\n- Reactant: Aldehydes with NO alpha-H.\n- Reagent: Conc. NaOH / KOH.\n- Product: Self-oxidation & reduction yielding Alcohol and Carboxylic Acid Salt.",
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);

    this.populateSubjectFilters();
    this.renderNotesList();

    // Select the first note by default
    if (this.notes.length > 0) {
      this.selectNote(this.notes[0].id);
    } else {
      this.clearEditor();
    }
  },

  saveNotes() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    StorageManager.save(`notes_${activeExam}`, this.notes);
    this.populateSubjectFilters();
  },

  populateSubjectFilters() {
    const activeNoteSubjectSelect = document.getElementById('active-note-subject-select');
    const notesFilterSubject = document.getElementById('notes-filter-subject');

    let subjects = ['Physics', 'Chemistry', 'Mathematics', 'General'];
    if (window.SyllabusManager && window.SyllabusManager.currentSyllabus.subjects) {
      subjects = window.SyllabusManager.currentSyllabus.subjects.map(s => s.name);
    }

    if (activeNoteSubjectSelect) {
      const currentSelected = activeNoteSubjectSelect.value;
      activeNoteSubjectSelect.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
      if (subjects.includes(currentSelected)) {
        activeNoteSubjectSelect.value = currentSelected;
      }
    }

    if (notesFilterSubject) {
      notesFilterSubject.innerHTML = `<option value="all">All Subjects</option>` + 
        subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }
  },

  createNewNote() {
    let subjects = ['Physics', 'Chemistry', 'Mathematics', 'General'];
    if (window.SyllabusManager && window.SyllabusManager.currentSyllabus.subjects) {
      const sNames = window.SyllabusManager.currentSyllabus.subjects.map(s => s.name);
      if (sNames.length > 0) subjects = sNames;
    }

    const newNote = {
      id: "note_" + Date.now(),
      title: "Untitled Note",
      subject: subjects[0],
      content: "",
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    this.saveNotes();
    this.renderNotesList();
    this.selectNote(newNote.id);
    
    // Set focus to title input
    const noteTitleInput = document.getElementById('active-note-title-input');
    if (noteTitleInput) noteTitleInput.focus();

    if (window.ReminderManager) {
      window.ReminderManager.showToast("Note Created", "Start typing to auto-save.", "success");
    }
  },

  selectNote(id) {
    this.activeNoteId = id;
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    // Highlight in list
    const items = document.querySelectorAll('.note-sidebar-item');
    items.forEach(el => {
      if (el.getAttribute('data-note-id') === id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Populate editor fields
    const noteTitle = document.getElementById('active-note-title-input');
    const noteSubjectSelect = document.getElementById('active-note-subject-select');
    const noteBody = document.getElementById('active-note-textarea');

    if (noteTitle) noteTitle.value = note.title;
    if (noteSubjectSelect) noteSubjectSelect.value = note.subject;
    if (noteBody) noteBody.value = note.content;
  },

  triggerAutoSave() {
    clearTimeout(this.autoSaveTimer);
    
    const statusText = document.getElementById('editor-saving-status');
    if (statusText) statusText.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

    this.autoSaveTimer = setTimeout(() => {
      this.executeAutoSave();
    }, 800); // Wait 800ms of idle typing to write to storage
  },

  executeAutoSave() {
    if (!this.activeNoteId) return;

    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    const titleVal = document.getElementById('active-note-title-input').value.trim();
    const subjectVal = document.getElementById('active-note-subject-select').value;
    const contentVal = document.getElementById('active-note-textarea').value;

    note.title = titleVal || "Untitled Note";
    note.subject = subjectVal;
    note.content = contentVal;
    note.updatedAt = new Date().toISOString();

    this.saveNotes();
    this.updateNotesListItem(note);
    
    const statusText = document.getElementById('editor-saving-status');
    if (statusText) statusText.innerHTML = `<i class="fas fa-check" style="color:var(--accent-success)"></i> Saved`;
  },

  updateNotesListItem(note) {
    const listElement = document.querySelector(`.note-sidebar-item[data-note-id="${note.id}"]`);
    if (listElement) {
      listElement.innerHTML = `
        <h4>${note.title}</h4>
        <p>${note.content.substring(0, 45) || 'Empty note...'}</p>
        <span style="font-size: 9px; color: var(--text-muted); display: block; margin-top: 4px;">
          ${note.subject} • ${new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      `;
    }
  },

  deleteNote(id) {
    const targetId = id || this.activeNoteId;
    if (!targetId) return;

    const note = this.notes.find(n => n.id === targetId);
    const title = note ? note.title : "Note";

    this.notes = this.notes.filter(n => n.id !== targetId);
    this.saveNotes();
    this.renderNotesList();

    if (this.notes.length > 0) {
      this.selectNote(this.notes[0].id);
    } else {
      this.clearEditor();
    }

    if (window.ReminderManager) {
      window.ReminderManager.showToast("Note Deleted", `"${title}" has been deleted.`, "info");
    }
  },

  clearEditor() {
    this.activeNoteId = null;
    const noteTitle = document.getElementById('active-note-title-input');
    const noteBody = document.getElementById('active-note-textarea');
    if (noteTitle) noteTitle.value = '';
    if (noteBody) noteBody.value = '';
  },

  renderNotesList() {
    const container = document.getElementById('notes-sidebar-list');
    if (!container) return;

    const searchInput = document.getElementById('notes-search-input');
    const filterSubject = document.getElementById('notes-filter-subject');

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    const subjectFilter = filterSubject ? filterSubject.value : 'all';

    let filtered = this.notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchVal) || note.content.toLowerCase().includes(searchVal);
      const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p style="font-size:12.5px; color:var(--text-muted); text-align:center; padding: 20px 0;">No notes found.</p>`;
      return;
    }

    container.innerHTML = filtered.map(note => {
      const activeClass = note.id === this.activeNoteId ? 'active' : '';
      const dateText = new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="note-sidebar-item ${activeClass}" data-note-id="${note.id}" onclick="NotesManager.selectNote('${note.id}')">
          <h4>${note.title}</h4>
          <p>${note.content.substring(0, 45) || 'Empty note...'}</p>
          <span style="font-size: 9px; color: var(--text-muted); display: block; margin-top: 4px;">
            ${note.subject} • ${dateText}
          </span>
        </div>
      `;
    }).join('');
  }
};

window.NotesManager = NotesManager;

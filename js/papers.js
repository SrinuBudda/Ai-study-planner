// AI Study Planner - Previous Year Papers & Document Management Module

const PapersManager = {
  papers: [],
  activeFilters: {
    search: '',
    exam: 'all',
    year: 'all'
  },

  init() {
    this.loadPapers();
    this.setupEventListeners();
  },

  setupEventListeners() {
    const uploadForm = document.getElementById('pyq-upload-form');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUpload();
      });
    }

    const searchInput = document.getElementById('pyq-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeFilters.search = e.target.value.toLowerCase();
        this.renderPapers();
      });
    }

    const filterExam = document.getElementById('pyq-filter-exam');
    if (filterExam) {
      filterExam.addEventListener('change', (e) => {
        this.activeFilters.exam = e.target.value;
        this.renderPapers();
      });
    }

    const filterYear = document.getElementById('pyq-filter-year');
    if (filterYear) {
      filterYear.addEventListener('change', (e) => {
        this.activeFilters.year = e.target.value;
        this.renderPapers();
      });
    }

    // Dropzone drag-over style additions
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('pyq-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          dropzone.innerHTML = `
            <i class="fas fa-file-pdf" style="color:var(--accent-danger);"></i>
            <h4 style="margin-top:8px;">${e.target.files[0].name}</h4>
            <p style="font-size:12px;">Ready to upload (${Math.round(e.target.files[0].size / 1024)} KB)</p>
          `;
        }
      });
    }
  },

  loadPapers() {
    this.papers = StorageManager.load('papers', DEFAULT_PAPERS);
    this.renderPapers();
    this.populateYearFilters();
  },

  savePapers() {
    StorageManager.save('papers', this.papers);
    this.renderPapers();
    this.populateYearFilters();
  },

  populateYearFilters() {
    const filterYear = document.getElementById('pyq-filter-year');
    if (!filterYear) return;

    // Extract unique years
    const years = [...new Set(this.papers.map(p => p.year))].sort((a,b) => b - a);
    
    filterYear.innerHTML = `<option value="all">All Years</option>` + 
      years.map(y => `<option value="${y}">${y}</option>`).join('');
  },

  handleUpload() {
    const titleInput = document.getElementById('pyq-upload-title');
    const examSelect = document.getElementById('pyq-upload-exam');
    const yearInput = document.getElementById('pyq-upload-year');
    const fileInput = document.getElementById('pyq-file-input');

    if (!titleInput.value || !yearInput.value) {
      window.ReminderManager.showToast("Failed to Upload", "Please fill in all details.", "warning");
      return;
    }

    const title = titleInput.value.trim();
    const exam = examSelect.value;
    const year = parseInt(yearInput.value);
    
    let fileSize = "1.5 MB"; // default simulation size
    if (fileInput && fileInput.files.length > 0) {
      const sizeBytes = fileInput.files[0].size;
      if (sizeBytes > 1024 * 1024) {
        fileSize = (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";
      } else {
        fileSize = Math.round(sizeBytes / 1024) + " KB";
      }
    }

    const newPaper = {
      id: "paper_" + Date.now(),
      exam,
      title,
      year,
      size: fileSize,
      downloads: 0,
      fileUrl: "#",
      isDummy: true
    };

    this.papers.unshift(newPaper);
    this.savePapers();

    // Reset upload elements
    titleInput.value = '';
    yearInput.value = '';
    if (fileInput) fileInput.value = '';
    const dropzone = document.getElementById('upload-dropzone');
    if (dropzone) {
      dropzone.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h4 style="margin-top:8px;">Drag & Drop or Click to Browse</h4>
        <p style="font-size:12px;">Support PDF documents up to 10 MB</p>
      `;
    }

    // Close Modal
    const modal = document.getElementById('upload-paper-modal');
    if (modal) modal.classList.remove('active');

    window.ReminderManager.showToast("Paper Uploaded", `"${title}" has been successfully added.`, "success");
  },

  downloadPaper(id) {
    const paper = this.papers.find(p => p.id === id);
    if (!paper) return;

    paper.downloads++;
    this.savePapers();

    window.ReminderManager.showToast(
      "Downloading Document...", 
      `Downloading "${paper.title}". Check your system downloads.`, 
      "success"
    );

    // Simulate standard file download trigger
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Dummy content of PYQ: ${paper.title}`);
    link.download = `${paper.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  deletePaper(id) {
    const paper = this.papers.find(p => p.id === id);
    if (!paper) return;

    this.papers = this.papers.filter(p => p.id !== id);
    this.savePapers();
    
    window.ReminderManager.showToast("Paper Deleted", `"${paper.title}" removed from collection.`, "info");
  },

  viewPaper(id) {
    const paper = this.papers.find(p => p.id === id);
    if (!paper) return;

    const modal = document.getElementById('pdf-viewer-modal');
    const titleSpan = document.getElementById('viewer-paper-title');
    const contentArea = document.getElementById('viewer-pdf-mock-content');

    if (!modal || !contentArea) return;

    if (titleSpan) titleSpan.textContent = paper.title;

    // Generate smart mock content depending on exam type
    let docHTML = '';
    if (paper.exam === 'jee') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 300</span>
            <span>Duration: 3 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION A - PHYSICS</h3>
          <p><strong>Q1.</strong> A block of mass <i>m</i> is suspended by a light string from the ceiling of a lift. If the lift accelerates upwards with acceleration <i>g/2</i>, the tension in the string is:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) <i>mg/2</i></div>
            <div>(B) <i>mg</i></div>
            <div>(C) <i>3mg/2</i></div>
            <div>(D) <i>2mg</i></div>
          </div>
          
          <p><strong>Q2.</strong> The de Broglie wavelength of an electron accelerated through a potential difference of 100V is approximately:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 1.227 Å</div>
            <div>(B) 0.123 Å</div>
            <div>(C) 12.27 Å</div>
            <div>(D) 122.7 Å</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION B - CHEMISTRY</h3>
          <p><strong>Q3.</strong> Which of the following compounds will undergo nucleophilic substitution (S<sub>N</sub>1) reaction most readily?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Ethyl chloride</div>
            <div>(B) Isopropyl chloride</div>
            <div>(C) Benzyl chloride</div>
            <div>(D) Chlorobenzene</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'upsc') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>GS Paper I</span>
            <span>Duration: 2 Hours</span>
          </div>
          
          <p><strong>Q1.</strong> With reference to the Union Government of India, consider the following statements:</p>
          <ol style="margin-left: 20px; font-size:13.5px; line-height:1.6;">
            <li>The Constitution of India classifies Ministers into four ranks: Cabinet Minister, Minister of State with Independent Charge, Minister of State, and Deputy Minister.</li>
            <li>The total number of Ministers in the Union Government, including the Prime Minister, shall not exceed 15% of the total number of members in the House of the People.</li>
          </ol>
          <p style="margin-top:8px;">Which of the statements given above is/are correct?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 1 only</div>
            <div>(B) 2 only</div>
            <div>(C) Both 1 and 2</div>
            <div>(D) Neither 1 nor 2</div>
          </div>

          <p><strong>Q2.</strong> "System of Rice Intensification" (SRI) cultivation, in which alternate wetting and drying of rice fields is practiced, results in:</p>
          <ol style="margin-left: 20px; font-size:13.5px; line-height:1.6;">
            <li>Reduced seed requirement</li>
            <li>Reduced methane production</li>
            <li>Reduced electricity consumption</li>
          </ol>
          <p style="margin-top:8px;">Select the correct answer using the code given below:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 1 and 2 only</div>
            <div>(B) 2 and 3 only</div>
            <div>(C) 1 and 3 only</div>
            <div>(D) 1, 2 and 3</div>
          </div>
        </div>
      `;
    } else {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Standard Test Paper Preset</span>
            <span>Duration: 180 Mins</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">PART A (Objective Type Questions)</h3>
          <p><strong>Q1.</strong> What is the main objective of this study syllabus topic?</p>
          <p style="font-size:13px; margin: 4px 0 15px 10px; color: var(--text-secondary);">Review your subject files and notes to locate answers for this custom question paper.</p>
          
          <p><strong>Q2.</strong> Which strategy is most effective for exam preparation?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Spaced Repetition</div>
            <div>(B) Night Cramming</div>
            <div>(C) Highlighting textbook pages</div>
            <div>(D) Speed Reading</div>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:25px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">PART B (Analytical Section)</h3>
          <p><strong>Q3.</strong> Explain the basic concepts of this subject in detail. Provide examples where necessary.</p>
        </div>
      `;
    }

    contentArea.innerHTML = docHTML;
    modal.classList.add('active');
  },

  renderPapers() {
    const container = document.getElementById('pyq-papers-list');
    if (!container) return;

    let filtered = this.papers.filter(paper => {
      // Search text match
      const titleMatch = paper.title.toLowerCase().includes(this.activeFilters.search);
      
      // Exam match
      const examMatch = this.activeFilters.exam === 'all' || paper.exam === this.activeFilters.exam;
      
      // Year match
      const yearMatch = this.activeFilters.year === 'all' || paper.year === parseInt(this.activeFilters.year);

      return titleMatch && examMatch && yearMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-card col-12" style="text-align:center; padding:40px;">
          <i class="fas fa-search" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3>No Papers Found</h3>
          <p>Try modifying your filters or search keywords.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(paper => {
      let examName = paper.exam.toUpperCase();
      if (paper.exam === 'semester') examName = 'SEM';
      if (paper.exam === 'placement') examName = 'PLACE';

      return `
        <div class="glass-card paper-card glass-card-hover-lift">
          <div>
            <div class="paper-header">
              <span class="paper-badge">${examName}</span>
              <span style="font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--text-muted);">${paper.year}</span>
            </div>
            <h4 class="paper-title">${paper.title}</h4>
            <div class="paper-details">
              <span><i class="fas fa-hdd"></i> ${paper.size}</span>
              <span><i class="fas fa-download"></i> ${paper.downloads} DLs</span>
            </div>
          </div>
          <div class="paper-actions">
            <button onclick="PapersManager.viewPaper('${paper.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size:11.5px;">
              <i class="fas fa-eye"></i> View
            </button>
            <button onclick="PapersManager.downloadPaper('${paper.id}')" class="btn btn-primary" style="padding: 6px 12px; font-size:11.5px;">
              <i class="fas fa-download"></i> Get PDF
            </button>
            <button onclick="PapersManager.deletePaper('${paper.id}')" class="action-icon-btn delete-btn" title="Delete Paper" style="border:1px solid var(--border-solid); border-radius: var(--border-radius-sm); padding:6px 10px;">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  showUploadModal() {
    const modal = document.getElementById('upload-paper-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }
};

window.PapersManager = PapersManager;

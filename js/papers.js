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

    // Sync download action with MySQL
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.incrementDownloads(id);
    }

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
    } else if (paper.exam === 'neet') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 720</span>
            <span>Duration: 3 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION A - BIOLOGY</h3>
          <p><strong>Q1.</strong> Which of the following organelles is bound by a double membrane and contains its own circular DNA and 70S ribosomes?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Lysosome</div>
            <div>(B) Mitochondria</div>
            <div>(C) Golgi Apparatus</div>
            <div>(D) Endoplasmic Reticulum</div>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION B - PHYSICS</h3>
          <p><strong>Q2.</strong> A sphere of radius R is falling through a viscous liquid. The terminal velocity of the sphere is proportional to:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) R</div>
            <div>(B) R²</div>
            <div>(C) 1/R</div>
            <div>(D) R³</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION C - CHEMISTRY</h3>
          <p><strong>Q3.</strong> The dehydration of tertiary butyl alcohol with concentrated H₂SO₄ yields:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Isobutylene</div>
            <div>(B) Butene-2</div>
            <div>(C) Butene-1</div>
            <div>(D) Di-diethyl ether</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'gate') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 100</span>
            <span>Duration: 3 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">CORE CS & IT</h3>
          <p><strong>Q1.</strong> Let G be a simple connected planar graph with 13 vertices and 19 edges. The number of faces in the planar representation of G is:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 6</div>
            <div>(B) 8</div>
            <div>(C) 10</div>
            <div>(D) 12</div>
          </div>
          
          <p><strong>Q2.</strong> What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (BST) containing n elements?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) O(1)</div>
            <div>(B) O(log n)</div>
            <div>(C) O(n)</div>
            <div>(D) O(n log n)</div>
          </div>

          <p><strong>Q3.</strong> In an operating system, a process that has completed its execution but still has an entry in the process table is known as a:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Zombie process</div>
            <div>(B) Orphan process</div>
            <div>(C) Daemon process</div>
            <div>(D) Trap process</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'cds') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 100</span>
            <span>Duration: 2 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">GENERAL KNOWLEDGE & ENGLISH</h3>
          <p><strong>Q1.</strong> Which of the following is the highest peacetime military gallantry award in India?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Param Vir Chakra</div>
            <div>(B) Ashoka Chakra</div>
            <div>(C) Maha Vir Chakra</div>
            <div>(D) Shaurya Chakra</div>
          </div>
          
          <p><strong>Q2.</strong> Identify the segment in the sentence that contains a grammatical error: <i>"Each of the partners have submitted their reports."</i></p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Each of the partners</div>
            <div>(B) have submitted</div>
            <div>(C) their reports</div>
            <div>(D) No error</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">ELEMENTARY MATHEMATICS</h3>
          <p><strong>Q3.</strong> If a worker can complete a piece of work in 15 days, how long will it take 12 workers to complete the same work if they work at the same rate?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 8 days</div>
            <div>(B) 10 days</div>
            <div>(C) 12 days</div>
            <div>(D) 14 days</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'nda') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 300</span>
            <span>Duration: 2.5 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">MATHEMATICS PRESET</h3>
          <p><strong>Q1.</strong> What is the derivative of the function f(x) = x * ln(x) with respect to x?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) ln(x)</div>
            <div>(B) ln(x) + 1</div>
            <div>(C) 1</div>
            <div>(D) x / ln(x)</div>
          </div>
          
          <p><strong>Q2.</strong> If two events A and B are independent, then the probability P(A ∩ B) is equal to:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) P(A) + P(B)</div>
            <div>(B) P(A) * P(B)</div>
            <div>(C) P(A) | P(B)</div>
            <div>(D) P(A) + P(B) - P(A ∩ B)</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">GENERAL ABILITY TEST (PHYSICS)</h3>
          <p><strong>Q3.</strong> A body starting from rest accelerates uniformly at a rate of 4 m/s² for a distance of 50m. Its final velocity is:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 10 m/s</div>
            <div>(B) 20 m/s</div>
            <div>(C) 30 m/s</div>
            <div>(D) 40 m/s</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'tgc') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Max Marks: 100</span>
            <span>Technical Graduate Entry</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION A - CORE ENGINEERING</h3>
          <p><strong>Q1.</strong> What is the primary role of the Indian Army's 'Technical Graduate Course' (TGC) entry scheme?</p>
          <div style="margin:8px 0 15px 10px; font-size:13.5px; line-height:1.5;">
            It directly commissions engineering graduates as officers in the technical arms (such as Corps of Engineers, Signals, and EME) of the Indian Army.
          </div>
          
          <p><strong>Q2.</strong> The moment of inertia of a circular cross-section of diameter <i>d</i> about its centroidal axis is:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) πd⁴/32</div>
            <div>(B) πd⁴/64</div>
            <div>(C) πd³/32</div>
            <div>(D) πd³/64</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION B - MILITARY APTITUDE</h3>
          <p><strong>Q3.</strong> Which naval exercise is conducted annually as a bilateral training drill between India and France?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Varuna</div>
            <div>(B) Shakti</div>
            <div>(C) Garuda</div>
            <div>(D) Desert Knight</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'lawyer') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>CLAT Solved Paper</span>
            <span>Duration: 2 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SECTION A - LEGAL REASONING</h3>
          <p><strong>Q1.</strong> Under the Law of Torts, the concept of 'Strict Liability' refers to which of the following?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Liability regardless of fault</div>
            <div>(B) Liability only when intention is proven</div>
            <div>(C) Public servants performing duty</div>
            <div>(D) Written contracts only</div>
          </div>
          
          <p><strong>Q2.</strong> Which landmark case established the 'Basic Structure Doctrine' of the Constitution of India?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Golaknath v. State of Punjab</div>
            <div>(B) Kesavananda Bharati v. State of Kerala</div>
            <div>(C) Maneka Gandhi v. Union of India</div>
            <div>(D) Minerva Mills v. Union of India</div>
          </div>

          <p><strong>Q3.</strong> Under Section 13 of the Indian Contract Act, 1872, 'Consensus ad idem' is defined as:</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Agreement on the same thing in the same sense</div>
            <div>(B) Agreement signed under duress</div>
            <div>(C) Void contracts due to lack of consideration</div>
            <div>(D) Breach of contract damages</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'govt_eng') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>ESE / IES Engineering Services</span>
            <span>Duration: 3 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">GENERAL STUDIES & ENGINEERING APTITUDE</h3>
          <p><strong>Q1.</strong> In linear circuits, the superposition theorem can be applied to compute which of the following parameters?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Voltage and Current</div>
            <div>(B) Power only</div>
            <div>(C) Resistance parameters</div>
            <div>(D) Total energy dissipation</div>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">TECHNICAL DISCIPLINE</h3>
          <p><strong>Q2.</strong> The open-loop transfer function of a unity feedback system is G(s) = K / [s(s + 4)]. The value of G(s) at s = 0 represents what type of system?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Type 0 System</div>
            <div>(B) Type 1 System</div>
            <div>(C) Type 2 System</div>
            <div>(D) Type 3 System</div>
          </div>

          <p><strong>Q3.</strong> A major advantage of using negative feedback in control systems is the reduction of which parameter?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) System bandwidth</div>
            <div>(B) System sensitivity to parameter variations</div>
            <div>(C) System stability margin</div>
            <div>(D) Overall system gain</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'semester') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>University Semester Exam</span>
            <span>Duration: 3 Hours</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">PART A - SHORT ANSWER QUESTIONS</h3>
          <p><strong>Q1.</strong> Find the Laplace Transform of the function f(t) = t * e^(-2t).</p>
          <div style="margin:8px 0 15px 10px; font-size:13px; color:var(--text-secondary);">
            Show all steps including the frequency shifting property: L{t * e^(at)} = 1 / (s - a)².
          </div>
          
          <p><strong>Q2.</strong> What is the difference between Method Overloading and Method Overriding in Object Oriented Programming?</p>
          <div style="margin:8px 0 15px 10px; font-size:13px; color:var(--text-secondary);">
            Provide a brief C++/Java code sample displaying compile-time vs run-time polymorphism.
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:20px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">PART B - ANALYTICAL SECTION</h3>
          <p><strong>Q3.</strong> Explain the working of the Dijkstra's Shortest Path Algorithm on a weighted graph. Find the shortest path from a source vertex A to all other nodes.</p>
        </div>
      `;
    } else if (paper.exam === 'placement') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Placement Interview Preparation</span>
            <span>Time: 90 Mins</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">CODING & DATA STRUCTURES</h3>
          <p><strong>Q1.</strong> Given a matrix of size M x N, write an efficient algorithm to search for a target value. The matrix has the property that integers in each row are sorted, and the first integer of each row is greater than the last integer of the previous row.</p>
          
          <p><strong>Q2.</strong> What is the optimal time complexity to solve the 0-1 Knapsack problem containing N items and capacity W using Dynamic Programming?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) O(2^N)</div>
            <div>(B) O(N * W)</div>
            <div>(C) O(N + W)</div>
            <div>(D) O(N * log W)</div>
          </div>

          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">SYSTEM DESIGN</h3>
          <p><strong>Q3.</strong> Design a URL Shortener service like Bit.ly. Explain your choice of database (SQL vs NoSQL), database schema design, and load-balancing strategy.</p>
        </div>
      `;
    } else if (paper.exam === 'ssc') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>SSC CGL Tier-1 Solved Paper</span>
            <span>Time: 60 Mins</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">QUANTITATIVE APTITUDE</h3>
          <p><strong>Q1.</strong> A train 120m long passes a telegraph post in 6 seconds. What is the speed of the train in km/h?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) 60 km/h</div>
            <div>(B) 72 km/h</div>
            <div>(C) 80 km/h</div>
            <div>(D) 90 km/h</div>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">GENERAL AWARENESS</h3>
          <p><strong>Q2.</strong> Who was the founder of the ancient Maurya Empire in India?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Ashoka</div>
            <div>(B) Chandragupta Maurya</div>
            <div>(C) Samudragupta</div>
            <div>(D) Chandragupta I</div>
          </div>

          <p><strong>Q3.</strong> Right to Equality is guaranteed in the Constitution of India under which range of Articles?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Articles 14 to 18</div>
            <div>(B) Articles 19 to 22</div>
            <div>(C) Articles 23 to 24</div>
            <div>(D) Articles 25 to 28</div>
          </div>
        </div>
      `;
    } else if (paper.exam === 'bank') {
      docHTML = `
        <div style="font-family:'Outfit',sans-serif; padding:10px;">
          <h2 style="text-align:center; color:var(--text-primary); border-bottom:2px solid var(--accent-primary); padding-bottom:10px; font-size:18px;">${paper.title}</h2>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:20px;">
            <span>Bank PO Preliminary Exam</span>
            <span>Time: 60 Mins</span>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">REASONING & QUANT</h3>
          <p><strong>Q1.</strong> Seven persons A, B, C, D, E, F, and G are sitting in a row facing North. A sits third to the left of D. Only two people sit between D and F. Who sits in the exact middle of the row?</p>
          <div style="margin:8px 0 15px 10px; font-size:13px; color:var(--text-secondary);">
            Solve the linear ordering sequence using the boundary constraints.
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:15px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">BANKING & FINANCIAL AWARENESS</h3>
          <p><strong>Q2.</strong> What monetary policy action does the RBI take to control high retail inflation in the Indian economy?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Decrease Repo Rate</div>
            <div>(B) Increase Repo Rate</div>
            <div>(C) Reduce Cash Reserve Ratio</div>
            <div>(D) Purchase bonds in open market</div>
          </div>

          <p><strong>Q3.</strong> Which of the following is the regulatory body for rural and agricultural banking credit in India?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) RBI</div>
            <div>(B) SEBI</div>
            <div>(C) NABARD</div>
            <div>(D) SIDBI</div>
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
          
          <p><strong>Q2.</strong> Which strategy is most effective for long-term exam preparation and conceptual retention?</p>
          <div style="margin:8px 0 20px 20px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>(A) Spaced Repetition & Active Recall</div>
            <div>(B) Overnight Cramming</div>
            <div>(C) Passive highlighting of textbooks</div>
            <div>(D) Reading summaries repeatedly</div>
          </div>
          
          <h3 style="color:var(--accent-primary); font-size:14px; margin-top:25px; border-bottom:1px dashed var(--border-solid); padding-bottom:4px;">PART B (Analytical Section)</h3>
          <p><strong>Q3.</strong> Explain the basic concepts of this subject in detail. Describe how the Feynman Technique can expose gaps in understanding.</p>
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

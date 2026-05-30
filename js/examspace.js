// AI Study Planner - Exam Space Module
// Handles simulated mock tests, custom tests based on syllabus completion, timers, navigators, and performance histories.

const EXAM_SUBJECTS = {
  "upsc": ["History", "Geography", "Polity", "Economy", "Environment", "Science & Technology", "Current Affairs"],
  "ssc_cgl": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "ssc_chsl": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "bank": ["Quantitative Aptitude", "Reasoning", "English", "Banking Awareness", "Computer Aptitude"],
  "railway": ["Mathematics", "General Intelligence & Reasoning", "General Science", "General Awareness"],
  "state_psc": ["History", "Geography", "Polity", "State GK", "Environment", "Economy"],
  "jee": ["Physics", "Chemistry", "Mathematics"],
  "neet": ["Physics", "Chemistry", "Biology"],
  "gate": ["Computer Science", "Engineering Mathematics", "General Aptitude"],
  "cat": ["Quantitative Aptitude", "Data Interpretation & Logical Reasoning", "Verbal Ability & Reading Comprehension"],
  "cs": ["Programming", "Data Structures", "DBMS", "Operating Systems", "Computer Networks", "Aptitude"],
  "custom": ["General Studies", "General English", "Mathematics & Aptitude"]
};

const PRESEEDED_QUESTIONS = {
  "Physics": [
    {
      question: "A car accelerates uniformly from rest at 4 m/s². What is its velocity after traveling a distance of 50 meters?",
      options: ["10 m/s", "20 m/s", "30 m/s", "40 m/s"],
      answer: 1,
      explanation: "Using the kinematic equation v² = u² + 2as. Since the car starts from rest, u = 0. Thus v² = 2 * 4 * 50 = 400, which gives v = 20 m/s."
    },
    {
      question: "According to Gauss's Law, what is the net electric flux through any closed surface?",
      options: ["Proportional to the net charge enclosed", "Inversely proportional to the net charge enclosed", "Always zero", "Equal to the electric field strength"],
      answer: 0,
      explanation: "Gauss's Law states that the total electric flux through a closed surface is equal to the net charge enclosed divided by the permittivity of free space (ε₀)."
    },
    {
      question: "Which of the following phenomena provides direct evidence of the wave nature of light?",
      options: ["Photoelectric effect", "Compton scattering", "Interference", "Blackbody radiation"],
      answer: 2,
      explanation: "Interference and diffraction patterns are wave-specific behaviors that demonstrate the wave nature of light. The photoelectric effect and Compton scattering demonstrate the particle nature of light."
    }
  ],
  "Chemistry": [
    {
      question: "What is the molecular geometry of a water (H₂O) molecule?",
      options: ["Linear", "Bent", "Tetrahedral", "Trigonal planar"],
      answer: 1,
      explanation: "Oxygen has 6 valence electrons, sharing 2 with Hydrogen atoms and keeping 2 lone pairs. The electron-pair geometry is tetrahedral, but the molecular shape is bent (approximately 104.5 degrees) due to lone pair repulsions."
    },
    {
      question: "Which of the following factors increases the rate of a chemical reaction according to Collision Theory?",
      options: ["Decreasing the temperature", "Increasing the activation energy", "Decreasing the concentration of reactants", "Increasing the surface area of solid reactants"],
      answer: 3,
      explanation: "Increasing the surface area allows more reactant particles to collide simultaneously, increasing collision frequency and thus accelerating the reaction."
    }
  ],
  "Mathematics": [
    {
      question: "What is the derivative of f(x) = x * ln(x) with respect to x?",
      options: ["ln(x)", "1", "ln(x) + 1", "x / ln(x)"],
      answer: 2,
      explanation: "Using the product rule: d/dx [u * v] = u'v + uv'. Here, u = x (u' = 1) and v = ln(x) (v' = 1/x). Therefore, f'(x) = 1 * ln(x) + x * (1/x) = ln(x) + 1."
    },
    {
      question: "If matrices A and B are of dimensions 3x2 and 2x4 respectively, what is the dimension of the product AB?",
      options: ["2x2", "3x4", "4x3", "Matrix multiplication is undefined"],
      answer: 1,
      explanation: "The product of an m x n matrix and an n x p matrix is an m x p matrix. Since A is 3x2 and B is 2x4, the product AB is a 3x4 matrix."
    }
  ],
  "Biology": [
    {
      question: "Which organelle is primarily responsible for ATP synthesis in eukaryotic cells?",
      options: ["Golgi apparatus", "Ribosome", "Mitochondria", "Lysosome"],
      answer: 2,
      explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
    },
    {
      question: "Which of the following hormones is primary in regulating blood glucose levels?",
      options: ["Thyroxine", "Insulin", "Adrenaline", "Estrogen"],
      answer: 1,
      explanation: "Insulin, secreted by the beta cells of the pancreas, helps lower blood glucose levels by facilitating the uptake of glucose into cells."
    }
  ],
  "Core Computer Science": [
    {
      question: "Which data structure operates on a First-In, First-Out (FIFO) basis?",
      options: ["Stack", "Queue", "Binary Tree", "Max Heap"],
      answer: 1,
      explanation: "A queue is a linear structure where operations are performed in a FIFO (First In First Out) order. Stacks are LIFO (Last In First Out)."
    },
    {
      question: "What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
      explanation: "In a balanced BST, the height is logarithmic in terms of the number of nodes (h = log n). Worst-case search involves traversing from root to leaf, which takes O(log n) time."
    }
  ],
  "General Studies": [
    {
      question: "Who was the founder of the Maurya Empire in ancient India?",
      options: ["Ashoka", "Chandragupta Maurya", "Samudragupta", "Harsha"],
      answer: 1,
      explanation: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the help of his mentor Chanakya (Kautilya), defeating the Nanda Dynasty."
    },
    {
      question: "Which articles of the Indian Constitution outline the fundamental Right to Equality?",
      options: ["Articles 14 to 18", "Articles 19 to 22", "Articles 25 to 28", "Article 32"],
      answer: 0,
      explanation: "Part III of the Constitution of India provides the Fundamental Rights. The Right to Equality is covered under Articles 14 to 18."
    }
  ]
};

const ExamSpaceManager = {
  currentTest: {
    questions: [],
    currentIndex: 0,
    answers: {}, // questionIndex: selectedOptionIndex
    markedForReview: {}, // questionIndex: boolean
    visited: {}, // questionIndex: boolean
    timerRemaining: 0, // in seconds
    timerInterval: null,
    totalDuration: 0, // in seconds
    difficulty: "Medium",
    exam: "custom"
  },
  
  history: [],

  init() {
    this.setupBindings();
  },

  setupBindings() {
    const startBtn = document.getElementById("start-mock-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => this.startTest());
    }

    const prevBtn = document.getElementById("quiz-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.prevQuestion());
    }

    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextQuestion());
    }

    const markReviewBtn = document.getElementById("quiz-mark-review-btn");
    if (markReviewBtn) {
      markReviewBtn.addEventListener("click", () => this.toggleMarkForReview());
    }

    const submitBtn = document.getElementById("quiz-submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to submit your mock test?")) {
          this.submitTest();
        }
      });
    }

    const retakeBtn = document.getElementById("quiz-retake-btn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => this.retakeTest());
    }

    const backConfigBtn = document.getElementById("quiz-back-config-btn");
    if (backConfigBtn) {
      backConfigBtn.addEventListener("click", () => this.resetToConfigurator());
    }

    const examSelect = document.getElementById("quiz-exam-select");
    if (examSelect) {
      examSelect.addEventListener("change", () => {
        this.renderSubjectsForExam(examSelect.value);
        this.updateSyllabusCoverageWarning();
      });
    }

    const selectAllBtn = document.getElementById("quiz-select-all-btn");
    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", () => this.toggleSelectAllSubjects());
    }
  },

  loadExamSpace() {
    const activeExam = window.AppManager.activeExam;
    // Map application global active exam mapping
    const dropdownExamVal = this.mapGlobalExamToLocalDropdown(activeExam);
    
    const examSelect = document.getElementById("quiz-exam-select");
    if (examSelect) {
      examSelect.value = dropdownExamVal;
    }

    this.renderSubjectsForExam(dropdownExamVal);
    this.loadHistory();
    this.updateSyllabusCoverageWarning();
    this.resetToConfigurator();
  },

  mapGlobalExamToLocalDropdown(examKey) {
    const valid = ["upsc", "ssc_cgl", "ssc_chsl", "bank", "railway", "state_psc", "jee", "neet", "gate", "cat", "cs", "custom"];
    if (valid.includes(examKey)) return examKey;
    if (examKey === "ssc") return "ssc_cgl";
    if (examKey === "semester" || examKey === "placement") return "cs";
    return "custom";
  },

  loadHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    
    // Load from local storage sync fallback
    this.history = StorageManager.load(`examspace_history_${user.email}_${activeExam}`, []);
    
    // Attempt async pull if ApiClient is connected
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.getExamSpaceHistory(activeExam).then(data => {
        if (data && data.length > 0) {
          this.history = data;
          StorageManager.save(`examspace_history_${user.email}_${activeExam}`, this.history);
          this.renderHistoryList();
        }
      });
    }

    this.renderHistoryList();
  },

  saveHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    StorageManager.save(`examspace_history_${user.email}_${activeExam}`, this.history);
    this.renderHistoryList();
  },

  renderHistoryList() {
    const listEl = document.getElementById("quiz-history-list");
    if (!listEl) return;

    if (this.history.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding: 30px 10px; color:var(--text-muted); font-size:13px;">
          <i class="fas fa-file-signature" style="font-size:24px; margin-bottom:10px; opacity:0.5;"></i>
          <p>No tests completed yet. Start your first exam above!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.history.map((test) => {
      const dateStr = new Date(test.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const scoreClass = test.scorePercent >= 80 ? 'high' : test.scorePercent < 50 ? 'low' : '';
      const subjectsLabel = Array.isArray(test.subjects) ? test.subjects.join(', ') : test.subjects;
      
      return `
        <div class="past-test-item">
          <div class="past-test-info">
            <h4 style="text-transform: capitalize;">${test.exam.toUpperCase()} Mock Test</h4>
            <p>${subjectsLabel}</p>
            <p style="font-size: 10px; color: var(--text-muted); margin-top:2px;">${test.questionCount} Qs | Difficulty: ${test.difficulty} | ${dateStr}</p>
          </div>
          <span class="past-test-score ${scoreClass}">${test.scorePercent}%</span>
        </div>
      `;
    }).join('');
  },

  renderSubjectsForExam(examVal) {
    const checkboxGroup = document.getElementById("quiz-subject-checkboxes");
    if (!checkboxGroup) return;

    const subjects = EXAM_SUBJECTS[examVal] || [];
    checkboxGroup.innerHTML = subjects.map(sub => `
      <div class="subject-weight-card" style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); padding:10px 15px; border-radius:var(--border-radius-sm); transition:all 0.2s ease;">
        <label style="display:flex; align-items:center; gap:8px; margin:0; cursor:pointer; font-size:13px; font-weight:500;">
          <input type="checkbox" name="quiz-subject" value="${sub}" checked style="cursor:pointer;">
          <span>${sub}</span>
        </label>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:10px; color:var(--text-muted);">Weight:</span>
          <select name="quiz-subject-weight-${sub}" style="background:var(--bg-secondary); border:1px solid var(--border-solid); padding:2px 6px; border-radius:var(--border-radius-sm); color:var(--text-primary); font-size:11px;">
            <option value="1">Low</option>
            <option value="2" selected>Medium</option>
            <option value="3">High</option>
          </select>
        </div>
      </div>
    `).join('');
  },

  toggleSelectAllSubjects() {
    const checkboxes = document.querySelectorAll('input[name="quiz-subject"]');
    const selectAllBtn = document.getElementById("quiz-select-all-btn");
    if (checkboxes.length === 0 || !selectAllBtn) return;

    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    selectAllBtn.textContent = allChecked ? "Select All" : "Deselect All";
  },

  updateSyllabusCoverageWarning() {
    const warningBox = document.getElementById("quiz-completed-warning-box");
    if (!warningBox) return;

    const activeExam = window.AppManager.activeExam;
    const examPreset = EXAM_PRESETS[activeExam];
    if (!examPreset) {
      warningBox.innerHTML = '';
      return;
    }

    let totalTopics = 0;
    let completedTopics = 0;

    examPreset.subjects.forEach(sub => {
      const storedSubject = window.SyllabusManager && window.SyllabusManager.syllabusData.find(s => s.name === sub.name);
      const topics = storedSubject ? storedSubject.topics : sub.topics;
      topics.forEach(t => {
        totalTopics++;
        if (t.completed) completedTopics++;
      });
    });

    const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    if (completionRate === 0) {
      warningBox.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.15); padding: 12px; border-radius: var(--border-radius-md); display:flex; align-items:center; gap:10px;">
          <i class="fas fa-exclamation-triangle" style="color:var(--accent-warning); font-size:16px;"></i>
          <div>
            <h4 style="font-size:13px; color:var(--accent-warning); margin:0 0 1px 0;">Syllabus progress is at 0%</h4>
            <p style="font-size:11.5px; margin:0; line-height:1.4; color:var(--text-secondary);">Simulating mock test concepts based on standard exam difficulty settings.</p>
          </div>
        </div>
      `;
    } else {
      warningBox.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.12); padding: 12px; border-radius: var(--border-radius-md); display:flex; align-items:center; gap:10px;">
          <i class="fas fa-check-circle" style="color:var(--accent-success); font-size:16px;"></i>
          <div>
            <h4 style="font-size:13px; color:var(--accent-success); margin:0 0 1px 0;">Syllabus Coverage: ${completionRate}%</h4>
            <p style="font-size:11.5px; margin:0; line-height:1.4; color:var(--text-secondary);">Prioritizing completed topic segments for adaptive learning questions.</p>
          </div>
        </div>
      `;
    }
  },

  resetToConfigurator() {
    clearInterval(this.currentTest.timerInterval);
    document.getElementById("quiz-config-view").style.display = "block";
    document.getElementById("quiz-runner-view").style.display = "none";
    document.getElementById("quiz-results-view").style.display = "none";
  },

  startTest() {
    const examSelect = document.getElementById("quiz-exam-select");
    const examVal = examSelect ? examSelect.value : "custom";

    const selectedBoxes = document.querySelectorAll('input[name="quiz-subject"]:checked');
    if (selectedBoxes.length === 0) {
      alert("Please select at least one subject to generate questions!");
      return;
    }

    const selectedSubjects = Array.from(selectedBoxes).map(box => box.value);
    const count = parseInt(document.getElementById("quiz-question-count").value) || 10;
    const timeLimitMinutes = parseInt(document.getElementById("quiz-time-limit").value) || 10;
    const difficulty = document.getElementById("quiz-difficulty").value || "Medium";

    // Extract weights
    const weights = {};
    selectedSubjects.forEach(sub => {
      const selectEl = document.querySelector(`select[name="quiz-subject-weight-${sub}"]`);
      weights[sub] = selectEl ? parseInt(selectEl.value) : 2;
    });

    // Generate questions list based on selections and weight ratios
    const generatedQuestions = this.generateQuestionsForTest(examVal, selectedSubjects, count, difficulty, weights);

    if (generatedQuestions.length === 0) {
      alert("Failed to generate test questions. Try checking more subjects.");
      return;
    }

    // Set Test State
    this.currentTest.questions = generatedQuestions;
    this.currentTest.currentIndex = 0;
    this.currentTest.answers = {};
    this.currentTest.markedForReview = {};
    this.currentTest.visited = { 0: true };
    this.currentTest.totalDuration = timeLimitMinutes * 60;
    this.currentTest.timerRemaining = timeLimitMinutes * 60;
    this.currentTest.difficulty = difficulty;
    this.currentTest.exam = examVal;

    // Show Runner view
    document.getElementById("quiz-config-view").style.display = "none";
    document.getElementById("quiz-runner-view").style.display = "block";
    document.getElementById("quiz-results-view").style.display = "none";

    // Render navigation grid
    this.renderQuestionNavGrid();

    // Setup active timer
    this.startTimer();
    this.renderActiveQuestion();
  },

  generateQuestionsForTest(examVal, selectedSubjects, count, difficulty, weights) {
    // 1. Calculate ratios based on subject weights
    let totalWeight = 0;
    selectedSubjects.forEach(sub => {
      totalWeight += (weights[sub] || 2);
    });

    const questionsPerSubject = {};
    selectedSubjects.forEach(sub => {
      const w = weights[sub] || 2;
      questionsPerSubject[sub] = Math.round((w / totalWeight) * count);
    });

    // Adjust rounding mismatch to hit count precisely
    let currentSum = Object.values(questionsPerSubject).reduce((a, b) => a + b, 0);
    while (currentSum !== count) {
      const diff = count - currentSum;
      const step = diff > 0 ? 1 : -1;
      const keys = Object.keys(questionsPerSubject);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      if (questionsPerSubject[randomKey] + step >= 0) {
        questionsPerSubject[randomKey] += step;
        currentSum += step;
      }
    }

    const testQuestions = [];

    // 2. Fetch or generate questions for each subject
    selectedSubjects.forEach(sub => {
      const targetCount = questionsPerSubject[sub];
      let subQuestions = [];

      // Try preseeded questions first
      let preseededKey = this.mapSubjectToPreseededKey(sub);
      const preseededList = PRESEEDED_QUESTIONS[preseededKey] || [];
      
      const shuffledPreseeded = [...preseededList].sort(() => 0.5 - Math.random());
      shuffledPreseeded.forEach(q => {
        if (subQuestions.length < targetCount) {
          subQuestions.push({
            subject: sub,
            question: q.question,
            options: [...q.options],
            answer: q.answer,
            explanation: q.explanation
          });
        }
      });

      // Generate procedural questions to fill remaining slots
      let indexCounter = 0;
      while (subQuestions.length < targetCount) {
        const generated = this.createProceduralQuestion(sub, difficulty, indexCounter++);
        subQuestions.push(generated);
      }

      testQuestions.push(...subQuestions);
    });

    // Shuffle final generated questions list
    return testQuestions.sort(() => 0.5 - Math.random());
  },

  mapSubjectToPreseededKey(subName) {
    const nameLower = subName.toLowerCase();
    if (nameLower.includes("physic")) return "Physics";
    if (nameLower.includes("chemist")) return "Chemistry";
    if (nameLower.includes("biolog")) return "Biology";
    if (nameLower.includes("math") || nameLower.includes("calculus") || nameLower.includes("algebra") || nameLower.includes("arithmetic") || nameLower.includes("quant")) return "Mathematics";
    if (nameLower.includes("computer") || nameLower.includes("algorithm") || nameLower.includes("programming") || nameLower.includes("data structure") || nameLower.includes("dbms") || nameLower.includes("network") || nameLower.includes("operating system")) return "Core Computer Science";
    if (nameLower.includes("history") || nameLower.includes("polity") || nameLower.includes("geography") || nameLower.includes("economy") || nameLower.includes("environment") || nameLower.includes("general studies") || nameLower.includes("gk") || nameLower.includes("awareness")) return "General Studies";
    return "General";
  },

  createProceduralQuestion(subject, difficulty, index) {
    const subLower = subject.toLowerCase();
    
    // Random coefficients
    const numA = 10 + (index * 7) % 40;
    const numB = 2 + (index * 3) % 9;
    const prod = numA * numB;
    
    // Templates based on subjects
    if (subLower.includes("physics")) {
      return {
        subject,
        question: `[${difficulty}] An object of mass ${numB} kg accelerates at a constant rate of ${numA} m/s². What is the net force acting on the object?`,
        options: [`${prod} N`, `${(numA / numB).toFixed(1)} N`, `${(numB / numA).toFixed(1)} N`, `${numA + numB} N`],
        answer: 0,
        explanation: `Using Newton's Second Law of Motion: F = ma. Here mass (m) = ${numB} kg, and acceleration (a) = ${numA} m/s². Thus, Force = ${numB} * ${numA} = ${prod} N.`
      };
    }
    
    if (subLower.includes("chemistry")) {
      const pHVal = 2 + (index % 5);
      const isAcid = pHVal < 7;
      return {
        subject,
        question: `[${difficulty}] A test solution is measured to have a pH value of ${pHVal}. How is this solution classified?`,
        options: ["Neutral", "Strongly Alkaline", isAcid ? "Acidic" : "Basic", isAcid ? "Basic" : "Acidic"],
        answer: 2,
        explanation: `Solutions with a pH less than 7 are classified as acidic, whereas solutions with pH values greater than 7 are alkaline (basic). A pH of 7 represents neutral.`
      };
    }
    
    if (subLower.includes("math") || subLower.includes("quant") || subLower.includes("calculus") || subLower.includes("algebra")) {
      return {
        subject,
        question: `[${difficulty}] If a set of ${numA} similar machines can produce ${prod} units in an hour, how many units can one machine produce in the same duration?`,
        options: [`${numB} units`, `${numA} units`, `${prod} units`, `${numA + numB} units`],
        answer: 0,
        explanation: `Production is linear. If ${numA} machines yield ${prod} units, then one machine yields ${prod} / ${numA} = ${numB} units.`
      };
    }
    
    if (subLower.includes("biolog")) {
      return {
        subject,
        question: `[${difficulty}] During cellular processes, which molecule acts as the primary energy currency for cellular functions?`,
        options: ["Glucose", "ADP", "ATP (Adenosine Triphosphate)", "NADH"],
        answer: 2,
        explanation: `ATP is the primary energy carrier in cells, transferring chemical energy harvested from cellular respiration pathways to energy-consuming cellular mechanisms.`
      };
    }

    if (subLower.includes("program") || subLower.includes("data structure") || subLower.includes("dbms") || subLower.includes("operating") || subLower.includes("network") || subLower.includes("computer")) {
      return {
        subject,
        question: `[${difficulty}] In database design, which property ensures that a relational table column uniquely identifies each row record?`,
        options: ["Foreign Key", "Index Marker", "Primary Key", "Unique Constrain"],
        answer: 2,
        explanation: `A Primary Key constraints column values to be unique and non-null, uniquely mapping each record within a relational database table.`
      };
    }

    if (subLower.includes("reason") || subLower.includes("aptitude") || subLower.includes("intelligence")) {
      const nextNum = numA + numB * 3;
      return {
        subject,
        question: `[${difficulty}] Complete the arithmetic progression series: ${numA}, ${numA + numB}, ${numA + numB * 2}, ______ ?`,
        options: [`${nextNum}`, `${numA + numB * 4}`, `${numA + numB * 5}`, `${numA * numB}`],
        answer: 0,
        explanation: `The common difference in this progression series is +${numB}. Therefore, the fourth term is calculated as ${numA + numB * 2} + ${numB} = ${nextNum}.`
      };
    }

    if (subLower.includes("history") || subLower.includes("gk") || subLower.includes("awareness") || subLower.includes("polity") || subLower.includes("economy") || subLower.includes("studies") || subLower.includes("environment")) {
      const years = [1947, 1950, 1973, 1915, 1857];
      const yr = years[index % years.length];
      let questionText = ``;
      let optionsList = [];
      let ans = 0;
      let exp = ``;

      if (yr === 1947) {
        questionText = `[${difficulty}] In which year did India officially achieve independence from British colonial rule?`;
        optionsList = ["1947", "1950", "1942", "1935"];
        ans = 0;
        exp = "India gained independence from British rule on August 15, 1947, under the Indian Independence Act.";
      } else if (yr === 1950) {
        questionText = `[${difficulty}] In which year did the Constitution of India come into force, declaring India a sovereign republic?`;
        optionsList = ["1947", "1950", "1952", "1949"];
        ans = 1;
        exp = "The Constitution of India was adopted on November 26, 1949, and officially came into force on January 26, 1950.";
      } else {
        questionText = `[${difficulty}] Which constitutional body regulates monetary policy framework parameters in the Indian economy?`;
        optionsList = ["Ministry of Finance", "Securities and Exchange Board of India (SEBI)", "Reserve Bank of India (RBI)", "NITI Aayog"];
        ans = 2;
        exp = "The Reserve Bank of India (RBI) is the central bank of India, responsible for implementing monetary policy parameters to manage inflation and credit flow.";
      }

      return {
        subject,
        question: questionText,
        options: optionsList,
        answer: ans,
        explanation: exp
      };
    }

    // Generic fallback template
    return {
      subject,
      question: `[${difficulty}] In reference to "${subject}" syllabus topics, which of the following is considered a typical practical application constraint?`,
      options: [
        "Calibrating sensor feedback latency during ambient interference.",
        "Optimizing structural efficiency, safety factors, and resource inputs.",
        "Reducing processing workloads in high-pressure execution loops.",
        "All of the above depending on system scale and operating environments."
      ],
      answer: 3,
      explanation: `Concepts under this chapter of "${subject}" require balanced considerations of safety, cost, environmental impacts, and technical system capabilities.`
    };
  },

  startTimer() {
    const timerDisplay = document.getElementById("quiz-timer-clock");
    const timerWrapper = document.getElementById("quiz-timer-display");
    if (!timerDisplay) return;

    const updateTimerUI = () => {
      if (this.currentTest.timerRemaining <= 0) {
        clearInterval(this.currentTest.timerInterval);
        alert("Time is up! Submitting your mock test automatically.");
        this.submitTest();
        return;
      }

      this.currentTest.timerRemaining--;

      const mins = Math.floor(this.currentTest.timerRemaining / 60);
      const secs = this.currentTest.timerRemaining % 60;
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (this.currentTest.timerRemaining < 60) {
        if (timerWrapper) timerWrapper.classList.add("warning");
      } else {
        if (timerWrapper) timerWrapper.classList.remove("warning");
      }
    };

    updateTimerUI();
    this.currentTest.timerInterval = setInterval(updateTimerUI, 1000);
  },

  renderQuestionNavGrid() {
    const grid = document.getElementById("quiz-nav-grid");
    if (!grid) return;

    grid.innerHTML = this.currentTest.questions.map((q, idx) => {
      let statusClass = "";
      if (this.currentTest.currentIndex === idx) {
        statusClass = "active";
      } else if (this.currentTest.markedForReview[idx]) {
        statusClass = "marked-review";
      } else if (this.currentTest.answers[idx] !== undefined) {
        statusClass = "answered";
      } else if (this.currentTest.visited[idx]) {
        statusClass = "visited";
      }

      return `
        <button type="button" class="quiz-nav-btn ${statusClass}" onclick="ExamSpaceManager.jumpToQuestion(${idx})">
          ${idx + 1}
        </button>
      `;
    }).join('');
  },

  jumpToQuestion(index) {
    if (index >= 0 && index < this.currentTest.questions.length) {
      this.currentTest.visited[this.currentTest.currentIndex] = true;
      this.currentTest.currentIndex = index;
      this.currentTest.visited[index] = true;
      this.renderActiveQuestion();
      this.renderQuestionNavGrid();
    }
  },

  renderActiveQuestion() {
    const question = this.currentTest.questions[this.currentTest.currentIndex];
    const total = this.currentTest.questions.length;
    const progressIndex = this.currentTest.currentIndex + 1;

    // Update progress numbers
    const progressText = document.getElementById("quiz-progress-text");
    const progressPercent = document.getElementById("quiz-progress-percent");
    const progressFill = document.getElementById("quiz-progress-fill");

    if (progressText) progressText.textContent = `Question ${progressIndex} of ${total}`;
    if (progressPercent) {
      const percentage = Math.round((progressIndex / total) * 100);
      progressPercent.textContent = `${percentage}% Completed`;
      if (progressFill) progressFill.style.width = `${percentage}%`;
    }

    // Render Question Text and Subject
    const subjectEl = document.getElementById("runner-question-subject");
    const questionTextEl = document.getElementById("runner-question-text");
    if (subjectEl) subjectEl.textContent = question.subject;
    if (questionTextEl) questionTextEl.textContent = question.question;

    // Render Options List
    const optionsListEl = document.getElementById("runner-options-list");
    if (optionsListEl) {
      const selectedAnswer = this.currentTest.answers[this.currentTest.currentIndex];
      
      optionsListEl.innerHTML = question.options.map((opt, idx) => {
        const letters = ["A", "B", "C", "D", "E"];
        const letter = letters[idx] || String(idx + 1);
        const isSelected = selectedAnswer === idx;
        
        return `
          <div class="quiz-option-card ${isSelected ? 'selected' : ''}" onclick="ExamSpaceManager.selectOption(${idx})">
            <span class="option-letter">${letter}</span>
            <span class="option-text">${opt}</span>
          </div>
        `;
      }).join('');
    }

    // Toggle mark review button active state
    const markReviewBtn = document.getElementById("quiz-mark-review-btn");
    if (markReviewBtn) {
      const isMarked = this.currentTest.markedForReview[this.currentTest.currentIndex];
      if (isMarked) {
        markReviewBtn.innerHTML = `<i class="fas fa-bookmark"></i> Marked`;
        markReviewBtn.style.background = "rgba(139, 92, 246, 0.1)";
      } else {
        markReviewBtn.innerHTML = `<i class="far fa-bookmark"></i> Mark for Review`;
        markReviewBtn.style.background = "transparent";
      }
    }

    // Toggle next vs submit button
    const nextBtn = document.getElementById("quiz-next-btn");
    const submitBtn = document.getElementById("quiz-submit-btn");

    if (this.currentTest.currentIndex === total - 1) {
      if (nextBtn) nextBtn.style.display = "none";
      if (submitBtn) submitBtn.style.display = "block";
    } else {
      if (nextBtn) nextBtn.style.display = "block";
      if (submitBtn) submitBtn.style.display = "none";
    }

    // Toggle prev button state
    const prevBtn = document.getElementById("quiz-prev-btn");
    if (prevBtn) {
      prevBtn.disabled = this.currentTest.currentIndex === 0;
    }
  },

  selectOption(optionIndex) {
    this.currentTest.answers[this.currentTest.currentIndex] = optionIndex;
    this.renderActiveQuestion();
    this.renderQuestionNavGrid();
  },

  toggleMarkForReview() {
    const idx = this.currentTest.currentIndex;
    this.currentTest.markedForReview[idx] = !this.currentTest.markedForReview[idx];
    this.renderActiveQuestion();
    this.renderQuestionNavGrid();
  },

  prevQuestion() {
    if (this.currentTest.currentIndex > 0) {
      this.jumpToQuestion(this.currentTest.currentIndex - 1);
    }
  },

  nextQuestion() {
    if (this.currentTest.currentIndex < this.currentTest.questions.length - 1) {
      this.jumpToQuestion(this.currentTest.currentIndex + 1);
    }
  },

  async submitTest() {
    clearInterval(this.currentTest.timerInterval);

    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;
    const reviewData = [];

    // Subject-wise correct/total counts
    const subjectStats = {};

    this.currentTest.questions.forEach((q, idx) => {
      const userAns = this.currentTest.answers[idx];
      const hasAttempted = userAns !== undefined;
      const isCorrect = hasAttempted && userAns === q.answer;

      if (hasAttempted) {
        attemptedCount++;
        if (isCorrect) correctCount++;
        else incorrectCount++;
      } else {
        incorrectCount++; // Unanswered counts as incorrect for score
      }

      // Initialize subject stats if missing
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { correct: 0, total: 0 };
      }
      subjectStats[q.subject].total++;
      if (isCorrect) subjectStats[q.subject].correct++;

      reviewData.push({
        subject: q.subject,
        question: q.question,
        options: q.options,
        userAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect: isCorrect,
        explanation: q.explanation
      });
    });

    const totalQs = this.currentTest.questions.length;
    const scorePercent = Math.round((correctCount / totalQs) * 100);

    // Calculate time taken
    const timeTakenSeconds = this.currentTest.totalDuration - this.currentTest.timerRemaining;
    const minsTaken = Math.floor(timeTakenSeconds / 60);
    const secsTaken = timeTakenSeconds % 60;
    const timeTakenStr = `${String(minsTaken).padStart(2, '0')}:${String(secsTaken).padStart(2, '0')}`;

    // Subject-wise breakdown list
    const strengths = [];
    const weaknesses = [];

    const subjectListHTML = Object.keys(subjectStats).map(sub => {
      const stats = subjectStats[sub];
      const rate = Math.round((stats.correct / stats.total) * 100);
      
      if (rate >= 75) strengths.push(sub);
      if (rate < 60) weaknesses.push(sub);

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom:4px;">
          <span>${sub}</span>
          <span style="font-weight:600;">${stats.correct}/${stats.total} (${rate}%)</span>
        </div>
      `;
    }).join('');

    // Generate local recommendations fallback text
    let tipsHTML = "";
    if (weaknesses.length > 0) {
      tipsHTML = `
        <p><strong>Weak Subjects Identified:</strong> ${weaknesses.join(', ')}</p>
        <ul style="padding-left:18px; margin:6px 0;">
          <li>Review key textbooks and notes specifically focusing on these syllabus domains.</li>
          <li>Adjust your Daily Schedule blocks to allocate extra time to these areas.</li>
          <li>Set up shorter Mock Tests focusing exclusively on these subjects to practice.</li>
        </ul>
      `;
    } else {
      tipsHTML = `
        <p><strong>Excellent Performance Profile!</strong> All subjects demonstrate solid scores.</p>
        <ul style="padding-left:18px; margin:6px 0;">
          <li>Keep practicing mixed question blocks to preserve speed and confidence.</li>
          <li>Tackle the remaining uncompleted topics in your Syllabus Tracker.</li>
          <li>Simulate tests with shorter time limits to build rapid retrieval.</li>
        </ul>
      `;
    }

    // Add layout changes to results card
    document.getElementById("quiz-config-view").style.display = "none";
    document.getElementById("quiz-runner-view").style.display = "none";
    document.getElementById("quiz-results-view").style.display = "block";

    // Populate Results
    const totalQuestionsEl = document.getElementById("results-total-questions");
    const scorePercentEl = document.getElementById("results-percentage");
    const performanceMsgEl = document.getElementById("results-performance-message");
    const attemptedCountEl = document.getElementById("results-attempted-count");
    const correctCountEl = document.getElementById("results-correct-count");
    const incorrectCountEl = document.getElementById("results-incorrect-count");
    const timeTakenEl = document.getElementById("results-time-taken");
    const strengthsEl = document.getElementById("results-strengths-badge");
    const weaknessesEl = document.getElementById("results-weaknesses-badge");
    const analysisListEl = document.getElementById("results-subject-analysis-list");
    const aiRecommendationsEl = document.getElementById("results-ai-recommendations");

    if (totalQuestionsEl) totalQuestionsEl.textContent = totalQs;
    if (scorePercentEl) scorePercentEl.textContent = `${scorePercent}%`;
    if (attemptedCountEl) attemptedCountEl.textContent = attemptedCount;
    if (correctCountEl) correctCountEl.textContent = correctCount;
    if (incorrectCountEl) incorrectCountEl.textContent = incorrectCount;
    if (timeTakenEl) timeTakenEl.textContent = `${minsTaken} min ${secsTaken} sec`;
    
    if (strengthsEl) strengthsEl.textContent = strengths.join(', ') || 'None';
    if (weaknessesEl) weaknessesEl.textContent = weaknesses.join(', ') || 'None';
    if (analysisListEl) analysisListEl.innerHTML = subjectListHTML;
    if (aiRecommendationsEl) aiRecommendationsEl.innerHTML = `
      <div id="ai-recs-loading" style="text-align:center; padding:10px 0; color:var(--text-muted);">
        <i class="fas fa-spinner fa-spin"></i> Analyzing mock test performance and generating AI tutor tips...
      </div>
    `;

    if (performanceMsgEl) {
      if (scorePercent >= 90) {
        performanceMsgEl.textContent = "Outstanding! You demonstrate exceptional mastery of these topics.";
      } else if (scorePercent >= 75) {
        performanceMsgEl.textContent = "Great work! You show solid conceptual clarity, just review minor gaps.";
      } else if (scorePercent >= 50) {
        performanceMsgEl.textContent = "Fair attempt. Focus on revising hard topics and testing your speed.";
      } else {
        performanceMsgEl.textContent = "More practice needed. Go back to study planner guides to build concept depth.";
      }
    }

    // Save attempt data
    const activeExam = window.AppManager.activeExam;
    const testResult = {
      timestamp: new Date().toISOString(),
      exam: this.currentTest.exam,
      subjects: Array.from(new Set(this.currentTest.questions.map(q => q.subject))),
      questionCount: totalQs,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      scorePercent: scorePercent,
      durationMinutes: Math.ceil(this.currentTest.totalDuration / 60),
      timeTakenSeconds: timeTakenSeconds,
      difficulty: this.currentTest.difficulty,
      subjectAnalysis: subjectStats,
      recommendations: { strengths, weaknesses }
    };

    this.history.unshift(testResult);
    this.saveHistory();

    // Mirror to MySQL Database
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.saveExamSpaceAttempt(activeExam, testResult);
    }

    // Trigger sound alert
    const audioEnabled = StorageManager.load("audio_alerts_enabled", true);
    if (audioEnabled) {
      this.synthesizeCompletionSound(scorePercent >= 75);
    }

    // Asynchronously call Gemini API for customized AI Recommendations
    this.fetchAIChatbotRecommendations(testResult, strengths, weaknesses, timeTakenStr);

    // Populate Detailed Review List
    const reviewListEl = document.getElementById("results-review-list");
    if (reviewListEl) {
      reviewListEl.innerHTML = reviewData.map((rev, idx) => {
        const letters = ["A", "B", "C", "D", "E"];
        const badgeClass = rev.isCorrect ? 'correct' : 'incorrect';
        const badgeLabel = rev.isCorrect ? 'Correct' : rev.userAnswer === undefined ? 'Unanswered' : 'Incorrect';

        const optionsHTML = rev.options.map((opt, oIdx) => {
          const letter = letters[oIdx];
          let optClass = '';
          
          if (oIdx === rev.correctAnswer) {
            optClass = 'correct';
          } else if (oIdx === rev.userAnswer && !rev.isCorrect) {
            optClass = 'user-selected-incorrect';
          }

          return `
            <div class="review-option ${optClass}">
              <strong>${letter}:</strong> ${opt}
            </div>
          `;
        }).join('');

        return `
          <div class="review-question-item">
            <div class="review-question-header">
              <div>
                <span class="question-subject">${rev.subject}</span>
                <h4>${rev.question}</h4>
              </div>
              <span class="review-badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="review-options-list">
              ${optionsHTML}
            </div>
            <div class="review-explanation">
              <strong>AI Explanation:</strong> ${rev.explanation}
            </div>
          </div>
        `;
      }).join('');
    }

    // Sync Completed Mock Tests to dashboard statistics
    if (window.AppManager) {
      window.AppManager.updateDashboardWidgets();
    }
  },

  async fetchAIChatbotRecommendations(testResult, strengths, weaknesses, timeTakenStr) {
    const aiRecommendationsEl = document.getElementById("results-ai-recommendations");
    if (!aiRecommendationsEl) return;

    let localHTML = `
      <p style="margin-bottom:8px;"><strong>StudyAI Local Recommendation Profile:</strong></p>
      <div style="margin-bottom: 8px;">
        <strong>Syllabus Strengths:</strong> <span style="color:var(--accent-success);">${strengths.join(', ') || 'None yet'}</span><br>
        <strong>Focus Improvement Areas:</strong> <span style="color:var(--accent-danger);">${weaknesses.join(', ') || 'None! Keep it up'}</span>
      </div>
      <p>Recommended Materials: Look up practice sets in your notes section and tackle PYQ past papers for standard preparation.</p>
    `;

    if (window.ApiClient && window.ApiClient.isActive) {
      try {
        const statsStr = `taken a ${testResult.exam.toUpperCase()} mock test. Score: ${testResult.scorePercent}% (${testResult.correctCount}/${testResult.questionCount} correct). Difficulty: ${testResult.difficulty}. Time Taken: ${timeTakenStr}. Strengths: ${strengths.join(', ')}. Weaknesses: ${weaknesses.join(', ')}.`;
        
        // Prepare prompt payload format matching ApiClient memory parameters
        const historyMock = [
          {
            sender: "user",
            text: `Analyze my exam mock test results and provide concise bullet points suggestions. Here are my stats: ${statsStr}`
          }
        ];

        const response = await window.ApiClient.askAI(historyMock);
        if (response && response.success && !response.isFallback) {
          // Format markdown carriage returns to HTML tags
          const textFormatted = response.text
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\* \*\*(.*?)\*\*/g, '<li><strong>$1</strong>')
            .replace(/\* (.*?)/g, '<li>$1')
            .replace(/- (.*?)/g, '<li>$1');
          
          aiRecommendationsEl.innerHTML = `
            <div style="text-align:left; font-family:'Outfit',sans-serif; line-height:1.6;">
              ${textFormatted}
            </div>
          `;
          return;
        }
      } catch (err) {
        console.warn("Gemini Recommendations failed, rendering local template.", err);
      }
    }

    aiRecommendationsEl.innerHTML = localHTML;
  },

  synthesizeCompletionSound(isSuccess) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (isSuccess) {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.setValueAtTime(329.63, now + 0.2); // E4
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn("Web Audio API not supported or user gesture required.", e);
    }
  },

  retakeTest() {
    this.startTest();
  }
};

window.ExamSpaceManager = ExamSpaceManager;
ExamSpaceManager.init();

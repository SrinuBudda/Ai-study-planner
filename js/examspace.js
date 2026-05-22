// AI Study Planner - Exam Space Module
// Handles simulated mock tests, custom tests based on syllabus completion, timers, and performance histories.

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
    },
    {
      question: "What is the terminal velocity of a falling sphere of radius r in a viscous fluid proportional to (according to Stokes' Law)?",
      options: ["r", "r²", "1/r", "r³"],
      answer: 1,
      explanation: "The drag force is F = 6πηrv. Setting gravity equal to drag plus buoyancy yields terminal velocity v_t proportional to the square of the radius (r²)."
    },
    {
      question: "In thermodynamics, what remains constant during a perfect adiabatic process?",
      options: ["Temperature", "Pressure", "Entropy", "Volume"],
      answer: 2,
      explanation: "A reversible adiabatic process is also isentropic, meaning entropy (S) remains constant throughout the system because no heat is exchanged (dQ = 0)."
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
    },
    {
      question: "What is the oxidation state of Chromium in Potassium Dichromate (K₂Cr₂O₇)?",
      options: ["+3", "+4", "+5", "+6"],
      answer: 3,
      explanation: "In K₂Cr₂O₇, Potassium is +1 and Oxygen is -2. So, 2(+1) + 2(Cr) + 7(-2) = 0 => 2 + 2(Cr) - 14 = 0 => 2(Cr) = 12 => Cr = +6."
    },
    {
      question: "Which element has the highest electronegativity value on the Pauling scale?",
      options: ["Oxygen", "Fluorine", "Chlorine", "Helium"],
      answer: 1,
      explanation: "Fluorine is the most electronegative element on the periodic table, with a value of approximately 3.98 on the Pauling scale."
    },
    {
      question: "What is the pH of a 1.0 x 10⁻³ M solution of a strong monoprotic acid?",
      options: ["1.0", "3.0", "7.0", "11.0"],
      answer: 1,
      explanation: "For a strong monoprotic acid, [H⁺] is equal to the concentration of the acid. pH = -log[H⁺] = -log(10⁻³) = 3.0."
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
    },
    {
      question: "What is the value of the limit as x approaches 0 of sin(x) / x?",
      options: ["0", "1", "Undefined", "Infinity"],
      answer: 1,
      explanation: "The limit of sin(x)/x as x approaches 0 is a fundamental trigonometric limit equal to 1, which can be proved geometrically or using L'Hopital's rule."
    },
    {
      question: "What is the area bounded by the curve y = x², the x-axis, and the vertical lines x = 0 and x = 3?",
      options: ["3", "6", "9", "27"],
      answer: 2,
      explanation: "Integrate x² from 0 to 3. Integral is [x³/3] evaluated from 0 to 3, which is (27/3) - 0 = 9."
    },
    {
      question: "If two events A and B are independent, what is P(A ∩ B) equal to?",
      options: ["P(A) + P(B)", "P(A) * P(B)", "P(A) | P(B)", "P(A) + P(B) - P(A ∩ B)"],
      answer: 1,
      explanation: "By definition, two events A and B are independent if and only if the probability of their intersection is the product of their individual probabilities: P(A ∩ B) = P(A) * P(B)."
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
    },
    {
      question: "What is the primary site of gaseous exchange in human lungs?",
      options: ["Bronchi", "Trachea", "Alveoli", "Bronchioles"],
      answer: 2,
      explanation: "Alveoli are tiny air sacs at the end of the bronchioles where the lungs and the blood exchange oxygen and carbon dioxide during the process of breathing."
    },
    {
      question: "Which nitrogenous base is present in RNA but absent in DNA?",
      options: ["Adenine", "Thymine", "Uracil", "Cytosine"],
      answer: 2,
      explanation: "RNA contains Uracil (U) instead of Thymine (T), which is present in DNA. Both contain Adenine, Cytosine, and Guanine."
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
    },
    {
      question: "Which OSI model layer is responsible for logical addressing, routing, and path determination?",
      options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"],
      answer: 1,
      explanation: "The Network Layer (Layer 3) handles routing, IP addressing, and determining the optimal path of packets across networks."
    },
    {
      question: "What is a process that has terminated but still has an entry in the process table called?",
      options: ["Daemon process", "Orphan process", "Zombie process", "Thread process"],
      answer: 2,
      explanation: "A zombie process (or defunct process) is a process that has completed execution but still has an entry in the process table to allow the parent process to read its exit status."
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
    },
    {
      question: "What Repo Rate action does the RBI take to curb high inflation in the economy?",
      options: ["Decrease the Repo Rate", "Increase the Repo Rate", "Keep Repo Rate unchanged", "Abolish the Repo Rate entirely"],
      answer: 1,
      explanation: "RBI increases the Repo Rate to curb inflation. This makes loans expensive for commercial banks, which raises interest rates for consumers, reducing money supply and cooling demand."
    },
    {
      question: "Which of the following greenhouse gases has the highest global warming potential molecule-for-molecule?",
      options: ["Carbon Dioxide (CO₂)", "Methane (CH₄)", "Nitrous Oxide (N₂O)", "Sulfur Hexafluoride (SF₆)"],
      answer: 3,
      explanation: "Molecule-for-molecule, SF₆ is the most potent greenhouse gas known, with a global warming potential 23,500 times greater than CO₂ over a 100-year period."
    }
  ],
  "Mathematics & Aptitude": [
    {
      question: "If a work can be completed by 8 workers in 15 days, how many days will it take 12 workers to complete the same work?",
      options: ["8 days", "10 days", "12 days", "14 days"],
      answer: 1,
      explanation: "Work is constant: Workers * Days = Constant. So, 8 * 15 = 120 man-days. If there are 12 workers: 120 / 12 = 10 days."
    },
    {
      question: "A train 120 meters long passes a telegraph post in 6 seconds. What is the speed of the train in km/h?",
      options: ["60 km/h", "72 km/h", "80 km/h", "90 km/h"],
      answer: 1,
      explanation: "Speed = Distance / Time = 120m / 6s = 20 m/s. To convert to km/h, multiply by 18/5: 20 * 18 / 5 = 72 km/h."
    },
    {
      question: "The sum of the ages of a father and his son is 50 years. 5 years ago, the father's age was 7 times the son's age. What is the father's current age?",
      options: ["35 years", "38 years", "40 years", "42 years"],
      answer: 2,
      explanation: "Let father's age be F and son's age be S. F + S = 50. 5 years ago: (F - 5) = 7(S - 5) => F - 5 = 7S - 35 => F = 7S - 30. Substitute F: 7S - 30 + S = 50 => 8S = 80 => S = 10. Thus, F = 40 years."
    }
  ],
  "General": [
    {
      question: "Which of the following is a key element of effective, active study methods?",
      options: ["Passive rereading", "Self-testing and active recall", "Highlighting full pages", "Cramming overnight"],
      answer: 1,
      explanation: "Self-testing and active recall force the brain to retrieve information, reinforcing neural pathways and significantly boosting long-term memory."
    }
  ],
  "Legal Reasoning": [
    {
      question: "Under the Law of Torts, what is the principle of 'Strict Liability'?",
      options: ["Liability regardless of fault or intention to cause harm", "Liability arising only when criminal intent is proven", "Liability limited to public servants while discharging duties", "Liability that can be transferred to a third party by contract"],
      answer: 0,
      explanation: "Strict liability is a standard for liability which may exist in either a civil or criminal context where a person is legally responsible for the consequences of an activity, regardless of fault or negligence."
    },
    {
      question: "Which landmark judgment of the Supreme Court of India established the 'Basic Structure Doctrine' of the Constitution?",
      options: ["Golaknath v. State of Punjab (1967)", "Kesavananda Bharati v. State of Kerala (1973)", "Maneka Gandhi v. Union of India (1978)", "Minerva Mills v. Union of India (1980)"],
      answer: 1,
      explanation: "The Basic Structure Doctrine was established by a 13-judge bench of the Supreme Court of India in Kesavananda Bharati v. State of Kerala (1973), ruling that Parliament cannot alter the basic features of the Constitution."
    },
    {
      question: "What constitutes 'consensus ad idem' under the Indian Contract Act, 1872?",
      options: ["Meeting of the minds on the same thing in the same sense", "Agreement without consideration being void", "An agreement signed by competent adults under duress", "Damages claimed due to breach of contract terms"],
      answer: 0,
      explanation: "Consensus ad idem is a Latin phrase meaning agreement or meeting of minds. Under Section 13 of the Indian Contract Act, 1872, two or more persons are said to consent when they agree upon the same thing in the same sense."
    },
    {
      question: "Under Criminal Law, what is the legal definition of 'Culpable Homicide not amounting to Murder'?",
      options: ["Causing death by negligence without any intention", "Causing death with intention or knowledge, but falling under statutory exceptions", "Accidental death caused during a lawful act", "Planned premeditated killing of a person in cold blood"],
      answer: 1,
      explanation: "Culpable Homicide not amounting to murder (Section 299 of IPC) is when death is caused with intention or knowledge, but is executed under sudden provocation, self-defense, or other exceptions outlined in Section 300."
    }
  ],
  "Military GK": [
    {
      question: "Which of the following is the highest peacetime gallantry award in India?",
      options: ["Param Vir Chakra", "Maha Vir Chakra", "Ashoka Chakra", "Shaurya Chakra"],
      answer: 2,
      explanation: "The Ashoka Chakra is India's highest peacetime military decoration awarded for valor, courageous action, or self-sacrifice away from the battlefield. Param Vir Chakra is the highest wartime gallantry award."
    },
    {
      question: "What is the correct rank equivalence between the Indian Army, Navy, and Air Force for the rank of Army Captain?",
      options: ["Navy Lieutenant / Air Force Flight Lieutenant", "Navy Commander / Air Force Wing Commander", "Navy Sub-Lieutenant / Air Force Flying Officer", "Navy Captain / Air Force Group Captain"],
      answer: 0,
      explanation: "An Army Captain is equivalent in rank structure to a Lieutenant in the Indian Navy and a Flight Lieutenant in the Indian Air Force."
    },
    {
      question: "Which joint military exercise is conducted annually between India and France under the name 'Varuna'?",
      options: ["Joint Air Force Exercise", "Joint Army Exercise", "Joint Naval Exercise", "Joint Special Forces Exercise"],
      answer: 2,
      explanation: "Varuna is the bilateral naval exercise conducted annually between the Indian Navy and the French Navy. Shakti is for the Army and Garuda is for the Air Force."
    },
    {
      question: "What is the primary role of the Indian Army's 'Technical Graduate Course' (TGC) entry scheme?",
      options: ["Direct recruitment of undergraduate medical cadets", "Commissioning engineering graduates as officers in technical arms/services", "Selecting high school students for NDA training modules", "Recruiting law graduates for the Judge Advocate General branch"],
      answer: 1,
      explanation: "The TGC is a direct entry scheme for engineering graduates to join the Indian Army as commissioned officers in the technical branches like Corps of Engineers, Signals, and EME."
    }
  ],
  "General English": [
    {
      question: "Identify the correct option to fill in the blank: 'Neither the teacher nor the students ______ present in the library yesterday.'",
      options: ["was", "were", "is", "are"],
      answer: 1,
      explanation: "When subjects are joined by 'neither... nor', the verb agrees with the closer subject. Since 'students' is plural and the sentence is in the past tense, 'were' is correct."
    },
    {
      question: "Which of the following is the closest antonym for the word 'Ephemeral'?",
      options: ["Transient", "Perpetual", "Evanescent", "Fugitive"],
      answer: 1,
      explanation: "Ephemeral means lasting for a very short time. The antonym is perpetual, which means lasting forever or for an indefinitely long time."
    },
    {
      question: "Identify the error in the sentence: 'Each of the partners have submitted their respective progress reports to the board.'",
      options: ["Each of the partners", "have submitted", "their respective", "to the board"],
      answer: 1,
      explanation: "'Each' is a singular pronoun and requires a singular verb. Therefore, 'have submitted' should be replaced with 'has submitted'."
    },
    {
      question: "What is the meaning of the idiom 'To burn the candle at both ends'?",
      options: ["To waste money on unnecessary luxuries", "To work extremely hard or be active day and night, risking exhaustion", "To perform a ritual to bring success in studies", "To criticize someone severely for their mistakes"],
      answer: 1,
      explanation: "Burning the candle at both ends means to exhaust oneself by working too hard, staying up late, and waking up early to work."
    }
  ]
};

const ExamSpaceManager = {
  currentTest: {
    questions: [],
    currentIndex: 0,
    answers: {}, // questionIndex: selectedOptionIndex
    timerRemaining: 0, // in seconds
    timerInterval: null,
    totalDuration: 0 // in seconds
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
  },

  loadExamSpace() {
    this.loadHistory();
    this.renderConfigurator();
    this.resetToConfigurator();
  },

  loadHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    this.history = StorageManager.load(`examspace_history_${user.email}_${activeExam}`, []);
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

    listEl.innerHTML = this.history.map((test, index) => {
      const dateStr = new Date(test.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const scoreClass = test.scorePercent >= 80 ? 'high' : test.scorePercent < 50 ? 'low' : '';
      
      return `
        <div class="past-test-item">
          <div class="past-test-info">
            <h4>${test.subjects.join(', ')}</h4>
            <p>${test.questionCount} Questions | ${dateStr}</p>
          </div>
          <span class="past-test-score ${scoreClass}">${test.scorePercent}%</span>
        </div>
      `;
    }).join('');
  },

  renderConfigurator() {
    const activeExam = window.AppManager.activeExam;
    const examPreset = EXAM_PRESETS[activeExam];
    if (!examPreset) return;

    // Render syllabus completion status card
    const warningBox = document.getElementById("quiz-completed-warning-box");
    const checkboxGroup = document.getElementById("quiz-subject-checkboxes");
    
    if (!warningBox || !checkboxGroup) return;

    // Get completed syllabus details
    let totalTopics = 0;
    let completedTopics = 0;

    examPreset.subjects.forEach(sub => {
      // Find matching subject in user's saved data
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
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 15px; border-radius: var(--border-radius-md); display:flex; align-items:center; gap:12px;">
          <i class="fas fa-exclamation-triangle" style="color:var(--accent-warning); font-size:20px;"></i>
          <div>
            <h4 style="font-size:13.5px; color:var(--accent-warning); margin:0 0 2px 0;">Syllabus progress is at 0%</h4>
            <p style="font-size:12px; margin:0; line-height:1.4;">Tackle subjects in the <b>Syllabus Tracker</b> first. Fallback dummy questions will be simulated for this test.</p>
          </div>
        </div>
      `;
    } else {
      warningBox.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.15); padding: 15px; border-radius: var(--border-radius-md); display:flex; align-items:center; gap:12px;">
          <i class="fas fa-check-circle" style="color:var(--accent-success); font-size:20px;"></i>
          <div>
            <h4 style="font-size:13.5px; color:var(--accent-success); margin:0 0 2px 0;">Syllabus Coverage: ${completionRate}%</h4>
            <p style="font-size:12px; margin:0; line-height:1.4;">Awesome! The engine will select and prioritize questions from the ${completedTopics} completed topic areas.</p>
          </div>
        </div>
      `;
    }

    // Render subject checkboxes
    checkboxGroup.innerHTML = examPreset.subjects.map((sub, idx) => `
      <label class="subject-checkbox-card">
        <input type="checkbox" name="quiz-subject" value="${sub.name}" checked>
        <span>${sub.name}</span>
      </label>
    `).join('');
  },

  resetToConfigurator() {
    clearInterval(this.currentTest.timerInterval);
    document.getElementById("quiz-config-view").style.display = "block";
    document.getElementById("quiz-runner-view").style.display = "none";
    document.getElementById("quiz-results-view").style.display = "none";
  },

  startTest() {
    const selectedBoxes = document.querySelectorAll('input[name="quiz-subject"]:checked');
    if (selectedBoxes.length === 0) {
      alert("Please select at least one subject to generate questions!");
      return;
    }

    const selectedSubjects = Array.from(selectedBoxes).map(box => box.value);
    const count = parseInt(document.getElementById("quiz-question-count").value);
    const timeLimitMinutes = parseInt(document.getElementById("quiz-time-limit").value);

    // Generate questions list
    const generatedQuestions = this.generateQuestionsForTest(selectedSubjects, count);

    if (generatedQuestions.length === 0) {
      alert("Failed to generate test questions. Try checking more subjects.");
      return;
    }

    // Set Test State
    this.currentTest.questions = generatedQuestions;
    this.currentTest.currentIndex = 0;
    this.currentTest.answers = {};
    this.currentTest.totalDuration = timeLimitMinutes * 60;
    this.currentTest.timerRemaining = timeLimitMinutes * 60;

    // Show Runner view
    document.getElementById("quiz-config-view").style.display = "none";
    document.getElementById("quiz-runner-view").style.display = "block";
    document.getElementById("quiz-results-view").style.display = "none";

    // Setup active timer
    this.startTimer();
    this.renderActiveQuestion();
  },

  generateQuestionsForTest(selectedSubjects, count) {
    const activeExam = window.AppManager.activeExam;
    const examPreset = EXAM_PRESETS[activeExam];
    
    // Find syllabus completion mappings to see what topics are completed
    const completedTopicNames = [];
    selectedSubjects.forEach(subName => {
      const storedSubject = window.SyllabusManager && window.SyllabusManager.syllabusData.find(s => s.name === subName);
      if (storedSubject) {
        storedSubject.topics.forEach(t => {
          if (t.completed) completedTopicNames.push({ subject: subName, topic: t.name });
        });
      }
    });

    const pool = [];

    // 1. Gather all pre-seeded questions matching selected subjects
    selectedSubjects.forEach(subName => {
      // Map general categories:
      let preseededKey = "General";
      const nameLower = subName.toLowerCase();
      if (nameLower.includes("physic")) preseededKey = "Physics";
      else if (nameLower.includes("chemist")) preseededKey = "Chemistry";
      else if (nameLower.includes("legal") || nameLower.includes("law")) preseededKey = "Legal Reasoning";
      else if (nameLower.includes("defense") || nameLower.includes("defence") || nameLower.includes("military") || nameLower.includes("gat")) preseededKey = "Military GK";
      else if (nameLower.includes("english") || nameLower.includes("verbal")) preseededKey = "General English";
      else if (nameLower.includes("math") || nameLower.includes("calculus") || nameLower.includes("algebra") || nameLower.includes("arithmetic") || nameLower.includes("geometry") || nameLower.includes("quantitative")) preseededKey = "Mathematics";
      else if (nameLower.includes("biolog") || nameLower.includes("physiolog")) preseededKey = "Biology";
      else if (nameLower.includes("computer") || nameLower.includes("algorithm") || nameLower.includes("engineering")) preseededKey = "Core Computer Science";
      else if (nameLower.includes("general studies") || nameLower.includes("polity") || nameLower.includes("history") || nameLower.includes("knowledge") || nameLower.includes("gk") || nameLower.includes("awareness")) preseededKey = "General Studies";
      else if (nameLower.includes("aptitude") || nameLower.includes("reason")) preseededKey = "Mathematics & Aptitude";

      const qList = PRESEEDED_QUESTIONS[preseededKey] || [];
      qList.forEach(q => {
        pool.push({
          subject: subName,
          question: q.question,
          options: [...q.options],
          answer: q.answer,
          explanation: q.explanation
        });
      });
    });

    // Shuffle initial preseeded pool
    let testQuestions = pool.sort(() => 0.5 - Math.random());

    // 2. Generate fallback / extra questions matching subjects & completed topics specifically
    if (testQuestions.length < count) {
      const needed = count - testQuestions.length;
      
      for (let i = 0; i < needed; i++) {
        // Pick a completed topic if available, otherwise just pick any topic from the active exam
        let targetSubject = selectedSubjects[i % selectedSubjects.length];
        let targetTopic = "General Core Concepts";

        const completedForSub = completedTopicNames.filter(c => c.subject === targetSubject);
        if (completedForSub.length > 0) {
          const randCompleted = completedForSub[Math.floor(Math.random() * completedForSub.length)];
          targetTopic = randCompleted.topic;
        } else {
          // Fallback to active syllabus list topics
          const originalSub = examPreset.subjects.find(s => s.name === targetSubject);
          if (originalSub && originalSub.topics.length > 0) {
            const randOriginal = originalSub.topics[Math.floor(Math.random() * originalSub.topics.length)];
            targetTopic = randOriginal.name;
          }
        }

        // Generate a plausible mock question
        const generated = this.createFallbackQuestion(targetSubject, targetTopic, i);
        testQuestions.push(generated);
      }
    }

    // Limit to count requested
    return testQuestions.slice(0, count);
  },

  createFallbackQuestion(subject, topic, index) {
    const templates = [
      {
        question: `In reference to "${topic}" within ${subject}, which of the following statements represents the primary foundational principle?`,
        options: [
          `It defines the equilibrium state where kinetic rates balance out.`,
          `It states that energy remains conserved under steady state parameters.`,
          `It represents the boundary constraint where external flux equals zero.`,
          `It dictates the rate of transfer based on logarithmic scaling curves.`
        ],
        answer: 1,
        explanation: `Under ${topic}, the core theorem states that total conservation holds true in an isolated system, allowing calculation of transient energy states and steady potentials.`
      },
      {
        question: `Which of the following is considered a typical practical application or engineering constraint of "${topic}"?`,
        options: [
          `Optimizing thermal insulation coefficients in high-pressure chambers.`,
          `Calibrating sensor feedback latency during electromagnetic interference.`,
          `Reducing computational latency constraints in dynamic addressing schemes.`,
          `All of the above depending on system scale and operating environments.`
        ],
        answer: 3,
        explanation: `Concepts around "${topic}" apply across multi-disciplinary boundaries, requiring optimization of efficiency, interference insulation, and bandwidth limits.`
      },
      {
        question: `When analyzing "${topic}", what is the primary impact of increasing the system's operational temperature or pressure parameters?`,
        options: [
          `Decreases particle velocity, resulting in slower convergence rates.`,
          `Increases collision frequency and average molecular kinetic energy.`,
          `Reduces the system's total entropy and shifts equilibrium to reactants.`,
          `Has no measurable effect on reaction pathways or state equations.`
        ],
        answer: 1,
        explanation: `Thermal shifts increase the kinetic energy distribution. Under collision models of "${topic}", this increases successful barrier crossings.`
      }
    ];

    // Select template based on index to randomize, and replace templates
    const base = templates[index % templates.length];
    return {
      subject: subject,
      question: base.question,
      options: base.options,
      answer: base.answer,
      explanation: base.explanation
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

      // Add visual warning if less than 60 seconds
      if (this.currentTest.timerRemaining < 60) {
        timerWrapper.classList.add("warning");
      } else {
        timerWrapper.classList.remove("warning");
      }
    };

    updateTimerUI();
    this.currentTest.timerInterval = setInterval(updateTimerUI, 1000);
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
  },

  prevQuestion() {
    if (this.currentTest.currentIndex > 0) {
      this.currentTest.currentIndex--;
      this.renderActiveQuestion();
    }
  },

  nextQuestion() {
    if (this.currentTest.currentIndex < this.currentTest.questions.length - 1) {
      this.currentTest.currentIndex++;
      this.renderActiveQuestion();
    }
  },

  submitTest() {
    clearInterval(this.currentTest.timerInterval);

    let correctCount = 0;
    let incorrectCount = 0;
    const reviewData = [];

    this.currentTest.questions.forEach((q, idx) => {
      const userAns = this.currentTest.answers[idx];
      const isCorrect = userAns === q.answer;

      if (isCorrect) correctCount++;
      else incorrectCount++;

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

    const scorePercent = Math.round((correctCount / this.currentTest.questions.length) * 100);

    // Save test in history list
    const activeExam = window.AppManager.activeExam;
    const examPreset = EXAM_PRESETS[activeExam];
    
    // Extract distinct subjects tested
    const testedSubjects = Array.from(new Set(this.currentTest.questions.map(q => q.subject)));

    const newTestHistory = {
      timestamp: new Date().toISOString(),
      exam: activeExam,
      subjects: testedSubjects,
      questionCount: this.currentTest.questions.length,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      scorePercent: scorePercent
    };

    this.history.unshift(newTestHistory);
    this.saveHistory();

    // Trigger sound alerts if enabled
    const audioEnabled = StorageManager.load("audio_alerts_enabled", true);
    if (audioEnabled) {
      this.synthesizeCompletionSound(scorePercent >= 80);
    }

    // Render Results View
    document.getElementById("quiz-config-view").style.display = "none";
    document.getElementById("quiz-runner-view").style.display = "none";
    document.getElementById("quiz-results-view").style.display = "block";

    // Populate Results
    const scorePercentEl = document.getElementById("results-percentage");
    const performanceMsgEl = document.getElementById("results-performance-message");
    const correctCountEl = document.getElementById("results-correct-count");
    const incorrectCountEl = document.getElementById("results-incorrect-count");

    if (scorePercentEl) scorePercentEl.textContent = `${scorePercent}%`;
    if (correctCountEl) correctCountEl.textContent = `${correctCount} Correct`;
    if (incorrectCountEl) incorrectCountEl.textContent = `${incorrectCount} Incorrect`;

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

    // Render Review List
    const reviewListEl = document.getElementById("results-review-list");
    if (reviewListEl) {
      reviewListEl.innerHTML = reviewData.map((rev, idx) => {
        const letters = ["A", "B", "C", "D", "E"];
        
        const badgeClass = rev.isCorrect ? 'correct' : 'incorrect';
        const badgeLabel = rev.isCorrect ? 'Correct' : 'Incorrect';

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

  synthesizeCompletionSound(isSuccess) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        // Happy success chimes: C5 -> E5 -> G5
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Melancholic attempt chimes: G4 -> E4
        const now = ctx.currentTime;
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

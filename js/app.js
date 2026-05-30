// AI Study Planner - Main App Coordinator & View Controller

const AppManager = {
  activeExam: "jee",
  activeView: "dashboard",
  examDates: {},
  countdownInterval: null,
  dashboardTargets: [],

  init() {
    this.updateThemeUI();
    this.setupAuthHandlers();
    
    const user = window.UserManager.getCurrentUser();
    if (!user) {
      document.getElementById('auth-container').classList.remove('hidden');
      document.getElementById('main-app').style.display = 'none';
      return;
    }

    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').style.display = 'flex';
    
    this.updateUserProfileUI(user);

    this.loadState();
    this.setupGlobalDOMEvents();
    this.setupViewNavigation();
    
    // Initialize components
    if (window.SyllabusManager) window.SyllabusManager.init();
    if (window.PlannerManager) window.PlannerManager.init();
    if (window.PapersManager) window.PapersManager.init();
    if (window.NotesManager) window.NotesManager.init();
    if (window.ReminderManager) {
      window.ReminderManager.loadReminders();
      window.ReminderManager.timer.init();
    }
    if (window.AnalyticsManager) window.AnalyticsManager.init();
    if (window.ExamSpaceManager) window.ExamSpaceManager.loadHistory();
    if (window.ChatbotManager) window.ChatbotManager.init();

    // Start UI
    this.initCountdown();
    this.updateDashboardWidgets();
    this.rotateMotivationalQuote();
    this.renderAITips();

    // Toggle Semester config button
    const configBtn = document.getElementById("configure-semester-btn");
    if (configBtn) {
      configBtn.style.display = (this.activeExam === 'semester') ? 'inline-flex' : 'none';
    }
  },

  setupAuthHandlers() {
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-login-form');
    const formSignup = document.getElementById('auth-signup-form');
    const demoBtn = document.getElementById('auth-demo-btn');

    if (tabLogin && tabSignup && formLogin && formSignup) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.classList.remove('hidden');
        formSignup.classList.add('hidden');
      });

      tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const res = await window.UserManager.authenticate(email, password);
        if (res.success) {
          document.getElementById('auth-container').classList.add('hidden');
          document.getElementById('main-app').style.display = 'flex';
          
          this.updateUserProfileUI(res.user);
          
          if (window.ReminderManager) {
            window.ReminderManager.showToast("Welcome Back!", `Logged in as ${res.user.name}`, "success");
          }
          
          // Run remaining initialization
          this.loadState();
          this.setupGlobalDOMEvents();
          this.setupViewNavigation();
          
          if (window.SyllabusManager) window.SyllabusManager.init();
          if (window.PlannerManager) window.PlannerManager.init();
          if (window.PapersManager) window.PapersManager.init();
          if (window.NotesManager) window.NotesManager.init();
          if (window.ReminderManager) {
            window.ReminderManager.loadReminders();
            window.ReminderManager.timer.init();
          }
          if (window.AnalyticsManager) window.AnalyticsManager.init();
          if (window.ExamSpaceManager) window.ExamSpaceManager.loadHistory();
          if (window.ChatbotManager) window.ChatbotManager.init();

          this.initCountdown();
          this.updateDashboardWidgets();
          this.rotateMotivationalQuote();
          this.renderAITips();
        } else {
          alert(res.message);
        }
      });
    }

    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        const regRes = await window.UserManager.register(name, email, password);
        if (regRes.success) {
          const authRes = await window.UserManager.authenticate(email, password);
          if (authRes.success) {
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('main-app').style.display = 'flex';
            
            this.updateUserProfileUI(authRes.user);
            
            if (window.ReminderManager) {
              window.ReminderManager.showToast("Account Created!", `Welcome, ${name}!`, "success");
            }
            
            this.loadState();
            this.setupGlobalDOMEvents();
            this.setupViewNavigation();
            
            if (window.SyllabusManager) window.SyllabusManager.init();
            if (window.PlannerManager) window.PlannerManager.init();
            if (window.PapersManager) window.PapersManager.init();
            if (window.NotesManager) window.NotesManager.init();
            if (window.ReminderManager) {
              window.ReminderManager.loadReminders();
              window.ReminderManager.timer.init();
            }
            if (window.AnalyticsManager) window.AnalyticsManager.init();
            if (window.ExamSpaceManager) window.ExamSpaceManager.loadHistory();
            if (window.ChatbotManager) window.ChatbotManager.init();

            this.initCountdown();
            this.updateDashboardWidgets();
            this.rotateMotivationalQuote();
            this.renderAITips();
          }
        } else {
          alert(regRes.message);
        }
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', async () => {
        const res = await window.UserManager.authenticate("demo@study.com", "password123");
        if (res.success) {
          document.getElementById('auth-container').classList.add('hidden');
          document.getElementById('main-app').style.display = 'flex';
          
          this.updateUserProfileUI(res.user);
          
          if (window.ReminderManager) {
            window.ReminderManager.showToast("Quick Demo Access", "Logged in using Demo account.", "success");
          }
          
          this.loadState();
          this.setupGlobalDOMEvents();
          this.setupViewNavigation();
          
          if (window.SyllabusManager) window.SyllabusManager.init();
          if (window.PlannerManager) window.PlannerManager.init();
          if (window.PapersManager) window.PapersManager.init();
          if (window.NotesManager) window.NotesManager.init();
          if (window.ReminderManager) {
            window.ReminderManager.loadReminders();
            window.ReminderManager.timer.init();
          }
          if (window.AnalyticsManager) window.AnalyticsManager.init();
          if (window.ExamSpaceManager) window.ExamSpaceManager.loadHistory();
          if (window.ChatbotManager) window.ChatbotManager.init();

          this.initCountdown();
          this.updateDashboardWidgets();
          this.rotateMotivationalQuote();
          this.renderAITips();
        }
      });
    }
  },

  updateUserProfileUI(user) {
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');

    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) {
      const parts = user.name.split(' ');
      const initials = parts.map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);
      avatarEl.textContent = initials || "S";
    }
  },

  logout() {
    if (confirm("Are you sure you want to sign out?")) {
      window.UserManager.logout();
      window.location.reload();
    }
  },

  loadState() {
    this.activeExam = StorageManager.load("active_exam", "jee");
    this.activeView = "dashboard";
    
    const exams = ["jee", "neet", "gate", "upsc", "cds", "nda", "tgc", "lawyer", "govt_eng", "semester", "placement", "ssc", "bank", "custom"];
    exams.forEach(exam => {
      this.examDates[exam] = StorageManager.load(`exam_date_${exam}`, "");
    });
  },

  setupGlobalDOMEvents() {
    // Exam selection header dropdown
    const examSelect = document.getElementById('header-exam-selector');
    if (examSelect) {
      examSelect.value = this.activeExam;
      examSelect.addEventListener('change', (e) => this.switchExam(e.target.value));
    }

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Modal closers
    const modalClosers = document.querySelectorAll('.modal-close, .modal-cancel');
    modalClosers.forEach(btn => {
      btn.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(m => m.classList.remove('active'));
      });
    });

    // Close modals on clicking backdrop
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
      }
    });

    // Sidebar Mobile Menu Toggle
    const sidebarToggle = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }

    // Close sidebar on clicking a link on mobile
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (sidebar && window.innerWidth <= 768) {
          sidebar.classList.remove('active');
        }
      });
    });

    // Hook forms
    const addSubjectForm = document.getElementById('add-subject-form');
    if (addSubjectForm) {
      addSubjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-subject-name');
        if (window.SyllabusManager && input) {
          window.SyllabusManager.addSubject(input.value);
          document.getElementById('add-subject-modal').classList.remove('active');
        }
      });
    }

    const addTopicForm = document.getElementById('add-topic-form');
    if (addTopicForm) {
      addTopicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subjectIdx = parseInt(document.getElementById('topic-subject-idx').value);
        const topicName = document.getElementById('new-topic-name').value;
        const difficulty = document.getElementById('new-topic-difficulty').value;
        if (window.SyllabusManager) {
          window.SyllabusManager.addTopic(subjectIdx, topicName, difficulty);
          document.getElementById('add-topic-modal').classList.remove('active');
        }
      });
    }

    const addReminderForm = document.getElementById('add-reminder-form');
    if (addReminderForm) {
      addReminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('rem-title').value;
        const type = document.getElementById('rem-type').value;
        const date = document.getElementById('rem-datetime').value;
        
        if (window.ReminderManager && title && date) {
          window.ReminderManager.addReminder(title, type, date);
          document.getElementById('add-reminder-modal').classList.remove('active');
          document.getElementById('rem-title').value = '';
          document.getElementById('rem-datetime').value = '';
        }
      });
    }

    const editCountdownBtn = document.getElementById("edit-countdown-btn");
    const saveCountdownBtn = document.getElementById("save-countdown-btn");
    if (editCountdownBtn) editCountdownBtn.addEventListener("click", () => this.toggleCountdownEdit());
    if (saveCountdownBtn) saveCountdownBtn.addEventListener("click", () => this.saveCountdownDate());

    // Semester Wizard Modal Elements
    const branchSelect = document.getElementById("semester-branch-select");
    const methodSelect = document.getElementById("semester-setup-method");
    const numGroup = document.getElementById("semester-number-group");
    const customGroup = document.getElementById("semester-custom-input-group");
    
    function updateSemesterModalFields() {
      if (!branchSelect || !methodSelect) return;
      const branch = branchSelect.value;
      
      if (branch === "custom") {
        methodSelect.value = "custom";
        if (methodSelect.options[0]) methodSelect.options[0].disabled = true;
      } else {
        if (methodSelect.options[0]) methodSelect.options[0].disabled = false;
      }
      
      const currentMethod = methodSelect.value;
      if (currentMethod === "custom") {
        if (numGroup) numGroup.classList.add("hidden");
        if (customGroup) customGroup.classList.remove("hidden");
      } else {
        if (numGroup) numGroup.classList.remove("hidden");
        if (customGroup) customGroup.classList.add("hidden");
      }
    }
    
    if (branchSelect) branchSelect.addEventListener("change", updateSemesterModalFields);
    if (methodSelect) methodSelect.addEventListener("change", updateSemesterModalFields);

    const configureSemesterBtn = document.getElementById("configure-semester-btn");
    if (configureSemesterBtn) {
      configureSemesterBtn.addEventListener("click", () => {
        const modal = document.getElementById("semester-setup-modal");
        if (modal) {
          if (branchSelect) branchSelect.value = "cse";
          if (methodSelect) {
            methodSelect.value = "standard";
            if (methodSelect.options[0]) methodSelect.options[0].disabled = false;
          }
          const customSubjectsText = document.getElementById("semester-custom-subjects");
          if (customSubjectsText) customSubjectsText.value = "";
          const semesterNumberSelect = document.getElementById("semester-number-select");
          if (semesterNumberSelect) semesterNumberSelect.value = "4";
          
          updateSemesterModalFields();
          modal.classList.add("active");
        }
      });
    }

    const semesterSetupForm = document.getElementById("semester-setup-form");
    if (semesterSetupForm) {
      semesterSetupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const branch = branchSelect ? branchSelect.value : "cse";
        const method = methodSelect ? methodSelect.value : "standard";
        const semesterNum = document.getElementById("semester-number-select") ? document.getElementById("semester-number-select").value : "1";
        
        let parsedSubjects = [];
        
        if (method === "standard") {
          if (branch === "custom") {
            alert("Please enter custom subjects or select a standard department.");
            return;
          }
          const presetData = SEMESTER_DEPARTMENTS[branch];
          if (presetData && presetData.semesters && presetData.semesters[semesterNum]) {
            parsedSubjects = JSON.parse(JSON.stringify(presetData.semesters[semesterNum]));
          } else {
            alert("No preset curriculum found for the selected department and semester.");
            return;
          }
        } else {
          const customText = document.getElementById("semester-custom-subjects") ? document.getElementById("semester-custom-subjects").value : "";
          const subjectNames = customText.split(",")
            .map(s => s.trim())
            .filter(s => s.length > 0);
            
          if (subjectNames.length === 0) {
            alert("Please enter at least one subject!");
            return;
          }
          
          parsedSubjects = subjectNames.map(name => ({
            name: name,
            topics: [
              { name: "Easy Topic", difficulty: "Easy", completed: false },
              { name: "Medium Topic", difficulty: "Medium", completed: false },
              { name: "Hard Topic", difficulty: "Hard", completed: false }
            ]
          }));
        }
        
        // Save the new syllabus
        const newSyllabus = {
          name: "Semester Exams (Engineering)",
          subjects: parsedSubjects
        };
        StorageManager.save("syllabus_semester", newSyllabus);
        
        // Reload Syllabus
        if (window.SyllabusManager) {
          window.SyllabusManager.loadCurrentSyllabus();
          window.SyllabusManager.renderSyllabusTracker();
        }
        
        // Clear old dashboard targets
        this.dashboardTargets = [];
        
        // Trigger plan regeneration
        if (window.PlannerManager) {
          window.PlannerManager.generateAIPlan();
        }
        
        // Redirect to Planner View by programmatically clicking sidebar menu item
        const plannerLink = document.querySelector('.sidebar-menu a[data-view="planner"]');
        if (plannerLink) {
          plannerLink.click();
        }
        
        // Close modal
        const modal = document.getElementById("semester-setup-modal");
        if (modal) modal.classList.remove("active");
        
        if (window.ReminderManager) {
          window.ReminderManager.showToast("Semester Configured!", "Syllabus updated and AI schedule regenerated.", "success");
        }
      });
    }
  },

  setupViewNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const pages = document.querySelectorAll('.page-container');
    const headerTitle = document.getElementById('header-page-title');

    menuItems.forEach(item => {
      const link = item.querySelector('a');
      const view = link.getAttribute('data-view');

      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Hide all pages & Show active page
        pages.forEach(p => p.classList.remove('active'));
        const activePage = document.getElementById(`${view}-page`);
        if (activePage) activePage.classList.add('active');

        // Update header page title
        if (headerTitle) {
          const names = {
            "dashboard": "Overview Dashboard",
            "planner": "Study Planner & AI Schedule",
            "syllabus": "Syllabus Progress Tracker",
            "papers": "Previous Year Papers",
            "analytics": "Study Analytics & Metrics",
            "examspace": "Simulated Exam Space",
            "chatbot": "AI Doubt Solver",
            "settings": "Planner Settings"
          };
          headerTitle.textContent = names[view] || "AI Study Planner";
        }

        this.activeView = view;

        // Perform custom page-load actions
        if (view === 'analytics' && window.AnalyticsManager) {
          window.AnalyticsManager.renderCharts();
        }
        if (view === 'notes' && window.NotesManager) {
          window.NotesManager.populateSubjectFilters();
          window.NotesManager.renderNotesList();
        }
        if (view === 'planner' && window.PlannerManager) {
          window.PlannerManager.renderSchedule();
        }
        if (view === 'settings') {
          this.populateSettingsValues();
        }
        if (view === 'examspace' && window.ExamSpaceManager) {
          window.ExamSpaceManager.loadExamSpace();
        }
        if (view === 'chatbot' && window.ChatbotManager) {
          window.ChatbotManager.loadChatbot();
        }
      });
    });
  },

  switchExam(examKey) {
    this.activeExam = examKey;
    StorageManager.save("active_exam", examKey);

    // Refresh database loads
    if (window.SyllabusManager) window.SyllabusManager.loadCurrentSyllabus();
    if (window.PlannerManager) window.PlannerManager.loadPlan();
    if (window.NotesManager) window.NotesManager.loadNotes();
    if (window.PapersManager) window.PapersManager.loadPapers();
    if (window.AnalyticsManager) window.AnalyticsManager.loadLogs();
    if (window.ExamSpaceManager) {
      window.ExamSpaceManager.loadHistory();
      window.ExamSpaceManager.renderConfigurator();
    }
    if (window.ChatbotManager) {
      window.ChatbotManager.loadHistory();
    }

    // Reset countdowns
    this.initCountdown();

    // Rebuild visual interfaces
    if (window.SyllabusManager) window.SyllabusManager.renderSyllabusTracker();
    if (window.PlannerManager) window.PlannerManager.renderSchedule();
    if (window.NotesManager) window.NotesManager.renderNotesList();
    if (window.PapersManager) window.PapersManager.renderPapers();

    this.updateDashboardWidgets();
    this.rotateMotivationalQuote();
    this.renderAITips();

    // Toggle Semester config button
    const configBtn = document.getElementById("configure-semester-btn");
    if (configBtn) {
      configBtn.style.display = (examKey === 'semester') ? 'inline-flex' : 'none';
    }

    // Sync header dropdown value
    const examSelect = document.getElementById('header-exam-selector');
    if (examSelect) examSelect.value = examKey;

    if (window.ReminderManager) {
      const examName = EXAM_PRESETS[examKey] ? EXAM_PRESETS[examKey].name : "Custom";
      window.ReminderManager.showToast("Exam Switched", `Loaded data for ${examName}.`, "success");
    }
  },

  toggleTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlEl.setAttribute('data-theme', newTheme);
    StorageManager.save("theme", newTheme);
    
    this.updateThemeUI();

    // Redraw charts with correct styling guidelines
    if (window.AnalyticsManager) {
      window.AnalyticsManager.renderCharts();
    }
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Theme Changed", `Switched to ${newTheme} mode.`, "info");
    }
  },

  updateThemeUI() {
    const htmlEl = document.documentElement;
    let theme = StorageManager.load("theme");
    
    // Check system preference if no theme saved
    if (!theme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    htmlEl.setAttribute('data-theme', theme);
    
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeIcon.style.color = '#fbbf24';
      } else {
        themeIcon.className = 'fas fa-moon';
        themeIcon.style.color = '#475569';
      }
    }
  },

  initCountdown() {
    clearInterval(this.countdownInterval);
    const widget = document.getElementById('countdown-timer-widget');
    const examNameDisplay = document.getElementById('countdown-exam-name');

    if (!widget) return;

    const examPreset = EXAM_PRESETS[this.activeExam];
    if (examNameDisplay) {
      examNameDisplay.textContent = examPreset ? examPreset.name.split(' (')[0] : "Custom Exam";
    }

    const updateTimer = () => {
      const targetStr = this.examDates[this.activeExam];
      
      if (!targetStr) {
        widget.innerHTML = `
          <div style="text-align:center; padding:10px;">
            <p style="color:var(--text-muted); font-size:13px; margin-bottom:8px;">Exam date is not set.</p>
            <button onclick="AppManager.toggleCountdownEdit()" class="btn btn-primary" style="padding:6px 12px; font-size:11px; display:inline-flex; align-items:center; gap:6px;">
              <i class="fas fa-calendar-plus"></i> Set Exam Date
            </button>
          </div>
        `;
        return;
      }

      const target = new Date(targetStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        widget.innerHTML = `<p style="color:var(--accent-success); font-weight:700; font-size:18px; padding:10px;">EXAM DAY IS HERE! 🎯</p>`;
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      widget.innerHTML = `
        <div class="countdown-digits">
          <div class="countdown-block"><span class="countdown-val">${days}</span><span class="countdown-label">Days</span></div>
          <div class="countdown-block"><span class="countdown-val">${String(hours).padStart(2, '0')}</span><span class="countdown-label">Hrs</span></div>
          <div class="countdown-block"><span class="countdown-val">${String(minutes).padStart(2, '0')}</span><span class="countdown-label">Min</span></div>
          <div class="countdown-block"><span class="countdown-val">${String(seconds).padStart(2, '0')}</span><span class="countdown-label">Sec</span></div>
        </div>
      `;
    };

    updateTimer();
    this.countdownInterval = setInterval(updateTimer, 1000);
  },

  toggleCountdownEdit() {
    const editContainer = document.getElementById("countdown-edit-container");
    const inlineDateInput = document.getElementById("inline-exam-date");
    if (!editContainer) return;
    const isHidden = editContainer.style.display === "none";
    if (isHidden) {
      editContainer.style.display = "block";
      if (inlineDateInput) inlineDateInput.value = (this.examDates[this.activeExam] || "").substring(0, 16);
    } else {
      editContainer.style.display = "none";
    }
  },

  saveCountdownDate() {
    const inlineDateInput = document.getElementById("inline-exam-date");
    const editContainer = document.getElementById("countdown-edit-container");
    if (!inlineDateInput) return;
    const dateVal = inlineDateInput.value;
    if (!dateVal) { alert("Please select a valid date!"); return; }
    this.examDates[this.activeExam] = dateVal;
    StorageManager.save(`exam_date_${this.activeExam}`, dateVal);
    if (editContainer) editContainer.style.display = "none";
    this.initCountdown();
    if (window.ReminderManager) window.ReminderManager.showToast("Exam Date Saved", "Countdown timer has been updated.", "success");
    const settingsDateInput = document.getElementById("settings-exam-date");
    if (settingsDateInput) settingsDateInput.value = dateVal;
  },

  rotateMotivationalQuote() {
    const el = document.getElementById('motivational-quote-text');
    if (!el) return;
    
    const idx = Math.floor(Math.random() * DEFAULT_MOTIVATIONAL_QUOTES.length);
    el.textContent = DEFAULT_MOTIVATIONAL_QUOTES[idx];
  },

  renderAITips() {
    const container = document.getElementById('ai-tips-container');
    if (!container) return;

    // Pick 2 random tips
    const shuffled = [...DEFAULT_STUDY_TIPS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    container.innerHTML = selected.map(tip => `
      <div class="target-item" style="display:block; padding:14px; background:rgba(99,102,241, 0.05); border-left: 3px solid var(--accent-primary);">
        <h4 style="font-size:13.5px; color:var(--accent-primary); margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-lightbulb"></i> ${tip.title}
        </h4>
        <p style="font-size:11.5px; margin:0; line-height:1.5;">${tip.text}</p>
      </div>
    `).join('');
  },

  updateDashboardWidgets() {
    // 1. Syllabus Completion
    const syllabusPercentText = document.getElementById('dash-syllabus-percent');
    const syllabusPercentText2 = document.getElementById('dash-syllabus-percent-2');
    const syllabusProgressBar = document.getElementById('dash-syllabus-progress-bar');
    
    if (window.SyllabusManager) {
      const metrics = window.SyllabusManager.getMetrics();
      if (syllabusPercentText) syllabusPercentText.textContent = `${metrics.overallPercentage}%`;
      if (syllabusPercentText2) syllabusPercentText2.textContent = `${metrics.overallPercentage}%`;
      if (syllabusProgressBar) syllabusProgressBar.style.width = `${metrics.overallPercentage}%`;
      
      const compLabel = document.getElementById('dash-completed-topics-label');
      if (compLabel) compLabel.textContent = `${metrics.completedTopics}/${metrics.totalTopics} Topics Completed`;
    }

    // 2. Study Hours & Streak
    const hoursText = document.getElementById('dash-study-hours');
    const hoursText2 = document.getElementById('dash-study-hours-2');
    const streakText = document.getElementById('dash-study-streak');
    const streakText2 = document.getElementById('dash-study-streak-2');
    
    if (window.AnalyticsManager) {
      const hoursVal = `${window.AnalyticsManager.getTotalStudyHours()}h`;
      const streakVal = `${window.AnalyticsManager.getStreak()} Days`;
      
      if (hoursText) hoursText.textContent = hoursVal;
      if (hoursText2) hoursText2.textContent = hoursVal;
      if (streakText) streakText.textContent = streakVal;
      if (streakText2) streakText2.textContent = streakVal;
    }

    // 3. Mock Test count
    const mockCountText = document.getElementById('dash-mock-tests-count');
    if (mockCountText) {
      let completedCount = 0;
      if (window.ExamSpaceManager && window.ExamSpaceManager.history) {
        completedCount = window.ExamSpaceManager.history.length;
      } else {
        const user = window.UserManager.getCurrentUser();
        if (user) {
          const hist = StorageManager.load(`examspace_history_${user.email}_${this.activeExam}`, []);
          completedCount = hist.length;
        }
      }
      const scheduledCount = window.ReminderManager ? window.ReminderManager.remindersList.filter(r => r.type === 'mock').length : 0;
      mockCountText.innerHTML = `<span style="font-weight: 700; color: var(--accent-success);">${completedCount} Done</span> <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">(${scheduledCount} Scheduled)</span>`;
    }

    // 4. Today's Targets
    this.renderTodayTargets();
  },

  renderTodayTargets() {
    const list = document.getElementById('today-targets-list');
    if (!list) return;

    if (!window.PlannerManager || !window.PlannerManager.currentPlan) {
      list.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 15px 0;">
          No active study targets. Generate an AI Study Plan first!
        </p>
      `;
      return;
    }

    // Fetch targets from planner
    if (this.dashboardTargets.length === 0) {
      this.dashboardTargets = window.PlannerManager.getTodayTargets();
    }

    if (this.dashboardTargets.length === 0) {
      list.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 15px 0;">
          🎉 All study blocks complete for today! Take a well-deserved rest.
        </p>
      `;
      return;
    }

    list.innerHTML = this.dashboardTargets.map((target, idx) => {
      const diffClass = target.difficulty === 'Hard' ? 'diff-hard' : target.difficulty === 'Medium' ? 'diff-medium' : 'diff-easy';
      
      return `
        <div class="target-item">
          <div class="target-left">
            <input type="checkbox" id="dash_t_${target.id}" ${target.completed ? 'checked' : ''} 
              onchange="AppManager.toggleDashboardTarget('${target.id}')">
            <div class="target-details">
              <h4 class="${target.completed ? 'target-completed' : ''}">${target.topic}</h4>
              <span>${target.subject}</span>
            </div>
          </div>
          <span class="target-difficulty ${diffClass}">${target.difficulty}</span>
        </div>
      `;
    }).join('');
  },

  toggleDashboardTarget(id) {
    const target = this.dashboardTargets.find(t => t.id === id);
    if (!target) return;

    target.completed = !target.completed;
    
    if (target.completed) {
      // Simulate study time log: 50 minutes completed
      if (window.AnalyticsManager) {
        window.AnalyticsManager.logStudySession(50);
      }
      
      if (window.ReminderManager) {
        window.ReminderManager.showToast(
          "Target Checked! 🎯", 
          `Good job! We logged 50 mins of study time for "${target.topic}".`, 
          "success"
        );
      }
    } else {
      // Deduct study log for simulation correctness
      if (window.AnalyticsManager) {
        window.AnalyticsManager.logStudySession(-50);
      }
      
      if (window.ReminderManager) {
        window.ReminderManager.showToast(
          "Target Incomplete", 
          `Session removed for "${target.topic}".`, 
          "info"
        );
      }
    }

    this.updateDashboardWidgets();
  },

  // Settings Logic
  populateSettingsValues() {
    const hoursInput = document.getElementById('settings-study-hours');
    const audioCheckbox = document.getElementById('settings-audio-alerts');
    const examDateInput = document.getElementById('settings-exam-date');
    const activeExam = document.getElementById('settings-active-exam');

    if (hoursInput && window.PlannerManager && window.PlannerManager.currentPlan) {
      hoursInput.value = window.PlannerManager.currentPlan.dailyHours;
    }
    
    if (audioCheckbox) {
      audioCheckbox.checked = StorageManager.load("audio_alerts_enabled", true);
      audioCheckbox.addEventListener('change', (e) => {
        StorageManager.save("audio_alerts_enabled", e.target.checked);
      });
    }

    if (activeExam) {
      activeExam.value = this.activeExam;
    }

    if (examDateInput) {
      const dateStr = this.examDates[this.activeExam];
      if (dateStr) {
        examDateInput.value = dateStr.substring(0, 16);
      } else {
        examDateInput.value = '';
      }
    }
  },

  saveSettings() {
    const hoursInput = document.getElementById('settings-study-hours');
    const examDateInput = document.getElementById('settings-exam-date');
    const activeExamSelect = document.getElementById('settings-active-exam');

    // 1. Check if exam selection changed
    if (activeExamSelect && activeExamSelect.value !== this.activeExam) {
      this.switchExam(activeExamSelect.value);
    }

    // 2. Daily hours preference
    if (hoursInput && window.PlannerManager) {
      const hoursVal = parseInt(hoursInput.value);
      if (window.PlannerManager.currentPlan) {
        window.PlannerManager.currentPlan.dailyHours = hoursVal;
        window.PlannerManager.savePlan();
      }
      
      const plannerHoursInput = document.getElementById('daily-study-hours');
      if (plannerHoursInput) plannerHoursInput.value = hoursVal;
    }

    // 3. Exam date countdown
    if (examDateInput && examDateInput.value) {
      const dateVal = examDateInput.value;
      this.examDates[this.activeExam] = dateVal;
      StorageManager.save(`exam_date_${this.activeExam}`, dateVal);
      this.initCountdown();
    }

    if (window.ReminderManager) {
      window.ReminderManager.showToast("Settings Saved", "Your preferences have been updated.", "success");
    }
    
    this.updateDashboardWidgets();
  },

  resetAllData() {
    if (confirm("Are you sure you want to delete all study data, logs, custom subjects, and reset the app? This cannot be undone.")) {
      StorageManager.clear();
      window.location.reload();
    }
  }
};

// Start application when DOM loads
window.addEventListener('DOMContentLoaded', () => {
  AppManager.init();
  window.AppManager = AppManager;
});

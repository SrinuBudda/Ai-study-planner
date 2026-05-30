// AI Study Planner Client-Side REST API Wrapper

const ApiClient = {
  BASE_URL: window.location.origin,
  isActive: false,
  currentUser: null,

  async init() {
    this.currentUser = StorageManager.load("current_user", null);
    await this.pingServer();
  },

  async pingServer() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const res = await fetch(`${this.BASE_URL}/api/papers`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isActive = true;
        console.log("🌐 Connected to AI Study Planner MySQL API backend!");
        
        // If logged in, perform a background synchronization
        if (this.currentUser) {
          await this.syncAllFromBackend();
        }
      }
    } catch (e) {
      this.isActive = false;
      console.warn("⚠️ API backend server not detected. Gracefully falling back to browser localStorage mode.");
    }
  },

  // Synchronize all study metrics from MySQL down to localStorage cache
  async syncAllFromBackend() {
    if (!this.isActive || !this.currentUser) return;
    try {
      console.log("🔄 Synchronizing all study profiles from MySQL...");
      
      // 1. Fetch Exam Dates
      const dates = await this.getExamDates();
      Object.keys(dates).forEach(exam => {
        localStorage.setItem(`ai_study_planner_exam_date_${exam}`, JSON.stringify(dates[exam]));
      });

      // 2. Fetch Syllabus, Plans, Notes & Chats for each exam preset
      const exams = ["jee", "neet", "gate", "upsc", "cds", "nda", "tgc", "lawyer", "govt_eng", "semester", "placement", "ssc", "bank", "custom"];
      for (const exam of exams) {
        // Fetch Syllabus
        const syllabus = await this.getSyllabus(exam);
        if (syllabus) {
          localStorage.setItem(`ai_study_planner_syllabus_${exam}`, JSON.stringify(syllabus));
        }

        // Fetch Plan
        const plan = await this.getStudyPlan(exam);
        if (plan) {
          localStorage.setItem(`ai_study_planner_plan_${exam}`, JSON.stringify(plan));
        }

        // Fetch Notes
        const notes = await this.getNotes(exam);
        if (notes && Object.keys(notes).length > 0) {
          localStorage.setItem(`ai_study_planner_notes_${exam}`, JSON.stringify(notes));
        }

        // Fetch Chat History
        const chatLogs = await this.getChatHistory(exam);
        if (chatLogs && chatLogs.length > 0) {
          localStorage.setItem(`ai_study_planner_chatbot_history_${this.currentUser.email}_${exam}`, JSON.stringify(chatLogs));
        }
      }

      // 3. Fetch Papers list
      const papers = await this.getPapers();
      if (papers && papers.length > 0) {
        localStorage.setItem("ai_study_planner_papers", JSON.stringify(papers));
      }

      console.log("✅ MySQL Database synchronization complete!");
    } catch (e) {
      console.error("MySQL Sync Error: ", e);
    }
  },

  // 1. User Authentications
  async register(name, email, password) {
    try {
      const res = await fetch(`${this.BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network connection error: Failed to reach registration API." };
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${this.BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
      }
      return data;
    } catch (e) {
      return { success: false, message: "Network connection error: Failed to reach authentication API." };
    }
  },

  // 2. Exam Date Deadlines
  async getExamDates() {
    if (!this.currentUser) return {};
    try {
      const res = await fetch(`${this.BASE_URL}/api/exam-dates?userId=${this.currentUser.id}`);
      return await res.json();
    } catch (e) {
      console.error("API error fetching exam dates:", e);
      return {};
    }
  },

  async saveExamDate(examKey, examDate) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/exam-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.currentUser.id, examKey, examDate })
      });
    } catch (e) {
      console.error("API error saving exam date:", e);
    }
  },

  // 3. Syllabus Checklists
  async getSyllabus(examKey) {
    if (!this.currentUser) return null;
    try {
      const res = await fetch(`${this.BASE_URL}/api/syllabus/${examKey}?userId=${this.currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        return data.subjects && data.subjects.length > 0 ? data : null;
      }
      return null;
    } catch (e) {
      console.error("API error fetching syllabus:", e);
      return null;
    }
  },

  async saveSyllabus(examKey, syllabusData) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/syllabus/${examKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.currentUser.id,
          subjects: syllabusData.subjects || []
        })
      });
    } catch (e) {
      console.error("API error syncing syllabus:", e);
    }
  },

  // 4. Study Timetables
  async getStudyPlan(examKey) {
    if (!this.currentUser) return null;
    try {
      const res = await fetch(`${this.BASE_URL}/api/planner/${examKey}?userId=${this.currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data : null;
      }
      return null;
    } catch (e) {
      console.error("API error fetching plan:", e);
      return null;
    }
  },

  async saveStudyPlan(examKey, planBlocks) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/planner/${examKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.currentUser.id, planBlocks })
      });
    } catch (e) {
      console.error("API error syncing study plan:", e);
    }
  },

  // 5. Notes Editor
  async getNotes(examKey) {
    if (!this.currentUser) return {};
    try {
      const res = await fetch(`${this.BASE_URL}/api/notes/${examKey}?userId=${this.currentUser.id}`);
      return await res.json();
    } catch (e) {
      console.error("API error fetching notes:", e);
      return {};
    }
  },

  async saveNote(examKey, subject, content) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/notes/${examKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.currentUser.id, subject, content })
      });
    } catch (e) {
      console.error("API error syncing note:", e);
    }
  },

  // 6. Chatbot Assistant logs
  async getChatHistory(examKey) {
    if (!this.currentUser) return [];
    try {
      const res = await fetch(`${this.BASE_URL}/api/chatbot/${examKey}?userId=${this.currentUser.id}`);
      return await res.json();
    } catch (e) {
      console.error("API error fetching chatbot logs:", e);
      return [];
    }
  },

  async saveChatMessage(examKey, sender, text) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/chatbot/${examKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.currentUser.id, sender, text })
      });
    } catch (e) {
      console.error("API error logging chat statement:", e);
    }
  },

  async deleteChatHistory(examKey) {
    if (!this.currentUser) return;
    try {
      await fetch(`${this.BASE_URL}/api/chatbot/${examKey}?userId=${this.currentUser.id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error("API error clearing chat history logs:", e);
    }
  },

  // 7. Question Papers list and download counts
  async getPapers() {
    try {
      const res = await fetch(`${this.BASE_URL}/api/papers`);
      return await res.json();
    } catch (e) {
      console.error("API error fetching papers list:", e);
      return [];
    }
  },

  async incrementDownloads(paperId) {
    try {
      await fetch(`${this.BASE_URL}/api/papers/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId })
      });
    } catch (e) {
      console.error("API error updating paper downloads:", e);
    }
  }
};

window.ApiClient = ApiClient;
// Execute API initialization block
ApiClient.init();

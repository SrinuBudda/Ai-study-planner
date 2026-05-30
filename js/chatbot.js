// AI Study Planner - AI Doubt Solver Chatbot Module

const ChatbotManager = {
  chatLogs: [],
  isLoading: false,
  fallbackWarningShown: false,
  offlineWarningShown: false,

  init() {
    this.setupListeners();
    this.loadHistory();
  },

  setupListeners() {
    const form = document.getElementById("chatbot-input-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    const clearBtn = document.getElementById("chatbot-clear-history-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear this conversation?")) {
          this.clearHistory();
        }
      });
    }

    // Textarea auto-expansion & keydown submission
    const input = document.getElementById("chatbot-user-input");
    if (input) {
      input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit();
        }
      });
    }
  },

  loadChatbot() {
    this.loadHistory();
    this.scrollToBottom();
  },

  loadHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    this.chatLogs = StorageManager.load(`chatbot_history_${user.email}_${activeExam}`, [
      {
        sender: "assistant",
        text: `Hello! I am your AI Study Assistant. I can clarify doubts, explain topics in your ${activeExam.toUpperCase()} syllabus, or write custom practice questions. What are you studying today?`,
        timestamp: Date.now()
      }
    ]);

    this.renderMessages();
    this.renderSidebarHistory();
  },

  saveHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    StorageManager.save(`chatbot_history_${user.email}_${activeExam}`, this.chatLogs);
    this.renderSidebarHistory();
  },

  clearHistory() {
    const user = window.UserManager.getCurrentUser();
    if (!user) return;

    const activeExam = window.AppManager.activeExam;
    this.chatLogs = [
      {
        sender: "assistant",
        text: `Hello! I am your AI Study Assistant. I can clarify doubts, explain topics in your ${activeExam.toUpperCase()} syllabus, or write custom practice questions. What are you studying today?`,
        timestamp: Date.now()
      }
    ];
    this.saveHistory();
    this.renderMessages();

    // Mirror clearing back to MySQL
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.deleteChatHistory(activeExam);
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  },

  renderMessages() {
    const container = document.getElementById("chatbot-messages-container");
    if (!container) return;

    container.innerHTML = this.chatLogs.map(msg => `
      <div class="chat-message ${msg.sender}">
        <div class="chat-avatar">
          <i class="fas ${msg.sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="chat-message-content">
          <div class="chat-bubble">
            <p>${msg.text.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="chat-timestamp">${this.formatTime(msg.timestamp)}</div>
        </div>
      </div>
    `).join('');

    this.scrollToBottom();
  },

  renderSidebarHistory() {
    const list = document.getElementById("chatbot-history-list");
    if (!list) return;

    // Filter user questions for recent chats list
    const questions = this.chatLogs
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .reverse()
      .slice(0, 10);

    if (questions.length === 0) {
      list.innerHTML = `
        <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:15px 5px;">
          <p>No recent questions. Ask anything below!</p>
        </div>
      `;
      return;
    }

    // Keep unique list
    const uniqueQuestions = [...new Set(questions)];
    list.innerHTML = uniqueQuestions.map(q => `
      <div class="recent-chat-item" onclick="ChatbotManager.sendQuickTag('${q.replace(/'/g, "\\'")}')" title="${q}">
        <i class="fas fa-comment-dots" style="margin-right:6px; opacity:0.6;"></i>${q}
      </div>
    `).join('');
  },

  scrollToBottom() {
    const container = document.getElementById("chatbot-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  sendQuickTag(tagText) {
    const input = document.getElementById("chatbot-user-input");
    if (input) {
      input.value = tagText;
      input.style.height = "auto";
      this.handleUserSubmit();
    }
  },

  async handleUserSubmit() {
    if (this.isLoading) return;

    const input = document.getElementById("chatbot-user-input");
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = "";
    input.style.height = "auto"; // Reset height on submit

    const activeExam = window.AppManager.activeExam;

    // Append User Message
    this.chatLogs.push({
      sender: "user",
      text: text,
      timestamp: Date.now()
    });
    this.renderMessages();
    this.saveHistory();

    // Sync user message to MySQL
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.saveChatMessage(activeExam, "user", text);
    }

    // Show Typing Indicator
    this.showTypingIndicator();

    let response = "";
    let useFallback = true;

    try {
      if (window.ApiClient && window.ApiClient.isActive) {
        const result = await window.ApiClient.askAI(this.chatLogs);
        if (result && result.success) {
          if (result.isFallback) {
            if (!this.fallbackWarningShown) {
              window.ReminderManager.showToast(
                "Offline Mode",
                "Gemini API key is not configured. Running offline fallback.",
                "warning"
              );
              this.fallbackWarningShown = true;
            }
          } else {
            response = result.text;
            useFallback = false;
          }
        }
      }
    } catch (err) {
      console.warn("Error querying Gemini API. Using local fallback:", err);
    }

    if (useFallback) {
      response = this.generateResponse(text);
      if (!window.ApiClient || !window.ApiClient.isActive) {
        if (!this.offlineWarningShown) {
          window.ReminderManager.showToast(
            "Connection Lost",
            "Unable to reach the server. Running offline fallback.",
            "warning"
          );
          this.offlineWarningShown = true;
        }
      }
    }

    this.removeTypingIndicator();

    this.chatLogs.push({
      sender: "assistant",
      text: response,
      timestamp: Date.now()
    });
    this.renderMessages();
    this.saveHistory();

    // Sync assistant response to MySQL
    if (window.ApiClient && window.ApiClient.isActive) {
      window.ApiClient.saveChatMessage(activeExam, "assistant", response);
    }
  },

  showTypingIndicator() {
    this.isLoading = true;
    const container = document.getElementById("chatbot-messages-container");
    if (!container) return;

    const indicatorHTML = `
      <div class="chat-message assistant" id="chatbot-typing-bubble">
        <div class="chat-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-message-content">
          <div class="chat-bubble">
            <div class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', indicatorHTML);
    this.scrollToBottom();
  },

  removeTypingIndicator() {
    this.isLoading = false;
    const el = document.getElementById("chatbot-typing-bubble");
    if (el) el.remove();
  },

  generateResponse(query) {
    const qLower = query.toLowerCase();
    const activeExam = window.AppManager.activeExam;

    // Help & Welcome Command
    if (qLower.includes("hello") || qLower.includes("hi ") || qLower.includes("hey") || qLower.includes("help")) {
      return `Hello! I am your AI Study Coordinator. I can clarify educational doubts, summarize syllabus topics, or generate practice questions based on your current preparation level.
Try typing queries like:
- "Explain the Feynman Technique"
- "Explain Strict Liability"
- "Practice question for Calculus"
- "Study tips for GATE"`;
    }

    // Feynman Technique
    if (qLower.includes("feynman")) {
      return `The Feynman Technique is a mental model designed for rapid learning and long-term concept retention:

1. **Choose a Concept**: Select the topic you want to study.
2. **Teach it to a Child**: Explain the concept in simple, plain language as if speaking to an 8-year-old. Avoid academic jargon.
3. **Identify Gaps**: When you struggle to explain a section simply, return to your books/notes to fill the gaps in your knowledge.
4. **Simplify and Analogize**: Refine your explanation and create simple analogies to link it to everyday ideas.

Using this technique immediately exposes gaps in your comprehension and helps commit topics to memory.`;
    }

    // Spaced Repetition
    if (qLower.includes("spaced repetition") || qLower.includes("repetition")) {
      return `Spaced Repetition is a highly efficient technique of reviewing information at increasing intervals to combat the "forgetting curve":

- **Interval 1**: Review the topic 24 hours after learning.
- **Interval 2**: Review again after 3 days.
- **Interval 3**: Review again after 7 days.
- **Interval 4**: Review again after 16 days.
- **Interval 5**: Review again after 35 days.

By using spaced reviews (instead of cramming), you force your brain to retrieve the neural pathways just as they are about to fade, cementing the concepts permanently into your long-term memory.`;
    }

    // Study Tips / Advice
    if (qLower.includes("study tip") || qLower.includes("advice") || qLower.includes("tips")) {
      return `Here are three premium study tips tailored for your preparation:

1. **Prioritize Weak Subjects First**: Your cognitive load is freshest at the start of your study block. Tackle complex, hard syllabus topics early in the day, saving light tasks for when you are tired.
2. **Interleaving**: Mix up your subjects instead of studying one single topic all day. Study Physics for 2 hours, then rotate to Maths. This builds stronger neural connections.
3. **Active Recall**: Don't just reread notes. Close the notes and try to write down everything you remember, or quiz yourself using the simulated Exam Space.`;
    }

    // Practice Question Trigger
    if (qLower.includes("practice question") || qLower.includes("quiz") || qLower.includes("test me")) {
      return this.getRandomPracticeQuestion(activeExam);
    }

    // Subject/Topic Clarification Queries
    // 1. Torts & Law
    if (qLower.includes("tort") || qLower.includes("negligence") || qLower.includes("liability") || qLower.includes("legal")) {
      return `### Topic Explanation: Law of Torts & Strict Liability
Under the Law of Torts, a tort is a civil wrong that causes a claimant to suffer loss or harm, resulting in legal liability for the person who commits the tortious act.
Key Concept: **Strict Liability**
Strict Liability is a standard of liability which exists where a person is legally responsible for the consequences of an activity, regardless of fault, negligence, or bad intent. It was established in the landmark case *Rylands v. Fletcher (1868)*.

**Quick Practice Question:**
Under the rule in *Rylands v. Fletcher*, strict liability is imposed when:
(A) A person brings something non-natural onto their land which escapes and causes damage.
(B) A person acts with direct criminal negligence.
(C) An agreement is signed under duress.
(D) Damages occur due to an unavoidable Act of God.
*Answer: (A)*`;
    }

    // 2. Polity & Constitution
    if (qLower.includes("polity") || qLower.includes("constitution") || qLower.includes("fundamental rights") || qLower.includes("basic structure")) {
      return `### Topic Explanation: Indian Constitution & Basic Structure Doctrine
The Constitution of India is the supreme law of the land. A key constitutional principle is the **Basic Structure Doctrine**, which was established in the landmark Supreme Court judgment *Kesavananda Bharati v. State of Kerala (1973)*.
Key Principle:
The doctrine rules that while Parliament has the power to amend the Constitution under Article 368, it cannot alter or destroy its "basic structure" or essential features, such as democracy, secularism, federalism, and the independence of the judiciary.

**Quick Practice Question:**
Which Article of the Constitution of India provides the power to amend the constitution?
(A) Article 356
(B) Article 368
(C) Article 370
(D) Article 320
*Answer: (B)*`;
    }

    // 3. Mechanics & Projectile Motion
    if (qLower.includes("mechanics") || qLower.includes("kinematics") || qLower.includes("motion") || qLower.includes("physics")) {
      return `### Topic Explanation: Kinematics & Projectile Motion
In Physics, kinematics describes the motion of points, bodies, and systems of bodies without considering the forces that cause them to move.
Key Kinematic Equations (for uniform acceleration *a*):
1. v = u + at
2. s = ut + (1/2)at²
3. v² = u² + 2as

**Quick Practice Question:**
A car accelerates uniformly from rest at a rate of 4 m/s². What is its velocity after traveling a distance of 50 meters?
(A) 10 m/s
(B) 20 m/s
(C) 30 m/s
(D) 40 m/s
*Answer: (B) (v² = 0 + 2 * 4 * 50 = 400 => v = 20 m/s)*`;
    }

    // 4. Calculus & Mathematics
    if (qLower.includes("calculus") || qLower.includes("derivative") || qLower.includes("integration") || qLower.includes("math")) {
      return `### Topic Explanation: Calculus (Derivatives & Integrals)
Calculus is the mathematical study of continuous change. It is split into differential calculus (concerning rates of change/slopes) and integral calculus (concerning accumulation of quantities/areas under curves).
Key Derivative Rules:
- Product Rule: d/dx [u * v] = u'v + uv'
- Chain Rule: d/dx [f(g(x))] = f'(g(x)) * g'(x)

**Quick Practice Question:**
What is the derivative of the function f(x) = x * ln(x) with respect to x?
(A) ln(x)
(B) ln(x) + 1
(C) 1
(D) x / ln(x)
*Answer: (B) (Using the product rule: 1 * ln(x) + x * (1/x) = ln(x) + 1)*`;
    }

    // 5. Data Structures & Algorithms
    if (qLower.includes("data structure") || qLower.includes("algorithm") || qLower.includes("bst") || qLower.includes("tree") || qLower.includes("complexity")) {
      return `### Topic Explanation: Data Structures & Search Complexity
A data structure is a collection of data values, relationships, and functions applied to the data. Algorithms process these structures.
Key Metric: **Big O Notation**
Big O describes the worst-case execution time or space complexity of an algorithm in terms of the input size *n*. For example:
- Balanced Binary Search Tree (BST) search: O(log n)
- Linear Search: O(n)
- Sorting (Merge Sort): O(n log n)

**Quick Practice Question:**
What is the worst-case time complexity of searching for a value in a balanced BST containing N elements?
(A) O(1)
(B) O(log N)
(C) O(N)
(D) O(N log N)
*Answer: (B)*`;
    }

    // 6. Circuits & Control Systems
    if (qLower.includes("circuit") || qLower.includes("electrical") || qLower.includes("control system") || qLower.includes("circuits")) {
      return `### Topic Explanation: Circuit Theory & Transfer Functions
In Engineering, circuit theory analyzes voltage, current, and impedance distributions in network loops. Control systems use mathematical models to regulate output parameters.
Key Law: **Kirchhoff's Laws**
- KCL (Current Law): The sum of currents entering a node equals the sum of currents leaving the node.
- KVL (Voltage Law): The sum of potential drops around any closed loop is zero.

**Quick Practice Question:**
The open-loop transfer function of a unity feedback system is G(s) = K / [s(s + 4)]. What is the system type?
(A) Type 0
(B) Type 1
(C) Type 2
(D) Type 3
*Answer: (B) (There is one pole at s = 0, indicating a Type 1 system)*`;
    }

    // 7. Biology & Photosynthesis
    if (qLower.includes("biology") || qLower.includes("cell") || qLower.includes("photosynthesis") || qLower.includes("organelle")) {
      return `### Topic Explanation: Cellular Biology & Energy Synthesis
Biology examines structural and chemical processes inside living cells. Energy synthesis occurs inside specialized membrane-bound organelles.
Key Organelles:
- **Mitochondria**: Organelles bound by a double membrane with circular DNA and 70S ribosomes, responsible for ATP synthesis.
- **Chloroplasts**: Responsible for photosynthesis in plant cells.

**Quick Practice Question:**
Which of the following cell organelles is responsible for cellular respiration and ATP synthesis in eukaryotic cells?
(A) Lysosome
(B) Ribosome
(C) Mitochondria
(D) Golgi Apparatus
*Answer: (C)*`;
    }

    // 8. Military GK & Defense
    if (qLower.includes("military") || qLower.includes("defense") || qLower.includes("defence") || qLower.includes("ranks") || qLower.includes("award")) {
      return `### Topic Explanation: Defence Schemes & Gallantry Awards
India's armed forces (Army, Navy, Air Force) maintain structured officer rank equivalences and valor awards for gallantry.
Key Awards:
- **Peacetime Gallantry Award**: Ashoka Chakra is the highest peacetime decoration.
- **Wartime Gallantry Award**: Param Vir Chakra is the highest decoration awarded during war.

**Quick Practice Question:**
An officer holding the rank of Captain in the Indian Army is equivalent in rank to which of the following in the Indian Air Force?
(A) Flying Officer
(B) Flight Lieutenant
(C) Squadron Leader
(D) Wing Commander
*Answer: (B)*`;
    }

    // 9. English Grammar & Vocabulary
    if (qLower.includes("english") || qLower.includes("grammar") || qLower.includes("vocabulary") || qLower.includes("idiom")) {
      return `### Topic Explanation: Subject-Verb Agreement & Vocabulary
English grammar requires proper agreement between subjects and verbs, particularly when singular/plural subjects are joined by correlatives like *neither... nor*.
Rule: When subjects are joined by *neither... nor*, the verb agrees in number with the subject closest to it.

**Quick Practice Question:**
Fill in the blank: "Neither the teacher nor the students ______ present in the yesterday's session."
(A) was
(B) were
(C) is
(D) are
*Answer: (B) ("students" is closest to the verb and is plural)*`;
    }

    // Syllabus information for active exam
    if (qLower.includes("syllabus") || qLower.includes("exam") || qLower.includes("preset")) {
      const preset = EXAM_PRESETS[activeExam];
      if (preset) {
        const subjectsStr = preset.subjects.map(s => s.name).join(", ");
        return `You are currently preparing for **${preset.name}**.
Your syllabus preset contains subjects: *${subjectsStr}*.
You can check or log completions in the **Syllabus Tracker** tab to help me tailor daily target suggestions.`;
      }
    }

    // Fallback Academic Builder
    return `That is an interesting query! Let me break down this educational concept:
    
- **Core Summary**: We are analyzing your request regarding "${query}". In academic studies, this fits within standard ${activeExam.toUpperCase()} curriculum blocks.
- **Study Tip**: Review similar questions in the **Previous Papers** section. Set a manual test in the **Exam Space** to test yourself.
- **Practice Question**: Let's test a related concept. What represents the primary law of conservation of energy?
  (A) Total energy in an isolated system remains constant.
  (B) Kinetic energy is always greater than potential energy.
  (C) Entropy always decreases in a closed loop.
  *Answer: (A)*
  
Let me know if you would like me to clarify another specific topic!`;
  },

  getRandomPracticeQuestion(examKey) {
    const list = [
      `### Practice Question (Legal Reasoning):
Under the Law of Torts, strict liability is imposed when:
(A) A person brings something non-natural onto their land which escapes and causes damage.
(B) A person acts with direct criminal negligence.
(C) An agreement is signed under duress.
(D) Damages occur due to an unavoidable Act of God.
*Answer: (A)*`,
      `### Practice Question (Calculus):
What is the derivative of the function f(x) = x * ln(x) with respect to x?
(A) ln(x)
(B) ln(x) + 1
(C) 1
(D) x / ln(x)
*Answer: (B)*`,
      `### Practice Question (Physics Mechanics):
A body starting from rest accelerates uniformly at a rate of 4 m/s² for a distance of 50m. Its final velocity is:
(A) 10 m/s
(B) 20 m/s
(C) 30 m/s
(D) 40 m/s
*Answer: (B)*`,
      `### Practice Question (Computer Science):
What is the worst-case time complexity of searching for a value in a balanced BST containing N elements?
(A) O(1)
(B) O(log N)
(C) O(N)
(D) O(N log N)
*Answer: (B)*`
    ];

    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }
};

window.ChatbotManager = ChatbotManager;

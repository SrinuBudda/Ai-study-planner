// AI Study Planner - Syllabus Management Module

const SyllabusManager = {
  currentSyllabus: {},

  init() {
    this.loadCurrentSyllabus();
  },

  // Load syllabus for the currently selected exam
  loadCurrentSyllabus() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    
    // Load from local storage or get from EXAM_PRESETS seeds
    const stored = StorageManager.load(`syllabus_${activeExam}`);
    
    if (stored && stored.subjects) {
      this.currentSyllabus = stored;
    } else {
      // Seed preset exam database structure
      const preset = EXAM_PRESETS[activeExam];
      if (preset) {
        this.currentSyllabus = JSON.parse(JSON.stringify(preset)); // deep copy
        this.saveCurrentSyllabus();
      } else {
        // Fallback for custom
        this.currentSyllabus = {
          name: "Custom Exam",
          subjects: []
        };
      }
    }
  },

  saveCurrentSyllabus() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    StorageManager.save(`syllabus_${activeExam}`, this.currentSyllabus);
    
    // Trigger UI updates across the active dashboard and charts
    if (window.AppManager) {
      window.AppManager.updateDashboardWidgets();
    }
    if (window.AnalyticsManager) {
      window.AnalyticsManager.renderCharts();
    }
  },

  // Add Subject
  addSubject(subjectName) {
    if (!subjectName.trim()) return;
    
    this.currentSyllabus.subjects.push({
      name: subjectName.trim(),
      topics: []
    });
    
    this.saveCurrentSyllabus();
    this.renderSyllabusTracker();
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Subject Added", `"${subjectName}" added successfully.`, "success");
    }
  },

  // Delete Subject
  deleteSubject(subjectIdx) {
    const subName = this.currentSyllabus.subjects[subjectIdx].name;
    this.currentSyllabus.subjects.splice(subjectIdx, 1);
    this.saveCurrentSyllabus();
    this.renderSyllabusTracker();
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Subject Deleted", `"${subName}" has been removed.`, "info");
    }
  },

  // Add Topic to a Subject
  addTopic(subjectIdx, topicName, difficulty) {
    if (!topicName.trim()) return;
    
    this.currentSyllabus.subjects[subjectIdx].topics.push({
      name: topicName.trim(),
      difficulty: difficulty,
      completed: false
    });
    
    this.saveCurrentSyllabus();
    this.renderSyllabusTracker();
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Topic Added", `"${topicName}" added to syllabus.`, "success");
    }
  },

  // Delete Topic from a Subject
  deleteTopic(subjectIdx, topicIdx) {
    const topic = this.currentSyllabus.subjects[subjectIdx].topics[topicIdx];
    this.currentSyllabus.subjects[subjectIdx].topics.splice(topicIdx, 1);
    this.saveCurrentSyllabus();
    this.renderSyllabusTracker();
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Topic Deleted", `"${topic.name}" removed.`, "info");
    }
  },

  // Toggle completed status of a topic
  toggleTopicStatus(subjectIdx, topicIdx) {
    const topic = this.currentSyllabus.subjects[subjectIdx].topics[topicIdx];
    topic.completed = !topic.completed;
    this.saveCurrentSyllabus();
    this.renderSyllabusTracker();
    
    if (window.ReminderManager) {
      if (topic.completed) {
        window.ReminderManager.showToast("Topic Completed! 🎉", `"${topic.name}" marked as done.`, "success");
      } else {
        window.ReminderManager.showToast("Topic Reactivated", `"${topic.name}" marked as incomplete.`, "info");
      }
    }
  },

  // Calculate stats
  getMetrics() {
    let totalTopics = 0;
    let completedTopics = 0;
    const subjectsList = [];

    this.currentSyllabus.subjects.forEach(subject => {
      let subTotal = subject.topics.length;
      let subDone = subject.topics.filter(t => t.completed).length;
      let pct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;
      
      subjectsList.push({
        name: subject.name,
        total: subTotal,
        completed: subDone,
        percentage: pct
      });

      totalTopics += subTotal;
      completedTopics += subDone;
    });

    const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      totalTopics,
      completedTopics,
      overallPercentage: overallPct,
      subjects: subjectsList
    };
  },

  // Get list of uncompleted medium/hard topics (weak subjects) for recommendation
  getWeakOrToughTopics() {
    const weakList = [];
    this.currentSyllabus.subjects.forEach((subject, subIdx) => {
      subject.topics.forEach((topic, topIdx) => {
        if (!topic.completed && (topic.difficulty === 'Hard' || topic.difficulty === 'Medium')) {
          weakList.push({
            subjectName: subject.name,
            subjectIdx: subIdx,
            topicIdx: topIdx,
            name: topic.name,
            difficulty: topic.difficulty
          });
        }
      });
    });
    return weakList;
  },

  // Render the Syllabus Tracker interface panel
  renderSyllabusTracker() {
    const grid = document.getElementById('syllabus-subjects-grid');
    if (!grid) return;

    if (!this.currentSyllabus.subjects || this.currentSyllabus.subjects.length === 0) {
      grid.innerHTML = `
        <div class="glass-card col-12" style="text-align: center; padding: 40px;">
          <i class="fas fa-book-open" style="font-size: 40px; color: var(--accent-primary); margin-bottom: 16px;"></i>
          <h3>No Subjects added yet!</h3>
          <p style="margin-bottom: 20px;">Get started by adding your first study subject for this exam.</p>
          <button onclick="SyllabusManager.showAddSubjectModal()" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Subject
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.currentSyllabus.subjects.map((subject, subIdx) => {
      const subTotal = subject.topics.length;
      const subDone = subject.topics.filter(t => t.completed).length;
      const progressPct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

      const topicsHTML = subject.topics.map((topic, topIdx) => {
        const diffClass = topic.difficulty === 'Hard' ? 'diff-hard' : topic.difficulty === 'Medium' ? 'diff-medium' : 'diff-easy';
        
        return `
          <div class="topic-row">
            <div class="topic-row-left">
              <input type="checkbox" ${topic.completed ? 'checked' : ''} 
                onchange="SyllabusManager.toggleTopicStatus(${subIdx}, ${topIdx})">
              <span class="topic-name ${topic.completed ? 'target-completed' : ''}">${topic.name}</span>
            </div>
            <div class="topic-row-actions">
              <span class="target-difficulty ${diffClass}">${topic.difficulty}</span>
              <button onclick="SyllabusManager.deleteTopic(${subIdx}, ${topIdx})" class="action-icon-btn delete-btn" title="Delete Topic">
                <i class="fas fa-trash-alt" style="font-size:11px;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="glass-card subject-card">
          <div class="subject-card-header">
            <div>
              <h3>${subject.name}</h3>
              <p style="font-size:12px;">${subDone} of ${subTotal} topics completed</p>
            </div>
            <div class="subject-meta">
              <span class="subject-percentage">${progressPct}%</span>
            </div>
          </div>
          
          <div class="subject-topics-list">
            ${topicsHTML || '<p style="color:var(--text-muted); font-size:12.5px; text-align:center; padding: 20px 0;">No topics added.</p>'}
          </div>
          
          <div class="subject-actions">
            <button onclick="SyllabusManager.showAddTopicModal(${subIdx})" class="btn btn-secondary" style="flex:1; font-size:12px; padding: 8px 12px;">
              <i class="fas fa-plus"></i> Add Topic
            </button>
            <button onclick="SyllabusManager.deleteSubject(${subIdx})" class="action-icon-btn delete-btn" title="Delete Subject" style="padding: 10px; border: 1px solid var(--border-solid); border-radius: var(--border-radius-md);">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Modal display controllers
  showAddSubjectModal() {
    const modal = document.getElementById('add-subject-modal');
    if (modal) {
      document.getElementById('new-subject-name').value = '';
      modal.classList.add('active');
    }
  },

  showAddTopicModal(subIdx) {
    const modal = document.getElementById('add-topic-modal');
    if (modal) {
      document.getElementById('topic-subject-idx').value = subIdx;
      document.getElementById('new-topic-name').value = '';
      document.getElementById('new-topic-difficulty').value = 'Medium';
      modal.classList.add('active');
    }
  }
};

window.SyllabusManager = SyllabusManager;

// AI Study Planner - AI Study Plan Generator Module

const PlannerManager = {
  currentPlan: null,
  activeTab: 'weekly', // 'weekly' or 'daily'
  activeDayIndex: 0, // 0 = Mon, 1 = Tue, etc.

  init() {
    this.loadPlan();
    this.setupEventListeners();
  },

  setupEventListeners() {
    const generateBtn = document.getElementById('generate-plan-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateAIPlan());
    }

    // Tab buttons switching
    const weeklyTabBtn = document.getElementById('tab-weekly-btn');
    const dailyTabBtn = document.getElementById('tab-daily-btn');
    
    if (weeklyTabBtn) {
      weeklyTabBtn.addEventListener('click', () => {
        this.activeTab = 'weekly';
        weeklyTabBtn.classList.add('active');
        if (dailyTabBtn) dailyTabBtn.classList.remove('active');
        this.renderSchedule();
      });
    }

    if (dailyTabBtn) {
      dailyTabBtn.addEventListener('click', () => {
        this.activeTab = 'daily';
        dailyTabBtn.classList.add('active');
        if (weeklyTabBtn) weeklyTabBtn.classList.remove('active');
        this.renderSchedule();
      });
    }
  },

  loadPlan() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    this.currentPlan = StorageManager.load(`plan_${activeExam}`, null);
    this.renderSchedule();
  },

  savePlan() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    StorageManager.save(`plan_${activeExam}`, this.currentPlan);
    this.renderSchedule();
  },

  // The "AI Heuristics Core" timetable generator
  generateAIPlan() {
    const hoursInput = document.getElementById('daily-study-hours');
    const prioritizeWeakCheckbox = document.getElementById('prioritize-weak');
    
    const dailyHours = hoursInput ? parseInt(hoursInput.value) : 4;
    const prioritizeWeak = prioritizeWeakCheckbox ? prioritizeWeakCheckbox.checked : true;

    // 1. Gather all topics
    if (!window.SyllabusManager || !window.SyllabusManager.currentSyllabus.subjects) {
      window.ReminderManager.showToast("Cannot Generate Plan", "Syllabus is not initialized.", "danger");
      return;
    }

    const subjects = window.SyllabusManager.currentSyllabus.subjects;
    let allRemainingTopics = [];
    let completedCount = 0;

    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (!topic.completed) {
          allRemainingTopics.push({
            subjectName: subject.name,
            name: topic.name,
            difficulty: topic.difficulty
          });
        } else {
          completedCount++;
        }
      });
    });

    if (allRemainingTopics.length === 0) {
      window.ReminderManager.showToast("Syllabus Completed!", "You have completed all topics. Add new subjects/topics first!", "success");
      return;
    }

    // 2. Sort topics by difficulty and prioritize weak areas
    allRemainingTopics.sort((a, b) => {
      // Priority mapping
      const difficultyPriority = { "Hard": 3, "Medium": 2, "Easy": 1 };
      
      let scoreA = difficultyPriority[a.difficulty] || 2;
      let scoreB = difficultyPriority[b.difficulty] || 2;

      // If prioritize weak, boost weights for Hard/Medium
      if (prioritizeWeak) {
        if (a.difficulty === 'Hard') scoreA += 2;
        if (b.difficulty === 'Hard') scoreB += 2;
      }

      return scoreB - scoreA; // descending order
    });

    // 3. Build weekly timetable structures (7 days, Monday to Sunday)
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const schedule = {};
    
    daysOfWeek.forEach(day => {
      schedule[day] = [];
    });

    // We assume 1 study session block = 50 minutes study + 10 minutes break
    // If dailyHours is e.g. 4 hours, we schedule 4 main blocks.
    let topicIndex = 0;
    
    daysOfWeek.forEach(day => {
      let startHour = 9; // study starts at 9:00 AM
      
      for (let i = 0; i < dailyHours; i++) {
        // Decide what to put in this slot
        // 1. Alternating Revision slot
        if (i > 0 && i === dailyHours - 1) {
          // revision slot
          schedule[day].push({
            time: `${startHour}:00 - ${startHour}:50`,
            type: "revision",
            subjectName: "Revision Block",
            topicName: "Review weak topics & test formulas"
          });
        } else {
          // Standard study slot
          if (allRemainingTopics.length > 0) {
            const currentTopic = allRemainingTopics[topicIndex % allRemainingTopics.length];
            schedule[day].push({
              time: `${startHour}:00 - ${startHour}:50`,
              type: "study",
              subjectName: currentTopic.subjectName,
              topicName: currentTopic.name,
              difficulty: currentTopic.difficulty
            });
            topicIndex++;
          } else {
            schedule[day].push({
              time: `${startHour}:00 - ${startHour}:50`,
              type: "revision",
              subjectName: "General Practice",
              topicName: "Solve mock questions & flashcards"
            });
          }
        }
        
        // Add 10m break slot
        schedule[day].push({
          time: `${startHour}:50 - ${startHour + 1}:00`,
          type: "break",
          subjectName: "Break",
          topicName: "Stretch, drink water, quick walk"
        });
        
        startHour++;
      }
    });

    // 4. Calculate estimated completion date
    // Assumption: User completes 1 easy topic per 2 hrs, 1 medium per 3 hrs, 1 hard per 4.5 hrs.
    let totalEstimatedHours = 0;
    allRemainingTopics.forEach(t => {
      if (t.difficulty === 'Hard') totalEstimatedHours += 4.5;
      else if (t.difficulty === 'Medium') totalEstimatedHours += 3;
      else totalEstimatedHours += 1.5;
    });

    // Active daily study hours spent directly on syllabus (subtracting break/revision allocations)
    const effectiveStudyHoursPerDay = dailyHours * 0.7; // ~70% time is core topic study
    const daysNeeded = Math.ceil(totalEstimatedHours / effectiveStudyHoursPerDay);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    
    const formattedDate = completionDate.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Save generated plan state
    this.currentPlan = {
      generatedAt: new Date().toISOString(),
      dailyHours,
      prioritizeWeak,
      schedule,
      estimatedDays: daysNeeded,
      estimatedCompletionDate: formattedDate,
      remainingTopicsCount: allRemainingTopics.length
    };

    this.savePlan();
    
    if (window.ReminderManager) {
      window.ReminderManager.showToast("Study Plan Generated!", `Personalized schedule ready. Est. completion: ${formattedDate}`, "success");
    }

    // Trigger dashboard refresh to sync widgets
    if (window.AppManager) {
      window.AppManager.updateDashboardWidgets();
    }
  },

  // Main UI rendering router
  renderSchedule() {
    const weeklyView = document.getElementById('schedule-weekly-view');
    const dailyView = document.getElementById('schedule-daily-view');
    const forecastCard = document.getElementById('planner-forecast-container');
    const scheduleTitle = document.getElementById('planner-schedule-title');

    if (!weeklyView || !dailyView) return;

    if (!this.currentPlan) {
      // Empty State
      weeklyView.style.display = 'none';
      dailyView.style.display = 'none';
      if (forecastCard) forecastCard.style.display = 'none';
      
      const container = document.getElementById('schedule-card-wrapper');
      if (container) {
        container.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 40px;">
            <i class="fas fa-magic" style="font-size: 40px; color: var(--accent-primary); margin-bottom: 16px;"></i>
            <h3>No Active Study Plan</h3>
            <p style="margin-bottom: 20px;">Use the custom AI parameters in the left side-panel to configure and generate your automated weekly timetable.</p>
            <button onclick="document.getElementById('generate-plan-btn').click()" class="btn btn-primary">
              <i class="fas fa-cog"></i> Generate AI Schedule
            </button>
          </div>
        `;
      }
      return;
    }

    // Show Forecast Details
    if (forecastCard) {
      forecastCard.style.display = 'block';
      forecastCard.innerHTML = `
        <div class="glass-card completion-prediction-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:16px;">
              <i class="fas fa-brain" style="font-size:32px; color:var(--accent-success)"></i>
              <div>
                <h4 style="margin-bottom:2px;">AI Syllabus Completion Forecast</h4>
                <p style="font-size:13px;">Estimated completion timeline based on active topic loads & difficulty weightings.</p>
              </div>
            </div>
            <div style="text-align:right;">
              <h3 style="color:var(--accent-success); margin-bottom:2px; font-size:18px;">${this.currentPlan.estimatedCompletionDate}</h3>
              <span style="font-size:11px; color:var(--text-muted); font-weight:600;">(~${this.currentPlan.estimatedDays} days of active study)</span>
            </div>
          </div>
        </div>
      `;
    }

    if (scheduleTitle) {
      scheduleTitle.textContent = `Active ${this.currentPlan.dailyHours} Hours/Day Study Plan`;
    }

    const container = document.getElementById('schedule-card-wrapper');
    if (container) container.innerHTML = ''; // Clear empty state placeholder

    if (this.activeTab === 'weekly') {
      weeklyView.style.display = 'grid';
      dailyView.style.display = 'none';
      this.renderWeeklyGrid(weeklyView);
    } else {
      weeklyView.style.display = 'none';
      dailyView.style.display = 'flex';
      this.renderDailyTimeline(dailyView);
    }
  },

  renderWeeklyGrid(container) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    container.innerHTML = days.map((day, index) => {
      const daySchedule = this.currentPlan.schedule[day] || [];
      
      const itemsHTML = daySchedule.map(item => {
        let typeClass = 'type-study';
        if (item.type === 'break') typeClass = 'type-break';
        if (item.type === 'revision') typeClass = 'type-revision';

        return `
          <div class="schedule-item" onclick="PlannerManager.switchToDay('${day}')">
            <span class="schedule-item-time">${item.time.split(' ')[0]}</span>
            <span class="schedule-item-subject" style="font-size:12px;">${item.subjectName}</span>
            <span class="schedule-item-topic" title="${item.topicName}">${item.topicName}</span>
            <span class="schedule-item-type ${typeClass}">${item.type}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="schedule-day-column">
          <div class="day-column-name">${day}</div>
          <div style="display:flex; flex-direction:column; gap:8px; overflow-y:auto; max-height:400px; padding-right:2px;">
            ${itemsHTML || '<p style="font-size:11px; text-align:center; color:var(--text-muted); padding:10px;">Free Day</p>'}
          </div>
        </div>
      `;
    }).join('');
  },

  renderDailyTimeline(container) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const activeDay = days[this.activeDayIndex];

    // Build Selector Tabs for days
    const daySelectorTabsHTML = days.map((day, idx) => `
      <button class="schedule-tab-btn ${idx === this.activeDayIndex ? 'active' : ''}" 
        onclick="PlannerManager.setActiveDay(${idx})" style="padding:6px 12px; font-size:12px;">
        ${day.substring(0,3)}
      </button>
    `).join('');

    const daySchedule = this.currentPlan.schedule[activeDay] || [];
    
    const timelineItemsHTML = daySchedule.map(item => {
      let typeClass = 'type-study';
      let icon = 'fa-book';
      if (item.type === 'break') { typeClass = 'type-break'; icon = 'fa-coffee'; }
      if (item.type === 'revision') { typeClass = 'type-revision'; icon = 'fa-sync-alt'; }

      return `
        <div class="timeline-row">
          <div class="timeline-time">${item.time.split(' ')[0]}</div>
          <div class="timeline-card ${typeClass}" style="flex-grow:1;">
            <div class="timeline-card-content">
              <h4>${item.subjectName}</h4>
              <p>${item.topicName}</p>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              ${item.difficulty ? `<span class="target-difficulty ${item.difficulty === 'Hard' ? 'diff-hard' : item.difficulty === 'Medium' ? 'diff-medium' : 'diff-easy'}" style="font-size:10px;">${item.difficulty}</span>` : ''}
              <i class="fas ${icon}" style="font-size:18px; opacity:0.3;"></i>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:12px; width:100%;">
        <h3>Timeline: ${activeDay}</h3>
        <div class="schedule-tabs" style="border:1px solid var(--border-solid);">
          ${daySelectorTabsHTML}
        </div>
      </div>
      <div class="timeline-container" style="width:100%;">
        ${timelineItemsHTML || '<p style="text-align:center; padding:30px; color:var(--text-muted);">Nothing scheduled for today!</p>'}
      </div>
    `;
  },

  setActiveDay(index) {
    this.activeDayIndex = index;
    this.renderSchedule();
  },

  switchToDay(dayName) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const idx = days.indexOf(dayName);
    if (idx !== -1) {
      this.activeTab = 'daily';
      this.activeDayIndex = idx;
      
      const weeklyTabBtn = document.getElementById('tab-weekly-btn');
      const dailyTabBtn = document.getElementById('tab-daily-btn');
      if (dailyTabBtn) dailyTabBtn.classList.add('active');
      if (weeklyTabBtn) weeklyTabBtn.classList.remove('active');
      
      this.renderSchedule();
    }
  },

  // Generates 3 random targets on dashboard for the student to complete today
  getTodayTargets() {
    if (!this.currentPlan) return [];

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];
    const daySchedule = this.currentPlan.schedule[todayName] || [];

    // Filter to study type blocks
    const studyBlocks = daySchedule.filter(item => item.type === 'study');
    
    // Map to simple target object list
    return studyBlocks.map((block, index) => ({
      id: `target_${index}`,
      subject: block.subjectName,
      topic: block.topicName,
      difficulty: block.difficulty || "Medium",
      completed: false
    }));
  }
};

window.PlannerManager = PlannerManager;

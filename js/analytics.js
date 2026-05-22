// AI Study Planner - Analytics & Progress Tracking Module

const AnalyticsManager = {
  studyLogs: [],
  subjectChart: null,
  hoursChart: null,

  init() {
    this.loadLogs();
    this.setupEventListeners();
  },

  setupEventListeners() {
    const quickLogForm = document.getElementById('quick-study-log-form');
    if (quickLogForm) {
      quickLogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const minsInput = document.getElementById('log-study-minutes');
        if (minsInput && minsInput.value) {
          this.logStudySession(parseInt(minsInput.value));
          minsInput.value = '';
          const modal = document.getElementById('quick-log-modal');
          if (modal) modal.classList.remove('active');
        }
      });
    }
  },

  loadLogs() {
    const today = new Date().toISOString().split('T')[0];
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";

    // Seed logs for the past 7 days to make analytics charts look beautiful immediately
    const pastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    this.studyLogs = StorageManager.load(`study_logs_${activeExam}`, [
      { date: pastDate(6), minutes: 120 }, // 2 hours
      { date: pastDate(5), minutes: 180 }, // 3 hours
      { date: pastDate(4), minutes: 90 },  // 1.5 hours
      { date: pastDate(3), minutes: 240 }, // 4 hours
      { date: pastDate(2), minutes: 150 }, // 2.5 hours
      { date: pastDate(1), minutes: 210 }  // 3.5 hours
    ]);

    // Recalculate streak
    this.updateStreak();
    this.renderCharts();
  },

  saveLogs() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    StorageManager.save(`study_logs_${activeExam}`, this.studyLogs);
    this.updateStreak();
    this.renderCharts();
  },

  logStudySession(minutes) {
    if (minutes <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const logIndex = this.studyLogs.findIndex(log => log.date === todayStr);

    if (logIndex !== -1) {
      // Append to today's logged minutes
      this.studyLogs[logIndex].minutes += minutes;
    } else {
      // Add new log entry
      this.studyLogs.push({
        date: todayStr,
        minutes: minutes
      });
    }

    this.saveLogs();
    
    // Notify user
    if (window.ReminderManager) {
      window.ReminderManager.showToast(
        "Study Session Logged!", 
        `Added ${minutes} minutes of focus time to your dashboard. Keep going!`, 
        "success"
      );
    }
    
    // Update dashboard visual values
    if (window.AppManager) {
      window.AppManager.updateDashboardWidgets();
    }
  },

  updateStreak() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    let streak = 0;
    
    if (this.studyLogs.length === 0) {
      StorageManager.save(`streak_${activeExam}`, 0);
      return;
    }

    // Sort logs descending by date
    const sorted = [...this.studyLogs].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the user studied today or yesterday to preserve the streak
    const studiedRecently = sorted.some(log => log.date === todayStr || log.date === yesterdayStr);

    if (!studiedRecently) {
      StorageManager.save(`streak_${activeExam}`, 0);
      return;
    }

    let checkDate = new Date();
    // If today is not in logs, start checking from yesterday
    const todayLogged = sorted.some(log => log.date === todayStr);
    if (!todayLogged) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Traverse backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayLog = sorted.find(log => log.date === dateStr);
      
      if (dayLog && dayLog.minutes >= 10) { // minimum 10 minutes to count for streak
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // check previous day
      } else {
        break; // streak broken
      }
    }

    StorageManager.save(`streak_${activeExam}`, streak);
  },

  getStreak() {
    const activeExam = window.AppManager ? window.AppManager.activeExam : "jee";
    return StorageManager.load(`streak_${activeExam}`, 0);
  },

  getTotalStudyHours() {
    const totalMinutes = this.studyLogs.reduce((acc, log) => acc + log.minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  },

  renderCharts() {
    // 1. Chart: Syllabus Completion Rate by Subject
    this.renderSubjectCompletionChart();
    
    // 2. Chart: Study Hours over the last 7 days
    this.renderStudyHoursChart();
  },

  renderSubjectCompletionChart() {
    const canvas = document.getElementById('subject-completion-chart');
    if (!canvas || !window.SyllabusManager) return;

    const metrics = window.SyllabusManager.getMetrics();
    const labels = metrics.subjects.map(s => s.name);
    const percentages = metrics.subjects.map(s => s.percentage);
    const remaining = metrics.subjects.map(s => 100 - s.percentage);

    // Setup colors
    const isDark = document.body.parentElement.getAttribute('data-theme') === 'dark';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#6366f1';
    const accentSecondary = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#06b6d4';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
    const textColor = isDark ? '#94a3b8' : '#475569';

    if (this.subjectChart) {
      this.subjectChart.destroy();
    }

    if (labels.length === 0) {
      // Draw empty placeholder info inside canvas parent
      return;
    }

    // To make it look incredibly clean, we draw a double-level or colored bar/polar/radar chart
    this.subjectChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Completion %',
          data: percentages,
          backgroundColor: [
            '#6366f1', // Indigo
            '#06b6d4', // Cyan
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ec4899', // Pink
            '#8b5cf6'  // Violet
          ],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                family: 'Outfit',
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}% Completed`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  },

  renderStudyHoursChart() {
    const canvas = document.getElementById('study-hours-chart');
    if (!canvas) return;

    // Get past 7 days logs
    const days = [];
    const hours = [];
    const dateLabels = [];

    const isDark = document.body.parentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#6366f1';

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      
      const log = this.studyLogs.find(l => l.date === dateStr);
      const logHours = log ? (log.minutes / 60) : 0;
      
      dateLabels.push(dayName);
      hours.push(logHours);
    }

    if (this.hoursChart) {
      this.hoursChart.destroy();
    }

    this.hoursChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Study Hours',
          data: hours,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Studied: ${context.raw.toFixed(1)} hrs`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Outfit',
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Outfit',
                size: 11
              },
              callback: function(value) {
                return value + 'h';
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }
};

window.AnalyticsManager = AnalyticsManager;

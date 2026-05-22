// AI Study Planner - Reminders, Toasts, and Pomodoro Timer Module

const ReminderManager = {
  // Web Audio API Synth to play nice notifications without external sound dependencies
  playAlertSound(type = 'success') {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === 'success') {
        // High double chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        
        // Second tone
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
        gain2.gain.setValueAtTime(0.15, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.35);
      } else if (type === 'break') {
        // Calmer chime
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(392.00, now); // G4
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
      } else {
        // Alert chime
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, now); // A4
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by user gesture yet.", e);
    }
  },

  // Dynamic Toast Notification System
  showToast(title, message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'danger') iconClass = 'fa-exclamation-circle';

    // Using lucide-styled fallback SVG if FontAwesome / Lucide isn't loaded yet
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <i class="fas ${iconClass}"></i>
        <div class="toast-content">
          <h4>${title}</h4>
          <p>${message}</p>
        </div>
      </div>
    `;

    container.appendChild(toast);
    
    // Play alert sound for actions
    if (type === 'success') this.playAlertSound('success');
    else if (type === 'warning' || type === 'danger') this.playAlertSound('alert');

    // Automatically remove toast after 4s
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  },

  // Pomodoro Focus Timer State & Controller
  timer: {
    timeLeft: 25 * 60, // 25 minutes default
    studyDuration: 25 * 60,
    breakDuration: 5 * 60,
    intervalId: null,
    isActive: false,
    currentMode: 'study', // 'study' or 'break'
    
    init() {
      this.updateDisplay();
      this.setupEventListeners();
    },

    setupEventListeners() {
      const startBtn = document.getElementById('timer-start-btn');
      const pauseBtn = document.getElementById('timer-pause-btn');
      const resetBtn = document.getElementById('timer-reset-btn');
      const modeBtn = document.getElementById('timer-mode-btn');

      if (startBtn) startBtn.addEventListener('click', () => this.start());
      if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
      if (modeBtn) modeBtn.addEventListener('click', () => this.toggleMode());
    },

    start() {
      if (this.isActive) return;
      this.isActive = true;
      
      const startBtn = document.getElementById('timer-start-btn');
      const pauseBtn = document.getElementById('timer-pause-btn');
      const display = document.getElementById('timer-clock-display');
      
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
      if (display) display.classList.add('pulsing');

      this.intervalId = setInterval(() => {
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
          this.handleTimerCompletion();
        }
      }, 1000);
      
      ReminderManager.showToast("Focus Session Started", `Get ready to study! Focus mode active for ${Math.floor(this.timeLeft / 60)} minutes.`, 'success');
    },

    pause() {
      if (!this.isActive) return;
      this.isActive = false;
      clearInterval(this.intervalId);
      
      const startBtn = document.getElementById('timer-start-btn');
      const pauseBtn = document.getElementById('timer-pause-btn');
      const display = document.getElementById('timer-clock-display');
      
      if (startBtn) startBtn.style.display = 'inline-flex';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (display) display.classList.remove('pulsing');
      
      ReminderManager.showToast("Timer Paused", "Focus session has been paused.", "warning");
    },

    reset() {
      this.pause();
      this.timeLeft = this.currentMode === 'study' ? this.studyDuration : this.breakDuration;
      this.updateDisplay();
      ReminderManager.showToast("Timer Reset", "Focus clock reset to original duration.", "info");
    },

    toggleMode() {
      this.pause();
      this.currentMode = this.currentMode === 'study' ? 'break' : 'study';
      this.timeLeft = this.currentMode === 'study' ? this.studyDuration : this.breakDuration;
      
      const modeBtn = document.getElementById('timer-mode-btn');
      if (modeBtn) {
        modeBtn.innerHTML = this.currentMode === 'study' 
          ? '<i class="fas fa-mug-hot"></i> Switch to Break' 
          : '<i class="fas fa-book-reader"></i> Switch to Study';
      }
      
      this.updateDisplay();
      
      ReminderManager.showToast(
        this.currentMode === 'study' ? "Study Session Configured" : "Break Period Configured",
        this.currentMode === 'study' ? "Ready for a 25-minute focus session?" : "Time to take a 5-minute break!",
        "info"
      );
    },

    updateDisplay() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      const display = document.getElementById('timer-clock-display');
      if (display) display.textContent = timeStr;
      
      // Also update browser tab title
      const modeLabel = this.currentMode === 'study' ? '📖 Focus' : '☕ Break';
      document.title = `${timeStr} - ${modeLabel} | AI Study Planner`;
    },

    handleTimerCompletion() {
      this.pause();
      
      if (this.currentMode === 'study') {
        ReminderManager.playAlertSound('success');
        ReminderManager.showToast("Session Complete!", "Great job! You finished your study session. Take a break.", "success");
        
        // Log study duration
        if (window.AnalyticsManager) {
          window.AnalyticsManager.logStudySession(Math.round(this.studyDuration / 60));
        }
        
        // Toggle to break
        this.toggleMode();
      } else {
        ReminderManager.playAlertSound('break');
        ReminderManager.showToast("Break Over!", "Break period has ended. Time to start studying again.", "info");
        
        // Toggle to study
        this.toggleMode();
      }
    }
  },

  // Reminders Database Functions
  remindersList: [],

  loadReminders() {
    this.remindersList = StorageManager.load('reminders', [
      { id: "r1", title: "JEE Physics Mock Test", type: "mock", date: "2026-05-24T10:00", active: true },
      { id: "r2", title: "Organic Chemistry Revision", type: "revision", date: "2026-05-23T16:00", active: true },
      { id: "r3", title: "Maths Assignment Deadline", type: "deadline", date: "2026-05-26T23:59", active: true }
    ]);
    this.renderReminders();
    this.checkPendingAlerts();
  },

  saveReminders() {
    StorageManager.save('reminders', this.remindersList);
    this.renderReminders();
  },

  addReminder(title, type, date) {
    const newRem = {
      id: "rem_" + Date.now(),
      title,
      type,
      date,
      active: true
    };
    this.remindersList.push(newRem);
    this.saveReminders();
    this.showToast("Reminder Set", `Added: "${title}"`, "success");
  },

  deleteReminder(id) {
    this.remindersList = this.remindersList.filter(rem => rem.id !== id);
    this.saveReminders();
    this.showToast("Reminder Deleted", "The reminder has been removed.", "info");
  },

  renderReminders() {
    const container = document.getElementById('reminders-widget-list');
    if (!container) return;

    if (this.remindersList.length === 0) {
      container.innerHTML = `<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px 0;">No active reminders.</p>`;
      return;
    }

    // Sort by chronological order
    const sorted = [...this.remindersList].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sorted.map(rem => {
      const remDate = new Date(rem.date);
      const diffTime = remDate - new Date();
      const isPast = diffTime < 0;
      
      let dateString = remDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      let timeString = remDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let badgeColorClass = 'diff-easy';
      if (rem.type === 'mock') badgeColorClass = 'diff-hard';
      if (rem.type === 'revision') badgeColorClass = 'diff-medium';

      return `
        <div class="target-item" style="${isPast ? 'opacity: 0.6;' : ''}">
          <div class="target-left">
            <i class="far ${rem.type === 'mock' ? 'fa-file-alt' : rem.type === 'revision' ? 'fa-sync' : 'fa-clock'}" style="color: var(--accent-primary)"></i>
            <div class="target-details">
              <h4 style="font-size:13px;">${rem.title}</h4>
              <span style="font-size:10px;">${dateString} at ${timeString} ${isPast ? '(Passed)' : ''}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="target-difficulty ${badgeColorClass}" style="font-size: 9px; text-transform: capitalize;">${rem.type}</span>
            <button onclick="ReminderManager.deleteReminder('${rem.id}')" class="action-icon-btn delete-btn" title="Delete">
              <i class="fas fa-trash-alt" style="font-size:11px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // System periodic check for reminders (simulated backgrounds)
  checkPendingAlerts() {
    setInterval(() => {
      const nowStr = new Date().toISOString().substring(0, 16);
      this.remindersList.forEach(rem => {
        if (rem.active) {
          const remStr = rem.date.substring(0, 16);
          if (remStr === nowStr) {
            // Trigger!
            this.showToast(`Reminder: ${rem.title}`, `Scheduled milestone has arrived!`, "warning");
            rem.active = false;
            this.saveReminders();
          }
        }
      });
    }, 30000); // Check every 30s
  }
};
window.ReminderManager = ReminderManager;

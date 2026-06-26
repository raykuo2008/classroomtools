const State = {
  key: "classroom-toolkit-state",

  defaults: {
    students: [],
    seating: [],
    seatingLayout: [],
    lotteryHistory: [],
    timerLogs: [],
    cleaningJobs: []
  },

  data: {},

  init() {
    this.data = { ...this.defaults };

    const saved = localStorage.getItem(this.key);
    if (saved) {
      try {
        this.data = {
          ...this.defaults,
          ...JSON.parse(saved)
        };
      } catch (e) {
        console.error("State load error", e);
      }
    }
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  },

  get(key) {
    return this.data[key];
  },

  set(key, value) {
    if (!(key in this.data)) {
      console.warn("Unknown state key:", key);
    }

    this.data[key] = value;
    this.save();
  },

  push(key, value) {
    if (!Array.isArray(this.data[key])) {
      console.warn("push() used on non-array key:", key);
      return;
    }

    this.data[key].push(value);
    this.save();
  },

  getStudents() {
    return this.get("students") || [];
  },

  setStudents(students) {
    this.set("students", students);
  }
};

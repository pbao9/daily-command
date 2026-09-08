// TaskService: owns dailyData (tasks + focus, keyed by date). Talks only to StorageService.
const TaskService = {
  todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  dateKeyOffset(key, offsetDays) {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d + offsetDays);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  },

  async getAllDailyData() {
    return (await StorageService.get('dailyData')) || {};
  },

  emptyDay() {
    return { focus: '', tasks: [] };
  },

  async getDay(dateKey) {
    const all = await this.getAllDailyData();
    const day = all[dateKey] || this.emptyDay();
    // Normalize legacy tasks (checkbox model) into the kanban status model.
    day.tasks.forEach((t) => {
      if (!t.status) t.status = t.completed ? 'done' : 'todo';
      if (t.description === undefined) t.description = '';
      if (!t.subtasks) t.subtasks = [];
    });
    return day;
  },

  async saveDay(dateKey, day) {
    const all = await this.getAllDailyData();
    all[dateKey] = day;
    await StorageService.set('dailyData', all);
  },

  async setFocus(dateKey, focus) {
    const day = await this.getDay(dateKey);
    day.focus = focus.trim();
    await this.saveDay(dateKey, day);
    return day;
  },

  async clearFocus(dateKey) {
    return this.setFocus(dateKey, '');
  },

  async addTask(dateKey, { title, priority = 'medium', category = 'other', description = '', subtasks = [] }) {
    const day = await this.getDay(dateKey);
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      status: 'todo',
      priority,
      category,
      description: description.trim(),
      subtasks,
      createdAt: new Date().toISOString(),
    };
    day.tasks.push(task);
    await this.saveDay(dateKey, day);
    return task;
  },

  async updateTask(dateKey, taskId, changes) {
    const day = await this.getDay(dateKey);
    const task = day.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    Object.assign(task, changes);
    await this.saveDay(dateKey, day);
    return task;
  },

  // status: 'todo' | 'doing' | 'done'. Keeps the legacy `completed` flag in
  // sync so history/progress code (which reads `completed`) still works.
  async setTaskStatus(dateKey, taskId, status) {
    const day = await this.getDay(dateKey);
    const task = day.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = status;
    task.completed = status === 'done';
    await this.saveDay(dateKey, day);
    return task;
  },

  async toggleSubtask(dateKey, taskId, subtaskId) {
    const day = await this.getDay(dateKey);
    const task = day.tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return null;
    subtask.completed = !subtask.completed;
    await this.saveDay(dateKey, day);
    return subtask;
  },

  async deleteTask(dateKey, taskId) {
    const day = await this.getDay(dateKey);
    day.tasks = day.tasks.filter((t) => t.id !== taskId);
    await this.saveDay(dateKey, day);
  },

  // Returns unfinished tasks from yesterday, only if today has no data yet
  // and the carry-over prompt hasn't already been dismissed for today.
  async getPendingCarryOver(todayKey) {
    const meta = (await StorageService.get('meta')) || {};
    if (meta.carryOverHandled === todayKey) return [];

    const all = await this.getAllDailyData();
    if (all[todayKey]) return []; // today already has data, nothing to offer

    const yesterdayKey = this.dateKeyOffset(todayKey, -1);
    const yesterday = all[yesterdayKey];
    if (!yesterday) return [];

    return yesterday.tasks.filter((t) => !t.completed);
  },

  async applyCarryOver(todayKey, tasks) {
    const day = await this.getDay(todayKey);
    for (const t of tasks) {
      day.tasks.push({
        id: crypto.randomUUID(),
        title: t.title,
        completed: false,
        status: 'todo',
        priority: t.priority,
        category: t.category,
        createdAt: new Date().toISOString(),
      });
    }
    await this.saveDay(todayKey, day);
    await this.markCarryOverHandled(todayKey);
  },

  async markCarryOverHandled(todayKey) {
    const meta = (await StorageService.get('meta')) || {};
    meta.carryOverHandled = todayKey;
    await StorageService.set('meta', meta);
  },

  async getHistoryDates() {
    const all = await this.getAllDailyData();
    return Object.keys(all).sort((a, b) => (a < b ? 1 : -1));
  },
};

(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    bgLayer: $('bgLayer'),
    dateLine: $('dateLine'),
    greetingLine: $('greetingLine'),
    focusText: $('focusText'),
    focusActions: $('focusActions'),
    setFocusBtn: $('setFocusBtn'),
    editFocusBtn: $('editFocusBtn'),
    clearFocusBtn: $('clearFocusBtn'),
    progressSection: $('progressSection'),
    progressCount: $('progressCount'),
    progressFill: $('progressFill'),
    kanbanBoard: $('kanbanBoard'),
    listTodo: $('listTodo'),
    listDoing: $('listDoing'),
    listDone: $('listDone'),
    countTodo: $('countTodo'),
    countDoing: $('countDoing'),
    countDone: $('countDone'),
    emptyState: $('emptyState'),
    doneState: $('doneState'),
    addTaskBtn: $('addTaskBtn'),
    carryBanner: $('carryBanner'),
    carryBannerText: $('carryBannerText'),
    carryAcceptBtn: $('carryAcceptBtn'),
    carryDismissBtn: $('carryDismissBtn'),
    settingsBtn: $('settingsBtn'),
    historyBtn: $('historyBtn'),

    taskDialog: $('taskDialog'),
    taskForm: $('taskForm'),
    taskDialogTitle: $('taskDialogTitle'),
    taskTitleInput: $('taskTitleInput'),
    taskDescriptionInput: $('taskDescriptionInput'),
    taskPriorityInput: $('taskPriorityInput'),
    taskCategoryInput: $('taskCategoryInput'),
    taskSaveBtn: $('taskSaveBtn'),
    taskCancelBtn: $('taskCancelBtn'),
    subtaskEditList: $('subtaskEditList'),
    newSubtaskInput: $('newSubtaskInput'),
    addSubtaskBtn: $('addSubtaskBtn'),

    focusDialog: $('focusDialog'),
    focusForm: $('focusForm'),
    focusInput: $('focusInput'),
    focusCancelBtn: $('focusCancelBtn'),

    historyDialog: $('historyDialog'),
    historyCloseBtn: $('historyCloseBtn'),
    historyDateSelect: $('historyDateSelect'),
    historyContent: $('historyContent'),

    settingsDialog: $('settingsDialog'),
    settingsCloseBtn: $('settingsCloseBtn'),
    nameInput: $('nameInput'),
    uploadBgBtn: $('uploadBgBtn'),
    removeBgBtn: $('removeBgBtn'),
    bgFileInput: $('bgFileInput'),
    bgHint: $('bgHint'),
    bgFitInput: $('bgFitInput'),
    overlayInput: $('overlayInput'),
    overlayValue: $('overlayValue'),
    bgBlurInput: $('bgBlurInput'),
    bgBlurValue: $('bgBlurValue'),
    bgOpacityInput: $('bgOpacityInput'),
    bgOpacityValue: $('bgOpacityValue'),
    themeInput: $('themeInput'),
    glassBlurInput: $('glassBlurInput'),
    glassBlurValue: $('glassBlurValue'),
    glassOpacityInput: $('glassOpacityInput'),
    glassOpacityValue: $('glassOpacityValue'),
    carryOverInput: $('carryOverInput'),
    showGreetingInput: $('showGreetingInput'),
    showProgressInput: $('showProgressInput'),
    exportBtn: $('exportBtn'),
    importBtn: $('importBtn'),
    importFileInput: $('importFileInput'),
    importHint: $('importHint'),

    toast: $('toast'),
  };

  const CATEGORY_LABEL = { work: 'Work', learning: 'Learning', personal: 'Personal', other: 'Other' };
  const STATUS_ORDER = ['todo', 'doing', 'done'];
  const STATUS_LIST_EL = { todo: 'listTodo', doing: 'listDoing', done: 'listDone' };
  const STATUS_COUNT_EL = { todo: 'countTodo', doing: 'countDoing', done: 'countDone' };

  let todayKey = TaskService.todayKey();
  let currentDay = TaskService.emptyDay();
  let editingTaskId = null;
  let editingSubtasks = [];
  let darkMediaQuery = null;

  // type: 'default' | 'success' | 'error'
  function toast(message, type = 'default') {
    els.toast.textContent = message;
    els.toast.className = `toast toast-${type}`;
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { els.toast.hidden = true; }, 3200);
  }

  // ---------- Rendering ----------

  function renderDate() {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    els.dateLine.textContent = `${weekday.toUpperCase()}, ${monthDay.toUpperCase()}`;
  }

  function greetingWord() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function renderGreeting(settings) {
    if (!settings.showGreeting) {
      els.greetingLine.hidden = true;
      return;
    }
    const name = settings.name?.trim() || 'Friend';
    els.greetingLine.textContent = `${greetingWord()}, ${name}.`;
    els.greetingLine.hidden = false;
  }

  function renderFocus() {
    const focus = currentDay.focus?.trim();
    if (focus) {
      els.focusText.textContent = focus;
      els.focusText.hidden = false;
      els.focusActions.hidden = false;
      els.setFocusBtn.hidden = true;
    } else {
      els.focusText.hidden = true;
      els.focusActions.hidden = true;
      els.setFocusBtn.hidden = false;
    }
  }

  function renderProgress(settings) {
    const total = currentDay.tasks.length;
    const done = currentDay.tasks.filter((t) => t.completed).length;
    if (!settings.showProgress || total === 0) {
      els.progressSection.hidden = true;
      return;
    }
    els.progressSection.hidden = false;
    els.progressCount.textContent = `${done} / ${total} completed`;
    els.progressFill.style.width = `${Math.round((done / total) * 100)}%`;
  }

  function taskCardNode(task) {
    const li = document.createElement('li');
    li.className = `kanban-card priority-${task.priority}`;
    li.dataset.id = task.id;
    li.draggable = true;
    li.tabIndex = 0;

    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
      li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));

    const badges = document.createElement('div');
    badges.className = 'card-badges';
    const priBadge = document.createElement('span');
    priBadge.className = 'task-badge priority';
    priBadge.textContent = task.priority;
    const catBadge = document.createElement('span');
    catBadge.className = 'task-badge category';
    catBadge.textContent = CATEGORY_LABEL[task.category] || 'Other';
    badges.append(priBadge, catBadge);

    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = task.title;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const statusIndex = STATUS_ORDER.indexOf(task.status);

    const moveLeftBtn = document.createElement('button');
    moveLeftBtn.className = 'icon-btn-sm';
    moveLeftBtn.type = 'button';
    moveLeftBtn.setAttribute('aria-label', `Move "${task.title}" to previous column`);
    moveLeftBtn.textContent = '‹';
    moveLeftBtn.disabled = statusIndex <= 0;
    moveLeftBtn.addEventListener('click', () => handleMoveTask(task.id, STATUS_ORDER[statusIndex - 1]));

    const moveRightBtn = document.createElement('button');
    moveRightBtn.className = 'icon-btn-sm';
    moveRightBtn.type = 'button';
    moveRightBtn.setAttribute('aria-label', `Move "${task.title}" to next column`);
    moveRightBtn.textContent = '›';
    moveRightBtn.disabled = statusIndex >= STATUS_ORDER.length - 1;
    moveRightBtn.addEventListener('click', () => handleMoveTask(task.id, STATUS_ORDER[statusIndex + 1]));

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn-sm';
    editBtn.type = 'button';
    editBtn.setAttribute('aria-label', `Edit "${task.title}"`);
    editBtn.innerHTML = ICONS.pencil;
    editBtn.addEventListener('click', () => openTaskDialog(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn-sm';
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
    deleteBtn.innerHTML = ICONS.trash;
    deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));

    actions.append(moveLeftBtn, moveRightBtn, editBtn, deleteBtn);
    li.append(badges, title);

    if (task.description) {
      const desc = document.createElement('p');
      desc.className = 'card-description';
      desc.textContent = task.description;
      li.appendChild(desc);
    }

    if (task.subtasks.length > 0) {
      li.appendChild(subtaskChecklistNode(task));
    }

    li.appendChild(actions);
    return li;
  }

  function subtaskChecklistNode(task) {
    const ul = document.createElement('ul');
    ul.className = 'card-subtasks';
    for (const sub of task.subtasks) {
      const li = document.createElement('li');
      li.className = 'card-subtask-row';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'subtask-checkbox';
      checkbox.checked = sub.completed;
      checkbox.setAttribute('aria-label', sub.title);
      // Dragging the card shouldn't fire when interacting with a checkbox.
      checkbox.addEventListener('mousedown', (e) => e.stopPropagation());
      checkbox.addEventListener('change', () => handleToggleSubtask(task.id, sub.id));

      const label = document.createElement('span');
      label.className = sub.completed ? 'subtask-done' : '';
      label.textContent = sub.title;

      li.append(checkbox, label);
      ul.appendChild(li);
    }
    return ul;
  }

  function renderTasks() {
    els.listTodo.innerHTML = '';
    els.listDoing.innerHTML = '';
    els.listDone.innerHTML = '';

    const order = { high: 0, medium: 1, low: 2 };
    const sorted = [...currentDay.tasks].sort((a, b) => order[a.priority] - order[b.priority]);

    const buckets = { todo: 0, doing: 0, done: 0 };
    for (const task of sorted) {
      buckets[task.status] += 1;
      els[STATUS_LIST_EL[task.status]].appendChild(taskCardNode(task));
    }
    for (const status of STATUS_ORDER) {
      els[STATUS_COUNT_EL[status]].textContent = buckets[status];
    }

    const total = currentDay.tasks.length;
    els.emptyState.hidden = total !== 0;
    els.doneState.hidden = !(total > 0 && buckets.done === total);
    els.kanbanBoard.hidden = total === 0;
  }

  async function refreshDashboard() {
    currentDay = await TaskService.getDay(todayKey);
    const settings = await SettingsService.get();
    renderFocus();
    renderProgress(settings);
    renderTasks();
  }

  // ---------- Settings & background ----------

  function applyTheme(theme) {
    const root = document.documentElement;
    if (darkMediaQuery) {
      darkMediaQuery.onchange = null;
      darkMediaQuery = null;
    }
    if (theme === 'auto') {
      darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const resolve = () => root.setAttribute('data-theme', darkMediaQuery.matches ? 'dark' : 'light');
      darkMediaQuery.onchange = resolve;
      resolve();
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  function applyBackgroundLayer(settings, bgImage) {
    const root = document.documentElement;
    root.style.setProperty('--bg-blur', `${settings.bgBlur}px`);
    root.style.setProperty('--bg-opacity', settings.bgOpacity / 100);
    root.style.setProperty('--overlay-alpha', settings.overlayDarkness / 100);

    els.bgLayer.classList.remove('bg-fixed', 'bg-center', 'default-bg');
    if (bgImage) {
      els.bgLayer.style.backgroundImage = `url("${bgImage}")`;
      if (settings.bgFit === 'fixed') els.bgLayer.classList.add('bg-fixed');
      if (settings.bgFit === 'center') els.bgLayer.classList.add('bg-center');
    } else {
      els.bgLayer.style.backgroundImage = '';
      els.bgLayer.classList.add('default-bg');
    }
  }

  function applyGlass(settings) {
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
    root.style.setProperty('--glass-bg-alpha', settings.glassOpacity / 100);
  }

  async function applyAllSettings() {
    const [settings, bgImage] = await Promise.all([SettingsService.get(), SettingsService.getBackgroundImage()]);
    applyTheme(settings.theme);
    applyBackgroundLayer(settings, bgImage);
    applyGlass(settings);
    renderGreeting(settings);
    return settings;
  }

  function populateSettingsDialog(settings, bgImage) {
    els.nameInput.value = settings.name;
    els.bgFitInput.value = settings.bgFit;
    els.overlayInput.value = settings.overlayDarkness;
    els.overlayValue.textContent = `${settings.overlayDarkness}%`;
    els.bgBlurInput.value = settings.bgBlur;
    els.bgBlurValue.textContent = `${settings.bgBlur}px`;
    els.bgOpacityInput.value = settings.bgOpacity;
    els.bgOpacityValue.textContent = `${settings.bgOpacity}%`;
    els.themeInput.value = settings.theme;
    els.glassBlurInput.value = settings.glassBlur;
    els.glassBlurValue.textContent = `${settings.glassBlur}px`;
    els.glassOpacityInput.value = settings.glassOpacity;
    els.glassOpacityValue.textContent = `${settings.glassOpacity}%`;
    els.carryOverInput.checked = settings.carryOver;
    els.showGreetingInput.checked = settings.showGreeting;
    els.showProgressInput.checked = settings.showProgress;
    els.bgHint.textContent = bgImage ? 'Custom background active.' : 'Using the default background.';
  }

  async function openSettingsDialog() {
    const [settings, bgImage] = await Promise.all([SettingsService.get(), SettingsService.getBackgroundImage()]);
    populateSettingsDialog(settings, bgImage);
    els.importHint.textContent = '';
    els.settingsDialog.showModal();
  }

  async function saveSetting(partial) {
    await SettingsService.update(partial);
    const settings = await applyAllSettings();
    renderProgress(settings);
  }

  // Downscales very large images so they have a better chance of fitting
  // inside chrome.storage.local's quota. ponytail: simple canvas resize, no image-processing lib.
  function downscaleImage(dataUrl, maxDimension = 1920, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) return resolve(dataUrl);
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not read image.'));
      img.src = dataUrl;
    });
  }

  async function handleBackgroundUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resized = await downscaleImage(reader.result);
        const result = await SettingsService.setBackgroundImage(resized);
        if (!result.ok) {
          toast(`Couldn't save background: storage limit reached. Try a smaller image.`, 'error');
          return;
        }
        const [settings] = await Promise.all([SettingsService.get()]);
        applyBackgroundLayer(settings, resized);
        els.bgHint.textContent = 'Custom background active.';
        toast('Background updated.', 'success');
      } catch (err) {
        toast('Could not read that image. Please try another file.', 'error');
      }
    };
    reader.onerror = () => toast('Could not read that image. Please try another file.', 'error');
    reader.readAsDataURL(file);
  }

  async function handleRemoveBackground() {
    await SettingsService.removeBackgroundImage();
    const settings = await SettingsService.get();
    applyBackgroundLayer(settings, null);
    els.bgHint.textContent = 'Using the default background.';
    toast('Background removed.', 'success');
  }

  // ---------- Focus ----------

  function openFocusDialog() {
    els.focusInput.value = currentDay.focus || '';
    els.focusDialog.showModal();
    setTimeout(() => els.focusInput.focus(), 0);
  }

  async function handleFocusSubmit(e) {
    e.preventDefault();
    const value = els.focusInput.value.trim();
    if (!value) return;
    currentDay = await TaskService.setFocus(todayKey, value);
    renderFocus();
    els.focusDialog.close();
    toast('Today\'s focus saved.', 'success');
  }

  async function handleClearFocus() {
    currentDay = await TaskService.clearFocus(todayKey);
    renderFocus();
    toast('Focus cleared.', 'success');
  }

  // ---------- Tasks ----------

  function openTaskDialog(task) {
    editingTaskId = task ? task.id : null;
    editingSubtasks = task ? task.subtasks.map((s) => ({ ...s })) : [];
    els.taskDialogTitle.textContent = task ? 'Edit Task' : 'New Task';
    els.taskSaveBtn.textContent = task ? 'Save' : 'Add Task';
    els.taskTitleInput.value = task ? task.title : '';
    els.taskDescriptionInput.value = task ? task.description : '';
    els.taskPriorityInput.value = task ? task.priority : 'medium';
    els.taskCategoryInput.value = task ? task.category : 'other';
    els.newSubtaskInput.value = '';
    renderSubtaskEditor();
    els.taskDialog.showModal();
    setTimeout(() => els.taskTitleInput.focus(), 0);
  }

  function renderSubtaskEditor() {
    els.subtaskEditList.innerHTML = '';
    for (const sub of editingSubtasks) {
      const li = document.createElement('li');
      li.className = 'subtask-edit-row';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = sub.completed;
      checkbox.setAttribute('aria-label', `Mark "${sub.title}" as completed`);
      checkbox.addEventListener('change', () => { sub.completed = checkbox.checked; });

      const input = document.createElement('input');
      input.type = 'text';
      input.value = sub.title;
      input.maxLength = 200;
      input.setAttribute('aria-label', 'Subtask title');
      input.addEventListener('input', () => { sub.title = input.value; });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'icon-btn-sm';
      removeBtn.setAttribute('aria-label', `Remove subtask "${sub.title}"`);
      removeBtn.innerHTML = ICONS.close;
      removeBtn.addEventListener('click', () => {
        editingSubtasks = editingSubtasks.filter((s) => s.id !== sub.id);
        renderSubtaskEditor();
      });

      li.append(checkbox, input, removeBtn);
      els.subtaskEditList.appendChild(li);
    }
  }

  function handleAddSubtask() {
    const title = els.newSubtaskInput.value.trim();
    if (!title) return;
    editingSubtasks.push({ id: crypto.randomUUID(), title, completed: false });
    els.newSubtaskInput.value = '';
    renderSubtaskEditor();
    els.newSubtaskInput.focus();
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    const title = els.taskTitleInput.value.trim();
    if (!title) return;
    const priority = els.taskPriorityInput.value;
    const category = els.taskCategoryInput.value;
    const description = els.taskDescriptionInput.value.trim();
    const subtasks = editingSubtasks
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title);

    const wasEditing = Boolean(editingTaskId);
    if (editingTaskId) {
      await TaskService.updateTask(todayKey, editingTaskId, { title, priority, category, description, subtasks });
    } else {
      await TaskService.addTask(todayKey, { title, priority, category, description, subtasks });
    }
    editingTaskId = null;
    editingSubtasks = [];
    els.taskDialog.close();
    await refreshDashboard();
    toast(wasEditing ? 'Task updated.' : 'Task added.', 'success');
  }

  async function handleMoveTask(id, status) {
    await TaskService.setTaskStatus(todayKey, id, status);
    await refreshDashboard();
  }

  async function handleToggleSubtask(taskId, subtaskId) {
    await TaskService.toggleSubtask(todayKey, taskId, subtaskId);
    await refreshDashboard();
  }

  function bindKanbanDragEvents() {
    for (const status of STATUS_ORDER) {
      const list = els[STATUS_LIST_EL[status]];
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.classList.add('drag-over');
      });
      list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
      list.addEventListener('drop', (e) => {
        e.preventDefault();
        list.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        if (id) handleMoveTask(id, status);
      });
    }
  }

  async function handleDeleteTask(id) {
    await TaskService.deleteTask(todayKey, id);
    await refreshDashboard();
    toast('Task deleted.', 'success');
  }

  // ---------- Carry over ----------

  async function checkCarryOver() {
    const settings = await SettingsService.get();
    if (!settings.carryOver) return;
    const pending = await TaskService.getPendingCarryOver(todayKey);
    if (pending.length === 0) return;
    els.carryBannerText.textContent = `You have ${pending.length} unfinished task${pending.length === 1 ? '' : 's'} from yesterday.`;
    els.carryBanner.hidden = false;
    els.carryBanner._pending = pending;
  }

  async function handleCarryAccept() {
    const pending = els.carryBanner._pending || [];
    await TaskService.applyCarryOver(todayKey, pending);
    els.carryBanner.hidden = true;
    await refreshDashboard();
    toast('Carried over from yesterday.');
  }

  async function handleCarryDismiss() {
    await TaskService.markCarryOverHandled(todayKey);
    els.carryBanner.hidden = true;
  }

  // ---------- History ----------

  async function openHistoryDialog() {
    const dates = await TaskService.getHistoryDates();
    els.historyDateSelect.innerHTML = '';
    if (dates.length === 0) {
      els.historyContent.innerHTML = '<p class="history-empty">No history yet.</p>';
      els.historyDateSelect.hidden = true;
      els.historyDialog.showModal();
      return;
    }
    els.historyDateSelect.hidden = false;
    for (const key of dates) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
      els.historyDateSelect.appendChild(opt);
    }
    await renderHistoryDay(dates[0]);
    els.historyDialog.showModal();
  }

  async function renderHistoryDay(dateKey) {
    const day = await TaskService.getDay(dateKey);
    const completed = day.tasks.filter((t) => t.completed);
    const incomplete = day.tasks.filter((t) => !t.completed);

    els.historyContent.innerHTML = '';

    if (day.focus) {
      const focusP = document.createElement('p');
      focusP.className = 'history-focus';
      focusP.textContent = day.focus;
      els.historyContent.appendChild(focusP);
    }

    if (day.tasks.length === 0) {
      const p = document.createElement('p');
      p.className = 'history-empty';
      p.textContent = 'No tasks recorded for this day.';
      els.historyContent.appendChild(p);
      return;
    }

    function historyItem(iconSvg, title) {
      const li = document.createElement('li');
      const iconSpan = document.createElement('span');
      iconSpan.className = 'icon icon-sm';
      iconSpan.innerHTML = iconSvg;
      li.appendChild(iconSpan);
      li.appendChild(document.createTextNode(title));
      return li;
    }

    const completedList = document.createElement('ul');
    completedList.className = 'history-list';
    for (const t of completed) completedList.appendChild(historyItem(ICONS.check, t.title));

    const incompleteList = document.createElement('ul');
    incompleteList.className = 'history-list';
    for (const t of incomplete) incompleteList.appendChild(historyItem(ICONS.circle, t.title));

    if (completed.length) {
      const h = document.createElement('p');
      h.className = 'eyebrow';
      h.textContent = 'Completed';
      els.historyContent.append(h, completedList);
    }
    if (incomplete.length) {
      const h = document.createElement('p');
      h.className = 'eyebrow';
      h.textContent = 'Incomplete';
      els.historyContent.append(h, incompleteList);
    }
  }

  // ---------- Import / Export ----------

  async function handleExport() {
    const data = await SettingsService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = TaskService.todayKey();
    a.href = url;
    a.download = `daily-command-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await SettingsService.importData(data);
      if (!result.ok) {
        els.importHint.textContent = 'Invalid backup file. Your existing data was not changed.';
        toast('Invalid backup file.', 'error');
        return;
      }
      els.importHint.textContent = 'Import successful.';
      todayKey = TaskService.todayKey();
      await applyAllSettings();
      await refreshDashboard();
      const settings = await SettingsService.get();
      const bgImage = await SettingsService.getBackgroundImage();
      populateSettingsDialog(settings, bgImage);
      toast('Backup imported.', 'success');
    } catch (err) {
      els.importHint.textContent = 'Invalid backup file. Your existing data was not changed.';
      toast('Invalid backup file.', 'error');
    }
  }

  // ---------- Wire up ----------

  function bindEvents() {
    els.setFocusBtn.addEventListener('click', openFocusDialog);
    els.editFocusBtn.addEventListener('click', openFocusDialog);
    els.clearFocusBtn.addEventListener('click', handleClearFocus);
    els.focusForm.addEventListener('submit', handleFocusSubmit);
    els.focusCancelBtn.addEventListener('click', () => els.focusDialog.close());

    els.addTaskBtn.addEventListener('click', () => openTaskDialog(null));
    els.taskForm.addEventListener('submit', handleTaskSubmit);
    els.taskCancelBtn.addEventListener('click', () => { editingTaskId = null; editingSubtasks = []; els.taskDialog.close(); });

    els.addSubtaskBtn.addEventListener('click', handleAddSubtask);
    els.newSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      handleAddSubtask();
    });

    els.carryAcceptBtn.addEventListener('click', handleCarryAccept);
    els.carryDismissBtn.addEventListener('click', handleCarryDismiss);

    els.historyBtn.addEventListener('click', openHistoryDialog);
    els.historyCloseBtn.addEventListener('click', () => els.historyDialog.close());
    els.historyDateSelect.addEventListener('change', (e) => renderHistoryDay(e.target.value));

    els.settingsBtn.addEventListener('click', openSettingsDialog);
    els.settingsCloseBtn.addEventListener('click', () => els.settingsDialog.close());

    els.nameInput.addEventListener('change', () => saveSetting({ name: els.nameInput.value.trim() || 'Friend' }));

    els.uploadBgBtn.addEventListener('click', () => els.bgFileInput.click());
    els.bgFileInput.addEventListener('change', (e) => handleBackgroundUpload(e.target.files[0]));
    els.removeBgBtn.addEventListener('click', handleRemoveBackground);
    els.bgFitInput.addEventListener('change', () => saveSetting({ bgFit: els.bgFitInput.value }));

    els.overlayInput.addEventListener('input', () => {
      els.overlayValue.textContent = `${els.overlayInput.value}%`;
      document.documentElement.style.setProperty('--overlay-alpha', els.overlayInput.value / 100);
    });
    els.overlayInput.addEventListener('change', () => saveSetting({ overlayDarkness: Number(els.overlayInput.value) }));

    els.bgBlurInput.addEventListener('input', () => {
      els.bgBlurValue.textContent = `${els.bgBlurInput.value}px`;
      document.documentElement.style.setProperty('--bg-blur', `${els.bgBlurInput.value}px`);
    });
    els.bgBlurInput.addEventListener('change', () => saveSetting({ bgBlur: Number(els.bgBlurInput.value) }));

    els.bgOpacityInput.addEventListener('input', () => {
      els.bgOpacityValue.textContent = `${els.bgOpacityInput.value}%`;
      document.documentElement.style.setProperty('--bg-opacity', els.bgOpacityInput.value / 100);
    });
    els.bgOpacityInput.addEventListener('change', () => saveSetting({ bgOpacity: Number(els.bgOpacityInput.value) }));

    els.themeInput.addEventListener('change', () => saveSetting({ theme: els.themeInput.value }));

    els.glassBlurInput.addEventListener('input', () => {
      els.glassBlurValue.textContent = `${els.glassBlurInput.value}px`;
      document.documentElement.style.setProperty('--glass-blur', `${els.glassBlurInput.value}px`);
    });
    els.glassBlurInput.addEventListener('change', () => saveSetting({ glassBlur: Number(els.glassBlurInput.value) }));

    els.glassOpacityInput.addEventListener('input', () => {
      els.glassOpacityValue.textContent = `${els.glassOpacityInput.value}%`;
      document.documentElement.style.setProperty('--glass-bg-alpha', els.glassOpacityInput.value / 100);
    });
    els.glassOpacityInput.addEventListener('change', () => saveSetting({ glassOpacity: Number(els.glassOpacityInput.value) }));

    els.carryOverInput.addEventListener('change', () => saveSetting({ carryOver: els.carryOverInput.checked }));
    els.showGreetingInput.addEventListener('change', () => saveSetting({ showGreeting: els.showGreetingInput.checked }));
    els.showProgressInput.addEventListener('change', async () => {
      await saveSetting({ showProgress: els.showProgressInput.checked });
      await refreshDashboard();
    });

    els.exportBtn.addEventListener('click', handleExport);
    els.importBtn.addEventListener('click', () => els.importFileInput.click());
    els.importFileInput.addEventListener('change', (e) => handleImportFile(e.target.files[0]));
  }

  async function init() {
    renderDate();
    bindEvents();
    bindKanbanDragEvents();
    await applyAllSettings();
    await refreshDashboard();
    await checkCarryOver();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

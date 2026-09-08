// SettingsService: user preferences + background image + backup import/export.
const DEFAULT_SETTINGS = {
  name: 'Friend',
  theme: 'auto', // auto | dark | light
  glassBlur: 24,
  glassOpacity: 12, // percent
  overlayDarkness: 35, // percent
  bgBlur: 0,
  bgOpacity: 100,
  bgFit: 'cover', // cover | center | fixed
  showGreeting: true,
  showProgress: true,
  carryOver: true,
};

const SettingsService = {
  async get() {
    const stored = await StorageService.get('settings');
    return { ...DEFAULT_SETTINGS, ...(stored || {}) };
  },

  async update(partial) {
    const current = await this.get();
    const next = { ...current, ...partial };
    await StorageService.set('settings', next);
    return next;
  },

  async getBackgroundImage() {
    return (await StorageService.get('backgroundImage')) || null;
  },

  // Returns { ok: true } or { ok: false, error }
  async setBackgroundImage(dataUrl) {
    try {
      await StorageService.set('backgroundImage', dataUrl);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  },

  async removeBackgroundImage() {
    await StorageService.remove('backgroundImage');
  },

  async exportData() {
    const [settings, dailyData, backgroundImage, meta] = await Promise.all([
      StorageService.get('settings'),
      StorageService.get('dailyData'),
      StorageService.get('backgroundImage'),
      StorageService.get('meta'),
    ]);
    return {
      app: 'daily-command',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings || DEFAULT_SETTINGS,
      dailyData: dailyData || {},
      backgroundImage: backgroundImage || null,
      meta: meta || {},
    };
  },

  validateBackup(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.app !== 'daily-command') return false;
    if (typeof data.dailyData !== 'object' || data.dailyData === null) return false;
    if (typeof data.settings !== 'object' || data.settings === null) return false;
    for (const [key, day] of Object.entries(data.dailyData)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
      if (typeof day.focus !== 'string' || !Array.isArray(day.tasks)) return false;
    }
    return true;
  },

  // Returns { ok: true } or { ok: false, error }. Never touches storage on failure.
  async importData(data) {
    if (!this.validateBackup(data)) {
      return { ok: false, error: 'Invalid backup file.' };
    }
    try {
      await StorageService.setAll({
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        dailyData: data.dailyData,
        backgroundImage: data.backgroundImage || null,
        meta: data.meta || {},
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  },
};

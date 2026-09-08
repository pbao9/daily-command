import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  name: 'Friend',
  theme: 'auto',
  backgroundOverlay: 35,
  glassBlur: 24,
  glassOpacity: 12,
  carryOverTasks: true,
  showGreeting: true,
  showProgress: true,
  taskView: 'list',
};

const SETTINGS_KEY = 'settings';

interface UseSettingsResult {
  settings: Settings;
  loading: boolean;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  replaceSettings: (next: Settings) => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storage.get<Settings>(SETTINGS_KEY).then((stored) => {
      if (cancelled) return;
      setSettings({ ...DEFAULT_SETTINGS, ...stored });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      void storage.set(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  const replaceSettings = useCallback(async (next: Settings) => {
    await storage.set(SETTINGS_KEY, next);
    setSettings(next);
  }, []);

  return { settings, loading, updateSettings, replaceSettings };
}

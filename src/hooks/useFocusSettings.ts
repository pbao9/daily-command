import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_FOCUS_SETTINGS, addDomain, getFocusSettings, removeDomain, resetDomains, updateFocusSettings } from '../services/focus';
import type { FocusSettings } from '../types';

/** Drives the Focus Mode section of the Settings modal. */
export function useFocusSettings() {
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setSettings(await getFocusSettings());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    settings,
    loading,
    addDomain: async (raw: string) => {
      const next = await addDomain(raw);
      if (next) setSettings(next);
      return next !== null;
    },
    removeDomain: async (domain: string) => setSettings(await removeDomain(domain)),
    resetDomains: async () => setSettings(await resetDomains()),
    setDuration: async (minutes: number) => setSettings(await updateFocusSettings({ focusDurationMinutes: minutes })),
    setRestoreOnRestart: async (value: boolean) => setSettings(await updateFocusSettings({ restoreOnRestart: value })),
  };
}

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_FOCUS_SETTINGS,
  DEFAULT_FOCUS_STATE,
  DEFAULT_FOCUS_STATS,
  DEFAULT_FOCUS_STREAK,
  getFocusSettings,
  getFocusState,
  getFocusStats,
  getFocusStreak,
  remainingMs,
  startFocus,
  stopFocus,
} from '../services/focus';
import type { FocusSettings, FocusState, FocusStats, FocusStreak } from '../types';

const WATCHED_KEYS = ['focusState', 'focusSettings', 'focusStreak', 'focusStats'];

/** Drives the popup: current session, live countdown, streak, and focused-minutes stats. */
export function useFocusMode() {
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS);
  const [state, setState] = useState<FocusState>(DEFAULT_FOCUS_STATE);
  const [streak, setStreak] = useState<FocusStreak>(DEFAULT_FOCUS_STREAK);
  const [stats, setStats] = useState<FocusStats>(DEFAULT_FOCUS_STATS);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, f, st, stt] = await Promise.all([getFocusSettings(), getFocusState(), getFocusStreak(), getFocusStats()]);
    setSettings(s);
    setState(f);
    setStreak(st);
    setStats(stt);
    setRemaining(remainingMs(f));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && WATCHED_KEYS.some((key) => key in changes)) void refresh();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [refresh]);

  // Timer refresh only — remaining time is always derived from
  // startedAt + duration - Date.now(), never decremented directly.
  useEffect(() => {
    if (!state.active) return;
    const id = setInterval(() => {
      const ms = remainingMs(state);
      setRemaining(ms);
      if (ms <= 0) void refresh();
    }, 1000);
    return () => clearInterval(id);
  }, [state, refresh]);

  return {
    settings,
    state,
    streak,
    stats,
    remaining,
    loading,
    start: async () => {
      await startFocus();
      await refresh();
    },
    stop: async () => {
      await stopFocus(false);
      await refresh();
    },
  };
}

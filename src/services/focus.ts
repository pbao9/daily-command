// Focus Mode: blocks distracting sites for a timed session using
// declarativeNetRequest. Callable from any extension context (popup,
// settings UI, background service worker) — DNR and storage APIs work
// the same everywhere, so there's no message-passing layer.
import type { FocusSettings, FocusState, FocusStats, FocusStreak } from '../types';
import { storage } from './storage';

export const DEFAULT_BLOCKED_DOMAINS = [
  'threads.net',
  'tiktok.com',
  'facebook.com',
  'messenger.com',
  'x.com',
  'twitter.com',
  'youtube.com',
  'reddit.com',
];

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  focusDurationMinutes: 45,
  blockedDomains: DEFAULT_BLOCKED_DOMAINS,
  restoreOnRestart: true,
};

export const DEFAULT_FOCUS_STATE: FocusState = {
  active: false,
  startedAt: null,
  duration: null,
};

export const DEFAULT_FOCUS_STREAK: FocusStreak = { count: 0, lastDate: null };

export const DEFAULT_FOCUS_STATS: FocusStats = { totalMinutes: 0, todayMinutes: 0, todayDate: null };

export async function getFocusSettings(): Promise<FocusSettings> {
  return (await storage.get<FocusSettings>('focusSettings')) ?? DEFAULT_FOCUS_SETTINGS;
}

export async function getFocusState(): Promise<FocusState> {
  return (await storage.get<FocusState>('focusState')) ?? DEFAULT_FOCUS_STATE;
}

export async function getFocusStreak(): Promise<FocusStreak> {
  return (await storage.get<FocusStreak>('focusStreak')) ?? DEFAULT_FOCUS_STREAK;
}

export async function getFocusStats(): Promise<FocusStats> {
  return (await storage.get<FocusStats>('focusStats')) ?? DEFAULT_FOCUS_STATS;
}

// Accepts "facebook.com", "https://facebook.com", "www.facebook.com",
// "https://www.facebook.com/path" and returns the bare registrable host.
export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;
  if (!/^https?:\/\//.test(value)) value = 'http://' + value;
  let host: string;
  try {
    host = new URL(value).hostname;
  } catch {
    return null;
  }
  host = host.replace(/^www\./, '');
  return host || null;
}

export function remainingMs(state: FocusState): number {
  if (!state.active || state.startedAt === null || state.duration === null) return 0;
  return Math.max(0, state.startedAt + state.duration - Date.now());
}

export function formatMMSS(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function todayStr(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function isYesterday(dateStr: string, today: string): boolean {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return dateStr === todayStr(d);
}

// One declarativeNetRequest rule per domain via requestDomains, which
// already matches subdomains with a suffix boundary (facebook.com blocks
// www.facebook.com but not notfacebook.com or facebook.com.evil.com).
async function applyBlockingRules(enabled: boolean, domains: string[]): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules: chrome.declarativeNetRequest.Rule[] = enabled
    ? domains.map((domain, i) => ({
        id: i + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: { extensionPath: '/blocked.html' },
        },
        condition: {
          requestDomains: [domain],
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      }))
    : [];

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

async function refreshBlockingRules(): Promise<void> {
  const [state, settings] = await Promise.all([getFocusState(), getFocusSettings()]);
  await applyBlockingRules(state.active, settings.blockedDomains);
}

export async function startFocus(): Promise<void> {
  const settings = await getFocusSettings();
  const state: FocusState = {
    active: true,
    startedAt: Date.now(),
    duration: settings.focusDurationMinutes * 60 * 1000,
  };
  await storage.set('focusState', state);
  await applyBlockingRules(true, settings.blockedDomains);
  chrome.alarms.create('focus-check', { periodInMinutes: 0.5 });
}

async function bumpStreak(): Promise<void> {
  const streak = await getFocusStreak();
  const today = todayStr();
  if (streak.lastDate === today) return; // already counted today
  const count = streak.lastDate && isYesterday(streak.lastDate, today) ? streak.count + 1 : 1;
  await storage.set<FocusStreak>('focusStreak', { count, lastDate: today });
}

// Counts actual time spent focused, whether the session ran to completion or
// was stopped early — the minutes were still spent away from blocked sites.
async function recordFocusMinutes(elapsedMs: number): Promise<void> {
  const minutes = Math.round(elapsedMs / 60000);
  if (minutes <= 0) return;
  const stats = await getFocusStats();
  const today = todayStr();
  const todayMinutes = stats.todayDate === today ? stats.todayMinutes + minutes : minutes;
  await storage.set<FocusStats>('focusStats', {
    totalMinutes: stats.totalMinutes + minutes,
    todayMinutes,
    todayDate: today,
  });
}

export async function stopFocus(completed: boolean): Promise<void> {
  const state = await getFocusState();
  if (state.active && state.startedAt !== null && state.duration !== null) {
    await recordFocusMinutes(Math.min(state.duration, Date.now() - state.startedAt));
  }

  await storage.set('focusState', DEFAULT_FOCUS_STATE);
  await applyBlockingRules(false, []);
  chrome.alarms.clear('focus-check');
  if (completed) {
    await bumpStreak();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Focus complete 🎉',
      message: 'Your focus session is complete. Take a short break before starting again.',
    });
  }
}

export async function checkExpiry(): Promise<void> {
  const state = await getFocusState();
  if (state.active && remainingMs(state) <= 0) await stopFocus(true);
}

export async function restoreOnStartup(): Promise<void> {
  const [state, settings] = await Promise.all([getFocusState(), getFocusSettings()]);
  if (!state.active) return;

  if (remainingMs(state) <= 0) {
    await stopFocus(true);
    return;
  }

  if (settings.restoreOnRestart) {
    await applyBlockingRules(true, settings.blockedDomains);
    chrome.alarms.create('focus-check', { periodInMinutes: 0.5 });
  } else {
    await stopFocus(false);
  }
}

export async function addDomain(rawInput: string): Promise<FocusSettings | null> {
  const domain = normalizeDomain(rawInput);
  if (!domain) return null;
  const settings = await getFocusSettings();
  if (!settings.blockedDomains.includes(domain)) {
    settings.blockedDomains = [...settings.blockedDomains, domain];
    await storage.set('focusSettings', settings);
    await refreshBlockingRules();
  }
  return settings;
}

export async function removeDomain(domain: string): Promise<FocusSettings> {
  const settings = await getFocusSettings();
  settings.blockedDomains = settings.blockedDomains.filter((d) => d !== domain);
  await storage.set('focusSettings', settings);
  await refreshBlockingRules();
  return settings;
}

export async function resetDomains(): Promise<FocusSettings> {
  const settings = await getFocusSettings();
  settings.blockedDomains = [...DEFAULT_BLOCKED_DOMAINS];
  await storage.set('focusSettings', settings);
  await refreshBlockingRules();
  return settings;
}

export async function updateFocusSettings(partial: Partial<FocusSettings>): Promise<FocusSettings> {
  const settings = { ...(await getFocusSettings()), ...partial };
  await storage.set('focusSettings', settings);
  await refreshBlockingRules();
  return settings;
}

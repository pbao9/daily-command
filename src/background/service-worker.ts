import {
  DEFAULT_FOCUS_SETTINGS,
  DEFAULT_FOCUS_STATE,
  DEFAULT_FOCUS_STATS,
  DEFAULT_FOCUS_STREAK,
  checkExpiry,
  restoreOnStartup,
} from '../services/focus';
import { storage } from '../services/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') return;
  await storage.set('focusSettings', DEFAULT_FOCUS_SETTINGS);
  await storage.set('focusState', DEFAULT_FOCUS_STATE);
  await storage.set('focusStreak', DEFAULT_FOCUS_STREAK);
  await storage.set('focusStats', DEFAULT_FOCUS_STATS);
});

chrome.runtime.onStartup.addListener(restoreOnStartup);
void restoreOnStartup();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focus-check') void checkExpiry();
});

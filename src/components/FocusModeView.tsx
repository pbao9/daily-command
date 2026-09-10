import { useState } from 'react';
import { useFocusMode } from '../hooks/useFocusMode';
import { formatMMSS } from '../services/focus';
import { FlameIcon } from './icons';

/** Core Start/Stop Focus UI, shared by the toolbar popup and the dashboard modal. */
export function FocusModeView() {
  const { settings, state, streak, remaining, loading, start, stop } = useFocusMode();
  const [confirmingStop, setConfirmingStop] = useState(false);

  if (loading) return null;

  const siteCount = settings.blockedDomains.length;
  const progress = state.active && state.duration ? Math.min(1, Math.max(0, 1 - remaining / state.duration)) : 0;

  return (
    <div className="flex w-full flex-col items-center gap-1 text-center text-slate-100">
      <h2 className="text-xs font-bold tracking-[0.2em] text-slate-400">FOCUS MODE</h2>

      {streak.count > 0 && (
        <p className="flex items-center gap-1 text-sm text-amber-400">
          <FlameIcon className="size-4" /> {streak.count} day streak
        </p>
      )}

      {state.active ? (
        <>
          <div className="mt-3 mb-1 font-mono text-5xl font-bold tabular-nums">{formatMMSS(remaining)}</div>
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mb-5 flex items-center gap-2 text-sm text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400" /> Focus Active
          </p>
          <p className="mb-6 text-sm leading-snug text-slate-400">
            {siteCount} distracting sites
            <br />
            are blocked
          </p>
          <button
            onClick={() => setConfirmingStop(true)}
            className="w-full rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-100 hover:bg-slate-700"
          >
            Stop Focus
          </button>
        </>
      ) : (
        <>
          <p className="mt-4 mb-2 text-base text-slate-300">Ready to focus?</p>
          <div className="mb-6 text-4xl font-bold">{settings.focusDurationMinutes} minutes</div>
          <button
            onClick={() => void start()}
            className="w-full rounded-xl bg-indigo-500 py-3.5 font-semibold text-white hover:bg-indigo-600"
          >
            Start Focus
          </button>
          <p className="mt-5 mb-1 text-sm text-slate-400">{siteCount} sites blocked</p>
        </>
      )}

      {confirmingStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[85%] max-w-xs rounded-xl bg-slate-800 p-5 text-center">
            <p className="mb-2 font-bold">Stop focusing?</p>
            <p className="mb-5 text-sm text-slate-400">Your focus session is still running.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setConfirmingStop(false)}
                className="rounded-lg bg-slate-700 py-2.5 font-semibold hover:bg-slate-600"
              >
                Keep Focusing
              </button>
              <button
                onClick={() => {
                  setConfirmingStop(false);
                  void stop();
                }}
                className="rounded-lg bg-red-500 py-2.5 font-semibold text-white hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

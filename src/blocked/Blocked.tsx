import { useEffect, useState } from 'react';
import { TargetIcon } from '../components/icons';
import { formatMMSS, getFocusState, remainingMs } from '../services/focus';
import type { FocusState } from '../types';

export function Blocked() {
  const [state, setState] = useState<FocusState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const s = await getFocusState();
      if (!cancelled) setState(s);
    };
    void tick();
    const id = setInterval(() => void tick(), 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const remaining = state ? remainingMs(state) : null;
  const progress = state?.duration ? Math.min(1, Math.max(0, 1 - (remaining ?? 0) / state.duration)) : 0;

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-1 bg-slate-950 px-10 text-center text-slate-100">
      <TargetIcon className="mb-3 size-12 text-indigo-400" />
      <h1 className="mb-3 text-2xl font-bold">Stay Focused</h1>
      <p className="mb-8 max-w-xs text-sm text-slate-400">This website is blocked during your focus session.</p>
      <div className="font-mono text-4xl font-bold tabular-nums">{remaining === null ? '--:--' : formatMMSS(remaining)}</div>
      <div className="mt-2 mb-1 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-indigo-400 transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mb-8 text-xs tracking-widest text-slate-500 uppercase">remaining</div>
      <button
        onClick={() => history.back()}
        className="rounded-xl bg-indigo-500 px-7 py-3 font-semibold text-white hover:bg-indigo-600"
      >
        Go Back
      </button>
    </main>
  );
}

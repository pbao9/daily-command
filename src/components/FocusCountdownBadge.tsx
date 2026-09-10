import { useFocusMode } from '../hooks/useFocusMode';
import { formatMMSS } from '../services/focus';
import { TargetIcon } from './icons';

interface FocusCountdownBadgeProps {
  onOpen: () => void;
  glassBlur: number;
  glassOpacity: number;
}

/** Persistent "focus session is running" indicator, always visible on the New Tab dashboard. */
export function FocusCountdownBadge({ onOpen, glassBlur, glassOpacity }: FocusCountdownBadgeProps) {
  const { state, remaining } = useFocusMode();

  if (!state.active || !state.duration) return null;

  const progress = Math.min(1, Math.max(0, 1 - remaining / state.duration));

  return (
    <button
      onClick={onOpen}
      aria-label={`Focus session active, ${formatMMSS(remaining)} remaining`}
      className="fixed top-5 left-5 z-30 flex items-center gap-2 rounded-field border border-white/15 px-3 py-2 text-white shadow-lg transition-transform hover:scale-105"
      style={{
        backdropFilter: `blur(${glassBlur}px)`,
        WebkitBackdropFilter: `blur(${glassBlur}px)`,
        backgroundColor: `rgba(15, 23, 42, ${Math.max(glassOpacity, 40) / 100})`,
      }}
    >
      <TargetIcon className="size-4 text-emerald-400" />
      <span className="font-mono text-sm font-semibold tabular-nums">{formatMMSS(remaining)}</span>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-white/20">
        <span className="block h-full rounded-full bg-emerald-400" style={{ width: `${progress * 100}%` }} />
      </span>
    </button>
  );
}

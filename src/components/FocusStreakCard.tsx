import { useFocusMode } from '../hooks/useFocusMode';
import { todayStr } from '../services/focus';
import { CheckCircleIcon, FlameIcon, TargetIcon } from './icons';

/** Shows the current focus streak, today's/total focused minutes, and today's status. */
export function FocusStreakCard() {
  const { streak, stats, state, loading } = useFocusMode();

  if (loading) return null;

  const completedToday = streak.lastDate === todayStr();
  const todayMinutes = stats.todayDate === todayStr() ? stats.todayMinutes : 0;

  return (
    <section className="flex flex-col gap-3 text-left">
      <span className="text-xs font-semibold tracking-wide text-white uppercase">Focus Streak</span>

      <div className="flex items-center gap-3 rounded-field bg-white/10 p-4">
        <FlameIcon className="size-8 shrink-0 text-amber-400" />
        <div>
          <div className="text-2xl font-bold text-white">{streak.count}</div>
          <div className="text-xs text-white/70">day{streak.count === 1 ? '' : 's'} in a row</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-field bg-white/10 px-4 py-2 text-xs text-white/70">
        <span>Today</span>
        <span className="font-semibold text-white">{todayMinutes} min</span>
      </div>
      <div className="flex items-center justify-between rounded-field bg-white/10 px-4 py-2 text-xs text-white/70">
        <span>Total focused</span>
        <span className="font-semibold text-white">{stats.totalMinutes} min</span>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-white/70">
        {completedToday ? (
          <>
            <CheckCircleIcon className="size-3.5 text-emerald-400" /> Focus completed today
          </>
        ) : state.active ? (
          <>
            <TargetIcon className="size-3.5 text-indigo-300" /> Focus session in progress
          </>
        ) : (
          'No completed focus session today yet'
        )}
      </p>
    </section>
  );
}

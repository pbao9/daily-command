import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { AllDailyData, Category, DailyData, Meta, Priority, Subtask, Task } from '../types';
import { dateKeyOffset, todayKey } from '../utils/date';

const DAILY_DATA_KEY = 'dailyData';
const META_KEY = 'meta';

function emptyDay(date: string): DailyData {
  return { date, focus: '', tasks: [] };
}

// Legacy priority labels (pre P0/P1/P2 scheme), kept only for migration.
const LEGACY_PRIORITY_MAP: Record<string, Priority> = { high: 'P0', medium: 'P1', low: 'P2' };

// Fills in fields added after the original release so older stored tasks
// (no description/subtasks, legacy priority labels) still work without a
// manual migration step.
function normalizeTask(task: Task): Task {
  return {
    ...task,
    description: task.description ?? '',
    subtasks: task.subtasks ?? [],
    priority: LEGACY_PRIORITY_MAP[task.priority as string] ?? task.priority,
  };
}

async function readAllDailyData(): Promise<AllDailyData> {
  const all = (await storage.get<AllDailyData>(DAILY_DATA_KEY)) ?? {};
  for (const day of Object.values(all)) {
    day.tasks = day.tasks.map(normalizeTask);
  }
  return all;
}

interface NewTaskInput {
  title: string;
  priority: Priority;
  category: Category;
  description: string;
  subtasks: Subtask[];
  deadline?: string;
}

interface UseDailyDataResult {
  today: string;
  tomorrow: string;
  data: DailyData;
  loading: boolean;
  setFocus: (focus: string) => Promise<void>;
  clearFocus: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<void>;
  addTaskToDate: (dateKey: string, input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, changes: Partial<Omit<Task, 'id'>>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  pendingCarryOver: Task[];
  applyCarryOver: () => Promise<void>;
  dismissCarryOver: () => Promise<void>;
}

export function useDailyData(): UseDailyDataResult {
  const [today] = useState(todayKey());
  const tomorrow = dateKeyOffset(today, 1);
  const [data, setData] = useState<DailyData>(emptyDay(today));
  const [loading, setLoading] = useState(true);
  const [pendingCarryOver, setPendingCarryOver] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await readAllDailyData();
      const meta = (await storage.get<Meta>(META_KEY)) ?? {};
      if (cancelled) return;

      setData(all[today] ?? emptyDay(today));
      setLoading(false);

      const alreadyHandled = meta.carryOverHandledDate === today;
      const todayHasData = Boolean(all[today]);
      if (!alreadyHandled && !todayHasData) {
        const yesterdayKey = dateKeyOffset(today, -1);
        const yesterday = all[yesterdayKey];
        const unfinished = yesterday?.tasks.filter((t) => !t.completed) ?? [];
        setPendingCarryOver(unfinished);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  const persist = useCallback(
    async (next: DailyData) => {
      const all = await readAllDailyData();
      all[today] = next;
      await storage.set(DAILY_DATA_KEY, all);
      setData(next);
    },
    [today],
  );

  const setFocus = useCallback(
    async (focus: string) => {
      await persist({ ...data, focus: focus.trim() });
    },
    [data, persist],
  );

  const clearFocus = useCallback(async () => {
    await persist({ ...data, focus: '' });
  }, [data, persist]);

  // Adds a task to any date's bucket (used for "add for tomorrow"). Only
  // updates the live `data` state when writing to today, since that's the
  // only day rendered on the dashboard.
  const addTaskToDate = useCallback(
    async (dateKey: string, { title, priority, category, description, subtasks, deadline }: NewTaskInput) => {
      const task: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        priority,
        category,
        description,
        subtasks,
        deadline,
        createdAt: new Date().toISOString(),
      };
      const all = await readAllDailyData();
      const day = all[dateKey] ?? emptyDay(dateKey);
      const nextDay = { ...day, tasks: [...day.tasks, task] };
      all[dateKey] = nextDay;
      await storage.set(DAILY_DATA_KEY, all);
      if (dateKey === today) setData(nextDay);
    },
    [today],
  );

  const addTask = useCallback(
    async (input: NewTaskInput) => {
      await addTaskToDate(today, input);
    },
    [addTaskToDate, today],
  );

  const updateTask = useCallback(
    async (id: string, changes: Partial<Omit<Task, 'id'>>) => {
      const tasks = data.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));
      await persist({ ...data, tasks });
    },
    [data, persist],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const tasks = data.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      await persist({ ...data, tasks });
    },
    [data, persist],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const tasks = data.tasks.filter((t) => t.id !== id);
      await persist({ ...data, tasks });
    },
    [data, persist],
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const tasks = data.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) }
          : t,
      );
      await persist({ ...data, tasks });
    },
    [data, persist],
  );

  const markCarryOverHandled = useCallback(async () => {
    await storage.set<Meta>(META_KEY, { carryOverHandledDate: today });
    setPendingCarryOver([]);
  }, [today]);

  const applyCarryOver = useCallback(async () => {
    const carried: Task[] = pendingCarryOver.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      completed: false,
      priority: t.priority,
      category: t.category,
      description: '',
      subtasks: [],
      createdAt: new Date().toISOString(),
    }));
    await persist({ ...data, tasks: [...data.tasks, ...carried] });
    await markCarryOverHandled();
  }, [data, markCarryOverHandled, pendingCarryOver, persist]);

  const dismissCarryOver = useCallback(async () => {
    await markCarryOverHandled();
  }, [markCarryOverHandled]);

  return {
    today,
    tomorrow,
    data,
    loading,
    setFocus,
    clearFocus,
    addTask,
    addTaskToDate,
    updateTask,
    toggleTask,
    deleteTask,
    toggleSubtask,
    pendingCarryOver,
    applyCarryOver,
    dismissCarryOver,
  };
}

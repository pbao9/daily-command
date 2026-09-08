import { Button } from '@heroui/react';
import type { Task, TaskView } from '../types';
import { AddIcon, GridViewIcon, ListViewIcon, SparklesIcon } from './icons';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}

const PRIORITY_ORDER: Record<Task['priority'], number> = { P0: 0, P1: 1, P2: 2 };

export function TaskList({ tasks, view, onViewChange, onToggle, onToggleSubtask, onEdit, onDelete, onAddTask }: TaskListProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });

  return (
    <section className="flex flex-col gap-3 text-left">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">Tasks</span>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-xs text-muted">
              {completed} / {total} completed
            </span>
          )}
          <div className="flex gap-0.5">
            <Button
              isIconOnly
              size="sm"
              variant={view === 'list' ? 'secondary' : 'ghost'}
              aria-label="List view"
              aria-pressed={view === 'list'}
              onPress={() => onViewChange('list')}
            >
              <ListViewIcon className="size-3.5" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onPress={() => onViewChange('grid')}
            >
              <GridViewIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-5 text-center text-muted">
          <p className="text-base font-semibold text-foreground">Nothing planned yet.</p>
          <p className="text-sm">What matters today?</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {completed === total && (
            <div className="flex items-center justify-center gap-2 py-1 text-center text-muted">
              <SparklesIcon className="size-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Everything done. Nice work.</p>
            </div>
          )}
          <div className={view === 'grid' ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2'}>
            {sorted.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onToggleSubtask={onToggleSubtask}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" fullWidth onPress={onAddTask}>
        <AddIcon className="size-4" />
        Add Task
      </Button>
    </section>
  );
}

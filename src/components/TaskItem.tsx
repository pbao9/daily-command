import { Button, Card, Checkbox } from '@heroui/react';
import type { Task } from '../types';
import { daysUntil, formatDeadline, isDeadlineUrgent } from '../utils/date';
import { DeleteIcon, EditIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_LABEL: Record<Task['category'], string> = {
  work: 'Work',
  learning: 'Learning',
  personal: 'Personal',
  other: 'Other',
};

const PRIORITY_BADGE: Record<Task['priority'], string> = {
  P0: 'bg-danger-soft text-danger-soft-foreground',
  P1: 'bg-warning-soft text-warning-soft-foreground',
  P2: 'bg-default-soft text-default-soft-foreground',
};

function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').trim();
}

export function TaskItem({ task, onToggle, onToggleSubtask, onEdit, onDelete }: TaskItemProps) {
  const descriptionPreview = task.description ? htmlToPlainText(task.description) : '';
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;

  const urgent = !task.completed && Boolean(task.deadline) && isDeadlineUrgent(task.deadline!);
  const deadlineDays = task.deadline ? daysUntil(task.deadline) : null;

  return (
    <Card
      className={`w-full flex-col gap-2 ${
        urgent ? 'border-danger bg-danger-soft/40' : task.priority === 'P0' ? 'border-danger/40' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Checkbox isSelected={task.completed} onChange={() => onToggle(task.id)} aria-label={`Mark "${task.title}" as completed`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Content>
        </Checkbox>

        <span className={`min-w-0 flex-1 truncate text-sm ${task.completed ? 'text-muted line-through' : 'text-foreground'}`}>
          {task.title}
        </span>

        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority}
        </span>
        <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground uppercase">
          {CATEGORY_LABEL[task.category]}
        </span>

        {task.deadline && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              urgent ? 'bg-danger text-danger-foreground' : 'bg-default-soft text-default-soft-foreground'
            }`}
          >
            {deadlineDays !== null && deadlineDays < 0
              ? `Overdue ${formatDeadline(task.deadline)}`
              : `Due ${formatDeadline(task.deadline)}`}
          </span>
        )}

        <div className="flex gap-1">
          <Button isIconOnly size="sm" variant="ghost" aria-label={`Edit "${task.title}"`} onPress={() => onEdit(task)}>
            <EditIcon className="size-4" />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label={`Delete "${task.title}"`} onPress={() => onDelete(task.id)}>
            <DeleteIcon className="size-4" />
          </Button>
        </div>
      </div>

      {descriptionPreview && <p className="truncate pl-8 text-xs text-muted">{descriptionPreview}</p>}

      {task.subtasks.length > 0 && (
        <div className="flex flex-col gap-1 pl-8">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Checklist · {subtaskDone}/{task.subtasks.length}
          </span>
          <ul className="flex flex-col gap-1">
            {task.subtasks.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <Checkbox isSelected={s.completed} onChange={() => onToggleSubtask(task.id, s.id)} aria-label={s.title}>
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Content>
                </Checkbox>
                <span className={`text-xs ${s.completed ? 'text-muted line-through' : 'text-foreground'}`}>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

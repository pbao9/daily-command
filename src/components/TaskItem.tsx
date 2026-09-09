import { Button, Card, Checkbox, Dropdown } from '@heroui/react';
import type { Key } from 'react-aria-components';
import type { Project, Task } from '../types';
import { daysUntil, formatDeadline, isDeadlineUrgent } from '../utils/date';
import { htmlToPlainText } from '../utils/html';
import { DeleteIcon, EditIcon, SettingsIcon } from './icons';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (task: Task) => void;
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

const PROJECT_DOT_COLOR: Record<string, string> = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
};

export function TaskItem({ task, project, onToggle, onToggleSubtask, onEdit, onDelete, onOpenDetail }: TaskItemProps) {
  const descriptionPreview = task.description ? htmlToPlainText(task.description) : '';
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;

  const urgent = !task.completed && Boolean(task.deadline) && isDeadlineUrgent(task.deadline!);
  const deadlineDays = task.deadline ? daysUntil(task.deadline) : null;

  return (
    <Card
      className={`w-full cursor-pointer flex-col gap-2 ${
        urgent ? 'border-danger bg-danger-soft/40' : task.priority === 'P0' ? 'border-danger/40' : ''
      }`}
      onClick={() => onOpenDetail(task)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox isSelected={task.completed} onChange={() => onToggle(task.id)} aria-label={`Mark "${task.title}" as completed`}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
        </span>

        <span className={`min-w-0 flex-1 truncate text-sm ${task.completed ? 'text-white line-through' : 'text-white'}`}>
          {task.title}
        </span>

        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority}
        </span>
        <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground uppercase">
          {CATEGORY_LABEL[task.category]}
        </span>

        {project && (
          <span className="flex items-center gap-1 rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: PROJECT_DOT_COLOR[project.color] ?? PROJECT_DOT_COLOR.blue }}
              aria-hidden="true"
            />
            {project.name}
          </span>
        )}

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

        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown>
            <Dropdown.Trigger>
              <Button isIconOnly size="sm" variant="ghost" aria-label={`Actions for "${task.title}"`}>
                <SettingsIcon className="size-3.5" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                onAction={(key: Key) => {
                  if (key === 'edit') onEdit(task);
                  if (key === 'delete') onDelete(task.id);
                }}
              >
                <Dropdown.Item id="edit" textValue="Edit">
                  <EditIcon className="size-3.5" />
                  Edit
                </Dropdown.Item>
                <Dropdown.Item id="delete" textValue="Delete">
                  <DeleteIcon className="size-3.5" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </span>
      </div>

      {descriptionPreview && <p className="truncate pl-8 text-xs text-white">{descriptionPreview}</p>}

      {task.subtasks.length > 0 && (
        <div className="flex flex-col gap-1 pl-8" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] font-semibold tracking-wide text-white uppercase">
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
                <span className={`text-xs ${s.completed ? 'text-white line-through' : 'text-white'}`}>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

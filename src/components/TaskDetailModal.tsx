import { Button, Checkbox, Modal } from '@heroui/react';
import type { Project, Task } from '../types';
import { daysUntil, formatDeadline } from '../utils/date';
import { CloseIcon, DeleteIcon, EditIcon } from './icons';

interface TaskDetailModalProps {
  open: boolean;
  task: Task | null;
  project?: Project;
  onClose: () => void;
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

export function TaskDetailModal({
  open,
  task,
  project,
  onClose,
  onToggle,
  onToggleSubtask,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  if (!task) return null;
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const deadlineDays = task.deadline ? daysUntil(task.deadline) : null;

  return (
    <Modal.Backdrop
      variant="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger>
            <CloseIcon className="size-4" />
          </Modal.CloseTrigger>
          <Modal.Header>
            <Modal.Heading className={task.completed ? 'line-through' : ''}>{task.title}</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground">
                {task.priority}
              </span>
              <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground uppercase">
                {CATEGORY_LABEL[task.category]}
              </span>
              {project && (
                <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground">
                  {project.name}
                </span>
              )}
              {task.deadline && (
                <span className="rounded-full bg-default-soft px-2 py-0.5 text-[11px] font-semibold text-default-soft-foreground">
                  {deadlineDays !== null && deadlineDays < 0
                    ? `Overdue ${formatDeadline(task.deadline)}`
                    : `Due ${formatDeadline(task.deadline)}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox isSelected={task.completed} onChange={() => onToggle(task.id)} aria-label="Mark task as completed">
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Content>
              </Checkbox>
              <span className="text-sm text-white">Completed</span>
            </div>

            {task.description && (
              <div
                className="prose prose-sm max-w-none text-sm text-white"
                // Content is authored locally through the app's own rich text editor.
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}

            {task.subtasks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold tracking-wide text-white uppercase">
                  Checklist · {subtaskDone}/{task.subtasks.length}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {task.subtasks.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <Checkbox isSelected={s.completed} onChange={() => onToggleSubtask(task.id, s.id)} aria-label={s.title}>
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Content>
                      </Checkbox>
                      <span className={`text-sm ${s.completed ? 'text-white line-through' : 'text-white'}`}>{s.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onPress={() => {
                onDelete(task.id);
                onClose();
              }}
            >
              <DeleteIcon className="size-4" />
              Delete
            </Button>
            <Button
              onPress={() => {
                onEdit(task);
                onClose();
              }}
            >
              <EditIcon className="size-4" />
              Edit
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

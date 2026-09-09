import { Button, Checkbox, Modal } from '@heroui/react';
import type { Task } from '../types';
import { CloseIcon } from './icons';

interface TodayReminderModalProps {
  open: boolean;
  tasks: Task[];
  onClose: () => void;
  onToggle: (id: string) => void;
}

const PRIORITY_BADGE: Record<Task['priority'], string> = {
  P0: 'bg-danger-soft text-danger-soft-foreground',
  P1: 'bg-warning-soft text-warning-soft-foreground',
  P2: 'bg-default-soft text-default-soft-foreground',
};

export function TodayReminderModal({ open, tasks, onClose, onToggle }: TodayReminderModalProps) {
  return (
    <Modal.Backdrop
      variant="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger>
            <CloseIcon className="size-4" />
          </Modal.CloseTrigger>
          <Modal.Header>
            <Modal.Heading>You still have tasks left today</Modal.Heading>
            <p className="mt-1 text-sm text-white">
              {tasks.length} unfinished task{tasks.length === 1 ? '' : 's'} for today. Please try to complete{' '}
              {tasks.length === 1 ? 'it' : 'them'}.
            </p>
          </Modal.Header>

          <Modal.Body>
            <ul className="flex flex-col gap-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 rounded-xl bg-default-soft/40 px-3 py-2">
                  <Checkbox isSelected={false} onChange={() => onToggle(task.id)} aria-label={`Mark "${task.title}" as completed`}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{task.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[task.priority]}`}>
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          </Modal.Body>

          <Modal.Footer>
            <Button onPress={onClose}>Got it</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

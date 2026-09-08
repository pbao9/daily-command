import { Button, Calendar, Checkbox, DateField, DatePicker, Input, Label, ListBox, Modal, Select, TextField } from '@heroui/react';
import type { DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { useEffect, useState, type KeyboardEvent } from 'react';
import type { Category, Priority, Project, Subtask, Task } from '../types';
import { AddIcon, CloseIcon } from './icons';
import { RichTextEditor } from './RichTextEditor';

const NO_PROJECT = '__none__';

interface AddTaskModalProps {
  open: boolean;
  task: Task | null;
  todayKey: string;
  tomorrowKey: string;
  projects: Project[];
  onCreateProject: (name: string) => Promise<Project>;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    priority: Priority;
    category: Category;
    description: string;
    subtasks: Subtask[];
    deadline?: string;
    projectId?: string;
    targetDate: string;
  }) => void;
}

const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: 'P0', label: 'P0 · Urgent' },
  { id: 'P1', label: 'P1 · High' },
  { id: 'P2', label: 'P2 · Normal' },
];

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'learning', label: 'Learning' },
  { id: 'personal', label: 'Personal' },
  { id: 'other', label: 'Other' },
];

export function AddTaskModal({
  open,
  task,
  todayKey,
  tomorrowKey,
  projects,
  onCreateProject,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P1');
  const [category, setCategory] = useState<Category>('other');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [deadline, setDeadline] = useState<DateValue | null>(null);
  const [targetDate, setTargetDate] = useState(todayKey);
  const [projectId, setProjectId] = useState<string>(NO_PROJECT);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setPriority(task?.priority ?? 'P1');
    setCategory(task?.category ?? 'other');
    setDescription(task?.description ?? '');
    setSubtasks(task?.subtasks ?? []);
    setNewSubtaskTitle('');
    setDeadline(task?.deadline ? parseDate(task.deadline) : null);
    setTargetDate(todayKey);
    setProjectId(task?.projectId ?? NO_PROJECT);
    setNewProjectName('');
  }, [open, task, todayKey]);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const cleanSubtasks = subtasks.map((s) => ({ ...s, title: s.title.trim() })).filter((s) => s.title);
    onSubmit({
      title: trimmed,
      priority,
      category,
      description,
      subtasks: cleanSubtasks,
      deadline: deadline ? deadline.toString() : undefined,
      projectId: projectId === NO_PROJECT ? undefined : projectId,
      targetDate,
    });
  }

  async function createProject() {
    const name = newProjectName.trim();
    if (!name) return;
    const project = await onCreateProject(name);
    setProjectId(project.id);
    setNewProjectName('');
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  function addSubtask() {
    const value = newSubtaskTitle.trim();
    if (!value) return;
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: value, completed: false }]);
    setNewSubtaskTitle('');
  }

  function updateSubtaskTitle(id: string, value: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title: value } : s)));
  }

  function toggleSubtaskDraft(id: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <Modal.Backdrop
      variant="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-xl">
          <Modal.CloseTrigger>
            <CloseIcon className="size-4" />
          </Modal.CloseTrigger>
          <Modal.Header>
            <Modal.Heading>{task ? 'Edit Task' : 'New Task'}</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <TextField name="title" value={title} onChange={setTitle} isRequired>
              <Label>Title</Label>
              <Input autoFocus placeholder="What needs to be done?" maxLength={200} onKeyDown={handleTitleKeyDown} />
            </TextField>

            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Project</Label>
              <Select value={projectId} onChange={(value) => setProjectId(value as string)}>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id={NO_PROJECT} textValue="No project">
                      No project
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {projects.map((p) => (
                      <ListBox.Item key={p.id} id={p.id} textValue={p.name}>
                        {p.name}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <div className="flex gap-2">
                <TextField className="flex-1" value={newProjectName} onChange={setNewProjectName}>
                  <Input
                    placeholder="New project name..."
                    aria-label="New project name"
                    maxLength={60}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      void createProject();
                    }}
                  />
                </TextField>
                <Button variant="secondary" onPress={() => void createProject()}>
                  <AddIcon className="size-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              {!task && (
                <Select className="flex-1" value={targetDate} onChange={(value) => setTargetDate(value as string)}>
                  <Label>Day</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id={todayKey} textValue="Today">
                        Today
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id={tomorrowKey} textValue="Tomorrow">
                        Tomorrow
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}

              <DatePicker className="flex-1" name="deadline" value={deadline} onChange={setDeadline}>
                <Label>Deadline</Label>
                <DateField.Group fullWidth>
                  <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label="Deadline">
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                      <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                      <Calendar.YearPickerGridBody>
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
                      </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
            </div>

            <div className="flex gap-3">
              <Select className="flex-1" value={priority} onChange={(value) => setPriority(value as Priority)}>
                <Label>Priority</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                        {opt.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select className="flex-1" value={category} onChange={(value) => setCategory(value as Category)}>
                <Label>Category</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                        {opt.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Subtasks</Label>
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    isSelected={s.completed}
                    onChange={() => toggleSubtaskDraft(s.id)}
                    aria-label={`Mark "${s.title}" as completed`}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                  <TextField className="flex-1" value={s.title} onChange={(value) => updateSubtaskTitle(s.id, value)}>
                    <Input aria-label="Subtask title" maxLength={200} />
                  </TextField>
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove subtask "${s.title}"`}
                    onPress={() => removeSubtask(s.id)}
                  >
                    <CloseIcon className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <TextField className="flex-1" value={newSubtaskTitle} onChange={setNewSubtaskTitle}>
                  <Input
                    placeholder="Add a subtask..."
                    aria-label="New subtask title"
                    maxLength={200}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      addSubtask();
                    }}
                  />
                </TextField>
                <Button variant="secondary" onPress={addSubtask}>
                  <AddIcon className="size-4" />
                  Add
                </Button>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onPress={onClose}>
              Cancel
            </Button>
            <Button onPress={handleSubmit}>{task ? 'Save' : 'Add Task'}</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

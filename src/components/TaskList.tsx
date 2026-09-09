import {
    Button,
    Calendar,
    DateField,
    DatePicker,
    Dropdown,
    Link,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import type { Key } from "react-aria-components";
import type { DeadlineTask } from "../hooks/useDailyData";
import type { Project, Task, TaskView } from "../types";
import { formatDeadline } from "../utils/date";
import {
    AddIcon,
    GridViewIcon,
    ListViewIcon,
    SettingsIcon,
    SparklesIcon,
} from "./icons";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
    projects: Project[];
    view: TaskView;
    onViewChange: (view: TaskView) => void;
    onToggle: (id: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onAddTask: () => void;
    onOpenDetail: (task: Task) => void;
    /** The day currently being browsed, "YYYY-MM-DD". */
    viewDate: string;
    today: string;
    onViewDateChange: (dateKey: string) => void;
    /** Incomplete tasks with a deadline from every day, for the reminder strip below. */
    deadlineTasks: DeadlineTask[];
    onSelectDeadlineTask: (task: DeadlineTask) => void;
}

const PRIORITY_ORDER: Record<Task["priority"], number> = {
    P0: 0,
    P1: 1,
    P2: 2,
};

export function TaskList({
    tasks,
    projects,
    view,
    onViewChange,
    onToggle,
    onToggleSubtask,
    onEdit,
    onDelete,
    onAddTask,
    onOpenDetail,
    viewDate,
    today,
    onViewDateChange,
    deadlineTasks,
    onSelectDeadlineTask,
}: TaskListProps) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;

    const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

    // Deadline reminders exclude the day already shown in the list above.
    const otherDeadlineTasks = deadlineTasks.filter(
        (t) => t.dateKey !== viewDate,
    );

    return (
        <section className="flex flex-col gap-3 text-left">
            <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold tracking-wide text-white uppercase">
                    Tasks
                </span>
                <Link
                    className="flex items-center justify-center gap-1 py-1 text-sm text-white"
                    onPress={onAddTask}
                >
                    <AddIcon className="size-4" />
                    Add Task
                </Link>
                <div className="flex items-center gap-3">
                    <DatePicker
                        className="w-36"
                        aria-label="View tasks for date"
                        value={parseDate(viewDate)}
                        onChange={(value: DateValue | null) =>
                            value && onViewDateChange(value.toString())
                        }
                    >
                        <DateField.Group fullWidth>
                            <DateField.Input>
                                {(segment) => (
                                    <DateField.Segment segment={segment} />
                                )}
                            </DateField.Input>
                            <DateField.Suffix>
                                <DatePicker.Trigger>
                                    <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                            </DateField.Suffix>
                        </DateField.Group>
                        <DatePicker.Popover>
                            <Calendar aria-label="View tasks for date">
                                <Calendar.Header>
                                    <Calendar.YearPickerTrigger>
                                        <Calendar.YearPickerTriggerHeading />
                                        <Calendar.YearPickerTriggerIndicator />
                                    </Calendar.YearPickerTrigger>
                                    <Calendar.NavButton slot="previous" />
                                    <Calendar.NavButton slot="next" />
                                </Calendar.Header>
                                <Calendar.Grid>
                                    <Calendar.GridHeader>
                                        {(day) => (
                                            <Calendar.HeaderCell>
                                                {day}
                                            </Calendar.HeaderCell>
                                        )}
                                    </Calendar.GridHeader>
                                    <Calendar.GridBody>
                                        {(date) => (
                                            <Calendar.Cell date={date} />
                                        )}
                                    </Calendar.GridBody>
                                </Calendar.Grid>
                                <Calendar.YearPickerGrid>
                                    <Calendar.YearPickerGridBody>
                                        {({ year }) => (
                                            <Calendar.YearPickerCell
                                                year={year}
                                            />
                                        )}
                                    </Calendar.YearPickerGridBody>
                                </Calendar.YearPickerGrid>
                            </Calendar>
                        </DatePicker.Popover>
                    </DatePicker>
                    {viewDate !== today && (
                        <Link
                            className="text-xs text-white"
                            onPress={() => onViewDateChange(today)}
                        >
                            Today
                        </Link>
                    )}
                    {total > 0 && (
                        <span className="text-xs text-white">
                            {completed} / {total} Completed
                        </span>
                    )}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Task view settings"
                            >
                                <SettingsIcon className="size-3.5" />
                            </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu
                                selectionMode="single"
                                selectedKeys={[view]}
                                disallowEmptySelection
                                onAction={(key: Key) =>
                                    onViewChange(key as TaskView)
                                }
                            >
                                <Dropdown.Item id="list" textValue="List view">
                                    <ListViewIcon className="size-3.5" />
                                    List view
                                </Dropdown.Item>
                                <Dropdown.Item id="grid" textValue="Grid view">
                                    <GridViewIcon className="size-3.5" />
                                    Grid view
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>
            </div>

            {otherDeadlineTasks.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-lg border border-danger/40 bg-danger-soft/20 p-2.5">
                    <span className="text-[11px] font-semibold tracking-wide text-white uppercase">
                        Upcoming deadlines
                    </span>
                    <ul className="flex flex-col gap-1">
                        {otherDeadlineTasks.map((t) => (
                            <li key={t.id}>
                                <Link
                                    className="flex w-full items-center justify-between gap-2 text-xs text-white"
                                    onPress={() => onSelectDeadlineTask(t)}
                                >
                                    <span className="truncate">
                                        {t.title}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-danger px-2 py-0.5 text-[10px] font-semibold text-danger-foreground">
                                        {formatDeadline(t.deadline!)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {total === 0 ? (
                <div className="py-5 text-center text-white">
                    <p className="text-base font-semibold text-white">
                        Nothing planned yet.
                    </p>
                    <p className="text-sm">What matters today?</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {completed === total && (
                        <div className="flex items-center justify-center gap-2 py-1 text-center text-white">
                            <SparklesIcon className="size-4 text-accent" />
                            <p className="text-sm font-semibold text-white">
                                Everything done. Nice work.
                            </p>
                        </div>
                    )}
                    <div
                        className={
                            view === "grid"
                                ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
                                : "flex flex-col gap-2"
                        }
                    >
                        {sorted.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                project={projects.find(
                                    (p) => p.id === task.projectId,
                                )}
                                onToggle={onToggle}
                                onToggleSubtask={onToggleSubtask}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onOpenDetail={onOpenDetail}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

import { Button, Card } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { AddTaskModal } from "./components/AddTaskModal";
import { FocusCard } from "./components/FocusCard";
import { Header } from "./components/Header";
import { HistoryModal } from "./components/HistoryModal";
import { Confetti, type ConfettiRef } from "./components/magicui/confetti";
import { NotesSection } from "./components/NotesSection";
import { ProgressCard } from "./components/ProgressCard";
import { QuickActions } from "./components/QuickActions";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TaskList } from "./components/TaskList";
import { TodayReminderModal } from "./components/TodayReminderModal";
import type { DeadlineTask } from "./hooks/useDailyData";
import { useBackground } from "./hooks/useBackground";
import { useDailyData } from "./hooks/useDailyData";
import { useNotes } from "./hooks/useNotes";
import { useProjects } from "./hooks/useProjects";
import { DEFAULT_SETTINGS, useSettings } from "./hooks/useSettings";
import { storage } from "./services/storage";
import type {
    AllDailyData,
    BackupData,
    Category,
    Priority,
    Subtask,
    Task,
} from "./types";
import { todayKey } from "./utils/date";

function validateBackup(data: unknown): data is BackupData {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if (d.app !== "daily-command") return false;
    if (typeof d.settings !== "object" || d.settings === null) return false;
    if (typeof d.dailyData !== "object" || d.dailyData === null) return false;
    for (const [key, value] of Object.entries(
        d.dailyData as Record<string, unknown>,
    )) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
        const day = value as Record<string, unknown>;
        if (typeof day.focus !== "string" || !Array.isArray(day.tasks))
            return false;
    }
    return true;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-lg bg-white/20 ${className}`} />
    );
}

// Mirrors the loaded layout's shell (same Card, same column split) so
// there's no visible jump once real data replaces it.
function AppSkeleton() {
    return (
        <main className="relative z-[2] flex h-screen flex-col items-center justify-center-safe overflow-y-auto px-5 py-8 pb-28">
            <Card className="grid w-full max-w-[1300px] grid-cols-1 items-start gap-4 text-center lg:grid-cols-3">
                <div className="flex flex-col items-center gap-3 lg:col-span-3">
                    <SkeletonBlock className="h-8 w-56" />
                    <SkeletonBlock className="h-4 w-72" />
                </div>
                <div className="flex flex-col gap-3 lg:col-span-2">
                    <SkeletonBlock className="h-32 w-full" />
                    <SkeletonBlock className="h-12 w-full" />
                    <SkeletonBlock className="h-12 w-full" />
                    <SkeletonBlock className="h-12 w-3/4" />
                </div>
                <div className="flex flex-col gap-3">
                    <SkeletonBlock className="h-10 w-full" />
                    <SkeletonBlock className="h-24 w-full" />
                    <SkeletonBlock className="h-24 w-full" />
                </div>
            </Card>
        </main>
    );
}

export default function App() {
    const {
        settings,
        loading: settingsLoading,
        updateSettings,
    } = useSettings();
    const background = useBackground(updateSettings);
    const daily = useDailyData();
    const projects = useProjects();
    const notes = useNotes();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [focusEditSignal, setFocusEditSignal] = useState<number | undefined>(
        undefined,
    );
    const [reminderOpen, setReminderOpen] = useState(false);
    const [detailTask, setDetailTask] = useState<Task | null>(null);
    const reminderShownRef = useRef(false);
    const confettiRef = useRef<ConfettiRef>(null);

    // Once, right after today's data has loaded: if there are unfinished
    // tasks already sitting on today, nudge the user to finish them.
    useEffect(() => {
        if (daily.loading || reminderShownRef.current) return;
        reminderShownRef.current = true;
        if (daily.data.tasks.some((t) => !t.completed)) setReminderOpen(true);
    }, [daily.loading, daily.data]);

    // Keep the open detail modal's task in sync with edits/toggles made elsewhere.
    useEffect(() => {
        if (!detailTask) return;
        const updated = daily.viewData.tasks.find((t) => t.id === detailTask.id);
        if (updated && updated !== detailTask) setDetailTask(updated);
    }, [daily.viewData, detailTask]);

    // Auto-dismiss once every task gets checked off from inside the reminder.
    useEffect(() => {
        if (
            reminderOpen &&
            daily.data.tasks.length > 0 &&
            daily.data.tasks.every((t) => t.completed)
        ) {
            setReminderOpen(false);
        }
    }, [reminderOpen, daily.data]);

    // Resolve theme (auto follows the OS/browser preference) onto <html data-theme>.
    // HeroUI's own theme CSS also keys off this same [data-theme] attribute.
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme !== "auto") {
            root.setAttribute("data-theme", settings.theme);
            return;
        }
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const apply = () =>
            root.setAttribute("data-theme", mq.matches ? "dark" : "light");
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, [settings.theme]);

    function openAddTask() {
        setEditingTask(null);
        setTaskModalOpen(true);
    }

    // "n" opens the Add Task modal, where tasks and their checklist items
    // (todos) both get created. Ignored while typing in a field/textarea/select
    // (default react-hotkeys-hook behavior) so it never hijacks normal typing.
    useHotkeys("n", (e) => {
        e.preventDefault();
        openAddTask();
    });

    function openEditTask(task: Task) {
        setEditingTask(task);
        setTaskModalOpen(true);
    }

    async function handleTaskSubmit(input: {
        title: string;
        priority: Priority;
        category: Category;
        description: string;
        subtasks: Subtask[];
        deadline?: string;
        projectId?: string;
        targetDate: string;
    }) {
        const { targetDate, ...taskInput } = input;
        if (editingTask) {
            await daily.updateViewTask(editingTask.id, taskInput);
            toast.success("Task updated.");
        } else {
            await daily.addTaskToDate(targetDate, taskInput);
            toast.success(
                targetDate === daily.today
                    ? "Task added."
                    : "Task added for tomorrow.",
            );
        }
        setTaskModalOpen(false);
        setEditingTask(null);
    }

    async function handleDeleteTask(id: string) {
        await daily.deleteViewTask(id);
        toast.success("Task deleted.");
    }

    async function handleToggleTask(id: string) {
        const task = daily.viewData.tasks.find((t) => t.id === id);
        const willComplete = task ? !task.completed : false;
        await daily.toggleViewTask(id);
        if (willComplete)
            void confettiRef.current?.fire({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
            });
    }

    function handleSelectDeadlineTask(task: DeadlineTask) {
        daily.setViewDate(task.dateKey);
        setDetailTask(task);
    }

    async function handleSetFocus(value: string) {
        await daily.setFocus(value);
        toast.success("Today's focus saved.");
    }

    async function handleClearFocus() {
        await daily.clearFocus();
        toast.success("Focus cleared.");
    }

    async function handleUploadBackground(file: File) {
        const result = await background.uploadBackground(file);
        if (result.ok) toast.success("Background updated.");
    }

    async function handleRemoveBackground() {
        await background.removeBackground();
        toast.success("Background removed.");
    }

    async function handleExport() {
        const [storedSettings, dailyData, storedProjects, storedNotes] =
            await Promise.all([
                storage.get<typeof settings>("settings"),
                storage.get<AllDailyData>("dailyData"),
                storage.get<typeof projects.projects>("projects"),
                storage.get<typeof notes.notes>("notes"),
            ]);
        const backup: BackupData = {
            app: "daily-command",
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: storedSettings ?? DEFAULT_SETTINGS,
            dailyData: dailyData ?? {},
            projects: storedProjects ?? [],
            notes: storedNotes ?? [],
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `daily-command-backup-${todayKey()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Backup exported.");
    }

    async function handleImport(
        file: File,
    ): Promise<{ ok: boolean; error?: string }> {
        try {
            const text = await file.text();
            const data: unknown = JSON.parse(text);
            if (!validateBackup(data)) {
                toast.error("Invalid backup file.");
                return {
                    ok: false,
                    error: "Invalid backup file. Your existing data was not changed.",
                };
            }
            await storage.setAll({
                settings: { ...DEFAULT_SETTINGS, ...data.settings },
                dailyData: data.dailyData,
                projects: data.projects ?? [],
                notes: data.notes ?? [],
            });
            toast.success("Backup imported.");
            window.location.reload();
            return { ok: true };
        } catch {
            toast.error("Invalid backup file.");
            return {
                ok: false,
                error: "Invalid backup file. Your existing data was not changed.",
            };
        }
    }

    if (settingsLoading || daily.loading || projects.loading || notes.loading)
        return <AppSkeleton />;

    const showCarryOverBanner =
        settings.carryOverTasks && daily.pendingCarryOver.length > 0;

    return (
        <>
            <Toaster
                position="bottom-center"
                toastOptions={{ duration: 3200 }}
            />
            <Confetti
                ref={confettiRef}
                manualstart
                className="pointer-events-none fixed inset-0 z-50 size-full"
            />

            <div
                aria-hidden="true"
                className="fixed inset-0 z-0 scale-105 bg-cover bg-center"
                style={{
                    backgroundImage: settings.backgroundImage
                        ? `url("${settings.backgroundImage}")`
                        : "radial-gradient(circle at 20% 20%, #4b6cb7, transparent 55%), radial-gradient(circle at 80% 30%, #6b3fa0, transparent 55%), radial-gradient(circle at 50% 90%, #2c5364, transparent 60%), linear-gradient(160deg, #0f2027, #203a43, #2c5364)",
                }}
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 z-[1] bg-black"
                style={{ opacity: settings.backgroundOverlay / 100 }}
            />

            <main className="relative z-[2] flex h-screen flex-col items-center justify-center-safe overflow-y-auto px-5 py-8 pb-28">
                {showCarryOverBanner && (
                    <Card
                        className="fixed top-5 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 flex-row items-center gap-4"
                        role="status"
                    >
                        <p className="text-sm text-white">
                            You have {daily.pendingCarryOver.length} unfinished
                            task
                            {daily.pendingCarryOver.length === 1
                                ? ""
                                : "s"}{" "}
                            from yesterday.
                        </p>
                        <div className="flex gap-2 whitespace-nowrap">
                            <Button
                                size="sm"
                                onPress={() => void daily.applyCarryOver()}
                            >
                                Carry over
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onPress={() => void daily.dismissCarryOver()}
                            >
                                Ignore
                            </Button>
                        </div>
                    </Card>
                )}

                <Sidebar
                    onViewHistory={() => setHistoryOpen(true)}
                    onOpenSettings={() => setSettingsOpen(true)}
                />
                {settings.showProgress && (
                    <ProgressCard
                        completed={
                            daily.data.tasks.filter((t) => t.completed).length
                        }
                        total={daily.data.tasks.length}
                    />
                )}

                <Card
                    className="grid w-full max-w-[1300px] grid-cols-1 items-start gap-4 text-center lg:grid-cols-3"
                    style={{
                        backdropFilter: `blur(${settings.glassBlur}px)`,
                        WebkitBackdropFilter: `blur(${settings.glassBlur}px)`,
                        backgroundColor: `rgba(255, 255, 255, ${settings.glassOpacity / 100})`,
                    }}
                >
                    <div className="lg:col-span-3">
                        <Header
                            name={settings.name}
                            showGreeting={settings.showGreeting}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FocusCard
                            focus={daily.data.focus}
                            pendingCount={
                                daily.data.tasks.filter((t) => !t.completed)
                                    .length
                            }
                            onSave={(v) => void handleSetFocus(v)}
                            onClear={() => void handleClearFocus()}
                            editSignal={focusEditSignal}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <TaskList
                            tasks={daily.viewData.tasks}
                            projects={projects.projects}
                            view={settings.taskView}
                            onViewChange={(taskView) =>
                                void updateSettings({ taskView })
                            }
                            onToggle={(id) => void handleToggleTask(id)}
                            onToggleSubtask={(taskId, subtaskId) =>
                                void daily.toggleSubtaskViewTask(
                                    taskId,
                                    subtaskId,
                                )
                            }
                            onEdit={openEditTask}
                            onDelete={(id) => void handleDeleteTask(id)}
                            onAddTask={openAddTask}
                            onOpenDetail={setDetailTask}
                            viewDate={daily.viewDate}
                            today={daily.today}
                            onViewDateChange={daily.setViewDate}
                            deadlineTasks={daily.deadlineTasks}
                            onSelectDeadlineTask={handleSelectDeadlineTask}
                        />
                    </div>

                    <NotesSection
                        notes={notes.notes}
                        onAdd={(title, body) => void notes.addNote(title, body)}
                        onUpdate={(id, patch) =>
                            void notes.updateNote(id, patch)
                        }
                        onTogglePin={(id) => void notes.togglePinNote(id)}
                        onDelete={(id) => void notes.deleteNote(id)}
                    />
                </Card>

                <QuickActions
                    onAddTask={openAddTask}
                    onSetFocus={() => setFocusEditSignal((n) => (n ?? 0) + 1)}
                    onViewHistory={() => setHistoryOpen(true)}
                    onOpenSettings={() => setSettingsOpen(true)}
                />
            </main>

            <AddTaskModal
                open={taskModalOpen}
                task={editingTask}
                todayKey={daily.today}
                tomorrowKey={daily.tomorrow}
                projects={projects.projects}
                onCreateProject={projects.addProject}
                onClose={() => {
                    setTaskModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={(input) => void handleTaskSubmit(input)}
            />

            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                settings={settings}
                updateSettings={(partial) => void updateSettings(partial)}
                backgroundUploading={background.uploading}
                backgroundError={background.error}
                onUploadBackground={(file) => void handleUploadBackground(file)}
                onRemoveBackground={() => void handleRemoveBackground()}
                onExport={() => void handleExport()}
                onImport={handleImport}
            />

            <HistoryModal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
            />

            <TaskDetailModal
                open={detailTask !== null}
                task={detailTask}
                project={projects.projects.find(
                    (p) => p.id === detailTask?.projectId,
                )}
                onClose={() => setDetailTask(null)}
                onToggle={(id) => void handleToggleTask(id)}
                onToggleSubtask={(taskId, subtaskId) =>
                    void daily.toggleSubtaskViewTask(taskId, subtaskId)
                }
                onEdit={openEditTask}
                onDelete={(id) => void handleDeleteTask(id)}
            />

            <TodayReminderModal
                open={reminderOpen}
                tasks={daily.data.tasks.filter((t) => !t.completed)}
                onClose={() => setReminderOpen(false)}
                onToggle={(id) => void handleToggleTask(id)}
            />
        </>
    );
}

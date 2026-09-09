import { Button, Card, Input, TextField } from "@heroui/react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { CloseIcon, EditIcon, TargetIcon } from "./icons";

interface FocusCardProps {
    focus: string;
    pendingCount: number;
    onSave: (value: string) => void;
    onClear: () => void;
    /** Bump this number (e.g. from a "Set Focus" quick action) to open the editor. */
    editSignal?: number;
}

export function FocusCard({
    focus,
    pendingCount,
    onSave,
    onClear,
    editSignal,
}: FocusCardProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(focus);

    useEffect(() => {
        if (editSignal !== undefined) startEditing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editSignal]);

    function startEditing() {
        setDraft(focus);
        setEditing(true);
    }

    function commit() {
        const value = draft.trim();
        if (!value) return;
        onSave(value);
        setEditing(false);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
    }

    return (
        <Card className="w-full items-start gap-3 text-left">
            <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent-soft-foreground uppercase">
                    <TargetIcon className="size-3.5" />
                    Today's Focus
                </span>

                {!editing && focus && (
                    <div className="flex gap-1">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Edit focus"
                            onPress={startEditing}
                        >
                            <EditIcon className="size-3.5" />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="Clear focus"
                            onPress={onClear}
                        >
                            <CloseIcon className="size-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {editing ? (
                <div className="flex w-full flex-col gap-3">
                    <TextField
                        value={draft}
                        onChange={setDraft}
                        aria-label="Today's focus"
                    >
                        <Input
                            autoFocus
                            maxLength={200}
                            placeholder="What's the one thing that matters today?"
                            onKeyDown={handleKeyDown}
                        />
                    </TextField>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onPress={() => setEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button onPress={commit}>Save</Button>
                    </div>
                </div>
            ) : focus ? (
                <p className="text-2xl leading-snug font-bold text-white">
                    {focus}
                </p>
            ) : (
                <Button variant="secondary" onPress={startEditing}>
                    Set today's focus
                </Button>
            )}

            {!editing && pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-soft-foreground">
                    {pendingCount} task{pendingCount === 1 ? "" : "s"} left
                    today
                </span>
            )}
        </Card>
    );
}

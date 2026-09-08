import { Button, Card, Input, TextField } from "@heroui/react";
import { useEffect, useState, type KeyboardEvent } from "react";

interface FocusCardProps {
    focus: string;
    onSave: (value: string) => void;
    onClear: () => void;
    /** Bump this number (e.g. from a "Set Focus" quick action) to open the editor. */
    editSignal?: number;
}

export function FocusCard({
    focus,
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
        <Card className="w-full text-center">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Today's Focus
            </p>

            {editing ? (
                <div className="mt-2.5 flex flex-col gap-3">
                    <TextField
                        value={draft}
                        onChange={setDraft}
                        aria-label="Today's focus"
                    >
                        <Input
                            autoFocus
                            maxLength={200}
                            className="text-center"
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
                <>
                    <p className="mt-2.5 text-2xl leading-snug font-semibold text-foreground">
                        {focus}
                    </p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onPress={startEditing}
                        >
                            Edit
                        </Button>
                        <Button variant="ghost" size="sm" onPress={onClear}>
                            Clear
                        </Button>
                    </div>
                </>
            ) : (
                <Button className="mt-3 mx-auto" onPress={startEditing}>
                    Set today's focus
                </Button>
            )}
        </Card>
    );
}

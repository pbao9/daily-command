import { Label, ProgressBar } from "@heroui/react";

interface ProgressCardProps {
    completed: number;
    total: number;
}

export function ProgressCard({ completed, total }: ProgressCardProps) {
    if (total === 0) return null;
    const percent = Math.round((completed / total) * 100);

    return (
        <ProgressBar
            aria-label="Today's progress"
            value={percent}
            className="fixed right-4 bottom-4 z-50 w-64"
        >
            <div className="flex items-baseline justify-between">
                <Label className="text-xs font-semibold tracking-wide text-white uppercase">
                    Today's Progress
                </Label>
                <ProgressBar.Output className="text-sm font-semibold text-white" />
            </div>
            <ProgressBar.Track>
                <ProgressBar.Fill />
            </ProgressBar.Track>
        </ProgressBar>
    );
}

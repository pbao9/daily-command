import { Label, ProgressBar } from '@heroui/react';

interface ProgressCardProps {
  completed: number;
  total: number;
}

export function ProgressCard({ completed, total }: ProgressCardProps) {
  if (total === 0) return null;
  const percent = Math.round((completed / total) * 100);

  return (
    <ProgressBar aria-label="Today's progress" value={percent}>
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-semibold tracking-wide text-muted uppercase">Today's Progress</Label>
        <ProgressBar.Output className="text-sm font-semibold text-foreground" />
      </div>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}

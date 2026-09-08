import type { KeyboardEvent } from 'react';
import { AddIcon, HistoryIcon, SettingsIcon, TargetIcon } from './icons';
import { Dock, DockIcon } from './magicui/dock';

interface QuickActionsProps {
  onAddTask: () => void;
  onSetFocus: () => void;
  onViewHistory: () => void;
  onOpenSettings: () => void;
}

function activateOnEnter(handler: () => void) {
  return (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}

export function QuickActions({ onAddTask, onSetFocus, onViewHistory, onOpenSettings }: QuickActionsProps) {
  return (
    <section className="mt-6 flex flex-col items-center gap-2">
      <span className="text-xs font-semibold tracking-wide text-muted uppercase">Quick Actions</span>
      <Dock iconSize={36} iconMagnification={52} iconDistance={100} className="border-border bg-surface/60">
        <DockIcon
          role="button"
          tabIndex={0}
          aria-label="Add Task"
          title="Add Task"
          onClick={onAddTask}
          onKeyDown={activateOnEnter(onAddTask)}
        >
          <AddIcon className="size-4 text-foreground" />
        </DockIcon>
        <DockIcon
          role="button"
          tabIndex={0}
          aria-label="Set Focus"
          title="Set Focus"
          onClick={onSetFocus}
          onKeyDown={activateOnEnter(onSetFocus)}
        >
          <TargetIcon className="size-4 text-foreground" />
        </DockIcon>
        <DockIcon
          role="button"
          tabIndex={0}
          aria-label="View History"
          title="View History"
          onClick={onViewHistory}
          onKeyDown={activateOnEnter(onViewHistory)}
        >
          <HistoryIcon className="size-4 text-foreground" />
        </DockIcon>
        <DockIcon
          role="button"
          tabIndex={0}
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
          onKeyDown={activateOnEnter(onOpenSettings)}
        >
          <SettingsIcon className="size-4 text-foreground" />
        </DockIcon>
      </Dock>
    </section>
  );
}

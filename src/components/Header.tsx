import { formatDisplayDate, getGreeting } from '../utils/date';

interface HeaderProps {
  name: string;
  showGreeting: boolean;
}

export function Header({ name, showGreeting }: HeaderProps) {
  return (
    <header className="mb-5">
      <p className="text-xs font-bold tracking-widest text-muted uppercase">Daily Command</p>
      <p className="mt-1.5 text-sm font-semibold tracking-wide text-muted uppercase">{formatDisplayDate()}</p>
      {showGreeting && (
        <>
          <p className="mt-2 mb-0.5 text-2xl font-semibold text-foreground">
            {getGreeting()}, {name.trim() || 'Friend'}.
          </p>
          <p className="text-sm text-muted">Small steps. Big progress.</p>
        </>
      )}
    </header>
  );
}

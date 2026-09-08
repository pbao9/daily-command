import { formatDisplayDate, getGreeting } from "../utils/date";

interface HeaderProps {
    name: string;
    showGreeting: boolean;
}

export function Header({ name, showGreeting }: HeaderProps) {
    return (
        <header className="mb-5">
            <p className="text-xs font-bold tracking-widest text-white uppercase">
                Daily Command
            </p>
            <p className="mt-1.5 text-sm font-semibold tracking-wide text-white uppercase">
                {formatDisplayDate()}
            </p>
            {showGreeting && (
                <>
                    <p className="mt-2 mb-0.5 text-2xl font-semibold text-white">
                        {getGreeting()}, {name.trim() || "Friend"}.
                    </p>
                    <p className="text-sm text-white/70">
                        Small steps. Big progress.
                    </p>
                </>
            )}
        </header>
    );
}

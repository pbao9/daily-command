import { Button, Link } from '@heroui/react';
import { ChatIcon, FacebookIcon, GithubIcon, HistoryIcon, MailIcon, SettingsIcon } from './icons';

interface SidebarProps {
  onViewHistory: () => void;
  onOpenSettings: () => void;
}

const QUICK_LINKS = [
  { label: 'Zalo', href: 'https://chat.zalo.me/', icon: ChatIcon },
  { label: 'Facebook', href: 'https://facebook.com', icon: FacebookIcon },
  { label: 'GitHub', href: 'https://github.com', icon: GithubIcon },
  { label: 'Gmail', href: 'https://gmail.com', icon: MailIcon },
];

const iconLinkClass =
  'flex size-9 items-center justify-center rounded-field bg-default text-foreground no-underline transition-colors hover:bg-default-hover';

// Persistent top-right icon rail, always reachable regardless of scroll
// position. QuickActions covers the same in-app actions inline for
// discoverability; the links below open external sites in a new tab.
export function Sidebar({ onViewHistory, onOpenSettings }: SidebarProps) {
  return (
    <nav className="fixed top-5 right-5 z-30 flex items-center gap-2" aria-label="Primary">
      {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
        <Link key={label} className={iconLinkClass} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
          <Icon className="size-4" />
        </Link>
      ))}

      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      <Button isIconOnly variant="secondary" aria-label="View history" onPress={onViewHistory}>
        <HistoryIcon className="size-4" />
      </Button>
      <Button isIconOnly variant="secondary" aria-label="Open settings" onPress={onOpenSettings}>
        <SettingsIcon className="size-4" />
      </Button>
    </nav>
  );
}

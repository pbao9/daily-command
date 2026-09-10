# Daily Command

A calm, glassmorphism-inspired New Tab dashboard for Chrome — see today's focus, tasks, and progress the moment you open a tab. No backend, no database, no accounts: everything lives in `chrome.storage.local` and the extension works fully offline.

## Features

- **Today's Focus** — one thing to get done today, editable inline.
- **Tasks** — title, description (rich text via Tiptap), priority (`P0`/`P1`/`P2`), category, deadline, and a checklist of subtasks per task.
- **List / Grid view** — switch how tasks are displayed; grid fits more at a glance.
- **Deadline highlighting** — tasks due within 3 days (or overdue) are flagged in red.
- **Carry-over** — optionally roll unfinished tasks from yesterday into today.
- **Add for tomorrow** — create a task for today or tomorrow from the same dialog.
- **Today reminder** — if unfinished tasks already exist when a new tab opens, a dialog nudges you to finish them (and lets you check them off right there).
- **History** — browse any previous day's focus and tasks; nothing is ever auto-deleted.
- **Custom background** — upload a local image (auto-resized to fit storage limits), adjust overlay darkness, glass blur/opacity, and dark/light/auto theme.
- **Import / Export** — back up and restore all data as a local JSON file.
- **Quick actions dock** — magnified macOS-style dock for Add Task / Set Focus / History / Settings.
- **Quick links** — Zalo, Facebook, GitHub, Gmail shortcuts in the top-right rail.
- **Keyboard shortcut** — press `N` anywhere (outside a text field) to open the Add Task dialog.
- **Confetti** 🎉 on task completion.
- **Focus Mode** — a toolbar popup starts a timed (default 45 min) session that blocks distracting sites (facebook.com, tiktok.com, youtube.com, etc., subdomains included) via `declarativeNetRequest`. Visiting a blocked site redirects to an in-extension block page showing time remaining. Session state survives popup close, tab switches, service worker suspend, and Chrome restart (remaining time is always `startedAt + duration - Date.now()`, restored via a `chrome.alarms` check, never a plain countdown). A 🔥 streak counts consecutive days with a completed session. Configure duration and the blocked-sites list from **Settings → Focus Mode**.

## Tech stack

- React 19 + TypeScript + Vite
- [HeroUI](https://heroui.com) (v3, React Aria Components under the hood) + Tailwind CSS v4
- [Tiptap](https://tiptap.dev) for the rich-text task description
- [Magic UI](https://magicui.design)'s Dock and Confetti components
- `react-hot-toast`, `react-hotkeys-hook`
- Icons: [Hugeicons](https://hugeicons.com) via `@iconify-json/hugeicons`, bundled locally as plain SVG components — no CDN or runtime icon fetch
- Chrome Extension **Manifest V3**, `chrome.storage.local` only

## Project structure

```
daily-command/
├── public/
│   ├── manifest.json      # copied as-is into dist/ by Vite
│   └── fonts/              # Be Vietnam Pro (self-hosted, offline)
├── src/
│   ├── components/         # UI components (HeroUI-based)
│   │   └── magicui/         # Dock, Confetti (ported from magicui.design)
│   ├── hooks/               # useDailyData, useSettings, useBackground, useFocusMode, useFocusSettings
│   ├── services/
│   │   ├── storage.ts       # the only module that touches chrome.storage.local
│   │   └── focus.ts         # Focus Mode: timer math, domain matching, declarativeNetRequest rules
│   ├── background/service-worker.ts  # installs defaults, restores session on browser restart, runs the completion alarm
│   ├── popup/               # toolbar popup (Start/Stop Focus)
│   ├── blocked/             # block page shown for blocked sites
│   ├── types/               # shared TypeScript types
│   ├── utils/               # date + image helpers
│   ├── App.tsx
│   └── main.tsx
├── legacy/                  # original vanilla HTML/CSS/JS prototype (kept for reference)
├── index.html               # dashboard (New Tab) entry
├── popup.html               # Focus Mode popup entry
├── blocked.html             # Focus Mode block page entry
├── vite.config.ts
└── manifest.json is under public/, not the repo root
```

## Getting started

```bash
npm install
npm run dev       # local dev server (chrome.* APIs are stubbed/unavailable outside the extension)
npm run build     # type-checks (tsc -b) then builds to dist/
```

## Load into Chrome

1. `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder (not the repo root)

After changing code, re-run `npm run build` and click the reload icon on the extension card in `chrome://extensions`.

## Data & privacy

- All data (tasks, settings, background image) is stored locally via `chrome.storage.local`. Nothing is ever sent to a server.
- Use **Settings → Backup** to export/import a JSON snapshot for safekeeping or moving between machines.
- Uninstalling the extension removes all of its stored data.

## Permissions

- `storage` — persist dashboard data and Focus Mode state/settings locally.
- `alarms` — wake the service worker periodically to detect focus session completion (not a reliable `setInterval`, since MV3 service workers can be suspended).
- `declarativeNetRequest` + host permissions — block the configured sites during a focus session and redirect to the block page.
- `notifications` — a single notification when a focus session completes.

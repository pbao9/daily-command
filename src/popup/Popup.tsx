import { FocusModeView } from '../components/FocusModeView';
import { SettingsIcon } from '../components/icons';

export function Popup() {
  return (
    <main className="flex w-full flex-col items-center px-6 py-7">
      <FocusModeView />
      <button
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('index.html#settings') })}
        className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300"
      >
        <SettingsIcon className="size-4" /> Settings
      </button>
    </main>
  );
}

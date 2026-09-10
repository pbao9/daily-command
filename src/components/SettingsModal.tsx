import { Button, Input, Label, Modal, Switch, TextField } from '@heroui/react';
import { useRef, useState } from 'react';
import { useFocusSettings } from '../hooks/useFocusSettings';
import type { Settings } from '../types';
import { BackgroundCard } from './BackgroundCard';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  backgroundUploading: boolean;
  backgroundError: string | null;
  onUploadBackground: (file: File) => void;
  onRemoveBackground: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<{ ok: boolean; error?: string }>;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch isSelected={checked} onChange={onChange}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        {label}
      </Switch.Content>
    </Switch>
  );
}

function FocusModeSection() {
  const focus = useFocusSettings();
  const [domainInput, setDomainInput] = useState('');
  const [error, setError] = useState('');

  async function handleAdd() {
    if (!domainInput.trim()) return;
    const ok = await focus.addDomain(domainInput);
    if (ok) {
      setDomainInput('');
      setError('');
    } else {
      setError('Invalid domain.');
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-white uppercase">Focus Mode</h3>

      <TextField
        name="focusDuration"
        value={String(focus.settings.focusDurationMinutes)}
        onChange={(v) => {
          const minutes = Math.max(1, Math.min(180, Number(v) || 45));
          void focus.setDuration(minutes);
        }}
      >
        <Label>Focus duration (minutes)</Label>
        <Input type="number" min={1} max={180} />
      </TextField>

      <ToggleRow
        label="Restore session after browser restart"
        checked={focus.settings.restoreOnRestart}
        onChange={(v) => void focus.setRestoreOnRestart(v)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-white">Blocked websites</span>
        <ul className="flex flex-col gap-1.5">
          {focus.settings.blockedDomains.map((domain) => (
            <li key={domain} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm text-white">
              {domain}
              <button
                onClick={() => void focus.removeDomain(domain)}
                className="text-xs font-semibold text-red-300 hover:text-red-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleAdd();
          }}
          placeholder="Enter website/domain"
          className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
        />
        <Button variant="secondary" onPress={() => void handleAdd()}>
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}

      <Button variant="secondary" onPress={() => void focus.resetDomains()}>
        Reset Default Sites
      </Button>
    </section>
  );
}

export function SettingsModal({
  open,
  onClose,
  settings,
  updateSettings,
  backgroundUploading,
  backgroundError,
  onUploadBackground,
  onRemoveBackground,
  onExport,
  onImport,
}: SettingsModalProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importHint, setImportHint] = useState('');

  async function handleImportFile(file: File) {
    const result = await onImport(file);
    setImportHint(result.ok ? 'Import successful.' : (result.error ?? 'Invalid backup file.'));
  }

  return (
    <Modal.Backdrop
      variant="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger>
            <CloseIcon className="size-4" />
          </Modal.CloseTrigger>
          <Modal.Header>
            <Modal.Heading>Settings</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-white uppercase">Profile</h3>
              <TextField name="name" value={settings.name} onChange={(v) => updateSettings({ name: v })}>
                <Label>Name</Label>
                <Input maxLength={40} />
              </TextField>
            </section>

            <BackgroundCard
              settings={settings}
              updateSettings={updateSettings}
              uploading={backgroundUploading}
              error={backgroundError}
              onUpload={onUploadBackground}
              onRemove={onRemoveBackground}
            />

            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-wide text-white uppercase">Behavior</h3>
              <ToggleRow
                label="Carry unfinished tasks to next day"
                checked={settings.carryOverTasks}
                onChange={(v) => updateSettings({ carryOverTasks: v })}
              />
              <ToggleRow
                label="Show greeting"
                checked={settings.showGreeting}
                onChange={(v) => updateSettings({ showGreeting: v })}
              />
              <ToggleRow
                label="Show progress"
                checked={settings.showProgress}
                onChange={(v) => updateSettings({ showProgress: v })}
              />
            </section>

            <FocusModeSection />

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-white uppercase">Backup</h3>
              <div className="flex gap-2">
                <Button variant="secondary" onPress={onExport}>
                  Export Data
                </Button>
                <Button variant="secondary" onPress={() => importInputRef.current?.click()}>
                  Import Data
                </Button>
              </div>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImportFile(file);
                  e.target.value = '';
                }}
              />
              {importHint && <p className="text-xs text-white">{importHint}</p>}
            </section>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

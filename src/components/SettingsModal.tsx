import { Button, Input, Label, Modal, Switch, TextField } from '@heroui/react';
import { useRef, useState } from 'react';
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

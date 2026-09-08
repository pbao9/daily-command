import { Button, Label, ListBox, Select, Slider } from '@heroui/react';
import { useRef } from 'react';
import type { Settings, Theme } from '../types';

interface BackgroundCardProps {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  uploading: boolean;
  error: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const THEME_OPTIONS: { id: Theme; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'dark', label: 'Dark Glass' },
  { id: 'light', label: 'Light Glass' },
];

export function BackgroundCard({ settings, updateSettings, uploading, error, onUpload, onRemove }: BackgroundCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Background &amp; Appearance</h3>

      <div className="flex gap-2">
        <Button variant="secondary" isDisabled={uploading} onPress={() => fileInputRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Upload Background'}
        </Button>
        <Button variant="secondary" isDisabled={!settings.backgroundImage} onPress={onRemove}>
          Remove Background
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <p className="text-xs text-muted">
        {error ?? (settings.backgroundImage ? 'Custom background active.' : 'Using the default background.')}
      </p>

      <Slider
        value={settings.backgroundOverlay}
        minValue={0}
        maxValue={80}
        onChange={(v) => updateSettings({ backgroundOverlay: v as number })}
      >
        <Label>Overlay Darkness</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Slider value={settings.glassBlur} minValue={0} maxValue={40} onChange={(v) => updateSettings({ glassBlur: v as number })}>
        <Label>Glass Blur</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Slider
        value={settings.glassOpacity}
        minValue={4}
        maxValue={40}
        onChange={(v) => updateSettings({ glassOpacity: v as number })}
      >
        <Label>Glass Opacity</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Select value={settings.theme} onChange={(value) => updateSettings({ theme: value as Theme })}>
        <Label>Appearance</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {THEME_OPTIONS.map((opt) => (
              <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                {opt.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </section>
  );
}

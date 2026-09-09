import { Label, ListBox, Modal, Select } from '@heroui/react';
import { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { AllDailyData, DailyData } from '../types';
import { CloseIcon } from './icons';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryModal({ open, onClose }: HistoryModalProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [day, setDay] = useState<DailyData | null>(null);

  useEffect(() => {
    if (!open) return;
    storage.get<AllDailyData>('dailyData').then((all) => {
      const sorted = Object.keys(all ?? {}).sort((a, b) => (a < b ? 1 : -1));
      setDates(sorted);
      const first = sorted[0] ?? '';
      setSelectedDate(first);
      setDay(first ? (all as AllDailyData)[first] : null);
    });
  }, [open]);

  useEffect(() => {
    if (!selectedDate) return;
    storage.get<AllDailyData>('dailyData').then((all) => {
      setDay(all?.[selectedDate] ?? null);
    });
  }, [selectedDate]);

  const completed = day?.tasks.filter((t) => t.completed) ?? [];
  const incomplete = day?.tasks.filter((t) => !t.completed) ?? [];

  function formatDate(key: string) {
    return new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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
            <Modal.Heading>History</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            {dates.length === 0 ? (
              <p className="text-sm text-white">No history yet.</p>
            ) : (
              <>
                <Select value={selectedDate} onChange={(value) => setSelectedDate(value as string)}>
                  <Label>Date</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {dates.map((key) => (
                        <ListBox.Item key={key} id={key} textValue={formatDate(key)}>
                          {formatDate(key)}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <div className="flex flex-col gap-3">
                  {day?.focus && <p className="text-base font-semibold text-white">{day.focus}</p>}

                  {!day || day.tasks.length === 0 ? (
                    <p className="text-sm text-white">No tasks recorded for this day.</p>
                  ) : (
                    <>
                      {completed.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold tracking-wide text-white uppercase">Completed</p>
                          <ul className="flex flex-col gap-1 text-sm text-white">
                            {completed.map((t) => (
                              <li key={t.id}>✓ {t.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {incomplete.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold tracking-wide text-white uppercase">Incomplete</p>
                          <ul className="flex flex-col gap-1 text-sm text-white">
                            {incomplete.map((t) => (
                              <li key={t.id}>○ {t.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { Note } from '../types';

const NOTES_KEY = 'notes';

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  addNote: (title: string, body: string) => Promise<Note>;
  updateNote: (id: string, patch: { title: string; body: string }) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storage.get<Note[]>(NOTES_KEY).then((stored) => {
      if (cancelled) return;
      setNotes(stored ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Note[]) => {
    await storage.set(NOTES_KEY, next);
    setNotes(next);
  }, []);

  const addNote = useCallback(
    async (title: string, body: string) => {
      const note: Note = {
        id: crypto.randomUUID(),
        title: title.trim(),
        body,
        pinned: false,
        createdAt: new Date().toISOString(),
      };
      await persist([note, ...notes]);
      return note;
    },
    [notes, persist],
  );

  const updateNote = useCallback(
    async (id: string, patch: { title: string; body: string }) => {
      await persist(notes.map((n) => (n.id === id ? { ...n, title: patch.title.trim(), body: patch.body } : n)));
    },
    [notes, persist],
  );

  const togglePinNote = useCallback(
    async (id: string) => {
      await persist(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
    },
    [notes, persist],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist],
  );

  return { notes, loading, addNote, updateNote, togglePinNote, deleteNote };
}

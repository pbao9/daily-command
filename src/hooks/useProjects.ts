import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import type { Project } from '../types';

const PROJECTS_KEY = 'projects';

export const PROJECT_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan'] as const;

function nextColor(existing: Project[]): string {
  return PROJECT_COLORS[existing.length % PROJECT_COLORS.length];
}

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  addProject: (name: string) => Promise<Project>;
  renameProject: (id: string, name: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storage.get<Project[]>(PROJECTS_KEY).then((stored) => {
      if (cancelled) return;
      setProjects(stored ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Project[]) => {
    await storage.set(PROJECTS_KEY, next);
    setProjects(next);
  }, []);

  const addProject = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      const project: Project = { id: crypto.randomUUID(), name: trimmed, color: nextColor(projects) };
      await persist([...projects, project]);
      return project;
    },
    [projects, persist],
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      await persist(projects.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
    },
    [projects, persist],
  );

  const removeProject = useCallback(
    async (id: string) => {
      await persist(projects.filter((p) => p.id !== id));
    },
    [projects, persist],
  );

  return { projects, loading, addProject, renameProject, removeProject };
}

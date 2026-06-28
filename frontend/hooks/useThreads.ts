"use client";

import { useState, useCallback } from "react";
import type { Thread } from "@/types";
import {
  fetchThreads,
  createThread,
  renameThread,
  deleteThread,
} from "@/lib/api";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setThreads(await fetchThreads());
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (): Promise<Thread> => {
    const t = await createThread();
    setThreads((prev) => [t, ...prev]);
    return t;
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    await renameThread(id, name);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteThread(id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updatePreview = useCallback((id: string, preview: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, preview, message_count: t.message_count + 2 }
          : t
      )
    );
  }, []);

  const updateName = useCallback((id: string, name: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  }, []);

  return { threads, loading, load, create, rename, remove, updatePreview, updateName };
}

"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/types";
import { fetchMessages, streamChat } from "@/lib/api";

export function useChat(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(false);

  const load = useCallback(async (id: string) => {
    const msgs = await fetchMessages(id);
    setMessages(msgs);
  }, []);

  const send = useCallback(
    async (
      content: string,
      onFirstToken?: () => void,
      onDone?: (full: string) => void
    ) => {
      if (!threadId || streaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
      };

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);
      abortRef.current = false;
      let full = "";
      let firstToken = false;

      await streamChat(
        threadId,
        content,
        (token) => {
          if (abortRef.current) return;
          if (!firstToken) {
            firstToken = true;
            onFirstToken?.();
          }
          full += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: full } : m
            )
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, isStreaming: false } : m
            )
          );
          setStreaming(false);
          onDone?.(full);
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `Error: ${err}`, isStreaming: false }
                : m
            )
          );
          setStreaming(false);
        }
      );
    },
    [threadId, streaming]
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, streaming, send, load, clear };
}

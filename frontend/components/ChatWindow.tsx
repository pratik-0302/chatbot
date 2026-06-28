"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { Message as MessageBubble } from "./Message";
import { EmptyState } from "./EmptyState";

interface ChatWindowProps {
  messages: Message[];
  onSuggest: (s: string) => void;
}

export function ChatWindow({ messages, onSuggest }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState onSuggest={onSuggest} />;
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      <div className="max-w-3xl mx-auto py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} className="h-10" />
      </div>
    </div>
  );
}

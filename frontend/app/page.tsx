"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { useThreads } from "@/hooks/useThreads";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const { threads, load, create, rename, remove, updatePreview, updateName } =
    useThreads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const { messages, streaming, send, load: loadMsgs, clear } = useChat(activeId);

  useEffect(() => {
    load();
  }, [load]);

  const selectThread = useCallback(
    async (id: string) => {
      setActiveId(id);
      clear();
      await loadMsgs(id);
    },
    [clear, loadMsgs]
  );

  const newChat = useCallback(async () => {
    const t = await create();
    setActiveId(t.id);
    clear();
  }, [create, clear]);

  const handleSend = useCallback(
    (msg: string) => {
      if (!activeId) return;
      send(msg, undefined, (full) => {
        updatePreview(activeId, full.slice(0, 120));
        const thread = threads.find((t) => t.id === activeId);
        if (thread?.name === "New Chat") {
          updateName(activeId, msg.slice(0, 45) + (msg.length > 45 ? "…" : ""));
        }
      });
    },
    [activeId, send, updatePreview, updateName, threads]
  );

  const handleSuggest = useCallback(
    async (suggestion: string) => {
      let id = activeId;
      if (!id) {
        const t = await create();
        id = t.id;
        setActiveId(t.id);
        clear();
      }
      if (id) {
        send(suggestion, undefined, (full) => {
          updatePreview(id!, full.slice(0, 120));
          updateName(id!, suggestion.slice(0, 45));
        });
      }
    },
    [activeId, create, clear, send, updatePreview, updateName]
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0c0c10", overflow: "hidden" }}>
      <Sidebar
        threads={threads}
        activeId={activeId}
        onSelect={selectThread}
        onCreate={newChat}
        onRename={rename}
        onDelete={async (id) => {
          await remove(id);
          if (activeId === id) {
            setActiveId(null);
            clear();
          }
        }}
      />

      <main style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, background: "#0c0c10" }}>
        {/* Top bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", borderBottom: "1px solid #1f1f27", minHeight: 56,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#d4d4d8" }}>
              {activeId
                ? threads.find((t) => t.id === activeId)?.name ?? "Chat"
                : "Atlas AI"}
            </span>
            {streaming && (
              <span style={{
                fontSize: 11, padding: "2px 10px", borderRadius: 99,
                background: "rgba(139,92,246,0.12)", color: "#a78bfa",
                border: "1px solid rgba(139,92,246,0.25)", animation: "pulse 1.5s infinite",
              }}>
                Generating…
              </span>
            )}
          </div>
        </header>

        {activeId ? (
          <>
            <ChatWindow messages={messages} onSuggest={handleSuggest} />
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              streaming={streaming}
              disabled={!activeId}
              threadId={activeId}
            />
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 16, color: "#52525b",
          }}>
            <p style={{ fontSize: 14 }}>Start a new chat or select an existing one</p>
            <button
              onClick={newChat}
              style={{
                padding: "8px 20px", borderRadius: 12, background: "#7c3aed",
                color: "white", fontSize: 14, fontWeight: 500, border: "none",
                cursor: "pointer", boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
              }}
            >
              New Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit2, Check, X,
  MessageSquare, Bot, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { Thread } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  threads: Thread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  threads,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filtered = threads.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const startEdit = (t: Thread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(t.id);
    setEditName(t.name);
  };

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-zinc-950 border-r border-zinc-800/60 flex-shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800/60 min-h-[56px]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-100">Atlas AI</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all ml-auto"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2 py-2">
        <button
          onClick={onCreate}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            "bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 border border-violet-500/20 hover:border-violet-500/40",
            collapsed && "justify-center px-2"
          )}
        >
          <Plus size={15} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-2 pb-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800/60">
              <Search size={13} className="text-zinc-500 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats…"
                className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <AnimatePresence>
          {!collapsed && threads.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-2 py-2"
            >
              Conversations
            </motion.p>
          )}
        </AnimatePresence>

        {filtered.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => onSelect(t.id)}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-all",
              activeId === t.id
                ? "bg-zinc-800 text-zinc-100"
                : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200",
              collapsed && "justify-center px-2"
            )}
          >
            <MessageSquare size={14} className="flex-shrink-0 text-zinc-500" />

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  {editingId === t.id ? (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 bg-zinc-700 text-xs text-zinc-100 rounded px-2 py-1 outline-none"
                      />
                      <button onClick={confirmEdit} className="text-green-400 hover:text-green-300">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-medium truncate">{t.name}</p>
                      {t.preview && (
                        <p className="text-[10px] text-zinc-600 truncate mt-0.5">{t.preview}</p>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {!collapsed && editingId !== t.id && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={(e) => startEdit(t, e)}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all"
                >
                  <Edit2 size={11} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {!collapsed && filtered.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-6">
            {query ? "No results" : "No conversations yet"}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "px-2 py-3 border-t border-zinc-800/60 flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                AI
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-300">Atlas AI</p>
                <p className="text-[10px] text-zinc-600">Local · Private</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <ThemeToggle />
      </div>
    </motion.aside>
  );
}

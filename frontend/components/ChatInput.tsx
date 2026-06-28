"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Square, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachedFile {
  name: string;
  size: number;
  chars: number;
}

interface ChatInputProps {
  onSend: (msg: string) => void;
  streaming: boolean;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  threadId: string | null;
}

const ACCEPTED = ".pdf,.txt,.md,.csv,.py,.js,.ts,.json,.html,.css,.yaml,.yml";

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ChatInput({
  onSend,
  streaming,
  value,
  onChange,
  disabled,
  threadId,
}: ChatInputProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Clear file when thread changes
  useEffect(() => {
    setAttachedFile(null);
  }, [threadId]);

  const uploadFile = async (file: File) => {
    if (!threadId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("thread_id", threadId);
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachedFile({ name: data.name, size: file.size, chars: data.chars });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async () => {
    if (!threadId) return;
    await fetch(`/api/threads/${threadId}/file`, { method: "DELETE" });
    setAttachedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming || disabled) return;
    onSend(trimmed);
    onChange("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className="px-4 pb-5 pt-2"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Attached file pill */}
      <AnimatePresence>
        {(attachedFile || uploading) && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 6, height: 0 }}
            className="mb-2"
          >
            <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/60 text-sm">
              {uploading ? (
                <>
                  <Loader2 size={14} className="text-violet-400 animate-spin" />
                  <span className="text-zinc-400 text-xs">Uploading…</span>
                </>
              ) : (
                <>
                  <FileText size={14} className="text-violet-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-200 text-xs font-medium truncate max-w-[200px]">
                      {attachedFile?.name}
                    </span>
                    <span className="text-zinc-600 text-[10px]">
                      {fmt(attachedFile?.size ?? 0)} · {attachedFile?.chars.toLocaleString()} chars
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="ml-1 p-0.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-2xl border bg-zinc-900/90 backdrop-blur-sm transition-all px-3 py-3",
          dragOver
            ? "border-violet-500 shadow-lg shadow-violet-500/20"
            : "border-zinc-800 focus-within:border-violet-500/60 focus-within:shadow-lg focus-within:shadow-violet-500/10"
        )}
      >
        {/* Attach button */}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!threadId || uploading}
          title="Attach file (PDF, TXT, CSV, …)"
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
            threadId && !uploading
              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              : "text-zinc-700 cursor-not-allowed"
          )}
        >
          <Paperclip size={15} />
        </button>

        <textarea
          ref={textRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          placeholder={dragOver ? "Drop file here…" : "Ask anything, or attach a file…"}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none min-h-[24px] max-h-[200px] leading-6 py-0.5"
        />

        {/* Send / Stop */}
        <AnimatePresence mode="wait">
          <motion.button
            key={streaming ? "stop" : "send"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={streaming ? undefined : submit}
            disabled={!streaming && (!value.trim() || disabled)}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
              streaming
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer"
                : value.trim() && !disabled
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/30"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            )}
          >
            {streaming ? <Square size={12} fill="currentColor" /> : <ArrowUp size={15} />}
          </motion.button>
        </AnimatePresence>
      </div>

      <p className="text-center text-[11px] text-zinc-600 mt-2">
        Supports PDF, TXT, CSV, code files · <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">Enter</kbd> to send ·{" "}
        <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">Shift+Enter</kbd> newline
      </p>
    </div>
  );
}

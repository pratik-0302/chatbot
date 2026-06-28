"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, Code2, BookOpen, Lightbulb } from "lucide-react";

const suggestions = [
  { icon: FileText,   label: "Summarize this document",   prompt: "Summarize the uploaded document for me" },
  { icon: Code2,      label: "Debug my code",             prompt: "Help me debug this code and explain the fix" },
  { icon: BookOpen,   label: "Explain a concept",         prompt: "Explain this concept in simple terms: " },
  { icon: Lightbulb,  label: "Brainstorm ideas",          prompt: "Help me brainstorm ideas for " },
];

export function EmptyState({ onSuggest }: { onSuggest: (s: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full gap-8 px-4 text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 180, delay: 0.05 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border-2 border-[#0c0c10]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Atlas AI</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your local AI assistant · Powered by Llama 3.2 via Ollama
          </p>
        </div>
      </motion.div>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggest(s.prompt)}
            className="flex items-center gap-3 p-3.5 text-left text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-violet-500/40 rounded-xl transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <s.icon size={14} className="text-violet-400" />
            </div>
            {s.label}
          </motion.button>
        ))}
      </div>

      <p className="text-[11px] text-zinc-700">
        Attach a PDF or file with the <span className="text-zinc-500">📎</span> button · <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">Enter</kbd> to send
      </p>
    </motion.div>
  );
}

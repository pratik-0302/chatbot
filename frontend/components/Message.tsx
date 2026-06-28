"use client";

import { motion } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message as MessageType } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/lib/utils";

export function Message({ message }: { message: MessageType }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("group flex gap-3 px-4 py-5", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-gradient-to-br from-violet-600 to-blue-500 shadow-md shadow-violet-500/25"
            : "bg-zinc-800 border border-zinc-700/60"
        )}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Bot size={14} className="text-zinc-300" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser && "items-end")}>
        <span className="text-[11px] font-medium text-zinc-500 px-1">
          {isUser ? "You" : "Assistant"}
        </span>

        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm"
              : "bg-zinc-900/80 text-zinc-100 border border-zinc-800/60 rounded-tl-sm"
          )}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <div className="prose-invert">
              <MarkdownRenderer content={message.content} />
            </div>
          )}

          {/* Copy button (assistant only) */}
          {!isUser && !message.isStreaming && message.content && (
            <button
              onClick={copy}
              className="absolute -bottom-7 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-all"
            >
              {copied ? (
                <><Check size={11} className="text-green-400" /><span className="text-green-400">Copied</span></>
              ) : (
                <><Copy size={11} /><span>Copy</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

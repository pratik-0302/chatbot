"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext: Record<string, string> = {
      python: "py", javascript: "js", typescript: "ts",
      java: "java", cpp: "cpp", c: "c", rust: "rs", go: "go",
      bash: "sh", shell: "sh", json: "json", yaml: "yml", html: "html", css: "css",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext[language] ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1a1b26]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#13141f]">
        <span className="text-xs font-mono text-zinc-400">{language || "code"}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all"
          >
            <Download size={12} />
          </button>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all"
          >
            {copied ? (
              <><Check size={12} className="text-green-400" /><span className="text-green-400">Copied!</span></>
            ) : (
              <><Copy size={12} /><span>Copy</span></>
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
        }}
        showLineNumbers={code.split("\n").length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

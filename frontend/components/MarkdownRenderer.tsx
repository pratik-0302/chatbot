"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");
          const isBlock = code.includes("\n") || match;

          if (isBlock) {
            return <CodeBlock language={match?.[1] ?? ""} code={code} />;
          }
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-zinc-800/60 dark:bg-zinc-700/60 text-violet-300 font-mono text-[0.8em]"
              {...props}
            >
              {children}
            </code>
          );
        },
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 leading-7">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-7">{children}</li>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-violet-500 pl-4 my-3 text-zinc-400 italic">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto rounded-lg border border-zinc-700/50">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-800/60">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold border-b border-zinc-700/50">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-b border-zinc-700/30">{children}</td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-4 border-zinc-700/50" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

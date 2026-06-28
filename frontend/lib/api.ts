import type { Message, Thread } from "@/types";

const BASE = "/api";

export async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch(`${BASE}/threads`);
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
}

export async function createThread(): Promise<Thread> {
  const res = await fetch(`${BASE}/threads`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create thread");
  return res.json();
}

export async function renameThread(id: string, name: string): Promise<void> {
  await fetch(`${BASE}/threads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteThread(id: string): Promise<void> {
  await fetch(`${BASE}/threads/${id}`, { method: "DELETE" });
}

export async function fetchMessages(threadId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/threads/${threadId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function streamChat(
  threadId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, message }),
  });

  if (!res.ok || !res.body) {
    onError("Stream failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "token") onToken(data.content);
        else if (data.type === "done") onDone();
        else if (data.type === "error") onError(data.content);
      } catch {}
    }
  }
}

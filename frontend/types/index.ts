export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export interface Thread {
  id: string;
  name: string;
  created_at: string;
  preview: string;
  message_count: number;
}

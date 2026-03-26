import { api } from "../lib/api";

export interface Message {
  id: string;
  content: string;
  type: string;
  senderEmail: string;
  senderName: string;
  createdAt: string;
}

interface ChatError {
  error: string;
}

export async function getMessages(before?: string): Promise<
  { ok: true; messages: Message[]; hasMore: boolean } | { ok: false; error: string }
> {
  try {
    const params = before ? `?before=${before}` : "";
    const res = await api(`/chat/messages${params}`);
    const data: { messages: Message[]; hasMore: boolean } & ChatError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, messages: data.messages, hasMore: data.hasMore };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function sendMessage(
  content: string
): Promise<{ ok: true; message: Message } | { ok: false; error: string }> {
  try {
    const res = await api("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    const data: { message: Message } & ChatError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, message: data.message };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

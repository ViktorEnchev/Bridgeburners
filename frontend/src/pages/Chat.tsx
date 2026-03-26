import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { useWebSocket } from "../context/WebSocketContext";
import { getMessages, sendMessage } from "../api/chat";
import type { Message } from "../api/chat";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const { user } = useUser();
  const { lastMessage, clearUnread } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const readyRef = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const loadMore = useCallback(async () => {
    if (!readyRef.current || !hasMoreRef.current || loadingMoreRef.current) return;

    const oldestId = messagesRef.current[0]?.id;
    if (!oldestId) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const res = await getMessages(oldestId);

    if (res.ok && res.messages.length > 0) {
      const el = containerRef.current;
      const prevScrollHeight = el?.scrollHeight ?? 0;

      hasMoreRef.current = res.hasMore;
      setMessages((prev) => [...res.messages, ...prev]);

      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevScrollHeight;
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
    } else {
      hasMoreRef.current = false;
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    clearUnread();
    getMessages().then((res) => {
      if (res.ok) {
        setMessages(res.messages);
        hasMoreRef.current = res.hasMore;
      }
      setLoading(false);
      readyRef.current = true;
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }, []);

  useEffect(() => {
    if (loading || loadingMore) return;
    const el = containerRef.current;
    if (!el) return;
    if (hasMoreRef.current && el.scrollHeight <= el.clientHeight) {
      loadMore();
    }
  }, [messages, loading, loadingMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { root: container, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || loading) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!lastMessage) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === lastMessage.id)) return prev;
      return [...prev, lastMessage];
    });
  }, [lastMessage]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");

    const res = await sendMessage(content);
    if (res.ok) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }

    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div ref={sentinelRef} className="absolute top-0 left-0 right-0 h-px" />

        {loadingMore && (
          <div className="text-center text-xs text-gray-400 py-2">Loading older messages...</div>
        )}

        <div className="flex flex-col justify-end min-h-full gap-1 px-4 py-4">
          {loading ? (
            <div className="text-center text-sm text-gray-400 py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-8">No messages yet. Say hi!</div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderEmail === user?.email;
              const isFirstInGroup = i === 0 || messages[i - 1].senderEmail !== msg.senderEmail;
              const isLastInGroup =
                i === messages.length - 1 || messages[i + 1].senderEmail !== msg.senderEmail;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"} ${isFirstInGroup && i !== 0 ? "mt-3" : ""}`}
                >
                  {isFirstInGroup && (
                    <span className="text-xs font-medium text-gray-500 px-1">
                      {isMe ? "You" : msg.senderName}
                    </span>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "bg-violet-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    } ${
                      isFirstInGroup && isLastInGroup
                        ? "rounded-2xl"
                        : isFirstInGroup
                        ? isMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                        : isLastInGroup
                        ? isMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
                        : isMe ? "rounded-lg rounded-r-sm" : "rounded-lg rounded-l-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {isLastInGroup && (
                    <span className="text-xs text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
            aria-label="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 translate-x-px"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

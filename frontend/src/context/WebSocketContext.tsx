import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "src/context/UserContext";
import type { Message } from "src/api/chat";

interface WebSocketContextType {
  lastMessage: Message | null;
  unreadCount: number;
  clearUnread: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const wsRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.permitted) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ??
      "http://localhost:3000";
    const wsUrl =
      apiUrl.replace(/^https/, "wss").replace(/^http/, "ws") +
      `?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === "new_message") {
          setLastMessage(data.message as Message);
          if (window.location.pathname !== "/chat") {
            setUnreadCount((prev) => Math.min(prev + 1, 9));
          }
        }
      } catch {
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [user?.permitted]);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount === 9 ? "9+" : unreadCount}) Bridgeburners` : "Bridgeburners";
  }, [unreadCount]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ lastMessage, unreadCount, clearUnread }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextType {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return ctx;
}

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { findUserByToken } from "../db/users";
import type { PublicMessage } from "../db/messages";

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
}

const clients = new Set<AuthenticatedClient>();

export function initWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Unauthorized");
      return;
    }

    const user = await findUserByToken(token);
    if (!user || !user.permitted) {
      ws.close(1008, "Unauthorized");
      return;
    }

    const client: AuthenticatedClient = { ws, userId: user.id };
    clients.add(client);

    ws.on("close", () => {
      clients.delete(client);
    });
  });
}

export function broadcastMessage(message: PublicMessage): void {
  const payload = JSON.stringify({ type: "new_message", message });
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

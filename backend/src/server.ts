import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { initWebSocketServer } from "./ws";

const PORT = process.env.PORT ?? 3000;
const server = createServer(app);

initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

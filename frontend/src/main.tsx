import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "src/App";
import { UserProvider } from "src/context/UserContext";
import { WebSocketProvider } from "src/context/WebSocketContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </UserProvider>
  </StrictMode>,
);

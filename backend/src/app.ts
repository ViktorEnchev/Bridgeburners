import express from "express";
import cors from "cors";
import { validateSecret } from "./middleware/validateSecret";
import { router as healthRouter } from "./routes/health";
import { router as authRouter } from "./routes/auth";
import { router as chatRouter } from "./routes/chat";

const app = express();

app.use(cors());
app.use(express.json());
app.use(validateSecret);

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);

export default app;

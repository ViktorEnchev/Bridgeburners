import express from "express";
import cors from "cors";
import { validateSecret } from "./middleware/validateSecret";
import { router as healthRouter } from "./routes/health";
import { router as authRouter } from "./routes/auth";
import { router as userRouter } from "./routes/user";
import { router as adminRouter } from "./routes/admin";
import { router as chatRouter } from "./routes/chat";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/health", healthRouter);
app.use(validateSecret);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/chat", chatRouter);

export default app;

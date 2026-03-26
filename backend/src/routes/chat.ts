import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/authenticate";
import { requirePermitted } from "../middleware/requirePermitted";
import { getMessages, createMessage } from "../db/messages";
import { broadcastMessage } from "../ws";

export const router = Router();

router.get("/messages", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const before = typeof req.query.before === "string" ? req.query.before : undefined;
  const result = await getMessages(before);
  res.status(200).json(result);
});

router.post("/messages", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const message = await createMessage(req.user!.id, content.trim());
  broadcastMessage(message);
  res.status(201).json({ message });
});

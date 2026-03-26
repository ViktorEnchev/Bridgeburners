import { Router, Request, Response } from "express";
import {
  getAllNonAdminUsers,
  getLeaderboard,
  bulkUpdateScores,
  permitUser,
  revokeUser,
  toPublicUser,
} from "../db/users";
import { authenticate } from "../middleware/authenticate";
import { requirePermitted } from "../middleware/requirePermitted";
import { requireAdmin } from "../middleware/requireAdmin";

export const router = Router();

router.use(authenticate, requirePermitted, requireAdmin);

router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  const users = await getAllNonAdminUsers();
  res.status(200).json({ users: users.map(toPublicUser) });
});

router.patch("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  const { scores } = req.body as { scores: { email: string; score: number }[] };

  if (!Array.isArray(scores) || scores.some((s) => typeof s.email !== "string" || typeof s.score !== "number")) {
    res.status(400).json({ error: "scores must be an array of { email, score }" });
    return;
  }

  await bulkUpdateScores(scores);
  const users = await getLeaderboard();
  res.status(200).json({ users });
});

router.post("/permit", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const user = await permitUser(email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json({ user: toPublicUser(user) });
});

router.post("/revoke", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const user = await revokeUser(email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json({ user: toPublicUser(user) });
});

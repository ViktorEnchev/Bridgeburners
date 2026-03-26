import { Router, Request, Response } from "express";
import { getLeaderboard, updateDisplayName, changePassword, verifyPassword, toPublicUser } from "../db/users";
import { authenticate } from "../middleware/authenticate";
import { requirePermitted } from "../middleware/requirePermitted";

export const router = Router();

router.get("/", authenticate, (req: Request, res: Response): void => {
  res.status(200).json({ user: toPublicUser(req.user!) });
});

router.patch("/", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const { displayName } = req.body;
  const updated = await updateDisplayName(req.user!.id, displayName ?? "");
  res.status(200).json({ user: toPublicUser(updated) });
});

router.patch("/password", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "currentPassword and newPassword are required" });
    return;
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }

  if (!(await verifyPassword(req.user!, currentPassword))) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  await changePassword(req.user!.id, newPassword);
  res.status(200).json({ message: "Password updated" });
});

router.get("/leaderboard", authenticate, requirePermitted, async (_req: Request, res: Response): Promise<void> => {
  const users = await getLeaderboard();
  res.status(200).json({ users });
});

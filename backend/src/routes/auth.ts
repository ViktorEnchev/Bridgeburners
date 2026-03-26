import { Router, Request, Response } from "express";
import {
  createUserWithPassword,
  verifyPassword,
  getUserByEmail,
  updateDisplayName,
  getAllNonAdminUsers,
  getLeaderboard,
  bulkUpdateScores,
  permitUser,
  revokeUser,
  generateToken,
  createSession,
  deleteSessionByToken,
  toPublicUser,
} from "../db/users";
import { authenticate } from "../middleware/authenticate";
import { requirePermitted } from "../middleware/requirePermitted";
import { Role } from "@prisma/client";

export const router = Router();

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await getUserByEmail(email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const role: Role = getAdminEmails().includes(email.toLowerCase()) ? "admin" : "user";
  const user = await createUserWithPassword(email.toLowerCase(), password, role);

  const token = generateToken();
  await createSession(user.id, token);

  res.status(201).json({ user: toPublicUser(user), token });
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await getUserByEmail(email.toLowerCase());

  if (!user || !(await verifyPassword(user, password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken();
  await createSession(user.id, token);

  res.status(200).json({ user: toPublicUser(user), token });
});

router.post("/logout", authenticate, async (req: Request, res: Response): Promise<void> => {
  await deleteSessionByToken(req.sessionToken!);
  res.status(200).json({ message: "Logged out" });
});

router.get("/user", authenticate, (req: Request, res: Response): void => {
  res.status(200).json({ user: toPublicUser(req.user!) });
});

router.patch("/user", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const { displayName } = req.body;
  const updated = await updateDisplayName(req.user!.id, displayName ?? "");
  res.status(200).json({ user: toPublicUser(updated) });
});

router.get("/leaderboard", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  const users = await getLeaderboard();
  res.status(200).json({ users });
});

router.patch("/leaderboard", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { scores } = req.body as { scores: { email: string; score: number }[] };

  if (!Array.isArray(scores) || scores.some((s) => typeof s.email !== "string" || typeof s.score !== "number")) {
    res.status(400).json({ error: "scores must be an array of { email, score }" });
    return;
  }

  await bulkUpdateScores(scores);
  const users = await getLeaderboard();
  res.status(200).json({ users });
});

router.get("/users", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const users = await getAllNonAdminUsers();
  res.status(200).json({ users: users.map(toPublicUser) });
});

router.post("/permit", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

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

router.post("/revoke", authenticate, requirePermitted, async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

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

import { Router, Request, Response } from "express";
import {
  createUserWithPassword,
  verifyPassword,
  getUserByEmail,
  generateToken,
  createSession,
  deleteSessionByToken,
  toPublicUser,
} from "../db/users";
import { authenticate } from "../middleware/authenticate";
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
  const displayName = typeof req.body.displayName === "string" ? req.body.displayName.trim() : undefined;
  const user = await createUserWithPassword(email.toLowerCase(), password, role, displayName || undefined);

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

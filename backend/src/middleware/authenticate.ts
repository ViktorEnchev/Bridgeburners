import { Request, Response, NextFunction } from "express";
import { findUserByToken } from "../db/users";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = auth.slice(7);
  const user = await findUserByToken(token);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

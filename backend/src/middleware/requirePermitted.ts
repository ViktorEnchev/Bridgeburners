import { Request, Response, NextFunction } from "express";

export function requirePermitted(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.permitted) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

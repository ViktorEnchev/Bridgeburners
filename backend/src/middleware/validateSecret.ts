import { Request, Response, NextFunction } from "express";

export function validateSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers["x-api-secret"];

  if (!secret || secret !== process.env.API_SECRET) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  next();
}

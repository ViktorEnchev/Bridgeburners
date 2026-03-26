import crypto from "crypto";
import bcrypt from "bcrypt";
import { Role, User } from "@prisma/client";
import prisma from "../lib/prisma";

const SALT_ROUNDS = 12;

export type { Role, User };

export type PublicUser = {
  email: string;
  displayName: string;
  score: number;
  permitted: boolean;
  role: string;
};

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function toPublicUser(user: User): PublicUser {
  return {
    email: user.email,
    displayName: user.displayName ?? "",
    score: user.score,
    permitted: user.permitted,
    role: user.role,
  };
}

export async function findUserByToken(token: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  return session?.user ?? null;
}

export async function createUserWithPassword(
  email: string,
  password: string,
  role: Role,
  displayName?: string
): Promise<User> {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: { email, password: hashed, role, permitted: role === "admin", displayName: displayName || null },
  });
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
}

export async function createSession(userId: string, token: string) {
  await prisma.session.deleteMany({ where: { userId } });
  return prisma.session.create({ data: { userId, token } });
}

export async function deleteSessionByToken(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { displayName: { set: displayName || null } },
  });
}

export async function getLeaderboard(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { score: "desc" },
  });
  return users.map(toPublicUser);
}

export async function bulkUpdateScores(scores: { email: string; score: number }[]): Promise<void> {
  await prisma.$transaction(
    scores.map(({ email, score }) =>
      prisma.user.update({ where: { email }, data: { score } })
    )
  );
}

export async function getAllNonAdminUsers(): Promise<User[]> {
  return prisma.user.findMany({ where: { role: "user" } });
}

export async function permitUser(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return prisma.user.update({ where: { email }, data: { permitted: true } });
}

export async function revokeUser(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  await prisma.session.deleteMany({ where: { userId: user.id } });
  return prisma.user.update({ where: { email }, data: { permitted: false } });
}

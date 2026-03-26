import { api } from "../lib/api";
import type { User } from "./user";

interface AuthError {
  error: string;
}

export async function register(
  email: string,
  password: string
): Promise<{ ok: true; user: User; token: string } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data: { user: User; token: string } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user, token: data.token };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; user: User; token: string } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data: { user: User; token: string } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user, token: data.token };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function logout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
  }
}

export async function permitAccess(
  email: string
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/permit", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data: { user: User } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function revokeAccess(
  email: string
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/revoke", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data: { user: User } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function getUsers(): Promise<{ ok: true; users: User[] } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/users");
    const data: { users: User[] } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, users: data.users };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function getLeaderboard(): Promise<{ ok: true; users: User[] } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/leaderboard");
    const data: { users: User[] } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, users: data.users };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function updateLeaderboard(
  scores: { email: string; score: number }[]
): Promise<{ ok: true; users: User[] } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/leaderboard", {
      method: "PATCH",
      body: JSON.stringify({ scores }),
    });
    const data: { users: User[] } & AuthError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, users: data.users };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

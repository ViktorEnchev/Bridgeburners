import { api } from "src/lib/api";
import type { User } from "src/api/user";

interface AdminError {
  error: string;
}

export async function getUsers(): Promise<{ ok: true; users: User[] } | { ok: false; error: string }> {
  try {
    const res = await api("/admin/users");
    const data: { users: User[] } & AdminError = await res.json();

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
    const res = await api("/admin/leaderboard", {
      method: "PATCH",
      body: JSON.stringify({ scores }),
    });
    const data: { users: User[] } & AdminError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, users: data.users };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function permitAccess(
  email: string
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const res = await api("/admin/permit", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data: { user: User } & AdminError = await res.json();

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
    const res = await api("/admin/revoke", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data: { user: User } & AdminError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

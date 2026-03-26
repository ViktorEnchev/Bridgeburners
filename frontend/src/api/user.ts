import { api } from "src/lib/api";

export interface User {
  email: string;
  displayName: string;
  score: number;
  permitted: boolean;
  role: "user" | "admin";
}

interface UserError {
  error: string;
}

export async function getUser(): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const res = await api("/user");
    const data: { user: User } & UserError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function updateUser(
  patch: { displayName: string }
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const res = await api("/user", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });

    const data: { user: User } & UserError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await api("/user/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) return { ok: true };

    const data: { error: string } = await res.json();
    return { ok: false, error: data.error ?? "Something went wrong" };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

export async function getLeaderboard(): Promise<{ ok: true; users: User[] } | { ok: false; error: string }> {
  try {
    const res = await api("/user/leaderboard");
    const data: { users: User[] } & UserError = await res.json();

    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };

    return { ok: true, users: data.users };
  } catch {
    return { ok: false, error: "Could not connect to server" };
  }
}

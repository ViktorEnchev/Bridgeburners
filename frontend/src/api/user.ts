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
    const res = await api("/auth/user");
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
    const res = await api("/auth/user", {
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

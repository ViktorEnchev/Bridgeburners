import { api } from "src/lib/api";
import type { User } from "src/api/user";

interface AuthError {
  error: string;
}

export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: true; user: User; token: string } | { ok: false; error: string }> {
  try {
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName: displayName || undefined }),
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

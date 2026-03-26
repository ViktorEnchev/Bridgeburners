import { useEffect, useState } from "react";
import { getUsers, permitAccess, revokeAccess } from "../api/auth";
import type { User } from "../api/user";

export default function Requests() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      const result = await getUsers();
      if (!result.ok) {
        setError(result.error);
      } else {
        setUsers(result.users);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function handlePermit(email: string) {
    setActing(email);
    const result = await permitAccess(email);
    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? result.user : u))
      );
    }
    setActing(null);
  }

  async function handleRevoke(email: string) {
    setActing(email);
    const result = await revokeAccess(email);
    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? result.user : u))
      );
    }
    setActing(null);
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-10 text-center">
            <p className="text-sm text-gray-400">No users yet.</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {users.map((u, index) => (
              <div
                key={u.email}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== users.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {u.displayName || u.email}
                  </p>
                  {u.displayName && (
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  )}
                </div>

                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    u.permitted
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {u.permitted ? "Permitted" : "Pending"}
                </span>

                {u.permitted ? (
                  <button
                    onClick={() => handleRevoke(u.email)}
                    disabled={acting === u.email}
                    className="shrink-0 rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {acting === u.email ? "Revoking..." : "Revoke"}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePermit(u.email)}
                    disabled={acting === u.email}
                    className="shrink-0 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {acting === u.email ? "Permitting..." : "Permit"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

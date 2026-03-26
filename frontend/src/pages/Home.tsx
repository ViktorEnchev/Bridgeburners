import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLeaderboard } from "src/api/user";
import { updateLeaderboard } from "src/api/admin";
import type { User } from "src/api/user";
import { useUser } from "src/context/UserContext";

export default function Home() {
  const { user: me } = useUser();
  const isAdmin = me?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLeaderboard().then((res) => {
      if (res.ok) {
        setUsers(res.users);
        setScores(Object.fromEntries(res.users.map((u) => [u.email, u.score])));
      }
      setLoading(false);
    });
  }, []);

  const hasChanged = users.some((u) => scores[u.email] !== u.score);

  function adjust(email: string, delta: number) {
    setScores((prev) => ({ ...prev, [email]: Math.max(0, (prev[email] ?? 0) + delta) }));
  }

  async function handleSave() {
    setSaving(true);

    const scoreList = Object.entries(scores).map(([email, score]) => ({ email, score }));
    const res = await updateLeaderboard(scoreList);

    if (res.ok) {
      setUsers(res.users);
      setScores(Object.fromEntries(res.users.map((u) => [u.email, u.score])));
      toast.success("Leaderboard updated");
    } else {
      toast.error(res.error);
    }

    setSaving(false);
  }

  const sorted = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="flex items-center justify-center min-h-full px-4">
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h2>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No users yet</div>
          ) : (
            sorted.map((user, index) => (
              <div
                key={user.email}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  index !== sorted.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                  {user.displayName || user.email}
                </span>

                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjust(user.email, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100 text-sm leading-none cursor-pointer transition"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold text-violet-600 tabular-nums w-8 text-center">
                      {scores[user.email] ?? user.score}
                    </span>
                    <button
                      onClick={() => adjust(user.email, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100 text-sm leading-none cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-violet-600 tabular-nums">
                    {user.score.toLocaleString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {isAdmin && hasChanged && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setScores(Object.fromEntries(users.map((u) => [u.email, u.score])))}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

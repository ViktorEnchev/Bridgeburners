import { useState } from "react";
import { useUser } from "../context/UserContext";
import { updateUser } from "../api/user";

export default function Settings() {
  const { user, setUser } = useUser();
  const email = user?.email ?? "";
  const savedDisplayName = user?.displayName ?? "";

  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hasChanged = displayName !== savedDisplayName;

  async function handleSave() {
    if (!user) return;
    setError("");
    setSaving(true);

    const result = await updateUser({ displayName: displayName.trim() });

    if (!result.ok) {
      setError(result.error);
    } else {
      setUser(result.user);
    }

    setSaving(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter a display name"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {hasChanged && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

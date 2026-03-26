import { useState } from "react";
import { useUser } from "src/context/UserContext";
import { updateUser, changePassword } from "src/api/user";
import PasswordInput from "src/components/PasswordInput";

export default function Settings() {
  const { user, setUser } = useUser();
  const email = user?.email ?? "";
  const savedDisplayName = user?.displayName ?? "";

  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const hasNameChanged = displayName !== savedDisplayName;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const hasPasswordFields = currentPassword || newPassword || confirmPassword;

  async function handleSaveName() {
    if (!user) return;
    setNameError("");
    setSavingName(true);

    const result = await updateUser({ displayName: displayName.trim() });

    if (!result.ok) {
      setNameError(result.error);
    } else {
      setUser(result.user);
    }

    setSavingName(false);
  }

  async function handleSavePassword() {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);

    if (!result.ok) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

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

          {nameError && <p className="text-sm text-red-500">{nameError}</p>}

          {hasNameChanged && (
            <button
              onClick={handleSaveName}
              disabled={savingName}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {savingName ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-gray-900">Change password</h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
              Current password
            </label>
            <PasswordInput
              id="currentPassword"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              New password
            </label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">Password updated successfully</p>}

          {hasPasswordFields && (
            <button
              onClick={handleSavePassword}
              disabled={savingPassword}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {savingPassword ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

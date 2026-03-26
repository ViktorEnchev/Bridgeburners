import { useState } from "react";
import EyeOpenIcon from "src/assets/icons/EyeOpenIcon";
import EyeOffIcon from "src/assets/icons/EyeOffIcon";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "••••••••",
  required = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOpenIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "src/context/UserContext";
import { useWebSocket } from "src/context/WebSocketContext";
import CloseIcon from "src/assets/icons/CloseIcon";

interface TopBarProps {
  onLogout?: () => void;
  showNav?: boolean;
}

const baseNavItems = [
  { to: "/home", label: "Home" },
  { to: "/chat", label: "Chat" },
  { to: "/settings", label: "Settings" },
];

const adminNavItems = [...baseNavItems, { to: "/requests", label: "Requests" }];

export default function TopBar({ onLogout, showNav = false }: TopBarProps) {
  const { user } = useUser();
  const { unreadCount } = useWebSocket();
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : baseNavItems;
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    onLogout?.();
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4">
        {showNav && (
          <div className="absolute left-4">
            <button
              onClick={() => setOpen(true)}
              className="relative flex flex-col justify-center gap-1.5 w-6 h-6 cursor-pointer"
              aria-label="Open menu"
            >
              <span className="block h-px w-full bg-gray-600" />
              <span className="block h-px w-full bg-gray-600" />
              <span className="block h-px w-full bg-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        )}

        <span className="text-base font-semibold text-gray-900 tracking-tight">
          Bridgeburners
        </span>

        {onLogout && !showNav && (
          <button
            onClick={handleLogout}
            className="absolute right-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
          >
            Log out
          </button>
        )}
      </header>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-20 bg-black/30 transition-opacity duration-200 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {user?.displayName || user?.email || "Menu"}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ to, label }) => {
            const showBadge =
              to === "/chat" && unreadCount > 0 && pathname !== "/chat";
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {label}
                {showBadge && (
                  <span className="ml-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-violet-600 text-white text-xs font-semibold">
                    {unreadCount === 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {showNav && onLogout && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-left transition cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import TopBar from "src/components/TopBar";
import { useUser } from "src/context/UserContext";
import { logout } from "src/api/auth";

const PUBLIC_ROUTES = ["/", "/register"];
const AUTH_ROUTES = ["/home", "/chat", "/settings", "/requests"];
const PENDING_ROUTES = ["/requested-access"];

export default function AppLayout() {
  const { user, loading, clearUser } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (loading) return null;

  if (!user) {
    if (!PUBLIC_ROUTES.includes(pathname)) return <Navigate to="/" replace />;
  } else if (!user.permitted) {
    if (!PENDING_ROUTES.includes(pathname)) return <Navigate to="/requested-access" replace />;
  } else {
    if (!AUTH_ROUTES.includes(pathname)) return <Navigate to="/home" replace />;
  }

  async function handleLogout() {
    await logout();
    clearUser();
    navigate("/");
  }

  const showNav = Boolean(user?.permitted);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        showNav={showNav}
        onLogout={user ? handleLogout : undefined}
      />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  );
}

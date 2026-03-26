import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "src/api/user";
import { getUser } from "src/api/user";

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getUser().then((result) => {
      if (result.ok) {
        setUserState(result.user);
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
  }, []);

  function setUser(user: User) {
    setUserState(user);
  }

  function clearUser() {
    localStorage.removeItem("token");
    setUserState(null);
  }

  return (
    <UserContext.Provider value={{ user, loading, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

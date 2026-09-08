import { useCallback, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';
import { AuthContext } from './auth-context';

const TOKEN_KEY = 'el_token';
const USER_KEY = 'el_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await loginUser({ email, password });
    persist(newToken, newUser);
    return newUser;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const { token: newToken, user: newUser } = await registerUser({ name, email, password, role });
    persist(newToken, newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

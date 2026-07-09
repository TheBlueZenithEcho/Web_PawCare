import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

const STORAGE_KEY = 'customer_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Read user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('AuthContext: Error reading user from localStorage', e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Listen for storage events (multi-tab sync)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;

      if (e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Login: save user to localStorage + state, dispatch custom event for same-tab listeners
  const login = useCallback((userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);

    // Dispatch a custom event so other contexts in the same tab can react immediately
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: userData } }));
  }, []);

  // Logout: clear localStorage + state, redirect to login
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);

    window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: null } }));

    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, authLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

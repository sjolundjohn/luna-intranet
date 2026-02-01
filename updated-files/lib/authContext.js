import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Simple password for the intranet - can be changed via environment variable
const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || 'luna2026';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('luna_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      setUser({ name: 'Luna Team Member' });
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    if (password === SITE_PASSWORD) {
      localStorage.setItem('luna_auth', 'authenticated');
      setIsAuthenticated(true);
      setUser({ name: 'Luna Team Member' });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('luna_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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

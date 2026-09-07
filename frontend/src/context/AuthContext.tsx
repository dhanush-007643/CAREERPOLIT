import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, FresherProfile, Company } from '../types';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  profile: FresherProfile | Company | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('careerpilot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<FresherProfile | Company | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('careerpilot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: toastError, info } = useToast();

  const clearAuth = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('careerpilot_token');
    localStorage.removeItem('careerpilot_user');
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('careerpilot_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('careerpilot_user', JSON.stringify(res.data.user));
      } else {
        clearAuth();
      }
    } catch (err: any) {
      console.warn('Session refresh failed:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      clearAuth();
    };
    window.addEventListener('careerpilot:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('careerpilot:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password: pass });
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('careerpilot_token', res.data.token);
        localStorage.setItem('careerpilot_user', JSON.stringify(res.data.user));
        success(`Welcome back, ${res.data.user.name}!`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please verify your credentials.';
      toastError('Authentication Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('careerpilot_token', res.data.token);
        localStorage.setItem('careerpilot_user', JSON.stringify(res.data.user));
        success('Account Created', 'Your CareerPilot workspace is ready.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' ? 'Cannot connect to backend server. Make sure server is running on port 5000.' : 'Registration failed.');
      toastError('Registration Error', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore
    } finally {
      clearAuth();
      info('Logged Out', 'You have been safely signed out.');
    }
  };

  // Quick Persona switcher for instant demo testing
  const switchDemoRole = async (targetRole: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      FRESHER: { email: 'fresher@demo.com', pass: 'Password123!' },
      STARTUP: { email: 'startup@demo.com', pass: 'Password123!' },
      ADMIN: { email: 'admin@demo.com', pass: 'Password123!' },
    };

    const target = demoCredentials[targetRole];
    if (target) {
      info('Switching Persona', `Logging into demo ${targetRole} workspace...`);
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

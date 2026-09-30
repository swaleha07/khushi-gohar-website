'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, SavedAddress } from '@/types';

interface SendOtpResult {
  success: boolean;
  maskedPhone?: string;
  cooldownSeconds?: number;
  suggestSignup?: boolean;
  suggestLogin?: boolean;
  error?: string;
}

interface VerifyOtpResult {
  success: boolean;
  user?: AuthUser;
  isNewUser?: boolean;
  remainingAttempts?: number;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup';
  redirectUrl: string | null;
  openAuthModal: (view?: 'login' | 'signup', redirect?: string) => void;
  closeAuthModal: () => void;
  sendOtp: (phone: string, countryCode: string, mode: 'login' | 'signup') => Promise<SendOtpResult>;
  verifyOtp: (phone: string, countryCode: string, otp: string, name?: string) => Promise<VerifyOtpResult>;
  updateName: (name: string) => Promise<boolean>;
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => Promise<boolean>;
  deleteSavedAddress: (addressId: string) => Promise<boolean>;
  setDefaultSavedAddress: (addressId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Fetch current session on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('kg_auth_user', JSON.stringify(data.user));
          return;
        }
      }
      // If server session invalid, clear local cache
      setUser(null);
      localStorage.removeItem('kg_auth_user');
    } catch {
      // Offline fallback to local cache
      const cached = localStorage.getItem('kg_auth_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (view: 'login' | 'signup' = 'login', redirect?: string) => {
    setAuthModalView(view);
    if (redirect) setRedirectUrl(redirect);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setRedirectUrl(null);
  };

  const sendOtp = async (
    phone: string,
    countryCode: string = '+91',
    mode: 'login' | 'signup' = 'login'
  ): Promise<SendOtpResult> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode, mode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Failed to send OTP.',
          suggestSignup: data.suggestSignup,
          suggestLogin: data.suggestLogin,
        };
      }

      return {
        success: true,
        maskedPhone: data.maskedPhone,
        cooldownSeconds: data.cooldownSeconds || 60,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error. Please check your internet connection.',
      };
    }
  };

  const verifyOtp = async (
    phone: string,
    countryCode: string = '+91',
    otp: string,
    name?: string
  ): Promise<VerifyOtpResult> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode, otp, name }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'OTP verification failed.',
          remainingAttempts: data.remainingAttempts,
        };
      }

      setUser(data.user);
      localStorage.setItem('kg_auth_user', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        isNewUser: data.isNewUser,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error while verifying OTP.',
      };
    }
  };

  const updateName = async (name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_name', name }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kg_auth_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addSavedAddress = async (address: Omit<SavedAddress, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_address', address }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kg_auth_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteSavedAddress = async (addressId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_address', addressId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kg_auth_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const setDefaultSavedAddress = async (addressId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default_address', addressId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kg_auth_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      localStorage.removeItem('kg_auth_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalView,
        redirectUrl,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        updateName,
        addSavedAddress,
        deleteSavedAddress,
        setDefaultSavedAddress,
        logout,
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

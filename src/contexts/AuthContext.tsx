import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hasPin, setPin, clearPin as removePin, verifyPin, changePin } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPinSet: boolean;
  login: (pin: string) => Promise<{ success: boolean; lockedUntil?: number }>;
  logout: () => void;
  lock: () => void;
  userSetPin: (pin: string) => Promise<void>;
  userChangePin: (currentPin: string, newPin: string) => Promise<boolean>;
  userRemovePin: (currentPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPinSet, setHasPinSet] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  async function checkPinStatus() {
    try {
      const pinExists = await hasPin();
      setHasPinSet(pinExists);
      
      if (!pinExists) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(pin: string): Promise<{ success: boolean; lockedUntil?: number }> {
    const result = await verifyPin(pin);
    if (result.success) {
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, lockedUntil: result.lockedUntil };
  }

  function logout() {
    setIsAuthenticated(false);
  }

  function lock() {
    setIsAuthenticated(false);
  }

  async function userSetPin(pin: string): Promise<void> {
    await setPin(pin);
    setHasPinSet(true);
    setIsAuthenticated(true);
  }

  async function userChangePin(currentPin: string, newPin: string): Promise<boolean> {
    const success = await changePin(currentPin, newPin);
    return success;
  }

  async function userRemovePin(currentPin: string): Promise<boolean> {
    const result = await verifyPin(currentPin);
    if (result.success) {
      await removePin();
      setHasPinSet(false);
      return true;
    }
    return false;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasPinSet,
        login,
        logout,
        lock,
        userSetPin,
        userChangePin,
        userRemovePin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
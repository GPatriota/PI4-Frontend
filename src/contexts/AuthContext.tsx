import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { findById } from '../database/users';
import type { User } from '../types';

const USER_ID_KEY = '@electroshop_user_id';

type AuthContextType = {
  isLoading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  logout: () => {},
  setUser: () => {},
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_ID_KEY)
      .then((stored) => {
        if (stored) {
          const id = parseInt(stored, 10);
          const found = findById(id);
          if (found) setUserState(found);
        }
      })
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, []);

  function setUser(u: User | null) {
    setUserState(u);
    if (u) {
      AsyncStorage.setItem(USER_ID_KEY, String(u.id));
    } else {
      AsyncStorage.removeItem(USER_ID_KEY);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isLoading, logout, setUser, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

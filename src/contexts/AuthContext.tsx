import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCurrentUser } from '../api/e2e';
import type { User } from '../types';

const USER_ID_KEY = '@electroshop_user_id';
const ACCESS_TOKEN_KEY = '@electroshop_access_token';
const REFRESH_TOKEN_KEY = '@electroshop_refresh_token';

type AuthContextType = {
  accessToken: string | null;
  isLoading: boolean;
  logout: () => void;
  refreshToken: string | null;
  setSession: (user: User | null, tokens?: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: User | null) => void;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isLoading: true,
  logout: () => {},
  refreshToken: null,
  setSession: () => {},
  setUser: () => {},
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(USER_ID_KEY), AsyncStorage.getItem(ACCESS_TOKEN_KEY), AsyncStorage.getItem(REFRESH_TOKEN_KEY)])
      .then(async ([storedUserId, storedAccessToken, storedRefreshToken]) => {
        if (storedUserId && storedAccessToken) {
          try {
            const currentUser = await getCurrentUser(storedAccessToken);
            setUserState(currentUser);
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
          } catch {
            await Promise.all([
              AsyncStorage.removeItem(USER_ID_KEY),
              AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
              AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
            ]);
          }
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
      Promise.all([
        AsyncStorage.removeItem(USER_ID_KEY),
        AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]).catch(() => undefined);
      setAccessToken(null);
      setRefreshToken(null);
    }
  }

  function setSession(u: User | null, tokens?: { accessToken: string; refreshToken: string }) {
    setUserState(u);
    if (u && tokens) {
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      Promise.all([
        AsyncStorage.setItem(USER_ID_KEY, String(u.id)),
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
      ]).catch(() => undefined);
      return;
    }

    setAccessToken(null);
    setRefreshToken(null);
    Promise.all([
      AsyncStorage.removeItem(USER_ID_KEY),
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]).catch(() => undefined);
  }

  function logout() {
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, logout, refreshToken, setSession, setUser, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

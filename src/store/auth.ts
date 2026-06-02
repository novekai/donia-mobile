// Auth store (zustand) — persists user + JWT to AsyncStorage
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from '../api/types';

type User = AuthResponse['user'];

type AuthState = {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  hydrated: boolean;
  signIn: (auth: AuthResponse) => void;
  signOut: () => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      hydrated: false,
      signIn: (auth) => set({ user: auth.user, token: auth.token, expiresAt: auth.expiresAt }),
      signOut: () => set({ user: null, token: null, expiresAt: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'donia-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Fires even when storage was empty (first install) — guarantees hydrated=true
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHydrated();
      },
      partialize: (state) => ({ user: state.user, token: state.token, expiresAt: state.expiresAt }),
    },
  ),
);

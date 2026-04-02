import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'driver' | null;

interface AuthState {
  user: {
    mobile: string;
    role: UserRole;
  } | null;
  isAuthenticated: boolean;
  login: (mobile: string, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (mobile, role) => set({ user: { mobile, role }, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'fleettrack-auth',
    }
  )
);

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  role: string;
}

interface AuthState {
  user: User | null;
  login: (role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (role: string) => set({ user: { role } }),
      logout: () => {
        set({ user: null });
        // localStorage도 함께 클리어
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
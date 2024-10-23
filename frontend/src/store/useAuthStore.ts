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
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 선택적으로 특정 상태만 저장하고 싶다면:
      partialize: (state) => ({ user: state.user }),
    }
  )
);
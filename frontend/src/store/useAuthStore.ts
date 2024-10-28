import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CustomToast } from '@/components/CustomToast';

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
        localStorage.removeItem('auth-storage'); // localStorage도 함께 클리어
        CustomToast("로그아웃 되었습니다."); // 로그아웃 메시지 출력
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

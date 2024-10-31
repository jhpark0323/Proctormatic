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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (role: string) => set({ user: { role } }),
  logout: () => {
    set({ user: null });
    localStorage.removeItem('userRole');
    CustomToast("로그아웃 되었습니다.");
  },
}));
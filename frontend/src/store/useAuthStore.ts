import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '@/utils/axios';
import { CustomToast } from '@/components/CustomToast';

interface User {
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  hostLogin: (email: string, password: string) => Promise<void>;
  takerLogin: () => void;
  logout: () => void;
  setUserName: (name: string) => void;
  initializeFromToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      hostLogin: async (email: string, password: string) => {
        try {
          // 로그인 요청
          const loginResponse = await axiosInstance.post('/users/login/', { email, password });
          if (loginResponse.status === 200) {
            const { access, refresh } = loginResponse.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            
            // 토큰을 저장한 후 사용자 정보를 가져옴
            const userResponse = await axiosInstance.get('/users/');
            if (userResponse.status === 200) {
              set({ 
                user: { 
                  role: 'host',
                  name: userResponse.data.name 
                } 
              });
            }
          }
        } catch (error) {
          console.error("로그인 실패:", error);
          throw new Error('로그인 실패');
        }
      },

      takerLogin: () => {
        set({ user: { role: 'taker' } });
      },

      logout: () => {
        set({ user: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        CustomToast("로그아웃 되었습니다.");
      },

      setUserName: (name: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, name } });
        }
      },

      initializeFromToken: async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && !get().user) {
          try {
            const response = await axiosInstance.get('/users/');
            if (response.status === 200) {
              set({ 
                user: { 
                  role: 'host',
                  name: response.data.name 
                } 
              });
            }
          } catch (error) {
            console.error("토큰 검증 실패:", error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
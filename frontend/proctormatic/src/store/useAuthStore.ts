import {create} from 'zustand';
import axiosInstance from '../utils/axios';

// interface AuthState {
//   user: { role: string } | null;
//   token: string | null;
//   setUser: ( user: { role: string } | null ) => void;
//   fetchUser: () => void;
//   logout: () => void;
// }

// 테스트용 코드 추후 삭제 요망 //////////////////////////////

interface AuthState {
  user: { role: string } | null;
  login: (role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (role) => set({ user: { role } }),
  logout: () => set({ user: null }),
}));



///////////////////////////////////////////////////////////



// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   token: localStorage.getItem('token'),
//   setUser: (user) => set({ user }),
//   fetchUser: async () => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const response = await axiosInstance.get('/auth/me');
//         set({ user: response.data });
//       } catch (error) {
//         console.error('Failed to fetch user:', error);
//         localStorage.removeItem('token');
//         set({ user: null });
//       }
//     }
//   },
//   logout: () => {
//     localStorage.removeItem('token');
//     set({ user: null, token: null });
//   },
// }));
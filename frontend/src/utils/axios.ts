import axios from "axios";
import { useAuthStore } from '@/store/useAuthStore';

const baseURL = 'https://k11s209.p.ssafy.io/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터에서 localStorage로 accessToken 가져오기
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 에러 발생 시 refreshToken으로 새 accessToken 발급 및 재요청
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    // 토큰 만료로 인한 401 오류 && refreshToken 존재 && 첫 시도
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.messages?.[0]?.message === "유효하지 않거나 만료된 토큰입니다" &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 중복 요청 방지

      try {
        // refreshToken으로 새 accessToken 요청
        const tokenResponse = await axios.post(`${baseURL}/users/login/`, {
          refresh: refreshToken,
        });

        const newAccessToken = tokenResponse.data.access;

        // 로컬 스토리지에 새 accessToken 저장
        localStorage.setItem("accessToken", newAccessToken);

        // 원래 요청의 Authorization 헤더 업데이트 후 재시도
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        
        return axiosInstance(originalRequest);
      } catch (tokenError) {
        // 새 토큰 발급 실패 시 토큰 삭제 및 로그아웃 처리
        useAuthStore.getState().logout(); // 로그아웃 처리
        window.location.href = "/"; // 메인 페이지로 이동
        console.log('세션이 만료되어 다시 로그인 해주세요')  // 추후 토스트로 알림 메시지 출력하기
        return Promise.reject(tokenError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

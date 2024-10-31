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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.messages?.[0]?.message === "유효하지 않거나 만료된 토큰입니다" &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const tokenResponse = await axios.post(`${baseURL}/users/login/`, {
          refresh: refreshToken,
        });

        const newAccessToken = tokenResponse.data.access;
        
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        
        return axiosInstance(originalRequest);
      } catch (tokenError) {
        useAuthStore.getState().logout(); // 로그아웃 처리
        window.location.href = "/login";
        return Promise.reject(tokenError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

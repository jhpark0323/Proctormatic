import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser', // 'terser'를 사용해 최적화
    terserOptions: {
      compress: false, // 압축 해제
      mangle: false, // 난독화 해제
    },
  },
  // @mediapipe/face_mesh 모듈을 사전 번들링하도록 설정
  optimizeDeps: {
    include: ['@mediapipe/face_mesh'], // Vite가 이 모듈을 사전 번들링
  }
});

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
});

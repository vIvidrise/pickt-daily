import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vercel 프로젝트 설정(Output Directory: dist/web)과 정합 맞춤
    outDir: 'dist/web',
    emptyOutDir: true,
  },
  server: {
    host: 'localhost', // host: true 시 일부 환경에서 오류 나면 localhost로 고정
    port: 5174,
  },
})

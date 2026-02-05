import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // host: true 시 일부 환경에서 오류 나면 localhost로 고정
    port: 5173,
  },
})

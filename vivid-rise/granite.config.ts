import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'pickt-daily',
  brand: {
    displayName: 'pickt-daily', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: '', // 콘솔에서 업로드한 아이콘 URL 또는 빈 문자열
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});

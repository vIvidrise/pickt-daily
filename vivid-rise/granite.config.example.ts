/**
 * 앱인토스 .ait 빌드용 설정 예시
 * npx ait init 실행 후 생성되는 granite.config.ts 참고용.
 * 실제 사용 시 파일명을 granite.config.ts 로 바꾸고, appName을 콘솔 앱 이름과 맞추세요.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'pickt-daily', // ⚠️ 앱인토스 콘솔에서 만든 앱 이름과 동일하게
  brand: {
    displayName: '요즘 뭐 함',
    primaryColor: '#3182F6',
    icon: '', // 콘솔 앱정보에서 업로드한 아이콘 URL 또는 ''
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
});

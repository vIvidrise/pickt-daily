import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'pickt-daily', // 콘솔에 등록한 앱 ID와 동일
  brand: {
    displayName: '요즘 뭐 함', // 반려 2: 앱 정보와 동일한 미니앱 이름. 내비게이션 바 로고는 brand.icon 사용
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/17423/a90bb6b4-e696-4311-b778-26b83348ff46.png', // 콘솔 앱정보 업로드 이미지 URL (우클릭→링크복사)
    iconDark: 'https://static.toss.im/appsintoss/17423/565b11f0-5433-4b65-8005-a83d5fcdede7.png',
  } as { displayName: string; primaryColor: string; icon: string; iconDark?: string },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    initialAccessoryButton: {
      id: 'heart',
      title: '찜한 장소',
      icon: { name: 'icon-heart-mono' },
    },
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
  webViewProps: {
    type: 'partner', // 비게임 미니앱 (게임이면 'game')
  },
});

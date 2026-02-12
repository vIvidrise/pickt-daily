/**
 * 앱인토스(비게임) WebView 설정
 * - 앱인토스 CLI/샌드박스에서 미니앱 실행 시 이 설정을 사용합니다.
 * - 내비게이션 바: 뒤로가기, 홈 버튼, 액세서리(찜 하트) 1개.
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/Config.html
 */

// defineConfig를 사용하려면 @apps-in-toss/web-framework 설치 후 아래 주석 해제 후 사용
// import { defineConfig } from '@apps-in-toss/web-framework/config';

const navigationBar = {
  withBackButton: true,
  withHomeButton: true,
  initialAccessoryButton: {
    id: 'heart',
    title: '찜한 장소',
    icon: { name: 'icon-heart-mono' },
  },
};

/** 앱인토스 CLI에서 사용할 수 있도록 동일 형태의 설정 객체 export */
export default {
  appName: 'pickt-daily', // 콘솔에 등록한 앱 ID와 동일
  brand: {
    displayName: '요즘 뭐 함', // 사용자에게 노출될 앱 이름 (콘솔과 동일)
    primaryColor: '#3182F6', // 앱 기본 색상(hex), 버튼 등에 적용
    icon: 'https://static.toss.im/appsintoss/17423/a90bb6b4-e696-4311-b778-26b83348ff46.png', // 기본 모드
    iconDark: 'https://static.toss.im/appsintoss/17423/565b11f0-5433-4b65-8005-a83d5fcdede7.png', // 다크모드 로고
  },
  web: {
    host: 'localhost',
    port: 5174,
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
  navigationBar,
};

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
  appName: 'vivid-rise',
  brand: {
    displayName: '요즘 뭐 함',
    primaryColor: '#3182F6',
    icon: '/logo.png', // 배포 시 콘솔에 업로드한 이미지 절대 URL로 교체 권장
  },
  web: {
    host: 'localhost',
    port: 5173,
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

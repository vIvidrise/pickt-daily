# 앱인토스 .ait 파일 제출 가이드

[앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/) · [WebView 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/webview.html) · [미니앱 출시](https://developers-apps-in-toss.toss.im/development/deploy.html)

---

## 제출용 .ait 파일 뽑는 순서 (순서대로 실행)

### 1. 앱인토스 웹 프레임워크 설치

```bash
cd /Users/ad/Desktop/pickt-daily/vivid-rise
npm install @apps-in-toss/web-framework
```

### 2. 환경 구성 (한 번만 실행)

```bash
npx ait init
```

- **프레임워크**: `web-framework` 선택
- **앱 이름(appName)**: 앱인토스 콘솔에서 만든 앱 이름과 **동일하게** 입력 (예: `pickt-daily` 또는 콘솔에 등록한 이름)
- **dev 명령어**: `vite` 입력
- **build 명령어**: `vite build` 입력
- **포트**: `5173` 입력

→ 실행 후 `granite.config.ts` 파일이 생성됩니다.

### 3. granite.config.ts 수정 (필요 시)

생성된 `granite.config.ts`에서 아래를 확인·수정하세요.

- **appName**: 콘솔 앱 이름과 일치
- **brand.displayName**: `요즘 뭐 함` (노출용 한글 이름)
- **brand.primaryColor**: `#3182F6` (토스 블루)
- **brand.icon**: 콘솔 앱정보에서 업로드한 아이콘 URL (우클릭 → 링크 복사 후 붙여넣기). 없으면 `''` 로 두어도 됨.
- **web.commands.dev**: `vite` 또는 `vite --host`
- **web.commands.build**: `vite build`
- **outdir**: 기본값 `dist` (Vite 빌드 결과와 동일하면 수정 불필요)

### 4. .ait 파일 빌드

```bash
npx granite build
```

또는 (패키지에 따라):

```bash
npm run build
npx ait build
```

- `vite build`가 먼저 실행되고, 그 결과물(`dist`)을 기준으로 **.ait** 파일이 생성됩니다.
- 생성된 **.ait** 파일은 프로젝트 루트 또는 `dist` 상위 폴더에 있을 수 있습니다.

### 5. 앱인토스 콘솔에 업로드

1. [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/) → 콘솔 로그인
2. 해당 앱 선택 → **앱 번들 업로드** (또는 출시 메뉴에서 번들 업로드)
3. 생성된 **.ait** 파일 선택 후 업로드
4. **검토 요청하기** → 승인 후 **출시하기**

---

## 참고

- **번들 용량**: 압축 해제 기준 **100MB 이하**만 업로드 가능. 이미지·리소스는 최소화하거나 CDN 사용 권장.
- **비게임 WebView**: TDS(Toss Design System) 사용이 검수 기준에 포함될 수 있음. [TDS WebView](https://tossmini-docs.toss.im/tds-mobile/) 참고.
- **진입 URL**: 현재 실서비스는 `https://pickt-daily.vercel.app/` 로 운영 중. .ait 번들은 토스 CDN에 호스팅되며, 콘솔에서 설정한 앱 주소(`intoss://{appName}` 등)로 접근합니다.

---

## 한 줄 요약

```bash
cd /Users/ad/Desktop/pickt-daily/vivid-rise
npm install @apps-in-toss/web-framework
npx ait init
# (appName, dev/build 명령, 포트 입력)
npx granite build
# 생성된 .ait 파일을 앱인토스 콘솔에 업로드
```

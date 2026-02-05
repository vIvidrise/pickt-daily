# 요즘 뭐 함 (vivid-rise)

React + Vite 기반 웹앱.

## 앱인토스(비게임) 출시 체크리스트 요약

앱인토스 등록 시 [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.html)에 맞춰 아래를 반영해 두었습니다.

| 항목 | 적용 내용 |
|------|-----------|
| **시스템 모드** | 라이트 모드만 사용 (`color-scheme: light`, `theme-color`, `html { color-scheme: light }`) |
| **확대/축소** | 핀치줌 비활성화 (`viewport`: `maximum-scale=1.0, user-scalable=no`) |
| **접근성** | 버튼/아이콘에 `aria-label` 추가, 터치 영역 최소 44px (`.icon-btn`에 `min-width/min-height`) |
| **내비게이션** | 토스 앱 내 WebView에서는 **네이티브 내비게이션 바** 사용 (뒤로가기·홈·액세서리 1개). 브라우저에서는 커스텀 헤더 표시. |

**내비게이션 바 설정**
- [내비게이션 바 설정](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html)에 맞춰 `app.config.js`에 `navigationBar`(withBackButton, withHomeButton, initialAccessoryButton)를 두었습니다.
- 토스 앱 안에서 열리면 `window.partner` / `window.tdsEvent`가 있는지 보고, 있으면 커스텀 헤더를 숨기고(`use-toss-nav`) 액세서리 버튼(찜)만 연동합니다.

**Safe Area**
- [Safe Area 여백 값 구하기](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면%20제어/safe-area.html)에 맞춰, 토스 WebView에서는 `SafeAreaInsets.get()` / `SafeAreaInsets.subscribe()`로 상·하단 여백을 받아 `--safe-area-inset-*` CSS 변수로 적용합니다. 하단 고정 버튼·시트는 해당 변수(또는 `env(safe-area-inset-bottom)`)로 여백을 확보합니다.

**SDK 레퍼런스 (한 눈에 보기) 대응**
- [한 눈에 보기](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/시작하기/overview.html) 기준으로 비게임 WebView에 해당하는 기능을 연동했습니다.
- **이벤트 제어**: `graniteEvent.addEventListener('backEvent')` → 뒤로가기 시 `navigate(-1)`. `appsInTossEvent.addEventListener('entryMessageExited')` → 진입 완료 후 찜 캐시 로드.
- **화면 제어**: `closeView()` → 닫기 버튼/닫기 동작 시 사용. `openURL()` → 네이버 플레이스 등 외부 링크는 `openExternalUrl()`로 호출.
- **저장소**: 찜 목록은 앱인토스에서는 `Storage`(네이티브), 그 외에는 `localStorage` 사용 (`favorites.js` + `appsInTossSdk.js`).

콘솔에서 앱 정보·사업자 인증·대표관리자 승인 후 출시 검토를 진행하세요.

---

## Supabase (나만의 리스트)

추천 메뉴/장소를 Supabase에 저장해 두고 **나만의 리스트**에서 조회할 수 있습니다.

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인 후 **New project**로 새 프로젝트를 만듭니다.
2. **Organization** 선택, **Project name** 입력, **Database password** 설정 후 **Create new project**를 누릅니다.
3. 프로젝트가 준비될 때까지 잠시 기다립니다 (1~2분).

### 2. 스키마 실행 (테이블 생성)

1. Supabase 대시보드 왼쪽 메뉴에서 **SQL Editor**를 엽니다.
2. **New query**를 누른 뒤, 이 프로젝트의 `supabase/schema.sql` 파일 내용 **전체**를 복사해 붙여넣습니다.
3. **Run** (또는 Ctrl/Cmd + Enter)으로 실행합니다.

**생성되는 구조 요약:**

| 테이블 | 역할 |
|--------|------|
| **`menus`** | 추천받은 메뉴/장소 정보 (이름, 카테고리, 태그, 이모지, 네이버 URL, 주소, 대표 메뉴 등). `naver_url`이 같으면 한 행만 유지(UNIQUE). |
| **`user_saved_items`** | “누가 어떤 메뉴를 저장했는지” 매핑. `user_id`(문자열) + `menu_id`(menus.id). 같은 유저가 같은 메뉴를 두 번 저장할 수 없도록 UNIQUE. |

- **RLS(Row Level Security)** 가 켜져 있어, 정책에 따라 조회/삽입/삭제가 제어됩니다. 현재 스키마는 anon 키로도 읽기·쓰기가 가능하도록 넉넉히 열어 둔 상태입니다.
- **인덱스**는 `user_id`, `menu_id`, `naver_url` 검색/조인을 위해 걸려 있습니다.

### 3. .env 설정 (프론트에서 Supabase 접속)

1. 대시보드 왼쪽 **Project Settings** → **API**로 이동합니다.
2. **Project URL**과 **Project API keys** 중 **anon public** 키를 복사합니다.
3. 프로젝트 **루트**에 `.env` 파일을 만들고 아래 두 줄을 넣습니다 (값은 본인 프로젝트 것으로 교체).

   ```env
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**왜 `VITE_` 접두사인가요?**  
Vite는 `VITE_`로 시작하는 환경 변수만 클라이언트(브라우저) 코드에 노출합니다. `src/lib/supabaseClient.js`에서 `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`로 읽습니다. 접두사가 없으면 빌드 결과에 포함되지 않습니다.

**.env는 반드시 루트에 두세요.**  
`vite.config.js`와 같은 위치(프로젝트 루트)에 있어야 Vite가 로드합니다. `.env`는 보통 `.gitignore`에 포함되어 있어, URL·키가 저장소에 올라가지 않도록 합니다.

### 4. 실행 후 사용 흐름

1. 터미널에서 `npm run dev`로 개발 서버를 띄웁니다.
2. 브라우저에서 `http://localhost:5173` (또는 터미널에 나온 주소)로 접속합니다.
3. **오늘 뭐 먹지** 또는 **오늘 뭐 하지**로 추천 플로우를 진행한 뒤, 지도/결과 화면에서 **장소(핀)를 탭**해 상세 시트를 띄웁니다.
4. 상세 시트에서 **저장하기** 버튼을 누르면, 해당 메뉴(장소)가 `menus`에 없으면 넣고, `user_saved_items`에 “현재 유저 + 그 메뉴”가 한 줄 추가됩니다.
5. 홈으로 돌아가 **나만의 리스트** 카드를 누르거나, 주소창에 `/#/saved`를 입력해 **나만의 리스트** 페이지로 갑니다. 여기서 Supabase에서 가져온 저장 목록을 보고, **네이버에서 보기** / **삭제**를 할 수 있습니다.

정리하면: **추천 받기 → (결과에서 장소 선택) → 상세에서 저장하기 → 홈에서 나만의 리스트로 확인** 순서입니다.

### 5. 의존성 (@supabase/supabase-js)

이미 `package.json`에 `@supabase/supabase-js`가 들어 있습니다.  
Supabase에 HTTP로 요청을 보내고, Realtime 등 부가 기능을 쓰는 공식 클라이언트입니다.  
추가로 설치할 것은 없고, `npm install`만 해 두면 `src/lib/supabaseClient.js`에서 `createClient`를 사용할 수 있습니다.

### 6. 유저 ID와 토스 로그인 연동

- **지금:** 로그인 없이 “이 기기”를 구분하기 위해 **localStorage에 UUID를 저장**해 씁니다.  
  `src/utils/userId.js`의 `getOrCreateUserId()`가 그 값을 만들거나 읽어 옵니다.  
  그래서 **같은 브라우저(같은 기기)**에서는 “나만의 리스트”가 유지되고, **다른 기기/다른 브라우저**에서는 다른 사람처럼 다른 리스트가 됩니다.

- **나중에 토스 로그인을 붙일 때:**  
  앱인토스 문서의 [토스 로그인 - 인가 코드 받기](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/로그인/appLogin.html) 등으로 로그인한 뒤, 받은 **유저 식별자(또는 인가 코드로 조회한 유저 ID)**를 사용하면 됩니다.  
  그때는 `src/utils/userId.js`의 `getOrCreateUserId()`가 **localStorage 대신 토스에서 받은 유저 ID를 반환**하도록 바꾸면 됩니다.  
  그러면 “나만의 리스트”가 토스 계정 기준으로 묶여서, 기기를 바꿔도 같은 리스트를 볼 수 있습니다.

---

## 휴대폰에서 접속하기 (노트북 닫은 뒤에도 확인하고 싶을 때)

1. **노트북과 휴대폰을 같은 Wi‑Fi에 연결**한 뒤, 노트북에서 터미널에 `npm run dev` 실행.
2. 터미널에 **`Network: http://192.168.x.x:5173`** 처럼 나오는 주소를 확인합니다.
3. 휴대폰 브라우저에서 **그 주소**를 입력해 접속합니다.
4. **네이버 지도**가 휴대폰에서도 나오게 하려면, NCP 콘솔 → Maps → 웹 서비스 URL에  
   `http://192.168.x.x:5173` 와 `http://192.168.x.x:5173/` 를 추가해 두세요.

**참고:** 노트북 뚜껑을 닫으면 절전 모드로 들어가 서버가 끊길 수 있습니다. 휴대폰으로만 확인하려면  
- 전원 설정에서 **뚜껑 닫을 때 아무 동작 안 함**으로 두거나,  
- 뚜껑을 연 채로 두고 사용하세요.

---

## Vercel로 배포하기 (실서비스 URL 받기)

앱인토스·NCP에 등록할 **실서비스 URL**(예: `https://xxx.vercel.app`)을 받으려면, Vercel에 프로젝트를 배포하면 됩니다. 무료 플랜으로 사용 가능합니다.

### 1. 로컬에서 빌드 확인

배포 전에 빌드가 되는지 먼저 확인합니다.

```bash
cd vivid-rise
npm install   # 최초 1회 또는 package.json 변경 후
npm run build
```

- 성공하면 프로젝트 루트에 **`dist`** 폴더가 생깁니다.
- 이 폴더 안에 `index.html`, `assets/` 등이 들어가며, Vercel은 이 결과물을 그대로 서빙합니다.
- 빌드 에러가 나오면 에러 메시지를 보고 수정한 뒤 다시 `npm run build`를 실행하세요.

### 2. Vercel 가입

1. 브라우저에서 [vercel.com](https://vercel.com) 접속.
2. **Sign Up** → **Continue with GitHub** (또는 GitLab, Bitbucket, Email) 선택해 가입합니다.
3. GitHub로 로그인하면, 나중에 저장소를 연결해 **push할 때마다 자동 배포**할 수 있습니다.

### 3. 배포 방법 (둘 중 하나 선택)

#### 방법 A: GitHub 저장소 연결 (추천)

1. 이 프로젝트를 **GitHub 저장소**로 push해 둡니다.
2. Vercel 대시보드에서 **Add New** → **Project** 클릭.
3. **Import Git Repository**에서 해당 저장소를 선택합니다.
4. **Configure Project** 화면에서:
   - **Framework Preset**: Vite 감지되면 `Vite`로 둡니다.
   - **Root Directory**: 프로젝트가 저장소 루트에 있으면 비워 둡니다. `vivid-rise` 폴더만 저장소라면 그 폴더를 지정할 수 있습니다.
   - **Build Command**: `npm run build` (기본값).
   - **Output Directory**: `dist` (Vite 기본값).
   - **Install Command**: `npm install` (기본값).
5. **Deploy** 클릭.
6. 빌드가 끝나면 **Visit** 또는 상단의 URL(예: `https://vivid-rise-xxxx.vercel.app`)이 **실서비스 URL**입니다.
7. 이후 GitHub에 push할 때마다 자동으로 다시 빌드·배포됩니다.

#### 방법 B: 수동 업로드 (Git 사용 안 할 때)

1. 위에서 만든 **`dist`** 폴더만 준비합니다 (`npm run build` 완료 후).
2. Vercel 대시보드 **Add New** → **Project** → **Deploy** 화면에서 **Browse** 또는 **Upload**로 `dist` 폴더 내용을 올립니다.  
   (또는 Vercel CLI 설치 후 `vercel dist`로 업로드할 수 있습니다.)
3. 배포가 끝나면 발급된 URL이 실서비스 URL입니다.  
   단, 이 방법은 수동 업로드할 때마다만 갱신되므로, 보통은 방법 A를 쓰는 편이 편합니다.

### 4. 배포 후 나오는 주소

- 예: `https://vivid-rise-abc123.vercel.app`
- 이 주소가 **실서비스 URL**입니다.
- **앱인토스 콘솔**에 미니앱 URL로 이 주소를 등록하고, **NCP(네이버 지도)** 웹 서비스 URL에도 같은 주소(및 `https://...vercel.app/`)를 추가하면 됩니다.

### 5. HashRouter와 URL 형태

- 이 프로젝트는 **HashRouter**를 쓰고 있어서, 실제 이동 경로는 다음처럼 **`#` 뒤**에 붙습니다.
  - 홈: `https://xxx.vercel.app/` 또는 `https://xxx.vercel.app/#/`
  - 결과: `https://xxx.vercel.app/#/result`
- Vercel 기본 설정만으로도 `/#/...` 형태는 정상 동작합니다. 서버는 항상 `index.html`을 주고, 라우팅은 브라우저에서 React Router가 처리합니다.
- 만약 **직접 주소 입력**이나 **새로고침** 시 404가 나온다면, Vercel **Project Settings** → **Rewrites**에서 SPA 폴백을 넣을 수 있습니다.  
  - Source: `/(.*)`  
  - Destination: `/index.html`  
  HashRouter는 보통 이 단계 없이도 동작하는 경우가 많습니다.

### 6. 커스텀 도메인 (선택)

- 나중에 본인 도메인(예: `https://yojeum-mwoham.com`)을 쓰려면:
  - Vercel **Project** → **Settings** → **Domains**에서 도메인을 추가하고, 안내에 따라 DNS에 CNAME 또는 A 레코드를 설정하면 됩니다.
- 앱인토스·NCP에는 **최종 접속 URL**(Vercel 기본 주소 또는 커스텀 도메인)만 등록하면 됩니다.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

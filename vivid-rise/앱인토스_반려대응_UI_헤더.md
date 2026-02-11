# 앱인토스 반려 사유 대응: UI/UX (헤더·앱명)

## 1. 웹뷰 자체 헤더 제거 (플랫폼 공통 바 사용) — ✅ 코드 반영 완료

- **요청:** 웹뷰 상단의 자체 구현 헤더 컴포넌트를 제거하고, 플랫폼 공통 바만 사용해 주세요.
- **조치:**
  - 토스 미니앱 WebView에서 실행될 때(`isAppsInTossEnv() === true`) **자체 헤더를 렌더링하지 않도록** 수정했습니다.
  - 적용 페이지: Home, Select, Confirm, Result, Saved, Fortune, FortuneResult.
  - 토스 도메인(`tossmini.com`, `private-apps.tossmini` 등)에서 열릴 때도 플랫폼 공통 바만 보이도록 환경 감지를 보강했습니다.
- **파일:** `src/utils/appsInTossNav.js`, 각 페이지(Home, Result, Saved, Confirm, Select, Fortune, FortuneResult).

---

## 2. 공통 내비게이션 바: 브랜드 로고 + 앱 표시 명칭 '요즘 뭐 함'

- **요청:** 공통 내비게이션 바에 브랜드 로고를 추가하고, 앱 표시 명칭을 **'요즘 뭐 함'**으로 변경해 주세요.

### 2-1. defineConfig(WebView 설정) — 프로젝트 설정 파일

네비게이션 바·로고는 **콘솔 설정**과 **프로젝트 defineConfig**가 일치해야 합니다.

| 항목 | 설명 | 이 앱 설정값 |
|------|------|--------------|
| **appName** | 콘솔에 등록한 앱 ID | `pickt-daily` |
| **brand.displayName** | 사용자에게 노출될 앱 이름 (콘솔과 동일) | `요즘 뭐 함` |
| **brand.primaryColor** | 앱 기본 색상(hex), 버튼 등에 적용 | `#3182F6` |
| **brand.icon** | 앱 로고 이미지 URL | 콘솔 앱 정보에서 업로드한 이미지 **우클릭 → 링크 복사** 후 `granite.config.ts` / `app.config.js`의 `brand.icon`에 입력 |
| **webViewProps.type** | 미니앱 타입 (게임: `game`, 비게임: `partner`) | `partner` |

- **설정 파일:** `granite.config.ts`(defineConfig), `app.config.js`
- **로고 URL:** 콘솔의 앱 정보에서 업로드한 이미지를 우클릭해 링크 복사 후 위 `icon` 필드에 넣어 주세요.
- **다크모드 로고:** `brand.iconDark`에 다크모드 로고 URL 적용됨. (쉘에서 지원 시 자동 사용)

### 2-2. 콘솔에서 설정

1. [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/) 로그인 후 해당 앱 선택.
2. **앱 정보** 또는 **앱 설정** 메뉴에서:
   - **앱 이름(표시 명칭)** → **요즘 뭐 함**으로 입력·저장.
   - **앱 아이콘 / 브랜드 로고** → 공통 내비게이션 바에 노출할 로고 이미지 업로드(권장: 정사각형, 512x512 또는 가이드에 맞는 크기).
3. 내비게이션 바 관련 설정이 별도 메뉴(예: **테마/네비게이션**)에 있으면, там에서 로고·타이틀 설정 여부 확인.

콘솔 메뉴명이 버전에 따라 다를 수 있으니, "앱 이름", "앱 아이콘", "네비게이션", "공통 바" 등으로 찾아보면 됩니다.

---

## 3. 운세 추천 식당: 오늘 뭐 먹지 연동 + 네이버 실제 링크·업체 사진 — ✅ 코드 반영 완료

- **요청:** 오늘 내 운세 → 추천 식당 터치 시 네이버 지도에서 선택한 식당이 노출되지 않는 문제. 추천 식당은 **오늘 뭐 먹지에 등록된 식당**으로 연결하고, **네이버 업체 등록 사진**을 보여 주세요.
- **조치:**
  - **추천 식당 목록:** 기존과 동일하게 **오늘 뭐 먹지**와 같은 DB(`getDatabase()` → `regionData.eat`)를 사용해 같은 지역·카테고리 식당 목록을 노출합니다.
  - **네이버 연결:** 행운 장소 로드 후 `/api/naver-place`(네이버 지역 검색 API)로 각 식당의 **실제 플레이스 링크(`link`)** 를 조회해 사용합니다. 터치 시 **선택한 식당 페이지**가 열리도록 했습니다.
  - **식당 사진:** 위 API에서 반환하는 **업체 등록 이미지(`firstImage` → `imageUrl`)** 를 카드 썸네일로 사용합니다. 없으면 기존 기본 이미지 유지.
- **파일:** `src/api/gemini.js`(fetchLuckyPlacesNearby에 `regionKey`/`regionHint` 추가), `src/pages/FortuneResult.jsx`(네이버 API 보강), `src/api/naverPlaceApi.js`, `api/naver-place.js`(서버리스).

### 3-1. 앱인토스에서 선택한 식당 노출 (반려 3 대응)

- **문제:** 운세 추천 식당 터치 시 네이버 지도로 연결되지만, 선택한 식당이 노출되지 않음.
- **조치:** 앱인토스 WebView에서는 `openURL`(openExternalUrl)로 네이버 지도 URL을 열어, 외부 브라우저/네이버 앱에서 해당 장소 상세가 바로 노출되도록 수정함.
- **파일:** `src/utils/naverMapScheme.js` — `isAppsInTossEnv()`일 때 `openExternalUrl(url)` 사용.

### 3-2. 배포 시 반드시 확인 (운세 추천 식당이 “선택한 식당”으로 열리려면)

| 확인 항목 | 설명 |
|-----------|------|
| **1. `/api/naver-place` 호출 가능** | 배포 도메인(예: pickt-daily.vercel.app)에서 `GET /api/naver-place?name=가게명&region=강남` 이 **HTML이 아니라 JSON**으로 응답해야 합니다. 브라우저에서 직접 열어 보세요. |
| **2. Vercel 환경 변수** | Vercel 대시보드 → 해당 프로젝트 → **Settings** → **Environment Variables** 에 다음 두 개가 **반드시** 등록되어 있어야 합니다. |
| | `NAVER_CLIENT_ID` = 네이버 개발자센터에서 발급한 **검색 API** Client ID |
| | `NAVER_CLIENT_SECRET` = 동일 앱의 Client Secret |
| **3. 네이버 API 신청** | [네이버 개발자센터](https://developers.naver.com/apps/#/register) → 애플리케이션 등록 시 **사용 API**에서 **검색**(지역 검색 포함) 선택 후 Client ID/Secret 발급. |
| **4. Rewrite 설정** | `vercel.json`의 rewrites에서 **`/api/*` 경로는 제외**되어 있어야 합니다. (현재 `"source": "/((?!api/).*)"` 로 SPA만 index.html로 보내고, `/api/`는 서버리스 함수가 처리하도록 되어 있음.) |

- **환경 변수 등록 후** Vercel에서 **Redeploy** 한 번 해야 적용됩니다.
- 로컬에서 API 테스트: `vercel dev` 실행 후 같은 origin에서 `/api/naver-place` 호출. 이때는 프로젝트 루트 `.env`에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` 넣으면 됩니다. (`.env.example` 참고.)
- 자세한 설정: `네이버_가게_주소_불러오기.md` 참고.

---

## 4. 앱 내 기능 스킴 등록 (반려 4)

- **요청:** 앱 내 기능 스킴을 최소 한 개 이상 등록해 주세요.
- **조치:**
  1. [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/) 콘솔 로그인 후 해당 앱 선택.
  2. **앱 설정** 또는 **기능 / 스킴 / 딥링크** 관련 메뉴에서 **기능 스킴** 또는 **앱 진입 스킴**을 등록합니다.
  3. WebView 미니앱의 경우 다음 중 최소 1개 이상 등록을 권장합니다.
     - **진입 URL:** 미니앱이 로드되는 웹 주소 (예: `https://vivid-rise.vercel.app/` 또는 콘솔에 등록한 NCP 웹 서비스 URL).
     - **앱 스킴:** 토스 앱 내 미니앱 진입용 스킴 (예: `intoss://pickt-daily` 또는 `intoss://pickt-daily/`). 콘솔 가이드에 따라 `appName`(pickt-daily)과 일치하는 스킴을 등록하면 됩니다.
  4. 콘솔 메뉴명이 **"기능 스킴"**, **"URL 스킴"**, **"딥링크"** 등으로 되어 있을 수 있으니, 해당 앱의 설정 화면에서 한 번씩 확인해 보세요.
- **참고:** [WebView 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/webview.html), [콘솔 가이드](https://developers-apps-in-toss.toss.im/iap/console.html).

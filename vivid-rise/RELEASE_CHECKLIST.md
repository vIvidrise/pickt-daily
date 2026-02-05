# 출시 전 체크리스트

## ✅ 이미 반영된 것
- **앱인토스 비게임**: 라이트 모드, 핀치줌 비활성화, 접근성(aria-label, 44px 터치), Safe Area·내비게이션 연동
- **보안**: `.env`는 `.gitignore`에 포함됨. Supabase anon 키만 사용(서버 키 노출 없음)
- **Supabase 미설정 시**: 나만의 리스트에서 안내 메시지 표시, 앱은 동작
- **지도 실패 시**: 네이버 지도 실패하면 Leaflet(OpenStreetMap)으로 자동 전환

## ⚠️ 출시 전 꼭 할 일

### 1. 네이버 지도 API 키 (필수)
- **현재**: `index.html` 33번째 줄에 `ncpKeyId=tfdaiuu9rx`가 하드코딩되어 있음.
- **키 발급/확인 위치**:
  1. **[네이버 클라우드플랫폼 콘솔](https://console.ncloud.com)** 로그인
  2. **Services** → **Application Services** → **Maps** → **Application** 이동
  3. **애플리케이션 등록**으로 새 앱 생성 (또는 기존 앱 선택)
  4. **Application 수정**에서 **Dynamic Map** 사용 설정이 켜져 있는지 확인 (안 하면 429 오류)
  5. **웹 서비스 URL**에 실서비스 도메인 등록 (예: `https://your-app.com`, 로컬 테스트 시 `http://localhost:5173`)
  6. 해당 애플리케이션의 **Client ID** 값을 복사 → `index.html`의 `ncpKeyId=` 뒤에 붙여넣기
- 출시 도메인을 등록하지 않으면 해당 URL에서 지도가 로드되지 않습니다.
- 상세 가이드: [네이버 지도 API - 클라이언트 아이디 발급](https://navermaps.github.io/maps.js.ncp/docs/tutorial-1-Getting-Client-ID.html)

### 2. Supabase (나만의 리스트 저장용)
- 저장한 메뉴 기능을 쓰려면 `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정.
- 설정하지 않아도 앱은 동작하며, "나만의 리스트"에서 Supabase 미설정 안내만 나옵니다.

### 3. package.json 버전
- `"version": "0.0.0"` → 출시 시 `"1.0.0"` 등으로 변경 권장.

### 4. (선택) 프로덕션 빌드 확인
```bash
npm run build
npm run preview
```
- `dist` 배포 후 실제 기기·브라우저에서 한 번씩 확인하세요.

### 5. (선택) 콘솔 로그
- `console.log` / `console.warn`은 개발용. 프로덕션에서 줄이려면 빌드 시 제거하는 플러그인을 쓰거나, 중요 로그만 남기고 나머지는 제거할 수 있습니다.

---

**요약**: 네이버 지도 키를 실서비스용으로 바꾸고, NCP에 출시 URL을 등록한 뒤 `npm run build`로 빌드해 배포하면 출시 가능합니다.

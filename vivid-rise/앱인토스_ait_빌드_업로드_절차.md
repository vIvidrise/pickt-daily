image.png# 앱인토스 .ait 빌드·업로드 절차

실서비스 코드 변경 후, 토스 앱인토스에 반영하려면 아래 순서대로 진행하세요.

---

## ★ 최신 버전으로 .ait 저장 (한 번에 복사용)

```bash
cd /Users/ad/Desktop/pickt-daily/vivid-rise
npm install --legacy-peer-deps
npm run build
```

- 빌드가 끝나면 프로젝트 폴더에 **pickt-daily.ait** 파일이 생성됩니다.
- 이 파일을 앱인토스 콘솔에서 **앱 번들 업로드**로 올리면 최신 버전이 반영됩니다.

---

## 1. 프로젝트 폴더로 이동

```bash
cd vivid-rise
```

(저장소 루트가 `pickt-daily`라면: `cd pickt-daily/vivid-rise`)

---

## 2. 의존성 설치 (이미 했다면 생략 가능)

```bash
npm install
```

`@apps-in-toss/web-framework`가 없으면:

```bash
npm install @apps-in-toss/web-framework
```

---

## 3. .ait 빌드

```bash
npm run build
```

- 내부적으로 `granite build`가 실행됩니다.
- `vite build`로 웹 빌드 후, 그 결과물을 묶어 **.ait** 파일이 생성됩니다.
- 생성 위치: 프로젝트 루트(`vivid-rise/`) 또는 `dist` 근처.  
  파일명은 보통 **`{appName}.ait`** (예: `pickt-daily.ait`)입니다.

빌드가 실패하면:

- `npm install --legacy-peer-deps` 후 다시 `npm run build`
- Node 버전 18+ 권장

---

## 4. .ait 파일 위치 확인

```bash
# 프로젝트 루트에서
ls -la *.ait
# 또는
ls -la dist/
```

`pickt-daily.ait` (또는 `*.ait`) 파일이 생성됐는지 확인하세요.

---

## 5. 앱인토스 콘솔에서 업로드

1. **개발자센터 접속**  
   [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/) 로그인

2. **앱 선택**  
   해당 미니앱(예: pickt-daily) 선택

3. **번들 업로드**  
   - **앱 번들 업로드** (또는 **출시** → **번들 업로드**) 메뉴로 이동  
   - 위에서 만든 **.ait** 파일 선택 후 업로드

4. **검토·출시**  
   - 필요 시 **검토 요청하기**  
   - 승인 후 **출시하기**로 반영

---

## 6. (선택) CLI로 배포

프로젝트에 `ait deploy`가 설정돼 있다면:

```bash
npm run deploy
```

콘솔에서 직접 업로드하는 것과 동일한 결과인지 문서/설정을 확인한 뒤 사용하세요.

---

## 체크리스트

| 단계 | 내용 |
|------|------|
| 1 | `cd vivid-rise` |
| 2 | `npm install` (필요 시 `--legacy-peer-deps`) |
| 3 | `npm run build` → 빌드 성공 확인 |
| 4 | `*.ait` 파일 생성 여부 확인 |
| 5 | 앱인토스 콘솔 → 앱 선택 → 번들 업로드 → .ait 업로드 |
| 6 | 검토 요청 → 승인 후 출시 |

---

## 참고

- **진입 URL**: 실서비스 웹 주소(예: `https://pickt-daily.vercel.app/`)는 콘솔 앱 설정에서 등록합니다. .ait는 번들만 올리는 용도입니다.
- **번들 용량**: 압축 해제 기준 100MB 이하 제한. 이미지/에셋은 최소화하거나 CDN 사용 권장.
- **문서**: [미니앱 출시](https://developers-apps-in-toss.toss.im/development/deploy.html), [WebView 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/webview.html)

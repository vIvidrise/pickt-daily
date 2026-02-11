# pickt-daily.vercel.app 복구 가이드

## 1. Vercel 대시보드에서 설정 확인

1. https://vercel.com 접속 → **pickt-daily** 프로젝트 선택  
   (pickt-daily.vercel.app 도메인을 가진 프로젝트)

2. **Settings** → **Build and Deployment**

3. 아래처럼 설정 후 **Save**
   - **Root Directory**: `vivid-rise`
   - **Output Directory**: `dist` (Override 켜고 입력)
   - **Build Command**: `npm run build` (Override 켜고 입력)

4. **Settings** → **Git**
   - **vividrise/pickt-daily** 저장소가 연결돼 있는지 확인

## 2. 도메인 확인

1. **Settings** → **Domains**
2. `pickt-daily.vercel.app` 가 등록돼 있는지 확인

## 3. 새 배포 실행

1. **Deployments** 탭으로 이동
2. 오른쪽 상단 **Redeploy** 클릭  
   또는
3. 터미널에서:
   ```bash
   cd /Users/ad/Desktop/pickt-daily
   git add .
   git commit -m "fix: 배포 설정"
   git push origin main
   ```

## 4. 배포 성공 여부 확인

1. **Deployments** 에서 최신 배포가 **Ready** 인지 확인
2. https://pickt-daily.vercel.app 접속 후 동작 확인

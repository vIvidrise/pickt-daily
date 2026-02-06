import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Select from "./pages/Select";
import Confirm from "./pages/Confirm";
import Result from "./pages/Result";
import Saved from "./pages/Saved";
import Fortune from "./pages/Fortune";
import FortuneResult from "./pages/FortuneResult";
import { isAppsInTossEnv } from "./utils/appsInTossNav";
import { getSafeAreaInsets, subscribeSafeArea, applySafeAreaToRoot } from "./utils/safeArea";
import { subscribeBackEvent, subscribeEntryMessageExited } from "./utils/appsInTossSdk";
import { loadFavoritesCache } from "./utils/favorites";
import "./App.css";

/** 앱인토스 이벤트 구독: 뒤로가기 시 히스토리 백, 진입 완료 시 찜 캐시 로드 */
function TossEventSubscriber({ useTossNav, children }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!useTossNav) return;
    const unsubBack = subscribeBackEvent(() => navigate(-1));
    return () => unsubBack();
  }, [useTossNav, navigate]);

  useEffect(() => {
    if (!useTossNav) return;
    const unsubEntry = subscribeEntryMessageExited(() => {
      loadFavoritesCache();
    });
    return () => unsubEntry();
  }, [useTossNav]);

  return children;
}

/**
 * HashRouter 사용 → 주소가 http://localhost:5173/#/result 처럼 # 뒤에만 바뀜.
 * 앱인토스 WebView: 네이티브 내비, Safe Area, 뒤로가기/진입 완료 이벤트 연동.
 */
function App() {
  const [useTossNav, setUseTossNav] = useState(false);
  useEffect(() => {
    setUseTossNav(isAppsInTossEnv());
  }, []);

  useEffect(() => {
    if (!useTossNav) return;
    const initial = getSafeAreaInsets();
    if (initial) applySafeAreaToRoot(initial);
    const cleanup = subscribeSafeArea((insets) => applySafeAreaToRoot(insets));
    return () => cleanup();
  }, [useTossNav]);

  return (
    <HashRouter>
      <div className={`app-container ${useTossNav ? "use-toss-nav" : ""}`}>
        <TossEventSubscriber useTossNav={useTossNav}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select" element={<Select />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/result" element={<Result />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/fortune" element={<Fortune />} />
            <Route path="/fortune/result" element={<FortuneResult />} />
          </Routes>
        </TossEventSubscriber>
      </div>
    </HashRouter>
  );
}

export default App;
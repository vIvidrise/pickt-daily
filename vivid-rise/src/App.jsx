import { useState, useEffect, Component } from "react";
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

/** 에러 시 흰 화면 대신 메시지 표시 */
class AppErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(err, info) {
    console.error("AppErrorBoundary:", err, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh", boxSizing: "border-box" }}>
          <h2 style={{ color: "#333" }}>화면을 불러오지 못했어요</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#666" }}>{this.state.error?.message ?? String(this.state.error)}</pre>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "8px 16px" }}>새로고침</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
 * HashRouter 사용 → 주소가 http://localhost:5174/#/result 처럼 # 뒤에만 바뀜.
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
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}

export default App;
import { useLocation, useNavigate } from "react-router-dom";
import { closeView } from "../utils/appsInTossSdk.js";
import { isAppsInTossEnv } from "../utils/appsInTossNav.js";
import "./Confirm.css";

export default function Confirm() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/");
    return null;
  }

  const isEat = state.mode === "eat";

  // 먹기 모드: 먹고 싶은 음식, 오늘의 무드, 활동 범위, 놓칠 수 없는 조건
  // 하기 모드: 누구랑, 오늘의 무드, 활동 범위, 예산과 시간
  const eatRows = [
    { top: "먹고 싶은 음식", bottom: state.category || "—", icon: "🍽️" },
    { top: "오늘의 무드", bottom: state.companion || "—", icon: "😊" },
    { top: "활동 범위", bottom: state.location || "—", icon: "📍" },
    { top: "놓칠 수 없는 조건", bottom: state.options?.length ? state.options.join(" · ") : "—", icon: "🅿️" },
  ];

  const doRows = [
    { top: "누구랑", bottom: state.companion || "—", icon: "💕" },
    { top: "오늘의 무드", bottom: state.category || "—", icon: "🔥" },
    { top: "활동 범위", bottom: state.location || "—", icon: "📍" },
    { top: "예산과 시간", bottom: [state.budget, state.duration].filter(Boolean).join(", ") || "—", icon: "💰" },
  ];

  const rows = isEat ? eatRows : doRows;

  const handleConfirm = () => {
    navigate("/result", { state });
  };

  const useTossNav = isAppsInTossEnv();

  return (
    <div className="page confirm-page">
      {!useTossNav && (
        <div className="confirm-header">
          <button type="button" className="confirm-back" onClick={() => navigate(-1)} aria-label="뒤로">
            &lt;
          </button>
          <div className="confirm-header-center">
            <img src="/logo.png" alt="" className="confirm-header-logo" aria-hidden="true" />
            <span className="confirm-header-title">요즘 뭐 함</span>
          </div>
          <div className="confirm-header-icons">
            <span>···</span>
            <span onClick={() => closeView(() => navigate("/"))} role="button" tabIndex={0}>✕</span>
          </div>
        </div>
      )}

      <h2 className="confirm-title">이제 고민 끝! 확인해 볼까요?</h2>

      <ul className="confirm-list">
        {rows.map((row, index) => (
          <li key={index} className="confirm-list-row">
            <div className="confirm-row-icon">{row.icon}</div>
            <div className="confirm-row-texts">
              <span className="confirm-row-top">{row.top}</span>
              <span className="confirm-row-bottom">{row.bottom}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="confirm-footer">
        <button type="button" className="confirm-cta" onClick={handleConfirm}>
          확인했어요
        </button>
      </div>
    </div>
  );
}

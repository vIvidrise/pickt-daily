import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { closeView } from "../utils/appsInTossSdk.js";
import "./Fortune.css";

export default function Fortune() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const canSubmit = name.trim() && birthDate && (timeUnknown || birthTime);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate("/fortune/result", {
      state: {
        name: name.trim(),
        birthDate,
        birthTime: timeUnknown ? null : birthTime,
      },
    });
  };

  return (
    <div className="page fortune-page">
      <header className="fortune-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ChevronLeft size={24} color="#191F28" />
        </button>
        <span className="fortune-header-title">오늘 내 운세</span>
        <button type="button" className="icon-btn" onClick={() => closeView(() => navigate("/"))} aria-label="닫기">
          <X size={24} color="#B0B8C1" />
        </button>
      </header>

      <form className="fortune-form" onSubmit={handleSubmit}>
        <div className="fortune-field">
          <label htmlFor="fortune-name">이름</label>
          <input
            id="fortune-name"
            type="text"
            placeholder="이름을 입력해 주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="fortune-input"
            autoComplete="name"
          />
        </div>

        <div className="fortune-field">
          <label htmlFor="fortune-date">생년월일</label>
          <input
            id="fortune-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="fortune-input"
          />
        </div>

        <div className="fortune-field fortune-field-time">
          <label htmlFor="fortune-time">태어난 시간</label>
          <div className="fortune-time-row">
            <input
              id="fortune-time"
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="fortune-input fortune-input-time"
              disabled={timeUnknown}
            />
            <button
              type="button"
              className={`fortune-unknown-btn ${timeUnknown ? "active" : ""}`}
              onClick={() => setTimeUnknown((prev) => !prev)}
            >
              모름
            </button>
          </div>
        </div>

        <div className="fortune-actions">
          <button type="submit" className="fortune-submit-btn" disabled={!canSubmit}>
            운세보기
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { closeView } from "../utils/appsInTossSdk.js";
import { LocationPermissionModal } from "../components/LocationPermissionModal.jsx";
import "./Fortune.css";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1940 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();

export default function Fortune() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (!birthYear || !birthMonth || !birthDay) return;
    const max = getDaysInMonth(Number(birthYear), Number(birthMonth));
    if (Number(birthDay) > max) setBirthDay(String(max));
  }, [birthYear, birthMonth, birthDay]);

  const birthDate = birthYear && birthMonth && birthDay
    ? `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`
    : "";
  const canSubmit = name.trim() && birthDate && (timeUnknown || birthTime);

  const goToResult = (locationGranted, coords = null) => {
    setShowLocationModal(false);
    navigate("/fortune/result", {
      state: {
        name: name.trim(),
        birthDate,
        birthTime: timeUnknown ? null : birthTime,
        locationGranted,
        locationCoords: coords,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowLocationModal(true);
  };

  const handleLocationAllow = () => {
    if (!navigator.geolocation) {
      goToResult(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => goToResult(true, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => goToResult(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSkip = () => {
    goToResult(false);
  };

  const modalEl = showLocationModal ? (
    <LocationPermissionModal
      name={name.trim() || "회원"}
      onAllow={handleLocationAllow}
      onSkip={handleLocationSkip}
    />
  ) : null;

  return (
    <div className="page fortune-page">
      {modalEl && createPortal(modalEl, document.body)}

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
          <label>생년월일</label>
          <div className="fortune-date-row">
            <select
              id="fortune-year"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="fortune-select"
              aria-label="년"
            >
              <option value="">년</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <select
              id="fortune-month"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="fortune-select"
              aria-label="월"
            >
              <option value="">월</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <select
              id="fortune-day"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="fortune-select"
              aria-label="일"
            >
              <option value="">일</option>
              {(birthYear && birthMonth
                ? Array.from(
                    { length: getDaysInMonth(Number(birthYear), Number(birthMonth)) },
                    (_, i) => i + 1
                  )
                : Array.from({ length: 31 }, (_, i) => i + 1)
              ).map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        </div>

        <div className="fortune-field">
          <div className="fortune-time-label-row">
            <label htmlFor="fortune-time">태어난 시간</label>
            <button
              type="button"
              className={`fortune-unknown-btn ${timeUnknown ? "active" : ""}`}
              onClick={() => setTimeUnknown((prev) => !prev)}
            >
              모름
            </button>
          </div>
          <input
            id="fortune-time"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="fortune-input"
            disabled={timeUnknown}
          />
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

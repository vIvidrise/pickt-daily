import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAppsInTossEnv } from "../utils/appsInTossNav.js";
import "./Select.css";

export default function Select() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const mode = locationState.state?.mode || 'eat'; // 'eat' or 'do'
  const useTossNav = isAppsInTossEnv();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    mode: mode,
    companion: "",
    category: "",
    location: "서초구",
    budget: "",
    duration: "",
    options: []
  });

  const steps = {
    eat: [
      {
        id: 1,
        title: "어떤 메뉴를 좋아하나요?",
        subtitle: "2개까지 고를 수 있어요",
        type: "grid",
        field: "category",
        data: [
          { label: "한식", icon: "🍚" }, { label: "일식", icon: "🍣" },
          { label: "양식", icon: "🍔" }, { label: "중식", icon: "🥟" },
          { label: "분식", icon: "🥘" }, { label: "멕시칸", icon: "🌮" },
          { label: "샐러드", icon: "🥗" }, { label: "디저트", icon: "🍰" }
        ]
      },
      {
        id: 2,
        title: "오늘 어떤 날인가요?",
        subtitle: "누구와 함께 하나요?",
        type: "grid",
        field: "companion",
        data: [
          { label: "기념일", icon: "🎉" }, { label: "데이트", icon: "💕" },
          { label: "가족모임", icon: "👨‍👩‍👧‍👦" }, { label: "혼자서", icon: "🧘" },
          { label: "스페셜", icon: "✨" }, { label: "회식/모임", icon: "🍻" },
          { label: "일상", icon: "🔥" }, { label: "다이어트", icon: "🥑" }
        ]
      },
      {
        id: 3,
        title: "어느 지역의 맛집을 추천할까요?",
        type: "list",
        field: "location",
        data: ["강남·서초·송파", "용산·마포·서대문", "종로·동대문", "성수·건대입구", "관악·영등포", "잠실·송파", "성남·분당", "수원", "인천"]
      },
      {
        id: 4,
        title: "필요한 시설이나 서비스가 있나요?",
        subtitle: "선택 사항이에요 · 중복 선택 가능",
        type: "list-multi",
        field: "options",
        data: [
          { label: "주차가능", icon: "🅿️" },
          { label: "예약 가능", icon: "📅" },
          { label: "무선 인터넷", icon: "📶" },
          { label: "반려동물 입장 가능", icon: "🐕" },
          { label: "가성비", icon: "💰" },
          { label: "분위기", icon: "✨" },
          { label: "룸 있음", icon: "🚪" }
        ]
      }
    ],
    do: [
      {
        id: 1,
        title: "누구와 함께 하나요?",
        subtitle: "동행을 선택해주세요",
        type: "grid",
        field: "companion",
        data: [
          { label: "연인", icon: "💕" }, { label: "친구", icon: "👯" },
          { label: "가족", icon: "👨‍👩‍👧‍👦" }, { label: "혼자", icon: "🧘" },
          { label: "회식", icon: "🍻" }
        ]
      },
      {
        id: 2,
        title: "어떤 무드를 원하시나요?",
        subtitle: "오늘의 활동 테마를 골라주세요",
        type: "grid",
        field: "category",
        data: [ 
          { label: "힐링/산책", icon: "🌿" }, 
          { label: "활동/이색", icon: "🛹" },
          { label: "사진맛집", icon: "📸" }, 
          { label: "문화/전시", icon: "🎨" },
          { label: "핫플투어", icon: "🔥" }
        ]
      },
      {
        id: 3,
        title: "어느 지역으로 갈까요?",
        type: "list",
        field: "location",
        data: ["강남·서초·송파", "용산·마포·서대문", "종로·동대문", "성수·건대입구", "관악·영등포", "잠실·송파", "성남·분당", "수원", "인천"]
      },
      {
        id: 4,
        title: "예산과 시간은 어느 정도인가요?",
        subtitle: "조건에 맞는 코스를 짜드릴게요",
        type: "double-group",
        groups: [
          {
            label: "인당 예산",
            field: "budget",
            options: ["0원", "1~3만원", "5만원 이상", "Flex"]
          },
          {
            label: "소요 시간",
            field: "duration",
            options: ["1~2시간", "반나절", "하루종일"]
          }
        ]
      }
    ]
  };

  const currentSteps = steps[mode];
  const currentStepConfig = currentSteps[step - 1];
  const totalSteps = currentSteps.length;

  const handleSelect = (field, value) => {
    if (currentStepConfig.type === "list-multi") {
      const currentOptions = form[field];
      if (currentOptions.includes(value)) {
        setForm({ ...form, [field]: currentOptions.filter(o => o !== value) });
      } else {
        setForm({ ...form, [field]: [...currentOptions, value] });
      }
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const submitForm = { ...form };
      if (mode === 'eat' && !submitForm.category) submitForm.category = "한식";
      if (mode === 'do' && !submitForm.category) submitForm.category = "힐링/산책";
      navigate("/confirm", { state: submitForm });
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const progressPercent = (step / totalSteps) * 100;

  const renderStepContent = () => {
    if (currentStepConfig.type === "double-group") {
      return (
        <div className="double-group-container">
          {currentStepConfig.groups.map((group, idx) => (
            <div key={idx} className="sub-section">
              <label className="sub-label">{group.label}</label>
              <div className="chip-group">
                {group.options.map((opt) => (
                  <button
                    key={opt}
                    className={`chip ${form[group.field] === opt ? "active" : ""}`}
                    onClick={() => handleSelect(group.field, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`selection-container ${currentStepConfig.type}`}>
        {currentStepConfig.data.map((item, index) => {
          const value = typeof item === 'object' ? item.label : item;
          const icon = typeof item === 'object' ? item.icon : null;
          const field = currentStepConfig.field;
          
          let isActive = false;
          if (currentStepConfig.type === "list-multi") {
            isActive = form[field].includes(value);
          } else {
            isActive = form[field] === value;
          }

          return (
            <button
              key={index}
              className={`select-item ${currentStepConfig.type} ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(field, value)}
            >
              {icon && <span className="item-icon">{icon}</span>}
              <span className="item-label">{value}</span>
              {currentStepConfig.type.includes("list") && (
                isActive ? <span className="check-mark">✔</span> : <span className="item-chevron">›</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page select-page">
      {!useTossNav && (
        <header className="step-header">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </header>
      )}

      <div className="content-container">
        <h2 className="step-title">{currentStepConfig.title}</h2>
        {currentStepConfig.subtitle && <p className="step-subtitle">{currentStepConfig.subtitle}</p>}
        {renderStepContent()}
      </div>

      <footer className="footer-actions">
        <button className="btn-prev" onClick={handlePrev}>이전</button>
        <button className="btn-next" onClick={handleNext}>
          {step === totalSteps ? (mode === 'do' ? "코스 추천받기 ✨" : "맛집 추천받기 😋") : "다음"}
        </button>
      </footer>
    </div>
  );
}
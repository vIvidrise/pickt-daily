import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreHorizontal, X, Check } from "lucide-react";
import { getFavorites, removeFavorite, loadFavoritesCache } from "../utils/favorites.js";
import { closeView, openExternalUrl } from "../utils/appsInTossSdk.js";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // 단계: HOME -> INTRO -> MENU -> OCCASION -> REGION -> FACILITY -> SUMMARY -> LOADING
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [mode, setMode] = useState('eat'); // 'eat' or 'do'

  // 선택 데이터
  const [selections, setSelections] = useState({
    menu: '', occasion: '', region: '', facility: [], // EAT
    companion: '', mood: '', budget: '' // DO
  });
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (currentScreen === 'HOME') {
      loadFavoritesCache().then(() => setFavorites(getFavorites()));
    }
  }, [currentScreen]);

  // 로딩 화면: 2.5초 후 이동
  useEffect(() => {
    if (currentScreen === 'LOADING') {
      const timer = setTimeout(() => {
        const facilityStr = selections.facility.join(', ');
        navigate("/result", { 
            state: { mode, ...selections, facility: facilityStr } 
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, navigate, selections, mode]);

  // 네비게이션
  const startFlow = (selectedMode) => {
    setMode(selectedMode);
    setCurrentScreen('INTRO');
  };

  const goNext = () => {
    if (currentScreen === 'INTRO') return setCurrentScreen(mode === 'eat' ? 'MENU' : 'COMPANION');

    if (mode === 'eat') {
      if (currentScreen === 'MENU') setCurrentScreen('OCCASION');
      else if (currentScreen === 'OCCASION') setCurrentScreen('REGION');
      else if (currentScreen === 'REGION') setCurrentScreen('FACILITY');
      else if (currentScreen === 'FACILITY') setCurrentScreen('SUMMARY');
    } 
    else if (mode === 'do') {
      if (currentScreen === 'COMPANION') setCurrentScreen('MOOD');
      else if (currentScreen === 'MOOD') setCurrentScreen('REGION');
      else if (currentScreen === 'REGION') setCurrentScreen('BUDGET');
      else if (currentScreen === 'BUDGET') setCurrentScreen('SUMMARY');
    }

    if (currentScreen === 'SUMMARY') setCurrentScreen('LOADING');
  };

  const goBack = () => {
    if (currentScreen === 'INTRO') setCurrentScreen('HOME');
    if (mode === 'eat') {
      if (currentScreen === 'MENU') setCurrentScreen('INTRO');
      else if (currentScreen === 'OCCASION') setCurrentScreen('MENU');
      else if (currentScreen === 'REGION') setCurrentScreen('OCCASION');
      else if (currentScreen === 'FACILITY') setCurrentScreen('REGION');
      else if (currentScreen === 'SUMMARY') setCurrentScreen('FACILITY');
    }
    else if (mode === 'do') {
      if (currentScreen === 'COMPANION') setCurrentScreen('INTRO');
      else if (currentScreen === 'MOOD') setCurrentScreen('COMPANION');
      else if (currentScreen === 'REGION') setCurrentScreen('MOOD');
      else if (currentScreen === 'BUDGET') setCurrentScreen('REGION');
      else if (currentScreen === 'SUMMARY') setCurrentScreen('BUDGET');
    }
  };

  const handleSelect = (key, value) => setSelections(prev => ({ ...prev, [key]: value }));
  const handleMultiSelect = (value) => {
    setSelections(prev => {
      const current = prev.facility;
      if (current.includes(value)) return { ...prev, facility: current.filter(i => i !== value) };
      else return { ...prev, facility: [...current, value] };
    });
  };

  const getProgress = () => {
    if (mode === 'eat') {
      if (currentScreen === 'MENU') return '20%';
      if (currentScreen === 'OCCASION') return '40%';
      if (currentScreen === 'REGION') return '60%';
      if (currentScreen === 'FACILITY') return '80%';
    } else {
      if (currentScreen === 'COMPANION') return '20%';
      if (currentScreen === 'MOOD') return '40%';
      if (currentScreen === 'REGION') return '60%';
      if (currentScreen === 'BUDGET') return '80%';
    }
    return '0%';
  };

  return (
    <div className="page home-page">
      
      {/* 1. 홈 화면 — 전체 스크롤로 찜한 장소·랭킹까지 밑으로 내려가게 */}
      {currentScreen === 'HOME' && (
        <>
          <Header onBack={()=>{}} hideBack onClose={() => closeView(() => navigate("/"))} />
          <div className="home-scroll-wrap">
            <div className="main-section">
              <h1 className="main-title">남들은<br />뭘 선택했을까?</h1>
              <div className="card-container">
                <button className="big-card" onClick={() => startFlow('eat')}>
                  <span className="big-card-emoji">🍛</span>
                  <span className="card-text">오늘 뭐 먹지</span>
                </button>
                <button className="big-card" onClick={() => startFlow('do')}>
                  <span className="big-card-emoji">🏖️</span>
                  <span className="card-text">오늘 뭐 하지</span>
                </button>
                <button className="big-card" onClick={() => navigate("/saved")}>
                  <span className="big-card-emoji">📋</span>
                  <span className="card-text">나만의 리스트</span>
                </button>
              </div>
            </div>
            {favorites.length > 0 && (
              <div className="favorites-section">
                <h2 className="favorites-title">❤️ 찜한 장소</h2>
                <div className="favorites-list">
                  {favorites.map((item, i) => (
                    <div key={`${item.name}-${i}`} className="favorite-item">
                      <span className="favorite-emoji">{item.emoji}</span>
                      <div className="favorite-info">
                        <span className="favorite-name">{item.name}</span>
                        {item.tag && <span className="favorite-tag">{item.tag}</span>}
                      </div>
                      <div className="favorite-actions">
                        <button type="button" className="favorite-link" onClick={() => openExternalUrl(item.naverUrl)}>
                          네이버에서 보기
                        </button>
                        <button type="button" className="favorite-remove" onClick={() => { removeFavorite(item).then(() => setFavorites(getFavorites())); }} aria-label="찜 해제">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="ranking-section">
              <h2 className="ranking-title">지금 뜨는 실시간 랭킹🔥</h2>
              <div className="ranking-list">
                <RankingItem icon="🥘" name="마라 로제 떡볶이" desc="강남구 20대 결제 횟수 1위" medal="🥇" />
                <RankingItem icon="🍲" name="뜨끈한 순대국밥" desc="주문량 300% 급증" medal="🥈" />
                <RankingItem icon="☕" name="스타벅스 아메리카노" desc="식후 국룰!" medal="🥉" />
                <RankingItem icon="🍕" name="베이컨 포테이토 피자" desc="회식 메뉴로 인기" medal="4" isBadge />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. 인트로 */}
      {currentScreen === 'INTRO' && (
        <div className="flow-container">
          <Header onBack={goBack} onClose={() => closeView(() => navigate("/"))} />
          <div className="intro-content">
            <h1 className="flow-title">{mode === 'eat' ? "우리 동네 맛집은" : "우리 동네 놀거리는"} <br/> 요즘 뭐 함 에서</h1>
            <p className="flow-subtitle">내 취향에 딱 맞는 곳을 추천해줘요</p>
            <div className="magnifying-wrapper">
               <span className="magnifying-emoji">{mode === 'eat' ? '🔍' : '🚌'}</span>
            </div>
          </div>
          <div className="bottom-nav-area one-button">
            <button className="btn-toss-primary full-width" onClick={goNext}>
              {mode === 'eat' ? "취향 고르고 맛집 추천받기" : "취향 고르고 코스 추천받기"}
            </button>
          </div>
        </div>
      )}

      {/* EAT FLOW */}
      {currentScreen === 'MENU' && <StepLayout title="어떤 메뉴를 좋아하나요?" subtitle="1개만 골라주세요" progress={getProgress()} onBack={goBack} onNext={goNext} disabled={!selections.menu}><div className="selection-grid-4">{['한식','일식','양식','중식','분식','멕시칸','샐러드','디저트'].map((item,i)=><GridButton key={i} label={item} emoji={['🥘','🍣','🍔','🥟','🍢','🌮','🥗','🍰'][i]} selected={selections.menu===item} onClick={()=>handleSelect('menu',item)}/>)}</div></StepLayout>}
      
      {currentScreen === 'OCCASION' && <StepLayout title="오늘 어떤 날인가요?" subtitle="상황에 맞게 추천해드려요" progress={getProgress()} onBack={goBack} onNext={goNext} disabled={!selections.occasion}><div className="selection-grid-4">{['기념일','데이트','가족모임','혼자서','트렌디한','한국적인','SNS 핫플','동네맛집'].map((item,i)=><GridButton key={i} label={item} emoji={['🎉','💕','👨‍👩‍👧‍👦','👤','✨','🇰🇷','🔥','🏠'][i]} selected={selections.occasion===item} onClick={()=>handleSelect('occasion',item)}/>)}</div></StepLayout>}
      
      {currentScreen === 'FACILITY' && <StepLayout title="필요한 시설이 있나요?" subtitle="여러 개 선택 가능해요" progress={getProgress()} btnText="완료" onBack={goBack} onNext={goNext} disabled={false}><div className="list-select-container">{[{l:'주차',i:'🅿️'},{l:'예약',i:'📅'},{l:'무선 인터넷',i:'🛜'},{l:'반려동물',i:'🐶'}].map((item,i)=><ListButton key={i} label={item.l} icon={item.i} selected={selections.facility.includes(item.l)} onClick={()=>handleMultiSelect(item.l)}/>)}</div></StepLayout>}

      {/* DO FLOW */}
      {currentScreen === 'COMPANION' && <StepLayout title="누구와 함께 하나요?" subtitle="동행을 선택해주세요" progress={getProgress()} onBack={goBack} onNext={goNext} disabled={!selections.companion}><div className="selection-grid-list-style">{['연인','친구','가족','혼자'].map((item,i)=><GridButton key={i} label={item} emoji={['❤️','🎒','👨‍👩‍👧‍👦','🧢'][i]} selected={selections.companion===item} onClick={()=>handleSelect('companion',item)}/>)}</div></StepLayout>}
      
      {currentScreen === 'MOOD' && <StepLayout title="어떤 무드를 원하시나요?" subtitle="테마를 골라주세요" progress={getProgress()} onBack={goBack} onNext={goNext} disabled={!selections.mood}><div className="selection-grid-list-style">{['힐링·산책','활동·이색','문화·전시','핫플·사진'].map((item,i)=><GridButton key={i} label={item} emoji={['🌿','🛹','🎨','🔥'][i]} selected={selections.mood===item} onClick={()=>handleSelect('mood',item)}/>)}</div></StepLayout>}
      
      {currentScreen === 'BUDGET' && <StepLayout title="예산은 어느정도인가요?" subtitle="1인 기준입니다" progress={getProgress()} btnText="완료" onBack={goBack} onNext={goNext} disabled={!selections.budget}><div className="list-select-container">{['1만원 이하','1~3만원','3~5만원','5~10만원','Flex'].map((item,i)=><ListButton key={i} label={item} selected={selections.budget===item} onClick={()=>handleSelect('budget',item)}/>)}</div></StepLayout>}

      {/* COMMON FLOW - REGION */}
      {/* 🌟 지역 이름을 gemini.js 키값과 똑같이 맞춤 */}
      {currentScreen === 'REGION' && <StepLayout title="어느 지역으로 갈까요?" progress={getProgress()} onBack={goBack} onNext={goNext} disabled={!selections.region}><div className="list-select-container">{['강남·서초','용산·이태원','종로·을지로','성수·건대','홍대·연남'].map((item,i)=><ListButton key={i} label={item} selected={selections.region===item} onClick={()=>handleSelect('region',item)}/>)}</div></StepLayout>}

      {currentScreen === 'SUMMARY' && (
        <div className="flow-container">
           <Header onBack={goBack} onClose={() => closeView(() => navigate("/"))} />
           <div className="summary-content">
              <h1 className="flow-title">이제 고민 끝!<br/>확인해 볼까요?</h1>
              <div className="summary-card">
                  {mode === 'eat' ? (
                    <>
                      <SummaryItem label="메뉴" value={selections.menu} icon="🥘" />
                      <SummaryItem label="무드" value={selections.occasion} icon="😊" />
                      <SummaryItem label="지역" value={selections.region} icon="📍" />
                      <SummaryItem label="시설" value={selections.facility.join(', ') || '상관없음'} icon="✅" />
                    </>
                  ) : (
                    <>
                      <SummaryItem label="누구랑" value={selections.companion} icon="❤️" />
                      <SummaryItem label="무드" value={selections.mood} icon="🔥" />
                      <SummaryItem label="지역" value={selections.region} icon="📍" />
                      <SummaryItem label="예산" value={selections.budget} icon="💲" />
                    </>
                  )}
              </div>
           </div>
           <div className="bottom-nav-area one-button">
             <button className="btn-toss-primary full-width" onClick={goNext}>확인했어요</button>
           </div>
        </div>
      )}

      {currentScreen === 'LOADING' && (
        <div className="flow-container loading-container">
           <Header onBack={()=>{}} hideBack hideRight />
           <div className="loading-content">
              <h1 className="flow-title">{mode === 'eat' ? "오늘을 더 맛있게." : "완벽한 하루를 위해."}</h1>
              <p className="flow-subtitle">잠시만 기다려주세요.</p>
              <div className="loading-circle"></div>
           </div>
        </div>
      )}
    </div>
  );
}

// 하위 컴포넌트들
const Header = ({ onBack, hideBack, hideRight, onClose }) => (
  <div className="home-header">
    {!hideBack ? <button type="button" className="icon-btn" onClick={onBack} aria-label="뒤로가기"><ChevronLeft size={24} color="#191F28" /></button> : <div className="header-spacer" aria-hidden="true" />}
    <div className="header-center">
      <img src="/logo.png" alt="" className="header-logo" aria-hidden="true" />
      <span className="header-title-text">요즘 뭐 함</span>
    </div>
    {!hideRight ? (
      <div className="header-right">
        <button type="button" className="icon-btn" aria-label="더보기"><MoreHorizontal size={24} color="#B0B8C1" /></button>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기"><X size={24} color="#B0B8C1" /></button>
      </div>
    ) : <div className="header-spacer header-spacer-right" aria-hidden="true" />}
  </div>
);
const StepLayout = ({ title, subtitle, progress, children, onBack, onNext, disabled, btnText = "다음", onClose }) => {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => closeView(() => navigate("/")));
  return (
  <div className="flow-container">
    <Header onBack={onBack} onClose={handleClose} />
    {progress && <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: progress}}></div></div>}
    <div className="flow-content">
      <h2 className="flow-question">{title}</h2>
      {subtitle && <p className="flow-desc">{subtitle}</p>}
      {children}
    </div>
    <div className="bottom-nav-area two-buttons">
      <button className="btn-prev-half" onClick={onBack}>이전</button>
      <button className="btn-next-half" onClick={onNext} disabled={disabled}>{btnText}</button>
    </div>
  </div>
  );
};
const GridButton = ({ label, emoji, selected, onClick }) => (
  <button className={`grid-select-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
    <span className="grid-emoji">{emoji}</span>
    <span className="grid-label">{label}</span>
  </button>
);
const ListButton = ({ label, icon, selected, onClick }) => (
  <button className={`list-select-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
    <div className="list-left">{icon && <span className="list-icon">{icon}</span>}<span className="list-label">{label}</span></div>
    {selected && <Check size={20} color="#3182F6" />}
  </button>
);
const SummaryItem = ({ label, value, icon }) => (
  <div className="summary-item">
     <div className="summary-icon-box">{icon}</div>
     <div className="summary-text-box"><div className="summary-label">{label}</div><div className="summary-value">{value}</div></div>
  </div>
);
const RankingItem = ({ icon, name, desc, medal, isBadge }) => (
  <div className="ranking-item">
    <div className="rank-icon-wrapper bg-grey"><span className="emoji-icon">{icon}</span></div>
    <div className="rank-info"><div className="rank-name">{name}</div><div className="rank-desc">{desc}</div></div>
    <div className={isBadge ? "medal-wrapper badge-grey" : "medal-wrapper"}>{medal}</div>
  </div>
);
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreHorizontal, X, Check } from "lucide-react";
import { getFavorites, removeFavorite, loadFavoritesCache } from "../utils/favorites.js";
import { closeView, openExternalUrl } from "../utils/appsInTossSdk.js";
import "./Home.css";

/** ranking_type: solo_master | quick_lunch | solo_night (API 파라미터용) */
export const RANKING_TYPE = { SOLO_MASTER: 'solo_master', QUICK_LUNCH: 'quick_lunch', SOLO_NIGHT: 'solo_night' };

/** solo_difficulty_level(1~5) → 힙한 태그 텍스트 */
export function getSoloLevelTag(level) {
  const l = Math.min(5, Math.max(1, Number(level) || 1));
  const tags = {
    1: '혼밥 입문자 성지 🍵',
    2: '혼밥 성장기 🥢',
    3: '당당한 혼밥러 전용 🍚',
    4: '혼밥 마스터 직행 🍜',
    5: '혼밥 끝판왕 도전 🥩',
  };
  return tags[l] || tags[1];
}

/** 홈 취향존중·혼밥중 목데이터 (ranking_type별) — API 연동 시 ranking_type 파라미터로 교체 */
const RANKING_ITEMS_BY_TYPE = {
  [RANKING_TYPE.SOLO_MASTER]: [
    { icon: '🥘', name: '마라 로제 떡볶이', desc: '혼밥 난이도 높은 곳 정복 1위', solo_difficulty_level: 5 },
    { icon: '🍲', name: '뜨끈한 순대국밥', desc: '난이도 높은 혼밥 성공', solo_difficulty_level: 4 },
    { icon: '☕', name: '스타벅스 아메리카노', desc: '당당한 혼밥러 전용', solo_difficulty_level: 3 },
    { icon: '🍕', name: '베이컨 포테이토 피자', desc: '혼밥 입문자 성지', solo_difficulty_level: 1 },
  ],
  [RANKING_TYPE.QUICK_LUNCH]: [
    { icon: '🍚', name: '한식뷔페 강남점', desc: '점심 회전율 1위', solo_difficulty_level: 2 },
    { icon: '🍜', name: '맛있는 라멘', desc: '12시 회전율 인기', solo_difficulty_level: 2 },
    { icon: '🥗', name: '샐러드바', desc: '혼밥 지수 1~2단계 인기', solo_difficulty_level: 1 },
    { icon: '🍱', name: '도시락 전문점', desc: '점심시간 회전율 좋음', solo_difficulty_level: 2 },
  ],
  [RANKING_TYPE.SOLO_NIGHT]: [
    { icon: '🍺', name: '혼술 환영 포차', desc: '혼술 태그 인기 1위', solo_difficulty_level: 3 },
    { icon: '🥃', name: '위스키바 A', desc: '혼술 환영 장소', solo_difficulty_level: 4 },
    { icon: '🍶', name: '이자카야 B', desc: '혼술 태그 인기', solo_difficulty_level: 2 },
    { icon: '🍷', name: '와인바 C', desc: '혼술 환영', solo_difficulty_level: 5 },
  ],
};

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
  const [rankingType, setRankingType] = useState(RANKING_TYPE.SOLO_MASTER);

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
              {/* 오늘 내 운세 배너 — 클릭 시 입력 페이지로 이동 */}
              <section className="fortune-banner-section" aria-label="오늘 내 운세">
                <button type="button" className="fortune-banner-btn" onClick={() => navigate("/fortune")}>
                  <img src="/fortune-banner.png" alt="오늘 내 운세 - 오늘의 운세를 확인해 보세요" className="fortune-banner-img" />
                </button>
              </section>
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
              <h2 className="ranking-title">취향존중, 혼밥중</h2>
              <p className="ranking-subtitle">테마별 혼밥 랭킹</p>
              <div className="ranking-tabs">
                <button type="button" className={`ranking-tab ${rankingType === RANKING_TYPE.SOLO_MASTER ? 'active' : ''}`} aria-pressed={rankingType === RANKING_TYPE.SOLO_MASTER} onClick={() => setRankingType(RANKING_TYPE.SOLO_MASTER)}>혼밥 정복</button>
                <button type="button" className={`ranking-tab ${rankingType === RANKING_TYPE.QUICK_LUNCH ? 'active' : ''}`} aria-pressed={rankingType === RANKING_TYPE.QUICK_LUNCH} onClick={() => setRankingType(RANKING_TYPE.QUICK_LUNCH)}>점심 회전율</button>
                <button type="button" className={`ranking-tab ${rankingType === RANKING_TYPE.SOLO_NIGHT ? 'active' : ''}`} aria-pressed={rankingType === RANKING_TYPE.SOLO_NIGHT} onClick={() => setRankingType(RANKING_TYPE.SOLO_NIGHT)}>혼술 환영</button>
              </div>
              <div className="ranking-list">
                {(RANKING_ITEMS_BY_TYPE[rankingType] || RANKING_ITEMS_BY_TYPE[RANKING_TYPE.SOLO_MASTER]).slice(0, 3).map((item, i) => (
                  <RankingItem
                    key={item.name + i}
                    icon={item.icon}
                    name={item.name}
                    desc={item.desc}
                    medal={['🥇', '🥈', '🥉'][i]}
                    soloLevel={item.solo_difficulty_level}
                  />
                ))}
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
const RankingItem = ({ icon, name, desc, medal, isBadge, soloLevel }) => (
  <div className="ranking-item">
    <div className="rank-icon-wrapper bg-grey"><span className="emoji-icon">{icon}</span></div>
    <div className="rank-info">
      <div className="rank-name">{name}</div>
      {soloLevel != null && (
        <span className="rank-solo-tag">{getSoloLevelTag(soloLevel)}</span>
      )}
      <div className="rank-desc">{desc}</div>
    </div>
    <div className={isBadge ? "medal-wrapper badge-grey" : "medal-wrapper"}>{medal}</div>
  </div>
);
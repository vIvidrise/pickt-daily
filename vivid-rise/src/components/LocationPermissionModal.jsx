/**
 * 위치 권한 요청 커스텀 팝업
 * 시스템 팝업 노출 전, 비비 캐릭터와 함께 안내 문구 표시
 */
import "./LocationPermissionModal.css";

export function LocationPermissionModal({ name, onAllow, onSkip }) {
  const displayName = name || "회원";

  return (
    <div className="location-permission-overlay" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <div className="location-permission-modal">
        <div className="location-modal-character">
          <img src="/fortune-rabbit.png" alt="" className="location-modal-vivi" />
        </div>
        <h2 id="location-modal-title" className="location-modal-title">
          오늘 {displayName}님의 행운이 어디에 숨어있을까요?
        </h2>
        <p className="location-modal-desc">
          주변의 행운 장소를 찾으려면 위치 정보가 필요해요!
        </p>
        <div className="location-modal-actions">
          <button type="button" className="location-modal-btn location-modal-skip" onClick={onSkip}>
            나중에
          </button>
          <button type="button" className="location-modal-btn location-modal-allow" onClick={onAllow}>
            위치 허용
          </button>
        </div>
      </div>
    </div>
  );
}

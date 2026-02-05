import { useState } from "react";
import { motion } from "framer-motion";

/**
 * solo_difficulty_level(1~5)에 따라 비비 캐릭터 이미지 표시
 * 이미지 없으면 회색 플레이스홀더
 */
export function CharacterByLevel({ level, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const clamped = Math.min(5, Math.max(1, Number(level) || 1));
  const src = `/images/character/vivi_level_${clamped}.png`;

  if (imgError) {
    return (
      <motion.div
        className={`character-fallback ${className}`}
        style={{ minHeight: 80 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    );
  }

  return (
    <motion.div
      className={`character-wrap ${className}`}
      style={{ minHeight: 80 }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={src}
        alt={`비비(Vivi) 레벨 ${clamped}`}
        width={80}
        height={80}
        className="character-img"
        onError={() => setImgError(true)}
      />
    </motion.div>
  );
}

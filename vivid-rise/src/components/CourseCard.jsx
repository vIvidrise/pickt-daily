import { useState } from "react";
import { motion } from "framer-motion";
import { CharacterByLevel } from "./CharacterByLevel";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop";

/**
 * 코스 한 개: 활동(Do) 카드 + "N분 거리 코스예요" + 식당(Eat) 카드 (글래스모피즘)
 * do/eat에 imageUrl 있으면 썸네일 표시, 없으면 CharacterByLevel
 */
export function CourseCard({ course, index = 0 }) {
  const doPlace = course.do;
  const eatPlace = course.eat;
  const distanceMinutes = course.distanceMinutes ?? 5;

  return (
    <motion.div
      className="course-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <motion.div
        className="course-card-do"
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <div className="course-card-inner">
          <span className="course-card-label">활동 (Do)</span>
          <p className="course-card-name">{doPlace.name}</p>
          <div className="course-card-character">
            {doPlace.imageUrl ? (
              <CourseCardPlaceImage src={doPlace.imageUrl} alt={doPlace.name} />
            ) : (
              <CharacterByLevel level={doPlace.solo_difficulty_level} className="w-full" />
            )}
          </div>
        </div>
      </motion.div>

      <div className="course-card-connector">
        <span className="course-connector-line" />
        <span className="course-connector-text">{distanceMinutes}분 거리 코스예요</span>
        <span className="course-connector-line" />
      </div>

      <motion.div
        className="course-card-eat"
        style={{ boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)" }}
        whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
      >
        <div className="course-card-inner">
          <span className="course-card-label">식당 (Eat)</span>
          <p className="course-card-name">{eatPlace.name}</p>
          <div className="course-card-character">
            {eatPlace.imageUrl ? (
              <CourseCardPlaceImage src={eatPlace.imageUrl} alt={eatPlace.name} />
            ) : (
              <CharacterByLevel level={eatPlace.solo_difficulty_level} className="w-full" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CourseCardPlaceImage({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);
  const handleError = () => setImgSrc(FALLBACK_IMAGE);
  return (
    <div className="course-card-place-img-wrap">
      <img src={imgSrc} alt={alt} className="course-card-place-img" onError={handleError} />
    </div>
  );
}

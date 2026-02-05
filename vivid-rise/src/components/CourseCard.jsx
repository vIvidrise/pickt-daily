import { motion } from "framer-motion";
import { CharacterByLevel } from "./CharacterByLevel";

/**
 * 코스 한 개: 활동(Do) 카드 + "N분 거리 코스예요" + 식당(Eat) 카드 (글래스모피즘)
 * @param {{ course: { do: { name: string, solo_difficulty_level?: number }, eat: { name: string, solo_difficulty_level?: number }, distanceMinutes?: number }, index?: number }} props
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
      {/* 레이어 1: 활동(Do) 카드 */}
      <motion.div
        className="course-card-do"
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <div className="course-card-inner">
          <span className="course-card-label">활동 (Do)</span>
          <p className="course-card-name">{doPlace.name}</p>
          <div className="course-card-character">
            <CharacterByLevel level={doPlace.solo_difficulty_level} className="w-full" />
          </div>
        </div>
      </motion.div>

      {/* 점선 + 문구 (Do ↔ Eat 사이) */}
      <div className="course-card-connector">
        <span className="course-connector-line" />
        <span className="course-connector-text">{distanceMinutes}분 거리 코스예요</span>
        <span className="course-connector-line" />
      </div>

      {/* 레이어 2: 식당(Eat) 카드 */}
      <motion.div
        className="course-card-eat"
        style={{ boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)" }}
        whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
      >
        <div className="course-card-inner">
          <span className="course-card-label">식당 (Eat)</span>
          <p className="course-card-name">{eatPlace.name}</p>
          <div className="course-card-character">
            <CharacterByLevel level={eatPlace.solo_difficulty_level} className="w-full" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

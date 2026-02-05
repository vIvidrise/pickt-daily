import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { CourseCard } from "./CourseCard";
import "swiper/css";
import "swiper/css/navigation";
import "./CourseSwiper.css";

/**
 * 나의 찜한 코스 스와이퍼 (글래스모피즘 카드 + 점선 + N분 거리 코스예요)
 * @param {{ courses: Array<{ do: { name: string, solo_difficulty_level?: number }, eat: { name: string, solo_difficulty_level?: number }, distanceMinutes?: number }> }} props
 */
export function CourseSwiper({ courses = [], emptyMessage = "찜한 코스가 없어요. 장소를 추가해 보세요." }) {
  if (courses.length === 0) {
    return (
      <motion.div
        className="course-swiper-empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {emptyMessage}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="course-swiper-wrap"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView="auto"
        navigation
        className="course-swiper"
      >
        {courses.map((course, i) => (
          <SwiperSlide key={`${course.do?.name}-${course.eat?.name}-${i}`} className="course-swiper-slide">
            <div className="course-swiper-slide-inner">
              <CourseCard course={course} index={i} />
              {i < courses.length - 1 && (
                <div className="course-swiper-divider">
                  <span className="course-swiper-divider-line" />
                  <span className="course-swiper-divider-text">{course.distanceMinutes ?? 5}분</span>
                  <span className="course-swiper-divider-line" />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}

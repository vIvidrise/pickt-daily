/**
 * 나만의 리스트 "나의 찜한 코스"용 목업 코스
 * 실제로는 Supabase/찜 데이터에서 do+eat 쌍을 만들 수 있으면 그걸 쓰면 됨
 */
export const MOCK_COURSES = [
  {
    do: { name: "국립현대미술관 서울관", solo_difficulty_level: 1 },
    eat: { name: "혼밥맛집 강남점", solo_difficulty_level: 1 },
    distanceMinutes: 5,
  },
  {
    do: { name: "대림미술관", solo_difficulty_level: 2 },
    eat: { name: "솔로키친", solo_difficulty_level: 2 },
    distanceMinutes: 5,
  },
  {
    do: { name: "국립현대미술관 서울관", solo_difficulty_level: 1 },
    eat: { name: "솔로키친", solo_difficulty_level: 2 },
    distanceMinutes: 5,
  },
];

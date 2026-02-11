// src/api/gemini.js

import { places as placesList } from '../data/places';

// 1. 구글 시트 (맛집 데이터) — 여러 탭 gid 로드 후 병합, 모든 주소로 '네이버에서 보기' 연결
const GOOGLE_SHEET_BASE = 'https://docs.google.com/spreadsheets/d/1C4y3wbFKCYkqHy4ZDhH7AddsTRc3X431mMl6816r9Lw/export?format=csv&gid=';
const GOOGLE_SHEET_GIDS = [
  542269095, // 강남·서초 등 (기존 탭)
  99256946,  // 성수·건대 등 (gid=99256946)
];

// 2. 방대한 모의 데이터베이스 (기본값 & 백업용)
// 시트 로딩에 실패해도 이 데이터가 보여집니다.
const BASE_DB = {
  '강남·서초': {
    coords: { lat: 37.4980, lng: 127.0277 },
    eat: {
      '한식': ['노랑저고리', '동화고옥', '조양관', '담', '피양옥', '청계산곤드레집', '산들해', '우밀가', '새벽집', '영동장어', '호족반', '무월식탁', '땀땀', '옥소반', '대가방', '이도곰탕', '한일관', '권숙수', '정식당', '도산분식', '뱃고동', '현대정육식당', '보슬보슬', '청담25', '삼원가든', '을지다락', '중앙해장', '시래향', '전주옛날집', '서석대', '버드나무집', '이모네옛날떡볶이', '3대삼계장인', '백년옥', '서초면옥', '소이연남', '한국수', '그림나베', '듬북담북', '교대이층집', '원조부안집', '서초대가', '사랑방', '봉산옥'],
      '일식': ['스시소라', '미나미', '쇼쿠지', '정돈', '멘야산다이메', '동경규동', '카츠공방', '호랑이초밥', '미우야', '키누카누', '스시코우지', '스시마이우', '갓덴스시', '은행골', '오레노라멘', '왓쇼이켄', '유타로', '고에몬', '토끼정', '낙원테산도', '카츠8', '마루심'],
      '양식': ['로리스더프라임립', '라브리크', '다피타', '매드포갈릭', '바비레드', '후추포인트', '올리브에비뉴', '더몰트하우스', '푸슈', '에이머', '마초쉐프', '82올리언즈', '어거스트힐', '파스타트리오', '볼라레', '텍사스데브라질', '울프강스테이크하우스'],
      '중식': ['중화백반', '호경전', '차알', '일일향', '송쉐프', '몽중헌', '무탄', '뽕사부', 'js가든'],
      '분식': ['덕자네방앗간', '청담동마녀김밥', '서호김밥', '방배김밥', '고양이부엌', '남도분식', '루비떡볶이', '미소의집', '또보겠지떡볶이'],
      '멕시칸': ['감성타코', '낙원타코', '도스타코스', '바토스', '슈가스컬', '쿠차라', '온더보더', '갓잇', '비야게레로', '훌리오'],
      '샐러드': ['카페마마스', '피그인더가든', '알라보', '노티드', '런던베이글뮤지엄', '아티제', '장꼬방', '태극당', '카멜커피', '누데이크'],
      '디저트': ['카페마마스', '피그인더가든', '알라보', '노티드', '런던베이글뮤지엄', '아티제', '장꼬방', '태극당', '카멜커피', '누데이크']
    },
    do: {
      '힐링·산책': ['선릉과 정릉', '도산공원', '양재천', '봉은사', '반포한강공원'],
      '활동·이색': ['방탈출 제로월드', '강남 클라이밍', '양궁카페', 'VR스테이션', '볼링시티'],
      '문화·전시': ['마이아트뮤지엄', '코엑스 아쿠아리움', '현대모터스튜디오', '슈피겐홀', '예술의전당'],
      '핫플·사진': ['별마당도서관', '시몬스그로서리', '젠틀몬스터 하우스', '라인프렌즈', '카카오프렌즈']
    }
  },
  '용산·이태원': {
    coords: { lat: 37.5340, lng: 126.9940 },
    eat: {
      '한식': ['몽탄', '남영돈', '능동미나리', '일미집', '한남북엇국', '쌤쌤쌤', '용산마루', '초원', '강원정', '빠르크', '난포', '금돼지식당', '유용욱바베큐연구소', '봉산집', '구복만두'],
      '일식': ['멘텐', '키보', '갓포아키', '미타스', '죠죠', '유다', '대림국수', '히비'],
      '양식': ['뇨끼바', '오스테리아오르조', '먼치', '효뜨', '더테이블키친', '그랜드하얏트 스테이크하우스', '부자피자', '핍스', '보니스피자펍', '라이너스바베큐', '브레라', '치즈플로', '앵커드'],
      '중식': ['꺼거', '자리', '명화원', '쥬에', '야상해', '한남소관', '중심'],
      '분식': ['현선이네', '한남동자리', '바바김밥', '도토리'],
      '멕시칸': ['바토스', '코레아노스키친', '타코아미고', '크리스피포크타운', '갓잇'],
      '샐러드': ['썸머레인', '선데이아보', '루트에브리데이', '샐러드셀러', '어프로치', '오아시스', '바통'],
      '디저트': ['테디뵈르하우스', '올드페리도넛', '패션5', '앤트러사이트', '마일스톤커피', '아우프글렛']
    },
    do: {
      '힐링·산책': ['남산공원', '용산가족공원', '이촌한강공원', '효창공원'],
      '활동·이색': ['전쟁기념관', '국립중앙박물관', '용산 드래곤힐스파'],
      '문화·전시': ['리움미술관', '아모레퍼시픽 미술관', '블루스퀘어'],
      '핫플·사진': ['해방촌 루프탑', '경리단길', '용리단길']
    }
  },
  '종로·을지로': {
    coords: { lat: 37.5704, lng: 126.9922 },
    eat: {
      '한식': ['우래옥', '광화문국밥', '토속촌', '청진옥', '이문설농탕', '온천집', '깡통만두', '도마', '평래옥', '황소고집', '삼청동수제비', '계림', '사랑방칼국수', '뚝배기집', '부촌육회', '만선호프', '대련집', '남도식당', '잘빠진메밀', '용금옥'],
      '일식': ['오제제', '후라토식당', '진가와', '야마야', '을지다락', '콘부', '유즈라멘', '칸다소바', '호호식당', '시카노이에'],
      '양식': ['녁', '갈리나데이지', '스미스가좋아하는한옥', '몽쉐프', '을지미팅룸', '빠리가옥', '멜팅샵X치즈룸', '고스마', '보나베띠'],
      '중식': ['안동장', '오구반점', '동원집', '차이797', '중심', '서촌계단집'],
      '분식': ['남도분식', '맛보래즉석떡볶이', '풍년쌀농산', '원조할머니떡볶이', '창화당', '익선동농담'],
      '멕시칸': ['쿠차라', '감성타코', '슈가스컬', '도스타코스', '엘샌드위치', '갓잇'],
      '샐러드': ['힐사이드테이블', '카페마마스', 'mk2', '애즈라이크', '도트블랭킷'],
      '디저트': ['런던베이글뮤지엄', '어니언', '청수당', '노티드', '스코프', '혜민당', '호랑이', '챔프커피', '부빙', '통인스윗']
    },
    do: {
      '힐링·산책': ['청계천', '낙산공원', '익선동 한옥거리'],
      '활동·이색': ['광장시장 먹방', '종로 귀금속거리', '한복체험'],
      '문화·전시': ['대림미술관', '서울공예박물관', '국립현대미술관'],
      '핫플·사진': ['익선동 골목', '세운상가', '힙지로 골목']
    }
  },
  '성수·건대': {
    coords: { lat: 37.5445, lng: 127.0559 },
    eat: {
      '한식': ['소문난성수감자탕', '할머니의레시피', '난포', '최가네숯불닭갈비', '황토주막', '조씨네고기국수', '성수족발', '꿉당', '쵸리상경', '중앙감속기', '동래정', '대낚식당', '뚝도농원'],
      '일식': ['소바식당', '호야초밥', '대림국수', '탐광', '텐동식당', '미사리밀빛초계국수', '쿄와텐동', '우리마키', '진작다이닝', '가마솥힙합', '유카네'],
      '양식': ['팩피 (FAGP)', '제스티살룬', '온량', '마리오네', 'HDD피자', '누메로도스', '보어드앤헝그리', '메이빌', '로니로티', '스케줄성수', '콩카세', '다로베', '르프리크'],
      '중식': ['송화산시도삭면', '매화반점', '명봉양꼬치', '제제 (Jeje)', '전자방', '플레이버타운', '라라관', '해룡마라룽샤', '시옹마오'],
      '분식': ['사이드쇼', '아찌떡볶이', '금금', '해피치즈스마일'],
      '멕시칸': ['갓잇', '타코튜즈데이', '와하카', '감성타코', '멕시칼리'],
      '샐러드': ['37.5', '앤드밀', '보마켓', '칙피스', '르베지왕', '메이블탑'],
      '디저트': ['어니언', '대림창고', '누데이크', '카멜커피', '로와이드', '레인리포트', '자연도소금빵', '도레도레', '아쿠아산타']
    },
    do: {
      '힐링·산책': ['서울숲', '뚝섬한강공원', '어린이대공원'],
      '활동·이색': ['성수동 구두거리', '뚝섬 유원지 오리배', '건대 보드게임'],
      '문화·전시': ['그라운드시소 성수', '디뮤지엄', 'KT&G 상상마당'],
      '핫플·사진': ['디올 성수', '피치스 도원', '성수연방']
    }
  },
  '홍대·연남': {
    coords: { lat: 37.5567, lng: 126.9237 },
    eat: {
      '한식': ['우의육', '옥동식', '신미경홍대닭갈비', '윤씨밀방', '미쓰족발', '옹달샘', '조선화로구이', '연남동돼지구이백반', '도마', '돈수백', '뭉텅', '육몽', '산더미불고기', '천사곱창', '연남제비'],
      '일식': ['오레노라멘', '하카타분코', '멘야이또', '카미야', '크레이지카츠', '교카이', '야키토리묵', '무라', '온미동', '히메지', '킨지', '스시노칸도', '쿄라멘', '소코아', '쿠시노주방', '박용석스시'],
      '양식': ['젠틀키친', '비스트로주라', '안녕파스타씨', '광야', '카멜로연남', '파이리퍼블릭', '감칠', '아웃닭', '뉴오더클럽', '레게치킨', '더다이닝랩'],
      '중식': ['연교', '하하', '향미', '진진', '중화복춘', '맛이차이나', '소이연남', '산동만두', '툭툭누들타이'],
      '분식': ['또보겠지떡볶이', '삭', '조폭떡볶이', '그동네떡볶이', '마늘떡볶이', '김덕후의곱창조', '소소한식당'],
      '멕시칸': ['구스토타코', '비무초칸티나', '감성타코', '슬로우타코', '퍼기포레스트'],
      '샐러드': ['그레인', '땡스오트', '어반플랜트', '잼잼', '버터밀크'],
      '디저트': ['랜디스도넛', '카페레이어드', '테일러커피', '앤트러사이트', '파이인더샵', '코코넛박스', '딩가케이크', '피오니', '아우어베이커리', '젤라띠젤라띠']
    },
    do: {
      '힐링·산책': ['연트럴파크', '경의선숲길', '홍제천'],
      '활동·이색': ['홍대 버스킹', '방탈출 카페', '사격장'],
      '문화·전시': ['KT&G 상상마당', '홍대 난타극장', '트릭아이뮤지엄'],
      '핫플·사진': ['연남동 골목', '홍대 놀이터', '땡스북스']
    }
  },
  '잠실·송파': {
    coords: { lat: 37.5133, lng: 127.1025 },
    eat: {
      '한식': ['고도식', '몽촌닭갈비', '청와옥', '별미곱창', '장수식당', '오모리찌개', '해주냉면', '함경도찹쌀순대', '큰손닭한마리', '할머니포장마차멸치국수', '주은감자탕', '뽀빠이분식', '정성한줄', '본가설렁탕', '풍년뼈다귀해장국'],
      '일식': ['배키욘방', '만푸쿠', '오레노라멘', '멘야하나비', '단디', '동경산책', '야끼소바니주마루', '네기우나기야', '스시산', '부일갈매기', '해목', '젠'],
      '양식': ['앨리스리틀이태리', '더이탈리안클럽', '치즈룸X테이스팅룸', '고든램지버거', '바이킹스워프', '쌤쌤쌤', '빌즈', '요리하는남자', '미이정', '니커버커베이글', '펙'],
      '중식': ['서두산딤섬', '중화일상', '크리스탈제이드', '일일향', '형제짬뽕', '차이797', '만다린'],
      '분식': ['뽀빠이분식', '모꼬지에', '갈현동할머니떡볶이', '사과떡볶이', '케이트분식당', '새우공방'],
      '멕시칸': ['갓잇', '온더보더', '도스타코스', '바토스'],
      '샐러드': ['진저베어', '라라브레드', '뉴질랜드스토리', '르브런쉭', '칫챗', '킴스델리마켓'],
      '디저트': ['런던베이글뮤지엄', '노티드', '카페페퍼', '가배도', '프레데릭베이커리', '뷰클런', '젤라띠젤라띠', '키친205', '앤티크커피', '꼬앙드파리']
    },
    do: {
      '힐링·산책': ['올림픽공원', '잠실종합운동장', '송파나루공원', '석촌호수', '한강공원'],
      '활동·이색': ['롯데월드', '잠실실내빙상장', '스포츠몬스터', '방탈출', '보드게임카페'],
      '문화·전시': ['롯데월드몰', '송파책박물관', '올림픽기념관', '갤러리', '공연장'],
      '핫플·사진': ['잠실타워', '석촌호수 벚꽃', '올림픽공원 포토존', '송파 거리', '카페거리']
    }
  },
  '성남·분당': {
    coords: { lat: 37.3827, lng: 127.1210 },
    eat: {
      '한식': ['능라도', '감미옥', '고기리막국수', '우가', '평양면옥', '진대감', '사위식당', '산촌버섯매운탕', '솔밭삼겹살', '유치회관', '서울24시감자탕', '두레', '화포식당', '효', '윤밀원'],
      '일식': ['진우동', '스시쿤', '하나스시', '우나기강', '긴자', '호쿠모쿠', '백소정', '오복수산', '야마다야', '라멘모토', '이자카야 류'],
      '양식': ['리스카페', '데이빗앤룰스', '제로투나인', '뚜에이오', '빈티지1981', '올라', '헬로오드리', '메이홈', '스톤월', '비스트로도마', '그래니살룬', '아임홈'],
      '중식': ['블루상하이', 'JS가든', '최고집손짜장', '매란방', '시추안하우스', '차알', '진라이', '뽕사부'],
      '분식': ['영심이떡볶이', '다다김밥', '깨돌이김밥', '그집', '남해소반', '고래즉석떡볶이'],
      '멕시칸': ['감성타코', '랄루차', '칸티나', '부릿팝', '갓잇'],
      '샐러드': ['카페마마스', '앤디스가든', '플랩잭팬트리', '볼썸', '호텔더일'],
      '디저트': ['커스텀커피', '이스팀', '올댓커피', '모아니', '백금당', '몽슈슈', '아티제', '키로베이커리', '도넛드로잉']
    },
    do: {
      '힐링·산책': ['분당중앙공원', '정자호수공원', '야탑공원', '성남천', '산책로'],
      '활동·이색': ['분당 볼링', '방탈출', '보드게임', '클라이밍', 'VR체험'],
      '문화·전시': ['분당문화재단', '갤러리', '공연장', '도서관', '박물관'],
      '핫플·사진': ['분당 거리', '카페거리', '포토존', '야경', '카페']
    }
  },
  '수원': {
    coords: { lat: 37.2636, lng: 127.0286 },
    eat: {
      '한식': ['가보정', '본수원갈비', '신라갈비', '진미통닭', '용성통닭', '유치회관', '그집쭈꾸미', '이나경송탄부대찌개', '미식가의주방', '솔솥', '뜸', '명성돼지갈비', '옥동이', '보영만두', '코끼리만두', '석산정'],
      '일식': ['키와마루아지', '이치하치', '마츠리동', '카츠이산', '하쿠', '백소정', '오늘의초밥', '오초', '멘야고코로', '우동일번가'],
      '양식': ['운멜로', '운멜로랩', '존앤진피자펍', '오테이블', '트라토리아식구', '로우파이브', '세상의모든아침', '서가앤쿡', '잭슨피자'],
      '중식': ['연밀', '수원만두', '길림성', '고등반점', '홍화루', '짬뽕지존'],
      '분식': ['짱이네떡볶이', '중평떡볶이', '남문매운오뎅', '떡순튀'],
      '멕시칸': ['올라메히코', '감성타코'],
      '샐러드': ['팜투하녹', '르디투어', '37.5'],
      '디저트': ['정지영커피', '킵댓', '콜링우드', '본지르르', '런던베이글뮤지엄', '츄플러스']
    },
    do: {
      '힐링·산책': ['수원화성', '팔달산', '광교호수', '수원천', '공원'],
      '활동·이색': ['수원화성 투어', '방탈출', '보드게임', '클라이밍', '체험'],
      '문화·전시': ['수원화성', '화성행궁', '수원박물관', '갤러리', '공연'],
      '핫플·사진': ['수원화성 포토존', '광교', '팔달문', '거리', '카페']
    }
  },
  '인천': {
    coords: { lat: 37.4563, lng: 126.7052 },
    eat: {
      '한식': ['신포닭강정', '변가네옹진냉면', '송도갈비', '부암갈비', '잉글랜드왕돈까스', '명월집', '해목', '거부곱창', '경인면옥', '온센', '깨비옥', '금산식당', '동락반점', '용화반점', '이학갈비', '삼강옥', '군봉묵은지김치찜'],
      '일식': ['스시사쿠', '아키라커피', '하나비', '긴자', '텐메이', '야끼화로', '칸지돈부리', '솟구쳐차기', '키카', '에키노마에'],
      '양식': ['풀사이드228', '툴롱', '파니노구스토', '조우마', '잇츠이츠', '오일리', '빌라즈', '케이슨24', '임파스토', '써스티몽크'],
      '중식': ['신승반점', '연경', '만다복', '공화춘', '중화루', '미광', '진흥각', '럭키차이나', '산동주방'],
      '분식': ['남동공단떡볶이', '모녀떡볶이', '얼레꼴레만두', '대왕김밥', '청년다방', '옥련할머니즉석떡볶이'],
      '멕시칸': ['바네스타코', '띠오 데 꼬미다', '타코시엘로', '갓잇'],
      '샐러드': ['포레스트아웃팅스', '마호가니', '브런치빈', '맨홀커피', '아키라화이트'],
      '디저트': ['안스베이커리', '젠젠', '팟알', '코스모40', '조양방직', '바다앞테라스', '기노스코', '혜리별관', '카페차', '일광전구 라이트하우스']
    },
    do: {
      '힐링·산책': ['송도센트럴파크', '월미도', '을왕리해수욕장', '인천대공원', '한강공원'],
      '활동·이색': ['송도 스카이워크', '월미도 유람선', '방탈출', '보드게임', 'VR'],
      '문화·전시': ['인천아트플랫폼', '차이나타운', '송도갤러리', '박물관', '공연'],
      '핫플·사진': ['송도 트리플스트리트', '차이나타운', '월미도', '포토존', '카페']
    }
  }
};

// 3. 데이터 캐싱 및 로더
let CACHED_DB = null;
/** 시트에서 로드한 장소별 상세 (주소, 대표메뉴) — 키: `${regionKey}|${name}` */
let CACHED_PLACE_DETAILS = null;

/** 지역/위치 문자열 → 앱 지역키 매핑 (강남·서초 / 용산·이태원 / …) */
function locationToRegionKey(locationHint) {
  if (!locationHint || typeof locationHint !== 'string') return '강남·서초';
  const h = locationHint.trim();
  if (/용산|이태원|한남|남영|해방촌|경리단|용리단/.test(h)) return '용산·이태원';
  if (/종로|을지로|익선|광장|동대문|청계|낙산/.test(h)) return '종로·을지로';
  if (/성수|건대|건대입구|뚝섬|왕십리|서울숲|아차산/.test(h)) return '성수·건대';
  if (/홍대|연남|마포|서강|연트럴/.test(h)) return '홍대·연남';
  if (/잠실|송파|석촌|문정|올림픽|파미에/.test(h)) return '잠실·송파';
  if (/성남|분당|정자|수내|야탑|판교/.test(h)) return '성남·분당';
  if (/수원|화성|팔달|장안|광교/.test(h)) return '수원';
  if (/인천|송도|부평|연수|을왕리|월미도/.test(h)) return '인천';
  return '강남·서초';
}

// CSV 한 행 파싱 (쉼표가 포함된 셀은 "..." 로 감싸져 있음)
function parseCsvRow(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let end = line.indexOf('"', i + 1);
      if (end === -1) end = line.length;
      out.push(line.slice(i + 1, end).replace(/""/g, '"'));
      i = end + 1;
      if (line[i] === ',') i += 1;
    } else {
      const comma = line.indexOf(',', i);
      const end = comma === -1 ? line.length : comma;
      out.push(line.slice(i, end).trim());
      i = comma === -1 ? line.length : comma + 1;
    }
  }
  return out;
}

// 시트 CSV 텍스트를 파싱해 db와 CACHED_PLACE_DETAILS에 병합
// 컬럼: 카테고리(A), 식당명(B), 지역/위치(C), 네이버 도로명 주소(D), 특징/대표메뉴(E)
function mergeSheetIntoDb(text, db, placeDetails) {
  const rows = text.split(/\r?\n/).slice(1);
  rows.forEach(row => {
    const cols = parseCsvRow(row);
    const category = (cols[0] || '').trim();
    const name = (cols[1] || '').trim();
    const locationHint = (cols[2] || '').trim();
    const address = (cols[3] || '').trim();
    const representativeMenu = (cols[4] || '').trim();

    if (!category || !name) return;

    const regionKey = locationToRegionKey(locationHint);
    if (!db[regionKey]) return;

    if (!db[regionKey].eat[category]) {
      db[regionKey].eat[category] = [];
    }
    if (!db[regionKey].eat[category].includes(name)) {
      db[regionKey].eat[category].push(name);
    }

    const key = `${regionKey}|${name}`;
    placeDetails[key] = { address, representativeMenu };
  });
}

// 구글 시트 여러 탭 로드 후 병합 — 모든 탭의 주소로 '네이버에서 보기' 연결
async function getDatabase() {
  if (CACHED_DB) return CACHED_DB;

  const db = JSON.parse(JSON.stringify(BASE_DB));
  CACHED_PLACE_DETAILS = {};

  for (const gid of GOOGLE_SHEET_GIDS) {
    try {
      const url = `${GOOGLE_SHEET_BASE}${gid}`;
      const response = await fetch(url);
      const text = await response.text();
      mergeSheetIntoDb(text, db, CACHED_PLACE_DETAILS);
    } catch (e) {
      console.warn(`🚨 구글 시트 gid=${gid} 로드 실패:`, e);
    }
  }

  console.log("✅ 구글 시트 데이터 병합 완료 (주소로 네이버에서 보기 연결)");
  CACHED_DB = db;
  return db;
}

/** 시트에서 로드한 장소 상세(주소, 대표메뉴) 반환. 없으면 null */
export function getPlaceDetails(regionKey, name) {
  if (!CACHED_PLACE_DETAILS || !regionKey || !name) return null;
  const key = `${regionKey}|${name}`;
  return CACHED_PLACE_DETAILS[key] || null;
}

// 4. 좌표 흔들기 (실제 좌표가 없을 때만 사용)
const getOffset = () => (Math.random() - 0.5) * 0.005;

// 4-2. 앱인토스 지도 연동: 장소별 실제 좌표 (지도 핀 정확도·길찾기 연동용)
const PLACE_COORDS = {
  '소문난성수감자탕': { lat: 37.5440, lng: 127.0550, address: '서울 성동구 연무장길 45' },
  '그라운드시소 성수': { lat: 37.5452, lng: 127.0568, address: '서울 성동구 아차산로17길 49' },
  '디뮤지엄': { lat: 37.5198, lng: 127.0524, address: '서울 성동구 왕십리로 83-21' },
  'KT&G 상상마당': { lat: 37.5562, lng: 126.9245, address: '서울 마포구 와우산로 29길 15' },
  '롯데월드': { lat: 37.5112, lng: 127.0982, address: '서울 송파구 올림픽로 240' },
  '송도센트럴파크': { lat: 37.3837, lng: 126.6534, address: '인천 연수구 센트럴로 123' },
  '수원화성': { lat: 37.2820, lng: 127.0190, address: '경기 수원시 장안구 경수로 825' },
  '올림픽공원': { lat: 37.5212, lng: 127.1222, address: '서울 송파구 올림픽로 424' },
  '서울숲': { lat: 37.5447, lng: 127.0370, address: '서울 성동구 뚝섬로 273' },
  '남산공원': { lat: 37.5502, lng: 126.9920, address: '서울 용산구 남산공원길 125' },
  '청계천': { lat: 37.5710, lng: 127.0245, address: '서울 종로구 청계천로' },
  '도산공원': { lat: 37.5235, lng: 127.0285, address: '서울 강남구 도산대로 45' },
};
function getPlaceCoords(name, regionKey, regionData) {
  const fixed = PLACE_COORDS[name?.trim()];
  if (fixed) return { lat: fixed.lat, lng: fixed.lng, address: fixed.address };
  const base = regionData?.coords || { lat: 37.5665, lng: 126.978 };
  return {
    lat: base.lat + getOffset(),
    lng: base.lng + getOffset(),
    address: `${regionKey} (정확한 위치는 네이버 지도에서 확인)`,
  };
}

// 5. 카테고리별 고유 이모지 (지도 핀·목록 아이콘용)
const getCategoryEmoji = (cat) => {
  // 오늘 뭐 먹지: 한식·일식·중식·양식·분식·멕시칸·샐러드·디저트
  if (cat === '한식') return '🍚';
  if (cat === '일식') return '🍣';
  if (cat === '중식') return '🥟';
  if (cat === '양식') return '🍔';
  if (cat === '분식') return '🥘';
  if (cat === '멕시칸') return '🌮';
  if (cat === '샐러드') return '🥗';
  if (cat === '디저트') return '🍰';
  // 오늘 뭐 하지: 힐링·산책, 활동·이색, 문화·전시, 핫플·사진
  if (cat === '힐링·산책') return '🌿';
  if (cat === '활동·이색') return '🛹';
  if (cat === '문화·전시') return '🎨';
  if (cat === '핫플·사진') return '📸';
  return '✨';
};

// 6. 공지사항
const NOTICES = [
  "📢 재료 소진 시 조기 마감될 수 있습니다.",
  "🚗 주차 공간이 협소하니 대중교통을 이용해주세요.",
  "⏰ 웨이팅이 있을 수 있으니 예약 추천드려요!",
  "🐶 반려동물 동반 가능한 공간입니다.",
  "🎉 네이버 리뷰 작성 시 음료 서비스!"
];

// 카테고리별 대표 메뉴 (핀 클릭 시 하단 시트에 표시)
const REPRESENTATIVE_MENUS = {
  '한식': ['김치찌개', '불고기', '비빔밥', '된장찌개', '제육볶음'],
  '일식': ['초밥', '라멘', '돈카츠', '우동', '오마카세'],
  '중식': ['짜장면', '짬뽕', '탕수육', '깐풍기', '유니짜장'],
  '양식': ['파스타', '스테이크', '피자', '리조또', '버거'],
  '분식': ['떡볶이', '순대', '튀김', '라면', '김밥'],
  '멕시칸': ['타코', '부리또', '나초', '퀘사디아', '팔레타'],
  '샐러드': ['시저샐러드', '그릭샐러드', '콥샐러드', '연어샐러드'],
  '디저트': ['케이크', '아이스크림', '와플', '마카롱', '브라우니']
};
const pickRepresentativeMenu = (category) => {
  let menus = REPRESENTATIVE_MENUS[category];
  if (!menus || menus.length === 0) {
    const all = Object.values(REPRESENTATIVE_MENUS).flat();
    menus = all.length ? all : [];
  }
  if (menus.length === 0) return '';
  const count = Math.random() > 0.5 ? 2 : 3;
  return menus.sort(() => 0.5 - Math.random()).slice(0, count).join(', ');
};

// 지역 키 통일 (Select는 location, Home은 region 전달)
const normalizeRegionKey = (key) => {
  if (!key) return '강남·서초';
  const map = {
    '강남·서초·송파': '강남·서초', '용산·마포·서대문': '용산·이태원',
    '종로·동대문': '종로·을지로', '성수·건대입구': '성수·건대', '관악·영등포': '강남·서초'
  };
  return map[key] || key;
};

// 네이버 플레이스 검색 시 해당 지역 지도가 나오도록 하는 키워드 (홍대→홍대, 을지로→종로 등)
const getNaverPlaceRegionHint = (regionKey) => {
  const hints = {
    '강남·서초': '강남',
    '용산·이태원': '이태원',
    '종로·을지로': '종로',
    '성수·건대': '성수',
    '홍대·연남': '홍대',
    '잠실·송파': '잠실',
    '성남·분당': '분당',
    '수원': '수원',
    '인천': '인천'
  };
  return hints[regionKey] || regionKey.split('·')[0] || regionKey;
};

// 장소별 검색 보조 키워드 (정확한 장소 검색 — 네이버 검색 시 다른 장소 노출 방지)
// 예: "그라운드시소 성수"만 검색 시 아잇갤러리 등 다른 장소 노출 → "성수낙낙" 추가
const PLACE_SEARCH_HINTS = {
  '그라운드시소 성수': '성수낙낙',
  '디뮤지엄': '서울숲',
  '금금': '성수동',
  '도산분식': '신사동',
  '소문난성수감자탕': '연무장길',
  '디올 성수': '성수동',
  '피치스 도원': '성수동',
};

/** 행운 장소 카드용 기본 이미지 (이미지 없을 때 사용) */
const DEFAULT_PLACE_IMAGE_URL = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop';

/** 장소별 썸네일 이미지 URL (있으면 사용, 없으면 DEFAULT_PLACE_IMAGE_URL) */
const PLACE_IMAGE_URLS = {
  '소문난성수감자탕': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
  '김밥천국': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&h=200&fit=crop',
  '순대국밥': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&h=200&fit=crop',
};

/** 장소명 + 지역(선택) + 주소(선택)로 네이버 플레이스 검색 URL 생성 — 주소 있으면 해당 장소로 바로 연결 */
function buildNaverPlaceUrl(name, regionKey, address = '') {
  const regionHint = getNaverPlaceRegionHint(regionKey);
  const extraHint = PLACE_SEARCH_HINTS[name?.trim()];
  let parts = [name?.trim() || ''];
  if (address && address.trim()) {
    parts.push(address.trim());
  } else {
    if (regionHint && !name?.includes(regionHint)) parts.push(regionHint);
    if (extraHint && !name?.includes(extraHint)) parts.push(extraHint);
  }
  const query = parts.filter(Boolean).join(' ');
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

// 지역 키 → places.location 필터용 키워드 (해당 지역에 속하는 location 문자열)
const REGION_LOCATION_KEYWORDS = {
  '강남·서초': ['강남', '서초', '역삼', '청담', '양재', '논현', '압구정', '삼성', '도산', '예술', '청계산', '교대'],
  '용산·이태원': ['용산', '이태원', '한남', '경리단', '해방촌', '동부이촌'],
  '종로·을지로': ['종로', '을지로', '익선', '광장', '동대문', '청계', '낙산', '인사', '북촌', '안국', '종로1', '종로2'],
  '성수·건대': ['성수', '건대', '서울숲', '아차산', '뚝섬', '연무장', '금호'],
  '홍대·연남': ['홍대', '연남', '서강', '마포', '상수', '합정', '동교'],
  '잠실·송파': ['잠실', '송파', '올림픽', '방이', '문정', '가락'],
  '성남·분당': ['성남', '분당', '정자', '수내', '야탑', '이매'],
  '수원': ['수원', '팔달', '장안', '영통', '권선'],
  '인천': ['인천', '송도', '연수', '청라', '강화', '차이나타운', '개항', '옥련', '구월', '가좌', '영종']
};

/** 네이버 지도 검색 가능한 장소인지 (유효한 naver_map_url 보유) */
function hasValidNaverMapUrl(p) {
  const url = p?.naver_map_url;
  return typeof url === 'string' && url.trim().length > 10 && url.includes('naver.com');
}

/** 오늘 뭐 먹지: places.ts에서 지역·카테고리 필터 후, 검색 가능한(네이버 링크 있는) 가게 위주로 랜덤 3개 반환 */
function getRandomPlacesFromData(regionKey, menu) {
  const keywords = REGION_LOCATION_KEYWORDS[regionKey] || regionKey.split('·').map(s => s.trim());
  const regionFiltered = placesList.filter((p) =>
    keywords.some((kw) => p.location && p.location.includes(kw))
  );
  const pool = regionFiltered.length > 0 ? regionFiltered : placesList;
  const categoryFiltered =
    menu && menu !== '랜덤'
      ? pool.filter((p) => p.category === menu || (p.category && p.category.includes(menu)))
      : pool;
  const withUrl = (categoryFiltered.length > 0 ? categoryFiltered : pool).filter(hasValidNaverMapUrl);
  const finalPool = withUrl.length > 0 ? withUrl : (categoryFiltered.length > 0 ? categoryFiltered : pool);
  const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// 7. 메인 함수 (외부에서 호출)
export async function fetchRecommendations(params) {
  const rawRegion = params.region || params.location;
  const regionKey = normalizeRegionKey(rawRegion) || '강남·서초';
  const mode = params.mode || 'eat'; // 'eat' 또는 'do'
  const category = (mode === 'eat' ? params.menu : params.mood) || '랜덤';

  console.log(`🔎 검색: [${regionKey}] 지역의 [${category}] (${mode})`);

  // 오늘 뭐 먹지: places.ts(673개)에서 지역·메뉴 필터 후 랜덤 3개 사용
  if (mode === 'eat' && placesList && placesList.length > 0) {
    const db = await getDatabase();
    const regionData = db[regionKey] || db['강남·서초'];
    const baseCoords = regionData?.coords || { lat: 37.5665, lng: 126.978 };
    const picked = getRandomPlacesFromData(regionKey, category);
    const results = picked.map((p, index) => {
      const offset = () => (Math.random() - 0.5) * 0.008;
      return {
        id: p.id,
        name: p.name,
        description: p.description || `${p.category} 핫플레이스`,
        lat: baseCoords.lat + offset(),
        lng: baseCoords.lng + offset(),
        emoji: getCategoryEmoji(p.category),
        status: Math.random() > 0.4 ? "웨이팅 있음" : "입장 가능",
        statusColor: "green",
        notice: NOTICES[Math.floor(Math.random() * NOTICES.length)],
        naverUrl: p.naver_map_url || '',
        naver_map_url: p.naver_map_url || '',
        hours: "11:00 - 22:00",
        address: p.address || '',
        time: ["12:00", "15:00", "18:00"][index],
        tag: p.category,
        representativeMenu: p.description || '',
        solo_difficulty_level: Math.min(5, Math.max(1, index + 1 + Math.floor(Math.random() * 2)))
      };
    });
    return new Promise((resolve) => setTimeout(() => resolve(results), 400));
  }

  // 오늘 뭐 하지: 기존 DB 로직 유지
  const db = await getDatabase();
  let regionData = db[regionKey];
  if (!regionData) {
    console.warn(`🚨 지역 데이터 없음: ${regionKey} -> 강남으로 대체`);
    regionData = db['강남·서초'];
  }

  const categoryMap = regionData[mode] || {};
  let placeNames = categoryMap[category];
  if (!placeNames || placeNames.length === 0) {
    const allPlaces = Object.values(categoryMap).flat();
    placeNames = allPlaces.sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  const results = placeNames.slice(0, 3).map((name, index) => {
    const coords = getPlaceCoords(name, regionKey, regionData);
    const details = getPlaceDetails(regionKey, name);
    const address = (details?.address && details.address.trim()) ? details.address : coords.address;
    const representativeMenuStr = (details?.representativeMenu && details.representativeMenu.trim())
      ? details.representativeMenu
      : (mode === 'eat' ? pickRepresentativeMenu(category) : '');

    const isWaiting = Math.random() > 0.4;
    const randomNotice = NOTICES[Math.floor(Math.random() * NOTICES.length)];
    const naverUrl = buildNaverPlaceUrl(name, regionKey, address);

    const solo_difficulty_level = mode === 'eat' ? Math.min(5, Math.max(1, index + 1 + Math.floor(Math.random() * 2))) : 1;

    return {
      id: index + 1,
      name: name,
      description: `${category} 핫플레이스`,
      lat: coords.lat,
      lng: coords.lng,
      emoji: getCategoryEmoji(category),
      status: isWaiting ? "웨이팅 있음" : "입장 가능",
      statusColor: isWaiting ? "red" : "green",
      notice: randomNotice,
      naverUrl,
      hours: "11:00 - 22:00",
      address,
      time: ["12:00", "15:00", "18:00"][index],
      tag: category,
      representativeMenu: representativeMenuStr,
      solo_difficulty_level
    };
  });

  return new Promise(resolve => setTimeout(() => resolve(results), 600));
}

// (lat,lng)에서 가장 가까운 지역 키 반환
function getClosestRegionKey(db, lat, lng) {
  if (lat == null || lng == null) return '강남·서초';
  let bestKey = '강남·서초';
  let bestDist = Infinity;
  for (const [key, data] of Object.entries(db)) {
    const c = data.coords;
    if (!c?.lat || c?.lng == null) continue;
    const dist = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key;
    }
  }
  return bestKey;
}

/** lucky_food(행운의 음식) → DB 카테고리 매핑 */
const LUCKY_FOOD_TO_CATEGORY = {
  '순대국': '한식', '카레': '양식', '파스타': '양식', '비빔밥': '한식', '라멘': '일식',
  '돈카츠': '일식', '삼겹살': '한식', '초밥': '일식', '브런치': '양식', '아메리카노': '디저트',
  '디저트': '디저트', '떡볶이': '분식', '쌈밥': '한식', '불고기': '한식', '해산물': '일식',
  '스테이크': '양식',
};

/** Haversine 거리 계산 (km) */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 운세 lucky_food + 유저 좌표 기준 반경 1km 내 행운 장소 검색
 * @param {{ keyword: string, lat: number, lng: number }} params
 * @returns {Promise<Array<{ name: string, distance: number, distanceText: string, solo_difficulty_level: number, naverUrl: string, emoji: string }>>}
 */
export async function fetchLuckyPlacesNearby(params) {
  const db = await getDatabase();
  const { keyword, lat, lng } = params || {};
  if (lat == null || lng == null || !keyword) return [];

  const regionKey = getClosestRegionKey(db, lat, lng);
  const regionData = db[regionKey] || db['강남·서초'];
  const categoryMap = regionData.eat || {};
  const category = LUCKY_FOOD_TO_CATEGORY[keyword] || '한식';
  let placeNames = categoryMap[category];
  if (!placeNames || placeNames.length === 0) {
    placeNames = Object.values(categoryMap).flat();
  }
  placeNames = [...new Set(placeNames)].sort(() => 0.5 - Math.random()).slice(0, 8);

  const centerLat = regionData.coords?.lat ?? lat;
  const centerLng = regionData.coords?.lng ?? lng;
  const getOffset = () => (Math.random() - 0.5) * 0.01;

  const regionHint = getNaverPlaceRegionHint(regionKey);
  const results = placeNames.map((name, index) => {
    const details = getPlaceDetails(regionKey, name);
    const address = details?.address?.trim() || '';
    const placeLat = centerLat + getOffset();
    const placeLng = centerLng + getOffset();
    const distanceKm = haversineKm(lat, lng, placeLat, placeLng);
    const distanceM = Math.round(distanceKm * 1000);
    const distanceText = distanceM >= 1000 ? `${(distanceKm).toFixed(1)}km` : `${distanceM}m`;
    const solo_difficulty_level = Math.min(5, Math.max(1, (index % 5) + 1));
    const naverUrl = buildNaverPlaceUrl(name, regionKey, address);
    return {
      name,
      regionKey,
      regionHint,
      address,
      lat: placeLat,
      lng: placeLng,
      distance: distanceM,
      distanceText,
      solo_difficulty_level,
      naverUrl,
      emoji: getCategoryEmoji(category),
      imageUrl: PLACE_IMAGE_URLS[name] || DEFAULT_PLACE_IMAGE_URL,
    };
  });

  const within1km = results.filter((r) => r.distance <= 1000);
  const sorted = (within1km.length > 0 ? within1km : results)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return new Promise((resolve) => setTimeout(() => resolve(sorted), 500));
}

/**
 * 찜한 장소 근처의 반대 유형 1곳 추천 (나의 찜한 코스용)
 * @param {{ lat: number, lng: number, type: 'eat' | 'do' }} params - 찜한 장소의 좌표와 유형
 * @returns {Promise<{ name: string, emoji: string, tag: string, naverUrl: string, solo_difficulty_level: number }>}
 */
export async function fetchNearbyRecommendation(params) {
  const db = await getDatabase();
  const { lat, lng, type } = params || {};
  const wantType = type === 'do' ? 'do' : 'eat';
  const regionKey = getClosestRegionKey(db, lat, lng);
  const regionData = db[regionKey] || db['강남·서초'];
  const categoryMap = regionData[wantType] || {};
  const allNames = Object.values(categoryMap).flat();
  const placeNames = allNames.length > 0 ? allNames : (wantType === 'eat' ? ['근처 맛집'] : ['근처 활동']);
  const name = placeNames[Math.floor(Math.random() * placeNames.length)];
  const category = Object.entries(categoryMap).find(([, arr]) => arr.includes(name))?.[0] || '추천';
  const details = getPlaceDetails(regionKey, name);
  const address = details?.address?.trim() || '';
  const naverUrl = buildNaverPlaceUrl(name, regionKey, address);
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          name,
          emoji: getCategoryEmoji(category),
          tag: category,
          naverUrl,
          address,
          solo_difficulty_level: 1,
          imageUrl: PLACE_IMAGE_URLS[name] || DEFAULT_PLACE_IMAGE_URL,
        }),
      400
    );
  });
}
/**
 * Vercel Serverless: 가게명으로 네이버 지역 검색 → 주소·이미지 등 반환
 * GET /api/naver-place?name=가게명&region=강남
 *
 * 환경 변수 (Vercel 프로젝트 설정에 추가):
 * - NAVER_CLIENT_ID: 네이버 개발자센터 검색 API 클라이언트 ID
 * - NAVER_CLIENT_SECRET: 네이버 개발자센터 검색 API 클라이언트 시크릿
 * @see https://developers.naver.com/docs/serviceapi/search/local/local.md
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set in environment',
    });
  }

  const name = (req.query.name || '').trim();
  const region = (req.query.region || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Query "name" is required' });
  }

  // 검색 쿼리 후보: "가게명 지역전체" → "가게명 지역1" / "가게명 지역2" → "가게명" (종로·을지로 등 복합 지역은 나눠서 재시도)
  const queryCandidates = [];
  if (region) {
    queryCandidates.push(`${name} ${region}`);
    const parts = region.split(/[·\s]+/).filter(Boolean);
    for (const part of parts) {
      if (part.length >= 2) queryCandidates.push(`${name} ${part}`);
    }
  }
  queryCandidates.push(name);

  const headers = {
    'X-Naver-Client-Id': clientId,
    'X-Naver-Client-Secret': clientSecret,
  };

  try {
    for (const query of queryCandidates) {
      const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=random`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({
          error: 'Naver API error',
          status: response.status,
          detail: text.slice(0, 200),
        });
      }

      const data = await response.json();
      const items = data.items || [];
      const first = items[0];
      if (!first) continue;

      const out = {
        found: true,
        query,
        title: first.title?.replace(/<[^>]+>/g, '').trim() || first.title,
        address: first.address || '',
        roadAddress: first.roadAddress || '',
        link: first.link || '',
        category: first.category || '',
        mapx: first.mapx,
        mapy: first.mapy,
        imageUrl: first.firstImage || null,
      };
      return res.status(200).json(out);
    }
    return res.status(200).json({ found: false, query: queryCandidates[0] });
  } catch (err) {
    console.error('[naver-place]', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

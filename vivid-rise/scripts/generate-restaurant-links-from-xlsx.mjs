import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';

/**
 * Reads vivid-rise/restaurant_data.xlsx and generates src/data/restaurantLinksFromXlsx.json
 *
 * Expected columns (0-index):
 * A category
 * B name
 * C location/region hint
 * D road address
 * E representative menu / description
 * F naver map link (required for "네이버에서 보기" direct open)
 */

const ROOT = process.cwd();
// 엑셀 파일 위치가 프로젝트 루트(pickt-daily) 또는 vivid-rise 내부일 수 있어 둘 다 시도
const INPUT_CANDIDATES = [
  path.join(ROOT, '..', 'restaurant_data.xlsx'), // repo root
  path.join(ROOT, 'restaurant_data.xlsx'), // vivid-rise/
];
const INPUT = INPUT_CANDIDATES.find((p) => fs.existsSync(p));
const OUTPUT = path.join(ROOT, 'src', 'data', 'restaurantLinksFromXlsx.json');

function normalizeNaverUrl(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^(map\.|m\.map\.|m\.place\.|place\.)naver\.com\//i.test(s)) return `https://${s}`;
  if (/^naver\.me\//i.test(s)) return `https://${s}`;
  return s;
}

function looksLikeHeaderRow(row) {
  const joined = row.map((c) => String(c ?? '').trim()).join(' ');
  return /카테고리|식당|가게|상호|주소|네이버/i.test(joined);
}

if (!INPUT) {
  console.error(`[xlsx] input not found. tried: ${INPUT_CANDIDATES.join(', ')}`);
  process.exit(1);
}

const wb = xlsx.readFile(INPUT, { cellDates: false });
const sheetName = wb.SheetNames[0];
if (!sheetName) {
  console.error('[xlsx] no sheets found');
  process.exit(1);
}

const ws = wb.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: false });

let start = 0;
if (rows.length && looksLikeHeaderRow(rows[0])) start = 1;

/** @type {Record<string, { naver_map_url: string, address?: string, representativeMenu?: string, locationHint?: string, category?: string }>} */
const byName = {};

for (let i = start; i < rows.length; i += 1) {
  const row = rows[i] || [];
  const category = String(row[0] ?? '').trim();
  const name = String(row[1] ?? '').trim();
  const locationHint = String(row[2] ?? '').trim();
  const address = String(row[3] ?? '').trim();
  const representativeMenu = String(row[4] ?? '').trim();
  const naver_map_url = normalizeNaverUrl(row[5] ?? '');

  if (!name) continue;
  if (!naver_map_url || naver_map_url.length < 10 || !/naver\.(com|me)/i.test(naver_map_url)) continue;

  // Keep first non-empty; don't overwrite unless existing is empty
  if (!byName[name] || !byName[name].naver_map_url) {
    byName[name] = {
      naver_map_url,
      address: address || undefined,
      representativeMenu: representativeMenu || undefined,
      locationHint: locationHint || undefined,
      category: category || undefined,
    };
  }
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify({ byName }, null, 2), 'utf8');

console.log(`[xlsx] generated: ${OUTPUT}`);
console.log(`[xlsx] input: ${INPUT}`);
console.log(`[xlsx] items: ${Object.keys(byName).length}`);


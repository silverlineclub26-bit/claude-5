// 用高次蒙地卡羅把 169 手起手牌的「vs 隨機一手」勝率百分位算穩，
// 再把結果烘進 index.src.html（取代載入時計算，客戶端零成本、排序穩定）。
// 用法：node precompute.mjs  （更動評估器邏輯後才需重跑）
import fs from 'node:fs';
import esbuild from 'esbuild';

const path = 'index.src.html';
const src = fs.readFileSync(path, 'utf8');
let code = src.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/)[1];
code = code.replace(/ReactDOM\.createRoot[\s\S]*?;\s*$/, '');
const js = esbuild.transformSync(code, { loader: 'jsx', jsx: 'transform', jsxFactory: 'H', jsxFragment: 'F', target: 'es2020' }).code;
const React = { useReducer: () => [], useEffect() {}, useMemo: (f) => f && f(), useRef: () => ({}), useState: (v) => [v, () => {}], Fragment: 'F' };
const api = new Function('React', 'ReactDOM', 'H', 'F', js + '\nreturn { equityVsN, repCards, RANKS };')(React, { createRoot: () => ({ render() {} }) }, () => null, 'F');

const { equityVsN, repCards, RANKS } = api;
const SIMS = 30000;
const codes = [];
for (let i = 12; i >= 0; i--) { codes.push(RANKS[i] + RANKS[i]); for (let j = i - 1; j >= 0; j--) { codes.push(RANKS[i] + RANKS[j] + 's'); codes.push(RANKS[i] + RANKS[j] + 'o'); } }

console.error(`計算 ${codes.length} 手 × ${SIMS} 次模擬…`);
const eqs = codes.map(c => ({ code: c, e: (() => { const q = equityVsN(repCards(c), [], 1, SIMS); return q.win + q.tie * 0.5; })() }));
eqs.sort((a, b) => b.e - a.e);
const pct = {};
eqs.forEach((x, i) => { pct[x.code] = Math.round(((i + 0.5) / eqs.length) * 1000) / 1000; });

// 產生緊湊的物件字面值（鍵一律加引號，因 98s、72o 等數字開頭鍵不可裸寫）
const literal = '{' + eqs.map(x => `'${x.code}':${pct[x.code]}`).join(',') + '}';

const block = `const HAND_PCT = ${literal};`;
// 取代 HAND_PCT 宣告：可能是原始 IIFE，或先前烘好的靜態表（讓本腳本可重複執行）
const newSrc = src.replace(/const HAND_PCT = (?:\(function buildHandStrength\(\)[\s\S]*?\}\)\(\)|\{[^}]*\});/, block);
if (newSrc === src) { console.error('⚠️ 找不到 buildHandStrength 區塊，未寫入'); process.exit(1); }
fs.writeFileSync(path, newSrc);
console.error('已將 HAND_PCT 靜態表寫入 index.src.html');
console.error('抽樣:', ['AA', 'KK', 'AKs', 'AKo', 'QQ', 'TT', 'AJs', 'KQo', '22', '72o', '32o'].map(c => `${c}=${(pct[c] * 100).toFixed(0)}%`).join('  '));

#!/usr/bin/env node
/**
 * sync-facts.js — 把 data/rent-ranges.json（唯一数据源）同步到所有消费方。
 *
 *   npm run sync:facts          写入
 *   npm run sync:facts:check    只校验不写入（提交前 / CI）
 *
 * 生成 / 重写：
 *   1. js/rent-data.js   浏览器 + Node 双模消费的生成物（已部署，勿手改）
 *   2. 任何带 data-rent 属性的 HTML 元素的文本内容
 *
 * HTML 用法（只加属性，不动原有结构和样式）：
 *   <td class="price" data-rent="irvine:2bd">$3,000 – $3,800/月</td>   整段区间
 *   <td data-rent="pasadena:2bd:min">$2,600</td>                        下限
 *   <td data-rent="pasadena:2bd:mid">$2,950</td>                        中位（自动算）
 *   <td data-rent="pasadena:2bd:max">$3,300</td>                        上限
 *
 * 元素内已有的后缀（例如 "/月"）会被保留。
 *
 * 注意：data/ 不在 Vercel 部署范围内（见 .vercelignore），
 * 所以线上代码一律读生成物 js/rent-data.js，不读 JSON。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'data', 'rent-ranges.json');
const CHECK = process.argv.includes('--check');

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const { cities, typicalSqft, propertyTypeLabels, propertyTypeLabelsZh } = data;

let changed = 0;
const problems = [];
const touched = [];

const money = (n) => '$' + n.toLocaleString('en-US');
const roundTo50 = (n) => Math.round(n / 50) * 50;

/** 取一个 data-rent 值对应的显示文本。 */
function resolve(key, file) {
  const parts = key.split(':');
  const [city, type, bound] = parts;
  if (!cities[city]) { problems.push(`${file}: 数据源里没有城市 "${city}"`); return null; }
  const pair = cities[city][type];
  if (!pair) { problems.push(`${file}: ${city} 没有房型 "${type}"`); return null; }
  if (!bound) return money(pair[0]) + ' – ' + money(pair[1]);
  if (bound === 'min') return money(pair[0]);
  if (bound === 'max') return money(pair[1]);
  if (bound === 'mid') return money(roundTo50((pair[0] + pair[1]) / 2));
  problems.push(`${file}: 未知的 bound "${bound}"（可用 min/mid/max 或省略）`);
  return null;
}

/** 保留文件原有换行风格，避免整文件 diff。 */
function write(rel, next) {
  const abs = path.join(ROOT, rel);
  const exists = fs.existsSync(abs);
  const prev = exists ? fs.readFileSync(abs, 'utf8') : null;
  const eol = prev && prev.includes('\r\n') ? '\r\n' : '\n';
  next = next.replace(/\r?\n/g, eol);
  if (prev === next) return false;
  if (!CHECK) fs.writeFileSync(abs, next);
  changed++;
  touched.push(rel);
  return true;
}

// ── 1. js/rent-data.js ────────────────────────────────────────────────
function buildRentDataJs() {
  const payload = {
    lastUpdated: data.lastUpdated,
    displayLabel: data.displayLabel,
    disclaimer: data.disclaimer,
    typicalSqft,
    propertyTypeLabels,
    propertyTypeLabelsZh,
    cities
  };
  const body =
`/* 生成文件 — 请勿手改。
 * 来源:     data/rent-ranges.json
 * 重新生成: npm run sync:facts
 */
(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = data;
  } else {
    root.RENT_DATA = data;
    root.RENTAL_DATA = data.cities;
    root.TYPICAL_SQFT = data.typicalSqft;
    root.PROPERTY_TYPE_LABELS = data.propertyTypeLabels;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return ${JSON.stringify(payload, null, 2).replace(/\n/g, '\n  ')};
});
`;
  write('js/rent-data.js', body);
}

// ── 2. HTML 里所有 data-rent 元素 ──────────────────────────────────────
function htmlFiles() {
  const out = [];
  const walk = (dir, prefix) => {
    for (const f of fs.readdirSync(dir)) {
      const abs = path.join(dir, f);
      if (fs.statSync(abs).isDirectory()) {
        if (['node_modules', '.git', '.claude', 'data', 'scripts', 'docs', 'images', 'css'].includes(f)) continue;
        walk(abs, prefix + f + '/');
      } else if (f.endsWith('.html')) {
        out.push(prefix + f);
      }
    }
  };
  walk(ROOT, '');
  return out;
}

function syncHtml() {
  let cells = 0;
  for (const rel of htmlFiles()) {
    const s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    if (!s.includes('data-rent=')) continue;
    const next = s.replace(
      /(<(\w+)\b[^>]*\bdata-rent="([a-z0-9:-]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
      (m, open, tag, key, inner, close) => {
        const value = resolve(key, rel);
        if (value === null) return m;
        cells++;
        // 只替换金额本身，保留前缀（"💰 "、"2BD 参考: "）和后缀（"/月"、"起"）
        const MONEY = /\$[\d,]+(?:\s*(?:–|—|-|~|to)\s*\$[\d,]+)?/;
        const body = MONEY.test(inner) ? inner.replace(MONEY, value) : value;
        return open + body + close;
      }
    );
    write(rel, next);
  }
  return cells;
}

// ── 3. llms-full.txt 的 "Typical 2-bedroom rent reference" 行 ──────────
// 城市由上方最近的 /cities/<key>.html 链接决定。
function syncLlmsFull() {
  const rel = 'llms-full.txt';
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return 0;
  const eol = fs.readFileSync(abs, 'utf8').includes('\r\n') ? '\r\n' : '\n';
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  let current = null;
  let n = 0;
  const out = lines.map((line) => {
    const link = line.match(/https:\/\/rentalinca\.com\/cities\/([a-z-]+)\.html/);
    if (link) current = link[1];
    if (!/Typical 2-bedroom rent reference:/.test(line)) return line;
    if (!current || !cities[current]) {
      problems.push(`${rel}: 无法确定城市或数据源缺少 "${current}"`);
      return line;
    }
    const p = cities[current]['2bd'];
    n++;
    return line.replace(/\$[\d,]+\s*[-–—]\s*\$[\d,]+/, `${money(p[0])}-${money(p[1])}`);
  });
  write(rel, out.join(eol));
  return n;
}

// ── run ───────────────────────────────────────────────────────────────
buildRentDataJs();
const cells = syncHtml() + syncLlmsFull();

if (CHECK) {
  if (changed || problems.length) {
    console.error('sync-facts --check 未通过：');
    problems.forEach((p) => console.error('  - ' + p));
    touched.forEach((f) => console.error(`  - ${f} 与数据源不同步`));
    console.error('  修复: npm run sync:facts');
    process.exit(1);
  }
  console.log(`sync-facts --check 通过（${cells} 个 data-rent 位点与 data/rent-ranges.json 一致）`);
} else {
  problems.forEach((p) => console.warn('  ! ' + p));
  console.log(`sync-facts 完成：${cells} 个 data-rent 位点，更新 ${changed} 个文件（lastUpdated=${data.lastUpdated}）`);
  if (problems.length) process.exitCode = 1;
}

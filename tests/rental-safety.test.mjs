import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const files = ['index.html', 'landlords.html', 'tenants.html', 'irvine-renting-pitfalls.html'];
const page = Object.fromEntries(files.map(f => [f, read(f)]));
const schemas = s => [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const nodes = s => schemas(s).flatMap(o => o['@graph'] || [o]);
test('modified pages keep unique IDs, valid JSON-LD and canonical URLs', () => {
  for (const f of files) {
    schemas(page[f]);
    const ids = [...page[f].matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size, f);
    assert.equal((page[f].match(/rel="canonical"/g) || []).length, 1, f);
  }
});
test('homepage screening answer matches retained FAQ schema', () => {
  const q = nodes(page['index.html']).find(o => o['@type'] === 'FAQPage').mainEntity.find(o => o.name === '作为第一次房东，如何筛选可靠的租客？');
  assert.ok(page['index.html'].includes('<p itemprop="text">' + q.acceptedAnswer.text + '</p>'));
  assert.match(q.acceptedAnswer.text, /租客自己承担的租金/);
  assert.match(q.acceptedAnswer.text, /合理提交时间/);
  assert.doesNotMatch(page['index.html'], /AB 1482）对筛选标准/);
});
test('landlord bilingual content retains tenant share, alternatives and hypothetical limits', () => {
  const s=page['landlords.html'];
  for(const term of ['id="screening-faq"','自付800美元','2,400美元','不是加州统一法定倍数','instead of credit history','reasonable time','并在收到后合理考虑']) assert.ok(s.includes(term), term);
  assert.equal(3200 - 2400, 800); assert.equal(800 * 3, 2400);
});
test('rent/fee corrections preserve applicability and remove unsupported claims', () => {
  const s=page['irvine-renting-pitfalls.html'];
  for(const term of ['id="rent-increase-rules"','id="rental-fees-check"','任何连续 12 个月','不是所有 LLC','书面豁免通知','不预设统一保费','支票支付租金或押金']) assert.ok(s.includes(term), term);
  assert.doesNotMatch(s,/2025 年 7 月 1 日生效.*所有强制费用|年费通常 \$100/);
});
test('tenant verification is visible content before service section and preserves privacy', () => {
  const s=page['tenants.html'];
  assert.ok(s.indexOf('id="tenant-document-warning"') < s.indexOf('class="tenant-checklist"'));
  assert.ok(s.indexOf('id="rental-verification"') > s.indexOf('id="printTenantChecklist"'));
  assert.ok(s.indexOf('id="rental-verification"') < s.indexOf('找房真正难的地方'));
  for(const term of ['1 搜索完整地址','2 查身份','3 看房后','4 阅读文件','5 付款前','6 保存核验','不能保证房源或交易安全','追回不能保证','不主张','只是咨询找房']) assert.ok(s.includes(term), term);
  assert.doesNotMatch(s,/<input[^>]+type=["']file["']/i);
  assert.match(s, /<form id="tenantAssistant"/);
  assert.match(s, /contact\.html\?source=tenant-assistant/);
});
test('service titles and descriptions remain synchronized with existing WebPage schema', () => {
  for(const f of ['landlords.html','tenants.html']){
    const s=page[f], schema=nodes(s).find(n=>n['@type']==='WebPage');
    const title=s.match(/<title>([^<]*)<\/title>/)[1];
    const desc=s.match(/<meta name="description" content="([^"]*)"/)[1];
    assert.equal(schema.name,title); assert.equal(schema.description,desc);
    for(const p of ['og:title','twitter:title']) assert.ok(s.includes('content="'+title+'"'));
    assert.ok(s.includes('content="'+desc+'"'));
  }
});
test('print rules preserve warning, title, verification steps and FAQ answers', () => {
  const s=read('css/rental-safety.css');
  assert.match(s,/@media print/);
  assert.match(s,/\.tenant-materials-section > \.container > div:first-child \{ display: block !important/);
  assert.match(s,/\.rental-safety-note, \.rental-verification-section \{ display: block !important/);
  assert.match(s,/\.faq-a \{ display: block !important/);
});
test('accordion announces state and supports repeated native button activation', () => {
  const classList=()=>{const set=new Set();return {contains:x=>set.has(x),toggle:(x,on)=>on?set.add(x):set.delete(x)};};
  const buttons=Array.from({length:3},()=>({classList:classList(),attrs:{},nextElementSibling:{id:'',classList:classList()},setAttribute(k,v){this.attrs[k]=v;},querySelector(){return {setAttribute(){}};},addEventListener(_,fn){this.click=fn;}}));
  const document={querySelectorAll:()=>buttons,getElementById:id=>buttons.find(b=>b.nextElementSibling.id===id)};
  const source=read('js/main.js');
  const fn=source.slice(source.indexOf('function initFAQ()'),source.indexOf('// 注意'));
  vm.runInNewContext(fn+'\ninitFAQ();',{document});
  for(const b of buttons){assert.equal(b.attrs['aria-expanded'],'false');assert.ok(b.attrs['aria-controls']);assert.equal(b.type,'button');}
  buttons[0].click(); assert.equal(buttons[0].attrs['aria-expanded'],'true');
  buttons[1].click(); assert.equal(buttons[0].attrs['aria-expanded'],'false');assert.equal(buttons[1].attrs['aria-expanded'],'true');
  buttons[1].click();assert.equal(buttons[1].attrs['aria-expanded'],'false');
});

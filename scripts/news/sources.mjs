export const sources = [
  { id: 'scag', name: 'SCAG · 南加州政府协会', url: 'https://www.scag.ca.gov/news', region: '南加州', category: '南加市场', path: '/news/' },
  { id: 'fhfa', name: 'FHFA · 联邦住房金融局', url: 'https://www.fhfa.gov/reports/house-price-index', region: '全美', category: '全美住房', path: '/reports/house-price-index/' },
  { id: 'lahd', name: 'LAHD · 洛杉矶市住房部门', url: 'https://housing.lacity.gov/feed', region: '洛杉矶市', category: '租赁与政策', path: '/', automatic: false, reason: 'Named news crawler received HTTP 403 on 2026-09-06; manual source links only, no bypass.' }
];
export function plain(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const c = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n); return c > 0 && c <= 0x10ffff ? String.fromCodePoint(c) : ''; })
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n]))
    .replace(/\s+/g, ' ').trim();
}
export function canonical(raw, source) {
  const u = new URL(raw, source.url), base = new URL(source.url);
  if (u.protocol !== 'https:' || u.hostname !== base.hostname || u.username || u.password || u.port || !u.pathname.startsWith(source.path)) throw Error('Unapproved source URL');
  u.hash = ''; u.search = ''; return u.href.replace(/\/$/, '');
}
export function parse(source, html) {
  let rows;
  if (source.id === 'scag') {
    rows = html.split(/<div class="views-row">/).slice(1).filter(block => /<h2[^>]*class="title"[^>]*>\s*<a[^>]*href="\/news\//.test(block)).map(block => {
      const a = block.match(/<h2[^>]*class="title"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      return a && { url:a[1], originalTitle:plain(a[2]), published:block.match(/datetime="(\d{4}-\d{2}-\d{2})T/)?.[1], dateBasis:'官网发布日期' };
    });
  } else if (source.id === 'fhfa') {
    rows = [...html.matchAll(/<tr class="report-table-row">([\s\S]*?)<\/tr>/g)].map(([, block]) => {
      const a = block.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const d = block.match(/<td[^>]*field-release-date[^>]*>([\s\S]*?)<\/td>/);
      const t = Date.parse(plain(d?.[1]));
      return a && {url:a[1], originalTitle:plain(a[2]), published:Number.isFinite(t) ? new Date(t).toISOString().slice(0,10) : null, dateBasis:'官网发布日期'};
    });
  } else {
    rows = [...html.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([,block]) => {
      const get = tag => plain(block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]);
      const t = Date.parse(get('pubDate'));
      return { url:get('link'), originalTitle:get('title'), published:Number.isFinite(t) ? new Date(t).toISOString().slice(0,10) : null, dateBasis:'官方 RSS 发布日期（UTC）' };
    });
  }
  if (!rows.length || rows.some(r => !r || !r.published || !r.originalTitle || !r.url)) throw Error(`${source.id}: source layout/date changed; feed retained`);
  return rows.map(row => ({...row, url:canonical(row.url, source), source:source.id, region:source.region, category:source.category}));
}
export function relevant(item) {
  if (/request for proposals|\bRFP\b|staff training|job opening/i.test(item.originalTitle)) return false;
  return /hous(?:e|ing)|rent|tenant|landlord|\bRHNA\b|quarterly economic report/i.test(item.originalTitle);
}
export function validDate(day, now = new Date()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day || '') && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0,10) === day && day <= now.toISOString().slice(0,10);
}
export function readyForReaders(item) {
  return typeof item.title === 'string' && /[\u3400-\u9fff]/.test(item.title)
    && typeof item.summary === 'string' && item.summary.trim().length >= 50
    && /[\u3400-\u9fff]/.test(item.summary) && validDate(item.reviewedAt);
}
export function merge(old, incoming, now = new Date()) {
  const map = new Map(old.map(i => [i.url, i]));
  for (const item of incoming) {
    if (!validDate(item.published, now)) throw Error('Invalid or future source date');
    if (!relevant(item)) continue;
    const previous = map.get(item.url);
    // A title/date change invalidates the old editorial summary; never silently carry it forward.
    map.set(item.url, previous && previous.originalTitle === item.originalTitle && previous.published === item.published ? {...previous,...item} : item);
  }
  return [...map.values()].filter(i => validDate(i.published, now) && (now - new Date(i.published)) / 86400000 <= 120)
    .sort((a,b) => b.published.localeCompare(a.published) || a.url.localeCompare(b.url)).slice(0,40);
}
// Respect the most specific applicable robots group and longest matching rule.
export function robotsAllowed(text, target) {
  const groups = []; let group = null, ruled = false;
  for (const line of text.split(/\r?\n/)) {
    const m = line.split('#')[0].trim().match(/^([\w-]+)\s*:\s*(.*)$/); if (!m) continue;
    const key=m[1].toLowerCase(), value=m[2].trim();
    if (key === 'user-agent') { if (!group || ruled) { group={agents:[],rules:[]}; groups.push(group); ruled=false; } group.agents.push(value.toLowerCase()); }
    else if (group && ['allow','disallow'].includes(key)) { ruled=true; if(value) group.rules.push({allow:key==='allow',path:value}); }
  }
  const own=groups.filter(g => g.agents.some(a => a !== '*' && 'rentalincanews'.includes(a)));
  const selected=own.length ? own : groups.filter(g => g.agents.includes('*'));
  const path=new URL(target).pathname + new URL(target).search;
  const matches=selected.flatMap(g=>g.rules).filter(r=>new RegExp('^'+r.path.split('*').map(p=>p.replace(/[.+?^${}()|[\]\\]/g,'\\$&')).join('.*').replace(/\\\$$/,'$')).test(path));
  matches.sort((a,b)=>b.path.length-a.path.length || Number(b.allow)-Number(a.allow));
  return !matches.length || matches[0].allow;
}
export async function safeFetch(url, source, fetcher=fetch) {
  const host=new URL(source.url).hostname;
  const signal=AbortSignal.timeout(25000);
  for(let redirects=0; redirects<=3; redirects++) {
    const u=new URL(url);
    if(u.protocol!=='https:' || u.hostname!==host || u.username || u.password || u.port || u.search) throw Error('Unsafe fetch URL');
    const r=await fetcher(u.href,{redirect:'manual',signal,headers:{'User-Agent':'RentalInCANews/1.0 (+https://rentalinca.com/news.html)'}});
    if([301,302,303,307,308].includes(r.status)) {url=new URL(r.headers.get('location'),u).href;continue;}
    if(!r.ok) throw Error(`HTTP ${r.status}`);
    const reader=r.body.getReader(); let size=0; const chunks=[];
    while(true) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000){await reader.cancel();throw Error('Source exceeds 2 MB');}chunks.push(value);}
    return Buffer.concat(chunks).toString('utf8');
  }
  throw Error('Too many redirects');
}

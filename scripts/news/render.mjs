import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sources,canonical,validDate} from './sources.mjs';
export const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validate(feed) {
  if(feed.version!==1 || !Number.isFinite(Date.parse(feed.contentUpdatedAt)) || !feed.items.length || feed.items.length>40) throw Error('Invalid news feed');
  const seen=new Set();
  for(const item of feed.items) {
    const source=sources.find(s=>s.id===item.source);
    if(!source || canonical(item.url,source)!==item.url || seen.has(item.url) || !validDate(item.published)) throw Error('Invalid news identity/date');
    for(const field of ['originalTitle','dateBasis','region','category']) if(typeof item[field]!=='string' || !item[field] || item[field].length>500) throw Error(`Invalid ${field}`);
    if(!['南加市场','全美住房','租赁与政策'].includes(item.category)) throw Error('Unknown category');
    if(item.summary && (!item.title || !validDate(item.reviewedAt) || item.summary.length>1000)) throw Error('Unreviewed summary');
    seen.add(item.url);
  }
}
const root=new URL('../../',import.meta.url);
const get=path=>readFile(new URL(path,root),'utf8');
export const id=item=>'news-'+createHash('sha256').update(item.url).digest('hex').slice(0,12);
function replaceBlock(text,name,body) {
  const start=`<!-- ${name}_START -->`, end=`<!-- ${name}_END -->`;
  if(!text.includes(start)||!text.includes(end)) throw Error(`Missing ${name} render marker`);
  return text.replace(new RegExp(`${start}[\\s\\S]*?${end}`),()=>`${start}\n${body}\n${end}`);
}
export async function render(check=false) {
  const feed=JSON.parse(await get('data/housing-news.json')); validate(feed);
  const reference=new Date(feed.contentUpdatedAt);
  const old=i=>(reference-new Date(i.published))/86400000>30;
  const meta=i=>`<div class="news-meta"><span class="news-region">${esc(i.region)} · ${esc(i.category)}</span><span>${esc(i.dateBasis)} <time datetime="${i.published}">${i.published}</time></span></div>`;
  const rows=feed.items.map(i=>`<article class="news-row" id="${id(i)}" data-news-item data-category="${esc(i.category)}" data-published="${i.published}">
${meta(i)}<h2${i.title?'':' lang="en"'}>${esc(i.title||i.originalTitle)}</h2>
${i.summary?`<p>${esc(i.summary)}</p><p class="news-original" lang="en">原文标题：${esc(i.originalTitle)}</p><p class="news-date-note">摘要核对：${i.reviewedAt}${i.dataPeriod?` · 数据期：${esc(i.dataPeriod)}`:''}</p>`:'<p class="news-date-note">官方原文更新 · 英文标题，尚无中文摘要。</p>'}
${i.dateNote?`<p class="news-date-note">${esc(i.dateNote)}</p>`:''}
<p class="news-date-note" data-age>${old(i)?'较早发布 · 阅读前请核对后续变化':'来源日期见上方'}</p>
<a class="news-source-link" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">阅读 ${esc(sources.find(s=>s.id===i.source).name)} 原文 ↗</a></article>`).join('\n');
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:'南加州房产动态',url:'https://rentalinca.com/news.html',inLanguage:'zh-CN',dateModified:feed.contentUpdatedAt,mainEntity:{'@type':'ItemList',itemListElement:feed.items.map((i,n)=>({'@type':'ListItem',position:n+1,url:i.url,name:i.title||i.originalTitle}))}};
  const news=replaceBlock(replaceBlock(await get('news.html'),'HOUSING_NEWS',`<p id="news-count" class="news-count" role="status" aria-live="polite">${feed.items.length} 条来源更新 · 按原文日期排序</p>\n${rows}\n<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`),'NEWS_SYNC',`<p>本站内容同步时间<time datetime="${feed.contentUpdatedAt}">${feed.contentUpdatedAt.slice(0,10)}（UTC）</time></p>`);
  const preview=`<section class="news-preview" aria-labelledby="news-preview-title"><div class="container"><div class="news-preview-head"><div><h2 id="news-preview-title">南加州房产动态</h2><p>住房市场与租赁政策，找到出处再作判断。</p></div><a class="btn btn-primary" href="news.html">查看全部新闻 →</a></div><div class="news-preview-list">${feed.items.slice(0,3).map(i=>`<article class="news-preview-item">${meta(i)}<h3><a href="news.html#${id(i)}"${i.title?'':' lang="en"'}>${esc(i.title||i.originalTitle)}</a></h3><p>${esc(i.summary||'官方原文更新，点击查看来源与发布日期。')}</p>${old(i)?'<p>较早发布 · 请核对后续变化</p>':''}</article>`).join('')}</div></div></section>`;
  const home=replaceBlock(await get('index.html'),'HOUSING_PREVIEW',preview);
  let sitemap=await get('sitemap.xml');
  const entry=`  <url>\n    <loc>https://rentalinca.com/news.html</loc>\n    <lastmod>${feed.contentUpdatedAt.slice(0,10)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  const re=/\s*<url>\s*<loc>https:\/\/rentalinca\.com\/news\.html<\/loc>[\s\S]*?<\/url>/;
  sitemap=re.test(sitemap)?sitemap.replace(re,'\n'+entry):sitemap.replace('</urlset>',entry+'\n</urlset>');
  for(const [path,raw] of [['news.html',news],['index.html',home],['sitemap.xml',sitemap]]) {
    const existing=await get(path);
    const content=raw.replace(/\r?\n/g,existing.includes('\r\n')?'\r\n':'\n');
    if(existing===content)continue;
    if(check)throw Error(`${path} needs npm run news:render`);
    await writeFile(new URL(path,root),content);
  }
  console.log(`News render ${check?'check':'complete'}: ${feed.items.length} entries`);
}
if(process.argv[1] && new URL('file:///'+process.argv[1].replaceAll('\\','/')).pathname.endsWith('/scripts/news/render.mjs')) await render(process.argv.includes('--check'));

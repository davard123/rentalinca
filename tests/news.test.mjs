import test from 'node:test';
import assert from 'node:assert/strict';
import {sources,parse,plain,canonical,relevant,validDate,merge,robotsAllowed,safeFetch} from '../scripts/news/sources.mjs';
import {validate,esc} from '../scripts/news/render.mjs';
const now=new Date('2026-09-06T20:00:00Z');
const item={source:'fhfa',url:'https://www.fhfa.gov/reports/house-price-index/2026/Q2',originalTitle:'U.S. House Price Index Report - 2026 Q2',published:'2026-08-25',category:'全美住房',region:'全美',dateBasis:'官网发布日期'};
test('FHFA release date comes from release-date cell, not report period',()=>{
  const html='<tr class="report-table-row"><td class="views-field-field-release-date">August 25, 2026</td><td><a href="/reports/house-price-index/2026/Q2">U.S. House Price Index Report - 2026 Q2</a></td></tr>';
  assert.equal(parse(sources[1],html)[0].published,'2026-08-25');
});
test('SCAG dated news only; monthly navigation without dates is not a release',()=>{
  const html='<div class="views-row"><h2 class="title"><a href="/executive-report">Monthly report</a></h2><div class="views-row"><time datetime="2026-09-02T10:30:00-07:00"></time><h2 class="title"><a href="/news/housing">Housing report</a></h2>';
  assert.equal(parse(sources[0],html).length,1);
  assert.throws(()=>parse(sources[0],html.replace('datetime="2026-09-02T10:30:00-07:00"','')));
});
test('RSS date uses pubDate; lastBuildDate never manufactures a new release',()=>{
  const html='<rss><lastBuildDate>Sun, 06 Sep 2026 00:00:00 GMT</lastBuildDate><item><title>Tenant &amp; Landlord</title><link>https://housing.lacity.gov/rental-policy</link><pubDate>Thu, 20 Aug 2026 12:00:00 +0000</pubDate></item></rss>';
  assert.equal(parse(sources[2],html)[0].published,'2026-08-20');
  assert.throws(()=>parse(sources[2],html.replace(/<pubDate>.*?<\/pubDate>/,'')));
});
test('layout changes and empty source fail closed',()=>{for(const source of sources)assert.throws(()=>parse(source,'<html>Service unavailable</html>'));});
test('same-host HTTPS allowlist rejects unsafe and misleading URLs',()=>{
  for(const u of ['http://www.fhfa.gov/reports/house-price-index/2026/Q2','https://www.fhfa.gov.evil.test/reports/house-price-index/x','https://u:p@www.fhfa.gov/reports/house-price-index/x','javascript:alert(1)','https://www.fhfa.gov/admin']) assert.throws(()=>canonical(u,sources[1]));
  assert.equal(canonical(item.url+'?utm_source=test#x',sources[1]),item.url);
});
test('future, impossible and absent dates rejected',()=>{
  for(const day of ['2026-09-07','2026-02-30','',null])assert.equal(validDate(day,now),false);
  assert.throws(()=>merge([], [{...item,published:'2026-09-07'}],now));
});
test('deduplicate and retain reviewed summary only while title/date agree',()=>{
  const reviewed={...item,title:'中文标题',summary:'核实摘要',reviewedAt:'2026-09-06'};
  const result=merge([reviewed],[item,item],now);assert.equal(result.length,1);assert.equal(result[0].summary,'核实摘要');
  assert.deepEqual(merge(result,[item],now),result);
  assert.equal(merge([reviewed],[{...item,originalTitle:'New housing report'}],now)[0].summary,undefined);
});
test('stale reports are not relabelled as current; only 120-day window retained',()=>{
  assert.equal(merge([],[{...item,published:'2025-01-01'}],now).length,0);
  assert.equal(merge([],[{...item,published:'2026-07-01'}],now)[0].published,'2026-07-01');
});
test('exclude procurement and off-topic posts',()=>{
  assert.equal(relevant({...item,originalTitle:'Housing Staff Training Request for Proposals (RFP)'}),false);
  assert.equal(relevant({...item,originalTitle:'Regional sports event'}),false);
});
test('text and structured data escape, no source HTML rendered',()=>{
  assert.equal(plain('<b>Title</b> &amp; notice'),'Title & notice');
  assert.equal(esc('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('robots specific user agents, wildcards, allow priority and duplicate star groups',()=>{
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /private\nAllow: /private/public','https://example.com/private/public'),true);
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /*?','https://example.com/news?page=1'),false);
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /one\nUser-agent: *\nDisallow: /two','https://example.com/two'),false);
  assert.equal(robotsAllowed('User-agent: *\nAllow: /\nUser-agent: RentalInCANews\nDisallow: /','https://example.com/news'),false);
});
test('403 stops; redirects never leave approved host',async()=>{
  await assert.rejects(()=>safeFetch(sources[1].url,sources[1],async()=>new Response('',{status:403})),/403/);
  let calls=0;
  await assert.rejects(()=>safeFetch(sources[1].url,sources[1],async()=>{calls++;return new Response('',{status:302,headers:{location:'https://evil.test/'}});}),/Unsafe/);
  assert.equal(calls,1);
});
test('response size bounded',async()=>{await assert.rejects(()=>safeFetch(sources[1].url,sources[1],async()=>new Response('x'.repeat(2000001))),/2 MB/);});
test('public feed rejects unreviewed summaries and duplicates',()=>{
  const published={...item,title:'美国第二季度房价变化',summary:'FHFA 发布的季度房价指数显示，美国第二季度房价较去年同期上涨，报告同时提供州和都会区的详细数据。',reviewedAt:'2026-09-06'};
  const feed={version:1,contentUpdatedAt:now.toISOString(),items:[published]}; validate(feed);
  assert.throws(()=>validate({...feed,items:[published,published]}));
  assert.throws(()=>validate({...feed,items:[{...published,summary:'not reviewed'}]}));
});

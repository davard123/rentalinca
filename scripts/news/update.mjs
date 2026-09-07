import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { sources, parse, merge, robotsAllowed, safeFetch, readyForReaders } from './sources.mjs';
const file=new URL('../../data/housing-news.json',import.meta.url);
const feed=JSON.parse(await readFile(file,'utf8'));
const incoming=[]; const report=[];
// Fail closed as a batch: one failed source never deletes the last good public feed.
for(const source of sources) {
  if(source.automatic === false) {report.push(`${source.id}: MANUAL ONLY — ${source.reason}`);continue;}
  try {
    const robots=await safeFetch(new URL('/robots.txt',source.url).href,source);
    if(!robotsAllowed(robots,source.url)) throw Error('robots.txt disallows this source');
    const items=parse(source,await safeFetch(source.url,source)); incoming.push(...items);
    report.push(`${source.id}: OK, ${items.length} dated source entries parsed`);
  } catch(error) {report.push(`${source.id}: FAILED — ${error.message}`);}
}
console.log(report.join('\n'));
if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,`## Housing news source check\n${new Date().toISOString()}\n\n${report.join('\n\n')}\n`);
if(report.some(line=>line.includes('FAILED'))) process.exitCode=1;
else {
  const merged=merge(feed.items,incoming);
  const pending=merged.filter(item=>!readyForReaders(item));
  const items=merged.filter(readyForReaders);
  if(!items.length) throw Error('No complete Chinese articles; retain last published feed');
  const pendingFile=new URL('../../data/housing-news-pending.json',import.meta.url);
  const pendingOutput=JSON.stringify(pending,null,2)+'\n';
  if(!process.argv.includes('--dry-run') && await readFile(pendingFile,'utf8').catch(()=> '') !== pendingOutput) await writeFile(pendingFile,pendingOutput);
  console.log(`${pending.length} source entries awaiting Chinese editorial content; not published`);
  if(JSON.stringify(items)!==JSON.stringify(feed.items)) {
    if(process.argv.includes('--dry-run')) console.log(`Dry run: ${items.length} eligible items; no writes`);
    else { await writeFile(file,JSON.stringify({...feed,contentUpdatedAt:new Date().toISOString(),items},null,2)+'\n');console.log(`Updated ${items.length} items`); }
  } else console.log('No content change; publication timestamp unchanged');
}

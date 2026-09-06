(() => {
  const rows=[...document.querySelectorAll('[data-news-item]')];
  const buttons=[...document.querySelectorAll('[data-news-filter]')];
  const count=document.getElementById('news-count');
  const empty=document.getElementById('news-empty');
  const now=Date.now();
  rows.forEach(row=>{const label=row.querySelector('[data-age]');const age=(now-Date.parse(row.dataset.published))/86400000;if(label)label.textContent=age>30?'较早发布 · 阅读前请核对后续变化':age>14?'近期发布':'近两周发布';});
  buttons.forEach(button=>button.addEventListener('click',()=>{
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    rows.forEach(row=>row.hidden=button.dataset.newsFilter!=='全部' && row.dataset.category!==button.dataset.newsFilter);
    const visible=rows.filter(row=>!row.hidden).length;
    count.textContent=`${visible} 条来源更新`; empty.hidden=visible!==0;
  }));
  const filters=document.getElementById('news-filters');if(filters)filters.hidden=false;
})();

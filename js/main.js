/* rentalinca.com — Main JavaScript  */
//
// 租金数据不在这个文件里。唯一数据源是 data/rent-ranges.json，
// 由 npm run sync:facts 生成 js/rent-data.js，页面上通过 window.RENTAL_DATA 读取。
//
// 联系表单也不在这个文件里 —— contact.html 由 js/contact-submit.js 负责提交。

// ── Mobile Nav ───────────────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target))
      mobileNav.classList.remove('open');
  });
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// ── FAQ Accordion ─────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
      if (!isOpen) { btn.classList.add('open'); btn.nextElementSibling.classList.add('open'); }
    });
  });
}

// 注意：这里曾有一个 initContactForm()，它不提交任何东西，只是等 1200ms 然后
// 显示「已发送」。contact.html 靠 contact-submit.js 把表单 clone 掉才把它甩开。
// 一旦有别的页面加上 #contactForm，那个页面的 lead 就会被静默丢弃 —— 已删除。
// 表单提交统一由 js/contact-submit.js 负责。

// ── Case Filter ───────────────────────────────────────────────────────
function initCaseFilter() {
  const pills = document.querySelectorAll('.filter .pill');
  const cards = document.querySelectorAll('.case-grid .big-case');
  if (!pills.length || !cards.length) return;
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      const filter = pill.dataset.filter;
      cards.forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
}

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav(); initFAQ(); initCaseFilter();
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
    });
  });
});

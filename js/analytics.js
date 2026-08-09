/* rentalinca.com — Vercel Web Analytics 事件埋点
 *
 * 页面浏览由 /_vercel/insights/script.js 自动上报，这个文件只管自定义事件。
 *
 * ⚠️ 注意：Vercel Web Analytics 的 **自定义事件需要 Pro 方案**。
 *    Hobby 方案只会记录 page views，下面这些 track() 调用会安静地不生效
 *    （不会报错、不会影响页面）。升级到 Pro 之后无需改代码，事件会自动开始出现。
 *
 * 埋点清单（对应「哪个页面/工具真正带来咨询」这个问题）：
 *   rent_estimate_completed  首页估租器出结果       {city, type}
 *   vacancy_calc_used        空置成本计算器算出结果  {verdict}
 *   rent_vs_sell_used        出租还是卖掉算出结果    {verdict}
 *   calculator_cta_click     从工具点去联系页        {tool}
 *   phone_clicked            点了电话号码           {page}
 *   wechat_clicked           点了微信二维码/入口     {page}
 *   lead_submitted           表单提交成功           {source, page}
 *   lead_failed              表单提交失败           {source}
 */
(function () {
  'use strict';

  // Vercel 的事件队列 stub —— script.js 加载前的调用会被缓存，加载后补发
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

  /** 上报一个自定义事件。data 的值只能是 string / number / boolean / null。 */
  function track(name, data) {
    try {
      var clean = {};
      if (data) {
        Object.keys(data).forEach(function (k) {
          var v = data[k];
          if (v === undefined || v === '') return;
          clean[k] = (typeof v === 'object') ? String(v) : v;
        });
      }
      window.va('event', { name: name, data: clean });
    } catch (e) {
      // 埋点永远不能影响页面功能
    }
  }
  window.ricaTrack = track;

  function pageKey() {
    return window.location.pathname.replace(/^\//, '') || 'index.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = pageKey();

    // ── 电话 / 微信 ──────────────────────────────────────────────
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';

      if (href.indexOf('tel:') === 0) {
        track('phone_clicked', { page: page });
        return;
      }
      // 微信：二维码图片、指向 contact 的扫码按钮、或文案里带「微信」的链接
      if (/wechat|weixin/i.test(href) || /微信|扫码/.test(a.textContent || '')) {
        track('wechat_clicked', { page: page });
      }
    }, true);

    // 页脚/联系页的二维码图片本身
    document.addEventListener('click', function (e) {
      var img = e.target.closest && e.target.closest('img[src*="wechat"]');
      if (img) track('wechat_clicked', { page: page });
    }, true);

    // ── 首页估租器 ──────────────────────────────────────────────
    var estSubmit = document.getElementById('estSubmit');
    if (estSubmit) {
      estSubmit.addEventListener('click', function () {
        var c = document.getElementById('estCity');
        var t = document.getElementById('estType');
        if (!c || !t || !c.value || !t.value) return; // 没填完不算一次完成
        // 结果是同步渲染的，下一帧读取即可
        setTimeout(function () {
          var shown = document.getElementById('estResult');
          if (shown && shown.style.display !== 'none') {
            track('rent_estimate_completed', { city: c.value, type: t.value });
          }
        }, 0);
      });
    }

    // ── 计算器 → 联系 CTA ───────────────────────────────────────
    if (page.indexOf('calculators/') === 0) {
      var tool = page.replace('calculators/', '').replace('.html', '');
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href*="contact"]');
        if (a) track('calculator_cta_click', { tool: tool });
      }, true);
    }
  });
})();

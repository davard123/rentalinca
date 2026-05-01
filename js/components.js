/* Shared header/footer injected into every page */

const BASE_PATH = window.location.pathname.includes('/cities/') ? '../' : '';

const NAV_HTML = `
<nav class="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="${BASE_PATH}index.html" class="nav-logo" style="text-decoration:none">
        <span class="nav-logo-main">rentalinca.com</span>
        <span class="nav-logo-sub">David Dai · DRE# 02202763</span>
      </a>
      <div class="nav-links">
        <a href="${BASE_PATH}index.html">首页</a>
        <a href="${BASE_PATH}landlords.html">房东服务</a>
        <a href="${BASE_PATH}tenants.html">租客找房</a>
        <a href="${BASE_PATH}buy-sell.html">买卖房产</a>
        <a href="${BASE_PATH}property-management.html">物业管理</a>
        <a href="${BASE_PATH}cities.html">城市指南</a>
        <a href="${BASE_PATH}cases.html">成交案例</a>
        <a href="${BASE_PATH}about.html">关于我</a>
      </div>
      <div class="nav-cta">
        <span class="nav-phone"><a href="tel:9496561278">📞 (949) 656-1278</a></span>
        <a href="${BASE_PATH}contact.html" class="btn btn-primary btn-sm">免费咨询</a>
      </div>
      <div class="nav-hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
  <div class="nav-mobile" id="mobileNav">
    <a href="${BASE_PATH}index.html">首页 Home</a>
    <a href="${BASE_PATH}landlords.html">🏠 房东服务 For Landlords</a>
    <a href="${BASE_PATH}tenants.html">🔍 租客找房 Find Rental</a>
    <a href="${BASE_PATH}buy-sell.html">🤝 买卖房产 Buy &amp; Sell</a>
    <a href="${BASE_PATH}property-management.html">🔧 物业管理 Property Mgmt</a>
    <a href="${BASE_PATH}cities.html">📍 城市指南 City Guides</a>
    <a href="${BASE_PATH}cases.html">📋 成交案例 Cases</a>
    <a href="${BASE_PATH}about.html">👤 关于我 About</a>
    <a href="${BASE_PATH}contact.html" style="color:var(--blue);font-weight:700">📋 免费咨询 Contact</a>
    <a href="tel:9496561278" style="color:var(--blue)">📞 (949) 656-1278</a>
  </div>
</nav>`;

const FOOTER_HTML = `
<section class="cta-banner">
  <div class="container">
    <h2>准备好了？今天就开始</h2>
    <p>免费咨询，无压力，中文全程服务 · Free consultation, no obligation, fully in Mandarin</p>
    <div class="cta-banner-btns">
      <a href="${BASE_PATH}contact.html" class="btn btn-white btn-lg">📋 免费咨询 Free Consultation</a>
      <a href="tel:9496561278" class="btn btn-outline btn-lg" style="border-color:#fff;color:#fff"">📞 (949) 656-1278</a>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo">
          <span class="nav-logo-main">rentalinca.com</span>
          <span class="nav-logo-sub">Southern California Rental Specialist</span>
        </div>
        <p>您在南加州的华人出租专家。出租 · 找房 · 买卖 · 物业管理，中文全程服务。</p>
        <p class="dre-info">David Dai · DRE# 02202763<br>Universal Elite Realty 环球地产 · DRE# 02121645<br>Irvine &amp; Los Angeles, California</p>
      </div>
      <div class="footer-col">
        <h4>服务 Services</h4>
        <a href="${BASE_PATH}landlords.html">房东出租</a>
        <a href="${BASE_PATH}tenants.html">租客找房</a>
        <a href="${BASE_PATH}buy-sell.html">买房 / 卖房</a>
        <a href="${BASE_PATH}property-management.html">物业管理</a>
      </div>
      <div class="footer-col">
        <h4>城市 Cities</h4>
        <a href="${BASE_PATH}cities/irvine.html">Irvine 尔湾</a>
        <a href="${BASE_PATH}cities/los-angeles.html">Los Angeles 洛杉矶</a>
        <a href="${BASE_PATH}cities/arcadia.html">Arcadia 阿凯迪亚</a>
        <a href="${BASE_PATH}cities/pasadena.html">Pasadena</a>
        <a href="${BASE_PATH}cities/san-gabriel.html">San Gabriel</a>
        <a href="${BASE_PATH}cities/rowland-heights.html">Rowland Heights</a>
        <a href="${BASE_PATH}cities/diamond-bar.html">Diamond Bar</a>
        <a href="${BASE_PATH}cities/chino-hills.html">Chino Hills</a>
        <a href="${BASE_PATH}cities/riverside.html">Riverside</a>
      </div>
      <div class="footer-col">
        <h4>联系 Contact</h4>
        <a href="tel:9496561278">📞 (949) 656-1278</a>
        <a href="mailto:daviddairealty@gmail.com">✉️ daviddairealty@gmail.com</a>
        <a href="${BASE_PATH}contact.html">📋 免费咨询表单</a>
        <a href="${BASE_PATH}about.html">👤 关于 David Dai</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 rentalinca.com · David Dai · DRE# 02202763 · Universal Elite Realty 环球地产 · DRE# 02121645</p>
      <p>Property Management services provided by Universal Elite Realty (DRE# 02121645)</p>
    </div>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) navPlaceholder.innerHTML = NAV_HTML;
  // Inject footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.innerHTML = FOOTER_HTML;
});

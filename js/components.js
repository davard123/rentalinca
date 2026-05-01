/* Shared header/footer and contact-priority enhancements */

const BASE_PATH = window.location.pathname.includes('/cities/') ? '../' : '';

const ZH = {
  home: '\u9996\u9875',
  landlords: '\u623f\u4e1c\u670d\u52a1',
  tenants: '\u79df\u5ba2\u627e\u623f',
  buySell: '\u4e70\u5356\u623f\u4ea7',
  management: '\u7269\u4e1a\u7ba1\u7406',
  cities: '\u57ce\u5e02\u6307\u5357',
  cases: '\u6210\u4ea4\u6848\u4f8b',
  about: '\u5173\u4e8e\u6211',
  wechatScan: '\u626b\u7801\u52a0\u5fae\u4fe1',
  phoneAssist: '\u7535\u8bdd\u8054\u7cfb',
  wechatFirst: '\u626b\u7801\u8054\u7cfb',
  footerWechatCopy: '\u626b\u7801\u5373\u53ef\u76f4\u63a5\u6dfb\u52a0\u5fae\u4fe1\uff0c\u54a8\u8be2\u51fa\u79df\u3001\u4e70\u5356\u3001\u8d37\u6b3e\u6216\u7269\u4e1a\u7ba1\u7406\u90fd\u66f4\u65b9\u4fbf\u3002',
  footerAssist: '\u5176\u4ed6\u8054\u7cfb\u65b9\u5f0f',
  footerPage: '\u8054\u7cfb\u9875\u9762',
  footerAboutDavid: '\u5173\u4e8e David Dai',
  ctaTitle: '\u626b\u7801\u8054\u7cfb\uff0c\u6c9f\u901a\u66f4\u65b9\u4fbf',
  ctaBody: '\u6b22\u8fce\u76f4\u63a5\u626b\u7801\u6dfb\u52a0\u5fae\u4fe1\uff0c\u53d1\u623f\u6e90\u3001\u9884\u7b97\u3001\u533a\u57df\u548c\u9700\u6c42\u90fd\u66f4\u65b9\u4fbf\u3002\u4e5f\u53ef\u4ee5\u7535\u8bdd\u8054\u7cfb\u3002'
};

function buildNav() {
  return `
<nav class="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="${BASE_PATH}index.html" class="nav-logo" style="text-decoration:none">
        <span class="nav-logo-main">rentalinca.com</span>
        <span class="nav-logo-sub">David Dai · DRE# 02202763</span>
      </a>
      <div class="nav-links">
        <a href="${BASE_PATH}index.html">${ZH.home}</a>
        <a href="${BASE_PATH}landlords.html">${ZH.landlords}</a>
        <a href="${BASE_PATH}tenants.html">${ZH.tenants}</a>
        <a href="${BASE_PATH}buy-sell.html">${ZH.buySell}</a>
        <a href="${BASE_PATH}property-management.html">${ZH.management}</a>
        <a href="${BASE_PATH}cities.html">${ZH.cities}</a>
        <a href="${BASE_PATH}cases.html">${ZH.cases}</a>
        <a href="${BASE_PATH}about.html">${ZH.about}</a>
      </div>
      <div class="nav-cta">
        <span class="nav-phone nav-phone-secondary"><a href="tel:9496561278">(949) 656-1278</a></span>
        <a href="${BASE_PATH}contact.html" class="btn btn-primary btn-sm">${ZH.wechatScan}</a>
      </div>
      <div class="nav-hamburger" id="hamburger" aria-label="Open menu" role="button" tabindex="0">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
  <div class="nav-mobile" id="mobileNav">
    <a href="${BASE_PATH}index.html">${ZH.home} Home</a>
    <a href="${BASE_PATH}landlords.html">${ZH.landlords} For Landlords</a>
    <a href="${BASE_PATH}tenants.html">${ZH.tenants} Find Rental</a>
    <a href="${BASE_PATH}buy-sell.html">${ZH.buySell} Buy &amp; Sell</a>
    <a href="${BASE_PATH}property-management.html">${ZH.management} Property Mgmt</a>
    <a href="${BASE_PATH}cities.html">${ZH.cities} City Guides</a>
    <a href="${BASE_PATH}cases.html">${ZH.cases} Cases</a>
    <a href="${BASE_PATH}about.html">${ZH.about} About</a>
    <a href="${BASE_PATH}contact.html" style="color:var(--green);font-weight:800">${ZH.wechatScan}</a>
    <a href="tel:9496561278" style="color:var(--text-mid)">\u7535\u8bdd: (949) 656-1278</a>
  </div>
</nav>`;
}

function buildFooter() {
  return `
<section class="cta-banner">
  <div class="container">
    <h2>${ZH.ctaTitle}</h2>
    <p>${ZH.ctaBody}</p>
    <div class="cta-banner-btns">
      <a href="${BASE_PATH}contact.html" class="btn btn-white btn-lg">${ZH.wechatScan}</a>
      <a href="tel:9496561278" class="btn btn-outline btn-lg">${ZH.phoneAssist}</a>
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
        <p>\u60a8\u5728\u5357\u52a0\u5dde\u7684\u534e\u4eba\u51fa\u79df\u4e13\u5bb6\u3002\u51fa\u79df\u3001\u627e\u623f\u3001\u4e70\u5356\u3001\u7269\u4e1a\u7ba1\u7406\uff0c\u4e2d\u6587\u5168\u7a0b\u670d\u52a1\u3002</p>
        <p class="dre-info">David Dai · DRE# 02202763<br>Universal Elite Realty \u73af\u7403\u5730\u4ea7 · DRE# 02121645<br>Irvine &amp; Los Angeles, California</p>
      </div>
      <div class="footer-col footer-col-wechat">
        <h4>${ZH.wechatFirst} WeChat</h4>
        <p class="footer-wechat-copy">${ZH.footerWechatCopy}</p>
        <a href="${BASE_PATH}contact.html" class="footer-wechat-card">
          <img src="${BASE_PATH}images/wechat-qr.jpg" alt="David Dai WeChat QR code">
          <span>${ZH.wechatScan}</span>
        </a>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="${BASE_PATH}landlords.html">\u623f\u4e1c\u51fa\u79df</a>
        <a href="${BASE_PATH}tenants.html">\u79df\u5ba2\u627e\u623f</a>
        <a href="${BASE_PATH}buy-sell.html">\u4e70\u623f / \u5356\u623f</a>
        <a href="${BASE_PATH}property-management.html">\u7269\u4e1a\u7ba1\u7406</a>
      </div>
      <div class="footer-col">
        <h4>${ZH.footerAssist} Contact</h4>
        <a href="tel:9496561278">\u7535\u8bdd: (949) 656-1278</a>
        <a href="mailto:daviddairealty@gmail.com">\u90ae\u7bb1: daviddairealty@gmail.com</a>
        <a href="${BASE_PATH}contact.html">${ZH.footerPage}</a>
        <a href="${BASE_PATH}about.html">${ZH.footerAboutDavid}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 rentalinca.com · David Dai · DRE# 02202763 · Universal Elite Realty \u73af\u7403\u5730\u4ea7 · DRE# 02121645</p>
      <p>Property Management services provided by Universal Elite Realty (DRE# 02121645)</p>
    </div>
  </div>
</footer>`;
}

function prioritizeHomeContact() {
  if (!/index\.html$|\/$/.test(window.location.pathname)) return;
  const contactGrid = document.querySelector('.contact-grid');
  if (!contactGrid) return;
  const leftCol = contactGrid.firstElementChild;
  const infoCard = leftCol?.querySelector('.contact-info-card');
  const formCard = contactGrid.querySelector('.contact-form-card');
  if (!leftCol || !infoCard || !formCard) return;

  leftCol.innerHTML = `
    <span class="tag">\u8054\u7cfb David</span>
    <h2 class="section-title">\u626b\u7801\u52a0\u5fae\u4fe1<br>\u6c9f\u901a\u66f4\u65b9\u4fbf</h2>
    <p class="section-sub">\u5982\u679c\u60a8\u662f\u623f\u4e1c\u3001\u79df\u5ba2\uff0c\u6216\u8005\u6709\u4e70\u5356\u3001\u8d37\u6b3e\u3001\u7269\u4e1a\u7ba1\u7406\u9700\u6c42\uff0c\u6b22\u8fce\u76f4\u63a5\u626b\u7801\u6dfb\u52a0\u5fae\u4fe1\u3002\u4e5f\u53ef\u4ee5\u7535\u8bdd\u6216\u90ae\u7bb1\u8054\u7cfb\u3002</p>
    <div class="wechat-priority-card mt-32">
      <div class="wechat-priority-copy">
        <div class="contact-item-label">\u5fae\u4fe1 WeChat</div>
        <h3>\u626b\u7801\u6dfb\u52a0 David \u5fae\u4fe1</h3>
        <p>\u53d1\u623f\u6e90\u56fe\u7247\u3001\u6237\u578b\u3001\u9884\u7b97\u3001\u533a\u57df\u504f\u597d\uff0c\u5fae\u4fe1\u6c9f\u901a\u901a\u5e38\u6700\u5feb\uff0c\u4e5f\u66f4\u9002\u5408\u534e\u4eba\u5ba2\u6237\u65e5\u5e38\u54a8\u8be2\u3002</p>
        <div class="wechat-actions">
          <a href="contact.html" class="btn btn-primary">\u67e5\u770b\u5927\u56fe\u4e8c\u7ef4\u7801</a>
          <a href="tel:9496561278" class="btn btn-white">\u7535\u8bdd\u8054\u7cfb</a>
        </div>
        <div class="contact-support-note">\u4e5f\u53ef\u4ee5\u76f4\u63a5\u7535\u8bdd\u6216\u90ae\u7bb1\u8054\u7cfb\u3002</div>
      </div>
      <img src="images/wechat-qr.jpg" alt="David Dai WeChat QR code">
    </div>
    <div class="contact-info-card contact-secondary-card">
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4AC}</div>
        <div>
          <div class="contact-item-label">\u5fae\u4fe1 WeChat</div>
          <div class="contact-item-value">\u8bf7\u4f18\u5148\u626b\u63cf\u4e0a\u65b9\u4e8c\u7ef4\u7801\u6dfb\u52a0\u5fae\u4fe1</div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4DE}</div>
        <div>
          <div class="contact-item-label">\u7535\u8bdd Phone</div>
          <div class="contact-item-value"><a href="tel:9496561278">(949) 656-1278</a></div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u2709\uFE0F</div>
        <div>
          <div class="contact-item-label">\u90ae\u7bb1 Email</div>
          <div class="contact-item-value"><a href="mailto:daviddairealty@gmail.com">daviddairealty@gmail.com</a></div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4CD}</div>
        <div>
          <div class="contact-item-label">\u670d\u52a1\u5730\u533a</div>
          <div class="contact-item-value">Irvine, Los Angeles &amp; Southern California</div>
        </div>
      </div>
    </div>
  `;

  const title = formCard.querySelector('h3');
  const desc = formCard.querySelector('p');
  if (title) title.textContent = '\u53d1\u9001\u54a8\u8be2 / Send Inquiry';
  if (desc) desc.textContent = '\u5982\u679c\u60a8\u6682\u65f6\u4e0d\u65b9\u4fbf\u626b\u7801\u5fae\u4fe1\uff0c\u4e5f\u53ef\u4ee5\u586b\u5199\u8868\u5355\uff0cDavid \u4f1a\u5c3d\u5feb\u8054\u7cfb\u60a8\u3002';
}

function prioritizeContactPage() {
  if (!window.location.pathname.endsWith('/contact.html')) return;
  const headerDesc = document.querySelector('.page-header p');
  if (headerDesc) {
    headerDesc.textContent = '\u6b22\u8fce\u76f4\u63a5\u626b\u7801\u6dfb\u52a0\u5fae\u4fe1\uff0c\u4e5f\u53ef\u4ee5\u7535\u8bdd\u6216\u90ae\u4ef6\u8054\u7cfb\uff0c24\u5c0f\u65f6\u5185\u56de\u590d\u3002';
  }

  const contactGrid = document.querySelector('.contact-grid');
  if (!contactGrid) return;
  const leftCol = contactGrid.firstElementChild;
  const formCard = contactGrid.querySelector('.contact-form-card');
  if (!leftCol || !formCard) return;

  leftCol.innerHTML = `
    <h2 class="section-title">\u8054\u7cfb\u65b9\u5f0f</h2>
    <p style="color:var(--text-mid);margin-bottom:32px">\u65e0\u8bba\u60a8\u662f\u51fa\u79df\u3001\u627e\u623f\u3001\u4e70\u5356\u3001\u8d37\u6b3e\u8fd8\u662f\u7269\u4e1a\u7ba1\u7406\uff0c\u90fd\u53ef\u4ee5\u76f4\u63a5\u626b\u7801\u6dfb\u52a0\u5fae\u4fe1\uff0c\u53d1\u6d88\u606f\u6c9f\u901a\u4f1a\u66f4\u65b9\u4fbf\u3002</p>
    <div class="wechat-priority-card">
      <div class="wechat-priority-copy">
        <div class="contact-item-label">\u5fae\u4fe1 WeChat</div>
        <h3>\u626b\u7801\u6dfb\u52a0 David \u5fae\u4fe1</h3>
        <p>\u534e\u4eba\u5ba2\u6237\u6700\u5e38\u7528\u7684\u8054\u7cfb\u65b9\u5f0f\u3002\u5fae\u4fe1\u66f4\u65b9\u4fbf\u53d1\u623f\u6e90\u3001\u9884\u7b97\u3001\u5b66\u533a\u3001\u901a\u52e4\u548c\u8d37\u6b3e\u95ee\u9898\uff0c\u4e5f\u66f4\u9002\u5408\u540e\u7eed\u6301\u7eed\u6c9f\u901a\u3002</p>
        <div class="wechat-actions">
          <a href="images/wechat-qr.jpg" class="btn btn-primary">\u6253\u5f00\u4e8c\u7ef4\u7801\u5927\u56fe</a>
          <a href="tel:9496561278" class="btn btn-white">\u7535\u8bdd\u8054\u7cfb</a>
        </div>
        <div class="contact-support-note">\u4e5f\u53ef\u4ee5\u76f4\u63a5\u7535\u8bdd\u6216\u90ae\u7bb1\u8054\u7cfb\u3002</div>
      </div>
      <img src="images/wechat-qr.jpg" alt="David Dai WeChat QR code">
    </div>
    <div class="contact-info-card contact-secondary-card">
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4AC}</div>
        <div>
          <div class="contact-item-label">\u5fae\u4fe1 WeChat</div>
          <div class="contact-item-value">\u8bf7\u626b\u63cf\u4e0a\u65b9\u4e8c\u7ef4\u7801\u6dfb\u52a0\u5fae\u4fe1</div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4DE}</div>
        <div>
          <div class="contact-item-label">\u7535\u8bdd Phone</div>
          <div class="contact-item-value"><a href="tel:9496561278">(949) 656-1278</a></div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u2709\uFE0F</div>
        <div>
          <div class="contact-item-label">\u90ae\u7bb1 Email</div>
          <div class="contact-item-value"><a href="mailto:daviddairealty@gmail.com">daviddairealty@gmail.com</a></div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F4CD}</div>
        <div>
          <div class="contact-item-label">\u670d\u52a1\u5730\u533a</div>
          <div class="contact-item-value">Irvine, Los Angeles &amp; Southern California</div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon">\u{1F550}</div>
        <div>
          <div class="contact-item-label">\u670d\u52a1\u65f6\u95f4</div>
          <div class="contact-item-value">\u5468\u4e00\u81f3\u5468\u516d 9:00AM - 7:00PM<br><span style="font-size:.82rem;color:var(--text-light)">\u5fae\u4fe1\u6d88\u606f\u901a\u5e38\u66f4\u5feb\u56de\u590d</span></div>
        </div>
      </div>
    </div>
    <div class="info-box" style="margin-top:24px">
      <h4>\uD83D\uDCDC \u6267\u7167\u4fe1\u606f License</h4>
      <p>David Dai · DRE# 02202763<br>Universal Elite Realty \u73af\u7403\u5730\u4ea7 · DRE# 02121645<br>DRE License<br><br>
      <em style="font-size:.82rem;color:var(--text-light)">Property Management services provided by Universal Elite Realty (DRE# 02121645)</em></p>
    </div>
  `;

  const title = formCard.querySelector('h3');
  const desc = formCard.querySelector('p');
  if (title) title.textContent = '\u53d1\u9001\u54a8\u8be2 / Send Your Inquiry';
  if (desc) {
    desc.innerHTML = '\u5982\u679c\u60a8\u6682\u65f6\u4e0d\u65b9\u4fbf\u626b\u7801\u5fae\u4fe1\uff0c\u4e5f\u53ef\u4ee5\u586b\u5199\u8868\u5355\u3002<br><em style="color:var(--text-light)">Fill in the form below and David will respond within 24 hours.</em>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) navPlaceholder.innerHTML = buildNav();

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.innerHTML = buildFooter();

  prioritizeHomeContact();
  prioritizeContactPage();
});

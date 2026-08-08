/* rentalinca.com — Main JavaScript  */

// ── Rental Data ──────────────────────────────────────────────────────
// 唯一数据源: data/rent-ranges.json -> js/rent-data.js（生成物，本文件之前加载）
// 改租金请改 data/rent-ranges.json 再跑 npm run sync:facts，不要在这里硬编码。
const RENTAL_DATA = (typeof window !== 'undefined' && window.RENTAL_DATA) || {};

// city name aliases for address parsing
const CITY_ALIASES = {
  'irvine':['irvine'],'anaheim':['anaheim'],'garden grove':['garden-grove'],'garden-grove':['garden-grove'],
  'cerritos':['cerritos'],'arcadia':['arcadia'],'rowland heights':['rowland-heights'],'rowland':['rowland-heights'],
  'diamond bar':['diamond-bar'],'san gabriel':['san-gabriel'],'monterey park':['monterey-park'],
  'alhambra':['alhambra'],'temple city':['temple-city'],'west covina':['west-covina'],
  'walnut':['walnut'],'hacienda heights':['hacienda-heights'],'pasadena':['pasadena'],
  'los angeles':['los-angeles'],'la ':['los-angeles'],' la,':['los-angeles'],
  'san marino':['san-marino'],'torrance':['torrance'],
  'chino hills':['chino-hills'],'ontario':['ontario'],'rancho cucamonga':['rancho-cucamonga'],
  'riverside':['riverside'],'corona':['corona'],'moreno valley':['moreno-valley'],
};

function parseCityFromAddress(address) {
  const a = address.toLowerCase();
  for (const [alias, keys] of Object.entries(CITY_ALIASES)) {
    if (a.includes(alias)) return keys[0];
  }
  return null;
}

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

// ── AI Rental Estimator ───────────────────────────────────────────────
function initRentalTool() {
  const tool = document.getElementById('rentalTool');
  if (!tool) return;

  let step = 1;
  function showStep(n) {
    tool.querySelectorAll('.tool-step').forEach(s => s.classList.remove('active'));
    const s = document.getElementById('toolStep' + n);
    if (s) s.classList.add('active');
    step = n;
  }

  // Step 1 → 2
  const next1 = document.getElementById('toolNext1');
  if (next1) next1.addEventListener('click', () => {
    const addr = document.getElementById('toolAddress').value.trim();
    const type = document.getElementById('toolType').value;
    if (!addr) { document.getElementById('toolAddress').focus(); return; }
    if (!type) { document.getElementById('toolType').focus(); return; }
    // Simulate AI search
    showStep('loading');
    const statusEl = document.getElementById('toolLoadingStatus');
    const steps = [
      '正在解析地址... Parsing address...',
      '搜索周边出租数据... Searching comparable rentals...',
      '分析市场行情... Analyzing market trends...',
      '生成估价报告... Generating estimate...',
    ];
    let si = 0;
    const iv = setInterval(() => {
      if (si < steps.length) { statusEl.textContent = steps[si++]; }
      else {
        clearInterval(iv);
        const cityKey = parseCityFromAddress(addr);
        const cityData = cityKey ? RENTAL_DATA[cityKey] : null;
        if (cityData) {
          const range = cityData[type];
          const mid = Math.round((range[0]+range[1])/2);
          const low = range[0]; const high = range[1];
          document.getElementById('toolCityFound').textContent = cityData.name;
          document.getElementById('toolAreaFound').textContent = cityData.area;
          document.getElementById('toolRentLow').textContent  = '$'+low.toLocaleString();
          document.getElementById('toolRentMid').textContent  = '$'+mid.toLocaleString();
          document.getElementById('toolRentHigh').textContent = '$'+high.toLocaleString();
          const typeLabels = {'1bd':'1室1卫','2bd':'2室2卫','3bd':'3室2卫','sfr':'独立屋 SFR'};
          document.getElementById('toolTypeLabel').textContent = typeLabels[type] || type;
          document.getElementById('toolComps').textContent = Math.floor(Math.random()*8+12);
          showStep(2);
        } else {
          // City not in database
          document.getElementById('toolUnknownCity').textContent = addr;
          showStep('unknown');
        }
      }
    }, 600);
  });

  // Reset
  document.querySelectorAll('.toolReset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('toolAddress').value = '';
      document.getElementById('toolType').value = '';
      showStep(1);
    });
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

// ── Contact Form ──────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '正在发送...'; btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    }, 1200);
  });
}

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
  initNav(); initRentalTool(); initFAQ(); initCaseFilter(); initContactForm();
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
    });
  });
});

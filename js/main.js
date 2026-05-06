/* rentalinca.com — Main JavaScript  */

// ── Extended Rental Data (all SoCal cities) ──────────────────────────
const RENTAL_DATA = {
  // Orange County
  'irvine':            { name:'Irvine 尔湾',            area:'Orange County', '1bd':[2300,2800],'2bd':[3000,3800],'3bd':[3800,5000],'sfr':[5500,8500], hot:true },
  'anaheim':           { name:'Anaheim 安纳罕',          area:'Orange County', '1bd':[1800,2300],'2bd':[2400,3000],'3bd':[3000,3800],'sfr':[3800,5500] },
  'garden-grove':      { name:'Garden Grove 花园格罗夫', area:'Orange County', '1bd':[1700,2100],'2bd':[2200,2800],'3bd':[2800,3600],'sfr':[3600,5000] },
  'cerritos':          { name:'Cerritos 塞利托斯',       area:'SE Los Angeles', '1bd':[1900,2300],'2bd':[2500,3100],'3bd':[3100,4000],'sfr':[4200,5800] },
  // SGV / East LA
  'arcadia':           { name:'Arcadia 阿凯迪亚',        area:'San Gabriel Valley','1bd':[1800,2200],'2bd':[2500,3200],'3bd':[3200,4200],'sfr':[4500,6500], hot:true },
  'rowland-heights':   { name:'Rowland Heights 罗兰岗',  area:'San Gabriel Valley','1bd':[1600,2000],'2bd':[2200,2800],'3bd':[2800,3600],'sfr':[3800,5000] },
  'diamond-bar':       { name:'Diamond Bar 钻石吧',      area:'San Gabriel Valley','1bd':[1700,2100],'2bd':[2300,2900],'3bd':[2900,3800],'sfr':[4000,5500] },
  'san-gabriel':       { name:'San Gabriel 圣盖博',      area:'San Gabriel Valley','1bd':[1700,2100],'2bd':[2300,2900],'3bd':[2900,3700],'sfr':[3800,5200] },
  'monterey-park':     { name:'Monterey Park 蒙特利公园',area:'San Gabriel Valley','1bd':[1600,2000],'2bd':[2100,2700],'3bd':[2700,3500],'sfr':[3600,5000] },
  'alhambra':          { name:'Alhambra 阿罕布拉',       area:'San Gabriel Valley','1bd':[1700,2100],'2bd':[2200,2800],'3bd':[2800,3600],'sfr':[3700,5100] },
  'temple-city':       { name:'Temple City 天普市',      area:'San Gabriel Valley','1bd':[1750,2150],'2bd':[2300,2900],'3bd':[2900,3700],'sfr':[3900,5300] },
  'west-covina':       { name:'West Covina 西科维纳',    area:'San Gabriel Valley','1bd':[1600,2000],'2bd':[2100,2700],'3bd':[2700,3500],'sfr':[3500,4800] },
  'walnut':            { name:'Walnut 核桃市',            area:'San Gabriel Valley','1bd':[1750,2150],'2bd':[2300,2900],'3bd':[2900,3800],'sfr':[4000,5500] },
  'hacienda-heights':  { name:'Hacienda Heights 花仙纳岗',area:'San Gabriel Valley','1bd':[1600,2000],'2bd':[2100,2700],'3bd':[2700,3500],'sfr':[3600,5000] },
  'pasadena':          { name:'Pasadena 帕萨迪纳',       area:'San Gabriel Valley','1bd':[1900,2400],'2bd':[2600,3300],'3bd':[3300,4300],'sfr':[4500,6500] },
  // Los Angeles
  'los-angeles':       { name:'Los Angeles 洛杉矶',      area:'Los Angeles',    '1bd':[2000,2800],'2bd':[2800,3800],'3bd':[3500,5000],'sfr':[4500,8000] },
  'san-marino':        { name:'San Marino 圣马力诺',     area:'San Gabriel Valley','1bd':[2200,2800],'2bd':[3000,3800],'3bd':[3800,5000],'sfr':[5500,8000] },
  'torrance':          { name:'Torrance 托伦斯',         area:'South Bay',      '1bd':[1900,2400],'2bd':[2600,3200],'3bd':[3200,4200],'sfr':[4000,5800] },
  // Inland Empire
  'chino-hills':       { name:'Chino Hills 奇诺岗',      area:'Inland Empire',  '1bd':[1800,2200],'2bd':[2400,3000],'3bd':[3000,3900],'sfr':[4200,5800] },
  'ontario':           { name:'Ontario 安大略市',         area:'Inland Empire',  '1bd':[1600,2000],'2bd':[2100,2700],'3bd':[2700,3500],'sfr':[3500,4800] },
  'rancho-cucamonga':  { name:'Rancho Cucamonga 牧场库卡蒙加',area:'Inland Empire','1bd':[1700,2100],'2bd':[2200,2800],'3bd':[2800,3700],'sfr':[3800,5200] },
  'riverside':         { name:'Riverside 河滨市',         area:'Inland Empire',  '1bd':[1400,1800],'2bd':[1900,2400],'3bd':[2400,3200],'sfr':[3200,4500] },
  'corona':            { name:'Corona 科罗纳',            area:'Inland Empire',  '1bd':[1600,2000],'2bd':[2100,2700],'3bd':[2700,3500],'sfr':[3600,5000] },
  'moreno-valley':     { name:'Moreno Valley 莫雷诺谷',  area:'Inland Empire',  '1bd':[1400,1700],'2bd':[1800,2300],'3bd':[2300,3000],'sfr':[3000,4200] },
};

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

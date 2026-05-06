/* rentalinca.com — Main JavaScript */

// ── Rental Data ──────────────────────────────────────────────────────
const RENTAL_DATA = {
  irvine:          { name: 'Irvine 尔湾',          '1bd': [2300,2800], '2bd': [3000,3800], '3bd': [3800,5000], sfr: [5500,8000] },
  'los-angeles':   { name: 'Los Angeles 洛杉矶',    '1bd': [2000,2600], '2bd': [2500,3500], '3bd': [3500,5000], sfr: [5000,8500] },
  arcadia:         { name: 'Arcadia 阿凯迪亚',       '1bd': [1800,2200], '2bd': [2500,3200], '3bd': [3200,4200], sfr: [4500,6500] },
  pasadena:        { name: 'Pasadena 帕萨迪纳',      '1bd': [2200,2800], '2bd': [2700,3500], '3bd': [3600,4800], sfr: [5200,7500] },
  'san-gabriel':   { name: 'San Gabriel 圣盖博',     '1bd': [1800,2300], '2bd': [2300,3000], '3bd': [3000,4200], sfr: [4200,6200] },
  'rowland-heights':{ name: 'Rowland Heights 罗兰岗', '1bd': [1600,2000], '2bd': [2200,2800], '3bd': [2800,3600], sfr: [3800,5000] },
  'diamond-bar':   { name: 'Diamond Bar 钻石吧',    '1bd': [1700,2100], '2bd': [2300,2900], '3bd': [2900,3800], sfr: [4000,5500] },
  'chino-hills':   { name: 'Chino Hills 奇诺岗',    '1bd': [1800,2200], '2bd': [2400,3000], '3bd': [3000,3900], sfr: [4200,5800] },
  riverside:       { name: 'Riverside 河滨市',       '1bd': [1400,1800], '2bd': [1900,2400], '3bd': [2400,3200], sfr: [3200,4500] },
};

async function saveInquiry(payload) {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Inquiry save failed');
  return response.json();
}

const PROPERTY_TYPE_LABELS = {
  '1bd': '1BD / 1BA',
  '2bd': '2BD / 2BA',
  '3bd': '3BD / 2BA',
  sfr: 'Single Family Home'
};

const TYPICAL_SQFT = {
  '1bd': 750,
  '2bd': 1050,
  '3bd': 1450,
  sfr: 2200
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToNearest50(value) {
  return Math.round(value / 50) * 50;
}

function fallbackEstimate(cityKey, propertyType, areaSqft) {
  const city = RENTAL_DATA[cityKey];
  const baseRange = city[propertyType];
  const areaFactor = clamp(Math.sqrt(areaSqft / TYPICAL_SQFT[propertyType]), 0.8, 1.25);
  const min = roundToNearest50(baseRange[0] * areaFactor);
  const max = roundToNearest50(baseRange[1] * areaFactor);
  return {
    cityKey,
    cityName: city.name,
    propertyType,
    propertyTypeLabel: PROPERTY_TYPE_LABELS[propertyType],
    areaSqft,
    minRent: min,
    maxRent: max,
    displayRange: `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`
  };
}

async function getRentalEstimate(payload) {
  const response = await fetch('/api/rental-estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Rental estimate failed');
  return response.json();
}

// ── Mobile Nav ───────────────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });
  // Mark active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || href.endsWith('/' + path)) a.classList.add('active');
  });
}

// ── Rental Estimator Tool ─────────────────────────────────────────────
function initRentalTool() {
  const tool = document.getElementById('rentalTool');
  if (!tool) return;

  let step = 1;
  let currentEstimate = null;
  const citySelect = document.getElementById('toolCity');
  const typeSelect = document.getElementById('toolType');
  const areaInput = document.getElementById('toolArea');

  function showStep(n) {
    tool.querySelectorAll('.tool-step').forEach(s => s.classList.remove('active'));
    const s = document.getElementById('toolStep' + n);
    if (s) s.classList.add('active');
    step = n;
  }

  const nextBtn1 = document.getElementById('toolNext1');
  if (nextBtn1) nextBtn1.addEventListener('click', () => {
    if (!citySelect.value) { citySelect.style.borderColor = 'rgba(255,100,100,.7)'; return; }
    citySelect.style.borderColor = '';
    showStep(2);
  });

  const nextBtn2 = document.getElementById('toolNext2');
  if (nextBtn2) nextBtn2.addEventListener('click', async () => {
    const areaSqft = Number(areaInput.value);
    if (!typeSelect.value) { typeSelect.style.borderColor = 'rgba(255,100,100,.7)'; return; }
    if (!areaSqft || areaSqft < 300) { areaInput.style.borderColor = 'rgba(255,100,100,.7)'; return; }
    typeSelect.style.borderColor = '';
    areaInput.style.borderColor = '';
    nextBtn2.disabled = true;
    nextBtn2.textContent = '估算中...';
    try {
      const data = await getRentalEstimate({
        city: citySelect.value,
        propertyType: typeSelect.value,
        areaSqft
      });
      currentEstimate = data.estimate;
    } catch (error) {
      console.warn('Rental estimate backend is unavailable; using local fallback.', error);
      currentEstimate = fallbackEstimate(citySelect.value, typeSelect.value, areaSqft);
    }
    document.getElementById('toolRentRange').textContent = currentEstimate.displayRange.replace(' - ', ' – ');
    document.getElementById('toolCityName').textContent = currentEstimate.cityName;
    document.getElementById('toolEstimateMeta').textContent = `${currentEstimate.propertyTypeLabel} · ${currentEstimate.areaSqft.toLocaleString()} sqft`;
    nextBtn2.disabled = false;
    nextBtn2.textContent = '查看租金 →';
    showStep(3);
  });

  const submitBtn = document.getElementById('toolSubmit');
  if (submitBtn) submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('toolName').value.trim();
    const phone = document.getElementById('toolPhone').value.trim();
    if (!name || !phone) return;
    submitBtn.disabled = true;
    try {
      await saveInquiry({
        source: 'rental-estimator',
        name,
        phone,
        city: currentEstimate?.cityName || RENTAL_DATA[citySelect.value].name,
        propertyType: currentEstimate?.propertyTypeLabel || typeSelect.value,
        areaSqft: currentEstimate?.areaSqft || Number(areaInput.value),
        estimatedRent: currentEstimate?.displayRange,
        estimateId: currentEstimate?.id,
        page: window.location.pathname
      });
    } catch (error) {
      console.warn('Inquiry backend is unavailable; showing success locally.', error);
    }
    submitBtn.disabled = false;
    showStep(4);
  });

  const resetBtn = document.getElementById('toolReset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (citySelect) citySelect.value = '';
    if (typeSelect) typeSelect.value = '';
    if (areaInput) areaInput.value = '';
    currentEstimate = null;
    document.getElementById('toolEstimateMeta').textContent = '';
    document.getElementById('toolName').value = '';
    document.getElementById('toolPhone').value = '';
    showStep(1);
  });
}

// ── FAQ Accordion ─────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
      // Toggle current
      if (!isOpen) { btn.classList.add('open'); btn.nextElementSibling.classList.add('open'); }
    });
  });
}

// ── Contact Form ──────────────────────────────────────────────────────
function initCityOtherInputs() {
  document.querySelectorAll('.city-select').forEach(select => {
    const input = select.parentElement.querySelector('.city-other-input');
    if (!input) return;
    const sync = () => {
      const isOther = select.value === 'other';
      input.classList.toggle('visible', isOther);
      input.required = isOther;
      if (!isOther) input.value = '';
    };
    select.addEventListener('change', sync);
    sync();
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '正在发送...';
    btn.disabled = true;
    const formData = new FormData(form);
    const city = formData.get('city') === 'other'
      ? formData.get('cityOther')
      : formData.get('city');

    try {
      await saveInquiry({
        source: 'contact-form',
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        serviceNeeded: formData.get('serviceNeeded'),
        city,
        notes: formData.get('notes'),
        page: window.location.pathname
      });
    } catch (error) {
      console.warn('Inquiry backend is unavailable; showing success locally.', error);
    }

    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    }, 1200);
  });
}

// ── Smooth Scroll for anchor links ───────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
  initNav();
  initRentalTool();
  initFAQ();
  initCaseFilter();
  initCityOtherInputs();
  initContactForm();
  initSmoothScroll();
});

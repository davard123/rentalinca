document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('/contact.html')) return;

  const originalForm = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  if (!originalForm || !successBox) return;

  const form = originalForm.cloneNode(true);
  originalForm.replaceWith(form);

  // Set RENTALINCA_TURNSTILE_SITE_KEY in a small deployment config script to
  // enable the widget. The backend remains compatible with local development
  // when TURNSTILE_SECRET_KEY is not configured.
  if (window.RENTALINCA_TURNSTILE_SITE_KEY) {
    const widget = document.createElement('div');
    widget.className = 'cf-turnstile';
    widget.dataset.sitekey = window.RENTALINCA_TURNSTILE_SITE_KEY;
    form.appendChild(widget);
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
  }

  let errorBox = form.querySelector('.form-error-message');
  if (!errorBox) {
    errorBox = document.createElement('p');
    errorBox.className = 'form-error-message';
    errorBox.style.cssText = 'display:none;margin-top:14px;color:#b42318;font-size:.875rem;line-height:1.6;';
    form.appendChild(errorBox);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.dataset.originalLabel || submitButton?.textContent || 'Submit';
    if (submitButton) {
      submitButton.dataset.originalLabel = originalLabel;
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
    }
    errorBox.style.display = 'none';

    const textInput = form.querySelector('input[type="text"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const emailInput = form.querySelector('input[type="email"]');
    const selects = form.querySelectorAll('select');
    const notesInput = form.querySelector('textarea');
    const estimateSummary = (() => {
      try { return JSON.parse(sessionStorage.getItem('rentalincaEstimate') || 'null'); } catch { return null; }
    })();
    const tenantSearch = (() => {
      try { return JSON.parse(sessionStorage.getItem('rentalincaTenantSearch') || 'null'); } catch { return null; }
    })();
    const turnstileToken = form.querySelector('input[name="turnstileToken"]')?.value || '';
    const query = new URLSearchParams(window.location.search);

    const payload = {
      source: 'contact-form',
      page: window.location.pathname,
      name: textInput?.value.trim() || '',
      phone: phoneInput?.value.trim() || '',
      email: emailInput?.value.trim() || '',
      serviceNeeded: selects[0]?.value.trim() || (tenantSearch ? '找租房 Find a Rental' : ''),
      city: selects[1]?.value.trim() || tenantSearch?.city || '',
      appointmentSlot: selects[2]?.value.trim() || '',
      notes: [notesInput?.value.trim() || '', tenantSearch ? '找房助手：预算 $' + tenantSearch.budget + '，房型 ' + tenantSearch.type + '，入住 ' + (tenantSearch.moveIn || '不限') : ''].filter(Boolean).join('\n'),
      source: query.get('source') || (estimateSummary ? estimateSummary.source : 'contact-form'),
      estimateId: estimateSummary?.estimateId || query.get('estimateId') || '',
      estimatedRent: estimateSummary?.displayRange || query.get('estimatedRent') || ''
      ,turnstileToken
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to submit inquiry right now.');
      }

      form.style.display = 'none';
      successBox.style.display = 'block';
      const id = successBox.querySelector('.form-confirmation-id');
      if (id) id.textContent = '咨询编号：' + (result.id || '已生成');
      try { sessionStorage.removeItem('rentalincaEstimate'); } catch {}
      try { sessionStorage.removeItem('rentalincaTenantSearch'); } catch {}
      if (window.ricaTrack) {
        window.ricaTrack('lead_submitted', { source: payload.source, page: payload.page });
      }
    } catch (error) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
      errorBox.textContent = '提交没有成功，请稍后再试，或直接微信 / 电话联系 David。';
      errorBox.style.display = 'block';
      if (window.ricaTrack) {
        window.ricaTrack('lead_failed', { source: payload.source });
      }
    }
  });
});

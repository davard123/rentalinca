document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('/contact.html')) return;

  const originalForm = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  if (!originalForm || !successBox) return;

  const form = originalForm.cloneNode(true);
  originalForm.replaceWith(form);

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

    const payload = {
      source: 'contact-form',
      page: window.location.pathname,
      name: textInput?.value.trim() || '',
      phone: phoneInput?.value.trim() || '',
      email: emailInput?.value.trim() || '',
      serviceNeeded: selects[0]?.value.trim() || '',
      city: selects[1]?.value.trim() || '',
      notes: notesInput?.value.trim() || ''
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
    } catch (error) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
      errorBox.textContent = '提交没有成功，请稍后再试，或直接微信 / 电话联系 David。';
      errorBox.style.display = 'block';
    }
  });
});

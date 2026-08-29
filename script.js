document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.card');

  // Editor form elements
  const nameInput = document.getElementById('nameInput');
  const companyInput = document.getElementById('companyInput');
  const phoneInput = document.getElementById('phoneInput');
  const emailInput = document.getElementById('emailInput');
  const resetBtn = document.getElementById('resetBtn');
  const themeRadios = Array.from(document.querySelectorAll('input[name="theme"]'));

  const nameEl = document.querySelector('.person-name');
  const companyEl = document.querySelector('.company');
  const phoneLink = document.getElementById('phoneLink');
  const emailLink = document.getElementById('emailLink');

  // Save initial values to allow reset
  const initial = {
    name: nameEl ? nameEl.textContent.trim() : '',
    company: companyEl ? companyEl.textContent.trim() : '',
    phone: phoneLink ? phoneLink.textContent.trim() : '',
    email: emailLink ? emailLink.textContent.trim() : '',
    theme: 'default'
  };

  function applyTheme(value) {
    card.classList.remove('theme-dark', 'theme-modern');
    if (value === 'dark') card.classList.add('theme-dark');
    if (value === 'modern') card.classList.add('theme-modern');
  }

  function updateName(v) { if (nameEl) nameEl.textContent = v || initial.name; }
  function updateCompany(v) { if (companyEl) companyEl.textContent = v || initial.company; }
  function updatePhone(v) {
    if (!phoneLink) return;
    const sanitized = v ? v.trim() : '';
    phoneLink.href = sanitized ? `tel:${sanitized}` : '#';
    phoneLink.textContent = sanitized || initial.phone;
  }
  function updateEmail(v) {
    if (!emailLink) return;
    const sanitized = v ? v.trim() : '';
    emailLink.href = sanitized ? `mailto:${sanitized}` : '#';
    emailLink.textContent = sanitized || initial.email;
  }

  // Wire inputs
  // Prefill editor with current card values
  if (nameInput) nameInput.value = initial.name || '';
  if (companyInput) companyInput.value = initial.company || '';
  if (phoneInput) phoneInput.value = initial.phone || '';
  if (emailInput) emailInput.value = initial.email || '';

  // Run button: apply entered values to the card when pressed
  const runBtn = document.getElementById('runBtn');
  if (runBtn) runBtn.addEventListener('click', () => {
    updateName(nameInput ? nameInput.value : '');
    updateCompany(companyInput ? companyInput.value : '');
    updatePhone(phoneInput ? phoneInput.value : '');
    updateEmail(emailInput ? emailInput.value : '');
    const selected = document.querySelector('input[name="theme"]:checked');
    applyTheme(selected ? selected.value : 'default');
  });

  themeRadios.forEach(r => r.addEventListener('change', (e) => applyTheme(e.target.value)));

  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (nameInput) nameInput.value = '';
    if (companyInput) companyInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (emailInput) emailInput.value = '';
    updateName(initial.name);
    updateCompany(initial.company);
    updatePhone(initial.phone);
    updateEmail(initial.email);
    applyTheme('default');
    const defaultRadio = document.querySelector('input[name="theme"][value="default"]');
    if (defaultRadio) defaultRadio.checked = true;
  });

  // Keep existing share & download behavior (if present)
  const shareBtn = document.getElementById('shareBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function showToast(text, duration = 1800) {
    const t = document.createElement('div');
    t.textContent = text;
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '24px';
    t.style.transform = 'translateX(-50%)';
    t.style.background = 'rgba(3,41,66,0.9)';
    t.style.color = 'white';
    t.style.padding = '0.5rem 0.9rem';
    t.style.borderRadius = '8px';
    t.style.zIndex = '9999';
    t.style.fontSize = '14px';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareUrl = window.location.href;
      if (navigator.share) {
        try { await navigator.share({ title: document.title, url: shareUrl }); } catch (err) {}
      } else if (navigator.clipboard) {
        try { await navigator.clipboard.writeText(shareUrl); showToast('Link copied to clipboard'); } catch (err) { showToast('Copy failed'); }
      } else showToast('Copy the link from your browser address bar');
    });
  }

  if (downloadBtn && window.html2canvas) {
    downloadBtn.addEventListener('click', async () => {
      try {
        const canvas = await html2canvas(card, { backgroundColor: null, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        // derive filename from entered name > company > email
        const filenameBase = (nameInput && nameInput.value.trim()) || (companyInput && companyInput.value.trim()) || (emailInput && emailInput.value.split('@')[0]) || 'contact-card';
        const safe = filenameBase.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
        a.download = `${safe}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) { console.error(err); showToast('Download failed'); }
    });
  }

});

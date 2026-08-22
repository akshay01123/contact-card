document.addEventListener('DOMContentLoaded', () => {
  const skills = Array.from(document.querySelectorAll('.skill'));
  if (!skills.length) return;
  const card = skills[0].closest('.card');
  let bubble = null;
  let activeSkill = null;

  // Share & download elements
  const shareBtn = document.getElementById('shareBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function showToast(text, duration = 1800) {
    const t = document.createElement('div');
    t.textContent = text;
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '24px';
    t.style.transform = 'translateX(-50%)';
    t.style.background = 'rgba(31,41,55,0.9)';
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
        try {
          await navigator.share({ title: document.title, url: shareUrl });
        } catch (err) {
          // user cancelled or share not available
        }
      } else if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Link copied to clipboard');
        } catch (err) {
          showToast('Copy failed — select and copy the URL');
        }
      } else {
        showToast('Copy the link from your browser address bar');
      }
    });
  }

  if (downloadBtn && window.html2canvas) {
    downloadBtn.addEventListener('click', async () => {
      try {
        const canvas = await html2canvas(card, { backgroundColor: null, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'contact-card.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        console.error(err);
        showToast('Download failed');
      }
    });
  }

  function createBubble() {
    bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.setAttribute('role', 'dialog');
    bubble.setAttribute('aria-hidden', 'true');
    card.appendChild(bubble);
  }

  function showBubbleFor(skill) {
    if (!bubble) createBubble();
    const desc = skill.dataset.description || '';
      // clear previous contents
      bubble.innerHTML = '';
      const text = document.createElement('div');
      text.className = 'bubble-text';
      text.textContent = desc;
      bubble.appendChild(text);
      // if the skill has an associated href, add a link
      if (skill.dataset.href) {
        const linkWrap = document.createElement('div');
        linkWrap.className = 'bubble-link';
        const a = document.createElement('a');
        a.href = skill.dataset.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Open profile';
        linkWrap.appendChild(a);
        bubble.appendChild(linkWrap);
      }
    bubble.classList.add('show');
    bubble.setAttribute('aria-hidden', 'false');
    // position the bubble centered above the clicked skill
    const skillRect = skill.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const centerX = skillRect.left - cardRect.left + skillRect.width / 2;
    // force a render to measure height
    bubble.style.left = `${centerX}px`;
    bubble.style.top = '0px';
    const height = bubble.offsetHeight;
    const top = skill.offsetTop - height - 12;
    bubble.style.top = `${Math.max(top, 8)}px`;
    skill.setAttribute('aria-expanded', 'true');
    activeSkill = skill;
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('show');
    bubble.setAttribute('aria-hidden', 'true');
    if (activeSkill) activeSkill.removeAttribute('aria-expanded');
    activeSkill = null;
  }

  skills.forEach(skill => {
    skill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeSkill === skill) {
        hideBubble();
      } else {
        showBubbleFor(skill);
      }
    });
  });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (!bubble || !bubble.classList.contains('show')) return;
    if (activeSkill && (e.target === activeSkill || activeSkill.contains(e.target) || bubble.contains(e.target))) return;
    hideBubble();
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideBubble();
  });
});

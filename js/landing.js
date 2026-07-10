// ============================================================
// AgroSmartHub 3.0 — Landing Page Interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavScroll();
  initHamburger();
  initFeatureCards();
  initTestimonials();
  initCounters();
  initKeyboard();
  initAuthOverlay();
});

// ─── PARTICLES ───
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = typeof randomInt !== 'undefined' ? randomInt(2, 5) : Math.floor(Math.random()*4)+2;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${typeof randomBetween !== 'undefined' ? randomBetween(8,18).toFixed(1) : (Math.random()*10+8).toFixed(1)}s;
      animation-delay:${-Math.random()*18}s;
    `;
    container.appendChild(p);
  }
}

// ─── NAVBAR SCROLL ───
function initNavScroll() {
  const nav = document.getElementById('landNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, {passive:true});
}

// ─── HAMBURGER ───
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;right:0;background:rgba(3,10,5,0.97);padding:16px;gap:8px;border-bottom:1px solid var(--border);z-index:99;';
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { menu.style.cssText = ''; });
  });
}

// ─── FEATURE CARDS ───
function initFeatureCards() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;
  ASH.features.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="feature-icon">${f.icon}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-desc">${f.desc}</p>
      <div class="feature-tags">
        ${f.tags.map(t => `<span class="feature-tag">${t}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── TESTIMONIALS ───
function initTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  ASH.testimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <div class="testimonial-stars">${'⭐'.repeat(t.stars)}</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar" style="background:${t.avatarColor}">${t.avatar}</div>
        <div>
          <div class="author-name">${t.name}</div>
          <div class="author-location">${t.role} · ${t.location}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── ANIMATED COUNTERS ───
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(el => {
          animateCounter(el);
        });
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.3});

  document.querySelectorAll('.hero-trust, .stats-banner').forEach(el => {
    observer.observe(el);
  });
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(easeOut(progress) * target);
    el.textContent = current >= 1000 ? fmtNum(current) : current;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target >= 1000 ? fmtNum(target) : target;
  }
  requestAnimationFrame(update);
}

// ─── KEYBOARD & OVERLAY ───
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAuth();
  });
}

function initAuthOverlay() {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAuth();
  });
}

// Check if user is already logged in
window.addEventListener('load', () => {
  const user = Session.get('user');
  if (user && !window.location.href.includes('app.html')) {
    // Show "Continue as..." button
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
      const btn = document.createElement('a');
      btn.href = 'app.html';
      btn.className = 'btn-green-sm';
      btn.textContent = `Continue as ${user.name.split(' ')[0]} →`;
      btn.style.cssText = 'text-decoration:none;display:inline-block;';
      navCta.prepend(btn);
    }
  }
});

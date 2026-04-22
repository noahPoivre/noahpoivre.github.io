// ═══════════════════════════════════════════════════════════════
// PORTFOLIO ANALYTICS — Poivre Noah
// noahpoivre.github.io
// ⚠️  À placer à la racine de ton repo GitHub
// ⚠️  Ajouter <script src="analytics.js"></script> avant </body>
//     dans : index.html, veille.html, cashcontrol.html,
//             cinema.html, sudo_sante.html
// ═══════════════════════════════════════════════════════════════

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbzuqGQaeUJYGjI-kyt1SvPMwdM2h8AXIrAmMgLajHHESrQOt46zY_opLcb0uGy7nzeO/exec';

// ────────────────────────────────────────────────────────────────
// MAPPING ton portfolio
// ────────────────────────────────────────────────────────────────
const SECTION_MAP = {
  'hero':        'Hero / Accueil',
  'projets':     'Mes Projets',
  'competences': 'Compétences',
  'stages':      'Mes Stages',
  'contact':     'Contact',
};

const JURY_SENSITIVE = ['stages', 'competences', 'projets'];

const PAGE_NAMES = {
  '/':                 'index',
  '/index.html':       'index',
  '/veille.html':      'veille',
  '/cashcontrol.html': 'projet_cashcontrol',
  '/cinema.html':      'projet_cinema',
  '/sudo_sante.html':  'projet_sudosante',
};

function getCurrentPage() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return PAGE_NAMES[path] || path.replace('/', '');
}

// ────────────────────────────────────────────────────────────────
// SESSION
// ────────────────────────────────────────────────────────────────
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function getOrCreateSession() {
  let id = sessionStorage.getItem('np_session_id');
  if (!id) { id = generateSessionId(); sessionStorage.setItem('np_session_id', id); }
  return id;
}

function isReturning() {
  const v = localStorage.getItem('np_visited');
  if (!v) { localStorage.setItem('np_visited', Date.now()); return false; }
  return true;
}

function getVisitCount() {
  const n = parseInt(localStorage.getItem('np_visit_count') || '0') + 1;
  localStorage.setItem('np_visit_count', n);
  return n;
}

// ────────────────────────────────────────────────────────────────
// PLATEFORME
// ────────────────────────────────────────────────────────────────
function getPlatform() {
  const ua = navigator.userAgent;
  if (/Windows NT 10|Windows NT 11/.test(ua)) return 'Windows 10/11';
  if (/Windows/.test(ua))   return 'Windows (ancien)';
  if (/Macintosh/.test(ua)) return 'macOS';
  if (/iPhone/.test(ua))    return 'iOS';
  if (/iPad/.test(ua))      return 'iPadOS';
  if (/Android/.test(ua))   return 'Android';
  if (/CrOS/.test(ua))      return 'ChromeOS';
  if (/Linux/.test(ua))     return 'Linux';
  return 'Inconnu';
}

function getConnectionType() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return c ? (c.effectiveType || c.type || 'unknown') : 'unknown';
}

// ────────────────────────────────────────────────────────────────
// ENVOI
// ────────────────────────────────────────────────────────────────
function sendEvent(eventName, data = {}) {
  try {
    fetch(ANALYTICS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        data,
        userAgent:      navigator.userAgent,
        page:           getCurrentPage(),
        platform:       getPlatform(),
        screen:         screen.width + 'x' + screen.height,
        language:       navigator.language || 'unknown',
        timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        connectionType: getConnectionType(),
        sessionId:      getOrCreateSession()
      }),
      keepalive: true
    });
  } catch (e) { /* silencieux */ }
}

// ────────────────────────────────────────────────────────────────
// SESSION START / END
// ────────────────────────────────────────────────────────────────
const SESSION_START = Date.now();

function initSession() {
  sendEvent('session_start', {
    returning:    isReturning(),
    visit_count:  getVisitCount(),
    referrer:     document.referrer || 'direct',
    current_page: getCurrentPage()
  });
}

window.addEventListener('beforeunload', () => {
  sendEvent('session_end', {
    total_seconds: Math.round((Date.now() - SESSION_START) / 1000),
    page: getCurrentPage()
  });
});
window.addEventListener('pagehide', () => {
  sendEvent('session_end', {
    total_seconds: Math.round((Date.now() - SESSION_START) / 1000),
    page: getCurrentPage()
  });
});

// ────────────────────────────────────────────────────────────────
// SECTIONS — #hero #projets #competences #stages #contact
// ────────────────────────────────────────────────────────────────
const sectionTimers = {};

function initSectionTracking() {
  const sections = document.querySelectorAll('#hero,#projets,#competences,#stages,#contact,section[id]');
  if (!sections.length) return;

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (!id) return;

      if (entry.isIntersecting) {
        if (!sectionTimers[id]) sectionTimers[id] = { start: null, total: 0, visits: 0 };
        sectionTimers[id].start = Date.now();
        sectionTimers[id].visits++;

        if (sectionTimers[id].visits > 1) {
          const type = sectionTimers[id].visits >= 3 ? 'section_heavily_revisited' : 'section_revisited';
          sendEvent(type, {
            section: id,
            label: SECTION_MAP[id] || id,
            visits: sectionTimers[id].visits,
            jury_sensitive: JURY_SENSITIVE.includes(id)
          });
        }

      } else {
        if (sectionTimers[id]?.start) {
          const seconds = Math.round((Date.now() - sectionTimers[id].start) / 1000);
          sectionTimers[id].total += seconds;
          sectionTimers[id].start = null;
          sendEvent('section_time', {
            section: id,
            label: SECTION_MAP[id] || id,
            seconds,
            total_seconds: sectionTimers[id].total
          });
        }
      }
    });
  }, { threshold: 0.3 }).observe
    ? (() => {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const id = entry.target.id;
            if (!id) return;
            if (entry.isIntersecting) {
              if (!sectionTimers[id]) sectionTimers[id] = { start: null, total: 0, visits: 0 };
              sectionTimers[id].start = Date.now();
              sectionTimers[id].visits++;
              if (sectionTimers[id].visits > 1) {
                sendEvent(sectionTimers[id].visits >= 3 ? 'section_heavily_revisited' : 'section_revisited', {
                  section: id, label: SECTION_MAP[id] || id,
                  visits: sectionTimers[id].visits,
                  jury_sensitive: JURY_SENSITIVE.includes(id)
                });
              }
            } else {
              if (sectionTimers[id]?.start) {
                const sec = Math.round((Date.now() - sectionTimers[id].start) / 1000);
                sectionTimers[id].total += sec;
                sectionTimers[id].start = null;
                sendEvent('section_time', {
                  section: id, label: SECTION_MAP[id] || id,
                  seconds: sec, total_seconds: sectionTimers[id].total
                });
              }
            }
          });
        }, { threshold: 0.3 });
        sections.forEach(s => obs.observe(s));
      })()
    : null;
}

// Version simplifiée qui marche à coup sûr
function initSections() {
  const sections = document.querySelectorAll('#hero,#projets,#competences,#stages,#contact,section[id]');
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (!id) return;

      if (entry.isIntersecting) {
        if (!sectionTimers[id]) sectionTimers[id] = { start: null, total: 0, visits: 0 };
        sectionTimers[id].start = Date.now();
        sectionTimers[id].visits++;

        if (sectionTimers[id].visits > 1) {
          sendEvent(sectionTimers[id].visits >= 3 ? 'section_heavily_revisited' : 'section_revisited', {
            section: id,
            label: SECTION_MAP[id] || id,
            visits: sectionTimers[id].visits,
            jury_sensitive: JURY_SENSITIVE.includes(id)
          });
        }
      } else {
        if (sectionTimers[id] && sectionTimers[id].start) {
          const sec = Math.round((Date.now() - sectionTimers[id].start) / 1000);
          sectionTimers[id].total += sec;
          sectionTimers[id].start = null;
          sendEvent('section_time', {
            section: id,
            label: SECTION_MAP[id] || id,
            seconds: sec,
            total_seconds: sectionTimers[id].total
          });
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
}

// ────────────────────────────────────────────────────────────────
// PAGES PROJETS & VEILLE
// ────────────────────────────────────────────────────────────────
function initProjectPageTracking() {
  const page = getCurrentPage();
  const projectPages = ['veille', 'projet_cashcontrol', 'projet_cinema', 'projet_sudosante'];
  if (!projectPages.includes(page)) return;

  sendEvent('projet_viewed', { projet: page });

  document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('external_link_clicked', {
        url: link.getAttribute('href'),
        label: link.textContent.trim().slice(0, 80),
        page
      });
    });
  });
}

// ────────────────────────────────────────────────────────────────
// SCROLL
// ────────────────────────────────────────────────────────────────
function initScrollTracking() {
  const reached = new Set();
  let lastY = window.scrollY;
  let ups = 0;

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    [25, 50, 75, 100].forEach(m => {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        sendEvent('scroll_milestone', { percent: m, page: getCurrentPage() });
      }
    });
    if (window.scrollY < lastY - 150) {
      ups++;
      if (ups % 2 === 1) sendEvent('scroll_back_up', { times: ups });
    }
    lastY = window.scrollY;
  }, { passive: true });
}

// ────────────────────────────────────────────────────────────────
// TEXTES SURLIGNÉS
// ────────────────────────────────────────────────────────────────
function initTextSelectionTracking() {
  let timer;
  document.addEventListener('selectionchange', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim().length < 8) return;
      const text = sel.toString().trim().slice(0, 200);
      let ctx = getCurrentPage();
      if (sel.anchorNode) {
        const el = sel.anchorNode.parentElement;
        const closest = el && el.closest('#hero,#projets,#competences,#stages,#contact,section[id]');
        if (closest) ctx = closest.id;
      }
      sendEvent('text_selected', { text, section: ctx, page: getCurrentPage(), length: text.length });
    }, 700);
  });
}

// ────────────────────────────────────────────────────────────────
// TÉLÉCHARGEMENTS & DOCUMENTS PROTÉGÉS
// ────────────────────────────────────────────────────────────────
function initDownloadTracking() {
  document.querySelectorAll('a[href$=".pdf"],a[href$=".xlsx"],a[href$=".docx"],a[href$=".zip"],[data-track-download]').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('download', {
        file: link.getAttribute('href'),
        label: link.textContent.trim().slice(0, 80),
        page: getCurrentPage()
      });
    });
  });

  // Tentative d'accès section documents protégée
  const pwd = document.querySelector('input[type="password"]');
  if (pwd) {
    pwd.addEventListener('focus', () => sendEvent('documents_password_attempt', { page: getCurrentPage() }));
  }
}

// ────────────────────────────────────────────────────────────────
// CLICS CLÉS (projets, contact, veille)
// ────────────────────────────────────────────────────────────────
function initKeyClickTracking() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes('cashcontrol')) link.addEventListener('click', () => sendEvent('projet_card_clicked', { projet: 'cashcontrol', label: 'Cash Control' }));
    if (href.includes('cinema'))      link.addEventListener('click', () => sendEvent('projet_card_clicked', { projet: 'cinema',      label: 'Cinéma' }));
    if (href.includes('sudo_sante'))  link.addEventListener('click', () => sendEvent('projet_card_clicked', { projet: 'sudo_sante',  label: 'Sudo Santé' }));
    if (href.includes('veille'))      link.addEventListener('click', () => sendEvent('veille_clicked', {}));
    if (href.includes('linkedin'))    link.addEventListener('click', () => sendEvent('contact_linkedin_clicked', {}));
    if (href.startsWith('mailto'))    link.addEventListener('click', () => sendEvent('contact_email_clicked', {}));
  });
}

// ────────────────────────────────────────────────────────────────
// RAGE CLICKS
// ────────────────────────────────────────────────────────────────
function initRageClickTracking() {
  const clicks = [];
  document.addEventListener('click', e => {
    const now = Date.now();
    clicks.push({ t: now });
    const recent = clicks.filter(c => now - c.t < 2000);
    clicks.length = 0;
    recent.forEach(c => clicks.push(c));
    if (recent.length >= 4) sendEvent('rage_click', { count: recent.length, page: getCurrentPage() });
  });
}

// ────────────────────────────────────────────────────────────────
// PROFIL JURY (calculé après 30s)
// ────────────────────────────────────────────────────────────────
function computeVisitorProfile() {
  setTimeout(() => {
    let score = 0;
    const signals = [];

    if (isReturning()) { score += 20; signals.push('returning'); }

    const elapsed = Math.round((Date.now() - SESSION_START) / 1000);
    if (elapsed > 90)      { score += 20; signals.push('long_visit'); }
    else if (elapsed > 45) { score += 10; signals.push('medium_visit'); }

    JURY_SENSITIVE.forEach(id => {
      if (sectionTimers[id] && sectionTimers[id].visits > 0) {
        score += 10; signals.push('visited_' + id);
      }
    });

    const revisits = Object.values(sectionTimers).filter(t => t.visits > 1).length;
    if (revisits > 0) { score += revisits * 5; signals.push('revisits_' + revisits); }

    const h = new Date().getHours();
    if (h >= 8 && h <= 18) { score += 10; signals.push('business_hours'); }

    const page = getCurrentPage();
    if (['projet_cashcontrol','projet_cinema','projet_sudosante','veille'].includes(page)) {
      score += 10; signals.push('visited_project_page');
    }

    let profile = 'casual_visitor';
    if (score >= 60)       profile = 'likely_jury';
    else if (score >= 40)  profile = 'serious_evaluator';
    else if (score >= 25)  profile = 'interested_visitor';
    else if (elapsed < 15) profile = 'bounce';

    sendEvent('visitor_profile_computed', { profile, score, signals, page });
  }, 30000);
}

// ────────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  initSections();
  initProjectPageTracking();
  initScrollTracking();
  initTextSelectionTracking();
  initDownloadTracking();
  initKeyClickTracking();
  initRageClickTracking();
  computeVisitorProfile();
});

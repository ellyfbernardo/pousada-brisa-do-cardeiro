/* Pousada Brisa do Cardeiro — interações do site */
(function () {
  'use strict';

  var WA_NUMBER = '5584994401796';
  var SUPPORTED = ['pt', 'en', 'es'];
  var HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };
  var LOCALE = { pt: 'pt-BR', en: 'en-GB', es: 'es-ES' };
  var DICT = window.I18N || {};

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var storage = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* modo privado */ } }
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Idiomas — o português vem do próprio HTML
     ------------------------------------------------------------------ */
  var base = {};
  var lang = 'pt';

  function parseAttrMap(str) {
    return str.split(';').map(function (pair) {
      var i = pair.indexOf(':');
      return [pair.slice(0, i).trim(), pair.slice(i + 1).trim()];
    }).filter(function (p) { return p[0] && p[1]; });
  }

  function captureBase() {
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in base)) base[k] = el.textContent.trim();
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (!(k in base)) base[k] = el.innerHTML.trim();
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      parseAttrMap(el.getAttribute('data-i18n-attr')).forEach(function (p) {
        if (!(p[1] in base)) base[p[1]] = el.getAttribute(p[0]) || '';
      });
    });
  }

  function t(key) {
    var d = DICT[lang];
    if (d && d[key] != null) return d[key];
    if (base[key] != null) return base[key];
    if (DICT.pt && DICT.pt[key] != null) return DICT.pt[key];
    return key;
  }

  function detectLang() {
    var param = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED.indexOf(param) > -1) return param;
    var saved = storage.get('bdc-lang');
    if (SUPPORTED.indexOf(saved) > -1) return saved;
    // Robôs de busca sempre leem a versão em português
    if (/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|whatsapp/i.test(navigator.userAgent)) return 'pt';
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'pt').toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt';
    if (nav.indexOf('es') === 0) return 'es';
    return 'en';
  }

  function applyLang(next, opts) {
    lang = SUPPORTED.indexOf(next) > -1 ? next : 'pt';
    document.documentElement.lang = HTML_LANG[lang];

    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    $$('[data-i18n-attr]').forEach(function (el) {
      parseAttrMap(el.getAttribute('data-i18n-attr')).forEach(function (p) { el.setAttribute(p[0], t(p[1])); });
    });
    $$('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    updateMenuLabel();
    updateWaLinks();
    clearErrors();

    if (opts && opts.persist) {
      storage.set('bdc-lang', lang);
      try {
        var url = new URL(window.location.href);
        if (lang === 'pt') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      } catch (e) { /* file:// ou navegador antigo */ }
    }
  }

  /* ------------------------------------------------------------------
     WhatsApp
     ------------------------------------------------------------------ */
  function waUrl(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  function roomName(id) {
    return id === 'casal' ? t('rooms.casal.name') : id === 'familia' ? t('rooms.familia.name') : t('msg.room.any');
  }

  function updateWaLinks() {
    $$('[data-wa]').forEach(function (a) {
      var kind = a.getAttribute('data-wa');
      var text = kind === 'room' ? t('msg.room').replace('{room}', roomName(a.getAttribute('data-room')))
        : kind === 'tips' ? t('msg.tips')
        : t('msg.greeting');
      a.href = waUrl(text);
    });
  }

  function openWhatsApp(text) {
    var url = waUrl(text);
    var win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (e) { /* ignore */ } } else { window.location.href = url; }
  }

  /* ------------------------------------------------------------------
     Datas
     ------------------------------------------------------------------ */
  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function parseISO(iso) {
    var p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function addDays(iso, n) {
    var d = parseISO(iso);
    d.setDate(d.getDate() + n);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function nightsBetween(a, b) {
    return Math.round((parseISO(b) - parseISO(a)) / 864e5);
  }

  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(parseISO(iso));
    } catch (e) {
      return iso.split('-').reverse().join('/');
    }
  }

  function linkDates(inEl, outEl) {
    if (!inEl || !outEl) return;
    var today = todayISO();
    inEl.min = today;
    outEl.min = addDays(today, 1);
    inEl.addEventListener('change', function () {
      if (!inEl.value) return;
      var minOut = addDays(inEl.value, 1);
      outEl.min = minOut;
      if (!outEl.value || outEl.value < minOut) outEl.value = minOut;
    });
  }

  function validateDates(inEl, outEl) {
    [inEl, outEl].forEach(function (el) { el.removeAttribute('aria-invalid'); });
    if (!inEl.value || !outEl.value) {
      (inEl.value ? outEl : inEl).setAttribute('aria-invalid', 'true');
      return t('err.dates');
    }
    if (inEl.value < todayISO()) { inEl.setAttribute('aria-invalid', 'true'); return t('err.past'); }
    if (outEl.value <= inEl.value) { outEl.setAttribute('aria-invalid', 'true'); return t('err.order'); }
    return '';
  }

  function showError(form, msg) {
    var box = $('.form-error', form);
    if (!box) return;
    box.textContent = msg;
    box.hidden = !msg;
  }

  function clearErrors() {
    $$('.form-error').forEach(function (b) { b.hidden = true; b.textContent = ''; });
    $$('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  function stayLines(inISO, outISO) {
    var n = nightsBetween(inISO, outISO);
    return [
      '• ' + t('msg.checkin') + ': ' + fmtDate(inISO),
      '• ' + t('msg.checkout') + ': ' + fmtDate(outISO) + ' (' + n + ' ' + (n === 1 ? t('msg.night') : t('msg.nights')) + ')'
    ];
  }

  /* Consulta rápida (hero) */
  function initQuickBooking() {
    var form = $('#quick-booking');
    if (!form) return;
    var inEl = $('#qb-in'), outEl = $('#qb-out'), guests = $('#qb-guests');
    linkDates(inEl, outEl);

    // Leva as datas escolhidas para o formulário completo
    var sync = [[inEl, '#bf-in'], [outEl, '#bf-out']];
    sync.forEach(function (pair) {
      pair[0].addEventListener('change', function () {
        var target = $(pair[1]);
        if (target) { target.value = pair[0].value; target.dispatchEvent(new Event('change')); }
        if (pair[0] === inEl) { var o = $('#bf-out'); if (o) o.value = outEl.value; }
      });
    });
    guests.addEventListener('change', function () { var a = $('#bf-adults'); if (a) a.value = guests.value; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = validateDates(inEl, outEl);
      showError(form, err);
      if (err) return;
      var lines = [t('msg.request'), ''].concat(stayLines(inEl.value, outEl.value), ['• ' + t('msg.guests') + ': ' + guests.value]);
      openWhatsApp(lines.join('\n'));
    });
  }

  /* Formulário completo */
  function initBookingForm() {
    var form = $('#booking-form');
    if (!form) return;
    var inEl = $('#bf-in'), outEl = $('#bf-out');
    linkDates(inEl, outEl);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = validateDates(inEl, outEl);
      showError(form, err);
      if (err) { (inEl.getAttribute('aria-invalid') ? inEl : outEl).focus(); return; }

      var name = form.elements.name.value.trim();
      var adults = form.elements.adults.value;
      var children = form.elements.children.value;
      var room = form.elements.room.value;
      var message = form.elements.message.value.trim();

      var lines = [t('msg.request'), ''];
      if (name) lines.push('• ' + t('msg.name') + ': ' + name);
      lines = lines.concat(stayLines(inEl.value, outEl.value));
      lines.push('• ' + t('msg.adults') + ': ' + adults);
      if (children !== '0') lines.push('• ' + t('msg.children') + ': ' + children);
      lines.push('• ' + t('msg.room.label') + ': ' + roomName(room));
      if (message) lines.push('', t('msg.message') + ': ' + message);
      openWhatsApp(lines.join('\n'));
    });
  }

  /* ------------------------------------------------------------------
     Cabeçalho e menu mobile
     ------------------------------------------------------------------ */
  var header = $('.site-header');
  var nav = $('#menu');
  var toggle = $('.menu-toggle');

  function updateMenuLabel() {
    if (!toggle) return;
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
  }

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    updateMenuLabel();
  }

  function initHeader() {
    var waFloat = $('.wa-float');
    var footer = $('.site-footer');
    var ticking = false;

    function onScroll() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-solid', y > 40);
      if (waFloat && footer) {
        var nearFooter = footer.getBoundingClientRect().top < window.innerHeight - 40;
        waFloat.classList.toggle('is-hidden', nearFooter);
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toggle) {
      toggle.addEventListener('click', function () {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
      });
    }
    if (nav) {
      $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    var desktop = window.matchMedia('(min-width: 1100px)');
    var onDesktop = function (mq) { if (mq.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop); else if (desktop.addListener) desktop.addListener(onDesktop);

    $$('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang'), { persist: true }); });
    });
  }

  /* Destaca no menu a seção visível */
  function initActiveSection() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.main-nav-list a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = map[en.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------
     Animações de entrada
     ------------------------------------------------------------------ */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------ */
  var lb = $('#lightbox');
  var lbImg = lb && $('.lb-img', lb);
  var lbCap = lb && $('.lb-caption', lb);
  var lbCount = lb && $('.lb-count', lb);
  var lbItems = [];
  var lbIndex = 0;

  function lbRender() {
    var img = lbItems[lbIndex];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lbCount.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
  }

  function lbOpen(images, index) {
    if (!lb || typeof lb.showModal !== 'function') return;
    lbItems = images;
    lbIndex = index;
    lbRender();
    lb.showModal();
    document.documentElement.style.overflow = 'hidden';
  }

  function lbStep(dir) {
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    lbRender();
  }

  function initLightbox() {
    if (!lb) return;
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    $('.lb-prev', lb).addEventListener('click', function () { lbStep(-1); });
    $('.lb-next', lb).addEventListener('click', function () { lbStep(1); });
    lb.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbStep(-1);
      if (e.key === 'ArrowRight') lbStep(1);
    });
    var startX = null;
    lb.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
    });

    var galleryImgs = $$('.g-item img');
    $$('.g-item').forEach(function (btn, i) {
      btn.addEventListener('click', function () { lbOpen(galleryImgs, i); });
    });
  }

  /* ------------------------------------------------------------------
     Carrosséis das suítes
     ------------------------------------------------------------------ */
  function initCarousels() {
    $$('[data-carousel]').forEach(function (root) {
      var track = $('.carousel-track', root);
      var slides = $$('.carousel-slide', root);
      var prev = $('.carousel-btn--prev', root);
      var next = $('.carousel-btn--next', root);
      var dotsBox = $('.carousel-dots', root);
      var imgs = slides.map(function (s) { return $('img', s); });

      var dots = slides.map(function (_, i) {
        var d = document.createElement('span');
        if (i === 0) d.className = 'is-active';
        dotsBox.appendChild(d);
        return d;
      });

      function current() { return Math.round(track.scrollLeft / track.clientWidth); }
      function go(i) {
        var idx = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: idx * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      function update() {
        var i = current();
        dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
        prev.disabled = i <= 0;
        next.disabled = i >= slides.length - 1;
      }

      prev.addEventListener('click', function () { go(current() - 1); });
      next.addEventListener('click', function () { go(current() + 1); });
      track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      });
      slides.forEach(function (s, i) {
        s.addEventListener('click', function () { lbOpen(imgs, i); });
      });
      update();
    });
  }

  /* ------------------------------------------------------------------
     Início
     ------------------------------------------------------------------ */
  function init() {
    captureBase();
    applyLang(detectLang(), { persist: false });
    initHeader();
    initActiveSection();
    initReveal();
    initLightbox();
    initCarousels();
    initQuickBooking();
    initBookingForm();
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

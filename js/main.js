document.addEventListener('DOMContentLoaded', () => {

  // iOS Safari включает :active (подсветку при нажатии) только при наличии touch-обработчика
  document.addEventListener('touchstart', () => {}, { passive: true });

  /* ---------- Шапка: фон плотнее после прокрутки (где баннер заходит под шапку) ---------- */
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер-меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const toggleMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => toggleMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) toggleMenu(false); });

  /* ---------- Выпадающие пункты меню: мегаменю «Каталог» и «Услуги» (на десктопе — по наведению) ---------- */
  const desktop = window.matchMedia('(min-width: 1025px)');
  const drops = [];
  document.querySelectorAll('.nav__drop-btn').forEach((btn) => {
    const item = btn.closest('.nav__item');
    let timer = 0;
    const setDrop = (open) => { clearTimeout(timer); btn.setAttribute('aria-expanded', open); };
    drops.push(setDrop);
    btn.addEventListener('click', () => setDrop(btn.getAttribute('aria-expanded') !== 'true'));
    // При уходе курсора меню закрывается с задержкой: можно спокойно вести мышь к списку,
    // даже медленно или наискосок через промежуток под пунктом
    item.addEventListener('mouseenter', () => {
      if (!desktop.matches) return;
      drops.forEach((d) => { if (d !== setDrop) d(false); });
      setDrop(true);
    });
    item.addEventListener('mouseleave', () => {
      if (!desktop.matches) return;
      clearTimeout(timer);
      timer = setTimeout(() => btn.setAttribute('aria-expanded', 'false'), 350);
    });
    item.addEventListener('focusout', (e) => { if (desktop.matches && !item.contains(e.relatedTarget)) setDrop(false); });
    document.addEventListener('click', (e) => { if (desktop.matches && !item.contains(e.target)) setDrop(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrop(false); });
  });

  /* ---------- Видеобаннер ---------- */
  const video = document.getElementById('heroVideo');
  if (video) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    } else if ('IntersectionObserver' in window) {
      // Видео играет только когда видно на экране — экономит батарею и трафик
      new IntersectionObserver(([entry]) => {
        entry.isIntersecting ? video.play().catch(() => {}) : video.pause();
      }, { threshold: 0.2 }).observe(video);
    }
  }

  /* ---------- Слайдер (нативный scroll-snap + стрелки) ---------- */
  // Если карточек больше, чем помещается, — обычная прокрутка; стрелка на краю темнее (disabled).
  // Если все карточки видны (например, 5 проектов на широком экране), «вперёд» по макету активна
  // и перекладывает первую карточку в конец, «назад» возвращает её — лента листается по кругу.
  const sliders = new Map();
  document.querySelectorAll('[data-slider-prev], [data-slider-next]').forEach((btn) => {
    const id = btn.dataset.sliderPrev || btn.dataset.sliderNext;
    if (!sliders.has(id)) sliders.set(id, { el: document.getElementById(id), prev: [], next: [], shift: 0 });
    sliders.get(id)[btn.dataset.sliderPrev ? 'prev' : 'next'].push(btn);
  });
  sliders.forEach((sl) => {
    const { el } = sl;
    const fits = () => el.scrollWidth - el.clientWidth <= 1;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth - 1;
      const prevOff = fits() ? sl.shift === 0 : el.scrollLeft <= 0;
      const nextOff = fits() ? false : el.scrollLeft >= max;
      sl.prev.forEach((b) => { b.disabled = prevOff; });
      sl.next.forEach((b) => { b.disabled = nextOff; });
    };
    const rotate = (dir) => {
      el.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 350, easing: 'ease' });
      setTimeout(() => {
        const n = el.children.length;
        if (dir > 0) el.append(el.firstElementChild); else el.prepend(el.lastElementChild);
        sl.shift = (sl.shift + dir + n) % n;
        update();
      }, 120);
    };
    const step = (dir) => {
      if (fits()) { rotate(dir); return; }
      const card = el.firstElementChild;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' });
    };
    sl.prev.forEach((b) => b.addEventListener('click', () => step(-1)));
    sl.next.forEach((b) => b.addEventListener('click', () => step(1)));
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Полоса прогресса слайдера «Как мы работаем» ---------- */
  const steps = document.getElementById('stepsSlider');
  const stepsBar = document.querySelector('.steps-nav__bar span');
  if (steps && stepsBar) {
    const updateBar = () => {
      const max = steps.scrollWidth - steps.clientWidth;
      const k = max > 0 ? steps.clientWidth / steps.scrollWidth : 1;
      stepsBar.style.setProperty('--size', k * 100 + '%');
      stepsBar.style.setProperty('--size-k', k);
      stepsBar.style.setProperty('--pos', max > 0 ? steps.scrollLeft / max : 0);
    };
    steps.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ---------- Бегущая строка логотипов: дублируем ряд для бесшовной анимации ---------- */
  const logos = document.getElementById('logos');
  if (logos) {
    const originals = [...logos.children];
    originals.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      logos.append(copy);
    });
    // Цвет логотипа включает скрипт по координатам курсора — без :hover и событий
    // входа/выхода: лента едет под курсором, и браузеры шлют эти события непоследовательно.
    // Каждый кадр: цветной только логотип под курсором (вместе с копией — на стыке круга
    // под курсором оказывается копия); ушёл курсор с логотипа или из ленты → снова серый.
    // Класс меняется только при смене состояния, чтобы переход не перезапускался.
    const items = [...logos.children];
    const marquee = logos.closest('.marquee');
    const n = originals.length;
    const active = new Set();
    let pointer = null;
    const setActive = (i, on) => {
      if (on === active.has(i)) return;
      if (on) active.add(i); else active.delete(i);
      items[i].classList.toggle('is-active', on);
      items[i + n].classList.toggle('is-active', on);
    };
    const tick = () => {
      requestAnimationFrame(tick);
      const box = marquee.getBoundingClientRect();
      const inside = pointer && pointer.x >= box.left && pointer.x <= box.right
        && pointer.y >= box.top && pointer.y <= box.bottom;
      const hovered = new Set();
      if (inside) {
        items.forEach((item, k) => {
          const r = item.getBoundingClientRect();
          if (pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom) hovered.add(k % n);
        });
      }
      active.forEach((i) => { if (!hovered.has(i)) setActive(i, false); });
      hovered.forEach((i) => setActive(i, true));
    };
    window.addEventListener('pointermove', (e) => {
      pointer = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { pointer = null; });
    requestAnimationFrame(tick);
  }

  /* ---------- Карточка «Наши партнёры» (склад): две бегущие строки, цвет по координатам курсора ---------- */
  const wRows = [...document.querySelectorAll('.w-marq')].map((row) => {
    const track = row.querySelector('.w-marq__track');
    [...track.children].forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });
    return { row, items: [...track.children], n: track.children.length / 2 };
  });
  if (wRows.length) {
    let wp = null;
    window.addEventListener('pointermove', (e) => {
      wp = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { wp = null; });
    const wTick = () => {
      requestAnimationFrame(wTick);
      wRows.forEach(({ row, items, n }) => {
        const b = row.getBoundingClientRect();
        const inRow = wp && wp.x >= b.left && wp.x <= b.right && wp.y >= b.top && wp.y <= b.bottom;
        items.forEach((item, k) => {
          let on = false;
          if (inRow) {
            const r = item.getBoundingClientRect();
            on = wp.x >= r.left && wp.x <= r.right && wp.y >= r.top && wp.y <= r.bottom;
          }
          item.classList.toggle('is-hot', on);
        });
        // цвет держим на паре (оригинал + копия), чтобы на стыке не мигал
        for (let i = 0; i < n; i++) {
          const on = items[i].classList.contains('is-hot') || items[i + n].classList.contains('is-hot');
          if (items[i].classList.contains('is-active') !== on) { items[i].classList.toggle('is-active', on); items[i + n].classList.toggle('is-active', on); }
        }
      });
    };
    requestAnimationFrame(wTick);
  }

  /* ---------- Выпадающий список «Тип склада» (по UI kit, с клавиатурой) ---------- */
  const selects = [...document.querySelectorAll('[data-select]')].map((root) => {
    const btn = root.querySelector('.form__select-btn');
    const list = root.querySelector('.form__options');
    const value = root.querySelector('.form__select-value');
    const input = root.querySelector('input[type="hidden"]');
    const options = [...list.querySelectorAll('[role="option"]')];
    const placeholder = value.textContent;
    let focused = -1;

    const focusOption = (i) => {
      options.forEach((o) => o.classList.remove('is-focused'));
      focused = (i + options.length) % options.length;
      options[focused].classList.add('is-focused');
      list.setAttribute('aria-activedescendant', options[focused].id);
    };
    const open = () => {
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      const sel = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
      focusOption(sel >= 0 ? sel : 0);
      list.focus({ preventScroll: true });
    };
    const close = (returnFocus) => {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus({ preventScroll: true });
    };
    const choose = (val) => {
      const opt = options.find((o) => o.dataset.value === val);
      options.forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
      input.value = opt ? val : '';
      value.textContent = opt ? opt.textContent : placeholder;
    };

    btn.addEventListener('click', () => (list.hidden ? open() : close(true)));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    list.addEventListener('click', (e) => {
      const opt = e.target.closest('[role="option"]');
      if (!opt) return;
      choose(opt.dataset.value);
      close(true);
    });
    list.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(focused + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusOption(focused - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[focused].dataset.value); close(true); }
      else if (e.key === 'Escape') { close(true); }
      else if (e.key === 'Tab') { close(false); }
    });
    document.addEventListener('click', (e) => { if (!root.contains(e.target) && !list.hidden) close(false); });
    return { name: input.name, choose };
  });

  /* ---------- Плитки «Какой склад» подставляют тип склада в форму ---------- */
  document.querySelectorAll('[data-warehouse]').forEach((tile) => {
    tile.addEventListener('click', () => {
      const select = selects.find((sel) => sel.name === 'warehouse');
      if (select) select.choose(tile.dataset.warehouse);
    });
  });

  /* ---------- Маска телефона ---------- */
  document.querySelectorAll('[data-phone]').forEach((input) => {
    const format = (value) => {
      let d = value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      let out = '+7';
      if (p[0]) out += ` (${p[0]}`;
      if (p[0].length === 3) out += ')';
      if (p[1]) out += ` ${p[1]}`;
      if (p[2]) out += `-${p[2]}`;
      if (p[3]) out += `-${p[3]}`;
      return out;
    };
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7'; });
    input.addEventListener('blur', () => { if (input.value === '+7') input.value = ''; });
    input.addEventListener('input', () => { input.value = format(input.value); });
  });

  /* ---------- Форма заявки ---------- */
  const form = document.getElementById('requestForm');
  if (form) {
    // ошибка снимается, как только номер введён полностью
    form.elements.phone.addEventListener('input', (e) => {
      const field = e.target.closest('.form__field');
      if (field.classList.contains('is-invalid') && e.target.value.replace(/\D/g, '').length === 11) field.classList.remove('is-invalid');
    });
    form.elements.agree.addEventListener('change', (e) => {
      if (e.target.checked) { e.target.closest('.form__check').classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false'); }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = form.elements.phone;
      const agree = form.elements.agree;
      const phoneOk = phone.value.replace(/\D/g, '').length === 11;

      phone.closest('.form__field').classList.toggle('is-invalid', !phoneOk);
      agree.closest('.form__check').classList.toggle('is-invalid', !agree.checked);
      phone.setAttribute('aria-invalid', String(!phoneOk));
      agree.setAttribute('aria-invalid', String(!agree.checked));
      if (!phoneOk) { phone.focus(); return; }
      if (!agree.checked) return;

      // TODO: отправка на бэкенд заказчика (fetch / обработчик CMS)
      const ok = form.querySelector('.form__success');
      ok.hidden = false;
      clearTimeout(form._okTimer);
      form._okTimer = setTimeout(() => { ok.hidden = true; }, 8000);
      form.reset();
      selects.forEach((sel) => sel.choose(''));
    });
  }
});

/* Плавная прокрутка колесом мыши. Якорные ссылки плавно ведёт CSS (scroll-behavior), здесь — инерция при вращении колеса.
   Отключается при prefers-reduced-motion, на сенсорных экранах, внутри прокручиваемых блоков, iframe, 3D и карт. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  var root = document.documentElement;
  var target = window.scrollY, current = target, raf = 0;
  var EASE = 0.12;
  var max = function () { return Math.max(0, root.scrollHeight - window.innerHeight); };

  function inner(el) {
    for (var n = el; n && n !== document.body && n !== root; n = n.parentElement) {
      if (n.matches && n.matches('iframe, model-viewer, canvas, textarea, select, [data-no-smooth]')) return true;
      var cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return true;
    }
    return false;
  }
  function step() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.4) { current = target; raf = 0; } else { raf = requestAnimationFrame(step); }
    window.scrollTo({ top: current, behavior: 'instant' });
  }
  window.addEventListener('wheel', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.shiftKey || e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.body.classList.contains('menu-open') || document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])')) return;
    if (inner(e.target)) return;
    e.preventDefault();
    var unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
    push(e.deltaY * unit);
  }, { passive: false });
  function push(dy) {
    if (!raf) { current = window.scrollY; target = current; }
    target = Math.min(max(), Math.max(0, target + dy));
    if (!raf) raf = requestAnimationFrame(step);
  }
  window.__smoothPush = push;
  /* прокрутка другими способами (якоря, клавиши, полоса) — синхронизируем цель */
  window.addEventListener('scroll', function () { if (!raf) { current = target = window.scrollY; } }, { passive: true });
})();

/* Колесо мыши над 3D-конфигуратором (iframe) пересылается сюда, чтобы страница листалась так же плавно, как вне него */
window.addEventListener('message', function (e) {
  var d = e.data;
  if (!d || typeof d.rkWheel !== 'number') return;
  if (window.__smoothPush) window.__smoothPush(d.rkWheel); else window.scrollBy({ top: d.rkWheel, behavior: 'instant' });
});

/* Запрет масштабирования страницы пальцами (щипок, двойной тап). Исключение — страницы с метой viewport без user-scalable=no
   (3D-модель) и конфигураторы в iframe: события внутри iframe в этот документ не попадают. */
(function () {
  var vp = document.querySelector('meta[name="viewport"]');
  if (!vp || !/user-scalable\s*=\s*no/.test(vp.content)) return;
  var stop = function (e) { e.preventDefault(); };
  document.addEventListener('gesturestart', stop);
  document.addEventListener('gesturechange', stop);
  document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  var last = 0;
  document.addEventListener('touchend', function (e) {
    var t = Date.now();
    if (t - last < 300 && !(e.target.closest && e.target.closest('a, button, input, select, textarea, label, summary'))) e.preventDefault();
    last = t;
  }, { passive: false });
})();

/* Текущий пункт меню: на боевом сайте совпадает путь страницы; map нужен только для статичной вёрстки (файлы *.html). */
(function () {
  var map = { 'o-kompanii.html': '/about/', 'uslugi.html': '/services/', 'dokumentatsiya.html': '/dokumentatsiya/', 'blog.html': '/blog/', 'partnery.html': '/about/' };
  var norm = function (p) { return p.replace(/\/?$/, '/'); };
  var cur = norm(map[location.pathname.split('/').pop()] || location.pathname);
  document.querySelectorAll('.nav__list > .nav__item > a.nav__link').forEach(function (a) {
    if (norm(a.getAttribute('href') || '') === cur) { a.classList.add('is-current'); a.setAttribute('aria-current', 'page'); }
  });
})();

/* Короткие тексты (до 3 строк) не растягиваем по ширине — иначе в строках появляются огромные пробелы */
(function () {
  var SEL = 'main p, .faq__a p, .footer__slogan';
  function fix() {
    var els = document.querySelectorAll(SEL);
    els.forEach(function (e) { e.style.removeProperty('text-align'); e.style.removeProperty('hyphens'); });
    els.forEach(function (e) {
      var cs = getComputedStyle(e);
      if (cs.textAlign !== 'justify') return;
      var lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      var h = e.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (h > 0 && Math.round(h / lh) <= 3) {
        e.style.setProperty('text-align', 'left', 'important');
        e.style.setProperty('hyphens', 'manual', 'important');
      }
    });
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(fix, 150); }
  window.addEventListener('resize', later);
  document.addEventListener('click', later);
  window.addEventListener('load', fix);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fix);
  fix();
})();
/* ---------- Мобильные компоненты: лента «лево-право» и «Читать полностью» ---------- */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');
  var L = '<svg viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6H1M6 1L1 6l5 5"/></svg>';
  var R = '<svg viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6h14M10 1l5 5-5 5"/></svg>';

  function initRail(el) {
    var chips = el.getAttribute('data-rail') === 'chips';
    var nav, prev, next, bar, count;
    if (!chips) {
      nav = document.createElement('div');
      nav.className = 'rail-nav';
      nav.innerHTML = '<button class="rail-nav__btn" type="button" aria-label="Назад">' + L + '</button>' +
        '<div class="rail-nav__bar" aria-hidden="true"><span></span></div>' +
        '<button class="rail-nav__btn" type="button" aria-label="Вперёд">' + R + '</button>' +
        '<span class="rail-nav__count" aria-live="polite"></span>';
      el.after(nav);
      var b = nav.querySelectorAll('.rail-nav__btn');
      prev = b[0]; next = b[1]; bar = nav.querySelector('.rail-nav__bar'); count = nav.querySelector('.rail-nav__count');
      var step = function (dir) {
        var c = el.firstElementChild;
        var gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        el.scrollBy({ left: dir * (c.offsetWidth + gap), behavior: 'smooth' });
      };
      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
    }
    function update() {
      var max = el.scrollWidth - el.clientWidth;
      if (chips) { el.classList.toggle('is-end', max <= 1 || el.scrollLeft >= max - 1); return; }
      var fit = max <= 1 || !mq.matches;
      nav.classList.toggle('is-fit', fit);
      if (fit) return;
      prev.disabled = el.scrollLeft <= 1;
      next.disabled = el.scrollLeft >= max - 1;
      var rows = parseInt(el.getAttribute('data-rail-rows'), 10) || 1;
      var kids = el.children, n = Math.ceil(kids.length / rows), idx = 0;
      if (el.scrollLeft >= max - 1) idx = n - 1;
      else {
        var base = el.getBoundingClientRect().left, best = 1e9;
        for (var i = 0; i < kids.length; i += rows) {
          var d = Math.abs(kids[i].getBoundingClientRect().left - base);
          if (d < best) { best = d; idx = i / rows; }
        }
      }
      count.textContent = (idx + 1) + ' / ' + n;
      var bw = bar.clientWidth, thumb = Math.max(24, bw * el.clientWidth / el.scrollWidth);
      bar.style.setProperty('--w', thumb + 'px');
      bar.style.setProperty('--x', (bw - thumb) * el.scrollLeft / max + 'px');
    }
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(el);
    if (chips) {
      var act = el.querySelector('.is-active, [aria-current], [aria-selected="true"]');
      if (act && mq.matches) el.scrollLeft = act.offsetLeft - (el.clientWidth - act.offsetWidth) / 2;
    }
    update();
  }
  document.querySelectorAll('[data-rail]').forEach(initRail);

  document.querySelectorAll('[data-collapse]').forEach(function (box, i) {
    var all = box.getAttribute('data-collapse') === 'all';
    var lines = parseInt(box.getAttribute('data-collapse-lines'), 10) || 4;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'collapse-btn'; btn.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (!box.id) box.id = 'collapse-' + (i + 1);
    btn.setAttribute('aria-controls', box.id);
    var more = box.getAttribute('data-more') || 'Читать полностью';
    var less = box.getAttribute('data-less') || 'Свернуть';
    btn.textContent = more;
    box.after(btn);
    var open = false, lim = 0;
    function limit() {
      var p = box.querySelector('p') || box, cs = getComputedStyle(p);
      if (box.getAttribute('data-collapse-height')) return parseInt(box.getAttribute('data-collapse-height'), 10);
      return Math.round((parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3) * lines);
    }
    function apply() {
      box.classList.remove('is-clamped', 'is-collapsed');
      box.style.maxHeight = '';
      btn.hidden = true;
      if (!(all || mq.matches)) return;
      lim = limit();
      if (box.scrollHeight <= lim * 1.3) return;
      btn.hidden = false;
      if (!open) { box.classList.add('is-clamped', 'is-collapsed'); box.style.maxHeight = lim + 'px'; }
    }
    btn.addEventListener('click', function () {
      open = !open;
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? less : more;
      box.classList.add('is-clamped');
      if (open) {
        box.classList.remove('is-collapsed');
        box.style.maxHeight = box.scrollHeight + 'px';
      } else {
        box.style.maxHeight = box.scrollHeight + 'px';
        void box.offsetHeight;
        box.classList.add('is-collapsed');
        box.style.maxHeight = lim + 'px';
        var r = box.getBoundingClientRect();
        if (r.top < 0) window.scrollBy({ top: r.top - 80, behavior: 'smooth' });
      }
    });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(apply, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    apply();
  });
})();
/* ---------- Мобильные длинные списки карточек: первая видна, вторая под затемнением, стрелка раскрытия ---------- */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');
  var SEL = '[data-tabsel], .cats, .w-types__grid, .m-adv, .m-cards, .sv-grid--4, .sv-grid--3, .sv-steps, .sv-mini, .tz-list, .tz-steps, .sv-org, .sv-cards4, .dp-when__list, .sv-stats, .geo__stats, .dc-list, .sv-hero__inner > .sv-plaques, .mb-uses__list, .dp-uses, .rk-where__list, .rk-accs, .w-trust';
  document.querySelectorAll(SEL).forEach(function (ul, i) {
    if (ul.hasAttribute('data-rail') || ul.closest('[data-rail]')) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tabsel-toggle'; btn.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Показать все');
    if (!ul.id) ul.id = 'peek-' + (i + 1);
    btn.setAttribute('aria-controls', ul.id);
    ul.after(btn);
    ul.classList.add('is-peek');
    ul.querySelectorAll('[data-tabsel] br, .sv-tab br').forEach(function (b) { b.replaceWith(' '); });
    var open = false;
    function kids() { return Array.prototype.filter.call(ul.children, function (c) { return c.offsetHeight > 0; }); }
    function collapsedH(k) {
      var t0 = k[0].getBoundingClientRect().top, t2 = null, h2 = 0, i;
      for (i = 0; i < k.length; i++) { var r = k[i].getBoundingClientRect(); if (r.top > t0 + 2) { t2 = r.top; break; } }
      if (t2 === null) return 0;
      for (i = 0; i < k.length; i++) { var q = k[i].getBoundingClientRect(); if (Math.abs(q.top - t2) < 3) h2 = Math.max(h2, q.height); }
      return Math.round(t2 - t0 + h2 * 0.62);
    }
    function apply() {
      ul.classList.remove('is-collapsed'); ul.style.maxHeight = '';
      btn.hidden = true;
      if (!mq.matches) return;
      var k = kids();
      if (k.length < 3) return;
      var ch = collapsedH(k);
      if (!ch || ul.scrollHeight < ch * 1.4) return;
      btn.hidden = false;
      if (open) ul.style.maxHeight = ul.scrollHeight + 'px';
      else { ul.classList.add('is-collapsed'); ul.style.maxHeight = ch + 'px'; }
    }
    function set(o) {
      open = o;
      btn.setAttribute('aria-expanded', String(o));
      btn.setAttribute('aria-label', o ? 'Свернуть' : 'Показать все');
      var k = kids();
      ul.classList.toggle('is-collapsed', !o);
      if (o) { ul.style.maxHeight = ul.scrollHeight + 'px'; clearTimeout(ul._rel); ul._rel = setTimeout(function () { if (open) ul.style.maxHeight = 'none'; }, 380); }
      else { clearTimeout(ul._rel); ul.style.maxHeight = ul.scrollHeight + 'px'; void ul.offsetHeight; ul.style.maxHeight = collapsedH(k) + 'px'; }
      if (!o) { var r = ul.getBoundingClientRect(); if (r.top < 0) window.scrollBy({ top: r.top - 90, behavior: 'smooth' }); }
    }
    btn.addEventListener('click', function () { set(!open); });
    if (ul.hasAttribute('data-tabsel')) ul.addEventListener('click', function (e) {
      if (e.target.closest('button') && mq.matches && open) setTimeout(function () { set(false); }, 0);
    });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(apply, 120); });
    if (window.MutationObserver) new MutationObserver(function () { open = false; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Показать все'); apply(); }).observe(ul, { childList: true });
    window.addEventListener('load', apply);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    apply();
  });
})();

/* ---------- Партнёры (мобильная): бегущая карусель с ручной прокруткой ---------- */
(function () {
  var box = document.querySelector('.sv-partners');
  if (!box) return;
  var mq = window.matchMedia('(max-width: 768px)');
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var orig = Array.prototype.slice.call(box.children);
  orig.forEach(function (li) {
    var c = li.cloneNode(true);
    c.classList.add('sv-partner--clone'); c.setAttribute('aria-hidden', 'true');
    box.appendChild(c);
  });
  var pos = 0, last = 0, userAt = -1e9, visible = true, down = false;
  function loopW() { return box.children[orig.length].offsetLeft - box.children[0].offsetLeft; }
  function touch() { userAt = performance.now(); }
  ['pointerdown', 'touchstart', 'wheel'].forEach(function (e) { box.addEventListener(e, function () { touch(); if (e !== 'wheel') down = true; }, { passive: true }); });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (e) { window.addEventListener(e, function () { down = false; touch(); }, { passive: true }); });
  box.addEventListener('scroll', function () {
    if (performance.now() - userAt < 2500) { pos = box.scrollLeft; }
    var w = loopW();
    if (w > 0 && box.scrollLeft >= w) { box.scrollLeft -= w; pos = box.scrollLeft; }
  }, { passive: true });
  if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box);
  function tick(t) {
    requestAnimationFrame(tick);
    var dt = Math.min(t - last, 250); last = t;
    if (!mq.matches || rm.matches || !visible || down || t - userAt < 2500) { pos = box.scrollLeft; return; }
    var w = loopW();
    if (w <= 0) return;
    pos += dt * 0.03;
    if (pos >= w) pos -= w;
    box.scrollLeft = pos;
  }
  requestAnimationFrame(tick);
})();

/* ---------- Отзывы клиентов: карусель (автопрокрутка + свайп). Отзывы с 2ГИС / Яндекса добавлять в .sv-revs как <div class="sv-rev">…</div> — карусель подхватит их сама ---------- */
(function () {
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DELAY = 6500, IDLE = 9000;
  document.querySelectorAll('.sv-revs').forEach(function (box) {
    var dots = document.createElement('div');
    dots.className = 'revs-dots'; dots.hidden = true;
    dots.setAttribute('role', 'tablist'); dots.setAttribute('aria-label', 'Отзывы');
    box.after(dots);
    var idx = 0, userAt = -1e9, hover = false, visible = true, timer;
    function slides() { return Array.prototype.slice.call(box.children); }
    function current() { var w = box.clientWidth; return w ? Math.round(box.scrollLeft / w) : 0; }
    function mark() {
      idx = current();
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', String(i === idx));
      });
    }
    function go(i, smooth) {
      var n = slides().length;
      if (!n) return;
      i = (i + n) % n;
      box.scrollTo({ left: i * box.clientWidth, behavior: smooth === false || rm.matches ? 'auto' : 'smooth' });
      idx = i; Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', String(k === i)); });
    }
    function build() {
      var n = slides().length;
      dots.innerHTML = '';
      dots.hidden = n < 2;
      for (var i = 0; i < n; i++) {
        (function (k) {
          var b = document.createElement('button');
          b.type = 'button'; b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', 'Отзыв ' + (k + 1) + ' из ' + n);
          b.addEventListener('click', function () { userAt = performance.now(); go(k); });
          dots.appendChild(b);
        })(i);
      }
      mark();
    }
    function touch() { userAt = performance.now(); }
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (e) { box.addEventListener(e, touch, { passive: true }); });
    box.addEventListener('mouseenter', function () { hover = true; });
    box.addEventListener('mouseleave', function () { hover = false; });
    box.addEventListener('focusin', touch);
    box.addEventListener('scroll', function () { clearTimeout(box._t); box._t = setTimeout(mark, 60); }, { passive: true });
    window.addEventListener('resize', function () { go(idx, false); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box);
    if (window.MutationObserver) new MutationObserver(build).observe(box, { childList: true });
    timer = setInterval(function () {
      if (rm.matches || !visible || hover || document.hidden || slides().length < 2) return;
      if (performance.now() - userAt < IDLE) return;
      go(idx + 1);
    }, DELAY);
    build();
  });
})();

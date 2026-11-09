/* Диаском — карточка товара: галерея, табы (подсветка по прокрутке), «в корзину», «избранное», слайдер похожих товаров */
document.addEventListener('DOMContentLoaded', () => {
  const num = (s) => Number(String(s).replace(/\D/g, '')) || 0;

  /* ---------- Галерея ---------- */
  const photo = document.getElementById('pdPhoto');
  document.querySelectorAll('[data-pd-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pd-thumb]').forEach((b) => b.classList.toggle('is-active', b === btn));
      if (photo) photo.src = btn.dataset.pdThumb;
    });
  });

  /* ---------- «В корзину» (демо без бэкенда: счётчик в шапке) ---------- */
  const count = document.querySelector('.cart__count');
  document.querySelectorAll('[data-pd-cart]').forEach((btn) => {
    const label = btn.querySelector('span');
    const base = label ? label.textContent : btn.firstChild.textContent;
    btn.addEventListener('click', () => {
      const added = btn.classList.toggle('is-added');
      if (count) count.textContent = Math.max(0, num(count.textContent) + (added ? 1 : -1));
      const text = added ? 'В корзине' : base.trim();
      if (label) label.textContent = text; else btn.firstChild.textContent = text + ' ';
    });
  });

  /* ---------- «Избранное» ---------- */
  document.querySelectorAll('.pd-fav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    });
  });

  /* ---------- Табы: активный раздел по прокрутке ---------- */
  const tabs = [...document.querySelectorAll('.pd-tabs__a')];
  const targets = tabs.map((t) => document.querySelector(t.getAttribute('href')));
  const setActive = (i) => tabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
  tabs.forEach((t, i) => t.addEventListener('click', () => setActive(i)));
  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      const first = targets.findIndex((el) => seen.get(el));
      if (first > -1) setActive(first);
    }, { rootMargin: '-20% 0px -60% 0px' });
    targets.forEach((el) => el && io.observe(el));
  }

  /* ---------- Слайдер «Похожие товары» ---------- */
  const track = document.getElementById('pdCards');
  document.querySelectorAll('[data-pd-slide]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!track) return;
      const card = track.querySelector('.pd-card');
      const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      track.scrollBy({ left: step * Number(btn.dataset.pdSlide), behavior: 'smooth' });
    });
  });
  /* точки под слайдером: одна точка = одна «страница» (видимая группа карточек) */
  const dotsBox = document.getElementById('pdDots');
  if (track && dotsBox) {
    let dots = [];
    const pages = () => Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
    const cur = () => { const max = track.scrollWidth - track.clientWidth; return max > 0 ? Math.round(track.scrollLeft / max * (dots.length - 1)) : 0; };
    const mark = () => { const c = cur(); dots.forEach((d, i) => { d.classList.toggle('is-active', i === c); d.setAttribute('aria-selected', i === c); }); };
    const build = () => {
      const n = pages();
      if (dots.length === n) { mark(); return; }
      dotsBox.innerHTML = '';
      dots = Array.from({ length: n }, (_, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'pd-dots__dot'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Страница ' + (i + 1));
        b.addEventListener('click', () => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }));
        dotsBox.append(b);
        return b;
      });
      dotsBox.hidden = n < 2;
      mark();
    };
    track.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('resize', build);
    build();
  }
});

/* 3D-конструктор в окне поверх страницы: размытый фон, закрытие крестом, Esc и кликом по фону; iframe создаётся при первом открытии */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('pdCfgModal');
  if (!modal) return;
  const body = modal.querySelector('.pd-modal__body');
  const closeBtn = modal.querySelector('.pd-modal__x');
  let opener = null;
  const open = (from) => {
    opener = from || null;
    if (!body.querySelector('iframe')) {
      const f = document.createElement('iframe');
      f.src = modal.dataset.src; f.title = modal.dataset.title || '3D-конструктор';
      f.setAttribute('data-rk-frame', ''); f.setAttribute('allowfullscreen', '');
      f.addEventListener('load', () => { const l = body.querySelector('.pd-modal__load'); if (l) l.remove(); });
      body.append(f);
    }
    modal.hidden = false;
    document.documentElement.classList.add('pd-modal-open');
    closeBtn.focus();
  };
  const close = () => {
    modal.hidden = true;
    document.documentElement.classList.remove('pd-modal-open');
    if (opener) opener.focus();
  };
  document.querySelectorAll('[data-pd-cfg-open]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(a); }));
  modal.querySelectorAll('[data-pd-cfg-close]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
});

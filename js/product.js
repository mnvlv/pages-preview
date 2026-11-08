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
});

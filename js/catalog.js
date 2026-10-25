/* Диаском — каталог: фильтр, сортировка, категории, FAQ, корзина */
document.addEventListener('DOMContentLoaded', () => {
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const num = (s) => Number(String(s).replace(/\D/g, '')) || 0;

  /* ---------- Двойной ползунок цены, синхронизирован с полями «от/до» ---------- */
  document.querySelectorAll('[data-range]').forEach((root) => {
    const min = Number(root.dataset.min);
    const max = Number(root.dataset.max);
    const a = root.querySelector('[data-range-a]');
    const b = root.querySelector('[data-range-b]');
    const from = root.querySelector('[data-range-from]');
    const to = root.querySelector('[data-range-to]');
    const track = root.querySelector('.range__track');
    const pct = (v) => ((v - min) / (max - min)) * 100 + '%';
    const paint = () => {
      track.style.setProperty('--a', pct(a.value));
      track.style.setProperty('--b', pct(b.value));
    };
    const onSlide = (e) => {
      // ползунки не заходят друг за друга
      if (Number(a.value) > Number(b.value)) {
        if (e.target === a) a.value = b.value; else b.value = a.value;
      }
      from.value = fmt(a.value);
      to.value = fmt(b.value);
      paint();
    };
    const onType = (input, slider, isFrom) => {
      input.addEventListener('input', () => { input.value = input.value.replace(/[^\d ]/g, ''); });
      input.addEventListener('change', () => {
        if (input.value.trim() === '') { slider.value = isFrom ? min : max; paint(); return; }
        let v = Math.min(max, Math.max(min, num(input.value)));
        v = isFrom ? Math.min(v, Number(b.value)) : Math.max(v, Number(a.value));
        slider.value = v;
        input.value = fmt(v);
        paint();
      });
    };
    a.addEventListener('input', onSlide);
    b.addEventListener('input', onSlide);
    onType(from, a, true);
    onType(to, b, false);
    root.closest('form')?.addEventListener('reset', () => setTimeout(paint));
    paint();
  });

  /* ---------- Выпадающие списки сортировки ---------- */
  const dropdowns = [...document.querySelectorAll('[data-dropdown]')];
  dropdowns.forEach((root) => {
    const btn = root.querySelector('.sort__btn');
    const list = root.querySelector('.sort__list');
    const value = root.querySelector('.sort__value');
    const close = () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => {
      const open = list.hidden;
      dropdowns.forEach((d) => { d.querySelector('.sort__list').hidden = true; d.querySelector('.sort__btn').setAttribute('aria-expanded', 'false'); });
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    list.addEventListener('click', (e) => {
      const li = e.target.closest('[role="option"]');
      if (!li) return;
      list.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', String(o === li)));
      value.textContent = li.textContent;
      close();
      btn.focus();
    });
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
  });

  /* ---------- «Развернуть все» в категориях ---------- */
  const more = document.querySelector('.cats-box__more');
  if (more) {
    more.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      more.closest('.cats-box').classList.toggle('is-open', open);
      more.querySelector('span').textContent = open ? 'Свернуть' : 'Развернуть все';
    });
  }

  /* ---------- Мобильный фильтр ---------- */
  const filter = document.getElementById('filter');
  const openBtn = document.querySelector('.filter-open');
  if (filter && openBtn) {
    const setOpen = (open) => {
      filter.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (open) filter.querySelector('.filter__close').focus(); else openBtn.focus();
    };
    openBtn.addEventListener('click', () => setOpen(true));
    filter.querySelector('.filter__close').addEventListener('click', () => setOpen(false));
    filter.addEventListener('submit', (e) => { e.preventDefault(); if (filter.classList.contains('is-open')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && filter.classList.contains('is-open')) setOpen(false); });
  }

  /* ---------- FAQ: аккордеон ---------- */
  document.querySelectorAll('[data-faq] .faq__q button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
    });
  });

  /* ---------- Кнопка «В корзину»: счётчик в шапке ---------- */
  const count = document.querySelector('.cart__count');
  document.querySelectorAll('.product__cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const added = btn.classList.toggle('is-added');
      btn.setAttribute('aria-label', added ? 'Убрать из корзины' : 'В корзину');
      if (count) count.textContent = Math.max(0, num(count.textContent) + (added ? 1 : -1));
    });
  });
});

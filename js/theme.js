/* Переключатель светлой/тёмной темы. Без ручного выбора следует настройке системы. */
(function () {
  var KEY = 'diaskom-theme', root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  function set(t) {
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
  }
  set(saved === 'light' || saved === 'dark' ? saved : (mq && mq.matches ? 'light' : 'dark'));
  if (mq) {
    var onChange = function (e) {
      var s = null;
      try { s = localStorage.getItem(KEY); } catch (x) {}
      if (s !== 'light' && s !== 'dark') set(e.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  function apply(t) {
    set(t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    var inner = document.querySelector('.header__inner'); if (!inner) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'theme-toggle'; b.setAttribute('aria-label', 'Сменить тему');
    b.innerHTML = '<svg class="tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg><svg class="tt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>';
    var btn = inner.querySelector('.header__btn');
    if (btn && btn.nextSibling) inner.insertBefore(b, btn.nextSibling); else inner.appendChild(b);
    b.addEventListener('click', function () { apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); });
  });
})();

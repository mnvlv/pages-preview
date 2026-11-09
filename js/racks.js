/* Диаском — страницы стеллажей: 3D-конструктор, высота iframe подстраивается под содержимое на планшетах и телефонах.
   LAZY = true — конструктор подключается по нажатию кнопки (ленивая загрузка);
   LAZY = false (сейчас) — грузится сразу вместе со страницей. Чтобы вернуть ленивую загрузку, поставить true. */
(function () {
  var LAZY = false;
  var boxes = document.querySelectorAll('[data-rk-cfg]');

  boxes.forEach(function (box) {
    var btn = box.querySelector('[data-rk-start]');
    if (!btn) return;
    var run = function () {
      var start = box.querySelector('.rk-cfg__start');
      var frame = document.createElement('iframe');
      frame.src = box.dataset.src;
      frame.title = box.dataset.title || '3D-конструктор';
      frame.setAttribute('data-rk-frame', '');
      frame.setAttribute('allowfullscreen', '');
      box.classList.add('is-loading');
      btn.disabled = true;
      btn.textContent = 'Загружаем…';
      frame.addEventListener('load', function () {
        box.classList.remove('is-loading');
        box.classList.add('is-started');
        if (start) start.remove();
      });
      box.append(frame);
    };
    if (LAZY) btn.addEventListener('click', run); else run();
  });

  /* Среднегрузовые, телефон: длинный вводный текст сворачивается до 2 строк, раскрывается стрелкой (кнопка видна только в мобильной вёрстке, см. racks.css) */
  function fold(box, label) {
    var more = document.createElement('button');
    more.type = 'button'; more.className = 'rk-uni__more'; more.setAttribute('aria-expanded', 'false'); more.setAttribute('aria-label', 'Показать ' + label);
    more.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>';
    box.after(more);
    var fit = function () { box.style.setProperty('--rk-open-h', box.scrollHeight + 'px'); };
    fit(); window.addEventListener('resize', fit); window.addEventListener('load', fit);
    more.addEventListener('click', function () {
      fit();
      var open = box.classList.toggle('is-open');
      more.setAttribute('aria-expanded', String(open));
      more.setAttribute('aria-label', (open ? 'Свернуть ' : 'Показать ') + label);
    });
  }
  var uniText = document.querySelector('.page-racks--s .rk-uni__text');
  if (uniText) fold(uniText, 'весь текст');
  /* Среднегрузовые, телефон: таблица характеристик — видны 2–3 строки с затемнением, остальное раскрывается стрелкой */
  var specs = document.querySelector('.page-racks--s .specs');
  if (specs) {
    var wrap = document.createElement('div');
    wrap.className = 'rk-specs-fold';
    specs.parentNode.insertBefore(wrap, specs);
    wrap.appendChild(specs);
    fold(wrap, 'все характеристики');
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d.rkFrameHeight !== 'number') return;
    document.querySelectorAll('[data-rk-frame]').forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = d.rkFrameHeight ? d.rkFrameHeight + 'px' : '';
    });
  });
})();

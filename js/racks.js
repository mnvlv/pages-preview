/* Диаском — страницы стеллажей: 3D-конструктор, высота iframe подстраивается под содержимое на планшетах и телефонах.
   LAZY = true — конструктор подключается по нажатию кнопки (ленивая загрузка);
   LAZY = false (сейчас) — грузится сразу вместе со страницей. Чтобы вернуть ленивую загрузку, поставить true. */
(function () {
  var LAZY = false;
  var boxes = document.querySelectorAll('[data-rk-cfg]');
  if (!boxes.length) return;

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

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d.rkFrameHeight !== 'number') return;
    document.querySelectorAll('[data-rk-frame]').forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = d.rkFrameHeight ? d.rkFrameHeight + 'px' : '';
    });
  });
})();

/* Диаском — страницы стеллажей: высота iframe с 3D-конструктором подстраивается под содержимое на планшетах и телефонах */
(function () {
  var frames = document.querySelectorAll('[data-rk-frame]');
  if (!frames.length) return;
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d.rkFrameHeight !== 'number') return;
    frames.forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = d.rkFrameHeight ? d.rkFrameHeight + 'px' : '';
    });
  });
})();

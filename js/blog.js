/* Блог: рубрики-фильтры, карточки статей и слайдер «рекомендуем». Данные — JSON в <script id="blog-data"> */
(function () {
  'use strict';
  var dataEl = document.getElementById('blog-data');
  if (!dataEl) return;
  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }

  /* ---------- слайдер ---------- */
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = [].slice.call(slider.querySelectorAll('[data-slide]'));
    var cur = 0;
    var show = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== cur; });
      [].forEach.call(slider.querySelectorAll('[data-counter]'), function (c) { c.textContent = (cur + 1) + ' / ' + slides.length; });
    };
    slider.addEventListener('click', function (e) {
      var b = e.target.closest('[data-prev],[data-next]');
      if (!b) return;
      show(cur + (b.hasAttribute('data-next') ? 1 : -1));
    });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    show(0);
  }

  /* ---------- рубрики и сетка статей ---------- */
  var grid = document.querySelector('[data-articles]');
  var empty = document.querySelector('[data-empty]');
  var tabs = [].slice.call(document.querySelectorAll('[data-cat]'));
  var active = '';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var arrow = '<svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg>';

  function render() {
    var list = data.articles.filter(function (a) { return active ? a.cat === active : !a.featured; });
    grid.innerHTML = list.map(function (a) {
      return '<li><a class="bl-card" href="' + esc(a.href) + '"><img src="' + esc(a.img) + '" alt="" loading="lazy">' +
        '<span class="bl-card__body"><span class="bl-meta">' + esc(a.label) + ' · ' + esc(a.min) + ' мин</span>' +
        '<h3>' + esc(a.title) + '</h3><p>' + esc(a.text) + '</p>' +
        '<span class="bl-card__more">Читать статью ' + arrow + '</span></span></a></li>';
    }).join('');
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var c = t.getAttribute('data-cat');
      active = active === c ? '' : c;
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-cat') === active)); });
      render();
    });
  });
  render();
})();

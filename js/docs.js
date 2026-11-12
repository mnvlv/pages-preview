/* Документация: фильтр по типу, поиск и выбор категории. Данные — JSON в <script id="docs-data"> */
(function () {
  'use strict';
  var dataEl = document.getElementById('docs-data');
  if (!dataEl) return;
  var docs;
  try { docs = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var body = document.querySelector('[data-docs]');
  var empty = document.querySelector('[data-docs-empty]');
  var count = document.querySelector('[data-docs-count]');
  var search = document.querySelector('[data-docs-search]');
  var select = document.querySelector('[data-docs-cat]');
  var tabs = [].slice.call(document.querySelectorAll('[data-type]'));
  var type = 'all';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return String(s).toLowerCase().replace(/ё/g, 'е'); };
  var download = '<svg width="18" height="18" aria-hidden="true"><use href="#i-download"/></svg>';

  tabs.forEach(function (t) {
    var ty = t.getAttribute('data-type');
    var n = ty === 'all' ? docs.length : docs.filter(function (d) { return d.type === ty; }).length;
    t.querySelector('[data-n]').textContent = '(' + n + ')';
  });

  function render() {
    var q = norm(search.value.trim());
    var cat = select.value;
    var list = docs.filter(function (d) {
      if (type !== 'all' && d.type !== type) return false;
      if (cat && d.cat !== cat) return false;
      return !q || norm(d.title + ' ' + d.series + ' ' + d.typeLabel).indexOf(q) !== -1;
    });
    body.innerHTML = list.map(function (d) {
      return '<li class="dc-row"><span class="dc-name"><img src="img/svc/i-doc.svg" alt="">' + esc(d.title) + '</span>' +
        '<span class="dc-badge">' + esc(d.typeLabel) + '</span><span>' + esc(d.series) + '</span><span>' + esc(d.format) + '</span><span>' + esc(d.size) + '</span>' +
        '<a class="btn btn--outline btn--md" href="' + esc(d.href) + '" download>' + download + ' Скачать</a></li>';
    }).join('');
    empty.hidden = list.length > 0;
    count.textContent = 'Найдено документов: ' + list.length;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      type = t.getAttribute('data-type');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === t)); });
      render();
    });
  });
  search.addEventListener('input', render);
  select.addEventListener('change', render);
  render();
})();

// 移动端导航开合
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    // 点击链接后收起
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }
})();

// 菜品中心：分类筛选（客户端实时过滤）
(function () {
  var filter = document.querySelector('.cat-filter');
  if (!filter) return;
  var links = filter.querySelectorAll('a');
  var dishes = document.querySelectorAll('.dish');
  filter.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    links.forEach(function (l) { l.classList.remove('on'); });
    a.classList.add('on');
    var f = a.getAttribute('data-filter');
    dishes.forEach(function (d) {
      var cat = d.getAttribute('data-cat');
      d.style.display = (f === 'all' || cat === f) ? '' : 'none';
    });
  });
})();

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

// 提前预约菜品：演示弹窗（前端校验 + 模拟提交，不连接后端）
(function () {
  var mask = document.getElementById('reserveMask');
  if (!mask) return;
  var form = document.getElementById('reserveForm');
  var okBox = document.getElementById('reserveOk');
  var dishInput = document.getElementById('resDish');
  var nameI = document.getElementById('resName');
  var phoneI = document.getElementById('resPhone');

  function openModal(dish) {
    okBox.style.display = 'none';
    form.style.display = '';
    dishInput.value = dish || '';
    mask.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    mask.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.reserve-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      openModal(b.getAttribute('data-dish') || '');
    });
  });
  mask.querySelector('.x').addEventListener('click', closeModal);
  mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!nameI.value.trim() || !phoneI.value.trim()) { alert('请填写称呼与联系电话'); return; }
    if (!/^1\d{10}$/.test(phoneI.value.trim())) { alert('请输入 11 位手机号'); return; }
    form.style.display = 'none';
    okBox.style.display = '';
    okBox.querySelector('.dish-name').textContent = dishInput.value || '心仪菜品';
  });
  var okBtn = okBox.querySelector('.btn');
  if (okBtn) okBtn.addEventListener('click', closeModal);
})();

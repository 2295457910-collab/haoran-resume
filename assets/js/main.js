/* =========================================================
   王浩然 · 简历网站 交互
   - 导航栏滚动变实
   - 移动端菜单
   - 滚动渐显
   - 摄影作品 Lightbox
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 导航栏滚动变实 ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const overlay = document.createElement('div');
  overlay.className = 'nav__overlay';
  document.body.appendChild(overlay);

  const closeMenu = () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    navMenu.classList.add('open');
    navToggle.classList.add('active');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- 滚动渐显 ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- 导航 active 高亮 ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = navMenu.querySelectorAll('a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }
  // active 样式
  const style = document.createElement('style');
  style.textContent = '.nav__menu a.active{ color:var(--ink)!important; font-weight:600; } .nav__menu a.active::after{ width:100%!important; }';
  document.head.appendChild(style);

  /* ---------- 摄影作品 Lightbox ---------- */
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCount = document.getElementById('lbCount');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  const items = gallery ? Array.from(gallery.querySelectorAll('.gallery__item img')) : [];
  const srcs = items.map(img => img.getAttribute('src'));
  let current = 0;

  const show = (i) => {
    current = (i + srcs.length) % srcs.length;
    lbImage.style.opacity = '0';
    const tmp = new Image();
    tmp.onload = () => {
      lbImage.src = srcs[current];
      lbImage.style.opacity = '1';
    };
    tmp.src = srcs[current];
    lbCount.textContent = (current + 1) + ' / ' + srcs.length;
  };

  const openLB = (i) => {
    show(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLB = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (gallery) {
    gallery.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery__item');
      if (!item) return;
      const idx = parseInt(item.dataset.index, 10) || 0;
      openLB(idx);
    });
  }
  lbClose.addEventListener('click', closeLB);
  lbPrev.addEventListener('click', () => show(current - 1));
  lbNext.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) closeLB();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // 触摸滑动
  let touchX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- 图片渐显占位（防止白闪） ---------- */
  lbImage.style.transition = 'opacity .35s ease';

})();

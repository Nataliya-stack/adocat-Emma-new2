let menuToggle = null;
let mobileMenu = null;

const initMobileMenu = () => {
  menuToggle = document.getElementById('menu-toggle');
  mobileMenu = document.getElementById('mobile-menu');

  // 🛡️ Единый предохранитель: проверяем наличие элементов и отсутствие старого слушателя
  if (!menuToggle || !mobileMenu || menuToggle.hasAttribute('data-has-listener')) {
    return;
  }

  // Нативный, чистый метод по современным стандартам
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuToggle.textContent = mobileMenu.classList.contains('hidden') ? '☰' : '✕';
  });

  menuToggle.setAttribute('data-has-listener', 'true');
};

// Инициализация при первой загрузке и при SPA-переходах Astro
initMobileMenu();
document.addEventListener('astro:page-load', initMobileMenu);

// Логика управления вкладками на юридической странице
const checkLegalTab = () => {
  const defaultSection = document.getElementById('avis');

  // 🛡️ Единый предохранитель: проверяем, что мы на нужной странице и элемент существует
  if (!window.location.pathname.includes('/legal') || !defaultSection) {
    return;
  }

  // Основная логика выполняется только при успешной валидации
  if (!window.location.hash || window.location.hash === '#avis') {
    defaultSection.classList.remove('hidden');
  } else {
    defaultSection.classList.add('hidden');
  }

  window.scrollTo(0, 0);
};

// Слушаем загрузку страницы и переключение ссылок в футере
window.addEventListener('hashchange', checkLegalTab);
window.addEventListener('load', checkLegalTab);
document.addEventListener('astro:after-swap', checkLegalTab); // Поддержка анимаций переходов Astro

// ===== PAGE NAVIGATION =====
// Обробник для делегування подій (для onclick атрибутів в HTML)
// Функція showPage() вже визначена в page-loader.js

// Використовуємо делегування подій на навбарі для перевиття подій
document.addEventListener("click", function (e) {
  // Знаходимо посилання навігації в батьківських елементах
  const navLink = e.target.closest(".nav-link");
  if (navLink) {
    e.preventDefault();
    const pageId = navLink.getAttribute("href").substring(1);
    console.log(`Navigation click: ${pageId}`);
    showPage(pageId);
  }
});

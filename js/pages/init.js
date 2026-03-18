// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded event fired");
  console.log("Loading dashboard...");
  // Завантажуємо першу сторінку (dashboard)
  await showPage("dashboard");
  console.log("Dashboard loaded");
});

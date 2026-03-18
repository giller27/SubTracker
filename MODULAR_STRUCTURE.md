# 📱 SubTrack - Трекер підписок (Модульна версія)

## 🎯 Що змінилося?

Проект був розділен на окремі модулі для **зручнішого редагування кожної сторінки**. Тепер кожна сторінка має свій JavaScript файл, і всі сторінки розташовані у папці `pages/`.

### ✅ Переваги модульної структури:
- 📄 **Легше редагувати** - кожна сторінка у своєму файлі
- 🔍 **Зрозуміліше** - не потрібно шукати код у одному великому файлі
- 🔧 **Простіше розширювати** - додавити нову сторінку легше
- 🎨 **Систематизовано** - HTML та JS розділені

## 📁 Структура проекту

```
SubTracker/
│
├─📄 index.html              Головна сторінка (єдина HTML)
├─🎨 styles.css              Стилі
├─📝 README.md               Цей файл
│
├─📂 js/                     ⭐ JavaScript модулі
│  ├─ config.js              Конфігурація (POPULAR_SERVICES)
│  ├─ store.js               Управління даними
│  ├─ calculations.js        Розрахунки
│  ├─ README.md              Документація модулів
│  │
│  └─📂 pages/               Функції для кожної сторінки
│     ├─ navigation.js       Навігація
│     ├─ dashboard.js        Dashboard (Показники + Графіки)
│     ├─ subscriptions.js    Мої підписки (Список)
│     ├─ add-service.js      Додати сервіс (Форма)
│     ├─ insights.js         Аналітика (Графіки + Поради)
│     ├─ calendar.js         Календар (Дати платежів)
│     ├─ settings.js         Налаштування (Опції користувача)
│     ├─ modal.js            Модальні вікна (Редагування)
│     └─ init.js             Ініціалізація
│
├─📂 pages/                  ⭐ HTML для кожної сторінки
│  ├─ dashboard.html         HTML Dashboard
│  ├─ subscriptions.html     HTML Мої підписки
│  ├─ add-service.html       HTML Додати сервіс
│  ├─ insights.html          HTML Аналітика
│  ├─ calendar.html          HTML Календар
│  ├─ settings.html          HTML Налаштування
│  └─ README.md              Як редагувати сторінки
│
└─📂 app.js                  ❌ Старий файл (можна видалити)
```

## 🎨 Як редагувати кожну сторінку

### Сторінка "Dashboard" 📊
```
┌─ HTML        → pages/dashboard.html
├─ JavaScript → js/pages/dashboard.js
└─ Функції: updateDashboard(), renderDailyChart(), renderCategories()
```
**Гарячі клавіші**: Таб "Dashboard" з показниками витрат

---

### Сторінка "Мої підписки" 📋
```
┌─ HTML        → pages/subscriptions.html
├─ JavaScript → js/pages/subscriptions.js
└─ Функції: renderSubscriptionsList(), filterSubscriptions()
```
**Гарячі клавіші**: Таб "Мої підписки" зі списком всіх сервісів

---

### Сторінка "Додати сервіс" ➕
```
┌─ HTML        → pages/add-service.html
├─ JavaScript → js/pages/add-service.js
└─ Функції: populatePopularServices(), selectPopularService()
```
**Гарячі клавіші**: Таб "Додати" з популярними сервісами

---

### Сторінка "Аналітика" 📈
```
┌─ HTML        → pages/insights.html
├─ JavaScript → js/pages/insights.js
└─ Функції: updateInsights(), renderMonthlyChart(), renderAdvice()
```
**Гарячі клавіші**: Таб "Аналітика" з графіками

---

### Сторінка "Календар" 📅
```
┌─ HTML        → pages/calendar.html
├─ JavaScript → js/pages/calendar.js
└─ Функції: initializeCalendar(), renderCalendar()
```
**Гарячі клавіші**: Таб "Календар" з датами платежів

---

### Сторінка "Налаштування" ⚙️
```
┌─ HTML        → pages/settings.html
├─ JavaScript → js/pages/settings.js
└─ Функції: loadSettings(), exportToCSV(), clearAllData()
```
**Гарячі клавіші**: Таб "Налаштування" з опціями

---

## 🛠️ Як редагувати

### 1️⃣ Хочу змінити вигляд сторінки (HTML)

1. Відкрийте файл у папці `pages/` (наприклад, `pages/dashboard.html`)
2. Змініть структуру HTML
3. Переконайтесь що `id` елементів збігаються з JavaScript файлом
4. Збережіть файл

**Приклад**: Щоб додати кнопку на Dashboard:
```html
<!-- У pages/dashboard.html -->
<button onclick="myFunction()">Моя кнопка</button>
```

### 2️⃣ Хочу змінити функціональність сторінки (JS)

1. Відкрийте файл у папці `js/pages/` (наприклад, `js/pages/dashboard.js`)
2. Додайте або змініть функції
3. Используйте `store` для роботи з даними:
   ```javascript
   store.subscriptions      // Список всіх підписок
   store.addSubscription()  // Додати нову
   ```
4. Используйте `calculations` для розрахунків:
   ```javascript
   calculations.getMonthlyTotal()  // Сума на місяць
   calculations.getNextPayment()   // Наступний платіж
   ```

### 3️⃣ Хочу додати нову сторінку

1. Створіть файл `pages/my-page.html` з HTML
2. Створіть файл `js/pages/my-page.js` з функціями
3. Додайте `<div>` у `index.html`:
   ```html
   <div id="my-page" class="page">
       <!-- HTML на основі pages/my-page.html -->
   </div>
   ```
4. Додайте `<script>` у `index.html`:
   ```html
   <script src="js/pages/my-page.js"></script>
   ```
5. Додайте посилання у меню на Dashboard

## 📚 Документація

- **[Документація модулів](js/README.md)** - як використовувати кожен модуль
- **[Документація сторінок](pages/README.md)** - як редагувати кожну сторінку
- **[Оригінальний README](README_OLD.md)** - старая документація

## 🚀 Швидкий старт

### Для редагування конкретної сторінки:

| Що робити | Файл для редагування |
|-----------|---------------------|
| Змінити вигляд Dashboard | `pages/dashboard.html` + `js/pages/dashboard.js` |
| Змінити список підписок | `pages/subscriptions.html` + `js/pages/subscriptions.js` |
| Додати нову функцію | `js/pages/my-page.js` + `pages/my-page.html` |
| Змінити дані | `js/store.js` |
| Змінити розрахунки | `js/calculations.js` |
| Змінити стилі | `styles.css` |

## ✨ Приклади

### Приклад 1: Додати нове поле на сторінку
```html
<!-- У pages/dashboard.html -->
<div id="myNewMetric" class="metric-card">
    <h3>Мій показник</h3>
    <p id="myValue">0</p>
</div>
```

```javascript
// У js/pages/dashboard.js
function updateDashboard() {
    // ... существуючий код ...
    document.getElementById("myValue").textContent = "100";
}
```

### Приклад 2: Додати нову функцію обробки
```javascript
// У js/pages/subscriptions.js
function myCustomFilter() {
    // Ваша логіка фільтрування
}

document.getElementById("myButton").addEventListener("click", myCustomFilter);
```

## 📞 Питання?

- **Де JavaScript для сторінки X?** → папка `js/pages/`
- **Де HTML для сторінки X?** → папка `pages/`
- **Як додати нову сторінку?** → [Документація модулів](js/README.md)
- **Як использовать дані?** → [API Store](js/README.md)

## 🎉 Готово!

Тепер проект організований так, щоб **легко редагувати кожну сторінку** окремо. Кожна сторінка має:
- 📄 Свій HTML файл (`pages/`)
- 🔧 Свій JavaScript файл (`js/pages/`)
- 📝 Чітку структуру

**Приємного редагування! 🚀**

---

**Версія**: 2.0 (Модульна структура)  
**Дата оновлення**: 2026  
**Статус**: ✅ Повністю функціональна

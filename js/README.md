# JS Модулі - Документація

## 🏗️ Архітектура модулів

### Core модулі (основа)

#### `config.js`
Містить глобальні конфігурації та константи:
- `CONFIG` - об'єкт з ключами для localStorage
- `POPULAR_SERVICES` - масив популярних сервісів

#### `store.js`
Клас `SubscriptionStore` для управління даними:
```javascript
// Методи:
store.loadSubscriptions()          // Завантажити з localStorage
store.saveSubscriptions()          // Зберегти до localStorage
store.addSubscription(sub)         // Додати підписку
store.updateSubscription(id, data) // Оновити підписку
store.deleteSubscription(id)       // Видалити підписку
store.exportToCSV()               // Експортувати у CSV
store.exportToJSON()              // Експортувати у JSON
```

#### `calculations.js`
Клас `SubscriptionCalculations` для розрахунків:
```javascript
// Методи:
calculations.getMonthlyTotal()      // Сума на місяць
calculations.getYearlyTotal()       // Сума на рік
calculations.getNextPayment()       // Наступний платіж
calculations.getDailyExpenses()     // Витрати по днях
calculations.getExpensesByCategory()// Витрати по категоріях
calculations.getMonthlyTrend()      // Тренд за 6 місяців
calculations.getFinancialAdvice()   // Фінансові поради
```

### Модулі сторінок (`pages/`)

#### `navigation.js`
Управління навігацією між сторінками:
- `showPage(pageId)` - показати 1 сторінку
- Обробка кліків на меню

#### `dashboard.js`
Dashboard сторінка:
- `updateDashboard()` - оновити всі показники
- `renderDailyChart()` - графік витрат по днях
- `renderCategories()` - розподіл по категоріях
- `renderAlerts()` - сповіщення

#### `subscriptions.js`
Список підписок:
- `renderSubscriptionsList()` - показати список
- `filterSubscriptions()` - фільтрувати та сортувати
- `renderSubscriptions(list)` - рендер карток підписок
- `getServiceIcon(category)` - іконка по категорії

#### `add-service.js`
Додавання сервісу:
- `populatePopularServices()` - список популярних
- `selectPopularService(service)` - вибрати популярний
- `setDefaultBillingDate()` - встановити дату за замовчуванням
- Обробка форми додавання

#### `insights.js`
Аналітика:
- `updateInsights()` - оновити всі графіки
- `renderMonthlyChart()` - графік витрат за 6 місяців
- `renderCategoryChart()` - круговий графік по категоріях
- `renderAdvice()` - показати поради
- `renderForecast()` - фінансовий прогноз

#### `calendar.js`
Календар платежів:
- `initializeCalendar()` - ініціалізувати
- `renderCalendar()` - рендер календара
- `createCalendarDay()` - створити день у календарі
- `getPaymentsOnDay(date)` - платежі на день
- `previousMonth()` / `nextMonth()` - навігація

#### `settings.js`
Налаштування:
- `loadSettings()` - завантажити налаштування
- `exportToCSV()` - експорт в CSV
- `exportToJSON()` - експорт в JSON
- `importData()` - імпорт даних
- `clearAllData()` - видалити все

#### `modal.js`
Модальні вікна:
- `openEditModal(id)` - відкрити редагування
- `closeEditModal()` - закрити модаль
- `deleteSubscription(id)` - видалити підписку
- Обробка форми редагування

#### `init.js`
Ініціалізація при завантаженні:
- `DOMContentLoaded` обробник
- Початкові дані для dashboard

## 📦 Залежності між модулями

```
config.js
    ↓
store.js (використовує CONFIG)
    ↓
calculations.js (використовує store)
    ↓
navigation.js + всі pages/*.js файли
(використовують store, calculations, друг друга)
    ↓
init.js (повинен бути останнім)
```

## 🔄 Іспользование глобальних об'єктів

Всі сторінки можуть користуватися:
- `store` - об'єкт управління даними
- `calculations` - об'єкт для розрахунків
- `CONFIG` - конфігурація
- `POPULAR_SERVICES` - популярні сервіси

Приклад:
```javascript
// У будь якому файлу pages/*.js
store.subscriptions  // Доступ до підписок
calculations.getMonthlyTotal()  // Розрахунок
```

## 📝 Додавання нового файлу

1. Створіть новий файл у `js/pages/`
2. Напишіть функції для сторінки
3. Додайте `<script>` тег у `index.html` **після** основних модулів
4. Викличте функцію з `navigation.js` або як обробник события

Приклад:
```html
<!-- У index.html після інших scripts -->
<script src="js/pages/my-new-page.js"></script>
```

---

**Останнє оновлення**: 2026  
**Версія**: 2.0

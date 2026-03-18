# 🚀 Швидкий довідник для розробників

## Глобальні об'єкти та змінні

```javascript
store                    // SubscriptionStore - об'єкт управління даними
calculations             // SubscriptionCalculations - розрахунки
CONFIG                  // Об'єкт конфігурації
POPULAR_SERVICES        // Масив популярних сервісів
currentCalendarDate     // Поточна дата календара (Day.js об'єкт)
```

## Store API (управління даними)

### Доступ до даних
```javascript
store.subscriptions       // Масив всіх підписок
store.settings           // Об'єкт налаштувань користувача
```

### Методи
```javascript
// Додані підписки
store.addSubscription({
    name: "Netflix",
    price: 99,
    currency: "₴",
    billingCycle: "monthly",
    category: "Стрімінг",
    nextBillingDate: "2026-03-15",
    description: "Опис"
})

// Оновити підписку
store.updateSubscription(subscriptionId, {
    name: "New Name",
    price: 150,
    category: "Робота"
})

// Видалити підписку
store.deleteSubscription(subscriptionId)

// Експорт/імпорт
store.exportToCSV()      // Завантажити CSV файл
store.exportToJSON()     // Завантажити JSON файл
store.downloadFile(content, filename, type)
```

## Calculations API (розрахунки)

```javascript
// Суми
calculations.getMonthlyTotal()           // Сума всіх підписок за місяць
calculations.getYearlyTotal()            // Сума за рік

// Конвертація цін
calculations.convertToMonthly(price, billingCycle)   // У місячну ціну
calculations.convertToYearly(price, billingCycle)    // У річну ціну

// Платежі та витрати
calculations.getNextPayment()             // Інформація про наступний платіж
calculations.getDailyExpenses()           // Витрати по днях (об'єкт {1: 0, 2: 100...})
calculations.getExpensesByCategory()      // Витрати по категоріях

// Аналітика
calculations.getMonthlyTrend(months)      // Тренд витрат за N місяців
calculations.getFinancialAdvice()         // Масив порад по економії
```

## Функції навігації

```javascript
showPage(pageId)  // Показати сторінку
// pageId: "dashboard", "subscriptions", "add-service", "insights", "calendar", "settings"

// Приклади:
showPage("dashboard")      // Перейти на Dashboard
showPage("subscriptions")  // Перейти на список підписок
```

## Функції Dashboard

```javascript
updateDashboard()          // Оновити всю інформацію на Dashboard
renderDailyChart()         // Рендер графіку витрат по днях
renderCategories()         // Рендер карток категорій
renderAlerts()             // Показати/сховати сповіщення
```

## Функції Підписок

```javascript
renderSubscriptionsList()  // Показати список підписок з фільтрами
filterSubscriptions()      // Застосувати фільтри та сортування
renderSubscriptions(list)  // Рендер карток підписок
getServiceIcon(category)   // Отримати іконку по категорії

// Модальне вікно
openEditModal(subscriptionId)  // Відкрити вікно редагування
closeEditModal()               // Закрити вікно редагування
deleteSubscription(id)         // Видалити підписку з підтвердженням
```

## Функції Додання сервісу

```javascript
populatePopularServices()       // Наповнити список популярних сервісів
selectPopularService(service)   // Вибрати популярний сервіс
setDefaultBillingDate()         // Встановити завтрашню дату
```

## Функції Аналітики

```javascript
updateInsights()            // Оновити всю аналітику
renderMonthlyChart()        // Графік витрат за 6 місяців
renderCategoryChart()       // Круговий графік по категоріях
renderAdvice()              // Показати поради по економії
renderForecast()            // Показати фінансовий прогноз
```

## Функції Календара

```javascript
initializeCalendar()        // Ініціалізувати календар
renderCalendar()            // Рендер дней місяця
createCalendarDay(date, isOtherMonth)  // Створити день у календарі
getPaymentsOnDay(date)      // Отримати платежі на конкретний день
previousMonth()             // Перейти на попередній місяць
nextMonth()                 // Перейти на наступний місяць
renderUpcomingPayments()    // Список платежів в місяці
```

## Функції Налаштувань

```javascript
loadSettings()              // Завантажити та застосувати налаштування
exportToCSV()               // Експорт у CSV
exportToJSON()              // Експорт у JSON
importData()                // Імпорт даних з JSON файлу
clearAllData()              // Видалити всі дані користувача
```

## Приклади кода

### Приклад 1: Додати нову підписку програмою
```javascript
const newSubscription = {
    name: "Spotify Premium",
    price: 69,
    currency: "₴",
    billingCycle: "monthly",
    category: "Стрімінг",
    nextBillingDate: "2026-03-15",
    description: "Музичний сервіс"
};

store.addSubscription(newSubscription);
calculations = new SubscriptionCalculations(store.subscriptions, store.settings);
updateDashboard(); // Оновити дисплей
```

### Приклад 2: Отримати суму всіх vitrat
```javascript
const monthlyTotal = calculations.getMonthlyTotal();
const yearlyTotal = calculations.getYearlyTotal();

console.log(`Цього місяця: ${monthlyTotal} ${store.settings.currency}`);
console.log(`На рік: ${yearlyTotal} ${store.settings.currency}`);
```

### Приклад 3: Отримати наступний платіж
```javascript
const nextPayment = calculations.getNextPayment();
if (nextPayment) {
    console.log(`Наступний платіж: ${nextPayment.service}`);
    console.log(`Дата: ${nextPayment.date}`);
    console.log(`Через ${nextPayment.daysUntil} днів`);
}
```

### Приклад 4: Додати обробник для нової кнопки
```javascript
// У файлі js/pages/my-page.js
document.getElementById("myButton").addEventListener("click", function() {
    const filtered = store.subscriptions.filter(s => s.category === "Стрімінг");
    console.log("Стрімінг сервіси:", filtered);
});
```

### Приклад 5: Оновити показник на Dashboard
```javascript
function updateMyMetric() {
    const total = calculations.getMonthlyTotal();
    document.getElementById("myMetric").textContent = total.toFixed(2);
}
```

## Структура об'єкта підписки

```javascript
{
    id: 1234567890,                  // Timestamp при створенні
    name: "Netflix",                 // Назва сервісу
    price: 99,                       // Ціна
    currency: "₴",                   // Валюта
    billingCycle: "monthly",         // "monthly", "yearly", "weekly", "quarterly"
    category: "Стрімінг",            // Категорія
    nextBillingDate: "2026-03-15",   // ISO дата
    description: "...",              // Опис (необов'язково)
    createdAt: "2026-02-01T10:30:00Z" // Коли додана
}
```

## Структура об'єкта налаштувань

```javascript
{
    currency: "₴",                   // Валюта (₴, $, €, £)
    notificationsDays: 3,            // За скільки днів повідомляти
    notificationsEnabled: true,      // Включені ли повідомлення
    emailNotifications: false,       // Email сповіщення
    telegramNotifications: false,    // Telegram сповіщення
    telegramId: ""                   // Telegram ID користувача
}
```

## Поточні дати з Day.js

```javascript
// Поточна дата/час
dayjs()                    // Поточна дата
dayjs().format("DD.MM.YYYY")  // "15.03.2026" виглядає
dayjs().startOf("month")   // Перший день місяця
dayjs().endOf("month")     // Останній день місяця
dayjs().daysInMonth()      // Кількість днів у місяці

// Порівняння
dayjs(sub.nextBillingDate).isAfter(dayjs())  // Чи дата в майбутньому
dayjs(sub.nextBillingDate).diff(dayjs(), "day")  // Різниця у днях

// Календар
currentCalendarDate        // Поточна дата календара
currentCalendarDate.subtract(1, "month")  // Попередньо місяць
currentCalendarDate.add(1, "month")       // Наступний місяць
```

## Селектори для DOM елементів

```javascript
// Dashboard
document.getElementById("monthly-total")      // Сума на місяць
document.getElementById("yearly-total")       // Сума на рік
document.getElementById("active-count")       // Кількість підписок
document.getElementById("currency")           // Символ валюти
document.getElementById("dailyChart")         // Canvas графіка

// Підписки
document.getElementById("categoryFilter")     // Select фільтру по категахіям
document.getElementById("sortFilter")         // Select сортування
document.getElementById("searchFilter")       // Input пошуку
document.getElementById("subscriptionsList")  // Контейнер списку

// Додання сервісу
document.getElementById("serviceName")        // Input імені
document.getElementById("servicePrice")       // Input ціни
document.getElementById("addServiceForm")     // Форма додегавання

// Налаштування
document.querySelectorAll('input[name="currency"]')  // Radio кнопки валюти
document.getElementById("notificationsDays")   // Checkbox сповіщень
```

---

**Скорочено**: SC (SubTrack Cheat Sheet)  
**Версія**: 1.0  
**Останнє оновлення**: 2026

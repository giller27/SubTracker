// ===== CONFIG =====
dayjs.extend(dayjs_plugin_utc);

const CONFIG = {
  storageKey: "subtrack_subscriptions",
  settingsKey: "subtrack_settings",
  defaultCurrency: "₴",
};

const POPULAR_SERVICES = [
  { name: "Netflix", category: "Стрімінг", price: 99 },
  { name: "Spotify", category: "Стрімінг", price: 69 },
  { name: "Apple Music", category: "Стрімінг", price: 69 },
  { name: "YouTube Premium", category: "Стрімінг", price: 99 },
  { name: "Disney+", category: "Стрімінг", price: 99 },
  { name: "iCloud+", category: "Хмарні сховища", price: 99 },
  { name: "Google Drive", category: "Хмарні сховища", price: 99 },
  { name: "Dropbox", category: "Хмарні сховища", price: 99 },
  { name: "Adobe Creative Cloud", category: "Робота", price: 299 },
  { name: "Microsoft 365", category: "Робота", price: 69 },
  { name: "Figma", category: "Робота", price: 99 },
  { name: "Notion", category: "Робота", price: 99 },
  { name: "Telegram Premium", category: "Інше", price: 49 },
  { name: "Canva Pro", category: "Робота", price: 99 },
  { name: "ChatGPT Plus", category: "Робота", price: 199 },
];

// ===== STORE MANAGEMENT =====
class SubscriptionStore {
  constructor() {
    this.subscriptions = this.loadSubscriptions();
    this.settings = this.loadSettings();
  }

  loadSubscriptions() {
    const data = localStorage.getItem(CONFIG.storageKey);
    return data ? JSON.parse(data) : [];
  }

  saveSubscriptions() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.subscriptions));
  }

  loadSettings() {
    const data = localStorage.getItem(CONFIG.settingsKey);
    return data
      ? JSON.parse(data)
      : {
          currency: CONFIG.defaultCurrency,
          notificationsDays: 3,
          notificationsEnabled: true,
          emailNotifications: false,
          telegramNotifications: false,
          telegramId: "",
        };
  }

  saveSettings() {
    localStorage.setItem(CONFIG.settingsKey, JSON.stringify(this.settings));
  }

  addSubscription(subscription) {
    subscription.id = Date.now();
    subscription.createdAt = new Date().toISOString();
    this.subscriptions.push(subscription);
    this.saveSubscriptions();
    return subscription;
  }

  updateSubscription(id, updatedData) {
    const index = this.subscriptions.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.subscriptions[index] = {
        ...this.subscriptions[index],
        ...updatedData,
      };
      this.saveSubscriptions();
      return this.subscriptions[index];
    }
    return null;
  }

  deleteSubscription(id) {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
    this.saveSubscriptions();
  }

  clearAllData() {
    if (confirm("⚠️ Ви впевнені? Всі дані будуть видалені!")) {
      this.subscriptions = [];
      this.saveSubscriptions();
      location.reload();
    }
  }

  exportToCSV() {
    const headers = [
      "Назва",
      "Категорія",
      "Ціна",
      "Валюта",
      "Цикл",
      "Дата наступної оплати",
    ];
    const rows = this.subscriptions.map((s) => [
      s.name,
      s.category,
      s.price,
      s.currency,
      s.billingCycle,
      s.nextBillingDate,
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    this.downloadFile(csv, "subscriptions.csv", "text/csv");
  }

  exportToJSON() {
    const data = JSON.stringify(this.subscriptions, null, 2);
    this.downloadFile(data, "subscriptions.json", "application/json");
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// ===== CALCULATIONS =====
class SubscriptionCalculations {
  constructor(subscriptions, settings) {
    this.subscriptions = subscriptions;
    this.settings = settings;
  }

  getMonthlyTotal() {
    return this.subscriptions.reduce((sum, sub) => {
      const monthly = this.convertToMonthly(sub.price, sub.billingCycle);
      return sum + monthly;
    }, 0);
  }

  getYearlyTotal() {
    return this.subscriptions.reduce((sum, sub) => {
      const yearly = this.convertToYearly(sub.price, sub.billingCycle);
      return sum + yearly;
    }, 0);
  }

  convertToMonthly(price, billingCycle) {
    switch (billingCycle) {
      case "monthly":
        return price;
      case "yearly":
        return price / 12;
      case "weekly":
        return price * 4.33;
      case "quarterly":
        return price / 3;
      default:
        return 0;
    }
  }

  convertToYearly(price, billingCycle) {
    switch (billingCycle) {
      case "monthly":
        return price * 12;
      case "yearly":
        return price;
      case "weekly":
        return price * 52;
      case "quarterly":
        return price * 4;
      default:
        return 0;
    }
  }

  getNextPayment() {
    const today = dayjs();
    const upcoming = this.subscriptions
      .map((sub) => ({
        ...sub,
        nextDate: dayjs(sub.nextBillingDate),
      }))
      .filter((sub) => sub.nextDate.isAfter(today))
      .sort((a, b) => a.nextDate.diff(b.nextDate))
      .shift();

    if (!upcoming) return null;

    const daysUntil = upcoming.nextDate.diff(today, "day");
    return {
      service: upcoming.name,
      date: upcoming.nextDate.format("DD.MM.YYYY"),
      daysUntil,
      price: upcoming.price,
      currency: upcoming.currency,
    };
  }

  getDailyExpenses() {
    const daysInMonth = dayjs().daysInMonth();
    const expenses = {};

    for (let i = 1; i <= daysInMonth; i++) {
      expenses[i] = 0;
    }

    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();

    this.subscriptions.forEach((sub) => {
      const billingDate = dayjs(sub.nextBillingDate);
      let checkDate = dayjs(sub.nextBillingDate);

      // Determine billing frequency in days
      let frequencyDays;
      switch (sub.billingCycle) {
        case "monthly":
          frequencyDays = 30;
          break;
        case "yearly":
          frequencyDays = 365;
          break;
        case "weekly":
          frequencyDays = 7;
          break;
        case "quarterly":
          frequencyDays = 90;
          break;
        default:
          frequencyDays = 30;
      }

      // Look back to find if payment falls in current month
      while (
        checkDate.isAfter(
          dayjs()
            .startOf("month")
            .subtract(frequencyDays * 2, "day"),
        )
      ) {
        if (
          checkDate.month() === currentMonth &&
          checkDate.year() === currentYear
        ) {
          const day = checkDate.date();
          expenses[day] += sub.price;
        }
        checkDate = checkDate.subtract(frequencyDays, "day");
      }
    });

    return expenses;
  }

  getExpensesByCategory() {
    const categories = {};

    this.subscriptions.forEach((sub) => {
      if (!categories[sub.category]) {
        categories[sub.category] = 0;
      }
      categories[sub.category] += this.convertToMonthly(
        sub.price,
        sub.billingCycle,
      );
    });

    return categories;
  }

  getMonthlyTrend(months = 6) {
    const trend = {};
    const now = dayjs();

    for (let i = months - 1; i >= 0; i--) {
      const month = now.subtract(i, "month");
      const monthKey = month.format("MMM YYYY");
      trend[monthKey] = 0;
    }

    this.subscriptions.forEach((sub) => {
      const billingDate = dayjs(sub.nextBillingDate);
      let checkDate = dayjs(sub.nextBillingDate);

      let frequencyDays;
      switch (sub.billingCycle) {
        case "monthly":
          frequencyDays = 30;
          break;
        case "yearly":
          frequencyDays = 365;
          break;
        case "weekly":
          frequencyDays = 7;
          break;
        case "quarterly":
          frequencyDays = 90;
          break;
        default:
          frequencyDays = 30;
      }

      for (let i = months - 1; i >= 0; i--) {
        const month = now.subtract(i, "month");
        const monthKey = month.format("MMM YYYY");

        checkDate = billingDate;
        while (checkDate.isBefore(month.endOf("month"))) {
          if (
            checkDate.month() === month.month() &&
            checkDate.year() === month.year()
          ) {
            trend[monthKey] += sub.price;
            break;
          }
          checkDate = checkDate.add(frequencyDays, "day");
          if (checkDate.isAfter(month.endOf("month"))) break;
        }
      }
    });

    return trend;
  }

  getFinancialAdvice() {
    const advice = [];

    // Check for duplicate streaming services
    const streamingServices = this.subscriptions.filter(
      (s) => s.category === "Стрімінг",
    );
    if (streamingServices.length > 3) {
      advice.push({
        type: "warning",
        title: "Дублювання на стрімінгу",
        message: `У вас ${streamingServices.length} підписок на стрімінг. Розглянь скасування деяких.`,
      });
    }

    // Check for expensive services
    const expensive = this.subscriptions.filter((s) => s.price > 300);
    if (expensive.length > 0) {
      advice.push({
        type: "info",
        title: "Дорогі сервіси",
        message: `${expensive.map((s) => s.name).join(", ")} дорогі. Перевір, чи варто їх мати.`,
      });
    }

    // Total monthly expenses warning
    const monthlyTotal = this.getMonthlyTotal();
    if (monthlyTotal > 3000) {
      advice.push({
        type: "warning",
        title: "Великі месячні витрати",
        message: `Твої місячні витрати ${monthlyTotal.toFixed(2)} ${this.settings.currency}. Це вагомо!`,
      });
    }

    // Suggestions for savings
    if (this.subscriptions.length > 10) {
      advice.push({
        type: "info",
        title: "Багато підписок",
        message: `У тебе ${this.subscriptions.length} підписок. Розглянь скасування невикористовуваних.`,
      });
    }

    return advice;
  }
}

// ===== GLOBAL STATE =====
let store = new SubscriptionStore();
let calculations = new SubscriptionCalculations(
  store.subscriptions,
  store.settings,
);

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
  // Hide all pages
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  // Show selected page
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add("active");
  }

  // Update nav links
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  event.target.closest(".nav-link")?.classList.add("active");

  // Load page-specific content
  if (pageId === "dashboard") {
    updateDashboard();
  } else if (pageId === "subscriptions") {
    renderSubscriptionsList();
  } else if (pageId === "add-service") {
    populatePopularServices();
    setDefaultBillingDate();
  } else if (pageId === "insights") {
    updateInsights();
  } else if (pageId === "calendar") {
    initializeCalendar();
  } else if (pageId === "settings") {
    loadSettings();
  }
}

// Prevent default navigation
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const pageId = this.getAttribute("href").substring(1);
    showPage(pageId);
  });
});

// ===== DASHBOARD =====
function updateDashboard() {
  calculations = new SubscriptionCalculations(
    store.subscriptions,
    store.settings,
  );

  // Update metrics
  document.getElementById("monthly-total").textContent = calculations
    .getMonthlyTotal()
    .toFixed(2);
  document.getElementById("yearly-total").textContent = calculations
    .getYearlyTotal()
    .toFixed(2);
  document.getElementById("active-count").textContent =
    store.subscriptions.length;
  document.getElementById("currency").textContent = store.settings.currency;

  // Update next payment
  const nextPayment = calculations.getNextPayment();
  if (nextPayment) {
    document.getElementById("next-payment-days").textContent =
      `${nextPayment.daysUntil} днів`;
    document.getElementById("next-payment-service").textContent =
      `до оплати ${nextPayment.service}`;
  } else {
    document.getElementById("next-payment-days").textContent = "—";
    document.getElementById("next-payment-service").textContent =
      "немає платежів";
  }

  // Render daily expenses chart
  renderDailyChart();

  // Render categories
  renderCategories();

  // Render alerts
  renderAlerts();
}

function renderDailyChart() {
  const ctx = document.getElementById("dailyChart");
  if (!ctx) return;

  const dailyExpenses = calculations.getDailyExpenses();
  const labels = Object.keys(dailyExpenses).sort((a, b) => a - b);
  const data = labels.map((day) => dailyExpenses[day]);

  const existingChart = Chart.helpers.getChart(ctx);
  if (existingChart) existingChart.destroy();

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.map((day) => `${day} числа`),
      datasets: [
        {
          label: `Витрати за день, ${store.settings.currency}`,
          data: data,
          backgroundColor: "rgba(255, 107, 107, 0.6)",
          borderColor: "rgba(255, 107, 107, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + store.settings.currency;
            },
          },
        },
      },
    },
  });
}

function renderCategories() {
  const categories = calculations.getExpensesByCategory();
  const grid = document.getElementById("categoriesGrid");
  grid.innerHTML = "";

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#95E1D3",
    "#F38181",
    "#FFD93D",
    "#6C5CE7",
  ];

  let colorIndex = 0;
  for (const [category, amount] of Object.entries(categories)) {
    const card = document.createElement("div");
    card.className = "category-card";
    card.style.background = `linear-gradient(135deg, ${colors[colorIndex % colors.length]} 0%, ${colors[(colorIndex + 1) % colors.length]} 100%)`;
    card.innerHTML = `
            <h3>${category}</h3>
            <p>${amount.toFixed(2)} ${store.settings.currency}/м</p>
        `;
    grid.appendChild(card);
    colorIndex++;
  }
}

function renderAlerts() {
  const container = document.getElementById("alerts-container");
  container.innerHTML = "";

  const nextPayment = calculations.getNextPayment();
  if (nextPayment && nextPayment.daysUntil <= 3) {
    const alert = document.createElement("div");
    alert.className = "alert alert-warning";
    alert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <strong>⚠️ Платіж завтра!</strong> ${nextPayment.service} буде списано ${nextPayment.date}
            </div>
        `;
    container.appendChild(alert);
  }

  if (store.subscriptions.length === 0) {
    const alert = document.createElement("div");
    alert.className = "alert alert-info";
    alert.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div>
                <strong>Привіт! 👋</strong> Почни з додавання своєї першої підписки.
            </div>
        `;
    container.appendChild(alert);
  }
}

// ===== SUBSCRIPTIONS LIST =====
function renderSubscriptionsList() {
  filterSubscriptions();
}

function filterSubscriptions() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const sortFilter = document.getElementById("sortFilter").value;
  const searchFilter = document
    .getElementById("searchFilter")
    .value.toLowerCase();

  let filtered = [...store.subscriptions];

  // Filter by category
  if (categoryFilter) {
    filtered = filtered.filter((s) => s.category === categoryFilter);
  }

  // Filter by search
  if (searchFilter) {
    filtered = filtered.filter((s) =>
      s.name.toLowerCase().includes(searchFilter),
    );
  }

  // Sort
  switch (sortFilter) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "date":
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  renderSubscriptions(filtered);
}

function renderSubscriptions(subscriptions) {
  const list = document.getElementById("subscriptionsList");
  list.innerHTML = "";

  if (subscriptions.length === 0) {
    list.innerHTML =
      '<p style="text-align: center; padding: 2rem; color: #95A5A6;">Немає активних підписок</p>';
    return;
  }

  subscriptions.forEach((sub) => {
    const card = document.createElement("div");
    card.className = "subscription-card";

    const nextPaymentDate = dayjs(sub.nextBillingDate);
    const daysUntilPayment = nextPaymentDate.diff(dayjs(), "day");

    const monthlyPrice = calculations.convertToMonthly(
      sub.price,
      sub.billingCycle,
    );

    card.innerHTML = `
            <div class="subscription-header">
                <div>
                    <h3>${sub.name}</h3>
                    <span class="subscription-badge">${sub.billingCycle === "monthly" ? "ЩОМІСЯЧНА" : "ЩОРІЧНА"}</span>
                </div>
                <i class="fas fa-${getServiceIcon(sub.category)}"></i>
            </div>
            <div class="subscription-body">
                <div class="subscription-info">
                    <span><strong>Категорія:</strong> ${sub.category}</span>
                    <span><strong>Дата оплати:</strong> ${nextPaymentDate.format("DD.MM.YYYY")}</span>
                    <span><strong>За ${daysUntilPayment} днів</strong></span>
                </div>
                <div class="subscription-price">${sub.price} ${sub.currency}</div>
                <p style="font-size: 0.85rem; color: #95A5A6;">= ${monthlyPrice.toFixed(2)} ${sub.currency}/месяц</p>
                <div class="subscription-actions">
                    <button class="btn-edit" onclick="openEditModal(${sub.id})">
                        <i class="fas fa-edit"></i> Редагувати
                    </button>
                    <button class="btn-delete" onclick="deleteSubscription(${sub.id})">
                        <i class="fas fa-trash"></i> Видалити
                    </button>
                </div>
            </div>
        `;
    list.appendChild(card);
  });
}

function getServiceIcon(category) {
  const icons = {
    Стрімінг: "film",
    Робота: "briefcase",
    "Хмарні сховища": "cloud",
    Спорт: "dumbbell",
    Інше: "box",
  };
  return icons[category] || "box";
}

// ===== ADD SERVICE =====
function populatePopularServices() {
  const container = document.getElementById("popularServices");
  container.innerHTML = "";

  const searchTerm =
    document.getElementById("popularSearch")?.value.toLowerCase() || "";

  const filtered = POPULAR_SERVICES.filter((service) =>
    service.name.toLowerCase().includes(searchTerm),
  );

  filtered.forEach((service) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "popular-service-btn";
    btn.innerHTML = `
            <div>${service.name}</div>
            <small>${service.category}</small><br>
            <strong>${service.price} ₴</strong>
        `;
    btn.onclick = () => selectPopularService(service);
    container.appendChild(btn);
  });
}

function selectPopularService(service) {
  document.getElementById("serviceName").value = service.name;
  document.getElementById("servicePrice").value = service.price;
  document.getElementById("serviceCategory").value = service.category;
  setDefaultBillingDate();
}

document
  .getElementById("popularSearch")
  ?.addEventListener("keyup", populatePopularServices);

function setDefaultBillingDate() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dateString = tomorrow.toISOString().split("T")[0];
  document.getElementById("nextBillingDate").value = dateString;
}

document
  .getElementById("addServiceForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const subscription = {
      name: document.getElementById("serviceName").value,
      price: parseFloat(document.getElementById("servicePrice").value),
      currency: document.getElementById("serviceCurrency").value,
      billingCycle: document.getElementById("serviceBillingCycle").value,
      category: document.getElementById("serviceCategory").value,
      nextBillingDate: document.getElementById("nextBillingDate").value,
      description: document.getElementById("serviceDescription").value,
    };

    store.addSubscription(subscription);
    calculations = new SubscriptionCalculations(
      store.subscriptions,
      store.settings,
    );

    // Reset form
    this.reset();
    setDefaultBillingDate();

    // Show success message
    alert("✅ Підписка додана успішно!");
    showPage("dashboard");
  });

// ===== INSIGHTS =====
function updateInsights() {
  renderMonthlyChart();
  renderCategoryChart();
  renderAdvice();
  renderForecast();
}

function renderMonthlyChart() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  const trend = calculations.getMonthlyTrend(6);
  const labels = Object.keys(trend);
  const data = Object.values(trend);

  const existingChart = Chart.helpers.getChart(ctx);
  if (existingChart) existingChart.destroy();

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Витрати, ${store.settings.currency}`,
          data: data,
          borderColor: "rgba(255, 107, 107, 1)",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + store.settings.currency;
            },
          },
        },
      },
    },
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const categories = calculations.getExpensesByCategory();
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#95E1D3",
    "#F38181",
    "#FFD93D",
    "#6C5CE7",
  ];

  const existingChart = Chart.helpers.getChart(ctx);
  if (existingChart) existingChart.destroy();

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function renderAdvice() {
  const advice = calculations.getFinancialAdvice();
  const container = document.getElementById("adviceList");
  container.innerHTML = "";

  if (advice.length === 0) {
    container.innerHTML =
      '<p style="color: #95A5A6;">Все добре! 👍 Твої витрати здаються розумні.</p>';
    return;
  }

  advice.forEach((item) => {
    const adviceItem = document.createElement("div");
    adviceItem.className = "advice-item";
    adviceItem.innerHTML = `
            <strong>${item.title}</strong>
            ${item.message}
        `;
    container.appendChild(adviceItem);
  });
}

function renderForecast() {
  const grid = document.getElementById("forecastGrid");
  grid.innerHTML = "";

  const monthlyTotal = calculations.getMonthlyTotal();
  const yearlyTotal = calculations.getYearlyTotal();

  const items = [
    { label: "На цей місяць", value: monthlyTotal },
    { label: "На цей рік", value: yearlyTotal },
    { label: "На наступні 3 місяці", value: monthlyTotal * 3 },
    { label: "За останні 12 місяців", value: yearlyTotal },
  ];

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
            <div class="forecast-card-label">${item.label}</div>
            <div class="forecast-card-value">${item.value.toFixed(2)} ${store.settings.currency}</div>
        `;
    grid.appendChild(card);
  });
}

// ===== CALENDAR =====
let currentCalendarDate = dayjs();

function initializeCalendar() {
  renderCalendar();
  renderUpcomingPayments();
}

function renderCalendar() {
  const firstDay = currentCalendarDate.startOf("month");
  const lastDay = currentCalendarDate.endOf("month");
  const daysInMonth = currentCalendarDate.daysInMonth();

  document.getElementById("calendarMonthYear").textContent =
    currentCalendarDate.format("MMMM YYYY", { locale: "uk" });

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  // Days of week headers
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  dayNames.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    grid.appendChild(header);
  });

  // Previous month's days
  const startDay = firstDay.day() === 0 ? 6 : firstDay.day() - 1;
  const prevLastDay = firstDay.subtract(1, "day");
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevLastDay.subtract(i, "day");
    const dayElement = createCalendarDay(day, true);
    grid.appendChild(dayElement);
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = currentCalendarDate.date(i);
    const dayElement = createCalendarDay(day, false);
    grid.appendChild(dayElement);
  }

  // Next month's days
  const endDay = lastDay.day() === 0 ? 6 : lastDay.day() - 1;
  for (let i = 1; i <= 6 - endDay; i++) {
    const day = lastDay.add(i, "day");
    const dayElement = createCalendarDay(day, true);
    grid.appendChild(dayElement);
  }
}

function createCalendarDay(date, isOtherMonth) {
  const dayElement = document.createElement("div");
  dayElement.className = "calendar-day";
  if (isOtherMonth) dayElement.classList.add("other-month");
  if (date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD"))
    dayElement.classList.add("today");

  dayElement.innerHTML = `<div class="calendar-day-number">${date.date()}</div>`;

  // Add payments for this day
  const paymentsOnDay = getPaymentsOnDay(date);
  paymentsOnDay.forEach((payment) => {
    const paymentEl = document.createElement("div");
    paymentEl.className = "calendar-payment";
    paymentEl.textContent = payment;
    paymentEl.title = payment;
    dayElement.appendChild(paymentEl);
  });

  return dayElement;
}

function getPaymentsOnDay(date) {
  const payments = [];
  const dateStr = date.format("YYYY-MM-DD");

  store.subscriptions.forEach((sub) => {
    const billingDate = dayjs(sub.nextBillingDate);

    if (billingDate.format("YYYY-MM-DD") === dateStr) {
      payments.push(sub.name);
    }
  });

  return payments;
}

function previousMonth() {
  currentCalendarDate = currentCalendarDate.subtract(1, "month");
  renderCalendar();
  renderUpcomingPayments();
}

function nextMonth() {
  currentCalendarDate = currentCalendarDate.add(1, "month");
  renderCalendar();
  renderUpcomingPayments();
}

function renderUpcomingPayments() {
  const container = document.getElementById("upcomingPayments");
  container.innerHTML = "";

  const daysInMonth = currentCalendarDate.daysInMonth();
  const events = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const day = currentCalendarDate.date(i);
    const payments = getPaymentsOnDay(day);
    if (payments.length > 0) {
      events[day.format("YYYY-MM-DD")] = payments;
    }
  }

  if (Object.keys(events).length === 0) {
    container.innerHTML =
      '<p style="color: #95A5A6;">Немає платежів цього місяця</p>';
    return;
  }

  for (const [date, payments] of Object.entries(events)) {
    const dateObj = dayjs(date);
    const item = document.createElement("div");
    item.className = "upcoming-payment-item";
    item.innerHTML = `
            <div>
                <strong>${dateObj.format("DD MMM", { locale: "uk" })}</strong><br>
                ${payments.join(", ")}
            </div>
            <i class="fas fa-calendar"></i>
        `;
    container.appendChild(item);
  }
}

// ===== SETTINGS =====
function loadSettings() {
  // Currency
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  currencyRadios.forEach((radio) => {
    radio.checked = radio.value === store.settings.currency;
    radio.addEventListener("change", function () {
      store.settings.currency = this.value;
      store.saveSettings();
      calculations = new SubscriptionCalculations(
        store.subscriptions,
        store.settings,
      );
      updateDashboard();
    });
  });

  // Notifications
  document.getElementById("notificationsDays").checked =
    store.settings.notificationsEnabled;
  document.getElementById("notificationsDaysValue").value =
    store.settings.notificationsDays;
  document.getElementById("emailNotifications").checked =
    store.settings.emailNotifications;
  document.getElementById("telegramNotifications").checked =
    store.settings.telegramNotifications;
  document.getElementById("telegramId").value = store.settings.telegramId;

  // Event listeners for settings changes
  document
    .getElementById("notificationsDays")
    ?.addEventListener("change", function () {
      store.settings.notificationsEnabled = this.checked;
      store.saveSettings();
    });

  document
    .getElementById("notificationsDaysValue")
    ?.addEventListener("change", function () {
      store.settings.notificationsDays = parseInt(this.value);
      store.saveSettings();
    });

  document
    .getElementById("emailNotifications")
    ?.addEventListener("change", function () {
      store.settings.emailNotifications = this.checked;
      store.saveSettings();
    });

  document
    .getElementById("telegramNotifications")
    ?.addEventListener("change", function () {
      store.settings.telegramNotifications = this.checked;
      store.saveSettings();
    });

  document
    .getElementById("telegramId")
    ?.addEventListener("change", function () {
      store.settings.telegramId = this.value;
      store.saveSettings();
    });
}

function exportToCSV() {
  store.exportToCSV();
}

function exportToJSON() {
  store.exportToJSON();
}

function importData() {
  const input = document.getElementById("importInput");
  input.click();
  input.addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        store.subscriptions = data;
        store.saveSubscriptions();
        calculations = new SubscriptionCalculations(
          store.subscriptions,
          store.settings,
        );
        alert("✅ Дані імпортовані успішно!");
        location.reload();
      } catch (error) {
        alert("❌ Помилка імпорту даних!");
      }
    };
    reader.readAsText(file);
  });
}

function clearAllData() {
  store.clearAllData();
}

// ===== MODAL =====
function openEditModal(subscriptionId) {
  const subscription = store.subscriptions.find((s) => s.id === subscriptionId);
  if (!subscription) return;

  document.getElementById("editServiceId").value = subscription.id;
  document.getElementById("editServiceName").value = subscription.name;
  document.getElementById("editServicePrice").value = subscription.price;
  document.getElementById("editServiceCategory").value = subscription.category;
  document.getElementById("editNextBillingDate").value =
    subscription.nextBillingDate;

  const modal = document.getElementById("editModal");
  modal.classList.add("active");
}

function closeEditModal() {
  const modal = document.getElementById("editModal");
  modal.classList.remove("active");
}

document
  .getElementById("editServiceForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = parseInt(document.getElementById("editServiceId").value);
    const updatedData = {
      name: document.getElementById("editServiceName").value,
      price: parseFloat(document.getElementById("editServicePrice").value),
      category: document.getElementById("editServiceCategory").value,
      nextBillingDate: document.getElementById("editNextBillingDate").value,
    };

    store.updateSubscription(id, updatedData);
    calculations = new SubscriptionCalculations(
      store.subscriptions,
      store.settings,
    );
    closeEditModal();
    renderSubscriptionsList();
    alert("✅ Підписка оновлена!");
  });

function deleteSubscription(subscriptionId) {
  if (confirm("Ви впевнені що хочете видалити цю підписку?")) {
    store.deleteSubscription(subscriptionId);
    calculations = new SubscriptionCalculations(
      store.subscriptions,
      store.settings,
    );
    renderSubscriptionsList();
    updateDashboard();
    alert("✅ Підписка видалена!");
  }
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  updateDashboard();
  populatePopularServices();
  setDefaultBillingDate();

  // Set initial state
  document.querySelector(".nav-link")?.classList.add("active");
});

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("editModal");
  if (event.target == modal) {
    closeEditModal();
  }
});

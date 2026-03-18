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

  const existingChart = Chart.getChart(ctx);
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

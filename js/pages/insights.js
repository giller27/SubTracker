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

  const existingChart = Chart.getChart(ctx);
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

  const existingChart = Chart.getChart(ctx);
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

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

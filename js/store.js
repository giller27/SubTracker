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

// ===== GLOBAL STATE =====
let store = new SubscriptionStore();

// ===== SETTINGS =====
function loadSettings() {
  // Currency
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  currencyRadios.forEach((radio) => {
    radio.checked = radio.value === store.settings.currency;
  });

  // Notifications - заповнюємо значення з сховища
  const notificationsDays = document.getElementById("notificationsDays");
  if (notificationsDays) {
    notificationsDays.checked = store.settings.notificationsEnabled;
  }

  const notificationsDaysValue = document.getElementById(
    "notificationsDaysValue",
  );
  if (notificationsDaysValue) {
    notificationsDaysValue.value = store.settings.notificationsDays;
  }

  const emailNotifications = document.getElementById("emailNotifications");
  if (emailNotifications) {
    emailNotifications.checked = store.settings.emailNotifications;
  }

  const telegramNotifications = document.getElementById(
    "telegramNotifications",
  );
  if (telegramNotifications) {
    telegramNotifications.checked = store.settings.telegramNotifications;
  }

  const telegramId = document.getElementById("telegramId");
  if (telegramId) {
    telegramId.value = store.settings.telegramId;
  }
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

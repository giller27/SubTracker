// ===== PAGE LOADER =====
// Завантажує HTML сторінок динамічно

let isLoadingPage = false;

async function loadPage(pageName) {
  try {
    console.log(`Loading page: ${pageName}`);
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load ${pageName}.html (${response.status})`);
    }
    const html = await response.text();
    console.log(`Page loaded successfully: ${pageName}`);

    // Очищаємо контейнер і завантажуємо нову сторінку
    const container = document.getElementById("pages-container");
    if (!container) {
      console.error("Container not found!");
      return false;
    }

    // Очищаємо старий контент
    container.innerHTML = "";

    // Створюємо тимчасовий контейнер для парсингу HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    console.log(`Temp div children count: ${tempDiv.children.length}`);

    // Знаходимо перший елемент (пропускаємо коментарі)
    let firstChild = tempDiv.firstElementChild;
    console.log(`First child element:`, firstChild);
    console.log(`First child tag:`, firstChild?.tagName);
    console.log(`First child ID:`, firstChild?.id);
    console.log(`First child classes:`, firstChild?.className);

    // Додаємо класи до першого елементу
    if (firstChild) {
      firstChild.classList.remove("active"); // Видаляємо активний клас, якщо був
      firstChild.classList.add("page", "active");
      console.log(`Updated classes:`, firstChild.className);
    }

    // Копіюємо контент в основний контейнер
    while (tempDiv.firstChild) {
      container.appendChild(tempDiv.firstChild);
    }

    console.log(
      `Container after update:`,
      container.innerHTML.substring(0, 200),
    );
    console.log(`Container content length: ${container.innerHTML.length}`);

    // Перевіримо, що контейнер видимий
    const computedStyle = window.getComputedStyle(container);
    console.log(`Container display:`, computedStyle.display);
    console.log(`Container visibility:`, computedStyle.visibility);
    console.log(`Container height:`, computedStyle.height);

    // Перевіримо, що перший дочірній елемент видимий
    const pageElement = container.firstElementChild;
    if (pageElement) {
      const pageStyle = window.getComputedStyle(pageElement);
      console.log(`Page element display:`, pageStyle.display);
      console.log(`Page element visibility:`, pageStyle.visibility);
      console.log(`Page element height:`, pageStyle.height);
    }

    // Додаємо обробники подій після завантаження DOM
    initializePageEvents(pageName);

    return true;
  } catch (error) {
    console.error("Error loading page:", error);
    return false;
  }
}

function initializePageEvents(pageName) {
  if (pageName === "add-service") {
    // Додаємо обробник для пошуку популярних сервісів
    const popularSearch = document.getElementById("popularSearch");
    if (popularSearch) {
      popularSearch.addEventListener("keyup", populatePopularServices);
    }

    // Додаємо обробник для додавання нового сервісу
    const addServiceForm = document.getElementById("addServiceForm");
    if (addServiceForm) {
      addServiceForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const subscription = {
          id: Date.now(),
          name: document.getElementById("serviceName").value,
          price: parseFloat(document.getElementById("servicePrice").value),
          currency: document.getElementById("serviceCurrency").value,
          billingCycle: document.getElementById("serviceBillingCycle").value,
          category: document.getElementById("serviceCategory").value,
          nextBillingDate: new Date(
            document.getElementById("nextBillingDate").value,
          ),
          dateAdded: new Date(),
          description:
            document.getElementById("serviceDescription").value || "",
        };

        store.addSubscription(subscription);
        addServiceForm.reset();
        setDefaultBillingDate();
        alert("✅ Підписку додано успішно!");
      });
    }
  } else if (pageName === "subscriptions") {
    // Додаємо обробники для фільтрів
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const searchFilter = document.getElementById("searchFilter");

    if (categoryFilter)
      categoryFilter.addEventListener("change", filterSubscriptions);
    if (sortFilter) sortFilter.addEventListener("change", filterSubscriptions);
    if (searchFilter)
      searchFilter.addEventListener("keyup", filterSubscriptions);
  } else if (pageName === "settings") {
    // Додаємо обробники для налаштувань
    const currencyOptions = document.querySelectorAll("input[name='currency']");
    currencyOptions.forEach((option) => {
      option.addEventListener("change", function () {
        store.settings.currency = this.value;
        store.saveSettings();
        calculations = new SubscriptionCalculations(
          store.subscriptions,
          store.settings,
        );
      });
    });

    const notificationsDaysCheckbox =
      document.getElementById("notificationsDays");
    if (notificationsDaysCheckbox) {
      notificationsDaysCheckbox.addEventListener("change", function () {
        store.settings.notificationsEnabled = this.checked;
        store.saveSettings();
      });
    }

    const notificationsDaysValue = document.getElementById(
      "notificationsDaysValue",
    );
    if (notificationsDaysValue) {
      notificationsDaysValue.addEventListener("change", function () {
        store.settings.notificationsDays = parseInt(this.value);
        store.saveSettings();
      });
    }

    const emailNotifications = document.getElementById("emailNotifications");
    if (emailNotifications) {
      emailNotifications.addEventListener("change", function () {
        store.settings.emailNotifications = this.checked;
        store.saveSettings();
      });
    }

    const telegramNotifications = document.getElementById(
      "telegramNotifications",
    );
    if (telegramNotifications) {
      telegramNotifications.addEventListener("change", function () {
        store.settings.telegramNotifications = this.checked;
        store.saveSettings();
      });
    }

    const telegramId = document.getElementById("telegramId");
    if (telegramId) {
      telegramId.addEventListener("change", function () {
        store.settings.telegramId = this.value;
        store.saveSettings();
      });
    }
  }
}

// Обробник історії навігації (для кнопки "Назад" в браузері)
window.addEventListener("popstate", function (e) {
  const pageId = e.state?.page || "dashboard";
  console.log(`Popstate event: ${pageId}`);
  showPage(pageId);
});
async function showPage(pageId) {
  if (isLoadingPage) {
    console.log("Page is already loading, skipping...");
    return;
  }

  isLoadingPage = true;
  console.log(`showPage called with: ${pageId}`);

  // Змінюємо URL без перезавантаження сторінки
  window.history.pushState({ page: pageId }, "", `#${pageId}`);

  // Оновлюємо активний навігаційний елемент
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Завантажуємо сторінку
  const loaded = await loadPage(pageId);
  if (!loaded) {
    console.error("Failed to load page:", pageId);
    isLoadingPage = false;
    return;
  }

  // Виконуємо специфічне ініціалізацію для сторінки
  if (pageId === "dashboard") {
    setTimeout(() => {
      updateDashboard();
      isLoadingPage = false;
    }, 100);
  } else if (pageId === "subscriptions") {
    setTimeout(() => {
      renderSubscriptionsList();
      isLoadingPage = false;
    }, 100);
  } else if (pageId === "add-service") {
    setTimeout(() => {
      populatePopularServices();
      setDefaultBillingDate();
      isLoadingPage = false;
    }, 100);
  } else if (pageId === "insights") {
    setTimeout(() => {
      updateInsights();
      isLoadingPage = false;
    }, 100);
  } else if (pageId === "calendar") {
    setTimeout(() => {
      initializeCalendar();
      isLoadingPage = false;
    }, 100);
  } else if (pageId === "settings") {
    setTimeout(() => {
      loadSettings();
      isLoadingPage = false;
    }, 100);
  } else {
    isLoadingPage = false;
  }
}

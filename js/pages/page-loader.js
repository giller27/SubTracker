// ===== PAGE LOADER =====
// Завантажує HTML сторінок динамічно

let isLoadingPage = false;

async function loadPage(pageName) {
  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load ${pageName}.html (${response.status})`);
    }
    const html = await response.text();

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

    // Знаходимо перший елемент (пропускаємо коментарі)
    let firstChild = tempDiv.firstElementChild;

    // Додаємо класи до першого елементу
    if (firstChild) {
      firstChild.classList.remove("active"); // Видаляємо активний клас, якщо був
      firstChild.classList.add("page", "active");
    }

    // Копіюємо контент в основний контейнер
    while (tempDiv.firstChild) {
      container.appendChild(tempDiv.firstChild);
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

    const notificationsCheckbox = document.getElementById(
      "notificationsEnabled",
    );
    if (notificationsCheckbox) {
      notificationsCheckbox.addEventListener("change", function () {
        store.settings.notificationsEnabled = this.checked;
        store.saveSettings();
      });
    }
  }
}

// Обробник історії навігації (для кнопки "Назад" в браузері)
window.addEventListener("popstate", function (e) {
  const pageId = e.state?.page || "dashboard";
  showPage(pageId);
});
async function showPage(pageId) {
  if (isLoadingPage) {
    return;
  }

  isLoadingPage = true;

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

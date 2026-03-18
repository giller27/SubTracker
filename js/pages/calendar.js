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

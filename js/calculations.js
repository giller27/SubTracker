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
let calculations = new SubscriptionCalculations(
  store.subscriptions,
  store.settings,
);

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

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("editModal");
  if (event.target == modal) {
    closeEditModal();
  }
});

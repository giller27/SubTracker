// ===== ADD SERVICE =====
function populatePopularServices() {
  const container = document.getElementById("popularServices");
  container.innerHTML = "";

  const searchTerm =
    document.getElementById("popularSearch")?.value.toLowerCase() || "";

  const filtered = POPULAR_SERVICES.filter((service) =>
    service.name.toLowerCase().includes(searchTerm),
  );

  filtered.forEach((service) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "popular-service-btn";
    btn.innerHTML = `
            <div>${service.name}</div>
            <small>${service.category}</small><br>
            <strong>${service.price} ₴</strong>
        `;
    btn.onclick = () => selectPopularService(service);
    container.appendChild(btn);
  });
}

function selectPopularService(service) {
  document.getElementById("serviceName").value = service.name;
  document.getElementById("servicePrice").value = service.price;
  document.getElementById("serviceCategory").value = service.category;
  setDefaultBillingDate();
}

function setDefaultBillingDate() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dateString = tomorrow.toISOString().split("T")[0];
  document.getElementById("nextBillingDate").value = dateString;
}

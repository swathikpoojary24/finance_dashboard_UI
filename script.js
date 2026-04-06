// localStorage
const saved = localStorage.getItem("transactions");
if (saved) {
  transactions = JSON.parse(saved);
}

let role = "viewer";

const ROLES = {
  admin: { label: "Admin", name: "Admin" },
  viewer: { label: "Viewer", name: "Swathi" }
};

// Initial load 
document.getElementById("roleSelect").value = role;
document.getElementById("username").innerText = "Welcome " + ROLES[role].name + " 👋";
document.getElementById("adminControls").style.display = role === "viewer" ? "none" : "block";

// Switch role
function changeRole() {
  role = document.getElementById("roleSelect").value;
  const user = ROLES[role];
  document.getElementById("username").innerText = "Welcome " + user.name + " 👋";
  document.getElementById("adminControls").style.display = role === "viewer" ? "none" : "block";
}

// Empty data
const noData = document.getElementById("noDataMsg");
if (!transactions || transactions.length === 0) {
  if (noData) noData.style.display = "block";
}

// Summary
function updateSummary(data) {
  let income = 0;
  let expense = 0;

  data.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.getElementById("income").innerText = "₹" + income.toLocaleString('en-IN');
  document.getElementById("expense").innerText = "₹" + expense.toLocaleString('en-IN');
  document.getElementById("balance").innerText = "₹" + (income - expense).toLocaleString('en-IN');
}

// Add transaction
function addTransaction() {
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value.trim();
  const type = document.getElementById("type").value;

  if (!amount || amount <= 0 || !category) {
    alert("Please enter a valid amount and category.");
    return;
  }

  const newT = {
    date: new Date().toISOString().split("T")[0],
    amount: amount,
    category: category,
    type: type
  };

  transactions.push(newT);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  updateSummary(transactions);
  renderTable(transactions);
  renderCharts(transactions);
  showInsights(transactions);
}

// filter data
function filterData() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = transactions.filter(t =>
    t.category.toLowerCase().includes(value)
  );

  renderTable(filtered);
  renderCharts(filtered);
  showInsights(filtered);

  if (value === "") {
    updateSummary(transactions);
    document.getElementById("filteredTotal").innerText = "";
  } else {
    showFilteredTotal(filtered);
    updateSummary(filtered);
  }
}

// filtered total
function showFilteredTotal(data) {
  let total = 0;

  data.forEach(t => {
    total += t.amount;
  });

  document.getElementById("filteredTotal").innerText =
    "Total based on your search: ₹" + total.toLocaleString("en-IN");
}

// Table
function renderTable(data) {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  data.forEach(t => {
    const badgeClass = t.type === "income" ? "bg-success" : "bg-danger";
    table.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>₹${t.amount.toLocaleString('en-IN')}</td>
        <td>${t.category}</td>
        <td><span class="badge ${badgeClass}">${t.type}</span></td>
      </tr>
    `;
  });
}

// Insights
function showInsights(data) {
  let categoryTotal = {};

  data.forEach(t => {
    if (t.type === "expense") {
      categoryTotal[t.category] = (categoryTotal[t.category] || 0) + t.amount;
    }
  });

  const keys = Object.keys(categoryTotal);

  if (keys.length === 0) {
    document.getElementById("insights").innerText = "📊 No expense data yet.";
    return;
  }

  let highest = keys.reduce((a, b) => categoryTotal[a] > categoryTotal[b] ? a : b);
  document.getElementById("insights").innerText = "📊 Highest spending category: " + highest;
}

// Charts
function renderCharts(data) {
  const categories = {};
  const monthly = {};

  data.forEach(t => {
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
    const month = t.date.slice(0, 7);
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    monthly[month][t.type] += t.amount;
  });

  if (window.expChart) window.expChart.destroy();
  if (window.monthChart) window.monthChart.destroy();

  window.expChart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{ data: Object.values(categories) }]},
      options: {
      responsive: true,
      plugins: {
      legend: {
        position: "bottom",    
        labels: {
          padding: 6,
          font: { size: 12}
        }
      }
    },
  }
  });
  
  const labels = Object.keys(monthly).sort().map(m => {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  });

  window.monthChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Income",
          data: Object.values(monthly).map(v => v.income),
          backgroundColor: "#22c55e",
          borderRadius: 6,
          barPercentage: 0.4 
        },
        {
          label: "Expenses",
          data: Object.values(monthly).map(v => v.expense),
          backgroundColor: "#ef4444",
          borderRadius: 6,
          barPercentage: 0.4 
        }
      ]
    }
  });
}

// Dark mode
function toggleDark() {
  const html = document.documentElement;
  html.setAttribute("data-bs-theme",
    html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"
  );
}

// Initial render
updateSummary(transactions);
renderTable(transactions);
renderCharts(transactions);
showInsights(transactions);
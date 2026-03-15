
// ====================== Get Products from API ======================
async function getProducts() {
  const res = await fetch("https://69b10cdeadac80b427c3d349.mockapi.io/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.filter(p => p.id);
}

// ====================== Color Palette ======================
const COLOR_PALETTE = [
  "#2d3ab1", "#74c0fc", "#4dd9e0", "#ffa94d",
  "#f06595", "#a9e34b", "#cc5de8", "#20c997",
  "#ff6b6b", "#339af0"
];

function getColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// ====================== Dashboard Data ======================
async function getDashboardData() {
  const products = await getProducts();

  
  const categorySalesMap = {};
  const categoryStockMap = {};

  products.forEach(p => {
    const cat = p.category || "Other";
    const revenue = (p.price || 0) * (p.stock || 0); 

    if (!categorySalesMap[cat]) {
      categorySalesMap[cat] = 0;
      categoryStockMap[cat] = 0;
    }
    categorySalesMap[cat] += revenue;
    categoryStockMap[cat] += (p.stock || 0);
  });

  const totalSales = Object.values(categorySalesMap).reduce((a, b) => a + b, 0);
  const totalOrders = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalCustomers = products.length;

  return {
    products,
    totalSales,
    totalOrders,
    totalCustomers,
    categorySalesMap,
    dailySales: generateDailyData(totalSales),
    weeklyData: generateWeeklyData(products)
  };
}

// ====================== Data Generators ======================
function generateDailyData(total) {
  const arr = [];
  const base = Math.max(20, Math.floor(total / 18));
  for (let i = 0; i < 18; i++) {
    const v = Math.floor(Math.random() * 30) - 15;
    arr.push(Math.max(5, base + v));
  }
  return arr;
}

function generateWeeklyData(products) {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 3);
  const datasets = {};
  categories.forEach(cat => {
    datasets[cat] = [];
    for (let i = 0; i < 7; i++) {
      datasets[cat].push(Math.floor(20 + Math.random() * 60));
    }
  });
  return { categories, datasets };
}

// ====================== Render Stats ======================
async function renderStats() {
  
   const data = await getDashboardData();

  const MONTHLY_GOAL = 1000;

  document.getElementById("totalSalesValue").textContent = `$${data.totalSales.toLocaleString()}`;
  document.getElementById("customersValue").textContent = data.totalCustomers.toLocaleString();
  document.getElementById("ordersValue").textContent = data.totalOrders.toLocaleString();

  //  Orders progress - dynamic
  const left = Math.max(0, MONTHLY_GOAL - data.totalOrders);
  const percent = Math.min(100, (data.totalOrders / MONTHLY_GOAL) * 100).toFixed(1);

  document.getElementById("ordersLeft").textContent = `${left.toLocaleString()} Left`;
  document.getElementById("ordersProgress").style.width = `${percent}%`;
}

// ====================== Render Charts ======================
async function renderCharts() {
  const data = await getDashboardData();

  // ── Mini Bar Chart (Daily Sales) ──
  new Chart(document.getElementById("salesBar"), {
    type: "bar",
    data: {
      labels: Array(18).fill(""),
      datasets: [{
        data: data.dailySales,
        backgroundColor: "#6366f1",
        barThickness: 8
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });

  // ── Mini Line Chart (Customers) ──
  const lineData = Array.from({ length: 14 }, (_, i) =>
    Math.floor(data.totalCustomers + Math.sin(i * 0.8) * 5)
  );
  new Chart(document.getElementById("customersLine"), {
    type: "line",
    data: {
      labels: Array(14).fill(""),
      datasets: [{
        data: lineData,
        borderColor: "#6366f1",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });

 
  const categories = Object.keys(data.categorySalesMap);
  const values = Object.values(data.categorySalesMap);
  const colors = categories.map((_, i) => getColor(i));

 
  const legendContainer = document.getElementById("donutLegend");
  legendContainer.innerHTML = categories.map((cat, i) => `
    <div>
      <div class="d-flex align-items-center gap-2 legend-name">
        <span class="legend-dot" style="background: ${colors[i]}"></span>
        ${cat}
      </div>
      <div class="legend-val">$${Math.round(values[i]).toLocaleString()}</div>
    </div>
  `).join("");

  new Chart(document.getElementById("donut1"), {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2
      }]
    },
    options: {
      cutout: "70%",
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: true } }
    }
  });


  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const { categories: weekCats, datasets: weekDatasets } = data.weeklyData;

  new Chart(document.getElementById("bar1"), {
    type: "bar",
    data: {
      labels: DAYS,
      datasets: weekCats.map((cat, i) => ({
        label: cat,
        data: weekDatasets[cat],
        backgroundColor: getColor(i),
        borderRadius: 5,
        barThickness: 12
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ====================== Initialize Dashboard ======================
async function initDashboard() {
  await renderStats();
  await renderCharts();
}

document.addEventListener("DOMContentLoaded", initDashboard);
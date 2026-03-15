async function initSellerDashboard() {
  const loggedInUserStr = sessionStorage.getItem('loggedInUser');
  if (!loggedInUserStr) return;

  let user;
  try {
    user = JSON.parse(loggedInUserStr);
  } catch {
    return;
  }

  if (!user || user.role !== 'seller' || !user.id) return;

  // Fetch all products and filter by this seller
  let products = [];
  try {
    const res = await fetch('https://69b10cdeadac80b427c3d349.mockapi.io/products', {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    if (res.ok) {
      const all = await res.json();
      products = all.filter(p => String(p.sellerId) === String(user.id));
    }
  } catch (err) {
    console.error('Failed to load seller products for dashboard', err);
  }

  const total = products.length;
  const approved = products.filter(p => p.status === 1).length;
  const pending = products.filter(p => p.status === 0 || p.status === undefined).length;
  const declined = products.filter(p => p.status === -1).length;

  const totalEl = document.getElementById('sellerTotalProducts');
  const approvedEl = document.getElementById('sellerApprovedProducts');
  const pendingEl = document.getElementById('sellerPendingProducts');
  const declinedEl = document.getElementById('sellerDeclinedProducts');
  const progressBar = document.getElementById('sellerApprovalProgress');

  if (totalEl) totalEl.textContent = String(total);
  if (approvedEl) approvedEl.textContent = String(approved);
  if (pendingEl) pendingEl.textContent = String(pending);
  if (declinedEl) declinedEl.textContent = String(declined);

  if (progressBar) {
    const percentage = total === 0 ? 0 : Math.round((approved / total) * 100);
    progressBar.style.width = `${percentage}%`;
  }

  // Build category distribution for donut chart
  const categoryCounts = {};
  products.forEach(p => {
    const cats = Array.isArray(p.categories) ? p.categories : [p.categories].filter(Boolean);
    cats.forEach(c => {
      const key = String(c).trim();
      if (!key) return;
      categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    });
  });

  const categoryLabels = Object.keys(categoryCounts);
  const categoryData = Object.values(categoryCounts);

  // Fallback if no categories/products yet
  const donutLabels = categoryLabels.length ? categoryLabels : ['No Products'];
  const donutData = categoryData.length ? categoryData : [1];

  const baseColors = ['#2d3ab1', '#74c0fc', '#4dd9e0', '#ffa94d', '#22c55e', '#f97316'];
  const donutColors = donutLabels.map((_, idx) => baseColors[idx % baseColors.length]);

  const salesBarCanvas = document.getElementById('salesBar');
  const customersLineCanvas = document.getElementById('customersLine');
  const donutCanvas = document.getElementById('donut1');
  const barCanvas = document.getElementById('bar1');

  if (salesBarCanvas) {
    new Chart(salesBarCanvas, {
      type: 'bar',
      data: {
        labels: Array(18).fill(''), 
        datasets: [{
          data: [30,50,40,70,55,80,60,90,50,75,65,85,45,70,55,95,60,80],
          backgroundColor: '#6366f1',
          borderRadius: 3,
          barThickness: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true }
        },
        animation: { duration: 800 }
      }
    });
  }

  if (customersLineCanvas) {
    new Chart(customersLineCanvas, {
      type: 'line',
      data: {
        labels: Array(14).fill(''), 
        datasets: [{
          data: [30,45,35,50,40,55,35,60,45,55,40,65,50,60],
          borderColor: '#6366f1',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: false }
        },
        animation: { duration: 800 }
      }
    });
  }

  if (donutCanvas) {
    const CATEGORIES = ['Clothing', 'Shoes', 'Accessories', 'Electronics'];
    new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels: CATEGORIES,
        datasets: [{
          data: [500, 300, 200, 150], 
          backgroundColor: ['#2d3ab1', '#74c0fc', '#4dd9e0', '#ffa94d'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: true, position: 'bottom' } },
        animation: { duration: 1000 }
      }
    });
  }

  if (barCanvas) {
    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: DAYS,
        datasets: [
          {
            label: 'Classic Tees',
            data: [40, 65, 50, 75, 55, 85, 45],
            backgroundColor: '#2d3ab1',
            borderRadius: 5,
            barThickness: 12
          },
          {
            label: 'Sneakers',
            data: [30, 50, 45, 60, 40, 70, 35],
            backgroundColor: '#4dd9e0',
            borderRadius: 5,
            barThickness: 12
          },
          {
            label: 'Accessories',
            data: [20, 35, 30, 40, 25, 50, 20],
            backgroundColor: '#ffa94d',
            borderRadius: 5,
            barThickness: 12
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 12 } }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 20, color: '#6b7280', font: { size: 12 } },
            grid: { color: '#e5e7eb' }
          }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Wait for layout/sidebar/topbar to be in place (for consistency),
  // but our charts only depend on the main content.
  initSellerDashboard();
});
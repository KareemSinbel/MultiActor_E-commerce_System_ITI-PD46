// ── Total Sales Bar ──
new Chart(document.getElementById('salesBar'), {
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

// ── Customers Line ──
new Chart(document.getElementById('customersLine'), {
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

// ── Donut Chart: Product Categories ──
const CATEGORIES = ['Clothing', 'Shoes', 'Accessories', 'Electronics'];
new Chart(document.getElementById('donut1'), {
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

// ── Bar Chart: Weekly Sales for Top Products ──
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
new Chart(document.getElementById('bar1'), {
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
// Demo base product data
const baseProducts = [
  {
    id: 47514501,
    name: 'Raw Black T-Shirt Lineup',
    sku: '47514501',
    price: 75,
    stock: 'In Stock',
    categories: 'T-shirt, Men',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514502,
    name: 'Classic Monochrome Tees',
    sku: '47514502',
    price: 35,
    stock: 'In Stock',
    categories: 'T-shirt, Men',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514503,
    name: 'Monochromatic Wardrobe',
    sku: '47514503',
    price: 27,
    stock: 'In Stock',
    categories: 'T-shirt',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514504,
    name: 'Essential Neutrals',
    sku: '47514504',
    price: 22,
    stock: 'In Stock',
    categories: 'T-shirt, Raw',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514505,
    name: 'UTRAANET Black',
    sku: '47514505',
    price: 43,
    stock: 'In Stock',
    categories: 'T-shirt, Trend',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514506,
    name: 'Elegant Ebony Sweatshirts',
    sku: '47514506',
    price: 35,
    stock: 'In Stock',
    categories: 'T-shirt',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514507,
    name: 'Sleek and Cozy Black',
    sku: '47514507',
    price: 57,
    stock: 'In Stock',
    categories: 'Hoodie',
    image: '../../Images/product.jpg'
  },
  {
    id: 47514508,
    name: 'MOCKUP Black',
    sku: '47514508',
    price: 30,
    stock: 'In Stock',
    categories: 'T-shirt',
    image: '../../Images/product.jpg'
  }
];

// expand base products to many pages so pagination can be tested
const products = [];
for (let i = 0; i < 10; i++) {
  baseProducts.forEach((p, index) => {
    products.push({
      ...p,
      id: p.id + i * 100,
      sku: String(Number(p.sku) + i * 10 + index)
    });
  });
}

// How many rows per page
const pageSize = 8;
let currentPage = 1;
let currentSearch = '';
let currentSortField = 'name';
let currentSortDirection = 'asc';

function renderTable() {
  const tbody = document.querySelector('#productsTableBody');
  if (!tbody) return;

  const filtered = products.filter(p => {
    const term = currentSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.categories.toLowerCase().includes(term)
    );
  });

  // sort
  const sorted = [...filtered].sort((a, b) => {
    if (!currentSortField) return 0;
    let av = a[currentSortField];
    let bv = b[currentSortField];

    if (currentSortField === 'price') {
      av = Number(av);
      bv = Number(bv);
    } else {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }

    if (av < bv) return currentSortDirection === 'asc' ? -1 : 1;
    if (av > bv) return currentSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  tbody.innerHTML = pageItems
    .map(p => {
      const imageSrc = p.image || '../../images/product-placeholder.png';
      return `
      <tr>
        <td>
          <div class="product-thumbnail">
            <img src="${imageSrc}" alt="${p.name}">
          </div>
        </td>
        <td>
          <p class="mb-0 product-name">${p.name}</p>
          <small class="product-meta">ID: ${p.id}</small>
        </td>
        <td>${p.sku}</td>
        <td>$${p.price.toFixed(2)}</td>
        <td><span class="badge bg-success-subtle text-success rounded-pill px-3 py-2">${p.stock}</span></td>
        <td>${p.categories}</td>
        <td class="text-end table-actions">
          <div class="dropdown">
            <button class="more-button" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More actions">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li><button class="dropdown-item py-2 text-danger" type="button"><i class="fa-solid fa-trash me-2"></i>Delete</button></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  const info = document.querySelector('#productsInfo');
  if (info) {
    const from = total === 0 ? 0 : start + 1;
    const to = start + pageItems.length;
    info.textContent = `Showing ${from}–${to} of ${total} products`;
  }

  const pagination = document.querySelector('#productsPagination');
  if (pagination) {
    const items = [];

    const buildPages = () => {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
      }

      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis');

      pages.push(totalPages);
      return pages;
    };

    const pages = buildPages();

    items.push(`
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" data-page="${currentPage - 1}">&lsaquo;</button>
      </li>
    `);

    pages.forEach(p => {
      if (p === 'ellipsis') {
        items.push(`
          <li class="page-item disabled">
            <span class="page-link border-0">…</span>
          </li>
        `);
      } else {
        items.push(`
          <li class="page-item ${p === currentPage ? 'active' : ''}">
            <button class="page-link" data-page="${p}">${p}</button>
          </li>
        `);
      }
    });

    items.push(`
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" data-page="${currentPage + 1}">&rsaquo;</button>
      </li>
    `);

    pagination.innerHTML = items.join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#productsSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value || '';
      currentPage = 1;
      renderTable();
    });
  }

  const pagination = document.querySelector('#productsPagination');
  if (pagination) {
    pagination.addEventListener('click', e => {
      const btn = e.target.closest('button[data-page]');
      if (!btn) return;
      const page = parseInt(btn.getAttribute('data-page'), 10);
      if (!isNaN(page)) {
        currentPage = page;
        renderTable();
      }
    });
  }

  const sortButton = document.querySelector('.sort-button');
  if (sortButton) {
    sortButton.addEventListener('click', () => {
      currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      renderTable();
    });
  }

  renderTable();
});


// Demo base product data
import {productRow} from "../Data Components/productRow.js";


// How many rows per page
const pageSize = 8;
let currentPage = 1;
let currentSearch = '';
let currentSortField = 'name';
let currentSortDirection = 'asc';

function renderTable(productsAPI) 
{
  const tbody = document.querySelector('#productsTableBody');
  
  if (!tbody) 
    return;

  const filtered = productsAPI.filter(p => {
    const term = currentSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.categories.forEach(c => c.toLowerCase().includes(term))
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
    .map(productRow)
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

document.addEventListener('LayoutBuilt',async () => 
{
  const url = new URL('https://69b10cdeadac80b427c3d349.mockapi.io/products');

  const res = await fetch(url, {method: 'GET', headers: {'content-type':'application/json'}})
                    .then(res => 
                      {
                        if(res.ok) 
                          return res;
                      })
                    .catch(error => console.log(`error was occured ${error}`));

  const productsAPI = await res.json();

  const searchInput = document.querySelector('#productsSearch');
  if (searchInput) 
  {
    searchInput.addEventListener('input', (e) => 
    {
      currentSearch = e.target.value || '';
      currentPage = 1;
      renderTable(productsAPI);
    });
  }

  const pagination = document.querySelector('#productsPagination');
  if (pagination) 
  {
    pagination.addEventListener('click', (e) => 
    {
      const btn = e.target.closest('button[data-page]');
      
      if (!btn) 
        return;
      
      const page = parseInt(btn.getAttribute('data-page'), 10);
      
      if (!isNaN(page)) 
      {
        currentPage = page;
        renderTable(productsAPI);
      }
    });
  }

  const sortButton = document.querySelector('.sort-button');
  if (sortButton) 
  {
    sortButton.addEventListener('click', () => 
    {
      currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      renderTable(productsAPI);
    });
  }

  renderTable(productsAPI);
});
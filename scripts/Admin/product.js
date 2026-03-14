import { productRow } from "../Data Components/productRow.js";
import { generatePaginationHTML, sortTableData } from "../Utils/tableUtils.js";


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
  const sorted = sortTableData(filtered, currentSortField, currentSortDirection);

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
      pagination.innerHTML = generatePaginationHTML(currentPage, totalPages);
  }
}

document.addEventListener('LayoutBuilt',async () => 
{
  let fetchUrl = 'https://69b10cdeadac80b427c3d349.mockapi.io/products';
  
  const urlParams = new URLSearchParams(window.location.search);
  const sellerIdParam = urlParams.get('sellerId');
  
  const loggedInUserStr = sessionStorage.getItem('loggedInUser');
  let loggedInUser = null;
  if (loggedInUserStr) {
      try {
          loggedInUser = JSON.parse(loggedInUserStr);
      } catch (e) {
          console.error("Error parsing user info", e);
      }
  }

  if (sellerIdParam) {
      fetchUrl = `https://69b10cdeadac80b427c3d349.mockapi.io/sellers/${sellerIdParam}/products`;
  } else if (loggedInUser && loggedInUser.role === 'seller') {
      fetchUrl = `https://69b10cdeadac80b427c3d349.mockapi.io/sellers/${loggedInUser.id}/products`;
  }

  const url = new URL(fetchUrl);

  const res = await fetch(url, {method: 'GET', headers: {'content-type':'application/json'}})
                    .then(res => 
                      {
                        if(res.ok) 
                          return res;
                      })
                    .catch(error => console.log(`error was occured ${error}`));

  let productsAPI = [];
  if (res && res.ok) {
     productsAPI = await res.json();
  }

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

  const tableBody = document.querySelector('#productsTableBody');
  if (tableBody) {
      tableBody.addEventListener('click', (e) => {
          const deleteBtn = e.target.closest('.btn-delete');
          if (!deleteBtn) return;
          
          const id = deleteBtn.getAttribute('data-id');
          Swal.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, delete it!'
          }).then(async (result) => {
              if (result.isConfirmed) {
                  try {
                      const deleteUrl = `${fetchUrl}/${id}`;
                      const deleteRes = await fetch(deleteUrl, { method: 'DELETE' });
                      if (deleteRes.ok) {
                          productsAPI = productsAPI.filter(p => String(p.id) !== String(id));
                          renderTable(productsAPI);
                          Swal.fire('Deleted!', 'The product has been deleted.', 'success');
                      } else {
                          Swal.fire('Error!', 'Failed to delete product. Please try again.', 'error');
                      }
                  } catch (error) {
                      console.error('Error deleting product:', error);
                      Swal.fire('Error!', 'An error occurred while deleting.', 'error');
                  }
              }
          });
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
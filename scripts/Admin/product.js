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

  let targetSellerId = null;
  if (sellerIdParam) {
      targetSellerId = sellerIdParam;
  } else if (loggedInUser && loggedInUser.role === 'seller') {
      targetSellerId = String(loggedInUser.id);
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
     const allProducts = await res.json();
     productsAPI = Array.isArray(allProducts) ? allProducts : [];
     if (targetSellerId) {
         productsAPI = productsAPI.filter(p => String(p.sellerId) === targetSellerId);
     }
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
          const approveBtn = e.target.closest('.btn-approve');
          const declineBtn = e.target.closest('.btn-decline');

          if (approveBtn) {
              const id = approveBtn.getAttribute('data-id');
              const idx = productsAPI.findIndex(p => String(p.id) === String(id));
              if (idx > -1) {
                  Swal.fire({
                      title: 'Approve Product?',
                      text: "Make this product available?",
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, approve it!'
                  }).then(async (result) => {
                      if (result.isConfirmed) {
                          try {
                              productsAPI[idx].status = 1;
                              const updateUrl = `https://69b10cdeadac80b427c3d349.mockapi.io/products/${id}`;
                              const putRes = await fetch(updateUrl, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(productsAPI[idx])
                              });
                              if (putRes.ok) {
                                  renderTable(productsAPI);
                                  Swal.fire('Approved!', 'The product has been approved.', 'success');
                              } else {
                                  // Revert locally if fail
                                  productsAPI[idx].status = 0;
                                  Swal.fire('Error!', 'Failed to approve.', 'error');
                              }
                          } catch (error) {
                              productsAPI[idx].status = 0;
                              console.error(error);
                          }
                      }
                  });
              }
              return;
          }

          if (declineBtn) {
              const id = declineBtn.getAttribute('data-id');
              const idx = productsAPI.findIndex(p => String(p.id) === String(id));
              if (idx > -1) {
                  Swal.fire({
                      title: 'Decline Product?',
                      text: "Reject this product?",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, decline it!'
                  }).then(async (result) => {
                      if (result.isConfirmed) {
                          try {
                              productsAPI[idx].status = -1;
                              const updateUrl = `https://69b10cdeadac80b427c3d349.mockapi.io/products/${id}`;
                              const putRes = await fetch(updateUrl, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(productsAPI[idx])
                              });
                              if (putRes.ok) {
                                  renderTable(productsAPI);
                                  Swal.fire('Declined!', 'The product has been declined.', 'success');
                              } else {
                                  productsAPI[idx].status = 0;
                                  Swal.fire('Error!', 'Failed to decline.', 'error');
                              }
                          } catch (error) {
                              productsAPI[idx].status = 0;
                              console.error(error);
                          }
                      }
                  });
              }
              return;
          }

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
                      const deleteUrl = `https://69b10cdeadac80b427c3d349.mockapi.io/products/${id}`;
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
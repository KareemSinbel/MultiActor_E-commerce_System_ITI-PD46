export function productRow(p)
{
  let stockObj = {};

  if (!p.image || p.image.trim().length === 0) 
  {
    p.image = './Images/product.jpg';
  }

  if(p.stock > 0)
  {
    stockObj['StockStr'] = "In Stock";
    stockObj['State'] = 'success';
  }
  else
  {
    stockObj['StockStr'] = "Out Of Stock";
    stockObj['State'] = 'danger';
  }

  const statusVal = p.status ?? p.state;
  let statusObj = { StatusStr: 'Pending', State: 'warning' };
  if (statusVal === 1) {
    statusObj.StatusStr = "Approved";
    statusObj.State = "success";
  } else if (statusVal === -1) {
    statusObj.StatusStr = "Declined";
    statusObj.State = "danger";
  } else {
    statusObj.StatusStr = "Pending";
    statusObj.State = "warning";
  }

  return `
  <tr>
      <td>
        <div class="product-thumbnail">
          <img src="${p.image}" alt="${p.name}">
        </div>
      </td>
      <td>
        <p class="mb-0 product-name">${p.name}</p>
        <small class="product-meta">ID: ${p.id}</small>
      </td>
      <td>${p.sku}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td><span class="badge bg-${stockObj['State']}-subtle text-${stockObj['State']} rounded-pill px-3 py-2">${stockObj['StockStr']}</span></td>
      <td><span class="badge bg-${statusObj['State']}-subtle text-${statusObj['State']} rounded-pill px-3 py-2">${statusObj['StatusStr']}</span></td>
      <td>${Array.isArray(p.categories) ? p.categories.join(", ") : (p.category || p.categories || "")}</td>
      <td class="text-end table-actions">
        <div class="dropdown">
          <button class="more-button" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More actions">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
            <li><button class="dropdown-item py-2 text-danger btn-delete" data-action="delete" data-id="${p.id}" type="button"><i class="fa-solid fa-trash me-2"></i>Delete</button></li>
          </ul>
        </div>
      </td>
    </tr>`;
}
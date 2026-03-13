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
    </tr>`;
}
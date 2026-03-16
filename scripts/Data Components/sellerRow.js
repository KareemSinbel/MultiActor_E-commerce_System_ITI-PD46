export function sellerRow(s) {
    // Generate initials from name if not provided
    let initials = s.initials;
    if (!initials && s.name) {
        let nameParts = s.name.split(' ');
        initials = nameParts.length > 1 ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() : s.name.substring(0, 2).toUpperCase();
    }

    const formatInitials = (inits) => {
        return `<div style="width: 48px; height: 48px; border-radius: 4px; background-color: #F6F6F6; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 500;">${inits}</div>`;
    };

    return `
      <tr>
        <td>
          ${formatInitials(initials)}
        </td>
        <td>
          <p class="mb-0 product-name">${s.name}</p>
        </td>
        <td>${s.email}</td>
        <td title="${s.address || 'No address'}" class="address-cell">${s.address || 'No address'}</td>
        <td class="text-end table-actions">
          <div class="dropdown">
            <button class="more-button" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More actions">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li><a class="dropdown-item py-2" href="product.html?sellerId=${s.id}"><i class="fa-solid fa-box-open me-2"></i>Show products</a></li>
              <li><button class="dropdown-item py-2 text-danger btn-delete" data-action="delete" data-id="${s.id}" type="button"><i class="fa-solid fa-trash me-2"></i>Delete</button></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
}

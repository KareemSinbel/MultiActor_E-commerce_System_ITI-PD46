const baseCustomers = [
    { id: 1, name: 'Esther Howard', email: 'esther.howard@gmail.com', address: '8642 Yule Street, Arvada CO 80007', initials: 'EH' },
    { id: 2, name: 'Wade Warren', email: 'wade.warren@gmail.com', address: '5331 Rexford Court, Montgomery AL 36116', initials: 'WW' },
    { id: 3, name: 'Brooklyn Simmons', email: 'brooklyn.simmons@gmail.com', address: '2325 Eastridge Circle, Moore OK 73160', initials: 'BS' },
    { id: 4, name: 'Robert Fox', email: 'robert.fox@gmail.com', address: '2436 Naples Avenue, Panama City FL 32405', initials: 'RF' },
    { id: 5, name: 'Dianne Russell', email: 'dianne.russell@gmail.com', address: '6095 Terry Lane, Golden CO 80403', initials: 'DR' },
    { id: 6, name: 'Ralph Edwards', email: 'ralph.edwards@gmail.com', address: '4001 Anderson Road, Nashville TN 37217', initials: 'RE' },
    { id: 7, name: 'Theresa Webb', email: 'theresa.webb@gmail.com', address: '19141 Pine Ridge Circle, Anchorage AK 99516', initials: 'TW' },
    { id: 8, name: 'Arlene McCoy', email: 'arlene.mccoy@gmail.com', address: '2613 Cottonwood Street, Anchorage AK 99508', initials: 'AM' }
];

const customers = [];
for (let i = 0; i < 10; i++) {
    baseCustomers.forEach((c) => {
        customers.push({
            ...c,
            id: c.id + i * 10
        });
    });
}

const pageSize = 8;
let currentPage = 1;
let currentSearch = '';
let currentSortField = 'name';
let currentSortDirection = 'asc';

function renderTable() {
    const tbody = document.querySelector('#customersTableBody');
    if (!tbody) return;

    const filtered = customers.filter(c => {
        const term = currentSearch.toLowerCase();
        return (
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.address.toLowerCase().includes(term)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        if (!currentSortField) return 0;
        let av = String(a[currentSortField]).toLowerCase();
        let bv = String(b[currentSortField]).toLowerCase();

        if (av < bv) return currentSortDirection === 'asc' ? -1 : 1;
        if (av > bv) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    const formatInitials = (initials) => {
        return `<div style="width: 48px; height: 48px; border-radius: 4px; background-color: #F6F6F6; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 500;">${initials}</div>`;
    };

    tbody.innerHTML = pageItems
        .map(c => {
            return `
      <tr>
        <td>
          ${formatInitials(c.initials)}
        </td>
        <td>
          <p class="mb-0 product-name">${c.name}</p>
        </td>
        <td>${c.email}</td>
        <td>${c.address}</td>
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

    const info = document.querySelector('#customersInfo');
    if (info) {
        const from = total === 0 ? 0 : start + 1;
        const to = start + pageItems.length;
        info.textContent = total === 0 ? 'Showing 0–0 of 0 customers' : `Showing ${from}–${to} of ${total} customers`;
    }

    const pagination = document.querySelector('#customersPagination');
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

            if (pages[pages.length - 1] !== totalPages) {
                pages.push(totalPages);
            }
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
    const searchInput = document.querySelector('#customersSearch');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            currentSearch = e.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    const pagination = document.querySelector('#customersPagination');
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

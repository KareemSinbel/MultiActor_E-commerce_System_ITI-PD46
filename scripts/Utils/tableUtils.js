// __________________________ Start Shared Table Utilities __________________________

/**
 * Sorts an array of objects based on a specified field and direction.
 * @param {Array} data - The array to sort.
 * @param {string} field - The property name to sort by.
 * @param {string} direction - "asc" or "desc".
 * @returns {Array} A new sorted array.
 */
export function sortTableData(data, field, direction) {
    if (!field) return [...data];

    return [...data].sort((a, b) => {
        let av = String(a[field] || "").toLowerCase();
        let bv = String(b[field] || "").toLowerCase();

        // Special handling if the values are numeric strings like prices
        if (field === 'price' || !isNaN(av) && !isNaN(bv)) {
            av = Number(a[field]);
            bv = Number(b[field]);
        }

        if (av < bv) return direction === 'asc' ? -1 : 1;
        if (av > bv) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Generates the HTML for bootstrap pagination elements.
 * @param {number} currentPage - The current active page.
 * @param {number} totalPages - The total number of pages.
 * @returns {string} The HTML string for the pagination list items.
 */
export function generatePaginationHTML(currentPage, totalPages) {
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

    // Previous Button
    items.push(`
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" data-page="${currentPage - 1}">&lsaquo;</button>
      </li>
    `);

    // Page Numbers
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

    // Next Button
    items.push(`
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" data-page="${currentPage + 1}">&rsaquo;</button>
      </li>
    `);

    return items.join('');
}

// __________________________ End Shared Table Utilities __________________________

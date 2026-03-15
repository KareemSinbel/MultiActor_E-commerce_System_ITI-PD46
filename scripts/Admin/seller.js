import { sellerRow } from "../Data Components/sellerRow.js";
import { generatePaginationHTML, sortTableData } from "../Utils/tableUtils.js";

let sellers = [];
const pageSize = 8;
let currentPage = 1;
let currentSearch = '';
let currentSortField = 'name';
let currentSortDirection = 'asc';

function renderTable() {
    const tbody = document.querySelector('#sellersTableBody');
    if (!tbody) return;

    const filtered = sellers.filter(s => {
        const term = currentSearch.toLowerCase();
        return (
            (s.name && s.name.toLowerCase().includes(term)) ||
            (s.email && s.email.toLowerCase().includes(term)) ||
            (s.address && s.address.toLowerCase().includes(term))
        );
    });

    const sorted = sortTableData(filtered, currentSortField, currentSortDirection);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    tbody.innerHTML = pageItems.map(sellerRow).join('');

    const info = document.querySelector('#sellersInfo');
    if (info) {
        const from = total === 0 ? 0 : start + 1;
        const to = start + pageItems.length;
        info.textContent = total === 0 ? 'Showing 0–0 of 0 sellers' : `Showing ${from}–${to} of ${total} sellers`;
    }

    const pagination = document.querySelector('#sellersPagination');
    if (pagination) {
        pagination.innerHTML = generatePaginationHTML(currentPage, totalPages);
    }
}

document.addEventListener('LayoutBuilt', async () => {
    // Fetch sellers from API
    try {
        const url = new URL('https://69b10cdeadac80b427c3d349.mockapi.io/sellers');
        const res = await fetch(url, { method: 'GET', headers: { 'content-type': 'application/json' } });
        if (res.ok) {
            sellers = await res.json();
        }
    } catch (error) {
        console.error(`Error fetching sellers: ${error}`);
    }

    const searchInput = document.querySelector('#sellersSearch');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            currentSearch = e.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    const tableBody = document.querySelector('#sellersTableBody');
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
                        const res = await fetch(`https://69b10cdeadac80b427c3d349.mockapi.io/sellers/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            sellers = sellers.filter(s => String(s.id) !== String(id));
                            renderTable();
                            Swal.fire('Deleted!', 'The seller has been deleted.', 'success');
                        } else {
                            Swal.fire('Error!', 'Failed to delete seller. Please try again.', 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting seller:', error);
                        Swal.fire('Error!', 'An error occurred while deleting.', 'error');
                    }
                }
            });
        });
    }

    const pagination = document.querySelector('#sellersPagination');
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
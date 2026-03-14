import { customerRow } from "../Data Components/customerRow.js";
import { generatePaginationHTML, sortTableData } from "../Utils/tableUtils.js";

let customers = [];
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
            (c.name && c.name.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.address && c.address.toLowerCase().includes(term))
        );
    });

    const sorted = sortTableData(filtered, currentSortField, currentSortDirection);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    tbody.innerHTML = pageItems.map(customerRow).join('');

    const info = document.querySelector('#customersInfo');
    if (info) {
        const from = total === 0 ? 0 : start + 1;
        const to = start + pageItems.length;
        info.textContent = total === 0 ? 'Showing 0–0 of 0 customers' : `Showing ${from}–${to} of ${total} customers`;
    }

    const pagination = document.querySelector('#customersPagination');
    if (pagination) {
        pagination.innerHTML = generatePaginationHTML(currentPage, totalPages);
    }
}

document.addEventListener('LayoutBuilt', () => {
    // Fetch customers from localStorage
    try {
        const storedCustomers = localStorage.getItem('customers');
        if (storedCustomers) {
            customers = JSON.parse(storedCustomers);
        }
    } catch (e) {
        console.error("Error parsing customers from localStorage", e);
    }

    const searchInput = document.querySelector('#customersSearch');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            currentSearch = e.target.value || '';
            currentPage = 1;
            renderTable();
        });
    }

    const tableBody = document.querySelector('#customersTableBody');
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
            }).then((result) => {
                if (result.isConfirmed) {
                    customers = customers.filter(c => String(c.id) !== String(id));
                    localStorage.setItem('customers', JSON.stringify(customers));
                    renderTable();
                    Swal.fire('Deleted!', 'The customer has been deleted.', 'success');
                }
            });
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
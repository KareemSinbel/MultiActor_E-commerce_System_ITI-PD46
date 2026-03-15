import { productCard } from "../Data Components/productCard.js";
import { addToCart, redirectToLogin, showBootstrapToast} from "../helpers.js"; 
import { Router } from "../router.js";
import {LayoutManager} from "../layoutManager.js"


/* =========================
    LISTING STATE
  ========================= */
  const listingState = 
  {
    page: 1,
    limit: 9,
    total: 0,
    allProducts: [],
    filters: {
      categories: [],
      colors: [],
      sizes: []
    }
  };

const initiated = (function initPage()
{
  /* =========================
    FETCH PRODUCTS (ONCE)
  ========================= */
  async function fetchProducts() {
    try {
      const res = await fetch(
        "https://69b10cdeadac80b427c3d349.mockapi.io/products"
      );

      const products = await res.json();
      listingState.allProducts = products;

      renderCategoryFilters(); // generate category checkboxes dynamically
      updateListing();
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  /* =========================
    DYNAMIC CATEGORY FILTERS + OFFCANVAS SYNC
  ========================= */
  function renderCategoryFilters() {
    // Get unique categories from all products
    const categories = [...new Set(listingState.allProducts.map(p => p.category))];

    // Desktop sidebar container
    const $desktopContainer = $("#category-filters-container");
    $desktopContainer.empty();

    categories.forEach(cat => {
      const html = `
        <div class="form-check">
          <input class="form-check-input category-filter" type="checkbox" value="${cat}" id="cat-${cat}">
          <label class="form-check-label" for="cat-${cat}">${cat}</label>
        </div>
        <hr>
      `;
      $desktopContainer.append(html);
    });

    // Clone desktop filters into offcanvas
    const $clone = $("#filterbar > div").clone(true, true); // clone with events
    $clone.attr("id", ""); // remove duplicate id
    
    $("#offcanvasFilterContainer").empty().append($clone);

    // Sync checkbox states initially
    syncCheckboxStates();
  }

  /* =========================
    SYNC CHECKBOX STATES (desktop <-> offcanvas)
  ========================= */
  function syncCheckboxStates() {
    $(".category-filter").each(function () {
      const value = $(this).val();
      const isChecked = listingState.filters.categories.includes(value);
      $(this).prop("checked", isChecked);
    });
  }

  /* =========================
    FILTER PRODUCTS
  ========================= */
  function getFilteredProducts() {
    let products = [...listingState.allProducts];

    if (listingState.filters.categories.length > 0) {
      products = products.filter(product =>
        listingState.filters.categories.includes(product.category)
      );
    }

    return products;
  }

  /* =========================
    PAGINATE PRODUCTS
  ========================= */
  function getPaginatedProducts(products) {
    const start = (listingState.page - 1) * listingState.limit;
    const end = start + listingState.limit;
    return products.slice(start, end);
  }

  /* =========================
    RENDER PRODUCTS
  ========================= */
  function renderProducts(products) 
  {
    const $container = $("#products-container");
    $container.empty();

    if (products.length === 0) {
      $container.html(`<p class="text-center mt-4">No products found</p>`);
      $(".custom-pagination-container").hide();
      $("#resultsinfo").text("Showing 0 results");
      return;
    }

    products.forEach(p => {
      let rowHtml = productCard(p);

      let $row = $(`
        <div class="col-12 col-sm-6 col-lg-4">
          ${rowHtml}
        </div>
      `);
      
      $row.find(".product").on("click", (e)=>
      {
        Router.navigate("productDetails", { id: p.id });
      });

      $row.find(".add-to-cart").on("click", (e) => 
      {
        e.preventDefault();
        e.stopPropagation();
        let res = addToCart(p);

        if(res.reason === "NOT_LOGGED_IN")
          redirectToLogin();
      });

      $container.append($row);
    });

    updateResultsInfo(products.length);
  }

  /* =========================
    RESULTS INFO
  ========================= */
  function updateResultsInfo(count) {
    const start = (listingState.page - 1) * listingState.limit + 1;
    const end = start + count - 1;

    $("#resultsinfo").text(
      `Showing ${start}–${end} of ${listingState.total} results`
    );
  }

  /* =========================
    PAGINATION
  ========================= */
  function renderPagination() {
    const $pagination = $("#productsPagination");
    const $container = $(".custom-pagination-container");

    const totalPages = Math.ceil(listingState.total / listingState.limit);
    const current = listingState.page;

    if (totalPages <= 1) {
      $container.addClass("d-none");
      return;
    }

    $container.removeClass("d-none");
    $pagination.empty();

    const maxVisible = 4;

    /* PREV */
    $pagination.append(`
      <li class="page-item ${current === 1 ? "disabled" : ""}">
        <button class="page-link" data-page="${current - 1}">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      </li>
    `);

    /* FIRST PAGE */
    $pagination.append(`
      <li class="page-item ${current === 1 ? "active" : ""}">
        <button class="page-link" data-page="1">1</button>
      </li>
    `);

    let start = Math.max(2, current - 1);
    let end = start + maxVisible - 1;

    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(2, end - maxVisible + 1);
    }

    if (start > 2) {
      $pagination.append(
        `<li class="page-item disabled"><span class="page-link">...</span></li>`
      );
    }

    for (let i = start; i <= end; i++) {
      $pagination.append(`
        <li class="page-item ${i === current ? "active" : ""}">
          <button class="page-link" data-page="${i}">${i}</button>
        </li>
      `);
    }

    if (end < totalPages - 1) {
      $pagination.append(
        `<li class="page-item disabled"><span class="page-link">...</span></li>`
      );
    }

    if (totalPages > 1) {
      $pagination.append(`
        <li class="page-item ${current === totalPages ? "active" : ""}">
          <button class="page-link" data-page="${totalPages}">${totalPages}</button>
        </li>
      `);
    }

    /* NEXT */
    $pagination.append(`
      <li class="page-item ${current === totalPages ? "disabled" : ""}">
        <button class="page-link" data-page="${current + 1}">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </li>
    `);
  }

  /* =========================
    APPLIED FILTERS UI
  ========================= */
  function renderAppliedFilters() {
    const $container = $(".applied-filters-container");
    $container.empty();

    listingState.filters.categories.forEach(cat => {
      $container.append(`
        <div class="filter-pill d-flex align-items-center ps-3">
          <p class="mb-0 me-2">${cat}</p>
          <button class="btn-close" data-filter="${cat}"></button>
        </div>
      `);
    });
  }

  /* =========================
    MAIN LISTING UPDATE
  ========================= */
  function updateListing() {
    const filteredProducts = getFilteredProducts();
    listingState.total = filteredProducts.length;

    const totalPages = Math.ceil(listingState.total / listingState.limit);
    if (listingState.page > totalPages) listingState.page = 1;

    const paginatedProducts = getPaginatedProducts(filteredProducts);

    renderProducts(paginatedProducts);
    renderPagination();
    renderAppliedFilters();

    // Sync checkbox states in both desktop and offcanvas
    syncCheckboxStates();
  }

  return {updateListing, fetchProducts};
})();


/* =========================
   EVENT LISTENERS
========================= */
$(document).on("pageLoaded", async function(e) 
{
  if (e.detail.page === "listing") 
  {
    const filterContainer = document.querySelector("[data-component='filterbar']");
    if (filterContainer) {
        await LayoutManager.renderComponent("filterbar", filterContainer);
    }

    initiated.fetchProducts();

    // Pagination click
    $(document).on("click", "#productsPagination button[data-page]", function () {
      const page = Number($(this).data("page"));
      const totalPages = Math.ceil(listingState.total / listingState.limit);
      if (page < 1 || page > totalPages) return;

      listingState.page = page;

      initiated.updateListing();
    });

    // Filter checkbox change (two-way sync)
    $(document).on("change", ".category-filter", function () {
      const value = $(this).val();
      const checked = $(this).prop("checked");

      if (checked) {
        if (!listingState.filters.categories.includes(value))
          listingState.filters.categories.push(value);
      } else {
        listingState.filters.categories = listingState.filters.categories.filter(c => c !== value);
      }

      listingState.page = 1;

      initiated.updateListing();

      // Sync all other checkboxes with the same value
      $(`.category-filter[value="${value}"]`).not(this).prop("checked", checked);
    });

    // Remove applied filter
    $(document).on("click", ".applied-filters-container .btn-close", function () {
      const value = $(this).data("filter");
      listingState.filters.categories = listingState.filters.categories.filter(c => c !== value);

      // Uncheck all checkboxes with this value
      $(`.category-filter[value="${value}"]`).prop("checked", false);

      listingState.page = 1;
      
      initiated.updateListing();
    });
  }  
});
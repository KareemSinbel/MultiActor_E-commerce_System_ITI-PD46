import { notifyCartUpdated, showBootstrapToast } from "../helpers.js";

const CART_LOGIN_URL = "http://127.0.0.1:5500/html/Auth/login.html";
const TAX_RATE = 0.0;
const PRODUCTS_API_URL = "https://69b10cdeadac80b427c3d349.mockapi.io/products";
let checkoutModalInstance = null;

function getLoggedInUser() 
{
    try 
    {
        const userRaw = getCookie("loggedInUser");
        return userRaw ? JSON.parse(userRaw) : null;
    } catch (error) 
    {
        console.error("Failed to parse logged in user", error);
        return null;
    }
}

function getCustomers() {
    try {
        const customersRaw = localStorage.getItem("customers");
        const customers = customersRaw ? JSON.parse(customersRaw) : [];
        return Array.isArray(customers) ? customers : [];
    } catch (error) 
    {
        return [];
    }
}

function saveCustomers(customers) {
    localStorage.setItem("customers", JSON.stringify(customers));
    notifyCartUpdated();
}

function redirectToLogin() {
    window.location.href = CART_LOGIN_URL;
}

function findCustomerIndex(customers, loggedInUser) {
    if (!loggedInUser || !loggedInUser.id) {
        return -1;
    }

    // const loggedInEmail = String(loggedInUser.email || "").trim().toLowerCase();
    // if (!loggedInEmail) {
    //     return -1;
    // }

    return customers.findIndex((customer) => Number(customer.id) === Number(loggedInUser.id));
}

function formatPrice(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function ensureCartArray(customer) {
    if (!Array.isArray(customer.cartItem)) {
        customer.cartItem = [];
    }
}

function getCartContext() {
    const loggedInUser = getLoggedInUser();
    const customers = getCustomers();
    const customerIndex = findCustomerIndex(customers, loggedInUser);

    if (customerIndex === -1) {
        redirectToLogin();
        return null;
    }

    ensureCartArray(customers[customerIndex]);

    return {
        customers,
        customerIndex,
        customer: customers[customerIndex]
    };
}

function updateOrderSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
    document.getElementById("cart-tax").textContent = formatPrice(tax);
    document.getElementById("cart-total").textContent = formatPrice(total);

    const checkoutButton = document.getElementById("checkout-button");
    if (checkoutButton) {
        checkoutButton.disabled = cartItems.length === 0;
    }
}

function renderEmptyCart(container) {
    container.innerHTML = `
        <div class="cart-empty-state text-center py-5 px-4">
            <h6 class="fw-bold mb-2">Your cart is empty</h6>
            <p class="text-secondary mb-0">Add products from the product details page to see them here.</p>
        </div>
    `;
}

function renderCartItems(cartItems) {
    const container = document.getElementById("cart-items-container");
    if (!container) {
        return;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        renderEmptyCart(container);
        updateOrderSummary([]);
        return;
    }

    container.innerHTML = cartItems.map((item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const image = item.image || "./img/Image.png";
        const color = item.color || "Default";
        const size = item.size || "N/A";

        return `
            <div class="row align-items-center g-3 py-4 mx-0 cart-item-row" data-product-id="${item.id}">
                <div class="col-12 col-md-7 d-flex align-items-center">
                    <img src="${image}" class="cart-item-img me-3" alt="${item.name || "Cart product"}">
                    <div>
                        <h6 class="fw-bold mb-1">${item.name || "Unnamed product"}</h6>
                        <p class="small cart-item-meta mb-0">Color: ${color} - Size: ${size}</p>
                    </div>
                </div>

                <div class="col-6 col-md-2 mt-0 fw-bold">
                    <p class="small text-secondary text-uppercase mb-1 d-md-none">Price</p>
                    ${formatPrice(price)}
                </div>

                <div class="col-6 col-md-2 mt-0">
                    <p class="small text-secondary text-uppercase mb-1 d-md-none">Quantity</p>
                    <div class="border d-flex align-items-center rounded w-fit-content">
                        <button class="btn btn-sm border-0 px-2 quantity-button" data-action="decrease">-</button>
                        <span class="px-2 fw-bold">${quantity}</span>
                        <button class="btn btn-sm border-0 px-2 quantity-button" data-action="increase">+</button>
                    </div>
                </div>

                <div class="col-12 col-md-1 text-start text-md-end mt-1 mt-md-0">
                    <button class="btn-remove" data-action="remove"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
    }).join("");

    updateOrderSummary(cartItems);
}

function updateCartItemQuantity(productId, direction) {
    const context = getCartContext();
    if (!context) {
        return;
    }

    const { customers, customerIndex, customer } = context;
    const item = customer.cartItem.find((cartItem) => String(cartItem.id) === String(productId));
    if (!item) {
        return;
    }

    const currentQuantity = Number(item.quantity) || 1;
    item.quantity = direction === "increase" ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);

    customers[customerIndex] = customer;
    saveCustomers(customers);
    renderCartItems(customer.cartItem);
}

function removeCartItem(productId) {
    const context = getCartContext();
    if (!context) {
        return;
    }

    const { customers, customerIndex, customer } = context;
    customer.cartItem = customer.cartItem.filter((item) => String(item.id) !== String(productId));

    customers[customerIndex] = customer;
    saveCustomers(customers);
    renderCartItems(customer.cartItem);
}

function bindCartEvents() {
    const container = document.getElementById("cart-items-container");
    if (!container) {
        return;
    }

    container.addEventListener("click", (event) => {
        const actionElement = event.target.closest("[data-action]");
        if (!actionElement) {
            return;
        }

        const row = actionElement.closest("[data-product-id]");
        const productId = row ? row.getAttribute("data-product-id") : null;
        if (!productId) {
            return;
        }

        const action = actionElement.getAttribute("data-action");
        if (action === "increase" || action === "decrease") {
            updateCartItemQuantity(productId, action);
            return;
        }

        if (action === "remove") {
            removeCartItem(productId);
        }
    });
}

async function reduceProductStockInApi(cartItem) {
    const productId = encodeURIComponent(String(cartItem.id));
    const productUrl = `${PRODUCTS_API_URL}/${productId}`;

    const getResponse = await fetch(productUrl);
    const product = await getResponse.json();
    const cartQuantity = Number(cartItem.quantity) || 1;
    const currentStock = Number(product.stock) || 0;
    const newStock = Math.max(0, currentStock - cartQuantity);

    await fetch(productUrl, {
        method: "PUT",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            ...product,
            stock: newStock
        })
    });
}

async function processCheckout() {
    const context = getCartContext();
    if (!context) {
        return;
    }

    const { customers, customerIndex, customer } = context;
    const cartItems = Array.isArray(customer.cartItem) ? customer.cartItem : [];
    const toastContainer = document.getElementById("cart-toast-container");

    if (cartItems.length === 0) {
        showBootstrapToast(toastContainer, "Your cart is empty.", "info");
        return;
    }

    const checkoutButton = document.getElementById("checkout-button");
    const confirmCheckoutButton = document.getElementById("confirm-checkout-button");
    if (checkoutButton) {
        checkoutButton.disabled = true;
    }
    if (confirmCheckoutButton) {
        confirmCheckoutButton.disabled = true;
    }

    for (const item of cartItems) {
        await reduceProductStockInApi(item);
    }

    customer.cartItem = [];
    customers[customerIndex] = customer;
    saveCustomers(customers);
    renderCartItems(customer.cartItem);
    if (checkoutModalInstance) {
        checkoutModalInstance.hide();
    }

    showBootstrapToast(toastContainer, "Payment completed successfully.", "success");

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }
    if (confirmCheckoutButton) {
        confirmCheckoutButton.disabled = false;
    }
}

function openCheckoutModal() {
    const context = getCartContext();
    if (!context) {
        return;
    }

    const cartItems = Array.isArray(context.customer.cartItem) ? context.customer.cartItem : [];
    const toastContainer = document.getElementById("cart-toast-container");
    if (cartItems.length === 0) {
        showBootstrapToast(toastContainer, "Your cart is empty.", "info");
        return;
    }

    const modalElement = document.getElementById("checkoutConfirmModal");
    if (!modalElement || !window.bootstrap || !window.bootstrap.Modal) {
        processCheckout();
        return;
    }

    if (!checkoutModalInstance) {
        checkoutModalInstance = new window.bootstrap.Modal(modalElement);
    }

    checkoutModalInstance.show();
}

function bindCheckoutAction() {
    const checkoutButton = document.getElementById("checkout-button");
    const confirmCheckoutButton = document.getElementById("confirm-checkout-button");

    if (!checkoutButton || !confirmCheckoutButton) {
        return;
    }

    checkoutButton.addEventListener("click", openCheckoutModal);
    confirmCheckoutButton.addEventListener("click", processCheckout);
}

function initCartPage() {
    const context = getCartContext();
    if (!context) {
        return;
    }

    renderCartItems(context.customer.cartItem);
    bindCartEvents();
    bindCheckoutAction();
}

document.addEventListener("LayoutBuilt", initCartPage);

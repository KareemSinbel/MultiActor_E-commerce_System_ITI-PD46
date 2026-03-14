const PRODUCTS_API_URL = "https://69b10cdeadac80b427c3d349.mockapi.io/products";
const LOGIN_URL = "http://127.0.0.1:5500/html/Auth/login.html";

function getProductIdFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}

async function fetchProductById(productId) {
	try {
		const byIdResponse = await fetch(`${PRODUCTS_API_URL}/${encodeURIComponent(productId)}`);

		if (byIdResponse.ok) {
			const product = await byIdResponse.json();
			console.log("Fetched product by id:", product);
			return product;
		}
	} catch (error) {
		console.warn("Direct product fetch failed. Falling back to list search.", error);
	}

	const listResponse = await fetch(PRODUCTS_API_URL);
	const products = await listResponse.json();
	console.log("Fetched products list:", products);
    
	return products.find((product) => String(product.id) === String(productId)) || null;
}

function setText(id, value) {
	const element = document.getElementById(id);
	if (!element) {
		return;
	}

	element.textContent = value ?? "";
}

function setHtml(id, value) {
	const element = document.getElementById(id);
	if (!element) {
		return;
	}

	element.innerHTML = value;
}

function setImage(id, imageUrl, productName) {
	const image = document.getElementById(id);
	const loader = document.getElementById("product-image-loader");
	if (!image) {
		return;
	}

	image.alt = productName || "Product image";
	image.classList.remove("is-loaded");

	if (!imageUrl) {
		if (loader) {
			loader.innerHTML = '<p class="text-muted mb-0">No image available.</p>';
		}
		image.removeAttribute("src");
		return;
	}

	if (loader) {
		loader.classList.remove("d-none");
	}

	const preloadedImage = new Image();
	preloadedImage.onload = () => {
		image.src = imageUrl;
		image.classList.add("is-loaded");
		if (loader) {
			loader.classList.add("d-none");
		}
	};

	preloadedImage.onerror = () => {
		if (loader) {
			loader.innerHTML = '<p class="text-muted mb-0">Failed to load image.</p>';
		}
		image.removeAttribute("src");
	};

	preloadedImage.src = imageUrl;
}

function renderStock(stockValue) {
	const stockElement = document.getElementById("product-stock");
	if (!stockElement) {
		return;
	}

	const stock = Number(stockValue);
	const inStock = Number.isFinite(stock) ? stock > 0 : true;

	stockElement.textContent = inStock ? "IN STOCK" : "OUT OF STOCK";
	stockElement.style.color = inStock ? "#475156" : "#B42318";
	stockElement.style.borderColor = inStock ? "#E4E7E9" : "#FECACA";
}

function renderRating(product) {
	const ratingElement = document.getElementById("product-rating");
	if (!ratingElement) {
		return;
	}

	const points = Number(product.starsTotalPoints);
	const reviews = Number(product.numOfReviews);
	const hasReviews = Number.isFinite(points) && Number.isFinite(reviews) && reviews > 0;
	const average = hasReviews ? (points / reviews).toFixed(1) : "0.0";
	const reviewCount = Number.isFinite(reviews) ? reviews : 0;

	ratingElement.innerHTML = `<i class="fa-solid fa-star text-warning me-1"></i> ${average} — ${reviewCount} Reviews`;
}

function isCssColorLike(value) {
	if (!value || typeof value !== "string") {
		return false;
	}

	const normalized = value.trim().toLowerCase();
	return (
		normalized.startsWith("#") ||
		normalized.startsWith("rgb") ||
		normalized.startsWith("hsl") ||
		["black", "white", "red", "green", "blue", "yellow", "gray", "grey", "orange", "purple", "pink", "brown"].includes(normalized)
	);
}

function renderColors(colorsList) {
	const container = document.getElementById("product-colors");
	if (!container) {
		return;
	}

	if (!Array.isArray(colorsList) || colorsList.length === 0) {
		container.innerHTML = '<span class="color-chip active">Default</span>';
		return;
	}

	container.innerHTML = colorsList
		.map((color, index) => {
			if (isCssColorLike(color)) {
				return `<span class="color-dot ${index === 0 ? "active" : ""}" title="${color}" style="background-color: ${color};"></span>`;
			}

			return `<span class="color-chip ${index === 0 ? "active" : ""}">${color}</span>`;
		})
		.join("");
}

function renderSizes(sizesList) {
	const container = document.getElementById("product-sizes");
	if (!container) {
		return;
	}

	if (!Array.isArray(sizesList) || sizesList.length === 0) {
		container.innerHTML = '<div class="size-box active">N/A</div>';
		return;
	}

	container.innerHTML = sizesList
		.map((size, index) => `<div class="size-box ${index === 0 ? "active" : ""}">${size}</div>`)
		.join("");
}

function renderDetailList(product) {
	const details = [
		`Category: ${product.category || "N/A"}`,
		`SKU: ${product.sku || "N/A"}`,
		`Available sizes: ${Array.isArray(product.sizesList) ? product.sizesList.join(", ") : "N/A"}`,
		`Available colors: ${Array.isArray(product.colorsList) ? product.colorsList.join(", ") : "N/A"}`,
		`Seller ID: ${product.sellerId || "N/A"}`,
		`Product ID: ${product.id || "N/A"}`
	];

	setHtml(
		"product-detail-list",
		details.map((item) => `<li>${item}</li>`).join("")
	);
}

function getLoggedInUser() {
	try {
		const userRaw = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
		return userRaw ? JSON.parse(userRaw) : null;
	} catch (error) {
		console.error("Failed to parse logged in user", error);
		return null;
	}
}

function getCustomers() {
	try {
		const customersRaw = localStorage.getItem("customers");
		const customers = customersRaw ? JSON.parse(customersRaw) : [];
		return Array.isArray(customers) ? customers : [];
	} catch (error) {
		console.error("Failed to parse customers from localStorage", error);
		return [];
	}
}

function saveCustomers(customers) {
	localStorage.setItem("customers", JSON.stringify(customers));
}

function findCustomerIndex(customers, loggedInUser) {
	if (!loggedInUser) {
		return -1;
	}

	const loggedInEmail = String(loggedInUser.email || "").trim().toLowerCase();
	if (!loggedInEmail) {
		return -1;
	}

	return customers.findIndex((customer) => {
		const customerEmail = String(customer.email || "").trim().toLowerCase();
		return customerEmail === loggedInEmail;
	});
}

function redirectToLogin() {
	window.location.href = LOGIN_URL;
}

function getSelectedSize() {
	const activeSize = document.querySelector("#product-sizes .size-box.active");
	return activeSize ? activeSize.textContent.trim() : null;
}

function getSelectedColor() {
	const activeColor = document.querySelector("#product-colors .active");
	if (!activeColor) {
		return null;
	}

	if (activeColor.classList.contains("color-dot")) {
		return activeColor.getAttribute("title") || null;
	}

	return activeColor.textContent.trim();
}

function getSelectedQuantity() {
	const quantityValue = document.querySelector(".quantity-group span");
	const quantity = Number(quantityValue ? quantityValue.textContent.trim() : "1");
	return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function normalizeWatchListEntry(product) {
	return {
		id: String(product.id || ""),
		name: product.name || "",
		price: Number(product.price) || 0,
		image: product.image || ""
	};
}

function normalizeCartItem(product) {
	return {
		id: String(product.id || ""),
		name: product.name || "",
		price: Number(product.price) || 0,
		image: product.image || "",
		size: getSelectedSize(),
		color: getSelectedColor(),
		quantity: getSelectedQuantity()
	};
}

function ensureArrayProperty(customer, key) {
	if (!Array.isArray(customer[key])) {
		customer[key] = [];
	}
}

function getCustomerContext(shouldRedirect = true) {
	const loggedInUser = getLoggedInUser();
	const customers = getCustomers();
	const customerIndex = findCustomerIndex(customers, loggedInUser);

	if (customerIndex === -1) {
		if (shouldRedirect) {
			redirectToLogin();
		}
		return null;
	}

	return {
		customers,
		customerIndex,
		customer: customers[customerIndex]
	};
}

function getToastContainer() {
	let container = document.getElementById("product-details-toast-container");
	if (container) {
		return container;
	}

	container = document.createElement("div");
	container.id = "product-details-toast-container";
	container.className = "toast-container position-fixed top-0 end-0 p-3";
	container.style.zIndex = "1080";
	document.body.appendChild(container);
	return container;
}

function showBootstrapToast(message, type = "success") {
	const container = getToastContainer();
	const toast = document.createElement("div");

	const typeClassMap = {
		success: "text-bg-success",
		warning: "text-bg-warning",
		danger: "text-bg-danger",
		info: "text-bg-primary"
	};

	const bgClass = typeClassMap[type] || typeClassMap.success;

	toast.className = `toast align-items-center border-0 ${bgClass}`;
	toast.setAttribute("role", "alert");
	toast.setAttribute("aria-live", "assertive");
	toast.setAttribute("aria-atomic", "true");
	toast.innerHTML = `
		<div class="d-flex">
			<div class="toast-body">${message}</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
	`;

	container.appendChild(toast);

	if (window.bootstrap && window.bootstrap.Toast) {
		const toastInstance = new window.bootstrap.Toast(toast, { delay: 2200 });
		toast.addEventListener("hidden.bs.toast", () => toast.remove());
		toastInstance.show();
		return;
	}

	setTimeout(() => toast.remove(), 2200);
}

function updateWishlistButtonState(isActive) {
	const watchListButton = document.querySelector(".btn-wishlist");
	if (!watchListButton) {
		return;
	}

	const icon = watchListButton.querySelector("i");
	watchListButton.classList.toggle("active", isActive);

	if (icon) {
		icon.classList.toggle("fa-solid", isActive);
		icon.classList.toggle("fa-regular", !isActive);
	}
}

function isProductInWatchList(customer, productId) {
	if (!customer) {
		return false;
	}

	ensureArrayProperty(customer, "watchList");
	return customer.watchList.some((item) => String(item.id) === String(productId));
}

function handleAddToCart(product) {
	const context = getCustomerContext();
	if (!context) {
		return;
	}

	const { customers, customerIndex, customer } = context;
	ensureArrayProperty(customer, "cartItem");

	const cartEntry = normalizeCartItem(product);
	const existingIndex = customer.cartItem.findIndex((item) => String(item.id) === cartEntry.id);

	if (existingIndex >= 0) {
		const existingQuantity = Number(customer.cartItem[existingIndex].quantity) || 1;
		customer.cartItem[existingIndex].quantity = existingQuantity + cartEntry.quantity;
		customer.cartItem[existingIndex].size = cartEntry.size;
		customer.cartItem[existingIndex].color = cartEntry.color;
	} else {
		customer.cartItem.push(cartEntry);
	}

	saveCustomers(customers);
	showBootstrapToast("Product added to cart.", "success");
}

function handleAddToWatchList(product) {
	const context = getCustomerContext();
	if (!context) {
		return;
	}

	const { customers, customerIndex, customer } = context;
	ensureArrayProperty(customer, "watchList");

	const watchListEntry = normalizeWatchListEntry(product);
	const existingIndex = customer.watchList.findIndex((item) => String(item.id) === watchListEntry.id);

	if (existingIndex === -1) {
		customer.watchList.push(watchListEntry);
		customers[customerIndex] = customer;
		saveCustomers(customers);
		updateWishlistButtonState(true);
		showBootstrapToast("Product added to watch list.", "success");
		return;
	}

	customer.watchList.splice(existingIndex, 1);
	customers[customerIndex] = customer;
	saveCustomers(customers);
	updateWishlistButtonState(false);
	showBootstrapToast("Product removed from watch list.", "info");
}

function bindQuantityActions() {
	const quantityGroup = document.querySelector(".quantity-group");
	if (!quantityGroup) {
		return;
	}

	const minusButton = quantityGroup.querySelector("button:first-child");
	const plusButton = quantityGroup.querySelector("button:last-child");
	const quantitySpan = quantityGroup.querySelector("span");

	if (!minusButton || !plusButton || !quantitySpan) {
		return;
	}

	minusButton.addEventListener("click", () => {
		const current = Number(quantitySpan.textContent.trim()) || 1;
		quantitySpan.textContent = String(Math.max(1, current - 1));
	});

	plusButton.addEventListener("click", () => {
		const current = Number(quantitySpan.textContent.trim()) || 1;
		quantitySpan.textContent = String(current + 1);
	});
}

function bindSelectableOptions() {
	const sizesContainer = document.getElementById("product-sizes");
	if (sizesContainer) {
		sizesContainer.addEventListener("click", (event) => {
			const selected = event.target.closest(".size-box");
			if (!selected) {
				return;
			}

			sizesContainer.querySelectorAll(".size-box").forEach((node) => node.classList.remove("active"));
			selected.classList.add("active");
		});
	}

	const colorsContainer = document.getElementById("product-colors");
	if (colorsContainer) {
		colorsContainer.addEventListener("click", (event) => {
			const selected = event.target.closest(".color-dot, .color-chip");
			if (!selected) {
				return;
			}

			colorsContainer.querySelectorAll(".color-dot, .color-chip").forEach((node) => node.classList.remove("active"));
			selected.classList.add("active");
		});
	}
}

function bindProductActions(product) {
	const context = getCustomerContext(false);
	updateWishlistButtonState(Boolean(context && isProductInWatchList(context.customer, product.id)));

	const addToCartButton = document.querySelector(".btn-add-cart");
	if (addToCartButton) {
		addToCartButton.addEventListener("click", () => handleAddToCart(product));
	}

	const addToWatchListButton = document.querySelector(".btn-wishlist");
	if (addToWatchListButton) {
		addToWatchListButton.addEventListener("click", () => handleAddToWatchList(product));
	}
}

function renderProduct(product) {
	const name = product.name || "Product Details";
	const price = Number(product.price);
	const formattedPrice = Number.isFinite(price) ? `$${price.toFixed(2)}` : "$0.00";

	setText("product-breadcrumb-name", name);
	setText("product-name", name);
	setText("product-price", formattedPrice);
	setText("product-meta-line", `SKU: ${product.sku || "N/A"} | Category: ${product.category || "N/A"}`);
	setText("product-description", product.description || "No description available for this product yet.");

	setImage("product-image", product.image, name);

	renderStock(product.stock);
	renderRating(product);
	renderColors(product.colorsList);
	renderSizes(product.sizesList);
	renderDetailList(product);
	document.title = name;
}

function renderNotFound(message) {
	setText("product-name", message);
	setText("product-breadcrumb-name", message);
	setText("product-price", "");
	setText("product-description", "Please go back to Home and open a valid product.");
}

async function initProductDetailsPage() {
	const productId = getProductIdFromUrl();

	if (!productId) {
		renderNotFound("Product not found");
		return;
	}

	try {
		const product = await fetchProductById(productId);

		if (!product) {
			renderNotFound("Product not found");
			return;
		}

		renderProduct(product);
		bindSelectableOptions();
		bindQuantityActions();
		bindProductActions(product);
	} catch (error) {
		console.error("Failed to load product details", error);
		renderNotFound("Failed to load product");
	}
}

document.addEventListener("DOMContentLoaded", initProductDetailsPage);

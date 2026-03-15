import { productCard } from "../Data Components/productCard.js";
import { toggleWishlist , addToCart, showBootstrapToast, isInWishlist, redirectToLogin, toggleBreadcrumb } from "../helpers.js"; 
import {Router} from "../router.js"


function initPage()
{
	const PRODUCTS_API_URL = "https://69b10cdeadac80b427c3d349.mockapi.io/products";

	initProductDetailsPage();

	function getProductIdFromUrl() {
		const params = new URLSearchParams(window.location.search);
		return params.get("id");
	}

	async function fetchProductById(productId) {
		try {
			const byIdResponse = await fetch(`${PRODUCTS_API_URL}/${encodeURIComponent(productId)}`);

			if (byIdResponse.ok) {
				const product = await byIdResponse.json();
				return product;
			}
		} catch (error) {
			console.warn("Direct product fetch failed. Falling back to list search.", error);
		}

		const listResponse = await fetch(PRODUCTS_API_URL);
		const products = await listResponse.json();
		
		return products.find((product) => String(product.id) === String(productId)) || null;
	}

	async function fetchProductsByCategory(category, excludedProductId) 
	{
		if (!category) {
			return [];
		}

		try {
			const response = await fetch(`${PRODUCTS_API_URL}?category=${encodeURIComponent(category)}`);
			if (!response.ok) {
				throw new Error("Failed to fetch products by category");
			}

			const products = await response.json();
			return (Array.isArray(products) ? products : [])
				.filter((product) => String(product.id) !== String(excludedProductId))
				.slice(0, 4);
		} catch (error) {
			return [];
		}
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
		];

		setHtml(
			"product-detail-list",
			details.map((item) => `<li>${item}</li>`).join("")
		);
	}


	function getSelectedSize() {
		const activeSize = document.querySelector("#product-sizes .size-box.active");
		return activeSize ? activeSize.textContent.trim() : null;
	}

function renderRelatedProducts(products) {
	const container = document.getElementById("related-products-container");
	if (!container) {
		return;
	}

	if (!Array.isArray(products) || products.length === 0) {
		container.innerHTML = '<div class="col-12 text-center text-muted py-4">No similar products found for this category.</div>';
		return;
	}

	container.innerHTML = products
		.map((product) => {
			const normalizedProduct = {
				...product,
				price: Number(product.price) || 0
			};

			return `<div class="col-12 col-sm-6 col-lg-3">${productCard(normalizedProduct)}</div>`;
		})
		.join("");	

	container.querySelectorAll(".product").forEach((button, index)=>
	{
		button.addEventListener("click", (event)=>
		{
			const product = products[index];
			Router.navigate("productDetails", { id: product.id });
		})
	});

	container.querySelectorAll(".add-to-cart").forEach((button, index) => {
		button.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			const product = products[index];
			const result = addToCart(product, {
				size: Array.isArray(product.sizesList) ? product.sizesList[0] : null,
				color: Array.isArray(product.colorsList) ? product.colorsList[0] : null,
				quantity: 1
			});

			if (!result.success) {
				redirectToLogin();
				return;
			}

			showBootstrapToast(getToastContainer(), "Product added to cart", "success");
		});
	});
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


	function handleAddToCart(product)
	{
		const result = addToCart(product,{
			size:getSelectedSize(),
			color:getSelectedColor(),
			quantity:getSelectedQuantity()
		});

		if(!result.success)
		{
			redirectToLogin();
			return;
		}
	}


	function handleAddToWatchList(product)
	{
		const result = toggleWishlist(product);

		if(!result.success)
		{
			redirectToLogin();
			return;
		}

		if(result.action === "added")
		{
			updateWishlistButtonState(true);
			showBootstrapToast("Product added to wish list");
		}
		else
		{
			updateWishlistButtonState(false);
			showBootstrapToast("Product removed from wish list", null, "danger");
		}
	}


	function bindQuantityActions() 
	{
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

	function bindSelectableOptions() 
	{
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
		updateWishlistButtonState(isInWishlist(product.id));

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
			const relatedProducts = await fetchProductsByCategory(product.category, product.id);
			renderRelatedProducts(relatedProducts);
			bindSelectableOptions();
			bindQuantityActions();
			bindProductActions(product);
		} catch (error) {
			renderNotFound("Failed to load product");
		}
	}
};


document.addEventListener("pageLoaded", (e) => 
{
    if (e.detail.page === "productDetails") 
    {

		toggleBreadcrumb("Details");

        initPage();
    }
});
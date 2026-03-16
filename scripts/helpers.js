import { Router } from "./router.js"

export function notifyCartUpdated(detail = {}) {
  document?.dispatchEvent(new CustomEvent("CartUpdated", { detail }));
}

export function redirectToLogin() {
	Router.navigate("login");
}

export function getProductStock(product) {
  const stock = Number(product?.stock);
  return Number.isFinite(stock) ? Math.max(0, stock) : Number.POSITIVE_INFINITY;
}

export function validateStockLimit(product, desiredQuantity) {
  const safeDesiredQuantity = Math.max(0, Number(desiredQuantity) || 0);
  const stock = getProductStock(product);

  if (stock === Number.POSITIVE_INFINITY) {
    return { success: true, stock };
  }

  if (stock <= 0) {
    return {
      success: false,
      reason: "OUT_OF_STOCK",
      stock,
      message: "This product is out of stock."
    };
  }

  if (safeDesiredQuantity > stock) {
    return {
      success: false,
      reason: "INSUFFICIENT_STOCK",
      stock,
      message: "Item out of stock"
    };
  }

  return { success: true, stock };
}

export function addToCart(product, options = {}) 
{
  const user = getLoggedInUser();
  if (!user) 
    return { success:false, reason:"NOT_LOGGED_IN" };

  const customers = getCustomers();
  const index = findCustomerIndex(customers, user);

  if (index === -1) return { success:false, reason:"CUSTOMER_NOT_FOUND" };

  const customer = customers[index];

  if (!Array.isArray(customer.cartItem))
    customer.cartItem = [];

  const quantityToAdd = Math.max(1, Number(options.quantity) || 1);

  const cartItem = {
    id: String(product.id),
    name: product.name || "",
    price: Number(product.price) || 0,
    image: product.image || "",
    size: options.size || product.sizesList[0],
    color: options.color || product.colorsList[0],
    quantity: quantityToAdd,
    stock: getProductStock(product)
  };

  const existingIndex = customer.cartItem.findIndex(i => i.id === cartItem.id);

  const existingQuantity = existingIndex >= 0 ? Number(customer.cartItem[existingIndex].quantity) || 0 : 0;
  const stockValidation = validateStockLimit(product, existingQuantity + quantityToAdd);

  if (!stockValidation.success) {
    return {
      success: false,
      reason: stockValidation.reason,
      message: stockValidation.message,
      stock: stockValidation.stock
    };
  }

  if (existingIndex >= 0) {
    customer.cartItem[existingIndex].quantity += cartItem.quantity;
    customer.cartItem[existingIndex].size = cartItem.size;
    customer.cartItem[existingIndex].color = cartItem.color;
    customer.cartItem[existingIndex].stock = cartItem.stock;
  } 
  else {
    customer.cartItem.push(cartItem);
  }

  customers[index] = customer;
  saveCustomers(customers);

  notifyCartUpdated();

  return { success:true };
}


export function toggleWishlist(product) {

  const user = getLoggedInUser();
  if (!user) return { success:false, reason:"NOT_LOGGED_IN" };

  const customers = getCustomers();
  const index = findCustomerIndex(customers, user);

  if (index === -1) return { success:false };

  const customer = customers[index];

  if (!Array.isArray(customer.watchList))
    customer.watchList = [];

  const item = {
    id: String(product.id),
    name: product.name || "",
    price: Number(product.price) || 0,
    image: product.image || ""
  };

  const existingIndex = customer.watchList.findIndex(i => i.id === item.id);

  if (existingIndex === -1) {
    customer.watchList.push(item);
    saveCustomers(customers);
    return { success:true, action:"added" };
  }

  customer.watchList.splice(existingIndex,1);
  saveCustomers(customers);

  return { success:true, action:"removed" };
}


export function isInWishlist(productId)
{
  const user = getLoggedInUser();
  if (!user) return false;

  const customers = getCustomers();
  const customer = customers.find(c => String(c.id) === String(user.id));

  if (!customer || !Array.isArray(customer.watchList))
    return false;

  return customer.watchList.some(p => String(p.id) === String(productId));
}



export function getCartItemCount() 
{
  const user = getLoggedInUser();
  if (!user) 
	return 0;

  const customers = getCustomers();

  const customer = customers.find(c => c.id === user.id);

  if (!customer || !Array.isArray(customer.cartItem)) return 0;

  return customer.cartItem.length;
}

// function checkLogin()
// {
//   if(checkAuth())
//     setTimeout(() => {
//       window.location.href = "../../html/Home/home.html";
//     }, 2000);
// }


export function showBootstrapToast(message, container,type = "success") 
{
  if(!container)
    container = container = getToastContainer();
  
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


export function updateCartBadge() {
  const badge = document.getElementById("cart-notification");
  if (!badge) return;
	
  const count = getCartItemCount();

  badge.textContent = count;

  if (count === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "inline-block";
  }
}


export function toggleBreadcrumb(text, visible = true)
{
  const breadcrumbContainer = document.getElementById("breadcrumb-main-container");

  if(breadcrumbContainer)
  {
    if(visible)
    {
      breadcrumbContainer.classList.remove("d-none");
    }
    else
    {
      breadcrumbContainer.classList.add("d-none");
    }

    document.getElementById("breadcrumb-current").textContent = text;
  }
}


/***************************************************************/


document.addEventListener("CartUpdated", (e)=> 
{
  updateCartBadge();

  const toastDetail = e.detail || {};

  if (toastDetail.showToast === false) {
    return;
  }

  showBootstrapToast(
    toastDetail.message || "Product added to cart",
    toastDetail.container || getToastContainer(),
    toastDetail.type || "success"
  );
});


function getCustomers() 
{
  try {
    const raw = localStorage.getItem("customers");
    const customers = raw ? JSON.parse(raw) : [];
    return Array.isArray(customers) ? customers : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers) 
{
  localStorage.setItem("customers", JSON.stringify(customers));
}

function findCustomerIndex(customers, user) 
{
  if (!user?.id) 
	return -1;
  return customers.findIndex(c => String(c.id) === String(user.id));
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
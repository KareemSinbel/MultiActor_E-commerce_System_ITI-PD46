export function notifyCartUpdated() {
  document?.dispatchEvent(new CustomEvent("CartUpdated"));
}

export function redirectToLogin() {
	window.location.href = "../../html/Auth/login.html";
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

  const cartItem = {
    id: String(product.id),
    name: product.name || "",
    price: Number(product.price) || 0,
    image: product.image || "",
    size: options.size || product.sizesList[0],
    color: options.color || product.colorsList[0],
    quantity: options.quantity || 1
  };

  const existingIndex = customer.cartItem.findIndex(i => i.id === cartItem.id);

  if (existingIndex >= 0) {
    customer.cartItem[existingIndex].quantity += cartItem.quantity;
    customer.cartItem[existingIndex].size = cartItem.size;
    customer.cartItem[existingIndex].color = cartItem.color;
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
  console.log(e.target);
  updateCartBadge();
  showBootstrapToast("Product added to cart", getToastContainer());
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
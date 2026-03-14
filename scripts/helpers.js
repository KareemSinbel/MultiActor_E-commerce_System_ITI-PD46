export function notifyCartUpdated() {
  document?.dispatchEvent(new CustomEvent("CartUpdated"));
}

export function getCartItemCount() 
{
  const user = getLoggedInUser();
  if (!user) 
	return 0;

  const customers = JSON.parse(localStorage.getItem("customers")) || [];

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


export function showBootstrapToast(container ,message, type = "success") {
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


document.addEventListener("LayoutBuilt", ()=>
{
  updateCartBadge();
});

document.addEventListener("CartUpdated", ()=> 
{
  updateCartBadge();
});

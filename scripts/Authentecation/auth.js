// ____________________ Auth Guard ____________________

const SELLERS_API_URL = "https://69b10cdeadac80b427c3d349.mockapi.io/sellers";

const DEFAULT_ADMIN_SELLER = {
  name: "System Admin",
  email: "admin@ecommerce.local",
  address: "Main Branch",
  password: "Admin123",
  role: "admin"
};

const DEFAULT_ADMIN_CUSTOMER = {
  name: "System Admin",
  email: "admin@ecommerce.local",
  address: "Main Branch",
  password: "Admin123",
  role: "admin",
  cartItem: []
};

// (function () {

//   const user = sessionStorage.getItem("loggedInUser");

//   if (!user) {

   
//     window.location.href = "../../html/Auth/login.html";

//   }

// })();

// ____________________ Check Auth ____________________



// LOG OUT EXAMPLE
// function logout() {
//   deleteCookie("loggedInUser");
//   location.href = "../../html/Auth/login.html";
// }


async function ensureAdminSellerExists() {
  try {
    const response = await fetch(SELLERS_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      return;
    }

    const sellers = await response.json();
    let adminSeller = sellers.find(
      (seller) => String(seller.role || "").toLowerCase() === "admin"
    );

    if (!adminSeller) {
      const createResponse = await fetch(SELLERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_ADMIN_SELLER)
      });

      if (!createResponse.ok) {
        return;
      }

      adminSeller = await createResponse.json();
    }

    const customers = JSON.parse(localStorage.getItem("customers")) || [];

    const adminEmail = String(
      adminSeller?.email || DEFAULT_ADMIN_SELLER.email
    ).toLowerCase();

    const alreadyInCustomers = customers.some(
      (customer) => String(customer.email || "").toLowerCase() === adminEmail
    );

    if (!alreadyInCustomers) {
      const numericIds = customers
        .map((customer) => Number(customer.id))
        .filter((id) => !Number.isNaN(id));

      const maxExistingId = numericIds.length ? Math.max(...numericIds) : 0;
      const lastCustomerId = Number(localStorage.getItem("lastCustomerId"));
      const safeLastId = Number.isNaN(lastCustomerId) ? 0 : lastCustomerId;
      const newCustomerId = Math.max(maxExistingId, safeLastId) + 1;

      customers.push({
        id: newCustomerId,
        ...DEFAULT_ADMIN_CUSTOMER
      });

      localStorage.setItem("customers", JSON.stringify(customers));
      localStorage.setItem("lastCustomerId", String(newCustomerId));
    }
  } catch (error) {
    console.error("Failed to ensure admin seller exists:", error);
  }
}

ensureAdminSellerExists();


function setCookie(name, value, hours)
{
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));

  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/` 
}

function getCookie(name) 
{
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split("=");

        if (key === name) {
            return value;
        }
    }

    return null;
}

function deleteCookie(name) 
{
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getLoggedInUser() 
{
  const auth = getCookie("loggedInUser");
  return auth ? JSON.parse(auth) : null;
}

function checkAuth() {

  const userCookie = getCookie("loggedInUser");  //sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const user = userCookie ? JSON.parse(userCookie) : null;  

  if (!user) {

    // Swal.fire({
    //   toast: true,
    //   position: "top-end",
    //   icon: "warning",
    //   title: "You must login first",
    //   showConfirmButton: false,
    //   timer: 2000,
    //   timerProgressBar: true
    // });

    // setTimeout(() => {
    //   window.location.href = "../../html/Auth/login.html";
    // }, 2000);

    return false;
  }

  return true;
}
//<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> 

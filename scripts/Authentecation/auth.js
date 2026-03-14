// ____________________ Auth Guard ____________________

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


function checkAuth() {

  const user = getCookie("loggedInUser");  //sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  user = userCookie ? JSON.parse(userCookie) : null;  

  if (!user) {

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "You must login first",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });

    setTimeout(() => {
      window.location.href = "../../html/Auth/login.html";
    }, 2000);

    return false;
  }

  return true;
}
//<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> 

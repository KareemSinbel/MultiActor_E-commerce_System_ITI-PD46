// ____________________ Auth Guard ____________________

// (function () {

//   const user = sessionStorage.getItem("loggedInUser");

//   if (!user) {

   
//     window.location.href = "../../html/Auth/login.html";

//   }

// })();

// ____________________ Check Auth ____________________

function checkAuth() {

  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");

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

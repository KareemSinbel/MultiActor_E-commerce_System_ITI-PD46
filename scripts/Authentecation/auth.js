// ____________________ Auth Guard ____________________

// (function () {

//   const cookie = document.cookie
//     .split("; ")
//     .find(c => c.startsWith("loggedInUser="));

//   if (!cookie) {

//     Swal.fire({
//       toast: true,
//       position: "top-end",
//       icon: "warning",
//       title: "You must login first",
//       showConfirmButton: false,
//       timer: 2000,
//       timerProgressBar: true
//     });

//     setTimeout(() => {
//       window.location.href = "../../html/Auth/login.html";
//     }, 2000);

//     return;
//   }

// })();


// ____________________ Check Auth ____________________

function checkAuth() {

  const cookie = document.cookie
    .split("; ")
    .find(c => c.startsWith("loggedInUser="));

  if (!cookie) {

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

  const user = JSON.parse(cookie.split("=")[1]);

  return user;
}

//<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> 

// __________________________ Start Global _________________________________
const loginForm = document.getElementById("loginForm");
const allInput = loginForm.querySelectorAll("input");
const msg = document.getElementById("msg");
const roleError = document.getElementById("roleError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

let isValid = false;
// __________________________ End Global _________________________________

// __________________________ Start Events _________________________________
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // First, check role
  const role = loginForm.querySelector('input[name="role"]:checked')?.value;
  if (!role) {
    roleError.classList.remove("d-none");
    return;
  } else {
    roleError.classList.add("d-none");
  }

  // Then validate inputs
  const emailValid = validateInput(document.getElementById("emailInp"));
  const passwordValid = validateInput(document.getElementById("passwordInp"));

  isValid = emailValid && passwordValid;

  if (isValid) {
    await handleLogin(role);
  }
});

loginForm.addEventListener("input", function (e) {
  // Only validate the field being typed in
  if (e.target.id === "emailInp" || e.target.id === "passwordInp") {
    validateInput(e.target);
  }
});
// __________________________ End Events _________________________________

// __________________________ Start Functions _________________________________
async function handleLogin(role) {
  const email = document.getElementById("emailInp").value.trim().toLowerCase();
  const password = document.getElementById("passwordInp").value.trim();

  const user = await findUser(email, password, role);

  if (!user) {
    msg.innerHTML = "Invalid email or password";
    msg.className = "text-center text-danger mt-2";
    return;
  }

  msg.innerHTML = "Login Successful! Redirecting...";
  msg.className = "text-center text-success mt-2";

  sessionStorage.setItem("loggedInUser", JSON.stringify(user));
  localStorage.setItem("loggedInUser", JSON.stringify(user));
  loginForm.reset();

  setTimeout(() => {
    location.href = "../../html/Home/home.html";
  }, 1000);
}

async function findUser(email, password, role) {
  if (role === "customer") {
    const customers = JSON.parse(localStorage.getItem("customers")) || [];
    return (
      customers.find(
        (user) => user.email.toLowerCase() === email && user.password === password
      ) || null
    );
  }

  if (role === "seller") {
    try {
      const response = await fetch(
        "https://69b10cdeadac80b427c3d349.mockapi.io/sellers"
      );
      const sellers = await response.json();
      return (
        sellers.find(
          (user) => user.email.toLowerCase() === email && user.password === password
        ) || null
      );
    } catch (err) {
      console.error(err);
      msg.innerHTML = "Something went wrong";
      msg.className = "text-center text-danger mt-2";
      return null;
    }
  }
}

function validateInput(element) {
  const regex = {
    emailInp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    passwordInp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
  };

  const errorDiv = element.id === "emailInp" ? emailError : passwordError;

  if (regex[element.id]?.test(element.value)) {
    element.classList.add("is-valid");
    element.classList.remove("is-invalid");
    errorDiv.classList.add("d-none");
    return true;
  } else {
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
    errorDiv.classList.remove("d-none");
    return false;
  }
}
// __________________________ End Functions _________________________________
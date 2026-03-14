// __________________________ Start Global _________________________________

const allInput = document.querySelectorAll("input");
const form = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const msg = document.getElementById("msg");

let isValid = false;

// __________________________ End Global _________________________________



// __________________________ Start Events _________________________________

form.addEventListener("submit", function (e) {

  e.preventDefault();

  if (isValid) {
    setForms();
  }

});


form.addEventListener("input", function () {

  if (
    allValidations(allInput[0]) &&
    allValidations(allInput[1]) &&
    allValidations(allInput[2]) &&
    allValidations(allInput[3])
  ) {
    isValid = true;
  } else {
    isValid = false;
  }

});

// __________________________ End Events _________________________________



// __________________________ Start Functions _________________________________

async function setForms() {

  const role = document.querySelector('input[name="role"]:checked')?.value;

  if (!role) {

    msg.innerHTML = "Please select role";
    msg.classList.add("text-danger");
    return;

  }

  const user = {

    name: allInput[0].value,
    email: allInput[1].value,
    address: allInput[2].value,
    password: allInput[3].value,
    role: role

  };

  const emailExists = await checkEmailExists(user.email, role);

  if (emailExists) {

    msg.innerHTML = "Email already exists";
    msg.classList.add("text-danger");
    msg.classList.remove("text-success");

    return;

  }

  if (role === "seller") {

    registerSeller(user);

  } else if (role === "customer") {

    saveCustomer(user);

  }

}



// __________________________ Check Email _________________________________

async function checkEmailExists(email, role) {

  email = email.toLowerCase();

  // check customer
  if (role === "customer") {

    const customers = JSON.parse(localStorage.getItem("customers")) || [];

    return customers.some(user => user.email.toLowerCase() === email);

  }

  // check seller
  if (role === "seller") {

    const response = await fetch("https://69b10cdeadac80b427c3d349.mockapi.io/sellers");

    const sellers = await response.json();

    return sellers.some(user => user.email.toLowerCase() === email);

  }

}



// __________________________ Seller API _________________________________

async function registerSeller(userData) {

  try {

    const response = await fetch(
      "https://69b10cdeadac80b427c3d349.mockapi.io/sellers",
      {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const finalResponse = await response.json();

    console.log(finalResponse);

    msg.innerHTML = "Seller Registered Successfully";
    msg.classList.add("text-success");

    form.reset();

    setTimeout(() => {

      location.href = "login.html";

    }, 1000);

  } catch (error) {

    console.log(error);

  }

}



// __________________________ Customer LocalStorage _________________________________

function saveCustomer(userData) {

  let customers = JSON.parse(localStorage.getItem("customers")) || [];

  const newCustomer = {
    id: generateCustomerId(customers), // unique id
    ...userData,
    cartItem: []
  };

  customers.push(newCustomer);

  localStorage.setItem("customers", JSON.stringify(customers));

  msg.innerHTML = "Customer Registered Successfully";
  msg.classList.add("text-success");

  form.reset();

  setTimeout(() => {

    location.href = "login.html";

  }, 1200);

}



// __________________________ Validations _________________________________

function allValidations(element) {

  const regex = {

    nameInp: /^[A-Za-z\u0600-\u06FF ]{3,20}$/,

    emailInp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    addressInp: /^[A-Za-z0-9\u0600-\u06FF\s]{5,50}$/,

    passwordInp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/

  };

  if (regex[element.id]?.test(element.value)) {

    element.classList.add("is-valid");
    element.classList.remove("is-invalid");

    return true;

  } else {

    element.classList.add("is-invalid");
    element.classList.remove("is-valid");

    return false;

  }

}

// __________________________ End Functions _________________________________



//Get last ID
function generateCustomerId(customers) 
{
  
  let lastId = localStorage.getItem("lastCustomerId");

  if (!lastId && customers.length) {
    lastId = customers[customers.length - 1].id;
  }


  lastId = lastId ? parseInt(lastId) : 0;

  const newId = lastId + 1;

  localStorage.setItem("lastCustomerId", newId);

  return newId;
}


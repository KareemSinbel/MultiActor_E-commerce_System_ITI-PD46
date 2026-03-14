import { addToCart, isInWishlist, redirectToLogin } from "../helpers.js"; 

async function getProducts(apiUrl, container, randomCount = null) {

    showLoading(container);

    try {
        const response = await fetch(apiUrl);
        const products = await response.json();

        let result = products;

        // Select random products if randomCount is provided
        if (randomCount && products.length > randomCount) {
            result = getRandomProducts(products, randomCount);
        }

        renderProducts(result, container);

    } catch (error) {
        showError(container);
        console.error(error);
    }
}


function getRandomProducts(products, count) {

    const shuffled = [...products].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, count);
}





function createProductCard(product) {

    const col = document.createElement("div");
    col.className = "TshirtCard card border-0 rounded-0 col-8 col-md-6 col-lg-3";
    col.style.cursor = "pointer";

    col.innerHTML = `
        <div class="card text-white border-0 rounded-0">
            <img src="${product.image}" class="card-img border-0 rounded-0" height="300px">

            <div class="Tshirt-card-overlay d-none card-img-overlay border-0 rounded-0 bg-white bg-opacity-50 flex-column p-0 justify-content-between">

                <div class="love_container d-flex justify-content-end p-2">
                    <span class="text-muted">
                        <i class="fa-regular fa-heart"></i>
                    </span>
                </div>

                <button class="btn btn-dark border-0 rounded-0 fs-5 add-to-cart">
                    Add to cart
                    <span class="fs-6">
                        <i class="fa-solid fa-cart-plus"></i>
                    </span>
                </button>

            </div>
        </div>

        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">
                <span class="badge rounded-pill bg-white text-muted border me-4">
                    IN STOCK
                </span>
                <span class="text-muted">$${product.price}</span>
            </p>
        </div>
    `;


    col.addEventListener("click", () => {
        const detailsUrl = new URL("../Product Details/productDetails.html", window.location.href);
        detailsUrl.searchParams.set("id", product.id);
        window.location.href = detailsUrl.toString();
        
    });

    col.querySelector(".add-to-cart").addEventListener("click", (e) => {
        e.stopPropagation();
        let res = addToCart(product);
        if(res.success == false)
        {
            if(res.reason === "NOT_LOGGED_IN")
                redirectToLogin();
        }
    });

    return col;
}



function renderProducts(products, container) {

    container.innerHTML = "";

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                No products available
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function showLoading(container) {

    container.innerHTML = `
        <div class="text-center py-5 w-100">
            <div class="spinner-border text-dark" role="status"></div>
            <p class="mt-3 text-muted">Loading products...</p>
        </div>
    `;
}


function showError(container) {

    container.innerHTML = `
        <div class="text-center py-5 text-danger">
            Failed to load products. Please try again.
        </div>
    `;
}

const productsRow = document.getElementById("productsRow");
const Featured = document.getElementById("featuredProducts");
const Latest = document.getElementById("latestProducts");

const API_URL = "https://69b10cdeadac80b427c3d349.mockapi.io/products";

getProducts(
    API_URL,
    productsRow,
    4
);
getProducts(
    API_URL,
    Featured,
    4
);
getProducts(
    API_URL,
    Latest,
    4
);

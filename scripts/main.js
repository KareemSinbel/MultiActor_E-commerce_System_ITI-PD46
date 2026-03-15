import { Router } from "./router.js";

document.addEventListener("LayoutBuilt", () => 
{
    Router.addRoute("home", "../Home/home.html", "./Home/home.js", "../../stylesheets/Home/Home.css");
    Router.addRoute("productDetails", "../Product Details/productDetails.html","./Product Details/productDetails.js" ,"../../stylesheets/Product Details/productDetails.css");
    Router.addRoute("listing", "../Listing/listing.html","./Listing/listing.js" ,"../../stylesheets/Listing/listing.css");


    // detect page from URL
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || "home";

    Router.navigate(page, { ...Object.fromEntries(params), _initialLoad: true })
        .then(() => {
            // If no "page" param exists, update the URL to include home
            if (!params.has("page")) {
                const url = new URL(window.location.origin + window.location.pathname);
                url.searchParams.set("page", "home");
                window.history.replaceState({}, "", url);
            }
        });
});

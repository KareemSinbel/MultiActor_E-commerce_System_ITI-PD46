import { Router } from "./router.js";

document.addEventListener("LayoutBuilt", () => 
{
    Router.addRoute("home", "../Home/home.html", "./Home/home.js", "../../stylesheets/Home/Home.css");
    Router.addRoute("productDetails", "../Product Details/productDetails.html","./Product Details/productDetails.js" ,"../../stylesheets/Product Details/productDetails.css");

    const page = new URLSearchParams(window.location.search).get('page') || "home";
    Router.navigate(page);
});

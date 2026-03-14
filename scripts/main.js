import { Router } from "./router.js";

document.addEventListener("LayoutBuilt", () => 
{
    Router.addRoute("home", "../pages/home.html", "../html/pages/home.js", "../../stylesheets/Home/Home.css");
    const page = new URLSearchParams(window.location.search).get('page') || "home";
    Router.navigate(page);
});

import { showBootstrapToast,toggleBreadcrumb } from "../helpers.js";




document.addEventListener("pageLoaded", (e) => 
{
    if (e.detail.page === "about") 
    {
        toggleBreadcrumb("About", true);

    }
});
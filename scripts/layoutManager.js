import { Router } from "./router.js"
import { updateCartBadge } from "./helpers.js"

export const LayoutManager = (function () {

    const templates = {};
    const basePath = "../components/";

    async function loadTemplate(name) {

        if (templates[name]) 
            return templates[name];

        try
        {
            const res = await fetch(`${basePath}${name}_Template.html`);

            if(!res.ok)
            throw new Error(`Component ${name} not found`);

            const html = await res.text();

            templates[name] = html;

            return html;
        }
        catch(err)
        {
            console.error(err);
            return `<div style="color:red">Component "${name}" failed to load</div>`;
        }
    }

    async function renderComponents() {

        const components = document.querySelectorAll("[data-component]");

        const tasks = [...components].map(async element =>
        {
            const name = element.dataset.component;

            const template = await loadTemplate(name);

            element.innerHTML = template;
        });

        await Promise.all(tasks);
    }

    /**
     * Dynamically render a single component into a given container
     * @param {string} name - component name (matches template file)
     * @param {HTMLElement} container - DOM element to inject the template into
     */
    async function renderComponent(name, container) 
    {
        if (!container) return;
        const template = await loadTemplate(name);
        container.innerHTML = template;
    }

    async function init() 
    {
        await renderComponents();
        document?.dispatchEvent(new CustomEvent("LayoutBuilt", {detail:{isFinished: true}}));
    }

    return {
        init,
        renderComponent
    };

})();

document.addEventListener("DOMContentLoaded", async () => 
{
    await LayoutManager.init();
    

    //Update navbar
    updateNavbar();

    //Update cart
    updateCartBadge();
    

    /************************EVENTS********************************/
    document.addEventListener("AuthChanged", () => 
    {
        updateNavbar();
    });

    //Making logo navigating and cursor set to pointer using Attributes
    const mainLogo = document.getElementById("main-logo");
    mainLogo.setAttribute("role", "button");

    mainLogo.addEventListener("click", function()
    {   
        Router.navigate("home");
    });


    const navPagesElements = document.querySelectorAll(".nav-link-pages");

    const homeLink = document.getElementById("HomeNavLink");
    homeLink.setAttribute("role", "button");
    homeLink.addEventListener("click", function()
    {   
        resetNavPages(navPagesElements);
        homeLink.classList.add("active");
        Router.navigate("home");
    });

    const aboutLink = document.getElementById("AboutNavLink");
    aboutLink.setAttribute("role", "button");
    aboutLink.addEventListener("click", function()
    {   
        resetNavPages(navPagesElements);
        aboutLink.classList.add("active");
        Router.navigate("about");
    });

    const contactLink = document.getElementById("ContactNavLink");
    contactLink.setAttribute("role", "button");
    contactLink.addEventListener("click", function()
    {   
        resetNavPages(navPagesElements);
        contactLink.classList.add("active");
        Router.navigate("contact");
    });

    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("click", function()
    {
        resetNavPages(navPagesElements);
        Router.navigate("listing");
    });

    const cartIcon = document.getElementById("cart-icon");
    cartIcon.addEventListener("click", function()
    {
       resetNavPages(navPagesElements);
       Router.navigate("cart"); 
    });


    document.getElementById("login-btn").addEventListener("click", function()
    {
        resetNavPages(navPagesElements);
        Router.navigate("login");
    });

    document.getElementById("logout-btn").addEventListener("click", function()
    {
        deleteCookie("loggedInUser");
        document?.dispatchEvent(new CustomEvent("AuthChanged"));
        resetNavPages(navPagesElements);
        homeLink.classList.add("active")
        Router.navigate("home");
    });
});


function updateNavbar()
{
    const user = getLoggedInUser();

    if(!user)
    {
        document.getElementById("user-name").style.display = "none";
        document.getElementById("logout-btn").style.display = "none";

        document.getElementById("icons-container").classList.add("d-none");
        document.getElementById("icons-container").classList.remove("d-lg-flex");

        document.getElementById("login-btn").style.display = "block";
    }
    else
    {
        document.getElementById("user-name").style.display = "block";
        document.getElementById("login-btn").style.display = "none";

        document.getElementById("icons-container").classList.remove("d-none");
        document.getElementById("icons-container").classList.add("d-lg-flex");

        document.getElementById("user-name").innerText = user.name;

        document.getElementById("logout-btn").style.display = "block";
    }
}



function resetNavPages(navPagesElements)
{
    navPagesElements.forEach(e=> e.classList.remove("active"));
}
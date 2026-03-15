const LayoutManager = (function () {

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

    async function init() {

        await renderComponents();

    }

    return {
        init
    };

})();

document.addEventListener("DOMContentLoaded", async () => 
{
    await LayoutManager.init();

    // Role-based visibility logic
    const loggedInUserStr = sessionStorage.getItem('loggedInUser');
    let isSeller = false;

    if (loggedInUserStr) {
        try {
            const user = JSON.parse(loggedInUserStr);
            if (user && user.role === 'seller') {
                isSeller = true;
            }
        } catch (e) {
            console.error("Error checking roles", e);
        }
    }

    if (!isSeller) {
        const productNavItem = document.getElementById('product');
        if (productNavItem) {
            productNavItem.remove();
        }
    }

    document?.dispatchEvent(new CustomEvent("LayoutBuilt", {detail:{isFinished: true}}));

    // if(!checkAuth())
    // {
    //     let nav = document.getElementById("icons-container");
    //     nav.classList.remove("d-lg-flex");
    //     nav.classList.add("d-none");    
    // }
    // else
    // {
    //     let nav = document.getElementById("icons-container");
    //     nav.classList.add("d-lg-flex");
    //     nav.classList.remove("d-none");    
    // }
const user = getLoggedInUser();

if(!checkAuth())
{
    
    document.getElementById("user-name").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("icons-container").classList.add("d-none") ;
    document.getElementById("icons-container").classList.remove("d-lg-flex") ;

    document.getElementById("login-btn").style.display = "block";

    document.getElementById("login-btn").addEventListener("click", function(){
        window.location.href = "../../html/Auth/login.html";
    });
}
else
{
    
    document.getElementById("login-btn").style.display = "none";
     document.getElementById("icons-container").classList.remove("d-none") ;
    document.getElementById("icons-container").classList.add("d-lg-flex") ;
    if(user){
        document.getElementById("user-name").innerText = user.username || user.name;
    }

    document.getElementById("logout-btn").addEventListener("click", function(){
        deleteCookie("loggedInUser");
        window.location.href = "../../html/Home/home.html";
    });
}

});

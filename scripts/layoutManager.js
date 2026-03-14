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
    document?.dispatchEvent(new CustomEvent("LayoutBuilt", {detail:{isFinished: true}}));

    

    if(!checkAuth())
    {
        let nav = document.getElementById("icons-container");
        nav.classList.remove("d-lg-flex");
        nav.classList.add("d-none");    
    }
    else
    {
        const loggedInUserStr = getLoggedInUser();
        let isSeller = false;

        if (loggedInUserStr) 
        {
            try {
                if (loggedInUserStr.role === 'seller') {
                    isSeller = true;
                }
            } catch (e) {
                console.error("Error checking roles", e);
            }
        }

        if (!isSeller) 
        {
            const productNavItem = document.getElementById('product');
            if (productNavItem) {
                productNavItem.remove();
            }
        }

        let nav = document.getElementById("icons-container");
        nav.classList.add("d-lg-flex");
        nav.classList.remove("d-none");    
    }
});

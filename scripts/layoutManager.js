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

    // Role-based visibility logic (only basic guard for non-admin)
    const loggedInUserStr = sessionStorage.getItem('loggedInUser');
    let isAdmin = false;

    if (loggedInUserStr) {
        try {
            const user = JSON.parse(loggedInUserStr);
            if (user && user.role === 'admin') isAdmin = true;
        } catch (e) {}
    }

    if (!isAdmin) {
        // Hide admin-only nav items for non-admin users on admin layouts
        ['product'].forEach(id => {
            const navItem = document.getElementById(id);
            if (navItem) navItem.remove();
        });
    }

    document?.dispatchEvent(new CustomEvent("LayoutBuilt", {detail:{isFinished: true}}));

    // Auth UI: use getLoggedInUser/checkAuth/deleteCookie from auth.js if loaded; otherwise fallback
    let user = null;
    if (typeof getLoggedInUser === "function") {
        user = getLoggedInUser();
    } else {
        try {
            const stored = sessionStorage.getItem("loggedInUser");
            let cookieVal = null;
            const m = document.cookie.match(/\bloggedInUser=([^;]*)/);
            if (m) cookieVal = decodeURIComponent(m[1]);
            const raw = stored || cookieVal;
            if (raw) user = JSON.parse(raw);
        } catch (e) {}
    }
    const isLoggedIn = user || (typeof checkAuth === "function" && checkAuth());

    const iconsContainer = document.getElementById("icons-container");
    const userNameEl = document.getElementById("user-name");
    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");

    if (iconsContainer) {
        if (!isLoggedIn) {
            if (userNameEl) userNameEl.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "none";
            iconsContainer.classList.add("d-none");
            iconsContainer.classList.remove("d-lg-flex");
            if (loginBtn) {
                loginBtn.style.display = "block";
                loginBtn.addEventListener("click", function () {
                    window.location.href = "../../html/Auth/login.html";
                });
            }
        } else {
            if (loginBtn) loginBtn.style.display = "none";
            iconsContainer.classList.remove("d-none");
            iconsContainer.classList.add("d-lg-flex");
            if (userNameEl && user) userNameEl.innerText = user.username || user.name || "";
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function () {
                    if (typeof deleteCookie === "function") deleteCookie("loggedInUser");
                    else {
                        sessionStorage.removeItem("loggedInUser");
                        document.cookie = "loggedInUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    }
                    window.location.href = "../../html/Home/home.html";
                });
            }
        }
    }
});

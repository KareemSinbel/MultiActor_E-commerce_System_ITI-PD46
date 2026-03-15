export const Router = (function () {
    const routes = {}; // { pageName: { htmlPath, jsPath, cssPath } }

    function addRoute(name, htmlPath, jsPath = null, cssPath = null) {
        routes[name] = { htmlPath, jsPath, cssPath };
    }

    async function navigate(name, params = {}) 
    {
        const currentParams = new URLSearchParams(window.location.search);
        const currentPage = currentParams.get("page");

        const sameParams = Object.keys(params)
            .filter(k => k !== "_initialLoad")
            .every(k => currentParams.get(k) === params[k]);

        if (currentPage === name && sameParams && !params._initialLoad) {
            return; // skip only if page + params are identical
        }

        const content = document.querySelector('#pageContent');
        if (!content) return;

        content.innerHTML = `<div class="text-center py-5">Loading...</div>`;

        if (!routes[name]) {
            content.innerHTML = "<h2 class='text-center py-5'>Page not found</h2>";
            return;
        }

        try 
        {
            // Load HTML
            const res = await fetch(routes[name].htmlPath);
            if (!res.ok) throw new Error(`Failed to fetch ${routes[name].htmlPath}`);
            const html = await res.text();
            content.innerHTML = html;

            // Inject CSS if provided
            if (routes[name].cssPath) 
            {
                // remove old page CSS
                document.querySelectorAll('link[data-page-css]').forEach(l => l.remove());

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = routes[name].cssPath;
                link.setAttribute('data-page-css', name);
                document.head.appendChild(link);
            }

            // Load JS module dynamically (so page can listen for events)
            if (routes[name].jsPath) {
                import(routes[name].jsPath)
                    .then(module => {
                        // Now the module is loaded, we can fire the event
                        const event = new CustomEvent('pageLoaded', {
                            detail: { page: name, params }
                        });
                        document.dispatchEvent(event);
                    })
                    .catch(err => console.error("Failed to load page JS:", err));
            } else {
                const event = new CustomEvent('pageLoaded', { detail: { page: name, params } });
                document.dispatchEvent(event);
            }

            // Update URL
            const url = new URL(window.location.origin + window.location.pathname);
            url.searchParams.set("page", name);

            Object.keys(params).forEach(k => {
                if (k !== "_initialLoad") {
                    url.searchParams.set(k, params[k]);
                }
            });

            if (!params._initialLoad)
                window.history.pushState({}, '', url);

        } catch (err) {
            console.error(err);
            content.innerHTML = `<div class="text-center py-5 text-danger">
                                    Failed to load page. Please try again.
                                 </div>`;
        }
    }

    // Handle browser back/forward
    window.addEventListener('popstate', async () => 
    {
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        const page = params.page || 'home';

        // Force navigation on back/forward
        await Router.navigate(page, { ...params, _initialLoad: true });
    });

    return { addRoute, navigate };
})();
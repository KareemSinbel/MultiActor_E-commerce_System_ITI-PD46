const Router = (function () {
    const routes = {};

    function addRoute(name, renderFn) {
        routes[name] = renderFn;
    }

    function navigate(name, params = {}) {
        const content = document.querySelector('#pageContent');
        if (!content) return;

        content.innerHTML = ''; // clear previous content
        if (routes[name]) {
            routes[name](params);
        } else {
            content.innerHTML = '<h2>Page not found</h2>';
        }
    }

    return { addRoute, navigate };
})();
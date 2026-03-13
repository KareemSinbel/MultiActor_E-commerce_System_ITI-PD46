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

let layoutBuilt = new CustomEvent("LayoutBuilt", {detail:{isFinished: true}});

document.addEventListener("DOMContentLoaded", async () => 
{
    let layoutBuilt = new CustomEvent("LayoutBuilt", {detail:{isFinished: true}});
    await LayoutManager.init();
    document?.dispatchEvent(layoutBuilt);
});
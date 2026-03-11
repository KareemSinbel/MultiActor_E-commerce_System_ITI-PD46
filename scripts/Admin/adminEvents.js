document.addEventListener("LayoutBuilt", function(event)
{
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector("#sidebar");
  menuBtn.addEventListener("click", () => 
  {
    sidebar.classList.toggle("show");
  });

  if (!sidebar) 
      return;

  const page = window.location.pathname.split("/").pop().replace(".html", "");
  const item = document.querySelector("#" + page + " .nav-link");
  if (item)
  {
      item.classList.add("active");
  }
});
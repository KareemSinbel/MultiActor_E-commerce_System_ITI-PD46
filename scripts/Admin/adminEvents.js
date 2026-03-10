document.addEventListener("LayoutBuilt", function(event)
{
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.querySelector("#sidebar");
  menuBtn.addEventListener("click", () => 
  {
    sidebar.classList.toggle("show");
  });
});
document.addEventListener('DOMContentLoaded', () => 
{
  const form = document.querySelector('#addProductForm');
  const sizeButtons = document.querySelectorAll('.size-pill');
  const fileInput = document.querySelector('#imagesInput');
  const previewList = document.querySelector('.image-preview-list');

  document.getElementById("cancelBtn").addEventListener("click", () => 
  {
    history.back();
  });

  document.querySelectorAll(".color-dot").forEach(dot => 
  {
    dot.addEventListener("click", () => 
    {
      dot.classList.toggle("selected");
    });
  });

  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });

  if (fileInput && previewList) {
    fileInput.addEventListener('change', event => {
      const files = Array.from(event.target.files || []);
      previewList.innerHTML = '';

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const item = document.createElement('div');
          item.className = 'image-preview-item';
          item.innerHTML = `
            <button type="button" class="image-remove-btn">&times;</button>
            <img src="${e.target.result}" alt="${file.name}">
          `;
          previewList.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
    });

    previewList.addEventListener('click', e => {
      const removeBtn = e.target.closest('.image-remove-btn');
      if (removeBtn) {
        const item = removeBtn.closest('.image-preview-item');
        if (item) item.remove();
      }
    });
  }

  if (form) 
  {
    form.addEventListener('submit', async (event) => 
    {
      event.preventDefault();

      if (!form.checkValidity()) 
      {
        form.classList.add('was-validated');
        return;
      }

      const sizes = [...document.querySelectorAll(".size-pill.active")]
                      .map(s => s.textContent);

      const colors = [...document.querySelectorAll(".color-dot.selected")]
                      .map(c => c.style.backgroundColor);

      const categoryValue = (document.getElementById("category").value || "").trim();
      const title = (document.getElementById("title").value || "").trim();
      const description = (document.getElementById("description").value || "").trim();
      const price = Number(document.getElementById("price").value);
      const quantity = Number(document.getElementById("quantity").value) || 0;
      const sku = (document.getElementById("sku").value || "").trim();

      let sellerId = "1";
      const loggedInUserStr = sessionStorage.getItem("loggedInUser");
      try {
        if (loggedInUserStr) {
          const user = JSON.parse(loggedInUserStr);
          if (user && user.role === "seller" && user.id) sellerId = String(user.id);
        }
      } catch (e) {}

      // Payload matches API shape: state = 0 (Pending), 1 (Approved), -1 (Declined)
      const product = {
        name: title || "Untitled Product",
        description: description || "",
        price: Number.isFinite(price) ? price : 0,
        stock: quantity,
        sku: sku || "SKU-" + Date.now(),
        categories: [categoryValue || "General"],
        sizesList: Array.isArray(sizes) ? sizes : [],
        colorsList: Array.isArray(colors) ? colors : [],
        image: "https://picsum.photos/400/300",
        starsTotalPoints: 0,
        numOfReviews: 0,
        status: 0,
        sellerId: sellerId
      };

      try
      {
        const res = await fetch(
          "https://69b10cdeadac80b427c3d349.mockapi.io/products",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          console.error("API error:", res.status, errText);
          throw new Error("Failed to create product");
        }

        alert("Product added successfully");

        window.location.href = "./product.html";

        form.reset();
      }
      catch (err) 
      {
        console.error(err);
        alert("Error adding product");
      }

    });
  }
});


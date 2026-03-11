document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#addProductForm');
  const sizeButtons = document.querySelectorAll('.size-pill');
  const fileInput = document.querySelector('#imagesInput');
  const previewList = document.querySelector('.image-preview-list');

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

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      alert('Product saved (demo only).');
    });
  }
});


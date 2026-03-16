export function productCard(p)
{
    let stockObj = {};

    if (!p.image || p.image.trim().length === 0) 
    {
        p.image = './Images/product.jpg';
    }

    if(p.stock > 0)
    {
        stockObj['StockStr'] = "In Stock";
        stockObj['State'] = 'success';
    }
    else
    {
        stockObj['StockStr'] = "Out Of Stock";
        stockObj['State'] = 'danger';
    }

    return `
        <div class="TshirtCard card h-100 border-0 rounded-0" >
            <a class="nav-link product">
                <div class="card text-white border-0 rounded-0">
                    <img src="${p.image}" class="card-img border-0 rounded-0 product-image" alt="${p.name}" >        
                    <div class="Tshirt-card-overlay d-none card-img-overlay border-0 rounded-0 bg-white bg-opacity-50 flex-column p-0 justify-content-between">
                        <div class="love_container d-flex justify-content-end p-2"><span class="text-muted"><i class="fa-regular fa-heart"></i></span></div>
                        <button class="btn btn-dark border-0 rounded-0 fs-5 add-to-cart"> Add to cart   <span class="fs-6">  <i class="fa-solid fa-cart-plus"></i></span></button>
                    </div>
                </div>
            </a>
            <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text"><span class="badge rounded-pill bg-white text-muted border me-4">${stockObj['StockStr'].toUpperCase()}</span> <span class="text-muted">$${p.price.toFixed(2)}</span></p>
            </div>
        </div>
    `;
}
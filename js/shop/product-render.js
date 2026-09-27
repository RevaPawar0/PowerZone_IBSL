/**
 * POWERZONE : GYM & SPORTS STORE
 * Sports Catalog Grid Renderer, Search & Filter Controller (shop.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  initShopControls();
});

function initShopControls() {
  const shopGrid = document.getElementById('shopGridContainer');
  if (!shopGrid || typeof POWERZONE_PRODUCTS === 'undefined') return;

  let currentCategory = 'all';
  let currentSort = 'featured';
  let searchQuery = '';

  function renderShop() {
    let filtered = [...POWERZONE_PRODUCTS];

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (currentSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
      shopGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <h3 style="margin-bottom: 0.5rem;">No Sports Material Found</h3>
          <p>Try searching for cricket bats, turf shoes, trophies, or lifting belts.</p>
        </div>
      `;
      return;
    }

    const stockOverrides = JSON.parse(localStorage.getItem('powerzone_stock_status_v1') || '{}');

    shopGrid.innerHTML = filtered.map(prod => {
      const isOutOfStock = stockOverrides[prod.id] === 'out';
      return `
      <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}">
        <div class="product-thumb-holder">
          <span class="badge ${isOutOfStock ? 'badge-muted' : (prod.badge === 'Best Seller' ? 'badge-gold' : (prod.badge === 'Pro Choice' ? 'badge-crimson' : 'badge-cyan'))} product-badge-tag">
            ${isOutOfStock ? 'Out of Stock' : prod.badge}
          </span>
          <img src="${prod.image}" alt="${prod.name}" loading="lazy" style="${isOutOfStock ? 'filter: grayscale(80%); opacity: 0.7;' : ''}">
          <button class="btn btn-secondary btn-sm quick-view-btn" onclick="window.pzModalMgr.openQuickView('${prod.id}')">
            Quick Details
          </button>
        </div>
        <div class="product-info">
          <span class="product-category-label">${prod.category}</span>
          <h3 class="product-title">${prod.name}</h3>
          <div class="product-rating">
            <span>★</span> ${prod.rating} <span>(${prod.reviews} reviews)</span>
          </div>
          <div class="product-footer">
            <div class="product-price-row">
              <div class="product-price">
                ₹${prod.price.toLocaleString('en-IN')}
                ${prod.oldPrice ? `<span class="old-price">₹${prod.oldPrice.toLocaleString('en-IN')}</span>` : ''}
              </div>
              <span style="font-size: 0.75rem; color: ${isOutOfStock ? 'var(--primary)' : 'var(--accent-green)'}; font-weight: 700;">
                ${isOutOfStock ? '● Restocking Soon' : '● COD Available'}
              </span>
            </div>
            <div class="product-btn-group">
              ${isOutOfStock ? `
                <button class="btn btn-secondary btn-sm" disabled style="width: 100%; opacity: 0.55; cursor: not-allowed;">
                  Out of Stock
                </button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="window.pzCart.buyNow('${prod.id}')">
                  Buy / Order (COD)
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.pzCart.addItem('${prod.id}', 1)" title="Add to Cart">
                  Add to Cart
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');
  }

  renderShop();

  document.querySelectorAll('.shop-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shop-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      renderShop();
    });
  });

  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderShop();
    });
  }

  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderShop();
    });
  }
}

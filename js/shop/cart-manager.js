/**
 * POWERZONE : GYM & SPORTS STORE
 * Shopping Cart Manager, Slide-Over Drawer & Calculations
 */

class PowerZoneCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('powerzone_cart')) || [];
    this.discountPercent = 0;
    this.appliedCoupon = null;

    this.init();
  }

  init() {
    this.updateBadges();
    this.bindEvents();
  }

  save() {
    localStorage.setItem('powerzone_cart', JSON.stringify(this.cart));
    this.updateBadges();
    this.renderDrawer();
  }

  addItem(productId, qty = 1) {
    if (typeof POWERZONE_PRODUCTS === 'undefined') return;
    const product = POWERZONE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      });
    }

    this.save();
    this.animateBadge();
    
    if (window.showToast) {
      window.showToast('Added to Cart', `${product.name} (x${qty}) added!`, 'success');
    }
  }

  buyNow(productId) {
    if (typeof POWERZONE_PRODUCTS === 'undefined') return;
    const product = POWERZONE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Add item if not in cart
    const existing = this.cart.find(item => item.id === productId);
    if (!existing) {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      });
      this.save();
    }

    if (typeof this.openCheckoutModal === 'function') {
      this.openCheckoutModal();
    }
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.save();
    if (window.showToast) {
      window.showToast('Item Removed', 'Product removed from your cart.', 'crimson');
    }
  }

  updateQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(productId);
    } else {
      this.save();
    }
  }

  applyCoupon(code) {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'POWERZONE20' || normalized === 'FUSION20' || normalized === 'SHIRDI20') {
      this.discountPercent = 0.20;
      this.appliedCoupon = normalized;
      this.renderDrawer();
      if (window.showToast) {
        window.showToast('Coupon Applied!', '20% OFF applied to your order subtotal.', 'success');
      }
      return true;
    } else if (normalized === '') {
      this.discountPercent = 0;
      this.appliedCoupon = null;
      this.renderDrawer();
      return false;
    } else {
      if (window.showToast) {
        window.showToast('Invalid Coupon', 'Code not recognized. Try POWERZONE20!', 'crimson');
      }
      return false;
    }
  }

  getTotalCount() {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  getCalculations() {
    const subtotal = this.getSubtotal();
    const discount = subtotal * this.discountPercent;
    const gst = Math.round((subtotal - discount) * 0.05); // 5% GST on sports equipment
    const total = (subtotal - discount) + gst;
    return { subtotal, discount, gst, total };
  }

  updateBadges() {
    const count = this.getTotalCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  animateBadge() {
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    });
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      this.renderDrawer();
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  renderDrawer() {
    const container = document.getElementById('cartItemsList');
    const breakdownContainer = document.getElementById('cartBreakdown');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h4>Your Cart is Empty</h4>
          <p style="margin-top: 0.5rem; font-size: 0.88rem;">Explore cricket bats, turf shoes, trophies, and gym iron.</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top: 1.25rem;">Explore Sports Store</a>
        </div>
      `;
      if (breakdownContainer) {
        breakdownContainer.innerHTML = '';
      }
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="window.pzCart.updateQty('${item.id}', -1)">-</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="window.pzCart.updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window.pzCart.removeItem('${item.id}')" title="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    const { subtotal, discount, gst, total } = this.getCalculations();

    if (breakdownContainer) {
      breakdownContainer.innerHTML = `
        <div class="breakdown-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${discount > 0 ? `
          <div class="breakdown-row" style="color: var(--accent-green);">
            <span>Discount (${this.appliedCoupon})</span>
            <span>-₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="breakdown-row">
          <span>GST (5%)</span>
          <span>₹${gst.toLocaleString('en-IN')}</span>
        </div>
        <div class="breakdown-row total">
          <span>Grand Total</span>
          <span style="color: var(--primary);">₹${total.toLocaleString('en-IN')}</span>
        </div>
      `;
    }
  }

  bindEvents() {
    document.querySelectorAll('.cart-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    const promoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoCodeInput');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        this.applyCoupon(promoInput.value);
      });
      promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyCoupon(promoInput.value);
        }
      });
    }

    const checkoutBtn = document.getElementById('checkoutDrawerBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (typeof this.openCheckoutModal === 'function') {
          this.openCheckoutModal();
        }
      });
    }
  }
}

// Global cart instance
window.pzCart = window.pzCart || new PowerZoneCart();
window.fitCart = window.pzCart; // backward compat alias

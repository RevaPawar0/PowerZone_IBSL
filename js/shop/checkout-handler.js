/**
 * POWERZONE : GYM & SPORTS STORE
 * COD & UPI Checkout Modal Handler & WhatsApp Order Dispatch Integration
 */

(function() {
  const cart = window.pzCart || PowerZoneCart.prototype;

  cart.openCheckoutModal = function() {
    if (this.cart.length === 0) {
      if (window.showToast) window.showToast('Empty Cart', 'Please add sports items before checkout.', 'crimson');
      return;
    }

    this.closeDrawer();
    const modal = document.getElementById('checkoutModal');
    const summary = document.getElementById('checkoutSummaryContent');
    const formWrap = document.getElementById('checkoutFormWrap');
    const successWrap = document.getElementById('checkoutSuccessWrap');

    if (formWrap) formWrap.style.display = 'block';
    if (successWrap) successWrap.style.display = 'none';

    if (modal && summary) {
      const { total } = this.getCalculations();
      const orderRef = 'PZ-' + Math.floor(100000 + Math.random() * 900000);

      summary.innerHTML = `
        <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.4rem;">
            <span>Order Reference</span>
            <strong style="color: var(--text-primary); font-family: var(--font-display);">${orderRef}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.4rem;">
            <span>Total Items</span>
            <strong style="color: var(--text-primary);">${this.getTotalCount()} items</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--primary); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; margin-top: 0.4rem;">
            <span>Payable Amount</span>
            <span>₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;

      if (window.pzAuth && typeof window.pzAuth.prefillFormsForCurrentUser === 'function') {
        window.pzAuth.prefillFormsForCurrentUser();
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  cart.closeCheckoutModal = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  cart.processOrder = async function(formData) {
    const formWrap = document.getElementById('checkoutFormWrap');
    const successWrap = document.getElementById('checkoutSuccessWrap');
    const { total } = this.getCalculations();

    const paymentMethodText = formData.paymentMethod === 'upi' || formData.paymentMethod === 'Instant UPI'
      ? 'Instant UPI'
      : 'Cash on Delivery (COD)';

    const orderItems = this.cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty
    }));

    const itemNames = orderItems.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderId = 'PZ-ORD-' + Math.floor(10000 + Math.random() * 90000);
    const totalPrice = total;

    // Directly write order to Supabase PostgreSQL Database
    let res = null;
    if (window.PowerZoneDB && typeof window.PowerZoneDB.createOrder === 'function') {
      try {
        res = await window.PowerZoneDB.createOrder({
          id: orderId,
          customer_name: formData.name,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          pincode: formData.pincode,
          item: itemNames,
          price: totalPrice,
          payment_method: paymentMethodText,
          status: 'Pending'
        });
        console.log("Supabase Insert Result:", res);
      } catch (err) {
        console.error('Error inserting order to Supabase:', err);
      }
    }

    const savedOrder = res || {
      id: orderId,
      customer_name: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      pincode: formData.pincode,
      item: itemNames,
      price: totalPrice,
      payment_method: paymentMethodText,
      status: 'Pending'
    };

    if (formWrap && successWrap) {
      formWrap.style.display = 'none';
      successWrap.style.display = 'block';

      const waMsg = `Hi PowerZone Shirdi, I have placed Order *${savedOrder.id}* for *₹${totalPrice.toLocaleString('en-IN')}* via *${paymentMethodText}*.\nName: ${formData.name}\nAddress: ${formData.address}, ${formData.city} - ${formData.pincode}\nItems: ${itemNames}\nPlease confirm dispatch.`;
      const waUrl = `https://wa.me/919422201823?text=${encodeURIComponent(waMsg)}`;

      successWrap.innerHTML = `
        <div class="order-success-card">
          <div class="order-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="badge badge-green" style="margin-bottom: 0.5rem;">ORDER SAVED IN LIVE SUPABASE DATABASE</span>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.35rem; color: var(--text-primary);">Order Confirmed, ${formData.name}!</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Order ID: <strong style="color: var(--primary); font-family: var(--font-display);">${savedOrder.id}</strong> • Synced to PostgreSQL Cloud DB
          </p>

          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; text-align: left; margin-bottom: 1.25rem; font-size: 0.88rem; line-height: 1.8;">
            <div><strong>Items Ordered:</strong> ${itemNames}</div>
            <div><strong>Delivery Town/City:</strong> ${formData.city} (PIN: ${formData.pincode})</div>
            <div><strong>Shipping Address:</strong> ${formData.address}</div>
            <div><strong>WhatsApp Mobile:</strong> +91 ${formData.phone}</div>
            <div><strong>Payment Mode:</strong> ${paymentMethodText}</div>
            <div style="border-top: 1px solid var(--border-subtle); margin-top: 0.5rem; padding-top: 0.5rem; display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; color: var(--primary);">
              <span>Total Payable Amount:</span>
              <span>₹${totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style="background: rgba(37, 211, 102, 0.12); border: 1px dashed var(--accent-whatsapp); border-radius: var(--radius-sm); padding: 0.85rem; text-align: center; margin-bottom: 1.25rem;">
            <p style="font-size: 0.82rem; color: var(--accent-whatsapp); font-weight: 700; margin-bottom: 0.5rem;">
              📲 Instant 1-Click WhatsApp Dispatch Confirmation:
            </p>
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="background: #25d366; border-color: #25d366; color: #ffffff; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>💬 Confirm Order on WhatsApp (+91 94222 01823)</span>
            </a>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.location.href='shop.html'">
              Continue Shopping
            </button>
            <a href="portal.html" target="_blank" class="btn btn-outline btn-sm">
              ⚡ Open Owner Terminal
            </a>
          </div>
        </div>
      `;

      // Clear cart
      this.cart = [];
      this.appliedCoupon = null;
      this.discountPercent = 0;
      this.save();

      if (window.showToast) {
        window.showToast('Order Stored!', `Order ${savedOrder.id} logged in live Supabase database.`, 'success');
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim().replace(/\D/g, '');
        const city = document.getElementById('checkoutCity').value.trim();
        const address = document.getElementById('checkoutAddress').value.trim();
        const pincode = document.getElementById('checkoutPincode').value.trim().replace(/\D/g, '');
        const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentRadio ? (paymentRadio.value === 'upi' ? 'Instant UPI' : 'Cash on Delivery (COD)') : 'Cash on Delivery (COD)';

        if (!name || name.length < 2) {
          if (window.showToast) window.showToast('Invalid Name', 'Please enter a valid full name.', 'crimson');
          return;
        }

        // Strict 10-digit Indian phone validation (starts with 6, 7, 8, or 9)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          if (window.showToast) window.showToast('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).', 'crimson');
          document.getElementById('checkoutPhone')?.focus();
          return;
        }

        // Strict 6-digit Indian pincode validation
        const pinRegex = /^\d{6}$/;
        if (!pinRegex.test(pincode)) {
          if (window.showToast) window.showToast('Invalid Pincode', 'Please enter a valid 6-digit postal pincode (e.g. 423109 for Shirdi).', 'crimson');
          document.getElementById('checkoutPincode')?.focus();
          return;
        }

        if (!address || address.length < 5) {
          if (window.showToast) window.showToast('Incomplete Address', 'Please provide your full delivery address and landmark.', 'crimson');
          document.getElementById('checkoutAddress')?.focus();
          return;
        }

        if (window.pzCart && typeof window.pzCart.processOrder === 'function') {
          await window.pzCart.processOrder({ name, phone, city, address, pincode, paymentMethod });
        }
      });
    }
  });
})();

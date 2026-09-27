/**
 * POWERZONE : GYM & SPORTS STORE
 * Store Owner Portal Table Renderers (Orders, VIP Passes, Trial Bookings & Stock Status)
 */

window.PowerZonePortalOrders = {
  renderOrdersTable: function(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-state">No live customer orders recorded in database yet. Click "+ Quick Demo Order" above to generate one.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(ord => {
      const itemsSummary = ord.item || ord.itemsSummary || (ord.items || []).map(i => `${i.name} (x${i.qty || 1})`).join(', ');
      const totalAmount = Number(ord.price || ord.totalAmount || 0);
      const custName = ord.customer_name || ord.customerName || 'Athlete';
      const waUrl = `https://wa.me/91${ord.phone}?text=${encodeURIComponent(`Hi ${custName}, this is PowerZone Shirdi Store regarding your Order ${ord.id} for ₹${totalAmount}. Current Status: ${ord.status}.`)}`;

      return `
        <tr>
          <td>
            <strong style="color: var(--primary); font-family: var(--font-display);">${ord.id}</strong><br>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${ord.timestamp || 'Recent'}</span>
          </td>
          <td>
            <strong>${custName}</strong><br>
            <a href="${waUrl}" target="_blank" rel="noopener" style="font-size: 0.78rem; color: var(--accent-whatsapp); font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem;">
              💬 +91 ${ord.phone}
            </a>
          </td>
          <td>
            ${ord.address || 'Nagar-Manmad Road'}<br>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${ord.city || 'Shirdi'} - ${ord.pincode || '423109'}</span>
          </td>
          <td>
            <div style="max-width: 200px; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</div>
            <strong style="color: var(--text-primary); font-size: 0.95rem;">₹${totalAmount.toLocaleString('en-IN')}</strong>
          </td>
          <td><span class="badge ${(ord.payment_method || ord.paymentMethod || '').includes('UPI') ? 'badge-gold' : 'badge-cyan'}">${ord.payment_method || ord.paymentMethod || 'COD'}</span></td>
          <td>
            <select class="admin-status-select" onchange="window.pzPortal.updateOrderStatus('${ord.id}', this.value)">
              <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Packed" ${ord.status === 'Packed' ? 'selected' : ''}>Packed</option>
              <option value="Dispatched" ${ord.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button class="btn-delete-row" title="Delete Order" onclick="window.pzPortal.deleteRecord('orders', '${ord.id}')">🗑</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderPassesTable: function(passes, leads = []) {
    const tbody = document.getElementById('passesTableBody');
    if (!tbody) return;

    const passLeads = (leads || []).filter(l => (l.goal || '').includes('Pass') || (l.id || '').includes('PASS'));
    const combined = [...passes];

    passLeads.forEach(l => {
      if (!combined.some(p => p.id === l.id)) {
        combined.unshift({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: 'athlete@powerzone.in',
          branch: l.preferred_slot || 'Shirdi Central',
          date: 'Scheduled',
          status: 'Active'
        });
      }
    });

    if (combined.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-state">No VIP Gym passes recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = combined.map(p => {
      const waUrl = `https://wa.me/91${p.phone}?text=${encodeURIComponent(`Hi ${p.name}, welcome to PowerZone Shirdi! Your 1-Day VIP Pass ${p.id} is confirmed.`)}`;
      return `
        <tr>
          <td><strong style="color: var(--secondary); font-family: var(--font-display);">${p.id}</strong></td>
          <td><strong>${p.name}</strong></td>
          <td>
            ${p.email || 'N/A'}<br>
            <a href="${waUrl}" target="_blank" rel="noopener" style="font-size: 0.78rem; color: var(--accent-whatsapp); font-weight: 700;">
              💬 +91 ${p.phone || 'N/A'}
            </a>
          </td>
          <td><span style="font-size: 0.8rem;">${p.branch}</span></td>
          <td><span class="badge badge-gold">${p.date}</span></td>
          <td>
            <select class="admin-status-select" onchange="window.pzPortal.updateStatus('passes', '${p.id}', this.value)">
              <option value="Active" ${p.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Redeemed" ${p.status === 'Redeemed' ? 'selected' : ''}>Redeemed</option>
              <option value="Expired" ${p.status === 'Expired' ? 'selected' : ''}>Expired</option>
            </select>
          </td>
          <td>
            <button class="btn-delete-row" onclick="window.pzPortal.deleteRecord('passes', '${p.id}')">🗑</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderTrialsTable: function(trials, leads = []) {
    const tbody = document.getElementById('trialsTableBody');
    if (!tbody) return;

    const trialLeads = (leads || []).filter(l => !(l.goal || '').includes('Pass') && !(l.id || '').includes('PASS'));
    const combined = [...trials];

    trialLeads.forEach(l => {
      if (!combined.some(t => t.id === l.id)) {
        combined.unshift({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: 'athlete@powerzone.in',
          className: l.goal || 'Burn & Build',
          trainer: 'Head Coach',
          timeSlot: l.preferred_slot || 'Morning (06:00 AM)',
          status: 'Confirmed'
        });
      }
    });

    if (combined.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-state">No class trial bookings recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = combined.map(t => {
      const waUrl = `https://wa.me/91${t.phone}?text=${encodeURIComponent(`Hi ${t.name}, this is PowerZone Coaching HQ regarding your trial slot for ${t.className}.`)}`;
      return `
        <tr>
          <td><strong style="color: var(--accent-cyan); font-family: var(--font-display);">${t.id}</strong></td>
          <td><strong>${t.name}</strong></td>
          <td>
            ${t.email || 'N/A'}<br>
            <a href="${waUrl}" target="_blank" rel="noopener" style="font-size: 0.78rem; color: var(--accent-whatsapp); font-weight: 700;">
              💬 +91 ${t.phone || 'N/A'}
            </a>
          </td>
          <td><span class="badge badge-crimson">${t.className}</span></td>
          <td>${t.trainer}<br><span style="font-size: 0.75rem; color: var(--text-muted);">${t.timeSlot}</span></td>
          <td>
            <select class="admin-status-select" onchange="window.pzPortal.updateStatus('bookings', '${t.id}', this.value)">
              <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${t.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Attended" ${t.status === 'Attended' ? 'selected' : ''}>Attended</option>
              <option value="Cancelled" ${t.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button class="btn-delete-row" onclick="window.pzPortal.deleteRecord('bookings', '${t.id}')">🗑</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderStockGrid: function() {
    const grid = document.getElementById('stockGridContainer');
    if (!grid || typeof POWERZONE_PRODUCTS === 'undefined') return;

    const stockOverrides = JSON.parse(localStorage.getItem('powerzone_stock_status_v1') || '{}');

    grid.innerHTML = POWERZONE_PRODUCTS.map(prod => {
      const isOut = stockOverrides[prod.id] === 'out';
      return `
        <div class="stock-card">
          <img src="${prod.image}" alt="${prod.name}" class="stock-card-img" style="${isOut ? 'filter: grayscale(80%); opacity: 0.6;' : ''}">
          <div style="flex-grow: 1;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">${prod.category}</div>
            <h4 style="font-size: 0.92rem; color: var(--text-primary); margin-bottom: 0.25rem;">${prod.name}</h4>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--primary);">₹${prod.price.toLocaleString('en-IN')}</div>
          </div>
          <button class="stock-toggle-btn ${isOut ? 'out-stock' : 'in-stock'}" onclick="window.pzPortal.toggleProductStock('${prod.id}')">
            ${isOut ? '✕ Out of Stock' : '✓ In Stock'}
          </button>
        </div>
      `;
    }).join('');
  }
};

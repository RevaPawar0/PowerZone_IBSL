/**
 * POWERZONE : GYM & SPORTS STORE
 * Store Owner Management Portal & CRM Controller Actions
 * Regional Hub: Shirdi (Nagar-Manmad Highway), Maharashtra
 */

class PowerZonePortalController {
  constructor() {
    this.sessionAuthKey = 'powerzone_portal_unlocked';
    this.orders = [];
    this.leads = [];
    this.passes = [];
    this.bookings = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuth();
  }

  checkAuth() {
    const isAuth = sessionStorage.getItem(this.sessionAuthKey) === 'true';
    const authView = document.getElementById('portalAuthView');
    const dashView = document.getElementById('portalDashboardView');
    const logoutBtn = document.getElementById('portalLogoutBtn');

    if (isAuth) {
      if (authView) authView.style.display = 'none';
      if (dashView) dashView.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      this.renderDashboard();
    } else {
      if (authView) authView.style.display = 'block';
      if (dashView) dashView.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  login(pinOrEmail, password) {
    const cleanVal = (pinOrEmail || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanVal === '1234' || cleanVal === '9422' || (cleanVal === 'admin@powerzone.in' && (cleanPass === 'admin123' || !cleanPass))) {
      sessionStorage.setItem(this.sessionAuthKey, 'true');
      if (window.showToast) window.showToast('Terminal Unlocked', 'Welcome to PowerZone Operations Portal.', 'success');
      this.checkAuth();
      return true;
    } else {
      if (window.showToast) window.showToast('Access Denied', 'Invalid PIN or credentials. Try PIN 1234 or admin@powerzone.in.', 'crimson');
      return false;
    }
  }

  logout() {
    sessionStorage.removeItem(this.sessionAuthKey);
    if (window.showToast) window.showToast('Signed Out', 'Portal terminal session ended.', 'crimson');
    this.checkAuth();
  }

  switchTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.portal-tab-content').forEach(panel => {
      panel.style.display = panel.id === tabId ? 'block' : 'none';
    });
  }

  async renderDashboard() {
    // 1. Fetch live orders directly from Supabase PostgreSQL Database
    try {
      if (window.PowerZoneDB && typeof window.PowerZoneDB.fetchAllOrders === 'function') {
        this.orders = await window.PowerZoneDB.fetchAllOrders();
        console.log("⚡ Portal: Fetched live Supabase orders count:", this.orders.length);
      }
    } catch (e) {
      console.error('Error fetching Supabase orders in portal:', e);
    }

    // 2. Fetch live leads directly from Supabase
    try {
      if (window.PowerZoneDB && typeof window.PowerZoneDB.fetchAllLeads === 'function') {
        this.leads = await window.PowerZoneDB.fetchAllLeads();
      }
    } catch (e) {
      console.error('Error fetching Supabase leads in portal:', e);
    }

    // 3. Fallback/supplemental local data
    if (window.PowerZoneDB && typeof window.PowerZoneDB.getDB === 'function') {
      const db = window.PowerZoneDB.getDB();
      this.passes = db.passes || [];
      this.bookings = db.bookings || [];
    }

    const orders = this.orders || [];
    const leads = this.leads || [];
    const passes = this.passes || [];
    const bookings = this.bookings || [];

    // Real-Time KPI Metrics Computation
    if (window.PowerZonePortalKPI && typeof window.PowerZonePortalKPI.renderKPIs === 'function') {
      window.PowerZonePortalKPI.renderKPIs(orders, leads, passes, bookings);
    }

    // Render Data Tables
    if (window.PowerZonePortalOrders) {
      window.PowerZonePortalOrders.renderOrdersTable(orders);
      window.PowerZonePortalOrders.renderPassesTable(passes, leads);
      window.PowerZonePortalOrders.renderTrialsTable(bookings, leads);
      window.PowerZonePortalOrders.renderStockGrid();
    }
  }

  toggleProductStock(productId) {
    const stockOverrides = JSON.parse(localStorage.getItem('powerzone_stock_status_v1') || '{}');
    const currentState = stockOverrides[productId] === 'out';
    stockOverrides[productId] = currentState ? 'in' : 'out';
    localStorage.setItem('powerzone_stock_status_v1', JSON.stringify(stockOverrides));

    if (window.showToast) {
      window.showToast('Stock Updated', `${productId} is now ${stockOverrides[productId] === 'out' ? 'Out of Stock' : 'In Stock'}.`, 'success');
    }
    if (window.PowerZonePortalOrders) {
      window.PowerZonePortalOrders.renderStockGrid();
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    if (window.PowerZoneDB && typeof window.PowerZoneDB.updateOrderStatus === 'function') {
      await window.PowerZoneDB.updateOrderStatus(orderId, newStatus);
    } else if (window.PowerZoneDB && typeof window.PowerZoneDB.updateStatus === 'function') {
      window.PowerZoneDB.updateStatus('orders', orderId, newStatus);
    }

    if (window.showToast) {
      window.showToast('Dispatch Updated', `Order ${orderId} marked as ${newStatus} in Supabase database.`, 'success');
    }
    this.renderDashboard();
  }

  updateStatus(table, id, newStatus) {
    if (window.PowerZoneDB && typeof window.PowerZoneDB.updateStatus === 'function') {
      window.PowerZoneDB.updateStatus(table, id, newStatus);
    }
    if (window.showToast) {
      window.showToast('Status Updated', `${id} marked as ${newStatus}.`, 'success');
    }
    this.renderDashboard();
  }

  async deleteRecord(table, id) {
    if (confirm(`Permanently delete record ${id} from database?`)) {
      if (table === 'orders') {
        if (window.PowerZoneDB && typeof window.PowerZoneDB.deleteOrder === 'function') {
          await window.PowerZoneDB.deleteOrder(id);
        } else if (window.PowerZoneDB && typeof window.PowerZoneDB.delete === 'function') {
          window.PowerZoneDB.delete(table, id);
        }
      } else {
        if (window.PowerZoneDB && typeof window.PowerZoneDB.delete === 'function') {
          window.PowerZoneDB.delete(table, id);
        }
      }

      if (window.showToast) {
        window.showToast('Record Deleted', `Record ${id} removed from database.`, 'crimson');
      }
      this.renderDashboard();
    }
  }

  async addDemoOrder() {
    const names = ['Kavita Shinde', 'Mahesh Kadam', 'Swapnil Deshmukh', 'Pooja Borawake', 'Sanjay Jadhav', 'Rahul Gunjal', 'Priya Deshmukh'];
    const cities = ['Shirdi', 'Kopargaon', 'Rahata', 'Sainagar', 'Sangamner'];
    const itemsList = [
      'Grade 1 Kashmir Willow Cricket Bat (Full Size) (x1)',
      'Pro Turf Studs / Football Shoes (x1)',
      '10mm Heavy Duty Leather Powerlifting Lever Belt (x1)',
      'Commercial Hex Rubber Dumbbells Pair (15kg x 2) (x1)',
      'Pro Carbon Graphite Badminton Rackets Set (Pack of 2) (x1)'
    ];
    const prices = [2899, 2499, 2199, 3499, 1899];

    const randomIdx = Math.floor(Math.random() * names.length);
    const randomItemIdx = Math.floor(Math.random() * itemsList.length);
    const randomName = names[randomIdx];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomItem = itemsList[randomItemIdx];
    const randomPrice = prices[randomItemIdx];

    const orderPayload = {
      id: 'PZ-ORD-' + Math.floor(10000 + Math.random() * 90000),
      customer_name: randomName,
      phone: '98' + Math.floor(10000000 + Math.random() * 90000000),
      city: randomCity,
      address: 'Main Market Road, ' + randomCity,
      pincode: '423109',
      item: randomItem,
      price: randomPrice,
      payment_method: 'Cash on Delivery (COD)',
      status: 'Pending'
    };

    if (window.PowerZoneDB && typeof window.PowerZoneDB.createOrder === 'function') {
      await window.PowerZoneDB.createOrder(orderPayload);
    } else if (window.PowerZoneDB && typeof window.PowerZoneDB.insert === 'function') {
      window.PowerZoneDB.insert('orders', orderPayload);
    }

    if (window.showToast) {
      window.showToast('Demo Order Logged', `Generated new sample order for ${randomName} in Supabase!`, 'success');
    }
    this.renderDashboard();
  }

  bindEvents() {
    const form = document.getElementById('portalLoginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('portalPin').value;
        const pass = document.getElementById('portalPassword').value;
        this.login(pin, pass);
      });
    }
  }
}

window.pzPortal = new PowerZonePortalController();

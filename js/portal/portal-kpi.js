/**
 * POWERZONE : GYM & SPORTS STORE
 * Store Owner Portal KPI Computation & Metric Card Updaters (portal.html)
 */

window.PowerZonePortalKPI = {
  renderKPIs: function(orders = [], leads = [], passes = [], bookings = []) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.price || ord.totalAmount) || 0), 0);
    const pendingOrders = orders.filter(ord => (ord.status || '').toLowerCase() === 'pending').length;
    const totalGymLeads = leads.length + passes.length + bookings.length;

    // Update KPI Card numbers
    const revEl = document.getElementById('kpiRevenue');
    const ordEl = document.getElementById('kpiOrders');
    const pendEl = document.getElementById('kpiPending');
    const leadEl = document.getElementById('kpiLeads');

    if (revEl) revEl.textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    if (ordEl) ordEl.textContent = totalOrders;
    if (pendEl) pendEl.textContent = pendingOrders;
    if (leadEl) leadEl.textContent = totalGymLeads;

    // Update Tab Badge Counts
    const countOrders = document.getElementById('countOrders');
    const countPasses = document.getElementById('countPasses');
    const countTrials = document.getElementById('countTrials');
    const countStock = document.getElementById('countStock');

    if (countOrders) countOrders.textContent = orders.length;
    if (countPasses) countPasses.textContent = passes.length + leads.filter(l => (l.goal || '').includes('Pass')).length;
    if (countTrials) countTrials.textContent = bookings.length + leads.filter(l => !(l.goal || '').includes('Pass')).length;
    if (countStock && typeof POWERZONE_PRODUCTS !== 'undefined') countStock.textContent = POWERZONE_PRODUCTS.length;

    return { totalOrders, totalRevenue, pendingOrders, totalGymLeads };
  }
};

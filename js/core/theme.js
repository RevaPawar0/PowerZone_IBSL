/**
 * POWERZONE : GYM & SPORTS STORE
 * Theme Controller, Global Toast Notifications & Header Navigation Interactions
 */

// --- Global Toast Notification Manager ---
window.showToast = function(title, message, type = 'crimson') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconSvg = type === 'success' 
    ? '✓' 
    : (type === 'crimson' ? '⚡' : '🔥');

  toast.innerHTML = `
    <div class="toast-icon" style="color: ${type === 'success' ? 'var(--accent-green)' : 'var(--primary)'}; font-weight: 900;">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// --- Theme Controller (Dark / Light Mode) ---
function initThemeController() {
  const savedTheme = localStorage.getItem('powerzone_theme') || 'dark';
  applyTheme(savedTheme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      if (window.showToast) {
        window.showToast('Theme Changed', `Switched to ${newTheme === 'dark' ? 'Dark Carbon' : 'Porcelain Light'} mode.`, 'crimson');
      }
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('powerzone_theme', theme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const textEl = btn.querySelector('.theme-text');
    const iconEl = btn.querySelector('.theme-icon-indicator');
    if (theme === 'light') {
      if (textEl) textEl.textContent = 'Light';
      if (iconEl) iconEl.innerHTML = '☀️';
    } else {
      if (textEl) textEl.textContent = 'Dark';
      if (iconEl) iconEl.innerHTML = '🌙';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme Switcher
  initThemeController();

  // --- Header Scroll Effect ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // --- Mobile Navigation Drawer ---
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-drawer .nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // --- Newsletter Form Submission ---
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value.trim()) {
        window.showToast('Subscribed!', `PowerZone Shirdi updates sent to ${input.value.trim()}`, 'success');
        input.value = '';
      }
    });
  });
});

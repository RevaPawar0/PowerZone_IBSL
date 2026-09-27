/**
 * POWERZONE : GYM & SPORTS STORE
 * Classes Category Filtering Logic (classes.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  initClassFilter();
});

function initClassFilter() {
  const classFilterBtns = document.querySelectorAll('.class-filter-btn');
  const classCards = document.querySelectorAll('.class-card-item');

  classFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      classFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      classCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

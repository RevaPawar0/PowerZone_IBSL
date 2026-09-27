/**
 * POWERZONE : GYM & SPORTS STORE
 * Schedule Tabs & FAQs Accordion Controller (classes.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
});

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ============================================
  SISTEMA DE ABAS + ANIMAÇÕES (Estático)
============================================ */

// 1. SISTEMA DE ABAS
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length > 0) {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      
      // Remove active de todos
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Ativa o clicado
      btn.classList.add('active');
      const target = document.getElementById(`tab-${targetId}`);
      if (target) target.classList.add('active');
    });
  });

  // Navegação por teclado (← →)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const active = document.querySelector('.tab-btn.active');
      const all = Array.from(tabButtons);
      const idx = all.indexOf(active);
      
      if (e.key === 'ArrowLeft' && idx > 0) all[idx - 1].click();
      if (e.key === 'ArrowRight' && idx < all.length - 1) all[idx + 1].click();
    }
  });
}

// 2. ANIMAÇÃO DOS CARDS (Index)
const cards = document.querySelectorAll('.menu-card');
if (cards.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    observer.observe(card);
  });
}
/* ============================================
   STUDYHUB — SCRIPT PRINCIPAL
   ============================================ */

/* ─── 1. BARRA DE PROGRESSO DE LEITURA ──────────────────────── */
(function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);
  
    const update = () => {
      const scrolled = window.scrollY;
      const total    = document.body.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };
  
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();
  
  
  /* ─── 2. BOTÃO FLUTUANTE SCROLL-TO-TOP ──────────────────────── */
  (function initFabTop() {
    const fab = document.createElement('button');
    fab.className = 'fab-top';
    fab.innerHTML = '↑';
    fab.setAttribute('aria-label', 'Voltar ao topo');
    document.body.appendChild(fab);
  
    window.addEventListener('scroll', () => {
      fab.classList.toggle('visible', window.scrollY > 350);
    }, { passive: true });
  
    fab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
  
  
  /* ─── 3. TOAST NOTIFICATION ──────────────────────────────────── */
  function showToast(msg, icon = '✓') {
    // Remove toast anterior se existir
    document.querySelectorAll('.toast').forEach(t => t.remove());
  
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color: var(--success); font-weight: 700;">${icon}</span> ${msg}`;
    document.body.appendChild(toast);
  
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
  
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2200);
  }
  
  
  /* ─── 4. SISTEMA DE ABAS ─────────────────────────────────────── */
  const tabButtons  = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (tabButtons.length > 0) {
    const tabsNav = document.querySelector('.tabs-nav');
  
    // ── Cria o indicador deslizante
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    tabsNav.prepend(indicator);
  
    // ── Posiciona o indicador sobre o botão ativo
    function moveIndicator(btn) {
      if (!btn) return;
      const navRect = tabsNav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      indicator.style.width  = btnRect.width + 'px';
      indicator.style.left   = (btnRect.left - navRect.left + tabsNav.scrollLeft) + 'px';
    }
  
    // ── Adiciona dot de "visitado" dentro de cada botão
    tabButtons.forEach(btn => {
      const dot = document.createElement('span');
      dot.className = 'visited-dot';
      btn.appendChild(dot);
    });
  
    // ── Restaura última aba visitada (sessionStorage)
    const pageKey     = 'activeTab_' + window.location.pathname;
    const savedTab    = sessionStorage.getItem(pageKey);
    const defaultBtn  = savedTab
      ? (document.querySelector(`[data-tab="${savedTab}"]`) || tabButtons[0])
      : tabButtons[0];
  
    // ── Carrega abas visitadas
    const visitedKey  = 'visitedTabs_' + window.location.pathname;
    let visitedTabs   = JSON.parse(sessionStorage.getItem(visitedKey) || '[]');
  
    function applyVisitedStyles() {
      tabButtons.forEach(btn => {
        if (visitedTabs.includes(btn.dataset.tab)) {
          btn.classList.add('visited');
        }
      });
    }
  
    function activateTab(btn) {
      const targetId = btn.dataset.tab;
  
      // Remove active de todos
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
  
      // Ativa o clicado
      btn.classList.add('active');
      const target = document.getElementById(`tab-${targetId}`);
      if (target) target.classList.add('active');
  
      // Move indicador (após layout estabilizar)
      requestAnimationFrame(() => moveIndicator(btn));
  
      // Garante que o botão fique visível na barra de abas
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  
      // Salva estado
      sessionStorage.setItem(pageKey, targetId);
  
      // Marca como visitado
      if (!visitedTabs.includes(targetId)) {
        visitedTabs.push(targetId);
        sessionStorage.setItem(visitedKey, JSON.stringify(visitedTabs));
      }
      applyVisitedStyles();
    }
  
    // ── Event listeners nos botões
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn));
    });
  
    // ── Navegação por teclado ← →
    document.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Só navega se não estiver em um input/textarea
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        const all = Array.from(tabButtons);
        const idx = all.indexOf(document.querySelector('.tab-btn.active'));
        if (e.key === 'ArrowLeft'  && idx > 0)            all[idx - 1].click();
        if (e.key === 'ArrowRight' && idx < all.length - 1) all[idx + 1].click();
      }
    });
  
    // ── Inicialização: ativa aba padrão
    activateTab(defaultBtn);
    applyVisitedStyles();
  
    // ── Reposiciona indicador ao redimensionar
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        moveIndicator(document.querySelector('.tab-btn.active'));
      }, 100);
    });
  }
  
  
  /* ─── 5. FÓRMULAS — CLIQUE PARA COPIAR ──────────────────────── */
  document.querySelectorAll('.formula-box').forEach(box => {
    box.setAttribute('title', 'Clique para copiar');
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');
  
    // Adiciona ícone de copiar
    const hint = document.createElement('span');
    hint.className = 'formula-copy-hint';
    hint.textContent = '⎘ copiar';
    box.appendChild(hint);
  
    const doCopy = () => {
      // Pega o texto sem o hint
      const text = box.textContent.replace('⎘ copiar', '').trim();
      navigator.clipboard.writeText(text)
        .then(() => showToast('Fórmula copiada!'))
        .catch(() => showToast('Não foi possível copiar', '✗'));
    };
  
    box.addEventListener('click', doCopy);
    box.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') doCopy();
    });
  });
  
  
  /* ─── 6. ANIMAÇÃO DOS CARDS (Index) ─────────────────────────── */
  const cards = document.querySelectorAll('.menu-card');
  if (cards.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'translateY(0)';
          }, i * 90);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  
    cards.forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      observer.observe(card);
    });
  }
  
  
  /* ─── 7. BUSCA / FILTRO DE MATÉRIAS (Index) ─────────────────── */
  const searchInput = document.querySelector('.search-input');
  const noResults   = document.querySelector('.no-results');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      let visible = 0;
  
      document.querySelectorAll('.menu-card').forEach(card => {
        const match = card.textContent.toLowerCase().includes(q);
        card.style.display = match ? 'flex' : 'none';
        if (match) visible++;
      });
  
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  
    // Atalho: / para focar na busca
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
/* ─── 1. BARRA DE PROGRESSO DE LEITURA ──────────────────────── */
(function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    const update = () => {
        const scrolled = window.scrollY;
        const total = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ─── 2. BOTÃO FLUTUANTE SCROLL-TO-TOP ──────────────────────── */
(function initFabTop(){
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
function showToast(msg, icon = '✓'){
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color: #2ecc71; font-weight: 700;">${icon}</span> ${msg}`;
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

    // Cria o indicador deslizante
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    tabsNav.prepend(indicator);

    // Posiciona o indicador sobre o botão ativo
    function moveIndicator(btn) {
        if (!btn) return;
        const navRect = tabsNav.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        indicator.style.width = btnRect.width + 'px';
        indicator.style.left  = (btnRect.left - navRect.left + tabsNav.scrollLeft) + 'px';
    }

    // Restaura última aba visitada (sessionStorage)
    const pageKey    = 'activeTab_' + window.location.pathname;
    const savedTab   = sessionStorage.getItem(pageKey);
    const defaultBtn = savedTab
        ? (document.querySelector(`[data-tab="${savedTab}"]`) || tabButtons[0])
        : tabButtons[0];

    function activateTab(btn) {
        const targetId = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const target = document.getElementById(`tab-${targetId}`);
        if (target) target.classList.add('active');

        requestAnimationFrame(() => moveIndicator(btn));

        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });

        sessionStorage.setItem(pageKey, targetId);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn));
    });

    // Navegação por teclado ← →
    document.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        const all = Array.from(tabButtons);
        const idx = all.indexOf(document.querySelector('.tab-btn.active'));
        if (e.key === 'ArrowLeft'  && idx > 0)             all[idx - 1].click();
        if (e.key === 'ArrowRight' && idx < all.length - 1) all[idx + 1].click();
        }
    });

    activateTab(defaultBtn);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
        moveIndicator(document.querySelector('.tab-btn.active'));
        }, 100);
    });
}

/* ─── 5. FÓRMULAS — CLIQUE PARA COPIAR ──────────────────────── */
document.querySelectorAll('.formula-box').forEach(box =>{
    box.setAttribute('title', 'Clique para copiar');
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');

    const hint = document.createElement('span');
    hint.className = 'formula-copy-hint';
    hint.textContent = '⎘ copiar';
    box.appendChild(hint);

    const doCopy = () => {
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
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
            }, i * 90);
            observer.unobserve(entry.target);
        }
        });
    }, { threshold: 0.08 });

    cards.forEach(card => {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(28px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(card);
    });
}

/* ─── 7. BUSCA / FILTRO DE MATÉRIAS (Index) ─────────────────── */
const searchInput   = document.querySelector('.search-input');
const noResults     = document.querySelector('.no-results');
const noResultsTerm = document.getElementById('no-results-term');
const searchCards = document.querySelectorAll('.menu-card');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();

        let visible = 0;

        searchCards.forEach((card, index) => {
        const text = card.textContent.toLowerCase();
        const match = text.includes(q);


        if (!match) {
            card.style.display = 'none'; // FORÇA esconder
        } else {
            card.style.display = 'block'; // FORÇA mostrar
            visible++;
        }
        });

        if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
        }

        if (noResultsTerm) {
        noResultsTerm.textContent = searchInput.value;
        }
    });
}

const ACCESS = {
    user: atob("R3LDqW1pbyBGQlBB"),
    pass: atob("MTkwMw==")
};
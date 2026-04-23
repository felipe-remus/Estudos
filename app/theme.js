// ─── TEMA STUDYHUB ────────────────────────────────────────────
// Mantém a identidade visual do site original

export const colors = {
    // Backgrounds
    bg:          '#0d0d1c',
    surface:     '#13132b',
    surfaceHigh: '#1a1a35',
    overlay:     'rgba(22, 22, 39, 0.92)',

    // Borders
    border:      '#242444',
    borderLight: '#383868',

    // Accent
    accent:      '#e94560',
    accentHover: '#ff6b81',
    accentBlue:  '#0f3460',

    // Text
    text:        '#edf0ff',
    textMuted:   '#9090b0',
    textDim:     '#5c5c78',

    // Status
    success:     '#2ecc71',
    warning:     '#f39c12',
    error:       '#e94560',
};

// Cores dos cards (matérias)
export const cardColors = {
    vermelho:      '#e94560',
    azul:          '#4f8ef7',
    verde:         '#2ecc71',
    roxo:          '#a855f7',
    laranja:       '#f97316',
    'verde-azulado': '#14b8a6',
    rosa:          '#ec4899',
    ciano:         '#06b6d4',
    amarelo:       '#eab308',
    indigo:        '#6366f1',
};

export const spacing = {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
};

export const radius = {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    full: 999,
};

export const typography = {
    // Tamanhos
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    xxl:  30,
    hero: 38,

    // Pesos
    light:      '300',
    regular:    '400',
    medium:     '500',
    semibold:   '600',
    bold:       '700',
    extrabold:  '800',
    black:      '900',
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        },
    accent: {
        shadowColor: '#e94560',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
};
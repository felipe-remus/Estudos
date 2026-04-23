// ─── BANCO DE DADOS LOCAL (SQLite) ────────────────────────────
// Funciona 100% offline. Cada usuário tem seus próprios conteúdos.

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('studyhub.db');

// ─── Wrapper: converte callbacks em Promises ──────────────────
function execSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
        tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => { reject(error); return false; }
        );
        });
    });
}

// ─── INICIALIZAÇÃO DAS TABELAS ────────────────────────────────
export async function initDatabase() {
    // Tabela de usuários
    await execSQL(`
        CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        created_at TEXT    DEFAULT (datetime('now'))
        )
    `);

    // Tabela de matérias
    await execSQL(`
        CREATE TABLE IF NOT EXISTS subjects (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        title       TEXT    NOT NULL,
        description TEXT    DEFAULT '',
        color       TEXT    DEFAULT 'vermelho',
        icon        TEXT    DEFAULT '📖',
        created_at  TEXT    DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Tabela de abas dentro de cada matéria
    await execSQL(`
        CREATE TABLE IF NOT EXISTS tabs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id  INTEGER NOT NULL,
        title       TEXT    NOT NULL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
    `);

    // Tabela de blocos de conteúdo dentro de cada aba
    await execSQL(`
        CREATE TABLE IF NOT EXISTS content_blocks (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        tab_id       INTEGER NOT NULL,
        type         TEXT    NOT NULL,
        content_json TEXT    NOT NULL,
        order_index  INTEGER DEFAULT 0,
        FOREIGN KEY (tab_id) REFERENCES tabs(id)
        )
    `);
}

// ─── USUÁRIOS ─────────────────────────────────────────────────

export async function createUser(name, email, password) {
    // Verifica se já existe
    const existing = await execSQL(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
        throw new Error('Este e-mail já está cadastrado.');
    }

    // Hash simples (app local, sem servidor)
    const hashed = simpleHash(password);

    const result = await execSQL(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashed]
    );

    // Semeia conteúdo de exemplo para o novo usuário
    await seedExampleContent(result.insertId);

    return { id: result.insertId, name: name.trim(), email: email.toLowerCase().trim() };
}

export async function loginUser(email, password) {
    const hashed = simpleHash(password);
    const result = await execSQL(
        'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
        [email.toLowerCase().trim(), hashed]
    );
    if (result.rows.length === 0) {
        throw new Error('E-mail ou senha incorretos.');
    }
    return result.rows.item(0);
}

// ─── MATÉRIAS ─────────────────────────────────────────────────

export async function getSubjects(userId) {
    const result = await execSQL(
        'SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
    );
    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
        items.push(result.rows.item(i));
    }
    return items;
    }

    export async function createSubject(userId, title, description, color, icon) {
    const result = await execSQL(
        'INSERT INTO subjects (user_id, title, description, color, icon) VALUES (?, ?, ?, ?, ?)',
        [userId, title, description, color, icon]
    );
    return result.insertId;
}

// ─── ABAS ─────────────────────────────────────────────────────

export async function getTabsForSubject(subjectId) {
    const result = await execSQL(
        'SELECT * FROM tabs WHERE subject_id = ? ORDER BY order_index ASC',
        [subjectId]
    );
    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
        items.push(result.rows.item(i));
    }
    return items;
}

// ─── CONTEÚDO ─────────────────────────────────────────────────

export async function getContentForTab(tabId) {
    const result = await execSQL(
        'SELECT * FROM content_blocks WHERE tab_id = ? ORDER BY order_index ASC',
        [tabId]
    );
    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
        const block = result.rows.item(i);
        items.push({
        ...block,
        content: JSON.parse(block.content_json),
        });
    }
  return items;
}

// ─── SEED: CONTEÚDO DE EXEMPLO ────────────────────────────────
// Popula Matemática e História para novos usuários

async function seedExampleContent(userId) {
    // ── MATEMÁTICA ──────────────────────────────────────────────
    const matId = await createSubject(
        userId,
        'Matemática',
        'Operações fundamentais: soma, subtração, multiplicação, divisão, frações e potenciação.',
        'vermelho',
        '🔢'
    );

    const matTabs = [
        { title: 'Adição e Subtração', order: 0 },
        { title: 'Multiplicação e Divisão', order: 1 },
        { title: 'Frações', order: 2 },
    ];

    for (const tab of matTabs) {
        const tResult = await execSQL(
        'INSERT INTO tabs (subject_id, title, order_index) VALUES (?, ?, ?)',
        [matId, tab.title, tab.order]
        );
        const tabId = tResult.insertId;
        await seedMatBlocks(tabId, tab.order);
    }

    // ── HISTÓRIA ────────────────────────────────────────────────
    const histId = await createSubject(
        userId,
        'História',
        'Civilizações, revoluções e os grandes movimentos que moldaram o mundo.',
        'amarelo',
        '🏛️'
    );

    const histTabs = [
        { title: 'Revolução Francesa', order: 0 },
        { title: 'Iluminismo', order: 1 },
        { title: 'Rev. Industrial', order: 2 },
    ];

    for (const tab of histTabs) {
        const tResult = await execSQL(
        'INSERT INTO tabs (subject_id, title, order_index) VALUES (?, ?, ?)',
        [histId, tab.title, tab.order]
        );
        const tabId = tResult.insertId;
        await seedHistBlocks(tabId, tab.order);
    }
    }

async function insertBlock(tabId, type, content, order) {
    await execSQL(
        'INSERT INTO content_blocks (tab_id, type, content_json, order_index) VALUES (?, ?, ?, ?)',
        [tabId, type, JSON.stringify(content), order]
    );
}

async function seedMatBlocks(tabId, tabIndex) {
    if (tabIndex === 0) {
        // Adição e Subtração
        await insertBlock(tabId, 'heading', { text: 'Adição e Subtração', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'A adição e a subtração são as operações aritméticas mais básicas. A adição une quantidades; a subtração encontra a diferença entre elas.' }, 1);
        await insertBlock(tabId, 'formula_box', { formula: 'Adição: a + b = b + a  (comutativa)' }, 2);
        await insertBlock(tabId, 'formula_box', { formula: 'Subtração: a - b ≠ b - a  (não comutativa)' }, 3);
        await insertBlock(tabId, 'concept_box', { label: 'Propriedade Associativa', text: 'Na adição, a ordem de agrupamento não altera o resultado: (a + b) + c = a + (b + c)' }, 4);
        await insertBlock(tabId, 'heading', { text: 'Exemplos Práticos', level: 3 }, 5);
        await insertBlock(tabId, 'formula_box', { formula: '247 + 158 = 405' }, 6);
        await insertBlock(tabId, 'formula_box', { formula: '500 - 237 = 263' }, 7);
        await insertBlock(tabId, 'info_box', { text: '💡 Dica: Para verificar uma subtração, some o resultado com o subtraendo. O resultado deve ser igual ao minuendo.' }, 8);
    } else if (tabIndex === 1) {
        // Multiplicação e Divisão
        await insertBlock(tabId, 'heading', { text: 'Multiplicação e Divisão', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'A multiplicação é uma adição repetida. A divisão é o processo inverso — divide uma quantidade em partes iguais.' }, 1);
        await insertBlock(tabId, 'formula_box', { formula: 'a × b = b × a  (comutativa)' }, 2);
        await insertBlock(tabId, 'formula_box', { formula: 'a ÷ b ≠ b ÷ a  (não comutativa)' }, 3);
        await insertBlock(tabId, 'concept_box', { label: 'Elemento Neutro', text: 'O 1 é o elemento neutro da multiplicação: a × 1 = a. O 0 é o elemento neutro da adição: a + 0 = a.' }, 4);
        await insertBlock(tabId, 'heading', { text: 'Tabuada — Dicas', level: 3 }, 5);
        await insertBlock(tabId, 'formula_box', { formula: 'Tabuada do 9: o algarismo das dezenas sobe de 0 a 9, e o das unidades desce de 9 a 0.' }, 6);
        await insertBlock(tabId, 'formula_box', { formula: 'Para × 11: duplique os dígitos. Ex: 11 × 23 = 253' }, 7);
        await insertBlock(tabId, 'info_box', { text: '💡 Prova dos Nove: Some os algarismos de um número até obter um só dígito para verificar multiplicações.' }, 8);
    } else {
        // Frações
        await insertBlock(tabId, 'heading', { text: 'Frações', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'Uma fração representa uma ou mais partes de um todo. É escrita como numerador/denominador, onde o denominador indica em quantas partes o todo foi dividido, e o numerador quantas partes foram tomadas.' }, 1);
        await insertBlock(tabId, 'concept_box', { label: 'Terminologia', text: 'Numerador (cima) → quantas partes temos\nDenominador (baixo) → em quantas partes o todo está dividido' }, 2);
        await insertBlock(tabId, 'heading', { text: 'Operações com Frações', level: 3 }, 3);
        await insertBlock(tabId, 'formula_box', { formula: 'Mesmos denominadores: a/c + b/c = (a+b)/c' }, 4);
        await insertBlock(tabId, 'formula_box', { formula: 'Denominadores diferentes: a/b + c/d = (ad + bc) / bd' }, 5);
        await insertBlock(tabId, 'formula_box', { formula: 'Multiplicação: a/b × c/d = ac/bd' }, 6);
        await insertBlock(tabId, 'formula_box', { formula: 'Divisão: a/b ÷ c/d = a/b × d/c = ad/bc' }, 7);
        await insertBlock(tabId, 'warning_box', { title: '⚠️ Atenção', text: 'Nunca some ou subtraia frações com denominadores diferentes sem antes encontrar o MMC (Mínimo Múltiplo Comum).' }, 8);
    }
}

async function seedHistBlocks(tabId, tabIndex) {
    if (tabIndex === 0) {
        // Revolução Francesa
        await insertBlock(tabId, 'heading', { text: 'Revolução Francesa (1789–1799)', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'A Revolução Francesa foi um período de intensa transformação política e social que derrubou a monarquia absoluta na França. Seus princípios — liberdade, igualdade e fraternidade — influenciaram movimentos em todo o mundo por séculos.' }, 1);
        await insertBlock(tabId, 'concept_box', { label: 'Ideia Central', text: 'A Revolução representou a ruptura com o Antigo Regime, baseado na divisão da sociedade em três estamentos: clero, nobreza e o Terceiro Estado (97% da população).' }, 2);
        await insertBlock(tabId, 'heading', { text: 'Fases da Revolução', level: 3 }, 3);
        await insertBlock(tabId, 'timeline_item', { date: '1789', title: 'Queda da Bastilha', desc: 'Em 14 de julho, populares tomam a fortaleza da Bastilha. A Declaração dos Direitos do Homem é promulgada em agosto.' }, 4);
        await insertBlock(tabId, 'timeline_item', { date: '1791–1792', title: 'Monarquia Constitucional', desc: 'Luís XVI aceita uma constituição. A tensão com outras monarquias europeias aumenta.' }, 5);
        await insertBlock(tabId, 'timeline_item', { date: '1793–1794', title: 'O Terror (La Terreur)', desc: 'Fase radical liderada por Robespierre. Luís XVI e Maria Antonieta são guilhotinados. Milhares são executados.' }, 6);
        await insertBlock(tabId, 'timeline_item', { date: '1795–1799', title: 'Ascensão de Napoleão', desc: 'Em 1799, Napoleão dá o golpe do 18 Brumário, encerrando a Revolução e iniciando o Consulado.' }, 7);
        await insertBlock(tabId, 'quote_box', { quote: 'O homem nasce livre, e por toda a parte se encontra acorrentado.', cite: '— Jean-Jacques Rousseau, O Contrato Social (1762)' }, 8);
    } else if (tabIndex === 1) {
        // Iluminismo
        await insertBlock(tabId, 'heading', { text: 'O Iluminismo (séc. XVII–XVIII)', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'O Iluminismo foi um movimento intelectual que dominou a Europa entre os séculos XVII e XVIII. Seus pensadores acreditavam que a razão humana era a principal ferramenta para compreender o mundo e construir uma sociedade mais justa.' }, 1);
        await insertBlock(tabId, 'concept_box', { label: 'Ideia Central', text: 'Contra a autoridade da Igreja e a tradição cega, o Iluminismo propõe que o conhecimento racional e científico deve guiar a vida individual e a organização da sociedade.' }, 2);
        await insertBlock(tabId, 'heading', { text: 'Principais Pensadores', level: 3 }, 3);
        await insertBlock(tabId, 'definition', { term: 'Voltaire', text: 'Crítico feroz da intolerância religiosa. Defendia a liberdade de expressão e a separação entre Igreja e Estado.' }, 4);
        await insertBlock(tabId, 'definition', { term: 'Montesquieu', text: 'Formulou a teoria da separação dos poderes (executivo, legislativo e judiciário) em "O Espírito das Leis" (1748).' }, 5);
        await insertBlock(tabId, 'definition', { term: 'Rousseau', text: 'Defendia o contrato social: a ideia de que o governo legítimo nasce da vontade geral do povo.' }, 6);
        await insertBlock(tabId, 'definition', { term: 'Locke', text: 'Defensor dos direitos naturais à vida, liberdade e propriedade. O governo existe para protegê-los e pode ser derrubado se falhar.' }, 7);
        await insertBlock(tabId, 'quote_box', { quote: 'Ousa saber! Tem a coragem de usar tua própria razão.', cite: '— Immanuel Kant, "O que é o Iluminismo?" (1784)' }, 8);
    } else {
        // Revolução Industrial
        await insertBlock(tabId, 'heading', { text: 'Revolução Industrial (séc. XVIII–XIX)', level: 2 }, 0);
        await insertBlock(tabId, 'paragraph', { text: 'A Revolução Industrial foi o processo de transformação do modo de produção — do trabalho manual para a produção mecanizada em larga escala. Iniciada na Inglaterra, transformou radicalmente a economia e as relações de trabalho no mundo inteiro.' }, 1);
        await insertBlock(tabId, 'heading', { text: 'Principais Invenções', level: 3 }, 2);
        await insertBlock(tabId, 'list', { items: ['Máquina a vapor (James Watt, 1769) — motor da industrialização', 'Tear mecânico — transformou a produção têxtil artesanal', 'Locomotiva a vapor — criou redes ferroviárias interligando mercados', 'Alto-forno — permitiu a produção em massa de aço e ferro'] }, 3);
        await insertBlock(tabId, 'concept_box', { label: 'Surgimento do Proletariado', text: 'A Revolução criou uma nova classe social: os operários, que trabalhavam 14 a 16 horas por dia em condições precárias e habitavam cortiços nas cidades em rápido crescimento.' }, 4);
        await insertBlock(tabId, 'warning_box', { title: '⚠️ Condições de trabalho', text: 'Crianças a partir dos 5 anos trabalhavam em minas e fábricas. Somente no final do século XIX leis trabalhistas começaram a regulamentar jornadas.' }, 5);
        await insertBlock(tabId, 'quote_box', { quote: 'A história de toda a sociedade existente até hoje é a história da luta de classes.', cite: '— Marx & Engels, Manifesto do Partido Comunista (1848)' }, 6);
    }
}

// ─── HASH SIMPLES ────────────────────────────────────────────
// Nota: para app local/offline, isso é suficiente.
// Em apps com servidor, use bcrypt ou Argon2.
function simpleHash(str) {
    let hash = 0;
    const salt = 'studyhub_salt_2024';
    const input = str + salt;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // converte para 32-bit
    }
    return hash.toString(16);
}

export default db;
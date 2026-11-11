import type { ProvaInput } from '../../scenario/schema'

const r = String.raw
type C = number | string
type P3 = [C, C, C]

/** Fio em poligonal: um trecho reto por par de pontos, com a corrente indo do primeiro ao último. */
function poligonal(pre: string, I: string, pts: P3[]) {
  return pts.slice(1).map((b, k) => ({ id: `${pre}${k}`, tipo: 'fio' as const, I, a: pts[k], b }))
}

/** Arco de raio R no plano dos versores eu e ev, de `ini` a `ini + ab` graus, em n trechos. */
function arco(pre: string, I: string, R: string, c: P3, eu: number[], ev: number[], ini: number, ab: number, n = 24) {
  const ponto = (k: number): P3 => {
    const g = ((ini + (k * ab) / n) * Math.PI) / 180
    return [0, 1, 2].map((i) => {
      const f = Math.cos(g) * eu[i] + Math.sin(g) * ev[i]
      return Math.abs(f) < 1e-12 ? c[i] : `${c[i]} + (${R})*(${f})`
    }) as P3
  }
  return Array.from({ length: n }, (_, k) => ({ id: `${pre}${k}`, tipo: 'fio' as const, I, a: ponto(k), b: ponto(k + 1) }))
}

/** Soma de uma expressão sobre os trechos `pre0`…`pre(n−1)`. */
const soma = (pre: string, n: number, f: (id: string) => string) => `(${Array.from({ length: n }, (_, k) => f(`${pre}${k}`)).join(' + ')})`

/** Período de cíclotron do próton, para as medidas que esperam o rastro fechar meia volta. */
const TP = '2*pi*mp/(qe*B0)'
/** Unidade de massa atômica e massas da alfa e do nêutron (kg). */
const U = '1.66054e-27'
const MALFA = '6.6447e-27'
const MNEU = '1.6749e-27'

/* Exercício 7: os quatro fios, desenhados como na figura (m), cada um no seu quadro. */
const FIOS7: { nome: string; o: [number, number]; pts: [number, number][]; dx: number }[] = [
  { nome: 'I', o: [-4.6, 0.5], pts: [[0, 0.2], [0.7, 0.55], [1.0, 0.6], [1.4, 0.6], [2.0, 0.75], [2.5, 1.05], [2.8, 1.5], [2.95, 2.0]], dx: 2.95 },
  { nome: 'II', o: [0.6, 0.5], pts: [[0, 0.4], [3.5, 1.9]], dx: 3.5 },
  { nome: 'III', o: [-4.6, -2.7], pts: [[0, 0.4], [1.05, 0.4], [1.05, 0.75], [2.1, 0.75], [2.1, 0.1], [4.0, 0.1]], dx: 4.0 },
  {
    nome: 'IV',
    o: [0.6, -2.7],
    pts: [[0.15, 0.3], [0.7, 0.85], [1.4, 1.3], [2.1, 1.55], [2.6, 1.6], [3.5, 1.4], [3.95, 1.1], [3.85, 0.8], [3.5, 0.75], [2.8, 0.85], [2.1, 0.95]],
    dx: 1.95,
  },
]
const pre7 = (k: number) => `f${k}_`
const F7 = (k: number) => `abs(${soma(pre7(k), FIOS7[k].pts.length - 1, (id) => `z(forca('${id}', 'Bu'))`)})`

/* Exercício 8: força total no trecho (retos + semicírculo). */
const F8arco = soma('c', 24, (id) => `forca('${id}', 'Bu')`)
const F8 = `(forca('s1', 'Bu') + forca('s2', 'Bu') + ${F8arco})`

/* Exercício 10: torque em relação à origem, somando r × F nos quatro lados. */
const CT = 'a*cos(rad(th))'
const ST = 'a*sin(rad(th))'
const T10 = `(cross(vec(0, 0, b/2), forca('l0', 'Bu')) + cross(vec(${CT}/2, ${ST}/2, 0), forca('l1', 'Bu')) + cross(vec(${CT}, ${ST}, b/2), forca('l2', 'Bu')) + cross(vec(${CT}/2, ${ST}/2, b), forca('l3', 'Bu')))`

/* Exercício 11: força vertical no anel, trecho a trecho. */
const F11 = soma('an', 24, (id) => `y(forca('${id}', 'ima'))`)
const BRAD = "x(Bde('ima', r, 0, 0))"
const BVER = "y(Bde('ima', r, 0, 0))"

/* Exercício 13: a fita de cobre (SI). */
const VD13 = 'i0/(n*qe*w*esp)'

export const lista_06: ProvaInput = {
  id: 'lista-06',
  titulo: 'Lista 6 · Campo magnético e força magnética',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Quando a força magnética some, e o que ela faz',
      resumo: 'F = qv×B: zero com v ∥ B; sempre perpendicular a v, só muda a direção.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.309] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', camera: { pos: [3, 7, 12], alvo: [0, 0, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.06, max: 0.3, passo: 0.01 },
        { id: 'v0', rotulo: 'Velocidade do próton', simbolo: 'v', valor: 1e5, unidade: 'm/s', min: 2e4, max: 1.5e5, passo: 1e3 },
        { id: 'alfa', rotulo: 'Ângulo entre v e B', simbolo: r`\alpha`, valor: 60, unidade: '°', min: 0, max: 90, passo: 1 },
      ],
      objetos: [
        { id: 'Bx', tipo: 'campoB', valor: ['B0', 0, 0], rotulo: 'B' },
        { id: 'p', tipo: 'particula', q: 'qe', m: 'mp', pos: ['0-4*cm', 0, 0], v: ['v0*cos(rad(alfa))', 'v0*sin(rad(alfa))', 0], rotulo: 'próton' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.5*cm', rotulo: 'v' },
        { id: 'sF', tipo: 'seta', papel: 'forca', ativo: 'alfa > 0', origem: "pos('p')", vetor: "cross(vel('p'), B('p'))", comprimento: '1.5*cm', rotulo: 'F' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Força magnética', simbolo: r`F = qvB\sin\alpha`, expr: "1e15*qe*mag(cross(vel('p'), B('p')))", unidade: 'fN', teoria: '1e15*qe*v0*B0*sin(rad(alfa))' },
        { rotulo: 'Rapidez do próton', simbolo: '|v|', expr: "1e-3*mag(vel('p'))", unidade: 'km/s', teoria: '1e-3*v0' },
        { rotulo: 'Potência da força magnética', simbolo: r`\vec F\cdot\vec v`, expr: "qe*dot(cross(vel('p'), B('p')), vel('p'))", unidade: 'W', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(a) Velocidade paralela a B',
          texto: r`$\vec F = q\vec v\times\vec B$ tem módulo $qvB\sin\alpha$. Com $\vec v \parallel \vec B$ ($\alpha = 0$), a força é **zero** e o próton segue em linha reta, mesmo dentro do campo.`,
          parametros: { alfa: 0 },
          medidas: [0],
        },
        {
          titulo: '(b) Velocidade perpendicular',
          texto: r`Com $\alpha = 90°$ a força é máxima, mas sempre **perpendicular** a $\vec v$: a potência $\vec F\cdot\vec v$ é zero, a rapidez não muda e a trajetória vira um círculo. A força magnética só curva o movimento.`,
          parametros: { alfa: 90 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Caso geral',
          texto: r`Num ângulo qualquer, a parte de $\vec v$ ao longo de $\vec B$ não sente nada e a parte perpendicular gira: o resultado é uma hélice, ainda com rapidez constante. Na Mecânica, fazem o mesmo papel as forças que agem como **resultante centrípeta**: a tração no pêndulo cônico, a normal num looping, a gravidade numa órbita circular.`,
          parametros: { alfa: 60 },
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`Sim: quando $\vec v$ é paralela (ou antiparalela) a $\vec B$, $\vec v\times\vec B = 0$.` },
        { item: '(b)', texto: r`Muda a direção da velocidade, não o módulo: a força é sempre perpendicular a $\vec v$. Forças centrípetas (tração, normal, gravidade em órbita circular) fazem o mesmo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Produto vetorial', texto: r`$|\vec v\times\vec B| = vB\sin\alpha$.`, passo: 0 },
          { titulo: 'Trabalho nulo', texto: r`$\vec F\perp\vec v$, então $dW = \vec F\cdot\vec v\,dt = 0$.`, passo: 1 },
        ],
        resultado: r`(a) sim, com $\vec v\parallel\vec B$; (b) só muda a direção de $\vec v$.`,
        errosComuns: ['Achar que a força magnética acelera ou freia a partícula.'],
        oficial: { resposta: '(a) Sim, com a velocidade paralela ao campo. (b) A força só muda a direção da velocidade; qualquer resultante centrípeta se comporta assim.' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Seletor de velocidades geral',
      resumo: 'MRU exige q(E + v×B) = 0, isto é, E = −v×B, para qualquer ângulo entre v e B.',
      figura: { pagina: 1, recorte: [0.089, 0.311, 0.936, 0.391] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', camera: { pos: [8, 6, 10], alvo: [0, 0, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.06, max: 0.3, passo: 0.01 },
        { id: 'v0', rotulo: 'Velocidade do próton', simbolo: 'v', valor: 1e5, unidade: 'm/s', min: 2e4, max: 1.5e5, passo: 1e3 },
        { id: 'beta', rotulo: 'Ângulo entre v e B', simbolo: r`\beta`, valor: 90, unidade: '°', min: 10, max: 90, passo: 1 },
        { id: 'liga', rotulo: 'Campo elétrico', valor: 1, opcoes: [{ valor: 1, rotulo: 'E = −v×B' }, { valor: 0, rotulo: 'desligado' }] },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'Ey', tipo: 'campoE', valor: [0, 'liga*v0*B0*sin(rad(beta))', 0], rotulo: 'E' },
        { id: 'p', tipo: 'particula', q: 'qe', m: 'mp', pos: ['0-4*cm*sin(rad(beta))', 0, '0-4*cm*cos(rad(beta))'], v: ['v0*sin(rad(beta))', 0, 'v0*cos(rad(beta))'], rotulo: 'próton' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.5*cm', rotulo: 'v' },
      ],
      visual: { setasB: true, setasE: true },
      medidas: [
        { rotulo: 'Força resultante', simbolo: r`|q(\vec E + \vec v\times\vec B)|`, expr: "1e15*qe*mag(E('p') + cross(vel('p'), B('p')))", unidade: 'fN', teoria: '1e15*qe*v0*B0*sin(rad(beta))*(1 - liga)' },
        { rotulo: 'Campo elétrico que zera a força', simbolo: r`E = vB\sin\beta`, expr: '1e-3*v0*B0*sin(rad(beta))', unidade: 'kV/m' },
        { rotulo: 'Rapidez do próton', simbolo: '|v|', expr: "1e-3*mag(vel('p'))", unidade: 'km/s', teoria: '1e-3*v0' },
      ],
      passos: [
        {
          titulo: 'Força nula',
          texto: r`MRU quer resultante zero: $q(\vec E + \vec v\times\vec B) = 0$, isto é,
$$\vec E = -\vec v\times\vec B.$$
Com $\vec v\perp\vec B$ é o seletor de velocidades da aula: só passa reto quem tem $v = E/B$.`,
          parametros: { beta: 90, liga: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Ângulo qualquer',
          texto: r`Nada na conta pediu $\vec v\perp\vec B$: a parte de $\vec v$ ao longo de $\vec B$ não entra em $\vec v\times\vec B$. Incline $\vec v$: com $\vec E = -\vec v\times\vec B$ o próton segue reto do mesmo jeito.`,
          parametros: { beta: 40, liga: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Sem o campo elétrico',
          texto: r`Desligando $\vec E$, sobra $qvB\sin\beta$ e o próton espirala em volta de $\vec B$.`,
          parametros: { beta: 40, liga: 0 },
          medidas: [0, 2],
        },
      ],
      respostas: [
        { item: 'Relação', texto: r`$\vec F = q(\vec E + \vec v\times\vec B) = 0 \Rightarrow \vec E = -\vec v\times\vec B$.` },
        { item: 'Perpendicular?', texto: r`Não: a relação vale para qualquer ângulo entre $\vec v$ e $\vec B$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz e seletor de velocidades', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Resultante zero', texto: r`MRU $\Leftrightarrow$ $\vec F = 0$.`, passo: 0 },
          { titulo: 'Geral', texto: r`A componente paralela de $\vec v$ não contribui.`, passo: 1 },
        ],
        resultado: r`$\vec E = -\vec v\times\vec B$, para qualquer ângulo.`,
        errosComuns: ['Escrever $E = vB$ como se valesse sempre: no caso geral, $E = vB\\sin\\beta$.'],
        oficial: { resposta: 'F = q(E + v×B) = 0 dá E = −v×B; a velocidade não precisa ser perpendicular ao campo.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Próton, nêutron, elétron e alfa no mesmo campo',
      resumo: 'Reta: nêutron. Para baixo: elétron. Para cima, a mais curva é o próton (m/q menor que a da alfa).',
      figura: { pagina: 1, recorte: [0.089, 0.392, 0.936, 0.604] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0.5, 13], alvo: [0, 0.5, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1e-11 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético (entrando)', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.08, max: 0.3, passo: 0.01 },
        { id: 'v0', rotulo: 'Velocidade inicial', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 5e4, max: 1.2e5, passo: 1e3 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, '0-B0'], rotulo: 'B (entrando)' },
        { id: 'pp', tipo: 'particula', q: 'qe', m: 'mp', pos: ['0-2*cm', '0-1*cm', 0], v: ['v0', 0, 0], rotulo: 'próton' },
        { id: 'pa', tipo: 'particula', q: '2*qe', m: MALFA, pos: ['0-2*cm', '0-1*cm', 0], v: ['v0', 0, 0], rotulo: 'alfa' },
        { id: 'pn', tipo: 'particula', q: 0, m: MNEU, pos: ['0-2*cm', '0-1*cm', 0], v: ['v0', 0, 0], rotulo: 'nêutron' },
        { id: 'pe', tipo: 'particula', q: '0-qe', m: 'me', pos: ['0-2*cm', '0-1*cm', 0], v: ['v0', 0, 0], rotulo: 'elétron' },
      ],
      visual: { setasB: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Raio do próton, no rastro', simbolo: r`r_p = \frac{m_pv_0}{eB}`, ativo: `t > 1.2*${TP}`, expr: "100*rastroSpan('pp', 'y')/2", unidade: 'cm', teoria: '100*mp*v0/(qe*B0)' },
        { rotulo: 'Raio da alfa, no rastro', simbolo: r`r_\alpha = \frac{m_\alpha v_0}{2eB}`, ativo: `t > 1.2*${TP}`, expr: "100*rastroSpan('pa', 'y')/2", unidade: 'cm', teoria: `100*${MALFA}*v0/(2*qe*B0)` },
        { rotulo: 'Razão entre os raios (rastros)', simbolo: r`r_\alpha/r_p`, ativo: `t > 1.2*${TP}`, expr: "rastroSpan('pa', 'y')/rastroSpan('pp', 'y')", unidade: '', teoria: `${MALFA}/(2*mp)` },
        { rotulo: 'Raio do elétron', simbolo: r`r_e = \frac{m_ev_0}{eB}`, expr: '1e6*me*v0/(qe*B0)', unidade: 'μm' },
      ],
      passos: [
        {
          titulo: 'Sem carga e carga negativa',
          texto: r`O nêutron não tem carga: segue reto (**3**). Com $\vec B$ entrando e $\vec v_0$ para a direita, $\vec v\times\vec B$ aponta para cima: cargas positivas sobem, e o elétron, negativo, desce (**4**). Na escala real o raio dele é 1836 vezes menor que o do próton: o círculo some num ponto.`,
          medidas: [3],
        },
        {
          titulo: 'Próton ou alfa',
          texto: r`$r = \dfrac{mv_0}{|q|B}$. A alfa tem cerca de 4 vezes a massa e 2 vezes a carga do próton: raio **2 vezes maior**, trajetória menos curva (**2**). A mais curva das duas que sobem é o próton (**1**). Rode a simulação e compare os rastros.`,
          medidas: [0, 1, 2],
        },
      ],
      respostas: [{ item: 'Trajetórias', texto: r`1: próton; 2: alfa; 3: nêutron; 4: elétron.` }],
      resolucao: {
        conceitos: [{ texto: 'Movimento circular em campo magnético', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Sinal', texto: r`O sentido da curva dá o sinal da carga.`, passo: 0 },
          { titulo: 'Raio', texto: r`$r \propto m/|q|$: a alfa curva menos que o próton.`, passo: 1 },
        ],
        resultado: r`1 próton, 2 alfa, 3 nêutron, 4 elétron.`,
        errosComuns: ['Achar que a alfa, mais carregada, curva mais: o que conta é a razão m/q.'],
        oficial: { resposta: '1 próton, 2 alfa, 3 nêutron, 4 elétron.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Médio',
      titulo: 'Hélice de uma carga negativa',
      resumo: 'Eixo ao longo de B; R = mvₓ/qB, T = 2πm/qB, passo v_yT; gira no sentido anti-horário para quem a vê chegar.',
      figura: { pagina: 1, recorte: [0.089, 0.605, 0.936, 0.772] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [7, 3, 9], alvo: [0, -1.5, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.08, max: 0.3, passo: 0.01 },
        { id: 'vx', rotulo: 'Velocidade em x', simbolo: 'v_x', valor: 6e4, unidade: 'm/s', min: 2e4, max: 1e5, passo: 1e3 },
        { id: 'vy', rotulo: 'Velocidade em y', simbolo: 'v_y', valor: 3e4, unidade: 'm/s', min: 1e4, max: 4e4, passo: 1e3 },
      ],
      objetos: [
        { id: 'By', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'p', tipo: 'particula', q: '0-qe', m: 'mp', pos: [0, '0-4*cm', 0], v: ['vx', 'vy', 0], rotulo: 'carga −q (massa do próton)' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.5*cm', rotulo: 'v' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: "(0-qe)*cross(vel('p'), B('p'))", comprimento: '1.5*cm', rotulo: 'F' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Força magnética', simbolo: r`F = qv_xB`, expr: "1e15*qe*mag(cross(vel('p'), B('p')))", unidade: 'fN', teoria: '1e15*qe*vx*B0' },
        { rotulo: 'Raio, no rastro', simbolo: r`R = \frac{mv_x}{qB}`, ativo: `t > 1.2*${TP} && t < 0.09/vy`, expr: "1e3*rastroSpan('p', 'x')/2", unidade: 'mm', teoria: '1e3*mp*vx/(qe*B0)' },
        { rotulo: 'Período', simbolo: r`T = \frac{2\pi m}{qB}`, expr: `1e9*${TP}`, unidade: 'ns' },
        { rotulo: 'Passo (velocidade ao longo de B vezes T)', simbolo: r`p = v_yT`, expr: `100*y(vel('p'))*${TP}`, unidade: 'cm', teoria: `100*vy*${TP}` },
        {
          rotulo: 'Giro em torno de +y (+1 = anti-horário para quem está em +y)',
          simbolo: r`\operatorname{sinal}\omega_y`,
          expr: "(0-1)*y(cross(vel('p'), cross(vel('p'), B('p')))) > 0 ? 1 : 0-1",
          unidade: '',
          teoria: 1,
        },
      ],
      passos: [
        {
          titulo: '(a) Força inicial',
          texto: r`$\vec F = (-q)\,\vec v\times\vec B = -q\,(v_x\hat x + v_y\hat y)\times B\hat y = -qv_xB\,\hat z$. Só a parte de $\vec v$ perpendicular a $\vec B$ conta.`,
          medidas: [0],
        },
        {
          titulo: '(b) Hélice',
          texto: r`Ao longo de $\hat y$ não há força: $v_y$ fica constante. No plano $xz$, a força de módulo constante $qv_xB$, sempre perpendicular, faz um círculo. Círculo mais avanço uniforme: **hélice de eixo paralelo a $\vec B$** ($\hat y$).`,
          medidas: [3],
        },
        {
          titulo: '(c) Raio e período',
          texto: r`$qv_xB = \dfrac{mv_x^2}{R}$ dá $R = \dfrac{mv_x}{qB}$; o período $T = \dfrac{2\pi R}{v_x} = \dfrac{2\pi m}{qB}$ não depende da velocidade. Rode e espere meia volta para ler o raio no rastro.`,
          medidas: [1, 2],
        },
        { titulo: '(d) Passo', texto: r`Num período a partícula avança $p = v_yT = \dfrac{2\pi m v_y}{qB}$ ao longo do eixo.`, medidas: [3] },
        {
          titulo: '(e) Sentido de giro',
          texto: r`Uma carga **negativa** gira no sentido anti-horário em torno de $\vec B$ (a positiva, no horário). Como $v_y > 0$, a partícula vem na direção de quem está em $+\hat y$: essa pessoa a vê girar no sentido **anti-horário**.`,
          medidas: [4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec F = -qv_xB\,\hat z$` },
        { item: '(b)', texto: r`Hélice de eixo paralelo a $\hat y$ (a direção de $\vec B$).` },
        { item: '(c)', texto: r`$R = \dfrac{mv_x}{qB}$, $T = \dfrac{2\pi m}{qB}$` },
        { item: '(d)', texto: r`$p = v_yT = \dfrac{2\pi m v_y}{qB}$` },
        { item: '(e)', texto: 'Anti-horário.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Movimento helicoidal em campo magnético', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Decompor', texto: r`$v_y$ livre, $v_x$ gira.`, passo: 1 },
          { titulo: 'Círculo', texto: r`Força magnética como centrípeta.`, passo: 2 },
          { titulo: 'Passo', texto: r`$v_y$ vezes o período.`, passo: 3 },
        ],
        resultado: r`$\vec F_0 = -qv_xB\hat z$; $R = mv_x/qB$; $T = 2\pi m/qB$; $p = v_yT$; anti-horário.`,
        errosComuns: ['Usar a velocidade inteira no raio: só $v_x$, perpendicular a $\\vec B$, entra.', 'Esquecer o sinal negativo da carga no sentido da força.'],
        oficial: { resposta: 'F = −qvₓB ẑ; eixo da hélice ao longo de B; R = mvₓ/qB, T = 2πm/qB; passo v_yT; sentido anti-horário.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Momento magnético do elétron no átomo de Bohr',
      resumo: 'μ = eva₀/2, oposto ao momento angular; μ/L = e/2mₑ.',
      figura: { pagina: 1, recorte: [0.089, 0.773, 0.936, 0.893] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [6, -8, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'v', rotulo: 'Velocidade do elétron', simbolo: 'v', valor: 2.188e6, unidade: 'm/s', min: 5e5, max: 4e6, passo: 1e4 },
        { id: 'a0', rotulo: 'Raio de Bohr', simbolo: 'a_0', valor: 0.529e-10, unidade: 'm', min: 0.529e-10, max: 0.529e-10, passo: 1e-12 },
        { id: 'Rv', rotulo: 'Raio desenhado (escala da cena)', simbolo: r`R_\text{cena}`, valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'orb', tipo: 'espira', I: '0-qe*v/(2*pi*a0)', centro: [0, 0, 0], raio: 'Rv', normal: 'z', rotulo: 'órbita (corrente no sentido horário)' },
        { id: 'pr', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: 'próton' },
        { id: 'el', tipo: 'carga', q: '0-qe', pos: ['Rv', 0, 0], rotulo: 'elétron' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: ['Rv', 0, 0], vetor: [0, 1, 0], comprimento: '2*cm', rotulo: 'v (anti-horário)' },
        { id: 'sL', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: [0, 0, 1], comprimento: '3*cm', rotulo: 'L' },
        { id: 'sm', tipo: 'seta', papel: 'B', origem: [0, 0, 0], vetor: [0, 0, -1], comprimento: '3*cm', rotulo: 'μ' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Corrente da órbita', simbolo: r`I = \frac{ev}{2\pi a_0}`, expr: '1e3*qe*v/(2*pi*a0)', unidade: 'mA' },
        {
          rotulo: 'μ_z pela espira simulada (do campo no centro, levado ao raio real)',
          simbolo: r`\mu_z = -\frac{eva_0}{2}`,
          expr: "1e24*2*pi*Rv^3*z(Bde('orb', 0, 0, 0))/mu0*(a0/Rv)^2",
          unidade: '10⁻²⁴ A·m²',
          teoria: '1e24*(0-qe*v*a0/2)',
        },
        { rotulo: 'Momento angular orbital', simbolo: r`L = m_eva_0`, expr: '1e34*me*v*a0', unidade: '10⁻³⁴ J·s' },
        {
          rotulo: 'Razão giromagnética |μ|/L',
          simbolo: r`\frac{\mu}{L} = \frac{e}{2m_e}`,
          expr: "abs(2*pi*Rv^3*z(Bde('orb', 0, 0, 0))/mu0*(a0/Rv)^2)/(me*v*a0)",
          unidade: 'C/kg',
          teoria: 'qe/(2*me)',
        },
      ],
      passos: [
        {
          titulo: '(a) A órbita como espira',
          texto: r`O elétron passa $v/2\pi a_0$ vezes por segundo: corrente $I = \dfrac{ev}{2\pi a_0}$. O momento de dipolo é corrente vezes área:
$$\mu = I\pi a_0^2 = \frac{eva_0}{2}.$$
Como a carga é negativa, a corrente gira **ao contrário** do elétron, e $\vec\mu$ aponta **contra** o momento angular $\vec L$. A simulação lê $\mu$ do campo no centro da espira, $B = \mu_0 I/2R$.`,
          medidas: [0, 1],
        },
        {
          titulo: '(b) Razão giromagnética',
          texto: r`$L = m_e v a_0$, então
$$\frac{\mu}{L} = \frac{eva_0/2}{m_eva_0} = \frac{e}{2m_e},$$
sem depender de $v$ nem de $a_0$. Vetorialmente, $\vec\mu = -\dfrac{e}{2m_e}\vec L$. Mude $v$: a razão não sai do lugar.`,
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\mu = \dfrac{eva_0}{2}$, perpendicular ao plano da órbita e oposto ao momento angular do elétron.` },
        { item: '(b)', texto: r`$\dfrac{\mu}{L} = \dfrac{e}{2m_e}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Espira de corrente e momento de dipolo', lab: 'trechos' }],
        etapas: [
          { titulo: 'Corrente', texto: r`Carga por período.`, passo: 0 },
          { titulo: 'Dipolo', texto: r`$\mu = IA$.`, passo: 0 },
          { titulo: 'Razão', texto: r`Dividir por $L = mva_0$.`, passo: 1 },
        ],
        resultado: r`$\mu = eva_0/2$, oposto a $\vec L$; $\mu/L = e/2m_e$.`,
        errosComuns: ['Pôr o momento de dipolo no mesmo sentido do momento angular: para o elétron, eles são opostos.'],
        oficial: {
          resposta: 'μ = e v a₀/2 ẑ (com ẑ ao longo da normal definida pela corrente); μ/L = e/2m.',
          observacao: 'Mesma resposta. O gabarito orienta ẑ pela corrente; aqui ẑ segue o momento angular do elétron, e por isso μ_z sai negativo.',
        },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Espectrômetro de massa',
      resumo: 'v = √(2qV/m), m = qR²B²/2V, e R₁₂/R₁₄ = √(12/14) = √(6/7).',
      figura: { pagina: 2, recorte: [0.089, 0.062, 0.936, 0.211] },
      cena: { escala: 0.01, extensao: 20, unidade: 'cm', plano: 'xy', camera: { pos: [8, 4, 42], alvo: [8, 4, 0] }, tempo: { escala: 1e-6, unidade: 'µs', passo: 2e-10 } },
      parametros: [
        { id: 'V', rotulo: 'Tensão de aceleração', simbolo: 'V', valor: 1000, unidade: 'V', min: 300, max: 2000, passo: 10 },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.2, unidade: 'T', min: 0.15, max: 0.3, passo: 0.005 },
        { id: 'd', rotulo: 'Comprimento da aceleração', simbolo: 'd', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01, passo: 0.001 },
      ],
      objetos: [
        { id: 'Ea', tipo: 'campoE', valor: 'y >= 0-d && y < 0 && abs(x) < 0.01 ? [0, V/d, 0] : [0, 0, 0]', rotulo: 'aceleração (V)' },
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [-0.02, 0, -0.05], max: [0.2, 0.2, 0.05] }, rotulo: 'B (saindo)' },
        { id: 'c12', tipo: 'particula', q: 'qe', m: `12*${U}`, pos: [0, '0-d', 0], v: [0, 0, 0], parada: 'y < 0 && x > 0.01', rotulo: '¹²C⁺' },
        { id: 'c14', tipo: 'particula', q: 'qe', m: `14*${U}`, pos: [0, '0-d', 0], v: [0, 0, 0], parada: 'y < 0 && x > 0.01', rotulo: '¹⁴C⁺' },
        { id: 'tela', tipo: 'caminho', pontos: [[0.02, 0, 0], [0.2, 0, 0]], seta: 1, rotulo: 'anteparo' },
      ],
      visual: { setasB: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade do ¹²C⁺ no campo B', simbolo: r`v = \sqrt{\frac{2qV}{m}}`, ativo: "y(pos('c12')) > 0", expr: "1e-3*mag(vel('c12'))", unidade: 'km/s', teoria: `1e-3*sqrt(2*qe*V/(12*${U}))` },
        { rotulo: 'Raio de curvatura do ¹²C⁺', simbolo: r`R_{12} = \frac{mv}{qB}`, ativo: "y(pos('c12')) > 0", expr: `100*12*${U}*mag(vel('c12'))/(qe*mag(B('c12')))`, unidade: 'cm', teoria: `100*sqrt(2*12*${U}*V/qe)/B0` },
        { rotulo: 'Raio de curvatura do ¹⁴C⁺', simbolo: r`R_{14}`, ativo: "y(pos('c14')) > 0", expr: `100*14*${U}*mag(vel('c14'))/(qe*mag(B('c14')))`, unidade: 'cm', teoria: `100*sqrt(2*14*${U}*V/qe)/B0` },
        {
          rotulo: 'Massa do ¹²C⁺ recuperada do raio',
          simbolo: r`m = \frac{qR^2B^2}{2V}`,
          ativo: "y(pos('c12')) > 0",
          expr: `qe*(12*${U}*mag(vel('c12'))/(qe*mag(B('c12'))))^2*B0^2/(2*V)/${U}`,
          unidade: 'u',
          teoria: 12,
        },
        {
          rotulo: 'Razão entre os raios',
          simbolo: r`R_{12}/R_{14}`,
          ativo: "y(pos('c12')) > 0 && y(pos('c14')) > 0",
          expr: "(12*mag(vel('c12'))/mag(B('c12')))/(14*mag(vel('c14'))/mag(B('c14')))",
          unidade: '',
          teoria: 'sqrt(12/14)',
        },
      ],
      passos: [
        {
          titulo: '(a) Aceleração',
          texto: r`Partindo do repouso, $qV = \tfrac12mv^2$: $v = \sqrt{\dfrac{2qV}{m}}$. Rode: os dois íons ganham a mesma energia, mas o mais leve sai mais rápido.`,
          medidas: [0],
        },
        {
          titulo: '(b) Massa',
          texto: r`No campo, $qvB = \dfrac{mv^2}{R}$, então $R = \dfrac{mv}{qB} = \dfrac1B\sqrt{\dfrac{2mV}{q}}$. Isolando,
$$m = \frac{qR^2B^2}{2V}.$$
A medida refaz essa conta com o raio de curvatura da simulação.`,
          medidas: [1, 3],
        },
        {
          titulo: '(c) Os dois isótopos',
          texto: r`Mesma carga, mesmos $V$ e $B$: $R\propto\sqrt m$, então $\dfrac{R_{12}}{R_{14}} = \sqrt{\dfrac{12}{14}} = \sqrt{\dfrac67} \approx 0{,}926$. Os pontos de chegada no anteparo ficam separados por $2(R_{14} - R_{12})$.`,
          medidas: [1, 2, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$v = \sqrt{\dfrac{2qV}{m}}$` },
        { item: '(b)', texto: r`$m = \dfrac{qR^2B^2}{2V}$` },
        { item: '(c)', texto: r`$\dfrac{R_{12}}{R_{14}} = \sqrt{\dfrac67} \approx 0{,}93$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Energia e diferença de potencial', lab: 'potencial' },
          { texto: 'Movimento circular em campo magnético', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: 'Energia', texto: r`$qV = mv^2/2$.`, passo: 0 },
          { titulo: 'Raio', texto: r`$R = mv/qB$.`, passo: 1 },
          { titulo: 'Razão', texto: r`$R\propto\sqrt m$.`, passo: 2 },
        ],
        resultado: r`$v = \sqrt{2qV/m}$; $m = qR^2B^2/2V$; $R_{12}/R_{14} = \sqrt{6/7}$.`,
        errosComuns: ['Usar $R \\propto m$: com a mesma energia, a velocidade também muda, e sobra a raiz.'],
        oficial: { resposta: 'v = √(2qV/m); m = qR²B²/2V; R₁₂/R₁₄ = √(6/7).' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Fácil',
      titulo: 'Quatro fios no mesmo campo uniforme',
      resumo: 'Em campo uniforme só importa o vetor de A até B: F = I·Δx·B, com Δx a distância horizontal.',
      figura: { pagina: 2, recorte: [0.089, 0.213, 0.936, 0.554] },
      cena: { escala: 1, extensao: 5, unidade: 'm', plano: 'xy', camera: { pos: [0, -0.4, 12], alvo: [0, -0.2, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'B0', rotulo: 'Campo magnético (para cima)', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
      ],
      objetos: [
        { id: 'Bu', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        ...FIOS7.flatMap((f, k) => poligonal(pre7(k), 'I0', f.pts.map(([x, y]) => [f.o[0] + x, f.o[1] + y, 0] as P3))),
        ...FIOS7.flatMap((f, k) => [
          { id: `n${k}`, tipo: 'rotulo' as const, pos: [f.o[0] + 1.7, f.o[1] + 2.25, 0] as P3, texto: f.nome },
          { id: `A${k}`, tipo: 'rotulo' as const, pos: [f.o[0] + f.pts[0][0] - 0.25, f.o[1] + f.pts[0][1], 0] as P3, texto: 'A' },
          { id: `B${k}`, tipo: 'rotulo' as const, pos: [f.o[0] + f.pts[f.pts.length - 1][0] + 0.2, f.o[1] + f.pts[f.pts.length - 1][1] + 0.1, 0] as P3, texto: 'B' },
        ]),
      ],
      visual: { setasB: true, planoSetas: 'xy', densidade: 9 },
      medidas: FIOS7.map((f, k) => ({
        rotulo: `Força no fio ${f.nome} (soma dos trechos)`,
        simbolo: r`F_{\text{${f.nome}}}`,
        expr: F7(k),
        unidade: 'N',
        teoria: `I0*B0*${f.dx}`,
      })),
      passos: [
        {
          titulo: 'Só os extremos importam',
          texto: r`Em campo uniforme, $\vec F = I\displaystyle\int_A^B d\vec l\times\vec B = I\left(\int_A^B d\vec l\right)\times\vec B = I\,\overrightarrow{AB}\times\vec B$: o formato do fio não conta.`,
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: 'Só a parte horizontal',
          texto: r`Com $\vec B$ vertical, a parte vertical de $\overrightarrow{AB}$ não dá força: $F = I\,\Delta x\,B$. Na figura, $\Delta x \approx 2$ m (IV), $3$ m (I), $3{,}5$ m (II) e $4$ m (III).`,
          medidas: [0, 1, 2, 3],
        },
      ],
      respostas: [{ item: 'Ordem', texto: r`$F_{IV} < F_I < F_{II} < F_{III}$` }],
      resolucao: {
        conceitos: [{ texto: 'Força num fio em campo uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Campo uniforme', texto: r`$\vec F = I\,\overrightarrow{AB}\times\vec B$.`, passo: 0 },
          { titulo: 'Comparar', texto: r`Distâncias horizontais de A a B.`, passo: 1 },
        ],
        resultado: r`$F_{IV} < F_I < F_{II} < F_{III}$.`,
        errosComuns: ['Comparar o comprimento de cada fio: o fio IV é o mais longo e leva a menor força.'],
        oficial: { resposta: 'F₃ > F₂ > F₁ > F₄.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Trecho com semicírculo em campo uniforme',
      resumo: 'Com B = Bŷ só o semicírculo sente: −2IaB ẑ. Com B = Bx̂, só os retos: −2ILB ẑ.',
      figura: { pagina: 2, recorte: [0.089, 0.555, 0.936, 0.834] },
      cena: { escala: 0.01, extensao: 35, unidade: 'cm', camera: { pos: [42, 30, 38], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'caso', rotulo: 'Campo', valor: 1, opcoes: [{ valor: 1, rotulo: '(a) B = B ŷ' }, { valor: 2, rotulo: '(b) B = B x̂' }] },
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'a', rotulo: 'Raio do semicírculo', simbolo: 'a', valor: 0.1, unidade: 'm', min: 0.05, max: 0.15, passo: 0.005 },
        { id: 'L', rotulo: 'Comprimento dos retos', simbolo: 'L', valor: 0.3, unidade: 'm', min: 0.1, max: 0.3, passo: 0.01 },
      ],
      objetos: [
        { id: 'Bu', tipo: 'campoB', valor: 'caso == 1 ? [0, B0, 0] : [B0, 0, 0]', rotulo: 'B' },
        { id: 's1', tipo: 'fio', I: 'I0', a: ['a', '0-L', 0], b: ['a', 0, 0], rotulo: 'I' },
        ...arco('c', 'I0', 'a', [0, 0, 0], [1, 0, 0], [0, 0, 1], 0, 180),
        { id: 's2', tipo: 'fio', I: 'I0', a: ['0-a', 0, 0], b: ['0-a', 'L', 0] },
        { id: 'c2a', tipo: 'cota', a: ['a', 0, 0], b: ['0-a', 0, 0], deslocamento: [0, -0.04, 0], rotulo: '2a' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Força total, componente z', simbolo: 'F_z', expr: `1e3*z${F8}`, unidade: 'mN', teoria: '1e3*(caso == 1 ? 0-2*I0*a*B0 : 0-2*I0*L*B0)' },
        { rotulo: 'Componentes x e y da força total', simbolo: r`\sqrt{F_x^2 + F_y^2}`, expr: `1e3*sqrt(x${F8}^2 + y${F8}^2)`, unidade: 'mN', teoria: 0 },
        { rotulo: 'Força no semicírculo', simbolo: r`F_z^\text{arco}`, expr: `1e3*z(${F8arco})`, unidade: 'mN', teoria: '1e3*(caso == 1 ? 0-2*I0*a*B0 : 0)' },
        { rotulo: 'Força nos dois trechos retos', simbolo: r`F_z^\text{retos}`, expr: "1e3*z(forca('s1', 'Bu') + forca('s2', 'Bu'))", unidade: 'mN', teoria: '1e3*(caso == 1 ? 0 : 0-2*I0*L*B0)' },
      ],
      passos: [
        {
          titulo: '(a) B ao longo de y',
          texto: r`Os trechos retos são paralelos a $\vec B$: força zero. No semicírculo, em campo uniforme, vale o atalho $\vec F = I\,\vec d\times\vec B$, com $\vec d$ o vetor do início ao fim: $\vec d = -2a\,\hat x$. Então
$$\vec F = I(-2a\hat x)\times B\hat y = -2IaB\,\hat z.$$`,
          parametros: { caso: 1 },
          medidas: [0, 2, 3],
        },
        {
          titulo: '(b) B ao longo de x',
          texto: r`Agora $\vec d = -2a\hat x$ é paralelo a $\vec B$: o semicírculo fica sem força. Cada reto, com $I$ ao longo de $+\hat y$, leva $IL\hat y\times B\hat x = -ILB\,\hat z$:
$$\vec F = -2ILB\,\hat z.$$`,
          parametros: { caso: 2 },
          medidas: [0, 2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec F = -2IaB\,\hat z$` },
        { item: '(b)', texto: r`$\vec F = -2ILB\,\hat z$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força num fio em campo uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Atalho', texto: r`Em campo uniforme, só o vetor início → fim de cada trecho importa.`, passo: 0 },
          { titulo: 'Trocar o campo', texto: r`Agora os retos é que são perpendiculares.`, passo: 1 },
        ],
        resultado: r`(a) $-2IaB\hat z$; (b) $-2ILB\hat z$.`,
        errosComuns: ['Integrar o semicírculo ponto a ponto e errar o sinal: o atalho $I\\vec d\\times\\vec B$ evita a conta.'],
        oficial: { resposta: '(a) F = −2IaB ẑ; (b) F = −2ILB ẑ.' },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Barra em equilíbrio num plano inclinado',
      resumo: 'Força magnética horizontal: I = Mg tg θ/(BL) e N = Mg/cos θ.',
      figura: [
        { pagina: 2, recorte: [0.089, 0.835, 0.936, 0.91] },
        { pagina: 3, recorte: [0.08, 0.058, 0.936, 0.297] },
      ],
      cena: { escala: 0.01, extensao: 18, unidade: 'cm', camera: { pos: [22, 13, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'M', rotulo: 'Massa da barra', simbolo: 'M', valor: 0.05, unidade: 'kg', min: 0.02, max: 0.1, passo: 0.005 },
        { id: 'th', rotulo: 'Inclinação', simbolo: r`\theta`, valor: 30, unidade: '°', min: 10, max: 60, passo: 1 },
        { id: 'B0', rotulo: 'Campo magnético (vertical)', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.2, max: 1, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'L', valor: 0.2, unidade: 'm', min: 0.2, max: 0.2, passo: 0.01 },
        { id: 'I0', rotulo: 'Corrente na barra', simbolo: 'I', valor: 1.5, unidade: 'A', min: 0.1, max: 6, passo: 0.01 },
      ],
      objetos: [
        { id: 'Bv', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        {
          id: 'plano',
          tipo: 'placa',
          sigma: 0,
          centro: [0, '0-0.006*cos(rad(th))', '0-0.006*sin(rad(th))'],
          normal: [0, 'cos(rad(th))', 'sin(rad(th))'],
          largura: 0.3,
          altura: 0.3,
          rotulo: 'plano inclinado (sobe para −z)',
        },
        { id: 'barra', tipo: 'fio', I: 'I0', a: ['L/2', 0, 0], b: ['0-L/2', 0, 0], rotulo: 'barra (corrente da direita para a esquerda)' },
        { id: 'sg', tipo: 'seta', papel: 'forca', origem: [0, 0, 0], vetor: [0, -1, 0], comprimento: '6*cm', rotulo: 'Mg' },
        { id: 'sN', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: [0, 'cos(rad(th))', 'sin(rad(th))'], comprimento: '6*cm*(cos(rad(th)) + I0*L*B0*sin(rad(th))/(M*9.8))', rotulo: 'N' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: [0, 0, 0], vetor: "forca('barra', 'Bv')", comprimento: '6*cm*I0*L*B0/(M*9.8)', rotulo: 'F magnética' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Força magnética na barra', simbolo: r`F = ILB`, expr: "mag(forca('barra', 'Bv'))", unidade: 'N', teoria: 'I0*L*B0' },
        {
          rotulo: 'Resultante ao longo do plano (+ = desce)',
          simbolo: r`Mg\sin\theta - F\cos\theta`,
          expr: "M*9.8*sin(rad(th)) + dot(forca('barra', 'Bv'), vec(0, 0-sin(rad(th)), cos(rad(th))))",
          unidade: 'N',
          teoria: 'M*9.8*sin(rad(th)) - I0*L*B0*cos(rad(th))',
        },
        {
          rotulo: 'Normal do plano',
          simbolo: r`N = Mg\cos\theta + F\sin\theta`,
          expr: "M*9.8*cos(rad(th)) - dot(forca('barra', 'Bv'), vec(0, cos(rad(th)), sin(rad(th))))",
          unidade: 'N',
          teoria: 'M*9.8*cos(rad(th)) + I0*L*B0*sin(rad(th))',
        },
        { rotulo: 'Corrente de equilíbrio', simbolo: r`I = \frac{Mg\tan\theta}{BL}`, expr: 'M*9.8*tan(rad(th))/(B0*L)', unidade: 'A' },
        { rotulo: 'Normal no equilíbrio', simbolo: r`\frac{Mg}{\cos\theta}`, expr: 'M*9.8/cos(rad(th))', unidade: 'N' },
      ],
      passos: [
        {
          titulo: 'As forças',
          texto: r`Peso $Mg$ para baixo, normal perpendicular ao plano e força magnética $\vec F = I\vec L\times\vec B$. Com $\vec B$ vertical e a barra horizontal, $\vec F$ é **horizontal**, de módulo $ILB$. Com pouca corrente a barra escorrega.`,
          parametros: { I0: 1.5 },
          medidas: [0, 1],
        },
        {
          titulo: '(a) Corrente de equilíbrio',
          texto: r`Ao longo do plano: $Mg\sin\theta = ILB\cos\theta$, então
$$I = \frac{Mg\tan\theta}{BL}.$$
$\vec F$ tem de apontar para o lado de cima do plano: na figura, a corrente vai **da direita para a esquerda**.`,
          parametros: { I0: 2.83 },
          medidas: [1, 3],
        },
        {
          titulo: '(b) Normal',
          texto: r`Perpendicular ao plano: $N = Mg\cos\theta + F\sin\theta = Mg\cos\theta + Mg\dfrac{\sin^2\theta}{\cos\theta} = \dfrac{Mg}{\cos\theta}$. Também sai direto da soma vetorial: o peso e $\vec F$ somam um vetor de módulo $Mg/\cos\theta$, e só a normal o equilibra.`,
          parametros: { I0: 2.83 },
          medidas: [2, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$I = \dfrac{Mg\tan\theta}{BL}$, da direita para a esquerda na figura.` },
        { item: '(b)', texto: r`$N = \dfrac{Mg}{\cos\theta}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força num fio em campo uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Direção de F', texto: r`$\vec L\times\vec B$ com $\vec B$ vertical: horizontal.`, passo: 0 },
          { titulo: 'Ao longo do plano', texto: r`$Mg\sin\theta = F\cos\theta$.`, passo: 1 },
          { titulo: 'Perpendicular', texto: r`$N = Mg\cos\theta + F\sin\theta$.`, passo: 2 },
        ],
        resultado: r`$I = Mg\tan\theta/(BL)$; $N = Mg/\cos\theta$.`,
        errosComuns: ['Tomar a força magnética como paralela ao plano: ela é horizontal, porque $\\vec B$ é vertical.', 'Escrever $\\cot\\theta$ no lugar de $\\tan\\theta$: com o plano na horizontal ($\\theta = 0$) não é preciso corrente nenhuma.'],
        oficial: {
          resposta: 'I = mg/(BL tg θ), da direita para a esquerda; N = mg/cos θ.',
          observacao: 'Divergência no item (a): o certo é I = mg·tg θ/(BL). Com o plano horizontal (θ = 0) a barra não escorrega e não precisa de corrente, mas a expressão do gabarito iria ao infinito. A normal N = mg/cos θ do gabarito confere, e ela só sai com a corrente certa.',
        },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Médio',
      titulo: 'Espira retangular girando em campo uniforme',
      resumo: 'μ = Iab(sen θ x̂ − cos θ ŷ), τ = IabB₀ sen θ ẑ; estável em θ = π.',
      figura: { pagina: 3, recorte: [0.08, 0.298, 0.936, 0.707] },
      cena: { escala: 0.01, extensao: 20, unidade: 'cm', camera: { pos: [30, 18, 26], alvo: [3, 3, 6] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'B0', rotulo: 'Campo magnético (ao longo de y)', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'a', rotulo: 'Lado horizontal', simbolo: 'a', valor: 0.1, unidade: 'm', min: 0.05, max: 0.15, passo: 0.005 },
        { id: 'b', rotulo: 'Lado ao longo de z', simbolo: 'b', valor: 0.15, unidade: 'm', min: 0.05, max: 0.15, passo: 0.005 },
        { id: 'th', rotulo: 'Ângulo com o plano xz', simbolo: r`\theta`, valor: 60, unidade: '°', min: 0, max: 360, passo: 5 },
      ],
      objetos: [
        { id: 'Bu', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'l0', tipo: 'fio', I: 'I0', a: [0, 0, 'b'], b: [0, 0, 0], rotulo: 'I' },
        { id: 'l1', tipo: 'fio', I: 'I0', a: [0, 0, 0], b: [CT, ST, 0] },
        { id: 'l2', tipo: 'fio', I: 'I0', a: [CT, ST, 0], b: [CT, ST, 'b'] },
        { id: 'l3', tipo: 'fio', I: 'I0', a: [CT, ST, 'b'], b: [0, 0, 'b'] },
        { id: 'smu', tipo: 'seta', papel: 'neutro', origem: [`${CT}/2`, `${ST}/2`, 'b/2'], vetor: ['sin(rad(th))', '0-cos(rad(th))', 0], comprimento: '5*cm', rotulo: 'μ' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Torque, componente z (soma de r × F nos lados)', simbolo: r`\tau_z = IabB_0\sin\theta`, expr: `1e3*z${T10}`, unidade: 'mN·m', teoria: '1e3*I0*a*b*B0*sin(rad(th))' },
        { rotulo: 'Torque, componentes x e y', simbolo: r`\sqrt{\tau_x^2 + \tau_y^2}`, expr: `1e3*sqrt(x${T10}^2 + y${T10}^2)`, unidade: 'mN·m', teoria: 0 },
        { rotulo: 'Momento de dipolo, componente x', simbolo: r`\mu_x = Iab\sin\theta`, expr: '1e3*I0*a*b*sin(rad(th))', unidade: 'mA·m²' },
        { rotulo: 'Momento de dipolo, componente y', simbolo: r`\mu_y = -Iab\cos\theta`, expr: '1e3*(0-I0*a*b*cos(rad(th)))', unidade: 'mA·m²' },
        { rotulo: 'Energia potencial', simbolo: r`U = -\vec\mu\cdot\vec B = IabB_0\cos\theta`, expr: '1e3*I0*a*b*B0*cos(rad(th))', unidade: 'mJ' },
      ],
      passos: [
        {
          titulo: '(a) Momento de dipolo',
          texto: r`A espira tem área $ab$ e seu plano contém $\hat z$ e $\hat u = \cos\theta\,\hat x + \sin\theta\,\hat y$. Pela regra da mão direita, com $I$ descendo no lado sobre o eixo $z$, a normal é $\hat u\times\hat z$:
$$\vec\mu = Iab\,(\sin\theta\,\hat x - \cos\theta\,\hat y).$$`,
          parametros: { th: 60 },
          medidas: [2, 3],
        },
        {
          titulo: '(b) Torque',
          texto: r`$\vec\tau = \vec\mu\times\vec B = Iab(\sin\theta\,\hat x - \cos\theta\,\hat y)\times B_0\hat y = IabB_0\sin\theta\,\hat z.$ A simulação soma $\vec r\times\vec F$ nos quatro lados e chega ao mesmo vetor.`,
          parametros: { th: 60 },
          medidas: [0, 1],
        },
        {
          titulo: '(c) Sentido de rotação',
          texto: r`$\tau_z > 0$: o torque gira a espira no sentido **anti-horário** visto de cima ($+z$), aumentando $\theta$, rumo a $\vec\mu$ paralelo a $\vec B$, onde a energia $U = -\vec\mu\cdot\vec B$ é mínima.`,
          parametros: { th: 120 },
          medidas: [0, 4],
        },
        {
          titulo: '(d) Equilíbrios',
          texto: r`O torque some em $\theta = 0$ e $\theta = \pi$. Em $\theta = \pi$, $\vec\mu = +Iab\,\hat y$ é paralelo a $\vec B$: energia mínima, **estável**. Em $\theta = 0$, antiparalelo: energia máxima, **instável**. Atenção: $\theta$ não é o ângulo entre $\vec\mu$ e $\vec B$.`,
          parametros: { th: 180 },
          medidas: [0, 4],
        },
        {
          titulo: '(e) Trabalho',
          texto: r`As forças nos lados giram a espira e lhe dão energia cinética, mas essa energia não vem de $\vec B$: a força magnética sobre cada carga é perpendicular à velocidade dela e não realiza trabalho. Quem paga é a fonte que mantém a corrente $I$.`,
          parametros: { th: 0 },
          medidas: [0, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec\mu = Iab(\sin\theta\,\hat x - \cos\theta\,\hat y)$` },
        { item: '(b)', texto: r`$\vec\tau = IabB_0\sin\theta\,\hat z$` },
        { item: '(c)', texto: r`Anti-horário visto de $+z$ ($\theta$ aumenta).` },
        { item: '(d)', texto: r`Estável em $\theta = \pi$; instável em $\theta = 0$.` },
        { item: '(e)', texto: 'A força magnética não realiza trabalho; a energia da rotação vem da fonte que mantém a corrente.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Torque numa espira', lab: 'forcas' }],
        etapas: [
          { titulo: 'Normal', texto: r`Regra da mão direita com o sentido de $I$.`, passo: 0 },
          { titulo: 'Torque', texto: r`$\vec\mu\times\vec B$.`, passo: 1 },
          { titulo: 'Energia', texto: r`$U = -\vec\mu\cdot\vec B$ decide a estabilidade.`, passo: 3 },
        ],
        resultado: r`$\vec\mu = Iab(\sin\theta\hat x - \cos\theta\hat y)$; $\vec\tau = IabB_0\sin\theta\hat z$; estável em $\pi$.`,
        errosComuns: ['Tomar $\\theta$ como o ângulo entre $\\vec\\mu$ e $\\vec B$ e trocar os equilíbrios.'],
        oficial: {
          resposta: 'μ = Iab(sen θ x̂ − cos θ ŷ); τ = IabB₀ sen θ ẑ; rotação anti-horária; estável em θ = π e instável em θ = 0; a força magnética não realiza trabalho.',
          observacao: 'O enunciado escreve o campo como B₀y ŷ e o chama de constante; aqui ele é B₀ ŷ, como no gabarito.',
        },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Difícil',
      titulo: 'Anel sobre um ímã em barra',
      resumo: 'Só a parte radial de B empurra: F = 2πrIB sen θ, para cima; o anel é um ímã de polo N voltado para o N do ímã.',
      figura: [
        { pagina: 3, recorte: [0.08, 0.708, 0.936, 0.839] },
        { pagina: 4, recorte: [0.08, 0.058, 0.936, 0.322] },
      ],
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [6, 5, 12], alvo: [0, -1.5, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no anel', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'r', rotulo: 'Raio do anel', simbolo: 'r', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.001 },
        { id: 'h', rotulo: 'Altura do anel acima do centro do ímã', simbolo: 'h', valor: 0.035, unidade: 'm', min: 0.03, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'ima', tipo: 'ima', centro: [0, '0-h', 0], eixo: 'y', comprimento: 0.04, raio: 0.008, intensidade: 3000, rotulo: 'ímã (N em cima)' },
        ...arco('an', 'I0', 'r', [0, 0, 0], [1, 0, 0], [0, 0, 1], 0, 360),
        { id: 'sI', tipo: 'seta', papel: 'I', origem: [0, 0, 'r'], vetor: [-1, 0, 0], comprimento: '1.5*cm', rotulo: 'I' },
      ],
      medidas: [
        { rotulo: 'Campo do ímã no anel', simbolo: 'B', expr: "1e3*mag(Bde('ima', r, 0, 0))", unidade: 'mT' },
        { rotulo: 'Ângulo do campo com a vertical', simbolo: r`\theta`, expr: `deg(atan2(${BRAD}, ${BVER}))`, unidade: '°' },
        { rotulo: 'Força vertical no anel (soma de I dl × B)', simbolo: r`F = 2\pi rIB\sin\theta`, expr: `1e3*${F11}`, unidade: 'mN', teoria: `1e3*2*pi*r*I0*${BRAD}` },
        { rotulo: 'Momento de dipolo do anel (para baixo)', simbolo: r`\mu = I\pi r^2`, expr: '1e3*I0*pi*r^2', unidade: 'mA·m²' },
      ],
      passos: [
        {
          titulo: 'Decompor B',
          texto: r`No anel, $\vec B$ tem uma parte vertical $B\cos\theta$ e uma radial $B\sin\theta$, para fora. A parte vertical dá forças radiais que se cancelam em volta do anel.`,
          medidas: [0, 1],
        },
        {
          titulo: '(a) A parte radial',
          texto: r`Com $d\vec l$ tangente e $B\sin\theta$ radial, $d\vec F = I\,d\vec l\times\vec B$ é **vertical** em todo o anel, sempre no mesmo sentido. Com a corrente da figura (horária vista de cima):
$$\vec F = 2\pi rIB\sin\theta\,\hat z,$$
para cima. A simulação soma $I\,d\vec l\times\vec B$ nos 24 trechos.`,
          medidas: [2],
        },
        {
          titulo: '(b) Polos',
          texto: r`A corrente horária vista de cima dá $\vec\mu = -I\pi r^2\,\hat z$. Então $\vec F = -\dfrac{2\vec\mu B\sin\theta}{r}$. O anel é um ímã com o polo **N para baixo**, de frente para o N do ímã: os polos iguais se repelem.`,
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec F = 2\pi rIB\sin\theta\,\hat z$ (vertical, para cima)` },
        { item: '(b)', texto: r`$\vec F = -\dfrac{2\vec\mu B\sin\theta}{r}$: o polo N do anel fica de frente para o N do ímã, e eles se repelem.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força num fio em campo não uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Componentes', texto: r`Vertical cancela, radial soma.`, passo: 0 },
          { titulo: 'Integrar', texto: r`$\oint dl = 2\pi r$.`, passo: 1 },
          { titulo: 'Dipolo', texto: r`$\vec\mu$ oposto ao ímã: repulsão.`, passo: 2 },
        ],
        resultado: r`$\vec F = 2\pi rIB\sin\theta\,\hat z = -2\vec\mu B\sin\theta/r$.`,
        errosComuns: ['Usar a componente vertical de $\\vec B$ no lugar da radial.'],
        oficial: { resposta: 'F = 2πrIB sen θ ẑ; F = −2μB sen θ/r.' },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Difícil',
      titulo: 'Efeito Hall numa fita',
      resumo: 'Portadores desviam até o campo das bordas equilibrar: E = v_dB e V = IBd/(nqA).',
      figura: { pagina: 4, recorte: [0.08, 0.323, 0.936, 0.758] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [7, 11, 13], alvo: [0, 0, 0] }, tempo: { escala: 5e-8, unidade: 'ns', passo: 3e-10 } },
      parametros: [
        { id: 'sq', rotulo: 'Portadores', valor: 1, opcoes: [{ valor: 1, rotulo: 'positivos' }, { valor: -1, rotulo: 'negativos' }] },
        { id: 'liga', rotulo: 'Campo das bordas', valor: 1, opcoes: [{ valor: 1, rotulo: 'equilíbrio' }, { valor: 0, rotulo: 'ainda não formado' }] },
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 10, passo: 0.1 },
        { id: 'B0', rotulo: 'Campo magnético (ao longo de y)', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.3, max: 1, passo: 0.05 },
        { id: 'n', rotulo: 'Portadores por volume', simbolo: 'n', valor: 8.5e28, unidade: '1/m³', min: 8.5e28, max: 8.5e28, passo: 1e27 },
        { id: 'd', rotulo: 'Largura da fita', simbolo: 'd', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 'Ar', rotulo: 'Área da seção', simbolo: 'A', valor: 3e-6, unidade: 'm²', min: 3e-6, max: 3e-6, passo: 1e-7 },
        { id: 'vp', rotulo: 'Velocidade do portador de prova', simbolo: 'v_p', valor: 5e5, unidade: 'm/s', min: 5e5, max: 5e5, passo: 1e4 },
      ],
      objetos: [
        { id: 'fita', tipo: 'placa', sigma: 0, centro: [0, 0, 0], normal: 'y', largura: 'd', altura: 0.12, rotulo: 'fita' },
        { id: 'By', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'Eh', tipo: 'campoE', valor: 'abs(x) < 0.06 && abs(y) < 0.01 && abs(z) < d/2 ? [0, 0, 0-liga*sq*vp*B0] : [0, 0, 0]', rotulo: 'campo das bordas' },
        { id: 'p', tipo: 'particula', q: 'sq*qe', m: 'mp', pos: ['0-sq*5*cm', 0, 0], v: ['sq*vp', 0, 0], rotulo: 'portador de prova' },
        { id: 'sI', tipo: 'seta', papel: 'I', origem: [-0.075, 0, 0], vetor: [1, 0, 0], comprimento: '2*cm', rotulo: 'I' },
      ],
      visual: { setasB: true },
      medidas: [
        { rotulo: 'Velocidade de arraste, componente x', simbolo: r`v_x = \pm\frac{I}{nqA}`, expr: '1e3*sq*I0/(n*qe*Ar)', unidade: 'mm/s' },
        { rotulo: 'Força magnética num portador', simbolo: r`F = qv_dB = \frac{IB}{nA}`, expr: '1e24*I0*B0/(n*Ar)', unidade: '10⁻²⁴ N' },
        { rotulo: 'Campo das bordas, componente z', simbolo: r`E_z = \mp v_dB`, expr: '1e6*(0-sq)*I0*B0/(n*qe*Ar)', unidade: 'μV/m' },
        { rotulo: 'Potencial da borda de cima menos o da de baixo', simbolo: r`V = \pm\frac{IBd}{nqA}`, expr: '1e6*sq*I0*B0*d/(n*qe*Ar)', unidade: 'μV' },
        { rotulo: 'Magnetorresistência', simbolo: r`\frac VI = \frac{Bd}{nqA}`, expr: '1e6*B0*d/(n*qe*Ar)', unidade: 'μΩ' },
        { rotulo: 'Força resultante no portador de prova', simbolo: r`|q(\vec E + \vec v\times\vec B)|`, expr: "1e15*qe*mag(E('p') + cross(vel('p'), B('p')))", unidade: 'fN', teoria: '1e15*qe*vp*B0*(1 - liga)' },
      ],
      passos: [
        {
          titulo: '(a) e (b) Arraste e força',
          texto: r`$I = nqv_dA$, então $\vec v_d = \dfrac{I}{nqA}\hat x$ (no sentido da corrente, para $q > 0$). A força em cada portador é $q\vec v_d\times\vec B = qv_dB\,(\hat x\times\hat y) = \dfrac{IB}{nA}\hat z$, para a borda de cima. Com o cobre ($n \approx 8{,}5\times10^{28}$ m⁻³), $v_d$ não passa de frações de mm/s.`,
          parametros: { sq: 1, liga: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(c) Acúmulo',
          texto: r`Os portadores positivos se acumulam na borda de **cima**, que fica positiva; a de baixo fica negativa. A cena usa um próton rápido como portador de prova, para o desvio caber na tela: sem o campo das bordas, ele sobe.`,
          parametros: { sq: 1, liga: 0 },
          medidas: [5],
        },
        {
          titulo: '(d) e (e) Equilíbrio',
          texto: r`O acúmulo cria $\vec E$ de cima para baixo. O desvio para quando $qE = qv_dB$:
$$\vec E = -v_dB\,\hat z = -\frac{IB}{nqA}\hat z,\qquad V = Ed = \frac{IBd}{nqA},$$
com a borda de cima no potencial mais alto. No equilíbrio, o portador de prova segue reto.`,
          parametros: { sq: 1, liga: 1 },
          medidas: [2, 3, 5],
        },
        { titulo: '(f) Magnetorresistência', texto: r`$\dfrac VI = \dfrac{Bd}{nqA}$: não depende da corrente.`, parametros: { sq: 1, liga: 1 }, medidas: [4] },
        {
          titulo: '(g) Portadores negativos',
          texto: r`Agora $\vec v_d$ aponta contra a corrente, e $(-q)(-\vec v_d)\times\vec B$ continua para cima: os portadores **negativos** é que se acumulam em cima. Os módulos não mudam, mas $\vec E$ e a ddp trocam de sinal: a borda de cima fica no potencial mais baixo. É assim que o efeito Hall revela o sinal dos portadores.`,
          parametros: { sq: -1, liga: 1 },
          medidas: [0, 2, 3, 5],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec v_d = \dfrac{I}{nqA}\hat x$` },
        { item: '(b)', texto: r`$F = qv_dB = \dfrac{IB}{nA}$` },
        { item: '(c)', texto: 'Borda de cima positiva, de baixo negativa.' },
        { item: '(d)', texto: r`$\vec E = -\dfrac{IB}{nqA}\hat z$` },
        { item: '(e)', texto: r`$V = \dfrac{IBd}{nqA}$, com a borda de cima mais alta.` },
        { item: '(f)', texto: r`$\dfrac VI = \dfrac{Bd}{nqA}$` },
        { item: '(g)', texto: r`Mesmos módulos; $\vec v_d$, $\vec E$, a ddp e os sinais das bordas se invertem.` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz e seletor de velocidades', lab: 'lorentz' },
          { texto: 'Corrente e velocidade de arraste', lab: 'corrente' },
        ],
        etapas: [
          { titulo: 'Arraste', texto: r`$I = nqv_dA$.`, passo: 0 },
          { titulo: 'Equilíbrio', texto: r`$qE = qv_dB$.`, passo: 2 },
          { titulo: 'Sinal', texto: r`Portadores negativos invertem $\vec E$.`, passo: 4 },
        ],
        resultado: r`$v_d = I/nqA$; $E = IB/nqA$; $V = IBd/nqA$; $V/I = Bd/nqA$.`,
        errosComuns: ['Achar que portadores negativos desviam para a outra borda: eles andam ao contrário, e a força fica no mesmo sentido.'],
        oficial: { resposta: 'O gabarito só identifica o tema (efeito Hall), sem as respostas dos itens.', observacao: 'Respostas desta bancada.' },
      },
    },

    /* ───────────────────────── 13 ───────────────────────── */
    {
      id: 'e13',
      numero: '13',
      secao: 'Difícil',
      titulo: 'Potenciais numa fita de cobre',
      resumo: 'Elétrons desviam para baixo (V_A > V_B) e o potencial cai ao longo da corrente (V_B > V_C).',
      figura: { pagina: 5, recorte: [0.08, 0.062, 0.936, 0.316] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'i0', rotulo: 'Corrente', simbolo: 'i', valor: 5, unidade: 'A', min: 1, max: 20, passo: 0.5 },
        { id: 'B0', rotulo: 'Campo magnético (saindo)', simbolo: 'B_0', valor: 1, unidade: 'T', min: 0.2, max: 2, passo: 0.1 },
        { id: 'w', rotulo: 'Largura da fita', simbolo: 'w', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
        { id: 'esp', rotulo: 'Espessura', simbolo: 'e', valor: 1e-3, unidade: 'm', min: 1e-3, max: 1e-3, passo: 1e-4 },
        { id: 'n', rotulo: 'Elétrons livres por volume', simbolo: 'n', valor: 8.5e28, unidade: '1/m³', min: 8.5e28, max: 8.5e28, passo: 1e27 },
        { id: 'rho', rotulo: 'Resistividade do cobre', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1.7e-8, max: 1.7e-8, passo: 1e-9 },
        { id: 'dx', rotulo: 'Distância de B a C', simbolo: r`\overline{BC}`, valor: 0.01, unidade: 'm', min: 0.005, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        { id: 'fita', tipo: 'placa', sigma: 0, centro: [0, 0, 0], normal: 'z', largura: 'w', altura: 0.16, rotulo: 'fita de cobre' },
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B₀ (saindo)' },
        { id: 'Ein', tipo: 'campoE', valor: `abs(x) < 0.08 && abs(y) < w/2 + 1e-4 && abs(z) < 0.005 ? [rho*i0/(w*esp), 0-${VD13}*B0, 0] : [0, 0, 0]`, rotulo: 'E dentro da fita' },
        { id: 'AB', tipo: 'caminho', pontos: [[0.03, 'w/2', 0], [0.03, '0-w/2', 0]], tracejado: true, rotulo: 'A → B' },
        { id: 'BC', tipo: 'caminho', pontos: [[0.03, '0-w/2', 0], ['0.03 + dx', '0-w/2', 0]], rotulo: 'B → C' },
        { id: 'rA', tipo: 'rotulo', pos: [0.03, 'w/2 + 0.006', 0], texto: 'A' },
        { id: 'rB', tipo: 'rotulo', pos: [0.027, '0-w/2 - 0.006', 0], texto: 'B' },
        { id: 'rC', tipo: 'rotulo', pos: ['0.03 + dx', '0-w/2 - 0.006', 0], texto: 'C' },
        { id: 'si', tipo: 'seta', papel: 'I', origem: [-0.05, 0, 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'i' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [-0.03, -0.008, 0], vetor: [-1, 0, 0], comprimento: '2*cm', rotulo: 'v dos elétrons' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: [-0.04, -0.008, 0], vetor: [0, -1, 0], comprimento: '1*cm', rotulo: 'F magnética' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Velocidade de arraste dos elétrons', simbolo: r`v_d = \frac{i}{new}`, expr: `1e3*${VD13}`, unidade: 'mm/s' },
        { rotulo: 'V_A − V_B (efeito Hall)', simbolo: r`V_A - V_B = v_dB_0w`, expr: "1e6*intE('AB')", unidade: 'μV', teoria: `1e6*${VD13}*B0*w` },
        { rotulo: 'V_B − V_C (queda ao longo da corrente)', simbolo: r`V_B - V_C = \rho J\,\overline{BC}`, expr: "1e6*intE('BC')", unidade: 'μV', teoria: '1e6*rho*i0*dx/(w*esp)' },
        {
          rotulo: 'Força transversal num elétron, no equilíbrio',
          simbolo: r`F_y = -e(E_y + (\vec v\times\vec B)_y)`,
          expr: `1e24*(0-qe)*y(E(0.03, 0, 0) + cross(vec(0-${VD13}, 0, 0), B(0.03, 0, 0)))`,
          unidade: '10⁻²⁴ N',
          teoria: 0,
        },
      ],
      passos: [
        {
          titulo: 'Para onde vão os elétrons',
          texto: r`A corrente vai para a direita, então os elétrons andam para a **esquerda**. Com $\vec B_0$ saindo, $\vec F = (-e)\,\vec v\times\vec B_0$ aponta para **baixo**: os elétrons se acumulam na borda de baixo, que fica negativa.`,
          medidas: [0],
        },
        {
          titulo: 'A contra B',
          texto: r`A borda de cima (A) fica positiva: $V_A > V_B$. A diferença é a tensão Hall, $V_A - V_B = v_dB_0w$, minúscula no cobre. A cena integra $\vec E\cdot d\vec l$ de A até B.`,
          medidas: [1, 3],
        },
        {
          titulo: 'B contra C',
          texto: r`B e C estão na mesma borda, mas C fica adiante no sentido da corrente. A corrente desce o potencial, como em qualquer resistor: $V_B > V_C$, com $V_B - V_C = \rho J\,\overline{BC}$.`,
          medidas: [2],
        },
      ],
      respostas: [{ item: 'Ordem', texto: r`$V_A > V_B > V_C$` }],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Corrente e resistividade', lab: 'corrente' },
        ],
        etapas: [
          { titulo: 'Hall', texto: r`Elétrons para baixo: A acima de B.`, passo: 1 },
          { titulo: 'Ohm', texto: r`Ao longo da corrente o potencial cai: B acima de C.`, passo: 2 },
        ],
        resultado: r`$V_A > V_B > V_C$.`,
        errosComuns: ['Tratar os portadores como positivos e pôr a borda de baixo mais alta.', 'Achar que B e C, na mesma borda, têm o mesmo potencial.'],
        oficial: { resposta: 'O gabarito só identifica o tema (efeito Hall), sem a ordem.', observacao: 'Resposta desta bancada.' },
      },
    },
  ],
}

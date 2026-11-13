import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P2 } from '../formularios'

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
  formulario: FORMULARIO_P2,
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
          {
            titulo: '(a) Dá para andar no campo sem sentir força?',
            texto: r`**O que se pede.** Dizer se uma partícula carregada pode se mover num campo magnético uniforme sem sofrer força, e como.

**A ideia.** A força magnética sobre uma carga em movimento é (formulário)
$$\vec F_{(m)} = q\vec v\times\vec B.$$
O módulo de um produto vetorial é $|\vec v\times\vec B| = vB\sin\alpha$, com $\alpha$ o ângulo entre $\vec v$ e $\vec B$. Ele é zero quando os dois vetores são **paralelos** ($\alpha = 0$) ou **antiparalelos** ($\alpha = 180°$), porque $\sin\alpha = 0$.

**Resposta.** **Sim**: se a velocidade é paralela (ou antiparalela) ao campo, $\vec v\times\vec B = 0$ e não há força. A partícula segue em linha reta com velocidade constante, mesmo dentro do campo. (Uma partícula parada também não sente força, mas aí ela não está se movendo.)`,
            passo: 0,
          },
          {
            titulo: '(b) O que a força magnética faz, se não realiza trabalho',
            texto: r`**O que se pede.** Se a força magnética não realiza trabalho, como ela afeta o movimento? E que forças da Mecânica se comportam assim?

**A ideia.** Pela definição de produto vetorial, $\vec v\times\vec B$ é sempre **perpendicular** a $\vec v$. Então a força magnética é sempre perpendicular à velocidade. O trabalho num intervalo $dt$ é $dW = \vec F\cdot\vec v\,dt$, e o produto escalar de vetores perpendiculares é zero: $dW = 0$. Pelo teorema trabalho-energia, a energia cinética não muda, e a **rapidez** (o módulo da velocidade) fica constante.

**O efeito.** A força magnética muda só a **direção** da velocidade: ela **curva** a trajetória. Com $\vec v$ perpendicular a $\vec B$, a partícula descreve um círculo; num ângulo qualquer, uma hélice (a parte de $\vec v$ ao longo de $\vec B$ segue intacta e a parte perpendicular gira).

**Na Mecânica.** Fazem o mesmo papel as forças que agem como **resultante centrípeta** num movimento circular uniforme, sempre perpendiculares à velocidade:
- a tração no fio de um pêndulo cônico, ou de uma pedra girada por uma corda;
- a força normal num looping ou numa curva compensada;
- a gravidade num satélite em órbita circular.`,
            passo: 1,
          },
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
          {
            titulo: 'Relação E = −v × B para o movimento retilíneo uniforme',
            texto: r`**O que se pede.** Mostrar que, para uma partícula atravessar em movimento retilíneo uniforme (MRU) uma região com campos $\vec E$ e $\vec B$ uniformes, é preciso que $\vec E = -\vec v\times\vec B$.

**A ideia.** MRU quer dizer velocidade constante, em módulo e em direção. Pela primeira lei de Newton, isso só acontece se a força **resultante** for zero. Na região agem a força elétrica e a magnética (formulário):
$$\vec F_{(e)} = q\vec E,\qquad\vec F_{(m)} = q\vec v\times\vec B.$$
Somadas, dão a força de Lorentz, $\vec F = q(\vec E + \vec v\times\vec B)$.

**A conta.**
$$q(\vec E + \vec v\times\vec B) = 0\quad\Rightarrow\quad\vec E = -\vec v\times\vec B.$$
(Desprezando a gravidade, e com $q \neq 0$.) A força elétrica tem de cancelar exatamente a magnética.

**O seletor de velocidades.** É o caso visto em aula, com $\vec v\perp\vec B$ e $\vec E$ perpendicular aos dois: em módulo, $E = vB$. Só passa reto quem tem $v = E/B$; as outras partículas são desviadas.

**Por que isso é uma condição sobre $\vec v$.** Os campos são fixos; a relação só vale para uma velocidade específica (em módulo e direção, na parte perpendicular a $\vec B$).`,
            passo: 0,
          },
          {
            titulo: 'Perpendicular? A velocidade precisa ser perpendicular a B?',
            texto: r`**O que se pede.** Dizer se $\vec v$ precisa ser perpendicular a $\vec B$ para que $\vec E = -\vec v\times\vec B$ possa ser satisfeita.

**A ideia.** Decomponha a velocidade em uma parte paralela a $\vec B$ e outra perpendicular: $\vec v = \vec v_\parallel + \vec v_\perp$. O produto vetorial de vetores paralelos é zero, então
$$\vec v\times\vec B = \vec v_\perp\times\vec B.$$
A parte paralela **não entra** na força magnética nem na condição.

**Resposta.** **Não.** A dedução não usou em lugar nenhum que $\vec v\perp\vec B$. Para qualquer ângulo $\beta$ entre $\vec v$ e $\vec B$, basta um campo elétrico $\vec E = -\vec v\times\vec B$, de módulo $E = vB\sin\beta$, e a partícula segue reta. O caso perpendicular é só o mais comum.

**Cuidado.** "$E = vB$" só vale com $\vec v\perp\vec B$; no geral, é $E = vB\sin\beta$.`,
            passo: 1,
          },
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
          {
            titulo: 'Trajetórias: qual é de qual partícula',
            texto: r`**O que se pede.** Quatro partículas entram com a mesma velocidade $\vec v_0$ num campo magnético uniforme: um próton, um nêutron, um elétron e uma partícula alfa (2 prótons + 2 nêutrons). Associar cada uma a uma trajetória da figura.

**A ideia.** A força magnética é $\vec F_{(m)} = q\vec v\times\vec B$ (formulário). Duas coisas decidem a trajetória:
- **o sinal da carga** decide para que lado ela curva: trocar $q$ por $-q$ inverte a força;
- **o raio da curva**: com $\vec v\perp\vec B$, a força magnética, de módulo $|q|vB$, faz o papel de força centrípeta, $\dfrac{mv^2}{r}$. Daí (não está no formulário)
$$r = \frac{mv}{|q|B}.$$
Com a mesma velocidade e o mesmo campo, o raio é proporcional à razão $m/|q|$: mais massa por carga, curva mais aberta.

**Partícula por partícula.**
- **Nêutron:** sem carga, sem força. Segue **reto**: trajetória **3**.
- **Sinal:** com $\vec B$ entrando na página e $\vec v_0$ para a direita, $\vec v\times\vec B$ aponta para **cima**. Cargas positivas (próton, alfa) curvam para cima; o **elétron**, negativo, curva para **baixo**: trajetória **4**.
- **Próton contra alfa:** a alfa tem cerca de 4 vezes a massa e 2 vezes a carga do próton, logo $m/q$ duas vezes maior e raio **2 vezes maior**: curva menos. A **alfa** é a trajetória **2**, a mais aberta das que sobem, e o **próton** é a **1**, a mais fechada.

**Repare.** O que importa é $m/q$, e não a carga sozinha. A alfa tem mais carga, mas curva **menos**. E o elétron, com massa 1836 vezes menor que a do próton, faz um círculo muito pequeno.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A força no instante inicial',
            texto: r`**O que se pede.** Módulo, direção e sentido da força magnética sobre a partícula de carga $-q$ que entra com $\vec v = v_x\hat x + v_y\hat y$ no campo $\vec B = B\hat y$.

**A ideia.** Força magnética (formulário): $\vec F_{(m)} = q\vec v\times\vec B$, aqui com a carga $-q$. Os produtos vetoriais dos unitários: $\hat x\times\hat y = \hat z$ e $\hat y\times\hat y = 0$ (vetores paralelos).

**A conta.**
$$\vec F = (-q)\big(v_x\hat x + v_y\hat y\big)\times B\hat y = -qB\big(v_x\,\hat x\times\hat y + v_y\,\hat y\times\hat y\big) = -qv_xB\,\hat z.$$

**Resposta.** Módulo $qv_xB$, na direção $z$, no sentido $-\hat z$. Só a parte da velocidade **perpendicular** ao campo ($v_x$) produz força; a parte paralela ($v_y$) não contribui.`,
            passo: 0,
          },
          {
            titulo: '(b) Por que o movimento é uma hélice',
            texto: r`**O que se pede.** Mostrar que o movimento é helicoidal e dizer qual é o eixo da hélice.

**A ideia.** Separe o movimento em duas partes: ao longo do campo ($y$) e no plano perpendicular a ele ($xz$).
- **Ao longo de $y$:** a força $q\vec v\times\vec B$ é sempre perpendicular a $\vec B$, então nunca tem componente $y$. Sem força nessa direção, $v_y$ fica **constante**: a partícula avança uniformemente ao longo de $y$.
- **No plano $xz$:** a componente de $\vec v$ nesse plano tem módulo constante $v_x$ (a força magnética não realiza trabalho, então a rapidez não muda, e $v_y$ também não). A força tem módulo constante $qv_xB$ e é sempre perpendicular a essa componente: é uma força centrípeta de módulo fixo. O resultado é um **movimento circular uniforme** no plano $xz$.

**Juntando.** Um círculo no plano perpendicular a $\vec B$, mais um avanço uniforme ao longo de $\vec B$: uma **hélice**, como uma mola.

**Resposta.** O eixo da hélice é **paralelo a $\vec B$**, ou seja, à direção $\hat y$.`,
            passo: 1,
          },
          {
            titulo: '(c) O raio e o período do círculo',
            texto: r`**O que se pede.** O raio e o período do movimento circular no plano perpendicular ao eixo.

**A ideia.** No movimento circular uniforme, a força resultante aponta para o centro e vale $\dfrac{mv^2}{R}$ (força centrípeta). Aqui ela é a força magnética, de módulo $qv_xB$, e a velocidade no círculo é $v_x$.

**A conta.**
$$qv_xB = \frac{mv_x^2}{R}\quad\Rightarrow\quad R = \frac{mv_x}{qB}.$$
O período é o tempo de uma volta, comprimento ÷ velocidade:
$$T = \frac{2\pi R}{v_x} = \frac{2\pi m}{qB}.$$

**Repare.** O período não depende da velocidade: partículas mais rápidas fazem círculos maiores, no mesmo tempo. É o princípio do cíclotron. **Cuidado:** no raio entra só $v_x$, a parte perpendicular ao campo, e não o módulo de $\vec v$.`,
            passo: 2,
          },
          {
            titulo: '(d) O passo da hélice',
            texto: r`**O que se pede.** O passo da hélice: quanto a partícula avança ao longo do eixo durante uma volta.

**A ideia.** Pelo item (b), ao longo do eixo ($y$) a velocidade é constante, $v_y$. Uma volta dura um período $T$ (item c). Distância = velocidade × tempo.

**A conta.**
$$p = v_yT = \frac{2\pi mv_y}{qB}.$$

**Conferindo.** Se $v_y = 0$ (entrada perpendicular ao campo), o passo é zero e a hélice vira um círculo fechado. Se $v_x = 0$ (entrada paralela ao campo), o raio é zero e a partícula segue em linha reta.`,
            passo: 3,
          },
          {
            titulo: '(e) O sentido de giro, visto por quem a vê chegar',
            texto: r`**O que se pede.** O sentido de rotação da partícula (horário ou anti-horário) para um observador que a vê se aproximando.

**A ideia.** Use a força do item (a) para ver para que lado a trajetória curva. Como $v_y > 0$, a partícula avança no sentido $+y$: quem a vê chegar está no lado $+y$, olhando para $-y$. Para esse observador, olhando o plano $xz$ de frente, o eixo $x$ aponta para a direita e o eixo $z$ aponta para baixo. (Os eixos $x$, $y$, $z$ formam um sistema de mão direita: com $\hat y$ apontando para o observador e $\hat x$ para a direita, $\hat z$ fica para baixo, porque $\hat x\times(-\hat z) = \hat y$.)

**O giro.** No início, a velocidade no plano é $v_x\hat x$ (para a direita) e a força é $-qv_xB\,\hat z$, que, para esse observador, aponta para **cima**. Andar para a direita e curvar para cima é girar no sentido **anti-horário**.

**Regra geral.** Vista de onde o campo aponta (com $\vec B$ vindo na direção de quem olha), uma carga positiva gira no sentido horário e uma negativa, no anti-horário. Aqui o campo aponta para o observador e a carga é negativa.

**Resposta.** **Anti-horário.**`,
            passo: 4,
          },
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
          {
            titulo: '(a) O momento de dipolo magnético da órbita',
            texto: r`**O que se pede.** Módulo, direção e sentido do momento de dipolo magnético do elétron (carga $-e$) em órbita circular de raio $a_0$ e velocidade $v$.

**A ideia.** O elétron girando é uma **espira de corrente**. Uma espira plana com $N$ voltas, corrente $I$ e área $A$ tem momento de dipolo (formulário)
$$\vec\mu = NI\vec A,$$
com $\vec A$ perpendicular ao plano da espira, no sentido dado pela **regra da mão direita**: os dedos acompanham a corrente e o polegar aponta $\vec\mu$.

**Passo 1: a corrente.** Num ponto da órbita passa uma carga $e$ a cada período $T = \dfrac{2\pi a_0}{v}$:
$$I = \frac eT = \frac{ev}{2\pi a_0}.$$

**Passo 2: o módulo.** Uma volta ($N = 1$), área $\pi a_0^2$:
$$\mu = I\pi a_0^2 = \frac{ev}{2\pi a_0}\,\pi a_0^2 = \frac{eva_0}{2}.$$

**Passo 3: direção e sentido.** Perpendicular ao plano da órbita. O sentido vem da corrente, e a corrente de uma carga **negativa** circula **ao contrário** do elétron. O momento angular do elétron, $\vec L = m_e\vec r\times\vec v$, segue o sentido do movimento pela mesma regra da mão direita. Então $\vec\mu$ aponta **contra** $\vec L$.`,
            passo: 0,
          },
          {
            titulo: '(b) A razão giromagnética',
            texto: r`**O que se pede.** A razão $\mu/L$ entre o momento de dipolo magnético e o momento angular orbital do elétron.

**A ideia.** O momento angular de uma partícula em movimento circular uniforme tem módulo $L = mvr$: massa × velocidade × raio, porque $\vec r$ e $\vec v$ são perpendiculares.

**A conta.** Com $L = m_eva_0$ e $\mu$ do item (a):
$$\frac{\mu}{L} = \frac{eva_0/2}{m_eva_0} = \frac{e}{2m_e}.$$

**Interpretação.** A velocidade e o raio cancelaram: a razão só depende da carga e da massa do elétron. Qualquer órbita, rápida ou lenta, grande ou pequena, tem a mesma razão. Em forma vetorial, com o sinal do item (a):
$$\vec\mu = -\frac{e}{2m_e}\vec L.$$
Essa relação é a base do magnetismo atômico: o momento magnético de um átomo é proporcional ao momento angular dos seus elétrons.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A velocidade na entrada do campo',
            texto: r`**O que se pede.** A velocidade das partículas (carga $q$, massa $m$) depois de aceleradas do repouso por uma diferença de potencial $V$.

**A ideia.** Conservação de energia. Ao atravessar uma diferença de potencial $V$, a carga perde energia potencial $qV$ (o potencial é energia por carga), e essa energia vira cinética.

**A conta.** Partindo do repouso:
$$qV = \frac12mv^2\quad\Rightarrow\quad v = \sqrt{\frac{2qV}{m}}.$$

**Repare.** Todas as partículas de mesma carga ganham a **mesma energia**; as mais leves saem mais rápidas.`,
            passo: 0,
          },
          {
            titulo: '(b) A massa a partir do raio',
            texto: r`**O que se pede.** A massa $m$ em função de $B$, $V$, $R$ e $q$, sabendo o raio $R$ da trajetória circular no campo.

**A ideia.** No campo magnético, com a velocidade perpendicular a $\vec B$, a força magnética $qvB$ (formulário: $\vec F_{(m)} = q\vec v\times\vec B$) é a força centrípeta $\dfrac{mv^2}{R}$ de um movimento circular uniforme.

**A conta.**
$$qvB = \frac{mv^2}{R}\quad\Rightarrow\quad R = \frac{mv}{qB}.$$
Com a velocidade do item (a):
$$R = \frac{m}{qB}\sqrt{\frac{2qV}{m}} = \frac1B\sqrt{\frac{2mV}{q}}.$$
Elevando ao quadrado e isolando $m$:
$$R^2B^2 = \frac{2mV}{q}\quad\Rightarrow\quad m = \frac{qR^2B^2}{2V}.$$

**É assim que o aparelho "pesa" íons.** Conhecendo $q$, $V$ e $B$ e medindo onde cada íon bate no anteparo (que dá $R$), obtém-se a massa.`,
            passo: 1,
          },
          {
            titulo: '(c) A razão entre os raios dos dois isótopos',
            texto: r`**O que se pede.** A razão entre os raios das trajetórias dos íons ¹²C⁺ e ¹⁴C⁺, num feixe com os dois misturados.

**A ideia.** Pelo item (b), $R = \dfrac1B\sqrt{\dfrac{2mV}{q}}$. Os dois íons têm a **mesma carga** ($+e$, um elétron a menos) e passam pelos mesmos $V$ e $B$. Então só a massa muda, e o raio é proporcional a $\sqrt m$. As massas estão na razão $12:14$.

**A conta.**
$$\frac{R_{12}}{R_{14}} = \sqrt{\frac{m_{12}}{m_{14}}} = \sqrt{\frac{12}{14}} = \sqrt{\frac67} \approx 0{,}93.$$

**Cuidado.** O raio **não** é proporcional à massa: os dois íons ganham a mesma energia, e o mais leve sai mais rápido. Esse efeito compensa parte da diferença, e sobra a raiz. Os dois isótopos batem no anteparo em pontos separados por $2(R_{14} - R_{12})$, o diâmetro de cada semicírculo.`,
            passo: 2,
          },
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
          {
            titulo: 'Ordem das forças nos quatro fios',
            texto: r`**O que se pede.** Quatro fios de formas diferentes levam a mesma corrente $I$ do ponto $A$ ao ponto $B$, num campo magnético uniforme vertical (para cima). Ordenar, do menor para o maior, os módulos $F_i$ da força magnética total em cada um.

**A ideia.** A força num pedacinho de fio é (formulário)
$$d\vec F_{(m)} = I\,d\vec\ell\times\vec B,$$
com $d\vec\ell$ apontando no sentido da corrente. A força total é a soma sobre o fio todo. Se $\vec B$ é **uniforme** (o mesmo em todo lugar), ele sai da integral:
$$\vec F = I\left(\int_A^Bd\vec\ell\right)\times\vec B = I\,\overrightarrow{AB}\times\vec B.$$
A soma de todos os pedacinhos $d\vec\ell$ de $A$ até $B$ é simplesmente o vetor que vai de $A$ a $B$, **qualquer que seja o formato** do caminho. Então, num campo uniforme, a força só depende dos pontos de início e de fim.

**Então as quatro forças são iguais?** Não: cada desenho da figura tem os **seus próprios** pontos $A$ e $B$, em posições diferentes. O que conta é o vetor de $A$ até $B$ em cada desenho.

**Só a parte horizontal conta.** Com $\vec B$ vertical, a parte vertical do vetor início → fim é paralela ao campo e não dá força. Sobra a parte horizontal, de comprimento $\Delta x$:
$$F = I\,\Delta x\,B.$$

**Lendo a figura.** As distâncias horizontais entre início e fim são cerca de $2$ m (IV), $3$ m (I), $3{,}5$ m (II) e $4$ m (III). Então
$$F_{IV} < F_I < F_{II} < F_{III}.$$

**Cuidado.** O comprimento do fio não importa: o fio IV é o mais longo e recebe a **menor** força.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A força com B ao longo de y',
            texto: r`**O que se pede.** A força magnética total sobre o fio: dois trechos retos de comprimento $L$, paralelos ao eixo $Y$, ligados por um semicírculo de raio $a$ no plano $XZ$, com corrente $I$, no campo $\vec B = B\hat y$.

**A ideia.** A força num pedacinho de fio é (formulário) $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$. Com $\vec B$ **uniforme**, ele sai da integral, e a força num trecho qualquer é
$$\vec F = I\,\vec d\times\vec B,$$
em que $\vec d$ é o vetor do início ao fim do trecho. O formato do caminho não importa.

**Trecho por trecho.**
- **Trechos retos:** são paralelos ao eixo $Y$, logo paralelos a $\vec B$. O produto vetorial de vetores paralelos é zero: **força nula**.
- **Semicírculo:** vai de uma ponta à outra de um diâmetro. Pela figura, a corrente o percorre do ponto $x = a$ ao ponto $x = -a$, então $\vec d = -2a\,\hat x$:
$$\vec F = I(-2a\,\hat x)\times B\hat y = -2IaB\,(\hat x\times\hat y) = -2IaB\,\hat z.$$

**Resposta.** $\vec F = -2IaB\,\hat z$: módulo $2IaB$, no sentido $-z$. Integrar o semicírculo ponto a ponto daria o mesmo, com muito mais conta e mais chance de errar o sinal.`,
            passo: 0,
          },
          {
            titulo: '(b) A força com B ao longo de x',
            texto: r`**O que se pede.** A força total no mesmo fio, agora com o campo $\vec B = B\hat x$.

**A ideia.** O mesmo atalho para campo uniforme: em cada trecho, $\vec F = I\,\vec d\times\vec B$, com $\vec d$ do início ao fim do trecho.

**Trecho por trecho.**
- **Semicírculo:** $\vec d = -2a\,\hat x$ agora é **paralelo** a $\vec B$: força nula.
- **Cada trecho reto:** pela figura, a corrente percorre os dois no sentido $+\hat y$ (um chega ao semicírculo e o outro sai dele, ambos subindo), com $\vec d = L\,\hat y$:
$$\vec F_\text{reto} = I(L\hat y)\times B\hat x = ILB\,(\hat y\times\hat x) = -ILB\,\hat z.$$
Os dois retos dão a mesma força.

**A conta.**
$$\vec F = 2\times(-ILB\,\hat z) = -2ILB\,\hat z.$$

**Repare.** Ao trocar a direção do campo, os papéis se invertem: antes só o semicírculo sentia força; agora só os retos.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A corrente que segura a barra',
            texto: r`**O que se pede.** Intensidade e sentido da corrente na barra (massa $M$, comprimento $L$) para ela ficar parada no plano inclinado sem atrito, de ângulo $\theta$, com um campo $\vec B$ **vertical**, para cima.

**A ideia.** Parada quer dizer força resultante zero. Agem três forças:
- o **peso** $Mg$, vertical para baixo;
- a **normal** $N$, perpendicular ao plano (não há atrito);
- a **força magnética** na barra. Num trecho reto num campo uniforme, $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$ (formulário) dá $\vec F = I\vec L\times\vec B$, com $\vec L$ ao longo da barra, no sentido da corrente. A barra é horizontal e $\vec B$ é vertical, então $\vec F$ é **horizontal** (perpendicular aos dois) e tem módulo $ILB$.

**Montagem.** Decomponha as forças ao longo do plano (a direção em que a barra poderia escorregar). Ao longo do plano, a normal não tem componente.
- O peso puxa plano abaixo com $Mg\sin\theta$.
- A força magnética, horizontal e apontando para o lado em que o plano sobe, empurra plano acima com $ILB\cos\theta$ (a horizontal faz ângulo $\theta$ com o plano).

**A conta.**
$$Mg\sin\theta = ILB\cos\theta\quad\Rightarrow\quad I = \frac{Mg\tan\theta}{BL}.$$

**O sentido.** A força magnética tem de apontar na horizontal **para o lado em que o plano sobe**, para ter uma componente plano acima. Pela regra $\vec F = I\vec L\times\vec B$ com $\vec B$ para cima, isso pede, na figura, a corrente **da direita para a esquerda**.

**Conferindo.** Com o plano na horizontal ($\theta = 0$), $\tan\theta = 0$ e não é preciso corrente nenhuma: a barra já não escorrega. O gabarito da monitoria dá $I = \dfrac{Mg}{BL\tan\theta}$, que iria ao infinito nesse caso; o certo é com $\tan\theta$ no numerador.`,
            passo: 1,
          },
          {
            titulo: '(b) A força que o plano faz na barra',
            texto: r`**O que se pede.** A intensidade da força normal que o plano exerce sobre a barra em equilíbrio.

**A ideia.** O equilíbrio na direção **perpendicular** ao plano: a normal equilibra as componentes do peso e da força magnética que apertam a barra contra o plano.

**Montagem.** Perpendicular ao plano:
- o peso aperta a barra contra o plano com $Mg\cos\theta$;
- a força magnética, horizontal, também aperta, com $F\sin\theta$, em que $F = ILB = Mg\tan\theta$ (item a).

**A conta.**
$$N = Mg\cos\theta + Mg\tan\theta\sin\theta = Mg\,\frac{\cos^2\theta + \sin^2\theta}{\cos\theta} = \frac{Mg}{\cos\theta}.$$

**Outro jeito de ver.** O peso (vertical, $Mg$) e a força magnética (horizontal, $Mg\tan\theta$) somam um vetor de módulo $\sqrt{(Mg)^2 + (Mg\tan\theta)^2} = \dfrac{Mg}{\cos\theta}$, que aponta perpendicular ao plano. A normal tem de cancelá-lo sozinha. A normal é maior que o peso: a força magnética também empurra a barra contra o plano.`,
            passo: 2,
          },
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
        { rotulo: 'Trabalho do torque daqui até θ = π', simbolo: r`W = IabB_0(1 + \cos\theta)`, expr: '1e3*I0*a*b*B0*(1 + cos(rad(th)))', unidade: 'mJ' },
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
          texto: r`**Sim.** As forças $I\,d\vec l\times\vec B$ nos lados são transmitidas ao fio e giram a espira, que ganha energia cinética. O torque realiza
$$W = \int_{\theta_i}^{\theta_f}\tau_z\,d\theta = IabB_0(\cos\theta_i - \cos\theta_f) = -\Delta U.$$
Daqui ($\theta = 60°$, $U = IabB_0/2$) até o equilíbrio estável ($\theta = \pi$, $U = -IabB_0$), $W = \tfrac32 IabB_0$. O que continua valendo é que a força magnética **total** sobre cada portador não realiza trabalho: com a espira girando, os portadores também andam com o fio, e essa parte de $q\vec v\times\vec B$ empurra contra $I$ (é a fem induzida). As duas parcelas se cancelam, e a energia da rotação vem da fonte, que mantém $I$ contra essa fem.`,
          parametros: { th: 60 },
          medidas: [0, 4, 5],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec\mu = Iab(\sin\theta\,\hat x - \cos\theta\,\hat y)$` },
        { item: '(b)', texto: r`$\vec\tau = IabB_0\sin\theta\,\hat z$` },
        { item: '(c)', texto: r`Anti-horário visto de $+z$ ($\theta$ aumenta).` },
        { item: '(d)', texto: r`Estável em $\theta = \pi$; instável em $\theta = 0$.` },
        { item: '(e)', texto: r`Sim: $W = IabB_0(\cos\theta_i - \cos\theta_f) = -\Delta U$. A força magnética total sobre os portadores não realiza trabalho; a energia vem da fonte, que mantém $I$ contra a fem induzida pela rotação.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Torque numa espira', lab: 'forcas' }],
        etapas: [
          {
            titulo: '(a) O momento de dipolo magnético da espira',
            texto: r`**O que se pede.** O vetor momento de dipolo magnético da espira retangular (lados $a$ e $b$), com um lado sobre o eixo $Z$ e o plano fazendo ângulo $\theta$ com o plano $XZ$, corrente $I$ no sentido da figura.

**A ideia.** Para uma espira plana (formulário):
$$\vec\mu = NI\vec A.$$
Aqui $N = 1$ e a área é $ab$. O vetor $\vec A$ é **perpendicular** ao plano da espira, com sentido dado pela **regra da mão direita**: dedos curvados no sentido da corrente, polegar no sentido de $\vec A$.

**Montagem.** O plano da espira contém duas direções:
- o eixo $Z$ (o lado que está sobre ele), $\hat z$;
- a direção do outro lado, que sai do eixo $Z$ no plano $XY$ fazendo ângulo $\theta$ com o eixo $X$: $\hat u = \cos\theta\,\hat x + \sin\theta\,\hat y$.

A normal ao plano é perpendicular às duas. Com a corrente **descendo** no lado sobre o eixo $Z$ (como na figura), a regra da mão direita dá a normal $\hat n = \hat u\times\hat z$.

**A conta.** Com $\hat x\times\hat z = -\hat y$ e $\hat y\times\hat z = \hat x$:
$$\hat n = \cos\theta\,(\hat x\times\hat z) + \sin\theta\,(\hat y\times\hat z) = \sin\theta\,\hat x - \cos\theta\,\hat y.$$
$$\vec\mu = Iab\,\big(\sin\theta\,\hat x - \cos\theta\,\hat y\big).$$

**Conferindo.** Com $\theta = 0$, a espira está no plano $XZ$ e $\vec\mu = -Iab\,\hat y$, perpendicular a esse plano, como deve ser.`,
            passo: 0,
          },
          {
            titulo: '(b) O torque do campo sobre a espira',
            texto: r`**O que se pede.** O vetor torque que o campo $\vec B = B_0\hat y$ exerce sobre a espira.

**A ideia.** O torque sobre um dipolo magnético num campo uniforme é (formulário)
$$\vec\tau = \vec\mu\times\vec B.$$
Ele vem de somar $\vec r\times d\vec F$ nas forças $I\,d\vec\ell\times\vec B$ dos quatro lados; o formulário já dá o resultado pronto.

**A conta.** Com $\hat x\times\hat y = \hat z$ e $\hat y\times\hat y = 0$:
$$\vec\tau = Iab\big(\sin\theta\,\hat x - \cos\theta\,\hat y\big)\times B_0\hat y = IabB_0\sin\theta\,(\hat x\times\hat y) = IabB_0\sin\theta\,\hat z.$$

**Conferindo.** O torque aponta ao longo do eixo $Z$, que é o lado fixo da espira: é em volta dele que ela gira. Ele é zero com $\theta = 0$ ou $\theta = \pi$, quando $\vec\mu$ é paralelo ao campo.`,
            passo: 1,
          },
          {
            titulo: '(c) O sentido de rotação',
            texto: r`**O que se pede.** Para que lado o torque do item (b) gira a espira.

**A ideia.** Um torque ao longo de $+\hat z$ gira o objeto no sentido **anti-horário** para quem olha de cima (de $+z$ para baixo): é a regra da mão direita com o polegar em $\hat z$.

**Aplicando.** Para $0 < \theta < \pi$, $\sin\theta > 0$ e $\tau_z > 0$: a espira gira no sentido **anti-horário** visto de $+z$, ou seja, o ângulo $\theta$ **aumenta**.

**Para onde ela vai.** O giro leva $\vec\mu$ em direção ao campo. Com $\theta$ aumentando até $\pi$, $\vec\mu = Iab(\sin\theta\,\hat x - \cos\theta\,\hat y)$ chega a $+Iab\,\hat y$, paralelo a $\vec B$. Um dipolo magnético, como uma bússola, tende a se alinhar com o campo.`,
            passo: 2,
          },
          {
            titulo: '(d) Os equilíbrios estável e instável',
            texto: r`**O que se pede.** As posições de equilíbrio estável e instável da espira.

**A ideia.** Equilíbrio é onde o torque é zero: pelo item (b), $\sin\theta = 0$, ou seja, $\theta = 0$ ou $\theta = \pi$. Para saber qual é estável, olhe a energia do dipolo no campo:
$$U = -\vec\mu\cdot\vec B.$$
(Não está no formulário da P2; é a mesma forma de $U = -\vec p\cdot\vec E$ do dipolo elétrico, que está no da P1.) Equilíbrio estável é mínimo de energia; instável é máximo.

**A conta.** $\vec\mu\cdot\vec B = Iab(-\cos\theta)B_0$, então
$$U = IabB_0\cos\theta.$$
- $\theta = \pi$: $U = -IabB_0$, o **mínimo**. Aí $\vec\mu = +Iab\,\hat y$ é **paralelo** a $\vec B$: equilíbrio **estável**.
- $\theta = 0$: $U = +IabB_0$, o **máximo**. Aí $\vec\mu$ é **antiparalelo** a $\vec B$: equilíbrio **instável**.

**Cuidado.** $\theta$ é o ângulo do plano da espira com o plano $XZ$, **não** o ângulo entre $\vec\mu$ e $\vec B$. Quem confunde os dois troca o estável pelo instável.`,
            passo: 3,
          },
          {
            titulo: '(e) O torque realiza trabalho?',
            texto: r`**O que se pede.** Discutir se o torque das forças magnéticas realiza trabalho enquanto a espira gira.

**A ideia.** Um torque $\tau$ que gira um objeto de um ângulo $d\theta$ realiza o trabalho $dW = \tau\,d\theta$, como uma força realiza $F\,dx$.

**A conta.** Com $\tau_z = IabB_0\sin\theta$ (item b), de $\theta_i$ a $\theta_f$:
$$W = \int_{\theta_i}^{\theta_f}IabB_0\sin\theta\,d\theta = IabB_0\big(\cos\theta_i - \cos\theta_f\big) = -\Delta U,$$
com $U = IabB_0\cos\theta$ do item (d). Por exemplo, de $\theta = 60°$ ($U = IabB_0/2$) até o equilíbrio estável ($\theta = \pi$, $U = -IabB_0$), $W = \tfrac32IabB_0$, que vira energia cinética de rotação.

**Resposta.** **Sim**, o torque realiza trabalho: a espira parte do repouso e ganha energia cinética.

**Mas a força magnética não "não realiza trabalho"?** Isso vale para a força **total** sobre cada carga em movimento, $q\vec v\times\vec B$, sempre perpendicular à velocidade **total** da carga. Com a espira girando, cada portador de carga tem duas velocidades: ao longo do fio (é a corrente) e junto com o fio (a rotação). A parte da força que gira o fio realiza trabalho positivo; a outra parte empurra os portadores contra a corrente (é a **fem induzida** pela rotação) e realiza um trabalho negativo igual. A energia que aparece na rotação vem da **fonte** que mantém a corrente $I$ contra essa fem.

**Sobre o gabarito.** O gabarito da monitoria diz que não há trabalho. Isso confunde a força total sobre os portadores (que de fato não trabalha) com o torque sobre a espira (que trabalha).`,
            passo: 4,
          },
        ],
        resultado: r`$\vec\mu = Iab(\sin\theta\hat x - \cos\theta\hat y)$; $\vec\tau = IabB_0\sin\theta\hat z$; estável em $\pi$; o torque realiza $W = -\Delta U$, pago pela fonte.`,
        errosComuns: [
          'Tomar $\\theta$ como o ângulo entre $\\vec\\mu$ e $\\vec B$ e trocar os equilíbrios.',
          'Concluir que o torque não realiza trabalho porque a força magnética sobre uma carga é perpendicular à velocidade dela: a espira ganha energia cinética, e quem a fornece é a fonte da corrente.',
        ],
        oficial: {
          resposta: 'μ = Iab(sen θ x̂ − cos θ ŷ); τ = IabB₀ sen θ ẑ; rotação anti-horária; estável em θ = π e instável em θ = 0; a força magnética não realiza trabalho.',
          observacao: 'O enunciado escreve o campo como B₀y ŷ e o chama de constante; aqui ele é B₀ ŷ, como no gabarito. Divergência no item (e): o gabarito diz que não há trabalho, mas a espira ganha energia cinética, e o torque realiza W = −ΔU = IabB₀(cos θᵢ − cos θ_f). O que não realiza trabalho é a força magnética total sobre os portadores; a energia vem da fonte da corrente, como o próprio gabarito diz.',
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
          {
            titulo: '(a) A força do ímã sobre o anel',
            texto: r`**O que se pede.** O vetor força magnética total sobre o anel de raio $r$, com corrente $I$ no sentido da figura, colocado acima de um ímã em barra. No anel, o campo do ímã tem módulo $B$ constante e faz ângulo $\theta$ com a vertical, abrindo-se para fora.

**A ideia.** A força num pedacinho de fio é (formulário) $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$. Aqui o campo **não** é uniforme (muda de direção em volta do anel), então não dá para usar o atalho do campo uniforme; é preciso somar pedacinho a pedacinho. Ajuda decompor $\vec B$ em cada ponto do anel em duas partes:
- uma **vertical**, $B\cos\theta$, para cima;
- uma **radial**, $B\sin\theta$, apontando para fora do eixo.

**A parte vertical.** $d\vec\ell$ é tangente ao anel, então $d\vec\ell\times(\text{vertical})$ aponta na direção **radial** (para dentro ou para fora). Em pontos opostos do anel, essas forças radiais apontam em sentidos opostos e **se cancelam** na soma.

**A parte radial.** $d\vec\ell$ (tangente) e a parte radial de $\vec B$ são perpendiculares, e ambos estão no plano horizontal. O produto vetorial deles é **vertical**, com módulo $I\,d\ell\,B\sin\theta$. Com a corrente no sentido da figura (horário visto de cima), ele aponta **para cima** em todos os pontos do anel, então essas forças **se somam**.

**A conta.** Somando ao longo do anel, $\oint d\ell = 2\pi r$:
$$\vec F = 2\pi rIB\sin\theta\,\hat z,$$
vertical, para cima: o ímã **repele** o anel.`,
            passo: 1,
          },
          {
            titulo: '(b) Em termos do momento de dipolo, e os polos',
            texto: r`**O que se pede.** Escrever a força do item (a) usando o momento de dipolo magnético do anel e interpretar com polos magnéticos.

**A ideia.** O anel é uma espira de corrente, com momento de dipolo (formulário) $\vec\mu = NI\vec A$: $N = 1$, área $\pi r^2$, e o sentido pela regra da mão direita. Com a corrente **horária** vista de cima, o polegar aponta para **baixo**:
$$\vec\mu = -I\pi r^2\,\hat z.$$

**A conta.** Como $2\pi rI = \dfrac{2}{r}\cdot I\pi r^2 = \dfrac{2\mu}{r}$ (em módulo), e $\vec\mu$ aponta para baixo enquanto $\vec F$ aponta para cima:
$$\vec F = -\frac{2\vec\mu\,B\sin\theta}{r}.$$
A força é oposta a $\vec\mu$.

**Com polos.** Uma espira de corrente se comporta como um pequeno ímã: o polo **norte** fica do lado para onde aponta $\vec\mu$. Aqui $\vec\mu$ aponta para baixo, então o anel tem o polo **N voltado para baixo**, de frente para o ímã. As linhas do ímã saem do polo de cima e se abrem para cima e para fora: o polo de cima do ímã também é um **N**. Dois polos norte frente a frente se **repelem**, como achado no item (a).`,
            passo: 2,
          },
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
          {
            titulo: '(a) A velocidade de arraste dos portadores',
            texto: r`**O que se pede.** Módulo, direção e sentido da velocidade de arraste dos portadores (carga $q > 0$, $n$ por volume) na fita de seção $A$ com corrente $I$. Na figura, a corrente vai ao longo de $+x$, e o campo $\vec B$ aponta para $+y$.

**A ideia.** A densidade de corrente é (formulário) $\vec J = nq\vec v$, e a corrente é $J$ vezes a área da seção ($I = \int_S\vec J\cdot d\vec A$, com $J$ uniforme). Então $I = nqv_dA$.

**A conta.**
$$v_d = \frac{I}{nqA},\qquad\vec v_d = \frac{I}{nqA}\,\hat x.$$
Portadores positivos andam **no sentido da corrente**.

**Em números.** Num metal como o cobre ($n \approx 8{,}5\times10^{28}$ m⁻³), com correntes comuns, $v_d$ é de frações de milímetro por segundo.`,
            passo: 0,
          },
          {
            titulo: '(b) A força magnética num portador',
            texto: r`**O que se pede.** A intensidade da força magnética sobre um portador que anda com a velocidade de arraste.

**A ideia.** Força magnética (formulário): $\vec F_{(m)} = q\vec v\times\vec B$.

**A conta.** Com $\vec v_d = v_d\,\hat x$ e $\vec B = B\,\hat y$, e $\hat x\times\hat y = \hat z$:
$$\vec F = qv_dB\,\hat z,\qquad F = qv_dB = q\frac{I}{nqA}B = \frac{IB}{nA}.$$
A força aponta para $+z$, na direção da **largura** da fita, empurrando os portadores para uma das bordas (a de cima, na figura).`,
            passo: 0,
          },
          {
            titulo: '(c) Os sinais das cargas nas bordas',
            texto: r`**O que se pede.** O sinal das cargas que se acumulam em cada borda, por causa do desvio dos portadores.

**A ideia.** Pelo item (b), os portadores positivos são empurrados para a borda de **cima** ($+z$). Eles se acumulam lá. A fita como um todo continua neutra, então a borda de baixo fica com falta de portadores positivos.

**Resposta.** Borda de **cima**: positiva. Borda de **baixo**: negativa.`,
            passo: 1,
          },
          {
            titulo: '(d) O campo elétrico no equilíbrio',
            texto: r`**O que se pede.** O campo elétrico criado pelas cargas das bordas, quando o desvio para (equilíbrio).

**A ideia.** As cargas acumuladas criam um campo elétrico na fita, da borda positiva (cima) para a negativa (baixo): para $-\hat z$. Ele empurra os portadores positivos para baixo, contra a força magnética. O acúmulo cresce até que as duas forças se equilibrem; daí em diante os portadores andam retos. É a condição do **seletor de velocidades**: força total $q(\vec E + \vec v\times\vec B) = 0$ (formulário: $\vec F_{(e)} = q\vec E$ e $\vec F_{(m)} = q\vec v\times\vec B$).

**A conta.**
$$q\vec E + qv_dB\,\hat z = 0\quad\Rightarrow\quad\vec E = -v_dB\,\hat z = -\frac{IB}{nqA}\,\hat z.$$
Módulo $\dfrac{IB}{nqA}$, transversal à fita, apontando da borda de cima para a de baixo.`,
            passo: 2,
          },
          {
            titulo: '(e) A diferença de potencial entre as bordas',
            texto: r`**O que se pede.** A diferença de potencial entre as bordas, no equilíbrio (a **tensão Hall**).

**A ideia.** O campo do item (d) é uniforme ao longo da largura $d$ da fita. Num campo uniforme, a diferença de potencial é campo × distância (de $\vec E = -\vec\nabla V$, do formulário). O potencial cai no sentido do campo.

**A conta.**
$$V = Ed = \frac{IBd}{nqA}.$$
A borda de **cima** (positiva, de onde o campo sai) está no potencial **mais alto**.

**Para que serve.** Medindo $V$, $I$ e $B$, obtém-se $n$, o número de portadores por volume do material. Ou, conhecendo o material, mede-se $B$: é o princípio dos sensores Hall de campo magnético.`,
            passo: 2,
          },
          {
            titulo: '(f) A razão entre a tensão transversal e a corrente',
            texto: r`**O que se pede.** A razão entre a tensão transversal do item (e) e a corrente longitudinal $I$ (o enunciado a chama de magnetorresistência; o nome usual é **resistência Hall**).

**A conta.** Dividindo o item (e) por $I$:
$$\frac VI = \frac{Bd}{nqA}.$$

**Interpretação.** Não depende da corrente: é uma propriedade da fita e do campo. Cresce linearmente com $B$ e é maior em materiais com **poucos** portadores (como os semicondutores), por isso os sensores Hall usam semicondutores, e não metais.`,
            passo: 3,
          },
          {
            titulo: '(g) Se os portadores fossem negativos',
            texto: r`**O que se pede.** O que mudaria nas respostas se os portadores tivessem carga negativa, $-q$.

**A ideia.** Refazer cada passo com o sinal trocado.
- **Arraste:** pelo formulário, $\vec J = nq\vec v$; com carga negativa, para a mesma corrente em $+x$, os portadores andam em $-x$: $\vec v_d = -\dfrac{I}{nqA}\hat x$. Mesmo módulo.
- **Força:** $(-q)(-v_d\hat x)\times B\hat y = +qv_dB\,\hat z$. Os dois sinais de menos se cancelam: a força continua para **cima**, com o mesmo módulo.
- **Bordas:** agora são os portadores **negativos** que se acumulam em cima. A borda de cima fica **negativa** e a de baixo, positiva.
- **Campo e tensão:** o campo aponta de baixo para cima, $\vec E = +\dfrac{IB}{nqA}\hat z$, e a borda de cima fica no potencial **mais baixo**. Os módulos de $E$, $V$ e $V/I$ não mudam.

**Resposta.** Mudam os sentidos de $\vec v_d$ e de $\vec E$, os sinais das bordas e o sinal da tensão Hall; os módulos ficam iguais. É exatamente por isso que o efeito Hall revela o **sinal** dos portadores de um material: foi assim que se confirmou que, nos metais, quem carrega a corrente são os elétrons.`,
            passo: 4,
          },
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
          {
            titulo: 'Ordem dos potenciais em A, B e C',
            texto: r`**O que se pede.** Numa fita de cobre com corrente $i$ (para a direita, na figura) e campo $\vec B_0$ saindo do plano da fita, ordenar do maior para o menor os potenciais nos pontos $A$ (borda de cima), $B$ e $C$ (borda de baixo, com $C$ mais adiante no sentido da corrente). No cobre, os portadores são **elétrons**.

**Duas coisas acontecem ao mesmo tempo.**

**1. O efeito Hall (de A para B).** Os elétrons, negativos, andam **contra** a corrente: para a **esquerda**. A força sobre eles (formulário: $\vec F_{(m)} = q\vec v\times\vec B$, com $q = -e$) é:
- $\vec v\times\vec B_0$, com $\vec v$ para a esquerda e $\vec B_0$ saindo, aponta para **cima**;
- multiplicando por $-e$, a força aponta para **baixo**.

Os elétrons se acumulam na borda de **baixo**, que fica negativa; a de cima fica positiva. O campo dessas cargas aponta de cima para baixo, e o potencial cai nesse sentido. Então $V_A > V_B$. A diferença é a tensão Hall, $v_dB_0w$ (com $w$ a largura da fita), pequena no cobre.

**2. A queda ao longo da corrente (de B para C).** $B$ e $C$ estão na mesma borda, mas $C$ fica **adiante** no sentido da corrente. Como em qualquer resistor, a corrente anda do potencial mais alto para o mais baixo: há um campo ao longo da fita empurrando a corrente (formulário: $\vec J = \vec E/\rho$). Então $V_B > V_C$.

**Resposta.**
$$V_A > V_B > V_C.$$

**Cuidados.** Quem trata os portadores como positivos põe a borda de baixo mais alta e inverte $A$ e $B$. E $B$ e $C$, na mesma borda, **não** têm o mesmo potencial, por causa da queda ôhmica ao longo da fita.`,
            passo: 1,
          },
        ],
        resultado: r`$V_A > V_B > V_C$.`,
        errosComuns: ['Tratar os portadores como positivos e pôr a borda de baixo mais alta.', 'Achar que B e C, na mesma borda, têm o mesmo potencial.'],
        oficial: { resposta: 'O gabarito só identifica o tema (efeito Hall), sem a ordem.', observacao: 'Resposta desta bancada.' },
      },
    },
  ],
}

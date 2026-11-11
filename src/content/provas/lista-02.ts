import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Exercício 4: o cubo carregado como 27 cargas iguais numa grade 3×3×3. */
const GRADE = [-1, 0, 1]
const cubo4 = GRADE.flatMap((i) =>
  GRADE.flatMap((j) =>
    GRADE.map((k) => ({
      id: `q${i + 1}${j + 1}${k + 1}`,
      tipo: 'carga' as const,
      q: 'Q0/27',
      pos: [`${i}*l/3`, `${j}*l/3`, `${k}*l/3`] as [string, string, string],
    })),
  ),
)

/* Exercício 6: um anel ou um disco (20 anéis com carga ∝ r) e as outras distribuições, uma de cada vez. */
const DISCO = 20
const disco6 = Array.from({ length: DISCO }, (_, k) => ({
  id: `d${k}`,
  tipo: 'anelCarga' as const,
  ativo: 'dist == 3',
  Q: `Q0*${(2 * (k + 0.5)) / (DISCO * DISCO)}`,
  centro: [0, 0, 0] as [number, number, number],
  raio: `0.02*${(k + 0.5) / DISCO}`,
  normal: 'z' as const,
}))

/* Exercício 10: a placa como 20 folhas finas de densidade ρh, nos meios das camadas. */
const FOLHAS = 20
const folhas10 = Array.from({ length: FOLHAS }, (_, k) => ({
  id: `f${k}`,
  tipo: 'planoInfinito' as const,
  sigma: `rho0*2*d/${FOLHAS}`,
  ponto: [0, 0, `d*(${(2 * (k + 0.5)) / FOLHAS} - 1)`] as [number, number, string],
  normal: 'z' as const,
}))
const E10 = 'abs(zp) <= d ? rho0*zp/eps0 : rho0*d*sign(zp)/eps0'

/* Exercício 12: átomo desenhado com raio Rs; o campo real sai multiplicando por (Rs/a0)². */
const ESC12 = '(Rs/a0)^2'

export const lista_02: ProvaInput = {
  id: 'lista-02',
  titulo: 'Lista 2 · Lei de Gauss',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Fluxo por quatro superfícies fechadas',
      resumo: 'Só a carga de dentro conta: Φ₁ = −Q/ε₀, Φ₂ = 0, Φ₃ = −2Q/ε₀, Φ₄ = 0.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.447] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, -2, 13], alvo: [0, 0, 0] } },
      parametros: [{ id: 'Q', rotulo: 'Carga Q', simbolo: 'Q', valor: 1e-10, unidade: 'C', min: 2e-11, max: 5e-10, passo: 1e-11 }],
      objetos: [
        { id: 'qa', tipo: 'carga', q: '0-2*Q', pos: [0, 0.02, 0], rotulo: '−2Q' },
        { id: 'qb', tipo: 'carga', q: 'Q', pos: [0, 0, 0], rotulo: '+Q' },
        { id: 'qc', tipo: 'carga', q: '0-Q', pos: [0, -0.02, 0], rotulo: '−Q' },
        { id: 'S1', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0.01, 0], raio: 0.017, rotulo: 'S₁' },
        { id: 'S2', tipo: 'gaussiana', forma: 'esfera', centro: [0, -0.01, 0], raio: 0.017, rotulo: 'S₂' },
        { id: 'S3', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 0.035, rotulo: 'S₃' },
        { id: 'S4', tipo: 'gaussiana', forma: 'esfera', centro: [-0.047, 0, 0], raio: 0.009, rotulo: 'S₄' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Fluxo por S₁', simbolo: r`\Phi_1`, expr: "fluxo('S1')", unidade: 'V·m', teoria: '0-Q/eps0' },
        { rotulo: 'Fluxo por S₂', simbolo: r`\Phi_2`, expr: "fluxo('S2')", unidade: 'V·m', teoria: 0 },
        { rotulo: 'Fluxo por S₃', simbolo: r`\Phi_3`, expr: "fluxo('S3')", unidade: 'V·m', teoria: '0-2*Q/eps0' },
        { rotulo: 'Fluxo por S₄', simbolo: r`\Phi_4`, expr: "fluxo('S4')", unidade: 'V·m', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Lei de Gauss',
          texto: r`$\displaystyle\oint\vec E\cdot d\vec A = \frac{q_\text{int}}{\varepsilon_0}$, com o campo **de todas** as cargas, mas só a carga de dentro na conta. A forma da superfície não importa: a cena troca as curvas da figura por esferas que envolvem as mesmas cargas.`,
        },
        {
          titulo: 'As quatro superfícies',
          texto: r`$S_1$ envolve $-2Q$ e $+Q$: $\Phi_1 = -Q/\varepsilon_0$. $S_2$ envolve $+Q$ e $-Q$: zero. $S_3$ envolve as três: $-2Q/\varepsilon_0$. $S_4$ não envolve nenhuma: zero, embora o campo atravesse ela.`,
          medidas: [0, 1, 2, 3],
        },
      ],
      respostas: [{ item: 'Fluxos', texto: r`$\Phi_1 = -\dfrac{Q}{\varepsilon_0}$, $\Phi_2 = 0$, $\Phi_3 = -\dfrac{2Q}{\varepsilon_0}$, $\Phi_4 = 0$` }],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [{ titulo: 'Contar', texto: r`Somar as cargas dentro de cada uma.`, passo: 1 }],
        resultado: r`$-Q/\varepsilon_0$, $0$, $-2Q/\varepsilon_0$, $0$.`,
        errosComuns: ['Achar que fluxo zero significa campo zero na superfície.'],
        oficial: { resposta: 'Φ₁ = −Q/ε₀; Φ₂ = 0; Φ₃ = −2Q/ε₀; Φ₄ = 0.' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Ler cargas nas linhas de campo',
      resumo: 'q₁ < 0 (linhas chegam), q₂ > 0 (linhas saem), |q₁| > |q₂|; q₁/q₂ ≈ −4; os dois fluxos são negativos.',
      figura: { pagina: 1, recorte: [0.089, 0.448, 0.936, 0.717] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [1, -1, 13], alvo: [1, 0, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga q₂', simbolo: 'q_2', valor: 1e-10, unidade: 'C', min: 2e-11, max: 5e-10, passo: 1e-11 },
        { id: 'razao', rotulo: 'Razão q₁/q₂', simbolo: 'q_1/q_2', valor: -4, unidade: '', min: -6, max: -1, passo: 0.5 },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: 'razao*q', pos: [-0.01, 0, 0], rotulo: 'q₁' },
        { id: 'q2', tipo: 'carga', q: 'q', pos: [0.03, 0, 0], rotulo: 'q₂' },
        { id: 'S1', tipo: 'gaussiana', forma: 'esfera', centro: [-0.01, 0, 0], raio: 0.015, rotulo: 'S₁' },
        { id: 'S2', tipo: 'gaussiana', forma: 'esfera', centro: [0.01, 0, 0], raio: 0.035, rotulo: 'S₂' },
      ],
      visual: { linhasE: true, setasE: false },
      medidas: [
        { rotulo: 'Fluxo por S₁', simbolo: r`\Phi_1 = q_1/\varepsilon_0`, expr: "fluxo('S1')", unidade: 'V·m', teoria: 'razao*q/eps0' },
        { rotulo: 'Fluxo por S₂', simbolo: r`\Phi_2 = (q_1 + q_2)/\varepsilon_0`, expr: "fluxo('S2')", unidade: 'V·m', teoria: '(razao + 1)*q/eps0' },
      ],
      passos: [
        {
          titulo: '(a) Sinais',
          texto: r`Linhas saem de cargas positivas e chegam em negativas. Em $q_2$ as linhas saem: positiva. Em $q_1$ elas chegam: negativa. Chegam mais linhas em $q_1$ do que saem de $q_2$: $|q_1| > |q_2|$.`,
        },
        {
          titulo: '(b) Fluxos',
          texto: r`$\Phi_{S_1} = q_1/\varepsilon_0 < 0$ e $\Phi_{S_2} = (q_1 + q_2)/\varepsilon_0 < 0$: nas duas, entra mais campo do que sai.`,
          medidas: [0, 1],
        },
        {
          titulo: '(c) Contar linhas',
          texto: r`O número de linhas é proporcional à carga. Na figura, cerca de 16 linhas chegam em $q_1$ e 4 saem de $q_2$: $q_1/q_2 \approx -4$.`,
          medidas: [0, 1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$q_1 < 0$, $q_2 > 0$, $|q_1| > |q_2|$` },
        { item: '(b)', texto: r`$\Phi_{S_1} = q_1/\varepsilon_0$ e $\Phi_{S_2} = (q_1 + q_2)/\varepsilon_0$, ambos negativos` },
        { item: '(c)', texto: r`$q_1/q_2 \approx -4$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Linhas de campo e fluxo', lab: 'gauss' }],
        etapas: [
          { titulo: 'Sinais', texto: r`Sentido das linhas.`, passo: 0 },
          { titulo: 'Gauss', texto: r`Carga interna.`, passo: 1 },
        ],
        resultado: r`$q_1/q_2 \approx -4$; fluxos negativos.`,
        errosComuns: ['Ler a intensidade pelo tamanho do desenho da carga, e não pelo número de linhas.'],
        oficial: { resposta: 'q₁ negativa, q₂ positiva, |q₁| > |q₂|; Φ_S1 = q₁/ε₀ e Φ_S2 = (q₁ + q₂)/ε₀, ambos negativos; q₁/q₂ = −4.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Hemisfério num campo uniforme',
      resumo: 'Fechado: 0. Base: −EπR². Curva: +EπR².',
      figura: { pagina: 1, recorte: [0.089, 0.718, 0.936, 0.816] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [6, 3, 7], alvo: [0, 0, 1] } },
      parametros: [
        { id: 'E0', rotulo: 'Campo', simbolo: 'E', valor: 1000, unidade: 'V/m', min: 100, max: 5000, passo: 50 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'Eu', tipo: 'campoE', valor: [0, 0, 'E0'], potencial: '0-E0*z', rotulo: 'E uniforme' },
        { id: 'base', tipo: 'espiraSensora', centro: [0, 0, 0], normal: [0, 0, -1], raio: 'R', rotulo: 'base (normal para fora: −z)' },
        { id: 'esf', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'R', rotulo: 'esfera inteira (sem carga)' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Fluxo pela base', simbolo: r`\Phi_\text{base} = -E\pi R^2`, expr: "fluxoE('base')", unidade: 'V·m', teoria: '0-E0*pi*R^2' },
        { rotulo: 'Fluxo por uma superfície fechada sem carga', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('esf')", unidade: 'V·m', teoria: 0 },
        { rotulo: 'Fluxo pela parte curva (o que falta para zero)', simbolo: r`\Phi_\text{curva} = -\Phi_\text{base}`, expr: "0-fluxoE('base')", unidade: 'V·m', teoria: 'E0*pi*R^2' },
      ],
      passos: [
        { titulo: '(a) Fechado', texto: r`Não há carga dentro: o fluxo total é zero. Tudo o que entra sai.`, medidas: [1] },
        { titulo: '(b) Base', texto: r`O campo entra perpendicular à base, contra a normal de fora: $\Phi_\text{base} = -E\pi R^2$.`, medidas: [0] },
        { titulo: '(c) Curva', texto: r`Como o total é zero, $\Phi_\text{curva} = +E\pi R^2$: é a área que a cúpula "mostra" ao campo, sua projeção.`, medidas: [2] },
      ],
      respostas: [
        { item: '(a)', texto: '0' },
        { item: '(b)', texto: r`$-E\pi R^2$` },
        { item: '(c)', texto: r`$+E\pi R^2$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Fluxo e lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Total', texto: r`Sem carga, zero.`, passo: 0 },
          { titulo: 'Partes', texto: r`Base e curva se compensam.`, passo: 2 },
        ],
        resultado: r`$0$, $-E\pi R^2$, $E\pi R^2$.`,
        errosComuns: ['Usar a área $2\\pi R^2$ da cúpula no fluxo da parte curva.'],
        oficial: { resposta: '(a) 0; (b) −EπR²; (c) EπR².' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Médio',
      titulo: 'Gaussiana cúbica em volta de um cubo carregado',
      resumo: 'Gauss vale, mas o campo muda ao longo da superfície: não dá para tirar E da integral.',
      figura: [
        { pagina: 1, recorte: [0.089, 0.817, 0.936, 0.901] },
        { pagina: 2, recorte: [0.089, 0.062, 0.936, 0.132] },
      ],
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [6, 5, 8], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga do cubo', simbolo: 'Q', valor: 1e-10, unidade: 'C', min: 2e-11, max: 5e-10, passo: 1e-11 },
        { id: 'l', rotulo: 'Aresta do cubo carregado', simbolo: 'l', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'Lg', rotulo: 'Aresta da gaussiana', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.035, max: 0.07, passo: 0.001 },
      ],
      objetos: [...cubo4, { id: 'g', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: 'Lg', rotulo: 'gaussiana cúbica' }],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Fluxo pela gaussiana', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('g')", unidade: 'V·m', teoria: 'Q0/eps0' },
        { rotulo: 'Campo no centro de uma face', simbolo: r`E_\text{face}`, expr: 'mag(E(Lg/2, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Campo num vértice', simbolo: r`E_\text{vértice}`, expr: 'mag(E(Lg/2, Lg/2, Lg/2))', unidade: 'V/m' },
        { rotulo: 'Razão entre os dois', simbolo: r`E_\text{face}/E_\text{vértice}`, expr: 'mag(E(Lg/2, 0, 0))/mag(E(Lg/2, Lg/2, Lg/2))', unidade: '' },
      ],
      passos: [
        { titulo: '(a) Gauss vale', texto: r`A lei de Gauss vale para qualquer distribuição e qualquer superfície fechada: o fluxo é $Q/\varepsilon_0$. A cena monta o cubo com 27 cargas iguais.`, medidas: [0] },
        {
          titulo: '(b) O campo não é constante',
          texto: r`No centro de uma face a gaussiana está mais perto do cubo que nos vértices: o campo é cerca de três vezes mais forte ali, e também não é perpendicular à face em todo lugar.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: '(c) Por que não ajuda',
          texto: r`Para usar Gauss como atalho é preciso tirar $E$ da integral: $E$ constante e perpendicular à superfície. Isso exige simetria esférica, cilíndrica ou plana. Ter a "mesma forma" do objeto não basta: o campo de um cubo não tem a simetria do cubo em cada ponto da gaussiana.`,
        },
      ],
      respostas: [
        { item: '(a)', texto: 'Sim: a lei de Gauss vale sempre.' },
        { item: '(b)', texto: 'Não: o campo muda de ponto a ponto da superfície cúbica.' },
        { item: '(c)', texto: 'Não: sem E constante sobre a superfície, a integral não se simplifica.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Quando Gauss calcula o campo', lab: 'gauss' }],
        etapas: [
          { titulo: 'Validade', texto: r`Sempre.`, passo: 0 },
          { titulo: 'Utilidade', texto: r`Só com simetria suficiente.`, passo: 2 },
        ],
        resultado: r`(a) sim; (b) não; (c) não.`,
        errosComuns: ['Confundir "Gauss vale" com "Gauss resolve".'],
        oficial: { resposta: '(a) Sim; (b) não; (c) não.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Carga no centro e no vértice de um cubo',
      resumo: 'Centro: q/ε₀ no cubo, q/6ε₀ por face. Vértice: q/24ε₀ em cada face oposta e zero nas três que tocam o vértice.',
      figura: { pagina: 2, recorte: [0.089, 0.133, 0.936, 0.231] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [7, 5, 8], alvo: [1, 1, 1] } },
      parametros: [
        { id: 'pos', rotulo: 'Posição da carga', valor: 1, opcoes: [{ valor: 1, rotulo: 'no centro' }, { valor: 2, rotulo: 'num vértice' }] },
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-10, unidade: 'C', min: 2e-11, max: 5e-10, passo: 1e-11 },
        { id: 'a', rotulo: 'Aresta', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'qq', tipo: 'carga', q: 'q', pos: ['pos == 1 ? a/2 : 0', 'pos == 1 ? a/2 : 0', 'pos == 1 ? a/2 : 0'], rotulo: 'q' },
        { id: 'g', tipo: 'gaussiana', forma: 'cubo', centro: ['a/2', 'a/2', 'a/2'], lado: 'a', ativo: 'pos == 1', rotulo: 'cubo' },
        { id: 'fl', tipo: 'espiraSensora', centro: ['a', 'a/2', 'a/2'], normal: 'x', largura: 'a', altura: 'a', eixoU: 'y', rotulo: 'face x = a' },
        { id: 'fp', tipo: 'espiraSensora', centro: [0, 'a/2', 'a/2'], normal: [-1, 0, 0], largura: 'a', altura: 'a', eixoU: 'y', rotulo: 'face x = 0' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Fluxo pelo cubo todo', simbolo: r`\Phi`, ativo: 'pos == 1', expr: "fluxo('g')", unidade: 'V·m', teoria: 'q/eps0' },
        { rotulo: 'Fluxo pela face x = a', simbolo: r`\Phi_\text{face}`, expr: "fluxoE('fl')", unidade: 'V·m', teoria: 'pos == 1 ? q/(6*eps0) : q/(24*eps0)' },
        { rotulo: 'Fluxo pela face x = 0', simbolo: r`\Phi_\text{face}`, expr: "fluxoE('fp')", unidade: 'V·m', teoria: 'pos == 1 ? q/(6*eps0) : 0' },
      ],
      passos: [
        { titulo: '(a) Cubo todo', texto: r`Lei de Gauss: $\Phi = q/\varepsilon_0$.`, parametros: { pos: 1 }, medidas: [0] },
        { titulo: '(b) Uma face', texto: r`As seis faces são iguais em relação à carga: cada uma leva $\dfrac{q}{6\varepsilon_0}$.`, parametros: { pos: 1 }, medidas: [1, 2] },
        {
          titulo: '(c) Carga no vértice',
          texto: r`Junte oito cubos em volta do vértice: eles formam um cubo maior com a carga no centro, e cada cubo pequeno leva $\dfrac{q}{8\varepsilon_0}$. Nas três faces que tocam o vértice o campo é **paralelo** à face: fluxo zero. As outras três dividem o fluxo:
$$\Phi = \frac{q}{24\varepsilon_0}\ \text{em cada face oposta}.$$`,
          parametros: { pos: 2 },
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$q/\varepsilon_0$` },
        { item: '(b)', texto: r`$q/6\varepsilon_0$` },
        { item: '(c)', texto: r`$q/24\varepsilon_0$ em cada uma das três faces opostas ao vértice; zero nas três que o tocam.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss e simetria', lab: 'gauss' }],
        etapas: [
          { titulo: 'Simetria', texto: r`Seis faces iguais.`, passo: 1 },
          { titulo: 'Oito cubos', texto: r`$q/8$ por cubo.`, passo: 2 },
        ],
        resultado: r`$q/\varepsilon_0$; $q/6\varepsilon_0$; $q/24\varepsilon_0$ nas faces opostas.`,
        errosComuns: ['Dividir $q/8\\varepsilon_0$ pelas seis faces: três delas têm fluxo nulo.'],
        oficial: {
          resposta: 'q/ε₀; q/6ε₀; q/24ε₀ em cada face.',
          observacao: 'No item (c), q/24ε₀ vale só para as três faces opostas ao vértice; nas três faces que tocam o vértice o campo é paralelo a elas e o fluxo é zero. O total do cubo, q/8ε₀, confere.',
        },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Fácil',
      titulo: 'Onde Gauss dá o campo',
      resumo: 'Fio infinito, esfera e casca cilíndrica infinita: sim. Anel e disco: Gauss vale, mas não resolve.',
      figura: { pagina: 2, recorte: [0.089, 0.232, 0.936, 0.392] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [6, 5, 7], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'dist',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(i) fio infinito' },
            { valor: 2, rotulo: '(ii) anel' },
            { valor: 3, rotulo: '(iii) disco' },
            { valor: 4, rotulo: '(iv) esfera' },
            { valor: 5, rotulo: '(v) casca cilíndrica infinita' },
          ],
        },
        { id: 'Q0', rotulo: 'Carga (ou carga por metro)', simbolo: 'Q', valor: 1e-10, unidade: 'C', min: 1e-10, max: 1e-10, passo: 1e-11 },
      ],
      objetos: [
        { id: 'fio', tipo: 'linhaInfinita', ativo: 'dist == 1', lambda: 'Q0', ponto: [0, 0, 0], direcao: 'z', rotulo: 'fio infinito' },
        { id: 'anel', tipo: 'anelCarga', ativo: 'dist == 2', Q: 'Q0', centro: [0, 0, 0], raio: 0.02, normal: 'z', rotulo: 'anel' },
        ...disco6,
        { id: 'esf', tipo: 'esfera', ativo: 'dist == 4', Q: 'Q0', centro: [0, 0, 0], raio: 0.02, rotulo: 'esfera' },
        { id: 'casca', tipo: 'cilindroInfinito', ativo: 'dist == 5', lambda: 'Q0', ponto: [0, 0, 0], direcao: 'z', raio: 0.02, oco: true, rotulo: 'casca cilíndrica' },
        { id: 'P1', tipo: 'sonda', campo: 'E', pos: [0.03, 0, 0], rotulo: 'P₁' },
        { id: 'P2', tipo: 'sonda', campo: 'E', pos: ['dist == 1 || dist == 5 ? 0 : 0', 'dist == 1 || dist == 5 ? 0.03 : 0', 'dist == 1 || dist == 5 ? 0.02 : 0.03'], rotulo: 'P₂' },
      ],
      visual: { setasE: true },
      medidas: [
        {
          rotulo: 'E(P₁)/E(P₂), dois pontos da gaussiana natural',
          simbolo: r`E_1/E_2`,
          ativo: 'dist == 1 || dist == 4 || dist == 5',
          expr: "mag(E(0.03, 0, 0))/mag(E('P2'))",
          unidade: '',
          teoria: 1,
        },
        { rotulo: 'E(P₁)/E(P₂) no anel ou no disco', simbolo: r`E_1/E_2`, ativo: 'dist == 2 || dist == 3', expr: "mag(E(0.03, 0, 0))/mag(E('P2'))", unidade: '' },
      ],
      passos: [
        {
          titulo: '(a) Simetria suficiente',
          texto: r`Gauss dá o campo quando existe uma superfície em que $E$ é constante e perpendicular: cilindro para o fio e para a casca cilíndrica, esfera para a esfera. Os pontos $P_1$ e $P_2$ estão na mesma gaussiana e têm o mesmo campo.`,
          parametros: { dist: 4 },
          medidas: [0],
        },
        {
          titulo: '(b) Anel e disco',
          texto: r`No anel e no disco não há superfície assim: na esfera em volta do anel, o campo no eixo é diferente do campo no plano. Gauss continua **valendo** (o fluxo é $Q/\varepsilon_0$), mas não dá para tirar $E$ da integral.`,
          parametros: { dist: 2 },
          medidas: [1],
        },
      ],
      respostas: [
        { item: '(a)', texto: '(i), (iv) e (v): têm simetria cilíndrica ou esférica.' },
        { item: '(b)', texto: 'Ela vale para todas; em (ii) e (iii) só não serve para calcular o campo.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss e simetria', lab: 'gauss' }],
        etapas: [
          { titulo: 'Simetria', texto: r`E constante na gaussiana.`, passo: 0 },
          { titulo: 'Validade', texto: r`Sempre vale.`, passo: 1 },
        ],
        resultado: r`(i), (iv), (v); vale para todas.`,
        errosComuns: ['Achar que Gauss "não vale" quando não há simetria.'],
        oficial: { resposta: '(a) Só (i), (iv) e (v); (b) vale para todos, mas em (ii) e (iii) não há superfície com |E| uniforme.' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Médio',
      titulo: 'Fio finito dentro de um cilindro',
      resumo: 'O campo não é perpendicular nem constante na lateral: o fluxo é Q/ε₀, mas Gauss não dá E.',
      figura: { pagina: 2, recorte: [0.089, 0.393, 0.936, 0.708] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', camera: { pos: [8, 4, 6], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga do fio', simbolo: 'Q', valor: 1e-10, unidade: 'C', min: 2e-11, max: 5e-10, passo: 1e-11 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.001 },
        { id: 'R', rotulo: 'Raio do cilindro', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'fio', tipo: 'segmentoCarga', lambda: 'Q0/L', a: [0, 0, '0-L/2'], b: [0, 0, 'L/2'], rotulo: 'fio finito' },
        { id: 'S', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], raio: 'R', altura: '1.02*L', eixo: 'z', rotulo: 'S' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('S')", unidade: 'V·m', teoria: 'Q0/eps0' },
        { rotulo: 'Campo na lateral, no meio', simbolo: r`E(R, 0)`, expr: 'mag(E(R, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Campo na lateral, perto da ponta', simbolo: r`E(R, 0{,}45L)`, expr: 'mag(E(R, 0, 0.45*L))', unidade: 'V/m' },
        { rotulo: 'Ângulo do campo com a normal, perto da ponta', simbolo: r`\theta`, expr: 'deg(atan2(z(E(R, 0, 0.45*L)), x(E(R, 0, 0.45*L))))', unidade: '°' },
      ],
      passos: [
        { titulo: '(a) Perpendicular?', texto: r`Só no meio. Perto das pontas, há mais fio de um lado que do outro e o campo ganha componente ao longo do eixo.`, medidas: [3] },
        { titulo: '(b) Mesmo módulo?', texto: r`Não: perto das pontas o campo é mais fraco, porque parte do fio está mais longe.`, medidas: [1, 2] },
        {
          titulo: '(c) Gauss',
          texto: r`O fluxo total continua $Q/\varepsilon_0$ (a cena estica a gaussiana 2% para as tampas não tocarem o fio). Mas sem $E$ constante e perpendicular não dá para isolar $E$: Gauss não fornece o campo de um fio finito.`,
          medidas: [0],
        },
      ],
      respostas: [
        { item: '(a)', texto: 'Não: só no meio do fio.' },
        { item: '(b)', texto: 'Não: o módulo cai perto das pontas.' },
        { item: '(c)', texto: 'Não: o fluxo é Q/ε₀, mas o campo não sai da integral.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Quando Gauss calcula o campo', lab: 'gauss' }],
        etapas: [{ titulo: 'Sem simetria', texto: r`Fio finito não é invariante ao longo do eixo.`, passo: 2 }],
        resultado: r`Não, não, não.`,
        errosComuns: ['Usar $E = \\lambda/2\\pi\\varepsilon_0 r$ para um fio finito.'],
        oficial: { resposta: '(a) Não; (b) não; (c) não.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Cabo coaxial: campo nas três regiões',
      resumo: 'Zero no condutor, λ/2πε₀s entre eles, zero fora.',
      figura: { pagina: 2, recorte: [0.089, 0.709, 0.936, 0.788] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade linear', simbolo: r`\lambda`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.005, max: 0.015, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.035, unidade: 'm', min: 0.025, max: 0.045, passo: 0.001 },
        { id: 's', rotulo: 'Raio da gaussiana', simbolo: 's', valor: 0.02, unidade: 'm', min: 0.002, max: 0.055, passo: 0.001 },
      ],
      objetos: [
        { id: 'in', tipo: 'cilindroInfinito', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', raio: 'a', oco: true, rotulo: 'cilindro condutor (+λ na superfície)' },
        { id: 'out', tipo: 'cilindroInfinito', lambda: '0-lam', ponto: [0, 0, 0], direcao: 'z', raio: 'b', oco: true, rotulo: 'casca (−λ)' },
        { id: 'g', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], raio: 's', altura: 0.04, eixo: 'z', rotulo: 'gaussiana' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em s', simbolo: 'E(s)', expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's > a && s < b ? lam/(2*pi*eps0*s) : 0' },
        { rotulo: 'Carga dentro da gaussiana (ε₀Φ)', simbolo: r`\varepsilon_0\Phi`, expr: "1e12*eps0*fluxo('g')", unidade: 'pC', teoria: '1e12*(s > a && s < b ? lam*0.04 : 0)' },
      ],
      passos: [
        { titulo: '(i) s < a', texto: r`Dentro do condutor em equilíbrio o campo é zero; a carga $\lambda$ fica na superfície.`, parametros: { s: 0.005 }, medidas: [0, 1] },
        { titulo: '(ii) a < s < b', texto: r`A gaussiana envolve $\lambda l$: $E\cdot2\pi sl = \lambda l/\varepsilon_0$, $\vec E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$.`, parametros: { s: 0.02 }, medidas: [0, 1] },
        { titulo: '(iii) s > b', texto: r`Carga total dentro: $\lambda - \lambda = 0$, e o campo é zero.`, parametros: { s: 0.045 }, medidas: [0, 1] },
      ],
      respostas: [{ item: 'E', texto: r`(i) $0$; (ii) $\dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$; (iii) $0$` }],
      resolucao: {
        conceitos: [{ texto: 'Gauss com simetria cilíndrica', lab: 'gauss' }],
        etapas: [{ titulo: 'Três gaussianas', texto: r`Carga interna em cada região.`, passo: 1 }],
        resultado: r`$0$, $\lambda/2\pi\varepsilon_0s$, $0$.`,
        errosComuns: ['Pôr carga no volume do cilindro condutor.'],
        oficial: { resposta: '(i) 0; (ii) λ/(2πε₀r) r̂; (iii) 0.' },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Cilindro com ρ = ρ₀s/R',
      resumo: 'λ = 2πρ₀R²/3; fora, campo de fio; dentro, E = ρ₀s²/3ε₀R.',
      figura: [
        { pagina: 2, recorte: [0.089, 0.79, 0.936, 0.907] },
        { pagina: 3, recorte: [0.08, 0.062, 0.936, 0.101] },
      ],
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Constante da densidade', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.01, unidade: 'm', min: 0.002, max: 0.055, passo: 0.001 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroInfinito', ponto: [0, 0, 0], direcao: 'z', raio: 'R', rho: 'rho0*r/R', rotulo: 'cilindro (ρ = ρ₀s/R)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga por comprimento', simbolo: r`\lambda = \frac{2\pi\rho_0R^2}{3}`, expr: "1e9*carga('cil')", unidade: 'nC/m', teoria: '1e9*2*pi*rho0*R^2/3' },
        { rotulo: 'Campo em s', simbolo: 'E(s)', expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's < R ? rho0*s^2/(3*eps0*R) : rho0*R^2/(3*eps0*s)' },
        { rotulo: 'Campo de um fio com o mesmo λ', simbolo: r`\frac{\lambda}{2\pi\varepsilon_0s}`, expr: "carga('cil')/(2*pi*eps0*s)", unidade: 'V/m' },
      ],
      graficos: [
        {
          titulo: 'E(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.001, ate: 0.055, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'E', expr: 'mag(E(ss, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        { titulo: '(a) λ', texto: r`$\lambda = \displaystyle\int_0^R\rho_0\frac sR\,2\pi s\,ds = \frac{2\pi\rho_0R^2}{3}$.`, medidas: [0] },
        { titulo: '(b) Fora', texto: r`$E\cdot2\pi sl = \lambda l/\varepsilon_0$: $E = \dfrac{\rho_0R^2}{3\varepsilon_0s} = \dfrac{\lambda}{2\pi\varepsilon_0s}$, igual ao fio.`, parametros: { s: 0.04 }, medidas: [1, 2] },
        { titulo: '(c) Dentro', texto: r`Carga até $s$: $\dfrac{2\pi\rho_0s^3}{3R}$ por comprimento, e $E = \dfrac{\rho_0s^2}{3\varepsilon_0R}$.`, parametros: { s: 0.01 }, medidas: [1] },
        { titulo: '(d) Gráfico', texto: r`$E$ cresce como $s^2$ até $R$ e cai como $1/s$, contínuo na superfície: distribuição volumétrica não dá salto.`, medidas: [1] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\lambda = \dfrac{2\pi\rho_0R^2}{3}$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\rho_0R^2}{3\varepsilon_0s}\hat s = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$` },
        { item: '(c)', texto: r`$\vec E = \dfrac{\rho_0s^2}{3\varepsilon_0R}\hat s$` },
        { item: '(d)', texto: 'Cresce como s² até R, depois cai como 1/s, sem salto.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Densidade não uniforme', lab: 'densidade' }],
        etapas: [
          { titulo: 'Carga', texto: r`Integrar em cascas.`, passo: 0 },
          { titulo: 'Gauss', texto: r`Dentro e fora.`, passo: 2 },
        ],
        resultado: r`Veja as expressões.`,
        errosComuns: ['Usar a carga total para pontos dentro do cilindro.'],
        oficial: { resposta: 'λ = 2πρ₀R²/3; fora, E = ρ₀R²/(3ε₀s) ŝ = λ/(2πε₀s) ŝ; dentro, E = ρ₀s²/(3ε₀R) ŝ.' },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Médio',
      titulo: 'Placa espessa com carga uniforme',
      resumo: 'Dentro, E_z = ρz/ε₀; fora, ±ρd/ε₀.',
      figura: { pagina: 3, recorte: [0.08, 0.102, 0.936, 0.403] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [8, 3, 6], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Densidade de carga', simbolo: r`\rho`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'd', rotulo: 'Meia espessura', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'zp', rotulo: 'Altura', simbolo: 'z', valor: 0.01, unidade: 'm', min: -0.04, max: 0.04, passo: 0.002 },
      ],
      objetos: [...folhas10, { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zp'], arraste: { param: 'zp', eixo: 'z' }, rotulo: 'z' }],
      visual: { setasE: false },
      medidas: [{ rotulo: 'Componente z do campo (20 folhas)', simbolo: 'E_z', expr: 'z(E(0, 0, zp))', unidade: 'V/m', teoria: E10 }],
      graficos: [
        {
          titulo: 'E_z(z)',
          tipo: 'perfil',
          x: { variavel: 'zz', de: -0.04, ate: 0.04, rotulo: 'z', unidade: 'm', marca: 'zp' },
          series: [{ rotulo: 'E_z', expr: 'z(E(0, 0, zz))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Fora',
          texto: r`Gaussiana: cilindro de tampas $A$ em $\pm z$. Fora, a carga dentro é $\rho\,2dA$: $2EA = \rho\,2dA/\varepsilon_0$ e $E = \dfrac{\rho d}{\varepsilon_0}$, para longe da placa. A cena monta a placa com 20 folhas finas.`,
          parametros: { zp: 0.03 },
          medidas: [0],
        },
        { titulo: '(b) Dentro', texto: r`Com $|z| < d$, a carga dentro é $\rho\,2|z|A$: $E_z = \dfrac{\rho z}{\varepsilon_0}$, zero no plano médio.`, parametros: { zp: 0.01 }, medidas: [0] },
        { titulo: '(c) Gráfico', texto: r`Reta de $-\rho d/\varepsilon_0$ a $+\rho d/\varepsilon_0$ dentro da placa e constante fora, sem salto. (As folhas fazem uma escadinha fina entre os pontos da grade.)`, medidas: [0] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac{\rho d}{\varepsilon_0}\dfrac{z}{|z|}\hat z$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\rho z}{\varepsilon_0}\hat z$` },
        { item: '(c)', texto: 'Reta dentro, constante fora, contínua em z = ±d.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Gauss com simetria plana', lab: 'planos' }],
        etapas: [{ titulo: 'Cilindro', texto: r`Tampas simétricas.`, passo: 0 }],
        resultado: r`$\rho z/\varepsilon_0$ dentro, $\pm\rho d/\varepsilon_0$ fora.`,
        errosComuns: ['Esquecer o sinal: o campo aponta para longe do plano médio dos dois lados.'],
        oficial: { resposta: 'Fora, E = (ρd/ε₀)(z/|z|) ẑ; dentro, E = (ρz/ε₀) ẑ.' },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Fácil',
      titulo: 'Carga no centro de uma casca condutora',
      resumo: 'kq/r² na cavidade e fora; zero no metal; σ = −q/4πa² e (q + Q)/4πb².',
      figura: { pagina: 3, recorte: [0.08, 0.404, 0.936, 0.533] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga central', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'Qc', rotulo: 'Carga da casca', simbolo: 'Q', valor: 0, unidade: 'C', min: -3e-9, max: 3e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.035, unidade: 'm', min: 0.035, max: 0.035, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao centro', simbolo: 'r', valor: 0.01, unidade: 'm', min: 0.003, max: 0.055, passo: 0.001 },
      ],
      objetos: [
        { id: 'qc', tipo: 'carga', q: 'q', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'sa', tipo: 'esfera', Q: '0-q', centro: [0, 0, 0], raio: 'a', oca: true, rotulo: 'superfície interna' },
        { id: 'sb', tipo: 'esfera', Q: 'q + Qc', centro: [0, 0, 0], raio: 'b', oca: true, rotulo: 'superfície externa' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 'r' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em r', simbolo: 'E(r)', expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's < a ? k0*q/s^2 : (s < b ? 0 : k0*abs(q + Qc)/s^2)' },
        { rotulo: 'Densidade na superfície interna', simbolo: r`\sigma_a = -\frac{q}{4\pi a^2}`, expr: "1e9*carga('sa')/(4*pi*a^2)", unidade: 'nC/m²', teoria: '1e9*(0-q/(4*pi*a^2))' },
        { rotulo: 'Densidade na superfície externa', simbolo: r`\sigma_b = \frac{q + Q}{4\pi b^2}`, expr: "1e9*carga('sb')/(4*pi*b^2)", unidade: 'nC/m²', teoria: '1e9*(q + Qc)/(4*pi*b^2)' },
      ],
      passos: [
        { titulo: '(a) Cavidade', texto: r`Gaussiana esférica com só $q$ dentro: $E = \dfrac{kq}{r^2}$.`, parametros: { s: 0.01, Qc: 0 }, medidas: [0] },
        { titulo: '(b) Metal', texto: r`Condutor em equilíbrio: $E = 0$.`, parametros: { s: 0.028, Qc: 0 }, medidas: [0] },
        { titulo: '(c) Fora', texto: r`A casca é neutra: carga total dentro $q$, e $E = \dfrac{kq}{r^2}$.`, parametros: { s: 0.045, Qc: 0 }, medidas: [0] },
        {
          titulo: '(d) Indução',
          texto: r`Para $E = 0$ no metal, a gaussiana dentro dele envolve carga zero: a face interna tem $-q$, $\sigma_a = -\dfrac{q}{4\pi a^2}$. A neutralidade põe $+q$ na externa: $\sigma_b = \dfrac{q}{4\pi b^2}$.`,
          parametros: { Qc: 0 },
          medidas: [1, 2],
        },
        {
          titulo: '(e) Casca com carga Q',
          texto: r`A face interna continua com $-q$ (é ela que anula o campo no metal). O excesso vai para fora: $\sigma_b = \dfrac{q + Q}{4\pi b^2}$, e fora $E = \dfrac{k(q + Q)}{r^2}$. Mudam só (c) e (d).`,
          parametros: { Qc: 2e-9, s: 0.045 },
          medidas: [0, 1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{r^2}\hat r$` },
        { item: '(b)', texto: '0' },
        { item: '(c)', texto: r`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{r^2}\hat r$` },
        { item: '(d)', texto: r`$\sigma_a = -\dfrac{q}{4\pi a^2}$, $\sigma_b = \dfrac{q}{4\pi b^2}$` },
        { item: '(e)', texto: r`Mudam (c) e (d): fora, $\dfrac{k(q + Q)}{r^2}$; $\sigma_b = \dfrac{q + Q}{4\pi b^2}$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Condutores em equilíbrio', lab: 'condutores' }],
        etapas: [
          { titulo: 'Regiões', texto: r`Gauss em cada uma.`, passo: 0 },
          { titulo: 'Indução', texto: r`E = 0 no metal.`, passo: 3 },
        ],
        resultado: r`Veja os itens.`,
        errosComuns: ['Pôr a carga Q da casca na face interna.'],
        oficial: { resposta: 'kq/r² na cavidade e fora; 0 no metal; σ_a = −q/4πa², σ_b = q/4πb²; com carga Q mudam (c) e (d): E = k(Q + q)/r², σ_b = (Q + q)/4πb².' },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Médio',
      titulo: 'Átomo de hidrogênio como próton e nuvem',
      resumo: 'ρ = −3e/4πa₀³; E = (e/4πε₀)(1/r² − r/a₀³) dentro e zero fora; E(a₀/2) ≈ 1,8×10¹² N/C.',
      figura: { pagina: 3, recorte: [0.08, 0.534, 0.936, 0.702] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'a0', rotulo: 'Raio de Bohr', simbolo: 'a_0', valor: 0.53e-10, unidade: 'm', min: 0.53e-10, max: 0.53e-10, passo: 1e-12 },
        { id: 'Rs', rotulo: 'Raio desenhado (escala da cena)', simbolo: r`R_\text{cena}`, valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 'f', rotulo: 'Distância ao centro (em a₀)', simbolo: 'r/a_0', valor: 0.5, unidade: '', min: 0.1, max: 1.8, passo: 0.05 },
      ],
      objetos: [
        { id: 'pr', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: 'próton' },
        { id: 'nuvem', tipo: 'esfera', Q: '0-qe', centro: [0, 0, 0], raio: 'Rs', rotulo: 'nuvem eletrônica (−e)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['f*Rs', 0, 0], rotulo: 'r' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Densidade da nuvem', simbolo: r`\rho = -\frac{3e}{4\pi a_0^3}`, expr: '0-3*qe/(4*pi*a0^3)', unidade: 'C/m³' },
        {
          rotulo: 'Campo em r (no átomo real)',
          simbolo: r`E = \frac{e}{4\pi\varepsilon_0}\left(\frac1{r^2} - \frac{r}{a_0^3}\right)`,
          expr: `mag(E(f*Rs, 0, 0))*${ESC12}`,
          unidade: 'N/C',
          teoria: 'f < 1 ? k0*qe*(1/(f*a0)^2 - f*a0/a0^3) : 0',
        },
      ],
      graficos: [
        {
          titulo: 'E(r), no átomo real',
          tipo: 'perfil',
          x: { variavel: 'ff', de: 0.1, ate: 1.8, rotulo: 'r/a₀', unidade: '', marca: 'f' },
          series: [{ rotulo: 'E', expr: `mag(E(ff*Rs, 0, 0))*${ESC12}`, unidade: 'N/C' }],
        },
      ],
      passos: [
        { titulo: '(a) Densidade', texto: r`Carga $-e$ espalhada no volume $\tfrac43\pi a_0^3$: $\rho = -\dfrac{3e}{4\pi a_0^3}$.`, medidas: [0] },
        {
          titulo: '(b) Gauss',
          texto: r`Dentro, a gaussiana de raio $r$ envolve $e - e\dfrac{r^3}{a_0^3}$: $E = \dfrac{e}{4\pi\varepsilon_0}\left(\dfrac1{r^2} - \dfrac{r}{a_0^3}\right)$. Fora, o átomo é neutro: $E = 0$. A cena desenha o átomo com raio de 3 cm e corrige o campo por $(R_\text{cena}/a_0)^2$.`,
          parametros: { f: 0.5 },
          medidas: [1],
        },
        { titulo: '(c) Em r = a₀/2', texto: r`$E = ke\dfrac{4 - 1/2}{a_0^2} \approx 1{,}8\times10^{12}$ N/C.`, parametros: { f: 0.5 }, medidas: [1] },
        { titulo: '(d) Gráfico', texto: r`Diverge perto do próton, cai até zero em $r = a_0$ e fica zero fora.`, parametros: { f: 1.4 }, medidas: [1] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\rho = -\dfrac{3e}{4\pi a_0^3}$` },
        { item: '(b)', texto: r`$E = \dfrac{e}{4\pi\varepsilon_0}\left(\dfrac1{r^2} - \dfrac{r}{a_0^3}\right)$ para $r \le a_0$; $0$ fora` },
        { item: '(c)', texto: r`$E \approx 1{,}8\times10^{12}$ N/C` },
        { item: '(d)', texto: 'Veja o gráfico: cai de infinito a zero em a₀.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Gauss com simetria esférica', lab: 'gauss' }],
        etapas: [
          { titulo: 'Carga interna', texto: r`Próton menos a fração da nuvem.`, passo: 1 },
          { titulo: 'Número', texto: r`Substituir.`, passo: 2 },
        ],
        resultado: r`$E(a_0/2) \approx 1{,}8\times10^{12}$ N/C.`,
        errosComuns: ['Esquecer a parte da nuvem dentro da gaussiana.'],
        oficial: { resposta: 'ρ = −3e/(4πa₀³); E = (e/4πε₀)(1/r² − r/a₀³) dentro e 0 fora; E(a₀/2) ≈ 1,79×10¹² N/C.' },
      },
    },

    /* ───────────────────────── 13 ───────────────────────── */
    {
      id: 'e13',
      numero: '13',
      secao: 'Difícil',
      titulo: 'Campo uniforme numa cavidade esférica',
      resumo: 'Esfera cheia mais uma esfera de −ρ no lugar da cavidade: E = ρd/3ε₀, uniforme.',
      figura: { pagina: 3, recorte: [0.08, 0.703, 0.936, 0.767] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [2, -3, 11], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho', rotulo: 'Densidade', simbolo: r`\rho`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
        { id: 'rc', rotulo: 'Raio da cavidade', simbolo: 'r_c', valor: 0.015, unidade: 'm', min: 0.015, max: 0.015, passo: 0.001 },
        { id: 'd', rotulo: 'Distância entre os centros', simbolo: 'd', valor: 0.018, unidade: 'm', min: 0.005, max: 0.024, passo: 0.001 },
      ],
      objetos: [
        { id: 'cheia', tipo: 'esfera', Q: 'rho*4/3*pi*R^3', centro: [0, 0, 0], raio: 'R', rotulo: 'esfera cheia (ρ)' },
        { id: 'buraco', tipo: 'esfera', Q: '0-rho*4/3*pi*rc^3', centro: ['d', 0, 0], raio: 'rc', rotulo: 'cavidade (−ρ)' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo no centro da cavidade', simbolo: 'E', expr: 'mag(E(d, 0, 0))', unidade: 'V/m', teoria: 'rho*d/(3*eps0)' },
        { rotulo: 'Campo noutro ponto da cavidade', simbolo: 'E', expr: 'mag(E(d - 0.6*rc, 0.5*rc, 0))', unidade: 'V/m', teoria: 'rho*d/(3*eps0)' },
        { rotulo: 'Componente perpendicular a d nesse ponto', simbolo: 'E_y', expr: 'y(E(d - 0.6*rc, 0.5*rc, 0))', unidade: 'V/m', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Superposição',
          texto: r`Cavidade = esfera cheia de $\rho$ + esfera de $-\rho$ no lugar do buraco. Dentro de uma esfera uniforme, $\vec E = \dfrac{\rho\vec r}{3\varepsilon_0}$. Somando:
$$\vec E = \frac{\rho}{3\varepsilon_0}(\vec r - \vec r\,') = \frac{\rho\vec d}{3\varepsilon_0}.$$`,
          medidas: [0],
        },
        { titulo: 'Uniforme', texto: r`O resultado não depende do ponto: módulo $\rho d/3\varepsilon_0$, direção de $\vec d$. A sonda em outro ponto da cavidade lê o mesmo campo.`, medidas: [1, 2] },
      ],
      respostas: [{ item: 'E', texto: r`$\vec E = \dfrac{\rho\vec d}{3\varepsilon_0}$, uniforme na cavidade` }],
      resolucao: {
        conceitos: [{ texto: 'Superposição e densidade uniforme', lab: 'densidade' }],
        etapas: [{ titulo: 'Somar', texto: r`$\rho\vec r/3\varepsilon_0$ menos $\rho\vec r\,'/3\varepsilon_0$.`, passo: 0 }],
        resultado: r`$E = \rho d/3\varepsilon_0$.`,
        errosComuns: ['Tentar uma gaussiana direto: sem simetria, Gauss não dá o campo.'],
        oficial: { resposta: 'E = ρd/(3ε₀), uniforme (demonstração por superposição).' },
      },
    },

    /* ───────────────────────── 14 ───────────────────────── */
    {
      id: 'e14',
      numero: '14',
      secao: 'Difícil',
      titulo: 'Dois planos condutores com +2σ e −σ',
      resumo: 'Fora: σ/2ε₀ para longe; entre: 3σ/2ε₀; faces: σ/2 fora e ±3σ/2 dentro.',
      figura: { pagina: 3, recorte: [0.08, 0.768, 0.936, 0.901] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', camera: { pos: [8, 3, 6], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade σ', simbolo: r`\sigma`, valor: 1e-9, unidade: 'C/m²', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'h', rotulo: 'Meia distância entre os planos', simbolo: 'h', valor: 0.015, unidade: 'm', min: 0.015, max: 0.015, passo: 0.001 },
        { id: 't', rotulo: 'Espessura das placas', simbolo: 't', valor: 0.004, unidade: 'm', min: 0.004, max: 0.004, passo: 0.001 },
      ],
      objetos: [
        { id: 'a1', tipo: 'planoInfinito', sigma: 'sig/2', ponto: [0, 0, '0-h-t/2'], normal: 'z', rotulo: 'face externa (σ/2)' },
        { id: 'a2', tipo: 'planoInfinito', sigma: '3*sig/2', ponto: [0, 0, '0-h+t/2'], normal: 'z', rotulo: 'face interna (3σ/2)' },
        { id: 'b1', tipo: 'planoInfinito', sigma: '0-3*sig/2', ponto: [0, 0, 'h-t/2'], normal: 'z', rotulo: 'face interna (−3σ/2)' },
        { id: 'b2', tipo: 'planoInfinito', sigma: 'sig/2', ponto: [0, 0, 'h+t/2'], normal: 'z', rotulo: 'face externa (σ/2)' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Campo abaixo dos dois planos', simbolo: 'E_z', expr: 'z(E(0, 0, 0-2*h))', unidade: 'V/m', teoria: '0-sig/(2*eps0)' },
        { rotulo: 'Campo entre os planos', simbolo: 'E_z', expr: 'z(E(0, 0, 0))', unidade: 'V/m', teoria: '3*sig/(2*eps0)' },
        { rotulo: 'Campo acima dos dois', simbolo: 'E_z', expr: 'z(E(0, 0, 2*h))', unidade: 'V/m', teoria: 'sig/(2*eps0)' },
        { rotulo: 'Campo dentro da placa +2σ', simbolo: 'E_z', expr: 'z(E(0, 0, 0-h))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Campo dentro da placa −σ', simbolo: 'E_z', expr: 'z(E(0, 0, h))', unidade: 'V/m', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(a) Cada plano',
          texto: r`Gauss com um cilindro atravessando o plano: $E = \dfrac{|\sigma_\text{tot}|}{2\varepsilon_0}$, uniforme. O de $+2\sigma$ dá $\sigma/\varepsilon_0$ para longe dele; o de $-\sigma$, $\sigma/2\varepsilon_0$ para perto dele.`,
        },
        {
          titulo: '(b) Superposição',
          texto: r`Fora, os campos se opõem: $\dfrac{\sigma}{\varepsilon_0} - \dfrac{\sigma}{2\varepsilon_0} = \dfrac{\sigma}{2\varepsilon_0}$, para longe dos planos. Entre eles, somam: $\dfrac{3\sigma}{2\varepsilon_0}$, do $+2\sigma$ para o $-\sigma$.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: '(c) Quatro faces',
          texto: r`Num condutor, $E = 0$ por dentro. Gauss com uma tampa no metal e outra fora dá a densidade de cada face: $\sigma/2$ nas duas faces externas, $+3\sigma/2$ e $-3\sigma/2$ nas internas. A cena monta as quatro faces e confere que o campo some dentro das placas.`,
          medidas: [3, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$+2\sigma$: $\sigma/\varepsilon_0$ para fora; $-\sigma$: $\sigma/2\varepsilon_0$ para dentro.` },
        { item: '(b)', texto: r`Fora: $\sigma/2\varepsilon_0$ para longe; entre: $3\sigma/2\varepsilon_0$, do positivo para o negativo.` },
        { item: '(c)', texto: r`Faces externas $\sigma/2$; internas $+3\sigma/2$ (placa $+2\sigma$) e $-3\sigma/2$ (placa $-\sigma$).` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Planos carregados', lab: 'planos' },
          { texto: 'Condutores em equilíbrio', lab: 'condutores' },
        ],
        etapas: [
          { titulo: 'Plano', texto: r`$\sigma/2\varepsilon_0$.`, passo: 0 },
          { titulo: 'Somar', texto: r`Região por região.`, passo: 1 },
          { titulo: 'Faces', texto: r`E = 0 no metal.`, passo: 2 },
        ],
        resultado: r`$\sigma/2$, $3\sigma/2$, $-3\sigma/2$, $\sigma/2$.`,
        errosComuns: ['Supor que as faces externas ficam sem carga, como num capacitor de cargas opostas iguais.'],
        oficial: { resposta: 'Cada plano: E = σ_tot/2ε₀; fora, σ/2ε₀; entre, 3σ/2ε₀; faces: σ/2 e 3σ/2 na placa +2σ, −3σ/2 e σ/2 na placa −σ.' },
      },
    },
  ],
}

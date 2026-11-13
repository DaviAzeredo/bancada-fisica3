import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P1 } from '../formularios'

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
  formulario: FORMULARIO_P1,
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
        etapas: [
          {
            titulo: 'Fluxos pelas quatro superfícies',
            texto: r`**O que se pede.** O fluxo do campo elétrico (produzido pelas três partículas juntas) através de cada uma das superfícies fechadas $S_1$, $S_2$, $S_3$ e $S_4$.

**A ideia: o que é fluxo.** O fluxo $\Phi = \oint\vec E\cdot d\vec A$ mede quanto campo **atravessa** uma superfície. Em cada pedacinho de área, $d\vec A$ é um vetor perpendicular à superfície, apontando para fora; o produto escalar $\vec E\cdot d\vec A$ é positivo onde o campo sai e negativo onde entra. Somando sobre a superfície fechada inteira, tem-se o fluxo total.

**A lei de Gauss** (formulário):
$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}.$$
O fluxo por uma superfície **fechada** só depende da carga que está **dentro** dela. Cargas de fora criam campo na superfície, mas o campo delas entra de um lado e sai do outro: a contribuição líquida delas é zero. A forma da superfície também não importa.

**A conta.** Basta somar, com sinal, as cargas de dentro de cada superfície, olhando a figura:
- $S_1$ envolve $-2Q$ e $+Q$: $Q_\text{int} = -Q$, logo $\Phi_1 = -\dfrac{Q}{\varepsilon_0}$.
- $S_2$ envolve $+Q$ e $-Q$: $Q_\text{int} = 0$, logo $\Phi_2 = 0$.
- $S_3$ envolve as três: $Q_\text{int} = -2Q + Q - Q = -2Q$, logo $\Phi_3 = -\dfrac{2Q}{\varepsilon_0}$.
- $S_4$ não envolve nenhuma: $\Phi_4 = 0$.

**Cuidado.** Fluxo zero **não** quer dizer campo zero na superfície. Em $S_4$ há campo em todo lugar; ele só entra e sai na mesma quantidade.`,
            passo: 1,
          },
        ],
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
          {
            titulo: '(a) Os sinais e a carga mais intensa',
            texto: r`**O que se pede.** Dizer, só olhando as linhas de campo da figura, o sinal de $q_1$ e de $q_2$ e qual das duas tem módulo maior.

**A ideia.** Linhas de campo são desenhadas seguindo a direção do campo, com setas no sentido dele. Duas regras de leitura:
- o campo de uma carga positiva aponta para longe dela, então as linhas **saem** das cargas positivas e **chegam** nas negativas;
- o número de linhas que sai de (ou chega em) uma carga é desenhado **proporcional** ao módulo dela.

**Lendo a figura.**
- Em $q_2$ as linhas **saem**: $q_2 > 0$.
- Em $q_1$ as linhas **chegam**: $q_1 < 0$.
- Chegam muito mais linhas em $q_1$ do que saem de $q_2$: $|q_1| > |q_2|$. Por isso há linhas que vêm de longe (do "infinito") para fechar em $q_1$: as que saem de $q_2$ não bastam.`,
            passo: 0,
          },
          {
            titulo: '(b) Os fluxos por S₁ e S₂',
            texto: r`**O que se pede.** O fluxo do campo elétrico através das superfícies fechadas $S_1$ e $S_2$, e se cada um é positivo, negativo ou nulo.

**A ideia.** Lei de Gauss (formulário): o fluxo por uma superfície fechada é a carga **dentro** dela dividida por $\varepsilon_0$,
$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}.$$
Fluxo positivo quer dizer que sai mais campo do que entra; negativo, que entra mais do que sai.

**A conta.** Pela figura:
- $S_1$ envolve só $q_1$: $\Phi_{S_1} = \dfrac{q_1}{\varepsilon_0}$, **negativo**, porque $q_1 < 0$. As linhas entram em $S_1$ para chegar em $q_1$.
- $S_2$ envolve as duas cargas: $\Phi_{S_2} = \dfrac{q_1 + q_2}{\varepsilon_0}$. Como $|q_1| > |q_2|$ e os sinais são opostos, a soma é **negativa**. Entra mais linha do que sai.`,
            passo: 1,
          },
          {
            titulo: '(c) A razão q₁/q₂ pelas linhas',
            texto: r`**O que se pede.** Estimar $q_1/q_2$ contando as linhas de campo em volta de cada carga.

**A ideia.** O número de linhas é proporcional ao módulo da carga. Isso vem da própria lei de Gauss: o fluxo por uma superfície pequena em volta de cada carga é $q/\varepsilon_0$, e as linhas representam o fluxo. Então a razão entre as cargas é a razão entre os números de linhas, com o sinal de cada uma.

**A conta.** Na figura, cerca de 16 linhas chegam em $q_1$ e 4 saem de $q_2$:
$$\frac{|q_1|}{|q_2|} \approx \frac{16}{4} = 4.$$
Com os sinais do item (a), $q_1$ negativa e $q_2$ positiva:
$$\frac{q_1}{q_2} \approx -4.$$

**Cuidado.** A intensidade se lê pelo **número de linhas**, não pelo tamanho com que a carga foi desenhada.`,
            passo: 2,
          },
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
          {
            titulo: '(a) O fluxo pela superfície fechada',
            texto: r`**O que se pede.** O fluxo do campo uniforme $E$ pela superfície hemisférica **fechada**: a cúpula mais a base plana, de raio $R$. O campo aponta perpendicular à base, para dentro do hemisfério.

**A ideia.** Lei de Gauss (formulário): o fluxo por uma superfície fechada só depende da carga dentro dela,
$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}.$$

**A conta.** Não há carga nenhuma dentro do hemisfério. O campo uniforme vem de cargas distantes, todas fora. Então
$$\Phi_\text{total} = 0.$$

**Em palavras.** Todo campo que entra pela base sai pela cúpula. Nada nasce nem morre lá dentro.`,
            passo: 0,
          },
          {
            titulo: '(b) O fluxo pela base',
            texto: r`**O que se pede.** O fluxo só pela base plana, um disco de raio $R$.

**A ideia.** Para uma superfície **plana** num campo **uniforme**, a integral do fluxo vira um produto: $\Phi = \vec E\cdot\vec A = EA\cos\alpha$, em que $\vec A$ é o vetor área (módulo igual à área, perpendicular à superfície) e $\alpha$ é o ângulo entre $\vec E$ e $\vec A$. Numa superfície fechada, $\vec A$ aponta sempre **para fora**.

**Montagem.**
- A área da base é $A = \pi R^2$.
- A normal de fora da base aponta para longe do hemisfério.
- O campo entra no hemisfério, perpendicular à base: aponta exatamente **contra** a normal de fora. Então $\alpha = 180°$ e $\cos\alpha = -1$.

**A conta.**
$$\Phi_\text{base} = E\cdot\pi R^2\cdot(-1) = -E\pi R^2.$$

O sinal negativo diz que o campo **entra** pela base.`,
            passo: 1,
          },
          {
            titulo: '(c) O fluxo pela parte curva',
            texto: r`**O que se pede.** O fluxo só pela cúpula (a parte curva).

**A ideia.** Calcular direto seria trabalhoso: na cúpula, o ângulo entre o campo e a normal muda de ponto a ponto. Mas não é preciso. O fluxo total é a soma do fluxo da base com o da cúpula, e o total já é conhecido do item (a).

**A conta.**
$$\Phi_\text{total} = \Phi_\text{base} + \Phi_\text{curva}\quad\Rightarrow\quad0 = -E\pi R^2 + \Phi_\text{curva}\quad\Rightarrow\quad\Phi_\text{curva} = +E\pi R^2.$$

**Interpretação.** Positivo: o campo **sai** pela cúpula. O valor é $E$ vezes a **sombra** que a cúpula projeta num plano perpendicular ao campo, que é um disco de área $\pi R^2$, e não vezes a área da cúpula ($2\pi R^2$). Só a parte da área que fica de frente para o campo conta no fluxo.`,
            passo: 2,
          },
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
          {
            titulo: '(a) A lei de Gauss vale aqui?',
            texto: r`**O que se pede.** Dizer se a lei de Gauss é válida para o cubo carregado com a gaussiana cúbica.

**A ideia.** A lei de Gauss (formulário),
$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0},$$
é uma lei geral do campo eletrostático. Ela vale para **qualquer** distribuição de carga e **qualquer** superfície fechada, com qualquer forma. Não há condição de simetria para ela ser verdadeira.

**Resposta.** **Sim.** O fluxo do campo pela gaussiana cúbica é exatamente $Q/\varepsilon_0$, em que $Q$ é a carga do cubo, que fica toda dentro da gaussiana.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo tem o mesmo módulo em toda a gaussiana?',
            texto: r`**O que se pede.** Dizer se a intensidade do campo é a mesma em todos os pontos da gaussiana cúbica.

**A ideia.** O campo de uma carga fica mais fraco com a distância ($k_0q/r^2$). Para o campo ser o mesmo em todos os pontos de uma superfície, os pontos precisariam "ver" a carga do mesmo jeito.

**Por que não é.** Na gaussiana cúbica, alguns pontos estão bem mais perto do cubo carregado que outros:
- o **centro de uma face** fica na menor distância possível do cubo carregado;
- um **vértice** fica bem mais longe: a diagonal de um cubo é $\sqrt3$ vezes a metade da aresta, contra $1$ vez no centro da face.

Então o campo é mais forte no centro das faces (cerca de três vezes, no caso da cena) do que nos vértices. Além disso, ele não é perpendicular à face em todo lugar: perto das arestas ele se inclina.

**Resposta.** **Não.** O módulo do campo muda de ponto a ponto da gaussiana.`,
            passo: 1,
          },
          {
            titulo: '(c) A mesma forma do objeto basta para achar o campo?',
            texto: r`**O que se pede.** Dizer se escolher uma gaussiana com a mesma forma do objeto (um cubo) permite calcular o campo.

**A ideia: quando Gauss calcula o campo.** A lei dá a **integral** $\oint\vec E\cdot d\vec A$, não o campo em cada ponto. Para tirar $E$ dela, é preciso uma superfície em que, em cada parte:
- $\vec E$ seja **perpendicular** à superfície (ou paralelo a ela, para essa parte dar zero), e
- $|\vec E|$ seja **constante**.

Aí a integral vira $E\times(\text{área})$ e dá para isolar $E$. Isso só acontece com simetria **esférica**, **cilíndrica** (infinita) ou **plana** (infinita): é a simetria do **campo** que importa.

**Por que o cubo não serve.** Pelo item (b), na gaussiana cúbica o campo nem é constante nem perpendicular. A integral não se simplifica e não dá para isolar $E$. Ter a mesma forma do objeto não ajuda. O campo tem a simetria do cubo como um todo (as seis faces são equivalentes), mas isso não o torna constante **dentro** de uma face: o centro dela continua mais perto da carga que as bordas.

**Resposta.** **Não.** A lei vale (item a), mas não resolve: "Gauss vale" é diferente de "Gauss dá o campo".`,
            passo: 2,
          },
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
          {
            titulo: '(a) O fluxo pelo cubo inteiro',
            texto: r`**O que se pede.** O fluxo do campo da carga $q$, posta no centro de uma casca cúbica de aresta $a$, pela superfície inteira do cubo.

**A ideia.** Lei de Gauss (formulário): o fluxo por uma superfície fechada é a carga dentro dela dividida por $\varepsilon_0$, qualquer que seja a forma da superfície:
$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}.$$

**A conta.** A carga dentro do cubo é $q$:
$$\Phi = \frac{q}{\varepsilon_0}.$$
Não depende da aresta $a$: um cubo maior tem mais área, mas o campo é mais fraco lá, e as duas coisas se compensam exatamente.`,
            passo: 0,
          },
          {
            titulo: '(b) O fluxo por uma face',
            texto: r`**O que se pede.** O fluxo por **uma** das seis faces, com a carga no centro.

**A ideia.** **Simetria.** Com a carga no centro, as seis faces estão exatamente na mesma situação em relação a ela: mesma distância, mesma forma, mesma orientação relativa. Girando o cubo, uma face vira a outra sem mudar nada. Logo o fluxo é igual nas seis.

**A conta.** O total do item (a) se divide em seis partes iguais:
$$\Phi_\text{face} = \frac{1}{6}\cdot\frac{q}{\varepsilon_0} = \frac{q}{6\varepsilon_0}.$$

Calcular direto exigiria integrar o campo sobre uma face, onde ele muda de módulo e de direção. A simetria evita a integral.`,
            passo: 1,
          },
          {
            titulo: '(c) A carga num vértice',
            texto: r`**O que se pede.** O fluxo por cada face quando a carga $q$ está num **vértice** do cubo.

**A ideia.** Agora as faces não são todas equivalentes, e a carga está na própria superfície, o que dificulta usar Gauss direto. O truque é **completar a simetria**: junte oito cubos iguais em volta do vértice. Eles formam um cubo maior, de aresta $2a$, com a carga **no centro**.

**Montagem.**
- Pelo item (a), o cubo grande tem fluxo $q/\varepsilon_0$.
- Os oito cubos pequenos estão na mesma situação em relação à carga, então cada um leva um oitavo: $\dfrac{q}{8\varepsilon_0}$ pelas faces que fazem parte da superfície do cubo grande.

**Face por face, no cubo original.**
- As **três faces que tocam o vértice** contêm a carga no seu plano. O campo de $q$ aponta radialmente a partir do vértice, ou seja, **ao longo** dessas faces, nunca atravessando: $\vec E\cdot d\vec A = 0$ e o fluxo é **zero**.
- As **três faces opostas** são as que formam a superfície do cubo grande. Elas são equivalentes entre si (girando em torno da diagonal do cubo, uma vira a outra) e dividem os $q/8\varepsilon_0$:
$$\Phi = \frac13\cdot\frac{q}{8\varepsilon_0} = \frac{q}{24\varepsilon_0}\ \text{em cada face oposta}.$$

**Conferindo.** A soma no cubo é $3\cdot\dfrac{q}{24\varepsilon_0} + 3\cdot0 = \dfrac{q}{8\varepsilon_0}$. O gabarito da monitoria escreve $q/24\varepsilon_0$ "em cada face"; isso vale só para as três faces opostas ao vértice.`,
            passo: 2,
          },
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
          {
            titulo: '(a) Onde Gauss dá o campo em todo o espaço',
            texto: r`**O que se pede.** Entre as cinco distribuições, dizer para quais a lei de Gauss permite obter uma expressão do campo em todo o espaço, e justificar.

**A ideia.** A lei de Gauss (formulário), $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$, dá uma **integral** do campo. Para extrair $E$ dela é preciso achar uma superfície fechada (gaussiana) em que, por **simetria**, o campo tenha módulo constante e seja perpendicular a ela (ou paralelo, nas partes onde então não há fluxo). Aí $\oint\vec E\cdot d\vec A = E\times\text{área}$, e isola-se $E$.

**Caso a caso.**
- **(i) Fio infinito uniforme.** Girar em volta do fio ou deslizar ao longo dele não muda nada: o campo só pode ser radial e depender só da distância ao fio. Gaussiana: cilindro coaxial. **Serve.**
- **(ii) Anel.** O campo num ponto do eixo é diferente do campo num ponto do plano do anel à mesma distância. Não existe superfície fechada onde $E$ seja constante e perpendicular. **Não serve.**
- **(iii) Disco finito.** Mesma situação do anel: só há simetria de rotação em volta do eixo, o que não basta. **Não serve.** (O plano **infinito** serviria.)
- **(iv) Esfera sólida uniforme.** Simetria esférica: o campo é radial e só depende da distância ao centro. Gaussiana: esfera concêntrica. **Serve.**
- **(v) Casca cilíndrica infinita.** Mesma simetria do fio. Gaussiana: cilindro coaxial, dentro ou fora da casca. **Serve.**

**Resposta.** (i), (iv) e (v).`,
            passo: 0,
          },
          {
            titulo: '(b) A lei de Gauss deixa de valer para alguma?',
            texto: r`**O que se pede.** Dizer se a lei de Gauss é falsa para alguma dessas distribuições.

**A ideia.** É preciso separar duas coisas:
- a lei de Gauss **valer**: o fluxo por qualquer superfície fechada é $Q_\text{int}/\varepsilon_0$. Isso é sempre verdade, para qualquer distribuição de cargas paradas;
- a lei de Gauss **servir** para calcular o campo: isso exige a simetria discutida no item (a).

**Resposta.** **Não**: ela vale para todas as cinco. No anel e no disco, se você envolver a distribuição com uma esfera, o fluxo é exatamente $Q/\varepsilon_0$. O que acontece é que, nesses casos, o campo muda de ponto a ponto da gaussiana (no eixo é diferente do que no plano) e não dá para tirá-lo da integral. Para eles, o campo se calcula somando as contribuições de pedacinhos, como na Lista 1.`,
            passo: 1,
          },
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
        etapas: [
          {
            titulo: '(a) O campo é perpendicular à lateral?',
            texto: r`**O que se pede.** Dizer se o campo do fio **finito** (comprimento $L$, carga $Q$) é perpendicular à superfície lateral do cilindro em todos os pontos.

**A ideia.** Cada pedacinho do fio cria um campo que aponta para longe dele (para $Q > 0$). Num ponto da lateral, o campo total é a soma dos campos de todos os pedacinhos. Ele só é perpendicular à lateral (radial) se as componentes **ao longo** do eixo se cancelarem, e isso exige que haja tanto fio "acima" quanto "abaixo" do ponto.

**Ponto a ponto.**
- No **meio** do cilindro, há a mesma quantidade de fio dos dois lados: as componentes ao longo do eixo se cancelam aos pares, e o campo é radial, perpendicular à lateral.
- Perto de uma **ponta**, quase todo o fio fica de um lado só. Os pedacinhos empurram o ponto para longe deles, e o campo ganha uma componente ao longo do eixo, apontando para fora do fio.

**Resposta.** **Não**: só no plano do meio.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo tem o mesmo módulo na lateral?',
            texto: r`**O que se pede.** Dizer se a intensidade do campo é a mesma em todos os pontos da superfície lateral.

**A ideia.** Num ponto da lateral, o campo depende de quão perto está cada pedacinho de fio. Os pontos da lateral estão todos a uma distância $R$ do eixo, mas não estão na mesma posição ao longo do fio.

**Ponto a ponto.**
- No **meio**, o fio se estende por $L/2$ para cada lado: há bastante carga perto do ponto.
- Perto de uma **ponta**, metade do fio que estaria por perto simplesmente não existe (o fio acaba ali), e a outra parte está, em média, mais longe. O campo é mais **fraco**.

**Resposta.** **Não**: o módulo é máximo no meio e cai perto das tampas. Só um fio **infinito** é igual visto de qualquer ponto ao longo dele.`,
            passo: 1,
          },
          {
            titulo: '(c) Dá para usar Gauss com esse cilindro?',
            texto: r`**O que se pede.** Dizer se a lei de Gauss com a superfície $S$ (o cilindro) dá uma expressão para o campo do fio em todo o espaço.

**A ideia.** A lei de Gauss (formulário) diz que $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$. Com o fio inteiro dentro do cilindro, o fluxo total é $Q/\varepsilon_0$: isso continua verdade. Mas, para extrair $E$, o campo precisaria ser constante e perpendicular na lateral, e o fluxo pelas tampas precisaria ser zero. É o que se faz com o fio infinito, onde se chega a $E = \dfrac{\lambda}{2\pi\varepsilon_0s}$.

**Por que não funciona aqui.**
- Pelo item (a), o campo não é perpendicular à lateral em todo ponto.
- Pelo item (b), ele não tem o mesmo módulo.
- Pelo item (a), perto das pontas ele tem componente ao longo do eixo, então **há fluxo pelas tampas**.

A integral não se reduz a $E\times\text{área}$, e não há como isolar $E$.

**Resposta.** **Não.** A lei vale, mas não dá o campo. Usar $E = \lambda/2\pi\varepsilon_0s$ para um fio finito é um erro: essa fórmula só vale para o fio infinito (ou, aproximadamente, bem perto do meio de um fio longo).`,
            passo: 2,
          },
        ],
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
      respostas: [
        { item: '(i)', texto: r`$s < a$: $\vec E = 0$` },
        { item: '(ii)', texto: r`$a < s < b$: $\vec E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$` },
        { item: '(iii)', texto: r`$s > b$: $\vec E = 0$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Gauss com simetria cilíndrica', lab: 'gauss' }],
        etapas: [
          {
            titulo: '(i) Dentro do condutor maciço, s < a',
            texto: r`**O que se pede.** O campo a uma distância $s < a$ do eixo, dentro do cilindro condutor.

**A ideia.** Num **condutor em equilíbrio eletrostático**, o campo no interior do material é zero. Motivo: um condutor tem cargas livres para andar. Se houvesse campo lá dentro, elas se moveriam, e não haveria equilíbrio. As cargas se rearranjam até que o campo interno seja zero. Uma consequência (pela lei de Gauss com uma gaussiana dentro do metal) é que toda a carga em excesso fica na **superfície**.

**Resposta.** $\vec E = 0$ para $s < a$. A carga $\lambda$ do cilindro fica toda na superfície, em $s = a$.`,
            passo: 0,
          },
          {
            titulo: '(ii) Entre os condutores, a < s < b',
            texto: r`**O que se pede.** O campo entre o cilindro e a casca.

**A ideia.** Lei de Gauss (formulário), $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$, com uma gaussiana escolhida pela simetria. O cabo é infinito e igual em volta do eixo. Girar ou deslizar ao longo dele não muda nada, então o campo só pode ser **radial** (apontar para longe do eixo, ou para ele) e seu módulo só pode depender de $s$.

**Montagem.** Gaussiana: um cilindro de raio $s$ e comprimento $l$, com o mesmo eixo do cabo.
- Na **lateral**, o campo é perpendicular à superfície e tem o mesmo módulo em todos os pontos: o fluxo é $E\cdot2\pi sl$ (área lateral = perímetro × comprimento).
- Nas **tampas**, o campo radial é paralelo à superfície: fluxo zero.
- Carga dentro: só o trecho de comprimento $l$ do cilindro de dentro, $Q_\text{int} = \lambda l$. A casca, em $s = b$, fica de fora.

**A conta.**
$$E\cdot2\pi sl = \frac{\lambda l}{\varepsilon_0}\quad\Rightarrow\quad\vec E = \frac{\lambda}{2\pi\varepsilon_0s}\,\hat s.$$
O $l$ cancela, como deveria: o comprimento escolhido para a gaussiana não pode mudar o campo. O resultado é o mesmo de um fio infinito com densidade $\lambda$ no eixo.`,
            passo: 1,
          },
          {
            titulo: '(iii) Fora do cabo, s > b',
            texto: r`**O que se pede.** O campo fora do cabo.

**A ideia.** A mesma gaussiana do item (ii), agora com raio $s > b$, envolvendo o cilindro **e** a casca. Pela mesma simetria, o fluxo é $E\cdot2\pi sl$.

**A conta.** A carga dentro é a do cilindro mais a da casca, num trecho de comprimento $l$:
$$Q_\text{int} = \lambda l + (-\lambda)l = 0\quad\Rightarrow\quad E\cdot2\pi sl = 0\quad\Rightarrow\quad\vec E = 0.$$

**Por que isso importa.** O cabo coaxial "prende" o campo entre os dois condutores. Fora dele não há campo, e o cabo nem perturba nem é perturbado pelo que está em volta. É por isso que esse tipo de cabo é usado para levar sinais (antena, internet).`,
            passo: 2,
          },
        ],
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
          {
            titulo: '(a) A densidade linear de carga',
            texto: r`**O que se pede.** A carga por unidade de comprimento $\lambda$ do cilindro infinito de raio $R$, cuja densidade volumétrica é $\rho = \rho_0\dfrac sR$ ($s$ é a distância ao eixo).

**A ideia.** $\rho$ é carga por volume. Como ela depende de $s$, corta-se o cilindro em **cascas cilíndricas** finas, de raio $s$ e espessura $ds$: em cada uma, $\rho$ é praticamente constante. Carga da casca = $\rho$ × volume da casca.

**Montagem.** Considere um trecho de comprimento $l$. A casca de raio $s$, desenrolada, é quase uma placa de lados $2\pi s$ e $l$, com espessura $ds$: volume $dV = 2\pi s\,l\,ds$. Sua carga é
$$dq = \rho_0\frac sR\,2\pi s\,l\,ds.$$

**A conta.** Somando as cascas de $s = 0$ a $s = R$ e dividindo por $l$:
$$\lambda = \frac{1}{l}\int_0^R\rho_0\frac sR\,2\pi sl\,ds = \frac{2\pi\rho_0}{R}\int_0^Rs^2\,ds = \frac{2\pi\rho_0}{R}\cdot\frac{R^3}{3} = \frac{2\pi\rho_0R^2}{3}.$$

**Conferindo.** Se a densidade fosse uniforme, $\rho_0$, daria $\rho_0\pi R^2$. Com $\rho$ crescendo de $0$ a $\rho_0$, a carga é menor: $\tfrac23$ disso.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo fora do cilindro, s ≥ R',
            texto: r`**O que se pede.** O campo para $s \ge R$, e mostrar que é igual ao de um fio fino infinito com a densidade $\lambda$ do item (a).

**A ideia.** Lei de Gauss (formulário), $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$. O cilindro é infinito e a carga só depende de $s$: girar ou deslizar ao longo do eixo não muda nada. Logo o campo é **radial** e seu módulo depende só de $s$.

**Montagem.** Gaussiana: cilindro coaxial de raio $s$ e comprimento $l$.
- Lateral: campo perpendicular e de módulo constante, fluxo $E\cdot2\pi sl$.
- Tampas: campo paralelo a elas, fluxo zero.
- Carga dentro: o cilindro inteiro num trecho $l$, $Q_\text{int} = \lambda l$.

**A conta.**
$$E\cdot2\pi sl = \frac{\lambda l}{\varepsilon_0}\quad\Rightarrow\quad\vec E = \frac{\lambda}{2\pi\varepsilon_0s}\,\hat s = \frac{\rho_0R^2}{3\varepsilon_0s}\,\hat s.$$

**A comparação pedida.** A expressão do meio é exatamente o campo de um fio fino infinito com densidade $\lambda$. De fora, a lei de Gauss só "enxerga" a carga total por comprimento, e não como ela se distribui lá dentro.`,
            passo: 1,
          },
          {
            titulo: '(c) O campo dentro do cilindro, s < R',
            texto: r`**O que se pede.** O campo para $s < R$, dentro do cilindro.

**A ideia.** A mesma gaussiana e a mesma simetria do item (b), com uma diferença: agora a gaussiana de raio $s$ envolve **só parte** da carga, a que está entre o eixo e $s$.

**Montagem.** A carga dentro, por comprimento, é a integral do item (a) parando em $s$ (troque o limite $R$ por $s$; use $s'$ como variável de integração):
$$\frac{Q_\text{int}}{l} = \frac{2\pi\rho_0}{R}\int_0^{s}s'^2\,ds' = \frac{2\pi\rho_0s^3}{3R}.$$

**A conta.**
$$E\cdot2\pi sl = \frac{1}{\varepsilon_0}\cdot\frac{2\pi\rho_0s^3}{3R}\,l\quad\Rightarrow\quad\vec E = \frac{\rho_0s^2}{3\varepsilon_0R}\,\hat s.$$

**Conferindo.** No eixo ($s = 0$) o campo é zero, como exige a simetria. Na superfície ($s = R$) dá $\dfrac{\rho_0R}{3\varepsilon_0}$, o mesmo valor do item (b) em $s = R$.`,
            passo: 2,
          },
          {
            titulo: '(d) O gráfico de E em função de s',
            texto: r`**O que se pede.** Esboçar $E(s)$ e destacar os pontos importantes.

**Juntando (b) e (c).**
- De $s = 0$ a $s = R$: $E = \dfrac{\rho_0s^2}{3\varepsilon_0R}$, uma **parábola** que começa em zero no eixo e cresce.
- Em $s = R$: o máximo, $E_\text{máx} = \dfrac{\rho_0R}{3\varepsilon_0}$.
- Para $s > R$: $E = \dfrac{\rho_0R^2}{3\varepsilon_0s}$, cai como $1/s$ e tende a zero longe.

**Pontos para destacar.** $E = 0$ no eixo; o máximo em $s = R$; e a **continuidade** em $s = R$: as duas expressões dão o mesmo valor ali. O campo só dá salto onde há carga numa **superfície** (densidade superficial); uma carga espalhada num volume não produz salto.`,
            passo: 3,
          },
        ],
        resultado: r`(a) $\lambda = \dfrac{2\pi\rho_0R^2}{3}$. (b) $\vec E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$ fora. (c) $\vec E = \dfrac{\rho_0s^2}{3\varepsilon_0R}\hat s$ dentro. (d) Parábola até $R$, depois $1/s$, sem salto.`,
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
        etapas: [
          {
            titulo: '(a) O campo fora da placa, |z| > d',
            texto: r`**O que se pede.** O vetor campo nos pontos fora da placa, que é infinita, tem espessura $2d$ (de $z = -d$ a $z = d$) e densidade de carga $\rho > 0$ uniforme.

**A ideia: a simetria.** A placa é infinita nas direções $x$ e $y$: deslizar para os lados não muda nada. Então o campo não pode ter componente em $x$ nem em $y$; ele aponta ao longo de $z$ e seu módulo só depende de $z$. A placa também é simétrica em relação ao plano $z = 0$: o campo em $-z$ é o espelho do campo em $z$. Com $\rho > 0$, ele aponta **para longe** do plano do meio, dos dois lados.

**A lei de Gauss** (formulário): $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$.

**Montagem.** Gaussiana: um cilindro (uma "lata") com o eixo ao longo de $z$, tampas de área $A$ em $z$ e em $-z$, simétricas.
- Nas duas tampas, o campo é perpendicular e aponta para fora da lata, com o mesmo módulo $E$: fluxo $EA$ em cada uma.
- Na lateral, o campo (ao longo de $z$) é paralelo à superfície: fluxo zero.
- Com $|z| > d$, a lata atravessa a placa inteira: a carga dentro é $\rho\times(\text{volume da placa na lata}) = \rho\cdot2d\cdot A$.

**A conta.**
$$2EA = \frac{\rho\,2dA}{\varepsilon_0}\quad\Rightarrow\quad E = \frac{\rho d}{\varepsilon_0}.$$
Com o sentido, $\vec E = +\dfrac{\rho d}{\varepsilon_0}\hat z$ para $z > d$ e $\vec E = -\dfrac{\rho d}{\varepsilon_0}\hat z$ para $z < -d$. Numa linha só: $\vec E = \dfrac{\rho d}{\varepsilon_0}\dfrac{z}{|z|}\hat z$.

**Conferindo.** Fora, o campo **não depende da distância**: é o mesmo de um plano infinito com densidade superficial $\sigma = 2\rho d$, que dá $\sigma/2\varepsilon_0$.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo dentro da placa, |z| ≤ d',
            texto: r`**O que se pede.** O vetor campo nos pontos dentro da placa.

**A ideia.** A mesma simetria e a mesma lata do item (a), agora com as tampas em $\pm z$ **dentro** da placa ($|z| \le d$). A diferença é que a lata só envolve parte da carga.

**Montagem.** O fluxo continua $2EA$ (duas tampas, lateral sem fluxo). A carga dentro é a da fatia de espessura $2|z|$:
$$Q_\text{int} = \rho\cdot2|z|\cdot A.$$

**A conta.**
$$2EA = \frac{\rho\,2|z|A}{\varepsilon_0}\quad\Rightarrow\quad E = \frac{\rho|z|}{\varepsilon_0}.$$
O campo aponta para longe do plano do meio: para $+\hat z$ quando $z > 0$ e para $-\hat z$ quando $z < 0$. Com isso, o sinal de $z$ já dá o sentido:
$$\vec E = \frac{\rho z}{\varepsilon_0}\,\hat z.$$

**Conferindo.** No plano do meio ($z = 0$) o campo é zero: as cargas de cima e de baixo empurram para lados opostos na mesma medida. Na superfície ($z = d$) ele vale $\rho d/\varepsilon_0$, igual ao do item (a).`,
            passo: 1,
          },
          {
            titulo: '(c) O gráfico da componente z do campo',
            texto: r`**O que se pede.** Esboçar a componente $E_z$ como função de $z$.

**Juntando (a) e (b).**
- Para $z < -d$: $E_z = -\dfrac{\rho d}{\varepsilon_0}$, constante (reta horizontal abaixo do eixo).
- Para $-d \le z \le d$: $E_z = \dfrac{\rho z}{\varepsilon_0}$, uma **reta inclinada** que passa pela origem.
- Para $z > d$: $E_z = +\dfrac{\rho d}{\varepsilon_0}$, constante.

**Pontos para destacar.** $E_z = 0$ em $z = 0$; os valores $\pm\rho d/\varepsilon_0$ em $z = \pm d$; e a **continuidade** nas faces da placa. Não há salto porque a carga está espalhada num volume, e não concentrada numa superfície. O gráfico tem forma de "S" achatado, ímpar em $z$: $E_z(-z) = -E_z(z)$.`,
            passo: 2,
          },
        ],
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
          {
            titulo: '(a) O campo na cavidade, r < a',
            texto: r`**O que se pede.** O campo num ponto da cavidade, entre a carga $q$ (no centro) e a face interna da casca condutora, de raio $a$.

**A ideia.** Lei de Gauss (formulário), $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$, com simetria esférica: carga no centro e casca esférica concêntrica. Girar o sistema em volta do centro não muda nada, então o campo é **radial** e só depende da distância $r$ ao centro.

**Montagem.** Gaussiana: esfera de raio $r < a$, centrada na carga. Nela o campo é perpendicular e tem o mesmo módulo em todo ponto, então o fluxo é $E\cdot4\pi r^2$. A carga dentro é só $q$: a casca está fora.

**A conta.**
$$E\cdot4\pi r^2 = \frac{q}{\varepsilon_0}\quad\Rightarrow\quad\vec E = \frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\,\hat r.$$

É o campo da carga $q$ sozinha. As cargas induzidas na casca estão distribuídas por igual numa esfera em volta do ponto, e não contribuem para o campo lá dentro.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo dentro do metal, a < r < b',
            texto: r`**O que se pede.** O campo num ponto do material da casca.

**A ideia.** O enunciado diz que o sistema está em **equilíbrio eletrostático**. Num condutor, as cargas são livres para andar. Se houvesse campo dentro do metal, ele empurraria essas cargas e elas estariam se movendo, o que contradiz o equilíbrio. Então, no equilíbrio, as cargas do condutor se arrumam exatamente de modo a anular o campo no interior do material.

**Resposta.** $\vec E = 0$ para $a < r < b$.`,
            passo: 1,
          },
          {
            titulo: '(c) O campo fora da casca, r > b',
            texto: r`**O que se pede.** O campo num ponto fora da casca.

**A ideia.** A mesma lei de Gauss e a mesma simetria esférica do item (a), com uma gaussiana de raio $r > b$, que envolve a carga **e** a casca inteira.

**Montagem.** Fluxo: $E\cdot4\pi r^2$. Carga dentro: $q$ mais a carga total da casca. A casca é **neutra**: as cargas induzidas nela (item d) somam zero. Logo $Q_\text{int} = q$.

**A conta.**
$$E\cdot4\pi r^2 = \frac{q}{\varepsilon_0}\quad\Rightarrow\quad\vec E = \frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\,\hat r.$$

De fora, é como se a casca não existisse: o campo é o da carga $q$ no centro.`,
            passo: 2,
          },
          {
            titulo: '(d) As cargas induzidas nas duas faces',
            texto: r`**O que se pede.** A densidade superficial de carga $\sigma$ (carga por área) na face interna ($r = a$) e na externa ($r = b$) da casca.

**A ideia.** Usar o resultado do item (b): o campo no metal é zero. Pela lei de Gauss, isso diz quanta carga há dentro de qualquer superfície que passe pelo metal.

**Face interna.** Tome uma gaussiana esférica de raio entre $a$ e $b$, toda dentro do metal. Nela $E = 0$, então o fluxo é zero, e a carga dentro tem de ser **zero**. Dentro dela estão $q$ e a carga da face interna. Logo a face interna tem $-q$. Espalhada por igual (simetria) numa esfera de área $4\pi a^2$:
$$\sigma_a = -\frac{q}{4\pi a^2}.$$

**Face externa.** A casca é neutra: a carga total dela é zero. Se a face interna tem $-q$, a externa tem $+q$:
$$\sigma_b = +\frac{q}{4\pi b^2}.$$

**Em palavras.** A carga $q$ atrai cargas negativas da casca para perto dela (face interna) e empurra as positivas para longe (face externa). É a **indução**.`,
            passo: 3,
          },
          {
            titulo: '(e) E se a casca tivesse carga Q?',
            texto: r`**O que se pede.** Quais respostas mudariam se a casca tivesse uma carga total $Q$, em vez de ser neutra.

**Item por item.**
- **(a) Cavidade:** não muda. A gaussiana dentro da cavidade continua envolvendo só $q$, e a carga na casca está distribuída por igual em volta.
- **(b) Metal:** não muda. Condutor em equilíbrio tem campo zero dentro, com qualquer carga.
- **Face interna (parte de d):** não muda. A gaussiana dentro do metal ainda exige carga total zero lá dentro, então a face interna continua com $-q$, e $\sigma_a = -\dfrac{q}{4\pi a^2}$.
- **Face externa (parte de d):** **muda**. A casca tem carga total $Q$ e já há $-q$ na face interna, então a externa fica com $Q + q$:
$$\sigma_b = \frac{q + Q}{4\pi b^2}.$$
- **(c) Fora:** **muda**. A gaussiana de fora envolve $q + Q$:
$$\vec E = \frac{1}{4\pi\varepsilon_0}\frac{q + Q}{r^2}\,\hat r.$$

**Resposta.** Mudam (c) e a densidade da face externa em (d).`,
            passo: 4,
          },
        ],
        resultado: r`(a) $\dfrac{q}{4\pi\varepsilon_0r^2}\hat r$. (b) $0$. (c) $\dfrac{q}{4\pi\varepsilon_0r^2}\hat r$. (d) $\sigma_a = -\dfrac{q}{4\pi a^2}$, $\sigma_b = \dfrac{q}{4\pi b^2}$. (e) Mudam (c) e $\sigma_b$: entra $q + Q$.`,
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
          {
            titulo: '(a) A densidade da nuvem eletrônica',
            texto: r`**O que se pede.** A densidade volumétrica de carga $\rho$ (carga por volume) da nuvem: uma esfera maciça de raio $a_0$ com carga $-e$ uniforme.

**A ideia.** Uniforme quer dizer a mesma em todo o volume: $\rho = \dfrac{\text{carga}}{\text{volume}}$.

**A conta.** O volume de uma esfera de raio $a_0$ é $\tfrac43\pi a_0^3$:
$$\rho = \frac{-e}{\tfrac43\pi a_0^3} = -\frac{3e}{4\pi a_0^3}.$$
Negativa, porque a carga do elétron é negativa.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo do átomo, dentro e fora',
            texto: r`**O que se pede.** O campo a uma distância $r$ do centro, para $r \le a_0$ (dentro da nuvem) e para $r > a_0$ (fora), usando a lei de Gauss.

**A ideia.** Lei de Gauss (formulário): $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$. O próton está no centro e a nuvem é uma esfera uniforme centrada nele: **simetria esférica**. O campo é radial e só depende de $r$. Numa gaussiana esférica de raio $r$, centrada no próton, o fluxo é $E\cdot4\pi r^2$.

**Dentro ($r \le a_0$).** A gaussiana envolve o próton inteiro ($+e$) e só **parte** da nuvem, a que está numa esfera de raio $r$:
$$Q_\text{int} = e + \rho\cdot\tfrac43\pi r^3 = e - e\frac{r^3}{a_0^3}.$$
(A fração da nuvem dentro é a razão entre os volumes, $r^3/a_0^3$.) Então:
$$E\cdot4\pi r^2 = \frac{e}{\varepsilon_0}\left(1 - \frac{r^3}{a_0^3}\right)\quad\Rightarrow\quad E = \frac{e}{4\pi\varepsilon_0}\left(\frac{1}{r^2} - \frac{r}{a_0^3}\right).$$
Positivo: aponta para fora do centro.

**Fora ($r > a_0$).** A gaussiana envolve o próton e a nuvem inteira: $Q_\text{int} = e - e = 0$. Então $E = 0$: de fora, o átomo é neutro.

**Conferindo.** Perto do centro, o termo $1/r^2$ domina: é o campo do próton sozinho. Em $r = a_0$ os dois termos se cancelam e o campo vai a zero, emendando com o resultado de fora.`,
            passo: 1,
          },
          {
            titulo: '(c) O valor em r = a₀/2',
            texto: r`**O que se pede.** A intensidade do campo em $r = a_0/2$, com $a_0 = 0{,}53\times10^{-10}$ m, $k_0 = 9{,}0\times10^9$ N·m²/C² e $e = 1{,}6\times10^{-19}$ C.

**A ideia.** Pôr $r = a_0/2$ na expressão de dentro do item (b), escrita com $k_0 = \dfrac{1}{4\pi\varepsilon_0}$:
$$E = k_0e\left(\frac{1}{r^2} - \frac{r}{a_0^3}\right).$$

**A conta.**
- $\dfrac{1}{r^2} = \dfrac{1}{(a_0/2)^2} = \dfrac{4}{a_0^2}$;
- $\dfrac{r}{a_0^3} = \dfrac{a_0/2}{a_0^3} = \dfrac{1}{2a_0^2}$.

Então
$$E = \frac{k_0e}{a_0^2}\left(4 - \frac12\right) = 3{,}5\,\frac{(9{,}0\times10^9)(1{,}6\times10^{-19})}{(0{,}53\times10^{-10})^2} = 3{,}5\times\frac{1{,}44\times10^{-9}}{2{,}81\times10^{-21}} \approx 1{,}8\times10^{12}\ \text{N/C}.$$

**Para ter noção.** É um campo enorme: o ar deixa de ser isolante com uns $3\times10^6$ N/C.`,
            passo: 2,
          },
          {
            titulo: '(d) O gráfico de E em função de r',
            texto: r`**O que se pede.** Esboçar a intensidade do campo em função de $r$.

**Juntando o item (b).**
- Perto do centro ($r \to 0$): $E \approx \dfrac{k_0e}{r^2}$, cresce sem limite (o próton é pontual).
- De $0$ a $a_0$: $E = k_0e\left(\dfrac{1}{r^2} - \dfrac{r}{a_0^3}\right)$ **diminui** sempre, porque o primeiro termo cai e o segundo cresce.
- Em $r = a_0$: $E = 0$.
- Para $r > a_0$: $E = 0$.

**O desenho.** Uma curva que desce do infinito, perto da origem, até tocar o zero em $r = a_0$, e depois fica em cima do eixo. A nuvem negativa "blinda" o próton: quanto mais da nuvem fica dentro da gaussiana, menor a carga líquida que ela envolve.`,
            passo: 3,
          },
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
        etapas: [
          {
            titulo: 'E na cavidade: a demonstração',
            texto: r`**O que se pede.** Mostrar que, dentro da cavidade esférica de uma esfera uniformemente carregada (densidade $\rho$), o campo é **uniforme** e vale $E = \dfrac{\rho d}{3\varepsilon_0}$, em que $d$ é a distância entre o centro da esfera e o centro da cavidade.

**Por que não dá para usar Gauss direto.** Com a cavidade fora do centro, a distribuição não tem simetria esférica em volta de nenhum ponto. Não há gaussiana em que o campo seja constante. O caminho é a **superposição**.

**Passo 1: o campo dentro de uma esfera maciça uniforme.** Lei de Gauss (formulário), numa esfera sem cavidade, de densidade $\rho$, com gaussiana esférica concêntrica de raio $r$ (dentro da esfera). Por simetria, o campo é radial, com fluxo $E\cdot4\pi r^2$, e a carga dentro é $\rho\cdot\tfrac43\pi r^3$:
$$E\cdot4\pi r^2 = \frac{\rho\,\tfrac43\pi r^3}{\varepsilon_0}\quad\Rightarrow\quad E = \frac{\rho r}{3\varepsilon_0}.$$
Como aponta para longe do centro, em forma vetorial: $\vec E = \dfrac{\rho}{3\varepsilon_0}\vec r$, com $\vec r$ o vetor **do centro até o ponto**.

**Passo 2: a cavidade como soma de duas esferas.** Uma esfera com um buraco é igual a:
- uma esfera **cheia**, de densidade $+\rho$, com centro $O$; mais
- uma esfera menor, do tamanho da cavidade, com densidade $-\rho$ e centro $O'$, no lugar do buraco.

Na região da cavidade, $+\rho$ e $-\rho$ se somam e dão zero, que é exatamente o buraco.

**Passo 3: somar os dois campos.** Num ponto $P$ da cavidade, chame de $\vec r$ o vetor de $O$ até $P$ e de $\vec r\,'$ o vetor de $O'$ até $P$. O ponto está dentro das **duas** esferas, então vale o passo 1 para cada uma:
$$\vec E = \frac{\rho}{3\varepsilon_0}\vec r + \frac{-\rho}{3\varepsilon_0}\vec r\,' = \frac{\rho}{3\varepsilon_0}\left(\vec r - \vec r\,'\right).$$
Mas $\vec r - \vec r\,'$ é o vetor de $O$ até $O'$, o mesmo para qualquer ponto $P$: chame-o de $\vec d$. Então
$$\vec E = \frac{\rho}{3\varepsilon_0}\vec d.$$

**Conclusão.** O resultado não depende de onde $P$ está na cavidade: o campo é **uniforme**, aponta do centro da esfera para o centro da cavidade (para $\rho > 0$) e tem módulo $\rho d/3\varepsilon_0$.`,
            passo: 0,
          },
        ],
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
          {
            titulo: '(a) O campo de cada plano sozinho',
            texto: r`**O que se pede.** Pela lei de Gauss, o campo que cada plano produz em todo o espaço, como se o outro não existisse. Um tem densidade superficial total $+2\sigma$; o outro, $-\sigma$.

**A ideia: o campo de um plano infinito.** Plano infinito com densidade uniforme $\sigma_\text{tot}$:
- **simetria:** deslizar para os lados não muda nada, então o campo é perpendicular ao plano e só depende da distância a ele; dos dois lados, um é o espelho do outro;
- **gaussiana:** uma "lata" cilíndrica atravessando o plano, com tampas de área $A$ paralelas a ele, uma de cada lado.

O fluxo sai pelas duas tampas ($EA$ cada) e é zero na lateral (campo paralelo a ela). A carga dentro é $\sigma_\text{tot}A$. Pela lei de Gauss (formulário):
$$2EA = \frac{|\sigma_\text{tot}|A}{\varepsilon_0}\quad\Rightarrow\quad E = \frac{|\sigma_\text{tot}|}{2\varepsilon_0}.$$
É uniforme: não depende da distância ao plano. Aponta para longe do plano se ele é positivo, e para o plano se é negativo.

**Aplicando.**
- Plano $+2\sigma$: $E = \dfrac{2\sigma}{2\varepsilon_0} = \dfrac{\sigma}{\varepsilon_0}$, **para longe** dele, dos dois lados.
- Plano $-\sigma$: $E = \dfrac{\sigma}{2\varepsilon_0}$, **para** ele, dos dois lados.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo total, região por região',
            texto: r`**O que se pede.** O campo dos dois planos juntos em todo o espaço.

**A ideia.** Superposição: o campo total é a soma vetorial dos campos do item (a). Os planos dividem o espaço em três regiões; em cada uma é preciso ver para que lado aponta cada campo.

**Montagem.** Ponha o plano $+2\sigma$ à esquerda e o $-\sigma$ à direita, com o eixo apontando para a direita.

**A conta, região por região.**
- **À esquerda dos dois:** o $+2\sigma$ empurra para longe dele, para a esquerda ($-\sigma/\varepsilon_0$); o $-\sigma$ puxa para ele, para a direita ($+\sigma/2\varepsilon_0$). Soma: $-\dfrac{\sigma}{2\varepsilon_0}$, ou seja, $\dfrac{\sigma}{2\varepsilon_0}$ apontando **para a esquerda**, para longe dos planos.
- **Entre os planos:** o $+2\sigma$ empurra para a direita ($+\sigma/\varepsilon_0$); o $-\sigma$ puxa para a direita também ($+\sigma/2\varepsilon_0$). Soma: $\dfrac{3\sigma}{2\varepsilon_0}$, **do positivo para o negativo**.
- **À direita dos dois:** o $+2\sigma$ empurra para a direita ($+\sigma/\varepsilon_0$); o $-\sigma$ puxa para a esquerda ($-\sigma/2\varepsilon_0$). Soma: $\dfrac{\sigma}{2\varepsilon_0}$, **para a direita**, para longe dos planos.

**Conferindo.** Fora, é como se houvesse um único plano com a carga total $2\sigma - \sigma = \sigma$, que daria $\sigma/2\varepsilon_0$ para longe. Ao contrário de um capacitor comum (cargas $+Q$ e $-Q$), aqui há campo fora, porque a carga total não é zero.`,
            passo: 1,
          },
          {
            titulo: '(c) A carga em cada uma das quatro faces',
            texto: r`**O que se pede.** Tratando os planos como placas condutoras finas, a densidade de carga em cada uma das quatro faces (duas por placa).

**A ideia.** Duas coisas:
- dentro do **metal** de um condutor em equilíbrio, o campo é **zero**;
- uma "lata" gaussiana com uma tampa dentro do metal e a outra logo fora da face envolve só a carga daquela face. O fluxo vem só da tampa de fora (dentro do metal $E = 0$, e na lateral o campo é paralelo). Pela lei de Gauss, $E_\text{fora}A = \dfrac{\sigma_\text{face}A}{\varepsilon_0}$, então
$$\sigma_\text{face} = \varepsilon_0E_\text{fora},$$
em que $E_\text{fora}$ é o campo logo fora da face, contado como positivo se aponta **para fora** do metal.

**A conta, com os campos do item (b).**
- **Placa $+2\sigma$, face de fora** (esquerda): o campo é $\sigma/2\varepsilon_0$ para a esquerda, para fora do metal. $\sigma = +\dfrac{\sigma}{2}$.
- **Placa $+2\sigma$, face de dentro**: o campo é $3\sigma/2\varepsilon_0$ para a direita, para fora do metal. $\sigma = +\dfrac{3\sigma}{2}$.
- **Placa $-\sigma$, face de dentro**: o campo é $3\sigma/2\varepsilon_0$ para a direita, **entrando** no metal. $\sigma = -\dfrac{3\sigma}{2}$.
- **Placa $-\sigma$, face de fora** (direita): o campo é $\sigma/2\varepsilon_0$ para a direita, para fora do metal. $\sigma = +\dfrac{\sigma}{2}$.

**Conferindo.** Placa da esquerda: $\tfrac12\sigma + \tfrac32\sigma = 2\sigma$. Placa da direita: $-\tfrac32\sigma + \tfrac12\sigma = -\sigma$. As faces que se olham têm cargas iguais e opostas, como num capacitor, e o excesso, $\sigma$ no total, se divide igualmente entre as duas faces de fora.`,
            passo: 2,
          },
        ],
        resultado: r`$\sigma/2$, $3\sigma/2$, $-3\sigma/2$, $\sigma/2$.`,
        errosComuns: ['Supor que as faces externas ficam sem carga, como num capacitor de cargas opostas iguais.'],
        oficial: { resposta: 'Cada plano: E = σ_tot/2ε₀; fora, σ/2ε₀; entre, 3σ/2ε₀; faces: σ/2 e 3σ/2 na placa +2σ, −3σ/2 e σ/2 na placa −σ.' },
      },
    },
  ],
}

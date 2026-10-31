import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: ângulo sólido de um quadrado de lado s visto a distância d, no eixo. */
const Omega = (s: string, d: string) => `4*atan((${s}/2)^2/((${d})*sqrt(2*(${s}/2)^2 + (${d})^2)))`

/**
 * P2 de Física III, 2025/2, diurno, versão C (03/11/2025). Conferida com o
 * gabarito oficial: objetivas 1f, 2d, 3b, 4a, 5e, 6c, e a discursiva.
 */
export const p2_2025_2_diurno: ProvaInput = {
  id: 'p2-2025-2-diurno',
  titulo: 'P2 · 2025/2 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão C · 03/11/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Aproximar as placas com a carga constante',
      resumo: 'O que muda em C, U e na densidade de energia.',
      enunciado: r`As placas de um capacitor de placas planas e paralelas, no vácuo, estão separadas por uma distância $L$. Elas são aproximadas até $L/2$, com a carga mantida constante (capacitor isolado). Afirmativas: (I) A capacitância dobra após as placas serem aproximadas. (II) A energia potencial eletrostática armazenada não se altera. (III) A densidade de energia eletrostática na região entre as placas não se altera. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 1, recorte: [0.1, 0.46, 0.49, 0.685] },
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [26, 20, 74], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'frac',
          rotulo: 'Separação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'L (antes)' },
            { valor: 0.5, rotulo: 'L/2 (depois)' },
          ],
        },
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'L', rotulo: 'Separação inicial', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', rotulo: 'Capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'L*frac', Q: 'Q0' },
        { id: 'cL', tipo: 'cota', a: ['-L*frac/2', '-0.55*lado', 0], b: ['L*frac/2', '-0.55*lado', 0], rotulo: 'separação' },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância', simbolo: 'C', expr: "C('cap')", unidade: 'F', teoria: 'eps0*lado^2/(L*frac)' },
        { rotulo: 'Campo entre as placas', simbolo: 'E', expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: 'Q0/(eps0*lado^2)' },
        { rotulo: 'Energia armazenada', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: 'Q0^2*L*frac/(2*eps0*lado^2)' },
        { rotulo: 'Densidade de energia', simbolo: 'u', expr: 'eps0/2*mag(E(0, 0, 0))^2', unidade: 'J/m³', teoria: 'Q0^2/(2*eps0*lado^4)' },
      ],
      passos: [
        {
          titulo: 'O que fica fixo',
          texto: r`Isolado, o capacitor mantém a **carga** $Q$. O campo entre as placas depende só da densidade de carga:

$$E = \frac{\sigma}{\varepsilon_0} = \frac{Q}{\varepsilon_0A},$$

e não da distância entre elas.`,
          parametros: { frac: 1 },
          medidas: [1],
        },
        {
          titulo: '(I) Capacitância',
          previsao: { pergunta: 'Reduzindo a separação à metade, a capacitância…', opcoes: ['cai à metade', 'não muda', 'dobra'], correta: 2 },
          texto: r`$$C = \frac{\varepsilon_0A}{d}$$

Com $d = L/2$, $C$ **dobra**. Verdadeira.`,
          parametros: { frac: 0.5 },
          medidas: [0],
        },
        {
          titulo: '(II) Energia',
          texto: r`Com $Q$ fixo, a forma útil é

$$U = \frac{Q^2}{2C}.$$

Como $C$ dobrou, $U$ **cai à metade**. Falsa. As placas se atraem: o campo elétrico fez trabalho positivo ao aproximá-las, e essa energia saiu do capacitor.`,
          parametros: { frac: 0.5 },
          medidas: [2],
        },
        {
          titulo: '(III) Densidade de energia',
          texto: r`$$u = \frac{\varepsilon_0E^2}{2}$$

$E$ não mudou, então $u$ **não muda**. Verdadeira. A energia total caiu porque o volume com campo caiu à metade.`,
          parametros: { frac: 0.5 },
          medidas: [1, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`(I) e (III) são verdadeiras: alternativa **(f)**.`,
          parametros: { frac: 0.5 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Capacitância de placas paralelas', lab: 'capacitor' },
          { texto: 'Energia e densidade de energia' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`$C = \varepsilon_0A/d$: dividir $d$ por 2 dobra $C$. Verdadeira.`, passo: 1 },
          { titulo: '(II)', texto: r`$U = Q^2/2C$ com $Q$ fixo: $U$ cai à metade. Falsa.`, passo: 2 },
          { titulo: '(III)', texto: r`$E = Q/\varepsilon_0A$ não depende de $d$, então $u = \varepsilon_0E^2/2$ não muda. Verdadeira.`, passo: 3 },
        ],
        resultado: r`(I) e (III): alternativa **(f)**.`,
        errosComuns: [
          r`Usar $U = CV^2/2$ com $V$ fixo: quem fica fixo aqui é a carga.`,
          r`Achar que o campo aumenta ao aproximar as placas. Com $Q$ fixo, ele não depende de $d$; quem cai é $V = Ed$.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Todas.', porque: r`A (II) é falsa: com $Q$ fixo, $U = Q^2/2C$ cai à metade.` },
        { letra: 'b', texto: 'Apenas a (I).', porque: r`Falta a (III): o campo não muda, logo $u$ também não.` },
        { letra: 'c', texto: 'Apenas a (II).', porque: r`A (II) é a única falsa dentre as três.` },
        { letra: 'd', texto: 'Apenas a (III).', porque: r`Falta a (I): $C \propto 1/d$.` },
        { letra: 'e', texto: '(I) e (II).', porque: r`A (II) é falsa, e a (III) é verdadeira.` },
        { letra: 'f', texto: '(I) e (III).', correta: true, porque: r`Correta: $C$ dobra, e $E$ e $u$ não mudam.` },
        { letra: 'g', texto: '(II) e (III).', porque: r`A (II) é falsa, e a (I) é verdadeira.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`A (I) e a (III) são verdadeiras.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fluxo por dois quadrados abertos',
      resumo: 'Mesma área, distâncias diferentes de uma carga pontual.',
      enunciado: r`Uma partícula de carga $q > 0$ está na origem. Duas superfícies abertas, $S_1$ e $S_2$, quadradas de lado $a$, são paralelas ao plano $xz$: $S_1$ centrada em $(0, a, 0)$ e $S_2$ em $(0, 2a, 0)$, ambas orientadas por $\hat y$. Como se relacionam os fluxos $\Phi_{\vec E}[S_1]$ e $\Phi_{\vec E}[S_2]$ do campo da partícula?`,
      figura: { pagina: 1, recorte: [0.54, 0.035, 0.93, 0.4] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [15, 7, 9], alvo: [0, 3, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
      ],
      objetos: [
        { id: 'c', tipo: 'carga', q: 'qq', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'S1', tipo: 'espiraSensora', centro: [0, 'a', 0], normal: 'y', largura: 'a', altura: 'a', eixoU: 'x', rotulo: 'S₁' },
        { id: 'S2', tipo: 'espiraSensora', centro: [0, '2*a', 0], normal: 'y', largura: 'a', altura: 'a', eixoU: 'x', rotulo: 'S₂' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Fluxo por S₁', simbolo: r`\Phi[S_1]`, expr: "fluxoE('S1')", unidade: 'V·m', teoria: `qq/eps0*${Omega('a', 'a')}/(4*pi)` },
        { rotulo: 'Fluxo por S₂', simbolo: r`\Phi[S_2]`, expr: "fluxoE('S2')", unidade: 'V·m', teoria: `qq/eps0*${Omega('a', '2*a')}/(4*pi)` },
        { rotulo: 'Limite do plano infinito', simbolo: r`q/2\varepsilon_0`, expr: 'qq/(2*eps0)', unidade: 'V·m' },
        { rotulo: 'Razão Φ[S₁]/Φ[S₂]', simbolo: r`\Phi_1/\Phi_2`, expr: "fluxoE('S1')/fluxoE('S2')" },
      ],
      passos: [
        {
          titulo: 'Fluxo mede quanto do campo atravessa',
          texto: r`Num ponto, $E \propto 1/r^2$, e o fluxo por uma superfície pequena é proporcional ao **ângulo sólido** que ela ocupa, visto da carga:

$$\Phi = \frac{q}{\varepsilon_0}\frac{\Omega}{4\pi}.$$

O ângulo sólido total é $4\pi$: toda a esfera dá $q/\varepsilon_0$.`,
        },
        {
          titulo: 'Mesma área, mais longe',
          previsao: { pergunta: 'Qual quadrado tem fluxo maior?', opcoes: ['S₁, mais perto', 'S₂, mais longe', 'são iguais'], correta: 0 },
          texto: r`$S_1$ e $S_2$ têm a mesma área, mas $S_2$ está mais longe e ocupa um ângulo sólido menor. As linhas que passam por $S_2$ são só parte das que passam por $S_1$:

$$\Phi[S_2] < \Phi[S_1].$$`,
          destacar: ['S1', 'S2'],
          medidas: [0, 1, 3],
        },
        {
          titulo: 'O teto q/2ε₀',
          texto: r`Um plano infinito em $y = a$ recebe metade das linhas: $\Phi = q/2\varepsilon_0$. Um quadrado finito é só uma parte dele, então

$$0 < \Phi[S_2] < \Phi[S_1] < \frac{q}{2\varepsilon_0}.$$`,
          medidas: [0, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`Alternativa **(d)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Fluxo do campo elétrico', lab: 'gauss' },
          { texto: 'Ângulo sólido' },
        ],
        etapas: [
          { titulo: 'Comparar', texto: r`Mesma área mais longe subtende ângulo sólido menor: $\Phi[S_2] < \Phi[S_1]$.`, passo: 1 },
          { titulo: 'Limitar', texto: r`O semiespaço $y > 0$ recebe $q/2\varepsilon_0$. Cada quadrado é uma parte finita disso.`, passo: 2 },
        ],
        resultado: r`$0 < \Phi[S_2] < \Phi[S_1] < q/2\varepsilon_0$: alternativa **(d)**.`,
        errosComuns: [
          r`Aplicar Gauss a superfície aberta: $q/\varepsilon_0$ vale só para superfície fechada que envolve a carga.`,
          r`Achar que o fluxo é o mesmo por serem superfícies iguais. A posição conta.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\Phi[S_1] = \Phi[S_2] = q/\varepsilon_0$`, porque: r`Esse valor é o de uma superfície **fechada** envolvendo a carga.` },
        { letra: 'b', texto: r`$0 < \Phi[S_1] = \Phi[S_2] < q/(2\varepsilon_0)$`, porque: r`Mesma área não quer dizer mesmo fluxo: $S_2$ ocupa ângulo sólido menor.` },
        { letra: 'c', texto: r`$\Phi[S_1] = \Phi[S_2] = 0$`, porque: r`Fluxo nulo só em superfície fechada sem carga. Aqui as linhas atravessam sempre no mesmo sentido.` },
        { letra: 'd', texto: r`$0 < \Phi[S_2] < \Phi[S_1] < q/(2\varepsilon_0)$`, correta: true, porque: r`Correta: $S_1$ está mais perto, e nenhum quadrado finito chega ao limite do plano.` },
        { letra: 'e', texto: r`$0 < \Phi[S_1] < \Phi[S_2] < q/(2\varepsilon_0)$`, porque: r`Ordem invertida: quanto mais longe, menor o ângulo sólido.` },
        { letra: 'f', texto: r`$q/(2\varepsilon_0) < \Phi[S_2] < \Phi[S_1] < q/\varepsilon_0$`, porque: r`Nenhum quadrado passa de $q/2\varepsilon_0$, o fluxo por um plano infinito.` },
        { letra: 'g', texto: r`$q/(2\varepsilon_0) < \Phi[S_1] < \Phi[S_2] < q/\varepsilon_0$`, porque: r`Erra a ordem e o limite.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Bateria e resistor: quem empurra as cargas',
      resumo: 'Fem como trabalho não eletrostático por unidade de carga.',
      enunciado: r`Considere um circuito em regime estacionário, com fios metálicos ideais, um resistor $R$ e uma bateria ideal de fem $\mathcal E$. Afirmativas: (I) O trabalho realizado, por unidade de carga dos portadores de corrente, pelas forças não eletrostáticas entre os terminais negativo e positivo da bateria, passando pelo interior dela, é igual à fem $\mathcal E$. (II) O campo elétrico dentro do resistor é nulo. (III) Dentro da bateria, a força que atua sobre as partículas carregadas tem origem apenas eletrostática. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 2, recorte: [0.1, 0.045, 0.49, 0.44] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'fem', rotulo: 'Fem', simbolo: r`\mathcal E`, valor: 12, unidade: 'V', min: 3, max: 24, passo: 1 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 100, unidade: 'Ω', min: 10, max: 500, passo: 10 },
        { id: 'ell', rotulo: 'Comprimento do resistor', simbolo: r`\ell`, valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
      ],
      objetos: [
        { id: 'Eres', tipo: 'campoE', valor: 'abs(x) < ell/2 && abs(y - 0.04) < 0.006 && abs(z) < 0.006 ? [fem/ell, 0, 0] : [0, 0, 0]' },
        { id: 'res', tipo: 'condutor', a: [-0.02, 0.04, 0], b: [0.02, 0.04, 0], raio: 0.004, I: 'fem/Rr' },
        { id: 'bat', tipo: 'condutor', a: [-0.008, -0.04, 0], b: [0.008, -0.04, 0], raio: 0.006, I: 'fem/Rr' },
        { id: 'w1', tipo: 'caminho', pontos: [[-0.008, -0.04, 0], [-0.06, -0.04, 0], [-0.06, 0.04, 0], [-0.02, 0.04, 0]], seta: 0.5 },
        { id: 'w2', tipo: 'caminho', pontos: [[0.02, 0.04, 0], [0.06, 0.04, 0], [0.06, -0.04, 0], [0.008, -0.04, 0]], seta: 0.5 },
        { id: 'sE', tipo: 'seta', papel: 'E', origem: [-0.012, 0.055, 0], vetor: [1, 0, 0], comprimento: 0.024, rotulo: 'E no resistor' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: [0.012, -0.056, 0], vetor: [-1, 0, 0], comprimento: 0.024, rotulo: 'força não eletrostática' },
        { id: 'sEb', tipo: 'seta', papel: 'E', origem: [-0.012, -0.024, 0], vetor: [1, 0, 0], comprimento: 0.024, rotulo: 'E eletrostático' },
        { id: 'tR', tipo: 'rotulo', pos: [0, 0.03, 0], texto: 'R' },
        { id: 'tmais', tipo: 'rotulo', pos: [-0.012, -0.034, 0], texto: '+' },
        { id: 'tmenos', tipo: 'rotulo', pos: [0.012, -0.034, 0], texto: '−' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Corrente', simbolo: 'I', expr: 'fem/Rr', unidade: 'A' },
        { rotulo: 'Campo no resistor', simbolo: 'E', expr: 'x(E(0, 0.04, 0))', unidade: 'V/m', teoria: 'fem/ell' },
        { rotulo: 'ddp no resistor (E × ℓ)', simbolo: r`E\ell`, expr: 'x(E(0, 0.04, 0))*ell', unidade: 'V', teoria: 'fem' },
      ],
      graficos: [
        {
          titulo: 'Potencial dando a volta no circuito',
          tipo: 'perfil',
          x: { variavel: 's', de: 0, ate: 1, rotulo: 'fração da volta', unidade: '' },
          series: [{ rotulo: 'V', expr: 's < 0.1 ? fem*s/0.1 : (s < 0.45 ? fem : (s < 0.75 ? fem*(1 - (s - 0.45)/0.3) : 0))', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: '(I) O que é fem',
          texto: r`A fem é exatamente o trabalho por unidade de carga feito por forças **não eletrostáticas** (químicas, numa bateria) ao levar o portador do terminal negativo ao positivo por dentro:

$$\mathcal E = \frac1q\oint\vec F_\text{n.e.}\cdot d\vec\ell.$$

Verdadeira. No gráfico, é o degrau de subida no início da volta.`,
          destacar: ['bat', 'sF'],
        },
        {
          titulo: '(II) Há campo no resistor',
          previsao: { pergunta: 'Dentro do resistor, com corrente estacionária, o campo elétrico é…', opcoes: ['nulo', 'diferente de zero'], correta: 1 },
          texto: r`O resistor não é um condutor ideal: para haver corrente é preciso campo, pois $\vec J = \sigma\vec E$. Com ddp $\mathcal E$ em comprimento $\ell$:

$$E = \frac{\mathcal E}{\ell}.$$

**Falsa.** Só nos fios ideais o campo é nulo.`,
          destacar: ['res', 'sE'],
          medidas: [0, 1, 2],
        },
        {
          titulo: '(III) Dentro da bateria há duas forças',
          texto: r`Dentro da bateria, o campo eletrostático aponta do terminal $+$ para o $-$, e empurraria os portadores positivos de volta. Só uma força **não eletrostática**, no sentido oposto, os leva para o $+$. **Falsa.**

Se houvesse só força eletrostática, a integral na volta completa seria nula e não haveria corrente estacionária: o campo eletrostático é conservativo.`,
          destacar: ['bat', 'sF', 'sEb'],
        },
        {
          titulo: 'Resposta',
          texto: r`Apenas a (I): alternativa **(b)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Fem e circuitos', lab: 'circuitos' },
          { texto: 'Lei de Ohm local' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`Definição de fem: trabalho não eletrostático por unidade de carga. Verdadeira.`, passo: 0 },
          { titulo: '(II)', texto: r`$\vec J = \sigma\vec E$: havendo corrente num meio de condutividade finita, há campo. Falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`A força eletrostática é conservativa e não sustenta corrente numa volta fechada. Falsa.`, passo: 2 },
        ],
        resultado: r`Apenas a (I): alternativa **(b)**.`,
        errosComuns: [
          r`Estender ao resistor o resultado $E = 0$ de condutores em equilíbrio. Em circuito com corrente não há equilíbrio.`,
          r`Pensar na bateria como só mais um campo eletrostático: ele não faria trabalho líquido numa volta.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`A (I) é a definição de fem.` },
        { letra: 'b', texto: 'Apenas a I.', correta: true, porque: r`Correta: (II) e (III) são falsas.` },
        { letra: 'c', texto: 'Apenas a II.', porque: r`O resistor tem campo $E = \mathcal E/\ell$.` },
        { letra: 'd', texto: 'Apenas a III.', porque: r`Dentro da bateria há força não eletrostática.` },
        { letra: 'e', texto: 'Somente a I e a II.', porque: r`A (II) é falsa.` },
        { letra: 'f', texto: 'Somente a I e a III.', porque: r`A (III) é falsa.` },
        { letra: 'g', texto: 'Somente a II e a III.', porque: r`As duas são falsas.` },
        { letra: 'h', texto: 'Todas.', porque: r`Só a (I) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Razão entre energia cinética e momento',
      resumo: 'Partícula em movimento circular num B uniforme.',
      enunciado: r`Uma partícula de massa $m$ e carga $q > 0$ move-se na direção e sentido de $\hat x$ num dado instante. Na região existe um campo constante $\vec B = B\hat z$, com $B > 0$. Devido à força magnética, ela descreve um movimento circular uniforme de raio $a$. Determine a razão entre a energia cinética e o módulo do momento linear.`,
      figura: { pagina: 2, recorte: [0.54, 0.045, 0.93, 0.18] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 18], alvo: [0, 0, 0] }, tempo: { escala: 2e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'p', tipo: 'particula', rotulo: 'q > 0', q: 'qe', m: 'mp', pos: [0, 'a', 0], v: ['qe*B0*a/mp', 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.8*cm', rotulo: 'v' },
        { id: 'sf', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: "cross(vel('p'), B(pos('p')))", comprimento: '1.5*cm', rotulo: 'F' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Raio medido no rastro', simbolo: 'a', expr: "t > pi*mp/(qe*B0) ? rastroSpan('p', 'y')/2 : 0/0", unidade: 'm', teoria: 'a' },
        { rotulo: 'Momento linear', simbolo: 'p', expr: "mp*mag(vel('p'))", unidade: 'kg·m/s', teoria: 'qe*B0*a' },
        { rotulo: 'Energia cinética', simbolo: 'K', expr: "mp*mag(vel('p'))^2/2", unidade: 'J' },
        { rotulo: 'Razão K/p', simbolo: 'K/p', expr: "(mp*mag(vel('p'))^2/2)/(mp*mag(vel('p')))", unidade: 'm/s', teoria: 'qe*B0*a/(2*mp)' },
      ],
      passos: [
        {
          titulo: 'A razão é v/2',
          texto: r`Sem nem usar o campo:

$$\frac Kp = \frac{mv^2/2}{mv} = \frac v2.$$

Falta só achar $v$.`,
          medidas: [3],
        },
        {
          titulo: 'O campo fixa a velocidade',
          previsao: { pergunta: 'Com B e a fixos, dobrar a massa muda p?', opcoes: ['p dobra', 'p não muda', 'p cai à metade'], correta: 1 },
          texto: r`A força magnética é a centrípeta:

$$qvB = \frac{mv^2}{a}\quad\Rightarrow\quad p = mv = qBa, \qquad v = \frac{qBa}{m}.$$

O momento depende só de $q$, $B$ e $a$.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`$$\frac Kp = \frac v2 = \frac{qBa}{2m}$$

Alternativa **(a)**.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Movimento circular uniforme' },
        ],
        etapas: [
          { titulo: 'Simplificar', texto: r`$K/p = v/2$.`, passo: 0 },
          { titulo: 'Velocidade', texto: r`$qvB = mv^2/a$, logo $v = qBa/m$.`, passo: 1 },
          { titulo: 'Resultado', texto: r`$K/p = qBa/2m$.`, passo: 2 },
        ],
        resultado: r`$K/p = \dfrac{qBa}{2m}$: alternativa **(a)**.`,
        errosComuns: [
          r`Esquecer o $1/2$ de $K = mv^2/2$.`,
          r`Confundir com a frequência angular $qB/m$ ou com o período.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$qBa/(2m)$`, correta: true, porque: r`Correta: $K/p = v/2$ e $v = qBa/m$.` },
        { letra: 'b', texto: r`$qBa/m$`, porque: r`Essa é a velocidade; a razão é metade dela.` },
        { letra: 'c', texto: r`$2qBa/m$`, porque: r`Inverte o fator: $K/p$ é $v/2$, não $2v$.` },
        { letra: 'd', texto: r`$qBa/(2\pi m)$`, porque: r`O $2\pi$ aparece no período, não aqui.` },
        { letra: 'e', texto: r`$qBa/(\pi m)$`, porque: r`Não há fator $\pi$ em $K$ nem em $p$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Resistividades a partir de um gráfico I × V',
      resumo: 'Dois fios ôhmicos com comprimentos e raios diferentes.',
      enunciado: r`Dois fios condutores, cilíndricos, homogêneos e ôhmicos, 1 e 2, têm correntes $I_1$ e $I_2$ quando sujeitos a ddps $V_1$ e $V_2$. O gráfico mostra $(V_1, I_1) = (V_0, 2I_0)$ e $(V_2, I_2) = (2V_0, I_0)$. Sabendo que $L_2 = 3L_1$ e $r_2 = r_1/2$, como se relacionam as resistividades $\rho_1$ e $\rho_2$?`,
      figura: { pagina: 2, recorte: [0.54, 0.335, 0.93, 0.7] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 15], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Escala de ddp', simbolo: 'V_0', valor: 1, unidade: 'V', min: 0.5, max: 3, passo: 0.1 },
        { id: 'I0', rotulo: 'Escala de corrente', simbolo: 'I_0', valor: 1, unidade: 'A', min: 0.5, max: 3, passo: 0.1 },
        { id: 'L1', rotulo: 'Comprimento do fio 1', simbolo: 'L_1', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'r1', rotulo: 'Raio do fio 1', simbolo: 'r_1', valor: 0.008, unidade: 'm', min: 0.004, max: 0.01, passo: 0.001 },
      ],
      objetos: [
        { id: 'f1', tipo: 'condutor', a: ['-L1/2', 0.02, 0], b: ['L1/2', 0.02, 0], raio: 'r1', I: '2*I0' },
        { id: 'f2', tipo: 'condutor', a: ['-1.5*L1', -0.02, 0], b: ['1.5*L1', -0.02, 0], raio: 'r1/2', I: 'I0' },
        { id: 't1', tipo: 'rotulo', pos: [0, 0.036, 0], texto: 'fio 1' },
        { id: 't2', tipo: 'rotulo', pos: [0, -0.034, 0], texto: 'fio 2' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Resistência do fio 1', simbolo: 'R_1', expr: 'V0/(2*I0)', unidade: 'Ω' },
        { rotulo: 'Resistência do fio 2', simbolo: 'R_2', expr: '2*V0/I0', unidade: 'Ω' },
        { rotulo: 'Resistividade do fio 1', simbolo: r`\rho_1`, expr: 'V0/(2*I0)*pi*r1^2/L1', unidade: 'Ω·m' },
        { rotulo: 'Resistividade do fio 2', simbolo: r`\rho_2`, expr: '2*V0/I0*pi*(r1/2)^2/(3*L1)', unidade: 'Ω·m' },
        { rotulo: 'Razão ρ₂/ρ₁', simbolo: r`\rho_2/\rho_1`, expr: '(2*V0/I0*pi*(r1/2)^2/(3*L1))/(V0/(2*I0)*pi*r1^2/L1)', teoria: '1/3' },
      ],
      graficos: [
        {
          titulo: 'Retas I × V dos dois fios',
          tipo: 'perfil',
          x: { variavel: 'vv', de: 0, ate: '2.5*V0', rotulo: 'V', unidade: 'V' },
          series: [
            { rotulo: 'fio 1', expr: 'vv*2*I0/V0', unidade: 'A' },
            { rotulo: 'fio 2', expr: 'vv*I0/(2*V0)', unidade: 'A' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Resistências pelo gráfico',
          texto: r`Fios ôhmicos: $R = V/I$.

$$R_1 = \frac{V_0}{2I_0}, \qquad R_2 = \frac{2V_0}{I_0} = 4R_1.$$

No gráfico $I\times V$, a reta mais inclinada é a de **menor** resistência.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Da resistência à resistividade',
          previsao: { pergunta: 'O fio 2 tem mais resistência. Sua resistividade é…', opcoes: ['maior', 'igual', 'menor'], correta: 2 },
          texto: r`De $R = \rho L/A$:

$$\frac{\rho_2}{\rho_1} = \frac{R_2}{R_1}\cdot\frac{A_2}{A_1}\cdot\frac{L_1}{L_2} = 4\cdot\frac14\cdot\frac13 = \frac13.$$

O fio 2 é mais longo e fino: a geometria explica mais que toda a resistência extra.`,
          medidas: [2, 3, 4],
        },
        {
          titulo: 'Resposta',
          texto: r`$\rho_2 = \rho_1/3$: alternativa **(e)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ohm e resistividade', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Resistências', texto: r`$R_1 = V_0/2I_0$ e $R_2 = 2V_0/I_0$, então $R_2 = 4R_1$.`, passo: 0 },
          { titulo: 'Geometria', texto: r`$A_2 = A_1/4$ (raio à metade) e $L_2 = 3L_1$.`, passo: 1 },
          { titulo: 'Razão', texto: r`$\rho = RA/L$: $\rho_2/\rho_1 = 4\cdot\frac14\cdot\frac13 = \frac13$.`, passo: 1 },
        ],
        resultado: r`$\rho_2 = \rho_1/3$: alternativa **(e)**.`,
        errosComuns: [
          r`Usar a área proporcional ao raio. Ela vai com $r^2$.`,
          r`Inverter $R_1$ e $R_2$ por ler a inclinação de $I\times V$ como resistência.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\rho_2 = 2\rho_1$`, porque: r`Usa $A \propto r$ e esquece o comprimento: $4\cdot\frac12 = 2$. A área vai com $r^2$.` },
        { letra: 'b', texto: r`$\rho_2 = \rho_1/2$`, porque: r`Não sai de nenhuma combinação coerente de $R$, $A$ e $L$.` },
        { letra: 'c', texto: r`$\rho_2 = \rho_1$`, porque: r`Esquece o fator de comprimento.` },
        { letra: 'd', texto: r`$\rho_2 = 3\rho_1$`, porque: r`Inverte a razão de comprimentos: $\rho = RA/L$, com $L$ no denominador.` },
        { letra: 'e', texto: r`$\rho_2 = \rho_1/3$`, correta: true, porque: r`Correta: $4\cdot\frac14\cdot\frac13$.` },
        { letra: 'f', texto: r`$\rho_2 = \rho_1/12$`, porque: r`Trata os fios como de mesma resistência: sobra só $\frac14\cdot\frac13$. O gráfico mostra $R_2 = 4R_1$.` },
        { letra: 'g', texto: r`$\rho_2 = 12\rho_1$`, porque: r`Multiplica por 4 e por 3 sem levar em conta a área.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Potencial na reta de uma haste',
      resumo: 'Haste uniforme de −a a a; ponto em x = b > a.',
      enunciado: r`Uma haste de comprimento $2a$ está ao longo do eixo $x$, com extremos em $x = a$ e $x = -a$, e densidade linear constante $\lambda$. Determine o potencial elétrico gerado pela barra na posição $x = b > a$, considerando que ele é nulo no infinito.`,
      figura: { pagina: 3, recorte: [0.09, 0.03, 0.49, 0.25] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 26], alvo: [3, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade', simbolo: r`\lambda`, valor: 5e-9, unidade: 'C/m', min: 1e-9, max: 1e-8, passo: 5e-10 },
        { id: 'a', rotulo: 'Meio comprimento', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'bb', rotulo: 'Posição do ponto', simbolo: 'b', valor: 0.07, unidade: 'm', min: 0.045, max: 0.11, passo: 0.001 },
      ],
      objetos: [
        { id: 'h', tipo: 'segmentoCarga', lambda: 'lam', a: ['0-a', 0, 0], b: ['a', 0, 0], rotulo: 'λ' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['bb', 0, 0], arraste: { param: 'bb', eixo: 'x' }, rotulo: 'x = b' },
      ],
      visual: { linhasE: true, densidade: 10, planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial em x = b', simbolo: 'V', expr: 'V(bb, 0, 0)', unidade: 'V', teoria: 'lam/(4*pi*eps0)*ln((bb + a)/(bb - a))' },
        { rotulo: 'Carga pontual 2aλ na origem', simbolo: r`\frac{\lambda a}{2\pi\varepsilon_0b}`, expr: 'lam*a/(2*pi*eps0*bb)', unidade: 'V' },
      ],
      graficos: [
        {
          titulo: 'V(b) e o limite de carga pontual',
          tipo: 'perfil',
          x: { variavel: 'xx', de: '1.1*a', ate: '10*a', rotulo: 'b', unidade: 'm' },
          series: [
            { rotulo: 'haste', expr: 'V(xx, 0, 0)', unidade: 'V' },
            { rotulo: 'carga pontual', expr: 'lam*a/(2*pi*eps0*xx)', unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Somar elementos',
          texto: r`Um elemento em $x'$ tem carga $\lambda\,dx'$ e está a $b - x'$ do ponto:

$$V = \frac{\lambda}{4\pi\varepsilon_0}\int_{-a}^a\frac{dx'}{b - x'}.$$`,
        },
        {
          titulo: 'A integral',
          previsao: { pergunta: 'O potencial, para λ > 0, é…', opcoes: ['positivo', 'negativo', 'nulo'], correta: 0 },
          texto: r`Com $u = b - x'$:

$$V = \frac{\lambda}{4\pi\varepsilon_0}\ln\frac{b+a}{b-a}.$$

É positivo: o argumento do logaritmo é maior que 1.`,
          medidas: [0],
        },
        {
          titulo: 'Conferir o limite',
          texto: r`Para $b \gg a$, $\ln\frac{b+a}{b-a} \simeq 2a/b$ e $V \simeq \frac{\lambda a}{2\pi\varepsilon_0b}$: é uma carga pontual $2a\lambda$. Note que essa aproximação é a alternativa (e), que não é a resposta exata.`,
          parametros: { bb: 0.11 },
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`Alternativa **(c)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial de distribuição contínua', lab: 'potencial' }],
        etapas: [
          { titulo: 'Integral', texto: r`$V = \frac{\lambda}{4\pi\varepsilon_0}\int_{-a}^a\frac{dx'}{b-x'} = \frac{\lambda}{4\pi\varepsilon_0}\left[-\ln(b-x')\right]_{-a}^a$.`, passo: 0 },
          { titulo: 'Resultado', texto: r`$V = \frac{\lambda}{4\pi\varepsilon_0}\ln\frac{b+a}{b-a}$.`, passo: 1 },
        ],
        resultado: r`$V = \dfrac{\lambda}{4\pi\varepsilon_0}\ln\dfrac{b+a}{b-a}$: alternativa **(c)**.`,
        errosComuns: [
          r`Inverter os limites e obter o logaritmo negativo.`,
          r`Usar a aproximação de carga pontual: $b$ não é necessariamente muito maior que $a$.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$[\lambda/(4\pi\varepsilon_0)]\ln[b/a]$`, porque: r`Integra só com os extremos errados; o ponto e a haste entram via $b \pm a$.` },
        { letra: 'b', texto: r`$[\lambda/(4\pi\varepsilon_0)]\ln[a/b]$`, porque: r`Além disso, seria negativo, e o potencial de $\lambda > 0$ é positivo.` },
        { letra: 'c', texto: r`$[\lambda/(4\pi\varepsilon_0)]\ln[(b+a)/(b-a)]$`, correta: true, porque: r`Correta: é a integral de $dx'/(b-x')$ de $-a$ a $a$.` },
        { letra: 'd', texto: r`$[\lambda/(4\pi\varepsilon_0)]\ln[(b-a)/(b+a)]$`, porque: r`Limites invertidos: daria potencial negativo.` },
        { letra: 'e', texto: r`$\lambda a/(2\pi\varepsilon_0b)$`, porque: r`É o limite $b \gg a$, não a expressão exata.` },
        { letra: 'f', texto: r`$\lambda a/[2\pi\varepsilon_0(b-a)]$`, porque: r`Põe toda a carga na ponta mais próxima.` },
        { letra: 'g', texto: r`$\lambda a/[4\pi\varepsilon_0(b+a)]$`, porque: r`Sem integrar, e com distância e carga erradas.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Capacitor com duas chapas dielétricas',
      resumo: 'Campos, ddps, capacitância em série e o caso K₁ = K₂.',
      enunciado: r`Um capacitor de placas planas, perpendiculares ao eixo $z$, tem área $A$ muito grande, separação $2L$ muito pequena e cargas $\pm Q_0$. A região entre as placas é preenchida por duas chapas dielétricas, $\mathcal R_1$ e $\mathcal R_2$, de área $A$, comprimento $L$ e constantes $K_1$ e $K_2$.

(a) Deduza $\vec E_1$ e $\vec E_2$ nas regiões $\mathcal R_1$ e $\mathcal R_2$. Depois, supondo $K_2 = 2K_1 = 3$, esboce $E$ versus $z$ em $0 < z < 2L$. (b) Deduza os módulos das ddps $V_1$ e $V_2$ entre as faces de cada dielétrico. (c) Deduza a capacitância. (d) Determine-a para $K_1 = K_2 =: K$ e interprete.`,
      figura: [
        { pagina: 3, recorte: [0.09, 0.515, 0.48, 0.905] },
        { pagina: 3, recorte: [0.55, 0.02, 0.93, 0.33] },
        { pagina: 3, recorte: [0.55, 0.36, 0.93, 0.41] },
      ],
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [70, 22, 26], alvo: [0, 0, 5] } },
      parametros: [
        { id: 'K1', rotulo: 'Constante da região 1', simbolo: 'K_1', valor: 1.5, min: 1, max: 6, passo: 0.1 },
        { id: 'K2', rotulo: 'Constante da região 2', simbolo: 'K_2', valor: 3, min: 1, max: 6, passo: 0.1 },
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q_0', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'L', rotulo: 'Espessura de cada chapa', simbolo: 'L', valor: 0.01, unidade: 'm', min: 0.008, max: 0.014, passo: 0.001 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'Capacitor',
          centro: [0, 0, 'L'],
          eixo: 'z',
          lado: 'lado',
          d: '2*L',
          Q: 'Q0',
          dieletrico: [
            { K: 'K1', inicio: 0, fim: 'L' },
            { K: 'K2', inicio: 'L', fim: '2*L' },
          ],
        },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Campo em R₁', simbolo: 'E_1', expr: 'z(E(0, 0, L/2))', unidade: 'V/m', teoria: 'Q0/(eps0*lado^2*K1)' },
        { rotulo: 'Campo em R₂', simbolo: 'E_2', expr: 'z(E(0, 0, 1.5*L))', unidade: 'V/m', teoria: 'Q0/(eps0*lado^2*K2)' },
        { rotulo: 'ddp em R₁', simbolo: 'V_1', expr: 'V(0, 0, 0.001*L) - V(0, 0, L)', unidade: 'V', teoria: '0.999*Q0*L/(K1*eps0*lado^2)' },
        { rotulo: 'ddp em R₂', simbolo: 'V_2', expr: 'V(0, 0, L) - V(0, 0, 1.999*L)', unidade: 'V', teoria: '0.999*Q0*L/(K2*eps0*lado^2)' },
        { rotulo: 'Capacitância', simbolo: 'C', expr: "C('cap')", unidade: 'F', teoria: 'K1*K2/(K1 + K2)*eps0*lado^2/L' },
        { rotulo: 'Capacitância por Q₀/V', simbolo: 'Q_0/V', expr: 'Q0/(V(0, 0, 0.001*L) - V(0, 0, 1.999*L))', unidade: 'F', teoria: "C('cap')" },
      ],
      graficos: [
        {
          titulo: 'Campo E(z) entre as placas',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '0.02*L', ate: '1.98*L', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'E', expr: 'z(E(0, 0, zz))', unidade: 'V/m' }],
        },
        {
          titulo: 'Potencial V(z)',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '0.02*L', ate: '1.98*L', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(0, 0, zz) - V(0, 0, 1.98*L)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Campo em cada chapa',
          texto: r`Sem dielétrico, $E_0 = Q_0/\varepsilon_0A$. Em cada meio ele é reduzido por $K_i$:

$$\vec E_i = \frac{E_0}{K_i}\hat z = \frac{Q_0}{\varepsilon_0AK_i}\,\hat z.$$

Os dois apontam da placa $+$ para a $-$, e cada um é uniforme.`,
          medidas: [0, 1],
        },
        {
          item: 'a',
          titulo: '(a) O gráfico para K₂ = 2K₁ = 3',
          previsao: { pergunta: 'Em qual chapa o campo é maior?', opcoes: ['na de K menor', 'na de K maior', 'são iguais'], correta: 0 },
          texto: r`Com $K_1 = 3/2$ e $K_2 = 3$: $E_1 = 2E_0/3$ e $E_2 = E_0/3$. O gráfico são dois patamares de comprimento $L$, com um salto em $z = L$.

O salto vem das cargas de polarização na interface.`,
          parametros: { K1: 1.5, K2: 3 },
          medidas: [0, 1],
        },
        {
          item: 'b',
          titulo: '(b) As ddps',
          texto: r`Com campo constante, a integral é imediata:

$$V_i = E_iL = \frac{Q_0L}{K_i\varepsilon_0A}.$$

No gráfico de $V(z)$, cada trecho é uma reta com inclinação $-E_i$. As medidas ficam a um milésimo de $L$ das placas, porque o potencial é calculado dentro da região com campo.`,
          parametros: { K1: 1.5, K2: 3 },
          medidas: [2, 3],
        },
        {
          item: 'c',
          titulo: '(c) Capacitância',
          texto: r`As ddps se somam:

$$V = V_1 + V_2 = \frac{Q_0L}{\varepsilon_0A}\left(\frac1{K_1} + \frac1{K_2}\right)$$

$$C = \frac{Q_0}{V} = \frac{K_1K_2}{K_1 + K_2}\,\frac{\varepsilon_0A}{L}.$$

É a associação em série de dois capacitores de constantes $K_1$ e $K_2$.`,
          parametros: { K1: 1.5, K2: 3 },
          medidas: [4, 5],
        },
        {
          item: 'd',
          titulo: '(d) K₁ = K₂ = K',
          texto: r`$$C_K = \frac{K^2}{2K}\frac{\varepsilon_0A}{L} = K\frac{\varepsilon_0A}{2L} = KC_0.$$

É um único dielétrico preenchendo todo o capacitor de separação $2L$: a capacitância do capacitor vazio, multiplicada por $K$.`,
          parametros: { K1: 2, K2: 2 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Capacitores com dielétrico', lab: 'capacitor' },
          { texto: 'Associação em série' },
        ],
        etapas: [
          { titulo: '(a) Campos', texto: r`$\vec E_i = \dfrac{Q_0}{\varepsilon_0AK_i}\hat z$. Com $K_2 = 2K_1 = 3$: $E_1 = 2E_0/3$, $E_2 = E_0/3$.`, passo: 1 },
          { titulo: '(b) ddps', texto: r`$V_i = E_iL = \dfrac{Q_0L}{K_i\varepsilon_0A}$.`, passo: 2 },
          { titulo: '(c) Capacitância', texto: r`$V = V_1 + V_2$ e $C = Q_0/V = \dfrac{K_1K_2}{K_1+K_2}\dfrac{\varepsilon_0A}{L}$.`, passo: 3 },
          { titulo: '(d) Dielétrico único', texto: r`$C_K = K\varepsilon_0A/2L = KC_0$.`, passo: 4 },
        ],
        resultado: r`$\vec E_i = \dfrac{Q_0}{\varepsilon_0AK_i}\hat z$; $V_i = \dfrac{Q_0L}{K_i\varepsilon_0A}$; $C = \dfrac{K_1K_2}{K_1+K_2}\dfrac{\varepsilon_0A}{L}$; $C_K = K\dfrac{\varepsilon_0A}{2L}$.`,
        errosComuns: [
          r`Somar as capacitâncias como em paralelo. Os dielétricos estão empilhados entre as placas: é série.`,
          r`Usar $2L$ em vez de $L$ na ddp de cada chapa.`,
          r`Inverter o gráfico: o campo é maior onde $K$ é **menor**.`,
        ],
        oficial: { resposta: r`$\vec E_i = \dfrac{Q_0}{\varepsilon_0AK_i}\hat z$; $V_i = \dfrac{Q_0L}{K_i\varepsilon_0A}$; $C = \dfrac{K_1K_2}{K_1+K_2}\dfrac{\varepsilon_0A}{L}$; $C_K = K\dfrac{\varepsilon_0A}{2L}$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\vec E_i = \dfrac{Q_0}{\varepsilon_0AK_i}\hat z$; patamares $2E_0/3$ e $E_0/3$`, pontos: 1.5, criterio: 'Dedução dos campos e gráfico com os dois patamares.' },
        { item: 'b', texto: r`$V_i = \dfrac{Q_0L}{K_i\varepsilon_0A}$`, pontos: 1, criterio: 'Integral do campo em cada região.' },
        { item: 'c', texto: r`$C = \dfrac{K_1K_2}{K_1+K_2}\dfrac{\varepsilon_0A}{L}$`, pontos: 1, criterio: r`$V = V_1 + V_2$ ou associação em série.` },
        { item: 'd', texto: r`$C_K = K\dfrac{\varepsilon_0A}{2L}$`, pontos: 0.5, criterio: 'Resultado e a interpretação como dielétrico único.' },
      ],
    },
  ],
}

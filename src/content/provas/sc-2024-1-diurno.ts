import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: nó A = {esquerda de C₁, entre C₂ e C₃}; nó Y = {entre C₁ e C₂, entre C₄ e C₅}; nó B = {entre C₃ e C₄, direita de C₅}. */
const capac = (id: string, x: number, Q: string): ObjetoInput => ({
  id,
  tipo: 'capacitor',
  centro: [x, 0, 0],
  eixo: 'x',
  lado: 'lado',
  d: 'd0',
  Q,
})

/* Objetiva 2: disco vazado em 16 anéis de corrente; dI = σωr dr. */
const N = 16
const aneis: ObjetoInput[] = Array.from({ length: N }, (_, i) => {
  const r0 = `(a + (R - a)*${(i + 0.5) / N})`
  return {
    id: `a${i}`,
    tipo: 'espira' as const,
    I: `qq/(pi*(R^2 - a^2))*w*${r0}*(R - a)/${N}`,
    centro: [0, 0, 0],
    raio: r0,
    normal: 'z',
  }
})

/* Objetiva 3: disco em anéis, barra e cubo em 7³ cargas nos centros das células. */
const discoAneis: ObjetoInput[] = Array.from({ length: 12 }, (_, i) => {
  const f0 = i / 12
  const f1 = (i + 1) / 12
  return {
    id: `d${i}`,
    tipo: 'anelCarga' as const,
    ativo: 'caso==1',
    Q: `Qq*${f1 ** 2 - f0 ** 2}`,
    centro: [0, 0, 0],
    raio: `${(f0 + f1) / 2}*R`,
    normal: 'z',
  }
})
const cubo: ObjetoInput[] = []
for (let i = -3; i <= 3; i++)
  for (let j = -3; j <= 3; j++)
    for (let k = -3; k <= 3; k++)
      cubo.push({ id: `c${i + 3}${j + 3}${k + 3}`, tipo: 'carga', ativo: 'caso==3', q: 'Qq/343', pos: [`${(i * 2) / 7}*R`, `${(j * 2) / 7}*R`, `${(k * 2) / 7}*R`] })

/* Objetiva 5: tronco de cone em 12 fatias; o raio quadruplica de −L a L. */
const fatias: ObjetoInput[] = Array.from({ length: 12 }, (_, i) => ({
  id: `f${i}`,
  tipo: 'condutor' as const,
  a: [0, 0, `-L + ${(2 * i) / 12}*L`],
  b: [0, 0, `-L + ${(2 * (i + 1)) / 12}*L`],
  raio: `a0*(1 + 3*${(i + 0.5) / 12})`,
  I: 'I0',
}))

/* Objetiva 6: arcos 1 (por cima, com abertura α) e 3 (o resto), ambos no sentido anti-horário. */
const pontoEm = (raio: string, ang: string): [string, string, number] => [`${raio}*cos(rad(${ang}))`, `${raio}*sin(rad(${ang}))`, 0]
const arco = (pre: string, raio: string, de: string, passo: string, n: number): ObjetoInput[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${pre}${i}`,
    tipo: 'fio' as const,
    I: 'I0',
    a: pontoEm(raio, `${de} + ${i}*${passo}`),
    b: pontoEm(raio, `${de} + ${i + 1}*${passo}`),
  }))
const arco3 = arco('t', 'R3', '(90 + al/2)', '((360 - al)/48)', 48)
const arco1 = arco('u', 'R1', '(90 - al/2)', '(al/24)', 24)
const Bcentro = 'mu0*I0/(4*pi)*(rad(al)/R1 + (2*pi - rad(al))/R3)'

/* Discursiva */
const TT = '(t + t0)'
const X = `((${TT} - 2*tau)/tau)`
const femD = `2*B0*A0/tau*${X}*exp(0-${X}^2)`
const Imax = 'sqrt(2)*B0*A0*exp(-0.5)/(Rr*tau)'

/**
 * Prova de 2ª chamada de Física III, 2024/1, diurno, versão A (15/07/2024).
 * Conferida com o gabarito oficial: objetivas 1e, 2h, 3c, 4d, 5f, 6a, e a
 * discursiva. O cabeçalho do gabarito da discursiva diz "2/2023", mas o rodapé e
 * o conteúdo são desta prova. O cubo da Q3 é uma rede de 343 cargas: a fração
 * dentro da esfera dá 0,522, contra π/6 = 0,524.
 */
export const sc_2024_1_diurno: ProvaInput = {
  id: 'sc-2024-1-diurno',
  titulo: 'Segunda chamada · 2024/1 · Diurno',
  subtitulo: 'Física III · Segunda Chamada · Versão A · 15/07/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cinco capacitores e só três nós',
      resumo: 'Os fios escondem uma associação simples.',
      enunciado: r`Considere um arranjo de cinco capacitores conectados conforme mostrado na figura, com suas respectivas capacitâncias indicadas no esquema. Determine a capacitância equivalente entre os pontos $A$ e $B$.`,
      figura: [
        { pagina: 1, recorte: [0.105, 0.625, 0.5, 0.695] },
        { pagina: 1, recorte: [0.22, 0.75, 0.49, 0.895] },
      ],
      cena: { escala: 0.002, extensao: 36, unidade: 'cm', plano: 'xy', camera: { pos: [32, 26, 84], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'ddp entre A e B', simbolo: 'V', valor: 12, unidade: 'V', min: 2, max: 30, passo: 1 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: r`\sqrt{A}`, valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
        { id: 'd0', rotulo: 'Separação', simbolo: 'd', valor: 0.012, unidade: 'm', min: 0.01, max: 0.014, passo: 0.001 },
      ],
      objetos: [
        capac('c1', -0.1, 'eps0*lado^2/d0*V0/2'),
        capac('c2', -0.05, '-eps0*lado^2/d0*V0/2'),
        capac('c3', 0, 'eps0*lado^2/d0*V0'),
        capac('c4', 0.05, '-eps0*lado^2/d0*V0/2'),
        capac('c5', 0.1, 'eps0*lado^2/d0*V0/2'),
        { id: 'wA', tipo: 'caminho', pontos: [[-0.135, 0, 0], ['-0.1 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'w12', tipo: 'caminho', pontos: [['-0.1 + d0/2', 0, 0], ['-0.05 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'w23', tipo: 'caminho', pontos: [['-0.05 + d0/2', 0, 0], ['0 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'w34', tipo: 'caminho', pontos: [['d0/2', 0, 0], ['0.05 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'w45', tipo: 'caminho', pontos: [['0.05 + d0/2', 0, 0], ['0.1 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'wB', tipo: 'caminho', pontos: [['0.1 + d0/2', 0, 0], [0.135, 0, 0]], seta: 0.5 },
        { id: 'top1', tipo: 'caminho', pontos: [[-0.125, 0, 0], [-0.125, 0.05, 0], [-0.025, 0.05, 0], [-0.025, 0, 0]], seta: 0.5, rotulo: 'nó A' },
        { id: 'top2', tipo: 'caminho', pontos: [[0.025, 0, 0], [0.025, 0.05, 0], [0.125, 0.05, 0], [0.125, 0, 0]], seta: 0.5, rotulo: 'nó B' },
        { id: 'bot', tipo: 'caminho', pontos: [[-0.075, 0, 0], [-0.075, -0.05, 0], [0.075, -0.05, 0], [0.075, 0, 0]], seta: 0.5, rotulo: 'nó Y' },
        { id: 'tA', tipo: 'rotulo', pos: [-0.142, 0.01, 0], texto: 'A' },
        { id: 'tB', tipo: 'rotulo', pos: [0.142, 0.01, 0], texto: 'B' },
      ],
      visual: { setasE: true, densidade: 27, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância de cada um', simbolo: 'C', expr: "C('c1')", unidade: 'F', teoria: 'eps0*lado^2/d0' },
        { rotulo: 'ddp em C₁', simbolo: 'V_1', expr: "abs(Vcap('c1'))", unidade: 'V', teoria: 'V0/2' },
        { rotulo: 'ddp em C₃', simbolo: 'V_3', expr: "abs(Vcap('c3'))", unidade: 'V', teoria: 'V0' },
        { rotulo: 'Carga que entra por A', simbolo: 'Q', expr: "abs(Q('c1')) + abs(Q('c2')) + abs(Q('c3'))", unidade: 'C', teoria: "2*C('c1')*V0" },
        { rotulo: 'Capacitância equivalente', simbolo: r`C_\text{eq}/C`, expr: "(abs(Q('c1')) + abs(Q('c2')) + abs(Q('c3')))/(V0*C('c1'))", teoria: 2 },
      ],
      passos: [
        {
          titulo: 'Fio ideal é um ponto só',
          texto: r`Tudo que está ligado por fio ideal tem o mesmo potencial. Siga os fios:

- o fio de cima, à esquerda, liga $A$ ao ponto entre $C_2$ e $C_3$;
- o de cima, à direita, liga o ponto entre $C_3$ e $C_4$ a $B$;
- o de baixo liga o ponto entre $C_1$ e $C_2$ ao ponto entre $C_4$ e $C_5$: é o nó $Y$.

São só três nós: $A$, $B$ e $Y$.`,
        },
        {
          titulo: 'Quem liga o quê',
          previsao: { pergunta: 'Entre quais nós fica o capacitor do meio?', opcoes: ['A e B', 'A e Y', 'Y e B'], correta: 0 },
          texto: r`$C_1$ e $C_2$ ligam $A$ a $Y$: paralelo, $2C$. $C_4$ e $C_5$ ligam $Y$ a $B$: paralelo, $2C$. $C_3$ liga $A$ a $B$ diretamente.

Por isso, $C_3$ fica com toda a ddp, e os outros com metade.`,
          medidas: [1, 2],
        },
        {
          titulo: 'Reduzir',
          texto: r`Os dois blocos de $2C$ estão em série, o que dá $C$. Em paralelo com $C_3$:

$$C_\text{eq} = C + C = 2C.$$

Alternativa **(e)**. A cena confere pela carga: a que entra por $A$ é a soma das de $C_1$, $C_2$ e $C_3$.`,
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Nós', texto: r`Os fios reduzem o circuito a três nós: $A$, $Y$ e $B$.`, passo: 0 },
          { titulo: 'Blocos', texto: r`$C_1\parallel C_2$ e $C_4\parallel C_5$ dão $2C$ cada; em série, $C$.`, passo: 1 },
          { titulo: 'Total', texto: r`Em paralelo com $C_3$: $2C$.`, passo: 2 },
        ],
        resultado: r`$C_\text{eq} = 2C$: alternativa **(e)**.`,
        errosComuns: [
          r`Tratar os cinco como em série, porque estão alinhados no desenho: daria $C/5$.`,
          r`Ignorar os fios de cima e de baixo.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\frac12C$`, porque: r`É o bloco em série sem $C_3$ e com capacitâncias erradas.` },
        { letra: 'b', texto: r`$\frac23C$`, porque: r`Trata os blocos de modo errado.` },
        { letra: 'c', texto: r`$\frac32C$`, porque: r`Faltou somar corretamente com $C_3$.` },
        { letra: 'd', texto: '$C$', porque: r`É só o ramo por $Y$: falta $C_3$ em paralelo.` },
        { letra: 'e', texto: '$2C$', correta: true, porque: r`Correta.` },
        { letra: 'f', texto: '$3C$', porque: r`Soma os blocos em paralelo: $2C$ com $C$.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Disco vazado girando',
      resumo: 'Anéis de corrente somados no centro.',
      enunciado: r`Um disco de plástico de raio $R$ com um furo central de raio $a$, e que está uniformemente carregado em sua superfície com uma carga elétrica $q$, é colocado pra girar em torno de seu eixo com velocidade angular de módulo constante $\omega$. Ao dividir o disco em anéis de raios $r$ variáveis e largura infinitesimal $dr$ pode-se mostrar, através do princípio da superposição, que ele produz um campo magnético $\vec B$ no seu centro que será dado por:`,
      figura: [
        { pagina: 1, recorte: [0.515, 0.13, 0.91, 0.285] },
        { pagina: 1, recorte: [0.555, 0.5, 0.86, 0.695] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [9, -10, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-3, unidade: 'C', min: 2e-4, max: 3e-3, passo: 1e-4 },
        { id: 'w', rotulo: 'Velocidade angular', simbolo: r`\omega`, valor: 1000, unidade: 'rad/s', min: 200, max: 3000, passo: 100 },
        { id: 'R', rotulo: 'Raio externo', simbolo: 'R', valor: 0.08, unidade: 'm', min: 0.06, max: 0.09, passo: 0.002 },
        { id: 'a', rotulo: 'Raio do furo', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.05, passo: 0.002 },
      ],
      objetos: [...aneis, { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' }],
      visual: { linhasB: true, densidade: 9 },
      medidas: [
        { rotulo: 'Densidade', simbolo: r`\sigma`, expr: 'qq/(pi*(R^2 - a^2))', unidade: 'C/m²' },
        { rotulo: 'Corrente total', simbolo: 'I', expr: 'qq*w/(2*pi)', unidade: 'A' },
        { rotulo: 'Campo no centro (soma dos anéis)', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*w*qq/(2*pi*(R + a))' },
      ],
      passos: [
        {
          titulo: 'Cada anel é uma corrente',
          texto: r`A densidade é $\sigma = q/\pi(R^2-a^2)$. Um anel de raio $r$ tem carga $dq = \sigma2\pi r\,dr$, que passa por um ponto $\omega/2\pi$ vezes por segundo:

$$dI = \frac{\omega}{2\pi}dq = \sigma\omega r\,dr.$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Campo de um anel no centro',
          previsao: { pergunta: 'Cada anel de largura dr contribui com um campo que…', opcoes: ['cresce com r', 'cai com r', 'não depende de r'], correta: 2 },
          texto: r`$$dB = \frac{\mu_0dI}{2r} = \frac{\mu_0\sigma\omega}{2}\,dr.$$

O $r$ cancela: anéis grandes têm mais corrente, mas estão mais longe.`,
        },
        {
          titulo: 'Somar',
          texto: r`$$B = \frac{\mu_0\sigma\omega}{2}(R-a) = \frac{\mu_0\omega q\,(R-a)}{2\pi(R^2-a^2)} = \frac{\mu_0\omega q}{2\pi(R+a)}.$$

Alternativa **(h)**. Sem furo, $a = 0$, recai em $\mu_0\omega q/2\pi R$.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de espira no centro', lab: 'ampere' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Corrente', texto: r`$dI = \sigma\omega r\,dr$.`, passo: 0 },
          { titulo: 'Campo', texto: r`$dB = \mu_0\sigma\omega\,dr/2$.`, passo: 1 },
          { titulo: 'Integral', texto: r`$B = \mu_0\sigma\omega(R-a)/2 = \mu_0\omega q/2\pi(R+a)$.`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0\omega q}{2\pi(R+a)}\hat z$: alternativa **(h)**.`,
        errosComuns: [
          r`Esquecer de fatorar $R^2 - a^2 = (R-a)(R+a)$.`,
          r`Usar $I = q\omega/2\pi$ num único anel de raio médio.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left[\dfrac{\mu_0\omega q}{2\pi(R-a)}\right]\hat z$`, porque: r`Fatora errado: sobra $R + a$, não $R - a$.` },
        { letra: 'b', texto: r`$\left[\dfrac{\mu_0\omega q}{4\pi(R-a)}\right]\hat z$`, porque: r`Fatora errado.` },
        { letra: 'c', texto: r`$\left[\dfrac{\mu_0\omega qR}{\pi(R^2+a^2)}\right]\hat z$`, porque: r`A área é $\pi(R^2 - a^2)$.` },
        { letra: 'd', texto: r`$\left[\dfrac{\mu_0\omega qa}{2\pi(R^2+a^2)}\right]\hat z$`, porque: r`Daria $B = 0$ sem furo.` },
        { letra: 'e', texto: r`$\left[\dfrac{\mu_0\omega qa}{2\pi(R^2-a^2)}\right]\hat z$`, porque: r`Daria $B = 0$ sem furo.` },
        { letra: 'f', texto: r`$\left[\dfrac{2\mu_0\omega q}{\pi(R-a)}\right]\hat z$`, porque: r`Fatores errados.` },
        { letra: 'g', texto: r`$\left[\dfrac{\mu_0\omega q}{4\pi(R+a)}\right]\hat z$`, porque: r`Fator 2 a menos.` },
        { letra: 'h', texto: r`$\left[\dfrac{\mu_0\omega q}{2\pi(R+a)}\right]\hat z$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Disco, barra e cubo numa esfera',
      resumo: 'A mesma carga, mas nem toda fica dentro.',
      enunciado: r`Considere as seguintes distribuições de carga, todas isoladas e uniformemente carregadas com carga total $Q > 0$: (I) Um disco de raio $R$ de espessura desprezível; (II) Uma barra uni-dimensional de comprimento $2R$; (III) Um cubo sólido de lado $2R$. Desenham-se então superfícies gaussianas $\mathcal S_i$ ($i$ = I, II, III) na forma de esferas de raio $R$ com centros coincidentes com o centro geométrico de cada um desses objetos. Denotando por $\Phi_{\vec E}[\mathcal S_i]$ o fluxo de campo elétrico através de cada uma dessas superfícies, podemos afirmar que`,
      figura: { pagina: 2, recorte: [0.105, 0.13, 0.5, 0.375] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [5, 5, 18], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) disco' },
            { valor: 2, rotulo: '(II) barra' },
            { valor: 3, rotulo: '(III) cubo' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
      ],
      objetos: [
        ...discoAneis,
        { id: 'barra', tipo: 'segmentoCarga', ativo: 'caso==2', lambda: 'Qq/(2*R)', a: ['0-R', 0, 0], b: ['R', 0, 0], rotulo: 'barra' },
        ...cubo,
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'R', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fração da carga dentro de S', simbolo: r`Q_\text{int}/Q`, expr: "Qenc('G')/Qq", teoria: 'caso==3 ? pi/6 : 1' },
        { rotulo: 'Fluxo por S, em unidades de Q/ε₀', simbolo: r`\varepsilon_0\Phi/Q`, expr: "Qenc('G')/Qq" },
      ],
      passos: [
        {
          titulo: 'Só a carga de dentro importa',
          texto: r`$\Phi = Q_\text{int}/\varepsilon_0$. Não importa como a carga está arrumada, só quanto dela está dentro da esfera.`,
          parametros: { caso: 1 },
        },
        {
          titulo: 'Disco e barra cabem',
          texto: r`O disco tem raio $R$, e a barra se estende de $-R$ a $R$. Os dois ficam inteiros dentro da esfera (no máximo, tocam a superfície):

$$\Phi_\text{I} = \Phi_\text{II} = \frac{Q}{\varepsilon_0}.$$`,
          parametros: { caso: 2 },
          medidas: [0],
        },
        {
          titulo: 'O cubo não cabe',
          previsao: { pergunta: 'Qual fração da carga do cubo fica dentro da esfera inscrita?', opcoes: ['toda', 'cerca de metade', 'um oitavo'], correta: 1 },
          texto: r`A esfera de raio $R$ está inscrita no cubo de lado $2R$: os cantos ficam de fora. A fração interna é a razão de volumes:

$$\frac{\frac43\pi R^3}{8R^3} = \frac\pi6 \approx 0{,}52.$$

Na cena, o cubo é uma rede de 343 cargas iguais.`,
          parametros: { caso: 3 },
          medidas: [0],
        },
        {
          titulo: 'Resposta',
          texto: r`$\Phi_\text{I} = \Phi_\text{II} > \Phi_\text{III}$: alternativa **(c)**.`,
          parametros: { caso: 3 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'I e II', texto: r`Toda a carga está dentro: $Q/\varepsilon_0$.`, passo: 1 },
          { titulo: 'III', texto: r`Só a fração $\pi/6$ está dentro.`, passo: 2 },
        ],
        resultado: r`$\Phi_\text{I} = \Phi_\text{II} > \Phi_\text{III}$: alternativa **(c)**.`,
        errosComuns: [
          r`Achar que o fluxo depende da forma da distribuição, e não só da carga interna.`,
          r`Achar que as três envolvem $Q$ por terem a mesma carga total.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\Phi[\mathcal S_I] > \Phi[\mathcal S_{II}] > \Phi[\mathcal S_{III}]$`, porque: r`I e II têm o mesmo fluxo.` },
        { letra: 'b', texto: r`$\Phi[\mathcal S_I] < \Phi[\mathcal S_{II}] < \Phi[\mathcal S_{III}]$`, porque: r`É o cubo que tem o menor fluxo.` },
        { letra: 'c', texto: r`$\Phi[\mathcal S_I] = \Phi[\mathcal S_{II}] > \Phi[\mathcal S_{III}]$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`$\Phi[\mathcal S_I] = \Phi[\mathcal S_{II}] < \Phi[\mathcal S_{III}]$`, porque: r`Parte da carga do cubo fica fora.` },
        { letra: 'e', texto: r`$\Phi[\mathcal S_I] > \Phi[\mathcal S_{III}] > \Phi[\mathcal S_{II}]$`, porque: r`A barra está toda dentro.` },
        { letra: 'f', texto: r`$\Phi[\mathcal S_{II}] > \Phi[\mathcal S_I] > \Phi[\mathcal S_{III}]$`, porque: r`I e II têm o mesmo fluxo.` },
        { letra: 'g', texto: r`$\Phi[\mathcal S_{II}] > \Phi[\mathcal S_{III}] > \Phi[\mathcal S_I]$`, porque: r`O disco está todo dentro.` },
        { letra: 'h', texto: r`$\Phi[\mathcal S_I] = \Phi[\mathcal S_{II}] = \Phi[\mathcal S_{III}]$`, porque: r`Valeria se a esfera envolvesse todo o cubo.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Raio sobre passo de uma hélice',
      resumo: 'Massa, carga e campo somem da razão.',
      enunciado: r`Uma partícula carregada entra com velocidade $\vec v = v_0(2\hat x + \hat y)/\sqrt5$ ($v_0 = \text{const} > 0$) em uma região de campo magnético constante $\vec B = B_0\hat y$ ($B_0 > 0$) e descreve uma trajetória helicoidal. Nessa situação, podemos afirmar que a razão $R/h$ entre o raio e o passo da hélice vale:`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.125, 0.905, 0.22] },
        { pagina: 2, recorte: [0.735, 0.225, 0.865, 0.455] },
      ],
      cena: {
        escala: 0.01,
        extensao: 9,
        unidade: 'cm',
        camera: { pos: [17, 3, 13], alvo: [0, 0, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B_0', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 5e4, max: 1.5e5, passo: 1e4 },
      ],
      objetos: [
        { id: 'By', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'p', tipo: 'particula', rotulo: 'q', q: 'qe', m: 'mp', pos: [0, -0.06, 0], v: ['2*v0/sqrt(5)', 'v0/sqrt(5)', 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '2*cm', rotulo: 'v' },
      ],
      visual: { linhasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Raio no rastro', simbolo: 'R', expr: "t > 1.1*pi*mp/(qe*B0) ? rastroSpan('p', 'x')/2 : 0/0", unidade: 'm', teoria: 'mp*2*v0/sqrt(5)/(qe*B0)' },
        { rotulo: 'Passo', simbolo: 'h', expr: '(v0/sqrt(5))*2*pi*mp/(qe*B0)', unidade: 'm' },
        { rotulo: 'Razão R/h', simbolo: 'R/h', expr: "t > 1.1*pi*mp/(qe*B0) ? rastroSpan('p', 'x')/2/((v0/sqrt(5))*2*pi*mp/(qe*B0)) : 0/0", teoria: '1/pi' },
      ],
      passos: [
        {
          titulo: 'Decompor',
          texto: r`Em relação a $\vec B$, que aponta em $\hat y$:

$$v_\parallel = \frac{v_0}{\sqrt5}, \qquad v_\perp = \frac{2v_0}{\sqrt5}.$$`,
        },
        {
          titulo: 'Raio e período',
          texto: r`Só $v_\perp$ gira:

$$R = \frac{mv_\perp}{qB_0}, \qquad T = \frac{2\pi m}{qB_0}.$$`,
          medidas: [0],
        },
        {
          titulo: 'A razão',
          previsao: { pergunta: 'R/h depende de B₀?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`O passo é $h = v_\parallel T$:

$$\frac Rh = \frac{mv_\perp/qB_0}{2\pi mv_\parallel/qB_0} = \frac{1}{2\pi}\frac{v_\perp}{v_\parallel} = \frac{1}{2\pi}\cdot2 = \frac1\pi.$$

Massa, carga e campo se cancelam: só o ângulo de entrada importa. Alternativa **(d)**.`,
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Movimento em campo magnético', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Componentes', texto: r`$v_\perp/v_\parallel = 2$.`, passo: 0 },
          { titulo: 'Razão', texto: r`$R/h = v_\perp/(2\pi v_\parallel) = 1/\pi$.`, passo: 2 },
        ],
        resultado: r`$R/h = 1/\pi$: alternativa **(d)**.`,
        errosComuns: [
          r`Trocar $v_\perp$ e $v_\parallel$, o que dá $1/4\pi$.`,
          r`Usar $T$ como passo: passo é distância.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: '$1$.', porque: r`Falta o fator $2\pi$ do período.` },
        { letra: 'b', texto: '$2$.', porque: r`É $v_\perp/v_\parallel$, sem o $2\pi$.` },
        { letra: 'c', texto: r`$\frac12$.`, porque: r`Inverte a razão e esquece o $2\pi$.` },
        { letra: 'd', texto: r`$\frac1\pi$.`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$\frac{1}{2\pi}$.`, porque: r`Esquece a razão $v_\perp/v_\parallel = 2$.` },
        { letra: 'f', texto: r`$\pi$.`, porque: r`Inverte a razão.` },
        { letra: 'g', texto: r`$2\pi$.`, porque: r`Inverte a razão.` },
        { letra: 'h', texto: r`$\frac{3\pi}{2}$.`, porque: r`Não sai da conta.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Corrente num fio que alarga',
      resumo: 'A corrente é a mesma; densidade, carga e velocidade mudam.',
      enunciado: r`Considere um fio cilíndrico, de seção reta circular, coaxial com o eixo $z$, dividido em duas metades ($\mathcal R_-$ e $\mathcal R_+$) pelo plano $z = 0$. Através de tal fio, flui uma corrente (axial) estacionária (e sem variação da carga total em nenhum volume dado). Na metade $\mathcal R_-$, a carga de cada portador livre de corrente é $q_- = 2e$ e a sua velocidade de arraste tem módulo $v_- = v$, ao passo que, na metade $\mathcal R_+$, a carga de cada portador livre de corrente é $q_+ = 3e$ e a sua velocidade de arraste tem módulo $v_+ = v/2$. Sabendo que, ao passar de uma seção reta de tal fio, em $z = -L < 0$, para outra, em $z = L > 0$, os correspondentes raios quadruplicam, qual é a razão entre as densidades numéricas dos portadores, ou seja, $n_+/n_-$?`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.515, 0.905, 0.74] },
        { pagina: 2, recorte: [0.63, 0.755, 0.885, 0.91] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [12, 5, 11], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 10, passo: 0.5 },
        { id: 'L', rotulo: 'Meio comprimento', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.04, max: 0.07, passo: 0.002 },
        { id: 'a0', rotulo: 'Raio em z = −L', simbolo: 'a', valor: 0.008, unidade: 'm', min: 0.005, max: 0.012, passo: 0.001 },
        { id: 'vv', rotulo: 'Velocidade na metade −', simbolo: 'v', valor: 1e-4, unidade: 'm/s', min: 5e-5, max: 5e-4, passo: 1e-5 },
      ],
      objetos: [
        ...fatias,
        { id: 'tm', tipo: 'rotulo', pos: [0, 0.02, '-0.6*L'], texto: 'R₋: 2e, v' },
        { id: 'tp', tipo: 'rotulo', pos: [0, 0.045, '0.6*L'], texto: 'R₊: 3e, v/2' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Densidade em z = −L', simbolo: 'n_-', expr: 'I0/(2*qe*vv*pi*a0^2)', unidade: 'm⁻³' },
        { rotulo: 'Densidade em z = L', simbolo: 'n_+', expr: 'I0/(3*qe*vv/2*pi*(4*a0)^2)', unidade: 'm⁻³' },
        { rotulo: 'Razão n₊/n₋', simbolo: 'n_+/n_-', expr: '(I0/(3*qe*vv/2*pi*(4*a0)^2))/(I0/(2*qe*vv*pi*a0^2))', teoria: '1/12' },
        { rotulo: 'Conferência: I em z = L', simbolo: 'I', expr: '(I0/(3*qe*vv/2*pi*(4*a0)^2))*3*qe*vv/2*pi*(4*a0)^2', unidade: 'A', teoria: 'I0' },
      ],
      passos: [
        {
          titulo: 'Corrente estacionária',
          texto: r`Sem acúmulo de carga, a mesma corrente atravessa todas as seções:

$$I = nqvA.$$`,
        },
        {
          titulo: 'As duas seções',
          previsao: { pergunta: 'A área em z = L é quantas vezes a de z = −L?', opcoes: ['4', '8', '16'], correta: 2 },
          texto: r`O raio quadruplica, então a área fica $16$ vezes maior:

$$n_-(2e)(v)A = n_+(3e)\left(\frac v2\right)(16A).$$`,
        },
        {
          titulo: 'Resposta',
          texto: r`$$2n_- = 24n_+ \quad\Rightarrow\quad \frac{n_+}{n_-} = \frac{1}{12}.$$

Alternativa **(f)**.`,
          medidas: [0, 1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Densidade de corrente e continuidade', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Continuidade', texto: r`$I = n_-q_-v_-A_- = n_+q_+v_+A_+$.`, passo: 0 },
          { titulo: 'Áreas', texto: r`$A_+ = 16A_-$.`, passo: 1 },
          { titulo: 'Razão', texto: r`$n_+/n_- = 2/24 = 1/12$.`, passo: 2 },
        ],
        resultado: r`$n_+/n_- = 1/12$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar a razão de raios, 4, em vez da de áreas, 16.`,
          r`Inverter a razão, chegando a 12.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: '$12$.', porque: r`É a razão invertida.` },
        { letra: 'b', texto: '$1/3$.', porque: r`Usa a razão de raios, sem o quadrado.` },
        { letra: 'c', texto: '$3$.', porque: r`Usa a razão de raios e inverte.` },
        { letra: 'd', texto: '$2/3$.', porque: r`Ignora a mudança de área e de velocidade.` },
        { letra: 'e', texto: '$3/2$.', porque: r`Ignora a mudança de área e de velocidade.` },
        { letra: 'f', texto: '$1/12$.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Dois arcos e dois segmentos radiais',
      resumo: 'Segmentos radiais não contribuem; os arcos se somam.',
      enunciado: r`Um fio fino, fechado, plano, com corrente estacionária de intensidade $I$, é constituído por dois arcos circulares, 1 e 3, concêntricos com o ponto $\mathcal O$, de raios $R_1$ e $R_3 > R_1$, respectivamente, e dois segmentos radiais, 2 e 4, de igual comprimento. A abertura angular do arco 1 vale $\alpha$, e, na correspondente figura indica-se também o sentido da corrente, assim como os vetores unitários (versores) cartesianos usuais. Qual é o campo magnético resultante, devido a tal fio, no ponto $\mathcal O$?`,
      figura: [
        { pagina: 3, recorte: [0.105, 0.148, 0.5, 0.305] },
        { pagina: 3, recorte: [0.26, 0.585, 0.5, 0.915] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'R1', rotulo: 'Raio do arco 1', simbolo: 'R_1', valor: 0.025, unidade: 'm', min: 0.015, max: 0.04, passo: 0.001 },
        { id: 'R3', rotulo: 'Raio do arco 3', simbolo: 'R_3', valor: 0.06, unidade: 'm', min: 0.045, max: 0.07, passo: 0.001 },
        { id: 'al', rotulo: 'Abertura', simbolo: r`\alpha`, valor: 80, unidade: '°', min: 20, max: 200, passo: 5 },
      ],
      objetos: [
        ...arco3,
        ...arco1,
        { id: 's4', tipo: 'fio', I: 'I0', a: pontoEm('R3', '(90 - al/2)'), b: pontoEm('R1', '(90 - al/2)') },
        { id: 's2', tipo: 'fio', I: 'I0', a: pontoEm('R1', '(90 + al/2)'), b: pontoEm('R3', '(90 + al/2)') },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Do segmento 2', simbolo: 'B_2', expr: "mag(Bde('s2', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Do segmento 4', simbolo: 'B_4', expr: "mag(Bde('s4', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Parte do arco 1', simbolo: 'B_1', expr: 'mu0*I0*rad(al)/(4*pi*R1)', unidade: 'T' },
        { rotulo: 'Parte do arco 3', simbolo: 'B_3', expr: 'mu0*I0*(2*pi - rad(al))/(4*pi*R3)', unidade: 'T' },
        { rotulo: 'Campo total', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: Bcentro },
      ],
      passos: [
        {
          titulo: 'Segmentos radiais',
          previsao: { pergunta: 'Os segmentos radiais contribuem para B em O?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Eles apontam para $\mathcal O$: $d\vec\ell\times\hat r = \vec 0$. Não há contribuição.`,
          destacar: ['s2', 's4'],
          medidas: [0, 1],
        },
        {
          titulo: 'Arcos',
          texto: r`Um arco de abertura $\theta$ e raio $R$ dá

$$B = \frac{\mu_0I\theta}{4\pi R},$$

a fração $\theta/2\pi$ da espira inteira. Aqui as aberturas são $\alpha$ e $2\pi - \alpha$. Os dois arcos giram no sentido anti-horário, e seus campos saem da página.`,
          medidas: [2, 3],
        },
        {
          titulo: 'Somar',
          texto: r`$$\vec B = \frac{\mu_0I}{4\pi}\left[\frac{\alpha}{R_1} + \frac{2\pi-\alpha}{R_3}\right]\hat z = \frac{\mu_0I}{4\pi R_1R_3}\left[(2\pi-\alpha)R_1 + \alpha R_3\right]\hat z.$$

Alternativa **(a)**.`,
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Biot-Savart', lab: 'ampere' }],
        etapas: [
          { titulo: 'Radiais', texto: r`Não contribuem.`, passo: 0 },
          { titulo: 'Arcos', texto: r`$\mu_0I\alpha/4\pi R_1$ e $\mu_0I(2\pi-\alpha)/4\pi R_3$, no mesmo sentido.`, passo: 1 },
          { titulo: 'Soma', texto: r`Pondo no denominador comum, sai a alternativa (a).`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0I}{4\pi R_1R_3}[(2\pi-\alpha)R_1 + \alpha R_3]\hat z$: alternativa **(a)**.`,
        errosComuns: [
          r`Trocar as aberturas: o arco interno tem abertura $\alpha$.`,
          r`Subtrair os arcos: a corrente vai no mesmo sentido em torno de $\mathcal O$ nos dois.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\mu_0I}{4\pi R_1R_3}[(2\pi-\alpha)R_1 + \alpha R_3]\,\hat z$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$\dfrac{\mu_0I}{4\pi R_1R_3}[(2\pi-\alpha)R_3 + \alpha R_1]\,\hat z$`, porque: r`Troca as aberturas dos arcos.` },
        { letra: 'c', texto: r`$\dfrac{\mu_0I}{2\pi R_1R_3}[(\pi-\alpha)R_3 - \alpha R_1]\,\hat z$`, porque: r`Subtrai os arcos.` },
        { letra: 'd', texto: r`$\dfrac{\mu_0I}{\pi R_1R_3}[(\pi+\alpha)R_1 - \alpha R_3]\,\hat z$`, porque: r`Não sai das aberturas.` },
        { letra: 'e', texto: r`$\vec 0$`, porque: r`Os arcos têm o mesmo sentido.` },
        { letra: 'f', texto: r`$\dfrac{\mu_0I(R_1+R_3)}{2R_1R_3}\,\hat z$`, porque: r`Trata os arcos como espiras inteiras.` },
        { letra: 'g', texto: r`$\dfrac{\mu_0I}{4\pi(R_1+R_3)}\,\hat z$`, porque: r`Não sai de $1/R$.` },
        { letra: 'h', texto: r`$\dfrac{\mu_0I\cos\alpha}{2\pi(R_3-R_1)}\,\hat z$`, porque: r`Não há $\cos\alpha$ na conta.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Espira com pulso gaussiano de campo',
      resumo: 'Fluxo, corrente, instante de máximo e potência dissipada.',
      enunciado: r`Uma espira com a forma irregular e que é fabricada com um arame condutor de comprimento $L$ e resistência elétrica $R$, se encontra no plano $z = 0$ e define uma área interna $A$ (vide figura). A partir do instante $t = 0$ é produzido o campo magnético não estacionário, mas uniforme, ortogonal ao plano da espira, dado por $\vec B = B_0F(t)\hat z$, onde $F(t) = e^{-(t-2\tau)^2/\tau^2}$, sendo $B_0 = \text{const} > 0$ e $\tau = \text{const} > 0$.

a) Obtenha a expressão para o fluxo do campo magnético $\Phi_B(t)$ através da espira como função do tempo $t$. b) Obtenha a corrente induzida $I_\text{ind}$ na espira. c) Determine o instante $t_0$ em que a corrente elétrica induzida assumirá o seu valor máximo $I_\text{max}$ e calcule esse valor. d) Faça um gráfico mostrando o comportamento da corrente induzida $I_\text{ind}$ dividida pelo valor de $I_\text{max}$ como função do tempo no intervalo $(0 \le t \le 5\tau)$. e) Obtenha a potência $P_\text{dis}$ dissipada por efeito Joule na espira devido à corrente induzida.`,
      figura: [
        { pagina: 3, recorte: [0.51, 0.19, 0.91, 0.58] },
        { pagina: 3, recorte: [0.54, 0.595, 0.865, 0.905] },
      ],
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [11, 9, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 5 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo máximo', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'tau', rotulo: 'Tempo característico', simbolo: r`\tau`, valor: 1, unidade: 's', min: 1, max: 1 },
        { id: 'A0', rotulo: 'Área', simbolo: 'A', valor: 0.01, unidade: 'm²', min: 0.002, max: 0.015, passo: 0.001 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.02, max: 1, passo: 0.02 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't', valor: 0, unidade: 's', min: 0, max: 5, passo: 0.01 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, `B0*exp(0-${X}^2)`], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: 'sqrt(A0/pi)', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*A0*exp(0-${X}^2)` },
        { rotulo: 'fem', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: femD },
        { rotulo: 'Corrente', simbolo: r`I_\text{ind}`, expr: "Iind('S')", unidade: 'A', teoria: `(${femD})/Rr` },
        { rotulo: 'Corrente máxima', simbolo: r`I_\text{max}`, expr: Imax, unidade: 'A' },
        { rotulo: 'Corrente relativa', simbolo: r`I/I_\text{max}`, expr: `Iind('S')/(${Imax})` },
        { rotulo: 'Potência dissipada', simbolo: r`P_\text{dis}`, expr: "Rr*Iind('S')^2", unidade: 'W', teoria: `(${femD})^2/Rr` },
      ],
      graficos: [
        {
          titulo: 'I/I_max no intervalo pedido',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: '5*tau', rotulo: 't', unidade: 's' },
          series: [{ rotulo: 'I/I_max', expr: 'sqrt(2)*((tt - 2*tau)/tau)*exp(0.5 - ((tt - 2*tau)/tau)^2)', unidade: '' }],
        },
        {
          titulo: 'F(t)',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: '5*tau', rotulo: 't', unidade: 's' },
          series: [{ rotulo: 'F', expr: 'exp(0 - ((tt - 2*tau)/tau)^2)', unidade: '' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: 'a) Fluxo',
          texto: r`O campo é uniforme, e perpendicular ao plano: a forma da espira não importa, só a área.

$$\Phi_B(t) = B_0A\,e^{-(t-2\tau)^2/\tau^2}.$$

É um pulso centrado em $t = 2\tau$.`,
          parametros: { t0: 0 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: 'b) Corrente',
          texto: r`Derivando:

$$\mathcal E_\text{ind} = -\frac{d\Phi_B}{dt} = \frac{2B_0A}{\tau}\left(\frac{t-2\tau}{\tau}\right)e^{-(t-2\tau)^2/\tau^2},$$

$$I_\text{ind} = \frac{\mathcal E_\text{ind}}{R}.$$

No pico do campo, em $t = 2\tau$, a corrente é **nula**.`,
          parametros: { t0: 2 },
          medidas: [1, 2],
        },
        {
          item: 'c',
          titulo: 'c) Instante de máximo',
          previsao: { pergunta: 'O máximo de I ocorre…', opcoes: ['em t = 2τ', 'antes de 2τ', 'depois de 2τ'], correta: 2 },
          texto: r`Com $u = (t-2\tau)/\tau$, a corrente vai com $ue^{-u^2}$. Derivando, $1 - 2u^2 = 0$, ou $u = \pm1/\sqrt2$.

Em $u < 0$ a corrente é negativa: é o mínimo. O máximo é em

$$t_0 = \left(2 + \frac{1}{\sqrt2}\right)\tau, \qquad I_\text{max} = \frac{\sqrt2B_0Ae^{-1/2}}{R\tau}.$$`,
          parametros: { t0: 2.7071 },
          medidas: [2, 3, 4],
        },
        {
          item: 'd',
          titulo: 'd) O gráfico',
          texto: r`$$\frac{I_\text{ind}}{I_\text{max}} = \sqrt2\left(\frac{t-2\tau}{\tau}\right)e^{\frac12 - (t-2\tau)^2/\tau^2}.$$

É ímpar em torno de $t = 2\tau$: mínimo de $-1$ em $t \approx 1{,}29\tau$, zero em $2\tau$, máximo de $+1$ em $t \approx 2{,}71\tau$. Enquanto $B$ sobe, a corrente tem um sentido; enquanto desce, o outro.`,
          parametros: { t0: 1.2929 },
          medidas: [2, 4],
        },
        {
          item: 'e',
          titulo: 'e) Potência',
          texto: r`$$P_\text{dis} = RI_\text{ind}^2 = \frac{4B_0^2A^2}{R\tau^2}\left(\frac{t-2\tau}{\tau}\right)^2e^{-2(t-2\tau)^2/\tau^2}.$$

Nunca é negativa: tem dois picos iguais, nos dois extremos da corrente.`,
          parametros: { t0: 2.7071 },
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday', lab: 'faraday' },
          { texto: 'Potência dissipada', lab: 'circuitos' },
        ],
        etapas: [
          { titulo: 'a) Fluxo', texto: r`$\Phi_B = B_0AF(t)$.`, passo: 0 },
          { titulo: 'b) Corrente', texto: r`$I_\text{ind} = \dfrac{2B_0A}{R\tau}\left(\dfrac{t-2\tau}{\tau}\right)e^{-(t-2\tau)^2/\tau^2}$.`, passo: 1 },
          { titulo: 'c) Máximo', texto: r`$t_0 = (2 + 1/\sqrt2)\tau$ e $I_\text{max} = \sqrt2B_0Ae^{-1/2}/(R\tau)$.`, passo: 2 },
          { titulo: 'd) Gráfico', texto: r`Mínimo $-1$, zero em $2\tau$, máximo $+1$.`, passo: 3 },
          { titulo: 'e) Potência', texto: r`$P_\text{dis} = RI_\text{ind}^2$.`, passo: 4 },
        ],
        resultado: r`$\Phi_B = B_0Ae^{-(t-2\tau)^2/\tau^2}$; $I_\text{ind} = \dfrac{2B_0A}{R\tau}\left(\dfrac{t-2\tau}{\tau}\right)e^{-(t-2\tau)^2/\tau^2}$; $t_0 = (2 + 1/\sqrt2)\tau$; $I_\text{max} = \dfrac{\sqrt2B_0Ae^{-1/2}}{R\tau}$; $P_\text{dis} = RI_\text{ind}^2$.`,
        errosComuns: [
          r`Achar que a corrente é máxima no pico de $B$: ali a derivada é zero.`,
          r`Ficar com a raiz $t_0^{(-)}$: nela a corrente é mínima, negativa.`,
          r`Esquecer a regra da cadeia na exponencial.`,
        ],
        oficial: { resposta: r`$\Phi_B = B_0Ae^{-(t-2\tau)^2/\tau^2}$; $I_\text{ind} = \dfrac{2B_0A}{R\tau}\left(\dfrac{t-2\tau}{\tau}\right)e^{-(t-2\tau)^2/\tau^2}$; $t_0 = (2 + 1/\sqrt2)\tau$; $I_\text{max} = \dfrac{\sqrt2B_0Ae^{-1/2}}{R\tau}$; $P_\text{dis} = \dfrac{4B_0^2A^2}{R\tau^2}\left(\dfrac{t-2\tau}{\tau}\right)^2e^{-2(t-2\tau)^2/\tau^2}$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\Phi_B = B_0Ae^{-(t-2\tau)^2/\tau^2}$`, pontos: 0.4, criterio: 'Campo uniforme: fluxo proporcional à área.' },
        { item: 'b', texto: r`$I_\text{ind} = \dfrac{2B_0A}{R\tau}\left(\dfrac{t-2\tau}{\tau}\right)e^{-(t-2\tau)^2/\tau^2}$`, pontos: 1, criterio: 'Lei de Faraday e lei de Ohm.' },
        { item: 'c', texto: r`$t_0 = \left(2 + \dfrac{1}{\sqrt2}\right)\tau$; $I_\text{max} = \dfrac{\sqrt2B_0Ae^{-1/2}}{R\tau}$`, pontos: 1.2, criterio: 'Derivada nula e escolha da raiz do máximo.' },
        { item: 'd', texto: r`Curva ímpar em torno de $2\tau$, entre $-1$ e $+1$`, pontos: 0.8, criterio: 'Formato, zeros e extremos no intervalo.' },
        { item: 'e', texto: r`$P_\text{dis} = \dfrac{4B_0^2A^2}{R\tau^2}\left(\dfrac{t-2\tau}{\tau}\right)^2e^{-2(t-2\tau)^2/\tau^2}$`, pontos: 0.6, criterio: r`$P = RI^2$.` },
      ],
    },
  ],
}

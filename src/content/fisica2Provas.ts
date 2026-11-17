import type { ProblemaF2 } from './fisica2'

const r = String.raw

/**
 * Provas anteriores de Física II (P2): enunciados reescritos a partir das
 * provas, conferidos com o gabarito oficial; as resoluções são desta bancada.
 * As figuras das provas viram gráficos interativos.
 */

const fase = (rotulo = 'Fase ωt') => ({ id: 'wt', rotulo, valor: 0, min: 0, max: 2 * Math.PI, passo: 0.01, unidade: 'rad', anima: 2.2 })

/* Pulso da questão de reflexão (2025/1, Q7): corcova larga seguida de um vale pequeno; a haste fica em x = 0. */
const pulso = (u: string) => `(exp(-(((${u}) + 3)/0.7)^2) - 0.4*exp(-(((${u}) + 1.4)/0.3)^2))`
const deformado = (u: string) =>
  `(0.9*exp(-(((${u}) + 3.2)/0.7)^2) - 0.25*exp(-(((${u}) + 1.9)/0.18)^2) + 0.25*exp(-(((${u}) + 1.5)/0.18)^2) - 0.25*exp(-(((${u}) + 1.1)/0.18)^2))`
const OPCOES_REFLEXAO = [pulso('x'), `(0-${pulso('x')})`, `(0-${pulso('-5-x')})`, pulso('-5-x'), deformado('x'), `(0-${deformado('x')})`]
const escolheOpcao = OPCOES_REFLEXAO.slice(0, -1).reduceRight((resto, e, i) => `(op < ${i + 1.5} ? ${e} : ${resto})`, OPCOES_REFLEXAO.at(-1)!)

/* Corda fixa em 0 e livre em L = 1 (2025/2, Q5): extensão ímpar em 0, par em L, período 4L; pulso triangular em L/2. */
const tri = (z: string) => `max(0, 1 - abs(${z})/0.08)`
const ext = (u: string) => {
  const s = `((${u}) - 4*floor((${u})/4))`
  return `(${tri(`${s} - 0.5`)} + ${tri(`${s} - 1.5`)} - ${tri(`${s} - 2.5`)} - ${tri(`${s} - 3.5`)})`
}
export const PULSO_FIXA_LIVRE = `0.5*(${ext('x - t')} + ${ext('x + t')})`

/*
 * Pulso retangular andando para a direita na corda fixa em 0 e livre em L = 1 (2024/2, Q1):
 * y = G(x − t) − G(−x − t), com G antiperiódica de meio período 2L (ponta livre) e o
 * termo com sinal trocado garantindo o nó em x = 0.
 */
const ret = (z: string) => `(abs(${z}) < 0.1 ? 1 : 0)`
const G = (u: string) => {
  const s = `((${u}) - 4*floor(((${u}) + 1)/4))`
  return `(${ret(`${s} - 0.5`)} - ${ret(`${s} - 2.5`)})`
}
export const PULSO_RETANGULAR = `${G('x - t')} - ${G('-x - t')}`

export const PROVAS_F2: ProblemaF2[] = [
  /* ═════════════════════════ P2 2026/1 ═════════════════════════ */
  {
    id: 'p2-2026-1-d',
    numero: 'Q1',
    grupo: 'P2 2026/1',
    assunto: 'Modos normais de uma corda',
    titulo: 'Corda com anel livre e bloco pendurado',
    resumo: 'Anel livre = ventre: λₙ = 4L/(2n+1); ω = k√(mg/μ); com o anel preso, λ′ = 2L e ν′ = (1/2L)√(mg/μ).',
    enunciado: r`Uma corda homogênea e inextensível, de comprimento $L$ e densidade linear de massa $\mu$, é tensionada por um bloco de massa $m$ pendurado na ponta direita: a corda passa por uma polia em $x = L$ e o bloco fica parado. A ponta esquerda está presa a um **anel de massa desprezível** que desliza **sem atrito** numa haste vertical, em $x = 0$. O eixo $x$ aponta para a direita, com origem no anel. Uma fonte externa de frequência ajustável produz ondas transversais na corda. (Questão discursiva, 3 pontos.)

(a) (0,8 ponto) Considere a função de onda $y(x,t) = [A\cos(kx) + B\,\text{sen}(kx)]\cos(\omega t + \delta)$, com $A$, $B$ e $\delta$ constantes. Usando as condições de contorno $\partial y(0,t)/\partial x = 0$ e $y(L,t) = 0$, determine o comprimento de onda do $n$-ésimo modo normal.

(b) (0,9 ponto) Esboce os três modos normais de menor frequência.

(c) (0,8 ponto) A corda obedece à equação de onda $T\,\dfrac{\partial^2 y}{\partial x^2} = \mu\,\dfrac{\partial^2 y}{\partial t^2}$, em que $T$ é a tração. Substitua a função do item (a) e obtenha a relação de dispersão (a relação entre $\omega$ e $k$) em função de $\mu$, $m$ e $g$.

(d) (0,5 ponto) Se o anel for **preso** à haste, calcule, em função de $\mu$, $m$, $g$ e $L$, a frequência $\nu'$ e o comprimento de onda $\lambda'$ do modo de menor frequência.`,
    graficos: [
      {
        titulo: 'Os modos com o anel livre (ventre em x = 0, nó em x = L)',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y / A' },
        curvas: [
          { expr: 'cos((2*n + 1)*pi*x/2)*cos(wt)', rotulo: 'corda no instante' },
          { expr: 'cos((2*n + 1)*pi*x/2)', rotulo: 'envoltória (amplitude de cada ponto)', cor: 'mute', tracejada: true },
          { expr: '0-cos((2*n + 1)*pi*x/2)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'n', rotulo: 'Modo n (λ = 4L/(2n+1))', valor: 0, min: 0, max: 2, passo: 1 }, fase()],
        marcas: [{ x: 1, rotulo: 'polia: nó' }],
      },
      {
        titulo: 'Item (d): anel preso, as duas pontas são nós',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y / A' },
        curvas: [
          { expr: 'sin(pi*x)*cos(wt)', rotulo: 'modo fundamental: λ′ = 2L' },
          { expr: 'cos(pi*x/2)*cos(wt)', rotulo: 'o fundamental com o anel livre (λ = 4L), para comparar', cor: 'mute', tracejada: true },
        ],
        parametros: [fase()],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$B = 0$ e $\cos(kL) = 0$: $k_nL = (2n+1)\dfrac\pi2$, logo $\lambda_n = \dfrac{4L}{2n+1}$, $n = 0, 1, 2, \dots$` },
      { item: '(b)', texto: r`$\lambda_0 = 4L$ (um quarto de onda), $\lambda_1 = 4L/3$ (três quartos), $\lambda_2 = 4L/5$ (cinco quartos); sempre ventre no anel e nó na polia.` },
      { item: '(c)', texto: r`$\omega = k\sqrt{T/\mu}$ com $T = mg$: $\omega = k\sqrt{\dfrac{mg}{\mu}}$` },
      { item: '(d)', texto: r`$\lambda' = 2L$ e $\nu' = \dfrac{1}{2L}\sqrt{\dfrac{mg}{\mu}}$` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Ondas estacionárias e condições de contorno' }, { texto: 'Equação de onda e velocidade numa corda' }],
      etapas: [
        {
          titulo: '(a) Comprimento de onda do n-ésimo modo',
          texto: r`**O que se pede.** Quais comprimentos de onda a corda aceita quando a ponta esquerda é um anel livre e a direita passa pela polia.

**O que cada ponta impõe.**
- O **anel** não tem massa e desliza sem atrito. Se a corda chegasse inclinada nele, a tração teria uma componente vertical sem nada para equilibrá-la, e um corpo sem massa com força resultante teria aceleração infinita. Por isso a corda chega **horizontal** ao anel: a inclinação $\partial y/\partial x$ é zero em $x = 0$. Essa ponta vira um **ventre** (ponto que oscila com amplitude máxima).
- Na **polia** a corda não se mexe na vertical: $y(L,t) = 0$, um **nó**.

**Primeira condição.** Derivando em $x$:
$$\frac{\partial y}{\partial x} = k[-A\,\text{sen}(kx) + B\cos(kx)]\cos(\omega t + \delta).$$
Em $x = 0$: $kB\cos(\omega t + \delta) = 0$ para todo $t$. O cosseno não é zero sempre, e $k \neq 0$, então $B = 0$.

**Segunda condição.** Com $B = 0$, $y(L,t) = A\cos(kL)\cos(\omega t + \delta) = 0$ para todo $t$. Não pode ser $A = 0$, porque aí a corda ficaria parada (solução trivial). Sobra
$$\cos(kL) = 0 \;\Rightarrow\; k_nL = (2n+1)\frac\pi2,\quad n = 0, 1, 2, \dots$$
(o cosseno zera nos múltiplos **ímpares** de $\pi/2$).

**Comprimento de onda.** Como $\lambda = 2\pi/k$:
$$\lambda_n = \frac{2\pi L}{(2n+1)\pi/2} = \frac{4L}{2n+1}.$$

**Conferindo.** O modo mais simples ($n = 0$) tem $\lambda = 4L$: a corda inteira é **um quarto** de onda, do ventre ao nó, que é exatamente a distância entre um ventre e o nó seguinte.`,
        },
        {
          titulo: '(b) Os três modos de menor frequência',
          texto: r`**O que se pede.** Desenhar os três primeiros modos, os de $n = 0, 1, 2$.

**A regra do desenho.** Em todos eles a corda chega **horizontal** ao anel ($x = 0$, ventre) e passa **parada** na polia ($x = L$, nó). Entre um ventre e o nó vizinho cabe sempre um quarto de onda; por isso o comprimento $L$ tem de ser um número **ímpar** de quartos de onda.

- $n = 0$: $\lambda_0 = 4L$. A corda é um quarto de onda: parece metade de um arco, máxima no anel e descendo até zero na polia, sem nenhum nó no meio.
- $n = 1$: $\lambda_1 = 4L/3$. Três quartos de onda: ventre no anel, um nó em $x = L/3$, um ventre em $x = 2L/3$ e o nó da polia.
- $n = 2$: $\lambda_2 = 4L/5$. Cinco quartos de onda: nós internos em $x = L/5$ e $3L/5$, ventres em $2L/5$ e $4L/5$, mais o ventre do anel e o nó da polia.

No esboço, desenhe cada modo duas vezes (linha cheia e tracejada) para mostrar os dois extremos da oscilação: o tracejado é o espelho da linha cheia em torno do eixo $x$.

**Conferindo.** No gráfico interativo, ponha o modo $n$ em 0, 1 e 2 e aperte "Animar": o anel sobe e desce com a maior amplitude, e a polia nunca se mexe. As frequências crescem como $1 : 3 : 5$, porque $\omega = vk$ e $k_n \propto 2n+1$.`,
        },
        {
          titulo: '(c) Relação de dispersão',
          texto: r`**O que se pede.** Que relação entre $\omega$ e $k$ faz a função do item (a) obedecer à equação de onda.

**Derivadas no espaço.** Derivar duas vezes um seno ou cosseno de $kx$ devolve a mesma função vezes $-k^2$:
$$\frac{\partial^2 y}{\partial x^2} = -k^2\,y(x,t).$$

**Derivadas no tempo.** Do mesmo jeito, derivar duas vezes $\cos(\omega t + \delta)$ devolve $-\omega^2$ vezes ela:
$$\frac{\partial^2 y}{\partial t^2} = -\omega^2\,y(x,t).$$

**Substituindo.** $T(-k^2 y) = \mu(-\omega^2 y)$. Para valer em todo ponto e instante, os coeficientes têm de ser iguais:
$$Tk^2 = \mu\omega^2 \;\Rightarrow\; \omega = k\sqrt{\frac{T}{\mu}}.$$
O fator $\sqrt{T/\mu}$ é a velocidade da onda na corda, $v$.

**A tração vem do bloco.** O bloco está parado, então a corda o puxa para cima com a mesma força que o peso o puxa para baixo: $T = mg$. A polia sem atrito só muda a direção da corda, não o valor da tração. Logo
$$\omega = k\sqrt{\frac{mg}{\mu}}.$$

**Conferindo as unidades.** $mg/\mu$ é newton dividido por kg/m, que dá m²/s²; a raiz é m/s, e $k$ (1/m) vezes m/s dá 1/s, a unidade de $\omega$.`,
        },
        {
          titulo: '(d) Anel preso: o novo modo fundamental',
          texto: r`**O que se pede.** O comprimento de onda e a frequência do modo mais baixo quando o anel deixa de deslizar.

**O que muda.** Com o anel preso, a ponta esquerda também não se mexe: as **duas** pontas são nós, $y(0,t) = y(L,t) = 0$. Entre dois nós vizinhos cabe **meia** onda. O modo mais simples tem só esses dois nós, um arco único, então
$$L = \frac{\lambda'}{2} \;\Rightarrow\; \lambda' = 2L.$$
Compare com o item (a): o anel livre dava $\lambda_0 = 4L$. Prender o anel encurta o comprimento de onda do fundamental pela metade.

**A frequência.** A relação de dispersão do item (c) não depende das pontas: vem da corda. Escrevendo $\omega = 2\pi\nu$ e $k = 2\pi/\lambda$, ela vira $\nu\lambda = v$, isto é,
$$\nu = \frac1\lambda\sqrt{\frac{mg}{\mu}}.$$
Com $\lambda' = 2L$:
$$\nu' = \frac{1}{2L}\sqrt{\frac{mg}{\mu}}.$$

**Conferindo.** Com o anel livre, o fundamental tinha $\nu_0 = \dfrac{1}{4L}\sqrt{mg/\mu}$; prender o anel **dobra** a frequência mais baixa. No segundo gráfico, o arco cheio (anel preso) oscila com o dobro da frequência da curva tracejada (anel livre).`,
        },
      ],
      resultado: r`$\lambda_n = 4L/(2n+1)$; modos de um, três e cinco quartos de onda; $\omega = k\sqrt{mg/\mu}$; com o anel preso, $\lambda' = 2L$ e $\nu' = \frac{1}{2L}\sqrt{mg/\mu}$.`,
      errosComuns: [
        r`Tratar o anel como ponta fixa: ele desliza, então é ventre ($\partial y/\partial x = 0$), não nó.`,
        r`Usar $k_nL = n\pi$ (a regra de duas pontas fixas) no item (a).`,
        r`Esquecer que a tração é o peso do bloco, $T = mg$, e deixar a resposta em função de $T$.`,
      ],
    },
  },

  /* ═════════════════════════ P2 2025/2 ═════════════════════════ */
  {
    id: 'p2-2025-2-q1',
    numero: 'Q1',
    grupo: 'P2 2025/2',
    assunto: 'MHS: condições iniciais',
    titulo: 'Solta na origem com 10 m/s',
    resumo: 'ω = 20 rad/s, A = v₀/ω = 0,5 m, e a fase 3π/2 porque começa andando para +x.',
    enunciado: r`Uma partícula de massa $m = 10$ kg está presa a uma mola de constante elástica $k = 4000$ N/m. No instante inicial ela está na **origem** (posição de equilíbrio) e tem velocidade de $10$ m/s (no sentido positivo de $x$). Qual opção dá a posição da partícula, que descreve um movimento harmônico simples, em função do tempo? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$x(t) = \frac14\cos(10t + \frac\pi2)$`, porque: r`A frequência está errada: $\omega = \sqrt{k/m} = 20$ rad/s, não 10.` },
      { letra: '2', texto: r`$x(t) = \frac14\cos(10t + \frac{3\pi}2)$`, porque: r`Também usa $\omega = 10$ rad/s, e a amplitude $\frac14$ daria velocidade máxima de só 2,5 m/s.` },
      { letra: '3', texto: r`$x(t) = 2\cos(20t + \frac{3\pi}2)$`, porque: r`Com $A = 2$ m, a velocidade máxima seria $A\omega = 40$ m/s, não 10.` },
      { letra: '4', texto: r`$x(t) = \frac12\cos(20t + \frac{3\pi}2)$`, correta: true, porque: r`Certa: $\omega = 20$, $A = v_0/\omega = 0{,}5$ m, e $v(0) = -A\omega\,\text{sen}(3\pi/2) = +10$ m/s.` },
      { letra: '5', texto: r`$x(t) = \frac12\cos(20t + \frac\pi2)$`, porque: r`Frequência e amplitude certas, mas $v(0) = -A\omega\,\text{sen}(\pi/2) = -10$ m/s: andaria para o lado negativo.` },
    ],
    graficos: [
      {
        titulo: 'A certa (cheia) e a de fase trocada (tracejada)',
        x: { variavel: 't', de: 0, ate: 0.65, rotulo: 't (s)' },
        y: { de: -0.7, ate: 0.7, rotulo: 'x (m)' },
        curvas: [
          { expr: '0.5*cos(20*t + 3*pi/2)', rotulo: 'opção 4: começa subindo' },
          { expr: '0.5*cos(20*t + pi/2)', rotulo: 'opção 5: começa descendo', cor: 'neg', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`4: $x(t) = \frac12\cos\!\left(20t + \frac{3\pi}2\right)$ (em metros)` }],
    resolucao: {
      conceitos: [{ texto: 'MHS: frequência, amplitude e fase pelas condições iniciais' }],
      etapas: [
        {
          titulo: 'Alternativa: montar x(t) a partir do instante inicial',
          texto: r`**O que se pede.** Escolher a função $x(t) = A\cos(\omega t + \varphi)$ que descreve esta partícula. São três números a descobrir: $\omega$, $A$ e $\varphi$.

**A frequência angular vem da mola e da massa.**
$$\omega = \sqrt{\frac km} = \sqrt{\frac{4000}{10}} = \sqrt{400} = 20\ \text{rad/s}.$$
Isso já elimina as opções 1 e 2, que usam 10.

**A amplitude vem da velocidade na origem.** Na posição de equilíbrio toda a energia é cinética e a velocidade é a máxima do movimento, que vale $A\omega$. Então
$$A = \frac{v_0}{\omega} = \frac{10}{20} = 0{,}5\ \text{m}.$$
Isso elimina a opção 3 ($A = 2$ m).

**A fase decide entre 4 e 5.** Em $t = 0$, $x(0) = A\cos\varphi = 0$, então $\varphi = \pi/2$ ou $3\pi/2$. Quem desempata é o **sentido** da velocidade. Derivando, $v(t) = -A\omega\,\text{sen}(\omega t + \varphi)$, e em $t = 0$:
$$v(0) = -A\omega\,\text{sen}\varphi = +10\ \text{m/s} \;\Rightarrow\; \text{sen}\varphi = -1 \;\Rightarrow\; \varphi = \frac{3\pi}2.$$
Com $\varphi = \pi/2$ o seno seria $+1$ e a partícula sairia para o lado negativo.

**Conferindo.** $\frac12\cos(20t + 3\pi/2) = \frac12\,\text{sen}(20t)$: começa em zero e sobe, com inclinação $\frac12 \cdot 20 = 10$ m/s. No gráfico, a curva cheia sai subindo e a tracejada (opção 5) sai descendo.

**Resposta.** Opção **4**.`,
        },
      ],
      resultado: r`$x(t) = \frac12\cos(20t + 3\pi/2)$: opção **4**.`,
      errosComuns: [r`Parar em $\cos\varphi = 0$ e escolher $\pi/2$ sem olhar o sinal da velocidade.`, r`Confundir $\omega = \sqrt{k/m}$ com $k/m$ ou com a frequência $f$.`],
    },
  },
  {
    id: 'p2-2025-2-q2',
    numero: 'Q2',
    grupo: 'P2 2025/2',
    assunto: 'Pêndulo simples: energia',
    titulo: 'A energia de um pêndulo de 10 m',
    resumo: 'No extremo só há energia potencial: E = mgA²/(2L) = 0,01 J.',
    enunciado: r`Um pêndulo é formado por uma massa puntiforme $m = 2$ kg presa a um fio inextensível de comprimento $L = 10$ m. Ele oscila com pequena amplitude $A = 0{,}1$ m (o afastamento horizontal máximo). Para pequenas oscilações, a energia mecânica total é, aproximadamente,
$$E = \frac12 mL^2\dot\theta^2 + \frac12 mgL\theta^2,$$
em que $\theta$ é o ângulo com a vertical e $\dot\theta$ a velocidade angular. Quanto vale $E$? Use $g = 10$ m/s². (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: '0,001 J', porque: r`Dez vezes menor que o certo: a conta coerente em unidades do SI dá 0,01 J.` },
      { letra: '2', texto: '0,01 J', correta: true, porque: r`Certa: $E = mgA^2/(2L) = 2 \cdot 10 \cdot 0{,}01/20 = 0{,}01$ J.` },
      { letra: '3', texto: '0,1 J', porque: r`Seria $mgA^2/2$: esquece de dividir por $L$ ao trocar $\theta$ por $A/L$.` },
      { letra: '4', texto: '1 J', porque: r`Seria $\frac12 mgA = 1$ J, como se a massa subisse 5 cm; ela sobe só $A^2/(2L) = 0{,}5$ mm.` },
      { letra: '5', texto: '10 J', porque: r`Ordem de grandeza sem relação com a amplitude de 10 cm.` },
    ],
    graficos: [
      {
        titulo: 'Energias ao longo de uma oscilação (ω = √(g/L) = 1 rad/s)',
        x: { variavel: 't', de: 0, ate: 6.3, rotulo: 't (s)' },
        y: { de: 0, ate: 0.012, rotulo: 'energia (J)' },
        curvas: [
          { expr: '0.01*cos(t)^2', rotulo: 'potencial ½mgLθ²' },
          { expr: '0.01*sin(t)^2', rotulo: 'cinética ½mL²θ̇²', cor: 'pos' },
          { expr: '0.01', rotulo: 'total: 0,01 J', cor: 'mute', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`2: $E = 0{,}01$ J` }],
    resolucao: {
      conceitos: [{ texto: 'Pêndulo simples: pequenas oscilações' }, { texto: 'Conservação da energia no MHS' }],
      etapas: [
        {
          titulo: 'Alternativa: calcular a energia no ponto mais conveniente',
          texto: r`**O que se pede.** O valor da energia mecânica total, que não muda durante o movimento (não há atrito).

**A ideia.** Como a energia é a mesma em todo instante, escolhemos o instante mais fácil: o **ponto de retorno**, onde a massa para por um momento. Ali $\dot\theta = 0$, a parcela cinética some e sobra só a potencial:
$$E = \frac12 mgL\,\theta_{\max}^2.$$

**Do afastamento ao ângulo.** Para ângulos pequenos (em radianos), o arco percorrido e o afastamento horizontal são quase iguais a $L\theta$. Então
$$A \approx L\theta_{\max} \;\Rightarrow\; \theta_{\max} = \frac AL = \frac{0{,}1}{10} = 0{,}01\ \text{rad}.$$
Um centésimo de radiano é cerca de meio grau: a aproximação de ângulo pequeno vale muito bem.

**A conta.**
$$E = \frac12 mgL\left(\frac AL\right)^2 = \frac{mgA^2}{2L} = \frac{2 \cdot 10 \cdot (0{,}1)^2}{2 \cdot 10} = \frac{0{,}2}{20} = 0{,}01\ \text{J}.$$

**Conferindo de outro jeito.** A altura que a massa sobe no extremo é $h = L(1 - \cos\theta) \approx L\theta^2/2 = 10 \cdot 0{,}0001/2 = 0{,}5$ mm. A energia potencial é $mgh = 2 \cdot 10 \cdot 0{,}0005 = 0{,}01$ J, o mesmo valor. No gráfico, as energias cinética e potencial trocam de lugar, mas a soma fica sempre em 0,01 J.

**Resposta.** Opção **2**.`,
        },
      ],
      resultado: r`$E = mgA^2/(2L) = 0{,}01$ J: opção **2**.`,
      errosComuns: [r`Usar $\theta = A$ (sem dividir por $L$) e chegar a 0,1 J.`, r`Achar que a massa sobe a altura $A$: ela sobe só $A^2/(2L)$.`],
    },
  },
  {
    id: 'p2-2025-2-q3',
    numero: 'Q3',
    grupo: 'P2 2025/2',
    assunto: 'MHS em outro sistema',
    titulo: 'Uma massa entre duas massas fixas',
    resumo: 'Para y pequeno a gravidade vira mola: F = −16GMm·y/d³, ω = (4/d)√(GM/d). As opções 2 e 4 são iguais.',
    enunciado: r`Dois corpos de massa $M$ estão **fixos**, separados pela distância $d$. Um terceiro corpo, de massa $m$ e livre para se mover, está a uma altura $y$ acima do ponto médio entre eles, sobre a mediatriz do segmento que os une. A atração gravitacional entre dois corpos tem módulo $F = GMm/r^2$, ao longo da reta que os liga, em que $r$ é a distância entre eles. Considerando $y \ll d/2$, qual é a frequência angular de oscilação de $m$? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$\omega = \frac1d\sqrt{\frac{GM}{d}}$`, porque: r`Quatro vezes menor: perde o fator $\sqrt{16}$ que vem de $8/d^3$ vezes as duas massas.` },
      { letra: '2', texto: r`$\omega = \frac4d\sqrt{\frac{GM}{d}}$`, correta: true, porque: r`Certa: $\omega^2 = 16GM/d^3$.` },
      { letra: '3', texto: r`$\omega = \frac2d\sqrt{\frac{2GM}{d}}$`, porque: r`Dá $\omega^2 = 8GM/d^3$: equivale a contar só uma das duas massas.` },
      { letra: '4', texto: r`$\omega = \frac4d\sqrt{\frac{GM}{d}}$`, correta: true, porque: r`É a mesma expressão da opção 2, repetida na prova; o gabarito oficial aceita as duas.` },
      { letra: '5', texto: r`$\omega = \frac4d\sqrt{\frac{GM}{2d}}$`, porque: r`Dá $\omega^2 = 8GM/d^3$, a metade do certo.` },
      { letra: '6', texto: r`$\omega = \frac{2}{\pi d}\sqrt{\frac{GM}{d}}$`, porque: r`Um $\pi$ não tem de onde surgir: a força não envolve nenhuma volta ou período.` },
    ],
    graficos: [
      {
        titulo: 'Força vertical em m: a exata e a reta da aproximação',
        x: { variavel: 'Y', de: -0.5, ate: 0.5, rotulo: 'y / d' },
        y: { de: -10, ate: 10, rotulo: 'F_y / (GMm/d²)' },
        curvas: [
          { expr: '-2*Y/(Y^2 + 0.25)^1.5', rotulo: 'exata: −2y/r³' },
          { expr: '-16*Y', rotulo: 'aproximação: −16y/d³ (uma "mola")', cor: 'mute', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`2 (ou 4, que é idêntica): $\omega = \dfrac4d\sqrt{\dfrac{GM}{d}}$` }],
    resolucao: {
      conceitos: [{ texto: 'Força restauradora linear e MHS' }, { texto: 'Aproximação para deslocamentos pequenos' }],
      etapas: [
        {
          titulo: 'Alternativa: transformar a gravidade numa mola',
          texto: r`**O que se pede.** A frequência das pequenas oscilações de $m$ em torno do ponto médio.

**A ideia.** Um movimento é harmônico quando a força resultante é proporcional ao deslocamento e aponta de volta: $F = -Ky$. Aí $\omega = \sqrt{K/m}$. Basta achar esse "$K$ efetivo".

**As forças.** Cada massa $M$ puxa $m$ ao longo da reta que as liga, com módulo $GMm/r^2$, em que $r = \sqrt{y^2 + (d/2)^2}$. As componentes **horizontais** das duas forças são iguais e opostas (simetria) e se cancelam. As **verticais** se somam, e ambas apontam para baixo, em direção à reta das massas. Se $\theta$ é o ângulo entre a reta $M$-$m$ e a vertical, $\cos\theta = y/r$, e
$$F_y = -2\,\frac{GMm}{r^2}\cdot\frac yr = -\frac{2GMm\,y}{\left(y^2 + d^2/4\right)^{3/2}}.$$
O sinal negativo diz que a força aponta para o ponto médio: é restauradora.

**A aproximação.** Com $y \ll d/2$, o $y^2$ no denominador é desprezível perto de $d^2/4$:
$$\left(\frac{d^2}{4}\right)^{3/2} = \frac{d^3}{8} \;\Rightarrow\; F_y \approx -\frac{16GMm}{d^3}\,y.$$
É uma mola de constante $K = 16GMm/d^3$.

**A frequência.** Pela segunda lei de Newton, $m\ddot y = -Ky$, então
$$\omega = \sqrt{\frac Km} = \sqrt{\frac{16GM}{d^3}} = \frac4d\sqrt{\frac{GM}{d}}.$$
A massa $m$ some: como num pêndulo, a força e a inércia são proporcionais a $m$.

**Conferindo.** No gráfico, perto de $y = 0$ a força exata e a reta tracejada coincidem; elas se separam só quando $y$ fica comparável a $d/2$.

**Resposta.** Opção **2**. Na prova, a opção **4** traz exatamente a mesma expressão, e o gabarito oficial aceita as duas.`,
        },
      ],
      resultado: r`$\omega = \frac4d\sqrt{GM/d}$: opções **2** e **4** (idênticas).`,
      errosComuns: [r`Somar as forças inteiras das duas massas, sem projetar na vertical: as componentes horizontais se cancelam.`, r`Esquecer o expoente: $(d/2)^3 = d^3/8$, não $d^3/2$.`],
    },
  },
  {
    id: 'p2-2025-2-q4',
    numero: 'Q4',
    grupo: 'P2 2025/2',
    assunto: 'Velocidade numa corda',
    titulo: 'Tensão a partir do tempo de descida',
    resumo: 'Do máximo ao zero é T/4: período 0,4 s, v = λ/T = 5 m/s e tensão μv² = 1,25 N.',
    enunciado: r`Uma onda harmônica de comprimento de onda $2$ m se propaga numa corda de densidade linear $50$ g/m. Um ponto da corda leva $0{,}1$ s para ir do deslocamento máximo até o zero. Qual é a tensão na corda? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: '25 N', porque: r`É só $v^2 = 25$: esquece de multiplicar pela densidade.` },
      { letra: '2', texto: '5 N', porque: r`Sai ao tomar 0,1 s como **meio** período: $\tau = 0{,}2$ s, $v = 10$ m/s e $\mu v^2 = 5$ N.` },
      { letra: '3', texto: '50 N', porque: r`Não sai de nenhuma leitura coerente dos dados; a conta certa dá 1,25 N.` },
      { letra: '4', texto: '0,3125 N', porque: r`Corresponde a $v = 2{,}5$ m/s, a metade da velocidade certa (por exemplo, usando $\lambda/2$ no lugar de $\lambda$).` },
      { letra: '5', texto: '1,25 N', correta: true, porque: r`Certa: $T = \mu v^2 = 0{,}05 \cdot 5^2 = 1{,}25$ N.` },
      { letra: '6', texto: '6,25 N', porque: r`É cinco vezes o valor certo; não sai de nenhuma leitura coerente dos dados.` },
    ],
    graficos: [
      {
        titulo: 'Deslocamento de um ponto da corda: do máximo ao zero em 0,1 s',
        x: { variavel: 't', de: 0, ate: 0.8, rotulo: 't (s)' },
        y: { de: -1.3, ate: 1.3, rotulo: 'y / A' },
        curvas: [{ expr: 'sin(2*pi*t/0.4)', rotulo: 'período 0,4 s' }],
        marcas: [
          { x: 0.1, rotulo: 'máximo' },
          { x: 0.2, rotulo: 'zero' },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`5: $T = 1{,}25$ N` }],
    resolucao: {
      conceitos: [{ texto: 'Período de uma onda harmônica' }, { texto: 'Velocidade da onda numa corda: v = √(T/μ)' }],
      etapas: [
        {
          titulo: 'Alternativa: do tempo ao período, à velocidade e à tensão',
          texto: r`**O que se pede.** A tensão (força de tração) da corda.

**O caminho.** A tensão aparece em $v = \sqrt{T/\mu}$, isto é, $T = \mu v^2$. A velocidade vem de $v = \lambda/\tau$, em que $\tau$ é o período. O período sai do tempo dado no enunciado.

**O período.** Cada ponto da corda faz um MHS. Numa oscilação completa ele vai do máximo ao zero, do zero ao mínimo, do mínimo ao zero e do zero de volta ao máximo: quatro trechos iguais. Então ir do máximo ao zero leva **um quarto** do período:
$$\frac\tau4 = 0{,}1\ \text{s} \;\Rightarrow\; \tau = 0{,}4\ \text{s}.$$

**A velocidade.** Em um período a onda anda um comprimento de onda:
$$v = \frac\lambda\tau = \frac{2}{0{,}4} = 5\ \text{m/s}.$$

**A tensão.** Convertendo a densidade, $\mu = 50$ g/m $= 0{,}05$ kg/m. Então
$$T = \mu v^2 = 0{,}05 \cdot 25 = 1{,}25\ \text{N}.$$

**Conferindo.** No gráfico, a curva chega ao máximo em $t = 0{,}1$ s e volta a zero em $0{,}2$ s: 0,1 s do máximo ao zero, com período de 0,4 s.

**Resposta.** Opção **5**.`,
        },
      ],
      resultado: r`$\tau = 0{,}4$ s, $v = 5$ m/s, $T = \mu v^2 = 1{,}25$ N: opção **5**.`,
      errosComuns: [r`Tomar 0,1 s como período inteiro (ou como meio período).`, r`Usar $\mu = 50$ sem converter g/m para kg/m.`],
    },
  },
  {
    id: 'p2-2025-2-q5',
    numero: 'Q5',
    grupo: 'P2 2025/2',
    assunto: 'Reflexão em pontas fixa e livre',
    titulo: 'Quando a corda volta a ser a mesma',
    resumo: 'Ponta fixa inverte, ponta livre não: em 2L/v a corda está invertida, e só em 4L/v volta ao início.',
    enunciado: r`Uma corda de comprimento $L$ está esticada, com a ponta $x = 0$ **fixa** e a ponta $x = L$ **livre** (um anel que desliza sem atrito numa haste). Em $t = 0$, um pequeno pulso triangular de amplitude $A$, com o vértice em $x = L/2$, é formado e **solto do repouso**. Os pulsos se propagam na corda com velocidade $v$. Depois de quanto tempo a corda volta, pela primeira vez, à configuração inicial? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$L/v$`, porque: r`Em $L/v$ cada metade do pulso fez uma única reflexão e as duas se cruzam no meio com sinais opostos: a corda fica reta.` },
      { letra: '2', texto: r`$2L/v$`, porque: r`Em $2L/v$ a forma volta, mas **de cabeça para baixo**: cada metade sofreu uma reflexão na ponta fixa a mais que a necessária.` },
      { letra: '3', texto: r`$3L/v$`, porque: r`Em $3L/v$ as metades se cruzam de novo com sinais opostos: a corda fica reta outra vez.` },
      { letra: '4', texto: r`$4L/v$`, correta: true, porque: r`Certa: cada metade passou duas vezes pela ponta fixa (duas inversões se desfazem) e chega de volta ao meio junto com a outra.` },
      { letra: '5', texto: r`$6L/v$`, porque: r`Em $6L/v$ a corda está invertida de novo (é $4L/v + 2L/v$); a primeira volta já ocorreu em $4L/v$.` },
    ],
    graficos: [
      {
        titulo: 'O pulso se divide, reflete e volta (L = 1, v = 1)',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.15, ate: 1.15, rotulo: 'y / A' },
        curvas: [{ expr: PULSO_FIXA_LIVRE, rotulo: 'corda no instante t' }],
        parametros: [{ id: 't', rotulo: 'Tempo t (em L/v)', valor: 0, min: 0, max: 4, passo: 0.01, anima: 0.5 }],
        marcas: [
          { x: 0, rotulo: 'fixa' },
          { x: 1, rotulo: 'livre' },
        ],
        amostras: 800,
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`4: $t = 4L/v$` }],
    resolucao: {
      conceitos: [{ texto: 'Reflexão em ponta fixa (inverte) e em ponta livre (não inverte)' }, { texto: 'Superposição de pulsos' }],
      etapas: [
        {
          titulo: 'Alternativa: seguir as duas metades do pulso',
          texto: r`**O que se pede.** O primeiro instante em que a corda inteira tem de novo a forma inicial: o mesmo triângulo, para cima, em $L/2$, parado.

**O pulso se divide.** Um pulso solto do repouso vira **dois pulsos iguais**, cada um com metade da altura, um andando para a esquerda e outro para a direita, com velocidade $v$. (É o que garante velocidade inicial zero: as duas metades sobrepostas reconstroem o triângulo.)

**As regras de reflexão.**
- Na ponta **fixa** ($x = 0$), o pulso volta **invertido** (a corda presa puxa para o lado oposto).
- Na ponta **livre** ($x = L$), o pulso volta **sem inverter** (o anel sobe junto e devolve o pulso como estava).

**Uma viagem completa.** Para uma metade voltar ao meio andando no mesmo sentido em que saiu, ela tem de bater nas **duas** pontas e retornar: percorre $L/2 + L + L/2 = 2L$, em tempo $2L/v$. Nesse caminho passou **uma** vez pela ponta fixa, então volta **invertida**. As duas metades fazem isso ao mesmo tempo e se reencontram no meio em $t = 2L/v$, ambas invertidas: a corda tem o triângulo **para baixo**. Não é a configuração inicial.

**A segunda viagem.** Mais $2L/v$ e cada metade passa de novo pela ponta fixa: a segunda inversão desfaz a primeira. Em
$$t = \frac{4L}{v}$$
as duas metades se encontram em $L/2$, para cima, e a corda é exatamente a inicial.

**Conferindo.** Aperte "Animar" no gráfico: em $t = 1$ e $t = 3$ a corda fica reta (as metades se cruzam com sinais opostos), em $t = 2$ aparece o triângulo invertido, e só em $t = 4$ o triângulo volta para cima. O mesmo resultado sai dos modos normais: com uma ponta fixa e outra livre, o modo mais baixo tem $\lambda = 4L$, período $4L/v$, e todos os outros modos têm períodos que cabem um número inteiro de vezes nele.

**Resposta.** Opção **4**.`,
        },
      ],
      resultado: r`$t = 4L/v$: opção **4** (em $2L/v$ a corda está invertida).`,
      errosComuns: [r`Responder $2L/v$: a forma reaparece, mas invertida, por causa da reflexão na ponta fixa.`, r`Inverter o pulso também na ponta livre.`],
    },
  },
  {
    id: 'p2-2025-2-q6',
    numero: 'Q6',
    grupo: 'P2 2025/2',
    assunto: 'Onda estacionária',
    titulo: 'A velocidade escondida numa estacionária',
    resumo: 'cos(x/2)·cos(16t): k = 1/2 m⁻¹, ω = 16 rad/s, v = ω/k = 32 m/s.',
    enunciado: r`Uma onda estacionária pode ser vista como a superposição de duas ondas iguais que se propagam em sentidos opostos com a mesma velocidade. Sabendo que uma onda estacionária é dada por $y(x,t) = \cos(x/2)\cos(16t)$, com $x$ e $y$ em metros e $t$ em segundos, qual é a velocidade das ondas que interferem? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: '8 m/s', porque: r`Seria $\omega k = 16 \cdot \frac12$: multiplicou em vez de dividir.` },
      { letra: '2', texto: '16 m/s', porque: r`É o valor de $\omega$ (rad/s), não a velocidade.` },
      { letra: '3', texto: '4 m/s', porque: r`Não sai de nenhuma combinação correta de $k = 1/2$ e $\omega = 16$.` },
      { letra: '4', texto: '2 m/s', porque: r`É $1/k$, o inverso do número de onda, sem o $\omega$.` },
      { letra: '5', texto: '32 m/s', correta: true, porque: r`Certa: $v = \omega/k = 16/(1/2) = 32$ m/s.` },
    ],
    graficos: [
      {
        titulo: 'Duas ondas viajantes (tracejadas) somam a estacionária',
        x: { variavel: 'x', de: 0, ate: 25.2, rotulo: 'x (m)' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y (m)' },
        curvas: [
          { expr: 'cos(x/2)*cos(wt)', rotulo: 'soma: cos(x/2)·cos(16t)' },
          { expr: '0.5*cos(x/2 - wt)', rotulo: 'para a direita', cor: 'pos', tracejada: true },
          { expr: '0.5*cos(x/2 + wt)', rotulo: 'para a esquerda', cor: 'neg', tracejada: true },
        ],
        parametros: [fase('Fase 16t')],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`5: $v = 32$ m/s` }],
    resolucao: {
      conceitos: [{ texto: 'Onda estacionária como soma de duas viajantes' }, { texto: 'Relação v = ω/k' }],
      etapas: [
        {
          titulo: 'Alternativa: ler k e ω e dividir',
          texto: r`**O que se pede.** A velocidade das duas ondas viajantes cuja soma é a onda estacionária dada.

**A identidade que liga as duas visões.** A soma de duas ondas iguais em sentidos opostos é
$$a\cos(kx - \omega t) + a\cos(kx + \omega t) = 2a\cos(kx)\cos(\omega t).$$
O lado direito é uma estacionária: a forma $\cos(kx)$ fica parada e só sua altura oscila com $\cos(\omega t)$. Os **mesmos** $k$ e $\omega$ aparecem dos dois lados.

**Lendo a onda dada.** Comparando $\cos(x/2)\cos(16t)$ com $\cos(kx)\cos(\omega t)$:
$$k = \frac12\ \text{m}^{-1}, \qquad \omega = 16\ \text{rad/s}.$$
As viajantes são $\frac12\cos(x/2 \mp 16t)$.

**A velocidade.** Uma onda $\cos(kx - \omega t)$ anda com velocidade $v = \omega/k$ (é a velocidade com que um ponto de fase constante, como uma crista, se desloca):
$$v = \frac{16}{1/2} = 32\ \text{m/s}.$$

**Conferindo.** Comprimento de onda $\lambda = 2\pi/k = 4\pi \approx 12{,}6$ m, período $\tau = 2\pi/16 \approx 0{,}39$ s, e $\lambda/\tau = 32$ m/s. No gráfico animado, as duas tracejadas andam em sentidos opostos e a soma (cheia) só sobe e desce, com nós fixos em $x = \pi, 3\pi, \dots$

**Resposta.** Opção **5**.`,
        },
      ],
      resultado: r`$k = 1/2$ m⁻¹, $\omega = 16$ rad/s, $v = \omega/k = 32$ m/s: opção **5**.`,
      errosComuns: [r`Multiplicar $\omega$ por $k$ em vez de dividir.`, r`Tomar $\omega$ (16) como se fosse a velocidade.`],
    },
  },
  {
    id: 'p2-2025-2-q7',
    numero: 'Q7',
    grupo: 'P2 2025/2',
    assunto: 'Propriedades do som',
    titulo: 'Qual afirmação sobre o som é falsa',
    resumo: 'Só a II é falsa: num gás ideal, v ∝ √T, então a velocidade do som cresce com a temperatura.',
    enunciado: r`Quais das afirmativas abaixo são **falsas**? (Objetiva, 1 ponto.)

I. O som pode se propagar em sólidos e fluidos.

II. A velocidade do som num gás ideal decresce quando a temperatura aumenta.

III. Numa onda sonora harmônica, quando o deslocamento de uma seção transversal do fluido é máximo, a variação de pressão é nula.

IV. A intensidade de uma onda sonora harmônica aumenta quando a frequência aumenta.

V. Para uma velocidade fixa, quanto menor o período da onda harmônica, menor é o comprimento de onda.`,
    alternativas: [
      { letra: '1', texto: 'Apenas I e III', porque: r`I e III são verdadeiras: o som anda em sólidos, e pressão e deslocamento estão defasados de um quarto de ciclo.` },
      { letra: '2', texto: 'Apenas II', correta: true, porque: r`Certa: num gás ideal, $v = \sqrt{\gamma RT/M}$ cresce com a temperatura; as outras quatro são verdadeiras.` },
      { letra: '3', texto: 'Apenas III e IV', porque: r`III é verdadeira (quadratura) e IV também, mantida a amplitude de deslocamento: $I \propto \omega^2$.` },
      { letra: '4', texto: 'Apenas V', porque: r`V é verdadeira: $\lambda = v\tau$, e com $v$ fixo, $\lambda$ cai junto com $\tau$.` },
      { letra: '5', texto: 'Apenas I, III e IV', porque: r`As três são verdadeiras.` },
      { letra: '6', texto: 'Nenhuma das respostas acima', porque: r`Há uma falsa, a II, e ela está na opção 2.` },
    ],
    graficos: [
      {
        titulo: 'Afirmativa III: deslocamento e pressão em quadratura',
        x: { variavel: 'x', de: 0, ate: 12.6, rotulo: 'x (unid. de 1/k)' },
        y: { de: -1.3, ate: 1.3, rotulo: 'normalizado' },
        curvas: [
          { expr: 'cos(x - wt)', rotulo: 'deslocamento s' },
          { expr: 'sin(x - wt)', rotulo: 'variação de pressão Δp', cor: 'neg', tracejada: true },
        ],
        parametros: [fase()],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`2: apenas a II é falsa` }],
    resolucao: {
      conceitos: [{ texto: 'Velocidade do som num gás ideal' }, { texto: 'Onda sonora: deslocamento e pressão' }, { texto: 'Intensidade de uma onda harmônica' }],
      etapas: [
        {
          titulo: 'Alternativa: julgar as cinco afirmativas',
          texto: r`**O que se pede.** Descobrir quais afirmativas são falsas e achar a opção que lista exatamente essas.

**I. Verdadeira.** O som é uma onda mecânica: precisa só de um meio que se comprima e volte, e isso inclui sólidos, líquidos e gases. Encostando o ouvido numa mesa e batendo na outra ponta, ouve-se o som pela madeira.

**II. Falsa.** Num gás ideal, a velocidade do som é
$$v = \sqrt{\frac{\gamma RT}{M}},$$
com $T$ a temperatura absoluta e $M$ a massa molar. Ela **cresce** com a temperatura (proporcional a $\sqrt T$): no ar quente o som é mais rápido. A afirmativa diz o contrário.

**III. Verdadeira.** A variação de pressão é proporcional a menos a derivada do deslocamento em relação a $x$: $\Delta p = -B\,\partial s/\partial x$. Se $s = s_0\cos(kx - \omega t)$, então $\Delta p = Bks_0\,\text{sen}(kx - \omega t)$. Onde o cosseno é máximo, o seno é zero: quando o deslocamento é máximo, a pressão não varia (as camadas vizinhas se deslocam juntas, sem se apertar). Veja no gráfico: as duas curvas estão defasadas de um quarto de onda.

**IV. Verdadeira (com a amplitude de deslocamento fixa).** A intensidade de uma onda harmônica é $I = \frac12\rho v\,\omega^2 s_0^2$: para a mesma amplitude, cresce com o quadrado da frequência.

**V. Verdadeira.** Em um período a onda anda um comprimento de onda: $\lambda = v\tau$. Com $v$ fixo, período menor dá comprimento de onda menor.

**Resposta.** Só a II é falsa: opção **2**.`,
        },
      ],
      resultado: r`Só a II é falsa (a velocidade do som cresce com $\sqrt T$): opção **2**.`,
      errosComuns: [r`Achar que a pressão é máxima onde o deslocamento é máximo: elas estão em quadratura.`, r`Confundir "temperatura maior" com "ar mais denso, som mais lento": no gás ideal, o que importa é $\sqrt{T}$.`],
    },
  },
  {
    id: 'p2-2025-2-d',
    numero: 'Q8',
    grupo: 'P2 2025/2',
    assunto: 'Oscilador amortecido',
    titulo: 'Decremento logarítmico',
    resumo: 'ω = √(ω₀² − γ²/4); δ = γτ/2; metade em três períodos dá δ = (ln 2)/3 ≈ 0,23.',
    enunciado: r`Um oscilador amortecido obedece à equação de movimento $\ddot x + \gamma\dot x + \omega_0^2 x = 0$. (Questão discursiva, 3 pontos.)

(a) (1,2 ponto) Mostre que, no regime subcrítico, a solução geral é $x(t) = A\,e^{-\gamma t/2}\cos(\omega t + \varphi)$, e escreva a frequência angular $\omega$ em termos de $\omega_0$ e $\gamma$. As constantes $A$ e $\varphi$ são a amplitude inicial e a constante de fase.

(b) (1,0 ponto) Com amortecimento fraco ($\gamma \ll \omega_0$), define-se a razão $R$ entre dois máximos consecutivos do deslocamento (o menor dividido pelo anterior). O número $\delta = |\ln R|$ é o **decremento logarítmico**. Relacione $\delta$ com $\gamma$ e com o período $\tau$ do oscilador.

(c) (0,8 ponto) Obtenha $\delta$ quando, passados três períodos, a amplitude cai à metade do valor inicial. Use $\ln 2 \approx 0{,}69$.`,
    graficos: [
      {
        titulo: 'Amplitude caindo à metade em três períodos (τ = 1 s)',
        x: { variavel: 't', de: 0, ate: 6, rotulo: 't (s)' },
        y: { de: -1.1, ate: 1.1, rotulo: 'x / A' },
        curvas: [
          { expr: 'exp(-g*t/2)*cos(2*pi*t)', rotulo: 'x(t)' },
          { expr: 'exp(-g*t/2)', rotulo: 'envoltória A·e^(−γt/2)', cor: 'mute', tracejada: true },
          { expr: '0-exp(-g*t/2)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'g', rotulo: 'Constante de amortecimento γ (o valor do item (c) é 0,46)', valor: 0.46, min: 0.05, max: 1.5, passo: 0.01, unidade: 's⁻¹' }],
        pontos: [{ x: 3, y: 0.5, rotulo: 'metade em t = 3τ' }],
        amostras: 900,
      },
    ],
    respostas: [
      { item: '(a)', texto: r`Substituindo, a equação vale para todo $t$ se $\omega = \sqrt{\omega_0^2 - \gamma^2/4}$.` },
      { item: '(b)', texto: r`$R = e^{-\gamma\tau/2}$, logo $\delta = \dfrac{\gamma\tau}{2}$` },
      { item: '(c)', texto: r`$R^3 = \frac12$: $\delta = \dfrac{\ln 2}{3} \approx 0{,}23$` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Oscilador amortecido: regime subcrítico' }, { texto: 'Decremento logarítmico' }],
      etapas: [
        {
          titulo: '(a) A solução e a frequência angular',
          texto: r`**O que se pede.** Verificar que $x(t) = Ae^{-\gamma t/2}\cos(\omega t + \varphi)$ resolve a equação e descobrir qual $\omega$ faz isso funcionar.

**Caminho 1: derivar e substituir.** Escreva $E = e^{-\gamma t/2}$, $c = \cos(\omega t + \varphi)$ e $s = \text{sen}(\omega t + \varphi)$. Pela regra do produto:
$$\dot x = AE\left[-\omega s - \frac\gamma2 c\right],$$
$$\ddot x = AE\left[\left(\frac{\gamma^2}{4} - \omega^2\right)c + \gamma\omega\,s\right].$$
Somando $\ddot x + \gamma\dot x + \omega_0^2 x$, os termos com $s$ se cancelam ($\gamma\omega s - \gamma\omega s$) e sobra
$$AE\,c\left[\frac{\gamma^2}4 - \omega^2 - \frac{\gamma^2}{2} + \omega_0^2\right] = AE\,c\left[\omega_0^2 - \frac{\gamma^2}{4} - \omega^2\right].$$
Para isso ser zero em **todo** instante, o colchete tem de ser zero:
$$\omega = \sqrt{\omega_0^2 - \frac{\gamma^2}{4}}.$$

**Caminho 2: exponencial complexa.** Tente $z = Ce^{rt}$. A equação vira $r^2 + \gamma r + \omega_0^2 = 0$, com raízes $r = -\frac\gamma2 \pm \sqrt{\frac{\gamma^2}4 - \omega_0^2}$. No regime **subcrítico** ($\gamma < 2\omega_0$) a raiz quadrada é de um número negativo: $r = -\frac\gamma2 \pm i\omega$, com o mesmo $\omega$. A parte real de $Ce^{rt}$ é justamente $Ae^{-\gamma t/2}\cos(\omega t + \varphi)$.

**O significado.** A oscilação é um cosseno cuja amplitude decai como $e^{-\gamma t/2}$, e a frequência é um pouco **menor** que a natural $\omega_0$.`,
        },
        {
          titulo: '(b) Decremento logarítmico',
          texto: r`**O que se pede.** Como a razão entre dois máximos seguidos depende de $\gamma$ e do período.

**Onde ficam os máximos.** Com amortecimento fraco, os máximos acontecem praticamente quando o cosseno vale 1, e o cosseno repete a cada período $\tau = 2\pi/\omega$. Se um máximo acontece em $t_1$, o próximo acontece em $t_2 = t_1 + \tau$.

**A razão.** O cosseno vale o mesmo nos dois instantes, então só a exponencial muda:
$$R = \frac{x(t_2)}{x(t_1)} = \frac{e^{-\gamma t_2/2}}{e^{-\gamma t_1/2}} = e^{-\gamma(t_2 - t_1)/2} = e^{-\gamma\tau/2}.$$
Repare que $R$ é o mesmo para **qualquer** par de máximos consecutivos: a amplitude perde sempre a mesma fração a cada ciclo.

**O decremento.** Tirando o logaritmo:
$$\delta = |\ln R| = \frac{\gamma\tau}{2}.$$

**Conferindo.** Sem amortecimento ($\gamma = 0$), $R = 1$ e $\delta = 0$: os máximos não diminuem. Quanto maior $\gamma$ ou mais longo o período, mais a amplitude cai entre dois máximos.`,
        },
        {
          titulo: '(c) Metade em três períodos',
          texto: r`**O que se pede.** O valor de $\delta$ quando a amplitude cai à metade depois de três períodos.

**A ideia.** Pelo item (b), a cada período a amplitude é multiplicada pelo mesmo fator $R$. Em três períodos ela é multiplicada por $R \cdot R \cdot R = R^3$. Olhando quatro máximos seguidos, em $t_1$, $t_1 + \tau$, $t_1 + 2\tau$ e $t_1 + 3\tau$:
$$\frac{x(t_1 + 3\tau)}{x(t_1)} = R^3 = \frac12.$$

**A conta.** Tirando o logaritmo dos dois lados: $3\ln R = \ln\frac12 = -\ln 2$. Então
$$\delta = |\ln R| = \frac{\ln 2}{3} \approx \frac{0{,}69}{3} = 0{,}23.$$

**O mesmo pela exponencial.** $e^{-\gamma(3\tau)/2} = \frac12$ dá $\gamma\tau = \frac23\ln 2$, e com o item (b), $\delta = \frac12\gamma\tau = \frac13\ln 2$.

**Conferindo.** $R = e^{-0{,}23} \approx 0{,}79$: cada máximo é cerca de 79% do anterior, e $0{,}79^3 \approx 0{,}50$. No gráfico, com $\tau = 1$ s isso corresponde a $\gamma = 2\delta \approx 0{,}46$ s⁻¹, e a envoltória passa pelo ponto marcado: metade da amplitude em $t = 3$ s.`,
        },
      ],
      resultado: r`$\omega = \sqrt{\omega_0^2 - \gamma^2/4}$; $\delta = \gamma\tau/2$; $\delta = (\ln 2)/3 \approx 0{,}23$.`,
      errosComuns: [
        r`Esquecer o fator 1/2: a amplitude decai como $e^{-\gamma t/2}$; quem decai como $e^{-\gamma t}$ é a energia.`,
        r`No item (c), dividir por 3 a amplitude ($R = 1/6$) em vez de tirar a raiz cúbica do fator ($R^3 = 1/2$).`,
      ],
    },
  },

  /* ═════════════════════════ P2 2025/1 ═════════════════════════ */
  {
    id: 'p2-2025-1-q1',
    numero: 'Q1',
    grupo: 'P2 2025/1',
    assunto: 'MHS: condições iniciais',
    titulo: 'Período pela velocidade no equilíbrio',
    resumo: 'No equilíbrio a velocidade é a máxima, ωA: ω = v₀/A e T = 2πA/v₀ = 10 s.',
    enunciado: r`Uma massa presa a uma mola executa um movimento harmônico simples. Num certo instante $t_0$ ela passa pela posição de equilíbrio com velocidade $v_0 = 20$ cm/s. A amplitude da oscilação é $A = \dfrac1\pi$ m. Qual é o período? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: '0,3 s', porque: r`Pequeno demais; misturar cm/s com metros leva a valores assim. A conta coerente dá 10 s.` },
      { letra: '2', texto: '2 s', porque: r`É só o numerador, $2\pi A = 2$ m: falta dividir pela velocidade $v_0 = 0{,}2$ m/s.` },
      { letra: '3', texto: r`$\pi$ s`, porque: r`Com $A = 1/\pi$ m, o $\pi$ cancela com o de $2\pi$: o período não tem $\pi$.` },
      { letra: '4', texto: '5 s', porque: r`É metade do certo: seria $\pi A/v_0$, como se o período fosse só meia volta.` },
      { letra: '5', texto: '7 s', porque: r`Não sai de nenhuma conta correta com estes dados.` },
      { letra: '6', texto: '10 s', correta: true, porque: r`Certa: $T = 2\pi A/v_0 = 2\pi(1/\pi)/0{,}2 = 10$ s.` },
    ],
    graficos: [
      {
        titulo: 'x(t) com A = 1/π m e período de 10 s: inclinação de 0,2 m/s no zero',
        x: { variavel: 't', de: 0, ate: 20, rotulo: 't (s)' },
        y: { de: -0.45, ate: 0.45, rotulo: 'x (m)' },
        curvas: [
          { expr: 'sin(2*pi*t/10)/pi', rotulo: 'x(t)' },
          { expr: '0.2*t', rotulo: 'reta de inclinação v₀ = 0,2 m/s', cor: 'mute', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`6: $T = 10$ s` }],
    resolucao: {
      conceitos: [{ texto: 'MHS: velocidade máxima ωA' }],
      etapas: [
        {
          titulo: 'Alternativa: velocidade no equilíbrio é a velocidade máxima',
          texto: r`**O que se pede.** O período $T$ do movimento, sabendo a velocidade no equilíbrio e a amplitude.

**A ideia.** No MHS, $x(t) = A\cos(\omega t + B)$ e $v(t) = -\omega A\,\text{sen}(\omega t + B)$. Quando a massa passa pelo equilíbrio, $x = 0$, o cosseno é zero e o seno vale $\pm1$: a velocidade tem o **maior** valor possível,
$$|v| = \omega A.$$
(Pela energia dá o mesmo: no equilíbrio toda a energia $\frac12kA^2$ é cinética, $\frac12mv_0^2 = \frac12kA^2$, e $k/m = \omega^2$ leva a $v_0 = \omega A$.)

**A frequência angular.** Em unidades do SI, $v_0 = 20$ cm/s $= 0{,}2$ m/s, então
$$\omega = \frac{v_0}{A} = \frac{0{,}2}{1/\pi} = 0{,}2\pi\ \text{rad/s}.$$

**O período.**
$$T = \frac{2\pi}\omega = \frac{2\pi A}{v_0} = \frac{2\pi \cdot (1/\pi)}{0{,}2} = \frac{2}{0{,}2} = 10\ \text{s}.$$

**Conferindo.** No gráfico, a curva tem período de 10 s e, ao cruzar o zero, é tangente à reta de inclinação 0,2 m/s. A amplitude $1/\pi \approx 0{,}32$ m foi escolhida justamente para o $\pi$ cancelar.

**Resposta.** Opção **6**.`,
        },
      ],
      resultado: r`$\omega = v_0/A = 0{,}2\pi$ rad/s e $T = 10$ s: opção **6**.`,
      errosComuns: [r`Usar $v_0 = 20$ (em cm/s) com $A$ em metros.`, r`Achar que a velocidade no equilíbrio é zero: zero é nos extremos.`],
    },
  },
  {
    id: 'p2-2025-1-q2',
    numero: 'Q2',
    grupo: 'P2 2025/1',
    assunto: 'Energia no MHS',
    titulo: 'Cinética sobre potencial com fase π/6',
    resumo: 'K/U = tan²(ωt + φ); em t = 0 com φ = π/6, K/U = 1/3.',
    enunciado: r`Uma massa presa a uma mola executa um MHS descrito por $x(t) = A\cos(\omega t + \varphi)$. Qual é a razão entre a energia cinética e a energia potencial no instante $t = 0$, quando a constante de fase é $\varphi = \pi/6$? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$\frac18$`, porque: r`Não corresponde a nenhuma fase notável: $\tan^2\varphi = 1/8$ não vem de $\pi/6$.` },
      { letra: '2', texto: r`$\frac16$`, porque: r`Confunde a fase $\pi/6$ com a razão: o 6 do ângulo não vai para o resultado.` },
      { letra: '3', texto: r`$\frac13$`, correta: true, porque: r`Certa: $\tan^2(\pi/6) = (1/\sqrt3)^2 = 1/3$.` },
      { letra: '4', texto: r`$\frac12$`, porque: r`Seria $\text{sen}(\pi/6)$, sem elevar ao quadrado nem dividir pelo cosseno.` },
      { letra: '5', texto: '2', porque: r`Não sai da fase $\pi/6$.` },
      { letra: '6', texto: '3', porque: r`É a razão invertida, potencial sobre cinética: $\cot^2(\pi/6) = 3$.` },
    ],
    graficos: [
      {
        titulo: 'K e U em função da fase ωt + φ (E = 1)',
        x: { variavel: 'th', de: 0, ate: 3.15, rotulo: 'fase ωt + φ (rad)' },
        y: { de: 0, ate: 1.1, rotulo: 'energia / E' },
        curvas: [
          { expr: 'cos(th)^2', rotulo: 'potencial U = E cos²' },
          { expr: 'sin(th)^2', rotulo: 'cinética K = E sen²', cor: 'pos' },
        ],
        marcas: [{ x: Math.PI / 6, rotulo: 'π/6: K = 1/4, U = 3/4' }],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`3: $K/U = \frac13$` }],
    resolucao: {
      conceitos: [{ texto: 'Energia cinética e potencial no MHS' }],
      etapas: [
        {
          titulo: 'Alternativa: escrever K e U em função do tempo',
          texto: r`**O que se pede.** A razão $K/U$ no instante $t = 0$.

**A energia potencial.** A mola guarda $U = \frac12kx^2$. Com $x = A\cos(\omega t + \varphi)$ e $k = m\omega^2$:
$$U(t) = \frac12 m\omega^2A^2\cos^2(\omega t + \varphi).$$

**A energia cinética.** A velocidade é $\dot x = -\omega A\,\text{sen}(\omega t + \varphi)$, então
$$K(t) = \frac12 m\dot x^2 = \frac12 m\omega^2A^2\,\text{sen}^2(\omega t + \varphi).$$
O fator $\frac12m\omega^2A^2$ é a energia total $E$, a mesma nos dois: só o seno e o cosseno dividem a energia entre as duas formas.

**A razão.** O fator comum cancela:
$$\frac KU = \frac{\text{sen}^2(\omega t + \varphi)}{\cos^2(\omega t + \varphi)} = \tan^2(\omega t + \varphi).$$
Em $t = 0$, com $\varphi = \pi/6$:
$$\frac KU = \frac{\text{sen}^2(\pi/6)}{\cos^2(\pi/6)} = \frac{1/4}{3/4} = \frac13.$$

**Conferindo.** Em $t = 0$ a massa está em $x = A\cos(\pi/6) \approx 0{,}87A$, perto do extremo: faz sentido que a maior parte da energia (3/4) esteja na mola. No gráfico, na marca $\pi/6$ a curva da potencial está em 0,75 e a da cinética em 0,25.

**Resposta.** Opção **3**.`,
        },
      ],
      resultado: r`$K/U = \tan^2(\pi/6) = 1/3$: opção **3**.`,
      errosComuns: [r`Inverter a razão e marcar 3.`, r`Usar $\text{sen}(\pi/6) = 1/2$ sem elevar ao quadrado.`],
    },
  },
  {
    id: 'p2-2025-1-q3',
    numero: 'Q3',
    grupo: 'P2 2025/1',
    assunto: 'Pêndulo simples',
    titulo: 'Pêndulo com obstáculo',
    resumo: 'Meio período com d e meio com d/2; o pêndulo equivalente tem d′ = (3 + 2√2)d/8.',
    enunciado: r`Um pêndulo simples, com fio de massa desprezível e comprimento $d$, faz pequenas oscilações sem atrito nem resistência do ar. Há um obstáculo vertical: um bloco preso ao teto, ao lado do ponto de suspensão, com altura $d/2$. Quando o pêndulo vai para um lado, oscila livre com o fio inteiro; quando vai para o outro, o fio encosta na quina inferior do bloco e só a metade de baixo do fio (comprimento $d/2$) continua balançando.

Se o obstáculo fosse removido, que comprimento o fio deveria ter para que o pêndulo (agora sem obstrução) tivesse o **mesmo período** do pêndulo com obstáculo? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$(3 - 2\sqrt2)\,d/8$`, porque: r`O sinal está trocado: $(1 + 1/\sqrt2)^2$ tem todos os termos positivos.` },
      { letra: '2', texto: r`$(3 + 2\sqrt2)\,d/8$`, correta: true, porque: r`Certa: $\sqrt{d'} = \frac12(\sqrt d + \sqrt{d/2})$, e elevando ao quadrado sai $(3 + 2\sqrt2)d/8$.` },
      { letra: '3', texto: r`$(3 + 2\sqrt3)\,d/8$`, porque: r`O $\sqrt3$ não aparece: as metades do período envolvem $\sqrt d$ e $\sqrt{d/2}$.` },
      { letra: '4', texto: r`$(3 - 3\sqrt2)\,d/8$`, porque: r`Daria comprimento negativo.` },
      { letra: '5', texto: r`$(3 + 3\sqrt3)\,d/8$`, porque: r`Maior que $d$, impossível: o período com obstáculo é menor que o do fio inteiro.` },
    ],
    graficos: [
      {
        titulo: 'Posição horizontal do peso: meia oscilação com d, meia com d/2 (g/d = 1)',
        x: { variavel: 't', de: 0, ate: 10.8, rotulo: 't (em √(d/g))' },
        y: { de: -1.2, ate: 1.2, rotulo: 'x / (dθ₁)' },
        curvas: [
          {
            expr: '(t - 5.3646*floor(t/5.3646)) < pi ? sin(t - 5.3646*floor(t/5.3646)) : 0-sin(sqrt(2)*(t - 5.3646*floor(t/5.3646) - pi))/sqrt(2)',
            rotulo: 'com obstáculo',
          },
          { expr: 'sin(2*pi*t/5.3646)', rotulo: 'pêndulo equivalente, mesmo período', cor: 'mute', tracejada: true },
        ],
        marcas: [
          { x: Math.PI, rotulo: 'fio encosta' },
          { x: 5.3646, rotulo: 'um período' },
        ],
        amostras: 900,
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`2: $d' = \dfrac{(3 + 2\sqrt2)\,d}{8} \approx 0{,}73\,d$` }],
    resolucao: {
      conceitos: [{ texto: 'Período do pêndulo simples: T = 2π√(L/g)' }],
      etapas: [
        {
          titulo: 'Alternativa: somar as duas metades do período',
          texto: r`**O que se pede.** O comprimento $d'$ de um pêndulo comum com o mesmo período do pêndulo com obstáculo.

**A ideia.** Uma oscilação completa tem duas metades. De um lado do ponto mais baixo, o fio inteiro balança: essa metade dura **meio período de um pêndulo de comprimento $d$**. Do outro lado, o fio encosta no bloco e quem balança é um pêndulo de comprimento $d/2$, pendurado na quina: essa metade dura **meio período de um pêndulo de comprimento $d/2$**. (Para pequenas oscilações, o período não depende da amplitude, então não importa que as amplitudes angulares dos dois lados sejam diferentes.)

**O período total.** Com $T = 2\pi\sqrt{L/g}$ para cada pêndulo:
$$T = \frac12\cdot 2\pi\sqrt{\frac dg} + \frac12\cdot 2\pi\sqrt{\frac{d/2}g} = \pi\sqrt{\frac dg}\left(1 + \frac1{\sqrt2}\right).$$

**O pêndulo equivalente.** Queremos $2\pi\sqrt{d'/g} = T$:
$$\sqrt{d'} = \frac{\sqrt d}{2}\left(1 + \frac1{\sqrt2}\right) \;\Rightarrow\; d' = \frac d4\left(1 + \frac1{\sqrt2}\right)^2.$$
Expandindo o quadrado: $\left(1 + \frac1{\sqrt2}\right)^2 = 1 + \sqrt2 + \frac12 = \frac{3 + 2\sqrt2}{2}$. Então
$$d' = \frac{(3 + 2\sqrt2)\,d}{8} \approx 0{,}73\,d.$$

**Conferindo.** O resultado fica entre $d/2$ e $d$, como deve: o pêndulo com obstáculo é mais rápido que o de fio inteiro e mais lento que o de meio fio. No gráfico, a curva cheia faz meia volta lenta (fio inteiro) e meia volta rápida (meio fio), e a tracejada, com $d' \approx 0{,}73d$, completa o ciclo no mesmo instante.

**Resposta.** Opção **2**.`,
        },
      ],
      resultado: r`$d' = (3 + 2\sqrt2)\,d/8 \approx 0{,}73\,d$: opção **2**.`,
      errosComuns: [r`Fazer a média dos comprimentos, $3d/4$: o que se soma são os tempos, que vão com a raiz do comprimento.`, r`Somar dois períodos inteiros em vez de duas metades.`],
    },
  },
  {
    id: 'p2-2025-1-q4',
    numero: 'Q4',
    grupo: 'P2 2025/1',
    assunto: 'MHS com atrito estático',
    titulo: 'Bloquinho sobre um bloco oscilante',
    resumo: 'O atrito tem de dar a aceleração máxima ω²A ≤ μₑg, com ω² = k/(M+m): A ≤ μₑ(M+m)g/k.',
    enunciado: r`Um bloco de massa $M$, preso a uma parede por uma mola de constante $k$ (massa desprezível), desliza sem atrito sobre uma mesa de ar horizontal. Sobre ele está um bloquinho de massa $m$; o coeficiente de atrito estático entre os dois é $\mu_e$. Qual é a amplitude máxima de oscilação para que o bloquinho não escorregue? (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$\dfrac{mg}{k}$`, porque: r`Não tem $\mu_e$: o limite depende de quanto o atrito aguenta.` },
      { letra: '2', texto: r`$\dfrac{Mg}{k}$`, porque: r`Também não tem $\mu_e$.` },
      { letra: '3', texto: r`$\dfrac{\mu_e g}{k}$`, porque: r`Dimensionalmente errada: falta uma massa para dar metros.` },
      { letra: '4', texto: r`$\dfrac{\mu_e mg}{k}$`, porque: r`Usa só a massa do bloquinho na frequência; a mola move os dois blocos, $M + m$.` },
      { letra: '5', texto: r`$\dfrac{\mu_e Mg}{k}$`, porque: r`Esquece a massa do bloquinho, que também é acelerada pela mola.` },
      { letra: '6', texto: r`$\dfrac{\mu_e(M + m)g}{k}$`, correta: true, porque: r`Certa: $\omega^2A \le \mu_e g$ com $\omega^2 = k/(M + m)$.` },
    ],
    graficos: [
      {
        titulo: 'Aceleração máxima ω²A contra o que o atrito aguenta (M = 1 kg, m = 0,25 kg, k = 50 N/m)',
        x: { variavel: 'A', de: 0, ate: 0.25, rotulo: 'amplitude A (m)' },
        y: { de: 0, ate: 10, rotulo: 'aceleração (m/s²)' },
        curvas: [
          { expr: '50/1.25*A', rotulo: 'aceleração máxima ω²A' },
          { expr: 'mu*9.8', rotulo: 'limite do atrito μₑg', cor: 'neg', tracejada: true },
        ],
        parametros: [{ id: 'mu', rotulo: 'Coeficiente de atrito estático μₑ', valor: 0.4, min: 0.1, max: 1, passo: 0.01 }],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`6: $A_{\max} = \dfrac{\mu_e(M + m)g}{k}$` }],
    resolucao: {
      conceitos: [{ texto: 'MHS: aceleração máxima ω²A' }, { texto: 'Atrito estático: f ≤ μₑN' }],
      etapas: [
        {
          titulo: 'Alternativa: o atrito tem de acelerar o bloquinho',
          texto: r`**O que se pede.** A maior amplitude com que o conjunto pode oscilar sem o bloquinho deslizar.

**Quem empurra o bloquinho.** A mola está presa só no bloco de baixo. O bloquinho de cima só acompanha o movimento porque o **atrito estático** o puxa junto. Para ele ter a mesma aceleração $a$ do bloco, o atrito tem de valer $f = ma$.

**A frequência do conjunto.** Enquanto não há deslizamento, os dois se movem juntos: a mola acelera a massa total $M + m$. Então
$$\omega^2 = \frac{k}{M + m}.$$

**A aceleração máxima.** No MHS, $a = -\omega^2x$; ela é máxima nos extremos, onde $|x| = A$:
$$|a_{\max}| = \omega^2A.$$

**A condição de não escorregar.** O atrito estático tem um teto: $f \le \mu_eN = \mu_emg$. Nos extremos:
$$m\,\omega^2A \le \mu_emg \;\Rightarrow\; A \le \frac{\mu_eg}{\omega^2} = \frac{\mu_e(M + m)g}{k}.$$
A massa $m$ cancelou na condição, mas reaparece na frequência.

**Conferindo.** Unidades: $\mu_e$ é adimensional, $(M + m)g$ é força em newtons, e newton dividido por N/m dá metros. No gráfico, a reta $\omega^2A$ cruza o limite $\mu_eg$ em $A_{\max}$: com $\mu_e = 0{,}4$, $A_{\max} = 0{,}4 \cdot 1{,}25 \cdot 9{,}8/50 \approx 0{,}098$ m. Aumente $\mu_e$ e o cruzamento anda para a direita.

**Resposta.** Opção **6**.`,
        },
      ],
      resultado: r`$A_{\max} = \mu_e(M + m)g/k$: opção **6**.`,
      errosComuns: [r`Usar $\omega^2 = k/M$, esquecendo que o bloquinho também é acelerado pela mola.`, r`Pensar que o perigo é no equilíbrio (onde a velocidade é máxima): o perigo é nos extremos, onde a aceleração é máxima.`],
    },
  },
  {
    id: 'p2-2025-1-q5',
    numero: 'Q5',
    grupo: 'P2 2025/1',
    assunto: 'Oscilações forçadas',
    titulo: 'Amplitude forçada com γ = ω₀',
    resumo: 'A(ω) ∝ 1/√((ω₀² − ω²)² + γ²ω²); com γ = ω₀, A(ω₀)/A(ω₀/2) = √(13/16).',
    enunciado: r`Um oscilador amortecido e forçado obedece a $\ddot x + \gamma\dot x + \omega_0^2x = f\cos(\omega t)$, com $f$ qualquer. Com $\gamma = \omega_0$ e depois de passados os efeitos transitórios, sejam $A$ e $A'$ as amplitudes de oscilação para $\omega = \omega_0$ e para $\omega = \omega_0/2$, respectivamente. A razão $A/A'$ vale: (Objetiva, 1 ponto.)`,
    alternativas: [
      { letra: '1', texto: r`$\sqrt{11/14}$`, porque: r`Não sai das contas: os números que aparecem são $13/16$ e $1$.` },
      { letra: '2', texto: r`$\sqrt{12/15}$`, porque: r`Idem; $12/15$ não aparece.` },
      { letra: '3', texto: r`$\sqrt{13/16}$`, correta: true, porque: r`Certa: em $\omega_0/2$ o denominador vale $\omega_0^2\sqrt{13/16}$, em $\omega_0$ vale $\omega_0^2$.` },
      { letra: '4', texto: r`$\sqrt{14/11}$`, porque: r`Não sai das contas.` },
      { letra: '5', texto: r`$\sqrt{15/12}$`, porque: r`Não sai das contas.` },
      { letra: '6', texto: r`$\sqrt{16/13}$`, porque: r`É a razão invertida, $A'/A$.` },
    ],
    graficos: [
      {
        titulo: 'Curva de ressonância: amplitude em função da frequência da força',
        x: { variavel: 'u', de: 0, ate: 2, rotulo: 'ω / ω₀' },
        y: { de: 0, ate: 2.2, rotulo: 'A · ω₀² / f' },
        curvas: [{ expr: '1/sqrt((1 - u^2)^2 + (g*u)^2)', rotulo: 'amplitude estacionária' }],
        parametros: [{ id: 'g', rotulo: 'Amortecimento γ/ω₀ (o da questão é 1)', valor: 1, min: 0.3, max: 2, passo: 0.01 }],
        pontos: [
          { x: 0.5, y: 1 / Math.sqrt(13 / 16), rotulo: "A' (ω₀/2)" },
          { x: 1, y: 1, rotulo: 'A (ω₀)' },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`3: $A/A' = \sqrt{13/16}$` }],
    resolucao: {
      conceitos: [{ texto: 'Oscilador forçado: regime estacionário' }, { texto: 'Curva de ressonância' }],
      etapas: [
        {
          titulo: 'Alternativa: a fórmula da amplitude estacionária',
          texto: r`**O que se pede.** Comparar a amplitude quando a força tem a frequência natural com a amplitude quando tem metade dela.

**A amplitude estacionária.** Depois que o transitório morre, o oscilador vibra na frequência da força. Usando a forma complexa, tentamos $z = z_0e^{i\omega t}$ em $\ddot z + \gamma\dot z + \omega_0^2z = fe^{i\omega t}$. Cada derivada traz um fator $i\omega$:
$$(\omega_0^2 - \omega^2 + i\gamma\omega)\,z_0 = f.$$
O módulo de $z_0$ é a amplitude:
$$A(\omega) = \frac{f}{\sqrt{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}}.$$

**Em $\omega = \omega_0$.** O primeiro termo zera e sobra $\gamma^2\omega_0^2 = \omega_0^4$ (porque $\gamma = \omega_0$):
$$A = \frac{f}{\omega_0^2}.$$

**Em $\omega = \omega_0/2$.**
$$(\omega_0^2 - \tfrac14\omega_0^2)^2 + \omega_0^2\cdot\tfrac14\omega_0^2 = \tfrac9{16}\omega_0^4 + \tfrac4{16}\omega_0^4 = \tfrac{13}{16}\omega_0^4,$$
$$A' = \frac{f}{\omega_0^2\sqrt{13/16}}.$$

**A razão.**
$$\frac{A}{A'} = \sqrt{\frac{13}{16}} \approx 0{,}90.$$

**Conferindo.** A razão é **menor que 1**: com amortecimento tão forte ($\gamma = \omega_0$), forçar na frequência natural **não** dá a maior amplitude. No gráfico, com $\gamma/\omega_0 = 1$ a curva quase não tem pico e o ponto em $\omega_0/2$ fica acima do ponto em $\omega_0$. Diminua o amortecimento e o pico de ressonância aparece perto de $\omega_0$.

**Resposta.** Opção **3**.`,
        },
      ],
      resultado: r`$A/A' = \sqrt{13/16}$: opção **3**.`,
      errosComuns: [r`Esquecer o termo $\gamma^2\omega^2$ e achar amplitude infinita em $\omega_0$.`, r`Supor que a amplitude em $\omega_0$ é sempre a maior, e marcar a razão invertida.`],
    },
  },
  {
    id: 'p2-2025-1-q6',
    numero: 'Q6',
    grupo: 'P2 2025/1',
    assunto: 'Superposição: onda estacionária',
    titulo: 'Quando a corda fica toda reta',
    resumo: 'y₁ + y₂ = 2A cos(kx) sen(ωt); a corda inteira zera quando sen(2t) = 0, isto é, t = nπ/2.',
    enunciado: r`Duas ondas harmônicas progressivas numa corda têm os perfis
$$y_1(x,t) = A\,\text{sen}(kx + \omega t), \qquad y_2(x,t) = A\cos\!\left(kx - \omega t + \frac\pi2\right),$$
com $A = 0{,}1$ cm, $k = 1$ rad/m e $\omega = 2$ rad/s. Em que instantes a onda estacionária resultante é nula em **toda** a corda? (Objetiva, 1 ponto; $n$ é inteiro.)`,
    alternativas: [
      { letra: '1', texto: r`$n\pi$`, porque: r`Seria a resposta para $\omega = 1$ rad/s; com $\omega = 2$, a corda zera duas vezes mais vezes.` },
      { letra: '2', texto: r`$n\dfrac\pi2$`, correta: true, porque: r`Certa: $\text{sen}(2t) = 0$ quando $2t = n\pi$.` },
      { letra: '3', texto: r`$n\dfrac{3\pi}2$`, porque: r`Espaçamento três vezes maior que o certo, sem relação com $\omega$.` },
      { letra: '4', texto: r`$n\dfrac\pi2 + \dfrac\pi4$`, porque: r`Nesses instantes $\text{sen}(2t) = \pm1$: a corda está na deformação **máxima**.` },
      { letra: '5', texto: r`$n\dfrac\pi4$`, porque: r`Inclui também os instantes de deformação máxima ($n$ ímpar).` },
    ],
    graficos: [
      {
        titulo: 'As duas ondas e a soma (ωt anda de 0 a 2π)',
        x: { variavel: 'x', de: 0, ate: 12.6, rotulo: 'x (m)' },
        y: { de: -0.25, ate: 0.25, rotulo: 'y (cm)' },
        curvas: [
          { expr: '0.2*cos(x)*sin(wt)', rotulo: 'soma: 2A cos(kx) sen(ωt)' },
          { expr: '0.1*sin(x + wt)', rotulo: 'y₁', cor: 'pos', tracejada: true },
          { expr: '0.1*cos(x - wt + pi/2)', rotulo: 'y₂', cor: 'neg', tracejada: true },
        ],
        parametros: [fase()],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`2: $t = n\dfrac\pi2$ s, $n \in \mathbb Z$` }],
    resolucao: {
      conceitos: [{ texto: 'Superposição de ondas' }, { texto: 'Identidades trigonométricas da soma de senos' }],
      etapas: [
        {
          titulo: 'Alternativa: somar as ondas e ver quando a soma zera',
          texto: r`**O que se pede.** Os instantes em que a corda inteira está reta, isto é, $y(x,t) = 0$ para **todo** $x$.

**Arrumando a segunda onda.** Somar $\pi/2$ ao ângulo de um cosseno troca-o por menos o seno: $\cos(\theta + \pi/2) = -\text{sen}\,\theta$. Com $\theta = kx - \omega t$:
$$y_2 = -A\,\text{sen}(kx - \omega t).$$

**A soma.** Abrindo os senos da soma e da diferença:
$$\text{sen}(kx + \omega t) = \text{sen}\,kx\cos\omega t + \cos kx\,\text{sen}\,\omega t,$$
$$\text{sen}(kx - \omega t) = \text{sen}\,kx\cos\omega t - \cos kx\,\text{sen}\,\omega t.$$
Subtraindo, os termos com $\text{sen}\,kx$ se cancelam:
$$y = y_1 + y_2 = 2A\cos(kx)\,\text{sen}(\omega t).$$
É uma onda estacionária: a forma $\cos(kx)$ fica parada, e sua altura é multiplicada por $\text{sen}(\omega t)$.

**Quando tudo zera.** O fator $\cos(kx)$ depende do ponto e não é zero em todo lugar. Para a corda inteira ficar reta, é o fator do tempo que tem de zerar:
$$\text{sen}(\omega t) = 0 \;\Rightarrow\; \omega t = n\pi \;\Rightarrow\; t = \frac{n\pi}{2}\ \text{s},$$
porque $\omega = 2$ rad/s.

**Conferindo.** Em $t = \pi/4$ s, $\omega t = \pi/2$ e $\text{sen} = 1$: a corda está na deformação máxima, a meio caminho entre dois instantes de corda reta. No gráfico, a curva cheia fica reta quando a fase $\omega t$ passa por $0$, $\pi$ e $2\pi$.

**Resposta.** Opção **2**.`,
        },
      ],
      resultado: r`$y = 2A\cos(kx)\,\text{sen}(\omega t)$, nula em toda a corda para $t = n\pi/2$: opção **2**.`,
      errosComuns: [r`Esquecer de dividir por $\omega = 2$ e marcar $n\pi$.`, r`Igualar $\cos(kx) = 0$: isso dá os nós (pontos), não instantes.`],
    },
  },
  {
    id: 'p2-2025-1-q7',
    numero: 'Q7',
    grupo: 'P2 2025/1',
    assunto: 'Reflexão em ponta fixa',
    titulo: 'O pulso que volta de cabeça para baixo',
    resumo: 'Ponta fixa: o pulso volta invertido e com a ordem trocada (rotação de 180°): opção (c).',
    enunciado: r`Um pulso anda da esquerda para a direita numa corda cuja ponta direita está **presa** a uma haste vertical. Antes de chegar à haste, o pulso tem (da esquerda para a direita) uma **corcova larga para cima** e, logo depois, um **vale pequeno**; a frente do pulso, que chega primeiro à haste, é o vale pequeno. Como fica o pulso depois de refletir? (Objetiva conceitual, 1 ponto. Na prova as seis opções eram desenhos; aqui estão descritas em palavras, e o gráfico desenha cada uma.)`,
    alternativas: [
      { letra: '(a)', texto: 'Corcova larga para cima à esquerda e vale pequeno junto à haste (a mesma forma, voltando)', porque: r`Não houve nem inversão nem troca de ordem: é como se o pulso desse ré.` },
      { letra: '(b)', texto: 'Vale largo à esquerda e pequena corcova junto à haste', porque: r`Inverteu para baixo, mas manteve a ordem: a parte que bateu primeiro deveria voltar na frente (à esquerda).` },
      { letra: '(c)', texto: 'Pequena corcova à esquerda e vale largo junto à haste', correta: true, porque: r`Certa: invertido (cima vira baixo) e com a ordem trocada (o que bateu primeiro sai na frente).` },
      { letra: '(d)', texto: 'Pequeno vale à esquerda e corcova larga para cima junto à haste', porque: r`Trocou a ordem, mas não inverteu: isso é a reflexão numa ponta **livre**.` },
      { letra: '(e)', texto: 'Corcova larga para cima seguida de uma ondulação dupla', porque: r`A reflexão não cria detalhes novos: a forma só é espelhada.` },
      { letra: '(f)', texto: 'Vale largo seguido de uma ondulação dupla', porque: r`Idem: aparece uma ondulação que o pulso original não tinha.` },
    ],
    graficos: [
      {
        titulo: 'A reflexão acontecendo (haste em x = 0)',
        x: { variavel: 'x', de: -6, ate: 0, rotulo: 'x' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y' },
        curvas: [{ expr: `${pulso('x - t')} - ${pulso('-x - t')}`, rotulo: 'corda' }],
        parametros: [{ id: 't', rotulo: 'Tempo', valor: 0, min: 0, max: 7, passo: 0.01, anima: 1.2 }],
        marcas: [{ x: 0, rotulo: 'haste (ponta fixa)' }],
      },
      {
        titulo: 'As opções da prova: escolha uma para ver o desenho (1 = a, …, 6 = f)',
        x: { variavel: 'x', de: -5, ate: 0, rotulo: 'x' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y' },
        curvas: [
          { expr: escolheOpcao, rotulo: 'opção escolhida' },
          { expr: pulso('x'), rotulo: 'pulso antes de bater', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'op', rotulo: 'Opção (1 = a, 2 = b, 3 = c, 4 = d, 5 = e, 6 = f)', valor: 1, min: 1, max: 6, passo: 1 }],
        marcas: [{ x: 0, rotulo: 'haste' }],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`(c): pequena corcova à esquerda e vale largo junto à haste` }],
    resolucao: {
      conceitos: [{ texto: 'Reflexão de pulsos em ponta fixa' }, { texto: 'Método das imagens' }],
      etapas: [
        {
          titulo: 'Alternativa: inverter e trocar a ordem',
          texto: r`**O que se pede.** A forma do pulso depois de refletir na ponta presa.

**Duas mudanças.**
1. **Inversão (cima vira baixo).** A ponta presa não pode se mexer. Quando o pulso chega, a corda puxa a haste para cima, e a haste, pela terceira lei de Newton, puxa a corda para baixo: é isso que gera um pulso de volta com o sinal trocado. A corcova vira vale e o vale vira corcova.
2. **Troca de ordem (frente vira frente).** A parte do pulso que chega **primeiro** à haste é a primeira a voltar, então ela passa a ser a frente do pulso refletido, que agora anda para a esquerda. Antes, a frente era o lado direito (o vale pequeno); depois, a frente é o lado esquerdo.

**Juntando.** O vale pequeno, que bateu primeiro, volta na frente (à esquerda) e invertido: vira uma **pequena corcova à esquerda**. A corcova larga volta atrás (junto à haste) e invertida: vira um **vale largo junto à haste**. Inverter e trocar a ordem ao mesmo tempo equivale a girar o desenho do pulso 180° em torno do ponto de fixação.

**Por que isso é a física certa.** Imagine, além da haste, uma corda fantasma com um pulso "imagem" girado de 180°, vindo do outro lado. A soma do pulso real com a imagem é sempre zero no ponto da haste, que é exatamente a condição de ponta fixa. Quando os dois se cruzam, o que fica na corda real é a imagem: o pulso girado. É o que o primeiro gráfico mostra ao animar.

**Conferindo com as outras opções.** A opção (d) troca a ordem sem inverter, que é o caso de ponta **livre**; a (b) inverte sem trocar a ordem; a (a) não muda nada; a (e) e a (f) inventam uma ondulação.

**Resposta.** Opção **(c)**.`,
        },
      ],
      resultado: r`Pulso invertido e com a ordem trocada (girado de 180°): opção **(c)**.`,
      errosComuns: [r`Só inverter, sem trocar a ordem (opção b).`, r`Trocar a ordem sem inverter: isso vale para ponta livre (opção d).`],
    },
  },
  {
    id: 'p2-2025-1-d',
    numero: 'Q8',
    grupo: 'P2 2025/1',
    assunto: 'Onda harmônica numa corda',
    titulo: 'Lendo uma onda pela fórmula',
    resumo: 'A = 0,75 cm, λ = 5 cm, τ = 0,008 s, f = 125 Hz, v = 6,25 m/s para −x; triplicar μ multiplica a potência por √3.',
    enunciado: r`Uma onda transversal harmônica se propaga numa corda esticada, com perfil
$$y(x,t) = (0{,}75\ \text{cm})\,\text{sen}\!\left[\pi(250\ \text{s}^{-1})\,t + \pi(0{,}4\ \text{cm}^{-1})\,x\right].$$
O eixo $x$ é horizontal, com $x > 0$ à direita da origem. (Questão discursiva, 3 pontos.)

(a) (1,2 ponto) Ache a amplitude, o comprimento de onda, o período, a frequência, a velocidade de propagação e o sentido de propagação.

(b) (1,0 ponto) Desenhe a onda no instante $t = 0{,}001$ s, indicando a amplitude e o comprimento de onda.

(c) (0,8 ponto) Seja $I$ a potência média transportada quando a densidade linear é $\mu$, e $I'$ quando é $\mu' = 3\mu$, mantidas a tensão, a amplitude e a frequência. Escreva $I'$ em função de $I$.`,
    graficos: [
      {
        titulo: 'A onda: comece em t = 0,001 s (item b) e anime para ver o sentido',
        x: { variavel: 'x', de: -2, ate: 12, rotulo: 'x (cm)' },
        y: { de: -1, ate: 1, rotulo: 'y (cm)' },
        curvas: [{ expr: '0.75*sin(pi*250*t + pi*0.4*x)', rotulo: 'y(x, t)' }],
        parametros: [{ id: 't', rotulo: 'Tempo t', valor: 0.001, min: 0, max: 0.008, passo: 0.0001, unidade: 's', anima: 0.002 }],
        marcas: [
          { x: 0.625, rotulo: 'crista' },
          { x: 5.625, rotulo: 'crista seguinte: λ = 5 cm' },
        ],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$A = 0{,}75$ cm; $\lambda = 5$ cm; $\tau = 0{,}008$ s; $f = 125$ Hz; $v = 625$ cm/s $= 6{,}25$ m/s; sentido $-x$ (para a esquerda).` },
      { item: '(b)', texto: r`Senoide $0{,}75\,\text{sen}(\pi/4 + 0{,}4\pi x)$: vale $0{,}53$ cm em $x = 0$, cristas em $x = 0{,}625$ cm, $5{,}625$ cm, …; altura 0,75 cm e distância de 5 cm entre cristas.` },
      { item: '(c)', texto: r`$I' = \sqrt3\,I$` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Onda harmônica: A, k, ω, λ, τ, f e v' }, { texto: 'Potência transportada por uma onda numa corda' }],
      etapas: [
        {
          titulo: '(a) As grandezas da onda',
          texto: r`**O que se pede.** Ler a fórmula e extrair seis coisas.

**O molde.** Uma onda harmônica tem a forma $y = A\,\text{sen}(kx \pm \omega t)$. Comparando com a dada:
$$A = 0{,}75\ \text{cm}, \qquad k = 0{,}4\pi\ \text{cm}^{-1}, \qquad \omega = 250\pi\ \text{s}^{-1}.$$

**Comprimento de onda.** É a distância em que o seno repete, $kx$ variando $2\pi$:
$$\lambda = \frac{2\pi}{k} = \frac{2\pi}{0{,}4\pi} = 5\ \text{cm}.$$

**Período e frequência.** O tempo em que $\omega t$ varia $2\pi$:
$$\tau = \frac{2\pi}{\omega} = \frac{2\pi}{250\pi} = 0{,}008\ \text{s}, \qquad f = \frac1\tau = 125\ \text{Hz}.$$

**Velocidade.** Em um período a onda anda um comprimento de onda:
$$v = \lambda f = 5 \cdot 125 = 625\ \text{cm/s} = 6{,}25\ \text{m/s}.$$

**Sentido.** Siga uma crista, onde o argumento do seno é constante: $0{,}4\pi x + 250\pi t = $ constante. Se $t$ cresce, $x$ tem de **diminuir** para compensar. A onda anda para $-x$, **da direita para a esquerda**. Regra prática: sinais iguais em $kx$ e $\omega t$ significam sentido negativo; sinais opostos, sentido positivo.`,
        },
        {
          titulo: '(b) O desenho em t = 0,001 s',
          texto: r`**O que se pede.** O formato da corda num instante fixo, com amplitude e comprimento de onda marcados.

**A fórmula no instante.** Com $t = 0{,}001$ s, o termo do tempo vale $250\pi \cdot 0{,}001 = \pi/4$:
$$y(x) = 0{,}75\,\text{sen}\!\left(\frac\pi4 + 0{,}4\pi x\right)\ \text{cm}.$$
É uma senoide comum, só que **deslocada para a esquerda** em relação a $\text{sen}(0{,}4\pi x)$: a fase positiva $\pi/4$ adianta a curva.

**Pontos para desenhar.**
- Em $x = 0$: $y = 0{,}75\,\text{sen}(\pi/4) \approx 0{,}53$ cm, subindo.
- Primeira crista quando o argumento vale $\pi/2$: $0{,}4\pi x = \pi/4$, então $x = 0{,}625$ cm.
- Próxima crista $5$ cm depois, em $x = 5{,}625$ cm; os zeros e vales ficam a cada quarto de onda (1,25 cm).

**O que marcar.** A **amplitude** é a altura de uma crista medida a partir do eixo (0,75 cm), não a distância de crista a vale. O **comprimento de onda** é a distância horizontal entre duas cristas seguidas (5 cm).

**Conferindo.** O gráfico interativo começa exatamente em $t = 0{,}001$ s, com as marcas nas duas cristas. Animando, as cristas andam para a esquerda, confirmando o item (a).`,
        },
        {
          titulo: '(c) Potência com a densidade triplicada',
          texto: r`**O que se pede.** Como muda a potência média quando a corda fica três vezes mais pesada por metro, com mesma tensão, amplitude e frequência.

**A potência média.** A energia por unidade de comprimento de uma onda harmônica numa corda é $\frac12\mu\omega^2A^2$ (em média), e ela viaja com velocidade $v$. A potência é energia por comprimento vezes velocidade:
$$I = \frac12\mu\omega^2A^2\,v.$$
Como $v = \sqrt{T/\mu}$, fica $\mu v = \mu\sqrt{T/\mu} = \sqrt{T\mu}$:
$$I = \frac12\sqrt{T\mu}\,\omega^2A^2.$$

**Triplicando $\mu$.** Tensão, $\omega$ e $A$ ficam iguais, e só $\sqrt\mu$ muda:
$$I' = \frac12\sqrt{T\cdot 3\mu}\,\omega^2A^2 = \sqrt3\,I.$$

**Por que não triplica.** A corda mais pesada carrega três vezes mais energia por metro, mas a onda fica mais lenta: $v' = v/\sqrt3$. Os dois efeitos juntos dão $3/\sqrt3 = \sqrt3$.

**Conferindo.** $\sqrt3 \approx 1{,}73$: a potência aumenta cerca de 73%.`,
        },
      ],
      resultado: r`$A = 0{,}75$ cm, $\lambda = 5$ cm, $\tau = 0{,}008$ s, $f = 125$ Hz, $v = 6{,}25$ m/s para a esquerda; em $t = 0{,}001$ s a senoide está adiantada de $\pi/4$; $I' = \sqrt3\,I$.`,
      errosComuns: [
        r`Dizer que a onda anda para $+x$: com sinais iguais em $kx$ e $\omega t$, ela anda para $-x$.`,
        r`Ler $\lambda = 0{,}4$ cm ou $f = 250$ Hz direto da fórmula, esquecendo os fatores $2\pi$ e $\pi$.`,
        r`Achar que a potência triplica junto com $\mu$: ela vai com $\sqrt\mu$.`,
      ],
    },
  },

  /* ═════════════════════════ P2 2024/2 ═════════════════════════ */
  {
    id: 'p2-2024-2-q1',
    numero: 'Q1',
    grupo: 'P2 2024/2',
    assunto: 'Reflexão em pontas fixa e livre',
    titulo: 'O pulso retangular de volta, invertido',
    resumo: 'Livre não inverte, fixa inverte: invertido no meio e andando para a esquerda só depois de 3L de caminho, t = 3L/v.',
    enunciado: r`Uma corda esticada tem comprimento $L$; a ponta **esquerda está presa** e a ponta **direita está livre**. Em $t = 0$, um pulso retangular **para cima**, centrado no ponto médio da corda, anda **para a direita** com velocidade $v$. Qual é o menor intervalo de tempo $t$ depois do qual o pulso aparece de novo no meio da corda, **invertido (para baixo)** e andando **para a esquerda**? (Objetiva, versão A, questão 1. Na prova, as duas situações eram desenhos; o gráfico desta página reproduz a corda.)`,
    alternativas: [
      { letra: '(A)', texto: r`$L/v$`, porque: r`Em $L/v$ o pulso volta ao meio andando para a esquerda, mas **para cima**: a ponta livre não inverte.` },
      { letra: '(B)', texto: r`$\frac32 L/v$`, porque: r`Em $\frac32L/v$ o pulso está chegando à ponta fixa ($x = 0$), não no meio.` },
      { letra: '(C)', texto: r`$2L/v$`, porque: r`Em $2L/v$ ele está no meio e invertido, mas andando para a **direita**, logo depois de refletir na ponta fixa.` },
      { letra: '(D)', texto: r`$\frac52 L/v$`, porque: r`Em $\frac52L/v$ o pulso invertido está chegando à ponta livre ($x = L$).` },
      { letra: '(E)', texto: r`$3L/v$`, correta: true, porque: r`Certa: caminho $\frac L2 + L + L + \frac L2 = 3L$, com uma reflexão na ponta fixa (inverte) e duas na livre (não invertem).` },
    ],
    graficos: [
      {
        titulo: 'O pulso indo e voltando (L = 1, v = 1): pare em t = 3',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.3, ate: 1.3, rotulo: 'y' },
        curvas: [
          { expr: PULSO_RETANGULAR, rotulo: 'corda no instante t' },
          { expr: '(abs(x - 0.5) < 0.1 ? -1 : 0)', rotulo: 'a forma procurada (invertida, no meio)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 't', rotulo: 'Tempo t (em L/v)', valor: 0, min: 0, max: 4, passo: 0.01, anima: 0.5 }],
        marcas: [
          { x: 0, rotulo: 'fixa' },
          { x: 1, rotulo: 'livre' },
        ],
        amostras: 1000,
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`(E): $t = 3L/v$` }],
    resolucao: {
      conceitos: [{ texto: 'Reflexão em ponta fixa (inverte) e em ponta livre (não inverte)' }],
      etapas: [
        {
          titulo: 'Alternativa: contar o caminho e as inversões',
          texto: r`**O que se pede.** O primeiro instante em que o pulso está no meio da corda, **de cabeça para baixo** e andando **para a esquerda**. São três exigências ao mesmo tempo: posição, sinal e sentido.

**As regras.**
- Na ponta **livre** (direita), o pulso volta **sem inverter**.
- Na ponta **fixa** (esquerda), o pulso volta **invertido**.
- Entre as pontas ele anda com velocidade constante $v$, então o tempo é o caminho dividido por $v$.

**Seguindo o pulso.**
1. Anda $\frac L2$ até a ponta livre e volta **para cima**, agora para a esquerda. Em $t = L/v$ ele passa pelo meio: para cima e para a esquerda. Falta a inversão.
2. Anda mais $L$, desde a ponta livre até a fixa ($t = \frac32L/v$), e volta **invertido**, para a direita. Em $t = 2L/v$ passa pelo meio: invertido, mas para a direita. Falta o sentido.
3. Anda mais $L$ até a ponta livre ($t = \frac52L/v$) e volta ainda **invertido** (a livre não inverte de novo), para a esquerda.
4. Anda mais $\frac L2$ e chega ao meio: invertido e para a esquerda. É a forma pedida.

**O tempo.** O caminho total é
$$\Delta s = \frac L2 + L + L + \frac L2 = 3L \;\Rightarrow\; t = \frac{\Delta s}{v} = \frac{3L}{v}.$$

**Conferindo.** No gráfico, aperte "Animar" ou leve o tempo a 1, 2 e 3: em $t = 1$ o pulso está no meio para cima, em $t = 2$ no meio para baixo (andando para a direita) e em $t = 3$ coincide com a forma tracejada, andando para a esquerda.

**Resposta.** Opção **(E)**.`,
        },
      ],
      resultado: r`Caminho $3L$ (uma inversão, na ponta fixa): $t = 3L/v$, opção **(E)**.`,
      errosComuns: [r`Parar em $L/v$: o pulso está no meio e indo para a esquerda, mas ainda para cima.`, r`Parar em $2L/v$: invertido e no meio, mas andando para a direita.`],
    },
  },

  /* ═════════════════════════ Questões avulsas ═════════════════════════ */
  {
    id: 'avulsa-contorno',
    numero: 'Q1',
    grupo: 'Questões avulsas',
    assunto: 'Condições de contorno',
    titulo: 'Qual ponta é livre e qual é fixa',
    resumo: 'Em x = 0 a inclinação é zero (ventre: livre); em x = 0,6 m, cos(3π/2) = 0 (nó: fixa).',
    enunciado: r`Uma corda vai de $x = 0$ a $x = 60$ cm e vibra numa onda estacionária
$$y(x,t) = 6\cos\!\left(\frac{5\pi}{2}x\right)\cos(30\pi t + \varphi),$$
com $x$ em metros e $t$ em segundos.

(c) Determine as condições de contorno em $x = 0$ e em $x = 60$ cm. Identifique qual extremidade é livre e qual é fixa.

(Questão de exercício. A foto trazia só o item (c); a função de onda é a usada na resolução do caderno, e a unidade da amplitude 6 não muda nada neste item.)`,
    graficos: [
      {
        titulo: 'A corda vibrando: ventre em x = 0, nó em x = 0,6 m',
        x: { variavel: 'x', de: 0, ate: 0.6, rotulo: 'x (m)' },
        y: { de: -7.5, ate: 7.5, rotulo: 'y' },
        curvas: [
          { expr: '6*cos(5*pi*x/2)*cos(wt)', rotulo: 'corda no instante' },
          { expr: '6*cos(5*pi*x/2)', rotulo: 'envoltória', cor: 'mute', tracejada: true },
          { expr: '0-6*cos(5*pi*x/2)', cor: 'mute', tracejada: true },
        ],
        parametros: [fase('Fase 30πt + φ')],
        marcas: [
          { x: 0, rotulo: 'ventre: ponta livre' },
          { x: 0.6, rotulo: 'nó: ponta fixa' },
        ],
      },
    ],
    respostas: [
      {
        item: '(c)',
        texto: r`Em $x = 0$: $\dfrac{\partial y}{\partial x}(0,t) = 0$ (ventre), ponta **livre**. Em $x = 0{,}6$ m: $y(0{,}6;t) = 6\cos(3\pi/2)\cos(30\pi t + \varphi) = 0$ (nó), ponta **fixa**.`,
      },
    ],
    resolucao: {
      conceitos: [{ texto: 'Ondas estacionárias e condições de contorno' }],
      etapas: [
        {
          titulo: '(c) As condições em cada ponta',
          texto: r`**O que se pede.** Testar o que acontece com a corda em cada extremidade e dizer qual ponta está presa e qual está solta.

**As duas condições possíveis.**
- **Ponta fixa** (presa): a corda não se mexe ali em nenhum instante. Condição: $y(x_{\text{ponta}}, t) = 0$ para todo $t$. A ponta é um **nó**.
- **Ponta livre** (um anel sem massa e sem atrito): a corda chega sempre horizontal, sem inclinação, porque um anel sem massa não aguentaria uma força vertical. Condição: $\dfrac{\partial y}{\partial x}(x_{\text{ponta}}, t) = 0$ para todo $t$. A ponta é um **ventre**.

Dica: o fator que depende de $x$ decide as condições de contorno; o fator que depende de $t$ (com a fase $\varphi$) só entra nas condições iniciais.

**Em $x = 0$.** O deslocamento é $y(0,t) = 6\cos(0)\cos(30\pi t + \varphi) = 6\cos(30\pi t + \varphi)$, que **não** é zero sempre: essa ponta se mexe, então não é fixa. A inclinação é
$$\frac{\partial y}{\partial x} = -6\cdot\frac{5\pi}{2}\,\text{sen}\!\left(\frac{5\pi}{2}x\right)\cos(30\pi t + \varphi),$$
e em $x = 0$ o seno vale zero: $\dfrac{\partial y}{\partial x}(0,t) = 0$ em todo instante. É um ventre: **ponta livre**.

**Em $x = 60$ cm $= 0{,}6$ m.** O ângulo vale $\frac{5\pi}{2}\cdot 0{,}6 = \frac{3\pi}{2}$, e $\cos\frac{3\pi}2 = 0$:
$$y(0{,}6;\,t) = 6\cos\!\left(\frac{3\pi}{2}\right)\cos(30\pi t + \varphi) = 0$$
em todo instante. É um nó: **ponta fixa**.

**Conferindo.** O número de onda $k = 5\pi/2$ rad/m dá $\lambda = 2\pi/k = 0{,}8$ m. A corda de 0,6 m tem então $\frac34\lambda$: três quartos de onda, do ventre da ponta livre ao nó da ponta fixa, que é um modo permitido para uma corda livre numa ponta e fixa na outra. A frequência é $30\pi/2\pi = 15$ Hz. No gráfico, a ponta da esquerda sobe e desce com a maior amplitude, e a da direita nunca sai do lugar.`,
        },
      ],
      resultado: r`$x = 0$: $\partial y/\partial x = 0$, ventre, ponta livre; $x = 0{,}6$ m: $y = 0$, nó, ponta fixa.`,
      errosComuns: [
        r`Usar $x = 60$ (em cm) com $k$ em rad/m: o ângulo certo é $\frac{5\pi}{2}\cdot 0{,}6 = \frac{3\pi}{2}$.`,
        r`Testar só $y = 0$ em $x = 0$ e concluir "não é nada": a ponta livre se reconhece pela inclinação nula.`,
      ],
    },
  },
]

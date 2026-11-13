import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P2 } from '../formularios'

const r = String.raw

/* Exercício 2: maquete 1:100 000 da nuvem (raio 1 km, altura 3 km), com a mesma densidade de carga. */
const ESC2 = 1e-5
const AREAL = 'pi*Rn^2'

/* Exercício 5: as três etapas. */
const C5 = (dist: string) => `eps0*lado^2/(${dist})`

export const lista_04: ProvaInput = {
  id: 'lista-04',
  titulo: 'Lista 4 · Capacitores',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  formulario: FORMULARIO_P2,
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Médio',
      titulo: 'Capacitor cilíndrico',
      resumo: 'E = λ/2πε₀r entre os condutores e zero fora; C/L = 2πε₀/ln(b/a).',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.328] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [4, -5, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade linear de carga', simbolo: r`\lambda`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.005, max: 0.015, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.025, max: 0.05, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.002, max: 0.055, passo: 0.001 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitorRadial', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', a: 'a', b: 'b', comprimento: 1, Q: 'lam', ligado: 0, rotulo: 'capacitor cilíndrico' },
        { id: 'raio', tipo: 'caminho', pontos: [['a', 0, 0], ['b', 0, 0]], rotulo: 'de a até b' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 'r' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo elétrico em r', simbolo: r`E(r)`, expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's > a && s < b ? lam/(2*pi*eps0*s) : 0' },
        { rotulo: 'V(a) − V(b) (integral de E de a até b)', simbolo: r`\frac{\lambda}{2\pi\varepsilon_0}\ln\frac ba`, expr: "intE('raio')", unidade: 'V', teoria: 'lam/(2*pi*eps0)*ln(b/a)' },
        { rotulo: 'Capacitância por comprimento (λ / ΔV)', simbolo: r`\frac CL = \frac{2\pi\varepsilon_0}{\ln(b/a)}`, expr: "1e12*lam/intE('raio')", unidade: 'pF/m', teoria: '1e12*2*pi*eps0/ln(b/a)' },
      ],
      graficos: [
        {
          titulo: 'Campo elétrico E(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.002, ate: 0.055, rotulo: 'r', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'E', expr: 'mag(E(rr, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Gauss',
          texto: r`Gaussiana cilíndrica de raio $r$ e comprimento $l$: $E\cdot2\pi rl = q_\text{int}/\varepsilon_0$. Dentro do condutor maciço, $E = 0$. Entre os condutores, $q_\text{int} = \lambda l$ e $E = \dfrac{\lambda}{2\pi\varepsilon_0 r}$. Fora da casca, $q_\text{int} = 0$ e $E = 0$. Arraste a sonda pelas três regiões.`,
          parametros: { s: 0.02 },
          medidas: [0],
        },
        {
          titulo: '(b) Diferença de potencial',
          texto: r`$$V(a) - V(b) = \int_a^b\frac{\lambda}{2\pi\varepsilon_0r}dr = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac ba.$$`,
          medidas: [1],
        },
        { titulo: '(c) Capacitância', texto: r`$C = \dfrac{\lambda L}{\Delta V}$, então $\dfrac CL = \dfrac{2\pi\varepsilon_0}{\ln(b/a)}$.`, medidas: [2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$E = 0$ para $r < a$ e $r > b$; $\vec E = \dfrac{\lambda}{2\pi\varepsilon_0r}\hat r$ entre eles.` },
        { item: '(b)', texto: r`$V(a) - V(b) = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac ba$` },
        { item: '(c)', texto: r`$\dfrac CL = \dfrac{2\pi\varepsilon_0}{\ln(b/a)}$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' },
          { texto: 'Capacitância de geometrias simples', lab: 'capacitor' },
        ],
        etapas: [
          {
            titulo: '(a) O campo em todo o espaço',
            texto: r`**O que se pede.** Pela lei de Gauss, o campo do capacitor cilíndrico: um cilindro condutor maciço de raio $a$ com $+\lambda$ por comprimento, dentro de uma casca fina coaxial de raio $b$ com $-\lambda$.

**A ideia.** Tudo é infinito e igual em volta do eixo: o campo é **radial** e só depende da distância $r$ ao eixo. Gaussiana: cilindro coaxial de raio $r$ e comprimento $l$. Fluxo na lateral: $E\cdot2\pi rl$; nas tampas, zero (o campo é paralelo a elas). Lei de Gauss (formulário): $E\cdot2\pi rl = \dfrac{Q_\text{int}}{\varepsilon_0}$.

**Região por região.**
- **$r < a$, dentro do cilindro maciço:** ele é condutor. Em equilíbrio, o campo no material de um condutor é zero (as cargas livres se rearranjam até isso acontecer), e a carga $+\lambda$ fica na superfície. $E = 0$.
- **$a < r < b$, entre os condutores:** dentro da gaussiana está só o cilindro, $Q_\text{int} = \lambda l$:
$$\vec E = \frac{\lambda}{2\pi\varepsilon_0r}\,\hat r.$$
- **$r > b$, fora:** dentro estão o cilindro e a casca, $Q_\text{int} = \lambda l - \lambda l = 0$. $E = 0$.

**Repare.** Todo o campo fica **entre** os condutores. É isso que faz do arranjo um capacitor.`,
            passo: 0,
          },
          {
            titulo: '(b) A diferença de potencial',
            texto: r`**O que se pede.** A diferença de potencial entre a superfície do cilindro ($r = a$) e a casca ($r = b$).

**A ideia.** O potencial sai do campo por integração (é o inverso de $\vec E = -\vec\nabla V$, do formulário):
$$V(a) - V(b) = \int_a^b\vec E\cdot d\vec r.$$
O campo aponta de dentro para fora, do positivo para o negativo, então o cilindro de dentro está no potencial mais alto.

**A conta.** Com o campo do item (a), que é o único que existe entre $a$ e $b$:
$$V(a) - V(b) = \int_a^b\frac{\lambda}{2\pi\varepsilon_0r}\,dr = \frac{\lambda}{2\pi\varepsilon_0}\Big[\ln r\Big]_a^b = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac ba.$$

**Conferindo.** Positivo, porque $b > a$. Se as duas superfícies se aproximam ($b \to a$), $\ln(b/a) \to 0$ e a diferença de potencial some.`,
            passo: 1,
          },
          {
            titulo: '(c) A capacitância por comprimento',
            texto: r`**O que se pede.** A capacitância por unidade de comprimento.

**A ideia.** Capacitância é carga por diferença de potencial (formulário):
$$C = \frac{Q}{V}.$$
Num trecho de comprimento $L$, a carga do cilindro é $Q = \lambda L$, e a diferença de potencial é a do item (b).

**A conta.**
$$C = \frac{\lambda L}{\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac ba}\quad\Rightarrow\quad\frac CL = \frac{2\pi\varepsilon_0}{\ln(b/a)}.$$

**Conferindo.** O $\lambda$ cancelou: a capacitância só depende da **geometria** (os raios), como deve ser. Quanto mais próximos os raios, menor o $\ln(b/a)$ e maior a capacitância, como num capacitor de placas com distância pequena. É assim que se calcula a capacitância de um cabo coaxial.`,
            passo: 2,
          },
        ],
        resultado: r`$C/L = 2\pi\varepsilon_0/\ln(b/a)$.`,
        errosComuns: ['Esquecer que o campo fora da casca é zero: a carga total dentro é nula.'],
        oficial: { resposta: 'E = 0 dentro do cilindro e fora da casca, E = λ/(2πε₀r) r̂ entre eles; V(a) − V(b) = (λ/2πε₀) ln(b/a); C/L = 2πε₀/ln(b/a).' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Nuvem e solo como capacitor',
      resumo: 'C ≈ 9,3 nF, ΔV ≈ 2,2×10⁹ V, E ≈ 7,2×10⁵ V/m (24% da rigidez do ar), U ≈ 2,2×10¹⁰ J.',
      figura: { pagina: 1, recorte: [0.089, 0.329, 0.936, 0.534] },
      cena: { escala: 0.01, extensao: 4, unidade: 'cm', camera: { pos: [5, 2, 7], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qn', rotulo: 'Carga da nuvem', simbolo: 'Q', valor: 20, unidade: 'C', min: 5, max: 40, passo: 1 },
        { id: 'Rn', rotulo: 'Raio do centro de carga', simbolo: 'R', valor: 1000, unidade: 'm', min: 500, max: 2000, passo: 50 },
        { id: 'h', rotulo: 'Altura da nuvem', simbolo: 'h', valor: 3000, unidade: 'm', min: 1000, max: 5000, passo: 100 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          centro: [0, 0, 0],
          eixo: 'y',
          circular: true,
          lado: `2*Rn*${ESC2}`,
          d: `h*${ESC2}`,
          Q: `Qn*pi*(Rn*${ESC2})^2/(${AREAL})`,
          ligado: 0,
          rotulo: 'maquete 1:100 000 (solo +, nuvem −)',
        },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Campo entre nuvem e solo (na maquete, mesma densidade de carga)', simbolo: r`E = \frac{Q}{\varepsilon_0A}`, expr: '1e-6*mag(E(0, 0, 0))', unidade: 'MV/m', teoria: `1e-6*Qn/(eps0*${AREAL})` },
        { rotulo: 'Fração da rigidez dielétrica do ar', simbolo: r`E/E_\text{rup}`, expr: 'mag(E(0, 0, 0))/3e6', unidade: '' },
        { rotulo: 'Capacitância', simbolo: r`C = \frac{\varepsilon_0A}{h}`, expr: `1e9*eps0*${AREAL}/h`, unidade: 'nF' },
        { rotulo: 'Diferença de potencial', simbolo: r`\Delta V = Eh`, expr: '1e-9*mag(E(0, 0, 0))*h', unidade: 'GV' },
        { rotulo: 'Energia armazenada', simbolo: r`U = \frac12Q\,\Delta V`, expr: '1e-10*Qn*mag(E(0, 0, 0))*h/2', unidade: '10¹⁰ J', teoria: `1e-10*Qn^2/(2*eps0*${AREAL}/h)` },
      ],
      passos: [
        { titulo: '(a) Capacitância', texto: r`Placas planas: $C = \dfrac{\varepsilon_0\pi R^2}{h} \approx 9{,}3$ nF.`, medidas: [2] },
        { titulo: '(b) ddp', texto: r`$\Delta V = \dfrac QC \approx 2{,}2\times10^9$ V: mais de 2 bilhões de volts.`, medidas: [3] },
        {
          titulo: '(c) Campo',
          texto: r`$E = \dfrac{\Delta V}{h} = \dfrac{Q}{\varepsilon_0\pi R^2} \approx 7{,}2\times10^5$ V/m, cerca de 24% da rigidez do ar. A cena é uma maquete com a mesma densidade de carga, por isso o campo é o mesmo.`,
          medidas: [0, 1],
        },
        {
          titulo: '(d) Energia',
          texto: r`$U = \dfrac{Q^2}{2C} = \dfrac12Q\,\Delta V \approx 2{,}2\times10^{10}$ J. O modelo é grosseiro: a altura é maior que o raio, e o campo real está longe de uniforme.`,
          medidas: [4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$C \approx 9{,}3$ nF` },
        { item: '(b)', texto: r`$\Delta V \approx 2{,}2\times10^9$ V` },
        { item: '(c)', texto: r`$E \approx 7{,}2\times10^5$ V/m, cerca de 24% da rigidez do ar` },
        { item: '(d)', texto: r`$U \approx 2{,}2\times10^{10}$ J` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitor de placas paralelas', lab: 'capacitor' }],
        etapas: [
          {
            titulo: '(a) A capacitância nuvem-solo',
            texto: r`**O que se pede.** A capacitância do sistema, tratando o centro de carga da nuvem (um disco de raio $R = 1$ km) e o solo como as duas placas de um capacitor plano, separadas por $h = 3$ km.

**A ideia.** Num capacitor de placas planas e paralelas, de área $A$ e separação $h$, com campo uniforme entre elas:
- o campo entre as placas é $E = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0A}$ (lei de Gauss: cada placa dá $\sigma/2\varepsilon_0$, e entre elas os dois campos se somam);
- a diferença de potencial é $V = Eh$ (campo uniforme);
- então, por $C = Q/V$ (formulário):
$$C = \frac{\varepsilon_0A}{h}.$$
Essa fórmula **não** está no formulário; ela vem desses três passos.

**A conta.** A área é a do disco, $A = \pi R^2 = \pi(10^3)^2 \approx 3{,}14\times10^6$ m²:
$$C = \frac{(8{,}85\times10^{-12})(3{,}14\times10^6)}{3\times10^3} \approx 9{,}3\times10^{-9}\ \text{F} = 9{,}3\ \text{nF}.$$`,
            passo: 0,
          },
          {
            titulo: '(b) A diferença de potencial nuvem-solo',
            texto: r`**O que se pede.** A diferença de potencial entre a nuvem (carga $-20$ C) e o solo.

**A ideia.** Da definição de capacitância (formulário: $C = Q/V$), $V = Q/C$, com $Q$ o módulo da carga de uma das placas.

**A conta.** Com $C$ do item (a):
$$V = \frac{20}{9{,}3\times10^{-9}} \approx 2{,}2\times10^9\ \text{V}.$$
Mais de **dois bilhões de volts**. A nuvem, negativa, está no potencial mais baixo.`,
            passo: 1,
          },
          {
            titulo: '(c) O campo entre nuvem e solo',
            texto: r`**O que se pede.** A intensidade do campo entre a nuvem e o solo, comparada com a rigidez dielétrica do ar, $3\times10^6$ V/m (o campo a partir do qual o ar deixa de isolar e conduz, como num raio).

**A ideia.** Campo uniforme entre as placas: $E = \dfrac Vh$. Ou, direto pela lei de Gauss, $E = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0\pi R^2}$.

**A conta.**
$$E = \frac{2{,}2\times10^9}{3\times10^3} \approx 7{,}2\times10^5\ \text{V/m}.$$

**Comparando.** $\dfrac{7{,}2\times10^5}{3\times10^6} \approx 0{,}24$: cerca de **24%** da rigidez do ar. Pelo modelo, o campo médio não basta para romper o ar. Os raios começam onde o campo é localmente muito mais forte que a média.`,
            passo: 2,
          },
          {
            titulo: '(d) A energia armazenada',
            texto: r`**O que se pede.** A energia potencial elétrica armazenada no sistema.

**A ideia.** A energia de um capacitor carregado é (formulário)
$$U = \frac12QV,$$
que, com $V = Q/C$, também se escreve $U = \dfrac{Q^2}{2C}$.

**A conta.**
$$U = \frac12(20)(2{,}2\times10^9) \approx 2{,}2\times10^{10}\ \text{J}.$$

**Para ter noção.** São uns 22 bilhões de joules, a energia de umas 5 toneladas de TNT.

**Sobre o modelo.** O próprio enunciado avisa que ele é grosseiro: a altura (3 km) é maior que o raio do disco (1 km), e aí o campo está longe de uniforme, porque se espalha muito pelas bordas. Os números servem como ordem de grandeza.`,
            passo: 3,
          },
        ],
        resultado: r`$C \approx 9{,}3$ nF; $\Delta V \approx 2{,}2$ GV; $E \approx 0{,}72$ MV/m; $U \approx 2{,}2\times10^{10}$ J.`,
        errosComuns: ['Usar o diâmetro como raio na área do disco.'],
        oficial: { resposta: 'C = 9,26 nF; ΔV = 2,16×10⁹ V; E = 0,72×10⁶ V/m (24% da rigidez do ar); U = 2,16×10¹⁰ J.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Quatro associações de capacitores iguais',
      resumo: 'C₄ = C/3 < C₂ = 2C/3 < C₃ = 3C/2 < C₁ = 3C.',
      figura: { pagina: 1, recorte: [0.089, 0.535, 0.936, 0.76] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [7, 5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.06, unidade: 'm', min: 0.04, max: 0.08, passo: 0.002 },
        { id: 'd', rotulo: 'Distância entre as placas', simbolo: 'd', valor: 0.01, unidade: 'm', min: 0.005, max: 0.02, passo: 0.001 },
      ],
      objetos: [{ id: 'c', tipo: 'capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'd', Q: '1e-9', ligado: 0, rotulo: 'cada um dos capacitores (C)' }],
      medidas: [
        { rotulo: 'Capacitância de cada um', simbolo: 'C', expr: "1e12*C('c')", unidade: 'pF', teoria: '1e12*eps0*lado^2/d' },
        { rotulo: 'C₁: três em paralelo', simbolo: r`C_1 = 3C`, expr: "1e12*3*C('c')", unidade: 'pF' },
        { rotulo: 'C₂: dois em paralelo, em série com um', simbolo: r`C_2 = \frac{2C\cdot C}{2C + C}`, expr: "1e12*2*C('c')/3", unidade: 'pF' },
        { rotulo: 'C₃: dois em série, em paralelo com um', simbolo: r`C_3 = \frac C2 + C`, expr: "1e12*1.5*C('c')", unidade: 'pF' },
        { rotulo: 'C₄: três em série', simbolo: r`C_4 = \frac C3`, expr: "1e12*C('c')/3", unidade: 'pF' },
      ],
      passos: [
        {
          titulo: 'Regras',
          texto: r`Em paralelo a ddp é a mesma e as cargas somam: $C = C_1 + C_2$. Em série a carga é a mesma e as ddps somam: $\dfrac1C = \dfrac1{C_1} + \dfrac1{C_2}$.`,
          medidas: [0],
        },
        {
          titulo: 'Os quatro arranjos',
          texto: r`$C_1 = 3C$; $C_2$: o par em paralelo vale $2C$, em série com $C$ dá $\dfrac{2C}{3}$; $C_3$: o par em série vale $C/2$, em paralelo com $C$ dá $\dfrac{3C}{2}$; $C_4 = \dfrac C3$. Da menor para a maior:
$$C_4 < C_2 < C_3 < C_1.$$`,
          medidas: [1, 2, 3, 4],
        },
      ],
      respostas: [{ item: 'Ordem', texto: r`$C_4 < C_2 < C_3 < C_1$` }],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'associacao' }],
        etapas: [
          {
            titulo: 'Ordem das capacitâncias equivalentes',
            texto: r`**O que se pede.** Ordenar, da menor para a maior, as capacitâncias equivalentes $C_1$ a $C_4$ dos quatro arranjos de três capacitores iguais, de capacitância $C$ cada.

**A ideia: as duas regras de associação.** Ambas saem de $C = Q/V$ (formulário).
- **Em paralelo** (ligados aos mesmos dois pontos): todos têm a **mesma** diferença de potencial $V$, e as cargas se somam, $Q = Q_1 + Q_2$. Dividindo por $V$:
$$C_\text{eq} = C_1 + C_2.$$
- **Em série** (um depois do outro, num caminho só): todos têm a **mesma** carga $Q$ (a carga que sai de uma placa entra na seguinte), e as diferenças de potencial se somam, $V = V_1 + V_2$. Dividindo por $Q$:
$$\frac{1}{C_\text{eq}} = \frac{1}{C_1} + \frac{1}{C_2}.$$
Paralelo **aumenta** a capacitância; série **diminui** (ao contrário dos resistores).

**Arranjo por arranjo** (conforme a figura).
- **$C_1$:** os três em paralelo: $C_1 = C + C + C = 3C$.
- **$C_2$:** dois em paralelo ($2C$), em série com o terceiro: $\dfrac{1}{C_2} = \dfrac{1}{2C} + \dfrac1C = \dfrac{3}{2C}$, logo $C_2 = \dfrac{2C}{3}$.
- **$C_3$:** dois em série ($\dfrac C2$), em paralelo com o terceiro: $C_3 = \dfrac C2 + C = \dfrac{3C}{2}$.
- **$C_4$:** os três em série: $\dfrac{1}{C_4} = \dfrac3C$, logo $C_4 = \dfrac C3$.

**Ordenando.** $\dfrac C3 < \dfrac{2C}{3} < \dfrac{3C}{2} < 3C$:
$$C_4 < C_2 < C_3 < C_1.$$`,
            passo: 1,
          },
        ],
        resultado: r`$C_4 < C_2 < C_3 < C_1$.`,
        errosComuns: ['Trocar as regras: capacitores em série combinam como resistores em paralelo.'],
        oficial: { resposta: 'C₁ > C₃ > C₂ > C₄.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Fácil',
      titulo: 'Dielétrico inserido com a bateria ligada',
      resumo: 'V fixo: Q/Q₀ = K, E/E₀ = 1 e U/U₀ = K.',
      figura: { pagina: 1, recorte: [0.089, 0.761, 0.936, 0.841] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [7, 5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'K', rotulo: 'Constante dielétrica', simbolo: 'K', valor: 1, unidade: '', min: 1, max: 6, passo: 0.1 },
        { id: 'V0', rotulo: 'ddp da bateria', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.002 },
        { id: 'd', rotulo: 'Distância entre as placas', simbolo: 'd', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01, passo: 0.001 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'd', V: 'V0', ligado: 1, dieletrico: { K: 'K', inicio: 0, fim: 'd' }, rotulo: 'capacitor ligado à bateria' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Q / Q₀', simbolo: r`\frac{Q}{Q_0}`, expr: "Q('cap')/(eps0*lado^2*V0/d)", unidade: '', teoria: 'K' },
        { rotulo: 'E / E₀', simbolo: r`\frac{E}{E_0}`, expr: 'mag(E(0, 0, 0))/(V0/d)', unidade: '', teoria: 1 },
        { rotulo: 'U / U₀', simbolo: r`\frac{U}{U_0}`, expr: "U('cap')/(eps0*lado^2*V0^2/(2*d))", unidade: '', teoria: 'K' },
        { rotulo: 'Carga nas placas', simbolo: 'Q', expr: "1e9*Q('cap')", unidade: 'nC', teoria: '1e9*K*eps0*lado^2*V0/d' },
      ],
      passos: [
        { titulo: 'Antes', texto: r`Sem dielétrico ($K = 1$): $Q_0 = C_0V$, $E_0 = V/d$, $U_0 = \tfrac12C_0V^2$.`, parametros: { K: 1 }, medidas: [3] },
        {
          titulo: 'Depois',
          texto: r`Com o dielétrico, $C = KC_0$. A bateria segura $V$, então:
- $Q = KC_0V$: $\dfrac{Q}{Q_0} = K$ (a bateria manda mais carga);
- $E = V/d$: $\dfrac{E}{E_0} = 1$ (a carga extra compensa a polarização);
- $U = \tfrac12KC_0V^2$: $\dfrac{U}{U_0} = K$.`,
          parametros: { K: 3 },
          medidas: [0, 1, 2, 3],
        },
      ],
      respostas: [{ item: 'Razões', texto: r`$\dfrac{Q}{Q_0} = K$, $\dfrac{E}{E_0} = 1$, $\dfrac{U}{U_0} = K$` }],
      resolucao: {
        conceitos: [{ texto: 'Dielétricos em capacitores', lab: 'capacitor' }],
        etapas: [
          {
            titulo: 'Razões Q/Q₀, E/E₀ e U/U₀',
            texto: r`**O que se pede.** Um dielétrico de constante $K$ preenche todo o espaço entre as placas de um capacitor plano, **com a bateria ligada**. Achar as razões entre carga, campo e energia depois ($Q$, $E$, $U$) e antes ($Q_0$, $E_0$, $U_0$).

**A ideia.** Dois fatos:
- um dielétrico que preenche o capacitor multiplica a capacitância por $K$ (formulário): $C = KC_0$;
- a bateria continua ligada, então ela **mantém a diferença de potencial** $V$ entre as placas. O que fica fixo é $V$, não a carga.

**A carga.** Por $C = Q/V$ (formulário), $Q = CV$:
$$Q_0 = C_0V,\qquad Q = KC_0V\quad\Rightarrow\quad\frac{Q}{Q_0} = K.$$
A bateria manda carga extra para as placas.

**O campo.** Entre placas paralelas o campo é uniforme e $V = Ed$ (distância $d$ entre as placas). Como $V$ e $d$ não mudam:
$$\frac{E}{E_0} = \frac{V/d}{V/d} = 1.$$
O dielétrico se polariza e tenderia a enfraquecer o campo, mas a carga extra trazida pela bateria compensa isso exatamente.

**A energia.** Pelo formulário, $U = \tfrac12QV$:
$$\frac{U}{U_0} = \frac{\tfrac12(KC_0V)V}{\tfrac12(C_0V)V} = K.$$

**Cuidado.** Com o capacitor **desligado** (carga fixa), as respostas seriam outras: $Q/Q_0 = 1$, $E/E_0 = 1/K$ e $U/U_0 = 1/K$. Sempre pergunte primeiro o que fica fixo, $V$ ou $Q$.`,
            passo: 1,
          },
        ],
        resultado: r`$Q/Q_0 = K$, $E/E_0 = 1$, $U/U_0 = K$.`,
        errosComuns: ['Usar as razões do capacitor isolado ($E/E_0 = 1/K$, $U/U_0 = 1/K$): aqui a bateria continua ligada.'],
        oficial: { resposta: 'O gabarito só indica o tema (dielétricos), sem as razões.', observacao: 'Respostas desta bancada.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Aproximar as placas e depois afastar desligado',
      resumo: 'Q passa de ε₀AV/L a 2ε₀AV/L; desligado e de volta a L, U final − U inicial = (3/2)ε₀AV²/L.',
      figura: [
        { pagina: 1, recorte: [0.089, 0.842, 0.936, 0.902] },
        { pagina: 2, recorte: [0.089, 0.062, 0.936, 0.131] },
      ],
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [7, 5, 9], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'fase',
          rotulo: 'Etapa',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'ligado, separação L' },
            { valor: 2, rotulo: 'ligado, separação L/2' },
            { valor: 3, rotulo: 'desligado, de volta a L' },
          ],
        },
        { id: 'V0', rotulo: 'ddp da bateria', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.002 },
        { id: 'L', rotulo: 'Separação inicial', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado',
          d: 'fase == 2 ? L/2 : L',
          V: 'V0',
          ligado: 'fase <= 2',
          Q: `${C5('L/2')}*V0`,
          rotulo: 'placas',
        },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Carga nas placas', simbolo: 'Q', expr: "1e9*Q('cap')", unidade: 'nC', teoria: `1e9*(fase == 1 ? ${C5('L')}*V0 : ${C5('L/2')}*V0)` },
        { rotulo: 'ddp entre as placas', simbolo: 'V', expr: "Vcap('cap')", unidade: 'V', teoria: 'fase == 3 ? 2*V0 : V0' },
        { rotulo: 'Energia armazenada', simbolo: r`U = \frac{Q^2}{2C}`, expr: "1e6*U('cap')", unidade: 'μJ', teoria: `1e6*(fase == 1 ? ${C5('L')}*V0^2/2 : (fase == 2 ? ${C5('L/2')}*V0^2/2 : 2*${C5('L')}*V0^2))` },
        { rotulo: 'U agora − U inicial', simbolo: r`\Delta U`, expr: `1e6*(U('cap') - ${C5('L')}*V0^2/2)`, unidade: 'μJ' },
      ],
      passos: [
        { titulo: 'Início', texto: r`$C_i = \dfrac{\varepsilon_0A}{L}$ e $Q_i = \dfrac{\varepsilon_0A}{L}V$.`, parametros: { fase: 1 }, medidas: [0, 2] },
        {
          titulo: '(a) Ligado, separação L/2',
          texto: r`A capacitância dobra e a bateria segura $V$: $Q_f = \dfrac{2\varepsilon_0A}{L}V$, o dobro.`,
          parametros: { fase: 2 },
          medidas: [0, 2],
        },
        {
          titulo: '(b) Desligado, de volta a L',
          texto: r`Sem a bateria, a carga $Q_f$ fica presa. Com $C = \varepsilon_0A/L$ de novo, a ddp sobe para $2V$ e
$$U = \frac{Q_f^2}{2C} = \frac{2\varepsilon_0A}{L}V^2.$$
Comparando com $U_i = \dfrac{\varepsilon_0A}{2L}V^2$: $\Delta U = \dfrac32\dfrac{\varepsilon_0A}{L}V^2$. Esse ganho veio do trabalho de quem afastou as placas contra a atração entre elas.`,
          parametros: { fase: 3 },
          medidas: [0, 1, 2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$Q_i = \dfrac{\varepsilon_0A}{L}V$; $Q_f = \dfrac{2\varepsilon_0A}{L}V$` },
        { item: '(b)', texto: r`$U_\text{final} - U_\text{inicial} = \dfrac32\dfrac{\varepsilon_0A}{L}V^2$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Capacitor ligado e isolado', lab: 'capacitor' },
          { texto: 'Energia no capacitor', lab: 'energia' },
        ],
        etapas: [
          {
            titulo: '(a) A carga antes e depois de aproximar',
            texto: r`**O que se pede.** A carga no capacitor de placas de área $A$, ligado a uma bateria de tensão $V$, quando a separação é $L$ e depois que ela é reduzida a $L/2$ (com a bateria ainda ligada).

**A ideia.** Para placas planas e paralelas (tratadas como infinitas), a capacitância é
$$C = \frac{\varepsilon_0A}{d},$$
com $d$ a separação. Ela vem de três passos: o campo entre as placas é $\sigma/\varepsilon_0 = Q/\varepsilon_0A$ (lei de Gauss), a diferença de potencial é $V = Ed$ (campo uniforme) e $C = Q/V$ (formulário). Com a bateria ligada, $V$ fica **fixo**, e a carga sai de $Q = CV$.

**A conta.**
- Antes, $d = L$: $C_i = \dfrac{\varepsilon_0A}{L}$, logo $Q_i = \dfrac{\varepsilon_0A}{L}V$.
- Depois, $d = L/2$: a capacitância **dobra**, $C_f = \dfrac{2\varepsilon_0A}{L}$, logo $Q_f = \dfrac{2\varepsilon_0A}{L}V$.

A carga dobra: a bateria empurra mais carga para as placas, que agora "cabem" mais carga com a mesma tensão.`,
            passo: 1,
          },
          {
            titulo: '(b) Desligar e voltar à separação L',
            texto: r`**O que se pede.** Depois do item (a), a bateria é desligada e a separação volta a $L$. Qual a diferença entre a energia final e a energia do começo (antes de aproximar)?

**A ideia.** Desligado da bateria, o capacitor fica **isolado**: a carga não tem para onde ir e fica **fixa** em $Q_f$. Agora é $V$ que muda. A energia de um capacitor é (formulário) $U = \tfrac12QV$; com $V = Q/C$, também $U = \dfrac{Q^2}{2C}$, que é a forma útil quando $Q$ é conhecido.

**A conta.**
- **Energia no começo** (separação $L$, tensão $V$): $U_i = \tfrac12Q_iV = \dfrac{\varepsilon_0A}{2L}V^2$.
- **Energia no fim** (separação $L$ de novo, então $C = \dfrac{\varepsilon_0A}{L}$, e carga $Q_f = \dfrac{2\varepsilon_0A}{L}V$):
$$U_f = \frac{Q_f^2}{2C} = \frac{4\varepsilon_0^2A^2V^2/L^2}{2\varepsilon_0A/L} = \frac{2\varepsilon_0A}{L}V^2.$$
(A tensão subiu para $Q_f/C = 2V$.)
- **Diferença:**
$$U_f - U_i = \frac{2\varepsilon_0A}{L}V^2 - \frac{\varepsilon_0A}{2L}V^2 = \frac32\,\frac{\varepsilon_0A}{L}V^2.$$

**De onde veio essa energia?** As placas, com cargas opostas, se atraem. Para afastá-las de $L/2$ até $L$, alguém precisou puxá-las contra essa atração, e esse trabalho ficou guardado no campo.`,
            passo: 2,
          },
        ],
        resultado: r`$Q_f = 2Q_i$; $\Delta U = \tfrac32\varepsilon_0AV^2/L$.`,
        errosComuns: ['Manter $V$ fixo depois de desligar a bateria: desligada, quem fica fixa é a carga.'],
        oficial: { resposta: 'Qᵢ = ε₀AV/L, Q_f = 2ε₀AV/L; ΔU = (3/2)ε₀AV²/L.' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Fácil',
      titulo: 'Chapa condutora entre as placas',
      resumo: 'Só sobra o vácuo de espessura d − a: C = C₀/(1 − a/d), em qualquer posição.',
      figura: { pagina: 2, recorte: [0.089, 0.132, 0.936, 0.401] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [7, 5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'aa', rotulo: 'Espessura da chapa', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0, max: 0.018, passo: 0.001 },
        { id: 'x0', rotulo: 'Distância da chapa à placa positiva', simbolo: 'x', valor: 0.005, unidade: 'm', min: 0, max: 0.01, passo: 0.0005 },
        { id: 'Q0', rotulo: 'Carga nas placas', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.002 },
        { id: 'd', rotulo: 'Distância entre as placas', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado',
          d: 'd',
          Q: 'Q0',
          ligado: 0,
          dieletrico: { condutora: true, inicio: 'min(x0, d - aa)', fim: 'min(x0, d - aa) + aa' },
          rotulo: 'capacitor com chapa metálica',
        },
        {
          id: 'atravessa',
          tipo: 'caminho',
          pontos: [['0-d/2', 0, 0], ['0-d/2 + min(x0, d - aa)', 0, 0], ['0-d/2 + min(x0, d - aa) + aa', 0, 0], ['d/2', 0, 0]],
          rotulo: 'de placa a placa',
        },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Capacitância', simbolo: r`C = \frac{C_0}{1 - a/d}`, expr: "1e12*C('cap')", unidade: 'pF', teoria: '1e12*eps0*lado^2/(d - aa)' },
        { rotulo: 'ddp (integral de E de placa a placa)', simbolo: r`V = \frac{Q}{C}`, expr: "intE('atravessa')", unidade: 'V', teoria: 'Q0*(d - aa)/(eps0*lado^2)' },
        { rotulo: 'Campo dentro da chapa', simbolo: 'E', expr: 'mag(E(0 - d/2 + min(x0, d - aa) + aa/2, 0, 0))', unidade: 'V/m', teoria: 'aa > 0 ? 0 : Q0/(eps0*lado^2)' },
        { rotulo: 'C₀ (sem a chapa)', simbolo: r`C_0 = \frac{\varepsilon_0A}{d}`, expr: '1e12*eps0*lado^2/d', unidade: 'pF' },
      ],
      passos: [
        {
          titulo: '(a) Capacitância',
          texto: r`Dentro do metal $E = 0$; nos dois vãos de vácuo, de espessuras $x$ e $y$ com $x + y = d - a$, o campo é o mesmo, $\sigma/\varepsilon_0$. Então $V = \dfrac{\sigma}{\varepsilon_0}(d - a)$ e
$$C = \frac{\varepsilon_0A}{d - a} = \frac{C_0}{1 - a/d}.$$`,
          medidas: [0, 1, 2],
        },
        {
          titulo: '(b) Limites',
          texto: r`$a \to 0$: $C \to C_0$, a chapa some. $a \to d$: $C \to \infty$, porque o metal encosta nas placas e as curto-circuita; a carga deixa de precisar de ddp para ficar lá.`,
          parametros: { aa: 0.018 },
          medidas: [0, 3],
        },
        {
          titulo: '(c) Posição',
          texto: r`O campo nos vãos é uniforme e igual: o que conta é a soma $x + y = d - a$, não como ela se divide. Arraste a chapa: $C$ não muda.`,
          parametros: { aa: 0.01, x0: 0.002 },
          medidas: [0, 1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$C = \dfrac{C_0}{1 - a/d}$` },
        { item: '(b)', texto: r`$a \to 0$: $C \to C_0$; $a \to d$: $C \to \infty$ (o metal curto-circuita as placas).` },
        { item: '(c)', texto: 'O campo nos vãos é uniforme: só a soma das espessuras de vácuo importa.' },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio', lab: 'condutores' },
          { texto: 'Capacitor com chapas', lab: 'capacitor' },
        ],
        etapas: [
          {
            titulo: '(a) A capacitância com a chapa condutora',
            texto: r`**O que se pede.** A capacitância depois de pôr, entre as placas (separação $d$, capacitância inicial $C_0$), uma chapa condutora de espessura $a$, paralela a elas e do mesmo tamanho.

**A ideia.**
- Dentro do **metal** da chapa, em equilíbrio, o campo é **zero**. As cargas da chapa se separam (negativas de um lado, positivas do outro) até anular o campo lá dentro.
- Nos dois vãos de vácuo, entre cada placa e a chapa, o campo é o mesmo de antes, $E = \dfrac{\sigma}{\varepsilon_0}$. Pela lei de Gauss, ele só depende da carga $\sigma$ das placas, que não muda.
- A capacitância é $C = Q/V$ (formulário), e $V$ é a soma de $E\times\text{espessura}$ em cada trecho.

**A conta.** Chame de $x$ e $y$ as espessuras dos dois vãos, com $x + y = d - a$. Na chapa, o campo é zero e não há queda de potencial:
$$V = E\,x + 0\cdot a + E\,y = \frac{\sigma}{\varepsilon_0}(d - a).$$
Com $Q = \sigma A$:
$$C = \frac{Q}{V} = \frac{\varepsilon_0A}{d - a}.$$
Como $C_0 = \dfrac{\varepsilon_0A}{d}$, isso é
$$C = \frac{C_0}{1 - a/d}.$$

**Em palavras.** O metal "encurta" a distância entre as placas: é como um capacitor de separação $d - a$. A capacitância aumenta.`,
            passo: 0,
          },
          {
            titulo: '(b) Os limites a → 0 e a → d',
            texto: r`**O que se pede.** O que acontece com $C = \dfrac{C_0}{1 - a/d}$ quando a chapa fica muito fina ($a \to 0$) e quando ela ocupa quase todo o espaço ($a \to d$).

**$a \to 0$.** $\dfrac ad \to 0$ e $C \to C_0$: uma chapa de espessura zero não muda nada. Faz sentido.

**$a \to d$.** $1 - \dfrac ad \to 0$ e $C \to \infty$. Quando a chapa encosta nas duas placas, o metal liga uma placa à outra: o capacitor fica em **curto-circuito**. As cargas passam de uma placa para a outra pelo metal, e não é mais possível manter diferença de potencial entre elas. Uma capacitância "infinita" é o jeito da fórmula dizer isso: qualquer carga, com diferença de potencial zero.

**Sobre o gabarito.** O gabarito da monitoria diz que nesse limite o problema fica indefinido; mais precisamente, $C \to \infty$, pelo curto-circuito.`,
            passo: 1,
          },
          {
            titulo: '(c) Por que a posição da chapa não importa',
            texto: r`**O que se pede.** Explicar por que $C$ não depende de onde a chapa é posta entre as placas.

**A ideia.** Pelo item (a), a diferença de potencial é
$$V = E\,x + E\,y = E\,(x + y),$$
e o campo $E = \sigma/\varepsilon_0$ é o **mesmo** nos dois vãos (é uniforme). Então só importa a **soma** $x + y = d - a$, a espessura total de vácuo, e não como ela se divide entre os dois lados.

**Resposta.** Mover a chapa para cima ou para baixo aumenta um vão e diminui o outro na mesma medida: a soma não muda, nem $V$, nem $C$. Isso depende de o campo nos vãos ser uniforme, o que vale para placas grandes comparadas com a separação.`,
            passo: 2,
          },
        ],
        resultado: r`$C = C_0/(1 - a/d)$.`,
        errosComuns: ['Tratar a chapa como dielétrico de $K$ finito; metal equivale a $K \\to \\infty$.'],
        oficial: {
          resposta: 'C = C₀/(1 − a/d); a → 0 dá C₀; a → d deixa o problema indefinido; o resultado não depende da posição porque o campo é uniforme.',
          observacao: 'No limite a → d, o gabarito diz que o problema fica indefinido. Mais precisamente, C → ∞: o metal encosta nas placas e as curto-circuita.',
        },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Médio',
      titulo: 'Metade do vão com dielétrico',
      resumo: 'Dois capacitores em série: C = 2Kε₀A/[d(1 + K)]; E_vácuo = KE_diel.',
      figura: { pagina: 2, recorte: [0.089, 0.402, 0.936, 0.699] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [7, 5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'K', rotulo: 'Constante dielétrica', simbolo: 'K', valor: 3, unidade: '', min: 1, max: 8, passo: 0.1 },
        { id: 'V0', rotulo: 'ddp aplicada', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.002 },
        { id: 'd', rotulo: 'Distância entre as placas', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'd', V: 'V0', ligado: 1, dieletrico: { K: 'K', inicio: 'd/2', fim: 'd' }, rotulo: 'metade com dielétrico' },
        { id: 'atravessa', tipo: 'caminho', pontos: [['0-d/2', 0, 0], ['d/2', 0, 0]], rotulo: 'de placa a placa' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Capacitância', simbolo: r`C = \frac{2K\varepsilon_0A}{d(1 + K)}`, expr: "1e12*C('cap')", unidade: 'pF', teoria: '1e12*2*K*eps0*lado^2/(d*(1 + K))' },
        { rotulo: 'Campo no vácuo', simbolo: r`E_v = \frac{2KV}{d(1 + K)}`, expr: 'mag(E(0 - d/4, 0, 0))', unidade: 'V/m', teoria: '2*K*V0/(d*(1 + K))' },
        { rotulo: 'Campo no dielétrico', simbolo: r`E_d = \frac{2V}{d(1 + K)}`, expr: 'mag(E(d/4, 0, 0))', unidade: 'V/m', teoria: '2*V0/(d*(1 + K))' },
        { rotulo: 'ddp (integral de E de placa a placa)', simbolo: 'V', expr: "intE('atravessa')", unidade: 'V', teoria: 'V0' },
        { rotulo: 'Carga nas placas', simbolo: 'Q = CV', expr: "1e9*Q('cap')", unidade: 'nC', teoria: '1e9*2*K*eps0*lado^2*V0/(d*(1 + K))' },
      ],
      passos: [
        {
          titulo: '(a) Dois capacitores em série',
          texto: r`Sim. A interface entre o vácuo e o dielétrico é paralela às placas: dá para imaginar uma folha metálica fina ali, sem mudar nada. Ficam dois capacitores de espessura $d/2$, um com vácuo e outro com $K$, **em série** (a mesma carga passa pelos dois).`,
        },
        {
          titulo: '(b) Capacitância',
          texto: r`$C_v = \dfrac{2\varepsilon_0A}{d}$ e $C_d = \dfrac{2K\varepsilon_0A}{d}$. Em série:
$$C = \frac{C_vC_d}{C_v + C_d} = \frac{2K\varepsilon_0A}{d(1 + K)}.$$
Com $K \to 1$, volta $\varepsilon_0A/d$.`,
          medidas: [0],
        },
        {
          titulo: '(c) Campos',
          texto: r`$D = \sigma$ é o mesmo nas duas camadas, então $E_v = KE_d$. Com $V = (E_v + E_d)\dfrac d2$: $E_d = \dfrac{2V}{d(1 + K)}$ e $E_v = \dfrac{2KV}{d(1 + K)}$.`,
          medidas: [1, 2, 3],
        },
        { titulo: '(d) Carga', texto: r`$Q = CV = \dfrac{2K\varepsilon_0AV}{d(1 + K)}$.`, medidas: [4] },
      ],
      respostas: [
        { item: '(a)', texto: 'Sim: dois capacitores de espessura d/2 em série, um de vácuo e outro com dielétrico.' },
        { item: '(b)', texto: r`$C = \dfrac{2K\varepsilon_0A}{d(1 + K)}$, que dá $\varepsilon_0A/d$ com $K = 1$.` },
        { item: '(c)', texto: r`$E_v = \dfrac{2KV}{d(1 + K)}$; $E_d = \dfrac{2V}{d(1 + K)}$` },
        { item: '(d)', texto: r`$Q = \dfrac{2K\varepsilon_0AV}{d(1 + K)}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dielétricos em série', lab: 'capacitor' }],
        etapas: [
          {
            titulo: '(a) Dá para ver como dois capacitores?',
            texto: r`**O que se pede.** Dizer se o capacitor com metade do vão preenchido por dielétrico (uma camada de espessura $d/2$ encostada numa placa, e a outra metade em vácuo) pode ser visto como uma associação de dois capacitores.

**A ideia.** A interface entre o dielétrico e o vácuo é um plano **paralelo** às placas. Nela o potencial é o mesmo em todos os pontos: por simetria (placas grandes), o potencial só depende da distância às placas. Então dá para imaginar uma folha metálica finíssima nessa interface sem mudar nada: uma superfície que já era equipotencial pode virar metal.

**Com a folha imaginária.** Ficam dois capacitores de placas paralelas, cada um com separação $d/2$:
- um com vácuo;
- outro com o dielétrico $K$.

Eles estão **em série**: um depois do outro no caminho de uma placa à outra. A carga que está numa placa induz carga igual e oposta do outro lado da folha, então os dois têm a **mesma carga**, e as tensões se somam.

**Resposta.** **Sim**: dois capacitores em série.`,
            passo: 0,
          },
          {
            titulo: '(b) A capacitância, e o teste K → 1',
            texto: r`**O que se pede.** A capacitância do sistema, e conferir que ela volta ao valor sem dielétrico quando $K = 1$.

**A ideia.**
- Placas paralelas de área $A$ e separação $d'$ no vácuo: $C = \dfrac{\varepsilon_0A}{d'}$ (vem de $E = \sigma/\varepsilon_0$, $V = Ed'$ e $C = Q/V$).
- Com dielétrico preenchendo: multiplica-se por $K$ (formulário: $C = KC_0$).
- Em série: $\dfrac1C = \dfrac1{C_1} + \dfrac1{C_2}$ (mesma carga, tensões somadas).

**A conta.** Cada metade tem separação $d/2$:
$$C_v = \frac{2\varepsilon_0A}{d},\qquad C_d = \frac{2K\varepsilon_0A}{d}.$$
Em série:
$$C = \frac{C_vC_d}{C_v + C_d} = \frac{\dfrac{2\varepsilon_0A}{d}\cdot\dfrac{2K\varepsilon_0A}{d}}{\dfrac{2\varepsilon_0A}{d}(1 + K)} = \frac{2K\varepsilon_0A}{d(1 + K)}.$$

**O teste $K \to 1$.** Sem dielétrico de verdade ($K = 1$): $C = \dfrac{2\varepsilon_0A}{2d} = \dfrac{\varepsilon_0A}{d}$, o capacitor de vácuo. Confere.

**Repare.** $\dfrac{2K}{1 + K}$ fica entre $1$ e $2$: preencher **metade** do vão no máximo dobra a capacitância (quando $K \to \infty$, a camada age como metal e o vão efetivo cai à metade).`,
            passo: 1,
          },
          {
            titulo: '(c) O campo no vácuo e no dielétrico',
            texto: r`**O que se pede.** A intensidade do campo na metade de vácuo e na metade com dielétrico, com a tensão $V$ aplicada.

**A ideia.**
- A carga livre nas placas, $\sigma$, é a mesma vista pelas duas camadas (estão em série).
- No vácuo, o campo é $E_v = \dfrac{\sigma}{\varepsilon_0}$.
- No dielétrico, ele se polariza e enfraquece o campo pelo fator $K$: $E_d = \dfrac{\sigma}{K\varepsilon_0}$. É a mesma razão pela qual $C = KC_0$: com a mesma carga, a tensão fica $K$ vezes menor.

Então $E_v = K\,E_d$.

**A conta.** A tensão total é a soma das quedas nas duas metades, cada uma de espessura $d/2$:
$$V = E_v\frac d2 + E_d\frac d2 = (K + 1)E_d\frac d2.$$
$$E_d = \frac{2V}{d(1 + K)},\qquad E_v = KE_d = \frac{2KV}{d(1 + K)}.$$

**Conferindo.** Com $K = 1$, os dois dão $V/d$, o campo de um capacitor de vácuo. Com $K > 1$, o campo é mais fraco no dielétrico e mais forte no vácuo do que seria sem ele.`,
            passo: 2,
          },
          {
            titulo: '(d) A carga nas placas',
            texto: r`**O que se pede.** A carga total armazenada nas placas, com a tensão $V$.

**A ideia.** Da definição de capacitância (formulário), $Q = CV$, com o $C$ do item (b).

**A conta.**
$$Q = \frac{2K\varepsilon_0A}{d(1 + K)}\,V.$$

**Conferindo pelo campo.** No vácuo, $E_v = \sigma/\varepsilon_0$, então $\sigma = \varepsilon_0E_v = \dfrac{2K\varepsilon_0V}{d(1 + K)}$, e $Q = \sigma A$ dá o mesmo resultado.`,
            passo: 3,
          },
        ],
        resultado: r`$C = \frac{2K\varepsilon_0A}{d(1+K)}$; $E_v = KE_d$.`,
        errosComuns: ['Pôr as camadas em paralelo: em paralelo ficariam blocos lado a lado, indo de placa a placa.'],
        oficial: { resposta: 'O gabarito só indica o tema (dielétricos), sem as respostas.', observacao: 'Respostas desta bancada.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Ler o dielétrico no gráfico do potencial',
      resumo: 'E_I = V₀/L, E_II = 2V₀/L: o dielétrico está em I, com K = 2; C = Q/3V₀.',
      figura: [
        { pagina: 2, recorte: [0.089, 0.7, 0.936, 0.894] },
        { pagina: 3, recorte: [0.08, 0.062, 0.936, 0.156] },
      ],
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [9, 5, 6], alvo: [0, 0, 1] } },
      parametros: [
        { id: 'V0', rotulo: 'Escala do potencial', simbolo: 'V_0', valor: 50, unidade: 'V', min: 10, max: 100, passo: 1 },
        { id: 'L', rotulo: 'Espessura de cada região', simbolo: 'L', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01, passo: 0.001 },
        { id: 'K', rotulo: 'Constante do material em I', simbolo: 'K', valor: 2, unidade: '', min: 1, max: 4, passo: 0.1 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', centro: [0, 0, 'L'], eixo: 'z', lado: 'lado', d: '2*L', V: '3*V0', ligado: 1, dieletrico: { K: 'K', inicio: 0, fim: 'L' }, rotulo: 'placas em z = 0 e z = 2L' },
        { id: 'regI', tipo: 'caminho', pontos: [[0, 0, 0], [0, 0, 'L']], rotulo: 'região I' },
        { id: 'regII', tipo: 'caminho', pontos: [[0, 0, 'L'], [0, 0, '2*L']], rotulo: 'região II' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Queda de potencial em I', simbolo: r`V(0) - V(L)`, expr: "intE('regI')", unidade: 'V', teoria: '3*V0/(1 + K)' },
        { rotulo: 'Queda de potencial em II', simbolo: r`V(L) - V(2L)`, expr: "intE('regII')", unidade: 'V', teoria: '3*V0*K/(1 + K)' },
        { rotulo: 'Campo em I', simbolo: r`E_I`, expr: 'mag(E(0, 0, L/2))', unidade: 'V/m', teoria: '3*V0/((1 + K)*L)' },
        { rotulo: 'Campo em II', simbolo: r`E_{II}`, expr: 'mag(E(0, 0, 1.5*L))', unidade: 'V/m', teoria: '3*V0*K/((1 + K)*L)' },
        { rotulo: 'Razão E_II / E_I', simbolo: r`K = \frac{E_{II}}{E_I}`, expr: 'mag(E(0, 0, 1.5*L))/mag(E(0, 0, L/2))', unidade: '', teoria: 'K' },
        { rotulo: 'Capacitância', simbolo: r`C = \frac{Q}{3V_0}`, expr: "1e12*C('cap')", unidade: 'pF', teoria: "1e12*Q('cap')/(3*V0)" },
      ],
      passos: [
        {
          titulo: '(a) Capacitância',
          texto: r`A ddp total é $V(0) - V(2L) = 3V_0$, então $C = \dfrac{Q}{3V_0}$.`,
          parametros: { K: 2 },
          medidas: [5],
        },
        {
          titulo: '(b) Campos',
          texto: r`O potencial cai linearmente em cada região: em I, de $3V_0$ a $2V_0$, $E_I = \dfrac{V_0}{L}$; em II, de $2V_0$ a $0$, $E_{II} = \dfrac{2V_0}{L}$.`,
          parametros: { K: 2 },
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: '(c) e (d) Onde está o dielétrico',
          texto: r`O deslocamento $D = \sigma$ é o mesmo nas duas regiões, e $E = D/K\varepsilon_0$: o dielétrico fica onde o campo é **menor**, a região **I**. Então
$$K = \frac{E_{II}}{E_I} = 2.$$
Mude $K$: o gráfico do enunciado só aparece com $K = 2$.`,
          parametros: { K: 2 },
          medidas: [4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$C = \dfrac{Q}{3V_0}$` },
        { item: '(b)', texto: r`$E_I = \dfrac{V_0}{L}$, $E_{II} = \dfrac{2V_0}{L}$` },
        { item: '(c)', texto: 'A região I, onde o campo é menor.' },
        { item: '(d)', texto: r`$K = 2$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dielétricos em série', lab: 'capacitor' }],
        etapas: [
          {
            titulo: '(a) A capacitância a partir do gráfico',
            texto: r`**O que se pede.** A capacitância do capacitor de placas em $z = 0$ e $z = 2L$, que armazena carga $Q$, lendo a diferença de potencial no gráfico.

**A ideia.** Capacitância é carga dividida pela diferença de potencial entre as placas (formulário: $C = Q/V$).

**Lendo o gráfico.** O potencial vale $3V_0$ na placa em $z = 0$ e $0$ na placa em $z = 2L$. A diferença de potencial entre as placas é
$$V = 3V_0 - 0 = 3V_0.$$

**A conta.**
$$C = \frac{Q}{3V_0}.$$`,
            passo: 0,
          },
          {
            titulo: '(b) O campo nas regiões I e II',
            texto: r`**O que se pede.** A intensidade do campo nas regiões (I) $0 < z < L$ e (II) $L < z < 2L$.

**A ideia.** O campo é menos a inclinação do potencial (formulário: $\vec E = -\vec\nabla V$; aqui, $E_z = -\dfrac{dV}{dz}$). Num trecho em que o gráfico é uma **reta**, o campo é uniforme e vale queda de potencial ÷ distância.

**Lendo o gráfico.**
- Região I: o potencial cai de $3V_0$ a $2V_0$ ao longo de $L$:
$$E_I = \frac{3V_0 - 2V_0}{L} = \frac{V_0}{L}.$$
- Região II: cai de $2V_0$ a $0$ ao longo de $L$:
$$E_{II} = \frac{2V_0 - 0}{L} = \frac{2V_0}{L}.$$

Nas duas regiões o campo aponta no sentido $+z$, para onde o potencial diminui.`,
            passo: 1,
          },
          {
            titulo: '(c) Em que região está o dielétrico',
            texto: r`**O que se pede.** Sabendo que uma região é vácuo e a outra tem dielétrico, dizer qual tem o dielétrico.

**A ideia.** As duas regiões estão uma depois da outra entre as placas, como dois capacitores em série. A carga livre $\sigma$ das placas é a mesma vista pelas duas.
- No vácuo, o campo é $E = \dfrac{\sigma}{\varepsilon_0}$.
- Num dielétrico, ele se polariza e o campo fica $K$ vezes **menor**: $E = \dfrac{\sigma}{K\varepsilon_0}$, com $K > 1$.

**Aplicando.** Pelo item (b), o campo da região I ($V_0/L$) é **menor** que o da região II ($2V_0/L$). O campo mais fraco está no dielétrico.

**Resposta.** O dielétrico está na **região I** ($0 < z < L$).`,
            passo: 2,
          },
          {
            titulo: '(d) A constante dielétrica',
            texto: r`**O que se pede.** O valor de $K$ do dielétrico.

**A ideia.** Pelo item (c), com a mesma carga livre $\sigma$, $E_\text{vácuo} = \dfrac{\sigma}{\varepsilon_0}$ e $E_\text{dielétrico} = \dfrac{\sigma}{K\varepsilon_0}$. Dividindo um pelo outro, $\sigma$ e $\varepsilon_0$ cancelam:
$$K = \frac{E_\text{vácuo}}{E_\text{dielétrico}}.$$

**A conta.** A região II é vácuo e a I é dielétrico:
$$K = \frac{E_{II}}{E_I} = \frac{2V_0/L}{V_0/L} = 2.$$`,
            passo: 2,
          },
        ],
        resultado: r`$C = Q/3V_0$; $E_I = V_0/L$, $E_{II} = 2V_0/L$; dielétrico em I; $K = 2$.`,
        errosComuns: ['Pôr o dielétrico onde o campo é maior.'],
        oficial: { resposta: 'O gabarito só indica o tema (dielétricos), sem as respostas.', observacao: 'Respostas desta bancada.' },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Capacitor esférico com dois dielétricos',
      resumo: 'Duas cascas em série: 1/C = (1/4πε₀)[(1/a − 1/b)/κ₁ + (1/b − 1/c)/κ₂].',
      figura: { pagina: 3, recorte: [0.08, 0.157, 0.936, 0.441] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [4, -5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.005, max: 0.015, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da interface', simbolo: 'b', valor: 0.025, unidade: 'm', min: 0.018, max: 0.035, passo: 0.001 },
        { id: 'c', rotulo: 'Raio externo', simbolo: 'c', valor: 0.045, unidade: 'm', min: 0.04, max: 0.05, passo: 0.001 },
        { id: 'k1', rotulo: 'Constante do dielétrico interno', simbolo: r`\kappa_1`, valor: 2, unidade: '', min: 1, max: 6, passo: 0.1 },
        { id: 'k2', rotulo: 'Constante do dielétrico externo', simbolo: r`\kappa_2`, valor: 5, unidade: '', min: 1, max: 6, passo: 0.1 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitorRadial',
          forma: 'esfera',
          centro: [0, 0, 0],
          a: 'a',
          b: 'c',
          Q: 'Q0',
          ligado: 0,
          dieletrico: [
            { K: 'k1', inicio: 'a', fim: 'b' },
            { K: 'k2', inicio: 'b', fim: 'c' },
          ],
          rotulo: 'capacitor esférico',
        },
        { id: 'raio', tipo: 'caminho', pontos: [['a', 0, 0], ['b', 0, 0], ['c', 0, 0]], rotulo: 'de a até c' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo logo dentro de b (dielétrico 1)', simbolo: r`\frac{Q}{4\pi\kappa_1\varepsilon_0r^2}`, expr: 'mag(E(0.98*b, 0, 0))', unidade: 'V/m', teoria: 'Q0/(4*pi*k1*eps0*(0.98*b)^2)' },
        { rotulo: 'Campo logo fora de b (dielétrico 2)', simbolo: r`\frac{Q}{4\pi\kappa_2\varepsilon_0r^2}`, expr: 'mag(E(1.02*b, 0, 0))', unidade: 'V/m', teoria: 'Q0/(4*pi*k2*eps0*(1.02*b)^2)' },
        { rotulo: 'ddp (integral de E de a até c)', simbolo: r`V_a - V_c`, expr: "intE('raio')", unidade: 'V', teoria: 'Q0/(4*pi*eps0)*((1/a - 1/b)/k1 + (1/b - 1/c)/k2)' },
        { rotulo: 'Capacitância (Q / ΔV)', simbolo: 'C', expr: "1e12*Q0/intE('raio')", unidade: 'pF', teoria: '1e12*4*pi*eps0/((1/a - 1/b)/k1 + (1/b - 1/c)/k2)' },
      ],
      passos: [
        {
          titulo: 'Campo em cada camada',
          texto: r`Gauss com o deslocamento: $D\cdot4\pi r^2 = Q$ em qualquer raio. Em cada dielétrico, $E = \dfrac{Q}{4\pi\kappa\varepsilon_0r^2}$: o campo dá um salto em $r = b$.`,
          medidas: [0, 1],
        },
        {
          titulo: 'ddp e capacitância',
          texto: r`Integrando de $a$ até $c$:
$$\Delta V = \frac{Q}{4\pi\varepsilon_0}\left[\frac{1}{\kappa_1}\left(\frac1a - \frac1b\right) + \frac{1}{\kappa_2}\left(\frac1b - \frac1c\right)\right],$$
e $C = Q/\Delta V$. É a associação em série de dois capacitores esféricos, um de $a$ a $b$ e outro de $b$ a $c$.`,
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: 'C', texto: r`$C = \dfrac{4\pi\varepsilon_0}{\dfrac{1}{\kappa_1}\left(\dfrac1a - \dfrac1b\right) + \dfrac{1}{\kappa_2}\left(\dfrac1b - \dfrac1c\right)} = \dfrac{4\pi\varepsilon_0\kappa_1\kappa_2abc}{\kappa_2c(b - a) + \kappa_1a(c - b)}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dielétricos em capacitores', lab: 'capacitor' }],
        etapas: [
          {
            titulo: 'C do capacitor esférico com dois dielétricos',
            texto: r`**O que se pede.** A capacitância de duas cascas esféricas condutoras concêntricas, de raios $a$ e $c$, com o espaço entre elas preenchido por dois dielétricos: $\kappa_1$ de $a$ a $b$ e $\kappa_2$ de $b$ a $c$.

**A ideia.** O roteiro de sempre para capacitância:
1. pôr carga $+Q$ na casca de dentro e $-Q$ na de fora;
2. achar o campo entre elas;
3. integrar o campo para obter a diferença de potencial $\Delta V$;
4. usar $C = Q/\Delta V$ (formulário).

**Passo 2: o campo.** Há simetria esférica: o campo é radial e só depende de $r$. Sem dielétrico, a lei de Gauss com uma esfera de raio $r$ (entre as cascas) daria o campo de uma carga pontual $Q$, $\dfrac{Q}{4\pi\varepsilon_0r^2}$. Um dielétrico de constante $\kappa$ se polariza e reduz o campo pelo fator $\kappa$:
$$E = \frac{Q}{4\pi\kappa_1\varepsilon_0r^2}\ (a < r < b),\qquad E = \frac{Q}{4\pi\kappa_2\varepsilon_0r^2}\ (b < r < c).$$
O campo dá um salto em $r = b$, onde o material muda.

**Passo 3: a diferença de potencial.** $\Delta V = \displaystyle\int_a^cE\,dr$, dividida nos dois trechos, com $\displaystyle\int\frac{dr}{r^2} = -\frac1r$:
$$\Delta V = \frac{Q}{4\pi\varepsilon_0}\left[\frac{1}{\kappa_1}\left(\frac1a - \frac1b\right) + \frac{1}{\kappa_2}\left(\frac1b - \frac1c\right)\right].$$

**Passo 4: a capacitância.**
$$C = \frac{Q}{\Delta V} = \frac{4\pi\varepsilon_0}{\dfrac{1}{\kappa_1}\left(\dfrac1a - \dfrac1b\right) + \dfrac{1}{\kappa_2}\left(\dfrac1b - \dfrac1c\right)}.$$
Usando $\dfrac1a - \dfrac1b = \dfrac{b - a}{ab}$ e $\dfrac1b - \dfrac1c = \dfrac{c - b}{bc}$ e o denominador comum $\kappa_1\kappa_2abc$:
$$C = \frac{4\pi\varepsilon_0\kappa_1\kappa_2\,abc}{\kappa_2c(b - a) + \kappa_1a(c - b)}.$$

**Interpretação.** É a associação **em série** de dois capacitores esféricos: um de $a$ a $b$ com $\kappa_1$ e outro de $b$ a $c$ com $\kappa_2$. As tensões das duas camadas se somam e a carga é a mesma. **Conferindo:** com $\kappa_1 = \kappa_2 = 1$, sai $C = \dfrac{4\pi\varepsilon_0ac}{c - a}$, o capacitor esférico de vácuo.`,
            passo: 1,
          },
        ],
        resultado: r`$C = \dfrac{4\pi\varepsilon_0\kappa_1\kappa_2abc}{\kappa_2c(b - a) + \kappa_1a(c - b)}$: dois capacitores esféricos em série.`,
        errosComuns: ['Tratar as camadas como em paralelo.'],
        oficial: { resposta: 'O gabarito só indica o tema (dielétricos), sem a resposta.', observacao: 'Resposta desta bancada.' },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Difícil',
      titulo: 'Energia e autocapacitância de uma esfera',
      resumo: 'U = ∫ε₀E²/2 dV = Q²/8πε₀R, e de U = Q²/2C sai C = 4πε₀R.',
      figura: { pagina: 3, recorte: [0.08, 0.442, 0.936, 0.587] },
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [6, -8, 14], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao centro', simbolo: 'r', valor: 0.07, unidade: 'm', min: 0.005, max: 0.1, passo: 0.001 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', Q: 'Q0', centro: [0, 0, 0], raio: 'R', oca: true, rotulo: 'esfera condutora (carga na superfície)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 'r' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em r', simbolo: r`E(r)`, expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's > R ? Q0/(4*pi*eps0*s^2) : 0' },
        { rotulo: 'Energia no campo (integral de ε₀E²/2 em todo o espaço)', simbolo: r`U = \int\frac{\varepsilon_0E^2}{2}dV`, expr: '1e9*energiaCampo()', unidade: 'nJ', teoria: '1e9*Q0^2/(8*pi*eps0*R)' },
        { rotulo: 'Autocapacitância (Q² / 2U)', simbolo: r`C = \frac{Q^2}{2U}`, expr: '1e12*Q0^2/(2*energiaCampo())', unidade: 'pF', teoria: '1e12*4*pi*eps0*R' },
      ],
      graficos: [
        {
          titulo: 'Densidade de energia u(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.005, ate: 0.1, rotulo: 'r', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'u', expr: '1e3*eps0*mag(E(rr, 0, 0))^2/2', unidade: 'mJ/m³' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Campo',
          texto: r`Num condutor a carga fica na superfície: $E = 0$ dentro. Fora, Gauss dá $\vec E = \dfrac{Q}{4\pi\varepsilon_0r^2}\hat r$.`,
          medidas: [0],
        },
        {
          titulo: '(b) Energia',
          texto: r`Com $u = \tfrac12\varepsilon_0E^2$ e cascas de volume $4\pi r^2dr$:
$$U = \int_R^\infty\frac{\varepsilon_0}{2}\left(\frac{Q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{Q^2}{8\pi\varepsilon_0R}.$$
A simulação integra $u$ do centro até muito longe.`,
          medidas: [1],
        },
        {
          titulo: '(c) Autocapacitância',
          texto: r`$U = \dfrac{Q^2}{2C}$ dá $C = 4\pi\varepsilon_0R$, o resultado da aula: o "outro condutor" é uma casca no infinito.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$E = 0$ para $r < R$; $\vec E = \dfrac{Q}{4\pi\varepsilon_0r^2}\hat r$ para $r > R$` },
        { item: '(b)', texto: r`$U = \dfrac{Q^2}{8\pi\varepsilon_0R}$` },
        { item: '(c)', texto: r`$C = 4\pi\varepsilon_0R$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Energia no campo elétrico', lab: 'energia' }],
        etapas: [
          {
            titulo: '(a) O campo da esfera condutora',
            texto: r`**O que se pede.** O campo em todo o espaço de uma esfera **condutora** de raio $R$, com carga $Q$, no vácuo.

**A ideia.**
- **Dentro do condutor**, em equilíbrio, o campo é zero: se não fosse, as cargas livres se moveriam. Pela lei de Gauss, isso também significa que não há carga no interior: toda a carga $Q$ fica na **superfície**.
- **Fora**, há simetria esférica e a lei de Gauss (formulário) se aplica com uma esfera de raio $r > R$: o fluxo é $E\cdot4\pi r^2$ e a carga dentro é $Q$.

**A conta.**
$$r < R:\ E = 0;\qquad r > R:\ E\cdot4\pi r^2 = \frac{Q}{\varepsilon_0}\ \Rightarrow\ \vec E = \frac{Q}{4\pi\varepsilon_0r^2}\,\hat r.$$
Fora, é o campo de uma carga pontual $Q$ no centro.`,
            passo: 0,
          },
          {
            titulo: '(b) A energia guardada no campo',
            texto: r`**O que se pede.** A energia total armazenada no campo da esfera, usando a densidade de energia.

**A ideia.** A energia de um sistema de cargas pode ser vista como guardada **no próprio campo**, com densidade (energia por volume)
$$u = \frac{\varepsilon_0}{2}E^2.$$
Essa expressão não está no formulário: ela é vista em aula, por exemplo calculando $U = \tfrac12QV$ para um capacitor plano e dividindo pelo volume entre as placas. A energia total é a soma de $u$ sobre todo o espaço onde há campo.

**Montagem.** O campo só existe fora da esfera ($r > R$) e só depende de $r$. Corta-se o espaço em **cascas esféricas** finas, de raio $r$ e espessura $dr$, com volume $dV = 4\pi r^2\,dr$ (área × espessura). Em cada casca, $u$ é constante.

**A conta.**
$$U = \int_R^\infty\frac{\varepsilon_0}{2}\left(\frac{Q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{Q^2}{8\pi\varepsilon_0}\int_R^\infty\frac{dr}{r^2} = \frac{Q^2}{8\pi\varepsilon_0}\cdot\frac1R.$$
$$U = \frac{Q^2}{8\pi\varepsilon_0R}.$$
Dentro da esfera não há campo, então não há energia lá.`,
            passo: 1,
          },
          {
            titulo: '(c) A autocapacitância da esfera',
            texto: r`**O que se pede.** A capacitância da esfera sozinha (autocapacitância), a partir da energia do item (b).

**A ideia.** A energia de um capacitor com carga $Q$ e capacitância $C$ é (formulário: $U = \tfrac12QV$, com $V = Q/C$)
$$U = \frac{Q^2}{2C}.$$
A esfera isolada funciona como um capacitor cujo "outro condutor" é uma casca esférica de raio infinito (a observação do enunciado), onde fica a carga $-Q$ e o potencial zero.

**A conta.** Igualando ao resultado do item (b):
$$\frac{Q^2}{2C} = \frac{Q^2}{8\pi\varepsilon_0R}\quad\Rightarrow\quad C = 4\pi\varepsilon_0R.$$

**A comparação com a aula.** É o mesmo resultado de $C = Q/V$ com o potencial da superfície, $V = \dfrac{Q}{4\pi\varepsilon_0R}$. Os dois caminhos concordam. **Em números:** uma esfera de 1 m de raio tem só uns $110$ pF; a Terra inteira, cerca de $0{,}7$ mF.`,
            passo: 2,
          },
        ],
        resultado: r`$U = Q^2/8\pi\varepsilon_0R$; $C = 4\pi\varepsilon_0R$.`,
        errosComuns: ['Integrar também dentro da esfera, onde o campo é zero.'],
        oficial: { resposta: 'E = 0 dentro e Q/(4πε₀r²) fora; U = Q²/(8πε₀R); C = 4πε₀R.' },
      },
    },
  ],
}

import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: base (ẑ, ê) do plano de rotação, com ω̂ = ẑ × ê, e θ medido de B ao plano. */
const TH = 'rad(theta)'
const naHaste = (d: string): [string, string, string] => [
  `(${d})*sin(w*t)*cos(${TH})`,
  `(${d})*sin(w*t)*sin(${TH})`,
  `(${d})*cos(w*t)`,
]
const OMEGA: [string, string, number] = [`0 - sin(${TH})`, `cos(${TH})`, 0]

/* Objetiva 4 */
const Icirc = 'fem/(Rr + ri)'

/* Discursiva: alcances x₁ e x₂ e massas. */
const xA = 'sqrt(8*mp*dV/(qe*B0^2))'
const xB = 'sqrt(8*mp*(1 + fm)*dV/(qe*B0^2))'
const vA = 'sqrt(2*qe*dV/mp)'
const vB = 'sqrt(2*qe*dV/(mp*(1 + fm)))'

/**
 * P2 de Física III, 2024/2, diurno, versão A (21/10/2024). Conferida com o
 * gabarito oficial: objetivas 1e, 2d, 3c, 4a, 5f, 6b, e a discursiva. A prova
 * imprime alternativas repetidas: (b) = (d) na Q1 e (a) = (c) na Q5.
 */
export const p2_2024_2_diurno: ProvaInput = {
  id: 'p2-2024-2-diurno',
  titulo: 'P2 · 2024/2 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão A · 21/10/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Haste girante com três cargas',
      resumo: 'Momento de dipolo magnético e energia num campo externo.',
      enunciado: r`Três cargas $q$ estão distribuídas regularmente pela extensão de uma haste fina isolante de comprimento $L$. Esse aparato, ao ser colocado para girar com velocidade angular constante $\omega$ em torno de um eixo ortogonal que passa por uma de suas extremidades, define um momento de dipolo magnético $\vec\mu$. Nessas condições, a energia de interação $U_B$ desse dipolo magnético com um campo magnético externo constante $\vec B$, que faz um ângulo $\theta$ com o plano de rotação da haste, será dada por:`,
      figura: [
        { pagina: 1, recorte: [0.51, 0.14, 0.905, 0.31] },
        { pagina: 1, recorte: [0.7, 0.345, 0.9, 0.56] },
        { pagina: 1, recorte: [0.54, 0.6, 0.9, 0.905] },
      ],
      cena: {
        escala: 0.01,
        extensao: 11,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [5, 5, 23], alvo: [0, 0, 0] },
        tempo: { escala: 1, unidade: 's', passo: 0.005 },
      },
      parametros: [
        { id: 'theta', rotulo: 'Ângulo de B com o plano', simbolo: r`\theta`, valor: 40, unidade: '°', min: 0, max: 90, passo: 1 },
        { id: 'w', rotulo: 'Velocidade angular', simbolo: r`\omega`, valor: 3, unidade: 'rad/s', min: 0.5, max: 8, passo: 0.1 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.05, max: 0.09, passo: 0.005 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 1, unidade: 'T', min: 0.2, max: 2, passo: 0.1 },
        { id: 'Qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-6, unidade: 'C', min: 2e-7, max: 3e-6, passo: 1e-7 },
      ],
      objetos: [
        { id: 'Bx', tipo: 'campoB', valor: ['B0', 0, 0], rotulo: 'B' },
        { id: 'c0', tipo: 'carga', q: 'Qq', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'c1', tipo: 'carga', q: 'Qq', pos: naHaste('L/2'), rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: 'Qq', pos: naHaste('L'), rotulo: 'q' },
        { id: 'haste', tipo: 'caminho', pontos: [[0, 0, 0], naHaste('L')], seta: 0.25 },
        { id: 'S1', tipo: 'espiraSensora', centro: [0, 0, 0], normal: OMEGA, raio: 'L/2', rotulo: 'anel 1' },
        { id: 'S2', tipo: 'espiraSensora', centro: [0, 0, 0], normal: OMEGA, raio: 'L', rotulo: 'anel 2' },
        { id: 'sw', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: OMEGA, comprimento: '4*cm', rotulo: 'ω e μ' },
      ],
      visual: { setasB: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente média de cada carga', simbolo: 'i = q\\omega/2\\pi', expr: 'Qq*w/(2*pi)', unidade: 'A' },
        { rotulo: 'μ em unidades de qωL²', simbolo: r`\mu/q\omega L^2`, expr: '(pi*(L/2)^2 + pi*L^2)*(Qq*w/(2*pi))/(Qq*w*L^2)', teoria: '5/8' },
        {
          rotulo: 'Energia −Σ iΦ, em unidades de qωL²B',
          simbolo: r`U_B/q\omega L^2B`,
          expr: "0 - (Qq*w/(2*pi))*(fluxoB('S1') + fluxoB('S2'))/(Qq*w*L^2*B0)",
          teoria: `5/8*sin(${TH})`,
        },
      ],
      passos: [
        {
          titulo: 'Carga girando é corrente',
          texto: r`Cada carga passa por um ponto do seu círculo $\omega/2\pi$ vezes por segundo, o que equivale a uma corrente média

$$i = \frac{q\omega}{2\pi}.$$

A carga do eixo não se move e não contribui. Sobram dois anéis, de raios $L/2$ e $L$.`,
          medidas: [0],
        },
        {
          titulo: 'Momento de dipolo',
          previsao: { pergunta: 'Qual anel contribui mais para μ?', opcoes: ['o de raio L/2', 'o de raio L', 'contribuem igual'], correta: 1 },
          texto: r`$$\mu = \sum iA = \frac{q\omega}{2\pi}\left[\pi\left(\frac L2\right)^2 + \pi L^2\right] = \frac58q\omega L^2.$$

Como $q > 0$, $\vec\mu$ tem o sentido de $\vec\omega$.`,
          medidas: [1],
        },
        {
          titulo: 'O ângulo certo',
          texto: r`Atenção: $\theta$ é medido entre $\vec B$ e o **plano** de rotação, não entre $\vec B$ e $\vec\mu$. O ângulo entre $\vec\mu$ e $\vec B$ é $\theta + 90°$, e daí

$$U_B = -\vec\mu\cdot\vec B = -\mu B\cos(\theta + 90°) = +\mu B\sin\theta.$$`,
          parametros: { theta: 40 },
          medidas: [2],
        },
        {
          titulo: 'Resposta',
          texto: r`$$U_B = \frac58q\omega L^2B\sin\theta.$$

Alternativa **(e)**. A medida da cena soma $-i\Phi$ nos dois anéis, sem usar a fórmula de $\vec\mu$. Com $\theta = 0$, $\vec B$ fica no plano e $U_B = 0$.`,
          parametros: { theta: 40 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Momento de dipolo magnético', lab: 'ampere' },
          { texto: 'Energia de um dipolo em campo externo' },
        ],
        etapas: [
          { titulo: 'Correntes', texto: r`Duas cargas giram, cada uma com $i = q\omega/2\pi$.`, passo: 0 },
          { titulo: 'Momento', texto: r`$\mu = i\pi[(L/2)^2 + L^2] = \frac58q\omega L^2$.`, passo: 1 },
          { titulo: 'Energia', texto: r`$\vec\mu$ é perpendicular ao plano, e $\vec B$ faz $\theta$ com ele: $U_B = -\vec\mu\cdot\vec B = \mu B\sin\theta$.`, passo: 2 },
        ],
        resultado: r`$U_B = \dfrac58q\omega L^2B\sin\theta$: alternativa **(e)**.`,
        errosComuns: [
          r`Tomar $\theta$ como o ângulo entre $\vec\mu$ e $\vec B$, o que troca seno por cosseno.`,
          r`Contar a carga do eixo: ela não gira.`,
          r`Usar a distância total $L$ para as duas cargas.`,
        ],
        oficial: { resposta: '(e)', observacao: r`A prova imprime (b) e (d) iguais.` },
      },
      alternativas: [
        { letra: 'a', texto: r`$U_B = -\dfrac58q\omega L^2B\cos\theta$`, porque: r`Acerta $\mu$, mas trata $\theta$ como o ângulo entre $\vec\mu$ e $\vec B$.` },
        { letra: 'b', texto: r`$U_B = -2q\omega L^2B\sin\theta$`, porque: r`Módulo errado: não sai de $\frac{q\omega}{2\pi}\sum\pi r^2$.` },
        { letra: 'c', texto: r`$U_B = \dfrac95q\omega L^2B\sin\theta$`, porque: r`O fator é $5/8$.` },
        { letra: 'd', texto: r`$U_B = -2q\omega L^2B\sin\theta$`, porque: r`Igual à (b): módulo errado.` },
        { letra: 'e', texto: r`$U_B = \dfrac58q\omega L^2B\sin\theta$`, correta: true, porque: r`Correta: $\mu = \frac58q\omega L^2$, e o ângulo entre $\vec\mu$ e $\vec B$ é $90° + \theta$.` },
        { letra: 'f', texto: r`$U_B = \dfrac74q\omega L^2B\cos\theta$`, porque: r`Fator e função trigonométrica errados.` },
        { letra: 'g', texto: r`$U_B = \dfrac98q\omega L^2B\cos\theta$`, porque: r`Fator e função trigonométrica errados.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Gaussiana com tampas dentro dos condutores',
      resumo: 'Placa carregada entre duas placas condutoras neutras.',
      enunciado: r`Duas placas condutoras neutras, infinitas e paralelas, com a mesma espessura, estão separadas por uma certa distância. Entre elas, insere-se uma terceira placa infinita fina (bidimensional) e paralela às outras, com densidade superficial de carga uniforme $\sigma > 0$. Após atingir o equilíbrio eletrostático, considere uma superfície gaussiana cilíndrica $S$, cujas tampas circulares de áreas $A$ estão no interior das respectivas placas condutoras, conforme a figura. O fluxo do campo elétrico pela superfície gaussiana é dado pelo item:`,
      figura: [
        { pagina: 2, recorte: [0.105, 0.125, 0.5, 0.305] },
        { pagina: 2, recorte: [0.29, 0.315, 0.43, 0.63] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [4, 4, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade da placa central', simbolo: r`\sigma`, valor: 1e-8, unidade: 'C/m²', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'c', rotulo: 'Distância às faces internas', simbolo: 'c', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'w', rotulo: 'Espessura dos condutores', simbolo: 'w', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
      ],
      objetos: [
        { id: 'meio', tipo: 'planoInfinito', sigma: 'sig', ponto: [0, 0, 0], normal: 'x', rotulo: 'σ' },
        { id: 'i1', tipo: 'planoInfinito', sigma: '0-sig/2', ponto: ['0-c', 0, 0], normal: 'x' },
        { id: 'e1', tipo: 'planoInfinito', sigma: 'sig/2', ponto: ['-c - w', 0, 0], normal: 'x' },
        { id: 'i2', tipo: 'planoInfinito', sigma: '0-sig/2', ponto: ['c', 0, 0], normal: 'x' },
        { id: 'e2', tipo: 'planoInfinito', sigma: 'sig/2', ponto: ['c + w', 0, 0], normal: 'x' },
        { id: 'S', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'x', raio: 0.015, altura: '2*c + w', rotulo: 'S' },
        { id: 'tA', tipo: 'rotulo', pos: ['0 - c - w/2', 0.05, 0], texto: 'condutor' },
        { id: 'tB', tipo: 'rotulo', pos: ['c + w/2', 0.05, 0], texto: 'condutor' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo dentro do condutor', simbolo: 'E', expr: 'x(E(c + w/2, 0, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Campo entre as placas', simbolo: 'E', expr: 'x(E(c/2, 0, 0))', unidade: 'V/m', teoria: 'sig/(2*eps0)' },
        { rotulo: 'Campo fora de tudo', simbolo: 'E', expr: 'x(E(c + w + 0.01, 0, 0))', unidade: 'V/m', teoria: 'sig/(2*eps0)' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('S')", unidade: 'V·m', teoria: 0 },
        { rotulo: 'Carga em S, em unidades de σA', simbolo: r`Q_\text{int}/\sigma A`, expr: "Qenc('S')/(sig*pi*0.015^2)", teoria: 0 },
        { rotulo: 'Densidade na face interna, em σ', simbolo: r`\sigma_i/\sigma`, expr: '(0 - eps0*x(E(0.95*c, 0, 0)))/sig', teoria: '-1/2' },
      ],
      passos: [
        {
          titulo: 'O que acontece nos condutores',
          texto: r`O campo da placa central polariza os condutores. Em equilíbrio, $\vec E = 0$ dentro deles. Por simetria, cada face interna fica com $-\sigma/2$, e cada face externa, com $+\sigma/2$: as placas continuam neutras.`,
          medidas: [0, 5],
        },
        {
          titulo: 'Olhar o fluxo por partes',
          previsao: { pergunta: 'Sobre as tampas de S, dentro dos condutores, o campo é…', opcoes: ['nulo', 'σ/2ε₀', 'σ/ε₀'], correta: 0 },
          texto: r`Nas tampas $\vec E = 0$, pois estão dentro do metal. Na lateral, $\vec E$ é paralelo à superfície. Nenhuma parte contribui:

$$\oint_S\vec E\cdot d\vec A = 0.$$`,
          destacar: ['S'],
          medidas: [3],
        },
        {
          titulo: 'Conferir com a carga interna',
          texto: r`Dentro de $S$ há a carga da placa central, $\sigma A$, e as duas faces internas, $-\sigma A/2$ cada. Soma zero, como a lei de Gauss exige.

Alternativa **(d)**.`,
          medidas: [4, 1, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio', lab: 'gauss' },
          { texto: 'Lei de Gauss', lab: 'gauss' },
        ],
        etapas: [
          { titulo: 'Tampas', texto: r`Estão no metal, onde $\vec E = 0$.`, passo: 1 },
          { titulo: 'Lateral', texto: r`$\vec E$ é paralelo à lateral: $\vec E\cdot d\vec A = 0$.`, passo: 1 },
          { titulo: 'Conferência', texto: r`$Q_\text{int} = \sigma A - 2(\sigma/2)A = 0$.`, passo: 2 },
        ],
        resultado: r`Fluxo nulo: alternativa **(d)**.`,
        errosComuns: [
          r`Contar só a placa central e responder $\sigma A/\varepsilon_0$: as faces internas dos condutores também estão dentro de $S$.`,
          r`Achar que a carga induzida é $-\sigma$ em cada face: as duas repartem $\sigma$.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{2\sigma A}{\varepsilon_0}$`, porque: r`Não há carga negativa líquida em $S$.` },
        { letra: 'b', texto: r`$\dfrac{\sigma A}{\varepsilon_0}$`, porque: r`Esquece as cargas induzidas nas faces internas.` },
        { letra: 'c', texto: r`$\dfrac{2\sigma A}{\varepsilon_0}$`, porque: r`Valeria se fosse $2\sigma A$ a carga interna.` },
        { letra: 'd', texto: '$0$', correta: true, porque: r`Correta: $\vec E = 0$ nas tampas e $\vec E\parallel$ lateral.` },
        { letra: 'e', texto: r`$-\dfrac{\sigma A}{\varepsilon_0}$`, porque: r`Conta só as cargas induzidas.` },
        { letra: 'f', texto: r`$\dfrac{3\sigma A}{\varepsilon_0}$`, porque: r`Sem sentido físico aqui.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Potencial com referência em s = 2a',
      resumo: 'Cilindro condutor carregado; V nulo fora do infinito.',
      enunciado: r`Um cilindro condutor muito longo ao longo do eixo $z$ possui raio $a$, tem uma densidade superficial de carga $\sigma$ uniforme e estacionária e está no vácuo. Considere que o potencial elétrico gerado por essa distribuição é nulo no ponto $(x = 2a; y = 0; z = 0)$, ou seja, $V(2a, 0, 0) = 0$. Determine o potencial elétrico gerado por esse cilindro em um ponto em sua superfície.`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.14, 0.905, 0.275] },
        { pagina: 2, recorte: [0.68, 0.28, 0.84, 0.59] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 1e-8, unidade: 'C/m²', min: -2e-8, max: 2e-8, passo: 1e-9 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'rP', rotulo: 'Posição da sonda', simbolo: 's', valor: 0.06, unidade: 'm', min: 0.005, max: 0.1, passo: 0.001 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroInfinito', lambda: '2*pi*a*sig', ponto: [0, 0, 0], direcao: 'z', raio: 'a', oco: true, rotulo: 'σ' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rP', 0, 0], arraste: { param: 'rP', eixo: 'x' }, rotulo: 'sonda' },
        { id: 'tR', tipo: 'rotulo', pos: ['2*a', -0.012, 0], texto: 'V = 0' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo na sonda', simbolo: 'E_s', expr: 'x(E(rP, 0, 0))', unidade: 'V/m', teoria: 'rP < a ? 0 : sig*a/(eps0*rP)' },
        { rotulo: 'Potencial na sonda', simbolo: 'V', expr: 'V(rP, 0, 0) - V(2*a, 0, 0)', unidade: 'V', teoria: 'sig*a/eps0*ln(2*a/max(rP, a))' },
        { rotulo: 'Potencial na superfície', simbolo: 'V(a)', expr: 'V(a, 0, 0) - V(2*a, 0, 0)', unidade: 'V', teoria: 'sig*a/eps0*ln(2)' },
      ],
      graficos: [
        {
          titulo: 'Potencial V(s), com V(2a) = 0',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.05*a', ate: '3*a', rotulo: 's', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(ss, 0, 0) - V(2*a, 0, 0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'Por que não usar V(∞) = 0',
          texto: r`O cilindro é infinito, e o potencial de uma distribuição infinita diverge longe dela. Por isso a prova fixa a referência num ponto finito, $s = 2a$.`,
        },
        {
          titulo: 'Campo fora do cilindro',
          texto: r`Num gaussiana cilíndrica de raio $s > a$ e comprimento $\ell$:

$$2\pi s\ell E = \frac{\sigma2\pi a\ell}{\varepsilon_0} \quad\Rightarrow\quad E(s) = \frac{\sigma a}{\varepsilon_0s}.$$`,
          parametros: { rP: 0.06 },
          medidas: [0],
        },
        {
          titulo: 'Integrar entre s = a e s = 2a',
          previsao: { pergunta: 'Com σ > 0, o potencial na superfície é…', opcoes: ['positivo', 'negativo', 'nulo'], correta: 0 },
          texto: r`$$V(a) - V(2a) = \int_a^{2a}\frac{\sigma a}{\varepsilon_0s}\,ds = \frac{\sigma a}{\varepsilon_0}\ln2.$$

Faz sentido: com $\sigma > 0$, o potencial é maior perto da carga. Alternativa **(c)**.`,
          parametros: { rP: 0.04 },
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Campo', texto: r`$E = \sigma a/\varepsilon_0s$ em $s > a$.`, passo: 1 },
          { titulo: 'Potencial', texto: r`$V(a) = \int_a^{2a}E\,ds = \dfrac{\sigma a}{\varepsilon_0}\ln2$.`, passo: 2 },
        ],
        resultado: r`$V(a) = \dfrac{\sigma a}{\varepsilon_0}\ln2$: alternativa **(c)**.`,
        errosComuns: [
          r`Inverter os limites e obter $\ln(1/2)$, com sinal negativo.`,
          r`Usar $\lambda/(2\pi\varepsilon_0)$ sem cancelar o $2\pi$ de $\lambda = 2\pi a\sigma$.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left(\dfrac{\sigma a}{\varepsilon_0}\right)\ln(1/2)$`, porque: r`Limites invertidos: daria potencial negativo.` },
        { letra: 'b', texto: r`$\left(\dfrac{\sigma a}{2\pi\varepsilon_0}\right)\ln(1/2)$`, porque: r`Limites invertidos, e sobra um $2\pi$.` },
        { letra: 'c', texto: r`$\left(\dfrac{\sigma a}{\varepsilon_0}\right)\ln(2)$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`$\left(\dfrac{\sigma a}{2\pi\varepsilon_0}\right)\ln(2)$`, porque: r`Sobra um $2\pi$: ele cancela em $\lambda = 2\pi a\sigma$.` },
        { letra: 'e', texto: '$0$', porque: r`$V$ é nulo em $s = 2a$, não na superfície.` },
        { letra: 'f', texto: r`$\dfrac{\sigma a}{\varepsilon_0}$`, porque: r`Falta a integral: o campo não é constante.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Potência perdida dentro da bateria',
      resumo: 'Lanterna de 8 Ω com bateria de 10 V e 2 Ω internos.',
      enunciado: r`Uma bateria possui uma fem de $10{,}0\,\text{V}$ e tem uma resistência interna ôhmica de $2{,}0\,\Omega$. Essa bateria alimenta uma lanterna que possui resistência ôhmica de $8{,}0\,\Omega$. Ao determinar a potência dissipada pela resistência interna da bateria, encontra-se:`,
      figura: { pagina: 3, recorte: [0.105, 0.15, 0.5, 0.24] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'fem', rotulo: 'Fem', simbolo: r`\mathcal E`, valor: 10, unidade: 'V', min: 2, max: 20, passo: 0.5 },
        { id: 'ri', rotulo: 'Resistência interna', simbolo: 'r', valor: 2, unidade: 'Ω', min: 0.5, max: 5, passo: 0.5 },
        { id: 'Rr', rotulo: 'Resistência da lanterna', simbolo: 'R', valor: 8, unidade: 'Ω', min: 1, max: 20, passo: 0.5 },
      ],
      objetos: [
        { id: 'res', tipo: 'condutor', a: [-0.02, 0.04, 0], b: [0.02, 0.04, 0], raio: 0.004, I: Icirc },
        { id: 'bat', tipo: 'condutor', a: [-0.03, -0.04, 0], b: [-0.005, -0.04, 0], raio: 0.006, I: Icirc },
        { id: 'int', tipo: 'condutor', a: [0.005, -0.04, 0], b: [0.03, -0.04, 0], raio: 0.003, I: Icirc },
        { id: 'w1', tipo: 'caminho', pontos: [[-0.03, -0.04, 0], [-0.06, -0.04, 0], [-0.06, 0.04, 0], [-0.02, 0.04, 0]], seta: 0.5 },
        { id: 'w2', tipo: 'caminho', pontos: [[0.02, 0.04, 0], [0.06, 0.04, 0], [0.06, -0.04, 0], [0.03, -0.04, 0]], seta: 0.5 },
        { id: 'w3', tipo: 'caminho', pontos: [[0.005, -0.04, 0], [-0.005, -0.04, 0]], seta: 0.5 },
        { id: 'tR', tipo: 'rotulo', pos: [0, 0.053, 0], texto: 'lanterna, R' },
        { id: 'tb', tipo: 'rotulo', pos: [-0.018, -0.053, 0], texto: 'fem' },
        { id: 'tr', tipo: 'rotulo', pos: [0.018, -0.053, 0], texto: 'r interna' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Corrente', simbolo: 'I', expr: Icirc, unidade: 'A', teoria: 'fem/(Rr + ri)' },
        { rotulo: 'Potência na resistência interna', simbolo: 'P_r', expr: `(${Icirc})^2*ri`, unidade: 'W', teoria: 'fem^2*ri/(Rr + ri)^2' },
        { rotulo: 'Potência na lanterna', simbolo: 'P_R', expr: `(${Icirc})^2*Rr`, unidade: 'W' },
        { rotulo: 'Potência da fem', simbolo: r`\mathcal E I`, expr: `fem*${Icirc}`, unidade: 'W', teoria: `(${Icirc})^2*(Rr + ri)` },
      ],
      passos: [
        {
          titulo: 'As resistências estão em série',
          texto: r`A mesma corrente passa pela lanterna e pela resistência interna:

$$I = \frac{\mathcal E}{R + r} = \frac{10}{8 + 2} = 1\,\text{A}.$$`,
          medidas: [0],
        },
        {
          titulo: 'Potência em cada resistor',
          previsao: { pergunta: 'A potência dissipada na bateria é…', opcoes: ['2 W', '8 W', '50 W'], correta: 0 },
          texto: r`$$P_r = rI^2 = 2\cdot1^2 = 2{,}0\,\text{W}.$$

Na lanterna, são $8\,\text{W}$. A soma é a potência fornecida pela fem, $\mathcal EI = 10\,\text{W}$.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`Alternativa **(a)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Circuitos e potência', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Corrente', texto: r`$I = \mathcal E/(R+r) = 1\,\text{A}$.`, passo: 0 },
          { titulo: 'Potência', texto: r`$P_r = rI^2 = 2\,\text{W}$.`, passo: 1 },
        ],
        resultado: r`$2{,}0\,\text{W}$: alternativa **(a)**.`,
        errosComuns: [
          r`Usar $P = \mathcal E^2/r$: a ddp na resistência interna não é $\mathcal E$.`,
          r`Responder a potência da lanterna.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$2{,}0\,\text{W}$`, correta: true, porque: r`Correta: $rI^2$ com $I = 1\,\text{A}$.` },
        { letra: 'b', texto: r`$25{,}0\,\text{W}$`, porque: r`Não sai de $I = 1\,\text{A}$.` },
        { letra: 'c', texto: r`$50{,}0\,\text{W}$`, porque: r`É $\mathcal E^2/r$: toma toda a fem sobre a resistência interna.` },
        { letra: 'd', texto: r`$12{,}5\,\text{W}$`, porque: r`É $\mathcal E^2/R$: ignora a resistência interna no circuito.` },
        { letra: 'e', texto: r`$8{,}0\,\text{W}$`, porque: r`É a potência na lanterna.` },
        { letra: 'f', texto: r`$100{,}0\,\text{W}$`, porque: r`É $\mathcal E^2$, sem dividir por resistência alguma.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Carga em C₁ num arranjo misto',
      resumo: 'Paralelo no meio, em série com dois capacitores.',
      enunciado: r`A figura mostra um arranjo de capacitores, submetido a uma diferença de potencial $\Delta V = V_a - V_b$ entre os pontos $a$ e $b$. Calcule a carga acumulada no capacitor $C_1$, considerando que as capacitâncias são dadas, respectivamente, por $C_1 = C$, $C_2 = 2C$, $C_3 = C$ e $C_4 = C/2$, com $C$ conhecido.`,
      figura: [
        { pagina: 3, recorte: [0.1, 0.515, 0.495, 0.63] },
        { pagina: 3, recorte: [0.25, 0.63, 0.47, 0.84] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [0, 2, 21], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Vab', rotulo: 'ddp entre a e b', simbolo: 'V', valor: 12, unidade: 'V', min: 2, max: 30, passo: 1 },
        { id: 'lado', rotulo: 'Lado de C₁', simbolo: r`\sqrt{A}`, valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'd0', rotulo: 'Separação das placas', simbolo: 'd', valor: 0.012, unidade: 'm', min: 0.01, max: 0.016, passo: 0.001 },
      ],
      objetos: [
        { id: 'c1', tipo: 'capacitor', centro: [-0.06, 0, 0], eixo: 'x', lado: 'lado', d: 'd0', Q: '0.3*eps0*lado^2/d0*Vab' },
        { id: 'c2', tipo: 'capacitor', centro: [0, 0.04, 0], eixo: 'x', lado: 'lado*sqrt(2)', d: 'd0', Q: '0.2*eps0*lado^2/d0*Vab' },
        { id: 'c3', tipo: 'capacitor', centro: [0, -0.04, 0], eixo: 'x', lado: 'lado', d: 'd0', Q: '0.1*eps0*lado^2/d0*Vab' },
        { id: 'c4', tipo: 'capacitor', centro: [0.06, 0, 0], eixo: 'x', lado: 'lado/sqrt(2)', d: 'd0', Q: '0.3*eps0*lado^2/d0*Vab' },
        { id: 'w1', tipo: 'caminho', pontos: [[-0.095, 0, 0], ['-0.06 - d0/2', 0, 0]], seta: 0.5 },
        { id: 'w2', tipo: 'caminho', pontos: [['-0.06 + d0/2', 0, 0], [-0.03, 0, 0], [-0.03, 0.04, 0], ['0 - d0/2', 0.04, 0]], seta: 0.3 },
        { id: 'w3', tipo: 'caminho', pontos: [[-0.03, 0, 0], [-0.03, -0.04, 0], ['0 - d0/2', -0.04, 0]], seta: 0.6 },
        { id: 'w4', tipo: 'caminho', pontos: [['d0/2', 0.04, 0], [0.03, 0.04, 0], [0.03, 0, 0], ['0.06 - d0/2', 0, 0]], seta: 0.4 },
        { id: 'w5', tipo: 'caminho', pontos: [['d0/2', -0.04, 0], [0.03, -0.04, 0], [0.03, 0, 0]], seta: 0.4 },
        { id: 'w6', tipo: 'caminho', pontos: [['0.06 + d0/2', 0, 0], [0.095, 0, 0]], seta: 0.5 },
        { id: 'ta', tipo: 'rotulo', pos: [-0.095, 0.01, 0], texto: 'a' },
        { id: 'tb', tipo: 'rotulo', pos: [0.095, 0.01, 0], texto: 'b' },
      ],
      visual: { setasE: true, densidade: 19, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'C₂/C₁ (das geometrias)', simbolo: 'C_2/C_1', expr: "C('c2')/C('c1')", teoria: 2 },
        { rotulo: 'C₃/C₁', simbolo: 'C_3/C_1', expr: "C('c3')/C('c1')", teoria: 1 },
        { rotulo: 'C₄/C₁', simbolo: 'C_4/C_1', expr: "C('c4')/C('c1')", teoria: 0.5 },
        { rotulo: 'ddp em C₃ menos ddp em C₂', simbolo: 'V_3 - V_2', expr: "Vcap('c3') - Vcap('c2')", unidade: 'V', teoria: 0 },
        { rotulo: 'Soma das ddps em série', simbolo: 'V_1 + V_2 + V_4', expr: "Vcap('c1') + Vcap('c2') + Vcap('c4')", unidade: 'V', teoria: 'Vab' },
        { rotulo: 'Carga em C₁, em unidades de CV', simbolo: 'Q_1/CV', expr: "Q('c1')/(C('c1')*Vab)", teoria: '3/10' },
      ],
      passos: [
        {
          titulo: 'Reduzir o paralelo',
          texto: r`$C_2$ e $C_3$ estão ligados aos mesmos dois nós: mesma ddp, e as cargas se somam:

$$C_{23} = C_2 + C_3 = 3C.$$

Na cena, cada capacitor tem a geometria que dá a sua capacitância.`,
          destacar: ['c2', 'c3'],
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: 'Agora três em série',
          previsao: { pergunta: 'Em série, a capacitância equivalente é…', opcoes: ['maior que a maior delas', 'menor que a menor delas', 'a média'], correta: 1 },
          texto: r`$C_1$, $C_{23}$ e $C_4$ estão em série:

$$\frac{1}{C_\text{eq}} = \frac1C + \frac{1}{3C} + \frac2C = \frac{10}{3C} \quad\Rightarrow\quad C_\text{eq} = \frac{3C}{10}.$$`,
          medidas: [4],
        },
        {
          titulo: 'A carga',
          texto: r`Em série, todos têm a mesma carga, igual à do equivalente:

$$Q_1 = C_\text{eq}\,V = \frac{3}{10}CV.$$

Alternativa **(f)**. Os dois ramos do paralelo repartem $Q_1$: $C_2$ fica com $2/3$, e $C_3$, com $1/3$.`,
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Paralelo', texto: r`$C_{23} = 3C$.`, passo: 0 },
          { titulo: 'Série', texto: r`$C_\text{eq} = 3C/10$.`, passo: 1 },
          { titulo: 'Carga', texto: r`$Q_1 = C_\text{eq}V$.`, passo: 2 },
        ],
        resultado: r`$Q_1 = \dfrac{3}{10}CV$: alternativa **(f)**.`,
        errosComuns: [
          r`Somar as capacitâncias em série, como se fossem resistores.`,
          r`Esquecer de inverter no fim: $10/3C$ é $1/C_\text{eq}$.`,
        ],
        oficial: { resposta: '(f)', observacao: r`A prova imprime (a) e (c) iguais.` },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{11}{6}CV$`, porque: r`Soma capacitâncias como se estivessem em paralelo.` },
        { letra: 'b', texto: r`$\dfrac{10}{3}CV$`, porque: r`Não inverte: $10/3C$ é o inverso de $C_\text{eq}$.` },
        { letra: 'c', texto: r`$\dfrac{11}{6}CV$`, porque: r`Igual à (a).` },
        { letra: 'd', texto: '$CV$', porque: r`Trata $C_1$ como se toda a ddp estivesse sobre ele.` },
        { letra: 'e', texto: r`$\dfrac{6}{11}CV$`, porque: r`Trata $C_{23}$ como $C_2$ e $C_3$ em série.` },
        { letra: 'f', texto: r`$\dfrac{3}{10}CV$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Força num lado de um circuito',
      resumo: 'B = C(x + y)ẑ varia ao longo do segmento.',
      enunciado: r`Considere um circuito condutor quadrado de lado $L$, no qual flui uma corrente estacionária $I$, que se encontra em um certo instante na posição indicada pela figura. Na região, existe um campo magnético da forma $\vec B = C(x + y)\hat z$, onde $C$ é uma constante positiva. Calcule, neste mesmo instante, a força magnética sobre o segmento $ab$ do circuito.`,
      figura: [
        { pagina: 3, recorte: [0.51, 0.145, 0.905, 0.275] },
        { pagina: 3, recorte: [0.685, 0.28, 0.84, 0.545] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 17], alvo: [3, 3, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 5, unidade: 'A', min: 1, max: 15, passo: 0.5 },
        { id: 'CC', rotulo: 'Constante', simbolo: 'C', valor: 10, unidade: 'T/m', min: 2, max: 20, passo: 1 },
        { id: 'L', rotulo: 'Lado', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bf', tipo: 'campoB', valor: '[0, 0, CC*(x + y)]' },
        { id: 'base', tipo: 'fio', I: 'I0', a: [0, 0, 0], b: ['L', 0, 0] },
        { id: 'ab', tipo: 'fio', I: 'I0', a: ['L', 0, 0], b: ['L', 'L', 0], rotulo: 'ab' },
        { id: 'topo', tipo: 'fio', I: 'I0', a: ['L', 'L', 0], b: [0, 'L', 0] },
        { id: 'esq', tipo: 'fio', I: 'I0', a: [0, 'L', 0], b: [0, 0, 0] },
        { id: 'F', tipo: 'seta', papel: 'forca', origem: ['L', 'L/2', 0], vetor: "forca('ab','Bf')", comprimento: '2.5*cm', rotulo: 'F' },
        { id: 'ta', tipo: 'rotulo', pos: ['L + 0.006', -0.005, 0], texto: 'a' },
        { id: 'tb', tipo: 'rotulo', pos: ['L + 0.006', 'L + 0.005', 0], texto: 'b' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy', fontes: ['Bf'] },
      medidas: [
        { rotulo: 'Campo em a', simbolo: 'B(a)', expr: "z(Bde('Bf', L, 0, 0))", unidade: 'T', teoria: 'CC*L' },
        { rotulo: 'Campo em b', simbolo: 'B(b)', expr: "z(Bde('Bf', L, L, 0))", unidade: 'T', teoria: '2*CC*L' },
        { rotulo: 'Força em x (integração no fio)', simbolo: 'F_x', expr: "x(forca('ab','Bf'))", unidade: 'N', teoria: '1.5*I0*CC*L^2' },
        { rotulo: 'Força em y', simbolo: 'F_y', expr: "y(forca('ab','Bf'))", unidade: 'N', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'O campo varia ao longo de ab',
          texto: r`Em $ab$, $x = L$ é fixo, e $y$ vai de 0 a $L$: o campo cresce de $CL$ até $2CL$. Não dá para usar $F = ILB$ direto.`,
          destacar: ['ab'],
          medidas: [0, 1],
        },
        {
          titulo: 'Direção',
          previsao: { pergunta: 'A força em ab aponta para…', opcoes: ['+x̂', '−x̂', '+ŷ', '+ẑ'], correta: 0 },
          texto: r`A corrente sobe em $ab$: $d\vec\ell = dy\,\hat y$. Com $\vec B$ em $\hat z$, $\hat y\times\hat z = +\hat x$.`,
          destacar: ['ab', 'F'],
        },
        {
          titulo: 'Integrar',
          texto: r`$$\vec F = I\int_0^LC(L + y)\,dy\;\hat x = IC\left(L^2 + \frac{L^2}{2}\right)\hat x = \frac{3ICL^2}{2}\hat x.$$

Alternativa **(b)**. É o mesmo que usar o campo médio, $\frac32CL$, porque $B$ é linear em $y$.`,
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }],
        etapas: [
          { titulo: 'Elemento', texto: r`$d\vec F = I\,dy\,\hat y\times C(L+y)\hat z = IC(L+y)\,dy\,\hat x$.`, passo: 1 },
          { titulo: 'Integral', texto: r`$\vec F = \frac32ICL^2\,\hat x$.`, passo: 2 },
        ],
        resultado: r`$\vec F = \dfrac{3ICL^2}{2}\hat x$: alternativa **(b)**.`,
        errosComuns: [
          r`Usar $B$ constante, com o valor em uma ponta.`,
          r`Esquecer o $L$ de $x = L$ e integrar só $Cy$, o que dá o módulo $ICL^2/2$.`,
          r`Errar o sentido de $d\vec\ell$.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{ICL^2}{2}\hat y$`, porque: r`Direção errada, e esquece o termo com $x = L$.` },
        { letra: 'b', texto: r`$\dfrac{3ICL^2}{2}\hat x$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\dfrac{3ICL^2}{2}\hat y$`, porque: r`Módulo certo, direção errada: $\hat y\times\hat z = \hat x$.` },
        { letra: 'd', texto: r`$-\dfrac{ICL^2}{2}\hat x$`, porque: r`Esquece $x = L$ e erra o sentido.` },
        { letra: 'e', texto: r`$-\dfrac{ICL^2}{2}\hat z$`, porque: r`A força é perpendicular a $\vec B$, que aponta em $\hat z$.` },
        { letra: 'f', texto: r`$\dfrac{3ICL^2}{2}\hat z$`, porque: r`A força é perpendicular a $\vec B$.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Espectrômetro de massa',
      resumo: 'Da ddp ao ponto de impacto, resolução em massa e potencial dos íons.',
      enunciado: r`Um feixe de íons de carga $q > 0$ e massas variadas é produzido, essencialmente em repouso, por uma fonte $\mathcal S$ e acelerado por uma diferença de potencial $\Delta V$ mantida entre a fonte e a base inferior que delimita a região onde existe um campo magnético interno constante $\vec B = B\hat z$, responsável pela deflexão do feixe. Ao final, os íons atingem uma chapa fotográfica que registra a distância horizontal $x$ de cada um em relação ao ponto $\mathcal P$ de entrada.

(a) Determine, em função de $q$, $m$ e $\Delta V$, a velocidade $\vec v$ com que um íon entra ortogonalmente pela base, em $\mathcal P$. (b) Obtenha a massa $m$ em termos de $q$, $B$, $\Delta V$ e $x$. (c) Se dois íons, de massas $m_1 = m$ e $m_2 = m + \Delta m$, com $\Delta m \ll m$, atingem a chapa em pontos separados por $\Delta x$, obtenha a relação entre $\Delta m$ e $\Delta x$. Sugestão: $(a+b)^2 \approx a^2 + 2ab$ se $a \gg b$. (d) Determine a energia potencial elétrica de interação $U_E$ entre os dois íons nas posições de registro. (e) Obtenha o potencial elétrico $V_{\mathcal P}$ produzido por eles em $\mathcal P$.`,
      figura: [
        { pagina: 4, recorte: [0.105, 0.18, 0.505, 0.74] },
        { pagina: 4, recorte: [0.53, 0.16, 0.87, 0.52] },
      ],
      cena: {
        escala: 0.01,
        extensao: 7,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [3, 2, 15], alvo: [3, 1.5, 0] },
        tempo: { escala: 6e-8, unidade: 'ns', passo: 1e-9, duracao: 3e-7 },
      },
      parametros: [
        { id: 'dV', rotulo: 'ddp de aceleração', simbolo: r`\Delta V`, valor: 1000, unidade: 'V', min: 500, max: 2000, passo: 50 },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.2, unidade: 'T', min: 0.15, max: 0.3, passo: 0.01 },
        { id: 'fm', rotulo: 'Razão Δm/m', simbolo: r`\Delta m/m`, valor: 0.05, min: 0.01, max: 0.25, passo: 0.01 },
        {
          id: 'reg',
          rotulo: 'Íons registrados na chapa',
          valor: 0,
          opcoes: [
            { valor: 0, rotulo: 'em voo' },
            { valor: 1, rotulo: 'na chapa' },
          ],
        },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [-0.02, 0, -0.02], max: [0.1, 0.06, 0.02] } },
        { id: 'i1', tipo: 'particula', rotulo: 'm₁', q: 'qe', m: 'mp', pos: [0, 0, 0], v: [0, vA, 0], parada: 'y < 0' },
        { id: 'i2', tipo: 'particula', rotulo: 'm₂', q: 'qe', m: 'mp*(1 + fm)', pos: [0, 0, 0], v: [0, vB, 0], parada: 'y < 0' },
        { id: 'r1', tipo: 'carga', ativo: 'reg==1', q: 'qe', pos: [xA, 0, 0], rotulo: 'q' },
        { id: 'r2', tipo: 'carga', ativo: 'reg==1', q: 'qe', pos: [xB, 0, 0], rotulo: 'q' },
        { id: 'chapa', tipo: 'caminho', pontos: [[-0.015, 0, 0], [0.09, 0, 0]], seta: 0.95, rotulo: 'chapa' },
        { id: 'tP', tipo: 'rotulo', pos: [-0.005, -0.006, 0], texto: 'P' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy', fontes: ['Bz'] },
      medidas: [
        { rotulo: 'Velocidade de m₁ deduzida do alcance', simbolo: 'qBx/2m', expr: "t > 1.05*pi*mp/(qe*B0) ? qe*B0*rastroSpan('i1', 'x')/(2*mp) : 0/0", unidade: 'm/s', teoria: vA },
        { rotulo: 'Alcance de m₁ no rastro', simbolo: 'x_1', expr: "t > 1.05*pi*mp/(qe*B0) ? rastroSpan('i1', 'x') : 0/0", unidade: 'm', teoria: xA },
        { rotulo: 'Alcance de m₂ no rastro', simbolo: 'x_2', expr: "t > 1.05*pi*mp*(1 + fm)/(qe*B0) ? rastroSpan('i2', 'x') : 0/0", unidade: 'm', teoria: xB },
        { rotulo: 'Massa recuperada de x₁', simbolo: r`qB^2x^2/8\Delta V`, expr: "t > 1.05*pi*mp/(qe*B0) ? qe*B0^2*rastroSpan('i1', 'x')^2/(8*dV) : 0/0", unidade: 'kg', teoria: 'mp' },
        { rotulo: 'Δm estimado por Δx, em unidades de m', simbolo: r`\Delta m/m`, expr: `sqrt(qe*B0^2/(2*mp*dV))*(${xB} - ${xA})` },
        { rotulo: 'U_E, em unidades de k₀q²/Δx', simbolo: 'U_E\\Delta x/k_0q^2', ativo: 'reg==1', expr: `qe*Vde('r1', ${xB}, 0, 0)*(${xB} - ${xA})/(k0*qe^2)`, teoria: 1 },
        { rotulo: 'V em P, em unidades de k₀q(1/x₁ + 1/x₂)', simbolo: 'V_P/\\ldots', ativo: 'reg==1', expr: `(Vde('r1', 0, 0, 0) + Vde('r2', 0, 0, 0))/(k0*qe*(1/${xA} + 1/${xB}))`, teoria: 1 },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Velocidade na entrada',
          texto: r`Partindo do repouso, a energia potencial vira cinética:

$$\frac12mv^2 = q\Delta V \quad\Rightarrow\quad \vec v = \sqrt{\frac{2q\Delta V}{m}}\;\hat y.$$

Rode a simulação: os íons entram por $\mathcal P$, para cima.`,
          parametros: { reg: 0, fm: 0.05 },
        },
        {
          item: 'b',
          titulo: '(b) Massa pelo ponto de impacto',
          previsao: { pergunta: 'Dobrando a massa do íon, o alcance x…', opcoes: ['dobra', 'cresce por √2', 'cai à metade'], correta: 1 },
          texto: r`A força magnética é a centrípeta: $mv = qrB$. O íon faz meia volta e bate a $x = 2r$:

$$m = \frac{qrB}{v} \quad\Rightarrow\quad m = \frac{qB^2}{8\Delta V}\,x^2.$$

A massa vai com $x^2$: medindo $x$, obtém-se $m$. Quando os íons tocam a chapa, a cena mede o alcance no rastro e recupera a velocidade e a massa.`,
          parametros: { reg: 0, fm: 0.05 },
          medidas: [0, 1, 2, 3],
        },
        {
          item: 'c',
          titulo: '(c) Separação de duas massas',
          texto: r`Dividindo as expressões para $m + \Delta m$ e $m$:

$$1 + \frac{\Delta m}{m} = \left(1 + \frac{\Delta x}{x}\right)^2 \approx 1 + 2\frac{\Delta x}{x} \quad\Rightarrow\quad \Delta m \approx \frac{2m}{x}\Delta x.$$

Com $x = \sqrt{8m\Delta V/qB^2}$:

$$\Delta m \approx \sqrt{\frac{mqB^2}{2\Delta V}}\,\Delta x.$$

A cena usa $\Delta m/m = 0{,}2$ para a separação ficar visível; aí a aproximação já se afasta um pouco do valor real.`,
          parametros: { reg: 0, fm: 0.2 },
          medidas: [1, 2, 4],
        },
        {
          item: 'd',
          titulo: '(d) Energia dos dois íons',
          texto: r`Registrados, são duas cargas $q$ a uma distância $\Delta x$:

$$U_E = \frac{1}{4\pi\varepsilon_0}\frac{q^2}{\Delta x}.$$`,
          parametros: { reg: 1, fm: 0.2 },
          medidas: [5],
        },
        {
          item: 'e',
          titulo: '(e) Potencial em P',
          texto: r`Os íons estão a $x$ e $x + \Delta x$ de $\mathcal P$, e o potencial é escalar:

$$V_\mathcal P = \frac{q}{4\pi\varepsilon_0}\left(\frac1x + \frac{1}{x + \Delta x}\right).$$`,
          parametros: { reg: 1, fm: 0.2 },
          medidas: [6],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Energia e ddp', lab: 'potencial' },
        ],
        etapas: [
          { titulo: '(a) Velocidade', texto: r`$v = \sqrt{2q\Delta V/m}$, em $\hat y$.`, passo: 0 },
          { titulo: '(b) Massa', texto: r`$mv = qrB$ com $r = x/2$: $m = \dfrac{qB^2}{8\Delta V}x^2$.`, passo: 1 },
          { titulo: '(c) Resolução', texto: r`$\Delta m \approx \dfrac{2m}{x}\Delta x = \sqrt{\dfrac{mqB^2}{2\Delta V}}\,\Delta x$.`, passo: 2 },
          { titulo: '(d) Energia', texto: r`$U_E = \dfrac{q^2}{4\pi\varepsilon_0\Delta x}$.`, passo: 3 },
          { titulo: '(e) Potencial', texto: r`$V_\mathcal P = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1x + \dfrac{1}{x+\Delta x}\right)$.`, passo: 4 },
        ],
        resultado: r`$\vec v = \sqrt{2q\Delta V/m}\,\hat y$; $m = \dfrac{qB^2}{8\Delta V}x^2$; $\Delta m \approx \sqrt{\dfrac{mqB^2}{2\Delta V}}\,\Delta x$; $U_E = \dfrac{q^2}{4\pi\varepsilon_0\Delta x}$; $V_\mathcal P = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1x + \dfrac{1}{x+\Delta x}\right)$.`,
        errosComuns: [
          r`Usar $x$ como raio: o íon faz meia volta, então $x = 2r$.`,
          r`Esquecer que $v$ também depende de $m$ ao isolar a massa.`,
          r`Somar $q/\Delta x$ no potencial em $\mathcal P$: a distância é até o ponto, não entre os íons.`,
        ],
        oficial: { resposta: r`$\vec v = \sqrt{2q\Delta V/m}\,\hat y$; $m = \dfrac{qB^2}{8\Delta V}x^2$; $\Delta m \approx \sqrt{\dfrac{mqB^2}{2\Delta V}}\,\Delta x$; $U_E = \dfrac{q^2}{4\pi\varepsilon_0\Delta x}$; $V_\mathcal P = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1x + \dfrac{1}{x+\Delta x}\right)$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\vec v = \sqrt{\dfrac{2q\Delta V}{m}}\,\hat y$`, pontos: 0.8, criterio: 'Conservação de energia e direção.' },
        { item: 'b', texto: r`$m = \dfrac{qB^2}{8\Delta V}x^2$`, pontos: 1.2, criterio: r`Força centrípeta e $x = 2r$.` },
        { item: 'c', texto: r`$\Delta m \approx \sqrt{\dfrac{mqB^2}{2\Delta V}}\,\Delta x$`, pontos: 1.2, criterio: 'Expansão em primeira ordem e substituição de x.' },
        { item: 'd', texto: r`$U_E = \dfrac{q^2}{4\pi\varepsilon_0\Delta x}$`, pontos: 0.4, criterio: 'Energia de um par de cargas.' },
        { item: 'e', texto: r`$V_\mathcal P = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1x + \dfrac{1}{x+\Delta x}\right)$`, pontos: 0.4, criterio: 'Soma escalar dos potenciais.' },
      ],
    },
  ],
}

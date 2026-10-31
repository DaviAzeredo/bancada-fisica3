import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 3: os arcos no plano yz, em trechos retos. */
const N = 24
const noPlano = (R: string, graus: number): [number, string, string] => [0, `${R}*sin(rad(${graus}))`, `${R}*cos(rad(${graus}))`]
const arco = (pre: string, R: string, ini: number, ab: number): ObjetoInput[] =>
  Array.from({ length: N }, (_, i) => ({ id: `${pre}${i}`, tipo: 'fio', I: 'I0', a: noPlano(R, ini + (i * ab) / N), b: noPlano(R, ini + ((i + 1) * ab) / N) }))

/* Objetiva 5: B(t) em trapézio, com a descida mais íngreme que a subida. */
const t1 = 2
const t2 = 3.5
const t3 = 4.5
const Bpico = 0.2
const Bfim = -0.15
const Bt = `(t < ${t1} ? ${Bpico}*t/${t1} : (t < ${t2} ? ${Bpico} : (t < ${t3} ? ${Bpico} + (${Bfim} - ${Bpico})*(t - ${t2})/${t3 - t2} : ${Bfim})))`
const Bv = (x: string) => Bt.replaceAll('t', x)

/* Objetiva 6: barra girando; o torque cai porque a fem induzida cresce. */
const wf = '(2*fe/(B0*LL^2))'
const omega = `(${wf}*(1 - exp(0-t/tau)))`
const ang = `(${wf}*(t - tau*(1 - exp(0-t/tau))))`

/* Discursiva: a curva C, um setor de raio 3R. */
const curva = (i: number): [string, string, number] => [`3*R*cos(pi/2*${i / 40})`, `3*R*sin(pi/2*${i / 40})`, 0]
const Ioco = (s: string) => `I0*(min(max(${s}, R), 2*R)/R - 1)`

export const p3_2023_2_noturno: ProvaInput = {
  id: 'p3-2023-2-noturno',
  titulo: 'P3 · 2023/2 · Noturno',
  subtitulo: 'Física III · Terceira Prova · Versão A · 07/12/2023',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Capacitor de quatro placas intercaladas',
      resumo: 'Placas ligadas de duas em duas formam três capacitores em paralelo.',
      enunciado: r`Considere um capacitor composto por quatro placas quadradas paralelas, cada uma com área $A$, espaçadas uniformemente por uma distância $d$ (onde $\sqrt A \gg d$). A primeira e a terceira placa estão conectadas por um fio ao ponto $A$, enquanto a segunda e a quarta estão conectadas ao ponto $B$. Qual é a capacitância desse sistema entre os pontos $A$ e $B$?`,
      figura: [
        { pagina: 1, recorte: [0.03, 0.555, 0.49, 0.675] },
        { pagina: 1, recorte: [0.19, 0.75, 0.43, 0.87] },
      ],
      cena: { escala: 0.002, extensao: 24, unidade: 'cm', plano: 'xy', camera: { pos: [14, 10, 70], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Vf', rotulo: 'ddp entre A e B', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'dd', rotulo: 'Separação', simbolo: 'd', valor: 0.012, unidade: 'm', min: 0.006, max: 0.02, passo: 0.001 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: r`\sqrt A`, valor: 0.07, unidade: 'm', min: 0.04, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'c1', tipo: 'capacitor', centro: ['0-dd', 0, 0], eixo: 'x', lado: 'lado', d: 'dd', V: 'Vf' },
        { id: 'c2', tipo: 'capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'dd', V: '0-Vf' },
        { id: 'c3', tipo: 'capacitor', centro: ['dd', 0, 0], eixo: 'x', lado: 'lado', d: 'dd', V: 'Vf' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância equivalente', simbolo: r`C = 3\varepsilon_0A/d`, expr: "C('c1') + C('c2') + C('c3')", unidade: 'F', teoria: '3*eps0*lado^2/dd' },
        { rotulo: 'ddp no 1º vão', simbolo: 'V_{12}', expr: 'V(-1.5*dd, 0, 0) - V(-0.5*dd, 0, 0)', unidade: 'V', teoria: 'Vf' },
        { rotulo: 'ddp no 2º vão', simbolo: 'V_{32}', expr: 'V(0.5*dd, 0, 0) - V(-0.5*dd, 0, 0)', unidade: 'V', teoria: 'Vf' },
        { rotulo: 'ddp no 3º vão', simbolo: 'V_{34}', expr: 'V(0.5*dd, 0, 0) - V(1.5*dd, 0, 0)', unidade: 'V', teoria: 'Vf' },
      ],
      passos: [
        {
          titulo: 'Quem está ligado a quem',
          texto: r`As placas 1 e 3 estão no potencial de $A$; as 2 e 4, no de $B$. Cada um dos três vãos tem uma placa de $A$ de um lado e uma de $B$ do outro: os três têm a **mesma ddp**.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Reconhecer o paralelo',
          texto: r`Mesma ddp nos três significa três capacitores em **paralelo**, cada um com $\varepsilon_0A/d$:
$$C = 3\frac{\varepsilon_0A}{d}$$
As setas mostram o campo alternando o sentido de um vão para o outro. Alternativa **(a)**.`,
          medidas: [0],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{3A\epsilon_0}{d}$`, correta: true, porque: r`Três vãos com a mesma ddp: três capacitores em paralelo.` },
        { letra: 'b', texto: r`$\dfrac{2A\epsilon_0}{5d}$`, porque: r`Não corresponde a nenhuma associação dos três vãos.` },
        { letra: 'c', texto: r`$\dfrac{4A\epsilon_0}{3d}$`, porque: r`Conta quatro capacitores: quatro placas formam três vãos.` },
        { letra: 'd', texto: r`$\dfrac{3A\epsilon_0}{4d}$`, porque: r`Inverte a razão entre vãos e placas.` },
        { letra: 'e', texto: r`$\dfrac{A\epsilon_0}{3d}$`, porque: r`É o resultado para três capacitores em **série**, como se as placas não estivessem ligadas de duas em duas.` },
        { letra: 'f', texto: r`$\dfrac{4A\epsilon_0}{d}$`, porque: r`Conta um capacitor por placa.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação em paralelo', lab: 'associacao' }, { texto: 'Capacitor de placas', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Potenciais', texto: r`Placas 1 e 3 em $V_A$; 2 e 4 em $V_B$.`, passo: 0 },
          { titulo: 'Associação', texto: r`Três vãos com a mesma ddp: em paralelo, $C = 3\varepsilon_0A/d$.`, passo: 1 },
        ],
        resultado: r`$C = 3\varepsilon_0A/d$: alternativa (a).`,
        errosComuns: ['Tratar placas empilhadas como série sem olhar os fios.', 'Contar quatro capacitores em vez de três vãos.'],
        oficial: { resposta: '(a)' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Parar no centro do anel',
      resumo: 'Conservação de energia, com o potencial no eixo do anel.',
      enunciado: r`Considere uma espira circular de raio $R$ fixa no plano $YZ$, com eixo alinhado ao eixo $X$, com densidade linear de carga uniforme e carga total positiva $Q$. Uma partícula, também com carga $Q$ e massa $m$, é lançada a partir do ponto $(R, 0, 0)$ em direção ao centro do anel ao longo do eixo $X$. Qual deve ser o módulo da velocidade de lançamento para que ela pare no centro do anel?`,
      figura: [
        { pagina: 1, recorte: [0.51, 0.04, 0.97, 0.19] },
        { pagina: 1, recorte: [0.735, 0.22, 0.925, 0.56] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', camera: { pos: [17, 9, 16], alvo: [2, 0, 0] }, tempo: { escala: 0.03, unidade: 'ms', passo: 0.00002, duracao: 0.09 } },
      parametros: [
        { id: 'Qa', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
        { id: 'mm', rotulo: 'Massa', simbolo: 'm', valor: 1e-7, unidade: 'kg', min: 2e-8, max: 5e-7, passo: 1e-8 },
      ],
      objetos: [
        { id: 'an', tipo: 'anelCarga', centro: [0, 0, 0], normal: 'x', raio: 'R', Q: 'Qa', rotulo: 'anel' },
        { id: 'p', tipo: 'particula', q: 'Qa', m: 'mm', pos: ['R', 0, 0], v: ['0 - Qa*sqrt((1 - 1/sqrt(2))/(2*pi*mm*R*eps0))', 0, 0], rotulo: 'partícula' },
      ],
      medidas: [
        { rotulo: 'Potencial no centro', simbolo: r`V(0) = k_0Q/R`, expr: 'V(0, 0, 0)', unidade: 'V', teoria: 'k0*Qa/R' },
        { rotulo: 'Potencial no lançamento', simbolo: r`V(R) = k_0Q/\sqrt2R`, expr: 'V(R, 0, 0)', unidade: 'V', teoria: 'k0*Qa/(sqrt(2)*R)' },
        { rotulo: 'Energia cinética necessária', simbolo: r`K = Q\,\Delta V`, expr: 'Qa*(V(0, 0, 0) - V(R, 0, 0))', unidade: 'J', teoria: 'k0*Qa^2/R*(1 - 1/sqrt(2))' },
        { rotulo: 'Velocidade de lançamento', simbolo: 'v', expr: 'sqrt(2*Qa*(V(0, 0, 0) - V(R, 0, 0))/mm)', unidade: 'm/s', teoria: 'Qa*sqrt((1 - 1/sqrt(2))/(2*pi*mm*R*eps0))' },
      ],
      passos: [
        {
          titulo: 'Energia, não força',
          texto: r`A força muda ao longo do caminho, mas a energia se conserva: para parar no centro, a energia cinética inicial tem de pagar a subida de potencial,
$$\tfrac12mv^2 = Q\,[V(0) - V(R)]$$`,
        },
        {
          titulo: 'Potencial no eixo do anel',
          texto: r`Todos os elementos estão à mesma distância de um ponto do eixo:
$$V(x) = \frac{k_0Q}{\sqrt{x^2 + R^2}}$$
Logo $V(0) = k_0Q/R$ e $V(R) = k_0Q/\sqrt2R$.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Resolver',
          texto: r`$$\frac12mv^2 = \frac{k_0Q^2}{R}\left(1 - \frac1{\sqrt2}\right)\quad\Rightarrow\quad v = Q\sqrt{\frac{1}{2\pi mR\epsilon_0}\left(1 - \frac1{\sqrt2}\right)}$$
Dê play: a partícula chega ao centro com velocidade quase nula. Alternativa **(c)**.`,
          medidas: [2, 3],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$Q\sqrt{\dfrac{1}{\pi mR\epsilon_0}\left(2 - \dfrac{1}{\sqrt2}\right)}$`, porque: r`Erra o fator de $1/\sqrt2$ e o de $k_0$.` },
        { letra: 'b', texto: r`$Q\sqrt{\dfrac{3}{2\pi mR\epsilon_0}\left(2 - \dfrac{1}{\sqrt2}\right)}$`, porque: r`O parêntese deveria ser $1 - 1/\sqrt2$.` },
        { letra: 'c', texto: r`$Q\sqrt{\dfrac{1}{2\pi mR\epsilon_0}\left(1 - \dfrac{1}{\sqrt2}\right)}$`, correta: true, porque: r`$\tfrac12mv^2 = Q[V(0) - V(R)]$, com $V$ no eixo do anel.` },
        { letra: 'd', texto: r`$Q\sqrt{\dfrac{1}{4\pi mR\epsilon_0}\left(2 - \dfrac{1}{\sqrt3}\right)}$`, porque: r`Usa $\sqrt3$, que não aparece em $x = R$.` },
        { letra: 'e', texto: r`$Q\sqrt{\dfrac{1}{2\pi mR\epsilon_0}\left(1 - \dfrac{1}{\sqrt3}\right)}$`, porque: r`Distância errada: de $(R,0,0)$ ao anel é $\sqrt2R$.` },
        { letra: 'f', texto: r`$Q\sqrt{\dfrac{1}{4\pi mR\epsilon_0}\left(-1 + \dfrac{1}{\sqrt2}\right)}$`, porque: r`O radicando fica negativo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial no eixo de um anel', lab: 'distribuicoes' }, { texto: 'Conservação de energia', lab: 'energia' }],
        etapas: [
          { titulo: 'Energia', texto: r`$\tfrac12mv^2 = Q\,[V(0) - V(R)]$.`, passo: 0 },
          { titulo: 'Potenciais', texto: r`$V(x) = k_0Q/\sqrt{x^2 + R^2}$.`, passo: 1 },
          { titulo: 'Velocidade', texto: r`Substitua $k_0 = 1/4\pi\varepsilon_0$ e isole $v$.`, passo: 2 },
        ],
        resultado: 'Alternativa (c).',
        errosComuns: ['Tentar resolver com força, que varia ao longo do caminho.', 'Usar a distância $R$ em vez de $\\sqrt2R$ no ponto de lançamento.'],
        oficial: { resposta: '(c)' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fio com arcos no plano ZY',
      resumo: 'Dois arcos em sentidos opostos e uma semirreta.',
      enunciado: r`Um fio infinito condutor adota o formato da figura. Os dois arcos, de raios $R$ e $2R$, estão no plano $ZY$. O primeiro trecho reto está sobre o eixo $Z$, e o terceiro é paralelo ao eixo $X$. Uma corrente $I$ percorre esse fio, conforme a figura. Determine o campo magnético resultante no ponto $\mathcal O$.`,
      figura: [
        { pagina: 2, recorte: [0.03, 0.04, 0.49, 0.195] },
        { pagina: 2, recorte: [0.07, 0.53, 0.42, 0.95] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [22, 6, 8], alvo: [0, 1, 2] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.015, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 't1', tipo: 'fio', I: 'I0', a: [0, 0, 0.085], b: [0, 0, '2*R'], infinito: 'a', rotulo: '1º trecho' },
        ...arco('m', '2*R', 0, 90),
        { id: 't2', tipo: 'fio', I: 'I0', a: [0, '2*R', 0], b: [0, 'R', 0], rotulo: '2º trecho' },
        ...arco('n', 'R', 90, -180),
        { id: 't3', tipo: 'fio', I: 'I0', a: [0, '0-R', 0], b: [0.085, '0-R', 0], infinito: 'b', rotulo: '3º trecho' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      medidas: [
        { rotulo: 'Trechos alinhados com O', simbolo: 'B', expr: "mag(Bde('t1', 0, 0, 0)) + mag(Bde('t2', 0, 0, 0))", unidade: 'T', teoria: '0' },
        { rotulo: 'Semirreta (3º trecho)', simbolo: r`B_z = \frac{\mu_0I}{4\pi R}`, expr: "z(Bde('t3', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(4*pi*R)' },
        { rotulo: 'Campo total, em x', simbolo: r`B_x = \frac{3\mu_0I}{16R}`, expr: 'x(B(0, 0, 0))', unidade: 'T', teoria: '3*mu0*I0/(16*R)' },
        { rotulo: 'Campo total, em z', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(4*pi*R)' },
      ],
      passos: [
        { titulo: 'O que não contribui', texto: r`O 1º trecho (sobre $Z$) e o 2º (sobre $Y$) apontam para $\mathcal O$: $d\vec\ell \parallel \hat r$, contribuição nula.`, destacar: ['t1', 't2'], medidas: [0] },
        {
          titulo: 'Os arcos',
          texto: r`O arco de $2R$ é um quarto de volta: $\dfrac14\cdot\dfrac{\mu_0I}{2(2R)} = \dfrac{\mu_0I}{16R}$, em $-\hat x$. O de $R$ é meia volta, no sentido oposto: $\dfrac12\cdot\dfrac{\mu_0I}{2R} = \dfrac{\mu_0I}{4R}$, em $+\hat x$. Somando, $B_x = 3\mu_0I/16R$.`,
          medidas: [2],
        },
        {
          titulo: 'A semirreta',
          texto: r`O 3º trecho, paralelo a $X$, passa a uma distância $R$ de $\mathcal O$ e começa no ponto mais próximo: metade do fio infinito, $\mu_0I/4\pi R$, em $+\hat z$.`,
          destacar: ['t3'],
          medidas: [1],
        },
        {
          titulo: 'Juntar',
          texto: r`$$\vec B = \frac{\mu_0I}{4\pi R}\left(\frac34\pi\,\hat x + \hat z\right)$$
Alternativa **(f)**.`,
          medidas: [2, 3],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\mu_0I}{4R\pi}\left(\dfrac23\pi\hat x - \hat z\right)$`, porque: r`Erra a fração dos arcos e o sentido da semirreta.` },
        { letra: 'b', texto: r`$\dfrac{3\mu_0I}{R\pi}(3\pi\hat x - \hat z)$`, porque: r`Ordem de grandeza errada: arcos valem frações de $\mu_0I/R$.` },
        { letra: 'c', texto: r`$\dfrac{2\mu_0I}{R\pi}\left(\dfrac14\pi\hat x + \hat z\right)$`, porque: r`Trata o 3º trecho como fio inteiro, e mais.` },
        { letra: 'd', texto: r`$\dfrac{\mu_0I}{2R\pi}\left(\dfrac43\pi\hat x + \hat z\right)$`, porque: r`Inverte a fração $3/4$ e usa o fio infinito.` },
        { letra: 'e', texto: r`$\dfrac{2\mu_0I}{R\pi}\left(\dfrac14\pi\hat x - 5\hat z\right)$`, porque: r`Sem relação com as contribuições.` },
        { letra: 'f', texto: r`$\dfrac{\mu_0I}{4R\pi}\left(\dfrac34\pi\hat x + \hat z\right)$`, correta: true, porque: r`Dois arcos em $\hat x$, com sentidos opostos, e uma semirreta em $\hat z$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart por trechos', lab: 'trechos' }],
        etapas: [
          { titulo: 'Eliminar', texto: r`Trechos alinhados com $\mathcal O$ não contribuem.`, passo: 0 },
          { titulo: 'Arcos', texto: r`$B_x = \mu_0I/4R - \mu_0I/16R = 3\mu_0I/16R$.`, passo: 1 },
          { titulo: 'Semirreta', texto: r`$B_z = \mu_0I/4\pi R$.`, passo: 2 },
        ],
        resultado: 'Alternativa (f).',
        errosComuns: ['Esquecer que os arcos têm sentidos opostos em torno de $\\mathcal O$.', 'Usar o fio infinito inteiro no 3º trecho.'],
        oficial: { resposta: '(f)' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Barra perto de um fio infinito',
      resumo: 'B varia ao longo da barra: a força sai de uma integral.',
      enunciado: r`Uma fina barra condutora, de largura $L$, está sobre o eixo $X$, do ponto $(L, 0, 0)$ ao ponto $(2L, 0, 0)$, com corrente estacionária $I_1$ ao longo dela. Um fio infinitamente longo, ao longo do eixo $Z$, tem corrente $I_2$ no sentido positivo desse eixo. Qual alternativa expressa a força magnética resultante sobre a barra devido ao fio infinito?`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.04, 0.97, 0.255] },
        { pagina: 2, recorte: [0.68, 0.31, 0.93, 0.53] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, 2, 20], alvo: [3, 0, 0] } },
      parametros: [
        { id: 'I1', rotulo: 'Corrente na barra', simbolo: 'I_1', valor: 20, unidade: 'A', min: 1, max: 50, passo: 1 },
        { id: 'I2', rotulo: 'Corrente no fio', simbolo: 'I_2', valor: 30, unidade: 'A', min: 1, max: 50, passo: 1 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'fz', tipo: 'fioInfinito', I: 'I2', ponto: [0, 0, 0], direcao: 'z', rotulo: 'I₂' },
        { id: 'bar', tipo: 'fio', I: 'I1', a: ['L', 0, 0], b: ['2*L', 0, 0], rotulo: 'I₁' },
        { id: 'Sf', tipo: 'seta', papel: 'forca', origem: ['1.5*L', 0, 0], vetor: "forca('bar','fz')", comprimento: '2.5*cm', rotulo: 'F' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo na ponta próxima', simbolo: r`B(L)`, expr: 'y(B(L, 0.001, 0))', unidade: 'T' },
        { rotulo: 'Campo na ponta distante', simbolo: r`B(2L)`, expr: 'y(B(2*L, 0.001, 0))', unidade: 'T' },
        { rotulo: 'Força na barra', simbolo: r`F_z = \frac{\mu_0I_1I_2}{2\pi}\ln2`, expr: "z(forca('bar','fz'))", unidade: 'N', teoria: 'mu0*I1*I2/(2*pi)*ln(2)' },
      ],
      passos: [
        { titulo: 'O campo não é uniforme', texto: r`Sobre a barra, $\vec B = \dfrac{\mu_0I_2}{2\pi x}\hat y$: cai pela metade de uma ponta à outra. Não dá para usar $ILB$ direto.`, medidas: [0, 1] },
        {
          titulo: 'Integrar',
          texto: r`$d\vec F = I_1\,dx\,\hat x\times\vec B$, e $\hat x\times\hat y = \hat z$:
$$F_z = \int_L^{2L}\frac{\mu_0I_1I_2}{2\pi x}\,dx = \frac{\mu_0I_1I_2}{2\pi}\ln 2$$
Alternativa **(c)**. O $L$ some: só a razão entre as distâncias importa.`,
          medidas: [2],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{(I_1 + I_2)I_1\mu_0}{2\pi}\ln\left(\dfrac12\right)\hat z$`, porque: r`Soma as correntes; a força é proporcional ao produto.` },
        { letra: 'b', texto: r`$-\dfrac{I_1I_2\mu_0}{4\pi}\ln(2)\,\hat y$`, porque: r`A força é perpendicular a $\vec B$, que está em $\hat y$.` },
        { letra: 'c', texto: r`$\dfrac{I_1I_2\mu_0}{2\pi}\ln(2)\,\hat z$`, correta: true, porque: r`Integral de $1/x$ de $L$ a $2L$.` },
        { letra: 'd', texto: r`$-\dfrac{I_1I_2\mu_0}{4\pi}\ln\left(\dfrac12\right)\hat z$`, porque: r`Sinal certo, mas $4\pi$ no lugar de $2\pi$: é o fator de Biot-Savart, não o do fio infinito.` },
        { letra: 'e', texto: r`$\dfrac{I_1I_2\mu_0}{2\pi}\ln\left(\dfrac12\right)\hat x$`, porque: r`A força seria paralela à corrente, o que é impossível.` },
        { letra: 'f', texto: r`$-\dfrac{4I_1I_2\mu_0}{\pi}\ln(2)\,\hat z$`, porque: r`Sinal e fator errados.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força em fio com campo não uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Campo', texto: r`$\vec B(x) = \mu_0I_2\hat y/2\pi x$.`, passo: 0 },
          { titulo: 'Integral', texto: r`$\int_L^{2L}dx/x = \ln2$, e $\hat x\times\hat y = \hat z$.`, passo: 1 },
        ],
        resultado: r`$\vec F = \dfrac{\mu_0I_1I_2}{2\pi}\ln2\,\hat z$: alternativa (c).`,
        errosComuns: ['Usar $B$ no ponto médio.', 'Errar o sentido do produto vetorial.'],
        oficial: { resposta: '(c)' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'A fem a partir do gráfico de B(t)',
      resumo: 'Inclinação, e não altura; subida lenta e descida rápida.',
      enunciado: r`Uma espira circular condutora está em uma região com campo magnético uniforme, porém não estacionário, paralelo ao eixo da espira. O gráfico $B\times t$ representa a variação temporal do campo. Levando em consideração que a fem induzida é positiva quando resulta em corrente no sentido anti-horário, qual dos gráficos melhor representa a fem induzida em função do tempo?`,
      figura: {
        pagina: 3,
        recorte: [0.03, 0.04, 0.5, 0.88],
        mascaras: [{ area: [0.385, 0.5, 0.415, 0.545], letra: '(c)' }],
      },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 20], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 6 } },
      parametros: [{ id: 'R', rotulo: 'Raio da espira', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.07, passo: 0.002 }],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, Bt], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: 'R', R: 1, rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 9 },
      medidas: [
        { rotulo: 'Campo', simbolo: 'B', expr: Bt, unidade: 'T' },
        { rotulo: 'fem: positiva é anti-horária', simbolo: r`\varepsilon = -A\,dB/dt`, expr: "fem('S')", unidade: 'V' },
      ],
      graficos: [
        {
          titulo: 'B(t) e a fem',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 6, rotulo: 't', unidade: 's' },
          series: [
            { rotulo: 'B', expr: Bv('tt'), unidade: 'T' },
            { rotulo: 'ε', expr: `0 - pi*R^2*(${Bv('(tt + 0.005)')} - ${Bv('(tt - 0.005)')})/0.01`, unidade: 'V' },
          ],
        },
      ],
      passos: [
        { titulo: 'A fem é a inclinação', texto: r`$\varepsilon = -A\,dB/dt$: importa a **inclinação** de $B(t)$, com o sinal trocado. Com a inclinação constante em cada trecho, a fem é um patamar.`, medidas: [1] },
        { titulo: 'De 0 a t₁', texto: r`$B$ sobe: inclinação positiva, fem **negativa**.`, medidas: [0, 1] },
        { titulo: 'De t₁ a t₂', texto: r`$B$ constante: fem **nula**, mesmo com $B$ no máximo.` },
        {
          titulo: 'De t₂ a t₃',
          texto: r`$B$ desce mais depressa do que subiu: fem **positiva** e de módulo **maior**. Depois de $t_3$, $B$ é constante de novo, e a fem volta a zero. Alternativa **(c)**.`,
        },
      ],
      alternativas: [
        { letra: 'a', texto: 'Gráfico (a)', porque: r`Desenha a fem como rampa no primeiro trecho: uma inclinação constante dá um patamar.` },
        { letra: 'b', texto: 'Gráfico (b)', porque: r`Sinal trocado, e uma rampa onde deveria haver um patamar.` },
        { letra: 'c', texto: 'Gráfico (c)', correta: true, porque: r`Patamar negativo, zero, patamar positivo e maior, zero.` },
        { letra: 'd', texto: 'Gráfico (d)', porque: r`Esquece o sinal de menos da lei de Faraday.` },
        { letra: 'e', texto: 'Gráfico (e)', porque: r`Os dois patamares têm o mesmo sinal: subida e descida têm inclinações opostas.` },
        { letra: 'f', texto: 'Gráfico (f)', porque: r`Mistura rampa e patamar.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }, { texto: 'Derivar um gráfico', lab: 'movimento' }],
        etapas: [
          { titulo: 'Regra', texto: r`$\varepsilon = -A\,dB/dt$.`, passo: 0 },
          { titulo: 'Trecho a trecho', texto: r`Subida: negativa. Platô: zero. Descida íngreme: positiva e maior. Platô: zero.`, passo: 1 },
        ],
        resultado: 'Gráfico (c).',
        errosComuns: ['Confundir o valor de $B$ com sua inclinação.', 'Esquecer o sinal de menos.', 'Ignorar que a descida é mais íngreme.'],
        oficial: { resposta: '(c)' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Motor de uma barra girando',
      resumo: 'A fem induzida cresce até igualar a fonte, e a corrente some.',
      enunciado: r`Uma barra condutora de comprimento $L$ gira em torno de um eixo por uma extremidade, ortogonal ao plano de rotação. A extremidade livre mantém contato com um arco condutor circular, com uma pequena abertura. Uma chave $S$, inicialmente desligada, está conectada a uma fonte de fem $\mathcal E$. Todo o sistema está em um campo uniforme e estacionário $\vec B = B\hat z$, paralelo ao eixo de rotação. A chave é acionada, e o sistema evolui. A barra estava em repouso. Quais afirmações são corretas?

(I) A corrente através da barra tenderá a zero depois de um longo tempo.

(II) O módulo da fem induzida na barra variará de forma não linear com o tempo e assumirá um valor máximo igual a $\mathcal E$.

(III) O módulo da força magnética sobre a barra tenderá a diminuir, levando a uma eventual parada do movimento de rotação da barra.`,
      figura: [
        { pagina: 3, recorte: [0.51, 0.04, 0.97, 0.53] },
        { pagina: 3, recorte: [0.7, 0.55, 0.93, 0.9] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 20], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 8 } },
      parametros: [
        { id: 'fe', rotulo: 'fem da fonte', simbolo: r`\mathcal E`, valor: 0.02, unidade: 'V', min: 0.005, max: 0.05, passo: 0.001 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'LL', rotulo: 'Comprimento', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
        { id: 'tau', rotulo: 'Constante de tempo', simbolo: r`\tau`, valor: 1.5, unidade: 's', min: 0.5, max: 3, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'ar', tipo: 'caminho', seta: 0, pontos: Array.from({ length: 49 }, (_, i) => [`LL*cos(${(i / 48) * 2 * Math.PI})`, `LL*sin(${(i / 48) * 2 * Math.PI})`, 0] as [string, string, number]) },
        { id: 'bar', tipo: 'caminho', seta: 0.7, pontos: [[0, 0, 0], [`LL*cos(0 - ${ang})`, `LL*sin(0 - ${ang})`, 0]], rotulo: 'barra' },
      ],
      visual: { setasB: true, densidade: 9 },
      medidas: [
        { rotulo: 'Velocidade angular', simbolo: r`\omega(t)`, expr: omega, unidade: 'rad/s' },
        { rotulo: 'fem induzida na barra', simbolo: r`\varepsilon = \tfrac12B\omega L^2`, expr: `B0*${omega}*LL^2/2`, unidade: 'V', teoria: 'fe*(1 - exp(0-t/tau))' },
        { rotulo: 'Corrente, em frações do valor inicial', simbolo: r`I/I_0`, expr: `(fe - B0*${omega}*LL^2/2)/fe`, unidade: '', teoria: 'exp(0-t/tau)' },
      ],
      graficos: [
        {
          titulo: 'fem induzida e corrente',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 8, rotulo: 't', unidade: 's' },
          series: [
            { rotulo: 'ε/ℰ', expr: '1 - exp(0-tt/tau)', unidade: '' },
            { rotulo: 'I/I₀', expr: 'exp(0-tt/tau)', unidade: '' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'O que acontece',
          texto: r`Fechada a chave, a corrente na barra sofre uma força e a barra acelera. Girando, ela corta o campo e cria uma fem $\varepsilon = \tfrac12B\omega L^2$ **contra** a fonte: a corrente é $I = (\mathcal E - \varepsilon)/R$.`,
          medidas: [0],
        },
        {
          titulo: '(I) e (II) são verdadeiras',
          texto: r`Com $\omega$ crescendo, $\varepsilon$ cresce e $I$ cai. O fim é $\varepsilon = \mathcal E$ e $I = 0$. A aproximação é exponencial, isto é, não linear, com máximo $\mathcal E$.`,
          medidas: [1, 2],
        },
        {
          titulo: '(III) é falsa',
          texto: r`A força magnética tende a zero, sim, mas isso só significa que a barra para de **acelerar**. Sem atrito, ela continua girando com $\omega$ constante. Alternativa **(c)**: somente I e II.`,
          medidas: [0],
        },
      ],
      alternativas: [
        { letra: 'a', texto: 'somente a I e III.', porque: r`(III) confunde força nula com velocidade nula.` },
        { letra: 'b', texto: 'somente a II.', porque: r`(I) também vale: no regime final, $\varepsilon = \mathcal E$ e $I = 0$.` },
        { letra: 'c', texto: 'somente a I e II.', correta: true, porque: r`A corrente tende a zero, a fem tende a $\mathcal E$, e a barra segue girando.` },
        { letra: 'd', texto: 'somente a I.', porque: r`(II) também é verdadeira.` },
        { letra: 'e', texto: 'todas elas.', porque: r`(III) é falsa: sem atrito, $\omega$ fica constante.` },
        { letra: 'f', texto: 'somente a III.', porque: r`É justamente a falsa.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'fem de movimento', lab: 'movimento' }, { texto: 'Força e torque em correntes', lab: 'forcas' }],
        etapas: [
          { titulo: 'Malha', texto: r`$I = (\mathcal E - \tfrac12B\omega L^2)/R$.`, passo: 0 },
          { titulo: 'Regime final', texto: r`$I \to 0$ e $\varepsilon \to \mathcal E$.`, passo: 1 },
          { titulo: 'Sem atrito', texto: r`Força zero não para a barra: ela segue com $\omega = 2\mathcal E/BL^2$.`, passo: 2 },
        ],
        resultado: 'Somente I e II: alternativa (c).',
        errosComuns: ['Confundir força nula com repouso.'],
        oficial: { resposta: '(c)' },
      },
    },

    /* ───────────────────────── D1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Cilindro oco com J ∝ 1/r',
      resumo: 'Ampère nas três regiões, o fio que anula o campo e a curva C.',
      enunciado: r`Considere um cilindro condutor oco, infinito, de raio interno $R$ e externo $2R$, com eixo ao longo de $Z$. O cilindro tem densidade de corrente estacionária e não uniforme $\vec J = [I_0/(2\pi Rr)]\hat z$, com $I_0$ constante positiva e $r$ a distância ao eixo.

(a) Aplicando a lei de Ampère, determine o campo magnético em $0 \le r \le R$, $R \le r \le 2R$ e $r \ge 2R$. [2,0]

(b) Faça um gráfico do módulo $B$ em função de $r$, destacando os pontos relevantes. [0,8]

(c) Para anular o campo na região $r > 2R$, é possível usar um fio infinito com corrente estacionária. Sobre qual eixo posicionar esse fio, e em que sentido a corrente deve fluir? Determine a corrente no fio. [0,5]

(d) Com base no item (a), determine a circulação, no sentido anti-horário, de $\vec B$ ao longo da curva $\mathcal C$ da figura, formada por dois segmentos radiais e um arco de raio $3R$. [0,7]`,
      figura: [
        { pagina: 4, recorte: [0.03, 0.03, 0.49, 0.9] },
        { pagina: 4, recorte: [0.6, 0.02, 0.9, 0.37] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 23], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente total', simbolo: 'I_0', valor: 50, unidade: 'A', min: 5, max: 100, passo: 1 },
        { id: 'R', rotulo: 'Raio interno', simbolo: 'R', valor: 0.025, unidade: 'm', min: 0.015, max: 0.03, passo: 0.001 },
        { id: 'rs', rotulo: 'Raio da amperiana', simbolo: 'r', valor: 0.04, unidade: 'm', min: 0.004, max: 0.09, passo: 0.001 },
        { id: 'comFio', rotulo: 'Fio no eixo', valor: 0, opcoes: [{ valor: 0, rotulo: 'Sem' }, { valor: 1, rotulo: 'Com −I₀' }] },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: '2*R', raioInterno: 'R', J: 'I0/(2*pi*R*r)', rotulo: 'J(r)' },
        { id: 'fio', tipo: 'fioInfinito', ativo: 'comFio==1', I: '0-I0', ponto: [0, 0, 0], direcao: 'z', rotulo: '−I₀' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'amperiana' },
        { id: 'C', tipo: 'caminho', tracejado: true, seta: 0.45, rotulo: 'C', pontos: [[0, 0, 0], ...Array.from({ length: 41 }, (_, i) => curva(i)), [0, 0, 0]] },
      ],
      visual: { setasB: true, densidade: 13 },
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{enc}(r)`, expr: "Ienc('Amp') - (comFio==1 ? (0-I0) : 0)", unidade: 'A', teoria: Ioco('rs') },
        { rotulo: 'Campo do cilindro em r', simbolo: 'B(r)', expr: "y(Bde('cil', rs, 0, 0))", unidade: 'T', teoria: `mu0*${Ioco('rs')}/(2*pi*rs)` },
        { rotulo: 'Campo total fora, com o fio', simbolo: 'B(r > 2R)', expr: 'y(B(2.5*R, 0, 0))', unidade: 'T', teoria: 'comFio==1 ? 0 : mu0*I0/(2*pi*2.5*R)' },
        { rotulo: 'Circulação em C', simbolo: r`\Gamma_C = \mu_0I_0/4`, expr: "intB('C')", unidade: 'T·m', teoria: 'comFio==1 ? 0 : mu0*I0/4' },
      ],
      graficos: [
        {
          titulo: 'Módulo de B em função de r',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.002, ate: 0.09, rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulação', expr: "y(Bde('cil', ss, 0, 0))", unidade: 'T' },
            { rotulo: 'Ampère', expr: `mu0*${Ioco('ss')}/(2*pi*ss)`, unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: '(a) Simetria e região I',
          item: '(a)',
          texto: r`Simetria cilíndrica: $\vec B = B(r)\hat\varphi$, e a amperiana é uma circunferência coaxial, com $2\pi rB = \mu_0I_\text{enc}$. Para $r \le R$ não há corrente envolvida: $\vec B = \vec 0$.`,
          parametros: { rs: 0.015, comFio: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(a) Região II',
          item: '(a)',
          texto: r`Para $R \le r \le 2R$:
$$I_\text{enc} = \int_R^r\frac{I_0}{2\pi Rr'}2\pi r'\,dr' = I_0\left(\frac rR - 1\right)$$
$$\vec B = \frac{\mu_0I_0}{2\pi}\left(\frac1R - \frac1r\right)\hat\varphi$$`,
          parametros: { rs: 0.04, comFio: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(a) Região III',
          item: '(a)',
          texto: r`Para $r \ge 2R$, a corrente total é $I_0$: $\vec B = \dfrac{\mu_0I_0}{2\pi r}\hat\varphi$.`,
          parametros: { rs: 0.07, comFio: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(b) O gráfico',
          item: '(b)',
          texto: r`Zero até $R$; sobe até o máximo $\mu_0I_0/4\pi R$ em $r = 2R$; cai com $1/r$. É contínuo em $R$ e em $2R$, porque não há corrente superficial.`,
        },
        {
          titulo: '(c) O fio',
          item: '(c)',
          texto: r`Fora, $I_\text{enc}$ precisa ser zero: um fio **sobre o eixo $Z$**, com corrente $I_0$ em $-\hat z$. Ligue o fio: o campo some fora, e na região II passa a $-\mu_0I_0/2\pi r$ a mais.`,
          parametros: { comFio: 1, rs: 0.07 },
          medidas: [2],
        },
        {
          titulo: '(d) A curva C',
          item: '(d)',
          texto: r`Nos trechos radiais, $\vec B \perp d\vec\ell$. Só o arco de raio $3R$ conta, com $B$ constante:
$$\Gamma_C = \frac{\mu_0I_0}{2\pi(3R)}\cdot\frac\pi2(3R) = \frac{\mu_0I_0}{4}$$
Pela lei de Ampère, é o mesmo que dizer que $C$ envolve um quarto da corrente.`,
          parametros: { comFio: 0 },
          medidas: [3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec 0$; $\dfrac{\mu_0I_0}{2\pi}\left(\dfrac1R - \dfrac1r\right)\hat\varphi$; $\dfrac{\mu_0I_0}{2\pi r}\hat\varphi$.`, pontos: 2 },
        { item: '(b)', texto: r`Nulo até $R$, cresce até $\mu_0I_0/4\pi R$ em $2R$ e cai com $1/r$.`, pontos: 0.8 },
        { item: '(c)', texto: r`Sobre o eixo $Z$, sentido $-\hat z$, com corrente $I_0$.`, pontos: 0.5 },
        { item: '(d)', texto: r`$\Gamma_C = \mu_0I_0/4$.`, pontos: 0.7 },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com J(s)', lab: 'ampereJ' }, { texto: 'Circulação em curva não circular' }],
        etapas: [
          { titulo: 'Corrente envolvida', texto: r`$I_\text{enc}(r) = I_0(r/R - 1)$ na região II.`, passo: 1 },
          { titulo: 'Campos', texto: r`$B = \mu_0I_\text{enc}/2\pi r$.`, passo: 2 },
          { titulo: 'Anular', texto: r`Fio no eixo com $-I_0$.`, passo: 4 },
          { titulo: 'Circulação', texto: r`Só o arco contribui: $\mu_0I_0/4$.`, passo: 5 },
        ],
        resultado: r`$\vec B$ nulo, $\dfrac{\mu_0I_0}{2\pi}(1/R - 1/r)\hat\varphi$ e $\dfrac{\mu_0I_0}{2\pi r}\hat\varphi$; fio em $Z$ com $-I_0$; $\Gamma_C = \mu_0I_0/4$.`,
        errosComuns: ['Esquecer que $I_\\text{enc}$ começa a contar em $R$, não em 0.', 'Contar os trechos radiais na circulação.', 'Na curva $C$, usar a corrente total: ela envolve só um quarto.'],
        oficial: { resposta: r`$\Gamma_C = \mu_0I_0/4$; fio em $Z$ com $-I_0$.` },
      },
    },
  ],
}

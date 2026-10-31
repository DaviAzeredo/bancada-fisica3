import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: até 8 capacitores iguais, enfileirados. */
const NMAX = 8
const fila: ObjetoInput[] = Array.from({ length: NMAX }, (_, i) => ({
  id: `c${i}`,
  tipo: 'capacitor',
  ativo: `Nc > ${i}`,
  centro: [`(${i} - (Nc - 1)/2)*0.022`, 0, 0],
  eixo: 'x',
  lado: 0.05,
  d: 0.01,
  Q: 1e-10,
}))

/* Objetiva 3: os dois fios, com arcos em trechos retos. */
const N = 16
const arco = (pre: string, I: string, R: string, ini: number, ab: number): ObjetoInput[] =>
  Array.from({ length: N }, (_, i) => {
    const p = (k: number): [string, string, number] => [`${R}*cos(rad(${ini + (k * ab) / N}))`, `${R}*sin(rad(${ini + (k * ab) / N}))`, 0]
    return { id: `${pre}${i}`, tipo: 'fio', I, a: p(i), b: p(i + 1) }
  })

const Ifios = '2*pi*I0/(pi + 2)'

/* Objetiva 5: quatro espiras quadradas; s é a distância do lado mais próximo ao fio. */
const fluxoQ = (s: string) => `mu0*I0*aa/(2*pi)*ln((${s} + aa)/${s})`
const s1 = '(s0 + v*(t + t0))'
const s2 = '(s0 - v*(t + t0))'

/* Discursiva. */
const Ieq = (s: string) => `(6*Ic/a^3*(a*min(${s}, a)^2/2 - min(${s}, a)^3/3) - (${s} > b ? Ic : 0))`

export const p3_2024_1_noturno: ProvaInput = {
  id: 'p3-2024-1-noturno',
  titulo: 'P3 · 2024/1 · Noturno',
  subtitulo: 'Física III · Terceira Prova · Versão A · 04/07/2024',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quantos capacitores no grupo?',
      resumo: 'Em paralelo, 25 vezes mais que em série.',
      enunciado: r`Um grupo de capacitores idênticos é conectado primeiro em série e depois em paralelo. A capacitância equivalente da conexão em paralelo é 25 vezes maior que a da conexão em série. Quantos capacitores existem neste grupo?`,
      figura: { pagina: 1, recorte: [0.03, 0.36, 0.49, 0.455] },
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [6, 11, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Nc', rotulo: 'Número de capacitores', simbolo: 'N', valor: 3, min: 2, max: 8, passo: 1 },
        { id: 'C0', rotulo: 'Capacitância de cada um', simbolo: 'C', valor: 2e-12, unidade: 'F', min: 1e-12, max: 5e-12, passo: 1e-13 },
      ],
      objetos: fila,
      medidas: [
        { rotulo: 'Em série', simbolo: r`C_s = C/N`, expr: 'C0/Nc', unidade: 'F' },
        { rotulo: 'Em paralelo', simbolo: r`C_p = NC`, expr: 'Nc*C0', unidade: 'F' },
        { rotulo: 'Razão', simbolo: r`C_p/C_s`, expr: '(Nc*C0)/(C0/Nc)', unidade: '', teoria: 'Nc^2' },
      ],
      passos: [
        { titulo: 'Escrever as duas capacitâncias', texto: r`$N$ capacitores iguais: em série, $1/C_s = N/C$, logo $C_s = C/N$. Em paralelo, $C_p = NC$.`, medidas: [0, 1] },
        {
          titulo: 'Impor a razão',
          texto: r`$$\frac{C_p}{C_s} = N^2 = 25\quad\Rightarrow\quad N = 5$$
Alternativa **(a)**. Ajuste $N$ até a razão dar 25.`,
          parametros: { Nc: 5 },
          medidas: [2],
        },
      ],
      alternativas: [
        { letra: 'a', texto: '5.', correta: true, porque: r`$N^2 = 25$.` },
        { letra: 'b', texto: '25.', porque: r`Esquece que a razão é $N^2$, não $N$.` },
        { letra: 'c', texto: r`$\dfrac{1}{25}$.`, porque: r`Inverte a razão, e $N$ precisa ser inteiro.` },
        { letra: 'd', texto: '10.', porque: r`Toma $2N = 25$, ou algo parecido: a razão não é linear em $N$.` },
        { letra: 'e', texto: '4.', porque: r`Daria razão 16.` },
        { letra: 'f', texto: r`$\dfrac15$.`, porque: r`Inverte a raiz; o número de capacitores não pode ser fração.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'associacao' }],
        etapas: [
          { titulo: 'Equivalentes', texto: r`$C_s = C/N$ e $C_p = NC$.`, passo: 0 },
          { titulo: 'Razão', texto: r`$C_p/C_s = N^2 = 25$, logo $N = 5$.`, passo: 1 },
        ],
        resultado: '5 capacitores: alternativa (a).',
        errosComuns: ['Igualar a razão a $N$, em vez de $N^2$.'],
        oficial: { resposta: '(a)' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Carga a partir de V(r)',
      resumo: 'Esfera dentro de uma casca aterrada: derivar V e usar Gauss.',
      enunciado: r`Considere uma casca esférica condutora fina, de raio $b$, conectada à Terra, e, internamente concêntrica com tal casca, uma esfera maciça condutora, de raio $a$. O potencial na região $a \le r \le b$ é descrito por
$$V(r) = \frac{a\cdot V_0}{b - a}\left(\frac br - 1\right),$$
onde $V_0$ é o potencial na superfície da esfera maciça. Determine a carga total da esfera maciça, considerando o sistema em equilíbrio eletrostático. Sugestão: considere utilizar a lei de Gauss.`,
      figura: [
        { pagina: 1, recorte: [0.51, 0.04, 0.97, 0.285] },
        { pagina: 1, recorte: [0.7, 0.33, 0.895, 0.565] },
      ],
      cena: { escala: 0.002, extensao: 24, unidade: 'cm', plano: 'xy', camera: { pos: [10, 8, 74], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Potencial da esfera', simbolo: 'V_0', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'a', rotulo: 'Raio da esfera', simbolo: 'a', valor: 0.018, unidade: 'm', min: 0.008, max: 0.028, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.03, max: 0.046, passo: 0.001 },
        { id: 'rs', rotulo: 'Posição do ponto', simbolo: 'r', valor: 0.03, unidade: 'm', min: 0.008, max: 0.046, passo: 0.001 },
      ],
      objetos: [{ id: 'cap', tipo: 'capacitorRadial', forma: 'esfera', centro: [0, 0, 0], a: 'a', b: 'b', V: 'V0' }],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Potencial simulado, com a casca em zero', simbolo: 'V(r)', expr: 'V(max(min(rs, b), a), 0, 0) - V(b, 0, 0)', unidade: 'V', teoria: 'a*V0/(b - a)*(b/max(min(rs, b), a) - 1)' },
        { rotulo: 'Campo em r', simbolo: r`E = \frac{abV_0}{(b - a)r^2}`, expr: 'mag(E(max(min(rs, 0.99*b), 1.01*a), 0, 0))', unidade: 'V/m', teoria: 'a*b*V0/((b - a)*max(min(rs, 0.99*b), 1.01*a)^2)' },
        { rotulo: 'Carga na esfera', simbolo: 'Q', expr: "Q('cap')", unidade: 'C', teoria: '4*pi*eps0*a*b*V0/(b - a)' },
      ],
      passos: [
        {
          titulo: 'Do potencial ao campo',
          texto: r`Com simetria esférica, $E = -dV/dr$:
$$E(r) = \frac{aV_0}{b - a}\cdot\frac{b}{r^2} = \frac{abV_0}{(b - a)r^2}$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Do campo à carga',
          texto: r`Uma gaussiana esférica de raio $r$, entre $a$ e $b$, envolve só a esfera:
$$4\pi r^2E = \frac{Q}{\varepsilon_0}\quad\Rightarrow\quad Q = \frac{4\pi\varepsilon_0abV_0}{b - a}$$
O $r$ cancela, como tinha de ser. Alternativa **(a)**.`,
          medidas: [2],
        },
        {
          titulo: 'Outro jeito de ver',
          texto: r`O sistema é um capacitor esférico de capacitância $C = 4\pi\varepsilon_0ab/(b - a)$, com ddp $V_0$. Então $Q = CV_0$ dá o mesmo resultado. Reconhecer isso economiza a conta.`,
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{4\pi\epsilon_0abV_0}{b - a}$`, correta: true, porque: r`$E = -dV/dr$ e Gauss; ou $Q = CV_0$ com o $C$ do capacitor esférico.` },
        { letra: 'b', texto: r`$\dfrac{4\pi\epsilon_0a(b - a)V_0}{b + a}$`, porque: r`Não vem de nenhuma derivada de $V(r)$.` },
        { letra: 'c', texto: r`$\dfrac{\pi\epsilon_0b^2V_0}{-b + a}$`, porque: r`Tem o sinal negativo: com $V_0 > 0$ a carga é positiva.` },
        { letra: 'd', texto: r`$\dfrac{4\pi\epsilon_0a^2V_0}{b}$`, porque: r`Erra a dimensão relativa: o fator $b - a$ tem de aparecer, porque a casca aterrada altera a carga.` },
        { letra: 'e', texto: r`$\dfrac{4\pi\epsilon_0abV_0}{2b + a}$`, porque: r`Erra o denominador da derivada.` },
        { letra: 'f', texto: r`$\dfrac{4\pi\epsilon_0a^2V_0}{b + a}$`, porque: r`Soma os raios, quando o potencial depende da diferença.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo como gradiente do potencial', lab: 'potencial' }, { texto: 'Capacitor esférico', lab: 'capacitor' }, { texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Derivar', texto: r`$E = -dV/dr = abV_0/[(b - a)r^2]$.`, passo: 0 },
          { titulo: 'Gauss', texto: r`$Q = 4\pi\varepsilon_0r^2E = 4\pi\varepsilon_0abV_0/(b - a)$.`, passo: 1 },
        ],
        resultado: r`$Q = \dfrac{4\pi\varepsilon_0abV_0}{b - a}$: alternativa (a).`,
        errosComuns: ['Esquecer o sinal de menos em $E = -dV/dr$.', 'Usar a carga de uma esfera isolada, $4\\pi\\varepsilon_0aV_0$, ignorando a casca.'],
        oficial: { resposta: '(a)' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Anular B na origem com dois fios',
      resumo: 'Arcos de raios R e 2R e um trecho reto que não aponta para a origem.',
      enunciado: r`Considere dois fios infinitos e finos dispostos como na figura. O primeiro possui dois trechos retos e um arco de um quarto de circunferência de raio $R$. O segundo também possui dois trechos retos e um quarto de circunferência, de raio $2R$. Uma corrente $I$ percorre o primeiro fio no sentido indicado, e o segundo é atravessado por uma corrente no sentido indicado. Determine a intensidade da corrente no segundo fio para que o campo magnético na origem seja nulo.`,
      figura: [
        { pagina: 2, recorte: [0.03, 0.04, 0.49, 0.26] },
        { pagina: 2, recorte: [0.19, 0.27, 0.42, 0.61] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no fio 1', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'I2', rotulo: 'Corrente no fio 2', simbolo: 'I_2', valor: 6, unidade: 'A', min: 0, max: 30, passo: 0.1 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.015, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'a1', tipo: 'fio', I: 'I0', a: [0, 0.085, 0], b: [0, 'R', 0], infinito: 'a', rotulo: '1º fio' },
        ...arco('u', 'I0', 'R', 90, 90),
        { id: 'a2', tipo: 'fio', I: 'I0', a: ['0-R', 0, 0], b: [-0.085, 0, 0], infinito: 'b' },
        { id: 'b1', tipo: 'fio', I: 'I2', a: ['2*R', 0.085, 0], b: ['2*R', 0, 0], infinito: 'a', rotulo: '2º fio' },
        ...arco('v', 'I2', '2*R', 0, -90),
        { id: 'b2', tipo: 'fio', I: 'I2', a: [0, '-2*R', 0], b: [0, -0.085, 0], infinito: 'b' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      medidas: [
        { rotulo: 'Trecho alinhado com a origem', simbolo: 'B', expr: "mag(Bde('a1', 0, 0, 0))", unidade: 'T', teoria: '0' },
        { rotulo: 'Trecho reto a 2R da origem', simbolo: r`\frac{\mu_0I_2}{8\pi R}`, expr: "0 - z(Bde('b1', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I2/(8*pi*R)' },
        { rotulo: 'Corrente que anula o campo', simbolo: r`I_2 = \frac{2\pi I}{\pi + 2}`, expr: Ifios, unidade: 'A' },
        { rotulo: 'Campo total na origem', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(8*R) - mu0*I2/(16*R) - mu0*I2/(8*pi*R)' },
      ],
      passos: [
        {
          titulo: 'Fio 1: só o arco conta',
          texto: r`Os dois trechos retos apontam para a origem: $d\vec\ell \parallel \hat r$ e a contribuição é nula. Sobra um quarto de espira, anti-horário:
$$B_1 = \frac14\cdot\frac{\mu_0I}{2R} = \frac{\mu_0I}{8R}\quad\text{(saindo)}$$`,
          medidas: [0],
        },
        {
          titulo: 'Fio 2: atenção ao trecho reto',
          texto: r`O trecho de baixo aponta para a origem, mas o de cima **não**: é uma semirreta a uma distância $2R$, que contribui com $\mu_0I_2/4\pi(2R)$. Ele e o arco horário, $\mu_0I_2/8(2R)$, entram na página:
$$B_2 = \frac{\mu_0I_2}{8\pi R} + \frac{\mu_0I_2}{16R}$$`,
          medidas: [1],
        },
        {
          titulo: 'Igualar',
          texto: r`$$\frac{\mu_0I}{8R} = \frac{\mu_0I_2(2 + \pi)}{16\pi R}\quad\Rightarrow\quad I_2 = \frac{2\pi I}{\pi + 2}$$
Alternativa **(c)**. Com esses valores, o campo total vai a zero.`,
          parametros: { I2: 6.11 },
          medidas: [2, 3],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\pi I}{\pi + 1}$`, porque: r`Erra o fator da semirreta.` },
        { letra: 'b', texto: '$2I$', porque: r`Conta só os arcos: é o resultado sem o trecho reto a $2R$.` },
        { letra: 'c', texto: r`$\dfrac{2\pi I}{\pi + 2}$`, correta: true, porque: r`Arco de $R$ contra arco de $2R$ mais a semirreta a $2R$.` },
        { letra: 'd', texto: r`$\dfrac{\pi I}{2}$`, porque: r`Usa a semirreta e esquece o arco de $2R$.` },
        { letra: 'e', texto: r`$\dfrac{2I}{2\pi + 1}$`, porque: r`Inverte a razão entre os termos.` },
        { letra: 'f', texto: r`$\dfrac{4\pi I}{\pi + 2}$`, porque: r`Usa $R$ em vez de $2R$ em algum termo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart por trechos', lab: 'trechos' }, { texto: 'Trechos alinhados não contribuem' }],
        etapas: [
          { titulo: 'Fio 1', texto: r`$B_1 = \mu_0I/8R$.`, passo: 0 },
          { titulo: 'Fio 2', texto: r`$B_2 = \mu_0I_2/16R + \mu_0I_2/8\pi R$.`, passo: 1 },
          { titulo: 'Campo nulo', texto: r`$B_1 = B_2$ dá $I_2 = 2\pi I/(\pi + 2)$.`, passo: 2 },
        ],
        resultado: r`$I_2 = \dfrac{2\pi I}{\pi + 2}$: alternativa (c).`,
        errosComuns: ['Supor que todos os trechos retos apontam para a origem: olhe um por um.', 'Usar o fio infinito inteiro, em vez da semirreta.'],
        oficial: { resposta: '(c)' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Força num fio torto em B uniforme',
      resumo: 'Só importa o vetor que liga as pontas do fio.',
      enunciado: r`O cubo de lado $a$ encontra-se em uma região com campo magnético uniforme e constante $\vec B = B_0\hat y$ ($B_0 > 0$). Se um fio que conduz uma corrente $I$ adota o formato da figura, qual alternativa expressa a força que o fio experimentará entre os pontos $\mathcal O$ e $\mathcal P$, de coordenadas $(0, 0, 0)$ e $(a, a, 0)$?`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.04, 0.97, 0.19] },
        { pagina: 2, recorte: [0.67, 0.19, 0.87, 0.4] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [12, 8, 14], alvo: [2, 3, 2] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B_0', valor: 0.2, unidade: 'T', min: 0.05, max: 0.5, passo: 0.01 },
        { id: 'a', rotulo: 'Aresta do cubo', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.02, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bu', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'f1', tipo: 'fio', I: 'I0', a: [0, 0, 0], b: ['a', 0, 'a'] },
        { id: 'f2', tipo: 'fio', I: 'I0', a: ['a', 0, 'a'], b: ['a', 'a', 'a'] },
        { id: 'f3', tipo: 'fio', I: 'I0', a: ['a', 'a', 'a'], b: ['a', 'a', 0], rotulo: 'I' },
        { id: 'tO', tipo: 'rotulo', pos: [0, -0.008, 0], texto: 'O' },
        { id: 'tP', tipo: 'rotulo', pos: ['a', 'a', -0.008], texto: 'P' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Força no trecho 1', simbolo: 'F_1', expr: "z(forca('f1','Bu'))", unidade: 'N', teoria: 'I0*a*B0' },
        { rotulo: 'Força no trecho 2, paralelo a B', simbolo: 'F_2', expr: "mag(forca('f2','Bu'))", unidade: 'N', teoria: '0' },
        { rotulo: 'Força no trecho 3', simbolo: 'F_3', expr: "x(forca('f3','Bu'))", unidade: 'N', teoria: 'I0*a*B0' },
        { rotulo: 'Força total, em z', simbolo: r`F_z = IaB_0`, expr: "z(forca('f1','Bu')) + z(forca('f2','Bu')) + z(forca('f3','Bu'))", unidade: 'N', teoria: 'I0*a*B0' },
        { rotulo: 'Força total, em x', simbolo: 'F_x', expr: "x(forca('f1','Bu')) + x(forca('f2','Bu')) + x(forca('f3','Bu'))", unidade: 'N', teoria: '0' },
      ],
      passos: [
        {
          titulo: 'O atalho',
          texto: r`Em campo **uniforme**, $\vec B$ sai da integral:
$$\vec F = I\left(\int d\vec\ell\right)\times\vec B = I\,\vec L\times\vec B$$
com $\vec L$ o vetor que liga o início ao fim do fio. O formato não importa.`,
        },
        {
          titulo: 'Calcular',
          texto: r`$\vec L = \overrightarrow{OP} = a\hat x + a\hat y$. Então
$$\vec F = I(a\hat x + a\hat y)\times B_0\hat y = IaB_0\,\hat z$$
porque $\hat y\times\hat y = 0$. Alternativa **(d)**.`,
          medidas: [3, 4],
        },
        { titulo: 'Conferir trecho por trecho', texto: r`Somando as forças de cada trecho, as componentes em $x$ se cancelam e sobra $IaB_0\hat z$, como previsto. O caminho desenhado aqui é um dos possíveis: qualquer outro entre $\mathcal O$ e $\mathcal P$ dá o mesmo.`, medidas: [0, 1, 2] },
      ],
      alternativas: [
        { letra: 'a', texto: r`$2\sqrt2\,IaB_0\hat z$`, porque: r`Usa o comprimento do fio, e não o vetor que liga as pontas.` },
        { letra: 'b', texto: r`$(\sqrt2 + 2)IaB_0\hat z$`, porque: r`Soma os módulos dos trechos, ignorando direções.` },
        { letra: 'c', texto: r`$\dfrac{IaB_0}{2}\hat z$`, porque: r`Fator $1/2$ sem origem.` },
        { letra: 'd', texto: r`$IaB_0\hat z$`, correta: true, porque: r`$\vec L\times\vec B$ com $\vec L = a\hat x + a\hat y$.` },
        { letra: 'e', texto: r`$-IaB_0\hat y$`, porque: r`A força é perpendicular a $\vec B$, então não pode estar em $\hat y$.` },
        { letra: 'f', texto: r`$-\sqrt2\,IaB_0\hat z$`, porque: r`Usa $|\vec L| = a\sqrt2$ sem o $\sin$ do ângulo, e erra o sinal.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força em fio em campo uniforme', lab: 'forcas' }],
        etapas: [
          { titulo: 'Tirar B da integral', texto: r`$\vec F = I\vec L\times\vec B$.`, passo: 0 },
          { titulo: 'Produto vetorial', texto: r`$(a\hat x + a\hat y)\times\hat y = a\hat z$.`, passo: 1 },
        ],
        resultado: r`$\vec F = IaB_0\hat z$: alternativa (d).`,
        errosComuns: ['Somar os comprimentos dos trechos.', 'Usar $|\\vec L|$ sem considerar o ângulo com $\\vec B$.'],
        oficial: { resposta: '(d)' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quatro espiras em volta de um fio',
      resumo: 'Para cada uma: B de que lado, e o fluxo sobe ou desce?',
      enunciado: r`A corrente $I$ em um fio longo e retilíneo é constante e orientada para a direita. As espiras condutoras $A$, $B$, $C$ e $D$ estão se movendo nas direções indicadas, próximas ao fio: $A$ (acima do fio) sobe; $B$ (abaixo) desce; $C$ (acima) anda paralela ao fio, para a direita; $D$ (abaixo) sobe, aproximando-se dele. Qual afirmação é correta sobre o sentido da corrente induzida em cada espira?`,
      figura: [
        { pagina: 3, recorte: [0.03, 0.04, 0.49, 0.165] },
        { pagina: 3, recorte: [0.12, 0.39, 0.39, 0.74] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 23], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 1 } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 2, max: 50, passo: 1 },
        { id: 'aa', rotulo: 'Lado das espiras', simbolo: 'a', valor: 0.025, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
        { id: 's0', rotulo: 'Distância inicial', simbolo: 's_0', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.001 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.01, unidade: 'm/s', min: 0.002, max: 0.015, passo: 0.001 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0.1, unidade: 's', min: 0.1, max: 0.5, passo: 0.1 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 1, unidade: 'Ω', min: 0.1, max: 5, passo: 0.1 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'x', rotulo: 'I' },
        { id: 'A', tipo: 'espiraSensora', centro: [-0.04, `${s1} + aa/2`, 0], normal: 'z', largura: 'aa', altura: 'aa', eixoU: 'x', R: 'Rr', rotulo: 'A' },
        { id: 'C', tipo: 'espiraSensora', centro: [`0.03 + v*(t + t0)`, 's0 + aa/2', 0], normal: 'z', largura: 'aa', altura: 'aa', eixoU: 'x', R: 'Rr', rotulo: 'C' },
        { id: 'B', tipo: 'espiraSensora', centro: [-0.04, `0 - ${s1} - aa/2`, 0], normal: 'z', largura: 'aa', altura: 'aa', eixoU: 'x', R: 'Rr', rotulo: 'B' },
        { id: 'D', tipo: 'espiraSensora', centro: [0.03, `0 - ${s2} - aa/2`, 0], normal: 'z', largura: 'aa', altura: 'aa', eixoU: 'x', R: 'Rr', rotulo: 'D' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo em A: sai da página', simbolo: r`\Phi_A`, expr: "fluxoB('A')", unidade: 'Wb', teoria: fluxoQ(s1) },
        { rotulo: 'fem em A: positiva é anti-horária', simbolo: r`\varepsilon_A`, expr: "fem('A')", unidade: 'V', teoria: `mu0*I0*aa*v/(2*pi)*(1/${s1} - 1/(${s1} + aa))` },
        { rotulo: 'fem em B', simbolo: r`\varepsilon_B`, expr: "fem('B')", unidade: 'V', teoria: `0 - mu0*I0*aa*v/(2*pi)*(1/${s1} - 1/(${s1} + aa))` },
        { rotulo: 'fem em C', simbolo: r`\varepsilon_C`, expr: "fem('C')", unidade: 'V', teoria: '0' },
        { rotulo: 'fem em D', simbolo: r`\varepsilon_D`, expr: "fem('D')", unidade: 'V', teoria: `mu0*I0*aa*v/(2*pi)*(1/${s2} - 1/(${s2} + aa))` },
      ],
      passos: [
        {
          titulo: 'O campo do fio',
          texto: r`Corrente para a direita: pela mão direita, $\vec B$ **sai** da página acima do fio e **entra** abaixo dele. E cai com a distância.`,
        },
        {
          titulo: 'Espira A',
          texto: r`Fica acima e se afasta: o fluxo para fora **diminui**. A corrente induzida tenta repor esse fluxo, criando campo para fora: **anti-horária**.`,
          destacar: ['A'],
          medidas: [0, 1],
        },
        { titulo: 'Espira B', texto: r`Fica abaixo e se afasta: o fluxo para dentro diminui. A corrente cria campo para dentro: **horária**.`, destacar: ['B'], medidas: [2] },
        { titulo: 'Espira C', texto: r`Anda paralela ao fio, sem mudar a distância: o fluxo não muda e $I_\text{ind} = 0$.`, destacar: ['C'], medidas: [3] },
        {
          titulo: 'Espira D',
          texto: r`Fica abaixo e se aproxima: o fluxo para dentro **aumenta**. A corrente se opõe, criando campo para fora: **anti-horária**. Alternativa **(d)**.`,
          destacar: ['D'],
          medidas: [4],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$A$: anti-horário, $B$: anti-horário, $C$: $I_\text{ind} = 0$ e $D$: horário.`, porque: r`Esquece que o campo abaixo do fio tem o sentido oposto.` },
        { letra: 'b', texto: r`$A$: anti-horário, $B$: horário, $C$: $I_\text{ind} = 0$ e $D$: horário.`, porque: r`Erra $D$: ela se aproxima, ao contrário de $B$.` },
        { letra: 'c', texto: r`$A$: horário, $B$: horário, $C$: $I_\text{ind} = 0$ e $D$: anti-horário.`, porque: r`Erra $A$: a corrente tende a repor o fluxo que diminui.` },
        { letra: 'd', texto: r`$A$: anti-horário, $B$: horário, $C$: $I_\text{ind} = 0$ e $D$: anti-horário.`, correta: true, porque: r`Lenz aplicado a cada espira, com $\vec B$ saindo acima e entrando abaixo do fio.` },
        { letra: 'e', texto: r`$A$: anti-horário, $B$: horário, $C$: anti-horário e $D$: horário.`, porque: r`Em $C$, o fluxo não muda.` },
        { letra: 'f', texto: r`$A$: horário, $B$: horário, $C$: horário e $D$: anti-horário.`, porque: r`Em $C$ não há fem, e $A$ está errada.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Lenz', lab: 'movimento' }, { texto: 'Campo de um fio longo', lab: 'ampere' }],
        etapas: [
          { titulo: 'Campo', texto: r`Saindo acima do fio, entrando abaixo.`, passo: 0 },
          { titulo: 'Cada espira', texto: r`$A$: fluxo para fora cai, anti-horária. $B$: fluxo para dentro cai, horária. $C$: fluxo fixo, zero. $D$: fluxo para dentro sobe, anti-horária.`, passo: 1 },
        ],
        resultado: 'A: anti-horário, B: horário, C: nula e D: anti-horário: alternativa (d).',
        errosComuns: ['Olhar só o movimento e esquecer de qual lado do fio a espira está.', 'Achar que $C$ tem fem por estar em movimento.'],
        oficial: { resposta: '(d)' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'B = at(b − t) numa espira circular',
      resumo: 'O campo ainda aponta para fora, mas já está caindo.',
      enunciado: r`Considere uma espira circular fina e condutora de raio $R$, no plano $XY$, imersa em um campo uniforme, porém não estacionário, $\vec B = at(b - t)\hat z$, com $a$ e $b$ constantes positivas. Para $t = (3/4)b$, qual alternativa indica o módulo da força eletromotriz induzida e o sentido da corrente induzida?`,
      figura: [
        { pagina: 3, recorte: [0.51, 0.04, 0.97, 0.212] },
        { pagina: 3, recorte: [0.74, 0.18, 0.92, 0.43] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 20], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 4 } },
      parametros: [
        { id: 'aa', rotulo: 'Constante a', simbolo: 'a', valor: 0.1, unidade: 'T/s²', min: 0.02, max: 0.3, passo: 0.01 },
        { id: 'bb', rotulo: 'Constante b', simbolo: 'b', valor: 4, unidade: 's', min: 2, max: 6, passo: 0.1 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.07, passo: 0.002 },
        { id: 't0', rotulo: 'Instante do início', simbolo: 't_0', valor: 3, unidade: 's', min: 0, max: 5, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'aa*(t + t0)*(bb - t - t0)'], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: 'R', R: 1, rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 9 },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: 'pi*R^2*aa*(t + t0)*(bb - t - t0)' },
        { rotulo: 'fem: positiva é anti-horária', simbolo: r`\varepsilon = -\pi R^2a(b - 2t)`, expr: "fem('S')", unidade: 'V', teoria: '0 - pi*R^2*aa*(bb - 2*(t + t0))' },
        { rotulo: 'fem em t = 3b/4', simbolo: r`\frac{ab\pi R^2}{2}`, expr: 'pi*R^2*aa*bb/2', unidade: 'V' },
      ],
      graficos: [
        {
          titulo: 'B e fem ao longo do tempo',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 'bb', rotulo: 't', unidade: 's' },
          series: [
            { rotulo: 'B', expr: 'aa*tt*(bb - tt)', unidade: 'T' },
            { rotulo: 'ε', expr: '0 - pi*R^2*aa*(bb - 2*tt)', unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Derivar o fluxo',
          texto: r`$\Phi_B = \pi R^2at(b - t)$, com $\hat n = \hat z$. Então
$$\varepsilon = -\frac{d\Phi_B}{dt} = -\pi R^2a(b - 2t)$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Avaliar em t = 3b/4',
          texto: r`$$\varepsilon = -\pi R^2a\left(b - \frac{3b}{2}\right) = +\frac{ab\pi R^2}{2}$$`,
          medidas: [2],
        },
        {
          titulo: 'Sentido',
          texto: r`Com $\hat n = \hat z$, fem positiva é **anti-horária**. Faz sentido pela lei de Lenz: em $t = 3b/4$ o campo ainda sai, mas já **diminui** (o máximo foi em $t = b/2$), e a corrente tenta sustentá-lo. Alternativa **(f)**.`,
          medidas: [1],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{ab\pi R^2}{4}$, anti-horário.`, porque: r`Sentido certo, módulo errado: confere a derivada.` },
        { letra: 'b', texto: r`$ab\pi R^2$, anti-horário.`, porque: r`Usa $b - 2t$ com $t = b$.` },
        { letra: 'c', texto: r`$\dfrac{ab\pi R^2}{2}$, horário.`, porque: r`Módulo certo, mas o sentido ignora que $\vec B$ está diminuindo.` },
        { letra: 'd', texto: r`$ab\pi R^2$, horário.`, porque: r`Erra o módulo e o sentido.` },
        { letra: 'e', texto: r`$\dfrac{ab\pi R^2}{4}$, horário.`, porque: r`Erra o módulo e o sentido.` },
        { letra: 'f', texto: r`$\dfrac{ab\pi R^2}{2}$, anti-horário.`, correta: true, porque: r`$|\varepsilon| = \pi R^2a|b - 2t|$ em $t = 3b/4$, e Lenz sustenta o campo que cai.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }, { texto: 'Lei de Lenz', lab: 'movimento' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`$\Phi = \pi R^2at(b - t)$.`, passo: 0 },
          { titulo: 'Derivada', texto: r`$\varepsilon = -\pi R^2a(b - 2t)$; em $t = 3b/4$, $\varepsilon = +ab\pi R^2/2$.`, passo: 1 },
          { titulo: 'Sentido', texto: r`Positiva em relação a $\hat z$: anti-horário.`, passo: 2 },
        ],
        resultado: r`$|\varepsilon| = ab\pi R^2/2$, anti-horário: alternativa (f).`,
        errosComuns: ['Olhar o sentido de $\\vec B$, e não o de $d\\vec B/dt$.', 'Usar o valor de $B$ no instante, em vez da derivada.'],
        oficial: { resposta: '(f)' },
      },
    },

    /* ───────────────────────── D1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Cabo coaxial com J(s) = A(a − s)/2π',
      resumo: 'Da condição de B nulo fora até o máximo em s = 3a/4.',
      enunciado: r`Considere um cabo coaxial infinito, composto por um cilindro condutor sólido de raio $a$ e uma casca cilíndrica condutora fina de raio $b$. O cilindro possui uma densidade de corrente estacionária e não uniforme, $\vec J(s) = A(a - s)/(2\pi)\,\hat z$ para $s \le a$, com $A$ constante positiva. A casca conduz uma corrente estacionária $I$ no sentido oposto, ou seja, na direção $-\hat z$. Considerando que o módulo do campo magnético fora do cabo ($s > b$) é zero:

(a) Determine a expressão de $A$. [1,0]

(b) Aplicando a lei de Ampère, determine os campos nas regiões $s \le a$ e $a < s \le b$. [1,5]

(c) Determine a distância radial onde o módulo do campo assume seu maior valor, e a expressão do campo nesse ponto. [1,0]

(d) Faça um gráfico do módulo do campo em função de $s$, destacando os pontos relevantes. [0,5]`,
      figura: { pagina: 4, recorte: [0.03, 0.08, 0.49, 0.93] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 21], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Ic', rotulo: 'Corrente', simbolo: 'I', valor: 50, unidade: 'A', min: 5, max: 100, passo: 1 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.015, max: 0.04, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.06, unidade: 'm', min: 0.045, max: 0.075, passo: 0.001 },
        { id: 'rs', rotulo: 'Raio da amperiana', simbolo: 's', valor: 0.0225, unidade: 'm', min: 0.004, max: 0.085, passo: 0.0005 },
      ],
      objetos: [
        { id: 'nu', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', J: '6*Ic/a^3*(a - r)/(2*pi)', rotulo: 'J(s)' },
        { id: 'ca', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'b*1.01', raioInterno: 'b', I: '0-Ic', rotulo: 'casca' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13 },
      medidas: [
        { rotulo: 'Corrente no cilindro', simbolo: r`I_\text{cil} = Aa^3/6`, expr: 'Ic', unidade: 'A' },
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{enc}(s)`, expr: "Ienc('Amp')", unidade: 'A', teoria: `abs(rs - b) < 0.011*b ? Ienc('Amp') : ${Ieq('rs')}` },
        { rotulo: 'Campo em s', simbolo: r`B_\varphi(s)`, expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: `abs(rs - b) < 0.011*b ? y(B(rs, 0, 0)) : mu0*${Ieq('rs')}/(2*pi*rs)` },
        { rotulo: 'Campo máximo, em s = 3a/4', simbolo: r`B_\text{máx} = \frac{9\mu_0I}{16\pi a}`, expr: 'y(B(0.75*a, 0, 0))', unidade: 'T', teoria: '9*mu0*Ic/(16*pi*a)' },
        { rotulo: 'Campo fora do cabo', simbolo: 'B(s > b)', expr: 'mag(B(1.2*b, 0, 0))', unidade: 'T', teoria: '0' },
      ],
      graficos: [
        {
          titulo: 'Módulo do campo em função de s',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.002, ate: 0.085, rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulação', expr: 'mag(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: `ss > b ? 0 : mu0*${Ieq('ss')}/(2*pi*ss)`, unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: '(a) A condição fora do cabo',
          item: '(a)',
          texto: r`Com $\vec B = \vec 0$ fora, a corrente total envolvida é nula: $I_\text{cil} = I$. Integrando em anéis:
$$I_\text{cil} = \int_0^a\frac{A(a - s)}{2\pi}2\pi s\,ds = A\left(\frac{a^3}{2} - \frac{a^3}{3}\right) = \frac{Aa^3}{6}$$
$$A = \frac{6I}{a^3}$$`,
          parametros: { rs: 0.07 },
          medidas: [0, 4],
        },
        {
          titulo: '(b) Dentro do cilindro',
          item: '(b)',
          texto: r`Para $s \le a$, com amperiana circular de raio $s$:
$$I_\text{enc} = A\left(\frac{as^2}{2} - \frac{s^3}{3}\right),\qquad B = \frac{\mu_0I_\text{enc}}{2\pi s}$$
$$\vec B = \frac{3\mu_0I}{\pi a^3}\left(\frac{as}{2} - \frac{s^2}{3}\right)\hat\varphi$$`,
          parametros: { rs: 0.015 },
          medidas: [1, 2],
        },
        {
          titulo: '(b) Entre o cilindro e a casca',
          item: '(b)',
          texto: r`Para $a < s \le b$, toda a corrente do cilindro está dentro: $\vec B = \dfrac{\mu_0I}{2\pi s}\hat\varphi$.`,
          parametros: { rs: 0.045 },
          medidas: [1, 2],
        },
        {
          titulo: '(c) O máximo',
          item: '(c)',
          texto: r`$B$ cai com $1/s$ fora do cilindro, então o máximo fica dentro dele. Derivando:
$$\frac{dB}{ds} \propto \frac a2 - \frac{2s}{3} = 0\quad\Rightarrow\quad s = \frac{3a}{4}$$
$$B_\text{máx} = \frac{9\mu_0I}{16\pi a}$$
Note que ele **não** está na superfície, onde $B = 8\mu_0I/16\pi a$.`,
          parametros: { rs: 0.0225 },
          medidas: [3],
        },
        {
          titulo: '(d) O gráfico',
          item: '(d)',
          texto: r`$B$ parte de zero, sobe até o máximo em $3a/4$, cai suavemente até $\mu_0I/2\pi a$ em $s = a$, segue caindo com $1/s$ até $\mu_0I/2\pi b$ em $s = b$, e **salta** a zero na casca, que tem corrente superficial.`,
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$A = 6I/a^3$.`, pontos: 1 },
        { item: '(b)', texto: r`$s \le a$: $\vec B = \dfrac{3\mu_0I}{\pi a^3}\left(\dfrac{as}{2} - \dfrac{s^2}{3}\right)\hat\varphi$. $a < s \le b$: $\vec B = \dfrac{\mu_0I}{2\pi s}\hat\varphi$.`, pontos: 1.5 },
        { item: '(c)', texto: r`$s = 3a/4$ e $B_\text{máx} = 9\mu_0I/16\pi a$.`, pontos: 1 },
        { item: '(d)', texto: r`Sobe de 0 ao máximo em $3a/4$, cai até $\mu_0I/2\pi a$ em $a$, segue em $1/s$ até $\mu_0I/2\pi b$ em $b$ e salta a zero.`, pontos: 0.5 },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com J(s)', lab: 'ampereJ' }, { texto: 'Cabo coaxial', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Constante', texto: r`$B = 0$ fora exige $I_\text{cil} = I$, e a integral dá $A = 6I/a^3$.`, passo: 0 },
          { titulo: 'Campos', texto: r`Ampère com $I_\text{enc}(s)$ em cada região.`, passo: 1 },
          { titulo: 'Máximo', texto: r`$dB/ds = 0$ em $s = 3a/4$.`, passo: 3 },
          { titulo: 'Gráfico', texto: r`Parábola até $a$, $1/s$ até $b$, e salto a zero.`, passo: 4 },
        ],
        resultado: r`$A = 6I/a^3$; máximo $9\mu_0I/16\pi a$ em $s = 3a/4$; $B = 0$ fora do cabo.`,
        errosComuns: ['Supor o máximo em $s = a$, como no cilindro com $J$ uniforme.', 'Esquecer o salto em $s = b$ no gráfico.', 'Integrar $J$ sem o fator $2\\pi s$.'],
        oficial: { resposta: r`$A = 6I/a^3$; $B_\text{máx} = 9\mu_0I/16\pi a$ em $s = 3a/4$.` },
      },
    },
  ],
}

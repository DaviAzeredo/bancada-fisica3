import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: capacitância de C₁ na cena (C₂ tem o dobro, como na prova). */
const C1 = '(eps0*lado^2/d1)'
const Q1 = `(caso==1 ? 2/3*${C1}*V0 : ${C1}*V0)`
const Q2 = `(caso==1 ? 2/3*${C1}*V0 : 2*${C1}*V0)`

/* Objetiva 3: ponto de potencial nulo entre as duas cargas, separadas por 8 cm. */
const r1 = '(0.08*Qa/(Qa + Qb))'
const r2 = '(0.08*Qb/(Qa + Qb))'
const xP = `(-0.04 + ${r1})`

/* Objetiva 6: fase do campo oscilante. */
const FA = '(w*t + rad(fase))'

/**
 * Segunda chamada de Física III, 2023/1, noturno, versão A (20/07/2023). Conferida
 * com o gabarito oficial: objetivas 1b, 2e, 3e, 4h, 5b, 6f, e a discursiva.
 */
export const sc_2023_1_noturno: ProvaInput = {
  id: 'sc-2023-1-noturno',
  titulo: 'Segunda chamada · 2023/1 · Noturno',
  subtitulo: 'Física III · Segunda Chamada Noturna · Versão A · 20/07/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo e potencial entre duas cargas iguais',
      resumo: 'O campo se soma como vetor; o potencial, como número.',
      enunciado: r`Duas partículas carregadas e idênticas de carga $q > 0$ estão posicionadas sobre o eixo $\mathcal X$, a primeira na posição $x = -d$ e a segunda na posição $x = d$. O campo elétrico $\vec E$ e o potencial elétrico $V$ resultantes na origem são, respectivamente:`,
      figura: { pagina: 1, recorte: [0.03, 0.495, 0.255, 0.945] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Distância', simbolo: 'd', valor: 0.04, unidade: 'm', min: 0.02, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'qq', pos: ['-d', 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: 'qq', pos: ['d', 0, 0], rotulo: 'q' },
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' },
        { id: 's1', tipo: 'seta', papel: 'E', origem: [0, 0.008, 0], vetor: "Ede('c1', 0, 0, 0)", comprimento: '2.5*cm', rotulo: 'de −d' },
        { id: 's2', tipo: 'seta', papel: 'E', origem: [0, -0.008, 0], vetor: "Ede('c2', 0, 0, 0)", comprimento: '2.5*cm', rotulo: 'de +d' },
      ],
      visual: { setasE: true, equipotenciais: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo da carga em −d', simbolo: 'E_1', expr: "x(Ede('c1', 0, 0, 0))", unidade: 'V/m', teoria: 'k0*qq/d^2' },
        { rotulo: 'Campo da carga em +d', simbolo: 'E_2', expr: "x(Ede('c2', 0, 0, 0))", unidade: 'V/m', teoria: '0-k0*qq/d^2' },
        { rotulo: 'Campo total', simbolo: 'E', expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Potencial', simbolo: 'V', expr: 'V(0, 0, 0)', unidade: 'V', teoria: 'qq/(2*pi*eps0*d)' },
      ],
      passos: [
        {
          titulo: 'O campo',
          texto: r`Cada carga empurra para longe de si, com o mesmo módulo $k_0q/d^2$, e os sentidos são opostos: $\vec E = \vec 0$.`,
          medidas: [0, 1, 2],
          destacar: ['s1', 's2'],
        },
        {
          titulo: 'O potencial',
          previsao: { pergunta: 'Se o campo é nulo na origem, o potencial também é?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`O potencial é um escalar: os dois termos positivos se somam.

$$V = 2k_0\frac qd = \frac{q}{2\pi\varepsilon_0d}.$$

Campo nulo não quer dizer potencial nulo. Alternativa **(b)**.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Superposição de campos', lab: 'coulomb' },
          { texto: 'Potencial elétrico', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Campo', texto: r`Vetores opostos: $\vec E = \vec 0$.`, passo: 0 },
          { titulo: 'Potencial', texto: r`$V = 2k_0q/d = q/2\pi\varepsilon_0d$.`, passo: 1 },
        ],
        resultado: r`$\vec E = \vec 0$ e $V = \dfrac{q}{2\pi\varepsilon_0d}$: alternativa **(b)**.`,
        errosComuns: [
          r`Achar que campo nulo implica potencial nulo: $\vec E$ é a derivada de $V$, não $V$.`,
          r`Somar os módulos do campo sem olhar o sentido.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec 0$ e $0$`, porque: r`O potencial é a soma de dois termos positivos.` },
        { letra: 'b', texto: r`$\vec 0$ e $\dfrac{q}{2\pi\epsilon_0d}$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\dfrac{q}{2\pi\epsilon_0d^2}\hat x$ e $0$`, porque: r`Soma os módulos do campo e subtrai os potenciais: o contrário do certo.` },
        { letra: 'd', texto: r`$\dfrac{q}{2\pi\epsilon_0d^2}\hat x$ e $\dfrac{q}{2\pi\epsilon_0d}$`, porque: r`O potencial está certo, mas os campos se cancelam.` },
        { letra: 'e', texto: r`$-\dfrac{q}{2\pi\epsilon_0d^2}\hat x$ e $\dfrac{q}{2\pi\epsilon_0d}$`, porque: r`O potencial está certo, mas os campos se cancelam.` },
        { letra: 'f', texto: r`$-\dfrac{q}{2\pi\epsilon_0d^2}\hat x$ e $0$`, porque: r`Soma os módulos do campo e subtrai os potenciais.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quando a ddp em C₁ é maior que em C₂',
      resumo: 'Em paralelo, tensões iguais; em série, a menor capacitância leva mais.',
      enunciado: r`Considere 2 capacitores com capacitâncias $C_1 = 4\,\mu$F e $C_2 = 8\,\mu$F. Como devemos ligar os dois para que a diferença de potencial (ddp) sobre $C_1$ seja maior do que sobre $C_2$?`,
      figura: { pagina: 1, recorte: [0.27, 0.495, 0.49, 0.975] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [4, 7, 17], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Ligação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'em série' },
            { valor: 2, rotulo: 'em paralelo' },
          ],
        },
        { id: 'V0', rotulo: 'Bateria', simbolo: 'V_0', valor: 90, unidade: 'V', min: 10, max: 300, passo: 10 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06 },
        { id: 'd1', rotulo: 'Separação em C₁', simbolo: 'd_1', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
      ],
      objetos: [
        { id: 'c1', tipo: 'capacitor', rotulo: 'C₁', centro: [-0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1', Q: Q1 },
        { id: 'c2', tipo: 'capacitor', rotulo: 'C₂', centro: [0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1/2', Q: Q2 },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Razão das capacitâncias', simbolo: 'C_2/C_1', expr: "C('c2')/C('c1')", teoria: 2 },
        { rotulo: 'Tensão em C₁', simbolo: 'V_1', expr: "Q('c1')/C('c1')", unidade: 'V', teoria: 'caso==1 ? 2*V0/3 : V0' },
        { rotulo: 'Tensão em C₂', simbolo: 'V_2', expr: "Q('c2')/C('c2')", unidade: 'V', teoria: 'caso==1 ? V0/3 : V0' },
        { rotulo: 'V₁/V₂', simbolo: 'V_1/V_2', expr: "(Q('c1')/C('c1'))/(Q('c2')/C('c2'))", teoria: 'caso==1 ? 2 : 1' },
      ],
      passos: [
        {
          titulo: 'Em paralelo',
          texto: r`Os dois capacitores ficam entre os mesmos pontos: $V_1 = V_2$. Não serve.`,
          parametros: { caso: 2 },
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Em série',
          previsao: { pergunta: 'Em série, a maior tensão fica no capacitor de…', opcoes: ['menor capacitância', 'maior capacitância'], correta: 0 },
          texto: r`Mesma carga, e $V = Q/C$: quem tem menor capacitância leva mais tensão.

$$\frac{V_1}{V_2} = \frac{C_2}{C_1} = \frac{8}{4} = 2.$$

Alternativa **(e)**. A cena usa capacitâncias de picofarads, com a mesma razão 2.`,
          parametros: { caso: 1 },
          medidas: [0, 1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Paralelo', texto: r`$V_1 = V_2$.`, passo: 0 },
          { titulo: 'Série', texto: r`$V_1/V_2 = C_2/C_1 = 2$.`, passo: 1 },
        ],
        resultado: r`Em série: alternativa **(e)**.`,
        errosComuns: [
          r`Trocar os papéis de série e paralelo.`,
          r`Achar que a resposta depende da carga: em série, a razão só depende das capacitâncias.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Deve-se ligá-los em paralelo.', porque: r`Em paralelo, as tensões são iguais.` },
        { letra: 'b', texto: r`Não importa, pois a ddp sobre $C_1$ será sempre maior do que sobre $C_2$.`, porque: r`Em paralelo, elas são iguais.` },
        { letra: 'c', texto: r`Não é possível, pois a ddp sobre $C_1$ será sempre menor do que sobre $C_2$.`, porque: r`Em série, ela é o dobro.` },
        { letra: 'd', texto: 'Não é possível responder a pergunta sem saber a carga armazenada nos capacitores.', porque: r`A razão não depende da carga.` },
        { letra: 'e', texto: 'Deve-se ligá-los em série.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Ponto de potencial nulo',
      resumo: 'V = 0 significa trabalho nulo, não força nula.',
      enunciado: r`Duas partículas, com cargas elétricas $q_1$ e $q_2$ diferentes ($q_1 \neq q_2$), produzem um potencial elétrico nulo num ponto $P$ do espaço localizado a uma distância finita das duas partículas. Tomando o potencial como zero no infinito, isso significa necessariamente que:`,
      figura: { pagina: 1, recorte: [0.535, 0.02, 0.755, 0.705] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qa', rotulo: 'Carga positiva', simbolo: 'q_1', valor: 3e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'Qb', rotulo: 'Módulo da carga negativa', simbolo: '|q_2|', valor: 1e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'Qa', pos: [-0.04, 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: '0-Qb', pos: [0.04, 0, 0], rotulo: 'q₂' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [xP, 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, equipotenciais: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Potencial em P', simbolo: 'V', expr: `V(${xP}, 0, 0)`, unidade: 'V', teoria: 0 },
        { rotulo: 'Campo em P', simbolo: '|E|', expr: `mag(E(${xP}, 0, 0))`, unidade: 'V/m', teoria: `k0*(Qa/${r1}^2 + Qb/${r2}^2)` },
        { rotulo: 'Distância de P a q₁', simbolo: 'r_1', expr: r1, unidade: 'm' },
        { rotulo: 'Distância de P a q₂', simbolo: 'r_2', expr: r2, unidade: 'm' },
        { rotulo: 'Energia do par de cargas', simbolo: 'U', expr: "k0*Qa*(0-Qb)/0.08", unidade: 'J', teoria: '0-k0*Qa*Qb/0.08' },
      ],
      passos: [
        {
          titulo: 'O que V = 0 diz',
          texto: r`O potencial em $P$ é o trabalho, por unidade de carga, para trazer uma carga de teste do infinito até $P$. Se $V(P) = 0$, esse trabalho é **zero**. Esta é a alternativa **(e)**.`,
          medidas: [0],
        },
        {
          titulo: 'Mas há campo',
          previsao: { pergunta: 'Em P, com V = 0, uma carga de teste sente força?', opcoes: ['Não', 'Sim'], correta: 1 },
          texto: r`O campo é a derivada do potencial, não o potencial. Em $P$, as duas cargas puxam para o mesmo lado, e o campo é grande. A (a) é falsa.`,
          medidas: [1],
        },
        {
          titulo: 'Sinais e distâncias',
          texto: r`Para $V = k_0q_1/r_1 + k_0q_2/r_2$ se anular, os sinais têm de ser **opostos**: a (b) é falsa.

Com $|q_1|/r_1 = |q_2|/r_2$, o ponto $P$ fica mais perto da carga de **menor** módulo: a (d) é falsa. Na cena, $r_2 < r_1$.`,
          medidas: [2, 3],
        },
        {
          titulo: 'A energia do par',
          texto: r`O trabalho para aproximar as duas cargas é a energia $k_0q_1q_2/d$, que não é zero: a (c) é falsa.`,
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial e trabalho', lab: 'potencial' }],
        etapas: [
          { titulo: 'Significado', texto: r`$V(P) = 0$: trabalho nulo do infinito até $P$.`, passo: 0 },
          { titulo: 'Campo', texto: r`$\vec E(P)\neq\vec 0$: há força em $P$.`, passo: 1 },
          { titulo: 'Sinais', texto: r`Cargas opostas, com $P$ perto da menor.`, passo: 2 },
        ],
        resultado: r`O trabalho para trazer uma carga de teste até $P$ é zero: alternativa **(e)**.`,
        errosComuns: [
          r`Confundir potencial nulo com campo nulo.`,
          r`Pôr $P$ perto da maior carga: para compensar, a distância a ela tem de ser maior.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`Não há força elétrica atuando sobre uma outra partícula de teste carregada colocada no ponto $P$.`, porque: r`O campo em $P$ não é nulo.` },
        { letra: 'b', texto: r`As cargas $q_1$ e $q_2$ devem ter o mesmo sinal.`, porque: r`Com o mesmo sinal, a soma não se anula.` },
        { letra: 'c', texto: r`O trabalho para colocar a partícula de carga $q_1$ a uma distância $d$ da partícula de carga $q_2$ é zero.`, porque: r`Esse trabalho é $k_0q_1q_2/d$.` },
        { letra: 'd', texto: r`O ponto $P$ se localiza mais próximo a carga de maior módulo.`, porque: r`É o contrário: mais próximo da menor.` },
        { letra: 'e', texto: r`O trabalho para trazer uma partícula de teste carregada, desde o infinito até o ponto $P$, é zero.`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'O que fluxo negativo não garante',
      resumo: 'Só a carga líquida tem de ser negativa.',
      enunciado: r`Considere uma superfície fechada $\mathcal S$, com vetor unitário normal apontando para fora. Sabendo que o fluxo de campo elétrico através de $\mathcal S$ é negativo, considere as seguintes afirmativas: (I) Não pode haver partículas de carga positiva no interior de $\mathcal S$; (II) O campo elétrico deve necessariamente apontar para dentro de $\mathcal S$ em todos os pontos dessa superfície; (III) Não pode haver partículas de carga positiva no exterior de $\mathcal S$. São VERDADEIRAS as afirmativas:`,
      figura: { pagina: 1, recorte: [0.77, 0.02, 0.99, 0.615] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'neg', tipo: 'carga', q: '-2*Qq', pos: [-0.02, 0, 0], rotulo: '−2Q' },
        { id: 'pos', tipo: 'carga', q: 'Qq', pos: [0.02, 0, 0], rotulo: '+Q' },
        { id: 'fora', tipo: 'carga', q: 'Qq', pos: [0.07, 0, 0], rotulo: '+Q fora' },
        { id: 'S', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 0.04, rotulo: 'S' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0.04, 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga líquida dentro de S', simbolo: r`Q_\text{int}`, expr: "Qenc('S')", unidade: 'C', teoria: '0-Qq' },
        { rotulo: 'Fluxo por S', simbolo: r`\Phi_S`, expr: "fluxo('S')", unidade: 'V·m', teoria: '0-Qq/eps0' },
        { rotulo: 'Campo normal em P (positivo: para fora)', simbolo: 'E_n', expr: 'x(E(0.04, 0, 0))', unidade: 'V/m', teoria: 'k0*Qq*(1/0.02^2 - 2/0.06^2 - 1/0.03^2)' },
      ],
      passos: [
        {
          titulo: 'Um contraexemplo para as três',
          texto: r`Basta um caso. Dentro de $\mathcal S$, ponha $-2Q$ e $+Q$; fora, mais uma carga $+Q$. A carga líquida interna é $-Q$, e o fluxo é negativo:

$$\Phi_{\mathcal S} = \frac{Q_\text{int}}{\varepsilon_0} = -\frac{Q}{\varepsilon_0}.$$`,
          medidas: [0, 1],
        },
        {
          titulo: '(I) e (III) são falsas',
          texto: r`Há uma carga positiva dentro de $\mathcal S$ e outra fora, e o fluxo continua negativo. A lei de Gauss só conta a carga **líquida** interna, e cargas externas não mudam o fluxo total.`,
          medidas: [0],
        },
        {
          titulo: '(II) é falsa',
          previsao: { pergunta: 'Com fluxo negativo, pode haver pontos com E para fora?', opcoes: ['Sim', 'Não'], correta: 0 },
          texto: r`Fluxo total negativo só diz que entra mais do que sai. Em $\mathcal P$, perto da carga $+Q$ interna, o campo aponta para **fora**.

Nenhuma é verdadeira: alternativa **(h)**.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Contraexemplo', texto: r`$-2Q$ e $+Q$ dentro, $+Q$ fora: fluxo negativo.`, passo: 0 },
          { titulo: 'Conclusão', texto: r`As três afirmativas são falsas.`, passo: 2 },
        ],
        resultado: r`Nenhuma: alternativa **(h)**.`,
        errosComuns: [
          r`Ler "carga líquida negativa" como "só há cargas negativas".`,
          r`Achar que o sinal do fluxo total vale para cada ponto da superfície.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', porque: r`Pode haver positivas, desde que a soma seja negativa.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`O campo pode sair por uma parte da superfície.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`Cargas externas não mudam o fluxo total.` },
        { letra: 'd', texto: 'Apenas I e II.', porque: r`As duas são falsas.` },
        { letra: 'e', texto: 'Apenas I e III.', porque: r`As duas são falsas.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Todas.', porque: r`As três são falsas.` },
        { letra: 'h', texto: 'Nenhuma.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três fios nos vértices de um quadrado',
      resumo: 'Soma vetorial no vértice vazio: as componentes y se cancelam.',
      enunciado: r`Considere um arranjo de três ($i = 1, 2, 3$) fios condutores, retilíneos, longos e paralelos ao eixo $\mathcal Z$ de um sistema de coordenadas. Esses fios interceptam os pontos ($x_1 = 0, y_1 = a$), ($x_2 = y_2 = 0$) e ($x_3 = a, y_3 = 0$) do plano $\mathcal{XY}$, que são três dos vértices de um quadrado de lado $a$. O quarto vértice, $P$, está localizado em ($x_4 = a, y_4 = a$) e encontra-se "desocupado". O fio 1 porta uma corrente estacionária de módulo $I_1 = I$, com sentido do eixo $\mathcal Z$ positivo, ao passo que o fio 2 porta corrente de módulo $I_2 = 2I$, com sentido do eixo $\mathcal Z$ negativo e, por fim, o fio 3 porta corrente de módulo $I_3 = I$, com sentido do eixo $\mathcal Z$ também negativo. Qual das opções a seguir dá o vetor campo magnético resultante no vértice "desocupado" $P$?`,
      figura: { pagina: 2, recorte: [0.03, 0.02, 0.255, 0.88] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [2, 2, 18], alvo: [2, 2, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'f1', tipo: 'fioInfinito', I: 'I0', ponto: [0, 'a', 0], direcao: 'z', rotulo: 'I' },
        { id: 'f2', tipo: 'fioInfinito', I: '-2*I0', ponto: [0, 0, 0], direcao: 'z', rotulo: '2I' },
        { id: 'f3', tipo: 'fioInfinito', I: '0-I0', ponto: ['a', 0, 0], direcao: 'z', rotulo: 'I' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['a', 'a', 0], rotulo: 'P' },
        { id: 'b1', tipo: 'seta', papel: 'B', origem: ['a', 'a', 0], vetor: "Bde('f1', a, a, 0)", comprimento: '2*cm', rotulo: 'B₁' },
        { id: 'b2', tipo: 'seta', papel: 'B', origem: ['a', 'a', 0], vetor: "Bde('f2', a, a, 0)", comprimento: '2.8*cm', rotulo: 'B₂' },
        { id: 'b3', tipo: 'seta', papel: 'B', origem: ['a', 'a', 0], vetor: "Bde('f3', a, a, 0)", comprimento: '2*cm', rotulo: 'B₃' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fio 1, em y', simbolo: 'B_{1y}', expr: "y(Bde('f1', a, a, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*a)' },
        { rotulo: 'Fio 3, em x', simbolo: 'B_{3x}', expr: "x(Bde('f3', a, a, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*a)' },
        { rotulo: 'Fio 2, em x', simbolo: 'B_{2x}', expr: "x(Bde('f2', a, a, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*a)' },
        { rotulo: 'Fio 2, em y', simbolo: 'B_{2y}', expr: "y(Bde('f2', a, a, 0))", unidade: 'T', teoria: '0-mu0*I0/(2*pi*a)' },
        { rotulo: 'Total em x', simbolo: 'B_x', expr: 'x(B(a, a, 0))', unidade: 'T', teoria: 'mu0*I0/(pi*a)' },
        { rotulo: 'Total em y', simbolo: 'B_y', expr: 'y(B(a, a, 0))', unidade: 'T', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Fios 1 e 3',
          texto: r`Ambos estão à distância $a$ de $P$. Pela regra da mão direita:

$$\vec B_1 = \frac{\mu_0I}{2\pi a}\hat y,\qquad \vec B_3 = \frac{\mu_0I}{2\pi a}\hat x.$$`,
          medidas: [0, 1],
          destacar: ['b1', 'b3'],
        },
        {
          titulo: 'Fio 2',
          texto: r`Está na diagonal, a $\sqrt2\,a$, com corrente $2I$ entrando na página. O campo é perpendicular à diagonal, e seu módulo é $\mu_0I/\sqrt2\pi a$:

$$\vec B_2 = \frac{\mu_0I}{2\pi a}(\hat x - \hat y).$$`,
          medidas: [2, 3],
          destacar: ['b2'],
        },
        {
          titulo: 'Soma',
          previsao: { pergunta: 'A componente y total em P é…', opcoes: ['nula', 'positiva', 'negativa'], correta: 0 },
          texto: r`Em $\hat y$: $1 - 1 = 0$. Em $\hat x$: $1 + 1 = 2$.

$$\vec B = \frac{\mu_0I}{\pi a}\hat x.$$

Alternativa **(b)**.`,
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um fio longo', lab: 'ampere' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Fios 1 e 3', texto: r`$\vec B_1 + \vec B_3 = \dfrac{\mu_0I}{2\pi a}(\hat x + \hat y)$.`, passo: 0 },
          { titulo: 'Fio 2', texto: r`$\vec B_2 = \dfrac{\mu_0I}{2\pi a}(\hat x - \hat y)$.`, passo: 1 },
          { titulo: 'Soma', texto: r`$\vec B = \dfrac{\mu_0I}{\pi a}\hat x$.`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0I}{\pi a}\hat x$: alternativa **(b)**.`,
        errosComuns: [
          r`Esquecer o $\sqrt2$ da diagonal.`,
          r`Pôr o campo do fio 2 ao longo da diagonal: ele é perpendicular a ela.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{\mu_0I}{\pi a}\hat x$`, porque: r`Sinal trocado.` },
        { letra: 'b', texto: r`$\dfrac{\mu_0I}{\pi a}\hat x$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\dfrac{\sqrt2\mu_0I}{\pi a}\hat y$`, porque: r`A componente $y$ se anula.` },
        { letra: 'd', texto: r`$-\dfrac{\sqrt2\mu_0I}{\pi a}(\hat x + \hat y)$`, porque: r`Sentidos e módulo errados.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0I}{\pi a}(\hat x + \hat y)$`, porque: r`A componente $y$ se anula.` },
        { letra: 'f', texto: r`$\dfrac{\mu_0I}{\pi a}\hat y$`, porque: r`Troca os eixos.` },
        { letra: 'g', texto: r`$\vec 0$`, porque: r`As componentes $x$ se somam.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três afirmações sobre fem induzida',
      resumo: 'A fem segue a derivada do fluxo, não o fluxo.',
      enunciado: r`Considere as afirmativas abaixo: (I) A fem induzida em um circuito é proporcional ao fluxo de campo magnético que atravessa uma superfície delimitada pelo circuito. (II) Pode existir uma fem induzida em um circuito em um instante no qual o fluxo de campo magnético através de uma superfície delimitada pelo circuito é nulo. (III) Pode existir uma fem induzida em um circuito feito de material isolante. São VERDADEIRAS as seguintes afirmativas:`,
      figura: { pagina: 2, recorte: [0.27, 0.02, 0.49, 0.64] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [10, 9, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo máximo', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'w', rotulo: 'Frequência angular', simbolo: r`\omega`, valor: 2, unidade: 'rad/s', min: 0.5, max: 4, passo: 0.1 },
        { id: 'fase', rotulo: 'Fase inicial', simbolo: r`\omega t_0`, valor: 0, unidade: '°', min: 0, max: 180, passo: 5 },
        {
          id: 'Rr',
          rotulo: 'Material',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'condutor (1 Ω)' },
            { valor: 1e12, rotulo: 'isolante (10¹² Ω)' },
          ],
        },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, `B0*cos(${FA})`, 0], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'y', raio: 0.05, R: 'Rr', rotulo: 'circuito' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*pi*0.05^2*cos(${FA})` },
        { rotulo: 'fem', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: `B0*pi*0.05^2*w*sin(${FA})` },
        { rotulo: 'Corrente', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: `B0*pi*0.05^2*w*sin(${FA})/Rr` },
      ],
      graficos: [
        {
          titulo: 'Fluxo e fem no tempo',
          tipo: 'tempo',
          janela: 6,
          series: [
            { rotulo: 'Φ', expr: "fluxoB('S')", unidade: 'Wb' },
            { rotulo: 'fem', expr: "fem('S')", unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: '(I) Proporcional à derivada',
          texto: r`A lei de Faraday liga a fem à **variação** do fluxo: $\mathcal E = -d\Phi_B/dt$. Em $\omega t = 0$, o fluxo é máximo e a fem é zero. **Falsa.**`,
          parametros: { fase: 0, Rr: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Fluxo nulo, fem máxima',
          previsao: { pergunta: 'No instante em que o fluxo passa por zero, a fem é…', opcoes: ['zero', 'máxima'], correta: 1 },
          texto: r`Em $\omega t = 90°$, o fluxo cruza o zero com a maior inclinação: a fem é **máxima**, com o fluxo nulo naquele instante. **Verdadeira.**`,
          parametros: { fase: 90, Rr: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(III) Num isolante, há fem sem corrente',
          texto: r`O campo $\vec B$ variável produz um campo elétrico induzido, e sua circulação existe em qualquer caminho, mesmo no vácuo. Com um isolante, a fem é a mesma, mas a corrente praticamente some. **Verdadeira.**

Alternativa **(f)**.`,
          parametros: { fase: 90, Rr: 1e12 },
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }],
        etapas: [
          { titulo: '(I)', texto: r`Falsa: a fem é proporcional a $d\Phi_B/dt$.`, passo: 0 },
          { titulo: '(II)', texto: r`Verdadeira: basta que $\Phi_B$ esteja variando.`, passo: 1 },
          { titulo: '(III)', texto: r`Verdadeira: a fem não depende do material.`, passo: 2 },
        ],
        resultado: r`Apenas (II) e (III): alternativa **(f)**.`,
        errosComuns: [
          r`Confundir fluxo com variação de fluxo.`,
          r`Confundir fem com corrente: sem condutor não há corrente, mas há fem.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', porque: r`(I) é a única falsa.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`(III) também é verdadeira.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`(II) também é verdadeira.` },
        { letra: 'd', texto: 'Apenas I e II.', porque: r`(I) é falsa.` },
        { letra: 'e', texto: 'Apenas I e III.', porque: r`(I) é falsa.` },
        { letra: 'f', texto: 'Apenas II e III.', correta: true, porque: r`Correta.` },
        { letra: 'g', texto: 'Todas.', porque: r`(I) é falsa.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`(II) e (III) são verdadeiras.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Cilindro com ρ = k/r dentro de um tubo condutor',
      resumo: 'Densidade linear e campo nas quatro regiões.',
      enunciado: r`Um cilindro de raio $a$ e comprimento infinito, em equilíbrio eletrostático, possui uma distribuição volumétrica de carga expressa por $\rho(r) = k/r$, onde $k$ é uma constante e $r$ é a distância ao eixo do cilindro. Este cilindro é coaxial a um outro cilindro vazado, neutro, também de comprimento infinito e feito de material condutor com raio interno $b$ e raio externo $c$, de modo que $a < b < c$, conforme ilustrado na figura.

(a) Determine a densidade linear de carga ao longo do eixo do cilindro interno. (b) Calcule o campo elétrico em cada uma das quatro regiões: $0 \le r < a$, $a \le r < b$, $b \le r < c$ e $r \ge c$.`,
      figura: { pagina: 2, recorte: [0.52, 0.02, 0.99, 0.57] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'kk', rotulo: 'Constante', simbolo: 'k', valor: 1e-7, unidade: 'C/m²', min: 2e-8, max: 3e-7, passo: 1e-8 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'b', rotulo: 'Raio interno do tubo', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'c', rotulo: 'Raio externo do tubo', simbolo: 'c', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06 },
        { id: 'rp', rotulo: 'Distância ao eixo', simbolo: 'r', valor: 0.011, unidade: 'm', min: 0.003, max: 0.081, passo: 0.002 },
      ],
      objetos: [
        { id: 'nuc', tipo: 'cilindroInfinito', ponto: [0, 0, 0], direcao: 'z', raio: 'a', raioInterno: '1e-5*a', rho: 'kk/r', rotulo: 'ρ = k/r' },
        { id: 'met', tipo: 'cilindroInfinito', lambda: 0, ponto: [0, 0, 0], direcao: 'z', raio: 'c', raioInterno: 'b' },
        { id: 'fb', tipo: 'cilindroInfinito', lambda: '-2*pi*(1 - 1e-5)*a*kk', ponto: [0, 0, 0], direcao: 'z', raio: 'b', oco: true },
        { id: 'fc', tipo: 'cilindroInfinito', lambda: '2*pi*(1 - 1e-5)*a*kk', ponto: [0, 0, 0], direcao: 'z', raio: 'c', oco: true },
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'rp', altura: 0.06, rotulo: 'S' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rp', 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Densidade linear total do cilindro', simbolo: r`\lambda`, expr: "2*pi*eps0*0.03*x(Ede('nuc', 0.03, 0, 0))", unidade: 'C/m', teoria: '2*pi*a*kk' },
        { rotulo: 'Campo em r', simbolo: 'E', expr: 'x(E(rp, 0, 0))', unidade: 'V/m', teoria: 'rp < a ? kk/eps0 : (rp < b ? kk*a/(eps0*rp) : (rp < c ? 0 : kk*a/(eps0*rp)))' },
        { rotulo: 'Carga por metro dentro de S', simbolo: r`\lambda_\text{env}`, expr: "Qenc('G')/0.06", unidade: 'C/m', teoria: '2*pi*kk*(rp < a ? rp : (rp < b ? a : (rp < c ? 0 : a)))' },
      ],
      graficos: [
        {
          titulo: 'E(r)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.15*a', ate: '1.45*c', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'x(E(ss, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: 'ss < a ? kk/eps0 : (ss < b ? kk*a/(eps0*ss) : (ss < c ? 0 : kk*a/(eps0*ss)))', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Densidade linear',
          texto: r`Integre $\rho$ numa seção reta. O elemento de área é $2\pi r\,dr$, e o $r$ cancela o $1/r$:

$$\lambda = \int_0^a\frac kr\,2\pi r\,dr = 2\pi ak.$$`,
          parametros: { rp: 0.031 },
          medidas: [0, 2],
        },
        {
          item: 'b',
          titulo: '(b) r < a',
          previsao: { pergunta: 'Dentro do cilindro, com ρ = k/r, o campo…', opcoes: ['cresce com r', 'cai com r', 'é constante'], correta: 2 },
          texto: r`Gaussiana cilíndrica de raio $r$ e altura $L$: $q = 2\pi rkL$. Com $\Phi = 2\pi rLE$:

$$\vec E = \frac{k}{\varepsilon_0}\hat r.$$

O campo é **constante** em módulo: a carga envolvida e a área crescem na mesma proporção.`,
          parametros: { rp: 0.011 },
          medidas: [1, 2],
        },
        {
          item: 'b',
          titulo: '(b) a ≤ r < b',
          texto: r`A gaussiana envolve toda a carga do cilindro:

$$\vec E = \frac{ka}{\varepsilon_0r}\hat r.$$`,
          parametros: { rp: 0.031 },
          medidas: [1],
        },
        {
          item: 'b',
          titulo: '(b) b ≤ r < c',
          texto: r`Dentro do condutor em equilíbrio, $\vec E = \vec 0$. A face interna do tubo fica com $-\lambda$ por metro, e a externa, com $+\lambda$.`,
          parametros: { rp: 0.051 },
          medidas: [1, 2],
        },
        {
          item: 'b',
          titulo: '(b) r ≥ c',
          texto: r`O tubo é neutro: a carga por metro envolvida é a mesma da região $a < r < b$.

$$\vec E = \frac{ka}{\varepsilon_0r}\hat r.$$`,
          parametros: { rp: 0.071 },
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' },
          { texto: 'Condutores em equilíbrio', lab: 'gauss' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$\lambda = 2\pi ak$.`, passo: 0 },
          { titulo: 'r < a', texto: r`$\vec E = (k/\varepsilon_0)\hat r$.`, passo: 1 },
          { titulo: 'a ≤ r < b', texto: r`$\vec E = (ka/\varepsilon_0r)\hat r$.`, passo: 2 },
          { titulo: 'b ≤ r < c', texto: r`$\vec E = \vec 0$.`, passo: 3 },
          { titulo: 'r ≥ c', texto: r`$\vec E = (ka/\varepsilon_0r)\hat r$.`, passo: 4 },
        ],
        resultado: r`$\lambda = 2\pi ak$; $\vec E = \dfrac{k}{\varepsilon_0}\hat r$ para $r < a$; $\dfrac{ka}{\varepsilon_0r}\hat r$ para $a \le r < b$ e $r \ge c$; $\vec 0$ para $b \le r < c$.`,
        errosComuns: [
          r`Multiplicar $\rho$ pela área da seção: $\rho$ varia com $r$.`,
          r`Achar que o tubo neutro blinda o exterior: as cargas induzidas se somam a zero, e o campo fora continua.`,
        ],
        oficial: { resposta: r`$\lambda = 2\pi ak$; $k/\varepsilon_0$ para $r < a$; $ka/\varepsilon_0r$ para $a < r < b$; $0$ para $b < r < c$; $ka/\varepsilon_0r$ para $r > c$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\lambda = 2\pi ak$`, criterio: 'Integral da densidade numa seção reta.' },
        { item: 'b', texto: r`$\vec E = \dfrac{k}{\varepsilon_0}\hat r$; $\dfrac{ka}{\varepsilon_0r}\hat r$; $\vec 0$; $\dfrac{ka}{\varepsilon_0r}\hat r$`, criterio: 'Simetria cilíndrica, gaussiana coaxial e condutor em equilíbrio.' },
      ],
    },
  ],
}

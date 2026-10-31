import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: parábola exata, desenhada só depois da previsão. */
const parabola = Array.from({ length: 41 }, (_, i) => {
  const T = (i * 1.2e-6) / 40
  return [`-alpha*${T} + qe*E0/(2*mp)*${T}^2`, `-alpha*${T}`, 0] as [string, string, number]
})

/* Discursiva 1: dois anéis em z = 0 e z = 2a. */
const Va = (z: string) => `k0*Q*(1/sqrt((${z})^2 + a^2) - 1/sqrt((${z} - 2*a)^2 + a^2))`
const Ea = (z: string) => `k0*Q*((${z})/((${z})^2 + a^2)^1.5 + (2*a - (${z}))/((2*a - (${z}))^2 + a^2)^1.5)`

/* Discursiva 2: coroa R ≤ r ≤ 2R com ρ = ρ₀(r/R)³. */
const Qc = (v: string) => `2*pi*rho0/(3*R^3)*(min(max(${v},R),2*R)^6 - R^6)`

/**
 * P1 de Física III, 2025/2, diurno, versão B (15/09/2025). Conferida com o
 * gabarito final: objetivas 1d, 2c, 3a, 4b, 5e, 6f; D1 e D2. O recorte da Q2
 * cobre um círculo à mão, feito na alternativa errada. Divergência: o quadro
 * final da D1(b) no gabarito tem um sinal trocado (ver `oficial.observacao`).
 */
export const p1_2025_2_diurno: ProvaInput = {
  id: 'p1-2025-2-diurno',
  titulo: 'P1 · 2025/2 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão B · 15/09/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Terceiro vértice de um triângulo',
      resumo: 'Trabalho para trazer Q₀ e energia da configuração com +Q e −Q.',
      enunciado: r`Num triângulo equilátero de lado $a$, dois vértices têm partículas de carga $Q > 0$ e $-Q$. Com potencial nulo no infinito, quais são o trabalho $W_\text{(e)}$ da força eletrostática dessas partículas para trazer uma terceira, de carga $Q_0$, do infinito até o vértice desocupado, e a energia potencial $U_\text{(e)}$ do conjunto das três?`,
      figura: { pagina: 1, recorte: [0.1, 0.44, 0.49, 0.64] },
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 27], alvo: [0, 3, 0] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 0.5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'q0', rotulo: 'Carga trazida', simbolo: 'Q_0', valor: 1e-9, unidade: 'C', min: -3e-9, max: 3e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06 },
        { id: 'yq', rotulo: 'Altura de Q₀ no eixo', simbolo: 'y', valor: 0.12, unidade: 'm', min: 0.03, max: 0.12, passo: 0.001 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'Q', pos: ['-a/2', 0, 0], rotulo: '+Q' },
        { id: 'c2', tipo: 'carga', q: '0-Q', pos: ['a/2', 0, 0], rotulo: '−Q' },
        { id: 'Q0', tipo: 'carga', q: 'q0', pos: [0, 'yq', 0], arraste: { param: 'yq', eixo: 'y' }, rotulo: 'Q₀' },
        { id: 'F', tipo: 'seta', papel: 'forca', origem: [0, 'yq', 0], vetor: "F('Q0')", comprimento: '2*cm', rotulo: 'F' },
        { id: 'ca', tipo: 'cota', a: ['-a/2', -0.012, 0], b: ['a/2', -0.012, 0], rotulo: 'a' },
      ],
      visual: { linhasE: true, densidade: 10, fontes: ['c1', 'c2'], planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial de ±Q em Q₀', simbolo: 'V', expr: "Vde('c1', 0, yq, 0) + Vde('c2', 0, yq, 0)", unidade: 'V', teoria: 0 },
        { rotulo: 'Trabalho da força eletrostática', simbolo: r`W_\text{(e)}`, expr: "0 - q0*(Vde('c1', 0, yq, 0) + Vde('c2', 0, yq, 0))", unidade: 'J', teoria: 0 },
        { rotulo: 'Energia do conjunto', simbolo: r`U_\text{(e)}`, expr: "Q*Vde('c2', -a/2, 0, 0) + q0*(Vde('c1', 0, yq, 0) + Vde('c2', 0, yq, 0))", unidade: 'J', teoria: '-k0*Q^2/a' },
        { rotulo: 'Componente da força ao longo do caminho', simbolo: 'F_y', expr: "y(F('Q0'))", unidade: 'N' },
      ],
      passos: [
        {
          titulo: 'O eixo é uma equipotencial',
          texto: r`Todo ponto da mediatriz de $+Q$ e $-Q$ está à mesma distância das duas cargas, então

$$V = \frac{k_0Q}{d} - \frac{k_0Q}{d} = 0.$$

O plano colorido mostra isso: a faixa central é a equipotencial $V = 0$, e ela passa pelo terceiro vértice.`,
          parametros: { yq: 0.12 },
          medidas: [0],
        },
        {
          titulo: 'Trabalho nulo',
          previsao: { pergunta: r`O trabalho para trazer $Q_0$ do infinito ao vértice é…`, opcoes: ['nulo', 'positivo', 'negativo'], correta: 0 },
          texto: r`Tanto o infinito quanto o vértice têm $V = 0$:

$$W_\text{(e)} = Q_0\,[V(\infty) - V(\text{vértice})] = 0.$$

Pelo eixo, a força sobre $Q_0$ é perpendicular ao caminho a todo instante. Arraste $Q_0$: $F_y$ fica nulo.`,
          parametros: { yq: 0.052 },
          destacar: ['Q0', 'F'],
          medidas: [1, 3],
        },
        {
          titulo: 'Energia: soma sobre pares',
          texto: r`$$U = k_0\frac{Q(-Q)}{a} + k_0\frac{QQ_0}{a} + k_0\frac{(-Q)Q_0}{a} = -\frac{1}{4\pi\varepsilon_0}\frac{Q^2}{a}.$$

Os dois pares com $Q_0$ se cancelam. Trazer $Q_0$ não mudou a energia, coerente com $W = 0$.`,
          parametros: { yq: 0.052 },
          medidas: [2],
        },
        {
          titulo: 'Resposta',
          texto: r`$W_\text{(e)} = 0$ e $U_\text{(e)} = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$: alternativa **(d)**.`,
          parametros: { yq: 0.052 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de cargas pontuais', lab: 'potencial' },
          { texto: 'Energia de um sistema de cargas' },
        ],
        etapas: [
          { titulo: 'Potencial no vértice', texto: r`As duas cargas estão à distância $a$: $V = k_0Q/a - k_0Q/a = 0$.`, passo: 0 },
          { titulo: 'Trabalho', texto: r`$W = Q_0[V(\infty) - V] = 0$.`, passo: 1 },
          { titulo: 'Energia', texto: r`Somando os três pares: $U = -k_0Q^2/a + k_0QQ_0/a - k_0QQ_0/a = -k_0Q^2/a$.`, passo: 2 },
        ],
        resultado: r`$W_\text{(e)} = 0$ e $U_\text{(e)} = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$: alternativa **(d)**.`,
        errosComuns: [
          r`Achar que $U = 0$ porque $W = 0$. A energia do par $\pm Q$ já existia antes de trazer $Q_0$.`,
          r`Somar os módulos das contribuições: as cargas têm sinais opostos.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: '$0$ e $0$.', porque: r`O trabalho é nulo, mas o par $\pm Q$ tem energia $-k_0Q^2/a$.` },
        { letra: 'b', texto: r`$\dfrac{1}{2\pi\varepsilon_0}\dfrac{Q_0Q}{a}$ e $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$`, porque: r`Soma os módulos dos potenciais, como se as duas cargas fossem iguais.` },
        { letra: 'c', texto: r`$-\dfrac{1}{2\pi\varepsilon_0}\dfrac{Q_0Q}{a}$ e $\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$`, porque: r`Mesmo erro no trabalho, e sinal invertido em $U$: cargas opostas têm energia negativa.` },
        { letra: 'd', texto: r`$0$ e $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$`, correta: true, porque: r`Correta: $V = 0$ no vértice e só o par $\pm Q$ sobra na energia.` },
        { letra: 'e', texto: r`$\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_0Q}{a}$ e $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2 + 2QQ_0}{a}$`, porque: r`Conta só uma das cargas no potencial do vértice.` },
        { letra: 'f', texto: r`$-\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q^2}{a}$ e $0$`, porque: r`Troca as duas respostas.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Trajetória num campo uniforme',
      resumo: 'Velocidade inicial para baixo e para a esquerda, E para a direita.',
      enunciado: r`Uma partícula de massa $m$ e carga $q > 0$ está na origem em $t = 0$, com velocidade $\vec v_0 = -\alpha(\hat x + \hat y)$, $\alpha > 0$. Atua na região o campo $\vec E = E_0\hat x$, $E_0 > 0$. Qual dos esboços (I) a (V) melhor representa a trajetória para $t > 0$?`,
      figura: { pagina: 1, recorte: [0.545, 0.03, 0.93, 0.62], mascaras: [{ area: [0.712, 0.364, 0.752, 0.426], letra: '(II)' }] },
      cena: {
        escala: 0.01,
        extensao: 13,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [2, -3, 27], alvo: [1, -5, 0] },
        tempo: { escala: 2e-7, unidade: 'ns', passo: 2e-9 },
      },
      parametros: [
        { id: 'alpha', rotulo: 'Constante α', simbolo: r`\alpha`, valor: 1e5, unidade: 'm/s', min: 5e4, max: 1.5e5, passo: 5e3 },
        { id: 'E0', rotulo: 'Campo', simbolo: 'E_0', valor: 3000, unidade: 'V/m', min: 1000, max: 5000, passo: 100 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: ['E0', 0, 0] },
        { id: 'p', tipo: 'particula', rotulo: 'q > 0', q: 'qe', m: 'mp', pos: [0, 0, 0], v: ['0-alpha', '0-alpha', 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '2*cm', rotulo: 'v' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: '[E0, 0, 0]', comprimento: '1.5*cm', rotulo: 'F = qE' },
        { id: 'traj', tipo: 'caminho', ativo: 0, pontos: parabola, tracejado: true, seta: 0.8 },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Posição x', simbolo: 'x', expr: "x(pos('p'))", unidade: 'm', teoria: '-alpha*t + qe*E0/(2*mp)*t^2' },
        { rotulo: 'Posição y', simbolo: 'y', expr: "y(pos('p'))", unidade: 'm', teoria: '-alpha*t' },
        { rotulo: 'Aceleração', simbolo: 'a_x', expr: 'qe*E0/mp', unidade: 'm/s²' },
        { rotulo: 'Instante em que v_x se anula', simbolo: 't^*', expr: 'alpha*mp/(qe*E0)', unidade: 's' },
      ],
      passos: [
        {
          titulo: 'Força constante, como um lançamento',
          texto: r`A força é $\vec F = qE_0\hat x$: constante e para a direita. É o mesmo problema de um lançamento oblíquo, com a "gravidade" apontando para $+\hat x$.`,
        },
        {
          titulo: 'As duas equações horárias',
          previsao: { pergunta: 'Depois de um tempo, a partícula…', opcoes: ['segue em linha reta', 'curva para +x e volta a andar para a direita', 'curva para −x', 'gira em círculos'], correta: 1 },
          texto: r`Em $y$ não há força; em $x$, a aceleração é $a = qE_0/m$:

$$y(t) = -\alpha t, \qquad x(t) = -\alpha t + \frac{qE_0}{2m}t^2.$$

Rode a simulação: a partícula desce sempre, recua em $x$ no início e depois é empurrada para a direita.`,
          mostrar: ['traj'],
          medidas: [0, 1, 2],
        },
        {
          titulo: 'O formato da curva',
          texto: r`Eliminando $t = -y/\alpha$:

$$x = y + \frac{qE_0}{2m\alpha^2}y^2.$$

É uma **parábola**. Ela sai da origem na direção de $\vec v_0$ e se curva para o lado da força, $+\hat x$. No instante $t^* = \alpha m/qE_0$, $v_x$ se anula e a partícula passa a avançar para a direita.`,
          mostrar: ['traj'],
          medidas: [3],
        },
        {
          titulo: 'Resposta',
          texto: r`O esboço (III): alternativa **(c)**.`,
          mostrar: ['traj'],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força elétrica em campo uniforme', lab: 'lorentz' },
          { texto: 'Movimento com aceleração constante' },
        ],
        etapas: [
          { titulo: 'Força', texto: r`$\vec F = qE_0\hat x$ é constante. Não há nada que faça a partícula girar.`, passo: 0 },
          { titulo: 'Equações horárias', texto: r`$y = -\alpha t$ e $x = -\alpha t + \frac{qE_0}{2m}t^2$.`, passo: 1 },
          { titulo: 'Trajetória', texto: r`Parábola $x = y + \frac{qE_0}{2m\alpha^2}y^2$, tangente a $\vec v_0$ na origem e encurvada para $+\hat x$.`, passo: 2 },
        ],
        resultado: r`Esboço (III): alternativa **(c)**.`,
        errosComuns: [
          r`Achar que a partícula segue $\vec E$ desde o início. A velocidade inicial não some: a força a altera aos poucos.`,
          r`Curvar a trajetória para o lado oposto à força.`,
          r`Pensar em círculo ou espiral: isso é coisa de força magnética, sempre perpendicular a $\vec v$.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Esboço (I): reta na direção de $\\vec v_0$.', porque: r`Só valeria sem força, ou com força paralela a $\vec v_0$.` },
        { letra: 'b', texto: 'Esboço (II): curva que se abre para a esquerda.', porque: r`Encurva para $-\hat x$, contra a força. A partícula tem carga positiva.` },
        { letra: 'c', texto: 'Esboço (III): parte na direção de $\\vec v_0$ e se curva para a direita.', correta: true, porque: r`Correta: parábola tangente a $\vec v_0$ na origem, encurvada para $+\hat x$.` },
        { letra: 'd', texto: 'Esboço (IV): espiral.', porque: r`Espirais exigem força que mude de direção; aqui ela é constante.` },
        { letra: 'e', texto: 'Esboço (V): arco de círculo.', porque: r`Movimento circular pede força centrípeta, perpendicular à velocidade, como a magnética.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Três afirmações sobre eletrostática',
      resumo: 'Isolante, potencial nulo e equipotenciais que se cruzam.',
      enunciado: r`Considere as afirmativas sobre o regime eletrostático: (I) O campo eletrostático é sempre perpendicular à superfície de um material isolante; (II) Se o potencial eletrostático é nulo em um ponto do espaço, então o campo elétrico nesse ponto também é nulo; (III) Duas superfícies equipotenciais associadas a valores distintos do potencial eletrostático podem se intersectar. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 2, recorte: [0.085, 0.03, 0.49, 0.19] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [5, 7, 13], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Afirmativa',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) placa isolante' },
            { valor: 2, rotulo: '(II) V = 0 no dipolo' },
            { valor: 3, rotulo: '(III) equipotenciais' },
          ],
        },
        { id: 'sig', rotulo: 'Densidade da placa', simbolo: r`\sigma`, valor: 1e-8, unidade: 'C/m²', min: 1e-9, max: 3e-8, passo: 1e-9 },
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 5e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Meia separação', simbolo: 'd', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'pl', tipo: 'placa', ativo: 'caso==1', sigma: 'sig', centro: [0, 0, 0], normal: 'y', largura: 0.08, altura: 0.08 },
        { id: 'S1', tipo: 'sonda', ativo: 'caso==1', campo: 'E', pos: [0, 0.006, 0], rotulo: 'centro' },
        { id: 'S2', tipo: 'sonda', ativo: 'caso==1', campo: 'E', pos: [0.038, 0.006, 0], rotulo: 'borda' },
        { id: 'c1', tipo: 'carga', ativo: 'caso!=1', q: 'qq', pos: ['0-d', 0, 0], rotulo: '+q' },
        { id: 'c2', tipo: 'carga', ativo: 'caso==2', q: '0-qq', pos: ['d', 0, 0], rotulo: '−q' },
        { id: 'c3', tipo: 'carga', ativo: 'caso==3', q: '0-qq', pos: ['d', 0, 0], rotulo: '−q' },
        { id: 'M', tipo: 'sonda', ativo: 'caso==2', campo: 'E', pos: [0, 0, 0], rotulo: 'V = 0' },
      ],
      visual: { setasE: true, densidade: 9 },
      medidas: [
        { rotulo: 'Componente normal perto da borda', simbolo: 'E_n', ativo: 'caso==1', expr: 'y(E(0.038, 0.006, 0))', unidade: 'V/m' },
        { rotulo: 'Componente tangencial perto da borda', simbolo: 'E_t', ativo: 'caso==1', expr: 'x(E(0.038, 0.006, 0))', unidade: 'V/m' },
        { rotulo: 'Potencial no ponto médio', simbolo: 'V', ativo: 'caso==2', expr: 'V(0, 0, 0)', unidade: 'V', teoria: 0 },
        { rotulo: 'Campo no ponto médio', simbolo: 'E', ativo: 'caso==2', expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: '2*k0*qq/d^2' },
        { rotulo: 'Potencial num ponto', simbolo: 'V', ativo: 'caso==3', expr: 'V(0.01, 0.02, 0)', unidade: 'V' },
      ],
      passos: [
        {
          titulo: '(I) Isolante: nada obriga E a ser perpendicular',
          texto: r`Num **condutor** em equilíbrio, $\vec E$ é perpendicular à superfície porque as cargas livres se moveriam se não fosse. Num isolante as cargas não se movem: nada proíbe componente tangencial.

Perto da borda desta placa isolante, $E_t$ é comparável a $E_n$. **Falsa.**`,
          parametros: { caso: 1 },
          destacar: ['S2'],
          medidas: [0, 1],
        },
        {
          titulo: '(II) V = 0 não significa E = 0',
          previsao: { pergunta: 'No meio de um dipolo, V = 0. E o campo ali?', opcoes: ['é nulo', 'não é nulo'], correta: 1 },
          texto: r`$\vec E$ depende de como $V$ **varia**, não do seu valor. No meio de $\pm q$, as contribuições ao potencial se cancelam, mas os campos se somam:

$$V = 0, \qquad E = \frac{2k_0q}{d^2}.$$

**Falsa.**`,
          parametros: { caso: 2 },
          destacar: ['M'],
          visual: { planoV: { normal: 'y', posicao: 0 } },
          medidas: [2, 3],
        },
        {
          titulo: '(III) Equipotenciais não se cruzam',
          texto: r`Num ponto de interseção, $V$ teria dois valores ao mesmo tempo. Mas o potencial é uma função: cada ponto tem um só valor. **Falsa.**

As superfícies da cena se aninham em volta das cargas sem se tocar.`,
          parametros: { caso: 3 },
          visual: { equipotenciais: true, setasE: false },
          medidas: [4],
        },
        {
          titulo: 'Resposta',
          texto: r`Nenhuma é verdadeira: alternativa **(a)**.`,
          parametros: { caso: 1 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutores e isolantes', lab: 'gauss' },
          { texto: 'Relação entre campo e potencial', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Afirmativa I', texto: r`Falsa. A perpendicularidade é propriedade de superfícies de **condutores** em equilíbrio, que são equipotenciais.`, passo: 0 },
          { titulo: 'Afirmativa II', texto: r`Falsa. No meio de um dipolo, $V = 0$ e $E \neq 0$.`, passo: 1 },
          { titulo: 'Afirmativa III', texto: r`Falsa. $V$ tem um único valor em cada ponto, então superfícies de valores distintos não se tocam.`, passo: 2 },
        ],
        resultado: r`Nenhuma delas: alternativa **(a)**.`,
        errosComuns: [
          r`Estender a isolantes uma propriedade de condutores.`,
          r`Confundir o valor de $V$ com sua variação: $\vec E = -\nabla V$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', correta: true, porque: r`Correta: as três são falsas.` },
        { letra: 'b', texto: 'I.', porque: r`Vale para condutores em equilíbrio, não para isolantes.` },
        { letra: 'c', texto: 'II.', porque: r`O ponto médio de um dipolo é um contraexemplo.` },
        { letra: 'd', texto: 'III.', porque: r`Isso daria dois valores de $V$ num mesmo ponto.` },
        { letra: 'e', texto: 'I e II.', porque: r`As duas são falsas.` },
        { letra: 'f', texto: 'I e III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'II e III.', porque: r`As duas são falsas.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`Nenhuma é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Anel com λ = λ₀ cos φ visto de longe',
      resumo: 'Carga total nula: como o campo decai ao longo do eixo.',
      enunciado: r`Um anel circular delgado, de raio $R$, centrado na origem e contido no plano $xy$, tem densidade linear $\lambda(\varphi) = \lambda_0\cos\varphi$, com $\varphi$ medido a partir do eixo $x$ e $\lambda_0 > 0$. Para um ponto $P = (0, 0, z)$ com $z \gg R$, qual é a dependência assintótica do módulo do campo $E(z)$ com $z$?`,
      figura: { pagina: 2, recorte: [0.085, 0.42, 0.49, 0.575] },
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', camera: { pos: [13, 7, 13], alvo: [0, 0, 4] } },
      parametros: [
        { id: 'lam0', rotulo: 'Constante da densidade', simbolo: r`\lambda_0`, valor: 2e-8, unidade: 'C/m', min: 5e-9, max: 4e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'zP', rotulo: 'Posição de P', simbolo: 'z', valor: 0.1, unidade: 'm', min: 0.01, max: 0.125, passo: 0.001 },
      ],
      objetos: [
        { id: 'pos', tipo: 'anelCarga', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [-90, 90], densidade: 'lam0*cos(theta)', rotulo: 'λ > 0' },
        { id: 'neg', tipo: 'anelCarga', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [90, 270], densidade: 'lam0*cos(theta)', rotulo: 'λ < 0' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Carga total', simbolo: 'Q', expr: "carga('pos') + carga('neg')", unidade: 'C' },
        { rotulo: 'Campo em P', simbolo: 'E_x', expr: 'x(E(0, 0, zP))', unidade: 'V/m', teoria: '-k0*lam0*pi*R^2/(R^2 + zP^2)^1.5' },
        { rotulo: 'Componente z em P', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m' },
        { rotulo: 'Momento de dipolo', simbolo: 'p', expr: 'pi*lam0*R^2', unidade: 'C·m' },
      ],
      graficos: [
        {
          titulo: '|E| · z³ ao longo do eixo (fica constante longe)',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '0.5*R', ate: '20*R', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: '|E| z³', expr: 'mag(E(0, 0, zz))*zz^3', unidade: 'V·m²' },
            { rotulo: 'k₀p', expr: 'k0*pi*lam0*R^2', unidade: 'V·m²' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Carga total nula',
          texto: r`$$Q = \int_0^{2\pi}\lambda_0\cos\varphi\,R\,d\varphi = 0.$$

A metade $x > 0$ é positiva e a $x < 0$ é negativa. Sem carga líquida, não há termo $1/z^2$.`,
          medidas: [0],
        },
        {
          titulo: 'O momento de dipolo não é nulo',
          previsao: { pergunta: r`Com $Q = 0$ e $\vec p \neq 0$, longe o campo cai com…`, opcoes: ['z⁻¹', 'z⁻²', 'z⁻³', 'z⁻⁴'], correta: 2 },
          texto: r`$$\vec p = \int \vec r\,dq = \int_0^{2\pi}R\cos\varphi\,\lambda_0\cos\varphi\,R\,d\varphi\;\hat x = \pi\lambda_0R^2\,\hat x.$$

Longe, o anel é um dipolo. Sobre o eixo $z$, que é perpendicular a $\vec p$, o campo de dipolo cai com $z^{-3}$.`,
          medidas: [3],
        },
        {
          titulo: 'A conta exata',
          texto: r`Integrando direto, só sobra a componente $x$:

$$E_x = -\frac{k_0\lambda_0\pi R^2}{(R^2+z^2)^{3/2}}\ \xrightarrow{\ z\gg R\ }\ -\frac{k_0\lambda_0\pi R^2}{z^3}.$$

No gráfico, $|E|\,z^3$ fica constante e igual a $k_0p$ quando $z$ cresce.`,
          parametros: { zP: 0.125 },
          destacar: ['P'],
          medidas: [1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$E \propto z^{-3}$: alternativa **(b)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de distribuição contínua', lab: 'coulomb' },
          { texto: 'Dipolo elétrico', lab: 'dipolo' },
        ],
        etapas: [
          { titulo: 'Carga total', texto: r`$\int_0^{2\pi}\cos\varphi\,d\varphi = 0$: não há termo de carga pontual.`, passo: 0 },
          { titulo: 'Dipolo', texto: r`$\vec p = \pi\lambda_0R^2\hat x \neq 0$: o termo dominante é o de dipolo.`, passo: 1 },
          { titulo: 'Dependência', texto: r`$E = k_0\pi\lambda_0R^2/(R^2+z^2)^{3/2} \to k_0p/z^3$.`, passo: 2 },
        ],
        resultado: r`$E \propto z^{-3}$: alternativa **(b)**.`,
        errosComuns: [
          r`Usar o resultado do anel uniforme, que cai com $z^{-2}$ longe. Aqui $Q = 0$.`,
          r`Concluir que $E = 0$ por ser $Q = 0$. Carga total nula só cancela o termo de ordem mais baixa.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: '$z^{-4}$.', porque: r`Seria o termo seguinte, de quadrupolo; ele só dominaria com $\vec p = 0$.` },
        { letra: 'b', texto: '$z^{-3}$.', correta: true, porque: r`Correta: com $Q = 0$ e $\vec p \neq 0$, domina o campo de dipolo.` },
        { letra: 'c', texto: '$z^{-2}$.', porque: r`Exigiria carga total não nula.` },
        { letra: 'd', texto: '$z^{-1}$.', porque: r`É como cai o potencial de uma carga, ou o campo de uma linha infinita.` },
        { letra: 'e', texto: 'uma constante não nula (independente de $z$).', porque: r`Longe de uma distribuição finita o campo sempre vai a zero.` },
        { letra: 'f', texto: '$0$.', porque: r`$E$ tende a zero, mas o enunciado pede a dependência, e o campo não é identicamente nulo.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Potencial longe de três cargas alinhadas',
      resumo: 'Cargas q, q e −2q: por que o termo em 1/y² some.',
      enunciado: r`Três partículas com cargas $q$, $q$ e $-2q$ estão no eixo $x$, nas abscissas $-a$, $0$ e $a$. O potencial é zero no infinito. Num ponto $P$ do eixo $y$, com ordenada $y > 0$ e $y \gg a$, qual é o potencial $V(P)$?`,
      figura: { pagina: 2, recorte: [0.555, 0.03, 0.95, 0.165] },
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', plano: 'xy', camera: { pos: [2, 4, 27], alvo: [0, 3, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Espaçamento', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'yP', rotulo: 'Ordenada de P', simbolo: 'y', valor: 0.1, unidade: 'm', min: 0.02, max: 0.12, passo: 0.001 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'qq', pos: ['0-a', 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: 'qq', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'c3', tipo: 'carga', q: '-2*qq', pos: ['a', 0, 0], rotulo: '−2q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 'yP', 0], arraste: { param: 'yP', eixo: 'y' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10, planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial em P', simbolo: 'V', expr: 'V(0, yP, 0)', unidade: 'V', teoria: 'k0*qq*(1/yP - 1/sqrt(yP^2 + a^2))' },
        { rotulo: 'Aproximação pedida', simbolo: r`\frac{qa^2}{8\pi\varepsilon_0y^3}`, expr: 'qq*a^2/(8*pi*eps0*yP^3)', unidade: 'V' },
        { rotulo: 'Razão V / aproximação', simbolo: 'razão', expr: 'V(0, yP, 0)/(qq*a^2/(8*pi*eps0*yP^3))' },
        { rotulo: 'Carga total', simbolo: 'Q', expr: "carga('c1') + carga('c2') + carga('c3')", unidade: 'C', teoria: 0 },
        { rotulo: 'Momento de dipolo', simbolo: 'p_x', expr: '-3*qq*a', unidade: 'C·m' },
      ],
      graficos: [
        {
          titulo: 'V · y³ ao longo do eixo (fica constante longe)',
          tipo: 'perfil',
          x: { variavel: 'yy', de: 'a', ate: '30*a', rotulo: 'y', unidade: 'm' },
          series: [
            { rotulo: 'V y³', expr: 'V(0, yy, 0)*yy^3', unidade: 'V·m³' },
            { rotulo: 'qa²/8πε₀', expr: 'qq*a^2/(8*pi*eps0)', unidade: 'V·m³' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Potencial exato em P',
          texto: r`$P$ está à mesma distância $\sqrt{y^2+a^2}$ das cargas em $\pm a$, e a $y$ da carga central:

$$V = k_0q\left(\frac{1}{\sqrt{y^2+a^2}} + \frac1y - \frac{2}{\sqrt{y^2+a^2}}\right) = k_0q\left(\frac1y - \frac{1}{\sqrt{y^2+a^2}}\right).$$`,
          medidas: [0],
        },
        {
          titulo: 'Por que não basta o dipolo',
          previsao: { pergunta: 'A carga total é zero e p ≠ 0. Em P, o termo de dipolo…', opcoes: ['domina', 'é nulo', 'é infinito'], correta: 1 },
          texto: r`$Q = 0$ elimina o termo $1/y$. O momento de dipolo é $\vec p = -3qa\,\hat x$, não nulo; mas $P$ está no eixo $y$, perpendicular a $\vec p$, onde o potencial de dipolo $k_0\vec p\cdot\hat r/r^2$ se anula.

Sobra o termo seguinte, em $1/y^3$.`,
          medidas: [3, 4],
        },
        {
          titulo: 'A expansão',
          texto: r`Com $(1+\epsilon)^{-1/2} \simeq 1 - \epsilon/2$ e $\epsilon = a^2/y^2$:

$$\frac{1}{\sqrt{y^2+a^2}} \simeq \frac1y\left(1 - \frac{a^2}{2y^2}\right) \quad\Rightarrow\quad V \simeq \frac{k_0qa^2}{2y^3} = \frac{qa^2}{8\pi\varepsilon_0y^3}.$$

Arraste $P$ para longe: a razão tende a 1.`,
          parametros: { yP: 0.12 },
          destacar: ['P'],
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$V \simeq \dfrac{qa^2}{8\pi\varepsilon_0y^3}$: alternativa **(e)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Superposição de potenciais', lab: 'potencial' },
          { texto: 'Expansão binomial' },
          { texto: 'Dipolo elétrico', lab: 'dipolo' },
        ],
        etapas: [
          { titulo: 'Somar', texto: r`$V = k_0q[1/y - 1/\sqrt{y^2+a^2}]$.`, passo: 0 },
          { titulo: 'Expandir', texto: r`$1/\sqrt{y^2+a^2} \simeq (1/y)(1 - a^2/2y^2)$, logo $V \simeq k_0qa^2/2y^3$.`, passo: 2 },
        ],
        resultado: r`$V \simeq \dfrac{qa^2}{8\pi\varepsilon_0y^3}$: alternativa **(e)**.`,
        errosComuns: [
          r`Parar em primeira ordem e concluir $V = 0$.`,
          r`Usar o potencial de dipolo sobre o eixo do dipolo. $P$ está na direção perpendicular.`,
          r`Errar o sinal: o termo positivo $1/y$ vem da carga mais próxima de $P$.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{qa^2}{2\pi\varepsilon_0y^3}$`, porque: r`Fator 4 a mais; confira o $\epsilon/2$ da expansão e $k_0 = 1/4\pi\varepsilon_0$.` },
        { letra: 'b', texto: r`$\dfrac{qa^2}{4\pi\varepsilon_0y^3}$`, porque: r`Esquece o $1/2$ da expansão binomial.` },
        { letra: 'c', texto: r`$-\dfrac{3qa}{4\pi\varepsilon_0y^2}$`, porque: r`É o potencial de dipolo **sobre o eixo $x$**. Em $P$, perpendicular a $\vec p$, esse termo é nulo.` },
        { letra: 'd', texto: r`$-\dfrac{qa^2}{8\pi\varepsilon_0y^3}$`, porque: r`Módulo certo, sinal errado: a carga central, mais próxima, é positiva.` },
        { letra: 'e', texto: r`$\dfrac{qa^2}{8\pi\varepsilon_0y^3}$`, correta: true, porque: r`Correta: é o termo dominante de $k_0q[1/y - 1/\sqrt{y^2+a^2}]$.` },
        { letra: 'f', texto: '$0$.', porque: r`$V$ tende a zero, mas não é zero: há um termo em $1/y^3$.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Fluxo nulo por um cubo',
      resumo: 'Esfera maciça e casca concêntricas: relação entre ρ e σ.',
      enunciado: r`Um arranjo é composto por uma esfera maciça de raio $a$, com densidade volumar uniforme $\rho$, e uma casca esférica de raio $b$, com densidade superficial uniforme $\sigma$, ambas concêntricas com a origem. O fluxo do campo elétrico através de uma superfície cúbica de lado $c$, concêntrica com a origem, é nulo. Determine a relação entre $\rho$ e $\sigma$, sob a condição $c > 2b > 2a$.`,
      figura: { pagina: 2, recorte: [0.545, 0.44, 0.95, 0.63] },
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [9, 8, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho', rotulo: 'Densidade da esfera', simbolo: r`\rho`, valor: 1e-5, unidade: 'C/m³', min: 1e-6, max: 2e-5, passo: 1e-6 },
        { id: 'fator', rotulo: 'σ em relação à condição', simbolo: 'f', valor: 1, min: 0, max: 2, passo: 0.05 },
        { id: 'a', rotulo: 'Raio da esfera', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.05, unidade: 'm', min: 0.045, max: 0.06, passo: 0.002 },
        { id: 'c', rotulo: 'Lado do cubo', simbolo: 'c', valor: 0.14, unidade: 'm', min: 0.125, max: 0.17, passo: 0.005 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', Q: 'rho*4/3*pi*a^3', centro: [0, 0, 0], raio: 'a', rotulo: 'ρ' },
        { id: 'cas', tipo: 'esfera', Q: '-fator*rho*4/3*pi*a^3', centro: [0, 0, 0], raio: 'b', oca: true, rotulo: 'σ' },
        { id: 'cubo', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: 'c', rotulo: 'cubo' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo pelo cubo', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('cubo')", unidade: 'V·m', teoria: "(carga('esf') + carga('cas'))/eps0" },
        { rotulo: 'Carga da esfera', simbolo: 'Q_e', expr: "carga('esf')", unidade: 'C' },
        { rotulo: 'Carga da casca', simbolo: 'Q_c', expr: "carga('cas')", unidade: 'C' },
        { rotulo: 'Densidade σ da casca', simbolo: r`\sigma`, expr: "carga('cas')/(4*pi*b^2)", unidade: 'C/m²', teoria: '-fator*a^3*rho/(3*b^2)' },
        { rotulo: 'a³ρ + 3b²σ', simbolo: r`a^3\rho + 3b^2\sigma`, expr: "a^3*rho + 3*b^2*carga('cas')/(4*pi*b^2)", unidade: 'C' },
      ],
      passos: [
        {
          titulo: 'O formato não importa',
          texto: r`Pela lei de Gauss, o fluxo depende só da carga envolvida. Como $c > 2b$, o cubo envolve a esfera e a casca inteiras. O tamanho do cubo some da resposta.

Fluxo nulo significa carga total nula.`,
          medidas: [0],
        },
        {
          titulo: 'Igualar as cargas',
          texto: r`$$\frac43\pi a^3\rho + 4\pi b^2\sigma = 0 \quad\Rightarrow\quad a^3\rho = -3b^2\sigma.$$`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Mude a relação',
          previsao: { pergunta: 'Mudando o lado c do cubo (sempre com c > 2b), o fluxo…', opcoes: ['muda', 'continua nulo'], correta: 1 },
          texto: r`Varie $c$: nada acontece. Tire $f$ de 1: a carga total deixa de ser nula e o fluxo aparece, igual a $Q/\varepsilon_0$.`,
          parametros: { fator: 0.5 },
          medidas: [0, 4],
        },
        {
          titulo: 'Resposta',
          texto: r`$a^3\rho = -3b^2\sigma$: alternativa **(f)**.`,
          parametros: { fator: 1 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Gauss', texto: r`Fluxo nulo implica $Q_\text{int} = 0$. Como o cubo envolve tudo, $Q_\text{esfera} + Q_\text{casca} = 0$.`, passo: 0 },
          { titulo: 'Conta', texto: r`$\frac43\pi a^3\rho + 4\pi b^2\sigma = 0$, logo $a^3\rho = -3b^2\sigma$.`, passo: 1 },
        ],
        resultado: r`$a^3\rho = -3b^2\sigma$: alternativa **(f)**.`,
        errosComuns: [
          r`Fazer $c$ entrar na resposta. O cubo só precisa envolver tudo.`,
          r`Esquecer o sinal: para somar zero, $\rho$ e $\sigma$ têm sinais opostos.`,
          r`Trocar volume e área: $\frac43\pi a^3$ para a esfera, $4\pi b^2$ para a casca.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$bc\rho = a\sigma$`, porque: r`O lado $c$ não pode entrar: o fluxo não depende dele. E o sinal está errado.` },
        { letra: 'b', texto: r`$bc\rho = -a\sigma$`, porque: r`O sinal está certo, mas $c$ e as potências de $a$ e $b$, não.` },
        { letra: 'c', texto: r`$c\rho = 3\sigma$`, porque: r`Tem $c$ na resposta e sinal errado.` },
        { letra: 'd', texto: r`$c\rho = -3\sigma$`, porque: r`Sinal certo, mas seria o caso de $a = b = c$, sem sentido aqui.` },
        { letra: 'e', texto: r`$a^3\rho = 3b^2\sigma$`, porque: r`Geometria certa, sinal errado: com $\rho$ e $\sigma$ do mesmo sinal as cargas se somariam.` },
        { letra: 'f', texto: r`$a^3\rho = -3b^2\sigma$`, correta: true, porque: r`Correta: é a condição de carga total nula.` },
      ],
    },

    /* ───────────────────────── Discursiva 1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 2.6,
      titulo: 'Dois anéis coaxiais de cargas opostas',
      resumo: 'Potencial por integração direta, campo e gráfico de V(z).',
      enunciado: r`Dois anéis circulares de mesmo raio $a$, coaxiais com o eixo $z$, têm cargas $Q > 0$ e $-Q$ uniformemente distribuídas. O centro do anel positivo está em $z = 0$ e o do negativo, em $z = 2a$.

(a) Usando integração direta, determine o potencial $V(z)$ num ponto $P = (0,0,z)$ do eixo, com $z$ arbitrário. (b) Obtenha o campo elétrico total $\vec E(P)$. (c) Faça um gráfico de $V$ contra $z$ no intervalo $-2a \le z \le 4a$.`,
      figura: [
        { pagina: 2, recorte: [0.545, 0.855, 0.95, 0.91] },
        { pagina: 3, recorte: [0.13, 0.02, 0.49, 0.275] },
        { pagina: 3, recorte: [0.1, 0.3, 0.49, 0.51] },
      ],
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', camera: { pos: [17, 7, 8], alvo: [0, 0, 3] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 0.5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'zP', rotulo: 'Posição de P', simbolo: 'z', valor: 0.09, unidade: 'm', min: -0.06, max: 0.12, passo: 0.001 },
      ],
      objetos: [
        { id: 'an1', tipo: 'anelCarga', Q: 'Q', centro: [0, 0, 0], raio: 'a', normal: 'z', rotulo: '+Q' },
        { id: 'an2', tipo: 'anelCarga', Q: '0-Q', centro: [0, 0, '2*a'], raio: 'a', normal: 'z', rotulo: '−Q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Potencial em P', simbolo: 'V', expr: 'V(0, 0, zP)', unidade: 'V', teoria: Va('zP') },
        { rotulo: 'Campo em P', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m', teoria: Ea('zP') },
        { rotulo: 'Potencial no meio, z = a', simbolo: 'V(a)', expr: 'V(0, 0, a)', unidade: 'V', teoria: 0 },
        { rotulo: 'Campo no meio, z = a', simbolo: 'E_z(a)', expr: 'z(E(0, 0, a))', unidade: 'V/m', teoria: '2*k0*Q*a/(2*a^2)^1.5' },
      ],
      graficos: [
        {
          titulo: 'V(z) no intervalo pedido',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '-2*a', ate: '4*a', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'V(0, 0, zz)', unidade: 'V' },
            { rotulo: 'analítico', expr: Va('zz'), unidade: 'V' },
          ],
        },
        {
          titulo: 'E_z(z) no eixo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '-2*a', ate: '4*a', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'z(E(0, 0, zz))', unidade: 'V/m' },
            { rotulo: 'analítico', expr: Ea('zz'), unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Um anel: todos os dq à mesma distância',
          texto: r`Num ponto do eixo, todos os elementos de um anel estão à mesma distância: $r_+ = \sqrt{a^2+z^2}$. A integral do potencial é imediata, porque $r_+$ sai dela:

$$V_+ = \int\frac{dq}{4\pi\varepsilon_0r_+} = \frac{Q}{4\pi\varepsilon_0\sqrt{a^2+z^2}}.$$`,
          destacar: ['an1'],
        },
        {
          item: 'a',
          titulo: '(a) Somar os dois anéis',
          texto: r`O anel negativo está em $z = 2a$:

$$V(z) = \frac{Q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{z^2+a^2}} - \frac{1}{\sqrt{(z-2a)^2+a^2}}\right].$$`,
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Campo no eixo',
          previsao: { pergunta: 'Entre os anéis, os campos dos dois apontam…', opcoes: ['no mesmo sentido', 'em sentidos opostos'], correta: 0 },
          texto: r`Por simetria só existe $E_z$. Derivando (ou somando o campo de cada anel):

$$\vec E(z) = \frac{Q}{4\pi\varepsilon_0}\left[\frac{z}{(z^2+a^2)^{3/2}} + \frac{2a-z}{[(2a-z)^2+a^2]^{3/2}}\right]\hat z.$$

Entre os anéis, as duas parcelas são positivas: o campo sai do positivo e vai para o negativo. No meio ele é máximo, não nulo.`,
          parametros: { zP: 0.03 },
          medidas: [1, 3],
        },
        {
          item: 'c',
          titulo: '(c) O gráfico',
          texto: r`$V$ é ímpar em torno de $z = a$: troca de sinal, com $V(a) = 0$. Tem um máximo perto do anel positivo e um mínimo perto do negativo, e vai a zero longe, pois a carga total é nula.

O máximo não fica exatamente em $z = 0$, e sim um pouco antes: a influência do anel negativo o desloca.`,
          parametros: { zP: 0.03 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de distribuição contínua', lab: 'potencial' },
          { texto: 'Campo como gradiente do potencial', lab: 'potencial' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: '(a) Anel positivo', texto: r`$V_+ = \dfrac{Q}{4\pi\varepsilon_0\sqrt{a^2+z^2}}$.`, passo: 0 },
          { titulo: '(a) Soma', texto: r`O anel negativo contribui com $-Q/[4\pi\varepsilon_0\sqrt{(z-2a)^2+a^2}]$.`, passo: 1 },
          { titulo: '(b) Campo', texto: r`Com $E_z = -dV/dz$, ou somando $\vec E$ de cada anel: $E_z = k_0Q\left[\dfrac{z}{(z^2+a^2)^{3/2}} + \dfrac{2a-z}{[(2a-z)^2+a^2]^{3/2}}\right]$.`, passo: 2 },
          { titulo: '(c) Gráfico', texto: r`Curva ímpar em torno de $z = a$, com máximo perto de $z = 0$, mínimo perto de $z = 2a$ e zero no meio.`, passo: 3 },
        ],
        resultado: r`$V(z) = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{z^2+a^2}} - \dfrac{1}{\sqrt{(z-2a)^2+a^2}}\right]$ e $\vec E = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac{z}{(z^2+a^2)^{3/2}} + \dfrac{2a-z}{[(2a-z)^2+a^2]^{3/2}}\right]\hat z$.`,
        errosComuns: [
          r`Somar módulos de campo sem olhar o sentido: entre os anéis eles se reforçam.`,
          r`Trocar $z - 2a$ por $z + 2a$ na distância ao segundo anel.`,
          r`Desenhar $V$ com um extremo exatamente em $z = 0$ e $z = 2a$.`,
        ],
        oficial: {
          resposta: r`$V(z) = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{z^2+a^2}} - \dfrac{1}{\sqrt{(z-2a)^2+a^2}}\right]$`,
          observacao: r`**Divergência:** o quadro final de (b) no gabarito traz sinal de menos antes de $\frac{2a-z}{[\ldots]^{3/2}}$. Isso daria $E = 0$ em $z = a$, o que contraria $E_z = -dV/dz$ e a figura do próprio gabarito, onde $\vec E_+$ e $\vec E_-$ apontam para o mesmo lado. A expressão com sinal de mais é a que bate com a simulação.`,
        },
      },
      respostas: [
        { item: 'a', texto: r`$V(z) = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{z^2+a^2}} - \dfrac{1}{\sqrt{(z-2a)^2+a^2}}\right]$`, pontos: 1, criterio: 'Integração direta em cada anel e soma.' },
        { item: 'b', texto: r`$\vec E = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac{z}{(z^2+a^2)^{3/2}} + \dfrac{2a-z}{[(2a-z)^2+a^2]^{3/2}}\right]\hat z$`, pontos: 1, criterio: 'Só componente axial; gradiente ou soma dos campos.' },
        { item: 'c', texto: r`Curva ímpar em torno de $z = a$, com um máximo e um mínimo`, pontos: 0.6, criterio: 'Zero no meio, extremos perto dos anéis e queda longe.' },
      ],
    },

    /* ───────────────────────── Discursiva 2 ───────────────────────── */
    {
      id: 'disc2',
      numero: 'D2',
      secao: 'Discursiva',
      pontos: 2.6,
      titulo: 'Coroa esférica com ρ = ρ₀(r/R)³',
      resumo: 'Simetria, escolha da gaussiana, campo nas três regiões e gráfico.',
      enunciado: r`Uma coroa esférica de raios $R$ e $2R$ tem densidade volumar $\rho(r) = \rho_0(r/R)^3$ para $R \le r \le 2R$, e nula fora dali, com $r$ medido a partir do centro.

(a) Use argumentos de simetria para deduzir as componentes não nulas de $\vec E$ e de que coordenadas dependem. (b) Escolha uma gaussiana conveniente e expresse o fluxo por ela. (c) Determine a carga no interior da gaussiana nas regiões $0 \le r \le R$, $R \le r \le 2R$ e $2R \le r < \infty$, e deduza o campo em cada uma. (d) Faça um esboço do módulo de $E$ versus $r$ em $0 \le r \le 3R$, indicando $E$ em $r = 0, R, 2R$ e $3R$.`,
      figura: [
        { pagina: 3, recorte: [0.09, 0.535, 0.49, 0.91] },
        { pagina: 3, recorte: [0.55, 0.02, 0.95, 0.475] },
      ],
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', plano: 'xy', camera: { pos: [6, 8, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Constante ρ₀', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: -3e-6, max: 3e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio interno', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.06, unidade: 'm', min: 0.005, max: 0.12, passo: 0.001 },
      ],
      objetos: [
        { id: 'coroa', tipo: 'esfera', centro: [0, 0, 0], raio: '2*R', raioInterno: 'R', rho: 'rho0*(r/R)^3', rotulo: 'coroa' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S_r' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: Qc('rg') },
        { rotulo: 'Fluxo por S_r', simbolo: r`\Phi`, expr: "fluxo('G')", unidade: 'V·m', teoria: `${Qc('rg')}/eps0` },
        { rotulo: 'Campo em r', simbolo: 'E_r', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: `${Qc('rg')}/(4*pi*eps0*rg^2)` },
        { rotulo: 'Carga total', simbolo: r`Q_\text{tot}`, expr: "carga('coroa')", unidade: 'C', teoria: '42*pi*rho0*R^3' },
        { rotulo: 'E em r = 2R', simbolo: 'E(2R)', expr: 'mag(E(2*R, 0, 0))', unidade: 'V/m', teoria: '21*abs(rho0)*R/(8*eps0)' },
        { rotulo: 'E em r = 3R', simbolo: 'E(3R)', expr: 'mag(E(3*R, 0, 0))', unidade: 'V/m', teoria: '21*abs(rho0)*R/(18*eps0)' },
      ],
      graficos: [
        {
          titulo: 'Módulo de E versus r',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: '3*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'mag(E(rr, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: `abs(${Qc('rr')})/(4*pi*eps0*rr^2)`, unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Simetria',
          texto: r`Em coordenadas esféricas, $\vec E = E_r\hat r + E_\theta\hat\theta + E_\varphi\hat\varphi$.

Uma reflexão num plano que passa por $O$ e pelo ponto não altera a fonte, mas inverte $\hat\theta$: logo $E_\theta = 0$. O mesmo argumento dá $E_\varphi = 0$. A simetria de rotação em torno de $O$ faz $E_r$ depender só de $r$:

$$\vec E = E_r(r)\,\hat r.$$`,
        },
        {
          item: 'b',
          titulo: '(b) Gaussiana esférica',
          texto: r`Use uma esfera $S_r$ de raio $r$, centrada em $O$. Nela $\hat n = \hat r$ e $E_r$ é constante:

$$\Phi = \oint E_r\,dA = E_r(r)\,4\pi r^2.$$`,
          destacar: ['G'],
          medidas: [1],
        },
        {
          item: 'c',
          titulo: '(c) Dentro da cavidade',
          texto: r`Para $0 \le r \le R$, $Q_\text{int} = 0$ e $\vec E = \vec 0$.`,
          parametros: { rg: 0.02 },
          medidas: [0, 2],
        },
        {
          item: 'c',
          titulo: '(c) Dentro da coroa',
          previsao: { pergunta: 'Para R < r < 2R, a carga envolvida cresce com…', opcoes: ['r³', 'r⁴', 'r⁶'], correta: 2 },
          texto: r`Integrando em cascas:

$$Q_\text{int} = \int_R^r\rho_0\frac{r'^3}{R^3}4\pi r'^2dr' = \frac{2\pi\rho_0}{3R^3}(r^6 - R^6),$$

$$\vec E = \frac{\rho_0}{6\varepsilon_0R^3}\left(r^4 - \frac{R^6}{r^2}\right)\hat r.$$`,
          parametros: { rg: 0.06 },
          medidas: [0, 1, 2],
        },
        {
          item: 'c',
          titulo: '(c) Fora da coroa',
          texto: r`Para $r \ge 2R$, $Q_\text{int} = Q_\text{tot} = 42\pi\rho_0R^3$ e

$$\vec E = \frac{21\rho_0R^3}{2\varepsilon_0r^2}\hat r = \frac{Q_\text{tot}}{4\pi\varepsilon_0r^2}\hat r.$$`,
          parametros: { rg: 0.1 },
          medidas: [0, 2, 3],
        },
        {
          item: 'd',
          titulo: '(d) O gráfico',
          texto: r`Três arcos: zero até $R$; crescente e com concavidade para cima até $2R$; decrescente e com concavidade para cima depois. O máximo é em $2R$:

$$E(0) = E(R) = 0, \quad E(2R) = \frac{21|\rho_0|R}{8\varepsilon_0}, \quad E(3R) = \frac{21|\rho_0|R}{18\varepsilon_0}.$$`,
          parametros: { rg: 0.08 },
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' }],
        etapas: [
          { titulo: '(a) Simetria', texto: r`Reflexões eliminam $E_\theta$ e $E_\varphi$; rotações fazem $E_r$ depender só de $r$.`, passo: 0 },
          { titulo: '(b) Fluxo', texto: r`Na esfera $S_r$: $\Phi = 4\pi r^2E_r(r)$.`, passo: 1 },
          { titulo: '(c) Carga e campo', texto: r`$Q_\text{int} = 0$; $\frac{2\pi\rho_0}{3R^3}(r^6-R^6)$; $42\pi\rho_0R^3$. Dividindo por $4\pi\varepsilon_0r^2$ sai o campo em cada região.`, passo: 3 },
          { titulo: '(d) Gráfico', texto: r`Valores: $0$, $0$, $21|\rho_0|R/8\varepsilon_0$ e $21|\rho_0|R/18\varepsilon_0$.`, passo: 5 },
        ],
        resultado: r`$\vec E = \vec 0$; $\dfrac{\rho_0}{6\varepsilon_0R^3}\left(r^4 - \dfrac{R^6}{r^2}\right)\hat r$; $\dfrac{21\rho_0R^3}{2\varepsilon_0r^2}\hat r$.`,
        errosComuns: [
          r`Afirmar a simetria sem argumentar: o item pede a justificativa.`,
          r`Integrar a partir de $r' = 0$: a carga só começa em $R$.`,
          r`Usar $\rho\cdot$volume: a densidade varia com $r$.`,
        ],
        oficial: { resposta: r`$\vec E = \vec 0$; $\dfrac{\rho_0}{6\varepsilon_0R^3}\left(r^4 - \dfrac{R^6}{r^2}\right)\hat r$; $\dfrac{21\rho_0R^3}{2\varepsilon_0r^2}\hat r$. $E(2R) = \dfrac{21|\rho_0|R}{8\varepsilon_0}$, $E(3R) = \dfrac{21|\rho_0|R}{18\varepsilon_0}$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\vec E = E_r(r)\hat r$`, pontos: 0.3, criterio: 'Reflexão para eliminar componentes e rotação para a dependência.' },
        { item: 'b', texto: r`Esfera de raio $r$ centrada em $O$: $\Phi = 4\pi r^2E_r$`, pontos: 0.3, criterio: 'Forma, tamanho, posição e fluxo.' },
        { item: 'c', texto: r`$\vec 0$; $\dfrac{\rho_0}{6\varepsilon_0R^3}\left(r^4 - \dfrac{R^6}{r^2}\right)\hat r$; $\dfrac{21\rho_0R^3}{2\varepsilon_0r^2}\hat r$`, pontos: 1.4, criterio: 'Carga interna nas três regiões e o campo em cada uma.' },
        { item: 'd', texto: r`Zero até $R$, cresce até $E(2R) = 21|\rho_0|R/8\varepsilon_0$, cai até $E(3R) = 21|\rho_0|R/18\varepsilon_0$`, pontos: 0.6, criterio: 'Três arcos, concavidades e valores nos pontos pedidos.' },
      ],
    },
  ],
}

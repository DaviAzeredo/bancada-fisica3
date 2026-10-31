import type { ProvaInput } from '../../scenario/schema'
import { condutorOco } from './modelos.ts'

const r = String.raw

/* Condutor esférico da objetiva 1: cavidade de raio A, metal até B (em m). */
const A = 0.04
const B = 0.08
const oco = condutorOco(A, B)

/* Discursiva 2: casca a ≤ r ≤ b com ρ = C r. */
const Qr = (u: string, v = `(${u})`) => `pi*Cc*(min(max(${v},a),b)^4 - a^4)`
const Vr = (u: string, v = `(${u})`) =>
  `${v} < a ? 0 : (${v} <= b ? Cc/(12*eps0)*(4*a^3 - ${v}^3 - 3*a^4/${v}) : Cc/(12*eps0)*(4*a^3 - b^3 - 3*a^4/b) + k0*pi*Cc*(b^4-a^4)*(1/${v} - 1/b))`

/* Objetiva 3: campo das três distribuições, com casca de raio interno ri. */
const E1 = (u: string, v = `(${u})`) => `${v} < R ? 0 : k0*Q/${v}^2`
const E2 = (u: string, v = `(${u})`) => `${v} < ri ? 0 : (${v} < R ? k0*Q*(${v}^3 - ri^3)/((R^3 - ri^3)*${v}^2) : k0*Q/${v}^2)`
const E3 = (u: string, v = `(${u})`) => `${v} < R ? k0*Q*${v}/R^3 : k0*Q/${v}^2`

/**
 * P1 de Física III, 2026/2, diurno, versão C (IF-UFRJ, 2026-09-21).
 * Conferida com o gabarito preliminar oficial (objetivas 1c, 2a, 3e; D1 e D2).
 */
export const p1_2026_2_diurno: ProvaInput = {
  id: 'p1-2026-2-diurno',
  titulo: 'P1 · 2026/2 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão C · 21/09/2026',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cargas nas superfícies de um condutor oco',
      resumo: 'Partícula numa cavidade: quanto vai para S_int e para S_ext.',
      enunciado: r`Um condutor em equilíbrio eletrostático, com carga total $Q_c = -2\,\text{C}$, envolve uma cavidade onde há uma partícula imóvel de carga $q_p = -3\,\text{C}$. A fronteira do condutor tem uma superfície externa $S_\text{ext}$ e uma interna $S_\text{int}$. Qual é a carga total em cada uma, $Q_\text{int}$ e $Q_\text{ext}$?`,
      figura: { pagina: 1, recorte: [0.11, 0.505, 0.5, 0.745] },
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', plano: 'xy', camera: { pos: [5, 7, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'qp', rotulo: 'Carga da partícula', simbolo: 'q_p', valor: -3, unidade: 'C', min: -5, max: 5, passo: 0.5 },
        { id: 'Qc', rotulo: 'Carga do condutor', simbolo: 'Q_c', valor: -2, unidade: 'C', min: -5, max: 5, passo: 0.5 },
        { id: 'xq', rotulo: 'Posição da partícula', simbolo: 'x_p', valor: 0, unidade: 'm', min: -0.03, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'cond', tipo: 'esfera', Q: 0, centro: [0, 0, 0], raio: B, raioInterno: A },
        { id: 'qp', tipo: 'carga', q: 'qp', pos: ['xq', 0, 0], arraste: { param: 'xq', eixo: 'x' }, rotulo: 'q_p' },
        { id: 'ind', tipo: 'campoE', valor: oco.campo, potencial: oco.potencial },
        { id: 'Sm', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: (A + B) / 2, rotulo: 'S no metal' },
        { id: 'tInt', tipo: 'rotulo', pos: [-0.034, -0.034, 0], texto: 'S_int' },
        { id: 'tExt', tipo: 'rotulo', pos: [0.06, -0.06, 0], texto: 'S_ext' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy', fontes: ['qp', 'ind'] },
      medidas: [
        { rotulo: 'Carga envolvida por S no metal', simbolo: r`\varepsilon_0\oint\vec E\cdot d\vec A`, expr: "eps0*fluxo('Sm')", unidade: 'C', teoria: 0 },
        { rotulo: 'Carga em S_int', simbolo: r`Q_\text{int}`, expr: "eps0*fluxo('Sm') - qp", unidade: 'C', teoria: '0-qp' },
        { rotulo: 'Carga em S_ext', simbolo: r`Q_\text{ext}`, expr: "eps0*4*pi*0.11^2*y(E(0, 0.11, 0)) - eps0*fluxo('Sm')", unidade: 'C', teoria: 'Qc + qp' },
        { rotulo: 'Campo a 11 cm do centro', simbolo: r`|\vec E|`, expr: 'mag(E(0, 0.11, 0))', unidade: 'V/m', teoria: 'k0*abs(Qc + qp)/0.11^2' },
      ],
      passos: [
        {
          titulo: 'Montar o problema',
          texto: r`O condutor é uma camada de metal com uma cavidade; dentro dela, a partícula $q_p$. A cena usa uma forma esférica, mas o argumento vale para qualquer forma.

Em equilíbrio, $\vec E = 0$ **dentro do metal**. As setas mostram isso: há campo na cavidade e fora, nenhum na camada metálica.`,
        },
        {
          titulo: 'Gaussiana dentro do metal',
          texto: r`Tome uma superfície fechada inteira dentro do metal, envolvendo a cavidade. Em cada ponto dela $\vec E = 0$, então

$$\oint \vec E\cdot d\vec A = 0 = \frac{q_p + Q_\text{int}}{\varepsilon_0}\quad\Rightarrow\quad Q_\text{int} = -q_p = +3\,\text{C}.$$`,
          destacar: ['Sm'],
          medidas: [0, 1],
        },
        {
          titulo: 'Conservação: o resto vai para fora',
          texto: r`A carga do condutor é a soma das duas superfícies (no volume do metal não há carga):

$$Q_\text{ext} = Q_c - Q_\text{int} = -2 - 3 = -5\,\text{C}.$$

Uma esfera de raio 11 cm, fora de tudo, envolve $q_p + Q_c = -5\,\text{C}$: o campo externo é o de $-5\,\text{C}$ no centro, e o fluxo por ela é $4\pi r^2E_r$.`,
          destacar: ['cond'],
          medidas: [2, 3],
        },
        {
          titulo: 'E se a partícula se mover?',
          previsao: { pergunta: r`Deslocando $q_p$ dentro da cavidade, $Q_\text{int}$ e $Q_\text{ext}$…`, opcoes: ['mudam', 'não mudam'], correta: 1 },
          texto: r`Arraste a partícula. Na cavidade o campo muda: a carga de $S_\text{int}$ se concentra perto de $q_p$. Mas a **soma** continua $-q_p$, porque a gaussiana no metal continua com fluxo nulo.

Fora, nada muda: o metal blinda o exterior, e $S_\text{ext}$ fica com $-5\,\text{C}$ distribuídos como se a cavidade não existisse.`,
          parametros: { xq: 0.025 },
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`$Q_\text{int} = 3\,\text{C}$ e $Q_\text{ext} = -5\,\text{C}$: alternativa **(c)**.`,
          parametros: { xq: 0 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio: E = 0 no metal', lab: 'gauss' },
          { texto: 'Lei de Gauss', lab: 'gauss' },
          { texto: 'Conservação da carga' },
        ],
        etapas: [
          {
            titulo: 'Gaussiana no metal',
            texto: r`Uma superfície fechada contida no metal e envolvendo a cavidade tem $\vec E = 0$ em todos os pontos. O fluxo é nulo, logo a carga envolvida também: $q_p + Q_\text{int} = 0$, e $Q_\text{int} = -q_p = 3\,\text{C}$.`,
            passo: 1,
          },
          {
            titulo: 'Conservação',
            texto: r`Toda a carga do condutor está nas superfícies: $Q_c = Q_\text{int} + Q_\text{ext}$. Então $Q_\text{ext} = Q_c - Q_\text{int} = -2 - 3 = -5\,\text{C}$.`,
            passo: 2,
          },
          {
            titulo: 'Não depende da posição',
            texto: r`A posição de $q_p$ muda **como** a carga se distribui em $S_\text{int}$, não quanto há nela. O argumento de Gauss não usou a posição.`,
            passo: 3,
          },
        ],
        resultado: r`$Q_\text{int} = 3\,\text{C}$, $Q_\text{ext} = -5\,\text{C}$: alternativa **(c)**.`,
        errosComuns: [
          r`Dar a $S_\text{int}$ o mesmo sinal de $q_p$. A carga induzida tem sinal oposto, para anular o campo no metal.`,
          r`Esquecer a conservação e deixar $Q_\text{ext} = Q_c$. A carga $Q_\text{int}$ saiu do próprio condutor.`,
          r`Achar que a posição da partícula altera os totais. Ela só altera a distribuição em $S_\text{int}$.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$Q_\text{int} = -3\,\text{C}$, $Q_\text{ext} = 1\,\text{C}$`, porque: r`Troca o sinal da carga induzida: $S_\text{int}$ precisa de $-q_p = +3\,\text{C}$ para o fluxo no metal ser nulo.` },
        { letra: 'b', texto: r`$Q_\text{int} = 0$, $Q_\text{ext} = -2\,\text{C}$`, porque: r`Ignora a indução. Com $Q_\text{int} = 0$ a gaussiana no metal envolveria $-3\,\text{C}$ e haveria campo no condutor.` },
        { letra: 'c', texto: r`$Q_\text{int} = 3\,\text{C}$, $Q_\text{ext} = -5\,\text{C}$`, correta: true, porque: r`Correta: Gauss no metal dá $Q_\text{int} = -q_p$, e a conservação dá $Q_\text{ext} = Q_c - Q_\text{int}$.` },
        { letra: 'd', texto: r`$Q_\text{int} = 3\,\text{C}$, $Q_\text{ext} = -2\,\text{C}$`, porque: r`Acerta $Q_\text{int}$ mas esquece que essa carga saiu do condutor: $Q_\text{int} + Q_\text{ext}$ tem de ser $Q_c = -2\,\text{C}$.` },
        { letra: 'e', texto: 'Dependem da posição exata da partícula na cavidade.', porque: r`A posição muda a distribuição em $S_\text{int}$, não o total. Gauss e conservação fixam os dois valores.` },
        { letra: 'f', texto: r`$Q_\text{int} = -1\,\text{C}$, $Q_\text{ext} = -1\,\text{C}$`, porque: r`Divide $Q_c$ igualmente entre as superfícies, como se a partícula não existisse.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Onde o campo de duas cargas se anula',
      resumo: 'Cargas de mesmo sinal e de sinais opostos, com |q₁| < |q₂|.',
      enunciado: r`Duas partículas, 1 e 2, com cargas de módulos $|q_1| < |q_2|$, estão nas posições da figura, que também mostra os pontos $A$, $B$, $C$, $D$ e $E$ na reta que as une. Qual desses pontos melhor representa aquele em que o campo elétrico resultante se anula?`,
      figura: { pagina: 1, recorte: [0.505, 0.465, 0.895, 0.64] },
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [0, 3, 24], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'sinal',
          rotulo: 'Sinais',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'mesmo sinal' },
            { valor: -1, rotulo: 'sinais opostos' },
          ],
        },
        { id: 'razao', rotulo: 'Razão |q₂|/|q₁|', simbolo: r`|q_2|/|q_1|`, valor: 9, min: 1.5, max: 16, passo: 0.5 },
        { id: 'q1', rotulo: 'Carga 1', simbolo: 'q_1', valor: 2e-9, unidade: 'C', min: 2e-9, max: 2e-9 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'q1', pos: [-0.03, 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: 'sinal*razao*q1', pos: [0.03, 0, 0], rotulo: 'q₂' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: [-0.06, 0, 0], rotulo: 'A' },
        { id: 'B', tipo: 'sonda', campo: 'E', pos: [-0.015, 0, 0], rotulo: 'B' },
        { id: 'C', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'C' },
        { id: 'D', tipo: 'sonda', campo: 'E', pos: [0.015, 0, 0], rotulo: 'D' },
        { id: 'E', tipo: 'sonda', campo: 'E', pos: [0.075, 0, 0], rotulo: 'E' },
      ],
      visual: { linhasE: true, densidade: 12 },
      medidas: [
        {
          rotulo: 'Ponto de campo nulo (x)',
          simbolo: 'x_0',
          expr: 'sinal > 0 ? -0.03 + 0.06/(1 + sqrt(razao)) : -0.03 - 0.06/(sqrt(razao) - 1)',
          unidade: 'm',
        },
        {
          rotulo: 'Campo simulado em x₀',
          simbolo: r`|\vec E(x_0)|`,
          expr: 'mag(E(sinal > 0 ? -0.03 + 0.06/(1 + sqrt(razao)) : -0.03 - 0.06/(sqrt(razao) - 1), 0, 0))',
          unidade: 'V/m',
          teoria: 0,
        },
        { rotulo: 'Campo em B', simbolo: 'E_x(B)', expr: 'x(E(-0.015, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Campo em A', simbolo: 'E_x(A)', expr: 'x(E(-0.06, 0, 0))', unidade: 'V/m' },
      ],
      graficos: [
        {
          titulo: 'Campo ao longo da reta (cortado perto das cargas)',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.09, ate: 0.09, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'E_x', expr: 'max(-2e5, min(2e5, x(E(xx, 0, 0))))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Duas condições',
          texto: r`Na reta das cargas, cada campo aponta ao longo da reta. Para o resultante se anular num ponto, os dois campos têm de ter **sentidos opostos** e **módulos iguais** ali.

O módulo cai com $1/r^2$: para empatar com a carga maior, o ponto precisa ficar **mais perto da carga menor**, $q_1$.`,
        },
        {
          titulo: 'Mesmo sinal: entre as cargas',
          previsao: { pergunta: 'Com cargas de mesmo sinal, o campo se anula…', opcoes: ['entre elas, perto de q₁', 'entre elas, perto de q₂', 'fora do segmento'], correta: 0 },
          texto: r`Entre as cargas os campos são opostos (cada um aponta para longe da sua carga). Igualando os módulos, com $d$ a distância entre elas:

$$\frac{k_0|q_1|}{x^2} = \frac{k_0|q_2|}{(d-x)^2}\ \Rightarrow\ x = \frac{d}{1+\sqrt{|q_2|/|q_1|}}$$

Com $|q_2| = 9|q_1|$, $x = d/4$ a partir de $q_1$: o ponto **B**.`,
          parametros: { sinal: 1 },
          destacar: ['B'],
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Sinais opostos: do lado de fora, junto de q₁',
          texto: r`Entre as cargas os dois campos apontam para o mesmo lado (da positiva para a negativa): não há cancelamento. Fora do segmento eles são opostos, e o empate exige ficar perto da carga **menor**:

$$\frac{k_0|q_1|}{x^2} = \frac{k_0|q_2|}{(d+x)^2}\ \Rightarrow\ x = \frac{d}{\sqrt{|q_2|/|q_1|}-1}$$

Com razão 9, $x = d/2$ à esquerda de $q_1$: o ponto **A**. Além de $q_2$ (ponto $E$) é impossível, pois a carga maior também estaria mais perto.`,
          parametros: { sinal: -1 },
          destacar: ['A'],
          medidas: [0, 1, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`Mesmo sinal: $B$; sinais opostos: $A$. Alternativa **(a)**. Mude a razão $|q_2|/|q_1|$: o ponto nulo anda, mas fica sempre do lado de $q_1$.`,
          parametros: { sinal: 1 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Coulomb e superposição', lab: 'coulomb' },
          { texto: 'Campo de carga pontual cai com 1/r²' },
        ],
        etapas: [
          {
            titulo: 'Condições para E = 0',
            texto: r`Os campos das duas cargas precisam ter sentidos opostos e módulos iguais. Como $|q_1| < |q_2|$, o ponto tem de estar mais perto de $q_1$.`,
            passo: 0,
          },
          {
            titulo: 'Mesmo sinal',
            texto: r`Os sentidos só se opõem **entre** as cargas. O ponto fica entre elas, mais perto de $q_1$: $B$.`,
            passo: 1,
          },
          {
            titulo: 'Sinais opostos',
            texto: r`Os sentidos só se opõem **fora** do segmento. Do lado de $q_2$ a carga maior também está mais perto, então o empate só acontece do lado de $q_1$: $A$.`,
            passo: 2,
          },
        ],
        resultado: r`Mesmo sinal: $B$; sinais opostos: $A$. Alternativa **(a)**.`,
        errosComuns: [
          r`Pôr o ponto nulo no meio ($C$). Isso só vale para cargas iguais em módulo.`,
          r`Procurar o ponto perto da carga maior. O campo dela é mais forte; para empatar é preciso estar longe dela.`,
          r`Procurar entre as cargas no caso de sinais opostos: ali os dois campos apontam para o mesmo lado.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`Mesmo sinal: $B$; sinais opostos: $A$.`, correta: true, porque: r`Correta: entre as cargas e perto de $q_1$ no primeiro caso; fora e do lado de $q_1$ no segundo.` },
        { letra: 'b', texto: r`Mesmo sinal: $C$; sinais opostos: $A$.`, porque: r`$C$ é o ponto médio, nulo só para $|q_1| = |q_2|$. Com $q_2$ maior, em $C$ vence o campo de $q_2$.` },
        { letra: 'c', texto: r`Mesmo sinal: $B$; sinais opostos: $E$.`, porque: r`Em $E$ a carga maior está mais perto: o campo de $q_2$ sempre vence ali.` },
        { letra: 'd', texto: r`Mesmo sinal: $A$; sinais opostos: $B$.`, porque: r`Inverte os casos. Fora do segmento, cargas de mesmo sinal têm campos no mesmo sentido; entre elas, cargas opostas também.` },
        { letra: 'e', texto: 'Não existe ponto de campo nulo em nenhum dos dois casos.', porque: r`Com $|q_1| \neq |q_2|$ existe um ponto nulo em cada caso. Só para cargas opostas e **iguais** ele desapareceria (iria ao infinito).` },
        { letra: 'f', texto: r`Mesmo sinal: $D$; sinais opostos: $E$.`, porque: r`Põe o ponto junto da carga maior nos dois casos; é o contrário.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Energia de três esferas de mesma carga',
      resumo: 'Esfera condutora, casca espessa e bola maciça: qual guarda mais energia?',
      enunciado: r`Três distribuições têm a mesma carga $Q$: (1) uma esfera condutora de raio $R$; (2) uma casca esférica espessa de raios $r$ e $R$, com densidade volumar constante; (3) uma bola de raio $R$ com densidade volumar constante. Montadas a partir de cargas infinitesimais vindas do infinito, qual é a relação entre as energias $U_1$, $U_2$ e $U_3$?`,
      figura: { pagina: 2, recorte: [0.07, 0.27, 0.49, 0.655] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [4, 5, 20], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(1) esfera condutora' },
            { valor: 2, rotulo: '(2) casca espessa' },
            { valor: 3, rotulo: '(3) bola maciça' },
          ],
        },
        { id: 'Q', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio externo', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'ri', rotulo: 'Raio interno da casca', simbolo: 'r', valor: 0.025, unidade: 'm', min: 0.005, max: 0.045, passo: 0.005 },
      ],
      objetos: [
        { id: 'e1', tipo: 'esfera', ativo: 'caso==1', Q: 'Q', centro: [0, 0, 0], raio: 'R', oca: true, rotulo: '(1)' },
        { id: 'e2', tipo: 'esfera', ativo: 'caso==2', Q: 'Q', centro: [0, 0, 0], raio: 'R', raioInterno: 'ri', rotulo: '(2)' },
        { id: 'e3', tipo: 'esfera', ativo: 'caso==3', Q: 'Q', centro: [0, 0, 0], raio: 'R', rotulo: '(3)' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        {
          rotulo: 'Campo simulado em 0,75 R',
          simbolo: r`E(0{,}75R)`,
          expr: 'mag(E(0.75*R, 0, 0))',
          unidade: 'V/m',
          teoria: `caso==1 ? 0 : (caso==2 ? ${E2('0.75*R')} : ${E3('0.75*R')})`,
        },
        { rotulo: 'Energia (1), condutora', simbolo: 'U_1', expr: 'k0*Q^2/(2*R)', unidade: 'J' },
        {
          rotulo: 'Energia (2), casca espessa',
          simbolo: 'U_2',
          expr: '3*k0*Q^2/(R^3 - ri^3)^2*((R^5 - ri^5)/5 - ri^3*(R^2 - ri^2)/2)',
          unidade: 'J',
        },
        { rotulo: 'Energia (3), bola maciça', simbolo: 'U_3', expr: '3*k0*Q^2/(5*R)', unidade: 'J' },
      ],
      graficos: [
        {
          titulo: 'E(r) nas três distribuições',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: '2.4*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: '(1)', expr: E1('rr'), unidade: 'V/m' },
            { rotulo: '(2)', expr: E2('rr'), unidade: 'V/m' },
            { rotulo: '(3)', expr: E3('rr'), unidade: 'V/m' },
            { rotulo: 'simulada', expr: 'mag(E(rr, 0, 0))', unidade: 'V/m' },
          ],
        },
        {
          titulo: 'Energia por camada, dU/dr (escolhida)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: '2.4*R', rotulo: 'r', unidade: 'm' },
          series: [{ rotulo: 'dU/dr', expr: 'eps0/2*mag(E(rr, 0, 0))^2*4*pi*rr^2', unidade: 'J/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Energia está no campo',
          texto: r`A energia de montagem é a energia do campo: $U = \displaystyle\int \frac{\varepsilon_0}{2}E^2\,dV$.

Fora de $R$ as três têm o **mesmo** campo, $k_0Q/r^2$, e guardam a mesma energia ali:
$$U_\text{fora} = \frac{k_0Q^2}{2R}.$$
A diferença está só no que cada uma tem **dentro**.`,
          parametros: { caso: 1 },
        },
        {
          titulo: '(1) Condutora: nada dentro',
          texto: r`A carga fica toda na superfície e $E = 0$ dentro:
$$U_1 = \frac{k_0Q^2}{2R}.$$
No gráfico $dU/dr$, a área começa só em $r = R$.`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(3) Bola maciça: campo em todo o interior',
          texto: r`Dentro, $E = k_0Qr/R^3$, e há energia extra:
$$\int_0^R \frac{\varepsilon_0}{2}\left(\frac{k_0Qr}{R^3}\right)^2 4\pi r^2\,dr = \frac{k_0Q^2}{10R}\ \Rightarrow\ U_3 = \frac{3k_0Q^2}{5R}.$$`,
          parametros: { caso: 3 },
          medidas: [0, 3],
        },
        {
          titulo: '(2) Casca espessa: no meio',
          previsao: { pergunta: 'A casca espessa (2) guarda uma energia…', opcoes: ['menor que U₁', 'entre U₁ e U₃', 'maior que U₃'], correta: 1 },
          texto: r`Há campo só entre $r$ e $R$, e ele é menor que o da bola em cada ponto. Então $U_1 < U_2 < U_3$:
$$U_2 = \frac{3k_0Q^2}{(R^3-r^3)^2}\left[\frac{R^5-r^5}{5} - \frac{r^3(R^2-r^2)}{2}\right].$$
Mova o raio interno: com $r \to 0$ vira a bola, com $r \to R$ vira a condutora.`,
          parametros: { caso: 2 },
          medidas: [0, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$U_3 > U_2 > U_1$: alternativa **(e)**. Quanto mais a carga é empurrada para dentro, mais trabalho custa a montagem.`,
          parametros: { caso: 2 },
          medidas: [1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Energia no campo elétrico', lab: 'potencial' },
          { texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' },
        ],
        etapas: [
          {
            titulo: 'Fora de R, tudo igual',
            texto: r`Por Gauss, as três têm $E = k_0Q/r^2$ para $r > R$. A energia dessa região é $k_0Q^2/2R$ nas três.`,
            passo: 0,
          },
          {
            titulo: 'Dentro de R, cada uma',
            texto: r`(1) $E = 0$: nada a somar, $U_1 = k_0Q^2/2R$. (3) $E = k_0Qr/R^3$: soma $k_0Q^2/10R$, $U_3 = 3k_0Q^2/5R$. (2) $E \neq 0$ só em $r < s < R$ e menor que em (3): $U_1 < U_2 < U_3$.`,
            passo: 3,
          },
        ],
        resultado: r`$U_3 > U_2 > U_1$: alternativa **(e)**.`,
        errosComuns: [
          r`Achar que as energias são iguais por terem a mesma carga e o mesmo raio. O campo de fora é o mesmo; o de dentro, não.`,
          r`Achar que concentrar a carga na superfície custa mais. É o contrário: aproximar cargas umas das outras no interior exige mais trabalho.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: '$U_2 > U_3 > U_1$', porque: r`A bola maciça tem campo em todo o interior; a casca só em parte. $U_3$ é a maior.` },
        { letra: 'b', texto: '$U_1 > U_2 > U_3$', porque: r`Ordem invertida. A condutora não tem campo dentro: é a de **menor** energia.` },
        { letra: 'c', texto: '$U_3 > U_1 > U_2$', porque: r`A casca tem campo entre $r$ e $R$, e a condutora não: $U_2 > U_1$.` },
        { letra: 'd', texto: '$U_1 = U_2 = U_3$', porque: r`Só o campo de fora é igual. Dentro de $R$ as três diferem.` },
        { letra: 'e', texto: '$U_3 > U_2 > U_1$', correta: true, porque: r`Correta: a energia fora é igual; dentro, (3) tem mais campo que (2), e (1) não tem nenhum.` },
        { letra: 'f', texto: '$U_1 > U_3 > U_2$', porque: r`Põe a condutora como a de maior energia, mas ela é a de menor: não tem campo dentro.` },
      ],
    },

    /* ───────────────────────── Discursiva 1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 3.5,
      titulo: 'Anel com metades de cargas opostas',
      resumo: 'Densidade, campo no eixo e o limite de dipolo.',
      enunciado: r`Um anel de raio $R$ está no plano $xy$, centrado na origem. A metade superior ($y > 0$) tem densidade linear constante e carga $Q$; a inferior ($y < 0$), densidade constante e carga $-Q$.

(a) Qual é a densidade linear $\lambda(\varphi)$? (b) Determine o campo $\vec E$ no ponto $P = (0,0,z)$ do eixo $z$, justificando direção e sentido por simetria. (c) Determine a expressão assintótica de $\vec E$ para $z \gg R$ (uma função de $z$, não só o limite nulo) e interprete.`,
      figura: { pagina: 2, recorte: [0.495, 0.28, 0.925, 0.835] },
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', camera: { pos: [16, 9, 18], alvo: [0, 0, 4] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga de cada metade', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 0.5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio do anel', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.08, passo: 0.005 },
        { id: 'zP', rotulo: 'Posição de P no eixo', simbolo: 'z', valor: 0.07, unidade: 'm', min: 0.005, max: 0.13, passo: 0.001 },
      ],
      objetos: [
        { id: 'sup', tipo: 'anelCarga', Q: 'Q', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 180], rotulo: '+Q (y > 0)' },
        { id: 'inf', tipo: 'anelCarga', Q: '0-Q', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [180, 360], rotulo: '−Q (y < 0)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Componente y em P', simbolo: 'E_y', expr: 'y(E(0, 0, zP))', unidade: 'V/m', teoria: '-4*k0*Q*R/(pi*(R^2 + zP^2)^1.5)' },
        { rotulo: 'Componente x em P', simbolo: 'E_x', expr: 'x(E(0, 0, zP))', unidade: 'V/m' },
        { rotulo: 'Componente z em P', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m' },
        { rotulo: 'Aproximação de dipolo', simbolo: r`-\frac{4k_0QR}{\pi z^3}`, expr: '-4*k0*Q*R/(pi*zP^3)', unidade: 'V/m' },
        { rotulo: 'Momento de dipolo', simbolo: 'p', expr: '4*Q*R/pi', unidade: 'C·m' },
        { rotulo: 'Densidade na metade de cima', simbolo: r`\lambda`, expr: 'Q/(pi*R)', unidade: 'C/m' },
      ],
      graficos: [
        {
          titulo: 'E_y no eixo: exato, simulado e dipolo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '0.6*R', ate: '2.6*R', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(E(0, 0, zz))', unidade: 'V/m' },
            { rotulo: 'exato', expr: '-4*k0*Q*R/(pi*(R^2 + zz^2)^1.5)', unidade: 'V/m' },
            { rotulo: 'dipolo', expr: '-4*k0*Q*R/(pi*zz^3)', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Densidade linear',
          texto: r`Cada metade tem comprimento $\pi R$ e carga uniforme:

$$\lambda(\varphi) = \begin{cases} +\dfrac{Q}{\pi R}, & 0 < \varphi < \pi \\[2mm] -\dfrac{Q}{\pi R}, & \pi < \varphi < 2\pi \end{cases}$$`,
          medidas: [5],
        },
        {
          item: 'b',
          titulo: '(b) Simetria: só sobra a componente y',
          previsao: { pergunta: 'Em P, o campo aponta para…', opcoes: ['+ŷ', '−ŷ', '+ẑ', 'é nulo'], correta: 1 },
          texto: r`Junte o elemento $dq$ em $\varphi$ com o $-dq$ em $-\varphi$ (reflexão em $y$). Estão à mesma distância $\sqrt{R^2+z^2}$ de $P$:

- as componentes $z$ se cancelam (cargas opostas, mesma geometria);
- as componentes $x$ se cancelam também;
- as componentes $y$ se **somam**, e apontam de $+Q$ para $-Q$: sentido $-\hat y$.

Medido na cena: $E_x$ e $E_z$ dão zero (só arredondamento).`,
          medidas: [0, 1, 2],
        },
        {
          item: 'b',
          titulo: '(b) A integral',
          texto: r`Só a componente $y$ de cada $d\vec E$ sobrevive, $dE_y = -k_0\,dq\,R\sin\varphi/(R^2+z^2)^{3/2}$ com $dq = \lambda R\,d\varphi$:

$$E_y = -\frac{k_0R^2}{(R^2+z^2)^{3/2}}\left[\int_0^\pi \frac{Q}{\pi R}\sin\varphi\,d\varphi - \int_\pi^{2\pi}\frac{Q}{\pi R}\sin\varphi\,d\varphi\right]$$

$$\vec E(P) = -\frac{4k_0QR}{\pi\,(R^2+z^2)^{3/2}}\,\hat y$$

Arraste $P$ ao longo do eixo e compare com a medida.`,
          medidas: [0],
        },
        {
          item: 'c',
          titulo: '(c) Longe do anel: um dipolo',
          texto: r`Para $z \gg R$, $(R^2+z^2)^{3/2} \approx z^3$:

$$\vec E \approx -\frac{4k_0QR}{\pi z^3}\,\hat y$$

Cai com $1/z^3$, como o campo de um **dipolo** $\vec p = \dfrac{4QR}{\pi}\hat y$ no seu plano mediano ($\vec E = -k_0\vec p/z^3$). A carga total é zero, então não há termo $1/z^2$.`,
          parametros: { zP: 0.13 },
          medidas: [0, 3, 4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de distribuição contínua', lab: 'coulomb' },
          { texto: 'Simetria e cancelamento de componentes' },
          { texto: 'Dipolo elétrico', lab: 'dipolo' },
        ],
        etapas: [
          {
            titulo: '(a) Densidade',
            texto: r`$\lambda = Q/(\pi R)$ na metade de cima e $-Q/(\pi R)$ na de baixo.`,
            passo: 0,
          },
          {
            titulo: '(b) Direção',
            texto: r`O par $dq$ em $\varphi$ e $-dq$ em $-\varphi$ cancela as componentes $x$ e $z$ e soma as componentes $y$, no sentido de $+Q$ para $-Q$: $-\hat y$.`,
            passo: 1,
          },
          {
            titulo: '(b) Integral',
            texto: r`$$\vec E = -\frac{k_0\lambda R^2}{(R^2+z^2)^{3/2}}\cdot 4\,\hat y = -\frac{4k_0QR}{\pi(R^2+z^2)^{3/2}}\,\hat y.$$ O fator 4 vem de $2\int_0^\pi\sin\varphi\,d\varphi$, com as duas metades contribuindo igual.`,
            passo: 2,
          },
          {
            titulo: '(c) Assintótico',
            texto: r`$\vec E \approx -\dfrac{4k_0QR}{\pi z^3}\hat y$: campo de dipolo, com $\vec p = \frac{4QR}{\pi}\hat y$. A carga total é nula, então o termo dominante é o de dipolo.`,
            passo: 3,
          },
        ],
        resultado: r`$\vec E(0,0,z) = -\dfrac{4k_0QR}{\pi(R^2+z^2)^{3/2}}\hat y$; para $z \gg R$, $-\dfrac{4k_0QR}{\pi z^3}\hat y$ (dipolo).`,
        errosComuns: [
          r`Achar que o campo é nulo por a carga total ser zero. Carga total nula só elimina o termo $1/z^2$.`,
          r`Esquecer a componente $y$ e usar o resultado do anel uniforme, que aponta em $\hat z$.`,
          r`Responder (c) só com "tende a zero". O enunciado pede a forma $1/z^3$.`,
        ],
        oficial: { resposta: r`$\lambda = \pm Q/\pi R$; $\vec E = -\dfrac{4k_0QR}{\pi(R^2+z^2)^{3/2}}\hat y$; para $z \gg R$, $\vec E \approx -\dfrac{4k_0QR}{\pi z^3}\hat y$, campo de dipolo.` },
      },
      respostas: [
        { item: 'a', texto: r`$\lambda = +Q/\pi R$ para $0<\varphi<\pi$; $-Q/\pi R$ para $\pi<\varphi<2\pi$`, pontos: 0.5, criterio: 'As duas metades, com sinal e intervalo.' },
        { item: 'b', texto: r`$\vec E = -\dfrac{4k_0QR}{\pi(R^2+z^2)^{3/2}}\,\hat y$`, pontos: 2, criterio: 'Argumento de simetria para x e z, integral da componente y e o sentido.' },
        { item: 'c', texto: r`$\vec E \approx -\dfrac{4k_0QR}{\pi z^3}\,\hat y$: dipolo`, pontos: 1, criterio: r`Expansão para $z \gg R$ e a interpretação como dipolo.` },
      ],
    },

    /* ───────────────────────── Discursiva 2 ───────────────────────── */
    {
      id: 'disc2',
      numero: 'D2',
      secao: 'Discursiva',
      pontos: 3.5,
      titulo: 'Casca espessa com ρ = Cr',
      resumo: 'Carga total, campo nas três regiões e potencial dentro da casca.',
      enunciado: r`Uma casca esférica espessa, de raios interno $a$ e externo $b$, tem densidade volumar $\rho = Cr$, com $C$ constante e $r$ medido a partir do centro $O$.

(a) Qual é a carga total $Q_\text{tot}$? (b) Por simetria e lei de Gauss, determine $\vec E(\vec r)$ para $0 \le r \le a$, $a \le r \le b$ e $b \le r < \infty$. (c) Determine $V(r)$ para $a \le r \le b$, com o potencial nulo em $O$.`,
      figura: [
        { pagina: 2, recorte: [0.495, 0.855, 0.925, 0.89] },
        { pagina: 3, recorte: [0.095, 0.255, 0.505, 0.535] },
        { pagina: 3, recorte: [0.53, 0.255, 0.96, 0.395] },
      ],
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', plano: 'xy', camera: { pos: [6, 8, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Cc', rotulo: 'Constante C', simbolo: 'C', valor: 1e-3, unidade: 'C/m⁴', min: 2e-4, max: 3e-3, passo: 1e-4 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.06, unidade: 'm', min: 0.005, max: 0.13, passo: 0.001 },
      ],
      objetos: [
        { id: 'casca', tipo: 'esfera', centro: [0, 0, 0], raio: 'b', raioInterno: 'a', rho: 'Cc*r', rotulo: 'ρ = Cr' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'gaussiana' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{env}(r)`, expr: "Qenc('G')", unidade: 'C', teoria: Qr('rg') },
        { rotulo: 'Fluxo pela gaussiana', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('G')", unidade: 'V·m', teoria: `${Qr('rg')}/eps0` },
        { rotulo: 'Campo em r', simbolo: 'E(r)', expr: 'mag(E(rg, 0, 0))', unidade: 'V/m', teoria: `${Qr('rg')}/(4*pi*eps0*rg^2)` },
        { rotulo: 'Potencial em r (V(O) = 0)', simbolo: 'V(r)', expr: 'V(rg, 0, 0) - V(0, 0, 0)', unidade: 'V', teoria: Vr('rg') },
        { rotulo: 'Carga total', simbolo: r`Q_\text{tot}`, expr: 'pi*Cc*(b^4 - a^4)', unidade: 'C' },
      ],
      graficos: [
        {
          titulo: 'Campo E(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: 0.14, rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'mag(E(rr, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: `${Qr('rr')}/(4*pi*eps0*rr^2)`, unidade: 'V/m' },
          ],
        },
        {
          titulo: 'Potencial V(r), com V(O) = 0',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: 0.14, rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'V(rr, 0, 0) - V(0, 0, 0)', unidade: 'V' },
            { rotulo: 'analítico', expr: Vr('rr'), unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Carga total',
          texto: r`Integre em cascas finas de volume $4\pi r^2dr$:

$$Q_\text{tot} = \int_a^b Cr\cdot 4\pi r^2\,dr = \pi C\,(b^4 - a^4).$$

Com a gaussiana fora da casca, a carga envolvida é toda a $Q_\text{tot}$.`,
          parametros: { rg: 0.11 },
          medidas: [0, 4],
        },
        {
          item: 'b',
          titulo: '(b) Simetria e r ≤ a',
          texto: r`A distribuição só depende de $r$: $\vec E = E(r)\,\hat r$, e numa gaussiana esférica $\oint\vec E\cdot d\vec A = 4\pi r^2E$.

Na cavidade ($r \le a$) não há carga envolvida: $\vec E = \vec 0$.`,
          parametros: { rg: 0.02 },
          medidas: [0, 2],
        },
        {
          item: 'b',
          titulo: '(b) Dentro da casca, a ≤ r ≤ b',
          previsao: { pergunta: 'Dentro da casca (a < r < b), o campo cresce, diminui ou fica constante com r?', opcoes: ['cresce', 'diminui', 'constante'], correta: 0 },
          texto: r`A carga envolvida é $\pi C(r^4 - a^4)$:

$$4\pi r^2E = \frac{\pi C(r^4-a^4)}{\varepsilon_0}\ \Rightarrow\ \vec E = \frac{C\,(r^4-a^4)}{4\varepsilon_0\,r^2}\,\hat r.$$

Mude o raio da gaussiana e acompanhe fluxo, carga e campo juntos.`,
          parametros: { rg: 0.06 },
          medidas: [0, 1, 2],
        },
        {
          item: 'b',
          titulo: '(b) Fora, r ≥ b',
          texto: r`Toda a carga está dentro:

$$\vec E = \frac{C\,(b^4-a^4)}{4\varepsilon_0\,r^2}\,\hat r = \frac{k_0Q_\text{tot}}{r^2}\,\hat r,$$

o campo de uma carga pontual $Q_\text{tot}$ no centro.`,
          parametros: { rg: 0.11 },
          medidas: [0, 2],
        },
        {
          item: 'c',
          titulo: '(c) Potencial dentro da casca',
          texto: r`Na cavidade $E = 0$, então $V(a) = V(O) = 0$. Daí para fora:

$$V(r) = -\int_a^r \frac{C}{4\varepsilon_0}\left(r'^2 - \frac{a^4}{r'^2}\right)dr' = \frac{C}{12\varepsilon_0}\left(4a^3 - r^3 - \frac{3a^4}{r}\right).$$

É negativo para $C > 0$: o potencial cai ao se afastar da carga positiva.`,
          parametros: { rg: 0.06 },
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
        ],
        etapas: [
          {
            titulo: '(a) Carga total',
            texto: r`$Q_\text{tot} = \int_a^b Cr\,4\pi r^2\,dr = \pi C(b^4 - a^4)$.`,
            passo: 0,
          },
          {
            titulo: '(b) Campo nas três regiões',
            texto: r`Gaussiana esférica de raio $r$, com $\vec E = E(r)\hat r$:
$$\vec E = \begin{cases} \vec 0, & r \le a \\[1mm] \dfrac{C(r^4-a^4)}{4\varepsilon_0r^2}\hat r, & a \le r \le b \\[3mm] \dfrac{C(b^4-a^4)}{4\varepsilon_0r^2}\hat r, & r \ge b \end{cases}$$`,
            passo: 2,
          },
          {
            titulo: '(c) Potencial',
            texto: r`$V$ é constante na cavidade e vale $V(O) = 0$ até $r = a$. Para $a \le r \le b$: $$V(r) = -\int_a^r E\,dr' = \frac{C}{12\varepsilon_0}\left(4a^3 - r^3 - \frac{3a^4}{r}\right).$$`,
            passo: 4,
          },
        ],
        resultado: r`$Q_\text{tot} = \pi C(b^4-a^4)$; $E = 0$, $\frac{C(r^4-a^4)}{4\varepsilon_0r^2}$, $\frac{C(b^4-a^4)}{4\varepsilon_0r^2}$; $V(r) = \frac{C}{12\varepsilon_0}\left(4a^3 - r^3 - \frac{3a^4}{r}\right)$.`,
        errosComuns: [
          r`Usar $Q = \rho\cdot\text{volume}$: a densidade não é uniforme, é preciso integrar.`,
          r`Partir a integral do potencial do infinito. A referência é $V(O) = 0$, e da origem até $a$ o potencial não varia.`,
          r`Esquecer o $-a^4$ na carga envolvida da região intermediária: a carga começa em $r = a$.`,
        ],
        oficial: { resposta: r`$Q_\text{tot} = \pi C(b^4-a^4)$; $\vec E = \vec 0$, $\frac{C(r^4-a^4)}{4\varepsilon_0r^2}\hat r$ e $\frac{C(b^4-a^4)}{4\varepsilon_0r^2}\hat r$; $V(r) = \frac{C}{12\varepsilon_0}\left(4a^3 - r^3 - \frac{3a^4}{r}\right)$.` },
      },
      respostas: [
        { item: 'a', texto: r`$Q_\text{tot} = \pi C(b^4 - a^4)$`, pontos: 0.5, criterio: 'Integral em cascas esféricas.' },
        { item: 'b', texto: r`$\vec 0$; $\dfrac{C(r^4-a^4)}{4\varepsilon_0r^2}\hat r$; $\dfrac{C(b^4-a^4)}{4\varepsilon_0r^2}\hat r$`, pontos: 2, criterio: 'Argumento de simetria, gaussiana e as três regiões.' },
        { item: 'c', texto: r`$V(r) = \dfrac{C}{12\varepsilon_0}\left(4a^3 - r^3 - \dfrac{3a^4}{r}\right)$`, pontos: 1, criterio: r`Usar $V(a) = V(O) = 0$ e integrar o campo de (b).` },
      ],
    },
  ],
}

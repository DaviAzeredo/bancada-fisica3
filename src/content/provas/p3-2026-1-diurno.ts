import type { ObjetoInput, ProvaInput } from '../../scenario/schema'
import { bezier, pol } from './modelos.ts'

const r = String.raw

/** Máscara sem letra: apaga uma anotação à mão do scan. */
const apaga = (x0: number, y0: number, x1: number, y1: number) => ({ area: [x0, y0, x1, y1] as [number, number, number, number], letra: '' })

/* Objetiva 4: esfera condutora neutra e carga externa, pelo método das imagens. */
const a4 = 0.04
const d4 = 0.09
const q1 = `(0-Q0*${a4}/${d4})`
const P = '[x,y,z]'
const Xq = `[${-(a4 * a4) / d4},0,0]`
const Eimagens = `mag(${P}) < ${a4} ? (0-1)*k0*Q0*(${P}-[${-d4},0,0])/mag(${P}-[${-d4},0,0])^3 : k0*${q1}*(${P}-${Xq})/mag(${P}-${Xq})^3 - k0*${q1}*${P}/mag(${P})^3`
const Vimagens = `mag(${P}) < ${a4} ? k0*Q0/${d4} - k0*Q0/mag(${P}-[${-d4},0,0]) : k0*${q1}/mag(${P}-${Xq}) - k0*${q1}/mag(${P})`

const Q: [number, number, number] = [-d4, 0, 0]
const noCond = (g: number) => pol(a4, g)
const linhas: ObjetoInput[] = [
  { id: 'l1', tipo: 'caminho', rotulo: '1', seta: 0.5, pontos: bezier(Q, [-0.07, 0.07, 0], noCond(115)) },
  { id: 'l2', tipo: 'caminho', rotulo: '2', seta: 0.5, pontos: bezier(Q, [-0.065, 0.012, 0], noCond(170)) },
  { id: 'l3', tipo: 'caminho', rotulo: '3', seta: 0.5, pontos: bezier(noCond(-20), [0, 0, 0], noCond(-120)) },
  { id: 'l4', tipo: 'caminho', rotulo: '4', seta: 0.5, pontos: bezier(noCond(-40), [0.04, -0.09, 0], noCond(-90)) },
  { id: 'l5', tipo: 'caminho', rotulo: '5', seta: 0.5, pontos: [noCond(10), pol(0.075, 10), pol(0.11, 10)] },
  { id: 'l6', tipo: 'caminho', rotulo: '6', seta: 0.5, pontos: bezier(noCond(50), [0.09, 0.1, 0], [0.05, 0.075, 0]).concat(bezier([0.05, 0.075, 0], [0.03, 0.11, 0], [0.09, 0.09, 0])) },
]

/* Discursiva 2: o arco AB, fixo, desenhado em trechos. */
const arcoAB = Array.from({ length: 33 }, (_, i) => ['rr*cos(pi*' + i / 32 + ')', 'rr*sin(pi*' + i / 32 + ')', 0] as [string, string, number])
const th = 'min(w*(t + t0), pi)'
const px = `rr*cos(${th})`
const py = `rr*sin(${th})`

export const p3_2026_1_diurno: ProvaInput = {
  id: 'p3-2026-1-diurno',
  titulo: 'P3 · 2026/1 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão A · 06/07/2026',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fio longo com uma volta circular',
      resumo: 'Reta e espira coplanares: os dois campos somam no centro.',
      enunciado: r`Um fio fino, com corrente estacionária $I$, é formado por um trecho retilíneo muito longo e um trecho circular de raio $R$, coplanares. Qual é o módulo do campo magnético no centro do trecho circular?`,
      figura: [
        { pagina: 1, recorte: [0.07, 0.568, 0.495, 0.66] },
        { pagina: 1, recorte: [0.205, 0.672, 0.385, 0.8] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 22], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'esp', tipo: 'espira', I: 'I0', centro: [0, 0, 0], raio: 'R', normal: 'z', rotulo: 'trecho circular' },
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, '0-R', 0], direcao: 'x', rotulo: 'trecho reto' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'centro' },
      ],
      medidas: [
        { rotulo: 'Só a volta circular', simbolo: r`\frac{\mu_0I}{2R}`, expr: "z(Bde('esp', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(2*R)' },
        { rotulo: 'Só o fio reto', simbolo: r`\frac{\mu_0I}{2\pi R}`, expr: "z(Bde('fio', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*R)' },
        { rotulo: 'Campo total', simbolo: 'B', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '(1 + pi)*mu0*I0/(2*pi*R)' },
      ],
      passos: [
        {
          titulo: 'Separar em duas contribuições',
          texto: r`O campo no centro é a soma de dois resultados conhecidos: o de uma **espira** e o de um **fio longo** a uma distância $R$.`,
          destacar: ['esp', 'fio'],
          medidas: [0, 1],
        },
        {
          titulo: 'Conferir os sentidos',
          texto: r`O fio passa por baixo do centro, com a corrente para a direita: a regra da mão direita dá $\vec B$ **saindo da página**. A volta circular é percorrida no sentido anti-horário: também sai da página. Os módulos se **somam**.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Somar',
          texto: r`$$B = \frac{\mu_0I}{2R} + \frac{\mu_0I}{2\pi R} = \frac{(1 + \pi)\mu_0I}{2\pi R}$$
Alternativa **(c)**.`,
          medidas: [2],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{(1 - \pi)\mu_0I}{2\pi R}$`, porque: r`Subtrai as contribuições, como se os sentidos fossem opostos. Aqui os dois campos saem da página.` },
        { letra: 'b', texto: r`$\dfrac{\mu_0I}{2\pi R}\sqrt{1 + \pi^2}$`, porque: r`Soma em quadratura, como se os campos fossem perpendiculares. Eles são paralelos.` },
        { letra: 'c', texto: r`$\dfrac{(1 + \pi)\mu_0I}{2\pi R}$`, correta: true, porque: r`Soma direta de $\mu_0I/2R$ com $\mu_0I/2\pi R$, no mesmo sentido.` },
        { letra: 'd', texto: r`$\dfrac{(1 + \pi)\mu_0I}{2R}$`, porque: r`Usa $2R$ no denominador do total e esquece o $\pi$ do fio reto.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0I}{2\pi R}$`, porque: r`Conta só o fio reto.` },
        { letra: 'f', texto: r`$\dfrac{\mu_0I}{2R}$`, porque: r`Conta só a volta circular.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de uma espira no centro', lab: 'ampere' }, { texto: 'Campo de um fio longo', lab: 'trechos' }, { texto: 'Superposição' }],
        etapas: [
          { titulo: 'Identificar as peças', texto: r`Volta circular completa: $\mu_0I/2R$. Reta longa a uma distância $R$: $\mu_0I/2\pi R$.`, passo: 0 },
          { titulo: 'Sentidos', texto: r`Os dois saem da página: o fio, pela mão direita acima dele; a espira, por ser anti-horária.`, passo: 1 },
          { titulo: 'Soma', texto: r`$B = \dfrac{\mu_0I}{2R}\left(1 + \dfrac1\pi\right) = \dfrac{(1 + \pi)\mu_0I}{2\pi R}$.`, passo: 2 },
        ],
        resultado: r`$B = \dfrac{(1 + \pi)\mu_0I}{2\pi R}$: alternativa (c).`,
        errosComuns: ['Decidir o sinal sem aplicar a mão direita a cada trecho.', 'Confundir $\\mu_0I/2R$ (espira, no centro) com $\\mu_0I/2\\pi R$ (fio, a uma distância $R$).'],
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Próton e elétron andando lado a lado',
      resumo: 'A força elétrica atrai; as correntes opostas se repelem.',
      enunciado: r`Um próton e um elétron se movem ao longo de retas paralelas distintas, com velocidades constantes iguais a $\vec v$ (de módulo muito pequeno). Na figura da prova, o próton vai na reta de cima, o elétron na de baixo, ambos para a direita. A força elétrica entre eles é atrativa ou repulsiva? E a força magnética?`,
      figura: { pagina: 1, recorte: [0.5, 0.672, 0.925, 0.757] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'dd', rotulo: 'Distância entre as retas', simbolo: 'd', valor: 0.04, unidade: 'm', min: 0.01, max: 0.08, passo: 0.002 },
        { id: 'vv', rotulo: 'Velocidade', simbolo: 'v', valor: 3e7, unidade: 'm/s', min: 1e6, max: 1e8, passo: 1e6 },
      ],
      objetos: [
        { id: 'p', tipo: 'carga', q: 'qe', pos: [0, 'dd/2', 0], rotulo: 'próton' },
        { id: 'e', tipo: 'carga', q: '0-qe', pos: [0, '0-dd/2', 0], rotulo: 'elétron' },
        { id: 'vp', tipo: 'seta', papel: 'v', origem: [0, 'dd/2', 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'v' },
        { id: 've', tipo: 'seta', papel: 'v', origem: [0, '0-dd/2', 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'v' },
        { id: 'Fe', tipo: 'seta', papel: 'forca', origem: [0, 'dd/2', 0], vetor: [0, -1, 0], comprimento: '1.6*cm', rotulo: 'F_e' },
        { id: 'Fm', tipo: 'seta', papel: 'forca', origem: [0, 'dd/2', 0], vetor: [0, 1, 0], comprimento: '1.6*cm', rotulo: 'F_m' },
      ],
      medidas: [
        { rotulo: 'Força elétrica no próton, em y', simbolo: r`F_{e,y}`, expr: "y(F('p'))/(k0*qe^2/dd^2)", unidade: '', teoria: '-1' },
        { rotulo: 'Força magnética sobre a elétrica', simbolo: r`F_m/F_e = v^2/c^2`, expr: '(mu0*qe^2*vv^2/(4*pi*dd^2))/(k0*qe^2/dd^2)', unidade: '', teoria: 'mu0*eps0*vv^2' },
      ],
      passos: [
        { titulo: 'Força elétrica', texto: r`Cargas de sinais opostos: **atrativa**. O próton é puxado para baixo.`, destacar: ['Fe'], medidas: [0] },
        {
          titulo: 'Quem faz o papel de corrente',
          texto: r`A corrente de uma carga em movimento segue $q\vec v$. O próton é uma corrente para a direita; o elétron, com a mesma velocidade e carga negativa, é uma corrente para a **esquerda**. Correntes antiparalelas se repelem.`,
          destacar: ['vp', 've'],
        },
        {
          titulo: 'Conferir pela conta',
          texto: r`No próton, o elétron cria $\vec B \propto -e\,\vec v\times\hat r$, com $\hat r = +\hat y$: $\vec B$ aponta para $+\hat z$ com sinal trocado, e $\vec F = e\vec v\times\vec B$ aponta para $+\hat y$. A magnética é **repulsiva**, muito menor que a elétrica ($v \ll c$). Alternativa **(b)**.`,
          destacar: ['Fm'],
          medidas: [1],
        },
      ],
      alternativas: [
        { letra: 'a', texto: 'Repulsiva. Nula.', porque: r`Cargas opostas se atraem, e há força magnética, já que as duas cargas se movem.` },
        { letra: 'b', texto: 'Atrativa. Repulsiva.', correta: true, porque: r`Sinais opostos atraem; correntes antiparalelas repelem.` },
        { letra: 'c', texto: 'Repulsiva. Repulsiva.', porque: r`Erra a força elétrica.` },
        { letra: 'd', texto: 'Atrativa. Atrativa.', porque: r`Trata as duas partículas como correntes paralelas. A carga negativa inverte a corrente.` },
        { letra: 'e', texto: 'Repulsiva. Atrativa.', porque: r`Troca as duas.` },
        { letra: 'f', texto: 'Atrativa. Nula.', porque: r`Velocidade pequena torna a força magnética pequena, não nula.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de uma carga em movimento', lab: 'forcas' }, { texto: 'Correntes paralelas se atraem' }],
        etapas: [
          { titulo: 'Elétrica', texto: r`Sinais opostos: atrativa.`, passo: 0 },
          { titulo: 'Magnética', texto: r`Cada carga é uma corrente $q\vec v$. Com $q$ de sinais opostos e a mesma $\vec v$, as correntes são antiparalelas: repulsiva.`, passo: 1 },
        ],
        resultado: 'Elétrica atrativa e magnética repulsiva: alternativa (b).',
        errosComuns: ['Olhar só para $\\vec v$, que é igual, e esquecer o sinal da carga.', 'Achar que $v$ pequeno anula a força magnética.'],
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Trabalho entre superfícies equipotenciais',
      resumo: 'Só importam o começo e o fim de cada caminho.',
      enunciado: r`A figura mostra uma família de superfícies equipotenciais, com $V_A < V_B < V_C$. Analisando os trabalhos $W_i$ da força elétrica quando uma partícula positiva percorre os caminhos orientados 1, 2, 3, 4 e 5, qual afirmativa é correta? (Os caminhos 1 e 2 começam e terminam em $V_A$; 3 e 4 vão de $V_A$ a $V_B$; 5 vai de $V_C$ a $V_B$.)`,
      figura: [
        { pagina: 2, recorte: [0.1, 0.372, 0.5, 0.475] },
        { pagina: 2, recorte: [0.195, 0.49, 0.4237, 0.685], mascaras: [apaga(0.195, 0.484, 0.236, 0.5232)] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [6, 5, 22], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'q0', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 1e-10, max: 3e-9, passo: 1e-10 },
        { id: 'E0', rotulo: 'Campo', simbolo: 'E', valor: 1000, unidade: 'V/m', min: 200, max: 3000, passo: 100 },
      ],
      objetos: [
        { id: 'Eu', tipo: 'campoE', valor: [0, 'E0', 0], potencial: '0-E0*y', rotulo: 'E' },
        { id: 'tA', tipo: 'rotulo', pos: [0.08, 0.04, 0], texto: 'V_A' },
        { id: 'tB', tipo: 'rotulo', pos: [0.08, 0, 0], texto: 'V_B' },
        { id: 'tC', tipo: 'rotulo', pos: [0.08, -0.04, 0], texto: 'V_C' },
        { id: 'sA', tipo: 'caminho', seta: 0, pontos: [[-0.08, 0.04, 0], [0.07, 0.04, 0]] },
        { id: 'sB', tipo: 'caminho', seta: 0, pontos: [[-0.08, 0, 0], [0.07, 0, 0]] },
        { id: 'sC', tipo: 'caminho', seta: 0, pontos: [[-0.08, -0.04, 0], [0.07, -0.04, 0]] },
        { id: 'c1', tipo: 'caminho', rotulo: '1', pontos: bezier([-0.065, 0.04, 0], [-0.05, 0.08, 0], [-0.035, 0.04, 0]) },
        { id: 'c2', tipo: 'caminho', rotulo: '2', pontos: bezier([-0.065, 0.04, 0], [-0.05, 0.015, 0], [-0.035, 0.04, 0]) },
        { id: 'c3', tipo: 'caminho', rotulo: '3', pontos: bezier([-0.015, 0.04, 0], [-0.01, 0.015, 0], [0.005, 0, 0]) },
        { id: 'c4', tipo: 'caminho', rotulo: '4', pontos: bezier([0.02, 0.04, 0], [0.05, 0.02, 0], [0.025, 0, 0]) },
        { id: 'c5', tipo: 'caminho', rotulo: '5', pontos: bezier([0.045, -0.04, 0], [0.055, -0.02, 0], [0.045, 0, 0]) },
      ],
      visual: { setasE: true, densidade: 9 },
      medidas: [
        { rotulo: 'Trabalho no caminho 1', simbolo: 'W_1', expr: "q0*intE('c1')/(q0*E0*0.04)", unidade: '', teoria: '0' },
        { rotulo: 'Trabalho no caminho 2', simbolo: 'W_2', expr: "q0*intE('c2')/(q0*E0*0.04)", unidade: '', teoria: '0' },
        { rotulo: 'Trabalho no caminho 3', simbolo: 'W_3', expr: "q0*intE('c3')/(q0*E0*0.04)", unidade: '', teoria: '-1' },
        { rotulo: 'Trabalho no caminho 4', simbolo: 'W_4', expr: "q0*intE('c4')/(q0*E0*0.04)", unidade: '', teoria: '-1' },
        { rotulo: 'Trabalho no caminho 5', simbolo: 'W_5', expr: "q0*intE('c5')/(q0*E0*0.04)", unidade: '', teoria: '1' },
      ],
      passos: [
        {
          titulo: 'Só as pontas importam',
          texto: r`A força elétrica é conservativa: $W = q(V_\text{início} - V_\text{fim})$, seja qual for o caminho. Nas medidas, os trabalhos estão em unidades de $q\,\Delta V$ entre duas superfícies vizinhas.`,
        },
        {
          titulo: 'Caminhos 1 e 2',
          texto: r`Começam e terminam em $V_A$: $W_1 = W_2 = 0$.`,
          destacar: ['c1', 'c2'],
          medidas: [0, 1],
        },
        {
          titulo: 'Caminhos 3 e 4',
          texto: r`Saem de $V_A$ e chegam a $V_B$, potencial maior: a carga positiva vai **contra** o campo, e $W_3 = W_4 < 0$.`,
          destacar: ['c3', 'c4'],
          medidas: [2, 3],
        },
        {
          titulo: 'Caminho 5',
          texto: r`Sai de $V_C$ e chega a $V_B$, potencial menor: $W_5 > 0$. Alternativa **(d)**.`,
          destacar: ['c5'],
          medidas: [4],
        },
      ],
      alternativas: [
        { letra: 'a', texto: r`$W_1 = -W_2;\ W_3 = W_4;\ W_5 > 0$`, porque: r`Vale formalmente com os dois nulos, mas (d) é a relação direta: os trabalhos 1 e 2 são iguais, ambos zero, sem troca de sinal.` },
        { letra: 'b', texto: r`$W_1 = W_2;\ W_3 = W_4 > 0;\ W_5 < 0$`, porque: r`Inverte o sinal: uma carga positiva indo para potencial maior recebe trabalho negativo do campo.` },
        { letra: 'c', texto: r`$W_1 < W_2;\ W_3 < W_4;\ W_5 < 0$`, porque: r`Faz o trabalho depender do comprimento do caminho.` },
        { letra: 'd', texto: r`$W_1 = W_2;\ W_3 = W_4;\ W_5 > 0$`, correta: true, porque: r`Trabalho só depende das pontas: 1 e 2 dão zero; 3 e 4 têm as mesmas pontas; 5 desce o potencial.` },
        { letra: 'e', texto: r`$W_1 > W_2;\ W_3 = W_4;\ W_5 = 0$`, porque: r`O caminho 5 cruza superfícies, então $W_5 \neq 0$.` },
        { letra: 'f', texto: r`$W_1 = -W_2;\ W_3 > 0;\ W_4 = W_5 > 0$`, porque: r`Toma $W_4 = W_5$, com pontas diferentes.` },
        { letra: 'g', texto: r`$W_1 > W_2;\ W_3 > W_4;\ W_5 > 0$`, porque: r`Compara os caminhos pelo formato, e não pelas pontas.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Trabalho e diferença de potencial', lab: 'potencial' }, { texto: 'Força conservativa' }],
        etapas: [
          { titulo: 'Fórmula', texto: r`$W = q(V_i - V_f)$, com $q > 0$.`, passo: 0 },
          { titulo: 'Aplicar', texto: r`1 e 2: mesmo potencial, $W = 0$. 3 e 4: de $V_A$ a $V_B$, $W = q(V_A - V_B) < 0$. 5: de $V_C$ a $V_B$, $W = q(V_C - V_B) > 0$.`, passo: 1 },
        ],
        resultado: r`$W_1 = W_2$, $W_3 = W_4$ e $W_5 > 0$: alternativa (d).`,
        errosComuns: ['Pensar que caminho mais longo dá mais trabalho.', 'Inverter o sinal ao usar $V_f - V_i$.'],
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quais linhas não podem ser de campo?',
      resumo: 'Indução num condutor: seis curvas, quatro impossíveis.',
      enunciado: r`A figura ilustra a indução eletrostática, devido à proximidade entre uma partícula de carga positiva $Q$ e um condutor em equilíbrio. Das seis linhas traçadas (todas no plano da figura), qual(is) nitidamente **não** podem representar linhas do campo elétrico?`,
      figura: [
        { pagina: 2, recorte: [0.525, 0.21, 0.915, 0.335] },
        {
          pagina: 2,
          recorte: [0.62, 0.345, 0.835, 0.57],
          mascaras: [
            apaga(0.654, 0.357, 0.707, 0.378),
            apaga(0.698, 0.399, 0.733, 0.414),
            apaga(0.6665, 0.413, 0.6735, 0.424),
            apaga(0.6735, 0.477, 0.6827, 0.488),
            apaga(0.725, 0.4676, 0.7333, 0.4795),
            apaga(0.7686, 0.544, 0.7837, 0.562),
            apaga(0.8063, 0.46, 0.8183, 0.4716),
            apaga(0.7833, 0.367, 0.79, 0.378),
          ],
        },
      ],
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [2, 2, 26], alvo: [0, 0, 0] } },
      parametros: [{ id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 3e-9, unidade: 'C', min: 1e-9, max: 6e-9, passo: 1e-10 }],
      objetos: [
        { id: 'qp', tipo: 'carga', q: 'Q0', pos: [-d4, 0, 0], rotulo: 'Q' },
        { id: 'cond', tipo: 'esfera', Q: 0, centro: [0, 0, 0], raio: a4, raioInterno: a4 * 0.999, rotulo: 'condutor' },
        { id: 'ind', tipo: 'campoE', valor: Eimagens, potencial: Vimagens },
        ...linhas,
      ],
      visual: { linhasE: false, setasE: true, densidade: 13 },
      medidas: [
        { rotulo: 'Campo dentro do condutor', simbolo: 'E', expr: 'mag(E(0.01, 0.01, 0))', unidade: 'V/m', teoria: '0' },
        {
          rotulo: 'Componente tangente na superfície',
          simbolo: r`E_t`,
          expr: `dot(E(${1.001 * a4}*cos(1), ${1.001 * a4}*sin(1), 0), [0-sin(1), cos(1), 0])/mag(E(${1.001 * a4}*cos(1), ${1.001 * a4}*sin(1), 0))`,
          unidade: '',
        },
      ],
      passos: [
        {
          titulo: 'As regras',
          texto: r`Num condutor em equilíbrio: $\vec E = 0$ por dentro, e a superfície é equipotencial, então as linhas chegam e saem **perpendiculares** a ela. Uma linha nunca liga dois pontos de mesmo potencial, nunca se fecha e nunca cruza outra linha ou a si mesma.`,
          medidas: [0, 1],
        },
        { titulo: 'Linha 1', texto: r`Chega à superfície visivelmente inclinada. **Não pode.**`, destacar: ['l1'] },
        { titulo: 'Linhas 2 e 5', texto: r`A 2 sai de $Q$ e chega perpendicular às cargas negativas induzidas; a 5 sai perpendicular de uma região positiva rumo ao infinito. **Podem.**`, destacar: ['l2', 'l5'] },
        { titulo: 'Linhas 3 e 4', texto: r`A 3 corre dentro do metal, onde $\vec E = 0$. A 4 liga dois pontos do mesmo condutor, de mesmo potencial: um trabalho não nulo num percurso sem ddp. **Não podem.**`, destacar: ['l3', 'l4'] },
        { titulo: 'Linha 6', texto: r`Cruza a si mesma, o que daria duas direções de $\vec E$ no mesmo ponto. **Não pode.** Sobram 1, 3, 4 e 6: alternativa **(g)**.`, destacar: ['l6'] },
      ],
      alternativas: [
        { letra: 'a', texto: '1 e 4.', porque: r`Faltam a 3, dentro do metal, e a 6, que se cruza.` },
        { letra: 'b', texto: '6.', porque: r`A 6 não pode, mas não é a única.` },
        { letra: 'c', texto: '2 e 5.', porque: r`São exatamente as duas linhas possíveis.` },
        { letra: 'd', texto: '3, 4 e 6.', porque: r`Esquece a 1, que chega inclinada à superfície.` },
        { letra: 'e', texto: '5 e 6.', porque: r`A 5 sai perpendicular e segue ao infinito: é possível.` },
        { letra: 'f', texto: '3 e 4.', porque: r`Faltam a 1 e a 6.` },
        { letra: 'g', texto: '1, 3, 4 e 6.', correta: true, porque: r`A 1 fura a regra da perpendicular; a 3, $\vec E = 0$ no metal; a 4, a equipotencial; a 6, o cruzamento.` },
        { letra: 'h', texto: '3 e 6.', porque: r`Faltam a 1 e a 4.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Condutor em equilíbrio', lab: 'condutores' }, { texto: 'Propriedades das linhas de campo', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Critérios', texto: r`$\vec E = 0$ no metal; linhas perpendiculares à superfície; sem ligar pontos de mesmo potencial; sem se fechar nem se cruzar.`, passo: 0 },
          { titulo: 'Aplicar', texto: r`Falham: 1 (inclinada), 3 (no metal), 4 (mesmo potencial) e 6 (cruzamento).`, passo: 1 },
        ],
        resultado: '1, 3, 4 e 6 não podem ser linhas de campo: alternativa (g).',
        errosComuns: ['Aceitar a linha 4 porque liga + a −: as cargas estão no mesmo condutor, e aí o potencial é igual.', 'Não notar que a linha 1 chega inclinada.'],
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três afirmativas sobre o magnetismo',
      resumo: 'Monopolos, trabalho da força magnética e o vetor velocidade.',
      enunciado: r`Considere as afirmativas:

(I) Não existem monopolos magnéticos isolados, ou seja, $\oint_S \vec B\cdot\hat n\,dA = 0$.

(II) Uma partícula carregada move-se na presença de um campo elétrico e um campo magnético; nesse caso, a força magnética pode realizar trabalho.

(III) A força magnética sobre uma partícula (pontual) nunca pode alterar o vetor velocidade da partícula.

Qual(is) dessas afirmativas é(são) verdadeira(s)?`,
      cena: { escala: 0.002, extensao: 15, unidade: 'cm', camera: { pos: [24, 22, 30], alvo: [0, 0, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.04, max: 0.2, passo: 0.005 },
        { id: 'E0', rotulo: 'Campo elétrico', simbolo: 'E', valor: 0, unidade: 'V/m', min: 0, max: 8000, passo: 250 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'E', tipo: 'campoE', valor: [0, 'E0', 0], rotulo: 'E' },
        { id: 'p', tipo: 'particula', q: 'qe', m: 'mp', rotulo: 'próton', pos: [0, 0, 0], v: [80000, 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '6*mm', rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'Velocidade, em x', simbolo: 'v_x', expr: "x(vel('p'))", unidade: 'm/s' },
        { rotulo: 'Potência da força magnética', simbolo: r`\vec F_m\cdot\vec v`, expr: "dot(qe*cross(vel('p'), B(pos('p'))), vel('p'))/(qe*B0*80000^2)", unidade: '', teoria: '0' },
      ],
      passos: [
        { titulo: '(I) é verdadeira', texto: r`É a lei de Gauss do magnetismo: o fluxo de $\vec B$ por qualquer superfície fechada é zero, porque não há monopolos.` },
        {
          titulo: '(II) é falsa',
          texto: r`$\vec F_m = q\vec v\times\vec B$ é sempre perpendicular a $\vec v$: a potência $\vec F_m\cdot\vec v$ é nula, mesmo havendo campo elétrico. Quem realiza trabalho é a força elétrica. Aumente $E$ e veja que a medida continua zero.`,
          medidas: [1],
        },
        {
          titulo: '(III) é falsa',
          texto: r`A força magnética não muda a **rapidez**, mas muda a **direção**: o vetor velocidade gira. Veja $v_x$ variar na órbita. Só (I) é verdadeira: alternativa **(f)**.`,
          medidas: [0],
        },
      ],
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`(I) é a lei de Gauss do magnetismo.` },
        { letra: 'b', texto: 'Somente a III.', porque: r`(III) confunde o vetor velocidade com seu módulo.` },
        { letra: 'c', texto: 'Somente a I e a III.', porque: r`(III) é falsa: a órbita circular mostra o vetor mudando.` },
        { letra: 'd', texto: 'Somente a II e a III.', porque: r`Ambas são falsas.` },
        { letra: 'e', texto: 'Somente a I e a II.', porque: r`(II) é falsa: $\vec F_m \perp \vec v$ sempre.` },
        { letra: 'f', texto: 'Somente a I.', correta: true, porque: r`Só a lei de Gauss do magnetismo é verdadeira.` },
        { letra: 'g', texto: 'Somente a II.', porque: r`(II) é a clássica pegadinha: quem faz trabalho é a força elétrica.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`(II) e (III) são falsas.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz', lab: 'lorentz' }, { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' }],
        etapas: [
          { titulo: '(I)', texto: r`$\oint\vec B\cdot d\vec A = 0$: verdadeira.`, passo: 0 },
          { titulo: '(II)', texto: r`$\vec F_m\cdot\vec v = 0$ sempre: a força magnética nunca realiza trabalho. Falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`Ela muda a direção de $\vec v$, logo muda o vetor. Falsa.`, passo: 2 },
        ],
        resultado: 'Somente a I: alternativa (f).',
        errosComuns: ['Ler "vetor velocidade" como "rapidez".', 'Achar que a presença de $\\vec E$ muda a potência da força magnética.'],
      },
    },

    /* ───────────────────────── D1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 3,
      titulo: 'Casca cilíndrica com J = (C/s) ẑ',
      resumo: 'Corrente total, simetria, amperiana e B nas três regiões.',
      enunciado: r`Considere uma casca cilíndrica, condutora, espessa, de raios interno $a$ e externo $b$, muito longa, coaxial com o eixo $Z$. Nela existe uma densidade de corrente $\vec J = (C/s)\,\hat z$, com $s$ a coordenada radial cilíndrica e $C$ constante positiva.

(a) Determine a corrente total $I_\text{tot}$ que passa através de uma seção reta da casca. [0,5]

(b) Argumente, por simetria e/ou pela lei de Gauss do magnetismo e/ou pela lei de Biot-Savart, qual(is) é(são) a(s) única(s) componente(s) não nula(s) de $\vec B(s, \varphi, z) = B_s\hat s + B_\varphi\hat\varphi + B_z\hat z$, e sobre a dependência dessa(s) componente(s) com $s$, $\varphi$ e $z$. [0,7]

(c) Baseado no item anterior, escolha uma curva ampèriana $C$ conveniente, descrevendo-a cuidadosamente, e calcule a circulação de $\vec B$ ao longo dela. [0,6]

(d) Determine o vetor campo magnético nas regiões: (I) $0 \le s \le a$, (II) $a \le s \le b$ e (III) $b \le s < \infty$. [1,2]`,
      figura: [
        { pagina: 3, recorte: [0.085, 0.655, 0.495, 0.897] },
        { pagina: 3, recorte: [0.515, 0.205, 0.9, 0.43] },
        { pagina: 3, recorte: [0.63, 0.44, 0.79, 0.57] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 21], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Cc', rotulo: 'Constante', simbolo: 'C', valor: 500, unidade: 'A/m', min: 100, max: 1500, passo: 50 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.025, unidade: 'm', min: 0.01, max: 0.035, passo: 0.001 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.05, unidade: 'm', min: 0.04, max: 0.07, passo: 0.001 },
        { id: 'rs', rotulo: 'Raio da amperiana', simbolo: 's', valor: 0.04, unidade: 'm', min: 0.005, max: 0.085, passo: 0.001 },
      ],
      objetos: [
        { id: 'cas', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'b', raioInterno: 'a', J: 'Cc/r', rotulo: 'J = C/s' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13 },
      medidas: [
        { rotulo: 'Corrente total', simbolo: r`I_\text{tot} = 2\pi C(b-a)`, expr: "Ienc('Amp') + 2*pi*Cc*(b - min(max(rs, a), b))", unidade: 'A', teoria: '2*pi*Cc*(b-a)' },
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{enc}(s)`, expr: "Ienc('Amp')", unidade: 'A', teoria: '2*pi*Cc*(min(max(rs, a), b) - a)' },
        { rotulo: 'Circulação', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: '2*pi*rs*y(B(rs, 0, 0))' },
        { rotulo: 'Campo em s', simbolo: r`B_\varphi(s)`, expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: 'mu0*Cc*(min(max(rs, a), b) - a)/rs' },
      ],
      graficos: [
        {
          titulo: 'Campo B(s) nas três regiões',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.002, ate: 0.085, rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulação', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: 'mu0*Cc*(min(max(ss, a), b) - a)/ss', unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: '(a) Corrente total',
          texto: r`$$I_\text{tot} = \int_a^b\frac{C}{s}\,2\pi s\,ds = 2\pi C(b - a)$$
O $s$ da densidade cancela o $s$ do elemento de área.`,
          parametros: { rs: 0.06 },
          medidas: [0, 1],
        },
        {
          titulo: '(b) Simetria',
          texto: r`O sistema é invariante por rotações em torno de $Z$ e por translações ao longo dele, então nada depende de $\varphi$ nem de $z$. Pela lei de Gauss do magnetismo num cilindro coaxial, $B_s = 0$. Por Biot-Savart, $d\vec\ell \parallel \hat z$ e $d\vec B \perp \hat z$, logo $B_z = 0$. Sobra $\vec B = B(s)\hat\varphi$.`,
          parametros: { rs: 0.04 },
        },
        {
          titulo: '(c) Amperiana',
          texto: r`Circunferência de raio $s$, coaxial com $Z$, num plano perpendicular a ele, orientada no sentido de $\hat\varphi$: $\vec B$ é tangente e constante sobre ela.
$$\Gamma = \oint\vec B\cdot d\vec\ell = 2\pi s\,B(s)$$`,
          medidas: [2],
        },
        {
          titulo: '(d) Região I',
          texto: r`Para $s \le a$, a amperiana não envolve corrente: $\vec B = \vec 0$.`,
          parametros: { rs: 0.015 },
          medidas: [1, 3],
        },
        {
          titulo: '(d) Região II',
          texto: r`Para $a \le s \le b$: $I_\text{enc} = 2\pi C(s - a)$, e então
$$\vec B = \frac{\mu_0C(s - a)}{s}\hat\varphi$$`,
          parametros: { rs: 0.04 },
          medidas: [1, 3],
        },
        {
          titulo: '(d) Região III',
          texto: r`Para $s \ge b$, toda a corrente está dentro:
$$\vec B = \frac{\mu_0C(b - a)}{s}\hat\varphi$$
O gráfico é contínuo em $s = a$ e em $s = b$, como tem de ser sem corrente superficial.`,
          parametros: { rs: 0.07 },
          medidas: [1, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$I_\text{tot} = 2\pi C(b - a)$.`, pontos: 0.5 },
        { item: '(b)', texto: r`$\vec B = B(s)\,\hat\varphi$: só componente azimutal, dependendo só de $s$.`, pontos: 0.7 },
        { item: '(c)', texto: r`Circunferência coaxial de raio $s$: $\Gamma = 2\pi s\,B(s)$.`, pontos: 0.6 },
        { item: '(d)', texto: r`(I) $\vec 0$; (II) $\mu_0C(s - a)\hat\varphi/s$; (III) $\mu_0C(b - a)\hat\varphi/s$.`, pontos: 1.2 },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com J(s)', lab: 'ampereJ' }, { texto: 'Argumentos de simetria' }],
        etapas: [
          { titulo: 'Corrente', texto: r`Integre $\vec J\cdot d\vec A$ em anéis: $dA = 2\pi s\,ds$.`, passo: 0 },
          { titulo: 'Simetria', texto: r`Elimine $B_s$ (Gauss do magnetismo) e $B_z$ (Biot-Savart); a dependência só em $s$ vem das simetrias de rotação e translação.`, passo: 1 },
          { titulo: 'Ampère', texto: r`$2\pi s\,B = \mu_0I_\text{enc}(s)$, região por região.`, passo: 2 },
        ],
        resultado: r`$\vec B = \vec 0$ para $s \le a$; $\mu_0C(s - a)\hat\varphi/s$ em $a \le s \le b$; $\mu_0C(b - a)\hat\varphi/s$ para $s \ge b$.`,
        errosComuns: ['Usar $J$ vezes a área total, como se $J$ fosse uniforme.', 'Pular a justificativa de simetria: ela vale pontos separados.', 'Esquecer o vetor na resposta: o item pede $\\vec B$.'],
      },
    },

    /* ───────────────────────── D2 ───────────────────────── */
    {
      id: 'disc2',
      numero: 'D2',
      secao: 'Discursiva',
      pontos: 2,
      titulo: 'Raio que gira num setor circular',
      resumo: 'A área cresce, a fem é constante, mas a resistência aumenta.',
      enunciado: r`Um fio condutor fino, de seção reta uniforme de área $S$, é constituído por três segmentos: um arco circular $\mathcal{AB}$, fixo, de raio $r$; um segmento retilíneo $\mathcal{OA}$, fixo, de comprimento $r$; e um segmento retilíneo $\mathcal{OP}$, também de comprimento $r$, livre para girar em torno de $\mathcal{O}$. A resistividade do fio é $\rho$. O arranjo está em um campo magnético constante $\vec B = B\hat z$ ($B > 0$), para fora do plano da figura. Em $t = 0$, $\mathcal{OP}$ está em $\theta = 0$ e gira com velocidade angular constante $\omega$, no sentido anti-horário. Considere $0 < \theta < \pi$.

(a) Determine o fluxo do campo magnético através do setor circular $\mathcal{OAP}$. [0,8]

(b) Determine o módulo da corrente induzida ao longo do circuito $\mathcal{OAP}$, assim como o seu sentido (horário ou anti-horário). [1,2]`,
      figura: [
        { pagina: 3, recorte: [0.505, 0.6, 0.9, 0.9] },
        { pagina: 4, recorte: [0.11, 0.21, 0.505, 0.305] },
        { pagina: 4, recorte: [0.635, 0.21, 0.815, 0.4] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 2, 18], alvo: [0, 2, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 3 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'rr', rotulo: 'Raio', simbolo: 'r', valor: 0.06, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
        { id: 'w', rotulo: 'Velocidade angular', simbolo: r`\omega`, valor: 1, unidade: 'rad/s', min: 0.3, max: 1.05, passo: 0.05 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1e-8, max: 1e-7, passo: 1e-9 },
        { id: 'Sf', rotulo: 'Seção do fio', simbolo: 'S', valor: 1e-6, unidade: 'm²', min: 1e-7, max: 5e-6, passo: 1e-7 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0.4, unidade: 's', min: 0.1, max: 1, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'arc', tipo: 'caminho', seta: 0, pontos: arcoAB, rotulo: 'arco' },
        { id: 'oa', tipo: 'caminho', seta: 0, pontos: [[0, 0, 0], ['rr', 0, 0]] },
        { id: 'op', tipo: 'caminho', seta: 0.7, pontos: [[0, 0, 0], [px, py, 0]], rotulo: 'OP' },
        { id: 'tO', tipo: 'rotulo', pos: [0, -0.008, 0], texto: 'O' },
        { id: 'tA', tipo: 'rotulo', pos: ['rr', -0.008, 0], texto: 'A' },
        {
          id: 'S',
          tipo: 'espiraSensora',
          centro: [0, 0, 0],
          normal: 'z',
          raio: `rr*sqrt(max(${th}, 1e-6)/(2*pi))`,
          R: `rho*rr*(2 + ${th})/Sf`,
          oculta: true,
        },
      ],
      visual: { setasB: true, densidade: 9 },
      medidas: [
        { rotulo: 'Fluxo pelo setor', simbolo: r`\Phi_B = \tfrac12 Br^2\omega t`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*rr^2*(${th})/2` },
        { rotulo: 'fem induzida', simbolo: r`\varepsilon = -\tfrac12 Br^2\omega`, expr: "fem('S')", unidade: 'V', teoria: 'w*(t + t0) < pi ? 0 - B0*rr^2*w/2 : 0' },
        { rotulo: 'Resistência do circuito', simbolo: r`R = \rho r(2 + \omega t)/S`, expr: `rho*rr*(2 + ${th})/Sf`, unidade: 'Ω' },
        { rotulo: 'Corrente induzida', simbolo: r`|I| = \frac{Br\omega S}{2\rho(2 + \omega t)}`, expr: "abs(Iind('S'))", unidade: 'A', teoria: `w*(t + t0) < pi ? B0*rr*w*Sf/(2*rho*(2 + ${th})) : 0` },
      ],
      graficos: [
        {
          titulo: 'Corrente em função do tempo',
          tipo: 'tempo',
          janela: 3,
          series: [{ rotulo: '|I|', expr: "abs(Iind('S'))", unidade: 'A' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Área do setor',
          texto: r`O campo é uniforme e paralelo a $\hat n = \hat z$: $\Phi = BA$. A área do setor é a fração $\theta/2\pi$ do círculo:
$$A = \frac{\theta}{2\pi}\pi r^2 = \frac{\theta r^2}{2}\quad\Rightarrow\quad \Phi_B(t) = \frac{Br^2\omega t}{2}$$`,
          medidas: [0],
        },
        {
          titulo: '(b) fem',
          texto: r`$$|\varepsilon| = \left|\frac{d\Phi_B}{dt}\right| = \frac{Br^2\omega}{2}$$
Constante: a área cresce a uma taxa fixa.`,
          medidas: [1],
        },
        {
          titulo: '(b) Resistência',
          texto: r`Aqui está a pegadinha: o circuito cresce. Seu comprimento é $r + r + r\theta$, então
$$R = \frac{\rho L}{S} = \frac{\rho r(2 + \omega t)}{S}$$`,
          medidas: [2],
        },
        {
          titulo: '(b) Corrente e sentido',
          texto: r`$$|I| = \frac{|\varepsilon|}{R} = \frac{Br\omega S}{2\rho(2 + \omega t)}$$
O fluxo para fora **cresce**, então a corrente cria campo para dentro (Lenz): sentido **horário**.`,
          medidas: [3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\Phi_B = \dfrac{Br^2\omega t}{2}$.`, pontos: 0.8 },
        { item: '(b)', texto: r`$|I| = \dfrac{Br\omega S}{2\rho(2 + \omega t)}$, no sentido horário.`, pontos: 1.2 },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday com área variável', lab: 'movimento' }, { texto: 'Resistência de um fio', lab: 'corrente' }, { texto: 'Lei de Lenz' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`$\Phi = B\theta r^2/2$, com $\theta = \omega t$.`, passo: 0 },
          { titulo: 'fem', texto: r`$|\varepsilon| = Br^2\omega/2$.`, passo: 1 },
          { titulo: 'Resistência', texto: r`$L = r(2 + \omega t)$, portanto $R = \rho r(2 + \omega t)/S$.`, passo: 2 },
          { titulo: 'Corrente', texto: r`$|I| = |\varepsilon|/R$; Lenz dá o sentido horário.`, passo: 3 },
        ],
        resultado: r`$\Phi_B = Br^2\omega t/2$ e $|I| = Br\omega S/[2\rho(2 + \omega t)]$, no sentido horário.`,
        errosComuns: ['Tratar $R$ como constante: o arco percorrido aumenta.', 'Esquecer o sentido da corrente: ele vale parte do item.'],
      },
    },
  ],
}

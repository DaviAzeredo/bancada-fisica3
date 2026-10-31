import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: quarto de disco em 16 arcos; cada um leva a carga exata da sua coroa. */
const N = 16
const arcos: ObjetoInput[] = Array.from({ length: N }, (_, i) => {
  const f0 = i / N
  const f1 = (i + 1) / N
  return {
    id: `q${i}`,
    tipo: 'anelCarga' as const,
    Q: `sig*pi/4*a^2*${f1 ** 2 - f0 ** 2}`,
    centro: [0, 0, 0],
    raio: `${(f0 + f1) / 2}*a`,
    normal: 'z',
    arco: [0, 90],
  }
})
const Qquarto = arcos.map((c) => `carga('${c.id}')`).join(' + ')

/**
 * Objetiva 3: espiral de uma partícula com arrasto linear em B uniforme.
 * De dw/dt = −(γ + iΩ)w, com g = γ/|Ω|, θ = |Ω|t e raio inicial R₀ = v/|Ω|:
 * x = R₀/(1+g²)·[g(1 − e·cos θ) + e·sin θ], y = σR₀/(1+g²)·[g·e·sin θ − (1 − e·cos θ)],
 * com e = exp(−gθ) e σ o sinal de Ω. O integrador da cena não tem arrasto.
 */
const espiral = (R0: string, sinal: number): [string, string, number][] =>
  Array.from({ length: 141 }, (_, i) => {
    const th = (i * 8 * Math.PI) / 140
    const e = `exp(-g*${th})`
    const c = Math.cos(th)
    const s = Math.sin(th)
    return [
      `(${R0})/(1 + g^2)*(g*(1 - ${e}*${c}) + ${e}*${s})`,
      `${sinal}*(${R0})/(1 + g^2)*(g*${e}*${s} - (1 - ${e}*${c}))`,
      0,
    ]
  })

/* Objetiva 4 */
const Pot = (R: string) => `fem^2*(${R})/((${R}) + ri)^2`

/**
 * P2 de Física III, 2025/1, diurno, versão W (02/06/2025). Conferida com o
 * gabarito oficial: objetivas 1f, 2d, 3c, 4e, 5b, 6a, e a discursiva. Os itens
 * da discursiva têm respostas à mão no scan e ficam só no enunciado digitado.
 */
export const p2_2025_1_diurno: ProvaInput = {
  id: 'p2-2025-1-diurno',
  titulo: 'P2 · 2025/1 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão W · 02/06/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Potencial na ponta de um quarto de disco',
      resumo: 'Densidade uniforme; o ponto é o centro do disco original.',
      enunciado: r`Um corpo sólido, de espessura desprezível, é formado por um quarto de disco de raio $a$. O corpo está sobre o plano $xy$ e possui densidade superficial de carga $\sigma$ constante. Determine o potencial eletrostático gerado pelo corpo na origem do sistema de coordenadas, considerando o potencial nulo no infinito.`,
      figura: [
        { pagina: 1, recorte: [0.1, 0.53, 0.91, 0.675] },
        { pagina: 1, recorte: [0.49, 0.69, 0.75, 0.85] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 18], alvo: [3, 3, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 2e-8, unidade: 'C/m²', min: 5e-9, max: 5e-8, passo: 1e-9 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.06, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
      ],
      objetos: [...arcos, { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' }],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy', planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial na origem (soma dos arcos)', simbolo: 'V(O)', expr: 'V(0, 0, 0)', unidade: 'V', teoria: 'a*sig/(8*eps0)' },
        { rotulo: 'Carga total', simbolo: 'Q', expr: Qquarto, unidade: 'C', teoria: 'sig*pi*a^2/4' },
      ],
      passos: [
        {
          titulo: 'Fatiar em arcos',
          texto: r`Todos os pontos de um arco de raio $s$ estão à mesma distância da origem. Sua carga é

$$dq = \sigma\cdot\frac{\pi s}{2}\,ds.$$

A cena tem 16 arcos, cada um com a carga exata da sua coroa.`,
          medidas: [1],
        },
        {
          titulo: 'Somar os potenciais',
          previsao: { pergunta: 'Cada arco contribui para V(O)…', opcoes: ['com a mesma quantia, para ds fixo', 'mais quanto mais longe', 'mais quanto mais perto'], correta: 0 },
          texto: r`O $s$ da carga cancela com o $1/s$ do potencial:

$$V = \int_0^a\frac{1}{4\pi\varepsilon_0}\frac{\sigma\pi s\,ds}{2s} = \frac{\sigma}{8\varepsilon_0}\int_0^ads = \frac{a\sigma}{8\varepsilon_0}.$$`,
          medidas: [0],
        },
        {
          titulo: 'Conferir pelo disco inteiro',
          texto: r`O disco inteiro dá $\sigma a/2\varepsilon_0$ no centro. O potencial é escalar: quatro quartos iguais somam o disco, então cada um contribui com um quarto. Alternativa **(f)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial de distribuição contínua', lab: 'potencial' }],
        etapas: [
          { titulo: 'Elemento', texto: r`$dq = \sigma(\pi s/2)ds$ a uma distância $s$ de $O$.`, passo: 0 },
          { titulo: 'Integral', texto: r`$V = \dfrac{\sigma}{8\varepsilon_0}\displaystyle\int_0^ads = \dfrac{a\sigma}{8\varepsilon_0}$.`, passo: 1 },
        ],
        resultado: r`$V = \dfrac{a\sigma}{8\varepsilon_0}$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar a expressão do campo: o potencial é escalar, e aqui não há componentes a separar.`,
          r`Esquecer o quarto: o arco tem comprimento $\pi s/2$, não $2\pi s$.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$a\sigma/(2\pi\varepsilon_0)$`, porque: r`Sobra um $\pi$: ele cancela com o do comprimento do arco.` },
        { letra: 'b', texto: r`$a\sigma/(2\varepsilon_0)$`, porque: r`É o disco **inteiro**.` },
        { letra: 'c', texto: r`$a\sigma/(4\pi\varepsilon_0)$`, porque: r`Sobra um $\pi$ e usa meio disco.` },
        { letra: 'd', texto: r`$a\sigma/(4\varepsilon_0)$`, porque: r`É o **meio** disco.` },
        { letra: 'e', texto: r`$a\sigma/(8\pi\varepsilon_0)$`, porque: r`Sobra um $\pi$ que deveria cancelar.` },
        { letra: 'f', texto: r`$a\sigma/(8\varepsilon_0)$`, correta: true, porque: r`Correta: um quarto do valor do disco inteiro.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Dobrar a carga de um capacitor',
      resumo: 'A capacitância não muda; a energia, sim.',
      enunciado: r`Um capacitor de capacitância $C_0$ armazena cargas $Q_0 > 0$ e $-Q_0$ em suas placas, com energia eletrostática $U_0$. Em seguida, ele é carregado e passa a armazenar $2Q_0$. Nessa última situação, a capacitância $C$ e a energia $U$ são iguais a:`,
      figura: { pagina: 2, recorte: [0.06, 0.125, 0.93, 0.27] },
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [26, 20, 74], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'fQ',
          rotulo: 'Carga',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Q₀ (antes)' },
            { valor: 2, rotulo: '2Q₀ (depois)' },
          ],
        },
        { id: 'Q0', rotulo: 'Carga inicial', simbolo: 'Q_0', valor: 1e-9, unidade: 'C', min: 2e-10, max: 2e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [{ id: 'cap', tipo: 'capacitor', rotulo: 'Capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'd', Q: 'fQ*Q0' }],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância', simbolo: 'C', expr: "C('cap')", unidade: 'F', teoria: 'eps0*lado^2/d' },
        { rotulo: 'ddp', simbolo: 'V', expr: 'V(-d/2, 0, 0) - V(d/2, 0, 0)', unidade: 'V', teoria: 'fQ*Q0*d/(eps0*lado^2)' },
        { rotulo: 'Energia', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: '(fQ*Q0)^2*d/(2*eps0*lado^2)' },
      ],
      passos: [
        {
          titulo: 'C é geometria',
          previsao: { pergunta: 'Dobrando a carga, a capacitância…', opcoes: ['dobra', 'não muda', 'cai à metade'], correta: 1 },
          texto: r`$C = Q/V$ parece depender da carga, mas não: dobrando $Q$, a ddp também dobra. A capacitância depende só da forma e do meio:

$$C = \frac{\varepsilon_0A}{d}.$$`,
          parametros: { fQ: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'Energia cresce com o quadrado',
          texto: r`$$U = \frac{Q^2}{2C} \quad\Rightarrow\quad U = \frac{(2Q_0)^2}{2C_0} = 4U_0.$$

Faz sentido: a carga e a ddp dobraram, e $U = QV/2$.`,
          parametros: { fQ: 2 },
          medidas: [2],
        },
        {
          titulo: 'Resposta',
          texto: r`$C = C_0$ e $U = 4U_0$: alternativa **(d)**.`,
          parametros: { fQ: 2 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitância e energia', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Capacitância', texto: r`Depende só da geometria: $C = C_0$.`, passo: 0 },
          { titulo: 'Energia', texto: r`$U = Q^2/2C$: dobrar $Q$ multiplica $U$ por 4.`, passo: 1 },
        ],
        resultado: r`$C = C_0$ e $U = 4U_0$: alternativa **(d)**.`,
        errosComuns: [
          r`Ler $C = Q/V$ como se $C$ crescesse com $Q$. A ddp cresce junto.`,
          r`Achar que $U$ dobra: ela vai com $Q^2$.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$C = 2C_0$ e $U = 4U_0$`, porque: r`$C$ não muda; só a energia está certa.` },
        { letra: 'b', texto: r`$C = 2C_0$ e $U = 2U_0$`, porque: r`Trata $C$ como proporcional a $Q$.` },
        { letra: 'c', texto: r`$C = 2C_0$ e $U = U_0/2$`, porque: r`Usa $U = Q_0^2/2C$ com a carga antiga e $C$ errado.` },
        { letra: 'd', texto: r`$C = C_0$ e $U = 4U_0$`, correta: true, porque: r`Correta: geometria igual e $U \propto Q^2$.` },
        { letra: 'e', texto: r`$C = C_0$ e $U = U_0/2$`, porque: r`A energia aumenta, não diminui.` },
        { letra: 'f', texto: r`$C = C_0$ e $U = U_0$`, porque: r`A energia depende da carga.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Espirais numa câmara de bolhas',
      resumo: 'O que se pode concluir do formato das trajetórias.',
      enunciado: r`A figura mostra as trajetórias de duas partículas, de cargas $q_1, q_2$ e massas $m_1, m_2$, que entram numa câmara de bolhas (meio fluido) com velocidades de módulos $v_1$ e $v_2$. Atua na região um campo magnético constante $\vec B$, saindo do plano da figura. Afirmações: (I) Pelos comprimentos diferentes das duas trajetórias espirais, sempre temos $m_2 > m_1$; (II) As trajetórias apresentam a forma espiral em razão das perdas de energia com o meio fluido; e (III) Se tivéssemos $q_1/m_1 = -q_2/m_2$, as duas espirais seriam sempre iguais, apenas verticalmente invertidas. A(s) afirmação(ões) correta(s) é(são):`,
      figura: { pagina: 3, recorte: [0.1, 0.03, 0.925, 0.55] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'g', rotulo: 'Perda de energia', simbolo: 'g', valor: 0.07, min: 0.001, max: 0.2, passo: 0.001 },
        { id: 'R1', rotulo: 'Raio inicial da partícula 1', simbolo: 'R_1', valor: 0.025, unidade: 'm', min: 0.025, max: 0.025 },
        { id: 'rm', rotulo: 'Razão m₂/m₁', simbolo: 'm_2/m_1', valor: 1, min: 0.5, max: 4, passo: 0.1 },
        { id: 'rv', rotulo: 'Razão v₂/v₁', simbolo: 'v_2/v_1', valor: 1.5, min: 0.5, max: 2, passo: 0.1 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 0.1], rotulo: 'B' },
        { id: 'entrada', tipo: 'caminho', pontos: [[-0.08, 0, 0], [0, 0, 0]], seta: 0.5 },
        { id: 's1', tipo: 'caminho', pontos: espiral('R1', -1), seta: 0.04, rotulo: '1' },
        { id: 's2', tipo: 'caminho', pontos: espiral('R1*rm*rv', 1), seta: 0.04, rotulo: '2' },
      ],
      visual: { setasB: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Raio inicial da partícula 2', simbolo: 'R_2', expr: 'R1*rm*rv', unidade: 'm' },
        { rotulo: 'Razão R₂/R₁ medida na curva', simbolo: 'R_2/R_1', expr: 'R1*rm*rv/R1', teoria: 'rm*rv' },
        { rotulo: 'Energia restante depois de uma volta', simbolo: 'K/K_0', expr: 'exp(-2*g*2*pi)', unidade: '' },
      ],
      passos: [
        {
          titulo: 'O raio depende de mais coisas que a massa',
          texto: r`De $qvB = mv^2/R$:

$$R = \frac{mv}{|q|B}.$$

O tamanho da espiral mede o **momento** dividido pela carga. Com carga e velocidade desconhecidas, ele não diz qual massa é maior.`,
          medidas: [0],
        },
        {
          titulo: '(I) Massas iguais, espirais diferentes',
          previsao: { pergunta: 'Com m₂ = m₁, as espirais podem ter tamanhos diferentes?', opcoes: ['Sim', 'Não'], correta: 0 },
          texto: r`Aqui $m_2 = m_1$, mas $v_2 = 1{,}5\,v_1$: a espiral 2 é maior. A massa não é a única causa. **Falsa.**`,
          parametros: { rm: 1, rv: 1.5 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Por que é espiral',
          texto: r`Sem meio, a força magnética não muda a rapidez: seria um círculo. Reduza $g$ quase a zero e veja a espiral se fechar num círculo.

Com o meio, a partícula perde energia, $v$ diminui, e o raio $R = mv/|q|B$ encolhe. **Verdadeira.**`,
          parametros: { g: 0.003 },
        },
        {
          titulo: '(III) Mesma q/m não basta',
          texto: r`O período depende de $q/m$, mas o raio depende também de $v$. Com $q/m$ opostos e velocidades diferentes, as espirais não são iguais. **Falsa.**

Coloque $v_2 = v_1$ e veja o espelho exato: isso exige a condição adicional.`,
          parametros: { rm: 1, rv: 1 },
        },
        {
          titulo: 'Resposta',
          texto: r`Apenas a (II): alternativa **(c)**.`,
          parametros: { rm: 1, rv: 1.5 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Movimento em campo magnético', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`$R = mv/|q|B$: o tamanho depende de $m$, $v$ e $q$. Falsa.`, passo: 1 },
          { titulo: '(II)', texto: r`A força magnética não muda a rapidez; o que encolhe o raio é a perda de energia para o meio. Verdadeira.`, passo: 2 },
          { titulo: '(III)', texto: r`Com $q/m$ opostos e $v$ diferentes, os raios diferem. Falsa.`, passo: 3 },
        ],
        resultado: r`Apenas a (II): alternativa **(c)**.`,
        errosComuns: [
          r`Associar raio maior a massa maior sem olhar $v$ e $q$.`,
          r`Atribuir a espiral à força magnética, que não realiza trabalho.`,
        ],
        oficial: { resposta: '(c)', observacao: r`As curvas da cena vêm da solução fechada com arrasto linear, $\dot w = -(\gamma + i\Omega)w$. O integrador da bancada não tem arrasto.` },
      },
      alternativas: [
        { letra: 'a', texto: 'nenhuma delas.', porque: r`A (II) é verdadeira.` },
        { letra: 'b', texto: 'apenas a I.', porque: r`O raio também depende de $v$ e de $q$.` },
        { letra: 'c', texto: 'apenas a II.', correta: true, porque: r`Correta: só a perda de energia explica a espiral.` },
        { letra: 'd', texto: 'apenas a III.', porque: r`Falta a condição $v_1 = v_2$.` },
        { letra: 'e', texto: 'apenas a I e a II.', porque: r`A (I) é falsa.` },
        { letra: 'f', texto: 'apenas a I e a III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'apenas a II e a III.', porque: r`A (III) é falsa.` },
        { letra: 'h', texto: 'todas elas.', porque: r`Só a (II) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Dois resistores, a mesma potência',
      resumo: 'Bateria com resistência interna e 100 W no resistor externo.',
      enunciado: r`Um resistor ôhmico (externo) possui resistência variável $R$ e está conectado a uma bateria de $40\,\text{V}$ que possui resistência ôhmica interna, fixa, de $3\,\Omega$. Determine os dois valores possíveis de $R$ para os quais a potência dissipada no resistor externo seja $100\,\text{W}$.`,
      figura: { pagina: 4, recorte: [0.06, 0.03, 0.9, 0.12] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'Rr',
          rotulo: 'Resistência externa',
          simbolo: 'R',
          valor: 1,
          unidade: 'Ω',
          opcoes: [
            { valor: 1, rotulo: 'R = 1 Ω' },
            { valor: 3, rotulo: 'R = 3 Ω' },
            { valor: 9, rotulo: 'R = 9 Ω' },
          ],
        },
        { id: 'fem', rotulo: 'Fem', simbolo: r`\mathcal E`, valor: 40, unidade: 'V', min: 40, max: 40 },
        { id: 'ri', rotulo: 'Resistência interna', simbolo: 'r', valor: 3, unidade: 'Ω', min: 3, max: 3 },
      ],
      objetos: [
        { id: 'res', tipo: 'condutor', a: [-0.02, 0.04, 0], b: [0.02, 0.04, 0], raio: 0.004, I: 'fem/(Rr + ri)' },
        { id: 'bat', tipo: 'condutor', a: [-0.03, -0.04, 0], b: [-0.005, -0.04, 0], raio: 0.006, I: 'fem/(Rr + ri)' },
        { id: 'int', tipo: 'condutor', a: [0.005, -0.04, 0], b: [0.03, -0.04, 0], raio: 0.003, I: 'fem/(Rr + ri)' },
        { id: 'w1', tipo: 'caminho', pontos: [[-0.03, -0.04, 0], [-0.06, -0.04, 0], [-0.06, 0.04, 0], [-0.02, 0.04, 0]], seta: 0.5 },
        { id: 'w2', tipo: 'caminho', pontos: [[0.02, 0.04, 0], [0.06, 0.04, 0], [0.06, -0.04, 0], [0.03, -0.04, 0]], seta: 0.5 },
        { id: 'w3', tipo: 'caminho', pontos: [[0.005, -0.04, 0], [-0.005, -0.04, 0]], seta: 0.5 },
        { id: 'tR', tipo: 'rotulo', pos: [0, 0.053, 0], texto: 'R externo' },
        { id: 'tb', tipo: 'rotulo', pos: [-0.018, -0.053, 0], texto: '40 V' },
        { id: 'tr', tipo: 'rotulo', pos: [0.018, -0.053, 0], texto: 'r = 3 Ω' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Corrente', simbolo: 'I', expr: 'fem/(Rr + ri)', unidade: 'A' },
        { rotulo: 'Potência no resistor externo', simbolo: 'P', expr: 'Rr*(fem/(Rr + ri))^2', unidade: 'W', teoria: Pot('Rr') },
        { rotulo: 'Potência alvo', simbolo: 'P_0', expr: '100', unidade: 'W' },
      ],
      graficos: [
        {
          titulo: 'Potência no resistor externo versus R',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0, ate: 20, rotulo: 'R', unidade: 'Ω' },
          series: [
            { rotulo: 'P(R)', expr: Pot('rr'), unidade: 'W' },
            { rotulo: '100 W', expr: '100', unidade: 'W' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Corrente na malha',
          texto: r`As resistências estão em série:

$$I = \frac{\mathcal E}{R + r}, \qquad P = RI^2 = \frac{\mathcal E^2R}{(R + r)^2}.$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'A equação do segundo grau',
          texto: r`Com $P = 100$:

$$100(R + 3)^2 = 1600R \quad\Rightarrow\quad R^2 - 10R + 9 = 0 \quad\Rightarrow\quad R = 1\,\Omega\ \text{ou}\ 9\,\Omega.$$`,
        },
        {
          titulo: 'Por que são dois',
          previsao: { pergunta: 'Para qual R a potência no resistor externo é máxima?', opcoes: ['R = 0', 'R = r = 3 Ω', 'R muito grande'], correta: 1 },
          texto: r`$R$ pequeno dá muita corrente, mas pouca resistência; $R$ grande, o contrário. O máximo fica em $R = r$, com $133\,\text{W}$. A curva passa por $100\,\text{W}$ uma vez em cada lado do pico.`,
          parametros: { Rr: 3 },
          medidas: [1],
        },
        {
          titulo: 'Resposta',
          texto: r`$R = 1\,\Omega$ ou $9\,\Omega$: alternativa **(e)**. Alterne os valores e veja $P = 100\,\text{W}$ nos dois.`,
          parametros: { Rr: 9 },
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Circuitos e potência', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Potência', texto: r`$P = \mathcal E^2R/(R+r)^2$.`, passo: 0 },
          { titulo: 'Equação', texto: r`$R^2 - 10R + 9 = 0$, com raízes $1$ e $9$.`, passo: 1 },
        ],
        resultado: r`$R = 1\,\Omega$ e $R = 9\,\Omega$: alternativa **(e)**.`,
        errosComuns: [
          r`Esquecer a resistência interna e fazer $P = \mathcal E^2/R$.`,
          r`Usar $P$ total, em vez da dissipada só no resistor externo.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$2\,\Omega$ e $10\,\Omega$`, porque: r`Para $R = 2\,\Omega$: $P = 128\,\text{W}$.` },
        { letra: 'b', texto: r`$2\,\Omega$ e $9\,\Omega$`, porque: r`$R = 2\,\Omega$ não dá 100 W; só o 9 serve.` },
        { letra: 'c', texto: r`$4\,\Omega$ e $10\,\Omega$`, porque: r`Para $R = 4\,\Omega$: $P \approx 131\,\text{W}$.` },
        { letra: 'd', texto: r`$4\,\Omega$ e $8\,\Omega$`, porque: r`Nenhum dos dois dá 100 W.` },
        { letra: 'e', texto: r`$1\,\Omega$ e $9\,\Omega$`, correta: true, porque: r`Correta: são as raízes de $R^2 - 10R + 9 = 0$.` },
        { letra: 'f', texto: r`$1\,\Omega$ e $8\,\Omega$`, porque: r`O 1 serve, mas com $R = 8\,\Omega$ a potência é de cerca de 106 W.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Força numa barra apoiada',
      resumo: 'Sentido e módulo da força magnética.',
      enunciado: r`As extremidades de uma barra condutora, retilínea, de comprimento $L$ e massa $m$ estão apoiadas em dois suportes condutores verticais, conectados a uma bateria de tensão $V$. O circuito é ôhmico e tem resistência $R$. Todo o aparato está imerso em $\vec B = B\hat x$ constante. Indique a única relação correta envolvendo a força magnética $\vec F$ que atua na barra.`,
      figura: [
        { pagina: 4, recorte: [0.06, 0.31, 0.89, 0.465] },
        {
          pagina: 4,
          recorte: [0.22, 0.475, 0.76, 0.66],
          mascaras: [
            { area: [0.548, 0.47, 0.655, 0.52], letra: '' },
            { area: [0.47, 0.5, 0.52, 0.532], letra: '' },
            { area: [0.47, 0.574, 0.515, 0.598], letra: '' },
          ],
        },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [9, 8, 14], alvo: [0, 2, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Tensão', simbolo: 'V', valor: 12, unidade: 'V', min: 3, max: 24, passo: 1 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 4, unidade: 'Ω', min: 1, max: 12, passo: 0.5 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.04, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        { id: 'Bx', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'barra', tipo: 'fio', I: 'V0/Rr', a: ['L/2', 0.04, 0], b: ['-L/2', 0.04, 0], rotulo: 'barra' },
        { id: 's1', tipo: 'caminho', pontos: [['L/2', 0, 0], ['L/2', 0.04, 0]], seta: 0.5 },
        { id: 's2', tipo: 'caminho', pontos: [['-L/2', 0.04, 0], ['-L/2', 0, 0]], seta: 0.5 },
        { id: 'base', tipo: 'caminho', pontos: [['-L/2', 0, 0], ['-L/2', 0, 0.04], ['L/2', 0, 0.04], ['L/2', 0, 0]], seta: 0.5, rotulo: 'bateria e R' },
        { id: 'F', tipo: 'seta', papel: 'forca', origem: [0, 0.04, 0], vetor: "forca('barra','Bx')", comprimento: '2.5*cm', rotulo: 'F' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Corrente', simbolo: 'I', expr: 'V0/Rr', unidade: 'A' },
        { rotulo: 'Força vertical (ẑ da prova)', simbolo: 'F_z', expr: "y(forca('barra','Bx'))", unidade: 'N', teoria: 'V0*B0*L/Rr' },
      ],
      passos: [
        {
          titulo: 'Corrente e eixos',
          texto: r`A corrente sai do terminal positivo, sobe por um suporte, atravessa a barra e desce pelo outro: $I = V/R$. Na barra, ela vai no sentido $-\hat y$ da prova.

Na cena, o eixo vertical é o $\hat z$ da prova; o campo $\vec B$ aponta para o observador, como $\hat x$ na figura.`,
          medidas: [0],
        },
        {
          titulo: 'O produto vetorial',
          previsao: { pergunta: 'A força na barra aponta para…', opcoes: ['+ẑ, para cima', '−ẑ, para baixo', 'ao longo de x̂'], correta: 0 },
          texto: r`$$\vec F = I\vec L\times\vec B = IL(-\hat y)\times B\hat x = ILB\,\hat z,$$

pois $\hat y\times\hat x = -\hat z$. Com $I = V/R$:

$$\vec F = \frac{VBL}{R}\,\hat z.$$`,
          destacar: ['barra', 'F'],
          medidas: [1],
        },
        {
          titulo: 'Resposta',
          texto: r`Alternativa **(b)**. Se a força superar o peso $mg$, a barra sobe e desfaz o contato.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }],
        etapas: [
          { titulo: 'Corrente', texto: r`$I = V/R$, no sentido $-\hat y$ na barra.`, passo: 0 },
          { titulo: 'Força', texto: r`$\vec F = I\vec L\times\vec B = (VBL/R)\hat z$.`, passo: 1 },
        ],
        resultado: r`$\vec F = \dfrac{VBL}{R}\hat z$: alternativa **(b)**.`,
        errosComuns: [
          r`Apontar a força na direção de $\vec B$: ela é perpendicular a ele.`,
          r`Inverter a ordem do produto vetorial.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec F = -\dfrac{VBL}{R}\hat z$`, porque: r`Sentido oposto: valeria com a bateria invertida.` },
        { letra: 'b', texto: r`$\vec F = \dfrac{VBL}{R}\hat z$`, correta: true, porque: r`Correta: $(-\hat y)\times\hat x = +\hat z$.` },
        { letra: 'c', texto: r`$\vec F = -\dfrac{VBL}{R}\hat x$`, porque: r`A força é perpendicular a $\vec B$, então não pode ter direção $\hat x$.` },
        { letra: 'd', texto: r`$\vec F = \dfrac{VBL}{R}\hat x$`, porque: r`A força é perpendicular a $\vec B$.` },
        { letra: 'e', texto: r`$\vec F = -\dfrac{2VBL}{R}\hat y$`, porque: r`A força é perpendicular à corrente, que corre em $\hat y$.` },
        { letra: 'f', texto: r`$\vec F = \dfrac{2VBL}{R}\hat y$`, porque: r`A força é perpendicular à corrente.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Três enganos sobre a lei de Gauss',
      resumo: 'Fluxo nulo, simetria e cargas de fora.',
      enunciado: r`Considere as afirmativas: (I) Se o fluxo do campo elétrico através de uma superfície fechada for zero, então o campo elétrico em todos os pontos de tal superfície é zero; (II) A lei de Gauss para o campo elétrico só é válida para distribuições de carga com simetria plana, esférica ou cilíndrica; e (III) O campo elétrico em um ponto sobre uma superfície fechada depende *exclusivamente* da carga total encerrada no interior da superfície. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 5, recorte: [0.08, 0.115, 0.93, 0.305] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [5, 6, 19], alvo: [1, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'só carga fora' },
            { valor: 2, rotulo: 'cargas assimétricas dentro' },
            { valor: 3, rotulo: 'dentro e fora' },
          ],
        },
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 4e-9, passo: 2e-10 },
      ],
      objetos: [
        { id: 'S', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: 0.08, rotulo: 'S' },
        { id: 'c1', tipo: 'carga', ativo: 'caso==2', q: 'qq', pos: [-0.02, 0.015, 0.01], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', ativo: 'caso==2', q: '0.5*qq', pos: [0.022, -0.01, -0.012], rotulo: 'q/2' },
        { id: 'c3', tipo: 'carga', ativo: 'caso==3', q: 'qq', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'fora', tipo: 'carga', ativo: 'caso!=2', q: 'qq', pos: [0.065, 0, 0], arrastavel: true, rotulo: 'fora' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0.04, 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('S')", unidade: 'V·m', teoria: 'caso==1 ? 0 : (caso==2 ? 1.5*qq/eps0 : qq/eps0)' },
        { rotulo: 'Campo em P', simbolo: 'E(P)', expr: 'mag(E(0.04, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Parte de P vinda da carga externa', simbolo: 'E_\\text{fora}', ativo: 'caso!=2', expr: "mag(Ede('fora', 0.04, 0, 0))", unidade: 'V/m', teoria: 'k0*qq/0.025^2' },
      ],
      passos: [
        {
          titulo: '(I) Fluxo nulo não é campo nulo',
          previsao: { pergunta: 'Com uma carga só do lado de fora, o campo sobre S é…', opcoes: ['nulo', 'diferente de zero'], correta: 1 },
          texto: r`Uma carga fora de $S$ dá fluxo total zero: o que entra por um lado sai pelo outro. Mas há campo em todos os pontos de $S$. **Falsa.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Gauss vale sempre',
          texto: r`Duas cargas em posições sem simetria nenhuma: o fluxo continua igual a $Q_\text{int}/\varepsilon_0$. A simetria só é necessária para **isolar** $E$ da integral, não para a lei valer. **Falsa.**`,
          parametros: { caso: 2 },
          medidas: [0],
        },
        {
          titulo: '(III) O campo vem de todas as cargas',
          texto: r`O campo num ponto é a soma dos campos de **todas** as cargas, dentro e fora. Arraste a carga externa: o fluxo não muda, e o campo em $P$ muda. **Falsa.**`,
          parametros: { caso: 3 },
          destacar: ['fora', 'P'],
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`Nenhuma delas: alternativa **(a)**.`,
          parametros: { caso: 1 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: '(I)', texto: r`Fluxo é uma soma: pode zerar com campo diferente de zero. Falsa.`, passo: 0 },
          { titulo: '(II)', texto: r`A lei é geral; a simetria só ajuda a calcular. Falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`Cargas externas contribuem para o campo em cada ponto, embora não para o fluxo total. Falsa.`, passo: 2 },
        ],
        resultado: r`Nenhuma delas: alternativa **(a)**.`,
        errosComuns: [
          r`Confundir "o fluxo não depende das cargas de fora" com "o campo não depende delas".`,
          r`Achar que a lei só vale onde conseguimos usá-la na mão.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', correta: true, porque: r`Correta: as três são falsas.` },
        { letra: 'b', texto: 'Somente a I.', porque: r`Uma carga externa dá fluxo nulo com campo não nulo.` },
        { letra: 'c', texto: 'Somente a II.', porque: r`A lei de Gauss é geral.` },
        { letra: 'd', texto: 'Somente a III.', porque: r`Cargas externas também criam campo sobre a superfície.` },
        { letra: 'e', texto: 'Somente a I e a II.', porque: r`As duas são falsas.` },
        { letra: 'f', texto: 'Somente a I e a III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Somente a II e a III.', porque: r`As duas são falsas.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`Nenhuma é verdadeira.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 5.2,
      titulo: 'Espira num campo que cresce com x',
      resumo: 'Forças nas quatro arestas, aceleração do centro de massa e ponto de B nulo.',
      enunciado: r`Num certo domínio do plano $xy$ existe um campo magnético externo $\vec B = \left(B_0 + \dfrac{B_1}{L}x\right)\hat z$, com $B_0$, $B_1$ e $L$ constantes positivas. Para os itens (a), (b) e (c), há uma espira rígida quadrada, de massa $M$, com arestas de comprimento $L$ e vértices em $(0,0)$, $(0,L)$, $(L,L)$ e $(L,0)$, com corrente constante $I$: sobe na aresta 1 ($x = 0$), vai para a direita na aresta 2 ($y = L$), desce na aresta 3 ($x = L$) e volta para a esquerda na aresta 4 ($y = 0$).

(a) Quais as direções e sentidos das forças magnéticas sobre cada aresta? [0,8 ponto] (b) Quais os módulos dessas forças? Ordene-os. [2,4 pontos] (c) Determine se o centro de massa se acelera e, em caso afirmativo, encontre sua aceleração. [1,0 ponto] (d) Agora, esquecendo a espira, considere uma partícula de massa $m$, carga $q$ e momento $\vec p = p_x\hat x + p_y\hat y$. Determine a força magnética sobre ela no ponto $(-B_0L/B_1, 0)$. [1,0 ponto]`,
      figura: [
        { pagina: 5, recorte: [0.06, 0.645, 0.93, 0.84] },
        { pagina: 6, recorte: [0.15, 0.145, 0.87, 0.395] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [-1, 2, 21], alvo: [-1, 2, 0] } },
      parametros: [
        { id: 'B0', rotulo: 'Campo em x = 0', simbolo: 'B_0', valor: 0.2, unidade: 'T', min: 0.05, max: 0.5, passo: 0.01 },
        { id: 'B1', rotulo: 'Variação', simbolo: 'B_1', valor: 0.4, unidade: 'T', min: 0.1, max: 0.8, passo: 0.01 },
        { id: 'L', rotulo: 'Lado', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 5, unidade: 'A', min: 1, max: 10, passo: 0.5 },
        { id: 'M', rotulo: 'Massa da espira', simbolo: 'M', valor: 0.01, unidade: 'kg', min: 0.005, max: 0.05, passo: 0.005 },
      ],
      objetos: [
        { id: 'Bx', tipo: 'campoB', valor: '[0, 0, B0 + B1/L*x]' },
        { id: 'a1', tipo: 'fio', I: 'I0', a: [0, 0, 0], b: [0, 'L', 0] },
        { id: 'a2', tipo: 'fio', I: 'I0', a: [0, 'L', 0], b: ['L', 'L', 0] },
        { id: 'a3', tipo: 'fio', I: 'I0', a: ['L', 'L', 0], b: ['L', 0, 0] },
        { id: 'a4', tipo: 'fio', I: 'I0', a: ['L', 0, 0], b: [0, 0, 0] },
        { id: 'F1', tipo: 'seta', papel: 'forca', origem: [0, 'L/2', 0], vetor: "forca('a1','Bx')", comprimento: "2.5*cm*mag(forca('a1','Bx'))/mag(forca('a3','Bx'))", rotulo: 'F₁' },
        { id: 'F2', tipo: 'seta', papel: 'forca', origem: ['L/2', 'L', 0], vetor: "forca('a2','Bx')", comprimento: "2.5*cm*mag(forca('a2','Bx'))/mag(forca('a3','Bx'))", rotulo: 'F₂' },
        { id: 'F3', tipo: 'seta', papel: 'forca', origem: ['L', 'L/2', 0], vetor: "forca('a3','Bx')", comprimento: '2.5*cm', rotulo: 'F₃' },
        { id: 'F4', tipo: 'seta', papel: 'forca', origem: ['L/2', 0, 0], vetor: "forca('a4','Bx')", comprimento: "2.5*cm*mag(forca('a4','Bx'))/mag(forca('a3','Bx'))", rotulo: 'F₄' },
        { id: 'P0', tipo: 'sonda', ativo: 0, campo: 'B', pos: ['-B0*L/B1', 0, 0], rotulo: 'B = 0' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy', fontes: ['Bx'] },
      medidas: [
        { rotulo: 'Força na aresta 1', simbolo: 'F_{1x}', expr: "x(forca('a1','Bx'))", unidade: 'N', teoria: 'I0*L*B0' },
        { rotulo: 'Força na aresta 2', simbolo: 'F_{2y}', expr: "y(forca('a2','Bx'))", unidade: 'N', teoria: '-I0*L*(B0 + B1/2)' },
        { rotulo: 'Força na aresta 3', simbolo: 'F_{3x}', expr: "x(forca('a3','Bx'))", unidade: 'N', teoria: '-I0*L*(B0 + B1)' },
        { rotulo: 'Força na aresta 4', simbolo: 'F_{4y}', expr: "y(forca('a4','Bx'))", unidade: 'N', teoria: 'I0*L*(B0 + B1/2)' },
        { rotulo: 'Força resultante', simbolo: 'F_x', expr: "x(forca('a1','Bx') + forca('a3','Bx'))", unidade: 'N', teoria: '-I0*L*B1' },
        { rotulo: 'Aceleração do centro de massa', simbolo: 'a_x', expr: "x(forca('a1','Bx') + forca('a3','Bx'))/M", unidade: 'm/s²', teoria: '-I0*L*B1/M' },
        { rotulo: 'Campo no ponto do item (d)', simbolo: 'B', expr: "mag(Bde('Bx', -B0*L/B1, 0, 0))", unidade: 'T', teoria: 0 },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Sentidos das forças',
          texto: r`Com $d\vec F = I\,d\vec\ell\times\vec B$ e $\vec B$ saindo da página:

- aresta 1 ($d\vec\ell$ para cima): $\hat y\times\hat z = +\hat x$;
- aresta 2 (para a direita): $\hat x\times\hat z = -\hat y$;
- aresta 3 (para baixo): $-\hat x$;
- aresta 4 (para a esquerda): $+\hat y$.

As quatro apontam para o **interior** da espira.`,
        },
        {
          item: 'b',
          titulo: '(b) Módulos nas arestas verticais',
          texto: r`Nelas $x$ é fixo, e $B$ é constante:

$$F_1 = ILB_0, \qquad F_3 = IL(B_0 + B_1).$$`,
          destacar: ['a1', 'a3', 'F1', 'F3'],
          medidas: [0, 2],
        },
        {
          item: 'b',
          titulo: '(b) Arestas horizontais',
          previsao: { pergunta: 'Quem tem a maior força?', opcoes: ['aresta 1', 'arestas 2 e 4', 'aresta 3'], correta: 2 },
          texto: r`Nelas $B$ varia com $x$, e é preciso integrar:

$$F_2 = F_4 = I\int_0^L\left(B_0 + \frac{B_1}{L}x\right)dx = IL\left(B_0 + \frac{B_1}{2}\right).$$

Ordem: $F_1 < F_2 = F_4 < F_3$.`,
          destacar: ['a2', 'a4', 'F2', 'F4'],
          medidas: [1, 3],
        },
        {
          item: 'c',
          titulo: '(c) Aceleração do centro de massa',
          texto: r`As forças em $y$ se cancelam. Em $x$ sobra

$$\vec F = (F_1 - F_3)\hat x = -ILB_1\,\hat x \quad\Rightarrow\quad \vec a = -\frac{ILB_1}{M}\hat x.$$

A espira é puxada para a região de campo menor. Em campo uniforme, $B_1 = 0$, a resultante seria nula.`,
          medidas: [4, 5],
        },
        {
          item: 'd',
          titulo: '(d) Partícula onde B se anula',
          texto: r`Em $x = -B_0L/B_1$:

$$\vec B = \left[B_0 + \frac{B_1}{L}\left(-\frac{B_0L}{B_1}\right)\right]\hat z = \vec 0.$$

Logo $\vec F = q\frac{\vec p}{m}\times\vec B = \vec 0$, para qualquer $\vec p$. Na cena, é onde as setas de $\vec B$ somem e trocam de sentido.`,
          mostrar: ['P0'],
          medidas: [6],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força sobre corrente', lab: 'ampere' },
          { texto: 'Força de Lorentz', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: '(a) Sentidos', texto: r`$+\hat x$, $-\hat y$, $-\hat x$, $+\hat y$ nas arestas 1, 2, 3 e 4.`, passo: 0 },
          { titulo: '(b) Módulos', texto: r`$F_1 = ILB_0$, $F_2 = F_4 = IL(B_0 + B_1/2)$, $F_3 = IL(B_0 + B_1)$.`, passo: 2 },
          { titulo: '(c) Aceleração', texto: r`$\vec a = -\dfrac{ILB_1}{M}\hat x$.`, passo: 3 },
          { titulo: '(d) Partícula', texto: r`$\vec B = \vec 0$ nesse ponto, logo $\vec F = \vec 0$.`, passo: 4 },
        ],
        resultado: r`$F_1 < F_2 = F_4 < F_3$; $\vec a = -\dfrac{ILB_1}{M}\hat x$; $\vec F_\text{partícula} = \vec 0$.`,
        errosComuns: [
          r`Usar $B$ constante nas arestas horizontais: ali é preciso integrar.`,
          r`Achar que a resultante é nula por ser espira fechada. Isso vale só em campo uniforme.`,
          r`Calcular em (d) uma expressão com $\vec p$: o campo é nulo, e a força também.`,
        ],
        oficial: { resposta: r`$F_1 = ILB_0$; $F_2 = F_4 = IL(B_0 + B_1/2)$; $F_3 = IL(B_0 + B_1)$; $\vec a = -\dfrac{ILB_1}{M}\hat x$; $\vec F_\text{partícula} = \vec 0$.` },
      },
      respostas: [
        { item: 'a', texto: r`$+\hat x$, $-\hat y$, $-\hat x$, $+\hat y$`, pontos: 0.8, criterio: 'Direção e sentido nas quatro arestas.' },
        { item: 'b', texto: r`$F_1 = ILB_0 < F_2 = F_4 = IL(B_0 + B_1/2) < F_3 = IL(B_0 + B_1)$`, pontos: 2.4, criterio: 'Integrais nas arestas e ordenação.' },
        { item: 'c', texto: r`$\vec a = -\dfrac{ILB_1}{M}\hat x$`, pontos: 1, criterio: 'Soma vetorial e segunda lei de Newton.' },
        { item: 'd', texto: r`$\vec F = \vec 0$`, pontos: 1, criterio: r`Mostrar que $\vec B$ é nulo no ponto.` },
      ],
    },
  ],
}

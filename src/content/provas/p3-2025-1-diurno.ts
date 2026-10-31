import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 4: semicírculo em 48 cordas. Nos arranjos a) e b) ele passa pela direita (anti-horário); em c), por cima (horário). */
const M = 48
const th0 = '(caso==3 ? 180 : -90)'
const sg = '(caso==3 ? -1 : 1)'
const arcoPt = (i: number): [string, string, number] => [
  `R*cos(rad(${th0} + ${sg}*${(180 * i) / M}))`,
  `R*sin(rad(${th0} + ${sg}*${(180 * i) / M}))`,
  0,
]
const arco: ObjetoInput[] = Array.from({ length: M }, (_, i) => ({
  id: `s${i}`,
  tipo: 'fio' as const,
  I: 'I0',
  a: arcoPt(i),
  b: arcoPt(i + 1),
}))

/* Objetiva 6: campo de uma partícula em movimento lenta, B = (μ₀/4π) q v × r̂ / r². */
const P = '[x,y,z]'
const BdeQ = (q: string, v: string, o: string) => `mu0/(4*pi)*(${q})*cross(${v}, ${P} - ${o})/mag(${P} - ${o})^3`
const Bunit = 'mu0*qe^2*v0^2/(4*pi*L^2)'

/* Discursiva */
const Ienv = (s: string) => `Cc*min(${s}, a)^3/3 - fio*Cc*a^3/3`

/**
 * P3 de Física III, 2025/1, diurno, versão M (09/07/2025). Conferida com o
 * gabarito oficial: objetivas 1h, 2a, 3d, 4f, 5e, 6c, e a discursiva. O scan
 * tem respostas à mão ao lado dos itens da discursiva e na figura da Q2: a
 * discursiva fica recortada sem os itens, e a Q2, com máscaras.
 */
export const p3_2025_1_diurno: ProvaInput = {
  id: 'p3-2025-1-diurno',
  titulo: 'P3 · 2025/1 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão M · 09/07/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Capacitor isolado: área dobrada, distância menor',
      resumo: 'O que depende de quê quando a carga é fixa.',
      enunciado: r`Considere as afirmações sobre um capacitor de placas planas e paralelas, muito grandes, isolado e carregado: (I) Ao dobrarmos a área de cada placa e diminuirmos a distância entre elas, aumentamos a densidade de energia elétrica em cada ponto no interior do capacitor. (II) A força elétrica entre as placas do capacitor depende da distância entre elas. (III) A energia elétrica acumulada no capacitor só depende da carga elétrica nas placas, mas não de suas áreas ou da distância entre elas. Qual(is) dessas afirmações é(são) verdadeira(s)?`,
      figura: { pagina: 1, recorte: [0.545, 0.03, 0.945, 0.235] },
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [26, 20, 74], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'modo',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'inicial' },
            { valor: 2, rotulo: 'área 2A, distância d/2' },
          ],
        },
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'd0', rotulo: 'Distância inicial', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.016, max: 0.03, passo: 0.002 },
        { id: 'lado', rotulo: 'Lado inicial', simbolo: r`\sqrt{A}`, valor: 0.06, unidade: 'm', min: 0.05, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'Capacitor',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado*sqrt(modo)',
          d: 'd0/modo',
          Q: 'Q0',
        },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo entre as placas', simbolo: 'E', expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: 'Q0/(eps0*modo*lado^2)' },
        { rotulo: 'Densidade de energia', simbolo: 'u', expr: 'eps0/2*mag(E(0, 0, 0))^2', unidade: 'J/m³', teoria: 'Q0^2/(2*eps0*modo^2*lado^4)' },
        { rotulo: 'Força entre as placas', simbolo: 'F', expr: 'Q0*mag(E(0, 0, 0))/2', unidade: 'N', teoria: 'Q0^2/(2*eps0*modo*lado^2)' },
        { rotulo: 'Energia armazenada', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: 'Q0^2*d0/(2*eps0*modo^2*lado^2)' },
      ],
      passos: [
        {
          titulo: 'Isolado: Q fixo',
          texto: r`O campo entre as placas é $E = Q/\varepsilon_0A$. Ele depende da área, mas **não** da distância.`,
          parametros: { modo: 1 },
          medidas: [0],
        },
        {
          titulo: '(I) A densidade de energia diminui',
          previsao: { pergunta: 'Dobrando a área com Q fixo, a densidade de energia…', opcoes: ['aumenta', 'cai a 1/4', 'não muda'], correta: 1 },
          texto: r`Com área dobrada, $E$ cai à metade, e

$$u = \frac{\varepsilon_0E^2}{2}$$

cai a um quarto. Mudar a distância não altera $E$. **Falsa.**`,
          parametros: { modo: 2 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) A força não depende da distância',
          texto: r`Uma placa sente o campo da outra, $E/2$:

$$F = Q\cdot\frac E2 = \frac{Q^2}{2\varepsilon_0A}.$$

Não há $d$ na expressão. Mude $d$ no controle: $F$ fica igual. **Falsa.**`,
          parametros: { modo: 1 },
          medidas: [2],
        },
        {
          titulo: '(III) A energia depende da geometria',
          texto: r`$$U = \frac{Q^2}{2C} = \frac{Q^2d}{2\varepsilon_0A}.$$

Depende de $A$ e de $d$. **Falsa.**`,
          parametros: { modo: 2 },
          medidas: [3],
        },
        {
          titulo: 'Resposta',
          texto: r`Nenhuma é verdadeira: alternativa **(h)**.`,
          parametros: { modo: 1 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitor e energia', lab: 'capacitor' }],
        etapas: [
          { titulo: '(I)', texto: r`$u = Q^2/2\varepsilon_0A^2$: dobrar $A$ reduz $u$ a 1/4. Falsa.`, passo: 1 },
          { titulo: '(II)', texto: r`$F = Q^2/2\varepsilon_0A$, independente de $d$. Falsa.`, passo: 2 },
          { titulo: '(III)', texto: r`$U = Q^2d/2\varepsilon_0A$. Falsa.`, passo: 3 },
        ],
        resultado: r`Nenhuma delas: alternativa **(h)**.`,
        errosComuns: [
          r`Usar $F = k_0Q^2/d^2$: as placas não são cargas pontuais.`,
          r`Pensar que aproximar as placas aumenta o campo com $Q$ fixo.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Todas elas.', porque: r`As três são falsas.` },
        { letra: 'b', texto: 'Apenas a I e a II.', porque: r`$u$ diminui e $F$ não depende de $d$.` },
        { letra: 'c', texto: 'Apenas a I e a III.', porque: r`As duas são falsas.` },
        { letra: 'd', texto: 'Apenas a II e a III.', porque: r`As duas são falsas.` },
        { letra: 'e', texto: 'Apenas a I.', porque: r`Com área maior, $E$ e $u$ diminuem.` },
        { letra: 'f', texto: 'Apenas a II.', porque: r`$F = Q^2/2\varepsilon_0A$ não tem $d$.` },
        { letra: 'g', texto: 'Apenas a III.', porque: r`$U$ depende de $A$ e de $d$.` },
        { letra: 'h', texto: 'Nenhuma delas.', correta: true, porque: r`Correta: as três são falsas.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Potencial entre placas de densidades diferentes',
      resumo: 'Planos com −σ e σ/3; V nulo em z = L.',
      enunciado: r`Considere duas placas finas, infinitas, situadas nos planos $z = -L$ e $z = 2L$ ($L > 0$), com densidades superficiais constantes $-\sigma$ e $\sigma/3$ ($\sigma > 0$), respectivamente. Indique, dos gráficos, aquele que melhor representa o potencial elétrico correspondente, na região entre as placas, supondo que ele é nulo no plano $z = L$.`,
      figura: [
        {
          pagina: 2,
          recorte: [0.05, 0.03, 0.46, 0.61],
          mascaras: [
            { area: [0.344, 0.07, 0.357, 0.095], letra: '' },
            { area: [0.363, 0.062, 0.412, 0.106], letra: '' },
            { area: [0.418, 0.07, 0.436, 0.098], letra: '' },
            { area: [0.363, 0.155, 0.412, 0.198], letra: '' },
            { area: [0.355, 0.215, 0.43, 0.26], letra: '' },
          ],
        },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [20, 4, 2], alvo: [0, 0, 1.5] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 3e-9, unidade: 'C/m²', min: 1e-9, max: 6e-9, passo: 1e-10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'zP', rotulo: 'Posição da sonda', simbolo: 'z', valor: 0.02, unidade: 'm', min: -0.018, max: 0.038, passo: 0.001 },
      ],
      objetos: [
        { id: 'p1', tipo: 'planoInfinito', sigma: '0-sig', ponto: [0, 0, '0-L'], normal: 'z', rotulo: '−σ' },
        { id: 'p2', tipo: 'planoInfinito', sigma: 'sig/3', ponto: [0, 0, '2*L'], normal: 'z', rotulo: 'σ/3' },
        { id: 'S', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'sonda' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'yz' },
      medidas: [
        { rotulo: 'Campo do plano −σ', simbolo: 'E_1', expr: "z(Ede('p1', 0, 0, zP))", unidade: 'V/m', teoria: '-sig/(2*eps0)' },
        { rotulo: 'Campo do plano σ/3', simbolo: 'E_2', expr: "z(Ede('p2', 0, 0, zP))", unidade: 'V/m', teoria: '-sig/(6*eps0)' },
        { rotulo: 'Campo total', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m', teoria: '-2*sig/(3*eps0)' },
        { rotulo: 'Potencial (V = 0 em z = L)', simbolo: 'V', expr: 'V(0, 0, zP) - V(0, 0, L)', unidade: 'V', teoria: '2*sig/(3*eps0)*(zP - L)' },
        { rotulo: 'V em z = 2L', simbolo: 'V(2L)', expr: 'V(0, 0, 1.999*L) - V(0, 0, L)', unidade: 'V', teoria: '2*sig*0.999*L/(3*eps0)' },
        { rotulo: 'V em z = −L', simbolo: 'V(-L)', expr: 'V(0, 0, -0.999*L) - V(0, 0, L)', unidade: 'V', teoria: '-2*sig*1.999*L/(3*eps0)' },
      ],
      graficos: [
        {
          titulo: 'V(z) entre as placas',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '-0.99*L', ate: '1.99*L', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(0, 0, zz) - V(0, 0, L)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'Campo de cada plano',
          texto: r`Cada plano cria $|E| = |\sigma_i|/2\varepsilon_0$. Entre as placas:

- o plano $-\sigma$ atrai para si, ou seja, aponta para $-\hat z$;
- o plano $+\sigma/3$ repele, o que também aponta para $-\hat z$.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Somar',
          previsao: { pergunta: 'Entre as placas, os dois campos…', opcoes: ['se somam', 'se subtraem'], correta: 0 },
          texto: r`$$E_z = -\frac{\sigma}{2\varepsilon_0} - \frac{\sigma}{6\varepsilon_0} = -\frac{2\sigma}{3\varepsilon_0}.$$

Constante: o potencial é uma **reta**.`,
          medidas: [2],
        },
        {
          titulo: 'A reta',
          texto: r`$E_z < 0$ quer dizer que $V$ **cresce** com $z$:

$$V(z) = \frac{2\sigma}{3\varepsilon_0}(z - L).$$

Nos extremos: $V(2L) = \dfrac{2\sigma L}{3\varepsilon_0}$ e $V(-L) = -\dfrac{4\sigma L}{3\varepsilon_0}$.`,
          medidas: [3, 4, 5],
        },
        {
          titulo: 'Resposta',
          texto: r`Reta crescente, com esses valores: gráfico (I), alternativa **(a)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Superposição de planos', lab: 'coulomb' },
          { texto: 'Potencial a partir do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Campo', texto: r`As duas contribuições apontam para $-\hat z$: $E_z = -2\sigma/3\varepsilon_0$.`, passo: 1 },
          { titulo: 'Potencial', texto: r`$V(z) = -\int_L^zE_z\,dz' = \frac{2\sigma}{3\varepsilon_0}(z - L)$.`, passo: 2 },
        ],
        resultado: r`Gráfico (I): alternativa **(a)**.`,
        errosComuns: [
          r`Subtrair os campos porque as cargas têm sinais opostos: entre as placas eles se somam.`,
          r`Inverter a inclinação: o potencial sobe no sentido oposto ao do campo.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'I.', correta: true, porque: r`Correta: reta crescente, de $-4\sigma L/3\varepsilon_0$ a $2\sigma L/3\varepsilon_0$.` },
        { letra: 'b', texto: 'II.', porque: r`Inclinação oposta.` },
        { letra: 'c', texto: 'III.', porque: r`Usa $E = \sigma/3\varepsilon_0$, subtraindo os campos.` },
        { letra: 'd', texto: 'IV.', porque: r`Inclinação oposta e valores errados.` },
        { letra: 'e', texto: 'V.', porque: r`Inclinação oposta e valores errados.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Fio com resistividade que cresce com s',
      resumo: 'E axial constante: J cai com 1/s.',
      enunciado: r`Um fio cilíndrico, condutor, ôhmico possui seção transversal circular de raio $a$. A resistividade elétrica deste fio é não uniforme e varia com a distância $s$ até o eixo segundo a lei $\rho(s) = \rho_0s/a$, onde $\rho_0$ é uma constante positiva. Considere que o vetor campo elétrico é constante ao longo do eixo desse fio. Qual dos gráficos melhor representa o módulo $J$ da densidade de corrente como função da razão $s/a$?`,
      figura: { pagina: 2, recorte: [0.53, 0.025, 0.96, 0.46] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'E0', rotulo: 'Campo elétrico', simbolo: 'E', valor: 1, unidade: 'V/m', min: 0.2, max: 3, passo: 0.1 },
        { id: 'rho0', rotulo: 'Constante', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'Ω·m', min: 2e-7, max: 3e-6, passo: 1e-7 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.02, unidade: 'm', min: 0.004, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        { id: 'fio', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', raioInterno: '1e-6*a', J: 'E0*a/(rho0*r)' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Densidade de corrente em s', simbolo: 'J', expr: 'rs < a ? E0*a/(rho0*rs) : 0', unidade: 'A/m²' },
        { rotulo: 'Corrente envolvida (tabela)', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: '2*pi*E0*a*min(rs, a)/rho0' },
        { rotulo: 'Campo magnético em s', simbolo: 'B', expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: 'mu0*E0*a/rho0*min(1, a/rs)' },
      ],
      graficos: [
        {
          titulo: 'J versus s/a',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.05, ate: 2, rotulo: 's/a', unidade: '' },
          series: [{ rotulo: 'J', expr: 'ss < 1 ? E0/(rho0*ss) : 0', unidade: 'A/m²' }],
        },
      ],
      passos: [
        {
          titulo: 'Lei de Ohm local',
          texto: r`$$\vec J = \frac{\vec E}{\rho(s)}.$$

O campo $\vec E$ é o mesmo em toda a seção. O que muda de ponto a ponto é a resistividade.`,
        },
        {
          titulo: 'Forma de J(s)',
          previsao: { pergunta: 'Perto do eixo, J é…', opcoes: ['nula', 'muito grande', 'igual à da borda'], correta: 1 },
          texto: r`$$J(s) = \frac{Ea}{\rho_0s} = \frac{E}{\rho_0}\frac{1}{s/a}, \quad s < a.$$

Diverge no eixo, onde a resistividade tende a zero, e vale $E/\rho_0$ na borda, $s = a$. Fora do fio, não há corrente: $J = 0$.`,
          medidas: [0],
        },
        {
          titulo: 'Divergência integrável',
          texto: r`Mesmo com $J \to \infty$ no eixo, a corrente é finita:

$$I_\text{env}(s) = \int_0^sJ\,2\pi s'\,ds' = \frac{2\pi Eas}{\rho_0}.$$

Um efeito curioso: por Ampère, $B$ é **constante** dentro do fio.`,
          medidas: [1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`Curva $1/s$ até $s/a = 1$, com queda abrupta a zero: gráfico (IV), alternativa **(d)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ohm local' },
          { texto: 'Lei de Ampère', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'J', texto: r`$J = E/\rho = Ea/\rho_0s$ em $s < a$.`, passo: 1 },
          { titulo: 'Fora', texto: r`Não há material condutor em $s > a$: $J = 0$, com salto em $s = a$.`, passo: 1 },
        ],
        resultado: r`Gráfico (IV): alternativa **(d)**.`,
        errosComuns: [
          r`Confundir $J$ com $\rho$: a densidade é inversamente proporcional à resistividade.`,
          r`Fazer a curva cair a zero em $s = a$ continuamente: na borda ainda vale $E/\rho_0$.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'I.', porque: r`$J$ constante exigiria resistividade uniforme.` },
        { letra: 'b', texto: 'II.', porque: r`É o formato de $\rho(s)$, não o de $J$.` },
        { letra: 'c', texto: 'III.', porque: r`Fora do fio não há corrente.` },
        { letra: 'd', texto: 'IV.', correta: true, porque: r`Correta: $1/s$ até a borda, e zero fora.` },
        { letra: 'e', texto: 'V.', porque: r`Em $s = a$, $J$ ainda vale $E/\rho_0$.` },
        { letra: 'f', texto: 'VI.', porque: r`$J$ não se anula no eixo: é onde ela é maior.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Três circuitos com um semicírculo',
      resumo: 'Compare B no centro do arco em cada arranjo.',
      enunciado: r`Um circuito plano pode ser montado de três formas diferentes, a), b) e c), ao conectar duas partes retilíneas (semi-infinitas) e um fio semicircular, em arranjos distintos, conforme a figura. Avalie os módulos dos campos magnéticos $\vec B_a$, $\vec B_b$ e $\vec B_c$ no centro do arco semicircular de cada arranjo. Considere uma corrente estacionária de mesma intensidade, no sentido indicado na figura, em todos os arranjos.`,
      figura: { pagina: 3, recorte: [0.03, 0.025, 0.45, 0.4] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 1, 19], alvo: [-1, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Arranjo',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'a) dois fios tangentes' },
            { valor: 2, rotulo: 'b) um tangente, um radial' },
            { valor: 3, rotulo: 'c) dois fios radiais' },
          ],
        },
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
      ],
      objetos: [
        ...arco,
        { id: 'a1', tipo: 'fio', ativo: 'caso==1', I: 'I0', a: [-0.09, '0-R', 0], b: [0, '0-R', 0], infinito: 'a', rotulo: 'I' },
        { id: 'a2', tipo: 'fio', ativo: 'caso==1', I: 'I0', a: [0, 'R', 0], b: [-0.09, 'R', 0], infinito: 'b' },
        { id: 'b1', tipo: 'fio', ativo: 'caso==2', I: 'I0', a: [-0.09, '0-R', 0], b: [0, '0-R', 0], infinito: 'a', rotulo: 'I' },
        { id: 'b2', tipo: 'fio', ativo: 'caso==2', I: 'I0', a: [0, 'R', 0], b: [0, 0.085, 0], infinito: 'b' },
        { id: 'c1', tipo: 'fio', ativo: 'caso==3', I: 'I0', a: [-0.09, 0, 0], b: ['0-R', 0, 0], infinito: 'a', rotulo: 'I' },
        { id: 'c2', tipo: 'fio', ativo: 'caso==3', I: 'I0', a: ['R', 0, 0], b: [0.09, 0, 0], infinito: 'b' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        {
          rotulo: 'Campo no centro',
          simbolo: '|B|',
          expr: 'abs(z(B(0, 0, 0)))',
          unidade: 'T',
          teoria: '(caso==1 ? mu0*I0/(2*pi*R) : (caso==2 ? mu0*I0/(4*pi*R) : 0)) + mu0*I0/(4*R)',
        },
        { rotulo: 'Parte do semicírculo', simbolo: r`\mu_0I/4R`, expr: 'mu0*I0/(4*R)', unidade: 'T' },
        { rotulo: 'Parte de um fio tangente', simbolo: r`\mu_0I/4\pi R`, expr: 'mu0*I0/(4*pi*R)', unidade: 'T' },
      ],
      passos: [
        {
          titulo: 'Três peças do campo',
          texto: r`No centro do arco, cada peça contribui de um jeito:

- semicírculo: metade do campo de uma espira, $\mu_0I/4R$;
- fio semi-infinito tangente: metade do fio infinito, $\mu_0I/4\pi R$;
- fio radial, apontando para o centro: $d\vec\ell\times\hat r = 0$, nada.`,
          parametros: { caso: 3 },
          medidas: [1, 2],
        },
        {
          titulo: 'Arranjo c): só o arco',
          texto: r`Os dois fios são radiais, e não contribuem:

$$|\vec B_c| = \frac{\mu_0I}{4R}.$$`,
          parametros: { caso: 3 },
          medidas: [0],
        },
        {
          titulo: 'Arranjo b): arco e um tangente',
          previsao: { pergunta: 'O fio vertical do arranjo b) contribui para B no centro?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`O fio de cima está na reta que passa pelo centro: é radial, não contribui. O de baixo é tangente, e sua contribuição tem o mesmo sentido da do arco:

$$|\vec B_b| = \frac{\mu_0I}{4R} + \frac{\mu_0I}{4\pi R}.$$`,
          parametros: { caso: 2 },
          medidas: [0],
        },
        {
          titulo: 'Arranjo a): arco e dois tangentes',
          texto: r`Os dois fios são tangentes e reforçam o arco:

$$|\vec B_a| = \frac{\mu_0I}{4R} + \frac{\mu_0I}{2\pi R}.$$

Logo, $|\vec B_a| > |\vec B_b| > |\vec B_c|$: alternativa **(f)**.`,
          parametros: { caso: 1 },
          medidas: [0],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Biot-Savart', lab: 'ampere' }],
        etapas: [
          { titulo: 'Peças', texto: r`Arco: $\mu_0I/4R$. Fio semi-infinito tangente: $\mu_0I/4\pi R$. Fio radial: zero.`, passo: 0 },
          { titulo: 'Somas', texto: r`$B_c = \mu_0I/4R$; $B_b = B_c + \mu_0I/4\pi R$; $B_a = B_c + \mu_0I/2\pi R$.`, passo: 3 },
        ],
        resultado: r`$|\vec B_a| > |\vec B_b| > |\vec B_c|$: alternativa **(f)**.`,
        errosComuns: [
          r`Dar campo a um fio radial: ali $d\vec\ell\parallel\vec r$.`,
          r`Usar $\mu_0I/2\pi R$ para o semi-infinito: esse é o valor do fio inteiro.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$|\vec B_c| > |\vec B_b| > |\vec B_a|$`, porque: r`Ordem invertida: (c) tem o menor campo.` },
        { letra: 'b', texto: r`$|\vec B_c| > |\vec B_a| > |\vec B_b|$`, porque: r`(c) só tem o arco.` },
        { letra: 'c', texto: r`$|\vec B_b| > |\vec B_c| > |\vec B_a|$`, porque: r`(a) tem o maior campo.` },
        { letra: 'd', texto: r`$|\vec B_b| > |\vec B_a| > |\vec B_c|$`, porque: r`(a) tem dois fios tangentes, e (b) só um.` },
        { letra: 'e', texto: r`$|\vec B_a| > |\vec B_c| > |\vec B_b|$`, porque: r`(b) tem o arco mais um fio tangente, logo supera (c).` },
        { letra: 'f', texto: r`$|\vec B_a| > |\vec B_b| > |\vec B_c|$`, correta: true, porque: r`Correta: quanto mais fios tangentes, maior o campo.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Campo com t³: a corrente nunca troca de sentido',
      resumo: 'B inverte em t = 0, mas dB/dt não.',
      enunciado: r`Uma espira condutora, ôhmica, circular, rígida, de raio $a$ e resistência $R$, está imersa em um campo magnético não estacionário $\vec B = Ct^3\hat x$, de modo que seu plano é perpendicular ao campo; aqui, $C = \text{const} > 0$. Qual é o módulo da corrente elétrica induzida ao longo de tal espira? Qual é a orientação dessa corrente induzida, conforme vista de $x \to \infty$?`,
      figura: { pagina: 3, recorte: [0.51, 0.025, 0.945, 0.17] },
      cena: {
        escala: 0.01,
        extensao: 7,
        unidade: 'cm',
        camera: { pos: [15, 6, 7], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.002 },
      },
      parametros: [
        { id: 'CC', rotulo: 'Constante', simbolo: 'C', valor: 2, unidade: 'T/s³', min: 0.5, max: 5, passo: 0.1 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.06, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.05, max: 1, passo: 0.05 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: -1, unidade: 's', min: -1.5, max: 1.5, passo: 0.1 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: ['CC*(t + t0)^3', 0, 0], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'x', raio: 'a', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Campo agora', simbolo: 'B_x', expr: 'CC*(t + t0)^3', unidade: 'T' },
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: 'pi*a^2*CC*(t + t0)^3' },
        { rotulo: 'fem (derivada numérica do fluxo)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: '-3*pi*a^2*CC*(t + t0)^2' },
        { rotulo: 'Corrente (negativa: horária vista de +x)', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: '-3*pi*a^2*CC*(t + t0)^2/Rr' },
      ],
      graficos: [
        {
          titulo: 'Fluxo e corrente no tempo',
          tipo: 'tempo',
          janela: 3,
          series: [
            { rotulo: 'Φ', expr: "fluxoB('S')", unidade: 'Wb' },
            { rotulo: 'I', expr: "Iind('S')", unidade: 'A' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Fluxo e fem',
          texto: r`$\Phi_B = \pi a^2Ct^3$, então

$$|\mathcal E| = \left|\frac{d\Phi_B}{dt}\right| = 3\pi a^2Ct^2, \qquad |I| = \frac{3\pi a^2Ct^2}{R}.$$`,
          parametros: { t0: -1 },
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Para t < 0',
          previsao: { pergunta: 'Com t < 0, B aponta para −x̂ e seu módulo diminui. Vista de +x, a corrente é…', opcoes: ['horária', 'anti-horária'], correta: 0 },
          texto: r`O fluxo aponta para $-\hat x$ e está **diminuindo** em módulo. Lenz: a corrente tenta manter esse fluxo, criando campo para $-\hat x$. Vista de $+x$, isso é sentido **horário**.`,
          parametros: { t0: -1 },
          medidas: [0, 3],
        },
        {
          titulo: 'Para t > 0',
          texto: r`Agora $\vec B$ aponta para $+\hat x$ e cresce. Lenz: a corrente cria campo oposto, para $-\hat x$: de novo **horária**.

Mude $t_0$ para valores positivos: o sinal da corrente não muda. O que conta é $d\vec B/dt = 3Ct^2\hat x$, que nunca troca de sentido.`,
          parametros: { t0: 1 },
          medidas: [0, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`$|I| = 3\pi a^2Ct^2/R$, sempre horária: alternativa **(e)**.`,
          parametros: { t0: 1 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e de Lenz', lab: 'faraday' }],
        etapas: [
          { titulo: 'Módulo', texto: r`$|\mathcal E| = \pi a^2\cdot3Ct^2$ e $I = |\mathcal E|/R$.`, passo: 0 },
          { titulo: 'Sentido', texto: r`$d\vec B/dt$ aponta sempre para $+\hat x$. A corrente cria campo para $-\hat x$: horária vista de $x \to \infty$.`, passo: 2 },
        ],
        resultado: r`$|I| = 3\pi a^2Ct^2/R$, horária: alternativa **(e)**.`,
        errosComuns: [
          r`Achar que a corrente troca de sentido junto com $\vec B$. Quem manda é a variação de $\vec B$.`,
          r`Esquecer o $\pi$ da área ou o 3 da derivada.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$a^2Ct^2/R$. Horária, para $t < 0$, e anti-horária, para $t > 0$.`, porque: r`Falta $3\pi$, e o sentido não muda.` },
        { letra: 'b', texto: r`$a^2Ct^2/R$. Anti-horária, para $t < 0$, e horária, para $t > 0$.`, porque: r`Falta $3\pi$, e o sentido não muda.` },
        { letra: 'c', texto: r`$3\pi a^2Ct^2/R$. Horária, para $t < 0$, e anti-horária, para $t > 0$.`, porque: r`Módulo certo, mas a corrente segue $d\vec B/dt$, não $\vec B$.` },
        { letra: 'd', texto: r`$3\pi a^2Ct^2/R$. Anti-horária, para $t < 0$, e horária, para $t > 0$.`, porque: r`Módulo certo, mas o sentido não muda.` },
        { letra: 'e', texto: r`$3\pi a^2Ct^2/R$. Horária.`, correta: true, porque: r`Correta: $d\vec B/dt$ tem sempre o mesmo sentido.` },
        { letra: 'f', texto: r`$3\pi a^2Ct^2/R$. Anti-horária.`, porque: r`Essa corrente reforçaria o aumento do fluxo para $+\hat x$, contra Lenz.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Duas cargas em movimento e a terceira lei',
      resumo: 'A força magnética de uma existe; a da outra, não.',
      enunciado: r`Considere, num dado instante $t$, 2 partículas, separadas por uma distância $L$: (1) de carga $q_1 = e > 0$ e velocidade $\vec v_1 = v_0\hat y$ ($v_0 > 0$) e (2) de carga $q_2 = -e$ e velocidade $\vec v_2 = -v_0\hat x$, ambas com aceleração nula, com (2) à direita de (1). Supondo que $v_0$ é pequeno em relação à velocidade da luz no vácuo, quais são a força magnética da partícula 1 sobre a 2, $\vec F_{(m)1\to2}$, e vice-versa, $\vec F_{(m)2\to1}$, nesse instante?`,
      figura: [
        { pagina: 4, recorte: [0.08, 0.03, 0.49, 0.195] },
        { pagina: 4, recorte: [0.2, 0.2, 0.37, 0.37] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [3, 1, 17], alvo: [3, 0.5, 0] } },
      parametros: [
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 2e4, max: 3e5, passo: 1e4 },
        { id: 'L', rotulo: 'Separação', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
        {
          id: 'qual',
          rotulo: 'Campo mostrado',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'da partícula 1' },
            { valor: 2, rotulo: 'da partícula 2' },
          ],
        },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: '1' },
        { id: 'q2', tipo: 'carga', q: '0-qe', pos: ['L', 0, 0], rotulo: '2' },
        { id: 'B1', tipo: 'campoB', ativo: 'qual==1', valor: BdeQ('qe', '[0, v0, 0]', '[0, 0, 0]') },
        { id: 'B2', tipo: 'campoB', ativo: 'qual==2', valor: BdeQ('0-qe', '[0-v0, 0, 0]', '[L, 0, 0]') },
        { id: 'v1', tipo: 'seta', papel: 'v', origem: [0, 0, 0], vetor: [0, 1, 0], comprimento: '2*cm', rotulo: 'v₁' },
        { id: 'v2', tipo: 'seta', papel: 'v', origem: ['L', 0, 0], vetor: [-1, 0, 0], comprimento: '2*cm', rotulo: 'v₂' },
        { id: 'F12', tipo: 'seta', ativo: 'qual==1', papel: 'forca', origem: ['L', 0, 0], vetor: [0, 1, 0], comprimento: '2*cm', rotulo: 'F₁→₂' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        {
          rotulo: 'F₁→₂ em y, em unidades de μ₀e²v₀²/4πL²',
          simbolo: r`F_y`,
          ativo: 'qual==1',
          expr: `y((0-qe)*cross([0-v0, 0, 0], Bde('B1', L, 0, 0)))/(${Bunit})`,
          teoria: 1,
        },
        {
          rotulo: 'F₂→₁, em unidades de μ₀e²v₀²/4πL²',
          simbolo: r`|F|`,
          ativo: 'qual==2',
          expr: `mag(qe*cross([0, v0, 0], Bde('B2', 0, 0, 0)))/(${Bunit})`,
          teoria: 0,
        },
        { rotulo: 'Unidade μ₀e²v₀²/4πL²', simbolo: 'F_0', expr: Bunit, unidade: 'N' },
      ],
      passos: [
        {
          titulo: 'Campo de 1 na posição de 2',
          texto: r`$$\vec B_1 = \frac{\mu_0}{4\pi}\frac{e\,\vec v_1\times\hat r}{L^2}, \quad \hat r = \hat x.$$

Como $\hat y\times\hat x = -\hat z$, o campo em 2 entra na página.`,
          parametros: { qual: 1 },
        },
        {
          titulo: 'Força sobre 2',
          texto: r`$$\vec F_{1\to2} = q_2\vec v_2\times\vec B_1 = (-e)(-v_0\hat x)\times\left(-\frac{\mu_0ev_0}{4\pi L^2}\hat z\right) = \frac{\mu_0e^2v_0^2}{4\pi L^2}\,\hat y.$$`,
          parametros: { qual: 1 },
          destacar: ['F12'],
          medidas: [0, 2],
        },
        {
          titulo: 'Campo de 2 na posição de 1',
          previsao: { pergunta: 'O campo da partícula 2 na posição da partícula 1 é…', opcoes: ['igual ao de 1 em 2', 'oposto', 'nulo'], correta: 2 },
          texto: r`A partícula 2 anda exatamente na direção da reta que a liga a 1: $\vec v_2\parallel\hat r$, logo $\vec v_2\times\hat r = \vec 0$. Não há campo em 1, nem força:

$$\vec F_{2\to1} = \vec 0.$$`,
          parametros: { qual: 2 },
          medidas: [1],
        },
        {
          titulo: 'A terceira lei falha?',
          texto: r`As duas forças **não** são opostas. A terceira lei, nessa forma, não vale para a força magnética entre cargas em movimento: o momento que falta está no próprio campo eletromagnético.

Resposta: alternativa **(c)**.`,
          parametros: { qual: 1 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de carga em movimento', lab: 'lorentz' },
          { texto: 'Força de Lorentz', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: 'Sobre 2', texto: r`$\vec B_1 = -\dfrac{\mu_0ev_0}{4\pi L^2}\hat z$ em 2, e $\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat y$.`, passo: 1 },
          { titulo: 'Sobre 1', texto: r`$\vec v_2\times\hat r = \vec 0$: $\vec B_2 = \vec 0$ em 1 e $\vec F_{2\to1} = \vec 0$.`, passo: 2 },
        ],
        resultado: r`$\vec F_{(m)1\to2} = \dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat y$ e $\vec F_{(m)2\to1} = \vec 0$: alternativa **(c)**.`,
        errosComuns: [
          r`Assumir ação e reação: as forças magnéticas entre cargas em movimento não obedecem à terceira lei nessa forma.`,
          r`Esquecer o sinal de $q_2$ ou de $\vec v_2$ no produto vetorial.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat y = -\vec F_{2\to1}$`, porque: r`Módulo certo, mas assume ação e reação.` },
        { letra: 'b', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{2\pi L^2}\hat y = -\vec F_{2\to1}$`, porque: r`Fator 2 a mais e assume ação e reação.` },
        { letra: 'c', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat y$ e $\vec F_{2\to1} = \vec 0$`, correta: true, porque: r`Correta: $\vec v_2$ é paralela à reta que liga as cargas.` },
        { letra: 'd', texto: r`$\vec F_{1\to2} = -\dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat y$ e $\vec F_{2\to1} = \vec 0$`, porque: r`Sinal errado: dois sinais negativos, $q_2$ e $\vec v_2$, se cancelam.` },
        { letra: 'e', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{4\pi L^2}\hat z = -\vec F_{2\to1}$`, porque: r`A força é perpendicular a $\vec B$, que aponta em $\hat z$.` },
        { letra: 'f', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{2\pi L^2}\hat z = -\vec F_{2\to1}$`, porque: r`A força é perpendicular a $\vec B$.` },
        { letra: 'g', texto: r`$\vec F_{1\to2} = \dfrac{\mu_0e^2v_0^2}{2\pi L^2}\hat x = -\vec F_{2\to1}$`, porque: r`A força é perpendicular à velocidade de 2, que está em $\hat x$.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 5.2,
      titulo: 'Condutor com J = Cs/2π e fio no eixo',
      resumo: 'Corrente total, B fora e dentro, e como anular o campo externo.',
      enunciado: r`Uma corrente estacionária flui por um condutor ôhmico cilíndrico de raio $a$, com eixo coincidente com $z$. O vetor densidade de corrente é nulo fora do condutor e, no seu interior, é dado por $\vec J(s) = \dfrac{Cs}{2\pi}\hat z$, onde $C$ é uma constante positiva e $s$ é a distância de um ponto ao eixo.

(a) Determine o valor da corrente $I$ que flui por uma seção reta do material condutor. [1,2 ponto] (b) Determine o vetor campo magnético $\vec B(s, \varphi, z)$ gerado pela corrente em pontos com $s > a$. [1,5 ponto] (c) Determine o vetor campo magnético em pontos com $s < a$. [1,5 ponto] (d) Considere que um fio retilíneo, muito longo, é colocado no eixo do material condutor ($s = 0$). Determine o valor e o sentido ($\hat z$ ou $-\hat z$) da corrente $I_f$ que flui por ele, de modo que o campo magnético total gerado pelo fio e pelo material condutor seja nulo nos pontos $s > a$. [1,0 ponto]`,
      figura: [
        { pagina: 4, recorte: [0.06, 0.805, 0.485, 0.935] },
        { pagina: 4, recorte: [0.555, 0.04, 0.95, 0.32] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Cc', rotulo: 'Constante', simbolo: 'C', valor: 1e6, unidade: 'A/m⁴', min: 2e5, max: 2e6, passo: 1e5 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.06, unidade: 'm', min: 0.005, max: 0.085, passo: 0.001 },
        { id: 'fio', rotulo: 'Corrente no eixo (−I_f/I)', simbolo: r`-I_f/I`, valor: 0, min: 0, max: 1.5, passo: 0.05 },
      ],
      objetos: [
        { id: 'cond', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', J: 'Cc*r/(2*pi)', rotulo: 'condutor' },
        { id: 'If', tipo: 'fioInfinito', ativo: 'fio > 0', I: '-fio*Cc*a^3/3', ponto: [0, 0, 0], direcao: 'z' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente no condutor', simbolo: 'I', expr: 'Cc*a^3/3', unidade: 'A' },
        { rotulo: 'Corrente envolvida por C', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: Ienv('rs') },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: `mu0*(${Ienv('rs')})` },
        { rotulo: 'Campo em s', simbolo: r`B_\varphi`, expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: `mu0*(${Ienv('rs')})/(2*pi*rs)` },
      ],
      graficos: [
        {
          titulo: 'B_φ(s) com a corrente do eixo escolhida',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.3*a', ate: '2.2*a', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: `mu0*(${Ienv('ss')})/(2*pi*ss)`, unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Corrente total',
          texto: r`$J$ não é uniforme: integramos em coroas de área $2\pi s\,ds$:

$$I = \int_0^a\frac{Cs}{2\pi}\,2\pi s\,ds = \frac{Ca^3}{3}.$$`,
          parametros: { fio: 0, rs: 0.06 },
          medidas: [0, 1],
        },
        {
          item: 'b',
          titulo: '(b) Fora do condutor',
          texto: r`A simetria cilíndrica dá $\vec B = B_\varphi(s)\hat\varphi$. Num círculo $C$ de raio $s$, coaxial:

$$2\pi sB_\varphi = \mu_0I \quad\Rightarrow\quad \vec B = \frac{\mu_0Ca^3}{6\pi s}\hat\varphi.$$`,
          parametros: { fio: 0, rs: 0.06 },
          medidas: [2, 3],
        },
        {
          item: 'c',
          titulo: '(c) Dentro do condutor',
          previsao: { pergunta: 'Dentro do condutor, B cresce com…', opcoes: ['s', 's²', 's³'], correta: 1 },
          texto: r`O caminho envolve só parte da corrente: $I_\text{env}(s) = Cs^3/3$.

$$2\pi sB_\varphi = \frac{\mu_0Cs^3}{3} \quad\Rightarrow\quad \vec B = \frac{\mu_0Cs^2}{6\pi}\hat\varphi.$$

Note a diferença para $J$ uniforme, em que $B \propto s$.`,
          parametros: { fio: 0, rs: 0.025 },
          medidas: [1, 3],
        },
        {
          item: 'd',
          titulo: '(d) Anular o campo externo',
          texto: r`Fora, o campo só depende da corrente total. Para zerá-lo, a corrente envolvida tem de ser nula:

$$I_f = -\frac{Ca^3}{3}, \quad \text{no sentido } -\hat z.$$

Dentro do condutor, o campo não se anula. Leve a corrente do eixo de 0 a 1 e veja as setas de fora sumirem.`,
          parametros: { fio: 1, rs: 0.06 },
          medidas: [1, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' }],
        etapas: [
          { titulo: '(a)', texto: r`$I = \int\vec J\cdot d\vec A = Ca^3/3$.`, passo: 0 },
          { titulo: '(b)', texto: r`$\vec B = \dfrac{\mu_0Ca^3}{6\pi s}\hat\varphi$ em $s > a$.`, passo: 1 },
          { titulo: '(c)', texto: r`$\vec B = \dfrac{\mu_0Cs^2}{6\pi}\hat\varphi$ em $s < a$.`, passo: 2 },
          { titulo: '(d)', texto: r`$I_f = Ca^3/3$ em módulo, no sentido $-\hat z$.`, passo: 3 },
        ],
        resultado: r`$I = \dfrac{Ca^3}{3}$; $\vec B = \dfrac{\mu_0Ca^3}{6\pi s}\hat\varphi$ fora e $\dfrac{\mu_0Cs^2}{6\pi}\hat\varphi$ dentro; $I_f = \dfrac{Ca^3}{3}$ em $-\hat z$.`,
        errosComuns: [
          r`Usar $J\pi s^2$ como corrente envolvida: $J$ varia com $s$.`,
          r`Esquecer a justificativa por simetria antes de aplicar Ampère.`,
          r`Dar a $I_f$ o sentido $+\hat z$: isso dobraria o campo externo.`,
        ],
        oficial: { resposta: r`$I = Ca^3/3$; $\vec B = \dfrac{\mu_0Ca^3}{6\pi s}\hat\varphi$ ($s > a$); $\vec B = \dfrac{\mu_0Cs^2}{6\pi}\hat\varphi$ ($s < a$); $|I_f| = Ca^3/3$ em $-\hat z$.` },
      },
      respostas: [
        { item: 'a', texto: r`$I = \dfrac{Ca^3}{3}$`, pontos: 1.2, criterio: 'Fluxo de J por uma seção reta, com integral em coroas.' },
        { item: 'b', texto: r`$\vec B = \dfrac{\mu_0Ca^3}{6\pi s}\hat\varphi$`, pontos: 1.5, criterio: 'Simetria, circulação e corrente envolvida.' },
        { item: 'c', texto: r`$\vec B = \dfrac{\mu_0Cs^2}{6\pi}\hat\varphi$`, pontos: 1.5, criterio: r`Corrente envolvida $Cs^3/3$ e Ampère.` },
        { item: 'd', texto: r`$I_f = \dfrac{Ca^3}{3}$, em $-\hat z$`, pontos: 1, criterio: 'Corrente total envolvida nula.' },
      ],
    },
  ],
}

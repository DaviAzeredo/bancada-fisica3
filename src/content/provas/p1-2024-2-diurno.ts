import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: sinais de cada combinação (a) a (f). */
const s1 = '(combo==2 || combo==3 || combo==6 ? -1 : 1)'
const s2 = '(combo==4 || combo==6 ? -1 : 1)'
const s3 = '(combo==1 || combo==2 || combo==6 ? -1 : 1)'

/* Objetiva 3: potencial das duas cascas. */
const Vc = (u: string, v = `(${u})`) => `sig/eps0*(a^2/max(${v}, a) + b^2/max(${v}, b))`

/* Objetiva 4 */
const v0 = 'sqrt(kk*qe^2*(Nn - nn)/(2*pi*nn*Nn*eps0*mp*R))'

/* Objetiva 5: gaussianas cilíndricas em volta de cada par. */
const Q1 = [-0.04, -0.02, 0]
const Q2 = [0.04, -0.02, 0]
const Q3 = [0, 0.035, 0]
const par = (p: number[], q: number[]) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]]
  return {
    centro: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0] as [number, number, number],
    eixo: d as [number, number, number],
    altura: Math.hypot(...d) + 0.036,
  }
}

/* Discursiva */
const Qs = (u: string, v = `(${u})`) => `2*pi*rho0*a*(min(max(${v}, a), 5*a) - a)`
const Es = (u: string) => `(${Qs(u)})/(2*pi*eps0*(${u}))`

/**
 * P1 de Física III, 2024/2, diurno, versão D (23/09/2024). Conferida com o
 * gabarito oficial: objetivas 1d, 2a, 3f, 4b, 5e, 6c, e a discursiva.
 */
export const p1_2024_2_diurno: ProvaInput = {
  id: 'p1-2024-2-diurno',
  titulo: 'P1 · 2024/2 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão D · 23/09/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Plano e esfera: campo no ponto entre eles',
      resumo: 'Superposição com σ_E = 4σ_P.',
      enunciado: r`Considere um plano infinito com densidade superficial de carga $\sigma_P > 0$ e uma esfera de raio $R$ e densidade superficial $\sigma_E = 4\sigma_P$, colocada a uma distância $2R$ do plano, como indica a figura. Ambas as distribuições são uniformes e estacionárias. Calcule o campo elétrico total $\vec E$ no ponto $\mathcal P$, que está a uma distância $R$ da esfera e $R$ do plano.`,
      figura: [
        { pagina: 1, recorte: [0.095, 0.475, 0.5, 0.6] },
        { pagina: 1, recorte: [0.2, 0.585, 0.5, 0.825] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [2, 4, 22], alvo: [0, 3.5, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade do plano', simbolo: r`\sigma_P`, valor: 1e-8, unidade: 'C/m²', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.025, unidade: 'm', min: 0.015, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'pl', tipo: 'planoInfinito', sigma: 'sig', ponto: [0, 0, 0], normal: 'y', rotulo: 'plano' },
        { id: 'esf', tipo: 'esfera', Q: '4*pi*R^2*4*sig', centro: [0, '3*R', 0], raio: 'R', oca: true, rotulo: 'esfera' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 'R', 0], rotulo: 'P' },
        { id: 'c1', tipo: 'cota', a: [0, 0, 0], b: [0, 'R', 0], deslocamento: [-0.012, 0, 0], rotulo: 'R' },
        { id: 'c2', tipo: 'cota', a: [0, 'R', 0], b: [0, '2*R', 0], deslocamento: [-0.012, 0, 0], rotulo: 'R' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo do plano em P', simbolo: 'E_P', expr: "y(Ede('pl', 0, R, 0))", unidade: 'V/m', teoria: 'sig/(2*eps0)' },
        { rotulo: 'Campo da esfera em P', simbolo: 'E_E', expr: "y(Ede('esf', 0, R, 0))", unidade: 'V/m', teoria: '0 - sig/eps0' },
        { rotulo: 'Campo total em P', simbolo: 'E_y', expr: 'y(E(0, R, 0))', unidade: 'V/m', teoria: '0 - sig/(2*eps0)' },
        { rotulo: 'Carga da esfera', simbolo: 'Q', expr: "carga('esf')", unidade: 'C', teoria: '16*pi*R^2*sig' },
      ],
      passos: [
        {
          titulo: 'Campo do plano',
          texto: r`Um plano infinito cria campo uniforme de módulo $\sigma_P/2\varepsilon_0$, apontando para longe dele. Em $\mathcal P$, acima do plano:

$$\vec E_P = \frac{\sigma_P}{2\varepsilon_0}\hat y.$$`,
          destacar: ['pl'],
          medidas: [0],
        },
        {
          titulo: 'Campo da esfera',
          previsao: { pergunta: 'Fora da esfera, seu campo é o de…', opcoes: ['uma carga pontual no centro', 'um plano', 'nada'], correta: 0 },
          texto: r`A carga é $Q = 4\pi R^2\cdot4\sigma_P = 16\pi R^2\sigma_P$. Fora da esfera, tudo se passa como se ela estivesse no centro. $\mathcal P$ está a $2R$ dele, abaixo:

$$\vec E_E = -\frac{1}{4\pi\varepsilon_0}\frac{16\pi R^2\sigma_P}{(2R)^2}\hat y = -\frac{\sigma_P}{\varepsilon_0}\hat y.$$

Atenção à distância: é $2R$ até o **centro**, não $R$.`,
          destacar: ['esf'],
          medidas: [1, 3],
        },
        {
          titulo: 'Somar',
          texto: r`$$\vec E = \frac{\sigma_P}{2\varepsilon_0}\hat y - \frac{\sigma_P}{\varepsilon_0}\hat y = -\frac{\sigma_P}{2\varepsilon_0}\hat y.$$

Alternativa **(d)**. Mude $R$: o resultado não depende dele, porque $Q$ cresce com $R^2$ e o campo cai com $R^2$.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de plano infinito', lab: 'gauss' },
          { texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Plano', texto: r`$\vec E_P = \frac{\sigma_P}{2\varepsilon_0}\hat y$.`, passo: 0 },
          { titulo: 'Esfera', texto: r`$Q = 16\pi R^2\sigma_P$, a $2R$ do ponto: $\vec E_E = -\frac{\sigma_P}{\varepsilon_0}\hat y$.`, passo: 1 },
          { titulo: 'Soma', texto: r`$\vec E = -\frac{\sigma_P}{2\varepsilon_0}\hat y$.`, passo: 2 },
        ],
        resultado: r`$\vec E = -\dfrac{\sigma_P}{2\varepsilon_0}\hat y$: alternativa **(d)**.`,
        errosComuns: [
          r`Medir a distância até a superfície da esfera, e não até o centro.`,
          r`Usar $\sigma/\varepsilon_0$ para o plano: esse é o campo perto de um condutor.`,
          r`Trocar o sentido do campo da esfera: abaixo dela, ele aponta para baixo.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec E = \dfrac{\sigma_P}{\varepsilon_0}\hat y$`, porque: r`Soma como se o campo da esfera apontasse para cima, e erra o módulo do plano.` },
        { letra: 'b', texto: r`$\vec E = -\dfrac{\sigma_P}{\varepsilon_0}\hat y$`, porque: r`É só o campo da esfera; falta o do plano.` },
        { letra: 'c', texto: r`$\vec E = \dfrac{\sigma_P}{2\varepsilon_0}\hat y$`, porque: r`É só o campo do plano, ou o resultado com o sinal trocado.` },
        { letra: 'd', texto: r`$\vec E = -\dfrac{\sigma_P}{2\varepsilon_0}\hat y$`, correta: true, porque: r`Correta: $\frac{\sigma_P}{2\varepsilon_0} - \frac{\sigma_P}{\varepsilon_0}$.` },
        { letra: 'e', texto: r`$\vec E = \vec 0$`, porque: r`Só ocorreria se os dois campos tivessem o mesmo módulo.` },
        { letra: 'f', texto: r`$\vec E = \dfrac{\sigma_P}{4\varepsilon_0}\hat y$`, porque: r`Não sai de nenhuma combinação coerente dos dois campos.` },
        { letra: 'g', texto: r`$\vec E = -\dfrac{\sigma_P}{4\varepsilon_0}\hat y$`, porque: r`Não sai de nenhuma combinação coerente dos dois campos.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Sinais para uma aceleração em +x',
      resumo: 'Três cargas: só uma combinação empurra q₃ para a direita.',
      enunciado: r`Considere duas partículas carregadas fixas, com cargas $q_1$ e $q_2$, tais que $|q_1| = |q_2|$. Uma terceira partícula, com carga $q_3$, é liberada do repouso a partir da posição inicial indicada na figura, equidistante das duas. Qual combinação de sinais das cargas é compatível com uma aceleração inicial da terceira partícula $\vec a_3 = a_3\hat x$, com $a_3 > 0$?`,
      figura: { pagina: 1, recorte: [0.515, 0.085, 0.935, 0.49] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [2, 1, 17], alvo: [2, 0, 0] } },
      parametros: [
        {
          id: 'combo',
          rotulo: 'Combinação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(a) +, +, −' },
            { valor: 2, rotulo: '(b) −, +, −' },
            { valor: 3, rotulo: '(c) −, +, +' },
            { valor: 4, rotulo: '(d) +, −, +' },
            { valor: 5, rotulo: '(e) todas +' },
            { valor: 6, rotulo: '(f) todas −' },
          ],
        },
        { id: 'Qq', rotulo: 'Módulo das cargas', simbolo: 'q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 4e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: `${s1}*Qq`, pos: [0.04, 0.03, 0], rotulo: 'q₁' },
        { id: 'q2', tipo: 'carga', q: `${s2}*Qq`, pos: [0.04, -0.03, 0], rotulo: 'q₂' },
        { id: 'q3', tipo: 'carga', q: `${s3}*Qq`, pos: [0, 0, 0], rotulo: 'q₃' },
        { id: 'F', tipo: 'seta', papel: 'forca', origem: [0, 0, 0], vetor: "F('q3')", comprimento: '2.5*cm', rotulo: 'F' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Força em x', simbolo: 'F_x', expr: "x(F('q3'))", unidade: 'N', teoria: `-0.8*k0*Qq^2/0.05^2*${s3}*(${s1} + ${s2})` },
        { rotulo: 'Força em y', simbolo: 'F_y', expr: "y(F('q3'))", unidade: 'N', teoria: `-0.6*k0*Qq^2/0.05^2*${s3}*(${s1} - ${s2})` },
      ],
      passos: [
        {
          titulo: 'A componente y tem de sumir',
          texto: r`A força em $q_3$ é a soma de duas forças de mesmo módulo, uma ao longo de cada reta. Para sobrar só $\hat x$, as componentes $y$ têm de se cancelar. Isso exige $q_1$ e $q_2$ com o **mesmo sinal**.

Com sinais opostos, a resultante é vertical. Veja em (b): a seta aponta para baixo.`,
          parametros: { combo: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'O sentido em x',
          previsao: { pergunta: 'Com q₁ e q₂ positivas, q₃ deve ser…', opcoes: ['positiva', 'negativa'], correta: 1 },
          texto: r`As cargas fixas estão à direita de $q_3$. Para acelerar para $+\hat x$, ela tem de ser **atraída**: sinal oposto ao de $q_1$ e $q_2$.

Todas de mesmo sinal, (e) ou (f), a repulsão a empurra para a esquerda.`,
          parametros: { combo: 5 },
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`$q_1$ e $q_2$ positivas, $q_3$ negativa: alternativa **(a)**.`,
          parametros: { combo: 1 },
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Coulomb e superposição', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Componente y', texto: r`Mesmo módulo e simetria: as componentes $y$ se cancelam só se $q_1$ e $q_2$ tiverem o mesmo sinal.`, passo: 0 },
          { titulo: 'Componente x', texto: r`Para $q_3$ ser atraída para a direita, seu sinal é oposto ao das outras.`, passo: 1 },
        ],
        resultado: r`$q_1 > 0$, $q_2 > 0$ e $q_3 < 0$: alternativa **(a)**.`,
        errosComuns: [
          r`Olhar só uma das cargas fixas.`,
          r`Achar que (f) serve por ter o mesmo sinal: todas iguais se repelem.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: '$q_1$ positiva, $q_2$ positiva e $q_3$ negativa.', correta: true, porque: r`Correta: atração simétrica pelas duas.` },
        { letra: 'b', texto: '$q_1$ negativa, $q_2$ positiva e $q_3$ negativa.', porque: r`Resultante vertical, para baixo.` },
        { letra: 'c', texto: '$q_1$ negativa, $q_2$ positiva e $q_3$ positiva.', porque: r`Resultante vertical, para cima.` },
        { letra: 'd', texto: '$q_1$ positiva, $q_2$ negativa e $q_3$ positiva.', porque: r`Resultante vertical, para baixo.` },
        { letra: 'e', texto: 'Todas positivas.', porque: r`Repulsão: $q_3$ vai para a esquerda.` },
        { letra: 'f', texto: 'Todas negativas.', porque: r`Repulsão: $q_3$ vai para a esquerda.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'V(r) de duas cascas concêntricas',
      resumo: 'Mesma densidade σ > 0, raios a e b.',
      enunciado: r`Considere duas cascas esféricas concêntricas, de raios $a$ e $b$, onde $b > a$. Ambas possuem a mesma densidade superficial de carga, constante e uniforme, $\sigma > 0$. Qual das figuras descreve corretamente o potencial elétrico gerado por essas cascas em função de $r$, a distância radial ao centro das esferas?`,
      figura: { pagina: 2, recorte: [0.085, 0.055, 0.5, 0.9] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [4, 5, 25], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 2e-8, unidade: 'C/m²', min: 5e-9, max: 5e-8, passo: 1e-9 },
        { id: 'a', rotulo: 'Raio menor', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'b', rotulo: 'Raio maior', simbolo: 'b', valor: 0.07, unidade: 'm', min: 0.05, max: 0.09, passo: 0.002 },
        { id: 'rP', rotulo: 'Posição da sonda', simbolo: 'r', valor: 0.015, unidade: 'm', min: 0.002, max: 0.11, passo: 0.002 },
      ],
      objetos: [
        { id: 'ca', tipo: 'esfera', Q: '4*pi*a^2*sig', centro: [0, 0, 0], raio: 'a', oca: true, rotulo: 'a' },
        { id: 'cb', tipo: 'esfera', Q: '4*pi*b^2*sig', centro: [0, 0, 0], raio: 'b', oca: true, rotulo: 'b' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rP', 0, 0], arraste: { param: 'rP', eixo: 'x' }, rotulo: 'sonda' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Potencial na sonda', simbolo: 'V', expr: 'V(rP, 0, 0)', unidade: 'V', teoria: Vc('rP') },
        { rotulo: 'V(a)', simbolo: 'V(a)', expr: 'V(a, 0, 0)', unidade: 'V', teoria: 'sig*(a + b)/eps0' },
        { rotulo: 'V(b)', simbolo: 'V(b)', expr: 'V(b, 0, 0)', unidade: 'V', teoria: 'sig*(a^2/b + b)/eps0' },
        { rotulo: 'Campo na sonda', simbolo: 'E_r', expr: 'x(E(rP, 0, 0))', unidade: 'V/m' },
      ],
      graficos: [
        {
          titulo: 'V(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: '1.8*b', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'V(rr, 0, 0)', unidade: 'V' },
            { rotulo: 'analítico', expr: Vc('rr'), unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Dentro da menor: patamar',
          previsao: { pergunta: 'O potencial no centro das cascas é…', opcoes: ['nulo', 'positivo e constante até a'], correta: 1 },
          texto: r`Em $r < a$ não há campo, então $V$ é constante. Mas não é nulo: vale o potencial de cada casca somado:

$$V(a) = k_0\frac{Q_a}{a} + k_0\frac{Q_b}{b} = \frac{\sigma}{\varepsilon_0}(a + b).$$`,
          parametros: { rP: 0.015 },
          medidas: [0, 1],
        },
        {
          titulo: 'Entre as cascas',
          texto: r`Em $a < r < b$, só a casca menor cria campo, e $V$ cai como $1/r$:

$$V(r) = k_0\frac{Q_a}{r} + k_0\frac{Q_b}{b}, \qquad V(b) = \frac{\sigma}{\varepsilon_0}\left(\frac{a^2}{b} + b\right).$$

Como $a^2/b < a$: $V(a) > V(b) > 0$.`,
          parametros: { rP: 0.05 },
          medidas: [0, 2],
        },
        {
          titulo: 'Fora',
          texto: r`Em $r > b$, as duas contribuem: $V = k_0(Q_a + Q_b)/r$. A curva é contínua, mas tem uma quina em $r = b$: o campo salta, porque há carga na casca.`,
          parametros: { rP: 0.09 },
          medidas: [0, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`Sempre positiva, patamar em $V(a)$, descendo sem saltos até $V(b)$ e depois a zero: figura **(f)**.`,
          parametros: { rP: 0.05 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de cascas esféricas', lab: 'potencial' },
          { texto: 'Continuidade do potencial' },
        ],
        etapas: [
          { titulo: 'Cargas', texto: r`$Q_a = 4\pi a^2\sigma$ e $Q_b = 4\pi b^2\sigma$.`, passo: 0 },
          { titulo: 'Valores', texto: r`$V(a) = \sigma(a+b)/\varepsilon_0$ e $V(b) = \sigma(a^2/b + b)/\varepsilon_0$, com $V(a) > V(b)$.`, passo: 1 },
          { titulo: 'Forma', texto: r`Constante até $a$, cai como $1/r$ até $b$, e cai como $1/r$ com inclinação maior depois.`, passo: 2 },
        ],
        resultado: r`Figura **(f)**.`,
        errosComuns: [
          r`Achar que $V = 0$ onde $E = 0$.`,
          r`Fazer o potencial saltar numa casca: ele é contínuo em superfícies carregadas.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Negativo até $a$, cresce até um pico em $V(b)$ e cai.', porque: r`Com $\sigma > 0$, o potencial é positivo em todo lugar.` },
        { letra: 'b', texto: 'Nulo até $a$, salta para $V(a)$ e cai.', porque: r`O potencial não salta, e não é nulo dentro.` },
        { letra: 'c', texto: 'Salta de $-V(a)$ para $V(a)$ em $r = a$.', porque: r`O potencial não salta.` },
        { letra: 'd', texto: 'Patamar em $V(a)$ e queda em reta até $V(b)$.', porque: r`Entre as cascas a curva é $1/r$, não uma reta.` },
        { letra: 'e', texto: 'Patamar em $V(a)$ e pico em $V(b) > V(a)$.', porque: r`O potencial decresce ao se afastar de cargas positivas.` },
        { letra: 'f', texto: 'Patamar em $V(a)$, queda até $V(b)$ e queda mais forte depois.', correta: true, porque: r`Correta: contínuo, positivo e decrescente, com quina em $r = b$.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Velocidade de lançamento contra uma esfera',
      resumo: 'Conservação de energia até a máxima aproximação.',
      enunciado: r`Uma partícula de massa $m$ e carga $q$ é lançada diretamente para o centro $C$ de uma esfera de raio $R$ que possui uma carga $Q = kq$ uniformemente distribuída pelo seu volume, sendo $k > 0$. Sabendo que a distância inicial da partícula para $C$ é $D = NR$ e que, após ser repelida, a máxima aproximação dela para $C$ foi de $d = nR$ (com $1 < n < N$), teremos que o módulo $v_0$ da velocidade de lançamento da partícula será:`,
      figura: { pagina: 2, recorte: [0.51, 0.05, 0.925, 0.365] },
      cena: {
        escala: 0.01,
        extensao: 12,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [5, 1, 25], alvo: [5, 0, 0] },
        tempo: { escala: 2e-7, unidade: 'ns', passo: 1e-9, duracao: 2.4e-6 },
      },
      parametros: [
        { id: 'kk', rotulo: 'Razão Q/q', simbolo: 'k', valor: 1e10, min: 5e9, max: 2e10, passo: 1e9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'Nn', rotulo: 'D/R', simbolo: 'N', valor: 5, min: 4, max: 5.5, passo: 0.5 },
        { id: 'nn', rotulo: 'd/R', simbolo: 'n', valor: 2, min: 1.2, max: 3.5, passo: 0.1 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', Q: 'kk*qe', centro: [0, 0, 0], raio: 'R', rotulo: 'Q' },
        { id: 'p', tipo: 'particula', rotulo: 'q', q: 'qe', m: 'mp', pos: ['Nn*R', 0, 0], v: [`0 - ${v0}`, 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '2*cm', rotulo: 'v' },
        { id: 'cd', tipo: 'cota', a: [0, 0, 0], b: ['nn*R', 0, 0], deslocamento: [0, -0.03, 0], rotulo: 'd' },
        { id: 'cD', tipo: 'cota', a: [0, 0, 0], b: ['Nn*R', 0, 0], deslocamento: [0, -0.045, 0], rotulo: 'D' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade de lançamento', simbolo: 'v_0', expr: v0, unidade: 'm/s' },
        { rotulo: 'Energia total (simulada)', simbolo: 'K + U', expr: "mp*mag(vel('p'))^2/2 + qe*V(pos('p'))", unidade: 'J', teoria: 'k0*kk*qe^2/(nn*R)' },
        { rotulo: 'Máxima aproximação no rastro', simbolo: 'd', ativo: 't > 1.5e-6', expr: "Nn*R - rastroSpan('p', 'x')", unidade: 'm', teoria: 'nn*R' },
      ],
      passos: [
        {
          titulo: 'Fora da esfera, carga pontual',
          texto: r`A partícula não chega a entrar na esfera ($n > 1$), e fora dela o potencial é $V = k_0Q/r$, como o de uma carga no centro.`,
        },
        {
          titulo: 'Conservação de energia',
          texto: r`Na máxima aproximação a velocidade é nula:

$$\frac12mv_0^2 + \frac{k_0qQ}{D} = \frac{k_0qQ}{d}.$$

Na cena, a soma $K + U$ se mantém durante todo o percurso.`,
          medidas: [1],
        },
        {
          titulo: 'Isolar v₀',
          previsao: { pergunta: 'Para chegar mais perto (n menor), v₀ precisa…', opcoes: ['aumentar', 'diminuir'], correta: 0 },
          texto: r`Com $Q = kq$, $D = NR$, $d = nR$ e $k_0 = 1/4\pi\varepsilon_0$:

$$v_0^2 = \frac{2k_0kq^2}{mR}\left(\frac1n - \frac1N\right) \ \Rightarrow\ v_0 = \sqrt{\frac{kq^2(N-n)}{2\pi nN\varepsilon_0mR}}.$$

Rode a simulação: a partícula para em $d$ e volta. Alternativa **(b)**.`,
          medidas: [0, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Energia potencial elétrica', lab: 'potencial' },
          { texto: 'Conservação de energia' },
        ],
        etapas: [
          { titulo: 'Energia', texto: r`$\frac12mv_0^2 + k_0qQ/D = k_0qQ/d$.`, passo: 1 },
          { titulo: 'Substituir', texto: r`$v_0 = \sqrt{\dfrac{kq^2(N-n)}{2\pi nN\varepsilon_0mR}}$.`, passo: 2 },
        ],
        resultado: r`$v_0 = \sqrt{\dfrac{kq^2(N-n)}{2\pi nN\varepsilon_0mR}}$: alternativa **(b)**.`,
        errosComuns: [
          r`Esquecer a energia potencial inicial, tomando $D$ como infinito.`,
          r`Usar a expressão do campo dentro da esfera: a partícula para antes de entrar.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$v_0 = \sqrt{\dfrac{kq^2(N+n)}{4\pi nN\varepsilon_0mR}}$`, porque: r`A diferença de potencial traz $N - n$, não $N + n$.` },
        { letra: 'b', texto: r`$v_0 = \sqrt{\dfrac{kq^2(N-n)}{2\pi nN\varepsilon_0mR}}$`, correta: true, porque: r`Correta: é a conservação de energia.` },
        { letra: 'c', texto: r`$v_0 = \sqrt{\dfrac{kq^2(N-n)}{\pi n^2\varepsilon_0mR}}$`, porque: r`O denominador deveria ter $nN$, que vem de $1/n - 1/N$.` },
        { letra: 'd', texto: r`$v_0 = \sqrt{\dfrac{nq^2(N+n)}{4\pi kN\varepsilon_0mR}}$`, porque: r`Troca $k$ e $n$, e tem sinal errado.` },
        { letra: 'e', texto: r`$v_0 = \sqrt{\dfrac{Nq^2(N-n)}{2\pi nN\varepsilon_0mR}}$`, porque: r`Põe $N$ no lugar de $k$ no numerador.` },
        { letra: 'f', texto: r`$v_0 = \sqrt{\dfrac{Nq^2(N+k)}{4\pi kN\varepsilon_0mR}}$`, porque: r`Mistura $k$ e $n$.` },
        { letra: 'g', texto: r`$v_0 = \sqrt{\dfrac{nq^2(N+n)}{\pi nN\varepsilon_0mR}}$`, porque: r`Não vem da conservação de energia.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Em quais superfícies o fluxo é nulo?',
      resumo: 'Três cargas e três superfícies que envolvem pares.',
      enunciado: r`Três partículas de cargas $Q_1 = Q$, $Q_2 = Q$ e $Q_3 = -Q$ estão em repouso no espaço. Três superfícies fechadas são consideradas: $S_1$ (com as partículas $Q_2$ e $Q_3$ em seu interior), $S_2$ (com $Q_1$ e $Q_3$ em seu interior) e $S_3$ (com $Q_1$ e $Q_2$ em seu interior). Determine as superfícies para as quais o fluxo do campo elétrico é nulo.`,
      figura: [
        { pagina: 3, recorte: [0.095, 0.115, 0.495, 0.275] },
        { pagina: 3, recorte: [0.28, 0.285, 0.46, 0.47] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [6, 6, 19], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'sup',
          rotulo: 'Superfície',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'S₁ (Q₂ e Q₃)' },
            { valor: 2, rotulo: 'S₂ (Q₁ e Q₃)' },
            { valor: 3, rotulo: 'S₃ (Q₁ e Q₂)' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 4e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'Qq', pos: Q1 as [number, number, number], rotulo: 'Q₁' },
        { id: 'c2', tipo: 'carga', q: 'Qq', pos: Q2 as [number, number, number], rotulo: 'Q₂' },
        { id: 'c3', tipo: 'carga', q: '0-Qq', pos: Q3 as [number, number, number], rotulo: 'Q₃' },
        { id: 'S1', tipo: 'gaussiana', ativo: 'sup==1', forma: 'cilindro', raio: 0.018, ...par(Q2, Q3), rotulo: 'S₁' },
        { id: 'S2', tipo: 'gaussiana', ativo: 'sup==2', forma: 'cilindro', raio: 0.018, ...par(Q1, Q3), rotulo: 'S₂' },
        { id: 'S3', tipo: 'gaussiana', ativo: 'sup==3', forma: 'cilindro', raio: 0.018, ...par(Q1, Q2), rotulo: 'S₃' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Carga dentro de S₁', simbolo: r`Q_\text{int}`, ativo: 'sup==1', expr: "Qenc('S1')", unidade: 'C', teoria: 0 },
        { rotulo: 'Carga dentro de S₂', simbolo: r`Q_\text{int}`, ativo: 'sup==2', expr: "Qenc('S2')", unidade: 'C', teoria: 0 },
        { rotulo: 'Carga dentro de S₃', simbolo: r`Q_\text{int}`, ativo: 'sup==3', expr: "Qenc('S3')", unidade: 'C', teoria: '2*Qq' },
        { rotulo: 'Fluxo por S₃', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'sup==3', expr: "fluxo('S3')", unidade: 'V·m', teoria: '2*Qq/eps0' },
        { rotulo: 'Fluxo por S₁', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'sup==1', expr: "fluxo('S1')", unidade: 'V·m' },
        { rotulo: 'Fluxo por S₂', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'sup==2', expr: "fluxo('S2')", unidade: 'V·m' },
      ],
      passos: [
        {
          titulo: 'Só a carga de dentro conta',
          texto: r`Pela lei de Gauss, $\oint\vec E\cdot d\vec A = Q_\text{int}/\varepsilon_0$. A forma da superfície não importa, nem as cargas de fora.

Na cena, as superfícies são cilindros em volta de cada par. Na prova, são formas livres; o resultado é o mesmo.`,
        },
        {
          titulo: 'S₁: Q₂ e Q₃',
          previsao: { pergunta: 'S₁ envolve Q₂ = Q e Q₃ = −Q. O fluxo é…', opcoes: ['nulo', 'Q/ε₀', '2Q/ε₀'], correta: 0 },
          texto: r`$Q_\text{int} = Q - Q = 0$. Fluxo nulo. O campo em $S_1$ não é zero: as linhas que saem de $Q_2$ entram de novo para chegar em $Q_3$.`,
          parametros: { sup: 1 },
          medidas: [0, 4],
        },
        {
          titulo: 'S₂: Q₁ e Q₃',
          texto: r`$Q_\text{int} = Q - Q = 0$. Fluxo nulo.`,
          parametros: { sup: 2 },
          medidas: [1, 5],
        },
        {
          titulo: 'S₃: Q₁ e Q₂',
          texto: r`$Q_\text{int} = 2Q$. Fluxo $2Q/\varepsilon_0$.

Resposta: apenas em $S_1$ e $S_2$, alternativa **(e)**.`,
          parametros: { sup: 3 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Contagem', texto: r`$S_1$: $Q - Q = 0$. $S_2$: $Q - Q = 0$. $S_3$: $2Q$.`, passo: 1 },
        ],
        resultado: r`Apenas em $S_1$ e $S_2$: alternativa **(e)**.`,
        errosComuns: [
          r`Contar a carga de fora da superfície.`,
          r`Achar que fluxo nulo significa campo nulo sobre a superfície.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Em nenhuma superfície.', porque: r`$S_1$ e $S_2$ têm carga interna nula.` },
        { letra: 'b', texto: 'Em todas $S_1$, $S_2$ e $S_3$.', porque: r`$S_3$ envolve $2Q$.` },
        { letra: 'c', texto: 'Apenas em $S_3$.', porque: r`É a única com fluxo **não** nulo.` },
        { letra: 'd', texto: 'Apenas em $S_2$.', porque: r`Falta $S_1$.` },
        { letra: 'e', texto: 'Apenas em $S_1$ e $S_2$.', correta: true, porque: r`Correta: as duas envolvem $Q$ e $-Q$.` },
        { letra: 'f', texto: 'Apenas em $S_1$ e $S_3$.', porque: r`$S_3$ envolve $2Q$, e falta $S_2$.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo além da ponta de um fio',
      resumo: 'Fio de comprimento a; ponto em x = 2a.',
      enunciado: r`Considere um fio não condutor de comprimento $a$ posicionado ao longo do eixo $x$, com uma extremidade na origem ($x = 0$) e a outra em $x = a$, onde $a > 0$. Uma carga $Q$ está distribuída uniformemente ao longo de seu comprimento. Qual das alternativas descreve corretamente o campo elétrico na posição $x = 2a$?`,
      figura: [
        { pagina: 3, recorte: [0.51, 0.105, 0.91, 0.215] },
        { pagina: 3, recorte: [0.63, 0.31, 0.92, 0.4] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [4, 3, 18], alvo: [4, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Comprimento', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'xP', rotulo: 'Posição de P', simbolo: 'x', valor: 0.08, unidade: 'm', min: 0.045, max: 0.13, passo: 0.001 },
      ],
      objetos: [
        { id: 'f', tipo: 'segmentoCarga', lambda: 'Qq/a', a: [0, 0, 0], b: ['a', 0, 0], rotulo: 'Q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Campo em P', simbolo: 'E_x', expr: 'x(E(xP, 0, 0))', unidade: 'V/m', teoria: 'k0*Qq/(xP*(xP - a))' },
        { rotulo: 'Campo em x = 2a', simbolo: 'E(2a)', expr: 'x(E(2*a, 0, 0))', unidade: 'V/m', teoria: 'Qq/(8*pi*eps0*a^2)' },
        { rotulo: 'Se fosse carga pontual no meio', simbolo: r`k_0Q/(1{,}5a)^2`, expr: 'k0*Qq/(1.5*a)^2', unidade: 'V/m' },
      ],
      passos: [
        {
          titulo: 'Direção',
          texto: r`O ponto está na reta do fio: todos os elementos o empurram para $+\hat x$. Não há componente $y$, e as contribuições se somam.`,
        },
        {
          titulo: 'A integral',
          previsao: { pergunta: 'Comparado a uma carga pontual Q no meio do fio, o campo real é…', opcoes: ['maior', 'igual', 'menor'], correta: 0 },
          texto: r`Com $dq = (Q/a)\,dx'$ a uma distância $x - x'$:

$$E(x) = \frac{k_0Q}{a}\int_0^a\frac{dx'}{(x - x')^2} = \frac{k_0Q}{a}\left[\frac{1}{x-a} - \frac1x\right] = \frac{k_0Q}{x(x-a)}.$$

Os elementos próximos pesam mais, porque o campo vai com $1/r^2$.`,
          medidas: [0, 2],
        },
        {
          titulo: 'Em x = 2a',
          texto: r`$$E(2a) = \frac{k_0Q}{2a\cdot a} = \frac{Q}{8\pi\varepsilon_0a^2}.$$

Alternativa **(c)**.`,
          parametros: { xP: 0.08 },
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuição contínua', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Integral', texto: r`$E(x) = \dfrac{k_0Q}{x(x-a)}$ na reta do fio.`, passo: 1 },
          { titulo: 'Valor', texto: r`Em $x = 2a$: $E = Q/8\pi\varepsilon_0a^2$, em $+\hat x$.`, passo: 2 },
        ],
        resultado: r`$\vec E = \dfrac{Q}{8\pi\varepsilon_0a^2}\hat x$: alternativa **(c)**.`,
        errosComuns: [
          r`Pôr toda a carga no centro do fio: o resultado é só aproximado.`,
          r`Usar a distância à ponta mais próxima, $a$, para toda a carga: isso dá a alternativa (e).`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{Q}{2\pi\varepsilon_0a^2}\hat x$`, porque: r`Sentido errado, e módulo 4 vezes maior.` },
        { letra: 'b', texto: r`$\dfrac{Q}{2\pi\varepsilon_0a^2}\hat y$`, porque: r`Num ponto da reta do fio não há componente $y$.` },
        { letra: 'c', texto: r`$\dfrac{Q}{8\pi\varepsilon_0a^2}\hat x$`, correta: true, porque: r`Correta: $k_0Q/[2a(2a-a)]$.` },
        { letra: 'd', texto: r`$\dfrac{Q}{\sqrt2\pi\varepsilon_0a^2}\hat x$`, porque: r`Não há $\sqrt2$: o ponto está na reta do fio.` },
        { letra: 'e', texto: r`$\dfrac{Q}{4\pi\varepsilon_0a^2}\hat x$`, porque: r`Trata toda a carga como se estivesse na ponta $x = a$.` },
        { letra: 'f', texto: r`$\dfrac{Q}{8\sqrt2\pi\varepsilon_0a^2}\hat y$`, porque: r`Não há componente $y$.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Tubo com ρ = ρ₀(a/s)',
      resumo: 'Gauss cilíndrico, gráfico de E(s) e ddp entre as faces.',
      enunciado: r`Um tubo não condutor, muito longo e vazado é delimitado, interna e externamente, por superfícies cilíndricas coaxiais de raios $a$ e $5a$. Ao longo de seu volume, o tubo possui uma distribuição de cargas com simetria axial cuja densidade volumar é $\rho(s) = \rho_0(a/s)$, onde $s$ é a distância de um ponto ao seu eixo e $\rho_0$ é constante.

(a) Assumindo superfícies gaussianas cilíndricas de comprimento arbitrário $\ell$, coaxiais ao tubo, obtenha as cargas $Q_1$ e $Q_2$ dentro das gaussianas 1, interna ao tubo ($a < s < 5a$), e 2, externa ao tubo ($s > 5a$). (b) Usando a lei de Gauss, determine o campo $\vec E$ nas duas regiões. (c) Esboce $E(s)$ em $0 \le s \le 10a$, destacando os detalhes importantes. (d) Determine a diferença de potencial $\Delta V$ entre as superfícies interna ($s = a$) e externa ($s = 5a$).`,
      figura: [
        { pagina: 4, recorte: [0.095, 0.115, 0.5, 0.97] },
        { pagina: 4, recorte: [0.515, 0.095, 0.91, 0.29] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Constante', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: -3e-6, max: 3e-6, passo: 1e-7 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.015, unidade: 'm', min: 0.015, max: 0.015 },
        { id: 'ell', rotulo: 'Comprimento da gaussiana', simbolo: r`\ell`, valor: 0.05, unidade: 'm', min: 0.02, max: 0.1, passo: 0.005 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 's', valor: 0.045, unidade: 'm', min: 0.005, max: 0.1, passo: 0.001 },
      ],
      objetos: [
        { id: 'tubo', tipo: 'cilindroInfinito', ponto: [0, 0, 0], direcao: 'z', raio: '5*a', raioInterno: 'a', rho: 'rho0*a/r', rotulo: 'tubo' },
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'rg', altura: 'ell', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro da gaussiana', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: `ell*(${Qs('rg')})` },
        { rotulo: 'Fluxo lateral', simbolo: r`2\pi s\ell E`, expr: '2*pi*rg*ell*x(E(rg, 0, 0))', unidade: 'V·m', teoria: `ell*(${Qs('rg')})/eps0` },
        { rotulo: 'Campo em s', simbolo: 'E_s', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: Es('rg') },
        { rotulo: 'Campo máximo, em s = 5a', simbolo: 'E(5a)', expr: 'x(E(5*a, 0, 0))', unidade: 'V/m', teoria: '4*rho0*a/(5*eps0)' },
        { rotulo: 'V(a) − V(5a)', simbolo: r`\Delta V`, expr: 'V(a, 0, 0) - V(5*a, 0, 0)', unidade: 'V', teoria: 'rho0*a^2/eps0*(4 - ln(5))' },
      ],
      graficos: [
        {
          titulo: 'E(s)/E(5a)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.05*a', ate: '10*a', rotulo: 's', unidade: 'm' },
          series: [{ rotulo: 'E/E(5a)', expr: 'x(E(ss, 0, 0))/(4*rho0*a/(5*eps0))', unidade: '' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Simetria e carga interna',
          texto: r`O tubo é longo e tem simetria axial: $\vec E = E(s)\hat s$. Com elementos de volume $2\pi s'\ell\,ds'$, o $s'$ cancela com o $1/s'$ da densidade:

$$Q_1 = 2\pi\ell\rho_0a\int_a^sds' = 2\pi\ell\rho_0a(s - a).$$`,
          parametros: { rg: 0.045 },
          destacar: ['G'],
          medidas: [0],
        },
        {
          item: 'a',
          titulo: '(a) Fora do tubo',
          texto: r`Para $s > 5a$, a integral vai até $5a$:

$$Q_2 = 2\pi\ell\rho_0a\cdot4a = 8\pi\ell\rho_0a^2.$$`,
          parametros: { rg: 0.09 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Campo',
          texto: r`Nas bases, $\vec E\perp d\vec A$: só a lateral conta, $2\pi s\ell E$. Portanto:

$$\vec E_1 = \frac{\rho_0a}{\varepsilon_0}\left(\frac{s-a}{s}\right)\hat s, \quad a < s < 5a,$$

$$\vec E_2 = \frac{4\rho_0a^2}{\varepsilon_0s}\hat s, \quad s > 5a.$$

Mude $\ell$: a carga e o fluxo mudam, mas o campo não.`,
          parametros: { rg: 0.045 },
          medidas: [1, 2],
        },
        {
          item: 'c',
          titulo: '(c) O gráfico',
          previsao: { pergunta: 'Na cavidade (s < a), o campo é…', opcoes: ['nulo', 'constante não nulo', 'divergente'], correta: 0 },
          texto: r`Zero até $a$, sem carga envolvida. Cresce, com concavidade para baixo, até o máximo em $5a$:

$$E(5a) = \frac{4\rho_0a}{5\varepsilon_0}.$$

Depois cai como $1/s$: em $10a$, vale metade do máximo. O campo é contínuo em toda parte.`,
          parametros: { rg: 0.075 },
          medidas: [3],
        },
        {
          item: 'd',
          titulo: '(d) Diferença de potencial',
          texto: r`Integrando $E_1$ de $a$ a $5a$:

$$V(a) - V(5a) = \frac{\rho_0a}{\varepsilon_0}\int_a^{5a}\left(1 - \frac as\right)ds = \frac{\rho_0a^2}{\varepsilon_0}(4 - \ln5).$$`,
          parametros: { rg: 0.045 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: '(a) Cargas', texto: r`$Q_1 = 2\pi\ell\rho_0a(s-a)$ e $Q_2 = 8\pi\ell\rho_0a^2$.`, passo: 0 },
          { titulo: '(b) Campo', texto: r`$\vec E_1 = \dfrac{\rho_0a}{\varepsilon_0}\dfrac{s-a}{s}\hat s$ e $\vec E_2 = \dfrac{4\rho_0a^2}{\varepsilon_0s}\hat s$.`, passo: 2 },
          { titulo: '(c) Gráfico', texto: r`Zero até $a$, máximo $4\rho_0a/5\varepsilon_0$ em $5a$, metade disso em $10a$.`, passo: 3 },
          { titulo: '(d) ddp', texto: r`$\Delta V = \dfrac{\rho_0a^2}{\varepsilon_0}(4 - \ln5)$.`, passo: 4 },
        ],
        resultado: r`$Q_1 = 2\pi\ell\rho_0a(s-a)$, $Q_2 = 8\pi\ell\rho_0a^2$; $\vec E_1 = \dfrac{\rho_0a}{\varepsilon_0}\dfrac{s-a}{s}\hat s$, $\vec E_2 = \dfrac{4\rho_0a^2}{\varepsilon_0s}\hat s$; $\Delta V = \dfrac{\rho_0a^2}{\varepsilon_0}(4 - \ln5)$.`,
        errosComuns: [
          r`Usar simetria esférica: a área lateral é $2\pi s\ell$, e o elemento de volume, $2\pi s\ell\,ds$.`,
          r`Esquecer $E_1$ na ddp, ou integrar $E_2$ dentro do tubo.`,
          r`Fazer $E$ saltar em $s = a$: não há carga superficial.`,
        ],
        oficial: {
          resposta: r`$Q_1 = 2\pi\ell\rho_0a(s-a)$; $Q_2 = 8\pi\ell\rho_0a^2$; $\vec E_1 = \dfrac{\rho_0a}{\varepsilon_0}\dfrac{s-a}{s}\hat s$; $\vec E_2 = \dfrac{4\rho_0a^2}{\varepsilon_0s}\hat s$; $\Delta V = \dfrac{\rho_0a^2}{\varepsilon_0}(4 - \ln5)$.`,
          observacao: r`O gabarito chama de $E(a)$ o valor de normalização do gráfico, $4\rho_0a/5\varepsilon_0$. É o campo na face externa, $s = 5a$; em $s = a$ o campo é nulo.`,
        },
      },
      respostas: [
        { item: 'a', texto: r`$Q_1 = 2\pi\ell\rho_0a(s-a)$; $Q_2 = 8\pi\ell\rho_0a^2$`, pontos: 1.2, criterio: 'Integração da densidade em cascas cilíndricas.' },
        { item: 'b', texto: r`$\vec E_1 = \dfrac{\rho_0a}{\varepsilon_0}\dfrac{s-a}{s}\hat s$; $\vec E_2 = \dfrac{4\rho_0a^2}{\varepsilon_0s}\hat s$`, pontos: 1.2, criterio: 'Fluxo só na lateral e lei de Gauss.' },
        { item: 'c', texto: r`Zero até $a$, cresce até $4\rho_0a/5\varepsilon_0$ em $5a$, cai como $1/s$`, pontos: 0.6, criterio: 'Formato, continuidade e o máximo.' },
        { item: 'd', texto: r`$\Delta V = \dfrac{\rho_0a^2}{\varepsilon_0}(4 - \ln5)$`, pontos: 1, criterio: r`Integral de $E_1$ entre $a$ e $5a$.` },
      ],
    },
  ],
}

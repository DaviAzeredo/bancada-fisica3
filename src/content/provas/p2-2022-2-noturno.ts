import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetivas 1 e 3: relógio deslocado por t0. */
const T = '(t + t0)'

/* Objetiva 4: campo de uma carga em movimento lento, em x, y, z. */
const campoCarga = (q: string, px: string, py: string, vx: string, vy: string) =>
  `mu0/(4*pi)*(${q})*cross([${vx}, ${vy}, 0], [x - (${px}), y - (${py}), z])/((x - (${px}))^2 + (y - (${py}))^2 + z^2 + 1e-10)^(3/2)`
const Uq = '(mu0*qe*v0/(pi*a^2))'

/* Objetiva 5: os quatro fios, de p a q, em unidades de L, em quatro quadros da cena. */
const fio = (id: string, ox: number, oy: number, pts: [number, number][], rotulo: string): ObjetoInput[] =>
  pts.slice(1).map((b, i) => ({
    id: `${id}${i}`,
    tipo: 'fio' as const,
    I: 'I0',
    a: [`${ox} + ${pts[i][0]}*L`, `${oy} + ${pts[i][1]}*L`, 0],
    b: [`${ox} + ${b[0]}*L`, `${oy} + ${b[1]}*L`, 0],
    ...(i === 0 ? { rotulo } : {}),
  }))
const curva = (f: (u: number) => [number, number]) => Array.from({ length: 33 }, (_, i) => f(i / 32))
const fioA = fio('a', -0.065, 0.04, [[0, 0], [0, 1], [1, 1], [1, -1], [2, -1], [2, 0]], '(a)')
const fioB = fio('b', 0.02, 0.04, [[0, 0], [0, 1], [2, -1], [2, 0]], '(b)')
const fioC = fio('c', -0.065, -0.04, curva((u) => [1 - Math.cos(Math.PI * u), Math.sin(Math.PI * u)]), '(c)')
const fioD = fio('d', 0.02, -0.04, curva((u) => [2 * u, Math.sin(2 * Math.PI * u)]), '(d)')
const forcaEm = (l: ObjetoInput[]) => `mag(${l.map((o) => `forca('${o.id}', 'Bz')`).join(' + ')})`

/* Objetiva 6: círculo orientado, para a circulação do campo elétrico induzido. */
const volta: [string, string, number][] = Array.from({ length: 97 }, (_, i) => {
  const f = (2 * Math.PI * i) / 96
  return [`1.5*R*${Math.cos(f)}`, `1.5*R*${Math.sin(f)}`, 0]
})

/* Objetiva 7: a barra desce a partir de h0. */
const HH = '(h0 + v0*t)'

/* Objetiva 8: arcos de 90°, como fios. */
const N = 24
const arco = (id: string, R: string, g0: number): ObjetoInput[] =>
  Array.from({ length: N }, (_, i) => {
    const ponto = (k: number): [string, string, number] => {
      const f = ((g0 + (90 * k) / N) * Math.PI) / 180
      return [`${R}*${Math.cos(f)}`, `${R}*${Math.sin(f)}`, 0]
    }
    return { id: `${id}${i}`, tipo: 'fio' as const, I: 'I0', a: ponto(i), b: ponto(i + 1) }
  })
const arcoII = arco('ar', 'R2', 0)
const arcoV = arco('av', 'R5', 180)
const somaB = (l: ObjetoInput[]) => `(${l.map((o) => `z(Bde('${o.id}', 0, 0, 0))`).join(' + ')})`

/* Objetiva 9: tempo para o próton voltar à linha das placas. */
const tVolta = '(0.02/v0 + pi*mp/(qe*B0))'

/**
 * P2 de Física III, 2022/2, noturno, versão A (15/12/2022). Conferida com o
 * gabarito oficial, que traz 1a, 2a, 3b, 4a, 5e, 6e, 7e, 8e, 9g, 10a. Só objetivas.
 * Divergência na objetiva 3: com o fluxo crescendo em +z, a corrente vista de cima
 * é horária, que é a (a); o oficial marca (b). Na objetiva 10, o enunciado diz plano
 * XY, mas J em z e as regiões em y só fazem sentido com a placa no plano XZ.
 */
export const p2_2022_2_noturno: ProvaInput = {
  id: 'p2-2022-2-noturno',
  titulo: 'P2 · 2022/2 · Noturno',
  subtitulo: 'Física III · Segunda Prova Noturna · Versão A · 15/12/2022',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fluxo de um fio numa espira retangular',
      resumo: 'B varia com a distância: o fluxo é um logaritmo.',
      enunciado: r`Considere um fio retilíneo condutor, muito longo, por onde passa uma corrente quasi-estacionária de intensidade $I = Ct$ (sendo $C$ uma constante positiva) no sentido mostrado na figura. No mesmo plano há espira condutora retangular, de lados $b$ e $h$, com seu lado mais próximo, paralelo ao fio, a uma distância $a$ deste. Calcule o fluxo do campo magnético do fio através da superfície plana definida pela espira, tomando o seu vetor normal unitário como $\hat z$.`,
      figura: { pagina: 1, recorte: [0.03, 0.33, 0.225, 0.98] },
      cena: {
        escala: 0.01,
        extensao: 7,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [3, 0.5, 16], alvo: [3, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 4 },
      },
      parametros: [
        { id: 'Cc', rotulo: 'Taxa da corrente', simbolo: 'C', valor: 10, unidade: 'A/s', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Distância ao fio', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'b', rotulo: 'Largura', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.01, max: 0.05, passo: 0.002 },
        { id: 'h', rotulo: 'Altura', simbolo: 'h', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 2, unidade: 's', min: 0.5, max: 5, passo: 0.1 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: `Cc*${T}`, ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'S', tipo: 'espiraSensora', centro: ['a + b/2', 0, 0], normal: 'z', largura: 'b', altura: 'h', eixoU: 'x', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo no lado próximo', simbolo: 'B_z', expr: 'z(B(a, 0, 0))', unidade: 'T', teoria: `0-mu0*Cc*${T}/(2*pi*a)` },
        { rotulo: 'Fluxo', simbolo: r`\Phi`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `0-mu0*h*Cc*${T}/(2*pi)*ln((a + b)/a)` },
      ],
      passos: [
        {
          titulo: 'O campo aponta contra a normal',
          previsao: { pergunta: 'À direita do fio, com corrente para cima, B aponta…', opcoes: ['para dentro da página', 'para fora da página'], correta: 0 },
          texto: r`Pela mão direita, à direita do fio $\vec B$ entra na página. Com $\hat n = \hat z$ saindo dela, o fluxo é **negativo**. Isso elimina (d), (e) e (f).`,
          medidas: [0],
        },
        {
          titulo: 'A integral',
          texto: r`O campo depende da distância $x$ ao fio. Tome faixas de altura $h$ e largura $dx$:

$$\Phi = -\int_a^{a+b}\frac{\mu_0Ct}{2\pi x}h\,dx = -\frac{\mu_0hCt}{2\pi}\ln\left(\frac{a+b}{a}\right).$$

Alternativa **(a)**.`,
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Fluxo magnético', lab: 'faraday' },
          { texto: 'Campo de um fio longo', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'Sinal', texto: r`$\vec B$ é oposto a $\hat n$: fluxo negativo.`, passo: 0 },
          { titulo: 'Integral', texto: r`$\Phi = -\dfrac{\mu_0hCt}{2\pi}\ln\dfrac{a+b}{a}$.`, passo: 1 },
        ],
        resultado: r`$\Phi = -\dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a+b}{a}\right)$: alternativa **(a)**.`,
        errosComuns: [
          r`Multiplicar o campo em um ponto pela área: $B$ varia ao longo da espira.`,
          r`Errar os limites: a integral vai de $a$ a $a + b$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\Phi = -\dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a+b}{a}\right)$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$\Phi = -\dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a-b}{a}\right)$`, porque: r`O limite superior é $a + b$.` },
        { letra: 'c', texto: r`$\Phi = -\dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a+b}{b}\right)$`, porque: r`O limite inferior é $a$.` },
        { letra: 'd', texto: r`$\Phi = \dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a+b}{a}\right)$`, porque: r`Sinal trocado: $\vec B$ é oposto a $\hat z$.` },
        { letra: 'e', texto: r`$\Phi = \dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a-b}{a}\right)$`, porque: r`Sinal e limite errados.` },
        { letra: 'f', texto: r`$\Phi = \dfrac{\mu_0hCt}{2\pi}\ln\left(\dfrac{a+b}{b}\right)$`, porque: r`Sinal e limite errados.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Esfera dividida em duas calotas',
      resumo: 'Fluxos opostos: mesmo módulo e sinais contrários.',
      enunciado: r`Uma superfície esférica imaginária $\mathcal S$ encontra-se imersa em uma região de campo magnético uniforme. Ela é dividida por um plano imaginário em duas superfícies abertas $\mathcal S_1$ e $\mathcal S_2$, que permanecem unidas. Sobre essa situação, considere as seguintes afirmativas: (I) O fluxo de campo magnético através de $\mathcal S$ é nulo; (II) O fluxo de campo magnético através de $\mathcal S_1$ tem sempre o mesmo módulo que o fluxo de campo magnético através de $\mathcal S_2$; (III) Com a escolha usual de orientação do vetor normal para $\mathcal S$ (para fora), o fluxo de campo magnético através de $\mathcal S_1$ tem sempre o mesmo sinal que o fluxo de campo magnético através de $\mathcal S_2$. São VERDADEIRAS as afirmativas:`,
      figura: { pagina: 1, recorte: [0.24, 0.33, 0.43, 0.82] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [10, 7, 13], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'ang', rotulo: 'Ângulo entre B e a normal do corte', simbolo: r`\theta`, valor: 20, unidade: '°', min: 0, max: 80, passo: 5 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'hc', rotulo: 'Altura do corte', simbolo: 'h', valor: 0.02, unidade: 'm', min: 0, max: 0.04, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bu', tipo: 'campoB', valor: ['B0*sin(rad(ang))', 'B0*cos(rad(ang))', 0], rotulo: 'B' },
        { id: 'S', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'R', campo: 'B', rotulo: 'S' },
        { id: 'D', tipo: 'espiraSensora', centro: [0, 'hc', 0], normal: 'y', raio: 'sqrt(R^2 - hc^2)', rotulo: 'corte' },
      ],
      visual: { setasB: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo por S', simbolo: r`\Phi_S`, expr: "fluxo('S')", unidade: 'Wb', teoria: 0 },
        { rotulo: 'Fluxo pela calota de cima (para fora)', simbolo: r`\Phi_1`, expr: "fluxoB('D')", unidade: 'Wb', teoria: 'B0*cos(rad(ang))*pi*(R^2 - hc^2)' },
        { rotulo: 'Fluxo pela calota de baixo (para fora)', simbolo: r`\Phi_2`, expr: "fluxo('S') - fluxoB('D')", unidade: 'Wb', teoria: '0-B0*cos(rad(ang))*pi*(R^2 - hc^2)' },
      ],
      passos: [
        {
          titulo: '(I) A superfície fechada',
          texto: r`Pela lei de Gauss do magnetismo, $\oint\vec B\cdot d\vec A = 0$ para qualquer superfície fechada. **Verdadeira.**`,
          medidas: [0],
        },
        {
          titulo: '(II) O mesmo módulo',
          texto: r`As duas calotas somam a esfera: $\Phi_1 + \Phi_2 = 0$. Logo, $|\Phi_1| = |\Phi_2|$, onde quer que o corte seja feito. **Verdadeira.**

A cena obtém $\Phi_1$ pelo disco do corte: as linhas que cruzam o disco são as mesmas que saem pela calota.`,
          medidas: [1, 2],
        },
        {
          titulo: '(III) Os sinais',
          previsao: { pergunta: 'Com normal para fora, Φ₁ e Φ₂ têm…', opcoes: ['o mesmo sinal', 'sinais opostos'], correta: 1 },
          texto: r`Se $\Phi_1 + \Phi_2 = 0$ e não são nulos, os sinais são **opostos**: o que entra por uma calota sai pela outra. **Falsa.**

Alternativa **(a)**.`,
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss do magnetismo', lab: 'gauss' }],
        etapas: [
          { titulo: '(I)', texto: r`Verdadeira: $\oint\vec B\cdot d\vec A = 0$.`, passo: 0 },
          { titulo: '(II)', texto: r`Verdadeira: $\Phi_1 = -\Phi_2$.`, passo: 1 },
          { titulo: '(III)', texto: r`Falsa: os sinais são opostos.`, passo: 2 },
        ],
        resultado: r`Apenas (I) e (II): alternativa **(a)**.`,
        errosComuns: [
          r`Esquecer a orientação: com normal para fora, entrar conta negativo.`,
          r`Achar que (II) só vale com o corte no equador: vale para qualquer plano.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I e II.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'Apenas I e III.', porque: r`(III) é falsa.` },
        { letra: 'c', texto: 'Apenas II e III.', porque: r`(III) é falsa, e (I) é verdadeira.` },
        { letra: 'd', texto: 'Apenas I.', porque: r`(II) também é verdadeira.` },
        { letra: 'e', texto: 'Apenas II.', porque: r`(I) também é verdadeira.` },
        { letra: 'f', texto: 'Apenas III.', porque: r`(III) é falsa.` },
        { letra: 'g', texto: 'Nenhuma.', porque: r`(I) e (II) são verdadeiras.` },
        { letra: 'h', texto: 'Todas.', porque: r`(III) é falsa.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Espira num campo com duas componentes',
      resumo: 'Só a componente normal conta. O gabarito inverte o sentido.',
      enunciado: r`Uma espira condutora em forma de quadrado com lado $L$ e resistência total $R$ é colocada no plano $XY$ de um sistema de coordenadas. Ela está imersa em uma região do espaço onde existe um campo magnético uniforme, mas não estacionário, dado por $\vec B = 2\beta t\,\hat x + (\alpha + \beta t)\,\hat z$, onde $\alpha > 0$ e $\beta > 0$. Nessa situação, a intensidade e o sentido da corrente induzida na espira (quando vista da porção positiva do eixo $Z$), são, respectivamente:`,
      figura: { pagina: 1, recorte: [0.53, 0.01, 0.73, 0.46] },
      cena: {
        escala: 0.01,
        extensao: 6,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, -5, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 4 },
      },
      parametros: [
        { id: 'al', rotulo: 'Constante', simbolo: r`\alpha`, valor: 0.2, unidade: 'T', min: 0.05, max: 0.5, passo: 0.05 },
        { id: 'be', rotulo: 'Taxa', simbolo: r`\beta`, valor: 0.1, unidade: 'T/s', min: 0.02, max: 0.3, passo: 0.01 },
        { id: 'L', rotulo: 'Lado', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.02, max: 0.5, passo: 0.02 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 1, unidade: 's', min: 0, max: 5, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bt', tipo: 'campoB', valor: [`2*be*${T}`, 0, `al + be*${T}`], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', largura: 'L', altura: 'L', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `(al + be*${T})*L^2` },
        { rotulo: 'fem (positiva: anti-horária, vista de +z)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: '0-be*L^2' },
        { rotulo: 'Corrente (positiva: anti-horária)', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: '0-be*L^2/Rr' },
      ],
      passos: [
        {
          titulo: 'Só a componente normal',
          texto: r`A espira está no plano $XY$: a componente em $\hat x$ é paralela a ela e não dá fluxo.

$$\Phi_B = (\alpha + \beta t)L^2.$$`,
          medidas: [0],
        },
        {
          titulo: 'A intensidade',
          texto: r`$$|\mathcal E| = \frac{d\Phi_B}{dt} = \beta L^2 \quad\Rightarrow\quad I = \frac{\beta L^2}{R}.$$

O $\alpha$ constante não aparece, e a corrente é constante.`,
          medidas: [1],
        },
        {
          titulo: 'O sentido',
          previsao: { pergunta: 'Com o fluxo crescendo em +z, a corrente vista de +z circula…', opcoes: ['no sentido horário', 'no sentido anti-horário'], correta: 0 },
          texto: r`O fluxo cresce ao longo de $+\hat z$. Pela lei de Lenz, a corrente produz campo em $-\hat z$ no interior. Olhando de $+z$ para a espira, isso é o sentido **horário**: alternativa **(a)**.

Na cena, $I < 0$ quer dizer horário.`,
          medidas: [2],
        },
        {
          titulo: 'O gabarito marca a (b)',
          texto: r`O gabarito oficial indica anti-horário. Mas o sentido anti-horário, visto de $+z$, produz campo em $+\hat z$ no interior, reforçando o aumento do fluxo, o que contraria Lenz.

A intensidade é a mesma; a divergência é só no sentido. Com $\mathcal E = -d\Phi_B/dt$ e normal $\hat z$, a resposta é a **(a)**.`,
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e de Lenz', lab: 'faraday' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`$\Phi_B = (\alpha + \beta t)L^2$.`, passo: 0 },
          { titulo: 'Corrente', texto: r`$I = \beta L^2/R$.`, passo: 1 },
          { titulo: 'Sentido', texto: r`Horário, visto de $+z$.`, passo: 2 },
          { titulo: 'Gabarito', texto: r`O oficial marca (b), anti-horário.`, passo: 3 },
        ],
        resultado: r`$I = \dfrac{\beta L^2}{R}$, no sentido horário: alternativa **(a)**.`,
        errosComuns: [
          r`Incluir a componente $x$ no fluxo: ela é paralela à espira.`,
          r`Usar o fluxo em vez da derivada: isso leva a $(\alpha + \beta t)L^2/R$.`,
        ],
        oficial: {
          resposta: '(b)',
          observacao: r`**Divergência com o gabarito oficial.** Ele marca (b), anti-horário. Pela lei de Lenz, com o fluxo crescendo em $+\hat z$, a corrente vista de $+z$ é horária, e a simulação confirma: $\mathcal E < 0$ com normal $\hat z$.`,
        },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\beta L^2}{R}$, horário.`, correta: true, porque: r`Correta pela lei de Lenz. O gabarito oficial marca a (b).` },
        { letra: 'b', texto: r`$\dfrac{\beta L^2}{R}$, anti-horário.`, porque: r`É a marcada pelo gabarito oficial, mas esse sentido reforçaria o aumento do fluxo.` },
        { letra: 'c', texto: r`$\dfrac{(\alpha + \beta t)L^2}{R}$, anti-horário.`, porque: r`Usa o fluxo, não a derivada.` },
        { letra: 'd', texto: r`$\dfrac{(\alpha + \beta t)L^2}{R}$, horário.`, porque: r`Usa o fluxo, não a derivada.` },
        { letra: 'e', texto: r`$\dfrac{2\beta L^2}{R}$, horário.`, porque: r`Usa a componente $x$, que não dá fluxo.` },
        { letra: 'f', texto: r`$\dfrac{2\beta L^2}{R}$, anti-horário.`, porque: r`Usa a componente $x$, que não dá fluxo.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo de duas cargas em movimento',
      resumo: 'Cada carga contribui com q v × r̂ / r².',
      enunciado: r`Em um dado instante, temos duas partículas, 1 e 2, com cargas elétricas $q_1 = e$ e $q_2 = -e$, velocidades $\vec v_1 = v_0(-\hat x + \hat y)$ e $\vec v_2 = v_0(\hat x + \hat y)$ ($v_0 > 0$), nas posições $\vec r_1 = a\hat x$ e $\vec r_2 = 2a\hat y$ ($a > 0$). Determine, nesse mesmo instante, o campo magnético resultante na origem do sistema de coordenadas cartesianas correspondente, supondo que tais partículas se movem com velocidades constantes suficientemente baixas.`,
      figura: { pagina: 1, recorte: [0.53, 0.55, 0.73, 0.965] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [1, 2, 18], alvo: [1, 2, 0] } },
      parametros: [
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v_0', valor: 1e6, unidade: 'm/s', min: 2e5, max: 3e6, passo: 1e5 },
        { id: 'a', rotulo: 'Distância', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'qe', pos: ['a', 0, 0], rotulo: 'q₁ = e' },
        { id: 'c2', tipo: 'carga', q: '0-qe', pos: [0, '2*a', 0], rotulo: 'q₂ = −e' },
        { id: 'B1', tipo: 'campoB', valor: campoCarga('qe', 'a', '0', '0-v0', 'v0'), rotulo: 'B de q₁' },
        { id: 'B2', tipo: 'campoB', valor: campoCarga('0-qe', '0', '2*a', 'v0', 'v0'), rotulo: 'B de q₂' },
        { id: 'v1', tipo: 'seta', papel: 'v', origem: ['a', 0, 0], vetor: [-1, 1, 0], comprimento: '2.5*cm', rotulo: 'v₁' },
        { id: 'v2', tipo: 'seta', papel: 'v', origem: [0, '2*a', 0], vetor: [1, 1, 0], comprimento: '2.5*cm', rotulo: 'v₂' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Parcela de q₁, em μ₀ev₀/πa²', simbolo: r`B_1/U`, expr: `z(Bde('B1', 0, 0, 0))/${Uq}`, teoria: '1/4' },
        { rotulo: 'Parcela de q₂, em μ₀ev₀/πa²', simbolo: r`B_2/U`, expr: `z(Bde('B2', 0, 0, 0))/${Uq}`, teoria: '1/16' },
        { rotulo: 'Total, em μ₀ev₀/πa²', simbolo: r`B/U`, expr: `z(B(0, 0, 0))/${Uq}`, teoria: '5/16' },
      ],
      passos: [
        {
          titulo: 'A partícula 1',
          texto: r`Da carga até a origem, $\hat r = -\hat x$. Só a componente de $\vec v_1$ perpendicular a $\hat r$ conta: $\hat y\times(-\hat x) = +\hat z$.

$$\vec B_1 = \frac{\mu_0}{4\pi}\frac{ev_0}{a^2}\hat z.$$`,
          medidas: [0],
        },
        {
          titulo: 'A partícula 2',
          previsao: { pergunta: 'A carga −e, com v₂ e r̂ = −ŷ, contribui em…', opcoes: ['+ẑ', '−ẑ'], correta: 0 },
          texto: r`Agora $\hat r = -\hat y$, a distância é $2a$, e $\hat x\times(-\hat y) = -\hat z$. A carga é negativa, o que inverte o sinal:

$$\vec B_2 = \frac{\mu_0}{4\pi}\frac{ev_0}{4a^2}\hat z.$$`,
          medidas: [1],
        },
        {
          titulo: 'Soma',
          texto: r`$$\vec B = \frac{\mu_0ev_0}{4\pi a^2}\left(1 + \frac14\right)\hat z = \frac{5}{16}\frac{\mu_0ev_0}{\pi a^2}\hat z.$$

Alternativa **(a)**.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de uma carga em movimento', lab: 'lorentz' }],
        etapas: [
          { titulo: 'q₁', texto: r`$\vec B_1 = \dfrac{\mu_0ev_0}{4\pi a^2}\hat z$.`, passo: 0 },
          { titulo: 'q₂', texto: r`$\vec B_2 = \dfrac{\mu_0ev_0}{16\pi a^2}\hat z$.`, passo: 1 },
          { titulo: 'Soma', texto: r`$\vec B = \dfrac{5}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$.`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{5}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$: alternativa **(a)**.`,
        errosComuns: [
          r`Esquecer o sinal de $q_2$: isso dá o $\frac{3}{16}$ das alternativas (b) e (f).`,
          r`Usar $\hat r$ da origem até a carga: ele vai da carga até o ponto de observação.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{5}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$-\dfrac{3}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, porque: r`Esquece o sinal de $q_2$ e inverte o resultado.` },
        { letra: 'c', texto: r`$-\dfrac{19}{36}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, porque: r`Fatores de distância errados.` },
        { letra: 'd', texto: r`$-\dfrac{17}{4}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, porque: r`Fatores de distância errados.` },
        { letra: 'e', texto: r`$-\dfrac{5}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, porque: r`O módulo está certo, mas o sentido é $+\hat z$.` },
        { letra: 'f', texto: r`$\dfrac{3}{16}\dfrac{\mu_0ev_0}{\pi a^2}\hat z$`, porque: r`Esquece o sinal de $q_2$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quatro fios entre os mesmos dois pontos',
      resumo: 'Em campo uniforme, só importa o vetor de p a q.',
      enunciado: r`Quatro fios condutores planos, mostrados nos painéis de (a) a (d), são todos percorridos por uma corrente estacionária $I$; em todos eles a distância entre o ponto $p$ e o ponto $q$ é a mesma, igual a $2L$. Todos eles estão sujeitos a um mesmo campo magnético constante (estacionário e uniforme), com sentido indicado na figura. Em relação ao módulo da força magnética, $F_i$ ($i = a, b, c, d$) sobre o trecho do fio entre os pontos $p$ e $q$, podemos afirmar que:`,
      figura: { pagina: 1, recorte: [0.73, 0.01, 0.94, 0.55] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.2, unidade: 'T', min: 0.05, max: 0.5, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.015, max: 0.022, passo: 0.001 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        ...fioA,
        ...fioB,
        ...fioC,
        ...fioD,
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy', fontes: ['Bz'] },
      medidas: [
        { rotulo: 'Força em (a)', simbolo: 'F_a', expr: forcaEm(fioA), unidade: 'N', teoria: 'I0*2*L*B0' },
        { rotulo: 'Força em (b)', simbolo: 'F_b', expr: forcaEm(fioB), unidade: 'N', teoria: 'I0*2*L*B0' },
        { rotulo: 'Força em (c)', simbolo: 'F_c', expr: forcaEm(fioC), unidade: 'N', teoria: 'I0*2*L*B0' },
        { rotulo: 'Força em (d)', simbolo: 'F_d', expr: forcaEm(fioD), unidade: 'N', teoria: 'I0*2*L*B0' },
      ],
      passos: [
        {
          titulo: 'Campo uniforme sai da integral',
          previsao: { pergunta: 'Com B uniforme, a força depende da forma do fio?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`$$\vec F = I\int_p^qd\vec\ell\times\vec B = I\left(\int_p^qd\vec\ell\right)\times\vec B = I\,\overrightarrow{pq}\times\vec B.$$

A soma dos $d\vec\ell$ é só o vetor que vai de $p$ a $q$, qualquer que seja o caminho.`,
        },
        {
          titulo: 'Todos iguais',
          texto: r`O vetor $\overrightarrow{pq}$ é o mesmo nos quatro, e $F = 2ILB$. A cena soma trecho a trecho, e o resultado é o mesmo. Alternativa **(e)**.`,
          medidas: [0, 1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }],
        etapas: [
          { titulo: 'Integral', texto: r`$\vec F = I\,\overrightarrow{pq}\times\vec B$.`, passo: 0 },
          { titulo: 'Resultado', texto: r`$F = 2ILB$ nos quatro.`, passo: 1 },
        ],
        resultado: r`$F_a = F_b = F_c = F_d$: alternativa **(e)**.`,
        errosComuns: [
          r`Usar o comprimento total do fio: o que conta é o deslocamento de $p$ a $q$.`,
          r`Esquecer que os trechos de lados opostos se cancelam em parte.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$F_a \ge F_b \ge F_c \ge F_d$`, porque: r`Os quatro são iguais.` },
        { letra: 'b', texto: r`$F_a = F_c \le F_d = F_b$`, porque: r`Os quatro são iguais.` },
        { letra: 'c', texto: r`$F_a = F_b \le F_c = F_d$`, porque: r`Os quatro são iguais.` },
        { letra: 'd', texto: r`$F_a = F_b \ge F_c = F_d$`, porque: r`Os quatro são iguais.` },
        { letra: 'e', texto: r`$F_a = F_b = F_c = F_d$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Haste com cargas fora de um campo que cai',
      resumo: 'As cargas estão fora de B, mas sentem o E induzido.',
      enunciado: r`Um campo magnético uniforme atua apenas em uma região do espaço definida por um disco circular de raio $R$ e aponta para fora do plano do papel, como mostrado na figura. Duas partículas idênticas de carga $q > 0$, unidas por uma haste isolante rígida de comprimento $4R$, são posicionadas de modo que o eixo da haste é perpendicular à direção do campo e o centro dela coincide com o centro dessa região. Sabendo que a haste encontra-se inicialmente em repouso e que a intensidade do campo magnético diminui lentamente com o tempo, podemos afirmar que:`,
      figura: { pagina: 2, recorte: [0.03, 0.01, 0.225, 0.71] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, 0, 18], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 3 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo inicial', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.3, max: 1, passo: 0.05 },
        { id: 'kk', rotulo: 'Taxa de queda', simbolo: '|dB/dt|', valor: 0.1, unidade: 'T/s', min: 0.02, max: 0.1, passo: 0.01 },
        { id: 'R', rotulo: 'Raio da região', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.02, max: 0.035, passo: 0.001 },
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'Bd', tipo: 'campoB', valor: [0, 0, 'mag([x, y, 0]) < R ? B0 - kk*t : 0'], rotulo: 'B(t)' },
        { id: 'Ei', tipo: 'campoE', valor: '(mag([x, y, 0]) < R ? kk/2 : kk*R^2/(2*(x^2 + y^2 + 1e-12)))*[0-y, x, 0]', rotulo: 'E induzido' },
        { id: 'Sa', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: 'R', oculta: true },
        { id: 'c1', tipo: 'carga', q: 'qq', pos: ['2*R', 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: 'qq', pos: ['-2*R', 0, 0], rotulo: 'q' },
        { id: 'haste', tipo: 'caminho', seta: 0, pontos: [['-2*R', 0, 0], ['2*R', 0, 0]], rotulo: 'haste' },
        { id: 'C', tipo: 'caminho', tracejado: true, pontos: volta, rotulo: 'C' },
        { id: 'F1', tipo: 'seta', papel: 'forca', origem: ['2*R', 0, 0], vetor: [0, 1, 0], comprimento: '2.5*cm', rotulo: 'F' },
        { id: 'F2', tipo: 'seta', papel: 'forca', origem: ['-2*R', 0, 0], vetor: [0, -1, 0], comprimento: '2.5*cm', rotulo: 'F' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy', fontes: ['Ei'] },
      medidas: [
        { rotulo: 'Campo magnético em q', simbolo: 'B', expr: 'mag(B(2*R, 0, 0))', unidade: 'T', teoria: 0 },
        { rotulo: 'fem na região do campo', simbolo: r`\mathcal E`, expr: "fem('Sa')", unidade: 'V', teoria: 'pi*R^2*kk' },
        { rotulo: 'Circulação de E num círculo de raio 1,5R', simbolo: r`\oint\vec E\cdot d\vec\ell`, expr: "intE('C')", unidade: 'V', teoria: 'pi*R^2*kk' },
        { rotulo: 'Campo induzido em q', simbolo: 'E_q', expr: "y(Ede('Ei', 2*R, 0, 0))", unidade: 'V/m', teoria: 'kk*R/4' },
        { rotulo: 'Torque por qR² (positivo: anti-horário)', simbolo: r`\tau/qR^2`, expr: "z(cross([2*R, 0, 0], qq*Ede('Ei', 2*R, 0, 0)) + cross([-2*R, 0, 0], qq*Ede('Ei', -2*R, 0, 0)))/(qq*R^2)", unidade: 'T/s', teoria: 'kk' },
      ],
      passos: [
        {
          titulo: 'As cargas estão fora do campo',
          texto: r`As partículas estão a $2R$ do centro, onde $\vec B = \vec 0$, e além disso em repouso: não há força magnética sobre elas.`,
          medidas: [0],
        },
        {
          titulo: 'Campo elétrico induzido',
          previsao: { pergunta: 'Com B para fora diminuindo, o E induzido circula…', opcoes: ['no sentido horário', 'no sentido anti-horário'], correta: 1 },
          texto: r`O fluxo para fora diminui. Pela lei de Faraday, surge um campo elétrico circular **mesmo fora da região** de $\vec B$, no sentido que tenta manter o fluxo: **anti-horário**.

$$\oint\vec E\cdot d\vec\ell = -\frac{d\Phi_B}{dt} = \pi R^2\left|\frac{dB}{dt}\right|.$$`,
          medidas: [1, 2],
        },
        {
          titulo: 'O torque',
          texto: r`Em $r = 2R$, $E = \frac{R}{4}\left|\frac{dB}{dt}\right|$. As duas forças formam um binário, no sentido anti-horário.

A haste gira nesse sentido, por causa da força **elétrica**. Alternativa **(e)**.`,
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e campo induzido', lab: 'faraday' }],
        etapas: [
          { titulo: 'Sem força magnética', texto: r`Repouso e $\vec B = \vec 0$ em $r = 2R$.`, passo: 0 },
          { titulo: 'Campo induzido', texto: r`$\vec E$ anti-horário, também fora da região.`, passo: 1 },
          { titulo: 'Torque', texto: r`Binário anti-horário.`, passo: 2 },
        ],
        resultado: r`A haste gira no sentido anti-horário, pela força elétrica: alternativa **(e)**.`,
        errosComuns: [
          r`Achar que fora de $\vec B$ nada acontece: o campo $\vec E$ induzido não fica restrito à região do campo.`,
          r`Inverter o sentido: Lenz tenta manter o fluxo que está caindo.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'A haste girará em sentido horário, devido ao torque gerado pela força elétrica.', porque: r`O campo induzido é anti-horário.` },
        { letra: 'b', texto: 'A haste girará em sentido horário, devido ao torque gerado pela força magnética.', porque: r`Não há força magnética em repouso.` },
        { letra: 'c', texto: 'A haste girará em sentido anti-horário, devido ao torque gerado pela força magnética.', porque: r`O sentido está certo, mas a força é elétrica.` },
        { letra: 'd', texto: 'A haste permanecerá em repouso, uma vez que a força resultante sobre ela é nula.', porque: r`A resultante é nula, mas o torque não.` },
        { letra: 'e', texto: 'A haste girará em sentido anti-horário, devido ao torque gerado pela força elétrica.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 7 ───────────────────────── */
    {
      id: 'obj7',
      numero: '7',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Barra descendo sob um fio',
      resumo: 'A força magnética separa as cargas ao longo da barra.',
      enunciado: r`Um fio condutor fino e infinito transporta uma corrente estacionária de intensidade $I$, como mostrado na figura abaixo. Uma barra condutora fina, paralela ao fio, desloca-se para baixo com velocidade constante $\vec v$, como indicado. Considere os pontos A, B e C da barra mostrados na figura e sejam $V_A$, $V_B$ e $V_C$ os potenciais elétricos nestes pontos após estabelecido o equilíbrio de cargas, respectivamente. Nessa situação, podemos afirmar que:`,
      figura: { pagina: 2, recorte: [0.24, 0.01, 0.43, 0.5] },
      cena: {
        escala: 0.01,
        extensao: 7,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, -3, 16], alvo: [0, -3, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 3 },
      },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 50, unidade: 'A', min: 10, max: 100, passo: 5 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 0.02, unidade: 'm/s', min: 0.005, max: 0.03, passo: 0.001 },
        { id: 'h0', rotulo: 'Distância inicial', simbolo: 'h', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.04, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: '0-I0', ponto: [0, 0, 0], direcao: 'x', rotulo: 'I' },
        { id: 'barra', tipo: 'caminho', seta: 0, pontos: [['-L/2', `0-${HH}`, 0], ['L/2', `0-${HH}`, 0]], rotulo: 'barra' },
        { id: 'A', tipo: 'rotulo', pos: ['-L/2', `0.006 - ${HH}`, 0], texto: 'A' },
        { id: 'Bp', tipo: 'rotulo', pos: [0, `0.006 - ${HH}`, 0], texto: 'B' },
        { id: 'C', tipo: 'rotulo', pos: ['L/2', `0.006 - ${HH}`, 0], texto: 'C' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [0, `0-${HH}`, 0], vetor: [0, -1, 0], comprimento: '2*cm', rotulo: 'v' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: [0.015, `0-${HH}`, 0], vetor: [-1, 0, 0], comprimento: '1.5*cm', rotulo: 'F em +q' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo na barra (positivo: para fora)', simbolo: 'B_z', expr: `z(B(0, 0-${HH}, 0))`, unidade: 'T', teoria: `mu0*I0/(2*pi*${HH})` },
        { rotulo: 'Força por carga, em x', simbolo: r`(\vec v\times\vec B)_x`, expr: `x(cross([0, 0-v0, 0], B(0, 0-${HH}, 0)))`, unidade: 'V/m', teoria: `0-v0*mu0*I0/(2*pi*${HH})` },
        { rotulo: 'Diferença V_A − V_B', simbolo: 'V_A - V_B', expr: `v0*z(B(0, 0-${HH}, 0))*L/2`, unidade: 'V', teoria: `v0*mu0*I0*L/(4*pi*${HH})` },
        { rotulo: 'Diferença V_B − V_C', simbolo: 'V_B - V_C', expr: `v0*z(B(0, 0-${HH}, 0))*L/2`, unidade: 'V', teoria: `v0*mu0*I0*L/(4*pi*${HH})` },
      ],
      passos: [
        {
          titulo: 'O campo na barra',
          texto: r`Com a corrente para a esquerda, abaixo do fio $\vec B$ sai da página.`,
          medidas: [0],
        },
        {
          titulo: 'Força sobre as cargas',
          previsao: { pergunta: 'Sobre uma carga positiva da barra, a força magnética aponta para…', opcoes: ['a esquerda (A)', 'a direita (C)'], correta: 0 },
          texto: r`$\vec v$ para baixo e $\vec B$ para fora: $\vec v\times\vec B$ aponta para a **esquerda**. As cargas positivas se acumulam em A, e as negativas em C.`,
          medidas: [1],
        },
        {
          titulo: 'Equilíbrio',
          texto: r`As cargas separadas criam um campo elétrico de A para C, que equilibra a força magnética. O potencial cai de A para C:

$$V_A > V_B > V_C.$$

Alternativa **(e)**.`,
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'fem de movimento', lab: 'faraday' },
        ],
        etapas: [
          { titulo: 'Campo', texto: r`$\vec B$ sai da página.`, passo: 0 },
          { titulo: 'Força', texto: r`$\vec v\times\vec B$ aponta para A.`, passo: 1 },
          { titulo: 'Potencial', texto: r`$V_A > V_B > V_C$.`, passo: 2 },
        ],
        resultado: r`$V_A > V_B > V_C$: alternativa **(e)**.`,
        errosComuns: [
          r`Errar o sentido de $\vec B$: a corrente vai para a esquerda.`,
          r`Achar que os potenciais são iguais por a barra ser condutora: em movimento no campo, há fem.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$V_C > V_B > V_A$`, porque: r`Inverte o sentido da força magnética.` },
        { letra: 'b', texto: r`$V_B > V_A > V_C$`, porque: r`O potencial varia monotonamente ao longo da barra.` },
        { letra: 'c', texto: r`$V_B > V_C > V_A$`, porque: r`O potencial varia monotonamente ao longo da barra.` },
        { letra: 'd', texto: r`$V_A = V_B = V_C$`, porque: r`Em movimento no campo, há separação de cargas.` },
        { letra: 'e', texto: r`$V_A > V_B > V_C$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 8 ───────────────────────── */
    {
      id: 'obj8',
      numero: '8',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Qual segmento contribui mais',
      resumo: 'Retas alinhadas com C não contam; o arco menor vence.',
      enunciado: r`Dois fios muito longos são percorridos por correntes elétricas estacionárias de mesma intensidade. Cada um de tais fios é constituído por dois segmentos retilíneos (muito longos) e por um arco circular intermediário (com abertura de $90°$); os raios de tais arcos são tais que $R_{II} > R_V$. Qual dos segmentos dá maior contribuição para o campo magnético resultante $\vec B(\mathcal C)$ no ponto central $\mathcal C$?`,
      figura: { pagina: 2, recorte: [0.53, 0.01, 0.73, 0.585] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'R2', rotulo: 'Raio do arco II', simbolo: 'R_{II}', valor: 0.05, unidade: 'm', min: 0.04, max: 0.06, passo: 0.002 },
        { id: 'R5', rotulo: 'Raio do arco V', simbolo: 'R_V', valor: 0.025, unidade: 'm', min: 0.015, max: 0.035, passo: 0.002 },
      ],
      objetos: [
        { id: 's3', tipo: 'fio', I: 'I0', a: [0.085, 0, 0], b: ['R2', 0, 0], infinito: 'a', rotulo: 'III' },
        ...arcoII,
        { id: 's1', tipo: 'fio', I: 'I0', a: [0, 'R2', 0], b: [0, 0.085, 0], infinito: 'b', rotulo: 'I' },
        { id: 's6', tipo: 'fio', I: 'I0', a: [-0.085, 0, 0], b: ['-R5', 0, 0], infinito: 'a', rotulo: 'VI' },
        ...arcoV,
        { id: 's4', tipo: 'fio', I: 'I0', a: [0, '-R5', 0], b: [0, -0.085, 0], infinito: 'b', rotulo: 'IV' },
        { id: 'Cc', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Trechos retos I, III, IV e VI', simbolo: 'B_r', expr: "z(Bde('s1', 0, 0, 0)) + z(Bde('s3', 0, 0, 0)) + z(Bde('s4', 0, 0, 0)) + z(Bde('s6', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Arco II', simbolo: 'B_{II}', expr: somaB(arcoII), unidade: 'T', teoria: 'mu0*I0/(8*R2)' },
        { rotulo: 'Arco V', simbolo: 'B_V', expr: somaB(arcoV), unidade: 'T', teoria: 'mu0*I0/(8*R5)' },
        { rotulo: 'Razão B_V/B_II', simbolo: 'B_V/B_{II}', expr: `${somaB(arcoV)}/${somaB(arcoII)}`, teoria: 'R2/R5' },
      ],
      passos: [
        {
          titulo: 'As retas apontam para C',
          texto: r`Os quatro trechos retos estão em linhas que passam por $\mathcal C$: $d\vec\ell\parallel\hat r$, e a contribuição deles é nula.`,
          medidas: [0],
        },
        {
          titulo: 'Os arcos',
          previsao: { pergunta: 'Para o mesmo ângulo e a mesma corrente, o campo do arco é maior quando o raio é…', opcoes: ['maior', 'menor'], correta: 1 },
          texto: r`Um arco de $90°$ produz $\mu_0I/8R$: quanto **menor** o raio, maior o campo. Como $R_V < R_{II}$, o arco V vence. Alternativa **(e)**.`,
          medidas: [1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Biot-Savart', lab: 'ampere' }],
        etapas: [
          { titulo: 'Retas', texto: r`Contribuição nula.`, passo: 0 },
          { titulo: 'Arcos', texto: r`$B = \mu_0I/8R$: vence o menor raio.`, passo: 1 },
        ],
        resultado: r`O segmento V: alternativa **(e)**.`,
        errosComuns: [
          r`Achar que o arco maior, por ter mais fio, contribui mais: o comprimento cresce com $R$, mas o campo cai com $R^2$.`,
          r`Contar as retas: estão alinhadas com $\mathcal C$.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'I e III.', porque: r`Retas alinhadas com $\mathcal C$ não contribuem.` },
        { letra: 'b', texto: 'IV e VI.', porque: r`Retas alinhadas com $\mathcal C$ não contribuem.` },
        { letra: 'c', texto: 'II.', porque: r`O raio dele é o maior.` },
        { letra: 'd', texto: 'Todos contribuem igualmente.', porque: r`As retas dão zero, e os arcos, valores diferentes.` },
        { letra: 'e', texto: 'V.', correta: true, porque: r`Correta.` },
        { letra: 'f', texto: 'III e VI.', porque: r`Retas alinhadas com $\mathcal C$ não contribuem.` },
        { letra: 'g', texto: 'I e IV.', porque: r`Retas alinhadas com $\mathcal C$ não contribuem.` },
      ],
    },

    /* ───────────────────────── Objetiva 9 ───────────────────────── */
    {
      id: 'obj9',
      numero: '9',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Prótons e elétrons em placas termossensíveis',
      resumo: 'O sinal decide a placa; a massa decide o calor.',
      enunciado: r`A figura mostra duas placas termossensíveis, $\mathcal P_\text{cima}$ e $\mathcal P_\text{baixo}$, paralelas ao plano $z = 0$. Alternadamente, com a mesma frequência, jogamos, a partir da esquerda, prótons e elétrons, com a mesma velocidade inicial $\vec v = v\hat x$ ($v > 0$), de modo que eles penetram perpendicularmente no campo magnético constante $\vec B = B\hat z$ ($B > 0$). A colisão de tais partículas com as placas é totalmente inelástica. Em qual das placas colidem os prótons, em qual colidem os elétrons e qual delas fica mais quente?`,
      figura: { pagina: 2, recorte: [0.73, 0.01, 0.94, 0.66] },
      cena: {
        escala: 0.01,
        extensao: 12,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [3, 0, 26], alvo: [3, 0, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1e-11 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.08, max: 0.2, passo: 0.01 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 5e5, unidade: 'm/s', min: 2e5, max: 6e5, passo: 1e4 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [0, -0.13, -0.05], max: [0.13, 0.13, 0.05] }, rotulo: 'B' },
        { id: 'p', tipo: 'particula', rotulo: 'próton', q: 'qe', m: 'mp', pos: [-0.02, 0, 0], v: ['v0', 0, 0], parada: 'x < 0 && abs(y) > 1e-7' },
        { id: 'e', tipo: 'particula', rotulo: 'elétron', q: '0-qe', m: 'me', pos: [-0.02, 0, 0], v: ['v0', 0, 0], parada: 'x < 0 && abs(y) > 1e-7' },
        { id: 'pc', tipo: 'caminho', seta: 0, pontos: [[0, 0.002, 0], [0, 0.115, 0]] },
        { id: 'pb', tipo: 'caminho', seta: 0, pontos: [[0, -0.002, 0], [0, -0.115, 0]] },
        { id: 'lc', tipo: 'rotulo', pos: [-0.018, 0.09, 0], texto: 'P cima' },
        { id: 'lb', tipo: 'rotulo', pos: [-0.018, -0.09, 0], texto: 'P baixo' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Onde o próton bate', simbolo: 'y_p', expr: `t > 1.02*${tVolta} ? y(pos('p')) : 0/0`, unidade: 'm', teoria: '-2*mp*v0/(qe*B0)' },
        { rotulo: 'Onde o elétron bate', simbolo: 'y_e', expr: `t > 1.02*${tVolta} ? y(pos('e')) : 0/0`, unidade: 'm', teoria: '2*me*v0/(qe*B0)' },
        { rotulo: 'Energia de um próton', simbolo: 'K_p', expr: 'mp*v0^2/2', unidade: 'J' },
        { rotulo: 'Energia de um elétron', simbolo: 'K_e', expr: 'me*v0^2/2', unidade: 'J' },
        { rotulo: 'Razão entre as energias', simbolo: 'K_p/K_e', expr: 'mp/me' },
      ],
      passos: [
        {
          titulo: 'O próton desce',
          previsao: { pergunta: 'Com v em +x e B em +z, a força no próton aponta para…', opcoes: ['+y', '−y'], correta: 1 },
          texto: r`$\vec F = q\vec v\times\vec B$, com $\hat x\times\hat z = -\hat y$: o próton é desviado para baixo, faz meia volta e bate em $\mathcal P_\text{baixo}$.`,
          medidas: [0],
        },
        {
          titulo: 'O elétron sobe',
          texto: r`A carga é negativa, e a força se inverte: o elétron bate em $\mathcal P_\text{cima}$. O raio é tão menor que ele bate quase no ponto de entrada.`,
          medidas: [1],
        },
        {
          titulo: 'Qual placa esquenta mais',
          texto: r`A mesma frequência e a mesma velocidade, mas a massa do próton é cerca de 1836 vezes maior. A colisão inelástica deposita toda a energia cinética $\frac12mv^2$:

$\mathcal P_\text{baixo}$ recebe muito mais energia. Alternativa **(g)**.`,
          medidas: [2, 3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Próton', texto: r`$\vec F$ para baixo: bate em $\mathcal P_\text{baixo}$.`, passo: 0 },
          { titulo: 'Elétron', texto: r`$\vec F$ para cima: bate em $\mathcal P_\text{cima}$.`, passo: 1 },
          { titulo: 'Calor', texto: r`$K\propto m$: esquenta mais a placa dos prótons.`, passo: 2 },
        ],
        resultado: r`$\mathcal P_\text{baixo}$, $\mathcal P_\text{cima}$, $\mathcal P_\text{baixo}$: alternativa **(g)**.`,
        errosComuns: [
          r`Inverter o sentido da força: confira $\hat x\times\hat z$.`,
          r`Achar que cargas iguais dão o mesmo aquecimento: a energia depende da massa.`,
        ],
        oficial: { resposta: '(g)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\mathcal P_\text{baixo}$, $\mathcal P_\text{cima}$, $\mathcal P_\text{cima}$.`, porque: r`A placa dos prótons é a que esquenta mais.` },
        { letra: 'b', texto: r`$\mathcal P_\text{cima}$, $\mathcal P_\text{baixo}$, $\mathcal P_\text{cima}$.`, porque: r`Inverte o sentido da força.` },
        { letra: 'c', texto: r`$\mathcal P_\text{cima}$, $\mathcal P_\text{baixo}$, $\mathcal P_\text{baixo}$.`, porque: r`Inverte o sentido da força.` },
        { letra: 'd', texto: r`$\mathcal P_\text{baixo}$, $\mathcal P_\text{cima}$, as placas se aquecem igualmente.`, porque: r`As energias são muito diferentes.` },
        { letra: 'e', texto: r`$\mathcal P_\text{cima}$, $\mathcal P_\text{baixo}$, as placas se aquecem igualmente.`, porque: r`Inverte a força, e as energias são diferentes.` },
        { letra: 'f', texto: r`$\mathcal P_\text{cima}$, $\mathcal P_\text{cima}$, $\mathcal P_\text{cima}$.`, porque: r`Cargas opostas desviam para lados opostos.` },
        { letra: 'g', texto: r`$\mathcal P_\text{baixo}$, $\mathcal P_\text{cima}$, $\mathcal P_\text{baixo}$.`, correta: true, porque: r`Correta.` },
        { letra: 'h', texto: r`$\mathcal P_\text{baixo}$, $\mathcal P_\text{baixo}$, $\mathcal P_\text{baixo}$.`, porque: r`Cargas opostas desviam para lados opostos.` },
      ],
    },

    /* ───────────────────────── Objetiva 10 ───────────────────────── */
    {
      id: 'obj10',
      numero: '10',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Placa espessa com corrente uniforme',
      resumo: 'Fora da placa, B não depende da distância.',
      enunciado: r`Uma placa condutora infinita de espessura $2d$ é posicionada de forma que seu plano médio coincide com o plano $XY$ de um sistema de coordenadas. Ela possui uma densidade de corrente constante dada por $\vec J = J_0\hat z$ ($J_0 > 0$). Nessa situação, o campo magnético produzido pela placa nas regiões $y > d$ e $y < -d$ vale, respectivamente:`,
      figura: { pagina: 2, recorte: [0.72, 0.655, 0.94, 0.945] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'J0', rotulo: 'Densidade de corrente', simbolo: 'J', valor: 1e5, unidade: 'A/m²', min: 2e4, max: 3e5, passo: 1e4 },
        { id: 'd', rotulo: 'Meia espessura', simbolo: 'd', valor: 0.015, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
        { id: 'ya', rotulo: 'Altura da amperiana', simbolo: 'y', valor: 0.04, unidade: 'm', min: 0.035, max: 0.06, passo: 0.002 },
        { id: 'w', rotulo: 'Meia largura da amperiana', simbolo: r`\ell/2`, valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bp', tipo: 'campoB', valor: ['y >= d ? 0-mu0*J0*d : (y <= 0-d ? mu0*J0*d : 0-mu0*J0*y)', 0, 0], rotulo: 'B' },
        { id: 'placa', tipo: 'caminho', seta: 0, pontos: [[-0.075, 'd', 0], [0.075, 'd', 0], [0.075, '-d', 0], [-0.075, '-d', 0], [-0.075, 'd', 0]], rotulo: 'placa' },
        { id: 'C', tipo: 'caminho', tracejado: true, pontos: [['-w', '-ya', 0], ['w', '-ya', 0], ['w', 'ya', 0], ['-w', 'ya', 0], ['-w', '-ya', 0]], rotulo: 'C' },
        { id: 'sJ', tipo: 'seta', papel: 'I', origem: [0.045, 0, 0], vetor: [0, 0, 1], comprimento: '2*cm', rotulo: 'J' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente envolvida por C', simbolo: r`I_\text{env}`, expr: 'J0*2*d*2*w', unidade: 'A', teoria: '4*J0*d*w' },
        { rotulo: 'Circulação de B em C', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "intB('C')", unidade: 'T·m', teoria: 'mu0*4*J0*d*w' },
        { rotulo: 'B em y > d', simbolo: 'B_x(+)', expr: 'x(B(0, ya, 0))', unidade: 'T', teoria: '0-mu0*J0*d' },
        { rotulo: 'B em y < −d', simbolo: 'B_x(−)', expr: 'x(B(0, 0-ya, 0))', unidade: 'T', teoria: 'mu0*J0*d' },
      ],
      passos: [
        {
          titulo: 'Simetria',
          texto: r`Por simetria, o campo é paralelo à placa, perpendicular a $\vec J$, e tem sentidos opostos dos dois lados. Com $\vec J$ saindo da página, ele circula no sentido anti-horário em volta da corrente: para a **esquerda** em cima, e para a **direita** embaixo.`,
          medidas: [2, 3],
        },
        {
          titulo: 'Ampère num retângulo',
          previsao: { pergunta: 'Ao se afastar da placa, o campo…', opcoes: ['cai com 1/y', 'não muda', 'cresce com y'], correta: 1 },
          texto: r`Num retângulo de largura $\ell$ que atravessa a placa, só os lados paralelos contam:

$$2B\ell = \mu_0J\,2d\,\ell \quad\Rightarrow\quad B = \mu_0Jd.$$

Não depende de $y$: mude a altura da amperiana. Alternativa **(a)**.`,
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère', lab: 'ampere' }],
        etapas: [
          { titulo: 'Direção', texto: r`$\vec B\parallel\mp\hat x$ em cima e embaixo.`, passo: 0 },
          { titulo: 'Módulo', texto: r`$B = \mu_0Jd$.`, passo: 1 },
        ],
        resultado: r`$-\mu_0Jd\,\hat x$ e $+\mu_0Jd\,\hat x$: alternativa **(a)**.`,
        errosComuns: [
          r`Usar $y$ em vez de $d$: fora da placa, a corrente envolvida não muda.`,
          r`Trocar os sentidos: use $\vec J\times\hat y$ na região de cima.`,
        ],
        oficial: {
          resposta: '(a)',
          observacao: r`O enunciado diz que o plano médio é o $XY$, mas com $\vec J$ em $\hat z$ e as regiões definidas por $y$, a placa precisa estar no plano $XZ$, e é assim que a cena e o gabarito a tratam. O campo fora dela é o de uma placa infinita, por simetria.`,
        },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\mu_0Jd\,\hat x$ e $+\mu_0Jd\,\hat x$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$+\mu_0Jd\,\hat x$ e $-\mu_0Jd\,\hat x$`, porque: r`Sentidos trocados.` },
        { letra: 'c', texto: r`$-\mu_0Jy\,\hat x$ e $+\mu_0Jy\,\hat x$`, porque: r`Isso vale dentro da placa.` },
        { letra: 'd', texto: r`$+\mu_0Jy\,\hat x$ e $-\mu_0Jy\,\hat x$`, porque: r`Sentidos trocados, e vale dentro da placa.` },
        { letra: 'e', texto: r`$-\mu_0Jd\,\hat y$ e $+\mu_0Jd\,\hat y$`, porque: r`Direção errada: $\vec B$ é paralelo à placa.` },
      ],
    },
  ],
}

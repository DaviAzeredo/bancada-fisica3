import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: arco de círculo como sequência de fios, entre dois ângulos em graus. */
const N = 24
const arco = (id: string, I: string, g0: number, g1: number, ativo: string): ObjetoInput[] =>
  Array.from({ length: N }, (_, i) => {
    const ponto = (k: number): [string, string, number] => {
      const f = ((g0 + ((g1 - g0) * k) / N) * Math.PI) / 180
      return [`R*${Math.cos(f)}`, `R*${Math.sin(f)}`, 0]
    }
    return { id: `${id}${i}`, tipo: 'fio' as const, ativo, I, a: ponto(i), b: ponto(i + 1) }
  })

/* Objetiva 2: fio em y; a espira roda em torno dele (fi) e em torno de si mesma (alfa). */
const FI = '(caso >= 4 ? w*t : 0)'
const AL = '(rad(fase) + w*t)'
const PSI = `(caso==4 ? w*t : (caso==5 ? ${FI} + ${AL} : 0))`
const CX = `(caso==2 ? d + v0*t : d*cos(${FI}))`
const CY = '(caso==1 ? v0*t : 0)'
const CZ = `(0-d*sin(${FI}))`
const Dd = '(caso==2 ? d + v0*t : d)'
const C2 = '(d^2 + a^2/4)'
/* Fluxo exato pelo potencial vetor do fio: só importam as distâncias dos lados paralelos a ele. */
const PhiRet = `(0-mu0*I0*a/(2*pi)*ln((${Dd} + a/2)/(${Dd} - a/2)))`
const PhiV = `(0-mu0*I0*a/(4*pi)*ln((${C2} + a*d*cos(${AL}))/(${C2} - a*d*cos(${AL}))))`
const femII = `(0-mu0*I0*a^2*v0/(2*pi*(${Dd}^2 - a^2/4)))`
const femV = `(0-w*mu0*I0*a/(2*pi)*${C2}*a*d*sin(${AL})/(${C2}^2 - (a*d*cos(${AL}))^2))`
/* Losango: semidiagonal D = a/√2, largura variando em triângulo. */
const Dg = '(a/sqrt(2))'
const Phi45 = `(0-mu0*I0/pi*((d + ${Dg})*ln((d + ${Dg})/d) - (d - ${Dg})*ln(d/(d - ${Dg}))))`
const Phi0 = '(0-mu0*I0*a/(2*pi)*ln((d + a/2)/(d - a/2)))'

/* Objetiva 3: posições das três placas. */
const X1 = '(0-0.03)'
const X2 = '0'
const X3 = '0.03'
const Ereg = `(xp < ${X1} ? 0-sig/eps0 : (xp < ${X2} ? 0 : (xp < ${X3} ? 2*sig/eps0 : sig/eps0)))`

/* Objetiva 4: fio, face interna (−Q) e face externa (−2Q). */
const lam = '(Qq/Ll)'
const Vsim = (s: string) => `V(${s}, 0, 0) - V(b, 0, 0)`
const Vteo = (s: string) => `(${s} < a ? 2*k0*${lam}*ln(a/${s}) : (${s} < b ? 0 : 4*k0*${lam}*ln(${s}/b)))`
const Eteo = `(rs < a ? 2*k0*${lam}/rs : (rs < b ? 0 : -4*k0*${lam}/rs))`

/* Objetiva 5: período e raio da hélice. */
const Tc = '(2*pi*mp/(qe*B0))'
const Y0 = -0.08
const Rteo = '(mp*v0*sin(rad(alfa))/(qe*B0))'
const Pteo = `(v0*cos(rad(alfa))*${Tc})`
const Rmed = `(t > 1.2*${Tc} ? rastroSpan('p', 'x')/2 : 0/0)`
const Pmed = `(t > 0 ? (y(pos('p')) - (${Y0}))*${Tc}/t : 0/0)`

/* Objetiva 6: frente da espira em XF; só a parte imersa tem fluxo. */
const XF = '(x0 + v0*t)'
const lo = `max(${XF} - a, 0)`
const hi = `min(${XF}, L)`
const ZONA = `(${XF} > 0 && ${XF} < a ? -1 : (${XF} > L && ${XF} < L + a ? 1 : 0))`

/* Discursiva */
const Ienv = '(rs < a ? I0*(rs/a)^3 : (rs < b ? I0 : 0))'
const Bphi = (s: string) => `(${s} < a ? mu0*I0*${s}^2/(2*pi*a^3) : (${s} < b ? mu0*I0/(2*pi*${s}) : 0))`

/**
 * P3 de Física III, 2023/2, diurno, versão A (04/12/2023). Conferida com o
 * gabarito oficial: objetivas 1a, 2b, 3e, 4d, 5f, 6c, e a discursiva. Na objetiva
 * 5, as alternativas (a) e (e) são iguais no original.
 */
export const p3_2023_2_diurno: ProvaInput = {
  id: 'p3-2023-2-diurno',
  titulo: 'P3 · 2023/2 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão A · 04/12/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Dois fios dobrados em arcos',
      resumo: 'Biot-Savart por trechos: retas, arcos e sinais opostos.',
      enunciado: r`Dois fios muito longos e mantidos paralelos que possuem dobras em forma de arcos de círculos de mesmo raio $R$ são percorridos por correntes estacionárias de intensidades $I_1$ e $I_2 = 4I_1$, como mostra a figura. Sendo assim, o campo magnético $\vec B_T$ produzido pelos dois fios no centro $\mathcal C$ do círculo comum é dado por:`,
      figura: { pagina: 1, recorte: [0.085, 0.455, 0.495, 0.925] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I1', rotulo: 'Corrente no fio 1', simbolo: 'I_1', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
        {
          id: 'quais',
          rotulo: 'Fios ligados',
          valor: 3,
          opcoes: [
            { valor: 1, rotulo: 'só o fio 1' },
            { valor: 2, rotulo: 'só o fio 2' },
            { valor: 3, rotulo: 'os dois' },
          ],
        },
      ],
      objetos: [
        { id: 'f1a', tipo: 'fio', ativo: 'quais != 2', I: 'I1', a: [0.085, 'R', 0], b: [0, 'R', 0], infinito: 'a', rotulo: 'I₁' },
        ...arco('c1', 'I1', 90, 180, 'quais != 2'),
        { id: 'f1s', tipo: 'fio', ativo: 'quais != 2', I: 'I1', a: ['-R', 0, 0], b: ['-R', -0.085, 0], infinito: 'b' },
        { id: 'f2a', tipo: 'fio', ativo: 'quais != 1', I: '4*I1', a: [0.085, 0, 0], b: ['R', 0, 0], infinito: 'a', rotulo: 'I₂' },
        ...arco('c2', '4*I1', 0, -90, 'quais != 1'),
        { id: 'f2s', tipo: 'fio', ativo: 'quais != 1', I: '4*I1', a: [0, '-R', 0], b: [0, -0.085, 0], infinito: 'b' },
        { id: 'C', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Trecho reto que chega (fio 1)', simbolo: 'B_{1a}', ativo: 'quais != 2', expr: "z(Bde('f1a', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I1/(4*pi*R)' },
        { rotulo: 'Trecho reto que sai (fio 1)', simbolo: 'B_{1s}', ativo: 'quais != 2', expr: "z(Bde('f1s', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I1/(4*pi*R)' },
        { rotulo: 'Fio 1 inteiro', simbolo: 'B_1', ativo: 'quais==1', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I1/(8*pi*R)*(pi + 4)' },
        { rotulo: 'Trechos retos do fio 2', simbolo: 'B_{2r}', ativo: 'quais != 1', expr: "z(Bde('f2a', 0, 0, 0)) + z(Bde('f2s', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Fio 2 inteiro', simbolo: 'B_2', ativo: 'quais==2', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '-mu0*4*I1/(8*R)' },
        { rotulo: 'Campo total em C', simbolo: 'B_T', ativo: 'quais==3', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '-mu0*I1/(8*pi*R)*(3*pi - 4)' },
        { rotulo: 'Em unidades de μ₀I₁/8πR', simbolo: r`8\pi RB_T/\mu_0I_1`, ativo: 'quais==3', expr: 'z(B(0, 0, 0))/(mu0*I1/(8*pi*R))', teoria: '4 - 3*pi' },
      ],
      passos: [
        {
          titulo: 'Retas alinhadas com C não contam',
          previsao: { pergunta: 'Um trecho reto cujo prolongamento passa por C produz campo em C?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Os dois trechos retos do fio 2 apontam para $\mathcal C$: neles, $d\vec\ell\parallel\hat r$, e $d\vec\ell\times\hat r = \vec 0$. Do fio 2, só o arco contribui.`,
          parametros: { quais: 2 },
          medidas: [3],
        },
        {
          titulo: 'O arco do fio 2',
          texto: r`Um quarto de círculo produz um quarto do campo da espira, $\mu_0I/2R$. Percorrido no sentido **horário**, o campo em $\mathcal C$ entra na página:

$$\vec B_2 = -\frac14\frac{\mu_0I_2}{2R}\hat z = -\frac{\mu_0I_1}{2R}\hat z.$$`,
          parametros: { quais: 2 },
          medidas: [4],
        },
        {
          titulo: 'Fio 1: os trechos retos',
          texto: r`Cada um é um fio semi-infinito cuja ponta está na perpendicular que passa por $\mathcal C$, a uma distância $R$. Isso vale metade do fio infinito:

$$\frac12\frac{\mu_0I_1}{2\pi R} = \frac{\mu_0I_1}{4\pi R}.$$

Pela regra da mão direita, os dois apontam para fora da página.`,
          parametros: { quais: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Fio 1: o arco',
          texto: r`O arco do fio 1 é percorrido no sentido **anti-horário**: mais $\mu_0I_1/8R$ para fora.

$$\vec B_1 = \left(\frac{2\mu_0I_1}{4\pi R} + \frac{\mu_0I_1}{8R}\right)\hat z = \frac{\mu_0I_1}{8\pi R}(4 + \pi)\,\hat z.$$`,
          parametros: { quais: 1 },
          medidas: [2],
        },
        {
          titulo: 'Soma',
          texto: r`$$\vec B_T = \frac{\mu_0I_1}{8\pi R}(4 + \pi - 4\pi)\,\hat z = -\frac{\mu_0I_1}{8\pi R}(3\pi - 4)\,\hat z.$$

O arco do fio 2 vence: o campo entra na página. Alternativa **(a)**.`,
          parametros: { quais: 3 },
          medidas: [5, 6],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Biot-Savart', lab: 'ampere' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Fio 2', texto: r`Só o arco: $-\mu_0I_2/8R = -\mu_0I_1/2R$.`, passo: 1 },
          { titulo: 'Fio 1', texto: r`Duas retas semi-infinitas e um arco: $\dfrac{\mu_0I_1}{8\pi R}(4 + \pi)$.`, passo: 3 },
          { titulo: 'Total', texto: r`$\vec B_T = -\dfrac{\mu_0I_1}{8\pi R}(3\pi - 4)\,\hat z$.`, passo: 4 },
        ],
        resultado: r`$\vec B_T = -\dfrac{\mu_0I_1}{8\pi R}(3\pi - 4)\,\hat z$: alternativa **(a)**.`,
        errosComuns: [
          r`Dar o mesmo sinal aos dois arcos: um é horário e o outro, anti-horário.`,
          r`Contar as retas do fio 2, que estão alinhadas com $\mathcal C$.`,
          r`Usar $\mu_0I/2\pi R$ nos trechos semi-infinitos: isso vale para o fio inteiro.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{\mu_0I_1}{8\pi R}(3\pi - 4)\,\hat z$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$\dfrac{\mu_0I_1}{8\pi R}(5\pi + 4)\,\hat z$`, porque: r`Troca o sinal do arco do fio 2, que é horário.` },
        { letra: 'c', texto: r`$-\dfrac{\mu_0I_1}{2\pi R}(\pi + 3)\,\hat z$`, porque: r`Os sinais das retas e do arco do fio 1 estão errados.` },
        { letra: 'd', texto: r`$\dfrac{\mu_0I_1}{8\pi R}(4\pi + 3)\,\hat z$`, porque: r`Dá ao arco do fio 2 o sinal errado e não soma as parcelas do fio 1.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0I_1}{2\pi R}(\pi - 1)\,\hat z$`, porque: r`Esquece o arco do fio 1 e inverte o sentido do resultado.` },
        { letra: 'f', texto: r`$-\dfrac{\mu_0I_1}{4\pi R}(\pi + 2)\,\hat z$`, porque: r`É o fio 1 inteiro com o fator e o sinal errados: falta o fio 2.` },
        { letra: 'g', texto: r`$-\dfrac{\mu_0I_1}{\pi R}(2\pi - 1)\,\hat z$`, porque: r`Superestima o arco do fio 2 em um fator 4.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cinco movimentos de uma espira perto de um fio',
      resumo: 'Só importa se o fluxo muda, e o campo do fio não é uniforme.',
      enunciado: r`No plano da figura são apresentadas cinco situações de movimento de uma espira quadrada condutora rígida quando imersa no campo magnético produzido por um fio retilíneo muito longo que é percorrido por uma corrente elétrica estacionária. Em (I) a espira se desloca com velocidade paralela ao fio; em (II) a espira se desloca com velocidade ortogonal ao fio; em (III) a espira gira em torno de um eixo ortogonal ao plano da figura, que passa pelo seu centro; em (IV) a espira gira em torno do fio, preservando sua orientação e distância ao mesmo; em (V) a espira gira em torno do fio, ao mesmo tempo em que ela, adicionalmente, gira em torno de um eixo que a corta ao meio. Dentre essas cinco situações de movimento apresentadas, aquelas que resultarão na produção de uma corrente elétrica induzida na espira serão:`,
      figura: [
        { pagina: 1, recorte: [0.505, 0.07, 0.925, 0.365] },
        { pagina: 1, recorte: [0.505, 0.385, 0.925, 0.955] },
      ],
      cena: {
        escala: 0.01,
        extensao: 11,
        unidade: 'cm',
        camera: { pos: [6, 8, 24], alvo: [3, 0, 0] },
        tempo: { escala: 1, unidade: 's', passo: 0.001, duracao: 6 },
      },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Movimento',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) paralelo ao fio' },
            { valor: 2, rotulo: '(II) ortogonal ao fio' },
            { valor: 3, rotulo: '(III) girando no plano' },
            { valor: 4, rotulo: '(IV) em volta do fio' },
            { valor: 5, rotulo: '(V) em volta do fio e de si' },
          ],
        },
        {
          id: 'fase',
          rotulo: 'Orientação inicial',
          valor: 0,
          unidade: '°',
          opcoes: [
            { valor: 0, rotulo: '0°: lados paralelos ao fio' },
            { valor: 45, rotulo: '45°: losango' },
          ],
        },
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I_0', valor: 100, unidade: 'A', min: 20, max: 200, passo: 10 },
        { id: 'd', rotulo: 'Distância ao fio', simbolo: 'd', valor: 0.06, unidade: 'm', min: 0.05, max: 0.08, passo: 0.002 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 0.01, unidade: 'm/s', min: 0.005, max: 0.02, passo: 0.001 },
        { id: 'w', rotulo: 'Rotação', simbolo: r`\omega`, valor: 1, unidade: 'rad/s', min: 0.5, max: 2, passo: 0.1 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I₀' },
        {
          id: 'S',
          tipo: 'espiraSensora',
          centro: [CX, CY, CZ],
          normal: [`sin(${PSI})`, 0, `cos(${PSI})`],
          eixoU: [`caso==3 ? cos(${AL}) : cos(${PSI})`, `caso==3 ? sin(${AL}) : 0`, `caso==3 ? 0 : 0-sin(${PSI})`],
          largura: 'a',
          altura: 'a',
          rotulo: 'espira',
        },
        { id: 'S0', tipo: 'espiraSensora', ativo: 'caso==3', centro: ['d', 0, 0], normal: 'z', eixoU: ['cos(rad(fase))', 'sin(rad(fase))', 0], largura: 'a', altura: 'a', oculta: true },
        { id: 'sv', tipo: 'seta', ativo: 'caso <= 2', papel: 'v', origem: [CX, CY, 0], vetor: ['caso==2 ? 1 : 0', 'caso==1 ? 1 : 0', 0], comprimento: '3*cm', rotulo: 'v' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xz', fontes: ['fw'] },
      medidas: [
        { rotulo: 'Fluxo pela espira', simbolo: r`\Phi_B`, ativo: 'caso != 3', expr: "fluxoB('S')", unidade: 'Wb', teoria: `caso==5 ? ${PhiV} : ${PhiRet}` },
        { rotulo: 'fem induzida', simbolo: r`\mathcal E`, ativo: 'caso != 3', expr: "fem('S')", unidade: 'V', teoria: `caso==5 ? ${femV} : (caso==2 ? ${femII} : 0)` },
        { rotulo: 'Fluxo pela espira agora', simbolo: r`\Phi_B`, ativo: 'caso==3', expr: "fluxoB('S')", unidade: 'Wb' },
        { rotulo: 'fem induzida agora', simbolo: r`\mathcal E`, ativo: 'caso==3', expr: "fem('S')", unidade: 'V' },
        { rotulo: 'Fluxo na orientação inicial', simbolo: r`\Phi_0`, ativo: 'caso==3', expr: "fluxoB('S0')", unidade: 'Wb', teoria: `fase==45 ? ${Phi45} : ${Phi0}` },
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
          titulo: '(I) Paralelo ao fio: nada muda',
          texto: r`Corrente induzida exige fluxo variável. O campo do fio depende só da distância ao fio: andando em paralelo a ele, a espira vê sempre o mesmo campo.

$$\mathcal E = -\frac{d\Phi_B}{dt} = 0.$$

Aperte o *play*: o fluxo fica parado.`,
          parametros: { caso: 1, fase: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Ortogonal ao fio: fluxo cai',
          texto: r`Ao se afastar, a espira vai para onde o campo é mais fraco. Com $D$ a distância do centro ao fio:

$$|\Phi_B| = \frac{\mu_0I_0a}{2\pi}\ln\frac{D + a/2}{D - a/2}.$$

$D$ cresce, $|\Phi_B|$ cai, e **há corrente induzida**.`,
          parametros: { caso: 2, fase: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(III) Girando no próprio plano',
          previsao: { pergunta: 'A espira gira sem sair do plano e sem mudar a área. O fluxo muda?', opcoes: ['Não: a área e o ângulo com B são os mesmos', 'Sim: o campo não é uniforme'], correta: 1 },
          texto: r`Num campo uniforme, nada mudaria. Mas $B\propto 1/s$, e a parte mais perto do fio pesa mais. Girada a 45°, a espira vira um losango: leva mais área para perto do fio, onde o campo é forte, e o fluxo fica maior em módulo.

Compare o fluxo em 0° e em 45° no controle, e aperte o *play*: **há corrente induzida**.`,
          parametros: { caso: 3, fase: 45 },
          medidas: [4, 2, 3],
        },
        {
          titulo: '(IV) Em volta do fio: simetria',
          texto: r`A espira mantém a distância e continua no plano que contém o fio. É a mesma espira depois de uma rotação em torno do eixo de simetria do campo: o fluxo não muda.

$$\mathcal E = 0.$$

Parece um movimento complicado, mas não induz nada.`,
          parametros: { caso: 4, fase: 0 },
          medidas: [0, 1],
        },
        {
          titulo: '(V) Girando também em torno de si',
          texto: r`Além de orbitar o fio, a espira muda o ângulo entre seu plano e o campo. Com $\alpha$ o ângulo entre ela e o plano que contém o fio:

$$\Phi_B = -\frac{\mu_0I_0a}{4\pi}\ln\frac{d^2 + a^2/4 + ad\cos\alpha}{d^2 + a^2/4 - ad\cos\alpha}.$$

Em $\alpha = 90°$ o fluxo se anula, e depois troca de sinal: **há corrente induzida**.`,
          parametros: { caso: 5, fase: 45 },
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`Há corrente em (II), (III) e (V): alternativa **(b)**.`,
          parametros: { caso: 2, fase: 0 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday', lab: 'faraday' },
          { texto: 'Campo de um fio longo', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'Critério', texto: r`Há corrente induzida se, e só se, $\Phi_B$ variar no tempo.`, passo: 0 },
          { titulo: 'Sem variação', texto: r`(I): translação paralela ao fio. (IV): rotação em torno do eixo de simetria do campo.`, passo: 3 },
          { titulo: 'Com variação', texto: r`(II): a distância muda. (III): o campo não é uniforme. (V): o ângulo entre a espira e o campo muda.`, passo: 4 },
        ],
        resultado: r`Apenas (II), (III) e (V): alternativa **(b)**.`,
        errosComuns: [
          r`Achar que (III) não induz nada porque a área e o ângulo não mudam: isso só vale em campo uniforme.`,
          r`Achar que todo movimento circular induz corrente: (IV) respeita a simetria do campo.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas (I), (II) e (III).', porque: r`Em (I) o fluxo não muda, e (V) ficou de fora.` },
        { letra: 'b', texto: 'Apenas (II), (III) e (V).', correta: true, porque: r`Correta.` },
        { letra: 'c', texto: 'Apenas (I), (III) e (V).', porque: r`(I) não induz, e (II) induz.` },
        { letra: 'd', texto: 'Apenas (III) e (V).', porque: r`(II) também induz: a espira vai para um campo mais fraco.` },
        { letra: 'e', texto: 'Apenas (III), (IV) e (V).', porque: r`(IV) não induz, e (II) induz.` },
        { letra: 'f', texto: 'Apenas (II) e (III).', porque: r`(V) também induz: o ângulo com o campo muda.` },
        { letra: 'g', texto: 'Apenas (III) e (IV).', porque: r`(IV) não induz.` },
        { letra: 'h', texto: 'Apenas (II), (III), (IV) e (V).', porque: r`(IV) preserva o fluxo por simetria.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três placas infinitas: +σ, +2σ e −σ',
      resumo: 'Superposição de três campos uniformes, com sinais que dependem do lado.',
      enunciado: r`A figura exibe um esquema com três placas paralelas infinitas em que as densidades superficiais de cargas constantes em cada uma delas são dadas por: $+\sigma$, $+2\sigma$ e $-\sigma$, onde $\sigma > 0$. Sendo assim, assinale a alternativa que representa corretamente o campo elétrico total $\vec E$, produzido pelas três placas, no ponto $\mathcal P$ indicado na figura.`,
      figura: { pagina: 2, recorte: [0.085, 0.07, 0.495, 0.56] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 1e-7, unidade: 'C/m²', min: 2e-8, max: 3e-7, passo: 1e-8 },
        { id: 'xp', rotulo: 'Posição do ponto', simbolo: 'x_P', valor: -0.015, unidade: 'm', min: -0.055, max: 0.055, passo: 0.002 },
      ],
      objetos: [
        { id: 'p1', tipo: 'planoInfinito', sigma: 'sig', ponto: [X1, 0, 0], normal: 'x', rotulo: '+σ' },
        { id: 'p2', tipo: 'planoInfinito', sigma: '2*sig', ponto: [X2, 0, 0], normal: 'x', rotulo: '+2σ' },
        { id: 'p3', tipo: 'planoInfinito', sigma: '0-sig', ponto: [X3, 0, 0], normal: 'x', rotulo: '−σ' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xp', 0, 0], rotulo: 'P' },
        { id: 'e1', tipo: 'seta', papel: 'E', origem: ['xp', 0.03, 0], vetor: "Ede('p1', xp, 0, 0)", comprimento: '1.5*cm', rotulo: 'de +σ' },
        { id: 'e2', tipo: 'seta', papel: 'E', origem: ['xp', 0.015, 0], vetor: "Ede('p2', xp, 0, 0)", comprimento: '3*cm', rotulo: 'de +2σ' },
        { id: 'e3', tipo: 'seta', papel: 'E', origem: ['xp', -0.015, 0], vetor: "Ede('p3', xp, 0, 0)", comprimento: '1.5*cm', rotulo: 'de −σ' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Campo de +σ', simbolo: 'E_1', expr: "x(Ede('p1', xp, 0, 0))", unidade: 'V/m', teoria: `xp > ${X1} ? sig/(2*eps0) : 0-sig/(2*eps0)` },
        { rotulo: 'Campo de +2σ', simbolo: 'E_2', expr: "x(Ede('p2', xp, 0, 0))", unidade: 'V/m', teoria: `xp > ${X2} ? sig/eps0 : 0-sig/eps0` },
        { rotulo: 'Campo de −σ', simbolo: 'E_3', expr: "x(Ede('p3', xp, 0, 0))", unidade: 'V/m', teoria: `xp > ${X3} ? 0-sig/(2*eps0) : sig/(2*eps0)` },
        { rotulo: 'Campo total', simbolo: 'E_x', expr: 'x(E(xp, 0, 0))', unidade: 'V/m', teoria: Ereg },
      ],
      graficos: [
        {
          titulo: 'Campo ao longo de x',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.07, ate: 0.07, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'E_x', expr: 'x(E(xx, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Cada placa, separada',
          texto: r`Uma placa infinita produz $|\vec E| = |\sigma|/2\varepsilon_0$ dos dois lados, sem depender da distância. Saindo da placa, se positiva; entrando, se negativa.`,
          parametros: { xp: -0.015 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Sinais em P',
          previsao: { pergunta: 'Em P, entre +σ e +2σ, o campo da placa +2σ aponta para…', opcoes: ['+x', '−x'], correta: 1 },
          texto: r`$\mathcal P$ está à **direita** de $+\sigma$ e à **esquerda** das outras duas:

$$E_1 = +\frac{\sigma}{2\varepsilon_0},\qquad E_2 = -\frac{2\sigma}{2\varepsilon_0},\qquad E_3 = +\frac{\sigma}{2\varepsilon_0}.$$

A placa $-\sigma$ puxa para si: também para $+\hat x$.`,
          parametros: { xp: -0.015 },
          medidas: [0, 1, 2],
          destacar: ['e1', 'e2', 'e3'],
        },
        {
          titulo: 'Soma',
          texto: r`$$E_x = \frac{\sigma}{2\varepsilon_0}(1 - 2 + 1) = 0.$$

Alternativa **(e)**: entre as duas primeiras placas, o campo é nulo.`,
          parametros: { xp: -0.015 },
          medidas: [3],
        },
        {
          titulo: 'Nas outras regiões',
          texto: r`Mude $x_P$: à esquerda de tudo, $-\sigma/\varepsilon_0$; entre $+2\sigma$ e $-\sigma$, $2\sigma/\varepsilon_0$; à direita de tudo, $\sigma/\varepsilon_0$. O campo salta $\sigma_i/\varepsilon_0$ em cada placa.`,
          parametros: { xp: 0.015 },
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um plano infinito', lab: 'gauss' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Campos', texto: r`$E_1 = +\sigma/2\varepsilon_0$, $E_2 = -\sigma/\varepsilon_0$, $E_3 = +\sigma/2\varepsilon_0$.`, passo: 1 },
          { titulo: 'Soma', texto: r`$E_x = 0$.`, passo: 2 },
        ],
        resultado: r`$\vec E = \vec 0$: alternativa **(e)**.`,
        errosComuns: [
          r`Achar que a placa mais próxima pesa mais: o campo de um plano infinito não depende da distância.`,
          r`Usar $\sigma/\varepsilon_0$ em cada placa isolada: esse é o campo entre as placas de um capacitor.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{2\sigma}{\epsilon_0}\hat x$`, porque: r`Usa $\sigma/\varepsilon_0$ por placa e erra os sinais.` },
        { letra: 'b', texto: r`$-\dfrac{\sigma}{2\epsilon_0}\hat x$`, porque: r`Esquece uma das placas.` },
        { letra: 'c', texto: r`$\dfrac{\sigma}{2\epsilon_0}\hat x$`, porque: r`Esquece uma das placas.` },
        { letra: 'd', texto: r`$\dfrac{2\sigma}{\epsilon_0}\hat x$`, porque: r`Esse é o campo entre $+2\sigma$ e $-\sigma$, não em $\mathcal P$.` },
        { letra: 'e', texto: r`$\vec 0$`, correta: true, porque: r`Correta.` },
        { letra: 'f', texto: r`$\dfrac{4\sigma}{\epsilon_0}\hat x$`, porque: r`Soma os módulos, com o fator 2 errado.` },
        { letra: 'g', texto: r`$\dfrac{\sigma}{\epsilon_0}\hat x$`, porque: r`Esse é o campo à direita das três placas.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Potencial de um fio dentro de uma casca condutora',
      resumo: 'V = 0 em s = b, com −Q na face interna e −2Q na externa.',
      enunciado: r`Considere um sistema constituído por: (i) um fio retilíneo, de comprimento $L$, com carga total $Q$, com densidade de carga linear constante (estacionária e uniforme), e (ii) uma casca cilíndrica circular espessa condutora, de altura $L$ e raios interno $a$ e externo $b$, com carga total $-3Q$, coaxial com o fio, em equilíbrio eletrostático. Suponha que, ademais, $L \gg b$, de modo que quaisquer efeitos de borda possam ser desprezados. Indique, então, qual a alternativa que melhor representa o gráfico do potencial eletrostático, $V$, de tal sistema em função da distância radial, $s$, até o fio, supondo que $Q > 0$ e que o potencial é zero na superfície $s = b$.`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.07, 0.925, 0.345] },
        { pagina: 2, recorte: [0.505, 0.345, 0.925, 0.89] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga do fio', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'Ll', rotulo: 'Comprimento', simbolo: 'L', valor: 0.5, unidade: 'm', min: 0.5, max: 0.5 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06 },
        { id: 'rs', rotulo: 'Distância ao fio', simbolo: 's', valor: 0.015, unidade: 'm', min: 0.005, max: 0.105, passo: 0.002 },
      ],
      objetos: [
        { id: 'lin', tipo: 'linhaInfinita', lambda: lam, ponto: [0, 0, 0], direcao: 'z', rotulo: 'Q' },
        { id: 'met', tipo: 'cilindroInfinito', lambda: 0, ponto: [0, 0, 0], direcao: 'z', raio: 'b', raioInterno: 'a' },
        { id: 'fa', tipo: 'cilindroInfinito', lambda: `0-${lam}`, ponto: [0, 0, 0], direcao: 'z', raio: 'a', oco: true },
        { id: 'fb', tipo: 'cilindroInfinito', lambda: `-2*${lam}`, ponto: [0, 0, 0], direcao: 'z', raio: 'b', oco: true },
        { id: 'Gm', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: '(a + b)/2', altura: 0.06, rotulo: 'S no metal' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rs', 0, 0], rotulo: 's' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro de S, por metro', simbolo: r`\lambda_\text{env}`, expr: "eps0*fluxo('Gm')/0.06", unidade: 'C/m', teoria: 0 },
        { rotulo: 'Carga na face interna', simbolo: 'Q_a', expr: '-eps0*x(E(0.999*a, 0, 0))*2*pi*0.999*a*Ll', unidade: 'C', teoria: '0-Qq' },
        { rotulo: 'Carga na face externa', simbolo: 'Q_b', expr: 'eps0*x(E(1.001*b, 0, 0))*2*pi*1.001*b*Ll', unidade: 'C', teoria: '-2*Qq' },
        { rotulo: 'Campo radial em s', simbolo: 'E_s', expr: 'x(E(rs, 0, 0))', unidade: 'V/m', teoria: Eteo },
        { rotulo: 'Potencial em s', simbolo: 'V(s)', expr: Vsim('rs'), unidade: 'V', teoria: Vteo('rs') },
      ],
      graficos: [
        {
          titulo: 'V(s), com V(b) = 0',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.12*a', ate: '1.9*b', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: Vsim('ss'), unidade: 'V' },
            { rotulo: 'Gauss', expr: Vteo('ss'), unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Onde ficam as cargas',
          texto: r`Dentro do metal $\vec E = \vec 0$. Uma gaussiana cilíndrica no metal tem fluxo nulo, então a carga envolvida é zero: a face interna tem $-Q$.

Sobra $-3Q - (-Q) = -2Q$ para a face externa.`,
          parametros: { rs: 0.015 },
          medidas: [0, 1, 2],
          destacar: ['Gm', 'fa', 'fb'],
        },
        {
          titulo: 'Campo em cada região',
          texto: r`Com $\lambda = Q/L$:

$$E_s = \frac{\lambda}{2\pi\varepsilon_0s}\ (s < a),\qquad E_s = 0\ (a < s < b),\qquad E_s = -\frac{2\lambda}{2\pi\varepsilon_0s}\ (s > b).$$

Fora da casca, a carga total envolvida é $-2Q$: o campo aponta para **dentro**.`,
          parametros: { rs: 0.081 },
          medidas: [3],
        },
        {
          titulo: 'Entre o fio e a casca',
          previsao: { pergunta: 'Perto do fio (s < a), V é…', opcoes: ['positivo', 'negativo'], correta: 0 },
          texto: r`O metal é equipotencial, com $V = 0$ de $a$ a $b$. Para $s < a$:

$$V(s) = \int_s^aE_s\,ds' = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac as.$$

Positivo, divergindo no fio: isso elimina (a), (c) e (e).`,
          parametros: { rs: 0.015 },
          medidas: [4],
        },
        {
          titulo: 'Fora da casca',
          texto: r`Para $s > b$, andar para fora é andar **contra** o campo, e o potencial sobe:

$$V(s) = -\int_b^sE_s\,ds' = \frac{2\lambda}{2\pi\varepsilon_0}\ln\frac sb.$$

Sobe como logaritmo: cada vez mais devagar, com a concavidade para baixo. Esse é o gráfico (d), não o (b). Alternativa **(d)**.`,
          parametros: { rs: 0.081 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutores em equilíbrio', lab: 'gauss' },
          { texto: 'Potencial a partir do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Cargas', texto: r`Face interna: $-Q$. Face externa: $-2Q$.`, passo: 0 },
          { titulo: 'Dentro', texto: r`$V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac as > 0$ para $s < a$, e $V = 0$ no metal.`, passo: 2 },
          { titulo: 'Fora', texto: r`$V = \dfrac{2\lambda}{2\pi\varepsilon_0}\ln\dfrac sb > 0$, com concavidade para baixo.`, passo: 3 },
        ],
        resultado: r`O gráfico **(d)**.`,
        errosComuns: [
          r`Pôr $-3Q$ inteira na face externa: a face interna precisa blindar o fio.`,
          r`Achar que, por ser negativa, a casca dá potencial negativo fora: aqui $V(b) = 0$, e o potencial sobe contra o campo.`,
          r`Confundir a concavidade: $\ln s$ cresce cada vez mais devagar.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Gráfico (a): negativo perto do fio e descendo fora da casca.', porque: r`Os dois sinais estão trocados.` },
        { letra: 'b', texto: 'Gráfico (b): positivo perto do fio e subindo cada vez mais rápido fora da casca.', porque: r`Os sinais estão certos, mas $\ln s$ sobe cada vez mais devagar.` },
        { letra: 'c', texto: 'Gráfico (c): negativo perto do fio e descendo cada vez mais rápido fora da casca.', porque: r`Os dois sinais e a concavidade estão errados.` },
        { letra: 'd', texto: 'Gráfico (d): positivo perto do fio e subindo cada vez mais devagar fora da casca.', correta: true, porque: r`Correta.` },
        { letra: 'e', texto: 'Gráfico (e): negativo perto do fio e subindo cada vez mais devagar fora da casca.', porque: r`Perto de uma carga positiva, com $V$ nulo logo adiante, o potencial é positivo.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Passo e raio de uma hélice',
      resumo: 'O ângulo entre v e B sai só da geometria da trajetória.',
      enunciado: r`Uma partícula de carga $q$ e massa $m$ entra em uma região em que existe um campo magnético estacionário e uniforme $\vec B$ com uma velocidade $\vec v$ que é quase ortogonal à direção do campo. Como resultado disso essa partícula passa a se movimentar em uma trajetória helicoidal cujo passo é $s$ e o raio é $R$ (vide figura). Nessas condições, teremos que o ângulo $\alpha$ entre $\vec v$ e $\vec B$ será dado por:`,
      figura: { pagina: 3, recorte: [0.085, 0.06, 0.495, 0.925] },
      cena: {
        escala: 0.01,
        extensao: 11,
        unidade: 'cm',
        camera: { pos: [17, 7, 18], alvo: [0, 0, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9, duracao: 2.2e-6 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.08, max: 0.2, passo: 0.005 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 5e5, unidade: 'm/s', min: 2e5, max: 6e5, passo: 1e4 },
        { id: 'alfa', rotulo: 'Ângulo entre v e B', simbolo: r`\alpha`, valor: 80, unidade: '°', min: 65, max: 88, passo: 1 },
      ],
      objetos: [
        { id: 'By', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        { id: 'p', tipo: 'particula', rotulo: 'q, m', q: 'qe', m: 'mp', pos: [Rteo, Y0, 0], v: [0, 'v0*cos(rad(alfa))', 'v0*sin(rad(alfa))'], rastro: 3e-6 },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '3.2*cm', rotulo: 'v' },
        { id: 'spa', tipo: 'seta', papel: 'neutro', origem: "pos('p')", vetor: "[0, y(vel('p')), 0]", comprimento: '3.2*cm*cos(rad(alfa))', rotulo: 'v∥' },
        { id: 'spe', tipo: 'seta', papel: 'neutro', origem: "pos('p')", vetor: "[x(vel('p')), 0, z(vel('p'))]", comprimento: '3.2*cm*sin(rad(alfa))', rotulo: 'v⊥' },
      ],
      visual: { setasB: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Ângulo entre v e B, nas velocidades', simbolo: r`\alpha`, expr: "deg(atan2(sqrt(x(vel('p'))^2 + z(vel('p'))^2), y(vel('p'))))", unidade: '°', teoria: 'alfa' },
        { rotulo: 'Período', simbolo: 'T', expr: Tc, unidade: 's' },
        { rotulo: 'Raio, no rastro', simbolo: 'R', expr: Rmed, unidade: 'm', teoria: Rteo },
        { rotulo: 'Passo, do avanço ao longo de B', simbolo: 's', expr: Pmed, unidade: 'm', teoria: Pteo },
        { rotulo: '2πR/s, da trajetória', simbolo: r`2\pi R/s`, expr: `2*pi*${Rmed}/${Pmed}`, teoria: 'tan(rad(alfa))' },
        { rotulo: 'Tangente do ângulo', simbolo: r`\tan\alpha`, expr: 'tan(rad(alfa))' },
      ],
      passos: [
        {
          titulo: 'Decompor a velocidade',
          texto: r`Só a componente perpendicular a $\vec B$ sente força. Assim:

$$v_\perp = v\sin\alpha,\qquad v_\parallel = v\cos\alpha,\qquad \tan\alpha = \frac{v_\perp}{v_\parallel}.$$

Falta ligar essas duas velocidades ao raio e ao passo.`,
          medidas: [0],
        },
        {
          titulo: 'O círculo',
          texto: r`Projetado no plano perpendicular a $\vec B$, o movimento é um círculo de raio $R$, percorrido com rapidez $v_\perp$ em um período $T$:

$$v_\perp = \frac{2\pi R}{T}.$$

$T = 2\pi m/qB$ não depende da velocidade.`,
          medidas: [1, 2],
        },
        {
          titulo: 'O avanço',
          previsao: { pergunta: 'Durante uma volta, a partícula avança ao longo de B…', opcoes: ['v⊥ T', 'v∥ T', 'R'], correta: 1 },
          texto: r`Ao longo de $\vec B$ não há força, e $v_\parallel$ é constante. Em uma volta, ela avança o passo $s$:

$$v_\parallel = \frac sT.$$`,
          medidas: [1, 3],
        },
        {
          titulo: 'O ângulo',
          texto: r`$$\tan\alpha = \frac{v_\perp}{v_\parallel} = \frac{2\pi R/T}{s/T} = \frac{2\pi R}{s}.$$

Note que $q$, $m$, $B$ e $v$ somem: a resposta é pura geometria. Alternativa **(f)**.`,
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Movimento em campo magnético uniforme', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Componentes', texto: r`$\tan\alpha = v_\perp/v_\parallel$.`, passo: 0 },
          { titulo: 'Raio', texto: r`$v_\perp = 2\pi R/T$.`, passo: 1 },
          { titulo: 'Passo', texto: r`$v_\parallel = s/T$.`, passo: 2 },
          { titulo: 'Razão', texto: r`$\tan\alpha = 2\pi R/s$.`, passo: 3 },
        ],
        resultado: r`$\tan\alpha = \dfrac{2\pi R}{s}$: alternativa **(f)**.`,
        errosComuns: [
          r`Inverter a razão: com $\alpha$ medido a partir de $\vec B$, $\tan\alpha = v_\perp/v_\parallel$.`,
          r`Usar o diâmetro, ou meia volta, no lugar do comprimento $2\pi R$.`,
        ],
        oficial: { resposta: '(f)', observacao: r`As alternativas (a) e (e) são iguais no original.` },
      },
      alternativas: [
        { letra: 'a', texto: r`$\tan\alpha = \dfrac{\pi R}{s}$`, porque: r`Falta o fator 2: em uma volta, o caminho é $2\pi R$.` },
        { letra: 'b', texto: r`$\tan\alpha = \dfrac{2\pi s}{R}$`, porque: r`Troca $R$ e $s$.` },
        { letra: 'c', texto: r`$\tan\alpha = \dfrac{R}{2\pi s}$`, porque: r`Dimensionalmente certa, mas a geometria não dá isso.` },
        { letra: 'd', texto: r`$\tan\alpha = \dfrac{2s}{\pi R}$`, porque: r`A razão está invertida, e com o fator errado.` },
        { letra: 'e', texto: r`$\tan\alpha = \dfrac{\pi R}{s}$`, porque: r`Igual à (a): falta o fator 2.` },
        { letra: 'f', texto: r`$\tan\alpha = \dfrac{2\pi R}{s}$`, correta: true, porque: r`Correta.` },
        { letra: 'g', texto: r`$\tan\alpha = \dfrac{\pi R}{4s}$`, porque: r`Fator errado.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Espira atravessando uma região de campo',
      resumo: 'Associar Φ, ε e F a três gráficos.',
      enunciado: r`Uma espira quadrada condutora de lado $a$ que se movimenta com velocidade constante $\vec v = v\hat x$ entra em uma região onde existe um campo magnético uniforme e estacionário $\vec B = B\hat z$, como mostra a figura. Considerando os três gráficos que são apresentados indique aquele que melhor representa o comportamento, de acordo com a evolução do movimento, do fluxo $\Phi$ do campo magnético através da espira ($\Phi$), do módulo $F$ da força externa que deve ser aplicada na espira para que a sua velocidade seja constante ($F$) e da força eletromotriz induzida $\mathcal E$ na espira ($\mathcal E$). [Obs.: Considere que $\mathcal E_\text{ind} > 0$ quando $I_\text{ind}$ tiver o sentido anti-horário.]`,
      figura: [
        { pagina: 3, recorte: [0.505, 0.06, 0.925, 0.6] },
        { pagina: 3, recorte: [0.505, 0.585, 0.925, 0.935] },
      ],
      cena: {
        escala: 0.01,
        extensao: 10,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [4.5, 0, 22], alvo: [4.5, 0, 0] },
        tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 7 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 0.02, unidade: 'm/s', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'L', rotulo: 'Largura da região', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.06, max: 0.09, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.05, max: 0.5, passo: 0.05 },
        { id: 'x0', rotulo: 'Frente da espira', simbolo: 'x', valor: -0.0125, unidade: 'm', min: -0.0125, max: 0.1275, passo: 0.001 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [0, -0.05, -0.03], max: ['L', 0.05, 0.03] }, rotulo: 'B' },
        { id: 'M', tipo: 'espiraSensora', centro: [`${XF} - a/2`, 0, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
        /* Só a parte imersa: o fluxo sai exato, sem a integral numérica cruzar a borda do campo. */
        { id: 'S', tipo: 'espiraSensora', centro: [`(${lo} + ${hi})/2`, 0, 0], normal: 'z', largura: `max(${hi} - ${lo}, 1e-9)`, altura: 'a', eixoU: 'x', R: 'Rr', oculta: true },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [`${XF} - a/2`, 0, 0], vetor: [1, 0, 0], comprimento: '2*cm', rotulo: 'v' },
        { id: 'sF', tipo: 'seta', ativo: `abs(${ZONA}) > 0`, papel: 'forca', origem: [XF, 0, 0], vetor: [1, 0, 0], comprimento: '2.5*cm', rotulo: 'F externa' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*a*max(0, ${hi} - ${lo})` },
        { rotulo: 'fem (positiva: anti-horária)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: `${ZONA}*B0*a*v0` },
        { rotulo: 'Corrente (positiva: anti-horária)', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: `${ZONA}*B0*a*v0/Rr` },
        { rotulo: 'Força externa', simbolo: 'F', expr: "abs(Iind('S'))*a*B0", unidade: 'N', teoria: `abs(${ZONA})*(B0*a)^2*v0/Rr` },
      ],
      graficos: [
        {
          titulo: 'Φ, ε e F, normalizados pelo valor máximo',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.01, ate: 'L + a + 0.01', rotulo: 'x', unidade: 'm' },
          series: [
            { rotulo: 'Φ', expr: 'max(0, min(xx, L) - max(xx - a, 0))/a' },
            { rotulo: 'ε', expr: '(xx > 0 && xx < a ? -1 : (xx > L && xx < L + a ? 1 : 0))' },
            { rotulo: 'F', expr: '(xx > 0 && xx < a ? 1 : (xx > L && xx < L + a ? 1 : 0))' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Entrando: o fluxo sobe',
          texto: r`Com a frente em $x$, a parte imersa tem área $ax$:

$$\Phi = Bax\quad(0 < x < a).$$

Uma rampa. Depois, com a espira inteira dentro, $\Phi = Ba^2$; e ao sair, a rampa desce. Esse é o trapézio do gráfico **(3)**.`,
          parametros: { x0: 0.0155 },
          medidas: [0],
        },
        {
          titulo: 'A fem',
          previsao: { pergunta: 'Na entrada, a corrente induzida circula…', opcoes: ['no sentido horário', 'no sentido anti-horário'], correta: 0 },
          texto: r`$$\mathcal E = -\frac{d\Phi}{dt} = -Bav\quad\text{na entrada.}$$

Fluxo para fora da página crescendo: a corrente cria campo para dentro, no sentido **horário**, $\mathcal E < 0$. Na saída, $+Bav$. Com a espira inteira dentro, zero. Esse é o gráfico **(2)**.`,
          parametros: { x0: 0.0155 },
          medidas: [1, 2],
        },
        {
          titulo: 'Dentro, nada acontece',
          texto: r`Com a espira toda imersa, o fluxo é constante: sem fem, sem corrente, sem força. Ela segue sozinha, com velocidade constante.`,
          parametros: { x0: 0.0555 },
          medidas: [0, 1, 3],
        },
        {
          titulo: 'A força externa',
          texto: r`O campo age sobre o lado imerso: $F_m = IaB = B^2a^2v/R$, sempre freando (Lenz). Para manter $v$, a força externa aponta para a direita **nas duas passagens**:

$$F = \frac{B^2a^2v}{R}.$$

Módulo igual na entrada e na saída, zero no meio: gráfico **(1)**.`,
          parametros: { x0: 0.0955 },
          medidas: [1, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`(1) $\to F$, (2) $\to\mathcal E$, (3) $\to\Phi$: alternativa **(c)**.`,
          parametros: { x0: 0.0555 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e de Lenz', lab: 'faraday' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`Trapézio: $\Phi = Ba\times$(comprimento imerso). Gráfico (3).`, passo: 0 },
          { titulo: 'fem', texto: r`$\mathcal E = -d\Phi/dt$: $-Bav$ na entrada, $+Bav$ na saída. Gráfico (2).`, passo: 1 },
          { titulo: 'Força', texto: r`$F = B^2a^2v/R$ nas duas passagens. Gráfico (1).`, passo: 3 },
        ],
        resultado: r`(1) $\to F$, (2) $\to\mathcal E$, (3) $\to\Phi$: alternativa **(c)**.`,
        errosComuns: [
          r`Trocar os gráficos (1) e (2): a força é um módulo, sempre positiva; a fem troca de sinal.`,
          r`Achar que a espira inteira dentro do campo tem fem: é a **variação** do fluxo que conta.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`(1) $\to\Phi$, (2) $\to F$, (3) $\to\mathcal E$`, porque: r`O fluxo varia em rampa, e isso é o gráfico (3).` },
        { letra: 'b', texto: r`(1) $\to\mathcal E$, (2) $\to F$, (3) $\to\Phi$`, porque: r`$F$ é módulo, e o gráfico (2) tem sinal.` },
        { letra: 'c', texto: r`(1) $\to F$, (2) $\to\mathcal E$, (3) $\to\Phi$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`(1) $\to\Phi$, (2) $\to\mathcal E$, (3) $\to F$`, porque: r`Troca o fluxo com a força.` },
        { letra: 'e', texto: r`(1) $\to F$, (2) $\to\Phi$, (3) $\to\mathcal E$`, porque: r`Troca o fluxo com a fem.` },
        { letra: 'f', texto: r`(1) $\to\mathcal E$, (2) $\to\Phi$, (3) $\to F$`, porque: r`Nenhuma das três está certa.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Cabo coaxial com J não uniforme',
      resumo: 'Simetria, circulação e campo nas três regiões.',
      enunciado: r`Um cabo coaxial é formado por um cilindro condutor sólido de raio $a$ e uma casca cilíndrica condutora fina de raio $b$, ambos de comprimentos infinitos. A seção transversal do cabo é mostrada na figura abaixo. O cilindro possui uma densidade volumar de corrente estacionária, mas não-uniforme, dada por $\vec J = (3I_0/2\pi a^3)\,s\,\hat z$ ($s \le a$), onde $I_0$ é uma constante positiva, $s$ é a distância até o eixo comum e $\hat z$ é um vetor unitário ao longo deste eixo. A casca possui uma corrente estacionária de intensidade $I_0$ que flui em sentido contrário, ou seja, $-\hat z$.

(a) Assumindo que, de uma forma genérica, o campo magnético em um dado ponto $\mathcal P$ do espaço seja dado na forma $\vec B(s,\varphi,z) = B_s\hat s + B_\varphi\hat\varphi + B_z\hat z$, indique qual(is) componente(s) são nulas e de qual(is) coordenada(s) ela(s), de fato, pode(m) depender. [Sugestão: use argumentos baseados em simetria, ou lei de Gauss, ou lei de Biot-Savart.] (0,6 ponto) (b) Com base no resultado do item anterior, identifique uma curva fechada e orientada $\mathcal C$ apropriada para a dedução do campo magnético no ponto $\mathcal P$ e determine uma expressão para a circulação deste ao longo dela, $\Gamma_{\vec B}[\mathcal C] = \oint_{\mathcal C}\vec B\cdot d\vec\ell$. (0,6 ponto) (c) Aplicando a lei de Ampère, determine o campo magnético produzido pelo cabo no ponto $\mathcal P$. Analise separadamente as regiões (i) $0 \le s \le a$, (ii) $a \le s < b$ e (iii) $b < s < \infty$. (2,0 pontos) (d) Faça um gráfico do módulo $B$ do campo magnético como função da distância $s$ até o eixo, destacando todos os pontos relevantes. (0,8 ponto)`,
      figura: [
        { pagina: 4, recorte: [0.085, 0.1, 0.495, 0.72] },
        { pagina: 4, recorte: [0.195, 0.725, 0.365, 0.935] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I_0', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.012, unidade: 'm', min: 0.002, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'nuc', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', J: '3*I0/(2*pi*a^3)*r', rotulo: 'J(s)' },
        { id: 'cas', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'b', raioInterno: '0.995*b', I: '0-I0', rotulo: '−I₀' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['rs', 0, 0], rotulo: 'P' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Componente radial', simbolo: 'B_s', expr: 'x(B(rs, 0, 0))', unidade: 'T', teoria: 0 },
        { rotulo: 'Componente axial', simbolo: 'B_z', expr: 'z(B(rs, 0, 0))', unidade: 'T', teoria: 0 },
        { rotulo: 'Componente azimutal', simbolo: r`B_\varphi`, expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: Bphi('rs') },
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: Ienv },
        { rotulo: 'Circulação de B', simbolo: r`\Gamma`, expr: "circ('Amp')", unidade: 'T·m', teoria: `mu0*${Ienv}` },
        { rotulo: 'Pela fórmula 2πsB', simbolo: r`2\pi sB_\varphi`, expr: '2*pi*rs*y(B(rs, 0, 0))', unidade: 'T·m', teoria: `mu0*${Ienv}` },
      ],
      graficos: [
        {
          titulo: 'B(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.01*b', ate: '1.5*b', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: Bphi('ss'), unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Só sobra a componente azimutal',
          texto: r`O cabo não muda ao transladar em $z$ nem ao girar em $\varphi$: as componentes só dependem de $s$.

- **$B_s = 0$:** o fluxo por um cilindro coaxial é $B_s\cdot 2\pi sL$, e a lei de Gauss do magnetismo manda que seja zero.
- **$B_z = 0$:** toda corrente está ao longo de $\hat z$, e $d\vec\ell\times\hat r$ é sempre perpendicular a $\hat z$ (Biot-Savart).

Portanto, $\vec B = B_\varphi(s)\,\hat\varphi$.`,
          parametros: { rs: 0.012 },
          medidas: [0, 1, 2],
        },
        {
          item: 'b',
          titulo: '(b) Um círculo coaxial',
          texto: r`Escolha $\mathcal C$ circular, de raio $s$, coaxial e orientada no sentido de $\hat\varphi$. Sobre ela, $\vec B$ é tangente e tem módulo constante:

$$\Gamma_{\vec B}[\mathcal C] = \oint_{\mathcal C}B_\varphi\,d\ell = 2\pi s\,B_\varphi(s).$$`,
          parametros: { rs: 0.012 },
          medidas: [4, 5],
        },
        {
          item: 'c',
          titulo: '(c-i) Dentro do cilindro',
          previsao: { pergunta: 'Para s < a, B cresce com…', opcoes: ['s', 's²', 's³'], correta: 1 },
          texto: r`A corrente envolvida vem de anéis de área $2\pi s'\,ds'$:

$$I_\text{env} = \int_0^s\frac{3I_0s'}{2\pi a^3}\,2\pi s'\,ds' = I_0\left(\frac sa\right)^3.$$

Na lei de Ampère:

$$\vec B = \frac{\mu_0I_\text{env}}{2\pi s}\hat\varphi = \frac{\mu_0I_0s^2}{2\pi a^3}\hat\varphi.$$`,
          parametros: { rs: 0.012 },
          medidas: [3, 2],
        },
        {
          item: 'c',
          titulo: '(c-ii) Entre o cilindro e a casca',
          texto: r`A curva envolve toda a corrente do cilindro: a integral vai até $a$, e $I_\text{env} = I_0$.

$$\vec B = \frac{\mu_0I_0}{2\pi s}\hat\varphi.$$`,
          parametros: { rs: 0.034 },
          medidas: [3, 2],
        },
        {
          item: 'c',
          titulo: '(c-iii) Fora do cabo',
          texto: r`Agora a curva também envolve a casca, com $-I_0$: $I_\text{env} = 0$, e

$$\vec B = \vec 0.$$

Por isso os cabos coaxiais não irradiam campo para fora.`,
          parametros: { rs: 0.064 },
          medidas: [3, 2],
        },
        {
          item: 'd',
          titulo: '(d) O gráfico',
          texto: r`$B$ sobe como $s^2$ até o máximo $\mu_0I_0/2\pi a$, em $s = a$, onde é contínuo. Depois cai como $1/s$ até $\mu_0I_0/2\pi b$, e **salta para zero** em $s = b$: a casca fina é uma lâmina de corrente, que faz o campo descontínuo.`,
          parametros: { rs: 0.02 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' },
          { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$\vec B = B_\varphi(s)\,\hat\varphi$.`, passo: 0 },
          { titulo: '(b)', texto: r`$\Gamma = 2\pi sB_\varphi(s)$, num círculo coaxial.`, passo: 1 },
          { titulo: '(c-i)', texto: r`$I_\text{env} = I_0(s/a)^3$: $\vec B = \dfrac{\mu_0I_0s^2}{2\pi a^3}\hat\varphi$.`, passo: 2 },
          { titulo: '(c-ii)', texto: r`$\vec B = \dfrac{\mu_0I_0}{2\pi s}\hat\varphi$.`, passo: 3 },
          { titulo: '(c-iii)', texto: r`$\vec B = \vec 0$.`, passo: 4 },
          { titulo: '(d)', texto: r`Máximo em $s = a$ e salto em $s = b$.`, passo: 5 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0I_0s^2}{2\pi a^3}\hat\varphi$ para $s \le a$; $\dfrac{\mu_0I_0}{2\pi s}\hat\varphi$ para $a < s < b$; $\vec 0$ para $s > b$.`,
        errosComuns: [
          r`Usar $I_\text{env} = J\pi s^2$: $J$ varia com $s$, e é preciso integrar.`,
          r`Afirmar $\vec B$ contínuo em $s = b$: a casca fina carrega corrente superficial.`,
          r`Argumentar por Ampère em (a) e esquecer de justificar por que $B_s$ é nulo: é a lei de Gauss do magnetismo.`,
        ],
        oficial: {
          resposta: r`$\vec B = B_\varphi(s)\hat\varphi$; $\Gamma = 2\pi sB_\varphi$; $B_\varphi = \mu_0I_0s^2/2\pi a^3$, $\mu_0I_0/2\pi s$ e $0$ nas três regiões.`,
          observacao: r`O gabarito também mostra $B_z = 0$ com uma amperiana retangular coplanar ao eixo, somada à condição $B\to 0$ no infinito; o argumento de Biot-Savart é aceito como alternativa.`,
        },
      },
      respostas: [
        { item: 'a', texto: r`$B_s = B_z = 0$, e $\vec B = B_\varphi(s)\,\hat\varphi$.`, pontos: 0.6, criterio: 'Dependência só em s por simetria; B_s nulo por Gauss; B_z nulo por Ampère ou Biot-Savart.' },
        { item: 'b', texto: r`Círculo coaxial de raio $s$: $\Gamma = 2\pi sB_\varphi(s)$.`, pontos: 0.6, criterio: 'Curva e orientação escolhidas com justificativa.' },
        { item: 'c', texto: r`$\dfrac{\mu_0I_0s^2}{2\pi a^3}\hat\varphi$; $\dfrac{\mu_0I_0}{2\pi s}\hat\varphi$; $\vec 0$.`, pontos: 2, criterio: 'Integral da corrente em (i); corrente total em (ii); soma nula em (iii).' },
        { item: 'd', texto: r`Parábola até $\mu_0I_0/2\pi a$ em $s = a$; hipérbole até $\mu_0I_0/2\pi b$; salto a zero em $s = b$.`, pontos: 0.8, criterio: 'Fronteiras e valores nelas destacados.' },
      ],
    },
  ],
}

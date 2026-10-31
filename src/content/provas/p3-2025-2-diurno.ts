import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: disco com σ = σ₀(s/R)², em 16 anéis; cada um leva a carga exata da sua coroa. */
const N = 16
const aneis: ObjetoInput[] = Array.from({ length: N }, (_, i) => {
  const f0 = i / N
  const f1 = (i + 1) / N
  return {
    id: `r${i}`,
    tipo: 'anelCarga' as const,
    Q: `pi*sig0*R^2/2*${f1 ** 4 - f0 ** 4}`,
    centro: [0, 0, 0],
    raio: `${(f0 + f1) / 2}*R`,
    normal: 'z',
  }
})
const Qdisco = aneis.map((a) => `carga('${a.id}')`).join(' + ')

/* Objetiva 3: curvas fechadas dentro do cilindro. */
const circulo = (R: number): [number, number, number][] =>
  Array.from({ length: 73 }, (_, i) => {
    const a = (-i / 72) * 2 * Math.PI
    return [R * Math.cos(a), R * Math.sin(a), 0]
  })
const quadrado = (R: number): [number, number, number][] => [
  [R, -R, 0],
  [R, R, 0],
  [-R, R, 0],
  [-R, -R, 0],
  [R, -R, 0],
]

/* Objetiva 4: fem e corrente induzida na espira quadrada. */
const femQ = 'mu0*a*k/(2*pi)*ln((L + a)/L)'
const Iind = `${femQ}/Rr`
const Ifio = '(I0 + k*t)'

/* Discursiva: ângulo do trecho móvel, com fase para testar além de t = 0. */
const TH = '(w*t + rad(fase))'
const semi = Array.from({ length: 33 }, (_, i) => {
  const f = (i / 32) * Math.PI
  return [`r0*${Math.cos(f)}`, `r0*${Math.sin(f)}*cos${TH}`, `r0*${Math.sin(f)}*sin${TH}`] as [string, string, string]
})

/**
 * P3 de Física III, 2025/2, diurno, versão C (01/12/2025). Conferida com o
 * gabarito oficial: objetivas 1d, 2c, 3e, 4b, 5f, 6a, e a discursiva. Os pontos
 * da discursiva são os do gabarito (2,0; 0,6; 1,4), corrigidos à mão na prova.
 */
export const p3_2025_2_diurno: ProvaInput = {
  id: 'p3-2025-2-diurno',
  titulo: 'P3 · 2025/2 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão C · 01/12/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Plano infinito cortando um cubo',
      resumo: 'O campo em P, de onde ele vem e o fluxo total.',
      enunciado: r`Um plano infinito com densidade superficial $\sigma$ constante intercepta no meio um cubo de lado $L$ (superfície $S$, região $\mathcal R$), com duas faces paralelas ao plano. Seja $\mathcal P$ um ponto de uma das faces perpendiculares ao plano. Afirmativas: (I) O campo elétrico em $\mathcal P$ é nulo; (II) O campo em $\mathcal P$ se deve apenas à carga líquida contida em $\mathcal R$; (III) O fluxo do campo através de $S$ vale $\sigma L^2/\varepsilon_0$. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 1, recorte: [0.54, 0.035, 0.93, 0.48] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [10, 7, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 2e-9, unidade: 'C/m²', min: -4e-9, max: 4e-9, passo: 2e-10 },
        { id: 'L', rotulo: 'Lado do cubo', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.03, max: 0.09, passo: 0.002 },
      ],
      objetos: [
        { id: 'pl', tipo: 'planoInfinito', sigma: 'sig', ponto: [0, 0, 0], normal: 'y' },
        { id: 'S', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: 'L', rotulo: 'S' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['L/2', 'L/4', 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 9 },
      medidas: [
        { rotulo: 'Campo em P', simbolo: 'E', expr: 'mag(E(L/2, L/4, 0))', unidade: 'V/m', teoria: 'abs(sig)/(2*eps0)' },
        { rotulo: 'Carga em R', simbolo: r`Q_\text{int}`, expr: "Qenc('S')", unidade: 'C', teoria: 'sig*L^2' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('S')", unidade: 'V·m', teoria: 'sig*L^2/eps0' },
      ],
      passos: [
        {
          titulo: '(I) O campo em P não é nulo',
          texto: r`Um plano infinito cria campo uniforme em cada lado:

$$E = \frac{\sigma}{2\varepsilon_0}.$$

O ponto $\mathcal P$ está fora do plano: há campo. **Falsa.**`,
          destacar: ['P'],
          medidas: [0],
        },
        {
          titulo: '(II) Gauss dá o fluxo, não a origem do campo',
          previsao: { pergunta: 'Mudando o lado do cubo (e a carga dentro dele), o campo em P…', opcoes: ['muda', 'não muda'], correta: 1 },
          texto: r`Varie $L$: a carga em $\mathcal R$ muda, mas $E$ em $\mathcal P$ continua $\sigma/2\varepsilon_0$. O campo em cada ponto vem de **todas** as cargas do plano, dentro e fora do cubo. **Falsa.**

Gauss diz que as cargas de fora não mudam o fluxo total. Não diz que elas não criam campo.`,
          destacar: ['S'],
          medidas: [0, 1],
        },
        {
          titulo: '(III) O fluxo',
          texto: r`O plano corta o cubo numa área $L^2$: $Q_\text{int} = \sigma L^2$. Pela lei de Gauss:

$$\oint\vec E\cdot d\vec A = \frac{\sigma L^2}{\varepsilon_0}.$$

Conferindo face a face: cada face paralela dá $\frac{\sigma}{2\varepsilon_0}L^2$, e as outras quatro, zero. **Verdadeira.**`,
          medidas: [1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`Apenas a (III): alternativa **(d)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss e plano infinito', lab: 'gauss' }],
        etapas: [
          { titulo: '(I)', texto: r`$E = \sigma/2\varepsilon_0 \neq 0$ fora do plano. Falsa.`, passo: 0 },
          { titulo: '(II)', texto: r`O campo vem de todas as cargas. Só o fluxo total depende apenas de $Q_\text{int}$. Falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`$Q_\text{int} = \sigma L^2$ e $\Phi = \sigma L^2/\varepsilon_0$. Verdadeira.`, passo: 2 },
        ],
        resultado: r`Apenas a (III): alternativa **(d)**.`,
        errosComuns: [
          r`Achar que só as cargas dentro da gaussiana criam campo nela.`,
          r`Concluir $E = 0$ numa face porque o fluxo nela é nulo. Lá $\vec E$ é paralelo à face, não nulo.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Todas.', porque: r`(I) e (II) são falsas.` },
        { letra: 'b', texto: 'Apenas a I.', porque: r`O fluxo nessa face é nulo, mas o campo não: ele é paralelo à face.` },
        { letra: 'c', texto: 'Apenas a II.', porque: r`O campo em $\mathcal P$ vem de todo o plano.` },
        { letra: 'd', texto: 'Apenas a III.', correta: true, porque: r`Correta: $Q_\text{int} = \sigma L^2$ e a lei de Gauss dão o fluxo.` },
        { letra: 'e', texto: 'Apenas a I e a II.', porque: r`As duas são falsas.` },
        { letra: 'f', texto: 'Apenas a I e a III.', porque: r`A (III) é verdadeira, mas a (I) é falsa.` },
        { letra: 'g', texto: 'Apenas a II e a III.', porque: r`A (III) é verdadeira, mas a (II) é falsa.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`A (III) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Potencial no centro de um disco não uniforme',
      resumo: 'Disco com σ crescendo com s².',
      enunciado: r`Um disco circular não condutor, de espessura desprezível e raio $R$, tem densidade superficial estacionária, mas não uniforme, $\sigma(\vec r) = \sigma_0(s/R)^2$, onde $s$ é a distância radial até o centro e $\sigma_0$ é uma constante. Determine o potencial elétrico gerado pelo disco no seu centro, considerando que ele é nulo no infinito.`,
      figura: { pagina: 2, recorte: [0.075, 0.035, 0.475, 0.145] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [6, 7, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig0', rotulo: 'Constante σ₀', simbolo: r`\sigma_0`, valor: 1e-7, unidade: 'C/m²', min: 2e-8, max: 3e-7, passo: 1e-8 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.06, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        ...aneis,
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy', planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial no centro (soma dos anéis)', simbolo: 'V(O)', expr: 'V(0, 0, 0)', unidade: 'V', teoria: 'sig0*R/(6*eps0)' },
        { rotulo: 'Carga total', simbolo: 'Q', expr: Qdisco, unidade: 'C', teoria: 'pi*sig0*R^2/2' },
      ],
      graficos: [
        {
          titulo: 'Densidade σ(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0, ate: 'R', rotulo: 's', unidade: 'm' },
          series: [{ rotulo: 'σ', expr: 'sig0*(ss/R)^2', unidade: 'C/m²' }],
        },
        {
          titulo: 'Contribuição de cada coroa, dV/ds',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0, ate: 'R', rotulo: 's', unidade: 'm' },
          series: [{ rotulo: 'dV/ds', expr: 'sig0/(2*eps0)*(ss/R)^2', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Fatiar em coroas',
          texto: r`Todos os pontos de uma coroa de raio $s$ estão à mesma distância $s$ do centro. Sua carga é

$$dq = \sigma_0\frac{s^2}{R^2}\,2\pi s\,ds.$$

A cena é exatamente isso: 16 anéis, cada um com a carga da sua coroa.`,
          medidas: [1],
        },
        {
          titulo: 'Somar os potenciais',
          previsao: { pergunta: 'Comparado ao disco uniforme com σ₀, o potencial no centro é…', opcoes: ['maior', 'menor', 'igual'], correta: 1 },
          texto: r`$$V = \int_0^R\frac{1}{4\pi\varepsilon_0}\frac{dq}{s} = \frac{\sigma_0}{2\varepsilon_0R^2}\int_0^Rs^2\,ds = \frac{\sigma_0R}{6\varepsilon_0}.$$

O disco uniforme daria $\sigma_0R/2\varepsilon_0$, três vezes mais: aqui a carga está concentrada longe do centro, e o resto é menor que $\sigma_0$.`,
          medidas: [0],
        },
        {
          titulo: 'Resposta',
          texto: r`$V = \dfrac{\sigma_0R}{6\varepsilon_0}$: alternativa **(c)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial de distribuição contínua', lab: 'potencial' }],
        etapas: [
          { titulo: 'Elemento', texto: r`$dq = \sigma\,2\pi s\,ds$, à distância $s$ do centro: $dV = \dfrac{\sigma\,ds}{2\varepsilon_0}$.`, passo: 0 },
          { titulo: 'Integral', texto: r`$V = \dfrac{\sigma_0}{2\varepsilon_0R^2}\displaystyle\int_0^Rs^2ds = \dfrac{\sigma_0R}{6\varepsilon_0}$.`, passo: 1 },
        ],
        resultado: r`$V = \dfrac{\sigma_0R}{6\varepsilon_0}$: alternativa **(c)**.`,
        errosComuns: [
          r`Usar $\sigma$ uniforme, que leva a $\sigma_0R/2\varepsilon_0$.`,
          r`Esquecer que a distância ao centro é $s$, e que ela cancela com o $s$ do elemento de área.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\sigma_0R}{2\varepsilon_0}$`, porque: r`É o disco **uniforme**, com $\sigma = \sigma_0$.` },
        { letra: 'b', texto: r`$\dfrac{\sigma_0R}{6\pi\varepsilon_0}$`, porque: r`Sobra um $\pi$: ele cancela com o $2\pi$ do elemento de área.` },
        { letra: 'c', texto: r`$\dfrac{\sigma_0R}{6\varepsilon_0}$`, correta: true, porque: r`Correta: $\frac{\sigma_0}{2\varepsilon_0R^2}\cdot\frac{R^3}{3}$.` },
        { letra: 'd', texto: r`$\dfrac{\sigma_0R}{4\varepsilon_0}$`, porque: r`Integra $s^3$, sem cancelar o $s$ da distância com o do elemento de área, e ajusta a dimensão.` },
        { letra: 'e', texto: r`$\dfrac{\sigma_0R}{4\pi\varepsilon_0}$`, porque: r`Mesmo erro, com um $\pi$ que não sobra.` },
        { letra: 'f', texto: r`$\dfrac{\sigma_0R}{16\varepsilon_0}$`, porque: r`Fator sem origem na integral.` },
        { letra: 'g', texto: r`$\dfrac{\sigma_0R}{16\pi\varepsilon_0}$`, porque: r`Fator sem origem na integral.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Circulação por duas amperianas',
      resumo: 'Círculo horário e quadrado anti-horário num cilindro com J uniforme.',
      enunciado: r`Um cilindro sólido, condutor e muito longo conduz uma corrente estacionária e uniforme, com densidade $\vec J_0$ constante e orientada para dentro da página. No seu interior há duas curvas planas fechadas: $C_1$, uma circunferência de raio $R$ com sentido horário, e $C_2$, um quadrado de lado $2R$ com sentido anti-horário. Sendo $\Gamma_1 = \oint_{C_1}\vec B\cdot d\vec\ell$ e $\Gamma_2 = \oint_{C_2}\vec B\cdot d\vec\ell$, é correto afirmar que:`,
      figura: { pagina: 2, recorte: [0.53, 0.04, 0.94, 0.59] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'J0', rotulo: 'Densidade de corrente', simbolo: 'J_0', valor: 1e6, unidade: 'A/m²', min: 2e5, max: 2e6, passo: 1e5 },
        { id: 'Rc', rotulo: 'Raio do cilindro', simbolo: 'R_c', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        {
          id: 'curva',
          rotulo: 'Curva',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'C₁ (círculo)' },
            { valor: 2, rotulo: 'C₂ (quadrado)' },
          ],
        },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroInfinito', lambda: 0, ponto: [0, 0, 0], direcao: 'z', raio: 'Rc' },
        { id: 'Bj', tipo: 'campoB', valor: 'x^2 + y^2 < Rc^2 ? mu0*J0/2*[y, 0-x, 0] : mu0*J0*Rc^2/(2*(x^2 + y^2))*[y, 0-x, 0]' },
        { id: 'C1', tipo: 'caminho', ativo: 'curva==1', pontos: circulo(0.03), rotulo: 'C₁', seta: 0.13 },
        { id: 'C2', tipo: 'caminho', ativo: 'curva==2', pontos: quadrado(0.03), rotulo: 'C₂', seta: 0.13 },
        { id: 'tJ', tipo: 'rotulo', pos: [-0.042, 0, 0], texto: '⊗ J₀' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Circulação em C₁', simbolo: r`\Gamma_1`, ativo: 'curva==1', expr: "intB('C1')", unidade: 'T·m', teoria: 'mu0*J0*pi*0.03^2' },
        { rotulo: 'Circulação em C₂', simbolo: r`\Gamma_2`, ativo: 'curva==2', expr: "intB('C2')", unidade: 'T·m', teoria: '-mu0*J0*4*0.03^2' },
        { rotulo: 'Razão |Γ₂|/|Γ₁|', simbolo: r`|\Gamma_2/\Gamma_1|`, expr: '4/pi' },
      ],
      passos: [
        {
          titulo: 'Lei de Ampère',
          texto: r`$$\oint_C\vec B\cdot d\vec\ell = \mu_0I_\text{enc}.$$

O sentido da curva define o sinal: pela mão direita, com os dedos na curva, o polegar dá o sentido positivo da corrente. A densidade é uniforme, então $I_\text{enc} = J_0\times$ área envolvida.`,
        },
        {
          titulo: 'C₁: horário',
          previsao: { pergunta: 'Com C₁ horária e J para dentro da página, Γ₁ é…', opcoes: ['positiva', 'negativa'], correta: 0 },
          texto: r`Sentido horário: o polegar aponta para dentro da página, como $\vec J_0$. A corrente conta como positiva:

$$\Gamma_1 = +\mu_0J_0\pi R^2.$$

A integral é feita ponto a ponto na cena: $\vec B$ gira no sentido horário, a favor da curva.`,
          parametros: { curva: 1 },
          medidas: [0],
        },
        {
          titulo: 'C₂: anti-horário',
          texto: r`Sentido anti-horário: o polegar sai da página, e a corrente conta como negativa. A área é $4R^2$:

$$\Gamma_2 = -\mu_0J_0(2R)^2 = -4\mu_0J_0R^2.$$`,
          parametros: { curva: 2 },
          medidas: [1],
        },
        {
          titulo: 'Comparar',
          texto: r`O quadrado envolve mais área que o círculo: $4R^2 > \pi R^2$. Então $|\Gamma_1| < |\Gamma_2|$, com $|\Gamma_2/\Gamma_1| = 4/\pi$.

Resposta: alternativa **(e)**.`,
          parametros: { curva: 2 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère', lab: 'ampere' }],
        etapas: [
          { titulo: 'Sinais', texto: r`Regra da mão direita: $C_1$ horária conta $\vec J_0$ como positiva, $C_2$ anti-horária, como negativa.`, passo: 0 },
          { titulo: 'Valores', texto: r`$\Gamma_1 = \mu_0J_0\pi R^2$ e $\Gamma_2 = -4\mu_0J_0R^2$.`, passo: 2 },
          { titulo: 'Módulos', texto: r`$\pi < 4$: $|\Gamma_1| < |\Gamma_2|$.`, passo: 3 },
        ],
        resultado: r`$\Gamma_1 > 0$, $\Gamma_2 < 0$ e $|\Gamma_1| < |\Gamma_2|$: alternativa **(e)**.`,
        errosComuns: [
          r`Comparar perímetros em vez de áreas: o que entra é a corrente envolvida.`,
          r`Achar que $\vec B$ precisa ser constante na curva. Ampère vale para qualquer curva; só que no quadrado ele não dá $B$ diretamente.`,
          r`Confundir o sinal: horário com corrente entrando é positivo.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\Gamma_1 > 0$, $\Gamma_2 < 0$ e $|\Gamma_1| = |\Gamma_2|$`, porque: r`Sinais certos, mas as áreas envolvidas diferem.` },
        { letra: 'b', texto: r`$\Gamma_1 < 0$, $\Gamma_2 > 0$ e $|\Gamma_1| < |\Gamma_2|$`, porque: r`Módulos certos, sinais trocados.` },
        { letra: 'c', texto: r`$\Gamma_1 < 0$, $\Gamma_2 > 0$ e $|\Gamma_1| > |\Gamma_2|$`, porque: r`Sinais trocados, e o círculo envolve menos área que o quadrado.` },
        { letra: 'd', texto: r`$\Gamma_1 < 0$, $\Gamma_2 > 0$ e $|\Gamma_1| = |\Gamma_2|$`, porque: r`Sinais trocados e áreas diferentes.` },
        { letra: 'e', texto: r`$\Gamma_1 > 0$, $\Gamma_2 < 0$ e $|\Gamma_1| < |\Gamma_2|$`, correta: true, porque: r`Correta: sinais pela mão direita e $\pi R^2 < 4R^2$.` },
        { letra: 'f', texto: r`$\Gamma_1 > 0$, $\Gamma_2 < 0$ e $|\Gamma_1| > |\Gamma_2|$`, porque: r`Sinais certos, mas $\pi R^2 < 4R^2$.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Espira flexível perto de um fio com I crescente',
      resumo: 'Lenz decide para onde o centro de massa vai e o que acontece com a área.',
      enunciado: r`Um fio retilíneo vertical muito longo conduz corrente uniforme, para cima, cuja intensidade aumenta com o tempo. Em $t = t_0$, há uma espira quadrada, condutora e elástica (flexível), coplanar ao fio, à sua direita. Para onde o centro de massa da espira se desloca e o que ocorre com a sua área?`,
      figura: { pagina: 3, recorte: [0.11, 0.035, 0.49, 0.305] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [3, 0.5, 16], alvo: [3, 0, 0] }, tempo: { escala: 0.2, unidade: 's', passo: 0.01 } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente inicial', simbolo: 'I_0', valor: 20, unidade: 'A', min: 5, max: 40, passo: 1 },
        { id: 'k', rotulo: 'Taxa de aumento', simbolo: 'dI/dt', valor: 100, unidade: 'A/s', min: -200, max: 200, passo: 10 },
        { id: 'L', rotulo: 'Distância ao fio', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência da espira', simbolo: 'R', valor: 0.01, unidade: 'Ω', min: 0.005, max: 0.05, passo: 0.005 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: Ifio, ponto: [0, 0, 0], direcao: 'y', rotulo: 'I(t)' },
        { id: 'S', tipo: 'espiraSensora', centro: ['L + a/2', 0, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', oculta: true },
        { id: 'perto', tipo: 'fio', I: Iind, a: ['L', 'a/2', 0], b: ['L', '-a/2', 0] },
        { id: 'base', tipo: 'fio', I: Iind, a: ['L', '-a/2', 0], b: ['L + a', '-a/2', 0] },
        { id: 'longe', tipo: 'fio', I: Iind, a: ['L + a', '-a/2', 0], b: ['L + a', 'a/2', 0] },
        { id: 'topo', tipo: 'fio', I: Iind, a: ['L + a', 'a/2', 0], b: ['L', 'a/2', 0] },
        { id: 'Fp', tipo: 'seta', papel: 'forca', origem: ['L', 0, 0], vetor: "forca('perto','fw')", comprimento: '1.6*cm', rotulo: 'F perto' },
        { id: 'Fl', tipo: 'seta', papel: 'forca', origem: ['L + a', 0, 0], vetor: "forca('longe','fw')", comprimento: "1.6*cm*mag(forca('longe','fw'))/mag(forca('perto','fw'))", rotulo: 'F longe' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy', fontes: ['fw'] },
      medidas: [
        { rotulo: 'fem na espira (derivada do fluxo)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: femQ },
        { rotulo: 'Corrente induzida (anti-horária)', simbolo: r`I_\text{ind}`, expr: "Iind('S')", unidade: 'A', teoria: Iind },
        { rotulo: 'Força no lado próximo', simbolo: 'F_p', expr: "x(forca('perto','fw'))", unidade: 'N', teoria: `mu0*${Ifio}*(${Iind})*a/(2*pi*L)` },
        { rotulo: 'Força no lado distante', simbolo: 'F_l', expr: "x(forca('longe','fw'))", unidade: 'N', teoria: `-mu0*${Ifio}*(${Iind})*a/(2*pi*(L + a))` },
        { rotulo: 'Força resultante', simbolo: 'F_x', expr: "x(forca('perto','fw') + forca('longe','fw'))", unidade: 'N' },
      ],
      passos: [
        {
          titulo: 'Fluxo crescendo para dentro da página',
          texto: r`À direita do fio, com corrente para cima, $\vec B$ entra na página. Com $I$ crescendo, o fluxo para dentro aumenta.`,
          medidas: [0],
        },
        {
          titulo: 'Lenz: corrente anti-horária',
          previsao: { pergunta: 'A corrente induzida na espira circula…', opcoes: ['no sentido horário', 'no sentido anti-horário'], correta: 1 },
          texto: r`A corrente induzida cria um campo que se opõe ao **aumento** do fluxo: para fora da página, no interior da espira. Pela mão direita, ela é **anti-horária**.

Sobe no lado distante e desce no lado próximo.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Para onde vai o centro de massa',
          texto: r`O lado próximo tem corrente oposta à do fio: é **repelido** (para a direita). O lado distante tem corrente paralela: é atraído (para a esquerda), mas o campo ali é menor.

A resultante aponta para a **direita**: a espira foge para onde o fluxo é menor.`,
          destacar: ['Fp', 'Fl'],
          medidas: [2, 3, 4],
        },
        {
          titulo: 'O que acontece com a área',
          texto: r`As duas forças apontam para o **centro** da espira: a do lado próximo para a direita e a do lado distante para a esquerda. O mesmo vale para os lados horizontais, que são empurrados um contra o outro. A espira flexível **encolhe**.

Faz sentido: menos área, menos fluxo. Inverta $dI/dt$ e tudo muda de sinal.`,
          destacar: ['perto', 'longe'],
        },
        {
          titulo: 'Resposta',
          texto: r`Desloca-se para a direita e sua área diminui: alternativa **(b)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday e de Lenz', lab: 'faraday' },
          { texto: 'Força sobre corrente', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'Sentido da corrente', texto: r`O fluxo para dentro cresce; a corrente induzida cria campo para fora: anti-horária.`, passo: 1 },
          { titulo: 'Translação', texto: r`O lado próximo é repelido com força maior que a da atração no lado distante. Resultante para a direita.`, passo: 2 },
          { titulo: 'Deformação', texto: r`Em cada lado, $I\,d\vec\ell\times\vec B$ aponta para o interior da espira: a área diminui.`, passo: 3 },
        ],
        resultado: r`Direita, área diminui: alternativa **(b)**.`,
        errosComuns: [
          r`Esquecer que o campo cai com a distância: é essa diferença que dá a resultante.`,
          r`Achar que a espira é atraída porque "o fluxo quer aumentar". Lenz age contra a variação do fluxo.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'O CM fica imóvel e sua área se mantém.', porque: r`Há corrente induzida e forças não equilibradas.` },
        { letra: 'b', texto: 'O CM se desloca para a direita e sua área diminui.', correta: true, porque: r`Correta: as duas respostas reduzem o aumento do fluxo.` },
        { letra: 'c', texto: 'O CM se desloca para a direita e sua área aumenta.', porque: r`Área maior aumentaria o fluxo, contra Lenz.` },
        { letra: 'd', texto: 'O CM se desloca para a esquerda e sua área diminui.', porque: r`Ir para a esquerda levaria a espira a campo mais forte.` },
        { letra: 'e', texto: 'O CM se desloca para a esquerda e sua área aumenta.', porque: r`É o que aconteceria com $I$ **diminuindo**.` },
        { letra: 'f', texto: 'O CM se desloca para cima e sua área diminui.', porque: r`As forças nos lados horizontais se cancelam: não há resultante vertical.` },
        { letra: 'g', texto: 'O CM se desloca para baixo e sua área aumenta.', porque: r`Não há resultante vertical, e a área diminui.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'A razão e/m de Thomson',
      resumo: 'Campos cruzados que deixam o feixe em linha reta.',
      enunciado: r`Um feixe de elétrons (massa $m$, carga $-e$) é acelerado a partir do repouso por uma ddp de módulo $V$. Em seguida, entra numa região com campos $\vec E$ e $\vec B$ constantes, com $\vec E = -E\hat y$. Os módulos e orientações desses campos são escolhidos de forma a manter os elétrons em MRU até um anteparo. Qual é a orientação do campo magnético e a razão $e/m$ em função de $V$, $E$ e $B$?`,
      figura: { pagina: 3, recorte: [0.545, 0.035, 0.945, 0.44] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 2, 20], alvo: [0, 0, 0] }, tempo: { escala: 2e-8, unidade: 'ns', passo: 1e-11 } },
      parametros: [
        { id: 'V0', rotulo: 'ddp de aceleração', simbolo: 'V', valor: 100, unidade: 'V', min: 50, max: 300, passo: 10 },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.001, unidade: 'T', min: 0.0005, max: 0.002, passo: 0.0001 },
        { id: 'fE', rotulo: 'E em relação ao equilíbrio', simbolo: 'E/(vB)', valor: 1, min: 0.5, max: 1.5, passo: 0.05 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: [0, '0-fE*B0*sqrt(2*qe*V0/me)', 0] },
        { id: 'B', tipo: 'campoB', valor: [0, 0, '0-B0'] },
        { id: 'e', tipo: 'particula', rotulo: 'elétron', q: '0-qe', m: 'me', pos: [-0.08, 0, 0], v: ['sqrt(2*qe*V0/me)', 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('e')", vetor: "vel('e')", comprimento: '1.8*cm', rotulo: 'v' },
      ],
      visual: { setasE: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade do feixe', simbolo: 'v', expr: "mag(vel('e'))", unidade: 'm/s', teoria: 'sqrt(2*qe*V0/me)', ativo: 'fE==1' },
        { rotulo: 'Desvio do feixe', simbolo: 'y', expr: "y(pos('e'))", unidade: 'm', teoria: 0, ativo: 'fE==1' },
        { rotulo: 'Razão E²/(2B²V)', simbolo: 'e/m', expr: '(fE*B0*sqrt(2*qe*V0/me))^2/(2*B0^2*V0)', unidade: 'C/kg', teoria: 'qe/me', ativo: 'fE==1' },
      ],
      passos: [
        {
          titulo: 'Velocidade na entrada',
          texto: r`Partindo do repouso:

$$eV = \frac12mv^2 \quad\Rightarrow\quad v^2 = \frac{2eV}{m}.$$`,
          medidas: [0],
        },
        {
          titulo: 'Orientação de B',
          previsao: { pergunta: 'Para o elétron seguir reto, B aponta para…', opcoes: ['+ẑ', '−ẑ', '+ŷ', '−ŷ'], correta: 1 },
          texto: r`A força elétrica é $-e\vec E = +eE\hat y$, para cima. A magnética tem de apontar para baixo:

$$-e\,(v\hat x)\times\vec B = -eE\hat y.$$

Isso exige $\vec B$ ao longo de $-\hat z$, pois $\hat x\times(-\hat z) = \hat y$.`,
          parametros: { fE: 1 },
          medidas: [1],
        },
        {
          titulo: 'Equilíbrio de forças',
          texto: r`Módulos iguais: $eE = evB$, ou seja, $v = E/B$. O feixe segue reto; é um **seletor de velocidades**.

Mude $E/(vB)$: com o campo elétrico maior ou menor que o de equilíbrio, o feixe se curva.`,
          parametros: { fE: 1 },
          medidas: [1],
        },
        {
          titulo: 'A razão e/m',
          texto: r`Juntando $v = E/B$ com $v^2 = 2eV/m$:

$$\frac em = \frac{E^2}{2B^2V}.$$

Tudo do lado direito é medido no laboratório. Alternativa **(f)**.`,
          parametros: { fE: 1 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz e seletor de velocidades', lab: 'lorentz' },
          { texto: 'Energia cinética e ddp' },
        ],
        etapas: [
          { titulo: 'Aceleração', texto: r`$eV = mv^2/2$.`, passo: 0 },
          { titulo: 'Sentido', texto: r`A força elétrica sobre $-e$ é $+eE\hat y$. Para cancelá-la, $\vec B$ aponta para $-\hat z$.`, passo: 1 },
          { titulo: 'Módulo', texto: r`$E = vB$. Substituindo $v$: $e/m = E^2/2B^2V$.`, passo: 3 },
        ],
        resultado: r`$\vec B$ ao longo de $-\hat z$ e $e/m = \dfrac{E^2}{2B^2V}$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar carga positiva ao aplicar $q\vec v\times\vec B$: o elétron tem $q = -e$.`,
          r`Esquecer o 1/2 da energia cinética, que leva ao fator 2.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$+\hat z$ e $\dfrac{E^2}{B^2V}$`, porque: r`Sentido errado e falta o 2 da energia cinética.` },
        { letra: 'b', texto: r`$-\hat z$ e $\dfrac{E^2}{B^2V}$`, porque: r`Sentido certo, mas $v^2 = 2eV/m$ traz um fator 2 no denominador.` },
        { letra: 'c', texto: r`$+\hat y$ e $\dfrac{E^2}{B^2V}$`, porque: r`$\vec B$ paralelo a $\vec E$ não daria força magnética oposta à elétrica.` },
        { letra: 'd', texto: r`$-\hat y$ e $\dfrac{E^2}{B^2V}$`, porque: r`Mesmo erro: $\vec B$ tem de ser perpendicular a $\vec E$ e a $\vec v$.` },
        { letra: 'e', texto: r`$+\hat z$ e $\dfrac{E^2}{2B^2V}$`, porque: r`Razão certa, sentido errado: valeria para carga positiva com $\vec E$ oposto.` },
        { letra: 'f', texto: r`$-\hat z$ e $\dfrac{E^2}{2B^2V}$`, correta: true, porque: r`Correta: a força magnética sobre $-e$ aponta para $-\hat y$, e $v = E/B$.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Dois fios tangentes a um anel',
      resumo: 'Campo no centro: três contribuições no mesmo sentido.',
      enunciado: r`Dois fios retilíneos, paralelos e muito longos são tangentes a um outro fio, circular, de raio $R$. Ao longo deles flui uma corrente constante de intensidade $I$: para a direita no fio de cima, para a esquerda no de baixo, e no sentido horário no anel (cf. figura). Qual é o campo magnético, devido a tais fios, no centro do anel, com $\hat z$ saindo da página?`,
      figura: [
        { pagina: 4, recorte: [0.09, 0.035, 0.475, 0.125] },
        { pagina: 4, recorte: [0.225, 0.2, 0.475, 0.31] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'f1', tipo: 'fioInfinito', I: 'I0', ponto: [0, 'R', 0], direcao: 'x', rotulo: 'I' },
        { id: 'f2', tipo: 'fioInfinito', I: '0-I0', ponto: [0, '0-R', 0], direcao: 'x', rotulo: 'I' },
        { id: 'an', tipo: 'espira', I: '0-I0', centro: [0, 0, 0], raio: 'R', normal: 'z', rotulo: 'anel' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Do fio de cima', simbolo: 'B_1', expr: "z(Bde('f1', 0, 0, 0))", unidade: 'T', teoria: '-mu0*I0/(2*pi*R)' },
        { rotulo: 'Do fio de baixo', simbolo: 'B_2', expr: "z(Bde('f2', 0, 0, 0))", unidade: 'T', teoria: '-mu0*I0/(2*pi*R)' },
        { rotulo: 'Do anel', simbolo: 'B_3', expr: "z(Bde('an', 0, 0, 0))", unidade: 'T', teoria: '-mu0*I0/(2*R)' },
        { rotulo: 'Total', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '-(2 + pi)*mu0*I0/(2*pi*R)' },
      ],
      passos: [
        {
          titulo: 'Os dois fios',
          texto: r`Fio de cima: corrente para a direita, ponto abaixo dele. Pela mão direita, o campo entra na página. Fio de baixo: corrente para a esquerda, ponto acima: também entra.

$$B_1 = B_2 = \frac{\mu_0I}{2\pi R}\quad(-\hat z).$$`,
          destacar: ['f1', 'f2'],
          medidas: [0, 1],
        },
        {
          titulo: 'O anel',
          previsao: { pergunta: 'O campo do anel, em sentido horário, no centro aponta…', opcoes: ['para dentro da página', 'para fora da página'], correta: 0 },
          texto: r`Corrente em sentido horário: o campo no centro entra na página, com módulo

$$B_3 = \frac{\mu_0I}{2R} = \pi\,\frac{\mu_0I}{2\pi R}.$$`,
          destacar: ['an'],
          medidas: [2],
        },
        {
          titulo: 'Somar',
          texto: r`Os três apontam para $-\hat z$:

$$\vec B = -\frac{(2 + \pi)\,\mu_0I}{2\pi R}\,\hat z.$$

Alternativa **(a)**.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de fio e de espira', lab: 'ampere' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Fios', texto: r`Cada um dá $\mu_0I/2\pi R$ para dentro da página.`, passo: 0 },
          { titulo: 'Anel', texto: r`Dá $\mu_0I/2R$ para dentro da página.`, passo: 1 },
          { titulo: 'Soma', texto: r`$B = \dfrac{\mu_0I}{2\pi R}(1 + 1 + \pi)$, ao longo de $-\hat z$.`, passo: 2 },
        ],
        resultado: r`$\vec B = -\dfrac{(2+\pi)\mu_0I}{2\pi R}\hat z$: alternativa **(a)**.`,
        errosComuns: [
          r`Achar que os fios se cancelam por terem correntes opostas. Eles estão em lados opostos do ponto: os campos se somam.`,
          r`Trocar $\mu_0I/2R$ (anel) por $\mu_0I/2\pi R$ (fio).`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{(2+\pi)\mu_0I}{2\pi R}\hat z$`, correta: true, porque: r`Correta: as três contribuições entram na página.` },
        { letra: 'b', texto: r`$\dfrac{(2+\pi)\mu_0I}{2\pi R}\hat z$`, porque: r`Módulo certo, sentido errado.` },
        { letra: 'c', texto: r`$-\dfrac{(1+\pi)\mu_0I}{2\pi R}\hat z$`, porque: r`Conta só um dos fios.` },
        { letra: 'd', texto: r`$\dfrac{(1+\pi)\mu_0I}{2\pi R}\hat z$`, porque: r`Conta um fio só e erra o sentido.` },
        { letra: 'e', texto: r`$\dfrac{(2-\pi)\mu_0I}{2\pi R}\hat z$`, porque: r`Faz o anel se opor aos fios, mas ele tem o mesmo sentido que eles.` },
        { letra: 'f', texto: r`$\dfrac{(-2+\pi)\mu_0I}{2\pi R}\hat z$`, porque: r`Faz o anel se opor aos fios.` },
        { letra: 'g', texto: r`$\vec 0$`, porque: r`Nada se cancela aqui.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Circuito com trecho semicircular girando',
      resumo: 'Fluxo, fem e corrente induzidos pela rotação de uma parte do circuito.',
      enunciado: r`Um fio condutor possui um trecho móvel semicircular de raio $r$, que forma um circuito fechado com uma base retangular condutora, fixa no plano $xy$, de largura $W = 3r$ e altura $h = 2r$. O trecho semicircular gira em torno do eixo $x$, com $\vec\omega = \omega\hat x$ constante. O circuito está imerso em $\vec B = B\hat z$ constante. Em $t = 0$, o trecho semicircular está no plano $xy$, e seu versor normal $\hat n(0)$ coincide com $\hat z$. A resistividade dos condutores é $\rho$ e sua seção transversal é $a$.

(a) Obtenha o fluxo $\Phi_B(t)$ através de uma superfície delimitada pelo circuito, quando $\hat n(t)$ faz um ângulo $\theta(t)$ com $\vec B$. (b) Determine a fem induzida $\mathcal E_\text{ind}(t)$. (c) Determine a corrente induzida $I_\text{ind}(t)$.`,
      figura: [
        { pagina: 4, recorte: [0.075, 0.5, 0.475, 0.895] },
        { pagina: 4, recorte: [0.52, 0.03, 0.935, 0.31] },
        { pagina: 4, recorte: [0.545, 0.345, 0.935, 0.395] },
      ],
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [7, -9, 11], alvo: [0, -1, 0] }, tempo: { escala: 0.25, unidade: 's', passo: 0.002 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'w', rotulo: 'Velocidade angular', simbolo: r`\omega`, valor: 6.283, unidade: 'rad/s', min: 1, max: 12, passo: 0.1 },
        { id: 'r0', rotulo: 'Raio do trecho móvel', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1e-8, max: 1e-7, passo: 1e-9 },
        { id: 'aa', rotulo: 'Seção do fio', simbolo: 'a', valor: 1e-6, unidade: 'm²', min: 5e-7, max: 3e-6, passo: 1e-7 },
        { id: 'fase', rotulo: 'Ângulo inicial', simbolo: r`\theta_0`, valor: 0, unidade: '°', min: 0, max: 180, passo: 5 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'base', tipo: 'caminho', pontos: [['0-r0', 0, 0], ['-1.5*r0', 0, 0], ['-1.5*r0', '-2*r0', 0], ['1.5*r0', '-2*r0', 0], ['1.5*r0', 0, 0], ['r0', 0, 0]], seta: 0.5, rotulo: 'base fixa' },
        { id: 'semi', tipo: 'caminho', pontos: semi, seta: 0.5, rotulo: 'trecho móvel' },
        { id: 'Sr', tipo: 'espiraSensora', centro: [0, '-r0', 0], normal: 'z', largura: '3*r0', altura: '2*r0', eixoU: 'x', oculta: true },
        { id: 'Sd', tipo: 'espiraSensora', centro: [0, 0, 0], normal: [0, `-sin${TH}`, `cos${TH}`], raio: 'r0', N: 0.5, oculta: true },
        { id: 'n', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: [0, `-sin${TH}`, `cos${TH}`], comprimento: '1.8*cm', rotulo: 'n̂' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo pelo circuito', simbolo: r`\Phi_B`, expr: "fluxoB('Sr') + fluxoB('Sd')/2", unidade: 'Wb', teoria: `r0^2*B0*(6 + pi/2*cos${TH})` },
        { rotulo: 'Parcela fixa (retângulo)', simbolo: r`Bh W`, expr: "fluxoB('Sr')", unidade: 'Wb', teoria: '6*r0^2*B0' },
        { rotulo: 'fem induzida', simbolo: r`\mathcal E_\text{ind}`, expr: "fem('Sd')", unidade: 'V', teoria: `pi/2*r0^2*B0*w*sin${TH}` },
        { rotulo: 'Resistência do circuito', simbolo: 'R', expr: 'rho*(8 + pi)*r0/aa', unidade: 'Ω' },
        { rotulo: 'Corrente induzida', simbolo: r`I_\text{ind}`, expr: "fem('Sd')/(rho*(8 + pi)*r0/aa)", unidade: 'A', teoria: `pi*aa*r0*B0*w/(2*rho*(8 + pi))*sin${TH}` },
      ],
      graficos: [
        {
          titulo: 'Fluxo e fem no tempo',
          tipo: 'tempo',
          janela: 3,
          series: [
            { rotulo: 'Φ', expr: "fluxoB('Sr') + fluxoB('Sd')/2", unidade: 'Wb' },
            { rotulo: 'ε', expr: "fem('Sd')", unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Duas parcelas de fluxo',
          texto: r`O circuito tem uma parte fixa, o retângulo de área $hW$, e uma móvel, o semicírculo de área $\frac12\pi r^2$. Numa superfície delimitada pelo circuito:

$$\Phi_B = BhW + B\,\frac{\pi r^2}{2}\cos\theta(t).$$

Só a parcela do semicírculo varia. Rode a simulação e veja $\hat n$ girar.`,
          parametros: { fase: 0 },
          medidas: [0, 1],
        },
        {
          item: 'a',
          titulo: '(a) Em função do tempo',
          texto: r`Com $h = 2r$, $W = 3r$ e $\theta = \omega t$:

$$\Phi_B(t) = r^2B\left[6 + \frac\pi2\cos(\omega t)\right].$$

Para $\theta = 60°$, a parcela móvel cai à metade.`,
          parametros: { fase: 60 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) A fem',
          previsao: { pergunta: 'Quando o trecho móvel está no plano xy (θ = 0), a fem é…', opcoes: ['máxima', 'nula'], correta: 1 },
          texto: r`$$\mathcal E_\text{ind} = -\frac{d\Phi_B}{dt} = \frac\pi2r^2B\omega\sin(\omega t).$$

A fem é máxima quando o semicírculo está perpendicular ao plano $xy$ ($\theta = 90°$), e o fluxo muda mais rápido. Em $\theta = 0$ o fluxo é máximo, e a fem é nula.`,
          parametros: { fase: 90 },
          medidas: [2],
        },
        {
          item: 'c',
          titulo: '(c) Resistência do circuito',
          texto: r`O comprimento total é o perímetro, sem a parte reta do diâmetro e com o semicírculo:

$$\ell = 2h + 2W - 2r + \pi r = (8 + \pi)r, \qquad R = \frac{\rho\ell}{a} = \frac{\rho(8+\pi)r}{a}.$$`,
          parametros: { fase: 90 },
          medidas: [3],
        },
        {
          item: 'c',
          titulo: '(c) A corrente',
          texto: r`$$I_\text{ind}(t) = \frac{\mathcal E_\text{ind}}{R} = \frac{\pi a r B\omega}{2\rho(8+\pi)}\sin(\omega t).$$

Note que $r$ aparece elevado a 1: a fem cresce com $r^2$ e a resistência com $r$.`,
          parametros: { fase: 60 },
          medidas: [2, 4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday', lab: 'faraday' },
          { texto: 'Resistência de um fio', lab: 'circuitos' },
        ],
        etapas: [
          { titulo: '(a) Fluxo', texto: r`$\Phi_B = BhW + \frac12\pi r^2B\cos\theta = r^2B\left[6 + \frac\pi2\cos(\omega t)\right]$.`, passo: 1 },
          { titulo: '(b) fem', texto: r`$\mathcal E_\text{ind} = -d\Phi_B/dt = \frac\pi2r^2B\omega\sin(\omega t)$.`, passo: 2 },
          { titulo: '(c) Resistência', texto: r`$\ell = 2h + W + (W - 2r) + \pi r = (8+\pi)r$ e $R = \rho\ell/a$.`, passo: 3 },
          { titulo: '(c) Corrente', texto: r`$I_\text{ind} = \mathcal E_\text{ind}/R = \dfrac{\pi arB\omega}{2\rho(8+\pi)}\sin(\omega t)$.`, passo: 4 },
        ],
        resultado: r`$\Phi_B = r^2B\left[6 + \frac\pi2\cos\omega t\right]$; $\mathcal E_\text{ind} = \frac\pi2r^2B\omega\sin\omega t$; $I_\text{ind} = \dfrac{\pi arB\omega}{2\rho(8+\pi)}\sin\omega t$.`,
        errosComuns: [
          r`Esquecer a parcela fixa do fluxo. Ela some na derivada, mas faz parte da resposta de (a).`,
          r`Usar o perímetro do retângulo inteiro: o diâmetro $2r$ não tem fio.`,
          r`Usar $\pi r^2$: a parte móvel é um **semi**círculo.`,
        ],
        oficial: {
          resposta: r`$\Phi_B = r^2B\left[6 + \frac\pi2\cos\omega t\right]$; $\mathcal E_\text{ind} = \frac\pi2r^2B\omega\sin\omega t$; $I_\text{ind} = \dfrac{\pi arB\omega}{2\rho(8+\pi)}\sin\omega t$.`,
          observacao: r`A prova imprime $\vec B$ saindo da página; as figuras do gabarito desenham $\otimes$, mas as contas usam $\vec B = B\hat z$, como aqui.`,
        },
      },
      respostas: [
        { item: 'a', texto: r`$\Phi_B(t) = r^2B\left[6 + \frac\pi2\cos(\omega t)\right]$`, pontos: 2, criterio: 'Parcela fixa, parcela móvel com cos θ e substituição de h, W e θ.' },
        { item: 'b', texto: r`$\mathcal E_\text{ind}(t) = \frac\pi2r^2B\omega\sin(\omega t)$`, pontos: 0.6, criterio: 'Lei de Faraday.' },
        { item: 'c', texto: r`$I_\text{ind}(t) = \dfrac{\pi arB\omega}{2\rho(8+\pi)}\sin(\omega t)$`, pontos: 1.4, criterio: r`Comprimento $\ell = (8+\pi)r$, resistência e corrente.` },
      ],
    },
  ],
}

import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/*
 * Objetiva 1: condutor esférico de raio B, neutro por fora, com duas cavidades
 * esféricas e partículas nos centros, mais uma partícula externa. Solução exata:
 * em cada cavidade só existe o campo da própria partícula; no metal, nada; fora,
 * a partícula externa, sua imagem de Kelvin e o oposto da imagem no centro.
 * Como a carga total de dentro da superfície externa é nula, Q_ext = 0.
 */
const B = 0.07
const A1 = 0.016
const A2 = 0.016
const C1 = '[-0.03,0,0]'
const C2 = '[0.03,-0.012,0]'
const PE = [-0.02, 0.1, 0]
const DE = Math.hypot(PE[0], PE[1])
const kI = (B * B) / (DE * DE)
const IMG = `[${PE[0] * kI},${PE[1] * kI},0]`
const QIMG = `(-2*Qq*${B / DE})`
const P = '[x,y,z]'
const ptE = (q: string, c: string) => `k0*(${q})*(${P}-${c})/mag(${P}-${c})^3`
const ptV = (q: string, c: string) => `k0*(${q})/mag(${P}-${c})`
const PEs = `[${PE[0]},${PE[1]},0]`
const E1 = ptE('Qq', C1)
const E2 = ptE('-2*Qq', C2)
const Ex = ptE('2*Qq', PEs)
const V1 = ptV('Qq', C1)
const V2 = ptV('-2*Qq', C2)
const Vx = ptV('2*Qq', PEs)
const Vc = `(0-${QIMG}*k0/${B})`
const induzidoE =
  `mag(${P}-${C1}) < ${A1} ? (0-1)*(${E2} + ${Ex})` +
  ` : (mag(${P}-${C2}) < ${A2} ? (0-1)*(${E1} + ${Ex})` +
  ` : (mag(${P}) < ${B} ? (0-1)*(${E1} + ${E2} + ${Ex})` +
  ` : ${ptE(QIMG, IMG)} + ${ptE(`0-${QIMG}`, '[0,0,0]')} - ${E1} - ${E2}))`
const induzidoV =
  `mag(${P}-${C1}) < ${A1} ? ${Vc} - k0*Qq/${A1} - ${V2} - ${Vx}` +
  ` : (mag(${P}-${C2}) < ${A2} ? ${Vc} + 2*k0*Qq/${A2} - ${V1} - ${Vx}` +
  ` : (mag(${P}) < ${B} ? ${Vc} - ${V1} - ${V2} - ${Vx}` +
  ` : ${ptV(QIMG, IMG)} + ${ptV(`0-${QIMG}`, '[0,0,0]')} - ${V1} - ${V2}))`

/* Discursiva */
const Qs = (u: string, v = `(${u})`) => `sig*exp(-min(${v}, D)/D)`
const Ez = (u: string, v = `(${u})`) => `(${v} < 0 ? 0 : sig/eps0*exp(-min(${v}, D)/D))`
const Vz = (u: string, v = `(${u})`) =>
  `(${v} < D ? sig*D/eps0*(exp(-max(${v}, 0)/D) - exp(-1)) : sig*D/eps0*exp(-1)*(1 - ${v}/D))`

/**
 * P1 de Física III, 2024/1, diurno, versão C (29/04/2024). Conferida com o
 * gabarito oficial: objetivas 1a, 2b, 3d, 4f, 5c, 6e, e a discursiva.
 */
export const p1_2024_1_diurno: ProvaInput = {
  id: 'p1-2024-1-diurno',
  titulo: 'P1 · 2024/1 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão C · 29/04/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Condutor com duas cavidades',
      resumo: 'Carga na superfície externa, com partículas dentro e fora.',
      enunciado: r`Um objeto condutor possui duas cavidades, como mostrado na figura. No interior de uma das cavidades, há uma partícula de carga $q > 0$, enquanto no interior da outra cavidade há uma partícula de carga $-2q$. Na região externa ao objeto, há ainda uma terceira partícula de carga $2q$. Supondo que o sistema se encontra em equilíbrio eletrostático e que o objeto condutor possui uma carga total igual a $q$, podemos afirmar que a carga total distribuída sobre sua superfície externa vale`,
      figura: [
        { pagina: 1, recorte: [0.075, 0.495, 0.49, 0.665] },
        { pagina: 1, recorte: [0.2, 0.665, 0.45, 0.9] },
      ],
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3, 27], alvo: [0, 2, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.058, unidade: 'm', min: 0.05, max: 0.09, passo: 0.002 },
      ],
      objetos: [
        { id: 'cond', tipo: 'esfera', Q: 0, centro: [0, 0, 0], raio: B },
        { id: 'cav1', tipo: 'esfera', Q: 0, centro: [-0.03, 0, 0], raio: A1, oca: true },
        { id: 'cav2', tipo: 'esfera', Q: 0, centro: [0.03, -0.012, 0], raio: A2, oca: true },
        { id: 'c1', tipo: 'carga', q: 'Qq', pos: [-0.03, 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: '-2*Qq', pos: [0.03, -0.012, 0], rotulo: '−2q' },
        { id: 'c3', tipo: 'carga', q: '2*Qq', pos: [PE[0], PE[1], 0], rotulo: '2q' },
        { id: 'ind', tipo: 'campoE', valor: induzidoE, potencial: induzidoV },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 19, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro de S, em unidades de q', simbolo: r`\varepsilon_0\Phi/q`, expr: "floor(1e6*eps0*fluxo('G')/Qq + 0.5)/1e6", teoria: 0 },
        { rotulo: 'Campo no metal', simbolo: 'E', expr: 'mag(E(0, 0.05, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Potencial na superfície menos no metal', simbolo: r`\Delta V`, expr: `V(${B}, 0, 0) - V(0, 0.05, 0)`, unidade: 'V', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Cada cavidade blinda a sua partícula',
          texto: r`Uma gaussiana dentro do metal, em volta de cada cavidade, tem fluxo nulo, pois $\vec E = 0$ no metal. Logo, a parede de cada cavidade compensa a partícula:

$$Q_\text{int,1} = -q, \qquad Q_\text{int,2} = +2q.$$

Veja as setas: há campo nas cavidades e fora, nada no metal.`,
          medidas: [2],
        },
        {
          titulo: 'Conservação no condutor',
          previsao: { pergunta: 'A carga externa de 2q influencia a carga total da superfície externa?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`A carga do condutor está nas três superfícies:

$$q = Q_\text{int,1} + Q_\text{int,2} + Q_\text{ext} = -q + 2q + Q_\text{ext} \quad\Rightarrow\quad Q_\text{ext} = 0.$$

A partícula de fora só redistribui a carga na superfície externa: atrai a negativa para um lado e empurra a positiva para o outro, com soma zero.`,
        },
        {
          titulo: 'Conferir pelo fluxo',
          texto: r`Uma gaussiana no metal, envolvendo as cavidades, tem fluxo nulo: dentro dela há $q - 2q - q + 2q = 0$. Leve a gaussiana para fora do metal: ela passa a incluir $Q_\text{ext}$, e o fluxo continua nulo.

Alternativa **(a)**.`,
          parametros: { rg: 0.082 },
          medidas: [0, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio', lab: 'gauss' },
          { texto: 'Lei de Gauss', lab: 'gauss' },
        ],
        etapas: [
          { titulo: 'Cavidades', texto: r`Gauss no metal: $Q_\text{int,1} = -q$ e $Q_\text{int,2} = 2q$.`, passo: 0 },
          { titulo: 'Conservação', texto: r`$Q_\text{ext} = q - (-q) - 2q = 0$.`, passo: 1 },
        ],
        resultado: r`$Q_\text{ext} = 0$: alternativa **(a)**.`,
        errosComuns: [
          r`Contar a partícula externa: ela está fora do condutor.`,
          r`Somar as partículas das cavidades à carga do condutor sem separar as paredes.`,
          r`Concluir que o campo fora é nulo: há campo, mesmo com $Q_\text{ext} = 0$.`,
        ],
        oficial: { resposta: '(a)', observacao: r`Na cena, as cavidades são esféricas e as partículas estão nos centros, o que permite uma solução exata. O resultado vale para qualquer forma.` },
      },
      alternativas: [
        { letra: 'a', texto: '$0$', correta: true, porque: r`Correta: $q - (-q + 2q) = 0$.` },
        { letra: 'b', texto: '$q$', porque: r`Esquece as cargas das paredes das cavidades.` },
        { letra: 'c', texto: '$-q$', porque: r`Soma as partículas das cavidades, sem a carga do condutor.` },
        { letra: 'd', texto: '$2q$', porque: r`Essa é a carga da partícula externa, que não muda o total.` },
        { letra: 'e', texto: '$-2q$', porque: r`Trata a partícula externa como se induzisse carga líquida.` },
        { letra: 'f', texto: '$3q$', porque: r`Soma $q$ com a carga externa.` },
        { letra: 'g', texto: '$-3q$', porque: r`Não sai da conservação de carga.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Lendo pontos notáveis em V(x)',
      resumo: 'Cargas q e −4q: mínimo e zero do potencial em x < 0.',
      enunciado: r`Considere duas partículas carregadas posicionadas ao longo do eixo $x$: uma com carga $q$ ($q > 0$), localizada na origem, e a outra com carga $-4q$, situada em $(2\,\text{m}, 0)$. O potencial elétrico resultante, $V$, é ilustrado, como função da coordenada $x$, na figura. Utilizando os pontos destacados no gráfico, determine os valores de $a$ e $b$. Note que $V_\text{min}$ indica o menor valor assumido pelo potencial na região $x < 0$.`,
      figura: [
        { pagina: 1, recorte: [0.5, 0.115, 0.915, 0.255] },
        { pagina: 1, recorte: [0.52, 0.265, 0.905, 0.6] },
        { pagina: 1, recorte: [0.655, 0.665, 0.9, 0.81] },
      ],
      cena: { escala: 1, extensao: 5, unidade: 'm', plano: 'xy', camera: { pos: [-0.5, 1, 11], alvo: [-0.5, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'xP', rotulo: 'Posição da sonda', simbolo: 'x', valor: -2, unidade: 'm', min: -4.5, max: -0.2, passo: 0.01 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'Qq', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: '-4*Qq', pos: [2, 0, 0], rotulo: '−4q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'sonda' },
      ],
      visual: { linhasE: true, densidade: 10, planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial na sonda', simbolo: 'V', expr: 'V(xP, 0, 0)', unidade: 'V', teoria: 'k0*Qq*(1/abs(xP) - 4/abs(xP - 2))' },
        { rotulo: 'Campo na sonda', simbolo: 'E_x', expr: 'x(E(xP, 0, 0))', unidade: 'V/m' },
        { rotulo: 'V em x = −2/3 m', simbolo: 'V(b)', expr: 'V(-2/3, 0, 0)', unidade: 'V', teoria: 0 },
        { rotulo: 'E em x = −2 m', simbolo: 'E(a)', expr: 'x(E(-2, 0, 0))', unidade: 'V/m', teoria: 0 },
      ],
      graficos: [
        {
          titulo: 'V(x) em x < 0',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -5, ate: -0.3, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(xx, 0, 0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'O potencial em x < 0',
          texto: r`À esquerda de $q$, as distâncias são $-x$ e $2 - x$:

$$V(x) = k_0q\left(\frac{1}{-x} - \frac{4}{2-x}\right).$$

Perto de $q$ domina o termo positivo; longe, o de $-4q$, e $V$ fica negativo.`,
        },
        {
          titulo: 'b: onde V se anula',
          texto: r`$$\frac{1}{-x} = \frac{4}{2-x} \quad\Rightarrow\quad 2 - x = -4x \quad\Rightarrow\quad x = -\frac23\,\text{m}.$$

Coloque a sonda em $-2/3$: $V$ zera, mas o campo não.`,
          parametros: { xP: -0.6667 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'a: onde V é mínimo',
          previsao: { pergunta: 'No mínimo do potencial, o campo elétrico é…', opcoes: ['máximo', 'nulo', 'igual a V'], correta: 1 },
          texto: r`No mínimo, $dV/dx = 0$, ou seja, $E_x = 0$. Os módulos dos campos das duas cargas se igualam:

$$\frac{1}{x^2} = \frac{4}{(2-x)^2} \quad\Rightarrow\quad 2 - x = -2x \quad\Rightarrow\quad x = -2\,\text{m}.$$`,
          parametros: { xP: -2 },
          medidas: [0, 1, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`$a = -2\,\text{m}$ e $b = -\frac23\,\text{m}$: alternativa **(b)**.`,
          parametros: { xP: -2 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de cargas pontuais', lab: 'potencial' },
          { texto: 'Campo como derivada do potencial', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Zero', texto: r`$V = 0$ em $x = -2/3\,\text{m}$.`, passo: 1 },
          { titulo: 'Mínimo', texto: r`$dV/dx = 0$ em $x = -2\,\text{m}$.`, passo: 2 },
        ],
        resultado: r`$a = -2\,\text{m}$, $b = -\frac23\,\text{m}$: alternativa **(b)**.`,
        errosComuns: [
          r`Confundir os pontos: $a$ é onde $E = 0$, $b$ é onde $V = 0$.`,
          r`Esquecer que, em $x < 0$, as distâncias são $-x$ e $2 - x$.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-1\,\text{m}$, $-\frac12\,\text{m}$`, porque: r`Nem $V$ se anula em $-1/2$, nem $E$ em $-1$.` },
        { letra: 'b', texto: r`$-2\,\text{m}$, $-\frac23\,\text{m}$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$-\frac52\,\text{m}$, $-\frac23\,\text{m}$`, porque: r`O zero está certo; o mínimo está em $-2$.` },
        { letra: 'd', texto: r`$-4\,\text{m}$, $-\frac23\,\text{m}$`, porque: r`O zero está certo; o mínimo está em $-2$.` },
        { letra: 'e', texto: r`$-\frac52\,\text{m}$, $-2\,\text{m}$`, porque: r`Em $-2$ é o mínimo, não o zero.` },
        { letra: 'f', texto: r`$-2\,\text{m}$, $-\frac12\,\text{m}$`, porque: r`O mínimo está certo; o zero está em $-2/3$.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Mesmo campo dentro e fora de um cilindro',
      resumo: 'E cresce com s dentro e cai com 1/s fora.',
      enunciado: r`Considere um cilindro isolante e infinito, de raio $R$, uniformemente carregado. Sabendo que o campo elétrico produzido por este cilindro em um ponto a uma distância $s_0 < R$ do eixo tem módulo igual a $E_0$, a que distância fora do cilindro o campo elétrico terá o mesmo módulo $E_0$?`,
      figura: [
        { pagina: 2, recorte: [0.085, 0.095, 0.49, 0.195] },
        { pagina: 2, recorte: [0.2, 0.265, 0.465, 0.4] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Carga por metro', simbolo: r`\lambda`, valor: 5e-9, unidade: 'C/m', min: 1e-9, max: 1e-8, passo: 5e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.04, max: 0.06, passo: 0.002 },
        { id: 's0', rotulo: 'Distância interna', simbolo: 's_0', valor: 0.03, unidade: 'm', min: 0.03, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroInfinito', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', raio: 'R', rotulo: 'ρ' },
        { id: 'S0', tipo: 'sonda', campo: 'E', pos: ['s0', 0, 0], rotulo: 's₀' },
        { id: 'S1', tipo: 'sonda', campo: 'E', pos: [0, 'R^2/s0', 0], rotulo: 'R²/s₀' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo dentro', simbolo: 'E(s_0)', expr: 'x(E(s0, 0, 0))', unidade: 'V/m', teoria: 'lam*s0/(2*pi*eps0*R^2)' },
        { rotulo: 'Campo em s = R²/s₀', simbolo: 'E(R^2/s_0)', expr: 'y(E(0, R^2/s0, 0))', unidade: 'V/m', teoria: 'lam*s0/(2*pi*eps0*R^2)' },
        { rotulo: 'Campo na superfície', simbolo: 'E(R)', expr: 'x(E(R, 0, 0))', unidade: 'V/m', teoria: 'lam/(2*pi*eps0*R)' },
      ],
      graficos: [
        {
          titulo: 'E(s): duas distâncias para cada valor',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.001, ate: '2.2*R', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'E', expr: 'x(E(ss, 0, 0))', unidade: 'V/m' },
            { rotulo: 'E₀', expr: 'lam*s0/(2*pi*eps0*R^2)', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Campo dentro',
          texto: r`Gaussiana cilíndrica de raio $s$ e altura $\ell$: $2\pi s\ell E = \rho\pi s^2\ell/\varepsilon_0$.

$$E(s) = \frac{\rho s}{2\varepsilon_0}, \quad s < R.$$

Cresce em linha reta até a superfície.`,
          medidas: [0, 2],
        },
        {
          titulo: 'Campo fora',
          previsao: { pergunta: 'Fora do cilindro, E(s) cai com…', opcoes: ['1/s', '1/s²', 'exp(−s)'], correta: 0 },
          texto: r`Toda a carga fica dentro da gaussiana: $2\pi s\ell E = \rho\pi R^2\ell/\varepsilon_0$.

$$E(s) = \frac{\rho R^2}{2\varepsilon_0s}, \quad s > R.$$`,
        },
        {
          titulo: 'Igualar',
          texto: r`$$\frac{\rho s_0}{2\varepsilon_0} = \frac{\rho R^2}{2\varepsilon_0s} \quad\Rightarrow\quad s = \frac{R^2}{s_0}.$$

Alternativa **(d)**. É maior que $R$, como devia. No gráfico, a linha $E_0$ cruza a curva em dois pontos.`,
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' }],
        etapas: [
          { titulo: 'Campos', texto: r`$E = \rho s/2\varepsilon_0$ dentro e $\rho R^2/2\varepsilon_0s$ fora.`, passo: 1 },
          { titulo: 'Igualdade', texto: r`$s = R^2/s_0$.`, passo: 2 },
        ],
        resultado: r`$s = R^2/s_0$: alternativa **(d)**.`,
        errosComuns: [
          r`Usar $1/s^2$ fora: isso é de simetria esférica.`,
          r`Achar que o campo sempre cai com a distância: dentro do cilindro ele cresce.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{s_0^2}{R}$`, porque: r`É menor que $R$: não está fora do cilindro.` },
        { letra: 'b', texto: r`$\sqrt{\dfrac{s_0^3}{R}}$`, porque: r`É menor que $R$.` },
        { letra: 'c', texto: r`$\sqrt{\dfrac{R^3}{s_0}}$`, porque: r`Usa $E \propto 1/s^2$ fora, a lei da simetria esférica.` },
        { letra: 'd', texto: r`$\dfrac{R^2}{s_0}$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: '$2s_0$', porque: r`Só por acaso; não sai das expressões do campo.` },
        { letra: 'f', texto: '$2R$', porque: r`Não depende de $s_0$, e a resposta tem de depender.` },
        { letra: 'g', texto: 'Não existe um ponto fora do cilindro onde o campo tem este módulo, pois ele sempre deve cair com a distância até o eixo.', porque: r`Dentro, o campo **cresce** com a distância; por isso ele passa de novo por $E_0$ fora.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Anular o campo entre dois anéis',
      resumo: 'Qual raio equilibra um anel com oito vezes a carga?',
      enunciado: r`Temos dois anéis circulares, finos, paralelos, 1 e 2, com eixo comum $x$ e densidades lineares constantes. O primeiro anel tem seu centro em $x = 0$, raio $a/2$ e carga $Q$; o segundo anel tem seu centro em $x = 2a$ e carga $8Q$. Qual deve ser o raio do segundo anel para que o campo elétrico resultante no ponto médio entre os anéis seja nulo?`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.095, 0.925, 0.205] },
        { pagina: 2, recorte: [0.64, 0.205, 0.88, 0.365] },
      ],
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [7, 8, 22], alvo: [3, 0, 0] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Comprimento', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'R2', rotulo: 'Raio do anel 2', simbolo: 'R_2', valor: 0.06, unidade: 'm', min: 0.015, max: 0.09, passo: 0.003 },
      ],
      objetos: [
        { id: 'a1', tipo: 'anelCarga', Q: 'Q', centro: [0, 0, 0], raio: 'a/2', normal: 'x', rotulo: 'Q' },
        { id: 'a2', tipo: 'anelCarga', Q: '8*Q', centro: ['2*a', 0, 0], raio: 'R2', normal: 'x', rotulo: '8Q' },
        { id: 'M', tipo: 'sonda', campo: 'E', pos: ['a', 0, 0], rotulo: 'x = a' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Campo do anel 1 em x = a', simbolo: 'E_1', expr: "x(Ede('a1', a, 0, 0))", unidade: 'V/m', teoria: 'k0*Q*a/(a^2 + a^2/4)^1.5' },
        { rotulo: 'Campo do anel 2 em x = a', simbolo: 'E_2', expr: "x(Ede('a2', a, 0, 0))", unidade: 'V/m', teoria: '-8*k0*Q*a/(a^2 + R2^2)^1.5' },
        { rotulo: 'Razão −E₂/E₁', simbolo: '-E_2/E_1', expr: "0 - x(Ede('a2', a, 0, 0))/x(Ede('a1', a, 0, 0))", teoria: '8*(1.25*a^2)^1.5/(a^2 + R2^2)^1.5' },
      ],
      graficos: [
        {
          titulo: 'Razão −E₂/E₁ em função de R₂',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.015, ate: 0.09, rotulo: 'R₂', unidade: 'm' },
          series: [
            { rotulo: '−E₂/E₁', expr: '8*(1.25*a^2)^1.5/(a^2 + rr^2)^1.5', unidade: '' },
            { rotulo: '1', expr: '1', unidade: '' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Campo de um anel no eixo',
          texto: r`Por simetria, no eixo só resta a componente axial:

$$E = \frac{k_0Qx}{(x^2 + R^2)^{3/2}},$$

onde $x$ é a distância ao centro do anel. O ponto médio está a $a$ dos dois centros, e os dois campos são opostos, pois as cargas têm o mesmo sinal.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Igualar os módulos',
          previsao: { pergunta: 'O anel 2 tem 8 vezes a carga. Para o empate, seu raio deve ser…', opcoes: ['igual ao do anel 1', 'maior que o do anel 1', 'menor que o do anel 1'], correta: 1 },
          texto: r`$$\frac{k_0Qa}{(a^2 + a^2/4)^{3/2}} = \frac{k_08Qa}{(a^2 + R_2^2)^{3/2}}.$$

Tirando a raiz $3/2$ dos dois lados (de $8$ sai $4$):

$$a^2 + R_2^2 = 4\left(\frac54a^2\right) = 5a^2 \quad\Rightarrow\quad R_2 = 2a.$$`,
          medidas: [2],
        },
        {
          titulo: 'Resposta',
          texto: r`$R_2 = 2a$: alternativa **(f)**. Mude $R_2$ e veja a razão sair de 1.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de um anel no eixo', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Campos', texto: r`$E_1 = k_0Qa/(5a^2/4)^{3/2}$ e $E_2 = 8k_0Qa/(a^2 + R_2^2)^{3/2}$, opostos.`, passo: 0 },
          { titulo: 'Raio', texto: r`$a^2 + R_2^2 = 5a^2$, logo $R_2 = 2a$.`, passo: 1 },
        ],
        resultado: r`$R_2 = 2a$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar a distância $a$ como se fosse a do anel à sonda, sem somar o raio ao quadrado.`,
          r`Tirar a raiz de 8 errado: $8^{2/3} = 4$.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: '$8a$', porque: r`Trata a razão de cargas como razão de raios.` },
        { letra: 'b', texto: '$a$', porque: r`Com $R_2 = a$, o anel 2 ainda domina.` },
        { letra: 'c', texto: '$a/2$', porque: r`Raios iguais não compensam oito vezes a carga.` },
        { letra: 'd', texto: '$4a$', porque: r`Esquece o $a^2$ dentro da soma.` },
        { letra: 'e', texto: '$a/4$', porque: r`Raio menor deixa o anel 2 ainda mais forte.` },
        { letra: 'f', texto: '$2a$', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Próton num potencial exponencial',
      resumo: 'Energia em vez de força.',
      enunciado: r`Considere um próton que, inicialmente em repouso, está localizado na origem $(0, 0)$ de um sistema de coordenadas cartesianas $xy$. O próton está sob a influência de um campo elétrico, cujo potencial é descrito por $V(y) = -ae^{by}$, onde $a$ e $b$ são constantes positivas. Determine a velocidade do próton ao atingir a posição $(0, d)$, com $d > 0$. A massa do próton é denotada por $m$ e sua carga por $q$.`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.46, 0.925, 0.6] },
        { pagina: 2, recorte: [0.66, 0.655, 0.93, 0.89] },
      ],
      cena: {
        escala: 0.01,
        extensao: 13,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [1, 5, 26], alvo: [0, 5, 0] },
        tempo: { escala: 5e-7, unidade: 'ns', passo: 2e-9, duracao: 6e-6 },
      },
      parametros: [
        { id: 'aa', rotulo: 'Constante a', simbolo: 'a', valor: 10, unidade: 'V', min: 2, max: 30, passo: 1 },
        { id: 'bb', rotulo: 'Constante b', simbolo: 'b', valor: 20, unidade: '1/m', min: 5, max: 30, passo: 1 },
        { id: 'dd', rotulo: 'Distância', simbolo: 'd', valor: 0.1, unidade: 'm', min: 0.02, max: 0.11, passo: 0.002 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: '[0, aa*bb*exp(bb*y), 0]', potencial: '-aa*exp(bb*y)' },
        { id: 'p', tipo: 'particula', rotulo: 'próton', q: 'qe', m: 'mp', pos: [0, 0, 0], v: [0, 0, 0], parada: 'y > dd' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '2*cm', rotulo: 'v' },
        { id: 'fim', tipo: 'caminho', pontos: [[-0.03, 'dd', 0], [0.03, 'dd', 0]], seta: 0.5, tracejado: true, rotulo: 'y = d' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade agora', simbolo: 'v', expr: "mag(vel('p'))", unidade: 'm/s', teoria: "sqrt(2*qe*(V(0, 0, 0) - V(pos('p')))/mp)" },
        { rotulo: 'Velocidade em y = d', simbolo: 'v_d', expr: 'sqrt(2*qe*aa*(exp(bb*dd) - 1)/mp)', unidade: 'm/s' },
        { rotulo: 'Queda de potencial até d', simbolo: 'V(0) - V(d)', expr: 'V(0, 0, 0) - V(0, dd, 0)', unidade: 'V', teoria: 'aa*(exp(bb*dd) - 1)' },
      ],
      graficos: [
        {
          titulo: 'V(y)',
          tipo: 'perfil',
          x: { variavel: 'yy', de: 0, ate: 'dd', rotulo: 'y', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(0, yy, 0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'Não precisa da força',
          texto: r`O campo não é constante, e integrar a aceleração daria trabalho. Mas a força é conservativa: basta a energia.

$$\frac12mv^2 = q\,[V(0) - V(d)].$$`,
        },
        {
          titulo: 'A queda de potencial',
          previsao: { pergunta: 'V(0) − V(d) é…', opcoes: ['positiva', 'negativa'], correta: 0 },
          texto: r`$V(0) = -a$ e $V(d) = -ae^{bd}$:

$$V(0) - V(d) = a\,(e^{bd} - 1) > 0.$$

O potencial cai para cima, e o próton, positivo, desce esse morro: acelera para $+\hat y$.`,
          medidas: [2],
        },
        {
          titulo: 'Velocidade',
          texto: r`$$v = \sqrt{\frac{2qa}{m}(e^{bd} - 1)}.$$

Alternativa **(c)**. Rode a simulação: a velocidade acompanha a energia a cada instante, e o próton para na linha $y = d$.`,
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Energia potencial elétrica', lab: 'potencial' },
          { texto: 'Conservação de energia' },
        ],
        etapas: [
          { titulo: 'Energia', texto: r`$\frac12mv^2 = q[V(0) - V(d)]$.`, passo: 0 },
          { titulo: 'Valores', texto: r`$V(0) - V(d) = a(e^{bd} - 1)$.`, passo: 1 },
        ],
        resultado: r`$v = \sqrt{\dfrac{2qa}{m}(e^{bd} - 1)}$: alternativa **(c)**.`,
        errosComuns: [
          r`Esquecer $V(0) = -a$, que não é zero.`,
          r`Inverter a diferença de potencial.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\sqrt{\dfrac{2qa}{m}(e^{bd} + e)}$`, porque: r`O segundo termo vem de $V(0)$, que dá 1, não $e$.` },
        { letra: 'b', texto: r`$\sqrt{\dfrac{2qa}{m}(e^{bd} - e^{-bd})}$`, porque: r`O segundo termo é $e^{b\cdot0} = 1$.` },
        { letra: 'c', texto: r`$\sqrt{\dfrac{2qa}{m}(e^{bd} - 1)}$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`$\sqrt{\dfrac{qa}{m}(e^{bd} + 1)}$`, porque: r`Sinal errado e sem o fator 2.` },
        { letra: 'e', texto: r`$\sqrt{\dfrac{2qa}{m}(1 - e^{-bd})}$`, porque: r`Valeria para $V = +ae^{-by}$.` },
        { letra: 'f', texto: r`$\sqrt{\dfrac{2qa}{m}(e^{bd} - e)}$`, porque: r`$V(0)$ dá 1, não $e$.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Bastão neutro com duas cargas nas pontas',
      resumo: 'Quando a soma das forças puxa o bastão.',
      enunciado: r`Considere um bastão fino, rígido, isolante, neutro, disposto no eixo $x$, entre $x = 0$ e $x = 2L > 0$. Fixo em sua extremidade $x = 0$, ele possui uma partícula de carga $q$, ao passo que, também fixo na sua outra extremidade $x = 2L$, há uma partícula de carga $Q$. Além disso, no ponto $x = 3L$, há uma partícula de carga $2Q$. Qual deve ser o valor de $q$ para que tal bastão seja atraído pela partícula em $x = 3L$? Suponha que $Q < 0$.`,
      figura: [
        { pagina: 3, recorte: [0.075, 0.125, 0.485, 0.295] },
        { pagina: 3, recorte: [0.2, 0.32, 0.475, 0.42] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [4, 2, 18], alvo: [4, 0, 0] } },
      parametros: [
        { id: 'rq', rotulo: 'Razão q/|Q|', simbolo: 'q/|Q|', valor: 5, min: -15, max: 20, passo: 0.5 },
        { id: 'Qq', rotulo: 'Carga Q', simbolo: 'Q', valor: -1e-9, unidade: 'C', min: -3e-9, max: -2e-10, passo: 1e-10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'rq*abs(Qq)', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'c2', tipo: 'carga', q: 'Qq', pos: ['2*L', 0, 0], rotulo: 'Q' },
        { id: 'c3', tipo: 'carga', q: '2*Qq', pos: ['3*L', 0, 0], rotulo: '2Q' },
        { id: 'bastao', tipo: 'caminho', pontos: [[0, 0, 0], ['2*L', 0, 0]], seta: 0.5, rotulo: 'bastão' },
        { id: 'Ft', tipo: 'seta', papel: 'forca', origem: ['L', 0.012, 0], vetor: "F('c1') + F('c2')", comprimento: '2.5*cm', rotulo: 'F no bastão' },
      ],
      visual: { linhasE: false, setasE: true, densidade: 11, planoSetas: 'xy', fontes: ['c3'] },
      medidas: [
        { rotulo: 'Força de 2Q sobre q', simbolo: 'F_q', expr: "x(Ede('c3', 0, 0, 0))*rq*abs(Qq)", unidade: 'N', teoria: '-k0*rq*abs(Qq)*2*Qq/(3*L)^2' },
        { rotulo: 'Força de 2Q sobre Q', simbolo: 'F_Q', expr: "x(Ede('c3', 2*L, 0, 0))*Qq", unidade: 'N', teoria: '-2*k0*Qq^2/L^2' },
        { rotulo: 'Força no bastão (positiva: atraído)', simbolo: 'F_x', expr: "x(F('c1') + F('c2'))", unidade: 'N', teoria: '-2*k0*Qq/L^2*(rq*abs(Qq)/9 + Qq)' },
        { rotulo: 'Limiar q/|Q|', simbolo: 'q_c/|Q|', expr: '9' },
      ],
      passos: [
        {
          titulo: 'As forças internas não contam',
          texto: r`As forças entre $q$ e $Q$ são internas ao bastão: somam zero. Sobram as da partícula em $x = 3L$.

Sobre $Q$, com o mesmo sinal, há **repulsão** para $-\hat x$:

$$F_Q = \frac{2k_0Q^2}{L^2}.$$`,
          parametros: { rq: 5 },
          medidas: [1],
        },
        {
          titulo: 'Quem pode puxar é q',
          previsao: { pergunta: 'Para o bastão ser atraído, q deve ser…', opcoes: ['positiva e grande', 'negativa', 'zero'], correta: 0 },
          texto: r`Para puxar o bastão para $+\hat x$, $q$ tem de ser atraída por $2Q < 0$, ou seja, $q > 0$. Mas ela está três vezes mais longe que $Q$ da partícula:

$$F_q = \frac{2k_0q|Q|}{(3L)^2} = \frac{2k_0q|Q|}{9L^2}.$$`,
          parametros: { rq: 5 },
          medidas: [0],
        },
        {
          titulo: 'Condição',
          texto: r`$$\frac{2k_0q|Q|}{9L^2} > \frac{2k_0Q^2}{L^2} \quad\Rightarrow\quad q > 9|Q| = -9Q.$$

Mude a razão: em $q/|Q| = 5$ o bastão é repelido; acima de 9, atraído. Alternativa **(e)**.`,
          parametros: { rq: 12 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Coulomb e superposição', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Forças', texto: r`$F_Q$ empurra para $-\hat x$; $F_q$ puxa para $+\hat x$ se $q > 0$.`, passo: 1 },
          { titulo: 'Condição', texto: r`$F_q > F_Q$ dá $q > 9|Q| = -9Q$.`, passo: 2 },
        ],
        resultado: r`$q > -9Q$: alternativa **(e)**.`,
        errosComuns: [
          r`Incluir a força entre $q$ e $Q$: ela é interna ao bastão.`,
          r`Esquecer o quadrado da distância: $(3L)^2$ traz o 9.`,
          r`Trocar o sentido da desigualdade ao usar $Q < 0$.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$q > -3Q/2$`, porque: r`Usa distâncias sem elevar ao quadrado.` },
        { letra: 'b', texto: '$q < 0$', porque: r`Com $q < 0$, as duas forças empurram o bastão para longe.` },
        { letra: 'c', texto: r`$q < -9Q$`, porque: r`Sentido invertido: abaixo de $-9Q$, o bastão é repelido.` },
        { letra: 'd', texto: r`$q < 9Q$`, porque: r`Com $Q < 0$, isso é $q$ muito negativa.` },
        { letra: 'e', texto: r`$q > -9Q$`, correta: true, porque: r`Correta.` },
        { letra: 'f', texto: r`$q < -3Q/2$`, porque: r`Distâncias sem o quadrado e sentido invertido.` },
        { letra: 'g', texto: 'Não existe tal valor, pois a partícula e a extremidade do bastão mais próxima dela possuem cargas de mesmo sinal.', porque: r`A extremidade próxima repele, mas $q$ pode vencer essa repulsão se for grande o bastante.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Chapa, lâmina com ρ(z) e vácuo',
      resumo: 'Gauss plano com densidade exponencial e potencial nas duas regiões.',
      enunciado: r`Uma chapa plana, fina, infinita, em $z = 0$, possui uma densidade superficial de carga $\sigma_0 = \text{constante} > 0$. Na região $-\infty < z < 0$ temos um material condutor em equilíbrio eletrostático; na região $0 \le z \le D$ temos uma lâmina isolante com densidade volumar de carga dada por $\rho(z) = -(\sigma_0/D)\exp(-z/D)$ e, finalmente, na região $D < z < \infty$ temos vácuo.

(a) Determine a carga total $Q(z)$ dentro de um cilindro fechado, com eixo na direção $z$ e bases circulares de área $\mathcal A$, situadas nos planos $z$ e $-z$, nos dois seguintes casos: (i) $0 < z < D$, e (ii) $D < z < \infty$. (b) Usando a lei de Gauss, e detalhando todas as suposições e passagens, determine o campo elétrico $\vec E(z)$ como função de $z$ para as duas situações. (c) Faça um gráfico $E_z\times z$ para $0 < z < 2D$. Seja detalhista com os valores nos pontos mais relevantes. (d) Obtenha o potencial $V(z)$ como função de $z$ para as duas situações. Suponha que o valor $V_D$ do potencial na superfície em $z = D$ seja nulo. (e) Faça um gráfico $V\times z$ para $0 < z < 2D$. Novamente, seja detalhista com os valores nos pontos mais relevantes.`,
      figura: [
        { pagina: 3, recorte: [0.5, 0.105, 0.925, 0.58] },
        { pagina: 3, recorte: [0.52, 0.585, 0.885, 0.96] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [18, 4, 2.5], alvo: [0, 0, 2.5] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade da chapa', simbolo: r`\sigma_0`, valor: 1e-8, unidade: 'C/m²', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'D', rotulo: 'Espessura da lâmina', simbolo: 'D', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'zg', rotulo: 'Base da gaussiana', simbolo: 'z', valor: 0.015, unidade: 'm', min: 0.002, max: 0.06, passo: 0.001 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: `[0, 0, ${Ez('z')}]`, potencial: `(z < 0 ? ${Vz('0')} : ${Vz('z')})` },
        { id: 'chapa', tipo: 'placa', sigma: 'sig*1e-12', centro: [0, 0, 0], normal: 'z', largura: 0.1, altura: 0.1, rotulo: 'σ₀' },
        { id: 'face', tipo: 'caminho', pontos: [[0, -0.05, 'D'], [0, 0.05, 'D']], tracejado: true, seta: 0.9, rotulo: 'z = D' },
        { id: 'metal', tipo: 'caminho', pontos: [[0, -0.05, -0.05], [0, -0.05, 0], [0, 0.05, 0], [0, 0.05, -0.05], [0, -0.05, -0.05]], seta: 0.1 },
        { id: 'tM', tipo: 'rotulo', pos: [0, 0.03, -0.03], texto: 'metal' },
        { id: 'tI', tipo: 'rotulo', pos: [0, 0.03, 'D/2'], texto: 'isolante' },
        { id: 'tV', tipo: 'rotulo', pos: [0, 0.03, '1.6*D'], texto: 'vácuo' },
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 0.02, altura: '2*zg', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'yz', fontes: ['E'] },
      medidas: [
        { rotulo: 'Carga em S por área', simbolo: 'Q/\\mathcal A', expr: "eps0*fluxo('G')/(pi*0.02^2)", unidade: 'C/m²', teoria: Qs('zg') },
        { rotulo: 'Campo em z', simbolo: 'E_z', expr: 'z(E(0, 0, zg))', unidade: 'V/m', teoria: Ez('zg') },
        { rotulo: 'Potencial em z (V_D = 0)', simbolo: 'V', expr: 'V(0, 0, zg) - V(0, 0, D)', unidade: 'V', teoria: Vz('zg') },
        { rotulo: 'E logo acima da chapa', simbolo: 'E(0^+)', expr: 'z(E(0, 0, 1e-9))', unidade: 'V/m', teoria: 'sig/eps0*exp(-1e-9/D)' },
        { rotulo: 'E em z = D', simbolo: 'E(D)', expr: 'z(E(0, 0, D))', unidade: 'V/m', teoria: 'sig/eps0*exp(-1)' },
        { rotulo: 'V em z = 0', simbolo: 'V(0)', expr: 'V(0, 0, 0) - V(0, 0, D)', unidade: 'V', teoria: 'sig*D/eps0*(1 - exp(-1))' },
        { rotulo: 'V em z = 2D', simbolo: 'V(2D)', expr: 'V(0, 0, 2*D) - V(0, 0, D)', unidade: 'V', teoria: '0 - sig*D/eps0*exp(-1)' },
      ],
      graficos: [
        {
          titulo: 'E_z/(σ₀/ε₀)',
          tipo: 'perfil',
          x: { variavel: 'zz', de: 0.0001, ate: '2*D', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'E_z', expr: 'z(E(0, 0, zz))*eps0/sig', unidade: '' }],
        },
        {
          titulo: 'V/(σ₀D/ε₀), com V(D) = 0',
          tipo: 'perfil',
          x: { variavel: 'zz', de: 0.0001, ate: '2*D', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'V', expr: '(V(0, 0, zz) - V(0, 0, D))*eps0/(sig*D)', unidade: '' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Carga no cilindro, com z < D',
          texto: r`Dentro do cilindro estão a parte da chapa, $\sigma_0\mathcal A$, e parte da lâmina. A densidade é negativa:

$$Q(z) = \sigma_0\mathcal A + \int_0^z\rho(z')\mathcal A\,dz' = \sigma_0\mathcal A\,e^{-z/D}.$$

O metal não contribui: em equilíbrio, não tem carga no volume.`,
          parametros: { zg: 0.015 },
          destacar: ['G'],
          medidas: [0],
        },
        {
          item: 'a',
          titulo: '(a) Carga no cilindro, com z > D',
          texto: r`Toda a lâmina está dentro. A integral vai até $D$:

$$Q = \sigma_0\mathcal A\,e^{-1}.$$`,
          parametros: { zg: 0.045 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Lei de Gauss',
          previsao: { pergunta: 'Por qual parte do cilindro passa fluxo?', opcoes: ['só pela base em +z', 'pelas duas bases', 'pela lateral'], correta: 0 },
          texto: r`A simetria plana faz $\vec E$ apontar em $\hat z$ e depender só de $z$: não há fluxo na lateral. A base em $-z$ está no metal, onde $\vec E = \vec 0$. Sobra a base em $+z$:

$$E(z)\,\mathcal A = \frac{Q(z)}{\varepsilon_0}.$$

$$\vec E = \frac{\sigma_0}{\varepsilon_0}e^{-z/D}\hat z, \quad 0 < z < D; \qquad \vec E = \frac{\sigma_0}{\varepsilon_0}e^{-1}\hat z, \quad z > D.$$`,
          parametros: { zg: 0.015 },
          medidas: [0, 1],
        },
        {
          item: 'c',
          titulo: '(c) O gráfico de E',
          texto: r`Cai exponencialmente de $\sigma_0/\varepsilon_0$ em $z = 0$ até $e^{-1}\sigma_0/\varepsilon_0 \approx 0{,}37\,\sigma_0/\varepsilon_0$ em $z = D$. Depois, fica constante. É contínuo em $z = D$, pois não há carga superficial ali.`,
          medidas: [3, 4],
        },
        {
          item: 'd',
          titulo: '(d) Potencial',
          texto: r`Com $V(D) = 0$, integrando a partir de $D$:

$$V(z) = \frac{\sigma_0D}{\varepsilon_0}\left[e^{-z/D} - e^{-1}\right], \quad 0 \le z \le D,$$

$$V(z) = \frac{\sigma_0D}{\varepsilon_0}e^{-1}\left(1 - \frac zD\right), \quad z \ge D.$$`,
          parametros: { zg: 0.015 },
          medidas: [2],
        },
        {
          item: 'e',
          titulo: '(e) O gráfico de V',
          texto: r`Decresce sempre, pois $E_z > 0$. Em unidades de $V_0 = \sigma_0D/\varepsilon_0$:

- $z = 0$: $1 - e^{-1} \approx 0{,}63$;
- $z = D$: zero;
- $z = 2D$: $-e^{-1} \approx -0{,}37$.

Curva exponencial até $D$ e reta depois, sem quina: o campo é contínuo em $z = D$.`,
          parametros: { zg: 0.045 },
          medidas: [5, 6],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria plana', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
          { texto: 'Condutor em equilíbrio' },
        ],
        etapas: [
          { titulo: '(a) Carga', texto: r`$Q = \sigma_0\mathcal Ae^{-z/D}$ em $0 < z < D$ e $\sigma_0\mathcal Ae^{-1}$ em $z > D$.`, passo: 0 },
          { titulo: '(b) Campo', texto: r`$E = Q/\varepsilon_0\mathcal A$, pois só a base em $+z$ tem fluxo.`, passo: 2 },
          { titulo: '(c) Gráfico', texto: r`De $\sigma_0/\varepsilon_0$ a $e^{-1}\sigma_0/\varepsilon_0$, e constante depois.`, passo: 3 },
          { titulo: '(d) Potencial', texto: r`$V = \frac{\sigma_0D}{\varepsilon_0}[e^{-z/D} - e^{-1}]$ e $V = \frac{\sigma_0D}{\varepsilon_0}e^{-1}(1 - z/D)$.`, passo: 4 },
          { titulo: '(e) Gráfico', texto: r`$V/V_0$: $0{,}63$ em $0$, zero em $D$ e $-0{,}37$ em $2D$.`, passo: 5 },
        ],
        resultado: r`$\vec E = \frac{\sigma_0}{\varepsilon_0}e^{-z/D}\hat z$ na lâmina e $\frac{\sigma_0}{\varepsilon_0}e^{-1}\hat z$ fora; $V = \frac{\sigma_0D}{\varepsilon_0}[e^{-z/D} - e^{-1}]$ e $\frac{\sigma_0D}{\varepsilon_0}e^{-1}(1 - z/D)$.`,
        errosComuns: [
          r`Usar $\sigma/2\varepsilon_0$: esse é o plano isolado, com fluxo nas duas bases. Aqui uma base está no metal.`,
          r`Esquecer a parte negativa da lâmina na carga interna.`,
          r`Partir a integral do potencial de $z = 0$: a referência é $V(D) = 0$.`,
        ],
        oficial: { resposta: r`$Q = \sigma_0\mathcal Ae^{-z/D}$ e $\sigma_0\mathcal Ae^{-1}$; $\vec E = \frac{\sigma_0}{\varepsilon_0}e^{-z/D}\hat z$ e $\frac{\sigma_0}{\varepsilon_0}e^{-1}\hat z$; $V = \frac{\sigma_0D}{\varepsilon_0}[e^{-z/D} - e^{-1}]$ e $\frac{\sigma_0D}{\varepsilon_0}e^{-1}(1 - z/D)$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\sigma_0\mathcal Ae^{-z/D}$; $\sigma_0\mathcal Ae^{-1}$`, pontos: 0.8, criterio: 'Chapa mais integral da lâmina, nos dois casos.' },
        { item: 'b', texto: r`$\frac{\sigma_0}{\varepsilon_0}e^{-z/D}\hat z$; $\frac{\sigma_0}{\varepsilon_0}e^{-1}\hat z$`, pontos: 1, criterio: 'Simetria, fluxo só em uma base e E = 0 no metal.' },
        { item: 'c', texto: r`Exponencial de $\sigma_0/\varepsilon_0$ a $e^{-1}\sigma_0/\varepsilon_0$; depois constante`, pontos: 0.6, criterio: 'Formato e valores nos pontos relevantes.' },
        { item: 'd', texto: r`$\frac{\sigma_0D}{\varepsilon_0}[e^{-z/D} - e^{-1}]$; $\frac{\sigma_0D}{\varepsilon_0}e^{-1}(1 - z/D)$`, pontos: 1, criterio: r`Integral do campo com $V(D) = 0$.` },
        { item: 'e', texto: r`De $0{,}63\,V_0$ em $z = 0$ a zero em $D$ e $-0{,}37\,V_0$ em $2D$`, pontos: 0.6, criterio: 'Formato e valores nos pontos relevantes.' },
      ],
    },
  ],
}

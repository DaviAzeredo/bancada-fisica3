import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 3: fio com λ(z) = λ₀ cos(πz/2a), em 48 trechos de −3a a 3a (eixo vertical da cena). */
const trechos: ObjetoInput[] = Array.from({ length: 48 }, (_, i) => {
  const f = -3 + (i * 6) / 48
  return {
    id: `t${i}`,
    tipo: 'segmentoCarga' as const,
    lambda: `lam0*cos(pi*${f + 3 / 48}/2)`,
    a: [0, `${f}*a`, 0],
    b: [0, `${f + 6 / 48}*a`, 0],
  }
})
const Qdentro = trechos
  .slice(16, 32)
  .map((t) => `carga('${t.id}')`)
  .join(' + ')

/* Discursiva: carga envolvida e campo em r, com a camada a ≤ r ≤ 5a. */
const Qenv = (v: string) => `qq + 2*pi*rho0*a*(min(max(${v},a),5*a)^2 - a^2)`

/**
 * P1 de Física III, 2025/1, diurno, versão D (28/04/2025). Conferida com o
 * gabarito oficial: objetivas 1a, 2e, 3b, 4d, 5c, 6f, e a discursiva. O scan
 * tem a solução de um aluno escrita à mão: os recortes pegam só enunciado e
 * figura, e as máscaras cobrem as anotações que entregariam a resposta.
 */
export const p1_2025_1_diurno: ProvaInput = {
  id: 'p1-2025-1-diurno',
  titulo: 'P1 · 2025/1 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão D · 28/04/2025',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Campo no eixo de um anel: o formato',
      resumo: 'Qual gráfico representa E_z(z)?',
      enunciado: r`Um anel circular de raio $R$, uniformemente carregado com carga $Q > 0$, repousa no plano $xy$ com seu centro na origem. Considere um ponto $P = (0, 0, z)$ do eixo $z$. Qual gráfico melhor representa a componente $E_z$ do campo gerado pelo anel em $P$, em função de $z$?`,
      figura: [
        { pagina: 1, recorte: [0.505, 0.115, 0.89, 0.245] },
        { pagina: 1, recorte: [0.68, 0.245, 0.89, 0.42] },
      ],
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [15, 7, 14], alvo: [0, 0, 2] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.02, max: 0.06, passo: 0.002 },
        { id: 'zP', rotulo: 'Posição de P', simbolo: 'z', valor: 0.03, unidade: 'm', min: -0.1, max: 0.1, passo: 0.002 },
      ],
      objetos: [
        { id: 'an', tipo: 'anelCarga', Q: 'Q', centro: [0, 0, 0], raio: 'R', normal: 'z', rotulo: 'Q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'P' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        { rotulo: 'Campo em P', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m', teoria: 'k0*Q*zP/(zP^2 + R^2)^1.5' },
        { rotulo: 'Campo no centro', simbolo: 'E_z(0)', expr: 'z(E(0, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Posição do máximo', simbolo: r`R/\sqrt2`, expr: 'R/sqrt(2)', unidade: 'm' },
      ],
      graficos: [
        {
          titulo: 'E_z(z) no eixo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: -0.12, ate: 0.12, rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'z(E(0, 0, zz))', unidade: 'V/m' },
            { rotulo: 'analítico', expr: 'k0*Q*zz/(zz^2 + R^2)^1.5', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'No centro, o campo se anula',
          previsao: { pergunta: 'No centro do anel, E_z é…', opcoes: ['máximo', 'nulo', 'negativo'], correta: 1 },
          texto: r`Elementos opostos do anel criam campos opostos no centro: a soma é zero. Isso já elimina os gráficos com máximo em $z = 0$.`,
          parametros: { zP: 0 },
          medidas: [1],
        },
        {
          titulo: 'O campo é ímpar em z',
          texto: r`Por simetria, as componentes perpendiculares ao eixo se cancelam e sobra

$$E_z = \frac{k_0Qz}{(z^2+R^2)^{3/2}}.$$

Para $Q > 0$, o campo aponta para longe do anel: $E_z > 0$ em $z > 0$ e $E_z < 0$ em $z < 0$. Arraste $P$ pelos dois lados.`,
          parametros: { zP: 0.03 },
          medidas: [0],
        },
        {
          titulo: 'Longe do anel',
          texto: r`Para $|z| \gg R$, o anel parece uma carga pontual: $E_z \to k_0Q/z^2$, sempre decrescendo. O máximo fica em $z = \pm R/\sqrt2$, entre o zero do centro e a queda de longe.`,
          parametros: { zP: 0.1 },
          medidas: [0, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`Curva ímpar, positiva para $z > 0$, com um pico e queda: alternativa **(a)**.`,
          parametros: { zP: 0.03 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de distribuição contínua', lab: 'coulomb' },
          { texto: 'Simetria' },
        ],
        etapas: [
          { titulo: 'Expressão', texto: r`Só a componente axial sobrevive: $E_z = k_0Qz/(z^2+R^2)^{3/2}$.`, passo: 1 },
          { titulo: 'Leitura', texto: r`$E_z(0) = 0$; o sinal acompanha o de $z$; $|E_z| \to k_0Q/z^2$ longe.`, passo: 2 },
        ],
        resultado: r`Alternativa **(a)**.`,
        errosComuns: [
          r`Achar que o campo é máximo no centro, como o potencial.`,
          r`Desenhar o módulo: a questão pede a componente $E_z$, que troca de sinal.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Curva ímpar: nula em $z = 0$, positiva com um pico para $z > 0$, negativa para $z < 0$.', correta: true, porque: r`Correta: é $k_0Qz/(z^2+R^2)^{3/2}$.` },
        { letra: 'b', texto: 'Curva ímpar invertida: negativa para $z > 0$, positiva para $z < 0$.', porque: r`Valeria para $Q < 0$.` },
        { letra: 'c', texto: 'Curva par, em sino, com máximo não nulo em $z = 0$.', porque: r`É o formato do potencial, não do campo: no centro $E = 0$.` },
        { letra: 'd', texto: 'Curva par com dois picos positivos, nula em $z = 0$.', porque: r`É o **módulo** do campo; $E_z$ troca de sinal.` },
        { letra: 'e', texto: 'Curva par, em sino estreito, com máximo não nulo em $z = 0$.', porque: r`Mesmo erro da (c): no centro os elementos se cancelam.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Lendo linhas de campo de duas cargas',
      resumo: 'Sinais, módulos e por que aquilo não é um dipolo.',
      enunciado: r`A figura representa as linhas de campo elétrico de um sistema de duas partículas de cargas $q_1$ e $q_2$. Afirmativas: (I) a carga $q_1$ é negativa e a carga $q_2$ é positiva; (II) o módulo da carga $q_1$ é maior que o módulo da carga $q_2$; (III) esse sistema representa as linhas de campo de um dipolo elétrico. Qual(is) é(são) verdadeira(s)?`,
      figura: {
        pagina: 2,
        recorte: [0.095, 0.105, 0.495, 0.46],
        mascaras: [
          { area: [0.385, 0.15, 0.47, 0.19], letra: '' },
          { area: [0.14, 0.245, 0.205, 0.285], letra: '' },
          { area: [0.385, 0.21, 0.45, 0.25], letra: '' },
        ],
      },
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 23], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'razao', rotulo: 'Razão |q₁|/|q₂|', simbolo: r`|q_1/q_2|`, valor: 4, min: 1, max: 6, passo: 0.5 },
        { id: 'q2', rotulo: 'Carga q₂', simbolo: 'q_2', valor: 1e-9, unidade: 'C', min: 1e-9, max: 1e-9 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: '-razao*q2', pos: [-0.03, 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: 'q2', pos: [0.03, 0, 0], rotulo: 'q₂' },
        { id: 'S', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 0.08, rotulo: 'S' },
      ],
      visual: { linhasE: true, densidade: 12 },
      medidas: [
        { rotulo: 'Carga total', simbolo: 'q_1 + q_2', expr: "carga('c1') + carga('c2')", unidade: 'C', teoria: '(1 - razao)*q2' },
        { rotulo: 'Fluxo pela esfera que envolve tudo', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('S')", unidade: 'V·m', teoria: '(1 - razao)*q2/eps0' },
      ],
      passos: [
        {
          titulo: '(I) O sentido das setas',
          texto: r`Linhas de campo **saem** de cargas positivas e **chegam** a negativas. Na figura, as setas apontam para $q_1$ e saem de $q_2$. **Verdadeira.**`,
          destacar: ['c1', 'c2'],
        },
        {
          titulo: '(II) A densidade de linhas',
          previsao: { pergunta: 'Qual carga tem maior módulo na figura?', opcoes: ['q₁, com mais linhas', 'q₂', 'são iguais'], correta: 0 },
          texto: r`O número de linhas ligadas a uma carga é proporcional ao seu módulo. Chegam muito mais linhas a $q_1$ que saem de $q_2$, e parte delas vem do infinito. **Verdadeira.**`,
          medidas: [0],
        },
        {
          titulo: '(III) Dipolo tem cargas iguais e opostas',
          texto: r`Um dipolo tem $q_1 = -q_2$: carga total nula, e nenhuma linha vem do infinito. Aqui sobram linhas chegando de fora: a carga total não é nula. **Falsa.**

Leve a razão a 1: todas as linhas passam a ir de uma carga à outra, e o fluxo pela esfera grande zera.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`(I) e (II): alternativa **(e)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Linhas de campo', lab: 'coulomb' },
          { texto: 'Dipolo elétrico', lab: 'dipolo' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`As linhas chegam a $q_1$ e saem de $q_2$. Verdadeira.`, passo: 0 },
          { titulo: '(II)', texto: r`Mais linhas em $q_1$: módulo maior. Verdadeira.`, passo: 1 },
          { titulo: '(III)', texto: r`Num dipolo os módulos são iguais. Falsa.`, passo: 2 },
        ],
        resultado: r`Somente (I) e (II): alternativa **(e)**.`,
        errosComuns: [
          r`Chamar de dipolo qualquer par de cargas opostas. Sem módulos iguais, a carga total não é zero.`,
          r`Inverter o sentido: linhas saem da carga positiva.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`(I) e (II) se leem diretamente da figura.` },
        { letra: 'b', texto: 'Somente a I.', porque: r`Falta a (II): há mais linhas em $q_1$.` },
        { letra: 'c', texto: 'Somente a II.', porque: r`Falta a (I): as setas chegam a $q_1$.` },
        { letra: 'd', texto: 'Somente a III.', porque: r`É justamente a falsa: dipolo exige módulos iguais.` },
        { letra: 'e', texto: 'Somente a I e a II.', correta: true, porque: r`Correta: sinais e módulos saem das setas e da contagem de linhas.` },
        { letra: 'f', texto: 'Somente a I e a III.', porque: r`A (III) é falsa.` },
        { letra: 'g', texto: 'Somente a II e a III.', porque: r`A (III) é falsa.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`A (III) é falsa.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Fluxo de um fio com λ(z) cossenoidal',
      resumo: 'Só o trecho dentro da gaussiana conta.',
      enunciado: r`Um fio retilíneo infinito está ao longo do eixo $z$, com densidade estacionária não uniforme $\lambda(z) = \lambda_0\cos[\pi z/(2a)]$, com $\lambda_0$ e $a$ constantes. Considere uma superfície gaussiana esférica, de raio $a$, centrada no ponto $O$ do fio em que $z = 0$, de modo que ele intercepta dois polos opostos da gaussiana (em $z = \pm a$). Determine o fluxo do campo elétrico gerado por todo o fio através da superfície.`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.1, 0.905, 0.26] },
        { pagina: 2, recorte: [0.76, 0.28, 0.905, 0.65] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [7, 3, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam0', rotulo: 'Constante', simbolo: r`\lambda_0`, valor: 2e-9, unidade: 'C/m', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio da gaussiana', simbolo: 'a', valor: 0.025, unidade: 'm', min: 0.025, max: 0.025 },
      ],
      objetos: [
        ...trechos,
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'a', rotulo: 'S' },
        { id: 'tl', tipo: 'rotulo', pos: [0.012, 0.06, 0], texto: 'λ(z)' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro da gaussiana', simbolo: r`Q_\text{int}`, expr: Qdentro, unidade: 'C', teoria: '4*lam0*a/pi' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('G')", unidade: 'V·m', teoria: '4*lam0*a/(pi*eps0)' },
      ],
      graficos: [
        {
          titulo: 'λ(z) ao longo do fio',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '-3*a', ate: '3*a', rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'λ', expr: 'lam0*cos(pi*zz/(2*a))', unidade: 'C/m' }],
        },
      ],
      passos: [
        {
          titulo: 'O fluxo só depende da carga de dentro',
          texto: r`Pela lei de Gauss, o fio inteiro cria campo em $S$, mas o fluxo total só depende da carga **dentro** dela. Basta o trecho $-a < z < a$.`,
          destacar: ['G'],
        },
        {
          titulo: 'Integrar a densidade',
          previsao: { pergunta: 'Dentro da gaussiana, λ(z) é…', opcoes: ['sempre positiva', 'positiva e negativa, somando zero'], correta: 0 },
          texto: r`Em $|z| < a$, o cosseno é positivo:

$$Q_\text{int} = \int_{-a}^a\lambda_0\cos\frac{\pi z}{2a}\,dz = \lambda_0\frac{2a}{\pi}\left[\sin\frac{\pi z}{2a}\right]_{-a}^a = \frac{4\lambda_0a}{\pi}.$$`,
          medidas: [0],
        },
        {
          titulo: 'Resposta',
          texto: r`$$\Phi = \frac{Q_\text{int}}{\varepsilon_0} = \frac{4\lambda_0a}{\pi\varepsilon_0}.$$

Alternativa **(b)**.`,
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Carga', texto: r`$Q_\text{int} = \int_{-a}^a\lambda(z)\,dz = 4\lambda_0a/\pi$.`, passo: 1 },
          { titulo: 'Fluxo', texto: r`$\Phi = Q_\text{int}/\varepsilon_0$.`, passo: 2 },
        ],
        resultado: r`$\Phi = \dfrac{4\lambda_0a}{\pi\varepsilon_0}$: alternativa **(b)**.`,
        errosComuns: [
          r`Usar $\lambda_0\cdot2a$, como se a densidade fosse uniforme.`,
          r`Esquecer que a integral vai de $-a$ a $a$, e ficar com a metade.`,
          r`Tentar achar o campo no fio: Gauss aqui só dá o fluxo.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\lambda_0a/\varepsilon_0$`, porque: r`Não vem de nenhuma integral de $\cos$ em $[-a, a]$.` },
        { letra: 'b', texto: r`$4\lambda_0a/(\pi\varepsilon_0)$`, correta: true, porque: r`Correta: $Q_\text{int} = 4\lambda_0a/\pi$.` },
        { letra: 'c', texto: r`$2\lambda_0a/(\pi\varepsilon_0)$`, porque: r`Integra só de $0$ a $a$.` },
        { letra: 'd', texto: '$0$.', porque: r`Em $|z| < a$ a densidade é positiva; a parte negativa do fio está fora.` },
        { letra: 'e', texto: r`$2\lambda_0a/\varepsilon_0$`, porque: r`Trata $\lambda$ como uniforme, igual a $\lambda_0$.` },
        { letra: 'f', texto: r`$\lambda_0a/(\pi\varepsilon_0)$`, porque: r`Faltam fatores: a integral dá $4a/\pi$.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Aceleração num potencial gaussiano',
      resumo: 'Do V(x, y, z) dado até a força sobre a partícula.',
      enunciado: r`Uma partícula de massa $m$ e carga $q$ está numa região sob ação somente de um campo elétrico cujo potencial é $V(x, y, z) = V_0e^{-y^2/c^2}$, com $V_0$ e $c$ constantes positivas. Sua aceleração no ponto $\mathcal P = (x = 0, y = d, z = 2d)$ será:`,
      figura: { pagina: 3, recorte: [0.115, 0.14, 0.5, 0.22] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [10, 3, 12], alvo: [0, 1, 2] }, tempo: { escala: 1e-7, unidade: 'ns', passo: 1e-9 } },
      parametros: [
        { id: 'V0', rotulo: 'Potencial máximo', simbolo: 'V_0', valor: 100, unidade: 'V', min: 20, max: 300, passo: 10 },
        { id: 'cc', rotulo: 'Largura', simbolo: 'c', valor: 0.03, unidade: 'm', min: 0.015, max: 0.05, passo: 0.002 },
        { id: 'd', rotulo: 'Distância d', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.005, max: 0.035, passo: 0.001 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: '2*V0*y/cc^2*exp(-y^2/cc^2)*[0, 1, 0]', potencial: 'V0*exp(-y^2/cc^2)' },
        { id: 'p', tipo: 'particula', rotulo: 'q > 0', q: 'qe', m: 'mp', pos: [0, 'd', '2*d'], v: [0, 0, 0] },
        { id: 'sa', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: [0, 1, 0], comprimento: '1.6*cm', rotulo: 'a' },
      ],
      visual: { setasE: true, densidade: 9, planoV: { normal: 'x', posicao: 0 } },
      medidas: [
        { rotulo: 'Componente y do campo em P', simbolo: 'E_y', expr: 'y(E(0, d, 2*d))', unidade: 'V/m', teoria: '2*V0*d/cc^2*exp(-d^2/cc^2)' },
        { rotulo: 'Componentes x e z em P', simbolo: 'E_x, E_z', expr: 'abs(x(E(0, d, 2*d))) + abs(z(E(0, d, 2*d)))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Aceleração de um próton', simbolo: 'a', expr: 'qe*y(E(0, d, 2*d))/mp', unidade: 'm/s²', teoria: '2*qe*V0*d/(mp*cc^2)*exp(-d^2/cc^2)' },
      ],
      graficos: [
        {
          titulo: 'V(y) e E_y(y)',
          tipo: 'perfil',
          x: { variavel: 'yy', de: '-2.5*cc', ate: '2.5*cc', rotulo: 'y', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(0, yy, 0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'V só depende de y',
          texto: r`$\vec E = -\nabla V$. Como $V$ não depende de $x$ nem de $z$, só resta

$$E_y = -\frac{\partial V}{\partial y} = \frac{2V_0y}{c^2}e^{-y^2/c^2}.$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'O sentido',
          previsao: { pergunta: 'Em y = d > 0, o campo aponta para…', opcoes: ['+ŷ', '−ŷ', '+x̂'], correta: 0 },
          texto: r`$V$ cai ao se afastar de $y = 0$. O campo aponta para onde $V$ diminui: para $+\hat y$ em $y > 0$. O valor de $z = 2d$ não importa.`,
          medidas: [0],
        },
        {
          titulo: 'Aceleração',
          texto: r`$$\vec a = \frac{q\vec E}{m} = \left(\frac{2qV_0d}{mc^2}\right)e^{-d^2/c^2}\,\hat y.$$

Alternativa **(d)**. Rode a simulação para ver um próton sair de $\mathcal P$.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo como gradiente do potencial', lab: 'potencial' },
          { texto: 'Segunda lei de Newton' },
        ],
        etapas: [
          { titulo: 'Gradiente', texto: r`$\vec E = \dfrac{2V_0y}{c^2}e^{-y^2/c^2}\hat y$.`, passo: 0 },
          { titulo: 'Em P', texto: r`Com $y = d$: $\vec a = \dfrac{2qV_0d}{mc^2}e^{-d^2/c^2}\hat y$.`, passo: 2 },
        ],
        resultado: r`$\vec a = \left(\dfrac{2qV_0d}{mc^2}\right)e^{-d^2/c^2}\hat y$: alternativa **(d)**.`,
        errosComuns: [
          r`Esquecer a regra da cadeia e perder o fator $2y/c^2$.`,
          r`Esquecer o sinal de $\vec E = -\nabla V$, chegando à alternativa (c).`,
          r`Pôr a direção em $\hat x$: $V$ não depende de $x$.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left(\dfrac{qV_0d}{mc^2}\right)e^{-d^2/c^2}\hat x$`, porque: r`$V$ não varia com $x$, e falta o fator 2.` },
        { letra: 'b', texto: r`$-\left(\dfrac{qV_0}{md}\right)e^{-d^2/c^2}\hat x$`, porque: r`Direção e dimensão da derivada erradas.` },
        { letra: 'c', texto: r`$-\left(\dfrac{2qV_0d}{mc^2}\right)e^{-d^2/c^2}\hat y$`, porque: r`Esquece o sinal de $\vec E = -\nabla V$.` },
        { letra: 'd', texto: r`$\left(\dfrac{2qV_0d}{mc^2}\right)e^{-d^2/c^2}\hat y$`, correta: true, porque: r`Correta: é $q\vec E/m$ com $\vec E = -\nabla V$.` },
        { letra: 'e', texto: r`$-\left(\dfrac{qV_0d}{mc^2}\right)e^{-d^2/c^2}\hat x$`, porque: r`$V$ não varia com $x$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Três afirmações sobre o potencial',
      resumo: 'Gradiente, superposição e o sinal de uma diferença.',
      enunciado: r`Considere as afirmativas sobre o potencial eletrostático (coulombiano): (I) ele é o gradiente do campo elétrico; (II) ele satisfaz um princípio de superposição; e (III) a diferença de potencial entre quaisquer dois pontos sempre pode ser feita positiva. Qual(is) é(são) verdadeira(s)?`,
      figura: { pagina: 3, recorte: [0.52, 0.135, 0.9, 0.24] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'q1', rotulo: 'Carga 1', simbolo: 'q_1', valor: 2e-9, unidade: 'C', min: -4e-9, max: 4e-9, passo: 2e-10 },
        { id: 'q2', rotulo: 'Carga 2', simbolo: 'q_2', valor: 1e-9, unidade: 'C', min: -4e-9, max: 4e-9, passo: 2e-10 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'q1', pos: [-0.03, 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: 'q2', pos: [0.03, 0, 0], rotulo: 'q₂' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: [0.01, 0.04, 0], rotulo: 'A' },
        { id: 'Bb', tipo: 'sonda', campo: 'E', pos: [0.01, -0.04, 0], rotulo: 'B' },
      ],
      visual: { linhasE: true, densidade: 10, planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'V em A', simbolo: 'V(A)', expr: 'V(0.01, 0.04, 0)', unidade: 'V' },
        { rotulo: 'Soma das parcelas em A', simbolo: 'V_1 + V_2', expr: "Vde('c1', 0.01, 0.04, 0) + Vde('c2', 0.01, 0.04, 0)", unidade: 'V', teoria: 'V(0.01, 0.04, 0)' },
        { rotulo: 'V(A) − V(B)', simbolo: r`\Delta V`, expr: 'V(0.01, 0.04, 0) - V(0.01, -0.04, 0)', unidade: 'V', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(I) É o contrário',
          texto: r`O campo é o gradiente do potencial, com sinal: $\vec E = -\nabla V$. O gradiente de um vetor nem seria um escalar. **Falsa.**`,
        },
        {
          titulo: '(II) Superposição',
          texto: r`Potenciais de várias fontes se somam, e como números: $V = V_1 + V_2$. **Verdadeira.** A medida soma as parcelas de cada carga e confere com o total.`,
          medidas: [0, 1],
        },
        {
          titulo: '(III) Nem sempre',
          previsao: { pergunta: 'Dá para fazer V(A) − V(B) positivo para quaisquer A e B?', opcoes: ['sim, trocando a ordem', 'não: pode ser zero'], correta: 1 },
          texto: r`Trocar a ordem resolve se a diferença não for nula. Mas dois pontos da mesma equipotencial têm $\Delta V = 0$, e zero não vira positivo. **Falsa.**

$A$ e $B$ são simétricos em relação à reta das cargas: estão no mesmo potencial.`,
          destacar: ['A', 'Bb'],
          medidas: [2],
        },
        {
          titulo: 'Resposta',
          texto: r`Somente a (II): alternativa **(c)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial eletrostático', lab: 'potencial' }],
        etapas: [
          { titulo: '(I)', texto: r`$\vec E = -\nabla V$, não o contrário. Falsa.`, passo: 0 },
          { titulo: '(II)', texto: r`A equação do potencial é linear nas fontes. Verdadeira.`, passo: 1 },
          { titulo: '(III)', texto: r`Pontos na mesma equipotencial têm diferença nula. Falsa.`, passo: 2 },
        ],
        resultado: r`Somente a (II): alternativa **(c)**.`,
        errosComuns: [
          r`Inverter a relação entre campo e potencial.`,
          r`Esquecer o caso $\Delta V = 0$ na afirmativa (III).`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`A superposição vale para o potencial.` },
        { letra: 'b', texto: 'Somente a I.', porque: r`A relação é $\vec E = -\nabla V$.` },
        { letra: 'c', texto: 'Somente a II.', correta: true, porque: r`Correta: (I) inverte a relação e (III) falha em equipotenciais.` },
        { letra: 'd', texto: 'Somente a III.', porque: r`Dois pontos na mesma equipotencial têm diferença nula.` },
        { letra: 'e', texto: 'Somente a I e a II.', porque: r`A (I) é falsa.` },
        { letra: 'f', texto: 'Somente a I e a III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Somente a II e a III.', porque: r`A (III) é falsa.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`Só a (II) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 0.8,
      titulo: 'Fluxo de um anel por um hemisfério',
      resumo: 'Simetria transforma o hemisfério aberto em meia esfera fechada.',
      enunciado: r`Uma superfície imaginária, não fechada, é definida pelo hemisfério superior de uma esfera de raio $a$, sem incluir a base. Um anel circular fino, de raio $b < a$, está na base dessa superfície, concêntrico com o hemisfério. Se o anel possui densidade linear $\lambda$ constante, determine o módulo do fluxo do campo gerado pelo anel através da superfície.`,
      figura: [
        { pagina: 4, recorte: [0.105, 0.125, 0.49, 0.28] },
        { pagina: 4, recorte: [0.21, 0.295, 0.38, 0.445] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [6, 8, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade', simbolo: r`\lambda`, valor: 2e-9, unidade: 'C/m', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio do hemisfério', simbolo: 'a', valor: 0.06, unidade: 'm', min: 0.05, max: 0.07, passo: 0.002 },
        { id: 'b', rotulo: 'Raio do anel', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.015, max: 0.045, passo: 0.002 },
      ],
      objetos: [
        { id: 'an', tipo: 'anelCarga', Q: '2*pi*b*lam', centro: [0, 0, 0], raio: 'b', normal: 'z', rotulo: 'anel' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'a', rotulo: 'esfera' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga do anel', simbolo: 'Q', expr: "carga('an')", unidade: 'C', teoria: '2*pi*b*lam' },
        { rotulo: 'Fluxo pela esfera inteira', simbolo: r`\Phi_\text{esfera}`, expr: "fluxo('G')", unidade: 'V·m', teoria: '2*pi*b*lam/eps0' },
        { rotulo: 'Fluxo pelo hemisfério', simbolo: r`\Phi`, expr: "fluxo('G')/2", unidade: 'V·m', teoria: 'pi*b*lam/eps0' },
        { rotulo: 'Simetria: E_z acima + E_z abaixo', simbolo: 'E_z^+ + E_z^-', expr: 'z(E(0.04, 0.01, 0.03)) + z(E(0.04, 0.01, -0.03))', unidade: 'V/m', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Fechar a superfície',
          texto: r`O fluxo por uma superfície aberta não sai direto de Gauss. Complete com o hemisfério de baixo: a esfera inteira envolve toda a carga do anel, $Q = 2\pi b\lambda$:

$$\Phi_\text{esfera} = \frac{2\pi b\lambda}{\varepsilon_0}.$$

A cena mostra a esfera em corte, com a metade de trás.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Simetria entre as metades',
          previsao: { pergunta: 'O fluxo por cada hemisfério é…', opcoes: ['igual', 'maior em cima', 'maior embaixo'], correta: 0 },
          texto: r`O anel está no plano do equador. Uma reflexão nesse plano não altera a fonte e leva uma metade na outra: os dois hemisférios têm o mesmo fluxo. A medida de $E_z$ em pontos espelhados mostra isso.`,
          medidas: [3],
        },
        {
          titulo: 'Resposta',
          texto: r`$$\Phi = \frac12\cdot\frac{2\pi b\lambda}{\varepsilon_0} = \frac{\pi b\lambda}{\varepsilon_0}.$$

Alternativa **(f)**. Mude $a$: o fluxo não muda, porque depende só da carga.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss', lab: 'gauss' },
          { texto: 'Simetria de reflexão' },
        ],
        etapas: [
          { titulo: 'Carga', texto: r`$Q = \lambda\cdot2\pi b$.`, passo: 0 },
          { titulo: 'Esfera', texto: r`$\Phi_\text{esfera} = Q/\varepsilon_0$.`, passo: 0 },
          { titulo: 'Metade', texto: r`Por simetria, cada hemisfério tem metade: $\pi b\lambda/\varepsilon_0$.`, passo: 2 },
        ],
        resultado: r`$\Phi = \dfrac{\pi b\lambda}{\varepsilon_0}$: alternativa **(f)**.`,
        errosComuns: [
          r`Aplicar Gauss direto à superfície aberta e esquecer o fator 1/2.`,
          r`Usar o raio do hemisfério $a$ na carga: o comprimento do anel é $2\pi b$.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$2\pi b\lambda/\varepsilon_0$`, porque: r`É o fluxo pela esfera **inteira**.` },
        { letra: 'b', texto: r`$\pi a\lambda/\varepsilon_0$`, porque: r`Usa o raio do hemisfério em vez do raio do anel.` },
        { letra: 'c', texto: r`$2\pi a\lambda/\varepsilon_0$`, porque: r`Esfera inteira e raio errado.` },
        { letra: 'd', texto: r`$b^2\lambda/(a\varepsilon_0)$`, porque: r`O fluxo não depende de $a$.` },
        { letra: 'e', texto: r`$a^2\lambda/(b\varepsilon_0)$`, porque: r`O fluxo não depende de $a$.` },
        { letra: 'f', texto: r`$\pi b\lambda/\varepsilon_0$`, correta: true, porque: r`Correta: metade de $Q/\varepsilon_0$.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 5.2,
      titulo: 'Camada com ρ ∝ 1/r e carga no centro',
      resumo: 'Gauss em três regiões, ddp e a condição de campo constante.',
      enunciado: r`Um sistema é constituído por uma camada esférica não condutora, de raios interno $a$ e externo $5a$, e uma partícula de carga $q$ concêntrica com ela. A camada tem densidade $\rho(r) = \rho_0(a/r)$, com $\rho_0$ constante.

(a) Considere superfícies esféricas concêntricas: $S_1$, com $a < r < 5a$, e $S_2$, com $r > 5a$. Mostre que as cargas nos seus interiores são $Q_1 = q + 2\pi\rho_0a(r^2 - a^2)$ e $Q_2 = q + 48\pi\rho_0a^3$. (b) Usando a lei de Gauss, determine $\vec E$ nas regiões (I) $0 < r < a$, (II) $a < r < 5a$ e (III) $5a < r < \infty$. (c) Determine $V(5a) - V(a)$. (d) Deduza qual deve ser a razão $\rho_0/q$ para que o módulo do campo seja constante em $a < r < 5a$. (e) Satisfeita essa condição, faça um esboço de $E_r\times r$ em $0 < r < 8a$, destacando os detalhes importantes, com $q > 0$ e $\rho_0 > 0$.`,
      figura: [
        { pagina: 4, recorte: [0.5, 0.125, 0.885, 0.635], mascaras: [{ area: [0.862, 0.49, 0.89, 0.536], letra: '' }] },
        { pagina: 4, recorte: [0.69, 0.635, 0.875, 0.9] },
      ],
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', plano: 'xy', camera: { pos: [6, 8, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Constante ρ₀', simbolo: r`\rho_0`, valor: 2e-6, unidade: 'C/m³', min: 5e-7, max: 4e-6, passo: 1e-7 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.015, unidade: 'm', min: 0.015, max: 0.015 },
        { id: 'fq', rotulo: 'q em unidades de 2πρ₀a³', simbolo: 'q/2\\pi\\rho_0a^3', valor: 2, min: 0, max: 4, passo: 0.25 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.045, unidade: 'm', min: 0.006, max: 0.12, passo: 0.003 },
      ],
      objetos: [
        { id: 'q', tipo: 'carga', q: 'fq*2*pi*rho0*a^3', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'cam', tipo: 'esfera', centro: [0, 0, 0], raio: '5*a', raioInterno: 'a', rho: 'rho0*a/r', rotulo: 'camada' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro de S', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: Qenv('rg').replace('qq', 'fq*2*pi*rho0*a^3') },
        { rotulo: 'Campo em r', simbolo: 'E_r', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: `(${Qenv('rg').replace('qq', 'fq*2*pi*rho0*a^3')})/(4*pi*eps0*rg^2)` },
        { rotulo: 'V(5a) − V(a)', simbolo: r`\Delta V`, expr: 'V(5*a, 0, 0) - V(a, 0, 0)', unidade: 'V', teoria: '(2*pi*rho0*a^3 - fq*2*pi*rho0*a^3)/(5*pi*eps0*a) - 2*rho0*a^2/eps0' },
        { rotulo: 'Campo em r = 3a', simbolo: 'E(3a)', expr: 'x(E(3*a, 0, 0))', unidade: 'V/m', teoria: 'rho0*a/(2*eps0)', ativo: 'fq==1' },
        { rotulo: 'Campo em r = 4,5a', simbolo: 'E(4{,}5a)', expr: 'x(E(4.5*a, 0, 0))', unidade: 'V/m', teoria: 'rho0*a/(2*eps0)', ativo: 'fq==1' },
        { rotulo: 'Campo em r = 8a', simbolo: 'E(8a)', expr: 'x(E(8*a, 0, 0))', unidade: 'V/m', teoria: '25/64*rho0*a/(2*eps0)', ativo: 'fq==1' },
      ],
      graficos: [
        {
          titulo: 'E_r(r) (cortado perto da carga)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: '0.3*a', ate: '8*a', rotulo: 'r', unidade: 'm' },
          series: [{ rotulo: 'E_r', expr: 'min(x(E(rr, 0, 0)), 2*rho0*a/eps0)', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Carga envolvida',
          texto: r`A simetria é esférica. Integrando em cascas $4\pi r'^2dr'$:

$$Q_1 = q + 4\pi\rho_0a\int_a^rr'\,dr' = q + 2\pi\rho_0a(r^2 - a^2).$$

Com $r = 5a$, a camada toda: $Q_2 = q + 2\pi\rho_0a\cdot24a^2 = q + 48\pi\rho_0a^3$.`,
          parametros: { rg: 0.045, fq: 2 },
          destacar: ['G'],
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Campo nas três regiões',
          texto: r`De $4\pi r^2E = Q_\text{int}/\varepsilon_0$:

$$\vec E_\text{I} = \frac{q}{4\pi\varepsilon_0r^2}\hat r,$$

$$\vec E_\text{II} = \left[\frac{q - 2\pi\rho_0a^3}{4\pi\varepsilon_0r^2} + \frac{\rho_0a}{2\varepsilon_0}\right]\hat r,$$

$$\vec E_\text{III} = \frac{q + 48\pi\rho_0a^3}{4\pi\varepsilon_0r^2}\hat r.$$

Passe a gaussiana pelas três regiões.`,
          parametros: { rg: 0.03, fq: 2 },
          medidas: [0, 1],
        },
        {
          item: 'c',
          titulo: '(c) Diferença de potencial',
          texto: r`Por um caminho radial:

$$V(5a) - V(a) = -\int_a^{5a}E_\text{II}\,dr = \frac{2\pi\rho_0a^3 - q}{5\pi\varepsilon_0a} - \frac{2\rho_0a^2}{\varepsilon_0}.$$`,
          parametros: { rg: 0.045, fq: 2 },
          medidas: [2],
        },
        {
          item: 'd',
          titulo: '(d) Campo constante na camada',
          previsao: { pergunta: 'Para E constante em a < r < 5a, qual termo tem de sumir?', opcoes: ['o que vai com 1/r²', 'o termo constante'], correta: 0 },
          texto: r`Basta anular o termo em $1/r^2$:

$$q - 2\pi\rho_0a^3 = 0 \quad\Rightarrow\quad \frac{\rho_0}{q} = \frac{1}{2\pi a^3},$$

e aí $E_\text{II} = \rho_0a/2\varepsilon_0$, a mesma em toda a camada. Medido em dois raios diferentes, dá o mesmo.`,
          parametros: { fq: 1, rg: 0.045 },
          medidas: [3, 4],
        },
        {
          item: 'e',
          titulo: '(e) O gráfico',
          texto: r`Três trechos: diverge como $1/r^2$ perto da carga e cai até $E(a)$; patamar até $5a$; cai de novo com $1/r^2$.

Com $E_0 = \rho_0a/2\varepsilon_0$: $E(a) = E(5a) = E_0$ e $E(8a) = \frac{25}{64}E_0$. O campo é contínuo em $r = a$ e $r = 5a$, pois não há carga superficial.`,
          parametros: { fq: 1, rg: 0.075 },
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: '(a) Cargas', texto: r`$Q_1 = q + 2\pi\rho_0a(r^2-a^2)$; com $r = 5a$, $Q_2 = q + 48\pi\rho_0a^3$.`, passo: 0 },
          { titulo: '(b) Campos', texto: r`$E = Q_\text{int}/4\pi\varepsilon_0r^2$ com a carga de cada região.`, passo: 1 },
          { titulo: '(c) ddp', texto: r`Integrando $E_\text{II}$ de $a$ a $5a$: $\Delta V = \dfrac{2\pi\rho_0a^3-q}{5\pi\varepsilon_0a} - \dfrac{2\rho_0a^2}{\varepsilon_0}$.`, passo: 2 },
          { titulo: '(d) Condição', texto: r`$\rho_0/q = 1/2\pi a^3$, com $E_\text{II} = \rho_0a/2\varepsilon_0$.`, passo: 3 },
          { titulo: '(e) Gráfico', texto: r`Decai até $r = a$, patamar até $5a$, decai depois, com $E(8a) = \frac{25}{64}E(a)$.`, passo: 4 },
        ],
        resultado: r`$\rho_0/q = 1/(2\pi a^3)$ e $E_\text{II} = \rho_0a/2\varepsilon_0$; $\Delta V = \dfrac{2\pi\rho_0a^3-q}{5\pi\varepsilon_0a} - \dfrac{2\rho_0a^2}{\varepsilon_0}$.`,
        errosComuns: [
          r`Esquecer $q$ nas cargas envolvidas: a partícula está dentro de todas as gaussianas.`,
          r`Usar $\rho\cdot$volume: a densidade varia com $r$.`,
          r`Trocar o sinal da ddp: ela é $V(5a) - V(a)$.`,
        ],
        oficial: { resposta: r`$\vec E_\text{I} = \dfrac{q}{4\pi\varepsilon_0r^2}\hat r$; $\vec E_\text{II} = \left[\dfrac{q - 2\pi\rho_0a^3}{4\pi\varepsilon_0r^2} + \dfrac{\rho_0a}{2\varepsilon_0}\right]\hat r$; $\vec E_\text{III} = \dfrac{q + 48\pi\rho_0a^3}{4\pi\varepsilon_0r^2}\hat r$; $\dfrac{\rho_0}{q} = \dfrac{1}{2\pi a^3}$.` },
      },
      respostas: [
        { item: 'a', texto: r`$Q_1 = q + 2\pi\rho_0a(r^2-a^2)$; $Q_2 = q + 48\pi\rho_0a^3$`, pontos: 0.8, criterio: 'Integração em cascas e inclusão da partícula.' },
        { item: 'b', texto: r`$\vec E_\text{I}$, $\vec E_\text{II}$ e $\vec E_\text{III}$ como no resultado oficial`, pontos: 1.5, criterio: 'Gauss com simetria esférica nas três regiões.' },
        { item: 'c', texto: r`$\Delta V = \dfrac{2\pi\rho_0a^3-q}{5\pi\varepsilon_0a} - \dfrac{2\rho_0a^2}{\varepsilon_0}$`, pontos: 1, criterio: 'Integral de linha de $E_\\text{II}$.' },
        { item: 'd', texto: r`$\rho_0/q = 1/(2\pi a^3)$`, pontos: 0.9, criterio: r`Anular o termo em $1/r^2$.` },
        { item: 'e', texto: r`Queda até $a$, patamar até $5a$, queda até $E(8a) = \frac{25}{64}E(a)$`, pontos: 1, criterio: 'Divergência na origem, continuidade, concavidades e valores.' },
      ],
    },
  ],
}

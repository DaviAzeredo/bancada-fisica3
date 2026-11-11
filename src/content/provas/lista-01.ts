import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Exercício 2: esferas penduradas no ponto (0, 0), a um ângulo th da vertical. */
const SEN2 = 'sin(rad(th))'
const COS2 = 'cos(rad(th))'
const E2 = `(k0*q/(4*l^2*${SEN2}^2) + m*9.8*tan(rad(th))/q)`

/* Exercício 4: triângulo de lado a com a base no eixo x; P na origem. */
const H4 = 'a*sqrt(3)/2'

/* Exercício 5: órbita desenhada com raio Rs; as grandezas reais saem por escala. */
const VS5 = 'sqrt(k0*qe^2/(me*Rs))'

/* Exercício 7: a segunda barra em 40 pedaços, para somar a força do campo da primeira. */
const PEDACOS = 40
const F7 = Array.from({ length: PEDACOS }, (_, k) => `x(Ede('b1', b + a*${-1 + (2 * k + 1) / PEDACOS}, 0, 0))`).join(' + ')

/* Exercício 10: o disco como 40 anéis iguais (carga 2πσ₀R²/N cada). */
const ANEIS = 40
const aneis10 = Array.from({ length: ANEIS }, (_, k) => ({
  id: `a${k}`,
  tipo: 'anelCarga' as const,
  Q: `2*pi*s0*R^2/${ANEIS}`,
  centro: [0, 0, 0] as [number, number, number],
  raio: `R*${(k + 0.5) / ANEIS}`,
  normal: 'z' as const,
}))

/* Exercício 11: a casca cilíndrica como 40 anéis ao longo de x, de −h a 0. */
const aneis11 = Array.from({ length: ANEIS }, (_, k) => ({
  id: `c${k}`,
  tipo: 'anelCarga' as const,
  Q: `Q0/${ANEIS}`,
  centro: [`0-h*${1 - (k + 0.5) / ANEIS}`, 0, 0] as [string, number, number],
  raio: 'R',
  normal: 'x' as const,
}))

export const lista_01: ProvaInput = {
  id: 'lista-01',
  titulo: 'Lista 1 · Carga elétrica e campo elétrico',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Equilíbrio entre q e 3q',
      resumo: 'A d/(1 + √3) ≈ 0,37d da carga q; estável para cargas positivas, instável para negativas.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.309] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [5, -2, 12], alvo: [5, 0, 0] } },
      parametros: [
        { id: 'sq', rotulo: 'Sinal da terceira carga', valor: 1, opcoes: [{ valor: 1, rotulo: 'positiva' }, { valor: -1, rotulo: 'negativa' }] },
        { id: 'q', rotulo: 'Carga q', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 1e-9, max: 1e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Comprimento do bastão', simbolo: 'd', valor: 0.1, unidade: 'm', min: 0.1, max: 0.1, passo: 0.001 },
        { id: 'xp', rotulo: 'Posição da terceira carga', simbolo: 'x', valor: 0.0366025, unidade: 'm', min: 0.01, max: 0.09, passo: 0.0005 },
      ],
      objetos: [
        { id: 'qa', tipo: 'carga', q: 'q', pos: [0, 0, 0], rotulo: 'q' },
        { id: 'qb', tipo: 'carga', q: '3*q', pos: ['d', 0, 0], rotulo: '3q' },
        { id: 'qp', tipo: 'carga', q: 'sq*1e-10', pos: ['xp', 0, 0], arraste: { param: 'xp', eixo: 'x' }, rotulo: "q'" },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: ['xp', 0, 0], vetor: "F('qp') + vec(1e-15, 0, 0)", comprimento: '1.5*cm', rotulo: 'F' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Força ao longo do bastão', simbolo: r`F_x`, expr: "1e6*x(F('qp'))", unidade: 'μN', teoria: '1e6*k0*sq*1e-10*(q/xp^2 - 3*q/(d - xp)^2)' },
        { rotulo: 'Posição de equilíbrio', simbolo: r`x_\text{eq} = \frac{d}{1 + \sqrt3}`, expr: '100*d/(1 + sqrt(3))', unidade: 'cm' },
      ],
      passos: [
        {
          titulo: '(a) Equilíbrio',
          texto: r`As duas repulsões (ou atrações) se igualam: $\dfrac{kq}{x^2} = \dfrac{3kq}{(d - x)^2}$, então $\dfrac{d - x}{x} = \sqrt3$ e
$$x = \frac{d}{1 + \sqrt3} \approx 0{,}37d$$
a partir de $q$ (ou $0{,}63d$ a partir de $3q$). Não depende da terceira carga.`,
          parametros: { xp: 0.0366025, sq: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(b) Carga positiva: estável',
          texto: r`Desloque para a direita: a repulsão de $3q$ cresce mais que a de $q$, e a força empurra de volta. Ao longo do bastão o equilíbrio é **estável**.`,
          parametros: { xp: 0.045, sq: 1 },
          medidas: [0],
        },
        { titulo: '(b) Carga negativa: instável', texto: r`Agora as forças são atrações: deslocada para a direita, a atração de $3q$ ganha e a afasta ainda mais. **Instável**.`, parametros: { xp: 0.045, sq: -1 }, medidas: [0] },
      ],
      respostas: [
        { item: '(a)', texto: r`$x = \dfrac{d}{1 + \sqrt3} \approx 0{,}37d$ a partir de $q$` },
        { item: '(b)', texto: 'Estável se a terceira carga é positiva; instável se é negativa (para deslocamentos ao longo do bastão).' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Coulomb e superposição', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Igualar', texto: r`Forças opostas iguais.`, passo: 0 },
          { titulo: 'Deslocar', texto: r`Ver o sentido da força.`, passo: 1 },
        ],
        resultado: r`$x \approx 0{,}37d$ de $q$.`,
        errosComuns: ['Pôr o ponto de equilíbrio mais perto da carga maior.'],
        oficial: {
          resposta: 'X_eq = √3d/(1 + √3) ≈ 0,63d (medido a partir de 3q; ≈ 0,36d a partir de q). Estável se q′ > 0, instável se q′ < 0.',
        },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Pêndulos carregados num campo horizontal',
      resumo: 'T = mg/cos θ; E = kq/(4l² sen²θ) + mg tg θ/q.',
      figura: { pagina: 1, recorte: [0.089, 0.311, 0.936, 0.659] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, -4, 15], alvo: [0, -5, 0] } },
      parametros: [
        { id: 'th', rotulo: 'Ângulo com a vertical', simbolo: r`\theta`, valor: 10, unidade: '°', min: 5, max: 25, passo: 0.5 },
        { id: 'm', rotulo: 'Massa de cada esfera', simbolo: 'm', valor: 1e-3, unidade: 'kg', min: 1e-3, max: 1e-3, passo: 1e-4 },
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-8, unidade: 'C', min: 1e-8, max: 1e-8, passo: 1e-9 },
        { id: 'l', rotulo: 'Comprimento do fio', simbolo: 'l', valor: 0.1, unidade: 'm', min: 0.1, max: 0.1, passo: 0.001 },
      ],
      objetos: [
        { id: 'Eh', tipo: 'campoE', valor: [E2, 0, 0], potencial: `0-${E2}*x`, rotulo: 'E (o valor do equilíbrio)' },
        { id: 'neg', tipo: 'carga', q: '0-q', pos: [`0-l*${SEN2}`, `0-l*${COS2}`, 0], rotulo: '−q' },
        { id: 'pos', tipo: 'carga', q: 'q', pos: [`l*${SEN2}`, `0-l*${COS2}`, 0], rotulo: '+q' },
        { id: 'f1', tipo: 'fio', I: 0, a: [0, 0, 0], b: [`0-l*${SEN2}`, `0-l*${COS2}`, 0] },
        { id: 'f2', tipo: 'fio', I: 0, a: [0, 0, 0], b: [`l*${SEN2}`, `0-l*${COS2}`, 0] },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Força elétrica horizontal na esfera +q (campo + atração)', simbolo: r`qE - \frac{kq^2}{(2l\sin\theta)^2}`, expr: "1e3*x(F('pos'))", unidade: 'mN', teoria: '1e3*m*9.8*tan(rad(th))' },
        { rotulo: 'Atração entre as esferas', simbolo: r`\frac{kq^2}{(2l\sin\theta)^2}`, expr: `1e3*k0*q^2/(2*l*${SEN2})^2`, unidade: 'mN' },
        { rotulo: 'Tensão no fio', simbolo: r`T = \frac{mg}{\cos\theta}`, expr: `1e3*m*9.8/${COS2}`, unidade: 'mN' },
        { rotulo: 'Campo elétrico', simbolo: 'E', expr: `1e-3*${E2}`, unidade: 'kV/m' },
      ],
      passos: [
        {
          titulo: '(a) Tensão',
          texto: r`Na vertical só há peso e a parte vertical da tensão: $T\cos\theta = mg$, então $T = \dfrac{mg}{\cos\theta}$.`,
          medidas: [2],
        },
        {
          titulo: '(b) Campo',
          texto: r`Na horizontal, a esfera $+q$ sente $qE$ para fora e a atração $\dfrac{kq^2}{(2l\sin\theta)^2}$ para dentro; a tensão equilibra o resto, $T\sin\theta = mg\tan\theta$:
$$E = \frac{kq}{4l^2\sin^2\theta} + \frac{mg\tan\theta}{q}.$$
A simulação soma o campo e a atração da outra esfera e confere que dá $mg\tan\theta$.`,
          medidas: [0, 1, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$T = \dfrac{mg}{\cos\theta}$` },
        { item: '(b)', texto: r`$E = \dfrac{kq}{4l^2\sin^2\theta} + \dfrac{mg\tan\theta}{q}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Coulomb', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Vertical', texto: r`$T\cos\theta = mg$.`, passo: 0 },
          { titulo: 'Horizontal', texto: r`$qE = kq^2/r^2 + T\sin\theta$.`, passo: 1 },
        ],
        resultado: r`$T = mg/\cos\theta$; $E = \frac{kq}{4l^2\sin^2\theta} + \frac{mg\tan\theta}{q}$.`,
        errosComuns: ['Esquecer a atração entre as esferas.'],
        oficial: { resposta: 'T = mg/cos θ; E = k₀q/(4l² sen²θ) + mg tg θ/q.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Carga oscilando entre duas cargas fixas',
      resumo: 'F = −2kQqx/(x² + d²/4)^{3/2} x̂: sempre para a origem, e a carga oscila entre a e −a.',
      figura: [
        { pagina: 1, recorte: [0.089, 0.66, 0.936, 0.72] },
        { pagina: 2, recorte: [0.089, 0.058, 0.936, 0.337] },
      ],
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 11], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 1e-3 } },
      parametros: [
        { id: 'q', rotulo: 'Cargas fixas', simbolo: 'q', valor: 1e-8, unidade: 'C', min: 1e-8, max: 1e-8, passo: 1e-9 },
        { id: 'Q', rotulo: 'Carga móvel (módulo)', simbolo: 'Q', valor: 1e-8, unidade: 'C', min: 1e-8, max: 1e-8, passo: 1e-9 },
        { id: 'd', rotulo: 'Distância entre as fixas', simbolo: 'd', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
        { id: 'a', rotulo: 'Ponto de soltura', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
        { id: 'xp', rotulo: 'Posição para medir a força', simbolo: 'x', valor: 0.02, unidade: 'm', min: -0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: 'q', pos: [0, 'd/2', 0], rotulo: '+q' },
        { id: 'q2', tipo: 'carga', q: 'q', pos: [0, '0-d/2', 0], rotulo: '+q' },
        { id: 'p', tipo: 'particula', q: '0-Q', m: 0.001, pos: ['a', 0, 0], v: [0, 0, 0], rotulo: '−Q (1 g)' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Força sobre −Q em x', simbolo: r`F_x = -\frac{2kQqx}{(x^2 + d^2/4)^{3/2}}`, expr: '1e3*(0-Q)*x(E(xp, 0, 0))', unidade: 'mN', teoria: '1e3*(0-2*k0*Q*q*xp/(xp^2 + d^2/4)^1.5)' },
        { rotulo: 'Excursão do rastro (de a até o outro extremo)', simbolo: r`2a`, ativo: "x(pos('p')) < 0 && x(vel('p')) > 0", expr: "100*rastroSpan('p', 'x')", unidade: 'cm', teoria: '100*2*a' },
      ],
      passos: [
        {
          titulo: '(a) Força',
          texto: r`As componentes $y$ das duas atrações se cancelam; as $x$ somam: cada carga está a $\sqrt{x^2 + d^2/4}$ e
$$\vec F = -\frac{2kQq\,x}{(x^2 + d^2/4)^{3/2}}\hat x,$$
sempre apontando para a origem.`,
          medidas: [0],
        },
        {
          titulo: '(b) Movimento',
          texto: r`Solta em $x = a$, a partícula acelera para a origem, passa por ela com velocidade máxima e é freada do outro lado, parando em $x = -a$. Sem dissipação, oscila entre $a$ e $-a$ (não é harmônico, salvo para $a \ll d$). Rode e veja o rastro.`,
          medidas: [1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec F = -\dfrac{2kQq\,x}{(x^2 + d^2/4)^{3/2}}\hat x$` },
        { item: '(b)', texto: r`Oscila entre $a$ e $-a$; ao passar pela origem a força troca de sentido e a freia.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Superposição de forças de Coulomb', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Simetria', texto: r`Componentes $y$ se cancelam.`, passo: 0 },
          { titulo: 'Movimento', texto: r`Força restauradora.`, passo: 1 },
        ],
        resultado: r`Oscilação entre $\pm a$.`,
        errosComuns: ['Achar que a partícula para na origem: ali a força é zero, mas a velocidade é máxima.'],
        oficial: { resposta: 'F = −2k₀Qq x/(x² + d²/4)^{3/2} x̂; oscila entre x = a e x = −a.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Fácil',
      titulo: 'Três cargas num triângulo equilátero',
      resumo: 'E_P = −q/(3πε₀a²) ŷ; E_centro = −3q/(2πε₀a²) ŷ; F na −q da direita = (kq²/a²)(½, √3/2).',
      figura: { pagina: 2, recorte: [0.089, 0.338, 0.936, 0.617] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', plano: 'xy', camera: { pos: [0, 1.5, 11], alvo: [0, 1.5, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'm1', tipo: 'carga', q: '0-q', pos: ['0-a/2', 0, 0], rotulo: '−q' },
        { id: 'm2', tipo: 'carga', q: '0-q', pos: ['a/2', 0, 0], rotulo: '−q' },
        { id: 'p', tipo: 'carga', q: 'q', pos: [0, H4, 0], rotulo: '+q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'P' },
        { id: 'C', tipo: 'sonda', campo: 'E', pos: [0, `${H4}/3`, 0], rotulo: 'centro' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em P, componente y', simbolo: r`E_y(P) = -\frac{q}{3\pi\varepsilon_0a^2}`, expr: 'y(E(0, 0, 0))', unidade: 'V/m', teoria: '0-q/(3*pi*eps0*a^2)' },
        { rotulo: 'Campo no centro, componente y', simbolo: r`E_y = -\frac{3q}{2\pi\varepsilon_0a^2}`, expr: `y(E(0, ${H4}/3, 0))`, unidade: 'V/m', teoria: '0-3*q/(2*pi*eps0*a^2)' },
        { rotulo: 'Força na −q da direita, componente x', simbolo: r`F_x = \frac{kq^2}{2a^2}`, expr: "1e6*x(F('m2'))", unidade: 'μN', teoria: '1e6*k0*q^2/(2*a^2)' },
        { rotulo: 'Força na −q da direita, componente y', simbolo: r`F_y = \frac{\sqrt3}{2}\frac{kq^2}{a^2}`, expr: "1e6*y(F('m2'))", unidade: 'μN', teoria: '1e6*sqrt(3)/2*k0*q^2/a^2' },
      ],
      passos: [
        {
          titulo: '(a) Ponto P',
          texto: r`As duas $-q$ estão à mesma distância de $P$, em lados opostos: seus campos se cancelam. Sobra o de $+q$, a uma altura $a\sqrt3/2$, apontando para longe dela (para baixo): $E = \dfrac{kq}{3a^2/4} = \dfrac{q}{3\pi\varepsilon_0a^2}$.`,
          medidas: [0],
        },
        {
          titulo: '(b) Centro',
          texto: r`As três estão a $a/\sqrt3$ do centro, cada uma com campo $3kq/a^2$. O de $+q$ aponta para baixo; os das $-q$ apontam para elas, com componente para baixo de $\tfrac12$ cada: $E = \dfrac{3kq}{a^2}(1 + \tfrac12 + \tfrac12) = \dfrac{3q}{2\pi\varepsilon_0a^2}$, para baixo.`,
          medidas: [1],
        },
        {
          titulo: '(c) Força numa −q',
          texto: r`Na $-q$ da direita: repulsão da outra $-q$, $kq^2/a^2$ para a direita, e atração de $+q$, $kq^2/a^2$ na direção $(-\tfrac12, \tfrac{\sqrt3}2)$. Soma: $\vec F = \dfrac{kq^2}{a^2}\left(\tfrac12\hat x + \tfrac{\sqrt3}{2}\hat y\right)$.`,
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E_P = -\dfrac{q}{3\pi\varepsilon_0a^2}\hat y$` },
        { item: '(b)', texto: r`$\vec E_\text{centro} = -\dfrac{3q}{2\pi\varepsilon_0a^2}\hat y$` },
        { item: '(c)', texto: r`$\vec F = \dfrac{kq^2}{2a^2}\hat x + \dfrac{\sqrt3}{2}\dfrac{kq^2}{a^2}\hat y$ (na carga da direita)` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de cargas pontuais', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Simetria', texto: r`Cancelamentos horizontais.`, passo: 0 },
          { titulo: 'Somar', texto: r`Componentes verticais.`, passo: 1 },
        ],
        resultado: r`Veja os itens.`,
        errosComuns: ['Errar o sentido do campo de uma carga negativa: ele aponta para ela.'],
        oficial: { resposta: 'E_P = −q/(3πε₀a²) ŷ; E_centro = −3q/(2πε₀a²) ŷ; F = k₀q²/(2a²) x̂ + (√3/2)k₀q²/a² ŷ.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Elétron em órbita no átomo de Bohr',
      resumo: 'a = ke²/ma₀² para o centro; v = √(ke²/ma₀) ≈ 2,2×10⁶ m/s; T ≈ 1,5×10⁻¹⁶ s; a gravidade é 10³⁹ vezes menor.',
      figura: { pagina: 2, recorte: [0.089, 0.619, 0.936, 0.751] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 11], alvo: [0, 0, 0] }, tempo: { escala: 2e-3, unidade: 'ms', passo: 1e-6 } },
      parametros: [
        { id: 'a0', rotulo: 'Raio de Bohr', simbolo: 'a_0', valor: 0.529e-10, unidade: 'm', min: 0.529e-10, max: 0.529e-10, passo: 1e-12 },
        { id: 'Rs', rotulo: 'Raio desenhado (escala da cena)', simbolo: r`R_\text{cena}`, valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'pr', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: 'próton' },
        { id: 'el', tipo: 'particula', q: '0-qe', m: 'me', pos: ['Rs', 0, 0], v: [0, VS5, 0], rotulo: 'elétron' },
      ],
      visual: { setasE: false },
      medidas: [
        {
          rotulo: 'Aceleração do elétron (no átomo real)',
          simbolo: r`a = \frac{ke^2}{ma_0^2}`,
          expr: "qe*mag(E(pos('el')))/me*(Rs/a0)^2",
          unidade: 'm/s²',
          teoria: 'k0*qe^2/(me*a0^2)',
        },
        { rotulo: 'Velocidade (no átomo real)', simbolo: r`v = \sqrt{\frac{ke^2}{ma_0}}`, expr: "mag(vel('el'))*sqrt(Rs/a0)", unidade: 'm/s', teoria: 'sqrt(k0*qe^2/(me*a0))' },
        { rotulo: 'Raio da órbita simulada', simbolo: 'r', expr: "100*mag(pos('el'))", unidade: 'cm', teoria: '100*Rs' },
        { rotulo: 'Período', simbolo: r`T = \frac{2\pi a_0}{v}`, expr: '2*pi*a0/sqrt(k0*qe^2/(me*a0))', unidade: 's' },
        { rotulo: 'Gravidade / força elétrica', simbolo: r`\frac{Gm_pm_e}{ke^2}`, expr: '6.674e-11*mp*me/(k0*qe^2)', unidade: '' },
      ],
      passos: [
        {
          titulo: '(a) Aceleração',
          texto: r`A força de Coulomb é a única: $\vec a = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{e^2}{ma_0^2}\hat r$, para o próton. A cena desenha a órbita com 3 cm de raio e leva as grandezas ao átomo real por escala.`,
          medidas: [0],
        },
        { titulo: '(b) Velocidade', texto: r`Centrípeta: $\dfrac{ke^2}{a_0^2} = \dfrac{mv^2}{a_0}$, $v = \sqrt{\dfrac{ke^2}{ma_0}} \approx 2{,}2\times10^6$ m/s. Rode: a órbita simulada fica circular.`, medidas: [1, 2] },
        { titulo: '(c) Período', texto: r`$T = \dfrac{2\pi a_0}{v} = \dfrac4e\sqrt{\pi^3\varepsilon_0ma_0^3} \approx 1{,}5\times10^{-16}$ s.`, medidas: [3] },
        { titulo: '(d) Gravidade', texto: r`As duas forças caem com $1/r^2$; a razão é $\dfrac{Gm_pm_e}{ke^2} \approx 4\times10^{-40}$. Massas minúsculas e $G$ pequeno contra cargas e $k$ enormes.`, medidas: [4] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec a = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{e^2}{ma_0^2}\hat r$` },
        { item: '(b)', texto: r`$v = \sqrt{\dfrac{1}{4\pi\varepsilon_0}\dfrac{e^2}{ma_0}}$` },
        { item: '(c)', texto: r`$T = \dfrac{2\pi a_0}{v} = \dfrac4e\sqrt{\pi^3a_0^3\varepsilon_0m}$` },
        { item: '(d)', texto: r`A razão gravidade/elétrica é da ordem de $10^{-40}$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Coulomb', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Força', texto: r`Coulomb.`, passo: 0 },
          { titulo: 'Centrípeta', texto: r`$v^2/a_0$.`, passo: 1 },
        ],
        resultado: r`$v \approx 2{,}2\times10^6$ m/s; $T \approx 1{,}5\times10^{-16}$ s.`,
        errosComuns: ['Esquecer o quadrado de $e$ na força.'],
        oficial: { resposta: 'a = −(1/4πε₀)e²/(ma₀²) r̂; v = √(e²/(4πε₀ma₀)); T = 2πa₀/v = (4/e)√(π³a₀³ε₀m); a gravidade é desprezível.' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Partícula desviada entre as placas',
      resumo: 'a = −qE/m ŷ; trajetória y = −qEx²/2mv₀², uma parábola; na saída, tg θ = −qEL/mv₀².',
      figura: [
        { pagina: 2, recorte: [0.089, 0.752, 0.936, 0.826] },
        { pagina: 3, recorte: [0.089, 0.058, 0.936, 0.312] },
      ],
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [4, 0, 14], alvo: [4, 0, 0] }, tempo: { escala: 5e-7, unidade: 'ns', passo: 1e-10 } },
      parametros: [
        { id: 'E0', rotulo: 'Campo entre as placas (para baixo)', simbolo: 'E', valor: 800, unidade: 'V/m', min: 100, max: 1000, passo: 10 },
        { id: 'v0', rotulo: 'Velocidade inicial', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 7e4, max: 2e5, passo: 1e3 },
        { id: 'L', rotulo: 'Comprimento das placas', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.001 },
        { id: 'd', rotulo: 'Separação das placas', simbolo: 'd', valor: 0.08, unidade: 'm', min: 0.08, max: 0.08, passo: 0.001 },
      ],
      objetos: [
        { id: 'Ep', tipo: 'campoE', valor: 'x >= 0 && x <= L && abs(y) < d/2 ? [0, 0-E0, 0] : [0, 0, 0]', rotulo: 'E' },
        { id: 'sup', tipo: 'placa', sigma: 0, centro: ['L/2', 'd/2', 0], normal: 'y', largura: 0.03, altura: 'L', rotulo: 'placa' },
        { id: 'inf', tipo: 'placa', sigma: 0, centro: ['L/2', '0-d/2', 0], normal: 'y', largura: 0.03, altura: 'L', rotulo: 'placa' },
        { id: 'p', tipo: 'particula', q: 'qe', m: 'mp', pos: [0, 0, 0], v: ['v0', 0, 0], rotulo: 'próton' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade vertical em x (simulada)', simbolo: r`v_y = -\frac{qE}{m}\frac{x}{v_0}`, expr: "y(vel('p'))", unidade: 'm/s', teoria: "0-qe*E0*min(x(pos('p')), L)/(mp*v0)" },
        { rotulo: 'Altura em x (simulada)', simbolo: r`y = -\frac{qE}{2mv_0^2}x^2`, ativo: "x(pos('p')) <= L", expr: "100*y(pos('p'))", unidade: 'cm', teoria: "100*(0-qe*E0*x(pos('p'))^2/(2*mp*v0^2))" },
        { rotulo: 'Ângulo de saída', simbolo: r`\theta = \arctan\left(-\frac{qEL}{mv_0^2}\right)`, ativo: "x(pos('p')) > L", expr: "deg(atan2(y(vel('p')), x(vel('p'))))", unidade: '°', teoria: 'deg(atan(0-qe*E0*L/(mp*v0^2)))' },
      ],
      passos: [
        { titulo: '(a) Aceleração', texto: r`Só a força elétrica, vertical: $\vec a = -\dfrac{qE}{m}\hat y$.` },
        { titulo: '(b) e (c) Velocidade e posição', texto: r`Como num lançamento horizontal: $\vec v = v_0\hat x - \dfrac{qE}{m}t\,\hat y$ e $\vec r = v_0t\,\hat x - \dfrac{qE}{2m}t^2\hat y$.`, medidas: [0] },
        { titulo: '(d) Trajetória', texto: r`Com $t = x/v_0$: $y = -\dfrac{qE}{2mv_0^2}x^2$, uma **parábola**. Rode: a altura simulada segue a fórmula ponto a ponto.`, medidas: [1] },
        { titulo: '(e) Saída', texto: r`Em $x = L$: $\vec v = v_0\hat x - \dfrac{qEL}{mv_0}\hat y$, com ângulo $\theta = \arctan\left(-\dfrac{qEL}{mv_0^2}\right)$ abaixo da horizontal.`, medidas: [0, 2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec a = -\dfrac{qE}{m}\hat y$` },
        { item: '(b)', texto: r`$\vec v(t) = v_0\hat x - \dfrac{qE}{m}t\,\hat y$` },
        { item: '(c)', texto: r`$\vec r(t) = v_0t\,\hat x - \dfrac{qE}{2m}t^2\hat y$` },
        { item: '(d)', texto: r`$y = -\dfrac{qE}{2mv_0^2}x^2$: parábola` },
        { item: '(e)', texto: r`$\vec v = v_0\hat x - \dfrac{qEL}{mv_0}\hat y$; $\theta = \arctan\left(-\dfrac{qEL}{mv_0^2}\right)$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Movimento de carga em campo elétrico', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Decompor', texto: r`MRU em x, MUV em y.`, passo: 1 },
          { titulo: 'Eliminar t', texto: r`Parábola.`, passo: 2 },
        ],
        resultado: r`Parábola; $\tan\theta = -qEL/mv_0^2$.`,
        errosComuns: ['Usar o tempo de travessia errado: é $L/v_0$, porque $v_x$ não muda.'],
        oficial: { resposta: 'a = −(qE/m) ŷ; v = v₀ x̂ − (qE/m)t ŷ; r = v₀t x̂ − (qE/2m)t² ŷ; y = −qEx²/(2mv₀²), parábola; θ = arctan(−qEL/mv₀²).' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Difícil',
      titulo: 'Campo de uma barra e força entre duas barras',
      resumo: 'E = kQ/(x² − a²) no eixo; F = k(Q/2a)² ln[b²/(b² − 4a²)], de repulsão.',
      figura: { pagina: 3, recorte: [0.089, 0.313, 0.936, 0.478] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, -2, 14], alvo: [3, 0, 0] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga de cada barra', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Meio comprimento', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'b', rotulo: 'Centro da segunda barra', simbolo: 'b', valor: 0.06, unidade: 'm', min: 0.045, max: 0.08, passo: 0.001 },
        { id: 'xp', rotulo: 'Ponto P', simbolo: 'x', valor: 0.03, unidade: 'm', min: 0.022, max: 0.08, passo: 0.001 },
      ],
      objetos: [
        { id: 'b1', tipo: 'segmentoCarga', lambda: 'Q/(2*a)', a: ['0-a', 0, 0], b: ['a', 0, 0], rotulo: 'barra 1' },
        { id: 'b2', tipo: 'segmentoCarga', lambda: 'Q/(2*a)', a: ['b - a', 0.004, 0], b: ['b + a', 0.004, 0], rotulo: 'barra 2' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xp', -0.004, 0], rotulo: 'P' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Campo da barra 1 em P', simbolo: r`E = \frac{kQ}{x^2 - a^2}`, expr: "x(Ede('b1', xp, 0, 0))", unidade: 'V/m', teoria: 'k0*Q/(xp^2 - a^2)' },
        { rotulo: 'Força na barra 2 (soma em 40 pedaços)', simbolo: r`F = k\left(\frac{Q}{2a}\right)^2\ln\frac{b^2}{b^2 - 4a^2}`, expr: `1e6*Q/${PEDACOS}*(${F7})`, unidade: 'μN', teoria: '1e6*k0*(Q/(2*a))^2*ln(b^2/(b^2 - 4*a^2))' },
        { rotulo: 'Se fossem cargas pontuais', simbolo: r`\frac{kQ^2}{b^2}`, expr: '1e6*k0*Q^2/b^2', unidade: 'μN' },
      ],
      passos: [
        {
          titulo: '(a) Campo no eixo',
          texto: r`Um pedaço $dq = \lambda\,dx'$ em $x'$ dá $\dfrac{k\lambda\,dx'}{(x - x')^2}$. Integrando de $-a$ a $a$:
$$E = \frac{kQ}{2a}\left(\frac{1}{x - a} - \frac{1}{x + a}\right) = \frac{kQ}{x^2 - a^2},$$
para a direita.`,
          medidas: [0],
        },
        {
          titulo: '(b) Força entre as barras',
          texto: r`Cada pedaço da segunda barra sente $\lambda\,dx\,E(x)$:
$$F = \frac{kQ}{2a}\frac{Q}{2a}\int_{b-a}^{b+a}\left(\frac1{x - a} - \frac1{x + a}\right)dx = k\left(\frac{Q}{2a}\right)^2\ln\frac{b^2}{b^2 - 4a^2},$$
repulsiva. Longe ($b \gg a$), $\ln\dfrac{b^2}{b^2 - 4a^2} \approx \dfrac{4a^2}{b^2}$ e volta $kQ^2/b^2$.`,
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac{kQ}{2a}\left(\dfrac{1}{x - a} - \dfrac{1}{x + a}\right)\hat x = \dfrac{kQ}{x^2 - a^2}\hat x$` },
        { item: '(b)', texto: r`$\vec F = k\left(\dfrac{Q}{2a}\right)^2\ln\dfrac{b^2}{b^2 - 4a^2}\,\hat x$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          { titulo: 'Integrar', texto: r`Pedaços da barra 1.`, passo: 0 },
          { titulo: 'Integrar de novo', texto: r`Pedaços da barra 2.`, passo: 1 },
        ],
        resultado: r`$F = k(Q/2a)^2\ln\frac{b^2}{b^2-4a^2}$.`,
        errosComuns: ['Tratar as barras como cargas pontuais a uma distância b.'],
        oficial: { resposta: 'E = k₀(Q/2a)(1/(x − a) − 1/(x + a)) x̂; F = k₀(Q/2a)² ln(b²/(b² − 4a²)) x̂.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Semicírculo com densidade λ₀ sen θ ou λ₀ cos θ',
      resumo: 'Com sen θ: Q = 2λ₀R, E = −λ₀/8ε₀R ŷ. Com cos θ: Q = 0, E = −λ₀/8ε₀R x̂.',
      figura: { pagina: 3, recorte: [0.089, 0.479, 0.936, 0.756] },
      cena: { escala: 0.01, extensao: 5, unidade: 'cm', plano: 'xy', camera: { pos: [0, 1, 10], alvo: [0, 1, 0] } },
      parametros: [
        { id: 'caso', rotulo: 'Densidade', valor: 1, opcoes: [{ valor: 1, rotulo: 'λ₀ sen θ' }, { valor: 2, rotulo: 'λ₀ cos θ' }] },
        { id: 'lam0', rotulo: 'Constante', simbolo: r`\lambda_0`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'sen', tipo: 'anelCarga', ativo: 'caso == 1', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 180], densidade: 'lam0*sin(theta)', rotulo: 'λ₀ sen θ' },
        { id: 'cos', tipo: 'anelCarga', ativo: 'caso == 2', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 180], densidade: 'lam0*cos(theta)', rotulo: 'λ₀ cos θ' },
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'centro' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga total', simbolo: 'Q', expr: "1e12*carga(caso == 1 ? 'sen' : 'cos')", unidade: 'pC', teoria: '1e12*(caso == 1 ? 2*lam0*R : 0)' },
        { rotulo: 'Campo no centro, componente x', simbolo: 'E_x', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: 'caso == 1 ? 0 : 0-lam0/(8*eps0*R)' },
        { rotulo: 'Campo no centro, componente y', simbolo: 'E_y', expr: 'y(E(0, 0, 0))', unidade: 'V/m', teoria: 'caso == 1 ? 0-lam0/(8*eps0*R) : 0' },
      ],
      passos: [
        {
          titulo: '(a) e (b) λ₀ sen θ',
          texto: r`$Q = \displaystyle\int_0^\pi\lambda_0\sin\theta\,R\,d\theta = 2\lambda_0R$. Cada pedaço empurra o centro para longe dele, na direção $-(\cos\theta, \sin\theta)$:
$$\vec E = -\frac{k\lambda_0}{R}\int_0^\pi\sin\theta(\cos\theta, \sin\theta)\,d\theta = -\frac{k\lambda_0\pi}{2R}\hat y = -\frac{\lambda_0}{8\varepsilon_0R}\hat y.$$`,
          parametros: { caso: 1 },
          medidas: [0, 1, 2],
        },
        {
          titulo: '(c) λ₀ cos θ',
          texto: r`A metade direita é positiva e a esquerda negativa: $Q = 0$. Mas o campo não some: as duas metades empurram e puxam o centro para o mesmo lado,
$$\vec E = -\frac{\lambda_0}{8\varepsilon_0R}\hat x.$$
Carga total zero não é ausência de carga.`,
          parametros: { caso: 2 },
          medidas: [0, 1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$Q = 2\lambda_0R$` },
        { item: '(b)', texto: r`$\vec E = -\dfrac{\lambda_0}{8\varepsilon_0R}\hat y$` },
        { item: '(c)', texto: r`$Q = 0$; $\vec E = -\dfrac{\lambda_0}{8\varepsilon_0R}\hat x$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          { titulo: 'Carga', texto: r`Integrar λ.`, passo: 0 },
          { titulo: 'Campo', texto: r`Integrar as componentes.`, passo: 0 },
        ],
        resultado: r`Veja os itens.`,
        errosComuns: ['Concluir que o campo é zero quando a carga total é zero.'],
        oficial: { resposta: 'Q = 2λ₀R, E = −λ₀/(8ε₀R) ŷ; com cos θ, Q = 0 e E = −λ₀/(8ε₀R) x̂.' },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Difícil',
      titulo: 'Semicírculo uniforme: campo no eixo z',
      resumo: 'E_x = 0; E_y = −λR²/[2πε₀(z² + R²)^{3/2}]; E_z = λRz/[4ε₀(z² + R²)^{3/2}]; de longe, carga pontual λπR.',
      figura: [
        { pagina: 3, recorte: [0.089, 0.757, 0.936, 0.893] },
        { pagina: 4, recorte: [0.08, 0.059, 0.936, 0.29] },
      ],
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', camera: { pos: [7, 5, 8], alvo: [0, 1, 1] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade', simbolo: r`\lambda`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'zp', rotulo: 'Altura de P', simbolo: 'z', valor: 0.02, unidade: 'm', min: 0.002, max: 0.06, passo: 0.001 },
      ],
      objetos: [
        { id: 'arco', tipo: 'anelCarga', Q: 'lam*pi*R', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 180], rotulo: 'semicírculo (λ)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zp'], arraste: { param: 'zp', eixo: 'z' }, rotulo: 'P' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'E_x em P', simbolo: 'E_x', expr: 'x(E(0, 0, zp))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'E_y em P', simbolo: r`E_y = -\frac{\lambda R^2}{2\pi\varepsilon_0(z^2 + R^2)^{3/2}}`, expr: 'y(E(0, 0, zp))', unidade: 'V/m', teoria: '0-lam*R^2/(2*pi*eps0*(zp^2 + R^2)^1.5)' },
        { rotulo: 'E_z em P', simbolo: r`E_z = \frac{\lambda Rz}{4\varepsilon_0(z^2 + R^2)^{3/2}}`, expr: 'z(E(0, 0, zp))', unidade: 'V/m', teoria: 'lam*R*zp/(4*eps0*(zp^2 + R^2)^1.5)' },
        { rotulo: 'E_z dividido pelo de uma carga pontual λπR', simbolo: r`E_z\Big/\frac{kQ}{z^2}`, expr: 'z(E(0, 0, zp))/(k0*lam*pi*R/zp^2)', unidade: '' },
      ],
      passos: [
        { titulo: '(a) Simetria', texto: r`O semicírculo é simétrico pela reflexão $x \to -x$: as componentes $x$ de pedaços espelhados se cancelam. $E_x = 0$. $E_y$ não some: todo o fio está do lado $y > 0$.`, medidas: [0] },
        {
          titulo: '(b) Integrar',
          texto: r`O pedaço em $(R\cos\varphi, R\sin\varphi, 0)$ está a $\sqrt{z^2 + R^2}$ de $P$:
$$\vec E = \frac{k\lambda R}{(z^2 + R^2)^{3/2}}\int_0^\pi(-R\cos\varphi, -R\sin\varphi, z)\,d\varphi = \frac{k\lambda R}{(z^2 + R^2)^{3/2}}(0, -2R, \pi z).$$`,
          parametros: { zp: 0.02 },
          medidas: [1, 2],
        },
        {
          titulo: '(c) De longe',
          texto: r`Com $z \gg R$: $E_z \approx \dfrac{\lambda R}{4\varepsilon_0z^2} = \dfrac{k(\lambda\pi R)}{z^2}$, o campo de uma carga pontual $Q = \lambda\pi R$, e $E_y \propto 1/z^3$ some mais depressa.`,
          parametros: { zp: 0.06 },
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$E_x = 0$, pela simetria de reflexão.` },
        { item: '(b)', texto: r`$\vec E = -\dfrac{\lambda R^2}{2\pi\varepsilon_0(z^2 + R^2)^{3/2}}\hat y + \dfrac{\lambda Rz}{4\varepsilon_0(z^2 + R^2)^{3/2}}\hat z$` },
        { item: '(c)', texto: r`$E_z \approx \dfrac{\lambda R}{4\varepsilon_0z^2}$ (carga pontual $\lambda\pi R$); $E_y \approx -\dfrac{\lambda R^2}{2\pi\varepsilon_0z^3}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          { titulo: 'Simetria', texto: r`$E_x = 0$.`, passo: 0 },
          { titulo: 'Integral', texto: r`Componentes em $\varphi$.`, passo: 1 },
          { titulo: 'Limite', texto: r`Carga pontual.`, passo: 2 },
        ],
        resultado: r`Veja os itens.`,
        errosComuns: ['Anular também $E_y$, como no anel completo.'],
        oficial: { resposta: 'E_x = 0; E_y = −λR²/(2πε₀(z² + R²)^{3/2}); E_z = λRz/(4ε₀(z² + R²)^{3/2}); de longe, campo de uma carga λπR.' },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Difícil',
      titulo: 'Disco com σ₀R/r: carga e campo no eixo',
      resumo: 'Q = 2πσ₀R²; E = σ₀R²/(2ε₀z√(R² + z²)); de longe, Q/4πε₀z².',
      figura: { pagina: 4, recorte: [0.08, 0.291, 0.936, 0.519] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [8, 5, 8], alvo: [0, 0, 1.5] } },
      parametros: [
        { id: 's0', rotulo: 'Constante da densidade', simbolo: r`\sigma_0`, valor: 1e-9, unidade: 'C/m²', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio do disco', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 'zp', rotulo: 'Ponto do eixo', simbolo: 'z', valor: 0.02, unidade: 'm', min: 0.008, max: 0.07, passo: 0.001 },
      ],
      objetos: [...aneis10, { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zp'], arraste: { param: 'zp', eixo: 'z' }, rotulo: 'z' }],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Carga total', simbolo: r`Q = 2\pi\sigma_0R^2`, expr: `1e12*(${aneis10.map((a) => `carga('${a.id}')`).join(' + ')})`, unidade: 'pC', teoria: '1e12*2*pi*s0*R^2' },
        { rotulo: 'Campo no eixo (40 anéis)', simbolo: r`E = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}}`, expr: 'z(E(0, 0, zp))', unidade: 'V/m', teoria: 's0*R^2/(2*eps0*zp*sqrt(R^2 + zp^2))' },
        { rotulo: 'Campo dividido pelo de uma carga pontual', simbolo: r`E\Big/\frac{kQ}{z^2}`, expr: 'z(E(0, 0, zp))/(k0*2*pi*s0*R^2/zp^2)', unidade: '' },
      ],
      passos: [
        { titulo: '(a) Carga', texto: r`$Q = \displaystyle\int_0^R\sigma_0\frac Rr\,2\pi r\,dr = 2\pi\sigma_0R^2$: todo anel de largura $dr$ tem a mesma carga.`, medidas: [0] },
        {
          titulo: '(b) Somar anéis',
          texto: r`Anéis concêntricos têm o mesmo eixo, e cada um dá campo ao longo dele: os campos simplesmente somam.
$$E = \int_0^R\frac{k(2\pi\sigma_0R\,dr)\,z}{(r^2 + z^2)^{3/2}} = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}}.$$`,
          parametros: { zp: 0.02 },
          medidas: [1],
        },
        { titulo: '(c) De longe', texto: r`Com $z \gg R$: $E \approx \dfrac{\sigma_0R^2}{2\varepsilon_0z^2} = \dfrac{Q}{4\pi\varepsilon_0z^2}$, campo de carga pontual.`, parametros: { zp: 0.07 }, medidas: [1, 2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$Q = 2\pi\sigma_0R^2$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\sigma_0}{2\varepsilon_0}\dfrac{R^2}{z\sqrt{R^2 + z^2}}\hat z$` },
        { item: '(c)', texto: r`$\vec E \approx \dfrac{Q}{4\pi\varepsilon_0z^2}\hat z$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          { titulo: 'Anéis', texto: r`Mesma carga por anel.`, passo: 0 },
          { titulo: 'Integral', texto: r`Com a primitiva dada.`, passo: 1 },
        ],
        resultado: r`$E = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2+z^2}}$.`,
        errosComuns: ['Usar a carga de um anel sem o fator $2\\pi r$.'],
        oficial: { resposta: 'Q = 2πσ₀R²; E = (σ₀/2ε₀) R²/(z√(R² + z²)) ẑ; de longe, Q/(4πε₀z²) ẑ.' },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Difícil',
      titulo: 'Casca cilíndrica carregada: campo no eixo',
      resumo: 'σ = Q/2πRh; E = (σR/2ε₀)[1/√(d² + R²) − 1/√((h + d)² + R²)]; de longe, Q/4πε₀d².',
      figura: { pagina: 4, recorte: [0.08, 0.52, 0.936, 0.82] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [2, 6, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.015, unidade: 'm', min: 0.015, max: 0.015, passo: 0.001 },
        { id: 'h', rotulo: 'Altura', simbolo: 'h', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05, passo: 0.001 },
        { id: 'd', rotulo: 'Distância à borda direita', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.005, max: 0.075, passo: 0.001 },
      ],
      objetos: [...aneis11, { id: 'P', tipo: 'sonda', campo: 'E', pos: ['d', 0, 0], arraste: { param: 'd', eixo: 'x' }, rotulo: 'P' }],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Densidade superficial', simbolo: r`\sigma = \frac{Q}{2\pi Rh}`, expr: '1e9*Q0/(2*pi*R*h)', unidade: 'nC/m²' },
        {
          rotulo: 'Campo em P (40 anéis)',
          simbolo: r`E = \frac{\sigma R}{2\varepsilon_0}\left(\frac{1}{\sqrt{d^2 + R^2}} - \frac{1}{\sqrt{(h + d)^2 + R^2}}\right)`,
          expr: 'x(E(d, 0, 0))',
          unidade: 'V/m',
          teoria: 'Q0/(2*pi*R*h)*R/(2*eps0)*(1/sqrt(d^2 + R^2) - 1/sqrt((h + d)^2 + R^2))',
        },
        { rotulo: 'Campo dividido pelo de uma carga pontual', simbolo: r`E\Big/\frac{kQ}{d^2}`, expr: 'x(E(d, 0, 0))/(k0*Q0/d^2)', unidade: '' },
      ],
      passos: [
        { titulo: '(a) Densidade', texto: r`A carga fica na lateral, de área $2\pi Rh$: $\sigma = \dfrac{Q}{2\pi Rh}$.`, medidas: [0] },
        {
          titulo: '(b) Anéis coaxiais',
          texto: r`Um anel de largura $dx$ tem carga $\sigma2\pi R\,dx$ e, a uma distância $u$ de $P$, dá $\dfrac{k\sigma2\pi R\,u\,dx}{(u^2 + R^2)^{3/2}}$. Com $u$ de $d$ a $h + d$:
$$E = \frac{\sigma R}{2\varepsilon_0}\left(\frac{1}{\sqrt{d^2 + R^2}} - \frac{1}{\sqrt{(h + d)^2 + R^2}}\right).$$`,
          parametros: { d: 0.02 },
          medidas: [1],
        },
        { titulo: '(c) De longe', texto: r`Com $d \gg R, h$, a diferença vira $\approx h/d^2$ e $E \approx \dfrac{\sigma Rh}{2\varepsilon_0d^2} = \dfrac{Q}{4\pi\varepsilon_0d^2}$: carga pontual. Afaste $P$ e veja a razão subir para 1.`, parametros: { d: 0.075 }, medidas: [1, 2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\sigma = \dfrac{Q}{2\pi Rh}$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\sigma R}{2\varepsilon_0}\left(\dfrac{1}{\sqrt{d^2 + R^2}} - \dfrac{1}{\sqrt{(h + d)^2 + R^2}}\right)$, ao longo do eixo, para longe do cilindro` },
        { item: '(c)', texto: r`$E \approx \dfrac{Q}{4\pi\varepsilon_0d^2}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          { titulo: 'Anéis', texto: r`Coaxiais com o eixo.`, passo: 1 },
          { titulo: 'Limite', texto: r`Carga pontual.`, passo: 2 },
        ],
        resultado: r`Veja os itens.`,
        errosComuns: ['Contar as tampas: a carga está só na lateral.'],
        oficial: { resposta: 'σ = Q/(2πRh); E = (σR/2ε₀)(1/√(d² + R²) − 1/√((h + d)² + R²)); de longe, Q/(4πε₀d²).' },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Médio',
      titulo: 'Campo do dipolo nos dois eixos',
      resumo: 'No eixo y: −kp/(y² + a²)^{3/2}; no eixo x: 2kpx/(x² − a²)²; de longe, caem com 1/r³.',
      figura: [
        { pagina: 4, recorte: [0.08, 0.822, 0.936, 0.839] },
        { pagina: 5, recorte: [0.08, 0.058, 0.936, 0.365] },
      ],
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 13], alvo: [1, 1, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Meia separação', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01, passo: 0.001 },
        { id: 'yp', rotulo: 'Ponto no eixo y', simbolo: 'y', valor: 0.02, unidade: 'm', min: 0.005, max: 0.06, passo: 0.001 },
        { id: 'xp', rotulo: 'Ponto no eixo x', simbolo: 'x', valor: 0.03, unidade: 'm', min: 0.015, max: 0.06, passo: 0.001 },
      ],
      objetos: [
        { id: 'm', tipo: 'carga', q: '0-q', pos: ['0-a', 0, 0], rotulo: '−q' },
        { id: 'p', tipo: 'carga', q: 'q', pos: ['a', 0, 0], rotulo: 'q' },
        { id: 'Py', tipo: 'sonda', campo: 'E', pos: [0, 'yp', 0], arraste: { param: 'yp', eixo: 'y' }, rotulo: 'y' },
        { id: 'Px', tipo: 'sonda', campo: 'E', pos: ['xp', 0, 0], arraste: { param: 'xp', eixo: 'x' }, rotulo: 'x' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo no eixo y (componente x)', simbolo: r`E_x = -\frac{kp}{(y^2 + a^2)^{3/2}}`, expr: 'x(E(0, yp, 0))', unidade: 'V/m', teoria: '0-k0*2*q*a/(yp^2 + a^2)^1.5' },
        { rotulo: 'Campo no eixo x', simbolo: r`E_x = \frac{2kpx}{(x^2 - a^2)^2}`, expr: 'x(E(xp, 0, 0))', unidade: 'V/m', teoria: 'k0*2*xp*2*q*a/(xp^2 - a^2)^2' },
        { rotulo: 'Razão com o limite −kp/y³', simbolo: r`E\Big/\frac{-kp}{y^3}`, expr: 'x(E(0, yp, 0))/(0-k0*2*q*a/yp^3)', unidade: '' },
        { rotulo: 'Razão com o limite 2kp/x³', simbolo: r`E\Big/\frac{2kp}{x^3}`, expr: 'x(E(xp, 0, 0))/(2*k0*2*q*a/xp^3)', unidade: '' },
      ],
      passos: [
        {
          titulo: '(a) Eixo y',
          texto: r`As componentes $y$ se cancelam; as $x$ somam, para o lado de $-q$: $\vec E = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{\vec p}{(y^2 + a^2)^{3/2}}$, com $\vec p = 2qa\,\hat x$.`,
          medidas: [0],
        },
        { titulo: '(b) Eixo x', texto: r`$E = kq\left[\dfrac{1}{(x - a)^2} - \dfrac{1}{(x + a)^2}\right] = \dfrac{1}{4\pi\varepsilon_0}\dfrac{2x\,p}{(x^2 - a^2)^2}$, no sentido de $\vec p$.`, medidas: [1] },
        {
          titulo: '(c) De longe',
          texto: r`$\vec E \approx -\dfrac{\vec p}{4\pi\varepsilon_0y^3}$ e $\vec E \approx \dfrac{2\vec p}{4\pi\varepsilon_0x^3}$. O dipolo cai com $1/r^3$, mais depressa que uma carga, e o campo depende da direção: no eixo do dipolo é duas vezes maior e tem o sentido de $\vec p$.`,
          parametros: { yp: 0.06, xp: 0.06 },
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{\vec p}{(y^2 + a^2)^{3/2}}$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{2x}{(x^2 - a^2)^2}\vec p$` },
        { item: '(c)', texto: r`$-\dfrac{\vec p}{4\pi\varepsilon_0y^3}$ e $\dfrac{2\vec p}{4\pi\varepsilon_0x^3}$: decaimento com $1/r^3$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dipolo elétrico', lab: 'dipolo' }],
        etapas: [
          { titulo: 'Somar', texto: r`Dois campos de Coulomb.`, passo: 0 },
          { titulo: 'Expandir', texto: r`$(1 + x)^n \approx 1 + nx$.`, passo: 2 },
        ],
        resultado: r`Campo de dipolo $\propto 1/r^3$.`,
        errosComuns: ['Esperar o mesmo sentido nos dois eixos.'],
        oficial: { resposta: 'E(y) = −p/(4πε₀(y² + a²)^{3/2}); E(x) = 2xp/(4πε₀(x² − a²)²); de longe, −p/(4πε₀y³) e 2p/(4πε₀x³).' },
      },
    },

    /* ───────────────────────── 13 ───────────────────────── */
    {
      id: 'e13',
      numero: '13',
      secao: 'Médio',
      titulo: 'Quadrupolo: +q, −2q, +q',
      resumo: 'E = 2kq[y/(y² + a²)^{3/2} − 1/y²] ŷ ≈ −3kqa²/y⁴ ŷ: sem carga nem dipolo, o campo cai com 1/y⁴.',
      figura: { pagina: 5, recorte: [0.08, 0.366, 0.936, 0.831] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, 2, 13], alvo: [0, 2, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Separação', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01, passo: 0.001 },
        { id: 'yp', rotulo: 'Ponto P', simbolo: 'y', valor: 0.02, unidade: 'm', min: 0.005, max: 0.07, passo: 0.001 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'q', pos: ['0-a', 0, 0], rotulo: 'q' },
        { id: 'c0', tipo: 'carga', q: '0-2*q', pos: [0, 0, 0], rotulo: '−2q' },
        { id: 'c2', tipo: 'carga', q: 'q', pos: ['a', 0, 0], rotulo: 'q' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 'yp', 0], arraste: { param: 'yp', eixo: 'y' }, rotulo: 'P' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em P', simbolo: r`E_y = 2kq\left[\frac{y}{(y^2 + a^2)^{3/2}} - \frac1{y^2}\right]`, expr: 'y(E(0, yp, 0))', unidade: 'V/m', teoria: '2*k0*q*(yp/(yp^2 + a^2)^1.5 - 1/yp^2)' },
        { rotulo: 'Razão com o limite −3kqa²/y⁴', simbolo: r`E\Big/\left(-\frac{3kqa^2}{y^4}\right)`, expr: 'y(E(0, yp, 0))/(0-3*k0*q*a^2/yp^4)', unidade: '' },
        { rotulo: 'Carga total', simbolo: 'Q', expr: "1e9*(carga('c1') + carga('c0') + carga('c2'))", unidade: 'nC', teoria: 0 },
        { rotulo: 'Momento de dipolo total', simbolo: r`p = \sum q_ix_i`, expr: "1e9*(carga('c1')*x(pos('c1')) + carga('c2')*x(pos('c2')))", unidade: 'nC·m', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(a) Campo no eixo y',
          texto: r`As duas $+q$ dão componentes $x$ opostas e componentes $y$ iguais, $\dfrac{kqy}{(y^2 + a^2)^{3/2}}$ cada; $-2q$ puxa para baixo com $\dfrac{2kq}{y^2}$:
$$\vec E = 2kq\left[\frac{y}{(y^2 + a^2)^{3/2}} - \frac{1}{y^2}\right]\hat y.$$`,
          parametros: { yp: 0.02 },
          medidas: [0],
        },
        {
          titulo: '(b) De longe',
          texto: r`$\dfrac{y}{(y^2 + a^2)^{3/2}} \approx \dfrac{1}{y^2}\left(1 - \dfrac{3a^2}{2y^2}\right)$, e os termos $1/y^2$ se cancelam: $\vec E \approx -\dfrac{3kqa^2}{y^4}\hat y$. Sem carga total (nada de $1/y^2$, monopolo) e sem dipolo (nada de $1/y^3$), sobra o **quadrupolo**, $1/y^4$.`,
          parametros: { yp: 0.07 },
          medidas: [1, 2],
        },
        {
          titulo: '(c) Dois dipolos',
          texto: r`Divida $-2q$ em duas $-q$: o arranjo é um dipolo $(+q, -q)$ apontando para a esquerda e outro $(-q, +q)$ para a direita. Os dois momentos se cancelam: $p_\text{total} = 0$, e os campos de dipolo também.`,
          medidas: [3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = 2kq\left[\dfrac{y}{(y^2 + a^2)^{3/2}} - \dfrac{1}{y^2}\right]\hat y$` },
        { item: '(b)', texto: r`$\vec E \approx -\dfrac{3kqa^2}{y^4}\hat y$: cai mais rápido que monopolo ($1/y^2$) e dipolo ($1/y^3$).` },
        { item: '(c)', texto: 'Dois dipolos opostos; o momento de dipolo total é zero.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dipolo e superposição', lab: 'dipolo' }],
        etapas: [
          { titulo: 'Somar', texto: r`Três cargas.`, passo: 0 },
          { titulo: 'Expandir', texto: r`Até o primeiro termo que não cancela.`, passo: 1 },
        ],
        resultado: r`$E \approx -3kqa^2/y^4$; $p = 0$.`,
        errosComuns: ['Parar a expansão na primeira ordem e concluir que o campo é zero.'],
        oficial: { resposta: 'E = (2q/4πε₀)[y/(y² + a²)^{3/2} − 1/y²] ŷ; E ≈ −3a²q/(4πε₀y⁴) ŷ; dois dipolos opostos, momento total nulo.' },
      },
    },
  ],
}

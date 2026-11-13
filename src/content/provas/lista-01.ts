import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P1 } from '../formularios'

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
  formulario: FORMULARIO_P1,
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
          {
            titulo: '(a) Onde a terceira carga fica em equilíbrio',
            texto: r`**O que se pede.** Um ponto do bastão onde a terceira partícula (carga $q'$, de sinal qualquer) fica parada: a força total sobre ela é zero.

**A ideia.** Duas cargas pontuais se empurram (sinais iguais) ou se puxam (sinais opostos) ao longo da reta que as une. A intensidade é a lei de Coulomb:
$$F = k_0\frac{|q_1q_2|}{r^2},\qquad k_0 = \frac{1}{4\pi\varepsilon_0}.$$
No formulário ela aparece como $\vec F_{(e)} = q\vec E$ com $\vec E = k_0\dfrac{q}{r^2}\hat r$. Quando há várias cargas, a força total é a soma vetorial das forças de cada uma (superposição).

**Montagem.** Chame de $x$ a distância da terceira carga até $q$. Então ela está a $d - x$ de $3q$. Entre as duas cargas fixas, as duas forças têm sentidos opostos: se $q'$ é positiva, $q$ a empurra para a direita e $3q$ para a esquerda; se é negativa, as duas a puxam, de novo para lados opostos. O equilíbrio exige que as duas intensidades sejam iguais.

**A conta.**
$$k_0\frac{q\,|q'|}{x^2} = k_0\frac{3q\,|q'|}{(d - x)^2}\;\Rightarrow\;(d - x)^2 = 3x^2\;\Rightarrow\;d - x = \sqrt3\,x.$$
Tomamos a raiz positiva porque $x$ e $d - x$ são distâncias. Isolando $x$:
$$x = \frac{d}{1 + \sqrt3} \approx 0{,}37\,d\ \text{ a partir de } q\quad(\approx 0{,}63\,d \text{ a partir de } 3q).$$

**Conferindo.** O ponto fica mais perto da carga **menor**: para a carga maior produzir a mesma força, ela precisa estar mais longe. E $q'$ sumiu da conta: a posição não depende do valor nem do sinal da terceira carga.`,
            passo: 0,
          },
          {
            titulo: '(b) Estável ou instável',
            texto: r`**O que se pede.** Se a partícula for empurrada um pouco para fora do equilíbrio, ela volta (equilíbrio **estável**) ou se afasta ainda mais (**instável**)? A resposta depende do sinal de $q'$.

**A ideia.** Teste um pequeno deslocamento e veja para onde aponta a força total. A força de Coulomb fica mais forte quando a distância diminui ($1/r^2$).

**Carga positiva ($q' > 0$).** As duas forças são repulsões. Desloque a partícula um pouco para a direita, para perto de $3q$:
- a repulsão de $3q$ (para a esquerda) **aumenta**, porque a distância a $3q$ diminuiu;
- a repulsão de $q$ (para a direita) **diminui**, porque a distância a $q$ aumentou.

A força total passa a apontar para a esquerda, de volta ao ponto de equilíbrio. Deslocando para a esquerda acontece o espelho disso. O equilíbrio é **estável**.

**Carga negativa ($q' < 0$).** As duas forças são atrações. Deslocada para a direita, a atração de $3q$ (para a direita) aumenta e a de $q$ (para a esquerda) diminui: a força total aponta para a direita e a afasta ainda mais. O equilíbrio é **instável**.

**A mesma coisa em uma linha.** Com o eixo para a direita, a força é $F(x) = k_0qq'\left[\dfrac{1}{x^2} - \dfrac{3}{(d - x)^2}\right]$. A derivada no equilíbrio, $k_0qq'\left[-\dfrac{2}{x^3} - \dfrac{6}{(d - x)^3}\right]$, é negativa quando $q' > 0$: a força se opõe ao deslocamento. Quando $q' < 0$, ela é positiva e a força o reforça.

Vale só para deslocamentos **ao longo do bastão**, que é por onde a partícula pode andar.`,
            passo: 1,
          },
        ],
        resultado: r`(a) $x = \dfrac{d}{1 + \sqrt3} \approx 0{,}37d$ a partir de $q$. (b) Estável se $q' > 0$; instável se $q' < 0$.`,
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
          {
            titulo: '(a) A tensão no fio',
            texto: r`**O que se pede.** A força $T$ que cada fio faz sobre a sua esfera, com o sistema parado e os fios a um ângulo $\theta$ da vertical.

**A ideia.** Parado quer dizer força total zero. Sobre cada esfera agem três coisas:
- o **peso** $mg$, para baixo;
- a **tensão** $T$, ao longo do fio, apontando para o ponto de suspensão;
- forças **elétricas**: a do campo, $q\vec E$ (formulário: $\vec F_{(e)} = q\vec E$), e a atração da outra esfera. As duas são **horizontais**: o campo é horizontal e as esferas estão na mesma altura.

**Montagem.** Decomponha a tensão: o fio faz ângulo $\theta$ com a vertical, então a parte vertical da tensão vale $T\cos\theta$ e a horizontal, $T\sin\theta$.

**A conta.** Na vertical só há duas forças, a parte vertical da tensão (para cima) e o peso (para baixo):
$$T\cos\theta = mg\quad\Rightarrow\quad T = \frac{mg}{\cos\theta}.$$

**Conferindo.** Com $\theta = 0$ (fio na vertical), $T = mg$: o fio só segura o peso. Quanto mais o fio abre, maior a tensão, porque só a parte vertical dela segura o peso.`,
            passo: 0,
          },
          {
            titulo: '(b) A intensidade do campo',
            texto: r`**O que se pede.** O valor de $E$ que mantém os fios abertos no ângulo $\theta$.

**A ideia.** Agora o equilíbrio na **horizontal**. Olhe a esfera $+q$, do lado para onde o campo aponta:
- o campo a empurra para **fora**, com $qE$ (carga positiva: força no sentido de $\vec E$);
- a esfera $-q$ a puxa para **dentro** (sinais opostos se atraem), com a lei de Coulomb, $F = k_0\dfrac{q\cdot q}{r^2}$;
- a parte horizontal da tensão, $T\sin\theta$, também aponta para **dentro**, porque o fio sobe em direção ao ponto de suspensão, que fica no meio.

A esfera $-q$ é o espelho disso: o campo a empurra para o outro lado.

**Montagem.** A distância entre as esferas: cada uma está a $l\sin\theta$ da vertical que passa pelo ponto de suspensão, então $r = 2l\sin\theta$. Do item (a), $T\sin\theta = \dfrac{mg}{\cos\theta}\sin\theta = mg\tan\theta$.

**A conta.** Para fora = para dentro:
$$qE = k_0\frac{q^2}{(2l\sin\theta)^2} + mg\tan\theta.$$
Dividindo tudo por $q$:
$$E = \frac{k_0\,q}{4l^2\sin^2\theta} + \frac{mg\tan\theta}{q}.$$

**Conferindo.** O primeiro termo é o campo que só compensa a atração entre as esferas; o segundo é o que ainda é preciso para manter os fios abertos contra o peso. Sem atração entre elas, sobraria $E = mg\tan\theta/q$, o resultado de um pêndulo carregado sozinho.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A força sobre −Q',
            texto: r`**O que se pede.** O vetor força total sobre a partícula $-Q$, que está no eixo $X$ na posição $x$, causada pelas duas cargas $q$ fixas em $(0, d/2)$ e $(0, -d/2)$.

**A ideia.** Cada carga $q$ atrai $-Q$ (sinais opostos), com intensidade dada pela lei de Coulomb, $F = k_0\dfrac{qQ}{r^2}$, ao longo da reta que liga as duas. A força total é a **soma vetorial** das duas atrações.

**Montagem.** As duas cargas fixas estão à mesma distância de $-Q$ (Pitágoras):
$$r = \sqrt{x^2 + \left(\tfrac d2\right)^2} = \sqrt{x^2 + d^2/4}.$$
O vetor que vai de $-Q$, em $(x, 0)$, até a carga de cima é $(-x,\ d/2)$; até a de baixo, $(-x,\ -d/2)$. Dividindo por $r$ temos as direções das duas atrações.

**A conta.** Cada atração vale $k_0\dfrac{qQ}{r^2}$ vezes o vetor unitário $\dfrac{(-x,\ \pm d/2)}{r}$. Somando as duas:
- as componentes $y$ ($+d/2$ e $-d/2$) se **cancelam**: é a simetria de cima e de baixo;
- as componentes $x$ ($-x$ e $-x$) se **somam**.
$$\vec F = 2\,k_0\frac{qQ}{r^2}\cdot\frac{-x}{r}\,\hat x = -\frac{2k_0Qq\,x}{(x^2 + d^2/4)^{3/2}}\,\hat x.$$

**Conferindo.** O sinal de menos com o $x$ faz a força apontar **sempre para a origem**: para $x > 0$ ela aponta para $-\hat x$; para $x < 0$, para $+\hat x$. Na origem ($x = 0$) ela é zero.`,
            passo: 0,
          },
          {
            titulo: '(b) O movimento depois de solta',
            texto: r`**O que se pede.** Descrever o que acontece com $-Q$ solta do repouso em $x = a$, e o que acontece quando ela passa pela origem.

**A ideia.** Pelo item (a), a força sempre aponta para a origem e só é zero exatamente lá. Uma força que sempre puxa de volta para um ponto é uma **força restauradora**: produz oscilação. Não há atrito, então a energia mecânica se conserva.

**O movimento, passo a passo.**
- Em $x = a$ a força aponta para a origem: a partícula começa a andar para lá, cada vez mais rápido.
- Na origem a força é zero, mas a velocidade é **máxima**: ela não para ali, passa direto por inércia.
- Do outro lado ($x < 0$) a força aponta de novo para a origem, agora **contra** o movimento: a partícula vai freando.
- Como a situação é simétrica ($x \to -x$) e a energia se conserva, ela para exatamente em $x = -a$, volta, e o ciclo se repete.

Ela **oscila entre $x = a$ e $x = -a$**.

**É um movimento harmônico simples?** Só para amplitudes pequenas. Se $a \ll d$, dá para desprezar $x^2$ diante de $d^2/4$, e a força vira
$$F \approx -\frac{16k_0Qq}{d^3}\,x,$$
proporcional ao deslocamento, como numa mola. Para amplitudes maiores, a força não é proporcional a $x$, e a oscilação é periódica mas não senoidal.`,
            passo: 1,
          },
        ],
        resultado: r`(a) $\vec F = -\dfrac{2k_0Qq\,x}{(x^2 + d^2/4)^{3/2}}\hat x$, sempre para a origem. (b) Oscila entre $x = a$ e $x = -a$, passando pela origem com velocidade máxima.`,
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
          {
            titulo: '(a) O campo no ponto P',
            texto: r`**O que se pede.** O vetor campo elétrico no ponto $P$, o meio da base do triângulo.

**A ideia.** Uma carga pontual $q$ cria em volta dela o campo (formulário)
$$\vec E = k_0\frac{q}{r^2}\,\hat r,$$
em que $r$ é a distância da carga ao ponto e $\hat r$ aponta **da carga para o ponto**. Na prática: o campo de uma carga positiva aponta para **longe** dela; o de uma carga negativa aponta **para** ela. Com várias cargas, somam-se os vetores (superposição).

**Montagem.** Ponha a base no eixo $X$, com $P$ na origem: as cargas $-q$ ficam em $(-a/2,\ 0)$ e $(a/2,\ 0)$, e a $+q$ no vértice de cima, em $(0,\ a\sqrt3/2)$, a altura de um triângulo equilátero de lado $a$.

**A conta.**
- As duas $-q$ estão à mesma distância $a/2$ de $P$, uma de cada lado. Cada campo aponta para a sua carga, então eles têm o mesmo tamanho e sentidos opostos: **se cancelam**.
- Sobra o campo de $+q$, a uma distância $a\sqrt3/2$, apontando para longe dela, ou seja, para baixo ($-\hat y$):
$$E = k_0\frac{q}{(a\sqrt3/2)^2} = \frac{4k_0q}{3a^2} = \frac{q}{3\pi\varepsilon_0a^2}.$$

**Resposta:** $\vec E_P = -\dfrac{q}{3\pi\varepsilon_0a^2}\,\hat y$.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no centro do triângulo',
            texto: r`**O que se pede.** O vetor campo elétrico no centro do triângulo, o ponto equidistante dos três vértices.

**A ideia.** A mesma do item (a): somar os campos $k_0\dfrac{q}{r^2}\hat r$ das três cargas, lembrando que o campo de $+q$ aponta para longe dela e o de cada $-q$ aponta para ela.

**Montagem.** No triângulo equilátero, o centro fica a $1/3$ da altura, acima da base: em $(0,\ a\sqrt3/6)$. A distância dele a qualquer vértice é $r = a/\sqrt3$. Então os três campos têm o mesmo tamanho:
$$E_1 = k_0\frac{q}{(a/\sqrt3)^2} = \frac{3k_0q}{a^2}.$$

**A conta, carga por carga.**
- $+q$, em cima: o campo aponta para longe dela, para baixo. Contribui $-E_1\,\hat y$.
- Cada $-q$, num canto da base: o campo aponta para ela, para baixo e para o lado. As partes horizontais das duas são opostas e **se cancelam**. A parte vertical de cada uma é $E_1$ vezes o cosseno do ângulo com a vertical, que é $\dfrac{a\sqrt3/6}{a/\sqrt3} = \dfrac12$. Cada uma contribui $-\tfrac12E_1\,\hat y$.

Somando:
$$\vec E = -E_1\left(1 + \tfrac12 + \tfrac12\right)\hat y = -\frac{6k_0q}{a^2}\,\hat y = -\frac{3q}{2\pi\varepsilon_0a^2}\,\hat y.$$

**Conferindo.** Todas as contribuições verticais apontam para baixo: o $+q$ empurra para baixo e os $-q$ puxam para baixo. Nada se cancela na vertical.`,
            passo: 1,
          },
          {
            titulo: '(c) A força numa das cargas −q',
            texto: r`**O que se pede.** A força elétrica total sobre uma das cargas $-q$; aqui, a da direita, em $(a/2,\ 0)$.

**A ideia.** Somar as forças de Coulomb das outras duas cargas. Cada uma vale $k_0\dfrac{|q_1q_2|}{r^2}$, ao longo da reta entre as cargas: repulsão se os sinais são iguais, atração se são opostos. As duas outras cargas estão à distância $a$ (é um triângulo equilátero), então as duas forças têm o mesmo tamanho:
$$F_1 = k_0\frac{q^2}{a^2}.$$

**A conta.**
- A outra $-q$ (mesmo sinal) **repele**: a força aponta para longe dela, para a direita, $F_1\,\hat x$.
- A $+q$ (sinal oposto) **atrai**: a força aponta da carga da direita para o vértice de cima, $(0 - a/2,\ a\sqrt3/2 - 0)$, cuja direção unitária é $\left(-\tfrac12,\ \tfrac{\sqrt3}2\right)$. Contribui $F_1\left(-\tfrac12\hat x + \tfrac{\sqrt3}2\hat y\right)$.

Somando:
$$\vec F = F_1\left(1 - \tfrac12\right)\hat x + F_1\frac{\sqrt3}2\,\hat y = \frac{k_0q^2}{2a^2}\,\hat x + \frac{\sqrt3}{2}\frac{k_0q^2}{a^2}\,\hat y.$$

**Conferindo.** O módulo é $F_1$ e a força aponta a $60°$ da horizontal. Para a carga da esquerda, o resultado é o espelho: $-\tfrac12$ em $\hat x$.`,
            passo: 2,
          },
        ],
        resultado: r`(a) $\vec E_P = -\dfrac{q}{3\pi\varepsilon_0a^2}\hat y$. (b) $\vec E_\text{centro} = -\dfrac{3q}{2\pi\varepsilon_0a^2}\hat y$. (c) $\vec F = \dfrac{k_0q^2}{a^2}\left(\tfrac12\hat x + \tfrac{\sqrt3}2\hat y\right)$ na $-q$ da direita.`,
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
          {
            titulo: '(a) A aceleração do elétron',
            texto: r`**O que se pede.** Módulo, direção e sentido da aceleração do elétron, que gira em círculo de raio $a_0$ em volta do próton.

**A ideia.** Segunda lei de Newton, $\vec F = m\vec a$. A única força que importa é a atração elétrica do próton (a gravidade é desprezada, veja o item d). A lei de Coulomb dá a intensidade, $F = k_0\dfrac{|q_1q_2|}{r^2}$, com $k_0 = \dfrac{1}{4\pi\varepsilon_0}$ (formulário: $\vec F_{(e)} = q\vec E$ e $\vec E = k_0\dfrac{q}{r^2}\hat r$).

**A conta.** As cargas são $+e$ e $-e$, a distância é $a_0$:
$$F = \frac{1}{4\pi\varepsilon_0}\frac{e^2}{a_0^2}.$$
Sinais opostos se atraem: a força aponta do elétron **para o próton**, que é o centro da órbita. Chamando de $\hat r$ o unitário que aponta do próton para o elétron, a força é $-F\hat r$, e
$$\vec a = \frac{\vec F}{m} = -\frac{1}{4\pi\varepsilon_0}\frac{e^2}{ma_0^2}\,\hat r.$$

**Em números.** Com $a_0 \approx 0{,}53\times10^{-10}$ m, $e \approx 1{,}6\times10^{-19}$ C e $m \approx 9{,}1\times10^{-31}$ kg: $a \approx 9\times10^{22}$ m/s². É a aceleração **centrípeta** de um movimento circular uniforme: radial, apontando para o centro.`,
            passo: 0,
          },
          {
            titulo: '(b) A velocidade escalar',
            texto: r`**O que se pede.** A rapidez $v$ do elétron na órbita.

**A ideia.** Em movimento circular uniforme de raio $R$, a aceleração aponta para o centro e vale $a = \dfrac{v^2}{R}$ (aceleração centrípeta). Quem produz essa aceleração aqui é a força elétrica do item (a).

**A conta.** Igualando a aceleração elétrica à centrípeta, com $R = a_0$:
$$\frac{1}{4\pi\varepsilon_0}\frac{e^2}{ma_0^2} = \frac{v^2}{a_0}\quad\Rightarrow\quad v = \sqrt{\frac{1}{4\pi\varepsilon_0}\frac{e^2}{ma_0}}.$$

**Em números.** $v \approx 2{,}2\times10^6$ m/s, menos de 1% da velocidade da luz, o que justifica usar a mecânica de Newton.`,
            passo: 1,
          },
          {
            titulo: '(c) O período de revolução',
            texto: r`**O que se pede.** Quanto tempo o elétron leva para dar uma volta.

**A ideia.** Velocidade constante: tempo = distância / velocidade. Uma volta tem comprimento $2\pi a_0$.

**A conta.**
$$T = \frac{2\pi a_0}{v} = 2\pi a_0\sqrt{\frac{4\pi\varepsilon_0ma_0}{e^2}} = \frac{4}{e}\sqrt{\pi^3\varepsilon_0ma_0^3}.$$
(Na última passagem, $2\pi\sqrt{4\pi} = 4\sqrt{\pi^3}$, e o $a_0$ de fora entra na raiz como $a_0^2$.)

**Em números.** $T \approx \dfrac{2\pi(0{,}53\times10^{-10})}{2{,}2\times10^6} \approx 1{,}5\times10^{-16}$ s.`,
            passo: 2,
          },
          {
            titulo: '(d) Por que desprezar a gravidade',
            texto: r`**O que se pede.** Justificar por que a atração gravitacional entre próton e elétron não entra na conta.

**A ideia.** Comparar as duas forças. A gravitacional é $F_g = G\dfrac{m_pm_e}{r^2}$ e a elétrica é $F_e = k_0\dfrac{e^2}{r^2}$. As duas caem com $1/r^2$, então a razão entre elas **não depende da distância**:
$$\frac{F_g}{F_e} = \frac{Gm_pm_e}{k_0e^2}.$$

**Em números.** Com $G = 6{,}7\times10^{-11}$, $m_p = 1{,}67\times10^{-27}$ kg, $m_e = 9{,}1\times10^{-31}$ kg, $k_0 = 9{,}0\times10^9$ e $e = 1{,}6\times10^{-19}$ C:
$$\frac{F_g}{F_e} \approx \frac{1{,}0\times10^{-67}}{2{,}3\times10^{-28}} \approx 4\times10^{-40}.$$

A gravidade é uns $10^{39}$ vezes mais fraca: as massas das partículas são minúsculas e $G$ é pequeno, enquanto $k_0$ é enorme. Incluí-la mudaria o resultado lá pela 40ª casa decimal.`,
            passo: 3,
          },
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
          {
            titulo: '(a) O vetor aceleração',
            texto: r`**O que se pede.** A aceleração da partícula enquanto ela está entre as placas.

**A ideia.** A única força que importa é a elétrica (a gravidade é desprezada no enunciado). Pelo formulário, uma carga $q$ num campo $\vec E$ sente $\vec F_{(e)} = q\vec E$. Pela segunda lei de Newton, $\vec a = \vec F/m$.

**Montagem.** Use os eixos da figura: $x$ ao longo das placas (o sentido de $\vec v_0$), $y$ perpendicular a elas, com a origem no ponto em que a partícula entra. Na figura o campo aponta para baixo, $\vec E = -E\,\hat y$. Entre as placas de um capacitor ele é **uniforme**: o mesmo em todos os pontos.

**A conta.**
$$\vec a = \frac{q\vec E}{m} = -\frac{qE}{m}\,\hat y.$$

**Conferindo.** A aceleração é **constante** (campo uniforme) e só tem componente $y$: na direção $x$ nada acelera a partícula. Para $q > 0$ ela é desviada para baixo, no sentido do campo; para $q < 0$, para cima.`,
            passo: 0,
          },
          {
            titulo: '(b) A velocidade em função do tempo',
            texto: r`**O que se pede.** O vetor $\vec v(t)$, contando o tempo a partir da entrada.

**A ideia.** Com aceleração constante, cada componente da velocidade muda linearmente com o tempo: $v(t) = v_\text{inicial} + a\,t$. É exatamente o que acontece num lançamento horizontal sob a gravidade, trocando $g$ por $qE/m$.

**A conta, por componente.**
- Em $x$: a aceleração é zero, então $v_x$ fica igual ao valor inicial, $v_x = v_0$.
- Em $y$: a velocidade inicial é zero (a partícula entra paralela às placas) e a aceleração é $-qE/m$, então $v_y = -\dfrac{qE}{m}t$.
$$\vec v(t) = v_0\,\hat x - \frac{qE}{m}t\,\hat y.$$`,
            passo: 1,
          },
          {
            titulo: '(c) A posição em função do tempo',
            texto: r`**O que se pede.** O vetor posição $\vec r(t)$, com a origem no ponto de entrada.

**A ideia.** Com aceleração constante, cada coordenada segue $s(t) = s_0 + v_\text{inicial}\,t + \tfrac12a\,t^2$.

**A conta, por componente.** A partícula parte da origem ($x_0 = y_0 = 0$).
- Em $x$: velocidade constante $v_0$, então $x = v_0t$.
- Em $y$: parte do repouso nessa direção, com aceleração $-qE/m$, então $y = -\dfrac{qE}{2m}t^2$.
$$\vec r(t) = v_0t\,\hat x - \frac{qE}{2m}t^2\,\hat y.$$`,
            passo: 1,
          },
          {
            titulo: '(d) A equação da trajetória',
            texto: r`**O que se pede.** A curva que a partícula descreve: $y$ escrito em função de $x$, sem o tempo.

**A ideia.** Do item (c) temos $x(t)$ e $y(t)$. Basta tirar $t$ de uma equação e pôr na outra.

**A conta.** De $x = v_0t$ vem $t = x/v_0$. Substituindo em $y$:
$$y = -\frac{qE}{2m}\left(\frac{x}{v_0}\right)^2 = -\frac{qE}{2mv_0^2}\,x^2.$$

**Que curva é essa?** $y$ proporcional a $x^2$: uma **parábola**, com vértice no ponto de entrada. É a mesma curva de uma pedra lançada horizontalmente.`,
            passo: 2,
          },
          {
            titulo: '(e) A velocidade na saída e a deflexão',
            texto: r`**O que se pede.** O vetor velocidade quando a partícula sai das placas, que têm comprimento $L$, e o ângulo que ele faz com a horizontal.

**A ideia.** Como $v_x = v_0$ nunca muda, o tempo para atravessar as placas é simplesmente $t_L = L/v_0$. É só pôr esse tempo no item (b).

**A conta.**
$$\vec v(t_L) = v_0\,\hat x - \frac{qE}{m}\frac{L}{v_0}\,\hat y = v_0\,\hat x - \frac{qEL}{mv_0}\,\hat y.$$
O ângulo $\theta$ com a horizontal sai da tangente, razão entre as componentes:
$$\tan\theta = \frac{v_y}{v_x} = -\frac{qEL}{mv_0^2}\quad\Rightarrow\quad\theta = \arctan\left(-\frac{qEL}{mv_0^2}\right).$$
O sinal negativo diz que, para $q > 0$, a partícula sai inclinada **para baixo**.

**Conferindo.** A deflexão cresce com o campo e com o comprimento das placas e diminui com a massa e com a velocidade de entrada: uma partícula mais rápida passa menos tempo sendo desviada. É o princípio do tubo de raios catódicos e das impressoras a jato de tinta.`,
            passo: 3,
          },
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
          {
            titulo: '(a) O campo da barra num ponto do eixo',
            texto: r`**O que se pede.** O campo elétrico no ponto $P$, no eixo $X$ a uma distância $x > a$ da origem, produzido pela barra de $-a$ a $a$ com carga $Q$ espalhada uniformemente.

**A ideia.** A fórmula $\vec E = k_0\dfrac{q}{r^2}\hat r$ do formulário vale para uma carga **pontual**. Uma barra não é pontual, mas dá para cortá-la em pedacinhos tão pequenos que cada um é praticamente um ponto. Somam-se os campos de todos os pedacinhos: essa soma é uma **integral**.

**Montagem.**
- Densidade linear de carga (carga por comprimento): $\lambda = \dfrac{Q}{2a}$.
- Um pedacinho na posição $x'$, de comprimento $dx'$, tem carga $dq = \lambda\,dx'$.
- Ele está a uma distância $x - x'$ de $P$. Como tudo está no eixo $X$, o campo dele em $P$ aponta ao longo do eixo, para a direita (para longe da carga, se $Q > 0$):
$$dE = k_0\frac{\lambda\,dx'}{(x - x')^2}.$$
Todos os pedacinhos dão campo no mesmo sentido, então basta somar os módulos.

**A conta.** Integrando sobre a barra inteira, de $x' = -a$ a $x' = a$. A primitiva de $\dfrac{1}{(x - x')^2}$ em relação a $x'$ é $\dfrac{1}{x - x'}$:
$$E = k_0\lambda\left[\frac{1}{x - x'}\right]_{-a}^{a} = k_0\lambda\left(\frac{1}{x - a} - \frac{1}{x + a}\right) = k_0\frac{Q}{2a}\cdot\frac{2a}{x^2 - a^2}.$$
$$\vec E = \frac{k_0Q}{x^2 - a^2}\,\hat x.$$

**Conferindo.** Longe da barra ($x \gg a$), $x^2 - a^2 \approx x^2$ e sobra $k_0Q/x^2$: de longe a barra parece uma carga pontual, como esperado.`,
            passo: 0,
          },
          {
            titulo: '(b) A força da primeira barra sobre a segunda',
            texto: r`**O que se pede.** A força que a primeira barra exerce sobre uma segunda barra idêntica (mesma carga $Q$), que vai de $x = b - a$ a $x = b + a$, com $b > 2a$ (as barras não se tocam).

**A ideia.** O item (a) já dá o campo da primeira barra em qualquer ponto $x > a$ do eixo. Cada pedacinho da **segunda** barra é uma carga quase pontual dentro desse campo e sente $dF = dq\,E(x)$ (formulário: $\vec F_{(e)} = q\vec E$). Somando sobre a segunda barra, temos a força total. É exatamente a sugestão do enunciado.

**Montagem.** Um pedacinho da segunda barra em $x$, de comprimento $dx$, tem carga $\lambda\,dx$ (a mesma densidade $\lambda = Q/2a$). Usando o campo na forma ainda não simplificada do item (a):
$$dF = \lambda\,dx\cdot k_0\lambda\left(\frac{1}{x - a} - \frac{1}{x + a}\right).$$

**A conta.** Integrando de $x = b - a$ a $x = b + a$, com as primitivas $\ln(x - a)$ e $\ln(x + a)$:
$$F = k_0\lambda^2\Big[\ln(x - a) - \ln(x + a)\Big]_{b-a}^{b+a} = k_0\lambda^2\Big[\ln b - \ln(b + 2a) - \ln(b - 2a) + \ln b\Big].$$
Juntando os logaritmos, com $(b + 2a)(b - 2a) = b^2 - 4a^2$:
$$\vec F = k_0\left(\frac{Q}{2a}\right)^2\ln\frac{b^2}{b^2 - 4a^2}\,\hat x.$$
O logaritmo é positivo, então a força aponta para $+\hat x$: a segunda barra é **repelida**, como deve ser entre cargas de mesmo sinal.

**Conferindo.** Com as barras muito afastadas ($b \gg a$), usa-se $\ln\dfrac{1}{1 - u} \approx u$ para $u = 4a^2/b^2$ pequeno: $F \approx k_0\dfrac{Q^2}{4a^2}\cdot\dfrac{4a^2}{b^2} = k_0\dfrac{Q^2}{b^2}$. É a lei de Coulomb entre duas cargas pontuais $Q$ a uma distância $b$.`,
            passo: 1,
          },
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
          {
            titulo: '(a) A carga total com λ = λ₀ sen θ',
            texto: r`**O que se pede.** A carga total do semicírculo de raio $R$ (a metade de cima, $\theta$ de $0$ a $\pi$), cuja densidade linear vale $\lambda(\theta) = \lambda_0\sin\theta$.

**A ideia.** Densidade linear $\lambda$ é carga por unidade de comprimento. Se ela varia ao longo do fio, corta-se o fio em pedacinhos, calcula-se a carga de cada um ($dq = \lambda\,d\ell$) e soma-se tudo com uma integral.

**Montagem.** Num arco de raio $R$, um pedacinho que ocupa um ângulo $d\theta$ tem comprimento $d\ell = R\,d\theta$ (comprimento de arco = raio × ângulo, em radianos). Então
$$dq = \lambda_0\sin\theta\,R\,d\theta.$$

**A conta.**
$$Q = \int_0^\pi\lambda_0R\sin\theta\,d\theta = \lambda_0R\Big[-\cos\theta\Big]_0^\pi = \lambda_0R\,(1 + 1) = 2\lambda_0R.$$

**Conferindo.** A densidade é zero nas pontas ($\theta = 0$ e $\pi$) e máxima no topo, e é positiva em todo o arco: a carga total tem de ser positiva.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no centro com λ = λ₀ sen θ',
            texto: r`**O que se pede.** O vetor campo elétrico no centro do semicírculo (a origem).

**A ideia.** Cada pedacinho $dq$ é quase uma carga pontual, e cria na origem o campo $d\vec E = k_0\dfrac{dq}{r^2}\hat r$ (formulário), com $\hat r$ apontando do pedacinho para a origem. O campo total é a soma vetorial: integra-se **cada componente** separadamente.

**Montagem.**
- O pedacinho no ângulo $\theta$ está em $(R\cos\theta,\ R\sin\theta)$, a uma distância $R$ da origem, para qualquer $\theta$.
- O unitário que vai dele até a origem é $-(\cos\theta,\ \sin\theta)$: o campo de uma carga positiva empurra a origem para longe do pedacinho.
- $dq = \lambda_0\sin\theta\,R\,d\theta$, então
$$d\vec E = k_0\frac{\lambda_0\sin\theta\,R\,d\theta}{R^2}\big(-\cos\theta,\ -\sin\theta\big) = -\frac{k_0\lambda_0}{R}\sin\theta\,(\cos\theta,\ \sin\theta)\,d\theta.$$

**A conta, componente por componente.**
- $x$: $\displaystyle\int_0^\pi\sin\theta\cos\theta\,d\theta = \Big[\tfrac12\sin^2\theta\Big]_0^\pi = 0$. A metade da direita empurra para a esquerda e a da esquerda empurra para a direita, na mesma medida.
- $y$: $\displaystyle\int_0^\pi\sin^2\theta\,d\theta = \frac\pi2$ (a média de $\sin^2$ numa meia volta é $\tfrac12$).

$$\vec E = -\frac{k_0\lambda_0}{R}\cdot\frac\pi2\,\hat y = -\frac{\lambda_0}{4\pi\varepsilon_0}\frac{\pi}{2R}\,\hat y = -\frac{\lambda_0}{8\varepsilon_0R}\,\hat y.$$

**Conferindo.** Toda a carga está acima da origem e é positiva: o campo na origem tem de apontar para baixo.`,
            passo: 0,
          },
          {
            titulo: '(c) Carga e campo com λ = λ₀ cos θ',
            texto: r`**O que se pede.** Refazer (a) e (b) com a densidade $\lambda(\theta) = \lambda_0\cos\theta$.

**A ideia.** Agora a densidade **muda de sinal**: $\cos\theta > 0$ na metade da direita ($\theta < \pi/2$) e $\cos\theta < 0$ na da esquerda. O método é o mesmo; a integral cuida dos sinais.

**A carga.**
$$Q = \int_0^\pi\lambda_0R\cos\theta\,d\theta = \lambda_0R\Big[\sin\theta\Big]_0^\pi = 0.$$
A carga positiva da direita é exatamente igual, em módulo, à negativa da esquerda.

**O campo.** Mesma montagem do item (b), trocando $\sin\theta$ por $\cos\theta$ na densidade:
$$d\vec E = -\frac{k_0\lambda_0}{R}\cos\theta\,(\cos\theta,\ \sin\theta)\,d\theta.$$
- $x$: $\displaystyle\int_0^\pi\cos^2\theta\,d\theta = \frac\pi2$.
- $y$: $\displaystyle\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.
$$\vec E = -\frac{\lambda_0}{8\varepsilon_0R}\,\hat x.$$

**Por que a carga total é zero e o campo não?** A metade da direita (positiva) **empurra** a origem para a esquerda; a metade da esquerda (negativa) **puxa** a origem para a esquerda também. As duas contribuições se somam. Carga total nula não quer dizer campo nulo: o que conta é **onde** cada carga está.`,
            passo: 1,
          },
        ],
        resultado: r`(a) $Q = 2\lambda_0R$. (b) $\vec E = -\dfrac{\lambda_0}{8\varepsilon_0R}\hat y$. (c) $Q = 0$ e $\vec E = -\dfrac{\lambda_0}{8\varepsilon_0R}\hat x$.`,
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
          {
            titulo: '(a) Que componente é nula',
            texto: r`**O que se pede.** Dizer, sem fazer conta, quais componentes do campo no ponto $P = (0, 0, z)$ são zero, e por quê.

**A ideia.** **Simetria.** Se a distribuição de carga não muda quando a refletimos num plano, o campo num ponto desse plano não pode ter componente atravessando o plano: a reflexão inverteria essa componente sem mudar nada na carga.

**Aplicando.** O fio ocupa a metade de cima ($y > 0$) do círculo de raio $R$ no plano $z = 0$. Ele não muda se trocarmos $x$ por $-x$: para cada pedacinho em $(x, y)$ há outro igual em $(-x, y)$. O ponto $P$ está no plano $x = 0$. Os campos desses dois pedacinhos em $P$ têm componentes $x$ opostas, que se cancelam aos pares. Então:
- $E_x = 0$;
- $E_y \neq 0$: **todo** o fio está do lado $y > 0$, e cada pedacinho empurra $P$ para $-y$; nada cancela;
- $E_z \neq 0$: todos os pedacinhos estão abaixo de $P$ (para $z > 0$) e o empurram para cima.

Num anel **completo**, $E_y$ também se anularia. Aqui, com meio anel, não.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no ponto P',
            texto: r`**O que se pede.** A expressão completa do vetor campo em $P = (0, 0, z)$.

**A ideia.** Cortar o fio em pedacinhos quase pontuais, escrever o campo de cada um com $d\vec E = k_0\dfrac{dq}{r^2}\hat r$ (formulário) e somar componente por componente.

**Montagem.**
- Use o ângulo $\varphi$ medido a partir do eixo $X$, de $0$ a $\pi$. O pedacinho em $\varphi$ está em $(R\cos\varphi,\ R\sin\varphi,\ 0)$ e tem comprimento $R\,d\varphi$, logo carga $dq = \lambda R\,d\varphi$.
- O vetor que vai do pedacinho até $P$ é $\vec r = (-R\cos\varphi,\ -R\sin\varphi,\ z)$, de comprimento $r = \sqrt{R^2 + z^2}$, **igual para todos os pedacinhos**.
- Escrevendo $\dfrac{\hat r}{r^2} = \dfrac{\vec r}{r^3}$:
$$d\vec E = k_0\frac{\lambda R\,d\varphi}{(R^2 + z^2)^{3/2}}\big(-R\cos\varphi,\ -R\sin\varphi,\ z\big).$$

**A conta.** O fator da frente não depende de $\varphi$; integra-se cada componente de $0$ a $\pi$:
- $\displaystyle\int_0^\pi\cos\varphi\,d\varphi = 0$, de modo que $E_x = 0$, como previsto em (a);
- $\displaystyle\int_0^\pi\sin\varphi\,d\varphi = 2$;
- $\displaystyle\int_0^\pi d\varphi = \pi$.
$$\vec E = \frac{k_0\lambda R}{(R^2 + z^2)^{3/2}}\big(0,\ -2R,\ \pi z\big) = -\frac{\lambda R^2}{2\pi\varepsilon_0(z^2 + R^2)^{3/2}}\,\hat y + \frac{\lambda Rz}{4\varepsilon_0(z^2 + R^2)^{3/2}}\,\hat z.$$
(Com $k_0 = 1/4\pi\varepsilon_0$: $2k_0 = \dfrac{1}{2\pi\varepsilon_0}$ e $\pi k_0 = \dfrac{1}{4\varepsilon_0}$.)`,
            passo: 1,
          },
          {
            titulo: '(c) Muito longe do fio',
            texto: r`**O que se pede.** Uma aproximação do resultado de (b) para $z \gg R$, e o que ela quer dizer.

**A ideia.** Se $z$ é muito maior que $R$, então $z^2 + R^2 \approx z^2$ e $(z^2 + R^2)^{3/2} \approx z^3$.

**A conta.**
$$E_z \approx \frac{\lambda Rz}{4\varepsilon_0z^3} = \frac{\lambda R}{4\varepsilon_0z^2},\qquad E_y \approx -\frac{\lambda R^2}{2\pi\varepsilon_0z^3}.$$

**Interpretação.** A carga total do fio é $Q = \lambda\times(\text{comprimento}) = \lambda\pi R$. Reescrevendo,
$$E_z \approx \frac{1}{4\pi\varepsilon_0}\frac{\lambda\pi R}{z^2} = k_0\frac{Q}{z^2}:$$
é o campo de uma **carga pontual** $Q$ na origem. De muito longe, o formato do fio deixa de importar. A componente $E_y$ cai com $1/z^3$, mais depressa que $E_z$: ela só existe porque a carga está um pouco deslocada para o lado $y > 0$, e esse detalhe some à distância.`,
            passo: 2,
          },
        ],
        resultado: r`(a) $E_x = 0$. (b) $\vec E = -\dfrac{\lambda R^2}{2\pi\varepsilon_0(z^2 + R^2)^{3/2}}\hat y + \dfrac{\lambda Rz}{4\varepsilon_0(z^2 + R^2)^{3/2}}\hat z$. (c) De longe, o campo de uma carga pontual $Q = \lambda\pi R$.`,
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
          {
            titulo: '(a) A carga total do disco',
            texto: r`**O que se pede.** A carga total de um disco de raio $R$ cuja densidade superficial (carga por área) vale $\sigma(r) = \sigma_0\dfrac{R}{r}$, em que $r$ é a distância ao centro.

**A ideia.** Como $\sigma$ depende só de $r$, corta-se o disco em **anéis** finos concêntricos: em cada anel, $r$ é praticamente constante, logo $\sigma$ também. Carga do anel = densidade × área do anel. Depois soma-se sobre todos os anéis.

**Montagem.** Um anel de raio $r$ e largura $dr$, se o desenrolarmos, é quase um retângulo de comprimento $2\pi r$ e largura $dr$: área $dA = 2\pi r\,dr$. Sua carga é
$$dq = \sigma(r)\,2\pi r\,dr = \sigma_0\frac Rr\,2\pi r\,dr = 2\pi\sigma_0R\,dr.$$
Repare que o $r$ cancelou: **todos os anéis de mesma largura têm a mesma carga**.

**A conta.**
$$Q = \int_0^R2\pi\sigma_0R\,dr = 2\pi\sigma_0R^2.$$

**Conferindo.** A densidade explode no centro ($r \to 0$), mas a área dos anéis encolhe na mesma proporção, e a carga total é finita.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no eixo do disco',
            texto: r`**O que se pede.** O campo elétrico num ponto do eixo do disco (a reta perpendicular a ele pelo centro), a uma distância $z$.

**A ideia.** Somar os campos dos anéis do item (a), usando o campo de um anel no seu eixo, visto em aula. Ele **não está no formulário**, então vale lembrar de onde vem. Um anel de raio $r$ e carga $q$: cada pedacinho está à mesma distância $\sqrt{r^2 + z^2}$ do ponto. As componentes do campo paralelas ao plano do anel se cancelam aos pares (pedacinhos diametralmente opostos), e sobra a componente ao longo do eixo, que é a fração $z/\sqrt{r^2 + z^2}$ de cada campo:
$$E_\text{anel} = k_0\frac{q\,z}{(r^2 + z^2)^{3/2}}.$$

**Por que podemos somar anéis.** Os anéis são concêntricos e têm o **mesmo eixo**. O campo de cada um no ponto aponta ao longo desse eixo, então os campos têm todos a mesma direção e os módulos simplesmente se somam.

**A conta.** Com $q = dq = 2\pi\sigma_0R\,dr$:
$$E = \int_0^Rk_0\frac{2\pi\sigma_0R\,z\,dr}{(r^2 + z^2)^{3/2}} = 2\pi k_0\sigma_0Rz\int_0^R\frac{dr}{(r^2 + z^2)^{3/2}}.$$
A primitiva dada no enunciado, com $x = r$ e $a = z$, é $\dfrac{r}{z^2\sqrt{r^2 + z^2}}$. Entre $0$ e $R$ ela vale $\dfrac{R}{z^2\sqrt{R^2 + z^2}}$. Com $2\pi k_0 = \dfrac{1}{2\varepsilon_0}$:
$$\vec E = \frac{\sigma_0}{2\varepsilon_0}\frac{R^2}{z\sqrt{R^2 + z^2}}\,\hat z,$$
apontando para longe do disco (para $\sigma_0 > 0$).`,
            passo: 1,
          },
          {
            titulo: '(c) Muito longe do disco',
            texto: r`**O que se pede.** Uma aproximação de (b) para $z \gg R$ e sua interpretação.

**A ideia.** Para $z$ muito maior que $R$, $\sqrt{R^2 + z^2} \approx z$.

**A conta.**
$$E \approx \frac{\sigma_0}{2\varepsilon_0}\frac{R^2}{z\cdot z} = \frac{\sigma_0R^2}{2\varepsilon_0z^2}.$$
Usando a carga total do item (a), $Q = 2\pi\sigma_0R^2$, isso é
$$E \approx \frac{Q}{4\pi\varepsilon_0z^2} = k_0\frac{Q}{z^2}.$$

**Interpretação.** É o campo de uma **carga pontual** $Q$ no centro do disco. Visto de muito longe, o disco é só um ponto; seu tamanho e o jeito como a carga se espalha nele deixam de importar.`,
            passo: 2,
          },
        ],
        resultado: r`(a) $Q = 2\pi\sigma_0R^2$. (b) $\vec E = \dfrac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}}\hat z$. (c) $E \approx \dfrac{Q}{4\pi\varepsilon_0z^2}$, carga pontual.`,
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
          {
            titulo: '(a) A densidade superficial',
            texto: r`**O que se pede.** A densidade superficial de carga $\sigma$ (carga por unidade de área) da casca cilíndrica de raio $R$ e altura $h$, com carga $Q$ uniforme.

**A ideia.** Uniforme quer dizer a mesma em toda a superfície: $\sigma = \dfrac{Q}{\text{área}}$.

**Montagem.** A carga está na **lateral** da casca (não há tampas). Desenrolada, a lateral é um retângulo de lados $2\pi R$ (o perímetro do círculo) e $h$: área $2\pi Rh$.

**A conta.**
$$\sigma = \frac{Q}{2\pi Rh}.$$`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no eixo, a uma distância d da casca',
            texto: r`**O que se pede.** O campo no ponto $P$ do eixo do cilindro, a uma distância $d$ da borda da direita.

**A ideia.** Cortar a casca em **anéis** finos com o mesmo eixo (coaxiais) e usar o campo de um anel no seu eixo, visto em aula (não está no formulário):
$$E_\text{anel} = k_0\frac{q\,u}{(u^2 + R^2)^{3/2}},$$
em que $u$ é a distância do centro do anel ao ponto, ao longo do eixo. Ele vem de somar os pedacinhos do anel: as componentes perpendiculares ao eixo se cancelam aos pares, e sobra a fração $u/\sqrt{u^2 + R^2}$ ao longo do eixo. Como todos os anéis têm o mesmo eixo, todos os campos em $P$ apontam na mesma direção, e basta somar os módulos.

**Montagem.** Meça $u$ a partir de $P$. A casca vai de $u = d$ (borda mais próxima) a $u = d + h$ (borda mais distante). Um anel de largura $du$ tem área $2\pi R\,du$ e carga
$$dq = \sigma\,2\pi R\,du.$$

**A conta.**
$$E = \int_d^{d+h}k_0\frac{\sigma2\pi R\,u\,du}{(u^2 + R^2)^{3/2}} = 2\pi k_0\sigma R\int_d^{d+h}\frac{u\,du}{(u^2 + R^2)^{3/2}}.$$
A integral sai por substituição: com $w = u^2 + R^2$, $dw = 2u\,du$ e $\displaystyle\int\frac{u\,du}{(u^2 + R^2)^{3/2}} = -\frac{1}{\sqrt{u^2 + R^2}}$. Avaliando entre os limites e usando $2\pi k_0 = \dfrac{1}{2\varepsilon_0}$:
$$E = \frac{\sigma R}{2\varepsilon_0}\left(\frac{1}{\sqrt{d^2 + R^2}} - \frac{1}{\sqrt{(h + d)^2 + R^2}}\right).$$
O campo aponta ao longo do eixo, **para longe** da casca (para $Q > 0$).

**Conferindo.** O primeiro termo, do anel mais próximo, é o maior: o parêntese é positivo.`,
            passo: 1,
          },
          {
            titulo: '(c) Muito longe: d ≫ R, h',
            texto: r`**O que se pede.** Como se comporta o resultado de (b) quando $P$ está muito longe, $d \gg R$ e $d \gg h$.

**A ideia.** Desprezar as quantidades pequenas diante de $d$, mas com cuidado: os dois termos do parêntese são quase iguais e a diferença entre eles é que importa.

**A conta.** Desprezando $R^2$ diante de $d^2$: $\dfrac{1}{\sqrt{d^2 + R^2}} \approx \dfrac1d$ e $\dfrac{1}{\sqrt{(h + d)^2 + R^2}} \approx \dfrac{1}{d + h}$. A diferença:
$$\frac1d - \frac{1}{d + h} = \frac{h}{d(d + h)} \approx \frac{h}{d^2}.$$
Então
$$E \approx \frac{\sigma Rh}{2\varepsilon_0d^2}.$$
Com $\sigma = \dfrac{Q}{2\pi Rh}$ do item (a), $\sigma Rh = \dfrac{Q}{2\pi}$, e
$$E \approx \frac{Q}{4\pi\varepsilon_0d^2}.$$

**Interpretação.** É o campo de uma **carga pontual** $Q$. De longe, a casca é só um ponto.`,
            passo: 2,
          },
        ],
        resultado: r`(a) $\sigma = \dfrac{Q}{2\pi Rh}$. (b) $E = \dfrac{\sigma R}{2\varepsilon_0}\left(\dfrac{1}{\sqrt{d^2 + R^2}} - \dfrac{1}{\sqrt{(h + d)^2 + R^2}}\right)$, para longe da casca. (c) $E \approx \dfrac{Q}{4\pi\varepsilon_0d^2}$.`,
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
          {
            titulo: '(a) O campo no eixo Y',
            texto: r`**O que se pede.** O campo do dipolo num ponto do eixo $Y$, a uma distância $y > 0$ da origem.

**A ideia.** Um dipolo são duas cargas iguais e opostas, $+q$ e $-q$, separadas por uma distância $2a$. O campo dele é só a soma dos campos das duas cargas, cada um dado por $\vec E = k_0\dfrac{q}{r^2}\hat r$ (formulário). O **momento de dipolo** é o vetor $\vec p = q\vec L$ (também no formulário), em que $\vec L$ vai de $-q$ até $+q$: aqui, $\vec p = 2qa\,\hat x$.

**Montagem.** Na figura, $+q$ está em $(a, 0)$ e $-q$ em $(-a, 0)$. O ponto $(0, y)$ está à mesma distância das duas: $r = \sqrt{y^2 + a^2}$.
- O campo de $+q$ aponta **para longe** dela: na direção $(-a,\ y)/r$.
- O campo de $-q$ aponta **para** ela: na direção $(-a,\ -y)/r$.

**A conta.** Os dois têm o mesmo módulo, $k_0q/r^2$. Somando: as componentes $y$ ($+y$ e $-y$) se cancelam; as componentes $x$ ($-a$ e $-a$) se somam:
$$\vec E = k_0\frac{q}{r^2}\cdot\frac{-2a}{r}\,\hat x = -\frac{k_0\,2qa}{(y^2 + a^2)^{3/2}}\,\hat x = -\frac{1}{4\pi\varepsilon_0}\frac{\vec p}{(y^2 + a^2)^{3/2}}.$$

**Conferindo.** No plano que divide o dipolo ao meio, o campo é paralelo ao dipolo e aponta **contra** $\vec p$, do lado de $+q$ para o lado de $-q$.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no eixo X',
            texto: r`**O que se pede.** O campo do dipolo num ponto do eixo $X$, a uma distância $x > a$ da origem (à direita das duas cargas).

**A ideia.** De novo, a soma dos campos de $+q$ e $-q$. Agora tudo está na mesma reta, então os dois campos estão ao longo do eixo $X$ e basta somar com sinal.

**Montagem.**
- $+q$, em $(a, 0)$, está a $x - a$ do ponto. Seu campo aponta para longe dela: para a direita, $+k_0\dfrac{q}{(x - a)^2}$.
- $-q$, em $(-a, 0)$, está a $x + a$. Seu campo aponta para ela: para a esquerda, $-k_0\dfrac{q}{(x + a)^2}$.

**A conta.** Pondo no mesmo denominador, com $(x + a)^2 - (x - a)^2 = 4ax$:
$$E = k_0q\left[\frac{1}{(x - a)^2} - \frac{1}{(x + a)^2}\right] = k_0q\frac{4ax}{(x^2 - a^2)^2}.$$
Com $p = 2qa$:
$$\vec E = \frac{1}{4\pi\varepsilon_0}\frac{2x}{(x^2 - a^2)^2}\,\vec p.$$

**Conferindo.** A carga $+q$ está mais perto, então ela ganha: o campo aponta para a direita, **no sentido** de $\vec p$.`,
            passo: 1,
          },
          {
            titulo: '(c) Muito longe do dipolo',
            texto: r`**O que se pede.** Aproximar os dois resultados para pontos distantes, $y \gg a$ e $x \gg a$, e interpretar.

**A ideia.** A aproximação binomial dada (está no formulário da P1): para $|u| \ll 1$, $(1 + u)^n \approx 1 + nu$. Basta pôr em evidência a variável grande.

**A conta.**
- Eixo $Y$: $(y^2 + a^2)^{-3/2} = y^{-3}\left(1 + \dfrac{a^2}{y^2}\right)^{-3/2} \approx y^{-3}\left(1 - \dfrac{3a^2}{2y^2}\right) \approx \dfrac{1}{y^3}$. Então
$$\vec E \approx -\frac{\vec p}{4\pi\varepsilon_0y^3}.$$
- Eixo $X$: $(x^2 - a^2)^{-2} = x^{-4}\left(1 - \dfrac{a^2}{x^2}\right)^{-2} \approx \dfrac{1}{x^4}$. Então
$$\vec E \approx \frac{2x\,\vec p}{4\pi\varepsilon_0x^4} = \frac{2\vec p}{4\pi\varepsilon_0x^3}.$$

**Interpretação.**
- O campo do dipolo cai com $1/r^3$, **mais rápido** que o de uma carga ($1/r^2$). De longe, $+q$ e $-q$ parecem quase no mesmo lugar, e seus campos quase se cancelam. Sobra só a pequena diferença por estarem separadas.
- O campo depende da **direção**. Na mesma distância, no eixo do dipolo ele é **duas vezes** maior e aponta no sentido de $\vec p$; no plano perpendicular, aponta contra $\vec p$.
- Só importa o produto $p = 2qa$: dipolos com $q$ e $a$ diferentes, mas o mesmo $p$, são indistinguíveis de longe.`,
            passo: 2,
          },
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
          {
            titulo: '(a) O campo no eixo Y',
            texto: r`**O que se pede.** O campo no ponto $P = (0, y)$ produzido pelas três cargas $+q$, $-2q$ e $+q$ no eixo $X$, separadas por $a$.

**A ideia.** Superposição: somar os vetores $\vec E = k_0\dfrac{q}{r^2}\hat r$ (formulário) das três cargas. O campo de carga positiva aponta para longe dela; o de carga negativa aponta para ela.

**Montagem.** As cargas ficam em $(-a, 0)$, $(0, 0)$ e $(a, 0)$, com a $-2q$ no meio.
- Cada $+q$ está a $r = \sqrt{y^2 + a^2}$ de $P$. O campo de cada uma aponta para longe dela, nas direções $(a,\ y)/r$ (a da esquerda) e $(-a,\ y)/r$ (a da direita).
- A $-2q$ está a $y$ de $P$, logo abaixo. Seu campo aponta para ela: para baixo, com módulo $k_0\dfrac{2q}{y^2}$.

**A conta.**
- As componentes $x$ das duas $+q$ ($+a$ e $-a$) se cancelam.
- As componentes $y$ das duas $+q$ se somam: $2\cdot k_0\dfrac{q}{r^2}\cdot\dfrac{y}{r} = \dfrac{2k_0q\,y}{(y^2 + a^2)^{3/2}}$, para cima.
- Somando com a da $-2q$, para baixo:
$$\vec E = 2k_0q\left[\frac{y}{(y^2 + a^2)^{3/2}} - \frac{1}{y^2}\right]\hat y.$$

**Conferindo.** O primeiro termo é sempre menor que o segundo (as $+q$ estão mais longe e só uma parte do campo delas aponta na vertical): o campo em $P$ aponta para baixo.`,
            passo: 0,
          },
          {
            titulo: '(b) Muito longe: y ≫ a',
            texto: r`**O que se pede.** Aproximar o resultado de (a) para $y \gg a$ e comparar com uma carga (monopolo) e com um dipolo.

**A ideia.** A aproximação binomial do formulário da P1, $(1 + u)^n \approx 1 + nu$ para $|u| \ll 1$. Atenção: aqui os termos principais **se cancelam**, então é preciso ir até o termo seguinte.

**A conta.** Pondo $y^2$ em evidência, com $u = a^2/y^2$ e $n = -3/2$:
$$\frac{y}{(y^2 + a^2)^{3/2}} = \frac{1}{y^2}\left(1 + \frac{a^2}{y^2}\right)^{-3/2} \approx \frac{1}{y^2}\left(1 - \frac{3a^2}{2y^2}\right).$$
Substituindo no colchete, o $\dfrac{1}{y^2}$ cancela com o $-\dfrac{1}{y^2}$:
$$\vec E \approx 2k_0q\left(-\frac{3a^2}{2y^4}\right)\hat y = -\frac{3k_0qa^2}{y^4}\,\hat y.$$

**Comparando.**
- Uma carga (monopolo) dá campo $\propto 1/y^2$. Aqui a carga total é $q - 2q + q = 0$: esse termo não existe.
- Um dipolo dá $\propto 1/y^3$. Aqui o momento de dipolo total é zero (item c): também não existe.
- Sobra o termo seguinte, $\propto 1/y^4$: o campo de um **quadrupolo**, que cai ainda mais depressa.

Se a expansão parasse na primeira ordem, o resultado seria zero, e seria errado concluir que o campo some.`,
            passo: 1,
          },
          {
            titulo: '(c) Como dois dipolos',
            texto: r`**O que se pede.** Ver o arranjo como uma soma de dipolos e calcular o momento de dipolo total.

**A ideia.** A superposição deixa dividir uma carga em pedaços que ficam no mesmo lugar. Divida a $-2q$ do meio em duas cargas $-q$ superpostas na origem.

**Os dois dipolos.** Lembrando que $\vec p = q\vec L$ (formulário), com $\vec L$ de $-q$ até $+q$:
- Dipolo 1: $+q$ em $(-a, 0)$ e uma $-q$ na origem. $\vec L$ aponta para a esquerda: $\vec p_1 = -qa\,\hat x$.
- Dipolo 2: a outra $-q$ na origem e $+q$ em $(a, 0)$. $\vec L$ aponta para a direita: $\vec p_2 = +qa\,\hat x$.

**O momento total.**
$$\vec p_\text{total} = \vec p_1 + \vec p_2 = 0.$$

São dois dipolos iguais, colados e apontando em sentidos opostos. Seus campos de dipolo ($1/r^3$) se cancelam de longe, e sobra só o efeito de eles estarem um pouco deslocados um do outro, que é o termo $1/y^4$ do item (b).`,
            passo: 2,
          },
        ],
        resultado: r`$E \approx -3kqa^2/y^4$; $p = 0$.`,
        errosComuns: ['Parar a expansão na primeira ordem e concluir que o campo é zero.'],
        oficial: { resposta: 'E = (2q/4πε₀)[y/(y² + a²)^{3/2} − 1/y²] ŷ; E ≈ −3a²q/(4πε₀y⁴) ŷ; dois dipolos opostos, momento total nulo.' },
      },
    },
  ],
}

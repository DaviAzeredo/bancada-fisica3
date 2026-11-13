import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P1 } from '../formularios'

const r = String.raw

/* Exercício 4: oito cargas alternadas nos vértices de um cubo (aresta da cena dc; do cristal, dr). */
const VERT = [0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => ({ i, j, k, s: (i + j + k) % 2 === 0 ? 1 : -1 }))))
const cargasCubo = VERT.map((v, n) => ({
  id: `c${n}`,
  tipo: 'carga' as const,
  q: v.s > 0 ? 'qe' : '0-qe',
  pos: [`(${v.i} - 0.5)*dc`, `(${v.j} - 0.5)*dc`, `(${v.k} - 0.5)*dc`] as [string, string, string],
  rotulo: v.s > 0 ? '+q' : '−q',
}))
const pares = VERT.flatMap((_, a) => VERT.map((__, b) => [a, b] as const).filter(([x, y]) => x < y))
/** Energia da cena: soma de q_j · V_i(r_j) sobre os pares, com o potencial calculado pela simulação. */
const U4 = `(${pares.map(([a, b]) => `(${VERT[b].s})*qe*Vde('c${a}', pos('c${b}'))`).join(' + ')})`

/* Exercício 6: o disco como 40 anéis; cada anel de largura R/N leva a mesma carga 2πσ₀R²/N. */
const ANEIS = 40
const aneis6 = Array.from({ length: ANEIS }, (_, k) => ({
  id: `a${k}`,
  tipo: 'anelCarga' as const,
  Q: `2*pi*s0*R^2/${ANEIS}`,
  centro: [0, 0, 0] as [number, number, number],
  raio: `R*${(k + 0.5) / ANEIS}`,
  normal: 'z' as const,
}))

/* Exercício 7: a barra em 40 trechos de densidade constante λ₀x/a, tomada no meio de cada um. */
const TRECHOS = 40
const barra7 = Array.from({ length: TRECHOS }, (_, k) => {
  const x0 = -1 + (2 * k) / TRECHOS
  const x1 = -1 + (2 * (k + 1)) / TRECHOS
  return {
    id: `b${k}`,
    tipo: 'segmentoCarga' as const,
    lambda: `lam0*${(x0 + x1) / 2}`,
    a: [`a*${x0}`, 0, 0] as [string, number, number],
    b: [`a*${x1}`, 0, 0] as [string, number, number],
  }
})
const Q7 = Array.from({ length: TRECHOS }, (_, k) => `carga('b${k}')`).join(' + ')

/* Exercício 11: placa espessa por expressão (campo da lista 2 e o potencial com zero em z = 0). */
const E11 = 'abs(z) <= d ? [0, 0, rho0*z/eps0] : [0, 0, rho0*d*sign(z)/eps0]'
const V11 = (zz: string) => `(abs(${zz}) <= d ? 0-rho0*(${zz})^2/(2*eps0) : rho0*d^2/(2*eps0) - rho0*d*abs(${zz})/eps0)`

/* Exercício 12: esfera condutora neutra, por imagens: −qR/D perto da superfície e +qR/D no centro. */
const POS12 = 'D - R^2/D'

export const lista_03: ProvaInput = {
  id: 'lista-03',
  titulo: 'Lista 3 · Potencial elétrico',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  formulario: FORMULARIO_P1,
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Acelerar um elétron até 40% da luz',
      resumo: 'eΔV = mv²/2 dá ΔV ≈ 41 kV (na conta clássica).',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.252] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 22], alvo: [0, 0, 0] }, tempo: { escala: 2e-9, unidade: 'ns', passo: 1e-12 } },
      parametros: [{ id: 'dV', rotulo: 'Diferença de potencial', simbolo: r`\Delta V`, valor: 40950, unidade: 'V', min: 5000, max: 60000, passo: 50 }],
      objetos: [
        { id: 'Ea', tipo: 'campoE', valor: 'x >= 0-0.05 && x < 0.05 && abs(y) < 0.03 ? [0-dV/0.1, 0, 0] : [0, 0, 0]', rotulo: 'região de aceleração (10 cm)' },
        { id: 'e', tipo: 'particula', q: '0-qe', m: 'me', pos: [-0.05, 0, 0], v: [0, 0, 0], cargaDeProva: true, rotulo: 'elétron' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('e')", vetor: "vel('e') + vec(1e-9, 0, 0)", comprimento: '2*cm', rotulo: 'v' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Velocidade na saída, em unidades de c', simbolo: 'v/c', ativo: "x(pos('e')) > 0.05", expr: "mag(vel('e'))/3e8", unidade: '', teoria: 'sqrt(2*qe*dV/me)/3e8' },
        { rotulo: 'ddp para chegar a 0,4c (conta clássica)', simbolo: r`\Delta V = \frac{m(0{,}4c)^2}{2e}`, expr: '1e-3*me*(0.4*3e8)^2/(2*qe)', unidade: 'kV' },
        { rotulo: 'A mesma ddp com a relatividade', simbolo: r`\frac{(\gamma - 1)mc^2}{e}`, expr: '1e-3*(1/sqrt(1 - 0.16) - 1)*me*9e16/qe', unidade: 'kV' },
      ],
      passos: [
        {
          titulo: 'Energia',
          texto: r`Partindo do repouso, o trabalho elétrico vira energia cinética: $e\,\Delta V = \tfrac12mv^2$. Com $v = 0{,}4c = 1{,}2\times10^8$ m/s,
$$\Delta V = \frac{mv^2}{2e} \approx 4{,}1\times10^4\ \text{V}.$$
O elétron é negativo: ele vai para o potencial **mais alto**. Rode e leia $v/c$ quando ele sair da região.`,
          parametros: { dV: 40950 },
          medidas: [0, 1],
        },
        {
          titulo: 'Uma nota sobre a relatividade',
          texto: r`A $0{,}4c$ a conta clássica já erra: com $(\gamma - 1)mc^2$ seriam uns 46,6 kV. A lista pede a conta clássica, e a simulação também é clássica.`,
          medidas: [2],
        },
      ],
      respostas: [{ item: 'ΔV', texto: r`$|\Delta V| = \dfrac{m(0{,}4c)^2}{2e} \approx 4{,}1\times10^4$ V, com o elétron indo para o potencial mais alto.` }],
      resolucao: {
        conceitos: [{ texto: 'Energia potencial e trabalho elétrico', lab: 'potencial' }],
        etapas: [
          {
            titulo: 'ΔV para chegar a 40% da velocidade da luz',
            texto: r`**O que se pede.** A diferença de potencial que acelera um elétron, a partir do repouso, até $v = 0{,}4c$.

**A ideia: potencial e energia.** O potencial elétrico $V$ é energia potencial por unidade de carga. Uma carga $q$ que vai de um ponto a outro com diferença de potencial $\Delta V$ muda sua energia potencial em $\Delta U = q\,\Delta V$ (no formulário da P1: $dU = q\,dV$). Se só a força elétrica age, a energia total se conserva: o que a energia potencial perde, a cinética ganha.

**Montagem.** O elétron tem carga $-e$ e parte do repouso:
$$\Delta K + \Delta U = 0\quad\Rightarrow\quad\tfrac12mv^2 + (-e)\,\Delta V = 0\quad\Rightarrow\quad\Delta V = \frac{mv^2}{2e}.$$
O $\Delta V$ sai **positivo**: o elétron, por ser negativo, ganha energia cinética indo para o potencial **mais alto**.

**A conta.** Com $v = 0{,}4\times3{,}0\times10^8 = 1{,}2\times10^8$ m/s:
$$\Delta V = \frac{(9{,}1\times10^{-31})(1{,}2\times10^8)^2}{2(1{,}6\times10^{-19})} = \frac{1{,}31\times10^{-14}}{3{,}2\times10^{-19}} \approx 4{,}1\times10^4\ \text{V}.$$

**Sobre o sinal e o gabarito.** O gabarito da monitoria dá $-40{,}5$ kV: o sinal negativo vem de medir $\Delta V$ como $V_\text{inicial} - V_\text{final}$. O valor certo com os dados do enunciado é $40{,}95$ kV.

**Uma ressalva física.** A $40\%$ da velocidade da luz, a mecânica de Newton já erra um pouco: a conta relativística, $(\gamma - 1)mc^2 = e\,\Delta V$, daria uns $46{,}6$ kV. A lista pede a conta clássica.`,
            passo: 0,
          },
        ],
        resultado: r`$\Delta V \approx 41$ kV.`,
        errosComuns: ['Esquecer o fator 1/2 da energia cinética.'],
        oficial: {
          resposta: 'ΔV = −40,5×10³ V.',
          observacao: 'Divergência pequena no valor: com os dados do enunciado, mv²/2e = 40 950 V ≈ 41 kV. O sinal negativo do gabarito vem de tomar ΔV = V_inicial − V_final; com ΔV = V_final − V_inicial, o elétron sobe 41 kV de potencial.',
        },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Energia de um dipolo em campo uniforme',
      resumo: 'U = −pE cos φ: mínimo (estável) em φ = 0, máximo (instável) em φ = π.',
      figura: { pagina: 1, recorte: [0.089, 0.253, 0.936, 0.415] },
      cena: { escala: 0.01, extensao: 4, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'phi', rotulo: 'Ângulo entre p e E', simbolo: r`\varphi`, valor: 60, unidade: '°', min: 0, max: 180, passo: 1 },
        { id: 'E0', rotulo: 'Campo externo', simbolo: 'E', valor: 1e4, unidade: 'V/m', min: 2e3, max: 3e4, passo: 500 },
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 1e-9, max: 1e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        { id: 'Eu', tipo: 'campoE', valor: ['E0', 0, 0], potencial: '0-E0*x', rotulo: 'E uniforme' },
        { id: 'pq', tipo: 'carga', q: 'q', pos: ['d/2*cos(rad(phi))', 'd/2*sin(rad(phi))', 0], rotulo: '+q' },
        { id: 'mq', tipo: 'carga', q: '0-q', pos: ['0-d/2*cos(rad(phi))', '0-d/2*sin(rad(phi))', 0], rotulo: '−q' },
        { id: 'sp', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: ['cos(rad(phi))', 'sin(rad(phi))', 0], comprimento: '1.5*cm', rotulo: 'p' },
      ],
      visual: { setasE: true, planoSetas: 'xy', fontes: ['Eu'] },
      medidas: [
        { rotulo: 'Energia no campo externo (soma de qV nas duas cargas)', simbolo: r`U = -pE\cos\varphi`, expr: "1e6*(q*Vde('Eu', pos('pq')) - q*Vde('Eu', pos('mq')))", unidade: 'μJ', teoria: '1e6*(0-q*d*E0*cos(rad(phi)))' },
        { rotulo: 'Torque do campo externo', simbolo: r`\tau_z = -pE\sin\varphi`, expr: "1e6*z(cross(pos('pq'), q*Ede('Eu', pos('pq'))) + cross(pos('mq'), (0-q)*Ede('Eu', pos('mq'))))", unidade: 'μN·m', teoria: '1e6*(0-q*d*E0*sin(rad(phi)))' },
      ],
      graficos: [
        {
          titulo: 'U(φ)',
          tipo: 'perfil',
          x: { variavel: 'ff', de: 0, ate: 360, rotulo: 'φ', unidade: '°', marca: 'phi' },
          series: [{ rotulo: 'U', expr: '1e6*(0-q*d*E0*cos(rad(ff)))', unidade: 'μJ' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Somar as duas cargas',
          texto: r`Em campo uniforme $\vec E = E\hat x$, uma carga tem $U = -qEx$. As duas juntas:
$$U = -qEx_+ + qEx_- = -qE(x_+ - x_-) = -qEd\cos\varphi = -\vec p\cdot\vec E.$$`,
          parametros: { phi: 60 },
          medidas: [0],
        },
        {
          titulo: '(b) Estável',
          texto: r`$U(\varphi)$ é um cosseno invertido. O mínimo, $\varphi = 0$, é o equilíbrio **estável**: $\vec p$ alinhado com $\vec E$, e o torque traz de volta qualquer desvio.`,
          parametros: { phi: 0 },
          medidas: [0, 1],
        },
        { titulo: '(b) Instável', texto: r`O máximo, $\varphi = \pi$, é **instável**: $\vec p$ contra $\vec E$, e um desvio pequeno cresce.`, parametros: { phi: 180 }, medidas: [0, 1] },
      ],
      respostas: [
        { item: '(a)', texto: r`$U = -qEd\cos\varphi = -\vec p\cdot\vec E$` },
        { item: '(b)', texto: r`Estável em $\varphi = 0$; instável em $\varphi = \pi$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Dipolo em campo externo', lab: 'dipolo' }],
        etapas: [
          {
            titulo: '(a) A energia do dipolo no campo',
            texto: r`**O que se pede.** Mostrar que a energia potencial de um dipolo ($+q$ e $-q$ separadas por $d$) num campo uniforme $\vec E$ é $U = -pE\cos\varphi = -\vec p\cdot\vec E$, com $p = qd$ e $\varphi$ o ângulo entre $\vec p$ e $\vec E$.

**A ideia.** Uma carga $q$ num campo uniforme $\vec E = E\hat x$ tem energia potencial $U = qV$, com $V = -Ex$ (o potencial cai ao longo do campo; confira com $\vec E = -\vec\nabla V$, do formulário: $-\dfrac{dV}{dx} = E$). Então
$$U = -qEx.$$
A energia do dipolo é a soma das energias das duas cargas.

**Montagem.** O momento de dipolo $\vec p = q\vec L$ (formulário) aponta de $-q$ para $+q$, com $|\vec L| = d$. Se $\vec p$ faz ângulo $\varphi$ com $\vec E$ (com o eixo $x$), a diferença entre as posições das duas cargas ao longo do campo é
$$x_+ - x_- = d\cos\varphi.$$

**A conta.**
$$U = (+q)(-Ex_+) + (-q)(-Ex_-) = -qE(x_+ - x_-) = -qEd\cos\varphi.$$
Com $p = qd$ e a definição de produto escalar, $pE\cos\varphi = \vec p\cdot\vec E$:
$$U = -pE\cos\varphi = -\vec p\cdot\vec E.$$

**Repare.** A posição do dipolo como um todo não aparece, só a **orientação**: num campo uniforme, deslocar o dipolo sem girá-lo não muda a energia, porque a força total sobre ele é zero.`,
            passo: 0,
          },
          {
            titulo: '(b) O gráfico de U(φ) e o equilíbrio',
            texto: r`**O que se pede.** Esboçar $U(\varphi)$ e dizer em que orientação o equilíbrio é estável e em qual é instável.

**A ideia.** Um sistema tende a ir para onde sua energia potencial é menor. Num **mínimo** de energia, qualquer desvio aumenta $U$ e o sistema é empurrado de volta: equilíbrio **estável**. Num **máximo**, qualquer desvio diminui $U$ e o sistema se afasta: **instável**.

**O gráfico.** $U = -pE\cos\varphi$ é um cosseno de cabeça para baixo:
- em $\varphi = 0$: $U = -pE$, o **mínimo**;
- em $\varphi = \pm\pi/2$: $U = 0$;
- em $\varphi = \pm\pi$: $U = +pE$, o **máximo**.

**Os equilíbrios.**
- **Estável em $\varphi = 0$:** $\vec p$ alinhado com $\vec E$. Girando um pouco, o torque $\vec\tau = \vec p\times\vec E$ (formulário) traz o dipolo de volta.
- **Instável em $\varphi = \pi$:** $\vec p$ contra $\vec E$. Também ali o torque é zero, mas um desvio pequeno faz o torque girar o dipolo para ainda mais longe.

**Em palavras.** O dipolo "quer" se alinhar com o campo: a carga $+q$ é puxada no sentido de $\vec E$ e a $-q$ no sentido contrário.`,
            passo: 1,
          },
        ],
        resultado: r`$U = -\vec p\cdot\vec E$; estável em 0, instável em $\pi$.`,
        errosComuns: ['Trocar estável e instável: o dipolo quer se alinhar com o campo.'],
        oficial: { resposta: 'U = −pE cos φ = −p·E; equilíbrio estável em φ = 0 e instável em φ = ±π.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Potencial nulo, campo não',
      resumo: 'V(P) = 0 exige sinais opostos; o campo em P não precisa ser zero; trazer q até P custa zero.',
      figura: { pagina: 1, recorte: [0.089, 0.416, 0.936, 0.543] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 13], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'q1', rotulo: 'Carga 1', simbolo: 'q_1', valor: 2e-9, unidade: 'C', min: 2e-9, max: 2e-9, passo: 1e-10 },
        { id: 'k2', rotulo: 'Razão q₂/q₁', simbolo: 'q_2/q_1', valor: -0.5, unidade: '', min: -1, max: 1, passo: 0.05 },
        { id: 'd', rotulo: 'Distância entre as cargas', simbolo: 'd', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06, passo: 0.001 },
        { id: 'xp', rotulo: 'Posição de P no eixo', simbolo: 'x_P', valor: 0.01, unidade: 'm', min: -0.025, max: 0.025, passo: 0.0005 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'q1', pos: ['0-d/2', 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: 'k2*q1', pos: ['d/2', 0, 0], rotulo: 'q₂' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xp', 0, 0], arraste: { param: 'xp', eixo: 'x' }, rotulo: 'P' },
      ],
      visual: { planoV: true, equipotenciais: true },
      medidas: [
        { rotulo: 'Potencial em P', simbolo: 'V(P)', expr: 'V(xp, 0, 0)', unidade: 'V', teoria: 'k0*q1*(1/(xp + d/2) + k2/(d/2 - xp))' },
        { rotulo: 'Campo em P', simbolo: '|E(P)|', expr: 'mag(E(xp, 0, 0))', unidade: 'V/m', teoria: 'abs(k0*q1*(1/(xp + d/2)^2 - k2/(d/2 - xp)^2))' },
        { rotulo: 'Trabalho da força elétrica para trazer 1 nC do infinito até P', simbolo: r`W = -q\,V(P)`, expr: '1e6*(0-1e-9*V(xp, 0, 0))', unidade: 'μJ' },
      ],
      passos: [
        {
          titulo: '(a) Sinais',
          texto: r`$V(P) = k\left(\dfrac{q_1}{r_1} + \dfrac{q_2}{r_2}\right)$, com $r_1, r_2 > 0$. Se as cargas tivessem o mesmo sinal, as duas parcelas teriam o mesmo sinal e não se cancelariam. Ponha $q_2/q_1 > 0$: o potencial não zera em ponto nenhum.`,
          parametros: { k2: 0.5, xp: 0.01 },
          medidas: [0],
        },
        {
          titulo: '(b) Campo em P',
          texto: r`Com $q_2 = -q_1/2$, o potencial zera no eixo onde $r_1 = 2r_2$, em $x_P = d/6 = 1$ cm. Ali o campo **não** é zero: os dois campos apontam para o mesmo lado entre as cargas. Potencial nulo não diz nada sobre o campo, que depende de como $V$ varia.`,
          parametros: { k2: -0.5, xp: 0.01 },
          medidas: [0, 1],
        },
        {
          titulo: '(c) Trabalho',
          texto: r`$W = -q[V(P) - V(\infty)] = 0$: a força elétrica faz trabalho positivo num trecho e negativo noutro, e o total é zero.`,
          parametros: { k2: -0.5, xp: 0.01 },
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: 'Não: com o mesmo sinal, as contribuições ao potencial não se cancelam.' },
        { item: '(b)', texto: 'Não necessariamente: o campo depende da variação de V, não do seu valor.' },
        { item: '(c)', texto: r`$W = 0$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial de cargas pontuais', lab: 'potencial' }],
        etapas: [
          {
            titulo: '(a) As cargas podem ter o mesmo sinal?',
            texto: r`**O que se pede.** Sabendo que o potencial das duas cargas é zero num ponto $P$ a distância finita delas (com zero no infinito), dizer se $q_1$ e $q_2$ podem ter o mesmo sinal.

**A ideia.** O potencial de uma carga pontual, com zero no infinito, é (formulário)
$$V = k_0\frac{q}{r}.$$
Ele é um **número**, não um vetor, e tem o sinal da carga (porque $r > 0$). O potencial de várias cargas é a soma, com sinal, dos potenciais de cada uma.

**A conta.** Em $P$, com $r_1$ e $r_2$ as distâncias às cargas:
$$V(P) = k_0\left(\frac{q_1}{r_1} + \frac{q_2}{r_2}\right) = 0.$$
Se $q_1$ e $q_2$ tivessem o mesmo sinal, as duas parcelas teriam esse sinal e a soma nunca daria zero.

**Resposta.** **Não**: as cargas têm de ter sinais opostos.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo também é zero em P?',
            texto: r`**O que se pede.** Dizer se o campo elétrico em $P$ é necessariamente nulo.

**A ideia.** O campo está ligado ao potencial pelo **gradiente** (formulário): $\vec E = -\vec\nabla V$. Ou seja, o campo depende de como $V$ **varia** de ponto a ponto, e não do valor de $V$ num ponto. Comparando: estar ao nível do mar (altura zero) não diz nada sobre a inclinação do terreno.

**Um exemplo.** Ponha $q_1 > 0$ na origem e $q_2 = -q_1/2$ em $x = d$. Entre elas, num ponto a $r_1$ de $q_1$ e $r_2$ de $q_2$, $V = 0$ quando $\dfrac{q_1}{r_1} = \dfrac{q_1/2}{r_2}$, isto é, $r_1 = 2r_2$: em $x = 2d/3$ (na cena, que põe as cargas em $\pm d/2$, isso é $x = d/6$). Ali:
- o campo de $q_1$ (positiva) aponta para longe dela, para a direita;
- o campo de $q_2$ (negativa) aponta para ela, também para a direita.

Os dois se somam: o campo é diferente de zero, embora $V = 0$.

**Resposta.** **Não necessariamente.**`,
            passo: 1,
          },
          {
            titulo: '(c) O trabalho para trazer q do infinito até P',
            texto: r`**O que se pede.** O trabalho da força elétrica ao trazer uma terceira carga $q$ do infinito até $P$.

**A ideia.** A força elétrica é **conservativa**: o trabalho dela só depende do ponto de partida e do de chegada, e não do caminho. Ele é menos a variação da energia potencial, e a energia potencial de $q$ num ponto é $U = qV$:
$$W = -\Delta U = -q\,\big[V(P) - V(\infty)\big].$$

**A conta.** $V(P) = 0$ (dado) e $V(\infty) = 0$ (escolha do zero):
$$W = -q\,(0 - 0) = 0.$$

**Em palavras.** Pelo caminho, a força elétrica ajuda num trecho (perto de uma carga) e atrapalha noutro (perto da outra), e no total o saldo é zero. Isso vale por qualquer caminho.`,
            passo: 2,
          },
        ],
        resultado: r`(a) não; (b) não; (c) $W = 0$.`,
        errosComuns: ['Concluir que o campo é nulo onde o potencial é nulo.'],
        oficial: { resposta: '(a) Não; (b) não; (c) o trabalho é zero.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Fácil',
      titulo: 'Energia de um cubo de cargas alternadas',
      resumo: 'U = (kq²/d)(−12 + 12/√2 − 4/√3) ≈ −1,46 q²/(πε₀d); V = 0 no centro.',
      figura: { pagina: 1, recorte: [0.089, 0.544, 0.936, 0.84] },
      cena: { escala: 0.01, extensao: 4, unidade: 'cm', camera: { pos: [5, 4, 7], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'dr', rotulo: 'Aresta no cristal', simbolo: 'd', valor: 2.82e-10, unidade: 'm', min: 2.82e-10, max: 2.82e-10, passo: 1e-12 },
        { id: 'dc', rotulo: 'Aresta desenhada (escala da cena)', simbolo: r`d_\text{cena}`, valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: cargasCubo,
      visual: { setasE: false },
      medidas: [
        {
          rotulo: 'Energia do cubo (soma de qV nos 28 pares), na aresta do cristal',
          simbolo: r`U = \frac{kq^2}{d}\left(-12 + \frac{12}{\sqrt2} - \frac{4}{\sqrt3}\right)`,
          expr: `${U4}*(dc/dr)/qe`,
          unidade: 'eV',
          teoria: 'k0*qe^2/dr*(0-12 + 12/sqrt(2) - 4/sqrt(3))/qe',
        },
        { rotulo: 'Coeficiente de q²/(πε₀d)', simbolo: r`U\,\frac{\pi\varepsilon_0d}{q^2}`, expr: `${U4}*pi*eps0*dc/qe^2`, unidade: '', teoria: '(0-12 + 12/sqrt(2) - 4/sqrt(3))/4' },
        { rotulo: 'Potencial no centro', simbolo: r`V_\text{centro}`, expr: 'V(0, 0, 0)', unidade: 'V', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(a) Contar os pares',
          texto: r`São $\binom82 = 28$ pares: 12 arestas (sinais opostos, distância $d$), 12 diagonais de face (mesmo sinal, $d\sqrt2$) e 4 diagonais do cubo (opostos, $d\sqrt3$):
$$U = \frac{kq^2}{d}\left(-12 + \frac{12}{\sqrt2} - \frac{4}{\sqrt3}\right) \approx -5{,}82\frac{kq^2}{d} \approx -1{,}46\frac{q^2}{\pi\varepsilon_0d}.$$
A simulação soma $q_jV_i(\vec r_j)$ nos pares; com $q = e$ e $d = 0{,}282$ nm, dá cerca de $-30$ eV.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Estabilidade',
          texto: r`$U < 0$: separar as cargas até o infinito custa energia, e o arranjo é **ligado**, como num cristal iônico. Ressalva: cargas pontuais paradas não ficam em equilíbrio estável só pela força elétrica (teorema de Earnshaw); no cristal real, a repulsão quântica de curto alcance completa o quadro.`,
          medidas: [0],
        },
        { titulo: '(b) Centro', texto: r`Todas as cargas estão à mesma distância do centro, $d\sqrt3/2$, e somam zero: $V_\text{centro} = 0$.`, medidas: [2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$U = \dfrac{q^2}{4\pi\varepsilon_0d}\left(-12 + \dfrac{12}{\sqrt2} - \dfrac{4}{\sqrt3}\right) \approx -1{,}46\dfrac{q^2}{\pi\varepsilon_0d}$: negativa, o sistema é ligado.` },
        { item: '(b)', texto: r`$V_\text{centro} = 0$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Energia de um sistema de cargas', lab: 'energia' }],
        etapas: [
          {
            titulo: '(a) A energia total e a estabilidade',
            texto: r`**O que se pede.** A energia potencial elétrica das oito cargas nos vértices do cubo de aresta $d$, alternando $+q$ e $-q$ (vértices vizinhos têm sinais opostos), com zero quando todas estão infinitamente afastadas. E discutir a estabilidade.

**A ideia.** A energia de um par de cargas é (formulário)
$$U = k_0\frac{qq'}{r}.$$
Ela é o trabalho para trazer as duas do infinito até a distância $r$. Para muitas cargas, a energia total é a **soma sobre todos os pares**, cada par contado **uma vez**.

**Montagem: contar os pares.** Com 8 cargas há $\dfrac{8\times7}{2} = 28$ pares. Eles se dividem por distância:
- **12 arestas** ($r = d$): ligam vértices vizinhos, de sinais **opostos**. Cada par dá $-k_0q^2/d$.
- **12 diagonais de face** ($r = d\sqrt2$; 2 por face, 6 faces): ligam vértices do mesmo sinal. Cada par dá $+k_0q^2/(d\sqrt2)$.
- **4 diagonais do cubo** ($r = d\sqrt3$): ligam vértices opostos, de sinais **opostos**. Cada par dá $-k_0q^2/(d\sqrt3)$.

Conferindo a contagem: $12 + 12 + 4 = 28$.

**A conta.**
$$U = \frac{k_0q^2}{d}\left(-12 + \frac{12}{\sqrt2} - \frac{4}{\sqrt3}\right) = \frac{k_0q^2}{d}\left(-12 + 8{,}49 - 2{,}31\right) \approx -5{,}82\,\frac{k_0q^2}{d}.$$
Com $k_0 = \dfrac{1}{4\pi\varepsilon_0}$: $U \approx -1{,}46\,\dfrac{q^2}{\pi\varepsilon_0d}$.

**Estabilidade.** $U < 0$ quer dizer que, para separar todas as cargas até o infinito, é preciso **fornecer** energia: o arranjo é **ligado**, como um cristal iônico. As atrações entre vizinhos (as mais próximas) ganham das repulsões.

**Ressalva.** Energia negativa não garante equilíbrio estável. Um teorema da eletrostática (de Earnshaw) diz que cargas pontuais paradas não ficam em equilíbrio estável só sob forças elétricas. No cristal real, uma repulsão de origem quântica, de curto alcance, impede os íons de se aproximarem demais e completa o quadro.`,
            passo: 0,
          },
          {
            titulo: '(b) O potencial no centro do cubo',
            texto: r`**O que se pede.** O potencial elétrico no centro do cubo, com zero no infinito.

**A ideia.** O potencial de várias cargas é a soma dos potenciais de cada uma (formulário: $V = k_0\dfrac qr$). É uma soma de números, com sinal.

**Montagem.** O centro está à mesma distância de todos os oito vértices: metade da diagonal do cubo, $r = \dfrac{d\sqrt3}{2}$. Há quatro cargas $+q$ e quatro $-q$.

**A conta.**
$$V_\text{centro} = \frac{k_0}{r}\big(4q - 4q\big) = 0.$$

**Repare.** Potencial zero no centro não quer dizer que nada aconteça ali. Mas, neste caso, o campo no centro também é zero, pela simetria: cada carga tem, no vértice oposto, uma de sinal contrário, e os campos das duas no centro apontam para o mesmo lado; os quatro pares de vértices opostos dão campos que se cancelam entre si.`,
            passo: 2,
          },
        ],
        resultado: r`$U \approx -1{,}46\,q^2/\pi\varepsilon_0d$; $V_\text{centro} = 0$.`,
        errosComuns: ['Contar cada par duas vezes.'],
        oficial: { resposta: 'U ≈ −1,46 q²/(πε₀d), negativa: o sistema é ligado. V_centro = 0.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Anel carregado: potencial, campo e ponto de retorno',
      resumo: 'V = kQ/√(z² + R²); E_z = kQz/(z² + R²)^{3/2}; a partícula para em z = √[(2kQq/mv₀²)² − R²].',
      figura: { pagina: 2, recorte: [0.089, 0.062, 0.936, 0.202] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [14, 6, 10], alvo: [0, 0, 3] }, tempo: { escala: 5e-6, unidade: 'µs', passo: 5e-9 } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga do anel', simbolo: 'Q', valor: 2.3e-12, unidade: 'C', min: 2.3e-12, max: 2.3e-12, passo: 1e-13 },
        { id: 'R', rotulo: 'Raio do anel', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'v0', rotulo: 'Velocidade do próton longe do anel', simbolo: 'v_0', valor: 1e4, unidade: 'm/s', min: 5e3, max: 1.6e4, passo: 100 },
        { id: 'zp', rotulo: 'Ponto do eixo', simbolo: 'z', valor: 0.03, unidade: 'm', min: 0, max: 0.1, passo: 0.001 },
      ],
      objetos: [
        { id: 'anel', tipo: 'anelCarga', Q: 'Q0', centro: [0, 0, 0], raio: 'R', normal: 'z', rotulo: 'anel (Q)' },
        {
          id: 'p',
          tipo: 'particula',
          q: 'qe',
          m: 'mp',
          pos: [0, 0, 0.1],
          v: [0, 0, '0-sqrt(v0^2 - 2*qe*k0*Q0/(mp*sqrt(0.01 + R^2)))'],
          rotulo: 'próton',
        },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zp'], arraste: { param: 'zp', eixo: 'z' }, rotulo: 'z' },
      ],
      medidas: [
        { rotulo: 'Potencial no eixo', simbolo: r`V = \frac{kQ}{\sqrt{z^2 + R^2}}`, expr: 'V(0, 0, zp)', unidade: 'V', teoria: 'k0*Q0/sqrt(zp^2 + R^2)' },
        { rotulo: 'Campo no eixo', simbolo: r`E_z = \frac{kQz}{(z^2 + R^2)^{3/2}}`, expr: 'z(E(0, 0, zp))', unidade: 'V/m', teoria: 'k0*Q0*zp/(zp^2 + R^2)^1.5' },
        { rotulo: 'Energia do próton (cinética + potencial)', simbolo: r`\tfrac12mv^2 + qV`, expr: "1e20*(mp*mag(vel('p'))^2/2 + qe*V(pos('p')))", unidade: '10⁻²⁰ J', teoria: '1e20*mp*v0^2/2' },
        {
          rotulo: 'Menor distância ao centro, no rastro',
          simbolo: r`z_\text{min}`,
          ativo: "z(vel('p')) > 0 && z(pos('p')) < 0.1 && v0^2 < 2*k0*Q0*qe/(mp*R)",
          expr: "100*(0.1 - rastroSpan('p', 'z'))",
          unidade: 'cm',
          teoria: '100*sqrt((2*k0*Q0*qe/(mp*v0^2))^2 - R^2)',
        },
        { rotulo: 'Velocidade mínima para atravessar o anel', simbolo: r`\sqrt{\frac{Qq}{2\pi\varepsilon_0mR}}`, expr: 'sqrt(Q0*qe/(2*pi*eps0*mp*R))', unidade: 'm/s' },
      ],
      passos: [
        {
          titulo: '(a) Potencial',
          texto: r`Todo pedaço do anel está à mesma distância $\sqrt{z^2 + R^2}$ do ponto do eixo: $V = \dfrac{kQ}{\sqrt{z^2 + R^2}}$.`,
          medidas: [0],
        },
        {
          titulo: '(b) Campo',
          texto: r`Por simetria o campo no eixo é ao longo de $z$: $E_z = -\dfrac{dV}{dz} = \dfrac{kQz}{(z^2 + R^2)^{3/2}}$.`,
          medidas: [1],
        },
        {
          titulo: '(c) Ponto de retorno',
          texto: r`A energia se conserva: $\tfrac12mv_0^2 = \dfrac{kQq}{\sqrt{z_\text{min}^2 + R^2}}$, então
$$z_\text{min} = \sqrt{\left(\frac{2kQq}{mv_0^2}\right)^2 - R^2}.$$
Isso só existe se $v_0^2 < \dfrac{Qq}{2\pi\varepsilon_0mR}$; mais rápido, a partícula vence o máximo de potencial (no centro) e atravessa. Rode e leia o ponto de retorno no rastro.`,
          parametros: { v0: 1e4 },
          medidas: [2, 3, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$V(z) = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{\sqrt{z^2 + R^2}}$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Qz}{(z^2 + R^2)^{3/2}}\hat z$` },
        { item: '(c)', texto: r`$z_\text{min} = \sqrt{\left(\dfrac{2kQq}{mv_0^2}\right)^2 - R^2}$, se $v_0^2 < \dfrac{Qq}{2\pi\varepsilon_0mR}$; senão ela atravessa o anel.` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de distribuições contínuas', lab: 'distribuicoes' },
          { texto: 'Conservação de energia', lab: 'potencial' },
        ],
        etapas: [
          {
            titulo: '(a) O potencial no eixo do anel',
            texto: r`**O que se pede.** O potencial elétrico num ponto do eixo do anel (raio $R$, carga $Q$ uniforme), a uma distância $z$ do centro, com zero no infinito.

**A ideia.** Cortar o anel em pedacinhos quase pontuais e somar os potenciais deles, cada um dado por $dV = k_0\dfrac{dq}{r}$ (formulário: $V = k_0\dfrac qr$). Como o potencial é um **número** (não um vetor), basta somar, sem se preocupar com direções. Isso costuma ser bem mais fácil que somar campos.

**Montagem.** Todo pedacinho do anel está à **mesma distância** do ponto do eixo (Pitágoras, com o raio $R$ e a altura $z$):
$$r = \sqrt{z^2 + R^2}.$$

**A conta.** Como $r$ é o mesmo para todos, ele sai da soma, e a soma das cargas dá $Q$:
$$V(z) = \int\frac{k_0\,dq}{\sqrt{z^2 + R^2}} = \frac{k_0}{\sqrt{z^2 + R^2}}\int dq = \frac{1}{4\pi\varepsilon_0}\frac{Q}{\sqrt{z^2 + R^2}}.$$

**Conferindo.** Longe ($z \gg R$), $V \approx k_0Q/z$, o potencial de uma carga pontual. No centro ($z = 0$), $V = k_0Q/R$, o valor máximo.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no eixo',
            texto: r`**O que se pede.** O vetor campo elétrico no mesmo ponto do eixo.

**A ideia.** O campo é menos o gradiente do potencial (formulário): $\vec E = -\vec\nabla V$. Por simetria, no eixo o campo só pode apontar **ao longo do eixo**: as componentes perpendiculares dos pedacinhos se cancelam aos pares, de lados opostos do anel. Então basta derivar em $z$:
$$E_z = -\frac{dV}{dz}.$$

**Cuidado.** Só conhecemos $V$ **no eixo**. Isso dá $E_z$, mas não daria as componentes perpendiculares; aqui elas são zero pela simetria, então está tudo certo.

**A conta.** Com $V = k_0Q\,(z^2 + R^2)^{-1/2}$ e a regra da cadeia:
$$E_z = -k_0Q\cdot\left(-\tfrac12\right)(z^2 + R^2)^{-3/2}\cdot2z = \frac{k_0Qz}{(z^2 + R^2)^{3/2}}.$$
$$\vec E = \frac{1}{4\pi\varepsilon_0}\frac{Qz}{(z^2 + R^2)^{3/2}}\,\hat z.$$

**Conferindo.** No centro ($z = 0$) o campo é zero: os pedacinhos empurram em todas as direções do plano e se cancelam. É o mesmo resultado obtido na Lista 1 somando campos, agora com bem menos trabalho.`,
            passo: 1,
          },
          {
            titulo: '(c) A menor distância ao centro',
            texto: r`**O que se pede.** Uma partícula de massa $m$ e carga $q$ (mesmo sinal de $Q$) vem do infinito pelo eixo, com velocidade $v_0$, em direção ao anel. Qual a menor distância que ela chega do centro?

**A ideia.** A força entre $q$ e o anel é repulsiva (mesmo sinal): a partícula vai freando. Só age a força elétrica, então a **energia se conserva**: a energia cinética vai virando energia potencial $U = qV$. No ponto mais próximo, a velocidade é zero.

**A conta.** No infinito: cinética $\tfrac12mv_0^2$, potencial zero. No ponto de retorno $z_\text{min}$: cinética zero, potencial $qV(z_\text{min})$. Igualando:
$$\frac12mv_0^2 = \frac{k_0Qq}{\sqrt{z_\text{min}^2 + R^2}}\quad\Rightarrow\quad\sqrt{z_\text{min}^2 + R^2} = \frac{2k_0Qq}{mv_0^2}.$$
Elevando ao quadrado e isolando:
$$z_\text{min} = \sqrt{\left(\frac{2k_0Qq}{mv_0^2}\right)^2 - R^2}.$$

**Quando isso existe.** A raiz só é real se $\dfrac{2k_0Qq}{mv_0^2} > R$. O potencial no eixo tem um máximo **finito** no centro, $k_0Q/R$. Se a partícula chega com energia suficiente para passar esse máximo, ela não para: atravessa o anel e sai do outro lado. A condição para parar é
$$\frac12mv_0^2 < \frac{k_0Qq}{R}\quad\Longleftrightarrow\quad v_0^2 < \frac{Qq}{2\pi\varepsilon_0mR}.$$`,
            passo: 2,
          },
        ],
        resultado: r`$z_\text{min} = \sqrt{(2kQq/mv_0^2)^2 - R^2}$.`,
        errosComuns: ['Esquecer que o potencial máximo é finito (no centro): partículas rápidas atravessam.'],
        oficial: { resposta: 'V = Q/(4πε₀√(z² + R²)); E = Qz/(4πε₀(z² + R²)^{3/2}) ẑ; z_min = ±√((2kQq/mv₀²)² − R²), válido para v₀² < Qq/(2πmε₀R).' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Difícil',
      titulo: 'Disco com densidade σ₀R/r',
      resumo: 'V = (σ₀R/2ε₀) ln[(R + √(R² + z²))/z]; E = σ₀R²/(2ε₀z√(R² + z²)).',
      figura: { pagina: 2, recorte: [0.089, 0.203, 0.936, 0.367] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [8, 5, 8], alvo: [0, 0, 1.5] } },
      parametros: [
        { id: 's0', rotulo: 'Constante da densidade', simbolo: r`\sigma_0`, valor: 1e-9, unidade: 'C/m²', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio do disco', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
        { id: 'zp', rotulo: 'Ponto do eixo', simbolo: 'z', valor: 0.02, unidade: 'm', min: 0.008, max: 0.06, passo: 0.001 },
      ],
      objetos: [...aneis6, { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zp'], arraste: { param: 'zp', eixo: 'z' }, rotulo: 'z' }],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Potencial no eixo (40 anéis)', simbolo: r`V(z)`, expr: 'V(0, 0, zp)', unidade: 'V', teoria: 's0*R/(2*eps0)*ln((R + sqrt(R^2 + zp^2))/zp)' },
        { rotulo: 'Campo no eixo', simbolo: r`E_z = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}}`, expr: 'z(E(0, 0, zp))', unidade: 'V/m', teoria: 's0*R^2/(2*eps0*zp*sqrt(R^2 + zp^2))' },
        { rotulo: 'Carga total do disco', simbolo: r`Q = 2\pi\sigma_0R^2`, expr: `1e12*(${aneis6.map((a) => `carga('${a.id}')`).join(' + ')})`, unidade: 'pC', teoria: '1e12*2*pi*s0*R^2' },
      ],
      passos: [
        {
          titulo: '(a) Somar anéis',
          texto: r`Um anel de raio $r$ e largura $dr$ tem carga $\sigma\,2\pi r\,dr = 2\pi\sigma_0R\,dr$: a mesma para todos! Pelo exercício anterior,
$$V = \frac{1}{4\pi\varepsilon_0}\int_0^R\frac{2\pi\sigma_0R\,dr}{\sqrt{r^2 + z^2}} = \frac{\sigma_0R}{2\varepsilon_0}\ln\frac{R + \sqrt{R^2 + z^2}}{z}.$$
A cena monta o disco com 40 anéis iguais.`,
          medidas: [0, 2],
        },
        {
          titulo: '(b) Campo',
          texto: r`$E_z = -\dfrac{dV}{dz}$. Derivando e simplificando,
$$E_z = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}},$$
o mesmo resultado da lista 1, feito lá pela integral do campo.`,
          medidas: [1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$V(z) = \dfrac{\sigma_0R}{2\varepsilon_0}\left[\ln\left(R + \sqrt{R^2 + z^2}\right) - \ln|z|\right]$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\sigma_0R^2}{2\varepsilon_0\,z\sqrt{R^2 + z^2}}\hat z$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial de distribuições contínuas', lab: 'distribuicoes' }],
        etapas: [
          {
            titulo: '(a) O potencial no eixo do disco',
            texto: r`**O que se pede.** O potencial num ponto do eixo do disco de raio $R$, com densidade superficial $\sigma(r) = \sigma_0\dfrac Rr$, a uma distância $z$ do centro.

**A ideia.** Cortar o disco em **anéis** finos e somar os potenciais deles, usando o resultado do exercício 5: um anel de raio $r$ e carga $q$ dá, no eixo,
$$V_\text{anel} = k_0\frac{q}{\sqrt{r^2 + z^2}}.$$
O potencial é um número, então os potenciais dos anéis simplesmente se somam.

**Montagem.** Um anel de raio $r$ e largura $dr$ tem área $2\pi r\,dr$ (desenrolado, é quase um retângulo de lados $2\pi r$ e $dr$). Sua carga:
$$dq = \sigma_0\frac Rr\,2\pi r\,dr = 2\pi\sigma_0R\,dr.$$
O $r$ cancela: todos os anéis de mesma largura têm a **mesma carga**.

**A conta.** Somando os anéis de $r = 0$ a $r = R$, com $2\pi k_0 = \dfrac{1}{2\varepsilon_0}$:
$$V = \int_0^R\frac{k_0\,2\pi\sigma_0R\,dr}{\sqrt{r^2 + z^2}} = \frac{\sigma_0R}{2\varepsilon_0}\int_0^R\frac{dr}{\sqrt{r^2 + z^2}}.$$
A primitiva dada no enunciado, com $x = r$ e $a = z$, é $\ln\left(r + \sqrt{r^2 + z^2}\right)$. Entre $0$ e $R$:
$$V(z) = \frac{\sigma_0R}{2\varepsilon_0}\left[\ln\left(R + \sqrt{R^2 + z^2}\right) - \ln|z|\right] = \frac{\sigma_0R}{2\varepsilon_0}\ln\frac{R + \sqrt{R^2 + z^2}}{|z|}.$$
(No limite de baixo, $r = 0$, a primitiva vale $\ln\sqrt{z^2} = \ln|z|$.)`,
            passo: 0,
          },
          {
            titulo: '(b) O campo no eixo, derivando o potencial',
            texto: r`**O que se pede.** O vetor campo no mesmo ponto, e comparar com o da Lista 1 (exercício 10).

**A ideia.** $\vec E = -\vec\nabla V$ (formulário). Pela simetria de rotação em volta do eixo, no eixo o campo só tem componente $z$, então $E_z = -\dfrac{dV}{dz}$. Tome $z > 0$.

**A conta.** Chame $S = \sqrt{R^2 + z^2}$, de modo que $\dfrac{dS}{dz} = \dfrac zS$. Derivando o colchete do item (a):
$$\frac{d}{dz}\Big[\ln(R + S) - \ln z\Big] = \frac{z/S}{R + S} - \frac1z.$$
Com denominador comum $zS(R + S)$, o numerador é $z^2 - S(R + S) = z^2 - SR - S^2 = -SR - R^2 = -R(R + S)$, porque $S^2 = R^2 + z^2$. Então
$$\frac{d}{dz}\Big[\cdots\Big] = -\frac{R(R + S)}{zS(R + S)} = -\frac{R}{zS}.$$
Com o sinal de menos de $E_z = -dV/dz$:
$$\vec E = \frac{\sigma_0R}{2\varepsilon_0}\cdot\frac{R}{z\sqrt{R^2 + z^2}}\,\hat z = \frac{\sigma_0R^2}{2\varepsilon_0z\sqrt{R^2 + z^2}}\,\hat z.$$

**A comparação.** É exatamente o resultado da Lista 1, obtido lá somando os **campos** dos anéis (vetores). Aqui somamos **potenciais** (números) e derivamos no fim: os dois caminhos levam ao mesmo lugar.`,
            passo: 1,
          },
        ],
        resultado: r`$V = \frac{\sigma_0R}{2\varepsilon_0}\ln\frac{R + \sqrt{R^2+z^2}}{z}$.`,
        errosComuns: ['Usar a carga $\\sigma\\,dr$ do anel sem o fator $2\\pi r$.'],
        oficial: { resposta: 'V = (σ₀R/2ε₀)[ln(√(R² + z²) + R) − ln|z|]; E = (σ₀/2ε₀) R²/(z√(R² + z²)) ẑ.' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Difícil',
      titulo: 'Barra com densidade λ₀x/a: um dipolo de longe',
      resumo: 'Q = 0; V(x_P) = (λ₀/4πε₀a)[x_P ln((x_P + a)/(x_P − a)) − 2a] ≈ λ₀a²/(6πε₀x_P²).',
      figura: { pagina: 2, recorte: [0.089, 0.368, 0.936, 0.646] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [2, -4, 16], alvo: [2, 0, 0] } },
      parametros: [
        { id: 'lam0', rotulo: 'Constante da densidade', simbolo: r`\lambda_0`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Meio comprimento', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 'xp', rotulo: 'Posição de P', simbolo: 'x_P', valor: 0.05, unidade: 'm', min: 0.035, max: 0.12, passo: 0.001 },
      ],
      objetos: [...barra7, { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xp', 0, 0], arraste: { param: 'xp', eixo: 'x' }, rotulo: 'P' }],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga total', simbolo: 'Q', expr: `1e12*(${Q7})`, unidade: 'pC', teoria: 0 },
        { rotulo: 'Potencial em P (40 trechos)', simbolo: r`V(x_P)`, expr: 'V(xp, 0, 0)', unidade: 'V', teoria: 'k0*lam0/a*(xp*ln((xp + a)/(xp - a)) - 2*a)' },
        { rotulo: 'Aproximação de dipolo', simbolo: r`\frac{kp}{x_P^2},\ p = \frac{2\lambda_0a^2}{3}`, expr: 'k0*(2*lam0*a^2/3)/xp^2', unidade: 'V' },
        { rotulo: 'Razão entre o exato e o dipolo', simbolo: r`V/V_\text{dip}`, expr: 'V(xp, 0, 0)/(k0*(2*lam0*a^2/3)/xp^2)', unidade: '' },
      ],
      passos: [
        { titulo: '(a) Carga', texto: r`$Q = \displaystyle\int_{-a}^a\lambda_0\frac xa\,dx = 0$: a metade positiva cancela a negativa.`, medidas: [0] },
        {
          titulo: '(b) Potencial',
          texto: r`$$V = \frac{\lambda_0}{4\pi\varepsilon_0a}\int_{-a}^a\frac{x\,dx}{x_P - x} = \frac{\lambda_0}{4\pi\varepsilon_0a}\left[x_P\ln\frac{x_P + a}{x_P - a} - 2a\right].$$
A cena aproxima a barra por 40 trechos de densidade constante.`,
          parametros: { xp: 0.05 },
          medidas: [1],
        },
        {
          titulo: '(c) De longe',
          texto: r`Com $\ln\dfrac{1 + u}{1 - u} \approx 2u + \dfrac23u^3$ e $u = a/x_P$, o termo $2a$ cancela e sobra
$$V \approx \frac{\lambda_0a^2}{6\pi\varepsilon_0x_P^2} = \frac{1}{4\pi\varepsilon_0}\frac{p}{x_P^2},\quad p = \frac{2\lambda_0a^2}{3}.$$
Carga total zero, mas positivos de um lado e negativos do outro: **um dipolo**. Afaste $P$ e veja a razão ir para 1.`,
          parametros: { xp: 0.12 },
          medidas: [1, 2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$Q = 0$` },
        { item: '(b)', texto: r`$V(x_P) = \dfrac{\lambda_0}{4\pi\varepsilon_0a}\left[x_P\ln\dfrac{x_P + a}{x_P - a} - 2a\right]$` },
        { item: '(c)', texto: r`$V \approx \dfrac{\lambda_0a^2}{6\pi\varepsilon_0x_P^2}$: o potencial de um dipolo $p = 2\lambda_0a^2/3$.` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de distribuições contínuas', lab: 'distribuicoes' },
          { texto: 'Dipolo elétrico', lab: 'dipolo' },
        ],
        etapas: [
          {
            titulo: '(a) A carga total da barra',
            texto: r`**O que se pede.** A carga total da barra de $-a$ a $a$ com densidade linear $\lambda(x) = \lambda_0\dfrac xa$.

**A ideia.** Densidade linear é carga por comprimento. Um pedacinho de comprimento $dx$ tem carga $dq = \lambda(x)\,dx$; a carga total é a soma (integral) sobre a barra.

**A conta.**
$$Q = \int_{-a}^{a}\lambda_0\frac xa\,dx = \frac{\lambda_0}{a}\left[\frac{x^2}{2}\right]_{-a}^{a} = \frac{\lambda_0}{a}\left(\frac{a^2}{2} - \frac{a^2}{2}\right) = 0.$$

**Em palavras.** A densidade é positiva na metade da direita ($x > 0$) e negativa na da esquerda, com o mesmo valor em módulo em posições espelhadas. As duas metades se cancelam: a barra é **neutra**, mas não está descarregada.`,
            passo: 0,
          },
          {
            titulo: '(b) O potencial num ponto do eixo',
            texto: r`**O que se pede.** O potencial no ponto $P$ do eixo $X$, em $x_P > a$, com zero no infinito.

**A ideia.** Somar os potenciais dos pedacinhos, cada um $dV = k_0\dfrac{dq}{r}$ (formulário: $V = k_0\dfrac qr$). O potencial é um número: as partes positivas e negativas entram com seu sinal, sem precisar de direções.

**Montagem.** O pedacinho em $x$ tem carga $\lambda_0\dfrac xa\,dx$ e está a uma distância $x_P - x$ de $P$ (positiva, porque $P$ está à direita da barra inteira):
$$V = \frac{k_0\lambda_0}{a}\int_{-a}^{a}\frac{x\,dx}{x_P - x}.$$

**A conta.** Truque algébrico: $\dfrac{x}{x_P - x} = -1 + \dfrac{x_P}{x_P - x}$ (confira somando as frações). Então
$$\int_{-a}^{a}\frac{x\,dx}{x_P - x} = -2a + x_P\Big[-\ln(x_P - x)\Big]_{-a}^{a} = -2a + x_P\ln\frac{x_P + a}{x_P - a}.$$
$$V(x_P) = \frac{\lambda_0}{4\pi\varepsilon_0a}\left[x_P\ln\frac{x_P + a}{x_P - a} - 2a\right].$$

**Conferindo.** O potencial é positivo: a metade positiva da barra está mais perto de $P$ que a negativa.`,
            passo: 1,
          },
          {
            titulo: '(c) Muito longe: o potencial de um dipolo',
            texto: r`**O que se pede.** Aproximar o resultado de (b) para $x_P \gg a$ e interpretar.

**A ideia.** Usar a série dada: $\ln\dfrac{1 + u}{1 - u} \approx 2u + \dfrac23u^3$ para $|u| \ll 1$. Dividindo em cima e embaixo por $x_P$, $\dfrac{x_P + a}{x_P - a} = \dfrac{1 + u}{1 - u}$ com $u = a/x_P$, pequeno.

**A conta.**
$$x_P\ln\frac{x_P + a}{x_P - a} \approx x_P\left(\frac{2a}{x_P} + \frac23\frac{a^3}{x_P^3}\right) = 2a + \frac{2a^3}{3x_P^2}.$$
O $2a$ cancela com o $-2a$ do colchete. Sobra
$$V \approx \frac{\lambda_0}{4\pi\varepsilon_0a}\cdot\frac{2a^3}{3x_P^2} = \frac{\lambda_0a^2}{6\pi\varepsilon_0x_P^2}.$$
Se a série tivesse parado no primeiro termo, o resultado seria zero: é preciso ir até o termo seguinte.

**Interpretação.** A carga total é zero (item a), então não há o termo $1/x_P$ de uma carga pontual. Mas há carga positiva de um lado e negativa do outro: de longe, a barra é um **dipolo**, cujo potencial no eixo cai com $1/x_P^2$. O momento de dipolo dela é $p = \displaystyle\int x\,dq = \frac{\lambda_0}{a}\int_{-a}^{a}x^2dx = \frac{2\lambda_0a^2}{3}$, e o potencial de um dipolo no seu eixo é $k_0\dfrac{p}{x_P^2}$, que dá exatamente o resultado acima.`,
            passo: 2,
          },
        ],
        resultado: r`$Q = 0$; de longe, potencial de dipolo.`,
        errosComuns: ['Concluir que, com carga zero, o potencial é zero.'],
        oficial: { resposta: 'Q = 0; V(x_P) = (λ₀/4πε₀a)[x_P ln((x_P + a)/(x_P − a)) − 2a]; V ≈ λ₀a²/(6πε₀x_P²), potencial de um dipolo p = 2λ₀a²/3.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Fio dentro de uma casca condutora neutra',
      resumo: 'E nulo no metal; σ = −λ/2πa e +λ/2πb; V = (λ/2πε₀) ln(a/s) dentro, 0 no metal, (λ/2πε₀) ln(b/s) fora.',
      figura: { pagina: 2, recorte: [0.089, 0.647, 0.936, 0.787] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade do fio', simbolo: r`\lambda`, valor: 1e-9, unidade: 'C/m', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.015, max: 0.025, passo: 0.001 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.035, unidade: 'm', min: 0.03, max: 0.045, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.01, unidade: 'm', min: 0.002, max: 0.058, passo: 0.001 },
      ],
      objetos: [
        { id: 'fio', tipo: 'linhaInfinita', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', rotulo: 'fio (λ)' },
        { id: 'sin', tipo: 'cilindroInfinito', lambda: '0-lam', ponto: [0, 0, 0], direcao: 'z', raio: 'a', oco: true, rotulo: 'superfície interna (−λ)' },
        { id: 'sout', tipo: 'cilindroInfinito', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', raio: 'b', oco: true, rotulo: 'superfície externa (+λ)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em s', simbolo: r`E(s)`, expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's > a && s < b ? 0 : lam/(2*pi*eps0*s)' },
        { rotulo: 'Densidade na superfície interna', simbolo: r`\sigma_a = -\frac{\lambda}{2\pi a}`, expr: "1e9*carga('sin')/(2*pi*a)", unidade: 'nC/m²', teoria: '1e9*(0-lam/(2*pi*a))' },
        { rotulo: 'Densidade na superfície externa', simbolo: r`\sigma_b = \frac{\lambda}{2\pi b}`, expr: "1e9*carga('sout')/(2*pi*b)", unidade: 'nC/m²', teoria: '1e9*lam/(2*pi*b)' },
        {
          rotulo: 'Potencial em s (zero em s = b)',
          simbolo: r`V(s) - V(b)`,
          expr: 'V(s, 0, 0) - V(b, 0, 0)',
          unidade: 'V',
          teoria: 's < a ? lam/(2*pi*eps0)*ln(a/s) : (s < b ? 0 : lam/(2*pi*eps0)*ln(b/s))',
        },
      ],
      graficos: [
        {
          titulo: 'Potencial V(s), com zero na casca',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.002, ate: 0.058, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'V', expr: 'V(ss, 0, 0) - V(b, 0, 0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Gauss',
          texto: r`Gaussiana cilíndrica de raio $s$: (i) dentro, só o fio: $E = \dfrac{\lambda}{2\pi\varepsilon_0s}$; (ii) no metal, $E = 0$ (equilíbrio); (iii) fora, a carga total dentro é $\lambda$ (a casca é neutra): $E = \dfrac{\lambda}{2\pi\varepsilon_0s}$ de novo.`,
          parametros: { s: 0.01 },
          medidas: [0],
        },
        {
          titulo: '(b) Cargas induzidas',
          texto: r`Para $E = 0$ no metal, a superfície interna precisa de $-\lambda$ por comprimento: $\sigma_a = -\dfrac{\lambda}{2\pi a}$. A casca é neutra, então a externa fica com $+\lambda$: $\sigma_b = \dfrac{\lambda}{2\pi b}$.`,
          medidas: [1, 2],
        },
        {
          titulo: '(c) Potencial',
          texto: r`Com zero em $s = b$: no metal, $V = 0$ (equipotencial). Dentro, integrando só até $a$, porque no metal o campo é nulo:
$$V(s) = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac as\quad(s < a).$$
Fora, $V(s) = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac bs$, negativo.`,
          parametros: { s: 0.01 },
          medidas: [3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`(i) e (iii): $\vec E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat s$; (ii): $\vec E = 0$` },
        { item: '(b)', texto: r`$\sigma_a = -\dfrac{\lambda}{2\pi a}$, $\sigma_b = \dfrac{\lambda}{2\pi b}$` },
        { item: '(c)', texto: r`(i) $V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac as$; (ii) $V = 0$; (iii) $V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac bs$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutores em equilíbrio', lab: 'condutores' },
          { texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' },
        ],
        etapas: [
          {
            titulo: '(a) O campo nas três regiões',
            texto: r`**O que se pede.** Pela lei de Gauss, o campo a uma distância $s$ do eixo, para (i) $s < a$, (ii) $a < s < b$ e (iii) $s > b$. Há um fio com densidade $\lambda$ no eixo de uma casca cilíndrica condutora **neutra**, de raios $a$ (interno) e $b$ (externo).

**A ideia.** Tudo é infinito e igual em volta do eixo: girar ou deslizar ao longo dele não muda nada. Então o campo é **radial** e seu módulo depende só de $s$. Gaussiana: cilindro coaxial de raio $s$ e comprimento $l$. Na lateral o fluxo é $E\cdot2\pi sl$; nas tampas é zero (campo paralelo a elas). Lei de Gauss (formulário): $E\cdot2\pi sl = Q_\text{int}/\varepsilon_0$.

**Região por região.**
- **(i) $s < a$:** dentro está só o fio, $Q_\text{int} = \lambda l$:
$$\vec E = \frac{\lambda}{2\pi\varepsilon_0s}\,\hat s.$$
- **(ii) $a < s < b$:** é o metal da casca. Num **condutor em equilíbrio** o campo no material é zero (se não fosse, as cargas livres se moveriam): $\vec E = 0$.
- **(iii) $s > b$:** dentro estão o fio e a casca inteira. A casca é neutra, então $Q_\text{int} = \lambda l$ de novo:
$$\vec E = \frac{\lambda}{2\pi\varepsilon_0s}\,\hat s.$$

**Repare.** A casca neutra não muda o campo fora dela: lá, é como se só houvesse o fio.`,
            passo: 0,
          },
          {
            titulo: '(b) As cargas induzidas na casca',
            texto: r`**O que se pede.** A densidade superficial de carga nas superfícies interna ($s = a$) e externa ($s = b$) da casca.

**A ideia.** Usar o campo zero no metal. Uma gaussiana cilíndrica com raio entre $a$ e $b$ fica toda dentro do metal: lá $E = 0$, o fluxo é zero, e a carga dentro dela tem de ser **zero**.

**Superfície interna.** Dentro dessa gaussiana estão o fio ($\lambda l$) e a superfície interna. Para somar zero, a superfície interna tem $-\lambda l$. Espalhada por igual (simetria) numa área $2\pi a\,l$:
$$\sigma_a = \frac{-\lambda l}{2\pi al} = -\frac{\lambda}{2\pi a}.$$

**Superfície externa.** A casca é neutra: se a interna tem $-\lambda$ por comprimento, a externa tem $+\lambda$:
$$\sigma_b = +\frac{\lambda}{2\pi b}.$$

**Em palavras.** O fio positivo atrai cargas negativas da casca para a face de dentro e empurra as positivas para a face de fora: **indução**.`,
            passo: 1,
          },
          {
            titulo: '(c) O potencial nas três regiões',
            texto: r`**O que se pede.** O potencial nas mesmas três regiões, com zero na superfície externa da casca, $s = b$.

**A ideia.** O potencial se obtém do campo por uma integral (é o inverso de $\vec E = -\vec\nabla V$, do formulário):
$$V(s_2) - V(s_1) = -\int_{s_1}^{s_2}E\,ds.$$
Andando no sentido do campo, o potencial cai. Começamos pelo ponto onde conhecemos $V$ (em $s = b$, $V = 0$) e vamos para as outras regiões.

**(ii) No metal, $a \le s \le b$.** O campo é zero, então o potencial não muda: todo o condutor tem o mesmo potencial do ponto $s = b$:
$$V = 0.$$

**(i) Dentro, $s < a$.** Partindo de $V(a) = 0$ (a superfície interna também é metal) e integrando o campo do fio de $a$ até $s$:
$$V(s) = 0 - \int_a^s\frac{\lambda}{2\pi\varepsilon_0s'}\,ds' = -\frac{\lambda}{2\pi\varepsilon_0}\ln\frac sa = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac as.$$
Positivo: perto do fio positivo o potencial é mais alto.

**(iii) Fora, $s > b$.** Partindo de $V(b) = 0$:
$$V(s) = -\int_b^s\frac{\lambda}{2\pi\varepsilon_0s'}\,ds' = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac bs.$$
Negativo, porque $s > b$: o potencial continua caindo para fora.

**Sobre o gabarito.** O gabarito da monitoria dá $\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac bs$ também para $s < a$. Isso integraria o campo do fio de $s$ até $b$ atravessando o metal, onde o campo é zero. Com essa expressão, o potencial em $s = a$ seria $\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac ba$, e não o zero do metal. O certo é $\ln\dfrac as$.`,
            passo: 2,
          },
        ],
        resultado: r`$V = \frac{\lambda}{2\pi\varepsilon_0}\ln(a/s)$ para $s < a$.`,
        errosComuns: ['Integrar o campo do fio até $b$ atravessando o metal, onde o campo é zero.'],
        oficial: {
          resposta: 'E = λ/(2πε₀s) ŝ dentro e fora, 0 no metal; σ_int = −λ/2πa, σ_ext = λ/2πb; V = (λ/2πε₀) ln(b/s) para s < a, 0 no metal, (λ/2πε₀) ln(b/s) para s > b.',
          observacao: 'Divergência em (c)(i): para s < a o certo é (λ/2πε₀) ln(a/s). Com ln(b/s), o potencial em s = a seria (λ/2πε₀) ln(b/a), e não o zero do metal: o campo nulo entre a e b não contribui na integral.',
        },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Esfera com densidade uniforme: ordenar potenciais',
      resumo: 'Com ρ > 0 o potencial cai para fora: V_A > V_B > V_C; com ρ < 0, ao contrário.',
      figura: { pagina: 2, recorte: [0.089, 0.789, 0.936, 0.91] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 11], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sg', rotulo: 'Sinal de ρ', valor: 1, opcoes: [{ valor: 1, rotulo: 'ρ > 0' }, { valor: -1, rotulo: 'ρ < 0' }] },
        { id: 'Q0', rotulo: 'Carga total (módulo)', simbolo: '|Q|', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', Q: 'sg*Q0', centro: [0, 0, 0], raio: 'R', rotulo: 'esfera isolante (ρ uniforme)' },
        { id: 'A', tipo: 'rotulo', pos: ['R/2', 0.004, 0], texto: 'A' },
        { id: 'B', tipo: 'rotulo', pos: ['R', 0.004, 0], texto: 'B' },
        { id: 'C', tipo: 'rotulo', pos: ['1.6*R', 0.004, 0], texto: 'C' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'V_A (r = R/2)', simbolo: 'V_A', expr: 'V(R/2, 0, 0)', unidade: 'V', teoria: 'k0*sg*Q0*(3*R^2 - (R/2)^2)/(2*R^3)' },
        { rotulo: 'V_B (r = R)', simbolo: 'V_B', expr: 'V(R, 0, 0)', unidade: 'V', teoria: 'k0*sg*Q0/R' },
        { rotulo: 'V_C (r = 1,6R)', simbolo: 'V_C', expr: 'V(1.6*R, 0, 0)', unidade: 'V', teoria: 'k0*sg*Q0/(1.6*R)' },
      ],
      passos: [
        {
          titulo: '(a) Isolante',
          texto: r`Carga espalhada no volume só fica parada num **isolante**: num condutor em equilíbrio a carga vai para a superfície e o campo dentro é zero.`,
        },
        {
          titulo: '(b) ρ > 0',
          texto: r`O campo aponta para fora em todo lugar (dentro e fora da esfera), e o potencial cai no sentido do campo: $V_A > V_B > V_C$.`,
          parametros: { sg: 1 },
          medidas: [0, 1, 2],
        },
        { titulo: '(c) ρ < 0', texto: r`O campo aponta para dentro e a ordem se inverte: $V_C > V_B > V_A$.`, parametros: { sg: -1 }, medidas: [0, 1, 2] },
      ],
      respostas: [
        { item: '(a)', texto: 'Isolante: num condutor a carga ficaria na superfície.' },
        { item: '(b)', texto: r`$V_A > V_B > V_C$` },
        { item: '(c)', texto: r`$V_C > V_B > V_A$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial e sentido do campo', lab: 'potencial' }],
        etapas: [
          {
            titulo: '(a) Condutora ou isolante?',
            texto: r`**O que se pede.** Dizer se uma esfera maciça com carga espalhada **pelo volume** (densidade $\rho$ constante) pode ser condutora.

**A ideia.** Num condutor, as cargas andam livremente. Em equilíbrio, o campo dentro do material tem de ser zero (senão as cargas se moveriam). Pela lei de Gauss (formulário), se $E = 0$ em todo o interior, qualquer gaussiana dentro do material tem fluxo zero e, portanto, carga zero dentro. Logo, num condutor em equilíbrio **não há carga no volume**: todo o excesso fica na superfície.

**Resposta.** A esfera é **isolante**. Só num isolante a carga fica presa onde foi posta, espalhada pelo volume.`,
            passo: 0,
          },
          {
            titulo: '(b) A ordem dos potenciais com ρ > 0',
            texto: r`**O que se pede.** Ordenar, sem calcular, os potenciais em $A$ (dentro da esfera), $B$ (na superfície) e $C$ (fora).

**A ideia.** O campo aponta no sentido em que o potencial **diminui**: $\vec E = -\vec\nabla V$ (formulário). Em uma dimensão, $E = -\dfrac{dV}{dr}$: se o campo aponta para fora ($E > 0$), $V$ cai à medida que $r$ cresce.

**Aplicando.** Com $\rho > 0$, a esfera tem carga positiva e simetria esférica. Pela lei de Gauss com uma esfera de raio $r$:
- dentro, a carga envolvida é positiva (é a parte da esfera até $r$), e o campo aponta para fora;
- fora, a carga envolvida é a total, positiva, e o campo também aponta para fora.

Então, indo do centro para fora, o potencial **cai o tempo todo**. Os pontos estão em ordem crescente de distância ao centro: $A$ dentro, $B$ na superfície e $C$ fora:
$$V_A > V_B > V_C.$$

**Cuidado.** Pense em distância ao centro: um ponto $A$ "dentro" está mais perto do centro que $B$, e $B$ mais que $C$. O potencial é máximo no **centro**, não na superfície.`,
            passo: 1,
          },
          {
            titulo: '(c) E se ρ fosse negativa?',
            texto: r`**O que se pede.** O que muda na ordem do item (b) com $\rho < 0$.

**A ideia.** Trocar o sinal de todas as cargas troca o sentido do campo em todo lugar, e troca o sinal de todos os potenciais.

**Aplicando.** Com carga negativa, a lei de Gauss dá campo apontando **para dentro**, tanto dentro quanto fora da esfera. Indo do centro para fora, andamos **contra** o campo, e o potencial **sobe**:
$$V_C > V_B > V_A.$$

O potencial agora é mínimo (o mais negativo) no centro.`,
            passo: 2,
          },
        ],
        resultado: r`Isolante; $V_A > V_B > V_C$, invertido com $\rho < 0$.`,
        errosComuns: ['Achar que o potencial é máximo na superfície.'],
        oficial: { resposta: '(a) Isolante; (b) V_A > V_B > V_C; (c) V_C > V_B > V_A.' },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Difícil',
      titulo: 'Esfera com ρ = ρ₀r/R: campo e potencial',
      resumo: 'E = ρ₀r²/4ε₀R dentro e ρ₀R³/4ε₀r² fora; V = ρ₀R²/3ε₀ − ρ₀r³/12ε₀R dentro e ρ₀R³/4ε₀r fora.',
      figura: { pagina: 3, recorte: [0.08, 0.062, 0.936, 0.186] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Constante da densidade', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao centro', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.002, max: 0.075, passo: 0.001 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', centro: [0, 0, 0], raio: 'R', rho: 'rho0*r/R', rotulo: 'esfera (ρ = ρ₀r/R)' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 'r' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em r', simbolo: 'E(r)', expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 's <= R ? rho0*s^2/(4*eps0*R) : rho0*R^3/(4*eps0*s^2)' },
        { rotulo: 'Potencial em r', simbolo: 'V(r)', expr: 'V(s, 0, 0)', unidade: 'V', teoria: 's <= R ? rho0*R^2/(3*eps0) - rho0*s^3/(12*eps0*R) : rho0*R^3/(4*eps0*s)' },
        { rotulo: 'Carga total', simbolo: r`Q = \pi\rho_0R^3`, expr: "1e9*carga('esf')", unidade: 'nC', teoria: '1e9*pi*rho0*R^3' },
      ],
      graficos: [
        {
          titulo: 'E(r) e V(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: 0.075, rotulo: 'r', unidade: 'm', marca: 's' },
          series: [
            { rotulo: 'E', expr: 'mag(E(rr, 0, 0))', unidade: 'V/m' },
            { rotulo: 'V', expr: 'V(rr, 0, 0)', unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: '(a) Gauss',
          texto: r`Carga até $r$: $q(r) = \displaystyle\int_0^r\rho_0\frac{r'}{R}4\pi r'^2dr' = \frac{\pi\rho_0r^4}{R}$. Então
$$E = \frac{q(r)}{4\pi\varepsilon_0r^2} = \frac{\rho_0r^2}{4\varepsilon_0R}\ (r \le R),\qquad E = \frac{\rho_0R^3}{4\varepsilon_0r^2}\ (r > R).$$`,
          medidas: [0, 2],
        },
        {
          titulo: '(b) Potencial',
          texto: r`Fora, $V = \dfrac{\rho_0R^3}{4\varepsilon_0r}$. Dentro, somando a integral de $r$ até $R$:
$$V = \frac{\rho_0R^2}{3\varepsilon_0} - \frac{\rho_0r^3}{12\varepsilon_0R}.$$`,
          medidas: [1],
        },
        { titulo: '(c) Gráficos', texto: r`$E$ cresce como $r^2$ até a superfície e depois cai como $1/r^2$. $V$ é máximo no centro e cai sempre, sem quebras.`, medidas: [0, 1] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac{\rho_0r^2}{4\varepsilon_0R}\hat r$ ($r \le R$); $\vec E = \dfrac{\rho_0R^3}{4\varepsilon_0r^2}\hat r$ ($r > R$)` },
        { item: '(b)', texto: r`$V = \dfrac{\rho_0R^2}{3\varepsilon_0} - \dfrac{\rho_0r^3}{12\varepsilon_0R}$ ($r \le R$); $V = \dfrac{\rho_0R^3}{4\varepsilon_0r}$ ($r > R$)` },
        { item: '(c)', texto: 'Veja os gráficos: E sobe como r² e cai como 1/r²; V decresce sempre.' },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Densidade de carga não uniforme', lab: 'densidade' },
          { texto: 'Potencial pela integral do campo', lab: 'potencial' },
        ],
        etapas: [
          {
            titulo: '(a) O campo dentro e fora da esfera',
            texto: r`**O que se pede.** Pela lei de Gauss, o campo a uma distância $r$ do centro de uma esfera de raio $R$ com densidade $\rho(r) = \rho_0\dfrac rR$, para (i) $r \le R$ e (ii) $r > R$.

**A ideia.** A densidade só depende de $r$: **simetria esférica**. O campo é radial e seu módulo depende só de $r$. Numa gaussiana esférica de raio $r$, concêntrica, o fluxo é $E\cdot4\pi r^2$. Lei de Gauss (formulário):
$$E\cdot4\pi r^2 = \frac{q(r)}{\varepsilon_0},$$
em que $q(r)$ é a carga **dentro** da gaussiana.

**Montagem: a carga até o raio r.** Como $\rho$ varia com o raio, corta-se a esfera em **cascas** finas de raio $r'$ e espessura $dr'$, de volume $4\pi r'^2\,dr'$ (área da esfera × espessura):
$$q(r) = \int_0^r\rho_0\frac{r'}{R}\,4\pi r'^2\,dr' = \frac{4\pi\rho_0}{R}\cdot\frac{r^4}{4} = \frac{\pi\rho_0r^4}{R}.$$
A carga total é $Q = q(R) = \pi\rho_0R^3$.

**(i) Dentro, $r \le R$.**
$$E = \frac{q(r)}{4\pi\varepsilon_0r^2} = \frac{\pi\rho_0r^4/R}{4\pi\varepsilon_0r^2}\quad\Rightarrow\quad\vec E = \frac{\rho_0r^2}{4\varepsilon_0R}\,\hat r.$$

**(ii) Fora, $r > R$.** A gaussiana envolve a esfera inteira, $Q = \pi\rho_0R^3$:
$$\vec E = \frac{Q}{4\pi\varepsilon_0r^2}\,\hat r = \frac{\rho_0R^3}{4\varepsilon_0r^2}\,\hat r.$$

**Conferindo.** Em $r = R$, as duas dão $\dfrac{\rho_0R}{4\varepsilon_0}$: o campo é contínuo na superfície.`,
            passo: 0,
          },
          {
            titulo: '(b) O potencial dentro e fora',
            texto: r`**O que se pede.** O potencial nas mesmas duas regiões, com zero no infinito.

**A ideia.** O potencial sai do campo por integração (o inverso de $\vec E = -\vec\nabla V$):
$$V(r) = V(r_\text{ref}) + \int_r^{r_\text{ref}}E\,dr'.$$
Como o zero está no infinito, começa-se por **fora** e depois entra-se na esfera, emendando os dois resultados na superfície.

**(ii) Fora, $r > R$.** Fora, o campo é igual ao de uma carga pontual $Q$ no centro, e o potencial também (formulário: $V = k_0\dfrac qr$):
$$V(r) = \frac{Q}{4\pi\varepsilon_0r} = \frac{\rho_0R^3}{4\varepsilon_0r}.$$
Na superfície: $V(R) = \dfrac{\rho_0R^2}{4\varepsilon_0}$.

**(i) Dentro, $r \le R$.** Parte-se de $V(R)$ e soma-se a integral do campo de dentro, de $r$ até $R$:
$$V(r) = \frac{\rho_0R^2}{4\varepsilon_0} + \int_r^R\frac{\rho_0r'^2}{4\varepsilon_0R}\,dr' = \frac{\rho_0R^2}{4\varepsilon_0} + \frac{\rho_0}{12\varepsilon_0R}\left(R^3 - r^3\right).$$
Juntando os termos com $R^2$ ($\tfrac14 + \tfrac1{12} = \tfrac13$):
$$V(r) = \frac{\rho_0R^2}{3\varepsilon_0} - \frac{\rho_0r^3}{12\varepsilon_0R}.$$

**Conferindo.** Em $r = R$: $\dfrac{\rho_0R^2}{3\varepsilon_0} - \dfrac{\rho_0R^2}{12\varepsilon_0} = \dfrac{\rho_0R^2}{4\varepsilon_0}$, igual ao de fora. O máximo é no centro, $\dfrac{\rho_0R^2}{3\varepsilon_0}$.`,
            passo: 1,
          },
          {
            titulo: '(c) Os gráficos de V e de E',
            texto: r`**O que se pede.** Esboçar o potencial e a intensidade do campo em função de $r$.

**O campo $E(r)$.**
- De $0$ a $R$: $E = \dfrac{\rho_0r^2}{4\varepsilon_0R}$, uma parábola que começa em zero no centro e cresce.
- Em $r = R$: o máximo, $\dfrac{\rho_0R}{4\varepsilon_0}$.
- Para $r > R$: cai como $1/r^2$.
- Sem salto em $r = R$: a carga está num volume, não numa superfície.

**O potencial $V(r)$.**
- Máximo no centro, $\dfrac{\rho_0R^2}{3\varepsilon_0}$, com tangente horizontal ali (o campo, que é a inclinação com sinal trocado, é zero no centro).
- Cai devagar dentro da esfera (como $-r^3$) e depois como $1/r$ fora, tendendo a zero.
- É contínuo e sem "quina" em $r = R$: a inclinação de $V$ é $-E$, e $E$ é contínuo ali.

**Ligação entre os dois.** Em cada ponto, a inclinação do gráfico de $V$ é $-E$: onde o campo é mais forte (em $r = R$), o potencial cai mais depressa.`,
            passo: 2,
          },
        ],
        resultado: r`(a) $E = \dfrac{\rho_0r^2}{4\varepsilon_0R}$ dentro, $\dfrac{\rho_0R^3}{4\varepsilon_0r^2}$ fora. (b) $V = \dfrac{\rho_0R^2}{3\varepsilon_0} - \dfrac{\rho_0r^3}{12\varepsilon_0R}$ dentro, $\dfrac{\rho_0R^3}{4\varepsilon_0r}$ fora. (c) $E$ máximo em $R$; $V$ máximo no centro.`,
        errosComuns: ['Usar a carga total dentro da esfera, no lugar de q(r).'],
        oficial: { resposta: 'E = ρ₀r²/(4ε₀R) dentro e ρ₀R³/(4ε₀r²) fora; V = ρ₀R²/3ε₀ − ρ₀r³/12ε₀R dentro e ρ₀R³/4ε₀r fora.' },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Médio',
      titulo: 'Potencial de uma placa espessa',
      resumo: 'V = −ρ₀z²/2ε₀ dentro e ρ₀d²/2ε₀ − ρ₀d|z|/ε₀ fora, com zero no plano médio.',
      figura: { pagina: 3, recorte: [0.08, 0.187, 0.936, 0.265] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', camera: { pos: [9, 4, 6], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Densidade de carga', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'd', rotulo: 'Meia espessura', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'zp', rotulo: 'Altura', simbolo: 'z', valor: 0.035, unidade: 'm', min: -0.05, max: 0.05, passo: 0.001 },
        { id: 'Lg', rotulo: 'Lado do cubo gaussiano', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.01, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'Ez', tipo: 'campoE', valor: E11, potencial: V11('z'), rotulo: 'campo da placa (lista 2)' },
        { id: 'topo', tipo: 'placa', sigma: 0, centro: [0, 0, 'd'], normal: 'z', largura: 0.1, altura: 0.1, rotulo: 'z = d' },
        { id: 'base', tipo: 'placa', sigma: 0, centro: [0, 0, '0-d'], normal: 'z', largura: 0.1, altura: 0.1, rotulo: 'z = −d' },
        { id: 'sobe', tipo: 'caminho', pontos: [[0.03, 0, 0], [0.03, 0, 'd'], [0.03, 0, 'zp']], rotulo: 'de z = 0 até z' },
        { id: 'g', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: 'Lg', campo: 'E', rotulo: 'cubo gaussiano' },
      ],
      visual: { setasE: true, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Potencial em z', simbolo: 'V(z)', expr: 'V(0, 0, zp)', unidade: 'V', teoria: V11('zp') },
        { rotulo: 'O mesmo, integrando E de 0 até z', simbolo: r`-\int_0^z E\,dz`, expr: "0-intE('sobe')", unidade: 'V', teoria: V11('zp') },
        { rotulo: 'Carga no cubo gaussiano (ε₀ vezes o fluxo)', simbolo: r`\varepsilon_0\Phi`, expr: "1e12*eps0*fluxo('g')", unidade: 'pC', teoria: '1e12*rho0*Lg^2*min(Lg, 2*d)' },
      ],
      graficos: [
        {
          titulo: 'Potencial V(z)',
          tipo: 'perfil',
          x: { variavel: 'zz', de: -0.05, ate: 0.05, rotulo: 'z', unidade: 'm', marca: 'zp' },
          series: [{ rotulo: 'V', expr: V11('zz'), unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'O campo',
          texto: r`Da lista 2: $E_z = \rho_0z/\varepsilon_0$ dentro ($|z| \le d$) e $E_z = \pm\rho_0d/\varepsilon_0$ fora. O cubo gaussiano confere: o fluxo vezes $\varepsilon_0$ é a carga dentro dele.`,
          medidas: [2],
        },
        {
          titulo: 'Dentro',
          texto: r`$V(z) = -\displaystyle\int_0^zE\,dz' = -\frac{\rho_0z^2}{2\varepsilon_0}$, com zero no plano médio.`,
          parametros: { zp: 0.01 },
          medidas: [0, 1],
        },
        {
          titulo: 'Fora',
          texto: r`Partindo de $V(d) = -\dfrac{\rho_0d^2}{2\varepsilon_0}$ e integrando o campo constante:
$$V(z) = \frac{\rho_0d^2}{2\varepsilon_0} - \frac{\rho_0d|z|}{\varepsilon_0}.$$
O potencial cai sem limite: placa infinita não permite zero no infinito.`,
          parametros: { zp: 0.035 },
          medidas: [0, 1],
        },
      ],
      respostas: [{ item: 'V', texto: r`$V = -\dfrac{\rho_0z^2}{2\varepsilon_0}$ ($|z| \le d$); $V = \dfrac{\rho_0d^2}{2\varepsilon_0} - \dfrac{\rho_0d|z|}{\varepsilon_0}$ ($|z| > d$)` }],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria plana', lab: 'planos' },
          { texto: 'Potencial pela integral do campo', lab: 'potencial' },
        ],
        etapas: [
          {
            titulo: 'V em todo o espaço',
            texto: r`**O que se pede.** O potencial da placa infinita de espessura $2d$ (de $z = -d$ a $z = d$), com densidade $\rho_0$ uniforme, em todo o espaço, com o zero no plano do meio ($z = 0$).

**O ponto de partida: o campo** (exercício 10 da Lista 2, pela lei de Gauss com uma "lata" simétrica atravessando a placa). O campo aponta ao longo de $z$, para longe do plano do meio:
- dentro ($|z| \le d$): $E_z = \dfrac{\rho_0z}{\varepsilon_0}$;
- fora ($|z| > d$): $E_z = \pm\dfrac{\rho_0d}{\varepsilon_0}$, com o sinal de $z$.

**A ideia.** O potencial sai do campo por integração, $V(z) - V(0) = -\displaystyle\int_0^zE_z\,dz'$: é o inverso de $E_z = -\dfrac{dV}{dz}$ (formulário: $\vec E = -\vec\nabla V$). Por que não pôr o zero no infinito, como de costume? Porque a placa é infinita: fora dela o campo é constante e não diminui, e a integral até o infinito não converge. Por isso o enunciado põe o zero em $z = 0$.

**Dentro, $|z| \le d$.**
$$V(z) = -\int_0^z\frac{\rho_0z'}{\varepsilon_0}\,dz' = -\frac{\rho_0z^2}{2\varepsilon_0}.$$
Uma parábola de cabeça para baixo, com máximo ($V = 0$) no plano do meio. O resultado vale para $z$ positivo e negativo.

**Fora, $z > d$.** Parte-se do valor na face, $V(d) = -\dfrac{\rho_0d^2}{2\varepsilon_0}$, e integra-se o campo constante:
$$V(z) = -\frac{\rho_0d^2}{2\varepsilon_0} - \frac{\rho_0d}{\varepsilon_0}(z - d) = \frac{\rho_0d^2}{2\varepsilon_0} - \frac{\rho_0d\,z}{\varepsilon_0}.$$
Para $z < -d$, por simetria, troca-se $z$ por $|z|$:
$$V(z) = \frac{\rho_0d^2}{2\varepsilon_0} - \frac{\rho_0d|z|}{\varepsilon_0}\quad(|z| > d).$$

**Conferindo.** Em $z = d$, as duas expressões dão $-\dfrac{\rho_0d^2}{2\varepsilon_0}$: o potencial é contínuo, e a inclinação também (o campo é contínuo). Fora, o potencial cai em linha reta e sem limite: é o efeito de uma placa infinita.`,
            passo: 1,
          },
        ],
        resultado: r`Parábola dentro, retas fora.`,
        errosComuns: ['Tentar pôr o zero no infinito: para a placa infinita a integral diverge.'],
        oficial: { resposta: 'V = −ρz²/(2ε₀) para |z| ≤ d; V = ρd²/(2ε₀) − ρd|z|/ε₀ para |z| > d.' },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Fácil',
      titulo: 'Condutores perto de uma carga pontual',
      resumo: 'Condutor em equilíbrio: E = 0 dentro e um só potencial, que não precisa ser zero.',
      figura: { pagina: 3, recorte: [0.08, 0.266, 0.936, 0.628] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [2, 0, 15], alvo: [2, 0, 0] } },
      parametros: [
        { id: 'q', rotulo: 'Carga pontual', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 5e-9, passo: 1e-10 },
        { id: 'D', rotulo: 'Distância ao centro da esfera', simbolo: 'D', valor: 0.05, unidade: 'm', min: 0.04, max: 0.06, passo: 0.001 },
        { id: 'R', rotulo: 'Raio da esfera condutora', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
      ],
      objetos: [
        { id: 'q0', tipo: 'carga', q: 'q', pos: [0, 0, 0], rotulo: '+q' },
        { id: 'esf', tipo: 'esfera', Q: 0, centro: ['D', 0, 0], raio: 'R', oca: true, rotulo: 'esfera condutora neutra' },
        { id: 'im1', tipo: 'carga', q: '0-q*R/D', pos: [POS12, 0, 0], rotulo: 'imagem −qR/D' },
        { id: 'im2', tipo: 'carga', q: 'q*R/D', pos: ['D', 0, 0], rotulo: 'imagem +qR/D' },
      ],
      visual: { linhasE: true, setasE: false, fontes: ['q0', 'im1', 'im2'] },
      medidas: [
        { rotulo: 'Potencial no ponto da esfera mais perto da carga', simbolo: 'V_1', expr: 'V(D - R, 0, 0)', unidade: 'V', teoria: 'k0*q/D' },
        { rotulo: 'Potencial no ponto mais longe', simbolo: 'V_2', expr: 'V(D + R, 0, 0)', unidade: 'V', teoria: 'k0*q/D' },
        { rotulo: 'Potencial no topo da esfera', simbolo: 'V_3', expr: 'V(D, R, 0)', unidade: 'V', teoria: 'k0*q/D' },
      ],
      passos: [
        {
          titulo: '(a) Objeto I',
          texto: r`Há uma linha de campo **dentro** do objeto I (de $D$ para $E$). Num condutor em equilíbrio o campo interno é zero; então o objeto I não pode ser um condutor em equilíbrio.`,
        },
        {
          titulo: '(b) Objeto II',
          texto: r`Sem campo dentro, todo o condutor tem o mesmo potencial. Se $V_A > V_B$, o objeto II não é um condutor em equilíbrio. A cena mostra uma esfera condutora perto de uma carga: os três pontos da superfície têm o mesmo potencial.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: '(c) Objeto III',
          texto: r`Não: o condutor é equipotencial, mas o valor pode ser qualquer um. A esfera neutra da cena fica em $V = kq/D$, longe de zero. (A cena usa o método das imagens: duas cargas fictícias dentro da esfera reproduzem o campo do lado de fora.)`,
          medidas: [0],
        },
      ],
      respostas: [
        { item: '(a)', texto: 'Não: há campo no interior dele.' },
        { item: '(b)', texto: 'Não: um condutor em equilíbrio é equipotencial.' },
        { item: '(c)', texto: 'Não: V_C pode ter qualquer valor, desde que seja o mesmo em todo o objeto.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Condutores em equilíbrio', lab: 'condutores' }],
        etapas: [
          {
            titulo: '(a) O objeto I pode ser condutor em equilíbrio?',
            texto: r`**O que se pede.** Olhando as linhas de campo da figura, dizer se o objeto I pode ser um condutor em equilíbrio eletrostático.

**A ideia.** Duas propriedades de um condutor em equilíbrio:
- o campo no **interior** do material é zero. Se não fosse, as cargas livres do condutor seriam empurradas e não haveria equilíbrio;
- por consequência, o condutor inteiro tem um só potencial: entre dois pontos dele, $\Delta V = -\int\vec E\cdot d\vec l = 0$, porque o campo é zero pelo caminho.

**Lendo a figura.** Há uma linha de campo que passa **por dentro** do objeto I (do ponto $D$ ao ponto $E$). Isso quer dizer que há campo no interior dele.

**Resposta.** **Não.** Com campo no interior, ele não é um condutor em equilíbrio. (Pode ser um isolante, ou um condutor com cargas ainda se movendo.)`,
            passo: 0,
          },
          {
            titulo: '(b) Com V(A) > V(B), o objeto II pode ser condutor?',
            texto: r`**O que se pede.** Se os pontos $A$ e $B$ do objeto II têm $V_A > V_B$, ele pode ser um condutor em equilíbrio?

**A ideia.** Num condutor em equilíbrio o campo interno é zero. Indo de $A$ até $B$ por dentro do material,
$$V_B - V_A = -\int_A^B\vec E\cdot d\vec l = 0,$$
porque $\vec E = 0$ em todo o caminho. Logo todos os pontos de um condutor em equilíbrio têm o **mesmo** potencial: ele é uma **equipotencial**.

**Resposta.** **Não.** Se $V_A > V_B$, o objeto não é equipotencial; então não é um condutor em equilíbrio.`,
            passo: 1,
          },
          {
            titulo: '(c) Se III é condutor, V(C) tem de ser zero?',
            texto: r`**O que se pede.** Sendo o objeto III um condutor em equilíbrio, o potencial dele, $V_C$, é necessariamente zero?

**A ideia.** "Equipotencial" quer dizer que o potencial tem o **mesmo valor** em todo o condutor; não diz **qual** valor. Esse valor depende da carga do condutor, das outras cargas por perto e de onde foi posto o zero do potencial.

**Um exemplo.** Uma esfera condutora neutra a uma distância $D$ de uma carga pontual $+q$ (com zero no infinito) fica toda no mesmo potencial, mas esse potencial é $k_0q/D$, e não zero. Ela está "mergulhada" no potencial positivo da carga.

**Resposta.** **Não necessariamente.** $V_C$ pode ter qualquer valor, desde que seja o mesmo em todo o objeto III.`,
            passo: 2,
          },
        ],
        resultado: r`(a) não; (b) não; (c) não necessariamente.`,
        errosComuns: ['Confundir "equipotencial" com "potencial zero".'],
        oficial: { resposta: '(a) Não, há campo no interior; (b) não, V_A deveria ser igual a V_B; (c) não necessariamente, basta ser o mesmo em todo o objeto.' },
      },
    },

    /* ───────────────────────── 13 ───────────────────────── */
    {
      id: 'e13',
      numero: '13',
      secao: 'Médio',
      titulo: 'Do potencial ao campo e à carga',
      resumo: 'E = −2B r⃗; W = −3qBz₀²; carga na esfera de raio R: Q = −8πε₀BR³.',
      figura: { pagina: 3, recorte: [0.08, 0.629, 0.936, 0.753] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [8, 6, 10], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Bc', rotulo: 'Constante B', simbolo: 'B', valor: 1000, unidade: 'V/m²', min: 200, max: 5000, passo: 50 },
        { id: 'R', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.01, max: 0.06, passo: 0.001 },
        { id: 'z0', rotulo: 'Altura inicial', simbolo: 'z_0', valor: 0.02, unidade: 'm', min: 0.005, max: 0.03, passo: 0.001 },
        { id: 'q', rotulo: 'Carga deslocada', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 1e-9, max: 1e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'Eq', tipo: 'campoE', valor: ['0-2*Bc*x', '0-2*Bc*y', '0-2*Bc*z'], potencial: 'Bc*(x^2 + y^2 + z^2)', rotulo: 'E = −∇V' },
        { id: 'sobe', tipo: 'caminho', pontos: [[0, 0, 'z0'], [0, 0, '2*z0']], rotulo: 'de z₀ até 2z₀' },
        { id: 'g', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'R', campo: 'E', rotulo: 'esfera de raio R' },
      ],
      visual: { setasE: true },
      medidas: [
        { rotulo: 'Campo em (0, 0, z₀)', simbolo: r`E_z = -2Bz_0`, expr: 'z(E(0, 0, z0))', unidade: 'V/m', teoria: '0-2*Bc*z0' },
        { rotulo: 'Trabalho da força elétrica (q vezes a integral de E)', simbolo: r`W = q\int\vec E\cdot d\vec l`, expr: "1e9*q*intE('sobe')", unidade: 'nJ', teoria: '1e9*(0-3*q*Bc*z0^2)' },
        { rotulo: 'Carga dentro da esfera (ε₀ vezes o fluxo)', simbolo: r`Q = \varepsilon_0\oint\vec E\cdot d\vec A`, expr: "1e15*eps0*fluxo('g')", unidade: 'fC', teoria: '1e15*(0-8*pi*eps0*Bc*R^3)' },
      ],
      passos: [
        { titulo: '(a) Gradiente', texto: r`$\vec E = -\nabla V = -2B(x\hat x + y\hat y + z\hat z) = -2B\vec r$: radial, para o centro.`, medidas: [0] },
        {
          titulo: '(b) Trabalho',
          texto: r`$W = -q[V(2z_0) - V(z_0)] = -q\,B(4z_0^2 - z_0^2) = -3qBz_0^2$. A simulação integra $q\vec E\cdot d\vec l$ pelo caminho.`,
          medidas: [1],
        },
        {
          titulo: '(c) Carga',
          texto: r`Na esfera, $\vec E\cdot\hat r = -2BR$ em todo ponto: $\Phi = -2BR\cdot4\pi R^2$ e
$$Q = \varepsilon_0\Phi = -8\pi\varepsilon_0BR^3.$$
Negativa, como o campo apontando para dentro sugere. Dá o mesmo com $\rho = -\varepsilon_0\nabla^2V = -6\varepsilon_0B$ vezes o volume.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = -2B(x\hat x + y\hat y + z\hat z)$` },
        { item: '(b)', texto: r`$W = -3qBz_0^2$` },
        { item: '(c)', texto: r`$Q = -8\pi\varepsilon_0BR^3$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo como gradiente do potencial', lab: 'potencial' },
          { texto: 'Lei de Gauss', lab: 'gauss' },
        ],
        etapas: [
          {
            titulo: '(a) O campo a partir do potencial',
            texto: r`**O que se pede.** O vetor campo elétrico na região onde o potencial é $V(x, y, z) = B(x^2 + y^2 + z^2)$, com $B > 0$.

**A ideia.** O campo é menos o **gradiente** do potencial (formulário):
$$\vec E = -\vec\nabla V = -\left(\frac{\partial V}{\partial x}\,\hat x + \frac{\partial V}{\partial y}\,\hat y + \frac{\partial V}{\partial z}\,\hat z\right).$$
Cada derivada parcial é a derivada comum em relação a uma variável, tratando as outras como constantes. O gradiente aponta para onde $V$ cresce mais depressa; o sinal de menos faz o campo apontar para onde $V$ **diminui**.

**A conta.**
$$\frac{\partial V}{\partial x} = 2Bx,\qquad\frac{\partial V}{\partial y} = 2By,\qquad\frac{\partial V}{\partial z} = 2Bz.$$
$$\vec E = -2B\left(x\,\hat x + y\,\hat y + z\,\hat z\right) = -2B\,\vec r.$$

**Interpretação.** $\vec r$ é o vetor posição. O campo aponta **para a origem** em todo lugar, com módulo $2Br$, que cresce com a distância. O potencial é mínimo na origem e cresce para todos os lados.`,
            passo: 0,
          },
          {
            titulo: '(b) O trabalho de (0, 0, z₀) a (0, 0, 2z₀)',
            texto: r`**O que se pede.** O trabalho da força elétrica ao levar uma carga $q$ do ponto $(0, 0, z_0)$ ao ponto $(0, 0, 2z_0)$.

**A ideia.** A força elétrica é conservativa, e seu trabalho é menos a variação da energia potencial $U = qV$:
$$W = -\Delta U = -q\,\big[V(\text{final}) - V(\text{inicial})\big].$$
Não importa o caminho, só os pontos de saída e de chegada.

**A conta.**
- $V(0, 0, z_0) = Bz_0^2$;
- $V(0, 0, 2z_0) = B(2z_0)^2 = 4Bz_0^2$.
$$W = -q\,\big(4Bz_0^2 - Bz_0^2\big) = -3qBz_0^2.$$

**Conferindo com o campo.** Pelo eixo $z$, $E_z = -2Bz$ e $W = \displaystyle\int_{z_0}^{2z_0}qE_z\,dz = -2qB\left[\frac{z^2}{2}\right]_{z_0}^{2z_0} = -3qBz_0^2$. Mesmo resultado. Para $q > 0$ é negativo: a carga é levada para longe da origem, **contra** o campo, que aponta para a origem.`,
            passo: 1,
          },
          {
            titulo: '(c) A carga dentro da esfera de raio R',
            texto: r`**O que se pede.** A carga total dentro de uma região esférica de raio $R$ centrada na origem.

**A ideia.** Lei de Gauss (formulário): a carga dentro de uma superfície fechada é $\varepsilon_0$ vezes o fluxo do campo por ela,
$$Q_\text{int} = \varepsilon_0\oint_S\vec E\cdot d\vec A.$$
Conhecemos o campo do item (a) em todo lugar, então basta calcular o fluxo pela esfera.

**Montagem.** Na superfície da esfera, $|\vec r| = R$ e o vetor área $d\vec A$ aponta para fora, na direção $\hat r$. Do item (a), $\vec E = -2B\vec r = -2BR\,\hat r$ na superfície. Então
$$\vec E\cdot d\vec A = -2BR\,dA,$$
o mesmo em todo ponto da esfera. (É aqui que entram as coordenadas esféricas sugeridas: $dA = R^2\sin\theta\,d\theta\,d\varphi$, cuja integral dá a área $4\pi R^2$.)

**A conta.**
$$\oint\vec E\cdot d\vec A = -2BR\cdot4\pi R^2 = -8\pi BR^3\quad\Rightarrow\quad Q = -8\pi\varepsilon_0BR^3.$$

**Conferindo.** Negativa, como sugere o campo apontando para dentro (as linhas de campo **chegam** em carga negativa). A carga cresce com $R^3$, ou seja, com o volume: ela está espalhada uniformemente pela região, com densidade $\rho = \dfrac{Q}{\tfrac43\pi R^3} = -6\varepsilon_0B$.`,
            passo: 2,
          },
        ],
        resultado: r`$\vec E = -2B\vec r$; $W = -3qBz_0^2$; $Q = -8\pi\varepsilon_0BR^3$.`,
        errosComuns: ['Esquecer o sinal de menos em $\\vec E = -\\nabla V$.'],
        oficial: { resposta: 'E = −2B(x x̂ + y ŷ + z ẑ); W = −3qBz₀²; Q = −8πε₀BR³.' },
      },
    },

    /* ───────────────────────── 14 ───────────────────────── */
    {
      id: 'e14',
      numero: '14',
      secao: 'Médio',
      titulo: 'Duas esferas ligadas por um fio',
      resumo: 'Mesmo potencial: q_a = Qa/(a + b), q_b = Qb/(a + b), e E_a/E_b = b/a.',
      figura: { pagina: 3, recorte: [0.08, 0.754, 0.936, 0.9] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, -3, 15], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga inicial da esfera a', simbolo: 'Q', valor: 3e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Raio da esfera a', simbolo: 'a', valor: 0.015, unidade: 'm', min: 0.01, max: 0.025, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da esfera b', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'A', tipo: 'esfera', Q: 'Q0*a/(a + b)', centro: [-0.045, 0, 0], raio: 'a', oca: true, rotulo: 'esfera a' },
        { id: 'B', tipo: 'esfera', Q: 'Q0*b/(a + b)', centro: [0.035, 0, 0], raio: 'b', oca: true, rotulo: 'esfera b' },
        { id: 'fio', tipo: 'fio', I: 0, a: ['-0.045 + a', 0, 0], b: ['0.035 - b', 0, 0], rotulo: 'fio' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Potencial da esfera a (pelo próprio campo)', simbolo: r`V_a = \frac{kq_a}{a}`, expr: "Vde('A', -0.045, 0, 0)", unidade: 'V', teoria: 'k0*Q0/(a + b)' },
        { rotulo: 'Potencial da esfera b', simbolo: r`V_b = \frac{kq_b}{b}`, expr: "Vde('B', 0.035, 0, 0)", unidade: 'V', teoria: 'k0*Q0/(a + b)' },
        { rotulo: 'Razão entre os campos nas superfícies', simbolo: r`\frac{E_a}{E_b}`, expr: "mag(Ede('A', -0.045, 1.0001*a, 0))/mag(Ede('B', 0.035, 1.0001*b, 0))", unidade: '', teoria: 'b/a' },
        { rotulo: 'Carga da esfera a', simbolo: r`q_a = \frac{Qa}{a + b}`, expr: "1e9*carga('A')", unidade: 'nC' },
        { rotulo: 'Carga da esfera b', simbolo: r`q_b = \frac{Qb}{a + b}`, expr: "1e9*carga('B')", unidade: 'nC' },
      ],
      passos: [
        {
          titulo: '(b) Dividir a carga',
          texto: r`Ligadas, as esferas viram um condutor só: mesmo potencial. Muito afastadas, cada uma tem $V = kq/r$:
$$\frac{q_a}{a} = \frac{q_b}{b},\quad q_a + q_b = Q\ \Rightarrow\ q_a = \frac{Qa}{a + b},\quad q_b = \frac{Qb}{a + b}.$$
A cena calcula o potencial de cada esfera pelo campo dela mesma, como se estivessem longe.`,
          medidas: [0, 1, 3, 4],
        },
        {
          titulo: '(a) Campos',
          texto: r`$E = kq/r^2 = V/r$ na superfície, com o mesmo $V$: $\dfrac{E_a}{E_b} = \dfrac ba$. A esfera **menor** tem o campo mais forte, como nas pontas de um condutor.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\dfrac{E_a}{E_b} = \dfrac ba$` },
        { item: '(b)', texto: r`$q_a = \dfrac{Qa}{a + b}$, $q_b = \dfrac{Qb}{a + b}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Condutores em equilíbrio', lab: 'condutores' }],
        etapas: [
          {
            titulo: '(a) A razão entre os campos nas superfícies',
            texto: r`**O que se pede.** Depois de ligar as duas esferas condutoras (raios $a$ e $b$, muito afastadas) por um fio, a razão entre as intensidades do campo na superfície de cada uma.

**A ideia.** Duas coisas:
- ligadas por um fio condutor, as esferas viram **um condutor só**. Em equilíbrio, um condutor inteiro tem o **mesmo potencial** (a dica do enunciado). Então $V_a = V_b$;
- como estão muito afastadas, cada esfera praticamente não sente a outra. Uma esfera condutora com carga $q$ tem, por fora, o mesmo campo e o mesmo potencial de uma carga pontual $q$ no centro (simetria esférica e lei de Gauss). Na superfície, de raio $r$:
$$V = k_0\frac qr,\qquad E = k_0\frac{q}{r^2}.$$

**A conta.** Comparando as duas fórmulas, na superfície $E = \dfrac Vr$. Com o mesmo $V$ nas duas esferas:
$$\frac{E_a}{E_b} = \frac{V/a}{V/b} = \frac ba.$$

**Interpretação.** A esfera **menor** tem o campo **mais forte** na superfície. É o mesmo efeito que concentra o campo nas pontas de um condutor (o princípio do para-raios): ao longo de um condutor, as partes mais curvas, de raio pequeno, ficam com campo maior.`,
            passo: 1,
          },
          {
            titulo: '(b) As cargas de cada esfera',
            texto: r`**O que se pede.** A carga com que cada esfera fica depois de ligadas. No começo, a de raio $a$ tinha $Q$ e a de raio $b$ era neutra.

**A ideia.** Duas condições:
- **conservação da carga:** o fio só leva carga de uma esfera para a outra, então $q_a + q_b = Q$ (desprezando a carga no fio);
- **mesmo potencial**, como no item (a): $k_0\dfrac{q_a}{a} = k_0\dfrac{q_b}{b}$.

**A conta.** Da segunda, $q_b = q_a\dfrac ba$. Pondo na primeira:
$$q_a\left(1 + \frac ba\right) = Q\quad\Rightarrow\quad q_a = \frac{Qa}{a + b},\qquad q_b = Q - q_a = \frac{Qb}{a + b}.$$

**Interpretação.** A carga se divide na **proporção dos raios**: a esfera maior fica com mais carga. Mas, pelo item (a), a menor fica com o campo mais forte na superfície. Não é a carga que se iguala, é o **potencial**.

**Conferindo.** Se as esferas forem iguais ($a = b$), cada uma fica com $Q/2$, como o bom senso diz.`,
            passo: 0,
          },
        ],
        resultado: r`$q_a = Qa/(a+b)$, $q_b = Qb/(a+b)$, $E_a/E_b = b/a$.`,
        errosComuns: ['Dividir a carga igualmente entre as esferas.'],
        oficial: { resposta: 'E_a/E_b = b/a; q_a = Qa/(a + b), q_b = Qb/(a + b).' },
      },
    },
  ],
}

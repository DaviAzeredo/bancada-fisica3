import type { ProvaInput } from '../../scenario/schema'

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
      respostas: [{ item: r`$\Delta V$`, texto: r`$|\Delta V| = \dfrac{m(0{,}4c)^2}{2e} \approx 4{,}1\times10^4$ V, com o elétron indo para o potencial mais alto.` }],
      resolucao: {
        conceitos: [{ texto: 'Energia potencial e trabalho elétrico', lab: 'potencial' }],
        etapas: [{ titulo: 'Conservação', texto: r`$e\Delta V = mv^2/2$.`, passo: 0 }],
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
          { titulo: 'Superpor', texto: r`$U_+ + U_-$.`, passo: 0 },
          { titulo: 'Extremos', texto: r`Mínimo estável, máximo instável.`, passo: 1 },
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
          { titulo: 'Escalar', texto: r`$V$ soma com sinal.`, passo: 0 },
          { titulo: 'Campo', texto: r`$\vec E = -\nabla V$.`, passo: 1 },
          { titulo: 'Trabalho', texto: r`$-q\Delta V$.`, passo: 2 },
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
          { titulo: 'Pares', texto: r`Três tipos de distância.`, passo: 0 },
          { titulo: 'Centro', texto: r`Simetria.`, passo: 2 },
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
          { titulo: 'V', texto: r`Mesma distância para todo o anel.`, passo: 0 },
          { titulo: 'E', texto: r`$-dV/dz$.`, passo: 1 },
          { titulo: 'Retorno', texto: r`Cinética vira potencial.`, passo: 2 },
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
          { titulo: 'Anéis', texto: r`Carga igual por anel.`, passo: 0 },
          { titulo: 'Derivar', texto: r`$E = -dV/dz$.`, passo: 1 },
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
          { titulo: 'Q', texto: r`Integral ímpar.`, passo: 0 },
          { titulo: 'V', texto: r`Integral com $x_P - x$ no denominador.`, passo: 1 },
          { titulo: 'Assíntota', texto: r`Série do logaritmo.`, passo: 2 },
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
          { titulo: 'Campo', texto: r`Gauss nas três regiões.`, passo: 0 },
          { titulo: 'Indução', texto: r`$E = 0$ no metal.`, passo: 1 },
          { titulo: 'Potencial', texto: r`Integrar de $s$ até $b$.`, passo: 2 },
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
          { titulo: 'Material', texto: r`Carga no volume.`, passo: 0 },
          { titulo: 'Ordem', texto: r`V cai ao longo de $\vec E$.`, passo: 1 },
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
          { titulo: 'q(r)', texto: r`Integrar em cascas.`, passo: 0 },
          { titulo: 'V', texto: r`De fora para dentro.`, passo: 1 },
        ],
        resultado: r`Veja as expressões acima.`,
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
          { titulo: 'Dentro', texto: r`Integrar $\rho_0z/\varepsilon_0$.`, passo: 1 },
          { titulo: 'Fora', texto: r`Continuidade em $z = d$.`, passo: 2 },
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
          { titulo: 'E = 0', texto: r`No interior.`, passo: 0 },
          { titulo: 'Equipotencial', texto: r`Um só valor de V.`, passo: 1 },
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
          { titulo: 'Gradiente', texto: r`Derivar.`, passo: 0 },
          { titulo: 'Trabalho', texto: r`$-q\Delta V$.`, passo: 1 },
          { titulo: 'Gauss', texto: r`Fluxo na esfera.`, passo: 2 },
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
          { titulo: 'Mesmo V', texto: r`$q_a/a = q_b/b$.`, passo: 0 },
          { titulo: 'Campos', texto: r`$E = V/r$.`, passo: 1 },
        ],
        resultado: r`$q_a = Qa/(a+b)$, $q_b = Qb/(a+b)$, $E_a/E_b = b/a$.`,
        errosComuns: ['Dividir a carga igualmente entre as esferas.'],
        oficial: { resposta: 'E_a/E_b = b/a; q_a = Qa/(a + b), q_b = Qb/(a + b).' },
      },
    },
  ],
}

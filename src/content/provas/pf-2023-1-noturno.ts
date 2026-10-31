import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 3: raio da gaussiana do enunciado. */
const rg0 = Math.sqrt(3) * 0.03
const rv = '(sqrt(x^2 + y^2 + z^2) + 1e-12)'

/* Objetiva 4: capacitância e energia. */
const C1 = '(eps0*lado^2/d1)'

/* Objetiva 6: campo induzido de um capacitor com corrente constante. */
const fi = '[0, 0-z, y]'
const Bin = `mag([0, y, z]) < a && abs(x) < d/2 ? mu0*Ic/(2*pi*a^2)*${fi} : mu0*Ic/(2*pi)*${fi}/(y^2 + z^2 + 1e-9)`

/* Objetiva 7: arestas do paralelepípedo, num só traço. */
const canto = (x: number, y: number, z: number): [string, string, string] => [`${x}*a/2`, `${y}*b/2`, `${z}*c/2`]

/* Objetiva 8: as três espiras, como fios, no plano xz. */
const lado = (id: string, p: [string, number, string], q: [string, number, string]): ObjetoInput => ({
  id,
  tipo: 'fio',
  I: 'I0',
  a: p,
  b: q,
})
const NC = 32
const noCirculo = (i: number): [string, number, string] => {
  const f = (2 * Math.PI * i) / NC
  return [`-0.07 + a/2*${Math.cos(f)}`, 0, `a/2*${Math.sin(f)}`]
}
const circulo = Array.from({ length: NC }, (_, i) => lado(`c${i}`, noCirculo(i), noCirculo(i + 1)))
const quadrado: [string, number, string][] = [
  ['-a/2', 0, '-a/2'],
  ['a/2', 0, '-a/2'],
  ['a/2', 0, 'a/2'],
  ['-a/2', 0, 'a/2'],
]
const quadro = quadrado.map((p, i) => lado(`q${i}`, p, quadrado[(i + 1) % 4]))
const triang: [string, number, string][] = [
  ['0.07 - a/2', 0, `a*${Math.sqrt(3) / 6}`],
  ['0.07 + a/2', 0, `a*${Math.sqrt(3) / 6}`],
  ['0.07', 0, `-a*${Math.sqrt(3) / 3}`],
]
const trio = triang.map((p, i) => lado(`t${i}`, p, triang[(i + 1) % 3]))
const somaF = (l: ObjetoInput[]) => `mag(${l.map((o) => `forca('${o.id}', 'By')`).join(' + ')})`

/* Objetiva 10: disco em 16 anéis, cada um com a carga exata da sua coroa. */
const N = 16
const aneis: ObjetoInput[] = Array.from({ length: N }, (_, i) => {
  const f0 = i / N
  const f1 = (i + 1) / N
  return {
    id: `r${i}`,
    tipo: 'anelCarga' as const,
    Q: `Qq*${f1 ** 2 - f0 ** 2}`,
    centro: [0, 0, 0],
    raio: `${(f0 + f1) / 2}*R`,
    normal: 'z',
  }
})

/**
 * Prova final de Física III, 2023/1, noturno, versão A (13/07/2023). Conferida com
 * o gabarito oficial: 1b, 2c, 3e, 4a, 5d, 6f, 7a, 8a, 9c, 10a. Só objetivas.
 */
export const pf_2023_1_noturno: ProvaInput = {
  id: 'pf-2023-1-noturno',
  titulo: 'Prova final · 2023/1 · Noturno',
  subtitulo: 'Física III · Prova Final Noturna · Versão A · 13/07/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Andar sem mudar o potencial',
      resumo: 'Equipotenciais são perpendiculares ao campo.',
      enunciado: r`Considere uma região do espaço em que o campo elétrico é não nulo. Em que direção podemos nos mover com relação à esse campo, para que o potencial elétrico não varie?`,
      figura: { pagina: 1, recorte: [0.03, 0.495, 0.255, 0.925] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'E0', rotulo: 'Campo', simbolo: 'E', valor: 1000, unidade: 'V/m', min: 200, max: 3000, passo: 100 },
        { id: 'dd', rotulo: 'Deslocamento', simbolo: 'd', valor: 0.05, unidade: 'm', min: 0.01, max: 0.06, passo: 0.002 },
        { id: 'ang', rotulo: 'Ângulo com o campo', simbolo: r`\theta`, valor: 0, unidade: '°', min: 0, max: 180, passo: 5 },
      ],
      objetos: [
        { id: 'Ex', tipo: 'campoE', valor: ['E0', 0, 0], potencial: '0-E0*x', rotulo: 'E' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'A' },
        { id: 'B', tipo: 'sonda', campo: 'E', pos: ['dd*cos(rad(ang))', 'dd*sin(rad(ang))', 0], rotulo: 'B' },
        { id: 'sd', tipo: 'seta', papel: 'v', origem: [0, 0, 0], vetor: ['cos(rad(ang))', 'sin(rad(ang))', 0], comprimento: 'dd', rotulo: 'deslocamento' },
      ],
      visual: { setasE: true, equipotenciais: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Variação do potencial', simbolo: r`\Delta V`, expr: 'V(dd*cos(rad(ang)), dd*sin(rad(ang)), 0) - V(0, 0, 0)', unidade: 'V', teoria: '0-E0*dd*cos(rad(ang))' },
      ],
      passos: [
        {
          titulo: 'A variação depende do ângulo',
          texto: r`Num deslocamento $d\vec\ell$:

$$dV = -\vec E\cdot d\vec\ell = -E\,d\ell\cos\theta.$$

Ao longo do campo, o potencial **cai**.`,
          parametros: { ang: 0 },
          medidas: [0],
        },
        {
          titulo: 'Contra o campo',
          texto: r`Com $\theta = 180°$, o potencial **sobe**. Andar paralelo ao campo sempre muda $V$, em qualquer dos sentidos.`,
          parametros: { ang: 180 },
          medidas: [0],
        },
        {
          titulo: 'Perpendicular',
          previsao: { pergunta: 'Para quais valores de θ a variação é zero?', opcoes: ['0°', '90°', '180°'], correta: 1 },
          texto: r`Com $\theta = 90°$, $\cos\theta = 0$, e $dV = 0$. Essa é a direção das equipotenciais. Alternativa **(b)**.`,
          parametros: { ang: 90 },
          medidas: [0],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Potencial e campo', lab: 'potencial' }],
        etapas: [
          { titulo: 'Relação', texto: r`$dV = -\vec E\cdot d\vec\ell$.`, passo: 0 },
          { titulo: 'Condição', texto: r`$dV = 0$ exige $d\vec\ell\perp\vec E$.`, passo: 2 },
        ],
        resultado: r`Em uma direção perpendicular ao campo: alternativa **(b)**.`,
        errosComuns: [
          r`Achar que campo não nulo impede potencial constante: basta andar sobre a equipotencial.`,
          r`Confundir campo nulo com potencial constante em todo o espaço: isso exigiria $\vec E = \vec 0$.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Paralelo ao campo, no mesmo sentido.', porque: r`O potencial cai ao longo do campo.` },
        { letra: 'b', texto: 'Em uma direção perpendicular ao campo.', correta: true, porque: r`Correta.` },
        { letra: 'c', texto: 'Em qualquer direção, pois o potencial é constante em todo o espaço.', porque: r`Com $\vec E\neq\vec 0$, o potencial não é constante.` },
        { letra: 'd', texto: 'Não é possível encontrar um caminho.', porque: r`As equipotenciais são esse caminho.` },
        { letra: 'e', texto: 'Paralelo ao campo, em sentido contrário.', porque: r`O potencial sobe contra o campo.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Torque sobre um dipolo preso num pino',
      resumo: 'τ = p × E, com atenção à regra do produto vetorial.',
      enunciado: r`Duas partículas com cargas $Q > 0$ e $-Q$ são colocadas nas pontas de uma barra isolante, de massa desprezível, presa a uma superfície por um pino que passa no seu centro. A posição da partícula positiva com respeito à negativa é dada por $L\hat y$. Se o aparato é submetido a um campo elétrico constante $\vec E = E_x\hat x$, paralelo à superfície e perpendicular à barra, o vetor torque $\vec\tau$ resultante sobre o sistema é`,
      figura: { pagina: 1, recorte: [0.27, 0.495, 0.49, 0.985] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 1e-8, unidade: 'C', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'Ex0', rotulo: 'Campo', simbolo: 'E_x', valor: 1e5, unidade: 'V/m', min: 2e4, max: 3e5, passo: 1e4 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.04, max: 0.1, passo: 0.004 },
      ],
      objetos: [
        { id: 'Ec', tipo: 'campoE', valor: ['Ex0', 0, 0], rotulo: 'E' },
        { id: 'pos', tipo: 'carga', q: 'Qq', pos: [0, 'L/2', 0], rotulo: '+Q' },
        { id: 'neg', tipo: 'carga', q: '0-Qq', pos: [0, '-L/2', 0], rotulo: '−Q' },
        { id: 'barra', tipo: 'caminho', seta: 0, pontos: [[0, '-L/2', 0], [0, 'L/2', 0]], rotulo: 'barra' },
        { id: 'Fp', tipo: 'seta', papel: 'forca', origem: [0, 'L/2', 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'F em +Q' },
        { id: 'Fn', tipo: 'seta', papel: 'forca', origem: [0, '-L/2', 0], vetor: [-1, 0, 0], comprimento: '3*cm', rotulo: 'F em −Q' },
      ],
      visual: { setasE: true, densidade: 7, planoSetas: 'xy', fontes: ['Ec'] },
      medidas: [
        { rotulo: 'Força sobre +Q, do campo', simbolo: 'F_+', expr: "x(Qq*Ede('Ec', 0, L/2, 0))", unidade: 'N', teoria: 'Qq*Ex0' },
        { rotulo: 'Força sobre −Q, do campo', simbolo: 'F_-', expr: "x((0-Qq)*Ede('Ec', 0, 0-L/2, 0))", unidade: 'N', teoria: '0-Qq*Ex0' },
        { rotulo: 'Força resultante', simbolo: 'F', expr: "x(Qq*Ede('Ec', 0, L/2, 0)) + x((0-Qq)*Ede('Ec', 0, 0-L/2, 0))", unidade: 'N', teoria: 0 },
        { rotulo: 'Torque em z', simbolo: r`\tau_z`, expr: "z(cross([0, L/2, 0], Qq*Ede('Ec', 0, L/2, 0)) + cross([0, 0-L/2, 0], (0-Qq)*Ede('Ec', 0, 0-L/2, 0)))", unidade: 'N·m', teoria: '0-Qq*Ex0*L' },
      ],
      passos: [
        {
          titulo: 'Duas forças opostas',
          texto: r`Sobre $+Q$, a força é $+QE_x\hat x$. Sobre $-Q$, é $-QE_x\hat x$. A resultante é nula: o centro não sai do lugar. Mas as forças formam um **binário**.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: 'O torque',
          previsao: { pergunta: 'Olhando de cima (z saindo da tela), a barra gira…', opcoes: ['no sentido horário', 'no sentido anti-horário'], correta: 0 },
          texto: r`Com $\vec p = QL\hat y$:

$$\vec\tau = \vec p\times\vec E = QLE_x(\hat y\times\hat x) = -QE_xL\hat z.$$

O dipolo tende a se alinhar com $\vec E$, girando no sentido horário. Alternativa **(c)**.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Torque sobre um dipolo', lab: 'dipolo' }],
        etapas: [
          { titulo: 'Forças', texto: r`Resultante nula, mas com binário.`, passo: 0 },
          { titulo: 'Torque', texto: r`$\vec\tau = \vec p\times\vec E = -QE_xL\hat z$.`, passo: 1 },
        ],
        resultado: r`$\vec\tau = -QE_xL\hat z$: alternativa **(c)**.`,
        errosComuns: [
          r`Inverter o produto vetorial: $\hat y\times\hat x = -\hat z$.`,
          r`Concluir que o torque é nulo porque a força resultante é: um binário tem torque.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec\tau = QE_xL\hat z$`, porque: r`Sinal trocado: $\hat y\times\hat x = -\hat z$.` },
        { letra: 'b', texto: r`$\vec\tau = QE_xL\hat x$`, porque: r`O torque é perpendicular a $\vec p$ e a $\vec E$.` },
        { letra: 'c', texto: r`$\vec\tau = -QE_xL\hat z$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`$\vec\tau = QE_xL\hat y$`, porque: r`O torque é perpendicular a $\vec p$.` },
        { letra: 'e', texto: r`$\vec\tau = -QE_xL\hat y$`, porque: r`O torque é perpendicular a $\vec p$.` },
        { letra: 'f', texto: 'O torque é nulo.', porque: r`Só a força resultante é nula.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Carga a partir de um campo dado',
      resumo: 'Lei de Gauss ao contrário: do campo para a carga.',
      enunciado: r`Considere um campo elétrico dado por $\vec E(r) = C\left(r^2 - r_0^2\right)\hat r$ para $r \le 2r_0$ e $\vec E = \vec 0$ para $r > 2r_0$, onde $C$ e $r_0$ são constantes positivas, $r$ é a distância até a origem e $\hat r$ é o unitário da direção radial. Qual é a carga total contida no interior de uma superfície gaussiana esférica de raio $\sqrt3\,r_0$, concêntrica com a origem?`,
      figura: { pagina: 1, recorte: [0.535, 0.02, 0.755, 0.44] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'C0', rotulo: 'Constante', simbolo: 'C', valor: 1e9, unidade: 'V/m³', min: 2e8, max: 3e9, passo: 1e8 },
        { id: 'r0', rotulo: 'Raio característico', simbolo: 'r_0', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: rg0, unidade: 'm', min: 0.01, max: 0.07, passo: 0.003 },
      ],
      objetos: [
        { id: 'Er', tipo: 'campoE', valor: `${rv} <= 2*r0 ? C0*(${rv}^2 - r0^2)*[x, y, z]/${rv} : [0, 0, 0]`, rotulo: 'E(r)' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo sobre S', simbolo: 'E', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: 'rg <= 2*r0 ? C0*(rg^2 - r0^2) : 0' },
        { rotulo: 'Fluxo por S', simbolo: r`\Phi_S`, expr: "fluxo('G')", unidade: 'V·m', teoria: 'rg <= 2*r0 ? 4*pi*rg^2*C0*(rg^2 - r0^2) : 0' },
        { rotulo: 'Carga dentro de S', simbolo: r`Q_\text{int}`, expr: "eps0*fluxo('G')", unidade: 'C', teoria: 'rg <= 2*r0 ? 4*pi*eps0*rg^2*C0*(rg^2 - r0^2) : 0' },
        { rotulo: 'Em unidades de ε₀Cr₀⁴', simbolo: r`Q/\varepsilon_0Cr_0^4`, expr: "fluxo('G')/(C0*r0^4)", teoria: 'rg <= 2*r0 ? 4*pi*rg^2*(rg^2 - r0^2)/r0^4 : 0' },
      ],
      passos: [
        {
          titulo: 'Lei de Gauss, ao contrário',
          texto: r`O campo é radial e tem o mesmo módulo em toda a esfera, então o fluxo é imediato:

$$\oint\vec E\cdot d\vec A = E(r)\,4\pi r^2 = \frac{Q_\text{int}}{\varepsilon_0}.$$`,
          parametros: { rg: rg0 },
          medidas: [1],
        },
        {
          titulo: 'Em r = √3 r₀',
          previsao: { pergunta: 'E(√3 r₀) vale…', opcoes: ['2Cr₀²', '3Cr₀²', '4Cr₀²'], correta: 0 },
          texto: r`$E = C(3r_0^2 - r_0^2) = 2Cr_0^2$. A área é $4\pi\cdot 3r_0^2 = 12\pi r_0^2$. Logo:

$$Q_\text{int} = \varepsilon_0\cdot 2Cr_0^2\cdot 12\pi r_0^2 = 24\pi\varepsilon_0Cr_0^4.$$

Alternativa **(e)**.`,
          parametros: { rg: rg0 },
          medidas: [0, 2, 3],
        },
        {
          titulo: 'Fora de 2r₀',
          texto: r`Para $r > 2r_0$, o campo é nulo, e a carga líquida dentro também é zero. Portanto, há uma casca com carga negativa em $r = 2r_0$, e a alternativa (f) seria o resultado para uma gaussiana maior.`,
          parametros: { rg: 0.067 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`$\Phi = E(r)\,4\pi r^2$.`, passo: 0 },
          { titulo: 'Carga', texto: r`$Q_\text{int} = 24\pi\varepsilon_0Cr_0^4$.`, passo: 1 },
        ],
        resultado: r`$Q_\text{int} = 24\pi\varepsilon_0Cr_0^4$: alternativa **(e)**.`,
        errosComuns: [
          r`Esquecer o $3$ de $r^2 = 3r_0^2$ na área.`,
          r`Usar $r^2 = 2r_0^2$: o raio é $\sqrt3\,r_0$.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\epsilon_0Cr_0^4$`, porque: r`Faltam os fatores da área e do campo.` },
        { letra: 'b', texto: r`$\pi\epsilon_0Cr_0^4$`, porque: r`Faltam os fatores da área e do campo.` },
        { letra: 'c', texto: r`$4\pi\epsilon_0Cr_0^4$`, porque: r`Usa $r = r_0$ na área e $E = Cr_0^2$.` },
        { letra: 'd', texto: r`$8\pi\epsilon_0Cr_0^4$`, porque: r`Esquece o 3 da área: $r^2 = 3r_0^2$.` },
        { letra: 'e', texto: r`$24\pi\epsilon_0Cr_0^4$`, correta: true, porque: r`Correta.` },
        { letra: 'f', texto: '$0$', porque: r`Só para $r > 2r_0$ o campo é nulo.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Capacitor ligado a outro descarregado',
      resumo: 'A carga se conserva; a energia, não.',
      enunciado: r`Um capacitor de capacitância $C_1$ está inicialmente isolado e sujeito a uma diferença de potencial $V$. Em um dado instante ele é conectado em paralelo a um outro capacitor de capacitância $C_2 = 2C_1$, inicialmente descarregado. No equilíbrio eletrostático, qual será a energia potencial total armazenada nos capacitores?`,
      figura: { pagina: 1, recorte: [0.535, 0.48, 0.755, 0.97] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [4, 7, 17], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Momento',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'antes de ligar' },
            { valor: 2, rotulo: 'depois de ligar' },
          ],
        },
        { id: 'V0', rotulo: 'Tensão inicial', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 10 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.04, max: 0.08, passo: 0.005 },
        { id: 'd1', rotulo: 'Separação em C₁', simbolo: 'd_1', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
      ],
      objetos: [
        { id: 'c1', tipo: 'capacitor', rotulo: 'C₁', centro: [-0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1', Q: `caso==1 ? ${C1}*V0 : ${C1}*V0/3` },
        { id: 'c2', tipo: 'capacitor', rotulo: 'C₂', centro: [0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1/2', Q: `caso==1 ? 0 : 2*${C1}*V0/3` },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga total', simbolo: 'Q', expr: "Q('c1') + Q('c2')", unidade: 'C', teoria: `${C1}*V0` },
        { rotulo: 'Tensão em C₁', simbolo: 'V_1', expr: "Q('c1')/C('c1')", unidade: 'V', teoria: 'caso==1 ? V0 : V0/3' },
        { rotulo: 'Tensão em C₂', simbolo: 'V_2', expr: "Q('c2')/C('c2')", unidade: 'V', teoria: 'caso==1 ? 0 : V0/3' },
        { rotulo: 'Energia total', simbolo: 'U', expr: "U('c1') + U('c2')", unidade: 'J', teoria: `caso==1 ? ${C1}*V0^2/2 : ${C1}*V0^2/6` },
        { rotulo: 'Em unidades de C₁V²', simbolo: 'U/C_1V^2', expr: `(U('c1') + U('c2'))/(${C1}*V0^2)`, teoria: 'caso==1 ? 1/2 : 1/6' },
      ],
      passos: [
        {
          titulo: 'Antes',
          texto: r`$Q = C_1V$, e $U_i = \frac12C_1V^2$.`,
          parametros: { caso: 1 },
          medidas: [0, 3],
        },
        {
          titulo: 'Depois',
          previsao: { pergunta: 'Depois de ligados, o que se conserva?', opcoes: ['a carga', 'a tensão', 'a energia'], correta: 0 },
          texto: r`O sistema está isolado: a carga se conserva. Em paralelo, as tensões se igualam:

$$V_f = \frac{Q}{C_1 + C_2} = \frac{C_1V}{3C_1} = \frac V3.$$`,
          parametros: { caso: 2 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'A energia final',
          texto: r`$$U_f = \frac{Q^2}{2(C_1 + C_2)} = \frac{(C_1V)^2}{6C_1} = \frac{C_1V^2}{6}.$$

Alternativa **(a)**. Dois terços da energia saíram do sistema, dissipados na ligação.`,
          parametros: { caso: 2 },
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitores e energia', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Carga', texto: r`$Q = C_1V$ se conserva.`, passo: 1 },
          { titulo: 'Energia', texto: r`$U_f = Q^2/2C_\text{eq} = C_1V^2/6$.`, passo: 2 },
        ],
        resultado: r`$U_f = \dfrac{C_1V^2}{6}$: alternativa **(a)**.`,
        errosComuns: [
          r`Conservar a energia em vez da carga: isso daria $\frac12C_1V^2$.`,
          r`Usar a tensão inicial $V$ no novo arranjo: ela cai para $V/3$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$U_f = \dfrac{C_1V^2}{6}$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$U_f = \dfrac{C_1V^2}{2}$`, porque: r`É a energia inicial: ela não se conserva.` },
        { letra: 'c', texto: r`$U_f = \dfrac{3C_1V^2}{2}$`, porque: r`Mantém a tensão $V$ com $C_\text{eq} = 3C_1$.` },
        { letra: 'd', texto: r`$U_f = \dfrac{C_1V^2}{4}$`, porque: r`Usa $C_2 = C_1$.` },
        { letra: 'e', texto: r`$U_f = \dfrac{3C_1V^2}{4}$`, porque: r`Não sai da conservação da carga.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Arco com densidade λ₀ cos θ',
      resumo: 'Duas integrais de cos θ, uma para cada componente.',
      enunciado: r`Considere um anel circular, fino, de raio $R$, situado no plano cartesiano $z = 0$. Tal anel possui uma densidade linear de carga $\lambda(\theta) = \lambda_0\cos\theta$, para $0 < \theta < \pi/2$ (arco contínuo), e $\lambda(\theta) = 0$, para o resto do anel (ou seja, para $\pi/2 < \theta < 2\pi$), sendo $\theta$ o usual ângulo polar, medido a partir do eixo $\mathcal X$, no sentido anti-horário, e $\lambda_0$ uma constante. Qual é o campo elétrico no centro do anel?`,
      figura: { pagina: 1, recorte: [0.77, 0.02, 0.99, 0.82] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'l0', rotulo: 'Densidade máxima', simbolo: r`\lambda_0`, valor: 1e-8, unidade: 'C/m', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'arco', tipo: 'anelCarga', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 90], densidade: 'l0*cos(theta)', rotulo: 'λ₀ cos θ' },
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' },
        { id: 'sE', tipo: 'seta', papel: 'E', origem: [0, 0, 0], vetor: 'E(0, 0, 0)', comprimento: '3*cm', rotulo: 'E' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Componente x', simbolo: 'E_x', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: '0-l0/(16*pi*eps0*R)*pi' },
        { rotulo: 'Componente y', simbolo: 'E_y', expr: 'y(E(0, 0, 0))', unidade: 'V/m', teoria: '0-l0/(16*pi*eps0*R)*2' },
        { rotulo: 'Razão E_x/E_y', simbolo: 'E_x/E_y', expr: 'x(E(0, 0, 0))/y(E(0, 0, 0))', teoria: 'pi/2' },
      ],
      passos: [
        {
          titulo: 'O elemento de carga',
          texto: r`Um elemento $dq = \lambda R\,d\theta$ está em $\theta$, e produz no centro um campo que aponta **para longe** dele (com $\lambda_0 > 0$):

$$d\vec E = -\frac{k_0\lambda\,d\theta}{R}(\cos\theta\,\hat x + \sin\theta\,\hat y).$$`,
        },
        {
          titulo: 'As duas integrais',
          previsao: { pergunta: 'Qual componente tem módulo maior?', opcoes: ['E_x', 'E_y', 'são iguais'], correta: 0 },
          texto: r`$$\int_0^{\pi/2}\cos^2\theta\,d\theta = \frac\pi4,\qquad \int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \frac12.$$

A carga se concentra perto de $\theta = 0$, então $E_x$ pesa mais.`,
          medidas: [2],
        },
        {
          titulo: 'O resultado',
          texto: r`$$\vec E = -\frac{k_0\lambda_0}{R}\left(\frac\pi4\hat x + \frac12\hat y\right) = -\frac{\lambda_0}{16\pi\varepsilon_0R}[\pi\hat x + 2\hat y].$$

Alternativa **(d)**.`,
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições contínuas', lab: 'coulomb' }],
        etapas: [
          { titulo: 'Elemento', texto: r`$d\vec E = -(k_0\lambda/R)(\cos\theta\,\hat x + \sin\theta\,\hat y)\,d\theta$.`, passo: 0 },
          { titulo: 'Integrais', texto: r`$\pi/4$ e $1/2$.`, passo: 1 },
          { titulo: 'Resultado', texto: r`$\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$.`, passo: 2 },
        ],
        resultado: r`$\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$: alternativa **(d)**.`,
        errosComuns: [
          r`Trocar as componentes: $\cos^2\theta$ vai em $\hat x$.`,
          r`Esquecer o sinal: o campo aponta para longe da carga positiva.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}[2\hat x + \pi\hat y]$`, porque: r`Troca as componentes.` },
        { letra: 'b', texto: r`$\vec E = \dfrac{\lambda_0}{8\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$`, porque: r`Sinal e fator errados.` },
        { letra: 'c', texto: r`$\vec E = -\dfrac{\lambda_0}{8\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$`, porque: r`Tem um fator 2 a mais.` },
        { letra: 'd', texto: r`$\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$\vec E = \dfrac{\lambda_0}{16\pi\varepsilon_0R}[\pi\hat x + 2\hat y]$`, porque: r`O campo aponta para longe do arco.` },
        { letra: 'f', texto: r`$\vec E = \dfrac{\lambda_0}{16\pi\varepsilon_0R}[2\hat x + \pi\hat y]$`, porque: r`Sinal trocado e componentes trocadas.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Ampère, Maxwell e monopolos',
      resumo: 'Corrente de deslocamento serve para o que não é estacionário.',
      enunciado: r`Considere as seguintes afirmativas: (I) A lei de Ampère-Maxwell, que inclui a corrente de deslocamento, é válida apenas para distribuições de corrente estacionárias; (II) A lei de Ampère é válida para distribuições de corrente não uniformes; (III) Devido à não-observação de monopolos magnéticos, o fluxo de campo magnético através de uma superfície fechada deve ser sempre nulo. São VERDADEIRAS as afirmativas:`,
      figura: { pagina: 2, recorte: [0.03, 0.02, 0.255, 0.6] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [9, 7, 15], alvo: [0, 0, 0] },
        tempo: { escala: 5e-7, unidade: 'µs', passo: 1e-9, duracao: 4e-6 },
      },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Afirmativa',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) capacitor carregando' },
            { valor: 2, rotulo: '(II) J não uniforme' },
            { valor: 3, rotulo: '(III) ímã' },
          ],
        },
        { id: 'Ic', rotulo: 'Corrente de carga', simbolo: 'I_c', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.048, passo: 0.002 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', ativo: 'caso==1', centro: [0, 0, 0], eixo: 'x', lado: '2*a', circular: true, d: 'd', Q: 'Ic*(t + 1e-6)' },
        { id: 'Bi', tipo: 'campoB', ativo: 'caso==1', valor: Bin, rotulo: 'B induzido' },
        { id: 'A1', tipo: 'amperiana', ativo: 'caso==1', centro: [0, 0, 0], normal: 'x', raio: 'rs', rotulo: 'C' },
        { id: 'S1', tipo: 'espiraSensora', ativo: 'caso==1', centro: [0, 0, 0], normal: 'x', raio: 'rs', oculta: true },
        { id: 'cil', tipo: 'cilindroCorrente', ativo: 'caso==2', ponto: [0, 0, 0], direcao: 'y', raio: 'a', J: '1e4*r/a', rotulo: 'J(s)' },
        { id: 'A2', tipo: 'amperiana', ativo: 'caso==2', centro: [0, 0, 0], normal: 'y', raio: 'rs', rotulo: 'C' },
        { id: 'ima', tipo: 'ima', ativo: 'caso==3', centro: [0, 0, 0], eixo: 'x', comprimento: 0.06, raio: 0.012, intensidade: 2000, rotulo: 'ímã' },
        { id: 'S', tipo: 'gaussiana', ativo: 'caso==3', forma: 'esfera', centro: [0.03, 0, 0], raio: 0.025, campo: 'B', rotulo: 'S' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente de deslocamento dentro de C', simbolo: 'I_d', ativo: 'caso==1', expr: "eps0*dfluxoE('S1')", unidade: 'A', teoria: 'Ic*(rs/a)^2' },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, ativo: 'caso==1', expr: "circ('A1')", unidade: 'T·m', teoria: "mu0*eps0*dfluxoE('S1')" },
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, ativo: 'caso==2', expr: "Ienc('A2')", unidade: 'A', teoria: '2*pi*1e4*rs^3/(3*a)' },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, ativo: 'caso==2', expr: "circ('A2')", unidade: 'T·m', teoria: 'mu0*2*pi*1e4*rs^3/(3*a)' },
        { rotulo: 'Fluxo por S, relativo a B·πr²', simbolo: r`\Phi/B\pi r^2`, ativo: 'caso==3', expr: "floor(1e3*fluxo('S')/(mag(B(0.03, 0, 0))*pi*0.025^2) + 0.5)/1e3", teoria: 0 },
      ],
      passos: [
        {
          titulo: '(I) Maxwell é para o caso variável',
          previsao: { pergunta: 'A corrente de deslocamento importa quando…', opcoes: ['E é constante', 'E varia no tempo'], correta: 1 },
          texto: r`A corrente de deslocamento só existe com $\vec E$ **variável**: foi incluída justamente para valer fora do regime estacionário. Entre as placas de um capacitor carregando não passa corrente, e ainda assim a circulação de $\vec B$ não é nula. **Falsa.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Ampère não exige J uniforme',
          texto: r`A lei conta a corrente que atravessa a superfície, qualquer que seja sua distribuição. Com $J$ crescendo com $s$, a circulação continua igual a $\mu_0I_\text{env}$. **Verdadeira.**`,
          parametros: { caso: 2 },
          medidas: [2, 3],
        },
        {
          titulo: '(III) Sem monopolos, fluxo nulo',
          texto: r`Sem monopolos, as linhas de $\vec B$ são fechadas: o que entra numa superfície fechada também sai. Mesmo em volta de um polo do ímã, o fluxo é nulo. **Verdadeira.**

Alternativa **(f)**.`,
          parametros: { caso: 3 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ampère-Maxwell', lab: 'ampere' },
          { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`Falsa: a corrente de deslocamento serve para campos variáveis.`, passo: 0 },
          { titulo: '(II)', texto: r`Verdadeira: basta contar a corrente envolvida.`, passo: 1 },
          { titulo: '(III)', texto: r`Verdadeira: $\oint\vec B\cdot d\vec A = 0$.`, passo: 2 },
        ],
        resultado: r`Apenas (II) e (III): alternativa **(f)**.`,
        errosComuns: [
          r`Confundir "válida" com "útil": Ampère vale sempre em regime estacionário, mesmo sem simetria para isolar $B$.`,
          r`Inverter (I): no regime estacionário, a corrente de deslocamento é nula.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', porque: r`(I) é a única falsa.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`(III) também é verdadeira.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`(II) também é verdadeira.` },
        { letra: 'd', texto: 'Apenas I e II.', porque: r`(I) é falsa.` },
        { letra: 'e', texto: 'Apenas I e III.', porque: r`(I) é falsa.` },
        { letra: 'f', texto: 'Apenas II e III.', correta: true, porque: r`Correta.` },
        { letra: 'g', texto: 'Todas.', porque: r`(I) é falsa.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`(II) e (III) são verdadeiras.` },
      ],
    },

    /* ───────────────────────── Objetiva 7 ───────────────────────── */
    {
      id: 'obj7',
      numero: '7',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Corrente em cada direção de um paralelepípedo',
      resumo: 'A maior corrente passa pelo caminho curto e largo.',
      enunciado: r`Um condutor, em forma de paralelepípedo, tem dimensões $a$, $b$ e $c$ tais que $a < b < c$. A resistividade do material é $\rho$ e uma ddp $V$ constante pode ser aplicada entre quaisquer duas faces paralelas dele, resultando em correntes de intensidades $I_a$, $I_b$ e $I_c$ ao longo de suas arestas. Qual a ordem correta para as correntes?`,
      figura: { pagina: 2, recorte: [0.27, 0.02, 0.49, 0.41] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [9, 8, 13], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Direção da corrente',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'ao longo de a' },
            { valor: 2, rotulo: 'ao longo de b' },
            { valor: 3, rotulo: 'ao longo de c' },
          ],
        },
        { id: 'V0', rotulo: 'Tensão', simbolo: 'V', valor: 1, unidade: 'V', min: 0.1, max: 5, passo: 0.1 },
        { id: 'res', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1.7e-8, max: 1.7e-8 },
        { id: 'a', rotulo: 'Aresta a', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.025, passo: 0.001 },
        { id: 'b', rotulo: 'Aresta b', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
        { id: 'c', rotulo: 'Aresta c', simbolo: 'c', valor: 0.09, unidade: 'm', min: 0.06, max: 0.1, passo: 0.002 },
      ],
      objetos: [
        {
          id: 'caixa',
          tipo: 'caminho',
          seta: 0,
          rotulo: 'condutor',
          pontos: [
            canto(-1, -1, -1), canto(1, -1, -1), canto(1, 1, -1), canto(-1, 1, -1), canto(-1, -1, -1),
            canto(-1, -1, 1), canto(1, -1, 1), canto(1, 1, 1), canto(-1, 1, 1), canto(-1, -1, 1),
            canto(1, -1, 1), canto(1, -1, -1), canto(1, 1, -1), canto(1, 1, 1), canto(-1, 1, 1), canto(-1, 1, -1),
          ],
        },
        { id: 'sI', tipo: 'seta', papel: 'I', origem: [0, 0, 0], vetor: ['caso==1 ? 1 : 0', 'caso==2 ? 1 : 0', 'caso==3 ? 1 : 0'], comprimento: 'caso==1 ? 0.8*a : (caso==2 ? 0.8*b : 0.8*c)', rotulo: 'I' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Corrente ao longo de a', simbolo: 'I_a', expr: '(V0/a)/res*b*c', unidade: 'A', teoria: 'V0*b*c/(res*a)' },
        { rotulo: 'Corrente ao longo de b', simbolo: 'I_b', expr: '(V0/b)/res*a*c', unidade: 'A', teoria: 'V0*a*c/(res*b)' },
        { rotulo: 'Corrente ao longo de c', simbolo: 'I_c', expr: '(V0/c)/res*a*b', unidade: 'A', teoria: 'V0*a*b/(res*c)' },
        { rotulo: 'I_a/I_b', simbolo: 'I_a/I_b', expr: '((V0/a)/res*b*c)/((V0/b)/res*a*c)', teoria: '(b/a)^2' },
        { rotulo: 'I_b/I_c', simbolo: 'I_b/I_c', expr: '((V0/b)/res*a*c)/((V0/c)/res*a*b)', teoria: '(c/b)^2' },
      ],
      passos: [
        {
          titulo: 'A corrente em cada direção',
          texto: r`Ao longo da aresta $a$, o comprimento é $a$, e a seção é $bc$:

$$R_a = \rho\frac{a}{bc},\qquad I_a = \frac{Vbc}{\rho a}.$$

As outras saem trocando as letras.`,
          parametros: { caso: 1 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Comparar',
          previsao: { pergunta: 'A maior corrente passa ao longo de…', opcoes: ['a, a menor aresta', 'c, a maior aresta'], correta: 0 },
          texto: r`$$\frac{I_a}{I_b} = \frac{b^2}{a^2} > 1,\qquad \frac{I_b}{I_c} = \frac{c^2}{b^2} > 1.$$

Logo, $I_c < I_b < I_a$. Alternativa **(a)**. O caminho mais curto também é o de maior seção.`,
          parametros: { caso: 3 },
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Resistência e resistividade', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Correntes', texto: r`$I_a = Vbc/\rho a$, e assim por diante.`, passo: 0 },
          { titulo: 'Ordem', texto: r`$I_c < I_b < I_a$.`, passo: 1 },
        ],
        resultado: r`$I_c < I_b < I_a$: alternativa **(a)**.`,
        errosComuns: [
          r`Olhar só o comprimento, ignorando a seção: os dois efeitos vão no mesmo sentido.`,
          r`Inverter a ordem: ao longo de $c$, o caminho é longo e estreito.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$I_c < I_b < I_a$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$I_a < I_b < I_c$`, porque: r`Inverte a ordem.` },
        { letra: 'c', texto: r`$I_c < I_a < I_b$`, porque: r`$I_a$ é a maior de todas.` },
        { letra: 'd', texto: r`$I_b < I_c < I_a$`, porque: r`$I_b > I_c$.` },
        { letra: 'e', texto: r`$I_a = I_b = I_c$`, porque: r`O volume é o mesmo, mas a resistência depende da direção.` },
      ],
    },

    /* ───────────────────────── Objetiva 8 ───────────────────────── */
    {
      id: 'obj8',
      numero: '8',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três espiras num campo uniforme',
      resumo: 'Em campo uniforme, a força numa espira fechada é zero.',
      enunciado: r`Considere três espiras de corrente (estacionária) sob ação de um campo magnético constante (uniforme e estacionário) $\vec B = B\hat y$, ($B > 0$): 1) um círculo de raio $a/2$; 2) um quadrado de lado $a$; 3) um triângulo equilátero de lado $a$. Qual a ordem correta para os módulos das forças magnéticas sobre as espiras?`,
      figura: { pagina: 2, recorte: [0.27, 0.415, 0.49, 0.97] },
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [0, 18, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.2, unidade: 'T', min: 0.05, max: 0.5, passo: 0.05 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'By', tipo: 'campoB', valor: [0, 'B0', 0], rotulo: 'B' },
        ...circulo,
        ...quadro,
        ...trio,
        { id: 'sl', tipo: 'seta', papel: 'forca', origem: [0, 0, '-a/2'], vetor: "forca('q0', 'By')", comprimento: '1.2*cm', rotulo: 'F num lado' },
        { id: 'so', tipo: 'seta', papel: 'forca', origem: [0, 0, 'a/2'], vetor: "forca('q2', 'By')", comprimento: '1.2*cm', rotulo: 'F no oposto' },
      ],
      visual: { setasB: true, densidade: 7, fontes: ['By'] },
      medidas: [
        { rotulo: 'Força num lado do quadrado', simbolo: 'IaB', expr: "mag(forca('q0', 'By'))", unidade: 'N', teoria: 'I0*a*B0' },
        { rotulo: 'Força resultante no círculo', simbolo: 'F_1', expr: somaF(circulo), unidade: 'N', teoria: 0 },
        { rotulo: 'Força resultante no quadrado', simbolo: 'F_2', expr: somaF(quadro), unidade: 'N', teoria: 0 },
        { rotulo: 'Força resultante no triângulo', simbolo: 'F_3', expr: somaF(trio), unidade: 'N', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Cada lado sofre força',
          texto: r`Num trecho reto, $\vec F = I\vec\ell\times\vec B$. Um lado do quadrado sente $IaB$, e o lado oposto, a mesma força, com sentido contrário.`,
          medidas: [0],
          destacar: ['sl', 'so'],
        },
        {
          titulo: 'A soma numa espira fechada',
          previsao: { pergunta: 'Num campo uniforme, a força resultante numa espira fechada depende da forma?', opcoes: ['Sim', 'Não: é sempre zero'], correta: 1 },
          texto: r`Com $\vec B$ uniforme, ele sai da integral:

$$\vec F = I\left(\oint d\vec\ell\right)\times\vec B = \vec 0,$$

pois os vetores $d\vec\ell$ de uma curva fechada somam zero.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`$F_1 = F_2 = F_3 = 0$: alternativa **(a)**. O que pode não ser nulo é o **torque**, que aqui também é zero, pois $\vec B$ é normal às espiras.`,
          medidas: [1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }],
        etapas: [
          { titulo: 'Fórmula', texto: r`$\vec F = I\oint d\vec\ell\times\vec B$.`, passo: 1 },
          { titulo: 'Resultado', texto: r`$\oint d\vec\ell = \vec 0$: a força é nula.`, passo: 2 },
        ],
        resultado: r`$F_1 = F_2 = F_3$ (todas nulas): alternativa **(a)**.`,
        errosComuns: [
          r`Comparar perímetros ou áreas: a força resultante é nula em todas.`,
          r`Confundir força com torque: o torque depende da área, a força em campo uniforme, não.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$F_1 = F_2 = F_3$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$F_2 > F_1 > F_3$`, porque: r`Ordena os perímetros, não as forças.` },
        { letra: 'c', texto: r`$F_2 < F_1 < F_3$`, porque: r`As três são nulas.` },
        { letra: 'd', texto: r`$F_1 > F_2 > F_3$`, porque: r`As três são nulas.` },
        { letra: 'e', texto: r`$F_1 < F_2 < F_3$`, porque: r`As três são nulas.` },
      ],
    },

    /* ───────────────────────── Objetiva 9 ───────────────────────── */
    {
      id: 'obj9',
      numero: '9',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo ao se afastar de um sistema de cargas',
      resumo: 'Pode subir ou descer perto; longe, vai a zero.',
      enunciado: r`Considere um sistema, espacialmente localizado, com carga elétrica arbitrariamente distribuída (discreta ou continuamente).`,
      figura: { pagina: 2, recorte: [0.535, 0.02, 0.755, 0.63] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 18], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Sistema',
          valor: 2,
          opcoes: [
            { valor: 1, rotulo: 'carga pontual' },
            { valor: 2, rotulo: 'esfera uniforme' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'rp', rotulo: 'Distância ao centro', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.005, max: 0.075, passo: 0.002 },
      ],
      objetos: [
        { id: 'q', tipo: 'carga', ativo: 'caso==1', q: 'Qq', pos: [0, 0, 0], rotulo: 'Q' },
        { id: 'bola', tipo: 'esfera', ativo: 'caso==2', Q: 'Qq', centro: [0, 0, 0], raio: 'R', rotulo: 'ρ' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rp', 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em r', simbolo: 'E', expr: 'mag(E(rp, 0, 0))', unidade: 'V/m', teoria: 'caso==1 || rp >= R ? k0*Qq/rp^2 : k0*Qq*rp/R^3' },
        { rotulo: 'Campo a 10 m', simbolo: 'E_\\infty', expr: 'mag(E(10, 0, 0))', unidade: 'V/m', teoria: 'k0*Qq/100' },
      ],
      graficos: [
        {
          titulo: '|E| ao longo de r',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.006, ate: 0.08, rotulo: 'r', unidade: 'm' },
          series: [{ rotulo: '|E|', expr: 'mag(E(ss, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Pode diminuir',
          texto: r`Com uma carga pontual, $E\propto 1/r^2$: o campo só diminui ao se afastar. Mas esse é apenas um caso.`,
          parametros: { caso: 1, rp: 0.02 },
          medidas: [0],
        },
        {
          titulo: 'Pode aumentar',
          previsao: { pergunta: 'Dentro de uma esfera uniforme, ao se afastar do centro, E…', opcoes: ['aumenta', 'diminui'], correta: 0 },
          texto: r`Numa esfera uniforme, $E\propto r$ no interior: o campo **aumenta** ao se afastar do centro, até a superfície. Depois, cai. Veja o gráfico.

Ou seja, o campo pode aumentar ou diminuir. Alternativa **(c)**.`,
          parametros: { caso: 2, rp: 0.02 },
          medidas: [0],
        },
        {
          titulo: 'E bem longe',
          texto: r`O sistema é localizado: de muito longe, parece uma carga pontual (ou um dipolo, se a carga total for zero). O campo tende a zero, e a (d) é falsa.`,
          parametros: { caso: 2, rp: 0.07 },
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo de distribuições', lab: 'gauss' }],
        etapas: [
          { titulo: 'Contraexemplo', texto: r`A esfera uniforme mostra que $E$ pode crescer com a distância.`, passo: 1 },
          { titulo: 'Limite', texto: r`Longe do sistema, $E\to 0$.`, passo: 2 },
        ],
        resultado: r`O campo tanto pode diminuir quanto aumentar: alternativa **(c)**.`,
        errosComuns: [
          r`Generalizar a lei da carga pontual para qualquer distribuição.`,
          r`Achar que o campo tende a uma constante: isso exigiria carga infinita.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Conforme nos afastamos do "centro" do sistema, o módulo do seu campo elétrico sempre diminui monotonamente.', porque: r`Dentro de uma esfera uniforme, ele aumenta.` },
        { letra: 'b', texto: 'Conforme nos afastamos do "centro" do sistema, o módulo do seu campo elétrico aumenta monotonamente.', porque: r`Longe do sistema, ele cai.` },
        { letra: 'c', texto: 'Conforme nos afastamos do "centro" do sistema, o módulo de seu campo elétrico tanto pode diminuir, quanto aumentar.', correta: true, porque: r`Correta.` },
        { letra: 'd', texto: 'A uma distância infinitamente grande do sistema, o limite do módulo do seu campo elétrico é um valor constante não nulo.', porque: r`Com carga localizada, o campo vai a zero.` },
      ],
    },

    /* ───────────────────────── Objetiva 10 ───────────────────────── */
    {
      id: 'obj10',
      numero: '10',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Disco dentro de um cilindro gaussiano',
      resumo: 'O fluxo sai da carga, mas E não é constante.',
      enunciado: r`Uma carga $Q$ está uniformemente distribuída, em equilíbrio, sobre um disco plano circular de raio $R$. Considere uma superfície imaginária fechada, $\mathcal S$, cilíndrica circular reta de raio $R$ e comprimento $2R$, cujo eixo coincida com o eixo do disco. As bases de $\mathcal S$ são paralelas ao disco e equidistantes do mesmo. Sobre o fluxo de campo elétrico $\Phi_{\vec E}[\mathcal S]$ e o próprio campo elétrico $\vec E$ produzido pelo disco na superfície $\mathcal S$, pode-se afirmar que: (I) $\Phi_{\vec E}[\mathcal S]$ é igual a $Q/\varepsilon_0$; (II) $\vec E$ tem mesmo módulo em todos os pontos da superfície lateral de $\mathcal S$; (III) $\vec E$ tem mesmo módulo em todos os pontos das bases de $\mathcal S$. Qual(is) da(s) afirmativa(s) acima está(estão) correta(s)?`,
      figura: { pagina: 2, recorte: [0.77, 0.02, 0.99, 0.74] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [14, 8, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
      ],
      objetos: [
        ...aneis,
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'R', altura: '2*R', rotulo: 'S' },
        { id: 'Pc', tipo: 'sonda', campo: 'E', pos: [0, 0, 'R'], rotulo: 'centro da base' },
        { id: 'Pb', tipo: 'sonda', campo: 'E', pos: ['R', 0, 'R'], rotulo: 'borda da base' },
        { id: 'Pl', tipo: 'sonda', campo: 'E', pos: ['R', 0, 'R/4'], rotulo: 'lateral' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: 'Qq' },
        { rotulo: 'Fluxo por S, pela lei de Gauss', simbolo: r`\Phi_{\vec E}`, expr: "Qenc('G')/eps0", unidade: 'V·m', teoria: 'Qq/eps0' },
        { rotulo: 'Lateral, perto do disco', simbolo: 'E_l(R/4)', expr: 'mag(E(R, 0, R/4))', unidade: 'V/m' },
        { rotulo: 'Lateral, junto à base', simbolo: 'E_l(R)', expr: 'mag(E(R, 0, R))', unidade: 'V/m' },
        { rotulo: 'Base, no centro', simbolo: 'E_b(0)', expr: 'mag(E(0, 0, R))', unidade: 'V/m', teoria: 'Qq/(2*eps0*pi*R^2)*(1 - 1/sqrt(2))' },
        { rotulo: 'Base, a meio raio', simbolo: 'E_b(R/2)', expr: 'mag(E(R/2, 0, R))', unidade: 'V/m' },
      ],
      passos: [
        {
          titulo: '(I) O fluxo',
          texto: r`O disco está inteiro dentro de $\mathcal S$, com sua borda sobre a lateral. A lei de Gauss vale para qualquer superfície fechada:

$$\Phi_{\vec E}[\mathcal S] = \frac{Q}{\varepsilon_0}.$$

**Correta.**`,
          medidas: [0, 1],
        },
        {
          titulo: '(II) A lateral',
          previsao: { pergunta: 'O módulo de E é o mesmo em toda a lateral?', opcoes: ['Sim, por simetria', 'Não'], correta: 1 },
          texto: r`A simetria só garante que $E$ não muda ao girar em torno do eixo. Variando a altura, ele muda: perto do disco é bem maior que junto às bases. **Incorreta.**`,
          medidas: [2, 3],
        },
        {
          titulo: '(III) As bases',
          texto: r`Nas bases, os pontos estão a distâncias diferentes das cargas: o centro e a borda têm campos diferentes. **Incorreta.**

Só a (I): alternativa **(a)**. Sem $E$ constante, Gauss dá o fluxo, mas não o campo.`,
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss e simetria', lab: 'gauss' }],
        etapas: [
          { titulo: '(I)', texto: r`Gauss: $\Phi = Q/\varepsilon_0$.`, passo: 0 },
          { titulo: '(II)', texto: r`$E$ varia com a altura.`, passo: 1 },
          { titulo: '(III)', texto: r`$E$ varia com a distância ao eixo.`, passo: 2 },
        ],
        resultado: r`Apenas (I): alternativa **(a)**.`,
        errosComuns: [
          r`Tratar o disco como plano infinito: isso só vale muito perto dele.`,
          r`Concluir que, se a superfície tem a forma do disco, $E$ é constante: a simetria do campo é menor que a da superfície.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`$E$ varia ao longo da lateral.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`$E$ varia ao longo das bases.` },
        { letra: 'd', texto: 'Apenas I e II.', porque: r`(II) é falsa.` },
        { letra: 'e', texto: 'Apenas I e III.', porque: r`(III) é falsa.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Todas.', porque: r`Só a (I) é correta.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`(I) é correta.` },
      ],
    },
  ],
}

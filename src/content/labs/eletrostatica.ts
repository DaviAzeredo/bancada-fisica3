import type { ObjetoInput } from '../../scenario/schema'
import { condutorOco } from '../provas/modelos.ts'
import { type LabNovo, MOVIMENTO, r } from './tipos'

/* ───────────────── distribuições contínuas ───────────────── */

const ANEIS = 24

/** Disco como anéis concêntricos: a carga de cada um é proporcional à área. */
const disco: ObjetoInput[] = Array.from({ length: ANEIS }, (_, i) => ({
  id: `d${i}`,
  tipo: 'anelCarga',
  ativo: 'modo==3',
  centro: [0, 0, 0],
  normal: 'z',
  raio: `R*${(i + 0.5) / ANEIS}`,
  Q: `Qt*${(2 * i + 1) / ANEIS ** 2}`,
}))

const Ezteo =
  '(modo==1 ? k0*Qt*zz/(zz^2 + R^2)^1.5 : (modo==2 ? k0*Qt/(zz*sqrt(zz^2 + L^2)) : (modo==3 ? 2*k0*Qt/R^2*(1 - zz/sqrt(zz^2 + R^2)) : ' +
  '(modo==4 ? k0*Qt/((zz + L)^2 - L^2) : k0*lam0*pi*R^2/(R^2 + zz^2)^1.5))))'
const Vteo =
  '(modo==1 ? k0*Qt/sqrt(zz^2 + R^2) : (modo==2 ? k0*Qt/(2*L)*ln((sqrt(zz^2 + L^2) + L)/(sqrt(zz^2 + L^2) - L)) : ' +
  '(modo==3 ? 2*k0*Qt/R^2*(sqrt(zz^2 + R^2) - zz) : (modo==4 ? k0*Qt/(2*L)*ln((zz + 2*L)/zz) : 0))))'
/** Campo simulado na direção que importa em cada modo. */
const Ezsim = '(modo==2 ? z(E(0, 0, zz)) : (modo==4 ? x(E(L + zz, 0, 0)) : (modo==5 ? 0 - x(E(0, 0, zz)) : z(E(0, 0, zz)))))'
const Vsim = '(modo==4 ? V(L + zz, 0, 0) : V(0, 0, zz))'

export const distribuicoes: LabNovo = {
  grupo: 'Eletrostática',
  cenario: {
    id: 'distribuicoes',
    titulo: 'Distribuições contínuas de carga',
    resumo: 'Anel, haste, disco e arco: campo e potencial por integração.',
    teoria: r`Sem simetria para usar Gauss, soma-se a contribuição de cada elemento de carga: $d\vec E = k_0\,dq\,\hat r/r^2$ e $dV = k_0\,dq/r$. O **potencial é mais fácil**, porque é uma soma de números; o campo é uma soma de vetores, e a simetria costuma cancelar componentes.

No eixo de um anel, $E_z = \dfrac{k_0Qz}{(z^2+R^2)^{3/2}}$: nulo no centro, máximo em $z = R/\sqrt2$ e como o de uma carga pontual longe dele. Em um arco de ângulo $\alpha$, o campo no centro vale $E = \dfrac{2k_0\lambda}{R}\sin\dfrac{\alpha}{2}$.

No anel, uma carga negativa solta no eixo **oscila** através do centro; para pequenas amplitudes, o movimento é harmônico. Nas outras distribuições, $P$ percorre o eixo e o ponto anda sobre a curva $E(z)$.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [15, 11, 20], alvo: [0, 0, 1] }, tempo: { escala: 1, unidade: 's', passo: 0.005 } },
    parametros: [
      {
        id: 'modo',
        rotulo: 'Distribuição',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Anel' },
          { valor: 2, rotulo: 'Haste: mediatriz' },
          { valor: 3, rotulo: 'Disco' },
          { valor: 4, rotulo: 'Haste: prolongamento' },
          { valor: 5, rotulo: 'Anel λ₀ cos θ' },
          { valor: 6, rotulo: 'Arco' },
        ],
      },
      { id: 'Qt', rotulo: 'Carga total', simbolo: 'Q', valor: 3e-9, unidade: 'C', min: 0.5e-9, max: 6e-9, passo: 1e-10 },
      { id: 'lam0', rotulo: 'Amplitude da densidade', simbolo: r`\lambda_0`, valor: 5e-8, unidade: 'C/m', min: 1e-8, max: 1e-7, passo: 1e-9 },
      { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002 },
      { id: 'L', rotulo: 'Meia-haste', simbolo: 'L', valor: 0.04, unidade: 'm', min: 0.015, max: 0.07, passo: 0.002 },
      MOVIMENTO,
      { id: 'zz', rotulo: 'Distância do ponto P', simbolo: 'z', valor: 0.02, unidade: 'm', min: 0.008, max: 0.09, passo: 0.001, varre: { periodo: 10, ativo: 'auto==1 && modo!=1 && modo!=6' } },
      { id: 'alfa', rotulo: 'Abertura do arco', simbolo: r`\alpha`, valor: 120, unidade: '°', min: 20, max: 340, passo: 5, varre: { periodo: 12, ativo: 'auto==1 && modo==6' } },
    ],
    objetos: [
      { id: 'an', tipo: 'anelCarga', ativo: 'modo==1', centro: [0, 0, 0], normal: 'z', raio: 'R', Q: 'Qt', rotulo: 'anel' },
      { id: 'h1', tipo: 'segmentoCarga', ativo: 'modo==2 || modo==4', lambda: 'Qt/(2*L)', a: ['-L', 0, 0], b: ['L', 0, 0], rotulo: 'haste' },
      ...disco,
      { id: 'cs', tipo: 'anelCarga', ativo: 'modo==5', centro: [0, 0, 0], normal: 'z', raio: 'R', densidade: 'lam0*cos(theta)', rotulo: 'λ₀ cos θ' },
      { id: 'ar', tipo: 'anelCarga', ativo: 'modo==6', centro: [0, 0, 0], normal: 'z', raio: 'R', Q: 'Qt', arco: ['90 - alfa/2', '90 + alfa/2'], rotulo: 'arco' },
      { id: 'P', tipo: 'sonda', ativo: 'modo!=4 && modo!=6', campo: 'E', pos: [0, 0, 'zz'], arraste: { param: 'zz', eixo: 'z' }, rotulo: 'P' },
      { id: 'Px', tipo: 'sonda', ativo: 'modo==4', campo: 'E', pos: ['L + zz', 0, 0], arraste: { param: 'zz', eixo: 'x' }, rotulo: 'P' },
      { id: 'Pc', tipo: 'sonda', ativo: 'modo==6', campo: 'E', pos: [0, 0, 0], rotulo: 'centro' },
      { id: 'pa', tipo: 'particula', ativo: 'modo==1', q: '0-1e-10', m: 5.4e-6, pos: [0, 0, 0.06], v: [0, 0, 0], rotulo: 'carga −q' },
    ],
    visual: { linhasE: false, setasE: false },
    medidas: [
      { rotulo: 'Campo em P', simbolo: 'E(P)', expr: Ezsim, unidade: 'V/m', teoria: Ezteo, ativo: 'modo!=6' },
      { rotulo: 'Potencial em P', simbolo: 'V(P)', expr: Vsim, unidade: 'V', teoria: Vteo, ativo: 'modo<=4' },
      { rotulo: 'Potencial no eixo: carga total nula', simbolo: 'V(P)', expr: 'V(0, 0, zz)', unidade: 'V', teoria: '0', ativo: 'modo==5' },
      { rotulo: 'Campo no centro do arco', simbolo: r`\frac{2k_0\lambda}{R}\sin\frac{\alpha}{2}`, expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: '2*k0*Qt/(R*rad(alfa)*R)*sin(rad(alfa)/2)', ativo: 'modo==6' },
      { rotulo: 'Período para pequenas oscilações', simbolo: r`T = 2\pi\sqrt{\frac{mR^3}{k_0qQ}}`, expr: '2*pi*sqrt(5.4e-6*R^3/(k0*1e-10*Qt))', unidade: 's', ativo: 'modo==1' },
    ],
    graficos: [
      {
        titulo: 'Campo ao longo do caminho de P',
        tipo: 'perfil',
        ativo: 'modo!=6',
        x: { variavel: 'zp', de: 0.008, ate: 0.1, rotulo: 'distância', unidade: 'm', marca: "modo==1 ? max(abs(z(pos('pa'))), 0.008) : zz" },
        series: [
          { rotulo: 'simulação', expr: Ezsim.replaceAll('zz', 'zp'), unidade: 'V/m' },
          { rotulo: 'fórmula', expr: Ezteo.replaceAll('zz', 'zp'), unidade: 'V/m' },
        ],
      },
      {
        titulo: 'Oscilação da carga no eixo do anel',
        tipo: 'tempo',
        ativo: 'modo==1',
        janela: 10,
        series: [{ rotulo: 'z', expr: "z(pos('pa'))", unidade: 'm' }],
      },
    ],
    desafios: [
      {
        pergunta: 'No anel, leve $P$ ao ponto onde o campo é máximo.',
        dica: 'Derive $E_z(z)$: o máximo fica em $z = R/\\sqrt2$.',
        condicao: 'modo==1 && abs(zz - R/sqrt(2)) < 0.03*R',
        sucesso: 'Em $z = R/\\sqrt2$. Abaixo disso as componentes radiais quase se cancelam; acima, a distância pesa mais.',
      },
      {
        pergunta: 'Na haste, afaste $P$ até o campo se parecer com o de uma carga pontual.',
        condicao: 'auto==0 && modo==2 && zz > 3*L',
        sucesso: 'Longe da haste, $E \\to k_0Q/z^2$: o gráfico das duas curvas não distingue mais a forma da carga.',
      },
      {
        pergunta: 'No anel $\\lambda_0\\cos\\theta$, a carga total é nula. O campo no eixo é nulo?',
        condicao: 'modo==5',
        sucesso: 'Não: é o campo de um dipolo, perpendicular ao eixo, e cai com $1/z^3$. Só o potencial no eixo se anula.',
      },
    ],
  },
}

/* ───────────────── densidade variável: E(r) e V(r) ───────────────── */

const Ri = '(forma==2 ? a : 0)'
const Qesf = (s: string) => `4*pi*rho0*R^(0-n)*(min(max(${s}, ${Ri}), R)^(n+3) - ${Ri}^(n+3))/(n+3)`
const lamCil = (s: string) => `2*pi*rho0*R^(0-n)*min(${s}, R)^(n+2)/(n+2)`
const Eteo = (s: string) => `(forma==3 ? ${lamCil(s)}/(2*pi*eps0*${s}) : k0*${Qesf(s)}/${s}^2)`

export const densidade: LabNovo = {
  grupo: 'Eletrostática',
  cenario: {
    id: 'densidade',
    titulo: 'Gauss com densidade variável',
    resumo: 'ρ(r) em esferas, coroas e cilindros: E(r) e V(r) região por região.',
    teoria: r`Quando $\rho$ depende de $r$, a carga envolvida sai de uma integral:
$$Q_\text{enc}(r) = \int_0^r \rho(r')\,4\pi r'^2\,dr' \quad\text{(esfera)},\qquad \lambda_\text{enc}(s) = \int_0^s \rho(s')\,2\pi s'\,ds' \quad\text{(cilindro)}.$$

Daí, Gauss dá $E(r) = k_0Q_\text{enc}/r^2$ e $E(s) = \lambda_\text{enc}/2\pi\varepsilon_0 s$. Fora da distribuição só conta a carga total. O potencial sai integrando $E$ **de fora para dentro**, região por região, e é contínuo nas fronteiras, mesmo quando $E$ tem quina.

A gaussiana cresce e atravessa a distribuição: acompanhe o ponto nas curvas ao cruzar as fronteiras.`,
    cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [5, 6, 27], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      { id: 'forma', rotulo: 'Forma', valor: 1, opcoes: [{ valor: 1, rotulo: 'Esfera' }, { valor: 2, rotulo: 'Coroa esférica' }, { valor: 3, rotulo: 'Cilindro' }] },
      {
        id: 'n',
        rotulo: 'Lei da densidade ρ₀(r/R)ⁿ',
        valor: 1,
        opcoes: [
          { valor: -1, rotulo: 'n = −1' },
          { valor: 0, rotulo: 'n = 0' },
          { valor: 1, rotulo: 'n = 1' },
          { valor: 2, rotulo: 'n = 2' },
          { valor: 3, rotulo: 'n = 3' },
        ],
      },
      { id: 'rho0', rotulo: 'Densidade na borda', simbolo: r`\rho_0`, valor: 2e-6, unidade: 'C/m³', min: -4e-6, max: 4e-6, passo: 1e-7 },
      { id: 'R', rotulo: 'Raio externo', simbolo: 'R', valor: 0.06, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
      { id: 'a', rotulo: 'Raio interno da coroa', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.01, max: 0.028, passo: 0.002 },
      MOVIMENTO,
      { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.04, unidade: 'm', min: 0.008, max: 0.1, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1' } },
    ],
    objetos: [
      { id: 'esf', tipo: 'esfera', ativo: 'forma<=2', centro: [0, 0, 0], raio: 'R', raioInterno: 'forma==2 ? a : R*1e-4', rho: 'rho0*(r/R)^n', rotulo: 'ρ(r)' },
      { id: 'cil', tipo: 'cilindroInfinito', ativo: 'forma==3', ponto: [0, 0, 0], direcao: 'z', raio: 'R', raioInterno: 'R*1e-4', rho: 'rho0*(r/R)^n', rotulo: 'ρ(s)' },
      { id: 'G', tipo: 'gaussiana', ativo: 'forma<=2', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
      { id: 'Gc', tipo: 'gaussiana', ativo: 'forma==3', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'rg', altura: 0.05, rotulo: 'S' },
    ],
    visual: { setasE: true, densidade: 13 },
    medidas: [
      { rotulo: 'Fluxo por S (quadratura)', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "forma==3 ? fluxo('Gc') : fluxo('G')", unidade: 'V·m', teoria: `forma==3 ? ${lamCil('rg')}*0.05/eps0 : ${Qesf('rg')}/eps0` },
      { rotulo: 'Campo em r', simbolo: 'E(r)', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: Eteo('rg') },
      { rotulo: 'Carga total', simbolo: r`Q\ \text{ou}\ \lambda`, expr: `forma==3 ? ${lamCil('R')} : ${Qesf('R')}`, unidade: 'C' },
    ],
    graficos: [
      {
        titulo: 'Campo E(r): simulação × Gauss',
        tipo: 'perfil',
        x: { variavel: 'rr', de: 0.002, ate: 0.11, rotulo: 'r', unidade: 'm', marca: 'rg' },
        series: [
          { rotulo: 'simulação', expr: 'x(E(rr, 0, 0))', unidade: 'V/m' },
          { rotulo: 'Gauss', expr: Eteo('rr'), unidade: 'V/m' },
        ],
      },
      {
        titulo: 'Potencial V(r)',
        tipo: 'perfil',
        x: { variavel: 'rr', de: 0.002, ate: 0.11, rotulo: 'r', unidade: 'm', marca: 'rg' },
        series: [{ rotulo: 'V', expr: 'V(rr, 0, 0)', unidade: 'V' }],
      },
    ],
    desafios: [
      {
        pergunta: 'Na esfera, com qual lei $\\rho(r)$ o campo interno é **constante**?',
        dica: '$E \\propto Q_\\text{enc}/r^2$: é preciso $Q_\\text{enc} \\propto r^2$.',
        condicao: 'forma==1 && n==-1',
        sucesso: 'Com $n = -1$: $Q_\\text{enc} \\propto r^2$, e o $r^2$ cancela. O gráfico fica plano dentro da esfera.',
      },
      {
        pergunta: 'Coloque a gaussiana fora da distribuição. O campo depende de $n$?',
        condicao: 'auto==0 && rg > R',
        sucesso: 'Só pela carga total: fora, a forma de $\\rho(r)$ não importa, e a esfera age como uma carga pontual.',
      },
    ],
  },
}

/* ───────────────── planos e superposição ───────────────── */

const passo = (x0: string, s: string, p: string) => `(${p} > ${x0} ? 1 : -1)*${s}/(2*eps0)`
const Eplanos = (p: string) =>
  `(modo==3 ? ${passo('xa', 's1', p)} + k0*(4*pi*Re^2*s2)*(${p} - xb)/max(abs(${p} - xb), Re)^3 : ${passo('xa', 's1', p)} + ${passo('xb', 's2', p)} + (modo==2 ? ${passo('xc', 's3', p)} : 0))`

export const planos: LabNovo = {
  grupo: 'Eletrostática',
  cenario: {
    id: 'planos',
    titulo: 'Planos infinitos e superposição',
    resumo: 'Campo de dois e três planos, e plano com esfera, região por região.',
    teoria: r`Um plano infinito cria $E = \sigma/2\varepsilon_0$ em cada lado, sem depender da distância. Com vários planos, some os campos **com sinal**, região por região: o de cada plano aponta para fora dele se $\sigma > 0$.

Entre dois planos de cargas opostas os campos se somam, e fora se cancelam: é o capacitor ideal. O potencial é uma reta em cada região, com inclinação $-E$.

A carga livre atravessa os planos: em região sem campo sua velocidade não muda; nas outras, a aceleração é constante, porque o campo de um plano não depende da distância.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 24], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.005 } },
    parametros: [
      { id: 'modo', rotulo: 'Arranjo', valor: 2, opcoes: [{ valor: 1, rotulo: 'Dois planos' }, { valor: 2, rotulo: 'Três planos' }, { valor: 3, rotulo: 'Plano e esfera' }] },
      { id: 's1', rotulo: 'Densidade 1', simbolo: r`\sigma_1`, valor: 2e-9, unidade: 'C/m²', min: -6e-9, max: 6e-9, passo: 1e-10 },
      { id: 's2', rotulo: 'Densidade 2', simbolo: r`\sigma_2`, valor: 4e-9, unidade: 'C/m²', min: -6e-9, max: 6e-9, passo: 1e-10 },
      { id: 's3', rotulo: 'Densidade 3', simbolo: r`\sigma_3`, valor: -2e-9, unidade: 'C/m²', min: -6e-9, max: 6e-9, passo: 1e-10 },
      { id: 'xa', rotulo: 'Posição do plano 1', simbolo: 'x_1', valor: -0.06, unidade: 'm', min: -0.09, max: -0.03, passo: 0.002 },
      { id: 'xb', rotulo: 'Posição do objeto 2', simbolo: 'x_2', valor: 0, unidade: 'm', min: -0.02, max: 0.03, passo: 0.002 },
      { id: 'xc', rotulo: 'Posição do plano 3', simbolo: 'x_3', valor: 0.06, unidade: 'm', min: 0.04, max: 0.09, passo: 0.002 },
      { id: 'Re', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
      MOVIMENTO,
      { id: 'xP', rotulo: 'Posição do ponto P', simbolo: 'x', valor: -0.03, unidade: 'm', min: -0.1, max: 0.1, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1' } },
    ],
    objetos: [
      { id: 'p1', tipo: 'planoInfinito', sigma: 's1', ponto: ['xa', 0, 0], normal: 'x', rotulo: 'σ₁' },
      { id: 'p2', tipo: 'planoInfinito', ativo: 'modo<=2', sigma: 's2', ponto: ['xb', 0, 0], normal: 'x', rotulo: 'σ₂' },
      { id: 'p3', tipo: 'planoInfinito', ativo: 'modo==2', sigma: 's3', ponto: ['xc', 0, 0], normal: 'x', rotulo: 'σ₃' },
      { id: 'es', tipo: 'esfera', ativo: 'modo==3', Q: '4*pi*Re^2*s2', centro: ['xb', 0, 0], raio: 'Re', oca: true, rotulo: 'σ₂ na esfera' },
      { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'P' },
      { id: 'pv', tipo: 'particula', ativo: 'modo<=2', q: 1e-10, m: 1e-6, pos: ['xa + 0.005', 0.03, 0], v: [0.03, 0, 0], rotulo: 'carga livre' },
    ],
    visual: { setasE: true, densidade: 11 },
    medidas: [
      { rotulo: 'Campo em P', simbolo: 'E_x(P)', expr: 'x(E(xP, 0, 0))', unidade: 'V/m', teoria: `abs(xP - xb) < Re && modo==3 ? ${passo('xa', 's1', 'xP')} : ${Eplanos('xP')}` },
      { rotulo: 'Potencial em P', simbolo: 'V(P)', expr: 'V(xP, 0, 0)', unidade: 'V' },
      { rotulo: 'Velocidade da carga livre', simbolo: 'v_x', expr: "x(vel('pv'))", unidade: 'm/s', ativo: 'modo<=2' },
    ],
    graficos: [
      {
        titulo: 'Campo e potencial ao longo de x',
        tipo: 'perfil',
        x: { variavel: 'xx', de: -0.1, ate: 0.1, rotulo: 'x', unidade: 'm', marca: 'xP' },
        series: [
          { rotulo: 'E_x', expr: 'x(E(xx, 0, 0))', unidade: 'V/m' },
          { rotulo: 'V', expr: 'V(xx, 0, 0)', unidade: 'V' },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Com dois planos, faça o campo se anular **fora** deles.',
        dica: 'Os campos só se cancelam fora se as densidades forem opostas.',
        condicao: 'modo==1 && abs(s1 + s2) < 2e-10 && abs(s1) > 1e-9',
        sucesso: 'É o capacitor ideal: todo o campo fica entre as placas, com $E = \\sigma/\\varepsilon_0$.',
      },
      {
        pergunta: 'Com três planos, ache uma região em que o campo seja nulo.',
        condicao: 'auto==0 && modo==2 && abs(x(E(xP, 0, 0))) < 5',
        sucesso: 'Numa região sem campo, o potencial é constante: o gráfico de $V$ fica plano ali.',
      },
    ],
  },
}

/* ───────────────── condutores em equilíbrio ───────────────── */

const A = 0.04
const B = 0.08
const oco = condutorOco(A, B, 'qp', 'Qc', 'xq')

export const condutores: LabNovo = {
  grupo: 'Eletrostática',
  cenario: {
    id: 'condutores',
    titulo: 'Condutores em equilíbrio',
    resumo: 'Cavidades, cargas induzidas, blindagem e aterramento.',
    teoria: r`Em equilíbrio, **o campo é nulo dentro do metal**. Uma gaussiana passada dentro dele tem fluxo zero, e daí saem as regras:

- a carga líquida fica nas superfícies;
- com uma carga $q$ na cavidade, a face interna fica com $-q$, onde quer que $q$ esteja;
- a face externa fica com $Q + q$, distribuída uniformemente numa esfera: **de fora, não dá para saber onde $q$ está**.

Aterrar fixa o potencial do condutor em zero: entra ou sai carga pela terra até isso valer.

A carga passeia pela cavidade: o campo dentro dela muda o tempo todo, e o de fora fica parado. Essa é a blindagem acontecendo.`,
    cena: { escala: 0.01, extensao: 13, unidade: 'cm', plano: 'xy', camera: { pos: [5, 6, 29], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      { id: 'modo', rotulo: 'Situação', valor: 1, opcoes: [{ valor: 1, rotulo: 'Esfera com cavidade' }, { valor: 2, rotulo: 'Tubo e fio' }, { valor: 3, rotulo: 'Placa e condutor' }] },
      { id: 'qp', rotulo: 'Carga na cavidade', simbolo: 'q', valor: 3e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
      { id: 'Qc', rotulo: 'Carga do condutor', simbolo: 'Q', valor: -2e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
      MOVIMENTO,
      { id: 'xq', rotulo: 'Posição da carga na cavidade', simbolo: 'x_q', valor: 0, unidade: 'm', min: -0.03, max: 0.03, passo: 0.001, varre: { periodo: 10, ativo: 'auto==1 && modo==1' } },
      { id: 'lam', rotulo: 'Densidade do fio', simbolo: r`\lambda`, valor: 5e-9, unidade: 'C/m', min: -8e-9, max: 8e-9, passo: 1e-10, varre: { periodo: 12, ativo: 'auto==1 && modo==2' } },
      { id: 'lamC', rotulo: 'Densidade do tubo', simbolo: r`\lambda_c`, valor: 0, unidade: 'C/m', min: -8e-9, max: 8e-9, passo: 1e-10 },
      { id: 'sig', rotulo: 'Densidade da placa', simbolo: r`\sigma`, valor: 1e-8, unidade: 'C/m²', min: -2e-8, max: 2e-8, passo: 1e-9, varre: { periodo: 12, ativo: 'auto==1 && modo==3' } },
      { id: 'terra', rotulo: 'Condutor', valor: 1, opcoes: [{ valor: 0, rotulo: 'Neutro, isolado' }, { valor: 1, rotulo: 'Aterrado' }] },
    ],
    objetos: [
      { id: 'cond', tipo: 'esfera', ativo: 'modo==1', Q: 0, centro: [0, 0, 0], raio: B, raioInterno: A },
      { id: 'q', tipo: 'carga', ativo: 'modo==1', q: 'qp', pos: ['xq', 0, 0], arraste: { param: 'xq', eixo: 'x' }, rotulo: 'q' },
      { id: 'ind', tipo: 'campoE', ativo: 'modo==1', valor: oco.campo, potencial: oco.potencial },
      { id: 'Sm', tipo: 'gaussiana', ativo: 'modo==1', forma: 'esfera', centro: [0, 0, 0], raio: 0.06, rotulo: 'S no metal' },
      { id: 'lin', tipo: 'linhaInfinita', ativo: 'modo==2', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', rotulo: 'λ' },
      { id: 'fa', tipo: 'cilindroInfinito', ativo: 'modo==2', lambda: '0-lam', ponto: [0, 0, 0], direcao: 'z', raio: A, oco: true },
      { id: 'fb', tipo: 'cilindroInfinito', ativo: 'modo==2', lambda: 'lam + lamC', ponto: [0, 0, 0], direcao: 'z', raio: B, oco: true },
      { id: 'Gm', tipo: 'gaussiana', ativo: 'modo==2', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 0.06, altura: 0.06, rotulo: 'S no metal' },
      { id: 'fina', tipo: 'planoInfinito', ativo: 'modo==3', sigma: 'sig', ponto: [-0.04, 0, 0], normal: 'x', rotulo: 'σ' },
      { id: 'esq', tipo: 'planoInfinito', ativo: 'modo==3', sigma: 'terra==1 ? 0-sig : 0-sig/2', ponto: [0.03, 0, 0], normal: 'x' },
      { id: 'dir', tipo: 'planoInfinito', ativo: 'modo==3', sigma: 'terra==1 ? 0 : sig/2', ponto: [0.06, 0, 0], normal: 'x' },
      { id: 'tM', tipo: 'rotulo', ativo: 'modo==3', pos: [0.045, 0.07, 0], texto: 'condutor' },
    ],
    visual: { setasE: true, densidade: 13 },
    medidas: [
      { rotulo: 'Carga líquida dentro de S (no metal)', simbolo: r`\varepsilon_0\oint\vec E\cdot d\vec A`, expr: "eps0*fluxo('Sm')", unidade: 'C', teoria: '0', ativo: 'modo==1' },
      { rotulo: 'Carga na face interna', simbolo: 'q_i', expr: "eps0*fluxo('Sm') - qp", unidade: 'C', teoria: '0-qp', ativo: 'modo==1' },
      { rotulo: 'Carga na face externa', simbolo: 'q_e', expr: "eps0*4*pi*0.11^2*y(E(0, 0.11, 0)) - eps0*fluxo('Sm')", unidade: 'C', teoria: 'Qc + qp', ativo: 'modo==1' },
      { rotulo: 'Campo no metal', simbolo: 'E', expr: 'mag(E(0.06, 0, 0))', unidade: 'V/m', teoria: '0', ativo: 'modo==1' },
      { rotulo: 'Carga líquida por metro no metal', simbolo: r`\lambda_S`, expr: "eps0*fluxo('Gm')/0.06", unidade: 'C/m', teoria: '0', ativo: 'modo==2' },
      { rotulo: 'Densidade na face interna', simbolo: r`\sigma_a`, expr: '0 - eps0*x(E(0.999*0.04, 0, 0))', unidade: 'C/m²', teoria: '0 - lam/(2*pi*0.04)', ativo: 'modo==2' },
      { rotulo: 'Densidade na face externa', simbolo: r`\sigma_b`, expr: 'eps0*x(E(1.001*0.08, 0, 0))', unidade: 'C/m²', teoria: '(lam + lamC)/(2*pi*0.08)', ativo: 'modo==2' },
      { rotulo: 'Campo à esquerda da placa', simbolo: 'E_x', expr: 'x(E(-0.08, 0, 0))', unidade: 'V/m', teoria: 'terra==1 ? 0 : 0-sig/(2*eps0)', ativo: 'modo==3' },
      { rotulo: 'Campo entre a placa e o condutor', simbolo: 'E_x', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: 'terra==1 ? sig/eps0 : sig/(2*eps0)', ativo: 'modo==3' },
      { rotulo: 'Campo no metal', simbolo: 'E_x', expr: 'x(E(0.045, 0, 0))', unidade: 'V/m', teoria: '0', ativo: 'modo==3' },
    ],
    desafios: [
      {
        pergunta: 'Na esfera, arraste $q$ dentro da cavidade. O campo **fora** do condutor muda?',
        condicao: 'auto==0 && modo==1 && abs(xq) > 0.015',
        sucesso: 'Não: o metal blinda. Fora só importa $Q + q$; a face interna é que muda a distribuição de $-q$.',
      },
      {
        pergunta: 'Na placa, aterre o condutor. Para onde foi o campo do lado de fora?',
        condicao: 'modo==3 && terra==1',
        sucesso: 'Sumiu: a face voltada para a placa fica com $-\\sigma$ e a outra, neutra. O campo fica preso entre os dois.',
      },
    ],
  },
}

/* ───────────────── energia eletrostática ───────────────── */

const U12 = "k0*(c1*c2/dist('c1','c2') + c1*c3/dist('c1','c3') + c2*c3/dist('c2','c3'))"
/** Projétil de 1 nC e massa que o faz levar alguns segundos para ir e voltar. */
const mP = '2.4e-4'
const Kp = `(${mP}/2*mag(vel('pj'))^2)`
const Up = "(1e-9*(V(pos('pj')) - V(0.1, 0, 0)))"

export const energia: LabNovo = {
  grupo: 'Eletrostática',
  cenario: {
    id: 'energia',
    titulo: 'Energia eletrostática',
    resumo: 'Energia de um sistema de cargas, energia no campo e conservação.',
    teoria: r`A energia de um sistema de cargas é o trabalho para montá-lo a partir do infinito: $U = k_0\sum_{i<j} q_iq_j/r_{ij}$. O sinal importa: cargas opostas têm $U < 0$.

Ela também pode ser vista **no campo**, com densidade $u = \varepsilon_0E^2/2$. Por isso a mesma carga guarda menos energia numa esfera condutora ($k_0Q^2/2R$), que não tem campo dentro, do que numa bola uniforme ($3k_0Q^2/5R$).

Sem atrito, $K + qV$ se conserva: é o caminho mais curto para achar a máxima aproximação de uma partícula lançada contra uma carga. No lançamento, veja o projétil frear, parar exatamente onde $K = 0$ e voltar.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [14, 13, 19], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.004 } },
    parametros: [
      { id: 'modo', rotulo: 'Situação', valor: 1, opcoes: [{ valor: 1, rotulo: 'Três cargas' }, { valor: 2, rotulo: 'Energia no campo' }, { valor: 3, rotulo: 'Lançamento' }] },
      { id: 'c1', rotulo: 'Carga 1', simbolo: 'q_1', valor: 3e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
      { id: 'c2', rotulo: 'Carga 2', simbolo: 'q_2', valor: -2e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
      { id: 'c3', rotulo: 'Carga 3', simbolo: 'q_3', valor: 2e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
      { id: 'tipoE', rotulo: 'Esfera', valor: 1, opcoes: [{ valor: 1, rotulo: 'Condutora' }, { valor: 2, rotulo: 'Bola uniforme' }] },
      { id: 'Qe', rotulo: 'Carga da esfera', simbolo: 'Q', valor: 5e-9, unidade: 'C', min: 1e-9, max: 1e-8, passo: 1e-10 },
      MOVIMENTO,
      { id: 'Re', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.01, max: 0.05, passo: 0.002, varre: { periodo: 12, ativo: 'auto==1 && modo==2' } },
      { id: 'K0', rotulo: 'Energia cinética inicial', simbolo: 'K_0', valor: 3e-7, unidade: 'J', min: 5e-8, max: 1e-6, passo: 1e-8 },
      { id: 'z3', rotulo: 'Distância de q₃', simbolo: 'z', valor: 0.05, unidade: 'm', min: 0.015, max: 0.1, passo: 0.001, varre: { periodo: 10, ativo: 'auto==1 && modo==1' } },
    ],
    objetos: [
      { id: 'c1', tipo: 'carga', ativo: 'modo==1', q: 'c1', pos: [-0.04, 0, 0], arrastavel: true, rotulo: 'q₁' },
      { id: 'c2', tipo: 'carga', ativo: 'modo==1', q: 'c2', pos: [0.04, 0, 0], arrastavel: true, rotulo: 'q₂' },
      { id: 'c3', tipo: 'carga', ativo: 'modo==1', q: 'c3', pos: [0, 0, 'z3'], arraste: { param: 'z3', eixo: 'z' }, rotulo: 'q₃' },
      { id: 'cond', tipo: 'esfera', ativo: 'modo==2 && tipoE==1', Q: 'Qe', centro: [0, 0, 0], raio: 'Re', oca: true, rotulo: 'condutora' },
      { id: 'bola', tipo: 'esfera', ativo: 'modo==2 && tipoE==2', Q: 'Qe', centro: [0, 0, 0], raio: 'Re', rotulo: 'bola' },
      { id: 'alvo', tipo: 'esfera', ativo: 'modo==3', Q: 'Qe', centro: [0, 0, 0], raio: 'Re', oca: true, rotulo: 'alvo' },
      { id: 'pj', tipo: 'particula', ativo: 'modo==3', q: 1e-9, m: mP, pos: [0.1, 0, 0], v: [`0 - sqrt(2*K0/${mP})`, 0, 0], parada: 'sqrt(x^2 + y^2 + z^2) < Re', rotulo: 'projétil +q' },
    ],
    visual: { linhasE: true },
    medidas: [
      { rotulo: 'Energia do sistema', simbolo: 'U', expr: "c1*Vde('c2', pos('c1')) + c1*Vde('c3', pos('c1')) + c2*Vde('c3', pos('c2'))", unidade: 'J', teoria: U12, ativo: 'modo==1' },
      { rotulo: 'Trabalho para trazer q₃', simbolo: 'W = q_3 V', expr: "c3*(Vde('c1', pos('c3')) + Vde('c2', pos('c3')))", unidade: 'J', teoria: "k0*c3*(c1/dist('c1','c3') + c2/dist('c2','c3'))", ativo: 'modo==1' },
      { rotulo: 'Energia integrada no campo', simbolo: r`\int\frac{\varepsilon_0E^2}{2}dV`, expr: 'energiaCampo()', unidade: 'J', teoria: 'tipoE==1 ? k0*Qe^2/(2*Re) : 3*k0*Qe^2/(5*Re)', ativo: 'modo==2' },
      { rotulo: 'Fração dentro da esfera', simbolo: 'U_i/U', expr: 'tipoE==1 ? 0 : 1/6', unidade: '', ativo: 'modo==2' },
      { rotulo: 'Energia cinética agora', simbolo: 'K', expr: Kp, unidade: 'J', ativo: 'modo==3' },
      { rotulo: 'Energia potencial agora', simbolo: 'U', expr: Up, unidade: 'J', ativo: 'modo==3' },
      { rotulo: 'Soma', simbolo: 'K + U', expr: `${Kp} + ${Up}`, unidade: 'J', teoria: 'K0', ativo: 'modo==3' },
      { rotulo: 'Máxima aproximação', simbolo: r`r_\text{mín}`, expr: '1/(K0/(k0*Qe*1e-9) + 1/0.1)', unidade: 'm', ativo: 'modo==3' },
    ],
    graficos: [
      {
        titulo: 'Trazer q₃: energia do sistema em função de z',
        tipo: 'perfil',
        ativo: 'modo==1',
        x: { variavel: 'zs', de: 0.015, ate: 0.1, rotulo: 'z', unidade: 'm', marca: 'z3' },
        series: [{ rotulo: 'U', expr: "k0*c1*c2/dist('c1','c2') + c3*(Vde('c1', 0, 0, zs) + Vde('c2', 0, 0, zs))", unidade: 'J' }],
      },
      {
        titulo: 'Densidade de energia por casca, ε₀E²/2 · 4πr²',
        tipo: 'perfil',
        ativo: 'modo==2',
        x: { variavel: 'rr', de: 0.002, ate: 0.11, rotulo: 'r', unidade: 'm' },
        series: [{ rotulo: 'dU/dr', expr: '2*pi*eps0*rr^2*mag(E(rr, 0, 0))^2', unidade: 'J/m' }],
      },
      {
        titulo: 'Lançamento: K e U ao longo de r (q = 1 nC)',
        tipo: 'perfil',
        ativo: 'modo==3',
        x: { variavel: 'rr', de: 0.03, ate: 0.1, rotulo: 'r', unidade: 'm', marca: "mag(pos('pj'))" },
        series: [
          { rotulo: 'U = qV', expr: '1e-9*(V(rr, 0, 0) - V(0.1, 0, 0))', unidade: 'J' },
          { rotulo: 'K', expr: 'K0 - 1e-9*(V(rr, 0, 0) - V(0.1, 0, 0))', unidade: 'J' },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Arranje as três cargas para a energia do sistema ser **negativa**.',
        condicao: `auto==0 && modo==1 && ${U12} < 0`,
        sucesso: 'Energia negativa: o sistema está ligado. Foi preciso **retirar** energia para montá-lo, e será preciso dar energia para desmontá-lo.',
      },
      {
        pergunta: 'Compare a esfera condutora com a bola uniforme, com a mesma carga e o mesmo raio.',
        condicao: 'modo==2 && tipoE==2',
        sucesso: 'A bola guarda 6/5 da energia da condutora: o campo de fora é idêntico, e a diferença é o campo que existe dentro dela.',
      },
    ],
  },
}

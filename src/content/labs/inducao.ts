import { type LabNovo, r } from './tipos'

/* ───────────────── fluxo que muda: barra, região, fio e B(t) ───────────────── */

const g = '(B0^2*L^2/(mm*Rr))'
const xb = `(x0 + v0/${g}*(1 - exp(0-${g}*t)))`
const vb = `(v0*exp(0-${g}*t))`
const xr = '(-0.0125 + v2*t)'
const xf = '(s0 + v2*t)'
const SID = "(modo==1 ? 'Sb' : (modo==2 ? 'Si' : (modo==3 ? 'Sf' : 'St')))"

export const movimento: LabNovo = {
  grupo: 'Indução',
  cenario: {
    id: 'movimento',
    titulo: 'Fluxo que muda: barra, região, fio e B(t)',
    resumo: 'Barra em trilhos, espira cruzando um campo, espira saindo de perto de um fio.',
    teoria: r`$\Phi_B = \int\vec B\cdot d\vec A$ muda por três caminhos: a **área**, o **campo** ou o **ângulo**. Em todos, $\varepsilon = -d\Phi_B/dt$.

**Barra em trilhos:** $\varepsilon = BLv$, $I = \varepsilon/R$ e a força magnética $F = ILB$ freia a barra. A velocidade cai exponencialmente, $v = v_0e^{-\gamma t}$, com $\gamma = B^2L^2/mR$, e toda a energia cinética vira calor.

**Espira cruzando uma região de campo:** só há fem nas transições. Com a espira inteira dentro, o fluxo é grande, mas constante, e $\varepsilon = 0$.

**$B(t)$ num lugar fixo:** o campo variável cria um campo elétrico induzido de linhas fechadas, $\oint\vec E\cdot d\vec\ell = -d\Phi_B/dt$, mesmo fora da região onde $B \neq 0$.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [4, 1, 25], alvo: [3, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, duracao: 8 } },
    parametros: [
      {
        id: 'modo',
        rotulo: 'Experimento',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Barra em trilhos' },
          { valor: 2, rotulo: 'Espira e região' },
          { valor: 3, rotulo: 'Espira e fio' },
          { valor: 4, rotulo: 'B(t) uniforme' },
        ],
      },
      { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
      { id: 'v0', rotulo: 'Velocidade inicial da barra', simbolo: 'v_0', valor: 0.1, unidade: 'm/s', min: 0.02, max: 0.3, passo: 0.01 },
      { id: 'L', rotulo: 'Distância entre os trilhos', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.03, max: 0.12, passo: 0.002 },
      { id: 'mm', rotulo: 'Massa da barra', simbolo: 'm', valor: 0.02, unidade: 'kg', min: 0.005, max: 0.1, passo: 0.005 },
      { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.02, max: 0.5, passo: 0.01 },
      { id: 'x0', rotulo: 'Posição inicial da barra', simbolo: 'x_0', valor: 0.02, unidade: 'm', min: 0.01, max: 0.05, passo: 0.005 },
      { id: 'v2', rotulo: 'Velocidade da espira', simbolo: 'v', valor: 0.02, unidade: 'm/s', min: 0.005, max: 0.05, passo: 0.001 },
      { id: 'a', rotulo: 'Lado da espira', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.015, max: 0.05, passo: 0.001 },
      { id: 'W', rotulo: 'Largura da região', simbolo: 'W', valor: 0.08, unidade: 'm', min: 0.05, max: 0.11, passo: 0.002 },
      { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 2, max: 50, passo: 1 },
      { id: 's0', rotulo: 'Distância inicial ao fio', simbolo: 's_0', valor: 0.01, unidade: 'm', min: 0.005, max: 0.04, passo: 0.001 },
      { id: 'w', rotulo: 'Frequência angular', simbolo: r`\omega`, valor: 3, unidade: 'rad/s', min: 0.5, max: 8, passo: 0.1 },
      { id: 'Ra', rotulo: 'Raio da espira fixa', simbolo: 'R_e', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002 },
    ],
    objetos: [
      { id: 'Bb', tipo: 'campoB', ativo: 'modo==1', valor: [0, 0, 'B0'], rotulo: 'B' },
      { id: 'Sb', tipo: 'espiraSensora', ativo: 'modo==1', centro: [`${xb}/2`, 0, 0], normal: 'z', largura: xb, altura: 'L', eixoU: 'x', R: 'Rr', rotulo: 'circuito' },
      { id: 'tr', tipo: 'caminho', ativo: 'modo==1', seta: 0, pontos: [[0.1, 'L/2', 0], [0, 'L/2', 0], [0, '0-L/2', 0], [0.1, '0-L/2', 0]], rotulo: 'trilhos' },
      { id: 'bar', tipo: 'caminho', ativo: 'modo==1', pontos: [[xb, 'L/2', 0], [xb, '0-L/2', 0]], rotulo: 'barra' },
      { id: 'sv', tipo: 'seta', ativo: 'modo==1', papel: 'v', origem: [xb, 0, 0], vetor: [1, 0, 0], comprimento: `4*cm*${vb}/v0 + 0.3*cm`, rotulo: 'v' },
      { id: 'Br', tipo: 'campoB', ativo: 'modo==2', valor: [0, 0, 'B0'], regiao: { min: [0, -0.05, -0.03], max: ['W', 0.05, 0.03] }, rotulo: 'B' },
      { id: 'M', tipo: 'espiraSensora', ativo: 'modo==2', centro: [`${xr} - a/2`, 0, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
      {
        id: 'Si',
        tipo: 'espiraSensora',
        ativo: 'modo==2',
        centro: [`(max(${xr} - a, 0) + min(${xr}, W))/2`, 0, 0],
        normal: 'z',
        largura: `max(min(${xr}, W) - max(${xr} - a, 0), 1e-9)`,
        altura: 'a',
        eixoU: 'x',
        R: 'Rr',
        oculta: true,
      },
      { id: 'fy', tipo: 'fioInfinito', ativo: 'modo==3', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
      { id: 'Sf', tipo: 'espiraSensora', ativo: 'modo==3', centro: [`${xf} + a/2`, 0, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
      { id: 'Bt', tipo: 'campoB', ativo: 'modo==4', valor: [0, 0, 'B0*cos(w*t)'], rotulo: 'B(t)' },
      { id: 'Ei', tipo: 'campoE', ativo: 'modo==4', valor: '[0-y, x, 0]*(B0*w*sin(w*t)/2)', rotulo: 'E induzido' },
      { id: 'St', tipo: 'espiraSensora', ativo: 'modo==4', centro: [0, 0, 0], normal: 'z', raio: 'Ra', R: 'Rr', rotulo: 'espira' },
    ],
    visual: { setasB: true, setasE: false, densidade: 9, planoSetas: 'xy' },
    medidas: [
      { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: `fluxoB(${SID})`, unidade: 'Wb' },
      { rotulo: 'fem induzida', simbolo: r`\varepsilon`, expr: `fem(${SID})`, unidade: 'V' },
      { rotulo: 'Corrente induzida', simbolo: r`I = \varepsilon/R`, expr: `Iind(${SID})`, unidade: 'A' },
      { rotulo: 'fem na barra', simbolo: r`|\varepsilon| = BLv`, expr: "abs(fem('Sb'))", unidade: 'V', teoria: `B0*L*${vb}`, ativo: 'modo==1' },
      { rotulo: 'Velocidade da barra', simbolo: r`v = v_0e^{-\gamma t}`, expr: vb, unidade: 'm/s', ativo: 'modo==1' },
      { rotulo: 'Força freando a barra', simbolo: 'F = ILB', expr: "abs(Iind('Sb'))*L*B0", unidade: 'N', teoria: `B0^2*L^2*${vb}/Rr`, ativo: 'modo==1' },
      { rotulo: 'Calor dissipado até agora', simbolo: 'Q', expr: `mm*(v0^2 - ${vb}^2)/2`, unidade: 'J', ativo: 'modo==1' },
      { rotulo: 'fem na espira', simbolo: r`|\varepsilon| = Bav`, expr: "abs(fem('Si'))", unidade: 'V', teoria: `B0*a*v2*((${xr} > 0 && ${xr} < a) || (${xr} > W && ${xr} < W + a) ? 1 : 0)`, ativo: 'modo==2' },
      { rotulo: 'Fluxo da espira no campo do fio', simbolo: r`|\Phi_B| = \frac{\mu_0Ia}{2\pi}\ln\frac{s+a}{s}`, expr: "abs(fluxoB('Sf'))", unidade: 'Wb', teoria: `mu0*I0*a/(2*pi)*ln((${xf} + a)/${xf})`, ativo: 'modo==3' },
      { rotulo: 'fem na espira', simbolo: r`|\varepsilon| = \frac{\mu_0Iav}{2\pi}\left(\frac1s - \frac1{s+a}\right)`, expr: "abs(fem('Sf'))", unidade: 'V', teoria: `mu0*I0*a*v2/(2*pi)*(1/${xf} - 1/(${xf} + a))`, ativo: 'modo==3' },
      { rotulo: 'fem na espira', simbolo: r`\varepsilon = \pi R^2B\omega\sin\omega t`, expr: "fem('St')", unidade: 'V', teoria: 'pi*Ra^2*B0*w*sin(w*t)', ativo: 'modo==4' },
    ],
    graficos: [
      {
        titulo: 'Fluxo e fem no tempo',
        tipo: 'tempo',
        janela: 8,
        series: [
          { rotulo: 'Φ', expr: `fluxoB(${SID})`, unidade: 'Wb' },
          { rotulo: 'ε', expr: `fem(${SID})`, unidade: 'V' },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Com a espira inteira dentro da região, quanto vale a fem?',
        condicao: `modo==2 && ${xr} > a && ${xr} < W`,
        sucesso: 'Zero: o fluxo é grande, mas não muda. A fem só aparece ao entrar e ao sair, com sinais opostos.',
      },
      {
        pergunta: 'Na barra, dobre $B$. O que acontece com a frenagem?',
        condicao: 'modo==1 && B0 >= 0.95',
        sucesso: 'Fica 4 vezes mais rápida: $\\gamma \\propto B^2$, porque $B$ entra na fem e também na força.',
      },
      {
        pergunta: 'Em $B(t)$, ache um instante em que $B$ é máximo. A fem também é?',
        condicao: 'modo==4 && abs(cos(w*t)) > 0.97',
        sucesso: 'Não: nesse instante a fem é nula. Ela depende da taxa de variação, e $B$ e $\\varepsilon$ estão defasados de 90°.',
      },
    ],
  },
}

/* ───────────────── Ampère-Maxwell ───────────────── */

const Ic = 'q0/tau*exp(0-t/tau)'

export const maxwell: LabNovo = {
  grupo: 'Indução',
  cenario: {
    id: 'maxwell',
    titulo: 'Corrente de deslocamento',
    resumo: 'Campo magnético entre as placas de um capacitor que está carregando.',
    teoria: r`Entre as placas de um capacitor não passa corrente, mas existe campo magnético. Ampère precisa de um termo a mais:
$$\oint\vec B\cdot d\vec\ell = \mu_0\left(I_\text{enc} + \varepsilon_0\frac{d\Phi_E}{dt}\right).$$

O termo $I_d = \varepsilon_0\,d\Phi_E/dt$ é a **corrente de deslocamento**. Entre as placas ela é igual à corrente no fio, o que devolve a continuidade. Dentro das placas, $B$ cresce com $s$; fora delas, cai com $1/s$, como se a corrente continuasse pelo espaço.`,
    cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [3, 5, 22], alvo: [0, 0, 0] }, tempo: { escala: 5e-7, unidade: 'µs', passo: 1e-9, duracao: 5e-6 } },
    parametros: [
      { id: 'q0', rotulo: 'Carga final', simbolo: 'q_0', valor: 1e-5, unidade: 'C', min: 2e-6, max: 2e-5, passo: 1e-6 },
      { id: 'tau', rotulo: 'Constante de tempo', simbolo: r`\tau`, valor: 1e-6, unidade: 's', min: 5e-7, max: 3e-6, passo: 1e-7 },
      { id: 'a', rotulo: 'Raio das placas', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
      { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.002 },
      { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.005, max: 0.08, passo: 0.001 },
    ],
    objetos: [
      { id: 'cap', tipo: 'capacitor', rotulo: 'Capacitor', centro: [0, 0, 0], eixo: 'x', lado: '2*a', circular: true, d: 'd', Q: 'q0*(1 - exp(0-t/tau))' },
      {
        id: 'Bin',
        tipo: 'campoB',
        valor: `mag([0, y, z]) < a && abs(x) < d/2 ? mu0*(${Ic})/(2*pi*a^2)*[0, 0-z, y] : mu0*(${Ic})/(2*pi)*[0, 0-z, y]/(y^2 + z^2 + 1e-9)`,
        rotulo: 'B induzido',
      },
      { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'x', raio: 'rs', rotulo: 'C' },
      { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'x', raio: 'min(rs, a)', oculta: true },
      { id: 'Sa', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'x', raio: 'a', oculta: true },
      { id: 'fe', tipo: 'caminho', pontos: [[-0.085, 0, 0], ['0-d/2', 0, 0]], rotulo: 'I' },
      { id: 'fd', tipo: 'caminho', pontos: [['d/2', 0, 0], [0.085, 0, 0]], rotulo: 'I' },
    ],
    visual: { setasB: true, densidade: 9 },
    medidas: [
      { rotulo: 'Corrente no fio', simbolo: 'I', expr: Ic, unidade: 'A' },
      { rotulo: 'Corrente de deslocamento nas placas', simbolo: r`I_d = \varepsilon_0\frac{d\Phi_E}{dt}`, expr: "eps0*dfluxoE('Sa')", unidade: 'A', teoria: Ic },
      { rotulo: 'Parte dela que passa pelo caminho', simbolo: r`I_d(s)`, expr: "eps0*dfluxoE('S')", unidade: 'A', teoria: `${Ic}*min(rs/a, 1)^2` },
      { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: "mu0*eps0*dfluxoE('S')" },
      { rotulo: 'Campo no caminho', simbolo: 'B(s)', expr: 'mag(B(0, rs, 0))', unidade: 'T', teoria: `rs < a ? mu0*(${Ic})*rs/(2*pi*a^2) : mu0*(${Ic})/(2*pi*rs)` },
    ],
    graficos: [
      {
        titulo: 'Campo B(s) entre as placas',
        tipo: 'perfil',
        x: { variavel: 'ss', de: 0.002, ate: 0.085, rotulo: 's', unidade: 'm' },
        series: [{ rotulo: 'B', expr: 'mag(B(0, ss, 0))', unidade: 'T' }],
      },
    ],
    desafios: [
      {
        pergunta: 'Leve o caminho para fora das placas. A corrente de deslocamento envolvida ainda cresce?',
        condicao: 'rs > a',
        sucesso: 'Não: todo o $\\Phi_E$ já está dentro do caminho. $I_d$ fica igual à corrente no fio, e $B$ passa a cair com $1/s$.',
      },
      {
        pergunta: 'Deixe o tempo correr. O que acontece com $B$ quando o capacitor termina de carregar?',
        condicao: 't > 3*tau',
        sucesso: 'Some: $\\vec E$ continua lá, mas parou de variar. É a **variação** do fluxo elétrico que cria $\\vec B$.',
      },
    ],
  },
}

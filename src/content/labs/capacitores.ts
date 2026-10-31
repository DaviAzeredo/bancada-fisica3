import type { ObjetoInput } from '../../scenario/schema'
import { type LabNovo, MOVIMENTO, r } from './tipos'

/* ───────────────── capacitores: geometria, dielétricos e fonte ───────────────── */

/** Chapa única centrada (fração f) ou duas chapas que dividem a região em f. */
const S0 = '(1-f)/2'
const S1 = '(1+f)/2'
const umaChapa = 'arranjo==1 || arranjo==5'

/**
 * 1/C em cada arranjo. `G(s0, s1)` é o inverso da capacitância de uma camada de
 * vácuo entre as frações s0 e s1 da distância entre os condutores.
 */
const inverso = (G: (s0: string, s1: string) => string) =>
  `(arranjo==0 ? ${G('0', '1')} : (${umaChapa} ? ${G('0', S0)} + ${G(S0, S1)}/K1 + ${G(S1, '1')} : ` +
  `(arranjo==2 ? ${G('0', 'f')}/K1 + ${G('f', '1')}/K2 : (arranjo==3 ? ${G('0', '1')}/(f*K1 + (1-f)*K2) : ${G('0', S0)} + ${G(S1, '1')}))))`

const raio = (s: string) => `(a + (${s})*(b-a))`
const Gplano = (s0: string, s1: string) => `((${s1}) - (${s0}))*d/(eps0*lado^2)`
const Gcil = (s0: string, s1: string) => `ln(${raio(s1)}/${raio(s0)})/(2*pi*eps0*L)`
const Gesf = (s0: string, s1: string) => `(1/${raio(s0)} - 1/${raio(s1)})/(4*pi*eps0)`
const Cteo = `(geo==1 ? 1/${inverso(Gplano)} : (geo==2 ? 1/${inverso(Gcil)} : 1/${inverso(Gesf)}))`

const fonte = { V: 'Vf', ligado: 'ligacao==1', Q: 'Q0' }

/** Camadas radiais em série. Metal como K enorme: as cargas induzidas anulam E por dentro. */
const camadasRadiais = [
  { K: 'K1', inicio: `arranjo==2 ? a : ${raio(S0)}`, fim: `arranjo==2 ? ${raio('f')} : (${umaChapa} ? ${raio(S1)} : a)` },
  { K: 'K2', inicio: raio('f'), fim: `arranjo==2 ? b : ${raio('f')}` },
  { K: 1e15, inicio: raio(S0), fim: `arranjo==4 ? ${raio(S1)} : ${raio(S0)}` },
]
const setores = [
  { K: 'K1', fracao: 'f' },
  { K: 'K2', fracao: '1-f' },
]
const camadasPlanas = [
  { K: 'K1', inicio: `arranjo==2 ? 0 : (${S0})*d`, fim: `arranjo==2 ? f*d : (${umaChapa} ? (${S1})*d : 0)` },
  { K: 'K2', inicio: 'f*d', fim: 'arranjo==2 ? d : f*d' },
  { condutora: true, inicio: `(${S0})*d`, fim: `arranjo==4 ? (${S1})*d : (${S0})*d` },
]

const origem: [number, number, number] = [0, 0, 0]
const plano = { tipo: 'capacitor' as const, centro: origem, eixo: 'x', lado: 'lado', d: 'd', ...fonte }
const radial = { tipo: 'capacitorRadial' as const, centro: origem, eixo: 'z', a: 'a', b: 'b', comprimento: 'L', ...fonte }

/** Id do capacitor ativo. */
const CID = "(geo==1 ? (arranjo==3 ? 'pp' : (arranjo==5 ? 'pb' : 'ps')) : (geo==2 ? (arranjo==3 ? 'cp' : 'cs') : (arranjo==3 ? 'ep' : 'es')))"

export const capacitor: LabNovo = {
  grupo: 'Capacitores',
  cenario: {
    id: 'capacitor',
    titulo: 'Capacitores: geometrias e dielétricos',
    resumo: 'Placas, cilindros e esferas, com dielétricos em série e em paralelo.',
    teoria: r`A capacitância só depende da geometria e do material: $C = Q/V$. Em vácuo,
$$C_\text{plano} = \frac{\varepsilon_0 A}{d},\qquad C_\text{cil} = \frac{2\pi\varepsilon_0 L}{\ln(b/a)},\qquad C_\text{esf} = \frac{4\pi\varepsilon_0\,ab}{b-a}.$$

**Dielétricos em série** (uma camada depois da outra, no caminho de uma placa à outra): $Q$ é a mesma, o campo cai por $K$ em cada camada e $1/C = \sum 1/C_i$.

**Dielétricos em paralelo** (lado a lado, cada um indo de condutor a condutor): a ddp é a mesma, o campo é o mesmo nos dois e $C = \sum C_i$. Muda a carga livre de cada lado.

**Fonte ligada** fixa $V$; **capacitor isolado** fixa $Q$. É isso que decide o que sobe e o que desce ao mexer na geometria. Os condutores se afastam e se aproximam sozinhos: troque a ligação e veja o gráfico mudar de cara.`,
    cena: { escala: 0.002, extensao: 24, unidade: 'cm', plano: 'xy', camera: { pos: [14, 12, 74], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      {
        id: 'geo',
        rotulo: 'Geometria',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Placas' },
          { valor: 2, rotulo: 'Cilíndrico' },
          { valor: 3, rotulo: 'Esférico' },
        ],
      },
      {
        id: 'arranjo',
        rotulo: 'Entre os condutores',
        valor: 1,
        opcoes: [
          { valor: 0, rotulo: 'Vácuo' },
          { valor: 1, rotulo: 'Uma chapa' },
          { valor: 2, rotulo: 'Série' },
          { valor: 3, rotulo: 'Paralelo' },
          { valor: 4, rotulo: 'Metal' },
          { valor: 5, rotulo: 'Bordas' },
        ],
      },
      { id: 'ligacao', rotulo: 'Ligação', valor: 1, opcoes: [{ valor: 1, rotulo: 'Fonte ligada' }, { valor: 2, rotulo: 'Isolado' }] },
      { id: 'Vf', rotulo: 'ddp da fonte', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
      { id: 'Q0', rotulo: 'Carga, se isolado', simbolo: 'Q', valor: 2e-10, unidade: 'C', min: 2e-11, max: 1e-9, passo: 1e-11 },
      { id: 'K1', rotulo: 'Constante dielétrica 1', simbolo: 'K_1', valor: 2.5, min: 1, max: 6, passo: 0.1 },
      { id: 'K2', rotulo: 'Constante dielétrica 2', simbolo: 'K_2', valor: 4, min: 1, max: 6, passo: 0.1 },
      { id: 'f', rotulo: 'Fração', simbolo: 'f', valor: 0.5, min: 0.05, max: 0.95, passo: 0.01 },
      MOVIMENTO,
      { id: 'd', rotulo: 'Separação (placas)', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.008, max: 0.04, passo: 0.001, varre: { periodo: 10, de: 0.012, ate: 0.04, ativo: 'auto==1 && geo==1' } },
      { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt A`, valor: 0.06, unidade: 'm', min: 0.03, max: 0.08, passo: 0.002 },
      { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.015, unidade: 'm', min: 0.008, max: 0.028, passo: 0.001 },
      { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.03, max: 0.046, passo: 0.001, varre: { periodo: 10, ativo: 'auto==1 && geo>=2' } },
      { id: 'L', rotulo: 'Comprimento (cilindro)', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.02, max: 0.07, passo: 0.002 },
    ],
    objetos: [
      { ...plano, id: 'ps', ativo: 'geo==1 && arranjo!=3 && arranjo!=5', dieletrico: camadasPlanas },
      { ...plano, id: 'pp', ativo: 'geo==1 && arranjo==3', lateral: setores },
      { ...plano, id: 'pb', ativo: 'geo==1 && arranjo==5', bordas: true, dieletrico: camadasPlanas },
      { ...radial, id: 'cs', ativo: 'geo==2 && arranjo!=3', forma: 'cilindro', dieletrico: camadasRadiais },
      { ...radial, id: 'cp', ativo: 'geo==2 && arranjo==3', forma: 'cilindro', setores },
      { ...radial, id: 'es', ativo: 'geo==3 && arranjo!=3', forma: 'esfera', dieletrico: camadasRadiais },
      { ...radial, id: 'ep', ativo: 'geo==3 && arranjo==3', forma: 'esfera', setores },
    ],
    visual: { setasE: true, densidade: 19, planoSetas: 'xy' },
    medidas: [
      { rotulo: 'Capacitância', simbolo: 'C', expr: `C(${CID})`, unidade: 'F', teoria: Cteo },
      { rotulo: 'Carga livre', simbolo: 'Q', expr: `Q(${CID})`, unidade: 'C', teoria: `ligacao==1 ? ${Cteo}*Vf : Q0` },
      { rotulo: 'ddp medida no campo', simbolo: r`\Delta V`, expr: 'geo==1 ? V(-d/2,0,0) - V(d/2,0,0) : V(a,0,0) - V(b,0,0)', unidade: 'V', teoria: `Vcap(${CID})`, ativo: 'arranjo!=5' },
      { rotulo: 'Energia armazenada', simbolo: r`U = \tfrac12 QV`, expr: `U(${CID})`, unidade: 'J', teoria: `Q(${CID})*Vcap(${CID})/2` },
      { rotulo: 'Campo junto ao condutor +', simbolo: 'E', expr: 'geo==1 ? mag(E(-0.499*d,0,0)) : mag(E(1.001*a,0,0))', unidade: 'V/m', ativo: 'arranjo!=3 || geo!=1' },
      { rotulo: 'Carga livre por área no lado 1', simbolo: r`\sigma_1`, expr: `K1*eps0*Vcap(${CID})/d`, unidade: 'C/m²', ativo: 'geo==1 && arranjo==3' },
      { rotulo: 'Carga livre por área no lado 2', simbolo: r`\sigma_2`, expr: `K2*eps0*Vcap(${CID})/d`, unidade: 'C/m²', ativo: 'geo==1 && arranjo==3' },
    ],
    graficos: [
      {
        titulo: 'O que muda quando a geometria muda',
        tipo: 'tempo',
        janela: 10,
        series: [
          { rotulo: 'Q', expr: `Q(${CID})`, unidade: 'C' },
          { rotulo: 'V', expr: `Vcap(${CID})`, unidade: 'V' },
          { rotulo: 'U', expr: `U(${CID})`, unidade: 'J' },
        ],
      },
      {
        titulo: 'Campo entre os condutores',
        tipo: 'perfil',
        x: { variavel: 'ss', de: 0.01, ate: 0.99, rotulo: 'fração da distância', unidade: '' },
        series: [{ rotulo: 'E', expr: 'geo==1 ? mag(E((ss - 0.5)*d, 0, 0)) : mag(E(a + ss*(b-a), 0, 0))', unidade: 'V/m' }],
      },
    ],
    desafios: [
      {
        pergunta: r`No capacitor esférico em vácuo, deixe $b$ bem maior que $a$. Para onde vai $C$?`,
        dica: r`Reduza $a$ e aumente $b$ até $b > 4a$.`,
        condicao: 'auto==0 && geo==3 && arranjo==0 && b > 4*a',
        sucesso: r`Para $4\pi\varepsilon_0 a$, a capacitância de uma esfera isolada: o condutor externo já quase não influi.`,
      },
      {
        pergunta: r`Em série, ponha $K_1 = 1$ e $K_2 = 6$. Onde o campo fica maior?`,
        condicao: 'arranjo==2 && K1 < 1.05 && K2 > 5.9',
        sucesso: r`No trecho de vácuo: em série, $E$ cai por $K$ em cada camada, e o gráfico mostra o degrau.`,
      },
      {
        pergunta: r`Em paralelo, com as placas, compare $\sigma_1$ e $\sigma_2$. O campo muda de um lado para o outro?`,
        condicao: 'geo==1 && arranjo==3 && abs(K1 - K2) > 2',
        sucesso: r`Não: a ddp é a mesma e $d$ também, então $E = V/d$ nos dois lados. Quem muda é a carga livre, $\sigma_i = K_i\varepsilon_0 E$.`,
      },
      {
        pergunta: 'Isole o capacitor e aumente a separação das placas. O que acontece com a ddp e com a energia?',
        condicao: 'auto==0 && geo==1 && ligacao==2 && d > 0.03',
        sucesso: r`Sobem: $Q$ é fixa e $C$ caiu, então $V = Q/C$ e $U = Q^2/2C$ crescem. O trabalho veio de quem afastou as placas.`,
      },
    ],
  },
}

/* ───────────────── associação de capacitores ───────────────── */

const Ceq = '(modo==1 ? 1/(1/C1 + 1/C2 + 1/C3) : (modo==2 ? C1 + C2 + C3 : (modo==3 ? C1*(C2 + C3)/(C1 + C2 + C3) : C1)))'
/** A chave fecha em t = 0: cargas e ddps sobem juntas, com a constante de tempo do circuito. */
const ex = '(exp(0-t/tau))'
const Fe = `(fem*(1 - ${ex}))`
const Q1 = `(modo==2 ? C1*${Fe} : (modo==4 ? (ligada==1 ? C1*fem*(C1 + C2*${ex})/(C1 + C2) : C1*fem) : ${Ceq}*${Fe}))`
const Q2 = `(modo==1 ? ${Ceq}*${Fe} : (modo==2 ? C2*${Fe} : (modo==3 ? ${Ceq}*${Fe}*C2/(C2 + C3) : (ligada==1 ? C2*C1*fem/(C1 + C2)*(1 - ${ex}) : 0))))`
const Q3 = `(modo==1 ? ${Ceq}*${Fe} : (modo==2 ? C3*${Fe} : ${Ceq}*${Fe}*C3/(C2 + C3)))`

const LADO = 0.05
const pecaCap = { tipo: 'capacitor' as const, eixo: 'x', lado: LADO }
const d1 = 'eps0*0.0025/C1'
const d2 = 'eps0*0.0025/C2'
const d3 = 'eps0*0.0025/C3'
const x1 = '(modo==1 ? -0.06 : (modo==2 ? 0 : -0.05))'
const y1 = '(modo==2 ? 0.06 : 0)'
const x2 = '(modo==1 ? 0 : (modo==2 ? 0 : (modo==3 ? 0.04 : 0.05)))'
const y2 = '(modo==3 ? 0.035 : 0)'
const x3 = '(modo==1 ? 0.06 : (modo==2 ? 0 : 0.04))'
const y3 = '(modo==2 ? -0.06 : -0.035)'

/** Fio desenhado: sem efeito físico, como um caminho sem seta. */
const fio = (id: string, ativo: string, pontos: (string | number)[][]): ObjetoInput =>
  ({ id, tipo: 'caminho', ativo, seta: 0, pontos }) as ObjetoInput

export const associacao: LabNovo = {
  grupo: 'Capacitores',
  cenario: {
    id: 'associacao',
    titulo: 'Associação de capacitores',
    resumo: 'Série, paralelo, arranjo misto e a energia perdida ao ligar dois capacitores.',
    teoria: r`**Em série**, a carga é a mesma em todos, as ddps somam e $1/C_\text{eq} = \sum 1/C_i$: o menor capacitor leva a maior ddp.

**Em paralelo**, a ddp é a mesma em todos, as cargas somam e $C_\text{eq} = \sum C_i$.

**Ligar um capacitor carregado a outro descarregado** conserva a carga, não a energia: parte de $U$ vira calor no fio, por menor que seja a resistência dele.

A chave fecha quando o relógio começa: as cargas sobem até o equilíbrio, com constante de tempo $\tau$, e o circuito recomeça a cada 8 s.`,
    cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 30], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 8 } },
    parametros: [
      {
        id: 'modo',
        rotulo: 'Arranjo',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Série' },
          { valor: 2, rotulo: 'Paralelo' },
          { valor: 3, rotulo: 'Misto' },
          { valor: 4, rotulo: 'Carregado + vazio' },
        ],
      },
      { id: 'fem', rotulo: 'fem da fonte', simbolo: r`\varepsilon`, valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
      { id: 'C1', rotulo: 'Capacitância 1', simbolo: 'C_1', valor: 2e-12, unidade: 'F', min: 1e-12, max: 4e-12, passo: 1e-13 },
      { id: 'C2', rotulo: 'Capacitância 2', simbolo: 'C_2', valor: 3e-12, unidade: 'F', min: 1e-12, max: 4e-12, passo: 1e-13 },
      { id: 'C3', rotulo: 'Capacitância 3', simbolo: 'C_3', valor: 1.5e-12, unidade: 'F', min: 1e-12, max: 4e-12, passo: 1e-13 },
      { id: 'tau', rotulo: 'Constante de tempo', simbolo: r`\tau`, valor: 1.2, unidade: 's', min: 0.4, max: 2.5, passo: 0.1 },
      { id: 'ligada', rotulo: 'Chave', valor: 1, opcoes: [{ valor: 0, rotulo: 'Aberta' }, { valor: 1, rotulo: 'Fechada' }] },
    ],
    objetos: [
      { ...pecaCap, id: 'c1', centro: [x1, y1, 0], d: d1, Q: Q1, rotulo: 'C₁' },
      { ...pecaCap, id: 'c2', centro: [x2, y2, 0], d: d2, Q: Q2, rotulo: 'C₂' },
      { ...pecaCap, id: 'c3', ativo: 'modo<=3', centro: [x3, y3, 0], d: d3, Q: Q3, rotulo: 'C₃' },
      { id: 'tf', tipo: 'rotulo', ativo: 'modo<=3', pos: [-0.105, -0.04, 0], texto: 'ε' },
      fio('s1', 'modo==1', [[`-0.06 + ${d1}/2`, 0, 0], [`0 - ${d2}/2`, 0, 0]]),
      fio('s2', 'modo==1', [[`${d2}/2`, 0, 0], [`0.06 - ${d3}/2`, 0, 0]]),
      fio('s3', 'modo==1', [[`0.06 + ${d3}/2`, 0, 0], [0.1, 0, 0], [0.1, -0.08, 0], [-0.1, -0.08, 0], [-0.1, 0, 0], [`-0.06 - ${d1}/2`, 0, 0]]),
      fio('p1', 'modo==2', [[-0.1, -0.09, 0], [-0.1, 0.06, 0], [`0 - ${d1}/2`, 0.06, 0]]),
      fio('p2', 'modo==2', [[-0.1, 0, 0], [`0 - ${d2}/2`, 0, 0]]),
      fio('p3', 'modo==2', [[-0.1, -0.06, 0], [`0 - ${d3}/2`, -0.06, 0]]),
      fio('p4', 'modo==2', [[`${d1}/2`, 0.06, 0], [0.1, 0.06, 0], [0.1, -0.09, 0], [-0.1, -0.09, 0]]),
      fio('p5', 'modo==2', [[`${d2}/2`, 0, 0], [0.1, 0, 0]]),
      fio('p6', 'modo==2', [[`${d3}/2`, -0.06, 0], [0.1, -0.06, 0]]),
      fio('m1', 'modo==3', [[`-0.05 + ${d1}/2`, 0, 0], [-0.02, 0, 0], [-0.02, 0.035, 0], [`0.04 - ${d2}/2`, 0.035, 0]]),
      fio('m2', 'modo==3', [[-0.02, 0, 0], [-0.02, -0.035, 0], [`0.04 - ${d3}/2`, -0.035, 0]]),
      fio('m3', 'modo==3', [[`0.04 + ${d2}/2`, 0.035, 0], [0.09, 0.035, 0], [0.09, -0.035, 0], [`0.04 + ${d3}/2`, -0.035, 0]]),
      fio('m4', 'modo==3', [[0.09, 0, 0], [0.1, 0, 0], [0.1, -0.08, 0], [-0.1, -0.08, 0], [-0.1, 0, 0], [`-0.05 - ${d1}/2`, 0, 0]]),
      fio('t1', 'modo==4 && ligada==1', [[`-0.05 + ${d1}/2`, 0, 0], [`0.05 - ${d2}/2`, 0, 0]]),
      fio('t2', 'modo==4 && ligada==1', [[`-0.05 - ${d1}/2`, 0, 0], [-0.08, 0, 0], [-0.08, -0.05, 0], [0.08, -0.05, 0], [0.08, 0, 0], [`0.05 + ${d2}/2`, 0, 0]]),
    ],
    visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
    medidas: [
      {
        rotulo: 'Capacitância equivalente',
        simbolo: r`C_\text{eq}`,
        expr: "modo==1 ? 1/(1/C('c1') + 1/C('c2') + 1/C('c3')) : (modo==2 ? C('c1') + C('c2') + C('c3') : C('c1')*(C('c2') + C('c3'))/(C('c1') + C('c2') + C('c3')))",
        unidade: 'F',
        teoria: Ceq,
        ativo: 'modo<=3',
      },
      { rotulo: 'ddp em C₁', simbolo: 'V_1', expr: "Vcap('c1')", unidade: 'V' },
      { rotulo: 'ddp em C₂', simbolo: 'V_2', expr: "Vcap('c2')", unidade: 'V' },
      { rotulo: 'ddp em C₃', simbolo: 'V_3', expr: "Vcap('c3')", unidade: 'V', ativo: 'modo<=3' },
      { rotulo: 'Carga em C₁', simbolo: 'Q_1', expr: "Q('c1')", unidade: 'C' },
      { rotulo: 'Carga em C₂', simbolo: 'Q_2', expr: "Q('c2')", unidade: 'C' },
      { rotulo: 'Carga em C₃', simbolo: 'Q_3', expr: "Q('c3')", unidade: 'C', ativo: 'modo<=3' },
      { rotulo: 'ddps no caminho da fonte', simbolo: r`\sum V`, expr: "modo==1 ? Vcap('c1') + Vcap('c2') + Vcap('c3') : (modo==2 ? Vcap('c1') : Vcap('c1') + Vcap('c2'))", unidade: 'V', teoria: Fe, ativo: 'modo<=3' },
      { rotulo: 'Energia total', simbolo: r`\sum U_i`, expr: "U('c1') + U('c2') + (modo<=3 ? U('c3') : 0)", unidade: 'J', teoria: `modo<=3 ? ${Ceq}*${Fe}^2/2 : ${Q1}^2/(2*C1) + ${Q2}^2/(2*C2)` },
      { rotulo: 'Carga total das placas ligadas', simbolo: 'Q_1 + Q_2', expr: "Q('c1') + Q('c2')", unidade: 'C', teoria: 'C1*fem', ativo: 'modo==4' },
      { rotulo: 'Energia dissipada ao ligar', simbolo: r`\Delta U`, expr: "C1*fem^2/2 - U('c1') - U('c2')", unidade: 'J', teoria: `ligada==1 ? C1*fem^2/2*C2/(C1 + C2)*(1 - ${ex}^2) : 0`, ativo: 'modo==4' },
    ],
    graficos: [
      {
        titulo: 'Carga em cada capacitor',
        tipo: 'tempo',
        janela: 8,
        series: [
          { rotulo: 'Q₁', expr: "Q('c1')", unidade: 'C' },
          { rotulo: 'Q₂', expr: "Q('c2')", unidade: 'C' },
          { rotulo: 'Q₃', expr: "modo<=3 ? Q('c3') : 0", unidade: 'C' },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Em série, faça a ddp em $C_1$ ser a maior das três.',
        dica: 'Em série a carga é igual: $V_i = Q/C_i$.',
        condicao: "modo==1 && Vcap('c1') > Vcap('c2') && Vcap('c1') > Vcap('c3')",
        sucesso: 'Basta $C_1$ ser o menor: o menor capacitor leva a maior ddp.',
      },
      {
        pergunta: 'No arranjo misto, deixe $C_2 = C_3$. Como se divide a carga que passa por $C_1$?',
        condicao: 'modo==3 && abs(C2 - C3) < 5e-14',
        sucesso: 'Meio a meio: no ramo em paralelo a ddp é a mesma, então a carga se divide na razão das capacitâncias.',
      },
      {
        pergunta: 'Em "carregado + vazio", com $C_1 = C_2$, feche a chave. Quanto da energia sobra?',
        condicao: 'modo==4 && ligada==1 && abs(C1 - C2) < 5e-14',
        sucesso: 'Metade, depois de alguns $\\tau$: a carga total se conserva, mas $U$ cai para $U_0/2$. O resto virou calor, qualquer que seja a resistência do fio.',
      },
    ],
  },
}

import type { ObjetoInput } from '../../scenario/schema'
import { type LabNovo, MOVIMENTO, r } from './tipos'

/* ───────────────── força e torque em correntes ───────────────── */

/** Quatro lados de uma espira, em ordem: as forças de cada lado medem-se separadas. */
const espira = (pre: string, ativo: string, cantos: [string, string, string][], extra: object = {}): ObjetoInput[] =>
  cantos.map((a, i) => ({ id: `${pre}${i + 1}`, tipo: 'fio', ativo, I: 'I2', a, b: cantos[(i + 1) % 4], ...extra }) as ObjetoInput)

const u = ['-sin(ang)', '0', 'cos(ang)']
const canto = (su: string, sy: string): [string, string, string] => [`${su}*a/2*(${u[0]})`, `${sy}*b/2`, `${su}*a/2*(${u[2]})`]
const lados = ['g1', 'g2', 'g3', 'g4']
const somaF = (fonte: string, pre: string) => `(${[1, 2, 3, 4].map((i) => `forca('${pre}${i}','${fonte}')`).join(' + ')})`
const torque = `(${lados.map((l) => `cross(pos('${l}'), forca('${l}','Bu'))`).join(' + ')})`
/** Momento de inércia da espira, em kg·m²: dá uma oscilação de cerca de 2 s. */
const Ie = '3.3e-4'

export const forcas: LabNovo = {
  grupo: 'Magnetismo',
  cenario: {
    id: 'forcas',
    titulo: 'Força e torque em correntes',
    resumo: 'Fios em campo, fios paralelos, torque em espiras e momento magnético.',
    teoria: r`Um trecho de fio sente $d\vec F = I\,d\vec\ell\times\vec B$. Em campo uniforme, só importa o vetor que liga as pontas do fio; por isso, **numa espira fechada em campo uniforme, a força total é nula**.

O que sobra é o torque: $\vec\tau = \vec m\times\vec B$, com momento magnético $\vec m = I\vec A$, e a energia é $U = -\vec m\cdot\vec B$. A espira tende a alinhar $\vec m$ com $\vec B$.

Em campo não uniforme a força total deixa de ser nula: uma malha perto de um fio é puxada pelo lado mais próximo. Correntes paralelas **se atraem**, com $F/L = \mu_0I_1I_2/2\pi d$.

Em cada situação algo se move: o fio gira, os fios paralelos se aproximam, a malha chega perto. A **espira** é solta de um ângulo e oscila em torno do alinhamento com $\vec B$, como uma bússola.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [13, 12, 21], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.004 } },
    dinamica: [
      { id: 'omg', inicial: '0', derivada: `0 - I2*a*b*B0/${Ie}*sin(ang) - amort*omg` },
      { id: 'ang', inicial: 'rad(th)', derivada: 'omg' },
    ],
    parametros: [
      {
        id: 'modo',
        rotulo: 'Situação',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Fio em B uniforme' },
          { valor: 2, rotulo: 'Fios paralelos' },
          { valor: 3, rotulo: 'Espira em B uniforme' },
          { valor: 4, rotulo: 'Malha perto de um fio' },
          { valor: 5, rotulo: 'Duas cargas em movimento' },
        ],
      },
      MOVIMENTO,
      { id: 'I1', rotulo: 'Corrente 1', simbolo: 'I_1', valor: 20, unidade: 'A', min: -50, max: 50, passo: 1 },
      { id: 'I2', rotulo: 'Corrente 2', simbolo: 'I_2', valor: 10, unidade: 'A', min: -50, max: 50, passo: 1 },
      { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.01, max: 0.3, passo: 0.01 },
      { id: 'th', rotulo: 'Ângulo (na espira, o inicial)', simbolo: r`\theta`, valor: 60, unidade: '°', min: 0, max: 180, passo: 1, varre: { periodo: 10, ativo: 'auto==1 && modo==1' } },
      { id: 'amort', rotulo: 'Amortecimento da espira', simbolo: 'b', valor: 0.15, unidade: '1/s', min: 0, max: 1, passo: 0.01 },
      { id: 'L', rotulo: 'Comprimento ou distância', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.02, max: 0.12, passo: 0.002, varre: { periodo: 10, de: 0.02, ate: 0.1, ativo: 'auto==1 && modo==4' } },
      { id: 'dd', rotulo: 'Distância entre os fios', simbolo: 'd', valor: 0.04, unidade: 'm', min: 0.01, max: 0.08, passo: 0.002, varre: { periodo: 10, ativo: 'auto==1 && modo==2' } },
      { id: 'a', rotulo: 'Altura da espira', simbolo: 'a', valor: 0.06, unidade: 'm', min: 0.02, max: 0.1, passo: 0.002 },
      { id: 'b', rotulo: 'Largura da espira', simbolo: 'b', valor: 0.05, unidade: 'm', min: 0.02, max: 0.1, passo: 0.002 },
      { id: 'qq', rotulo: 'Carga em movimento', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 1e-10, max: 5e-9, passo: 1e-10 },
      { id: 'vv', rotulo: 'Velocidade', simbolo: 'v', valor: 3e7, unidade: 'm/s', min: 1e6, max: 2e8, passo: 1e6, varre: { periodo: 12, ativo: 'auto==1 && modo==5' } },
    ],
    objetos: [
      { id: 'Bu', tipo: 'campoB', ativo: 'modo==1 || modo==3', valor: ['modo==1 ? B0*cos(rad(th)) : B0', 'modo==1 ? B0*sin(rad(th)) : 0', 0], rotulo: 'B' },
      { id: 'w', tipo: 'fio', ativo: 'modo==1', I: 'I1', a: ['0-L/2', 0, 0], b: ['L/2', 0, 0], rotulo: 'I' },
      { id: 'Fw', tipo: 'seta', ativo: 'modo==1', papel: 'forca', origem: [0, 0, 0], vetor: "forca('w','Bu')", comprimento: '3*cm', rotulo: 'F' },
      { id: 'fi', tipo: 'fioInfinito', ativo: 'modo==2', I: 'I1', ponto: [0, 0, 0], direcao: 'x', rotulo: 'I₁' },
      { id: 'w2', tipo: 'fio', ativo: 'modo==2', I: 'I2', a: ['0-L/2', 'dd', 0], b: ['L/2', 'dd', 0], rotulo: 'I₂' },
      { id: 'Fp', tipo: 'seta', ativo: 'modo==2', papel: 'forca', origem: [0, 'dd', 0], vetor: "forca('w2','fi')", comprimento: '3*cm', rotulo: 'F' },
      ...espira('g', 'modo==3', [canto('-1', '-1'), canto('-1', '1'), canto('1', '1'), canto('1', '-1')]),
      { id: 'mm', tipo: 'seta', ativo: 'modo==3', papel: 'neutro', origem: [0, 0, 0], vetor: ['I2*cos(ang)', 0, 'I2*sin(ang)'], comprimento: '3.5*cm', rotulo: 'm' },
      { id: 'fy', tipo: 'fioInfinito', ativo: 'modo==4', I: 'I1', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I₁' },
      ...espira('h', 'modo==4', [['L', '0-a/2', '0'], ['L', 'a/2', '0'], ['L + b', 'a/2', '0'], ['L + b', '0-a/2', '0']], { arraste: { param: 'L', eixo: 'x' } }),
      { id: 'qa', tipo: 'carga', ativo: 'modo==5', q: 'qq', pos: [0, 'dd/2', 0], rotulo: 'q' },
      { id: 'qb', tipo: 'carga', ativo: 'modo==5', q: 'qq', pos: [0, '0-dd/2', 0], rotulo: 'q' },
      { id: 'va', tipo: 'seta', ativo: 'modo==5', papel: 'v', origem: [0, 'dd/2', 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'v' },
      { id: 'vb', tipo: 'seta', ativo: 'modo==5', papel: 'v', origem: [0, '0-dd/2', 0], vetor: [1, 0, 0], comprimento: '3*cm', rotulo: 'v' },
    ],
    visual: { setasB: true, densidade: 7 },
    medidas: [
      { rotulo: 'Força no fio', simbolo: r`F = ILB\sin\theta`, expr: "mag(forca('w','Bu'))", unidade: 'N', teoria: 'abs(I1)*L*B0*abs(sin(rad(th)))', ativo: 'modo==1' },
      { rotulo: 'Força no fio 2', simbolo: r`F = \frac{\mu_0I_1I_2L}{2\pi d}`, expr: "mag(forca('w2','fi'))", unidade: 'N', teoria: 'mu0*abs(I1*I2)*L/(2*pi*dd)', ativo: 'modo==2' },
      { rotulo: 'Força total na espira', simbolo: r`\sum\vec F`, expr: `mag(${somaF('Bu', 'g')})`, unidade: 'N', teoria: '0', ativo: 'modo==3' },
      { rotulo: 'Torque', simbolo: r`\tau = mB\sin\theta`, expr: `mag(${torque})`, unidade: 'N·m', teoria: 'abs(I2)*a*b*B0*abs(sin(ang))', ativo: 'modo==3' },
      { rotulo: 'Momento magnético', simbolo: 'm = IA', expr: 'abs(I2)*a*b', unidade: 'A·m²', ativo: 'modo==3' },
      { rotulo: 'Ângulo agora', simbolo: r`\theta`, expr: 'deg(ang)', unidade: '°', ativo: 'modo==3' },
      { rotulo: 'Energia', simbolo: r`U = -mB\cos\theta`, expr: '0 - I2*a*b*B0*cos(ang)', unidade: 'J', ativo: 'modo==3' },
      { rotulo: 'Força total na malha', simbolo: 'F_x', expr: `x(${somaF('fy', 'h')})`, unidade: 'N', teoria: '0 - mu0*I1*I2*a/(2*pi)*(1/L - 1/(L + b))', ativo: 'modo==4' },
      { rotulo: 'Força elétrica entre as cargas', simbolo: r`F_E = \frac{k_0q^2}{d^2}`, expr: "mag(F('qa'))", unidade: 'N', teoria: 'k0*qq^2/dd^2', ativo: 'modo==5' },
      { rotulo: 'Força magnética entre as cargas', simbolo: r`F_B = \frac{\mu_0q^2v^2}{4\pi d^2}`, expr: 'mu0*qq^2*vv^2/(4*pi*dd^2)', unidade: 'N', ativo: 'modo==5' },
      { rotulo: 'Razão entre elas', simbolo: r`F_B/F_E = v^2/c^2`, expr: "(mu0*qq^2*vv^2/(4*pi*dd^2))/mag(F('qa'))", unidade: '', teoria: 'mu0*eps0*vv^2', ativo: 'modo==5' },
    ],
    graficos: [
      {
        titulo: 'Torque e energia em função do ângulo',
        tipo: 'perfil',
        ativo: 'modo==3',
        x: { variavel: 'tt', de: 0, ate: 180, rotulo: 'θ', unidade: '°', marca: 'deg(abs(ang))' },
        series: [
          { rotulo: 'τ', expr: 'abs(I2)*a*b*B0*sin(rad(tt))', unidade: 'N·m' },
          { rotulo: 'U', expr: '0 - I2*a*b*B0*cos(rad(tt))', unidade: 'J' },
        ],
      },
      {
        titulo: 'Oscilação da espira',
        tipo: 'tempo',
        ativo: 'modo==3',
        series: [{ rotulo: 'θ', expr: 'deg(ang)', unidade: '°' }],
      },
    ],
    desafios: [
      {
        pergunta: 'Com o fio em $B$ uniforme, ache o ângulo em que a força se anula.',
        condicao: 'auto==0 && modo==1 && abs(sin(rad(th))) < 0.03',
        sucesso: 'Com $\\vec I$ paralela a $\\vec B$, $\\vec I\\times\\vec B = 0$: a corrente corre ao longo das linhas sem sentir nada.',
      },
      {
        pergunta: 'Inverta uma das correntes dos fios paralelos. O que muda?',
        condicao: 'modo==2 && I1*I2 < 0',
        sucesso: 'Viram repulsão: correntes paralelas se atraem, e antiparalelas se repelem.',
      },
      {
        pergunta: 'Solte a espira de 90°, onde o torque é máximo. Quanto vale $U$ nesse ângulo?',
        condicao: 'modo==3 && abs(th - 90) < 2',
        sucesso: 'Com $\\vec m \\perp \\vec B$, o torque é máximo e $U = 0$. O equilíbrio estável está em $\\theta = 0$, onde $U$ é mínima.',
      },
      {
        pergunta: 'Na malha, arraste-a para perto do fio. Por que a força cresce tanto?',
        condicao: 'auto==0 && modo==4 && L < 0.03',
        sucesso: 'O lado próximo é atraído e o distante é repelido, mas $B \\propto 1/s$: quanto mais perto, maior a diferença entre os dois.',
      },
    ],
  },
}

/* ───────────────── Biot-Savart por trechos ───────────────── */

const N_ARCO = 24
/** Arco de fio em N trechos retos, de `ini` a `ini + ab` graus. Com `ab` negativo, gira no sentido horário. */
const arco = (pre: string, ativo: string, R: string, ini: string, ab: string): ObjetoInput[] =>
  Array.from({ length: N_ARCO }, (_, i) => {
    const p = (k: number): [string, string, number] => [`${R}*cos(rad(${ini} + ${k}*(${ab})/${N_ARCO}))`, `${R}*sin(rad(${ini} + ${k}*(${ab})/${N_ARCO}))`, 0]
    return { id: `${pre}${i}`, tipo: 'fio', ativo, I: 'I0', a: p(i), b: p(i + 1) } as ObjetoInput
  })
const polar = (R: string, ang: string): [string, string, number] => [`${R}*cos(rad(${ang}))`, `${R}*sin(rad(${ang}))`, 0]
const ini = '(90 - al/2)'
const fim = '(90 + al/2)'

export const trechos: LabNovo = {
  grupo: 'Magnetismo',
  cenario: {
    id: 'trechos',
    titulo: 'Biot-Savart por trechos',
    resumo: 'Arcos, semicírculos, quadrados e fios finitos: o que contribui e o que não.',
    teoria: r`Sem simetria para Ampère, soma-se trecho por trecho:
$$d\vec B = \frac{\mu_0 I}{4\pi}\frac{d\vec\ell\times\hat r}{r^2}.$$

Três regras resolvem quase tudo:
- **trecho reto alinhado com o ponto** não contribui, porque $d\vec\ell \parallel \hat r$;
- **arco de ângulo $\alpha$** (em radianos) e raio $R$, no centro: $B = \mu_0I\alpha/4\pi R$;
- **trecho reto finito**, a uma distância $s$: $B = \dfrac{\mu_0I}{4\pi s}(\sin\theta_1 + \sin\theta_2)$, que dá $\mu_0I/2\pi s$ no fio infinito e metade disso no semi-infinito.

O sentido de cada contribuição sai da regra da mão direita, e por isso os trechos se somam ou se subtraem.

A geometria muda sozinha: o arco abre e fecha, e o campo no centro acompanha. No gráfico, veja que $B$ cresce em linha reta com $\alpha$.`,
    cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [1, 1, 22], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      {
        id: 'modo',
        rotulo: 'Circuito',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Arco e raios' },
          { valor: 2, rotulo: 'Semicírculo e retas' },
          { valor: 3, rotulo: 'Dois arcos' },
          { valor: 4, rotulo: 'Quadrado' },
          { valor: 5, rotulo: 'Fio finito' },
        ],
      },
      { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: -30, max: 30, passo: 0.5 },
      MOVIMENTO,
      { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002, varre: { periodo: 12, ativo: 'auto==1 && modo==2' } },
      { id: 'R1', rotulo: 'Raio do arco interno', simbolo: 'R_1', valor: 0.025, unidade: 'm', min: 0.01, max: 0.04, passo: 0.002 },
      { id: 'al', rotulo: 'Abertura do arco', simbolo: r`\alpha`, valor: 120, unidade: '°', min: 20, max: 300, passo: 5, varre: { periodo: 12, ativo: 'auto==1 && (modo==1 || modo==3)' } },
      { id: 'lado', rotulo: 'Lado do quadrado', simbolo: 'a', valor: 0.08, unidade: 'm', min: 0.03, max: 0.14, passo: 0.002, varre: { periodo: 12, ativo: 'auto==1 && modo==4' } },
      { id: 'L', rotulo: 'Meio comprimento do fio', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.01, max: 0.09, passo: 0.002 },
      { id: 'ss', rotulo: 'Distância ao fio', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.005, max: 0.08, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1 && modo==5' } },
    ],
    objetos: [
      ...arco('a', 'modo==1', 'R', ini, 'al'),
      { id: 'r1', tipo: 'fio', ativo: 'modo==1', I: 'I0', a: [0, 0, 0], b: polar('R', ini) },
      { id: 'r2', tipo: 'fio', ativo: 'modo==1', I: 'I0', a: polar('R', fim), b: [0, 0, 0] },
      ...arco('s', 'modo==2', 'R', '90', '180'),
      { id: 'l1', tipo: 'fio', ativo: 'modo==2', I: 'I0', a: [0.09, 'R', 0], b: [0, 'R', 0], infinito: 'a' },
      { id: 'l2', tipo: 'fio', ativo: 'modo==2', I: 'I0', a: [0, '0-R', 0], b: [0.09, '0-R', 0], infinito: 'b' },
      ...arco('i', 'modo==3', 'R1', ini, 'al'),
      ...arco('e', 'modo==3', 'R', fim, '0-al'),
      { id: 'c1', tipo: 'fio', ativo: 'modo==3', I: 'I0', a: polar('R1', fim), b: polar('R', fim) },
      { id: 'c2', tipo: 'fio', ativo: 'modo==3', I: 'I0', a: polar('R', ini), b: polar('R1', ini) },
      { id: 'q1', tipo: 'fio', ativo: 'modo==4', I: 'I0', a: ['lado/2', '0-lado/2', 0], b: ['lado/2', 'lado/2', 0] },
      { id: 'q2', tipo: 'fio', ativo: 'modo==4', I: 'I0', a: ['lado/2', 'lado/2', 0], b: ['0-lado/2', 'lado/2', 0] },
      { id: 'q3', tipo: 'fio', ativo: 'modo==4', I: 'I0', a: ['0-lado/2', 'lado/2', 0], b: ['0-lado/2', '0-lado/2', 0] },
      { id: 'q4', tipo: 'fio', ativo: 'modo==4', I: 'I0', a: ['0-lado/2', '0-lado/2', 0], b: ['lado/2', '0-lado/2', 0] },
      { id: 'f', tipo: 'fio', ativo: 'modo==5', I: 'I0', a: ['0-L', 0, 0], b: ['L', 0, 0], rotulo: 'I' },
      { id: 'O', tipo: 'sonda', ativo: 'modo<=4', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      { id: 'P', tipo: 'sonda', ativo: 'modo==5', campo: 'B', pos: [0, 'ss', 0], arraste: { param: 'ss', eixo: 'y' }, rotulo: 'P' },
    ],
    visual: { setasB: false },
    medidas: [
      { rotulo: 'Campo no centro', simbolo: r`B_z(O)`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0*rad(al)/(4*pi*R)', ativo: 'modo==1' },
      { rotulo: 'Contribuição de um raio', simbolo: r`B_\text{raio}`, expr: "mag(Bde('r1', 0, 0, 0))", unidade: 'T', teoria: '0', ativo: 'modo==1' },
      { rotulo: 'Campo no centro', simbolo: r`\frac{\mu_0I}{4R} + \frac{\mu_0I}{2\pi R}`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(4*R) + mu0*I0/(2*pi*R)', ativo: 'modo==2' },
      { rotulo: 'Só as duas retas', simbolo: r`\frac{\mu_0I}{2\pi R}`, expr: "z(Bde('l1', 0, 0, 0)) + z(Bde('l2', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*R)', ativo: 'modo==2' },
      { rotulo: 'Campo no centro', simbolo: r`\frac{\mu_0I\alpha}{4\pi}\left(\frac1{R_1} - \frac1R\right)`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0*rad(al)/(4*pi)*(1/R1 - 1/R)', ativo: 'modo==3' },
      { rotulo: 'Campo no centro', simbolo: r`\frac{2\sqrt2\,\mu_0I}{\pi a}`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '2*sqrt(2)*mu0*I0/(pi*lado)', ativo: 'modo==4' },
      { rotulo: 'Campo em P', simbolo: r`\frac{\mu_0I}{2\pi s}\frac{L}{\sqrt{L^2 + s^2}}`, expr: 'z(B(0, ss, 0))', unidade: 'T', teoria: '0 - mu0*I0/(2*pi*ss)*L/sqrt(L^2 + ss^2)*(0-1)', ativo: 'modo==5' },
      { rotulo: 'Fio infinito, para comparar', simbolo: r`\frac{\mu_0I}{2\pi s}`, expr: 'mu0*I0/(2*pi*ss)', unidade: 'T', ativo: 'modo==5' },
    ],
    graficos: [
      {
        titulo: 'Campo no centro em função da abertura',
        tipo: 'perfil',
        ativo: 'modo==1',
        x: { variavel: 'aa', de: 20, ate: 300, rotulo: 'α', unidade: '°', marca: 'al' },
        series: [{ rotulo: 'B', expr: 'mu0*I0*rad(aa)/(4*pi*R)', unidade: 'T' }],
      },
      {
        titulo: 'Campo no ponto, no tempo',
        tipo: 'tempo',
        ativo: 'modo!=1',
        janela: 12,
        series: [{ rotulo: 'B', expr: 'modo==5 ? z(B(0, ss, 0)) : z(B(0, 0, 0))', unidade: 'T' }],
      },
    ],
    desafios: [
      {
        pergunta: 'No arco, abra $\\alpha$ até 180°. Compare com $\\mu_0I/2R$, o campo de uma espira.',
        condicao: 'auto==0 && modo==1 && abs(al - 180) < 3',
        sucesso: 'Um semicírculo dá metade do campo da espira: o arco contribui na proporção do ângulo, e os raios não contribuem.',
      },
      {
        pergunta: 'Nos dois arcos, deixe $R_1$ bem menor que $R$. Quem manda no campo?',
        condicao: 'modo==3 && R > 4*R1',
        sucesso: 'O arco interno: cada arco pesa como $1/R$, e as correntes dos dois têm sentidos opostos em torno de $O$.',
      },
      {
        pergunta: 'No fio finito, aumente $L$ até o campo em $P$ ficar a menos de 5% do fio infinito.',
        condicao: 'auto==0 && modo==5 && L/sqrt(L^2 + ss^2) > 0.95',
        sucesso: 'Isso exige $L \\approx 3s$: "infinito" quer dizer longo comparado com a distância ao ponto.',
      },
    ],
  },
}

/* ───────────────── Ampère em distribuições de corrente ───────────────── */

const entre = (s: string, r0: string, r1: string) => `max(0, min(1, (${s}^2 - ${r0}^2)/(${r1}^2 - ${r0}^2)))`
const Ienc = (s: string) =>
  `(modo==1 ? Ic*min(${s}/R, 1)^2 : (modo==2 ? 2*pi*J0*R^(0-n)*min(${s}, R)^(n+2)/(n+2) : ` +
  `(modo==3 ? Ic*${entre(s, 'Rm', 'R')} : Ic*min(${s}/Rm, 1)^2 - Ic*${entre(s, 'R', 'Re')})))`

export const ampereJ: LabNovo = {
  grupo: 'Magnetismo',
  cenario: {
    id: 'ampereJ',
    titulo: 'Ampère em distribuições de corrente',
    resumo: 'Cilindros com J(s), cascas e cabo coaxial: B(s) região por região.',
    teoria: r`Com simetria cilíndrica, a lei de Ampère dá $B(s) = \mu_0I_\text{enc}(s)/2\pi s$, e todo o trabalho está em achar a corrente envolvida:
$$I_\text{enc}(s) = \int_0^s J(s')\,2\pi s'\,ds'.$$

Dentro de um cilindro com $J$ uniforme, $B$ cresce linearmente; fora, cai com $1/s$. Numa casca, $B = 0$ no oco. **No cabo coaxial**, com correntes opostas, $I_\text{enc} = 0$ fora: o campo fica preso dentro do cabo.

O caminho amperiano varre o condutor: siga o ponto sobre $B(s)$ e veja a curva mudar de forma em cada fronteira.`,
    cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [3, 4, 24], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      {
        id: 'modo',
        rotulo: 'Condutor',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Cilindro maciço' },
          { valor: 2, rotulo: 'J não uniforme' },
          { valor: 3, rotulo: 'Casca' },
          { valor: 4, rotulo: 'Cabo coaxial' },
        ],
      },
      { id: 'n', rotulo: 'Lei J₀(s/R)ⁿ', valor: 1, opcoes: [{ valor: -1, rotulo: 'n = −1' }, { valor: 0.5, rotulo: 'n = ½' }, { valor: 1, rotulo: 'n = 1' }, { valor: 2, rotulo: 'n = 2' }] },
      { id: 'Ic', rotulo: 'Corrente', simbolo: 'I', valor: 50, unidade: 'A', min: 5, max: 100, passo: 1 },
      { id: 'J0', rotulo: 'Densidade na borda', simbolo: 'J_0', valor: 2e5, unidade: 'A/m²', min: 2e4, max: 5e5, passo: 1e4 },
      { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      { id: 'Rm', rotulo: 'Raio do núcleo ou do oco', simbolo: 'R_m', valor: 0.018, unidade: 'm', min: 0.008, max: 0.018, passo: 0.001 },
      { id: 'Re', rotulo: 'Raio externo do cabo', simbolo: 'R_e', valor: 0.065, unidade: 'm', min: 0.055, max: 0.08, passo: 0.001 },
      MOVIMENTO,
      { id: 'ra', rotulo: 'Raio do caminho amperiano', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.09, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1' } },
    ],
    objetos: [
      { id: 'c1', tipo: 'cilindroCorrente', ativo: 'modo==1', ponto: [0, 0, 0], direcao: 'z', raio: 'R', I: 'Ic', rotulo: 'I' },
      { id: 'c2', tipo: 'cilindroCorrente', ativo: 'modo==2', ponto: [0, 0, 0], direcao: 'z', raio: 'R', raioInterno: 'R*1e-4', J: 'J0*(r/R)^n', rotulo: 'J(s)' },
      { id: 'c3', tipo: 'cilindroCorrente', ativo: 'modo==3', ponto: [0, 0, 0], direcao: 'z', raio: 'R', raioInterno: 'Rm', I: 'Ic', rotulo: 'casca' },
      { id: 'c4', tipo: 'cilindroCorrente', ativo: 'modo==4', ponto: [0, 0, 0], direcao: 'z', raio: 'Rm', I: 'Ic', rotulo: 'núcleo' },
      { id: 'c5', tipo: 'cilindroCorrente', ativo: 'modo==4', ponto: [0, 0, 0], direcao: 'z', raio: 'Re', raioInterno: 'R', I: '0-Ic', rotulo: 'capa' },
      { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'ra', rotulo: 'C' },
    ],
    visual: { setasB: true, densidade: 13 },
    medidas: [
      { rotulo: 'Corrente envolvida', simbolo: r`I_\text{enc}`, expr: "Ienc('Amp')", unidade: 'A', teoria: Ienc('ra') },
      { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: `mu0*${Ienc('ra')}` },
      { rotulo: 'Campo em s', simbolo: 'B(s)', expr: 'y(B(ra, 0, 0))', unidade: 'T', teoria: `mu0*${Ienc('ra')}/(2*pi*ra)` },
    ],
    graficos: [
      {
        titulo: 'Campo B(s): simulação × Ampère',
        tipo: 'perfil',
        x: { variavel: 'ss', de: 0.002, ate: 0.095, rotulo: 's', unidade: 'm', marca: 'ra' },
        series: [
          { rotulo: 'simulação', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
          { rotulo: 'Ampère', expr: `mu0*${Ienc('ss')}/(2*pi*ss)`, unidade: 'T' },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Em $J(s)$, com qual lei o campo é **constante** dentro do condutor?',
        dica: '$B \\propto I_\\text{enc}/s$: é preciso $I_\\text{enc} \\propto s$.',
        condicao: 'modo==2 && n==-1',
        sucesso: 'Com $n = -1$: $J \\propto 1/s$ dá $I_\\text{enc} \\propto s$, e o $s$ cancela. O gráfico fica plano.',
      },
      {
        pergunta: 'No cabo coaxial, leve o caminho para fora da capa. Quanto vale $B$?',
        condicao: 'auto==0 && modo==4 && ra > Re',
        sucesso: 'Zero: as correntes opostas se cancelam em $I_\\text{enc}$. É por isso que o cabo coaxial não irradia nem interfere.',
      },
    ],
  },
}

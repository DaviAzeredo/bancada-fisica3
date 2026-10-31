import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1 */
const vv = 'qe*B0*D/(2*mp)'

/* Objetiva 2: pontas da barra. */
const sq = 'sqrt(1 - eta^2)'

/* Objetiva 3: faces do condutor, com ou sem aterramento. */
const sE = (zona: number) =>
  ['', 'terra==1 ? 0 : 0-sig/(2*eps0)', 'terra==1 ? sig/eps0 : sig/(2*eps0)', '0', 'terra==1 ? 0 : sig/(2*eps0)'][zona]

/* Objetiva 5 */
const nP = '(caso==1 ? 3 : 2)'
const Itot = `(V0/(Rr + Rr/${nP}))`
const Vpar = `(${Itot}*Rr/${nP})`
const Pp = `(${Itot}^2*Rr)`
const Pr = `(${Vpar}^2/Rr)`
const raioLampada = (P: string) => `0.004 + 0.012*${P}/(V0^2/Rr)`
const lampada = (id: string, x: number, y: number, P: string, rotulo: string, ativo?: string): ObjetoInput => ({
  id,
  tipo: 'esfera',
  Q: 1e-15,
  centro: [x, y, 0],
  raio: raioLampada(P),
  rotulo,
  ...(ativo ? { ativo } : {}),
})

/* Objetiva 6: patamar, rampa e parábola. */
const X1 = -0.04
const X2 = 0.02
const cc = 'V0/0.0025'
const VV = (u: string) => `(${u} < ${X1} ? V0 : (${u} < ${X2} ? V0*(${X2} - ${u})/${X2 - X1} : ${cc}*(${u} - ${X2})^2))`
const EE = (u: string) => `(${u} < ${X1} ? 0 : (${u} < ${X2} ? V0/${X2 - X1} : -2*${cc}*(${u} - ${X2})))`

/* Discursiva: portadores como traçadores (massa de 1 kg), só para mostrar a deriva. */
const portador = (id: string, q: string, v: string, z: number, y: number): ObjetoInput => ({
  id,
  tipo: 'particula',
  q,
  m: 1,
  pos: [0, y, z],
  v: [0, 0, v],
  rastro: 0.5,
})
const jj = '(4*qe*nn*u0)'

/**
 * P2 de Física III, 2024/1, diurno, versão A (03/06/2024). Conferida com o
 * gabarito oficial: objetivas 1f, 2g, 3b, 4a, 5d, 6e, e a discursiva. O scan traz
 * marcas de um aluno, algumas erradas: não valem como gabarito, e a Q6, que precisa
 * dos gráficos das alternativas, usa máscaras sobre elas.
 */
export const p2_2024_1_diurno: ProvaInput = {
  id: 'p2-2024-1-diurno',
  titulo: 'P2 · 2024/1 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão A · 03/06/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Semicírculo e seletor de velocidades',
      resumo: 'Dos dois caminhos da mesma partícula saem B e E.',
      enunciado: r`Uma partícula de massa $m$ e carga $q > 0$ penetra ortogonalmente, através de um orifício em um anteparo plano, em uma região onde existe um campo magnético constante de módulo $B$. Considere, então, as duas situações: (i) tal partícula segue uma trajetória semicircular, de diâmetro $D$; (ii) a mesma partícula, sujeita ao mesmo campo magnético, segue, agora, em uma trajetória retilínea, sem deflexão, devido à ação adicional de um campo elétrico constante $\vec E$. Sobre esses campos magnético $\vec B$ e elétrico $\vec E$ podemos concluir que:`,
      figura: [
        { pagina: 1, recorte: [0.5, 0.135, 0.9, 0.34] },
        { pagina: 1, recorte: [0.565, 0.585, 0.795, 0.885] },
      ],
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [2, 0, 17], alvo: [2, 0, 0] },
        tempo: { escala: 2e-7, unidade: 'ns', passo: 1e-9, duracao: 1.6e-6 },
      },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(i) só B' },
            { valor: 2, rotulo: '(ii) B e E' },
          ],
        },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'D', rotulo: 'Diâmetro', simbolo: 'D', valor: 0.06, unidade: 'm', min: 0.04, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, '0-B0'], regiao: { min: [0, -0.1, -0.1], max: [0.1, 0.1, 0.1] }, rotulo: 'B' },
        { id: 'E', tipo: 'campoE', ativo: 'caso==2', valor: `x > 0 ? [0, 0-(${vv})*B0, 0] : [0, 0, 0]` },
        { id: 'p', tipo: 'particula', rotulo: 'q', q: 'qe', m: 'mp', pos: [-0.02, '0-D/2', 0], v: [vv, 0, 0], parada: 'x < 0 && y > 0' },
        { id: 'ant', tipo: 'caminho', pontos: [[0, -0.075, 0], [0, 0.075, 0]], seta: 0.97, rotulo: 'anteparo' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.6*cm', rotulo: 'v' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy', fontes: ['Bz'] },
      medidas: [
        { rotulo: 'Velocidade de entrada', simbolo: 'v', expr: vv, unidade: 'm/s' },
        { rotulo: 'Diâmetro no rastro', simbolo: 'D', ativo: 'caso==1', expr: "t > pi*mp/(qe*B0) ? rastroSpan('p', 'y') : 0/0", unidade: 'm', teoria: 'D' },
        { rotulo: 'Altura do voo reto', simbolo: 'y', ativo: 'caso==2', expr: "y(pos('p'))", unidade: 'm', teoria: '0-D/2' },
        { rotulo: 'Campo elétrico', simbolo: 'E_y', ativo: 'caso==2', expr: 'y(E(0.02, 0, 0))', unidade: 'V/m', teoria: '0-qe*B0^2*D/(2*mp)' },
      ],
      passos: [
        {
          titulo: 'O sentido de B',
          previsao: { pergunta: 'A partícula entra para +x̂ e curva para +ŷ. O campo aponta para…', opcoes: ['+ẑ', '−ẑ', '+ŷ'], correta: 1 },
          texto: r`Na entrada, a força é $q\vec v\times\vec B$, e precisa apontar para $+\hat y$. Como $\hat x\times(-\hat z) = +\hat y$:

$$\vec B = -B\hat z,$$

entrando na página. Rode a simulação.`,
          parametros: { caso: 1 },
        },
        {
          titulo: 'A velocidade',
          texto: r`O raio é $D/2$. Da força centrípeta, $qvB = mv^2/(D/2)$:

$$v = \frac{qBD}{2m}.$$`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Seletor de velocidades',
          texto: r`Para seguir reto, a força elétrica cancela a magnética: $q\vec E = -q\vec v\times\vec B$. A magnética aponta para $+\hat y$, então $\vec E$ aponta para $-\hat y$, com $E = vB$:

$$\vec E = -\frac{qB^2D}{2m}\hat y.$$

Alternativa **(f)**.`,
          parametros: { caso: 2 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz e seletor de velocidades', lab: 'lorentz' }],
        etapas: [
          { titulo: 'B', texto: r`A curva para $+\hat y$ exige $\vec B = -B\hat z$.`, passo: 0 },
          { titulo: 'v', texto: r`$v = qBD/2m$.`, passo: 1 },
          { titulo: 'E', texto: r`$E = vB$, em $-\hat y$.`, passo: 2 },
        ],
        resultado: r`$\vec B = -B\hat z$ e $\vec E = -\dfrac{qB^2D}{2m}\hat y$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar $D$ como raio, o que dobra $E$.`,
          r`Fazer $\vec E$ paralelo a $\vec B$: ele tem de se opor à força magnética.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec B = B\hat z$ e $\vec E = [qB^2D/(2m)]\,\hat y$`, porque: r`Com $+\hat z$, a partícula curvaria para baixo.` },
        { letra: 'b', texto: r`$\vec B = -B\hat z$ e $\vec E = [qB^2D/m]\,\hat y$`, porque: r`Usa $D$ como raio, e $\vec E$ no sentido da força magnética, somando em vez de cancelar.` },
        { letra: 'c', texto: r`$\vec B = B\hat y$ e $\vec E = [\pi qB^2D/m]\,\hat x$`, porque: r`$\vec B$ tem de ser perpendicular ao plano da trajetória.` },
        { letra: 'd', texto: r`$\vec B = B\hat y$ e $\vec E = [qB^2D/(2\pi m)]\,\hat x$`, porque: r`$\vec B$ tem de ser perpendicular ao plano da trajetória.` },
        { letra: 'e', texto: r`$\vec B = B\hat x$ e $\vec E = [qB^2D/(\pi m)]\,\hat z$`, porque: r`Com $\vec B\parallel\vec v$ não haveria força magnética.` },
        { letra: 'f', texto: r`$\vec B = -B\hat z$ e $\vec E = -[qB^2D/(2m)]\,\hat y$`, correta: true, porque: r`Correta.` },
        { letra: 'g', texto: r`$\vec B = B\hat z$ e $\vec E = -[qB^2D/(2m)]\,\hat x$`, porque: r`Com $\vec E$ ao longo de $\hat x$, a partícula só seria acelerada ou freada.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Barra inclinada que fecha o circuito',
      resumo: 'Força magnética e a corrente máxima antes de levantar.',
      enunciado: r`A figura ilustra, em um plano vertical, a presença de uma barra condutora de comprimento $L$ e massa $m$ que, devido à sua posição e ao campo gravitacional constante $\vec g = -g\hat y$ ($g > 0$), permite a circulação, segundo o sentido indicado, de uma corrente elétrica estacionária de intensidade $I$ pelos fios condutores (1) (horizontal) e (2) (dobrado). Uma das extremidades da barra encontra-se apenas apoiada na extremidade do fio (1) enquanto que a outra extremidade, em contato com o fio (2), pode deslizar sem atrito pelo seu trecho vertical sem, entretanto, perder contato com ele. Na região de largura $\Delta x = \eta L$ ($\eta < 1$), em que se encontra a barra, existe um campo magnético constante $\vec B = B\hat z$ ($B > 0$). Nessas condições, pode-se concluir que a força magnética sobre a barra, enquanto houver corrente, será dada por:`,
      figura: [
        { pagina: 2, recorte: [0.11, 0.115, 0.505, 0.395] },
        { pagina: 2, recorte: [0.12, 0.655, 0.5, 0.915] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [3, 3.5, 23], alvo: [3, 3.5, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 8, passo: 0.1 },
        { id: 'eta', rotulo: 'Fração η', simbolo: r`\eta`, valor: 0.6, min: 0.3, max: 0.9, passo: 0.01 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.1, unidade: 'm', min: 0.1, max: 0.1 },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'mm', rotulo: 'Massa', simbolo: 'm', valor: 0.02, unidade: 'kg', min: 0.005, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [0, -0.02, -0.05], max: ['eta*L', 0.11, 0.05] }, rotulo: 'B' },
        { id: 'barra', tipo: 'fio', I: 'I0', a: ['eta*L', `L*${sq}`, 0], b: [0, 0, 0], rotulo: 'barra' },
        { id: 'f1', tipo: 'fio', I: 'I0', a: [0.1, `L*${sq}`, 0], b: ['eta*L', `L*${sq}`, 0] },
        { id: 'f2', tipo: 'fio', I: 'I0', a: [0, 0, 0], b: [-0.06, 0, 0] },
        { id: 'guia', tipo: 'caminho', pontos: [[0, 0, 0], [0, 0.1, 0]], seta: 0.9, tracejado: true },
        { id: 'F', tipo: 'seta', papel: 'forca', origem: ['eta*L/2', `L*${sq}/2`, 0], vetor: "forca('barra','Bz')", comprimento: '3*cm', rotulo: 'F' },
        { id: 'P', tipo: 'seta', papel: 'neutro', origem: ['eta*L/2', `L*${sq}/2`, 0], vetor: [0, -1, 0], comprimento: '2*cm', rotulo: 'mg' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy', fontes: ['Bz'] },
      medidas: [
        { rotulo: 'Força em x', simbolo: 'F_x', expr: "x(forca('barra','Bz'))", unidade: 'N', teoria: `0-I0*L*B0*${sq}` },
        { rotulo: 'Força em y', simbolo: 'F_y', expr: "y(forca('barra','Bz'))", unidade: 'N', teoria: 'I0*L*B0*eta' },
        { rotulo: 'Peso', simbolo: 'mg', expr: 'mm*9.8', unidade: 'N' },
        { rotulo: 'Corrente máxima', simbolo: r`I_\text{max}`, expr: 'mm*9.8/(eta*B0*L)', unidade: 'A' },
      ],
      passos: [
        {
          titulo: 'O vetor da barra',
          texto: r`A corrente vem do fio (1), desce a barra e sai pelo fio (2). A barra vai do canto superior direito ao inferior esquerdo:

$$\vec L = -\eta L\,\hat x - \sqrt{1-\eta^2}\,L\,\hat y.$$`,
        },
        {
          titulo: 'A força',
          previsao: { pergunta: 'A componente vertical da força aponta para…', opcoes: ['cima', 'baixo', 'é nula'], correta: 0 },
          texto: r`Com $\hat x\times\hat z = -\hat y$ e $\hat y\times\hat z = \hat x$:

$$\vec F = I\vec L\times\vec B = ILB\left[\eta\hat y - \sqrt{1-\eta^2}\,\hat x\right].$$

A força é perpendicular à barra. Ela puxa para cima e contra o fio vertical.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Até quando vale',
          texto: r`A barra está só **apoiada** na ponta do fio (1). Enquanto a componente vertical não superar o peso, ela fica no lugar:

$$ILB\eta \le mg \quad\Rightarrow\quad I \le \frac{mg}{\eta BL}.$$

Acima disso, a barra sobe, perde o apoio e a corrente é interrompida. Alternativa **(g)**.`,
          medidas: [1, 2, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }],
        etapas: [
          { titulo: 'Vetor', texto: r`$\vec L = -\eta L\hat x - \sqrt{1-\eta^2}L\hat y$.`, passo: 0 },
          { titulo: 'Força', texto: r`$\vec F = ILB[\eta\hat y - \sqrt{1-\eta^2}\hat x]$.`, passo: 1 },
          { titulo: 'Condição', texto: r`$F_y \le mg$ dá $I \le mg/(\eta BL)$.`, passo: 2 },
        ],
        resultado: r`$\vec F = ILB[\eta\hat y - \sqrt{1-\eta^2}\hat x]$ com $I \le mg/(\eta BL)$: alternativa **(g)**.`,
        errosComuns: [
          r`Trocar seno e cosseno: a projeção **horizontal** é $\eta L$.`,
          r`Comparar o módulo da força com o peso: só a componente vertical compete com ele.`,
        ],
        oficial: { resposta: '(g)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\vec F = ILB[\eta\hat x - \sqrt{1-\eta^2}\,\hat y]$ quando $I \le mg/(\sqrt{1-\eta^2}BL)$`, porque: r`Essa força é paralela à barra, e a força magnética é perpendicular a ela.` },
        { letra: 'b', texto: r`$\vec F = ILB[\eta\hat y + \sqrt{1-\eta^2}\,\hat x]$ quando $I \ge mg/(\sqrt{1-\eta^2}BL)$`, porque: r`Sinal errado em $\hat x$, e a condição seria $I \le$, não $I \ge$.` },
        { letra: 'c', texto: r`$\vec F = ILB[\eta\hat x - \sqrt{1-\eta^2}\,\hat y]$ quando $I \le mg/(BL)$`, porque: r`Força paralela à barra.` },
        { letra: 'd', texto: r`$\vec F = ILB[\eta\hat y - \sqrt{1-\eta^2}\,\hat x]$ quando $I \le \eta mg/(BL)$`, porque: r`Força certa, mas $\eta$ está no lugar errado: de $ILB\eta \le mg$ sai $mg/(\eta BL)$.` },
        { letra: 'e', texto: r`$\vec F = ILB[\eta\hat x + \sqrt{1-\eta^2}\,\hat x]$ quando $I \le mg/(\eta^2BL)$`, porque: r`Os dois termos ao longo de $\hat x$ não têm sentido, e falta a componente vertical.` },
        { letra: 'f', texto: r`$\vec F = ILB[\eta\hat x + \sqrt{1-\eta}\,\hat y]$ quando $I \le mg/(\eta^2BL)$`, porque: r`A raiz é de $1 - \eta^2$, e as componentes estão trocadas.` },
        { letra: 'g', texto: r`$\vec F = ILB[\eta\hat y - \sqrt{1-\eta^2}\,\hat x]$ quando $I \le mg/(\eta BL)$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Placa carregada e condutor aterrado',
      resumo: 'Campo nas quatro regiões.',
      enunciado: r`Considere duas placas planas infinitas e paralelas; sendo uma fina (bidimensional), com densidade superficial de carga constante $\sigma$ e a outra espessa, condutora, com uma de suas faces conectada à Terra. As placas estão separadas por uma distância fixa. Assumindo que o sistema está em equilíbrio eletrostático, qual das alternativas descreve corretamente o campo elétrico nas regiões I, II, III e IV conforme indicado na figura?`,
      figura: [
        { pagina: 2, recorte: [0.515, 0.115, 0.91, 0.27] },
        { pagina: 2, recorte: [0.72, 0.31, 0.9, 0.51] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 2, 19], alvo: [1, 0, 0] } },
      parametros: [
        {
          id: 'terra',
          rotulo: 'Condutor',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'aterrado' },
            { valor: 0, rotulo: 'isolado e neutro' },
          ],
        },
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 1e-8, unidade: 'C/m²', min: 2e-9, max: 3e-8, passo: 1e-9 },
      ],
      objetos: [
        { id: 'fina', tipo: 'planoInfinito', sigma: 'sig', ponto: [-0.03, 0, 0], normal: 'x', rotulo: 'σ' },
        { id: 'esq', tipo: 'planoInfinito', sigma: 'terra==1 ? 0-sig : 0-sig/2', ponto: [0.03, 0, 0], normal: 'x' },
        { id: 'dir', tipo: 'planoInfinito', sigma: 'terra==1 ? 0 : sig/2', ponto: [0.05, 0, 0], normal: 'x' },
        { id: 'tI', tipo: 'rotulo', pos: [-0.055, 0.06, 0], texto: 'I' },
        { id: 'tII', tipo: 'rotulo', pos: [0, 0.06, 0], texto: 'II' },
        { id: 'tIII', tipo: 'rotulo', pos: [0.04, 0.06, 0], texto: 'III' },
        { id: 'tIV', tipo: 'rotulo', pos: [0.07, 0.06, 0], texto: 'IV' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Região I', simbolo: 'E_\\text{I}', expr: 'x(E(-0.055, 0, 0))', unidade: 'V/m', teoria: sE(1) },
        { rotulo: 'Região II', simbolo: 'E_\\text{II}', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: sE(2) },
        { rotulo: 'Região III', simbolo: 'E_\\text{III}', expr: 'x(E(0.04, 0, 0))', unidade: 'V/m', teoria: sE(3) },
        { rotulo: 'Região IV', simbolo: 'E_\\text{IV}', expr: 'x(E(0.07, 0, 0))', unidade: 'V/m', teoria: sE(4) },
        { rotulo: 'Carga na face interna, em σ', simbolo: r`\sigma_i/\sigma`, expr: '(0 - eps0*x(E(0.029, 0, 0)))/sig', teoria: 'terra==1 ? -1 : -1/2' },
      ],
      passos: [
        {
          titulo: 'O que o aterramento faz',
          texto: r`Sem Terra, o condutor ficaria neutro, e cada face teria $\mp\sigma/2$. Ligado à Terra, ele pode receber carga: o potencial dele é o do infinito, e as cargas se rearranjam até o campo sumir do lado de fora.

Compare as duas opções no controle.`,
          parametros: { terra: 0 },
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: 'Toda a carga induzida vai para a face interna',
          previsao: { pergunta: 'Com o condutor aterrado, o campo na região IV é…', opcoes: ['nulo', 'σ/ε₀', 'σ/2ε₀'], correta: 0 },
          texto: r`A face voltada para a placa fica com $-\sigma$, e a outra, sem carga. As linhas que saem de $\sigma$ param todas ali.

$$\vec E_\text{I} = \vec 0, \quad \vec E_\text{II} = \frac{\sigma}{\varepsilon_0}\hat x, \quad \vec E_\text{III} = \vec 0, \quad \vec E_\text{IV} = \vec 0.$$`,
          parametros: { terra: 1 },
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`Alternativa **(b)**. É um capacitor de placas paralelas: só há campo entre as placas.`,
          parametros: { terra: 1 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio', lab: 'gauss' },
          { texto: 'Superposição de planos' },
        ],
        etapas: [
          { titulo: 'Metal', texto: r`$\vec E_\text{III} = \vec 0$.`, passo: 1 },
          { titulo: 'Terra', texto: r`O condutor aterrado fica com $-\sigma$ na face interna, e nada na outra.`, passo: 1 },
          { titulo: 'Fora', texto: r`As contribuições de $\sigma$ e $-\sigma$ se cancelam em I e IV, e se somam em II.`, passo: 1 },
        ],
        resultado: r`$\vec 0$, $\dfrac{\sigma}{\varepsilon_0}\hat x$, $\vec 0$, $\vec 0$: alternativa **(b)**.`,
        errosComuns: [
          r`Tratar o condutor como neutro: o fio para a Terra deixa carga entrar.`,
          r`Usar $\sigma/2\varepsilon_0$ em II: as duas superfícies carregadas contribuem.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{\sigma}{\epsilon_0}\hat x$, $\dfrac{\sigma}{\epsilon_0}\hat x$, $\dfrac{2\sigma}{\epsilon_0}\hat x$, $\vec 0$`, porque: r`Há campo no metal, o que não existe em equilíbrio.` },
        { letra: 'b', texto: r`$\vec 0$, $\dfrac{\sigma}{\epsilon_0}\hat x$, $\vec 0$, $\vec 0$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\vec 0$, $-\dfrac{\sigma}{\epsilon_0}\hat x$, $\vec 0$, $\vec 0$`, porque: r`O campo em II sai da placa positiva, para $+\hat x$.` },
        { letra: 'd', texto: r`$\vec 0$, $\dfrac{\sigma}{\epsilon_0}\hat x$, $\vec 0$, $-\dfrac{\sigma}{\epsilon_0}\hat x$`, porque: r`O aterramento anula o campo em IV.` },
        { letra: 'e', texto: r`$\dfrac{\sigma}{\epsilon_0}\hat x$, $\dfrac{\sigma}{\epsilon_0}\hat x$, $\vec 0$, $-\dfrac{\sigma}{\epsilon_0}\hat x$`, porque: r`Em I as contribuições se cancelam.` },
        { letra: 'f', texto: r`$\dfrac{\sigma}{\epsilon_0}\hat x$, $\dfrac{\sigma}{\epsilon_0}\hat x$, $\dfrac{2\sigma}{\epsilon_0}\hat x$, $\vec 0$`, porque: r`Há campo no metal.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Metade da separação, triplo da fem',
      resumo: 'Variação fracional da energia entre dois capacitores.',
      enunciado: r`Considere o circuito da figura, constituído, numa primeira situação, I, por um capacitor ideal C, de placas planas e paralelas, de área $A$ e separação $L$, e uma bateria ideal B, com fem $\mathcal E$. A partir do estado neutro, o capacitor é ligado, então, à bateria e, após atingido o estado de carga completa, armazena energia $U_\text{I}$. Numa segunda situação, II, o capacitor é trocado por outro, também de placas planas e paralelas, de mesma área $A$, mas separação $L/2$; simultaneamente, a bateria é trocada por outra, com fem $3\mathcal E$. Analogamente, a partir do estado neutro, o novo capacitor é ligado, então, à nova bateria e, após atingido o estado de carga completa, armazena energia $U_\text{II}$. Qual é a variação fracional de energia: $(U_\text{II} - U_\text{I})/U_\text{I}$?`,
      figura: [
        { pagina: 3, recorte: [0.09, 0.125, 0.485, 0.365] },
        { pagina: 3, recorte: [0.25, 0.365, 0.38, 0.62] },
      ],
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [26, 20, 74], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'I: L e fem' },
            { valor: 2, rotulo: 'II: L/2 e 3 fem' },
          ],
        },
        { id: 'fem', rotulo: 'Fem', simbolo: r`\mathcal E`, valor: 50, unidade: 'V', min: 10, max: 100, passo: 5 },
        { id: 'L', rotulo: 'Separação', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'C',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado',
          d: 'caso==1 ? L : L/2',
          Q: '(caso==1 ? 1 : 6)*eps0*lado^2/L*fem',
        },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância', simbolo: 'C', expr: "C('cap')", unidade: 'F', teoria: '(caso==1 ? 1 : 2)*eps0*lado^2/L' },
        { rotulo: 'ddp medida', simbolo: 'V', expr: "Vcap('cap')", unidade: 'V', teoria: '(caso==1 ? 1 : 3)*fem' },
        { rotulo: 'Energia', simbolo: 'U', expr: "U('cap')", unidade: 'J' },
        { rotulo: 'U/U_I', simbolo: r`U/U_\text{I}`, expr: "U('cap')/(eps0*lado^2*fem^2/(2*L))", teoria: 'caso==1 ? 1 : 18' },
      ],
      passos: [
        {
          titulo: 'Situação I',
          texto: r`$$C = \frac{\varepsilon_0A}{L}, \qquad U_\text{I} = \frac12C\mathcal E^2.$$`,
          parametros: { caso: 1 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Situação II',
          previsao: { pergunta: 'A energia na situação II é quantas vezes U_I?', opcoes: ['6', '9', '18'], correta: 2 },
          texto: r`Metade da separação dobra a capacitância, e a ddp triplica:

$$U_\text{II} = \frac12(2C)(3\mathcal E)^2 = 18\,U_\text{I}.$$`,
          parametros: { caso: 2 },
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: 'Resposta',
          texto: r`$$\frac{U_\text{II} - U_\text{I}}{U_\text{I}} = 18 - 1 = 17.$$

Alternativa **(a)**. A pegadinha é o $-1$: a questão pede a variação, não a razão.`,
          parametros: { caso: 2 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitância e energia', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Energias', texto: r`$U_\text{I} = \frac12C\mathcal E^2$ e $U_\text{II} = \frac12(2C)(3\mathcal E)^2$.`, passo: 1 },
          { titulo: 'Variação', texto: r`$18 - 1 = 17$.`, passo: 2 },
        ],
        resultado: r`17: alternativa **(a)**.`,
        errosComuns: [
          r`Responder 18: isso é a razão, não a variação fracional.`,
          r`Esquecer o quadrado de $3\mathcal E$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: '$17$.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: '$7$.', porque: r`Não sai de $2\cdot9 - 1$.` },
        { letra: 'c', texto: '$8$.', porque: r`Não sai de $2\cdot9 - 1$.` },
        { letra: 'd', texto: '$6$.', porque: r`É $2\cdot3$: esquece o quadrado da fem.` },
        { letra: 'e', texto: '$1/17$.', porque: r`Inverte a fração.` },
        { letra: 'f', texto: '$1/7$.', porque: r`Inverte e erra o valor.` },
        { letra: 'g', texto: '$1/8$.', porque: r`Inverte e erra o valor.` },
        { letra: 'h', texto: '$1/6$.', porque: r`Inverte e erra o valor.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quando uma lâmpada queima',
      resumo: 'Paralelo perde um ramo; o que muda em P, R e S?',
      enunciado: r`A figura mostra um circuito formado por quatro lâmpadas idênticas, denotadas por P, Q, R e S, e uma fonte ideal de força eletromotriz denotada por F. Considerando que o brilho de uma lâmpada é proporcional à potência dissipada por sua resistência interna, o que acontecerá com as demais lâmpadas se a lâmpada Q queimar?`,
      figura: { pagina: 3, recorte: [0.5, 0.125, 0.89, 0.53] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 19], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Lâmpada Q',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'acesa' },
            { valor: 2, rotulo: 'queimada' },
          ],
        },
        { id: 'V0', rotulo: 'Fem', simbolo: 'F', valor: 12, unidade: 'V', min: 3, max: 24, passo: 1 },
        { id: 'Rr', rotulo: 'Resistência de cada lâmpada', simbolo: 'R', valor: 6, unidade: 'Ω', min: 2, max: 20, passo: 1 },
      ],
      objetos: [
        lampada('S', 0, 0.05, Pr, 'S'),
        lampada('R', 0, 0.015, Pr, 'R'),
        lampada('Q', 0, -0.02, Pr, 'Q', 'caso==1'),
        { id: 'Qx', tipo: 'rotulo', ativo: 'caso==2', pos: [0, -0.02, 0], texto: 'Q queimada' },
        lampada('P', 0, -0.06, Pp, 'P'),
        { id: 'w1', tipo: 'caminho', pontos: [[-0.04, 0.05, 0], [0.04, 0.05, 0]], seta: 0.25 },
        { id: 'w2', tipo: 'caminho', pontos: [[-0.04, 0.015, 0], [0.04, 0.015, 0]], seta: 0.25 },
        { id: 'w3', tipo: 'caminho', ativo: 'caso==1', pontos: [[-0.04, -0.02, 0], [0.04, -0.02, 0]], seta: 0.25 },
        { id: 'w4', tipo: 'caminho', pontos: [[-0.04, 0.05, 0], [-0.04, -0.02, 0]], seta: 0.5 },
        { id: 'w5', tipo: 'caminho', pontos: [[0.04, 0.05, 0], [0.04, -0.06, 0], [-0.075, -0.06, 0], [-0.075, 0.015, 0], [-0.04, 0.015, 0]], seta: 0.45 },
        { id: 'tF', tipo: 'rotulo', pos: [-0.075, -0.015, 0], texto: 'F' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Resistência total', simbolo: 'R_T', expr: `V0/${Itot}`, unidade: 'Ω', teoria: '(caso==1 ? 4/3 : 3/2)*Rr' },
        { rotulo: 'Corrente em P', simbolo: 'I', expr: Itot, unidade: 'A', teoria: '(caso==1 ? 3/4 : 2/3)*V0/Rr' },
        { rotulo: 'ddp no paralelo', simbolo: 'V_R', expr: Vpar, unidade: 'V', teoria: '(caso==1 ? 1/4 : 1/3)*V0' },
        { rotulo: 'Potência em P', simbolo: 'P_P', expr: Pp, unidade: 'W', teoria: '(caso==1 ? 9/16 : 4/9)*V0^2/Rr' },
        { rotulo: 'Potência em R e em S', simbolo: 'P_R', expr: Pr, unidade: 'W', teoria: '(caso==1 ? 1/16 : 1/9)*V0^2/Rr' },
      ],
      passos: [
        {
          titulo: 'Antes de queimar',
          texto: r`S, R e Q estão em paralelo, com $R/3$, em série com P:

$$R_T = R + \frac R3 = \frac43R, \qquad I = \frac{3F}{4R}.$$

O paralelo fica com $F/4$. O tamanho de cada esfera acompanha a potência da lâmpada.`,
          parametros: { caso: 1 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Depois de queimar',
          previsao: { pergunta: 'Sem Q, a corrente total…', opcoes: ['aumenta', 'diminui', 'não muda'], correta: 1 },
          texto: r`Sem um ramo, o paralelo passa a $R/2$. A resistência total **aumenta**:

$$R_T = \frac32R, \qquad I = \frac{2F}{3R}.$$`,
          parametros: { caso: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'P perde, R e S ganham',
          texto: r`P tem menos corrente: $P_P$ cai de $\frac{9}{16}$ para $\frac49$ de $F^2/R$. **Brilha menos.**

O paralelo fica com mais ddp, $F/3$ em vez de $F/4$: $P_R$ sobe de $\frac{1}{16}$ para $\frac19$. R e S **brilham mais**.

Alternativa **(d)**.`,
          parametros: { caso: 2 },
          medidas: [2, 3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de resistores e potência', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Antes', texto: r`$I = 3F/4R$ e $V_R = F/4$.`, passo: 0 },
          { titulo: 'Depois', texto: r`$I = 2F/3R$ e $V_R = F/3$.`, passo: 1 },
          { titulo: 'Comparar', texto: r`$I$ cai, então P perde brilho. $V_R$ sobe, então R e S ganham.`, passo: 2 },
        ],
        resultado: r`P brilha menos, R e S brilham mais: alternativa **(d)**.`,
        errosComuns: [
          r`Achar que a corrente que passava por Q passa inteira para R e S, sem mudar o total.`,
          r`Achar que queimar uma lâmpada apaga as outras: Q está em paralelo.`,
        ],
        oficial: { resposta: '(d)', observacao: r`Marcas à mão no scan apontam (f), que é errada.` },
      },
      alternativas: [
        { letra: 'a', texto: 'Todas as lâmpadas brilharão com mais intensidade do que antes.', porque: r`A corrente total cai: P brilha menos.` },
        { letra: 'b', texto: 'Todas as lâmpadas brilharão com menos intensidade do que antes.', porque: r`A ddp em R e S aumenta.` },
        { letra: 'c', texto: 'A lâmpada P brilhará mais intensamente do que antes, enquanto as lâmpadas R e S brilharão com menos intensidade do que antes.', porque: r`É o contrário.` },
        { letra: 'd', texto: 'A lâmpada P brilhará mais fracamente do que antes, enquanto as lâmpadas R e S brilharão com mais intensidade do que antes.', correta: true, porque: r`Correta.` },
        { letra: 'e', texto: 'A lâmpada P permanecerá com o mesmo brilho de antes, enquanto as lâmpadas R e S brilharão com menos intensidade do que antes.', porque: r`A corrente em P muda, e R e S ganham brilho.` },
        { letra: 'f', texto: 'A lâmpada P permanecerá com o mesmo brilho de antes, enquanto as lâmpadas R e S brilharão com mais intensidade do que antes.', porque: r`R e S ganham brilho, mas P não mantém o seu: a corrente total muda.` },
        { letra: 'g', texto: 'Todas as lâmpadas se apagarão.', porque: r`Q está em paralelo: o circuito continua fechado por R e S.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'De V(x) para E_x(x)',
      resumo: 'Patamar, rampa descendo e parábola subindo.',
      enunciado: r`A figura mostra como o potencial eletrostático produzido por uma distribuição de cargas varia como função da coordenada $x$ em uma dada região do espaço. Supondo que o potencial depende apenas dessa coordenada, qual das alternativas melhor representa o comportamento da componente $E_x$ do campo eletrostático associado como função de $x$?`,
      figura: {
        pagina: 4,
        recorte: [0.115, 0.115, 0.505, 0.91],
        mascaras: [
          { area: [0.132, 0.485, 0.162, 0.52], letra: '' },
          { area: [0.315, 0.475, 0.34, 0.51], letra: '' },
          { area: [0.14, 0.65, 0.165, 0.685], letra: '' },
          { area: [0.32, 0.68, 0.345, 0.71], letra: '' },
          { area: [0.132, 0.785, 0.175, 0.84], letra: '' },
          { area: [0.222, 0.757, 0.25, 0.792], letra: '(e)' },
          { area: [0.32, 0.805, 0.345, 0.835], letra: '' },
        ],
      },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 1, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Patamar do potencial', simbolo: 'V_0', valor: 10, unidade: 'V', min: 5, max: 20, passo: 1 },
        { id: 'xP', rotulo: 'Posição da sonda', simbolo: 'x', valor: -0.06, unidade: 'm', min: -0.08, max: 0.07, passo: 0.002 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: `[${EE('x')}, 0, 0]`, potencial: VV('x') },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'sonda' },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Potencial', simbolo: 'V', expr: 'V(xP, 0, 0)', unidade: 'V', teoria: VV('xP') },
        { rotulo: 'Campo', simbolo: 'E_x', expr: 'x(E(xP, 0, 0))', unidade: 'V/m', teoria: EE('xP') },
      ],
      graficos: [
        {
          titulo: 'V(x)',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.08, ate: 0.07, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(xx, 0, 0)', unidade: 'V' }],
        },
        {
          titulo: 'E_x(x)',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.08, ate: 0.07, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'E_x', expr: 'x(E(xx, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Patamar: campo nulo',
          texto: r`$E_x = -dV/dx$. Onde $V$ é constante, $E_x = 0$.`,
          parametros: { xP: -0.06 },
          medidas: [0, 1],
        },
        {
          titulo: 'Rampa descendo: campo constante positivo',
          texto: r`$V$ cai em linha reta: inclinação negativa e constante. $E_x$ é **positivo e constante**. As setas apontam para a direita, todas iguais.`,
          parametros: { xP: -0.01 },
          medidas: [0, 1],
        },
        {
          titulo: 'Parábola subindo: campo negativo crescendo',
          previsao: { pergunta: 'Na parábola, depois do mínimo, E_x é…', opcoes: ['positivo e constante', 'negativo, com módulo crescendo linearmente', 'nulo'], correta: 1 },
          texto: r`$V$ sobe, cada vez mais inclinado: $V \propto (x - x_0)^2$ dá $E_x \propto -(x - x_0)$, uma **reta** partindo de zero e descendo.

Em $x_0$, o campo salta do valor positivo para zero: a inclinação de $V$ muda abruptamente na quina.`,
          parametros: { xP: 0.05 },
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`Zero, depois patamar positivo, depois reta descendo a partir de zero: gráfico **(e)**.`,
          parametros: { xP: 0.05 },
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo como gradiente do potencial', lab: 'potencial' }],
        etapas: [
          { titulo: 'Trecho a trecho', texto: r`Patamar: $E_x = 0$. Rampa: $E_x$ constante e positivo. Parábola: $E_x$ linear e negativo.`, passo: 2 },
        ],
        resultado: r`Gráfico **(e)**.`,
        errosComuns: [
          r`Esquecer o sinal de $E_x = -dV/dx$: isso leva ao gráfico (c).`,
          r`Fazer a parábola virar uma curva: a derivada de $x^2$ é uma reta.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Gráfico (a): sobe em reta, cai em curva e fica negativo.', porque: r`Não tem o patamar nulo inicial.` },
        { letra: 'b', texto: 'Gráfico (b): sobe em reta, cai em curva mais rápida e fica negativo.', porque: r`Não tem o patamar nulo inicial.` },
        { letra: 'c', texto: 'Gráfico (c): zero, patamar negativo e curva positiva crescente.', porque: r`Sinais trocados: é $+dV/dx$.` },
        { letra: 'd', texto: 'Gráfico (d): zero, reta descendo, patamar negativo e reta subindo.', porque: r`A rampa de $V$ tem de dar campo constante, e positivo.` },
        { letra: 'e', texto: 'Gráfico (e): zero, patamar positivo e reta descendo a partir de zero.', correta: true, porque: r`Correta.` },
        { letra: 'f', texto: 'Gráfico (f): zero, patamar positivo, salto negativo e reta subindo até zero.', porque: r`O campo na parábola parte de zero no mínimo de $V$ e cresce em módulo.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Lâmpada fluorescente num campo magnético',
      resumo: 'Neutralidade, densidade de corrente, resistividade e força.',
      enunciado: r`Considere uma lâmpada fluorescente na forma de um cilindro circular de comprimento $L$ e raio $a$, com eixo $z$. Dentro de tal lâmpada há dois tipos de partículas carregadas livres (móveis): cátions (íons positivos), de carga $2e$, e elétrons, de carga $-e$, movendo-se com velocidades, respectivamente, $\vec u = u_0\hat z$ e $-\vec u$, onde $u_0 = \text{const} > 0$.

(a) Sabendo que as densidades numéricas de tais partículas são, respectivamente, $n_+ = n$ e $n_-$, constantes, determine a relação entre elas para que o plasma do interior da lâmpada seja neutro, ponto a ponto. (b) Determine o vetor densidade de corrente elétrica resultante $\vec j$ dentro da lâmpada. (c) Considerando que a corrente elétrica estabelecida na lâmpada está relacionada a uma diferença de potencial $V_0$ mantida entre as suas extremidades, determine a resistividade elétrica $\rho$ do plasma. Assuma que o campo elétrico no interior da lâmpada é uniforme e constante. (d) Suponha, agora, que tal lâmpada seja imersa em uma região onde existe um campo magnético $\vec B = B_x\hat x + B_y\hat y$, onde $B_x$, $B_y$ são constantes. Obtenha a força magnética $\vec F_\text{m}$ que atua na lâmpada.`,
      figura: [
        { pagina: 4, recorte: [0.515, 0.19, 0.905, 0.295] },
        { pagina: 4, recorte: [0.53, 0.32, 0.895, 0.51] },
        { pagina: 4, recorte: [0.515, 0.525, 0.905, 0.855] },
      ],
      cena: {
        escala: 0.01,
        extensao: 9,
        unidade: 'cm',
        camera: { pos: [16, 9, 11], alvo: [0, 0, 0] },
        tempo: { escala: 1, unidade: 's', passo: 0.01 },
      },
      parametros: [
        { id: 'V0', rotulo: 'ddp', simbolo: 'V_0', valor: 100, unidade: 'V', min: 20, max: 300, passo: 10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.14, unidade: 'm', min: 0.14, max: 0.14 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.015, max: 0.03, passo: 0.001 },
        { id: 'nn', rotulo: 'Densidade de cátions', simbolo: 'n', valor: 1e20, unidade: 'm⁻³', min: 1e19, max: 1e21, passo: 1e19 },
        { id: 'u0', rotulo: 'Velocidade', simbolo: 'u_0', valor: 0.02, unidade: 'm/s', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'Bx', rotulo: 'Componente x de B', simbolo: 'B_x', valor: 0.5, unidade: 'T', min: -1, max: 1, passo: 0.05 },
        { id: 'By', rotulo: 'Componente y de B', simbolo: 'B_y', valor: 0.3, unidade: 'T', min: -1, max: 1, passo: 0.05 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: [0, 0, 'V0/L'] },
        { id: 'Bu', tipo: 'campoB', valor: ['Bx', 'By', 0], rotulo: 'B' },
        { id: 'tubo', tipo: 'condutor', a: [0, 0, '-L/2'], b: [0, 0, 'L/2'], raio: 'a', I: `${jj}*pi*a^2` },
        { id: 'eixo', tipo: 'fio', I: `${jj}*pi*a^2`, a: [0, 0, '-L/2'], b: [0, 0, 'L/2'] },
        portador('p1', '2*qe', 'u0', -0.04, 0.01),
        portador('p2', '2*qe', 'u0', 0.02, -0.008),
        portador('e1', '0-qe', '0-u0', 0.03, 0.006),
        portador('e2', '0-qe', '0-u0', -0.01, -0.01),
        portador('e3', '0-qe', '0-u0', 0.05, -0.004),
        portador('e4', '0-qe', '0-u0', -0.05, 0.002),
        { id: 'F', tipo: 'seta', papel: 'forca', origem: [0, 0, 0], vetor: "forca('eixo','Bu')", comprimento: '4*cm', rotulo: 'F' },
      ],
      visual: { setasB: true, densidade: 5, fontes: ['Bu'] },
      medidas: [
        { rotulo: 'Carga por volume', simbolo: r`\rho_c = 2en_+ - en_-`, expr: '2*qe*nn - qe*2*nn', unidade: 'C/m³', teoria: 0 },
        { rotulo: 'Densidade de elétrons', simbolo: 'n_-', expr: '2*nn', unidade: 'm⁻³' },
        { rotulo: 'J dos cátions', simbolo: 'j_+', expr: '(2*qe)*nn*u0', unidade: 'A/m²', teoria: '2*qe*nn*u0' },
        { rotulo: 'J dos elétrons', simbolo: 'j_-', expr: '(0-qe)*(2*nn)*(0-u0)', unidade: 'A/m²', teoria: '2*qe*nn*u0' },
        { rotulo: 'Campo', simbolo: 'E', expr: 'z(E(0, 0, 0))', unidade: 'V/m', teoria: 'V0/L' },
        { rotulo: 'Resistividade', simbolo: r`\rho`, expr: `z(E(0, 0, 0))/${jj}`, unidade: 'Ω·m', teoria: 'V0/(4*qe*nn*u0*L)' },
        { rotulo: 'Força em x', simbolo: 'F_x', expr: "x(forca('eixo','Bu'))", unidade: 'N', teoria: '-4*pi*qe*nn*u0*L*a^2*By' },
        { rotulo: 'Força em y', simbolo: 'F_y', expr: "y(forca('eixo','Bu'))", unidade: 'N', teoria: '4*pi*qe*nn*u0*L*a^2*Bx' },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Neutralidade',
          texto: r`Ponto a ponto, a carga por volume tem de se anular:

$$0 = 2en_+ - en_- \quad\Rightarrow\quad n_- = 2n_+ = 2n.$$`,
          medidas: [0, 1],
        },
        {
          item: 'b',
          titulo: '(b) Densidade de corrente',
          previsao: { pergunta: 'Cátions e elétrons andam em sentidos opostos. Suas correntes…', opcoes: ['se somam', 'se subtraem'], correta: 0 },
          texto: r`$$\vec j = q_+n_+\vec u + q_-n_-(-\vec u) = (2e)n\vec u + (-e)(2n)(-\vec u) = 4en\vec u = 4enu_0\,\hat z.$$

Cada espécie contribui com metade.`,
          medidas: [2, 3],
        },
        {
          item: 'c',
          titulo: '(c) Resistividade',
          texto: r`Com campo uniforme, $E = V_0/L$. De $\vec E = \rho\vec j$:

$$\rho = \frac{V_0}{jL} = \frac{V_0}{4enu_0L}.$$

Aqui $\rho$ é a resistividade. Nos itens anteriores, a letra foi usada para a densidade de carga.`,
          medidas: [4, 5],
        },
        {
          item: 'd',
          titulo: '(d) Força magnética',
          texto: r`A corrente é $I = j\pi a^2$, e $\vec L = L\hat z$:

$$\vec F_\text{m} = I\vec L\times\vec B = j\pi a^2L\,\hat z\times(B_x\hat x + B_y\hat y) = j\pi a^2L\,(B_x\hat y - B_y\hat x).$$

Com o resultado de (b):

$$\vec F_\text{m} = 4\pi enu_0La^2\,(-B_y\hat x + B_x\hat y).$$

A força é perpendicular a $\vec B$. Mude $B_x$ e $B_y$ para ver a seta girar.`,
          medidas: [6, 7],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Densidade de corrente' },
          { texto: 'Lei de Ohm local', lab: 'circuitos' },
          { texto: 'Força sobre corrente', lab: 'ampere' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$n_- = 2n_+$.`, passo: 0 },
          { titulo: '(b)', texto: r`$\vec j = 4enu_0\hat z$.`, passo: 1 },
          { titulo: '(c)', texto: r`$\rho = V_0/(4enu_0L)$.`, passo: 2 },
          { titulo: '(d)', texto: r`$\vec F_\text{m} = 4\pi enu_0La^2(-B_y\hat x + B_x\hat y)$.`, passo: 3 },
        ],
        resultado: r`$n_- = 2n$; $\vec j = 4enu_0\hat z$; $\rho = \dfrac{V_0}{4enu_0L}$; $\vec F_\text{m} = 4\pi enu_0La^2(-B_y\hat x + B_x\hat y)$.`,
        errosComuns: [
          r`Subtrair as contribuições: os elétrons têm carga e velocidade com sinais opostos.`,
          r`Esquecer que a área é $\pi a^2$ ao passar de $j$ para $I$.`,
          r`Trocar a ordem do produto vetorial: $\hat z\times\hat x = \hat y$.`,
        ],
        oficial: { resposta: r`$n_- = 2n$; $\vec j = 4enu_0\hat z$; $\rho = \dfrac{V_0}{4enu_0L}$; $\vec F_\text{m} = 4\pi enu_0La^2(-B_y\hat x + B_x\hat y)$.` },
      },
      respostas: [
        { item: 'a', texto: r`$n_- = 2n_+ = 2n$`, pontos: 0.7, criterio: 'Neutralidade ponto a ponto.' },
        { item: 'b', texto: r`$\vec j = 4enu_0\hat z$`, pontos: 0.8, criterio: 'Soma das duas espécies, com sinais.' },
        { item: 'c', texto: r`$\rho = \dfrac{V_0}{4enu_0L}$`, pontos: 1, criterio: r`$E = V_0/L$ e $E = \rho j$, ou $V = RI$.` },
        { item: 'd', texto: r`$\vec F_\text{m} = 4\pi enu_0La^2(-B_y\hat x + B_x\hat y)$`, pontos: 1.5, criterio: 'Corrente, produto vetorial e substituição de j.' },
      ],
    },
  ],
}

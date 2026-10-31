import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: portadores como traçadores (massa de 1 kg), para mostrar só a deriva. */
const portador = (id: string, q: string, v: string, x: number, y: number): ObjetoInput => ({
  id,
  tipo: 'particula',
  q,
  m: 1,
  pos: [x, y, 0],
  v: [v, 0, 0],
  rastro: 0.4,
})

/* Objetiva 3 e 5: arcos em cordas. */
const noArco = (raio: string, graus: number): [string, string, number] => {
  const a = (graus * Math.PI) / 180
  return [`${raio}*${Math.cos(a)}`, `${raio}*${Math.sin(a)}`, 0]
}
const arcoFio = (pre: string, raio: string, I: string, de: number, ate: number, n = 24): ObjetoInput[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${pre}${i}`,
    tipo: 'fio' as const,
    I,
    a: noArco(raio, de + ((ate - de) * i) / n),
    b: noArco(raio, de + ((ate - de) * (i + 1)) / n),
  }))
const circuito = [...arcoFio('p', 'b', 'I2', 180, 360), ...arcoFio('q', 'a', 'I2', 0, 180)]
const Farcos = circuito.map((o) => `z(forca('${o.id}','fw'))`).join(' + ')

/*
 * Objetiva 5: as cordas ficam num raio um pouco maior, R·tan(δ/2)/(δ/2), para o
 * polígono de 24 lados dar exatamente o campo do arco no centro.
 */
const delta = ((Math.PI / 2) / 24) / 2
const quarto = arcoFio('c', `R*${Math.tan(delta) / delta}`, 'I1', 90, 180)
const Bquarto = quarto.map((o) => `z(Bde('${o.id}', 0, 0, 0))`).join(' + ')

/* Objetiva 4 */
const TT = '(t + t0)'
const BT = `B0*(${TT}/tau)^2*exp(-${TT}^2/tau^2)`
const femT = `-2*B0*L^2*${TT}/tau^2*(1 - ${TT}^2/tau^2)*exp(-${TT}^2/tau^2)`

/* Discursiva: corrente envolvida. */
const Ic = (u: string, v = `(${u})`) => `pi*j0*min(${v}, R)^2 + 2*pi*R*j1*(min(max(${v}, 2*R), 3*R) - 2*R)`

/**
 * P3 de Física III, 2024/2, diurno, versão C (02/12/2024). Conferida com o
 * gabarito oficial: objetivas 1f, 2a, 3b, 4g, 5e, 6h, e a discursiva, onde o
 * gabarito traz B₃ = μ₀Rj₀/8 por erro de digitação (ver `oficial.observacao`).
 * O rodapé impresso diz 2024/1; o cabeçalho e o gabarito dizem 2024/2.
 */
export const p3_2024_2_diurno: ProvaInput = {
  id: 'p3-2024-2-diurno',
  titulo: 'P3 · 2024/2 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão C · 02/12/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Resistividade de um gás ionizado',
      resumo: 'Elétrons e íons de carga 2e levam corrente no mesmo sentido.',
      enunciado: r`Uma diferença de potencial $V_0$ é aplicada nas extremidades de um tubo cilíndrico de comprimento $L$ e raio $a$ que contém em seu interior um gás, inicialmente neutro e de densidade volumar $n$. Devido a um processo externo de ionização é produzida uma corrente elétrica cujos portadores de carga são elétrons e íons positivos. Sabe-se que os elétrons têm carga $q_- = -e$ e se movimentam com velocidade de arraste $\vec v_- = -10u_0\hat x$, enquanto os íons têm carga $q_+ = 2e$ e se movimentam com velocidade $\vec v_+ = u_0\hat x$, sendo $u_0$ uma constante positiva. Nestas condições, pode-se mostrar que a resistividade elétrica $\rho$ apresentada pelo plasma será dada por:`,
      figura: { pagina: 1, recorte: [0.515, 0.2, 0.905, 0.635] },
      cena: {
        escala: 0.01,
        extensao: 9,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, 2, 19], alvo: [0, 0, 0] },
        tempo: { escala: 1, unidade: 's', passo: 0.01 },
      },
      parametros: [
        { id: 'V0', rotulo: 'ddp', simbolo: 'V_0', valor: 100, unidade: 'V', min: 20, max: 300, passo: 10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.14, unidade: 'm', min: 0.14, max: 0.14 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.015, max: 0.03, passo: 0.001 },
        { id: 'nn', rotulo: 'Densidade do gás', simbolo: 'n', valor: 1e16, unidade: 'm⁻³', min: 1e15, max: 1e17, passo: 1e15 },
        { id: 'u0', rotulo: 'Velocidade dos íons', simbolo: 'u_0', valor: 0.005, unidade: 'm/s', min: 0.002, max: 0.008, passo: 0.001 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: ['V0/L', 0, 0] },
        { id: 'tubo', tipo: 'condutor', a: ['-L/2', 0, 0], b: ['L/2', 0, 0], raio: 'a', I: '22*nn*qe*u0*pi*a^2' },
        portador('e1', '0-qe', '-10*u0', 0.06, 0.008),
        portador('e2', '0-qe', '-10*u0', 0.01, 0.002),
        portador('e3', '0-qe', '-10*u0', -0.04, -0.008),
        portador('e4', '0-qe', '-10*u0', 0.035, -0.003),
        portador('i1', '2*qe', 'u0', -0.05, 0.005),
        portador('i2', '2*qe', 'u0', 0.02, -0.006),
      ],
      visual: { setasE: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Densidade de elétrons', simbolo: 'n_-', expr: '2*nn', unidade: 'm⁻³' },
        { rotulo: 'J dos elétrons', simbolo: 'J_-', expr: '2*nn*(0-qe)*(-10*u0)', unidade: 'A/m²', teoria: '20*nn*qe*u0' },
        { rotulo: 'J dos íons', simbolo: 'J_+', expr: 'nn*(2*qe)*u0', unidade: 'A/m²', teoria: '2*nn*qe*u0' },
        { rotulo: 'J total', simbolo: 'J', expr: '2*nn*(0-qe)*(-10*u0) + nn*(2*qe)*u0', unidade: 'A/m²', teoria: '22*nn*qe*u0' },
        { rotulo: 'Campo no tubo', simbolo: 'E', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: 'V0/L' },
        { rotulo: 'Resistividade', simbolo: r`\rho = E/J`, expr: 'x(E(0, 0, 0))/(22*nn*qe*u0)', unidade: 'Ω·m', teoria: 'V0/(22*nn*qe*L*u0)' },
      ],
      passos: [
        {
          titulo: 'Neutralidade: quantos elétrons?',
          texto: r`O gás era neutro, com densidade $n$. Cada átomo vira um íon de carga $2e$ e libera **dois** elétrons:

$$n_+ = n, \qquad n_- = 2n.$$

Rode a simulação: os elétrons são rápidos e vão para a esquerda; os íons, lentos, para a direita.`,
          medidas: [0],
        },
        {
          titulo: 'Densidade de corrente',
          previsao: { pergunta: 'Elétrons e íons andam em sentidos opostos. As correntes deles…', opcoes: ['se somam', 'se subtraem'], correta: 0 },
          texto: r`Cada espécie contribui com $n_iq_i\vec v_i$. Carga negativa andando para a esquerda é corrente para a direita:

$$\vec J = 2n(-e)(-10u_0\hat x) + n(2e)(u_0\hat x) = 22\,neu_0\,\hat x.$$

Os elétrons carregam quase toda a corrente.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Resistividade',
          texto: r`O campo no tubo é $E = V_0/L$, e $\vec E = \rho\vec J$:

$$\rho = \frac EJ = \frac{V_0}{22\,neLu_0}.$$

Note que $a$ não entra: a resistividade é propriedade do meio. Alternativa **(f)**.`,
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Densidade de corrente' },
          { texto: 'Lei de Ohm local', lab: 'circuitos' },
        ],
        etapas: [
          { titulo: 'Densidades', texto: r`Neutralidade: $n_+ = n$ e $n_- = 2n$.`, passo: 0 },
          { titulo: 'J', texto: r`$\vec J = \sum n_iq_i\vec v_i = (20 + 2)\,neu_0\,\hat x$.`, passo: 1 },
          { titulo: 'ρ', texto: r`$\rho = E/J = V_0/(22\,neLu_0)$.`, passo: 2 },
        ],
        resultado: r`$\rho = \dfrac{V_0}{22\,neLu_0}$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar $n$ para os elétrons também: cada íon de carga $2e$ libera dois elétrons.`,
          r`Subtrair as correntes por as velocidades serem opostas: as cargas também são.`,
          r`Pôr $a$ na resposta: $\rho$ não depende da geometria.`,
        ],
        oficial: { resposta: '(f)', observacao: r`O enunciado chama $n$ a densidade do gás. Com $n$ valendo para cada espécie, sairia $12\,neu_0$, que não está entre as alternativas.` },
      },
      alternativas: [
        { letra: 'a', texto: r`$\rho = \dfrac{V_0}{18\,neLu_0}$`, porque: r`O fator é $20 + 2$, não 18.` },
        { letra: 'b', texto: r`$\rho = \dfrac{\pi aV_0}{20\,neL^2u_0}$`, porque: r`$\rho$ não depende de $a$, e faltam os íons.` },
        { letra: 'c', texto: r`$\rho = \dfrac{LV_0}{16\pi a^2neu_0}$`, porque: r`Confunde resistividade com algo proporcional à resistência.` },
        { letra: 'd', texto: r`$\rho = \dfrac{2\pi LV_0}{11\,nea^2u_0}$`, porque: r`$\rho$ não depende de $a$, e $L$ fica no denominador.` },
        { letra: 'e', texto: r`$\rho = \dfrac{3\pi aV_0}{20\,neL^2u_0}$`, porque: r`$\rho$ não depende de $a$.` },
        { letra: 'f', texto: r`$\rho = \dfrac{V_0}{22\,neLu_0}$`, correta: true, porque: r`Correta: $E = V_0/L$ e $J = 22\,neu_0$.` },
        { letra: 'g', texto: r`$\rho = \dfrac{\pi V_0}{16\,neLu_0}$`, porque: r`Não há $\pi$: nem $E$ nem $J$ envolvem a seção.` },
        { letra: 'h', texto: r`$\rho = \dfrac{4\pi LV_0}{11\,nea^2u_0}$`, porque: r`$\rho$ não depende de $a$, e $L$ fica no denominador.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Esfera com ρ que cai até a borda',
      resumo: 'Gauss com ρ = ρ₀(1 − r/R).',
      enunciado: r`Considere uma esfera maciça de raio $R$, carregada com uma densidade volumar de carga dada por $\rho(r) = \rho_0(1 - r/R)$, onde $\rho_0$ é uma constante positiva e $r$ é a distância radial ao centro da esfera. Determine o campo elétrico no interior da esfera.`,
      figura: [
        { pagina: 2, recorte: [0.105, 0.125, 0.5, 0.21] },
        { pagina: 2, recorte: [0.27, 0.235, 0.46, 0.48] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [5, 6, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'rho0', rotulo: 'Densidade no centro', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 3e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.06, unidade: 'm', min: 0.04, max: 0.07, passo: 0.002 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.04, unidade: 'm', min: 0.005, max: 0.08, passo: 0.001 },
      ],
      objetos: [
        { id: 'esf', tipo: 'esfera', centro: [0, 0, 0], raio: 'R', rho: 'rho0*(1 - r/R)', rotulo: 'ρ(r)' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: '4*pi*rho0*(min(rg, R)^3/3 - min(rg, R)^4/(4*R))' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, expr: "fluxo('G')", unidade: 'V·m', teoria: '4*pi*rho0*(min(rg, R)^3/3 - min(rg, R)^4/(4*R))/eps0' },
        { rotulo: 'Campo em r', simbolo: 'E(r)', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: 'rg < R ? rho0*rg/eps0*(1/3 - rg/(4*R)) : rho0*R^3/(12*eps0*rg^2)' },
        { rotulo: 'Campo máximo, em r = 2R/3', simbolo: r`E_\text{max}`, expr: 'x(E(2*R/3, 0, 0))', unidade: 'V/m', teoria: 'rho0*R/(9*eps0)' },
        { rotulo: 'Carga total', simbolo: 'Q', expr: "carga('esf')", unidade: 'C', teoria: 'pi*rho0*R^3/3' },
      ],
      graficos: [
        {
          titulo: 'E(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0.001, ate: '1.5*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'x(E(rr, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: 'rr < R ? rho0*rr/eps0*(1/3 - rr/(4*R)) : rho0*R^3/(12*eps0*rr^2)', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Carga envolvida',
          previsao: { pergunta: 'Para achar a carga dentro de r, basta multiplicar ρ pelo volume?', opcoes: ['Sim', 'Não: ρ varia, é preciso integrar'], correta: 1 },
          texto: r`A simetria é esférica, mas $\rho$ muda com $r$. Somando cascas:

$$Q_\text{int}(r) = \int_0^r\rho_0\left(1 - \frac{r'}{R}\right)4\pi r'^2dr' = 4\pi\rho_0\left(\frac{r^3}{3} - \frac{r^4}{4R}\right).$$`,
          medidas: [0],
        },
        {
          titulo: 'Lei de Gauss',
          texto: r`$$4\pi r^2E = \frac{Q_\text{int}}{\varepsilon_0} \quad\Rightarrow\quad \vec E = \frac{\rho_0r}{\varepsilon_0}\left(\frac13 - \frac{r}{4R}\right)\hat r.$$

Alternativa **(a)**. Mude o raio da gaussiana: fluxo, carga e campo andam juntos.`,
          medidas: [1, 2],
        },
        {
          titulo: 'O formato da curva',
          texto: r`O campo cresce, chega ao máximo em $r = 2R/3$ e cai até $\rho_0R/12\varepsilon_0$ na borda. Numa esfera uniforme, ele subiria em reta até a borda; aqui, a carga está concentrada perto do centro.`,
          parametros: { rg: 0.04 },
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' }],
        etapas: [
          { titulo: 'Carga', texto: r`$Q_\text{int} = 4\pi\rho_0(r^3/3 - r^4/4R)$.`, passo: 0 },
          { titulo: 'Campo', texto: r`$\vec E = Q_\text{int}/(4\pi\varepsilon_0r^2)\,\hat r = \dfrac{\rho_0r}{\varepsilon_0}\left(\dfrac13 - \dfrac{r}{4R}\right)\hat r$.`, passo: 1 },
        ],
        resultado: r`$\vec E = \dfrac{\rho_0r}{\varepsilon_0}\left(\dfrac13 - \dfrac{r}{4R}\right)\hat r$: alternativa **(a)**.`,
        errosComuns: [
          r`Multiplicar $\rho(r)$ pelo volume: a densidade não é uniforme.`,
          r`Esquecer o $r'^2$ do elemento de volume na integral.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\rho_0r}{\epsilon_0}\left(\dfrac13 - \dfrac{r}{4R}\right)\hat r$`, correta: true, porque: r`Correta: é $Q_\text{int}/(4\pi\varepsilon_0r^2)$.` },
        { letra: 'b', texto: r`$\dfrac{\rho_0r^2}{4\epsilon_0R}\hat r$`, porque: r`É só o segundo termo, e sem o sinal.` },
        { letra: 'c', texto: r`$\dfrac{\rho_0r}{\epsilon_0}\left(\dfrac12 - \dfrac{r}{4R}\right)\hat r$`, porque: r`O primeiro termo tem 1/3, de $\int r'^2dr'$.` },
        { letra: 'd', texto: r`$\dfrac{\rho_0r}{\epsilon_0}\left(\dfrac13 + \dfrac Rr\right)\hat r$`, porque: r`Não dá zero em $r = 0$, onde o campo tem de se anular.` },
        { letra: 'e', texto: r`$\dfrac{\rho_0r}{\epsilon_0}\left(\dfrac13 - \dfrac Rr\right)\hat r$`, porque: r`Não dá zero em $r = 0$.` },
        { letra: 'f', texto: r`$\dfrac{\rho_0r}{\epsilon_0}\left(1 - \dfrac{r}{4R}\right)\hat r$`, porque: r`O primeiro termo tem 1/3.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Circuito em volta de um fio',
      resumo: 'Arcos e segmentos radiais: a força resultante.',
      enunciado: r`Considere um fio infinito, por onde passa uma corrente estacionária $I_1$, e um circuito fechado, no plano perpendicular ao fio, formado por dois arcos de raios $a$ e $b$ com centro no fio e dois segmentos de reta radiais, por onde passa uma corrente estacionária $I_2$. Calcule a força magnética $\vec F_m$ sobre o circuito devido ao fio.`,
      figura: [
        { pagina: 2, recorte: [0.105, 0.55, 0.5, 0.655] },
        { pagina: 2, recorte: [0.3, 0.655, 0.47, 0.86] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [7, -11, 11], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I1', rotulo: 'Corrente no fio', simbolo: 'I_1', valor: 20, unidade: 'A', min: 5, max: 40, passo: 1 },
        { id: 'I2', rotulo: 'Corrente no circuito', simbolo: 'I_2', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio menor', simbolo: 'a', valor: 0.025, unidade: 'm', min: 0.015, max: 0.04, passo: 0.001 },
        { id: 'b', rotulo: 'Raio maior', simbolo: 'b', valor: 0.055, unidade: 'm', min: 0.045, max: 0.07, passo: 0.001 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: 'I1', ponto: [0, 0, 0], direcao: 'z', rotulo: 'I₁' },
        ...circuito,
        { id: 'dir', tipo: 'fio', I: 'I2', a: ['b', 0, 0], b: ['a', 0, 0] },
        { id: 'esq', tipo: 'fio', I: 'I2', a: ['0-a', 0, 0], b: ['0-b', 0, 0] },
        { id: 'Fe', tipo: 'seta', papel: 'forca', origem: ['-(a + b)/2', 0, 0], vetor: "forca('esq','fw')", comprimento: '3*cm', rotulo: 'F esq' },
        { id: 'Fd', tipo: 'seta', papel: 'forca', origem: ['(a + b)/2', 0, 0], vetor: "forca('dir','fw')", comprimento: '3*cm', rotulo: 'F dir' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy', fontes: ['fw'] },
      medidas: [
        { rotulo: 'Força nos arcos (soma)', simbolo: r`F_\text{arcos}`, expr: Farcos, unidade: 'N', teoria: 0 },
        { rotulo: 'Força no segmento esquerdo', simbolo: 'F_{esq}', expr: "z(forca('esq','fw'))", unidade: 'N', teoria: 'mu0*I1*I2/(2*pi)*ln(b/a)' },
        { rotulo: 'Força no segmento direito', simbolo: 'F_{dir}', expr: "z(forca('dir','fw'))", unidade: 'N', teoria: '-mu0*I1*I2/(2*pi)*ln(b/a)' },
        { rotulo: 'Força resultante', simbolo: 'F_z', expr: `${Farcos} + z(forca('esq','fw')) + z(forca('dir','fw'))`, unidade: 'N', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Nos arcos, nada',
          previsao: { pergunta: 'Qual a força nos arcos?', opcoes: ['radial', 'axial', 'nula'], correta: 2 },
          texto: r`O campo do fio é azimutal: $\vec B = \dfrac{\mu_0I_1}{2\pi s}\hat\varphi$. Nos arcos, a corrente também é azimutal, e $d\vec\ell\parallel\vec B$:

$$d\vec F = I_2\,d\vec\ell\times\vec B = \vec 0.$$`,
          medidas: [0],
        },
        {
          titulo: 'Nos segmentos radiais',
          texto: r`Aqui $d\vec\ell = \pm ds\,\hat s$, e $\hat s\times\hat\varphi = \hat z$. No segmento em que a corrente sai:

$$\vec F = \int_a^b\frac{\mu_0I_1I_2}{2\pi s}\,ds\;\hat z = \frac{\mu_0I_1I_2}{2\pi}\ln\frac ba\,\hat z.$$

No segmento em que a corrente entra, o mesmo módulo, em $-\hat z$.`,
          destacar: ['esq', 'dir', 'Fe', 'Fd'],
          medidas: [1, 2],
        },
        {
          titulo: 'Soma',
          texto: r`As duas forças têm mesmo módulo e sentidos opostos: $\vec F_m = \vec 0$. Alternativa **(b)**.

Elas têm linhas de ação diferentes, então há **torque**: o circuito tende a girar em torno do diâmetro, embora o centro de massa fique parado.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um fio longo', lab: 'ampere' },
          { texto: 'Força sobre corrente', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'Arcos', texto: r`$d\vec\ell\parallel\hat\varphi\parallel\vec B$: força nula.`, passo: 0 },
          { titulo: 'Radiais', texto: r`$\pm\dfrac{\mu_0I_1I_2}{2\pi}\ln(b/a)\,\hat z$, um em cada sentido.`, passo: 1 },
          { titulo: 'Total', texto: r`$\vec F_m = \vec 0$.`, passo: 2 },
        ],
        resultado: r`$\vec F_m = \vec 0$: alternativa **(b)**.`,
        errosComuns: [
          r`Achar a força radial, como em dois fios paralelos: aqui o circuito está no plano perpendicular ao fio.`,
          r`Somar os dois segmentos: as correntes neles têm sentidos radiais opostos.`,
          r`Concluir que também não há torque.`,
        ],
        oficial: { resposta: '(b)', observacao: r`A prova imprime (c) e (e) iguais.` },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left[\dfrac{\mu_0I_1I_2}{\pi}\right]\ln\left[\dfrac ba\right]\hat z$`, porque: r`Soma os dois segmentos, como se as forças tivessem o mesmo sentido.` },
        { letra: 'b', texto: r`$\vec 0$`, correta: true, porque: r`Correta: os arcos não sentem força, e as dos segmentos se cancelam.` },
        { letra: 'c', texto: r`$\left[\dfrac{\mu_0I_1I_2}{2\pi}\right]\ln\left[\dfrac ab\right]\hat\varphi$`, porque: r`A força é perpendicular a $\vec B$, que é azimutal.` },
        { letra: 'd', texto: r`$\left[\dfrac{\mu_0I_1I_2}{2\pi}\right]\ln\left[\dfrac ab\right]\hat z$`, porque: r`É a força em um só segmento.` },
        { letra: 'e', texto: r`$\left[\dfrac{\mu_0I_1I_2}{2\pi}\right]\ln\left[\dfrac ab\right]\hat\varphi$`, porque: r`Igual à (c): a força não pode ser azimutal.` },
        { letra: 'f', texto: r`$\left[\dfrac{2\mu_0I_1I_2}{\pi}\right]\ln\left[\dfrac ab\right]\hat\varphi$`, porque: r`A força não pode ser azimutal.` },
        { letra: 'g', texto: r`$\left[\dfrac{4\mu_0I_1I_2}{\pi}\right]\ln\left[\dfrac ab\right]\hat z$`, porque: r`Os segmentos se cancelam.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Espira livre num B uniforme que sobe e desce',
      resumo: 'Seis afirmações sobre corrente, força e momento.',
      enunciado: r`Uma espira quadrada rígida de lado $L$ e resistência $R$ se encontra em repouso no plano $xy$ e pode se movimentar livremente. A partir de $t = 0$, passa a atuar nessa região um campo magnético uniforme e não estacionário dado por $\vec B = B_0(t/\tau)^2e^{-t^2/\tau^2}\hat z$, onde $B_0$ e $\tau$ são constantes positivas. Assumindo que a autoindutância da espira é desprezível, então, dentre as afirmações: (A) A corrente induzida na espira terá o sentido anti-horário quando $t < \tau$ e horário para $t > \tau$. (B) A força magnética resultante na espira será nula apenas nos instantes $t = 0$, $t = \tau$ e $t \to \infty$. (C) A força eletromotriz induzida terá sempre o mesmo sentido para qualquer instante. (D) O sentido do movimento da espira vai depender do intervalo de tempo envolvido. (E) A potência instantânea dissipada na espira nunca será nula. (F) O momento de dipolo magnético da espira terá o sentido de $\hat z$. Podemos afirmar que:`,
      figura: { pagina: 2, recorte: [0.51, 0.13, 0.905, 0.65] },
      cena: {
        escala: 0.01,
        extensao: 6,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, -3, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.3, unidade: 's', passo: 1e-4, duracao: 3 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Escala do campo', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'tau', rotulo: 'Tempo característico', simbolo: r`\tau`, valor: 1, unidade: 's', min: 1, max: 1 },
        { id: 'L', rotulo: 'Lado', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.01, unidade: 'Ω', min: 0.005, max: 0.05, passo: 0.005 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0.5, unidade: 's', min: 0, max: 3, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, BT], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', largura: 'L', altura: 'L', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: BT },
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `L^2*${BT}` },
        { rotulo: 'fem (positiva: anti-horária)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: femT },
        { rotulo: 'Corrente (positiva: anti-horária)', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: `(${femT})/Rr` },
        { rotulo: 'Potência dissipada', simbolo: 'P', expr: "Rr*Iind('S')^2", unidade: 'W' },
        { rotulo: 'Força em cada lado (módulo)', simbolo: 'ILB', expr: "abs(Iind('S'))*L*abs(z(B(0, 0, 0)))", unidade: 'N' },
        { rotulo: 'Momento de dipolo em z', simbolo: r`\mu_z`, expr: "Iind('S')*L^2", unidade: 'A·m²' },
      ],
      graficos: [
        {
          titulo: 'B(t) e fem(t) ao longo do tempo',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 3, rotulo: 't', unidade: 's' },
          series: [
            { rotulo: 'B (T)', expr: 'B0*(tt/tau)^2*exp(-tt^2/tau^2)', unidade: 'T' },
            { rotulo: 'fem (mV × 10)', expr: '1e4*(-2*B0*L^2*tt/tau^2*(1 - tt^2/tau^2)*exp(-tt^2/tau^2))', unidade: '' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'O campo sobe e desce',
          texto: r`$B$ parte de zero, chega ao máximo em $t = \tau$ e volta a zero. Derivando o fluxo $\Phi = L^2B$:

$$\mathcal E = -\frac{d\Phi}{dt} = -\frac{2B_0L^2t}{\tau^2}\left(1 - \frac{t^2}{\tau^2}\right)e^{-t^2/\tau^2}.$$`,
          parametros: { t0: 0.5 },
          medidas: [0, 1, 2],
        },
        {
          titulo: '(A) e (C): o sentido',
          previsao: { pergunta: 'Com t < τ, o fluxo para +ẑ aumenta. A corrente é…', opcoes: ['horária', 'anti-horária'], correta: 0 },
          texto: r`Para $t < \tau$ o fluxo cresce, e a corrente tenta criar campo para $-\hat z$: é **horária**, ao contrário do que (A) diz. Para $t > \tau$, anti-horária.

A fem troca de sinal em $t = \tau$: (C) também é falsa.`,
          parametros: { t0: 0.5 },
          medidas: [2, 3],
        },
        {
          titulo: '(B) e (D): a força',
          texto: r`Em campo **uniforme**, a força em lados opostos se cancela sempre: $\vec F = I\oint d\vec\ell\times\vec B = I\left(\oint d\vec\ell\right)\times\vec B = \vec 0$.

Vale em todo instante, não só nos três citados: (B) é falsa. A espira não se move, e (D) também é falsa.`,
          parametros: { t0: 1.5 },
          medidas: [5],
        },
        {
          titulo: '(E) e (F): potência e dipolo',
          texto: r`Em $t = 0$ e $t = \tau$ a corrente é nula, e a potência também: (E) é falsa. Veja em $t_0 = \tau$: a corrente zera mesmo com $B$ máximo.

O momento $\vec\mu$ segue a corrente: aponta para $-\hat z$ antes de $\tau$ e para $+\hat z$ depois. (F) é falsa.`,
          parametros: { t0: 1 },
          medidas: [3, 4, 6],
        },
        {
          titulo: 'Resposta',
          texto: r`Todas estão erradas: alternativa **(g)**.`,
          parametros: { t0: 1.5 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday e de Lenz', lab: 'faraday' },
          { texto: 'Força sobre corrente em campo uniforme', lab: 'ampere' },
        ],
        etapas: [
          { titulo: 'fem', texto: r`$\mathcal E \propto -t(1 - t^2/\tau^2)e^{-t^2/\tau^2}$: negativa antes de $\tau$, positiva depois.`, passo: 0 },
          { titulo: 'Sentidos', texto: r`Horária antes de $\tau$ e anti-horária depois: (A) e (C) são falsas.`, passo: 1 },
          { titulo: 'Força', texto: r`$\oint d\vec\ell = \vec 0$ em campo uniforme: (B) e (D) são falsas.`, passo: 2 },
          { titulo: 'Potência e dipolo', texto: r`$P = 0$ em $t = 0$ e $t = \tau$; $\vec\mu$ inverte em $\tau$: (E) e (F) são falsas.`, passo: 3 },
        ],
        resultado: r`Todas estão erradas: alternativa **(g)**.`,
        errosComuns: [
          r`Confundir o sinal de $\vec B$ com o de $d\vec B/dt$: a corrente responde à variação.`,
          r`Achar que a força é nula só quando a corrente é nula: em campo uniforme ela é nula sempre.`,
        ],
        oficial: { resposta: '(g)' },
      },
      alternativas: [
        { letra: 'a', texto: 'apenas a (A) é correta.', porque: r`Inverte o sentido: para $t < \tau$ a corrente é horária.` },
        { letra: 'b', texto: 'apenas a (A) e (C) são corretas.', porque: r`As duas são falsas.` },
        { letra: 'c', texto: 'apenas a (B) e (D) são corretas.', porque: r`A força resultante é sempre nula, e a espira não se move.` },
        { letra: 'd', texto: 'apenas a (C), (E) e (F) são corretas.', porque: r`As três são falsas.` },
        { letra: 'e', texto: 'todas estão certas.', porque: r`Todas são falsas.` },
        { letra: 'f', texto: 'apenas a (B), (E) e (F) são corretas.', porque: r`As três são falsas.` },
        { letra: 'g', texto: 'todas estão erradas.', correta: true, porque: r`Correta.` },
        { letra: 'h', texto: 'apenas a (C) está errada.', porque: r`As outras cinco também estão erradas.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Anular B no centro com duas dobras',
      resumo: 'Fio com arco e fio com quina: a razão entre as correntes.',
      enunciado: r`Dois fios condutores muito longos que possuem dobras ortogonais e trechos retilíneos paralelos são percorridos por correntes elétricas de intensidades constantes $I_1$ e $I_2$. Em um dos fios a dobra é suavizada por um arco de círculo de raio $R$, enquanto que no outro a dobra é abrupta (vide a figura). Nestas condições, o campo magnético $\vec B$ produzido pelas duas correntes elétricas no centro $\mathcal C$ do círculo será nulo quando a relação entre as duas correntes for:`,
      figura: [
        { pagina: 3, recorte: [0.105, 0.145, 0.5, 0.295] },
        {
          pagina: 3,
          recorte: [0.27, 0.295, 0.5, 0.61],
          mascaras: [
            { area: [0.4377, 0.365, 0.4645, 0.3897], letra: '' },
            { area: [0.4233, 0.398, 0.4465, 0.4335], letra: '' },
            { area: [0.4475, 0.398, 0.462, 0.4055], letra: '' },
            { area: [0.476, 0.37, 0.494, 0.3897], letra: '' },
            { area: [0.476, 0.398, 0.494, 0.405], letra: '' },
            { area: [0.4855, 0.385, 0.494, 0.405], letra: '' },
          ],
        },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, -1, 19], alvo: [1, -1, 0] } },
      parametros: [
        { id: 'I1', rotulo: 'Corrente no fio com arco', simbolo: 'I_1', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'fI', rotulo: 'Razão I₂/I₁', simbolo: 'I_2/I_1', valor: 2 + Math.PI / 2, min: 0.5, max: 6, passo: 0.01 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
      ],
      objetos: [
        { id: 'w1a', tipo: 'fio', I: 'I1', a: [0.085, 'R', 0], b: [0, 'R', 0], infinito: 'a', rotulo: 'I₁' },
        ...quarto,
        { id: 'w1c', tipo: 'fio', I: 'I1', a: ['0-R', 0, 0], b: ['0-R', -0.085, 0], infinito: 'b' },
        { id: 'w2a', tipo: 'fio', I: 'fI*I1', a: [0.085, 0, 0], b: ['R', 0, 0], infinito: 'a', rotulo: 'I₂' },
        { id: 'w2b', tipo: 'fio', I: 'fI*I1', a: ['R', 0, 0], b: ['R', -0.085, 0], infinito: 'b' },
        { id: 'C', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Trecho horizontal do fio 1', simbolo: 'B_a', expr: "z(Bde('w1a', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I1/(4*pi*R)' },
        { rotulo: 'Arco de um quarto', simbolo: 'B_c', expr: Bquarto, unidade: 'T', teoria: 'mu0*I1/(8*R)' },
        { rotulo: 'Trecho vertical do fio 1', simbolo: 'B_v', expr: "z(Bde('w1c', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I1/(4*pi*R)' },
        { rotulo: 'Trecho radial do fio 2', simbolo: 'B_r', expr: "z(Bde('w2a', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Trecho vertical do fio 2', simbolo: 'B_2', expr: "z(Bde('w2b', 0, 0, 0))", unidade: 'T', teoria: '0 - mu0*fI*I1/(4*pi*R)' },
        { rotulo: 'Campo total em C', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I1/(2*pi*R) + mu0*I1/(8*R) - mu0*fI*I1/(4*pi*R)' },
      ],
      passos: [
        {
          titulo: 'Fio 1: três peças',
          texto: r`Os dois trechos retos do fio 1 são tangentes ao círculo. Cada um é meio fio infinito, a uma distância $R$ de $\mathcal C$:

$$B = \frac{\mu_0I_1}{4\pi R}.$$

O arco é um quarto de espira: $\frac14\cdot\frac{\mu_0I_1}{2R} = \frac{\mu_0I_1}{8R}$. As três peças saem da página.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Fio 2: só um trecho conta',
          previsao: { pergunta: 'O trecho horizontal do fio 2 aponta para C. Ele contribui?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`O trecho horizontal está na reta que passa por $\mathcal C$: $d\vec\ell\times\hat r = \vec 0$. Só o vertical conta, meio fio infinito a uma distância $R$, entrando na página:

$$B_2 = -\frac{\mu_0I_2}{4\pi R}.$$`,
          medidas: [3, 4],
        },
        {
          titulo: 'Igualar',
          texto: r`$$\frac{\mu_0I_1}{2\pi R} + \frac{\mu_0I_1}{8R} = \frac{\mu_0I_2}{4\pi R} \quad\Rightarrow\quad I_2 = \left(2 + \frac\pi2\right)I_1.$$

Alternativa **(e)**. Mude a razão: o campo em $\mathcal C$ deixa de ser nulo.`,
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Biot-Savart', lab: 'ampere' }],
        etapas: [
          { titulo: 'Fio 1', texto: r`$2\cdot\dfrac{\mu_0I_1}{4\pi R} + \dfrac{\mu_0I_1}{8R}$, saindo da página.`, passo: 0 },
          { titulo: 'Fio 2', texto: r`Só o vertical: $\dfrac{\mu_0I_2}{4\pi R}$, entrando.`, passo: 1 },
          { titulo: 'Condição', texto: r`Igualando, $I_2 = (2 + \pi/2)I_1$.`, passo: 2 },
        ],
        resultado: r`$I_2 = (2 + \pi/2)I_1$: alternativa **(e)**.`,
        errosComuns: [
          r`Usar $\mu_0I/2\pi R$ nos trechos retos: são semi-infinitos.`,
          r`Contar o trecho horizontal do fio 2: ele é radial.`,
          r`Usar a espira inteira, em vez de um quarto.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$I_2 = (4/\pi - 1)I_1$`, porque: r`Não sai da soma das peças.` },
        { letra: 'b', texto: r`$I_2 = (2/\pi)I_1$`, porque: r`Falta o arco e confunde as razões.` },
        { letra: 'c', texto: r`$I_2 = (\pi/4)I_1$`, porque: r`Compara só o arco com o fio 2, sem o fator certo.` },
        { letra: 'd', texto: r`$I_2 = (2\pi - 1)I_1$`, porque: r`Não sai da soma das peças.` },
        { letra: 'e', texto: r`$I_2 = (2 + \pi/2)I_1$`, correta: true, porque: r`Correta: 2 dos trechos retos e $\pi/2$ do arco.` },
        { letra: 'f', texto: r`$I_2 = (2/\pi + 4)I_1$`, porque: r`Não sai da soma das peças.` },
        { letra: 'g', texto: r`$I_2 = (1/\pi + 1)I_1$`, porque: r`Não sai da soma das peças.` },
        { letra: 'h', texto: r`$I_2 = (1 + 4/\pi)I_1$`, porque: r`Não sai da soma das peças.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Energia de um capacitor com corrente alternada',
      resumo: 'Da corrente I₀ cos(2πft) à carga e à energia em t = 1/4f.',
      enunciado: r`Um capacitor plano ideal, que possui as duas placas de área $A$ separadas por uma distância $d$, está ligado a um circuito que é percorrido, a partir do instante inicial $t = 0$, por uma corrente elétrica alternada de intensidade dada por $I(t) = I_0\cos(2\pi ft)$, sendo $I_0$ e $f$ constantes positivas. Assumindo que inicialmente o capacitor se encontrava descarregado, então podemos concluir que a energia elétrica $U_c$ acumulada no capacitor até o instante $t_0 = 1/(4f)$ será:`,
      figura: [
        { pagina: 3, recorte: [0.515, 0.15, 0.905, 0.3] },
        {
          pagina: 3,
          recorte: [0.56, 0.32, 0.87, 0.55],
          mascaras: [
            { area: [0.775, 0.3, 0.875, 0.385], letra: '' },
            { area: [0.55, 0.315, 0.625, 0.372], letra: '' },
          ],
        },
      ],
      cena: {
        escala: 0.002,
        extensao: 26,
        unidade: 'cm',
        camera: { pos: [26, 20, 74], alvo: [0, 0, 0] },
        tempo: { escala: 0.25, unidade: 's', passo: 0.002 },
      },
      parametros: [
        { id: 'I0', rotulo: 'Corrente máxima', simbolo: 'I_0', valor: 6e-9, unidade: 'A', min: 2e-9, max: 1.2e-8, passo: 5e-10 },
        { id: 'ff', rotulo: 'Frequência', simbolo: 'f', valor: 1, unidade: 'Hz', min: 0.5, max: 2, passo: 0.1 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
        { id: 'ft', rotulo: 'Fração do período inicial', simbolo: 'ft_0', valor: 0, min: 0, max: 1, passo: 0.05 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', rotulo: 'Capacitor', centro: [0, 0, 0], eixo: 'x', lado: 'lado', d: 'd', Q: 'I0/(2*pi*ff)*sin(2*pi*(ff*t + ft))' },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente', simbolo: 'I', expr: 'I0*cos(2*pi*(ff*t + ft))', unidade: 'A' },
        { rotulo: 'Carga', simbolo: 'Q', expr: "Q('cap')", unidade: 'C', teoria: 'I0/(2*pi*ff)*sin(2*pi*(ff*t + ft))' },
        { rotulo: 'Energia armazenada', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: '(I0/(2*pi*ff)*sin(2*pi*(ff*t + ft)))^2*d/(2*eps0*lado^2)' },
        { rotulo: 'Energia em t₀ = 1/4f', simbolo: 'U_c', expr: 'I0^2*d/(8*pi^2*eps0*lado^2*ff^2)', unidade: 'J' },
      ],
      graficos: [
        {
          titulo: 'Corrente, carga e energia no tempo',
          tipo: 'tempo',
          janela: 2,
          series: [
            { rotulo: 'I', expr: 'I0*cos(2*pi*(ff*t + ft))', unidade: 'A' },
            { rotulo: 'U', expr: "U('cap')", unidade: 'J' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'A carga é a integral da corrente',
          texto: r`A corrente que chega à placa é a taxa de variação da carga:

$$Q(t) = \int_0^tI_0\cos(2\pi ft')\,dt' = \frac{I_0}{2\pi f}\sin(2\pi ft).$$

O capacitor parte descarregado, com a corrente **máxima**.`,
          parametros: { ft: 0 },
          medidas: [0, 1],
        },
        {
          titulo: 'Em t₀ = 1/4f',
          previsao: { pergunta: 'Em t₀ = 1/4f, a corrente é zero. A carga é…', opcoes: ['zero', 'máxima'], correta: 1 },
          texto: r`$2\pi ft_0 = \pi/2$: a corrente zera, e a carga chegou ao máximo:

$$Q(t_0) = \frac{I_0}{2\pi f}.$$

Como num pêndulo: velocidade nula no ponto mais alto.`,
          parametros: { ft: 0.25 },
          medidas: [0, 1],
        },
        {
          titulo: 'Energia',
          texto: r`Com $C = \varepsilon_0A/d$:

$$U_c = \frac{Q^2}{2C} = \frac{I_0^2}{4\pi^2f^2}\cdot\frac{d}{2\varepsilon_0A} = \frac{I_0^2d}{8\pi^2\varepsilon_0Af^2}.$$

Alternativa **(h)**.`,
          parametros: { ft: 0.25 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Capacitor e energia', lab: 'capacitor' },
          { texto: 'Corrente como taxa de variação da carga', lab: 'circuitos' },
        ],
        etapas: [
          { titulo: 'Carga', texto: r`$Q(t) = \dfrac{I_0}{2\pi f}\sin(2\pi ft)$; em $t_0$, $Q = I_0/2\pi f$.`, passo: 1 },
          { titulo: 'Energia', texto: r`$U_c = Q^2d/(2\varepsilon_0A)$.`, passo: 2 },
        ],
        resultado: r`$U_c = \dfrac{I_0^2d}{8\pi^2\varepsilon_0Af^2}$: alternativa **(h)**.`,
        errosComuns: [
          r`Usar $Q = I\,t$: a corrente não é constante.`,
          r`Esquecer o fator $2\pi f$ na integral do cosseno.`,
          r`Usar $C = \varepsilon_0d/A$, invertendo a geometria.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$U_c = \dfrac{I_0^2d}{2\pi\epsilon_0Af^2}$`, porque: r`Falta o $4\pi^2$ de $(2\pi f)^2$ por inteiro.` },
        { letra: 'b', texto: r`$U_c = \dfrac{I_0^2A}{16\pi^2\epsilon_0d^3f^2}$`, porque: r`Geometria errada: $U \propto d/A$.` },
        { letra: 'c', texto: r`$U_c = \dfrac{I_0^2d}{12\pi^3\epsilon_0Af^2}$`, porque: r`A potência de $\pi$ é 2, de $(2\pi)^2$.` },
        { letra: 'd', texto: r`$U_c = \dfrac{I_0^2d}{10\pi\epsilon_0Af^2}$`, porque: r`Não sai de $Q^2/2C$.` },
        { letra: 'e', texto: r`$U_c = \dfrac{I_0^2A}{\pi^4\epsilon_0d^3f^2}$`, porque: r`Geometria errada: $U \propto d/A$.` },
        { letra: 'f', texto: r`$U_c = \dfrac{I_0^2d}{27\pi^3\epsilon_0Af^2}$`, porque: r`Não sai de $Q^2/2C$.` },
        { letra: 'g', texto: r`$U_c = \dfrac{I_0^2A}{4\pi^2\epsilon_0d^3f^2}$`, porque: r`Geometria errada: $U \propto d/A$.` },
        { letra: 'h', texto: r`$U_c = \dfrac{I_0^2d}{8\pi^2\epsilon_0Af^2}$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Cabo coaxial com j variável na casca',
      resumo: 'Ampère em quatro regiões e a condição de B constante na casca.',
      enunciado: r`Um cabo muito longo é constituído de um cilindro maciço de raio $R$, envolvido coaxialmente por uma casca cilíndrica de raio interno $R_1 = 2R$ e raio externo $R_2 = 3R$. Estes dois elementos são percorridos por correntes elétricas de mesmo sentido, cujas densidades possuem como módulos $j_0$ constante no cilindro interno, enquanto que na casca cilíndrica temos $j(s) = j_1(R/s)$, sendo $j_1$ constante e positiva e $s$ a distância ao eixo de simetria do cilindro.

a) Obtenha o campo magnético $\vec B(s)$ nas regiões (i) $0 < s < R$ e (ii) $R < s < R_1$. b) Obtenha $\vec B(s)$ nas regiões (iii) $R_1 < s < R_2$ e (iv) $s > R_2$. c) Obtenha a relação que deve existir entre $j_0$ e $j_1$ para que $B(s)$ tenha um valor constante na região interna à casca cilíndrica, ou seja, quando $R_1 < s < R_2$. d) Faça um gráfico esboçando o comportamento de $B(s)$ na região entre $0 < s < 4R$, assumindo que seja satisfeita a relação do item anterior. Destaque os valores de $B(s)$ nos pontos de fronteira delimitadores de cada região.`,
      figura: [
        { pagina: 4, recorte: [0.06, 0.16, 0.465, 0.61] },
        { pagina: 4, recorte: [0.47, 0.075, 0.86, 0.73] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'j0', rotulo: 'Densidade no cilindro', simbolo: 'j_0', valor: 1e6, unidade: 'A/m²', min: 2e5, max: 2e6, passo: 1e5 },
        { id: 'j1', rotulo: 'Constante da casca', simbolo: 'j_1', valor: 1.5e5, unidade: 'A/m²', min: 0, max: 1e6, passo: 2.5e4 },
        { id: 'R', rotulo: 'Raio do cilindro', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.012, unidade: 'm', min: 0.004, max: 0.085, passo: 0.001 },
      ],
      objetos: [
        { id: 'nu', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'R', I: 'pi*R^2*j0', rotulo: 'j₀' },
        { id: 'ca', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: '3*R', raioInterno: '2*R', J: 'j1*R/r', rotulo: 'j(s)' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: Ic('rs') },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: `mu0*(${Ic('rs')})` },
        { rotulo: 'Campo em s', simbolo: r`B_\varphi`, expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: `mu0*(${Ic('rs')})/(2*pi*rs)` },
        { rotulo: 'B no meio da casca', simbolo: 'B(2{,}5R)', expr: 'y(B(2.5*R, 0, 0))', unidade: 'T', teoria: 'mu0*R*(j1 + (j0 - 4*j1)/5)' },
        { rotulo: 'B em 2R', simbolo: 'B(2R)', expr: 'y(B(2*R, 0, 0))', unidade: 'T', teoria: 'mu0*j0*R/4' },
        { rotulo: 'B em 3R', simbolo: 'B(3R)', expr: 'y(B(3*R, 0, 0))', unidade: 'T', teoria: 'mu0*R*(j0 + 2*j1)/6' },
      ],
      graficos: [
        {
          titulo: 'B(s)/B(R)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.02*R', ate: '4*R', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))/(mu0*j0*R/2)', unidade: '' },
            { rotulo: 'Ampère', expr: `mu0*(${Ic('ss')})/(2*pi*ss)/(mu0*j0*R/2)`, unidade: '' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: 'a) Dentro do cilindro',
          texto: r`Simetria cilíndrica: $\vec B = B(s)\hat\varphi$. Num círculo coaxial de raio $s$, $2\pi sB = \mu_0I_\text{env}$.

Em (i), $I_\text{env} = \pi s^2j_0$:

$$\vec B_1(s) = \frac12\mu_0j_0s\,\hat\varphi.$$`,
          parametros: { rs: 0.012 },
          medidas: [0, 1, 2],
        },
        {
          item: 'a',
          titulo: 'a) Entre o cilindro e a casca',
          texto: r`Em (ii), a corrente envolvida é toda a do cilindro:

$$\vec B_2(s) = \frac{\mu_0j_0R^2}{2s}\hat\varphi.$$`,
          parametros: { rs: 0.03 },
          medidas: [0, 2],
        },
        {
          item: 'b',
          titulo: 'b) Dentro da casca',
          texto: r`O $s'$ do elemento de área cancela com o $1/s'$ de $j$:

$$I(s) = \pi R^2j_0 + j_1\int_{2R}^s\frac R{s'}2\pi s'\,ds' = \pi R\left[j_0R + 2j_1(s - 2R)\right],$$

$$\vec B_3(s) = \mu_0R\left[j_1 + (j_0 - 4j_1)\frac{R}{2s}\right]\hat\varphi.$$`,
          parametros: { rs: 0.05 },
          medidas: [0, 2, 3],
        },
        {
          item: 'b',
          titulo: 'b) Fora de tudo',
          texto: r`Em (iv), $I = \pi R^2(j_0 + 2j_1)$:

$$\vec B_4(s) = \frac{\mu_0R^2(j_0 + 2j_1)}{2s}\hat\varphi.$$`,
          parametros: { rs: 0.075 },
          medidas: [0, 2, 5],
        },
        {
          item: 'c',
          titulo: 'c) B constante na casca',
          previsao: { pergunta: 'Para B não depender de s na casca, qual termo deve sumir?', opcoes: ['j₁', '(j₀ − 4j₁)R/2s'], correta: 1 },
          texto: r`Basta anular o termo em $1/s$:

$$j_0 = 4j_1 \quad\Rightarrow\quad B_3 = \mu_0Rj_1 = \frac14\mu_0Rj_0.$$

Passe o caminho pela casca: o campo fica parado.`,
          parametros: { rs: 0.05, j1: 2.5e5 },
          medidas: [2, 3, 4],
        },
        {
          item: 'd',
          titulo: 'd) O gráfico',
          texto: r`Com $B(R) = \frac12\mu_0j_0R$, os valores de $B(s)/B(R)$ são:

- $s = 0$: zero;
- $s = R$: 1, o máximo;
- $s = 2R$ e $s = 3R$: $\frac12$, com o patamar entre eles;
- $s = 4R$: $\frac38$.

Reta até $R$, queda $1/s$ até $2R$, patamar até $3R$ e queda $1/s$ depois. A curva é contínua: não há corrente superficial.`,
          parametros: { rs: 0.08, j1: 2.5e5 },
          medidas: [2, 4, 5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' }],
        etapas: [
          { titulo: 'a) Regiões i e ii', texto: r`$\vec B_1 = \frac12\mu_0j_0s\,\hat\varphi$ e $\vec B_2 = \dfrac{\mu_0j_0R^2}{2s}\hat\varphi$.`, passo: 1 },
          { titulo: 'b) Regiões iii e iv', texto: r`$\vec B_3 = \mu_0R\left[j_1 + (j_0 - 4j_1)\dfrac{R}{2s}\right]\hat\varphi$ e $\vec B_4 = \dfrac{\mu_0R^2(j_0 + 2j_1)}{2s}\hat\varphi$.`, passo: 3 },
          { titulo: 'c) Condição', texto: r`$j_0 = 4j_1$, com $B_3 = \frac14\mu_0Rj_0$.`, passo: 4 },
          { titulo: 'd) Gráfico', texto: r`$B/B(R)$: 0, 1, $\frac12$, $\frac12$ e $\frac38$ em $s = 0, R, 2R, 3R, 4R$.`, passo: 5 },
        ],
        resultado: r`$\vec B_1 = \frac12\mu_0j_0s\,\hat\varphi$; $\vec B_2 = \dfrac{\mu_0j_0R^2}{2s}\hat\varphi$; $\vec B_3 = \mu_0R\left[j_1 + (j_0 - 4j_1)\dfrac{R}{2s}\right]\hat\varphi$; $\vec B_4 = \dfrac{\mu_0R^2(j_0 + 2j_1)}{2s}\hat\varphi$; $j_0 = 4j_1$.`,
        errosComuns: [
          r`Multiplicar $j(s)$ pela área da casca: ela varia, é preciso integrar.`,
          r`Esquecer a corrente do cilindro ao calcular $B$ na casca.`,
          r`Fazer $B$ saltar nas fronteiras: sem corrente superficial, ele é contínuo.`,
        ],
        oficial: {
          resposta: r`$\vec B_1 = \frac12\mu_0j_0s\,\hat u_T$; $\vec B_2 = \dfrac{\mu_0j_0R^2}{2s}\hat u_T$; $\vec B_3 = \mu_0R\left[j_1 + (j_0 - 4j_1)\dfrac{R}{2s}\right]\hat u_T$; $\vec B_4 = \dfrac{\mu_0R^2(j_0 + 2j_1)}{2s}\hat u_T$; $j_0 = 4j_1$.`,
          observacao: r`**Divergência:** no item (c), o gabarito escreve $B_3 = \frac18\mu_0Rj_0$. O valor correto é $\frac14\mu_0Rj_0$: com $j_0 = 4j_1$, $B_3 = \mu_0Rj_1$. O próprio gráfico do gabarito confirma, pois marca $B(2R)/B(R) = \frac12$ com $B(R) = \frac12\mu_0Rj_0$. O gabarito usa $\hat u_T$ para o que aqui é $\hat\varphi$.`,
        },
      },
      respostas: [
        { item: 'a', texto: r`$\vec B_1 = \frac12\mu_0j_0s\,\hat\varphi$; $\vec B_2 = \dfrac{\mu_0j_0R^2}{2s}\hat\varphi$`, pontos: 1.2, criterio: 'Simetria, caminho circular e corrente envolvida.' },
        { item: 'b', texto: r`$\vec B_3 = \mu_0R\left[j_1 + (j_0 - 4j_1)\dfrac{R}{2s}\right]\hat\varphi$; $\vec B_4 = \dfrac{\mu_0R^2(j_0 + 2j_1)}{2s}\hat\varphi$`, pontos: 1.2, criterio: 'Integral de j(s) na casca, somada à corrente do cilindro.' },
        { item: 'c', texto: r`$j_0 = 4j_1$`, pontos: 0.8, criterio: r`Anular o termo em $1/s$.` },
        { item: 'd', texto: r`Reta até $R$, $1/s$ até $2R$, patamar até $3R$, $1/s$ depois; $\frac12$ em $2R$ e $3R$, $\frac38$ em $4R$`, pontos: 0.8, criterio: 'Formato, continuidade e valores nas fronteiras.' },
      ],
    },
  ],
}

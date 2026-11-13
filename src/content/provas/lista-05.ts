import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P2 } from '../formularios'

const r = String.raw

/* Exercício 9: o cone fatiado em discos (o método da sugestão), do raio a em x = 0 ao raio b em x = L. */
const FATIAS = 10
const raioCone = (f: number) => `(a + (b - a)*${f})`
const discos = Array.from({ length: FATIAS }, (_, k) => ({
  id: `d${k}`,
  tipo: 'condutor' as const,
  a: [`L*${k / FATIAS}`, 0, 0] as [string, number, number],
  b: [`L*${(k + 1) / FATIAS}`, 0, 0] as [string, number, number],
  raio: raioCone((k + 0.5) / FATIAS),
  I: 'I0',
}))

/* Exercício 10: a rede, a partir da leitura do amperímetro. */
const RP = '(1/(1/25 + 1/15 + 1/25))'
const I10 = `(25*IA/${RP})`
const REQ = `(45 + 35 + ${RP})`

/* Exercícios 11 e 12: bateria de fem E0 e resistência interna r0 ligada a R. */
const UM_ANO = '(365.25*86400)'

export const lista_05: ProvaInput = {
  id: 'lista-05',
  titulo: 'Lista 5 · Corrente elétrica',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  formulario: FORMULARIO_P2,
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Um elétron numa linha de transmissão',
      resumo: 'v_d = I/neA ≈ 0,25 mm/s: atravessar 200 km leva uns 25 anos.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.281] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [6, 7, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 1000, unidade: 'A', min: 100, max: 2000, passo: 10 },
        { id: 'L', rotulo: 'Comprimento da linha', simbolo: 'L', valor: 2e5, unidade: 'm', min: 1e4, max: 5e5, passo: 1e3 },
        { id: 'd', rotulo: 'Diâmetro do cabo', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
        { id: 'n', rotulo: 'Elétrons livres por volume', simbolo: 'n', valor: 8e28, unidade: '1/m³', min: 8e28, max: 8e28, passo: 1e27 },
      ],
      objetos: [{ id: 'cabo', tipo: 'condutor', a: [-0.1, 0, 0], b: [0.1, 0, 0], raio: 'd/2', I: 'I0', rotulo: 'trecho do cabo' }],
      medidas: [
        { rotulo: 'Área da seção', simbolo: r`A = \frac{\pi d^2}{4}`, expr: '1e4*pi*d^2/4', unidade: 'cm²' },
        { rotulo: 'Velocidade de arraste', simbolo: r`v_d = \frac{I}{neA}`, expr: '1e3*I0/(n*qe*pi*d^2/4)', unidade: 'mm/s' },
        { rotulo: 'Tempo para atravessar a linha', simbolo: r`t = \frac{L}{v_d}`, expr: 'L/(I0/(n*qe*pi*d^2/4))', unidade: 's' },
        { rotulo: 'O mesmo tempo, em anos', simbolo: 't', expr: `L/(I0/(n*qe*pi*d^2/4))/${UM_ANO}`, unidade: 'anos' },
      ],
      passos: [
        {
          titulo: 'Velocidade de arraste',
          texto: r`A corrente é a carga que atravessa a seção por segundo: $I = neAv_d$. Com $A = \pi(1\text{ cm})^2$,
$$v_d = \frac{I}{neA} \approx 2{,}5\times10^{-4}\ \text{m/s},$$
um quarto de milímetro por segundo, mesmo com 1000 A.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Tempo de travessia',
          texto: r`$t = L/v_d \approx 8\times10^8$ s, cerca de **25 anos**. A energia chega quase na velocidade da luz porque o campo se propaga depressa e empurra todos os elétrons do fio ao mesmo tempo; cada elétron, em si, mal sai do lugar.`,
          medidas: [2, 3],
        },
      ],
      respostas: [{ item: 't', texto: r`$t = \dfrac{L\,neA}{I} \approx 8\times10^8$ s $\approx 25$ anos` }],
      resolucao: {
        conceitos: [{ texto: 'Corrente e velocidade de arraste', lab: 'corrente' }],
        etapas: [
          {
            titulo: 't para um elétron atravessar o cabo',
            texto: r`**O que se pede.** Quanto tempo um elétron leva para percorrer os 200 km de uma linha de cobre de 2 cm de diâmetro, com corrente de 1000 A. A densidade de elétrons livres é $n \approx 8\times10^{28}$ m⁻³.

**A ideia: corrente e velocidade de arraste.** Num fio, os elétrons livres se agitam em todas as direções, mas, com corrente, têm em média um pequeno movimento de conjunto ao longo do fio: a **velocidade de arraste** $v_d$. A densidade de corrente (corrente por área) é (formulário)
$$\vec J = nq\vec v,$$
e a corrente é $J$ vezes a área da seção (formulário: $I = \int_S\vec J\cdot d\vec A$, que, com $J$ uniforme, dá $I = JA$). Em módulo, com $q = e$:
$$I = neAv_d\quad\Rightarrow\quad v_d = \frac{I}{neA}.$$

**A conta.** O raio é 1 cm (metade do diâmetro): $A = \pi(0{,}01)^2 \approx 3{,}14\times10^{-4}$ m².
$$v_d = \frac{1000}{(8\times10^{28})(1{,}6\times10^{-19})(3{,}14\times10^{-4})} \approx 2{,}5\times10^{-4}\ \text{m/s}.$$
Um quarto de milímetro por segundo, mesmo com mil ampères. O tempo é distância ÷ velocidade:
$$t = \frac{L}{v_d} = \frac{2\times10^5}{2{,}5\times10^{-4}} \approx 8\times10^8\ \text{s} \approx 25\ \text{anos}.$$

**Mas então como a luz acende na hora?** Quem viaja depressa é o **campo elétrico** ao longo do fio, quase na velocidade da luz. Ele põe todos os elétrons do fio em movimento praticamente ao mesmo tempo. Cada elétron, individualmente, mal sai do lugar.`,
            passo: 1,
          },
        ],
        resultado: r`$t \approx 25$ anos.`,
        errosComuns: ['Usar o diâmetro como raio na área.'],
        oficial: { resposta: 'Aproximadamente 25 anos.' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Carga total de uma corrente que decai',
      resumo: 'Q = ∫I₀e^(−t/τ) dt de 0 a ∞ = I₀τ.',
      figura: { pagina: 1, recorte: [0.089, 0.282, 0.936, 0.347] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.01, duracao: 12 } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente inicial', simbolo: 'I_0', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'tau', rotulo: 'Constante de tempo', simbolo: r`\tau`, valor: 2, unidade: 's', min: 0.5, max: 4, passo: 0.1 },
      ],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'RC', R: 10, C: 'tau/10', fem: 0, q0: 'I0*tau', rotulo: 'capacitor descarregando: I = I₀e^(−t/τ)' }],
      medidas: [
        { rotulo: 'Corrente agora', simbolo: r`I(t) = I_0e^{-t/\tau}`, expr: "abs(I('c'))", unidade: 'A', teoria: 'I0*exp(0-t/tau)' },
        { rotulo: 'Carga que já passou', simbolo: r`Q(t) = I_0\tau(1 - e^{-t/\tau})`, expr: "I0*tau - q('c')", unidade: 'C', teoria: 'I0*tau*(1 - exp(0-t/tau))' },
        { rotulo: 'Carga total', simbolo: r`Q = I_0\tau`, expr: 'I0*tau', unidade: 'C' },
      ],
      graficos: [
        {
          titulo: 'Corrente e carga acumulada',
          tipo: 'tempo',
          janela: 12,
          series: [
            { rotulo: 'I', expr: "abs(I('c'))", unidade: 'A' },
            { rotulo: 'Q', expr: "I0*tau - q('c')", unidade: 'C' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Integrar a corrente',
          texto: r`$I = dQ/dt$, então a carga que atravessa a seção é a área sob $I(t)$:
$$Q = \int_0^\infty I_0e^{-t/\tau}\,dt = I_0\tau.$$
A cena realiza essa corrente com um capacitor descarregando por um resistor ($\tau = RC$).`,
          medidas: [0, 2],
        },
        {
          titulo: 'Quanto falta',
          texto: r`Rode: depois de $\tau$ já passou $1 - 1/e \approx 63\%$ da carga; depois de $5\tau$, mais de 99%. A integral até o infinito converge porque a corrente cai depressa.`,
          medidas: [0, 1],
        },
      ],
      respostas: [{ item: 'Q', texto: r`$Q = I_0\tau$` }],
      resolucao: {
        conceitos: [{ texto: 'Corrente que decai: descarga RC', lab: 'circuitos' }],
        etapas: [
          {
            titulo: 'Q que atravessa a seção de 0 a ∞',
            texto: r`**O que se pede.** A carga total que passa por uma seção do fio entre $t = 0$ e $t \to \infty$, com a corrente $I(t) = I_0e^{-t/\tau}$ caindo exponencialmente.

**A ideia.** Corrente é carga por tempo: $I = \dfrac{dQ}{dt}$. Num intervalo curto $dt$, passa a carga $dQ = I\,dt$. Se a corrente fosse constante, bastaria multiplicar $I$ pelo tempo; como ela muda, soma-se (integra-se) $I\,dt$ ao longo do tempo. Graficamente, a carga é a **área sob a curva** $I(t)$.

**A conta.**
$$Q = \int_0^\infty I_0e^{-t/\tau}\,dt = I_0\Big[-\tau e^{-t/\tau}\Big]_0^\infty = I_0\big(0 - (-\tau)\big) = I_0\tau.$$
(A primitiva de $e^{-t/\tau}$ é $-\tau e^{-t/\tau}$; no infinito, a exponencial vai a zero.)

**Interpretação.** É como se a corrente inicial $I_0$ durasse exatamente um tempo $\tau$ e depois parasse. A integral até o infinito dá um valor finito porque a corrente cai depressa. Depois de $\tau$ já passou $1 - 1/e \approx 63\%$ da carga; depois de $5\tau$, mais de 99%. É o que acontece, por exemplo, quando um capacitor descarrega através de um resistor ($\tau = RC$).`,
            passo: 0,
          },
        ],
        resultado: r`$Q = I_0\tau$.`,
        errosComuns: ['Multiplicar $I_0$ por um tempo qualquer, como se a corrente fosse constante.'],
        oficial: { resposta: 'Q = I₀τ.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Médio',
      titulo: 'Corrente num plasma neutro',
      resumo: 'Neutro: n₋ = 2n. Os dois tipos somam corrente: J = 4nqv.',
      figura: { pagina: 1, recorte: [0.089, 0.348, 0.936, 0.442] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 13], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.01 } },
      parametros: [
        { id: 'n', rotulo: 'Portadores de carga 2q por volume', simbolo: 'n', valor: 1e18, unidade: '1/m³', min: 1e18, max: 1e18, passo: 1e17 },
        { id: 'k', rotulo: 'Razão n₋/n', simbolo: 'n_-/n', valor: 1, unidade: '', min: 0.5, max: 3, passo: 0.1 },
        { id: 'v', rotulo: 'Velocidade dos portadores', simbolo: 'v', valor: 1e4, unidade: 'm/s', min: 1e3, max: 5e4, passo: 1e3 },
      ],
      objetos: [
        ...[-2, 0, 2].map((y, k) => ({ id: `pp${k}`, tipo: 'particula' as const, q: '2*qe', m: 'mp', pos: [-4 * 0.01 + k * 0.01, y * 0.01, 0] as [number, number, number], v: [0.012, 0, 0] as [number, number, number], rotulo: k === 0 ? 'carga 2q (→ v)' : undefined })),
        ...[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((y, k) => ({ id: `pm${k}`, tipo: 'particula' as const, q: '0-qe', m: 'mp', pos: [3 * 0.01 - (k % 3) * 0.01, y * 0.01, 0] as [number, number, number], v: [-0.012, 0, 0] as [number, number, number], rotulo: k === 0 ? 'carga −q (← v)' : undefined })),
      ],
      medidas: [
        { rotulo: 'Densidade de carga', simbolo: r`\rho = 2qn - qn_-`, expr: 'qe*n*(2 - k)', unidade: 'C/m³' },
        { rotulo: 'Corrente dos portadores 2q', simbolo: r`J_+ = 2qnv`, expr: '2*qe*n*v', unidade: 'A/m²' },
        { rotulo: 'Corrente dos portadores −q', simbolo: r`J_- = (-q)n_-(-v)`, expr: 'qe*k*n*v', unidade: 'A/m²' },
        { rotulo: 'Densidade de corrente total', simbolo: 'J', expr: 'qe*n*v*(2 + k)', unidade: 'A/m²' },
      ],
      passos: [
        {
          titulo: '(a) Neutralidade',
          texto: r`Plasma neutro: $\rho = n(2q) + n_-(-q) = 0$, então $n_- = 2n$. Ajuste a razão até a densidade de carga zerar.`,
          parametros: { k: 2 },
          medidas: [0],
        },
        {
          titulo: '(b) As duas correntes somam',
          texto: r`$\vec J = \sum nq\vec v$. Os positivos dão $2qn\vec v$; os negativos, $(-q)(2n)(-\vec v) = 2qn\vec v$, **no mesmo sentido**: carga negativa andando para trás é corrente para a frente. Total:
$$\vec J = 4nq\vec v.$$`,
          parametros: { k: 2 },
          medidas: [1, 2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$n_- = 2n$` },
        { item: '(b)', texto: r`$\vec J = 4nq\vec v$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Densidade de corrente microscópica', lab: 'corrente' }],
        etapas: [
          {
            titulo: '(a) Quantos portadores −q por volume',
            texto: r`**O que se pede.** O número por volume, $n_-$, dos portadores de carga $-q$, sabendo que o plasma é **globalmente neutro** e que há $n$ portadores de carga $2q$ por volume.

**A ideia.** Neutro quer dizer densidade de carga total zero. A densidade de carga de um tipo de portador é (número por volume) × (carga de cada um). Somam-se os dois tipos.

**A conta.**
$$\rho = n(2q) + n_-(-q) = 0\quad\Rightarrow\quad n_- = 2n.$$

**Em palavras.** Cada portador positivo tem o dobro da carga de cada negativo; para equilibrar, os negativos precisam ser o dobro em número.`,
            passo: 0,
          },
          {
            titulo: '(b) A densidade de corrente no plasma',
            texto: r`**O que se pede.** O vetor densidade de corrente $\vec J$ do plasma, com os positivos ($2q$) andando com velocidade $\vec v$ e os negativos ($-q$) com $-\vec v$.

**A ideia.** A densidade de corrente de um tipo de portador é (formulário)
$$\vec J = nq\vec v.$$
Com vários tipos, somam-se as contribuições. Atenção aos sinais: a carga e a velocidade entram **com sinal**.

**A conta.**
- Positivos: $n\cdot(2q)\cdot\vec v = 2nq\,\vec v$.
- Negativos: $(2n)\cdot(-q)\cdot(-\vec v) = 2nq\,\vec v$. Os dois sinais de menos se cancelam.
$$\vec J = 2nq\,\vec v + 2nq\,\vec v = 4nq\,\vec v.$$

**Por que somam, e não se cancelam?** Carga negativa andando para trás equivale a carga positiva andando para a frente: as duas levam carga positiva líquida no sentido de $\vec v$. É por isso que, num fio, a corrente convencional tem o sentido **oposto** ao dos elétrons.`,
            passo: 1,
          },
        ],
        resultado: r`$n_- = 2n$; $\vec J = 4nq\vec v$.`,
        errosComuns: ['Subtrair as correntes dos negativos: com carga e velocidade trocadas de sinal, elas somam.'],
        oficial: { resposta: 'n₋ = 2n; J = 4nqv.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Médio',
      titulo: 'Corrente do elétron no átomo de Bohr',
      resumo: 'I = ev/2πa₀ ≈ 1 mA, no sentido oposto ao do movimento do elétron.',
      figura: { pagina: 1, recorte: [0.089, 0.443, 0.936, 0.537] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, -6, 11], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'v', rotulo: 'Velocidade do elétron', simbolo: 'v', valor: 2.188e6, unidade: 'm/s', min: 5e5, max: 4e6, passo: 1e3 },
        { id: 'a0', rotulo: 'Raio da órbita', simbolo: 'a_0', valor: 0.529e-10, unidade: 'm', min: 0.529e-10, max: 0.529e-10, passo: 1e-12 },
        { id: 'Rv', rotulo: 'Raio desenhado (escala da cena)', simbolo: r`R_\text{cena}`, valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'orb', tipo: 'espira', I: '0-qe*v/(2*pi*a0)', centro: [0, 0, 0], raio: 'Rv', normal: 'z', rotulo: 'corrente da órbita (horária)' },
        { id: 'pr', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: 'próton' },
        { id: 'el', tipo: 'carga', q: '0-qe', pos: ['Rv', 0, 0], rotulo: 'elétron' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: ['Rv', 0, 0], vetor: [0, 1, 0], comprimento: '2*cm', rotulo: 'v do elétron' },
        { id: 'sI', tipo: 'seta', papel: 'I', origem: ['0-Rv', 0, 0], vetor: [0, 1, 0], comprimento: '2*cm', rotulo: 'I' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Voltas por segundo', simbolo: r`f = \frac{v}{2\pi a_0}`, expr: 'v/(2*pi*a0)', unidade: 'Hz' },
        {
          rotulo: 'Corrente lida do campo da espira simulada',
          simbolo: r`I = \frac{2RB_\text{centro}}{\mu_0}`,
          expr: "1e3*2*Rv*abs(z(Bde('orb', 0, 0, 0)))/mu0",
          unidade: 'mA',
          teoria: '1e3*qe*v/(2*pi*a0)',
        },
        { rotulo: 'Em constantes fundamentais (v de Bohr)', simbolo: r`I = \frac{e^2}{4}\sqrt{\frac{1}{\pi^3\varepsilon_0ma_0^3}}`, expr: '1e3*qe^2/4*sqrt(1/(pi^3*eps0*me*a0^3))', unidade: 'mA' },
        { rotulo: 'Sentido da corrente em z (+ = anti-horário)', simbolo: r`\operatorname{sinal}I`, expr: "sign(z(Bde('orb', 0, 0, 0)))", unidade: '', teoria: -1 },
      ],
      passos: [
        {
          titulo: '(a) Carga por tempo',
          texto: r`Num ponto da órbita passa uma carga $e$ a cada período $T = 2\pi a_0/v$. Tratando o movimento como corrente estacionária,
$$I = \frac{e}{T} = \frac{ev}{2\pi a_0} \approx 1\ \text{mA}.$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Em constantes fundamentais',
          texto: r`Coulomb faz o papel de centrípeta: $\dfrac{e^2}{4\pi\varepsilon_0a_0^2} = \dfrac{mv^2}{a_0}$, e daí $v = \dfrac{e}{2\sqrt{\pi\varepsilon_0ma_0}}$. Substituindo, $I = \dfrac{e^2}{4}\sqrt{\dfrac{1}{\pi^3\varepsilon_0ma_0^3}}$.`,
          parametros: { v: 2.188e6 },
          medidas: [1, 2],
        },
        {
          titulo: '(b) Sentido',
          texto: r`Não. O sentido convencional da corrente é o do movimento de cargas **positivas**; o elétron é negativo, então a corrente gira **ao contrário** dele: com o elétron no sentido anti-horário, a corrente é horária.`,
          medidas: [3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$I = \dfrac{ev}{2\pi a_0} = \dfrac{e^2}{4}\sqrt{\dfrac{1}{\pi^3\varepsilon_0ma_0^3}}$` },
        { item: '(b)', texto: 'Não: a corrente tem o sentido oposto ao movimento do elétron, porque a carga dele é negativa.' },
      ],
      resolucao: {
        conceitos: [{ texto: 'Corrente como carga por tempo', lab: 'corrente' }],
        etapas: [
          {
            titulo: '(a) A corrente do elétron em órbita',
            texto: r`**O que se pede.** A corrente associada ao elétron (carga $-e$) que gira em círculo de raio $a_0$ com velocidade $v$, tratada como uma corrente estacionária.

**A ideia.** Corrente é carga que passa por um ponto (ou por uma seção) por unidade de tempo. Fique parado num ponto da órbita: a cada volta passa por ali uma carga $e$ (em módulo). Em média, a corrente é essa carga dividida pelo tempo de uma volta, o **período** $T$. "Estacionária" quer dizer tratar essa média como uma corrente constante circulando pela órbita.

**A conta.** O período é o comprimento da órbita dividido pela velocidade:
$$T = \frac{2\pi a_0}{v}\quad\Rightarrow\quad I = \frac{e}{T} = \frac{ev}{2\pi a_0}.$$

**Em constantes fundamentais.** A força elétrica do próton faz o papel de força centrípeta: $\dfrac{e^2}{4\pi\varepsilon_0a_0^2} = \dfrac{mv^2}{a_0}$, então $v = \dfrac{e}{2\sqrt{\pi\varepsilon_0ma_0}}$. Substituindo:
$$I = \frac{e^2}{4}\sqrt{\frac{1}{\pi^3\varepsilon_0ma_0^3}}.$$

**Em números.** Com $v \approx 2{,}2\times10^6$ m/s e $a_0 \approx 0{,}53\times10^{-10}$ m: $I \approx \dfrac{(1{,}6\times10^{-19})(2{,}2\times10^6)}{2\pi(0{,}53\times10^{-10})} \approx 1$ mA. É uma corrente razoável, numa órbita minúscula.`,
            passo: 0,
          },
          {
            titulo: '(b) O sentido da corrente',
            texto: r`**O que se pede.** Dizer se a corrente tem o mesmo sentido da rotação do elétron.

**A ideia.** Por convenção, o sentido da corrente é o sentido em que se movem as cargas **positivas**. Uma carga negativa movendo-se num sentido transporta carga como uma positiva movendo-se no sentido contrário. Pela densidade de corrente do formulário, $\vec J = nq\vec v$: com $q < 0$, $\vec J$ aponta **contra** $\vec v$.

**Resposta.** **Não.** O elétron é negativo, então a corrente circula no sentido **oposto** ao do movimento dele. Se o elétron gira no sentido anti-horário, a corrente é horária.`,
            passo: 2,
          },
        ],
        resultado: r`$I = ev/2\pi a_0$, oposta ao movimento do elétron.`,
        errosComuns: ['Pôr a corrente no sentido do movimento do elétron.'],
        oficial: { resposta: 'I = ev/2πa₀; em constantes fundamentais, I = (e²/4)√(1/(π³ε₀ma₀³)). A corrente tem sempre o sentido oposto ao do movimento do elétron.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Fácil',
      titulo: 'Esticar um fio',
      resumo: 'Dobrar L e dividir A por 2 multiplica R por 4; com V fixo, I cai 4 vezes, E e J caem 2.',
      figura: { pagina: 1, recorte: [0.089, 0.538, 0.936, 0.683] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [0, 2, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'f', rotulo: 'Fator de estiramento', simbolo: 'f', valor: 2, unidade: '', min: 1, max: 3, passo: 0.1 },
        { id: 'V0', rotulo: 'ddp aplicada', simbolo: 'V', valor: 0.01, unidade: 'V', min: 0.001, max: 0.05, passo: 0.001 },
        { id: 'L0', rotulo: 'Comprimento inicial', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06, passo: 0.001 },
        { id: 'r0', rotulo: 'Raio inicial', simbolo: 'r', valor: 0.008, unidade: 'm', min: 0.008, max: 0.008, passo: 0.001 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1.1e-6, unidade: 'Ω·m', min: 1.1e-6, max: 1.1e-6, passo: 1e-7 },
      ],
      objetos: [
        { id: 'antes', tipo: 'condutor', a: ['0-L0/2', 0.03, 0], b: ['L0/2', 0.03, 0], raio: 'r0', I: 'V0*pi*r0^2/(rho*L0)', rotulo: 'antes (L, A)' },
        { id: 'depois', tipo: 'condutor', a: ['0-f*L0/2', -0.03, 0], b: ['f*L0/2', -0.03, 0], raio: 'r0/sqrt(f)', I: 'V0*pi*r0^2/(rho*L0*f^2)', rotulo: 'depois (fL, A/f)' },
      ],
      medidas: [
        { rotulo: 'Resistência antes', simbolo: r`R_i = \frac{\rho L}{A}`, expr: '1e3*rho*L0/(pi*r0^2)', unidade: 'mΩ' },
        { rotulo: 'Resistência depois', simbolo: r`R_f = \frac{\rho fL}{A/f}`, expr: '1e3*rho*f*L0/(pi*r0^2/f)', unidade: 'mΩ' },
        { rotulo: 'R_i / R_f', simbolo: r`\frac{R_i}{R_f}`, expr: '(rho*L0/(pi*r0^2))/(rho*f*L0/(pi*r0^2/f))', unidade: '' },
        { rotulo: 'I_i / I_f', simbolo: r`\frac{I_i}{I_f}`, expr: '(V0/(rho*L0/(pi*r0^2)))/(V0/(rho*f*L0/(pi*r0^2/f)))', unidade: '' },
        { rotulo: 'E_i / E_f', simbolo: r`\frac{E_i}{E_f}`, expr: '(V0/L0)/(V0/(f*L0))', unidade: '' },
        { rotulo: 'J_i / J_f', simbolo: r`\frac{J_i}{J_f}`, expr: '(V0/(rho*L0))/(V0/(rho*f*L0))', unidade: '' },
      ],
      passos: [
        {
          titulo: '(a) Resistência',
          texto: r`$R = \rho L/A$. O volume não muda: $L \to 2L$ e $A \to A/2$, então $R_f = \rho\dfrac{2L}{A/2} = 4R_i$ e $\dfrac{R_i}{R_f} = \dfrac14$.`,
          parametros: { f: 2 },
          medidas: [0, 1, 2],
        },
        { titulo: '(b) Corrente', texto: r`Com $V$ fixo, $I = V/R$: $\dfrac{I_i}{I_f} = \dfrac{R_f}{R_i} = 4$.`, parametros: { f: 2 }, medidas: [3] },
        { titulo: '(c) Campo', texto: r`No fio uniforme, $E = V/L$: o comprimento dobra, $\dfrac{E_i}{E_f} = 2$.`, parametros: { f: 2 }, medidas: [4] },
        {
          titulo: '(d) Densidade de corrente',
          texto: r`$J = E/\rho$, com o mesmo material: $\dfrac{J_i}{J_f} = 2$. Confere com $J = I/A$: a corrente cai 4 vezes e a área cai 2.`,
          parametros: { f: 2 },
          medidas: [5],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$R_i/R_f = 1/4$` },
        { item: '(b)', texto: r`$I_i/I_f = 4$` },
        { item: '(c)', texto: r`$E_i/E_f = 2$` },
        { item: '(d)', texto: r`$J_i/J_f = 2$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Resistência e resistividade', lab: 'corrente' }],
        etapas: [
          {
            titulo: '(a) A razão entre as resistências',
            texto: r`**O que se pede.** A razão $R_i/R_f$ entre a resistência do fio antes e depois de esticado: o comprimento dobra e a área da seção cai à metade.

**A ideia.** A resistência de um fio uniforme é (formulário)
$$R = \rho\frac LA,$$
em que $\rho$ é a resistividade, uma propriedade do material, que não muda ao esticar. Fio mais longo resiste mais (a corrente tem mais caminho); fio mais grosso resiste menos (há mais "pistas" lado a lado).

**A conta.**
$$R_f = \rho\frac{2L}{A/2} = 4\rho\frac LA = 4R_i\quad\Rightarrow\quad\frac{R_i}{R_f} = \frac14.$$
Os dois efeitos se somam: o comprimento dobra a resistência, e a área menor dobra de novo.`,
            passo: 0,
          },
          {
            titulo: '(b) A razão entre as correntes',
            texto: r`**O que se pede.** A razão $I_i/I_f$ entre as correntes antes e depois, com a mesma diferença de potencial $V$ nas pontas.

**A ideia.** Lei de Ohm (formulário): $V = RI$, então $I = V/R$. Com $V$ fixo, a corrente é inversamente proporcional à resistência.

**A conta.**
$$\frac{I_i}{I_f} = \frac{V/R_i}{V/R_f} = \frac{R_f}{R_i} = 4.$$
A corrente cai para um quarto.`,
            passo: 1,
          },
          {
            titulo: '(c) A razão entre os campos no fio',
            texto: r`**O que se pede.** A razão $E_i/E_f$ entre as intensidades do campo elétrico dentro do fio.

**A ideia.** Num fio uniforme, o campo é uniforme ao longo dele, e a diferença de potencial entre as pontas é campo × comprimento: $V = EL$. Logo $E = V/L$.

**A conta.** $V$ é o mesmo e o comprimento dobra:
$$\frac{E_i}{E_f} = \frac{V/L}{V/(2L)} = 2.$$
A mesma tensão, espalhada por um fio duas vezes mais longo, dá um campo duas vezes mais fraco.`,
            passo: 2,
          },
          {
            titulo: '(d) A razão entre as densidades de corrente',
            texto: r`**O que se pede.** A razão $J_i/J_f$ entre as densidades de corrente (corrente por área) dentro do fio.

**A ideia.** A lei de Ohm em cada ponto do material (formulário):
$$\vec J = \frac1\rho\vec E.$$
O material é o mesmo, então $J$ é proporcional a $E$.

**A conta.** Pelo item (c):
$$\frac{J_i}{J_f} = \frac{E_i}{E_f} = 2.$$

**Conferindo por outro caminho.** $J = I/A$: a corrente caiu 4 vezes e a área caiu 2 vezes, então $J$ caiu $4/2 = 2$ vezes. Mesmo resultado.`,
            passo: 3,
          },
        ],
        resultado: r`$1/4$, $4$, $2$, $2$.`,
        errosComuns: ['Dobrar só o comprimento e esquecer que a área cai junto.'],
        oficial: { resposta: 'R_i/R_f = 1/4; I_i/I_f = 4; E_i/E_f = 2; J_i/J_f = 2.' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Fio de dois materiais concêntricos',
      resumo: 'Os dois em paralelo, com a mesma resistência ρL/πa² cada: R = ρL/2πa².',
      figura: { pagina: 1, recorte: [0.089, 0.684, 0.936, 0.884] },
      cena: { escala: 0.001, extensao: 6, unidade: 'mm', plano: 'xy', camera: { pos: [4, -5, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'ddp entre as pontas', simbolo: 'V', valor: 0.01, unidade: 'V', min: 0.001, max: 0.05, passo: 0.001 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 1, unidade: 'm', min: 0.2, max: 2, passo: 0.05 },
        { id: 'a', rotulo: 'Raio do núcleo', simbolo: 'a', valor: 0.001, unidade: 'm', min: 0.0005, max: 0.0015, passo: 0.0001 },
        { id: 'rho', rotulo: 'Resistividade do núcleo', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1e-8, max: 1e-7, passo: 1e-9 },
      ],
      objetos: [
        { id: 'nucleo', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', J: 'V0/(L*rho)', rotulo: 'núcleo (ρ)' },
        { id: 'casca', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: '2*a', raioInterno: 'a', J: 'V0/(L*3*rho)', rotulo: 'casca (3ρ)' },
        { id: 'amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: '2.5*a', rotulo: 'amperiana' },
      ],
      medidas: [
        { rotulo: 'Campo elétrico no fio (o mesmo nos dois)', simbolo: r`E = \frac VL`, expr: 'V0/L', unidade: 'V/m' },
        { rotulo: 'Corrente no núcleo (pelo campo magnético dele)', simbolo: r`I_1 = \frac{E}{\rho}\pi a^2`, expr: "2*pi*3*a*mag(Bde('nucleo', 3*a, 0, 0))/mu0", unidade: 'A', teoria: 'V0/(L*rho)*pi*a^2' },
        { rotulo: 'Corrente na casca', simbolo: r`I_2 = \frac{E}{3\rho}\,3\pi a^2`, expr: "2*pi*3*a*mag(Bde('casca', 3*a, 0, 0))/mu0", unidade: 'A', teoria: 'V0/(L*3*rho)*3*pi*a^2' },
        { rotulo: 'Corrente total (circulação de B na amperiana)', simbolo: r`I = \frac{1}{\mu_0}\oint\vec B\cdot d\vec l`, expr: "circ('amp')/mu0", unidade: 'A', teoria: '2*V0*pi*a^2/(L*rho)' },
        { rotulo: 'Resistência do fio', simbolo: r`R = \frac VI = \frac{\rho L}{2\pi a^2}`, expr: "1e3*V0/(circ('amp')/mu0)", unidade: 'mΩ', teoria: '1e3*rho*L/(2*pi*a^2)' },
      ],
      passos: [
        {
          titulo: 'Mesmo campo, densidades diferentes',
          texto: r`O campo elétrico ao longo do fio é o mesmo nas duas regiões, $E = V/L$. Pela lei de Ohm local, $J = E/\rho$: o núcleo conduz com $J_1 = E/\rho$ e a casca com $J_2 = E/3\rho$.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Em paralelo',
          texto: r`O núcleo tem área $\pi a^2$; a casca, $\pi(4a^2 - a^2) = 3\pi a^2$. Resistências: $R_1 = \dfrac{\rho L}{\pi a^2}$ e $R_2 = \dfrac{3\rho L}{3\pi a^2} = R_1$. Em paralelo,
$$R = \frac{R_1}{2} = \frac{\rho L}{2\pi a^2}.$$
A simulação acha a corrente total pela circulação do campo magnético e divide $V$ por ela.`,
          medidas: [3, 4],
        },
      ],
      respostas: [{ item: 'R', texto: r`$R = \dfrac{\rho L}{2\pi a^2}$` }],
      resolucao: {
        conceitos: [
          { texto: 'Resistores em paralelo', lab: 'corrente' },
          { texto: 'Corrente distribuída num cilindro', lab: 'ampereJ' },
        ],
        etapas: [
          {
            titulo: 'R do fio de dois materiais',
            texto: r`**O que se pede.** A resistência de um fio de comprimento $L$ formado por um núcleo cilíndrico de raio $a$ e resistividade $\rho$, envolvido por uma casca de raio interno $a$, raio externo $2a$ e resistividade $3\rho$. A corrente corre ao longo do fio e o campo é o mesmo em todo o interior.

**A ideia.** As duas partes vão de uma ponta à outra do fio, **lado a lado**, ligadas às mesmas extremidades. As duas têm a mesma diferença de potencial $V$ entre as pontas, e a corrente total é a soma das correntes de cada parte: estão **em paralelo**. Em paralelo, $\dfrac1R = \dfrac1{R_1} + \dfrac1{R_2}$, porque $I = I_1 + I_2$ e cada $I = V/R$ (formulário: $V = RI$).

**A resistência de cada parte** (formulário: $R = \rho\dfrac LA$):
- **Núcleo:** área $\pi a^2$, resistividade $\rho$:
$$R_1 = \frac{\rho L}{\pi a^2}.$$
- **Casca:** área entre os raios $a$ e $2a$, $\pi(2a)^2 - \pi a^2 = 3\pi a^2$, resistividade $3\rho$:
$$R_2 = \frac{3\rho L}{3\pi a^2} = \frac{\rho L}{\pi a^2}.$$

As duas são **iguais**: a casca tem três vezes mais área, mas o material resiste três vezes mais.

**A conta.** Dois resistores iguais em paralelo dão metade de um:
$$R = \frac{R_1}{2} = \frac{\rho L}{2\pi a^2}.$$

**Pelo campo, o mesmo resultado.** O campo é $E = V/L$ nos dois materiais. Pela lei de Ohm local (formulário: $\vec J = \vec E/\rho$), $J_1 = E/\rho$ no núcleo e $J_2 = E/3\rho$ na casca. A corrente total é $I = J_1\pi a^2 + J_2\cdot3\pi a^2 = \dfrac{2\pi a^2E}{\rho} = \dfrac{2\pi a^2V}{\rho L}$, e $R = V/I$ dá a mesma expressão.`,
            passo: 1,
          },
        ],
        resultado: r`$R = \rho L/2\pi a^2$.`,
        errosComuns: ['Pôr os dois materiais em série: a corrente corre ao longo do fio, lado a lado nos dois.'],
        oficial: { resposta: 'R = ρL/2πa².' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Difícil',
      titulo: 'Fio com resistividade que cresce para fora',
      resumo: 'E = V/L uniforme, J = V/(Lks), I = 2πVa/(kL) e R = kL/(2πa).',
      figura: { pagina: 2, recorte: [0.08, 0.062, 0.936, 0.222] },
      cena: { escala: 0.001, extensao: 4, unidade: 'mm', plano: 'xy', camera: { pos: [3, -3, 6], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'ddp', simbolo: 'V', valor: 0.01, unidade: 'V', min: 0.001, max: 0.05, passo: 0.001 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 1, unidade: 'm', min: 0.2, max: 2, passo: 0.05 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.001, unidade: 'm', min: 0.0005, max: 0.0015, passo: 0.0001 },
        { id: 'k', rotulo: 'Constante da resistividade', simbolo: 'k', valor: 1e-5, unidade: 'Ω', min: 5e-6, max: 5e-5, passo: 1e-6 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.0005, unidade: 'm', min: 0.0001, max: 0.001, passo: 0.00005 },
      ],
      objetos: [
        { id: 'fio', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', raioInterno: '1e-6*a', J: 'V0/(L*k*r)', rotulo: 'fio (ρ = ks)' },
        { id: 'amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: '1.5*a', rotulo: 'amperiana' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      medidas: [
        { rotulo: 'Campo elétrico', simbolo: r`E = \frac VL`, expr: 'V0/L', unidade: 'V/m' },
        { rotulo: 'Densidade de corrente em s', simbolo: r`J(s) = \frac{V}{Lks}`, expr: '1e-6*V0/(L*k*s)', unidade: 'A/mm²' },
        { rotulo: 'Corrente total (circulação de B)', simbolo: r`I = \frac{2\pi Va}{kL}`, expr: "circ('amp')/mu0", unidade: 'A', teoria: '2*pi*V0*a/(k*L)' },
        { rotulo: 'Resistência', simbolo: r`R = \frac{kL}{2\pi a}`, expr: "1e3*V0/(circ('amp')/mu0)", unidade: 'mΩ', teoria: '1e3*k*L/(2*pi*a)' },
      ],
      graficos: [
        {
          titulo: 'Densidade de corrente J(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.0001, ate: 0.001, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'J', expr: '1e-6*V0/(L*k*ss)', unidade: 'A/mm²' }],
        },
      ],
      passos: [
        { titulo: '(a) Campo', texto: r`O fio é uniforme ao longo do comprimento: $\vec E = \dfrac VL\hat z$, o mesmo em toda a seção.`, medidas: [0] },
        { titulo: '(b) Densidade de corrente', texto: r`Lei de Ohm local: $\vec J = \dfrac{\vec E}{\rho} = \dfrac{V}{Lks}\hat z$. Perto do eixo a resistividade é pequena e a corrente se concentra.`, medidas: [1] },
        {
          titulo: '(c) Corrente total',
          texto: r`Em anéis de área $2\pi s\,ds$:
$$I = \int_0^a\frac{V}{Lks}\,2\pi s\,ds = \frac{2\pi Va}{kL}.$$
O $s$ se cancela: cada anel leva a mesma corrente. A simulação integra $J$ na seção e lê $I$ pela lei de Ampère.`,
          medidas: [2],
        },
        { titulo: '(d) Resistência', texto: r`$R = \dfrac VI = \dfrac{kL}{2\pi a}$.`, medidas: [3] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac VL\hat z$` },
        { item: '(b)', texto: r`$\vec J = \dfrac{V}{Lks}\hat z$` },
        { item: '(c)', texto: r`$I = \dfrac{2\pi Va}{kL}$` },
        { item: '(d)', texto: r`$R = \dfrac{kL}{2\pi a}$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ohm local', lab: 'corrente' },
          { texto: 'Corrente não uniforme num cilindro', lab: 'ampereJ' },
        ],
        etapas: [
          {
            titulo: '(a) O campo dentro do fio',
            texto: r`**O que se pede.** A intensidade do campo dentro do fio (comprimento $L$, raio $a$), com a diferença de potencial $V$ nas pontas, supondo o campo uniforme.

**A ideia.** Com campo uniforme ao longo do fio, a diferença de potencial entre as pontas é campo × comprimento, $V = EL$. Isso vem de $\vec E = -\vec\nabla V$ (formulário): num campo constante, o potencial cai linearmente.

**A conta.**
$$\vec E = \frac VL\,\hat z,$$
ao longo do eixo do fio, o mesmo em toda a seção. A resistividade varia de ponto a ponto, mas isso não muda o campo: todo filete de fio, perto do eixo ou da borda, liga as mesmas duas pontas, com a mesma tensão $V$ e o mesmo comprimento $L$.`,
            passo: 0,
          },
          {
            titulo: '(b) A densidade de corrente em função de s',
            texto: r`**O que se pede.** A densidade de corrente num ponto da seção, a uma distância $s$ do eixo, sendo a resistividade $\rho(s) = ks$.

**A ideia.** A lei de Ohm em cada ponto (formulário):
$$\vec J = \frac{1}{\rho}\vec E.$$
Onde a resistividade é pequena, a mesma $\vec E$ produz mais corrente.

**A conta.**
$$\vec J = \frac{1}{ks}\cdot\frac VL\,\hat z = \frac{V}{Lks}\,\hat z.$$

**Interpretação.** A densidade de corrente é maior perto do eixo ($s$ pequeno), onde o material resiste menos, e cai como $1/s$ para a borda.`,
            passo: 1,
          },
          {
            titulo: '(c) A corrente total',
            texto: r`**O que se pede.** A corrente total que atravessa a seção do fio.

**A ideia.** A corrente é o fluxo da densidade de corrente pela seção (formulário: $I = \int_S\vec J\cdot d\vec A$). Como $J$ não é uniforme (depende de $s$), não basta multiplicar por $\pi a^2$. Divide-se a seção em **anéis** finos, de raio $s$ e largura $ds$: em cada um, $J$ é praticamente constante.

**Montagem.** Um anel de raio $s$ e largura $ds$, desenrolado, é quase um retângulo de lados $2\pi s$ e $ds$: área $dA = 2\pi s\,ds$. $\vec J$ é perpendicular à seção (ao longo do fio), então $\vec J\cdot d\vec A = J\,dA$. A corrente pelo anel:
$$dI = J(s)\,2\pi s\,ds = \frac{V}{Lks}\,2\pi s\,ds = \frac{2\pi V}{kL}\,ds.$$
O $s$ cancelou: **todos os anéis de mesma largura levam a mesma corrente**.

**A conta.**
$$I = \int_0^a\frac{2\pi V}{kL}\,ds = \frac{2\pi Va}{kL}.$$`,
            passo: 2,
          },
          {
            titulo: '(d) A resistência do fio',
            texto: r`**O que se pede.** A resistência elétrica do fio.

**A ideia.** Lei de Ohm (formulário): $V = RI$, então $R = V/I$, com $I$ do item (c).

**A conta.**
$$R = \frac{V}{2\pi Va/kL} = \frac{kL}{2\pi a}.$$

**Conferindo as unidades.** $\rho = ks$ é uma resistividade ($\Omega\cdot$m), então $k$ tem unidade $\Omega$. Assim $\dfrac{kL}{a}$ tem unidade de ohm, como deve ser. A tensão $V$ cancelou: a resistência só depende do fio, não da tensão aplicada.`,
            passo: 3,
          },
        ],
        resultado: r`$R = kL/2\pi a$.`,
        errosComuns: ['Multiplicar $J$ pela área $\\pi a^2$ como se fosse uniforme.'],
        oficial: { resposta: 'E = (V/L) ẑ; J = V/(Lks) ẑ; I = 2πVa/(kL); R = kL/(2πa).' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Difícil',
      titulo: 'Resistor cilíndrico com corrente radial',
      resumo: 'J = I/2πsL, E = ρI/2πsL e R = (ρ/2πL) ln(b/a).',
      figura: { pagina: 2, recorte: [0.08, 0.223, 0.936, 0.397] },
      cena: { escala: 0.01, extensao: 4, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 7], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 0.1, unidade: 'A', min: 0.01, max: 0.5, passo: 0.01 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 100, unidade: 'Ω·m', min: 10, max: 500, passo: 10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.005 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.005, unidade: 'm', min: 0.003, max: 0.01, passo: 0.0005 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.02, unidade: 'm', min: 0.015, max: 0.03, passo: 0.0005 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.01, unidade: 'm', min: 0.0055, max: 0.0195, passo: 0.0005 },
      ],
      objetos: [
        { id: 'corpo', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'b', raioInterno: 'a', I: 0, rotulo: 'casca resistiva' },
        {
          id: 'Er',
          tipo: 'campoE',
          valor: 'sqrt(x^2 + y^2) > a && sqrt(x^2 + y^2) < b ? (rho*I0/(2*pi*L*(x^2 + y^2)))*[x, y, 0] : [0, 0, 0]',
          rotulo: 'E = ρJ (radial)',
        },
        { id: 'raio', tipo: 'caminho', pontos: [['a', 0, 0], ['b', 0, 0]], rotulo: 'de a até b' },
        { id: 'g', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], raio: 's', altura: 'L', eixo: 'z', campo: 'E', rotulo: 'cilindro de raio s' },
      ],
      visual: { setasE: true, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Densidade de corrente em s', simbolo: r`J(s) = \frac{I}{2\pi sL}`, expr: 'I0/(2*pi*s*L)', unidade: 'A/m²' },
        { rotulo: 'Corrente pelo cilindro de raio s (fluxo de J = E/ρ)', simbolo: r`\oint\vec J\cdot d\vec A`, expr: "fluxo('g')/rho", unidade: 'A', teoria: 'I0' },
        { rotulo: 'Campo elétrico em s', simbolo: r`E = \frac{\rho I}{2\pi sL}`, expr: 'mag(E(s, 0, 0))', unidade: 'V/m', teoria: 'rho*I0/(2*pi*s*L)' },
        { rotulo: 'Diferença de potencial (integral de E de a até b)', simbolo: r`V_a - V_b = \int_a^b E\,ds`, expr: "intE('raio')", unidade: 'V', teoria: 'rho*I0/(2*pi*L)*ln(b/a)' },
        { rotulo: 'Resistência', simbolo: r`R = \frac{\rho}{2\pi L}\ln\frac ba`, expr: "intE('raio')/I0", unidade: 'Ω', teoria: 'rho/(2*pi*L)*ln(b/a)' },
      ],
      passos: [
        {
          titulo: '(a) Densidade de corrente',
          texto: r`Toda a corrente atravessa qualquer cilindro de raio $s$ entre $a$ e $b$, de área $2\pi sL$: $I = J(s)\,2\pi sL$, ou $J = \dfrac{I}{2\pi sL}$. Arraste o raio $s$: o fluxo de $\vec J$ continua $I$.`,
          medidas: [0, 1],
        },
        { titulo: '(b) Campo', texto: r`Lei de Ohm local: $\vec E = \rho\vec J = \dfrac{\rho I}{2\pi sL}\hat s$, radial.`, medidas: [2] },
        {
          titulo: '(c) Diferença de potencial',
          texto: r`$$V_a - V_b = \int_a^b\frac{\rho I}{2\pi sL}\,ds = \frac{\rho I}{2\pi L}\ln\frac ba.$$
A simulação integra o campo ao longo do raio.`,
          medidas: [3],
        },
        { titulo: '(d) Resistência', texto: r`$R = \dfrac{V_a - V_b}{I} = \dfrac{\rho}{2\pi L}\ln\dfrac ba$.`, medidas: [4] },
      ],
      respostas: [
        { item: '(a)', texto: r`$J(s) = \dfrac{I}{2\pi sL}$` },
        { item: '(b)', texto: r`$\vec E = \dfrac{\rho I}{2\pi sL}\hat s$` },
        { item: '(c)', texto: r`$V_a - V_b = \dfrac{\rho I}{2\pi L}\ln\dfrac ba$` },
        { item: '(d)', texto: r`$R = \dfrac{\rho}{2\pi L}\ln\dfrac ba$` },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ohm local', lab: 'corrente' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
        ],
        etapas: [
          {
            titulo: '(a) A densidade de corrente a uma distância s',
            texto: r`**O que se pede.** A densidade de corrente num ponto da casca cilíndrica (raios $a$ e $b$, comprimento $L$, resistividade $\rho$), a uma distância $s$ do eixo, com a corrente $I$ saindo **radialmente** da superfície de dentro para a de fora.

**A ideia.** A corrente é estacionária: a carga não se acumula em lugar nenhum. Então toda a corrente $I$ que sai pela superfície interna atravessa **qualquer** cilindro de raio $s$ entre $a$ e $b$: o que entra tem de sair. Por simetria, $J$ é radial e só depende de $s$.

**A conta.** O cilindro de raio $s$ e comprimento $L$ tem área lateral $2\pi sL$. Com $\vec J$ perpendicular a ele e de módulo constante nele, o fluxo (formulário: $I = \int_S\vec J\cdot d\vec A$) é
$$I = J(s)\,2\pi sL\quad\Rightarrow\quad J(s) = \frac{I}{2\pi sL}.$$

**Interpretação.** A mesma corrente se espalha por áreas cada vez maiores à medida que se afasta do eixo, então $J$ diminui como $1/s$.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo, pela lei de Ohm local',
            texto: r`**O que se pede.** O campo elétrico no mesmo ponto, pela lei de Ohm microscópica.

**A ideia.** A lei de Ohm em cada ponto (formulário): $\vec J = \dfrac1\rho\vec E$, ou seja, $\vec E = \rho\vec J$.

**A conta.** Com $\vec J$ do item (a), radial:
$$\vec E = \frac{\rho I}{2\pi sL}\,\hat s.$$

O campo também é radial, apontando para fora (de onde a corrente sai para onde ela vai), e cai como $1/s$.

**Sobre o gabarito.** O gabarito da monitoria escreve $K$ onde deveria estar $L$ no denominador; o certo é $\dfrac{\rho I}{2\pi Ls}$.`,
            passo: 1,
          },
          {
            titulo: '(c) A diferença de potencial entre as superfícies',
            texto: r`**O que se pede.** A diferença de potencial entre a superfície interna ($s = a$) e a externa ($s = b$).

**A ideia.** O potencial sai do campo por integração (o inverso de $\vec E = -\vec\nabla V$, do formulário). Indo no sentido do campo, o potencial cai:
$$V_a - V_b = \int_a^b E\,ds.$$

**A conta.**
$$V_a - V_b = \int_a^b\frac{\rho I}{2\pi sL}\,ds = \frac{\rho I}{2\pi L}\Big[\ln s\Big]_a^b = \frac{\rho I}{2\pi L}\ln\frac ba.$$

Positivo: a superfície de dentro, de onde a corrente sai, está no potencial mais alto.`,
            passo: 2,
          },
          {
            titulo: '(d) A resistência',
            texto: r`**O que se pede.** A resistência desse resistor, com a corrente radial.

**A ideia.** Lei de Ohm (formulário): $R = V/I$, com $V$ do item (c).

**A conta.**
$$R = \frac{V_a - V_b}{I} = \frac{\rho}{2\pi L}\ln\frac ba.$$

**Cuidado com $R = \rho L/A$.** Essa fórmula vale quando a corrente atravessa uma área **constante** ao longo de um comprimento. Aqui a corrente anda na direção radial, e a área que ela atravessa ($2\pi sL$) cresce com $s$. O logaritmo vem justamente de somar fatias finas de espessura $ds$ e área $2\pi sL$, em série: $dR = \dfrac{\rho\,ds}{2\pi sL}$.`,
            passo: 3,
          },
        ],
        resultado: r`$R = \frac{\rho}{2\pi L}\ln(b/a)$.`,
        errosComuns: ['Usar $R = \\rho L/A$: aqui a corrente é radial, e a área que ela atravessa cresce com $s$.'],
        oficial: {
          resposta: 'J = I/(2πLs); E = ρI/(2πKs) ŝ; V_a − V_b = (ρI/2πL) ln(b/a); R = (ρ/2πL) ln(b/a).',
          observacao: 'No item (b) o gabarito escreve K onde é L: E = ρI/(2πLs).',
        },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Difícil',
      titulo: 'Resistência de um cone truncado',
      resumo: 'Somando discos em série: R = ∫ρ dx/πr(x)² = ρL/(πab).',
      figura: { pagina: 2, recorte: [0.08, 0.398, 0.936, 0.53] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [5, 6, 13], alvo: [5, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 1, unidade: 'A', min: 0.1, max: 5, passo: 0.1 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1e-4, unidade: 'Ω·m', min: 1e-5, max: 1e-3, passo: 1e-5 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.1, unidade: 'm', min: 0.05, max: 0.12, passo: 0.005 },
        { id: 'a', rotulo: 'Raio maior', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
        { id: 'b', rotulo: 'Raio menor', simbolo: 'b', valor: 0.01, unidade: 'm', min: 0.005, max: 0.01, passo: 0.0005 },
      ],
      objetos: [
        ...discos,
        { id: 'Ex', tipo: 'campoE', valor: 'x >= 0 && x <= L && y^2 + z^2 < (a + (b - a)*x/L)^2 ? [rho*I0/(pi*(a + (b - a)*x/L)^2), 0, 0] : [0, 0, 0]', rotulo: 'E = ρI/πr²' },
        { id: 'eixo', tipo: 'caminho', pontos: [[0, 0, 0], ['L', 0, 0]], rotulo: 'eixo, de a até b' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Resistência de um disco no meio', simbolo: r`dR = \frac{\rho\,dx}{\pi r^2}`, expr: `1e3*rho*(L/${FATIAS})/(pi*(a + (b - a)/2)^2)`, unidade: 'mΩ' },
        { rotulo: 'ddp ao longo do eixo (integral de E)', simbolo: r`V = \int_0^L\frac{\rho I}{\pi r(x)^2}dx`, expr: "1e3*intE('eixo')", unidade: 'mV', teoria: '1e3*rho*I0*L/(pi*a*b)' },
        { rotulo: 'Resistência', simbolo: r`R = \frac{\rho L}{\pi ab}`, expr: "1e3*intE('eixo')/I0", unidade: 'mΩ', teoria: '1e3*rho*L/(pi*a*b)' },
        { rotulo: 'Se fosse um cilindro de raio a', simbolo: r`\frac{\rho L}{\pi a^2}`, expr: '1e3*rho*L/(pi*a^2)', unidade: 'mΩ' },
      ],
      passos: [
        {
          titulo: 'Discos em série',
          texto: r`Fatie o cone em discos de espessura $dx$. O raio cresce linearmente, $r(x) = a + (b - a)\dfrac xL$, e cada disco é um resistor $dR = \dfrac{\rho\,dx}{\pi r^2}$, todos em série.`,
          medidas: [0],
        },
        {
          titulo: 'Integrar',
          texto: r`Com $dr = \dfrac{b - a}{L}dx$:
$$R = \frac{\rho L}{\pi(b - a)}\int_a^b\frac{dr}{r^2} = \frac{\rho L}{\pi(b - a)}\left(\frac1a - \frac1b\right) = \frac{\rho L}{\pi ab}.$$
Com $a = b$ volta $\rho L/\pi a^2$. A simulação integra o campo $E = \rho I/\pi r^2$ ao longo do eixo.`,
          medidas: [1, 2, 3],
        },
        {
          titulo: 'Uma ressalva',
          texto: r`O próprio enunciado avisa: supor a corrente uniforme em cada seção é uma aproximação. No cone, as linhas de corrente se abrem e as superfícies equipotenciais não são planas. A fórmula é boa quando o cone afina devagar ($|a - b| \ll L$).`,
          medidas: [2],
        },
      ],
      respostas: [{ item: 'R', texto: r`$R = \dfrac{\rho L}{\pi ab}$` }],
      resolucao: {
        conceitos: [{ texto: 'Resistência e geometria', lab: 'corrente' }],
        etapas: [
          {
            titulo: 'R do cone truncado',
            texto: r`**O que se pede.** A resistência de um fio em forma de cone truncado, de comprimento $L$ e raios $a$ e $b$ nas pontas, com resistividade $\rho$, supondo a corrente uniforme em cada seção.

**A ideia.** A fórmula $R = \rho\dfrac LA$ (formulário) vale para área constante. Aqui a área muda ao longo do fio. Fatia-se o cone em **discos** finos, de espessura $dx$: em cada um, a área é praticamente constante, e o disco é um pequeno resistor
$$dR = \frac{\rho\,dx}{A(x)} = \frac{\rho\,dx}{\pi r(x)^2}.$$
A corrente passa por um disco depois do outro: estão todos **em série**, e as resistências se **somam** (integral).

**Montagem.** O raio muda linearmente de uma ponta à outra. Com $x$ medido a partir da ponta de raio $a$:
$$r(x) = a + (b - a)\frac{x}{L}.$$
Troca-se a variável de $x$ para $r$: $dr = \dfrac{b - a}{L}\,dx$, então $dx = \dfrac{L}{b - a}\,dr$, e $r$ vai de $a$ a $b$.

**A conta.**
$$R = \int_a^b\frac{\rho}{\pi r^2}\cdot\frac{L}{b - a}\,dr = \frac{\rho L}{\pi(b - a)}\Big[-\frac1r\Big]_a^b = \frac{\rho L}{\pi(b - a)}\left(\frac1a - \frac1b\right).$$
Como $\dfrac1a - \dfrac1b = \dfrac{b - a}{ab}$:
$$R = \frac{\rho L}{\pi ab}.$$

**Conferindo.** Com $a = b$ (cilindro), volta $\dfrac{\rho L}{\pi a^2}$. Repare que o resultado usa $\pi ab$, e não a área de um raio médio.

**A ressalva do enunciado.** Supor a corrente uniforme em cada seção é uma aproximação: no cone, as linhas de corrente se abrem e as superfícies de mesmo potencial não são planas. O resultado é bom quando o cone afina devagar ($|a - b| \ll L$).`,
            passo: 1,
          },
        ],
        resultado: r`$R = \rho L/\pi ab$ (na aproximação de corrente uniforme em cada seção).`,
        errosComuns: ['Usar a área média $\\pi\\left(\\frac{a + b}{2}\\right)^2$: o resultado é $\\pi ab$, não a média dos raios ao quadrado.'],
        oficial: { resposta: 'R = ρL/(πab).' },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Fácil',
      titulo: 'Circuito com amperímetro e voltímetro',
      resumo: 'Três ramos em paralelo (25, 15 e 25 Ω): V = 206,25 V, R_eq ≈ 86,8 Ω, ε ≈ 398 V, P ≈ 1,82 kW.',
      figura: { pagina: 2, recorte: [0.08, 0.531, 0.936, 0.803] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] } },
      parametros: [{ id: 'IA', rotulo: 'Leitura do amperímetro', simbolo: 'I_A', valor: 1.25, unidade: 'A', min: 1.25, max: 1.25, passo: 0.01 }],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'R', R: REQ, fem: `${I10}*${REQ}`, rotulo: 'circuito equivalente (ε e R_eq)' }],
      medidas: [
        { rotulo: 'ddp no paralelo', simbolo: r`V_p = 25\,I_A`, expr: '25*IA', unidade: 'V' },
        { rotulo: 'Resistência do paralelo', simbolo: r`R_p`, expr: RP, unidade: 'Ω' },
        { rotulo: 'Corrente na bateria (do circuito equivalente)', simbolo: 'I', expr: "I('c')", unidade: 'A', teoria: I10 },
        { rotulo: 'Leitura do voltímetro', simbolo: r`V = 45\,I`, expr: "45*I('c')", unidade: 'V', teoria: 206.25 },
        { rotulo: 'Resistência equivalente', simbolo: r`R_\text{eq}`, expr: REQ, unidade: 'Ω', teoria: 86.818 },
        { rotulo: 'fem da bateria', simbolo: r`\varepsilon = IR_\text{eq}`, expr: `I('c')*${REQ}`, unidade: 'V', teoria: 397.9 },
        { rotulo: 'Potência dissipada', simbolo: r`P = \varepsilon I`, expr: `I('c')^2*${REQ}`, unidade: 'W', teoria: 1823.6 },
      ],
      passos: [
        {
          titulo: 'Ler a rede',
          texto: r`Entre os dois nós do meio há três ramos: em cima $25\ \Omega$ com o amperímetro; no meio $15\ \Omega$; embaixo $15\ \Omega$ em série com $10\ \Omega$, isto é, outros $25\ \Omega$. O voltímetro mede a ddp no resistor de $45\ \Omega$.`,
          medidas: [1],
        },
        {
          titulo: 'Do amperímetro à corrente total',
          texto: r`$V_p = 25 \times 1{,}25 = 31{,}25$ V em todos os ramos. Com $\dfrac1{R_p} = \dfrac1{25} + \dfrac1{15} + \dfrac1{25}$, $R_p \approx 6{,}82\ \Omega$ e $I = V_p/R_p \approx 4{,}58$ A.`,
          medidas: [0, 2],
        },
        {
          titulo: '(a) a (d)',
          texto: r`(a) $V = 45I = 206{,}25$ V. (b) $R_\text{eq} = 45 + 35 + R_p \approx 86{,}8\ \Omega$. (c) $\varepsilon = IR_\text{eq} \approx 398$ V. (d) $P = \varepsilon I \approx 1{,}82$ kW.`,
          medidas: [3, 4, 5, 6],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$V = 206{,}25$ V` },
        { item: '(b)', texto: r`$R_\text{eq} \approx 86{,}8\ \Omega$` },
        { item: '(c)', texto: r`$\varepsilon \approx 398$ V` },
        { item: '(d)', texto: r`$P \approx 1{,}82$ kW` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Resistores em série e em paralelo', lab: 'continua' }],
        etapas: [
          {
            titulo: '(a) A leitura do voltímetro',
            texto: r`**O que se pede.** O que marca o voltímetro, ligado em paralelo com o resistor de $45\ \Omega$, sabendo que o amperímetro marca $1{,}25$ A.

**As regras usadas.**
- Lei de Ohm (formulário): $V = RI$.
- Amperímetro ideal: resistência zero, mede a corrente do ramo em que está.
- Voltímetro ideal: resistência infinita, não desvia corrente e mede a tensão entre os pontos onde está ligado.
- **Paralelo:** ramos ligados aos mesmos dois nós têm a **mesma tensão**, e as correntes se somam.
- **Série:** elementos num caminho único têm a **mesma corrente**, e as tensões se somam.

**Lendo o circuito.** Entre os dois nós do meio há três ramos em paralelo:
- em cima, $25\ \Omega$ com o amperímetro;
- no meio, $15\ \Omega$;
- embaixo, $15\ \Omega$ em série com $10\ \Omega$, que dão $25\ \Omega$.

Esse bloco está em série com o $45\ \Omega$, o $35\ \Omega$ e a bateria.

**Passo 1: a tensão do bloco.** No ramo do amperímetro, $V_p = 25\times1{,}25 = 31{,}25$ V. Pelo paralelo, é a tensão dos três ramos.

**Passo 2: a corrente total.** As correntes dos ramos são $1{,}25$ A (25 Ω), $\dfrac{31{,}25}{15} \approx 2{,}083$ A (15 Ω) e $\dfrac{31{,}25}{25} = 1{,}25$ A (os 25 Ω de baixo). Somando: $I \approx 4{,}583$ A. É a corrente que passa pelo $45\ \Omega$ (série).

**Passo 3: o voltímetro.**
$$V = 45\times4{,}583 \approx 206{,}25\ \text{V}.$$`,
            passo: 1,
          },
          {
            titulo: '(b) A resistência equivalente',
            texto: r`**O que se pede.** A resistência equivalente do circuito todo, vista pela bateria.

**A ideia.** Combinar os resistores pelas regras de associação, que saem de $V = RI$ (formulário):
- em **série**, a corrente é a mesma e as tensões somam: $R = R_1 + R_2 + \cdots$;
- em **paralelo**, a tensão é a mesma e as correntes somam: $\dfrac1R = \dfrac1{R_1} + \dfrac1{R_2} + \cdots$.

**A conta.**
- O ramo de baixo do bloco: $15 + 10 = 25\ \Omega$ (série).
- O bloco: $\dfrac{1}{R_p} = \dfrac1{25} + \dfrac1{15} + \dfrac1{25} = 0{,}04 + 0{,}0667 + 0{,}04 = 0{,}1467$, logo $R_p \approx 6{,}82\ \Omega$.
- Em série com $45\ \Omega$ e $35\ \Omega$:
$$R_\text{eq} = 45 + 35 + 6{,}82 \approx 86{,}8\ \Omega.$$

**Conferindo.** $R_p$ é menor que o menor dos ramos ($15\ \Omega$), como sempre acontece em paralelo. E $\dfrac{V_p}{I} = \dfrac{31{,}25}{4{,}583} \approx 6{,}82\ \Omega$ bate.`,
            passo: 2,
          },
          {
            titulo: '(c) A fem da bateria',
            texto: r`**O que se pede.** A força eletromotriz $\varepsilon$ da bateria (ideal, sem resistência interna).

**A ideia.** Bateria ideal: a tensão nos terminais é a própria fem. Ela alimenta a resistência equivalente com a corrente total. Pela lei de Ohm (formulário), $\varepsilon = R_\text{eq}I$.

**A conta.** Com $I \approx 4{,}583$ A (item a) e $R_\text{eq} \approx 86{,}82\ \Omega$ (item b):
$$\varepsilon \approx 86{,}82\times4{,}583 \approx 398\ \text{V}.$$

**Conferindo pela soma das tensões.** Ao longo da malha: $45I + 35I + V_p = 206{,}25 + 160{,}4 + 31{,}25 \approx 398$ V. Mesmo valor.`,
            passo: 2,
          },
          {
            titulo: '(d) A potência dissipada',
            texto: r`**O que se pede.** A potência total dissipada nos resistores.

**A ideia.** A potência que uma fonte entrega é $P = \varepsilon I$ (energia por carga × carga por tempo). Com bateria ideal, toda ela é dissipada nos resistores. Também vale $P = R_\text{eq}I^2$, que dá o mesmo.

**A conta.**
$$P = \varepsilon I \approx 398\times4{,}583 \approx 1{,}82\times10^3\ \text{W}.$$
Cerca de 1,8 kW.

**Conferindo resistor por resistor.** $45I^2 \approx 945$ W, $35I^2 \approx 735$ W, e no bloco $V_pI \approx 143$ W. Soma: $\approx 1823$ W.`,
            passo: 2,
          },
        ],
        resultado: r`$V = 206{,}25$ V; $R_\text{eq} \approx 86{,}8\ \Omega$; $\varepsilon \approx 398$ V; $P \approx 1{,}82$ kW.`,
        errosComuns: ['Esquecer que o 15 Ω de baixo está em série com o 10 Ω.'],
        oficial: { resposta: 'V = 206,25 V; R_eq ≈ 86,81 Ω; ε ≈ 397,9 V; P ≈ 1,82 kW.' },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Fácil',
      titulo: 'fem e resistência interna pelo gráfico V × I',
      resumo: 'V = ε − rI: inclinação −r = −2 Ω e ε = 16 V.',
      figura: [
        { pagina: 2, recorte: [0.08, 0.804, 0.936, 0.865] },
        { pagina: 3, recorte: [0.08, 0.058, 0.936, 0.242] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Rv', rotulo: 'Resistência variável', simbolo: 'R', valor: 6, unidade: 'Ω', min: 0.2, max: 20, passo: 0.1 },
        { id: 'E0', rotulo: 'fem da bateria', simbolo: r`\varepsilon`, valor: 16, unidade: 'V', min: 16, max: 16, passo: 0.1 },
        { id: 'r0', rotulo: 'Resistência interna', simbolo: 'r', valor: 2, unidade: 'Ω', min: 2, max: 2, passo: 0.1 },
      ],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'R', R: 'Rv + r0', fem: 'E0', rotulo: 'bateria (ε, r) e R' }],
      medidas: [
        { rotulo: 'Leitura do amperímetro', simbolo: 'I', expr: "I('c')", unidade: 'A', teoria: 'E0/(Rv + r0)' },
        { rotulo: 'Leitura do voltímetro', simbolo: 'V = IR', expr: "I('c')*Rv", unidade: 'V', teoria: "E0 - r0*I('c')" },
        { rotulo: 'r pelos pontos (2 A, 12 V) e (5 A, 6 V)', simbolo: r`r = -\frac{\Delta V}{\Delta I}`, expr: '(12 - 6)/(5 - 2)', unidade: 'Ω' },
        { rotulo: 'ε pelo ponto (2 A, 12 V)', simbolo: r`\varepsilon = V + rI`, expr: '12 + 2*2', unidade: 'V' },
      ],
      graficos: [
        {
          titulo: 'V × I nos terminais',
          tipo: 'perfil',
          x: { variavel: 'ii', de: 1, ate: 6, rotulo: 'I', unidade: 'A', marca: "I('c')" },
          series: [{ rotulo: 'V', expr: 'E0 - r0*ii', unidade: 'V' }],
        },
      ],
      passos: [
        {
          titulo: 'A reta',
          texto: r`Com resistência interna, a ddp nos terminais é $V = \varepsilon - rI$: uma reta de inclinação $-r$ que corta o eixo $V$ em $\varepsilon$. Mude $R$ e veja o ponto andar sobre ela.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Ler o gráfico',
          texto: r`Dos pontos $(2\ \text{A}, 12\ \text{V})$ e $(5\ \text{A}, 6\ \text{V})$: $r = \dfrac{12 - 6}{5 - 2} = 2\ \Omega$. Então $\varepsilon = 12 + 2\cdot2 = 16$ V. Com $R = 6\ \Omega$ a cena reproduz o primeiro ponto.`,
          parametros: { Rv: 6 },
          medidas: [2, 3, 0, 1],
        },
        { titulo: 'Outro ponto', texto: r`Com $R = 1{,}2\ \Omega$: $I = 16/3{,}2 = 5$ A e $V = 6$ V, o último ponto do gráfico.`, parametros: { Rv: 1.2 }, medidas: [0, 1] },
      ],
      respostas: [{ item: 'ε e r', texto: r`$\varepsilon = 16$ V e $r = 2\ \Omega$` }],
      resolucao: {
        conceitos: [{ texto: 'fem e resistência interna', lab: 'continua' }],
        etapas: [
          {
            titulo: 'ε e r pelo gráfico V × I',
            texto: r`**O que se pede.** A fem $\varepsilon$ e a resistência interna $r$ da bateria, a partir do gráfico da tensão $V$ medida nos terminais contra a corrente $I$, variando o resistor externo $R$.

**A ideia: o modelo de bateria real.** Uma bateria real é uma fonte ideal de fem $\varepsilon$ em série com uma pequena resistência interna $r$. Com corrente $I$, parte da fem "se perde" dentro dela, na queda $rI$ (formulário: $V = RI$). A tensão que sobra nos terminais é
$$V = \varepsilon - rI.$$
No gráfico $V\times I$, isso é uma **reta**:
- a inclinação é $-r$;
- o ponto em que ela corta o eixo $V$ (com $I = 0$, circuito aberto) é $\varepsilon$.

**A conta.** Do gráfico, dois pontos: $(2\ \text{A},\ 12\ \text{V})$ e $(5\ \text{A},\ 6\ \text{V})$.
- **Inclinação:**
$$-r = \frac{6 - 12}{5 - 2} = -2\ \Omega\quad\Rightarrow\quad r = 2\ \Omega.$$
- **fem**, pelo primeiro ponto:
$$\varepsilon = V + rI = 12 + 2\times2 = 16\ \text{V}.$$

**Conferindo com o outro ponto.** $16 - 2\times5 = 6$ V. Confere.

**Cuidado.** A fem **não** é a maior tensão desenhada no gráfico: é a tensão com corrente zero, onde a reta encontra o eixo vertical.`,
            passo: 1,
          },
        ],
        resultado: r`$\varepsilon = 16$ V, $r = 2\ \Omega$.`,
        errosComuns: ['Ler $\\varepsilon$ como a maior tensão do gráfico (12 V): a fem é a tensão com corrente nula.'],
        oficial: { resposta: 'r = 2 Ω; ε = 16 V.' },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Fácil',
      titulo: 'Potência máxima no resistor variável',
      resumo: 'P = ε²R/(R + r)² é máxima em R = r = 2 Ω, com P = ε²/4r = 32 W.',
      figura: { pagina: 3, recorte: [0.08, 0.243, 0.936, 0.275] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Rv', rotulo: 'Resistência variável', simbolo: 'R', valor: 6, unidade: 'Ω', min: 0.2, max: 12, passo: 0.1 },
        { id: 'E0', rotulo: 'fem da bateria', simbolo: r`\varepsilon`, valor: 16, unidade: 'V', min: 16, max: 16, passo: 0.1 },
        { id: 'r0', rotulo: 'Resistência interna', simbolo: 'r', valor: 2, unidade: 'Ω', min: 2, max: 2, passo: 0.1 },
      ],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'R', R: 'Rv + r0', fem: 'E0', rotulo: 'bateria (ε, r) e R' }],
      medidas: [
        { rotulo: 'Potência em R', simbolo: r`P = I^2R`, expr: "I('c')^2*Rv", unidade: 'W', teoria: 'E0^2*Rv/(Rv + r0)^2' },
        { rotulo: 'Potência máxima possível', simbolo: r`\frac{\varepsilon^2}{4r}`, expr: 'E0^2/(4*r0)', unidade: 'W' },
      ],
      graficos: [
        {
          titulo: 'Potência em R',
          tipo: 'perfil',
          x: { variavel: 'RR', de: 0.1, ate: 12, rotulo: 'R', unidade: 'Ω', marca: 'Rv' },
          series: [{ rotulo: 'P', expr: 'E0^2*RR/(RR + r0)^2', unidade: 'W' }],
        },
      ],
      passos: [
        {
          titulo: 'A curva',
          texto: r`$P = I^2R = \dfrac{\varepsilon^2R}{(R + r)^2}$. Com $R \to 0$ não há tensão em $R$; com $R \to \infty$ não há corrente. No meio, um máximo.`,
          parametros: { Rv: 6 },
          medidas: [0],
        },
        {
          titulo: 'O máximo',
          texto: r`$\dfrac{dP}{dR} = \varepsilon^2\dfrac{(R + r) - 2R}{(R + r)^3} = 0$ dá $R = r = 2\ \Omega$, com $P = \dfrac{\varepsilon^2}{4r} = 32$ W.`,
          parametros: { Rv: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'Conferindo R = r/4',
          texto: r`O gabarito da monitoria dá $R = r/4 = 0{,}5\ \Omega$. Ali a potência é só $\dfrac{4\varepsilon^2}{25r} \approx 20$ W, abaixo do máximo de 32 W.`,
          parametros: { Rv: 0.5 },
          medidas: [0, 1],
        },
      ],
      respostas: [{ item: 'R', texto: r`$R = r = 2\ \Omega$ (potência de 32 W)` }],
      resolucao: {
        conceitos: [{ texto: 'Máxima transferência de potência', lab: 'continua' }],
        etapas: [
          {
            titulo: 'R que maximiza a potência no resistor',
            texto: r`**O que se pede.** No circuito do exercício 11 (bateria com $\varepsilon = 16$ V e $r = 2\ \Omega$, ligada a um resistor variável $R$), o valor de $R$ para o qual a potência dissipada **no resistor** é máxima.

**A ideia.** Escrever a potência em $R$ como função de $R$ e achar o máximo, com a derivada igual a zero.
- A corrente: $R$ e $r$ estão em série, então pela lei de Ohm (formulário), $I = \dfrac{\varepsilon}{R + r}$.
- A potência num resistor é $P = I^2R$ (tensão × corrente, com $V = RI$).
$$P(R) = \frac{\varepsilon^2R}{(R + r)^2}.$$

**Por que há um máximo.** Com $R = 0$ a corrente é grande, mas não há resistor para dissipar: $P = 0$. Com $R \to \infty$ não passa corrente: $P \to 0$. Entre os dois extremos, a potência tem de passar por um máximo.

**A conta.** Pela regra do quociente:
$$\frac{dP}{dR} = \varepsilon^2\,\frac{(R + r)^2 - R\cdot2(R + r)}{(R + r)^4} = \varepsilon^2\,\frac{r - R}{(R + r)^3}.$$
Ela é zero quando
$$R = r = 2\ \Omega.$$
(Antes disso a derivada é positiva e depois, negativa: é um máximo.) A potência máxima:
$$P_\text{máx} = \frac{\varepsilon^2r}{(2r)^2} = \frac{\varepsilon^2}{4r} = \frac{16^2}{8} = 32\ \text{W}.$$

**Sobre o gabarito.** O gabarito da monitoria dá $R = r/4 = 0{,}5\ \Omega$. Nesse valor, $P = \dfrac{256\times0{,}5}{2{,}5^2} \approx 20$ W, menos que os 32 W de $R = r$. O máximo é em $R = r$: é o **casamento de impedâncias**, a condição de máxima transferência de potência.`,
            passo: 1,
          },
        ],
        resultado: r`$R = r = 2\ \Omega$.`,
        errosComuns: ['Achar que a potência cresce sempre com $R$, ou sempre com a corrente.'],
        oficial: {
          resposta: 'R = r/4.',
          observacao: 'Divergência: a potência em R é máxima em R = r = 2 Ω (32 W). Em R = r/4 = 0,5 Ω ela vale cerca de 20 W, como o último passo mostra.',
        },
      },
    },
  ],
}

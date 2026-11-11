import type { ProvaInput } from '../../scenario/schema'

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
          { titulo: 'Arraste', texto: r`$v_d = I/neA$.`, passo: 0 },
          { titulo: 'Tempo', texto: r`$t = L/v_d$.`, passo: 1 },
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
          { titulo: 'Definição', texto: r`$Q = \int I\,dt$.`, passo: 0 },
          { titulo: 'Exponencial', texto: r`$\int_0^\infty e^{-t/\tau}dt = \tau$.`, passo: 0 },
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
          { titulo: 'Neutralidade', texto: r`$\rho = 0$.`, passo: 0 },
          { titulo: 'Somar', texto: r`$\vec J = \sum_i n_iq_i\vec v_i$.`, passo: 1 },
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
          { titulo: 'Período', texto: r`$T = 2\pi a_0/v$.`, passo: 0 },
          { titulo: 'Corrente', texto: r`$I = e/T$.`, passo: 0 },
          { titulo: 'Sinal', texto: r`Carga negativa inverte o sentido.`, passo: 2 },
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
          { titulo: 'R', texto: r`$\rho L/A$ com volume fixo.`, passo: 0 },
          { titulo: 'I, E, J', texto: r`$I = V/R$, $E = V/L$, $J = E/\rho$.`, passo: 1 },
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
          { titulo: 'Ohm local', texto: r`$J = E/\rho$ em cada região.`, passo: 0 },
          { titulo: 'Somar correntes', texto: r`Mesma ddp: paralelo.`, passo: 1 },
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
          { titulo: 'E', texto: r`$V/L$.`, passo: 0 },
          { titulo: 'J', texto: r`$E/\rho(s)$.`, passo: 1 },
          { titulo: 'I', texto: r`Integrar em anéis.`, passo: 2 },
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
          { titulo: 'Conservação', texto: r`A mesma $I$ por todo cilindro.`, passo: 0 },
          { titulo: 'Ohm', texto: r`$E = \rho J$.`, passo: 1 },
          { titulo: 'Integrar', texto: r`$\int ds/s$ dá o logaritmo.`, passo: 2 },
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
          { titulo: 'Fatiar', texto: r`$dR = \rho\,dx/\pi r^2$.`, passo: 0 },
          { titulo: 'Integrar', texto: r`Trocar $dx$ por $dr$.`, passo: 1 },
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
          { titulo: 'Topologia', texto: r`Três ramos em paralelo.`, passo: 0 },
          { titulo: 'Corrente total', texto: r`Da ddp do paralelo.`, passo: 1 },
          { titulo: 'O resto', texto: r`Série com 45 e 35 Ω.`, passo: 2 },
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
          { titulo: 'Modelo', texto: r`$V = \varepsilon - rI$.`, passo: 0 },
          { titulo: 'Inclinação e intercepto', texto: r`Dois pontos bastam.`, passo: 1 },
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
          { titulo: 'P(R)', texto: r`$\varepsilon^2R/(R + r)^2$.`, passo: 0 },
          { titulo: 'Derivar', texto: r`$dP/dR = 0 \Rightarrow R = r$.`, passo: 1 },
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

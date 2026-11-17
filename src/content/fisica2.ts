import type { Grafico } from '../ui/Plot'
import { PROVAS_F2 } from './fisica2Provas'

const r = String.raw

/**
 * Física II para a P2: oscilações, ondas e som. Os problemas vêm da lista de
 * problemas extras da P2, da revisão feita em sala em 13/11/2026 e das P2
 * anteriores (em `fisica2Provas.ts`); os enunciados estão reescritos e as
 * resoluções são desta bancada.
 */
export interface ProblemaF2 {
  id: string
  numero: string
  grupo: 'Revisão em sala (13/11/2026)' | 'Problemas extras da P2' | 'P2 2026/1' | 'P2 2025/2' | 'P2 2025/1'
  assunto: string
  titulo: string
  resumo: string
  enunciado: string
  graficos?: Grafico[]
  alternativas?: { letra: string; texto: string; correta?: boolean; porque: string }[]
  respostas: { item: string; texto: string }[]
  resolucao: {
    conceitos: { texto: string; lab?: string }[]
    etapas: { titulo: string; texto: string }[]
    resultado: string
    errosComuns: string[]
  }
}

const tempoOnda = (rotulo = 'Fase ωt') => ({ id: 'wt', rotulo, valor: 0, min: 0, max: 2 * Math.PI, passo: 0.01, unidade: 'rad', anima: 2.2 })

const EXTRAS: ProblemaF2[] = [
  /* ───────────────────────── Revisão 1 ───────────────────────── */
  {
    id: 'r1',
    numero: 'R1',
    grupo: 'Revisão em sala (13/11/2026)',
    assunto: 'Oscilador amortecido',
    titulo: 'Massa-mola perdendo energia',
    resumo: '40 oscilações em 4 s; 36,8% da energia em t = 2 s; com metade do amortecimento, 40 oscilações em vez de 20.',
    enunciado: r`Um sistema massa-mola oscila com frequência angular natural $\omega_0 = 20\pi$ rad/s. Por causa da resistência do meio, a energia mecânica diminui com o tempo segundo
$$E(t) = E_0\,e^{-0{,}5t},$$
em que $E_0$ é a energia inicial e $t$ está em segundos. O amortecimento é pequeno o bastante para a frequência angular da oscilação continuar praticamente igual a $\omega_0$.

(a) Quantas oscilações completas ocorrem em 4 s?

(b) Em que instante a energia chega a cerca de 36,8% da inicial? Use $e^{-1} \approx 0{,}368$.

(c) Se o coeficiente de amortecimento cair à metade, o número de oscilações até a energia chegar a 36,8% aumenta ou diminui? Justifique.`,
    graficos: [
      {
        titulo: 'Energia em função do tempo',
        x: { variavel: 't', de: 0, ate: 8, rotulo: 't (s)' },
        y: { de: 0, ate: 1.05, rotulo: 'E / E₀' },
        curvas: [
          { expr: 'exp(-g*t)', rotulo: 'E/E₀ = e^(−γt)' },
          { expr: '0.368', rotulo: '36,8% (e⁻¹)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'g', rotulo: 'Coeficiente de amortecimento γ', valor: 0.5, min: 0.1, max: 1.5, passo: 0.05, unidade: 's⁻¹' }],
      },
      {
        titulo: 'Deslocamento: 10 oscilações por segundo, com amplitude caindo',
        x: { variavel: 't', de: 0, ate: 4, rotulo: 't (s)' },
        y: { de: -1.05, ate: 1.05, rotulo: 'x / A₀' },
        curvas: [
          { expr: 'exp(-g*t/2)*cos(20*pi*t)', rotulo: 'x(t)' },
          { expr: 'exp(-g*t/2)', rotulo: 'envoltória e^(−γt/2)', cor: 'mute', tracejada: true },
          { expr: '0-exp(-g*t/2)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'g', rotulo: 'Coeficiente de amortecimento γ', valor: 0.5, min: 0.1, max: 1.5, passo: 0.05, unidade: 's⁻¹' }],
        amostras: 1600,
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$N = 40$ oscilações` },
      { item: '(b)', texto: r`$t = 2$ s` },
      { item: '(c)', texto: r`Aumenta: com $\gamma = 0{,}25$ s⁻¹ a energia leva 4 s para cair a 36,8%, e nesse tempo cabem 40 oscilações, contra 20 antes.` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Período e frequência angular' }, { texto: 'Oscilador fracamente amortecido' }],
      etapas: [
        {
          titulo: '(a) Quantas oscilações em 4 s',
          texto: r`**O que se pede.** Quantas voltas completas o oscilador faz em 4 segundos.

**A ideia.** Uma oscilação completa leva um **período** $T$. A frequência angular $\omega$ diz quantos radianos a fase avança por segundo, e uma oscilação completa é uma volta de $2\pi$ radianos. Então
$$T = \frac{2\pi}{\omega}.$$
O enunciado diz que o amortecimento é pequeno: a frequência continua $\omega_0$, e o amortecimento só diminui o tamanho das oscilações, não o ritmo delas.

**A conta.**
$$T = \frac{2\pi}{20\pi} = 0{,}1\ \text{s}.$$
Em 4 s, o número de períodos é
$$N = \frac{4\ \text{s}}{0{,}1\ \text{s}} = 40\ \text{oscilações}.$$

**Conferindo.** $T = 0{,}1$ s quer dizer 10 oscilações por segundo (frequência $f = 1/T = 10$ Hz). Em 4 s, 40. No segundo gráfico dá para contar 10 picos por segundo.`,
        },
        {
          titulo: '(b) Quando a energia chega a 36,8%',
          texto: r`**O que se pede.** O instante $t$ em que $E(t) = 0{,}368\,E_0$.

**A ideia.** A energia cai como uma **exponencial**: $E(t) = E_0e^{-0{,}5t}$. Para achar $t$, iguala-se a expressão ao valor pedido. O número $0{,}368$ foi escolhido de propósito: ele é $e^{-1}$, o que deixa a conta sem logaritmo.

**A conta.**
$$E_0e^{-0{,}5t} = 0{,}368\,E_0\quad\Rightarrow\quad e^{-0{,}5t} = e^{-1}.$$
Duas potências de $e$ iguais têm expoentes iguais:
$$-0{,}5t = -1\quad\Rightarrow\quad t = 2\ \text{s}.$$

**Interpretação.** Esse tempo, $1/\gamma$ (aqui $1/0{,}5 = 2$ s), é o **tempo de vida** da energia: é quanto ela leva para cair ao fator $1/e$. Em 2 s o oscilador fez $2/0{,}1 = 20$ oscilações. No primeiro gráfico, a curva cruza a linha tracejada de 36,8% em $t = 2$ s.`,
        },
        {
          titulo: '(c) Metade do amortecimento: mais ou menos oscilações?',
          texto: r`**O que se pede.** Se o coeficiente de amortecimento cair à metade, o número de oscilações até a energia chegar a 36,8% aumenta ou diminui?

**A ideia.** Escreva a energia como $E(t) = E_0e^{-\gamma t}$, com $\gamma$ o coeficiente de amortecimento. No enunciado, $\gamma = 0{,}5$ s⁻¹. Pelo item (b), a energia chega a $e^{-1} \approx 36{,}8\%$ quando $\gamma t = 1$, ou seja, em $t = 1/\gamma$. O ritmo das oscilações não muda ($T = 0{,}1$ s), porque o amortecimento continua pequeno.

**A conta.** Com metade do amortecimento, $\gamma' = 0{,}25$ s⁻¹:
$$\gamma't' = 1\quad\Rightarrow\quad t' = \frac{1}{0{,}25} = 4\ \text{s}.$$
O número de oscilações nesse tempo:
$$N' = \frac{4\ \text{s}}{0{,}1\ \text{s}} = 40,\qquad\text{contra}\qquad N = \frac{2\ \text{s}}{0{,}1\ \text{s}} = 20\ \text{antes}.$$

**Resposta.** **Aumenta** (dobra). Um amortecimento menor faz a energia cair mais devagar; como cada oscilação continua durando o mesmo tempo, cabem mais oscilações até a energia chegar a 36,8%. Mexa no controle do gráfico: com $\gamma$ menor, a curva cruza os 36,8% mais tarde.`,
        },
      ],
      resultado: r`(a) 40 oscilações. (b) $t = 2$ s. (c) Aumenta: de 20 para 40 oscilações.`,
      errosComuns: [
        r`Achar que o amortecimento muda o período: com amortecimento pequeno, ele só diminui a amplitude.`,
        r`Confundir a energia com a amplitude: a energia cai como $e^{-\gamma t}$, e a amplitude como $e^{-\gamma t/2}$, porque a energia é proporcional ao quadrado da amplitude.`,
      ],
    },
  },

  /* ───────────────────────── Revisão 2 ───────────────────────── */
  {
    id: 'r2',
    numero: 'R2',
    grupo: 'Revisão em sala (13/11/2026)',
    assunto: 'Efeito Doppler',
    titulo: 'Dois carros e uma sirene',
    resumo: 'Com A parado, B ouviria 635 Hz; como ouve 720 Hz, A vem a 40 m/s.',
    enunciado: r`Dois carros, A e B, andam numa estrada reta em sentidos opostos, aproximando-se um do outro. O carro A tem uma sirene que emite som de frequência 600 Hz. O carro B anda a 20 m/s em direção ao carro A. A velocidade do som no ar é 340 m/s, e o motorista de B percebe uma frequência de 720 Hz.

(a) Se o carro A estivesse parado, qual seria a frequência percebida por B?

(b) Determine o módulo da velocidade do carro A.`,
    graficos: [
      {
        titulo: 'Frequência ouvida por B em função da velocidade de A',
        x: { variavel: 'vA', de: 0, ate: 80, rotulo: 'velocidade de A (m/s)' },
        y: { de: 600, ate: 820, rotulo: 'frequência em B (Hz)' },
        curvas: [
          { expr: '600*(340 + vB)/(340 - vA)', rotulo: 'f′ = f (v + v_B)/(v − v_A)' },
          { expr: '720', rotulo: '720 Hz (medido)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'vB', rotulo: 'Velocidade de B', valor: 20, min: 0, max: 40, passo: 1, unidade: 'm/s' }],
        pontos: [
          { x: 0, y: 635.3, rotulo: 'A parado: 635 Hz' },
          { x: 40, y: 720, rotulo: '40 m/s' },
        ],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$f' = 600\cdot\dfrac{340 + 20}{340} \approx 635{,}3$ Hz` },
      { item: '(b)', texto: r`$v_A = 40$ m/s` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Efeito Doppler' }],
      etapas: [
        {
          titulo: '(a) Com o carro A parado',
          texto: r`**O que se pede.** A frequência que o motorista de B ouviria se a sirene (carro A) estivesse parada e só B se movesse em direção a ela.

**A ideia: efeito Doppler.** O som é uma onda que anda no ar com velocidade $v = 340$ m/s. A frequência que alguém ouve depende do movimento da **fonte** e do **observador** em relação ao ar:
- um observador que vai **ao encontro** das ondas cruza mais cristas por segundo: ouve uma frequência **maior**;
- uma fonte que se **aproxima** "espreme" as ondas na frente dela: o comprimento de onda diminui e a frequência ouvida aumenta.

A fórmula geral, para fonte e observador na mesma reta, é
$$f' = f\,\frac{v \pm v_\text{obs}}{v \mp v_\text{fonte}},$$
com os sinais escolhidos assim: **no numerador, $+$** se o observador se aproxima da fonte; **no denominador, $-$** se a fonte se aproxima do observador. Aproximação sempre **aumenta** a frequência.

**A conta.** Fonte parada ($v_\text{fonte} = 0$), observador B se aproximando a $v_B = 20$ m/s:
$$f' = 600\cdot\frac{340 + 20}{340} = 600\cdot\frac{360}{340} \approx 635{,}3\ \text{Hz}.$$

**Conferindo.** Maior que 600 Hz, como deve ser numa aproximação.`,
        },
        {
          titulo: '(b) A velocidade do carro A',
          texto: r`**O que se pede.** O módulo da velocidade de A, sabendo que B, de fato, ouve 720 Hz.

**A ideia.** Pelo item (a), só o movimento de B explicaria 635 Hz. B ouve mais (720 Hz) porque a fonte também vem ao encontro dele. Agora os dois se aproximam: observador se aproximando (**$+$** no numerador) e fonte se aproximando (**$-$** no denominador):
$$f' = f\,\frac{v + v_B}{v - v_A}.$$
A única incógnita é $v_A$.

**A conta.**
$$720 = 600\cdot\frac{340 + 20}{340 - v_A}\quad\Rightarrow\quad340 - v_A = \frac{600\cdot360}{720} = 300\quad\Rightarrow\quad v_A = 40\ \text{m/s}.$$

**Conferindo.** $600\cdot\dfrac{360}{300} = 720$ Hz. No gráfico, a curva passa por 720 Hz exatamente em $v_A = 40$ m/s.

**Cuidado com os sinais.** Um jeito de não errar: aproximação aumenta a frequência. Quem se aproxima aumenta o numerador (observador) ou diminui o denominador (fonte).`,
        },
      ],
      resultado: r`(a) $\approx 635$ Hz. (b) $v_A = 40$ m/s.`,
      errosComuns: [
        r`Trocar os sinais: o observador entra no numerador e a fonte no denominador; aproximação aumenta a frequência.`,
        r`Somar as velocidades e usar só a velocidade relativa: para o som, importa quem se move em relação ao ar.`,
      ],
    },
  },

  /* ───────────────────────── 1 ───────────────────────── */
  {
    id: 'p1',
    numero: '1',
    grupo: 'Problemas extras da P2',
    assunto: 'Movimento harmônico simples',
    titulo: 'Dobrar a amplitude de um MHS',
    resumo: 'A energia quadruplica, o período não muda e a velocidade máxima dobra.',
    enunciado: r`Se a amplitude do movimento harmônico simples de um sistema é duplicada, o que acontece com a energia mecânica total? E com o período? E com a velocidade máxima?`,
    graficos: [
      {
        titulo: 'Mesmo período, amplitude maior',
        x: { variavel: 't', de: 0, ate: 2, rotulo: 't (s)' },
        y: { de: -2.2, ate: 2.2, rotulo: 'x (cm)' },
        curvas: [
          { expr: 'A*cos(2*pi*t)', rotulo: 'amplitude A' },
          { expr: 'cos(2*pi*t)', rotulo: 'amplitude 1 cm (referência)', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'A', rotulo: 'Amplitude', valor: 2, min: 0.5, max: 2, passo: 0.1, unidade: 'cm' }],
      },
    ],
    respostas: [
      { item: 'Energia', texto: 'Quadruplica.' },
      { item: 'Período', texto: 'Não muda.' },
      { item: 'Velocidade máxima', texto: 'Dobra.' },
    ],
    resolucao: {
      conceitos: [{ texto: 'Movimento harmônico simples' }, { texto: 'Energia no MHS' }],
      etapas: [
        {
          titulo: 'Energia: quadruplica',
          texto: r`**O que se pede.** O que acontece com a energia mecânica total quando a amplitude $A$ dobra.

**A ideia.** No MHS, a posição é
$$x(t) = A\cos(\omega t + \varphi).$$
A energia mecânica é a soma da cinética com a potencial e **se conserva**. Num massa-mola, ela é $E = \tfrac12kx^2 + \tfrac12mv^2$. O jeito mais fácil de calculá-la é no ponto de **máximo afastamento**, $x = A$, onde o corpo para por um instante ($v = 0$) e toda a energia é potencial:
$$E = \frac12kA^2.$$

**A conta.** A energia é proporcional a $A^2$. Com $A \to 2A$:
$$E' = \frac12k(2A)^2 = 4\cdot\frac12kA^2 = 4E.$$

**Resposta.** A energia **quadruplica**. Vale para qualquer MHS, não só massa-mola: a energia é sempre proporcional ao quadrado da amplitude.`,
        },
        {
          titulo: 'Período: não muda',
          texto: r`**O que se pede.** O que acontece com o período.

**A ideia.** O período é o tempo de uma oscilação completa:
$$T = \frac{2\pi}{\omega}.$$
A frequência angular $\omega$ depende só do **sistema**, não de quanto ele foi afastado. No massa-mola, $\omega = \sqrt{k/m}$ (constante da mola e massa); no pêndulo simples, $\omega = \sqrt{g/L}$. Nenhuma das duas tem $A$.

**Resposta.** O período **não muda**. Com amplitude maior, o corpo percorre um caminho maior, mas também anda mais depressa, e as duas coisas se compensam exatamente. É essa propriedade que faz do pêndulo (com oscilações pequenas) um bom relógio. No gráfico, as duas curvas cruzam o zero nos mesmos instantes.`,
        },
        {
          titulo: 'Velocidade máxima: dobra',
          texto: r`**O que se pede.** O que acontece com a velocidade máxima.

**A ideia.** A velocidade é a derivada da posição:
$$v(t) = \frac{dx}{dt} = -\omega A\sin(\omega t + \varphi).$$
O seno oscila entre $-1$ e $1$, então a velocidade máxima (em módulo) é
$$v_\text{máx} = \omega A,$$
atingida quando o corpo passa pelo ponto de equilíbrio.

**A conta.** Como $\omega$ não muda (item anterior), $v_\text{máx}$ é proporcional a $A$: com $A \to 2A$, $v_\text{máx} \to 2v_\text{máx}$.

**Resposta.** A velocidade máxima **dobra**. **Conferindo com a energia:** no equilíbrio toda a energia é cinética, $E = \tfrac12mv_\text{máx}^2$. Velocidade dobrada dá energia quadruplicada, como no primeiro item.`,
        },
      ],
      resultado: r`$E \to 4E$; $T$ igual; $v_\text{máx} \to 2v_\text{máx}$.`,
      errosComuns: [r`Achar que um balanço maior demora mais: no MHS o período não depende da amplitude.`, r`Dizer que a energia dobra: ela depende de $A^2$.`],
    },
  },

  /* ───────────────────────── 2 ───────────────────────── */
  {
    id: 'p2',
    numero: '2',
    grupo: 'Problemas extras da P2',
    assunto: 'Oscilador amortecido',
    titulo: 'De um décimo a um centésimo da energia',
    resumo: 'Se cai a 1/10 em 15 s, cai a 1/100 em 30 s: mais 15 s.',
    enunciado: r`A energia mecânica média de um oscilador amortecido cai a um décimo do valor inicial em 15 segundos. Quantos segundos **a mais** ela levará para cair a um centésimo do valor inicial?`,
    graficos: [
      {
        titulo: 'A energia cai pelo mesmo fator a cada 15 s',
        x: { variavel: 't', de: 0, ate: 40, rotulo: 't (s)' },
        y: { de: 0, ate: 1.05, rotulo: 'E / E₀' },
        curvas: [{ expr: 'exp(-ln(10)*t/15)', rotulo: 'E/E₀ = e^(−γt)' }],
        pontos: [
          { x: 15, y: 0.1, rotulo: '1/10 em 15 s' },
          { x: 30, y: 0.01, rotulo: '1/100 em 30 s' },
        ],
      },
      {
        titulo: 'Em escala logarítmica, a queda vira uma reta',
        x: { variavel: 't', de: 0, ate: 40, rotulo: 't (s)' },
        y: { de: -2.8, ate: 0.1, rotulo: 'log₁₀(E/E₀)' },
        curvas: [{ expr: '0-t/15', rotulo: 'log₁₀(E/E₀) = −t/15' }],
        pontos: [
          { x: 15, y: -1, rotulo: '−1 (1/10)' },
          { x: 30, y: -2, rotulo: '−2 (1/100)' },
        ],
      },
    ],
    respostas: [{ item: 'Tempo a mais', texto: r`Mais 15 s (chega a 1/100 em $t = 30$ s).` }],
    resolucao: {
      conceitos: [{ texto: 'Oscilador fracamente amortecido' }, { texto: 'Decaimento exponencial' }],
      etapas: [
        {
          titulo: 'Tempo a mais para chegar a 1/100',
          texto: r`**O que se pede.** A energia cai a $1/10$ do valor inicial em 15 s. Quanto tempo **a mais** até cair a $1/100$?

**A ideia.** Num oscilador fracamente amortecido, a energia média cai **exponencialmente**:
$$\bar E(t) = E_0\,e^{-\gamma t},$$
com $\gamma$ o coeficiente de amortecimento. A propriedade-chave da exponencial: em intervalos de tempo **iguais**, ela cai pelo **mesmo fator**. Se em 15 s cai a $1/10$, nos 15 s seguintes cai mais $1/10$, chegando a $1/100$.

**A conta, com logaritmos.** Para $\bar E = E_0/10$ em 15 s:
$$e^{-15\gamma} = \frac1{10}\quad\Rightarrow\quad15\gamma = \ln10\quad\Rightarrow\quad\gamma = \frac{\ln10}{15\ \text{s}}.$$
Para $\bar E = E_0/100$:
$$e^{-\gamma t} = \frac1{100}\quad\Rightarrow\quad\gamma t = \ln100 = 2\ln10\quad\Rightarrow\quad t = \frac{2\ln10}{\ln10/15\ \text{s}} = 30\ \text{s}.$$
(Usamos $\ln100 = \ln10^2 = 2\ln10$.)

**Resposta.** Ela chega a $1/100$ em $t = 30$ s, ou seja, **15 segundos a mais**.

**Repare.** Não foi preciso saber o valor de $\gamma$: $\ln 10 \approx 2{,}3$ cancelou. No segundo gráfico, com o logaritmo da energia, a queda vira uma reta: cada 15 s desce uma unidade (um fator 10).`,
        },
      ],
      resultado: r`Mais 15 s: a energia chega a 1/100 em 30 s.`,
      errosComuns: [r`Responder 30 s: esse é o tempo total desde o início, e a pergunta é quanto tempo a mais.`, r`Achar que a queda é linear (se em 15 s perdeu 90%, em mais 15 s perderia o resto).`],
    },
  },

  /* ───────────────────────── 3 ───────────────────────── */
  {
    id: 'p3',
    numero: '3',
    grupo: 'Problemas extras da P2',
    assunto: 'Movimento harmônico simples',
    titulo: 'Corpo pendurado numa mola',
    resumo: 'k = 245 N/m e ω ≈ 22,1 rad/s: y = (1 cm) cos(22,1 t); T ≈ 0,28 s, f ≈ 3,5 Hz, A = 1 cm.',
    enunciado: r`Um corpo de massa $m = 0{,}5$ kg está pendurado numa mola, que fica esticada 2 cm no equilíbrio. O corpo é puxado mais 1 cm para baixo e solto.

(a) Escolhendo um sistema de coordenadas conveniente, escreva a posição do corpo em função do tempo.

(b) Ache o período, a frequência e a amplitude do movimento.`,
    graficos: [
      {
        titulo: 'Posição medida a partir do equilíbrio (para baixo positivo)',
        x: { variavel: 't', de: 0, ate: 1, rotulo: 't (s)' },
        y: { de: -1.3, ate: 1.3, rotulo: 'y (cm)' },
        curvas: [{ expr: 'cos(sqrt(9.8/0.02)*t)', rotulo: 'y(t) = (1 cm) cos(22,1 t)' }],
        marcas: [{ x: 0.2838, rotulo: 'T ≈ 0,284 s' }],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$y(t) = (1\ \text{cm})\cos(22{,}1\,t)$, com $y$ medido a partir do equilíbrio, para baixo, e $t$ em segundos` },
      { item: '(b)', texto: r`$T \approx 0{,}284$ s, $f \approx 3{,}52$ Hz, $A = 1$ cm` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Lei de Hooke e equilíbrio' }, { texto: 'Movimento harmônico simples' }],
      etapas: [
        {
          titulo: '(a) A posição em função do tempo',
          texto: r`**O que se pede.** Uma equação $y(t)$ para a posição do corpo.

**Passo 1: a constante da mola.** No equilíbrio o corpo está parado, então a força da mola equilibra o peso. Pela lei de Hooke, a força da mola é $k$ vezes a deformação ($F = k\Delta y$):
$$k\Delta y = mg\quad\Rightarrow\quad k = \frac{mg}{\Delta y} = \frac{0{,}5\times9{,}8}{0{,}02} = 245\ \text{N/m}.$$

**Passo 2: a escolha das coordenadas.** O truque é medir $y$ **a partir do ponto de equilíbrio** (não do comprimento natural da mola), com $y$ positivo para baixo. Com essa escolha o peso some da equação: a força total sobre o corpo fica $-ky$, como numa mola horizontal. (O peso e a parte da força da mola que o equilibra se cancelam em qualquer posição.) Então o movimento é um MHS com
$$\omega = \sqrt{\frac km} = \sqrt{\frac{245}{0{,}5}} = \sqrt{490} \approx 22{,}1\ \text{rad/s}.$$
Repare que $\omega = \sqrt{g/\Delta y}$: a massa nem precisava ser dada.

**Passo 3: as condições iniciais.** Em $t = 0$ o corpo está 1 cm abaixo do equilíbrio ($y = +1$ cm) e **parado** (foi solto). Um cosseno começa no máximo com velocidade zero, então
$$y(t) = (1\ \text{cm})\cos(22{,}1\,t).$$

**Conferindo.** $y(0) = 1$ cm, e $\dfrac{dy}{dt}(0) = -22{,}1\sin0 = 0$. Confere.`,
        },
        {
          titulo: '(b) Período, frequência e amplitude',
          texto: r`**O que se pede.** O período, a frequência e a amplitude do movimento.

**A ideia.** Com $y(t) = A\cos(\omega t)$:
- a **amplitude** é o afastamento máximo do equilíbrio, $A$;
- o **período** é o tempo de uma oscilação, $T = \dfrac{2\pi}{\omega}$;
- a **frequência** é o número de oscilações por segundo, $f = \dfrac1T$.

**A conta.** Com $\omega \approx 22{,}1$ rad/s do item (a):
$$T = \frac{2\pi}{22{,}1} \approx 0{,}284\ \text{s},\qquad f = \frac{1}{0{,}284} \approx 3{,}52\ \text{Hz}.$$
A amplitude é o quanto o corpo foi afastado do equilíbrio antes de ser solto (parado):
$$A = 1\ \text{cm}.$$

**Cuidado.** A amplitude não é 3 cm (a distensão total da mola): ela é medida a partir do **equilíbrio**, em torno do qual o corpo oscila, entre 1 cm acima e 1 cm abaixo dele.`,
        },
      ],
      resultado: r`$y(t) = (1\ \text{cm})\cos(22{,}1\,t)$; $T \approx 0{,}28$ s, $f \approx 3{,}5$ Hz, $A = 1$ cm.`,
      errosComuns: [r`Usar 3 cm como amplitude: o movimento é em torno do equilíbrio, não do comprimento natural.`, r`Medir $y$ a partir da mola relaxada e ter de carregar o peso na equação.`],
    },
  },

  /* ───────────────────────── 4 ───────────────────────── */
  {
    id: 'p4',
    numero: '4',
    grupo: 'Problemas extras da P2',
    assunto: 'Ondas estacionárias',
    titulo: 'A onda estacionária obedece à equação de onda',
    resumo: 'y = 2A sen kx cos ωt satisfaz ∂²y/∂x² = (1/v²) ∂²y/∂t² com v = ω/k.',
    enunciado: r`Mostre que a função de onda de uma onda estacionária satisfaz a equação diferencial das ondas.`,
    graficos: [
      {
        titulo: 'A estacionária como soma de duas ondas que viajam em sentidos opostos',
        x: { variavel: 'x', de: 0, ate: 2, rotulo: 'x / λ' },
        y: { de: -2.2, ate: 2.2, rotulo: 'y / A' },
        curvas: [
          { expr: '2*sin(2*pi*x)*cos(wt)', rotulo: 'soma: 2A sen kx cos ωt' },
          { expr: 'sin(2*pi*x - wt)', rotulo: 'indo para a direita', cor: 'pos', tracejada: true },
          { expr: 'sin(2*pi*x + wt)', rotulo: 'indo para a esquerda', cor: 'neg', tracejada: true },
        ],
        parametros: [tempoOnda()],
        marcas: [
          { x: 0.5, rotulo: 'nó' },
          { x: 1, rotulo: 'nó' },
          { x: 1.5, rotulo: 'nó' },
        ],
      },
    ],
    respostas: [{ item: 'Demonstração', texto: r`Com $y = 2A\sin kx\cos\omega t$: $\dfrac{\partial^2y}{\partial x^2} = -k^2y$ e $\dfrac{\partial^2y}{\partial t^2} = -\omega^2y$, então $\dfrac{\partial^2y}{\partial x^2} = \dfrac{1}{v^2}\dfrac{\partial^2y}{\partial t^2}$ com $v = \omega/k$.` }],
    resolucao: {
      conceitos: [{ texto: 'Equação de onda' }, { texto: 'Ondas estacionárias' }],
      etapas: [
        {
          titulo: 'Demonstração',
          texto: r`**O que se pede.** Mostrar que a função de uma onda estacionária satisfaz a equação de onda.

**A equação de onda.** Uma perturbação $y(x, t)$ que se propaga com velocidade $v$ obedece a
$$\frac{\partial^2y}{\partial x^2} = \frac{1}{v^2}\frac{\partial^2y}{\partial t^2}.$$
As derivadas **parciais**: $\partial/\partial x$ deriva em $x$ tratando $t$ como constante, e $\partial/\partial t$ deriva em $t$ tratando $x$ como constante. A do lado esquerdo mede a **curvatura** da corda; a do lado direito, a **aceleração** de cada ponto.

**A onda estacionária.** Ela é a soma de duas ondas iguais viajando em sentidos opostos (veja o gráfico):
$$A\sin(kx - \omega t) + A\sin(kx + \omega t) = 2A\sin kx\cos\omega t,$$
usando $\sin(a - b) + \sin(a + b) = 2\sin a\cos b$. Então
$$y(x, t) = 2A\sin kx\,\cos\omega t.$$
Cada ponto $x$ oscila no tempo com amplitude $2A\sin kx$; há pontos que nunca se movem (os **nós**, onde $\sin kx = 0$).

**Derivando em $x$** (o fator $\cos\omega t$ é constante):
$$\frac{\partial y}{\partial x} = 2Ak\cos kx\cos\omega t,\qquad\frac{\partial^2y}{\partial x^2} = -2Ak^2\sin kx\cos\omega t = -k^2y.$$

**Derivando em $t$** (o fator $\sin kx$ é constante):
$$\frac{\partial y}{\partial t} = -2A\omega\sin kx\sin\omega t,\qquad\frac{\partial^2y}{\partial t^2} = -2A\omega^2\sin kx\cos\omega t = -\omega^2y.$$

**Comparando.** Substituindo na equação de onda:
$$-k^2y = \frac{1}{v^2}\left(-\omega^2y\right)\quad\Longleftrightarrow\quad v^2 = \frac{\omega^2}{k^2}.$$
É verdade para todo $x$ e todo $t$, desde que
$$v = \frac\omega k,$$
que é justamente a velocidade das duas ondas que formam a estacionária ($v = \lambda f = \omega/k$). **Está demonstrado.**

**Uma observação.** A estacionária "não anda", mas é feita de duas ondas que andam, cada uma com velocidade $v$. É essa velocidade que aparece na equação.`,
        },
      ],
      resultado: r`$\partial_x^2y = -k^2y$ e $\partial_t^2y = -\omega^2y$: a equação de onda vale com $v = \omega/k$.`,
      errosComuns: [r`Derivar em $x$ e esquecer que o fator $\cos\omega t$ é constante nessa derivada (e vice-versa).`],
    },
  },

  /* ───────────────────────── 5 ───────────────────────── */
  {
    id: 'p5',
    numero: '5',
    grupo: 'Problemas extras da P2',
    assunto: 'Equação de onda',
    titulo: 'A onda a partir das condições iniciais',
    resumo: 'y = A cos kx cos ωt + B sen kx sen ωt = ½(A + B) cos(kx − ωt) + ½(A − B) cos(kx + ωt).',
    enunciado: r`Ondas são geradas numa corda a partir das condições iniciais
$$y(x, 0) = A\cos kx,\qquad\frac{\partial y}{\partial t}(x, 0) = kvB\sin kx,$$
em que $A$ e $B$ são constantes (amplitudes) e $v$ é a velocidade das ondas na corda. Determine a função de onda $y(x, t)$.`,
    graficos: [
      {
        titulo: 'A solução: duas ondas de amplitudes diferentes em sentidos opostos',
        x: { variavel: 'x', de: 0, ate: 2, rotulo: 'x / λ' },
        y: { de: -2.2, ate: 2.2, rotulo: 'y' },
        curvas: [
          { expr: 'A*cos(2*pi*x)*cos(wt) + B*sin(2*pi*x)*sin(wt)', rotulo: 'y(x, t)' },
          { expr: '(A + B)/2*cos(2*pi*x - wt)', rotulo: 'parte para a direita', cor: 'pos', tracejada: true },
          { expr: '(A - B)/2*cos(2*pi*x + wt)', rotulo: 'parte para a esquerda', cor: 'neg', tracejada: true },
        ],
        parametros: [
          { id: 'A', rotulo: 'A', valor: 1, min: -1, max: 1, passo: 0.05 },
          { id: 'B', rotulo: 'B', valor: 0.5, min: -1, max: 1, passo: 0.05 },
          tempoOnda(),
        ],
      },
    ],
    respostas: [
      {
        item: 'y(x, t)',
        texto: r`$y(x, t) = A\cos kx\cos\omega t + B\sin kx\sin\omega t = \dfrac{A + B}{2}\cos(kx - \omega t) + \dfrac{A - B}{2}\cos(kx + \omega t)$, com $\omega = kv$`,
      },
    ],
    resolucao: {
      conceitos: [{ texto: 'Equação de onda e solução de d’Alembert' }],
      etapas: [
        {
          titulo: 'y(x, t) a partir da forma e da velocidade iniciais',
          texto: r`**O que se pede.** A função $y(x, t)$ que satisfaz a equação de onda e as duas condições iniciais: a **forma** da corda em $t = 0$ e a **velocidade** de cada ponto em $t = 0$.

**A ideia.** A solução geral da equação de onda é a soma de uma onda indo para a direita e outra indo para a esquerda, com a mesma velocidade $v$ (solução de d'Alembert):
$$y(x, t) = f(x - vt) + g(x + vt).$$
Precisamos de **duas** condições (forma e velocidade iniciais) porque a equação tem derivada segunda no tempo, como a segunda lei de Newton: posição e velocidade iniciais determinam o movimento.

**Um palpite natural.** As condições têm $\cos kx$ e $\sin kx$, então tente funções do tipo $\cos kx$ e $\sin kx$ vezes funções do tempo. Com $\omega = kv$, experimente
$$y(x, t) = A\cos kx\cos\omega t + B\sin kx\sin\omega t.$$
Cada termo é uma onda estacionária, e estacionárias satisfazem a equação de onda (problema 4); a soma também satisfaz, porque a equação é **linear**.

**Conferindo a forma inicial** ($t = 0$, com $\cos0 = 1$ e $\sin0 = 0$):
$$y(x, 0) = A\cos kx.\ \checkmark$$

**Conferindo a velocidade inicial.** Derivando em $t$:
$$\frac{\partial y}{\partial t} = -A\omega\cos kx\sin\omega t + B\omega\sin kx\cos\omega t\quad\Rightarrow\quad\frac{\partial y}{\partial t}(x, 0) = B\omega\sin kx = kvB\sin kx.\ \checkmark$$

**Como ondas que viajam.** Usando $\cos a\cos b = \tfrac12[\cos(a - b) + \cos(a + b)]$ e $\sin a\sin b = \tfrac12[\cos(a - b) - \cos(a + b)]$:
$$y(x, t) = \frac{A + B}{2}\cos(kx - \omega t) + \frac{A - B}{2}\cos(kx + \omega t).$$
É uma onda de amplitude $\tfrac{A + B}{2}$ indo para a **direita** e outra de amplitude $\tfrac{A - B}{2}$ indo para a **esquerda**.

**Casos para conferir.** Se $B = A$, sobra só a onda para a direita; se $B = -A$, só a para a esquerda; se $B = 0$ (corda solta do repouso), uma estacionária. Mexa em $A$ e $B$ no gráfico.`,
        },
      ],
      resultado: r`$y = \tfrac{A + B}{2}\cos(kx - \omega t) + \tfrac{A - B}{2}\cos(kx + \omega t)$, $\omega = kv$.`,
      errosComuns: [r`Usar só a forma inicial e esquecer a velocidade inicial: sem ela, a solução não é única.`, r`Confundir o $B$ do enunciado com campo magnético: aqui ele é só uma amplitude.`],
    },
  },

  /* ───────────────────────── 6 ───────────────────────── */
  {
    id: 'p6',
    numero: '6',
    grupo: 'Problemas extras da P2',
    assunto: 'Ondas estacionárias',
    titulo: 'Estacionária numa corda fixa nas pontas',
    resumo: 'v = ω/k = 200 m/s e amplitude 0,25 cm de cada onda; nós a cada 125,7 cm; menor corda: 125,7 cm.',
    enunciado: r`A função de onda de uma onda estacionária numa corda fixa nas duas pontas é
$$y(x, t) = 0{,}5\sin(0{,}025x)\cos(500t),$$
com $y$ e $x$ em centímetros e $t$ em segundos.

(a) Calcule a velocidade e a amplitude das duas ondas que viajam e formam a onda estacionária.

(b) Qual a distância entre nós sucessivos na corda?

(c) Qual o menor comprimento possível da corda?

(Tipler, exercício 14.43.)`,
    graficos: [
      {
        titulo: 'A corda vibrando (nós a cada 125,7 cm)',
        x: { variavel: 'x', de: 0, ate: 380, rotulo: 'x (cm)' },
        y: { de: -0.6, ate: 0.6, rotulo: 'y (cm)' },
        curvas: [
          { expr: '0.5*sin(0.025*x)*cos(wt)', rotulo: 'y(x, t)' },
          { expr: '0.5*sin(0.025*x)', rotulo: 'envoltória', cor: 'mute', tracejada: true },
          { expr: '0-0.5*sin(0.025*x)', cor: 'mute', tracejada: true },
        ],
        parametros: [tempoOnda('Fase 500t')],
        marcas: [
          { x: 125.66, rotulo: 'nó' },
          { x: 251.33, rotulo: 'nó' },
        ],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$v = 200$ m/s; amplitude de cada onda: $0{,}25$ cm` },
      { item: '(b)', texto: r`$\lambda/2 = \pi/k \approx 125{,}7$ cm` },
      { item: '(c)', texto: r`$L_\text{mín} = \lambda/2 \approx 125{,}7$ cm $\approx 1{,}26$ m` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Ondas estacionárias' }, { texto: 'Número de onda e frequência angular' }],
      etapas: [
        {
          titulo: '(a) Velocidade e amplitude das ondas que viajam',
          texto: r`**O que se pede.** A velocidade e a amplitude das duas ondas que, somadas, dão a estacionária.

**A ideia.** Uma estacionária é a soma de duas ondas iguais em sentidos opostos (problema 4):
$$A\sin(kx - \omega t) + A\sin(kx + \omega t) = 2A\sin kx\cos\omega t.$$
Comparando com a função dada, identifica-se cada parte:
- o número de onda: $k = 0{,}025$ rad/cm;
- a frequência angular: $\omega = 500$ rad/s;
- a amplitude da estacionária: $2A = 0{,}5$ cm.

**A conta.** A velocidade de cada onda é
$$v = \frac\omega k = \frac{500}{0{,}025} = 20\,000\ \text{cm/s} = 200\ \text{m/s}.$$
A amplitude de cada onda é a metade da amplitude máxima da estacionária:
$$A = \frac{0{,}5}{2} = 0{,}25\ \text{cm}.$$

**Repare.** No ventre (ponto de máxima oscilação), as duas ondas se somam e dão $0{,}5$ cm; por isso cada uma tem só $0{,}25$ cm.`,
        },
        {
          titulo: '(b) A distância entre nós',
          texto: r`**O que se pede.** A distância entre dois nós vizinhos (pontos que não se movem).

**A ideia.** Os nós são os pontos onde $\sin(kx) = 0$, ou seja, $kx = 0, \pi, 2\pi, \dots$ Dois nós seguidos estão separados por $\Delta(kx) = \pi$, isto é,
$$\Delta x = \frac\pi k = \frac\lambda2,$$
meio comprimento de onda (com $\lambda = 2\pi/k$).

**A conta.**
$$\Delta x = \frac{\pi}{0{,}025} \approx 125{,}7\ \text{cm}.$$
No gráfico, as linhas tracejadas marcam os nós.

**Conferindo.** O comprimento de onda é $\lambda = 2\pi/k \approx 251$ cm, e a distância entre nós é metade dele. Entre dois nós vizinhos fica um **ventre**, o ponto que oscila com a amplitude máxima, $0{,}5$ cm.`,
        },
        {
          titulo: '(c) O menor comprimento possível da corda',
          texto: r`**O que se pede.** O menor comprimento que a corda pode ter para vibrar desse jeito.

**A ideia.** A corda está **fixa nas duas pontas**: as pontas têm de ser nós. Então o comprimento da corda tem de ser um número inteiro de distâncias entre nós: $L = n\,\dfrac\lambda2$, com $n = 1, 2, 3, \dots$ O menor é $n = 1$: a corda inteira forma um único "fuso" (o modo **fundamental**).

**A conta.**
$$L_\text{mín} = \frac\lambda2 \approx 125{,}7\ \text{cm} \approx 1{,}26\ \text{m}.$$`,
        },
      ],
      resultado: r`(a) 200 m/s e 0,25 cm. (b) 125,7 cm. (c) 125,7 cm.`,
      errosComuns: [r`Dar 0,5 cm como amplitude de cada onda: a estacionária soma duas ondas de 0,25 cm.`, r`Esquecer a conversão de unidades: $k$ está em rad/cm, então $\omega/k$ sai em cm/s.`],
    },
  },

  /* ───────────────────────── 7 ───────────────────────── */
  {
    id: 'p7',
    numero: '7',
    grupo: 'Problemas extras da P2',
    assunto: 'Ondas estacionárias',
    titulo: 'Corda com uma ponta fixa e outra livre',
    resumo: 'Em t = 0, nós em 0 e 2L/3, máximo +A em L/3 e −A em L. Em t = π/2ω a corda está reta e com velocidade máxima.',
    enunciado: r`Uma corda esticada de comprimento $L$ tem a ponta $x = 0$ fixa e a ponta $x = L$ livre. Ela vibra num de seus modos normais:
$$y(x, t) = A\sin\left(\frac{3\pi}{2L}x\right)\cos\omega t.$$

(a) Desenhe a configuração da corda em $t = 0$.

(b) Desenhe a configuração da corda em $t = \dfrac{\pi}{2\omega}$ e indique, com setas de tamanho proporcional, a velocidade dos pontos da corda.`,
    graficos: [
      {
        titulo: 'A corda e a velocidade de cada ponto (ponha a fase em ωt = 1,57 para o item b)',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.3, ate: 1.3, rotulo: 'y / A' },
        curvas: [
          { expr: 'sin(3*pi*x/2)*cos(wt)', rotulo: 'corda' },
          { expr: 'sin(3*pi*x/2)', rotulo: 'forma em t = 0', cor: 'mute', tracejada: true },
        ],
        setas: { expr: '0-sin(3*pi*x/2)*sin(wt)', quantas: 15, escala: 0.6, rotulo: 'velocidade (proporcional)' },
        parametros: [{ ...tempoOnda(), anima: 1.2 }],
        marcas: [
          { x: 1 / 3, rotulo: 'ventre' },
          { x: 2 / 3, rotulo: 'nó' },
          { x: 1, rotulo: 'ponta livre' },
        ],
      },
    ],
    respostas: [
      { item: '(a)', texto: r`$y = A\sin(3\pi x/2L)$: nós em $x = 0$ e $x = 2L/3$; máximo $+A$ em $x = L/3$; $-A$ na ponta livre, $x = L$.` },
      { item: '(b)', texto: r`A corda está reta ($y = 0$). A velocidade é $-A\omega\sin(3\pi x/2L)$: para baixo entre $0$ e $2L/3$ (máxima em $L/3$), para cima entre $2L/3$ e $L$ (máxima em $L$), zero nos nós.` },
    ],
    resolucao: {
      conceitos: [{ texto: 'Modos normais de uma corda' }, { texto: 'Ponta fixa e ponta livre' }],
      etapas: [
        {
          titulo: '(a) A forma da corda em t = 0',
          texto: r`**O que se pede.** O desenho da corda em $t = 0$.

**A ideia.** Em $t = 0$, $\cos(\omega\cdot0) = 1$, então a forma é
$$y(x, 0) = A\sin\left(\frac{3\pi x}{2L}\right).$$
Basta achar os pontos importantes, onde o seno vale $0$ ou $\pm1$.

**Os pontos.** Com $u = \dfrac{3\pi x}{2L}$ (o argumento do seno), conforme $x$ vai de $0$ a $L$, $u$ vai de $0$ a $\dfrac{3\pi}{2}$: três quartos de uma volta do seno.
- $x = 0$: $u = 0$, $y = 0$. É a ponta **fixa**: um **nó**, como tem de ser.
- $x = L/3$: $u = \pi/2$, $y = +A$. Um **ventre** (máximo).
- $x = 2L/3$: $u = \pi$, $y = 0$. Outro **nó**.
- $x = L$: $u = 3\pi/2$, $y = -A$. A ponta **livre** é um ventre: ali a corda tem inclinação zero.

**O desenho.** A corda sobe de $0$ até $+A$ em $L/3$, desce passando por zero em $2L/3$ e chega a $-A$ na ponta livre (a curva tracejada do gráfico).

**Por que esse modo.** Com uma ponta fixa e outra livre, a corda acomoda um número ímpar de quartos de comprimento de onda: aqui, $L = \tfrac34\lambda$ (é o segundo modo desse tipo de corda).`,
        },
        {
          titulo: '(b) A corda em t = π/2ω e as velocidades',
          texto: r`**O que se pede.** O desenho da corda em $t = \dfrac{\pi}{2\omega}$, com setas mostrando a velocidade de cada ponto.

**A forma.** Nesse instante, $\omega t = \pi/2$ e $\cos(\pi/2) = 0$:
$$y\left(x, \frac{\pi}{2\omega}\right) = 0\ \text{para todo }x.$$
A corda está **reta**, na posição de equilíbrio. É o instante em que ela passa pelo meio da oscilação.

**A velocidade.** Cada ponto se move só na vertical, com velocidade
$$\frac{\partial y}{\partial t} = -A\omega\sin\left(\frac{3\pi x}{2L}\right)\sin\omega t.$$
Em $\omega t = \pi/2$, $\sin\omega t = 1$:
$$v(x) = -A\omega\sin\left(\frac{3\pi x}{2L}\right).$$

**As setas.**
- Entre $0$ e $2L/3$ o seno é positivo: a velocidade é **para baixo**, máxima ($A\omega$) em $x = L/3$.
- Entre $2L/3$ e $L$ o seno é negativo: a velocidade é **para cima**, máxima ($A\omega$) na ponta livre.
- Nos nós ($x = 0$ e $x = 2L/3$), velocidade **zero**.

**Faz sentido.** Em $t = 0$ a parte da esquerda estava no alto e a da direita embaixo; um quarto de período depois, elas passam pelo meio indo para o outro lado, com velocidade máxima. É quando toda a energia é cinética. No gráfico, ponha a fase em $1{,}57$ (ou aperte "Animar").`,
        },
      ],
      resultado: r`(a) Nós em $0$ e $2L/3$; $+A$ em $L/3$, $-A$ em $L$. (b) Corda reta; velocidade $-A\omega\sin(3\pi x/2L)$, para baixo até $2L/3$ e para cima depois.`,
      errosComuns: [r`Pôr um nó na ponta livre: ali o deslocamento é máximo.`, r`Achar que a corda reta está parada: é o instante de velocidade máxima.`],
    },
  },

  /* ───────────────────────── 8 ───────────────────────── */
  {
    id: 'p8',
    numero: '8',
    grupo: 'Problemas extras da P2',
    assunto: 'Intensidade sonora',
    titulo: 'De 90 dB para 70 dB',
    resumo: 'Baixar 20 dB é dividir a intensidade por 100: eliminar 99% da potência.',
    enunciado: r`Que fração da potência acústica de um ruído precisaria ser eliminada para o nível de intensidade sonora cair de 90 dB para 70 dB? (Tipler, exercício 14.59.)`,
    graficos: [
      {
        titulo: 'Nível sonoro em função da fração de potência eliminada',
        x: { variavel: 'f', de: 0, ate: 1, rotulo: 'fração eliminada' },
        y: { de: 55, ate: 92, rotulo: 'nível (dB)' },
        curvas: [
          { expr: '90 + 10*log10(1 - f)', rotulo: 'β = 90 dB + 10 log(1 − fração)' },
          { expr: '70', rotulo: '70 dB', cor: 'mute', tracejada: true },
        ],
        amostras: 1000,
        pontos: [{ x: 0.99, y: 70, rotulo: '99%' }],
      },
    ],
    respostas: [{ item: 'Fração', texto: r`$99\%$ da potência: a intensidade final é $1/100$ da inicial.` }],
    resolucao: {
      conceitos: [{ texto: 'Nível de intensidade sonora em decibéis' }],
      etapas: [
        {
          titulo: 'Fração da potência a eliminar',
          texto: r`**O que se pede.** Quanto da potência sonora precisa ser retirada para o nível cair de 90 dB para 70 dB.

**A ideia: o decibel.** O ouvido percebe a intensidade de forma logarítmica, e o nível sonoro $\beta$ é definido por
$$\beta = (10\ \text{dB})\log_{10}\frac{I}{I_0},$$
em que $I$ é a intensidade (potência por área) e $I_0$ uma intensidade de referência (o limiar da audição). Cada **10 dB** a mais é intensidade **10 vezes** maior.

**A conta.** Subtraindo os níveis, $I_0$ some (diferença de logaritmos é logaritmo da razão):
$$\beta_2 - \beta_1 = (10\ \text{dB})\left(\log\frac{I_2}{I_0} - \log\frac{I_1}{I_0}\right) = (10\ \text{dB})\log\frac{I_2}{I_1}.$$
Com $\beta_2 - \beta_1 = 70 - 90 = -20$ dB:
$$\log\frac{I_2}{I_1} = -2\quad\Rightarrow\quad\frac{I_2}{I_1} = 10^{-2} = 0{,}01.$$
Para a mesma área, a potência é proporcional à intensidade: fica só 1% dela.

**Resposta.** É preciso eliminar $1 - 0{,}01 = 0{,}99$, ou seja, **99%** da potência.

**Interpretação.** Baixar 20 dB parece pouco, mas exige dividir a potência por 100. É por isso que reduzir ruído é difícil: no gráfico, o nível quase não cai até a fração eliminada passar de 90%.`,
        },
      ],
      resultado: r`Eliminar 99% da potência.`,
      errosComuns: [r`Achar que de 90 para 70 dB é cortar 22% (20/90): a escala é logarítmica.`],
    },
  },

  /* ───────────────────────── 9 ───────────────────────── */
  {
    id: 'p9',
    numero: '9',
    grupo: 'Problemas extras da P2',
    assunto: 'Pêndulo simples',
    titulo: 'Energia cinética de um pêndulo',
    resumo: 'K(t) = ½ mgL θ₀² sen²(√(g/L) t): as alternativas (a) e (c) são a mesma expressão.',
    enunciado: r`Um pêndulo é formado por um fio ideal de comprimento $L$ e uma partícula de massa $m$. Ele é afastado de um ângulo $\theta_0$ (no sentido positivo) da posição de equilíbrio e solto do repouso, fazendo pequenas oscilações que podem ser tratadas como harmônicas simples. Qual função dá a energia cinética em função do tempo? (Objetiva de segunda chamada.)`,
    alternativas: [
      { letra: 'a', texto: r`$K(t) = \tfrac12mgL\theta_0^2\sin^2\left(\sqrt{g/L}\,t\right)$`, correta: true, porque: r`Certa: é $\tfrac12mL^2\omega^2\theta_0^2\sin^2\omega t$ com $\omega^2 = g/L$.` },
      { letra: 'b', texto: r`$K(t) = \tfrac12m\dfrac{L^3}{g}\theta_0^2\sin^2\left(\sqrt{L/g}\,t\right)$`, porque: r`Troca $g/L$ por $L/g$: a frequência angular é $\sqrt{g/L}$, e a unidade nem é de energia.` },
      { letra: 'c', texto: r`$K(t) = \tfrac12mL^2\left(\dfrac gL\right)\theta_0^2\sin^2\left(\sqrt{g/L}\,t\right)$`, correta: true, porque: r`Também certa: $L^2\cdot g/L = gL$, a mesma expressão da (a), escrita sem simplificar.` },
      { letra: 'd', texto: r`$K(t) = \tfrac12mgL\theta_0^2\cos^2\left(\sqrt{g/L}\,t\right)$`, porque: r`Com cosseno, a energia cinética seria máxima em $t = 0$, mas o pêndulo foi solto do repouso: essa é a energia **potencial**.` },
    ],
    graficos: [
      {
        titulo: 'Cinética e potencial trocam energia; a soma é constante',
        x: { variavel: 'u', de: 0, ate: 2 * Math.PI, rotulo: '√(g/L)·t (rad)' },
        y: { de: 0, ate: 1.1, rotulo: 'energia / (½ mgLθ₀²)' },
        curvas: [
          { expr: 'sin(u)^2', rotulo: 'cinética K' },
          { expr: 'cos(u)^2', rotulo: 'potencial U', cor: 'neg' },
          { expr: '1', rotulo: 'total', cor: 'mute', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`(a), que é igual à (c): $K(t) = \tfrac12mgL\theta_0^2\sin^2\left(\sqrt{g/L}\,t\right)$` }],
    resolucao: {
      conceitos: [{ texto: 'Pêndulo simples' }, { texto: 'Energia no MHS' }],
      etapas: [
        {
          titulo: 'Alternativa: a energia cinética do pêndulo',
          texto: r`**O que se pede.** A energia cinética $K(t)$ do pêndulo solto do repouso no ângulo $\theta_0$.

**Passo 1: o movimento.** Para oscilações pequenas, o pêndulo simples faz um MHS no ângulo, com frequência angular
$$\omega = \sqrt{\frac gL}.$$
Solto do repouso em $\theta_0$, ele começa no máximo com velocidade zero, o que pede um cosseno:
$$\theta(t) = \theta_0\cos\omega t.$$

**Passo 2: a velocidade.** A partícula anda num arco de raio $L$; a velocidade é $L$ vezes a velocidade angular:
$$v = L\frac{d\theta}{dt} = -L\theta_0\omega\sin\omega t.$$

**Passo 3: a energia cinética.**
$$K = \frac12mv^2 = \frac12mL^2\theta_0^2\omega^2\sin^2\omega t = \frac12mL^2\left(\frac gL\right)\theta_0^2\sin^2\left(\sqrt{\frac gL}\,t\right).$$
Simplificando $L^2\cdot\dfrac gL = gL$:
$$K(t) = \frac12mgL\theta_0^2\sin^2\left(\sqrt{\frac gL}\,t\right).$$

**As alternativas.** A expressão sem simplificar é a (c); simplificada, é a (a). As duas são **a mesma função**: a questão, como está, tem duas alternativas certas.

**Conferindo pela energia.** Em $t = 0$ (repouso), $K = 0$, e toda a energia é potencial gravitacional: com a altura $L(1 - \cos\theta_0) \approx L\theta_0^2/2$ para ângulo pequeno, $U = mgL\theta_0^2/2$. Na passagem pelo ponto mais baixo, $K$ chega a esse mesmo valor máximo, $\tfrac12mgL\theta_0^2$.`,
        },
      ],
      resultado: r`$K(t) = \tfrac12mgL\theta_0^2\sin^2(\sqrt{g/L}\,t)$: alternativas (a) e (c), que são iguais.`,
      errosComuns: [r`Escolher o cosseno: solto do repouso, a energia cinética começa em zero.`, r`Usar $\omega = \sqrt{L/g}$, invertido.`],
    },
  },

  /* ───────────────────────── 10 ───────────────────────── */
  {
    id: 'p10',
    numero: '10',
    grupo: 'Problemas extras da P2',
    assunto: 'Movimento harmônico simples',
    titulo: 'Amplitude e fase pelo gráfico',
    resumo: 'Começa no zero descendo: A = 4 cm e δ = π/2.',
    enunciado: r`O movimento de uma partícula, $x(t) = A\cos(\omega t + \delta)$, aparece no gráfico abaixo (o tracejado): ele começa em $x = 0$ em $t = 0$, desce até $-4$ cm em $t = 0{,}25$ s, volta a zero em $0{,}5$ s e chega a $+4$ cm em $0{,}75$ s. Dele deduzimos que: (Objetiva da P2.)`,
    alternativas: [
      { letra: 'a', texto: r`$A = 4$ cm e $\delta = \pi$`, porque: r`Com $\delta = \pi$, $x(0) = 4\cos\pi = -4$ cm: começaria no mínimo, não no zero.` },
      { letra: 'b', texto: r`$A = 4$ cm e $\delta = \pi/2$`, correta: true, porque: r`Certa: $x(0) = 0$ e $v(0) = -A\omega\sin(\pi/2) < 0$, descendo.` },
      { letra: 'c', texto: r`$A = -4$ cm e $\delta = \pi/4$`, porque: r`A amplitude é positiva por definição, e com $\delta = \pi/4$ a curva não começaria no zero.` },
      { letra: 'd', texto: r`$A = 4$ cm e $\delta = -\pi/2$`, porque: r`Também começa no zero, mas **subindo**: $v(0) = -A\omega\sin(-\pi/2) > 0$.` },
      { letra: 'e', texto: r`$A = 4$ cm e $\delta = 0$`, porque: r`Com $\delta = 0$, começaria no máximo, $+4$ cm.` },
    ],
    graficos: [
      {
        titulo: 'Ajuste a fase δ até a curva cobrir a do problema',
        x: { variavel: 't', de: 0, ate: 1.25, rotulo: 't (s)' },
        y: { de: -6, ate: 6, rotulo: 'x (cm)' },
        curvas: [
          { expr: '4*cos(2*pi*t + d)', rotulo: 'x = 4 cos(2πt + δ)' },
          { expr: '4*cos(2*pi*t + pi/2)', rotulo: 'o gráfico do problema', cor: 'mute', tracejada: true },
        ],
        parametros: [{ id: 'd', rotulo: 'Fase δ', valor: 0, min: -Math.PI, max: Math.PI, passo: 0.01, unidade: 'rad' }],
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`(b): $A = 4$ cm e $\delta = \pi/2$` }],
    resolucao: {
      conceitos: [{ texto: 'Movimento harmônico simples: amplitude e fase' }],
      etapas: [
        {
          titulo: 'Alternativa: amplitude e fase inicial',
          texto: r`**O que se pede.** A amplitude $A$ e a fase $\delta$ de $x(t) = A\cos(\omega t + \delta)$, lendo o gráfico.

**A amplitude.** É o afastamento máximo do zero: a curva vai de $-4$ a $+4$ cm, então
$$A = 4\ \text{cm}.$$
Por convenção, a amplitude é **positiva**: o sinal fica por conta da fase.

**O período (para conferir).** De um zero descendo ($t = 0$) ao próximo zero descendo ($t = 1$ s) passa uma oscilação: $T = 1$ s e $\omega = 2\pi$ rad/s.

**A fase, pelo instante inicial.** Em $t = 0$:
- a posição é zero: $x(0) = A\cos\delta = 0$, então $\cos\delta = 0$, o que dá $\delta = \pi/2$ **ou** $\delta = -\pi/2$;
- para decidir, olhe para onde a curva vai: ela **desce**. A velocidade é $v(t) = -A\omega\sin(\omega t + \delta)$, e em $t = 0$, $v(0) = -A\omega\sin\delta$. Para ser negativa (descendo), $\sin\delta > 0$, então
$$\delta = \frac\pi2.$$

**Conferindo.** $x(t) = 4\cos(2\pi t + \pi/2) = -4\sin(2\pi t)$: em $t = 0{,}25$ s, $x = -4$ cm, como no gráfico. Mexa na fase no gráfico interativo: só com $\delta \approx 1{,}57$ ($\pi/2$) a curva cobre a do problema.

**Resposta.** Alternativa **(b)**.`,
        },
      ],
      resultado: r`$A = 4$ cm e $\delta = \pi/2$: alternativa **(b)**.`,
      errosComuns: [r`Parar em $\cos\delta = 0$ e escolher $-\pi/2$: é preciso olhar se a curva sobe ou desce.`],
    },
  },

  /* ───────────────────────── 11 ───────────────────────── */
  {
    id: 'p11',
    numero: '11',
    grupo: 'Problemas extras da P2',
    assunto: 'Oscilações forçadas',
    titulo: 'Afirmações sobre oscilações forçadas',
    resumo: 'Só a II é verdadeira: alternativa (g).',
    enunciado: r`Considere as afirmações abaixo sobre oscilações forçadas amortecidas, com força externa $F = F_0\cos(\omega t)$ e frequência natural $\omega_0$. (Objetiva da P2.)

I. Para uma dada amplitude $F_0$, a solução estacionária na ressonância pode ter amplitude no máximo 4 vezes a amplitude de oscilação no limite $\omega \to 0$.

II. Para $\omega \gg \omega_0$, o sistema responde com amplitude baixa.

III. Com amortecimento fraco e frequência baixa ($\omega \ll \omega_0$), o movimento está em oposição de fase com a força externa.

Quais estão corretas?`,
    alternativas: [
      { letra: 'a', texto: 'Nenhuma.', porque: r`A II é correta.` },
      { letra: 'b', texto: 'I, II e III.', porque: r`I e III são falsas.` },
      { letra: 'c', texto: 'Apenas I e II.', porque: r`A I é falsa: o fator na ressonância é o fator de qualidade $Q$, sem limite.` },
      { letra: 'd', texto: 'Apenas I e III.', porque: r`As duas são falsas.` },
      { letra: 'e', texto: 'Apenas II e III.', porque: r`A III é falsa: em baixa frequência o movimento acompanha a força, em fase.` },
      { letra: 'f', texto: 'Apenas I.', porque: r`A I é falsa.` },
      { letra: 'g', texto: 'Apenas II.', correta: true, porque: r`Certa: muito acima da ressonância, a massa não consegue acompanhar a força e a amplitude cai como $1/\omega^2$.` },
      { letra: 'h', texto: 'Apenas III.', porque: r`A III é falsa.` },
    ],
    graficos: [
      {
        titulo: 'Amplitude da resposta, em unidades da amplitude com ω → 0',
        x: { variavel: 'r', de: 0, ate: 3, rotulo: 'ω / ω₀' },
        y: { de: 0, ate: 12, rotulo: 'A(ω) / A(0)' },
        curvas: [{ expr: '1/sqrt((1 - r^2)^2 + (r/Q)^2)', rotulo: 'amplitude relativa' }, { expr: '4', rotulo: 'o "máximo" da afirmação I', cor: 'mute', tracejada: true }],
        parametros: [{ id: 'Q', rotulo: 'Fator de qualidade Q (amortecimento menor → Q maior)', valor: 8, min: 0.5, max: 10, passo: 0.1 }],
        amostras: 800,
      },
      {
        titulo: 'Atraso de fase do movimento em relação à força',
        x: { variavel: 'r', de: 0, ate: 3, rotulo: 'ω / ω₀' },
        y: { de: 0, ate: 1.05, rotulo: 'atraso / π' },
        curvas: [{ expr: 'atan2(r/Q, 1 - r^2)/pi', rotulo: '0 = em fase; 1 = oposição de fase' }],
        parametros: [{ id: 'Q', rotulo: 'Fator de qualidade Q', valor: 8, min: 0.5, max: 10, passo: 0.1 }],
        amostras: 800,
      },
    ],
    respostas: [{ item: 'Alternativa', texto: r`(g): apenas a II é correta.` }],
    resolucao: {
      conceitos: [{ texto: 'Oscilador forçado e ressonância' }],
      etapas: [
        {
          titulo: 'Alternativa: afirmação por afirmação',
          texto: r`**O que se pede.** Quais afirmações sobre o oscilador forçado amortecido estão corretas.

**A ideia: a resposta estacionária.** Depois que o transitório some, o oscilador vibra na frequência da **força** ($\omega$), com amplitude
$$A(\omega) = \frac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + (\gamma\omega)^2}},$$
em que $\gamma$ mede o amortecimento, e com um **atraso de fase** $\varphi$ em relação à força, dado por $\tan\varphi = \dfrac{\gamma\omega}{\omega_0^2 - \omega^2}$.

**Afirmação I: falsa.** Para $\omega \to 0$ (força quase parada), $A(0) = \dfrac{F_0}{m\omega_0^2} = \dfrac{F_0}{k}$: é só a mola esticada pela força. Na ressonância ($\omega \approx \omega_0$, amortecimento fraco), $A \approx \dfrac{F_0}{m\gamma\omega_0}$. A razão é
$$\frac{A(\omega_0)}{A(0)} = \frac{\omega_0}{\gamma} = Q,$$
o **fator de qualidade**. Ele não tem limite: quanto menor o amortecimento, maior. Pode ser 10, 100, 1000. Não há nenhum "máximo de 4". No gráfico, com $Q = 8$, o pico chega a 8.

**Afirmação II: verdadeira.** Com $\omega \gg \omega_0$, o termo $\omega^2$ domina e $A \approx \dfrac{F_0}{m\omega^2}$, que vai a zero. A força troca de sentido rápido demais e a massa, por inércia, quase não sai do lugar.

**Afirmação III: falsa.** Com $\omega \ll \omega_0$, $\tan\varphi \approx 0$: atraso **zero**, o movimento acompanha a força, **em fase** (a força puxa devagar e a mola cede junto). A oposição de fase ($\varphi = \pi$) acontece no outro extremo, com $\omega \gg \omega_0$. Veja no segundo gráfico.

**Resposta.** Só a II: alternativa **(g)**.`,
        },
      ],
      resultado: r`Apenas a II é correta: alternativa **(g)**.`,
      errosComuns: [r`Achar que em baixa frequência o movimento é oposto à força: a oposição de fase é em alta frequência.`],
    },
  },

  /* ───────────────────────── 12 ───────────────────────── */
  {
    id: 'p12',
    numero: '12',
    grupo: 'Problemas extras da P2',
    assunto: 'Efeito Doppler',
    titulo: 'Radar numa perseguição',
    resumo: 'O eco volta com f₀(c − u)(c + v_p)/[(c − v_p)(c + u)]: com v_p = u ele volta sem desvio, e o radar não mede nada.',
    enunciado: r`Um carro de polícia persegue um carro suspeito em alta velocidade. O policial tenta medir a velocidade do suspeito com um radar móvel baseado no efeito Doppler, que compara a frequência emitida pelo aparelho, $f_0$, com a da onda refletida pelo carro e recebida de volta. Mostre que, à medida que a velocidade da polícia se iguala à do carro da frente, essa medição fica inviável.`,
    graficos: [
      {
        titulo: 'Desvio de frequência do eco (radar de 10 GHz) em função da velocidade do suspeito',
        x: { variavel: 'u', de: 0, ate: 60, rotulo: 'velocidade do suspeito u (m/s)' },
        y: { de: -4500, ate: 4500, rotulo: 'f_eco − f₀ (Hz)' },
        curvas: [{ expr: '1e10*((3e8 - u)*(3e8 + vp)/((3e8 - vp)*(3e8 + u)) - 1)', rotulo: 'desvio do eco' }],
        parametros: [{ id: 'vp', rotulo: 'Velocidade da polícia', valor: 30, min: 0, max: 60, passo: 1, unidade: 'm/s' }],
      },
    ],
    respostas: [
      {
        item: 'Demonstração',
        texto: r`$f_\text{eco} = f_0\dfrac{(c - u)(c + v_p)}{(c - v_p)(c + u)} \approx f_0\left[1 + \dfrac{2(v_p - u)}{c}\right]$: só depende da velocidade relativa, e com $v_p = u$ dá $f_\text{eco} = f_0$, sem desvio para medir.`,
      },
    ],
    resolucao: {
      conceitos: [{ texto: 'Efeito Doppler com fonte e observador em movimento' }, { texto: 'Reflexão: o alvo vira fonte' }],
      etapas: [
        {
          titulo: 'Demonstração: com velocidades iguais, o eco não muda de frequência',
          texto: r`**O que se pede.** Mostrar que o radar Doppler deixa de funcionar quando a polícia anda à mesma velocidade do carro perseguido.

**A ideia: dois efeitos Doppler seguidos.** O radar emite uma onda de frequência $f_0$, que bate no carro da frente e volta. Há dois trechos:
1. **ida:** a fonte é o radar (com a polícia, velocidade $v_p$) e o observador é o carro suspeito (velocidade $u$, fugindo);
2. **volta:** o carro suspeito reflete a onda e vira a **fonte**, e o radar vira o **observador**.

Use a fórmula do Doppler com a velocidade da onda $c$:
$$f' = f\,\frac{c \pm v_\text{obs}}{c \mp v_\text{fonte}},$$
com aproximação **aumentando** a frequência (sinal de cima) e afastamento diminuindo (sinal de baixo).

**Ida.** O suspeito (observador) **foge** da fonte: $c - u$ no numerador. A polícia (fonte) **se aproxima** dele: $c - v_p$ no denominador.
$$f_1 = f_0\,\frac{c - u}{c - v_p}.$$

**Volta.** Agora o suspeito é a fonte e se **afasta** da polícia: $c + u$ no denominador. A polícia (observador) **se aproxima** da fonte: $c + v_p$ no numerador.
$$f_\text{eco} = f_1\,\frac{c + v_p}{c + u} = f_0\,\frac{(c - u)(c + v_p)}{(c - v_p)(c + u)}.$$

**O caso das velocidades iguais.** Com $v_p = u$, os fatores se cancelam: $f_\text{eco} = f_0$. O eco volta **exatamente** na frequência emitida, qualquer que seja $u$.

**Por que isso inviabiliza a medição.** O radar só tem uma informação: o **desvio** $f_\text{eco} - f_0$. Para velocidades muito menores que $c$, a expressão fica
$$f_\text{eco} - f_0 \approx \frac{2f_0}{c}\,(v_p - u),$$
que depende só da **velocidade relativa** $v_p - u$. Quando a polícia iguala a velocidade do suspeito, o desvio vai a zero e não há nada para medir: o radar "vê" o carro parado em relação a ele. No gráfico, o desvio cruza o zero exatamente quando $u$ iguala a velocidade da polícia.

**Uma nota.** O radar usa ondas eletromagnéticas, que não precisam de meio, mas para velocidades muito menores que a da luz a conclusão é a mesma: o desvio só depende da velocidade relativa.`,
        },
      ],
      resultado: r`$f_\text{eco} - f_0 \approx 2f_0(v_p - u)/c$: com $v_p = u$, o desvio é zero e o radar não mede $u$.`,
      errosComuns: [r`Fazer um efeito Doppler só: na reflexão, o carro da frente primeiro recebe e depois emite.`],
    },
  },

  /* ───────────────────────── 13 ───────────────────────── */
  {
    id: 'p13',
    numero: '13',
    grupo: 'Problemas extras da P2',
    assunto: 'Energia numa onda estacionária',
    titulo: 'Energia entre dois nós do segundo modo',
    resumo: 'E = π²TA²/2L, constante: cinética e potencial trocam entre si.',
    enunciado: r`Numa corda de massa $m$, comprimento $L$ e tensão $T$, descrita por $y(x, t)$, as densidades lineares de energia cinética e potencial são
$$\frac{dK}{dx} = \frac12\mu\left(\frac{\partial y}{\partial t}\right)^2,\qquad\frac{dU}{dx} = \frac12T\left(\frac{\partial y}{\partial x}\right)^2,$$
com $\mu$ a densidade linear de massa. Determine a energia mecânica total $E = K + U$ armazenada entre dois nós consecutivos quando a corda, com as duas pontas fixas, vibra no segundo modo normal com amplitude $A$.`,
    graficos: [
      {
        titulo: 'O segundo modo: dois fusos, com um nó no meio',
        x: { variavel: 'x', de: 0, ate: 1, rotulo: 'x / L' },
        y: { de: -1.2, ate: 1.2, rotulo: 'y / A' },
        curvas: [
          { expr: 'sin(2*pi*x)*cos(wt)', rotulo: 'corda' },
          { expr: 'sin(2*pi*x)', cor: 'mute', tracejada: true },
          { expr: '0-sin(2*pi*x)', cor: 'mute', tracejada: true },
        ],
        parametros: [tempoOnda()],
        marcas: [{ x: 0.5, rotulo: 'nó' }],
      },
      {
        titulo: 'Energia de um fuso ao longo de um período',
        x: { variavel: 'u', de: 0, ate: 2 * Math.PI, rotulo: 'ωt (rad)' },
        y: { de: 0, ate: 1.1, rotulo: 'energia / (π²TA²/2L)' },
        curvas: [
          { expr: 'sin(u)^2', rotulo: 'cinética K' },
          { expr: 'cos(u)^2', rotulo: 'potencial U', cor: 'neg' },
          { expr: '1', rotulo: 'total E', cor: 'mute', tracejada: true },
        ],
      },
    ],
    respostas: [{ item: 'E', texto: r`$E = \dfrac{\pi^2TA^2}{2L}$ entre dois nós, constante no tempo.` }],
    resolucao: {
      conceitos: [{ texto: 'Modos normais de uma corda' }, { texto: 'Energia numa onda' }],
      etapas: [
        {
          titulo: 'E entre dois nós consecutivos',
          texto: r`**O que se pede.** A energia total (cinética mais potencial) num trecho entre dois nós seguidos, no segundo modo de uma corda fixa nas duas pontas.

**Passo 1: o segundo modo.** Com as duas pontas fixas, a corda vibra em modos com $n$ "fusos" (meios comprimentos de onda): $L = n\dfrac\lambda2$. No segundo modo, $n = 2$: $\lambda = L$ e $k = \dfrac{2\pi}{\lambda} = \dfrac{2\pi}{L}$. A forma é
$$y(x, t) = A\sin(kx)\cos(\omega t),$$
com nós em $x = 0$, $L/2$ e $L$. Dois nós consecutivos: de $0$ a $L/2$. A frequência vem da velocidade da onda, $v = \sqrt{T/\mu}$: $\omega = kv$, de modo que
$$\mu\omega^2 = \mu k^2\frac T\mu = Tk^2.$$

**Passo 2: as derivadas.**
$$\frac{\partial y}{\partial t} = -A\omega\sin(kx)\sin(\omega t),\qquad\frac{\partial y}{\partial x} = Ak\cos(kx)\cos(\omega t).$$

**Passo 3: integrar entre os nós.** As integrais de $\sin^2$ e $\cos^2$ num intervalo de meio comprimento de onda valem metade do comprimento do intervalo: $\displaystyle\int_0^{L/2}\sin^2(kx)\,dx = \int_0^{L/2}\cos^2(kx)\,dx = \frac L4$.
$$K = \frac12\mu A^2\omega^2\sin^2(\omega t)\cdot\frac L4,\qquad U = \frac12TA^2k^2\cos^2(\omega t)\cdot\frac L4.$$

**Passo 4: somar.** Com $\mu\omega^2 = Tk^2$ (passo 1), os dois coeficientes são iguais:
$$E = K + U = \frac{TA^2k^2L}{8}\left[\sin^2(\omega t) + \cos^2(\omega t)\right] = \frac{TA^2k^2L}{8}.$$
Com $k = 2\pi/L$:
$$E = \frac{TA^2}{8}\cdot\frac{4\pi^2}{L^2}\cdot L = \frac{\pi^2TA^2}{2L}.$$

**Interpretação.** A energia total **não depende do tempo**: ela fica presa entre os nós, porque um nó não se move e nenhuma energia o atravessa. Dentro do fuso, a energia passa de cinética (quando a corda está reta e rápida) para potencial (quando está esticada ao máximo e parada), como num oscilador. Veja o segundo gráfico.`,
        },
      ],
      resultado: r`$E = \dfrac{\pi^2TA^2}{2L}$ por fuso, constante no tempo.`,
      errosComuns: [r`Usar $k = \pi/L$ (o modo fundamental): no segundo modo, $\lambda = L$.`, r`Somar só a cinética máxima e a potencial máxima: elas se alternam, e a soma em cada instante é constante.`],
    },
  },
]

export const FISICA2: ProblemaF2[] = [...EXTRAS, ...PROVAS_F2]

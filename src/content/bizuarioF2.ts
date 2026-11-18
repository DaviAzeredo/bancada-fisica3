const r = String.raw

/**
 * Bizuário de Física II: todas as fórmulas e "pulos do gato" que aparecem nas
 * questões da seção, organizados para decorar. Cada ficha aponta para as
 * questões em que é usada (ids de FISICA2); o teste exige que toda questão
 * esteja coberta por alguma ficha.
 */
export interface Formula {
  /** Nome curto: vira a pergunta no modo Decorar ("Período do pêndulo"). */
  nome: string
  /** LaTeX, sem cifrões. */
  tex: string
  /** O que a fórmula diz, o que é cada símbolo e quando vale (Markdown + $…$). */
  explica: string
}

export interface Ficha {
  id: string
  titulo: string
  formulas: Formula[]
  /** Quando reconhecer que é esta a ferramenta (Markdown + $…$). */
  quando: string
  /** Os pulos do gato: atalhos e armadilhas. */
  bizus: string[]
  questoes: string[]
}

export interface Topico {
  id: string
  titulo: string
  resumo: string
  fichas: Ficha[]
}

export const BIZUARIO: Topico[] = [
  {
    id: 'mhs',
    titulo: 'Movimento harmônico simples',
    resumo: 'A base de tudo: reconhecer o MHS, ler ω, A e φ, e usar velocidade e aceleração máximas.',
    fichas: [
      {
        id: 'mhs-base',
        titulo: 'Equação e solução do MHS',
        formulas: [
          {
            nome: 'Equação do MHS',
            tex: r`\ddot x + \omega^2 x = 0`,
            explica: r`É a segunda lei de Newton com força $-kx$: a aceleração $\ddot x$ (derivada segunda da posição) é proporcional ao deslocamento e aponta para o lado oposto. Se a equação de um problema cair nesta forma, o movimento é harmônico, e o número que multiplica $x$ é $\omega^2$.`,
          },
          {
            nome: 'Solução geral',
            tex: r`x(t) = A\cos(\omega t + \varphi)`,
            explica: r`$A$ é a amplitude (o afastamento máximo do equilíbrio), $\omega$ a frequência angular em rad/s e $\varphi$ a fase inicial, que diz onde o movimento começa. $\omega$ vem do sistema; $A$ e $\varphi$ vêm das condições iniciais.`,
          },
          {
            nome: 'Frequência angular da mola',
            tex: r`\omega = \sqrt{k/m}`,
            explica: r`$k$ é a constante da mola (N/m) e $m$ a massa (kg). Mola mais dura oscila mais rápido; massa maior, mais devagar. Para qualquer força $-Kx$, troque $k$ por $K$.`,
          },
          {
            nome: 'Período e frequência',
            tex: r`T = \frac{2\pi}{\omega},\quad f = \frac1T`,
            explica: r`$T$ é o tempo de uma oscilação completa (s) e $f$ o número de oscilações por segundo (Hz). Uma volta completa da fase vale $2\pi$, por isso $\omega T = 2\pi$.`,
          },
        ],
        quando: r`Sempre que a força resultante for proporcional ao deslocamento e apontar de volta, $F = -Kx$.`,
        bizus: [
          r`Achou $F = -Kx$ (mola, gravidade, qualquer coisa)? Então $\omega = \sqrt{K/m}$. Não precisa decorar cada sistema: ache o "$K$ efetivo".`,
          r`O período **não depende da amplitude**: balançar mais forte não demora mais.`,
          r`$\omega$ (rad/s) não é $f$ (Hz): $\omega = 2\pi f$.`,
        ],
        questoes: ['p1', 'p3', 'p2-2025-1-q1', 'p2-2025-2-q1'],
      },
      {
        id: 'mhs-max',
        titulo: 'Velocidade e aceleração',
        formulas: [
          {
            nome: 'Velocidade',
            tex: r`v = -A\omega\,\text{sen}(\omega t + \varphi)`,
            explica: r`É a derivada de $x(t)$. Onde o cosseno vale zero (no equilíbrio) o seno vale $\pm1$, e a velocidade é a maior possível.`,
          },
          {
            nome: 'Velocidade máxima',
            tex: r`v_{\max} = \omega A`,
            explica: r`Acontece ao passar pelo equilíbrio, $x = 0$. Nos extremos a velocidade é zero. Dada a velocidade no equilíbrio, $\omega = v_0/A$.`,
          },
          {
            nome: 'Aceleração',
            tex: r`a = -\omega^2 x`,
            explica: r`Proporcional ao deslocamento e de sinal oposto: é a própria definição do MHS. No equilíbrio, $a = 0$.`,
          },
          {
            nome: 'Aceleração máxima',
            tex: r`a_{\max} = \omega^2 A`,
            explica: r`Acontece nos extremos, $|x| = A$, onde o corpo para e volta. É aqui que se testa "escorrega ou não", "descola ou não".`,
          },
        ],
        quando: r`Perguntas sobre "passa pelo equilíbrio com velocidade…" ou "o que acontece nos extremos".`,
        bizus: [
          r`Velocidade máxima **no equilíbrio**; aceleração máxima **nos extremos**. Na posição de equilíbrio, $v_0 = \omega A$ dá $\omega = v_0/A$ direto.`,
          r`"Não escorregar" ou "não descolar" é sempre uma condição sobre a **aceleração máxima**, $\omega^2A$, e o perigo é nos extremos.`,
        ],
        questoes: ['p2-2025-1-q1', 'p2-2025-1-q4', 'p2-2025-2-q1', 'p1'],
      },
      {
        id: 'mhs-fase',
        titulo: 'Amplitude e fase pelas condições iniciais',
        formulas: [
          {
            nome: 'Posição inicial',
            tex: r`x(0) = A\cos\varphi`,
            explica: r`É a solução em $t = 0$. Sozinha, deixa duas fases possíveis para cada posição (por exemplo, $x(0) = 0$ aceita $\varphi = \pi/2$ e $3\pi/2$).`,
          },
          {
            nome: 'Velocidade inicial',
            tex: r`v(0) = -A\omega\,\text{sen}\,\varphi`,
            explica: r`O sinal de $v(0)$ escolhe entre as duas fases: começou indo para $+x$ ($v(0) > 0$) pede $\text{sen}\,\varphi < 0$; indo para $-x$ pede $\text{sen}\,\varphi > 0$.`,
          },
          {
            nome: 'Amplitude pelas condições iniciais',
            tex: r`A = \sqrt{x_0^2 + (v_0/\omega)^2}`,
            explica: r`Sai de $\cos^2\varphi + \text{sen}^2\varphi = 1$ aplicado às duas equações acima, com $x_0 = x(0)$ e $v_0 = v(0)$. Começando no equilíbrio, fica só $A = v_0/\omega$.`,
          },
        ],
        quando: r`"No instante inicial a partícula está em … com velocidade …", ou um gráfico de $x(t)$ para ler.`,
        bizus: [
          r`$\cos\varphi = 0$ dá **dois** candidatos ($\pi/2$ e $3\pi/2$, ou $\pm\pi/2$). Quem desempata é o **sinal da velocidade**: começou subindo ou descendo?`,
          r`Partindo do zero e **subindo**: $\varphi = 3\pi/2$ (ou $-\pi/2$). Partindo do zero e **descendo**: $\varphi = \pi/2$. Partindo do máximo: $\varphi = 0$.`,
          r`A amplitude é sempre **positiva**; o sinal fica por conta da fase.`,
        ],
        questoes: ['p10', 'p2-2025-2-q1'],
      },
      {
        id: 'mhs-vertical',
        titulo: 'Mola vertical',
        formulas: [
          {
            nome: 'Equilíbrio da mola vertical',
            tex: r`k\,\Delta = mg`,
            explica: r`$\Delta$ é quanto a mola estica quando o corpo fica parado pendurado: a força da mola, $k\Delta$, equilibra o peso.`,
          },
          {
            nome: 'Frequência pela deformação',
            tex: r`\omega = \sqrt{k/m} = \sqrt{g/\Delta}`,
            explica: r`Da equação anterior, $k/m = g/\Delta$. Basta saber quanto a mola esticou, sem precisar de $k$ nem de $m$.`,
          },
        ],
        quando: r`Corpo pendurado numa mola: "estica tantos cm ao pendurar".`,
        bizus: [
          r`O peso só **desloca o equilíbrio**; medindo $y$ a partir do novo equilíbrio, a equação é a mesma do MHS horizontal.`,
          r`A amplitude é contada a partir do **equilíbrio**, não do comprimento natural da mola.`,
        ],
        questoes: ['p3'],
      },
      {
        id: 'mhs-tempo',
        titulo: 'Frações de período',
        formulas: [
          {
            nome: 'Do máximo ao zero',
            tex: r`\Delta t = \frac T4`,
            explica: r`Um ciclo tem quatro trechos de mesma duração: máximo → zero → mínimo → zero → máximo. Cada um leva um quarto do período.`,
          },
          {
            nome: 'Do máximo ao mínimo',
            tex: r`\Delta t = \frac T2`,
            explica: r`Meia oscilação: de um extremo ao outro. Também é o tempo entre duas passagens seguidas pelo equilíbrio.`,
          },
        ],
        quando: r`O enunciado dá um tempo entre dois pontos do movimento, não o período.`,
        bizus: [r`Um ciclo tem quatro trechos iguais: máx → 0 → mín → 0 → máx. "Do máximo ao zero em 0,1 s" quer dizer $T = 0{,}4$ s.`],
        questoes: ['p2-2025-2-q4'],
      },
    ],
  },
  {
    id: 'energia',
    titulo: 'Energia no MHS',
    resumo: 'Energia vai com o quadrado da amplitude; cinética e potencial trocam como seno² e cosseno².',
    fichas: [
      {
        id: 'energia-mhs',
        titulo: 'Energia total, cinética e potencial',
        formulas: [
          {
            nome: 'Energia total',
            tex: r`E = \tfrac12 kA^2 = \tfrac12 m\omega^2A^2`,
            explica: r`É a energia potencial no extremo, onde a cinética é zero. Sem atrito ela não muda. Depende do **quadrado** da amplitude.`,
          },
          {
            nome: 'Energia potencial no tempo',
            tex: r`U = E\cos^2(\omega t + \varphi)`,
            explica: r`É a energia guardada na mola, $U = \tfrac12kx^2$, com $x = A\cos(\omega t + \varphi)$ e $k = m\omega^2$. É máxima nos extremos, onde a mola está mais esticada, e zero no equilíbrio.`,
          },
          {
            nome: 'Energia cinética no tempo',
            tex: r`K = E\,\text{sen}^2(\omega t + \varphi)`,
            explica: r`É $K = \tfrac12mv^2$ com a velocidade do MHS. Máxima no equilíbrio. Como $\cos^2 + \text{sen}^2 = 1$, sempre $K + U = E$.`,
          },
          {
            nome: 'Cinética sobre potencial',
            tex: r`\frac KU = \tan^2(\omega t + \varphi)`,
            explica: r`Dividindo as duas anteriores, o $E$ cancela: basta saber a fase no instante pedido (em $t = 0$, a fase é $\varphi$).`,
          },
        ],
        quando: r`Razão entre energias, "o que acontece com a energia se…", ou para tirar $\omega$ e $A$ sem resolver equação.`,
        bizus: [
          r`**Dobrou a amplitude?** Energia $\times 4$, período igual, velocidade máxima $\times 2$.`,
          r`Calcule a energia no ponto mais fácil: no **extremo** ela é toda potencial; no **equilíbrio**, toda cinética ($\tfrac12mv_0^2 = \tfrac12kA^2$).`,
          r`$\tan^2(\pi/6) = 1/3$, $\tan^2(\pi/4) = 1$, $\tan^2(\pi/3) = 3$: com a fase em mãos, $K/U$ sai de cabeça.`,
        ],
        questoes: ['p1', 'p2-2025-1-q2', 'p2-2025-1-q1', 'p2-2025-2-q2'],
      },
    ],
  },
  {
    id: 'pendulo',
    titulo: 'Pêndulo simples',
    resumo: 'Para ângulos pequenos é um MHS com ω = √(g/L); energia em θ e no afastamento A = Lθ.',
    fichas: [
      {
        id: 'pendulo-base',
        titulo: 'Período e energia do pêndulo',
        formulas: [
          {
            nome: 'Frequência angular do pêndulo',
            tex: r`\omega = \sqrt{g/L}`,
            explica: r`$L$ é o comprimento do fio e $g$ a gravidade. Não depende da massa nem da amplitude, desde que o ângulo seja pequeno.`,
          },
          {
            nome: 'Período do pêndulo',
            tex: r`T = 2\pi\sqrt{L/g}`,
            explica: r`É $2\pi/\omega$ com a frequência acima. O período cresce com a raiz do comprimento: fio quatro vezes maior, período duas vezes maior. Massa e amplitude não entram.`,
          },
          {
            nome: 'Energia pelo ângulo',
            tex: r`E = \tfrac12 mL^2\dot\theta^2 + \tfrac12 mgL\theta^2`,
            explica: r`O primeiro termo é a cinética (a massa anda a $v = L\dot\theta$); o segundo, a potencial gravitacional para ângulo pequeno, porque a massa sobe $h \approx L\theta^2/2$. É o MHS com $\theta$ no lugar de $x$.`,
          },
          {
            nome: 'Energia pelo afastamento',
            tex: r`E = \frac{mgA^2}{2L}`,
            explica: r`No extremo só há potencial, e o ângulo máximo é $\theta_{\max} = A/L$ (afastamento horizontal $A$ dividido pelo fio). Substituindo na fórmula anterior com $\dot\theta = 0$.`,
          },
        ],
        quando: r`Fio + massa, pequenas oscilações.`,
        bizus: [
          r`$\omega = \sqrt{g/L}$, **não** $\sqrt{L/g}$ (essa é a do período, com $2\pi$).`,
          r`Solto do **repouso** no ângulo máximo: $\theta = \theta_0\cos\omega t$, e a energia **cinética** começa em zero, então vai com $\text{sen}^2$.`,
          r`O afastamento horizontal $A$ vira ângulo dividindo por $L$: $\theta = A/L$ (em radianos).`,
        ],
        questoes: ['p9', 'p2-2025-2-q2'],
      },
      {
        id: 'pendulo-obstaculo',
        titulo: 'Pêndulo com obstáculo (dois comprimentos)',
        formulas: [
          {
            nome: 'Período com dois comprimentos',
            tex: r`T = \pi\sqrt{\tfrac{L_1}{g}} + \pi\sqrt{\tfrac{L_2}{g}}`,
            explica: r`De um lado balança o fio $L_1$, do outro o pedaço $L_2$ abaixo do obstáculo. Cada lado dura meio período do seu pêndulo, e metade de $2\pi\sqrt{L/g}$ é $\pi\sqrt{L/g}$.`,
          },
          {
            nome: 'Pêndulo equivalente',
            tex: r`\sqrt{L'} = \tfrac12\left(\sqrt{L_1} + \sqrt{L_2}\right)`,
            explica: r`É o comprimento $L'$ de um pêndulo comum com o mesmo período: iguale $2\pi\sqrt{L'/g}$ à fórmula anterior. Com $L_1 = L$ e $L_2 = L/2$, dá $L' = (3 + 2\sqrt2)L/8$.`,
          },
        ],
        quando: r`Um prego ou bloco encurta o fio de um dos lados.`,
        bizus: [
          r`Cada lado é **meio período** de um pêndulo diferente. Somam-se os **tempos**, não os comprimentos.`,
          r`Pêndulo equivalente: $\sqrt{L'} = \tfrac12(\sqrt{L_1} + \sqrt{L_2})$. Com $L$ e $L/2$: $L' = (3 + 2\sqrt2)L/8$.`,
        ],
        questoes: ['p2-2025-1-q3'],
      },
    ],
  },
  {
    id: 'disfarcado',
    titulo: 'Sistemas que viram MHS',
    resumo: 'Achar a força restauradora linear, mesmo quando ela vem de gravidade ou atrito.',
    fichas: [
      {
        id: 'disfarcado-gravidade',
        titulo: 'Força que fica linear para deslocamento pequeno',
        formulas: [
          {
            nome: 'Força vertical exata',
            tex: r`F_y = -\frac{2GMm\,y}{(y^2 + d^2/4)^{3/2}}`,
            explica: r`Soma das componentes verticais das atrações das duas massas $M$ sobre $m$, com $r = \sqrt{y^2 + d^2/4}$ e $\cos\theta = y/r$. As componentes horizontais se cancelam por simetria.`,
          },
          {
            nome: 'Aproximação linear',
            tex: r`F_y \approx -\frac{16GMm}{d^3}\,y`,
            explica: r`Para $y \ll d/2$, despreza-se $y^2$ no denominador: $(d^2/4)^{3/2} = d^3/8$. A força virou uma mola de constante $K = 16GMm/d^3$.`,
          },
          {
            nome: 'Frequência das pequenas oscilações',
            tex: r`\omega = \sqrt{\frac{16GM}{d^3}} = \frac4d\sqrt{\frac{GM}{d}}`,
            explica: r`É $\omega = \sqrt{K/m}$ com o $K$ da aproximação linear. A massa $m$ que oscila cancela, como no pêndulo: a força e a inércia são ambas proporcionais a ela.`,
          },
        ],
        quando: r`"Considere $y \ll d$": é o aviso de que a força vai virar uma mola.`,
        bizus: [
          r`Por simetria, as componentes **horizontais** se cancelam; some só as verticais ($\cos\theta = y/r$).`,
          r`Com $y$ pequeno, troque $r$ pela distância fixa: $(d/2)^3 = d^3/8$. O que sobra multiplicando $y$ é o $K$.`,
        ],
        questoes: ['p2-2025-2-q3'],
      },
      {
        id: 'disfarcado-atrito',
        titulo: 'Bloco sobre bloco: não escorregar',
        formulas: [
          {
            nome: 'Frequência do conjunto',
            tex: r`\omega^2 = \frac{k}{M + m}`,
            explica: r`Enquanto não há deslizamento, os dois blocos andam juntos, e a mola acelera a massa total $M + m$.`,
          },
          {
            nome: 'Condição de não escorregar',
            tex: r`m\,\omega^2 A \le \mu_e m g`,
            explica: r`À esquerda, a força que o atrito precisa fazer para acelerar o bloquinho no extremo ($m\,a_{\max}$); à direita, o máximo que o atrito estático aguenta ($\mu_e$ vezes a normal $mg$).`,
          },
          {
            nome: 'Amplitude máxima',
            tex: r`A_{\max} = \frac{\mu_e(M + m)g}{k}`,
            explica: r`Isolando $A$ na condição de não escorregar ($A \le \mu_e g/\omega^2$) e usando o $\omega^2$ do conjunto. Atrito maior ou mola mais mole permitem amplitude maior.`,
          },
        ],
        quando: r`Um corpo em cima do outro, só o de baixo preso na mola.`,
        bizus: [
          r`A mola acelera os **dois** blocos: na frequência entra $M + m$.`,
          r`O atrito estático é quem acelera o de cima; o limite é na aceleração máxima, nos extremos.`,
        ],
        questoes: ['p2-2025-1-q4'],
      },
    ],
  },
  {
    id: 'amortecido',
    titulo: 'Oscilador amortecido',
    resumo: 'Amplitude cai com e^(−γt/2), energia com e^(−γt); cada intervalo igual multiplica pelo mesmo fator.',
    fichas: [
      {
        id: 'amortecido-base',
        titulo: 'Solução subcrítica',
        formulas: [
          {
            nome: 'Equação do amortecido',
            tex: r`\ddot x + \gamma\dot x + \omega_0^2 x = 0`,
            explica: r`O MHS mais uma força de atrito proporcional à velocidade. $\gamma$ é a constante de amortecimento (1/s) e $\omega_0$ a frequência natural, a que haveria sem atrito.`,
          },
          {
            nome: 'Solução subcrítica',
            tex: r`x = A\,e^{-\gamma t/2}\cos(\omega t + \varphi)`,
            explica: r`Um cosseno com amplitude encolhendo: a envoltória é $Ae^{-\gamma t/2}$. Vale quando o atrito é pequeno, $\gamma < 2\omega_0$.`,
          },
          {
            nome: 'Frequência amortecida',
            tex: r`\omega = \sqrt{\omega_0^2 - \gamma^2/4}`,
            explica: r`Um pouco menor que $\omega_0$. Com amortecimento fraco, $\omega \approx \omega_0$ e o período quase não muda.`,
          },
          {
            nome: 'Energia no tempo',
            tex: r`E(t) = E_0\,e^{-\gamma t}`,
            explica: r`$E_0$ é a energia inicial. A energia vai com o quadrado da amplitude, e $(e^{-\gamma t/2})^2 = e^{-\gamma t}$: por isso aqui aparece $\gamma$ inteiro. Em $t = 1/\gamma$ sobra $e^{-1} \approx 36{,}8\%$ da energia.`,
          },
        ],
        quando: r`Atrito viscoso, "perde energia", "amplitude diminui".`,
        bizus: [
          r`Amplitude com $\gamma/2$, **energia com $\gamma$** (energia $\propto$ amplitude²). Não troque os dois.`,
          r`Amortecimento fraco **não muda o período** na prática: o número de oscilações num tempo $t$ é $t/T$ com $T = 2\pi/\omega_0$.`,
          r`Para mostrar a solução: derive duas vezes e substitua (os termos em seno se cancelam), ou tente $e^{rt}$ e resolva $r^2 + \gamma r + \omega_0^2 = 0$.`,
        ],
        questoes: ['r1', 'p2-2025-2-d'],
      },
      {
        id: 'amortecido-fatores',
        titulo: 'Queda exponencial e decremento logarítmico',
        formulas: [
          {
            nome: 'Razão entre máximos seguidos',
            tex: r`R = \frac{x_{n+1}}{x_n} = e^{-\gamma\tau/2}`,
            explica: r`Dois máximos seguidos estão separados por um período $\tau$. O cosseno vale o mesmo nos dois, então só a exponencial muda.`,
          },
          {
            nome: 'Decremento logarítmico',
            tex: r`\delta = |\ln R| = \frac{\gamma\tau}{2}`,
            explica: r`Mede quanto a amplitude cai por ciclo, em escala logarítmica. Sem atrito, $R = 1$ e $\delta = 0$.`,
          },
          {
            nome: 'Depois de n períodos',
            tex: r`\frac{x(t + n\tau)}{x(t)} = R^n`,
            explica: r`Cada período multiplica a amplitude pelo mesmo $R$. Metade em 3 períodos: $R^3 = \tfrac12$, logo $\delta = (\ln 2)/3$.`,
          },
        ],
        quando: r`"Cai a 1/10 em…", "metade em três períodos", "quanto tempo a mais".`,
        bizus: [
          r`Exponencial: **intervalos iguais multiplicam pelo mesmo fator**. Se cai a 1/10 em 15 s, cai a 1/100 em 30 s (mais 15 s, não 30).`,
          r`Metade em 3 períodos: $R^3 = \tfrac12$, então $\delta = (\ln 2)/3 \approx 0{,}23$. Tire a raiz do fator, não divida por 3.`,
          r`$E = E_0e^{-1}$ (36,8%) quando $t = 1/\gamma$.`,
        ],
        questoes: ['p2', 'r1', 'p2-2025-2-d'],
      },
    ],
  },
  {
    id: 'forcado',
    titulo: 'Oscilações forçadas e ressonância',
    resumo: 'Uma fórmula de amplitude resolve quase tudo; o pico depende do amortecimento.',
    fichas: [
      {
        id: 'forcado-amplitude',
        titulo: 'Amplitude no regime estacionário',
        formulas: [
          {
            nome: 'Equação forçada',
            tex: r`\ddot x + \gamma\dot x + \omega_0^2x = f\cos\omega t`,
            explica: r`O oscilador amortecido com uma força externa periódica; $f$ é a força por unidade de massa ($F_0/m$) e $\omega$ a frequência **da força**, não a natural.`,
          },
          {
            nome: 'Amplitude estacionária',
            tex: r`A(\omega) = \frac{f}{\sqrt{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}}`,
            explica: r`Depois do transitório, o corpo oscila na frequência da força com esta amplitude. O primeiro termo some em $\omega = \omega_0$; o segundo, do atrito, impede a amplitude de ir ao infinito.`,
          },
          {
            nome: 'Fator de qualidade',
            tex: r`Q = \frac{\omega_0}{\gamma}`,
            explica: r`Quanto menor o atrito, maior $Q$ e mais alto e estreito o pico. Na ressonância a amplitude é cerca de $Q$ vezes a obtida com força lenta ($\omega \to 0$).`,
          },
        ],
        quando: r`Força periódica externa, "após o transitório".`,
        bizus: [
          r`Depois do transitório, o corpo oscila na frequência **da força**, não na natural.`,
          r`Razão de amplitudes: só os denominadores importam. Com $\gamma = \omega_0$: $A(\omega_0)/A(\omega_0/2) = \sqrt{13/16}$ (o pico nem fica em $\omega_0$).`,
          r`Na ressonância, $A_{\text{res}}/A(0) \approx Q = \omega_0/\gamma$: **não há teto** (o "no máximo 4 vezes" é falso).`,
        ],
        questoes: ['p2-2025-1-q5', 'p11'],
      },
      {
        id: 'forcado-fase',
        titulo: 'Fase da resposta',
        formulas: [
          {
            nome: 'Força lenta',
            tex: r`\omega \ll \omega_0:\ \text{em fase}`,
            explica: r`A mola domina: o corpo acompanha a força, com amplitude perto de $f/\omega_0^2$.`,
          },
          {
            nome: 'Na ressonância',
            tex: r`\omega = \omega_0:\ \text{atraso de } \tfrac\pi2`,
            explica: r`O corpo fica um quarto de ciclo atrás da força, que então empurra sempre a favor da velocidade: é por isso que a amplitude cresce tanto.`,
          },
          {
            nome: 'Força rápida',
            tex: r`\omega \gg \omega_0:\ \text{oposição},\ A \to 0`,
            explica: r`A inércia domina: o corpo mal se mexe e vai ao contrário da força.`,
          },
        ],
        quando: r`Afirmações do tipo "em baixa frequência o movimento está em oposição".`,
        bizus: [r`Baixa frequência: a mola manda e o corpo **acompanha** a força. Alta frequência: o corpo nem consegue seguir, responde pouco e ao contrário.`],
        questoes: ['p11'],
      },
    ],
  },
  {
    id: 'ondas',
    titulo: 'Ondas progressivas',
    resumo: 'Ler A, k, ω da fórmula; v = ω/k; o sinal diz o sentido.',
    fichas: [
      {
        id: 'ondas-leitura',
        titulo: 'Lendo uma onda harmônica',
        formulas: [
          {
            nome: 'Onda harmônica',
            tex: r`y = A\,\text{sen}(kx \mp \omega t)`,
            explica: r`$y$ é o deslocamento do ponto $x$ da corda no instante $t$, e $A$ a amplitude. Com o sinal de menos a onda anda para $+x$; com o de mais, para $-x$.`,
          },
          {
            nome: 'Número de onda',
            tex: r`k = \frac{2\pi}{\lambda}`,
            explica: r`$\lambda$ é o comprimento de onda, a distância entre duas cristas. $k$ é o número que multiplica $x$ (rad/m).`,
          },
          {
            nome: 'Frequência angular da onda',
            tex: r`\omega = \frac{2\pi}{T} = 2\pi f`,
            explica: r`O número que multiplica $t$. $T$ é o tempo para um ponto da corda completar uma oscilação, e $f = 1/T$.`,
          },
          {
            nome: 'Velocidade da onda',
            tex: r`v = \frac\omega k = \lambda f`,
            explica: r`Em um período a onda anda um comprimento de onda. Vale também para ler a velocidade escondida numa estacionária.`,
          },
        ],
        quando: r`"Ache amplitude, comprimento de onda, período, frequência, velocidade e sentido".`,
        bizus: [
          r`**Sinais iguais** em $kx$ e $\omega t$: anda para $-x$. **Sinais opostos**: anda para $+x$.`,
          r`Se a fórmula traz $\pi(0{,}4)x$, então $k = 0{,}4\pi$: $\lambda = 2\pi/k = 5$. Não leia $0{,}4$ como $k$ nem como $\lambda$.`,
          r`Desenho num instante: calcule a fase extra $\omega t$; fase positiva **adianta** (desloca para a esquerda) a senoide.`,
        ],
        questoes: ['p2-2025-1-d'],
      },
      {
        id: 'ondas-equacao',
        titulo: 'Equação de onda',
        formulas: [
          {
            nome: 'Equação de onda',
            tex: r`\frac{\partial^2 y}{\partial x^2} = \frac{1}{v^2}\frac{\partial^2 y}{\partial t^2}`,
            explica: r`Liga a curvatura da corda num ponto à aceleração desse ponto; $v$ é a velocidade de propagação. Numa corda aparece como $T\,\partial^2y/\partial x^2 = \mu\,\partial^2y/\partial t^2$, isto é, $v^2 = T/\mu$.`,
          },
          {
            nome: 'Solução geral da equação de onda',
            tex: r`y = f(x - vt) + g(x + vt)`,
            explica: r`Qualquer forma $f$ andando para a direita mais qualquer forma $g$ andando para a esquerda, sem se deformar. A forma inicial **e** a velocidade inicial da corda determinam $f$ e $g$.`,
          },
          {
            nome: 'Relação de dispersão',
            tex: r`\omega = vk`,
            explica: r`Substituindo uma onda harmônica na equação: as derivadas segundas dão $-k^2$ e $-\omega^2$, e a igualdade pede $\omega^2 = v^2k^2$.`,
          },
        ],
        quando: r`"Mostre que satisfaz a equação de onda", "relação de dispersão".`,
        bizus: [
          r`Derivar duas vezes seno/cosseno devolve a função vezes $-k^2$ (em $x$) ou $-\omega^2$ (em $t$). Igualando: $\omega = vk$.`,
          r`Ao derivar em $x$, o fator que só depende de $t$ é **constante** (e vice-versa).`,
          r`Toda solução é soma de uma onda para a direita e outra para a esquerda; condições iniciais de forma **e** velocidade fixam as duas.`,
        ],
        questoes: ['p4', 'p5', 'p2-2026-1-d'],
      },
    ],
  },
  {
    id: 'corda',
    titulo: 'Corda: velocidade, energia e potência',
    resumo: 'v = √(T/μ) e a potência média ½√(Tμ)ω²A².',
    fichas: [
      {
        id: 'corda-velocidade',
        titulo: 'Velocidade numa corda',
        formulas: [
          {
            nome: 'Velocidade numa corda',
            tex: r`v = \sqrt{T/\mu}`,
            explica: r`$T$ é a tração (N) e $\mu$ a massa por comprimento (kg/m). Corda mais esticada, onda mais rápida; corda mais pesada, onda mais lenta.`,
          },
          {
            nome: 'Tração pela velocidade',
            tex: r`T = \mu v^2`,
            explica: r`A mesma fórmula com $T$ isolada. Use quando dá para achar a velocidade por $v = \lambda/\tau$ ($\tau$ é o período, não confundir com a tração).`,
          },
        ],
        quando: r`Tensão, densidade linear, "bloco pendurado tensiona a corda".`,
        bizus: [
          r`Bloco parado pendurado na ponta: **tração = peso**, $T = mg$. A polia sem atrito só muda a direção.`,
          r`Converta $\mu$ para kg/m: 50 g/m $= 0{,}05$ kg/m.`,
        ],
        questoes: ['p2-2025-2-q4', 'p2-2026-1-d', 'p6'],
      },
      {
        id: 'corda-potencia',
        titulo: 'Potência e energia transportadas',
        formulas: [
          {
            nome: 'Potência média',
            tex: r`\bar P = \tfrac12\mu\omega^2A^2\,v`,
            explica: r`$\tfrac12\mu\omega^2A^2$ é a energia média por metro de corda; multiplicada pela velocidade $v$ com que ela viaja, dá a energia que passa por segundo.`,
          },
          {
            nome: 'Potência pela tração',
            tex: r`\bar P = \tfrac12\sqrt{T\mu}\;\omega^2A^2`,
            explica: r`É a potência média com $v = \sqrt{T/\mu}$, porque $\mu v = \sqrt{T\mu}$. Com tração, frequência e amplitude fixas, a potência vai com $\sqrt\mu$: corda três vezes mais pesada leva $\sqrt3$ vezes mais potência.`,
          },
          {
            nome: 'Densidades de energia',
            tex: r`\frac{dK}{dx} = \tfrac12\mu\left(\frac{\partial y}{\partial t}\right)^2,\quad \frac{dU}{dx} = \tfrac12T\left(\frac{\partial y}{\partial x}\right)^2`,
            explica: r`Energia por metro: a cinética vem da velocidade de cada pedaço; a potencial, da inclinação (o quanto a corda está esticada além do reto). Integre em $x$ para ter a energia de um trecho.`,
          },
          {
            nome: 'Energia entre dois nós',
            tex: r`E = \frac{\pi^2TA^2}{2L}`,
            explica: r`Corda de comprimento $L$, presa nas pontas, no segundo modo ($\lambda = L$) com amplitude $A$: energia entre dois nós vizinhos. É constante, porque cinética e potencial trocam entre si.`,
          },
        ],
        quando: r`"Potência média", "intensidade", "energia de um trecho da corda".`,
        bizus: [
          r`Mudou só $\mu$? A potência vai com $\sqrt\mu$: $\mu \times 3 \Rightarrow P \times \sqrt3$ (mais massa por metro, mas onda mais lenta).`,
          r`Numa estacionária a energia total de um trecho entre nós é **constante**: cinética e potencial só trocam. Some as duas num instante, não os dois máximos.`,
        ],
        questoes: ['p2-2025-1-d', 'p13'],
      },
    ],
  },
  {
    id: 'estacionarias',
    titulo: 'Superposição e ondas estacionárias',
    resumo: 'Duas viajantes opostas somam 2A·(forma em x)·(oscilação em t).',
    fichas: [
      {
        id: 'estacionaria-soma',
        titulo: 'Soma de duas viajantes',
        formulas: [
          {
            nome: 'Soma de duas viajantes (cossenos)',
            tex: r`y = 2A\cos kx\cos\omega t`,
            explica: r`É $A\cos(kx - \omega t) + A\cos(kx + \omega t)$: duas ondas iguais em sentidos opostos. Fica uma forma parada, $\cos kx$, cuja altura sobe e desce com $\cos\omega t$.`,
          },
          {
            nome: 'Soma de duas viajantes (senos)',
            tex: r`y = 2A\cos kx\,\text{sen}\,\omega t`,
            explica: r`É $A\,\text{sen}(kx + \omega t) - A\,\text{sen}(kx - \omega t)$: abrindo seno da soma e da diferença, os termos com $\text{sen}\,kx$ se cancelam.`,
          },
          {
            nome: 'Deslocar a fase de π/2',
            tex: r`\cos\!\left(\theta + \tfrac\pi2\right) = -\text{sen}\,\theta`,
            explica: r`Serve para escrever as duas ondas com a mesma função (só senos ou só cossenos) antes de somar.`,
          },
        ],
        quando: r`"Superposição", "a onda estacionária resultante", "as ondas que interferem".`,
        bizus: [
          r`A amplitude da estacionária é **o dobro** da de cada viajante: estacionária de 0,5 cm vem de duas de 0,25 cm.`,
          r`A velocidade das viajantes sai da estacionária: $v = \omega/k$ com o $k$ e o $\omega$ dela ($\cos(x/2)\cos 16t \Rightarrow v = 32$ m/s).`,
          r`Corda **toda reta** quando o fator do tempo zera ($\text{sen}\,\omega t = 0 \Rightarrow t = n\pi/\omega$). Zerar o fator de $x$ dá os nós (pontos), não instantes.`,
          r`Corda reta **não está parada**: é o instante de velocidade máxima.`,
        ],
        questoes: ['p4', 'p6', 'p7', 'p2-2025-1-q6', 'p2-2025-2-q6'],
      },
      {
        id: 'estacionaria-nos',
        titulo: 'Nós e ventres',
        formulas: [
          {
            nome: 'Distância entre nós vizinhos',
            tex: r`\frac\lambda2 = \frac\pi k`,
            explica: r`Nós são os pontos onde o fator em $x$ zera ($\cos kx = 0$ ou $\text{sen}\,kx = 0$), e isso se repete a cada $\pi$ em $kx$.`,
          },
          {
            nome: 'Do nó ao ventre',
            tex: r`\frac\lambda4`,
            explica: r`Ventre é o ponto de amplitude máxima, no meio entre dois nós.`,
          },
        ],
        quando: r`"Distância entre nós", "menor comprimento de corda".`,
        bizus: [r`Para caber numa corda presa nas duas pontas, o comprimento tem de ser múltiplo de $\lambda/2$; o menor é a própria distância entre nós.`],
        questoes: ['p6', 'p7'],
      },
      {
        id: 'estacionaria-inicial',
        titulo: 'Onda a partir das condições iniciais',
        formulas: [
          {
            nome: 'Produto de cossenos',
            tex: r`\cos kx\cos\omega t = \tfrac12\left[\cos(kx - \omega t) + \cos(kx + \omega t)\right]`,
            explica: r`Desfaz uma estacionária em duas viajantes. É a identidade de soma de cossenos lida de trás para a frente.`,
          },
          {
            nome: 'Produto de senos',
            tex: r`\text{sen}\,kx\,\text{sen}\,\omega t = \tfrac12\left[\cos(kx - \omega t) - \cos(kx + \omega t)\right]`,
            explica: r`É a identidade da diferença de cossenos lida ao contrário. Usando as duas identidades, $A\cos kx\cos\omega t + B\,\text{sen}\,kx\,\text{sen}\,\omega t$ vira $\tfrac{A+B}2\cos(kx - \omega t) + \tfrac{A-B}2\cos(kx + \omega t)$: uma onda para cada lado.`,
          },
        ],
        quando: r`Dados a forma inicial $y(x,0)$ e a velocidade inicial $\partial y/\partial t(x,0)$.`,
        bizus: [r`A forma inicial fixa a parte em $\cos\omega t$, a velocidade inicial a parte em $\text{sen}\,\omega t$. Sem a velocidade, a resposta não é única.`],
        questoes: ['p5'],
      },
    ],
  },
  {
    id: 'modos',
    titulo: 'Modos normais e condições de contorno',
    resumo: 'Ponta fixa = nó, ponta livre = ventre; o resto é contar meios e quartos de onda.',
    fichas: [
      {
        id: 'modos-contorno',
        titulo: 'Condições de contorno',
        formulas: [
          {
            nome: 'Ponta fixa',
            tex: r`y(x_p, t) = 0`,
            explica: r`A corda presa em $x_p$ não se mexe em nenhum instante: a ponta é um **nó**. Teste: o fator em $x$ zera nesse ponto.`,
          },
          {
            nome: 'Ponta livre',
            tex: r`\frac{\partial y}{\partial x}(x_p, t) = 0`,
            explica: r`Anel sem massa numa haste sem atrito: a corda chega horizontal, inclinação zero. A ponta é um **ventre**. Teste: a derivada do fator em $x$ zera nesse ponto.`,
          },
        ],
        quando: r`"Identifique qual extremidade é livre ou fixa", anel em haste, corda presa.`,
        bizus: [
          r`Anel **sem massa e sem atrito** numa haste = ponta livre: a corda chega horizontal.`,
          r`O fator em $x$ decide o contorno; o fator em $t$ (com a fase) só entra nas condições iniciais.`,
          r`Converta antes de calcular $kx$: com $k$ em rad/m, 60 cm vira 0,6 m.`,
        ],
        questoes: ['avulsa-contorno', 'p2-2026-1-d', 'p7'],
      },
      {
        id: 'modos-frequencias',
        titulo: 'Comprimentos de onda e frequências permitidos',
        formulas: [
          {
            nome: 'Duas pontas fixas: comprimentos de onda',
            tex: r`L = n\,\frac\lambda2`,
            explica: r`Entre dois nós cabe meia onda, então na corda cabem $n$ meias ondas, $n = 1, 2, 3, \dots$`,
          },
          {
            nome: 'Duas pontas fixas: frequências',
            tex: r`f_n = \frac{nv}{2L}`,
            explica: r`Vem de $f = v/\lambda$ com $\lambda = 2L/n$, sendo $v$ a velocidade da onda na corda. Aparecem todos os múltiplos inteiros do fundamental $v/2L$.`,
          },
          {
            nome: 'Uma fixa e uma livre: comprimentos de onda',
            tex: r`L = (2n+1)\,\frac\lambda4 \;\Leftrightarrow\; \lambda_n = \frac{4L}{2n+1}`,
            explica: r`Do ventre da ponta livre ao nó da ponta fixa cabe um número **ímpar** de quartos de onda, $n = 0, 1, 2, \dots$`,
          },
          {
            nome: 'Uma fixa e uma livre: frequências',
            tex: r`f_n = \frac{(2n+1)v}{4L}`,
            explica: r`Vem de $f = v/\lambda$ com $\lambda = 4L/(2n+1)$. Só aparecem os múltiplos ímpares do fundamental $v/4L$, na proporção 1 : 3 : 5.`,
          },
        ],
        quando: r`"Modos normais", "os três modos de menor frequência", "esboce os modos".`,
        bizus: [
          r`Fixa-livre só tem **harmônicos ímpares** (1 : 3 : 5): $\tfrac14$, $\tfrac34$, $\tfrac54$ de onda.`,
          r`Prender a ponta livre **dobra** a frequência fundamental ($\lambda$ vai de $4L$ para $2L$).`,
          r`No esboço, desenhe cada modo duas vezes (cheia e tracejada, espelhadas) e marque nós e ventres nas pontas.`,
        ],
        questoes: ['p2-2026-1-d', 'p7', 'avulsa-contorno', 'p13'],
      },
    ],
  },
  {
    id: 'reflexao',
    titulo: 'Reflexão de pulsos',
    resumo: 'Fixa inverte, livre não; conte o caminho e as inversões.',
    fichas: [
      {
        id: 'reflexao-regras',
        titulo: 'As duas regras de reflexão',
        formulas: [
          {
            nome: 'Reflexão na ponta fixa',
            tex: r`\text{inverte (gira } 180^\circ)`,
            explica: r`A ponta presa puxa a corda para o lado oposto (terceira lei de Newton): corcova volta como vale, e a parte que bateu primeiro sai na frente.`,
          },
          {
            nome: 'Reflexão na ponta livre',
            tex: r`\text{não inverte}`,
            explica: r`O anel sobe junto e devolve o pulso do mesmo lado. Só a ordem se espelha: a parte que bateu primeiro sai na frente.`,
          },
        ],
        quando: r`"Como fica o pulso depois de refletir", desenhos de pulsos.`,
        bizus: [
          r`Na ponta fixa o pulso **inverte e troca a ordem**: a parte que bateu primeiro sai na frente. É girar o desenho 180° em torno da ponta.`,
          r`Trocou a ordem sem inverter? Isso é ponta **livre**.`,
        ],
        questoes: ['p2-2025-1-q7'],
      },
      {
        id: 'reflexao-tempo',
        titulo: 'Quando o pulso volta',
        formulas: [
          {
            nome: 'Tempo de viagem',
            tex: r`t = \frac{\text{caminho}}{v}`,
            explica: r`Entre as pontas o pulso anda com velocidade constante $v$: some os trechos percorridos, ida e volta.`,
          },
          {
            nome: 'Fixa-livre: meia volta',
            tex: r`t = \frac{2L}{v}:\ \text{forma invertida}`,
            explica: r`Em $2L$ de caminho cada pedaço do pulso passou uma vez pela ponta fixa: a corda tem a forma inicial de cabeça para baixo.`,
          },
          {
            nome: 'Fixa-livre: volta completa',
            tex: r`t = \frac{4L}{v}:\ \text{forma original}`,
            explica: r`Duas passagens pela ponta fixa: as duas inversões se desfazem. É o período do modo fundamental ($\lambda = 4L$).`,
          },
        ],
        quando: r`"Menor tempo para a corda voltar à configuração inicial", "o pulso aparece com tal forma".`,
        bizus: [
          r`Faça uma tabela: posição, **sinal** (conte as passagens pela ponta fixa) e **sentido**. Só vale quando os três batem.`,
          r`Pulso **solto do repouso** vira dois de meia altura, um para cada lado.`,
          r`Pulso no meio andando para a direita, fixa à esquerda e livre à direita: em pé indo para a esquerda em $L/v$; invertido indo para a esquerda em $3L/v$.`,
        ],
        questoes: ['p2-2025-2-q5', 'p2-2024-2-q1'],
      },
    ],
  },
  {
    id: 'som',
    titulo: 'Som',
    resumo: 'Velocidade com √T, pressão em quadratura com o deslocamento, decibéis em escala log.',
    fichas: [
      {
        id: 'som-propriedades',
        titulo: 'Propriedades da onda sonora',
        formulas: [
          {
            nome: 'Velocidade do som num gás',
            tex: r`v = \sqrt{\frac{\gamma RT}{M}}`,
            explica: r`$T$ é a temperatura absoluta (K), $M$ a massa molar, $R$ a constante dos gases e $\gamma$ a razão $c_p/c_v$ (aqui não é o amortecimento). Cresce com $\sqrt T$.`,
          },
          {
            nome: 'Variação de pressão',
            tex: r`\Delta p = -B\frac{\partial s}{\partial x}`,
            explica: r`$s$ é o deslocamento das camadas de ar e $B$ o módulo de compressibilidade. A pressão muda onde o deslocamento varia de um ponto ao vizinho; por isso fica um quarto de onda defasada do deslocamento.`,
          },
          {
            nome: 'Intensidade sonora',
            tex: r`I = \tfrac12\rho v\,\omega^2 s_0^2`,
            explica: r`Potência por área: $\rho$ é a densidade do ar e $s_0$ a amplitude de deslocamento. Mesma amplitude com frequência maior: som mais intenso.`,
          },
          {
            nome: 'Comprimento de onda e período',
            tex: r`\lambda = v\tau`,
            explica: r`Em um período $\tau$ a onda anda um comprimento de onda. Com $v$ fixo, período menor dá $\lambda$ menor.`,
          },
        ],
        quando: r`Questões de "verdadeiro ou falso" sobre o som.`,
        bizus: [
          r`Som anda em sólidos, líquidos e gases; num gás, **mais quente = mais rápido**.`,
          r`Pressão e deslocamento estão **em quadratura**: onde o deslocamento é máximo, a variação de pressão é zero.`,
          r`Mesma amplitude, frequência maior: intensidade maior ($\propto\omega^2$).`,
        ],
        questoes: ['p2-2025-2-q7'],
      },
      {
        id: 'som-db',
        titulo: 'Nível sonoro',
        formulas: [
          {
            nome: 'Nível sonoro',
            tex: r`\beta = (10\ \text{dB})\log_{10}\frac{I}{I_0}`,
            explica: r`$I$ é a intensidade (W/m²) e $I_0 = 10^{-12}$ W/m² o limiar da audição. Escala logarítmica, como o ouvido percebe.`,
          },
          {
            nome: 'Diferença de níveis',
            tex: r`\beta_2 - \beta_1 = (10\ \text{dB})\log_{10}\frac{I_2}{I_1}`,
            explica: r`Subtraindo dois níveis, o $I_0$ cancela (diferença de logaritmos é o logaritmo da razão). $-20$ dB quer dizer $I_2/I_1 = 1/100$.`,
          },
        ],
        quando: r`"De 90 dB para 70 dB", "quantas vezes mais intenso".`,
        bizus: [r`Cada **10 dB = fator 10** na intensidade. Baixar 20 dB é dividir por 100: eliminar 99% da potência (não 22%).`],
        questoes: ['p8'],
      },
    ],
  },
  {
    id: 'doppler',
    titulo: 'Efeito Doppler',
    resumo: 'Uma fórmula, uma regra de sinais e o truque do eco.',
    fichas: [
      {
        id: 'doppler-base',
        titulo: 'Fórmula geral',
        formulas: [
          {
            nome: 'Doppler para o som',
            tex: r`f' = f\,\frac{v_{\text{som}} \pm v_{\text{obs}}}{v_{\text{som}} \mp v_{\text{fonte}}}`,
            explica: r`$f$ é a frequência emitida e $f'$ a ouvida; as velocidades são medidas em relação ao ar. Sinais de cima quando o movimento é de aproximação (observador indo para a fonte, fonte indo para o observador).`,
          },
        ],
        quando: r`Fonte e/ou observador em movimento em relação ao ar.`,
        bizus: [
          r`Observador no **numerador**, fonte no **denominador**. Escolha os sinais pelo bom senso: **aproximação aumenta** a frequência.`,
          r`Não use só a velocidade relativa: para o som, importa quem se move em relação ao **ar**.`,
        ],
        questoes: ['r2'],
      },
      {
        id: 'doppler-eco',
        titulo: 'Eco e radar: dois Dopplers',
        formulas: [
          {
            nome: 'O alvo recebe',
            tex: r`f_{\text{alvo}} = f_0\,\frac{c \pm u}{c \mp v_e}`,
            explica: r`$c$ é a velocidade da onda, $f_0$ a frequência emitida, $u$ a velocidade do alvo (aqui é o observador) e $v_e$ a do emissor (aqui é a fonte).`,
          },
          {
            nome: 'O alvo reemite',
            tex: r`f_{\text{eco}} = f_{\text{alvo}}\,\frac{c \pm v_e}{c \mp u}`,
            explica: r`Agora os papéis trocam: o alvo é a fonte e o emissor é quem ouve. Se $u = v_e$, as duas frações se cancelam e o eco volta sem desvio.`,
          },
        ],
        quando: r`Onda refletida num corpo em movimento (radar de polícia, morcego, eco).`,
        bizus: [
          r`O refletor primeiro **recebe** (é observador) e depois **reemite** (é fonte): aplique a fórmula duas vezes.`,
          r`Se emissor e alvo têm a mesma velocidade, o eco volta **sem desvio**.`,
        ],
        questoes: ['p12'],
      },
    ],
  },
]

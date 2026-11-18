const r = String.raw

/**
 * Bizuário de Física II: todas as fórmulas e "pulos do gato" que aparecem nas
 * questões da seção, organizados para decorar. Cada ficha aponta para as
 * questões em que é usada (ids de FISICA2); o teste exige que toda questão
 * esteja coberta por alguma ficha.
 */
export interface Ficha {
  id: string
  titulo: string
  /** Fórmulas em LaTeX, sem cifrões. */
  formulas: string[]
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
        formulas: [r`\ddot x + \omega^2 x = 0`, r`x(t) = A\cos(\omega t + \varphi)`, r`\omega = \sqrt{k/m},\quad T = \frac{2\pi}{\omega},\quad f = \frac1T`],
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
        formulas: [r`v = -A\omega\,\text{sen}(\omega t + \varphi),\quad v_{\max} = \omega A`, r`a = -\omega^2 x,\quad a_{\max} = \omega^2 A`],
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
        formulas: [r`x(0) = A\cos\varphi,\qquad v(0) = -A\omega\,\text{sen}\,\varphi`, r`A = \sqrt{x_0^2 + (v_0/\omega)^2}`],
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
        formulas: [r`k\,\Delta = mg \;\Rightarrow\; \omega = \sqrt{k/m} = \sqrt{g/\Delta}`],
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
        formulas: [r`\text{máximo} \to \text{zero} = \frac T4,\qquad \text{máximo} \to \text{mínimo} = \frac T2`],
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
        formulas: [r`E = \tfrac12 kA^2 = \tfrac12 m\omega^2A^2`, r`U = E\cos^2(\omega t + \varphi),\quad K = E\,\text{sen}^2(\omega t + \varphi)`, r`\frac KU = \tan^2(\omega t + \varphi)`],
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
        formulas: [r`\omega = \sqrt{g/L},\qquad T = 2\pi\sqrt{L/g}`, r`E = \tfrac12 mL^2\dot\theta^2 + \tfrac12 mgL\theta^2`, r`\theta_{\max} = \frac AL \;\Rightarrow\; E = \frac{mgA^2}{2L}`],
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
        formulas: [r`T = \tfrac12 T_1 + \tfrac12 T_2 = \pi\sqrt{\tfrac{L_1}{g}} + \pi\sqrt{\tfrac{L_2}{g}}`],
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
        formulas: [r`F_y = -\frac{2GMm\,y}{(y^2 + d^2/4)^{3/2}} \approx -\frac{16GMm}{d^3}\,y`, r`\omega = \sqrt{\frac{16GM}{d^3}} = \frac4d\sqrt{\frac{GM}{d}}`],
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
        formulas: [r`\omega^2 = \frac{k}{M + m}`, r`m\,\omega^2 A \le \mu_e m g \;\Rightarrow\; A_{\max} = \frac{\mu_e(M + m)g}{k}`],
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
        formulas: [r`\ddot x + \gamma\dot x + \omega_0^2 x = 0`, r`x = A\,e^{-\gamma t/2}\cos(\omega t + \varphi),\quad \omega = \sqrt{\omega_0^2 - \gamma^2/4}`, r`E(t) = E_0\,e^{-\gamma t}`],
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
        formulas: [r`R = \frac{x_{n+1}}{x_n} = e^{-\gamma\tau/2},\qquad \delta = |\ln R| = \frac{\gamma\tau}{2}`, r`\text{após } n \text{ períodos: } R^n`],
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
        formulas: [r`\ddot x + \gamma\dot x + \omega_0^2x = f\cos\omega t`, r`A(\omega) = \frac{f}{\sqrt{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}}`],
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
        formulas: [r`\omega \ll \omega_0:\ \text{em fase},\quad \omega = \omega_0:\ \tfrac\pi2,\quad \omega \gg \omega_0:\ \text{oposição, amplitude} \to 0`],
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
        formulas: [r`y = A\,\text{sen}(kx \mp \omega t)`, r`k = \frac{2\pi}{\lambda},\quad \omega = \frac{2\pi}{T} = 2\pi f,\quad v = \frac\omega k = \lambda f`],
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
        formulas: [r`\frac{\partial^2 y}{\partial x^2} = \frac{1}{v^2}\frac{\partial^2 y}{\partial t^2}`, r`y = f(x - vt) + g(x + vt)`],
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
        formulas: [r`v = \sqrt{T/\mu} \;\Leftrightarrow\; T = \mu v^2`],
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
        formulas: [r`\bar P = \tfrac12\mu\omega^2A^2\,v = \tfrac12\sqrt{T\mu}\;\omega^2A^2`, r`E_{\text{entre nós}} = \frac{\pi^2TA^2}{2L}\ \ (\text{estacionária, modo com }\lambda = L)`],
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
        formulas: [r`A\cos(kx - \omega t) + A\cos(kx + \omega t) = 2A\cos kx\cos\omega t`, r`A\,\text{sen}(kx + \omega t) - A\,\text{sen}(kx - \omega t) = 2A\cos kx\,\text{sen}\,\omega t`, r`\cos(\theta + \tfrac\pi2) = -\text{sen}\,\theta`],
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
        formulas: [r`\text{nós vizinhos: } \frac\lambda2 = \frac\pi k,\qquad \text{nó ao ventre: } \frac\lambda4`],
        quando: r`"Distância entre nós", "menor comprimento de corda".`,
        bizus: [r`Para caber numa corda presa nas duas pontas, o comprimento tem de ser múltiplo de $\lambda/2$; o menor é a própria distância entre nós.`],
        questoes: ['p6', 'p7'],
      },
      {
        id: 'estacionaria-inicial',
        titulo: 'Onda a partir das condições iniciais',
        formulas: [r`A\cos kx\cos\omega t + B\,\text{sen}\,kx\,\text{sen}\,\omega t = \tfrac{A+B}{2}\cos(kx - \omega t) + \tfrac{A-B}{2}\cos(kx + \omega t)`],
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
        formulas: [r`\text{fixa: } y(x_p, t) = 0\ \ (\text{nó})`, r`\text{livre: } \frac{\partial y}{\partial x}(x_p, t) = 0\ \ (\text{ventre})`],
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
        formulas: [r`\text{fixa-fixa: } L = n\frac\lambda2,\quad f_n = \frac{nv}{2L}`, r`\text{fixa-livre: } L = (2n+1)\frac\lambda4,\quad \lambda_n = \frac{4L}{2n+1},\quad f_n = \frac{(2n+1)v}{4L}`],
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
        formulas: [r`\text{fixa: inverte (gira } 180^\circ)`, r`\text{livre: não inverte}`],
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
        formulas: [r`t = \frac{\text{caminho percorrido}}{v}`, r`\text{fixa-livre: invertida em } \tfrac{2L}{v},\ \text{igual em } \tfrac{4L}{v}`],
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
        formulas: [r`v = \sqrt{\frac{\gamma RT}{M}} \propto \sqrt T`, r`\Delta p = -B\frac{\partial s}{\partial x}`, r`I = \tfrac12\rho v\,\omega^2 s_0^2,\qquad \lambda = v\tau`],
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
        formulas: [r`\beta = (10\ \text{dB})\log_{10}\frac{I}{I_0}`, r`\beta_2 - \beta_1 = 10\log_{10}\frac{I_2}{I_1}`],
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
        formulas: [r`f' = f\,\frac{v_{\text{som}} \pm v_{\text{obs}}}{v_{\text{som}} \mp v_{\text{fonte}}}`],
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
        formulas: [r`f_{\text{alvo}} = f_0\,\frac{c \pm u}{c \mp v_f},\qquad f_{\text{eco}} = f_{\text{alvo}}\,\frac{c \pm v_f}{c \mp u}`],
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

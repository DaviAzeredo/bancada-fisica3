import type { ProvaInput } from '../../scenario/schema'
import { FORMULARIO_P3 } from '../formularios'

const r = String.raw

/* Exercício 1: espira quadrada ao lado de um fio, com três velocidades possíveis. */
const VX1 = '(modo==1 ? v : (modo==3 ? 0-v/sqrt(2) : 0))'
const VY1 = '(modo==2 ? v : (modo==3 ? 0-v/sqrt(2) : 0))'
const s1 = `(s0 + ${VX1}*t)`

/* Exercício 2: ímã com o polo S voltado para a espira; quem se move depende da situação. */
const ym2 = '(modo==1 ? y0 - v*t : (modo==2 ? y0 + v*t : y0))'
const yl2 = '(modo==3 ? v*t : (modo==4 ? 0-v*t : 0))'

/* Exercício 4: borda da frente da bobina e a parte dela que está dentro da região de campo. */
const xr4 = '(x0 + v*t)'
const dentro4 = `max(min(${xr4}, W) - max(${xr4} - l, 0), 1e-9)`
const transicao4 = '((x0 > 0 && x0 < l) ? 1 : ((x0 > W && x0 < W + l) ? -1 : 0))'

/* Exercício 6: barra caindo com velocidade v(t) = vt(1 − e^(−t/τ)); o relógio começa em t0. */
const tau6 = '(m*Rr/(B0^2*L^2))'
const vt6 = `(m*g*Rr/(B0^2*L^2))`
const T6 = '(t + t0)'
const vy6 = `(${vt6}*(1 - exp(0-${T6}/${tau6})))`
const s6 = `(${vt6}*(${T6} - ${tau6}*(1 - exp(0-${T6}/${tau6}))))`
const yb6 = `(0-(y0 + ${s6}))`

/* Exercício 7: espira girando em torno de x; a normal começa em +z. */
const th7 = '(w*(t + t0))'

/* Exercício 10: campo uniforme crescendo dentro de um disco e o campo elétrico que ele induz. */
const circ10 = Array.from({ length: 49 }, (_, k) => [`1.5*R*cos(${(2 * Math.PI * k) / 48})`, `1.5*R*sin(${(2 * Math.PI * k) / 48})`, 0] as [string, string, number])

export const lista_08: ProvaInput = {
  id: 'lista-08',
  titulo: 'Lista 8 · Indução eletromagnética',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  formulario: FORMULARIO_P3,
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Espira ao lado de um fio, em três direções',
      resumo: 'Só induz corrente quem muda a distância ao fio.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.555] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, -1, 20], alvo: [3, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 3 } },
      parametros: [
        { id: 'modo', rotulo: 'Velocidade', valor: 1, opcoes: [{ valor: 1, rotulo: 'v₁: se afasta' }, { valor: 2, rotulo: 'v₂: paralela ao fio' }, { valor: 3, rotulo: 'v₃: diagonal, se aproxima' }] },
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 2, max: 50, passo: 1 },
        { id: 'a', rotulo: 'Lado da espira', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.001 },
        { id: 's0', rotulo: 'Distância do lado mais próximo', simbolo: 's', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.01, unidade: 'm/s', min: 0.002, max: 0.02, passo: 0.001 },
        { id: 'Rr', rotulo: 'Resistência da espira', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.01, max: 1, passo: 0.01 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'S', tipo: 'espiraSensora', centro: [`${s1} + a/2`, `${VY1}*t`, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [`${s1} + a/2`, `${VY1}*t`, 0], vetor: [VX1, `${VY1} + 1e-12`, 0], comprimento: '2.5*cm', rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'Fluxo (normal saindo do papel)', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: '0-mu0*I0*a/(2*pi)*ln((s0 + a)/s0)' },
        { rotulo: 'fem (+ = anti-horário)', simbolo: r`\varepsilon`, expr: "1e6*fem('S')", unidade: 'μV', teoria: `1e6*(0-mu0*I0*a^2*${VX1}/(2*pi*s0*(s0 + a)))` },
        { rotulo: 'Força na espira (+ = se afasta do fio)', simbolo: r`F_x`, expr: "1e9*Iind('S')*a*(mag(B(s0, 0, 0)) - mag(B(s0 + a, 0, 0)))", unidade: 'nN', teoria: `1e9*(0-(mu0*I0*a^2/(2*pi*s0*(s0 + a)))^2*${VX1}/Rr)` },
      ],
      graficos: [{ titulo: 'fem no tempo', tipo: 'tempo', janela: 3, series: [{ rotulo: 'fem', expr: "1e6*fem('S')", unidade: 'μV' }] }],
      passos: [
        {
          titulo: 'v₁: afastando',
          texto: r`À direita do fio, $\vec B$ entra no papel e cai como $1/s$. Afastando, o fluxo para dentro **diminui**; a corrente induzida repõe o que se perde: sentido **horário**. A força aponta para o fio: Lenz tenta impedir o afastamento.`,
          parametros: { modo: 1 },
          medidas: [1, 2],
        },
        { titulo: 'v₂: paralela ao fio', texto: r`Subindo ao longo do fio, cada ponto da espira continua à mesma distância: o fluxo não muda, $\varepsilon = 0$, sem corrente e sem força.`, parametros: { modo: 2 }, medidas: [1, 2] },
        {
          titulo: 'v₃: diagonal',
          texto: r`Só a componente horizontal importa, e ela aproxima a espira do fio: o fluxo para dentro **aumenta**, a corrente sai **anti-horária** e a força empurra para longe do fio (repulsão).`,
          parametros: { modo: 3 },
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`Há corrente com $\vec v_1$ (horária) e com $\vec v_3$ (anti-horária); com $\vec v_2$, não.` },
        { item: '(b)', texto: r`$\vec v_1$: força para o fio (atração); $\vec v_2$: nenhuma; $\vec v_3$: força para longe do fio (repulsão). Em todos os casos a força se opõe à variação do fluxo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e de Lenz', lab: 'faraday' }, { texto: 'Espira perto de um fio', lab: 'movimento' }],
        etapas: [
          {
            titulo: '(a) Em que movimentos aparece corrente, e em que sentido',
            texto: r`**O que se pede.** Uma espira quadrada no mesmo plano de um fio infinito com corrente $I$ pode andar com $\vec v_1$ (afastando-se, perpendicular ao fio), $\vec v_2$ (paralela ao fio) ou $\vec v_3$ (na diagonal). Em quais casos surge corrente, e em que sentido?

**A ideia: lei de Faraday.** Uma fem aparece numa espira quando o **fluxo magnético** através dela **muda** (formulário):
$$\mathcal E_\text{ind} = -\frac{d\Phi_{\vec B}}{dt}.$$
O sinal de menos é a **lei de Lenz**: a corrente induzida circula no sentido que cria um campo **contra a variação** do fluxo. Se o fluxo aumenta, ela cria campo oposto; se diminui, cria campo a favor, tentando repor.

**O campo do fio.** Ele vale $B = \dfrac{\mu_0I}{2\pi s}$ a uma distância $s$ (mais fraco longe) e, do lado em que a espira está, aponta **para dentro** do papel (regra da mão direita com a corrente da figura). O fluxo através da espira depende só da distância dela ao fio.

**Caso a caso.**
- **$\vec v_1$ (afastando):** a espira vai para onde o campo é mais fraco: o fluxo para dentro **diminui**. Para repor, a corrente induzida cria campo **para dentro** dentro da espira: sentido **horário** (regra da mão direita).
- **$\vec v_2$ (paralela ao fio):** cada ponto da espira continua à mesma distância do fio. O fluxo **não muda**: $\mathcal E = 0$, sem corrente.
- **$\vec v_3$ (diagonal):** só a parte da velocidade perpendicular ao fio muda a distância; na figura, ela **aproxima** a espira do fio. O fluxo para dentro **aumenta**; a corrente cria campo para fora: sentido **anti-horário**.

**Cuidado.** Andar num campo magnético não basta para induzir corrente: é preciso que o **fluxo** mude.`,
            passo: 0,
          },
          {
            titulo: '(b) A força sobre a espira e a lei de Lenz',
            texto: r`**O que se pede.** O sentido da força magnética total sobre a espira nos três casos, interpretando com a lei de Lenz.

**A ideia.** A corrente induzida, dentro do campo do fio, sofre a força $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$ (formulário) em cada lado. Os lados paralelos ao fio dão forças opostas (um atraído, outro repelido); como o campo é mais forte perto do fio, ganha o lado **mais próximo**. Correntes paralelas se atraem e antiparalelas se repelem.

**Caso a caso.**
- **$\vec v_1$:** corrente horária. No lado mais próximo do fio, ela tem o **mesmo sentido** da corrente do fio: atração. Força total **para o fio**, contra o afastamento.
- **$\vec v_2$:** sem corrente, **sem força**.
- **$\vec v_3$:** corrente anti-horária. No lado mais próximo, ela é **oposta** à do fio: repulsão. Força **para longe** do fio, contra a aproximação.

**A lei de Lenz em ação.** Em todo caso, a força **se opõe ao movimento** que causa a variação do fluxo: tenta impedir o afastamento em $\vec v_1$ e a aproximação em $\vec v_3$. É a natureza "tentando" manter o fluxo como estava. Por isso, para mover a espira, alguém tem de realizar trabalho, e essa energia é dissipada na resistência da espira.`,
            passo: 2,
          },
        ],
        resultado: r`Corrente em $v_1$ (horária) e $v_3$ (anti-horária); forças de atração em $v_1$ e repulsão em $v_3$.`,
        errosComuns: ['Achar que qualquer movimento num campo induz corrente: precisa variar o fluxo.'],
        oficial: { resposta: r`(a) Só em (I), horária, e (III), anti-horária; (b) atração em (I) e repulsão em (III).` },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Fácil',
      titulo: 'Ímã e espira: quatro situações',
      resumo: 'Aproximar repele, afastar atrai, quem quer que se mova.',
      figura: [
        { pagina: 1, recorte: [0.089, 0.556, 0.936, 0.903] },
        { pagina: 2, recorte: [0.089, 0.062, 0.936, 0.099] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [9, 5, 11], alvo: [0, 3, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 3 } },
      parametros: [
        {
          id: 'modo',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(i) ímã desce' },
            { valor: 2, rotulo: '(ii) ímã sobe' },
            { valor: 3, rotulo: '(iii) espira sobe' },
            { valor: 4, rotulo: '(iv) espira desce' },
          ],
        },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.01, unidade: 'm/s', min: 0.002, max: 0.02, passo: 0.001 },
        { id: 'y0', rotulo: 'Altura do centro do ímã', simbolo: 'h', valor: 0.06, unidade: 'm', min: 0.045, max: 0.08, passo: 0.001 },
      ],
      objetos: [
        { id: 'ima', tipo: 'ima', centro: [0, ym2, 0], eixo: 'y', comprimento: 0.04, raio: 0.008, intensidade: 2000, rotulo: 'N em cima, S embaixo' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, yl2, 0], normal: 'y', raio: 0.03, R: 1, rotulo: 'espira' },
      ],
      medidas: [
        { rotulo: 'Fluxo (para cima)', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb' },
        { rotulo: 'fem (+ = anti-horário visto de cima)', simbolo: r`\varepsilon`, expr: "fem('S')", unidade: 'V' },
      ],
      graficos: [{ titulo: 'fem no tempo', tipo: 'tempo', janela: 3, series: [{ rotulo: 'fem', expr: "fem('S')", unidade: 'V' }] }],
      passos: [
        {
          titulo: 'O campo na espira',
          texto: r`O polo S está voltado para a espira, e as linhas de $\vec B$ **entram** no polo S: na espira, $\vec B$ aponta para cima, e o fluxo para cima é maior quanto mais perto o ímã.`,
          parametros: { modo: 1 },
          medidas: [0],
        },
        {
          titulo: '(i) e (iii): aproximando',
          texto: r`Fluxo para cima **aumentando**: a corrente induzida cria campo para baixo, sentido **horário** visto de cima ($\varepsilon < 0$). Ela forma um ímã com o polo S para cima, e polos iguais se **repelem**.`,
          parametros: { modo: 3 },
          medidas: [1],
        },
        {
          titulo: '(ii) e (iv): afastando',
          texto: r`Fluxo **diminuindo**: corrente **anti-horária** ($\varepsilon > 0$), polo N para cima, e a força **atrai**, tentando impedir o afastamento.`,
          parametros: { modo: 4 },
          medidas: [1],
        },
        {
          titulo: '(c) Origem da fem',
          texto: r`Em (i) e (ii) a espira está parada e o campo muda: é o **campo elétrico induzido**. Em (iii) e (iv) a espira se move num campo estacionário: é **fem de movimento**, $\oint(\vec v\times\vec B)\cdot d\vec\ell$. Mesmo movimento relativo, mesma fem.`,
          parametros: { modo: 1 },
        },
      ],
      respostas: [
        { item: '(a)', texto: r`(i) e (iii): horária (vista de cima); (ii) e (iv): anti-horária.` },
        { item: '(b)', texto: r`(i) e (iii): repulsão; (ii) e (iv): atração. Lenz: a força se opõe ao movimento relativo.` },
        { item: '(c)', texto: r`(i) e (ii): campo elétrico induzido (B varia no tempo); (iii) e (iv): fem de movimento.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lenz com ímã e espira', lab: 'faraday' }],
        etapas: [
          {
            titulo: '(a) O sentido da corrente nas quatro situações',
            texto: r`**O que se pede.** O sentido da corrente induzida na espira em cada uma das quatro situações: (i) o ímã se aproxima, (ii) o ímã se afasta, (iii) a espira se aproxima, (iv) a espira se afasta.

**A ideia: Faraday e Lenz.** A fem é $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$ (formulário). Pela lei de Lenz, a corrente induzida cria um campo que se **opõe à variação** do fluxo.

**O campo do ímã na espira.** As linhas de campo de um ímã saem do polo N e **entram** no polo S. Na figura, o polo **S** fica na ponta de baixo do ímã, voltado para a espira, que está abaixo dele. Então, na espira, $\vec B$ aponta **para cima**, para o polo S. Quanto mais perto o ímã, mais forte o campo e maior o fluxo.

**Caso a caso.** O que importa é se a distância entre ímã e espira diminui ou aumenta; não importa quem se move.
- **(i) e (iii), aproximando:** o fluxo para cima **aumenta**. A corrente induzida cria campo para **baixo** dentro da espira: sentido **horário** visto de cima.
- **(ii) e (iv), afastando:** o fluxo para cima **diminui**. A corrente cria campo para **cima**, repondo: sentido **anti-horário** visto de cima.`,
            passo: 1,
          },
          {
            titulo: '(b) A força do ímã sobre a espira',
            texto: r`**O que se pede.** O sentido da força do ímã sobre a espira em cada situação, se é atrativa ou repulsiva, e a interpretação pela lei de Lenz.

**A ideia.** Uma espira com corrente se comporta como um pequeno ímã, com o polo **N** do lado para onde aponta o seu campo (o momento de dipolo, $\vec\mu = NI\vec A$ do formulário). Polos iguais se repelem e opostos se atraem.

**Caso a caso.**
- **(i) e (iii), aproximando:** a corrente horária cria campo para baixo; a espira tem o polo N embaixo e o polo **S em cima**, de frente para o polo **S** do ímã. Polos iguais: **repulsão**.
- **(ii) e (iv), afastando:** a corrente anti-horária cria campo para cima; a espira tem o polo **N em cima**, de frente para o **S** do ímã. Polos opostos: **atração**.

**A lei de Lenz.** A força sempre se opõe ao **movimento relativo**: ao aproximar, ela repele, dificultando a aproximação; ao afastar, ela atrai, dificultando o afastamento. Se fosse o contrário, um pequeno empurrão faria o ímã acelerar sozinho, criando energia do nada.`,
            passo: 2,
          },
          {
            titulo: '(c) A origem da fem: movimento ou campo induzido',
            texto: r`**O que se pede.** Dizer, em cada situação, se a fem vem de **fem de movimento** ou de **campo elétrico induzido**, justificando.

**A ideia.** A lei de Faraday junta dois mecanismos diferentes:
- **fem de movimento:** a espira se move num campo magnético que não muda no tempo. Cada carga do fio, andando junto com ele, sente a força magnética $q\vec v\times\vec B$, que a empurra ao longo do fio. A fem é $\mathcal E = \oint(\vec v\times\vec B)\cdot d\vec\ell$.
- **campo elétrico induzido:** a espira está parada e o campo magnético muda no tempo. As cargas do fio estão paradas, então não há força magnética nelas. Quem as empurra é um **campo elétrico** criado pela variação de $\vec B$, com $\oint\vec E\cdot d\vec\ell = -\dfrac{d\Phi_{\vec B}}{dt}$ (formulário).

**Caso a caso.**
- **(i) e (ii):** a espira está parada e o ímã se move; o campo na espira muda no tempo: **campo elétrico induzido**.
- **(iii) e (iv):** o ímã está parado (campo estacionário) e a espira se move: **fem de movimento**.

**Repare.** O resultado é o mesmo para o mesmo movimento relativo; só a explicação muda conforme quem se move. Essa coincidência foi uma das pistas que levaram Einstein à relatividade.`,
            passo: 3,
          },
        ],
        resultado: r`Horária e repulsão ao aproximar; anti-horária e atração ao afastar.`,
        errosComuns: ['Ler o polo errado: na figura, o polo S está embaixo, voltado para a espira.'],
        oficial: { resposta: r`(a) (I) e (III) horário, (II) e (IV) anti-horário; (b) (I) e (III) repulsão, (II) e (IV) atração; (c) campo elétrico induzido em (I) e (II), fem de movimento em (III) e (IV).` },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Médio',
      titulo: 'Solenoide com corrente crescente e uma espira',
      resumo: 'Nos dois sentidos de corrente, a espira é repelida.',
      figura: { pagina: 2, recorte: [0.089, 0.1, 0.936, 0.449] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [10, 8, 14], alvo: [0, 0, 2] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 4 } },
      parametros: [
        { id: 'sentido', rotulo: 'Corrente no solenoide', valor: 1, opcoes: [{ valor: 1, rotulo: '(I) de A para B' }, { valor: -1, rotulo: '(II) de B para A' }] },
        { id: 'k', rotulo: 'Taxa de aumento da corrente', simbolo: 'dI/dt', valor: 2, unidade: 'A/s', min: 0.5, max: 5, passo: 0.1 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 1, unidade: 's', min: 1, max: 1, passo: 0.1 },
        { id: 'a', rotulo: 'Raio do solenoide', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02, passo: 0.001 },
        { id: 'zl', rotulo: 'Posição da espira', simbolo: 'z_e', valor: 0.07, unidade: 'm', min: 0.055, max: 0.09, passo: 0.001 },
      ],
      objetos: [
        { id: 'sol', tipo: 'solenoide', I: 'sentido*k*(t + t0)', centro: [0, 0, 0], eixo: 'z', raio: 'a', comprimento: 0.1, N: 200, rotulo: 'solenoide' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 'zl'], normal: 'z', raio: '2*a', R: 0.5, rotulo: 'espira (raio 2a)' },
      ],
      medidas: [
        { rotulo: 'fem na espira (+ = anti-horário visto de +z)', simbolo: r`\varepsilon`, expr: "0-fluxoB('S')/(t + t0)", unidade: 'V' },
        { rotulo: 'Componente radial de B no fio da espira', simbolo: r`B_\rho`, expr: 'x(B(2*a, 0, zl))', unidade: 'T' },
        { rotulo: 'Força axial na espira (+ = se afasta do solenoide)', simbolo: r`F_z = -I_\text{ind}B_\rho\,2\pi(2a)`, expr: "fluxoB('S')/((t + t0)*0.5)*x(B(2*a, 0, zl))*2*pi*2*a", unidade: 'N' },
      ],
      passos: [
        {
          titulo: '(I) Corrente crescente de A para B',
          texto: r`O fluxo do solenoide através da espira aumenta. A corrente induzida circula **ao contrário** da do solenoide, e correntes antiparalelas se repelem: a força empurra a espira para longe (positiva na medida).`,
          parametros: { sentido: 1 },
          medidas: [0, 2],
        },
        {
          titulo: '(II) De B para A',
          texto: r`Invertendo a corrente, o campo e a corrente induzida trocam de sinal juntos. A força, que depende do produto, continua de **repulsão**.`,
          parametros: { sentido: -1 },
          medidas: [0, 2],
        },
        { titulo: 'Lenz', texto: r`O fluxo cresce nos dois casos, e a espira foge do aumento: repulsão ao longo de $+\hat z$, afastando-se do solenoide.` },
      ],
      respostas: [
        { item: '(I)', texto: r`Repulsão: força ao longo de $+\hat z$, afastando a espira do solenoide.` },
        { item: '(II)', texto: r`Repulsão também: o sinal da corrente não importa, só o fato de ela crescer.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lenz: oposição ao aumento de fluxo', lab: 'faraday' }, { texto: 'Força entre correntes antiparalelas', lab: 'forcas' }],
        etapas: [
          {
            titulo: '(I) Corrente crescente de A para B',
            texto: r`**O que se pede.** Um solenoide finito, com corrente que **cresce** com o tempo (de A para B), está perto de uma espira coaxial de raio $2a$. Qual o sentido da força do solenoide sobre a espira?

**A ideia: Faraday e Lenz.** O campo do solenoide atravessa a espira. Com a corrente crescendo, o campo cresce e o **fluxo** pela espira aumenta. Pela lei de Faraday (formulário: $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$) e de Lenz, surge na espira uma corrente que cria campo **contra** esse aumento: ela circula no sentido **oposto** ao da corrente do solenoide.

**A força.** Duas correntes circulares coaxiais em sentidos opostos são como fios com correntes **antiparalelas**: elas se **repelem**. (Visto de outro jeito: o solenoide e a espira viram dois ímãs com polos iguais frente a frente.)

Mais precisamente: perto da ponta do solenoide, as linhas de campo se abrem, e o campo na espira tem uma parte **radial**. A força $I\,d\vec\ell\times\vec B$ (formulário) dessa parte radial sobre a corrente induzida aponta ao longo do eixo, **para longe** do solenoide.

**Resposta.** **Repulsão**: a espira é empurrada para longe do solenoide, ao longo do eixo ($+\hat z$, na figura).

**Lenz.** A espira "foge" do aumento de fluxo: afastando-se, ela diminui o fluxo que a atravessa.`,
            passo: 0,
          },
          {
            titulo: '(II) Corrente crescente de B para A',
            texto: r`**O que se pede.** A mesma pergunta, agora com a corrente do solenoide no sentido oposto (de B para A), mas ainda **crescendo**.

**A ideia.** Inverter a corrente do solenoide inverte o campo dele em todo lugar. Mas o fluxo continua **aumentando em módulo**, porque a corrente cresce. Pela lei de Lenz, a corrente induzida continua **oposta** à do solenoide, e por isso também troca de sentido.

**A força.** A força depende do **produto** da corrente induzida pelo campo do solenoide ($I\,d\vec\ell\times\vec B$, formulário). Os dois trocaram de sinal juntos, e o produto não muda: continuam sendo correntes antiparalelas, que se repelem.

**Resposta.** **Repulsão** também, no mesmo sentido ($+\hat z$).

**O que decide.** Não é o sentido da corrente do solenoide, e sim se ela **cresce** ou **diminui**. Se ela diminuísse (em qualquer sentido), a corrente induzida ficaria a favor da do solenoide e a espira seria **atraída**, tentando manter o fluxo.`,
            passo: 1,
          },
        ],
        resultado: r`Repulsão ($+\hat z$) nas duas situações.`,
        errosComuns: ['Inverter a força ao inverter a corrente: o que decide é a corrente crescer.'],
        oficial: { resposta: r`(I) Repulsão, $\hat z$; (II) Repulsão, $\hat z$.` },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Médio',
      titulo: 'Bobina atravessando uma região de campo',
      resumo: 'Corrente só nas bordas da região, e a força freia: F = N²B²w²v/R.',
      figura: { pagina: 2, recorte: [0.089, 0.45, 0.936, 0.819] },
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [4, 1, 25], alvo: [4, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 9 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.02, unidade: 'm/s', min: 0.005, max: 0.04, passo: 0.001 },
        { id: 'w', rotulo: 'Altura da bobina', simbolo: 'w', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.001 },
        { id: 'l', rotulo: 'Comprimento da bobina', simbolo: 'l', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.001 },
        { id: 'W', rotulo: 'Largura da região', simbolo: 'D', valor: 0.1, unidade: 'm', min: 0.08, max: 0.11, passo: 0.002 },
        { id: 'N', rotulo: 'Número de voltas', simbolo: 'N', valor: 10, unidade: '', min: 1, max: 50, passo: 1 },
        { id: 'R', rotulo: 'Resistência', simbolo: 'R', valor: 2, unidade: 'Ω', min: 0.5, max: 10, passo: 0.1 },
        { id: 'x0', rotulo: 'Borda da frente em t = 0', simbolo: 'x_0', valor: 0.02, unidade: 'm', min: -0.03, max: 0.14, passo: 0.001 },
      ],
      objetos: [
        { id: 'Br', tipo: 'campoB', valor: [0, 0, '0-B0'], regiao: { min: [0, -0.05, -0.03], max: ['W', 0.05, 0.03] }, rotulo: 'B entrando' },
        { id: 'M', tipo: 'espiraSensora', centro: [`${xr4} - l/2`, 0, 0], normal: 'z', largura: 'l', altura: 'w', eixoU: 'x', N: 'N', R: 'R', rotulo: 'bobina' },
        { id: 'Si', tipo: 'espiraSensora', centro: [`(max(${xr4} - l, 0) + min(${xr4}, W))/2`, 0, 0], normal: 'z', largura: dentro4, altura: 'w', eixoU: 'x', N: 'N', R: 'R', oculta: true },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [`${xr4} - l/2`, '0.6*w + 0.01', 0], vetor: [1, 0, 0], comprimento: '2.5*cm', rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'fem (+ = anti-horário)', simbolo: r`\varepsilon`, expr: "fem('Si')", unidade: 'V', teoria: `N*B0*w*v*${transicao4}` },
        { rotulo: 'Corrente induzida', simbolo: r`I = \frac{NBwv}{R}`, expr: "Iind('Si')", unidade: 'A', teoria: `N*B0*w*v/R*${transicao4}` },
        { rotulo: 'Força freando a bobina', simbolo: r`F = NIwB = \frac{N^2B^2w^2v}{R}`, expr: "N*abs(Iind('Si'))*w*B0", unidade: 'N', teoria: `N^2*B0^2*w^2*v/R*abs(${transicao4})` },
      ],
      graficos: [
        { titulo: 'Fluxo e corrente no tempo', tipo: 'tempo', janela: 9, series: [{ rotulo: 'Φ por volta', expr: "fluxoB('Si')", unidade: 'Wb' }, { rotulo: 'I', expr: "Iind('Si')", unidade: 'A' }] },
      ],
      passos: [
        {
          titulo: '(i) Entrando',
          texto: r`A parte imersa cresce a $wv$ por segundo, e o fluxo para dentro cresce com ela: $|\varepsilon| = NBwv$. A corrente sai **anti-horária**, para criar campo para fora, com $I = NBwv/R$.`,
          parametros: { x0: 0.02 },
          medidas: [0, 1],
        },
        { titulo: '(ii) Toda dentro', texto: r`Fluxo máximo, mas **constante**: $\varepsilon = 0$ e nenhuma corrente.`, parametros: { x0: 0.07 }, medidas: [0, 1] },
        { titulo: '(iii) Saindo', texto: r`O fluxo cai a $NBwv$ por segundo: corrente **horária**, mesma intensidade.`, parametros: { x0: 0.12 }, medidas: [0, 1] },
        {
          titulo: '(b) A força',
          texto: r`Só o lado vertical dentro do campo sente força, e em cada uma das $N$ voltas ela vale $IwB$:
$$F = N\,IwB = \frac{N^2B^2w^2v}{R},$$
contra o movimento, na entrada e na saída ($-\hat x$). O gabarito da monitoria escreve $NB^2w^2v/R$: falta um fator $N$, porque a fem já tem um $N$ e a força soma as $N$ voltas.`,
          parametros: { x0: 0.02 },
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`(i) $I = NBwv/R$, anti-horária; (ii) zero; (iii) $I = NBwv/R$, horária.` },
        { item: '(b)', texto: r`(i) e (iii): $\vec F = -\dfrac{N^2B^2w^2v}{R}\hat x$; (ii): $\vec F = \vec 0$.` },
        { item: '(c)', texto: r`O fluxo sobe em rampa, fica num patamar e desce em rampa; a corrente é um pulso positivo na entrada e um negativo na saída, nulo no meio.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Espira cruzando uma região de campo', lab: 'movimento' }],
        etapas: [
          {
            titulo: '(a) A corrente ao entrar, dentro e ao sair',
            texto: r`**O que se pede.** Intensidade e sentido da corrente induzida numa bobina retangular (lados $w$, na direção perpendicular ao movimento, e $l$; $N$ voltas; resistência $R$) que atravessa com velocidade constante $v$ uma região de campo uniforme $\vec B$ (entrando no papel), em três fases: (i) entrando, (ii) toda dentro, (iii) saindo.

**A ideia: lei de Faraday.** Para uma bobina de $N$ voltas, a fem é $N$ vezes a de uma volta (as voltas estão em série):
$$\mathcal E = -N\frac{d\Phi_{\vec B}}{dt},$$
com $\Phi_{\vec B}$ o fluxo por uma volta (formulário: $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$). O fluxo, com campo uniforme, é $B$ vezes a **área da bobina que está dentro do campo**. A corrente é $I = |\mathcal E|/R$ (lei de Ohm).

**(i) Entrando.** A cada segundo, entra no campo uma faixa de largura $v$ e altura $w$: a área imersa cresce a uma taxa $wv$.
$$\left|\frac{d\Phi}{dt}\right| = Bwv\quad\Rightarrow\quad|\mathcal E| = NBwv,\qquad I = \frac{NBwv}{R}.$$
Sentido, por Lenz: o fluxo para **dentro** do papel aumenta, e a corrente cria campo para **fora**: **anti-horária**.

**(ii) Toda dentro.** O fluxo é máximo, mas **constante**: $d\Phi/dt = 0$, **sem corrente**.

**(iii) Saindo.** A área imersa diminui a uma taxa $wv$: $I = \dfrac{NBwv}{R}$ de novo. Agora o fluxo para dentro **diminui**, e a corrente o repõe, criando campo para dentro: **horária**.`,
            passo: 0,
          },
          {
            titulo: '(b) A força sobre a bobina nas três fases',
            texto: r`**O que se pede.** Módulo, direção e sentido da força magnética total sobre a bobina nas três fases.

**A ideia.** A força num trecho reto de fio num campo uniforme é $\vec F = I\vec L\times\vec B$ (formulário: $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$). Só os lados **dentro** do campo sentem força.

**(i) Entrando.** Estão no campo o lado vertical da frente e pedaços dos dois lados horizontais.
- Nos lados horizontais, os pedaços imersos têm correntes opostas: as forças se cancelam.
- No lado da frente, de comprimento $w$, cada uma das $N$ voltas leva a corrente $I$: força $N\,IwB$.

Com $I = \dfrac{NBwv}{R}$:
$$F = NIwB = \frac{N^2B^2w^2v}{R},$$
apontando **contra o movimento** ($-\hat x$).

**(ii) Toda dentro.** Sem corrente, **sem força**. (Mesmo que houvesse corrente, os lados opostos dariam forças que se cancelam num campo uniforme.)

**(iii) Saindo.** Agora só o lado de **trás** está no campo, com a corrente no sentido oposto ao da fase (i), mas o lado também é o outro: a força volta a ser $\dfrac{N^2B^2w^2v}{R}$, de novo **contra o movimento** ($-\hat x$).

**Lenz.** Nas duas transições a força freia a bobina: para manter a velocidade constante, alguém precisa empurrá-la, e esse trabalho vira calor na resistência.

**Sobre o gabarito.** O gabarito da monitoria escreve $\dfrac{NB^2w^2v}{R}$. Falta um $N$: ele aparece uma vez na fem (as $N$ voltas somam fem) e outra na força (as $N$ voltas, cada uma com a corrente $I$, somam força).`,
            passo: 3,
          },
          {
            titulo: '(c) Os gráficos do fluxo e da corrente',
            texto: r`**O que se pede.** Esboçar o fluxo pela bobina e a corrente induzida em função do tempo.

**O fluxo $\Phi(t)$.**
- Antes de entrar: zero.
- Entrando: cresce em linha reta (a área imersa cresce a uma taxa constante, $wv$), até o máximo $Bwl$ por volta, quando a bobina está toda dentro.
- Toda dentro: **patamar** constante.
- Saindo: desce em linha reta até zero.

O gráfico tem forma de **trapézio**.

**A corrente $I(t)$.** Ela é proporcional a **menos a inclinação** do gráfico do fluxo ($\mathcal E = -N\,d\Phi/dt$):
- zero antes de entrar;
- um **pulso** constante, $\dfrac{NBwv}{R}$, enquanto entra (sentido anti-horário);
- zero com a bobina toda dentro;
- um pulso de mesmo valor e sentido **oposto** (horário) enquanto sai;
- zero depois.

O gráfico são dois retângulos, um de cada lado do eixo do tempo. Cada pulso dura $l/v$, o tempo para a bobina inteira entrar (ou sair).`,
            passo: 2,
          },
        ],
        resultado: r`$I = NBwv/R$ nas transições; $F = N^2B^2w^2v/R$ contra o movimento.`,
        errosComuns: ['Contar o $N$ só uma vez na força.', 'Achar que há corrente com a bobina toda dentro do campo.'],
        oficial: {
          resposta: r`(a) (i) anti-horária, $I = NBwv/R$; (ii) nenhuma; (iii) horária, $I = NBwv/R$; (b) (i) e (iii) $\vec F = -\dfrac{NB^2w^2v}{R}\hat x$; (ii) nula.`,
          observacao: 'Divergência na força: com N voltas, cada uma com corrente I = NBwv/R, a força é N·IwB = N²B²w²v/R. O gabarito traz um N só; a simulação confirma N².',
        },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Difícil',
      titulo: 'Espira se afastando de um fio',
      resumo: 'Φ = (μ₀Ia/2π) ln[(r + a)/r], corrente horária e força para o fio.',
      figura: [
        { pagina: 2, recorte: [0.089, 0.821, 0.936, 0.905] },
        { pagina: 3, recorte: [0.089, 0.058, 0.936, 0.34] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, -1, 20], alvo: [3, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 4 } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 2, max: 50, passo: 1 },
        { id: 'a', rotulo: 'Lado da espira', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.015, max: 0.05, passo: 0.001 },
        { id: 'r0', rotulo: 'Distância do lado mais próximo', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.005, max: 0.04, passo: 0.001 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.01, unidade: 'm/s', min: 0.002, max: 0.02, passo: 0.001 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.05, unidade: 'Ω', min: 0.01, max: 1, passo: 0.01 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'S', tipo: 'espiraSensora', centro: ['r0 + v*t + a/2', 0, 0], normal: 'z', largura: 'a', altura: 'a', eixoU: 'x', R: 'Rr', rotulo: 'espira' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: ['r0 + v*t + a', 0, 0], vetor: [1, 0, 0], comprimento: '2*cm', rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'Fluxo (intensidade)', simbolo: r`\Phi = \frac{\mu_0Ia}{2\pi}\ln\frac{r + a}{r}`, expr: "abs(fluxoB('S'))", unidade: 'Wb', teoria: 'mu0*I0*a/(2*pi)*ln((r0 + a)/r0)' },
        { rotulo: 'Corrente induzida (− = horária)', simbolo: r`I = \frac{\mu_0Ia^2v}{2\pi R\,r(r + a)}`, expr: "Iind('S')", unidade: 'A', teoria: '0-mu0*I0*a^2*v/(2*pi*Rr*r0*(r0 + a))' },
        { rotulo: 'Força na espira (− = para o fio)', simbolo: r`F = \left[\frac{\mu_0Ia^2}{2\pi r(r + a)}\right]^2\frac vR`, expr: "1e9*Iind('S')*a*(mag(B(r0, 0, 0)) - mag(B(r0 + a, 0, 0)))", unidade: 'nN', teoria: '1e9*(0-(mu0*I0*a^2/(2*pi*r0*(r0 + a)))^2*v/Rr)' },
      ],
      passos: [
        { titulo: '(a) Fluxo', texto: r`Em faixas de largura $ds$: $\Phi = \displaystyle\int_r^{r+a}\frac{\mu_0 I}{2\pi s}a\,ds = \frac{\mu_0 I a}{2\pi}\ln\frac{r + a}{r}$.`, medidas: [0] },
        {
          titulo: '(b) Corrente',
          texto: r`$\varepsilon = -\dfrac{d\Phi}{dr}\dfrac{dr}{dt} = \dfrac{\mu_0 I a^2 v}{2\pi r(r + a)}$. O fluxo para dentro diminui, então a corrente é **horária**: $I = \varepsilon/R$.`,
          medidas: [1],
        },
        {
          titulo: '(c) Força',
          texto: r`O lado perto do fio (corrente paralela à do fio) é atraído com mais força do que o lado longe é repelido:
$$F = Ia\left[B(r) - B(r + a)\right] = \left[\frac{\mu_0 I a^2}{2\pi r(r + a)}\right]^2\frac{v}{R},$$
apontando **para o fio**: Lenz freia o afastamento.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\Phi = \dfrac{\mu_0 I a}{2\pi}\ln\dfrac{r + a}{r}$` },
        { item: '(b)', texto: r`$I = \dfrac{\mu_0 I a^2}{2\pi R}\dfrac{v}{r(r + a)}$, sentido horário` },
        { item: '(c)', texto: r`$\vec F = -\left[\dfrac{\mu_0 I a^2}{2\pi r(r + a)}\right]^2\dfrac{v}{R}\hat r$, para o fio: se opõe ao afastamento.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Fluxo de um fio por integração', lab: 'movimento' }, { texto: 'Força em correntes paralelas', lab: 'forcas' }],
        etapas: [
          {
            titulo: '(a) O fluxo pela espira',
            texto: r`**O que se pede.** O fluxo magnético pela espira quadrada de lado $a$, no plano do fio infinito (corrente $I$), com o lado mais próximo a uma distância $r$ do fio.

**A ideia.** O fluxo é $\Phi = \displaystyle\int\vec B\cdot d\vec A$: soma de (campo × área) sobre a superfície. O campo do fio, $B = \dfrac{\mu_0I}{2\pi s}$ (lei de Ampère ou de Biot-Savart, formulário), atravessa a espira perpendicularmente, mas **muda** com a distância $s$ ao fio. Então não dá para fazer campo × área de uma vez.

**Montagem.** Corte a espira em **faixas** finas paralelas ao fio, de largura $ds$ e altura $a$. Numa faixa, todos os pontos estão à mesma distância $s$ do fio: o campo é constante nela. A faixa tem área $a\,ds$ e fluxo
$$d\Phi = \frac{\mu_0I}{2\pi s}\,a\,ds.$$

**A conta.** Somando as faixas, de $s = r$ (lado próximo) a $s = r + a$ (lado distante):
$$\Phi = \frac{\mu_0Ia}{2\pi}\int_r^{r+a}\frac{ds}{s} = \frac{\mu_0Ia}{2\pi}\ln\frac{r + a}{r}.$$

**Cuidado.** Usar o campo no centro da espira vezes a área daria um valor errado: o campo cai como $1/s$, e a média não é o valor no centro.`,
            passo: 0,
          },
          {
            titulo: '(b) A corrente induzida',
            texto: r`**O que se pede.** Intensidade e sentido da corrente na espira (resistência $R$), que se afasta do fio com velocidade $v$.

**A ideia.** Lei de Faraday (formulário): $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$. O fluxo do item (a) depende de $r$, e $r$ muda com o tempo: $\dfrac{dr}{dt} = v$. Pela regra da cadeia, $\dfrac{d\Phi}{dt} = \dfrac{d\Phi}{dr}\cdot v$.

**A conta.** Derivando $\ln\dfrac{r + a}{r} = \ln(r + a) - \ln r$ em relação a $r$: $\dfrac{1}{r + a} - \dfrac1r = -\dfrac{a}{r(r + a)}$. Então
$$\frac{d\Phi}{dt} = -\frac{\mu_0Ia}{2\pi}\cdot\frac{a}{r(r + a)}\cdot v,\qquad|\mathcal E| = \frac{\mu_0Ia^2v}{2\pi r(r + a)}.$$
Pela lei de Ohm (formulário: $V = RI$):
$$I_\text{ind} = \frac{\mu_0Ia^2}{2\pi R}\cdot\frac{v}{r(r + a)}.$$

**O sentido (Lenz).** Do lado da espira, o campo do fio aponta para **dentro** do papel. Afastando-se, o fluxo para dentro **diminui**; a corrente induzida cria campo para dentro, repondo: sentido **horário**.`,
            passo: 1,
          },
          {
            titulo: '(c) A força sobre a espira',
            texto: r`**O que se pede.** A força magnética total sobre a espira (módulo, direção e sentido) e a discussão pela lei de Lenz.

**A ideia.** Força em cada lado (formulário): $\vec F = I\vec L\times\vec B$ para um trecho reto, se o campo é constante ao longo dele.
- Os dois lados **perpendiculares** ao fio têm correntes opostas e passam pelos mesmos campos: as forças neles se cancelam.
- Os dois lados **paralelos** ao fio estão em campos diferentes: $B(r)$ no próximo e $B(r + a)$ no distante.

**Lado a lado.** Com a corrente horária, o lado mais próximo tem corrente no **mesmo sentido** da do fio: é **atraído**. O lado distante tem corrente oposta: é **repelido**. Como o campo é mais forte perto, a atração ganha.

**A conta.**
$$F = I_\text{ind}\,a\,\big[B(r) - B(r + a)\big] = I_\text{ind}\,a\,\frac{\mu_0I}{2\pi}\left(\frac1r - \frac{1}{r + a}\right) = I_\text{ind}\,\frac{\mu_0Ia^2}{2\pi r(r + a)}.$$
Pondo $I_\text{ind}$ do item (b):
$$F = \left[\frac{\mu_0Ia^2}{2\pi r(r + a)}\right]^2\frac vR,$$
apontando **para o fio**.

**Lenz.** A força puxa a espira de volta, **contra** o afastamento que está diminuindo o fluxo. Para manter a velocidade, é preciso puxá-la, e esse trabalho vira calor na resistência.`,
            passo: 2,
          },
        ],
        resultado: r`$\Phi = \frac{\mu_0Ia}{2\pi}\ln\frac{r+a}{r}$; corrente horária; força para o fio.`,
        errosComuns: ['Usar o campo no centro da espira vezes a área: o campo varia de um lado a outro.'],
        oficial: { resposta: r`(a) $\Phi = \frac{\mu_0Ia}{2\pi}\ln\frac{r+a}{r}$; (b) horária, $I = \frac{\mu_0Ia^2}{2\pi R}\frac{v}{r(r+a)}$; (c) $\vec F = -\left[\frac{\mu_0Ia^2}{2\pi r(r+a)}\right]^2\frac vR\hat r$.` },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Barra caindo em trilhos verticais',
      resumo: 'A força magnética cresce com v até igualar o peso: v_t = mgR/B²L².',
      figura: { pagina: 3, recorte: [0.089, 0.342, 0.936, 0.896] },
      cena: { escala: 0.01, extensao: 18, unidade: 'cm', plano: 'xy', camera: { pos: [2, -12, 36], alvo: [0, -12, 0] }, tempo: { escala: 0.2, unidade: 's', passo: 0.001, duracao: 0.5 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 1, unidade: 'T', min: 0.5, max: 2, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'l', valor: 0.1, unidade: 'm', min: 0.05, max: 0.15, passo: 0.005 },
        { id: 'm', rotulo: 'Massa', simbolo: 'm', valor: 0.01, unidade: 'kg', min: 0.005, max: 0.03, passo: 0.001 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.05, unidade: 'Ω', min: 0.02, max: 0.2, passo: 0.005 },
        { id: 'g', rotulo: 'Gravidade', simbolo: 'g', valor: 9.8, unidade: 'm/s²', min: 9.8, max: 9.8, passo: 0.1 },
        { id: 'y0', rotulo: 'Distância inicial à haste do resistor', simbolo: 'y_0', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.001 },
        { id: 't0', rotulo: 'Instante mostrado', simbolo: 't_0', valor: 0.04, unidade: 's', min: 0, max: 0.3, passo: 0.005 },
      ],
      objetos: [
        { id: 'Bb', tipo: 'campoB', valor: [0, 0, '0-B0'], rotulo: 'B entrando' },
        { id: 'tr', tipo: 'caminho', seta: 0, pontos: [['0-L/2', -0.3, 0], ['0-L/2', 0, 0], ['L/2', 0, 0], ['L/2', -0.3, 0]], rotulo: 'trilhos e R' },
        { id: 'rot', tipo: 'rotulo', pos: [0, 0.012, 0], texto: 'R' },
        { id: 'bar', tipo: 'caminho', seta: 0, pontos: [['0-L/2', yb6, 0], ['L/2', yb6, 0]], rotulo: 'barra PQ' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, `${yb6}/2`, 0], normal: 'z', largura: 'L', altura: `y0 + ${s6}`, eixoU: 'x', R: 'Rr', oculta: true },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [0, yb6, 0], vetor: [0, -1, 0], comprimento: `4*cm*${vy6}/${vt6} + 0.2*cm`, rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'Velocidade da barra', simbolo: r`v_y`, expr: vy6, unidade: 'm/s' },
        { rotulo: 'Corrente induzida (+ = anti-horária)', simbolo: r`I = \frac{Blv_y}{R}`, expr: "Iind('S')", unidade: 'A', teoria: `B0*L*${vy6}/Rr` },
        { rotulo: 'Força magnética (para cima)', simbolo: r`F = \frac{B^2l^2v_y}{R}`, expr: "L*B0*abs(Iind('S'))", unidade: 'N', teoria: `B0^2*L^2*${vy6}/Rr` },
        { rotulo: 'Aceleração (para baixo)', simbolo: r`a = g - \frac{B^2l^2v_y}{mR}`, expr: "g - L*B0*abs(Iind('S'))/m", unidade: 'm/s²', teoria: `g - B0^2*L^2*${vy6}/(m*Rr)` },
        { rotulo: 'Velocidade terminal', simbolo: r`v_t = \frac{mgR}{B^2l^2}`, expr: vt6, unidade: 'm/s' },
      ],
      graficos: [{ titulo: 'Velocidade no tempo', tipo: 'tempo', janela: 0.5, series: [{ rotulo: 'v', expr: vy6, unidade: 'm/s' }] }],
      passos: [
        {
          titulo: '(a) Corrente',
          texto: r`A barra desce, a área do circuito cresce e o fluxo para dentro aumenta: $\varepsilon = Blv_y$. A corrente sai **anti-horária**, criando campo para fora, com $I = Blv_y/R$.`,
          medidas: [1],
        },
        { titulo: '(b) Força', texto: r`Na barra, $\vec F = I\vec l\times\vec B$ aponta **para cima**: $F = \dfrac{B^2l^2v_y}{R}$, oposta ao movimento.`, medidas: [2] },
        { titulo: '(c) Aceleração', texto: r`$ma = mg - \dfrac{B^2l^2v_y}{R}$: $\vec a = \left(g - \dfrac{B^2l^2v_y}{mR}\right)\hat y$, com $\hat y$ para baixo.`, medidas: [3] },
        {
          titulo: '(d) Velocidade terminal',
          texto: r`Quando a força iguala o peso, $a = 0$: $v_t = \dfrac{mgR}{B^2l^2}$. É o paraquedista: a resistência cresce com a velocidade até equilibrar o peso.`,
          parametros: { t0: 0.3 },
          medidas: [0, 4],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$I = \dfrac{Blv_y}{R}$, sentido anti-horário` },
        { item: '(b)', texto: r`$\vec F = -\dfrac{B^2l^2v_y}{R}\hat y$ (para cima)` },
        { item: '(c)', texto: r`$\vec a = \left(g - \dfrac{B^2l^2v_y}{mR}\right)\hat y$` },
        { item: '(d)', texto: r`$v_t = \dfrac{mgR}{B^2l^2}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Barra em trilhos e força de frenagem', lab: 'movimento' }],
        etapas: [
          {
            titulo: '(a) A corrente induzida',
            texto: r`**O que se pede.** Intensidade e sentido da corrente no circuito quando a barra (comprimento $l$), caindo pelos trilhos verticais, tem velocidade vertical $v_y$. O campo é $\vec B = -B\hat z$ (entrando no papel) e o circuito tem resistência $R$.

**A ideia: lei de Faraday.** O circuito é formado pela haste fixa de cima, os dois trilhos e a barra. Quando a barra desce, a **área** do circuito aumenta, e com ela o fluxo magnético. Pela lei de Faraday (formulário), $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$.

**A conta.** Se a barra está a uma distância $y$ abaixo da haste, a área é $ly$ e o fluxo (campo uniforme, perpendicular) é $\Phi = Bly$. A barra desce com $\dfrac{dy}{dt} = v_y$:
$$|\mathcal E| = Bl\,v_y,\qquad I = \frac{Blv_y}{R}$$
(lei de Ohm, formulário: $V = RI$).

**O sentido (Lenz).** O fluxo para **dentro** do papel aumenta; a corrente induzida cria campo para **fora**: sentido **anti-horário**.

**Outro jeito: fem de movimento.** Cada carga da barra desce junto com ela e sente $q\vec v\times\vec B$, ao longo da barra. A fem é $vBl$: o mesmo resultado.`,
            passo: 0,
          },
          {
            titulo: '(b) A força magnética sobre a barra',
            texto: r`**O que se pede.** Módulo, direção e sentido da força magnética sobre a barra, no mesmo instante.

**A ideia.** Força num trecho reto com corrente num campo uniforme (formulário: $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$, que dá $\vec F = I\vec l\times\vec B$).

**A conta.** O módulo é $IlB$, porque a barra é perpendicular ao campo:
$$F = IlB = \frac{Blv_y}{R}\,lB = \frac{B^2l^2v_y}{R}.$$
A direção: perpendicular à barra (horizontal) e ao campo (perpendicular ao papel), ou seja, **vertical**. O sentido: com a corrente anti-horária, na barra (embaixo do circuito) ela anda num sentido que, com $\vec B$ entrando, dá força **para cima**. O enunciado põe $\hat y$ para baixo (o sentido da gravidade), então
$$\vec F = -\frac{B^2l^2v_y}{R}\,\hat y.$$

**Lenz.** A força aponta **contra** o movimento: ela freia a queda, porque é a queda que está aumentando o fluxo.`,
            passo: 1,
          },
          {
            titulo: '(c) A aceleração da barra',
            texto: r`**O que se pede.** Pela segunda lei de Newton, a aceleração da barra no mesmo instante.

**A ideia.** Sem atrito e com as outras forças desprezadas, agem na barra o **peso** ($mg$, para baixo, $+\hat y$) e a **força magnética** do item (b) (para cima). A soma delas é $m\vec a$.

**A conta.** Ao longo de $\hat y$:
$$ma = mg - \frac{B^2l^2v_y}{R}\quad\Rightarrow\quad\vec a = \left(g - \frac{B^2l^2v_y}{mR}\right)\hat y.$$

**Interpretação.** No começo, com $v_y = 0$, a aceleração é $g$: queda livre. À medida que a barra ganha velocidade, a força magnética cresce e a aceleração **diminui**.`,
            passo: 2,
          },
          {
            titulo: '(d) A velocidade terminal',
            texto: r`**O que se pede.** A velocidade com que a barra passa a cair em movimento uniforme, depois de algum tempo.

**A ideia.** Velocidade constante quer dizer aceleração zero: a força magnética iguala o peso.

**A conta.** Com $a = 0$ no item (c):
$$g = \frac{B^2l^2v_t}{mR}\quad\Rightarrow\quad v_t = \frac{mgR}{B^2l^2}.$$

**O paraquedista.** É o mesmo problema da queda com resistência do ar proporcional à velocidade: a força contrária cresce com $v$ até equilibrar o peso. Resolvendo a equação do item (c), a velocidade se aproxima de $v_t$ exponencialmente, $v_y(t) = v_t\left(1 - e^{-t/\tau}\right)$, com $\tau = \dfrac{mR}{B^2l^2}$.

**Para onde vai a energia?** Com velocidade constante, a energia potencial gravitacional que a barra perde a cada segundo, $mgv_t$, vira calor na resistência, $RI^2$. Confira: $RI^2 = R\left(\dfrac{Blv_t}{R}\right)^2 = \dfrac{B^2l^2v_t^2}{R} = mgv_t$.`,
            passo: 3,
          },
        ],
        resultado: r`$I = Blv_y/R$; $v_t = mgR/B^2l^2$.`,
        errosComuns: ['Pôr a força magnética a favor do movimento.'],
        oficial: { resposta: r`(a) anti-horária, $I = BLv_y/R$; (b) $\vec F = -\frac{B^2L^2v_y}{R}\hat y$; (c) $\vec a = \left(g - \frac{B^2L^2v_y}{mR}\right)\hat y$; (d) $v_y = \frac{mgR}{B^2L^2}$.` },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Médio',
      titulo: 'Espira girando num campo uniforme',
      resumo: 'Φ = Bπr² cos ωt; o torque induzido sempre freia o giro.',
      figura: { pagina: 4, recorte: [0.08, 0.062, 0.938, 0.407] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [8, -9, 9], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.01, duracao: 6.4 } },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'r', rotulo: 'Raio', simbolo: 'r', valor: 0.03, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
        { id: 'w', rotulo: 'Velocidade angular', simbolo: r`\omega`, valor: 2, unidade: 'rad/s', min: 0.5, max: 6, passo: 0.1 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.01, max: 1, passo: 0.01 },
        { id: 't0', rotulo: 'Instante mostrado', simbolo: 't_0', valor: 0.4, unidade: 's', min: 0, max: 3, passo: 0.05 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: [0, `0-sin(${th7})`, `cos(${th7})`], raio: 'r', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi = B\pi r^2\cos\omega t`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*pi*r^2*cos(${th7})` },
        { rotulo: 'Corrente induzida', simbolo: r`I = \frac{B\pi r^2\omega\sin\omega t}{R}`, expr: "Iind('S')", unidade: 'A', teoria: `B0*pi*r^2*w*sin(${th7})/Rr` },
        { rotulo: 'Torque em x', simbolo: r`\tau_x = -\frac{B^2\pi^2r^4\omega\sin^2\omega t}{R}`, expr: `Iind('S')*pi*r^2*(0-sin(${th7}))*B0`, unidade: 'N·m', teoria: `0-B0^2*pi^2*r^4*w*sin(${th7})^2/Rr` },
      ],
      graficos: [{ titulo: 'Fluxo e corrente', tipo: 'tempo', janela: 6.4, series: [{ rotulo: 'Φ', expr: "fluxoB('S')", unidade: 'Wb' }, { rotulo: 'I', expr: "Iind('S')", unidade: 'A' }] }],
      passos: [
        { titulo: '(a) Fluxo', texto: r`O ângulo entre a normal e $\vec B$ é $\omega t$: $\Phi = B\pi r^2\cos\omega t$.`, medidas: [0] },
        { titulo: '(b) Corrente', texto: r`$\varepsilon = -d\Phi/dt = B\pi r^2\omega\sin\omega t$, então $I = \dfrac{B\pi r^2\omega\sin\omega t}{R}$.`, medidas: [1] },
        {
          titulo: '(c) Torque',
          texto: r`$\vec\tau = \vec\mu\times\vec B$ com $\vec\mu = I\pi r^2\hat n$:
$$\vec\tau = -\frac{B^2\pi^2 r^4\omega\sin^2\omega t}{R}\hat x.$$
O sinal é sempre o mesmo, oposto ao giro: Lenz em versão rotacional, e quem mantém $\omega$ constante precisa fazer trabalho.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\Phi(t) = B\pi r^2\cos\omega t$` },
        { item: '(b)', texto: r`$I = \dfrac{B\pi r^2\omega\sin\omega t}{R}$` },
        { item: '(c)', texto: r`$\vec\tau = -\dfrac{B^2\pi^2 r^4\omega\sin^2\omega t}{R}\hat x$: sempre contra o giro (Lenz).` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Gerador: espira girando', lab: 'faraday' }, { texto: 'Torque numa espira', lab: 'forcas' }],
        etapas: [
          {
            titulo: '(a) O fluxo num instante qualquer',
            texto: r`**O que se pede.** O fluxo magnético pela espira circular (raio $r$) que gira com velocidade angular $\omega$ em torno do eixo $X$, num campo uniforme $\vec B = B\hat z$. Em $t = 0$ ela está no plano $XY$, com a normal $\hat n$ apontando no sentido do campo.

**A ideia.** Para uma superfície plana num campo uniforme, o fluxo é
$$\Phi = \vec B\cdot\vec A = BA\cos\alpha,$$
em que $\vec A$ é o vetor área (módulo igual à área, na direção da normal) e $\alpha$ é o ângulo entre $\vec B$ e a normal.

**Montagem.** A área é $\pi r^2$. Em $t = 0$ a normal coincide com $\vec B$ ($\alpha = 0$). A espira gira com velocidade angular constante, e a normal gira junto: depois de um tempo $t$, o ângulo é $\alpha = \omega t$.

**A conta.**
$$\Phi(t) = B\pi r^2\cos\omega t.$$
O fluxo oscila entre $+B\pi r^2$ (normal a favor do campo) e $-B\pi r^2$ (normal contra o campo), passando por zero quando a espira está de lado para o campo.`,
            passo: 0,
          },
          {
            titulo: '(b) A corrente induzida',
            texto: r`**O que se pede.** A corrente induzida na espira (resistência $R$) no mesmo instante.

**A ideia.** Lei de Faraday (formulário): $\mathcal E_\text{ind} = -\dfrac{d\Phi_{\vec B}}{dt}$. A corrente vem da lei de Ohm, $I = \mathcal E/R$.

**A conta.** Derivando o fluxo do item (a), com $\dfrac{d}{dt}\cos\omega t = -\omega\sin\omega t$:
$$\mathcal E = B\pi r^2\omega\sin\omega t,\qquad I = \frac{B\pi r^2\omega\sin\omega t}{R}.$$
O sinal positivo quer dizer corrente no sentido dado pela regra da mão direita em volta de $\hat n$.

**Interpretação.** É uma corrente **alternada**: oscila com a frequência da rotação. É o princípio do **gerador** das usinas: girar uma bobina num campo magnético produz tensão alternada. A corrente é máxima quando o fluxo passa por zero (quando ele muda mais depressa), e zero quando o fluxo é máximo.`,
            passo: 1,
          },
          {
            titulo: '(c) O torque e a lei de Lenz',
            texto: r`**O que se pede.** O vetor torque que o campo exerce sobre a espira no mesmo instante, interpretado com a lei de Lenz.

**A ideia.** A espira com corrente é um dipolo magnético, $\vec\mu = NI\vec A = I\pi r^2\,\hat n$, e o campo exerce sobre ele o torque $\vec\tau = \vec\mu\times\vec B$ (os dois no formulário).

**Montagem.** Girando em torno de $X$, a normal no instante $t$ é $\hat n = -\sin\omega t\,\hat y + \cos\omega t\,\hat z$ (em $t = 0$ ela é $\hat z$, e gira no sentido positivo em torno de $\hat x$). Usando $\hat y\times\hat z = \hat x$ e $\hat z\times\hat z = 0$:
$$\hat n\times\hat z = -\sin\omega t\,\hat x.$$

**A conta.**
$$\vec\tau = I\pi r^2B\,(\hat n\times\hat z) = -I\pi r^2B\sin\omega t\,\hat x.$$
Pondo a corrente do item (b):
$$\vec\tau = -\frac{B^2\pi^2r^4\omega\sin^2\omega t}{R}\,\hat x.$$

**Lenz.** O $\sin^2$ nunca é negativo: o torque aponta **sempre** para $-\hat x$, **contra** a rotação (que é em torno de $+\hat x$). A corrente oscila de sinal, mas o torque não: ele sempre freia o giro. Para manter $\omega$ constante, um motor (ou a turbina da usina) precisa realizar trabalho, e é esse trabalho que vira a energia elétrica dissipada na resistência.`,
            passo: 2,
          },
        ],
        resultado: r`$\tau_x = -B^2\pi^2r^4\omega\sin^2(\omega t)/R$.`,
        errosComuns: ['Esquecer que o torque é sempre resistente: ele não oscila de sinal como a corrente.'],
        oficial: { resposta: r`(a) $\Phi = B\pi r^2\cos\omega t$; (b) $I = \frac{B\pi r^2\omega\sin\omega t}{R}$; (c) $\vec\tau = -\frac{B^2\pi^2r^4\omega\sin^2\omega t}{R}\hat x$.` },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Fácil',
      titulo: 'A fem nas asas de um avião',
      resumo: 'ε = BvL = 10⁻⁴ · 250 · 60 = 1,5 V.',
      figura: { pagina: 4, recorte: [0.08, 0.408, 0.938, 0.471] },
      cena: { escala: 1, extensao: 45, unidade: 'm', plano: 'xy', camera: { pos: [10, -25, 70], alvo: [0, 10, 0] }, tempo: { escala: 0.05, unidade: 's', passo: 0.001, duracao: 0.15 } },
      parametros: [
        { id: 'BT', rotulo: 'Campo da Terra', simbolo: 'B_T', valor: 1e-4, unidade: 'T', min: 2e-5, max: 1e-4, passo: 1e-6 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 250, unidade: 'm/s', min: 100, max: 300, passo: 5 },
        { id: 'Lw', rotulo: 'Envergadura', simbolo: 'L', valor: 60, unidade: 'm', min: 30, max: 80, passo: 1 },
      ],
      objetos: [
        { id: 'BTz', tipo: 'campoB', valor: [0, 0, 'BT'], rotulo: 'campo da Terra' },
        { id: 'asa', tipo: 'caminho', seta: 0, pontos: [['0-Lw/2', '5 + v*t', 0], ['Lw/2', '5 + v*t', 0]], rotulo: 'asas' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, '(5 + v*t)/2', 0], normal: 'z', largura: 'Lw', altura: '5 + v*t', eixoU: 'x', oculta: true },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [0, '5 + v*t', 0], vetor: [0, 1, 0], comprimento: 12, rotulo: 'v' },
      ],
      visual: { setasB: false },
      medidas: [{ rotulo: 'ddp entre as pontas das asas', simbolo: r`\varepsilon = B_TvL`, expr: "abs(fem('S'))", unidade: 'V', teoria: 'BT*v*Lw' }],
      passos: [
        {
          titulo: 'fem de movimento',
          texto: r`Cada carga da asa sente $q\vec v\times\vec B$, ao longo da asa. Somando ao longo da envergadura, $\varepsilon = B_TvL = 10^{-4}\cdot250\cdot60 = 1{,}5$ V. A cena confere pela taxa de varredura de área, $d\Phi/dt = B_TLv$.`,
          medidas: [0],
        },
      ],
      respostas: [{ item: 'ddp', texto: r`$\varepsilon = B_TvL = 1{,}5$ V` }],
      resolucao: {
        conceitos: [{ texto: 'fem de movimento numa barra', lab: 'movimento' }],
        etapas: [
          {
            titulo: 'ddp entre as pontas das asas',
            texto: r`**O que se pede.** A diferença de potencial entre as pontas das asas de um avião (envergadura $L = 60$ m) que voa a $v = 250$ m/s perpendicularmente ao campo da Terra, $B_T \approx 10^{-4}$ T.

**A ideia: fem de movimento.** As asas são metálicas: têm elétrons livres. Elas se movem junto com o avião, e cada carga sente a força magnética $q\vec v\times\vec B$ (formulário: $\vec F_{(m)} = q\vec v\times\vec B$). Essa força aponta **ao longo da asa** (perpendicular a $\vec v$ e a $\vec B$) e empurra cargas para uma das pontas. Elas se acumulam até que o campo elétrico dessas cargas equilibre a força magnética. É o mesmo equilíbrio do seletor de velocidades: $qE = qvB$, ou seja, $E = vB$ ao longo da asa.

**A conta.** A diferença de potencial é o campo vezes o comprimento:
$$\Delta V = EL = B_TvL = (10^{-4})(250)(60) = 1{,}5\ \text{V}.$$

**Pela lei de Faraday, o mesmo.** A asa "varre" uma área $Lv$ por segundo; o fluxo varrido por segundo é $B_TLv$, e $\mathcal E = \dfrac{d\Phi}{dt} = B_TLv$.

**Haverá corrente?** Não. A asa não faz parte de um circuito fechado: a fem só separa cargas entre as pontas. E 1,5 V é pouco; não há risco nenhum.`,
            passo: 0,
          },
        ],
        resultado: r`$1{,}5$ V.`,
        errosComuns: ['Esperar corrente: sem circuito fechado, a fem só separa cargas entre as pontas.'],
        oficial: { resposta: r`$\varepsilon = 1{,}50$ V.` },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Barra correndo ao lado de um fio',
      resumo: 'ΔV = (μ₀Iv/2π) ln[(d + L)/d], com a ponta perto do fio no potencial maior.',
      figura: { pagina: 4, recorte: [0.08, 0.472, 0.938, 0.812] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3, -4, 20], alvo: [3, -4, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 4 } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 2, max: 50, passo: 1 },
        { id: 'd', rotulo: 'Distância da ponta a ao fio', simbolo: 'd', valor: 0.01, unidade: 'm', min: 0.003, max: 0.03, passo: 0.001 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.02, max: 0.07, passo: 0.001 },
        { id: 'v', rotulo: 'Velocidade', simbolo: 'v', valor: 0.02, unidade: 'm/s', min: 0.005, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'x', rotulo: 'I' },
        { id: 'bar', tipo: 'caminho', seta: 0, pontos: [['0.01 + v*t', '0-d', 0], ['0.01 + v*t', '0-d-L', 0]], rotulo: 'barra' },
        { id: 'ra', tipo: 'rotulo', pos: ['0.014 + v*t', '0-d', 0], texto: 'a' },
        { id: 'rb', tipo: 'rotulo', pos: ['0.014 + v*t', '0-d-L', 0], texto: 'b' },
        { id: 'S', tipo: 'espiraSensora', centro: ['(0.01 + v*t)/2', '0-d-L/2', 0], normal: 'z', largura: '0.01 + v*t', altura: 'L', eixoU: 'x', oculta: true },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: ['0.01 + v*t', '0-d-L/2', 0], vetor: [1, 0, 0], comprimento: '2*cm', rotulo: 'v' },
      ],
      medidas: [
        { rotulo: 'ddp entre as pontas', simbolo: r`\Delta V = \frac{\mu_0Iv}{2\pi}\ln\frac{d + L}{d}`, expr: "abs(fem('S'))", unidade: 'V', teoria: 'mu0*I0*v/(2*pi)*ln((d + L)/d)' },
        { rotulo: 'Força magnética por carga, em y (+ = para a ponta a)', simbolo: r`(\vec v\times\vec B)_y`, expr: 'v*mag(B(0.01, 0-d-L/2, 0))', unidade: 'N/C' },
      ],
      passos: [
        {
          titulo: '(a) Qual ponta',
          texto: r`Abaixo do fio, $\vec B$ entra no papel. Com $\vec v$ para a direita, $\vec v\times\vec B$ aponta **para cima**, para a ponta $a$: as cargas positivas se acumulam em $a$, que fica no potencial maior.`,
          medidas: [1],
        },
        {
          titulo: '(b) A ddp',
          texto: r`No equilíbrio, a força elétrica compensa a magnética em cada ponto: $\Delta V = \displaystyle\int_d^{d+L} vB\,dr = \frac{\mu_0 I v}{2\pi}\ln\frac{d + L}{d}$.`,
          medidas: [0],
        },
        {
          titulo: '(c) e (d) Sem ddp ao longo da barra',
          texto: r`(c) Movendo-se ao longo do próprio comprimento, $\vec v\times\vec B$ fica perpendicular à barra: nenhuma ddp entre $a$ e $b$; as cargas só se separam na espessura, que é desprezível. (d) Barra paralela ao fio e $\vec v$ ao longo dela: de novo $\vec v\times\vec B$ é perpendicular à barra, e a ddp ao longo dela é nula.`,
        },
      ],
      respostas: [
        { item: '(a)', texto: r`A ponta $a$, mais perto do fio.` },
        { item: '(b)', texto: r`$\Delta V = \dfrac{\mu_0 I v}{2\pi}\ln\dfrac{d + L}{d}$` },
        { item: '(c)', texto: r`Nenhuma ddp entre $a$ e $b$: $\vec v\times\vec B$ fica perpendicular à barra, e a separação de cargas ocorre só na espessura (desprezível).` },
        { item: '(d)', texto: r`Também nenhuma ddp ao longo da barra; só na espessura, $\approx 0$ para barra fina.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'fem de movimento com campo não uniforme', lab: 'movimento' }],
        etapas: [
          {
            titulo: '(a) Qual ponta fica no potencial maior',
            texto: r`**O que se pede.** Uma barra condutora de comprimento $L$, perpendicular a um fio infinito com corrente $I$, move-se com velocidade $\vec v$ paralela ao fio, com a ponta mais próxima ($a$) a uma distância $d$. No equilíbrio, qual ponta tem o potencial maior?

**A ideia: fem de movimento.** As cargas livres da barra andam junto com ela e sentem a força magnética $q\vec v\times\vec B$ (formulário). Se essa força tem componente ao longo da barra, ela empurra as cargas para uma das pontas, que ficam carregadas. Cargas positivas acumuladas numa ponta deixam essa ponta no potencial **maior**.

**Montagem.** Na figura, a barra está abaixo do fio, onde o campo do fio (regra da mão direita com a corrente) aponta **para dentro** do papel. A velocidade é paralela ao fio, para a direita.

**A conta da direção.** Para cargas positivas, $\vec v\times\vec B$ com $\vec v$ para a direita e $\vec B$ para dentro aponta **para cima**, ao longo da barra, em direção ao fio. As cargas positivas se acumulam na ponta $a$, a mais próxima do fio.

**Resposta.** A ponta $a$ (a mais perto do fio) fica no potencial maior.`,
            passo: 0,
          },
          {
            titulo: '(b) A diferença de potencial entre as pontas',
            texto: r`**O que se pede.** A diferença de potencial entre as pontas da barra, no equilíbrio.

**A ideia.** No equilíbrio, as cargas param de se acumular: em cada ponto da barra, a força elétrica das cargas acumuladas cancela a magnética, $qE = qvB$. Então o campo elétrico ao longo da barra vale $E = vB$ em cada ponto. Mas aqui $B$ **não é uniforme**: o campo do fio é $B = \dfrac{\mu_0I}{2\pi r}$ (com $r$ a distância ao fio), mais forte perto do fio. Por isso não basta fazer $vBL$: é preciso integrar.

**A conta.** A diferença de potencial é a integral do campo elétrico ao longo da barra, de $r = d$ a $r = d + L$:
$$\Delta V = \int_d^{d+L}vB\,dr = \frac{\mu_0Iv}{2\pi}\int_d^{d+L}\frac{dr}{r} = \frac{\mu_0Iv}{2\pi}\ln\frac{d + L}{d}.$$
A ponta $a$ está nesse valor acima da outra.

**Conferindo.** Se o fio estivesse muito longe ($d \gg L$), $\ln\dfrac{d + L}{d} \approx \dfrac Ld$ e $\Delta V \approx \dfrac{\mu_0I}{2\pi d}vL = BvL$, o resultado para campo uniforme.`,
            passo: 1,
          },
          {
            titulo: '(c) Barra se movendo perpendicular ao fio',
            texto: r`**O que se pede.** O que aconteceria se a barra, com a mesma orientação (perpendicular ao fio), se movesse na direção perpendicular ao fio, ou seja, ao longo do próprio comprimento.

**A ideia.** A força nas cargas é $q\vec v\times\vec B$, sempre perpendicular a $\vec v$. Se $\vec v$ aponta **ao longo da barra**, a força é perpendicular à barra: ela não empurra as cargas de uma ponta para a outra.

**Resposta.** **Não surge diferença de potencial entre as pontas** $a$ e $b$. As cargas só se deslocam de um lado para o outro na **espessura** da barra (de uma face lateral para a outra), o que, para uma barra fina, dá uma diferença de potencial desprezível. O gabarito da monitoria descreve justamente essa separação lateral; entre $a$ e $b$, nada.`,
            passo: 2,
          },
          {
            titulo: '(d) Barra paralela ao fio',
            texto: r`**O que se pede.** O que aconteceria com a barra **paralela** ao fio, movendo-se na mesma direção da figura (também paralela ao fio).

**A ideia.** De novo, $\vec v$ aponta ao longo da própria barra. A força $q\vec v\times\vec B$ é perpendicular a $\vec v$, logo perpendicular à barra.

**Resposta.** **Nenhuma diferença de potencial** ao longo da barra; só uma separação de cargas desprezível na espessura dela. Outro jeito de ver: a barra, ao se mover, não "corta" linhas de campo ao longo do seu comprimento, e a área varrida por ela é nula.`,
            passo: 2,
          },
        ],
        resultado: r`$\Delta V = \frac{\mu_0Iv}{2\pi}\ln\frac{d+L}{d}$, com $a$ no potencial maior.`,
        errosComuns: ['Usar $vBL$ com o campo de um ponto só: o campo varia ao longo da barra.'],
        oficial: {
          resposta: r`(a) a ponta $a$; (b) $\Delta V = \frac{\mu_0Iv}{2\pi}\ln\frac{d+L}{d}$; (c) campo elétrico da direita para a esquerda dentro da barra, com a extremidade direita no potencial maior; (d) $\Delta V \approx 0$ para barra fina.`,
          observacao: 'No (c), o gabarito descreve a separação de cargas na espessura da barra (lado direito × lado esquerdo), que é desprezível; entre as pontas a e b não há ddp.',
        },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Difícil',
      titulo: 'Haste com cargas num campo B crescente',
      resumo: 'O campo elétrico induzido circula: força total nula, torque −qR²(dB/dt).',
      figura: [
        { pagina: 4, recorte: [0.08, 0.813, 0.938, 0.901] },
        { pagina: 5, recorte: [0.08, 0.058, 0.936, 0.291] },
      ],
      cena: { escala: 0.01, extensao: 13, unidade: 'cm', plano: 'xy', camera: { pos: [1, -2, 28], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'R', rotulo: 'Raio da região', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.001 },
        { id: 'B0', rotulo: 'Campo agora', simbolo: 'B', valor: 0.2, unidade: 'T', min: 0.05, max: 1, passo: 0.01 },
        { id: 'Bd', rotulo: 'Taxa de aumento', simbolo: r`\dot B`, valor: 10, unidade: 'T/s', min: 1, max: 30, passo: 0.5 },
        { id: 'qq', rotulo: 'Carga de cada partícula', simbolo: 'q', valor: 1e-6, unidade: 'C', min: 1e-7, max: 5e-6, passo: 1e-7 },
      ],
      objetos: [
        { id: 'Bd1', tipo: 'campoB', valor: [0, 0, 'x^2 + y^2 < R^2 ? B0 + Bd*t : 0'], rotulo: 'B saindo, crescendo' },
        { id: 'Ei', tipo: 'campoE', valor: '(x^2 + y^2 < R^2 ? Bd/2 : R^2*Bd/(2*(x^2 + y^2)))*[y, 0-x, 0]', rotulo: 'E induzido' },
        { id: 'q1', tipo: 'carga', q: 'qq', pos: ['2*R', 0, 0], rotulo: 'q' },
        { id: 'q2', tipo: 'carga', q: 'qq', pos: ['0-2*R', 0, 0], rotulo: 'q' },
        { id: 'haste', tipo: 'caminho', seta: 0, pontos: [['0-2*R', 0, 0], ['2*R', 0, 0]], rotulo: 'haste isolante' },
        { id: 'C', tipo: 'caminho', pontos: circ10, tracejado: true, rotulo: 'circulação' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Circulação de E num círculo de raio 1,5R', simbolo: r`\oint\vec E\cdot d\vec\ell = -\pi R^2\dot B`, expr: "intE('C')", unidade: 'V', teoria: '0-pi*R^2*Bd' },
        { rotulo: 'Força resultante na haste', simbolo: r`|\vec F_1 + \vec F_2|`, expr: "mag(F('q1') + F('q2'))", unidade: 'N', teoria: '0' },
        { rotulo: 'Torque em z (− = horário)', simbolo: r`\tau_z = -qR^2\dot B`, expr: "1e6*(2*R*y(F('q1')) - 2*R*y(F('q2')))", unidade: 'μN·m', teoria: '1e6*(0-qq*R^2*Bd)' },
      ],
      passos: [
        {
          titulo: 'O campo elétrico induzido',
          texto: r`Fora da região, $E\cdot 2\pi r = \pi R^2\dot B$: $E = \dfrac{R^2\dot B}{2r}$, circulando no sentido **horário** (Lenz, com $\vec B$ saindo e crescendo). Nas partículas, $r = 2R$ e $E = R\dot B/4$.`,
          medidas: [0],
        },
        { titulo: '(a) Força nula', texto: r`As duas partículas estão em pontos opostos do círculo: as forças $q\vec E$ têm mesmo módulo e sentidos opostos. A repulsão entre elas também se cancela por ação e reação.`, medidas: [1] },
        {
          titulo: '(b) e (c) Torque',
          texto: r`Cada força é tangente e tem braço $2R$: $\tau = 2\cdot qE\cdot2R = 4qER = qR^2\dot B$, no sentido **horário**. A origem é o campo elétrico induzido, não o magnético: as cargas estão paradas e fora da região de $\vec B$.`,
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`As forças $q\vec E$ nas duas partículas são opostas: $\vec F = \vec 0$.` },
        { item: '(b)', texto: r`$\vec\tau = -4qER\,\hat z = -qR^2\dfrac{dB}{dt}\hat z$, vindo do campo elétrico induzido $E = R^2\dot B/2r$.` },
        { item: '(c)', texto: r`Horário.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo elétrico induzido por B variável', lab: 'movimento' }],
        etapas: [
          {
            titulo: '(a) A força total na haste é nula',
            texto: r`**O que se pede.** Mostrar que a força total sobre a haste é zero. Ela tem comprimento $4R$, com uma carga $q$ em cada ponta, e está centrada numa região circular de raio $R$ onde há um campo $\vec B$ uniforme, saindo do papel e **crescendo** devagar.

**A ideia: o campo elétrico induzido.** As cargas estão **paradas** e **fora** da região do campo magnético (a $2R$ do centro). Força magnética não há. Mas um campo magnético que **varia** cria um **campo elétrico induzido**, pela lei de Faraday (formulário):
$$\oint_{\mathcal C}\vec E\cdot d\vec\ell = -\frac{d\Phi_{\vec B}}{dt}.$$

**O campo induzido.** Pela simetria circular, $\vec E$ circula em torno do centro (tangente a círculos centrados nele), com módulo que só depende da distância $r$. Num círculo de raio $r > R$, $\oint\vec E\cdot d\vec\ell = E\cdot2\pi r$, e o fluxo é o de toda a região com campo, $\pi R^2B$:
$$E\cdot2\pi r = \pi R^2\frac{dB}{dt}\quad\Rightarrow\quad E = \frac{R^2}{2r}\frac{dB}{dt}.$$
Nas cargas ($r = 2R$): $E = \dfrac R4\dfrac{dB}{dt}$.

**O sentido (Lenz).** O fluxo para **fora** do papel cresce; o campo induzido circula no sentido que empurraria uma corrente criando campo para **dentro**: sentido **horário**.

**As forças.** Cada carga sente $q\vec E$, tangente ao círculo de raio $2R$. As duas cargas estão em pontos **diametralmente opostos**, onde o campo circulante aponta em sentidos opostos. As duas forças têm o mesmo módulo e sentidos opostos: **somam zero**. A repulsão elétrica entre as duas cargas também se cancela (ação e reação, e a haste é rígida).`,
            passo: 1,
          },
          {
            titulo: '(b) O torque e a sua origem',
            texto: r`**O que se pede.** Mostrar que há um torque total sobre a haste, que a põe para girar, e dizer de onde ele vem.

**A ideia.** Forças iguais e opostas que **não** estão na mesma linha formam um **binário**: força total zero, mas torque diferente de zero. Aqui cada força é **tangente** ao círculo, ou seja, perpendicular à haste, com braço de alavanca $2R$ em relação ao centro.

**A conta.** Cada carga contribui com $\tau = qE\cdot2R$, e as duas giram para o mesmo lado (ambas acompanham a circulação horária do campo). Com $E = \dfrac R4\dfrac{dB}{dt}$ do item (a):
$$\tau = 2\cdot qE\cdot2R = 4qER = qR^2\frac{dB}{dt}.$$

**A origem.** É o **campo elétrico induzido** pela variação do campo magnético. Não é a força magnética: as cargas estão paradas e nem estão na região onde há $\vec B$. Esse exemplo mostra que o campo elétrico induzido existe mesmo **fora** da região onde $\vec B$ varia, e que ele é real: realiza trabalho e põe a haste para girar.`,
            passo: 2,
          },
          {
            titulo: '(c) O sentido de rotação',
            texto: r`**O que se pede.** O sentido em que a haste gira.

**A ideia.** As forças acompanham o campo elétrico induzido, que circula no sentido **horário** (item a, pela lei de Lenz: o fluxo para fora do papel cresce, e o campo induzido "tenta" criar campo para dentro).

**Resposta.** A haste gira no sentido **horário** (visto com $\vec B$ saindo do papel). Em vetor, o torque é $\vec\tau = -qR^2\dfrac{dB}{dt}\,\hat z$, com $\hat z$ saindo do papel.`,
            passo: 2,
          },
        ],
        resultado: r`$\vec F = \vec 0$; $\vec\tau = -qR^2\dot B\,\hat z$ (horário).`,
        errosComuns: ['Procurar força magnética: as cargas estão paradas, e só o campo elétrico induzido age nelas.'],
        oficial: { resposta: r`(a) $\vec E = -E\hat\phi$, $\vec F = \vec 0$; (b) $\vec\tau = -4qER\hat z$; (c) horário.` },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Difícil',
      titulo: 'Maxwell com monopolos magnéticos',
      resumo: 'Gauss do magnetismo ganha carga, e Faraday ganha corrente magnética.',
      figura: { pagina: 5, recorte: [0.08, 0.292, 0.936, 0.329] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [10, 8, 12], alvo: [0, 0, 0] } },
      parametros: [{ id: 'Q', rotulo: 'Carga elétrica', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 5e-10, max: 5e-9, passo: 1e-10 }],
      objetos: [
        { id: 'q', tipo: 'carga', q: 'Q', pos: [-0.04, 0, 0], rotulo: 'carga elétrica' },
        { id: 'GE', tipo: 'gaussiana', forma: 'esfera', centro: [-0.04, 0, 0], raio: 0.025, campo: 'E', rotulo: 'S (E)' },
        { id: 'ima', tipo: 'ima', centro: [0.04, 0, 0], eixo: 'y', comprimento: 0.03, raio: 0.006, intensidade: 1500, rotulo: 'ímã' },
        { id: 'GB', tipo: 'gaussiana', forma: 'esfera', centro: [0.04, 0, 0], raio: 0.025, campo: 'B', rotulo: 'S (B)' },
      ],
      medidas: [
        { rotulo: 'Fluxo de E em torno da carga', simbolo: r`\oint\vec E\cdot d\vec A = Q/\varepsilon_0`, expr: "fluxo('GE')", unidade: 'V·m', teoria: 'Q/eps0' },
        { rotulo: 'Fluxo de B em torno do ímã', simbolo: r`\oint\vec B\cdot d\vec A = 0`, expr: "fluxo('GB')", unidade: 'Wb', teoria: '0' },
      ],
      passos: [
        {
          titulo: 'Hoje: sem carga magnética',
          texto: r`Em volta de uma carga elétrica, o fluxo de $\vec E$ é $Q/\varepsilon_0$. Em volta de um ímã, o fluxo de $\vec B$ é **zero**: cada linha que sai pelo polo N volta pelo S. É a lei $\oint\vec B\cdot d\vec A = 0$.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Com monopolos',
          texto: r`Uma carga magnética $Q_m$ daria fluxo de $\vec B$ não nulo, em simetria com a elétrica:
$$\oint\vec B\cdot d\vec A = \mu_0 Q_m.$$
E uma corrente de monopolos $I_m$ entraria na lei de Faraday, deixando-a simétrica à de Ampère-Maxwell:
$$\oint\vec E\cdot d\vec\ell = -\frac{d\Phi_B}{dt} - \mu_0 I_m.$$`,
        },
      ],
      respostas: [
        { item: 'Gauss (B)', texto: r`$\oint\vec B\cdot d\vec A = \mu_0 Q_m$` },
        { item: 'Faraday', texto: r`$\oint\vec E\cdot d\vec\ell = -\dfrac{d\Phi_B}{dt} - \mu_0 I_m$` },
        { item: 'Sem mudança', texto: r`A lei de Gauss elétrica e a de Ampère-Maxwell ficam iguais.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }, { texto: 'Equações de Maxwell', lab: 'maxwell' }],
        etapas: [
          {
            titulo: 'Gauss (B): a lei de Gauss do magnetismo muda',
            texto: r`**O que se pede.** Dizer quais equações de Maxwell mudariam se existissem monopolos magnéticos (cargas magnéticas isoladas, um "polo norte" sozinho) e como.

**As quatro equações hoje** (todas no formulário da P3):
- Gauss elétrica: $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$;
- Gauss magnética: $\oint_S\vec B\cdot d\vec A = 0$;
- Faraday: $\oint_{\mathcal C}\vec E\cdot d\vec\ell = -\dfrac{d\Phi_{\vec B}}{dt}$;
- Ampère-Maxwell: $\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc} + \mu_0\varepsilon_0\dfrac{d\Phi_{\vec E}}{dt}$.

**Por que o fluxo de $\vec B$ é zero hoje.** Em volta de uma carga elétrica, o campo elétrico "sai" (ou "entra") e o fluxo é $Q/\varepsilon_0$. Em volta de um ímã, toda linha de campo que sai pelo polo N volta pelo polo S: não existe ponto de onde linhas de $\vec B$ só saiam. Cortar um ímã ao meio dá dois ímãs, cada um com N e S. Por isso o fluxo de $\vec B$ por qualquer superfície fechada é zero.

**Com monopolos.** Uma carga magnética $Q_m$ seria um ponto de onde as linhas de $\vec B$ saem, como as de $\vec E$ saem de uma carga elétrica. A lei ganharia um termo de fonte, em simetria com a elétrica:
$$\oint_S\vec B\cdot d\vec A = \mu_0Q_m.$$
(A constante $\mu_0$ é uma escolha de unidades para a carga magnética.)`,
            passo: 1,
          },
          {
            titulo: 'Faraday: a lei de Faraday também muda',
            texto: r`**O que se pede.** A outra equação que muda com monopolos magnéticos.

**A ideia: simetria entre as equações.** Compare Faraday e Ampère-Maxwell (formulário):
- Ampère-Maxwell: a circulação de $\vec B$ tem uma fonte de **corrente elétrica** ($\mu_0I_\text{enc}$) e um termo de fluxo elétrico variando.
- Faraday: a circulação de $\vec E$ tem só o termo de fluxo magnético variando. Não há "corrente magnética" porque não há carga magnética para se mover.

**Com monopolos.** Cargas magnéticas em movimento formariam uma **corrente magnética** $I_m$. Ela entraria na lei de Faraday como a corrente elétrica entra na de Ampère:
$$\oint_{\mathcal C}\vec E\cdot d\vec\ell = -\frac{d\Phi_{\vec B}}{dt} - \mu_0I_m.$$
O sinal de menos vem do mesmo motivo do sinal de menos do termo de fluxo; ele é necessário para que a carga magnética se conserve, como a elétrica.

**Resultado.** As equações de Maxwell ficariam completamente simétricas entre eletricidade e magnetismo. Até hoje, nenhum monopolo magnético foi observado.`,
            passo: 1,
          },
          {
            titulo: 'Sem mudança: as outras duas equações',
            texto: r`**O que se pede.** Completar a resposta: quais equações **não** mudam.

**A lei de Gauss elétrica**, $\oint_S\vec E\cdot d\vec A = \dfrac{Q_\text{int}}{\varepsilon_0}$: a fonte do campo elétrico continua sendo a carga elétrica. Uma carga magnética parada não cria campo elétrico.

**A lei de Ampère-Maxwell**, $\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc} + \mu_0\varepsilon_0\dfrac{d\Phi_{\vec E}}{dt}$: ela já tem o termo de corrente **elétrica**, e uma corrente de monopolos não entra nela (entraria na de Faraday, como no item anterior).

**Resposta.** Mudam só a lei de Gauss do magnetismo e a lei de Faraday. A lei de Gauss elétrica e a de Ampère-Maxwell ficam iguais.

**Cuidado.** Um erro comum é mexer na lei de Ampère. Ela já tem a corrente elétrica, e os monopolos não mudam isso.`,
            passo: 1,
          },
        ],
        resultado: r`Mudam a lei de Gauss do magnetismo e a lei de Faraday.`,
        errosComuns: ['Mexer na lei de Ampère: ela já tem corrente elétrica e não depende de monopolos.'],
        oficial: { resposta: r`$\oint\vec B\cdot d\vec A = \mu_0 Q_m$ e $\oint\vec E\cdot d\vec\ell = -\frac{d\Phi_B}{dt} - \mu_0 I_m$.` },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Difícil',
      titulo: 'Capacitor com dielétrico que vaza',
      resumo: 'Q = Q₀e^(−t/Kε₀ρ); a corrente de deslocamento cancela a de condução e B = 0.',
      figura: { pagina: 5, recorte: [0.08, 0.33, 0.936, 0.588] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [9, 6, 12], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02, duracao: 10 } },
      parametros: [
        { id: 'Q0', rotulo: 'Carga inicial', simbolo: 'Q_0', valor: 1e-8, unidade: 'C', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'K', rotulo: 'Constante dielétrica', simbolo: 'K', valor: 4, unidade: '', min: 1, max: 8, passo: 0.1 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1e11, unidade: 'Ω·m', min: 2e10, max: 3e11, passo: 1e9 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'A = l^2', valor: 0.1, unidade: 'm', min: 0.06, max: 0.12, passo: 0.002 },
        { id: 't0', rotulo: 'Instante mostrado', simbolo: 't_0', valor: 1, unidade: 's', min: 0, max: 8, passo: 0.1 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado',
          d: 0.02,
          Q: 'Q0*exp(0-(t + t0)/(K*eps0*rho))',
          ligado: 0,
          dieletrico: { K: 'K', inicio: 0, fim: 0.02 },
          rotulo: 'capacitor com dielétrico',
        },
      ],
      medidas: [
        { rotulo: 'Carga agora', simbolo: r`Q = Q_0e^{-t/K\varepsilon_0\rho}`, expr: 'Q0*exp(0-t0/(K*eps0*rho))', unidade: 'C' },
        { rotulo: 'Campo no dielétrico', simbolo: r`E = \frac{Q}{K\varepsilon_0 A}`, expr: 'mag(E(0, 0, 0))', unidade: 'V/m', teoria: 'Q0*exp(0-t0/(K*eps0*rho))/(K*eps0*lado^2)' },
        { rotulo: 'Densidade de corrente de condução', simbolo: r`J = E/\rho`, expr: 'mag(E(0, 0, 0))/rho', unidade: 'A/m²', teoria: 'Q0*exp(0-t0/(K*eps0*rho))/(K*eps0*rho*lado^2)' },
        { rotulo: 'Densidade de corrente de deslocamento', simbolo: r`J_d = K\varepsilon_0\,\partial E/\partial t = -J`, expr: '0-Q0*exp(0-t0/(K*eps0*rho))/(K*eps0*rho*lado^2)', unidade: 'A/m²' },
        { rotulo: 'Constante de tempo', simbolo: r`\tau = K\varepsilon_0\rho`, expr: 'K*eps0*rho', unidade: 's' },
      ],
      graficos: [{ titulo: 'Carga no tempo', tipo: 'tempo', janela: 10, series: [{ rotulo: 'Q', expr: 'Q0*exp(0-(t + t0)/(K*eps0*rho))', unidade: 'C' }] }],
      passos: [
        { titulo: '(a) Campo', texto: r`Placas infinitas com dielétrico: $\vec E = \dfrac{Q(t)}{K\varepsilon_0 A}$, da placa positiva para a negativa.`, medidas: [1] },
        { titulo: '(b) Corrente de condução', texto: r`Pela lei de Ohm local, $\vec J = \vec E/\rho = \dfrac{Q}{K\varepsilon_0\rho A}$, no mesmo sentido de $\vec E$.`, medidas: [2] },
        {
          titulo: '(c) A equação de Q',
          texto: r`A corrente que atravessa o dielétrico tira carga da placa: $\dfrac{dQ}{dt} = -JA = -\dfrac{Q}{K\varepsilon_0\rho}$. Então
$$Q(t) = Q_0\,e^{-t/K\varepsilon_0\rho}.$$
O tempo de descarga não depende da geometria, só do material.`,
          medidas: [0, 4],
        },
        {
          titulo: '(d) e (e) Corrente de deslocamento e B',
          texto: r`$\vec J_d = K\varepsilon_0\dfrac{\partial\vec E}{\partial t} = \dfrac{1}{A}\dfrac{dQ}{dt} = -\vec J$. A corrente total, $\vec J + \vec J_d$, é **nula** em todo ponto, e pela lei de Ampère-Maxwell não há campo magnético no dielétrico.`,
          medidas: [2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec E = \dfrac{Q(t)}{K\varepsilon_0 A}$, da placa positiva para a negativa.` },
        { item: '(b)', texto: r`$\vec J = \dfrac{Q(t)}{K\varepsilon_0\rho A}$, no sentido de $\vec E$.` },
        { item: '(c)', texto: r`$\dfrac{dQ}{dt} = -\dfrac{Q}{K\varepsilon_0\rho}$, então $Q(t) = Q_0e^{-t/K\varepsilon_0\rho}$.` },
        { item: '(d)', texto: r`$\vec J_d = -\dfrac{Q(t)}{K\varepsilon_0\rho A}$ no sentido de $\vec E$: igual e oposta a $\vec J$.` },
        { item: '(e)', texto: r`Não: a corrente total (condução mais deslocamento) é nula, e a simetria planar não deixa sobrar campo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Corrente de deslocamento', lab: 'maxwell' }, { texto: 'Capacitor com dielétrico', lab: 'capacitor' }],
        etapas: [
          {
            titulo: '(a) O campo dentro do capacitor',
            texto: r`**O que se pede.** O campo elétrico no interior de um capacitor de placas paralelas (área $A$, placas tratadas como infinitas), cheio de um material de constante dielétrica $K$, quando a carga é $Q(t)$.

**A ideia.**
- Sem dielétrico, entre placas infinitas com densidade $\sigma = Q/A$, a lei de Gauss dá o campo uniforme $E_0 = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0A}$ (cada placa contribui com $\sigma/2\varepsilon_0$ e, entre elas, os campos se somam).
- Um dielétrico que preenche o espaço se polariza e reduz o campo pelo fator $K$. É a mesma razão de $C = KC_0$ (formulário): com a mesma carga, a tensão e o campo ficam $K$ vezes menores.

**A conta.**
$$\vec E = \frac{Q(t)}{K\varepsilon_0A},$$
uniforme, perpendicular às placas, apontando da placa **positiva** para a **negativa**.`,
            passo: 0,
          },
          {
            titulo: '(b) A densidade de corrente no dielétrico',
            texto: r`**O que se pede.** A densidade de corrente que atravessa o material, que não é um isolante perfeito (resistividade $\rho$).

**A ideia.** Lei de Ohm em cada ponto (formulário):
$$\vec J = \frac1\rho\vec E.$$
O campo empurra as poucas cargas livres do material, que vão da placa positiva para a negativa.

**A conta.** Com $\vec E$ do item (a):
$$\vec J = \frac{Q(t)}{K\varepsilon_0\rho A},$$
uniforme, no mesmo sentido de $\vec E$ (da placa positiva para a negativa). Essa corrente é o "vazamento" que vai descarregando o capacitor.`,
            passo: 1,
          },
          {
            titulo: '(c) A equação de Q(t) e a solução',
            texto: r`**O que se pede.** Uma equação diferencial para $Q(t)$, a partir da definição de corrente, e sua solução com $Q(0) = Q_0$.

**A ideia.** A corrente que atravessa o dielétrico, $I = JA$ (formulário: $I = \int_S\vec J\cdot d\vec A$), sai da placa positiva. A carga da placa diminui a essa taxa: $\dfrac{dQ}{dt} = -I$ (conservação da carga).

**A equação.** Com $J$ do item (b):
$$\frac{dQ}{dt} = -JA = -\frac{Q}{K\varepsilon_0\rho}.$$
A taxa de perda é proporcional à própria carga: quanto mais carga, mais campo, mais corrente.

**A solução.** É a equação de um **decaimento exponencial**. Separando as variáveis, $\dfrac{dQ}{Q} = -\dfrac{dt}{K\varepsilon_0\rho}$, e integrando de $0$ a $t$: $\ln\dfrac{Q}{Q_0} = -\dfrac{t}{K\varepsilon_0\rho}$. Então
$$Q(t) = Q_0\,e^{-t/K\varepsilon_0\rho}.$$

**Interpretação.** A constante de tempo é $\tau = K\varepsilon_0\rho$. Ela **não depende** da área nem da distância entre as placas, só do material. É o $RC$ do capacitor: a capacitância cresce com $A/d$ e a resistência do material com $d/A$, e as duas dependências se cancelam no produto.`,
            passo: 2,
          },
          {
            titulo: '(d) A corrente de deslocamento',
            texto: r`**O que se pede.** A densidade de corrente de deslocamento de Maxwell, $\vec J_d = K\varepsilon_0\dfrac{\partial\vec E}{\partial t}$, comparada com a do item (b).

**A ideia.** A corrente de deslocamento não é carga se movendo: é o termo de **campo elétrico variando** na lei de Ampère-Maxwell (formulário: $\mu_0\varepsilon_0\dfrac{d\Phi_{\vec E}}{dt}$; dentro de um dielétrico, entra o fator $K$). Ela age como fonte de campo magnético, como uma corrente comum.

**A conta.** Com $E = \dfrac{Q}{K\varepsilon_0A}$ do item (a):
$$J_d = K\varepsilon_0\frac{d}{dt}\left(\frac{Q}{K\varepsilon_0A}\right) = \frac1A\frac{dQ}{dt}.$$
Pelo item (c), $\dfrac{dQ}{dt} = -\dfrac{Q}{K\varepsilon_0\rho}$:
$$J_d = -\frac{Q(t)}{K\varepsilon_0\rho A}.$$

**Comparando.** É **igual em módulo e oposta** à corrente de condução do item (b): $\vec J_d = -\vec J$. O campo diminui (o capacitor descarrega), e por isso a corrente de deslocamento aponta contra o campo, enquanto a de condução aponta a favor.`,
            passo: 3,
          },
          {
            titulo: '(e) Há campo magnético no dielétrico?',
            texto: r`**O que se pede.** Dizer se haverá campo magnético dentro do dielétrico enquanto o capacitor descarrega.

**A ideia.** Pela lei de Ampère-Maxwell (formulário), as fontes de campo magnético são a corrente de condução **e** a corrente de deslocamento. O que importa é a **soma** das duas.

**A conta.** Pelo item (d), em todo ponto:
$$\vec J + \vec J_d = \vec 0.$$
A corrente total é zero. Além disso, com placas infinitas, a simetria não deixa direção preferida no plano das placas para o campo apontar.

**Resposta.** **Não.** Há corrente de condução atravessando o material, mas a corrente de deslocamento a cancela exatamente, e não sobra nenhuma fonte para o campo magnético. Esperar campo só porque há corrente de condução é o erro comum aqui.`,
            passo: 3,
          },
        ],
        resultado: r`$Q = Q_0e^{-t/K\varepsilon_0\rho}$; $\vec J_d = -\vec J$; $\vec B = \vec 0$.`,
        errosComuns: ['Esperar campo magnético por haver corrente de condução: a de deslocamento a cancela exatamente.'],
        oficial: { resposta: 'O gabarito da monitoria não resolve este exercício: considera a lei de Gauss em dielétricos fora da ementa.', observacao: 'A resolução aqui é a desta bancada, conferida pela simulação nos itens (a) e (b).' },
      },
    },
  ],
}

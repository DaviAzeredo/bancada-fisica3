import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/**
 * P2 de Física III, 2026/1, diurno, versão A (IF-UFRJ, 2026-06-01).
 * Enunciados resumidos; o recorte original (só enunciado e figura) é gerado por
 * scripts/recortes.py a partir de fontes/provas/, e o PDF nunca vai para o site.
 * Cada `medida` com `teoria` é conferida pelo teste da prova: a simulação tem
 * de bater com a resolução analítica.
 */
export const p2_2026_1_diurno: ProvaInput = {
  id: 'p2-2026-1-diurno',
  titulo: 'P2 · 2026/1 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão A · 01/06/2026',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Qual campo viola ∮B·dA = 0?',
      resumo: 'Fluxo magnético por superfície fechada em três campos candidatos.',
      enunciado: r`Três campos são propostos como campos magnéticos estacionários ($C$ constante):

(I) $\vec B_\text{I} = C\,r\,\hat r$ (radial, esféricas); (II) $\vec B_\text{II} = \dfrac{C}{s}\,\hat\varphi$ (azimutal, cilíndricas); (III) $\vec B_\text{III} = C\,x\,\hat x$.

Qual(is) viola(m) nitidamente $\oint_S \vec B\cdot d\vec A = 0$?`,
      figura: { pagina: 1, recorte: [0.09, 0.52, 0.5, 0.85] },
      cena: { escala: 1, extensao: 2.4, unidade: 'm', camera: { pos: [4.2, 3.2, 5.2], alvo: [0.6, 0.3, 0.2] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Campo candidato',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'I · C r r̂' },
            { valor: 2, rotulo: 'II · (C/s) φ̂' },
            { valor: 3, rotulo: 'III · C x x̂' },
          ],
        },
        { id: 'Cc', rotulo: 'Constante C', simbolo: 'C', valor: 1, unidade: 'T/m', min: 0.2, max: 2, passo: 0.1 },
        { id: 'a', rotulo: 'Aresta do cubo', simbolo: 'a', valor: 1, unidade: 'm', min: 0.3, max: 1.4, passo: 0.05 },
      ],
      objetos: [
        { id: 'B1', tipo: 'campoB', ativo: 'caso==1', valor: '[Cc*x, Cc*y, Cc*z]', rotulo: 'B_I' },
        { id: 'B2', tipo: 'campoB', ativo: 'caso==2', valor: '[-Cc*y, Cc*x, 0]/(x^2+y^2)', rotulo: 'B_II' },
        { id: 'B3', tipo: 'campoB', ativo: 'caso==3', valor: '[Cc*x, 0, 0]', rotulo: 'B_III' },
        {
          id: 'S',
          tipo: 'gaussiana',
          forma: 'cubo',
          campo: 'B',
          centro: [0.9, 0.7, 0.3],
          lado: 'a',
          arrastavel: true,
          rotulo: 'Superfície fechada S',
        },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo por S (quadratura)', simbolo: r`\oint_S \vec B\cdot d\vec A`, expr: "fluxo('S')", unidade: 'Wb', teoria: 'caso==1 ? 3*Cc*a^3 : (caso==3 ? Cc*a^3 : 0)' },
        { rotulo: 'Divergente no centro de S', simbolo: r`\nabla\cdot\vec B`, expr: 'caso==1 ? 3*Cc : (caso==3 ? Cc : 0)', unidade: 'T/m' },
        { rotulo: 'Fluxo que sai de S', simbolo: r`\Phi_\text{sai}`, expr: "fluxoSai('S')", unidade: 'Wb' },
        { rotulo: 'Fluxo que entra em S', simbolo: r`\Phi_\text{entra}`, expr: "fluxoEntra('S')", unidade: 'Wb' },
      ],
      passos: [
        {
          titulo: 'O que a lei exige',
          texto: r`$\oint_S \vec B\cdot d\vec A = 0$ vale para **qualquer** superfície fechada: não existe "carga magnética". Pelo teorema da divergência isso equivale a $\nabla\cdot\vec B = 0$ em todo ponto.

Teste prático: arraste o cubo $S$. O que **sai** e o que **entra** mudam com a posição, mas a lei olha só para a diferença, o fluxo total: veja se ele fica nulo. Aqui ele fica parado em $3C\,a^3$, em qualquer lugar. A cor da superfície mostra o fluxo local: **laranja sai**, **azul entra**.`,
          parametros: { caso: 1 },
          medidas: [0, 2, 3],
        },
        {
          titulo: 'Caso (I): radial, cresce com r',
          texto: r`$\vec B_\text{I}$ aponta para fora em todo lugar e cresce com $r$: sai mais fluxo do que entra.

$$\nabla\cdot\vec B_\text{I} = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\,C r\right) = 3C \neq 0$$

O fluxo por $S$ é $3C\,a^3$, onde quer que o cubo esteja. **Viola.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Caso (II): azimutal, cai com 1/s',
          previsao: { pergunta: r`O campo azimutal (II) viola $\oint\vec B\cdot d\vec A = 0$?`, opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`As linhas de $\vec B_\text{II}$ são círculos em torno do eixo $z$: cada linha que entra em $S$ também sai.

$$\nabla\cdot\vec B_\text{II} = \frac{1}{s}\frac{\partial B_\varphi}{\partial\varphi} = 0$$

É exatamente o campo de um fio retilíneo infinito ($C = \mu_0 I/2\pi$). **Não viola.**`,
          parametros: { caso: 2 },
          medidas: [0],
        },
        {
          titulo: 'Caso (III): paralelo, cresce com x',
          texto: r`$\vec B_\text{III}$ só tem componente $x$, mas ela é maior na face de $x$ maior. O que sai pela face da direita supera o que entra pela da esquerda:

$$\nabla\cdot\vec B_\text{III} = \frac{\partial (Cx)}{\partial x} = C \neq 0 \quad\Rightarrow\quad \oint_S \vec B\cdot d\vec A = C\,a^3$$

**Viola.**`,
          parametros: { caso: 3 },
          medidas: [0, 1],
        },
        {
          titulo: 'Resposta',
          texto: r`Violam a condição os campos **(I) e (III)**: alternativa **(c)**.`,
          parametros: { caso: 3 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' },
          { texto: 'Teorema da divergência' },
          { texto: 'Divergência em coordenadas esféricas e cilíndricas' },
        ],
        etapas: [
          {
            titulo: 'Traduzir a lei para a forma local',
            texto: r`Pelo teorema da divergência, $\oint_S \vec B\cdot d\vec A = \int_V \nabla\cdot\vec B\,dV$. Exigir fluxo nulo para **toda** superfície fechada é o mesmo que exigir $\nabla\cdot\vec B = 0$ em todo ponto. Basta calcular a divergência de cada candidato.`,
            passo: 0,
          },
          {
            titulo: 'Campo (I), esféricas',
            texto: r`Só há componente radial, $B_r = Cr$:
$$\nabla\cdot\vec B_\text{I} = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2 B_r\right) = \frac{1}{r^2}\frac{\partial}{\partial r}\left(Cr^3\right) = 3C \neq 0.$$
Viola. Na cena, o fluxo por qualquer cubo vale $3C\,a^3$.`,
            passo: 1,
          },
          {
            titulo: 'Campo (II), cilíndricas',
            texto: r`Só há componente azimutal, $B_\varphi = C/s$, que não depende de $\varphi$:
$$\nabla\cdot\vec B_\text{II} = \frac{1}{s}\frac{\partial B_\varphi}{\partial\varphi} = 0.$$
Não viola. É o campo de um fio retilíneo infinito, com $C = \mu_0 I/2\pi$.`,
            passo: 2,
          },
          {
            titulo: 'Campo (III), cartesianas',
            texto: r`$$\nabla\cdot\vec B_\text{III} = \frac{\partial (Cx)}{\partial x} = C \neq 0.$$
Viola: o fluxo por um cubo de aresta $a$ é $C\,a^3$, onde quer que ele esteja.`,
            passo: 3,
          },
        ],
        resultado: r`Violam a condição os campos (I) e (III): alternativa **(c)**.`,
        errosComuns: [
          r`Calcular $\partial B_r/\partial r$ em vez de $\frac{1}{r^2}\partial_r(r^2 B_r)$: em coordenadas curvilíneas a divergência tem fatores de métrica.`,
          r`Achar que (II) viola porque diverge em $s = 0$. A singularidade no eixo é uma corrente em linha, que não cria fluxo magnético líquido.`,
          r`Achar que (III) é permitido por ser "paralelo". Paralelo não basta: o módulo varia **ao longo** da própria direção do campo.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`Não: $\nabla\cdot\vec B_\text{I} = 3C$ e $\nabla\cdot\vec B_\text{III} = C$ são diferentes de zero.` },
        { letra: 'b', texto: 'Somente a (I).', porque: r`Esquece a (III). Mesmo paralelo a $\hat x$, o campo cresce com $x$: sai mais fluxo pela face da direita do que entra pela da esquerda, e $\partial B_x/\partial x = C$.` },
        { letra: 'c', texto: 'Somente a (I) e a (III).', correta: true, porque: r`Correta. (I) tem $\nabla\cdot\vec B = 3C$ e (III) tem $\nabla\cdot\vec B = C$; só (II), o campo de um fio infinito, tem divergência nula.` },
        { letra: 'd', texto: 'Somente a (II) e a (III).', porque: r`A (II) não viola: $B_\varphi = C/s$ não depende de $\varphi$, então $\nabla\cdot\vec B = \frac1s\,\partial_\varphi B_\varphi = 0$. Falta a (I).` },
        { letra: 'e', texto: 'Somente a (I) e a (II).', porque: r`A (II) não viola (é o campo de um fio retilíneo), e falta a (III).` },
        { letra: 'f', texto: 'Somente a (III).', porque: r`Falta a (I): em esféricas $\nabla\cdot(Cr\,\hat r) = \frac{1}{r^2}\partial_r(r^2\cdot Cr) = 3C$.` },
        { letra: 'g', texto: 'Somente a (II).', porque: r`É exatamente o contrário: a (II) é a única das três que obedece $\oint\vec B\cdot d\vec A = 0$.` },
        { letra: 'h', texto: 'Todas elas.', porque: r`A (II) obedece à lei; o campo azimutal tem divergência nula.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Raio e período da hélice',
      resumo: 'Partícula com velocidade oblíqua a um B uniforme.',
      enunciado: r`Uma partícula de massa $m$ e carga $q>0$ parte em $t=0$ com $\vec v_0 = v_0\sin\theta\,\hat x + v_0\cos\theta\,\hat z$ numa região com $\vec B = B\,\hat z$ uniforme. Quais são o raio $r$ da hélice e o período $T$?`,
      figura: { pagina: 1, recorte: [0.5, 0.61, 0.93, 0.755] },
      cena: {
        escala: 0.002,
        extensao: 15,
        unidade: 'cm',
        camera: { pos: [26, 14, 22], alvo: [0, -4, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        { id: 'theta', rotulo: 'Ângulo entre v₀ e B', simbolo: r`\theta`, valor: 60, unidade: '°', min: 5, max: 90, passo: 1 },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'v0', rotulo: 'Velocidade inicial', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 4e4, max: 1.4e5, passo: 2e3 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        {
          id: 'p',
          tipo: 'particula',
          rotulo: 'próton',
          q: 'qe',
          m: 'mp',
          pos: [0, 0, '-2.8*cm'],
          v: ['v0*sin(rad(theta))', 0, 'v0*cos(rad(theta))'],
        },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '7*mm', rotulo: 'v' },
        {
          id: 'svpar',
          tipo: 'seta',
          papel: 'neutro',
          origem: "pos('p')",
          vetor: "[0, 0, z(vel('p'))]",
          comprimento: '7*mm*cos(rad(theta))',
          rotulo: 'v∥',
        },
        {
          id: 'sf',
          tipo: 'seta',
          papel: 'forca',
          origem: "pos('p')",
          vetor: "cross(vel('p'), B(pos('p')))",
          comprimento: '5*mm',
          rotulo: 'F = qv×B',
        },
      ],
      visual: { linhasB: true },
      medidas: [
        { rotulo: 'Raio medido no rastro', simbolo: 'r', expr: "t > pi*mp/(qe*B0) ? rastroSpan('p', 'y')/2 : 0/0", unidade: 'm', teoria: 'mp*v0*sin(rad(theta))/(qe*B0)' },
        { rotulo: 'Período', simbolo: 'T', expr: '2*pi*mp/(qe*B0)', unidade: 's' },
        { rotulo: 'Passo da hélice', simbolo: r`v_\parallel T`, expr: 'v0*cos(rad(theta))*2*pi*mp/(qe*B0)', unidade: 'm' },
        { rotulo: 'Velocidade (conservada)', simbolo: r`|\vec v|`, expr: "mag(vel('p'))", unidade: 'm/s', teoria: 'v0' },
      ],
      passos: [
        {
          titulo: 'Decompor a velocidade',
          texto: r`Separe $\vec v_0$ em relação a $\vec B$:

$$v_\perp = v_0\sin\theta \qquad v_\parallel = v_0\cos\theta$$

Só $v_\perp$ "sente" o campo, porque $\vec v_\parallel \times \vec B = 0$.`,
          camera: { pos: [26, 14, 22], alvo: [0, -4, 0] },
        },
        {
          titulo: 'No plano ⟂ B: movimento circular',
          texto: r`$\vec F = q\vec v\times\vec B$ é sempre perpendicular a $\vec v$: não muda a rapidez, só a direção. A força magnética faz o papel de centrípeta:

$$q v_\perp B = \frac{m v_\perp^2}{r}\quad\Rightarrow\quad r = \frac{m v_0\sin\theta}{qB}$$

Olhando de cima (ao longo de $\vec B$) o rastro é um círculo.`,
          camera: { pos: [0.01, 0, 34], alvo: [0, -4.5, 0] },
          medidas: [0, 3],
        },
        {
          titulo: 'O período não depende de θ',
          previsao: { pergunta: r`Se $\theta$ passar de 30° para 60°, o período da volta…`, opcoes: ['aumenta', 'diminui', 'não muda'], correta: 2 },
          texto: r`$$T = \frac{2\pi r}{v_\perp} = \frac{2\pi m}{qB}$$

O $\sin\theta$ cancela: mude o ângulo no controle e veja o raio mudar, mas o tempo de cada volta não.`,
          medidas: [1],
        },
        {
          titulo: 'Ao longo de B: velocidade constante',
          texto: r`Na direção $z$ não há força, então a partícula avança $v_\parallel T$ a cada volta: a soma dos dois movimentos é uma **hélice**.

Resposta: $r = \dfrac{m v_0\sin\theta}{qB}$, $T = \dfrac{2\pi m}{qB}$, alternativa **(e)**.`,
          camera: { pos: [30, 6, 4], alvo: [0, -4, 0] },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Movimento circular uniforme' },
          { texto: 'Decomposição de vetores' },
        ],
        etapas: [
          {
            titulo: 'Decompor a velocidade em relação a B',
            texto: r`Como $\vec B = B\hat z$ e $\theta$ é medido a partir de $\hat z$: $v_\parallel = v_0\cos\theta$ e $v_\perp = v_0\sin\theta$.`,
            passo: 0,
          },
          {
            titulo: 'O que a força magnética faz',
            texto: r`$\vec F = q\vec v\times\vec B$ só depende de $\vec v_\perp$, pois $\vec v_\parallel\times\vec B = 0$. Ela é perpendicular a $\vec v$, então não muda a rapidez: é uma força centrípeta de módulo constante $qv_\perp B$.`,
            passo: 1,
          },
          {
            titulo: 'Raio',
            texto: r`$$qv_\perp B = \frac{m v_\perp^2}{r}\quad\Rightarrow\quad r = \frac{m v_\perp}{qB} = \frac{m v_0\sin\theta}{qB}.$$`,
            passo: 1,
          },
          {
            titulo: 'Período',
            texto: r`$$T = \frac{2\pi r}{v_\perp} = \frac{2\pi m}{qB}.$$ Não depende de $v_0$ nem de $\theta$: é o período de cíclotron.`,
            passo: 2,
          },
          {
            titulo: 'Juntar os dois movimentos',
            texto: r`Ao longo de $z$ não há força: a partícula avança $v_\parallel T$ por volta (o passo da hélice), enquanto gira com raio $r$.`,
            passo: 3,
          },
        ],
        resultado: r`$r = \dfrac{mv_0\sin\theta}{qB}$ e $T = \dfrac{2\pi m}{qB}$: alternativa **(e)**.`,
        errosComuns: [
          r`Usar $v_0$ inteiro no raio: só a componente perpendicular a $\vec B$ gira.`,
          r`Achar que o período depende de $\theta$: partículas mais lentas fazem círculos menores no mesmo tempo.`,
          r`Trocar seno por cosseno: confira sempre a partir de qual eixo o ângulo é medido.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$r = \dfrac{mv_0\sin\theta}{qB}$, $T = \dfrac{2\pi m\sin\theta}{qB}$`, porque: r`O raio está certo, mas o período não depende de $\theta$: em $T = 2\pi r/v_\perp$ o $\sin\theta$ cancela.` },
        { letra: 'b', texto: r`$r = \dfrac{mv_0\cos\theta}{qB}$, $T = \dfrac{2\pi m\cos\theta}{qB}$`, porque: r`Usa $\cos\theta$, que é a componente **paralela** a $\vec B$. Ela não sente força e não entra no raio nem no período.` },
        { letra: 'c', texto: r`$r = \dfrac{mv_0}{qB}$, $T = \dfrac{2\pi m}{qB}$`, porque: r`Usa $v_0$ inteiro no raio. Só $v_\perp = v_0\sin\theta$ gira; vale apenas no caso particular $\theta = 90°$.` },
        { letra: 'd', texto: r`$r = \dfrac{mv_0\cos\theta}{qB}$, $T = \dfrac{2\pi m}{qB}$`, porque: r`O período está certo, mas o raio usa a componente paralela ($v_0\cos\theta$), que não participa do movimento circular.` },
        { letra: 'e', texto: r`$r = \dfrac{mv_0\sin\theta}{qB}$, $T = \dfrac{2\pi m}{qB}$`, correta: true, porque: r`Correta: $r = mv_\perp/qB$ com $v_\perp = v_0\sin\theta$, e $T = 2\pi m/qB$, independente de $v_0$ e de $\theta$.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Onde está o dielétrico?',
      resumo: 'Ler V(z) num capacitor com metade preenchida por isolante.',
      enunciado: r`O gráfico dá $V(z)$ dentro de um capacitor de placas paralelas em $z=0$ e $z=2L$ (sem efeitos de borda), com carga $\pm Q$. Uma das "metades" está vazia e a outra preenchida por um isolante homogêneo. Em qual metade está o isolante e qual é sua constante dielétrica $K$?`,
      figura: { pagina: 2, recorte: [0.1, 0.32, 0.5, 0.685] },
      cena: { escala: 0.002, extensao: 22, unidade: 'cm', camera: { pos: [-84, 30, 22], alvo: [0, 0, 5] } },
      parametros: [
        {
          id: 'regiao',
          rotulo: 'Isolante na região',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'I · 0 < z < L' },
            { valor: 2, rotulo: 'II · L < z < 2L' },
          ],
        },
        { id: 'K', rotulo: 'Constante dielétrica', simbolo: 'K', valor: 2, min: 1, max: 5, passo: 0.1 },
        { id: 'L', rotulo: 'Meia separação', simbolo: 'L', valor: 0.01, unidade: 'm', min: 0.01, max: 0.01 },
        { id: 'V0', rotulo: 'Escala do gráfico', simbolo: 'V_0', valor: 100, unidade: 'V', min: 100, max: 100 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'Capacitor',
          centro: [0, 0, 'L'],
          eixo: 'z',
          lado: '0.07',
          d: '2*L',
          Q: 'eps0*2*V0/L*0.07^2',
          dieletrico: { K: 'K', inicio: 'regiao==1 ? 0 : L', fim: 'regiao==1 ? L : 2*L' },
        },
        { id: 'zL', tipo: 'rotulo', pos: [0, '4.2*cm', 'L'], texto: 'z = L' },
        { id: 'r1', tipo: 'rotulo', pos: [0, '-4.2*cm', 'L/2'], texto: 'I' },
        { id: 'r2', tipo: 'rotulo', pos: [0, '-4.2*cm', '3*L/2'], texto: 'II' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'yz' },
      medidas: [
        { rotulo: 'Campo na região I', simbolo: 'E_I', expr: 'mag(E(0,0,L/2))', unidade: 'V/m', teoria: 'regiao==1 ? 2*V0/(K*L) : 2*V0/L' },
        { rotulo: 'Campo na região II', simbolo: 'E_{II}', expr: 'mag(E(0,0,3*L/2))', unidade: 'V/m', teoria: 'regiao==2 ? 2*V0/(K*L) : 2*V0/L' },
        { rotulo: 'V(0) − V(2L)', simbolo: r`\Delta V`, expr: 'V(0,0,0) - V(0,0,2*L)', unidade: 'V', teoria: '2*V0/L*(L + L/K)' },
        { rotulo: 'Razão E_II / E_I', expr: 'mag(E(0,0,3*L/2))/mag(E(0,0,L/2))', unidade: '' },
      ],
      graficos: [
        {
          titulo: 'Potencial ao longo do eixo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: 0, ate: '2*L', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'Simulação', expr: 'V(0,0,zz) - V(0,0,2*L)', unidade: 'V' },
            { rotulo: 'Gráfico da prova', expr: 'zz < L ? 3*V0 - V0*zz/L : 2*V0 - 2*V0*(zz-L)/L', unidade: 'V' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Ajuste a região e o K até a curva simulada cair sobre o gráfico da prova.',
          condicao: 'regiao==1 && abs(K-2) < 0.05',
          sucesso: 'As inclinações batem: isolante na região I com K = 2.',
        },
      ],
      passos: [
        {
          titulo: 'Ler as inclinações',
          texto: r`Como $\vec E = -\nabla V$, o campo em cada metade é menos a inclinação do gráfico:

$$E_\text{I} = \frac{3V_0 - 2V_0}{L} = \frac{V_0}{L} \qquad E_\text{II} = \frac{2V_0 - 0}{L} = \frac{2V_0}{L}$$

O campo é **menor na região I**.`,
          parametros: { regiao: 2, K: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Quem reduz o campo é o isolante',
          previsao: { pergunta: 'O isolante está na metade onde o campo é…', opcoes: ['maior', 'menor'], correta: 1 },
          texto: r`Sem isolante, $E = \sigma/\varepsilon_0$ nas duas metades (mesma carga livre $\sigma = Q/A$). Num dielétrico, as cargas de polarização na superfície da lâmina reduzem o campo:

$$E_\text{diel} = \frac{\sigma}{K\varepsilon_0} = \frac{E_\text{vácuo}}{K}$$

Então o isolante está onde o campo é menor: **região I**. Veja as setas encurtarem dentro da lâmina.`,
          parametros: { regiao: 1, K: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'Valor de K',
          texto: r`$$K = \frac{E_\text{vácuo}}{E_\text{diel}} = \frac{E_\text{II}}{E_\text{I}} = \frac{2V_0/L}{V_0/L} = 2$$

Isolante na região I, $K = 2$: alternativa **(e)**. No gráfico, a curva simulada coincide com a da prova.`,
          parametros: { regiao: 1, K: 2 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: r`$\vec E = -\nabla V$`, lab: 'potencial' },
          { texto: 'Dielétricos e cargas de polarização', lab: 'capacitor' },
          { texto: 'Capacitor ideal (sem efeito de borda)' },
        ],
        etapas: [
          {
            titulo: 'Campo em cada metade a partir do gráfico',
            texto: r`Dentro do capacitor o campo é uniforme em cada meio, logo $V(z)$ é reta e $E = -dV/dz$:
$$E_\text{I} = \frac{3V_0 - 2V_0}{L} = \frac{V_0}{L},\qquad E_\text{II} = \frac{2V_0 - 0}{L} = \frac{2V_0}{L}.$$`,
            passo: 0,
          },
          {
            titulo: 'Por que o campo muda de um meio para o outro',
            texto: r`A carga livre nas placas é a mesma, $\sigma = Q/A$. No vácuo, $E = \sigma/\varepsilon_0$. No dielétrico, as cargas de polarização nas faces da lâmina reduzem o campo para $E = \sigma/K\varepsilon_0$. O isolante está onde o campo é **menor**: região I.`,
            passo: 1,
          },
          {
            titulo: 'Constante dielétrica',
            texto: r`$$K = \frac{E_\text{vácuo}}{E_\text{diel}} = \frac{E_\text{II}}{E_\text{I}} = \frac{2V_0/L}{V_0/L} = 2.$$`,
            passo: 2,
          },
        ],
        resultado: r`O isolante está na região I e $K = 2$: alternativa **(e)**.`,
        errosComuns: [
          r`Comparar os valores de $V$ em vez das inclinações: o campo vem da derivada.`,
          r`Inverter a razão e chegar em $K = 1/2$. Dielétricos sempre reduzem o campo, então $K \geq 1$.`,
          r`Achar que o isolante fica onde o potencial é maior. O potencial é contínuo; o que muda na interface é a inclinação.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: 'O isolante está na região II e K = 2.', porque: r`Região trocada. A região II tem a inclinação maior ($2V_0/L$), logo o campo maior: é a metade vazia.` },
        { letra: 'b', texto: 'O isolante está na região II e K = 1/2.', porque: r`Região trocada, e $K < 1$ não existe para dielétricos: a polarização sempre reduz o campo ($K \geq 1$).` },
        { letra: 'c', texto: 'O isolante está na região I e K = 1/2.', porque: r`Região certa, mas a razão está invertida: $K = E_\text{vácuo}/E_\text{diel} = 2$, não $E_\text{diel}/E_\text{vácuo}$.` },
        { letra: 'd', texto: 'O isolante está na região I e K = 3.', porque: r`Confunde o valor de $V$ ($3V_0$ em $z = 0$) com a inclinação. O que importa é a razão entre as inclinações, $2$.` },
        { letra: 'e', texto: 'O isolante está na região I e K = 2.', correta: true, porque: r`Correta: o campo é menor na região I ($V_0/L$ contra $2V_0/L$), então o isolante está lá, com $K = 2$.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Razão entre resistividades',
      resumo: 'Dois fios ôhmicos com L₂ = 3L₁ e r₂ = r₁/2.',
      enunciado: r`Dois fios cilíndricos, homogêneos e ôhmicos têm $L_2 = 3L_1$ e $r_2 = r_1/2$. Com ddp de $4\,\text{V}$ o fio 1 conduz $2\,\text{A}$; com $6\,\text{V}$ o fio 2 conduz $1\,\text{A}$. Quanto vale $\rho_2/\rho_1$?`,
      figura: [
        { pagina: 2, recorte: [0.1, 0.82, 0.52, 0.925] },
        { pagina: 2, recorte: [0.52, 0.205, 0.93, 0.305] },
      ],
      cena: { escala: 0.01, extensao: 18, unidade: 'cm', plano: 'xy', camera: { pos: [0, -6, 62], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'L1', rotulo: 'Comprimento do fio 1', simbolo: 'L_1', valor: 0.08, unidade: 'm', min: 0.04, max: 0.1, passo: 0.005 },
        { id: 'r1', rotulo: 'Raio do fio 1', simbolo: 'r_1', valor: 0.012, unidade: 'm', min: 0.006, max: 0.016, passo: 0.001 },
        { id: 'V1', rotulo: 'ddp no fio 1', simbolo: 'V_1', valor: 4, unidade: 'V', min: 4, max: 4 },
        { id: 'I1', rotulo: 'Corrente no fio 1', simbolo: 'I_1', valor: 2, unidade: 'A', min: 2, max: 2 },
        { id: 'V2', rotulo: 'ddp no fio 2', simbolo: 'V_2', valor: 6, unidade: 'V', min: 6, max: 6 },
        { id: 'I2', rotulo: 'Corrente no fio 2', simbolo: 'I_2', valor: 1, unidade: 'A', min: 1, max: 1 },
      ],
      objetos: [
        { id: 'f1', tipo: 'condutor', rotulo: 'Fio 1', a: ['-L1*1.5', '6*cm', 0], b: ['-L1*0.5', '6*cm', 0], raio: 'r1', I: 'I1' },
        { id: 'f2', tipo: 'condutor', rotulo: 'Fio 2', a: ['-L1*1.5', '-6*cm', 0], b: ['L1*1.5', '-6*cm', 0], raio: 'r1/2', I: 'I2' },
        { id: 'c1', tipo: 'cota', a: ['-L1*1.5', '6*cm', 0], b: ['-L1*0.5', '6*cm', 0], deslocamento: [0, 'r1 + 1.2*cm', 0], rotulo: 'L₁' },
        { id: 'c2', tipo: 'cota', a: ['-L1*1.5', '-6*cm', 0], b: ['L1*1.5', '-6*cm', 0], deslocamento: [0, '-(r1/2 + 1.2*cm)', 0], rotulo: 'L₂ = 3L₁' },
      ],
      medidas: [
        { rotulo: 'Resistência do fio 1', simbolo: 'R_1 = V_1/I_1', expr: 'V1/I1', unidade: 'Ω', teoria: '2' },
        { rotulo: 'Resistência do fio 2', simbolo: 'R_2 = V_2/I_2', expr: 'V2/I2', unidade: 'Ω', teoria: '6' },
        { rotulo: 'Resistividade 1', simbolo: r`\rho_1 = R_1A_1/L_1`, expr: '(V1/I1)*pi*r1^2/L1', unidade: 'Ω·m' },
        { rotulo: 'Resistividade 2', simbolo: r`\rho_2 = R_2A_2/L_2`, expr: '(V2/I2)*pi*(r1/2)^2/(3*L1)', unidade: 'Ω·m' },
        { rotulo: 'Razão', simbolo: r`\rho_2/\rho_1`, expr: '((V2/I2)*pi*(r1/2)^2/(3*L1))/((V1/I1)*pi*r1^2/L1)', unidade: '', teoria: '0.25' },
        { rotulo: 'Densidade de corrente J₂/J₁', expr: '(I2/(pi*(r1/2)^2))/(I1/(pi*r1^2))', unidade: '' },
      ],
      passos: [
        {
          titulo: 'Resistência de cada fio',
          texto: r`Pela lei de Ohm, $R = V/I$:

$$R_1 = \frac{4\,\text{V}}{2\,\text{A}} = 2\,\Omega \qquad R_2 = \frac{6\,\text{V}}{1\,\text{A}} = 6\,\Omega$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Da resistência à resistividade',
          texto: r`Para um fio homogêneo de seção $A = \pi r^2$:

$$R = \rho\frac{L}{A} \quad\Rightarrow\quad \rho = \frac{R\,A}{L}$$

A resistividade é do **material**; a resistência depende também da forma. O fio 2 é mais longo e mais fino, então teria $R$ maior mesmo com o mesmo material.`,
          medidas: [2, 3],
        },
        {
          titulo: 'A razão',
          texto: r`$$\frac{\rho_2}{\rho_1} = \frac{R_2}{R_1}\cdot\frac{A_2}{A_1}\cdot\frac{L_1}{L_2} = 3\cdot\frac14\cdot\frac13 = \frac14$$

Note que os valores de $L_1$ e $r_1$ não importam: mude-os nos controles e a razão continua $1/4$. Alternativa **(d)**.

Os pontos que andam nos fios representam a densidade de corrente $J = I/A$: no fio 2 ela é o dobro.`,
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: r`Lei de Ohm: $V = RI$` },
          { texto: r`Resistência e resistividade: $R = \rho L/A$` },
        ],
        etapas: [
          { titulo: 'Resistência de cada fio', texto: r`$R_1 = 4\,\text{V}/2\,\text{A} = 2\,\Omega$ e $R_2 = 6\,\text{V}/1\,\text{A} = 6\,\Omega$.`, passo: 0 },
          {
            titulo: 'Isolar a resistividade',
            texto: r`Para um fio homogêneo de seção $A = \pi r^2$: $R = \rho L/A$, logo $\rho = RA/L$. A resistividade é do material; a resistência depende também da forma.`,
            passo: 1,
          },
          {
            titulo: 'Montar a razão',
            texto: r`$$\frac{\rho_2}{\rho_1} = \frac{R_2}{R_1}\cdot\frac{A_2}{A_1}\cdot\frac{L_1}{L_2},\qquad \frac{A_2}{A_1} = \left(\frac{r_2}{r_1}\right)^2 = \frac14,\qquad \frac{L_1}{L_2} = \frac13.$$
$$\frac{\rho_2}{\rho_1} = 3\cdot\frac14\cdot\frac13 = \frac14.$$`,
            passo: 2,
          },
        ],
        resultado: r`$\rho_2/\rho_1 = 1/4$: alternativa **(d)**.`,
        errosComuns: [
          r`Usar a razão dos raios no lugar da razão das áreas: $A \propto r^2$.`,
          r`Parar em $R_2/R_1 = 3$, confundindo resistência com resistividade.`,
          r`Inverter $L_1/L_2$: um fio mais longo tem resistência maior com o mesmo material.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\rho_2/\rho_1 = 1/2$`, porque: r`Usa $r_2/r_1 = 1/2$ no lugar da razão das áreas. A área cresce com o quadrado do raio: $A_2/A_1 = 1/4$.` },
        { letra: 'b', texto: r`$\rho_2/\rho_1 = 3$`, porque: r`É só $R_2/R_1 = 3$. Resistência depende da forma; resistividade é do material, então a geometria precisa sair da conta.` },
        { letra: 'c', texto: r`$\rho_2/\rho_1 = 1$`, porque: r`Corrige o comprimento ($R_2/R_1 \cdot L_1/L_2 = 1$) mas esquece a área.` },
        { letra: 'd', texto: r`$\rho_2/\rho_1 = 1/4$`, correta: true, porque: r`Correta: $\frac{\rho_2}{\rho_1} = \frac{R_2}{R_1}\cdot\frac{A_2}{A_1}\cdot\frac{L_1}{L_2} = 3\cdot\frac14\cdot\frac13 = \frac14$.` },
        { letra: 'e', texto: r`$\rho_2/\rho_1 = 1/3$`, porque: r`É só $L_1/L_2$: esquece as resistências e as áreas.` },
        { letra: 'f', texto: r`$\rho_2/\rho_1 = 12$`, porque: r`Inverte a razão das áreas ($A_1/A_2 = 4$) e ignora os comprimentos: $3 \cdot 4 = 12$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'ddp com casca esférica',
      resumo: 'V(3R) − V(R/2) para uma casca de raio R e carga Q.',
      enunciado: r`Uma casca esférica (bidimensional) de raio $R$ tem carga $Q$ uniformemente distribuída. Qual é a diferença de potencial $V(3R) - V(R/2)$ entre um ponto a $r = 3R$ do centro e outro a $r = R/2$?`,
      figura: { pagina: 2, recorte: [0.51, 0.452, 0.93, 0.585] },
      cena: { escala: 0.01, extensao: 34, unidade: 'cm', camera: { pos: [30, 26, 92], alvo: [10, 0, 0] } },
      parametros: [
        { id: 'Q', rotulo: 'Carga da casca', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: -3e-9, max: 3e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio da casca', simbolo: 'R', valor: 0.1, unidade: 'm', min: 0.05, max: 0.11, passo: 0.005 },
      ],
      objetos: [
        { id: 'casca', tipo: 'esfera', oca: true, Q: 'Q', centro: [0, 0, 0], raio: 'R', rotulo: 'Casca (Q, R)' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: ['3*R', 0, 0], rotulo: 'r = 3R' },
        { id: 'Bp', tipo: 'sonda', campo: 'E', pos: ['R/2', 0, 0], rotulo: 'r = R/2' },
        { id: 'gin', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: '0.7*R', rotulo: 'Gaussiana interna', ativo: 0 },
      ],
      visual: { linhasE: true, planoV: { normal: 'z', posicao: 0 } },
      medidas: [
        { rotulo: 'Potencial em r = 3R', simbolo: 'V(3R)', expr: 'V(3*R,0,0)', unidade: 'V', teoria: 'k0*Q/(3*R)' },
        { rotulo: 'Potencial em r = R/2', simbolo: 'V(R/2)', expr: 'V(R/2,0,0)', unidade: 'V', teoria: 'k0*Q/R' },
        { rotulo: 'Diferença', simbolo: 'V(3R) - V(R/2)', expr: 'V(3*R,0,0) - V(R/2,0,0)', unidade: 'V', teoria: '-2*k0*Q/(3*R)' },
        { rotulo: 'Campo em r = R/2', simbolo: 'E(R/2)', expr: 'mag(E(R/2,0,0))', unidade: 'V/m' },
      ],
      graficos: [
        {
          titulo: 'V(r) e E(r)',
          tipo: 'perfil',
          x: { variavel: 'rr', de: 0, ate: '4*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'V(r)', expr: 'V(rr,0,0)', unidade: 'V' },
            { rotulo: 'E(r)', expr: 'mag(E(rr,0,0))', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Fora da casca: como carga pontual',
          texto: r`Para $r > R$, uma gaussiana esférica envolve toda a carga $Q$, e por simetria

$$E = \frac{k_0 Q}{r^2}\quad\Rightarrow\quad V(r) = \frac{k_0 Q}{r}\qquad V(3R) = \frac{k_0Q}{3R}$$`,
          medidas: [0],
        },
        {
          titulo: 'Dentro: campo nulo, potencial constante',
          previsao: { pergunta: r`Dentro da casca ($r < R$), o potencial é…`, opcoes: ['zero', r`constante, igual ao da superfície`, 'maior no centro'], correta: 1 },
          texto: r`Para $r < R$, a gaussiana não envolve carga: $E = 0$. Sem campo, o potencial não varia, e por continuidade vale o da superfície:

$$V(R/2) = V(R) = \frac{k_0 Q}{R}$$

No plano de potencial, o interior tem **cor uniforme**; no gráfico, $V(r)$ é plano até $r = R$.`,
          mostrar: ['gin'],
          medidas: [1, 3],
        },
        {
          titulo: 'A diferença',
          texto: r`$$V(3R) - V(R/2) = \frac{k_0Q}{3R} - \frac{k_0Q}{R} = -\frac{2k_0Q}{3R}$$

Negativa para $Q > 0$: o potencial cai ao se afastar. Alternativa **(b)**.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss com simetria esférica', lab: 'gauss' },
          { texto: 'Potencial como integral do campo', lab: 'potencial' },
          { texto: 'Continuidade do potencial' },
        ],
        etapas: [
          {
            titulo: 'Fora da casca',
            texto: r`Uma gaussiana esférica de raio $r > R$ envolve $Q$: $E = k_0Q/r^2$, como uma carga pontual. Com $V(\infty) = 0$: $V(r) = k_0Q/r$, e $V(3R) = k_0Q/3R$.`,
            passo: 0,
          },
          {
            titulo: 'Dentro da casca',
            texto: r`Uma gaussiana com $r < R$ não envolve carga: $E = 0$. Sem campo, o potencial não varia, e pela continuidade em $r = R$ vale $V(R/2) = V(R) = k_0Q/R$.`,
            passo: 1,
          },
          {
            titulo: 'Diferença',
            texto: r`$$V(3R) - V(R/2) = \frac{k_0Q}{3R} - \frac{k_0Q}{R} = -\frac{2k_0Q}{3R}.$$ Negativa para $Q > 0$: o potencial cai ao se afastar da casca.`,
            passo: 2,
          },
        ],
        resultado: r`$V(3R) - V(R/2) = -\dfrac{2k_0Q}{3R}$: alternativa **(b)**.`,
        errosComuns: [
          r`Achar que $V = 0$ dentro da casca porque $E = 0$. Campo nulo quer dizer potencial constante, não nulo.`,
          r`Usar $k_0Q/r$ também dentro ($r = R/2$), como se a carga estivesse no centro.`,
          r`Inverter a ordem da subtração e perder o sinal.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{k_0Q}{3R}$`, porque: r`É o erro clássico: achar que $V = 0$ dentro da casca porque $E = 0$ lá. Campo nulo significa potencial **constante**, igual ao da superfície, $k_0Q/R$.` },
        { letra: 'b', texto: r`$-\dfrac{2k_0Q}{3R}$`, correta: true, porque: r`Correta: $V(3R) = k_0Q/3R$ e, dentro, $V = k_0Q/R$; a diferença é $-2k_0Q/3R$.` },
        { letra: 'c', texto: r`$-\dfrac{5k_0Q}{3R}$`, porque: r`Trata o ponto interno como se a carga estivesse concentrada no centro: $k_0Q/(R/2) = 2k_0Q/R$. Dentro da casca o potencial não cresce, fica em $k_0Q/R$.` },
        { letra: 'd', texto: r`$+\dfrac{2k_0Q}{3R}$`, porque: r`Valores certos, sinal invertido: calcula $V(R/2) - V(3R)$.` },
        { letra: 'e', texto: r`$-\dfrac{3k_0Q}{2R}$`, porque: r`Não sai de nenhum par consistente de potenciais. Confira $V(3R) = k_0Q/3R$ e $V(R/2) = k_0Q/R$.` },
        { letra: 'f', texto: r`$-\dfrac{k_0Q}{R}$`, porque: r`Toma $V(3R) = 0$, como se o ponto externo estivesse no infinito.` },
        { letra: 'g', texto: r`$+\dfrac{k_0Q}{2R}$`, porque: r`Sinal e valores errados; não corresponde a uma conta consistente com a lei de Gauss.` },
        { letra: 'h', texto: '$0$', porque: r`Valeria se o campo fosse nulo também fora. Ele só é nulo dentro da casca; entre $R$ e $3R$ o campo é $k_0Q/r^2$.` },
      ],
    },

    /* ───────────────────────── Discursiva 1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 2.5,
      titulo: 'Capacitor com lâmina dielétrica',
      resumo: 'Capacitância e energia com lâmina de espessura λL e constante K.',
      enunciado: r`Um capacitor de placas paralelas tem área $A$ (grande) e separação $L$ (pequena). Uma lâmina dielétrica de constante $K$ e espessura $\lambda L$, $0\le\lambda\le 1$, é inserida paralelamente às placas.

(a) Determine $C_\text{eq}$ em termos de $K$, $\varepsilon_0$, $A$, $L$ e $\lambda$. (b) Interprete os casos $K = 1$ e $\lambda = 1$. (c) Com ddp $V$ entre as placas, determine a energia $U$. (d) Interprete $U$ nos mesmos casos.`,
      figura: { pagina: 3, recorte: [0.12, 0.24, 0.51, 0.9] },
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [26, 20, 74], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'K', rotulo: 'Constante dielétrica', simbolo: 'K', valor: 3, min: 1, max: 6, passo: 0.1 },
        { id: 'lam', rotulo: 'Fração preenchida', simbolo: r`\lambda`, valor: 0.5, min: 0, max: 1, passo: 0.01 },
        { id: 'Vb', rotulo: 'ddp aplicada', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 5 },
        { id: 'Lsep', rotulo: 'Separação', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'Capacitor',
          centro: [0, 0, 0],
          eixo: 'x',
          lado: 'lado',
          d: 'Lsep',
          Q: 'K*eps0*lado^2*Vb/(Lsep*(K*(1-lam)+lam))',
          dieletrico: { K: 'K', inicio: '(1-lam)*Lsep/2', fim: '(1+lam)*Lsep/2' },
        },
        { id: 'cL', tipo: 'cota', a: ['-Lsep/2', '-0.55*lado', 0], b: ['Lsep/2', '-0.55*lado', 0], rotulo: 'L' },
        { id: 'cl', tipo: 'cota', a: ['-lam*Lsep/2', '0.55*lado', 0], b: ['lam*Lsep/2', '0.55*lado', 0], rotulo: 'λL', ativo: 'lam > 0.02' },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância (geometria simulada)', simbolo: r`C_\text{eq}`, expr: "C('cap')", unidade: 'F', teoria: 'K*eps0*lado^2/(Lsep*(K*(1-lam)+lam))' },
        { rotulo: 'Carga nas placas', simbolo: 'Q = C_{eq}V', expr: "Q('cap')", unidade: 'C' },
        { rotulo: 'ddp medida entre as placas', simbolo: r`\Delta V`, expr: 'V(-Lsep/2,0,0) - V(Lsep/2,0,0)', unidade: 'V', teoria: 'Vb' },
        { rotulo: 'Energia armazenada', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: 'K*eps0*lado^2*Vb^2/(2*Lsep*(K*(1-lam)+lam))' },
        { rotulo: 'Campo no vácuo', simbolo: 'E_0', expr: 'mag(E(-Lsep*(1+lam)/4,0,0))', unidade: 'V/m', teoria: 'K*Vb/(Lsep*(K*(1-lam)+lam))', ativo: 'lam < 0.98' },
        { rotulo: 'Campo no dielétrico', simbolo: 'E_d', expr: 'mag(E(0,0,0))', unidade: 'V/m', teoria: 'Vb/(Lsep*(K*(1-lam)+lam))', ativo: 'lam > 0.02' },
      ],
      graficos: [
        {
          titulo: 'C_eq em função de λ',
          tipo: 'perfil',
          x: { variavel: 'lam', de: 0, ate: 1, rotulo: 'λ', unidade: '' },
          series: [{ rotulo: 'C_eq(λ)', expr: 'K*eps0*lado^2/(Lsep*(K*(1-lam)+lam))', unidade: 'F' }],
        },
        {
          titulo: 'Potencial entre as placas',
          tipo: 'perfil',
          x: { variavel: 'xx', de: '-Lsep/2', ate: 'Lsep/2', rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'V(x)', expr: 'V(xx,0,0) - V(Lsep/2,0,0)', unidade: 'V' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Dois capacitores em série',
          texto: r`A lâmina divide o espaço em vácuo (espessura total $(1-\lambda)L$) e dielétrico ($\lambda L$). A carga $Q$ é a mesma em toda a pilha, e as ddps se somam: é uma **associação em série**.

$$\frac{1}{C_\text{eq}} = \frac{(1-\lambda)L}{\varepsilon_0 A} + \frac{\lambda L}{K\varepsilon_0 A}$$

$$C_\text{eq} = \frac{K\varepsilon_0 A}{L\,[K(1-\lambda)+\lambda]}$$

A posição da lâmina entre as placas não importa, só a espessura.`,
          medidas: [0, 4, 5],
        },
        {
          item: 'b',
          titulo: '(b) Casos particulares',
          texto: r`**$K = 1$:** $C_\text{eq} = \varepsilon_0A/L$. Um "dielétrico" com $K = 1$ não polariza: é o mesmo que vácuo.

**$\lambda = 1$:** $C_\text{eq} = K\varepsilon_0A/L$. A lâmina preenche tudo e a capacitância fica multiplicada por $K$.

Mova $K$ e $\lambda$ e acompanhe a curva $C_\text{eq}(\lambda)$.`,
          parametros: { lam: 1, K: 3 },
          medidas: [0],
        },
        {
          item: 'c',
          titulo: '(c) Energia com ddp V',
          texto: r`Com a fonte mantendo $V$:

$$U = \frac12 C_\text{eq}V^2 = \frac{K\varepsilon_0 A V^2}{2L\,[K(1-\lambda)+\lambda]}$$

Na cena, $V$ entre as placas é medido no potencial calculado a partir das cargas livres e de polarização.`,
          parametros: { lam: 0.5, K: 3 },
          medidas: [2, 3],
        },
        {
          item: 'd',
          titulo: '(d) Energia nos casos particulares',
          previsao: { pergunta: r`Com a fonte mantendo $V$, preencher todo o capacitor com o dielétrico faz a energia…`, opcoes: ['diminuir', 'ficar igual', r`aumentar $K$ vezes`], correta: 2 },
          texto: r`**$K = 1$:** $U = \varepsilon_0AV^2/2L$, a energia do capacitor vazio.

**$\lambda = 1$:** $U = K\varepsilon_0AV^2/2L$, $K$ vezes maior. Com $V$ fixo, o dielétrico permite que a fonte coloque **mais carga** nas placas ($Q = CV$ cresce por $K$), e a energia armazenada cresce junto.`,
          parametros: { lam: 1, K: 3 },
          medidas: [1, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Capacitância de placas paralelas', lab: 'capacitor' },
          { texto: 'Associação em série' },
          { texto: 'Energia no capacitor' },
        ],
        etapas: [
          {
            titulo: '(a) O sistema é uma série de dois capacitores',
            texto: r`Imagine uma placa metálica fina colada na face da lâmina: nada muda. Ficam um capacitor de vácuo com separação total $(1-\lambda)L$ e um de dielétrico com $\lambda L$, com a mesma carga $Q$ (série):
$$C_\text{vácuo} = \frac{\varepsilon_0 A}{(1-\lambda)L},\qquad C_\text{diel} = \frac{K\varepsilon_0 A}{\lambda L}.$$`,
            passo: 0,
          },
          {
            titulo: '(a) Capacitância equivalente',
            texto: r`$$\frac{1}{C_\text{eq}} = \frac{(1-\lambda)L}{\varepsilon_0 A} + \frac{\lambda L}{K\varepsilon_0 A} = \frac{L\,[K(1-\lambda) + \lambda]}{K\varepsilon_0 A}\ \Rightarrow\ C_\text{eq} = \frac{K\varepsilon_0 A}{L\,[K(1-\lambda)+\lambda]}.$$
A posição da lâmina entre as placas não importa, só a espessura.`,
            passo: 0,
          },
          {
            titulo: '(b) Casos particulares',
            texto: r`$K = 1$: $C_\text{eq} = \varepsilon_0A/L$. Um meio com $K = 1$ não polariza; é vácuo.

$\lambda = 1$: $C_\text{eq} = K\varepsilon_0A/L$. O capacitor está todo preenchido e a capacitância fica multiplicada por $K$. Os dois limites recuperam resultados conhecidos, o que verifica a fórmula de (a).`,
            passo: 1,
          },
          {
            titulo: '(c) Energia com ddp V',
            texto: r`$$U = \tfrac12 C_\text{eq}V^2 = \frac{K\varepsilon_0 A V^2}{2L\,[K(1-\lambda)+\lambda]}.$$`,
            passo: 2,
          },
          {
            titulo: '(d) Energia nos casos particulares',
            texto: r`$K = 1$: $U = \varepsilon_0AV^2/2L$, a do capacitor vazio.

$\lambda = 1$: $U = K\varepsilon_0AV^2/2L$, $K$ vezes maior. Com $V$ fixo pela fonte, o dielétrico deixa a fonte pôr **mais carga** ($Q = C_\text{eq}V$ cresce por $K$), e a energia armazenada cresce junto.`,
            passo: 3,
          },
        ],
        resultado: r`$C_\text{eq} = \dfrac{K\varepsilon_0A}{L[K(1-\lambda)+\lambda]}$ e $U = \dfrac{K\varepsilon_0AV^2}{2L[K(1-\lambda)+\lambda]}$.`,
        errosComuns: [
          r`Somar as capacitâncias como se estivessem em paralelo. A carga atravessa os dois meios em sequência: é série.`,
          r`Usar $U = Q^2/2C$ com $Q$ fixo. Aqui a fonte mantém $V$; com $Q$ fixo a energia **diminuiria** com o dielétrico.`,
          r`Achar que a posição da lâmina altera $C_\text{eq}$. Só a espessura total de cada meio entra.`,
        ],
        oficial: { resposta: r`$C_\text{eq} = \dfrac{K\varepsilon_0A}{L[K(1-\lambda)+\lambda]}$ e $U = \dfrac{C_\text{eq}V^2}{2}$`, observacao: r`O gabarito chama $C_1$ o trecho com dielétrico e $C_2$ o de vácuo; a soma em série é a mesma.` },
      },
      respostas: [
        { item: 'a', texto: r`$C_\text{eq} = \dfrac{K\varepsilon_0A}{L[K(1-\lambda)+\lambda]}$`, pontos: 0.8, criterio: r`Montagem como série (ou campo em cada meio) e expressão final de $C_\text{eq}$.` },
        { item: 'b', texto: r`$K=1$: $\varepsilon_0A/L$ (vácuo). $\lambda=1$: $K\varepsilon_0A/L$ (preenchido).`, pontos: 0.6, criterio: r`Os dois limites e a interpretação física de cada um.` },
        { item: 'c', texto: r`$U = \dfrac{K\varepsilon_0AV^2}{2L[K(1-\lambda)+\lambda]}$`, pontos: 0.5, criterio: r`$U = \frac12 C_\text{eq}V^2$ com a expressão de (a).` },
        { item: 'd', texto: r`$K=1$: $\varepsilon_0AV^2/2L$. $\lambda=1$: $K\varepsilon_0AV^2/2L$.`, pontos: 0.6, criterio: r`Os dois limites e a explicação de por que $U$ cresce com $V$ fixo.` },
      ],
    },

    /* ───────────────────────── Discursiva 2 ───────────────────────── */
    {
      id: 'disc2',
      numero: 'D2',
      secao: 'Discursiva',
      pontos: 2.5,
      titulo: 'Malha retangular perto de um fio',
      resumo: 'Forças magnéticas em cada lado da malha e força resultante.',
      enunciado: r`Um fio retilíneo muito longo conduz corrente $I_0$. Uma malha retangular rígida, coplanar ao fio, de lados $a$ (paralelo ao fio) e $b$ (perpendicular), conduz corrente $I$ no sentido da figura; o lado mais próximo dista $L$ do fio. O campo do fio é $B = \mu_0 I_0/(2\pi s)$, pela regra da mão direita.

(a) Força no lado mais próximo. (b) Força no lado mais distante. (c) Força em cada lado perpendicular ao fio. (d) Força resultante na malha. A espira se move? Para que lado?`,
      figura: { pagina: 3, recorte: [0.52, 0.22, 0.91, 0.92] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [3.5, 0.5, 19], alvo: [3.5, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I_0', valor: 20, unidade: 'A', min: 1, max: 40, passo: 1 },
        { id: 'I', rotulo: 'Corrente na malha', simbolo: 'I', valor: 10, unidade: 'A', min: -20, max: 20, passo: 1 },
        { id: 'L', rotulo: 'Distância ao fio', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.005, max: 0.05, passo: 0.001 },
        { id: 'a', rotulo: 'Lado paralelo', simbolo: 'a', valor: 0.06, unidade: 'm', min: 0.02, max: 0.1, passo: 0.005 },
        { id: 'b', rotulo: 'Lado perpendicular', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.01, max: 0.06, passo: 0.005 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I₀' },
        { id: 'perto', tipo: 'fio', I: 'I', arraste: { param: 'L', eixo: 'x' }, a: ['L', '-a/2', 0], b: ['L', 'a/2', 0] },
        { id: 'topo', tipo: 'fio', I: 'I', arraste: { param: 'L', eixo: 'x' }, a: ['L', 'a/2', 0], b: ['L+b', 'a/2', 0] },
        { id: 'longe', tipo: 'fio', I: 'I', arraste: { param: 'L', eixo: 'x' }, a: ['L+b', 'a/2', 0], b: ['L+b', '-a/2', 0] },
        { id: 'base', tipo: 'fio', I: 'I', arraste: { param: 'L', eixo: 'x' }, a: ['L+b', '-a/2', 0], b: ['L', '-a/2', 0] },
        {
          id: 'Fp',
          tipo: 'seta',
          papel: 'forca',
          origem: ['L', 0, 0],
          vetor: "forca('perto','fio')",
          comprimento: '2*cm',
          rotulo: 'F perto',
        },
        {
          id: 'Fl',
          tipo: 'seta',
          papel: 'forca',
          origem: ['L+b', 0, 0],
          vetor: "forca('longe','fio')",
          comprimento: "2*cm*mag(forca('longe','fio'))/mag(forca('perto','fio'))",
          rotulo: 'F longe',
        },
        {
          id: 'Ft',
          tipo: 'seta',
          papel: 'forca',
          origem: ['L+b/2', 'a/2', 0],
          vetor: "forca('topo','fio')",
          comprimento: "2*cm*mag(forca('topo','fio'))/mag(forca('perto','fio'))",
          rotulo: 'F topo',
        },
        {
          id: 'Fb',
          tipo: 'seta',
          papel: 'forca',
          origem: ['L+b/2', '-a/2', 0],
          vetor: "forca('base','fio')",
          comprimento: "2*cm*mag(forca('base','fio'))/mag(forca('perto','fio'))",
          rotulo: 'F base',
        },
        {
          id: 'Ftot',
          tipo: 'seta',
          papel: 'neutro',
          origem: ['L+b/2', 0, 0],
          vetor: "forca('perto','fio')+forca('longe','fio')+forca('topo','fio')+forca('base','fio')",
          comprimento: "2*cm*mag(forca('perto','fio')+forca('longe','fio'))/mag(forca('perto','fio'))",
          rotulo: 'F total',
          ativo: 0,
        },
        { id: 'cL', tipo: 'cota', a: [0, '-a/2 - 1*cm', 0], b: ['L', '-a/2 - 1*cm', 0], rotulo: 'L' },
        { id: 'cb', tipo: 'cota', a: ['L', 'a/2 + 1*cm', 0], b: ['L+b', 'a/2 + 1*cm', 0], rotulo: 'b' },
        { id: 'ca', tipo: 'cota', a: ['L+b+1*cm', '-a/2', 0], b: ['L+b+1*cm', 'a/2', 0], rotulo: 'a' },
      ],
      visual: { setasB: true, linhasB: false, densidade: 15, fontes: ['fio'] },
      medidas: [
        { rotulo: 'Força no lado próximo', simbolo: 'F_{perto}', expr: "x(forca('perto','fio'))", unidade: 'N', teoria: '-mu0*I0*I*a/(2*pi*L)' },
        { rotulo: 'Força no lado distante', simbolo: 'F_{longe}', expr: "x(forca('longe','fio'))", unidade: 'N', teoria: 'mu0*I0*I*a/(2*pi*(L+b))' },
        { rotulo: 'Força no lado de cima', simbolo: 'F_{topo}', expr: "y(forca('topo','fio'))", unidade: 'N', teoria: 'mu0*I0*I/(2*pi)*ln((L+b)/L)' },
        { rotulo: 'Força no lado de baixo', simbolo: 'F_{base}', expr: "y(forca('base','fio'))", unidade: 'N', teoria: '-mu0*I0*I/(2*pi)*ln((L+b)/L)' },
        {
          rotulo: 'Força resultante (x)',
          simbolo: 'F_x',
          expr: "x(forca('perto','fio')+forca('longe','fio')+forca('topo','fio')+forca('base','fio'))",
          unidade: 'N',
          teoria: '-mu0*I0*I*a*b/(2*pi*L*(L+b))',
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Lado mais próximo',
          previsao: { pergunta: 'O fio e o lado próximo da malha têm correntes no mesmo sentido. Eles se…', opcoes: ['atraem', 'repelem'], correta: 0, oculta: ['Fp'] },
          texto: r`O campo do fio na malha aponta **para dentro da página** ($-\hat z$). No lado próximo, $d\vec\ell$ aponta para cima, como $I_0$:

$$\vec F = I\vec\ell\times\vec B = I a\,\hat y\times\left(-\frac{\mu_0I_0}{2\pi L}\hat z\right) = -\frac{\mu_0 I_0 I a}{2\pi L}\,\hat x$$

Correntes paralelas se **atraem**: a força aponta para o fio.`,
          destacar: ['perto', 'Fp'],
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Lado mais distante',
          texto: r`Aqui a corrente desce (antiparalela a $I_0$) e o campo é menor, pois $s = L + b$:

$$\vec F = +\frac{\mu_0 I_0 I a}{2\pi (L+b)}\,\hat x$$

Correntes antiparalelas se **repelem**, mas com força menor que a do lado próximo.`,
          destacar: ['longe', 'Fl'],
          medidas: [1],
        },
        {
          item: 'c',
          titulo: '(c) Lados perpendiculares',
          texto: r`Em cada lado horizontal o campo varia ao longo do fio, então integramos:

$$F = \int_L^{L+b} I\,\frac{\mu_0 I_0}{2\pi s}\,ds = \frac{\mu_0 I_0 I}{2\pi}\ln\frac{L+b}{L}$$

No lado de cima a corrente vai para $+\hat x$ e a força aponta para $+\hat y$; no de baixo, o oposto. **Mesmo módulo, sentidos opostos**: elas se cancelam.`,
          destacar: ['topo', 'base', 'Ft', 'Fb'],
          medidas: [2, 3],
        },
        {
          item: 'd',
          titulo: '(d) Resultante: a malha é atraída',
          texto: r`Só sobram as forças horizontais:

$$\vec F = -\frac{\mu_0 I_0 I a}{2\pi}\left(\frac1L - \frac1{L+b}\right)\hat x = -\frac{\mu_0 I_0 I\,a\,b}{2\pi L(L+b)}\,\hat x$$

A malha se move **em direção ao fio**. Inverta $I$ no controle: a resultante troca de sentido e a malha passa a ser repelida.`,
          mostrar: ['Ftot'],
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um fio retilíneo', lab: 'ampere' },
          { texto: r`Força sobre corrente: $d\vec F = I\,d\vec\ell\times\vec B$` },
          { texto: 'Regra da mão direita' },
        ],
        etapas: [
          {
            titulo: 'Campo do fio na região da malha',
            texto: r`À direita do fio, com $I_0$ para cima, $\vec B = -\dfrac{\mu_0 I_0}{2\pi s}\hat z$ (entrando na página). O campo da própria malha não exerce força resultante sobre ela e não entra na conta.`,
            passo: 0,
          },
          {
            titulo: '(a) Lado próximo, s = L',
            texto: r`$$\vec F_\text{perto} = I a\,\hat y\times\left(-\frac{\mu_0I_0}{2\pi L}\hat z\right) = -\frac{\mu_0 I_0 I a}{2\pi L}\,\hat x.$$ Correntes paralelas: atração, para o fio.`,
            passo: 0,
          },
          {
            titulo: '(b) Lado distante, s = L + b',
            texto: r`Corrente para baixo ($-\hat y$): $$\vec F_\text{longe} = +\frac{\mu_0 I_0 I a}{2\pi (L+b)}\,\hat x.$$ Correntes antiparalelas: repulsão, mas mais fraca, porque o campo é menor.`,
            passo: 1,
          },
          {
            titulo: '(c) Lados perpendiculares',
            texto: r`O campo varia ao longo deles, então integramos de $s = L$ a $s = L + b$:
$$F = \int_L^{L+b} I\,\frac{\mu_0 I_0}{2\pi s}\,ds = \frac{\mu_0 I_0 I}{2\pi}\ln\frac{L+b}{L}.$$
No lado de cima a corrente vai para $+\hat x$ e a força aponta para $+\hat y$; no de baixo, para $-\hat x$ e $-\hat y$. Mesmo módulo e sentidos opostos: a soma é nula.`,
            passo: 2,
          },
          {
            titulo: '(d) Força resultante',
            texto: r`$$\vec F = -\frac{\mu_0 I_0 I a}{2\pi}\left(\frac1L - \frac1{L+b}\right)\hat x = -\frac{\mu_0 I_0 I\,a\,b}{2\pi L(L+b)}\,\hat x.$$ A malha é atraída e se move em direção ao fio. Com $I$ invertida, seria repelida.`,
            passo: 3,
          },
        ],
        resultado: r`$\vec F = -\dfrac{\mu_0I_0Iab}{2\pi L(L+b)}\hat x$: a malha é atraída pelo fio.`,
        errosComuns: [
          r`Usar o mesmo $B$ nos dois lados paralelos. O campo cai com $1/s$: é essa diferença que gera a força resultante.`,
          r`Tratar os lados perpendiculares com $B$ constante. Ali o campo varia ao longo do fio e a força sai de uma integral (um logaritmo), embora as duas se cancelem.`,
          r`Errar o sentido de $\vec B$. Pela mão direita, à direita de uma corrente para cima o campo entra na página.`,
        ],
        oficial: { resposta: r`$\vec F = -\dfrac{\mu_0I_0Iab}{2\pi L(L+b)}\,\hat s$: a espira se move para perto do fio.`, observacao: r`O gabarito usa $\hat s$ (para longe do fio), $\hat z$ (ao longo do fio, para cima) e $\hat\varphi$ (entrando na folha). Na cena: $\hat s = \hat x$, $\hat z = \hat y$ e $\hat\varphi = -\hat z$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\dfrac{\mu_0I_0Ia}{2\pi L}$, apontando para o fio (atração)`, pontos: 0.5, criterio: r`Módulo, direção e sentido (atração).` },
        { item: 'b', texto: r`$\dfrac{\mu_0I_0Ia}{2\pi(L+b)}$, afastando do fio (repulsão)`, pontos: 0.5, criterio: r`Módulo, direção e sentido (repulsão).` },
        { item: 'c', texto: r`$\dfrac{\mu_0I_0I}{2\pi}\ln\dfrac{L+b}{L}$ em cada, opostas: cancelam`, pontos: 0.5, criterio: r`Justificar o cancelamento, de preferência com a integral.` },
        { item: 'd', texto: r`$\dfrac{\mu_0I_0Iab}{2\pi L(L+b)}$ em direção ao fio: a malha é atraída`, pontos: 1.0, criterio: r`Expressão da resultante e o sentido do movimento.` },
      ],
    },
  ],
}

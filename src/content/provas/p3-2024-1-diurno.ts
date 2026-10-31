import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: força total sobre o par e velocidade do centro de massa. */
const Fpar = "qe*cross(vel('a'), B(pos('a'))) - qe*cross(vel('b'), B(pos('b')))"
const Vcm = "(vel('a') + vel('b'))/2"

/* Objetiva 4: corrente envolvida, acrescentando um fio por vez. */
const Ienv = 'nf==1 ? -2*I0 : (nf==2 ? 0-I0 : (nf==3 ? -2*I0 : I0))'

/* Objetiva 5: disco em 16 anéis, cada um com a carga exata da sua coroa. */
const N = 16
const aneis: ObjetoInput[] = Array.from({ length: N }, (_, i) => {
  const f0 = i / N
  const f1 = (i + 1) / N
  return {
    id: `r${i}`,
    tipo: 'anelCarga' as const,
    Q: `sig*pi*R^2*${f1 ** 2 - f0 ** 2}`,
    centro: [0, 0, 0],
    raio: `${(f0 + f1) / 2}*R`,
    normal: 'z',
  }
})

/* Discursiva: semicírculo no plano yz, de (0, a, 0) a (0, −a, 0) passando por +z. */
const M = 48
const noArco = (i: number): [number, string, string] => {
  const f = (i * Math.PI) / M
  return [0, `a*${Math.cos(f)}`, `a*${Math.sin(f)}`]
}
const arco: ObjetoInput[] = Array.from({ length: M }, (_, i) => ({
  id: `s${i}`,
  tipo: 'fio' as const,
  I: 'I0',
  a: noArco(i),
  b: noArco(i + 1),
}))

/**
 * P3 de Física III, 2024/1, diurno, versão A (03/07/2024). Conferida com o
 * gabarito oficial: objetivas 1f, 2g, 3d, 4b, 5a, 6d, e a discursiva. O PDF é uma
 * foto da prova resolvida: os recortes pegam só enunciado e figura, e a máscara
 * cobre uma anotação à mão na figura da discursiva.
 */
export const p3_2024_1_diurno: ProvaInput = {
  id: 'p3-2024-1-diurno',
  titulo: 'P3 · 2024/1 · Diurno',
  subtitulo: 'Física III · Terceira Prova · Versão A · 03/07/2024',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três afirmações sobre magnetismo',
      resumo: 'Rapidez, centro de massa de um par e fluxo de um ímã.',
      enunciado: r`Considere as seguintes três afirmativas: (I) a força magnética sobre uma partícula (pontual) carregada, por si só, nunca pode alterar o módulo da velocidade de tal partícula; (II) a força magnética resultante sobre um conjunto de duas partículas (pontuais), devido a um campo magnético externo dado, é sempre perpendicular à velocidade do centro de massa de tal conjunto, e (III) dado um ímã, o fluxo do campo magnético por ele criado, através de uma superfície fechada (abstrata) qualquer, pode ser diferente de zero. Qual(is) de tais afirmativas é(são) verdadeira(s)?`,
      figura: { pagina: 1, recorte: [0.54, 0.2, 0.89, 0.4] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, 0, 18], alvo: [0, 0, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Afirmativa',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) uma partícula' },
            { valor: 2, rotulo: '(II) par +q e −q' },
            { valor: 3, rotulo: '(III) ímã' },
          ],
        },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v_0', valor: 1e5, unidade: 'm/s', min: 5e4, max: 2e5, passo: 1e4 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', ativo: 'caso!=3', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'p', tipo: 'particula', ativo: 'caso==1', rotulo: 'q', q: 'qe', m: 'mp', pos: [0, 0, 0], v: ['v0', 0, 0] },
        { id: 'sv', tipo: 'seta', ativo: 'caso==1', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.8*cm', rotulo: 'v' },
        { id: 'sf', tipo: 'seta', ativo: 'caso==1', papel: 'forca', origem: "pos('p')", vetor: "cross(vel('p'), B(pos('p')))", comprimento: '1.4*cm', rotulo: 'F' },
        { id: 'a', tipo: 'particula', ativo: 'caso==2', rotulo: '+q', q: 'qe', m: 'mp', pos: [-0.03, 0, 0], v: ['v0', 0, 0] },
        { id: 'b', tipo: 'particula', ativo: 'caso==2', rotulo: '−q', q: '0-qe', m: 'mp', pos: [0.03, 0, 0], v: [0, 'v0', 0] },
        { id: 'sV', tipo: 'seta', ativo: 'caso==2', papel: 'v', origem: "(pos('a') + pos('b'))/2", vetor: Vcm, comprimento: '2.2*cm', rotulo: 'V do CM' },
        { id: 'sF', tipo: 'seta', ativo: 'caso==2', papel: 'forca', origem: "(pos('a') + pos('b'))/2", vetor: Fpar, comprimento: '2.2*cm', rotulo: 'F total' },
        { id: 'ima', tipo: 'ima', ativo: 'caso==3', centro: [0, 0, 0], eixo: 'x', comprimento: 0.06, raio: 0.012, intensidade: 2000, rotulo: 'ímã' },
        { id: 'S', tipo: 'gaussiana', ativo: 'caso==3', forma: 'esfera', centro: [0.03, 0, 0], raio: 0.025, campo: 'B', rotulo: 'S' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Rapidez da partícula', simbolo: '|v|', ativo: 'caso==1', expr: "mag(vel('p'))", unidade: 'm/s', teoria: 'v0' },
        { rotulo: 'Potência da força magnética', simbolo: r`\vec F\cdot\vec v`, ativo: 'caso==1', expr: "qe*dot(vel('p'), cross(vel('p'), B(pos('p'))))", unidade: 'W', teoria: 0 },
        { rotulo: 'Cosseno entre F total e V do CM', simbolo: r`\cos\alpha`, ativo: 'caso==2', expr: `dot(${Fpar}, ${Vcm})/(mag(${Fpar})*mag(${Vcm}))` },
        { rotulo: 'Rapidez do centro de massa', simbolo: r`|\vec V_\text{CM}|`, ativo: 'caso==2', expr: `mag(${Vcm})`, unidade: 'm/s' },
        { rotulo: 'Fluxo por S, relativo a B·πr²', simbolo: r`\Phi/B\pi r^2`, ativo: 'caso==3', expr: "floor(1e3*fluxo('S')/(mag(B(0.03, 0, 0))*pi*0.025^2) + 0.5)/1e3", teoria: 0 },
      ],
      passos: [
        {
          titulo: '(I) Força perpendicular não muda a rapidez',
          texto: r`$\vec F = q\vec v\times\vec B$ é sempre perpendicular a $\vec v$: a potência é nula, e a energia cinética não muda. A partícula gira com rapidez constante. **Verdadeira.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Para duas partículas, nem sempre',
          previsao: { pergunta: 'A força total sobre um par é sempre perpendicular à velocidade do CM?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`A força total é $q_1\vec v_1\times\vec B + q_2\vec v_2\times\vec B$. Se as razões $q/m$ forem iguais, ela é mesmo perpendicular a $\vec V_\text{CM}$. Mas com cargas opostas, não precisa ser.

Aqui $+q$ anda em $\hat x$, e $-q$ em $\hat y$: no início, a força é **antiparalela** a $\vec V_\text{CM}$, que perde rapidez. **Falsa.**`,
          parametros: { caso: 2 },
          medidas: [2, 3],
        },
        {
          titulo: '(III) O fluxo magnético é sempre nulo',
          texto: r`Mesmo em volta de um polo só, o que sai por um lado entra pelo outro:

$$\oint\vec B\cdot d\vec A = 0.$$

As linhas de $\vec B$ são fechadas: não existe polo isolado. **Falsa.**`,
          parametros: { caso: 3 },
          medidas: [4],
        },
        {
          titulo: 'Resposta',
          texto: r`Apenas a (I): alternativa **(f)**.`,
          parametros: { caso: 1 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`$\vec F\perp\vec v$: a potência é nula. Verdadeira.`, passo: 0 },
          { titulo: '(II)', texto: r`Com $q_1/m_1 \neq q_2/m_2$, a força total não precisa ser perpendicular a $\vec V_\text{CM}$. Falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`$\oint\vec B\cdot d\vec A = 0$ para qualquer superfície. Falsa.`, passo: 2 },
        ],
        resultado: r`Apenas a (I): alternativa **(f)**.`,
        errosComuns: [
          r`Estender (I) ao centro de massa: cada partícula mantém a rapidez, mas a soma vetorial das velocidades pode mudar.`,
          r`Pôr a superfície em volta de um polo e esperar fluxo: não há monopolo.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Nenhuma delas.', porque: r`A (I) é verdadeira.` },
        { letra: 'b', texto: 'Apenas a III.', porque: r`O fluxo de $\vec B$ por superfície fechada é sempre nulo.` },
        { letra: 'c', texto: 'Apenas a II e a III.', porque: r`As duas são falsas.` },
        { letra: 'd', texto: 'Apenas a I e a III.', porque: r`A (III) é falsa.` },
        { letra: 'e', texto: 'Apenas a II.', porque: r`Um par de cargas opostas é contraexemplo.` },
        { letra: 'f', texto: 'Apenas a I.', correta: true, porque: r`Correta.` },
        { letra: 'g', texto: 'Apenas a I e a II.', porque: r`A (II) é falsa.` },
        { letra: 'h', texto: 'Todas.', porque: r`Só a (I) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Lâmina condutora num capacitor isolado',
      resumo: 'A energia cai, e a posição da lâmina não importa.',
      enunciado: r`Um capacitor plano ideal possui as duas placas de área $A$, separadas numa situação inicial I por uma distância $d$, entre as quais existe somente o vácuo. A seguir, numa situação II, uma lâmina condutora de espessura $b < d$ e com a mesma área $A$, é inserida paralelamente às placas originais, a uma distância $y$ de uma delas. Sabendo que o capacitor é mantido isolado com uma carga elétrica de módulo $q_0$ (em cada placa), podemos concluir que a variação da energia elétrica acumulada no capacitor (sem e com a lâmina) $\Delta U_e = U_{II} - U_I$ será:`,
      figura: [
        { pagina: 2, recorte: [0.125, 0.105, 0.495, 0.275] },
        { pagina: 2, recorte: [0.115, 0.53, 0.5, 0.8] },
      ],
      cena: { escala: 0.002, extensao: 26, unidade: 'cm', camera: { pos: [30, 14, 74], alvo: [0, 7, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Situação',
          valor: 2,
          opcoes: [
            { valor: 1, rotulo: 'I: só vácuo' },
            { valor: 2, rotulo: 'II: com a lâmina' },
          ],
        },
        { id: 'q0', rotulo: 'Carga', simbolo: 'q_0', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'b', rotulo: 'Espessura da lâmina', simbolo: 'b', valor: 0.01, unidade: 'm', min: 0.004, max: 0.018, passo: 0.002 },
        { id: 'yy', rotulo: 'Altura da lâmina', simbolo: 'y', valor: 0.01, unidade: 'm', min: 0.004, max: 0.008, passo: 0.001 },
        { id: 'lado', rotulo: 'Lado da placa', simbolo: r`\sqrt{A}`, valor: 0.08, unidade: 'm', min: 0.05, max: 0.1, passo: 0.005 },
      ],
      objetos: [
        {
          id: 'cap',
          tipo: 'capacitor',
          rotulo: 'Capacitor',
          centro: [0, 'd/2', 0],
          eixo: [0, -1, 0],
          lado: 'lado',
          d: 'd',
          Q: 'q0',
          dieletrico: { condutora: true, inicio: 'd - yy - b', fim: 'caso==1 ? d - yy - b : d - yy' },
        },
      ],
      visual: { setasE: true, densidade: 17, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Capacitância', simbolo: 'C', expr: "C('cap')", unidade: 'F', teoria: 'eps0*lado^2/(caso==1 ? d : d - b)' },
        { rotulo: 'Campo no vácuo', simbolo: 'E', expr: 'mag(E(0, yy/2, 0))', unidade: 'V/m', teoria: 'q0/(eps0*lado^2)' },
        { rotulo: 'Campo dentro da lâmina', simbolo: 'E_l', ativo: 'caso==2', expr: 'mag(E(0, yy + b/2, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Energia', simbolo: 'U', expr: "U('cap')", unidade: 'J', teoria: 'q0^2*(caso==1 ? d : d - b)/(2*eps0*lado^2)' },
        { rotulo: 'Variação de energia', simbolo: r`\Delta U_e`, expr: "U('cap') - q0^2*d/(2*eps0*lado^2)", unidade: 'J', teoria: 'caso==1 ? 0 : -q0^2*b/(2*eps0*lado^2)' },
      ],
      passos: [
        {
          titulo: 'Campo não muda no vácuo',
          texto: r`Isolado, o capacitor mantém $q_0$. Fora da lâmina, o campo continua $E = q_0/\varepsilon_0A$: as cargas induzidas nas faces dela têm o mesmo módulo da carga das placas, e o campo que sai de uma entra na outra.`,
          parametros: { caso: 2 },
          medidas: [1, 2],
        },
        {
          titulo: 'Energia está no campo',
          previsao: { pergunta: 'Mudar a altura y da lâmina altera a energia?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Dentro do metal $E = 0$: o volume com campo perdeu a parte da lâmina.

$$U_{II} = \frac{\varepsilon_0E^2}{2}A(d - b) = \frac{q_0^2(d-b)}{2\varepsilon_0A}.$$

Só a espessura importa, não a posição. Mude $y$ no controle.`,
          parametros: { caso: 2 },
          medidas: [0, 3],
        },
        {
          titulo: 'A variação',
          texto: r`$$\Delta U_e = \frac{q_0^2(d-b)}{2\varepsilon_0A} - \frac{q_0^2d}{2\varepsilon_0A} = -\frac{q_0^2b}{2\varepsilon_0A}.$$

Negativa: o capacitor puxa a lâmina para dentro, e o campo faz trabalho. Alternativa **(g)**.`,
          parametros: { caso: 2 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitores e condutores', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Energia final', texto: r`A lâmina equivale a reduzir a separação para $d - b$: $U_{II} = q_0^2(d-b)/2\varepsilon_0A$.`, passo: 1 },
          { titulo: 'Variação', texto: r`$\Delta U_e = -q_0^2b/2\varepsilon_0A$.`, passo: 2 },
        ],
        resultado: r`$\Delta U_e = -\dfrac{q_0^2b}{2\varepsilon_0A}$: alternativa **(g)**.`,
        errosComuns: [
          r`Fazer a resposta depender de $y$: dois capacitores em série somam as separações.`,
          r`Usar $CV^2/2$ com $V$ fixo: o capacitor está isolado, quem é fixa é a carga.`,
        ],
        oficial: { resposta: '(g)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\Delta U_e = -\dfrac{q_0^2(d-b)}{2\epsilon_0A}$`, porque: r`É $-U_{II}$, não a diferença.` },
        { letra: 'b', texto: r`$\Delta U_e = \dfrac{q_0^2(d-b-y)}{2\epsilon_0A}$`, porque: r`Depende de $y$, e a energia não depende.` },
        { letra: 'c', texto: r`$\Delta U_e = -\dfrac{q_0^2d^2}{2\epsilon_0A(b+y)}$`, porque: r`Depende de $y$.` },
        { letra: 'd', texto: r`$\Delta U_e = \dfrac{q_0^2dy}{2\epsilon_0A(d-y)}$`, porque: r`Depende de $y$, e a energia diminui.` },
        { letra: 'e', texto: r`$\Delta U_e = -\dfrac{q_0^2y}{2\epsilon_0A}$`, porque: r`Troca $b$ por $y$.` },
        { letra: 'f', texto: r`$\Delta U_e = \dfrac{q_0^2(b+y)}{2\epsilon_0A}$`, porque: r`Positiva e dependente de $y$.` },
        { letra: 'g', texto: r`$\Delta U_e = -\dfrac{q_0^2b}{2\epsilon_0A}$`, correta: true, porque: r`Correta.` },
        { letra: 'h', texto: r`$\Delta U_e = \dfrac{q_0^2d^2}{2\epsilon_0A(d-y)}$`, porque: r`Depende de $y$.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cilindro com J = (k/s) e^(−s/R)',
      resumo: 'A corrente envolvida vem de uma integral simples.',
      enunciado: r`Considere um cilindro condutor maciço, infinito, de raio $R$. Ele possui uma densidade de corrente estacionária, mas não-uniforme, dada por $\vec J = (k/s)\,e^{-s/R}\,\hat z$, onde $k$ é uma constante positiva, $s$ é a distância até o eixo do cilindro e $\hat z$ é um vetor unitário ao longo deste eixo. Nessa situação, o campo magnético produzido pelo cilindro em um ponto localizado a uma distância $s < R$ do eixo tem módulo igual a`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.095, 0.875, 0.22] },
        { pagina: 2, recorte: [0.665, 0.285, 0.875, 0.395] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'kk', rotulo: 'Constante', simbolo: 'k', valor: 1e4, unidade: 'A/m', min: 2e3, max: 3e4, passo: 1e3 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.002 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'R', raioInterno: '1e-6*R', J: 'kk/r*exp(0-r/R)', rotulo: 'J(s)' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: '2*pi*kk*R*(1 - exp(0-min(rs, R)/R))' },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: 'mu0*2*pi*kk*R*(1 - exp(0-min(rs, R)/R))' },
        { rotulo: 'Campo em s', simbolo: 'B', expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: 'mu0*kk*R/rs*(1 - exp(0-min(rs, R)/R))' },
      ],
      graficos: [
        {
          titulo: 'B(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.02*R', ate: '1.6*R', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: 'mu0*kk*R/ss*(1 - exp(0-min(ss, R)/R))', unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Ampère num círculo coaxial',
          texto: r`Simetria cilíndrica: $\vec B = B(s)\hat\varphi$, e $\oint\vec B\cdot d\vec\ell = 2\pi sB$.

Falta a corrente envolvida. $J$ varia com $s$, então ela sai de uma integral.`,
          parametros: { rs: 0.03 },
          medidas: [1],
        },
        {
          titulo: 'A integral',
          previsao: { pergunta: 'No elemento de área 2πs′ds′, o que acontece com o 1/s′ de J?', opcoes: ['cancela com o s′', 'vira 1/s′²', 'vira ln s′'], correta: 0 },
          texto: r`$$I(s) = \int_0^s\frac{k}{s'}e^{-s'/R}\,2\pi s'\,ds' = 2\pi k\int_0^se^{-s'/R}\,ds' = 2\pi kR\left(1 - e^{-s/R}\right).$$`,
          parametros: { rs: 0.03 },
          medidas: [0],
        },
        {
          titulo: 'O campo',
          texto: r`$$B = \frac{\mu_0I(s)}{2\pi s} = \frac{\mu_0kR}{s}\left(1 - e^{-s/R}\right).$$

Alternativa **(d)**. O campo não vai a zero no eixo: $J$ diverge ali, e $B \to \mu_0k$.`,
          parametros: { rs: 0.03 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' }],
        etapas: [
          { titulo: 'Corrente', texto: r`$I(s) = 2\pi kR(1 - e^{-s/R})$.`, passo: 1 },
          { titulo: 'Campo', texto: r`$B = \mu_0I/2\pi s$.`, passo: 2 },
        ],
        resultado: r`$B = \dfrac{\mu_0kR}{s}(1 - e^{-s/R})$: alternativa **(d)**.`,
        errosComuns: [
          r`Usar $J\cdot\pi s^2$: $J$ varia com $s$.`,
          r`Parar a integral em $R$ em vez de $s$: isso daria o $e^{-1}$ das alternativas (b) e (e).`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\mu_0k(1 - e^{-s/R})$`, porque: r`Falta $R/s$: ao dividir por $2\pi s$, ele aparece.` },
        { letra: 'b', texto: r`$\mu_0k(1 - e^{-1})$`, porque: r`Integra até $R$, e depois esquece o $R/s$.` },
        { letra: 'c', texto: r`$\mu_0ke^{-s/R}$`, porque: r`Não vem da integral de $J$.` },
        { letra: 'd', texto: r`$\dfrac{\mu_0kR}{s}(1 - e^{-s/R})$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0kR}{s}(1 - e^{-1})$`, porque: r`Valeria fora do cilindro, com $s > R$.` },
        { letra: 'f', texto: r`$\dfrac{\mu_0kR}{s}e^{-s/R}$`, porque: r`Esquece o limite inferior da integral.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Amperiana enlaçada por quatro fios',
      resumo: 'Só conta quem atravessa a superfície, com o sinal certo.',
      enunciado: r`A figura abaixo mostra, em tracejado, uma curva fechada e orientada $\mathcal C$ (amperiana) e, em linha cheia, quatro fios condutores finos transportando correntes estacionárias com os módulos e sentidos indicados. Nessa situação, podemos afirmar que a circulação do campo magnético resultante ao longo de $\mathcal C$, definida por $\Gamma_{\vec B}[\mathcal C] = \oint_{\mathcal C}\vec B\cdot d\vec\ell$, vale`,
      figura: [
        { pagina: 2, recorte: [0.51, 0.53, 0.89, 0.645] },
        { pagina: 2, recorte: [0.675, 0.65, 0.85, 0.88] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [6, 11, 15], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'Rc', rotulo: 'Raio da amperiana', simbolo: 'R_c', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        {
          id: 'nf',
          rotulo: 'Fios incluídos',
          valor: 4,
          opcoes: [
            { valor: 1, rotulo: 'só 2I' },
            { valor: 2, rotulo: '2I e I' },
            { valor: 3, rotulo: 'mais o laço I' },
            { valor: 4, rotulo: 'todos' },
          ],
        },
      ],
      objetos: [
        { id: 'f2', tipo: 'fioInfinito', ativo: 'nf >= 1', I: '-2*I0', ponto: [-0.012, 0, 0.012], direcao: 'y', rotulo: '2I' },
        { id: 'f1', tipo: 'fioInfinito', ativo: 'nf >= 2', I: 'I0', ponto: [0.012, 0, 0.012], direcao: 'y', rotulo: 'I' },
        { id: 'l1', tipo: 'espira', ativo: 'nf >= 3', I: '0-I0', centro: ['0-Rc', 0, 0], raio: 0.018, normal: 'z', rotulo: 'laço I' },
        { id: 'l3', tipo: 'espira', ativo: 'nf >= 4', I: '-3*I0', centro: ['Rc', 0, 0], raio: 0.018, normal: 'z', rotulo: 'laço 3I' },
        { id: 'C', tipo: 'amperiana', centro: [0, 0, 0], normal: 'y', raio: 'Rc', rotulo: 'C' },
        { id: 'n', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: [0, 1, 0], comprimento: '2.5*cm', rotulo: 'n̂' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('C')", unidade: 'A', teoria: Ienv },
        { rotulo: 'Circulação de B', simbolo: r`\Gamma`, expr: "circ('C')", unidade: 'T·m', teoria: `mu0*(${Ienv})` },
        { rotulo: 'Em unidades de μ₀I', simbolo: r`\Gamma/\mu_0I`, expr: "circ('C')/(mu0*I0)", teoria: `(${Ienv})/I0` },
      ],
      passos: [
        {
          titulo: 'Orientação',
          texto: r`Pela mão direita, a curva define o versor $\hat n$ da superfície. Corrente no sentido de $\hat n$ conta como **positiva**; no sentido oposto, como **negativa**.

Só importa quem atravessa a superfície limitada por $\mathcal C$, e quantas vezes.`,
          parametros: { nf: 1 },
        },
        {
          titulo: 'Os dois fios retos',
          texto: r`O fio de $2I$ desce: $-2I$. O fio de $I$ sobe: $+I$. Somando: $-I$.`,
          parametros: { nf: 2 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Os laços',
          previsao: { pergunta: 'Um laço fechado que passa pela superfície uma só vez conta?', opcoes: ['Sim, conta sua corrente', 'Não, por ser fechado'], correta: 0 },
          texto: r`Cada laço atravessa a superfície **uma vez** e volta por fora de $\mathcal C$: ele enlaça a curva. O laço de $I$ desce pela superfície: $-I$. O de $3I$ sobe: $+3I$.

Se um fio entrasse e saísse pela superfície, não contaria.`,
          parametros: { nf: 3 },
          medidas: [0, 2],
        },
        {
          titulo: 'Total',
          texto: r`$$I_\text{env} = -2I + I - I + 3I = I \quad\Rightarrow\quad \Gamma = \mu_0I.$$

Alternativa **(b)**. A integral da cena é feita ponto a ponto, e confirma a contagem.`,
          parametros: { nf: 4 },
          medidas: [0, 1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère', lab: 'ampere' }],
        etapas: [
          { titulo: 'Sinais', texto: r`$\hat n$ para cima: $2I$ desce, $I$ sobe, o laço de $I$ desce, o de $3I$ sobe.`, passo: 2 },
          { titulo: 'Soma', texto: r`$-2I + I - I + 3I = I$.`, passo: 3 },
        ],
        resultado: r`$\Gamma = \mu_0I$: alternativa **(b)**.`,
        errosComuns: [
          r`Somar os módulos, chegando a $7\mu_0I$.`,
          r`Ignorar os laços por serem fechados: o que conta é se eles enlaçam a curva.`,
          r`Inverter a orientação: isso troca todos os sinais.`,
        ],
        oficial: { resposta: '(b)', observacao: r`Na cena, $\mathcal C$ é um círculo no plano horizontal, e os laços são circulares; só a contagem de cruzamentos importa.` },
      },
      alternativas: [
        { letra: 'a', texto: '$0$', porque: r`A soma com sinais dá $+I$.` },
        { letra: 'b', texto: r`$\mu_0I$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$2\mu_0I$`, porque: r`Erra o sinal de um dos laços.` },
        { letra: 'd', texto: r`$3\mu_0I$`, porque: r`Conta só o laço de $3I$.` },
        { letra: 'e', texto: r`$-\mu_0I$`, porque: r`Conta só os fios retos, ou inverte a orientação.` },
        { letra: 'f', texto: r`$-2\mu_0I$`, porque: r`Conta só o fio de $2I$.` },
        { letra: 'g', texto: r`$-3\mu_0I$`, porque: r`Erra sinais.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Gauss serve para um disco?',
      resumo: 'A lei vale, mas a simetria não basta para isolar E.',
      enunciado: r`Um disco fino isolante de raio $R$ está posicionado no plano $xy$ com seu centro na origem do sistema de coordenadas. Este disco possui uma densidade superficial de carga constante $\sigma$. Para determinar o campo elétrico na coordenada $z$ (com $z \neq 0$ e $|z| > R$) ao longo do eixo $z$, pretende-se utilizar a lei de Gauss. Considera-se uma superfície gaussiana cilíndrica $\mathcal S$ de bases circulares com raio $R$ e comprimento $2|z|$. A superfície $\mathcal S$ envolve o disco, com seu eixo alinhado com o eixo $z$ e suas bases a uma distância $|z|$ e $-|z|$ da origem, conforme ilustrado na figura. Com base no exposto, qual das seguintes afirmações é correta?`,
      figura: [
        { pagina: 3, recorte: [0.11, 0.09, 0.525, 0.3] },
        { pagina: 3, recorte: [0.21, 0.68, 0.45, 0.91] },
      ],
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', camera: { pos: [17, 9, 14], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 1e-7, unidade: 'C/m²', min: 2e-8, max: 3e-7, passo: 1e-8 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
        { id: 'zc', rotulo: 'Altura da tampa', simbolo: '|z|', valor: 0.06, unidade: 'm', min: 0.045, max: 0.09, passo: 0.001 },
      ],
      objetos: [
        ...aneis,
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'R', altura: '2*zc', rotulo: 'S' },
        { id: 'Pc', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zc'], rotulo: 'no eixo' },
        { id: 'Pb', tipo: 'sonda', campo: 'E', pos: ['R', 0, 'zc'], rotulo: 'na borda' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Campo no eixo, na tampa', simbolo: 'E_z(0)', expr: 'z(E(0, 0, zc))', unidade: 'V/m', teoria: 'sig/(2*eps0)*(1 - zc/sqrt(zc^2 + R^2))' },
        { rotulo: 'Campo axial na borda da tampa', simbolo: 'E_z(R)', expr: 'z(E(R, 0, zc))', unidade: 'V/m' },
        { rotulo: 'Razão borda/eixo', simbolo: 'E_z(R)/E_z(0)', expr: 'z(E(R, 0, zc))/z(E(0, 0, zc))' },
        { rotulo: 'Campo radial na lateral, no meio', simbolo: 'E_s(z/2)', expr: 'x(E(R, 0, zc/2))', unidade: 'V/m' },
        { rotulo: 'Campo radial na lateral, perto da tampa', simbolo: 'E_s(0{,}9z)', expr: 'x(E(R, 0, 0.9*zc))', unidade: 'V/m' },
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: 'sig*pi*R^2' },
      ],
      passos: [
        {
          titulo: 'Gauss vale sempre',
          texto: r`O fluxo por $\mathcal S$ é $Q_\text{int}/\varepsilon_0 = \sigma\pi R^2/\varepsilon_0$. Isso nunca falha. A pergunta é outra: dá para **tirar $E$ da integral**?`,
          medidas: [5],
        },
        {
          titulo: 'Nas tampas, E muda de ponto a ponto',
          previsao: { pergunta: 'Sobre a tampa, o campo axial é constante?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Compare o campo no eixo com o da borda da tampa: valores diferentes. Não se pode escrever $E\cdot\pi R^2$ para o fluxo na tampa.`,
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Na lateral, há fluxo',
          texto: r`Num plano infinito, o campo seria perpendicular ao plano e a lateral não teria fluxo. Aqui, as linhas se abrem: $E_s \neq 0$, e ele varia com a altura.

Uma parcela do fluxo sai pela lateral, com valor desconhecido. Não há como isolar $E$.`,
          medidas: [3, 4],
        },
        {
          titulo: 'Resposta',
          texto: r`Gauss não é útil aqui: alternativa **(a)**. No eixo, o campo sai da integração direta: $E_z = \frac{\sigma}{2\varepsilon_0}\left(1 - \frac{z}{\sqrt{z^2+R^2}}\right)$.`,
          medidas: [0],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss e simetria', lab: 'gauss' },
          { texto: 'Campo de distribuição contínua', lab: 'coulomb' },
        ],
        etapas: [
          { titulo: 'O que é preciso', texto: r`Para isolar $E$, ele tem de ser constante em cada parte da superfície, com direção conhecida.`, passo: 0 },
          { titulo: 'O que falha', texto: r`Nem nas tampas nem na lateral isso acontece: $E$ varia, e há fluxo lateral.`, passo: 2 },
        ],
        resultado: r`Alternativa **(a)**.`,
        errosComuns: [
          r`Confundir "a superfície tem a forma do disco" com "o campo tem simetria suficiente".`,
          r`Tratar o disco como plano infinito: só vale muito perto dele.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'A lei de Gauss não é útil para calcular o campo elétrico, pois o módulo do campo elétrico não é constante sobre a superfície lateral ou sobre as tampas do cilindro gaussiano, separadamente.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'A lei de Gauss é útil para calcular o campo elétrico, pois a simetria do disco, sendo idêntica à da superfície gaussiana, garante que toda a carga do disco esteja contida dentro da superfície gaussiana.', porque: r`Conhecer a carga dá o fluxo, não o campo ponto a ponto.` },
        { letra: 'c', texto: 'A lei de Gauss é útil para calcular o campo elétrico, pois o fluxo do campo elétrico através da superfície lateral do cilindro é zero.', porque: r`Não é zero: as linhas se abrem.` },
        { letra: 'd', texto: 'O campo elétrico do disco é perpendicular em todos os pontos da superfície $\\mathcal S$, tornando-a adequada para calcular o campo ao longo do eixo $z$.', porque: r`Ele só é paralelo ao eixo sobre o próprio eixo.` },
        { letra: 'e', texto: 'A lei de Gauss é útil para calcular o campo elétrico, pois a simetria cilíndrica do problema permite considerar apenas a componente do campo ao longo do eixo $z$.', porque: r`Fora do eixo há componente radial.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Corrente máxima com B ∝ cos²(ωt)',
      resumo: 'A fem oscila com o dobro da frequência.',
      enunciado: r`Uma espira condutora plana de área interna $A$ e resistência elétrica $R$ é posicionada sobre o plano $xy$ de um sistema de coordenadas cartesianas. Ela está imersa em uma região de campo magnético uniforme, mas não-estacionário, dado por $\vec B(t) = B_0\cos^2(\omega t)\,\hat z$, onde $B_0$ e $\omega$ são constantes positivas. Nessa situação, qual é a intensidade máxima da corrente induzida na espira?`,
      figura: [
        { pagina: 3, recorte: [0.54, 0.095, 0.925, 0.24] },
        { pagina: 3, recorte: [0.68, 0.265, 0.92, 0.51] },
      ],
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [11, 9, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo máximo', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'w', rotulo: 'Frequência angular', simbolo: r`\omega`, valor: 2, unidade: 'rad/s', min: 0.5, max: 6, passo: 0.1 },
        { id: 'A0', rotulo: 'Área', simbolo: 'A', valor: 0.01, unidade: 'm²', min: 0.002, max: 0.015, passo: 0.001 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.1, unidade: 'Ω', min: 0.02, max: 1, passo: 0.02 },
        { id: 'fase', rotulo: 'Ângulo inicial ωt₀', simbolo: r`\omega t_0`, valor: 0, unidade: '°', min: 0, max: 180, passo: 5 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0*cos(w*t + rad(fase))^2'], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: 'sqrt(A0/pi)', R: 'Rr', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: 'B0*A0*cos(w*t + rad(fase))^2' },
        { rotulo: 'fem', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: 'B0*A0*w*sin(2*(w*t + rad(fase)))' },
        { rotulo: 'Corrente', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: 'B0*A0*w/Rr*sin(2*(w*t + rad(fase)))' },
        { rotulo: 'Corrente máxima', simbolo: r`I_\text{max}`, expr: 'w*B0*A0/Rr', unidade: 'A' },
      ],
      graficos: [
        {
          titulo: 'Fluxo e corrente no tempo',
          tipo: 'tempo',
          janela: 4,
          series: [
            { rotulo: 'Φ', expr: "fluxoB('S')", unidade: 'Wb' },
            { rotulo: 'I', expr: "Iind('S')", unidade: 'A' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Fluxo',
          texto: r`O campo é uniforme: $\Phi_B = B_0A\cos^2(\omega t)$. Ele nunca fica negativo, mas sobe e desce.`,
          parametros: { fase: 0 },
          medidas: [0],
        },
        {
          titulo: 'fem',
          texto: r`$$\mathcal E = -\frac{d\Phi_B}{dt} = 2\omega B_0A\cos(\omega t)\sin(\omega t) = \omega B_0A\sin(2\omega t).$$

A fem oscila com o **dobro** da frequência do campo.`,
          parametros: { fase: 0 },
          medidas: [1],
        },
        {
          titulo: 'Corrente máxima',
          previsao: { pergunta: 'Quando a corrente é máxima?', opcoes: ['quando B é máximo', 'quando B é zero', 'quando B = B₀/2'], correta: 2 },
          texto: r`O máximo de $\sin(2\omega t)$ é 1, em $\omega t = 45°$. Ali, $\cos^2 = \frac12$: o campo está em $B_0/2$, onde varia mais rápido.

$$I_\text{max} = \frac{\omega B_0A}{R}.$$

Alternativa **(d)**.`,
          parametros: { fase: 45 },
          medidas: [2, 3],
        },
        {
          titulo: 'Quando B é máximo',
          texto: r`Em $\omega t = 0$ e em $\omega t = 90°$, o campo está no máximo ou zero, e a derivada se anula: corrente nula.`,
          parametros: { fase: 90 },
          medidas: [0, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }],
        etapas: [
          { titulo: 'fem', texto: r`$\mathcal E = \omega B_0A\sin(2\omega t)$.`, passo: 1 },
          { titulo: 'Corrente', texto: r`$I = \mathcal E/R$, com máximo $\omega B_0A/R$.`, passo: 2 },
        ],
        resultado: r`$I_\text{max} = \dfrac{\omega B_0A}{R}$: alternativa **(d)**.`,
        errosComuns: [
          r`Esquecer o 2 da regra da cadeia: ele se junta ao $\sin\cos$ e some, mas só depois de usar $2\sin\cos = \sin2\theta$.`,
          r`Parar em $2\omega B_0A/R$: o máximo de $\sin\cos$ é $\frac12$, não 1.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\omega B_0A}{4R}$`, porque: r`Fator errado: o máximo de $2\sin\cos$ é 1.` },
        { letra: 'b', texto: r`$\dfrac{\omega B_0A}{\sqrt2R}$`, porque: r`É o valor em outro instante, não o máximo.` },
        { letra: 'c', texto: r`$\dfrac{\omega B_0A}{2R}$`, porque: r`Perde o 2 da regra da cadeia.` },
        { letra: 'd', texto: r`$\dfrac{\omega B_0A}{R}$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$\dfrac{2\omega B_0A}{R}$`, porque: r`Toma o máximo de $\sin\cos$ como 1.` },
        { letra: 'f', texto: r`$\dfrac{\sqrt2\omega B_0A}{R}$`, porque: r`Não sai de $\sin(2\omega t)$.` },
        { letra: 'g', texto: r`$\dfrac{4\omega B_0A}{R}$`, porque: r`Fator errado.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Fio com semicírculo e dois trechos semi-infinitos',
      resumo: 'Biot-Savart em três trechos, com direções diferentes.',
      enunciado: r`Um fio condutor fino é formado pela junção de três trechos, como mostra a figura abaixo. O primeiro deles é retilíneo, semi-infinito e é posicionado sobre o eixo $y$ de um sistema de coordenadas cartesianas retangulares. O segundo é semicircular, de raio $a$, e é posicionado sobre o plano $yz$ com centro sobre a origem. O terceiro trecho é retilíneo, semi-infinito e é posicionado paralelamente ao eixo $x$. O fio transporta uma corrente estacionária de módulo $I$ no sentido indicado. Utilize a lei de Biot-Savart, justificando cuidadosamente cada passagem, para responder às perguntas abaixo.

(a) Determine o vetor campo magnético produzido pelo primeiro trecho na origem do sistema de coordenadas. (0,8 ponto) (b) Determine o vetor campo magnético produzido pelo segundo trecho no mesmo ponto. (1,2 ponto) (c) Determine o vetor campo magnético produzido pelo terceiro trecho no mesmo ponto. (1,5 ponto) (d) Determine o módulo do campo magnético resultante produzido pelo fio no mesmo ponto. (0,5 ponto)`,
      figura: [
        { pagina: 4, recorte: [0.1, 0.155, 0.515, 0.345] },
        {
          pagina: 4,
          recorte: [0.13, 0.355, 0.44, 0.625],
          mascaras: [{ area: [0.34, 0.365, 0.4, 0.445], letra: '' }],
        },
        { pagina: 4, recorte: [0.085, 0.655, 0.515, 0.87] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [13, 6, 9], alvo: [1, 0, 1] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
      ],
      objetos: [
        { id: 't1', tipo: 'fio', I: 'I0', a: [0, 0.08, 0], b: [0, 'a', 0], infinito: 'a', rotulo: 'trecho 1' },
        ...arco,
        { id: 't3', tipo: 'fio', I: 'I0', a: [0, '0-a', 0], b: [0.08, '0-a', 0], infinito: 'b', rotulo: 'trecho 3' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
        { id: 'ex', tipo: 'rotulo', pos: [0.012, 0.012, 0.045], texto: 'eixo z →' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Trecho 1', simbolo: 'B_1', expr: "mag(Bde('t1', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Trecho 2 (componente x)', simbolo: 'B_2', expr: 'x(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(4*a)' },
        { rotulo: 'Trecho 3 (componente z)', simbolo: 'B_3', expr: "z(Bde('t3', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(4*pi*a)' },
        { rotulo: 'Módulo resultante', simbolo: '|B|', expr: 'mag(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(4*pi*a)*sqrt(pi^2 + 1)' },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Trecho 1: nada',
          previsao: { pergunta: 'O trecho 1, ao longo de y, produz campo na origem?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Todo elemento do trecho 1 está sobre o eixo $y$, e aponta ao longo dele: $d\vec\ell\parallel\hat r$.

$$d\vec B = \frac{\mu_0I}{4\pi}\frac{d\vec\ell\times\hat r}{r^2} = \vec 0 \quad\Rightarrow\quad \vec B_1 = \vec 0.$$`,
          destacar: ['t1'],
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Trecho 2: arco',
          texto: r`Todo elemento está à distância $a$ da origem, com $d\vec\ell\perp\hat r$. No topo do arco, por exemplo, $d\vec\ell\times\hat r = (-\hat y)\times(-\hat z) = \hat x$.

$$\vec B_2 = \frac{\mu_0I}{4\pi a^2}\,\pi a\;\hat x = \frac{\mu_0I}{4a}\hat x.$$

Na cena, a componente $x$ de $\vec B$ em $O$ vem só do arco.`,
          medidas: [1],
        },
        {
          item: 'c',
          titulo: '(c) Trecho 3: a integral',
          texto: r`O elemento está em $(x, -a, 0)$, com $d\vec\ell = dx\,\hat x$. Até a origem, $r = \sqrt{x^2+a^2}$, e $d\vec\ell\times\hat r = dx\,\sin\theta\,\hat z$, com $\sin\theta = a/r$:

$$\vec B_3 = \frac{\mu_0Ia}{4\pi}\hat z\int_0^\infty\frac{dx}{(x^2+a^2)^{3/2}}.$$

Com a integral do formulário, que vale $1/a^2$:

$$\vec B_3 = \frac{\mu_0I}{4\pi a}\hat z.$$

É metade do campo de um fio infinito a uma distância $a$.`,
          destacar: ['t3'],
          medidas: [2],
        },
        {
          item: 'd',
          titulo: '(d) Resultante',
          texto: r`$\vec B_2$ e $\vec B_3$ são perpendiculares:

$$|\vec B| = \sqrt{\left(\frac{\mu_0I}{4a}\right)^2 + \left(\frac{\mu_0I}{4\pi a}\right)^2} = \frac{\mu_0I}{4\pi a}\sqrt{\pi^2+1}.$$`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Biot-Savart', lab: 'ampere' },
          { texto: 'Superposição vetorial' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$d\vec\ell\times\hat r = \vec 0$: $\vec B_1 = \vec 0$.`, passo: 0 },
          { titulo: '(b)', texto: r`$\vec B_2 = \dfrac{\mu_0I}{4a}\hat x$.`, passo: 1 },
          { titulo: '(c)', texto: r`$\vec B_3 = \dfrac{\mu_0I}{4\pi a}\hat z$.`, passo: 2 },
          { titulo: '(d)', texto: r`$|\vec B| = \dfrac{\mu_0I}{4\pi a}\sqrt{\pi^2+1}$.`, passo: 3 },
        ],
        resultado: r`$\vec B_1 = \vec 0$; $\vec B_2 = \dfrac{\mu_0I}{4a}\hat x$; $\vec B_3 = \dfrac{\mu_0I}{4\pi a}\hat z$; $|\vec B| = \dfrac{\mu_0I}{4\pi a}\sqrt{\pi^2+1}$.`,
        errosComuns: [
          r`Somar os módulos em (d): os vetores são perpendiculares.`,
          r`Usar o campo do fio inteiro para o trecho 3, sem o fator $\frac12$.`,
          r`Pôr $\vec B_2$ ao longo de $\hat z$: o arco está no plano $yz$, e o campo é perpendicular a ele.`,
        ],
        oficial: { resposta: r`$\vec B_1 = \vec 0$; $\vec B_2 = \dfrac{\mu_0I}{4a}\hat x$; $\vec B_3 = \dfrac{\mu_0I}{4\pi a}\hat z$; $|\vec B| = \dfrac{\mu_0I}{4\pi a}\sqrt{\pi^2+1}$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\vec B_1 = \vec 0$`, pontos: 0.8, criterio: r`Justificar com $d\vec\ell\parallel\hat r$.` },
        { item: 'b', texto: r`$\vec B_2 = \dfrac{\mu_0I}{4a}\hat x$`, pontos: 1.2, criterio: 'Biot-Savart no arco, com direção e sentido.' },
        { item: 'c', texto: r`$\vec B_3 = \dfrac{\mu_0I}{4\pi a}\hat z$`, pontos: 1.5, criterio: 'Integral com a primitiva do formulário, ou argumento do fio infinito.' },
        { item: 'd', texto: r`$|\vec B| = \dfrac{\mu_0I}{4\pi a}\sqrt{\pi^2+1}$`, pontos: 0.5, criterio: 'Soma vetorial.' },
      ],
    },
  ],
}

import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: capacitância de C₁ (C₂ tem metade da separação, logo o dobro). */
const C1 = '(eps0*lado^2/d1)'

/* Objetiva 4: campo magnético de cada alternativa (a) a (d), com B = E/v. */
const Bmod = '(E0/v0)'

/* Objetiva 5: quarto de círculo horário, de (0, a) a (a, 0), como fios. */
const N = 24
const noArco = (i: number): [string, string, number] => {
  const f = ((i / N) * Math.PI) / 2
  return [`a*${Math.sin(f)}`, `a*${Math.cos(f)}`, 0]
}
const arco: ObjetoInput[] = Array.from({ length: N }, (_, i) => ({
  id: `c${i}`,
  tipo: 'fio' as const,
  I: 'I0',
  a: noArco(i),
  b: noArco(i + 1),
}))

/* Objetivas 7 e 8: relógio deslocado por t0, para ver cada instante. */
const T = '(t + t0)'
const fluxoQ7 = `(6*${T}^2 + 7*${T} + 1)`
const fatias = (u: string) =>
  `(${u} < 1 ? 0.75 : (${u} < 2 ? 0.75 + 1.45*(${u} - 1) : (${u} < 3 ? 2.2 + 0.3*(${u} - 2) : (${u} < 4 ? 2.5 : (${u} < 5 ? 2.5*(5 - ${u}) : 0)))))`
const taxa = `(${T} < 1 ? 0 : (${T} < 2 ? 1.45 : (${T} < 3 ? 0.3 : (${T} < 4 ? 0 : (${T} < 5 ? -2.5 : 0)))))`

/**
 * P2 de Física III, 2023/1, noturno, versão A (06/07/2023). Conferida com o
 * gabarito oficial: 1d, 2a, 3e, 4c, 5d, 6a, 7b, 8f, 9g, 10h. Só objetivas.
 */
export const p2_2023_1_noturno: ProvaInput = {
  id: 'p2-2023-1-noturno',
  titulo: 'P2 · 2023/1 · Noturno',
  subtitulo: 'Física III · Segunda Prova Noturna · Versão A · 06/07/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Dois capacitores em série',
      resumo: 'Mesma carga, e tensões inversas às capacitâncias.',
      enunciado: r`Dois capacitores, de capacitâncias $C_1$ e $C_2 = 2C_1$, são ligados em série a uma bateria que fornece uma voltagem $V_0$ ao sistema. A razão, $Q_1/Q_2$, entre as cargas armazenadas nos capacitores 1 e 2, e a razão, $V_1/V_2$, entre as diferenças de potencial entre as placas dos dois capacitores são, respectivamente:`,
      figura: { pagina: 1, recorte: [0.03, 0.48, 0.255, 0.88] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [4, 7, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Bateria', simbolo: 'V_0', valor: 100, unidade: 'V', min: 10, max: 300, passo: 10 },
        { id: 'lado', rotulo: 'Lado das placas', simbolo: 'L', valor: 0.06, unidade: 'm', min: 0.04, max: 0.08, passo: 0.005 },
        { id: 'd1', rotulo: 'Separação em C₁', simbolo: 'd_1', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
      ],
      objetos: [
        { id: 'c1', tipo: 'capacitor', rotulo: 'C₁', centro: [-0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1', Q: `2/3*${C1}*V0` },
        { id: 'c2', tipo: 'capacitor', rotulo: 'C₂', centro: [0.035, 0, 0], eixo: 'x', lado: 'lado', d: 'd1/2', Q: `2/3*${C1}*V0` },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'C₂/C₁', simbolo: 'C_2/C_1', expr: "C('c2')/C('c1')", teoria: 2 },
        { rotulo: 'Razão das cargas', simbolo: 'Q_1/Q_2', expr: "Q('c1')/Q('c2')", teoria: 1 },
        { rotulo: 'Tensão em C₁', simbolo: 'V_1', expr: "Q('c1')/C('c1')", unidade: 'V', teoria: '2*V0/3' },
        { rotulo: 'Tensão em C₂', simbolo: 'V_2', expr: "Q('c2')/C('c2')", unidade: 'V', teoria: 'V0/3' },
        { rotulo: 'Razão das tensões', simbolo: 'V_1/V_2', expr: "(Q('c1')/C('c1'))/(Q('c2')/C('c2'))", teoria: 2 },
        { rotulo: 'Soma das tensões', simbolo: 'V_1 + V_2', expr: "Q('c1')/C('c1') + Q('c2')/C('c2')", unidade: 'V', teoria: 'V0' },
      ],
      passos: [
        {
          titulo: 'Em série, a carga é a mesma',
          previsao: { pergunta: 'Em série, o que é igual nos dois capacitores?', opcoes: ['a carga', 'a tensão'], correta: 0 },
          texto: r`As placas internas formam um condutor isolado, que começa neutro: a carga que sai de uma entra na outra. Logo $Q_1 = Q_2$, e a razão é 1.`,
          medidas: [1],
        },
        {
          titulo: 'As tensões',
          texto: r`Com $V = Q/C$ e a mesma carga, o menor capacitor fica com a maior tensão:

$$\frac{V_1}{V_2} = \frac{C_2}{C_1} = 2.$$

Alternativa **(d)**.`,
          medidas: [2, 3, 4],
        },
        {
          titulo: 'Conferir',
          texto: r`As tensões somam $V_0$: $V_1 = \frac23V_0$ e $V_2 = \frac13V_0$. Na cena, $C_2$ tem metade da separação de $C_1$, com o mesmo campo elétrico nos dois.`,
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Associação de capacitores', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Carga', texto: r`Em série, $Q_1 = Q_2$.`, passo: 0 },
          { titulo: 'Tensão', texto: r`$V_1/V_2 = C_2/C_1 = 2$.`, passo: 1 },
        ],
        resultado: r`$Q_1/Q_2 = 1$ e $V_1/V_2 = 2$: alternativa **(d)**.`,
        errosComuns: [
          r`Trocar série por paralelo: em paralelo, é a tensão que é igual.`,
          r`Inverter a razão das tensões: o menor capacitor tem a maior tensão.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$1/2$ e $1/2$`, porque: r`Em série, a carga é a mesma.` },
        { letra: 'b', texto: r`$1/2$ e $2$`, porque: r`A tensão está certa, mas $Q_1 = Q_2$.` },
        { letra: 'c', texto: r`$1/2$ e $1$`, porque: r`Seria o caso em paralelo.` },
        { letra: 'd', texto: r`$1$ e $2$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$1$ e $1/2$`, porque: r`A razão das tensões está invertida.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Duas cargas positivas andando em paralelo',
      resumo: 'Elétrica repele; magnética atrai, como correntes paralelas.',
      enunciado: r`Considere duas partículas, com cargas elétricas $q_1 = q$ e $q_2 = q/2$ ($q > 0$), velocidades constantes, baixas, $\vec v_1 = 3v\hat y$ e $\vec v_2 = v\hat y$ ($v > 0$), nas posições $\vec r_1 = \vec 0$ e $\vec r_2 = L\hat x$ ($L > 0$), de um sistema de coordenadas cartesianas usuais. Qual é a alternativa que indica corretamente o caráter atrativo ou repulsivo das forças elétrica e magnética entre tais partículas?`,
      figura: { pagina: 1, recorte: [0.27, 0.48, 0.49, 0.885] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [5, 7, 15], alvo: [2.5, 0, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 1e6, unidade: 'm/s', min: 2e5, max: 3e6, passo: 1e5 },
        { id: 'L', rotulo: 'Distância', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'c1', tipo: 'carga', q: 'qq', pos: [0, 0, 0], rotulo: 'q₁' },
        { id: 'c2', tipo: 'carga', q: 'qq/2', pos: ['L', 0, 0], rotulo: 'q₂' },
        { id: 'Bq', tipo: 'campoB', valor: 'mu0/(4*pi)*qq*cross([0, 3*v0, 0], [x, y, z])/(x^2 + y^2 + z^2 + 1e-8)^(3/2)', rotulo: 'B de q₁' },
        { id: 'v1', tipo: 'seta', papel: 'v', origem: [0, 0, 0], vetor: [0, 1, 0], comprimento: '4*cm', rotulo: 'v₁ = 3v' },
        { id: 'v2', tipo: 'seta', papel: 'v', origem: ['L', 0, 0], vetor: [0, 1, 0], comprimento: '1.5*cm', rotulo: 'v₂ = v' },
        { id: 'Fe', tipo: 'seta', papel: 'forca', origem: ['L', 0.01, 0], vetor: [1, 0, 0], comprimento: '2.5*cm', rotulo: 'F elétrica' },
        { id: 'Fm', tipo: 'seta', papel: 'forca', origem: ['L', -0.01, 0], vetor: [-1, 0, 0], comprimento: '1.2*cm', rotulo: 'F magnética' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xz', fontes: ['Bq'] },
      medidas: [
        { rotulo: 'Força elétrica em q₂ (positiva: repele)', simbolo: 'F_E', expr: "x(F('c2'))", unidade: 'N', teoria: 'k0*qq^2/(2*L^2)' },
        { rotulo: 'B de q₁ na posição de q₂', simbolo: 'B_z', expr: 'z(B(L, 0, 0))', unidade: 'T', teoria: '0-mu0/(4*pi)*qq*3*v0/L^2' },
        { rotulo: 'Força magnética em q₂ (negativa: atrai)', simbolo: 'F_B', expr: 'x(qq/2*cross([0, v0, 0], B(L, 0, 0)))', unidade: 'N', teoria: '0-mu0/(4*pi)*qq^2*3*v0^2/(2*L^2)' },
        { rotulo: 'Razão |F_B|/F_E', simbolo: '|F_B|/F_E', expr: "abs(x(qq/2*cross([0, v0, 0], B(L, 0, 0))))/x(F('c2'))", teoria: '3*v0^2*mu0*eps0' },
      ],
      passos: [
        {
          titulo: 'Força elétrica',
          texto: r`Duas cargas positivas: **repulsão**, segundo a lei de Coulomb.

$$F_E = k_0\frac{q\cdot q/2}{L^2}.$$`,
          medidas: [0],
        },
        {
          titulo: 'O campo de q₁ em q₂',
          texto: r`A carga em movimento produz um campo magnético. Em $\vec r_2$, $\vec v_1\times\hat r$ vale $\hat y\times\hat x = -\hat z$:

$$\vec B = -\frac{\mu_0}{4\pi}\frac{q\cdot 3v}{L^2}\hat z.$$`,
          medidas: [1],
        },
        {
          titulo: 'Força magnética',
          previsao: { pergunta: 'Duas correntes paralelas, no mesmo sentido, se…', opcoes: ['atraem', 'repelem'], correta: 0 },
          texto: r`$\vec F = q_2\vec v_2\times\vec B$, com $\hat y\times(-\hat z) = -\hat x$: aponta para $q_1$. É uma **atração**, como a de duas correntes paralelas.

Alternativa **(a)**. Com velocidades baixas, a magnética é muito menor que a elétrica: a razão é $3v^2/c^2$.`,
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Coulomb', lab: 'coulomb' },
          { texto: 'Força de Lorentz', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: 'Elétrica', texto: r`Cargas de mesmo sinal: repulsiva.`, passo: 0 },
          { titulo: 'Magnética', texto: r`Velocidades paralelas: atrativa.`, passo: 2 },
        ],
        resultado: r`Elétrica repulsiva e magnética atrativa: alternativa **(a)**.`,
        errosComuns: [
          r`Achar que mesmo sinal repele também na força magnética: nela, cargas de mesmo sinal com velocidades paralelas se atraem.`,
          r`Esquecer a segunda regra da mão direita: é preciso achar $\vec B$ e depois $\vec v\times\vec B$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Repulsiva, atrativa.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'Repulsiva, repulsiva.', porque: r`Correntes paralelas se atraem.` },
        { letra: 'c', texto: 'Atrativa, repulsiva.', porque: r`Os dois caracteres estão trocados.` },
        { letra: 'd', texto: 'Atrativa, atrativa.', porque: r`Cargas de mesmo sinal se repelem eletricamente.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Barra de cobre esticada',
      resumo: 'O dobro do comprimento e metade da área: 4R.',
      enunciado: r`Uma barra de cobre cilíndrica, de resistência elétrica $R$, comprimento $L$ e área da seção reta transversal $A$, é esticada para o dobro do seu comprimento original, sem que seu volume se altere. Pode-se afirmar que o novo valor de sua resistência elétrica é:`,
      figura: { pagina: 1, recorte: [0.535, 0.02, 0.755, 0.37] },
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 24], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'f', rotulo: 'Fator de estiramento', simbolo: 'f', valor: 1, unidade: '', min: 1, max: 2, passo: 0.05 },
        { id: 'L0', rotulo: 'Comprimento original', simbolo: 'L', valor: 0.1, unidade: 'm', min: 0.1, max: 0.1 },
        { id: 'r0', rotulo: 'Raio original', simbolo: 'r', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'res', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1.7e-8, unidade: 'Ω·m', min: 1.7e-8, max: 1.7e-8 },
      ],
      objetos: [
        { id: 'barra', tipo: 'condutor', a: ['-L0*f/2', 0, 0], b: ['L0*f/2', 0, 0], raio: 'r0/sqrt(f)', I: 1, rotulo: 'barra' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Comprimento', simbolo: "L'", expr: 'L0*f', unidade: 'm', teoria: 'f*L0' },
        { rotulo: 'Área', simbolo: "A'", expr: 'pi*(r0/sqrt(f))^2', unidade: 'm²', teoria: 'pi*r0^2/f' },
        { rotulo: 'Volume', simbolo: "V'", expr: 'L0*f*pi*(r0/sqrt(f))^2', unidade: 'm³', teoria: 'L0*pi*r0^2' },
        { rotulo: 'Resistência', simbolo: "R'", expr: 'res*L0*f/(pi*(r0/sqrt(f))^2)', unidade: 'Ω', teoria: 'f^2*res*L0/(pi*r0^2)' },
        { rotulo: 'Em unidades de R', simbolo: "R'/R", expr: '(res*L0*f/(pi*(r0/sqrt(f))^2))/(res*L0/(pi*r0^2))', teoria: 'f^2' },
      ],
      passos: [
        {
          titulo: 'Volume constante',
          texto: r`O volume $AL$ não muda. Se o comprimento dobra, a área cai à metade:

$$L' = 2L,\qquad A' = \frac A2.$$

Use o controle e veja a barra afinar.`,
          parametros: { f: 2 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Os dois efeitos se somam',
          previsao: { pergunta: 'Dobrar L e cortar A pela metade multiplica R por…', opcoes: ['1', '2', '4'], correta: 2 },
          texto: r`$$R' = \rho\frac{L'}{A'} = \rho\frac{2L}{A/2} = 4\rho\frac LA = 4R.$$

Mais comprimento e menos seção: cada um dobra a resistência. Alternativa **(e)**.`,
          parametros: { f: 2 },
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Resistência e resistividade', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Geometria', texto: r`$L' = 2L$ e $A' = A/2$.`, passo: 0 },
          { titulo: 'Resistência', texto: r`$R' = 4R$.`, passo: 1 },
        ],
        resultado: r`$R' = 4R$: alternativa **(e)**.`,
        errosComuns: [
          r`Dobrar só o comprimento e dar $2R$: a área também muda.`,
          r`Achar que a resistividade muda: ela é do material.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\sqrt2R$`, porque: r`A dependência é com $f^2$, não com $\sqrt f$.` },
        { letra: 'b', texto: r`$R/2$`, porque: r`Inverte o efeito do comprimento.` },
        { letra: 'c', texto: r`$R/4$`, porque: r`Inverte a razão: a barra fica mais resistiva.` },
        { letra: 'd', texto: 'o mesmo', porque: r`Volume constante não significa resistência constante.` },
        { letra: 'e', texto: r`$4R$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Seletor de velocidades',
      resumo: 'B perpendicular a E e a v, para cancelar a força elétrica.',
      enunciado: r`Um íon com carga elétrica elementar negativa $-e$ e velocidade $\vec v = v\hat x$, onde $v > 0$, entra em uma região onde existe um campo elétrico constante (estacionário e uniforme) $\vec E = E\hat y$. Para que a trajetória desse íon nessa região seja retilínea, é necessário que haja um campo magnético constante (estacionário e uniforme) $\vec B$ dado por`,
      figura: { pagina: 1, recorte: [0.535, 0.42, 0.755, 0.97] },
      cena: {
        escala: 0.01,
        extensao: 12,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, 0, 26], alvo: [0, 0, 0] },
        tempo: { escala: 1e-7, unidade: 'ns', passo: 5e-10 },
      },
      parametros: [
        {
          id: 'alt',
          rotulo: 'Campo magnético',
          valor: 3,
          opcoes: [
            { valor: 1, rotulo: '(a) −(E/v) ŷ' },
            { valor: 2, rotulo: '(b) +(E/v) ŷ' },
            { valor: 3, rotulo: '(c) +(E/v) ẑ' },
            { valor: 4, rotulo: '(d) −(E/v) ẑ' },
          ],
        },
        { id: 'E0', rotulo: 'Campo elétrico', simbolo: 'E', valor: 5e4, unidade: 'V/m', min: 1e4, max: 1e5, passo: 5e3 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 1e6, unidade: 'm/s', min: 5e5, max: 1.5e6, passo: 5e4 },
      ],
      objetos: [
        { id: 'Ey', tipo: 'campoE', valor: [0, 'E0', 0], rotulo: 'E' },
        { id: 'Bs', tipo: 'campoB', valor: [0, `alt==1 ? 0-${Bmod} : (alt==2 ? ${Bmod} : 0)`, `alt==3 ? ${Bmod} : (alt==4 ? 0-${Bmod} : 0)`], rotulo: 'B' },
        { id: 'p', tipo: 'particula', rotulo: '−e', q: '0-qe', m: 'mp', pos: [-0.1, 0, 0], v: ['v0', 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '2.5*cm', rotulo: 'v' },
      ],
      visual: { setasE: true, densidade: 7, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Módulo de B', simbolo: 'B', expr: 'mag(B(0, 0, 0))', unidade: 'T', teoria: Bmod },
        { rotulo: 'Campo efetivo na entrada, E + v×B', simbolo: r`|\vec E + \vec v\times\vec B|`, expr: 'mag(E(0, 0, 0) + cross([v0, 0, 0], B(0, 0, 0)))', unidade: 'V/m', teoria: 'alt==3 ? 0 : (alt==4 ? 2*E0 : sqrt(2)*E0)' },
        { rotulo: 'Desvio em y', simbolo: 'y', ativo: 'alt==3', expr: "y(pos('p'))", unidade: 'm', teoria: 0 },
        { rotulo: 'Desvio em y', simbolo: 'y', ativo: 'alt != 3', expr: "y(pos('p'))", unidade: 'm' },
      ],
      passos: [
        {
          titulo: 'A força elétrica',
          texto: r`Sobre carga negativa, a força elétrica é oposta ao campo: $\vec F_E = -eE\hat y$. Para a trajetória ser reta, a força magnética tem de cancelá-la:

$$\vec F_m = -e\,\vec v\times\vec B = +eE\hat y.$$`,
          parametros: { alt: 3 },
          medidas: [1],
        },
        {
          titulo: 'Direção de B',
          previsao: { pergunta: 'Para v×B apontar em −ŷ, com v em +x̂, B aponta em…', opcoes: ['+ẑ', '−ẑ', '+ŷ'], correta: 0 },
          texto: r`Precisamos de $\vec v\times\vec B = -E\hat y$. Como $\hat x\times\hat z = -\hat y$:

$$\vec B = \frac Ev\hat z.$$

Alternativa **(c)**. O sinal da carga some: $-e$ multiplica as duas forças.`,
          parametros: { alt: 3 },
          medidas: [0, 1, 2],
        },
        {
          titulo: 'Teste as outras',
          texto: r`Com $-\frac Ev\hat z$, a força magnética soma com a elétrica, e o íon desvia. Com $\vec B$ ao longo de $\hat y$, surge força em $\hat z$, que nada cancela. Aperte o *play* em cada opção.`,
          parametros: { alt: 4 },
          medidas: [1, 3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força de Lorentz', lab: 'lorentz' }],
        etapas: [
          { titulo: 'Equilíbrio', texto: r`$\vec E + \vec v\times\vec B = \vec 0$.`, passo: 0 },
          { titulo: 'Solução', texto: r`$\vec B = (E/v)\hat z$.`, passo: 1 },
        ],
        resultado: r`$\vec B = \dfrac Ev\hat z$: alternativa **(c)**.`,
        errosComuns: [
          r`Inverter o sinal por causa da carga negativa: $\vec E + \vec v\times\vec B = \vec 0$ não depende de $q$.`,
          r`Pôr $\vec B$ paralelo a $\vec E$: a força magnética fica em $\hat z$.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac Ev\hat y$`, porque: r`$\vec B\parallel\vec E$ dá força em $\hat z$, sem cancelar nada.` },
        { letra: 'b', texto: r`$\dfrac Ev\hat y$`, porque: r`$\vec B\parallel\vec E$ dá força em $\hat z$, sem cancelar nada.` },
        { letra: 'c', texto: r`$\dfrac Ev\hat z$`, correta: true, porque: r`Correta.` },
        { letra: 'd', texto: r`$-\dfrac Ev\hat z$`, porque: r`As duas forças se somariam.` },
        { letra: 'e', texto: 'O íon descreveria uma trajetória circular devido ao campo magnético constante.', porque: r`Com a força resultante nula, ele segue reto.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fio com um quarto de círculo',
      resumo: 'Os trechos retos apontam para P; só o arco conta.',
      enunciado: r`Uma corrente elétrica estacionária $I$ passa por um condutor formado por um quarto de círculo de raio $a$ e por dois fios retilíneos semi-infinitos que fazem um ângulo de $\pi/2$ entre si, conforme mostra a figura abaixo. A intensidade do campo magnético no ponto P, que coincide com o centro do círculo, é dada por:`,
      figura: { pagina: 1, recorte: [0.77, 0.02, 0.99, 0.68] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [2, 2, 18], alvo: [2, 2, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        { id: 'r1', tipo: 'fio', I: 'I0', a: [0, 0.09, 0], b: [0, 'a', 0], infinito: 'a', rotulo: 'I' },
        ...arco,
        { id: 'r2', tipo: 'fio', I: 'I0', a: ['a', 0, 0], b: [0.09, 0, 0], infinito: 'b' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'P' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Trechos retos', simbolo: 'B_r', expr: "z(Bde('r1', 0, 0, 0)) + z(Bde('r2', 0, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Campo em P (negativo: para dentro)', simbolo: 'B_z', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: '0-mu0*I0/(8*a)' },
        { rotulo: 'Em unidades de μ₀I/a', simbolo: r`Ba/\mu_0I`, expr: 'abs(z(B(0, 0, 0)))*a/(mu0*I0)', teoria: '1/8' },
      ],
      passos: [
        {
          titulo: 'Os trechos retos não contam',
          previsao: { pergunta: 'Os trechos retos produzem campo em P?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Os dois fios, prolongados, passam por P: neles, $d\vec\ell\parallel\hat r$, e $d\vec\ell\times\hat r = \vec 0$.`,
          medidas: [0],
        },
        {
          titulo: 'O arco',
          texto: r`Todo elemento do arco está a uma distância $a$ de P, com $d\vec\ell\perp\hat r$:

$$B = \frac{\mu_0I}{4\pi a^2}\cdot\frac{\pi a}2 = \frac{\mu_0I}{8a}.$$

É um quarto do campo de uma espira, $\mu_0I/2a$. Alternativa **(d)**.`,
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Biot-Savart', lab: 'ampere' }],
        etapas: [
          { titulo: 'Retas', texto: r`$d\vec\ell\parallel\hat r$: contribuição nula.`, passo: 0 },
          { titulo: 'Arco', texto: r`$B = \mu_0I/8a$.`, passo: 1 },
        ],
        resultado: r`$B = \dfrac{\mu_0I}{8a}$: alternativa **(d)**.`,
        errosComuns: [
          r`Somar o campo de fios semi-infinitos: isso só vale se P estiver fora da linha do fio.`,
          r`Usar $\mu_0I/2a$, que é o campo da espira inteira.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\mu_0I}{2\pi a}$`, porque: r`É o campo de um fio infinito a uma distância $a$.` },
        { letra: 'b', texto: r`$\dfrac{\mu_0I}{4\pi a}$`, porque: r`É o campo de um fio semi-infinito com P ao lado dele.` },
        { letra: 'c', texto: r`$\dfrac{\mu_0I}{4a}$`, porque: r`É o campo de um semicírculo.` },
        { letra: 'd', texto: r`$\dfrac{\mu_0I}{8a}$`, correta: true, porque: r`Correta.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0I}{2a}\left(\dfrac1\pi + \dfrac12\right)$`, porque: r`Soma um campo de reta que não existe: as retas passam por P.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Trabalho, fluxo magnético e Faraday',
      resumo: 'Três afirmações: só a primeira resiste.',
      enunciado: r`Considere as seguintes afirmações: (I) a força magnética sobre uma partícula (pontual) nunca realiza trabalho; (II) o fluxo do campo magnético através de uma superfície fechada é igual à corrente no seu interior, e (III) a lei de Faraday só se aplica para correntes estacionárias. Assinale, das opções abaixo, aquela que indica as afirmações verdadeiras.`,
      figura: { pagina: 2, recorte: [0.03, 0.02, 0.255, 0.55] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [10, 9, 13], alvo: [0, 0, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Afirmação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) trabalho' },
            { valor: 2, rotulo: '(II) fluxo fechado' },
            { valor: 3, rotulo: '(III) Faraday' },
          ],
        },
        { id: 'B0', rotulo: 'Campo', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v', valor: 1e5, unidade: 'm/s', min: 5e4, max: 2e5, passo: 1e4 },
        { id: 'I0', rotulo: 'Corrente no fio', simbolo: 'I', valor: 20, unidade: 'A', min: 5, max: 40, passo: 1 },
        { id: 'w', rotulo: 'Frequência angular', simbolo: r`\omega`, valor: 2e6, unidade: 'rad/s', min: 1e6, max: 4e6, passo: 1e5 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', ativo: 'caso != 2', valor: [0, 'caso==1 ? B0 : B0*sin(w*t)', 0], rotulo: 'B' },
        { id: 'p', tipo: 'particula', ativo: 'caso==1', rotulo: 'q', q: 'qe', m: 'mp', pos: [0.01, 0, 0], v: [0, 0, 'v0'] },
        { id: 'fw', tipo: 'fioInfinito', ativo: 'caso==2', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'S', tipo: 'gaussiana', ativo: 'caso==2', forma: 'esfera', centro: [0, 0, 0], raio: 0.04, campo: 'B', rotulo: 'S' },
        { id: 'Sc', tipo: 'espiraSensora', ativo: 'caso==3', centro: [0, 0, 0], normal: 'y', raio: 0.04, rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Potência da força magnética', simbolo: r`\vec F\cdot\vec v`, ativo: 'caso==1', expr: "qe*dot(vel('p'), cross(vel('p'), B(pos('p'))))", unidade: 'W', teoria: 0 },
        { rotulo: 'Rapidez', simbolo: '|v|', ativo: 'caso==1', expr: "mag(vel('p'))", unidade: 'm/s', teoria: 'v0' },
        { rotulo: 'Fluxo de B por S, relativo a μ₀I·r', simbolo: r`\Phi_B/\mu_0Ir`, ativo: 'caso==2', expr: "floor(1e6*fluxo('S')/(mu0*I0*0.04) + 0.5)/1e6", teoria: 0 },
        { rotulo: 'Corrente que atravessa S', simbolo: 'I', ativo: 'caso==2', expr: 'I0', unidade: 'A' },
        { rotulo: 'fem na espira', simbolo: r`\mathcal E`, ativo: 'caso==3', expr: "fem('Sc')", unidade: 'V', teoria: '0-pi*0.04^2*B0*w*cos(w*t)' },
      ],
      passos: [
        {
          titulo: '(I) A força magnética não trabalha',
          texto: r`$\vec F = q\vec v\times\vec B$ é sempre perpendicular a $\vec v$: a potência $\vec F\cdot\vec v$ é nula, e a rapidez não muda. **Verdadeira.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) O fluxo fechado é sempre zero',
          previsao: { pergunta: 'Com um fio atravessando S, o fluxo de B por S é…', opcoes: ['μ₀I', 'I', 'zero'], correta: 2 },
          texto: r`A lei de Gauss do magnetismo diz $\oint\vec B\cdot d\vec A = 0$, sempre. A corrente aparece na lei de Ampère, na **circulação** por uma curva fechada. **Falsa.**`,
          parametros: { caso: 2 },
          medidas: [2, 3],
        },
        {
          titulo: '(III) Faraday é para campo variável',
          texto: r`A lei de Faraday trata do fluxo **variável**. Correntes estacionárias produzem campo constante, que não induz nada numa espira parada. Aqui, com $\vec B$ oscilando, há fem. **Falsa.**

Só a (I) é verdadeira: alternativa **(a)**.`,
          parametros: { caso: 3 },
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força de Lorentz', lab: 'lorentz' },
          { texto: 'Lei de Gauss do magnetismo', lab: 'gauss' },
          { texto: 'Lei de Faraday', lab: 'faraday' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`$\vec F\perp\vec v$: verdadeira.`, passo: 0 },
          { titulo: '(II)', texto: r`$\oint\vec B\cdot d\vec A = 0$: falsa.`, passo: 1 },
          { titulo: '(III)', texto: r`Faraday exige fluxo variável: falsa.`, passo: 2 },
        ],
        resultado: r`Apenas (I): alternativa **(a)**.`,
        errosComuns: [
          r`Confundir Gauss do magnetismo com Ampère: fluxo por superfície fechada contra circulação por curva fechada.`,
          r`Inverter (III): é justamente fora do regime estacionário que Faraday importa.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`O fluxo por superfície fechada é sempre nulo.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`Faraday trata de fluxo variável.` },
        { letra: 'd', texto: 'Apenas I e II.', porque: r`(II) é falsa.` },
        { letra: 'e', texto: 'Apenas I e III.', porque: r`(III) é falsa.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Todas.', porque: r`Só a (I) é verdadeira.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`A (I) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 7 ───────────────────────── */
    {
      id: 'obj7',
      numero: '7',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'fem de uma bobina de 10 espiras',
      resumo: 'Derivar o fluxo e multiplicar pelo número de espiras.',
      enunciado: r`O fluxo magnético através de uma única espira de uma bobina circular muito fina tem a seguinte dependência temporal: $\Phi_B(t) = (6\ \text{Wb}\cdot\text{s}^{-2})\,t^2 + (7\ \text{Wb}\cdot\text{s}^{-1})\,t + 1\ \text{Wb}$. A bobina tem, no total, 10 espiras. O módulo da fem induzida na bobina, em $t = 2$ s, é:`,
      figura: { pagina: 2, recorte: [0.03, 0.615, 0.255, 0.965] },
      cena: {
        escala: 0.1,
        extensao: 8,
        unidade: 'm',
        camera: { pos: [10, 8, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.25, unidade: 's', passo: 0.001, duracao: 2 },
      },
      parametros: [
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 2, unidade: 's', min: 0, max: 4, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, fluxoQ7, 0], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'y', raio: 'sqrt(1/pi)', N: 10, rotulo: 'bobina' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Fluxo por espira', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: fluxoQ7 },
        { rotulo: 'Taxa do fluxo por espira', simbolo: r`d\Phi_B/dt`, expr: `12*${T} + 7`, unidade: 'Wb/s' },
        { rotulo: 'fem na bobina', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: `-10*(12*${T} + 7)` },
      ],
      graficos: [
        {
          titulo: 'Fluxo por espira no tempo',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 4, rotulo: 't', unidade: 's' },
          series: [{ rotulo: 'Φ', expr: '6*tt^2 + 7*tt + 1', unidade: 'Wb' }],
        },
      ],
      passos: [
        {
          titulo: 'Derivar',
          texto: r`Por espira:

$$\frac{d\Phi_B}{dt} = 12t + 7.$$

Em $t = 2$ s, vale $31$ Wb/s. O termo constante, $1$ Wb, some na derivada.`,
          parametros: { t0: 2 },
          medidas: [0, 1],
        },
        {
          titulo: 'Somar as espiras',
          previsao: { pergunta: 'A fem de N espiras em série, com o mesmo fluxo, é…', opcoes: ['a de uma só', 'N vezes a de uma', 'a de uma dividida por N'], correta: 1 },
          texto: r`As espiras estão em série, e as fems se somam:

$$|\mathcal E| = N\frac{d\Phi_B}{dt} = 10\times 31 = 310\ \text{V}.$$

Alternativa **(b)**.`,
          parametros: { t0: 2 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }],
        etapas: [
          { titulo: 'Taxa', texto: r`$d\Phi_B/dt = 12t + 7 = 31$ Wb/s.`, passo: 0 },
          { titulo: 'fem', texto: r`$|\mathcal E| = 10\times31 = 310$ V.`, passo: 1 },
        ],
        resultado: r`$|\mathcal E| = 310$ V: alternativa **(b)**.`,
        errosComuns: [
          r`Usar o fluxo no lugar de sua derivada: isso dá $390$ V, com $N = 10$.`,
          r`Esquecer o $N$: a fem de uma espira é $31$ V.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: '380 V', porque: r`Não sai de $10(12t + 7)$ em $t = 2$ s.` },
        { letra: 'b', texto: '310 V', correta: true, porque: r`Correta.` },
        { letra: 'c', texto: '400 V', porque: r`Não sai de $10(12t + 7)$ em $t = 2$ s.` },
        { letra: 'd', texto: '190 V', porque: r`Usa $6t + 7$: esquece o 2 da derivada de $t^2$.` },
        { letra: 'e', texto: '390 V', porque: r`É $10\,\Phi_B(2)$: o fluxo, não a derivada.` },
      ],
    },

    /* ───────────────────────── Objetiva 8 ───────────────────────── */
    {
      id: 'obj8',
      numero: '8',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Ordenar fems pela inclinação de B(t)',
      resumo: 'A fem é a inclinação do gráfico, não a altura.',
      enunciado: r`Uma espira condutora, rígida, em repouso, está imersa em uma região de campo magnético não estacionário, cujo módulo varia como mostra o gráfico abaixo. Assinale a opção abaixo que melhor representa a relação entre os módulos, $\mathcal E$, da força eletromotriz induzida na espira em cada um dos diferentes intervalos de tempo (I, II, III, IV e V) marcados no gráfico.`,
      figura: { pagina: 2, recorte: [0.27, 0.02, 0.49, 0.87] },
      cena: {
        escala: 0.01,
        extensao: 8,
        unidade: 'cm',
        camera: { pos: [10, 9, 13], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.001, duracao: 5 },
      },
      parametros: [
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0.5, unidade: 's', min: 0, max: 4.9, passo: 0.1 },
        { id: 'a', rotulo: 'Raio da espira', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, fatias(T), 0], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'y', raio: 'a', rotulo: 'espira' },
      ],
      visual: { setasB: true, densidade: 7 },
      medidas: [
        { rotulo: 'Campo', simbolo: 'B', expr: 'y(B(0, 0, 0))', unidade: 'T', teoria: fatias(T) },
        { rotulo: 'Inclinação do gráfico', simbolo: 'dB/dt', expr: taxa, unidade: 'T/s' },
        { rotulo: 'Módulo da fem', simbolo: r`|\mathcal E|`, expr: "abs(fem('S'))", unidade: 'V', teoria: `abs(${taxa})*pi*a^2` },
      ],
      graficos: [
        {
          titulo: 'B(t)',
          tipo: 'perfil',
          x: { variavel: 'tt', de: 0, ate: 5, rotulo: 't', unidade: 's' },
          series: [{ rotulo: 'B', expr: fatias('tt'), unidade: 'T' }],
        },
      ],
      passos: [
        {
          titulo: 'A fem é a inclinação',
          previsao: { pergunta: 'Em qual trecho a fem é maior?', opcoes: ['onde B é mais alto', 'onde B muda mais rápido'], correta: 1 },
          texto: r`Espira parada e área fixa: $|\mathcal E| = A\,|dB/dt|$. O que importa é a **inclinação** do gráfico.

Nos intervalos I e IV, $B$ é constante. A fem é zero, mesmo com $B$ alto em IV.`,
          parametros: { t0: 3.5 },
          medidas: [1, 2],
        },
        {
          titulo: 'Intervalo I',
          texto: r`$B$ parado em cerca de $0{,}75$: inclinação nula.`,
          parametros: { t0: 0.5 },
          medidas: [1, 2],
        },
        {
          titulo: 'Intervalo II',
          texto: r`Sobe de $0{,}75$ a $2{,}2$ em 1 s: inclinação de $1{,}45$.`,
          parametros: { t0: 1.5 },
          medidas: [1, 2],
        },
        {
          titulo: 'Intervalo III',
          texto: r`Sobe só de $2{,}2$ a $2{,}5$: inclinação de $0{,}3$.`,
          parametros: { t0: 2.5 },
          medidas: [1, 2],
        },
        {
          titulo: 'Intervalo V',
          texto: r`Cai de $2{,}5$ a zero em 1 s: inclinação de módulo $2{,}5$, a maior de todas.

$$|\mathcal E_I| = |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_{II}| < |\mathcal E_V|.$$

Alternativa **(f)**.`,
          parametros: { t0: 4.5 },
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday', lab: 'faraday' }],
        etapas: [
          { titulo: 'Critério', texto: r`$|\mathcal E| = A\,|dB/dt|$.`, passo: 0 },
          { titulo: 'Ordem', texto: r`Inclinações: 0 em I e IV, 0,3 em III, 1,45 em II e 2,5 em V.`, passo: 4 },
        ],
        resultado: r`$|\mathcal E_I| = |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_{II}| < |\mathcal E_V|$: alternativa **(f)**.`,
        errosComuns: [
          r`Comparar a altura de $B$ em vez da inclinação: é o erro das alternativas com $\mathcal E_{IV}$ grande.`,
          r`Ignorar o intervalo V por $B$ estar caindo: o módulo da fem conta do mesmo jeito.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$|\mathcal E_I| = |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_V| < |\mathcal E_{II}|$`, porque: r`A inclinação em V é maior que em II.` },
        { letra: 'b', texto: r`$|\mathcal E_{II}| < |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_I| < |\mathcal E_V|$`, porque: r`Em I e IV a fem é zero.` },
        { letra: 'c', texto: r`$|\mathcal E_{IV}| < |\mathcal E_I| < |\mathcal E_{II}| < |\mathcal E_{III}| < |\mathcal E_V|$`, porque: r`Em I e IV a fem é igual, e II tem inclinação maior que III.` },
        { letra: 'd', texto: r`$|\mathcal E_V| < |\mathcal E_I| = |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_{II}|$`, porque: r`Trata a descida em V como fem pequena.` },
        { letra: 'e', texto: r`$|\mathcal E_V| < |\mathcal E_I| < |\mathcal E_{II}| < |\mathcal E_{III}| < |\mathcal E_{IV}|$`, porque: r`Compara a altura de $B$, não a inclinação.` },
        { letra: 'f', texto: r`$|\mathcal E_I| = |\mathcal E_{IV}| < |\mathcal E_{III}| < |\mathcal E_{II}| < |\mathcal E_V|$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 9 ───────────────────────── */
    {
      id: 'obj9',
      numero: '9',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cilindro com J = C√s',
      resumo: 'Integrar J na seção e aplicar Ampère.',
      enunciado: r`Considere um cilindro circular, de raio $R$, com eixo coincidente com o eixo cartesiano usual $\mathcal Z$ e uma densidade de corrente elétrica $\vec J = C\sqrt s\,\hat z$, onde $C = \text{const} > 0$ e $s$ é a distância até o eixo do cilindro. Qual é a alternativa que indica corretamente o módulo do campo magnético dentro do cilindro?`,
      figura: { pagina: 2, recorte: [0.535, 0.02, 0.755, 0.57] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'C0', rotulo: 'Constante', simbolo: 'C', valor: 1e5, unidade: 'A/m^{5/2}', min: 2e4, max: 3e5, passo: 1e4 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.048, passo: 0.002 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'R', J: 'C0*sqrt(r)', rotulo: 'J(s)' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: '4/5*pi*C0*rs^(5/2)' },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: 'mu0*4/5*pi*C0*rs^(5/2)' },
        { rotulo: 'Campo em s', simbolo: 'B', expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: '2/5*mu0*C0*rs^(3/2)' },
      ],
      graficos: [
        {
          titulo: 'B(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.02*R', ate: '1.5*R', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: '(ss < R ? 2/5*mu0*C0*ss^(3/2) : 2/5*mu0*C0*R^(5/2)/ss)', unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'A corrente envolvida',
          texto: r`$J$ varia com $s$, então integramos em anéis:

$$I_\text{env} = \int_0^sC\sqrt{s'}\,2\pi s'\,ds' = 2\pi C\int_0^ss'^{3/2}\,ds' = \frac{4\pi C}{5}s^{5/2}.$$`,
          medidas: [0],
        },
        {
          titulo: 'Ampère',
          previsao: { pergunta: 'Ao dividir por 2πs, a potência de s fica…', opcoes: ['s^(1/2)', 's^(3/2)', 's^(5/2)'], correta: 1 },
          texto: r`$$B = \frac{\mu_0I_\text{env}}{2\pi s} = \frac25\mu_0Cs^{3/2}.$$

Alternativa **(g)**.`,
          medidas: [1, 2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' }],
        etapas: [
          { titulo: 'Corrente', texto: r`$I_\text{env} = \frac45\pi Cs^{5/2}$.`, passo: 0 },
          { titulo: 'Campo', texto: r`$B = \frac25\mu_0Cs^{3/2}$.`, passo: 1 },
        ],
        resultado: r`$B = \dfrac25\mu_0Cs^{3/2}$: alternativa **(g)**.`,
        errosComuns: [
          r`Usar $J\pi s^2$: $J$ varia com $s$.`,
          r`Esquecer o $s'$ do elemento de área e integrar $\sqrt{s'}$: isso leva ao $\frac23$.`,
        ],
        oficial: { resposta: '(g)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac23\mu_0C\sqrt s$`, porque: r`Integra $\sqrt{s'}$, sem o $s'$ do elemento de área.` },
        { letra: 'b', texto: r`$\dfrac{1}{5\pi}\mu_0Cs^{3/2}$`, porque: r`A potência está certa, mas o fator não.` },
        { letra: 'c', texto: r`$\mu_0Cs^{3/2}$`, porque: r`Falta o fator $\frac25$ da integral.` },
        { letra: 'd', texto: r`$\mu_0C\sqrt s$`, porque: r`Potência de $s$ errada.` },
        { letra: 'e', texto: r`$\dfrac{\mu_0}{2\pi}C\sqrt s$`, porque: r`Potência de $s$ errada.` },
        { letra: 'f', texto: '0, pois dentro de um condutor os campos são sempre zero.', porque: r`Isso vale para o campo elétrico em equilíbrio, não para $\vec B$ com corrente.` },
        { letra: 'g', texto: r`$\dfrac25\mu_0Cs^{3/2}$`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 10 ───────────────────────── */
    {
      id: 'obj10',
      numero: '10',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Circuito que cresce num campo que cai',
      resumo: 'A área ganha do campo: o fluxo cresce com √t.',
      enunciado: r`Considere um circuito circular, situado no plano $z = 0$, de raio não estacionário $R(t) = C\sqrt t$ ($C = \text{const} > 0$), imerso totalmente em um campo magnético uniforme, não estacionário $\vec B(t) = \dfrac{D}{\sqrt t}\hat z$ ($D = \text{const} > 0$). Olhando para o circuito de cima (ou seja, a partir de $z\to+\infty$), qual é o sentido da força eletromotriz induzida e o seu módulo, respectivamente, para um instante $t > 0$?`,
      figura: { pagina: 2, recorte: [0.77, 0.02, 0.99, 0.75] },
      cena: {
        escala: 0.01,
        extensao: 12,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, 0, 26], alvo: [0, 0, 0] },
        tempo: { escala: 0.5, unidade: 's', passo: 0.0005, duracao: 3 },
      },
      parametros: [
        { id: 'Cc', rotulo: 'Constante do raio', simbolo: 'C', valor: 0.04, unidade: 'm/√s', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'Dd', rotulo: 'Constante do campo', simbolo: 'D', valor: 1, unidade: 'T·√s', min: 0.2, max: 2, passo: 0.1 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 1, unidade: 's', min: 0.2, max: 3, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, `Dd/sqrt(${T})`], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', raio: `Cc*sqrt(${T})`, rotulo: 'circuito' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Raio', simbolo: 'R', expr: `Cc*sqrt(${T})`, unidade: 'm' },
        { rotulo: 'Campo', simbolo: 'B', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: `Dd/sqrt(${T})` },
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `pi*Cc^2*Dd*sqrt(${T})` },
        { rotulo: 'fem (positiva: anti-horária)', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: `0-pi*Cc^2*Dd/(2*sqrt(${T}))` },
      ],
      graficos: [
        {
          titulo: 'Fluxo e fem no tempo',
          tipo: 'tempo',
          janela: 3,
          series: [
            { rotulo: 'Φ', expr: "fluxoB('S')", unidade: 'Wb' },
            { rotulo: 'fem', expr: "fem('S')", unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'O fluxo',
          previsao: { pergunta: 'O campo cai, e a área cresce. O fluxo…', opcoes: ['cresce', 'cai', 'fica constante'], correta: 0 },
          texto: r`$$\Phi_B = B\pi R^2 = \frac{D}{\sqrt t}\pi C^2t = \pi C^2D\sqrt t.$$

A área cresce com $t$, mais rápido do que o campo cai: o fluxo **aumenta**.`,
          medidas: [1, 2],
        },
        {
          titulo: 'A fem',
          texto: r`$$\mathcal E = -\frac{d\Phi_B}{dt} = -\frac{\pi C^2D}{2\sqrt t}.$$

O módulo diminui com o tempo, embora o fluxo continue crescendo.`,
          medidas: [3],
        },
        {
          titulo: 'O sentido',
          texto: r`O fluxo cresce ao longo de $+\hat z$. Pela lei de Lenz, a corrente cria campo em $-\hat z$ no interior: visto de cima, sentido **horário**.

Alternativa **(h)**.`,
          parametros: { t0: 1 },
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Faraday e de Lenz', lab: 'faraday' }],
        etapas: [
          { titulo: 'Fluxo', texto: r`$\Phi_B = \pi C^2D\sqrt t$.`, passo: 0 },
          { titulo: 'fem', texto: r`$|\mathcal E| = \pi C^2D/2\sqrt t$.`, passo: 1 },
          { titulo: 'Sentido', texto: r`Fluxo crescendo em $+\hat z$: horário.`, passo: 2 },
        ],
        resultado: r`Horário e $\dfrac{\pi C^2D}{2\sqrt t}$: alternativa **(h)**.`,
        errosComuns: [
          r`Olhar só o campo, que cai, e concluir que o sentido é anti-horário: o que importa é o fluxo.`,
          r`Esquecer o $\pi$ da área do círculo: isso leva às alternativas sem $\pi$.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: r`anti-horário e $\dfrac{\pi C^2D}{2\sqrt t}$`, porque: r`O módulo está certo, mas o fluxo cresce: o sentido é horário.` },
        { letra: 'b', texto: r`horário e $\dfrac{C^2D}{\sqrt t}$`, porque: r`Falta o $\pi$ da área e o $\frac12$ da derivada.` },
        { letra: 'c', texto: r`anti-horário e $\dfrac{C^2D}{\sqrt t}$`, porque: r`Sentido e módulo errados.` },
        { letra: 'd', texto: r`horário e $\dfrac{\pi C^2D\sqrt t}{2}$`, porque: r`A derivada de $\sqrt t$ é $1/2\sqrt t$.` },
        { letra: 'e', texto: r`anti-horário e $\dfrac{\pi C^2D\sqrt t}{2}$`, porque: r`Sentido e derivada errados.` },
        { letra: 'f', texto: r`horário e $\dfrac{C^2D}{2\sqrt t}$`, porque: r`Falta o $\pi$ da área.` },
        { letra: 'g', texto: r`anti-horário e $\dfrac{C^2D}{2\sqrt t}$`, porque: r`Sentido errado, e falta o $\pi$.` },
        { letra: 'h', texto: r`horário e $\dfrac{\pi C^2D}{2\sqrt t}$`, correta: true, porque: r`Correta.` },
      ],
    },
  ],
}

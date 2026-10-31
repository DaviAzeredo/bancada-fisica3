import type { ObjetoInput, ProvaInput } from '../../scenario/schema'
import { bezier, condutorOco, pol } from './modelos.ts'

const r = String.raw

/* Objetiva 1: V(x) do enunciado, com V constante fora de 1 < x/L < 4. */
const Vf = (u: string, v = `(${u})`) =>
  `${v}/L < 1 ? 2*V0 : (${v}/L < 2 ? V0*(1 + ${v}/L) : (${v}/L < 3 ? V0*(1 + 2*(3 - ${v}/L)^2) : V0))`
const Ef = 'x/L < 1 || x/L > 4 ? [0,0,0] : (x/L < 2 ? [0-V0/L,0,0] : (x/L < 3 ? [4*V0/L*(3-x/L),0,0] : [0,0,0]))'

/* Objetiva 3: condutor esférico; pontas das curvas ficam logo dentro do metal. */
const A = 0.04
const B = 0.08
const Am = A * 1.001
const Bm = B * 0.999
const oco = condutorOco(A, B)
const curvas: Record<string, [number, number, number][]> = {
  c1: bezier(pol(Bm, 40), pol(1.3 * B, 38), pol(1.65 * B, 46)),
  c2: bezier(pol(Bm, 115), pol(1.5 * B, 125), pol(Bm, 135)),
  c3: bezier(pol(1.6 * B, 230), [-0.0736, -0.0435, 0], pol(Bm, 190)),
  c4: bezier(pol(1.65 * B, 262), pol(1.35 * B, 270), pol(Bm, 270)),
  c5: bezier(pol(Am, 185), pol((A + B) / 2, 180), pol(Bm, 188)),
  c6: bezier(pol(Bm, 320), pol((A + B) / 2, 338), pol(Am, 330)),
  c7: bezier(pol(Am, 215), pol(0.55 * A, 230), pol(Am, 245)),
  c8: bezier(pol(0.18 * A, 45), pol(0.6 * A, 45), pol(Am, 45)),
}
/** V(início) − V(fim); abaixo de 1 kV (contra ~100 GV) é arredondamento. */
const dV = (id: string) => {
  const c = curvas[id]
  const [a, b] = [c[0], c[c.length - 1]]
  const d = `V(${a[0]},${a[1]},0) - V(${b[0]},${b[1]},0)`
  return `abs(${d}) < 1e3 ? 0 : ${d}`
}

/* Objetiva 4 (III): ρ = ρ₀(1 + cos θ); a parte uniforme é uma esfera, a outra vem da solução em l = 1. */
const Rr = 'max(mag([x,y,z]), 1e-12)'
const Dd = 'rho0*Rb^4/(12*eps0)'
const Ecos =
  `${Rr} < Rb ? rho0/eps0*[x*y/(4*${Rr}), y*y/(4*${Rr}) - (Rb/3 - ${Rr}/4), z*y/(4*${Rr})]` +
  ` : ${Dd}*(3*y*[x,y,z]/${Rr}^5 - [0,1,0]/${Rr}^3)`
const Vcos = `${Rr} < Rb ? rho0/eps0*y*(Rb/3 - ${Rr}/4) : ${Dd}*y/${Rr}^3`

/* Objetiva 4 (I): linha com λ(z) não uniforme, em 16 trechos. */
const linha: ObjetoInput[] = Array.from({ length: 16 }, (_, i) => {
  const y0 = -0.12 + i * 0.015
  return {
    id: `l${i}`,
    tipo: 'segmentoCarga' as const,
    ativo: 'caso==1',
    lambda: `lam0*(1 + 0.8*sin(pi*${(y0 + 0.0075).toFixed(4)}/0.12))`,
    a: [0, y0, 0],
    b: [0, y0 + 0.015, 0],
  }
})

/**
 * P1 de Física III, 2026/1, diurno, versão A. Conferida com os gabaritos
 * oficiais de 08/04/2026: objetivas 1a, 2f, 3b, 4b, 5b; D1 e D2. O cabeçalho
 * impresso traz a data 2025-09-15, que parece erro de digitação; fica de fora.
 */
export const p1_2026_1_diurno: ProvaInput = {
  id: 'p1-2026-1-diurno',
  titulo: 'P1 · 2026/1 · Diurno',
  subtitulo: 'Física III · Primeira Prova · Versão A',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Do gráfico de V(x) ao campo',
      resumo: 'Ler a inclinação de V e achar E_x em cada trecho.',
      enunciado: r`Numa região, o potencial eletrostático depende só de $x$, como no gráfico: $V/V_0$ sobe de 2 a 3 em $1 < x/L < 2$, cai de 3 a 1 numa curva que achata em $2 < x/L < 3$, e fica em 1 até $x/L = 4$. Qual alternativa melhor representa a componente $E_x$, com $E_0$ constante positiva?`,
      figura: [
        { pagina: 1, recorte: [0.1, 0.49, 0.51, 0.895] },
        { pagina: 1, recorte: [0.555, 0.375, 0.74, 0.9] },
        { pagina: 2, recorte: [0.1, 0.09, 0.31, 0.475] },
      ],
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [5, 2, 21], alvo: [5, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'Escala do potencial', simbolo: 'V_0', valor: 10, unidade: 'V', min: 5, max: 20, passo: 1 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'xP', rotulo: 'Posição da sonda', simbolo: 'x', valor: 0.03, unidade: 'm', min: 0.021, max: 0.079, passo: 0.001 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: Ef, potencial: Vf('x') },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'sonda' },
        { id: 't1', tipo: 'rotulo', pos: ['L', -0.03, 0], texto: 'x = L' },
        { id: 't2', tipo: 'rotulo', pos: ['2*L', -0.03, 0], texto: '2L' },
        { id: 't3', tipo: 'rotulo', pos: ['3*L', -0.03, 0], texto: '3L' },
        { id: 't4', tipo: 'rotulo', pos: ['4*L', -0.03, 0], texto: '4L' },
      ],
      visual: { setasE: true, densidade: 23, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo na sonda', simbolo: 'E_x', expr: 'x(E(xP, 0, 0))', unidade: 'V/m', teoria: `-((${Vf('xP + 1e-7')}) - (${Vf('xP - 1e-7')}))/2e-7` },
        { rotulo: 'Em unidades de E₀ = V₀/L', simbolo: 'E_x/E_0', expr: 'x(E(xP, 0, 0))*L/V0' },
        { rotulo: 'Potencial na sonda', simbolo: 'V', expr: 'V(xP, 0, 0)', unidade: 'V', teoria: Vf('xP') },
      ],
      graficos: [
        {
          titulo: 'V(x) do enunciado',
          tipo: 'perfil',
          x: { variavel: 'xx', de: 'L', ate: '4*L', rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(xx, 0, 0)', unidade: 'V' }],
        },
        {
          titulo: 'E_x(x) = −dV/dx',
          tipo: 'perfil',
          x: { variavel: 'xx', de: 'L', ate: '4*L', rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'E_x', expr: 'x(E(xx, 0, 0))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'O campo é menos a inclinação',
          texto: r`Como $V$ só depende de $x$:

$$E_x = -\frac{dV}{dx}.$$

Onde $V$ sobe, $E_x < 0$; onde cai, $E_x > 0$; onde é plano, $E_x = 0$. O valor de $V$ não importa, só a inclinação. Arraste a sonda e compare com os dois gráficos.`,
        },
        {
          titulo: 'Trecho 1 < x/L < 2: reta subindo',
          texto: r`$V$ sobe $V_0$ em uma distância $L$, com inclinação constante:

$$E_x = -\frac{V_0}{L} = -E_0.$$

Valor constante e negativo: todas as setas apontam para a esquerda, com o mesmo tamanho.`,
          parametros: { xP: 0.03 },
          medidas: [0, 1],
        },
        {
          titulo: 'Trecho 2 < x/L < 3: queda que achata',
          previsao: { pergunta: r`Em $2 < x/L < 3$, o campo $E_x$ é…`, opcoes: ['positivo', 'negativo', 'nulo'], correta: 0 },
          texto: r`$V$ cai, então $E_x > 0$. A queda é forte logo depois de $x = 2L$ e some em $x = 3L$: o campo começa grande e diminui até zero.

A cena usa $V/V_0 = 1 + 2(3 - x/L)^2$, que tem esse formato e dá $E_x/E_0 = 4(3 - x/L)$: uma reta de 4 a 0.`,
          parametros: { xP: 0.05 },
          medidas: [0, 1],
        },
        {
          titulo: 'Trecho 3 < x/L < 4: patamar',
          texto: r`$V$ constante significa $E_x = 0$, mesmo com $V = V_0 \neq 0$. Campo nulo não quer dizer potencial nulo.`,
          parametros: { xP: 0.07 },
          medidas: [0, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$-E_0$ no primeiro trecho, positivo e decrescendo até 0 no segundo, zero no terceiro: alternativa **(a)**.`,
          parametros: { xP: 0.03 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo como gradiente do potencial', lab: 'potencial' },
          { texto: 'Leitura de inclinação em gráfico' },
        ],
        etapas: [
          { titulo: 'Relação entre E e V', texto: r`Com $V = V(x)$, $\vec E = -\nabla V$ tem só a componente $E_x = -dV/dx$.`, passo: 0 },
          { titulo: 'Reta com inclinação positiva', texto: r`Em $1 < x/L < 2$, $dV/dx = V_0/L$, logo $E_x = -E_0$, com $E_0 = V_0/L$.`, passo: 1 },
          { titulo: 'Queda até o patamar', texto: r`Em $2 < x/L < 3$, $dV/dx < 0$ e seu módulo diminui até zero: $E_x$ é positivo e decresce até 0.`, passo: 2 },
          { titulo: 'Patamar', texto: r`Em $3 < x/L < 4$, $dV/dx = 0$ e $E_x = 0$.`, passo: 3 },
        ],
        resultado: r`Alternativa **(a)**.`,
        errosComuns: [
          r`Copiar o desenho de $V(x)$ como se fosse $E_x$.`,
          r`Esquecer o sinal de menos em $E_x = -dV/dx$: a alternativa (e) é o campo com o sinal trocado.`,
          r`Concluir que $E_x = 0$ em $1 < x/L < 2$ por $V$ ser uma reta. Reta inclinada dá campo constante, não nulo.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$E_x/E_0 = -1$ em $1 < x/L < 2$; cai de 4 a 0 em $2 < x/L < 3$; nulo em $3 < x/L < 4$.`, correta: true, porque: r`Correta: é $-dV/dx$ em cada trecho.` },
        { letra: 'b', texto: r`Mesmo formato de $V(x)$: sobe de 2 a 3, cai até 1 e fica constante.`, porque: r`É o gráfico do potencial, não o da sua inclinação.` },
        { letra: 'c', texto: r`Nulo em $1 < x/L < 2$; cai de 4 a 0 em $2 < x/L < 3$; nulo depois.`, porque: r`Acerta os dois últimos trechos, mas uma reta inclinada tem derivada constante, não nula.` },
        { letra: 'd', texto: r`Formato de $-V(x)$: desce de $-2$ a $-3$, sobe até $-1$ e fica constante.`, porque: r`Troca derivada por sinal: $\vec E$ é $-\nabla V$, não $-V$.` },
        { letra: 'e', texto: r`$+1$ em $1 < x/L < 2$; sobe de $-4$ a 0 em $2 < x/L < 3$; nulo depois.`, porque: r`É $+dV/dx$: o formato está certo, mas falta o sinal de menos.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Trabalho por dois caminhos',
      resumo: 'Partícula negativa levada ao longo das linhas de campo.',
      enunciado: r`Uma partícula de carga $-7\,\text{C}$ está num campo eletrostático cujas linhas apontam, na figura, para a direita. Ela é levada do ponto inicial $a$ ao ponto final $b$, mais à frente nas linhas. Determine o sinal de $V(b) - V(a)$ e o do trabalho da força eletrostática ao longo dos caminhos $C_1$ e $C_2$.`,
      figura: { pagina: 2, recorte: [0.06, 0.49, 0.51, 0.765] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'E0', rotulo: 'Campo', simbolo: 'E', valor: 1000, unidade: 'V/m', min: 200, max: 2000, passo: 100 },
        { id: 'qp', rotulo: 'Carga da partícula', simbolo: 'q', valor: -7, unidade: 'C', min: -10, max: 10, passo: 1 },
      ],
      objetos: [
        { id: 'E', tipo: 'campoE', valor: ['E0', 0, 0] },
        { id: 'C1', tipo: 'caminho', pontos: bezier([-0.03, -0.015, 0], [0.005, -0.025, 0], [0.03, 0.01, 0]), rotulo: 'C₁' },
        { id: 'C2', tipo: 'caminho', pontos: bezier([-0.03, -0.015, 0], [-0.015, 0.05, 0], [0.03, 0.01, 0]), rotulo: 'C₂' },
        { id: 'ta', tipo: 'rotulo', pos: [-0.034, -0.02, 0], texto: 'a' },
        { id: 'tb', tipo: 'rotulo', pos: [0.034, 0.014, 0], texto: 'b' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Variação do potencial', simbolo: 'V(b) - V(a)', expr: 'V(0.03, 0.01, 0) - V(-0.03, -0.015, 0)', unidade: 'V', teoria: '-E0*0.06' },
        { rotulo: 'Trabalho em C₁ (integral de linha)', simbolo: r`q\int_{C_1}\vec E\cdot d\vec\ell`, expr: "qp*intE('C1')", unidade: 'J', teoria: 'qp*E0*0.06' },
        { rotulo: 'Trabalho em C₂ (integral de linha)', simbolo: r`q\int_{C_2}\vec E\cdot d\vec\ell`, expr: "qp*intE('C2')", unidade: 'J', teoria: 'qp*E0*0.06' },
      ],
      passos: [
        {
          titulo: 'O potencial cai ao longo das linhas',
          texto: r`Ao andar no sentido de $\vec E$, o potencial diminui: $dV = -\vec E\cdot d\vec\ell$. O ponto $b$ está à frente de $a$ nas linhas, então

$$V(b) - V(a) < 0.$$

Isso não depende da carga da partícula: $V$ é propriedade do campo.`,
          medidas: [0],
        },
        {
          titulo: 'O sinal do trabalho',
          texto: r`O trabalho da força eletrostática é

$$W = q\int_a^b \vec E\cdot d\vec\ell = -q\,[V(b) - V(a)].$$

Com $q < 0$ e $V(b) < V(a)$: $W = -(-7)\cdot(\text{negativo}) < 0$. A força aponta contra o campo, ou seja, contra o deslocamento.`,
          destacar: ['C1'],
          medidas: [0, 1],
        },
        {
          titulo: 'Caminho longo, mesmo trabalho',
          previsao: { pergunta: r`$C_2$ é mais longo que $C_1$. O trabalho em $C_2$ é…`, opcoes: ['maior em módulo', 'igual', 'menor em módulo'], correta: 1 },
          texto: r`A força eletrostática é conservativa: o trabalho só depende dos extremos. As duas integrais de linha, feitas ponto a ponto na cena, dão o mesmo valor.`,
          destacar: ['C2'],
          medidas: [1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$V(b) - V(a) < 0$ e $W[C_1] = W[C_2] < 0$: alternativa **(f)**. Mude $q$ para um valor positivo: o trabalho troca de sinal, e o potencial não.`,
          medidas: [0, 1, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial decresce ao longo das linhas de campo', lab: 'potencial' },
          { texto: 'Força conservativa e trabalho', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Sinal de ΔV', texto: r`$V(b) - V(a) = -\int_a^b\vec E\cdot d\vec\ell$. Indo a favor das linhas, a integral é positiva: $V(b) - V(a) < 0$.`, passo: 0 },
          { titulo: 'Sinal do trabalho', texto: r`$W = -q[V(b) - V(a)]$. Com $q = -7\,\text{C}$: $W < 0$.`, passo: 1 },
          { titulo: 'Independência do caminho', texto: r`O campo eletrostático é conservativo: $W[C_1] = W[C_2]$.`, passo: 2 },
        ],
        resultado: r`$V(b) - V(a) < 0$ e $W[C_1] = W[C_2] < 0$: alternativa **(f)**.`,
        errosComuns: [
          r`Achar que o sinal da carga muda o sinal de $V(b) - V(a)$. Ele só muda o do trabalho.`,
          r`Achar que o caminho mais longo dá mais trabalho: isso vale para atrito, não para força conservativa.`,
          r`Confundir o trabalho da força elétrica com o do agente externo, que tem sinal oposto.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$V(b) - V(a) > 0$, $W[C_2] > W[C_1] > 0$`, porque: r`Erra os dois sinais e ainda faz o trabalho depender do caminho.` },
        { letra: 'b', texto: r`$V(b) - V(a) > 0$, $W[C_1] = W[C_2] < 0$`, porque: r`O trabalho está certo, mas o potencial **cai** a favor das linhas.` },
        { letra: 'c', texto: r`$V(b) - V(a) = 0$, $W[C_1] = W[C_2] = 0$`, porque: r`Valeria se $a$ e $b$ estivessem na mesma equipotencial; aqui $b$ está à frente nas linhas.` },
        { letra: 'd', texto: r`$V(b) - V(a) > 0$, $W[C_1] = W[C_2] > 0$`, porque: r`Sinais trocados nos dois resultados: é o que sairia andando contra as linhas.` },
        { letra: 'e', texto: r`$V(b) - V(a) < 0$, $W[C_1] = W[C_2] > 0$`, porque: r`Valeria para carga positiva. Com $q < 0$ a força aponta contra o deslocamento.` },
        { letra: 'f', texto: r`$V(b) - V(a) < 0$, $W[C_1] = W[C_2] < 0$`, correta: true, porque: r`Correta: $V$ cai a favor das linhas e $W = -q\,\Delta V$ é negativo para $q < 0$, igual nos dois caminhos.` },
        { letra: 'g', texto: r`$V(b) - V(a) < 0$, $W[C_2] > W[C_1] > 0$`, porque: r`O potencial está certo, mas o campo eletrostático é conservativo e $q < 0$ dá trabalho negativo.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quais curvas não são linhas de campo?',
      resumo: 'Oito curvas em volta de um condutor oco com partícula na cavidade.',
      enunciado: r`A figura é um corte plano de um condutor oco isolado, em equilíbrio, com carga total $-3\,\text{C}$; na cavidade há uma partícula de carga $1\,\text{C}$. Também aparecem 8 curvas orientadas. Qual(is) delas, nitidamente, **não** pode(m) representar linha(s) de campo elétrico do sistema?`,
      figura: { pagina: 2, recorte: [0.51, 0.195, 0.985, 0.6] },
      cena: { escala: 0.01, extensao: 15, unidade: 'cm', plano: 'xy', camera: { pos: [4, 5, 32], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'qp', rotulo: 'Carga da partícula', simbolo: 'q', valor: 1, unidade: 'C', min: 1, max: 1 },
        { id: 'Qc', rotulo: 'Carga do condutor', simbolo: 'Q_c', valor: -3, unidade: 'C', min: -3, max: -3 },
        { id: 'xq', rotulo: 'Posição da partícula', simbolo: 'x_p', valor: 0, unidade: 'm', min: 0, max: 0 },
      ],
      objetos: [
        { id: 'cond', tipo: 'esfera', Q: 0, centro: [0, 0, 0], raio: B, raioInterno: A },
        { id: 'qp', tipo: 'carga', q: 'qp', pos: ['xq', 0, 0], rotulo: '1 C' },
        { id: 'ind', tipo: 'campoE', valor: oco.campo, potencial: oco.potencial },
        ...Object.entries(curvas).map(([id, pontos]) => ({ id, tipo: 'caminho' as const, pontos, rotulo: id.slice(1) })),
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy', fontes: ['qp', 'ind'] },
      medidas: [
        { rotulo: 'Curva 1: V(início) − V(fim)', simbolo: r`\Delta V_1`, expr: dV('c1'), unidade: 'V' },
        { rotulo: 'Curva 2: V(início) − V(fim)', simbolo: r`\Delta V_2`, expr: dV('c2'), unidade: 'V', teoria: 0 },
        { rotulo: 'Curva 3: V(início) − V(fim)', simbolo: r`\Delta V_3`, expr: dV('c3'), unidade: 'V' },
        { rotulo: 'Curva 4: V(início) − V(fim)', simbolo: r`\Delta V_4`, expr: dV('c4'), unidade: 'V' },
        { rotulo: 'Curva 5: V(início) − V(fim)', simbolo: r`\Delta V_5`, expr: dV('c5'), unidade: 'V', teoria: 0 },
        { rotulo: 'Curva 6: V(início) − V(fim)', simbolo: r`\Delta V_6`, expr: dV('c6'), unidade: 'V', teoria: 0 },
        { rotulo: 'Curva 7: V(início) − V(fim)', simbolo: r`\Delta V_7`, expr: dV('c7'), unidade: 'V', teoria: 0 },
        { rotulo: 'Curva 8: V(início) − V(fim)', simbolo: r`\Delta V_8`, expr: dV('c8'), unidade: 'V' },
      ],
      passos: [
        {
          titulo: 'Três regras e as cargas',
          texto: r`Uma linha de campo eletrostático:

1. vai sempre de potencial maior para menor, então $V(\text{início}) - V(\text{fim}) > 0$;
2. não existe dentro do metal, onde $\vec E = 0$;
3. chega ao condutor **perpendicular** à superfície, que é equipotencial.

Por Gauss, a face interna tem $-1\,\text{C}$ e a externa $-2\,\text{C}$. Fora, então, o campo aponta **para** o condutor.`,
        },
        {
          titulo: 'Curvas 5 e 6: dentro do metal',
          texto: r`As duas correm dentro do condutor, onde não há campo: não há setas ali, e $\Delta V = 0$ de ponta a ponta. **Não podem** ser linhas.`,
          destacar: ['c5', 'c6'],
          medidas: [4, 5],
        },
        {
          titulo: 'Curvas 2 e 7: saem e voltam à mesma superfície',
          texto: r`Cada uma começa e termina no mesmo condutor, que é equipotencial. Uma linha de campo teria de terminar em potencial menor: impossível. Na cena, $\Delta V = 0$ nas duas. **Não podem** ser linhas.`,
          destacar: ['c2', 'c7'],
          medidas: [1, 6],
        },
        {
          titulo: 'Curva 1: sentido errado',
          texto: r`A face externa tem carga negativa: as linhas **chegam** a ela. A curva 1 sai dela, indo para potencial maior, e $\Delta V_1 < 0$. **Não pode** ser linha.`,
          destacar: ['c1'],
          medidas: [0],
        },
        {
          titulo: 'Curvas 3 e 4: chegar perpendicular',
          previsao: { pergunta: 'A curva 3 chega à superfície quase tangente. Ela pode ser linha de campo?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`As duas têm $\Delta V > 0$, mas isso não basta. Se $\vec E$ tivesse componente ao longo da superfície, as cargas do condutor se moveriam: em equilíbrio ele é perpendicular a ela.

A curva 4 chega em ângulo reto e **pode** ser linha. A curva 3 chega quase tangente e **não pode**.`,
          destacar: ['c3', 'c4'],
          medidas: [2, 3],
        },
        {
          titulo: 'Curva 8 e resposta',
          texto: r`A curva 8 vai da partícula positiva até a face interna negativa, chegando perpendicular: **pode** ser linha.

Não podem: 1, 2, 3, 5, 6 e 7. Alternativa **(b)**.`,
          destacar: ['c8'],
          medidas: [7],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutor em equilíbrio', lab: 'gauss' },
          { texto: 'Linhas de campo e equipotenciais', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Cargas nas superfícies', texto: r`Gauss no metal: $Q_\text{int} = -1\,\text{C}$. Conservação: $Q_\text{ext} = -3 - (-1) = -2\,\text{C}$. Fora, as linhas chegam ao condutor.`, passo: 0 },
          { titulo: 'Dentro do metal', texto: r`$\vec E = 0$ no metal: 5 e 6 estão descartadas.`, passo: 1 },
          { titulo: 'Mesma superfície', texto: r`Linha de campo liga potenciais diferentes: 2 e 7 começam e terminam na mesma equipotencial.`, passo: 2 },
          { titulo: 'Sentido e ângulo', texto: r`1 sai de uma superfície negativa; 3 chega quase tangente. Sobram 4 e 8, que chegam perpendiculares e no sentido certo.`, passo: 4 },
        ],
        resultado: r`Não podem ser linhas: 1, 2, 3, 5, 6 e 7. Alternativa **(b)**.`,
        errosComuns: [
          r`Julgar o sentido da curva 1 pela carga $-3\,\text{C}$ sem separar as faces. Aqui dá o mesmo sinal, mas o raciocínio deve passar pela face externa.`,
          r`Aceitar a curva 3 só por ela ir no sentido certo. A linha também tem de ser perpendicular à superfície.`,
          r`Aceitar curvas no metal por ligarem as duas faces: o metal não tem campo em equilíbrio.`,
        ],
        oficial: { resposta: '(b)', observacao: r`Na cena o condutor é esférico; as regras usadas não dependem da forma.` },
      },
      alternativas: [
        { letra: 'a', texto: 'Somente a 3.', porque: r`A 3 está errada, mas também as curvas no metal e as que voltam à mesma superfície.` },
        { letra: 'b', texto: 'Somente a 1, 2, 3, 5, 6 e 7.', correta: true, porque: r`Correta: só 4 e 8 respeitam sentido, perpendicularidade e $\vec E = 0$ no metal.` },
        { letra: 'c', texto: 'Somente a 1, 2, 3, 4, 7 e 8.', porque: r`Descarta 4 e 8, que são válidas, e aceita 5 e 6, que estão dentro do metal.` },
        { letra: 'd', texto: 'Somente a 2, 5, 6 e 7.', porque: r`Faltam a 1 (sentido errado) e a 3 (chega tangente).` },
        { letra: 'e', texto: 'Somente a 5 e a 6.', porque: r`São só as do metal. Faltam as que voltam à mesma superfície e as de sentido ou ângulo errado.` },
        { letra: 'f', texto: 'Somente a 4 e a 8.', porque: r`É o contrário: 4 e 8 são exatamente as que **podem** ser linhas.` },
        { letra: 'g', texto: 'Somente a 2 e a 7.', porque: r`Faltam as curvas no metal, a 1 e a 3.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quando Gauss basta para achar E',
      resumo: 'Linha com λ(z), casca com σ(t) e bola com ρ(θ).',
      enunciado: r`Considere: (I) um fio retilíneo infinito sobre o eixo $z$, com densidade linear estacionária não uniforme $\lambda(z)$; (II) uma casca esférica fina, de carga total $Q$ e centro fixo, com raio variável, de modo que $\sigma(t)$ é uniforme mas não estacionária; (III) uma bola esférica fixa, com densidade estacionária não uniforme que varia com um ângulo, $\rho(\theta)$. Para qual(is) podemos deduzir, via simetria e lei de Gauss, o vetor campo elétrico num ponto arbitrário?`,
      figura: [
        { pagina: 2, recorte: [0.505, 0.805, 0.965, 0.89] },
        { pagina: 3, recorte: [0.08, 0.09, 0.5, 0.625] },
      ],
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [6, 5, 27], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) linha com λ(z)' },
            { valor: 2, rotulo: '(II) casca com σ(t)' },
            { valor: 3, rotulo: '(III) bola com ρ(θ)' },
          ],
        },
        { id: 'lam0', rotulo: 'Densidade média', simbolo: r`\lambda_0`, valor: 2e-9, unidade: 'C/m', min: 2e-9, max: 2e-9 },
        { id: 'Q', rotulo: 'Carga da casca', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: 1e-9, max: 4e-9, passo: 1e-10 },
        { id: 'Rt', rotulo: 'Raio da casca, R(t)', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.01, max: 0.09, passo: 0.005 },
        { id: 'rho0', rotulo: 'Densidade da bola', simbolo: r`\rho_0`, valor: 1e-6, unidade: 'C/m³', min: 1e-6, max: 1e-6 },
        { id: 'Rb', rotulo: 'Raio da bola', simbolo: 'R_b', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
      ],
      objetos: [
        ...linha,
        { id: 'tl', tipo: 'rotulo', ativo: 'caso==1', pos: [0.014, 0.075, 0], texto: 'λ(z)' },
        { id: 'G1', tipo: 'gaussiana', ativo: 'caso==1', forma: 'cilindro', centro: [0, 0, 0], eixo: 'y', raio: 0.03, altura: 0.08, rotulo: 'S' },
        { id: 'casca', tipo: 'esfera', ativo: 'caso==2', Q: 'Q', centro: [0, 0, 0], raio: 'Rt', oca: true, rotulo: 'σ(t)' },
        { id: 'G2', tipo: 'gaussiana', ativo: 'caso==2', forma: 'esfera', centro: [0, 0, 0], raio: 0.06, rotulo: 'S' },
        { id: 'bola', tipo: 'esfera', ativo: 'caso==3', Q: 'rho0*4/3*pi*Rb^3', centro: [0, 0, 0], raio: 'Rb' },
        { id: 'cos', tipo: 'campoE', ativo: 'caso==3', valor: Ecos, potencial: Vcos },
        { id: 'tb', tipo: 'rotulo', ativo: 'caso==3', pos: [0.03, 0.04, 0], texto: 'ρ = ρ₀(1 + cos θ)' },
        { id: 'G3', tipo: 'gaussiana', ativo: 'caso==3', forma: 'esfera', centro: [0, 0, 0], raio: 0.06, rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'caso==1', expr: "fluxo('G1')", unidade: 'V·m', teoria: "Qenc('G1')/eps0" },
        { rotulo: 'E em S, 3 cm acima do meio', simbolo: 'E_+', ativo: 'caso==1', expr: 'mag(E(0.03, 0.03, 0))', unidade: 'V/m' },
        { rotulo: 'E em S, 3 cm abaixo do meio', simbolo: 'E_-', ativo: 'caso==1', expr: 'mag(E(0.03, -0.03, 0))', unidade: 'V/m' },
        { rotulo: 'Componente axial em S', simbolo: 'E_z', ativo: 'caso==1', expr: 'y(E(0.03, 0.03, 0))', unidade: 'V/m' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'caso==2', expr: "fluxo('G2')", unidade: 'V·m', teoria: 'Rt < 0.06 ? Q/eps0 : 0' },
        { rotulo: 'E no topo de S', simbolo: 'E_\\text{topo}', ativo: 'caso==2', expr: 'mag(E(0, 0.06, 0))', unidade: 'V/m', teoria: 'Rt < 0.06 ? k0*Q/0.06^2 : 0' },
        { rotulo: 'E no lado de S', simbolo: 'E_\\text{lado}', ativo: 'caso==2', expr: 'mag(E(0.06, 0, 0))', unidade: 'V/m', teoria: 'Rt < 0.06 ? k0*Q/0.06^2 : 0' },
        { rotulo: 'Fluxo por S', simbolo: r`\oint\vec E\cdot d\vec A`, ativo: 'caso==3', expr: "fluxo('G3')", unidade: 'V·m', teoria: "Qenc('G3')/eps0" },
        { rotulo: 'E no topo de S', simbolo: 'E_\\text{topo}', ativo: 'caso==3', expr: 'mag(E(0, 0.06, 0))', unidade: 'V/m', teoria: `k0*rho0*4/3*pi*Rb^3/0.06^2 + 2*${Dd}/0.06^3` },
        { rotulo: 'E na base de S', simbolo: 'E_\\text{base}', ativo: 'caso==3', expr: 'mag(E(0, -0.06, 0))', unidade: 'V/m', teoria: `k0*rho0*4/3*pi*Rb^3/0.06^2 - 2*${Dd}/0.06^3` },
      ],
      passos: [
        {
          titulo: 'Gauss sempre vale, mas nem sempre resolve',
          texto: r`$\oint\vec E\cdot d\vec A = Q_\text{int}/\varepsilon_0$ vale para qualquer distribuição. Só que é uma integral: para tirar $E$ de dentro dela, é preciso uma superfície onde, **por simetria**, $E$ tenha módulo constante e direção conhecida.

Sem isso, conhecemos o fluxo, mas não o campo ponto a ponto.`,
          parametros: { caso: 1 },
        },
        {
          titulo: '(I) Linha com λ(z): sem simetria de translação',
          texto: r`Se $\lambda$ varia com $z$, os pontos do fio não são equivalentes. O campo tem componente ao longo de $z$ e muda de uma altura para outra.

A cena confere: o fluxo por $S$ ainda bate com $Q_\text{int}/\varepsilon_0$, mas $E$ difere acima e abaixo do meio. **Não dá.**`,
          parametros: { caso: 1 },
          destacar: ['G1'],
          medidas: [0, 1, 2, 3],
        },
        {
          titulo: '(II) Casca com σ(t) uniforme: dá',
          previsao: { pergunta: 'O raio da casca varia no tempo. Ainda há simetria esférica a cada instante?', opcoes: ['Sim', 'Não'], correta: 0 },
          texto: r`A cada instante a carga está uniforme numa esfera: a simetria é esférica, mesmo com $R$ mudando. Numa gaussiana esférica concêntrica, $E$ tem o mesmo módulo em todo ponto e é radial:

$$E(r) = \begin{cases} 0, & r < R(t) \\ k_0Q/r^2, & r > R(t). \end{cases}$$

Mova o raio e veja a gaussiana passar de envolver $Q$ para não envolver nada.`,
          parametros: { caso: 2 },
          destacar: ['G2'],
          medidas: [4, 5, 6],
        },
        {
          titulo: '(III) Bola com ρ(θ): direção privilegiada',
          texto: r`Com $\rho$ dependendo de $\theta$, a bola tem uma direção especial: ela deixa de ser igual em todas as direções. Em $S$ o campo varia de ponto a ponto e não é radial.

A cena usa $\rho = \rho_0(1 + \cos\theta)$: mesmo raio, mas $E$ no topo e na base são bem diferentes. **Não dá.**`,
          parametros: { caso: 3 },
          destacar: ['G3'],
          medidas: [7, 8, 9],
        },
        {
          titulo: 'Resposta',
          texto: r`Somente a (II): alternativa **(b)**.`,
          parametros: { caso: 2 },
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss e o papel da simetria', lab: 'gauss' },
        ],
        etapas: [
          { titulo: 'O que Gauss exige', texto: r`Para extrair $\vec E$ é preciso uma superfície onde $E$ seja constante e paralelo a $d\vec A$ (ou perpendicular a ele nas outras partes).`, passo: 0 },
          { titulo: '(I)', texto: r`$\lambda(z)$ quebra a invariância por translação em $z$. Não há gaussiana adequada.`, passo: 1 },
          { titulo: '(II)', texto: r`Densidade uniforme numa esfera dá simetria esférica a cada instante.`, passo: 2 },
          { titulo: '(III)', texto: r`$\rho(\theta)$ quebra a simetria esférica. Não há gaussiana adequada.`, passo: 3 },
        ],
        resultado: r`Somente a (II): alternativa **(b)**.`,
        errosComuns: [
          r`Dizer que Gauss "não vale" em (I) e (III). Ele vale; o que falta é simetria para isolar $E$.`,
          r`Descartar (II) por ela variar no tempo. A simetria é a cada instante, e a questão é sobre ela.`,
          r`Aceitar (III) por a bola ter forma esférica. O que conta é a simetria da **distribuição**, não a da forma.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Somente a III.', porque: r`Em (III) a densidade depende de $\theta$: não há simetria esférica. E (II) tem.` },
        { letra: 'b', texto: 'Somente a II.', correta: true, porque: r`Correta: só (II) tem a simetria que permite isolar $E$ na integral.` },
        { letra: 'c', texto: 'Nenhuma delas.', porque: r`(II) tem simetria esférica a cada instante.` },
        { letra: 'd', texto: 'Somente a I e a III.', porque: r`São exatamente as duas sem simetria suficiente.` },
        { letra: 'e', texto: 'Somente a I.', porque: r`$\lambda(z)$ não uniforme quebra a simetria do fio infinito.` },
        { letra: 'f', texto: 'Todas elas.', porque: r`Gauss vale para todas, mas só em (II) ele determina $\vec E$.` },
        { letra: 'g', texto: 'Somente a I e a II.', porque: r`(II) sim, mas (I) não: com $\lambda(z)$, $E$ varia ao longo da gaussiana.` },
        { letra: 'h', texto: 'Somente a II e a III.', porque: r`(II) sim, mas (III) não: $\rho(\theta)$ quebra a simetria esférica.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Casca cilíndrica condutora neutra',
      resumo: 'Densidades nas faces interna e externa com uma linha no eixo.',
      enunciado: r`Uma casca condutora, neutra, cilíndrica circular, oca e muito longa tem raios interno $a$ e externo $b$. No seu eixo há uma reta com densidade linear constante $\lambda$. Em equilíbrio, quais são as densidades superficiais $\sigma_a$ e $\sigma_b$ nas faces interna e externa?`,
      figura: { pagina: 3, recorte: [0.5, 0.095, 0.93, 0.48] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', plano: 'xy', camera: { pos: [7, 8, 26], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam', rotulo: 'Densidade da reta', simbolo: r`\lambda`, valor: 5e-9, unidade: 'C/m', min: -8e-9, max: 8e-9, passo: 5e-10 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.03, max: 0.055, passo: 0.005 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.07, unidade: 'm', min: 0.065, max: 0.09, passo: 0.005 },
      ],
      objetos: [
        { id: 'lin', tipo: 'linhaInfinita', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', rotulo: 'λ' },
        { id: 'fa', tipo: 'cilindroInfinito', lambda: '0-lam', ponto: [0, 0, 0], direcao: 'z', raio: 'a', oco: true },
        { id: 'fb', tipo: 'cilindroInfinito', lambda: 'lam', ponto: [0, 0, 0], direcao: 'z', raio: 'b', oco: true },
        { id: 'Gm', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: '(a+b)/2', altura: 0.06, rotulo: 'S no metal' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga por metro dentro de S', simbolo: r`\lambda_\text{env}`, expr: "eps0*fluxo('Gm')/0.06", unidade: 'C/m', teoria: 0 },
        { rotulo: 'Na face interna: −ε₀E logo antes de a', simbolo: r`\sigma_a`, expr: '-eps0*x(E(0.999*a, 0, 0))', unidade: 'C/m²', teoria: '-lam/(2*pi*a)' },
        { rotulo: 'Na face externa: ε₀E logo depois de b', simbolo: r`\sigma_b`, expr: 'eps0*x(E(1.001*b, 0, 0))', unidade: 'C/m²', teoria: 'lam/(2*pi*b)' },
      ],
      passos: [
        {
          titulo: 'Gaussiana dentro do metal',
          texto: r`Tome um cilindro coaxial de altura $h$, com a superfície lateral no metal. Lá $\vec E = 0$; nas bases o campo é paralelo a elas. O fluxo é nulo:

$$\lambda h + 2\pi a h\,\sigma_a = 0 \quad\Rightarrow\quad \sigma_a = -\frac{\lambda}{2\pi a}.$$`,
          destacar: ['Gm', 'fa'],
          medidas: [0, 1],
        },
        {
          titulo: 'Neutralidade',
          texto: r`A casca é neutra, então a carga por comprimento nas faces soma zero:

$$2\pi a\,\sigma_a + 2\pi b\,\sigma_b = 0 \quad\Rightarrow\quad \sigma_b = +\frac{\lambda}{2\pi b}.$$

As densidades têm módulos diferentes: a mesma carga por metro se espalha em circunferências diferentes.`,
          destacar: ['fb'],
          medidas: [2],
        },
        {
          titulo: 'Conferir com o campo perto do metal',
          previsao: { pergunta: 'Fora da casca, o campo é o de uma linha de densidade…', opcoes: ['zero', r`$\lambda$`, r`$-\lambda$`], correta: 1 },
          texto: r`Perto de um condutor, $E = \sigma/\varepsilon_0$. Fora, o campo é $\lambda/2\pi\varepsilon_0 s$; em $s = b$ isso dá $\sigma_b = \lambda/2\pi b$. As medidas usam exatamente isso, e batem com a conta de Gauss.`,
          medidas: [1, 2],
        },
        {
          titulo: 'Resposta',
          texto: r`$\sigma_a = -\dfrac{\lambda}{2\pi a}$ e $\sigma_b = \dfrac{\lambda}{2\pi b}$: alternativa **(b)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Gauss em simetria cilíndrica', lab: 'gauss' },
          { texto: 'Condutor em equilíbrio' },
        ],
        etapas: [
          { titulo: 'Face interna', texto: r`Gaussiana no metal: $\lambda h + 2\pi ah\,\sigma_a = 0$, então $\sigma_a = -\lambda/2\pi a$.`, passo: 0 },
          { titulo: 'Face externa', texto: r`Casca neutra: $2\pi a\sigma_a + 2\pi b\sigma_b = 0$, então $\sigma_b = \lambda/2\pi b$.`, passo: 1 },
        ],
        resultado: r`$\sigma_a = -\dfrac{\lambda}{2\pi a}$, $\sigma_b = \dfrac{\lambda}{2\pi b}$: alternativa **(b)**.`,
        errosComuns: [
          r`Usar $\sigma_a = -\sigma_b$. Quem se cancela é a carga total em cada face, não a densidade.`,
          r`Esquecer a face externa: a casca é neutra, a carga que foi para dentro deixou o oposto fora.`,
          r`Usar $4\pi$ da simetria esférica na área de um cilindro.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\sigma_a = 0$, $\sigma_b = -\dfrac{\lambda}{2\pi b}$`, porque: r`Sem carga na face interna, a gaussiana no metal envolveria $\lambda$ e haveria campo no condutor.` },
        { letra: 'b', texto: r`$\sigma_a = -\dfrac{\lambda}{2\pi a}$, $\sigma_b = \dfrac{\lambda}{2\pi b}$`, correta: true, porque: r`Correta: Gauss no metal dá $\sigma_a$; a neutralidade dá $\sigma_b$.` },
        { letra: 'c', texto: r`$\sigma_a = -\dfrac{\lambda}{4\pi a}$, $\sigma_b = \dfrac{\lambda}{4\pi b}$`, porque: r`A área lateral por comprimento é $2\pi a$, não $4\pi a$.` },
        { letra: 'd', texto: r`$\sigma_a = -\dfrac{\lambda}{2\pi a}$, $\sigma_b = 0$`, porque: r`Com $\sigma_b = 0$ a casca teria carga líquida, mas ela é neutra.` },
        { letra: 'e', texto: r`$\sigma_a = \dfrac{\lambda}{2\pi a}$, $\sigma_b = -\dfrac{\lambda}{2\pi b}$`, porque: r`Sinais trocados: a face interna atrai carga oposta à da reta.` },
      ],
    },

    /* ───────────────────────── Discursiva 1 ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 2.5,
      titulo: 'Anel com λ(θ) = λ₀ sen θ em três quartos',
      resumo: 'Gráfico da densidade, carga total e campo no centro.',
      enunciado: r`Um anel fino de raio $R$ está no plano $z = 0$, centrado em $O$, com densidade linear estacionária $\lambda(\theta) = \lambda_0\sin\theta$ para $0 \le \theta < 3\pi/2$ e $\lambda(\theta) = 0$ para $3\pi/2 \le \theta < 2\pi$, com $\lambda_0$ constante.

(a) Supondo $\lambda_0 > 0$, faça um gráfico detalhado de $\lambda(\theta)\times\theta$ em $0 \le \theta < 2\pi$. (b) Determine a carga total $Q$ no anel. (c) Determine o vetor campo elétrico resultante $\vec E$ no centro $O$.`,
      figura: [
        { pagina: 3, recorte: [0.495, 0.835, 0.97, 0.895] },
        { pagina: 4, recorte: [0.075, 0.1, 0.51, 0.66] },
        { pagina: 4, recorte: [0.535, 0.135, 0.98, 0.19] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [2, 3, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'lam0', rotulo: 'Constante da densidade', simbolo: r`\lambda_0`, valor: 1e-8, unidade: 'C/m', min: -2e-8, max: 2e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio do anel', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.005 },
      ],
      objetos: [
        { id: 'p1', tipo: 'anelCarga', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [0, 180], densidade: 'lam0*sin(theta)', rotulo: 'λ > 0' },
        { id: 'p2', tipo: 'anelCarga', centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [180, 270], densidade: 'lam0*sin(theta)', rotulo: 'λ < 0' },
        { id: 'p3', tipo: 'anelCarga', Q: 0, centro: [0, 0, 0], raio: 'R', normal: 'z', arco: [270, 360] },
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga total (soma dos trechos)', simbolo: 'Q', expr: "carga('p1') + carga('p2')", unidade: 'C', teoria: 'lam0*R' },
        { rotulo: 'Carga no trecho com λ > 0', simbolo: 'Q_+', expr: "carga('p1')", unidade: 'C', teoria: '2*lam0*R' },
        { rotulo: 'Carga no trecho com λ < 0', simbolo: 'Q_-', expr: "carga('p2')", unidade: 'C', teoria: '-lam0*R' },
        { rotulo: 'Componente x em O', simbolo: 'E_x', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: '-lam0/(8*pi*eps0*R)' },
        { rotulo: 'Componente y em O', simbolo: 'E_y', expr: 'y(E(0, 0, 0))', unidade: 'V/m', teoria: '-3*lam0/(16*eps0*R)' },
      ],
      graficos: [
        {
          titulo: 'λ(θ) ao longo do anel',
          tipo: 'perfil',
          x: { variavel: 'th', de: 0, ate: '2*pi', rotulo: 'θ', unidade: 'rad' },
          series: [{ rotulo: 'λ', expr: 'th < 3*pi/2 ? lam0*sin(th) : 0', unidade: 'C/m' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) O gráfico',
          texto: r`Em $0 \le \theta < 3\pi/2$ é o seno: sobe a $\lambda_0$ em $\pi/2$, zera em $\pi$ e desce a $-\lambda_0$ em $3\pi/2$. Depois, salta para zero e fica assim até $2\pi$.

No anel: laranja onde $\lambda > 0$ (metade de cima), azul onde $\lambda < 0$, cinza no quarto sem carga.`,
        },
        {
          item: 'b',
          titulo: '(b) Carga total',
          previsao: { pergunta: 'A carga total do anel é…', opcoes: ['nula', 'positiva', 'negativa'], correta: 1 },
          texto: r`Com $dq = \lambda R\,d\theta$:

$$Q = \int_0^{3\pi/2}\lambda_0\sin\theta\,R\,d\theta = -\lambda_0R\left[\cos\theta\right]_0^{3\pi/2} = \lambda_0R.$$

A metade de cima tem $2\lambda_0R$; o quarto negativo, $-\lambda_0R$.`,
          medidas: [0, 1, 2],
        },
        {
          item: 'c',
          titulo: '(c) Componente x',
          texto: r`Um elemento em $\theta$ cria em $O$ um campo apontando para o lado oposto:

$$d\vec E = -\frac{\lambda_0\sin\theta}{4\pi\varepsilon_0R}\,d\theta\,\hat r.$$

Com $\hat r\cdot\hat x = \cos\theta$:

$$E_x = -\frac{\lambda_0}{4\pi\varepsilon_0R}\int_0^{3\pi/2}\sin\theta\cos\theta\,d\theta = -\frac{\lambda_0}{8\pi\varepsilon_0R}.$$`,
          destacar: ['O'],
          medidas: [3],
        },
        {
          item: 'c',
          titulo: '(c) Componente y e resultado',
          texto: r`Com $\hat r\cdot\hat y = \sin\theta$ e $\sin^2\theta = (1 - \cos2\theta)/2$:

$$E_y = -\frac{\lambda_0}{4\pi\varepsilon_0R}\int_0^{3\pi/2}\sin^2\theta\,d\theta = -\frac{3\lambda_0}{16\varepsilon_0R}.$$

Juntando:

$$\vec E(O) = -\frac{\lambda_0}{16\pi\varepsilon_0R}\,(2\hat x + 3\pi\hat y).$$`,
          destacar: ['O'],
          medidas: [3, 4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de distribuição contínua', lab: 'coulomb' },
          { texto: 'Componentes cartesianas de um versor variável' },
        ],
        etapas: [
          { titulo: '(a) Gráfico', texto: r`Senoide de $0$ a $3\pi/2$ (máximo $\lambda_0$ em $\pi/2$, mínimo $-\lambda_0$ em $3\pi/2$) e zero de $3\pi/2$ a $2\pi$, com salto em $3\pi/2$.`, passo: 0 },
          { titulo: '(b) Carga', texto: r`$Q = \int\lambda\,d\ell = \lambda_0R\int_0^{3\pi/2}\sin\theta\,d\theta = \lambda_0R$.`, passo: 1 },
          { titulo: '(c) Elemento de campo', texto: r`O ponto de observação é o centro, então o raio-vetor da fonte até $O$ é $-R\hat r$ e $d\vec E = -\dfrac{\lambda_0\sin\theta\,d\theta}{4\pi\varepsilon_0R}\hat r$. Como $\hat r$ muda com $\theta$, é preciso integrar as componentes.`, passo: 2 },
          { titulo: '(c) Integrais', texto: r`$\int_0^{3\pi/2}\sin\theta\cos\theta\,d\theta = \tfrac12$ e $\int_0^{3\pi/2}\sin^2\theta\,d\theta = \tfrac{3\pi}{4}$. Logo $E_x = -\dfrac{\lambda_0}{8\pi\varepsilon_0R}$ e $E_y = -\dfrac{3\lambda_0}{16\varepsilon_0R}$.`, passo: 3 },
        ],
        resultado: r`$Q = \lambda_0R$ e $\vec E(O) = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}(2\hat x + 3\pi\hat y)$.`,
        errosComuns: [
          r`Integrar $\hat r$ como se fosse constante. Ele depende de $\theta$: decomponha em $\hat x$ e $\hat y$.`,
          r`Integrar até $2\pi$: de $3\pi/2$ a $2\pi$ a densidade é nula.`,
          r`Esquecer o sinal de menos: o campo em $O$ aponta para longe do elemento positivo.`,
        ],
        oficial: { resposta: r`$Q = \lambda_0R$; $E_x = -\dfrac{\lambda_0}{8\pi\varepsilon_0R}$, $E_y = -\dfrac{3\lambda_0}{16\varepsilon_0R}$, ou $\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}(2\hat x + 3\pi\hat y)$.` },
      },
      respostas: [
        { item: 'a', texto: r`Seno em $[0, 3\pi/2)$ e zero em $[3\pi/2, 2\pi)$`, pontos: 0.4, criterio: r`Formato, extremos $\pm\lambda_0$ e o salto em $3\pi/2$.` },
        { item: 'b', texto: r`$Q = \lambda_0R$`, pontos: 0.6, criterio: r`$dq = \lambda R\,d\theta$ e integral só até $3\pi/2$.` },
        { item: 'c', texto: r`$\vec E = -\dfrac{\lambda_0}{16\pi\varepsilon_0R}(2\hat x + 3\pi\hat y)$`, pontos: 1.5, criterio: 'Elemento de campo, decomposição em componentes e as duas integrais.' },
      ],
    },

    /* ───────────────────────── Discursiva 2 ───────────────────────── */
    {
      id: 'disc2',
      numero: 'D2',
      secao: 'Discursiva',
      pontos: 2.5,
      titulo: 'Potencial e campo de uma haste no eixo',
      resumo: 'Integração do potencial, gradiente e comportamento longe da haste.',
      enunciado: r`Uma haste fina de comprimento $L$ está em $0 \le z \le L$, no eixo $z$, com densidade linear constante $\lambda_0$.

(a) Determine o potencial em $P = (0,0,z)$, com $z > L$ e potencial zero no infinito. (b) Deduza o vetor campo elétrico em $P$. (c) Qual é o comportamento assintótico esperado para o potencial no infinito? Demonstre que ele decorre de (a). (d) Idem para o campo, a partir de (b).`,
      figura: { pagina: 4, recorte: [0.525, 0.21, 0.98, 0.665] },
      cena: { escala: 0.01, extensao: 14, unidade: 'cm', camera: { pos: [17, 7, 6], alvo: [0, 0, 6] } },
      parametros: [
        { id: 'lam0', rotulo: 'Densidade', simbolo: r`\lambda_0`, valor: 5e-9, unidade: 'C/m', min: 1e-9, max: 1e-8, passo: 5e-10 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.03, unidade: 'm', min: 0.02, max: 0.04, passo: 0.005 },
        { id: 'zP', rotulo: 'Posição de P', simbolo: 'z', valor: 0.08, unidade: 'm', min: 0.045, max: 0.13, passo: 0.001 },
      ],
      objetos: [
        { id: 'h', tipo: 'segmentoCarga', lambda: 'lam0', a: [0, 0, 0], b: [0, 0, 'L'], rotulo: 'λ₀' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'P' },
        { id: 'cL', tipo: 'cota', a: [0, 0, 0], b: [0, 0, 'L'], deslocamento: [0, -0.012, 0], rotulo: 'L' },
      ],
      visual: { linhasE: true, densidade: 11 },
      medidas: [
        { rotulo: 'Potencial em P', simbolo: 'V', expr: 'V(0, 0, zP)', unidade: 'V', teoria: '-k0*lam0*ln((zP - L)/zP)' },
        { rotulo: 'Campo em P', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m', teoria: 'k0*lam0*L/(zP*(zP - L))' },
        { rotulo: 'Carga pontual Q em z = 0: potencial', simbolo: 'k_0Q/z', expr: 'k0*lam0*L/zP', unidade: 'V' },
        { rotulo: 'Carga pontual Q em z = 0: campo', simbolo: 'k_0Q/z^2', expr: 'k0*lam0*L/zP^2', unidade: 'V/m' },
        { rotulo: 'V da haste / V da carga pontual', simbolo: 'V z/k_0Q', expr: 'V(0, 0, zP)/(k0*lam0*L/zP)', teoria: '-(zP/L)*ln(1 - L/zP)' },
      ],
      graficos: [
        {
          titulo: 'Potencial no eixo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '1.2*L', ate: '20*L', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'haste', expr: 'V(0, 0, zz)', unidade: 'V' },
            { rotulo: 'k₀Q/z', expr: 'k0*lam0*L/zz', unidade: 'V' },
          ],
        },
        {
          titulo: 'Campo no eixo',
          tipo: 'perfil',
          x: { variavel: 'zz', de: '1.2*L', ate: '20*L', rotulo: 'z', unidade: 'm' },
          series: [
            { rotulo: 'haste', expr: 'z(E(0, 0, zz))', unidade: 'V/m' },
            { rotulo: 'k₀Q/z²', expr: 'k0*lam0*L/zz^2', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Somar os potenciais dos elementos',
          texto: r`Um elemento em $z'$ tem carga $\lambda_0\,dz'$ e está a $z - z'$ de $P$:

$$dV = \frac{1}{4\pi\varepsilon_0}\frac{\lambda_0\,dz'}{z - z'}.$$

Com $u = z - z'$:

$$V(0,0,z) = -\frac{\lambda_0}{4\pi\varepsilon_0}\ln\left(\frac{z-L}{z}\right).$$

Como $(z-L)/z < 1$, o logaritmo é negativo e $V > 0$ para $\lambda_0 > 0$.`,
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Campo pelo gradiente',
          texto: r`Por simetria, no eixo só existe $E_z$:

$$E_z = -\frac{\partial V}{\partial z} = \frac{\lambda_0}{4\pi\varepsilon_0}\frac{L}{z(z-L)}.$$

Com $Q = \lambda_0L$:

$$\vec E(0,0,z) = \frac{1}{4\pi\varepsilon_0}\frac{Q}{z(z-L)}\,\hat z.$$

Arraste $P$: perto da ponta o campo cresce muito, por causa do fator $z - L$.`,
          destacar: ['P'],
          medidas: [1],
        },
        {
          item: 'c',
          titulo: '(c) Potencial longe',
          previsao: { pergunta: 'Muito longe, a haste parece…', opcoes: ['uma linha infinita', 'uma carga pontual', 'um dipolo'], correta: 1 },
          texto: r`Longe, a haste é uma partícula de carga $Q$: espera-se $V \simeq k_0Q/z$, e não só "$V \to 0$".

Escrevendo $V = -\dfrac{\lambda_0}{4\pi\varepsilon_0}\ln(1 - L/z)$ e usando $\ln(1 + x) \simeq x$ com $x = -L/z$:

$$V \simeq \frac{\lambda_0}{4\pi\varepsilon_0}\frac{L}{z} = \frac{1}{4\pi\varepsilon_0}\frac{Q}{z}.$$

A razão medida tende a 1; no gráfico, as curvas se juntam.`,
          parametros: { zP: 0.13 },
          medidas: [0, 2, 4],
        },
        {
          item: 'd',
          titulo: '(d) Campo longe',
          texto: r`Com $z \gg L$, $z - L \simeq z$ e

$$\vec E \simeq \frac{1}{4\pi\varepsilon_0}\frac{Q}{z^2}\,\hat z,$$

o campo de uma carga pontual $Q$.`,
          parametros: { zP: 0.13 },
          medidas: [1, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Potencial de distribuição contínua', lab: 'potencial' },
          { texto: 'Campo como gradiente do potencial', lab: 'potencial' },
          { texto: 'Expansão de ln(1 + x)' },
        ],
        etapas: [
          { titulo: '(a) Integral do potencial', texto: r`$$V = \frac{\lambda_0}{4\pi\varepsilon_0}\int_0^L\frac{dz'}{z - z'} = -\frac{\lambda_0}{4\pi\varepsilon_0}\ln\left(\frac{z-L}{z}\right).$$`, passo: 0 },
          { titulo: '(b) Gradiente', texto: r`Por simetria só há $E_z$, e $E_z = -\partial_zV = \dfrac{k_0\lambda_0L}{z(z-L)}$. Com $Q = \lambda_0L$, $\vec E = \dfrac{k_0Q}{z(z-L)}\hat z$.`, passo: 1 },
          { titulo: '(c) Assintótico de V', texto: r`O limite é zero, mas o comportamento esperado é o de uma carga pontual. De $\ln(1 - L/z) \simeq -L/z$: $V \simeq k_0Q/z$.`, passo: 2 },
          { titulo: '(d) Assintótico de E', texto: r`De $z(z - L) \simeq z^2$: $\vec E \simeq k_0Q/z^2\,\hat z$.`, passo: 3 },
        ],
        resultado: r`$V = -\dfrac{\lambda_0}{4\pi\varepsilon_0}\ln\dfrac{z-L}{z}$; $\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{z(z-L)}\hat z$; longe, os de uma carga pontual $Q$.`,
        errosComuns: [
          r`Responder (c) e (d) só com "tende a zero". O enunciado pede a forma assintótica.`,
          r`Usar $\lambda_0 L/z$ já em (a), como se toda a carga estivesse num ponto.`,
          r`Errar o sinal do logaritmo: como $(z-L)/z < 1$, o termo $-\ln$ é positivo.`,
        ],
        oficial: { resposta: r`$V = -\dfrac{\lambda_0}{4\pi\varepsilon_0}\ln\dfrac{z-L}{z}$; $\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{z(z-L)}\hat z$, com $Q = \lambda_0L$; longe, $V \simeq k_0Q/z$ e $\vec E \simeq k_0Q/z^2\,\hat z$.`, observacao: r`O formulário traz $\ln(1+x) \simeq x - x^2/2$ e o gabarito cita $x + x^2/2$; nos dois casos o termo dominante é $x$, então o resultado não muda.` },
      },
      respostas: [
        { item: 'a', texto: r`$V = -\dfrac{\lambda_0}{4\pi\varepsilon_0}\ln\dfrac{z-L}{z}$`, pontos: 1, criterio: 'Elemento de potencial e integração.' },
        { item: 'b', texto: r`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{z(z-L)}\hat z$`, pontos: 0.5, criterio: r`Só a componente $z$, por simetria, e a derivada de (a).` },
        { item: 'c', texto: r`$V \simeq \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{z}$`, pontos: 0.5, criterio: r`Dizer o esperado e mostrar com a expansão do logaritmo.` },
        { item: 'd', texto: r`$\vec E \simeq \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{z^2}\hat z$`, pontos: 0.5, criterio: r`Dizer o esperado e mostrar a partir de (b).` },
      ],
    },
  ],
}

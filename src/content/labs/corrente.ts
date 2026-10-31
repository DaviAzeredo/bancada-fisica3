import { type LabNovo, MOVIMENTO, r } from './tipos'

/* ───────────────── corrente, resistência e resistividade ───────────────── */

const R1 = '(rho1*L1/(pi*r1^2))'
const R2 = '(rho2*L2/(pi*r2^2))'
const Req = `(modo==1 ? ${R1} : (modo==2 ? ${R1} + ${R2} : ${R1}*${R2}/(${R1} + ${R2})))`
const I1 = `(modo==3 ? Vf/${R1} : Vf/${Req})`
const I2 = `(modo==3 ? Vf/${R2} : Vf/${Req})`
const materiais = [
  { valor: 1.7e-8, rotulo: 'Cobre' },
  { valor: 2.8e-8, rotulo: 'Alumínio' },
  { valor: 1e-7, rotulo: 'Ferro' },
  { valor: 1.1e-6, rotulo: 'Níquel-cromo' },
]

export const corrente: LabNovo = {
  grupo: 'Corrente elétrica',
  cenario: {
    id: 'corrente',
    titulo: 'Corrente, resistência e resistividade',
    resumo: 'R = ρL/A, densidade de corrente, campo no fio e velocidade de deriva.',
    teoria: r`A resistência sai da geometria e do material: $R = \rho L/A$. Dobrar o comprimento dobra $R$; dobrar o raio divide $R$ por 4. Esticar um fio até o dobro do comprimento, mantendo o volume, multiplica $R$ por 4.

Localmente, a lei de Ohm é $\vec J = \vec E/\rho$, com $J = I/A$. E a corrente microscópica é $J = nqv_d$: a velocidade de deriva é minúscula, de fração de milímetro por segundo.

**Em série**, a corrente é a mesma, mas $J$ e $E$ mudam com a seção e o material. **Em paralelo**, a ddp é a mesma, e a corrente prefere o caminho de menor resistência.

O fio 1 engrossa e afina sozinho, e os portadores acompanham: quanto maior $J$, mais depressa eles andam. A escala da animação é só para ver: a deriva real é a da medida.`,
    cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [3, 6, 22], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      { id: 'modo', rotulo: 'Arranjo', valor: 1, opcoes: [{ valor: 1, rotulo: 'Um fio' }, { valor: 2, rotulo: 'Dois em série' }, { valor: 3, rotulo: 'Dois em paralelo' }] },
      { id: 'rho1', rotulo: 'Material do fio 1', valor: 1.1e-6, opcoes: materiais },
      { id: 'rho2', rotulo: 'Material do fio 2', valor: 1.7e-8, opcoes: materiais },
      { id: 'Vf', rotulo: 'ddp aplicada', simbolo: 'V', valor: 0.01, unidade: 'V', min: 0.001, max: 0.05, passo: 0.001 },
      { id: 'L1', rotulo: 'Comprimento do fio 1', simbolo: 'L_1', valor: 0.08, unidade: 'm', min: 0.02, max: 0.1, passo: 0.002 },
      MOVIMENTO,
      { id: 'r1', rotulo: 'Raio do fio 1', simbolo: 'r_1', valor: 0.006, unidade: 'm', min: 0.002, max: 0.012, passo: 0.0005, varre: { periodo: 10, de: 0.003, ate: 0.012, ativo: 'auto==1' } },
      { id: 'L2', rotulo: 'Comprimento do fio 2', simbolo: 'L_2', valor: 0.06, unidade: 'm', min: 0.02, max: 0.1, passo: 0.002 },
      { id: 'r2', rotulo: 'Raio do fio 2', simbolo: 'r_2', valor: 0.01, unidade: 'm', min: 0.002, max: 0.012, passo: 0.0005 },
      { id: 'nel', rotulo: 'Portadores por m³', simbolo: 'n', valor: 8.5e28, unidade: '1/m³', min: 1e28, max: 2e29, passo: 1e27 },
    ],
    objetos: [
      {
        id: 'c1',
        tipo: 'condutor',
        a: ['modo==2 ? 0-L1 : 0-L1/2', 'modo==3 ? 0.03 : 0', 0],
        b: ['modo==2 ? 0 : L1/2', 'modo==3 ? 0.03 : 0', 0],
        raio: 'r1',
        I: I1,
        rotulo: 'fio 1',
      },
      {
        id: 'c2',
        tipo: 'condutor',
        ativo: 'modo>=2',
        a: ['modo==2 ? 0 : 0-L2/2', 'modo==3 ? -0.03 : 0', 0],
        b: ['modo==2 ? L2 : L2/2', 'modo==3 ? -0.03 : 0', 0],
        raio: 'r2',
        I: I2,
        rotulo: 'fio 2',
      },
    ],
    medidas: [
      { rotulo: 'Resistência equivalente', simbolo: r`R`, expr: Req, unidade: 'Ω' },
      { rotulo: 'Corrente no fio 1', simbolo: 'I_1', expr: I1, unidade: 'A' },
      { rotulo: 'Corrente no fio 2', simbolo: 'I_2', expr: I2, unidade: 'A', ativo: 'modo>=2' },
      { rotulo: 'Densidade de corrente no fio 1', simbolo: 'J_1 = I_1/A_1', expr: `${I1}/(pi*r1^2)`, unidade: 'A/m²' },
      { rotulo: 'Densidade de corrente no fio 2', simbolo: 'J_2', expr: `${I2}/(pi*r2^2)`, unidade: 'A/m²', ativo: 'modo>=2' },
      { rotulo: 'Campo no fio 1', simbolo: r`E_1 = \rho_1J_1`, expr: `rho1*${I1}/(pi*r1^2)`, unidade: 'V/m' },
      { rotulo: 'Campo no fio 2', simbolo: r`E_2 = \rho_2J_2`, expr: `rho2*${I2}/(pi*r2^2)`, unidade: 'V/m', ativo: 'modo>=2' },
      { rotulo: 'Velocidade de deriva no fio 1', simbolo: 'v_d = J/ne', expr: `${I1}/(pi*r1^2)/(nel*qe)`, unidade: 'm/s' },
      { rotulo: 'Potência dissipada', simbolo: 'P = V^2/R', expr: `Vf^2/${Req}`, unidade: 'W' },
    ],
    graficos: [
      {
        titulo: 'Resistência em função do raio do fio 1',
        tipo: 'perfil',
        ativo: 'modo==1',
        x: { variavel: 'rs', de: 0.002, ate: 0.012, rotulo: 'r', unidade: 'm', marca: 'r1' },
        series: [{ rotulo: 'R', expr: 'rho1*L1/(pi*rs^2)', unidade: 'Ω' }],
      },
      {
        titulo: 'Potencial ao longo dos fios em série',
        tipo: 'perfil',
        ativo: 'modo==2',
        x: { variavel: 'ss', de: 0, ate: 1, rotulo: 'fração do comprimento total', unidade: '' },
        series: [
          {
            rotulo: 'V',
            expr: `ss*(L1 + L2) < L1 ? Vf - ss*(L1 + L2)*rho1*${I1}/(pi*r1^2) : Vf - L1*rho1*${I1}/(pi*r1^2) - (ss*(L1 + L2) - L1)*rho2*${I2}/(pi*r2^2)`,
            unidade: 'V',
          },
        ],
      },
    ],
    desafios: [
      {
        pergunta: 'Em série, com dois fios do mesmo material, faça $J$ ser quatro vezes maior no fio 1.',
        dica: 'A corrente é a mesma: $J \\propto 1/r^2$.',
        condicao: `auto==0 && modo==2 && abs(rho1 - rho2) < 1e-12 && abs(r2/r1 - 2) < 0.05`,
        sucesso: 'Com a metade do raio, o fio 1 tem um quarto da seção. A corrente é igual, mas a densidade e o campo são 4 vezes maiores.',
      },
      {
        pergunta: 'Em paralelo, faça a corrente se dividir meio a meio com materiais diferentes.',
        condicao: `auto==0 && modo==3 && abs(rho1 - rho2) > 1e-9 && abs(${I1}/${I2} - 1) < 0.05`,
        sucesso: 'Os dois ramos têm a mesma $R$: um material pior pode ser compensado por um fio mais curto ou mais grosso.',
      },
    ],
  },
}

/* ───────────────── circuitos de corrente contínua ───────────────── */

const Rext = '(arranjo==2 ? R1 + R2 : (arranjo==3 ? R1*R2/(R1 + R2) : R1))'

export const contínua: LabNovo = {
  grupo: 'Corrente elétrica',
  cenario: {
    id: 'continua',
    titulo: 'Circuitos de corrente contínua',
    resumo: 'fem, resistência interna, potência e resistores em série e em paralelo.',
    teoria: r`A **fem** $\varepsilon$ é o trabalho não eletrostático por unidade de carga feito pela bateria. Com resistência interna $r$, a ddp nos terminais é $V = \varepsilon - Ir$, menor que a fem quando há corrente.

A corrente é $I = \varepsilon/(R + r)$. A potência entregue à carga, $P = I^2R$, é **máxima quando $R = r$**, e cada valor abaixo do máximo aparece em dois resistores, com $R_1R_2 = r^2$.

Em paralelo, cada ramo novo **diminui** $R_\text{eq}$; numa casa, ligar mais um aparelho aumenta a corrente total. Queimar um ramo faz o contrário.

O resistor $R_1$ varia sozinho: acompanhe o ponto subir até o pico, em $R = r$, e descer.`,
    cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
    parametros: [
      {
        id: 'arranjo',
        rotulo: 'Carga',
        valor: 1,
        opcoes: [
          { valor: 1, rotulo: 'Um resistor' },
          { valor: 2, rotulo: 'Série' },
          { valor: 3, rotulo: 'Paralelo' },
          { valor: 4, rotulo: 'R₂ queimou' },
        ],
      },
      { id: 'fem', rotulo: 'fem da bateria', simbolo: r`\varepsilon`, valor: 12, unidade: 'V', min: 1, max: 24, passo: 0.5 },
      { id: 'rint', rotulo: 'Resistência interna', simbolo: 'r', valor: 2, unidade: 'Ω', min: 0.1, max: 8, passo: 0.1 },
      MOVIMENTO,
      { id: 'R1', rotulo: 'Resistor 1', simbolo: 'R_1', valor: 8, unidade: 'Ω', min: 0.5, max: 30, passo: 0.5, varre: { periodo: 12, ativo: 'auto==1' } },
      { id: 'R2', rotulo: 'Resistor 2', simbolo: 'R_2', valor: 8, unidade: 'Ω', min: 0.5, max: 30, passo: 0.5 },
    ],
    objetos: [{ id: 'c', tipo: 'circuito', modelo: 'R', R: `${Rext} + rint`, fem: 'fem' }],
    medidas: [
      { rotulo: 'Resistência externa', simbolo: r`R_\text{eq}`, expr: Rext, unidade: 'Ω' },
      { rotulo: 'Corrente', simbolo: r`I = \frac{\varepsilon}{R + r}`, expr: "I('c')", unidade: 'A', teoria: `fem/(${Rext} + rint)` },
      { rotulo: 'ddp nos terminais', simbolo: r`V = \varepsilon - Ir`, expr: "fem - I('c')*rint", unidade: 'V', teoria: `fem*${Rext}/(${Rext} + rint)` },
      { rotulo: 'Potência na carga', simbolo: 'P = I^2R', expr: `I('c')^2*${Rext}`, unidade: 'W' },
      { rotulo: 'Potência perdida na bateria', simbolo: 'I^2r', expr: "I('c')^2*rint", unidade: 'W' },
      { rotulo: 'Potência fornecida pela fem', simbolo: r`\varepsilon I`, expr: "fem*I('c')", unidade: 'W', teoria: `I('c')^2*(${Rext} + rint)` },
      { rotulo: 'Rendimento', simbolo: r`\eta = V/\varepsilon`, expr: `${Rext}/(${Rext} + rint)`, unidade: '' },
    ],
    graficos: [
      {
        titulo: 'Potência na carga em função de R',
        tipo: 'perfil',
        x: { variavel: 'rr', de: 0.1, ate: 30, rotulo: 'R', unidade: 'Ω', marca: Rext },
        series: [{ rotulo: 'P(R)', expr: 'fem^2*rr/(rr + rint)^2', unidade: 'W' }],
      },
    ],
    desafios: [
      {
        pergunta: 'Ajuste a carga para a bateria entregar a **potência máxima**.',
        dica: 'Procure o pico do gráfico.',
        condicao: `auto==0 && abs(${Rext}/rint - 1) < 0.03`,
        sucesso: 'Em $R = r$. Só que aí metade da energia fica na própria bateria: o rendimento é de 50%.',
      },
      {
        pergunta: 'Com o paralelo ligado, queime $R_2$. O que acontece com a corrente na bateria e com a ddp nos terminais?',
        condicao: 'arranjo==4',
        sucesso: 'A resistência externa sobe, a corrente cai e a ddp nos terminais aumenta: a perda em $r$ diminuiu.',
      },
    ],
  },
}

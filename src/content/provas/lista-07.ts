import type { ObjetoInput, ProvaInput } from '../../scenario/schema'
import { arcoFio } from './modelos.ts'

const r = String.raw

/** Ponto em polares no plano xy, com raio dado por expressão e ângulo em graus. */
const pt = (R: string, graus: number): [string, string, number] => [`(${R})*${Math.cos((graus * Math.PI) / 180)}`, `(${R})*${Math.sin((graus * Math.PI) / 180)}`, 0]

/* Exercício 8: três arcos de raio a (30°) e três de raio b (90°), ligados por trechos radiais, percorridos no sentido anti-horário. */
const circuito8: ObjetoInput[] = []
{
  const notches = [90, 210, 330]
  notches.forEach((c, k) => {
    circuito8.push(...arcoFio(`ia${k}_`, 'I0', 'a', c - 15, 30, [0, 0, 0], 12))
    circuito8.push({ id: `ro${k}`, tipo: 'fio', I: 'I0', a: pt('a', c + 15), b: pt('b', c + 15) })
    circuito8.push(...arcoFio(`eb${k}_`, 'I0', 'b', c + 15, 90, [0, 0, 0], 18))
    circuito8.push({ id: `ri${k}`, tipo: 'fio', I: 'I0', a: pt('b', c + 105), b: pt('a', c + 105) })
  })
}

/* Exercício 10: reta vinda de +y em x = −R, quarto de círculo até (0, −R) e reta até +x. */
const arco10 = arcoFio('q', 'I0', 'R', 180, 90)

/* Exercício 1: espira A em trechos (para medir a força em cada um) e espira B inteira, logo acima. */
const espiraA = arcoFio('A', 'I0', 'R', 0, 360)

const tri = (k: number): [string, string, number] => {
  const g = (90 + 120 * k) * (Math.PI / 180)
  return [`2*a/sqrt(3)*${Math.cos(g)}`, `2*a/sqrt(3)*${Math.sin(g)}`, 0]
}

export const lista_07: ProvaInput = {
  id: 'lista-07',
  titulo: 'Lista 7 · Leis de Ampère e Biot-Savart',
  subtitulo: 'Física III-A · 2020/1 · gabarito da monitoria',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Fácil',
      titulo: 'Forças entre as espiras de um solenoide',
      resumo: 'Espiras vizinhas se atraem; lados opostos da mesma espira se repelem.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.452] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [9, -10, 8], alvo: [0, 0, 0.5] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio das espiras', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.02, max: 0.06, passo: 0.002 },
        { id: 's', rotulo: 'Distância entre espiras vizinhas', simbolo: 's', valor: 0.012, unidade: 'm', min: 0.005, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        ...espiraA,
        { id: 'B2', tipo: 'espira', I: 'I0', centro: [0, 0, 's'], raio: 'R', normal: 'z', rotulo: 'espira vizinha' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: [0, 0, 's/2'], rotulo: 'eixo' },
      ],
      medidas: [
        { rotulo: 'Força axial na espira A, puxada pela vizinha (+ = atração)', simbolo: r`F_z`, expr: "24*z(forca('A0', 'B2'))", unidade: 'N' },
        { rotulo: 'Força no trecho A₀ pelo trecho oposto (+ = repulsão)', simbolo: r`F_{\text{oposto}}`, expr: "x(forca('A0', 'A12'))", unidade: 'N' },
      ],
      passos: [
        {
          titulo: 'Espiras vizinhas: correntes paralelas',
          texto: r`Num enrolamento compacto, cada trecho de uma espira tem ao lado o trecho da espira vizinha com corrente no **mesmo sentido**. Correntes paralelas se atraem: a força axial na espira A aponta para a vizinha.`,
          destacar: ['B2'],
          medidas: [0],
        },
        {
          titulo: 'Lados opostos: correntes antiparalelas',
          texto: r`Num diâmetro da espira, os dois lados têm correntes em **sentidos opostos**. Correntes antiparalelas se repelem: a força em cada lado aponta para fora, tendendo a abrir a espira.`,
          destacar: ['A0', 'A12'],
          medidas: [1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`Atrativa: as espiras vizinhas carregam correntes paralelas.` },
        { item: '(b)', texto: r`Repulsiva: lados opostos de uma espira carregam correntes antiparalelas.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força entre correntes paralelas e antiparalelas', lab: 'forcas' }],
        etapas: [
          { titulo: 'Vizinhas', texto: r`Trechos lado a lado têm corrente no mesmo sentido: $\vec F = I\,d\vec\ell\times\vec B$ aponta para a outra espira. Atração.`, passo: 0 },
          { titulo: 'Opostos', texto: r`No mesmo diâmetro, as correntes são opostas e a força afasta os lados. Repulsão.`, passo: 1 },
        ],
        resultado: r`(a) atrativa; (b) repulsiva.`,
        errosComuns: ['Achar que espiras "iguais" se repelem por analogia com cargas iguais: para correntes, iguais se atraem.'],
        oficial: { resposta: r`(a) Atrativa; (b) Repulsiva.` },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Médio',
      titulo: 'Campo do elétron no átomo de Bohr',
      resumo: 'A órbita é uma espira com corrente ev/2πa₀: cerca de 12 T no próton.',
      figura: { pagina: 1, recorte: [0.089, 0.453, 0.936, 0.561] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [6, -8, 9], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'v', rotulo: 'Velocidade do elétron', simbolo: 'v', valor: 2.188e6, unidade: 'm/s', min: 5e5, max: 4e6, passo: 1e4 },
        { id: 'a0', rotulo: 'Raio de Bohr', simbolo: 'a_0', valor: 0.53e-10, unidade: 'm', min: 0.53e-10, max: 0.53e-10, passo: 1e-12 },
        { id: 'Rv', rotulo: 'Raio desenhado (escala da cena)', simbolo: 'R_\\text{cena}', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04, passo: 0.001 },
      ],
      objetos: [
        { id: 'orb', tipo: 'espira', I: 'qe*v/(2*pi*a0)', centro: [0, 0, 0], raio: 'Rv', normal: 'z', rotulo: 'órbita (corrente ev/2πa₀)' },
        { id: 'p', tipo: 'carga', q: 'qe', pos: [0, 0, 0], rotulo: 'próton' },
        { id: 'el', tipo: 'carga', q: '0-qe', pos: ['Rv', 0, 0], rotulo: 'elétron' },
      ],
      visual: { setasE: false },
      medidas: [
        { rotulo: 'Corrente da órbita', simbolo: r`I = \frac{ev}{2\pi a_0}`, expr: 'qe*v/(2*pi*a0)', unidade: 'A' },
        {
          rotulo: 'Campo no próton (espira simulada, levada ao raio real por B ∝ 1/R)',
          simbolo: r`B = \frac{\mu_0 I}{2a_0}`,
          expr: "z(Bde('orb', 0, 0, 0))*Rv/a0",
          unidade: 'T',
          teoria: 'mu0*qe*v/(4*pi*a0^2)',
        },
        { rotulo: 'Velocidade de Bohr (Coulomb = centrípeta)', simbolo: r`v = \frac{e}{\sqrt{4\pi\varepsilon_0 m a_0}}`, expr: 'qe/sqrt(4*pi*eps0*me*a0)', unidade: 'm/s' },
      ],
      passos: [
        {
          titulo: 'A órbita como espira',
          texto: r`O elétron passa pelo mesmo ponto $v/2\pi a_0$ vezes por segundo: a corrente média é $I = \dfrac{ev}{2\pi a_0}$. O campo no centro de uma espira é $\mu_0 I/2R$, então
$$B = \frac{\mu_0}{2a_0}\frac{ev}{2\pi a_0} = \frac{\mu_0 e v}{4\pi a_0^2}.$$`,
          medidas: [0, 1],
        },
        {
          titulo: 'Estimar v',
          texto: r`A força de Coulomb faz o papel de centrípeta: $\dfrac{e^2}{4\pi\varepsilon_0 a_0^2} = \dfrac{mv^2}{a_0}$, então $v = \dfrac{e}{\sqrt{4\pi\varepsilon_0 m a_0}} \approx 2{,}19\times10^6$ m/s. Com isso, $B \approx 12{,}5$ T: um campo enorme, maior que o de muitos ímãs de ressonância.`,
          parametros: { v: 2.188e6 },
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$B = \dfrac{\mu_0 I}{2a_0}$ com $I = \dfrac{ev}{2\pi a_0}$: $B = \dfrac{\mu_0 e v}{4\pi a_0^2}$.` },
        { item: '(b)', texto: r`$v = \dfrac{e}{\sqrt{4\pi\varepsilon_0 m a_0}} \approx 2{,}19\times10^6$ m/s, e $B = \dfrac{\mu_0 e^2}{8a_0^2}\sqrt{\dfrac{1}{\pi^3\varepsilon_0 m a_0}} \approx 12{,}5$ T.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo no centro de uma espira', lab: 'trechos' }, { texto: 'Corrente de uma carga em movimento circular' }],
        etapas: [
          { titulo: 'Corrente', texto: r`Uma volta leva $T = 2\pi a_0/v$, então $I = e/T = ev/2\pi a_0$.`, passo: 0 },
          { titulo: 'Campo', texto: r`$B = \mu_0 I/2a_0 = \mu_0 e v/4\pi a_0^2$. O sentido é o da corrente convencional, oposto ao movimento do elétron.`, passo: 0 },
          { titulo: 'Valor', texto: r`$v \approx 2{,}19\times10^6$ m/s dá $B \approx 12{,}5$ T.`, passo: 1 },
        ],
        resultado: r`$B = \dfrac{\mu_0 e v}{4\pi a_0^2} \approx 12{,}5$ T.`,
        errosComuns: ['Usar $I = ev$ sem dividir pelo período.', 'Esquecer que a corrente convencional tem o sentido oposto ao do elétron.'],
        oficial: { resposta: r`(a) $|\vec B| = \mu_0 I/2a_0$, com $I = ev/2\pi a_0$; (b) $|\vec B| = \dfrac{\mu_0 e^2}{8a_0^2}\sqrt{\dfrac{1}{\pi^3\varepsilon_0 m a_0}}$.`, observacao: 'O gabarito deixa a conta numérica para o aluno: dá cerca de 12,5 T.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Fácil',
      titulo: 'Circulação entre três cilindros que se tocam',
      resumo: 'O triângulo abraça um sexto de cada cilindro: Γ = μ₀I/2.',
      figura: { pagina: 1, recorte: [0.089, 0.562, 0.936, 0.797] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -3, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente em cada cilindro', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio dos cilindros', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.001 },
      ],
      objetos: [
        { id: 'c1', tipo: 'cilindroCorrente', ponto: tri(0), direcao: 'z', raio: 'a', I: 'I0', rotulo: 'I' },
        { id: 'c2', tipo: 'cilindroCorrente', ponto: tri(1), direcao: 'z', raio: 'a', I: 'I0', rotulo: 'I' },
        { id: 'c3', tipo: 'cilindroCorrente', ponto: tri(2), direcao: 'z', raio: 'a', I: 'I0', rotulo: 'I' },
        { id: 'C', tipo: 'caminho', pontos: [tri(0), tri(2), tri(1), tri(0)], rotulo: 'C' },
      ],
      medidas: [{ rotulo: 'Circulação de B ao longo de C (sentido horário)', simbolo: r`\Gamma_\mathcal{C}`, expr: "intB('C')", unidade: 'T·m', teoria: '0-mu0*I0/2' }],
      passos: [
        {
          titulo: 'Quanto de cada cilindro fica dentro do triângulo',
          texto: r`Os vértices estão nos eixos, e o ângulo interno do triângulo equilátero é $60°$: dentro de C fica um setor de $60°$ de cada seção, isto é, $\tfrac16$ da corrente de cada cilindro. No total, $I_\text{enc} = 3\cdot\tfrac{I}{6} = \tfrac{I}{2}$.`,
          destacar: ['C'],
        },
        {
          titulo: 'Sinal pela orientação',
          texto: r`As correntes saem do papel. C, como na figura, é percorrida no sentido **horário**, que pela regra da mão direita aponta para dentro do papel. Então
$$\Gamma_\mathcal{C} = -\mu_0\frac{I}{2}.$$`,
          medidas: [0],
        },
      ],
      respostas: [{ item: 'Circulação', texto: r`$\Gamma_\mathcal{C} = -\dfrac{\mu_0 I}{2}$, com C no sentido horário e as correntes saindo do papel.` }],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com corrente distribuída', lab: 'ampere' }],
        etapas: [
          { titulo: 'Corrente envolvida', texto: r`Setor de $60°$ de cada seção: $I/6$ por cilindro, $I/2$ no total.`, passo: 0 },
          { titulo: 'Ampère', texto: r`$\Gamma = \mu_0 I_\text{enc}$ com o sinal da orientação: $-\mu_0 I/2$.`, passo: 1 },
        ],
        resultado: r`$\Gamma_\mathcal{C} = -\mu_0 I/2$.`,
        errosComuns: ['Contar a corrente inteira dos três cilindros ($3\\mu_0 I$).', 'Esquecer o sinal dado pelo sentido da curva.'],
        oficial: { resposta: r`$\Gamma_\mathcal{C} = -\mu_0 I/2$.` },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Fácil',
      titulo: 'Circulação com três espiras',
      resumo: 'Só conta a corrente que atravessa uma superfície limitada por C.',
      figura: [
        { pagina: 1, recorte: [0.089, 0.798, 0.936, 0.844] },
        { pagina: 2, recorte: [0.089, 0.053, 0.936, 0.203] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xz', camera: { pos: [6, 12, 16], alvo: [2, 0, 0] } },
      parametros: [{ id: 'i0', rotulo: 'Corrente i', simbolo: 'i', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 }],
      objetos: [
        { id: 'ei', tipo: 'espira', I: 'i0', centro: [0, 0, 0], raio: 0.02, normal: 'y', rotulo: 'i' },
        { id: 'e5', tipo: 'espira', I: '5*i0', centro: [-0.055, 0, 0.03], raio: 0.015, normal: 'y', rotulo: '5i' },
        { id: 'e4b', tipo: 'espira', I: '4*i0', centro: [0.09, 0, -0.04], raio: 0.015, normal: 'x', rotulo: '4i' },
        {
          id: 'C',
          tipo: 'caminho',
          pontos: [
            [0, -0.03, 0],
            [0, 0.03, 0],
            [0.06, 0.03, 0],
            [0.06, -0.03, 0],
            [0, -0.03, 0],
          ],
          rotulo: 'C',
        },
      ],
      medidas: [{ rotulo: 'Circulação de B ao longo de C', simbolo: r`\Gamma_\mathcal{C}`, expr: "intB('C')", unidade: 'T·m', teoria: 'mu0*i0' }],
      passos: [
        {
          titulo: 'A regra',
          texto: r`Pela lei de Ampère, $\oint_\mathcal{C}\vec B\cdot d\vec\ell = \mu_0 I_\text{enc}$: entra só a corrente que **atravessa** uma superfície limitada por C, com sinal dado pela orientação. Espira que a curva não enlaça não conta, por mais intensa que seja.`,
        },
        {
          titulo: 'Um modelo da figura',
          texto: r`Nesta cena, C atravessa só a espira de corrente $i$; as de $5i$ e $4i$ ficam fora. A circulação medida é $\mu_0 i$, igual ao gabarito, apesar dos campos fortes das outras duas espiras ao longo do caminho.`,
          destacar: ['C', 'ei'],
          medidas: [0],
        },
      ],
      respostas: [{ item: 'Circulação', texto: r`$\Gamma_\mathcal{C} = \mu_0 i$ (só a corrente que atravessa uma superfície limitada por C conta).` }],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère: corrente enlaçada', lab: 'ampere' }],
        etapas: [
          { titulo: 'Enlaçar', texto: r`Conte as espiras que atravessam uma superfície qualquer limitada por C, com o sinal de cada travessia.`, passo: 0 },
          { titulo: 'Somar', texto: r`O saldo do gabarito é $+i$: $\Gamma_\mathcal{C} = \mu_0 i$. Na cena, o modelo põe só a espira $i$ enlaçada e confere numericamente.`, passo: 1 },
        ],
        resultado: r`$\Gamma_\mathcal{C} = \mu_0 i$.`,
        errosComuns: ['Somar todas as correntes do desenho ($10i$).', 'Achar que uma espira próxima, mas não enlaçada, muda a circulação: muda o campo ao longo de C, não a integral.'],
        oficial: { resposta: r`$\Gamma_\mathcal{C} = \mu_0 I$ (com $I = i$).`, observacao: 'Quais espiras a curva enlaça depende dos cruzamentos por cima e por baixo do desenho; a cena é um modelo que reproduz o saldo do gabarito.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Fácil',
      titulo: 'Campo de um cabo coaxial',
      resumo: 'Cresce com s dentro, cai com 1/s entre os condutores e some fora.',
      figura: { pagina: 2, recorte: [0.089, 0.204, 0.936, 0.284] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -3, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.015, unidade: 'm', min: 0.008, max: 0.025, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.045, unidade: 'm', min: 0.035, max: 0.06, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.002, max: 0.065, passo: 0.001 },
      ],
      objetos: [
        { id: 'in', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', I: 'I0', rotulo: 'cilindro (I)' },
        { id: 'out', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'b', raioInterno: '0.97*b', I: '0-I0', rotulo: 'casca (−I)' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      medidas: [
        {
          rotulo: 'Campo em s (componente azimutal)',
          simbolo: r`B_\phi(s)`,
          expr: 'y(B(s, 0, 0))',
          unidade: 'T',
          teoria: 's < a ? mu0*I0*s/(2*pi*a^2) : (s < 0.97*b ? mu0*I0/(2*pi*s) : (s > b ? 0 : y(B(s, 0, 0))))',
        },
      ],
      graficos: [
        {
          titulo: 'B(s) ao longo do raio',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.001, ate: 0.065, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'B', expr: 'y(B(ss, 0, 0))', unidade: 'T' }],
        },
      ],
      passos: [
        { titulo: '(i) Dentro do cilindro', texto: r`Amperiana de raio $s < a$ envolve $I s^2/a^2$: $B\cdot 2\pi s = \mu_0 I s^2/a^2$, então $B = \dfrac{\mu_0 I s}{2\pi a^2}$.`, parametros: { s: 0.008 }, medidas: [0] },
        { titulo: '(ii) Entre os condutores', texto: r`Envolve a corrente inteira do cilindro: $B = \dfrac{\mu_0 I}{2\pi s}$.`, parametros: { s: 0.03 }, medidas: [0] },
        { titulo: '(iii) Fora', texto: r`A casca devolve a corrente: $I_\text{enc} = I - I = 0$ e $\vec B = \vec 0$.`, parametros: { s: 0.058 }, medidas: [0] },
      ],
      respostas: [
        { item: '(i) s < a', texto: r`$\vec B = \dfrac{\mu_0 I s}{2\pi a^2}\,\hat\phi$` },
        { item: '(ii) a < s < b', texto: r`$\vec B = \dfrac{\mu_0 I}{2\pi s}\,\hat\phi$` },
        { item: '(iii) s > b', texto: r`$\vec B = \vec 0$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Simetria', texto: r`$\vec B = B(s)\hat\phi$; amperiana circular de raio $s$ dá $B\cdot 2\pi s = \mu_0 I_\text{enc}(s)$.`, passo: 0 },
          { titulo: 'Corrente envolvida', texto: r`$Is^2/a^2$ dentro, $I$ entre os condutores, $0$ fora.`, passo: 1 },
          { titulo: 'Fora', texto: r`Sem corrente líquida, não há campo: a blindagem do cabo.`, passo: 2 },
        ],
        resultado: r`$\dfrac{\mu_0 I s}{2\pi a^2}\hat\phi$, $\dfrac{\mu_0 I}{2\pi s}\hat\phi$ e $\vec 0$.`,
        errosComuns: ['Usar a corrente inteira dentro do cilindro.', 'Esquecer o sentido $\\hat\\phi$ do vetor.'],
        oficial: { resposta: r`(i) $\dfrac{\mu_0 I r}{2\pi a^2}\hat\phi$; (ii) $\dfrac{\mu_0 I}{2\pi r}\hat\phi$; (iii) $\vec 0$.` },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Cilindro com densidade de corrente variável',
      resumo: 'J = (2I₀/πa²)[1 − (s/a)²]: corrente total I₀ e campo máximo dentro do fio.',
      figura: { pagina: 2, recorte: [0.089, 0.285, 0.936, 0.464] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -3, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente I₀', simbolo: 'I_0', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.03, unidade: 'm', min: 0.015, max: 0.045, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.02, unidade: 'm', min: 0.002, max: 0.065, passo: 0.001 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', J: '2*I0/(pi*a^2)*(1 - (r/a)^2)', rotulo: 'J(s)' },
        { id: 'amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 's', rotulo: 'amperiana' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      medidas: [
        { rotulo: 'Corrente dentro da amperiana', simbolo: r`I_\text{enc}`, expr: "Ienc('amp')", unidade: 'A', teoria: 's < a ? I0*(2*s^2/a^2 - s^4/a^4) : I0' },
        { rotulo: 'Campo em s', simbolo: r`B(s)`, expr: 'y(B(s, 0, 0))', unidade: 'T', teoria: 's <= a ? mu0*I0/(2*pi*a^2)*(2*s - s^3/a^2) : mu0*I0/(2*pi*s)' },
      ],
      graficos: [
        {
          titulo: 'B(s): sobe dentro, cai como 1/s fora',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.001, ate: 0.065, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'B', expr: 'y(B(ss, 0, 0))', unidade: 'T' }],
        },
      ],
      passos: [
        {
          titulo: '(a) Corrente total',
          texto: r`$I = \displaystyle\int_0^a J\,2\pi s\,ds = \frac{4I_0}{a^2}\left[\frac{s^2}{2} - \frac{s^4}{4a^2}\right]_0^a = I_0.$`,
          parametros: { s: 0.04 },
          medidas: [0],
        },
        { titulo: '(b) Fora', texto: r`Envolve $I_0$: $\vec B = \dfrac{\mu_0 I_0}{2\pi s}\hat\phi$, como um fio fino.`, parametros: { s: 0.05 }, medidas: [1] },
        {
          titulo: '(c) Dentro',
          texto: r`$I_\text{enc}(s) = I_0\left(\dfrac{2s^2}{a^2} - \dfrac{s^4}{a^4}\right)$, então
$$\vec B = \frac{\mu_0 I_0}{2\pi a^2}\left(2s - \frac{s^3}{a^2}\right)\hat\phi.$$`,
          parametros: { s: 0.015 },
          medidas: [0, 1],
        },
        { titulo: '(d) O gráfico', texto: r`Em $s = a$ os dois lados dão $\mu_0 I_0/2\pi a$: o campo é contínuo. O gráfico mostra $B$ crescendo dentro e caindo como $1/s$ fora.` },
      ],
      respostas: [
        { item: '(a)', texto: r`$I = I_0$` },
        { item: '(b)', texto: r`$\vec B = \dfrac{\mu_0 I_0}{2\pi s}\hat\phi$, para $s > a$` },
        { item: '(c)', texto: r`$\vec B = \dfrac{\mu_0 I_0}{2\pi a^2}\left(2s - \dfrac{s^3}{a^2}\right)\hat\phi$, para $s \le a$` },
        { item: '(d)', texto: r`Em unidades de $B(a) = \mu_0 I_0/2\pi a$: $2(s/a) - (s/a)^3$ dentro e $a/s$ fora.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Ampère com densidade de corrente variável', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Integrar J', texto: r`$I_\text{enc}(s) = \int_0^s J\,2\pi s'\,ds'$.`, passo: 0 },
          { titulo: 'Ampère', texto: r`$B\cdot2\pi s = \mu_0 I_\text{enc}(s)$, dentro e fora.`, passo: 2 },
        ],
        resultado: r`$I = I_0$; $B = \dfrac{\mu_0 I_0}{2\pi a^2}(2s - s^3/a^2)$ dentro, $\dfrac{\mu_0 I_0}{2\pi s}$ fora.`,
        errosComuns: ['Multiplicar $J$ pela área inteira, como se fosse uniforme.', 'Esquecer o fator $2\\pi s\\,ds$ no elemento de área.'],
        oficial: { resposta: r`(a) $I = I_0$; (b) $\dfrac{\mu_0 I_0}{2\pi r}\hat\phi$; (c) $\dfrac{\mu_0 I_0}{2\pi a^2}\left(2r - \dfrac{r^3}{a^2}\right)\hat\phi$; (d) $B/B(a) = 2(r/a) - (r/a)^3$ dentro e $a/r$ fora.` },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Médio',
      titulo: 'Amperiana fora do centro',
      resumo: 'A lei vale, mas não serve para tirar B: o campo varia ao longo da curva.',
      figura: { pagina: 2, recorte: [0.089, 0.466, 0.936, 0.827] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [8, 9, 12], alvo: [1, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio da amperiana', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.001 },
        { id: 'd', rotulo: 'Distância do centro ao fio', simbolo: 'd', valor: 0.015, unidade: 'm', min: 0, max: 0.025, passo: 0.001 },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', I: 'I0', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'amp', tipo: 'amperiana', centro: ['d', 0, 0], normal: 'y', raio: 'R', arrastavel: true, rotulo: 'C' },
      ],
      medidas: [
        { rotulo: 'Circulação em C', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('amp')", unidade: 'T·m', teoria: 'mu0*I0' },
        { rotulo: 'B no ponto de C mais perto do fio', simbolo: r`B_\text{perto}`, expr: 'mag(B(d - R, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(2*pi*(R - d))' },
        { rotulo: 'B no ponto de C mais longe do fio', simbolo: r`B_\text{longe}`, expr: 'mag(B(d + R, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(2*pi*(R + d))' },
      ],
      passos: [
        {
          titulo: '(a) A intensidade varia',
          texto: r`$B = \mu_0 I/2\pi r$ depende só da distância $r$ ao fio. Os pontos de C estão a distâncias diferentes, de $R - d$ a $R + d$: a intensidade **não** é a mesma.`,
          medidas: [1, 2],
        },
        { titulo: '(b) Não é tangente', texto: r`As linhas de $\vec B$ são círculos centrados no fio. Só coincidem com C quando o centro de C está no fio ($d = 0$).`, parametros: { d: 0.015 } },
        {
          titulo: '(c) Ampère vale, mas não resolve',
          texto: r`A circulação continua $\mu_0 I$ para qualquer $d$: a lei vale. Só que para tirar $B$ da integral é preciso $|\vec B|$ constante e $\vec B$ tangente ao longo da curva. Nesta curva, nenhuma das duas coisas acontece.`,
          medidas: [0],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`Não: $B = \mu_0 I/2\pi r$ e os pontos de C estão a distâncias diferentes do fio.` },
        { item: '(b)', texto: r`Não: só seria tangente se o centro de C coincidisse com o fio.` },
        { item: '(c)', texto: r`Não: a lei vale ($\oint\vec B\cdot d\vec\ell = \mu_0 I$), mas sem $|\vec B|$ constante e tangente ao longo de C não dá para tirar $B$ da integral.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Quando a lei de Ampère calcula o campo', lab: 'ampere' }],
        etapas: [
          { titulo: 'Intensidade', texto: r`Depende de $r$, que varia ao longo de C.`, passo: 0 },
          { titulo: 'Direção', texto: r`$\hat\phi$ em torno do fio, diferente da tangente de C.`, passo: 1 },
          { titulo: 'Usar a lei', texto: r`A igualdade vale, mas $\oint B\cos\alpha\,d\ell$ não se simplifica: a curva é inútil para achar $B$.`, passo: 2 },
        ],
        resultado: r`(a) não; (b) não; (c) não: a lei vale, mas a curva não tem a simetria do campo.`,
        errosComuns: ['Concluir que a lei de Ampère "falha" fora do centro: ela vale para qualquer curva; o que falha é o atalho de tirar $B$ da integral.'],
        oficial: { resposta: r`(a) Não; (b) Não, só com o centro da curva no fio; (c) Não: $B$ não é constante sobre C, e o ângulo entre $\vec B$ e $d\vec\ell$ varia.` },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Circuito de arcos e raios',
      resumo: 'Só os arcos contam: B = (μ₀I/8)(1/a + 3/b).',
      figura: [
        { pagina: 2, recorte: [0.089, 0.828, 0.936, 0.903] },
        { pagina: 3, recorte: [0.08, 0.058, 0.936, 0.278] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [1, -3, 19], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio interno', simbolo: 'a', valor: 0.025, unidade: 'm', min: 0.01, max: 0.04, passo: 0.001 },
        { id: 'b', rotulo: 'Raio externo', simbolo: 'b', valor: 0.06, unidade: 'm', min: 0.045, max: 0.075, passo: 0.001 },
      ],
      objetos: [...circuito8, { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' }],
      visual: { setasB: false },
      medidas: [
        { rotulo: 'Campo em O', simbolo: r`B_z(O)`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/8*(1/a + 3/b)' },
        { rotulo: 'Contribuição de um trecho radial', simbolo: r`B_\text{radial}`, expr: "mag(Bde('ro0', 0, 0, 0))", unidade: 'T', teoria: '0' },
      ],
      passos: [
        { titulo: 'Os raios não contribuem', texto: r`Num trecho radial, $d\vec\ell$ é paralelo ao vetor que vai até O, e $d\vec\ell\times\hat r = 0$.`, destacar: ['ro0', 'ri0'], medidas: [1] },
        {
          titulo: 'Cada arco contribui pelo seu ângulo',
          texto: r`Um arco de ângulo $\alpha$ e raio $R$ dá $\mu_0 I\alpha/4\pi R$ no centro. Os arcos de raio $a$ somam $3\cdot30° = \pi/2$; os de raio $b$, $3\cdot90° = 3\pi/2$. Todos são percorridos no mesmo sentido (anti-horário):
$$B = \frac{\mu_0 I}{4\pi}\left(\frac{\pi/2}{a} + \frac{3\pi/2}{b}\right) = \frac{\mu_0 I}{8}\left(\frac1a + \frac3b\right).$$`,
          medidas: [0],
        },
      ],
      respostas: [{ item: 'Campo em O', texto: r`$\vec B = \dfrac{\mu_0 I}{8}\left(\dfrac1a + \dfrac3b\right)\hat z$` }],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart por trechos: arcos e raios', lab: 'trechos' }],
        etapas: [
          { titulo: 'Raios', texto: r`Contribuição nula.`, passo: 0 },
          { titulo: 'Arcos', texto: r`$\dfrac{\mu_0 I}{4\pi a}\dfrac{\pi}{2} + \dfrac{\mu_0 I}{4\pi b}\dfrac{3\pi}{2}$, para fora do papel ($+\hat z$).`, passo: 1 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0 I}{8}\left(\dfrac1a + \dfrac3b\right)\hat z$.`,
        errosComuns: ['Usar $\\mu_0 I/2R$ (espira completa) para cada arco.', 'Converter os ângulos em graus sem passar a radianos.'],
        oficial: { resposta: r`$\vec B = \dfrac{\mu_0 I}{8}\left(\dfrac1a + \dfrac3b\right)\hat z$.` },
      },
    },

    /* ───────────────────────── 9 ───────────────────────── */
    {
      id: 'e9',
      numero: '9',
      secao: 'Médio',
      titulo: 'Espira quadrada: campo no eixo e dipolo',
      resumo: 'Quatro lados iguais somam no eixo; longe, cai como 1/x³.',
      figura: { pagina: 3, recorte: [0.08, 0.279, 0.936, 0.662] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [12, 7, 9], alvo: [2, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'L', rotulo: 'Lado', simbolo: 'L', valor: 0.05, unidade: 'm', min: 0.02, max: 0.08, passo: 0.002 },
        { id: 'xP', rotulo: 'Posição de P no eixo', simbolo: 'x', valor: 0.04, unidade: 'm', min: 0.005, max: 0.07, passo: 0.001 },
      ],
      objetos: [
        { id: 's1', tipo: 'fio', I: 'I0', a: [0, 'L/2', '0-L/2'], b: [0, 'L/2', 'L/2'] },
        { id: 's2', tipo: 'fio', I: 'I0', a: [0, 'L/2', 'L/2'], b: [0, '0-L/2', 'L/2'] },
        { id: 's3', tipo: 'fio', I: 'I0', a: [0, '0-L/2', 'L/2'], b: [0, '0-L/2', '0-L/2'] },
        { id: 's4', tipo: 'fio', I: 'I0', a: [0, '0-L/2', '0-L/2'], b: [0, 'L/2', '0-L/2'] },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['xP', 0, 0], arraste: { param: 'xP', eixo: 'x' }, rotulo: 'P' },
        { id: 'mu', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: [1, 0, 0], comprimento: '2*cm', rotulo: 'μ' },
      ],
      medidas: [
        { rotulo: 'Momento de dipolo', simbolo: r`\mu = IL^2`, expr: 'I0*L^2', unidade: 'A·m²' },
        { rotulo: 'Componente x de um lado', simbolo: r`B_{1,x}`, expr: "x(Bde('s1', xP, 0, 0))", unidade: 'T', teoria: 'mu0*I0*L^2/(8*pi*(xP^2 + L^2/4)*sqrt(xP^2 + L^2/2))' },
        { rotulo: 'Campo da espira em P', simbolo: r`B_x(P)`, expr: 'x(B(xP, 0, 0))', unidade: 'T', teoria: 'mu0*I0*L^2/(2*pi*(xP^2 + L^2/4)*sqrt(xP^2 + L^2/2))' },
        { rotulo: 'Aproximação de dipolo', simbolo: r`\frac{\mu_0\mu}{2\pi x^3}`, expr: 'mu0*I0*L^2/(2*pi*xP^3)', unidade: 'T' },
      ],
      graficos: [
        {
          titulo: 'Campo no eixo: exato × dipolo',
          tipo: 'perfil',
          x: { variavel: 'xx', de: 0.01, ate: 0.07, rotulo: 'x', unidade: 'm', marca: 'xP' },
          series: [
            { rotulo: 'B exato', expr: 'x(B(xx, 0, 0))', unidade: 'T' },
            { rotulo: 'dipolo', expr: 'mu0*I0*L^2/(2*pi*xx^3)', unidade: 'T' },
          ],
        },
      ],
      passos: [
        { titulo: '(a) Momento de dipolo', texto: r`$\vec\mu = I A\,\hat n = IL^2\hat x$: a corrente gira no sentido anti-horário visto de $+x$.`, destacar: ['mu'], medidas: [0] },
        {
          titulo: '(b) Um lado',
          texto: r`Um lado de comprimento $L$ fica a $\rho = \sqrt{x^2 + L^2/4}$ de P e é visto sob $\sin\theta = \dfrac{L/2}{\sqrt{x^2 + L^2/2}}$ de cada ponta: $B_1 = \dfrac{\mu_0 I}{4\pi\rho}\,2\sin\theta$. Ele aponta perpendicular ao lado; a parte em $x$ é $B_1\cdot\dfrac{L/2}{\rho}$.`,
          destacar: ['s1'],
          medidas: [1],
        },
        {
          titulo: '(c) A espira',
          texto: r`As componentes transversais se cancelam aos pares; as em $x$ somam quatro vezes:
$$B_x = \frac{\mu_0 I L^2}{2\pi\left(x^2 + \frac{L^2}{4}\right)\sqrt{x^2 + \frac{L^2}{2}}}.$$`,
          medidas: [2],
        },
        { titulo: '(d) Longe', texto: r`Para $x \gg L$: $\vec B \approx \dfrac{\mu_0\vec\mu}{2\pi x^3}$, o campo de um dipolo magnético, que cai com $1/x^3$ como o dipolo elétrico.`, parametros: { xP: 0.07 }, medidas: [2, 3] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec\mu = IL^2\,\hat x$` },
        { item: '(b)', texto: r`Lado vertical direito: $\vec B = \dfrac{\mu_0 I}{4\pi}\dfrac{L}{\left(x^2 + \frac{L^2}{4}\right)\left(x^2 + \frac{L^2}{2}\right)^{1/2}}\left(x\hat y + \dfrac L2\hat x\right)$; os outros lados mudam a componente transversal.` },
        { item: '(c)', texto: r`$\vec B = \dfrac{\mu_0 I L^2}{2\pi\left(x^2 + \frac{L^2}{4}\right)\left(x^2 + \frac{L^2}{2}\right)^{1/2}}\hat x$` },
        { item: '(d)', texto: r`$\vec B \approx \dfrac{\mu_0\vec\mu}{2\pi x^3}$: campo de dipolo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart para fio finito', lab: 'trechos' }, { texto: 'Dipolo magnético', lab: 'forcas' }],
        etapas: [
          { titulo: 'Um lado', texto: r`Fio finito a distância $\rho$, com a componente $x$ projetada por $L/2\rho$.`, passo: 1 },
          { titulo: 'Simetria', texto: r`Transversais se cancelam; $x$ quadruplica.`, passo: 2 },
          { titulo: 'Limite', texto: r`$x \gg L$ dá $\mu_0 IL^2/2\pi x^3$.`, passo: 3 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0 I L^2}{2\pi(x^2 + L^2/4)\sqrt{x^2 + L^2/2}}\hat x \to \dfrac{\mu_0\vec\mu}{2\pi x^3}$.`,
        errosComuns: ['Somar os módulos dos quatro lados, sem cancelar as componentes transversais.'],
        oficial: { resposta: r`(a) $\vec\mu = IL^2\hat x$; (c) $\vec B = \dfrac{\mu_0}{2\pi}\dfrac{\vec\mu}{(x^2 + L^2/4)(x^2 + L^2/2)^{1/2}}$; (d) $\vec B \approx \dfrac{\mu_0}{2\pi}\dfrac{\vec\mu}{x^3}$.` },
      },
    },

    /* ───────────────────────── 10 ───────────────────────── */
    {
      id: 'e10',
      numero: '10',
      secao: 'Médio',
      titulo: 'Fio dobrado em quarto de círculo',
      resumo: 'Duas semirretas e um arco: B = (μ₀I/2R)(1/π + 1/4).',
      figura: [
        { pagina: 3, recorte: [0.08, 0.663, 0.936, 0.894] },
        { pagina: 4, recorte: [0.08, 0.062, 0.936, 0.179] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [2, -3, 20], alvo: [1, -1, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.02, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'v', tipo: 'fio', I: 'I0', a: ['0-R', 0.09, 0], b: ['0-R', 0, 0], infinito: 'a', rotulo: 'I' },
        ...arco10,
        { id: 'h', tipo: 'fio', I: 'I0', a: [0, '0-R', 0], b: [0.09, '0-R', 0], infinito: 'b' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasB: false },
      medidas: [
        { rotulo: 'Campo em O', simbolo: r`B_z(O)`, expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: 'mu0*I0/(2*R)*(1/pi + 1/4)' },
        { rotulo: 'Só as duas semirretas', simbolo: r`\frac{\mu_0 I}{2\pi R}`, expr: "z(Bde('v', 0, 0, 0)) + z(Bde('h', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(2*pi*R)' },
        { rotulo: 'Só o quarto de círculo', simbolo: r`\frac{\mu_0 I}{8R}`, expr: "z(B(0, 0, 0)) - z(Bde('v', 0, 0, 0)) - z(Bde('h', 0, 0, 0))", unidade: 'T', teoria: 'mu0*I0/(8*R)' },
      ],
      passos: [
        { titulo: 'O arco', texto: r`Quarto de círculo: $\dfrac{\mu_0 I}{4\pi R}\cdot\dfrac\pi2 = \dfrac{\mu_0 I}{8R}$.`, medidas: [2] },
        {
          titulo: 'As semirretas',
          texto: r`Cada semirreta termina no pé da perpendicular por O e dá metade do fio infinito: $\dfrac{\mu_0 I}{4\pi R}$. Juntas, $\dfrac{\mu_0 I}{2\pi R}$, **igual a um fio infinito** a uma distância $R$.`,
          destacar: ['v', 'h'],
          medidas: [1],
        },
        { titulo: 'Somar', texto: r`Tudo sai do papel:
$$\vec B = \frac{\mu_0 I}{2R}\left(\frac1\pi + \frac14\right)\hat z.$$`, medidas: [0] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec B = \dfrac{\mu_0 I}{2R}\left(\dfrac1\pi + \dfrac14\right)\hat z$` },
        { item: '(b)', texto: r`Cada semirreta dá $\mu_0 I/4\pi R$; juntas, $\mu_0 I/2\pi R$, o mesmo que um fio infinito à distância $R$: cada uma é "metade" de um fio infinito visto de O.` },
        { item: '(c)', texto: r`Não: a lei de Ampère precisa de simetria de translação ao longo do fio, que a semirreta não tem. Mesmo fora de O, a curva circular em torno de uma semirreta não teria $|\vec B|$ constante.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart por trechos: semirretas e arcos', lab: 'trechos' }],
        etapas: [
          { titulo: 'Superposição', texto: r`Arco $\mu_0 I/8R$ e semirretas $\mu_0 I/4\pi R$ cada, todas para $+\hat z$.`, passo: 0 },
          { titulo: 'Interpretar', texto: r`As duas semirretas juntas reproduzem um fio infinito.`, passo: 1 },
          { titulo: 'Ampère', texto: r`Sem simetria cilíndrica, a lei não isola $B$.`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0 I}{2R}\left(\dfrac1\pi + \dfrac14\right)\hat z$.`,
        errosComuns: ['Usar $\\mu_0 I/2\\pi R$ para cada semirreta (isso é o fio infinito).'],
        oficial: { resposta: r`(a) $\vec B = \dfrac{\mu_0 I}{2R}\left(\dfrac1\pi + \dfrac14\right)\hat z$; (b) sim, cada semirreta dá $\mu_0 I/4\pi R$; (c) não, falta simetria de translação.` },
      },
    },

    /* ───────────────────────── 11 ───────────────────────── */
    {
      id: 'e11',
      numero: '11',
      secao: 'Difícil',
      titulo: 'Placa infinita com corrente',
      resumo: 'Fora, B = μ₀J₀d/2 uniforme; dentro, cresce linearmente com y.',
      figura: { pagina: 4, recorte: [0.08, 0.18, 0.936, 0.516] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -2, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'J0', rotulo: 'Densidade de corrente', simbolo: 'J_0', valor: 2e5, unidade: 'A/m²', min: 2e4, max: 5e5, passo: 1e4 },
        { id: 'd', rotulo: 'Espessura', simbolo: 'd', valor: 0.03, unidade: 'm', min: 0.01, max: 0.05, passo: 0.001 },
        { id: 'w', rotulo: 'Meia-largura da amperiana', simbolo: 'w', valor: 0.03, unidade: 'm', min: 0.01, max: 0.05, passo: 0.001 },
        { id: 'h', rotulo: 'Meia-altura da amperiana', simbolo: 'h', valor: 0.025, unidade: 'm', min: 0.003, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'Bp', tipo: 'campoB', valor: ['abs(y) < d/2 ? 0-mu0*J0*y : 0-mu0*J0*d/2*sign(y)', 0, 0], rotulo: 'campo da placa' },
        { id: 'esp', tipo: 'cota', a: ['0-0.06', '0-d/2', 0], b: ['0-0.06', 'd/2', 0], deslocamento: ['0-0.6*cm', 0, 0], rotulo: 'd' },
        {
          id: 'Amp',
          tipo: 'caminho',
          pontos: [
            ['w', '0-h', 0],
            ['w', 'h', 0],
            ['0-w', 'h', 0],
            ['0-w', '0-h', 0],
            ['w', '0-h', 0],
          ],
          rotulo: 'amperiana',
        },
      ],
      medidas: [
        { rotulo: 'Circulação na amperiana retangular', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "intB('Amp')", unidade: 'T·m', teoria: 'mu0*J0*2*w*min(2*h, d)' },
        { rotulo: 'B fora da placa', simbolo: r`B_\text{fora}`, expr: 'mag(B(0, d, 0))', unidade: 'T', teoria: 'mu0*J0*d/2' },
        { rotulo: 'B dentro, em y = d/4', simbolo: r`B_x(d/4)`, expr: 'x(B(0, d/4, 0))', unidade: 'T', teoria: '0-mu0*J0*d/4' },
      ],
      passos: [
        {
          titulo: '(a) Direção pela simetria',
          texto: r`Placa infinita em $x$ e $z$ com $\vec J = J_0\hat z$: cada fatia é um fio saindo do papel. Somando fios simétricos em torno de $x$, as componentes em $y$ se cancelam e sobra $\vec B \parallel \hat x$: $-\hat x$ acima ($y > 0$) e $+\hat x$ abaixo.`,
        },
        {
          titulo: '(b) Fora',
          texto: r`Retângulo de largura $2w$ que atravessa a placa inteira: os lados verticais não contribuem ($\vec B \perp d\vec\ell$) e cada lado horizontal dá $B\cdot 2w$. Pela lei de Ampère, $2B(2w) = \mu_0 J_0 (2w)d$:
$$B = \frac{\mu_0 J_0 d}{2},$$
independente da distância, como no plano de carga.`,
          parametros: { h: 0.025 },
          medidas: [0, 1],
        },
        {
          titulo: '(c) Dentro',
          texto: r`Com $h < d/2$, a amperiana envolve só a fatia $2h$: $2B(2w) = \mu_0 J_0 (2w)(2|y|)$, então $\vec B = -\mu_0 J_0 y\,\hat x$, linear em $y$ e nulo no plano médio.`,
          parametros: { h: 0.008 },
          medidas: [0, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec B$ paralelo a $\hat x$: $-\hat x$ para $y > 0$ e $+\hat x$ para $y < 0$.` },
        { item: '(b)', texto: r`$B = \dfrac{\mu_0 J_0 d}{2}$ para $|y| > d/2$, com $\vec B = -\dfrac{\mu_0 J_0 d}{2}\dfrac{|y|}{y}\hat x$.` },
        { item: '(c)', texto: r`$\vec B = -\mu_0 J_0 y\,\hat x$ para $|y| \le d/2$.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Ampère com simetria planar', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Simetria', texto: r`$\vec B = B(y)\hat x$, ímpar em $y$.`, passo: 0 },
          { titulo: 'Retângulo', texto: r`Lados verticais não contribuem ($\vec B \perp d\vec\ell$); os horizontais dão $2Bw$ cada.`, passo: 1 },
          { titulo: 'Corrente envolvida', texto: r`$J_0\cdot 2w\cdot d$ fora; $J_0\cdot2w\cdot2|y|$ dentro.`, passo: 2 },
        ],
        resultado: r`$B = \mu_0 J_0 d/2$ fora; $\vec B = -\mu_0 J_0 y\hat x$ dentro.`,
        errosComuns: ['Esperar que o campo caia com a distância: a placa é infinita, como o plano de carga.'],
        oficial: { resposta: r`(a) $-B\hat x$ para $y > 0$ e $+B\hat x$ para $y < 0$; (b) $\vec B = -\dfrac{\mu_0 j_0 d}{2}\dfrac{|y|}{y}\hat x$; (c) $\vec B = -\mu_0 j_0 y\,\hat x$.` },
      },
    },

    /* ───────────────────────── 12 ───────────────────────── */
    {
      id: 'e12',
      numero: '12',
      secao: 'Difícil',
      titulo: 'Fio finito em ângulos θ₁ e θ₂',
      resumo: 'B = (μ₀I/4πd)(cos θ₁ − cos θ₂), com os casos simétrico, infinito e semi-infinito.',
      figura: [
        { pagina: 4, recorte: [0.08, 0.518, 0.936, 0.886] },
        { pagina: 5, recorte: [0.08, 0.062, 0.936, 0.115] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [1, 2, 20], alvo: [0, 2, 0] } },
      parametros: [
        { id: 'modo', rotulo: 'Fio', valor: 1, opcoes: [{ valor: 1, rotulo: 'Finito' }, { valor: 2, rotulo: 'Semi-infinito para −z' }] },
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'd', rotulo: 'Distância de P ao fio', simbolo: 'd', valor: 0.04, unidade: 'm', min: 0.01, max: 0.07, passo: 0.001 },
        { id: 'La', rotulo: 'Ponta esquerda (antes de P)', simbolo: 'L_1', valor: 0.07, unidade: 'm', min: 0.005, max: 0.08, passo: 0.001 },
        { id: 'Lb', rotulo: 'Ponta direita (além de P, < 0 se antes)', simbolo: 'L_2', valor: -0.02, unidade: 'm', min: -0.06, max: 0.08, passo: 0.001 },
      ],
      objetos: [
        { id: 'f', tipo: 'fio', ativo: 'modo==1', I: 'I0', a: ['0-La', 0, 0], b: ['Lb', 0, 0], rotulo: 'I' },
        { id: 'fs', tipo: 'fio', ativo: 'modo==2', I: 'I0', a: [-0.09, 0, 0], b: ['Lb', 0, 0], infinito: 'a', rotulo: 'I' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: [0, 'd', 0], arraste: { param: 'd', eixo: 'y' }, rotulo: 'P' },
      ],
      medidas: [
        {
          rotulo: 'Campo em P (fio finito)',
          simbolo: r`\frac{\mu_0I}{4\pi d}(\cos\theta_1 - \cos\theta_2)`,
          expr: 'z(B(0, d, 0))',
          unidade: 'T',
          teoria: 'mu0*I0/(4*pi*d)*(La/sqrt(La^2 + d^2) + Lb/sqrt(Lb^2 + d^2))',
          ativo: 'modo==1',
        },
        { rotulo: 'Fio infinito, para comparar', simbolo: r`\frac{\mu_0 I}{2\pi d}`, expr: 'mu0*I0/(2*pi*d)', unidade: 'T' },
        {
          rotulo: 'Campo em P (semi-infinito)',
          simbolo: r`\frac{\mu_0I}{4\pi d}(1 - \cos\theta_2)`,
          expr: 'z(B(0, d, 0))',
          unidade: 'T',
          teoria: 'mu0*I0/(4*pi*d)*(1 + Lb/sqrt(Lb^2 + d^2))',
          ativo: 'modo==2',
        },
      ],
      passos: [
        {
          titulo: '(a) Integrar no ângulo',
          texto: r`Com $\theta$ o ângulo entre o fio e a reta até P, o elemento a distância $d/\sin\theta$ dá $dB = \dfrac{\mu_0 I}{4\pi d}\sin\theta\,d\theta$. De $\theta_1$ a $\theta_2$:
$$\vec B = \frac{\mu_0 I}{4\pi d}(\cos\theta_1 - \cos\theta_2)\,\hat\phi.$$
Aqui $\cos\theta_1 = L_1/\sqrt{L_1^2 + d^2}$ e $\cos\theta_2 = -L_2/\sqrt{L_2^2 + d^2}$.`,
          parametros: { modo: 1, La: 0.07, Lb: -0.02 },
          medidas: [0],
        },
        { titulo: '(b) P na mediatriz', texto: r`$\theta_2 = \pi - \theta_1$: $\cos\theta_2 = -\cos\theta_1$ e $B = \dfrac{\mu_0 I}{2\pi d}\cos\theta_1$.`, parametros: { modo: 1, La: 0.05, Lb: 0.05 }, medidas: [0] },
        { titulo: '(c) Fio infinito', texto: r`$\theta_1 \to 0$ e $\theta_2 \to \pi$: $B = \dfrac{\mu_0 I}{2\pi d}$.`, parametros: { modo: 1, La: 0.08, Lb: 0.08 }, medidas: [0, 1] },
        {
          titulo: '(d) Semi-infinito',
          texto: r`Estendendo para $-z$, $\theta_1 \to 0$: $B = \dfrac{\mu_0 I}{4\pi d}(1 - \cos\theta_2)$. Com P na frente da ponta ($\theta_2 = \pi/2$), é metade do fio infinito. Ampère não serve: sem simetria de translação, $|\vec B|$ não é constante numa circunferência em torno do fio.`,
          parametros: { modo: 2, Lb: 0 },
          medidas: [2, 1],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$\vec B = \dfrac{\mu_0 I}{4\pi d}(\cos\theta_1 - \cos\theta_2)\,\hat\phi$` },
        { item: '(b)', texto: r`$\vec B = \dfrac{\mu_0 I}{2\pi d}\cos\theta_1\,\hat\phi$` },
        { item: '(c)', texto: r`$\theta_1 \to 0$, $\theta_2 \to \pi$: $\vec B = \dfrac{\mu_0 I}{2\pi d}\hat\phi$` },
        { item: '(d)', texto: r`$\theta_1 \to 0$: $\vec B = \dfrac{\mu_0 I}{4\pi d}(1 - \cos\theta_2)\hat\phi$; com P na frente da ponta, $\dfrac{\mu_0 I}{4\pi d}$. Ampère não se aplica por falta de simetria de translação.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Biot-Savart para fio finito', lab: 'trechos' }],
        etapas: [
          { titulo: 'Variável angular', texto: r`$z = -d\cot\theta$ e $r = d/\sin\theta$ transformam a integral em $\int\sin\theta\,d\theta$.`, passo: 0 },
          { titulo: 'Casos', texto: r`Simétrico, infinito e semi-infinito saem de limites de $\theta_1$ e $\theta_2$.`, passo: 2 },
        ],
        resultado: r`$\vec B = \dfrac{\mu_0 I}{4\pi d}(\cos\theta_1 - \cos\theta_2)\hat\phi$.`,
        errosComuns: ['Medir $\\theta_2$ pelo lado de dentro do triângulo: na fórmula, os dois ângulos são medidos a partir do sentido $+z$.'],
        oficial: {
          resposta: r`(a) $\dfrac{\mu_0 I}{4\pi d}(\cos\theta_1 - \cos\theta_2)\hat\phi$; (b) $\dfrac{\mu_0 I}{2\pi d}\cos\theta_1\hat\phi$; (c) $\theta_1 \to 0$, $\theta_2 \to \pi$; (d) $\theta_2 \to \pi/2$ e $\theta_1 \to 0$.`,
          observacao: 'No item (d), o gabarito fixa P na frente da ponta ($\\theta_2 = \\pi/2$). Para P qualquer, o resultado é $\\frac{\\mu_0 I}{4\\pi d}(1 - \\cos\\theta_2)$, que volta ao do gabarito nesse caso.',
        },
      },
    },

    /* ───────────────────────── 13 ───────────────────────── */
    {
      id: 'e13',
      numero: '13',
      secao: 'Difícil',
      titulo: 'Fio com um buraco cilíndrico',
      resumo: 'Superposição de dois fios: B = μ₀I/3πR em P₁ e P₂, e uniforme no buraco.',
      figura: { pagina: 5, recorte: [0.08, 0.116, 0.936, 0.473] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -2, 16], alvo: [0, 0.5, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'R', rotulo: 'Raio do fio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.02, max: 0.05, passo: 0.001 },
        { id: 'xq', rotulo: 'Ponto de prova no buraco (x)', simbolo: 'x', valor: 0.008, unidade: 'm', min: -0.015, max: 0.015, passo: 0.001 },
      ],
      objetos: [
        { id: 'cheio', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'R', I: '4*I0/3', rotulo: 'disco cheio (4I/3)' },
        { id: 'buraco', tipo: 'cilindroCorrente', ponto: [0, 'R/2', 0], direcao: 'z', raio: 'R/2', I: '0-I0/3', rotulo: 'buraco (−I/3)' },
        { id: 'P1', tipo: 'sonda', campo: 'B', pos: [0, 'R/2', 0], rotulo: 'P₁' },
        { id: 'P2', tipo: 'sonda', campo: 'B', pos: [0, 'R', 0], rotulo: 'P₂' },
        { id: 'Q', tipo: 'sonda', campo: 'B', pos: ['xq', 'R/2', 0], arraste: { param: 'xq', eixo: 'x' }, rotulo: 'no buraco' },
      ],
      medidas: [
        { rotulo: 'Densidade de corrente', simbolo: r`J = \frac{4I}{3\pi R^2}`, expr: '4*I0/(3*pi*R^2)', unidade: 'A/m²' },
        { rotulo: 'B em P₁ (centro do buraco)', simbolo: r`B(P_1)`, expr: 'mag(B(0, R/2, 0))', unidade: 'T', teoria: 'mu0*I0/(3*pi*R)' },
        { rotulo: 'B em P₂ (borda comum)', simbolo: r`B(P_2)`, expr: 'mag(B(0, R, 0))', unidade: 'T', teoria: 'mu0*I0/(3*pi*R)' },
        { rotulo: 'B num ponto qualquer do buraco', simbolo: r`B(Q)`, expr: 'mag(B(xq, R/2, 0))', unidade: 'T', teoria: 'mu0*I0/(3*pi*R)' },
      ],
      passos: [
        {
          titulo: '(a) Densidade de corrente',
          texto: r`Área da seção: $\pi R^2 - \pi(R/2)^2 = \tfrac34\pi R^2$. Então $J = \dfrac{4I}{3\pi R^2}$.`,
          medidas: [0],
        },
        {
          titulo: 'Dois fios',
          texto: r`O fio com buraco é um cilindro cheio de raio $R$ com corrente $J\pi R^2 = \tfrac43 I$, mais um cilindro de raio $R/2$ com a corrente oposta, $-\tfrac13 I$, no lugar do buraco.`,
          destacar: ['cheio', 'buraco'],
        },
        {
          titulo: '(b) P₁ e P₂',
          texto: r`Em $P_1$, o cilindro pequeno não contribui (é o eixo dele) e o grande dá $\mu_0 J (R/2)/2$. Em $P_2$, $\dfrac{\mu_0(4I/3)}{2\pi R} - \dfrac{\mu_0(I/3)}{2\pi(R/2)}$. Nos dois:
$$B = \frac{\mu_0 I}{3\pi R}.$$
Mova o ponto de prova: o campo é **uniforme** no buraco todo.`,
          medidas: [1, 2, 3],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$J = \dfrac{4I}{3\pi R^2}$` },
        { item: '(b)', texto: r`$B(P_1) = B(P_2) = \dfrac{\mu_0 I}{3\pi R}$ (e o campo é uniforme no buraco).` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Superposição com corrente negativa no buraco', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Área', texto: r`$\tfrac34\pi R^2$ dá $J = 4I/3\pi R^2$.`, passo: 0 },
          { titulo: 'Superposição', texto: r`Cheio ($+J$) mais buraco ($-J$).`, passo: 1 },
          { titulo: 'Dentro do grande', texto: r`$\vec B = \tfrac{\mu_0 J}{2}\hat z\times\vec s$; a diferença dos dois dá campo uniforme $\mu_0 J (R/2)/2$ no buraco.`, passo: 2 },
        ],
        resultado: r`$J = 4I/3\pi R^2$; $B(P_1) = B(P_2) = \mu_0 I/3\pi R$.`,
        errosComuns: ['Dar ao cilindro cheio a corrente $I$, e não $4I/3$.'],
        oficial: { resposta: r`(a) $j = \dfrac{4I}{3\pi R^2}$; (b) $B = \dfrac{\mu_0 I}{3\pi R}$ nos dois pontos.` },
      },
    },
  ],
}

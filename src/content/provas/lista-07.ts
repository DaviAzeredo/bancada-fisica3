import type { ObjetoInput, ProvaInput } from '../../scenario/schema'
import { arcoFio } from './modelos.ts'
import { FORMULARIO_P3 } from '../formularios'

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
  formulario: FORMULARIO_P3,
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
          {
            titulo: '(a) Espiras vizinhas se atraem ou se repelem?',
            texto: r`**O que se pede.** Num solenoide de enrolamento compacto, dizer se a força magnética entre espiras vizinhas é atrativa ou repulsiva, justificando.

**A ideia: correntes paralelas.** Dois fios retos e paralelos com correntes:
- cada um cria em volta de si um campo que circula em torno dele (Biot-Savart, formulário: $d\vec B = \dfrac{\mu_0}{4\pi}\dfrac{I\,d\vec\ell\times\hat r}{r^2}$; para um fio longo, $B = \dfrac{\mu_0I}{2\pi s}$, em círculos, pela regra da mão direita);
- o outro fio, com corrente nesse campo, sofre a força $d\vec F_{(m)} = I\,d\vec\ell\times\vec B$ (formulário).

Fazendo as contas de direção: correntes no **mesmo sentido** se **atraem**; em sentidos **opostos**, se **repelem**. (É o contrário das cargas, em que iguais se repelem.)

**Aplicando.** Num enrolamento compacto, cada pedaço de uma espira tem, logo ao lado, o pedaço correspondente da espira vizinha, com a corrente no **mesmo sentido**: o fio dá voltas sempre girando para o mesmo lado. São como dois fios paralelos com correntes paralelas.

**Resposta.** **Atrativa.** As espiras vizinhas se puxam: um solenoide percorrido por corrente tende a se comprimir ao longo do eixo.`,
            passo: 0,
          },
          {
            titulo: '(b) Lados opostos da mesma espira se atraem ou se repelem?',
            texto: r`**O que se pede.** Dizer se a força magnética entre lados opostos de uma mesma espira é atrativa ou repulsiva.

**A ideia.** A mesma regra do item (a): correntes paralelas se atraem, antiparalelas se repelem.

**Aplicando.** Pegue um diâmetro da espira. Nas duas pontas dele, a corrente circula em sentidos **opostos**: se de um lado ela vai "para cima", do outro vai "para baixo", porque está dando a volta. São como dois fios com correntes **antiparalelas**.

**Resposta.** **Repulsiva.** Os lados opostos se empurram para fora: a espira tende a se **abrir** (a aumentar de raio). Em eletroímãs muito fortes, essa força é capaz de deformar as bobinas.

**Uma conferência pelo campo.** Dentro do solenoide, o campo é axial. Num pedaço do fio, $I\,d\vec\ell$ é tangente à espira e $\vec B$ é ao longo do eixo; o produto vetorial aponta na direção **radial**, para fora: a mesma conclusão.`,
            passo: 1,
          },
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
          {
            titulo: '(a) O campo no próton',
            texto: r`**O que se pede.** A intensidade do campo magnético, na posição do próton (o centro da órbita), produzido pelo elétron que gira com velocidade $v$ num círculo de raio $a_0$, tratado como corrente estacionária.

**Passo 1: a corrente.** Num ponto da órbita passa uma carga $e$ a cada período $T = \dfrac{2\pi a_0}{v}$. A corrente média é
$$I = \frac{e}{T} = \frac{ev}{2\pi a_0}.$$
Como o elétron é negativo, ela circula no sentido **oposto** ao do movimento dele.

**Passo 2: o campo no centro de uma espira circular.** Pela lei de Biot-Savart (formulário):
$$d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec\ell\times\hat r}{r^2}.$$
No centro de uma espira de raio $a_0$, todo pedacinho $d\vec\ell$ está à mesma distância $r = a_0$ e é **perpendicular** ao vetor que vai até o centro. Então $|d\vec\ell\times\hat r| = d\ell$, e todos os $d\vec B$ apontam na mesma direção (perpendicular ao plano da órbita). Somando, com $\oint d\ell = 2\pi a_0$:
$$B = \frac{\mu_0I}{4\pi a_0^2}\cdot2\pi a_0 = \frac{\mu_0I}{2a_0}.$$

**A conta.**
$$B = \frac{\mu_0}{2a_0}\cdot\frac{ev}{2\pi a_0} = \frac{\mu_0ev}{4\pi a_0^2}.$$
A direção é perpendicular ao plano da órbita, com sentido dado pela corrente convencional (oposta ao elétron) pela regra da mão direita.`,
            passo: 0,
          },
          {
            titulo: '(b) O valor numérico',
            texto: r`**O que se pede.** O valor de $B$, estimando $v$ com constantes fundamentais e usando $a_0 = 0{,}53\times10^{-10}$ m.

**Passo 1: a velocidade.** A atração elétrica entre próton e elétron é a força centrípeta do movimento circular:
$$\frac{1}{4\pi\varepsilon_0}\frac{e^2}{a_0^2} = \frac{mv^2}{a_0}\quad\Rightarrow\quad v = \frac{e}{\sqrt{4\pi\varepsilon_0ma_0}}.$$
Com $e = 1{,}6\times10^{-19}$ C, $m = 9{,}1\times10^{-31}$ kg e $\varepsilon_0 = 8{,}85\times10^{-12}$ F/m: $v \approx 2{,}19\times10^6$ m/s.

**Passo 2: o campo.** Pondo $v$ no resultado do item (a):
$$B = \frac{\mu_0ev}{4\pi a_0^2} = \frac{(10^{-7})(1{,}6\times10^{-19})(2{,}19\times10^6)}{(0{,}53\times10^{-10})^2} \approx 12{,}5\ \text{T}.$$
(Usando $\dfrac{\mu_0}{4\pi} = 10^{-7}$ T·m/A.) Em constantes fundamentais, $B = \dfrac{\mu_0e^2}{8a_0^2}\sqrt{\dfrac{1}{\pi^3\varepsilon_0ma_0}}$.

**Para ter noção.** Cerca de 12 tesla, mais que o campo de muitos aparelhos de ressonância magnética (1,5 a 3 T). Dentro do átomo os campos são enormes porque a corrente, de cerca de 1 mA, gira num círculo minúsculo.`,
            passo: 1,
          },
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
          {
            titulo: 'Circulação de B pelo triângulo C',
            texto: r`**O que se pede.** A circulação do campo magnético, $\oint_\mathcal C\vec B\cdot d\vec\ell$, pela curva $\mathcal C$: um triângulo cujos vértices estão nos eixos de três cilindros iguais que se tocam, cada um com corrente $I$ uniforme saindo do papel.

**A ideia: a lei de Ampère.** Para correntes estacionárias (formulário, sem o termo de $\Phi_{\vec E}$, que é zero aqui):
$$\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc},$$
em que $I_\text{enc}$ é a corrente que **atravessa** a superfície limitada pela curva. Não é preciso calcular o campo: basta saber quanta corrente o triângulo envolve.

**Passo 1: quanto de cada cilindro está dentro do triângulo.** Os três eixos formam um triângulo **equilátero** (cada cilindro toca os outros dois, e os raios são iguais). O ângulo interno em cada vértice é $60°$. Dentro do triângulo fica, de cada seção circular, um **setor** de $60°$, que é $\dfrac{60°}{360°} = \dfrac16$ do círculo. Com a corrente uniforme na seção, cada setor leva $\dfrac I6$.

**Passo 2: a corrente envolvida.**
$$I_\text{enc} = 3\cdot\frac I6 = \frac I2.$$

**Passo 3: o sinal.** A regra da mão direita relaciona o sentido de percurso da curva com o sentido "positivo" da corrente: dedos no sentido de $\mathcal C$, o polegar dá o sentido positivo. Na figura, $\mathcal C$ é percorrida no sentido **horário**, cujo polegar aponta **para dentro** do papel. As correntes **saem** do papel: contam como negativas.

**Resposta.**
$$\oint_{\mathcal C}\vec B\cdot d\vec\ell = -\frac{\mu_0I}{2}.$$`,
            passo: 1,
          },
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
          {
            titulo: 'Circulação de B pela curva C',
            texto: r`**O que se pede.** A circulação do campo magnético total das três espiras (correntes $i$, $4i$ e $5i$) ao longo da curva fechada e orientada $\mathcal C$ da figura.

**A ideia: a lei de Ampère.** Para correntes estacionárias (formulário, sem o termo de $\Phi_{\vec E}$):
$$\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc}.$$
$I_\text{enc}$ é a corrente líquida que **atravessa** uma superfície qualquer cujo contorno é $\mathcal C$ (imagine uma película de sabão presa na curva). Cada fio que fura essa película conta, com sinal:
- positivo, se atravessa no sentido do polegar, com os dedos acompanhando o sentido de $\mathcal C$ (regra da mão direita);
- negativo, se atravessa ao contrário.

Fios que não furam a película **não contam**, por mais forte que seja o campo deles ao longo da curva. Eles mudam o campo em cada ponto de $\mathcal C$, mas a contribuição deles para a integral fechada é zero.

**Aplicando à figura.** A pergunta, então, é: quais espiras estão **enlaçadas** com $\mathcal C$, como dois elos de corrente? Isso se lê pelos cruzamentos por cima e por baixo no desenho. O saldo, como dá o gabarito, é uma corrente $i$ atravessando no sentido positivo; as espiras de $4i$ e $5i$ não contribuem para o saldo.

**Resposta.**
$$\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0i.$$

**Cuidado.** Somar todas as correntes do desenho ($10i$) é o erro clássico: só a corrente que atravessa a superfície limitada pela curva entra na lei de Ampère.`,
            passo: 1,
          },
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
          {
            titulo: '(i) s < a: dentro do cilindro',
            texto: r`**O que se pede.** O campo magnético a uma distância $s < a$ do eixo de um cabo coaxial: cilindro maciço de raio $a$ com corrente $I$ uniforme, e casca fina de raio $b$ com corrente $I$ no sentido oposto.

**A ideia: lei de Ampère com simetria.** Lei de Ampère para correntes estacionárias (formulário): $\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc}$. O cabo é infinito e igual em volta do eixo. Por essa simetria, o campo só pode **circular** em volta do eixo (direção $\hat\phi$) com módulo que depende só de $s$. Tomando como curva um **círculo** de raio $s$ centrado no eixo, $\vec B$ é tangente a ele e de módulo constante, e a integral vira $B\cdot2\pi s$:
$$B\cdot2\pi s = \mu_0I_\text{enc}(s).$$

**A corrente envolvida.** Com $s < a$, o círculo envolve só parte do cilindro. A corrente é uniforme na seção, então a parte envolvida é a fração da área:
$$I_\text{enc} = I\,\frac{\pi s^2}{\pi a^2} = I\frac{s^2}{a^2}.$$

**A conta.**
$$B\cdot2\pi s = \mu_0I\frac{s^2}{a^2}\quad\Rightarrow\quad\vec B = \frac{\mu_0Is}{2\pi a^2}\,\hat\phi.$$
Cresce linearmente a partir de zero no eixo. O sentido $\hat\phi$ é dado pela regra da mão direita com o polegar na corrente do cilindro.`,
            passo: 0,
          },
          {
            titulo: '(ii) a < s < b: entre os condutores',
            texto: r`**O que se pede.** O campo entre o cilindro e a casca.

**A ideia.** A mesma simetria e a mesma curva do item (i): um círculo de raio $s$ centrado no eixo, onde $\oint\vec B\cdot d\vec\ell = B\cdot2\pi s$. Lei de Ampère (formulário): $B\cdot2\pi s = \mu_0I_\text{enc}$.

**A corrente envolvida.** Agora o círculo envolve o cilindro **inteiro**, mas não a casca (que está em $s = b$, fora dele): $I_\text{enc} = I$.

**A conta.**
$$B\cdot2\pi s = \mu_0I\quad\Rightarrow\quad\vec B = \frac{\mu_0I}{2\pi s}\,\hat\phi.$$
É o campo de um fio fino infinito com corrente $I$. Em $s = a$, os itens (i) e (ii) dão o mesmo valor, $\dfrac{\mu_0I}{2\pi a}$: o campo é contínuo.`,
            passo: 1,
          },
          {
            titulo: '(iii) s > b: fora do cabo',
            texto: r`**O que se pede.** O campo fora do cabo.

**A ideia.** A mesma curva circular, agora com raio $s > b$, que envolve o cilindro **e** a casca.

**A corrente envolvida.** O cilindro leva $I$ num sentido e a casca devolve $I$ no sentido oposto:
$$I_\text{enc} = I - I = 0.$$

**A conta.**
$$B\cdot2\pi s = 0\quad\Rightarrow\quad\vec B = \vec 0.$$

**Por que isso importa.** O cabo coaxial não produz campo magnético fora dele, e (pelo mesmo motivo) também não é afetado por campos de fora. É por isso que ele é usado para levar sinais sem interferência.`,
            passo: 2,
          },
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
          {
            titulo: '(a) A corrente total no cilindro',
            texto: r`**O que se pede.** A corrente total que atravessa a seção do cilindro de raio $a$, com densidade de corrente $\vec J = \dfrac{2I_0}{\pi a^2}\left[1 - \left(\dfrac sa\right)^2\right]\hat z$.

**A ideia.** A corrente é o fluxo de $\vec J$ pela seção (formulário: $I = \int_S\vec J\cdot d\vec A$). Como $J$ depende de $s$, divide-se a seção em **anéis** finos de raio $s$ e largura $ds$, de área $dA = 2\pi s\,ds$ (desenrolado, o anel é quase um retângulo de lados $2\pi s$ e $ds$). Em cada anel, $J$ é praticamente constante.

**A conta.**
$$I = \int_0^aJ(s)\,2\pi s\,ds = \frac{2I_0}{\pi a^2}\cdot2\pi\int_0^a\left(s - \frac{s^3}{a^2}\right)ds = \frac{4I_0}{a^2}\left[\frac{s^2}{2} - \frac{s^4}{4a^2}\right]_0^a.$$
$$I = \frac{4I_0}{a^2}\left(\frac{a^2}{2} - \frac{a^2}{4}\right) = I_0.$$

**Interpretação.** A constante $I_0$ do enunciado é exatamente a corrente total. A corrente é mais densa no eixo e cai a zero na superfície.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo fora do cilindro',
            texto: r`**O que se pede.** O vetor campo magnético para $s > a$.

**A ideia.** Lei de Ampère (formulário, com correntes estacionárias): $\oint\vec B\cdot d\vec\ell = \mu_0I_\text{enc}$. O fio é infinito e a corrente só depende de $s$: o campo circula em volta do eixo ($\hat\phi$) com módulo que só depende de $s$. Num círculo de raio $s$ centrado no eixo, $\oint\vec B\cdot d\vec\ell = B\cdot2\pi s$.

**A conta.** Fora, o círculo envolve a corrente toda, $I_0$ (item a):
$$B\cdot2\pi s = \mu_0I_0\quad\Rightarrow\quad\vec B = \frac{\mu_0I_0}{2\pi s}\,\hat\phi.$$

**Interpretação.** De fora, o fio age como um fio fino com corrente $I_0$: a forma como a corrente se distribui dentro dele não importa.`,
            passo: 1,
          },
          {
            titulo: '(c) O campo dentro do cilindro',
            texto: r`**O que se pede.** O vetor campo magnético para $s \le a$.

**A ideia.** A mesma simetria e o mesmo círculo de raio $s$ do item (b), mas agora ele envolve só a corrente entre o eixo e $s$. É a integral do item (a) parando em $s$ (com $s'$ como variável de integração):
$$I_\text{enc}(s) = \frac{4I_0}{a^2}\left[\frac{s'^2}{2} - \frac{s'^4}{4a^2}\right]_0^s = I_0\left(\frac{2s^2}{a^2} - \frac{s^4}{a^4}\right).$$

**A conta.**
$$B\cdot2\pi s = \mu_0I_0\left(\frac{2s^2}{a^2} - \frac{s^4}{a^4}\right)\quad\Rightarrow\quad\vec B = \frac{\mu_0I_0}{2\pi a^2}\left(2s - \frac{s^3}{a^2}\right)\hat\phi.$$

**Conferindo.** Em $s = a$: $\dfrac{\mu_0I_0}{2\pi a^2}(2a - a) = \dfrac{\mu_0I_0}{2\pi a}$, igual ao item (b). No eixo, $B = 0$.`,
            passo: 2,
          },
          {
            titulo: '(d) O gráfico de B em função de s',
            texto: r`**O que se pede.** Esboçar a intensidade do campo em função de $s$, com os valores importantes.

**Uma escala útil.** Meça o campo em unidades do valor na superfície, $B(a) = \dfrac{\mu_0I_0}{2\pi a}$, e a distância em unidades de $a$, com $u = s/a$:
- dentro ($u \le 1$): $\dfrac{B}{B(a)} = 2u - u^3$;
- fora ($u > 1$): $\dfrac{B}{B(a)} = \dfrac1u$.

**O desenho.**
- Começa em **zero** no eixo e sobe quase em linha reta (para $u$ pequeno, $2u - u^3 \approx 2u$).
- Continua subindo, cada vez mais devagar, até a superfície, onde vale $B(a)$. A inclinação de $2u - u^3$ é $2 - 3u^2$, que vale $-1$ em $u = 1$: o máximo exato fica um pouco **antes** da superfície, em $u = \sqrt{2/3} \approx 0{,}82$, onde $B \approx 1{,}09\,B(a)$.
- Fora, cai como $1/s$.
- É contínuo em $s = a$: não há corrente concentrada na superfície.`,
            passo: 3,
          },
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
          {
            titulo: '(a) O campo tem a mesma intensidade em toda a curva?',
            texto: r`**O que se pede.** Uma curva circular $\mathcal C$, de raio $R$, envolve um fio infinito com corrente $I$, mas o fio **não** passa pelo centro dela. O campo do fio tem a mesma intensidade em todos os pontos de $\mathcal C$?

**A ideia.** O campo de um fio reto infinito tem módulo
$$B = \frac{\mu_0I}{2\pi r},$$
em que $r$ é a distância ao **fio**. Ele sai da lei de Ampère com um círculo centrado no fio, ou da lei de Biot-Savart (formulário). Só depende dessa distância.

**Aplicando.** Com o fio fora do centro de $\mathcal C$, os pontos da curva estão a distâncias diferentes do fio: se o fio está a $d$ do centro, as distâncias vão de $R - d$ (o ponto mais próximo) a $R + d$ (o mais distante).

**Resposta.** **Não.** O campo é mais forte no lado da curva mais próximo do fio.`,
            passo: 0,
          },
          {
            titulo: '(b) O campo é tangente à curva em todos os pontos?',
            texto: r`**O que se pede.** Dizer se o campo do fio é tangente a $\mathcal C$ em todos os pontos dela.

**A ideia.** As linhas do campo de um fio infinito são **círculos centrados no fio**, num plano perpendicular a ele (a direção $\hat\phi$, pela regra da mão direita). Em cada ponto, o campo é tangente ao círculo centrado no fio que passa por ali.

**Aplicando.** A curva $\mathcal C$ é um círculo centrado em **outro** ponto. Os dois círculos (a linha de campo e $\mathcal C$) só têm a mesma tangente em alguns pontos isolados, não ao longo de toda a curva.

**Resposta.** **Não.** O campo só seria tangente a $\mathcal C$ em todos os pontos se o centro de $\mathcal C$ coincidisse com o fio.`,
            passo: 1,
          },
          {
            titulo: '(c) Dá para tirar B da lei de Ampère com essa curva?',
            texto: r`**O que se pede.** Dizer se a lei de Ampère com a curva $\mathcal C$ permite obter uma expressão para o campo do fio em todo o espaço.

**A ideia.** A lei de Ampère (formulário, com correntes estacionárias) diz
$$\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc}.$$
Ela **vale** para qualquer curva fechada: aqui o fio atravessa a região limitada por $\mathcal C$, e a circulação é $\mu_0I$, com o fio no centro ou não. Mas ela dá só a **integral**. Para extrair o campo, é preciso que, ao longo da curva:
- $\vec B$ seja tangente a ela (para $\vec B\cdot d\vec\ell = B\,d\ell$), e
- $|\vec B|$ seja constante (para $B$ sair da integral).

Aí $\oint\vec B\cdot d\vec\ell = B\times(\text{comprimento})$, e isola-se $B$.

**Aplicando.** Pelos itens (a) e (b), nesta curva nenhuma das duas condições vale: o campo muda de módulo e o ângulo entre $\vec B$ e $d\vec\ell$ muda ao longo dela. A integral $\oint B\cos\alpha\,d\ell$ não se simplifica.

**Resposta.** **Não.** A lei vale, mas essa curva não serve para calcular o campo. A curva certa é um círculo **centrado no fio**, que tem a simetria do campo.`,
            passo: 2,
          },
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
          {
            titulo: 'Campo em O do circuito de arcos e raios',
            texto: r`**O que se pede.** O campo magnético no ponto $O$ (o centro comum dos arcos) produzido por um circuito plano feito de 3 arcos de raio $a$ com $30°$ cada, 3 arcos de raio $b$ e trechos retos **radiais** ligando os arcos, com corrente $I$.

**A ideia: Biot-Savart por trechos.** O campo de um pedacinho de fio é (formulário)
$$d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec\ell\times\hat r}{r^2},$$
com $\hat r$ apontando do pedacinho até o ponto. O campo total é a soma dos campos de todos os trechos (superposição).

**Os trechos radiais não contribuem.** Num trecho que aponta para $O$, $d\vec\ell$ é **paralelo** a $\hat r$, e o produto vetorial de vetores paralelos é zero. Campo nulo.

**O campo de um arco no seu centro.** Num arco de raio $R$ e ângulo $\alpha$ (em radianos), todo pedacinho está à distância $R$ de $O$ e é **perpendicular** a $\hat r$: $|d\vec\ell\times\hat r| = d\ell$. Todos os $d\vec B$ apontam na mesma direção, perpendicular ao plano. Somando, com o comprimento do arco igual a $R\alpha$:
$$B_\text{arco} = \frac{\mu_0I}{4\pi R^2}\cdot R\alpha = \frac{\mu_0I\alpha}{4\pi R}.$$
(Com $\alpha = 2\pi$, volta $\dfrac{\mu_0I}{2R}$, o centro de uma espira completa.)

**Os ângulos.** Os 3 arcos de raio $a$ somam $3\times30° = 90° = \dfrac\pi2$. Pela figura, os de raio $b$ completam o resto do giro: $360° - 90° = 270° = \dfrac{3\pi}{2}$. A corrente percorre todos os arcos no mesmo sentido de rotação em volta de $O$, então todos os campos apontam para o mesmo lado e se somam.

**A conta.**
$$B = \frac{\mu_0I}{4\pi}\left(\frac{\pi/2}{a} + \frac{3\pi/2}{b}\right) = \frac{\mu_0I}{8}\left(\frac1a + \frac3b\right).$$
Pela regra da mão direita com o sentido da corrente na figura, o campo **sai do papel**:
$$\vec B = \frac{\mu_0I}{8}\left(\frac1a + \frac3b\right)\hat z.$$

**Cuidados.** O ângulo tem de estar em **radianos**. E cada arco dá só a fração $\alpha/2\pi$ do campo de uma espira completa, não $\mu_0I/2R$ inteiro.`,
            passo: 1,
          },
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
          {
            titulo: '(a) O momento de dipolo da espira quadrada',
            texto: r`**O que se pede.** O vetor momento de dipolo magnético da espira quadrada de lado $L$, com corrente $I$ no sentido da figura. O eixo $X$ é perpendicular ao plano da espira e passa pelo centro.

**A ideia.** Para uma espira plana (formulário): $\vec\mu = NI\vec A$, com $\vec A$ perpendicular ao plano e sentido pela **regra da mão direita** (dedos na corrente, polegar em $\vec A$).

**A conta.** Uma volta, área $L^2$. Na figura, a corrente gira no sentido anti-horário para quem olha de $+x$, então o polegar aponta para $+x$:
$$\vec\mu = IL^2\,\hat x.$$`,
            passo: 0,
          },
          {
            titulo: '(b) O campo de um lado no ponto P',
            texto: r`**O que se pede.** O campo de **um** dos lados da espira no ponto $P$, no eixo $X$, a uma distância $x$ do centro.

**A ideia: o fio reto finito.** Pela lei de Biot-Savart (formulário, $d\vec B = \dfrac{\mu_0}{4\pi}\dfrac{I\,d\vec\ell\times\hat r}{r^2}$), um fio reto de comprimento $L$, visto de um ponto a uma distância $\rho$ do meio dele, produz (resultado de aula, também no exercício 12)
$$B_1 = \frac{\mu_0I}{4\pi\rho}\,2\sin\theta,$$
em que $\theta$ é o ângulo entre a perpendicular ao fio e a reta que vai do ponto até uma das pontas. O campo é perpendicular ao fio e à reta que liga o fio ao ponto.

**Montagem.** Considere o lado vertical da direita, a $L/2$ do eixo:
- a distância de $P$ até o meio dele é $\rho = \sqrt{x^2 + L^2/4}$;
- a distância de $P$ até uma ponta é $\sqrt{\rho^2 + L^2/4} = \sqrt{x^2 + L^2/2}$, então $\sin\theta = \dfrac{L/2}{\sqrt{x^2 + L^2/2}}$.

**A conta.**
$$B_1 = \frac{\mu_0I}{4\pi\rho}\cdot\frac{L}{\sqrt{x^2 + L^2/2}}.$$
A direção é perpendicular ao lado e à reta $\rho$; ela tem uma parte ao longo de $x$ (a fração $\dfrac{L/2}{\rho}$) e uma parte transversal (a fração $\dfrac x\rho$):
$$\vec B_1 = \frac{\mu_0I}{4\pi}\frac{L}{\left(x^2 + \frac{L^2}{4}\right)\sqrt{x^2 + \frac{L^2}{2}}}\left(\frac L2\,\hat x + x\,\hat y\right).$$`,
            passo: 1,
          },
          {
            titulo: '(c) O campo da espira inteira em P',
            texto: r`**O que se pede.** Módulo, direção e sentido do campo da espira toda em $P$.

**A ideia: simetria.** Os quatro lados são iguais e estão à mesma distância de $P$. Cada um dá um campo como o do item (b):
- as partes **transversais** dos lados opostos apontam em sentidos opostos e **se cancelam** aos pares;
- as partes ao longo de $x$ são iguais e **se somam**: quatro vezes a de um lado.

**A conta.** A parte em $x$ de um lado é $B_1\cdot\dfrac{L/2}{\rho}$:
$$B_x = 4\cdot\frac{\mu_0I}{4\pi\rho}\cdot\frac{L}{\sqrt{x^2 + L^2/2}}\cdot\frac{L}{2\rho} = \frac{\mu_0IL^2}{2\pi\left(x^2 + \frac{L^2}{4}\right)\sqrt{x^2 + \frac{L^2}{2}}}.$$
$$\vec B = \frac{\mu_0IL^2}{2\pi\left(x^2 + \frac{L^2}{4}\right)\sqrt{x^2 + \frac{L^2}{2}}}\,\hat x.$$

Ao longo do eixo, no sentido de $\vec\mu$. **Conferindo:** no centro ($x = 0$), $B = \dfrac{\mu_0IL^2}{2\pi(L^2/4)(L/\sqrt2)} = \dfrac{2\sqrt2\,\mu_0I}{\pi L} \approx 0{,}90\,\dfrac{\mu_0I}{L}$, um pouco menor que o de uma espira circular de diâmetro $L$ ($\mu_0I/L$): os cantos do quadrado ficam mais longe do centro.`,
            passo: 2,
          },
          {
            titulo: '(d) Muito longe: o campo de um dipolo',
            texto: r`**O que se pede.** Uma aproximação para $x \gg L$, escrita com o momento de dipolo, e o que ela significa.

**A ideia.** Para $x$ muito maior que $L$, os termos com $L^2$ ao lado de $x^2$ ficam desprezíveis: $x^2 + \dfrac{L^2}{4} \approx x^2$ e $\sqrt{x^2 + \dfrac{L^2}{2}} \approx x$.

**A conta.**
$$\vec B \approx \frac{\mu_0IL^2}{2\pi x^3}\,\hat x = \frac{\mu_0}{2\pi}\frac{\vec\mu}{x^3},$$
com $\vec\mu = IL^2\hat x$ do item (a).

**Interpretação.**
- De longe, o campo só depende do **momento de dipolo**, $\vec\mu$: a forma da espira (quadrada, circular) deixa de importar, só a corrente vezes a área.
- Ele cai com $1/x^3$, como o campo de um dipolo elétrico no seu eixo, $\dfrac{1}{4\pi\varepsilon_0}\dfrac{2\vec p}{x^3}$. A semelhança é completa: uma espira de corrente pequena é um **dipolo magnético**, um pequeno ímã.`,
            passo: 3,
          },
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
          {
            titulo: '(a) O campo na origem O',
            texto: r`**O que se pede.** Pela lei de Biot-Savart, o campo na origem $O$ de um fio formado por uma semirreta paralela a $X$, um arco de um quarto de círculo de raio $R$ (centrado em $O$) e outra semirreta paralela a $Y$, com corrente $I$.

**A ideia: superposição.** O campo de cada pedacinho é (formulário) $d\vec B = \dfrac{\mu_0}{4\pi}\dfrac{I\,d\vec\ell\times\hat r}{r^2}$. Calcula-se o campo de cada trecho em $O$ e somam-se os três.

**O arco.** Todo pedacinho está à distância $R$ de $O$ e perpendicular a $\hat r$. Num arco de ângulo $\alpha$, o campo no centro é $\dfrac{\mu_0I\alpha}{4\pi R}$. Com $\alpha = \pi/2$:
$$B_\text{arco} = \frac{\mu_0I}{4\pi R}\cdot\frac\pi2 = \frac{\mu_0I}{8R}.$$

**Cada semirreta.** Ela começa (ou termina) numa ponta do arco, e essa ponta é o pé da perpendicular de $O$ até a reta da semirreta, a uma distância $R$. Para um fio reto, o campo num ponto a distância $d$ é $\dfrac{\mu_0I}{4\pi d}(\cos\theta_1 - \cos\theta_2)$ (exercício 12), com os ângulos medidos entre o fio e as retas até as pontas. Para a semirreta, os ângulos vão de $\pi/2$ (a ponta no pé da perpendicular) até $0$ ou $\pi$ (a ponta no infinito), e o parêntese vale $1$:
$$B_\text{semi} = \frac{\mu_0I}{4\pi R}.$$
É **metade** do campo de um fio infinito: a semirreta é metade dele, e as duas metades contribuiriam igualmente.

**Somando.** Pela regra da mão direita com o sentido da corrente da figura, os três campos apontam para fora do papel ($+\hat z$):
$$\vec B = \left(\frac{\mu_0I}{8R} + 2\cdot\frac{\mu_0I}{4\pi R}\right)\hat z = \frac{\mu_0I}{2R}\left(\frac1\pi + \frac14\right)\hat z.$$`,
            passo: 0,
          },
          {
            titulo: '(b) As duas semirretas juntas valem um fio infinito',
            texto: r`**O que se pede.** Verificar que o campo das duas semirretas juntas, em $O$, tem a mesma intensidade que o de um fio infinito a uma distância $R$, e interpretar.

**A conta.** Do item (a), cada semirreta dá $\dfrac{\mu_0I}{4\pi R}$ em $O$, no mesmo sentido:
$$B_\text{semirretas} = 2\cdot\frac{\mu_0I}{4\pi R} = \frac{\mu_0I}{2\pi R}.$$
É exatamente o campo de um fio reto infinito a uma distância $R$.

**Interpretação.** Um fio infinito visto de um ponto a distância $R$ pode ser cortado no pé da perpendicular em duas semirretas, cada uma contribuindo com **metade** do campo. Aqui as duas semirretas estão em direções diferentes ($X$ e $Y$), mas **cada uma**, vista de $O$, está na mesma situação geométrica de uma metade de fio infinito: começa no pé da perpendicular, a distância $R$, e vai até o infinito. Por isso as duas juntas reproduzem o fio inteiro.`,
            passo: 1,
          },
          {
            titulo: '(c) Daria para usar a lei de Ampère?',
            texto: r`**O que se pede.** Dizer se a lei de Ampère serve para calcular diretamente a contribuição das semirretas, e justificar.

**A ideia.** A lei de Ampère (formulário) dá a integral $\oint\vec B\cdot d\vec\ell$. Para extrair $B$, é preciso uma curva fechada em que $\vec B$ seja tangente e de módulo constante. Para um fio **infinito**, a curva é um círculo em volta do fio: por simetria (o fio é igual visto de qualquer ponto ao longo dele), o campo é o mesmo em todo o círculo.

**Por que não funciona aqui.** Uma semirreta **não** tem essa simetria: ela acaba num ponto. Num círculo em volta dela, os pontos perto da ponta veem só "metade" do fio, e os pontos longe da ponta veem quase um fio infinito. O campo muda ao longo do círculo e não sai da integral. (Seguindo a sugestão: num ponto diferente de $O$, por exemplo em frente ao meio de uma das semirretas, o campo dela já não é $\mu_0I/4\pi R$.)

Há ainda um problema mais fundo: uma semirreta sozinha não é um circuito fechado, e a lei de Ampère na forma $\oint\vec B\cdot d\vec\ell = \mu_0I_\text{enc}$ vale para correntes estacionárias em circuitos fechados.

**Resposta.** **Não.** A coincidência do item (b) vale só no ponto $O$; para obtê-la, é preciso Biot-Savart.`,
            passo: 2,
          },
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
          {
            titulo: '(a) A direção e o sentido do campo',
            texto: r`**O que se pede.** Pela simetria, a direção e o sentido do campo magnético da placa infinita de espessura $d$ (paralela ao plano $XZ$, de $y = -d/2$ a $y = d/2$), com densidade de corrente $\vec J = J_0\hat z$, em todo o espaço.

**A ideia.** Pense na placa como um conjunto de fios finos paralelos ao eixo $Z$, lado a lado, todos com corrente no sentido $+z$ (saindo do papel, se o papel é o plano $XY$). Cada fio cria um campo que circula em volta dele, pela regra da mão direita (lei de Biot-Savart, formulário).

**Somando fios simétricos.** Num ponto acima da placa ($y > 0$), considere dois fios à mesma distância, um à esquerda e outro à direita do ponto. Os campos deles têm o mesmo módulo; as componentes em $y$ se cancelam e as componentes em $x$ se somam. Como a placa é infinita em $x$, todo fio tem seu par, e sobra só a componente $x$.

**O sentido.** Para um fio com corrente em $+z$ na origem, num ponto logo acima dele, em $(0, y > 0)$, o campo circula no sentido anti-horário visto de $+z$ e aponta para $-\hat x$. Então:
- acima da placa ($y > 0$): $\vec B$ aponta para $-\hat x$;
- abaixo ($y < 0$): para $+\hat x$, o espelho.

**Resposta.** $\vec B$ é paralelo ao eixo $X$, com $-\hat x$ para $y > 0$ e $+\hat x$ para $y < 0$. No plano do meio ($y = 0$) ele é zero, por simetria. Também não pode depender de $x$ nem de $z$, porque a placa é igual vista de qualquer ponto ao longo dessas direções.`,
            passo: 0,
          },
          {
            titulo: '(b) A intensidade fora da placa',
            texto: r`**O que se pede.** Pela lei de Ampère, a intensidade do campo fora da placa ($|y| > d/2$).

**A ideia.** Lei de Ampère com correntes estacionárias (formulário): $\oint_{\mathcal C}\vec B\cdot d\vec\ell = \mu_0I_\text{enc}$. A curva escolhida é um **retângulo** no plano $XY$, simétrico em relação à placa: dois lados horizontais (paralelos a $x$), de comprimento $w$, em $y = +h$ e $y = -h$, e dois lados verticais (paralelos a $y$) atravessando a placa.

**A circulação.**
- Nos lados **verticais**, $\vec B$ (ao longo de $x$) é perpendicular a $d\vec\ell$: contribuição zero.
- Nos lados **horizontais**, $\vec B$ é paralelo ao lado e tem módulo constante (ele só depende de $y$). Percorrendo o retângulo, os dois contribuem com o mesmo sinal ($\vec B$ inverte de cima para baixo, e o sentido de percurso também), cada um com $Bw$.

Total: $\oint\vec B\cdot d\vec\ell = 2Bw$.

**A corrente envolvida.** Com $h > d/2$, o retângulo atravessa a placa inteira. A corrente que passa por ele é $J_0$ vezes a área da placa dentro do retângulo, $w\times d$: $I_\text{enc} = J_0wd$.

**A conta.**
$$2Bw = \mu_0J_0wd\quad\Rightarrow\quad B = \frac{\mu_0J_0d}{2}.$$

**Interpretação.** Não depende da distância: fora, o campo é **uniforme**, como o campo elétrico de um plano de carga infinito.`,
            passo: 1,
          },
          {
            titulo: '(c) A intensidade dentro da placa',
            texto: r`**O que se pede.** Pela lei de Ampère, a intensidade do campo dentro da placa ($|y| \le d/2$).

**A ideia.** O mesmo retângulo simétrico do item (b), agora com os lados horizontais em $\pm y$ **dentro** da placa. A circulação continua $2Bw$.

**A corrente envolvida.** O retângulo atravessa só a fatia da placa entre $-|y|$ e $|y|$, de espessura $2|y|$: $I_\text{enc} = J_0w\cdot2|y|$.

**A conta.**
$$2Bw = \mu_0J_0w\cdot2|y|\quad\Rightarrow\quad B = \mu_0J_0|y|.$$
Com o sentido do item (a) ($-\hat x$ acima do plano do meio):
$$\vec B = -\mu_0J_0y\,\hat x.$$

**Conferindo.** Em $y = 0$ o campo é zero, como a simetria exige. Em $y = d/2$, vale $\dfrac{\mu_0J_0d}{2}$, igual ao de fora: o campo cresce linearmente dentro e fica constante fora, sem salto.`,
            passo: 2,
          },
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
          {
            titulo: '(a) O campo do fio finito em P',
            texto: r`**O que se pede.** Pela lei de Biot-Savart, o campo num ponto $P$ a uma distância $d$ de um fio reto finito com corrente $I$ no sentido $+z$. Os ângulos $\theta_1$ e $\theta_2$ são os ângulos entre o eixo do fio ($+z$) e as retas que vão das duas pontas até $P$.

**A ideia.** Lei de Biot-Savart (formulário):
$$d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec\ell\times\hat r}{r^2}.$$
Somar ao longo do fio. A sugestão é usar como variável o **ângulo** $\theta$ entre o fio e a reta do pedacinho até $P$, que deixa a integral simples.

**Montagem.** Ponha $P$ na altura $z = 0$, à distância $d$ do fio. Um pedacinho na altura $z$, de comprimento $dz$:
- está a uma distância $r = \dfrac{d}{\sin\theta}$ de $P$;
- sua posição se escreve $z = -d\cot\theta$, então $dz = \dfrac{d}{\sin^2\theta}\,d\theta$;
- $|d\vec\ell\times\hat r| = dz\,\sin\theta$ (o ângulo entre o fio e $\hat r$ é $\theta$).

Todos os pedacinhos dão campo na **mesma direção**: perpendicular ao plano que contém o fio e $P$, ou seja, circulando em volta do fio ($\hat\phi$), pela regra da mão direita.

**A conta.** Substituindo:
$$dB = \frac{\mu_0I}{4\pi}\cdot\frac{d}{\sin^2\theta}\,d\theta\cdot\sin\theta\cdot\frac{\sin^2\theta}{d^2} = \frac{\mu_0I}{4\pi d}\sin\theta\,d\theta.$$
Integrando de $\theta_1$ a $\theta_2$:
$$\vec B = \frac{\mu_0I}{4\pi d}\big(\cos\theta_1 - \cos\theta_2\big)\,\hat\phi.$$

**Cuidado.** Os dois ângulos são medidos a partir do sentido $+z$ (o da corrente), não pelo lado de dentro do triângulo. Se $P$ está entre as alturas das pontas, $\theta_1 < 90°$ e $\theta_2 > 90°$.`,
            passo: 0,
          },
          {
            titulo: '(b) P na mediatriz do fio',
            texto: r`**O que se pede.** Obter, do item (a), o resultado de aula para $P$ na reta perpendicular ao fio pelo seu ponto médio.

**A ideia.** Com $P$ em frente ao meio do fio, as duas pontas são vistas simetricamente: $\theta_2 = \pi - \theta_1$. Então $\cos\theta_2 = -\cos\theta_1$.

**A conta.**
$$B = \frac{\mu_0I}{4\pi d}\big(\cos\theta_1 + \cos\theta_1\big) = \frac{\mu_0I}{2\pi d}\cos\theta_1.$$
Com o fio de comprimento $L$, a ponta está a $L/2$ do meio, e $\cos\theta_1 = \dfrac{L/2}{\sqrt{(L/2)^2 + d^2}}$:
$$B = \frac{\mu_0I}{4\pi d}\,\frac{L}{\sqrt{d^2 + L^2/4}}.$$
É o resultado visto em aula. (O comprimento do fio fica definido por $\theta_1$, $\theta_2$ e $d$, como diz a observação do enunciado.)`,
            passo: 1,
          },
          {
            titulo: '(c) O fio infinito',
            texto: r`**O que se pede.** O campo de um fio infinito em $P$, a partir do item (a).

**A ideia.** Fio infinito para os dois lados: uma ponta vai para $z \to -\infty$, vista na direção do próprio fio ($\theta_1 \to 0$); a outra vai para $z \to +\infty$ ($\theta_2 \to \pi$).

**A conta.** $\cos0 = 1$ e $\cos\pi = -1$:
$$\vec B = \frac{\mu_0I}{4\pi d}\big(1 - (-1)\big)\hat\phi = \frac{\mu_0I}{2\pi d}\,\hat\phi.$$
É o campo de um fio infinito, o mesmo que a lei de Ampère dá com um círculo centrado no fio.`,
            passo: 2,
          },
          {
            titulo: '(d) O fio semi-infinito',
            texto: r`**O que se pede.** O campo de um fio semi-infinito que se estende para $-z$, e por que a lei de Ampère não dá esse resultado.

**A conta.** A ponta que vai para $-\infty$ é vista com $\theta_1 \to 0$; a outra ponta continua com o seu $\theta_2$:
$$\vec B = \frac{\mu_0I}{4\pi d}\big(1 - \cos\theta_2\big)\hat\phi.$$
Se $P$ está bem em frente à ponta ($\theta_2 = \pi/2$, $\cos\theta_2 = 0$):
$$B = \frac{\mu_0I}{4\pi d},$$
**metade** do campo do fio infinito, como esperado: falta metade do fio.

**Por que não com a lei de Ampère.** Para tirar $B$ da lei de Ampère (formulário), é preciso uma curva onde $\vec B$ seja tangente e de módulo constante, o que, para um fio, exige que ele seja igual visto de qualquer altura (simetria de **translação**). Um fio semi-infinito tem uma ponta: num círculo em volta dele, o campo depende de onde o círculo está em relação à ponta. Além disso, um fio que termina não é um circuito fechado de corrente estacionária, que é a situação em que a lei vale na forma $\oint\vec B\cdot d\vec\ell = \mu_0I_\text{enc}$.

**Sobre o gabarito.** O gabarito da monitoria fixa $P$ em frente à ponta ($\theta_2 = \pi/2$). Para $P$ qualquer, vale a expressão geral acima.`,
            passo: 3,
          },
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
          {
            titulo: '(a) A densidade de corrente',
            texto: r`**O que se pede.** A intensidade da densidade de corrente no fio: um disco de raio $R$ com um buraco circular de raio $R/2$, tangente à borda, com corrente $I$ uniforme na seção.

**A ideia.** Densidade de corrente é corrente por área (formulário: $I = \int_S\vec J\cdot d\vec A$; com $J$ uniforme, $I = JA$). A área que conduz é a do disco **menos** a do buraco.

**A conta.**
$$A = \pi R^2 - \pi\left(\frac R2\right)^2 = \frac34\pi R^2\quad\Rightarrow\quad J = \frac IA = \frac{4I}{3\pi R^2}.$$`,
            passo: 0,
          },
          {
            titulo: '(b) O campo em P₁ e P₂',
            texto: r`**O que se pede.** A intensidade do campo nos pontos $P_1$ (o centro do buraco) e $P_2$ (o ponto onde o buraco toca a borda do disco).

**Por que não Ampère direto.** Com o buraco fora do centro, não há simetria circular: não existe curva em que $B$ seja constante. A saída é a **superposição**, como sugere o enunciado.

**A superposição.** O fio com buraco é igual à soma de:
- um cilindro **cheio** de raio $R$, com densidade $+J$, levando $J\pi R^2 = \dfrac43I$;
- um cilindro de raio $R/2$ no lugar do buraco, com densidade $-J$ (corrente oposta), levando $-J\pi\dfrac{R^2}{4} = -\dfrac13I$.

No buraco, $+J$ e $-J$ se cancelam: não há corrente, como deve ser. E $\tfrac43I - \tfrac13I = I$.

**Os campos de um cilindro.** Pela lei de Ampère com um círculo centrado no eixo de um cilindro de raio $a$ com corrente uniforme $I_c$ (como no exercício 5):
- dentro, a distância $s$ do eixo: $B = \dfrac{\mu_0I_cs}{2\pi a^2}$, que, com $I_c = J\pi a^2$, dá $B = \dfrac{\mu_0Js}{2}$;
- fora: $B = \dfrac{\mu_0I_c}{2\pi s}$.

**Em $P_1$, o centro do buraco.** O cilindro pequeno não contribui: $P_1$ está no eixo dele ($s = 0$). O grande contribui com o campo de dentro, a $s = R/2$ do seu eixo:
$$B(P_1) = \frac{\mu_0J}{2}\cdot\frac R2 = \frac{\mu_0R}{4}\cdot\frac{4I}{3\pi R^2} = \frac{\mu_0I}{3\pi R}.$$

**Em $P_2$, o ponto de tangência.** Ele está na superfície dos **dois** cilindros: a $R$ do eixo do grande e a $R/2$ do eixo do pequeno, os três pontos na mesma reta. Os dois campos estão na mesma direção, com sentidos opostos (as correntes são opostas):
$$B(P_2) = \frac{\mu_0(4I/3)}{2\pi R} - \frac{\mu_0(I/3)}{2\pi(R/2)} = \frac{\mu_0I}{2\pi R}\left(\frac43 - \frac23\right) = \frac{\mu_0I}{3\pi R}.$$

**Resposta.** $B(P_1) = B(P_2) = \dfrac{\mu_0I}{3\pi R}$.

**Uma surpresa.** Não é coincidência: dentro do buraco o campo é **uniforme**. Em forma vetorial, dentro de um cilindro, $\vec B = \dfrac{\mu_0J}{2}\hat z\times\vec s$; somando o do grande ($+J$, $\vec s$ a partir do centro dele) com o do pequeno ($-J$, $\vec s\,'$ a partir do centro do buraco), sobra $\dfrac{\mu_0J}{2}\hat z\times(\vec s - \vec s\,')$, e $\vec s - \vec s\,'$ é o vetor fixo entre os dois centros. É o análogo magnético da cavidade esférica da Lista 2.`,
            passo: 2,
          },
        ],
        resultado: r`$J = 4I/3\pi R^2$; $B(P_1) = B(P_2) = \mu_0 I/3\pi R$.`,
        errosComuns: ['Dar ao cilindro cheio a corrente $I$, e não $4I/3$.'],
        oficial: { resposta: r`(a) $j = \dfrac{4I}{3\pi R^2}$; (b) $B = \dfrac{\mu_0 I}{3\pi R}$ nos dois pontos.` },
      },
    },
  ],
}

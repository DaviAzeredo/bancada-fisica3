import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 2: tempo até parar e percurso, com aceleração qσ/2ε₀m. */
const tPara = '(2*eps0*mp*v0/(qe*sig))'
const percurso = '(mp*eps0*v0^2/(qe*sig))'
const noRastro = (e: string) => `(t > 1.05*${tPara} ? ${e} : 0/0)`

/* Objetiva 3: arco de ângulo β centrado em +y e semicírculo inferior, como fios. */
const N = 24
const A1 = (f: number) => `rad(90 - beta/2 + beta*${f})`
const arcoFio1: ObjetoInput[] = Array.from({ length: N }, (_, i) => ({
  id: `c1${i}`,
  tipo: 'fio' as const,
  I: 'I1',
  a: [`a*cos(${A1(i / N)})`, `a*sin(${A1(i / N)})`, 0],
  b: [`a*cos(${A1((i + 1) / N)})`, `a*sin(${A1((i + 1) / N)})`, 0],
}))
const noSemi = (i: number): [string, string, number] => {
  const f = (-i * Math.PI) / N
  return [`b*${Math.cos(f)}`, `b*${Math.sin(f)}`, 0]
}
const arcoFio2: ObjetoInput[] = Array.from({ length: N }, (_, i) => ({
  id: `c2${i}`,
  tipo: 'fio' as const,
  I: 'I2',
  a: noSemi(i),
  b: noSemi(i + 1),
}))
const soma = (ids: string[]) => ids.map((id) => `z(Bde('${id}', 0, 0, 0))`).join(' + ')
const B1z = `(${soma(['r1', ...arcoFio1.map((o) => o.id), 's1'])})`
const B2z = `(${soma(['r2', ...arcoFio2.map((o) => o.id), 's2'])})`
const B1t = '(mu0*I1*rad(beta)/(4*pi*a))'
const B2t = '(0-mu0*I2/(4*b))'

/* Objetiva 4: rampa que sobe a partir do fio (eixo x), com s na direção do plano. */
const Sn = 'sin(rad(th))'
const Cs = 'cos(rad(th))'
const sv = `[0, ${Sn}, 0-${Cs}]`
const noPlano = (x: string, s: string): [string, string, string] => [x, `(${s})*${Sn}`, `0-(${s})*${Cs}`]
const FmT = '(mu0*II*I0*a^2/(2*pi*h*(h + a)))'
const Fm = `dot(forca('perto','fw') + forca('longe','fw'), ${sv})`

/* Objetiva 5: carga e corrente, com relógio deslocado por t0. */
const Tq = '(t + t0)'
const Ic = `(q0/tau*exp(0-${Tq}/tau))`
const fi = '[0, 0-z, y]'
const Bvalor = `mag([0, y, z]) < a && abs(x) < d/2 ? mu0*${Ic}/(2*pi*a^2)*${fi} : mu0*${Ic}/(2*pi)*${fi}/(y^2 + z^2 + 1e-9)`

/* Discursiva: solução v(t) e a posição que vem dela. */
const Td = '(t + t0)'
const gam = '(B0^2*L^2/(mm*Rr))'
const V = `(v0*exp(0-${gam}*${Td}))`
const X = `(x0 + v0/${gam}*(1 - exp(0-${gam}*${Td})))`

/**
 * Segunda chamada de Física III, 2023/2, diurno, versão A (18/12/2023). Conferida
 * com o gabarito oficial, que traz 1h, 2f, 3d, 4b, 5g, 6e. Duas divergências,
 * registradas em cada questão: na objetiva 5 a física dá (a), porque (g) vale para
 * s > a; na objetiva 3 a conta dá fator 2, que não está nas alternativas, e (d)
 * tem fator 4.
 */
export const sc_2023_2_diurno: ProvaInput = {
  id: 'sc-2023-2-diurno',
  titulo: 'Segunda chamada · 2023/2 · Diurno',
  subtitulo: 'Física III · Segunda Chamada · Versão A · 18/12/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Cilindro com J crescente em s',
      resumo: 'Corrente envolvida por integral, e sentido pela mão direita.',
      enunciado: r`Um cilindro condutor comprido de raio $a$ é percorrido por uma corrente elétrica estacionária cuja intensidade está associada à densidade de corrente não uniforme $\vec J = J_0\left(\dfrac as\right)e^{s/a}\,\hat z$ onde $s$ é a distância ao eixo de simetria do cilindro, $J_0$ é uma constante positiva e tendo que $s \le a$. Segundo a lei de Ampère, o módulo $B$ do campo magnético localizado a uma distância $s < a$ do eixo do cilindro, bem como o sentido das linhas de indução, serão dados por:`,
      figura: [
        { pagina: 1, recorte: [0.5, 0.085, 0.905, 0.3] },
        { pagina: 1, recorte: [0.505, 0.31, 0.905, 0.945] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'J0', rotulo: 'Constante', simbolo: 'J_0', valor: 1e4, unidade: 'A/m²', min: 2e3, max: 3e4, passo: 1e3 },
        { id: 'a', rotulo: 'Raio', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.048, passo: 0.002 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', raioInterno: '1e-6*a', J: 'J0*a/r*exp(r/a)', rotulo: 'J(s)' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'z', raio: 'rs', rotulo: 'C' },
      ],
      visual: { setasB: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{env}`, expr: "Ienc('Amp')", unidade: 'A', teoria: '2*pi*J0*a^2*(exp(rs/a) - 1)' },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: 'mu0*2*pi*J0*a^2*(exp(rs/a) - 1)' },
        { rotulo: 'Campo em s (positivo: anti-horário)', simbolo: 'B', expr: 'y(B(rs, 0, 0))', unidade: 'T', teoria: 'mu0*J0*a^2*(exp(rs/a) - 1)/rs' },
      ],
      graficos: [
        {
          titulo: 'B(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.02*a', ate: '0.98*a', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'y(B(ss, 0, 0))', unidade: 'T' },
            { rotulo: 'Ampère', expr: 'mu0*J0*a^2*(exp(ss/a) - 1)/ss', unidade: 'T' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Ampère num círculo coaxial',
          texto: r`Por simetria, $\vec B = B(s)\hat\varphi$, e $\oint\vec B\cdot d\vec\ell = 2\pi sB$. Como $J$ varia com $s$, a corrente envolvida sai de uma integral.`,
          medidas: [1],
        },
        {
          titulo: 'A integral',
          previsao: { pergunta: 'No elemento 2πs′ds′, o que acontece com o 1/s′ de J?', opcoes: ['cancela com o s′', 'vira 1/s′²', 'vira ln s′'], correta: 0 },
          texto: r`$$I_\text{env} = \int_0^sJ_0\frac{a}{s'}e^{s'/a}\,2\pi s'\,ds' = 2\pi J_0a\int_0^se^{s'/a}\,ds' = 2\pi J_0a^2\left(e^{s/a} - 1\right).$$

Note o $-1$: ele vem do limite inferior, e faz a corrente se anular em $s = 0$.`,
          medidas: [0],
        },
        {
          titulo: 'Campo e sentido',
          texto: r`$$B = \frac{\mu_0I_\text{env}}{2\pi s} = \mu_0J_0a^2\left[\frac{e^{s/a} - 1}{s}\right].$$

Com $\vec J$ saindo da página, a regra da mão direita dá linhas no sentido **anti-horário**. Alternativa **(h)**.`,
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Ampère com simetria cilíndrica', lab: 'ampere' }],
        etapas: [
          { titulo: 'Corrente', texto: r`$I_\text{env} = 2\pi J_0a^2(e^{s/a} - 1)$.`, passo: 1 },
          { titulo: 'Campo', texto: r`$B = \mu_0I_\text{env}/2\pi s$, no sentido anti-horário.`, passo: 2 },
        ],
        resultado: r`$\mu_0J_0a^2\left[\dfrac{e^{s/a} - 1}{s}\right]$, anti-horário: alternativa **(h)**.`,
        errosComuns: [
          r`Esquecer o limite inferior e escrever $e^{s/a} + 1$ ou $e^{s/a}$: em $s = 0$ a corrente tem de ser nula.`,
          r`Usar $I_\text{env} = J\pi s^2$: $J$ varia com $s$.`,
        ],
        oficial: { resposta: '(h)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\mu_0J_0a^2\left[\dfrac{e^{s/a} + 1}{s}\right]$, anti-horário.`, porque: r`Sinal errado no limite inferior: a corrente não se anularia em $s = 0$.` },
        { letra: 'b', texto: r`$\mu_0J_0a\left[e^{-s/a} + 1\right]$, anti-horário.`, porque: r`O expoente é positivo, e falta dividir por $s$.` },
        { letra: 'c', texto: r`$\mu_0J_0a\left[e^{s/a} - 1\right]$, horário.`, porque: r`Falta $a/s$, e o sentido está invertido.` },
        { letra: 'd', texto: r`$\mu_0J_0a\left[e^{s/a} - 1\right]$, anti-horário.`, porque: r`Falta $a/s$: dividir por $2\pi s$ traz esse fator.` },
        { letra: 'e', texto: r`$\mu_0J_0a^3\left[\dfrac{e^{2s/a} + 1}{s^2}\right]$, anti-horário.`, porque: r`Não sai da integral de $J$.` },
        { letra: 'f', texto: r`$\mu_0J_0s^2\left[\dfrac{e^{s/a} + 1}{a}\right]$, horário.`, porque: r`Dependência em $s$ errada, e o sentido está invertido.` },
        { letra: 'g', texto: r`$\mu_0J_0a^2\left[\dfrac{e^{s/a} + 1}{s}\right]$, horário.`, porque: r`Sinal errado na integral, e o sentido está invertido.` },
        { letra: 'h', texto: r`$\mu_0J_0a^2\left[\dfrac{e^{s/a} - 1}{s}\right]$, anti-horário.`, correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Partícula lançada contra uma placa carregada',
      resumo: 'Da máxima aproximação sai a massa; a força é constante.',
      enunciado: r`Uma partícula de carga $q > 0$ e massa desconhecida $m$, é lançada de uma distância $D$ com velocidade de módulo $v_0$, diretamente a uma placa muito fina e grande que possui uma densidade superficial de cargas constante $\sigma$, onde $\sigma > 0$. Sabendo que a distância de máxima aproximação da partícula foi $d$, podemos concluir que a sua massa $m$ e que o módulo da força máxima entre ela e a placa são:`,
      figura: { pagina: 2, recorte: [0.095, 0.085, 0.5, 0.93] },
      cena: {
        escala: 0.01,
        extensao: 12,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [-5, 0, 24], alvo: [-5, 0, 0] },
        tempo: { escala: 6e-8, unidade: 'ns', passo: 2e-10 },
      },
      parametros: [
        { id: 'sig', rotulo: 'Densidade', simbolo: r`\sigma`, valor: 2.5e-6, unidade: 'C/m²', min: 2.2e-6, max: 4e-6, passo: 1e-7 },
        { id: 'v0', rotulo: 'Velocidade', simbolo: 'v_0', valor: 1.2e6, unidade: 'm/s', min: 8e5, max: 1.2e6, passo: 2e4 },
        { id: 'D', rotulo: 'Distância de lançamento', simbolo: 'D', valor: 0.1, unidade: 'm', min: 0.1, max: 0.1 },
      ],
      objetos: [
        { id: 'pl', tipo: 'planoInfinito', sigma: 'sig', ponto: [0, 0, 0], normal: 'x', rotulo: 'σ' },
        { id: 'p', tipo: 'particula', rotulo: 'q, m', q: 'qe', m: 'mp', pos: ['0-D', 0, 0], v: ['v0', 0, 0], parada: 'x < 0-D' },
        { id: 'cD', tipo: 'cota', a: ['0-D', 0, 0], b: [0, 0, 0], deslocamento: [0, -0.05, 0], rotulo: 'D' },
        { id: 'cd', tipo: 'cota', a: [`0-D + ${percurso}`, 0, 0], b: [0, 0, 0], deslocamento: [0, -0.03, 0], rotulo: 'd' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: [-1, 0, 0], comprimento: '2.5*cm', rotulo: 'F' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo da placa', simbolo: 'E', expr: 'mag(E(0-D/2, 0, 0))', unidade: 'V/m', teoria: 'sig/(2*eps0)' },
        { rotulo: 'Força sobre a partícula, onde ela está', simbolo: 'F', expr: "qe*mag(E(pos('p')))", unidade: 'N', teoria: 'qe*sig/(2*eps0)' },
        { rotulo: 'Percurso até parar, no rastro', simbolo: 'D - d', expr: noRastro("rastroSpan('p', 'x')"), unidade: 'm', teoria: percurso },
        { rotulo: 'Máxima aproximação', simbolo: 'd', expr: noRastro("D - rastroSpan('p', 'x')"), unidade: 'm', teoria: `D - ${percurso}` },
        { rotulo: 'Massa recuperada do rastro', simbolo: 'm', expr: noRastro("qe*sig*rastroSpan('p', 'x')/(eps0*v0^2)"), unidade: 'kg', teoria: 'mp' },
      ],
      passos: [
        {
          titulo: 'O campo da placa é uniforme',
          previsao: { pergunta: 'Ao se aproximar da placa, a força sobre a partícula…', opcoes: ['aumenta', 'diminui', 'não muda'], correta: 2 },
          texto: r`Com a placa muito grande, $E = \sigma/2\varepsilon_0$ não depende da distância. A força é **constante**:

$$F = qE = \frac{q\sigma}{2\varepsilon_0}.$$

Por isso, "força máxima" é só o valor dessa força, em qualquer ponto.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Trabalho e energia',
          texto: r`A partícula para a uma distância $d$ da placa: percorreu $D - d$ contra uma força constante, e toda a energia cinética virou potencial:

$$\frac12mv_0^2 = qE(D - d) = \frac{q\sigma}{2\varepsilon_0}(D - d).$$

Aperte o *play*: ela freia, para e volta.`,
          medidas: [2, 3],
        },
        {
          titulo: 'A massa',
          texto: r`$$m = \frac{\sigma q(D - d)}{\varepsilon_0v_0^2}.$$

A cena recupera a massa do próton a partir do rastro. Com a força, alternativa **(f)**.`,
          medidas: [4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um plano carregado', lab: 'gauss' },
          { texto: 'Trabalho e potencial', lab: 'potencial' },
        ],
        etapas: [
          { titulo: 'Força', texto: r`$F = q\sigma/2\varepsilon_0$, constante.`, passo: 0 },
          { titulo: 'Energia', texto: r`$\frac12mv_0^2 = F(D - d)$.`, passo: 1 },
          { titulo: 'Massa', texto: r`$m = \sigma q(D - d)/\varepsilon_0v_0^2$.`, passo: 2 },
        ],
        resultado: r`$m = \dfrac{\sigma q(D-d)}{\varepsilon_0v_0^2}$ e $F = \dfrac{q\sigma}{2\varepsilon_0}$: alternativa **(f)**.`,
        errosComuns: [
          r`Usar $\sigma/\varepsilon_0$: esse é o campo entre as placas de um capacitor; uma placa só dá metade.`,
          r`Usar $D$ em vez de $D - d$ no percurso.`,
          r`Tratar a placa como carga pontual, com força crescendo perto dela.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{\sigma q(D+d)}{2\epsilon_0v_0^2}$, $\dfrac{q\sigma(D-d)}{2\epsilon_0d}$`, porque: r`O percurso é $D - d$, e a força é constante.` },
        { letra: 'b', texto: r`$\dfrac{\sigma q(D+d)}{\epsilon_0v_0^2}$, $\dfrac{q\sigma D}{2\epsilon_0d}$`, porque: r`O percurso é $D - d$, e a força não depende de $d$.` },
        { letra: 'c', texto: r`$\dfrac{\sigma qD}{\epsilon_0v_0^2}$, $\dfrac{q\sigma D}{\epsilon_0d}$`, porque: r`Usa $D$ como percurso, e a força errada.` },
        { letra: 'd', texto: r`$\dfrac{\sigma qD^2}{\epsilon_0dv_0^2}$, $\dfrac{q\sigma}{\epsilon_0}$`, porque: r`A massa não sai da energia, e $\sigma/\varepsilon_0$ é o dobro do campo da placa.` },
        { letra: 'e', texto: r`$\dfrac{2\sigma q(D-d)}{\epsilon_0v_0^2}$, $\dfrac{q\sigma}{2\epsilon_0}$`, porque: r`A força está certa, mas a massa tem um fator 2 a mais: esquece o $\frac12$ de $\sigma/2\varepsilon_0$.` },
        { letra: 'f', texto: r`$\dfrac{\sigma q(D-d)}{\epsilon_0v_0^2}$, $\dfrac{q\sigma}{2\epsilon_0}$`, correta: true, porque: r`Correta.` },
        { letra: 'g', texto: r`$\dfrac{2\sigma qD}{\epsilon_0v_0^2}$, $\dfrac{q\sigma d}{2\epsilon_0D}$`, porque: r`A força não depende da posição.` },
        { letra: 'h', texto: r`$\dfrac{\sigma q(D-d)}{\epsilon_0v_0^2}$, $\dfrac{q\sigma}{\epsilon_0}$`, porque: r`A massa está certa, mas a força tem o dobro do valor: usa $\sigma/\varepsilon_0$.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Ângulo de um arco para 2B_T = −3B₁',
      resumo: 'Só os arcos contam. O gabarito diverge da conta por um fator 2.',
      enunciado: r`Dois fios muito longos que possuem dobras em forma de arcos de círculos de raios $a$ e $b$ e ângulos $\beta$ e $\pi$, possuem um centro comum $\mathcal O$ (vide figura). Ao serem percorridos por correntes elétricas estacionárias de intensidades $I_1$ e $I_2$, são produzido no ponto $\mathcal O$ os campos magnéticos $\vec B_1(I_1)$ e $\vec B_2(I_2)$, respectivamente. O valor que deve ter o ângulo $\beta$ para que esses campos magnéticos satisfaçam à relação $2\vec B_T = -3\vec B_1$, onde $\vec B_T = \vec B_1 + \vec B_2$, deve ser dado por:`,
      figura: { pagina: 2, recorte: [0.505, 0.085, 0.91, 0.93] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I1', rotulo: 'Corrente 1', simbolo: 'I_1', valor: 10, unidade: 'A', min: 5, max: 30, passo: 1 },
        { id: 'I2', rotulo: 'Corrente 2', simbolo: 'I_2', valor: 10, unidade: 'A', min: 5, max: 30, passo: 1 },
        { id: 'a', rotulo: 'Raio 1', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.02, max: 0.04, passo: 0.002 },
        { id: 'b', rotulo: 'Raio 2', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.04, max: 0.06, passo: 0.002 },
        { id: 'beta', rotulo: 'Ângulo do arco', simbolo: r`\beta`, valor: 36, unidade: '°', min: 5, max: 300, passo: 1 },
      ],
      objetos: [
        { id: 'r1', tipo: 'fio', I: 'I1', a: ['0.085*cos(rad(90 - beta/2))', '0.085*sin(rad(90 - beta/2))', 0], b: [`a*cos(${A1(0)})`, `a*sin(${A1(0)})`, 0], infinito: 'a', rotulo: 'I₁' },
        ...arcoFio1,
        { id: 's1', tipo: 'fio', I: 'I1', a: [`a*cos(${A1(1)})`, `a*sin(${A1(1)})`, 0], b: ['0.085*cos(rad(90 + beta/2))', '0.085*sin(rad(90 + beta/2))', 0], infinito: 'b' },
        { id: 'r2', tipo: 'fio', I: 'I2', a: [0.085, 0, 0], b: ['b', 0, 0], infinito: 'a', rotulo: 'I₂' },
        ...arcoFio2,
        { id: 's2', tipo: 'fio', I: 'I2', a: ['-b', 0, 0], b: [-0.085, 0, 0], infinito: 'b' },
        { id: 'O', tipo: 'sonda', campo: 'B', pos: [0, 0, 0], rotulo: 'O' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Trechos retos dos dois fios', simbolo: 'B_r', expr: `${soma(['r1', 's1', 'r2', 's2'])}`, unidade: 'T', teoria: 0 },
        { rotulo: 'Fio 1', simbolo: 'B_1', expr: B1z, unidade: 'T', teoria: B1t },
        { rotulo: 'Fio 2', simbolo: 'B_2', expr: B2z, unidade: 'T', teoria: B2t },
        { rotulo: 'Campo total', simbolo: 'B_T', expr: 'z(B(0, 0, 0))', unidade: 'T', teoria: `${B1t} + ${B2t}` },
        { rotulo: 'Razão 2B_T/(−3B₁): vale 1 na relação pedida', simbolo: r`2B_T/(-3B_1)`, expr: `2*z(B(0, 0, 0))/(-3*${B1z})`, teoria: `2*(${B1t} + ${B2t})/(-3*${B1t})` },
        { rotulo: 'β que satisfaz a relação', simbolo: r`\beta^*`, expr: '2*a*I2/(5*b*I1)*180', unidade: '°' },
        { rotulo: 'β da alternativa (d)', simbolo: r`\beta_d`, expr: '4*a*I2/(5*b*I1)*180', unidade: '°' },
      ],
      passos: [
        {
          titulo: 'Só os arcos contam',
          texto: r`Todos os trechos retos estão em linhas que passam por $\mathcal O$: neles, $d\vec\ell\parallel\hat r$, e o campo é nulo. Sobram os arcos.`,
          parametros: { beta: 36 },
          medidas: [0],
        },
        {
          titulo: 'Os dois arcos',
          previsao: { pergunta: 'Em O, os campos dos dois arcos apontam…', opcoes: ['no mesmo sentido', 'em sentidos opostos'], correta: 1 },
          texto: r`Um arco de ângulo $\theta$ e raio $R$ dá $\mu_0I\theta/4\pi R$. O arco de cima é anti-horário, e o de baixo, horário:

$$B_1 = +\frac{\mu_0I_1\beta}{4\pi a},\qquad B_2 = -\frac{\mu_0I_2}{4b}.$$`,
          parametros: { beta: 36 },
          medidas: [1, 2],
        },
        {
          titulo: 'A relação pedida',
          texto: r`$2(B_1 + B_2) = -3B_1$ leva a $5B_1 = -2B_2$, ou seja:

$$5\frac{\mu_0I_1\beta}{4\pi a} = 2\frac{\mu_0I_2}{4b} \quad\Rightarrow\quad \beta = \left(\frac{2aI_2}{5bI_1}\right)\pi.$$

Com os valores da cena, $\beta = 36°$, e a razão medida vale 1. Mude as correntes e os raios: a razão continua 1 em $\beta^*$.`,
          parametros: { beta: 36 },
          medidas: [3, 4, 5],
        },
        {
          titulo: 'O gabarito marca a (d), com fator 4',
          texto: r`Nenhuma alternativa traz o fator 2. O gabarito oficial indica a **(d)**, $\left(\frac{4aI_2}{5bI_1}\right)\pi$, a mais próxima na forma.

Teste aqui: com $\beta = 72°$, a razão não dá 1, e sim $\frac16$. O fator 4 apareceria se o semicírculo valesse $\mu_0I_2/2b$, que é o campo do círculo **inteiro**.`,
          parametros: { beta: 72 },
          medidas: [4, 5, 6],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Biot-Savart', lab: 'ampere' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Arcos', texto: r`$B_1 = \mu_0I_1\beta/4\pi a$ e $B_2 = -\mu_0I_2/4b$.`, passo: 1 },
          { titulo: 'Relação', texto: r`$5B_1 = -2B_2$, e $\beta = (2aI_2/5bI_1)\pi$.`, passo: 2 },
          { titulo: 'Gabarito', texto: r`O oficial marca (d), com fator 4; a cena mostra que esse valor não satisfaz a relação.`, passo: 3 },
        ],
        resultado: r`A conta dá $\beta = \left(\dfrac{2aI_2}{5bI_1}\right)\pi$, que não está nas alternativas. O gabarito oficial marca **(d)**.`,
        errosComuns: [
          r`Tomar o semicírculo como $\mu_0I/2R$: esse é o círculo inteiro.`,
          r`Dar o mesmo sinal aos dois arcos: um é horário e o outro, anti-horário.`,
        ],
        oficial: {
          resposta: '(d)',
          observacao: r`**Divergência com o gabarito oficial.** A conta dá fator 2, e a (d) tem fator 4. Mantida como a marcada pela prova, mas a simulação mostra que ela não satisfaz $2\vec B_T = -3\vec B_1$.`,
        },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left(\dfrac{5aI_1}{4bI_2}\right)\pi$`, porque: r`Inverte a razão das correntes: $\beta$ cresce com $I_2$.` },
        { letra: 'b', texto: r`$\left(\dfrac{4bI_2}{5aI_1}\right)\pi$`, porque: r`Inverte a razão dos raios: $\beta$ cresce com $a$.` },
        { letra: 'c', texto: r`$\left(\dfrac{3aI_1}{5bI_2}\right)\pi$`, porque: r`Inverte a razão das correntes.` },
        { letra: 'd', texto: r`$\left(\dfrac{4aI_2}{5bI_1}\right)\pi$`, correta: true, porque: r`É a marcada pelo gabarito oficial e tem a forma certa, mas a conta dá fator 2, não 4: veja o último passo.` },
        { letra: 'e', texto: r`$\left(\dfrac{3aI_1}{4bI_2}\right)\pi$`, porque: r`Inverte a razão das correntes.` },
        { letra: 'f', texto: r`$\left(\dfrac{3I_2}{4bI_1}\right)\pi$`, porque: r`Não é adimensional, e um ângulo tem de ser.` },
        { letra: 'g', texto: r`$\left(\dfrac{4bI_1}{5aI_2}\right)\pi$`, porque: r`Inverte as duas razões.` },
        { letra: 'h', texto: r`$\left(\dfrac{5aI_1}{2bI_2}\right)\pi$`, porque: r`Inverte a razão das correntes e o fator $\frac25$.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Espira em repouso numa rampa, acima de um fio',
      resumo: 'A repulsão do fio equilibra a componente do peso.',
      enunciado: r`Uma espira quadrada condutora rígida de lado $a$ e massa $m$, percorrida por uma corrente elétrica estacionária de intensidade $I_0$, se encontra sobre uma superfície inclinada de um ângulo $\theta$ em relação a um plano horizontal, em cuja base existe um fio muito longo que é percorrido por uma corrente elétrica estacionária de intensidade $I$. Como a espira pode deslizar sem atrito sobre a superfície, teremos que o valor que deve ter o ângulo $\theta$ para que ela, até então paralela ao fio, permaneça na mesma posição, a uma distância $h$ dele, deve ser dado por:`,
      figura: { pagina: 3, recorte: [0.095, 0.08, 0.495, 0.91] },
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', camera: { pos: [12, 12, 20], alvo: [0, 3, -3] } },
      parametros: [
        { id: 'II', rotulo: 'Corrente no fio', simbolo: 'I', valor: 1000, unidade: 'A', min: 400, max: 1200, passo: 20 },
        { id: 'I0', rotulo: 'Corrente na espira', simbolo: 'I_0', valor: 100, unidade: 'A', min: 40, max: 120, passo: 5 },
        { id: 'a', rotulo: 'Lado', simbolo: 'a', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
        { id: 'h', rotulo: 'Distância ao fio', simbolo: 'h', valor: 0.03, unidade: 'm', min: 0.02, max: 0.05, passo: 0.002 },
        { id: 'mm', rotulo: 'Massa', simbolo: 'm', valor: 0.002, unidade: 'kg', min: 0.0016, max: 0.004, passo: 0.0002 },
        { id: 'th', rotulo: 'Inclinação', simbolo: r`\theta`, valor: 30, unidade: '°', min: 5, max: 85, passo: 0.5 },
      ],
      objetos: [
        { id: 'fw', tipo: 'fioInfinito', I: 'II', ponto: [0, 0, 0], direcao: 'x', rotulo: 'I' },
        { id: 'perto', tipo: 'fio', I: 'I0', a: noPlano('a/2', 'h'), b: noPlano('-a/2', 'h'), rotulo: 'I₀' },
        { id: 'esq', tipo: 'fio', I: 'I0', a: noPlano('-a/2', 'h'), b: noPlano('-a/2', 'h + a') },
        { id: 'longe', tipo: 'fio', I: 'I0', a: noPlano('-a/2', 'h + a'), b: noPlano('a/2', 'h + a') },
        { id: 'dir', tipo: 'fio', I: 'I0', a: noPlano('a/2', 'h + a'), b: noPlano('a/2', 'h') },
        {
          id: 'rampa',
          tipo: 'caminho',
          rotulo: 'rampa',
          seta: 0,
          pontos: [noPlano('-0.09', '0'), noPlano('-0.09', '0.12'), noPlano('0.09', '0.12'), noPlano('0.09', '0')],
        },
        { id: 'Fm', tipo: 'seta', papel: 'forca', origem: noPlano('0', 'h + a/2'), vetor: sv, comprimento: `2.5*cm*${FmT}/(mm*9.8*${Sn})`, rotulo: 'F magnética' },
        { id: 'Pd', tipo: 'seta', papel: 'forca', origem: noPlano('0', 'h + a/2'), vetor: `(0-1)*${sv}`, comprimento: '2.5*cm', rotulo: 'mg sen θ' },
      ],
      visual: { setasB: true, densidade: 9, planoSetas: 'yz', fontes: ['fw'] },
      medidas: [
        { rotulo: 'Força no lado próximo, ao longo da rampa', simbolo: 'F_p', expr: `dot(forca('perto','fw'), ${sv})`, unidade: 'N', teoria: 'mu0*II*I0*a/(2*pi*h)' },
        { rotulo: 'Força no lado distante', simbolo: 'F_l', expr: `dot(forca('longe','fw'), ${sv})`, unidade: 'N', teoria: '-mu0*II*I0*a/(2*pi*(h + a))' },
        { rotulo: 'Lados transversais', simbolo: 'F_t', expr: `dot(forca('esq','fw') + forca('dir','fw'), ${sv})`, unidade: 'N', teoria: 0 },
        { rotulo: 'Força magnética resultante', simbolo: 'F_m', expr: Fm, unidade: 'N', teoria: FmT },
        { rotulo: 'Componente do peso', simbolo: r`mg\sin\theta`, expr: `mm*9.8*${Sn}`, unidade: 'N' },
        { rotulo: 'Resultante ao longo da rampa', simbolo: r`F_m - mg\sin\theta`, expr: `${Fm} - mm*9.8*${Sn}`, unidade: 'N', teoria: `${FmT} - mm*9.8*${Sn}` },
        { rotulo: 'sen θ de equilíbrio', simbolo: r`\sin\theta_\text{eq}`, expr: `${Fm}/(mm*9.8)`, teoria: `${FmT}/(mm*9.8)` },
        { rotulo: 'Ângulo de equilíbrio', simbolo: r`\theta_\text{eq}`, expr: `deg(asin(${FmT}/(mm*9.8)))`, unidade: '°' },
      ],
      passos: [
        {
          titulo: 'Quem faz força ao longo da rampa',
          texto: r`Os lados transversais sofrem forças opostas, que se cancelam. Os lados paralelos ao fio sofrem forças ao longo da rampa: o lado próximo é repelido, porque sua corrente é oposta à do fio, e o distante é atraído.`,
          parametros: { th: 30 },
          medidas: [0, 1, 2],
          destacar: ['perto', 'longe'],
        },
        {
          titulo: 'A resultante magnética',
          previsao: { pergunta: 'A força magnética resultante empurra a espira…', opcoes: ['para cima da rampa', 'para baixo da rampa'], correta: 0 },
          texto: r`O lado próximo está mais perto do fio e vence:

$$F_m = \frac{\mu_0II_0a}{2\pi}\left(\frac1h - \frac1{h+a}\right) = \frac{\mu_0II_0a^2}{2\pi h(h+a)}.$$`,
          parametros: { th: 30 },
          medidas: [3],
        },
        {
          titulo: 'Equilíbrio',
          texto: r`Sem atrito, a força magnética tem de igualar a componente do peso ao longo da rampa:

$$mg\sin\theta = \frac{\mu_0II_0a^2}{2\pi h(h+a)} \quad\Rightarrow\quad \sin\theta = \frac{\mu_0I_0Ia^2}{2\pi mgh(h+a)}.$$

Com $\theta$ no valor de equilíbrio, as setas ficam iguais e a resultante se anula. Alternativa **(b)**.`,
          parametros: { th: 51 },
          medidas: [4, 5, 6, 7],
          destacar: ['Fm', 'Pd'],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Força entre correntes', lab: 'ampere' },
          { texto: 'Equilíbrio de forças' },
        ],
        etapas: [
          { titulo: 'Forças', texto: r`$F_p = \mu_0II_0a/2\pi h$ e $F_l = \mu_0II_0a/2\pi(h+a)$.`, passo: 0 },
          { titulo: 'Resultante', texto: r`$F_m = \mu_0II_0a^2/2\pi h(h+a)$.`, passo: 1 },
          { titulo: 'Equilíbrio', texto: r`$F_m = mg\sin\theta$.`, passo: 2 },
        ],
        resultado: r`$\sin\theta = \dfrac{\mu_0I_0Ia^2}{2\pi mgh(h+a)}$: alternativa **(b)**.`,
        errosComuns: [
          r`Considerar só o lado próximo: o distante também sofre força, no sentido oposto.`,
          r`Usar $\cos\theta$: a componente do peso ao longo da rampa é $mg\sin\theta$.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\sin\theta = \dfrac{\mu_0I_0Ih^2}{2\pi mga(h+a)}$`, porque: r`Troca $a$ e $h$.` },
        { letra: 'b', texto: r`$\sin\theta = \dfrac{\mu_0I_0Ia^2}{2\pi mgh(h+a)}$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\sin\theta = \dfrac{\mu_0I_0Ih^2}{2\pi mg(h^2+a^2)}$`, porque: r`O denominador não sai de $\frac1h - \frac1{h+a}$.` },
        { letra: 'd', texto: r`$\cos\theta = \dfrac{\mu_0I_0Ih^2}{\pi mga(h+a)}$`, porque: r`A componente do peso ao longo da rampa tem seno.` },
        { letra: 'e', texto: r`$\cos\theta = \dfrac{\mu_0I_0Iah}{4\pi mg(h^2+a^2)}$`, porque: r`A componente do peso ao longo da rampa tem seno.` },
        { letra: 'f', texto: r`$\sin\theta = \dfrac{\mu_0I_0Ih^2}{4\pi mga(h+a)}$`, porque: r`Troca $a$ e $h$, com fator errado.` },
        { letra: 'g', texto: r`$\cos\theta = \dfrac{\mu_0I_0Ia^2}{4\pi mg(h^2+a^2)}$`, porque: r`A componente do peso ao longo da rampa tem seno.` },
        { letra: 'h', texto: r`$\sin\theta = \dfrac{\mu_0I_0Ia^2}{4\pi mgh(h+a)}$`, porque: r`Fator 2 a mais no denominador: o campo do fio é $\mu_0I/2\pi r$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo magnético induzido num capacitor carregando',
      resumo: 'Ampère-Maxwell dentro das placas. O gabarito marca o campo de fora.',
      enunciado: r`No processo de carga de um capacitor de placas paralelas circulares de raio $a$, separadas por uma distância $d$ a carga varia no tempo como $q(t) = q_0(1 - e^{-t/\tau})$ onde $q_0$ e $\tau$ são constantes positivas e $a \gg d$. Ao longo desse processo o módulo do campo magnético induzido $B_\text{in}$, como função da distância $s$ ao eixo de simetria das placas na região entre elas ($s < a$), varia no tempo como:`,
      figura: { pagina: 3, recorte: [0.5, 0.08, 0.9, 0.87] },
      cena: {
        escala: 0.01,
        extensao: 9,
        unidade: 'cm',
        camera: { pos: [3, 5, 22], alvo: [0, 0, 0] },
        tempo: { escala: 5e-7, unidade: 'µs', passo: 1e-9, duracao: 5e-6 },
      },
      parametros: [
        { id: 'q0', rotulo: 'Carga final', simbolo: 'q_0', valor: 1e-5, unidade: 'C', min: 2e-6, max: 3e-5, passo: 1e-6 },
        { id: 'tau', rotulo: 'Tempo característico', simbolo: r`\tau`, valor: 1e-6, unidade: 's', min: 5e-7, max: 2e-6, passo: 1e-7 },
        { id: 'a', rotulo: 'Raio das placas', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'rs', rotulo: 'Raio do caminho', simbolo: 's', valor: 0.03, unidade: 'm', min: 0.004, max: 0.048, passo: 0.002 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0, unidade: 's', min: 0, max: 4e-6, passo: 1e-7 },
      ],
      objetos: [
        { id: 'cap', tipo: 'capacitor', rotulo: 'Capacitor', centro: [0, 0, 0], eixo: 'x', lado: '2*a', circular: true, d: 'd', Q: `q0*(1 - exp(0-${Tq}/tau))` },
        { id: 'Bin', tipo: 'campoB', valor: Bvalor, rotulo: 'B induzido' },
        { id: 'Amp', tipo: 'amperiana', centro: [0, 0, 0], normal: 'x', raio: 'rs', rotulo: 'C' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'x', raio: 'rs', oculta: true },
        { id: 'Sa', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'x', raio: 'a', oculta: true },
        { id: 'fe', tipo: 'caminho', pontos: [[-0.085, 0, 0], ['0-d/2', 0, 0]], rotulo: 'I_c' },
        { id: 'fd', tipo: 'caminho', pontos: [['d/2', 0, 0], [0.085, 0, 0]], rotulo: 'I_c' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'yz' },
      medidas: [
        { rotulo: 'Carga', simbolo: 'q', expr: "Q('cap')", unidade: 'C', teoria: `q0*(1 - exp(0-${Tq}/tau))` },
        { rotulo: 'Corrente de deslocamento em toda a placa', simbolo: r`\varepsilon_0\dot\Phi_E`, expr: "eps0*dfluxoE('Sa')", unidade: 'A', teoria: Ic },
        { rotulo: 'Corrente de deslocamento dentro de s', simbolo: r`I_d(s)`, expr: "eps0*dfluxoE('S')", unidade: 'A', teoria: `${Ic}*(rs/a)^2` },
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('Amp')", unidade: 'T·m', teoria: "mu0*eps0*dfluxoE('S')" },
        { rotulo: 'Campo induzido em s', simbolo: r`B_\text{in}`, expr: 'mag(B(0, rs, 0))', unidade: 'T', teoria: `mu0*q0*rs/(2*pi*tau*a^2)*exp(0-${Tq}/tau)` },
        { rotulo: 'O que a alternativa (g) daria', simbolo: r`B_{(g)}`, expr: `mu0*q0/(2*pi*tau*rs)*exp(0-${Tq}/tau)`, unidade: 'T' },
      ],
      graficos: [
        {
          titulo: 'B em função de s',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.002, ate: 0.085, rotulo: 's', unidade: 'm' },
          series: [{ rotulo: 'B(s)', expr: 'mag(B(0, ss, 0))', unidade: 'T' }],
        },
      ],
      passos: [
        {
          titulo: 'Entre as placas não há corrente',
          texto: r`Mas há campo elétrico variando. A lei de Ampère-Maxwell, num círculo de raio $s$ entre as placas, fica:

$$\oint\vec B\cdot d\vec\ell = \mu_0\varepsilon_0\frac{d\Phi_E}{dt}.$$

Por simetria, o lado esquerdo vale $2\pi sB_\text{in}$.`,
          parametros: { t0: 0 },
          medidas: [3],
        },
        {
          titulo: 'O fluxo dentro do círculo',
          previsao: { pergunta: 'A corrente de deslocamento dentro de s é, em relação à total…', opcoes: ['igual', 'proporcional a s/a', 'proporcional a (s/a)²'], correta: 2 },
          texto: r`Com $a\gg d$, $E = q/\varepsilon_0\pi a^2$ é uniforme, e o círculo só pega uma parte da área:

$$\Phi_E = \frac{q}{\varepsilon_0\pi a^2}\pi s^2 = \frac{qs^2}{\varepsilon_0a^2}.$$

A corrente de deslocamento dentro de $s$ é uma fração $(s/a)^2$ da total, $dq/dt$.`,
          parametros: { t0: 0 },
          medidas: [1, 2],
        },
        {
          titulo: 'O campo',
          texto: r`Com $dq/dt = (q_0/\tau)e^{-t/\tau}$:

$$2\pi sB_\text{in} = \mu_0\frac{s^2}{a^2}\frac{q_0}{\tau}e^{-t/\tau} \quad\Rightarrow\quad B_\text{in} = \left(\frac{\mu_0q_0s}{2\pi\tau a^2}\right)e^{-t/\tau}.$$

Cresce com $s$ e cai no tempo: é máximo no início do carregamento. Essa é a alternativa **(a)**.`,
          parametros: { t0: 1e-6 },
          medidas: [3, 4],
        },
        {
          titulo: 'O gabarito marca a (g)',
          texto: r`O gabarito oficial indica $\left(\frac{\mu_0q_0}{2\pi\tau s}\right)e^{-t/\tau}$. Esse é o campo para $s > a$, onde o círculo pega **toda** a corrente de deslocamento. Veja no gráfico: $B$ sobe até $s = a$ e só depois cai como $1/s$.

Como o enunciado pede $s < a$, a resposta certa é a **(a)**. A medida ao lado mostra quanto a (g) erraria aqui, por um fator $(a/s)^2$.`,
          parametros: { t0: 0 },
          medidas: [4, 5],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Ampère-Maxwell', lab: 'ampere' },
          { texto: 'Corrente de deslocamento' },
        ],
        etapas: [
          { titulo: 'Lei', texto: r`$2\pi sB_\text{in} = \mu_0\varepsilon_0\,d\Phi_E/dt$.`, passo: 0 },
          { titulo: 'Fluxo', texto: r`$\Phi_E = qs^2/\varepsilon_0a^2$.`, passo: 1 },
          { titulo: 'Campo', texto: r`$B_\text{in} = \dfrac{\mu_0q_0s}{2\pi\tau a^2}e^{-t/\tau}$.`, passo: 2 },
          { titulo: 'Gabarito', texto: r`O oficial marca (g), que vale para $s > a$.`, passo: 3 },
        ],
        resultado: r`$B_\text{in} = \left(\dfrac{\mu_0q_0s}{2\pi\tau a^2}\right)e^{-t/\tau}$: alternativa **(a)**.`,
        errosComuns: [
          r`Usar toda a corrente de carga em vez da fração dentro de $s$: isso dá o campo para $s > a$.`,
          r`Usar a carga $q(t)$ em vez de sua derivada: o que induz $\vec B$ é a variação de $\vec E$.`,
        ],
        oficial: {
          resposta: '(g)',
          observacao: r`**Divergência com o gabarito oficial.** Ele marca (g), mas a expressão de (g) é a do campo para $s > a$. Para $s < a$, como pede o enunciado, a lei de Ampère-Maxwell dá (a), e a simulação confirma isso.`,
        },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left(\dfrac{\mu_0q_0s}{2\pi\tau a^2}\right)e^{-t/\tau}$`, correta: true, porque: r`Correta pela lei de Ampère-Maxwell. O gabarito oficial marca a (g).` },
        { letra: 'b', texto: r`$\left(\dfrac{\mu_0q_0s}{2\pi\tau a^2}\right)(1 - e^{-t/\tau})$`, porque: r`Usa a carga, e não sua derivada.` },
        { letra: 'c', texto: r`$\left(\dfrac{\mu_0q_0a}{\pi\tau s^2}\right)(1 - e^{-t/\tau})$`, porque: r`Usa a carga, e $B$ diverge em $s = 0$.` },
        { letra: 'd', texto: r`$\left(\dfrac{\mu_0q_0}{2\pi\tau s}\right)(1 + e^{-t/\tau})$`, porque: r`Não sai da derivada de $q(t)$.` },
        { letra: 'e', texto: r`$\left(\dfrac{\mu_0q_0s^2}{2\pi\tau a^3}\right)e^{-2t/\tau}$`, porque: r`Potências de $s$ e de $e^{-t/\tau}$ erradas.` },
        { letra: 'f', texto: r`$\left(\dfrac{\mu_0q_0s^2}{2\pi\tau a^3}\right)(1 + e^{-t/\tau})$`, porque: r`Não sai da derivada de $q(t)$.` },
        { letra: 'g', texto: r`$\left(\dfrac{\mu_0q_0}{2\pi\tau s}\right)e^{-t/\tau}$`, porque: r`É a marcada pelo gabarito oficial, mas vale para $s > a$: aqui o círculo só pega a fração $(s/a)^2$ da corrente.` },
        { letra: 'h', texto: r`$\left(\dfrac{\mu_0q_0a}{\pi\tau s^2}\right)(1 - 2e^{t/\tau})$`, porque: r`Cresce sem limite no tempo, e o carregamento acaba.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo numa cavidade esférica não concêntrica',
      resumo: 'Superposição: esfera cheia mais uma esfera negativa. O campo é uniforme.',
      enunciado: r`Através da lei de Gauss pode-se mostrar que o campo elétrico no interior de uma esfera de raio $R$ com densidade volumar de cargas constante $\rho$ é dado por $\vec E = \left(\dfrac{\rho}{3\epsilon_0}\right)\vec r$. A partir desse resultado encontra-se que o campo elétrico $\vec E$, para um ponto $\mathcal P$ interno a uma cavidade esférica não concêntrica contida no interior de uma esfera uniformemente carregada, será dado por (considere as informações adicionais dadas na figura referentes aos vetores $\vec r$, $\vec r\,'$ e $\vec D$):`,
      figura: [
        { pagina: 4, recorte: [0.1, 0.08, 0.495, 0.29] },
        { pagina: 4, recorte: [0.265, 0.29, 0.495, 0.66] },
        {
          pagina: 4,
          recorte: [0.19, 0.655, 0.415, 0.925],
          mascaras: [
            { area: [0.19, 0.655, 0.24, 0.69], letra: '' },
            { area: [0.19, 0.905, 0.3, 0.925], letra: '' },
          ],
        },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Distribuição',
          valor: 3,
          opcoes: [
            { valor: 1, rotulo: 'só a esfera cheia (+ρ)' },
            { valor: 2, rotulo: 'só a esfera menor (−ρ)' },
            { valor: 3, rotulo: 'as duas: a cavidade' },
          ],
        },
        { id: 'rho0', rotulo: 'Densidade', simbolo: r`\rho`, valor: 1e-6, unidade: 'C/m³', min: 2e-7, max: 3e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio da esfera', simbolo: 'R', valor: 0.07, unidade: 'm', min: 0.07, max: 0.07 },
        { id: 'Rc', rotulo: 'Raio da cavidade', simbolo: 'R_c', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'Dx', rotulo: 'Centro da cavidade em x', simbolo: 'D_x', valor: 0.03, unidade: 'm', min: 0.02, max: 0.03, passo: 0.001 },
        { id: 'Dy', rotulo: 'Centro da cavidade em y', simbolo: 'D_y', valor: 0.015, unidade: 'm', min: 0, max: 0.03, passo: 0.001 },
        { id: 'px', rotulo: 'Ponto P, relativo à cavidade, em x', simbolo: 'x_P', valor: 0.012, unidade: 'm', min: -0.018, max: 0.018, passo: 0.001 },
        { id: 'py', rotulo: 'Ponto P, relativo à cavidade, em y', simbolo: 'y_P', valor: -0.008, unidade: 'm', min: -0.018, max: 0.018, passo: 0.001 },
      ],
      objetos: [
        { id: 'cheia', tipo: 'esfera', ativo: 'caso != 2', Q: 'rho0*4/3*pi*R^3', centro: [0, 0, 0], raio: 'R', rotulo: '+ρ' },
        { id: 'neg', tipo: 'esfera', ativo: 'caso != 1', Q: '-rho0*4/3*pi*Rc^3', centro: ['Dx', 'Dy', 0], raio: 'Rc', rotulo: '−ρ' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['Dx + px', 'Dy + py', 0], rotulo: 'P' },
        { id: 'vD', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: ['Dx', 'Dy', 0], comprimento: 'sqrt(Dx^2 + Dy^2)', rotulo: 'D' },
        { id: 'vr', tipo: 'seta', papel: 'neutro', origem: [0, 0, 0], vetor: ['Dx + px', 'Dy + py', 0], comprimento: 'sqrt((Dx + px)^2 + (Dy + py)^2)', rotulo: 'r' },
        { id: 'vrl', tipo: 'seta', papel: 'neutro', origem: ['Dx', 'Dy', 0], vetor: ['px', 'py', 0], comprimento: 'sqrt(px^2 + py^2)', rotulo: "r′" },
        { id: 'sE', tipo: 'seta', papel: 'E', origem: ['Dx + px', 'Dy + py', 0], vetor: 'E(Dx + px, Dy + py, 0)', comprimento: '2.5*cm', rotulo: 'E' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Esfera cheia em P, em x', simbolo: 'E_{1x}', ativo: 'caso != 2', expr: "x(Ede('cheia', Dx + px, Dy + py, 0))", unidade: 'V/m', teoria: 'rho0*(Dx + px)/(3*eps0)' },
        { rotulo: 'Esfera −ρ em P, em x', simbolo: 'E_{2x}', ativo: 'caso != 1', expr: "x(Ede('neg', Dx + px, Dy + py, 0))", unidade: 'V/m', teoria: '-rho0*px/(3*eps0)' },
        { rotulo: 'Campo total em x', simbolo: 'E_x', ativo: 'caso==3', expr: 'x(E(Dx + px, Dy + py, 0))', unidade: 'V/m', teoria: 'rho0*Dx/(3*eps0)' },
        { rotulo: 'Campo total em y', simbolo: 'E_y', ativo: 'caso==3', expr: 'y(E(Dx + px, Dy + py, 0))', unidade: 'V/m', teoria: 'rho0*Dy/(3*eps0)' },
        { rotulo: 'Módulo', simbolo: '|E|', ativo: 'caso==3', expr: 'mag(E(Dx + px, Dy + py, 0))', unidade: 'V/m', teoria: 'rho0*sqrt(Dx^2 + Dy^2)/(3*eps0)' },
      ],
      passos: [
        {
          titulo: 'Tampar o buraco',
          texto: r`A cavidade não tem simetria para Gauss. O truque: ela equivale a uma esfera **cheia** de densidade $+\rho$, mais uma esfera menor, no lugar do buraco, com densidade $-\rho$. Somadas, dão carga zero na cavidade.

Cada uma tem simetria própria, e os campos se somam.`,
          parametros: { caso: 3 },
        },
        {
          titulo: 'A esfera cheia',
          texto: r`Em $\mathcal P$, a distância ao centro da esfera grande é $\vec r$:

$$\vec E_1 = \frac{\rho}{3\varepsilon_0}\vec r.$$`,
          parametros: { caso: 1 },
          medidas: [0],
        },
        {
          titulo: 'A esfera negativa',
          texto: r`Em relação ao centro da cavidade, o ponto está em $\vec r\,'$, e a densidade é $-\rho$:

$$\vec E_2 = -\frac{\rho}{3\varepsilon_0}\vec r\,'.$$`,
          parametros: { caso: 2 },
          medidas: [1],
        },
        {
          titulo: 'A soma',
          previsao: { pergunta: 'Mover P dentro da cavidade muda o campo?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Como $\vec r = \vec D + \vec r\,'$:

$$\vec E = \frac{\rho}{3\varepsilon_0}(\vec r - \vec r\,') = \frac{\rho}{3\varepsilon_0}\vec D.$$

O campo é **uniforme** na cavidade: não depende de onde $\mathcal P$ está. Mude $x_P$ e $y_P$ e confira. Alternativa **(e)**.`,
          parametros: { caso: 3 },
          medidas: [2, 3, 4],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss', lab: 'gauss' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Superposição', texto: r`Cavidade = esfera $+\rho$ + esfera $-\rho$.`, passo: 0 },
          { titulo: 'Campos', texto: r`$\vec E_1 = \rho\vec r/3\varepsilon_0$ e $\vec E_2 = -\rho\vec r\,'/3\varepsilon_0$.`, passo: 2 },
          { titulo: 'Soma', texto: r`$\vec E = \rho\vec D/3\varepsilon_0$.`, passo: 3 },
        ],
        resultado: r`$\vec E = \left(\dfrac{\rho}{3\varepsilon_0}\right)\vec D$: alternativa **(e)**.`,
        errosComuns: [
          r`Aplicar Gauss direto na cavidade: sem simetria, $E$ não sai da integral.`,
          r`Esquecer o sinal de $-\rho$: isso dá $\vec r + \vec r\,'$.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\left(\dfrac{\rho}{3\epsilon_0}\right)\vec r\,'$`, porque: r`É só a contribuição da esfera menor, com o sinal trocado.` },
        { letra: 'b', texto: r`$\left(\dfrac{\rho}{3\epsilon_0}\right)(\vec r + \vec r\,')$`, porque: r`Esquece o sinal da esfera $-\rho$.` },
        { letra: 'c', texto: r`$\left(\dfrac{\rho D}{3\epsilon_0}\right)(\hat r + \hat r\,')$`, porque: r`Mistura o módulo de $\vec D$ com versores que dependem do ponto.` },
        { letra: 'd', texto: r`$\left(\dfrac{\rho D}{3\epsilon_0}\right)\hat r\,'$`, porque: r`O módulo está certo, mas a direção é a de $\vec D$.` },
        { letra: 'e', texto: r`$\left(\dfrac{\rho}{3\epsilon_0}\right)\vec D$`, correta: true, porque: r`Correta.` },
        { letra: 'f', texto: r`$\left(\dfrac{\rho r'}{3\epsilon_0}\right)\hat D$`, porque: r`A direção está certa, mas o módulo não depende de $r'$.` },
        { letra: 'g', texto: r`$\left(\dfrac{\rho r}{3\epsilon_0}\right)\hat r\,'$`, porque: r`O campo é uniforme, e não depende de $r$.` },
        { letra: 'h', texto: r`$\left(\dfrac{\rho r}{3\epsilon_0}\right)\hat D$`, porque: r`A direção está certa, mas o módulo não depende de $r$.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Barra freada num trilho em U',
      resumo: 'Faraday, Lenz e Newton: a velocidade cai exponencialmente.',
      enunciado: r`Uma barra condutora de comprimento $L$, massa $m$ e resistência elétrica $R$ pode se mover sem atrito sobre trilhos metálicos de resistência elétrica desprezível, que estão interligados em forma de U, fechando assim um circuito elétrico. Todos os elementos do sistema, que se encontra apoiado em uma superfície horizontal, estão inicialmente em repouso até que em um certo instante é dado um impulso à barra, lhe comunicando uma velocidade inicial $\vec v_0 = v_0\hat x$, onde $v_0 > 0$. O sistema, como um todo, está imerso no campo magnético uniforme e estacionário $\vec B = B_0\hat z$, onde $B_0 > 0$ (vide figura).

(a) Obtenha a expressão para o fluxo do campo magnético $\Phi_B(x)$ através do circuito como função da posição $x(t)$ da barra. (0,3 ponto) (b) Determine a intensidade e o sentido da corrente elétrica induzida $I_\text{ind}$ que percorrerá a barra, como função de sua velocidade $v = dx/dt$. (0,5 ponto) (c) Aplicando a segunda lei de Newton, obtenha a aceleração da barra $a(t)$ como função de sua velocidade $v(t)$. (1,0 ponto) (d) Obtenha a expressão para $v(t)$ e, com isso, determine a expressão para o módulo $F_m(t)$ da força magnética que atua na barra, como função do tempo. (1,0 ponto) (e) Obtenha o módulo $v_f$ da velocidade final da barra e o instante $t_{1/2}$ para o qual ela atinge a metade de seu valor inicial. (0,4 ponto) (f) Faça um gráfico de $v(t)$, destacando os aspectos mais relevantes de seu comportamento. (0,4 ponto) (g) Obtenha a energia total do sistema $E_J$ que é dissipada por efeito Joule. (0,4 ponto)`,
      figura: { pagina: 4, recorte: [0.505, 0.09, 0.91, 0.93] },
      cena: {
        escala: 0.01,
        extensao: 10,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [7, 0, 22], alvo: [7, 0, 0] },
        tempo: { escala: 0.25, unidade: 's', passo: 0.001, duracao: 1.6 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.3, max: 0.8, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento da barra', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.06, max: 0.1, passo: 0.005 },
        { id: 'mm', rotulo: 'Massa', simbolo: 'm', valor: 0.02, unidade: 'kg', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'Rr', rotulo: 'Resistência', simbolo: 'R', valor: 0.02, unidade: 'Ω', min: 0.01, max: 0.04, passo: 0.002 },
        { id: 'v0', rotulo: 'Velocidade inicial', simbolo: 'v_0', valor: 0.4, unidade: 'm/s', min: 0.2, max: 0.5, passo: 0.02 },
        { id: 'x0', rotulo: 'Posição inicial', simbolo: 'x_0', valor: 0.03, unidade: 'm', min: 0.02, max: 0.06, passo: 0.005 },
        { id: 't0', rotulo: 'Instante inicial', simbolo: 't_0', valor: 0, unidade: 's', min: 0, max: 1.2, passo: 0.01 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'S', tipo: 'espiraSensora', centro: [`${X}/2`, 0, 0], normal: 'z', largura: X, altura: 'L', eixoU: 'x', R: 'Rr', rotulo: 'circuito' },
        { id: 'tr', tipo: 'caminho', seta: 0, pontos: [[0.17, 'L/2', 0], [0, 'L/2', 0], [0, '-L/2', 0], [0.17, '-L/2', 0]], rotulo: 'trilhos' },
        { id: 'bar', tipo: 'caminho', seta: 0.55, pontos: [[X, 'L/2', 0], [X, '-L/2', 0]], rotulo: 'barra' },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: [X, 0, 0], vetor: [1, 0, 0], comprimento: `5*cm*${V}/v0 + 0.5*cm`, rotulo: 'v' },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: [X, 0.018, 0], vetor: [-1, 0, 0], comprimento: `3.5*cm*${V}/v0 + 0.5*cm`, rotulo: 'F_m' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo', simbolo: r`\Phi_B`, expr: "fluxoB('S')", unidade: 'Wb', teoria: `B0*L*${X}` },
        { rotulo: 'fem', simbolo: r`\mathcal E`, expr: "fem('S')", unidade: 'V', teoria: `0-B0*L*${V}` },
        { rotulo: 'Corrente (negativa: horária)', simbolo: 'I', expr: "Iind('S')", unidade: 'A', teoria: `0-B0*L*${V}/Rr` },
        { rotulo: 'Força magnética na barra', simbolo: 'F_x', expr: "Iind('S')*L*B0", unidade: 'N', teoria: `0-B0^2*L^2*${V}/Rr` },
        { rotulo: 'Velocidade, pela fem', simbolo: 'v', expr: "-fem('S')/(B0*L)", unidade: 'm/s', teoria: V },
        { rotulo: 'ma, com a solução v(t)', simbolo: 'ma', expr: `mm*(0-${gam})*${V}`, unidade: 'N', teoria: "Iind('S')*L*B0" },
        { rotulo: 'Taxa de amortecimento', simbolo: r`\gamma`, expr: gam, unidade: '1/s' },
        { rotulo: 'Meia-vida', simbolo: 't_{1/2}', expr: `ln(2)/${gam}`, unidade: 's' },
        { rotulo: 'Fração da velocidade inicial', simbolo: 'v/v_0', expr: `${V}/v0`, teoria: `exp(0-${gam}*${Td})` },
        { rotulo: 'Energia cinética perdida', simbolo: r`\Delta K`, expr: `mm*(v0^2 - ${V}^2)/2`, unidade: 'J', teoria: `(B0*L*v0)^2/(2*Rr*${gam})*(1 - exp(-2*${gam}*${Td}))` },
        { rotulo: 'Energia cinética inicial', simbolo: 'K_0', expr: 'mm*v0^2/2', unidade: 'J', teoria: `(B0*L*v0)^2/(2*Rr*${gam})` },
      ],
      graficos: [
        {
          titulo: 'v/v₀ em função de γt',
          tipo: 'perfil',
          x: { variavel: 'gt', de: 0, ate: 5, rotulo: 'γt' },
          series: [{ rotulo: 'v/v₀', expr: 'exp(0-gt)' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Fluxo',
          texto: r`O circuito tem área $Lx$, e $\vec B$ é uniforme e perpendicular a ele:

$$\Phi_B = BLx.$$`,
          parametros: { t0: 0 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Corrente induzida',
          previsao: { pergunta: 'Com a barra indo para a direita, a corrente no circuito é…', opcoes: ['horária', 'anti-horária'], correta: 0 },
          texto: r`$$\mathcal E_\text{ind} = -\frac{d\Phi_B}{dt} = -BLv,\qquad I_\text{ind} = -\frac{BLv}{R}.$$

O fluxo para fora da página aumenta: a corrente cria campo para dentro, no sentido **horário**. Na barra, ela desce.`,
          parametros: { t0: 0 },
          medidas: [1, 2],
        },
        {
          item: 'c',
          titulo: '(c) Aceleração',
          texto: r`Peso e normal se cancelam, e não há atrito: sobra $\vec F_m = I\vec L\times\vec B$, que aponta para a esquerda e freia a barra (Lenz).

$$F_x = -\frac{B^2L^2v}{R} = ma \quad\Rightarrow\quad a(t) = -\frac{B^2L^2}{mR}v(t).$$`,
          parametros: { t0: 0 },
          medidas: [3],
        },
        {
          item: 'd',
          titulo: '(d) Velocidade e força',
          texto: r`Com $\gamma = B^2L^2/mR$, a equação é $dv/dt = -\gamma v$. Separando as variáveis:

$$v(t) = v_0e^{-\gamma t},\qquad F_m(t) = \frac{B^2L^2v_0}{R}e^{-\gamma t}.$$

Na cena, a força vem da fem medida no circuito, e $ma$ vem de $v(t)$: as duas batem em qualquer instante.`,
          parametros: { t0: 0.1 },
          medidas: [3, 5, 6],
        },
        {
          item: 'e',
          titulo: '(e) Final e meia-vida',
          texto: r`$e^{-\gamma t}\to 0$: $v_f = 0$, e a barra para num tempo infinito, depois de andar $v_0/\gamma$. Metade da velocidade:

$$v_0e^{-\gamma t_{1/2}} = \frac{v_0}2 \quad\Rightarrow\quad t_{1/2} = \frac{\ln2}{\gamma} \approx \frac{0{,}693}{\gamma}.$$`,
          parametros: { t0: 0.1733 },
          medidas: [7, 8],
        },
        {
          item: 'f',
          titulo: '(f) O gráfico',
          texto: r`Queda exponencial: começa em $v_0$, com tangente que corta o eixo em $\gamma t = 1$, e passa por $v_0/2$ em $\gamma t \approx 0{,}69$. Depois de $\gamma t = 5$, restam menos de 1%.`,
          parametros: { t0: 0.1733 },
          medidas: [8],
        },
        {
          item: 'g',
          titulo: '(g) Energia dissipada',
          texto: r`$$E_J = \int_0^\infty RI^2\,dt = \frac{(BLv_0)^2}{R}\int_0^\infty e^{-2\gamma t}\,dt = \frac{(BLv_0)^2}{2R\gamma} = \frac12mv_0^2.$$

Toda a energia cinética vira calor no resistor. Nada mais a dissipa: não há atrito.`,
          parametros: { t0: 1.2 },
          medidas: [9, 10],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Faraday e de Lenz', lab: 'faraday' },
          { texto: 'Força sobre corrente', lab: 'ampere' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$\Phi_B = BLx$.`, passo: 0 },
          { titulo: '(b)', texto: r`$I_\text{ind} = -BLv/R$, sentido horário.`, passo: 1 },
          { titulo: '(c)', texto: r`$a = -(B^2L^2/mR)\,v$.`, passo: 2 },
          { titulo: '(d)', texto: r`$v = v_0e^{-\gamma t}$ e $F_m = (B^2L^2v_0/R)e^{-\gamma t}$.`, passo: 3 },
          { titulo: '(e)', texto: r`$v_f = 0$ e $t_{1/2} = \ln2/\gamma$.`, passo: 4 },
          { titulo: '(g)', texto: r`$E_J = \frac12mv_0^2$.`, passo: 6 },
        ],
        resultado: r`$\Phi_B = BLx$; $I_\text{ind} = -BLv/R$ (horária); $a = -\gamma v$; $v = v_0e^{-\gamma t}$; $v_f = 0$; $t_{1/2} = \ln2/\gamma$; $E_J = \frac12mv_0^2$, com $\gamma = B^2L^2/mR$.`,
        errosComuns: [
          r`Tratar a força como constante: ela é proporcional a $v$, e por isso a queda é exponencial.`,
          r`Esquecer o sinal de Lenz: a força sobre a barra é sempre contrária à velocidade.`,
          r`Achar que a barra para em tempo finito: $v$ só tende a zero.`,
        ],
        oficial: { resposta: r`$\Phi_B = BLx$; $I_\text{ind} = -BLv/R$, horária; $\vec a = -(B^2L^2/mR)\,v\,\hat x$; $v = v_0e^{-\gamma t}$; $\vec F_m = -(B^2L^2v_0/R)e^{-\gamma t}\hat x$; $v_f = 0$; $t_{1/2} = \ln2/\gamma$; $E_J = \frac12mv_0^2$.` },
      },
      respostas: [
        { item: 'a', texto: r`$\Phi_B = BLx$`, pontos: 0.3, criterio: 'Fluxo por uma área retangular.' },
        { item: 'b', texto: r`$I_\text{ind} = -BLv/R$, sentido horário`, pontos: 0.5, criterio: 'Módulo e sentido.' },
        { item: 'c', texto: r`$\vec a = -(B^2L^2/mR)\,v\,\hat x$`, pontos: 1, criterio: 'Força magnética sobre a barra e segunda lei de Newton.' },
        { item: 'd', texto: r`$v = v_0e^{-\gamma t}$; $F_m = (B^2L^2v_0/R)e^{-\gamma t}$`, pontos: 1, criterio: 'Integração por separação de variáveis.' },
        { item: 'e', texto: r`$v_f = 0$; $t_{1/2} = \ln2/\gamma \approx 0{,}693/\gamma$`, pontos: 0.4, criterio: 'Limite e inversão da exponencial.' },
        { item: 'f', texto: r`Exponencial decrescente de $v_0$ a zero, com $v_0/2$ em $\gamma t \approx 0{,}69$`, pontos: 0.4, criterio: 'Gráfico com os pontos relevantes destacados.' },
        { item: 'g', texto: r`$E_J = \frac12mv_0^2$`, pontos: 0.4, criterio: 'Integral de RI² de zero a infinito.' },
      ],
    },
  ],
}

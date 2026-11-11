import type { ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Exercício 6: triângulo equilátero de lado 6a em volta do tubo do toroide (só desenho). */
const tri6 = [0, 1, 2, 3].map((k) => {
  const g = (90 + 120 * k) * (Math.PI / 180)
  return [`Rt + 2*sqrt(3)*a*${Math.cos(g)}`, 0, `2*sqrt(3)*a*${Math.sin(g)}`] as [string, number, string]
})

export const lista_09: ProvaInput = {
  id: 'lista-09',
  titulo: 'Lista 9 · Indutância',
  subtitulo: 'Física III-A · 2020/1 · sem gabarito da monitoria',
  questoes: [
    /* ───────────────────────── 1 ───────────────────────── */
    {
      id: 'e1',
      numero: '1',
      secao: 'Médio',
      titulo: 'Dois solenoides coaxiais',
      resumo: 'L/l = μ₀n₂²πb² e M/l = μ₀n₁n₂πa², mesmo com o interno deslocado.',
      figura: { pagina: 1, recorte: [0.089, 0.216, 0.936, 0.404] },
      cena: { escala: 0.01, extensao: 32, unidade: 'cm', camera: { pos: [22, 14, 30], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente no solenoide externo', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'n2', rotulo: 'Espiras por metro (externo)', simbolo: 'n_2', valor: 1000, unidade: '1/m', min: 1000, max: 1000, passo: 10 },
        { id: 'n1', rotulo: 'Espiras por metro (interno)', simbolo: 'n_1', valor: 1500, unidade: '1/m', min: 500, max: 3000, passo: 50 },
        { id: 'b', rotulo: 'Raio do externo', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03, passo: 0.001 },
        { id: 'a', rotulo: 'Raio do interno', simbolo: 'a', valor: 0.012, unidade: 'm', min: 0.006, max: 0.02, passo: 0.001 },
        { id: 'd', rotulo: 'Deslocamento do interno', simbolo: 'd', valor: 0, unidade: 'm', min: 0, max: 0.009, passo: 0.001 },
      ],
      objetos: [
        { id: 'ext', tipo: 'solenoide', I: 'I0', centro: [0, 0, 0], eixo: 'z', raio: 'b', comprimento: 0.6, N: 'n2*0.6', rotulo: 'externo (n₂)' },
        { id: 'int', tipo: 'solenoide', I: 0, centro: ['d', 0, 0], eixo: 'z', raio: 'a', comprimento: 0.4, N: 'n1*0.4', rotulo: 'interno (n₁)' },
        { id: 'S', tipo: 'espiraSensora', centro: ['d', 0, 0], normal: 'z', raio: 'a', oculta: true },
      ],
      visual: { setasB: false },
      medidas: [
        { rotulo: 'Campo no interior do externo', simbolo: r`B = \mu_0 n_2 I`, expr: '1e3*mag(B(0, 0, 0))', unidade: 'mT', teoria: '1e3*mu0*n2*I0' },
        { rotulo: 'Auto-indutância por comprimento do externo', simbolo: r`\frac{L}{l} = \mu_0 n_2^2\pi b^2`, expr: '1e3*n2*mag(B(0, 0, 0))*pi*b^2/I0', unidade: 'mH/m', teoria: '1e3*mu0*n2^2*pi*b^2' },
        { rotulo: 'Indutância mútua por comprimento', simbolo: r`\frac{M}{l} = \mu_0 n_1 n_2\pi a^2`, expr: "1e3*n1*fluxoB('S')/I0", unidade: 'mH/m', teoria: '1e3*mu0*n1*n2*pi*a^2' },
      ],
      passos: [
        { titulo: '(a) Campo', texto: r`Solenoide longo: $B = \mu_0 n_2 I$, uniforme no interior.`, medidas: [0] },
        {
          titulo: '(b) Auto-indutância',
          texto: r`Num trecho $l$ há $n_2 l$ espiras, cada uma com fluxo $\mu_0 n_2 I\pi b^2$: $\dfrac{L}{l} = \dfrac{n_2\Phi}{I} = \mu_0 n_2^2\pi b^2$.`,
          medidas: [1],
        },
        {
          titulo: '(c) Mútua',
          texto: r`Cada espira do interno abraça só $\pi a^2$ do campo do externo: $\dfrac{M}{l} = \dfrac{n_1\,\mu_0 n_2 I\pi a^2}{I} = \mu_0 n_1 n_2\pi a^2$.`,
          parametros: { d: 0 },
          medidas: [2],
        },
        {
          titulo: '(d) Deslocado',
          texto: r`O campo do externo é **uniforme** no seu interior: deslocar o interno (sem sair) não muda o fluxo por espira. $M$ continua $\mu_0 n_1 n_2\pi a^2\,l$.`,
          parametros: { d: 0.008 },
          medidas: [2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$B = \mu_0 n_2 I$` },
        { item: '(b)', texto: r`$L/l = \mu_0 n_2^2\pi b^2$` },
        { item: '(c)', texto: r`$M/l = \mu_0 n_1 n_2\pi a^2$` },
        { item: '(d)', texto: r`A mesma: $M/l = \mu_0 n_1 n_2\pi a^2$, porque o campo do externo é uniforme.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Fluxo concatenado e indutância', lab: 'faraday' }],
        etapas: [
          { titulo: 'Fluxo por espira', texto: r`$\mu_0 n_2 I$ vezes a área abraçada.`, passo: 1 },
          { titulo: 'Contar espiras', texto: r`$n_2 l$ para $L$, $n_1 l$ para $M$.`, passo: 2 },
        ],
        resultado: r`$L/l = \mu_0n_2^2\pi b^2$; $M/l = \mu_0n_1n_2\pi a^2$, independente de $d$.`,
        errosComuns: ['Usar a área $\\pi b^2$ na mútua: o interno só abraça $\\pi a^2$.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada, conferidas pela simulação.' },
      },
    },

    /* ───────────────────────── 2 ───────────────────────── */
    {
      id: 'e2',
      numero: '2',
      secao: 'Difícil',
      titulo: 'Indutância do cabo coaxial pelo fluxo',
      resumo: 'Φ = (μ₀Il/2π) ln(b/a) e L/l = (μ₀/2π) ln(b/a).',
      figura: { pagina: 1, recorte: [0.089, 0.405, 0.936, 0.574] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [10, 9, 12], alvo: [2, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.005, max: 0.02, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.001 },
        { id: 'l', rotulo: 'Comprimento do retângulo', simbolo: 'l', valor: 0.08, unidade: 'm', min: 0.02, max: 0.1, passo: 0.002 },
      ],
      objetos: [
        { id: 'in', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', I: 'I0', rotulo: 'cilindro (I)' },
        { id: 'out', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: '1.04*b', raioInterno: 'b', I: '0-I0', rotulo: 'casca (−I)' },
        { id: 'S', tipo: 'espiraSensora', centro: ['(a + b)/2', 0, 0], normal: 'y', largura: 'b - a', altura: 'l', eixoU: 'x', rotulo: 'retângulo' },
      ],
      medidas: [
        { rotulo: 'Campo no meio da região', simbolo: r`B = \frac{\mu_0 I}{2\pi s}`, expr: '1e6*mag(B((a + b)/2, 0, 0))', unidade: 'μT', teoria: '1e6*mu0*I0/(pi*(a + b))' },
        { rotulo: 'Fluxo no retângulo', simbolo: r`\Phi = \frac{\mu_0 I l}{2\pi}\ln\frac ba`, expr: "1e6*abs(fluxoB('S'))", unidade: 'μWb', teoria: '1e6*mu0*I0*l/(2*pi)*ln(b/a)' },
        { rotulo: 'Indutância por comprimento', simbolo: r`\frac{L}{l} = \frac{\mu_0}{2\pi}\ln\frac ba`, expr: "1e6*abs(fluxoB('S'))/(I0*l)", unidade: 'μH/m', teoria: '1e6*mu0/(2*pi)*ln(b/a)' },
      ],
      passos: [
        { titulo: '(a) Campo', texto: r`Amperiana de raio $s$ entre os condutores: $B = \dfrac{\mu_0 I}{2\pi s}$.`, medidas: [0] },
        { titulo: '(b) Fluxo', texto: r`Faixas de largura $ds$ e comprimento $l$: $\Phi = \displaystyle\int_a^b\frac{\mu_0 I}{2\pi s}l\,ds = \frac{\mu_0 I l}{2\pi}\ln\frac ba$.`, destacar: ['S'], medidas: [1] },
        { titulo: '(c) Indutância', texto: r`$L = \Phi/I$: $\dfrac{L}{l} = \dfrac{\mu_0}{2\pi}\ln\dfrac ba$.`, medidas: [2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$B = \dfrac{\mu_0 I}{2\pi s}$` },
        { item: '(b)', texto: r`$\Phi = \dfrac{\mu_0 I l}{2\pi}\ln\dfrac ba$` },
        { item: '(c)', texto: r`$\dfrac{L}{l} = \dfrac{\mu_0}{2\pi}\ln\dfrac ba$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Ampère no cabo coaxial', lab: 'ampereJ' }, { texto: 'Indutância como fluxo por corrente', lab: 'faraday' }],
        etapas: [
          { titulo: 'Integrar', texto: r`O campo cai com $1/s$, então o fluxo dá um logaritmo.`, passo: 1 },
          { titulo: 'Dividir', texto: r`$L = \Phi/I$, por unidade de comprimento.`, passo: 2 },
        ],
        resultado: r`$L/l = \frac{\mu_0}{2\pi}\ln(b/a)$.`,
        errosComuns: ['Multiplicar $B$ no meio pela área, como se fosse uniforme.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada, conferidas pela simulação. Conta só a região entre os condutores, como o enunciado pede.' },
      },
    },

    /* ───────────────────────── 3 ───────────────────────── */
    {
      id: 'e3',
      numero: '3',
      secao: 'Difícil',
      titulo: 'Indutância do cabo coaxial pela energia',
      resumo: 'U = (μ₀I²l/4π) ln(b/a) e L = 2U/I²: o mesmo resultado.',
      figura: { pagina: 1, recorte: [0.089, 0.576, 0.936, 0.718] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [1, -2, 16], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'a', rotulo: 'Raio do cilindro', simbolo: 'a', valor: 0.01, unidade: 'm', min: 0.005, max: 0.02, passo: 0.001 },
        { id: 'b', rotulo: 'Raio da casca', simbolo: 'b', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.001 },
        { id: 's', rotulo: 'Distância ao eixo', simbolo: 's', valor: 0.02, unidade: 'm', min: 0.011, max: 0.038, passo: 0.001 },
      ],
      objetos: [
        { id: 'in', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: 'a', I: 'I0', rotulo: 'cilindro (I)' },
        { id: 'out', tipo: 'cilindroCorrente', ponto: [0, 0, 0], direcao: 'z', raio: '1.04*b', raioInterno: 'b', I: '0-I0', rotulo: 'casca (−I)' },
        { id: 'P', tipo: 'sonda', campo: 'B', pos: ['s', 0, 0], arraste: { param: 's', eixo: 'x' }, rotulo: 's' },
      ],
      medidas: [
        { rotulo: 'Densidade de energia em s', simbolo: r`u = \frac{B^2}{2\mu_0} = \frac{\mu_0 I^2}{8\pi^2 s^2}`, expr: 'mag(B(s, 0, 0))^2/(2*mu0)', unidade: 'J/m³', teoria: 'mu0*I0^2/(8*pi^2*s^2)' },
        { rotulo: 'Energia por comprimento', simbolo: r`\frac{U}{l} = \frac{\mu_0 I^2}{4\pi}\ln\frac ba`, expr: '1e3*mu0*I0^2/(4*pi)*ln(b/a)', unidade: 'mJ/m' },
        { rotulo: 'Indutância por comprimento (2U/I²)', simbolo: r`\frac{L}{l} = \frac{\mu_0}{2\pi}\ln\frac ba`, expr: '1e6*2*(mu0*I0^2/(4*pi)*ln(b/a))/I0^2', unidade: 'μH/m' },
      ],
      graficos: [
        {
          titulo: 'Densidade de energia u(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.011, ate: 0.038, rotulo: 's', unidade: 'm', marca: 's' },
          series: [{ rotulo: 'u', expr: 'mag(B(ss, 0, 0))^2/(2*mu0)', unidade: 'J/m³' }],
        },
      ],
      passos: [
        { titulo: '(a) Densidade de energia', texto: r`$u = \dfrac{B^2}{2\mu_0} = \dfrac{\mu_0 I^2}{8\pi^2 s^2}$, entre os condutores.`, medidas: [0] },
        { titulo: '(b) Energia', texto: r`Com cascas de volume $2\pi s\,l\,ds$: $U = \displaystyle\int_a^b\frac{\mu_0 I^2}{8\pi^2 s^2}2\pi s\,l\,ds = \frac{\mu_0 I^2 l}{4\pi}\ln\frac ba$.`, medidas: [1] },
        { titulo: '(c) Indutância', texto: r`$U = \tfrac12 L I^2$, então $\dfrac{L}{l} = \dfrac{\mu_0}{2\pi}\ln\dfrac ba$: igual ao exercício anterior.`, medidas: [2] },
      ],
      respostas: [
        { item: '(a)', texto: r`$u = \dfrac{\mu_0 I^2}{8\pi^2 s^2}$` },
        { item: '(b)', texto: r`$U = \dfrac{\mu_0 I^2 l}{4\pi}\ln\dfrac ba$` },
        { item: '(c)', texto: r`$\dfrac{L}{l} = \dfrac{\mu_0}{2\pi}\ln\dfrac ba$, o mesmo do método do fluxo.` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Energia no campo magnético', lab: 'ampereJ' }],
        etapas: [
          { titulo: 'Densidade', texto: r`$B^2/2\mu_0$.`, passo: 0 },
          { titulo: 'Integral', texto: r`Volume em cascas cilíndricas.`, passo: 1 },
          { titulo: 'Igualar', texto: r`$U = LI^2/2$.`, passo: 2 },
        ],
        resultado: r`$L/l = \frac{\mu_0}{2\pi}\ln(b/a)$ pelos dois caminhos.`,
        errosComuns: ['Esquecer o fator $\\tfrac12$ em $U = \\tfrac12LI^2$.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada; a densidade de energia é conferida pela simulação.' },
      },
    },

    /* ───────────────────────── 4 ───────────────────────── */
    {
      id: 'e4',
      numero: '4',
      secao: 'Médio',
      titulo: 'Toroide: campo e auto-indutância',
      resumo: 'B = μ₀NI/2πr dentro; fino, L ≈ μ₀N²A/2πR.',
      figura: { pagina: 1, recorte: [0.089, 0.719, 0.936, 0.869] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [9, 11, 13], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'N', rotulo: 'Voltas', simbolo: 'N', valor: 400, unidade: '', min: 400, max: 400, passo: 10 },
        { id: 'Rt', rotulo: 'Raio médio', simbolo: 'R', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06, passo: 0.001 },
        { id: 'rm', rotulo: 'Raio da seção', simbolo: 'a', valor: 0.007, unidade: 'm', min: 0.004, max: 0.01, passo: 0.0005 },
      ],
      objetos: [
        { id: 'tor', tipo: 'toroide', I: 'I0', centro: [0, 0, 0], eixo: 'y', raioMaior: 'Rt', raioMenor: 'rm', N: 'N', rotulo: 'toroide' },
        { id: 'S', tipo: 'espiraSensora', centro: ['Rt', 0, 0], normal: 'z', raio: '2*rm', oculta: true },
      ],
      medidas: [
        { rotulo: 'Campo no raio médio', simbolo: r`B = \frac{\mu_0 N I}{2\pi R}`, expr: '1e3*mag(B(Rt, 0, 0))', unidade: 'mT', teoria: '1e3*mu0*N*I0/(2*pi*Rt)' },
        { rotulo: 'Auto-indutância (fluxo na seção)', simbolo: r`L = \frac{N\Phi}{I}`, expr: "1e3*N*abs(fluxoB('S'))/I0", unidade: 'mH', teoria: '1e3*mu0*N^2*(Rt - sqrt(Rt^2 - rm^2))' },
        { rotulo: 'Aproximação de toroide fino', simbolo: r`L \approx \frac{\mu_0 N^2 A}{2\pi R}`, expr: '1e3*mu0*N^2*pi*rm^2/(2*pi*Rt)', unidade: 'mH' },
      ],
      passos: [
        { titulo: '(a) Ampère', texto: r`Uma circunferência de raio $r$ dentro do tubo envolve $NI$: $B\cdot2\pi r = \mu_0 NI$, então $B = \dfrac{\mu_0 NI}{2\pi r}$. Fora do tubo, $B = 0$.`, medidas: [0] },
        {
          titulo: '(b) Toroide fino',
          texto: r`Com a seção pequena, $B \approx \mu_0 NI/2\pi R$ em toda ela: $\Phi \approx BA$ e
$$L = \frac{N\Phi}{I} \approx \frac{\mu_0 N^2 A}{2\pi R}.$$
A simulação integra o fluxo de verdade, num disco de raio $2a$ em volta da seção (fora do tubo $B = 0$, então a área a mais não muda nada), e bate com a aproximação a menos de 1% para uma seção fina.`,
          medidas: [1, 2],
        },
      ],
      respostas: [
        { item: '(a)', texto: r`$B = \dfrac{\mu_0 N I}{2\pi r}$ dentro do tubo, zero fora.` },
        { item: '(b)', texto: r`$L \approx \dfrac{\mu_0 N^2 A}{2\pi R}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Ampère no toroide', lab: 'ampere' }],
        etapas: [
          { titulo: 'Campo', texto: r`Amperiana circular dentro do tubo.`, passo: 0 },
          { titulo: 'Indutância', texto: r`$N$ vezes o fluxo de uma seção, dividido por $I$.`, passo: 1 },
        ],
        resultado: r`$B = \mu_0NI/2\pi r$; $L \approx \mu_0N^2A/2\pi R$.`,
        errosComuns: ['Usar $N$ só uma vez: o campo já tem um $N$, e o fluxo concatenado tem outro.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada, conferidas pela simulação.' },
      },
    },

    /* ───────────────────────── 5 ───────────────────────── */
    {
      id: 'e5',
      numero: '5',
      secao: 'Médio',
      titulo: 'Espira entre dois fios com correntes opostas',
      resumo: 'Os dois fios somam fluxo: M = (2μ₀b/π) ln[(d + a)/(d − a)].',
      figura: [
        { pagina: 1, recorte: [0.089, 0.87, 0.936, 0.902] },
        { pagina: 2, recorte: [0.089, 0.058, 0.936, 0.363] },
      ],
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [1, -1, 18], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente nos fios', simbolo: 'I', valor: 10, unidade: 'A', min: 1, max: 30, passo: 0.5 },
        { id: 'd', rotulo: 'Meia distância entre os fios', simbolo: 'd', valor: 0.05, unidade: 'm', min: 0.03, max: 0.07, passo: 0.001 },
        { id: 'a', rotulo: 'Meia largura da espira', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.005, max: 0.028, passo: 0.001 },
        { id: 'b', rotulo: 'Meia altura da espira', simbolo: 'b', valor: 0.03, unidade: 'm', min: 0.01, max: 0.05, passo: 0.001 },
      ],
      objetos: [
        { id: 'f1', tipo: 'fioInfinito', I: '0-I0', ponto: ['0-d', 0, 0], direcao: 'y', rotulo: 'I (para baixo)' },
        { id: 'f2', tipo: 'fioInfinito', I: 'I0', ponto: ['d', 0, 0], direcao: 'y', rotulo: 'I (para cima)' },
        { id: 'S', tipo: 'espiraSensora', centro: [0, 0, 0], normal: 'z', largura: '2*a', altura: '2*b', eixoU: 'x', rotulo: 'espira' },
      ],
      medidas: [
        { rotulo: 'Fluxo de um fio só', simbolo: r`\frac{\mu_0 I b}{\pi}\ln\frac{d + a}{d - a}`, expr: "1e6*abs(fluxoB('S'))/2", unidade: 'μWb', teoria: '1e6*mu0*I0*b/pi*ln((d + a)/(d - a))' },
        { rotulo: 'Indutância mútua', simbolo: r`M = \frac{2\mu_0 b}{\pi}\ln\frac{d + a}{d - a}`, expr: "1e6*abs(fluxoB('S'))/I0", unidade: 'μH', teoria: '1e6*2*mu0*b/pi*ln((d + a)/(d - a))' },
      ],
      passos: [
        {
          titulo: 'Os dois fios somam',
          texto: r`Entre fios com correntes opostas, os campos têm o **mesmo sentido**: os fluxos se somam. Cada fio, com a espira entre $d - a$ e $d + a$ dele: $\Phi_1 = \dfrac{\mu_0 I(2b)}{2\pi}\ln\dfrac{d + a}{d - a}$.`,
          medidas: [0],
        },
        { titulo: 'Mútua', texto: r`$M = \dfrac{2\Phi_1}{I} = \dfrac{2\mu_0 b}{\pi}\ln\dfrac{d + a}{d - a}$.`, medidas: [1] },
      ],
      respostas: [{ item: 'M', texto: r`$M = \dfrac{2\mu_0 b}{\pi}\ln\dfrac{d + a}{d - a}$` }],
      resolucao: {
        conceitos: [{ texto: 'Fluxo de fio infinito numa espira', lab: 'movimento' }],
        etapas: [
          { titulo: 'Um fio', texto: r`Integral de $\mu_0 I/2\pi s$ de $d - a$ a $d + a$, vezes $2b$.`, passo: 0 },
          { titulo: 'Dois fios', texto: r`Sentidos iguais entre eles: dobra.`, passo: 1 },
        ],
        resultado: r`$M = \frac{2\mu_0b}{\pi}\ln\frac{d+a}{d-a}$.`,
        errosComuns: ['Subtrair os fluxos dos dois fios por terem correntes opostas.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada, conferidas pela simulação.' },
      },
    },

    /* ───────────────────────── 6 ───────────────────────── */
    {
      id: 'e6',
      numero: '6',
      secao: 'Médio',
      titulo: 'Três espiras em volta de um toroide',
      resumo: 'Todas abraçam o tubo inteiro: M₁ = M₂ = M₃.',
      figura: { pagina: 2, recorte: [0.089, 0.365, 0.936, 0.666] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [12, 10, 12], alvo: [3, 0, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'i', valor: 2, unidade: 'A', min: 0.5, max: 5, passo: 0.1 },
        { id: 'N', rotulo: 'Voltas', simbolo: 'N', valor: 400, unidade: '', min: 400, max: 400, passo: 10 },
        { id: 'Rt', rotulo: 'Raio médio', simbolo: 'R', valor: 0.06, unidade: 'm', min: 0.06, max: 0.06, passo: 0.001 },
        { id: 'a', rotulo: 'Raio da seção', simbolo: 'a', valor: 0.007, unidade: 'm', min: 0.005, max: 0.008, passo: 0.0005 },
      ],
      objetos: [
        { id: 'tor', tipo: 'toroide', I: 'I0', centro: [0, 0, 0], eixo: 'y', raioMaior: 'Rt', raioMenor: '0.8*a', N: 'N', rotulo: 'toroide' },
        { id: 'C1', tipo: 'espiraSensora', centro: ['Rt', 0, 0], normal: 'z', raio: '2*a', rotulo: 'C₁ (círculo, raio 2a)' },
        { id: 'C3', tipo: 'espiraSensora', centro: ['Rt', 0, 0], normal: 'z', largura: '2*a', altura: '2*a', eixoU: 'x', rotulo: 'C₃ (quadrado, lado 2a)' },
        { id: 'C2', tipo: 'caminho', pontos: tri6, rotulo: 'C₂ (triângulo, lado 6a)' },
      ],
      medidas: [
        { rotulo: 'M₁ (círculo de raio 2a)', simbolo: r`M_1`, expr: "1e6*abs(fluxoB('C1'))/I0", unidade: 'μH', teoria: '1e6*mu0*N*(Rt - sqrt(Rt^2 - (0.8*a)^2))' },
        { rotulo: 'M₃ (quadrado de lado 2a)', simbolo: r`M_3`, expr: "1e6*abs(fluxoB('C3'))/I0", unidade: 'μH', teoria: '1e6*mu0*N*(Rt - sqrt(Rt^2 - (0.8*a)^2))' },
      ],
      passos: [
        {
          titulo: 'Onde está o fluxo',
          texto: r`O campo do toroide fica **confinado** no tubo: fora dele, $B = 0$. Qualquer espira que envolva a seção inteira abraça o mesmo fluxo.`,
        },
        {
          titulo: 'As três envolvem a seção',
          texto: r`O círculo de raio $2a$ envolve a seção de raio $a$; o quadrado de lado $2a$ a circunscreve (encosta nela); o triângulo de lado $6a$ tem raio inscrito $\sqrt3\,a > a$. Então $|M_1| = |M_2| = |M_3|$.`,
          medidas: [0, 1],
        },
      ],
      respostas: [{ item: 'Ordem', texto: r`$|M_1| = |M_2| = |M_3|$: todas abraçam o fluxo inteiro do tubo, e fora dele não há campo.` }],
      resolucao: {
        conceitos: [{ texto: 'Campo confinado no toroide', lab: 'ampere' }],
        etapas: [
          { titulo: 'Confinamento', texto: r`$B = 0$ fora do tubo.`, passo: 0 },
          { titulo: 'Geometria', texto: r`As três espiras contêm a seção circular.`, passo: 1 },
        ],
        resultado: r`$|M_1| = |M_2| = |M_3|$.`,
        errosComuns: ['Ordenar pela área das espiras: área fora do tubo não tem fluxo.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.', observacao: 'Respostas desta bancada. Na cena, o enrolamento tem raio 0,8a e o triângulo só aparece desenhado (o sensor do simulador é circular ou retangular). O toroide simulado tem 120 espiras discretas, e um quadrado encostado nelas perderia uns 5% do fluxo pelas frestas; num enrolamento cerrado, como o do enunciado, M₃ = M₁.' },
      },
    },

    /* ───────────────────────── 7 ───────────────────────── */
    {
      id: 'e7',
      numero: '7',
      secao: 'Médio',
      titulo: 'Indutores em série',
      resumo: 'A mesma corrente nos dois: L = L₁ + L₂.',
      figura: { pagina: 2, recorte: [0.089, 0.667, 0.936, 0.785] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 14], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.005, duracao: 3 } },
      parametros: [
        { id: 'L1', rotulo: 'Indutância L₁', simbolo: 'L_1', valor: 0.2, unidade: 'H', min: 0.05, max: 1, passo: 0.01 },
        { id: 'L2', rotulo: 'Indutância L₂', simbolo: 'L_2', valor: 0.3, unidade: 'H', min: 0.05, max: 1, passo: 0.01 },
        { id: 'E0', rotulo: 'fem da fonte', simbolo: r`\varepsilon`, valor: 2, unidade: 'V', min: 0.5, max: 5, passo: 0.1 },
        { id: 'Rr', rotulo: 'Resistência do circuito', simbolo: 'R', valor: 1, unidade: 'Ω', min: 0.2, max: 5, passo: 0.1 },
      ],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'RL', R: 'Rr', L: 'L1 + L2', fem: 'E0', rotulo: 'R e L₁ + L₂ em série' }],
      medidas: [
        { rotulo: 'Corrente agora', simbolo: 'I', expr: "I('c')", unidade: 'A' },
        { rotulo: 'Taxa de variação da corrente', simbolo: r`\frac{dI}{dt}`, expr: "(E0 - Rr*I('c'))/(L1 + L2)", unidade: 'A/s' },
        { rotulo: 'ddp em L₁ e em L₂, somadas', simbolo: r`V = (L_1 + L_2)\frac{dI}{dt}`, expr: "(L1 + L2)*(E0 - Rr*I('c'))/(L1 + L2)", unidade: 'V' },
      ],
      graficos: [{ titulo: 'Corrente no tempo', tipo: 'tempo', janela: 3, series: [{ rotulo: 'I', expr: "I('c')", unidade: 'A' }] }],
      passos: [
        { titulo: '(a) A ddp', texto: r`A mesma $I(t)$ passa pelos dois: $V = V_1 + V_2 = L_1\dfrac{dI}{dt} + L_2\dfrac{dI}{dt} = (L_1 + L_2)\dfrac{dI}{dt}$.`, medidas: [1, 2] },
        { titulo: '(b) Equivalente', texto: r`Um indutor só com $L = L_1 + L_2$ dá a mesma ddp para a mesma corrente: as indutâncias em série **somam**, como resistências.`, medidas: [0] },
      ],
      respostas: [
        { item: '(a)', texto: r`$V = (L_1 + L_2)\dfrac{dI}{dt}$` },
        { item: '(b)', texto: r`$L = L_1 + L_2$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Circuito RL', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Mesma corrente', texto: r`As ddps somam.`, passo: 0 },
          { titulo: 'Equivalente', texto: r`$L$ que dá a mesma relação $V \times dI/dt$.`, passo: 1 },
        ],
        resultado: r`$L = L_1 + L_2$.`,
        errosComuns: ['Trocar as regras de série e paralelo: para indutores, valem as dos resistores.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.' },
      },
    },

    /* ───────────────────────── 8 ───────────────────────── */
    {
      id: 'e8',
      numero: '8',
      secao: 'Médio',
      titulo: 'Indutores em paralelo',
      resumo: 'A mesma ddp nos dois: 1/L = 1/L₁ + 1/L₂.',
      figura: { pagina: 2, recorte: [0.089, 0.786, 0.936, 0.888] },
      cena: { escala: 0.01, extensao: 6, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 14], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.005, duracao: 3 } },
      parametros: [
        { id: 'L1', rotulo: 'Indutância L₁', simbolo: 'L_1', valor: 0.2, unidade: 'H', min: 0.05, max: 1, passo: 0.01 },
        { id: 'L2', rotulo: 'Indutância L₂', simbolo: 'L_2', valor: 0.3, unidade: 'H', min: 0.05, max: 1, passo: 0.01 },
        { id: 'E0', rotulo: 'fem da fonte', simbolo: r`\varepsilon`, valor: 2, unidade: 'V', min: 0.5, max: 5, passo: 0.1 },
        { id: 'Rr', rotulo: 'Resistência do circuito', simbolo: 'R', valor: 1, unidade: 'Ω', min: 0.2, max: 5, passo: 0.1 },
      ],
      objetos: [{ id: 'c', tipo: 'circuito', modelo: 'RL', R: 'Rr', L: 'L1*L2/(L1 + L2)', fem: 'E0', rotulo: 'R e L₁ ∥ L₂' }],
      medidas: [
        { rotulo: 'Corrente total agora', simbolo: 'I', expr: "I('c')", unidade: 'A' },
        { rotulo: 'ddp nos indutores', simbolo: 'V', expr: "E0 - Rr*I('c')", unidade: 'V' },
        { rotulo: 'Taxa de variação da corrente total', simbolo: r`\frac{dI}{dt} = V\left(\frac1{L_1} + \frac1{L_2}\right)`, expr: "(E0 - Rr*I('c'))*(1/L1 + 1/L2)", unidade: 'A/s' },
        { rotulo: 'Indutância equivalente', simbolo: r`L = \frac{L_1L_2}{L_1 + L_2}`, expr: 'L1*L2/(L1 + L2)', unidade: 'H' },
      ],
      graficos: [{ titulo: 'Corrente total no tempo', tipo: 'tempo', janela: 3, series: [{ rotulo: 'I', expr: "I('c')", unidade: 'A' }] }],
      passos: [
        { titulo: '(a) A corrente total', texto: r`Mesma $V$ nos dois: $\dfrac{dI_1}{dt} = \dfrac{V}{L_1}$ e $\dfrac{dI_2}{dt} = \dfrac{V}{L_2}$. Somando, $\dfrac{dI}{dt} = V\left(\dfrac1{L_1} + \dfrac1{L_2}\right)$.`, medidas: [1, 2] },
        { titulo: '(b) Equivalente', texto: r`Um indutor $L$ com $\dfrac{dI}{dt} = \dfrac VL$ faz o mesmo se $\dfrac1L = \dfrac1{L_1} + \dfrac1{L_2}$, isto é, $L = \dfrac{L_1L_2}{L_1 + L_2}$.`, medidas: [3] },
      ],
      respostas: [
        { item: '(a)', texto: r`$\dfrac{dI}{dt} = V\left(\dfrac1{L_1} + \dfrac1{L_2}\right)$` },
        { item: '(b)', texto: r`$L = \dfrac{L_1L_2}{L_1 + L_2}$` },
      ],
      resolucao: {
        conceitos: [{ texto: 'Circuito RL', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Mesma ddp', texto: r`As derivadas das correntes somam.`, passo: 0 },
          { titulo: 'Equivalente', texto: r`Inversos somam.`, passo: 1 },
        ],
        resultado: r`$L = L_1L_2/(L_1 + L_2)$.`,
        errosComuns: ['Somar $L_1 + L_2$ também no paralelo.'],
        oficial: { resposta: 'A lista não tem gabarito da monitoria.' },
      },
    },
  ],
}

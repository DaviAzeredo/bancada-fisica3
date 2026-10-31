import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: ângulo sólido de uma face quadrada de semilado L, a uma distância D da carga. */
const Om = (D: string) => `4*atan(L^2/((${D})*sqrt(2*L^2 + (${D})^2)))`

/* Objetiva 5: quatro quadrantes, cada um com o sinal do caso (I), (II) ou (III). */
const quadrante = (i: number, sinais: [number, number, number]): ObjetoInput => ({
  id: `q${i}`,
  tipo: 'anelCarga',
  Q: `Qq*(caso==1 ? ${sinais[0]} : (caso==2 ? ${sinais[1]} : ${sinais[2]}))`,
  centro: [0, 0, 0],
  raio: 'R',
  normal: 'z',
  arco: [90 * (i - 1), 90 * i],
})
const eq = '(2*k0*Qq/(pi*R^2))'

/**
 * P1 de Física III, 2023/1, noturno, versão A (11/05/2023). Conferida com o
 * gabarito oficial: objetivas 1d, 2c, 3a, 4d, 5d, 6a, e a discursiva.
 */
export const p1_2023_1_noturno: ProvaInput = {
  id: 'p1-2023-1-noturno',
  titulo: 'P1 · 2023/1 · Noturno',
  subtitulo: 'Física III · Primeira Prova Noturna · Versão A · 11/05/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Superfície fechada em volta de um dipolo',
      resumo: 'Fluxo total nulo não quer dizer campo nulo.',
      enunciado: r`Uma superfície imaginária fechada envolve completamente um dipolo elétrico e nenhuma outra partícula carregada. Podemos afirmar que:`,
      figura: { pagina: 1, recorte: [0.03, 0.43, 0.255, 0.93] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [10, 8, 13], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 's', rotulo: 'Meia separação', simbolo: 's', valor: 0.015, unidade: 'm', min: 0.005, max: 0.03, passo: 0.001 },
        { id: 'L', rotulo: 'Meia aresta', simbolo: 'L', valor: 0.04, unidade: 'm', min: 0.04, max: 0.04 },
      ],
      objetos: [
        { id: 'pos', tipo: 'carga', q: 'qq', pos: ['s', 0, 0], rotulo: '+q' },
        { id: 'neg', tipo: 'carga', q: '0-qq', pos: ['-s', 0, 0], rotulo: '−q' },
        { id: 'G', tipo: 'gaussiana', forma: 'cubo', centro: [0, 0, 0], lado: '2*L', rotulo: 'S' },
        { id: 'Fx', tipo: 'espiraSensora', centro: ['L', 0, 0], normal: 'x', largura: '2*L', altura: '2*L', eixoU: 'y', oculta: true },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['L', 'L/2', 0], rotulo: 'P' },
      ],
      visual: { linhasE: true, setasE: true, densidade: 9, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo em P, sobre a superfície', simbolo: '|E|', expr: 'mag(E(L, L/2, 0))', unidade: 'V/m' },
        { rotulo: 'Componente tangente em P', simbolo: 'E_t', expr: 'sqrt(y(E(L, L/2, 0))^2 + z(E(L, L/2, 0))^2)', unidade: 'V/m' },
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{int}`, expr: "Qenc('G')", unidade: 'C', teoria: 0 },
        { rotulo: 'Fluxo total', simbolo: r`\Phi_S`, expr: "fluxo('G')", unidade: 'V·m', teoria: 0 },
        { rotulo: 'Fluxo pela face x = L', simbolo: r`\Phi_\text{face}`, expr: "fluxoE('Fx')", unidade: 'V·m', teoria: `k0*qq*(${Om('L - s')} - ${Om('L + s')})` },
      ],
      passos: [
        {
          titulo: '(a) O campo não é zero na superfície',
          texto: r`As duas cargas não se cancelam ponto a ponto: a mais próxima pesa mais. Em $\mathcal P$, o campo é claramente diferente de zero. Falsa.`,
          medidas: [0],
        },
        {
          titulo: '(b) Nem é normal a ela',
          texto: r`As linhas saem de $+q$ e voltam a $-q$, cruzando a superfície em ângulos variados. Em $\mathcal P$ há componente tangente. Falsa.`,
          medidas: [1],
        },
        {
          titulo: '(c) O fluxo total é zero',
          previsao: { pergunta: 'O fluxo total pela superfície que envolve o dipolo é…', opcoes: ['zero', 'q/ε₀', '2q/ε₀'], correta: 0 },
          texto: r`Gauss conta a carga **líquida**: $+q - q = 0$. Toda linha que sai por um lado volta por outro.

$$\oint_S\vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0} = 0.$$

Há cargas dentro, mas sua soma é nula. Falsa.`,
          medidas: [2, 3],
        },
        {
          titulo: '(d) Mas por uma parte, não',
          texto: r`Pela face mais próxima de $+q$, o fluxo é positivo: mais linhas saem do que entram. O total se anula porque outra parte da superfície tem fluxo negativo.

Alternativa **(d)**.`,
          medidas: [4],
          destacar: ['Fx'],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss', lab: 'gauss' }],
        etapas: [
          { titulo: 'Campo', texto: r`O campo do dipolo não é nulo nem normal à superfície: (a) e (b) são falsas.`, passo: 1 },
          { titulo: 'Fluxo total', texto: r`$Q_\text{int} = 0$: o fluxo total é nulo, e (c) é falsa.`, passo: 2 },
          { titulo: 'Fluxo parcial', texto: r`Por uma parte da superfície, o fluxo pode não ser nulo.`, passo: 3 },
        ],
        resultado: r`Alternativa **(d)**.`,
        errosComuns: [
          r`Confundir fluxo total nulo com campo nulo: $\oint\vec E\cdot d\vec A = 0$ não implica $\vec E = \vec 0$.`,
          r`Pensar que haver cargas dentro basta para ter fluxo: conta a soma delas.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'O campo elétrico é zero em todos os pontos da superfície.', porque: r`Fluxo total nulo não implica campo nulo.` },
        { letra: 'b', texto: 'O campo elétrico é normal à superfície em todos os pontos da mesma.', porque: r`Isso exigiria uma superfície equipotencial, e ela é genérica.` },
        { letra: 'c', texto: 'O fluxo do campo elétrico através da superfície não pode ser igual a zero, pois há cargas envolvidas pela mesma.', porque: r`A carga líquida é zero, e o fluxo total também.` },
        { letra: 'd', texto: 'O fluxo do campo elétrico através de uma parte da superfície pode não ser igual a zero.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Quando Gauss dá o campo',
      resumo: 'A lei vale sempre; isolar E exige simetria.',
      enunciado: r`Considere as seguintes distribuições de cargas, todas estáticas: (I) Fio retilíneo, fino, finito e uniformemente carregado; (II) Anel circular, fino, uniformemente carregado; (III) Esfera maciça com densidade volumétrica de carga que depende apenas da distância ao centro. Para quais dessas distribuições podemos aplicar a lei de Gauss para deduzir uma expressão analítica explícita para o campo elétrico resultante?`,
      figura: { pagina: 1, recorte: [0.27, 0.43, 0.49, 0.985] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', camera: { pos: [10, 8, 13], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) fio finito' },
            { valor: 2, rotulo: '(II) anel' },
            { valor: 3, rotulo: '(III) esfera ρ(r)' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga total', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'h', rotulo: 'Metade do fio', simbolo: 'h', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'Ra', rotulo: 'Raio do anel e da esfera', simbolo: 'R', valor: 0.03, unidade: 'm', min: 0.03, max: 0.03 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 'r', valor: 0.05, unidade: 'm', min: 0.04, max: 0.06, passo: 0.002 },
      ],
      objetos: [
        { id: 'fio', tipo: 'segmentoCarga', ativo: 'caso==1', lambda: 'Qq/(2*h)', a: [0, 0, '-h'], b: [0, 0, 'h'], rotulo: 'fio' },
        { id: 'anel', tipo: 'anelCarga', ativo: 'caso==2', Q: 'Qq', centro: [0, 0, 0], raio: 'Ra', normal: 'z', rotulo: 'anel' },
        { id: 'bola', tipo: 'esfera', ativo: 'caso==3', centro: [0, 0, 0], raio: 'Ra', rho: 'Qq/(pi*Ra^4)*r', rotulo: 'ρ(r)' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rg', rotulo: 'S' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: ['rg', 0, 0], rotulo: 'A' },
        { id: 'B', tipo: 'sonda', campo: 'E', pos: [0, 0, 'rg'], rotulo: 'B' },
      ],
      visual: { setasE: true, densidade: 9, planoSetas: 'xz' },
      medidas: [
        { rotulo: 'Fluxo por S', simbolo: r`\Phi_S`, expr: "fluxo('G')", unidade: 'V·m', teoria: 'Qq/eps0' },
        { rotulo: 'Campo em A', simbolo: 'E_A', ativo: 'caso != 2', expr: 'mag(E(rg, 0, 0))', unidade: 'V/m', teoria: 'caso==1 ? k0*Qq/(rg*sqrt(rg^2 + h^2)) : k0*Qq/rg^2' },
        { rotulo: 'Campo em A', simbolo: 'E_A', ativo: 'caso==2', expr: 'mag(E(rg, 0, 0))', unidade: 'V/m' },
        { rotulo: 'Campo em B', simbolo: 'E_B', expr: 'mag(E(0, 0, rg))', unidade: 'V/m', teoria: 'caso==1 ? k0*Qq/(rg^2 - h^2) : (caso==2 ? k0*Qq*rg/(rg^2 + Ra^2)^(3/2) : k0*Qq/rg^2)' },
        { rotulo: 'Razão E_A/E_B', simbolo: 'E_A/E_B', ativo: 'caso != 3', expr: 'mag(E(rg, 0, 0))/mag(E(0, 0, rg))' },
        { rotulo: 'Razão E_A/E_B', simbolo: 'E_A/E_B', ativo: 'caso==3', expr: 'mag(E(rg, 0, 0))/mag(E(0, 0, rg))', teoria: 1 },
      ],
      passos: [
        {
          titulo: 'Gauss vale nos três',
          texto: r`O fluxo pela esfera $S$ é sempre $Q/\varepsilon_0$, para as três distribuições. A pergunta é outra: dá para tirar $E$ da integral?

Para isso, $E$ tem de ser constante sobre a superfície escolhida.`,
          parametros: { caso: 1 },
          medidas: [0],
        },
        {
          titulo: '(I) Fio finito',
          texto: r`O fio finito não tem simetria de translação: o campo em $A$ difere do campo em $B$, e nenhuma superfície fechada simples deixa $E$ constante. Gauss não dá o campo. Ele sai da integração direta.`,
          parametros: { caso: 1 },
          medidas: [1, 3, 4],
        },
        {
          titulo: '(II) Anel',
          texto: r`Mesma coisa: o anel só tem simetria em torno do eixo. O campo em $A$ e o em $B$ são diferentes. Gauss não ajuda.`,
          parametros: { caso: 2 },
          medidas: [2, 3, 4],
        },
        {
          titulo: '(III) Esfera com ρ(r)',
          previsao: { pergunta: 'Com ρ dependendo só de r, E é constante numa esfera concêntrica?', opcoes: ['Sim', 'Não'], correta: 0 },
          texto: r`Simetria esférica completa: $\vec E = E(r)\hat r$, e $E$ é o mesmo em toda a gaussiana.

$$E(r)\,4\pi r^2 = \frac{Q_\text{int}(r)}{\varepsilon_0}.$$

Só aqui Gauss dá o campo. Alternativa **(c)**.`,
          parametros: { caso: 3 },
          medidas: [3, 5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss e simetria', lab: 'gauss' }],
        etapas: [
          { titulo: 'Critério', texto: r`É preciso uma superfície em que $E$ seja constante.`, passo: 0 },
          { titulo: 'Fio e anel', texto: r`Não têm simetria para isso.`, passo: 2 },
          { titulo: 'Esfera', texto: r`Simetria esférica: Gauss dá $E(r)$.`, passo: 3 },
        ],
        resultado: r`Apenas (III): alternativa **(c)**.`,
        errosComuns: [
          r`Achar que Gauss "não vale" para fio finito: vale, mas não isola $E$.`,
          r`Tratar o fio finito como infinito: só serve muito perto do meio dele.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', porque: r`O fio finito não tem simetria suficiente.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`O anel só tem simetria axial.` },
        { letra: 'c', texto: 'Apenas III.', correta: true, porque: r`Correta.` },
        { letra: 'd', texto: 'I, II e III.', porque: r`Só a esfera tem a simetria necessária.` },
        { letra: 'e', texto: 'Apenas I e II.', porque: r`São exatamente os dois casos em que Gauss não basta.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`O anel não serve.` },
        { letra: 'g', texto: 'Apenas I e III.', porque: r`O fio finito não serve.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`A esfera com $\rho(r)$ serve.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Três afirmações sobre campo e fluxo',
      resumo: 'Condutor, isolante e cargas que se cancelam.',
      enunciado: r`Considere as seguintes afirmações: (I) em um ponto qualquer do interior de um condutor em equilíbrio eletrostático, o campo elétrico é sempre nulo; (II) em um ponto qualquer do interior de um isolante, o campo elétrico é sempre nulo; (III) se o fluxo do campo elétrico resultante através de uma superfície fechada (gaussiana) for zero, então não existem partículas carregadas no interior dessa superfície. Dessas afirmações, quais são todas as corretas?`,
      figura: { pagina: 1, recorte: [0.535, 0.02, 0.755, 0.62] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Afirmação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: '(I) condutor' },
            { valor: 2, rotulo: '(II) isolante' },
            { valor: 3, rotulo: '(III) cargas dentro' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'Rr', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'rp', rotulo: 'Ponto interno', simbolo: 'r', valor: 0.025, unidade: 'm', min: 0.005, max: 0.045, passo: 0.002 },
      ],
      objetos: [
        { id: 'cond', tipo: 'esfera', ativo: 'caso==1', Q: 'Qq', centro: [0, 0, 0], raio: 'Rr', oca: true, rotulo: 'condutor' },
        { id: 'iso', tipo: 'esfera', ativo: 'caso==2', Q: 'Qq', centro: [0, 0, 0], raio: 'Rr', rotulo: 'isolante' },
        { id: 'P', tipo: 'sonda', ativo: 'caso != 3', campo: 'E', pos: ['rp', 0, 0], rotulo: 'P' },
        { id: 'c1', tipo: 'carga', ativo: 'caso==3', q: 'Qq', pos: [0.015, 0, 0], rotulo: '+q' },
        { id: 'c2', tipo: 'carga', ativo: 'caso==3', q: '0-Qq', pos: [-0.015, 0, 0], rotulo: '−q' },
        { id: 'G', tipo: 'gaussiana', ativo: 'caso==3', forma: 'esfera', centro: [0, 0, 0], raio: 0.04, rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo dentro do condutor', simbolo: 'E', ativo: 'caso==1', expr: 'mag(E(rp, 0, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Campo dentro do isolante', simbolo: 'E', ativo: 'caso==2', expr: 'mag(E(rp, 0, 0))', unidade: 'V/m', teoria: 'k0*Qq*rp/Rr^3' },
        { rotulo: 'Fluxo por S', simbolo: r`\Phi_S`, ativo: 'caso==3', expr: "floor(1e6*fluxo('G') + 0.5)/1e6", unidade: 'V·m', teoria: 0 },
        { rotulo: 'Carga líquida dentro de S', simbolo: r`Q_\text{int}`, ativo: 'caso==3', expr: "Qenc('G')", unidade: 'C', teoria: 0 },
      ],
      passos: [
        {
          titulo: '(I) Condutor em equilíbrio',
          texto: r`Se houvesse campo no interior, os elétrons livres se moveriam, e não seria equilíbrio. Toda a carga vai para a superfície, e $\vec E = \vec 0$ dentro. **Verdadeira.**`,
          parametros: { caso: 1 },
          medidas: [0],
        },
        {
          titulo: '(II) Isolante',
          texto: r`Num isolante as cargas ficam onde foram postas. Numa esfera uniforme, por exemplo:

$$E(r) = \frac{k_0Qr}{R^3}\neq 0.$$

**Falsa.**`,
          parametros: { caso: 2 },
          medidas: [1],
        },
        {
          titulo: '(III) Fluxo nulo',
          previsao: { pergunta: 'Fluxo nulo garante que não há cargas dentro?', opcoes: ['Sim', 'Não'], correta: 1 },
          texto: r`Fluxo nulo só diz que a carga **líquida** é zero. Um dipolo dentro de $S$ é um contraexemplo: há duas partículas carregadas, e o fluxo é nulo. **Falsa.**

Só a (I) é verdadeira: alternativa **(a)**.`,
          parametros: { caso: 3 },
          medidas: [2, 3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Condutores em equilíbrio', lab: 'gauss' },
          { texto: 'Lei de Gauss', lab: 'gauss' },
        ],
        etapas: [
          { titulo: '(I)', texto: r`Verdadeira: $\vec E = \vec 0$ dentro do condutor em equilíbrio.`, passo: 0 },
          { titulo: '(II)', texto: r`Falsa: um isolante carregado tem campo no interior.`, passo: 1 },
          { titulo: '(III)', texto: r`Falsa: um dipolo tem fluxo nulo.`, passo: 2 },
        ],
        resultado: r`Apenas (I): alternativa **(a)**.`,
        errosComuns: [
          r`Estender a blindagem do condutor ao isolante: no isolante as cargas não se movem para anular o campo.`,
          r`Ler $Q_\text{int} = 0$ como "não há cargas": elas podem se cancelar.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', correta: true, porque: r`Correta.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`Isolantes podem ter campo no interior.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`Fluxo nulo significa carga líquida nula.` },
        { letra: 'd', texto: 'I, II e III.', porque: r`(II) e (III) são falsas.` },
        { letra: 'e', texto: 'Apenas I e II.', porque: r`(II) é falsa.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`As duas são falsas.` },
        { letra: 'g', texto: 'Apenas I e III.', porque: r`(III) é falsa.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`(I) é verdadeira.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Esfera carregada e esfera neutra',
      resumo: 'Atração por indução; depois do contato, repulsão.',
      enunciado: r`Considere duas esferas metálicas idênticas, originalmente em repouso. Uma delas possui carga negativa, enquanto a outra é neutra. Considerando apenas a força elétrica, indique dentre as opções abaixo, qual é a afirmativa correta.`,
      figura: { pagina: 1, recorte: [0.77, 0.02, 0.99, 0.61] },
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 17], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Momento',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'antes do contato' },
            { valor: 2, rotulo: 'depois do contato' },
          ],
        },
        { id: 'Qq', rotulo: 'Módulo da carga', simbolo: 'Q', valor: 1e-8, unidade: 'C', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.02, max: 0.02 },
        { id: 'dd', rotulo: 'Distância entre os centros', simbolo: 'd', valor: 0.08, unidade: 'm', min: 0.06, max: 0.12, passo: 0.002 },
      ],
      objetos: [
        { id: 'A', tipo: 'esfera', Q: 'caso==1 ? 0-Qq : 0-Qq/2', centro: ['0-dd/2', 0, 0], raio: 'R', oca: true, rotulo: 'A' },
        { id: 'B', tipo: 'esfera', Q: 'caso==1 ? 0 : 0-Qq/2', centro: ['dd/2', 0, 0], raio: 'R', oca: true, rotulo: 'B' },
        /* Indução em B: cargas-imagem de Kelvin, com soma nula porque B é neutra. */
        { id: 'i1', tipo: 'carga', ativo: 'caso==1', q: 'Qq*R/dd', pos: ['dd/2 - R^2/dd', 0, 0] },
        { id: 'i2', tipo: 'carga', ativo: 'caso==1', q: '0-Qq*R/dd', pos: ['dd/2', 0, 0] },
        { id: 'sF', tipo: 'seta', papel: 'forca', origem: ['dd/2', 0.035, 0], vetor: ['caso==1 ? -1 : 1', 0, 0], comprimento: '2.5*cm', rotulo: 'F em B' },
      ],
      visual: { setasE: true, densidade: 13, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga líquida de B', simbolo: 'Q_B', expr: "caso==1 ? 0 : 0-Qq/2", unidade: 'C' },
        { rotulo: 'Força em B (negativa: atrai)', simbolo: 'F_x', ativo: 'caso==1', expr: "x(F('i1') + F('i2'))", unidade: 'N', teoria: '0-k0*Qq^2*(R/dd)*(1/(dd - R^2/dd)^2 - 1/dd^2)' },
        { rotulo: 'Força em B (positiva: repele)', simbolo: 'F_x', ativo: 'caso==2', expr: "(0-Qq/2)*x(Ede('A', dd/2, 0, 0))", unidade: 'N', teoria: 'k0*Qq^2/(4*dd^2)' },
      ],
      passos: [
        {
          titulo: 'Antes do contato: indução',
          previsao: { pergunta: 'Uma esfera metálica neutra perto de uma carga negativa é…', opcoes: ['atraída', 'repelida', 'indiferente'], correta: 0 },
          texto: r`A carga de $A$ repele os elétrons livres de $B$ para o lado oposto. A face voltada para $A$ fica positiva, e a outra, negativa. A carga líquida de $B$ continua zero, mas a face positiva está mais perto: **a atração vence**.

Na cena, a indução é feita com as cargas-imagem de Kelvin.`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: 'Depois do contato',
          texto: r`Encostadas, as esferas viram um só condutor. Sendo idênticas, a carga se divide igualmente: cada uma fica com $-Q/2$.

$$F = k_0\frac{(Q/2)^2}{d^2}.$$

Mesmo sinal: agora **se repelem**. Alternativa **(d)**.`,
          parametros: { caso: 2 },
          medidas: [0, 2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Indução em condutores', lab: 'gauss' },
          { texto: 'Lei de Coulomb', lab: 'coulomb' },
        ],
        etapas: [
          { titulo: 'Antes', texto: r`Indução: a face mais próxima tem sinal oposto, e há atração.`, passo: 0 },
          { titulo: 'Depois', texto: r`Cada esfera fica com $-Q/2$, e há repulsão.`, passo: 1 },
        ],
        resultado: r`Atraem-se antes do contato e repelem-se depois: alternativa **(d)**.`,
        errosComuns: [
          r`Achar que corpo neutro não sente força: ele não sente num campo uniforme, mas aqui o campo varia com a distância.`,
          r`Achar que depois do contato as esferas ficam neutras: a carga se conserva.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Quando as esferas estão próximas, mas não se tocam, elas se repelem.', porque: r`A indução produz atração.` },
        { letra: 'b', texto: 'Quando as esferas estão próximas, mas não se tocam, elas não exercem força elétrica entre si.', porque: r`A esfera neutra se polariza.` },
        { letra: 'c', texto: 'Quando as esferas estão próximas, mas não se tocam, elas se atraem. Após o contato elas não exercem força elétrica entre si.', porque: r`Após o contato, as duas têm carga $-Q/2$.` },
        { letra: 'd', texto: 'Quando as esferas estão próximas, mas não se tocam, elas se atraem. Após o contato elas se repelem.', correta: true, porque: r`Correta.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Anéis com quadrantes carregados',
      resumo: 'Cada quadrante aponta ao longo de sua bissetriz.',
      enunciado: r`Três anéis circulares, de mesmo raio, cujos quadrantes foram carregados uniformemente com cargas positivas e negativas, de mesmo módulo, estão representados na figura abaixo. Considere as afirmativas: (I) O campo elétrico no centro do anel I é nulo; (II) O campo elétrico no centro do anel II tem direção e sentido de $-\hat y$; (III) O campo elétrico no centro do anel III tem direção e sentido de $-(\hat x + \hat y)$. São VERDADEIRAS as afirmativas:`,
      figura: { pagina: 2, recorte: [0.03, 0.02, 0.255, 0.75] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 16], alvo: [0, 0, 0] } },
      parametros: [
        {
          id: 'caso',
          rotulo: 'Anel',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Anel I' },
            { valor: 2, rotulo: 'Anel II' },
            { valor: 3, rotulo: 'Anel III' },
          ],
        },
        { id: 'Qq', rotulo: 'Carga do quadrante', simbolo: 'Q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
      ],
      objetos: [
        quadrante(1, [1, 1, 1]),
        quadrante(2, [-1, 1, 1]),
        quadrante(3, [1, -1, -1]),
        quadrante(4, [-1, -1, 1]),
        { id: 'O', tipo: 'sonda', campo: 'E', pos: [0, 0, 0], rotulo: 'O' },
        { id: 'sE', tipo: 'seta', ativo: 'caso != 1', papel: 'E', origem: [0, 0, 0], vetor: 'E(0, 0, 0)', comprimento: '2.5*cm', rotulo: 'E' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Campo no centro, em x', simbolo: 'E_x', expr: 'x(E(0, 0, 0))', unidade: 'V/m', teoria: `caso==3 ? -2*${eq} : 0` },
        { rotulo: 'Campo no centro, em y', simbolo: 'E_y', expr: 'y(E(0, 0, 0))', unidade: 'V/m', teoria: `caso==2 ? -4*${eq} : (caso==3 ? -2*${eq} : 0)` },
      ],
      passos: [
        {
          titulo: 'Um quadrante sozinho',
          texto: r`Por simetria, o campo de um quadrante positivo no centro aponta ao longo da bissetriz, **para longe** dele; o de um quadrante negativo, **para perto**. O módulo é o mesmo:

$$E_q = \frac{2\sqrt2\,k_0Q}{\pi R^2}.$$`,
          parametros: { caso: 1 },
        },
        {
          titulo: '(I) Pares opostos iguais',
          texto: r`Quadrantes opostos têm a mesma carga: um aponta em sentido contrário ao do outro, e cada par se cancela. $\vec E = \vec 0$. **Verdadeira.**`,
          parametros: { caso: 1 },
          medidas: [0, 1],
        },
        {
          titulo: '(II) Metade + e metade −',
          texto: r`Os dois positivos, em cima, empurram para baixo. Os dois negativos, embaixo, puxam para baixo. As componentes $x$ se cancelam, e sobra $-\hat y$. **Verdadeira.**`,
          parametros: { caso: 2 },
          medidas: [0, 1],
        },
        {
          titulo: '(III) Três + e um −',
          previsao: { pergunta: 'No anel III, os quadrantes 1 (+) e 3 (−) são opostos. Seus campos…', opcoes: ['se somam', 'se cancelam'], correta: 0 },
          texto: r`Os quadrantes 2 e 4 são positivos e opostos: cancelam-se. O 1 (positivo) empurra para $-(\hat x + \hat y)$, e o 3 (negativo) puxa para o mesmo lado. **Verdadeira.**

As três são verdadeiras: alternativa **(d)**.`,
          parametros: { caso: 3 },
          medidas: [0, 1],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de distribuições contínuas', lab: 'coulomb' },
          { texto: 'Superposição' },
        ],
        etapas: [
          { titulo: 'Quadrante', texto: r`Campo ao longo da bissetriz, afastando-se das cargas positivas.`, passo: 0 },
          { titulo: 'I', texto: r`Pares opostos iguais: $\vec E = \vec 0$.`, passo: 1 },
          { titulo: 'II', texto: r`$\vec E\parallel -\hat y$.`, passo: 2 },
          { titulo: 'III', texto: r`$\vec E\parallel -(\hat x + \hat y)$.`, passo: 3 },
        ],
        resultado: r`As três afirmativas são verdadeiras: alternativa **(d)**.`,
        errosComuns: [
          r`Somar as cargas em vez dos vetores: a carga total do anel II é nula, mas o campo no centro não.`,
          r`Trocar o sentido do campo das cargas negativas: ele aponta para elas.`,
        ],
        oficial: { resposta: '(d)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Apenas I.', porque: r`(II) e (III) também são verdadeiras.` },
        { letra: 'b', texto: 'Apenas II.', porque: r`(I) e (III) também são verdadeiras.` },
        { letra: 'c', texto: 'Apenas III.', porque: r`(I) e (II) também são verdadeiras.` },
        { letra: 'd', texto: 'I, II e III.', correta: true, porque: r`Correta.` },
        { letra: 'e', texto: 'Apenas I e II.', porque: r`(III) também é verdadeira.` },
        { letra: 'f', texto: 'Apenas II e III.', porque: r`(I) também é verdadeira.` },
        { letra: 'g', texto: 'Apenas I e III.', porque: r`(II) também é verdadeira.` },
        { letra: 'h', texto: 'Nenhuma.', porque: r`As três são verdadeiras.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Dipolo no campo de outro dipolo',
      resumo: 'Campo paralelo ao momento: torque nulo.',
      enunciado: r`Considere um dipolo elétrico formado por partículas fixas, com carga de módulo $q$, separadas por uma distância $2a$, e outro, pontual, com momento $\vec p = p\hat y$, onde $p > 0$, a uma distância $2a$ do primeiro, como mostra a figura. Quais são o campo elétrico $\vec E$ do primeiro dipolo na posição do segundo e o torque $\vec\tau$ sobre o segundo, respectivamente?`,
      figura: { pagina: 2, recorte: [0.27, 0.02, 0.49, 0.86] },
      cena: { escala: 0.01, extensao: 7, unidade: 'cm', plano: 'xy', camera: { pos: [2, 0, 16], alvo: [2, 0, 0] } },
      parametros: [
        { id: 'qq', rotulo: 'Carga', simbolo: 'q', valor: 1e-9, unidade: 'C', min: 2e-10, max: 3e-9, passo: 1e-10 },
        { id: 'a', rotulo: 'Meia separação', simbolo: 'a', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
        { id: 'p0', rotulo: 'Momento do segundo dipolo', simbolo: 'p', valor: 1e-11, unidade: 'C·m', min: 1e-12, max: 5e-11, passo: 1e-12 },
      ],
      objetos: [
        { id: 'mais', tipo: 'carga', q: 'qq', pos: [0, 'a', 0], rotulo: '+q' },
        { id: 'menos', tipo: 'carga', q: '0-qq', pos: [0, '-a', 0], rotulo: '−q' },
        { id: 'sp', tipo: 'seta', papel: 'neutro', origem: ['2*a', 0, 0], vetor: [0, 1, 0], comprimento: '2.5*cm', rotulo: 'p' },
        { id: 'sE', tipo: 'seta', papel: 'E', origem: ['2*a', 0, 0], vetor: 'E(2*a, 0, 0)', comprimento: '2.5*cm', rotulo: 'E' },
        { id: 'sm', tipo: 'seta', papel: 'neutro', origem: ['2*a', 0, 0], vetor: "Ede('mais', 2*a, 0, 0)", comprimento: '2*cm', rotulo: 'de +q' },
        { id: 'sn', tipo: 'seta', papel: 'neutro', origem: ['2*a', 0, 0], vetor: "Ede('menos', 2*a, 0, 0)", comprimento: '2*cm', rotulo: 'de −q' },
      ],
      visual: { linhasE: true },
      medidas: [
        { rotulo: 'Distância de cada carga ao ponto', simbolo: 'r', expr: 'sqrt((2*a)^2 + a^2)', unidade: 'm', teoria: 'sqrt(5)*a' },
        { rotulo: 'Campo em x', simbolo: 'E_x', expr: 'x(E(2*a, 0, 0))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Campo em y', simbolo: 'E_y', expr: 'y(E(2*a, 0, 0))', unidade: 'V/m', teoria: '0-qq/(2*sqrt(125)*pi*eps0*a^2)' },
        { rotulo: 'Torque em z', simbolo: r`\tau_z`, expr: 'z(cross([0, p0, 0], E(2*a, 0, 0)))', unidade: 'N·m', teoria: 0 },
      ],
      passos: [
        {
          titulo: 'Campo de cada carga',
          texto: r`Cada carga está a $r = \sqrt{(2a)^2 + a^2} = \sqrt5\,a$ do ponto, e produz um campo de módulo $k_0q/5a^2$.

As componentes em $x$ se cancelam: $+q$ empurra para a direita, e $-q$ puxa para a esquerda.`,
          medidas: [0, 1],
          destacar: ['sm', 'sn'],
        },
        {
          titulo: 'Sobra a componente y',
          texto: r`As duas componentes em $y$ apontam para baixo, com o fator $a/r$:

$$E_y = -2\frac{k_0q}{5a^2}\frac{a}{\sqrt5\,a} = -\frac{2k_0q}{5\sqrt5\,a^2} = -\frac{q}{2\sqrt{125}\,\pi\varepsilon_0a^2}.$$

Lembre que $5\sqrt5 = \sqrt{125}$.`,
          medidas: [2],
        },
        {
          titulo: 'Torque',
          previsao: { pergunta: 'p aponta em +y, e E em −y. O torque é…', opcoes: ['nulo', 'máximo', 'ao longo de z'], correta: 0 },
          texto: r`$$\vec\tau = \vec p\times\vec E = \vec 0,$$

pois $\vec p$ e $\vec E$ são antiparalelos. É um equilíbrio instável, mas o torque é nulo. Alternativa **(a)**.`,
          medidas: [3],
          destacar: ['sp', 'sE'],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Campo de um dipolo', lab: 'dipolo' },
          { texto: 'Torque sobre um dipolo', lab: 'dipolo' },
        ],
        etapas: [
          { titulo: 'Geometria', texto: r`$r = \sqrt5\,a$, e as componentes $x$ se cancelam.`, passo: 0 },
          { titulo: 'Campo', texto: r`$E_y = -q/(2\sqrt{125}\,\pi\varepsilon_0a^2)$.`, passo: 1 },
          { titulo: 'Torque', texto: r`$\vec p\parallel\vec E$: $\vec\tau = \vec 0$.`, passo: 2 },
        ],
        resultado: r`$\vec E = -\dfrac{q}{2\sqrt{125}\,\pi\varepsilon_0a^2}\hat y$ e $\vec\tau = \vec 0$: alternativa **(a)**.`,
        errosComuns: [
          r`Usar a aproximação de dipolo $p/4\pi\varepsilon_0r^3$: aqui $r$ não é muito maior que $a$.`,
          r`Usar $r = 2a$ em vez de $\sqrt5\,a$: isso leva ao $16$ das alternativas (b) e (c).`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$-\dfrac{q}{2\sqrt{125}\,\pi\varepsilon_0a^2}\hat y$ e $\vec 0$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$-\dfrac{q}{16\pi\epsilon_0a^2}\hat y$ e $-\dfrac{qp}{16\pi\epsilon_0a^2}\hat z$`, porque: r`Usa $r = 2a$, e $\vec p\parallel\vec E$ não dá torque.` },
        { letra: 'c', texto: r`$-\dfrac{q}{16\pi\epsilon_0a^2}\hat y$ e $\vec 0$`, porque: r`Usa a distância errada.` },
        { letra: 'd', texto: r`$-\dfrac{q}{2\sqrt5\,\pi\varepsilon_0a^2}\hat y$ e $\vec 0$`, porque: r`Falta o fator $1/5$ do $r^2$.` },
        { letra: 'e', texto: r`$-\dfrac{q}{2\sqrt{125}\,\pi\varepsilon_0a^2}\hat y$ e $-\dfrac{qp}{2\sqrt{125}\,\pi\epsilon_0a^2}\hat z$`, porque: r`O campo está certo, mas $\vec p\parallel\vec E$ não dá torque.` },
        { letra: 'f', texto: r`$-\dfrac{q}{4\sqrt{125}\,\pi\varepsilon_0a^2}\hat y$ e $\vec 0$`, porque: r`Conta só uma das cargas.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Esfera com ρ = A/r²',
      resumo: 'Carga, campo e potencial, dentro e fora.',
      enunciado: r`Considere uma esfera de raio $R$ com densidade volumétrica de carga dada por:

$$\rho(r) = \begin{cases} Ar^{-2}, & \text{se } 0 \le r \le R,\\ 0, & \text{se } R < r < \infty,\end{cases}$$

onde $A$ é uma constante e $r$ é a distância ao centro da esfera.

(a) Qual é a carga total $Q$ da esfera? (0,8 ponto) (b) Determine o vetor campo elétrico num ponto genérico fora da esfera. (0,8 ponto) (c) Determine o vetor campo elétrico num ponto genérico dentro da esfera. (0,8 ponto) (d) Determine o potencial elétrico num ponto genérico fora da bola, tomando-o como zero no infinito. (0,8 ponto) (e) Determine o potencial elétrico num ponto genérico dentro da bola, tomando-o como zero no infinito. (0,8 ponto)`,
      figura: { pagina: 2, recorte: [0.52, 0.02, 0.99, 0.47] },
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 20], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'A0', rotulo: 'Constante', simbolo: 'A', valor: 1e-8, unidade: 'C/m', min: 2e-9, max: 3e-8, passo: 1e-9 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.05, max: 0.05 },
        { id: 'rp', rotulo: 'Distância ao centro', simbolo: 'r', valor: 0.08, unidade: 'm', min: 0.004, max: 0.086, passo: 0.002 },
      ],
      objetos: [
        { id: 'bola', tipo: 'esfera', centro: [0, 0, 0], raio: 'R', raioInterno: '1e-5*R', rho: 'A0/r^2', rotulo: 'ρ = A/r²' },
        { id: 'G', tipo: 'gaussiana', forma: 'esfera', centro: [0, 0, 0], raio: 'rp', rotulo: 'S' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: ['rp', 0, 0], rotulo: 'P' },
      ],
      visual: { setasE: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga dentro de S', simbolo: 'q(r)', expr: "Qenc('G')", unidade: 'C', teoria: '4*pi*A0*min(rp, R)' },
        { rotulo: 'Campo em r', simbolo: 'E', expr: 'x(E(rp, 0, 0))', unidade: 'V/m', teoria: 'rp >= R ? A0*R/(eps0*rp^2) : A0/(eps0*rp)' },
        { rotulo: 'Potencial em r', simbolo: 'V', expr: 'V(rp, 0, 0)', unidade: 'V', teoria: 'rp >= R ? A0*R/(eps0*rp) : A0/eps0*(ln(R/rp) + 1)' },
      ],
      graficos: [
        {
          titulo: 'E(r)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.15*R', ate: '1.8*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'x(E(ss, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: 'ss >= R ? A0*R/(eps0*ss^2) : A0/(eps0*ss)', unidade: 'V/m' },
          ],
        },
        {
          titulo: 'V(r)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: '0.15*R', ate: '1.8*R', rotulo: 'r', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'V(ss, 0, 0)', unidade: 'V' },
            { rotulo: 'integral de E', expr: 'ss >= R ? A0*R/(eps0*ss) : A0/eps0*(ln(R/ss) + 1)', unidade: 'V' },
          ],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: '(a) Carga total',
          texto: r`Em coordenadas esféricas, $dV = 4\pi r^2\,dr$, e o $r^2$ cancela o $r^{-2}$:

$$Q = \int_0^R\frac{A}{r^2}\,4\pi r^2\,dr = 4\pi AR.$$`,
          parametros: { rp: 0.08 },
          medidas: [0],
        },
        {
          item: 'b',
          titulo: '(b) Campo fora',
          texto: r`Com simetria esférica, $\vec E = E(r)\hat r$. Por Gauss, fora da esfera tudo se passa como se a carga estivesse no centro:

$$\vec E = \frac{Q}{4\pi\varepsilon_0r^2}\hat r = \frac{AR}{\varepsilon_0r^2}\hat r.$$`,
          parametros: { rp: 0.08 },
          medidas: [1],
        },
        {
          item: 'c',
          titulo: '(c) Campo dentro',
          previsao: { pergunta: 'Dentro da esfera, o campo varia como…', opcoes: ['r', '1/r', '1/r²', 'é constante'], correta: 1 },
          texto: r`A gaussiana de raio $r$ envolve $q(r) = 4\pi Ar$:

$$E\,4\pi r^2 = \frac{4\pi Ar}{\varepsilon_0} \quad\Rightarrow\quad \vec E = \frac{A}{\varepsilon_0r}\hat r.$$

Em $r = R$, as duas expressões dão $A/\varepsilon_0R$: o campo é contínuo.`,
          parametros: { rp: 0.024 },
          medidas: [0, 1],
        },
        {
          item: 'd',
          titulo: '(d) Potencial fora',
          texto: r`Fora, é o potencial de uma carga pontual $Q$, com zero no infinito:

$$V(r) = \frac{Q}{4\pi\varepsilon_0r} = \frac{AR}{\varepsilon_0r}.$$`,
          parametros: { rp: 0.08 },
          medidas: [2],
        },
        {
          item: 'e',
          titulo: '(e) Potencial dentro',
          texto: r`Integre o campo de dentro de $r$ até $R$, e some $V(R) = A/\varepsilon_0$:

$$V(r) = \int_r^R\frac{A}{\varepsilon_0r'}\,dr' + V(R) = \frac{A}{\varepsilon_0}\left[\ln\frac Rr + 1\right].$$

Diverge em $r = 0$, mas só como logaritmo.`,
          parametros: { rp: 0.024 },
          medidas: [2],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Lei de Gauss', lab: 'gauss' },
          { texto: 'Potencial a partir do campo', lab: 'potencial' },
        ],
        etapas: [
          { titulo: '(a)', texto: r`$Q = 4\pi AR$.`, passo: 0 },
          { titulo: '(b)', texto: r`$\vec E = AR\hat r/\varepsilon_0r^2$.`, passo: 1 },
          { titulo: '(c)', texto: r`$\vec E = A\hat r/\varepsilon_0r$.`, passo: 2 },
          { titulo: '(d)', texto: r`$V = AR/\varepsilon_0r$.`, passo: 3 },
          { titulo: '(e)', texto: r`$V = (A/\varepsilon_0)[\ln(R/r) + 1]$.`, passo: 4 },
        ],
        resultado: r`$Q = 4\pi AR$; $\vec E = \dfrac{AR}{\varepsilon_0r^2}\hat r$ fora e $\dfrac{A}{\varepsilon_0r}\hat r$ dentro; $V = \dfrac{AR}{\varepsilon_0r}$ fora e $\dfrac{A}{\varepsilon_0}\left[\ln\dfrac Rr + 1\right]$ dentro.`,
        errosComuns: [
          r`Multiplicar $\rho$ pelo volume da esfera: $\rho$ varia com $r$.`,
          r`Esquecer $V(R)$ no item (e): o potencial dentro não é só a integral até $R$.`,
        ],
        oficial: { resposta: r`$Q = 4\pi AR$; $\vec E = AR\hat r/\varepsilon_0r^2$ fora; $\vec E = A\hat r/\varepsilon_0r$ dentro; $V = AR/\varepsilon_0r$ fora; $V = (A/\varepsilon_0)\ln(R/r) + A/\varepsilon_0$ dentro.` },
      },
      respostas: [
        { item: 'a', texto: r`$Q = 4\pi AR$`, pontos: 0.8, criterio: 'Integral da densidade no volume.' },
        { item: 'b', texto: r`$\vec E = \dfrac{AR}{\varepsilon_0r^2}\hat r$`, pontos: 0.8, criterio: 'Simetria esférica e lei de Gauss.' },
        { item: 'c', texto: r`$\vec E = \dfrac{A}{\varepsilon_0r}\hat r$`, pontos: 0.8, criterio: 'Carga envolvida por uma gaussiana interna.' },
        { item: 'd', texto: r`$V = \dfrac{AR}{\varepsilon_0r}$`, pontos: 0.8, criterio: 'Referência no infinito.' },
        { item: 'e', texto: r`$V = \dfrac{A}{\varepsilon_0}\left[\ln\dfrac Rr + 1\right]$`, pontos: 0.8, criterio: 'Integral do campo e continuidade em r = R.' },
      ],
    },
  ],
}

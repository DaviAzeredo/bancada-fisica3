import { associacao, capacitor } from './capacitores'
import { contínua, corrente } from './corrente'
import { condutores, densidade, distribuicoes, energia, planos } from './eletrostatica'
import { maxwell, movimento } from './inducao'
import { ampereJ, forcas, trechos } from './magnetismo'
import { type LabEntry, type LabNovo, MOVIMENTO, r } from './tipos'

/** Id do circuito ativo no lab 09 (um objeto por modelo). */
const CID = "(modelo==1 ? 'c1' : (modelo==2 ? 'c2' : (modelo==3 ? 'c3' : (modelo==4 ? 'c4' : 'c5'))))"

/** Força sobre a carga livre do lab 01 vinda de uma carga: a escala é a soma, que sempre mede 3 cm. */
const naLivre = (o: string) => `Ede('${o}', pos('livre'))`
const setaLivre = (o: string) => `min(6, 3*mag(${naLivre(o)})/mag(E(pos('livre'))))*cm`

/** Massa de cada carga do dipolo do lab 02: dá uma oscilação de alguns segundos. */
const mD = '3e-5'
const Udip = '(0 - q*d*E0*cos(ang))'

export type { LabEntry } from './tipos'

const BASE: LabNovo[] = [
  /* ───────────────────────── 01 · Coulomb ───────────────────────── */
  {
    grupo: 'Eletrostática',
    cenario: {
      id: 'coulomb',
      titulo: 'Lei de Coulomb e superposição',
      resumo: 'Uma carga livre se move sob a soma vetorial das forças; arraste as fontes.',
      teoria: r`A força entre duas cargas pontuais é $\vec F = k_0\dfrac{q_1q_2}{r^2}\hat r$, com $k_0 = 1/4\pi\varepsilon_0$. Com várias cargas, as contribuições **somam vetorialmente** (superposição). As linhas de campo saem das cargas positivas e chegam nas negativas, em número proporcional à carga.

A **carga livre** parte do repouso e segue a resultante: as setas mostram a contribuição de $q_1$, a de $q_2$ e a soma delas, com tamanhos relativos.`,
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [16, 15, 20], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, ateParar: true } },
      editor: { adicionarCarga: true },
      parametros: [
        { id: 'q1', rotulo: 'Carga q₁', simbolo: 'q_1', valor: 2e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'q2', rotulo: 'Carga q₂', simbolo: 'q_2', valor: 1e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'ql', rotulo: 'Carga livre', simbolo: 'q', valor: 1e-10, unidade: 'C', min: -2e-10, max: 2e-10, passo: 1e-11 },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: 'q1', pos: [-0.04, 0, 0], arrastavel: true, rotulo: 'q₁' },
        { id: 'q2', tipo: 'carga', q: 'q2', pos: [0.04, 0, 0], arrastavel: true, rotulo: 'q₂' },
        { id: 'livre', tipo: 'particula', q: 'ql', m: 6e-5, pos: [0, 0.06, 0], v: [0, 0, 0], cargaDeProva: true, rotulo: 'carga livre' },
        { id: 'Fa', tipo: 'seta', papel: 'forca', origem: "pos('livre')", vetor: `ql*${naLivre('q1')}`, comprimento: setaLivre('q1'), rotulo: 'de q₁' },
        { id: 'Fb', tipo: 'seta', papel: 'forca', origem: "pos('livre')", vetor: `ql*${naLivre('q2')}`, comprimento: setaLivre('q2'), rotulo: 'de q₂' },
        { id: 'Fr', tipo: 'seta', papel: 'neutro', origem: "pos('livre')", vetor: "ql*E(pos('livre'))", comprimento: '3*cm', rotulo: 'soma' },
        { id: 'F1', tipo: 'seta', papel: 'forca', origem: "pos('q1')", vetor: "F('q1')", comprimento: '2.4*cm', rotulo: 'F₁' },
        { id: 'F2', tipo: 'seta', papel: 'forca', origem: "pos('q2')", vetor: "F('q2')", comprimento: '2.4*cm', rotulo: 'F₂' },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0.02, -0.03, 0.04], arrastavel: true, rotulo: 'P' },
      ],
      visual: { linhasE: true },
      medidas: [
        { rotulo: 'Força sobre q₂', simbolo: r`|\vec F_2|`, expr: "mag(F('q2'))", unidade: 'N', teoria: "k0*abs(q1*q2)/dist('q1','q2')^2" },
        { rotulo: 'Distância entre q₁ e q₂', simbolo: 'r', expr: "dist('q1','q2')", unidade: 'm' },
        { rotulo: 'Campo em P', simbolo: r`|\vec E(P)|`, expr: "mag(E('P'))", unidade: 'V/m' },
        { rotulo: 'Potencial em P', simbolo: 'V(P)', expr: "V('P')", unidade: 'V' },
        { rotulo: 'Força de q₁ na carga livre', simbolo: 'F_1', expr: `abs(ql)*mag(${naLivre('q1')})`, unidade: 'N' },
        { rotulo: 'Força de q₂ na carga livre', simbolo: 'F_2', expr: `abs(ql)*mag(${naLivre('q2')})`, unidade: 'N' },
        { rotulo: 'Soma vetorial', simbolo: r`|\vec F_1 + \vec F_2|`, expr: `abs(ql)*mag(${naLivre('q1')} + ${naLivre('q2')})`, unidade: 'N' },
      ],
      graficos: [
        {
          titulo: 'Forças na carga livre',
          tipo: 'tempo',
          series: [
            { rotulo: 'de q₁', expr: `abs(ql)*mag(${naLivre('q1')})`, unidade: 'N' },
            { rotulo: 'de q₂', expr: `abs(ql)*mag(${naLivre('q2')})`, unidade: 'N' },
            { rotulo: 'soma vetorial', expr: `abs(ql)*mag(${naLivre('q1')} + ${naLivre('q2')})`, unidade: 'N' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Com $q_1$ e $q_2$ de mesmo sinal, leve a sonda $P$ ao ponto entre elas onde o campo se anula.',
          dica: 'O ponto fica mais perto da carga menor. Arraste $P$ sobre a linha que une as cargas.',
          condicao: "q1*q2 > 0 && mag(E('P')) < 0.02*k0*max(abs(q1),abs(q2))/dist('q1','q2')^2",
          sucesso: 'Achou: ali as duas contribuições têm o mesmo módulo e sentidos opostos.',
        },
        {
          pergunta: 'Faça a força sobre $q_2$ apontar para $q_1$.',
          dica: 'Atração exige sinais opostos.',
          condicao: "dot(F('q2'), pos('q1') - pos('q2')) > 0",
          sucesso: 'Sinais opostos se atraem: as linhas agora ligam uma carga à outra.',
        },
        {
          pergunta: 'Dobre a distância entre as cargas e confira que a força cai a um quarto.',
          condicao: "dist('q1','q2') > 0.155 && dist('q1','q2') < 0.165",
          sucesso: 'Lei do inverso do quadrado: $r \\to 2r$ faz $F \\to F/4$.',
        },
      ],
    },
  },

  /* ───────────────────────── 02 · Dipolo ───────────────────────── */
  {
    grupo: 'Eletrostática',
    cenario: {
      id: 'dipolo',
      titulo: 'Campo elétrico de um dipolo',
      resumo: 'Campo exato contra a aproximação, e um dipolo oscilando num campo uniforme.',
      teoria: r`Duas cargas $\pm q$ separadas por $d$ formam um dipolo de momento $p = qd$. Na mediatriz, a uma distância $y$, o campo exato é $E = \dfrac{k_0\,q\,d}{(y^2 + d^2/4)^{3/2}}$, que para $y \gg d$ vira $E \approx \dfrac{k_0 p}{y^3}$: cai mais rápido que o de uma carga isolada.

Num campo uniforme, a resultante é nula, mas o torque $\tau = pE\sin\theta$ gira o dipolo. Solto de um ângulo, ele **oscila** em torno de $\theta = 0$, trocando energia cinética de rotação por $U = -pE\cos\theta$.`,
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', camera: { pos: [10, 13, 19], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.004 } },
      dinamica: [
        { id: 'om', inicial: '0', derivada: `0 - 2*q*E0/(${mD}*d)*sin(ang) - amort*om` },
        { id: 'ang', inicial: 'rad(th)', derivada: 'om' },
      ],
      parametros: [
        { id: 'modo', rotulo: 'Situação', valor: 1, opcoes: [{ valor: 1, rotulo: 'Campo do dipolo' }, { valor: 2, rotulo: 'Dipolo num campo' }] },
        MOVIMENTO,
        { id: 'q', rotulo: 'Carga', simbolo: 'q', valor: 2e-9, unidade: 'C', min: 0.5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.03, unidade: 'm', min: 0.01, max: 0.08, passo: 0.002 },
        { id: 'E0', rotulo: 'Campo externo', simbolo: 'E', valor: 2000, unidade: 'V/m', min: 200, max: 8000, passo: 100 },
        { id: 'th', rotulo: 'Ângulo inicial entre p e E', simbolo: r`\theta_0`, valor: 70, unidade: '°', min: 0, max: 180, passo: 1 },
        { id: 'amort', rotulo: 'Amortecimento', simbolo: 'b', valor: 0.15, unidade: '1/s', min: 0, max: 1, passo: 0.01 },
        { id: 'yP', rotulo: 'Posição de P na mediatriz', simbolo: 'y', valor: 0.05, unidade: 'm', min: 0.012, max: 0.1, passo: 0.001, varre: { periodo: 10, de: 0.02, ate: 0.095, ativo: 'auto==1 && modo==1' } },
      ],
      objetos: [
        { id: 'qp', tipo: 'carga', q: 'q', pos: ['modo==2 ? d/2*cos(ang) : -d/2', 'modo==2 ? d/2*sin(ang) : 0', 0], rotulo: '+q' },
        { id: 'qn', tipo: 'carga', q: '-q', pos: ['modo==2 ? 0-d/2*cos(ang) : d/2', 'modo==2 ? 0-d/2*sin(ang) : 0', 0], rotulo: '−q' },
        { id: 'Eu', tipo: 'campoE', ativo: 'modo==2', valor: ['E0', 0, 0], rotulo: 'E' },
        { id: 'P', tipo: 'sonda', ativo: 'modo==1', campo: 'E', pos: [0, 'yP', 0], arraste: { param: 'yP', eixo: 'y' }, rotulo: 'P' },
        { id: 'cd', tipo: 'cota', ativo: 'modo==1', a: ['-d/2', 0, 0], b: ['d/2', 0, 0], deslocamento: [0, '-1.2*cm', 0], rotulo: 'd' },
        { id: 'Fp', tipo: 'seta', ativo: 'modo==2', papel: 'forca', origem: "pos('qp')", vetor: ['q*E0', 0, 0], comprimento: '2.4*cm', rotulo: 'F' },
        { id: 'Fn', tipo: 'seta', ativo: 'modo==2', papel: 'forca', origem: "pos('qn')", vetor: ['0-q*E0', 0, 0], comprimento: '2.4*cm', rotulo: 'F' },
      ],
      visual: { linhasE: true, setasE: false },
      medidas: [
        { rotulo: 'Campo em P', simbolo: r`|\vec E(P)|`, expr: "mag(E('P'))", unidade: 'V/m', ativo: 'modo==1' },
        {
          rotulo: 'Exato na mediatriz (se P estiver nela)',
          simbolo: r`\frac{k_0qd}{(y^2+d^2/4)^{3/2}}`,
          expr: "k0*q*d/(y(pos('P'))^2 + z(pos('P'))^2 + d^2/4)^1.5",
          unidade: 'V/m',
          ativo: 'modo==1',
        },
        { rotulo: 'Aproximação de dipolo', simbolo: r`\frac{k_0 p}{y^3}`, expr: "k0*q*d/(y(pos('P'))^2 + z(pos('P'))^2)^1.5", unidade: 'V/m', ativo: 'modo==1' },
        { rotulo: 'Momento de dipolo', simbolo: 'p = qd', expr: 'q*d', unidade: 'C·m' },
        { rotulo: 'Torque', simbolo: r`\tau = pE\sin\theta`, expr: "mag(cross(pos('qp'), F('qp')) + cross(pos('qn'), F('qn')))", unidade: 'N·m', teoria: 'q*d*E0*abs(sin(ang))', ativo: 'modo==2' },
        { rotulo: 'Força resultante', simbolo: r`\sum\vec F`, expr: "mag(F('qp') + F('qn'))", unidade: 'N', teoria: '0', ativo: 'modo==2' },
        { rotulo: 'Ângulo agora', simbolo: r`\theta`, expr: 'deg(ang)', unidade: '°', ativo: 'modo==2' },
        { rotulo: 'Energia potencial', simbolo: r`U = -pE\cos\theta`, expr: Udip, unidade: 'J', ativo: 'modo==2' },
        { rotulo: 'Energia cinética de rotação', simbolo: r`K = \tfrac12 I\omega^2`, expr: `${mD}*d^2/4*om^2`, unidade: 'J', ativo: 'modo==2' },
      ],
      graficos: [
        {
          titulo: 'E na mediatriz: exato × dipolo',
          tipo: 'perfil',
          ativo: 'modo==1',
          x: { variavel: 'yy', de: '0.6*d', ate: 0.1, rotulo: 'y', unidade: 'm', marca: 'yP' },
          series: [
            { rotulo: 'exato', expr: 'mag(E(0, yy, 0))', unidade: 'V/m' },
            { rotulo: 'k₀p/y³', expr: 'k0*q*d/yy^3', unidade: 'V/m' },
          ],
        },
        {
          titulo: 'Oscilação: ângulo e energia',
          tipo: 'tempo',
          ativo: 'modo==2',
          series: [
            { rotulo: 'θ', expr: 'deg(ang)', unidade: '°' },
            { rotulo: 'K + U', expr: `${mD}*d^2/4*om^2 + ${Udip}`, unidade: 'J' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Leve $P$ pela mediatriz até que a aproximação de dipolo erre menos de 5%.',
          condicao: "auto==0 && modo==1 && abs(x(pos('P'))) < 0.003 && abs(k0*q*d/(y(pos('P'))^2+z(pos('P'))^2)^1.5 / mag(E('P')) - 1) < 0.05",
          sucesso: 'Longe do dipolo ($y \\gg d$), só o momento $p$ importa.',
        },
        {
          pergunta: 'Num campo uniforme, solte o dipolo de 90°, onde o torque é máximo. Há força resultante?',
          condicao: 'modo==2 && abs(th - 90) < 2',
          sucesso: 'Não: as duas forças têm módulos iguais e sentidos opostos. O campo uniforme só gira o dipolo, que oscila em torno do equilíbrio estável, $\\theta = 0$.',
        },
      ],
    },
  },

  /* ───────────────────────── 03 · Gauss ───────────────────────── */
  {
    grupo: 'Eletrostática',
    cenario: {
      id: 'gauss',
      titulo: 'Lei de Gauss',
      resumo: 'Fluxo por superfícies fechadas de qualquer forma contra Q_enc/ε₀.',
      teoria: r`$$\oint_S \vec E\cdot d\vec A = \frac{Q_\text{enc}}{\varepsilon_0}$$

O fluxo só depende da carga **dentro** de $S$, não da forma da superfície nem de onde a carga está lá dentro. Cargas externas mudam o campo sobre $S$, mas o que entra por um lado sai pelo outro. A cor de $S$ mostra o fluxo local: laranja sai, azul entra.

A superfície atravessa a cena: repare que o fluxo **salta** quando a carga cruza $S$, e fica constante enquanto ela está dentro, mesmo com o campo sobre $S$ mudando.`,
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [17, 13, 21], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
      parametros: [
        {
          id: 'dist',
          rotulo: 'Distribuição',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Pontual' },
            { valor: 2, rotulo: 'Esfera' },
            { valor: 3, rotulo: 'Fio ∞' },
            { valor: 4, rotulo: 'Plano ∞' },
          ],
        },
        {
          id: 'forma',
          rotulo: 'Superfície gaussiana',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Esfera' },
            { valor: 2, rotulo: 'Cubo' },
            { valor: 3, rotulo: 'Cilindro' },
          ],
        },
        { id: 'Q', rotulo: 'Carga (ou λ·m, σ·m²)', simbolo: 'Q', valor: 2e-9, unidade: 'C', min: -4e-9, max: 4e-9, passo: 1e-10 },
        { id: 'tam', rotulo: 'Tamanho da superfície', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.02, max: 0.09, passo: 0.002 },
        { id: 'ext', rotulo: 'Carga externa', valor: 0, opcoes: [{ valor: 0, rotulo: 'Sem' }, { valor: 1, rotulo: 'Com' }] },
        MOVIMENTO,
        { id: 'xS', rotulo: 'Posição de S', simbolo: 'x_S', valor: 0.01, unidade: 'm', min: -0.1, max: 0.1, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1' } },
      ],
      objetos: [
        { id: 'qp', tipo: 'carga', ativo: 'dist==1', q: 'Q', pos: [0, 0, 0], arrastavel: true, rotulo: 'Q' },
        { id: 'esf', tipo: 'esfera', ativo: 'dist==2', Q: 'Q', centro: [0, 0, 0], raio: 0.025, rotulo: 'Esfera maciça' },
        { id: 'fio', tipo: 'linhaInfinita', ativo: 'dist==3', lambda: 'Q', ponto: [0, 0, 0], direcao: 'y', rotulo: 'λ' },
        { id: 'pl', tipo: 'planoInfinito', ativo: 'dist==4', sigma: 'Q', ponto: [0, 0, 0], normal: 'y', rotulo: 'σ' },
        { id: 'qx', tipo: 'carga', ativo: 'ext==1', q: '3*nC', pos: [0.08, 0.02, 0.04], arrastavel: true, rotulo: 'externa' },
        { id: 'G1', tipo: 'gaussiana', ativo: 'forma==1', forma: 'esfera', centro: ['xS', 0, 0], raio: 'tam', arraste: { param: 'xS', eixo: 'x' }, rotulo: 'S' },
        { id: 'G2', tipo: 'gaussiana', ativo: 'forma==2', forma: 'cubo', centro: ['xS', 0, 0], lado: '1.6*tam', arraste: { param: 'xS', eixo: 'x' }, rotulo: 'S' },
        { id: 'G3', tipo: 'gaussiana', ativo: 'forma==3', forma: 'cilindro', centro: ['xS', 0, 0], raio: '0.8*tam', altura: '1.6*tam', eixo: 'y', arraste: { param: 'xS', eixo: 'x' }, rotulo: 'S' },
      ],
      visual: { linhasE: true, densidade: 10 },
      medidas: [
        {
          rotulo: 'Fluxo por S (quadratura)',
          simbolo: r`\oint_S\vec E\cdot d\vec A`,
          expr: "fluxo(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))",
          unidade: 'V·m',
          teoria: "Qenc(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))/eps0",
        },
        { rotulo: 'Carga envolvida', simbolo: r`Q_\text{enc}`, expr: "Qenc(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))", unidade: 'C' },
      ],
      graficos: [
        {
          titulo: 'Fluxo por S no tempo',
          tipo: 'tempo',
          janela: 12,
          series: [
            { rotulo: 'fluxo', expr: "fluxo(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))", unidade: 'V·m' },
            { rotulo: 'Q_enc/ε₀', expr: "Qenc(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))/eps0", unidade: 'V·m' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Com a carga pontual, arraste $S$ até a carga ficar de fora. O que acontece com o fluxo?',
          condicao: "auto==0 && dist==1 && abs(Qenc(forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3'))) < 1e-15",
          sucesso: 'Zero: cada linha que entra em $S$ também sai.',
        },
        {
          pergunta: 'Ligue a carga externa e coloque-a bem perto de $S$, sem entrar. O fluxo muda?',
          condicao: "ext==1 && dist('qx', forma==1 ? 'G1' : (forma==2 ? 'G2' : 'G3')) < 1.25*tam*(forma==1 ? 1 : 1.2)",
          sucesso: 'Não muda: o campo sobre $S$ mudou (veja as cores), mas o fluxo total continua $Q_\\text{enc}/\\varepsilon_0$.',
        },
      ],
    },
  },

  /* ───────────────────────── 04 · Potencial ───────────────────────── */
  {
    grupo: 'Eletrostática',
    cenario: {
      id: 'potencial',
      titulo: 'Potencial e equipotenciais',
      resumo: 'Uma carga solta desce o mapa de V, com K + U constante.',
      teoria: r`O potencial $V$ é a energia por unidade de carga: $V = k_0 q/r$ para uma carga pontual, somando escalarmente para várias. O campo é $\vec E = -\nabla V$: aponta para onde $V$ cai mais rápido e é **perpendicular às equipotenciais**. O trabalho do campo para levar $q$ de A a B é $W = q(V_A - V_B)$, independente do caminho.

A carga $q_0$ parte do repouso e desce o potencial: o gráfico mostra a energia passando de $U$ para $K$, com a soma constante.`,
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [0.01, 30, 14], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.002, ateParar: true } },
      parametros: [
        { id: 'q1', rotulo: 'Carga q₁', simbolo: 'q_1', valor: 3e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'q2', rotulo: 'Carga q₂', simbolo: 'q_2', valor: -2e-9, unidade: 'C', min: -5e-9, max: 5e-9, passo: 1e-10 },
        { id: 'qt', rotulo: 'Carga de prova', simbolo: 'q_0', valor: 1e-9, unidade: 'C', min: -2e-9, max: 2e-9, passo: 1e-10 },
      ],
      objetos: [
        { id: 'q1', tipo: 'carga', q: 'q1', pos: [-0.04, 0, 0], arrastavel: true, rotulo: 'q₁' },
        { id: 'q2', tipo: 'carga', q: 'q2', pos: [0.04, 0, 0], arrastavel: true, rotulo: 'q₂' },
        { id: 'A', tipo: 'sonda', campo: 'E', pos: [-0.02, 0, 0.05], arrastavel: true, rotulo: 'A' },
        { id: 'B', tipo: 'sonda', campo: 'E', pos: [0.05, 0, -0.05], arrastavel: true, rotulo: 'B' },
        { id: 'pl', tipo: 'particula', q: 'qt', m: 1e-3, pos: [-0.015, 0, 0.03], v: [0, 0, 0], cargaDeProva: true, rotulo: 'q₀' },
      ],
      visual: { planoV: { normal: 'y', posicao: 0 }, linhasE: true },
      medidas: [
        { rotulo: 'Potencial em A', simbolo: 'V_A', expr: "V('A')", unidade: 'V' },
        { rotulo: 'Potencial em B', simbolo: 'V_B', expr: "V('B')", unidade: 'V' },
        { rotulo: 'Trabalho do campo de A a B', simbolo: 'W = q_0(V_A - V_B)', expr: "qt*(V('A') - V('B'))", unidade: 'J' },
        { rotulo: 'Energia cinética de q₀', simbolo: 'K', expr: "5e-4*mag(vel('pl'))^2", unidade: 'J' },
        { rotulo: 'Energia potencial de q₀', simbolo: 'U = q_0V', expr: "qt*V(pos('pl'))", unidade: 'J' },
      ],
      graficos: [
        {
          titulo: 'Energia de q₀ no tempo',
          tipo: 'tempo',
          series: [
            { rotulo: 'K', expr: "5e-4*mag(vel('pl'))^2", unidade: 'J' },
            { rotulo: 'U', expr: "qt*V(pos('pl'))", unidade: 'J' },
            { rotulo: 'K + U', expr: "5e-4*mag(vel('pl'))^2 + qt*V(pos('pl'))", unidade: 'J' },
          ],
        },
        {
          titulo: 'V ao longo do eixo x',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.11, ate: 0.11, rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'V(x, 0, 0)', expr: 'V(xx, 0, 0.004)', unidade: 'V' }],
        },
        {
          titulo: 'Campo como inclinação: E = −dV/dx',
          tipo: 'perfil',
          x: { variavel: 'xx', de: -0.11, ate: 0.11, rotulo: 'x', unidade: 'm' },
          series: [
            { rotulo: '−dV/dx', expr: '(V(xx - 1e-4, 0, 0.004) - V(xx + 1e-4, 0, 0.004))/2e-4', unidade: 'V/m' },
            { rotulo: 'E_x', expr: 'x(E(xx, 0, 0.004))', unidade: 'V/m' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Coloque A e B na mesma equipotencial, a mais de 3 cm um do outro. Quanto vale o trabalho?',
          condicao: "abs(V('A') - V('B')) < 0.02*max(abs(V('A')), 1) && dist('A','B') > 0.03",
          sucesso: 'Zero: andar sobre uma equipotencial não custa trabalho, porque $\\vec E$ é perpendicular a ela.',
        },
      ],
    },
  },

  /* ───────────────────────── 06 · Lorentz ───────────────────────── */
  {
    grupo: 'Magnetismo',
    cenario: {
      id: 'lorentz',
      titulo: 'Força de Lorentz',
      resumo: 'Próton em E e B: círculo, hélice, deriva E×B e seletor de velocidades.',
      teoria: r`$$\vec F = q(\vec E + \vec v\times\vec B)$$

A parte magnética é sempre perpendicular a $\vec v$: muda a direção, nunca a rapidez. Em $\vec B$ uniforme, a órbita tem raio $r = mv_\perp/|q|B$ e período $T = 2\pi m/|q|B$. Com $\vec E \perp \vec B$, a partícula deriva com velocidade $E/B$, qualquer que seja sua carga.`,
      cena: { escala: 0.002, extensao: 15, unidade: 'cm', camera: { pos: [24, 22, 30], alvo: [0, 0, 0] }, tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 } },
      parametros: [
        {
          id: 'modo',
          rotulo: 'Situação',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Círculo' },
            { valor: 2, rotulo: 'Hélice' },
            { valor: 3, rotulo: 'Deriva E×B' },
            { valor: 4, rotulo: 'Seletor' },
            { valor: 5, rotulo: 'Espectrômetro' },
          ],
        },
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.04, max: 0.2, passo: 0.005 },
        { id: 'Vac', rotulo: 'ddp de aceleração', simbolo: 'V', valor: 300, unidade: 'V', min: 50, max: 400, passo: 10 },
        { id: 'E0', rotulo: 'Campo elétrico', simbolo: 'E', valor: 6000, unidade: 'V/m', min: 0, max: 15000, passo: 250 },
        { id: 'v0', rotulo: 'Velocidade inicial', simbolo: 'v_0', valor: 80000, unidade: 'm/s', min: 0, max: 150000, passo: 1000 },
      ],
      objetos: [
        { id: 'B', tipo: 'campoB', valor: [0, 0, 'B0'], rotulo: 'B' },
        { id: 'E', tipo: 'campoE', ativo: 'modo==3 || modo==4', valor: [0, 'E0', 0], rotulo: 'E' },
        {
          id: 'p',
          tipo: 'particula',
          q: 'qe',
          m: 'mp',
          rotulo: 'próton',
          pos: ['modo==4 ? -2.8*cm : 0', 'modo==5 ? sqrt(2*mp*Vac/qe)/B0 : (modo==3 ? -1*cm : 0)', 'modo==2 ? -2.6*cm : 0'],
          v: ['modo==5 ? sqrt(2*qe*Vac/mp) : (modo==2 ? v0*0.8 : (modo==3 ? 0 : v0))', 0, 'modo==2 ? v0*0.45 : 0'],
        },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '6*mm', rotulo: 'v' },
        { id: 'sf', tipo: 'seta', papel: 'forca', origem: "pos('p')", vetor: "qe*(E(pos('p')) + cross(vel('p'), B(pos('p'))))", comprimento: '5*mm', rotulo: 'F' },
      ],
      visual: { linhasB: false, setasE: false },
      medidas: [
        { rotulo: 'Raio teórico', simbolo: r`r = \frac{mv_\perp}{qB}`, expr: "mp*sqrt(x(vel('p'))^2 + y(vel('p'))^2)/(qe*B0)", unidade: 'm', ativo: 'modo<=2' },
        { rotulo: 'Raio medido no rastro', expr: "t > pi*mp/(qe*B0) ? rastroSpan('p','x')/2 : 0/0", unidade: 'm', ativo: 'modo<=2' },
        { rotulo: 'Raio no espectrômetro', simbolo: r`r = \frac1B\sqrt{\frac{2mV}{q}}`, expr: "mp*mag(vel('p'))/(qe*B0)", unidade: 'm', teoria: 'sqrt(2*mp*Vac/qe)/B0', ativo: 'modo==5' },
        { rotulo: 'Razão carga/massa medida', simbolo: r`\frac qm = \frac{2V}{B^2r^2}`, expr: "2*Vac/(B0^2*(mp*mag(vel('p'))/(qe*B0))^2)", unidade: 'C/kg', teoria: 'qe/mp', ativo: 'modo==5' },
        { rotulo: 'Período', simbolo: r`T = \frac{2\pi m}{qB}`, expr: '2*pi*mp/(qe*B0)', unidade: 's' },
        { rotulo: 'Rapidez', simbolo: r`|\vec v|`, expr: "mag(vel('p'))", unidade: 'm/s' },
        { rotulo: 'Velocidade de deriva', simbolo: 'E/B', expr: 'E0/B0', unidade: 'm/s', ativo: 'modo==3 || modo==4' },
      ],
      desafios: [
        {
          pergunta: 'No seletor, ajuste $v_0$ para o próton atravessar **sem desviar**.',
          dica: 'A força elétrica $qE$ precisa cancelar a magnética $qvB$.',
          condicao: 'modo==4 && abs(v0 - E0/B0) < 0.03*E0/B0',
          sucesso: '$v_0 = E/B$: só partículas com essa velocidade passam reto. É assim que um seletor de velocidades funciona.',
        },
        {
          pergunta: 'No círculo, dobre $B$ e observe o raio e o período.',
          condicao: 'modo==1 && B0 >= 0.19',
          sucesso: 'Os dois caíram pela metade: $r \\propto 1/B$ e $T \\propto 1/B$.',
        },
      ],
    },
  },

  /* ───────────────────────── 07 · Biot-Savart e Ampère ───────────────────────── */
  {
    grupo: 'Magnetismo',
    cenario: {
      id: 'ampere',
      titulo: 'Biot-Savart e lei de Ampère',
      resumo: 'Campo de fio, espira, solenoide e toroide; circulação de B.',
      teoria: r`Cada elemento de corrente gera $d\vec B = \dfrac{\mu_0}{4\pi}\dfrac{I\,d\vec\ell\times\hat r}{r^2}$ (Biot-Savart). Somando, a circulação ao longo de qualquer caminho fechado obedece

$$\oint \vec B\cdot d\vec\ell = \mu_0 I_\text{enc}$$

O caminho amperiano (o anel colorido) cresce e encolhe sozinho: compare os dois lados no gráfico. Mexa no raio para assumir o controle.`,
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [16, 14, 22], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', passo: 0.02 } },
      parametros: [
        {
          id: 'fonte',
          rotulo: 'Fonte',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Fio' },
            { valor: 2, rotulo: 'Espira' },
            { valor: 3, rotulo: 'Solenoide' },
            { valor: 4, rotulo: 'Toroide' },
          ],
        },
        { id: 'I', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: -20, max: 20, passo: 0.5 },
        MOVIMENTO,
        { id: 'ra', rotulo: 'Raio do caminho amperiano', simbolo: 'r', valor: 0.03, unidade: 'm', min: 0.005, max: 0.09, passo: 0.001, varre: { periodo: 12, ativo: 'auto==1' } },
      ],
      objetos: [
        { id: 'fio', tipo: 'fioInfinito', ativo: 'fonte==1', I: 'I', ponto: [0, 0, 0], direcao: 'y', rotulo: 'I' },
        { id: 'esp', tipo: 'espira', ativo: 'fonte==2', I: 'I', centro: [0, 0, 0], raio: 0.04, normal: 'y', rotulo: 'I' },
        { id: 'sol', tipo: 'solenoide', ativo: 'fonte==3', I: 'I', centro: [0, 0, 0], eixo: 'x', raio: 0.025, comprimento: 0.14, N: 30, rotulo: 'N = 30' },
        { id: 'tor', tipo: 'toroide', ativo: 'fonte==4', I: 'I', centro: [0, 0, 0], eixo: 'y', raioMaior: 0.06, raioMenor: 0.018, N: 40, rotulo: 'N = 40' },
        { id: 'amp', tipo: 'amperiana', centro: 'fonte==3 ? [0, 0.025, 0] : [0, 0, 0]', normal: "fonte==3 ? 'z' : 'y'", raio: 'ra', arrastavel: true, rotulo: 'caminho amperiano' },
      ],
      visual: { linhasB: true },
      medidas: [
        { rotulo: 'Circulação de B', simbolo: r`\oint\vec B\cdot d\vec\ell`, expr: "circ('amp')", unidade: 'T·m', teoria: "mu0*Ienc('amp')" },
        { rotulo: 'Corrente envolvida', simbolo: r`I_\text{enc}`, expr: "Ienc('amp')", unidade: 'A' },
        { rotulo: 'B no centro', simbolo: 'B(0)', expr: 'mag(B(0,0,0))', unidade: 'T', teoria: 'fonte==2 ? mu0*abs(I)/(2*0.04) : mu0*30/0.14*abs(I)*0.14/sqrt(0.14^2 + 4*0.025^2)', ativo: 'fonte==2 || fonte==3' },
        { rotulo: 'B a 3 cm do fio', simbolo: r`\frac{\mu_0 I}{2\pi s}`, expr: 'mag(B(0.03,0,0))', unidade: 'T', teoria: 'mu0*abs(I)/(2*pi*0.03)', ativo: 'fonte==1' },
      ],
      graficos: [
        {
          titulo: 'Os dois lados da lei de Ampère',
          tipo: 'tempo',
          janela: 12,
          series: [
            { rotulo: 'circulação', expr: "circ('amp')", unidade: 'T·m' },
            { rotulo: 'μ₀I_enc', expr: "mu0*Ienc('amp')", unidade: 'T·m' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Com o fio, arraste o caminho para fora dele. Quanto vale a circulação?',
          condicao: "fonte==1 && abs(Ienc('amp')) < 1e-12",
          sucesso: 'Zero, embora $\\vec B$ não seja nulo sobre o caminho: as contribuições se cancelam ao dar a volta.',
        },
        {
          pergunta: 'No toroide, ajuste o caminho para passar por dentro das espiras.',
          condicao: "auto==0 && fonte==4 && abs(Ienc('amp')) > 0",
          sucesso: '$I_\\text{enc} = NI$: dentro do toroide $B = \\mu_0 NI/2\\pi r$; fora dele, zero.',
        },
      ],
    },
  },

  /* ───────────────────────── 08 · Faraday ───────────────────────── */
  {
    grupo: 'Indução',
    cenario: {
      id: 'faraday',
      titulo: 'Lei de Faraday e Lenz',
      resumo: 'Ímã atravessando uma bobina e espira girando: fluxo e fem no tempo.',
      teoria: r`$$\varepsilon = -N\frac{d\Phi_B}{dt}$$

A fem aparece quando o **fluxo muda**, não quando ele é grande. O sinal de menos é a lei de Lenz: a corrente induzida cria um campo que se opõe à variação. Repare que $\varepsilon$ é máxima quando $\Phi_B$ passa mais rápido por zero.`,
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [18, 12, 22], alvo: [0, 0, 0] }, tempo: { escala: 0.5, unidade: 's', passo: 0.002 } },
      parametros: [
        {
          id: 'modo',
          rotulo: 'Experimento',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'Ímã e bobina' },
            { valor: 2, rotulo: 'Gerador' },
          ],
        },
        { id: 'A', rotulo: 'Amplitude do ímã', simbolo: 'A', valor: 0.07, unidade: 'm', min: 0.02, max: 0.09, passo: 0.005, },
        { id: 'T', rotulo: 'Período', simbolo: 'T', valor: 2, unidade: 's', min: 0.5, max: 4, passo: 0.1 },
        { id: 'N', rotulo: 'Espiras', simbolo: 'N', valor: 50, min: 1, max: 200, passo: 1 },
        { id: 'B0', rotulo: 'B do gerador', simbolo: 'B', valor: 0.05, unidade: 'T', min: 0.01, max: 0.2, passo: 0.005 },
      ],
      objetos: [
        { id: 'ima', tipo: 'ima', ativo: 'modo==1', centro: [0, 'A*sin(2*pi*t/T)', 0], eixo: 'y', comprimento: 0.04, raio: 0.009, intensidade: 2000, rotulo: 'ímã' },
        { id: 'bob', tipo: 'espiraSensora', ativo: 'modo==1', centro: [0, 0, 0], normal: 'y', raio: 0.025, N: 'N', R: 5, rotulo: 'bobina' },
        { id: 'Bg', tipo: 'campoB', ativo: 'modo==2', valor: ['B0', 0, 0] },
        {
          id: 'ger',
          tipo: 'espiraSensora',
          ativo: 'modo==2',
          centro: [0, 0, 0],
          normal: ['cos(2*pi*t/T)', 0, 'sin(2*pi*t/T)'],
          largura: 0.08,
          altura: 0.06,
          eixoU: ['-sin(2*pi*t/T)', 0, 'cos(2*pi*t/T)'],
          N: 'N',
          R: 5,
          rotulo: 'espira girando',
        },
      ],
      visual: { linhasB: false, setasB: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Fluxo por espira', simbolo: r`\Phi_B`, expr: "fluxoB(modo==1 ? 'bob' : 'ger')", unidade: 'Wb' },
        { rotulo: 'fem induzida', simbolo: r`\varepsilon`, expr: "fem('bob')", unidade: 'V', ativo: 'modo==1' },
        {
          rotulo: 'fem induzida',
          simbolo: r`\varepsilon = NBA\omega\sin\omega t`,
          expr: "fem('ger')",
          unidade: 'V',
          teoria: 'N*B0*0.08*0.06*(2*pi/T)*sin(2*pi*t/T)',
          ativo: 'modo==2',
        },
        { rotulo: 'Corrente induzida (R = 5 Ω)', simbolo: 'I = ε/R', expr: "Iind(modo==1 ? 'bob' : 'ger')", unidade: 'A' },
      ],
      graficos: [
        {
          titulo: 'Fluxo e fem no tempo',
          tipo: 'tempo',
          janela: 6,
          series: [
            { rotulo: 'Φ', expr: "fluxoB(modo==1 ? 'bob' : 'ger')", unidade: 'Wb' },
            { rotulo: 'ε', expr: "fem(modo==1 ? 'bob' : 'ger')", unidade: 'V' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: 'Pause quando a fem estiver no máximo. Onde está o ímã?',
          condicao: "modo==1 && abs(fem('bob')) > 0 && abs(sin(2*pi*t/T)) < 0.35",
          sucesso: 'Perto da bobina, onde o fluxo muda mais depressa, não onde ele é maior.',
        },
        {
          pergunta: 'No gerador, dobre a frequência (metade do período). O que acontece com a amplitude da fem?',
          condicao: 'modo==2 && T <= 1.05',
          sucesso: 'Dobra: $\\varepsilon_\\text{máx} = NBA\\omega$.',
        },
      ],
    },
  },

  /* ───────────────────────── 09 · Circuitos ───────────────────────── */
  {
    grupo: 'Indução',
    cenario: {
      id: 'circuitos',
      titulo: 'Circuitos RC, RL e LC',
      resumo: 'Carga, corrente e energia no tempo, com o circuito em 3D.',
      teoria: r`**RC:** $q(t) = C\varepsilon(1 - e^{-t/RC})$, constante de tempo $\tau = RC$.
**RL:** $I(t) = \frac{\varepsilon}{R}(1 - e^{-tR/L})$, $\tau = L/R$.
**LC:** a energia oscila entre o capacitor ($q^2/2C$) e o indutor ($LI^2/2$) com $\omega = 1/\sqrt{LC}$.
**RLC:** a resistência amortece a oscilação.`,
      cena: { escala: 0.01, extensao: 8, unidade: 'cm', camera: { pos: [0.01, 13, 9], alvo: [0, 0, 0] }, tempo: { escala: 1, unidade: 's', duracao: 10 } },
      parametros: [
        {
          id: 'modelo',
          rotulo: 'Circuito',
          valor: 1,
          opcoes: [
            { valor: 1, rotulo: 'RC carga' },
            { valor: 2, rotulo: 'RC descarga' },
            { valor: 3, rotulo: 'RL' },
            { valor: 4, rotulo: 'LC' },
            { valor: 5, rotulo: 'RLC' },
          ],
        },
        { id: 'R', rotulo: 'Resistência', simbolo: 'R', valor: 100, unidade: 'Ω', min: 5, max: 500, passo: 5 },
        { id: 'Cf', rotulo: 'Capacitância', simbolo: 'C', valor: 0.01, unidade: 'F', min: 0.002, max: 0.03, passo: 0.001 },
        { id: 'L', rotulo: 'Indutância', simbolo: 'L', valor: 10, unidade: 'H', min: 1, max: 40, passo: 0.5 },
        { id: 'fem', rotulo: 'fem da fonte', simbolo: r`\varepsilon`, valor: 10, unidade: 'V', min: 1, max: 24, passo: 0.5 },
      ],
      objetos: [
        { id: 'c1', tipo: 'circuito', ativo: 'modelo==1', modelo: 'RC', R: 'R', C: 'Cf', fem: 'fem' },
        { id: 'c2', tipo: 'circuito', ativo: 'modelo==2', modelo: 'RC', R: 'R', C: 'Cf', fem: 0, q0: 'Cf*fem' },
        { id: 'c3', tipo: 'circuito', ativo: 'modelo==3', modelo: 'RL', R: 'R/20', L: 'L', fem: 'fem' },
        { id: 'c4', tipo: 'circuito', ativo: 'modelo==4', modelo: 'LC', C: 'Cf', L: 'L', q0: 'Cf*fem' },
        { id: 'c5', tipo: 'circuito', ativo: 'modelo==5', modelo: 'RLC', R: 'R/20', C: 'Cf', L: 'L', q0: 'Cf*fem' },
      ],
      medidas: [
        { rotulo: 'Carga no capacitor', simbolo: 'q', expr: `q(${CID})`, unidade: 'C', ativo: 'modelo!=3', teoria: "modelo==1 ? Cf*fem*(1-exp(-t/(R*Cf))) : (modelo==2 ? Cf*fem*exp(-t/(R*Cf)) : (modelo==4 ? Cf*fem*cos(t/sqrt(L*Cf)) : q('c5')))" },
        { rotulo: 'Corrente', simbolo: 'I', expr: `I(${CID})`, unidade: 'A', teoria: `modelo==3 ? fem/(R/20)*(1-exp(-t*(R/20)/L)) : I(${CID})` },
        { rotulo: 'Energia no capacitor', simbolo: r`q^2/2C`, expr: `UC(${CID})`, unidade: 'J', ativo: 'modelo!=3' },
        { rotulo: 'Energia no indutor', simbolo: r`LI^2/2`, expr: `UL(${CID})`, unidade: 'J', ativo: 'modelo>=3' },
        { rotulo: 'Constante de tempo / período', simbolo: r`\tau \;\text{ou}\; T`, expr: 'modelo<=2 ? R*Cf : (modelo==3 ? L/(R/20) : 2*pi*sqrt(L*Cf))', unidade: 's' },
      ],
      graficos: [
        {
          titulo: 'Carga e corrente',
          tipo: 'tempo',
          janela: 10,
          series: [
            { rotulo: 'q', expr: `modelo==3 ? 0 : q(${CID})`, unidade: 'C' },
            { rotulo: 'I', expr: `I(${CID})`, unidade: 'A' },
          ],
        },
        {
          titulo: 'Energia',
          tipo: 'tempo',
          janela: 10,
          series: [
            { rotulo: 'capacitor', expr: `UC(${CID})`, unidade: 'J' },
            { rotulo: 'indutor', expr: `UL(${CID})`, unidade: 'J' },
            { rotulo: 'total', expr: `UC(${CID}) + UL(${CID})`, unidade: 'J' },
          ],
        },
      ],
      desafios: [
        {
          pergunta: r`No RC carga, pause em $t = \tau$. Que fração da carga final o capacitor tem?`,
          condicao: 'modelo==1 && abs(t - R*Cf) < 0.08*R*Cf',
          sucesso: r`$1 - 1/e \approx 63\%$, para qualquer $R$ e $C$.`,
        },
        {
          pergunta: 'No LC, observe a energia total. Ela muda?',
          condicao: 'modelo==4 && t > 2*pi*sqrt(L*Cf)',
          sucesso: 'Não: sem resistência, a energia só troca de lugar entre $C$ e $L$.',
        },
      ],
    },
  },
]

const POR_ID = Object.fromEntries([...BASE, capacitor, associacao, distribuicoes, densidade, planos, condutores, energia, corrente, contínua, forcas, trechos, ampereJ, movimento, maxwell].map((l) => [l.cenario.id, l]))

/**
 * Laboratórios na ordem da ementa de Física III. Cada um é um cenário livre:
 * sem roteiro fixo, com desafios que se conferem pela própria cena. O número sai
 * daqui; os links usam o id, que nunca muda.
 */
const ORDEM = ['coulomb', 'dipolo', 'distribuicoes', 'gauss', 'densidade', 'planos', 'condutores', 'potencial', 'energia', 'capacitor', 'associacao', 'corrente', 'continua', 'lorentz', 'forcas', 'ampere', 'trechos', 'ampereJ', 'faraday', 'movimento', 'circuitos', 'maxwell']

export const LABS: LabEntry[] = ORDEM.map((id, i) => ({ ...POR_ID[id], numero: String(i + 1).padStart(2, '0') }))

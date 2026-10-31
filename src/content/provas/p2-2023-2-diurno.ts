import type { ObjetoInput, ProvaInput } from '../../scenario/schema'

const r = String.raw

/* Objetiva 1: o campo elétrico que faz o diâmetro ser igual a D. */
const E1 = 'qe*B0^2*D/(8*mp)'

/* Objetiva 2: momento p comum; a partícula 1 é a leve e anda para a esquerda. */
const v1 = '(qe*B0*R0/mp)'
const v2 = `(${v1}/razao)`
const tc = '(2*pi*mp/(qe*B0)*razao/(1 + razao))'
const ang1 = 'atan2(0-x, y + R0)'
const ang2 = 'atan2(x, y + R0)'

/* Objetiva 3: V(z) do gráfico, em V, com z em m; u é z em cm. */
const u = (z: string) => `(100*(${z}))`
const V3 = (z: string) =>
  `((${z}) < 0 ? 500 : ((${z}) < 0.005 ? 430 + 70*(1 - ${u(z)}/0.5)^2 : ((${z}) < 0.02 ? 430 - 40/3*(${u(z)} - 0.5) : ((${z}) < 0.06 ? 410 - 50*(${u(z)} - 2) : ((${z}) < 0.09 ? 210 : ((${z}) < 0.1 ? 210 - 170*(${u(z)} - 9)^2 : 40))))))`
const E3 = (z: string) =>
  `((${z}) < 0 ? 0 : ((${z}) < 0.005 ? 28000*(1 - ${u(z)}/0.5) : ((${z}) < 0.02 ? 4000/3 : ((${z}) < 0.06 ? 5000 : ((${z}) < 0.09 ? 0 : ((${z}) < 0.1 ? 34000*(${u(z)} - 9) : 0))))))`

/* Discursiva: 20 trechos do fio, para somar o torque elemento a elemento. */
const N = 20
const trechos: ObjetoInput[] = Array.from({ length: N }, (_, i) => ({
  id: `w${i}`,
  tipo: 'fio' as const,
  I: 'I0',
  a: [`${i / N}*L`, 0, 0],
  b: [`${(i + 1) / N}*L`, 0, 0],
}))
const Fy = trechos.map((t) => `y(forca('${t.id}','Bf'))`).join(' + ')
const Tz = trechos.map((t, i) => `${(i + 0.5) / N}*L*y(forca('${t.id}','Bf'))`).join(' + ')
const setas: ObjetoInput[] = [0.2, 0.4, 0.6, 0.8, 1].map((f, i) => ({
  id: `F${i}`,
  tipo: 'seta' as const,
  papel: 'forca' as const,
  origem: [`${f}*L`, 0, 0],
  vetor: [0, -1, 0],
  comprimento: `4*cm*${f * f}`,
}))
const Bz = (x: string) => `((${x}) >= 0 && (${x}) <= L ? B0*(${x})^2/L^2 : 0)`

/**
 * P2 de Física III, 2023/2, diurno (30/10/2023). O PDF são fotos sem o
 * cabeçalho, e só das objetivas: a versão é a A, deduzida pelas respostas, que
 * batem nas seis (1a, 2b, 3f, 4b, 5c, 6e). O enunciado da discursiva vem do
 * gabarito. As fotos têm rascunho à mão: os recortes pegam só enunciado e figura,
 * com máscaras onde o rascunho encosta nas figuras.
 */
export const p2_2023_2_diurno: ProvaInput = {
  id: 'p2-2023-2-diurno',
  titulo: 'P2 · 2023/2 · Diurno',
  subtitulo: 'Física III · Segunda Prova · Versão A · 30/10/2023',
  questoes: [
    /* ───────────────────────── Objetiva 1 ───────────────────────── */
    {
      id: 'obj1',
      numero: '1',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Medir q/m com E e B',
      resumo: 'Acelerar por um trecho D e fazer meia volta de diâmetro D.',
      enunciado: r`Uma partícula de carga elétrica $q$ e massa $m$ é acelerada a partir do repouso por um campo elétrico uniforme estacionário $\vec E$ ao longo de um trecho de comprimento $D$. Após esse processo a partícula é defletida ao penetrar em uma região onde existe um campo magnético constante (uniforme e estacionário) $\vec B$ que a faz retornar à sua região de origem. Nas condições apresentadas na figura podemos concluir que a razão entre a carga e a massa da partícula ($q/m$) será dada por:`,
      figura: [
        { pagina: 1, recorte: [0.1, 0.14, 0.94, 0.425] },
        { pagina: 1, recorte: [0.36, 0.44, 0.88, 0.9] },
      ],
      cena: {
        escala: 0.01,
        extensao: 11,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, -3, 23], alvo: [0, -3, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'D', rotulo: 'Comprimento', simbolo: 'D', valor: 0.06, unidade: 'm', min: 0.04, max: 0.08, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, 'B0'], regiao: { min: [0, -0.11, -0.05], max: [0.11, 0.03, 0.05] }, rotulo: 'B' },
        { id: 'Ex', tipo: 'campoE', valor: `x >= 0-D && x < 0 && abs(y) < 0.008 ? [${E1}, 0, 0] : [0, 0, 0]` },
        { id: 'p', tipo: 'particula', rotulo: 'q, m', q: 'qe', m: 'mp', pos: ['0-D', 0, 0], v: [0, 0, 0] },
        { id: 'sv', tipo: 'seta', papel: 'v', origem: "pos('p')", vetor: "vel('p')", comprimento: '1.6*cm', rotulo: 'v' },
        { id: 'cD', tipo: 'cota', a: ['0-D', 0, 0], b: [0, 0, 0], deslocamento: [0, 0.018, 0], rotulo: 'D' },
        { id: 'cR', tipo: 'cota', a: [-0.012, 0, 0], b: [-0.012, '0-D', 0], rotulo: 'D' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy', fontes: ['Bz'] },
      medidas: [
        { rotulo: 'Campo elétrico', simbolo: 'E', expr: E1, unidade: 'V/m' },
        { rotulo: 'Velocidade na saída de E', simbolo: 'v', expr: `sqrt(2*qe*(${E1})*D/mp)`, unidade: 'm/s', teoria: 'qe*B0*D/(2*mp)' },
        { rotulo: 'Diâmetro medido no rastro', simbolo: 'D', expr: "t > 1.2*2*pi*mp/(qe*B0) ? rastroSpan('p', 'y') : 0/0", unidade: 'm', teoria: 'D' },
        { rotulo: 'q/m recuperado da trajetória', simbolo: 'q/m', expr: `t > 1.2*2*pi*mp/(qe*B0) ? 8*(${E1})/(rastroSpan('p', 'y')*B0^2) : 0/0`, unidade: 'C/kg', teoria: 'qe/mp' },
      ],
      passos: [
        {
          titulo: 'Fase elétrica',
          texto: r`Partindo do repouso, o trabalho do campo vira energia cinética:

$$qED = \frac12mv^2 \quad\Rightarrow\quad v^2 = \frac{2qED}{m}.$$

Rode a simulação: a partícula acelera dentro da faixa.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Fase magnética',
          previsao: { pergunta: 'A partícula volta a uma distância D do ponto de entrada. O raio é…', opcoes: ['D', 'D/2', '2D'], correta: 1 },
          texto: r`Ela faz meia volta: o **diâmetro** vale $D$. De $qvB = mv^2/(D/2)$:

$$v = \frac{qBD}{2m}.$$`,
          medidas: [2],
        },
        {
          titulo: 'Eliminar v',
          texto: r`$$\left(\frac{qBD}{2m}\right)^2 = \frac{2qED}{m} \quad\Rightarrow\quad \frac qm = \frac{8E}{DB^2}.$$

Alternativa **(a)**. A medida usa o diâmetro do rastro simulado e recupera o $q/m$ do próton.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Trabalho da força elétrica', lab: 'potencial' },
          { texto: 'Movimento circular em campo magnético', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: 'Energia', texto: r`$v^2 = 2qED/m$.`, passo: 0 },
          { titulo: 'Raio', texto: r`$r = D/2 = mv/qB$, logo $v = qBD/2m$.`, passo: 1 },
          { titulo: 'Razão', texto: r`$q/m = 8E/(DB^2)$.`, passo: 2 },
        ],
        resultado: r`$\dfrac qm = \dfrac{8E}{DB^2}$: alternativa **(a)**.`,
        errosComuns: [
          r`Usar $D$ como raio, o que dá $2E/DB^2$.`,
          r`Esquecer o $1/2$ da energia cinética, chegando a $4E/DB^2$.`,
        ],
        oficial: { resposta: '(a)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{8E}{DB^2}$`, correta: true, porque: r`Correta.` },
        { letra: 'b', texto: r`$\dfrac{4E}{DB^2}$`, porque: r`Esquece o $1/2$ da energia cinética.` },
        { letra: 'c', texto: r`$\dfrac{2E}{DB^2}$`, porque: r`Usa $D$ como raio.` },
        { letra: 'd', texto: r`$\dfrac{E}{DB^2}$`, porque: r`Falta o fator 8.` },
        { letra: 'e', texto: r`$\dfrac{E}{2DB^2}$`, porque: r`Inverte os fatores.` },
        { letra: 'f', texto: r`$\dfrac{E}{4DB^2}$`, porque: r`Inverte os fatores.` },
        { letra: 'g', texto: r`$\dfrac{E}{8DB^2}$`, porque: r`Inverte a razão entre os fatores.` },
      ],
    },

    /* ───────────────────────── Objetiva 2 ───────────────────────── */
    {
      id: 'obj2',
      numero: '2',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Desintegração num campo magnético',
      resumo: 'Cargas opostas, momentos opostos, massas diferentes.',
      enunciado: r`Uma partícula neutra, inicialmente em repouso no ponto $\mathcal P$ e imersa em um campo magnético uniforme e constante, sofre uma desintegração espontânea, resultando em duas partículas carregadas com massas diferentes. Nesse processo, o momento linear total do sistema se conserva, e a energia liberada durante a desintegração é convertida em energia cinética para essas duas partículas. Dentre as opções fornecidas, qual delas se aproxima melhor da descrição da trajetória prevista para o movimento dessas partículas? Desconsidere qualquer interação eletromagnética entre elas.`,
      figura: [
        { pagina: 2, recorte: [0.03, 0.09, 0.915, 0.315] },
        { pagina: 2, recorte: [0.05, 0.34, 0.945, 0.76] },
      ],
      cena: {
        escala: 0.01,
        extensao: 9,
        unidade: 'cm',
        plano: 'xy',
        camera: { pos: [0, -5, 19], alvo: [0, -5, 0] },
        tempo: { escala: 2.5e-7, unidade: 'ns', passo: 1.5e-9 },
      },
      parametros: [
        { id: 'B0', rotulo: 'Campo magnético', simbolo: 'B', valor: 0.1, unidade: 'T', min: 0.05, max: 0.2, passo: 0.005 },
        { id: 'R0', rotulo: 'Raio das trajetórias', simbolo: 'R', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
        { id: 'razao', rotulo: 'Razão de massas', simbolo: 'm_2/m_1', valor: 2, min: 1.5, max: 3, passo: 0.1 },
      ],
      objetos: [
        { id: 'Bz', tipo: 'campoB', valor: [0, 0, '0-B0'], rotulo: 'B' },
        {
          id: 'p1',
          tipo: 'particula',
          rotulo: '+q, m₁',
          q: 'qe',
          m: 'mp',
          pos: [0, 0, 0],
          v: [`0-${v1}`, 0, 0],
          parada: `(${ang1} < 0 ? ${ang1} + 2*pi : ${ang1}) > 2*pi*razao/(1 + razao)`,
        },
        {
          id: 'p2',
          tipo: 'particula',
          rotulo: '−q, m₂',
          q: '0-qe',
          m: 'mp*razao',
          pos: [0, 0, 0],
          v: [v2, 0, 0],
          parada: `${ang2} > 2*pi/(1 + razao)`,
        },
        { id: 'tP', tipo: 'rotulo', pos: [0, 0.008, 0], texto: 'P' },
      ],
      visual: { setasB: true, densidade: 11, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Momento de cada uma', simbolo: 'p', expr: `mp*${v1}`, unidade: 'kg·m/s', teoria: `mp*razao*${v2}` },
        { rotulo: 'Raio de 1, no rastro', simbolo: 'R_1', expr: `t > ${tc} ? rastroSpan('p1', 'y')/2 : 0/0`, unidade: 'm', teoria: 'R0' },
        { rotulo: 'Raio de 2, no rastro', simbolo: 'R_2', expr: `t > ${tc} ? rastroSpan('p2', 'x') : 0/0`, unidade: 'm', teoria: 'R0' },
        { rotulo: 'Ângulo percorrido pela leve até a colisão', simbolo: r`\varphi_1`, expr: '360*razao/(1 + razao)', unidade: '°' },
        { rotulo: 'Ângulo percorrido pela pesada', simbolo: r`\varphi_2`, expr: '360/(1 + razao)', unidade: '°' },
      ],
      passos: [
        {
          titulo: 'O que se conserva',
          texto: r`A partícula original era neutra e estava parada. Depois:

- carga: $q_1 = -q_2$;
- momento: $\vec p_1 = -\vec p_2$, com módulos iguais.

Isso já diz tudo sobre o raio, mesmo com massas diferentes.`,
          medidas: [0],
        },
        {
          titulo: 'Mesmo raio',
          previsao: { pergunta: 'As massas são diferentes. Os raios das trajetórias são…', opcoes: ['iguais', 'proporcionais às massas', 'inversos às massas'], correta: 0 },
          texto: r`$$R = \frac{p}{|q|B}.$$

O raio depende do **momento**, não da massa nem da velocidade. Como $p$ e $|q|$ são iguais, as duas andam no **mesmo círculo**, em sentidos opostos.`,
          medidas: [1, 2],
        },
        {
          titulo: 'Onde elas se encontram',
          texto: r`Partem juntas e em sentidos opostos pelo mesmo círculo: vão se encontrar. Com massas diferentes, as velocidades são diferentes, e o encontro **não** é no ponto diametralmente oposto a $\mathcal P$: ele fica deslocado no sentido da mais lenta.

Só com massas iguais ele seria o ponto oposto, como em (IV). Rode a simulação e mude a razão.`,
          medidas: [3, 4],
        },
        {
          titulo: 'Resposta',
          texto: r`Mesmo círculo, colisão fora do ponto oposto: esquema (II), alternativa **(b)**.`,
        },
      ],
      resolucao: {
        conceitos: [
          { texto: 'Conservação de momento e de carga' },
          { texto: 'Movimento em campo magnético', lab: 'lorentz' },
        ],
        etapas: [
          { titulo: 'Conservação', texto: r`$q_1 = -q_2$ e $|\vec p_1| = |\vec p_2|$.`, passo: 0 },
          { titulo: 'Raio', texto: r`$R = p/|q|B$ é o mesmo: mesmo círculo.`, passo: 1 },
          { titulo: 'Encontro', texto: r`Velocidades diferentes deslocam o ponto de colisão.`, passo: 2 },
        ],
        resultado: r`Esquema (II): alternativa **(b)**.`,
        errosComuns: [
          r`Achar que a massa maior faz o raio maior: o raio segue o momento.`,
          r`Fazer as partículas curvarem para lados opostos da reta: como as cargas e as velocidades têm sinais opostos, as forças apontam para o mesmo lado.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Esquema I: círculos de raios diferentes, tangentes em P.', porque: r`Os raios são iguais: dependem de $p/|q|$.` },
        { letra: 'b', texto: 'Esquema II: mesmo círculo, com colisão fora do ponto oposto a P.', correta: true, porque: r`Correta.` },
        { letra: 'c', texto: 'Esquema III: círculos de raios diferentes, em lados opostos de P.', porque: r`Raios diferentes, e os dois lados errados.` },
        { letra: 'd', texto: 'Esquema IV: mesmo círculo, com colisão no ponto oposto a P.', porque: r`Só com massas iguais.` },
        { letra: 'e', texto: 'Esquema V: círculos iguais, em lados opostos de P.', porque: r`As forças apontam para o mesmo lado, não para lados opostos.` },
        { letra: 'f', texto: 'Esquema VI: círculos de raios diferentes, em lados opostos.', porque: r`Raios diferentes, e os lados errados.` },
      ],
    },

    /* ───────────────────────── Objetiva 3 ───────────────────────── */
    {
      id: 'obj3',
      numero: '3',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo num tubo de descarga',
      resumo: 'Ler a inclinação de V(z) em três pontos.',
      enunciado: r`A figura abaixo mostra o gráfico do potencial elétrico (linha cheia) como função da coordenada $z$ ao longo do eixo de um tubo de descarga. Supondo que o potencial depende apenas de $z$, considere as afirmativas abaixo:

(I) O campo elétrico é uniforme na região $3{,}0\,\text{cm} < z < 5{,}0\,\text{cm}$. (II) O campo elétrico é nulo em $z = 8{,}0\,\text{cm}$. (III) O campo elétrico é mais intenso em $z = 4{,}0\,\text{cm}$ do que em $z = 9{,}5\,\text{cm}$.

São VERDADEIRAS as afirmativas:`,
      figura: { pagina: 3, recorte: [0.135, 0.08, 0.97, 0.5] },
      cena: { escala: 0.01, extensao: 12, unidade: 'cm', camera: { pos: [24, 6, 5], alvo: [0, 0, 5] } },
      parametros: [
        { id: 'zP', rotulo: 'Posição da sonda', simbolo: 'z', valor: 0.04, unidade: 'm', min: 0.001, max: 0.099, passo: 0.001 },
      ],
      objetos: [
        { id: 'Ez', tipo: 'campoE', valor: `[0, 0, ${E3('z')}]`, potencial: V3('z') },
        { id: 'tubo', tipo: 'condutor', a: [0, 0, 0], b: [0, 0, 0.1], raio: 0.012, I: 0 },
        { id: 'P', tipo: 'sonda', campo: 'E', pos: [0, 0, 'zP'], arraste: { param: 'zP', eixo: 'z' }, rotulo: 'sonda' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'yz' },
      medidas: [
        { rotulo: 'Potencial', simbolo: 'V', expr: 'V(0, 0, zP)', unidade: 'V', teoria: V3('zP') },
        { rotulo: 'Campo', simbolo: 'E_z', expr: 'z(E(0, 0, zP))', unidade: 'V/m', teoria: E3('zP') },
        { rotulo: 'Campo em 3,5 cm', simbolo: 'E(3{,}5)', expr: 'z(E(0, 0, 0.035))', unidade: 'V/m', teoria: 5000 },
        { rotulo: 'Campo em 4,5 cm', simbolo: 'E(4{,}5)', expr: 'z(E(0, 0, 0.045))', unidade: 'V/m', teoria: 5000 },
        { rotulo: 'Campo em 8 cm', simbolo: 'E(8)', expr: 'z(E(0, 0, 0.08))', unidade: 'V/m', teoria: 0 },
        { rotulo: 'Campo em 9,5 cm', simbolo: 'E(9{,}5)', expr: 'z(E(0, 0, 0.095))', unidade: 'V/m', teoria: 17000 },
      ],
      graficos: [
        {
          titulo: 'V(z), aproximação do gráfico da prova',
          tipo: 'perfil',
          x: { variavel: 'zz', de: 0, ate: 0.1, rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'V', expr: 'V(0, 0, zz)', unidade: 'V' }],
        },
        {
          titulo: 'E_z(z) = −dV/dz',
          tipo: 'perfil',
          x: { variavel: 'zz', de: 0, ate: 0.1, rotulo: 'z', unidade: 'm' },
          series: [{ rotulo: 'E_z', expr: 'z(E(0, 0, zz))', unidade: 'V/m' }],
        },
      ],
      passos: [
        {
          titulo: 'Leia a inclinação',
          texto: r`$E_z = -dV/dz$. Onde a curva é uma reta, o campo é constante; onde é plana, o campo é nulo; onde é íngreme, o campo é intenso.

A cena usa uma aproximação por trechos do gráfico da prova.`,
          parametros: { zP: 0.04 },
          medidas: [0, 1],
        },
        {
          titulo: '(I) Reta entre 3 e 5 cm',
          texto: r`Nesse trecho $V(z)$ é uma reta: a inclinação é a mesma, e o campo é **uniforme**. Verdadeira.

$$E \approx \frac{100\,\text{V}}{2\,\text{cm}} = 5\times10^3\,\text{V/m}.$$`,
          parametros: { zP: 0.04 },
          medidas: [2, 3],
        },
        {
          titulo: '(II) Patamar em 8 cm',
          texto: r`Entre 6,5 e 9 cm o potencial é praticamente constante: $E = 0$ em $z = 8\,\text{cm}$. Verdadeira, mesmo com $V \approx 210\,\text{V}$.`,
          parametros: { zP: 0.08 },
          medidas: [0, 4],
        },
        {
          titulo: '(III) A queda final é mais íngreme',
          previsao: { pergunta: 'Onde a curva é mais íngreme?', opcoes: ['em z = 4 cm', 'em z = 9,5 cm', 'são iguais'], correta: 1 },
          texto: r`Perto de $z = 10\,\text{cm}$, o potencial despenca: a inclinação é bem maior que a de $z = 4\,\text{cm}$. O campo é **mais** intenso em 9,5 cm. Falsa.`,
          parametros: { zP: 0.095 },
          medidas: [2, 5],
        },
        {
          titulo: 'Resposta',
          texto: r`Apenas (I) e (II): alternativa **(f)**.`,
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Campo como gradiente do potencial', lab: 'potencial' }],
        etapas: [
          { titulo: '(I)', texto: r`Reta: campo constante. Verdadeira.`, passo: 1 },
          { titulo: '(II)', texto: r`Patamar: campo nulo. Verdadeira.`, passo: 2 },
          { titulo: '(III)', texto: r`A inclinação em 9,5 cm é maior. Falsa.`, passo: 3 },
        ],
        resultado: r`Apenas (I) e (II): alternativa **(f)**.`,
        errosComuns: [
          r`Comparar valores de $V$ em vez de inclinações.`,
          r`Achar que $V \neq 0$ implica $E \neq 0$.`,
        ],
        oficial: { resposta: '(f)' },
      },
      alternativas: [
        { letra: 'a', texto: 'apenas a I.', porque: r`A (II) também é verdadeira.` },
        { letra: 'b', texto: 'apenas a II.', porque: r`A (I) também é verdadeira.` },
        { letra: 'c', texto: 'apenas a III.', porque: r`A (III) é a única falsa.` },
        { letra: 'd', texto: 'apenas a II e III.', porque: r`A (III) é falsa.` },
        { letra: 'e', texto: 'apenas a I e III.', porque: r`A (III) é falsa.` },
        { letra: 'f', texto: 'apenas a I e II.', correta: true, porque: r`Correta.` },
        { letra: 'g', texto: 'todas.', porque: r`A (III) é falsa.` },
        { letra: 'h', texto: 'nenhuma.', porque: r`(I) e (II) são verdadeiras.` },
      ],
    },

    /* ───────────────────────── Objetiva 4 ───────────────────────── */
    {
      id: 'obj4',
      numero: '4',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Capacitores quadrado e circular em paralelo',
      resumo: 'Mesma ddp: as energias se somam.',
      enunciado: r`Dois capacitores de placas paralelas com áreas quadradas de lado $a$ ($C_\text{qua}$) e circulares de raio $a$ ($C_\text{cir}$), muito grandes, separadas por uma mesma distância $d$ são ligados em paralelo e submetidos a uma diferença de potencial $V$. Nessas condições, a energia potencial elétrica total $U_E$ acumulada nos dois capacitores será dada por:`,
      figura: [
        { pagina: 4, recorte: [0.045, 0.07, 0.95, 0.2] },
        { pagina: 4, recorte: [0.555, 0.25, 0.835, 0.595] },
      ],
      cena: { escala: 0.002, extensao: 34, unidade: 'cm', camera: { pos: [44, 30, 88], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'ddp', simbolo: 'V', valor: 100, unidade: 'V', min: 10, max: 300, passo: 10 },
        { id: 'a', rotulo: 'Lado e raio', simbolo: 'a', valor: 0.05, unidade: 'm', min: 0.03, max: 0.06, passo: 0.002 },
        { id: 'd', rotulo: 'Separação', simbolo: 'd', valor: 0.02, unidade: 'm', min: 0.01, max: 0.03, passo: 0.002 },
      ],
      objetos: [
        { id: 'qua', tipo: 'capacitor', rotulo: 'C_qua', centro: [-0.07, 0, 0], eixo: 'x', lado: 'a', d: 'd', Q: 'eps0*a^2/d*V0' },
        { id: 'cir', tipo: 'capacitor', rotulo: 'C_cir (área πa²)', centro: [0.07, 0, 0], eixo: 'x', lado: 'sqrt(pi)*a', d: 'd', Q: 'eps0*pi*a^2/d*V0' },
      ],
      visual: { setasE: true, densidade: 19, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'C_qua', simbolo: r`C_\text{qua}`, expr: "C('qua')", unidade: 'F', teoria: 'eps0*a^2/d' },
        { rotulo: 'C_cir', simbolo: r`C_\text{cir}`, expr: "C('cir')", unidade: 'F', teoria: 'eps0*pi*a^2/d' },
        { rotulo: 'ddp em cada um', simbolo: 'V', expr: "Vcap('qua') - Vcap('cir')", unidade: 'V', teoria: 0 },
        { rotulo: 'Energia total', simbolo: 'U_E', expr: "U('qua') + U('cir')", unidade: 'J', teoria: '(1 + pi)*eps0*a^2*V0^2/(2*d)' },
      ],
      passos: [
        {
          titulo: 'Cada capacitância',
          texto: r`$$C_\text{qua} = \frac{\varepsilon_0a^2}{d}, \qquad C_\text{cir} = \frac{\varepsilon_0\pi a^2}{d}.$$

Na cena, o capacitor circular é desenhado como um quadrado de mesma área: só a área conta.`,
          medidas: [0, 1],
        },
        {
          titulo: 'Paralelo',
          previsao: { pergunta: 'Em paralelo, o que é igual nos dois capacitores?', opcoes: ['a carga', 'a ddp', 'a energia'], correta: 1 },
          texto: r`A ddp é a mesma, e as capacitâncias se somam: $C_\text{eq} = C_\text{qua} + C_\text{cir}$.`,
          medidas: [2],
        },
        {
          titulo: 'Energia',
          texto: r`$$U_E = \frac12C_\text{eq}V^2 = \frac{(1+\pi)\varepsilon_0a^2V^2}{2d}.$$

Alternativa **(b)**.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Capacitância e energia', lab: 'capacitor' }],
        etapas: [
          { titulo: 'Capacitâncias', texto: r`$C_\text{eq} = \varepsilon_0a^2(1+\pi)/d$.`, passo: 1 },
          { titulo: 'Energia', texto: r`$U_E = C_\text{eq}V^2/2$.`, passo: 2 },
        ],
        resultado: r`$U_E = \dfrac{(1+\pi)\varepsilon_0a^2V^2}{2d}$: alternativa **(b)**.`,
        errosComuns: [
          r`Somar como em série.`,
          r`Trocar $a$ e $d$: $C \propto$ área$/d$.`,
        ],
        oficial: { resposta: '(b)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$(1+\pi)\epsilon_0d^2V^2/(2a)$`, porque: r`Troca $a$ e $d$.` },
        { letra: 'b', texto: r`$(1+\pi)\epsilon_0a^2V^2/(2d)$`, correta: true, porque: r`Correta.` },
        { letra: 'c', texto: r`$\pi\epsilon_0d^2V^2/[2a(1+\pi)]$`, porque: r`Série, e com $a$ e $d$ trocados.` },
        { letra: 'd', texto: r`$\pi\epsilon_0a^2V^2/[2d(1+\pi)]$`, porque: r`É a associação em série.` },
        { letra: 'e', texto: r`$\pi\epsilon_0a^2V^2/(2d)$`, porque: r`Conta só o circular.` },
        { letra: 'f', texto: r`$\epsilon_0a^2V^2/(2\pi d)$`, porque: r`Divide por $\pi$ em vez de multiplicar.` },
        { letra: 'g', texto: r`$\epsilon_0d^2V^2/(2\pi a)$`, porque: r`Troca $a$ e $d$.` },
        { letra: 'h', texto: r`$\pi\epsilon_0d^2V^2/(2a)$`, porque: r`Troca $a$ e $d$.` },
      ],
    },

    /* ───────────────────────── Objetiva 5 ───────────────────────── */
    {
      id: 'obj5',
      numero: '5',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Campo de um cilindro com ρ = Cs',
      resumo: 'Qual gráfico de E(s)?',
      enunciado: r`Considere um cilindro circular sólido, de altura muito grande, comparada com o seu raio $R$, com uma densidade volumar de carga dada por $\rho(s) = Cs$ ($C$ = const), onde $s$ é a distância até o eixo do cilindro. Indique a alternativa que melhor representa o módulo do campo elétrico, devido a tal cilindro, como função de $s$.`,
      figura: {
        pagina: 5,
        recorte: [0.08, 0.015, 0.985, 0.895],
        mascaras: [
          { area: [0.676, 0.158, 0.8, 0.228], letra: '' },
          { area: [0.8, 0.167, 0.975, 0.228], letra: '' },
          { area: [0.84, 0.238, 0.985, 0.29], letra: '' },
          { area: [0.61, 0.372, 0.72, 0.425], letra: '' },
          { area: [0.314, 0.72, 0.39, 0.792], letra: '(e)' },
        ],
      },
      cena: { escala: 0.01, extensao: 10, unidade: 'cm', plano: 'xy', camera: { pos: [0, 0, 21], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'Cc', rotulo: 'Constante', simbolo: 'C', valor: 2e-5, unidade: 'C/m⁴', min: 5e-6, max: 5e-5, passo: 1e-6 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.04, unidade: 'm', min: 0.03, max: 0.05, passo: 0.002 },
        { id: 'rg', rotulo: 'Raio da gaussiana', simbolo: 's', valor: 0.025, unidade: 'm', min: 0.004, max: 0.09, passo: 0.001 },
      ],
      objetos: [
        { id: 'cil', tipo: 'cilindroInfinito', ponto: [0, 0, 0], direcao: 'z', raio: 'R', rho: 'Cc*r', rotulo: 'ρ = Cs' },
        { id: 'G', tipo: 'gaussiana', forma: 'cilindro', centro: [0, 0, 0], eixo: 'z', raio: 'rg', altura: 0.06, rotulo: 'S' },
      ],
      visual: { setasE: true, densidade: 15, planoSetas: 'xy' },
      medidas: [
        { rotulo: 'Carga por metro envolvida', simbolo: r`\lambda_\text{int}`, expr: "Qenc('G')/0.06", unidade: 'C/m', teoria: '2*pi*Cc*min(rg, R)^3/3' },
        { rotulo: 'Campo em s', simbolo: 'E', expr: 'x(E(rg, 0, 0))', unidade: 'V/m', teoria: 'Cc*min(rg, R)^3/(3*eps0*rg)' },
        { rotulo: 'Campo em s = R', simbolo: 'E(R)', expr: 'x(E(R, 0, 0))', unidade: 'V/m', teoria: 'Cc*R^2/(3*eps0)' },
      ],
      graficos: [
        {
          titulo: 'E(s)',
          tipo: 'perfil',
          x: { variavel: 'ss', de: 0.001, ate: '2.5*R', rotulo: 's', unidade: 'm' },
          series: [
            { rotulo: 'simulado', expr: 'x(E(ss, 0, 0))', unidade: 'V/m' },
            { rotulo: 'Gauss', expr: 'Cc*min(ss, R)^3/(3*eps0*ss)', unidade: 'V/m' },
          ],
        },
      ],
      passos: [
        {
          titulo: 'Carga dentro',
          texto: r`Num cilindro coaxial de raio $s$ e altura $\ell$:

$$Q_\text{int} = \int_0^sCs'\,2\pi s'\ell\,ds' = \frac{2\pi C\ell s^3}{3}.$$`,
          parametros: { rg: 0.025 },
          medidas: [0],
        },
        {
          titulo: 'Dentro do cilindro',
          previsao: { pergunta: 'Dentro do cilindro, E cresce com…', opcoes: ['s', 's²', 's³'], correta: 1 },
          texto: r`Só a lateral tem fluxo: $2\pi s\ell E = Q_\text{int}/\varepsilon_0$.

$$E = \frac{Cs^2}{3\varepsilon_0}.$$

Uma parábola, com concavidade para cima, que chega a $CR^2/3\varepsilon_0$ em $s = R$.`,
          parametros: { rg: 0.025 },
          medidas: [1, 2],
        },
        {
          titulo: 'Fora',
          texto: r`Fora, toda a carga é envolvida:

$$E = \frac{CR^3}{3\varepsilon_0s},$$

e o campo cai com $1/s$.

Alternativa **(c)**.`,
          parametros: { rg: 0.07 },
          medidas: [1],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Lei de Gauss com simetria cilíndrica', lab: 'gauss' }],
        etapas: [
          { titulo: 'Dentro', texto: r`$E = Cs^2/3\varepsilon_0$.`, passo: 1 },
          { titulo: 'Fora', texto: r`$E = CR^3/3\varepsilon_0s$.`, passo: 2 },
        ],
        resultado: r`Parábola até $CR^2/3\varepsilon_0$ e queda em $1/s$: alternativa **(c)**.`,
        errosComuns: [
          r`Esquecer o $s'$ do elemento de volume: isso dá $CR^2/2\varepsilon_0$.`,
          r`Desenhar reta dentro: isso seria $\rho$ uniforme.`,
        ],
        oficial: { resposta: '(c)' },
      },
      alternativas: [
        { letra: 'a', texto: 'Gráfico (a): diverge em s → 0 e vale CR²/2ε₀ em R.', porque: r`Em $s = 0$ não há carga envolvida: $E = 0$.` },
        { letra: 'b', texto: 'Gráfico (b): parábola até CR²/2ε₀.', porque: r`O valor em $R$ é $CR^2/3\varepsilon_0$.` },
        { letra: 'c', texto: 'Gráfico (c): parábola até CR²/3ε₀ e queda depois.', correta: true, porque: r`Correta.` },
        { letra: 'd', texto: 'Gráfico (d): constante até R.', porque: r`$E = 0$ no eixo.` },
        { letra: 'e', texto: 'Gráfico (e): reta até CR²/2ε₀.', porque: r`Reta seria $\rho$ uniforme.` },
        { letra: 'f', texto: 'Gráfico (f): curva côncava para baixo até CR²/3ε₀.', porque: r`O valor em $R$ está certo, mas a curva é $s^2$, côncava para cima.` },
      ],
    },

    /* ───────────────────────── Objetiva 6 ───────────────────────── */
    {
      id: 'obj6',
      numero: '6',
      secao: 'Objetiva',
      pontos: 1,
      titulo: 'Fio de duas metades',
      resumo: 'Mesmo campo nas duas metades: é um paralelo.',
      enunciado: r`Um fio condutor retilíneo tem seção tranversal circular de raio $R$ e com o formato mostrado na figura abaixo. A metade superior é formada por um material de resistividade elétrica $\rho$, enquanto a metade inferior é formada por um outro material de resistividade elétrica $2\rho$. Considerando que o campo elétrico é uniforme em toda a seção transversal, a resistência elétrica de um trecho de comprimento $L$ desse fio vale:`,
      figura: [
        { pagina: 6, recorte: [0.017, 0.07, 0.91, 0.235] },
        {
          pagina: 6,
          recorte: [0.415, 0.335, 0.73, 0.555],
          mascaras: [{ area: [0.405, 0.3, 0.46, 0.365], letra: '' }],
        },
        { pagina: 6, recorte: [0.11, 0.695, 0.82, 0.955] },
      ],
      cena: { escala: 0.01, extensao: 9, unidade: 'cm', camera: { pos: [13, 6, 12], alvo: [0, 0, 0] } },
      parametros: [
        { id: 'V0', rotulo: 'ddp', simbolo: 'V', valor: 1, unidade: 'V', min: 0.2, max: 5, passo: 0.1 },
        { id: 'rho', rotulo: 'Resistividade', simbolo: r`\rho`, valor: 1e-6, unidade: 'Ω·m', min: 2e-7, max: 5e-6, passo: 1e-7 },
        { id: 'R', rotulo: 'Raio', simbolo: 'R', valor: 0.02, unidade: 'm', min: 0.012, max: 0.03, passo: 0.002 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.1, unidade: 'm', min: 0.06, max: 0.14, passo: 0.005 },
      ],
      objetos: [
        { id: 'Ez', tipo: 'campoE', valor: ['0', '0', 'V0/L'] },
        { id: 'fio', tipo: 'condutor', a: [0, 0, '-L/2'], b: [0, 0, 'L/2'], raio: 'R', I: '3*V0*pi*R^2/(4*rho*L)' },
        { id: 'meio', tipo: 'caminho', pontos: [['0-R', 0, '-L/2'], ['R', 0, '-L/2'], ['R', 0, 'L/2'], ['0-R', 0, 'L/2'], ['0-R', 0, '-L/2']], seta: 0.3, tracejado: true },
        { id: 't1', tipo: 'rotulo', pos: [0, '1.5*R', 0], texto: 'ρ' },
        { id: 't2', tipo: 'rotulo', pos: [0, '-1.5*R', 0], texto: '2ρ' },
      ],
      visual: {},
      medidas: [
        { rotulo: 'Campo', simbolo: 'E', expr: 'z(E(0, 0, 0))', unidade: 'V/m', teoria: 'V0/L' },
        { rotulo: 'J na metade de cima', simbolo: 'J_1', expr: 'z(E(0, 0, 0))/rho', unidade: 'A/m²' },
        { rotulo: 'J na metade de baixo', simbolo: 'J_2', expr: 'z(E(0, 0, 0))/(2*rho)', unidade: 'A/m²' },
        { rotulo: 'Resistência de cima', simbolo: 'R_1', expr: '2*rho*L/(pi*R^2)', unidade: 'Ω' },
        { rotulo: 'Resistência de baixo', simbolo: 'R_2', expr: '4*rho*L/(pi*R^2)', unidade: 'Ω' },
        { rotulo: 'Resistência do trecho', simbolo: r`R_\text{eq}`, expr: 'V0/((z(E(0, 0, 0))/rho + z(E(0, 0, 0))/(2*rho))*pi*R^2/2)', unidade: 'Ω', teoria: '4*rho*L/(3*pi*R^2)' },
      ],
      passos: [
        {
          titulo: 'Série ou paralelo?',
          previsao: { pergunta: 'As duas metades estão…', opcoes: ['em série', 'em paralelo'], correta: 1 },
          texto: r`As metades vão de uma ponta à outra lado a lado: a mesma ddp nas duas, e correntes diferentes. É um **paralelo**. O campo é o mesmo nas duas: $E = V/L$.`,
          medidas: [0],
        },
        {
          titulo: 'Cada metade',
          texto: r`Cada uma tem área $\pi R^2/2$:

$$R_1 = \frac{\rho L}{\pi R^2/2} = \frac{2\rho L}{\pi R^2}, \qquad R_2 = \frac{4\rho L}{\pi R^2}.$$

Corrente maior onde a resistividade é menor: $J = E/\rho$.`,
          medidas: [1, 2, 3, 4],
        },
        {
          titulo: 'Resultado',
          texto: r`$$\frac{1}{R_\text{eq}} = \frac{\pi R^2}{2\rho L} + \frac{\pi R^2}{4\rho L} = \frac{3\pi R^2}{4\rho L} \quad\Rightarrow\quad R_\text{eq} = \frac{4\rho L}{3\pi R^2}.$$

Alternativa **(e)**.`,
          medidas: [5],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Resistência e associação em paralelo', lab: 'circuitos' }],
        etapas: [
          { titulo: 'Metades', texto: r`$R_1 = 2\rho L/\pi R^2$ e $R_2 = 4\rho L/\pi R^2$.`, passo: 1 },
          { titulo: 'Paralelo', texto: r`$R_\text{eq} = 4\rho L/3\pi R^2$.`, passo: 2 },
        ],
        resultado: r`$R_\text{eq} = \dfrac{4\rho L}{3\pi R^2}$: alternativa **(e)**.`,
        errosComuns: [
          r`Somar em série: o resultado seria $6\rho L/\pi R^2$.`,
          r`Usar a área inteira para cada metade.`,
        ],
        oficial: { resposta: '(e)' },
      },
      alternativas: [
        { letra: 'a', texto: r`$\dfrac{3\rho L}{4\pi R^2}$`, porque: r`Fração invertida.` },
        { letra: 'b', texto: r`$\dfrac{8\rho L}{4\pi R^2}$`, porque: r`É $R_1$.` },
        { letra: 'c', texto: r`$\dfrac{3\rho L}{8\pi R^2}$`, porque: r`Fração invertida, com a área errada.` },
        { letra: 'd', texto: r`$\dfrac{6\rho L}{\pi R^2}$`, porque: r`É a associação em série.` },
        { letra: 'e', texto: r`$\dfrac{4\rho L}{3\pi R^2}$`, correta: true, porque: r`Correta.` },
        { letra: 'f', texto: r`$\dfrac{\rho L}{6\pi R^2}$`, porque: r`Inverte a série.` },
        { letra: 'g', texto: r`$\dfrac{\rho L}{\pi R^2}$`, porque: r`Ignora a segunda resistividade.` },
      ],
    },

    /* ───────────────────────── Discursiva ───────────────────────── */
    {
      id: 'disc1',
      numero: 'D1',
      secao: 'Discursiva',
      pontos: 4,
      titulo: 'Fio num campo que cresce com x²',
      resumo: 'Força e torque resultantes somados ao longo do fio.',
      enunciado: r`Um fio retilíneo, muito longo, esticado ao longo do eixo $x$, conduz uma corrente estacionária $I$, no sentido positivo de tal eixo. O fio está sujeito a um campo magnético

$$\vec B = \begin{cases} B_0\dfrac{x^2}{L^2}\hat z, & 0 \le x \le L; \\ \vec 0, & -\infty < x < 0 \text{ ou } L < x < \infty, \end{cases}$$

onde $B_0 > 0$.

a) Desenhe o gráfico da componente $B_z$ versus $x$ para o intervalo $-3L/2 < x < 3L/2$, destacando os valores da função nos pontos mais importantes. b) Obtenha uma expressão para o vetor força magnética resultante $\vec F_m$ que atua sobre o fio. c) Considerando a superposição dos vários torques infinitesimais $d\vec\tau = \vec r\times d\vec F_m$ que atuam ao longo do fio, quando avaliados em relação à origem do sistema de coordenadas, obtenha uma expressão para o vetor torque magnético resultante $\vec\tau_m$ sobre o fio.`,
      cena: { escala: 0.01, extensao: 11, unidade: 'cm', plano: 'xy', camera: { pos: [3, -2, 22], alvo: [3, -2, 0] } },
      parametros: [
        { id: 'I0', rotulo: 'Corrente', simbolo: 'I', valor: 10, unidade: 'A', min: 2, max: 30, passo: 1 },
        { id: 'B0', rotulo: 'Campo em x = L', simbolo: 'B_0', valor: 0.5, unidade: 'T', min: 0.1, max: 1, passo: 0.05 },
        { id: 'L', rotulo: 'Comprimento', simbolo: 'L', valor: 0.08, unidade: 'm', min: 0.05, max: 0.09, passo: 0.002 },
      ],
      objetos: [
        { id: 'Bf', tipo: 'campoB', valor: `[0, 0, ${Bz('x')}]` },
        ...trechos,
        { id: 'fe', tipo: 'fio', I: 'I0', a: [-0.1, 0, 0], b: [0, 0, 0], infinito: 'a', rotulo: 'I' },
        { id: 'fd', tipo: 'fio', I: 'I0', a: ['L', 0, 0], b: [0.1, 0, 0], infinito: 'b' },
        ...setas,
      ],
      visual: { setasB: true, densidade: 15, planoSetas: 'xy', fontes: ['Bf'] },
      medidas: [
        { rotulo: 'Campo em x = L', simbolo: 'B(L)', expr: "z(Bde('Bf', L*0.999999, 0, 0))", unidade: 'T', teoria: 'B0' },
        { rotulo: 'Campo depois de L', simbolo: 'B(1{,}2L)', expr: "z(Bde('Bf', 1.2*L, 0, 0))", unidade: 'T', teoria: 0 },
        { rotulo: 'Força resultante', simbolo: 'F_y', expr: Fy, unidade: 'N', teoria: '0-I0*L*B0/3' },
        { rotulo: 'Torque resultante', simbolo: r`\tau_z`, expr: Tz, unidade: 'N·m', teoria: '0-I0*L^2*B0/4' },
      ],
      graficos: [
        {
          titulo: 'B_z(x)',
          tipo: 'perfil',
          x: { variavel: 'xx', de: '-1.5*L', ate: '1.5*L', rotulo: 'x', unidade: 'm' },
          series: [{ rotulo: 'B_z', expr: Bz('xx'), unidade: 'T' }],
        },
      ],
      passos: [
        {
          item: 'a',
          titulo: 'a) O gráfico',
          texto: r`Zero para $x < 0$; parábola de 0 a $B_0$ em $0 \le x \le L$; e cai a **zero**, de repente, depois de $L$. É contínuo em $x = 0$, e descontínuo em $x = L$.`,
          medidas: [0, 1],
        },
        {
          item: 'b',
          titulo: 'b) Força',
          previsao: { pergunta: 'A força aponta para…', opcoes: ['+ŷ', '−ŷ', '+x̂'], correta: 1 },
          texto: r`$$d\vec F = I\,dx\,\hat x\times B_0\frac{x^2}{L^2}\hat z = -I\frac{B_0}{L^2}x^2\,dx\,\hat y.$$

Só o trecho com campo conta:

$$\vec F_m = -I\frac{B_0}{L^2}\int_0^Lx^2\,dx\;\hat y = -\frac13ILB_0\,\hat y.$$

As setas crescem com $x^2$.`,
          medidas: [2],
        },
        {
          item: 'c',
          titulo: 'c) Torque',
          texto: r`$$d\vec\tau = x\hat x\times d\vec F = -I\frac{B_0}{L^2}x^3\,dx\,\hat z.$$

$$\vec\tau_m = -I\frac{B_0}{L^2}\int_0^Lx^3\,dx\;\hat z = -\frac14IL^2B_0\,\hat z.$$

A cena soma $x\,F_y$ em 20 trechos do fio.`,
          medidas: [3],
        },
      ],
      resolucao: {
        conceitos: [{ texto: 'Força sobre corrente', lab: 'ampere' }, { texto: 'Torque como soma de elementos' }],
        etapas: [
          { titulo: 'a) Gráfico', texto: r`$B_z = B_0x^2/L^2$ em $[0, L]$, e zero fora.`, passo: 0 },
          { titulo: 'b) Força', texto: r`$\vec F_m = -\frac13ILB_0\hat y$.`, passo: 1 },
          { titulo: 'c) Torque', texto: r`$\vec\tau_m = -\frac14IL^2B_0\hat z$.`, passo: 2 },
        ],
        resultado: r`$\vec F_m = -\frac13ILB_0\hat y$ e $\vec\tau_m = -\frac14IL^2B_0\hat z$.`,
        errosComuns: [
          r`Usar $\vec\tau = \vec r\times\vec F$ com a força total aplicada em $L/2$: a força não é uniforme.`,
          r`Trocar a ordem do produto vetorial e perder o sinal.`,
        ],
        oficial: { resposta: r`$\vec F_m = -\frac13ILB_0\hat y$; $\vec\tau_m = -\frac14IL^2B_0\hat z$.`, observacao: r`A prova foi fotografada só com as objetivas; o enunciado da discursiva vem do gabarito.` },
      },
      respostas: [
        { item: 'a', texto: r`Zero, parábola até $B_0$ em $x = L$, zero depois`, pontos: 1, criterio: 'Formato e descontinuidade em x = L.' },
        { item: 'b', texto: r`$\vec F_m = -\frac13ILB_0\hat y$`, pontos: 1.5, criterio: 'Elemento de força, sentido e integral.' },
        { item: 'c', texto: r`$\vec\tau_m = -\frac14IL^2B_0\hat z$`, pontos: 1.5, criterio: 'Produto vetorial e integral.' },
      ],
    },
  ],
}

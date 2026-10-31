import { z } from 'zod'

/**
 * Formato de cenário. Labs, questões curadas e questões geradas por IA a partir
 * de um PDF usam este mesmo formato. Unidades SI em tudo; números podem ser
 * expressões dos parâmetros (ex.: "2*R", "Q/(4*pi*eps0*d^2)") e do tempo t.
 */
export const Expr = z.union([z.string(), z.number()])
export const V3E = z.union([z.tuple([Expr, Expr, Expr]), z.string()])
const Eixo = z.union([z.enum(['x', 'y', 'z']), V3E])

const base = {
  id: z.string(),
  rotulo: z.string().optional(),
  /** Expressão booleana: o objeto só existe quando ≠ 0 (para variações com sliders). */
  ativo: Expr.optional(),
  arrastavel: z.boolean().optional(),
  /** Arrastar o objeto muda um parâmetro (ex.: arrastar a malha muda L). */
  arraste: z.object({ param: z.string(), eixo: z.enum(['x', 'y', 'z']), fator: z.number().default(1) }).optional(),
}

const Carga = z.object({ ...base, tipo: z.literal('carga'), q: Expr, pos: V3E })
const SegmentoCarga = z.object({ ...base, tipo: z.literal('segmentoCarga'), lambda: Expr, a: V3E, b: V3E })
const AnelCarga = z.object({
  ...base,
  tipo: z.literal('anelCarga'),
  Q: Expr.default(0),
  centro: V3E,
  raio: Expr,
  normal: Eixo.default('z'),
  /**
   * Arco em graus [início, fim]; omitido = anel completo. O ângulo é o polar
   * do curso: com normal z, 0° em x e 90° em y (normal x: 0° em y; normal y: 0° em z).
   */
  arco: z.tuple([Expr, Expr]).optional(),
  /** Densidade não uniforme λ(θ), expressão em `theta` (rad); com ela, `Q` é ignorado. */
  densidade: z.string().optional(),
})
const Placa = z.object({
  ...base,
  tipo: z.literal('placa'),
  sigma: Expr,
  centro: V3E,
  normal: Eixo.default('z'),
  largura: Expr,
  altura: Expr,
})
const Camada = z.object({
  K: Expr.default(1),
  /** Lâmina metálica: E = 0 dentro; `K` é ignorado. */
  condutora: z.boolean().default(false),
  /** Distâncias a partir da placa positiva, em m. */
  inicio: Expr,
  fim: Expr,
})
/** Com a fonte ligada, a ddp `V` é fixa e a carga sai de C; desligada, vale `Q`. */
const Fonte = { V: Expr.optional(), ligado: Expr.default(1) }
const Capacitor = z.object({
  ...base,
  tipo: z.literal('capacitor'),
  centro: V3E,
  eixo: Eixo.default('x'),
  /** Placas quadradas de lado `lado` (ou retangulares com `altura`). */
  lado: Expr,
  /** Placas circulares, de diâmetro `lado`. */
  circular: z.boolean().default(false),
  altura: Expr.optional(),
  d: Expr,
  /** Carga livre na placa positiva (fica na placa em −d/2 ao longo do eixo). */
  Q: Expr.default(0),
  ...Fonte,
  /** false (padrão): placas ideais, sem efeito de borda, como no curso. */
  bordas: z.boolean().default(false),
  /** Uma chapa ou uma lista de chapas sem sobreposição, empilhadas entre as placas: em série. */
  dieletrico: z.union([Camada, z.array(Camada)]).optional(),
  /** Blocos lado a lado, cada um indo de placa a placa: em paralelo. `fracao` da área. */
  lateral: z.array(z.object({ K: Expr, fracao: Expr })).optional(),
})
/**
 * Capacitor esférico ou cilíndrico: condutor interno de raio `a` e externo de raio
 * `b`, concêntricos. No cilindro, `comprimento` entra em C e em Q, sem efeito de borda.
 */
const CapacitorRadial = z.object({
  ...base,
  tipo: z.literal('capacitorRadial'),
  forma: z.enum(['esfera', 'cilindro']),
  centro: V3E,
  eixo: Eixo.default('z'),
  a: Expr,
  b: Expr,
  comprimento: Expr.default(1),
  /** Carga livre no condutor interno; no cilindro, em todo o comprimento. */
  Q: Expr.default(0),
  ...Fonte,
  /** Cascas entre `inicio` e `fim` (raios, em m): em série. */
  dieletrico: z.array(z.object({ K: Expr, inicio: Expr, fim: Expr })).optional(),
  /** Setores de `a` até `b`, com `fracao` da área: em paralelo. */
  setores: z.array(z.object({ K: Expr, fracao: Expr })).optional(),
})
/**
 * Densidade só radial: `rho` é uma expressão em `r` (distância ao centro, ou ao
 * eixo no cilindro), válida entre `raioInterno` (padrão 0) e `raio`. Com `rho`,
 * a carga total sai da integral e `Q`/`lambda` é ignorado; sem `rho` e com
 * `raioInterno`, a carga `Q`/`lambda` fica uniforme na camada.
 */
const Radial = { raioInterno: Expr.optional(), rho: z.string().optional() }

const Esfera = z.object({
  ...base,
  tipo: z.literal('esfera'),
  Q: Expr.default(0),
  centro: V3E,
  raio: Expr,
  oca: z.boolean().default(false),
  ...Radial,
})
const LinhaInfinita = z.object({ ...base, tipo: z.literal('linhaInfinita'), lambda: Expr, ponto: V3E, direcao: Eixo })
const CilindroInfinito = z.object({
  ...base,
  tipo: z.literal('cilindroInfinito'),
  lambda: Expr.default(0),
  ponto: V3E,
  direcao: Eixo,
  raio: Expr,
  oco: z.boolean().default(false),
  ...Radial,
})
const PlanoInfinito = z.object({ ...base, tipo: z.literal('planoInfinito'), sigma: Expr, ponto: V3E, normal: Eixo })
const CampoE = z.object({
  ...base,
  tipo: z.literal('campoE'),
  /** Vetor constante ou expressão em x, y, z. */
  valor: V3E,
  /** Potencial do campo, expressão em x, y, z; o teste de conteúdo confere E = −∇V. */
  potencial: z.string().optional(),
})
const CampoB = z.object({
  ...base,
  tipo: z.literal('campoB'),
  valor: V3E,
  regiao: z.object({ min: V3E, max: V3E }).optional(),
})
const Fio = z.object({
  ...base,
  tipo: z.literal('fio'),
  I: Expr,
  a: V3E,
  b: V3E,
  /** Essa ponta segue até o infinito (fio semi-infinito); o desenho para nela. */
  infinito: z.enum(['a', 'b']).optional(),
})
const FioInfinito = z.object({ ...base, tipo: z.literal('fioInfinito'), I: Expr, ponto: V3E, direcao: Eixo })
/**
 * Cilindro com corrente ao longo do eixo. `J` é uma expressão em `r` (distância
 * ao eixo), válida entre `raioInterno` (padrão 0) e `raio`; sem `J`, a corrente
 * `I` fica uniforme na seção.
 */
const CilindroCorrente = z.object({
  ...base,
  tipo: z.literal('cilindroCorrente'),
  ponto: V3E,
  direcao: Eixo,
  raio: Expr,
  raioInterno: Expr.optional(),
  J: Expr.optional(),
  I: Expr.default(0),
})
const Espira = z.object({
  ...base,
  tipo: z.literal('espira'),
  I: Expr,
  centro: V3E,
  raio: Expr,
  normal: Eixo.default('z'),
  N: Expr.default(1),
})
const Solenoide = z.object({
  ...base,
  tipo: z.literal('solenoide'),
  I: Expr,
  centro: V3E,
  eixo: Eixo.default('z'),
  raio: Expr,
  comprimento: Expr,
  N: Expr,
})
const Toroide = z.object({
  ...base,
  tipo: z.literal('toroide'),
  I: Expr,
  centro: V3E,
  eixo: Eixo.default('z'),
  raioMaior: Expr,
  raioMenor: Expr,
  N: Expr,
})
const Ima = z.object({
  ...base,
  tipo: z.literal('ima'),
  centro: V3E,
  /** Do polo S para o polo N. */
  eixo: Eixo.default('z'),
  comprimento: Expr,
  raio: Expr,
  /** Corrente superficial equivalente total (A·espiras). */
  intensidade: Expr,
})
const Particula = z.object({
  ...base,
  tipo: z.literal('particula'),
  q: Expr,
  m: Expr,
  pos: V3E,
  v: V3E,
  /** Quantos segundos (de simulação) de rastro manter. */
  rastro: Expr.optional(),
  /** Expressão em x, y, z: quando diferente de zero, a partícula para ali (chapa, anteparo). */
  parada: z.string().optional(),
  /** Solta pelo aluno: acaba ao sair da cena ou bater numa fonte, em vez de recomeçar. */
  cargaDeProva: z.boolean().optional(),
})
const Gaussiana = z.object({
  ...base,
  tipo: z.literal('gaussiana'),
  forma: z.enum(['esfera', 'cubo', 'cilindro']),
  centro: V3E,
  raio: Expr.optional(),
  lado: Expr.optional(),
  altura: Expr.optional(),
  eixo: Eixo.optional(),
  campo: z.enum(['E', 'B']).default('E'),
})
const Amperiana = z.object({ ...base, tipo: z.literal('amperiana'), centro: V3E, normal: Eixo.default('z'), raio: Expr })
const EspiraSensora = z.object({
  ...base,
  tipo: z.literal('espiraSensora'),
  centro: V3E,
  normal: Eixo.default('z'),
  raio: Expr.optional(),
  largura: Expr.optional(),
  altura: Expr.optional(),
  /** Direção do lado "largura" para espiras retangulares. */
  eixoU: Eixo.optional(),
  N: Expr.default(1),
  R: Expr.default(1),
  /** Só mede: não é desenhada (quando a moldura real é outro objeto). */
  oculta: z.boolean().default(false),
})
const Circuito = z.object({
  ...base,
  tipo: z.literal('circuito'),
  modelo: z.enum(['R', 'RC', 'RL', 'LC', 'RLC']),
  centro: V3E.default([0, 0, 0]),
  R: Expr.default(0),
  C: Expr.default(1),
  L: Expr.default(0),
  fem: Expr.default(0),
  q0: Expr.default(0),
  I0: Expr.default(0),
})
const Condutor = z.object({ ...base, tipo: z.literal('condutor'), a: V3E, b: V3E, raio: Expr, I: Expr })
const Sonda = z.object({ ...base, tipo: z.literal('sonda'), pos: V3E, campo: z.enum(['E', 'B']) })
const Seta = z.object({
  ...base,
  tipo: z.literal('seta'),
  origem: V3E,
  vetor: V3E,
  /** Se dado, a seta é desenhada com este comprimento (m) e a direção de `vetor`. */
  comprimento: Expr.optional(),
  papel: z.enum(['forca', 'E', 'B', 'v', 'I', 'neutro']).default('forca'),
})
const Cota = z.object({ ...base, tipo: z.literal('cota'), a: V3E, b: V3E, deslocamento: V3E.optional() })
const Rotulo = z.object({ ...base, tipo: z.literal('rotulo'), pos: V3E, texto: z.string() })
/** Curva orientada (caminho de integração, trajetória, linha candidata a linha de campo). */
const Caminho = z.object({
  ...base,
  tipo: z.literal('caminho'),
  pontos: z.array(V3E).min(2),
  /** Posição da ponta de seta, em fração do comprimento (padrão 0,55). */
  seta: z.number().default(0.55),
  tracejado: z.boolean().default(false),
})

export const Objeto = z.discriminatedUnion('tipo', [
  Carga,
  SegmentoCarga,
  AnelCarga,
  Placa,
  Capacitor,
  CapacitorRadial,
  Esfera,
  LinhaInfinita,
  CilindroInfinito,
  PlanoInfinito,
  CampoE,
  CampoB,
  Fio,
  FioInfinito,
  CilindroCorrente,
  Espira,
  Solenoide,
  Toroide,
  Ima,
  Particula,
  Gaussiana,
  Amperiana,
  EspiraSensora,
  Circuito,
  Condutor,
  Sonda,
  Seta,
  Cota,
  Rotulo,
  Caminho,
])
export type Objeto = z.infer<typeof Objeto>
export type ObjetoInput = z.input<typeof Objeto>

export const Parametro = z.object({
  id: z.string(),
  rotulo: z.string(),
  /** LaTeX curto exibido ao lado do slider, ex.: "\\lambda". */
  simbolo: z.string().optional(),
  valor: z.number(),
  unidade: z.string().default(''),
  min: z.number().optional(),
  max: z.number().optional(),
  passo: z.number().optional(),
  log: z.boolean().optional(),
  /** Escolhas discretas (ex.: casos particulares K=1, λ=1). */
  opcoes: z.array(z.object({ valor: z.number(), rotulo: z.string() })).optional(),
  /**
   * Com o relógio correndo, o valor vai de `de` a `ate` e volta, em `periodo` segundos
   * de simulação. Vale enquanto `ativo` for ≠ 0; o padrão é o curso inteiro do slider.
   */
  varre: z.object({ periodo: z.number(), de: z.number().optional(), ate: z.number().optional(), ativo: Expr.optional() }).optional(),
})
export type Parametro = z.infer<typeof Parametro>

/** Variável de estado: `derivada` é integrada em cada subpasso, na ordem da lista. */
export const Dinamica = z.object({ id: z.string(), inicial: Expr, derivada: Expr })

export const Visual = z.object({
  linhasE: z.boolean().optional(),
  linhasB: z.boolean().optional(),
  setasE: z.boolean().optional(),
  setasB: z.boolean().optional(),
  planoV: z.union([z.boolean(), z.object({ normal: z.enum(['x', 'y', 'z']), posicao: z.number() })]).optional(),
  equipotenciais: z.boolean().optional(),
  /** Textura de limalha (LIC) no plano de corte. */
  limalha: z.boolean().optional(),
  densidade: z.number().optional(),
  /** Plano onde desenhar as setas de campo (padrão: grade 3D, ou xy nas cenas "xy"). */
  planoSetas: z.enum(['xy', 'yz', 'xz']).optional(),
  /** Restringe setas/linhas de campo às fontes destes objetos. */
  fontes: z.array(z.string()).optional(),
})
export type Visual = z.infer<typeof Visual>

export const Medida = z.object({
  rotulo: z.string(),
  simbolo: z.string().optional(),
  expr: Expr,
  unidade: z.string().default(''),
  /** Valor teórico para comparar (mostra o erro relativo). */
  teoria: Expr.optional(),
  casas: z.number().optional(),
  ativo: Expr.optional(),
})
export type Medida = z.infer<typeof Medida>

export const Grafico = z.object({
  titulo: z.string(),
  tipo: z.enum(['tempo', 'perfil']),
  /** Expressão: o gráfico só aparece quando ≠ 0 (para modos de um mesmo cenário). */
  ativo: Expr.optional(),
  /** Para perfil: a variável percorrida e o intervalo. */
  x: z
    .object({
      variavel: z.string(),
      de: Expr,
      ate: Expr,
      rotulo: z.string(),
      unidade: z.string().default(''),
      /** Onde a cena está agora nesta curva: um ponto que anda sobre o gráfico. */
      marca: Expr.optional(),
    })
    .optional(),
  series: z.array(z.object({ rotulo: z.string(), expr: Expr, unidade: z.string().default('') })),
  janela: z.number().optional(),
})
export type Grafico = z.infer<typeof Grafico>

export const Camera = z.object({ pos: z.tuple([z.number(), z.number(), z.number()]), alvo: z.tuple([z.number(), z.number(), z.number()]).optional() })

export const Passo = z.object({
  titulo: z.string(),
  /** Texto com Markdown leve e LaTeX entre $…$ ou $$…$$. */
  texto: z.string(),
  item: z.string().optional(),
  camera: Camera.optional(),
  destacar: z.array(z.string()).optional(),
  mostrar: z.array(z.string()).optional(),
  ocultar: z.array(z.string()).optional(),
  visual: Visual.optional(),
  parametros: z.record(z.string(), z.number()).optional(),
  /** Índices das medidas a destacar neste passo. */
  medidas: z.array(z.number()).optional(),
  /** A conta completa, aberta sob "ver a conta". */
  detalhe: z.string().optional(),
  /**
   * "Preveja antes de ver": o texto do passo (e os objetos em `oculta`) só
   * aparece depois que o aluno escolhe uma opção.
   */
  previsao: z
    .object({
      pergunta: z.string(),
      opcoes: z.array(z.string()).min(2),
      correta: z.number(),
      oculta: z.array(z.string()).optional(),
    })
    .optional(),
})
export type Passo = z.infer<typeof Passo>

/** Resolução detalhada, no estilo de um gabarito comentado. */
export const Resolucao = z.object({
  /** Conceitos usados, com o laboratório onde praticar cada um. */
  conceitos: z.array(z.object({ texto: z.string(), lab: z.string().optional() })).default([]),
  /** Etapas da solução; `passo` liga a etapa ao passo correspondente da cena. */
  etapas: z.array(z.object({ titulo: z.string(), texto: z.string(), passo: z.number().optional() })),
  resultado: z.string(),
  errosComuns: z.array(z.string()).default([]),
  /** Preenchido quando a resolução foi conferida com o gabarito oficial. */
  oficial: z.object({ resposta: z.string(), observacao: z.string().optional() }).optional(),
})
export type Resolucao = z.infer<typeof Resolucao>

export const Desafio = z.object({
  pergunta: z.string(),
  dica: z.string().optional(),
  condicao: Expr,
  sucesso: z.string().optional(),
})

export const Cena = z.object({
  /** Metros por unidade de cena: 0.01 = cada unidade da grade vale 1 cm. */
  escala: z.number().default(1),
  /** Meia-aresta do cubo visível, em unidades de cena. */
  extensao: z.number().default(5),
  unidade: z.enum(['m', 'cm', 'mm']).default('m'),
  camera: Camera.optional(),
  tempo: z
    .object({
      /** Segundos de simulação por segundo real. */
      escala: z.number(),
      unidade: z.enum(['s', 'ms', 'µs', 'ns']).default('s'),
      duracao: z.number().optional(),
      passo: z.number().optional(),
      /** O relógio para quando as cargas de prova da cena acabam, e o play recomeça. */
      ateParar: z.boolean().optional(),
    })
    .optional(),
  /** Plano do chão: "xy" para problemas desenhados no plano da folha. */
  plano: z.enum(['xz', 'xy']).default('xz'),
})

/** Recorte do PDF original (só na autoria: o site recebe a imagem WebP pronta). */
const FiguraParte = z.object({
  pagina: z.number(),
  recorte: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  /** Áreas da página a cobrir antes de recortar (marcas à mão no scan). */
  mascaras: z.array(z.object({ area: z.tuple([z.number(), z.number(), z.number(), z.number()]), letra: z.string() })).optional(),
})

export const Scenario = z.object({
  /** Laboratórios que treinam o assunto: vêm de `content/cobertura.ts` ao carregar a prova. */
  labs: z.array(z.string()).optional(),
  id: z.string(),
  titulo: z.string(),
  resumo: z.string().optional(),
  enunciado: z.string().optional(),
  teoria: z.string().optional(),
  figura: z.union([FiguraParte, z.array(FiguraParte)]).optional(),
  cena: Cena.default({ escala: 1, extensao: 5, unidade: 'm', plano: 'xz' }),
  parametros: z.array(Parametro).default([]),
  /** Equações do movimento de quem não é partícula: dipolo, espira girando. */
  dinamica: z.array(Dinamica).default([]),
  objetos: z.array(Objeto),
  visual: Visual.default({}),
  medidas: z.array(Medida).default([]),
  graficos: z.array(Grafico).default([]),
  passos: z.array(Passo).default([]),
  desafios: z.array(Desafio).default([]),
  alternativas: z
    .array(
      z.object({
        letra: z.string(),
        texto: z.string(),
        correta: z.boolean().optional(),
        /** Por que está certa ou, para os distratores, qual erro leva a ela. */
        porque: z.string().optional(),
      }),
    )
    .optional(),
  respostas: z
    .array(z.object({ item: z.string(), texto: z.string(), pontos: z.number().optional(), criterio: z.string().optional() }))
    .default([]),
  resolucao: Resolucao.optional(),
  /** Permite ao aluno adicionar cargas com um botão (lab de Coulomb). */
  editor: z.object({ adicionarCarga: z.boolean().optional() }).optional(),
})
export type Scenario = z.infer<typeof Scenario>
export type ScenarioInput = z.input<typeof Scenario>

export const Prova = z.object({
  id: z.string(),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  questoes: z.array(Scenario.extend({ numero: z.string(), secao: z.string().optional(), pontos: z.number().optional() })),
})
export type Prova = z.infer<typeof Prova>
export type ProvaInput = z.input<typeof Prova>
export type Questao = Prova['questoes'][number]

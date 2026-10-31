---
type: documentation
status: active
agent: [claude]
date: 2026-10-30
tags: [fisica3, arquitetura]
lock: none
---

# Summary
Três camadas com dependência num só sentido: física pura (SI, sem render),
cenário (dados + expressões, compilados para fontes físicas) e cena/interface
(React Three Fiber). Campos pesados são calculados num pool de Web Workers.
Uma questão de prova nunca vira código; vira dados validados.

# Arquitetura da bancada

```
src/physics/   TS puro, testado por vitest
  sources.ts      E, V e B por fórmula fechada: carga, segmento, placa retangular,
                  esfera, casca, linha/cilindro/plano infinitos, campo por expressão,
                  segmento de corrente (Biot-Savart) e espira circular exata
                  (integrais elípticas por AGM)
  integrals.ts    fluxo por Gauss-Legendre, Q_enc, circulação, I_enc (inclusive
                  espiras exatas furando o disco), fluxo magnético
  dynamics.ts     integrador de Boris; RC, RL, LC, RLC analíticos
  fieldlines.ts   linhas de campo por RK4, número de linhas ∝ carga
  iso.ts          equipotenciais por tetraedros marchantes

src/scenario/  o formato de dados
  schema.ts       zod: Scenario e Prova, incluindo gabarito, previsões e arraste
  expr.ts         expressões sem eval; só chaves próprias; limites de tamanho e
                  aninhamento
  compile.ts      cenário + parâmetros + t + arrastos/rotações -> fontes, entidades,
                  funções de medida e o que cada objeto aceita (Interativo);
                  recusa números não finitos
  sim.ts          relógio, partículas (Boris em subpassos) e `dinamica` (Euler
                  semi-implícito); a varredura de parâmetros é função de t, em compile.ts
  validate.ts     schema + compilação de cada questão

src/scene/     React Three Fiber
  fieldCompute.ts setas, linhas, plano de V, textura para limalha, equipotenciais:
                  funções puras que saem em Float32Array
  field.worker.ts recompila o cenário no Worker e roda os jobs acima
  useFieldJob.ts  pool de Workers; uma tarefa em voo por camada, a mais nova vence
  Fields.tsx      render: setas instanciadas, linhas com tracejado que flui,
                  ⊗/⊙, plano de V, limalha (LIC em shader), equipotenciais
  Interaction.tsx esfera envolvente, teclado, sonda livre
  Stage.tsx       câmera com auto-enquadramento, luz, pós (N8AO, bloom),
                  qualidade adaptativa, render sob demanda
  Objects.tsx     um componente por tipo de entidade

src/content/   provas e labs; registry.ts carrega cada um ao abrir a rota;
               cobertura.ts liga cada questão aos labs, e um teste exige isso
src/treino/    banco das terceiras provas, plano diário e progresso: lógica pura,
               testada; o que o aluno faz fica no localStorage do navegador dele
src/ui, src/views  painel (10 Hz), passos e previsões, gabarito, cartão de seleção,
                   treino (painel, simulado, fila por tema e revisão)
scripts/           recortes do PDF (PyMuPDF), catálogo do acervo, orçamento do JS inicial
fontes/            PDFs originais; fontes/acervo/ fica fora do Git
```

## Decisões

- **Sem motor de corpo rígido.** Campos não são corpos rígidos; o núcleo é
  próprio e cada fórmula tem teste contra o resultado do curso.
- **Fórmulas fechadas.** Placa e segmento analíticos dão campo uniforme de
  verdade no capacitor. A espira exata substituiu 32 segmentos: ~20× mais
  rápida e sem erro de polígono.
- **Capacitor ideal por padrão,** como no curso. O dielétrico entra como
  cargas de polarização σ_b = σ(1 − 1/K). Em paralelo, E é o mesmo nos dois lados,
  e entre as placas vale a carga líquida, que é uniforme. No esférico e no
  cilíndrico é igual, com cascas no lugar de planos, e nada é fórmula pronta: C sai
  das camadas, e a ddp medida no campo confere com Q/C.
- **Cálculo fora da thread de render.** O Worker recompila o próprio cenário,
  o que cobre campos definidos por expressão (funções não atravessam
  `postMessage`).
- **Expressões em vez de código,** com testes de estresse: entrada arbitrária
  só produz valor ou ExprError.
- **Sem servidor.** A geração de cenários por IA foi removida do site; a
  curadoria é manual, feita a partir do gabarito oficial.
- **Conteúdo por rota.** A página inicial e os links só conhecem
  `content/catalogo.json` (ids, títulos e resumos), gerado por um teste a partir
  das provas, que também reprova se ele ficar defasado. Cada prova é um chunk
  (`import.meta.glob` em `content/registry.ts`), os labs são outro, e o zod e o
  KaTeX saem da entrada. O chunk da cena baixa junto com o conteúdo, sem esperar
  por ele.
- **Sem o `<Line>` do drei.** Ele descarta o material a cada geometria nova, o
  que religa o shader, e isso não aparece como tarefa longa em JS: o trabalho vai
  para o processo da GPU. Use `Linha` (`scene/parts.tsx`). Rastro muda sem parar,
  então `Rastro` (`Objects.tsx`) escreve em buffers fixos. Para conferir uma cena,
  conte as chamadas a `gl.linkProgram` por quadro: tem de dar zero.
- **Chunk que não chega não vira tela branca.** O `Limite` em `App.tsx` mostra um
  aviso com "Recarregar", o caso de uma aba aberta depois de publicar uma versão
  nova, quando os nomes dos arquivos mudam.

Relacionado: [[fisica3/README]], [[fisica3/docs/FORMATO_CENARIO]], [[fisica3/docs/ACERVO]].

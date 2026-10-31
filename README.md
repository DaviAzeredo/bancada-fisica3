---
type: project
status: active
agent: [claude]
date: 2026-10-30
tags: [fisica3, ufrj, eletromagnetismo, three, r3f, educacao]
lock: none
---

# Summary
Bancada 3D de Física III (UFRJ): questões de prova resolvidas passo a passo
numa cena que acompanha cada passo, gabarito comentado e conferido com o
oficial, 22 laboratórios com simulação ao vivo e uma área de treino para a P3.
A física é calculada no navegador, em SI, e cada medida da cena é comparada à
fórmula do curso. Site estático, sem servidor e sem custo por aluno.

# Bancada · Física III

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 700 testes: física, provas, labs ao vivo, treino, gabarito, desempenho e estresse
npm run build      # site estático em dist/, com orçamento do JS inicial
npm run catalogo   # regenera a lista de provas e labs da página inicial
```

## Publicação

O site fica em **https://daviazeredo.github.io/bancada-fisica3/**, servido
pelo repositório público `DaviAzeredo/bancada-fisica3`. Esse repositório
recebe só a árvore atual desta pasta, sem histórico e sem `fontes/`. Depois de
commitar aqui:

```bash
bash scripts/publicar.sh
```

O GitHub Actions do repositório público roda os testes, gera o build e
atualiza o Pages.

## Segurança

Site estático: sem login, sem servidor e sem dado de aluno fora do próprio navegador.

- **Política de conteúdo** (`vite.config.ts`): meta CSP só no build, sem script de
  fora, sem `eval` e sem conexão externa. `scripts/orcamento.mjs` reprova o build sem
  ela. O GitHub Pages não deixa definir cabeçalhos, então `frame-ancestors` não se
  aplica; o site não tem nenhuma ação sensível a clique enganado.
- **Texto** (`src/lib/rich.ts`): tudo que não é fórmula passa por escape, e o KaTeX
  roda com `trust: false`. `auditoria.test.ts` confere.
- **Progresso** (`saneia`, em `src/treino/progresso.ts`): o que vem do `localStorage`
  é validado campo a campo, porque pode estar velho, cortado ou mexido à mão.
- **Publicação**: só o job de deploy do CI pode publicar, porque o de build roda
  scripts de pacotes do npm, e as ações ficam fixadas por hash. `publicar.sh` assina
  com o endereço `noreply` do GitHub, e nunca leva `fontes/`.

## O que tem

- **Provas curadas** ([provas](src/content/provas/)): 27 provas, de 2026.2 até
  2022.2. Todas as P3 dos últimos três anos estão aqui: 2023.2 e 2024.1 nos dois
  turnos, 2024.2, 2025.1, 2025.2 e 2026.1. A lista por semestre está em
  [[fisica3/docs/ACERVO]].
  - Cada questão traz o enunciado original recortado (só enunciado e figura;
    as respostas marcadas no scan não aparecem).
  - Passos que movem a cena, alguns com "preveja antes de ver".
  - Gabarito comentado: conceitos, etapas, erros comuns e o porquê de cada
    alternativa. Conferido com o gabarito oficial; as divergências ficam
    anotadas na própria questão.
- **Treino P3** ([treino](src/treino/)): dias até a prova, domínio das 66 questões
  das terceiras provas (nos períodos sem P3, a terceira prova é a PF), peso de cada
  tema, plano diário, simulados com relógio e autocorreção da discursiva, fila por
  tema e revisão espaçada. As três provas mais recentes ficam só para simulado. O
  progresso fica no navegador de cada aluno.
- **Laboratórios** ([labs](src/content/labs/)): 22, com 75 modos, todos abrindo em
  movimento: partículas no campo da própria cena, dipolo e espira oscilando, e
  sondas que varrem o espaço com um ponto andando sobre o gráfico.
  - Eletrostática: Coulomb, dipolo, distribuições contínuas, Gauss, densidade
    variável, planos, condutores, potencial e energia.
  - Capacitores: placas, cilíndrico e esférico, dielétricos em série e em paralelo,
    fonte ligada ou isolado, e associação de capacitores.
  - Corrente: resistividade e circuitos de corrente contínua.
  - Magnetismo: Lorentz, força e torque em correntes, Biot-Savart por trechos,
    Ampère e distribuições J(s).
  - Indução: Faraday, barra, região e B(t), circuitos RC, RL e LC, e corrente de
    deslocamento.
  - [cobertura.ts](src/content/cobertura.ts) liga cada questão de prova aos labs que
    treinam o assunto, e um teste exige que nenhuma fique de fora.
- **Na cena:**
  - linhas de campo com fluxo animado, setas, ⊗/⊙, plano de potencial,
    equipotenciais e limalha de ferro (LIC);
  - sonda livre sob o cursor;
  - cargas de prova soltas (até 8): cada uma sai de um ponto, segue o campo e
    acaba ao sair da cena ou bater numa fonte, deixando o rastro;
  - linha do tempo.
- **Controle preciso:**
  - arrastar (com snap, prumo e coordenadas) e arrastar ligado a parâmetro
    (mover a malha da D2 muda L);
  - teclado: setas, PgUp/PgDn, Q/E/Z/X para girar, Shift fino, F enquadra,
    P sonda;
  - zoom igual em Windows e Mac: ×1,36 por dente de roda, pinça acompanhando os
    dedos; o ajuste está em [zoom.ts](src/scene/zoom.ts);
  - cartão de seleção com coordenadas digitáveis;
  - vibração no toque.

## Provas novas

O David manda prova e gabarito oficial; a prova é escrita à mão, conferida e
testada. O fluxo está em [[fisica3/docs/FORMATO_CENARIO]]. O acervo recebido
(2009 a 2026.2) e o que falta curar estão em [[fisica3/docs/ACERVO]]. Não há
geração automática no site: nenhum aluno consome tokens de API.

## Como funciona

- [[fisica3/docs/ARQUITETURA]]: camadas, Worker de campos, espira exata.
- [[fisica3/PRODUCT]] e [[fisica3/DESIGN]]: público, tom e tokens visuais.

## Desempenho (medido)

| Tarefa | Antes | Agora |
| --- | --- | --- |
| Linhas de B do solenoide | 352 ms na thread principal | ~17 ms, no Worker |
| Linhas de B do toroide | — | ~5 ms, no Worker |
| Recompilar a D2 (cada passo do arrasto) | — | ~2 ms |
| Limalha 256² | — | ~135 ms, no Worker |
| Página inicial (JS gz) | ~422 KB | ~86 KB (bancada, zod, KaTeX e provas sob demanda) |
| Questão aberta (JS gz, total) | ~850 KB | ~635 KB, mais ~17 KB do Worker |
| Conteúdo de uma prova (JS gz) | junto com as outras 23 | 8 a 14 KB, ao abrir a rota |
| Shader religado em cena com relógio e linhas | 1 por quadro | 0 |
| PDF + pdf.js no site | 3,7 MB | 0 (recortes WebP, ~320 KB) |

O orçamento está em `src/scene/perf.test.ts`, e `scripts/orcamento.mjs` reprova o
build se o JS da página inicial passar de 120 KB. O painel compila a 10 Hz; a cena,
a 60 Hz. Abaixo de ~45 fps a qualidade cai (resolução, bloom, AO). Cenas
paradas só redesenham quando algo muda.

## Verificação visual

```yaml
visual_check:
  desktop: pass        # 1440x900
  mobile: pass         # 375x812: camadas recolhidas, rótulos menores, câmera recua para caber
  text_overflow: pass
  contrast_review: pass
  keyboard_focus: pass # objetos movem e giram pelo teclado; passos por ← →
  states_reviewed: [montando cena, webgl indisponível, erro no cenário, previsão aberta, seleção, arrasto]
  reduced_motion: pass # sem transição de câmera, sem fluxo animado, parâmetros trocam sem deslizar
  screenshots_or_probe: navegador embutido; com o painel oculto, simulação avançada por __step (dev)
```

Rubrica (0 a 4): hierarquia 3,5 · composição 3,5 · tipografia 3,5 · cor 3,5 ·
componentes 3,5 · estados 3,5 · responsivo 3,5 · acessibilidade 3 · interação 4 ·
performance 3,5. Média 3,5.

**Limitação desta verificação:** os 60 fps não foram medidos em tela visível.
O painel do navegador estava oculto, e o rAF fica estrangulado nesse estado.
Os tempos acima são dos testes.

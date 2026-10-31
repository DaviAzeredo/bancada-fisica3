---
type: documentation
status: active
agent: [claude]
date: 2026-10-30
tags: [fisica3, cenario, como-fazer]
lock: none
---

# Summary
Como transformar uma prova (PDF + gabarito oficial) em cenários do site: cena
em SI, passos guiados, gabarito comentado conferido com o oficial e recortes
do enunciado. `npm test` confere medida × teoria em todos os passos e a
completude do gabarito.

# Curando uma prova

Modelo a copiar: [p2-2026-1-diurno.ts](../src/content/provas/p2-2026-1-diurno.ts).
Formato completo: [schema.ts](../src/scenario/schema.ts).

## 1. Originais e recortes
1. Coloque os PDFs em `fontes/acervo/<semestre>/` (fora do Git) e a prova
   escolhida em `fontes/provas/<id>.pdf`.
2. Para cada questão, preencha `figura: { pagina, recorte: [x0, y0, x1, y1] }`
   (normalizado na página). Recorte **só enunciado e figura**: scans costumam
   ter a resposta marcada à mão nas alternativas. Enunciado em duas colunas:
   use uma lista de recortes.
3. Gere as imagens (PyMuPDF e Pillow na máquina de quem cura):

   ```bash
   node scripts/figuras.mjs src/content/provas/<id>.ts | python scripts/recortes.py fontes/provas/<id>.pdf public/provas
   ```

## 2. Cena
- `cena.escala` em metros por unidade de cena (0,01 = grade em cm);
  `extensao` é a meia-aresta visível. Figura desenhada na folha:
  `plano: 'xy'`, com "entrando na página" igual a −z.
- Valores simbólicos viram parâmetros com sliders. Dado fixo: `min = max`.
- Use os tipos prontos (carga, capacitor com dielétrico, esfera oca, fio,
  fioInfinito, espira, solenoide, ima, particula, gaussiana, amperiana...).
- `arrastavel: true` libera mover e girar. `arraste: { param, eixo }` faz o
  arrasto mudar um parâmetro, como a malha da D2 que muda L.
- Recursos menos óbvios do [schema](../src/scenario/schema.ts):
  - `esfera` e `cilindroInfinito`: `rho` em função de `r` e `raioInterno`.
    Com 1/r no eixo, use um `raioInterno` pequeno e desconte-o das cargas
    induzidas, ou sobra resíduo dentro do metal.
  - `cilindroCorrente`: `J` em função de `r`, com `raioInterno` para cascas.
  - `anelCarga`: `arco` em graus polares e `densidade` em função de `theta`.
  - `fio.infinito: 'a'|'b'`: a ponta segue ao infinito, mas o desenho para nela.
  - `capacitor`: várias chapas em `dieletrico` (série), blocos em `lateral`
    (paralelo), `condutora: true` e `circular: true`.
  - `capacitorRadial`: esférico ou cilíndrico, com cascas em `dieletrico` (série) e
    setores em `setores` (paralelo).
  - Nos dois capacitores, `V` fixa a ddp da fonte e `Q` sai de C; com `ligado`
    nulo, vale `Q`.
  - `espiraSensora.oculta`: só mede. Para uma espira cruzando a borda de um
    campo, meça só a parte imersa: a integral numérica erra na descontinuidade.
  - `caminho`: curva sem efeito físico, com `intE('id')` e `intB('id')`.
  - `particula.parada`: expressão em x, y, z que trava a partícula. Sem ela, a
    partícula recomeça ao sair da cena; `cargaDeProva: true` a faz acabar ali.
- Todo lab abre andando, e `aoVivo.test.ts` exige isso em cada modo. Há quatro
  peças, nesta ordem de preferência:
  - `particula` no campo da própria cena: é a física inteira, sem atalho. Com
    `cargaDeProva: true` e `cena.tempo.ateParar`, o relógio para quando ela acaba
    e o play recomeça: não vira laço.
  - `dinamica`: lista de `{ id, inicial, derivada }` para o que não é partícula,
    como um dipolo girando. A variável entra nas expressões pelo id. Ponha a
    velocidade antes da posição: é Euler semi-implícito, e assim a energia não deriva.
  - `varre: { periodo, de?, ate?, ativo? }` num parâmetro: o valor vai e volta com
    o relógio, e o slider acompanha. Use `ativo: 'auto==1 && ...'` com o parâmetro
    `MOVIMENTO` de `labs/tipos.ts`: mexer no slider passa para o manual sozinho.
  - `x.marca` num gráfico de perfil: expressão com a posição atual, que vira um
    ponto andando sobre a curva.
- Desafio que depende de parâmetro varrido leva `auto==0` na condição: senão a
  varredura o resolve sozinha.
- Objeto que muda de tamanho numa varredura usa geometria de tamanho 1 e `scale`, ou
  `Coroa`, que escreve no lugar. Geometria declarada com `args` novos a cada quadro só
  é liberada com a página ociosa, o que não acontece com a cena andando, e os buffers
  se acumulam na GPU. Material também não pode nascer por quadro: religa o shader.
- Corrente ou carga em movimento **não** vira fonte sozinha. Para um campo
  induzido (capacitor carregando, E induzido por B variável), escreva-o em
  `campoB` ou `campoE` e confira a circulação contra a derivada do fluxo.
- Com relógio deslocado (`t + t0`), cada passo pode mostrar um instante: o
  teste roda só em `t = 0`, salvo cenas com partícula.
- Gráfico que só vale em um modo leva `ativo`, como as medidas.
- `src/content/provas/modelos.ts` reúne curvas e o condutor oco; importe-o
  como `'./modelos.ts'`, porque `figuras.mjs` roda em Node puro.

## 3. Medidas
`expr` mede na simulação (`fluxo('S')`, `forca('fio','fonte')`, `C('cap')`,
`V(x,y,z)`); `teoria` é a resposta analítica. O teste exige que batam em 1%,
com folga absoluta de 1e-9: grandezas menores que isso passam sem conferir nada,
então normalize-as (como `B/(μ₀ev/πa²)`) ou escolha valores maiores.

Funções úteis: `Ede`, `Bde` e `Vde` (um objeto só), `Qenc`, `fluxoE`, `fluxoB`,
`fluxoSai` e `fluxoEntra` (parcelas de `fluxo`, que mudam mesmo quando o total fica
parado; ao mover uma gaussiana com carga de fora ou ∇·B uniforme, mostre-as),
`dfluxoE` (ε₀ vezes ela é a corrente de deslocamento), `energiaCampo` (∫ε₀E²/2 dV,
só com simetria esférica), `fem`, `Iind`, `circ`,
`Ienc`, `F('carga')`, `rastroSpan('p','x')`, `pos`, `vel`. Não existe `log`:
use `ln`. Número menos vetor é erro: escreva `(0-1)*[...]`.

Medida que só vale depois de um tempo: `t > T ? expr : 0/0` aparece como
travessão até lá. O teste roda a cena por 1,5 período do próton em `B0`, ou em
1 T se não houver esse parâmetro: ajuste os valores para o evento caber nesse
tempo.

## 4. Passos e gabarito
- 3 a 5 `passos` com LaTeX, ligando `parametros`, `camera`, `destacar` e
  `mostrar`. `detalhe` guarda a conta completa.
- `previsao` (opcional) pergunta antes de mostrar. Use `oculta` para esconder
  o que entregaria a resposta.
- `resolucao` traz os conceitos (com `lab`), as etapas (com `passo`), o
  resultado, os erros comuns e o `oficial` depois da conferência.
- Objetivas: cada alternativa tem `porque`, ou seja, qual erro leva a ela.
  Discursivas: `respostas` com `pontos` e `criterio`.
- Divergência entre o gabarito oficial e a simulação: pare e pergunte antes
  de publicar. Enquanto isso, a resposta certa pela física é a marcada como
  `correta`, e `oficial.resposta` guarda a letra da prova, com a explicação em
  `observacao`. Se nenhuma alternativa estiver certa, marque a do oficial e diga
  isso no `porque` e em um passo próprio.
- Prova que só dá o total da discursiva: deixe os itens sem `pontos`.

## 5. Registro e testes
1. Salve como `src/content/provas/<id>.ts`, com a prova como única exportação:
   é assim que o site acha o arquivo e o baixa ao abrir a rota.
2. Registre em `src/content/provas/index.ts` e rode `npm run catalogo`, que
   regenera a lista usada pela página inicial (`src/content/catalogo.json`).
3. Acrescente a prova em `src/content/cobertura.ts`, com os labs de cada questão.
   Assunto sem lab é lacuna: crie ou amplie um lab, em vez de apontar para outro.
4. Rode `npm test`, que reprova se o catálogo estiver defasado ou se alguma questão
   não tiver lab.
5. Atualize o acervo com `python -I scripts/acervo.py`.

Relacionado: [[fisica3/docs/ARQUITETURA]], [[fisica3/docs/ACERVO]], [[fisica3/README]].

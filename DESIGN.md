---
type: documentation
status: active
agent: [claude]
date: 2026-10-29
tags: [fisica3, design, tokens]
lock: none
---

# Summary
Tokens visuais da bancada (OKLCH, tipografia, forma, movimento) e o contrato de UI do protocolo de excelência. A cor tem papel físico fixo: carga +, carga −, E, B, força.

# Design — Bancada de Física III

Conceito: **bancada noturna**. Cena 3D escura e profunda ocupando o centro;
painéis sóbrios e densos dos lados, alinhados a um grid de 4 px, como software
científico de qualidade. Tema escuro por uso real: linhas de campo e superfícies
coloridas precisam de fundo escuro para ter contraste.

## Cor (OKLCH)
Neutros levemente frios (matiz 255), nunca #000/#fff.

| token | valor | papel |
| --- | --- | --- |
| --bg | oklch(0.155 0.012 255) | fundo da aplicação e da cena |
| --surface | oklch(0.19 0.012 255) | painéis |
| --surface-2 | oklch(0.225 0.013 255) | campos, linhas de tabela em hover |
| --line | oklch(0.3 0.012 255) | divisórias |
| --text | oklch(0.94 0.006 255) | texto principal |
| --text-2 | oklch(0.76 0.01 255) | texto secundário |
| --text-3 | oklch(0.62 0.012 255) | rótulos, unidades |
| --accent | oklch(0.82 0.13 160) | foco, passo ativo, seleção, acerto |
| --pos | oklch(0.74 0.16 55) | carga positiva, fluxo saindo |
| --neg | oklch(0.7 0.13 245) | carga negativa, fluxo entrando |
| --field-e | oklch(0.88 0.11 90) | campo elétrico |
| --field-b | oklch(0.78 0.11 195) | campo magnético |
| --force | oklch(0.72 0.17 340) | forças |
| --velocity | oklch(0.85 0.08 130) | velocidades |
| --copper | oklch(0.7 0.11 55) | fios e bobinas |
| --danger | oklch(0.68 0.18 25) | erro |

Laranja/azul para ±: o par continua distinguível em deuteranopia e
protanopia. Potencial usa mapa divergente azul → neutro → laranja, coerente com
o sinal das cargas.

## Tipografia
- Inter Variable: interface. Escala 12 / 13 / 14 / 16 / 20 / 28 px.
- JetBrains Mono Variable com `tabular-nums`: todos os números e unidades, para
  que leituras ao vivo não "dancem".
- KaTeX no mesmo corpo do texto.

## Forma
Raio 6 px (controles) e 10 px (painéis flutuantes). Bordas de 1 px em --line,
sem sombras pesadas; elevação só nos overlays sobre a cena. Nada de texto em
gradiente, glassmorphism, borda lateral decorativa ou grade de cards idênticos.

## Movimento
Transições de 160–240 ms com ease-out exponencial; câmera entre passos em
~900 ms. `prefers-reduced-motion` corta transições de câmera e pausa animações
contínuas (elétrons, partículas) até o usuário dar play.

## Contrato de UI (protocolo de excelência)
```yaml
interface_goal: ver e resolver questões de Física III em 3D
audience: alunos de Física III da UFRJ
domain: app educacional / ferramenta científica
platforms: [web desktop, web mobile]
primary_workflows: [abrir questão, avançar passos, mexer parâmetros, comparar teoria × simulação, carregar PDF]
visual_reference_class: software científico de qualidade, instrumentação
design_system: tokens deste arquivo
accessibility_target: WCAG_2_2_AA
content_density: alta no painel, baixa na cena
interaction_model: orbit + arrastar objetos + sliders + passo a passo
states_required: [carregando, vazio, erro, webgl indisponível, pdf inválido, proxy offline, geração parcial]
responsive_viewports: [375, 768, 1440]
```

"""Gera docs/ACERVO.md: o que existe no acervo de provas (fontes/acervo/, fora do
Git) e o que já foi curado no site. Rodar de novo quando chegarem provas.

Uso: python -I scripts/acervo.py
"""
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ACERVO = ROOT / 'fontes' / 'acervo'
CURADAS = {p.stem for p in (ROOT / 'src' / 'content' / 'provas').glob('*-*-*.ts')}
# O PDF "Gabarito" destas traz a prova inteira, resolvida: o nome não diz isso, e elas
# apareciam como "falta enunciado". Conferido abrindo cada arquivo.
GABARITO_COM_PROVA = {('2023-1', 'PF', 'diurno'), ('2023-2', 'P3', 'noturno'), ('2024-1', 'P3', 'noturno')}


def chave(nome: str) -> tuple[str, str, str]:
    """(prova, turno, tipo) a partir do nome, tolerando a variedade de nomes do acervo.

    Gabaritos recentes vêm sem turno ("gabarito_discursiva_P1"); como as provas
    do acervo sem turno explícito são do diurno, o turno padrão é diurno.
    """
    n = nome.lower()
    tipo = 'gabarito' if 'gabarito' in n else 'enunciado'
    turno = 'noturno' if 'noturno' in n else 'diurno'
    if 'segunda chamada' in n or re.search(r'(?<![a-z])sc(?![a-z])', n):
        prova = 'SC'
    elif m := re.search(r'(?:prova\s*|gabarito_?p|(?<![a-z])p)(\d)', n):
        prova = f'P{m.group(1)}'
    elif 'final' in n:
        prova = 'PF'
    elif 'reposi' in n:
        prova = 'Rep'
    else:
        prova = nome
    for x in ('eqn', 'versão 1', 'versão 2'):
        if x in n:
            prova += f' {x}'
    return prova, turno, tipo


NOMES = {'SC': 'Segunda chamada', 'PF': 'Prova final', 'Rep': 'Reposição'}
linhas = []
total = completas = curadas = 0
for sem in sorted(ACERVO.iterdir(), key=lambda p: p.name.replace(' ', ''), reverse=True):
    if not sem.is_dir():
        continue
    provas: dict[tuple[str, str], set[str]] = defaultdict(set)
    for f in sorted(sem.iterdir()):
        if f.suffix.lower() == '.pdf':
            p, turno, tipo = chave(f.name)
            provas[(p, turno)].add(tipo)
    semestre = sem.name.replace(' ', '')
    ano, s = semestre.split('-')
    for (p, turno), tipos in sorted(provas.items()):
        if (semestre, p, turno) in GABARITO_COM_PROVA:
            tipos.add('enunciado')
        total += 1
        ok = {'enunciado', 'gabarito'} <= tipos
        completas += ok
        pid = f"{p.split()[0].lower()}-{ano}-{s}-{turno}"
        curada = pid in CURADAS
        curadas += curada
        status = 'curada' if curada else ('pronta para curar' if ok else ('falta gabarito' if 'enunciado' in tipos else 'falta enunciado'))
        nome = NOMES.get(p.split()[0], p.split()[0]) + (' ' + ' '.join(p.split()[1:]) if len(p.split()) > 1 else '')
        linhas.append(f'| {ano}.{s} | {nome} | {turno} | {"sim" if "enunciado" in tipos else "não"} | {"sim" if "gabarito" in tipos else "não"} | {status} |')

doc = f"""---
type: documentation
status: active
agent: [claude]
date: 2026-10-30
tags: [fisica3, acervo, curadoria]
lock: none
---

# Summary
Catálogo do acervo de provas de Física III recebido do David (2009 a 2026.2):
{total} provas, {completas} com enunciado e gabarito, {curadas} já curada(s) no site.
Os PDFs ficam em `fontes/acervo/`, fora do Git e do site. Gerado por
`scripts/acervo.py` a partir dos nomes dos arquivos (heurístico: confira o par
enunciado/gabarito antes de curar). Um PDF chamado "Gabarito" pode trazer a prova
inteira: "falta enunciado" aqui não prova que falta, só que ninguém abriu o arquivo.

# Acervo de provas

Ordem sugerida de curadoria: das mais recentes para as mais antigas, priorizando
as que têm enunciado e gabarito. Cada prova curada segue
[[fisica3/docs/FORMATO_CENARIO]] e só entra no site com `npm test` verde.

| Semestre | Prova | Turno | Enunciado | Gabarito | Situação |
| --- | --- | --- | --- | --- | --- |
""" + '\n'.join(linhas) + '\n'

(ROOT / 'docs' / 'ACERVO.md').write_text(doc, encoding='utf-8')
print(f'{total} provas, {completas} completas, {curadas} curada(s)')

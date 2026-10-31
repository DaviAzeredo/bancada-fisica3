"""Gera os recortes de figura de uma prova (WebP leve) a partir do PDF original.

Roda só na máquina de quem cura a prova; o site publicado nunca recebe o PDF.
Uso:
  node scripts/figuras.mjs src/content/provas/<prova>.ts \
    | python scripts/recortes.py fontes/provas/<prova>.pdf public/provas
"""
import io
import json
import sys
from pathlib import Path

import pymupdf
from PIL import Image

LARGURA = 960  # px: o painel mostra ~380 px, isto cobre telas 2x com folga

pdf_path, out_root = sys.argv[1], Path(sys.argv[2])
spec = json.load(sys.stdin)
doc = pymupdf.open(pdf_path)
out_dir = out_root / spec["prova"]
out_dir.mkdir(parents=True, exist_ok=True)



def cor_em_volta(page, r):
    """Cor mediana da borda da área: em fotos o papel não é branco, e a mediana ignora a tinta."""
    pix = page.get_pixmap(clip=r + (-3, -3, 3, 3), alpha=False)
    borda = [
        (x, y)
        for y in range(pix.height)
        for x in range(pix.width)
        if x < 3 or y < 3 or x >= pix.width - 3 or y >= pix.height - 3
    ]
    canais = zip(*(pix.pixel(x, y)[:3] for x, y in borda))
    return tuple(sorted(c)[len(c) // 2] / 255 for c in canais)


for fig in spec["figuras"]:
    page = doc[fig["pagina"] - 1]
    w, h = page.rect.width, page.rect.height
    # O scan pode ter a resposta marcada à mão: cobre a marca e reescreve a letra
    # limpa, para o recorte não entregar o gabarito antes da hora. As coordenadas
    # são as da página como aparece; em página com /Rotate, o desenho usa as de antes
    # da rotação, daí a derotation_matrix.
    d = page.derotation_matrix
    for m in fig.get("mascaras", []):
        r = pymupdf.Rect(m["area"][0] * w, m["area"][1] * h, m["area"][2] * w, m["area"][3] * h)
        page.draw_rect(r * d, color=None, fill=cor_em_volta(page, r), overlay=True)
        p = pymupdf.Point(r.x0 + 2.5, r.y1 - 0.36 * r.height) * d
        page.insert_text(p, m["letra"], fontname="tiro", fontsize=max(10.2, 0.55 * r.height), color=(0.1, 0.1, 0.1), rotate=page.rotation)
    x0, y0, x1, y1 = fig["recorte"]
    clip = pymupdf.Rect(x0 * w, y0 * h, x1 * w, y1 * h)
    zoom = LARGURA / clip.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("L")
    dest = out_dir / f"{fig['arquivo']}.webp"
    img.save(dest, "WEBP", quality=80, method=6)
    print(f"{dest}  {img.width}x{img.height}  {dest.stat().st_size // 1024} KB")

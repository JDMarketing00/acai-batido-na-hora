#!/usr/bin/env python3
"""Gera a logo do Açaí Batido na Hora em SVG (letras convertidas em contornos).

Uso: python3 ferramentas/gerar-logo.py
Precisa de: pip install fonttools uharfbuzz brotli
Lê as fontes de assets/fonts/ e grava:
  assets/img/logo.svg          logo para fundo escuro (açaí branco, "batido na hora" amarelo)
  assets/img/logo-roxa.svg     logo para fundo claro (açaí roxo, "batido na hora" roxo médio)
  assets/img/favicon.svg       ícone da aba do navegador
"""
import os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FONTES = os.path.join(RAIZ, 'assets', 'fonts')
IMG = os.path.join(RAIZ, 'assets', 'img')


def texto(fonte, s, tamanho, x0=0, y0=0, giro=0, espaco=0):
    """Devolve (path d, caixa) do texto s, com a linha de base em y0."""
    caminho = os.path.join(FONTES, fonte)
    ft = TTFont(caminho)
    upem = ft['head'].unitsPerEm
    import io
    bruto = io.BytesIO()
    ft.flavor = None            # HarfBuzz não lê WOFF2: descompacta em memória
    ft.save(bruto)
    ft = TTFont(io.BytesIO(bruto.getvalue()))
    blob = hb.Blob(bruto.getvalue())
    font = hb.Font(hb.Face(blob))
    buf = hb.Buffer()
    buf.add_str(s)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    gs = ft.getGlyphSet()
    ordem = ft.getGlyphOrder()
    esc = tamanho / upem
    import math
    c, sn = math.cos(math.radians(giro)), math.sin(math.radians(giro))
    pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
    caixa = BoundsPen(gs)
    x = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        nome = ordem[info.codepoint]
        gx = x + pos.x_offset
        gy = pos.y_offset
        # fonte (y para cima) -> SVG (y para baixo), com giro em volta de (x0, y0)
        m = (esc * c, esc * sn, esc * sn, -esc * c, 0, 0)
        tx = x0 + (gx * esc) * c - (gy * esc) * (-sn)
        ty = y0 + (gx * esc) * sn + (gy * esc) * -c
        m = (esc * c, esc * sn, esc * sn, -esc * c, tx, ty)
        gs[nome].draw(TransformPen(pen, m))
        gs[nome].draw(TransformPen(caixa, m))
        x += pos.x_advance + espaco * upem
    return pen.getCommands(), caixa.bounds


def logo(cor_acai, cor_batido, arquivo):
    d1, b1 = texto('shrikhand.woff2', 'açaí', 100, 0, 0, espaco=-0.01)
    d2, b2 = texto('caveat-brush.woff2', 'batido na hora', 44, 92, 47, giro=-6)
    xmin = min(b1[0], b2[0]) - 4
    ymin = min(b1[1], b2[1]) - 4
    xmax = max(b1[2], b2[2]) + 4
    ymax = max(b1[3], b2[3]) + 4
    w, h = xmax - xmin, ymax - ymin
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{xmin:.1f} {ymin:.1f} {w:.1f} {h:.1f}" '
           f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="Açaí Batido na Hora">'
           f'<path fill="{cor_acai}" d="{d1}"/><path fill="{cor_batido}" d="{d2}"/></svg>')
    open(os.path.join(IMG, arquivo), 'w', encoding='utf8').write(svg)
    print(arquivo, f'{w:.0f}x{h:.0f}', len(svg) // 1024, 'KB')


def favicon():
    d, b = texto('shrikhand.woff2', 'a', 52, 0, 0)
    gw, gh = b[2] - b[0], b[3] - b[1]
    dx, dy = 32 - (b[0] + gw / 2), 33 - (b[1] + gh / 2)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
           '<rect width="64" height="64" rx="15" fill="#2A0A37"/>'
           f'<g transform="translate({dx:.1f} {dy:.1f})"><path fill="#FFFFFF" d="{d}"/></g>'
           '<path d="M14 52c11-4 25-5 37-3" fill="none" stroke="#F0B341" stroke-width="4.5" stroke-linecap="round"/></svg>')
    open(os.path.join(IMG, 'favicon.svg'), 'w', encoding='utf8').write(svg)
    print('favicon.svg', len(svg), 'bytes')


if __name__ == '__main__':
    logo('#FFFFFF', '#F0B341', 'logo.svg')
    logo('#3B1049', '#8B3BA6', 'logo-roxa.svg')
    favicon()

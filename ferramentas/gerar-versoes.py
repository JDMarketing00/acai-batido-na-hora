#!/usr/bin/env python3
"""Gera as versões leves das fotos usadas no celular.

Rode depois de trocar ou incluir fotos em assets/img/fotos/:
    python3 ferramentas/gerar-versoes.py

Precisa do Pillow (pip install pillow). Para cada foto principal cria:
  produtos/NOME.webp   -> produtos/NOME-400.webp   (400 px)
  adicionais/NOME.webp -> adicionais/NOME-160.webp (160 px)
  promocoes/NOME.webp  -> promocoes/NOME-600.webp  (600 px de largura)
  sabores/copo-NOME.webp -> sabores/copo-NOME-480.webp (480 x 720, copos do slider)
Se uma versão leve faltar, o site usa a foto principal sozinho (não quebra),
mas o celular baixa um arquivo maior.
"""
import os
import sys
from PIL import Image, ImageFilter

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img', 'fotos')
REGRAS = {'produtos': ('-400', 400), 'adicionais': ('-160', 160), 'promocoes': ('-600', 600), 'sabores': ('-480', 480)}
SUFIXOS = ('-400', '-160', '-600', '-420', '-800', '-480')


def main():
    feitos = 0
    for pasta, (sufixo, largura) in REGRAS.items():
        dir_ = os.path.join(RAIZ, pasta)
        if not os.path.isdir(dir_):
            continue
        for nome in sorted(os.listdir(dir_)):
            base, ext = os.path.splitext(nome)
            if ext.lower() not in ('.webp', '.jpg', '.jpeg', '.png') or base.endswith(SUFIXOS):
                continue
            if pasta == 'sabores' and not base.startswith('copo-'):
                continue  # ingredientes do slider já são pequenos (300 px)
            im = Image.open(os.path.join(dir_, nome))
            im = im.convert('RGBA') if pasta == 'sabores' else im.convert('RGB')
            alt = round(im.size[1] * largura / im.size[0])
            menor = im.resize((largura, alt), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=.8, percent=30, threshold=2))
            destino = os.path.join(dir_, base + sufixo + '.webp')
            menor.save(destino, 'WEBP', quality=78, alpha_quality=88, method=6)
            feitos += 1
            print('ok', os.path.relpath(destino, RAIZ))
    print(f'{feitos} versões geradas')


if __name__ == '__main__':
    sys.exit(main())

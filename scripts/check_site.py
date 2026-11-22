#!/usr/bin/env python3
"""Dependency-free smoke checks. Run after fresh GitHub checkout."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parent.parent

class Checker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicate_ids = []
        self.local_links = []
        self.fragment_links = []
        self.script_sources = []
        self.images = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        ident = attributes.get('id')
        if ident:
            if ident in self.ids:
                self.duplicate_ids.append(ident)
            self.ids.add(ident)
        for name in ('href', 'src'):
            uri = attributes.get(name, '')
            if not uri or uri.startswith(('http:', 'https:', 'mailto:', 'tel:', 'data:', '//')):
                continue
            parts = urlsplit(uri)
            if parts.path:
                self.local_links.append(unquote(parts.path))
            if parts.fragment and not parts.path:
                self.fragment_links.append(parts.fragment)
        if tag == 'img':
            self.images += 1
            if 'alt' not in attributes:
                raise AssertionError('Image missing alt attribute')
        if tag == 'script' and attributes.get('src'):
            self.script_sources.append(attributes['src'])


def check():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    parser = Checker()
    parser.feed(html)
    errors = []
    if parser.duplicate_ids:
        errors.append('Duplicate IDs: ' + ', '.join(parser.duplicate_ids))
    for frag in parser.fragment_links:
        if frag not in parser.ids:
            errors.append('Broken anchor: #' + frag)
    for path in parser.local_links:
        # Only files relative to site root. No external bundles or build step.
        file = ROOT / path.lstrip('/')
        if not file.is_file():
            errors.append('Missing file: ' + path)
    for text in ('Minecraft 1.20.1', 'STALBLOCK', 'СКАЧАТЬ ЛАУНЧЕР'):
        if text not in html:
            errors.append('Missing required content: ' + text)
    if not (ROOT / '.nojekyll').exists():
        errors.append('Missing .nojekyll')
    if not (ROOT / 'assets/zone-voxel.svg').exists():
        errors.append('Missing main zone artwork')
    if errors:
        print('SITE CHECK FAILED')
        for err in errors:
            print(' -', err)
        return 1
    print('SITE CHECK PASSED')
    print(f'Validated {len(parser.ids)} IDs, {len(parser.local_links)} local assets and {len(parser.fragment_links)} anchors.')
    return 0

if __name__ == '__main__':
    sys.exit(check())

#!/usr/bin/env python3
"""Audit a built site: python3 scripts/check-seo.py (standard library only)."""
import json
import re
import struct
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent / '_site'
ORIGIN = 'https://grib.site'
errors = []

def require(ok, message):
    if not ok:
        errors.append(message)

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.links = []
        self.title = ''
        self.in_title = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            key = attrs.get('property') or attrs.get('name')
            self.meta.setdefault(key, []).append(attrs.get('content', ''))
        if tag == 'link':
            self.links.append(attrs)
        if tag == 'title':
            self.in_title = True
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
    def handle_data(self, data):
        if self.in_title:
            self.title += data
    def get(self, key):
        return self.meta.get(key, [''])[0]

def dimensions(file):
    data = file.read_bytes()
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return struct.unpack('>II', data[16:24])
    if data.startswith(b'\xff\xd8'):
        pos = 2
        while pos < len(data):
            if data[pos] != 255:
                pos += 1
                continue
            while data[pos] == 255:
                pos += 1
            marker = data[pos]
            pos += 1
            if marker in (0xD8, 0xD9):
                continue
            length = int.from_bytes(data[pos:pos+2], 'big')
            if marker in (0xC0, 0xC1, 0xC2):
                height, width = struct.unpack('>HH', data[pos+3:pos+7])
                return width, height
            pos += length
    return None

sitemap = ET.parse(ROOT / 'sitemap.xml')
locations = [el.text for el in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
require(len(locations) == len(set(locations)), 'Duplicate URLs in sitemap')
indexed = set()
for file in sorted(ROOT.rglob('*.html')):
    html = file.read_text()
    page = Page()
    page.feed(html)
    label = str(file.relative_to(ROOT))
    canonical = [x['href'] for x in page.links if x.get('rel') == 'canonical']
    require(len(canonical) == 1, f'{label}: canonical must appear once')
    require(bool(page.title.strip()), f'{label}: empty title')
    require(page.title.count('Мир грибов') <= 1, f'{label}: repeated brand in title')
    for key in ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:image', 'twitter:image:alt']:
        require(len(page.meta.get(key, [])) == 1 and bool(page.get(key)), f'{label}: missing/duplicate {key}')
    if canonical:
        url = canonical[0]
        require(url.startswith(ORIGIN + '/') and '?' not in url and '#' not in url, f'{label}: invalid canonical')
        require(page.get('og:url') == url, f'{label}: Open Graph URL differs from canonical')
        if 'noindex' not in page.get('robots'):
            indexed.add(url)
        else:
            require(url not in locations, f'{label}: noindex URL is in sitemap')
    image_url = page.get('og:image')
    require(image_url == page.get('twitter:image'), f'{label}: share images disagree')
    require(image_url.startswith('https://'), f'{label}: share image must use HTTPS')
    if image_url.startswith(ORIGIN + '/'):
        image = ROOT / urlsplit(image_url).path.lstrip('/')
        require(image.is_file(), f'{label}: missing share image {image_url}')
        if image.is_file():
            actual = dimensions(image)
            if actual:
                declared = (page.get('og:image:width'), page.get('og:image:height'))
                require(tuple(map(str, actual)) == declared, f'{label}: incorrect share image dimensions {declared}, actual {actual}')
    for block in re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>([\s\S]*?)</script>', html):
        try:
            json.loads(block)
        except json.JSONDecodeError as exc:
            errors.append(f'{label}: invalid structured data: {exc}')
for url in indexed - set(locations):
    errors.append(f'Indexable page missing from sitemap: {url}')
for url in set(locations) - indexed:
    errors.append(f'Sitemap URL has no indexable HTML page: {url}')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print(f'SEO OK: {len(list(ROOT.rglob("*.html")))} HTML pages; {len(locations)} sitemap URLs; share metadata, local image dimensions and JSON-LD verified.')

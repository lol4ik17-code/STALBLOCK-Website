#!/usr/bin/env python3
"""Structural integrity check for PDA prototype, runnable after GitHub checkout."""
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
class PdaParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.tabs=[]; self.panels=[]; self.markers=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if a.get('role')=='tab':self.tabs.append(a)
        if a.get('role')=='tabpanel':self.panels.append(a)
        if 'data-marker' in a:self.markers.append(a['data-marker'])
p=PdaParser();p.feed((ROOT/'index.html').read_text('utf-8'))
assert len(p.tabs)==4 and len(p.panels)==4,(p.tabs,p.panels)
assert all(t['aria-controls'] in p.ids for t in p.tabs)
assert all(pa['aria-labelledby'] in p.ids for pa in p.panels)
assert set(p.markers)=={'base','anomaly','signal'}
assert (ROOT/'script.js').is_file() and (ROOT/'styles.css').is_file()
print('PDA STRUCTURE CHECK PASSED: 4 tabs, 4 panels, 3 markers, ARIA references')

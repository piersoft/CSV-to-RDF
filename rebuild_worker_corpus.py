#!/usr/bin/env python3
"""
rebuild_worker_corpus.py
========================
Rigenera l'indice corpus da fixtures_v9.json e lo re-inietta in worker.js.

Uso:
    python rebuild_worker_corpus.py

Da eseguire ogni volta che si aggiorna fixtures_v9.json.
Il worker.js aggiornato va poi pushato insieme a fixtures_v9.json e index.html.
"""

import json
import re
import os
import sys

FIXTURES  = 'fixtures_v9.json'
WORKER    = 'worker.js'
MARKER_RE = re.compile(r'const _workerState = \{ _corpusIndex: (\{.*?\}|null) \};', re.DOTALL)

def build_index(corpus):
    """Stessa logica di buildCorpusIndex() in index.html."""
    idx = {}
    for item in corpus:
        ontos   = item.get('tema_onto') or []
        headers = item.get('headers')   or []
        for h in headers:
            if not h:
                continue
            n = re.sub(r'[^\w]', '', h.lower().strip()
                       .replace(' ', '_').replace('-', '_'))
            if not n:
                continue
            if n not in idx:
                idx[n] = {}
            for o in ontos:
                idx[n][o] = idx[n].get(o, 0) + 1
    return idx

def main():
    # 1. Carica fixtures
    if not os.path.exists(FIXTURES):
        print(f'ERRORE: {FIXTURES} non trovato. Esegui dallo stesso dir.')
        sys.exit(1)

    with open(FIXTURES, encoding='utf-8') as f:
        data = json.load(f)

    corpus = data.get('corpus') or data
    print(f'Fixture caricate: {len(corpus)}')

    # Conteggio per ontologia
    from collections import Counter
    cnt = Counter()
    for item in corpus:
        for o in (item.get('tema_onto') or []):
            cnt[o] += 1
    print('Top ontologie nel corpus:')
    for onto, n in cnt.most_common(10):
        print(f'  {onto:25s} {n}')

    # 2. Costruisce indice
    idx = build_index(corpus)
    idx_json = json.dumps(idx, separators=(',', ':'), ensure_ascii=False)
    print(f'\nIndice: {len(idx)} colonne, {len(idx_json)//1024} KB')

    # 3. Legge worker.js
    if not os.path.exists(WORKER):
        print(f'ERRORE: {WORKER} non trovato.')
        sys.exit(1)

    with open(WORKER, encoding='utf-8') as f:
        content = f.read()

    # 4. Sostituisce la costante _workerState
    new_line = f'const _workerState = {{ _corpusIndex: {idx_json} }};'
    match = MARKER_RE.search(content)
    if not match:
        print('ERRORE: riga _workerState non trovata in worker.js.')
        sys.exit(1)

    content = content[:match.start()] + new_line + content[match.end():]

    with open(WORKER, 'w', encoding='utf-8') as f:
        f.write(content)

    size_kb = os.path.getsize(WORKER) // 1024
    print(f'worker.js aggiornato: {size_kb} KB (limite Cloudflare free: 1024 KB)')

    # 5. Verifica sintassi con node se disponibile
    ret = os.system('node --check ' + WORKER + ' 2>/dev/null')
    if ret == 0:
        print('Sintassi JS: OK')
    else:
        print('ATTENZIONE: node --check fallito (node non installato o errore sintassi).')

    print('\nFatto. Prossimi passi:')
    print('  1. Bumpa la versione in index.html (build: + #app-version)')
    print('  2. git add fixtures_v9.json worker.js index.html')
    print('  3. git commit -m "corpus: <descrizione fixture aggiunte>"')
    print('  4. git push')

if __name__ == '__main__':
    main()

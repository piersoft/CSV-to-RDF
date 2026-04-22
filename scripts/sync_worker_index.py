#!/usr/bin/env python3
"""
sync_worker_index.py
Estrae le funzioni condivise da worker.js e le inietta in index.html.
Fonte di verità: worker.js
Funzioni sincronizzate: detectOntologiesDeterministic, computeSemanticScore,
                        scoreOntologie, scoreLinkedData, generateSuggestions, normH
"""
import sys, re

FUNCTIONS = [
    'normH',
    'detectOntologiesDeterministic',
    'computeSemanticScore',
    'scoreOntologie',
    'scoreLinkedData',
    'generateSuggestions',
]

def extract_fn(code, name):
    """Estrae il corpo completo di una funzione JS."""
    pos = code.find(f'function {name}(')
    if pos < 0:
        return None, -1, -1
    depth = 0
    end = pos
    for i, ch in enumerate(code[pos:], pos):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    return code[pos:end], pos, end

def sync(worker_path, index_path, output_path):
    worker = open(worker_path, encoding='utf-8').read()
    index  = open(index_path,  encoding='utf-8').read()

    changed = []
    for fn in FUNCTIONS:
        fn_wk, _, _ = extract_fn(worker, fn)
        fn_idx, pos_idx, end_idx = extract_fn(index, fn)
        if fn_wk is None:
            print(f'  SKIP  {fn}: non trovata nel worker')
            continue
        if fn_idx is None:
            print(f'  SKIP  {fn}: non trovata in index.html')
            continue
        if fn_wk == fn_idx:
            print(f'  OK    {fn}: già identica')
            continue
        # Sostituisce in index.html con la versione del worker
        index = index[:pos_idx] + fn_wk + index[end_idx:]
        changed.append(fn)
        print(f'  SYNC  {fn}: aggiornata ({len(fn_idx)} → {len(fn_wk)} chars)')

    open(output_path, 'w', encoding='utf-8').write(index)
    return changed

if __name__ == '__main__':
    worker_path = sys.argv[1] if len(sys.argv) > 1 else 'worker.js'
    index_path  = sys.argv[2] if len(sys.argv) > 2 else 'index.html'
    output_path = sys.argv[3] if len(sys.argv) > 3 else index_path
    print(f'Sincronizzazione {worker_path} → {index_path}')
    changed = sync(worker_path, index_path, output_path)
    if changed:
        print(f'Modificate: {changed}')
        sys.exit(0)
    else:
        print('Nessuna modifica necessaria')
        sys.exit(0)

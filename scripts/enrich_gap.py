#!/usr/bin/env python3
"""
enrich_gap.py  —  v1.0
=======================
Arricchisce le entry del gap analysis che hanno col_names vuote o errori
di download scaricando solo i primi N byte del CSV (stream parziale).

Strategia per ogni errore:
  url_error      → riprova con User-Agent diverso + follow redirect
  file_too_large → scarica solo i primi MAX_HEAD_BYTES (16KB)
  http_403       → skip (Milano/portali chiusi — non recuperabili)
  http_4xx       → skip (link morti)
  parse_error    → riprova con encoding detection migliore + separatori alternativi

Output:
  corpus/gap_enriched_YYYYMMDD.jsonl  — entry aggiornate (solo quelle migliorate)
  corpus/gap_full_YYYYMMDD.jsonl      — gap_analysis + enrichment merged

Aggiunge al gap entry:
  pkg_title       — già presente
  pkg_description — testo descrizione dataset (per audit step 3)
  col_names       — header estratti
  col_types       — tipi colonne
  onto_scores     — scores rilevate
  onto_detected   — lista ontologie
  enrich_status   — "ok" | "skip" | "partial" | "failed"
  enrich_note     — motivo skip/fail
"""

import csv, io, json, logging, re, sys, time, urllib.parse, urllib.request, urllib.error
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    import chardet
    import pandas as pd
except ImportError:
    print("pip install chardet pandas"); sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
MAX_HEAD_BYTES   = 16_384          # 16KB — sufficiente per header + 10 righe nella maggior parte dei casi
STREAM_TIMEOUT   = 8               # secondi per la connessione
MAX_ROWS_PARSE   = 10              # righe da analizzare (bastano per detect)
REQUEST_DELAY    = 0.3             # cortesia verso i server PA
CKAN_BASE        = "https://www.dati.gov.it/opendata"

# User-Agent realistico per aggirare alcuni 403 naif
UA = "Mozilla/5.0 (compatible; CSV-to-RDF-enricher/1.0; +https://github.com/piersoft/CSV-to-RDF)"

# Errori che NON vale la pena riprovare
SKIP_ERRORS = {"http_401", "http_403", "http_404", "http_410"}

OUTPUT_DIR = Path("corpus")
OUTPUT_DIR.mkdir(exist_ok=True)
TODAY = datetime.now(timezone.utc).strftime("%Y%m%d")

# Trova il gap file più recente
gap_files = sorted(OUTPUT_DIR.glob("gap_analysis_*.jsonl"), reverse=True)
if not gap_files:
    print("Nessun gap_analysis_*.jsonl trovato in corpus/"); sys.exit(1)
GAP_PATH      = gap_files[0]
ENRICH_PATH   = OUTPUT_DIR / f"gap_enriched_{TODAY}.jsonl"
FULL_PATH     = OUTPUT_DIR / f"gap_full_{TODAY}.jsonl"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)

# ── Keyword ontologie (identiche all'analyze_corpus_gaps per consistenza) ───
ONTO_KEYWORDS = {
    "POI":             ["lat","lon","latitude","longitude","coord","gps","x_wgs","y_wgs","georef","geom","location","coorx","coory"],
    "CLV":             ["via","indirizzo","civico","cap","comune","provincia","citta","address","street","postal","ubicazione","localita"],
    "QB":              ["valore","value","totale","importo","quantita","numero","count","misura","indicatore","anno","percentuale","media"],
    "TI":              ["data","date","inizio","fine","start","end","scadenza","pubblicazione","timestamp","reftime","periodo"],
    "PublicContract":  ["gara","appalto","cig","codice_cig","cup","procedura","aggiudicaz","bando","lotto","fornitore","contratto"],
    "GTFS":            ["route","trip","stop","shape","agency","gtfs","orario","corsa","fermata","linea","stop_id","route_id"],
    "IoT":             ["sensore","sensor","temperatura","umidita","pressione","pm10","pm2","co2","inquinante","agente_atm","stazione","rilevamento"],
    "ACCO":            ["hotel","struttura_ricettiva","camere","posti_letto","albergo","stelle","affittacamere","agriturismo"],
    "Cultural-ON":     ["museo","bene_culturale","monumento","patrimonio","biblioteca","archivio","masseria","palazzo","castello","chiesa","sito"],
    "SMAPIT":          ["scuola","istituto","plesso","classe","alunni","studenti","docenti","istruzione","codice_meccanografico"],
    "PublicOrg":       ["ente","amministrazione","ipa","codice_ipa","organizzazione","cf_ente","partita_iva"],
    "COV":             ["dipendenti","personale","organico","ruolo","incarico","dirigente","azienda","impresa","ragione_sociale","codice_ateco"],
    "CPV":             ["popolazione","residenti","abitanti","nati","morti","stranieri","anagrafe","cognome","nome","codice_fiscale"],
    "PARK":            ["parcheggio","stalli","posti_auto","tariffa","sosta","garage","stalli_totali","stalli_disabili"],
    "CPEV":            ["evento","manifestazione","spettacolo","festival","teatro","cinema","titolo_evento","luogo_evento"],
    "RO":              ["elezione","candidato","eletto","voti","partito","seggio","preferenze","lista_elettorale"],
}

# Keyword nel titolo/descrizione per orientare il contesto (audit step 3)
TITLE_ONTO_HINTS = {
    "masserie|agriturismo|fattoria":     "Cultural-ON",
    "parcheggi|parcheggio":              "PARK",
    "scuole?|istitut|plesso":            "SMAPIT",
    "qualit.*aria|inquinamento|pm10|pm2":"IoT",
    "trasport|fermata|linea|gtfs|bus":   "GTFS",
    "appalti?|contratt|gara|cig|cup":    "PublicContract",
    "strutture? ricettive?|albergh|hotel|turism":"ACCO",
    "museo|bene cultural|monument|patrimoni":"Cultural-ON",
    "personale|dipendenti|organico":     "COV",
    "bilancio|spesa|entrate?|uscite?|peg":"QB",
    "elezioni?|candidati?|voti?":        "RO",
    "anagrafe|popolazione|residenti?|nati|morti":"CPV",
    "eventi?|manifest|spettacol|festival":"CPEV",
    "sensori?|centralin|stazion.*monit|qualit.*acqua":"IoT",
    "farmac|presidio|ospedal|sanit":     "SMAPIT",
}

# ── Helpers CSV ──────────────────────────────────────────────────────────────
def detect_encoding(raw: bytes) -> str:
    if raw[:3] == b'\xef\xbb\xbf':
        return "utf-8-sig"
    r = chardet.detect(raw[:8000])
    return r.get("encoding") or "utf-8"

def detect_sep(text: str) -> str:
    try:
        d = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|")
        return d.delimiter
    except Exception:
        counts = {d: text[:2000].count(d) for d in [",", ";", "\t", "|"]}
        return max(counts, key=counts.get)

def find_header_row(lines: list, sep: str) -> int:
    best, best_n = 0, 0
    for i, line in enumerate(lines[:12]):
        n = sum(1 for c in line.split(sep) if c.strip())
        if n > best_n:
            best_n, best = n, i
    return best

def parse_head(raw: bytes) -> dict:
    """Estrae header e fino a MAX_ROWS_PARSE righe da raw bytes parziali."""
    enc = detect_encoding(raw)
    try:
        text = raw.decode(enc, errors="replace")
    except Exception:
        text = raw.decode("latin-1", errors="replace")

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")

    sep = detect_sep(text)
    hrow = find_header_row(lines, sep)

    # Tronca all'ultima riga completa per evitare parse di riga spezzata
    if len(lines) > hrow + 1:
        lines = lines[:hrow + MAX_ROWS_PARSE + 2]
    partial = "\n".join(lines)

    try:
        df = pd.read_csv(
            io.StringIO(partial), sep=sep, header=hrow,
            nrows=MAX_ROWS_PARSE, dtype=str,
            on_bad_lines="skip", engine="python"
        )
    except Exception as e:
        return {"error": f"parse_error:{str(e)[:60]}"}

    col_names = [str(c) for c in df.columns]
    col_types  = {}
    onto_scores: dict[str, int] = defaultdict(int)

    re_num   = re.compile(r"^-?\d+([.,]\d+)?$")
    re_diso  = re.compile(r"^\d{4}-\d{2}-\d{2}")
    re_dit   = re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")

    for col in df.columns:
        cl = str(col).lower().strip()
        cl_norm = re.sub(r"[^\w]", "_", cl)

        for onto, kws in ONTO_KEYWORDS.items():
            if any(kw in cl_norm for kw in kws):
                onto_scores[onto] += 2

        vals = df[col].dropna().astype(str).head(MAX_ROWS_PARSE).tolist()
        n = len(vals)
        if n == 0:
            col_types[col] = "empty"
            continue

        n_num  = sum(1 for v in vals if re_num.match(v.replace(" ", "")))
        n_diso = sum(1 for v in vals if re_diso.match(v))
        n_dit  = sum(1 for v in vals if re_dit.match(v))

        if n_num / n > 0.8:
            col_types[col] = "numeric"
            onto_scores["QB"] += 1
        elif (n_diso + n_dit) / n > 0.6:
            col_types[col] = "date"
            onto_scores["TI"] += 1
        else:
            col_types[col] = "string"

    return {
        "encoding":      enc,
        "separator":     sep,
        "header_row":    hrow,
        "n_cols":        len(col_names),
        "col_names":     col_names,
        "col_types":     col_types,
        "onto_scores":   dict(onto_scores),
        "onto_detected": [k for k, v in sorted(onto_scores.items(), key=lambda x: -x[1]) if v >= 2][:6],
        "error":         None,
    }

# ── Hint da titolo ───────────────────────────────────────────────────────────
def hint_from_title(title: str, description: str = "") -> str | None:
    text = (title + " " + (description or "")).lower()
    for pattern, onto in TITLE_ONTO_HINTS.items():
        if re.search(pattern, text):
            return onto
    return None

# ── Fetch CKAN metadata (description) ───────────────────────────────────────
def fetch_pkg_description(pkg_title: str, ipa_code: str) -> str:
    """Recupera la descrizione del dataset da CKAN — utile per l'audit step 3."""
    try:
        q = urllib.parse.quote(pkg_title[:60])
        fq = f'extras_holder_identifier:"{ipa_code}"' if ipa_code else ""
        params = urllib.parse.urlencode({"q": q, "fq": fq, "rows": "1"})
        url = f"{CKAN_BASE}/api/3/action/package_search?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.load(r)
        results = data.get("result", {}).get("results", [])
        if results:
            return results[0].get("notes", "")[:500]
    except Exception:
        pass
    return ""

# ── Download stream parziale ─────────────────────────────────────────────────
def fetch_head(url: str) -> tuple[bytes | None, str]:
    """Scarica solo i primi MAX_HEAD_BYTES del CSV."""
    headers_req = {
        "User-Agent":  UA,
        "Accept":      "text/csv,text/plain,*/*",
        "Range":       f"bytes=0-{MAX_HEAD_BYTES - 1}",   # HTTP Range request
    }
    req = urllib.request.Request(url, headers=headers_req)
    try:
        with urllib.request.urlopen(req, timeout=STREAM_TIMEOUT) as r:
            raw = r.read(MAX_HEAD_BYTES)
            return raw, ""
    except urllib.error.HTTPError as e:
        # Range non supportato (206 ok, 200 ok, altri → errore)
        if e.code in (200, 206):
            return e.read(MAX_HEAD_BYTES), ""
        return None, f"http_{e.code}"
    except urllib.error.URLError:
        return None, "url_error"
    except Exception as e:
        return None, f"error_{str(e)[:40]}"

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    log.info("enrich_gap.py v1.0 — gap file: %s", GAP_PATH.name)

    # Carica gap
    all_gaps: list[dict] = []
    with open(GAP_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                all_gaps.append(json.loads(line))

    log.info("Gap totali: %d", len(all_gaps))

    # Seleziona solo quelli da arricchire:
    # 1. col_names vuote o assenti
    # 2. errore non in SKIP_ERRORS
    # 3. URL presente
    to_enrich = [
        g for g in all_gaps
        if not g.get("col_names")
        and g.get("error") not in SKIP_ERRORS
        and g.get("url")
    ]
    log.info("Da arricchire: %d (skip_error: %d, già con colonne: %d)",
             len(to_enrich),
             sum(1 for g in all_gaps if g.get("error") in SKIP_ERRORS),
             sum(1 for g in all_gaps if g.get("col_names")))

    # Index per merge finale
    by_url = {g["url"]: g for g in all_gaps}

    enriched_count  = 0
    failed_count    = 0
    skip_count      = 0

    with open(ENRICH_PATH, "w", encoding="utf-8") as fout:
        for i, gap in enumerate(to_enrich, 1):
            url   = gap["url"]
            err   = gap.get("error", "")
            title = gap.get("pkg_title", "")
            ipa   = gap.get("ipa_code", "")

            if i % 50 == 0:
                log.info("[%d/%d] OK=%d FAIL=%d SKIP=%d", i, len(to_enrich),
                         enriched_count, failed_count, skip_count)

            time.sleep(REQUEST_DELAY)

            # Download parziale
            raw, fetch_err = fetch_head(url)

            if fetch_err:
                gap["enrich_status"] = "failed"
                gap["enrich_note"]   = fetch_err
                failed_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue

            if not raw or len(raw) < 20:
                gap["enrich_status"] = "failed"
                gap["enrich_note"]   = "empty_response"
                failed_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue

            # Controlla se è HTML (redirect a pagina portale)
            raw_start = raw[:512].lower()
            if b"<!doctype" in raw_start or b"<html" in raw_start:
                gap["enrich_status"] = "skip"
                gap["enrich_note"]   = "html_response"
                skip_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue

            # Controlla se è PDF/ZIP/XLS
            magic = raw[:8]
            if magic[:4] == b'%PDF':
                gap["enrich_status"] = "skip"
                gap["enrich_note"]   = "pdf_file"
                skip_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue
            if magic[:2] in (b'PK', b'\xd0\xcf'):
                gap["enrich_status"] = "skip"
                gap["enrich_note"]   = "binary_file"
                skip_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue

            # Parsing
            parsed = parse_head(raw)

            if parsed.get("error"):
                gap["enrich_status"] = "failed"
                gap["enrich_note"]   = parsed["error"]
                failed_count += 1
                fout.write(json.dumps(gap, ensure_ascii=False) + "\n")
                continue

            # Colonne trovate — arricchisci l'entry
            gap.update({
                "size_kb":      round(len(raw) / 1024, 1),
                "encoding":     parsed["encoding"],
                "separator":    parsed["separator"],
                "header_row":   parsed["header_row"],
                "n_cols":       parsed["n_cols"],
                "col_names":    parsed["col_names"],
                "col_types":    parsed["col_types"],
                "onto_scores":  parsed["onto_scores"],
                "onto_detected":parsed["onto_detected"],
                "error":        None,
                "enrich_status":"ok",
                "enrich_note":  f"partial_{len(raw)}B",
            })

            # Hint da titolo (per audit step 3)
            title_hint = hint_from_title(title)
            if title_hint:
                gap["title_onto_hint"] = title_hint

            # Descrizione CKAN (campionata, non su tutti per evitare rate limit)
            # Solo se il titolo_hint non è chiaro (ambiguo)
            if i % 10 == 0:  # 1 richiesta CKAN ogni 10 CSV
                desc = fetch_pkg_description(title, ipa)
                if desc:
                    gap["pkg_description"] = desc
                    # Arricchisci hint con descrizione
                    if not title_hint:
                        hint2 = hint_from_title(title, desc)
                        if hint2:
                            gap["title_onto_hint"] = hint2

            enriched_count += 1
            by_url[url] = gap  # aggiorna index per merge
            fout.write(json.dumps(gap, ensure_ascii=False) + "\n")

    log.info("=== Enrichment completato ===")
    log.info("  Arricchiti OK: %d", enriched_count)
    log.info("  Failed:        %d", failed_count)
    log.info("  Skip (non CSV):%d", skip_count)

    # Merge: scrive gap_full con tutti i gap (originali + arricchiti)
    log.info("Scrivo gap_full_%s.jsonl (%d entry)...", TODAY, len(by_url))
    with open(FULL_PATH, "w", encoding="utf-8") as fout:
        for entry in by_url.values():
            fout.write(json.dumps(entry, ensure_ascii=False) + "\n")

    log.info("Output: %s (%d entry nuove)", ENRICH_PATH.name, enriched_count)
    log.info("Output: %s (%d entry totali)", FULL_PATH.name, len(by_url))

if __name__ == "__main__":
    main()

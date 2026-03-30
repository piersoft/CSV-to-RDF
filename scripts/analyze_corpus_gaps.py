#!/usr/bin/env python3
"""
analyze_corpus_gaps.py  —  v3
==============================
Campionamento 2000 CSV da dati.gov.it via CKAN API package_search.
- Tier PA: holder_identifier (extras) con prefisso c_/r_/m_/resto
- Tema DCAT: extras.theme (array JSON, es. ["HEAL"])
- Zero SPARQL, zero AI, funziona da GitHub Actions runner.

Output: corpus/gap_analysis_YYYYMMDD.jsonl + corpus/gap_summary_YYYYMMDD.json
"""

import csv, io, json, logging, re, sys, time
import urllib.parse, urllib.request, urllib.error
from collections import defaultdict
from datetime import datetime
from pathlib import Path

try:
    import chardet
    import pandas as pd
except ImportError:
    print("pip install chardet pandas"); sys.exit(1)

CKAN_BASE        = "https://www.dati.gov.it/opendata"
TOTAL_TARGET     = 2000
MAX_FILE_BYTES   = 2_000_000
DOWNLOAD_TIMEOUT = 20
MAX_ROWS_ANALYZE = 200
REQUEST_DELAY    = 0.4   # cortesia verso il server

OUTPUT_DIR = Path("corpus")
OUTPUT_DIR.mkdir(exist_ok=True)
TODAY        = datetime.utcnow().strftime("%Y%m%d")
JSONL_PATH   = OUTPUT_DIR / f"gap_analysis_{TODAY}.jsonl"
SUMMARY_PATH = OUTPUT_DIR / f"gap_summary_{TODAY}.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tier PA da prefisso holder_identifier (codice IPA)
# ---------------------------------------------------------------------------
def classify_tier(ipa: str) -> str:
    c = (ipa or "").lower()
    if c.startswith("c_"): return "Comuni"
    if c.startswith("r_"): return "Regioni"
    if c.startswith("m_"): return "Ministeri"
    return "Agenzie"

TIER_QUOTA = {"Comuni": 500, "Regioni": 500, "Ministeri": 500, "Agenzie": 500}

# Temi DCAT-AP EU
DCAT_THEMES = ["AGRI","ECON","EDUC","ENER","ENVI","GOVE","HEAL",
               "INTR","JUST","REGI","SOCI","TECH","TRAN","OP_DATPRO"]

# ---------------------------------------------------------------------------
# Keyword per ontologie potenziali (su nomi colonna + valori)
# ---------------------------------------------------------------------------
ONTO_KEYWORDS = {
    "POI":        ["lat","lon","latitude","longitude","coord","gps","x_wgs","y_wgs","georef","geom","location"],
    "CLV":        ["via","indirizzo","civico","cap","comune","provincia","citta","address","street","postal"],
    "QB":         ["valore","value","totale","importo","quantita","numero","count","misura","indicatore","anno"],
    "TI":         ["data","date","inizio","fine","start","end","scadenza","pubblicazione","timestamp"],
    "CPSV":       ["gara","appalto","cig","cup","procedura","aggiudicaz","bando","lotto","fornitore","contratto"],
    "GTFS":       ["route","trip","stop","shape","agency","gtfs","orario","corsa","fermata","linea"],
    "IoT-AP_IT":  ["sensore","sensor","temperatura","umidita","pressione","pm10","pm2","co2","inquinante"],
    "ACCO":       ["hotel","struttura","turismo","ospitalita","camere","posti_letto","albergo","stelle"],
    "MUAPIT":     ["museo","bene","culturale","monumento","patrimonio","opera","collezione","biblioteca"],
    "SMAPIT":     ["scuola","istituto","plesso","classe","alunni","studenti","docenti","istruzione"],
    "PublicOrg":  ["ente","amministrazione","ipa","codice_ipa","organizzazione"],
    "CPV":        ["popolazione","residenti","abitanti","nati","morti","stranieri","anagrafe","demograf"],
    "Cultural-ON":["teatro","cinema","festival","evento","spettacolo","esposizione","archivio"],
    "COV-AP_IT":  ["dipendenti","personale","organico","ruolo","incarico","dirigente","azienda","impresa"],
}

# ---------------------------------------------------------------------------
# CKAN helpers
# ---------------------------------------------------------------------------
def ckan_package_search(fq: str, rows: int = 100, start: int = 0) -> dict:
    params = urllib.parse.urlencode({
        "fq": fq, "rows": rows, "start": start,
        "include_private": "false",
    })
    url = f"{CKAN_BASE}/api/3/action/package_search?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "CSV-to-RDF-corpus-analyzer/3.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def extract_extras(pkg: dict) -> dict:
    """Estrae extras come dizionario chiave->valore."""
    return {e["key"]: e["value"] for e in pkg.get("extras", [])}

def get_theme(extras: dict) -> str:
    """Estrae il primo tema DCAT dall'extras.theme (array JSON)."""
    raw = extras.get("theme", "[]")
    try:
        themes = json.loads(raw) if isinstance(raw, str) else raw
        if themes:
            return themes[0]
    except Exception:
        pass
    # fallback: themes_aggregate
    raw2 = extras.get("themes_aggregate", "[]")
    try:
        agg = json.loads(raw2) if isinstance(raw2, str) else raw2
        if agg:
            return agg[0].get("theme", "")
    except Exception:
        pass
    return ""

# ---------------------------------------------------------------------------
# Campionamento stratificato
# ---------------------------------------------------------------------------
def collect_sample() -> list[dict]:
    """
    Strategia: per ogni tema DCAT, pagina package_search con fq=res_format:CSV
    filtrando per tema tramite extras. Classifica tier da holder_identifier.
    """
    log.info("=== Fase 1: campionamento CKAN API ===")

    cell_quota   = max(1, TOTAL_TARGET // (len(DCAT_THEMES) * 4))  # ~36 per cella
    all_urls:    set[str] = set()
    tier_buckets: dict[str, list] = defaultdict(list)

    for theme_code in DCAT_THEMES:
        log.info("  Tema %s (cell_quota=%d per tier)", theme_code, cell_quota)
        start = 0
        per_page = 100
        theme_added = 0

        while True:
            try:
                # Filtro per tema via Solr: extras field
                fq = f'res_format:CSV extras_theme:"{theme_code}"'
                data = ckan_package_search(fq, rows=per_page, start=start)
            except Exception as e:
                log.warning("    CKAN error start=%d: %s", start, e)
                time.sleep(3)
                break

            pkgs = data.get("result", {}).get("results", [])
            total = data.get("result", {}).get("count", 0)
            if not pkgs:
                break

            for pkg in pkgs:
                extras = extract_extras(pkg)
                ipa = extras.get("holder_identifier", "") or extras.get("publisher_identifier", "")
                holder = extras.get("holder_name", "") or extras.get("publisher_name", "")
                theme = get_theme(extras) or theme_code
                tier = classify_tier(ipa)

                # Salta se bucket tier già pieno
                if len(tier_buckets[tier]) >= TIER_QUOTA[tier]:
                    continue

                # Conta celle tema×tier per bilanciamento
                cell_count = sum(
                    1 for r in tier_buckets[tier]
                    if r.get("theme_code") == theme_code
                )
                if cell_count >= cell_quota:
                    continue

                for res in pkg.get("resources", []):
                    fmt = (res.get("format") or "").upper()
                    if fmt not in ("CSV", "TEXT/CSV"):
                        continue
                    url = res.get("url", "")
                    if not url or url in all_urls:
                        continue

                    record = {
                        "url":         url,
                        "theme_code":  theme_code,
                        "ipa_code":    ipa,
                        "holder_name": holder,
                        "tier":        tier,
                        "pkg_title":   pkg.get("title", ""),
                    }
                    tier_buckets[tier].append(record)
                    all_urls.add(url)
                    theme_added += 1
                    break  # un CSV per package

            log.info("    start=%d/%d aggiunti=%d tier=%s",
                     start, total, theme_added,
                     {t: len(v) for t, v in tier_buckets.items()})

            start += per_page
            time.sleep(REQUEST_DELAY)

            # Stoppiamo se abbiamo abbastanza per questo tema
            if start >= min(total, 1000):
                break

        log.info("  Tema %s completato. Aggiunti: %d", theme_code, theme_added)

    sample = []
    for tier, records in tier_buckets.items():
        log.info("Tier %s: %d URL", tier, len(records))
        sample.extend(records)

    log.info("Campione totale: %d CSV unici", len(sample))
    return sample[:TOTAL_TARGET]

# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------
def download_csv(url: str) -> tuple:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CSV-to-RDF-corpus-analyzer/3.0"})
        with urllib.request.urlopen(req, timeout=DOWNLOAD_TIMEOUT) as r:
            content = r.read(MAX_FILE_BYTES + 1)
        if len(content) > MAX_FILE_BYTES: return None, "file_too_large"
        return content, ""
    except urllib.error.HTTPError as e: return None, f"http_{e.code}"
    except urllib.error.URLError: return None, "url_error"
    except Exception as e: return None, f"error_{str(e)[:40]}"

# ---------------------------------------------------------------------------
# Analisi CSV
# ---------------------------------------------------------------------------
def detect_encoding(raw: bytes) -> tuple:
    if raw[:3] == b'\xef\xbb\xbf': return "utf-8-bom", 1.0
    r = chardet.detect(raw[:10000])
    return (r.get("encoding") or "unknown"), (r.get("confidence") or 0.0)

def detect_separator(text: str) -> str:
    try:
        d = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|"); return d.delimiter
    except:
        counts = {d: text[:2000].count(d) for d in [",",";","\t","|"]}
        return max(counts, key=counts.get)

def find_header_row(lines, sep) -> int:
    best_row, best_count = 0, 0
    for i, line in enumerate(lines[:10]):
        n = sum(1 for c in line.split(sep) if c.strip())
        if n > best_count: best_count, best_row = n, i
    return best_row

def analyze_csv(raw: bytes, meta: dict) -> dict:
    result = {**meta, "size_kb": round(len(raw)/1024,1), "error": None,
              "encoding": None, "enc_conf": None, "separator": None,
              "header_row": 0, "n_cols": 0, "n_rows": 0,
              "col_names": [], "col_types": {}, "anomalies": {},
              "onto_scores": {}, "onto_detected": []}

    enc, conf = detect_encoding(raw)
    result["encoding"] = enc; result["enc_conf"] = round(conf, 2)
    result["anomalies"]["non_utf8"]       = enc not in ("utf-8","utf-8-bom","ascii","UTF-8-SIG")
    result["anomalies"]["utf8_bom"]       = enc == "utf-8-bom"

    try: text = raw.decode("utf-8-sig" if enc=="utf-8-bom" else (enc or "utf-8"), errors="replace")
    except: text = raw.decode("latin-1", errors="replace")

    result["anomalies"]["windows_lineend"] = "\r\n" in text
    text = text.replace("\r\n","\n").replace("\r","\n")
    lines = text.split("\n")

    sep = detect_separator(text)
    result["separator"] = sep
    result["anomalies"]["mixed_separator"] = sep not in (",",";","\t")

    hrow = find_header_row(lines, sep)
    result["header_row"] = hrow
    result["anomalies"]["header_not_row1"] = hrow > 0

    re_date_it  = re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")
    re_date_iso = re.compile(r"^\d{4}-\d{2}-\d{2}")
    re_bool_it  = re.compile(r"^(sì|si|no|vero|falso|v|f)$", re.I)
    re_dms      = re.compile(r"\d+[°º]\s*\d+['\']\s*[\d.]")
    re_total    = re.compile(r"(totale|subtotale|totali|total)", re.I)

    try:
        df = pd.read_csv(io.StringIO(text), sep=sep, header=hrow,
                         nrows=MAX_ROWS_ANALYZE, dtype=str,
                         on_bad_lines="skip", engine="python")
        result["n_cols"] = len(df.columns); result["n_rows"] = len(df)
        result["col_names"] = [str(c) for c in df.columns]
        result["anomalies"]["empty_columns"]     = any(str(c).strip()==""or str(c).startswith("Unnamed:") for c in df.columns)
        result["anomalies"]["duplicate_columns"] = len(df.columns) != len(set(str(c) for c in df.columns))

        onto_scores: dict[str,int] = defaultdict(int)
        col_types: dict[str,str] = {}
        has_date_it = has_bool_it = has_dms = has_total = has_mixed = False

        for col in df.columns:
            cl = str(col).lower().strip()
            for onto, kws in ONTO_KEYWORDS.items():
                if any(kw in cl for kw in kws): onto_scores[onto] += 2

            vals = df[col].dropna().astype(str).head(50).tolist()
            n = len(vals)
            if n == 0: col_types[col] = "empty"; continue
            n_num  = sum(1 for v in vals if re.match(r"^-?\d+([.,]\d+)?$", v.replace(" ","")))
            n_diso = sum(1 for v in vals if re_date_iso.match(v))
            n_dit  = sum(1 for v in vals if re_date_it.match(v))
            n_bool = sum(1 for v in vals if re_bool_it.match(v))

            if n_num/n > 0.8:            col_types[col]="numeric";  onto_scores["QB"]+=1
            elif (n_diso+n_dit)/n > 0.6: col_types[col]="date";     onto_scores["TI"]+=1
            elif n_bool/n > 0.6:         col_types[col]="boolean"
            else:
                col_types[col]="string"
                if n_num/n > 0.3: has_mixed = True

            for v in vals[:30]:
                if re_date_it.match(v):  has_date_it=True; onto_scores["TI"]+=1
                if re_bool_it.match(v):  has_bool_it=True
                if re_dms.search(v):     has_dms=True;     onto_scores["POI"]+=1
            if re_total.search(cl):      has_total=True

        for col in df.select_dtypes(include="object").columns[:5]:
            if df[col].astype(str).str.contains(re_total).any(): has_total=True

        result["anomalies"].update({"date_italian":has_date_it,"bool_italian":has_bool_it,
            "coordinates_dms":has_dms,"total_rows":has_total,"mixed_types":has_mixed})
        result["col_types"]     = col_types
        result["onto_scores"]   = dict(onto_scores)
        result["onto_detected"] = [k for k,v in sorted(onto_scores.items(),key=lambda x:-x[1]) if v>=2][:5]
    except Exception as e:
        result["error"] = f"parse_error:{str(e)[:80]}"
    return result

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    log.info("analyze_corpus_gaps.py v3 — CKAN API, target %d CSV", TOTAL_TARGET)
    sample = collect_sample()
    if not sample: log.error("Campione vuoto"); sys.exit(1)

    log.info("=== Fase 2: download e analisi (%d CSV) ===", len(sample))
    anomaly_counts=defaultdict(int); onto_counts=defaultdict(int)
    tier_counts=defaultdict(int);    theme_counts=defaultdict(int)
    enc_counts=defaultdict(int);     sep_counts=defaultdict(int)
    errors=defaultdict(int);         ok_count=0

    with open(JSONL_PATH,"w",encoding="utf-8") as fout:
        for i, meta in enumerate(sample,1):
            if i%100==0:
                log.info("[%d/%d] OK=%d ERR=%d tier=%s",i,len(sample),ok_count,sum(errors.values()),dict(tier_counts))
            raw, err = download_csv(meta["url"])
            if err or raw is None:
                errors[err]+=1
                fout.write(json.dumps({**meta,"error":err},ensure_ascii=False)+"\n"); continue
            rec = analyze_csv(raw, meta)
            ok_count+=1
            tier_counts[meta.get("tier","?")] +=1
            theme_counts[meta.get("theme_code","?")] +=1
            enc_counts[rec["encoding"] or "unknown"] +=1
            sep_counts[rec["separator"] or "?"] +=1
            for k,v in rec.get("anomalies",{}).items():
                if v: anomaly_counts[k]+=1
            for onto in rec.get("onto_detected",[]): onto_counts[onto]+=1
            fout.write(json.dumps(rec,ensure_ascii=False)+"\n")
            time.sleep(0.05)

    log.info("=== Fase 3: summary ===")
    summary = {
        "generated_at":    datetime.utcnow().isoformat()+"Z",
        "target":          TOTAL_TARGET,
        "total_attempted": ok_count+sum(errors.values()),
        "total_ok":        ok_count,
        "errors":          dict(errors),
        "by_tier":         dict(tier_counts),
        "by_theme":        dict(theme_counts),
        "encodings":       dict(enc_counts),
        "separators":      dict(sep_counts),
        "anomalies":  {k:{"count":v,"pct":round(v/max(ok_count,1)*100,1)}
                       for k,v in sorted(anomaly_counts.items(),key=lambda x:-x[1])},
        "onto_detected":{k:{"count":v,"pct":round(v/max(ok_count,1)*100,1)}
                         for k,v in sorted(onto_counts.items(),key=lambda x:-x[1])},
    }
    SUMMARY_PATH.write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    log.info("Done. OK=%d ERR=%d",ok_count,sum(errors.values()))
    print("\n=== ANOMALIE ===")
    for k,v in summary["anomalies"].items():
        print(f"  {k:<25} {v['count']:>5}  ({v['pct']}%)")
    print("\n=== ONTOLOGIE RILEVATE ===")
    for k,v in summary["onto_detected"].items():
        print(f"  {k:<20} {v['count']:>5}  ({v['pct']}%)")

if __name__=="__main__":
    main()

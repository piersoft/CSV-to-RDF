#!/usr/bin/env python3
"""
analyze_corpus_gaps.py
======================
Analisi gap del corpus CSV-to-RDF su dati.gov.it

Strategia:
  - Campiona 2000 CSV stratificati per tier PA (Comuni/Regioni/Agenzie/Ministeri)
    e per tema DCAT-AP (14 temi EU)
  - Per ogni CSV: scarica (max 2MB), analizza struttura, rileva anomalie
  - Classifica ontologie potenziali tramite keyword matching su header/valori
  - Output: corpus/gap_analysis_YYYYMMDD.jsonl + corpus/gap_summary_YYYYMMDD.json

Zero costi API Anthropic — solo CKAN API pubblica + chardet + pandas.
"""

import csv
import hashlib
import io
import json
import logging
import math
import re
import sys
import time
import urllib.request
import urllib.error
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Dipendenze leggere — installate nel workflow
# ---------------------------------------------------------------------------
try:
    import chardet
    import pandas as pd
except ImportError:
    print("Installa: pip install chardet pandas")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
CKAN_BASE        = "https://www.dati.gov.it/opendata"
TOTAL_TARGET     = 2000
MAX_FILE_BYTES   = 2_000_000   # 2 MB max per CSV
DOWNLOAD_TIMEOUT = 20          # secondi
REQUEST_DELAY    = 0.3         # secondi tra richieste CKAN
MAX_ROWS_ANALYZE = 200         # righe max da analizzare per file

OUTPUT_DIR = Path("corpus")
OUTPUT_DIR.mkdir(exist_ok=True)

TODAY = datetime.utcnow().strftime("%Y%m%d")
JSONL_PATH    = OUTPUT_DIR / f"gap_analysis_{TODAY}.jsonl"
SUMMARY_PATH  = OUTPUT_DIR / f"gap_summary_{TODAY}.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Temi DCAT-AP EU (codici ufficiali)
# ---------------------------------------------------------------------------
DCAT_THEMES = [
    "AGRI", "ECON", "EDUC", "ENER", "ENVI", "GOVE", "HEAL",
    "INTR", "JUST", "REGI", "SOCI", "TECH", "TRAN", "OP_DATPRO",
]

# Quota per tema (proporzionale, somma = TOTAL_TARGET)
THEME_QUOTA = {t: max(1, TOTAL_TARGET // len(DCAT_THEMES)) for t in DCAT_THEMES}

# ---------------------------------------------------------------------------
# Tier PA — keyword nei campi organization.title / extras[harvest_source_title]
# ---------------------------------------------------------------------------
TIER_PATTERNS = {
    "Comuni":    [r"\bcomun[ei]\b", r"\bmunicipal", r"\bcitta['']\b"],
    "Regioni":   [r"\bregio[nen]\b", r"\bregional"],
    "Agenzie":   [r"\bagenzi[ae]\b", r"\bautori[tà]", r"\bente\b", r"\bistitut"],
    "Ministeri": [r"\bministero\b", r"\bministeri\b", r"\bdipartiment"],
}

TIER_QUOTA = {t: TOTAL_TARGET // len(TIER_PATTERNS) for t in TIER_PATTERNS}  # 500 ciascuno

# ---------------------------------------------------------------------------
# Ontologie potenziali — keyword su nomi colonna + valori campione
# ---------------------------------------------------------------------------
ONTO_KEYWORDS = {
    "POI":            ["lat", "lon", "latitude", "longitude", "coord", "gps",
                       "x_wgs", "y_wgs", "georef", "geom", "punto", "location"],
    "CLV":            ["via", "indirizzo", "civico", "cap", "comune", "provincia",
                       "citta", "città", "address", "street", "postal"],
    "QB":             ["valore", "value", "totale", "importo", "quantita", "numero",
                       "count", "misura", "indicatore", "anno", "year", "mese"],
    "TI":             ["data", "date", "inizio", "fine", "start", "end",
                       "scadenza", "pubblicazione", "aggiornamento", "timestamp"],
    "CPSV":           ["gara", "appalto", "cig", "cup", "procedura", "aggiudicaz",
                       "bando", "lotto", "fornitore", "contratto"],
    "GTFS":           ["route", "trip", "stop", "shape", "agency", "feed",
                       "gtfs", "orario", "corsa", "fermata", "linea"],
    "IoT-AP_IT":      ["sensore", "sensor", "misura", "temperatura", "umidità",
                       "pressione", "pm10", "pm2", "co2", "inquinante", "rilevaz"],
    "ACCO":           ["hotel", "struttura", "turismo", "ospitalita", "camere",
                       "posti letto", "albergo", "b&b", "agriturismo"],
    "MUAPIT":         ["museo", "bene", "culturale", "monumento", "patrimonio",
                       "arco", "artef", "opera", "collezione"],
    "SMAPIT":         ["scuola", "istituto", "plesso", "classe", "alunni",
                       "studenti", "docenti", "miur", "istruzione"],
    "PublicOrg":      ["ente", "amministrazione", "pa", "ipa", "codice_ipa",
                       "organizzazione", "struttura_amm"],
    "CPV":            ["popolazione", "residenti", "abitanti", "nati", "morti",
                       "stranieri", "cittadini", "anagrafe", "demograf"],
    "Cultural-ON":    ["biblioteca", "archivio", "teatro", "cinema", "festival",
                       "evento", "spettacolo", "esposizione"],
    "DCATAPIT":       ["dataset", "catalogo", "metadat", "harvest", "dcat",
                       "licenza", "editore", "titolare"],
}

# ---------------------------------------------------------------------------
# Anomalie da rilevare
# ---------------------------------------------------------------------------
ANOMALY_CHECKS = {
    "header_not_row1":    None,   # header non in riga 1
    "mixed_separator":    None,   # separatore ambiguo
    "non_utf8":           None,   # encoding non UTF-8
    "empty_columns":      None,   # colonne senza nome
    "duplicate_columns":  None,   # colonne duplicate
    "total_rows":         None,   # righe di subtotale/totale
    "date_italian":       None,   # date gg/mm/aaaa non ISO
    "bool_italian":       None,   # Sì/No, V/F
    "coordinates_dms":    None,   # coordinate in gradi sessagesimali
    "mixed_types":        None,   # colonna con tipi misti
    "utf8_bom":           None,   # BOM UTF-8
    "windows_lineend":    None,   # CRLF
}

# ---------------------------------------------------------------------------
# CKAN helpers
# ---------------------------------------------------------------------------
def ckan_search(fq: str, rows: int = 100, start: int = 0) -> dict:
    """Chiama package_search su dati.gov.it."""
    params = f"fq={urllib.parse.quote(fq)}&rows={rows}&start={start}&include_private=false"
    url = f"{CKAN_BASE}/api/3/action/package_search?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CSV-to-RDF-corpus-analyzer/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except Exception as e:
        log.warning("CKAN error %s: %s", url[:80], e)
        return {}


def get_csv_resources(fq: str, max_pkg: int = 500) -> list[dict]:
    """Recupera risorse CSV da package_search con paginazione."""
    results = []
    start = 0
    per_page = 100
    while len(results) < max_pkg:
        data = ckan_search(fq, rows=per_page, start=start)
        pkgs = data.get("result", {}).get("results", [])
        if not pkgs:
            break
        for pkg in pkgs:
            for res in pkg.get("resources", []):
                fmt = (res.get("format") or "").upper()
                if fmt in ("CSV", "TEXT/CSV") and res.get("url"):
                    results.append({
                        "pkg_id":    pkg.get("id"),
                        "pkg_name":  pkg.get("name"),
                        "pkg_title": pkg.get("title", ""),
                        "org":       pkg.get("organization", {}).get("title", ""),
                        "themes":    [g.get("name","") for g in pkg.get("groups", [])],
                        "res_id":    res.get("id"),
                        "res_url":   res.get("url"),
                        "res_name":  res.get("name",""),
                    })
        start += per_page
        time.sleep(REQUEST_DELAY)
        if len(pkgs) < per_page:
            break
    return results


# ---------------------------------------------------------------------------
# Download + analisi
# ---------------------------------------------------------------------------
import urllib.parse  # noqa: E402 (già usato sopra)


def download_csv(url: str) -> tuple[bytes | None, str]:
    """Scarica CSV con limite dimensionale. Ritorna (bytes, errore)."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CSV-to-RDF-corpus-analyzer/1.0"})
        with urllib.request.urlopen(req, timeout=DOWNLOAD_TIMEOUT) as r:
            content = r.read(MAX_FILE_BYTES + 1)
        if len(content) > MAX_FILE_BYTES:
            return None, "file_too_large"
        return content, ""
    except urllib.error.HTTPError as e:
        return None, f"http_{e.code}"
    except urllib.error.URLError as e:
        return None, f"url_error_{str(e.reason)[:30]}"
    except Exception as e:
        return None, f"error_{str(e)[:40]}"


def detect_encoding(raw: bytes) -> tuple[str, float]:
    """Rileva encoding con chardet."""
    has_bom = raw[:3] == b'\xef\xbb\xbf'
    if has_bom:
        return "utf-8-bom", 1.0
    result = chardet.detect(raw[:10000])
    return (result.get("encoding") or "unknown"), (result.get("confidence") or 0.0)


def detect_separator(sample: str) -> str:
    """Rileva separatore CSV."""
    try:
        dialect = csv.Sniffer().sniff(sample[:4096], delimiters=",;\t|")
        return dialect.delimiter
    except Exception:
        # fallback: conta occorrenze
        counts = {d: sample[:2000].count(d) for d in [",", ";", "\t", "|"]}
        return max(counts, key=counts.get)


def find_header_row(lines: list[str], sep: str) -> int:
    """Trova la riga dell'header (cerca la riga con più colonne non-vuote)."""
    best_row, best_count = 0, 0
    for i, line in enumerate(lines[:10]):
        cols = [c.strip() for c in line.split(sep)]
        non_empty = sum(1 for c in cols if c)
        if non_empty > best_count:
            best_count = non_empty
            best_row = i
    return best_row


def analyze_values(df: pd.DataFrame) -> dict:
    """Analizza anomalie e tipi nei valori del DataFrame."""
    anomalies = {}
    onto_scores = defaultdict(int)
    col_types = {}

    re_date_it   = re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")
    re_date_iso  = re.compile(r"^\d{4}-\d{2}-\d{2}")
    re_bool_it   = re.compile(r"^(sì|si|no|vero|falso|v|f)$", re.I)
    re_coord_dms = re.compile(r"\d+[°º]\s*\d+['']\s*[\d.]+")
    re_total_kw  = re.compile(r"(totale|subtotale|totali|total)", re.I)

    has_date_it    = False
    has_bool_it    = False
    has_coord_dms  = False
    has_total_rows = False

    for col in df.columns:
        col_lower = str(col).lower().strip()

        # ontologia potenziale da nome colonna
        for onto, kws in ONTO_KEYWORDS.items():
            if any(kw in col_lower for kw in kws):
                onto_scores[onto] += 2

        # tipo colonna
        sample_vals = df[col].dropna().astype(str).head(50).tolist()
        n_num  = sum(1 for v in sample_vals if re.match(r"^-?\d+([.,]\d+)?$", v.replace(" ","")))
        n_date = sum(1 for v in sample_vals if re_date_iso.match(v) or re_date_it.match(v))
        n_bool = sum(1 for v in sample_vals if re_bool_it.match(v))
        n_tot  = len(sample_vals)

        if n_tot == 0:
            col_types[col] = "empty"
        elif n_num / n_tot > 0.8:
            col_types[col] = "numeric"
            onto_scores["QB"] += 1
        elif n_date / n_tot > 0.6:
            col_types[col] = "date"
            onto_scores["TI"] += 1
        elif n_bool / n_tot > 0.6:
            col_types[col] = "boolean"
        else:
            col_types[col] = "string"

        # anomalie valore
        for v in sample_vals[:30]:
            if re_date_it.match(v):
                has_date_it = True
                onto_scores["TI"] += 1
            if re_bool_it.match(v):
                has_bool_it = True
            if re_coord_dms.search(v):
                has_coord_dms = True
                onto_scores["POI"] += 1

        # righe totale
        if re_total_kw.search(col_lower):
            has_total_rows = True

    # check righe con keyword totale nel valore
    for col in df.select_dtypes(include="object").columns[:5]:
        if df[col].astype(str).str.contains(re_total_kw).any():
            has_total_rows = True

    # mixed types per colonna
    mixed_cols = [c for c, t in col_types.items() if t == "string" and
                  df[c].dropna().astype(str).str.match(r"^-?\d+([.,]\d+)?$").mean() > 0.3]

    anomalies["date_italian"]    = has_date_it
    anomalies["bool_italian"]    = has_bool_it
    anomalies["coordinates_dms"] = has_coord_dms
    anomalies["total_rows"]      = has_total_rows
    anomalies["mixed_types"]     = bool(mixed_cols)

    return {
        "anomalies_values": anomalies,
        "col_types":        col_types,
        "onto_scores":      dict(onto_scores),
    }


def analyze_csv(raw: bytes, url: str) -> dict:
    """Analisi completa di un file CSV grezzo."""
    result = {
        "url":      url,
        "error":    None,
        "size_kb":  round(len(raw) / 1024, 1),
        "anomalies": {},
        "encoding":  None,
        "encoding_confidence": None,
        "separator": None,
        "header_row": 0,
        "n_cols":    0,
        "n_rows":    0,
        "col_names": [],
        "col_types": {},
        "onto_scores": {},
        "onto_detected": [],
    }

    # Encoding
    enc, conf = detect_encoding(raw)
    result["encoding"] = enc
    result["encoding_confidence"] = round(conf, 2)
    result["anomalies"]["non_utf8"]  = enc not in ("utf-8", "utf-8-bom", "ascii", "UTF-8-SIG")
    result["anomalies"]["utf8_bom"]  = enc == "utf-8-bom"

    # Decodifica
    decode_enc = "utf-8-sig" if enc == "utf-8-bom" else (enc or "utf-8")
    try:
        text = raw.decode(decode_enc, errors="replace")
    except Exception:
        text = raw.decode("latin-1", errors="replace")

    result["anomalies"]["windows_lineend"] = "\r\n" in text
    text_clean = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = text_clean.split("\n")

    # Separatore
    sep = detect_separator(text_clean)
    result["separator"] = sep
    result["anomalies"]["mixed_separator"] = sep not in (",", ";", "\t")

    # Header row
    hrow = find_header_row(lines, sep)
    result["header_row"] = hrow
    result["anomalies"]["header_not_row1"] = hrow > 0

    # Parsing pandas
    try:
        df = pd.read_csv(
            io.StringIO(text_clean),
            sep=sep,
            header=hrow,
            nrows=MAX_ROWS_ANALYZE,
            dtype=str,
            on_bad_lines="skip",
            engine="python",
        )
        result["n_cols"] = len(df.columns)
        result["n_rows"] = len(df)
        result["col_names"] = [str(c) for c in df.columns]

        # Colonne vuote / duplicate
        empty_cols = [str(c) for c in df.columns if str(c).strip() in ("", "Unnamed:") or str(c).startswith("Unnamed:")]
        result["anomalies"]["empty_columns"]     = bool(empty_cols)
        result["anomalies"]["duplicate_columns"] = len(df.columns) != len(set(str(c) for c in df.columns))

        # Ontologie da nomi colonna
        col_onto = defaultdict(int)
        for col in df.columns:
            col_lower = str(col).lower().strip()
            for onto, kws in ONTO_KEYWORDS.items():
                if any(kw in col_lower for kw in kws):
                    col_onto[onto] += 2

        # Analisi valori
        val_analysis = analyze_values(df)
        result["anomalies"].update(val_analysis["anomalies_values"])
        result["col_types"] = val_analysis["col_types"]

        # Merge scores
        merged = defaultdict(int, col_onto)
        for k, v in val_analysis["onto_scores"].items():
            merged[k] += v
        result["onto_scores"] = dict(merged)
        result["onto_detected"] = [k for k, v in sorted(merged.items(), key=lambda x: -x[1]) if v >= 2][:5]

    except Exception as e:
        result["error"] = f"parse_error: {str(e)[:80]}"

    return result


# ---------------------------------------------------------------------------
# Stratificazione campione
# ---------------------------------------------------------------------------
def build_sample() -> list[dict]:
    """
    Costruisce il campione stratificato 2000 CSV:
      - Asse 1: tier PA (4 categorie, ~500 ciascuna)
      - Asse 2: tema DCAT (14 temi, quota proporzionale dentro ogni tier)
    """
    log.info("=== Fase 1: raccolta URL CSV da CKAN ===")
    sample = []
    seen_urls: set[str] = set()

    quota_per_tier = TOTAL_TARGET // len(TIER_PATTERNS)  # 500

    for tier, patterns in TIER_PATTERNS.items():
        log.info("Tier: %s (quota=%d)", tier, quota_per_tier)
        tier_resources = []

        for theme in DCAT_THEMES:
            # Costruiamo fq per tema + tier
            theme_fq  = f"groups:{theme}"
            # Recupera risorse CSV per questo tema (senza filtro tier, poi filtra)
            resources = get_csv_resources(theme_fq, max_pkg=200)

            # Filtra per tier in base a org title
            filtered = []
            for r in resources:
                org_lower = r["org"].lower()
                if any(re.search(p, org_lower) for p in patterns):
                    if r["res_url"] not in seen_urls:
                        filtered.append(r)
                        seen_urls.add(r["res_url"])

            # Quota per tema dentro questo tier
            theme_quota = max(1, quota_per_tier // len(DCAT_THEMES))
            selected = filtered[:theme_quota]
            for r in selected:
                r["tier"] = tier
                r["theme_code"] = theme
            tier_resources.extend(selected)
            log.info("  tema %s: %d trovati, %d selezionati", theme, len(filtered), len(selected))
            time.sleep(REQUEST_DELAY)

        sample.extend(tier_resources[:quota_per_tier])
        log.info("Tier %s: totale %d risorse", tier, len(tier_resources[:quota_per_tier]))

    log.info("Campione totale: %d CSV unici", len(sample))
    return sample[:TOTAL_TARGET]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    log.info("analyze_corpus_gaps.py — target %d CSV", TOTAL_TARGET)
    log.info("Output: %s, %s", JSONL_PATH, SUMMARY_PATH)

    # Fase 1: campionamento
    sample = build_sample()

    # Fase 2: download + analisi
    log.info("=== Fase 2: download e analisi (%d file) ===", len(sample))
    anomaly_counts   = defaultdict(int)
    onto_counts      = defaultdict(int)
    tier_counts      = defaultdict(int)
    theme_counts     = defaultdict(int)
    encoding_counts  = defaultdict(int)
    separator_counts = defaultdict(int)
    errors           = defaultdict(int)
    ok_count         = 0

    with open(JSONL_PATH, "w", encoding="utf-8") as fout:
        for i, res in enumerate(sample, 1):
            url = res["res_url"]
            log.info("[%d/%d] %s", i, len(sample), url[:80])

            raw, err = download_csv(url)
            if err or raw is None:
                errors[err] += 1
                record = {**res, "error": err, "analysis": None}
                fout.write(json.dumps(record, ensure_ascii=False) + "\n")
                continue

            analysis = analyze_csv(raw, url)
            analysis["tier"]       = res.get("tier")
            analysis["theme_code"] = res.get("theme_code")
            analysis["pkg_title"]  = res.get("pkg_title")
            analysis["org"]        = res.get("org")
            analysis["pkg_id"]     = res.get("pkg_id")

            # Aggiorna statistiche
            ok_count += 1
            tier_counts[res.get("tier","?")] += 1
            theme_counts[res.get("theme_code","?")] += 1
            encoding_counts[analysis["encoding"] or "unknown"] += 1
            separator_counts[analysis["separator"] or "?"] += 1
            for anom, val in analysis.get("anomalies", {}).items():
                if val:
                    anomaly_counts[anom] += 1
            for onto in analysis.get("onto_detected", []):
                onto_counts[onto] += 1

            fout.write(json.dumps(analysis, ensure_ascii=False) + "\n")

            # Throttle leggero
            if i % 50 == 0:
                log.info("  [checkpoint] %d/%d — anomalie top: %s",
                         i, len(sample),
                         sorted(anomaly_counts.items(), key=lambda x: -x[1])[:3])
            time.sleep(0.1)

    # Fase 3: summary
    log.info("=== Fase 3: scrittura summary ===")
    total_analyzed = ok_count + sum(errors.values())
    summary = {
        "generated_at":    datetime.utcnow().isoformat() + "Z",
        "target":          TOTAL_TARGET,
        "total_attempted": total_analyzed,
        "total_ok":        ok_count,
        "errors":          dict(errors),
        "by_tier":         dict(tier_counts),
        "by_theme":        dict(theme_counts),
        "encodings":       dict(encoding_counts),
        "separators":      dict(separator_counts),
        "anomalies": {
            k: {"count": v, "pct": round(v / max(ok_count, 1) * 100, 1)}
            for k, v in sorted(anomaly_counts.items(), key=lambda x: -x[1])
        },
        "onto_detected": {
            k: {"count": v, "pct": round(v / max(ok_count, 1) * 100, 1)}
            for k, v in sorted(onto_counts.items(), key=lambda x: -x[1])
        },
        "onto_gap_vs_corpus": {
            # Ontologie rilevate ma non/poco nel corpus attuale
            # (da confrontare manualmente con fixtures_v7.json domani)
            "note": "Confrontare onto_detected con distribuzione fixtures_v7.json"
        },
    }

    SUMMARY_PATH.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info("Summary scritto: %s", SUMMARY_PATH)
    log.info("JSONL scritto:   %s (%d record)", JSONL_PATH, total_analyzed)
    log.info("=== Fine. OK=%d Errori=%d ===", ok_count, sum(errors.values()))

    # Stampa riepilogo finale
    print("\n=== RIEPILOGO ANOMALIE ===")
    for anom, data in summary["anomalies"].items():
        print(f"  {anom:<25} {data['count']:>5}  ({data['pct']}%)")
    print("\n=== ONTOLOGIE RILEVATE ===")
    for onto, data in summary["onto_detected"].items():
        print(f"  {onto:<20} {data['count']:>5}  ({data['pct']}%)")


if __name__ == "__main__":
    main()

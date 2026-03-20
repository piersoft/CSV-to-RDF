#!/usr/bin/env python3
"""
Legge fixtures_v7.json e aggiorna la sezione corpus nel README.md.
Eseguito automaticamente dal GitHub Action ad ogni push su fixtures_v7.json.
"""
import json, re, math
from collections import defaultdict
from pathlib import Path

fixtures_data = json.loads(Path("fixtures_v7.json").read_text(encoding="utf-8"))
corpus = fixtures_data.get("corpus", fixtures_data) if isinstance(fixtures_data, dict) else fixtures_data
total = len(corpus)
version = fixtures_data.get("script_version", "v?") if isinstance(fixtures_data, dict) else "v?"

counts = defaultdict(int)
for f in corpus:
    for onto in f.get("tema_onto", []):
        counts[onto] += 1

SPECIAL_SCORE = {"DCATAPIT": 100}
def calc_score(n, total):
    pct = n / total
    return min(99, round(45 + 55 * (1 - math.exp(-pct * 8))))

def emoji(score):
    if score >= 80: return "🟢"
    if score >= 70: return "🔵"
    if score >= 55: return "🟡"
    return "🔴"

DESC = {
    "QB": "Dati statistici e serie storiche",
    "POI": "Luoghi geolocalizzati con lat/lon",
    "CPV": "Popolazione, anagrafe, residenti",
    "CLV": "Stradari, civici, indirizzi",
    "CPSV": "Appalti, gare, determine, atti PA",
    "ACCO": "Strutture ricettive e turismo",
    "TI": "Eventi con data inizio/fine",
    "Cultural-ON": "Musei, biblioteche, beni culturali",
    "ADMS": "Metadati e cataloghi open data",
    "DCATAPIT": "Standard obbligatorio dati.gov.it",
    "RO-AP_IT": "Ruoli e incarichi istituzionali",
    "COV-AP_IT": "Personale e organizzazioni PA",
    "CPVAPIT": "Persone fisiche nominative",
    "PublicOrganization": "Enti pubblici (IPA, ASL, ecc.)",
    "GTFS": "Trasporto pubblico locale",
    "IoT-AP_IT": "Sensori IoT e misurazioni",
    "MUAPIT": "Luoghi e beni culturali MiC/ArCo",
    "SMAPIT": "Strutture scolastiche",
}

sorted_onto = sorted(counts.items(), key=lambda x: -x[1])
rows = []
for onto, n in sorted_onto:
    score = SPECIAL_SCORE.get(onto, calc_score(n, total))
    em = "🟢" if onto in SPECIAL_SCORE else emoji(score)
    desc = DESC.get(onto, "—")
    rows.append(f"| **{onto}** | {n} | {em} {score}% | {desc} |")

table = "| Ontologia | Fixture | Score | Descrizione |\n|-----------|--------:|------:|-------------|\n" + "\n".join(rows)

readme = Path("README.md").read_text(encoding="utf-8")
readme = re.sub(r"### Corpus di riferimento v\d+", f"### Corpus di riferimento {version}", readme)
readme = re.sub(r"corpus di \*\*\d+ dataset reali\*\*", f"corpus di **{total} dataset reali**", readme)
readme = re.sub(r"\(\d+ dataset\)", f"({total} dataset)", readme)
readme = re.sub(
    r"\| Ontologia \| (?:Dataset primari|Fixture) \|.*?\n(?:\|.*?\n)+",
    table + "\n",
    readme, flags=re.DOTALL
)
Path("README.md").write_text(readme, encoding="utf-8")
print(f"README aggiornato: {version}, {total} fixture, {len(counts)} ontologie")

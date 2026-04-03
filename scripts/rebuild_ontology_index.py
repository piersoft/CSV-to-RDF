#!/usr/bin/env python3
"""
rebuild_ontology_index.py
=========================
Scarica i TTL ufficiali da github.com/italia/dati-semantic-assets
e rigenera ontology_index.json con classi, ObjectProperty e DatatypeProperty
verificate per ogni ontologia della rete italiana.

Eseguito automaticamente dalla GitHub Action ogni lunedì alle 03:00 UTC,
oppure manualmente con: python scripts/rebuild_ontology_index.py
"""

import re
import json
import urllib.request
import urllib.error
import sys
import os
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Configurazione
# ---------------------------------------------------------------------------

GITHUB_API = "https://api.github.com"
SOURCE_REPO = "italia/dati-semantic-assets"
OUTPUT_FILE = "ontology_index.json"

# Token opzionale per evitare rate limiting (letto da env)
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# Ontologie in dati-semantic-assets con prefisso e URI base
ONTO_CONFIGS = {
    "ACCO":            ("acco",    "https://w3id.org/italia/onto/ACCO/",            "ACCO-AP_IT.ttl"),
    "ADMS":            ("adms",    "https://w3id.org/italia/onto/ADMS/",            "ADMS-AP_IT.ttl"),
    "AccessCondition": ("ac",      "https://w3id.org/italia/onto/AccessCondition/", "AccessCondition-AP_IT.ttl"),
    "AtlasOfPaths":    ("aop",     "https://w3id.org/italia/onto/AtlasOfPaths/",   "AtlasOfPaths-AP_IT.ttl"),
    "CLV":             ("clv",     "https://w3id.org/italia/onto/CLV/",             "CLV-AP_IT.ttl"),
    "COV":             ("cov",     "https://w3id.org/italia/onto/COV/",             "COV-AP_IT.ttl"),
    "CPEV":            ("cpev",    "https://w3id.org/italia/onto/CPEV/",            "CPEV-AP_IT.ttl"),
    "CPSV":            ("cpsv",    "http://purl.org/vocab/cpsv#",                   "CPSV-AP_IT.ttl"),
    "CPV":             ("cpv",     "https://w3id.org/italia/onto/CPV/",             "CPV-AP_IT.ttl"),
    "Cultural-ON":     ("cis",     "https://w3id.org/italia/onto/Cultural-ON/",     "Cultural-ON-AP_IT.ttl"),
    "CulturalHeritage":("ch",      None,                                            None),   # wrapper ArCo — manuale
    "Indicator":       ("indicator","https://w3id.org/italia/onto/Indicator/",      "Indicator-AP_IT.ttl"),
    "IoT":             ("iot",     "https://w3id.org/italia/onto/IoT/",             "IoT-AP_IT.ttl"),
    "Learning":        ("learn",   "https://w3id.org/italia/onto/Learning/",        "Learning-AP_IT.ttl"),
    "MU":              ("mu",      "https://w3id.org/italia/onto/MU/",              "MU-AP_IT.ttl"),
    "NDC":             ("ndc",     "https://w3id.org/italia/onto/NDC/",             "NDC-AP_IT.ttl"),
    "PARK":            ("park",    "https://w3id.org/italia/onto/PARK/",            "PARK-AP_IT.ttl"),
    "POI":             ("poi",     "https://w3id.org/italia/onto/POI/",             "POI-AP_IT.ttl"),
    "POT":             ("pot",     "https://w3id.org/italia/onto/POT/",             "POT-AP_IT.ttl"),
    "Project":         ("prj",     "https://w3id.org/italia/onto/Project/",         "Project-AP_IT.ttl"),
    "PublicContract":  ("pc",      "https://w3id.org/italia/onto/PublicContract/",  "PublicContract-AP_IT.ttl"),
    "RO":              ("ro",      "https://w3id.org/italia/onto/RO/",              "RO-AP_IT.ttl"),
    "RPO":             ("rpo",     "https://w3id.org/italia/onto/RPO/",             "RPO-AP_IT.ttl"),
    "Route":           ("route",   "https://w3id.org/italia/onto/Route/",           "Route-AP_IT.ttl"),
    "SM":              ("sm",      "https://w3id.org/italia/onto/SM/",              "SM-AP_IT.ttl"),
    "TI":              ("ti",      "https://w3id.org/italia/onto/TI/",              "TI-AP_IT.ttl"),
    "Transparency":    ("tr",      "https://w3id.org/italia/onto/Transparency/",    "Transparency-AP_IT.ttl"),
    "l0":              ("l0",      "https://w3id.org/italia/onto/l0/",              "l0-AP_IT.ttl"),
}

# Ontologie NON in dati-semantic-assets — definite manualmente
MANUAL_ONTOS = {
    "GTFS": {
        "prefix": "gtfs",
        "source": "external:http://vocab.gtfs.org/terms",
        "classes": [
            "gtfs:Agency","gtfs:Calendar","gtfs:CalendarRule","gtfs:FareClass",
            "gtfs:FareRule","gtfs:Feed","gtfs:Frequency","gtfs:Route",
            "gtfs:Service","gtfs:Shape","gtfs:ShapePoint","gtfs:Stop",
            "gtfs:StopTime","gtfs:Transfer","gtfs:Trip"
        ],
        "objectProperties": [
            "gtfs:agency","gtfs:arrivalTime","gtfs:bikesAllowed","gtfs:block",
            "gtfs:departureTime","gtfs:dropOffType","gtfs:feed","gtfs:frequencyOf",
            "gtfs:headsign","gtfs:parentStation","gtfs:pickupType","gtfs:route",
            "gtfs:routeType","gtfs:service","gtfs:shape","gtfs:shapeDistTraveled",
            "gtfs:stop","gtfs:stopSequence","gtfs:timeZone","gtfs:trip",
            "gtfs:wheelchairAccessible"
        ],
        "datatypeProperties": [
            "gtfs:code","gtfs:color","gtfs:direction","gtfs:distanceTraveled",
            "gtfs:headway","gtfs:latitude","gtfs:longName","gtfs:longitude",
            "gtfs:shortName","gtfs:textColor","gtfs:zone"
        ]
    },
    "SMAPIT": {
        "prefix": "smapit",
        "source": "external:italian-school-AP_IT",
        "classes": [
            "smapit:School","smapit:HighSchool","smapit:PrimarySchool",
            "smapit:KindergartenSchool","smapit:ComprehensiveInstitute",
            "smapit:SchoolBuilding","smapit:SchoolClass"
        ],
        "objectProperties": [
            "smapit:hasManager","smapit:hasSchoolBuilding",
            "smapit:hasSchoolClass","smapit:isPartOf"
        ],
        "datatypeProperties": [
            "smapit:schoolCode","smapit:schoolType","smapit:schoolName",
            "smapit:numberOfStudents","smapit:numberOfTeachers"
        ]
    },
    "CulturalHeritage": {
        "prefix": "ch",
        "source": "wrapper-imports-arco:https://w3id.org/arco/ontology/arco",
        "note": "CulturalHeritage-AP_IT importa la rete ArCo. Classi principali da arco:",
        "classes": [
            "ch:CulturalHeritage","ch:CulturalProperty","ch:MovableCulturalProperty",
            "ch:ImmovableCulturalProperty","ch:ArchaeologicalProperty",
            "ch:HistoricOrArtisticProperty","ch:ArchitecturalOrLandscapeHeritage",
            "ch:PhotographicHeritage","ch:CatalogueRecord"
        ],
        "objectProperties": [
            "ch:hasProtection","ch:hasConstraint","ch:hasCatalogueRecord",
            "ch:isPartOf","ch:hasLocation"
        ],
        "datatypeProperties": [
            "ch:conservationStatus","ch:inventoryNumber","ch:catalogueCode"
        ]
    }
}

# ---------------------------------------------------------------------------
# Helper HTTP
# ---------------------------------------------------------------------------

def make_headers():
    h = {"Accept": "application/vnd.github.raw"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"token {GITHUB_TOKEN}"
    return h

def fetch_raw(url):
    req = urllib.request.Request(url, headers=make_headers())
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {url}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  Errore fetch {url}: {e}", file=sys.stderr)
        return None

def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "Authorization": f"token {GITHUB_TOKEN}" if GITHUB_TOKEN else "",
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        print(f"  Errore fetch JSON {url}: {e}", file=sys.stderr)
        return None

# ---------------------------------------------------------------------------
# Estrazione classi/proprietà da TTL
# ---------------------------------------------------------------------------

def extract_from_ttl(ttl, prefix, uri_base):
    """
    Estrae classi, ObjectProperty e DatatypeProperty da un TTL.
    Supporta sia sintassi con prefisso locale ':' che URI completi.
    """
    classes, obj_p, dat_p = set(), set(), set()

    patterns = [
        (classes, [
            rf'(?<!\w)(:{re.escape(prefix)}\w+|{prefix}:\w+)\s+(?:rdf:type|a)\s+owl:Class',
            rf'<{re.escape(uri_base)}(\w+)>\s+(?:rdf:type|a)\s+owl:Class',
            r'(?<!\w)(:\w+)\s+(?:rdf:type|a)\s+owl:Class',
        ]),
        (obj_p, [
            rf'(?<!\w)(:{re.escape(prefix)}\w+|{prefix}:\w+)\s+(?:rdf:type|a)\s+owl:ObjectProperty',
            rf'<{re.escape(uri_base)}(\w+)>\s+(?:rdf:type|a)\s+owl:ObjectProperty',
            r'(?<!\w)(:\w+)\s+(?:rdf:type|a)\s+owl:ObjectProperty',
        ]),
        (dat_p, [
            rf'(?<!\w)(:{re.escape(prefix)}\w+|{prefix}:\w+)\s+(?:rdf:type|a)\s+owl:DatatypeProperty',
            rf'<{re.escape(uri_base)}(\w+)>\s+(?:rdf:type|a)\s+owl:DatatypeProperty',
            r'(?<!\w)(:\w+)\s+(?:rdf:type|a)\s+owl:DatatypeProperty',
        ]),
    ]

    for target_set, pats in patterns:
        for pat in pats:
            for m in re.findall(pat, ttl):
                name = m if isinstance(m, str) else m
                if name.startswith(':'):
                    # Prefisso locale — converti in prefisso:nome
                    name = prefix + name  # es. ':Address' → 'clv:Address'
                elif name.startswith('<') or (not ':' in name):
                    # URI estratto come gruppo (solo la parte locale)
                    name = f"{prefix}:{name}"
                target_set.add(name)

    return sorted(classes), sorted(obj_p), sorted(dat_p)

# ---------------------------------------------------------------------------
# Trova il TTL nella directory latest
# ---------------------------------------------------------------------------

def find_ttl_url(onto_name, expected_fname):
    """Trova l'URL raw del TTL principale in Ontologie/{onto}/latest/"""
    api_url = f"{GITHUB_API}/repos/{SOURCE_REPO}/contents/Ontologie/{onto_name}/latest"
    files = fetch_json(api_url)
    if not files or not isinstance(files, list):
        return None

    # Prima prova il nome atteso
    for f in files:
        if f["name"] == expected_fname:
            return f"{GITHUB_API}/repos/{SOURCE_REPO}/contents/Ontologie/{onto_name}/latest/{f['name']}"

    # Fallback: primo TTL che non sia aligns/DBGT
    for f in files:
        if (f["name"].endswith(".ttl")
                and "aligns" not in f["name"]
                and "DBGT" not in f["name"]
                and "example" not in f["name"].lower()):
            return f"{GITHUB_API}/repos/{SOURCE_REPO}/contents/Ontologie/{onto_name}/latest/{f['name']}"

    return None

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Rigenerazione ontology_index.json — {datetime.now(timezone.utc).isoformat()}")
    print(f"Sorgente: github.com/{SOURCE_REPO}")
    print()

    index = {}
    errors = []
    ok_count = 0

    # ── Ontologie da dati-semantic-assets ─────────────────────────────────
    for onto_name, (prefix, uri_base, expected_fname) in ONTO_CONFIGS.items():
        if uri_base is None:
            # Gestita come manuale (CulturalHeritage)
            continue

        print(f"  {onto_name}...", end=" ", flush=True)
        ttl_url = find_ttl_url(onto_name, expected_fname)
        if not ttl_url:
            print("✗ TTL non trovato")
            errors.append(f"{onto_name}: TTL non trovato")
            continue

        ttl = fetch_raw(ttl_url)
        if not ttl:
            print("✗ fetch fallito")
            errors.append(f"{onto_name}: fetch fallito")
            continue

        fname = ttl_url.split("/")[-1]
        classes, obj_p, dat_p = extract_from_ttl(ttl, prefix, uri_base)

        index[onto_name] = {
            "prefix": prefix,
            "uri_base": uri_base,
            "ttl_file": fname,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "classes": classes,
            "objectProperties": obj_p,
            "datatypeProperties": dat_p
        }
        print(f"✓ {len(classes)}c {len(obj_p)}o {len(dat_p)}d")
        ok_count += 1

    # ── Ontologie manuali ─────────────────────────────────────────────────
    print()
    print("  Aggiunta ontologie manuali (GTFS, SMAPIT, CulturalHeritage)...")
    for onto_name, data in MANUAL_ONTOS.items():
        index[onto_name] = {
            "prefix": data["prefix"],
            "uri_base": data.get("source", "manual"),
            "ttl_file": data.get("source", "manual"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "classes": data.get("classes", []),
            "objectProperties": data.get("objectProperties", []),
            "datatypeProperties": data.get("datatypeProperties", []),
        }
        if "note" in data:
            index[onto_name]["note"] = data["note"]
        nc = len(data.get("classes", []))
        no = len(data.get("objectProperties", []))
        nd = len(data.get("datatypeProperties", []))
        print(f"  {onto_name}: ✓ {nc}c {no}o {nd}d (manuale)")
        ok_count += 1

    # ── Salvataggio ───────────────────────────────────────────────────────
    print()
    print(f"Ontologie OK: {ok_count} / {len(ONTO_CONFIGS) + len(MANUAL_ONTOS)}")
    if errors:
        print(f"Errori ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")

    # Calcola statistiche totali
    total_classes = sum(len(v.get("classes", [])) for v in index.values())
    total_props = sum(
        len(v.get("objectProperties", [])) + len(v.get("datatypeProperties", []))
        for v in index.values()
    )

    # Aggiunge metadata globale
    result = {
        "_meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": f"github.com/{SOURCE_REPO}",
            "total_ontologies": len(index),
            "total_classes": total_classes,
            "total_properties": total_props,
            "errors": errors
        },
        **index
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    size_kb = round(os.path.getsize(OUTPUT_FILE) / 1024, 1)
    print(f"\nSalvato: {OUTPUT_FILE} ({size_kb} KB)")
    print(f"  {total_classes} classi totali, {total_props} proprietà totali")

    if errors:
        sys.exit(1)

if __name__ == "__main__":
    main()

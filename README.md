# CSV→RDF — Convertitore PA Italiana

Converte CSV della Pubblica Amministrazione italiana in **RDF/Turtle** conforme alle ontologie [dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

🔗 **[Tool online](https://piersoft.github.io/CSV-to-RDF/)** · 📋 **[Guida ontologie](https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html)** · 🔌 **[API](https://csv2rdf.datigovit.workers.dev/)**

---

## 🆕 v2026.03.23.186 — 29 ontologie supportate

### Nuove ontologie aggiunte
| Ontologia | Prefisso | Trigger CSV principali |
|---|---|---|
| **CPEV** — Core Public Event Vocabulary | `cpev:` | `titolo_evento`, `pubblico_target`, `format_evento` |
| **AccessCondition** — Condizioni accesso | `ac:` | `orario_apertura`, `tipo_ammissione`, `motivazione_chiusura` |
| **AtlasOfPaths** — Atlante percorsi | `aop:` | `numero_percorso`, `pavimentazione`, `segnaletica` |
| **CulturalHeritage** — Beni culturali vincolati | `ch:` | `codice_bene`, `tutela`, `vincolo` |
| **Project** — Progetti pubblici (PNRR/FESR) | `prj:` | `acronimo_progetto`, `programma_finanziamento`, `cup` |
| **MU** — Unità di misura | `mu:` | `grandezza`, `tipo_misura`, `sistema_misura` |
| **NDC** — National Data Catalog | `ndc:` | `concetto_chiave`, `endpoint_url` |

### Tutte le ontologie supportate (29)

| # | Ontologia | Prefisso | Descrizione |
|---|---|---|---|
| 1 | **CLV** | `clv:` | Core Location Vocabulary — indirizzi, strade |
| 2 | **POI** | `poi:` | Point Of Interest — luoghi geolocalizzati |
| 3 | **COV** | `cov:` | Core Organization Vocabulary — enti pubblici |
| 4 | **CPV** | `cpv:` | Core Person Vocabulary — persone fisiche |
| 5 | **TI** | `ti:` | Time Indexed — eventi temporali |
| 6 | **L0** | `l0:` | Top Ontology — classi base (sempre inclusa) |
| 7 | **SM** | `sm:` | Social Media — contatti digitali |
| 8 | **SMAPIT** | `smapit:` | Scuole italiane MIUR |
| 9 | **IoT** | `iot:` | Sensori e rilevazioni ambientali |
| 10 | **ACCO** | `acco:` | Strutture ricettive (hotel, B&B) |
| 11 | **CPSV/CPSV-AP** | `cpsv:` | Servizi pubblici al cittadino |
| 12 | **GTFS** | `gtfs:` | Trasporto pubblico (fermate, linee) |
| 13 | **QB** | `qb:` | RDF Data Cube — dati statistici |
| 14 | **Cultural-ON** | `cis:` | Istituti culturali (musei, biblioteche) |
| 15 | **RO** | `ro:` | Role Ontology — incarichi istituzionali |
| 16 | **ADMS** | `adms:` | Asset semantici PA |
| 17 | **PARK** | `park:` | Parcheggi pubblici |
| 18 | **PublicContract** | `pc:` | Appalti pubblici (CIG/CUP) |
| 19 | **Route** | `route:` | Percorsi/itinerari |
| 20 | **RPO** | `rpo:` | Personale PA (contratti, qualifiche) |
| 21 | **Learning** | `learn:` | Corsi e formazione PA |
| 22 | **Transparency** | `tr:` | Obblighi trasparenza D.Lgs 33/2013 |
| 23 | **Indicator** | `indicator:` | KPI e indicatori di performance |
| 24 | **POT** | `pot:` | Prezzi e tariffe |
| 25 | **CPEV** | `cpev:` | Core Public Event Vocabulary |
| 26 | **AccessCondition** | `ac:` | Condizioni di accesso a luoghi |
| 27 | **AtlasOfPaths** | `aop:` | Atlante dei percorsi (trekking, ciclovie) |
| 28 | **CulturalHeritage** | `ch:` | Beni culturali vincolati MiC |
| 29 | **Project** | `prj:` | Progetti pubblici (PNRR, FESR, PON) |

> **MU** (Unità di misura) e **NDC** (National Data Catalog) supportati come ontologie aggiuntive.

---

## 📋 CSV sacri — dataset di riferimento

Il tool include **29 CSV sacri** (22 storici + 7 nuovi) validati per verificare il rilevamento corretto delle ontologie:

```
22/22 sacri storici ✅
 7/7 nuovi ontologie v186 ✅
 2/2 regressioni (stradario CLV, DAE OSM) ✅
```

---

## 🚀 Uso rapido

### Tool web
```
https://piersoft.github.io/CSV-to-RDF/
```

### API REST (Cloudflare Worker)
```bash
# Converti URL CSV → Turtle
curl "https://csv2rdf.datigovit.workers.dev/?url=https://esempio.it/dataset.csv"

# Con opzioni
curl "https://csv2rdf.datigovit.workers.dev/" \
  -H "Content-Type: text/csv" \
  --data-binary @mio_dataset.csv
```

---

## 📦 File principali

| File | Descrizione |
|---|---|
| `index.html` | Tool web completo (single-file) |
| `worker.js` | Cloudflare Worker API |
| `fixtures_v9.json` | Corpus 289 dataset PA reali |
| `test_22sacri.mjs` | Test suite Node.js (29 CSV sacri) |
| `dataset-ottimali-PA.html` | Guida visuale alle 29 ontologie |

---

## 🔧 Come funziona

1. **Carica** il CSV (upload, incolla, URL, o scegli dal corpus di 289 dataset reali)
2. **Rilevamento automatico** delle ontologie dai nomi delle colonne e valori campione
3. **Generazione TTL** deterministico con prefissi, URI, triple e tipi XSD corretti
4. **Validazione** inline: prefissi, lat/lon, @lang, valori tipizzati
5. **Scarica** il file `.ttl` o copia negli appunti

---

## 🧪 Test locali

```bash
node test_22sacri.mjs
```

Output atteso:
```
✅ OK: 22/22  ❌ Problemi: 0
🎉 TUTTI I 22 CSV SACRI PASSANO IL TEST!
✅ Tutte 7/7 nuove ontologie OK
✅ REGRESSIONE stradario (CLV puro): [CLV]
✅ REGRESSIONE OSM DAE (POI): [CLV, POI]
```

**Struttura della suite:**
- **22 CSV sacri** — un CSV di riferimento per ognuna delle 22 ontologie originali. Verifica che il motore rilevi l'ontologia corretta.
- **7 nuove ontologie** — CSV sacri per CPEV, AccessCondition, AtlasOfPaths, CulturalHeritage, Project, MU, NDC.
- **2 test di regressione anti-bug** — verificano che bug reali trovati in produzione non ricompaiano:
  - *stradario CLV puro*: CSV toponomastico con colonna `Comune` — verifica che il motore non aggiunga `COV` spurio (il nome del comune nei valori triggerava erroneamente l'ontologia delle organizzazioni PA).
  - *OSM DAE*: CSV con schema OpenStreetMap (`osm_id`, `osm_type`, `name`) — verifica che il motore rilevi `POI` e non `SMAPIT` (i valori come "Scuola Media" nel campo `name` triggeravano erroneamente l'ontologia scolastica).

---

## 📚 Riferimenti

- [dati-semantic-assets](https://github.com/italia/dati-semantic-assets) — Ontologie ufficiali PA italiana
- [schema.gov.it](https://schema.gov.it) — National Data Catalog
- [W3C RDF/Turtle](https://www.w3.org/TR/turtle/) — Specifiche formato
- [RDF Data Cube](https://www.w3.org/TR/vocab-data-cube/) — Dati statistici
- [ckan-mcp-server](https://github.com/ondata/ckan-mcp-server/) — MCP server per CKAN, sviluppato da [ondata](https://github.com/ondata) — usato per il proxy SPARQL verso schema.gov.it

---

Licenza MIT — Piersoft

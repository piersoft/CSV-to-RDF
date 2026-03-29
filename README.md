# CSV → RDF/TTL — Linked Open Data per la PA Italiana

Trasforma i CSV della Pubblica Amministrazione italiana in **RDF/Turtle** conforme alle ontologie ufficiali [dati-semantic-assets](https://github.com/italia/dati-semantic-assets) e ai vocabolari controllati di [schema.gov.it](https://schema.gov.it).

---

## 🔗 Link rapidi

| | |
|---|---|
| ⚡ **Tool online** | [piersoft.github.io/CSV-to-RDF](https://piersoft.github.io/CSV-to-RDF/) |
| 📖 **Guida completa per la PA** | [piersoft.github.io/CSV-to-RDF/guida.html](https://piersoft.github.io/CSV-to-RDF/guida.html) |
| 📚 **Catalogo dataset ottimali** | [piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html](https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html) |
| 🔌 **API REST** | [csv2rdf.datigovit.workers.dev](https://csv2rdf.datigovit.workers.dev/) |

---

## ✨ Caratteristiche principali

- **Zero installazione** — singola pagina HTML, gira nel browser
- **Rilevamento automatico** delle ontologie da header e valori del CSV
- **39 template di esempio** coperenti tutti i 13 temi DCAT
- **330 fixture** di training da CSV PA reali
- **33 CSV sacri** con test automatici a ogni build
- **Vocabolari controllati** ufficiali da schema.gov.it (URI tipizzati per forma giuridica, ATECO, sesso, licenze, comuni...)
- **AI opzionale** (STEP 2) con Mistral, Groq, Gemini per colonne non standard
- **Link dati.gov.it** (STEP 1 BIS) per arricchire il detect dai metadati DCAT

---

## 🚀 Come funziona

```
STEP 1   → Carica o incolla il CSV
STEP 1b  → (opz.) Link dataset su dati.gov.it — migliora il detect
AUTO     → Rilevamento deterministico delle ontologie
STEP 2   → (opz.) AI-Detect con chiave API per colonne non standard
STEP 3   → Inserisci il codice IPA della PA
STEP 4   → Clicca "Genera TTL" → scarica il file .ttl
```

---

## 🗂 Ontologie supportate

Il tool copre **29 ontologie** delle dati-semantic-assets:

| Categoria | Ontologie |
|---|---|
| **Geografiche** | CLV, POI, PARK, Route, AtlasOfPaths |
| **Organizzazioni** | COV, SMAPIT |
| **Persone** | CPV, RO, RPO |
| **Temporali** | TI, CPEV |
| **Dati** | QB, IoT, MU, Indicator |
| **Servizi PA** | CPSV, PublicContract, Transparency |
| **Cultura** | CulturalON, CulturalHeritage, Learning |
| **Trasporti** | GTFS |
| **Turismo** | ACCO, POT, AccessCondition |
| **Metadati** | ADMS, NDC, Project |

---

## 📦 File principali

| File | Descrizione |
|---|---|
| `index.html` | Tool web completo (~5600 righe, single-file) |
| `worker.js` | Cloudflare Worker — API REST e motore deterministico |
| `fixtures_v9.json` | Corpus 330 fixture da CSV PA reali (13 temi DCAT) |
| `dataset-ottimali-PA.html` | Catalogo visuale delle ontologie con esempi colonne |
| `guida.html` | Guida completa per la PA (7 sezioni, slide-like) |
| `test_22sacri.mjs` | 33 test automatici del rilevamento ontologie |

---

## 🔧 API REST

```bash
# Converti un CSV da URL → Turtle
curl "https://csv2rdf.datigovit.workers.dev/?url=https://esempio.it/dataset.csv"

# Converti un file CSV locale
curl "https://csv2rdf.datigovit.workers.dev/" \
  -H "Content-Type: text/csv" \
  --data-binary @mio_dataset.csv
```

---

## 🧪 Test automatici

```bash
node test_22sacri.mjs
# ✅ OK: 33/33 ❌ Problemi: 0
# 🎉 TUTTI I 33 CSV SACRI PASSANO IL TEST!
```

I test verificano che il rilevamento deterministico produca le ontologie corrette per 33 CSV tipici della PA italiana, coprono tutti i 13 temi DCAT (HEAL, TRAN, ENVI, AGRI, JUST, SOCI, EDUC, ENER, REGI, SCIE, GOVE, ECON, TECH).

---

## 📚 Standard e riferimenti

- [dati-semantic-assets](https://github.com/italia/dati-semantic-assets) — Ontologie ufficiali PA italiana (dati-semantic-assets)
- [schema.gov.it](https://schema.gov.it) — Catalogo Nazionale Dati: 336 risorse (73 ontologie, 168 vocabolari, 95 schemi)
- [dati.gov.it](https://www.dati.gov.it) — Catalogo nazionale open data PA
- [DCAT-AP_IT](https://docs.italia.it/italia/daf/linee-guida-cataloghi-dati-dcat-ap-it/) — Profilo italiano DCAT
- [W3C RDF/Turtle](https://www.w3.org/TR/turtle/) — Specifiche formato output
- [RDF Data Cube](https://www.w3.org/TR/vocab-data-cube/) — Dati statistici aggregati
- [ckan-mcp-server](https://github.com/ondata/ckan-mcp-server/) — MCP server CKAN di [ondata](https://github.com/ondata)

---

## 📄 Licenza

MIT — [Piersoft](https://github.com/piersoft)

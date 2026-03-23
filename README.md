# CSV→RDF — Convertitore PA Italiana

Converte CSV della Pubblica Amministrazione italiana in **RDF/Turtle** conforme alle ontologie [dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

🔗 **[Tool online](https://piersoft.github.io/CSV-to-RDF/)** · 📋 **[Guida ontologie](https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html)** · 🔌 **[API](https://csv2rdf.datigovit.workers.dev/)**

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

1. **Carica** il CSV — incolla il testo o carica un file `.csv`, oppure scegli uno dei 29 modelli di esempio per ontologia
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

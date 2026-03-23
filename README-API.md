# CSV→RDF API — Documentazione Worker

Il worker Cloudflare espone un'API HTTP che converte qualsiasi CSV pubblico in Turtle/RDF usando lo stesso motore deterministico della demo web.

**Endpoint pubblico:** `https://csv2rdf.datigovit.workers.dev/`
**Demo web:** `https://piersoft.github.io/CSV-to-RDF/`

---

## Utilizzo rapido

```
GET https://csv2rdf.datigovit.workers.dev/?url={URL_CSV}&ipa={codice_ipa}&pa={nome_ente}
```

### Parametri

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:-----------:|-------------|
| `url` | string | ✅ | URL pubblico del file CSV (deve essere accessibile senza login) |
| `ipa` | string | no | Codice IPA dell'ente (es. `c_a662`). Usato per costruire gli URI RDF |
| `pa` | string | no | Nome esteso dell'ente (es. `Comune di Bari`). Incluso nei commenti del TTL |
| `onto` | string | no | Forzare ontologie specifiche, separate da virgola (es. `POI,CLV,L0`) |
| `fmt` | string | no | Formato output: `ttl` (default) oppure `json` |

---

## Esempi

### TTL puro (download diretto)

```bash
curl "https://csv2rdf.datigovit.workers.dev/?url=https://www.dati.lombardia.it/api/views/r2fj-jmpm/rows.csv?accessType=DOWNLOAD&ipa=c_d286&pa=Comune+di+Desio"
```

Risposta (`Content-Type: text/turtle`):
```turtle
# CSV→RDF — 2026-03-23T10:00:00.000Z
# Sorgente: https://www.dati.lombardia.it/...
# Ente: Comune di Desio (c_d286)
# Ontologie: CLV, POI, L0

@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix poi: <https://w3id.org/italia/onto/POI/> .
...
```

### Risposta JSON con metadati

```bash
curl "https://csv2rdf.datigovit.workers.dev/?url=https://esempio.it/dati.csv&fmt=json"
```

```json
{
  "meta": {
    "csvUrl": "https://esempio.it/dati.csv",
    "ipa": "ente",
    "pa": "Ente Pubblico",
    "ontologie": ["CLV", "POI", "L0"],
    "righe": 42,
    "colonne": ["id", "nome", "lat", "lon", "comune"],
    "generato": "2026-03-23T10:00:00.000Z",
    "versione": "v2026.03.23.171"
  },
  "ttl": "@prefix rdfs: ..."
}
```

### Forzare ontologie specifiche

```bash
curl "https://csv2rdf.datigovit.workers.dev/?url=https://esempio.it/dati.csv&onto=TI,CLV,L0&ipa=c_a662"
```

### Health check

```bash
curl "https://csv2rdf.datigovit.workers.dev/health"
# {"status":"ok","version":"v2026.03.23.171"}
```

---

## Header di risposta

Il TTL viene restituito con header utili per l'integrazione:

| Header | Valore esempio | Descrizione |
|--------|----------------|-------------|
| `Content-Type` | `text/turtle; charset=utf-8` | Formato Turtle |
| `Content-Disposition` | `attachment; filename="c_a662-1711188000000.ttl"` | Nome file download |
| `X-Ontologie` | `CLV,POI,L0` | Ontologie rilevate |
| `X-Righe` | `42` | Numero di righe convertite |
| `Access-Control-Allow-Origin` | `*` | CORS abilitato per tutti |

---

## Integrazione con aggiornamenti automatici

### Cron job

```bash
# /etc/cron.d/csv2rdf
# Aggiorna il TTL ogni notte alle 3:00
0 3 * * * www-data curl -sf -o /var/www/opendata/defibrillatori.ttl \
  "https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662&pa=Comune+di+Bari" \
  || echo "CSV2RDF update failed" | mail -s "Alert" admin@comune.bari.it
```

### GitHub Actions

```yaml
name: Aggiorna TTL
on:
  schedule:
    - cron: '0 3 * * *'  # ogni notte alle 3:00
  workflow_dispatch:       # oppure manuale

jobs:
  update-ttl:
    runs-on: ubuntu-latest
    steps:
      - name: Genera TTL aggiornato
        run: |
          curl -sf -o data/defibrillatori.ttl \
            "https://csv2rdf.datigovit.workers.dev/?url=${{ vars.CSV_URL }}&ipa=${{ vars.IPA }}&pa=${{ vars.PA_NAME }}"
      - name: Commit TTL aggiornato
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "Auto: aggiorna TTL da CSV sorgente"
```

### Integrazione DCAT-AP_IT

```turtle
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dct:  <http://purl.org/dc/terms/> .

<https://comune.bari.it/opendata/dataset/defibrillatori> a dcat:Dataset ;
  dct:title "Defibrillatori DAE"@it ;
  dcat:distribution
    <https://comune.bari.it/opendata/dataset/defibrillatori/dist/csv> ,
    <https://comune.bari.it/opendata/dataset/defibrillatori/dist/ttl> .

# Distribuzione CSV originale
<https://comune.bari.it/opendata/dataset/defibrillatori/dist/csv> a dcat:Distribution ;
  dcat:downloadURL <https://comune.bari.it/opendata/defibrillatori.csv> ;
  dct:format <http://publications.europa.eu/resource/authority/file-type/CSV> .

# Distribuzione TTL dinamica via API
<https://comune.bari.it/opendata/dataset/defibrillatori/dist/ttl> a dcat:Distribution ;
  dcat:accessURL <https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662> ;
  dct:format <http://publications.europa.eu/resource/authority/file-type/RDF_TURTLE> ;
  dct:license <https://creativecommons.org/licenses/by/4.0/> .
```

---

## Deploy della propria istanza

### Metodo 1 — Editor online Cloudflare (più semplice)

1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Clicca **"Start with Hello World!"**
3. Assegna un nome (es. `csv2rdf`), clicca **Deploy**
4. Clicca **Edit code**
5. Seleziona tutto (`Ctrl+A`), cancella, incolla il contenuto di [`worker.js`](worker.js)
6. Clicca **Deploy**

Il tuo endpoint: `https://csv2rdf.{tuo-account}.workers.dev/`

### Metodo 2 — Wrangler CLI (per aggiornamenti automatici da terminale)

```bash
npm install -g wrangler
wrangler login
wrangler deploy worker.js --name csv2rdf --compatibility-date 2024-01-01
```

### Metodo 3 — GitHub Actions automatico

Aggiungi alla repo il file `.github/workflows/deploy-worker.yml`:

```yaml
name: Deploy Cloudflare Worker
on:
  push:
    branches: [main]
    paths: ['worker.js']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy worker.js --name csv2rdf --compatibility-date 2024-01-01
```

Per il token: Cloudflare Dashboard → My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers" → copia il token → GitHub repo → Settings → Secrets → `CLOUDFLARE_API_TOKEN`.

---

## Limiti

| Limite | Piano gratuito | Piano Paid ($5/mese) |
|--------|---------------|----------------------|
| Richieste/giorno | 100.000 | illimitate |
| Dimensione CSV | ~10 MB | ~10 MB |
| Timeout | 30 secondi | 30 secondi |
| Cache CSV | 5 minuti | 5 minuti |

> Il worker usa la cache di Cloudflare (`cacheTtl: 300`): lo stesso CSV scaricato entro 5 minuti non viene ri-fetchato, riducendo la latenza e il carico sul server sorgente.

---

## Versione e compatibilità

- **Versione motore:** v2026.03.23.171
- **Ontologie supportate:** 22 (CLV, COV, CPV, POI, RO, TI, ADMS, ACCO, GTFS, Cultural-ON, SMAPIT, IoT, QB, PARK, PublicContract, Route, RPO, Learning, Transparency, Indicator, POT, CPSV-AP)
- **Encoding CSV supportati:** UTF-8, UTF-8 con BOM, Latin-1/ISO-8859-1, CP1252
- **Separatori CSV supportati:** `,` `;` `\t` `|` (rilevamento automatico)
- **Runtime:** Cloudflare Workers (V8 isolate, non Node.js)

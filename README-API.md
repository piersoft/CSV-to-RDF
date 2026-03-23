# CSV→RDF API — Endpoint Dinamico

Converte automaticamente un CSV pubblico in Turtle/RDF usando le ontologie OntoPiA della PA italiana.

## Come funziona

1. **Pubblica il tuo CSV** su un URL pubblico (es. GitHub, dati.gov.it, portale opendata del comune)
2. **Testa il CSV** su https://piersoft.github.io/CSV-to-RDF/ per verificare la conversione
3. **Usa l'endpoint dinamico** per ottenere il TTL sempre aggiornato automaticamente

## Endpoint

```
GET https://csv2rdf.piersoft.workers.dev/?url={URL_DEL_CSV}
```

### Parametri

| Parametro | Obbligatorio | Descrizione | Esempio |
|-----------|-------------|-------------|---------|
| `url`     | ✅ sì | URL pubblico del file CSV | `url=https://comune.it/dati.csv` |
| `ipa`     | opzionale | Codice IPA dell'ente | `ipa=c_a662` |
| `pa`      | opzionale | Nome esteso dell'ente | `pa=Comune+di+Bari` |
| `onto`    | opzionale | Forzare ontologie (virgola separato) | `onto=POI,CLV,L0` |
| `fmt`     | opzionale | Formato output: `ttl` (default) o `json` | `fmt=json` |

### Esempi

```bash
# TTL puro (per aggiornamento catalogo)
curl "https://csv2rdf.piersoft.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662&pa=Comune+di+Bari"

# JSON con metadati
curl "https://csv2rdf.piersoft.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&fmt=json"

# Forzare ontologie specifiche
curl "https://csv2rdf.piersoft.workers.dev/?url=https://comune.bari.it/opendata/eventi.csv&onto=TI,CLV,L0&ipa=c_a662"

# Health check
curl "https://csv2rdf.piersoft.workers.dev/health"
```

### Integrazione DCAT-AP_IT

Aggiungere la distribuzione TTL dinamica al catalogo DCAT del proprio portale:

```turtle
<https://comune.bari.it/opendata/dataset/defibrillatori> a dcat:Dataset ;
  dcat:distribution <https://comune.bari.it/opendata/dataset/defibrillatori/dist/csv> ,
                    <https://comune.bari.it/opendata/dataset/defibrillatori/dist/ttl> .

<https://comune.bari.it/opendata/dataset/defibrillatori/dist/ttl> a dcat:Distribution ;
  dcat:accessURL <https://csv2rdf.piersoft.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662> ;
  dct:format <http://publications.europa.eu/resource/authority/file-type/RDF_TURTLE> ;
  dct:license <https://creativecommons.org/licenses/by/4.0/> .
```

### Integrazione con aggiornamenti automatici

Se il CSV si aggiorna automaticamente (es. ogni notte da un processo ETL), il TTL sarà sempre sincronizzato:

```bash
# Script cron per aggiornare il catalogo ogni notte
# 0 3 * * * curl -o /var/www/opendata/defibrillatori.ttl \
#   "https://csv2rdf.piersoft.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662&pa=Comune+di+Bari"
```

## Deploy del proprio Worker (opzionale)

Se preferisci deployare il worker sulla tua infrastruttura Cloudflare:

```bash
# 1. Installa Wrangler CLI
npm install -g wrangler

# 2. Login a Cloudflare
wrangler login

# 3. Deploy
wrangler deploy worker.js --name csv2rdf

# Il tuo endpoint sarà: https://csv2rdf.{tuo-account}.workers.dev
```

### Requisiti

- Account Cloudflare gratuito
- Il CSV sorgente deve essere pubblicamente accessibile (nessun login richiesto)
- CORS abilitato: il worker risponde a richieste cross-origin

## Motore di conversione

Il worker usa lo stesso motore deterministico dell'interfaccia web:

- **Rilevamento automatico** delle ontologie OntoPiA (CLV, POI, COV, CPV, GTFS, QB, ...)
- **Generazione URI** secondo le best practice dati.gov.it
- **22 ontologie** supportate: CLV, COV, CPV, L0, POI, SM, RO, TI, ADMS, ACCO, GTFS, CulturalON, CPSV/CPSV-AP, QB, PublicContract, Route, RPO, Learning, Transparency, Indicator, POT, PARK
- **Versione**: v2026.03.20.169

## Limiti

| Limite | Valore |
|--------|--------|
| Dimensione CSV max | 10 MB (limite Cloudflare Workers gratuito) |
| Timeout | 30 secondi |
| Request al giorno (piano gratuito) | 100.000 |
| Cache | 5 minuti (TTL cached automaticamente) |

Per CSV più grandi o volumi elevati, considera il piano Workers Paid ($5/mese).

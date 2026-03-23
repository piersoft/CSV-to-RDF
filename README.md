# CSV to RDF/TTL — Linked Open Data PA

Strumento web per trasformare dataset CSV della Pubblica Amministrazione italiana in file RDF/Turtle (.ttl), arricchendo i dati con le ontologie ufficiali di [dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

**Demo live:** https://piersoft.github.io/CSV-to-RDF/
**API dinamica:** https://csv2rdf.datigovit.workers.dev/

---

## Come funziona

Lo strumento usa un **motore deterministico** basato su 274 dataset reali di dati.gov.it per mappare le colonne CSV sui predicati RDF corretti — **senza AI, senza account, senza costi**.

### Procedimento in 4 passi

**STEP 1 — Incolla il CSV**
Incolla il contenuto del tuo CSV (con intestazioni nella prima riga) oppure carica un file `.csv`. Usa il menu **"Carica esempio"** per vedere i 22 CSV di riferimento per ontologia.

**STEP 2 (OPZIONALE) — Provider AI**
Inserisci una API key per attivare **AI-Detect** e la generazione TTL avanzata. Completamente facoltativo — lo strumento funziona senza.

**STEP 3 — Metadati ente**
Inserisci il **codice IPA** e il nome dell'ente titolare. Vengono usati per costruire gli URI RDF (`https://w3id.org/italia/data/{ipa}/...`).

**STEP 4 — Genera TTL**
Clicca **"Genera TTL"**: generazione istantanea con il motore deterministico, oppure con l'AI se hai inserito una API key. Poi scarica il `.ttl` o copialo negli appunti.

---

## 🔗 API dinamica — TTL sempre aggiornato

Nella pagina, la sezione **"🔗 Endpoint TTL dinamico"** ti permette di incollare l'URL pubblico del tuo CSV e ottenere un **endpoint permanente** che restituisce sempre il TTL aggiornato ad ogni chiamata — automaticamente.

### Endpoint pubblico (pronto all'uso)

```
GET https://csv2rdf.datigovit.workers.dev/?url={URL_CSV}
```

**Parametri:**

| Parametro | Obbligatorio | Descrizione | Esempio |
|-----------|:-----------:|-------------|---------|
| `url` | ✅ | URL pubblico del CSV | `url=https://comune.it/dati.csv` |
| `ipa` | no | Codice IPA dell'ente | `ipa=c_a662` |
| `pa` | no | Nome esteso dell'ente | `pa=Comune+di+Bari` |
| `onto` | no | Forzare ontologie | `onto=POI,CLV,L0` |
| `fmt` | no | `ttl` (default) o `json` | `fmt=json` |

**Esempi:**

```bash
# TTL puro
curl "https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662&pa=Comune+di+Bari"

# Risposta JSON con metadati + TTL
curl "https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&fmt=json"

# Health check
curl "https://csv2rdf.datigovit.workers.dev/health"
```

### Integrazione con aggiornamenti automatici

Se il CSV si aggiorna periodicamente (es. ogni notte da un processo ETL), il TTL sarà sempre sincronizzato:

```bash
# Cron: aggiorna il TTL ogni notte alle 3:00
0 3 * * * curl -o /var/www/opendata/defibrillatori.ttl \
  "https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662&pa=Comune+di+Bari"
```

### Integrazione DCAT-AP_IT

Aggiungi la distribuzione TTL dinamica al catalogo DCAT del tuo portale:

```turtle
<https://comune.bari.it/opendata/dataset/defibrillatori/dist/ttl> a dcat:Distribution ;
  dcat:accessURL <https://csv2rdf.datigovit.workers.dev/?url=https://comune.bari.it/opendata/defibrillatori.csv&ipa=c_a662> ;
  dct:format <http://publications.europa.eu/resource/authority/file-type/RDF_TURTLE> ;
  dct:license <https://creativecommons.org/licenses/by/4.0/> .
```

### Creare la propria istanza su Cloudflare (opzionale)

Se preferisci un endpoint sotto il tuo account Cloudflare (gratuito, 100.000 req/giorno):

1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Scegli **"Start with Hello World!"** — non "Continue with GitHub"
3. Assegna un nome (es. `csv2rdf`), clicca **Deploy**
4. Clicca **Edit code**, seleziona tutto (`Ctrl+A`), cancella
5. Incolla il contenuto di [`worker.js`](worker.js) e clicca **Deploy**

Il tuo endpoint sarà: `https://csv2rdf.{tuo-account}.workers.dev/`

> Piano gratuito Cloudflare: 100.000 richieste/giorno, CSV fino a ~10 MB, timeout 30 secondi.

---

## Ontologie supportate (22)

| Ontologia | Prefisso | Classe principale | Descrizione |
|-----------|----------|-------------------|-------------|
| **CLV** | `clv:` | `clv:Address` | Indirizzi e luoghi |
| **COV** | `cov:` | `cov:PublicOrganization` | Organizzazioni PA |
| **CPV** | `cpv:` | `cpv:Person` | Persone fisiche |
| **POI** | `poi:` | `poi:PointOfInterest` | Punti di interesse |
| **RO** | `ro:` | `ro:Role` | Ruoli istituzionali/politici |
| **TI** | `ti:` | `l0:EventOrSituation` | Intervalli ed eventi temporali |
| **ADMS** | `adms:` | `adms:SemanticAsset` | Asset semantici e cataloghi |
| **ACCO** | `acco:` | `acco:Accommodation` | Strutture ricettive |
| **GTFS** | `gtfs:` | `gtfs:Stop` | Trasporto pubblico locale |
| **Cultural-ON** | `cis:` | `cis:CulturalInstituteOrSite` | Beni culturali, musei, biblioteche |
| **SMAPIT** | `smapit:` | `smapit:School` | Strutture scolastiche |
| **IoT** | `iot:` | `iot:Sensor` | Sensori e misurazioni IoT |
| **QB** | `qb:` | `qb:Observation` | Dati statistici e serie storiche |
| **PARK** | `park:` | `park:ParkingFacility` | Parcheggi e aree di sosta |
| **PublicContract** | `pc:` | `pc:Contract` | Contratti pubblici e appalti |
| **Route** | `route:` | `route:Route` | Percorsi ed itinerari |
| **RPO** | `rpo:` | `rpo:RoleInOrganization` | Risorse umane PA |
| **Learning** | `learn:` | `learn:Course` | Corsi e attività formative |
| **Transparency** | `tr:` | `tr:TransparencyObligation` | Obblighi D.Lgs. 33/2013 |
| **Indicator** | `indicator:` | `indicator:Indicator` | Indicatori e KPI |
| **POT** | `pot:` | `pot:PriceSpecification` | Prezzi e tariffe servizi |
| **CPSV-AP** | `cpsv:` | `cpsv:PublicService` | Servizi pubblici |

> **Distinzioni importanti:**
> - `PublicContract` → appalti (CIG, importi, aggiudicatari). `CPSV-AP` → servizi pubblici generici.
> - `Route` → percorsi escursionistici/ciclabili. `GTFS` → trasporto pubblico (fermate, corse).
> - `RPO` → personale dipendente PA. `RO` → ruoli politici e istituzionali.
> - `Indicator` → KPI e indicatori di performance. `QB` → serie storiche statistiche generiche.

---

## Colonne standard per ontologia

| Ontologia | Colonne obbligatorie | Colonne standard |
|-----------|---------------------|-----------------|
| **ACCO** | id, denominazione, lat, lon | tipo_struttura, posti_letto, stelle, email, indirizzo, comune |
| **GTFS** | stop_id, stop_name, stop_lat, stop_lon | zone_id, location_type, route_id, agency_id |
| **POI** | id, nome, lat, lon | tipo_poi, indirizzo, comune, accessibile |
| **IoT** | id, id_sensore, lat, lon | tipo_sensore, valore, unita_misura, data_rilevazione |
| **COV** | id, denominazione, codice_ipa | tipo_ente, comune, provincia, email |
| **CPV** | id, nome, cognome | codice_fiscale, data_nascita, sesso |
| **RO** | id, ruolo, denominazione | nome, cognome, data_inizio, data_fine, tipo_nomina |
| **SMAPIT** | id, codice_scuola, denominazione | tipo_scuola, lat, lon, comune |
| **QB** | id, anno, valore | comune, fascia_eta, sesso, trimestre |
| **CLV** | id, indirizzo, comune | civico, cap, provincia, lat, lon |
| **TI** | id, denominazione, data_inizio | data_fine, orario_inizio, luogo, tipo_evento |
| **Cultural-ON** | id, denominazione, tipo_bene_culturale | disciplina, lat, lon, autore |
| **ADMS** | id, titolo, tipo_asset | versione, stato, licenza, formato |
| **PARK** | id, nome, lat, lon | stalli, posti_disabili, tariffa_oraria, tipo_parcheggio |
| **PublicContract** | id, cig, oggetto_contratto | importo_aggiudicazione, stazione_appaltante, aggiudicatario |
| **Route** | id, denominazione, tipo_percorso | lunghezza_km, difficolta, dislivello, numero_tappe |
| **RPO** | id, nome, cognome, codice_ipa | qualifica_dipendente, contratto_lavoro, ccnl, ore_settimanali |
| **Learning** | id, titolo_corso, ente_erogatore | ore_formazione, crediti, titolo_rilasciato, durata_corso |
| **Transparency** | id, denominazione, obbligo_trasparenza | categoria_trasparenza, dato_obbligatorio, norma_riferimento |
| **Indicator** | id, denominazione, tipo_indicatore | valore_indicatore, baseline, target, fonte_indicatore |
| **POT** | id, denominazione, prezzo_intero | prezzo_ridotto, tipo_servizio, comune |

---

## Corpus di riferimento

Il motore deterministico è stato sviluppato e validato su **274 dataset reali** di dati.gov.it (file `fixtures_v7.json`).

---

## Providers AI (opzionali)

| Provider | Modello consigliato | Note |
|----------|--------------------|------|
| **Mistral** | `mistral-large-latest` | Raccomandato. Gratuito su [console.mistral.ai](https://console.mistral.ai) |
| **Groq** | `llama-3.3-70b-versatile` | Molto veloce. Piano gratuito su [console.groq.com](https://console.groq.com) |
| **Gemini** | `gemini-2.0-flash` | 1500 req/giorno free. [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Anthropic** | `claude-sonnet-4-5` | [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | `gpt-4o` | [platform.openai.com](https://platform.openai.com) |
| **Ollama** | modelli locali | Via proxy HTTPS |

---

## File del progetto

| File | Descrizione |
|------|-------------|
| `index.html` | Applicazione web completa (single file) |
| `worker.js` | Cloudflare Worker per API TTL dinamica |
| `fixtures_v7.json` | Corpus 274 dataset reali dati.gov.it |
| `dataset-ottimali-PA.html` | Guida alle colonne ottimali per ontologia |
| `README.md` | Questo file |
| `README-API.md` | Documentazione API worker dettagliata |

---

## Versione

**v2026.03.23.171** — Motore deterministico 22/22 PASS. API Cloudflare Worker live su `csv2rdf.datigovit.workers.dev`.

## Licenza

MIT — Piersoft Paolicelli

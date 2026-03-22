# CSV to RDF/TTL — Linked Open Data PA

Strumento web per trasformare dataset CSV della Pubblica Amministrazione italiana in file RDF/Turtle (.ttl), arricchendo i dati con le ontologie ufficiali di [dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

**Demo live:** https://piersoft.github.io/CSV-to-RDF/

---

## Come funziona

Lo strumento usa un **motore deterministico** basato su 274 dataset reali di dati.gov.it per mappare le colonne CSV sui predicati RDF corretti.

### Procedimento in 4 passi

**STEP 1 — Incolla il CSV**
Incolla il contenuto del tuo CSV (con intestazioni nella prima riga) oppure carica un file .csv.
Per risultati ottimali, usa i nomi colonna standard (vedi tabella sotto).

**STEP 2 — Compila i metadati**
Inserisci il codice IPA del tuo ente e il nome dell'ente titolare del dato.
Questi vengono usati per costruire gli URI delle risorse RDF.

**STEP 3 — Seleziona le ontologie**
Clicca "AI-Detect" per rilevare automaticamente le ontologie adatte al tuo CSV,
oppure attiva/disattiva manualmente le pillole delle ontologie.

**STEP 4 — Genera il TTL**
Clicca "Genera TTL":
- **Senza API key**: generazione istantanea con il motore deterministico (nessun costo, nessun account)
- **Con API key**: usa l'AI per maggiore flessibilità su CSV con colonne non standard

Poi scarica il file .ttl o copialo negli appunti.

---

## Colonne standard per ontologia

Il motore deterministico riconosce automaticamente questi nomi colonna (e molti alias):

| Ontologia | Colonne obbligatorie | Colonne standard |
|-----------|---------------------|-----------------|
| **ACCO** (strutture ricettive) | id, denominazione, lat, lon | tipo, numero_posti_letto, email, sitoweb, indirizzo, comune, cap, provincia |
| **GTFS** (trasporto pubblico) | stop_id, stop_name, stop_lat, stop_lon | zone_id, location_type, route_id, agency_id |
| **POI** (punti di interesse) | id, nome, lat, lon | tipo, indirizzo, comune, cap, accessibile |
| **IoT** (sensori) | id, nome, lat, lon | tipo, valore, unita, inizio |
| **COV** (organizzazioni) | id, denominazione | comparto, comune, provincia, email, sitoweb |
| **CPV** (persone fisiche) | id, nome, cognome | data_nascita, sesso, cittadinanza |
| **RO** (ruoli istituzionali) | id, ruolo, denominazione | nome, cognome, inizio, termine |
| **SMAPIT** (scuole) | id, denominazione, tipo | lat, lon, indirizzo, comune, cap, email |
| **QB** (dati statistici) | id, anno, valore | comune, sesso, cittadinanza, periodo |
| **CLV** (indirizzi) | id, indirizzo, comune | civico, cap, provincia, lat, lon |
| **TI** (eventi/intervalli) | id, denominazione, inizio | termine, dove, tipo, descrizione |
| **Cultural-ON** (beni culturali) | id, denominazione, tipo | lat, lon, indirizzo, comune, autore |
| **ADMS** (asset semantici) | id, denominazione, tipo | versione, stato, sitoweb |

**Alias riconosciuti automaticamente:** `latitudine`=lat, `longitudine`=lon, `stop_lat`=lat, `codicescuola`=id, `sitoweb`/`sito_web`=sitoweb, ecc.

---

## Corpus di riferimento

Il motore deterministico e l'AI-detect sono stati sviluppati e validati su **274 dataset reali** di dati.gov.it (file `fixtures_v7.json`):

| Ontologia | Dataset | Descrizione |
|-----------|--------:|-------------|
| **QB** | 179 | Dati statistici e serie storiche |
| **POI** | 74 | Luoghi geolocalizzati con lat/lon |
| **CPV** | 65 | Popolazione, anagrafe, residenti |
| **CLV** | 61 | Stradari, civici, indirizzi |
| **CPSV** | 47 | Appalti, gare, determine, atti PA |
| **TI** | 29 | Eventi con data inizio/fine |
| **ACCO** | 23 | Strutture ricettive e turismo |
| **Cultural-ON** | 21 | Musei, biblioteche, beni culturali |
| **ADMS** | 16 | Metadati e cataloghi open data |
| **RO** | 14 | Ruoli e incarichi istituzionali |
| **COV** | 12 | Personale e organizzazioni PA |
| **GTFS** | 10 | Trasporto pubblico locale |
| **SMAPIT** | 8 | Strutture scolastiche |
| **IoT** | 8 | Sensori IoT e misurazioni |

---

## Providers AI (opzionali)

> **Lo strumento funziona completamente senza API key.** Il motore deterministico gestisce AI-Detect, generazione TTL, download e validazione.
>
> L'AI serve solo per CSV con colonne non standard o nomi molto diversi dal corpus di riferimento.

Per attivare l'AI, inserisci una API key nel **STEP 2** dell'interfaccia:

| Provider | Note |
|----------|------|
| **Mistral** | Raccomandato. Gratuito su [console.mistral.ai](https://console.mistral.ai) |
| **Groq** | Molto veloce. Piano gratuito su [console.groq.com](https://console.groq.com) |
| **Anthropic** | Claude. Richiede account su [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | GPT-4. Richiede account su [platform.openai.com](https://platform.openai.com) |
| **Ollama** | Modelli locali via proxy HTTPS |

---

## File del progetto

| File | Descrizione |
|------|-------------|
| `index.html` | Applicazione web completa (single file) |
| `fixtures_v7.json` | Corpus 274 dataset reali dati.gov.it |
| `dataset-ottimali-PA.html` | Guida alle colonne ottimali per ontologia |
| `README.md` | Questo file |

---

## Versione

**v2026.03.20.115** — Motore TTL deterministico integrato (13/13 test PASS)

## Licenza

MIT — Piersoft Paolicelli

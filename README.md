# CSV to RDF/TTL — Linked Open Data PA

Strumento web per trasformare dataset CSV della Pubblica Amministrazione italiana in file RDF/Turtle (.ttl), arricchendo i dati con le ontologie ufficiali di [dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

**Demo live:** https://piersoft.github.io/CSV-to-RDF/

---

## Come funziona

Lo strumento usa un **motore deterministico** basato su 274 dataset reali di dati.gov.it per mappare le colonne CSV sui predicati RDF corretti — **senza AI, senza account, senza costi**.

### Procedimento in 4 passi

**STEP 1 — Incolla il CSV**
Incolla il contenuto del tuo CSV (con intestazioni nella prima riga) oppure carica un file `.csv`.
Usa il menu **"Carica esempio"** per vedere i 22 CSV di riferimento per ontologia.

**STEP 2 (OPZIONALE) — Provider AI**
Inserisci una API key per attivare **AI-Detect** (rileva automaticamente le ontologie) e la generazione TTL avanzata. Completamente facoltativo.

**STEP 3 — Metadati ente**
Inserisci il **codice IPA** e il nome dell'ente titolare. Vengono usati per costruire gli URI RDF (`https://w3id.org/italia/data/{ipa}/...`). Il codice IPA è obbligatorio.

**STEP 4 — Genera TTL**
Clicca **"Genera TTL"**:
- **Senza API key**: generazione istantanea con il motore deterministico (nessun costo)
- **Con API key**: usa l'AI per CSV con colonne non standard

Poi scarica il `.ttl` o copialo negli appunti.

---

## Ontologie supportate (22)

Il motore deterministico supporta 22 ontologie di [dati-semantic-assets](https://github.com/italia/dati-semantic-assets) più L0 come base:

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
| **GTFS** | `gtfs:` | `gtfs:Stop` | Trasporto pubblico locale (fermate, linee) |
| **Cultural-ON** | `cis:` | `cis:CulturalInstituteOrSite` | Beni culturali, musei, biblioteche |
| **SMAPIT** | `smapit:` | `smapit:School` | Strutture scolastiche |
| **IoT** | `iot:` | `iot:Sensor` | Sensori e misurazioni IoT |
| **QB** | `qb:` | `qb:Observation` | Dati statistici e serie storiche |
| **PARK** | `park:` | `park:ParkingFacility` | Parcheggi e aree di sosta |
| **PublicContract** | `pc:` | `pc:Contract` | Contratti pubblici e appalti (D.Lgs. 50/2016) |
| **Route** | `route:` | `route:Route` | Percorsi ed itinerari (escursionistici, ciclabili) |
| **RPO** | `rpo:` | `rpo:RoleInOrganization` | Risorse umane PA (contratti, qualifiche) |
| **Learning** | `learn:` | `learn:Course` | Corsi e attività formative |
| **Transparency** | `tr:` | `tr:TransparencyObligation` | Obblighi D.Lgs. 33/2013 (amministrazione trasparente) |
| **Indicator** | `indicator:` | `indicator:Indicator` | Indicatori e KPI |
| **POT** | `pot:` | `pot:PriceSpecification` | Prezzi e tariffe servizi |
| **CPSV-AP** | `cpsv:` | `cpsv:PublicService` | Servizi pubblici (CPSV-AP) |

> **Distinzioni importanti:**
> - `PublicContract` → appalti (CIG, importi, aggiudicatari). `CPSV-AP` → servizi pubblici generici.
> - `Route` → percorsi escursionistici/ciclabili. `GTFS` → trasporto pubblico (fermate, corse).
> - `RPO` → personale dipendente PA. `RO` → ruoli politici e istituzionali.
> - `Indicator` → KPI e indicatori di performance. `QB` → serie storiche statistiche generiche.

---

## Colonne standard per ontologia

Il motore deterministico riconosce automaticamente questi nomi colonna (e molti alias):

| Ontologia | Colonne obbligatorie | Colonne standard |
|-----------|---------------------|-----------------|
| **ACCO** | id, denominazione, lat, lon | tipo_struttura, posti_letto, stelle, email, indirizzo, comune |
| **GTFS** | stop_id, stop_name, stop_lat, stop_lon | zone_id, location_type, route_id, agency_id |
| **POI** | id, nome, lat, lon | tipo_poi, indirizzo, comune, accessibile |
| **IoT** | id, id_sensore, lat, lon | tipo_sensore, valore, unita_misura, timestamp |
| **COV** | id, denominazione, codice_ipa | tipo_ente, comune, provincia, email |
| **CPV** | id, nome, cognome | codice_fiscale, data_nascita, sesso |
| **RO** | id, ruolo, denominazione | nome, cognome, data_inizio, data_fine, tipo_nomina |
| **SMAPIT** | id, codice_scuola, denominazione | tipo_scuola, lat, lon, comune |
| **QB** | id, anno, valore | comune, fascia_eta, sesso, trimestre |
| **CLV** | id, indirizzo, comune | civico, cap, provincia, lat, lon |
| **TI** | id, denominazione, data_inizio | data_fine, orario_inizio, luogo, tipo_evento |
| **Cultural-ON** | id, denominazione, tipo_istituto | disciplina, lat, lon, autore |
| **ADMS** | id, titolo, tipo_asset | versione, stato, licenza, formato |
| **PARK** | id, nome, lat, lon | stalli, posti_disabili, tariffa_oraria, tipo_parcheggio |
| **PublicContract** | id, cig, oggetto_contratto | importo_aggiudicazione, stazione_appaltante, aggiudicatario, cpv_codice |
| **Route** | id, denominazione, tipo_percorso | lunghezza_km, difficolta, dislivello, numero_tappe, lat_start, lon_start |
| **RPO** | id, nome, cognome, codice_ipa | qualifica_dipendente, contratto_lavoro, ccnl, ore_settimanali |
| **Learning** | id, titolo_corso, ente_erogatore | ore_formazione, crediti, titolo_rilasciato, durata_corso |
| **Transparency** | id, denominazione, obbligo_trasparenza | categoria_trasparenza, dato_obbligatorio, norma_riferimento |
| **Indicator** | id, denominazione, tipo_indicatore | valore_indicatore, baseline, target, fonte_indicatore |
| **POT** | id, denominazione, prezzo_intero | prezzo_ridotto, tipo_servizio, comune |

**Alias riconosciuti automaticamente:** `latitudine`=lat, `longitudine`=lon, `codicescuola`=codice_scuola, `sitoweb`/`sito_web`=url, ecc.

---

## Corpus di riferimento

Il motore deterministico e l'AI-detect sono stati sviluppati e validati su **274 dataset reali** di dati.gov.it (file `fixtures_v7.json`):

| Ontologia | Dataset | Descrizione |
|-----------|--------:|-------------|
| **QB** | 179 | Dati statistici e serie storiche |
| **POI** | 74 | Luoghi geolocalizzati con lat/lon |
| **CPV** | 65 | Popolazione, anagrafe, residenti |
| **CLV** | 61 | Stradari, civici, indirizzi |
| **CPSV** | 47 | Servizi pubblici |
| **TI** | 29 | Eventi con data inizio/fine |
| **ACCO** | 23 | Strutture ricettive e turismo |
| **Cultural-ON** | 21 | Musei, biblioteche, beni culturali |
| **ADMS** | 16 | Metadati e cataloghi open data |
| **RO** | 14 | Ruoli e incarichi istituzionali |
| **COV** | 12 | Personale e organizzazioni PA |
| **GTFS** | 10 | Trasporto pubblico locale |
| **SMAPIT** | 8 | Strutture scolastiche |
| **IoT** | 8 | Sensori IoT e misurazioni |

Le ontologie **PublicContract, Route, RPO, Learning, Transparency, Indicator, POT, PARK** sono supportate dal motore deterministico con rilevamento basato su colonne chiave, in attesa di arricchimento del corpus con dataset reali di dati.gov.it.

---

## Providers AI (opzionali)

> **Lo strumento funziona completamente senza API key.** Il motore deterministico gestisce AI-Detect, generazione TTL, download e validazione.

Per attivare l'AI, inserisci una API key nel **STEP 2** dell'interfaccia:

| Provider | Modello consigliato | Note |
|----------|--------------------|----|
| **Mistral** | `mistral-large-latest` | Raccomandato. Gratuito su [console.mistral.ai](https://console.mistral.ai) |
| **Groq** | `llama-3.3-70b-versatile` | Molto veloce. Piano gratuito su [console.groq.com](https://console.groq.com) |
| **Gemini** | `gemini-2.0-flash` | 1500 req/giorno free. [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Anthropic** | `claude-sonnet-4-5` | Claude. [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | `gpt-4o` | [platform.openai.com](https://platform.openai.com) |
| **Ollama** | `gpt-oss:120b` | Modelli locali via proxy HTTPS |

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

**v2026.03.20.148** — 22 ontologie supportate (14 originali + 8 nuove: PARK, PublicContract, Route, RPO, Learning, Transparency, Indicator, POT). Motore deterministico con 22/22 CSV sacri PASS. Corpus matcher v11.

## Licenza

MIT — Piersoft Paolicelli

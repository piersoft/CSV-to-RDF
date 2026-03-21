| Ontologia | Fixture | Score | Descrizione |
|-----------|--------:|------:|-------------|
| **QB** | 179 | 🟢 99% | Dati statistici e serie storiche |
| **POI** | 74 | 🟢 94% | Luoghi geolocalizzati con lat/lon |
| **CPV** | 65 | 🟢 92% | Popolazione, anagrafe, residenti |
| **CLV** | 61 | 🟢 91% | Stradari, civici, indirizzi |
| **CPSV** | 47 | 🟢 86% | Appalti, gare, determine, atti PA |
| **TI** | 29 | 🔵 76% | Eventi con data inizio/fine |
| **ACCO** | 23 | 🔵 72% | Strutture ricettive e turismo |
| **Cultural-ON** | 21 | 🔵 70% | Musei, biblioteche, beni culturali |
| **ADMS** | 16 | 🟡 66% | Metadati e cataloghi open data |
| **RO-AP_IT** | 14 | 🟡 63% | Ruoli e incarichi istituzionali |
| **COV-AP_IT** | 12 | 🟡 61% | Personale e organizzazioni PA |
| **GTFS** | 10 | 🟡 59% | Trasporto pubblico locale |
| **MUAPIT** | 10 | 🟡 59% | Luoghi e beni culturali MiC/ArCo |
| **CPVAPIT** | 9 | 🟡 58% | Persone fisiche nominative |
| **SMAPIT** | 8 | 🟡 56% | Strutture scolastiche |
| **IoT-AP_IT** | 8 | 🟡 56% | Sensori IoT e misurazioni |
| **arco** | 5 | 🔴 52% | — |
| **SM** | 4 | 🔴 51% | — |
| **DCATAPIT** | 3 | 🟢 100% | Standard obbligatorio dati.gov.it |
| **PublicOrganization** | 3 | 🔴 50% | Enti pubblici (IPA, ASL, ecc.) |
| **foaf** | 2 | 🔴 48% | — |
| **skos** | 2 | 🔴 48% | — |
| **cis** | 1 | 🔴 47% | — |
| **l0** | 1 | 🔴 47% | — |
# CSV → RDF/TTL — Linked Open Data per la PA italiana

Strumento open source per trasformare dataset CSV della Pubblica Amministrazione italiana in file **Turtle (TTL) RDF**, arricchiti con le ontologie ufficiali di [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

La PA ha già pubblicato il dataset su dati.gov.it o sul portale opendata locale. Questo strumento genera la **distribuzione TTL** da aggiungere come nuova distribuzione al catalogo esistente.

👉 **Demo live**: [https://piersoft.github.io/CSV-to-RDF](https://piersoft.github.io/CSV-to-RDF)

📋 **Dataset Ottimali di Riferimento per PA**: [https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html](https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html)

---

## Guida per l'utente — Passo per passo

### STEP 1 — Incolla il CSV

Copia il contenuto del tuo file CSV (con la riga di intestazione) e incollalo nell'area di testo grande. Il separatore viene rilevato automaticamente tra virgola, punto e virgola, tabulazione e pipe.

Clicca **👁 Anteprima** per avviare la validazione. Lo strumento controllerà:
- colonne duplicate o con nomi generici
- valori mancanti o coordinate malformate
- encoding errato

Se ci sono errori bloccanti vengono mostrati in rosso. I warning in arancione sono segnalazioni ma non bloccano la generazione.

---

### STEP 2 — Configura il Provider AI

Scegli il provider AI che vuoi usare tra le quattro opzioni disponibili e inserisci la tua API key.

**🟠 Mistral** — consigliato per dataset grandi. API key gratuita su [console.mistral.ai](https://console.mistral.ai). Scegli il modello `mistral-large-latest` per i migliori risultati.

**⚡ Groq** — molto veloce, piano gratuito su [console.groq.com](https://console.groq.com). Ha un limite di token al minuto: per dataset grandi usa il chunking da 25 righe.

**✨ Gemini** — piano gratuito generoso (1500 richieste/giorno) su [Google AI Studio](https://aistudio.google.com/app/apikey). Nessuna carta di credito richiesta. Ottimo per dataset molto grandi.

**🦙 Ollama Cloud** — richiede un proxy server HTTPS configurato dal tuo amministratore di sistema. API key su [ollama.com/settings/keys](https://ollama.com/settings/keys).

> Non appena inserisci la API key, lo strumento avvia automaticamente il rilevamento AI delle ontologie sul CSV che hai incollato. Vedrai il messaggio "🤖 AI suggerisce: ..." sopra le pillole delle ontologie.

---

### STEP 3 — Verifica le ontologie rilevate

Le ontologie vengono rilevate automaticamente in due passaggi:

1. **Rilevamento deterministico** — analizza i nomi delle colonne e i valori del campione. Avviene immediatamente al caricamento del CSV.
2. **Rilevamento AI** — analizza il contenuto del CSV e suggerisce le ontologie più appropriate consultando il catalogo [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets). Avviene automaticamente quando inserisci la API key.

Le ontologie suggerite appaiono come pillole blu. Puoi aggiungerne o rimuoverne manualmente cliccando sulle pillole. Le ontologie avanzate (GTFS, Cultural-ON, PARK...) si trovano nella sezione espandibile **▶ Mostra ontologie avanzate**.

Se vuoi rifare il rilevamento AI (ad esempio dopo aver cambiato provider) clicca il pulsante **🤖 Rileva ontologie**.

Le ontologie disponibili sono:

| Pillola | Quando usarla |
|---------|---------------|
| CLV | Dataset con indirizzi, coordinate, luoghi |
| COV | Enti pubblici, organizzazioni, imprese |
| CPV | Persone fisiche, anagrafe |
| POI | Punti di interesse generici |
| SM  | Contatti: email, telefono, siti web |
| RO  | Ruoli e incarichi istituzionali |
| TI  | Date, orari, intervalli temporali |
| ADMS | Brevetti, licenze, asset digitali |
| ACCO | Strutture ricettive: hotel, B&B, ostelli |
| PARK | Parcheggi e aree di sosta |
| GTFS | Trasporto pubblico: fermate, linee, corse |
| Cultural-ON | Musei, biblioteche, archivi, teatri |
| CPSV-AP | Servizi pubblici erogati dalla PA |
| QB | Dati statistici e osservazioni |
| SKOS | Classificazioni e tassonomie |

---

### Corpus di riferimento v11

Il rilevamento deterministico si basa su un **corpus di 269 dataset reali** della PA italiana, raccolti e validati manualmente.

Il corpus copre le principali ontologie del patrimonio semantico nazionale:

| Ontologia | Fixture | Score | Descrizione |
|-----------|--------:|------:|-------------|
| **QB** | 179 | 🟢 99% | Dati statistici e serie storiche |
| **POI** | 74 | 🟢 94% | Luoghi geolocalizzati con lat/lon |
| **CPV** | 65 | 🟢 92% | Popolazione, anagrafe, residenti |
| **CLV** | 61 | 🟢 91% | Stradari, civici, indirizzi |
| **CPSV** | 47 | 🟢 86% | Appalti, gare, determine, atti PA |
| **TI** | 29 | 🔵 76% | Eventi con data inizio/fine |
| **ACCO** | 23 | 🔵 72% | Strutture ricettive e turismo |
| **Cultural-ON** | 21 | 🔵 70% | Musei, biblioteche, beni culturali |
| **ADMS** | 16 | 🟡 66% | Metadati e cataloghi open data |
| **RO-AP_IT** | 14 | 🟡 63% | Ruoli e incarichi istituzionali |
| **COV-AP_IT** | 12 | 🟡 61% | Personale e organizzazioni PA |
| **GTFS** | 10 | 🟡 59% | Trasporto pubblico locale |
| **MUAPIT** | 10 | 🟡 59% | Luoghi e beni culturali MiC/ArCo |
| **CPVAPIT** | 9 | 🟡 58% | Persone fisiche nominative |
| **SMAPIT** | 8 | 🟡 56% | Strutture scolastiche |
| **IoT-AP_IT** | 8 | 🟡 56% | Sensori IoT e misurazioni |
| **arco** | 5 | 🔴 52% | — |
| **SM** | 4 | 🔴 51% | — |
| **DCATAPIT** | 3 | 🟢 100% | Standard obbligatorio dati.gov.it |
| **PublicOrganization** | 3 | 🔴 50% | Enti pubblici (IPA, ASL, ecc.) |
| **foaf** | 2 | 🔴 48% | — |
| **skos** | 2 | 🔴 48% | — |
| **cis** | 1 | 🔴 47% | — |
| **l0** | 1 | 🔴 47% | — |

> **Nota sulle ontologie:** Le ontologie contrassegnate con ✅ sono native del repository [dati-semantic-assets](https://github.com/italia/dati-semantic-assets). Le ontologie **QB** (RDF Data Cube, W3C), **GTFS** (General Transit Feed Specification), e **IoT** ([IoT-AP_IT](https://w3id.org/italia/onto/IoT/)) sono standard complementari usati dalla PA italiana per specifici domini (statistiche, trasporti, sensori). Il corpus include dataset reali che le utilizzano in modo conforme alle best practice nazionali.

Quando incolli un CSV e clicchi **👁 Anteprima** (oppure carichi un file), il corpus viene interrogato in tempo reale via **Jaccard similarity** sugli header: i dataset più simili vengono mostrati nel pannello blu con badge di confidenza e link diretto a [dati.gov.it](https://www.dati.gov.it).

Le fixture del corpus sono disponibili in [`fixtures_v7.json`](./fixtures_v7.json) e vengono caricate nel browser — nessuna chiamata a server esterni.

Il corpus viene usato in **due momenti distinti**:
1. **Prima della generazione TTL** — Jaccard similarity sugli headers suggerisce l'ontologia più probabile, pre-compilando la selezione
2. **Dopo la generazione TTL** — confronto classi generate con quelle attese + validazione SPARQL su schema.gov.it

---

### STEP 4 — Inserisci il Titolare del dato

Compila i due campi obbligatori:

**Nome PA** — il nome dell'amministrazione pubblica titolare del dataset. Esempi: `Comune di Bari`, `Regione Puglia`, `ENEA`.

**Codice IPA** — il codice identificativo dell'ente nel registro IPA (Indice delle Pubbliche Amministrazioni). Puoi cercarlo su [indicepa.gov.it](https://indicepa.gov.it). Esempi: `c_a662` per il Comune di Bari, `c_f205` per il Comune di Milano.

Il codice IPA viene usato per costruire gli URI delle entità RDF secondo lo schema ufficiale:
```
https://w3id.org/italia/data/{codice-ipa}/{tipo-risorsa}/{id-riga}
```

---

### Genera TTL

Clicca il pulsante arancione **⚡ Genera TTL**.

Lo strumento elabora il CSV in blocchi da 25 righe (configurabile). Per ogni blocco:
1. Le colonne riconoscibili (coordinate, email, telefono, nome, data...) vengono mappate deterministicamente senza chiamate AI
2. Le colonne semanticamente ambigue vengono elaborate dal modello AI scelto
3. Il risultato viene sanitizzato: classi e proprietà inventate dal modello vengono sostituite automaticamente con termini verificati

La barra di stato mostra il progresso chunk per chunk. Al termine appare il TTL nell'area di output a destra.

---

### Scarica e valida il risultato

Nell'area di output trovi tre pulsanti:

**⬇ Scarica .ttl** — scarica il file Turtle pronto da caricare sul portale open data.

**⬇ Scarica .rdf** — scarica la versione RDF/XML dello stesso file, convertita nel browser via N3.js.

**📋 Copia TTL** — copia il testo negli appunti.

**🔍 Valida** — avvia la validazione delle ontologie usate. Il report mostra:
- ✓ verde: termini verificati nelle ontologie dati-semantic-assets
- ◦ grigio: standard W3C/DCAT (sempre validi)
- ⚠ arancione: termini non trovati nella mappa locale
- ✗ rosso: termini che non esistono su schema.gov.it

In presenza di warning o errori, considera di rigenerare con un modello più potente o di correggere manualmente il TTL.

---

### Cosa fare con il TTL generato

Il file TTL generato va aggiunto come nuova **distribuzione** al dataset già esistente sul portale open data della tua PA. Non sostituisce i metadati DCAT — li integra con i dati in formato Linked Open Data.

---

## 📋 Dataset Ottimali di Riferimento per PA

Il file [`dataset-ottimali-PA.html`](https://piersoft.github.io/CSV-to-RDF/dataset-ottimali-PA.html) è un **catalogo interattivo** dei dataset CSV ideali per Comuni e Regioni che vogliono pubblicare dati conformi alle ontologie dati-semantic-assets / DCAT-AP_IT.

Per ogni ontologia il catalogo indica:
- Il **dataset modello** con headers chiave evidenziati in blu
- L'**ente di riferimento** che lo pubblica già correttamente
- Il **link diretto** a dati.gov.it o al portale sorgente
- Lo **score di match** stimato sul corpus attuale (274 dataset)
- Una **nota pratica** per i responsabili open data

---

## File nel repository

| File | Descrizione |
|------|-------------|
| `index.html` | App principale CSV→RDF (unico file, ~3000 righe) |
| `fixtures_v7.json` | Corpus matcher — 217 dataset di riferimento per 10 ontologie |
| `dataset-ottimali-PA.html` | Catalogo interattivo dataset ottimali per PA |
| `README.md` | Documentazione |

---

## Architettura ibrida: deterministico + LLM

Lo strumento non affida tutto al LLM. Per ogni colonna del CSV viene applicata una logica a quattro livelli:

```
CSV
 ↓
1. MAPPER DETERMINISTICO (JS puro, zero token)
   ├── nome colonna in lista pattern noti? (lat, lon, email, tel, cap...)
   └── valore corrisponde a formato riconoscibile? (regex)
         ↓ sì → mappatura diretta, proprietà RDF garantita
         ↓ no ↓
2. LLM (solo per colonne semanticamente ambigue)
   ├── riceve solo le colonne non risolte deterministicamente
   ├── prompt con classi/proprietà verificate dalle ontologie dati-semantic-assets
   └── vocabolari controllati reali fetchati da dati-semantic-assets
         ↓
3. SANITIZZAZIONE (whitelist JS)
   ├── proprietà ontologiche verificate contro whitelist
   ├── classi verificate contro whitelist
   └── termini non in whitelist → sostituiti con fallback sicuri
         ↓
4. VALIDAZIONE (opzionale, pulsante 🔍 Valida)
   ├── mappa locale ONTO_CLASSES
   └── SPARQL ASK su schema.gov.it/sparql
```

### Criteri per la mappatura deterministica

| Pattern nome colonna | Proprietà RDF | Tipo XSD |
|---------------------|---------------|----------|
| `lat`, `latitude`, `latitudine`, `lat_y`, `lat_wgs84` | `geo:lat` | `xsd:decimal` |
| `lon`, `lng`, `long`, `longitude`, `lon_x`, `lon_wgs84` | `geo:long` | `xsd:decimal` |
| `email`, `mail`, `pec` | `sm:hasEmail` | `xsd:string` |
| `tel`, `telefono`, `phone`, `fax`, `cellulare` | `sm:hasTelephone` | `xsd:string` |
| `sito`, `website`, `url`, `web`, `link` | `sm:hasWebSite` | `xsd:anyURI` |
| `id`, `codice`, `cod`, `identifier`, `istat`, `ipa` | `dct:identifier` | `xsd:string` |
| `cf`, `codice_fiscale`, `piva`, `partita_iva` | `dct:identifier` | `xsd:string` |
| `nome`, `name`, `denominazione`, `titolo` | `rdfs:label` | `@it` |
| `descrizione`, `description`, `note`, `abstract`, `riassunto` | `dct:description` | `@it` |
| `data`, `date`, `anno`, `year`, `data_deposito` | `dct:date` | `xsd:date` |
| `indirizzo`, `address`, `via`, `comune`, `cap`, `provincia` | `clv:hasAddress` | — |
| `tipo`, `tipologia`, `categoria`, `settore` | `dct:type` | `@it` |
| `stato`, `status`, `attivo` | `adms:status` | `@it` |

### Schema URI delle entità

```
https://w3id.org/italia/data/{ipa}/{tipo-risorsa}/{id}
```

| Ontologia principale | Segmento tipo-risorsa |
|---------------------|----------------------|
| `acco:AccommodationFacility` | `accommodation-facility` |
| `park:ParkingFacility` | `parking-facility` |
| `gtfs:Stop` | `stop` |
| `cultural-on:CulturalInstituteOrSite` | `cultural-institute` |
| `cov:PublicOrganization` | `public-organization` |
| `cpv:Person` | `person` |
| `adms:SemanticAsset` | `asset` |
| `poi:PointOfInterest` | `point-of-interest` |

---

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. L'app è disponibile su `https://<tuo-username>.github.io/CSV-to-RDF`

---

## Standard di riferimento

**DCAT-AP_IT 2.1** · **Dublin Core** (`dct:`) · **W3C WGS84** (`geo:`) · **FOAF** · **schema.gov.it**

---

### Validazione ontologica via SPARQL

Dopo la generazione del TTL, il validatore verifica automaticamente che le classi usate (es. `l0:EventOrSituation`, `poi:PointOfInterest`) esistano nell'ontologia ufficiale italiana su [schema.gov.it](https://schema.gov.it).

La verifica avviene interrogando l'endpoint SPARQL `https://schema.gov.it/sparql` tramite un **proxy Cloudflare** che risolve le restrizioni CORS dei browser:

```
Browser → Cloudflare Worker (/sparql-proxy) → schema.gov.it/sparql
```

Il proxy è basato sul **CKAN MCP Server** sviluppato da [ondata](https://github.com/ondata/ckan-mcp-server). Il worker è deployato su Cloudflare Workers: `https://ckan-mcp-server.datigovit.workers.dev`.

Se tutte le classi sono riconosciute, il pannello mostra: **✅ Tutte le N classi verificate su schema.gov.it**.

## Accessibilità

Entrambe le interfacce (`index.html` e `dataset-ottimali-PA.html`) rispettano le linee guida **WCAG 2.1 livello AA**:
- Rapporti di contrasto testo/sfondo ≥ 4.5:1
- Font leggibili e scalabili (IBM Plex Sans / IBM Plex Mono)
- Navigazione da tastiera con `focus-visible` evidenziato
- Attributi `aria-label`, `role` e `lang="it"` presenti
- Nessun contenuto che dipende esclusivamente dal colore

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato da [piersoft](https://github.com/piersoft).
Ontologie: [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets) · [dati.gov.it](https://dati.gov.it) · [schema.gov.it](https://schema.gov.it)

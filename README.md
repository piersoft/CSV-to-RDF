# CSV → RDF/TTL — Linked Open Data per la PA italiana

Strumento open source per trasformare dataset CSV della Pubblica Amministrazione italiana in file **Turtle (TTL) RDF**, arricchiti con le ontologie ufficiali di [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

La PA ha già pubblicato il dataset su dati.gov.it o sul portale opendata locale. Questo strumento genera la **distribuzione TTL** da aggiungere come nuova distribuzione al catalogo esistente.

👉 **Demo live**: [https://piersoft.github.io/CSV-to-RDF](https://piersoft.github.io/CSV-to-RDF)

---

## Funzionalità

- Incolla il CSV → validazione automatica della qualità + suggerimento ontologie
- **Rilevamento automatico separatore** (`,` `;` `\t` `|`)
- **Validazione CSV**: colonne generiche, valori mancanti, coordinate mal formate, encoding errato
- **Auto-detect ontologie**: analizza le colonne e suggerisce le ontologie più adatte
- Ontologie comuni + sezione avanzate espandibile (SKOS, QB, Cultural-ON, GTFS, PARK...)
- Solo due campi obbligatori: **Nome PA** e **Codice IPA** (per `dct:rightsHolder`)
- **Architettura ibrida**: colonne riconoscibili mappate deterministicamente, colonne ambigue elaborate dal LLM
- **Vocabolari controllati verificati**: fetch automatico da `dati-semantic-assets` per le ontologie rilevate
- **Sanitizzazione TTL**: whitelist di classi e proprietà verificate — le allucinazioni del LLM vengono corrette automaticamente
- **Validazione post-generazione**: verifica ogni termine usato contro mappa locale e SPARQL endpoint di `schema.gov.it`
- **Chunking automatico**: il CSV viene suddiviso in blocchi, trasformato con chiamate API separate e unito in un unico TTL completo
- **Prefissi deduplicati** automaticamente nel TTL finale
- Download diretto del file `.ttl` e del file `.rdf` (RDF/XML, convertito nel browser via N3.js)
- Provider AI: **Mistral**, **Groq**, **Google Gemini**, **Ollama Cloud** (tramite proxy)
- UI **Bootstrap Italia** — conforme alle linee guida AgID

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
   ├── prompt con classi/proprietà verificate dalle ontologie OntoPiA
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

Una colonna viene mappata senza LLM se il nome corrisponde a un pattern noto e il valore del campione corrisponde al formato atteso:

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

Il criterio è **nome + valore**: se il nome corrisponde ma il valore non ha il formato atteso (es. una colonna `lat` con testo invece di numeri), la colonna viene passata al LLM.

### Criteri per la sanitizzazione (whitelist)

Dopo la generazione LLM, ogni riga del TTL viene analizzata:

- **Proprietà** con prefisso OntoPiA non in whitelist → sostituita con `dct:description`
- **Classe** con prefisso OntoPiA non in whitelist → sostituita con `l0:Object`
- Prefissi standard W3C/DCAT (`rdf`, `rdfs`, `owl`, `xsd`, `dct`, `dcat`, `foaf`, `geo`, `skos`, `vcard`, `schema`) → mai toccati

Questo garantisce che proprietà inventate come `clv:hasStreetName`, `ti:hasDayOfWeek`, `l0:hasQuantity` non arrivino mai nell'output finale.

### Criteri per la validazione

Il pulsante **🔍 Valida** analizza il TTL in tre passaggi:

1. Estrae tutti i termini `prefisso:Nome` usati
2. Verifica contro la mappa statica `ONTO_CLASSES` (estratta dalle ontologie reali OntoPiA)
3. Per i termini non trovati localmente, interroga `https://schema.gov.it/sparql` con `ASK { <URI> ?p ?o }`

Report: ✓ verificati · ◦ standard W3C/DCAT · ⚠ non trovati localmente · ✗ non esistono su schema.gov.it

---

## Cosa contiene il TTL generato

Il file TTL **non** contiene i metadati DCAT del dataset (già presenti sul portale). Contiene:

- I **prefissi** delle ontologie usate
- Il **titolare** (`dct:rightsHolder`) con URI IPA ufficiale
- Le **entità LOD** per ogni riga del CSV

```turtle
@prefix poi: <https://w3id.org/italia/onto/POI/> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

<https://w3id.org/italia/data/public-organization/c_a662>
    a foaf:Agent ;
    foaf:name "Comune di Bari"@it ;
    dct:identifier "c_a662" .

<https://w3id.org/italia/data/c_a662/fermata/57>
    a poi:PointOfInterest ;
    rdfs:label "PORTA TENAGLIA"@it ;
    geo:lat "45.477"^^xsd:decimal ;
    geo:long "9.181"^^xsd:decimal .
```

---

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. L'app è disponibile su `https://<tuo-username>.github.io/CSV-to-RDF`

---

## Configurazione provider AI

### 🟠 Mistral
API key su [console.mistral.ai](https://console.mistral.ai). Modelli: `mistral-large-latest` (consigliato).
Consigliato per dataset grandi — nessun rate limit problematico.

### ⚡ Groq
API key su [console.groq.com](https://console.groq.com) (piano gratuito).
Modelli: `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`.
Delay automatico di 6s tra chunk per rispettare il rate limit TPM.

### ✨ Google Gemini
API key gratuita su [Google AI Studio](https://aistudio.google.com/app/apikey).
Modelli: `gemini-2.0-flash` (consigliato). Piano free: **1500 richieste/giorno**.

### 🦙 Ollama Cloud
Richiede un proxy server HTTPS (Ollama Cloud blocca le chiamate dirette dal browser per CORS).

```javascript
app.post("/api/ollama-proxy", async (req, res) => {
  const { model, messages, options, ollama_api_key } = req.body;
  const r = await fetch("https://ollama.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ollama_api_key },
    body: JSON.stringify({ model, messages, stream: false, options }),
  });
  res.json(await r.json());
});
```

API key: [ollama.com/settings/keys](https://ollama.com/settings/keys)

---

## Ontologie supportate

Tutte da **[github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets)**.

### Comuni
| Prefisso | URI | Descrizione |
|----------|-----|-------------|
| `clv` | `https://w3id.org/italia/onto/CLV/` | Indirizzi e luoghi |
| `cov` | `https://w3id.org/italia/onto/COV/` | Organizzazioni |
| `cpv` | `https://w3id.org/italia/onto/CPV/` | Persone |
| `l0`  | `https://w3id.org/italia/onto/l0/`  | Top-level ontology |
| `poi` | `https://w3id.org/italia/onto/POI/` | Punti di interesse |
| `sm`  | `https://w3id.org/italia/onto/SM/`  | Social media e contatti |
| `ro`  | `https://w3id.org/italia/onto/RO/`  | Ruoli |
| `ti`  | `https://w3id.org/italia/onto/TI/`  | Tempo e intervalli |
| `adms`| `https://w3id.org/italia/onto/ADMS/`| Asset e metadati |

### Avanzate
| Prefisso | Descrizione |
|----------|-------------|
| `acco`        | Strutture ricettive |
| `ac`          | Condizioni di accesso |
| `park`        | Parcheggi |
| `cpsv`        | Servizi pubblici (CPSV-AP) |
| `cultural-on` | Patrimonio culturale |
| `gtfs`        | Trasporto pubblico |
| `route`       | Percorsi |
| `skos`        | Classificazioni e tassonomie |
| `qb`          | RDF Data Cube (dati statistici) |

---

## Standard di riferimento

**DCAT-AP_IT 2.1** · **Dublin Core** (`dct:`) · **W3C WGS84** (`geo:`) · **FOAF** · **schema.gov.it**

---

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato da [piersoft](https://github.com/piersoft).
Ontologie: [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets) · [dati.gov.it](https://dati.gov.it) · [schema.gov.it](https://schema.gov.it)

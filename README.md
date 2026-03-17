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
- **Chunking automatico**: il CSV viene suddiviso in blocchi da 25 righe, trasformato con chiamate API separate e unito in un unico TTL completo
- **Prefissi deduplicati** automaticamente nel TTL finale
- Download diretto del file `.ttl` e del file `.rdf` (RDF/XML, convertito nel browser via N3.js)
- Provider AI: **Mistral**, **Groq**, **Google Gemini**, **Ollama Cloud** (tramite proxy)
- UI **Bootstrap Italia** — conforme alle linee guida AgID

## Architettura

```
Browser (GitHub Pages o self-hosted)
    ├── → Mistral API   (api.mistral.ai)       — chiamata diretta
    ├── → Groq API      (api.groq.com)          — chiamata diretta
    ├── → Gemini API    (generativelanguage.googleapis.com) — chiamata diretta
    └── → Ollama Cloud  (ollama.com)            — richiede proxy server (vedi sotto)
```

Mistral, Groq e Gemini funzionano **100% nel browser**, senza backend. Le API key rimangono solo nel browser dell'utente.

## Cosa contiene il TTL generato

Il file TTL **non** contiene i metadati DCAT del dataset (già presenti sul portale). Contiene:

- I **prefissi** delle ontologie usate
- Il **titolare** (`dct:rightsHolder`) con URI IPA ufficiale
- Le **entità LOD** per ogni riga del CSV, tipizzate con le ontologie di dati-semantic-assets

```turtle
@prefix poi: <https://w3id.org/italia/onto/POI/> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
...

<https://w3id.org/italia/data/public-organization/c_a662>
    a foaf:Agent ;
    foaf:name "Comune di Bari"@it ;
    dct:identifier "c_a662" .

<https://...> a poi:PointOfInterest ;
    rdfs:label "DAE Stazione Centrale"@it ;
    geo:lat "41.118"^^xsd:decimal ;
    geo:long "16.871"^^xsd:decimal .
```

## Chunking automatico

```
Header TTL (generato in JS): @prefix + titolare
Chunk 1: righe   1-25  → entità RDF
Chunk 2: righe  26-50  → entità RDF
...
Merge finale + deduplicazione prefissi → file .ttl completo
```

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. L'app è disponibile su `https://<tuo-username>.github.io/CSV-to-RDF`

## Configurazione provider AI

### 🟠 Mistral
API key su [console.mistral.ai](https://console.mistral.ai).
Modelli: `mistral-large-latest` (consigliato), `mistral-medium-latest`, `mistral-small-latest`.
Consigliato per dataset grandi — nessun rate limit problematico.

### ⚡ Groq
API key su [console.groq.com](https://console.groq.com) (piano gratuito).
Modelli: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`.
Molto veloce ma con rate limit token/minuto sul piano free.

### ✨ Google Gemini
API key gratuita su [Google AI Studio](https://aistudio.google.com/app/apikey). Nessuna carta di credito.
Modelli: `gemini-2.0-flash` (consigliato), `gemini-2.0-flash-lite`, `gemini-1.5-flash`.
Piano free: **1500 richieste/giorno · 1M token/minuto**.

### 🦙 Ollama Cloud
Ollama Cloud non supporta chiamate dirette dal browser (CORS). Richiede un **proxy server** intermedio.

Il proxy riceve la richiesta dal browser e la inoltra a `ollama.com` server-side:

```javascript
// Endpoint da aggiungere al tuo server Node.js/Express
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

API key Ollama: [ollama.com/settings/keys](https://ollama.com/settings/keys)

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
| `lang`        | Lingue |
| `iot`         | Internet of Things |
| `transp`      | Trasparenza PA |
| `skos`        | Classificazioni e tassonomie |
| `qb`          | RDF Data Cube (dati statistici) |

## Standard di riferimento

- **DCAT-AP_IT 2.1** · **Dublin Core** (`dct:`) · **W3C WGS84** (`geo:`) · **FOAF** · **schema.gov.it**

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato da [piersoft](https://github.com/piersoft).
Ontologie: [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets) · [dati.gov.it](https://dati.gov.it) · [schema.gov.it](https://schema.gov.it)

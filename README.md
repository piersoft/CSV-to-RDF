# CSV → RDF/TTL — Strumento semantico per la PA italiana

Strumento open source per trasformare dataset CSV della Pubblica Amministrazione italiana in file **Turtle (TTL) RDF**, allineati a **DCAT-AP_IT 2.1** e alle ontologie ufficiali pubblicate su [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

👉 **Demo live**: [https://piersoft.github.io/CSV-to-RDF](https://piersoft.github.io/CSV-to-RDF)

---

## Funzionalità

- Incolla qualsiasi CSV con intestazioni → ottieni il file `.ttl` semantico
- Metadati DCAT-AP_IT 2.1 (titolo, descrizione, publisher, IPA code, tema DCAT, licenza)
- **Auto-detect ontologie**: analizza automaticamente le colonne del CSV e suggerisce le ontologie più adatte
- Ontologie comuni sempre visibili + sezione avanzate espandibile
- **Chunking automatico**: il CSV viene suddiviso in blocchi da 25 righe, ogni blocco viene trasformato con una chiamata API separata e i risultati vengono uniti in un unico file TTL completo
- **Prompt compatto**: output RDF senza commenti né righe vuote per massimizzare i token utili
- Scelta provider AI: **Mistral**, **Groq**, **Google Gemini**, **Ollama** (locale o remoto)
- Statistiche sull'output (triple RDF, prefissi, entità)
- Download diretto del file `.ttl`
- Validazione online via W3C RDF Validator
- UI **Bootstrap Italia** — conforme alle linee guida AgID
- Zero backend: funziona interamente nel browser

## Architettura

```
Browser (GitHub Pages)
    ├── → Mistral API   (api.mistral.ai)
    ├── → Groq API      (api.groq.com)
    ├── → Gemini API    (generativelanguage.googleapis.com)
    └── → Ollama        (locale o server remoto)
```

Applicazione **100% statica**: nessun server intermedio, nessun backend proprietario. La chiamata AI avviene direttamente dal browser verso il provider scelto. Le API key rimangono solo nel browser dell'utente.

## Chunking automatico

Per dataset con molte righe il sistema suddivide automaticamente il CSV in blocchi da 25 righe:

```
Chiamata 0: @prefix + blocco dcat:Dataset
Chiamata 1: righe   1-25  → entità RDF
Chiamata 2: righe  26-50  → entità RDF
Chiamata 3: righe  51-75  → entità RDF
...
Merge finale → un unico file .ttl completo
```

La barra di stato mostra il progresso chunk per chunk.

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. L'app è subito disponibile su `https://<tuo-username>.github.io/CSV-to-RDF`

## Configurazione provider AI

### 🟠 Mistral
Ottieni la API key su [console.mistral.ai](https://console.mistral.ai).
Modelli: `mistral-large-latest` (consigliato), `mistral-medium-latest`, `mistral-small-latest`, `open-mistral-7b`.
Nessun rate limit problematico — consigliato per dataset grandi.

### ⚡ Groq
Ottieni la API key su [console.groq.com](https://console.groq.com) (piano gratuito disponibile).
Modelli: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`.
Molto veloce ma con rate limit token/minuto sul piano free — consigliato per dataset piccoli.

### ✨ Google Gemini
Ottieni la API key gratuita su [Google AI Studio](https://aistudio.google.com/app/apikey). Nessuna carta di credito richiesta.
Modelli: `gemini-2.0-flash` (consigliato), `gemini-1.5-pro`, `gemini-1.5-flash`.
Piano free: **1500 richieste/giorno · 1M token/minuto** — ideale per il chunking su dataset grandi.

### 🦙 Ollama
**Locale** — avvia con CORS abilitato:
```bash
OLLAMA_ORIGINS=* ollama serve
```
**Remoto / Cloud** — inserisci l'URL del server Ollama remoto e l'eventuale API key per l'autenticazione.

## Ontologie supportate

Tutte le ontologie provengono dal repository ufficiale **[github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets)**.

### Ontologie comuni
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

### Ontologie avanzate
| Prefisso | Descrizione |
|----------|-------------|
| `acco`       | Strutture ricettive (Accommodation) |
| `ac`         | Condizioni di accesso (AccessCondition) |
| `park`       | Parcheggi |
| `cpsv`       | Servizi pubblici (CPSV-AP) |
| `cultural-on`| Patrimonio culturale |
| `gtfs`       | Trasporto pubblico |
| `route`      | Percorsi |
| `lang`       | Lingue |
| `iot`        | Internet of Things |
| `transp`     | Trasparenza PA |

## Standard di riferimento

- **DCAT-AP_IT 2.1** — profilo italiano per i metadati dei dataset
- **Dublin Core** (`dct:`)
- **W3C WGS84** (`geo:`) — coordinate geografiche
- **FOAF** — persone e organizzazioni
- **schema.gov.it** — catalogo nazionale

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato da [piersoft](https://github.com/piersoft) nell'ambito degli strumenti per i dati aperti della PA italiana.
Ontologie: [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets) · Standard: [dati.gov.it](https://dati.gov.it) · [schema.gov.it](https://schema.gov.it)

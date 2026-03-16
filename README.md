# CSV → RDF/TTL — Strumento semantico per la PA italiana

Strumento open source per trasformare dataset CSV della Pubblica Amministrazione italiana in file **Turtle (TTL) RDF**, allineati a **DCAT-AP_IT** e alle ontologie ufficiali pubblicate su [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets).

👉 **Demo live**: [https://piersoft.github.io/CSV-to-RDF](https://piersoft.github.io/CSV-to-RDF)

---

## Funzionalità

- Incolla qualsiasi CSV con intestazioni → ottieni il file `.ttl` semantico
- Metadati DCAT-AP_IT (titolo, descrizione, publisher, IPA code, tema DCAT, licenza)
- **Auto-detect ontologie**: analizza automaticamente le colonne del CSV e suggerisce le ontologie più adatte
- Ontologie comuni sempre visibili + sezione avanzate espandibile
- Scelta provider AI: **Mistral**, **Groq**, **Ollama** (locale o remoto)
- Statistiche sull'output (triple RDF, prefissi, entità)
- Download diretto del file `.ttl`
- Validazione online via W3C RDF Validator
- UI **Bootstrap Italia** — conforme alle linee guida AgID
- Zero backend: funziona interamente nel browser

## Architettura

```
Browser (GitHub Pages)
    ├── → Mistral API  (api.mistral.ai)
    ├── → Groq API     (api.groq.com)
    └── → Ollama       (localhost:11434 o URL remoto)
```

Applicazione **100% statica**: nessun server intermedio, nessun backend proprietario. La chiamata AI avviene direttamente dal browser verso il provider scelto. La API key rimane solo nel browser dell'utente.

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. L'app è subito disponibile su `https://<tuo-username>.github.io/CSV-to-RDF`

## Configurazione provider AI

### Mistral
Ottieni la API key su [console.mistral.ai](https://console.mistral.ai) e incollala nel campo apposito. Modelli consigliati: `mistral-large-latest`, `mistral-medium-latest`.

### Groq
Ottieni la API key su [console.groq.com](https://console.groq.com) (piano gratuito disponibile). Modelli consigliati: `llama-3.3-70b-versatile`.

### Ollama (locale)
Avvia Ollama con CORS abilitato:
```bash
OLLAMA_ORIGINS=* ollama serve
```
Oppure imposta l'URL di un server Ollama remoto nell'interfaccia.

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
| `acco` | Strutture ricettive (Accommodation) |
| `ac`   | Condizioni di accesso (AccessCondition) |
| `park` | Parcheggi |
| `cpsv` | Servizi pubblici (CPSV-AP) |
| `cultural-on` | Patrimonio culturale |
| `gtfs` | Trasporto pubblico (GTFS) |
| `route`| Percorsi |
| `lang` | Lingue |
| `iot`  | Internet of Things |
| `transp`| Trasparenza PA |

## Standard di riferimento

- **DCAT-AP_IT** — profilo italiano per i metadati dei dataset
- **Dublin Core** (`dct:`)
- **W3C WGS84** (`geo:`) — coordinate geografiche
- **FOAF** — persone e organizzazioni
- **schema.gov.it** — catalogo nazionale

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato da [piersoft](https://github.com/piersoft) nell'ambito degli strumenti per i dati aperti della PA italiana.  
Ontologie: [github.com/italia/dati-semantic-assets](https://github.com/italia/dati-semantic-assets) · Standard: [dati.gov.it](https://dati.gov.it) · [schema.gov.it](https://schema.gov.it)

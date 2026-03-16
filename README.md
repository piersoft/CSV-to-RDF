# CSV → RDF/TTL — Strumento semantico per la PA italiana

Strumento open source per trasformare dataset CSV della Pubblica Amministrazione italiana in file **Turtle (TTL) RDF**, arricchiti con le ontologie [OntoPiA](https://github.com/italia/ontopia) e allineati a **DCAT-AP_IT 3.0**.

👉 **Demo live**: [https://piersoft.github.io/csv2rdf-pa](https://piersoft.github.io/csv2rdf-pa)

---

## Funzionalità

- Incolla qualsiasi CSV con intestazioni → ottieni il file `.ttl` semantico
- Metadati DCAT-AP_IT 3.0 (titolo, descrizione, publisher, IPA code, tema, licenza)
- Selezione ontologie OntoPiA: CLV, COV, CPV, L0, POI, SM, RO, TI
- Statistiche sull'output (triple, prefissi, entità)
- Download diretto del file `.ttl`
- Validazione online via W3C RDF Validator
- UI Bootstrap Italia — conforme alle linee guida AgID

## Architettura

```
[Browser] → [VPS Node.js /api/chat] → [LLM: Mistral/Groq] → TTL
```

Il frontend è puro HTML/JS statico, deployabile su **GitHub Pages** senza nessun backend aggiuntivo.  
La chiamata AI viene instradata al tuo server VPS (`ckan-mcp-server-docker-ollama`).

## Deploy su GitHub Pages

1. Forka o clona questo repo
2. Vai su **Settings → Pages → Source: Deploy from branch → main / root**
3. Nella pagina, imposta l'URL del tuo server AI nel campo "URL server VPS"

## Configurazione server (API compatibile)

Il frontend invia un `POST` con body:

```json
{
  "message": "..prompt TTL...",
  "provider": "mistral",
  "conversationHistory": []
}
```

E si aspetta una risposta con uno dei campi: `response`, `message`, `content`, o `choices[0].message.content`.

Compatibile con il progetto [`ckan-mcp-server-docker-ollama`](https://github.com/piersoft/ckan-mcp-server-docker-ollama).

## Ontologie supportate (OntoPiA / schema.gov.it)

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

## Licenza

MIT — Strumento open source per la PA italiana.

---

Sviluppato nell'ambito del progetto [ckan-mcp-server-docker-ollama](https://github.com/piersoft/ckan-mcp-server-docker-ollama).

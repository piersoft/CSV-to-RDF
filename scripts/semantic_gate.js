/**
 * semanticGate.js  —  v1.0
 * ========================
 * Motore "Suggerimento Semantico" per CSV PA italiani.
 *
 * Valuta un CSV su tre dimensioni (S / O / L) e produce:
 *   - stato:      "BLOCCANTE" | "MIGLIORABILE" | "OTTIMALE"
 *   - score:      0-100
 *   - blockers:   array di problemi che impediscono la conversione
 *   - warnings:   array di miglioramenti consigliati
 *   - suggestions: per ogni ontologia rilevata, colonne da rinominare/aggiungere
 *   - renamed_headers: mappa { vecchio_nome → nuovo_nome_suggerito }
 *
 * Soglie:
 *   score < 40  → BLOCCANTE  (gate chiuso, non si converte)
 *   40 ≤ score < 70 → MIGLIORABILE (gate chiuso, si suggerisce come migliorare)
 *   score ≥ 70  → OTTIMALE   (gate aperto, si converte)
 *
 * Uso:
 *   const result = computeSemanticScore(headers, rows, ontos, title, description);
 *   if (result.stato === 'OTTIMALE') { /* converti * / }
 */

// ── Pattern ideali per ontologia ─────────────────────────────────────────────
const ONTO_PATTERNS = {
  'CLV': {
    required_any: ['comune','indirizzo','via','cap','provincia','localita','full_address'],
    bonus:        ['lat','lon','civico','regione','cod_istat'],
    label:        'Indirizzi e Luoghi (CLV)',
    rename_map:   { 'ubicazione':'indirizzo','city':'comune','address':'indirizzo',
                    'postal_code':'cap','location':'localita','citta':'comune' },
    add_suggest:  ['lat','lon'],
    doc_url:      'https://schema.gov.it/lodview/onto/CLV',
  },
  'POI': {
    required_any: ['lat','lon','latitudine','longitudine','x_wgs84','y_wgs84','coorx','coory'],
    bonus:        ['nome','descrizione','tipo','indirizzo','comune','tipo_poi'],
    label:        'Punti di Interesse (POI)',
    rename_map:   { 'latitude':'lat','longitude':'lon','y':'lat','x':'lon',
                    'coord_lat':'lat','coord_lon':'lon',
                    'latitudine':'lat','longitudine':'lon' },
    add_suggest:  ['nome','tipo_poi','descrizione'],
    doc_url:      'https://schema.gov.it/lodview/onto/POI',
  },
  'QB': {
    required_any: ['anno','valore','totale','importo','quantita','indicatore','occorrenze'],
    bonus:        ['comune','provincia','sesso','mese','trimestre','misura'],
    label:        'Dati Statistici Aggregati (QB/DataCube)',
    rename_map:   { 'year':'anno','value':'valore','count':'occorrenze','amount':'importo' },
    add_suggest:  ['anno','comune','misura'],
    doc_url:      'https://www.w3.org/TR/vocab-data-cube/',
  },
  'TI': {
    required_any: ['data_inizio','data_fine','data_evento','periodo','data','reftime','anno_riferimento'],
    bonus:        ['titolo','tipo_evento','luogo','comune','ora'],
    label:        'Intervallo Temporale (TI)',
    rename_map:   { 'start':'data_inizio','end':'data_fine','date':'data',
                    'from':'data_inizio','to':'data_fine','timestamp':'reftime' },
    add_suggest:  ['data_inizio','data_fine'],
    doc_url:      'https://schema.gov.it/lodview/onto/TI',
  },
  'COV': {
    required_any: ['ragione_sociale','denominazione','partita_iva','codice_ateco','azienda','cf_impresa'],
    bonus:        ['codice_fiscale','comune','indirizzo','forma_giuridica','numero_addetti'],
    label:        'Organizzazioni / Imprese (COV)',
    rename_map:   { 'company':'ragione_sociale','name':'denominazione',
                    'vat':'partita_iva','piva':'partita_iva','ditta':'ragione_sociale' },
    add_suggest:  ['codice_ateco','comune'],
    doc_url:      'https://schema.gov.it/lodview/onto/COV',
  },
  'PublicContract': {
    required_any: ['cig','codice_cig','cup','oggetto_contratto','stazione_appaltante','oggetto_gara'],
    bonus:        ['importo_aggiudicazione','aggiudicatario','data_aggiudicazione','cpv_codice','rup'],
    label:        'Appalti Pubblici (PublicContract)',
    rename_map:   { 'codice_gara':'cig','oggetto':'oggetto_contratto',
                    'importo':'importo_aggiudicazione','appaltante':'stazione_appaltante' },
    add_suggest:  ['cig','stazione_appaltante','importo_aggiudicazione','data_aggiudicazione'],
    doc_url:      'https://schema.gov.it/lodview/onto/PublicContract',
  },
  'Cultural-ON': {
    required_any: ['tipo_bene','denominazione','autore','datazione','localizzazione',
                   'numero_inventario','codice_scheda','soggetto'],
    bonus:        ['comune','provincia','regione','conservazione','tecnica','materiale'],
    label:        'Beni Culturali (Cultural-ON / ArCo)',
    rename_map:   { 'name':'denominazione','author':'autore',
                    'location':'localizzazione','title':'denominazione' },
    add_suggest:  ['tipo_bene','denominazione','comune','localizzazione'],
    doc_url:      'https://dati.beniculturali.it/lodview/cultural-ON',
  },
  'IoT': {
    required_any: ['id_sensore','stazione','valore','agente_atm','inquinante','unita_misura',
                   'idsensore','sensor_id'],
    bonus:        ['reftime','data','lat','lon','validato','qualita'],
    label:        'Sensori / Misurazioni IoT',
    rename_map:   { 'sensor_id':'id_sensore','station':'stazione',
                    'value':'valore','timestamp':'reftime','misura':'valore' },
    add_suggest:  ['id_sensore','reftime','unita_misura'],
    doc_url:      'https://schema.gov.it/lodview/onto/IoT',
  },
  'ACCO': {
    required_any: ['stelle','posti_letto','camere','struttura_ricettiva','categoria_struttura',
                   'classificazione_struttura'],
    bonus:        ['comune','indirizzo','lat','lon','email','telefono'],
    label:        'Strutture Ricettive (ACCO)',
    rename_map:   { 'stars':'stelle','beds':'posti_letto',
                    'rooms':'camere','hotel_type':'categoria_struttura' },
    add_suggest:  ['stelle','posti_letto','lat','lon'],
    doc_url:      'https://schema.gov.it/lodview/onto/ACCO',
  },
  'GTFS': {
    required_any: ['stop_id','route_id','trip_id','agency_id'],
    bonus:        ['stop_name','stop_lat','stop_lon','route_short_name','arrival_time'],
    label:        'Trasporto Pubblico (GTFS)',
    rename_map:   { 'fermata_id':'stop_id','linea_id':'route_id','corsa_id':'trip_id' },
    add_suggest:  ['stop_lat','stop_lon','stop_name'],
    doc_url:      'https://gtfs.org/reference/static/',
  },
  'PARK': {
    required_any: ['stalli','stalli_totali','posti_auto','tipo_parcheggio','tariffa_oraria',
                   'id_parcheggio'],
    bonus:        ['lat','lon','comune','indirizzo','stalli_disabili','accessibile_h24'],
    label:        'Parcheggi (PARK)',
    rename_map:   { 'spots':'stalli','parking_type':'tipo_parcheggio','rate':'tariffa_oraria' },
    add_suggest:  ['stalli_totali','tipo_parcheggio','lat','lon'],
    doc_url:      'https://schema.gov.it/lodview/onto/PARK',
  },
  'CPSV-AP': {
    required_any: ['nome_servizio','url_servizio','canale_erogazione','ente_erogatore',
                   'identificativo_servizio'],
    bonus:        ['requisiti_accesso','output_servizio','costo','tempo_risposta','settore'],
    label:        'Servizi Pubblici (CPSV-AP)',
    rename_map:   { 'service_name':'nome_servizio','service_url':'url_servizio',
                    'servizio':'nome_servizio' },
    add_suggest:  ['nome_servizio','url_servizio','canale_erogazione'],
    doc_url:      'https://joinup.ec.europa.eu/collection/cpsvap',
  },
  'SMAPIT': {
    required_any: ['codice_meccanografico','denominazione_istituto','tipo_scuola',
                   'codice_comune_istat','codice_struttura'],
    bonus:        ['indirizzo','comune','provincia','lat','lon','email'],
    label:        'Strutture Pubbliche (SM-AP-IT)',
    rename_map:   { 'school_code':'codice_meccanografico','school_name':'denominazione_istituto' },
    add_suggest:  ['codice_meccanografico','comune','lat','lon'],
    doc_url:      'https://schema.gov.it/lodview/onto/SM',
  },
  'RO': {
    required_any: ['candidato','eletto','partito','seggio','voti','lista_elettorale',
                   'qualifica','totale_uomini','totale_donne'],
    bonus:        ['anno','comune','circoscrizione','ente','turno'],
    label:        'Personale PA / Elezioni (RO)',
    rename_map:   { 'role':'qualifica','male':'totale_uomini','female':'totale_donne',
                    'candidate':'candidato' },
    add_suggest:  ['qualifica','anno'],
    doc_url:      'https://schema.gov.it/lodview/onto/RO',
  },
};

// ── Normalizzazione header ────────────────────────────────────────────────────
function normH(h) {
  return String(h).toLowerCase().trim()
    .replace(/[àáâã]/g,'a').replace(/[èéêë]/g,'e')
    .replace(/[ìíîï]/g,'i').replace(/[òóôõ]/g,'o')
    .replace(/[ùúûü]/g,'u').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}

// ── Calcolo dimensione S (struttura) — 0-40 ──────────────────────────────────
function scoreStruttura(headers, rows, rawMeta) {
  let score = 0;
  const blockers = [], warnings = [];
  const m = rawMeta || {};

  // S1: file non vuoto (10 pt — bloccante se 0)
  if (!headers || headers.length === 0) {
    blockers.push({ id:'S1', msg:'File vuoto o senza intestazioni rilevabili' });
    return { score: 0, blockers, warnings };
  }
  score += 10;

  // S2: header in riga 1 (10 pt — warning se != 0)
  const headerRow = m.header_row || 0;
  if (headerRow === 0) {
    score += 10;
  } else {
    warnings.push({ id:'S2', msg:`Le intestazioni sono alla riga ${headerRow+1} anziché alla riga 1. Rimuovi le righe iniziali non-dati.` });
    score += 4;
  }

  // S3: nessuna colonna Unnamed/vuota (10 pt)
  const unnamed = headers.filter(h => !h || /^unnamed/i.test(String(h)) || String(h).trim() === '');
  if (unnamed.length === 0) {
    score += 10;
  } else if (unnamed.length <= 2) {
    warnings.push({ id:'S3', msg:`${unnamed.length} colonna/e senza nome o "Unnamed". Dai nomi significativi a tutte le intestazioni.` });
    score += 4;
  } else {
    blockers.push({ id:'S3', msg:`${unnamed.length} colonne senza nome su ${headers.length}. Il CSV non è strutturato correttamente.` });
  }

  // S4: almeno 3 righe dati (10 pt — bloccante se 0)
  const nRows = rows ? rows.length : 0;
  if (nRows === 0) {
    blockers.push({ id:'S4', msg:'Nessuna riga di dati. Il CSV contiene solo le intestazioni.' });
  } else if (nRows < 3) {
    warnings.push({ id:'S4', msg:`Solo ${nRows} riga/righe di dati. Per una buona conversione RDF servono almeno 3 righe.` });
    score += 5;
  } else {
    score += 10;
  }

  return { score, blockers, warnings };
}

// ── Calcolo dimensione O (ontologie) — 0-40 ──────────────────────────────────
function scoreOntologie(headers, rows, ontos) {
  let score = 0;
  const blockers = [], warnings = [];
  const normHeaders = headers.map(normH);

  // O1: almeno una ontologia riconosciuta (20 pt — bloccante se nessuna)
  if (!ontos || ontos.length === 0) {
    blockers.push({
      id: 'O1',
      msg: 'Nessuna ontologia PA italiana riconosciuta. Le intestazioni del CSV non corrispondono a nessun vocabolario controllato noto.',
    });
    return { score: 0, blockers, warnings, matched_ontos: [] };
  }
  score += 20;

  // O2: qualità delle ontologie rilevate (10 pt)
  const primaryOnto = ontos[0];
  const pattern = ONTO_PATTERNS[primaryOnto];
  let matchCount = 0;
  if (pattern) {
    matchCount = pattern.required_any.filter(req => normHeaders.some(h => h.includes(req))).length;
    if (matchCount >= 2) score += 10;
    else if (matchCount === 1) { score += 4; warnings.push({ id:'O2', msg:`Solo 1 colonna chiave riconosciuta per ${primaryOnto}. Aggiungi più campi semantici.` }); }
    else { warnings.push({ id:'O2', msg:`Ontologia ${primaryOnto} rilevata da contesto ma nessuna colonna chiave trovata.` }); }
  }

  // O3: coerenza (2+ ontologie compatibili) (10 pt)
  const COMPATIBLE = {
    'CLV':    ['POI','TI','COV','ACCO','SMAPIT','Cultural-ON','CPSV-AP','PARK'],
    'POI':    ['CLV','TI','Cultural-ON','ACCO','PARK','SMAPIT'],
    'QB':     ['TI','COV','RO','CPV'],
    'TI':     ['QB','CLV','POI','Cultural-ON','CPSV-AP','CPEV'],
    'COV':    ['CLV','TI','PublicContract'],
    'PublicContract': ['COV','CLV','TI','CPSV-AP'],
    'IoT':    ['TI','CLV','POI'],
    'GTFS':   ['CLV','TI','POI'],
    'ACCO':   ['CLV','POI','TI'],
    'Cultural-ON': ['CLV','POI','TI'],
    'PARK':   ['CLV','POI'],
    'SMAPIT': ['CLV','POI'],
    'CPSV-AP':['CLV','COV','TI','PublicContract'],
    'RO':     ['QB','TI','COV'],
  };
  if (ontos.length >= 2) {
    const compatible = COMPATIBLE[primaryOnto] || [];
    const secondOk = ontos.slice(1).some(o => compatible.includes(o));
    if (secondOk) score += 10;
    else warnings.push({ id:'O3', msg:`Combinazione ontologie insolita: ${ontos.join(' + ')}. Verifica che le colonne siano coerenti con un singolo dominio.` });
  }

  return { score, blockers, warnings, matched_ontos: ontos, match_count: matchCount };
}

// ── Calcolo dimensione L (linked data) — 0-20 ────────────────────────────────
function scoreLinkedData(headers, rows) {
  let score = 0;
  const warnings = [];
  const normHeaders = headers.map(normH);

  // L1: intestazioni lowercase_underscore (10 pt)
  const badCased = headers.filter(h => {
    const s = String(h).trim();
    return s && !/^[a-z][a-z0-9_]*$/.test(s);
  });
  if (badCased.length === 0) {
    score += 10;
  } else if (badCased.length <= headers.length * 0.4) {
    score += 5;
    warnings.push({
      id: 'L1',
      msg: `${badCased.length} intestazioni non seguono le etichette delle ontologie (minuscolo con underscore): ${badCased.slice(0,4).map(h=>`"${h}"`).join(', ')}${badCased.length>4?'…':''}. Le LG AGID Open Data (Allegato B) raccomandano di allineare i nomi colonna alle etichette dei vocabolari del Catalogo Nazionale della Semantica dei Dati (schema.gov.it).`,
    });
  } else {
    warnings.push({
      id: 'L1',
      msg: `La maggior parte delle intestazioni non è in formato snake_case. Le LG AGID Open Data raccomandano nomi colonna in minuscolo con underscore.`,
    });
  }

  // L2: presenza di identificatore univoco (10 pt)
  const hasId = normHeaders.some(h =>
    ['id','codice','identifier','uuid','pk','key','cod'].some(id => h === id || h.startsWith(id+'_') || h.endsWith('_'+id))
  );
  if (hasId) {
    score += 10;
  } else {
    warnings.push({
      id: 'L2',
      msg: 'Nessuna colonna identificatore univoco (id, codice, uuid...). Aggiungere un identificatore facilita il collegamento con altri dataset.',
    });
  }

  return { score, warnings };
}

// ── Generazione suggerimenti specifici per ontologia ─────────────────────────
function generateSuggestions(headers, ontos) {
  const normHeaders = headers.map(normH);
  const suggestions = [];
  const renamed_headers = {};

  for (const onto of (ontos || [])) {
    const pattern = ONTO_PATTERNS[onto];
    if (!pattern) continue;

    const renames = [], adds = [];

    // Rinomina: cerca colonne con nome errato ma semantica corretta
    for (const [wrong, right] of Object.entries(pattern.rename_map)) {
      const wrongNorm = normH(wrong);
      const rightNorm = normH(right);
      // Controlla se il nome corretto è già presente
      if (normHeaders.some(h => h === rightNorm)) continue;
      // Controlla se il nome sbagliato è presente
      const idx = normHeaders.findIndex(h => h === wrongNorm || h.includes(wrongNorm));
      if (idx >= 0) {
        const originalName = headers[idx];
        renames.push({ da: originalName, a: right });
        renamed_headers[originalName] = right;
      }
    }

    // Aggiungi: colonne required_any mancanti
    for (const req of pattern.required_any) {
      const reqNorm = normH(req);
      const present = normHeaders.some(h => h === reqNorm || h.includes(reqNorm));
      if (!present && !adds.find(a => a.colonna === req)) {
        const bonus = pattern.add_suggest.includes(req);
        adds.push({ colonna: req, priorita: bonus ? 'alta' : 'media' });
      }
    }

    // Aggiungi: colonne bonus mancanti (max 3, non bloccanti)
    let bonusAdded = 0;
    for (const bon of pattern.bonus) {
      if (bonusAdded >= 3) break;
      const bonNorm = normH(bon);
      const present = normHeaders.some(h => h === bonNorm || h.includes(bonNorm));
      if (!present) {
        adds.push({ colonna: bon, priorita: 'bassa' });
        bonusAdded++;
      }
    }

    if (renames.length > 0 || adds.length > 0) {
      suggestions.push({
        onto,
        label: pattern.label,
        doc_url: pattern.doc_url,
        renames: renames.length > 0 ? renames : null,
        aggiungi: adds.length > 0 ? adds : null,
      });
    }
  }

  return { suggestions, renamed_headers };
}

// ── Funzione principale ───────────────────────────────────────────────────────
function computeSemanticScore(headers, rows, ontos, title, description, rawMeta) {
  if (!headers || headers.length === 0) {
    return {
      stato: 'BLOCCANTE',
      score: 0,
      blockers: [{ id:'S0', msg:'Nessun header rilevato. Il file non è un CSV valido o è vuoto.' }],
      warnings: [], suggestions: [], renamed_headers: {},
    };
  }

  const S = scoreStruttura(headers, rows, rawMeta);
  const O = scoreOntologie(headers, rows, ontos);
  const L = scoreLinkedData(headers, rows);

  const allBlockers = [...S.blockers, ...O.blockers];
  const allWarnings = [...S.warnings, ...O.warnings, ...L.warnings];

  // Score totale pesato S(40) + O(40) + L(20)
  const totalScore = Math.min(100, S.score + O.score + L.score);

  let stato;
  if (allBlockers.length > 0 || totalScore < 40) {
    stato = 'BLOCCANTE';
  } else if (totalScore < 70) {
    stato = 'MIGLIORABILE';
  } else {
    stato = 'OTTIMALE';
  }

  const { suggestions, renamed_headers } = generateSuggestions(headers, ontos);

  return {
    stato,
    score: totalScore,
    score_detail: { struttura: S.score, ontologie: O.score, linked_data: L.score },
    blockers:       allBlockers,
    warnings:       allWarnings,
    suggestions,
    renamed_headers,
    ontos_detected: ontos || [],
    title_hint:     title || '',
  };
}

// ── Export (compatibile browser + Node) ──────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeSemanticScore, ONTO_PATTERNS, normH };
}

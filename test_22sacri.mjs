const window = { _corpusIndex: null };
const _workerState = { _corpusIndex: null };

function detectOntologiesDeterministic(headers, rows) {
  var norm = headers.map(function(h){
    return h.toLowerCase().trim().replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');
  });
  var vals = (rows||[]).slice(0,5).map(function(r){
    return Object.values(r).join(' ').toLowerCase();
  }).join(' ');
  // Se il CSV ha testo narrativo lungo (celle >80 chars in media), usa solo header
  // per evitare falsi positivi da parole nel testo libero
  var _avgCellLen = 0;
  if((rows||[]).length > 0) {
    var _allVals = (rows||[]).slice(0,5).flatMap(function(r){return Object.values(r).map(function(v){return String(v||'');});});
    _avgCellLen = _allVals.reduce(function(a,b){return a+b.length;},0) / Math.max(_allVals.length,1);
  }
  // CSV narrativo se: media celle > 40 chars O almeno una cella > 120 chars
  var _maxCellLen = 0;
  if((rows||[]).length > 0) {
    var _allVals2 = (rows||[]).slice(0,5).flatMap(function(r){return Object.values(r).map(function(v){return String(v||'');});});
    _maxCellLen = Math.max.apply(null, _allVals2.map(function(v){return v.length;}));
  }
  var _narrativeCSV = _avgCellLen > 40 || _maxCellLen > 120;
  // Per CSV narrativi: usa solo gli header ma solo come parole intere (non substring)
  // Questo evita che "popolazione_target" faccia match su "popolazione"
  var allText;
  if(_narrativeCSV) {
    // Match solo su header normalizzati esatti — non substring parziali
    allText = ' ' + norm.join(' ') + ' ';
  } else {
    allText = norm.join(' ') + ' ' + vals;
  }
  var has = function(cols) {
    if(typeof cols === 'string') return allText.includes(cols);
    return cols.some(function(c){ return allText.includes(c); });
  };

  var result = new Set();

  // Funzione separata solo-header per ontologie che non devono fare match sui valori
  var hasH = function(cols) {
    return cols.some(function(c){ return norm.indexOf(c)>=0; });
  };

  // CLV — SOLO se nelle intestazioni ci sono campi indirizzo/coordinate strutturati
  if(hasH(['lat','lon','indirizzo','via','civico','comune','cap','latitudine','longitudine','stop_lat','stop_lon',
            'lat_wgs84','lon_wgs84','coord_lat','coord_lon','georef_lat','georef_lon',
            'ubicazione_esercizio','n_civico','indirizzo_esercizio']))
    result.add('CLV');

  // GTFS
  if(has(['stop_id','stop_name','route_id','trip_id','agency_id','stop_lat','stop_lon',
          'codice_fermata','nome_fermata','linea','capolinea','percorso','corsa','fermata_id']))
    result.add('GTFS');

  // SMAPIT — scuole: richiede colonne specifiche istruzione
  // P4-FIX: "istituto" generico (banche, sanità, cultura) NON è SMAPIT
  if(has(['codice_scuola','codicescuola','denominazione_scuola','tipo_scuola','ciclo_scolastico',
          'ordine_scuola','grado_scolastico','codice_meccanografico']) ||
     (has(['scuola','liceo','comprensivo','istruzione']) && !has(['cig','importo','appalto','museo','biblioteca','ospedale','banca'])))
    result.add('SMAPIT');

  // ACCO — strutture ricettive con varianti PA regionali
  // FN-ACCO FIX: aggiunge "classificazione/categoria_struttura/RTA/B&B" comuni
  // ACCO — R5-FIX: trigger forti sempre; trigger deboli richiedono contesto
  var _accoStrong = has(['albergo','hotel','b&b','ostello','agriturismo','accommodation',
                         'struttura_ricettiva','rta','affittacamere','casa_vacanze','codice_struttura_acco']);
  var _accoCtx    = has(['stelle','posti_letto','numero_posti_letto','camere','letti',
                         'check_in','check_out','classificazione_struttura','categoria_struttura']);
  var _isEsercizioCommerciale = hasH(['insegna','insegna_commerciale']) && hasH(['ragione_sociale']);
  if((_accoStrong || _accoCtx) && !_narrativeCSV && !_isEsercizioCommerciale)
    result.add('ACCO');

  // IOT — sensori fisici: richiede identificatore sensore O proprietà misurata specifica
  // P5-FIX: "valore/misura" generici NON sono IoT senza id_sensore o proprieta_osservata
  if(has(['id_sensore','idsensore','id_sensore2','iot:sensor','proprieta_osservata','tipo_misura','data_ricezione','avgspeed',
          'enterococchi','escherichia','coliformi','parametro_chimico','parametro_biologico',
          'valore_misurato','concentrazione','turbidita','ph_acqua','ossigeno_disciolto',
          'pm10','pm25','no2','co2','so2','ozono','benzene']) ||
     (has(['sensore','sensor']) && has(['valore','misura','unita'])) ||
     (has(['temperatura','umidita','pressione','precipitazioni','velocita_vento','valore_medio']) && has(['lat','lon'])) ||
     (has(['unita_misura','limite']) && has(['lat','lon','longitude','latitude'])))
    if(!_narrativeCSV || has(['id_sensore','idsensore','proprieta_osservata','valore_medio'])) result.add('IoT');

  // POI — R3-FIX: LATITUDINE/LONGITUDINE MAIUSCOLE + UTMX/UTMY
  var _hasPOIcoord = hasH(['lat','lon','latitudine','longitudine','utmx','utmy',
                            'x_wgs84','y_wgs84','coord_x','coord_y','longitude','latitude',
                            'coordx','coordy','x_coord','y_coord']);
  // OSM schema: osm_id + lat/lon → POI forte (defibrillatori, punti interesse OSM)
  var _hasOSMschema = has(['osm_id','osm_type']) && _hasPOIcoord;
  if(has(['tipo_poi','dae','defibrillatore','punto_di_interesse','punto_interesse',
          'point_of_interest','idelem','id_elem',
          'id_area','id_punto','codice_stazione','stazione_monitoraggio','punto_monitoraggio']) || _hasOSMschema) {
    result.add('POI');
  } else if(has(['insegna','nome_esercizio','insegna_commerciale']) &&
            has(['attivita','tipo_esercizio','categoria_esercizio']) &&
            has(['ubicazione_esercizio','indirizzo_esercizio','n_civico','numero_civico'])) {
    // Esercizi commerciali senza coordinate: insegna + tipo attività + indirizzo → POI
    result.add('POI');
  } else if(_hasPOIcoord && !result.has('GTFS') &&  // B1: ACCO+lat/lon = anche POI
            !result.has('SMAPIT') && !result.has('QB') &&
            !result.has('Cultural-ON')) { // non aggiungere POI su istituti culturali
    if(has(['nome','denominazione','tipo','categoria','descrizione']) &&
       !has(['mortali','feriti','deceduti','incidenti','importo','spesa','entrata']))
      result.add('POI');
  }

  // OSM schema puro: rimuovi ontologie sbagliate triggerate da valori nel campo name
  if(_hasOSMschema) {
    result.delete('SMAPIT');
    result.delete('Cultural-ON');
    result.delete('ACCO');
    if(result.has('TI') && !has(['data_inizio','data_fine','data_da','data_a','data_evento','quando','inizio','termine','tipo_evento','nome_evento','titolo_evento','manifestazione'])) result.delete('TI');
  }

  // COV — organizzazioni: FIX1 esclude codice_ipa quando accompagnato da colonne di altri domini
  var _hasCOVStrong = has(['codice_ipa','codice_ente','partita_iva','codice_fiscale_ente','ragione_sociale','segnalatore','ente_segnalatore','soggetto_segnalante','amministrazione_titolare','nome_centro','nome_struttura','nome_presidio']) &&
                      !has(['qualifica_dipendente','obbligo_trasparenza','titolo_corso','ore_formazione',
                             'cig','importo_aggiudicazione','tipo_percorso','valore_indicatore']);
  var _hasCOVWeak   = hasH(['amministrazione','ente','pubblica_amministrazione','organizzazione','nome_centro','nome_struttura','unita_operativa','nome_presidio',
                           'comparto','inquadramento','codice_istituzione','codice_ente_bdap']);
  // COV: permesso anche con POI se ragione_sociale presente (esercizi commerciali)
  if(!result.has('ACCO') && !result.has('GTFS') &&
     (!result.has('POI') || _hasCOVStrong) &&
     (_hasCOVStrong || (_hasCOVWeak &&
      !has(['popolazione_residente','numero_famiglie','numero_residenti','nati','morti',
            'incidenti','sinistri','importo_liquidato','spesa_corrente']) &&
      !result.has('QB')))) {
    result.add('COV');
  }

  // CLV toponomastica pura: stradari/civici senza coordinate né trigger forti → rimuovi spurii
  // (deve stare DOPO il blocco COV perché 'Comune' come header triggera COV)
  if(result.has('CLV') && !_hasPOIcoord &&
     !has(['codice_ipa','codice_ente','partita_iva','tipo_poi','nome_poi','dae',
           'data_inizio','data_fine','data_evento','importo','valore','obs_value',
           'qualifica','contratto','ccnl','cig','cup','obbligo_trasparenza',
           'ubicazione_esercizio','n_civico','insegna','ragione_sociale'])) {
    if(result.has('COV') && !has(['codice_ipa','cf_ente','ragione_sociale','tipo_ente','nome_centro','nome_struttura','nome_presidio','unita_operativa'])) result.delete('COV');
    if(result.has('TI')  && !has(['data_inizio','data_fine','data_da','data_a','data_evento','quando','inizio','termine'])) result.delete('TI');
    if(result.has('POI') && !has(['tipo_poi','nome_poi','dae','lat','lon','insegna','insegna_commerciale'])) result.delete('POI');
    if(result.has('CPV') && !has(['cognome','codice_fiscale','nome_completo','data_nascita'])) result.delete('CPV');
  }

  // QB statistico: anno + aggregati numerici senza anagrafica = dati demografici
  if(!_narrativeCSV && !result.has('CPV') && has(['anno']) && (has(['sesso']) || has(['cittadinanza'])) &&
     !has(['cognome','nome_completo','codice_fiscale','data_nascita']))
    result.add('QB');
  // CPV — persone fisiche: richiede cognome O CF O data_nascita+sesso (P3-FIX: esclude QB puro)
  // FN-CPV FIX: aggiunge alias MAIUSCOLI e varianti comuni nei dataset PA
  // CPV — R4-FIX: fascia_eta/tipo_capofamiglia per dataset demografici
  // FIX2: codice_fiscale_sa è della stazione appaltante, non di una persona fisica
  var _hasAnag = has(['cognome','nome_completo','codice_fiscale',
                      'nome_cognome','nominativo','intestatario','titolare','beneficiario',
                      'data_nascita','luogo_nascita','comune_nascita',
                      'tipo_capofamiglia','fascia_eta','classi_eta','eta_','nazionalita']) ||
                 (has(['data_nascita']) && has(['sesso']) && !has(['anno','totale','numero','occorrenze']));
  if(!result.has('SMAPIT') && !result.has('IoT') && _hasAnag)
    result.add('CPV');

  // RO — ruoli
  if(has(['ruolo','incarico','mandato','consigliere','assessore','sindaco','dirigente',
          'id_consigliere','legislatura','voti_validi']))
    result.add('RO');

  // QB — dati statistici aggregati (R2-FIX: blocca su cataloghi ADMS e dataset trasporto)
  // FIX5: include incidenti/feriti/mortali come dati statistici aggregati
  if(has(['anno','mese','occorrenze','totale','numero','valore','indice',
          'popolazione_residente','numero_famiglie',
          'incidenti','feriti','mortali','deceduti','sinistri',
          'count','total','amount','value','measure',
          'dipendenti','personale','addetti','lavoratori','occupati',
          'maschi','femmine','fascia_eta','classe_eta']) &&
     !result.has('ACCO') && !result.has('GTFS') && !result.has('IoT') &&
     !result.has('COV') && !result.has('CPV') && !result.has('SMAPIT') &&
     !result.has('CPSV') && !result.has('ADMS') && !result.has('RO') &&
     !result.has('CulturalON') &&
     !has(['nome_dataset','nome_risorsa','numero_righe','distribution_url']) &&
     !has(['tratta','capolinea','fermata_origine','fermata_arrivo']) &&
     !has(['codice_istat','codice_civico','cod_civico','numero_civico']))  // B3: codici geo —  QB
    if(!_narrativeCSV) result.add('QB');

  // TI — R6-FIX: richiede date esplicite O combo evento+luogo (non solo titolo/tipo)
  var _tiStrong = has(['data_inizio','data_fine','data_da','data_a','data_inizio_evento','data_fine_evento','inizio','termine','quando','orario_inizio',
                       'orario_fine','data_evento','ora_inizio','ora_fine','data_ora',
                       'data_rilevazione','data_apertura','data_chiusura','data_campionamento','data_rilevamento','data_misura','data_monitoraggio',
                       'date','datetime','timestamp','start_date','end_date','created_at','updated_at','time']) ||
                     (hasH(['data']) && has(['valore','misura','rilevazione','monitoraggio','campione','sensore','iot','misura']));
  var _tiEvent  = has(['tipo_evento','nome_iniziativa','nome_evento','manifestazione','data_da','data_a','data_inizio_evento','data_fine_evento',
                       'spettacolo','concerto','rassegna','stagione','programmazione']);
  if(_tiStrong || _tiEvent)
    result.add('TI');

  // CulturalON — solo se colonne specifiche, non valori casuali in indirizzi
  var _cultHdr = norm.filter(function(h){
    return h==='tipo_bene'||h==='datazione'||h==='numero_inventario'||h==='autore'||h==='luoghistorico';
  });
  // FIX3: 'museo'/'teatro' nei valori non bastano — richiede colonne specifiche beni culturali
  if(_cultHdr.length>0 || has(['beniculturali','mibact','mibac','cis:','luoghicultura',
      'nome_museo','mostra','pinacoteca','galleria','sito_archeologico','tipo_bene_culturale']))
    if(!result.has('SMAPIT')&&!result.has('GTFS')&&!result.has('IoT')){
      result.add('Cultural-ON'); result.add('CulturalON'); }
  if(result.has('Cultural-ON') && result.has('POI') && !has(['tipo_poi','dae','defibrillatore']))
    result.delete('POI'); // istituto culturale geolocalizzato —  POI generico
  // CPSV — servizi pubblici / appalti con varianti PA reali
  // FN-CPSV FIX: aggiunge "procedura/licitazione/affidamento" comuni nei dati PA
  if(has(['cig','cup','aggiudicatario','appalto','gara','oggetto_appalto',
          'servizio_pubblico','cpsv','procedura','licitazione','affidamento',
          'scelta_contraente','oggetto_gara','struttura_proponente']))
    result.add('CPSV');
  // M4: servizi pubblici puri (senza CIG) → CPSV-AP
  if(has(['nome_servizio','canale_erogazione','requisiti_accesso','url_servizio']) && !has(['cig','appalto','gara']))
    result.add('CPSV-AP');

  // ADMS — cataloghi / asset semantici
  // FIX4: ADMS richiede contesto specifico, non solo 'versione'
  if(has(['slug','version','creation_date','last_edit_date','api_url',
          'distribution_url','asset','ontologia','vocabolario']) ||
     (has(['versione']) && has(['stato','formato','licenza','tipo_asset','editore'])) ||
     (has(['identifier','nome_dataset','nome_risorsa']) && has(['formato','numero_righe'])))
    result.add('ADMS');

  // Arricchisci con il corpus se disponibile
  if(_workerState._corpusIndex) {
    var _corpusOntos = detectFromCorpus(headers);
    _corpusOntos.forEach(function(o){if((o==='CulturalON'||o==='Cultural-ON')&&result.has('SMAPIT'))return;if(o==='QB'&&(result.has('ACCO')||result.has('POI')||result.has('SMAPIT')))return;result.add(o);});
  }
    var _hasAnagrafica=norm.some(function(n){return n==='cognome'||n==='codice_fiscale'||n==='cf';});
    if(result.has('QB')&&result.has('CPV')&&!_hasAnagrafica) result.delete('CPV'); // QB stats senza cognome
    if(result.has('QB') && (result.has('CulturalON')||result.has('ACCO')||result.has('GTFS'))) result.delete('QB'); // QB non su strutture/trasporti
  // Se SMAPIT rilevato, rimuovi ontologie incompatibili
  if(result.has('SMAPIT')){result.delete('CulturalON');result.delete('Cultural-ON');result.delete('QB');result.delete('CPV');}
  if(result.has('Cultural-ON')) result.add('CulturalON'); // alias retrocompatibilità
  // L0 — sempre aggiunto come base
  if(has(['parcheggio','parking','stalli','posti_auto','capacita_posti','tariffa_oraria','posti_disabili'])) result.add('PARK');
  if(has(['prezzo_intero','prezzo_ridotto','biglietto','tariffa_ingresso','costo_biglietto'])&&!result.has('ACCO')) result.add('POT');
  if(has(['cig','cup','importo_aggiudicazione','stazione_appaltante','oggetto_contratto','aggiudicatario','cpv_codice'])) result.add('PublicContract');
  if(has(['tipo_percorso','lunghezza_km','difficolta','dislivello','numero_tappe','sentiero','percorso_ciclabile','itinerario','tracciato','lat_start','lon_start','durata_stimata','nome_breve_percorso','nome_esteso_percorso'])) result.add('Route');
  if(has(['qualifica_dipendente','contratto_lavoro','ccnl','livello_contrattuale','ore_settimanali'])) result.add('RPO');
  if(has(['titolo_corso','ore_formazione','crediti','ects','titolo_rilasciato','durata_corso'])) result.add('Learning');
  if(has(['obbligo_trasparenza','categoria_trasparenza','dato_obbligatorio','norma_riferimento'])) result.add('Transparency');
  if(!_narrativeCSV && has(['tipo_indicatore','valore_indicatore','baseline','target','fonte_indicatore'])) result.add('Indicator');

  // —— cleanup post-trigger —————————————————————————————————————————————————
  if(result.has('RO')&&result.has('TI')&&!has(['data_evento','titolo_evento','nome_evento','manifestazione','tipo_evento_pubblico'])) result.delete('TI'); // RO: data mandato —  evento
  if(result.has('PublicContract')&&!result.has('COV')) result.add('COV'); // appalti → sempre ente PA
  if(result.has('Route')&&result.has('GTFS')) result.delete('GTFS'); // percorso —  TPL
  if(result.has('Indicator')&&!result.has('QB')) result.add('QB'); // indicatori → sempre dati statistici
  if(result.has('POT')&&result.has('CPV')&&!has(['cognome','codice_fiscale','nome_completo','data_nascita'])) result.delete('CPV'); // tariffe —  persone fisiche

  // —— MU — unità di misura
  if(has(['grandezza','tipo_misura','sistema_misura','unita_misura','unita_di_misura','unit_of_measure'])||has(['simbolo_misura','measurement_unit','measure_type'])) result.add('MU'); // MU anche con IoT
  if(!result.has('MU')&&!result.has('IoT')&&!result.has('QB')&&
     (has(['grandezza','tipo_misura','sistema_misura'])||
      has(['simbolo_misura','measurement_unit','measure_type']))){
    result.add('MU');
  }

  // —— AtlasOfPaths
  if(has(['numero_percorso','numero_tappa','pavimentazione','segnaletica','livello_sicurezza','tipo_servizio_percorso','atlas_path','path_number','stage_number'])){result.add('AtlasOfPaths');}

  // —— CulturalHeritage
  if(has(['codice_bene','tutela','vincolo','stato_conservazione','ente_tutela','cultural_heritage'])||(has(['denominazione_bene'])&&has(['tipo_bene'])&&has(['tutela','vincolo']))){result.add('CulturalHeritage');}

  // —— Project
  if(has(['acronimo_progetto','programma_finanziamento','work_package','costo_totale_progetto','titolo_progetto','unique_project_code'])||(has(['cup'])&&has(['programma_finanziamento','finanziatore']))){result.add('Project');}

  // —— NDC
  if(has(['concetto_chiave','key_concept','endpoint_url','tipo_risorsa','formato_distribuzione','data_service','ndc'])||(has(['titolo_risorsa'])&&has(['tipo_risorsa','endpoint_url']))){result.add('NDC');}

  // —— CPEV — eventi pubblici (richiede titolo_evento o colonne CPEV specifiche)
  if(has(['titolo_evento','evento_pubblico','tipo_evento_pubblico','public_event',
          'format_evento','pubblico_target','abstract_evento'])){
    result.add('CPEV');
    if(!result.has('TI')) result.add('TI');
  }

  // —— AccessCondition — condizioni di accesso a luoghi
  if(has(['orario_apertura','orario_chiusura','tipo_ammissione',
          'condizione_accesso','motivazione_chiusura','giorno_chiusura',
          'accesso_libero','tipo_accesso','admission_type'])){
    result.add('AccessCondition');
  }

  return Array.from(result);
}

const sacri = [
  { name: 'poi', headers: ['id', 'nome_poi', 'tipo_poi', 'lat', 'lon', 'indirizzo', 'comune', 'accessibile_h24', 'email'], expected: ['POI'] },
  { name: 'smapit', headers: ['id', 'codice_scuola', 'denominazione', 'tipo_scuola', 'indirizzo', 'comune', 'provincia', 'cap', 'lat', 'lon', 'email'], expected: ['SMAPIT'] },
  { name: 'iot', headers: ['id', 'id_sensore', 'tipo_sensore', 'proprieta_osservata', 'valore', 'unita_misura', 'data_rilevazione', 'lat', 'lon', 'comune'], expected: ['IoT', 'TI', 'MU', 'POI'] },
  { name: 'acco', headers: ['id', 'denominazione', 'tipo_struttura', 'categoria', 'indirizzo', 'comune', 'provincia', 'cap', 'lat', 'lon', 'posti_letto', 'email', 'sito_web'], expected: ['POI', 'ACCO'] },
  { name: 'cpsv', headers: ['id', 'nome_servizio', 'descrizione_servizio', 'ente_erogatore', 'codice_ipa', 'canale_erogazione', 'requisiti_accesso', 'url_servizio'], expected: ['COV', 'CPSV-AP'] },
  { name: 'gtfs', headers: ['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'zone_id', 'location_type', 'wheelchair_boarding'], expected: ['GTFS'] },
  { name: 'qb', headers: ['anno', 'trimestre', 'comune', 'codice_istat', 'fascia_eta', 'sesso', 'numero_residenti'], expected: ['QB'] },
  { name: 'clv', headers: ['id', 'tipo_via', 'nome_via', 'numero_civico', 'cap', 'comune', 'codice_istat', 'provincia'], expected: [] },
  { name: 'cov', headers: ['id', 'denominazione', 'tipo_ente', 'cf_ente', 'codice_ipa', 'indirizzo', 'comune', 'provincia', 'cap', 'email', 'sito_web'], expected: ['COV'] },
  { name: 'cpv', headers: ['id', 'nome', 'cognome', 'codice_fiscale', 'data_nascita', 'comune_nascita', 'provincia_nascita', 'sesso', 'comune_residenza'], expected: ['CPV'] },
  { name: 'cultural', headers: ['id', 'denominazione', 'tipo_istituto', 'tipo_bene_culturale', 'disciplina', 'indirizzo', 'comune', 'provincia', 'lat', 'lon', 'telefono', 'email', 'data_apertura'], expected: ['Cultural-ON', 'TI'] },
  { name: 'ro', headers: ['id', 'nome', 'cognome', 'codice_fiscale', 'ruolo', 'ente', 'codice_ipa', 'data_inizio', 'data_fine', 'tipo_nomina'], expected: ['RO', 'CPV', 'COV'] },
  { name: 'ti', headers: ['id', 'titolo', 'tipo_evento', 'data_inizio', 'data_fine', 'orario_inizio', 'orario_fine', 'luogo', 'comune', 'provincia', 'lat', 'lon'], expected: ['TI', 'POI'] },
  { name: 'adms', headers: ['id', 'titolo', 'tipo_asset', 'versione', 'stato', 'licenza', 'formato', 'url', 'editore', 'data_rilascio'], expected: ['ADMS'] },
  { name: 'park', headers: ['id', 'nome', 'indirizzo', 'comune', 'provincia', 'lat', 'lon', 'stalli', 'posti_disabili', 'tariffa_oraria', 'tipo_parcheggio', 'accessibile_h24'], expected: ['PARK', 'POI'] },
  { name: 'publiccontract', headers: ['id', 'cig', 'cup', 'oggetto_contratto', 'importo_aggiudicazione', 'stazione_appaltante', 'codice_ipa', 'aggiudicatario', 'cpv_codice', 'data_aggiudicazione', 'modalita_scelta'], expected: ['PublicContract', 'CPSV', 'COV', 'TI'] },
  { name: 'route', headers: ['id', 'denominazione', 'tipo_percorso', 'lunghezza_km', 'difficolta', 'dislivello', 'durata_stimata', 'numero_tappe', 'descrizione', 'comune', 'provincia', 'lat_start', 'lon_start', 'data_apertura', 'data_chiusura'], expected: ['Route', 'TI'] },
  { name: 'rpo', headers: ['id', 'nome', 'cognome', 'codice_fiscale', 'ente', 'codice_ipa', 'qualifica_dipendente', 'contratto_lavoro', 'ccnl', 'livello_contrattuale', 'ore_settimanali', 'data_assunzione'], expected: ['RPO', 'CPV', 'COV', 'TI'] },
  { name: 'learning', headers: ['id', 'titolo_corso', 'ente_erogatore', 'codice_ipa', 'durata_corso', 'ore_formazione', 'crediti', 'titolo_rilasciato', 'modalita', 'data_inizio', 'data_fine', 'comune'], expected: ['Learning', 'TI'] },
  { name: 'transparency', headers: ['id', 'denominazione', 'obbligo_trasparenza', 'categoria_trasparenza', 'dato_obbligatorio', 'norma_riferimento', 'ente', 'codice_ipa', 'anno_pubblicazione', 'url_pubblicazione'], expected: ['Transparency', 'COV'] },
  { name: 'indicator', headers: ['id', 'denominazione', 'tipo_indicatore', 'anno', 'valore_indicatore', 'baseline', 'target', 'unita_misura', 'fonte_indicatore', 'ente', 'codice_ipa'], expected: ['Indicator', 'QB', 'COV', 'MU'] },
  { name: 'pot', headers: ['id', 'denominazione', 'tipo_servizio', 'prezzo_intero', 'prezzo_ridotto', 'biglietto', 'descrizione', 'comune', 'provincia', 'lat', 'lon', 'eta_ridotto'], expected: ['POT', 'POI'] },
  { name: 'esercizi_ristorazione', headers: ['RAGIONE_SOCIALE', 'INSEGNA', 'ATTIVITA', 'UBICAZIONE_ESERCIZIO', 'N_Civico'], expected: ['POI', 'COV', 'CLV'] },
  { name: 'centri_sanitari_sma',
    headers: ['CODICE_ESENZIONE','MALATTIA','NOME_CENTRO','UNITA_OPERATIVA','CITTA','LIVELLO_CENTRO','CENTRO_CAPOFILA_RIFERIMENTO'],
    rows: [{'CODICE_ESENZIONE':'RFG050','MALATTIA':'Atrofie Muscolari Spinali','NOME_CENTRO':'AOU Policlinico Bari','UNITA_OPERATIVA':'Neurologia Pediatrica','CITTA':'Bari','LIVELLO_CENTRO':'Capofila','CENTRO_CAPOFILA_RIFERIMENTO':'AOU Policlinico Bari'}],
    expected: ['COV','CLV'] },
  { name: 'esercizi_ristorazione_latlon', headers: ['RAGIONE_SOCIALE', 'INSEGNA', 'ATTIVITA', 'UBICAZIONE_ESERCIZIO', 'N_Civico', 'Lat', 'Lon'], rows: [{RAGIONE_SOCIALE:'AGRITURISMO MASSERIA LA FAVOLA SRL', INSEGNA:'MASSERIA LA FAVOLA', ATTIVITA:'agriturismo', UBICAZIONE_ESERCIZIO:'s.s. 16', N_Civico:'3', Lat:'40.1', Lon:'16.9'}], expected: ['POI', 'COV', 'CLV'] },
];


const INFRA = new Set(['L0','CLV','SM']);
function normO(o){ return (o==='CulturalON'||o==='Cultural-ON')?'Cultural-ON':o; }
let ok=0, issues=[];

for(const s of sacri){
  const fakeRows=[{}];
  s.headers.forEach(h=>{ fakeRows[0][h]=''; });
  const detected = detectOntologiesDeterministic(s.headers, fakeRows);
  const detMain  = detected.filter(d=>!INFRA.has(d));
  const detNorm  = detMain.map(normO);
  const expNorm  = s.expected.map(normO);
  const fp = detMain.filter(d=>!expNorm.includes(normO(d)));
  const fn = s.expected.filter(e=>!INFRA.has(e)&&!detNorm.includes(normO(e)));
  if(fp.length===0&&fn.length===0){
    ok++;
    console.log(`✅ ${s.name.padEnd(15)} [${s.expected}]`);
  } else {
    issues.push({...s,detMain,fp,fn});
    console.log(`❌ ${s.name.padEnd(15)} atteso:[${s.expected}] rilevato:[${detMain}]`);
    if(fp.length) console.log(`   FP: ${fp}`);
    if(fn.length) console.log(`   FN: ${fn}`);
  }
}

console.log(`\n${'='.repeat(55)}`);
console.log(`✅ OK: ${ok}/25  ❌ Problemi: ${issues.length}`);
if(issues.length===0) console.log('🎉 TUTTI I 25 CSV SACRI PASSANO IL TEST!');


// ── NUOVE ONTOLOGIE v186 ─────────────────────────────────────────────────────
const nuoveOnto = [
  {key:'cpev',        h:['id','titolo_evento','tipo_evento','data_inizio','data_fine','luogo','comune','lat','lon','organizzatore','pubblico_target','format_evento'], exp:['CPEV','TI']},
  {key:'accesscondition', h:['id','nome_luogo','tipo_luogo','orario_apertura','orario_chiusura','tipo_ammissione','motivazione_chiusura','condizione_accesso','lat','lon'], exp:['AccessCondition']},
  {key:'atlasofpaths',h:['id','numero_percorso','nome_percorso','lunghezza_km','dislivello_m','pavimentazione','segnaletica','livello_sicurezza','difficolta','comune_partenza'], exp:['AtlasOfPaths']},
  {key:'culturalheritage',h:['id','codice_bene','denominazione_bene','tipo_bene','tutela','vincolo','epoca','stato_conservazione','ente_tutela','lat','lon'], exp:['CulturalHeritage']},
  {key:'project',     h:['id','titolo_progetto','acronimo_progetto','cup','codice_progetto','programma_finanziamento','finanziatore','costo_totale_progetto','work_package','parola_chiave_progetto'], exp:['Project']},
  {key:'mu',          h:['id','grandezza','valore','unita_misura','tipo_misura','simbolo','sistema_misura','descrizione','data_rilevazione'], exp:['MU']},
  {key:'ndc',         h:['id','concetto_chiave','titolo_risorsa','tipo_risorsa','endpoint_url','formato_distribuzione','versione','editore'], exp:['NDC']},
];

let n_ok=0, n_ko=0;
for(const t of nuoveOnto) {
  const det = detectOntologiesDeterministic(t.h, [{}]);
  const pass = t.exp.every(e => det.includes(e));
  if(pass) { n_ok++; console.log('✅ '+t.key.padEnd(20)+' ['+det.filter(d=>!['L0','SM'].includes(d)).join(',')+']'); }
  else { n_ko++; console.log('❌ '+t.key.padEnd(20)+' ['+det.filter(d=>!['L0','SM'].includes(d)).join(',')+']	(atteso: '+t.exp.join(',')+')'); }
}
if(n_ko > 0) { console.error('❌ '+n_ko+' nuove ontologie FALLITE'); process.exit(1); }
console.log('✅ Tutte '+n_ok+'/'+nuoveOnto.length+' nuove ontologie OK');

// ── TEST REGRESSIONE PATCH v2026.03.23.171 ─────────────────────────────────
// CLV toponomastica pura: nessun lat/lon, nessun trigger forte → solo CLV,L0
{
  const h = ['Codvia','Specie','Descrizione','Cap','Comune'];
  const r = [
    {'Codvia':'1608','Specie':"LOCALITA'",'Descrizione':'LA SBARRA SNC','Cap':'','Comune':'ACQUAPENDENTE'},
    {'Codvia':'14627','Specie':'','Descrizione':'BERTOLDI DA','Cap':'','Comune':'ACQUAPENDENTE'},
  ];
  const result = detectOntologiesDeterministic(h, r);
  const spurie = result.filter(o => !['CLV','L0','SM'].includes(o));
  if(spurie.length > 0) {
    console.error(`❌ REGRESSIONE stradario: ontologie spurie [${spurie.join(',')}]`);
    process.exit(1);
  } else {
    console.log(`✅ REGRESSIONE stradario (CLV puro): [${result.join(', ')}]`);
  }
}

// ── TEST REGRESSIONE PATCH v2026.03.23.174 ─────────────────────────────────
// Schema OSM (defibrillatori DAE Puglia): osm_id+lat/lon → POI, non SMAPIT/TI
{
  const h = ['osm_id','osm_type','osm_url','name','description',
    'addr_street','addr_housenumber','addr_city','addr_postcode','addr_province',
    'lat','lon','opening_hours','access','operator','phone','ref','indoor','level','last_updated'];
  const r = [{osm_id:'3769748372',osm_type:'node',name:'Defibrillatore DAE',lat:'40.3637584',lon:'18.1826937'}];
  const result = detectOntologiesDeterministic(h, r);
  const hasPOI = result.includes('POI');
  const hasSpurie = result.some(o => ['SMAPIT'].includes(o)); // TI accettabile (opening_hours/last_updated)
  if(!hasPOI || hasSpurie) {
    console.error(`❌ REGRESSIONE OSM DAE: atteso [CLV,POI,L0], ottenuto [${result.join(',')}]`);
    process.exit(1);
  } else {
    console.log(`✅ REGRESSIONE OSM DAE (POI): [${result.join(', ')}]`);
  }
}

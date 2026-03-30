// ——— COSTANTI GLOBALI ———

// Stub: nel Worker Cloudflare non esiste window né DOM
const _workerState = { _corpusIndex: null };


const ONTO_RULES = [
  { keys: ['lat','lon','lng','latitudine','longitudine','coord'],          ontos: ['CLV','L0'] },
  { keys: ['indirizzo','address','via','strada','civico','cap','comune'],  ontos: ['CLV'] },
  { keys: ['telefono','phone','tel','email','mail','sito','web','url'],    ontos: ['SM'] },
  { keys: ['nome','name','denominazione','titolo'],                        ontos: ['L0'] },
  { keys: ['organizzazione','ente','comune','provincia','regione','ragione_sociale','insegna_commerciale'],        ontos: ['COV'] },
  { keys: ['persona','cognome','responsabile','referente','inventore','inventori','autore','ricercatore','lista','candidato','sezione_elettorale'], ontos: ['CPV'] },
  { keys: ['ruolo','qualifica','mansione','incarico'],                     ontos: ['RO'] },
  { keys: ['nome_dataset','nome_risorsa','dataset_name','resource_name','numero_righe','numero_record','formato','identifier'], ontos: ['ADMS'] },
  { keys: ['brevetto','patent','pi','proprietà_intellettuale','tipo_pi','n_dom','deposito'], ontos: ['ADMS'] },
  { keys: ['data_evento','data_inizio','data_fine','startDate','endDate','ora','inizio','fine','apertura','scadenza'], ontos: ['TI'] },
  { keys: ['punto','poi','luogo','location','sede','struttura','dae','aed','defibrillatore','accessibile_h24','presenza_aed'], ontos: ['POI'] },
  { keys: ['lista','partito','candidato','sezione','voti','preferenze','ballottaggio','circoscrizione','sindaco'], ontos: ['COV','CPV'] },
  { keys: ['accesso','orario','prenotazione','ingresso'],                  ontos: ['AC'] },
  { keys: ['parcheggio','parking','posto','stallo'],                       ontos: ['PARK'] },
  { keys: ['servizio','service','prestazione','sportello'],                ontos: ['CPSV-AP'] },
  { keys: ['hotel','albergo','accommodation','ricettivo','posti.letto','posti_letto','camere','stelle'],  ontos: ['ACCO'] },
  { keys: ['patrimonio','culturale','museo','monumento','arte','biblioteca','archivio','nome museo','ldcn'], ontos: ['Cultural-ON'] },
  { keys: ['subject','identifier','prenotazioni','immagine','image','luogo cultura','istituto culturale','denominazione','luogo_cultura'], ontos: ['Cultural-ON','CLV','SM'] },
  { keys: ['culturalinstituteorsite','beniculturali','mibact','mibac','luoghicultura'], ontos: ['Cultural-ON'] },
  { keys: ['titolo','spettacolo','evento','manifestazione','concerto','teatro','rassegna','patrocinio','organizzazione_associazione'], ontos: ['Cultural-ON','TI'] },
  { keys: ['tecnologia','area_tecnologica','settore','disciplina','campo'],  ontos: ['ADMS','L0'] },
  { keys: ['bus','metro','tram','fermata','linea','corsa'],                ontos: ['GTFS'] },
  { keys: ['importo','importo cumulato','valore','obs_value','misura','spesa','entrata','uscita','bilancio','finanziario','bdap','popolazione','istat','codice gestionale','tipologia del movimento','anno/mese'], ontos: ['QB'] },
  { keys: ['percorso','route','itinerario','tracciato'],                   ontos: ['Route'] },
  { keys: ['lingua','language','lang'],                                    ontos: ['Language'] },
  { keys: ['sensore','iot','device','dispositivo','misurazione'],          ontos: ['IoT'] },
  { keys: ['trasparenza','obbligo','pubblicazione'],                       ontos: ['Transparency'] },
];

const ONTO_CLASSES = {
  'CLV': {
    classes: ['clv:Address (Indirizzo)', 'clv:Feature (Caratteristica geografica)', 'clv:Geometry (Geometria)', 'clv:AdminUnitComponent (Unità amministrativa)', 'clv:StreetToponym (Strada)', 'clv:CivicNumbering (Numero civico)', 'clv:Identifier (Identificativo)', 'clv:GeographicalDistribution (Ripartizione geografica)'],
    props:   ['clv:hasAddress', 'clv:hasGeometry', 'clv:hasSpatialCoverage', 'clv:hasStreetToponym', 'clv:hasNumber', 'clv:fullAddress', 'clv:postCode', 'clv:lat', 'clv:long']
  },
  'COV': {
    classes: ['cov:Organization (Organizzazione)', 'cov:PublicOrganization (Organizzazione pubblica)', 'cov:Organization (Impresa)', 'cov:ActivityType (Tipo attività)', 'sm:ContactPoint (Punto di contatto)', 'sm:Email (Email)', 'sm:Telephone (Telefono)'],
    props:   ['sm:hasOnlineContactPoint', 'cov:hasActivityType', 'cov:hasLegalStatus', 'cov:hasSubOrganization', 'cov:isPartOf']
  },
  'CPV': {
    classes: ['cpv:Person (Persona — SOLO persone fisiche)', 'cpv:Person (Adulto)', 'cpv:Person (Minore)', 'cpv:Person (Anziano)'],
    props:   ['cpv:givenName', 'cpv:familyName', 'cpv:taxCode', 'cpv:dateOfBirth', 'clv:hasAddress']
  },
  'POI': {
    classes: ['poi:PointOfInterest (Punto di interesse — classe generica per luoghi fisici)'],
    props:   ['poi:includesPOI']
  },
  'RO': {
    classes: ['ro:Role (Ruolo)'],
    props:   ['ro:hasRole', 'ro:isRoleOf', 'ro:withRole']
  },
  'TI': {
    classes: ['ti:TimeInterval (Intervallo temporale)', 'ti:TimeInstant (Istante)'],
    props:   ['ti:startTime', 'ti:endTime', 'ti:hasTemporalCoverage', 'ti:atTime']
  },
  'IoT': {
    classes: ['iot:Sensor (Sensore)', 'iot:Observation (Osservazione)', 'iot:ObservationCollection (Collezione osservazioni)', 'iot:Platform (Piattaforma)', 'iot:MonitoringFacility (Impianto monitoraggio)'],
    props:   ['iot:hasSensor', 'iot:hasObservation', 'iot:madeBySensor', 'iot:observedProperty', 'iot:hasResult', 'iot:resultTime']
  },
  'SMAPIT': {
    classes: ['smapit:School (Scuola di qualsiasi ordine)', 'smapit:HighSchool (Scuola secondaria)', 'smapit:PrimarySchool (Scuola primaria)', 'smapit:KindergartenSchool (Scuola infanzia)'],
    props:   ['smapit:schoolCode', 'smapit:schoolType', 'dct:identifier', 'rdfs:label', 'geo:lat', 'geo:long', 'clv:hasAddress']
  },
  'SM': {
    classes: ['sm:Email (Email)', 'sm:Telephone (Telefono)', 'sm:WebSite (Sito web)', 'sm:SocialMedia (Account social)'],
    props:   ['sm:hasEmail', 'sm:hasTelephone', 'sm:hasWebSite', 'sm:hasUserAccount']
  },
  'L0': {
    classes: ['l0:Agent (Agente — persona/organizzazione)', 'l0:Object (Oggetto fisico)', 'l0:EventOrSituation (Evento/Situazione)', 'l0:Collection (Collezione)', 'l0:Location (Luogo)', 'l0:Characteristic (Caratteristica)', 'l0:Description (Descrizione)'],
    props:   ['l0:name', 'l0:identifier', 'l0:hasDescription', 'l0:isPartOf', 'l0:hasLocation']
  },
  'ADMS': {
    classes: ['adms:SemanticAsset (Asset semantico — brevetti, documenti, software)', 'adms:AssetRepository (Repository di asset)', 'adms:SemanticAssetDistribution (Distribuzione asset)'],
    props:   ['adms:status', 'adms:identifier', 'adms:schemaAgency', 'adms:representationTechnique']
  },
  'PARK': {
    classes: ['park:ParkingFacility (Parcheggio)', 'park:ParkingLot (Area parcheggio)', 'park:ParkingSpace (Posto auto)', 'park:ParkingTariff (Tariffa)', 'park:VehicleCategory (Categoria veicolo)'],
    props:   ['park:hasParkingLot', 'park:hasParkingSpace', 'park:hasTariff', 'park:hasVehicleCategory', 'park:capacity']
  },
  'ACCO': {
    classes: ['acco:Accommodation (Struttura ricettiva)', 'acco:Accommodation (Hotel)', 'acco:Accommodation (Ostello)', 'acco:Accommodation (B&B)', 'acco:Room (Camera)'],
    props:   ['dct:description', 'dct:description', 'acco:checkIn', 'acco:checkOut', 'dct:description']
  },
  'CULTURAL-ON': {
    classes: ['cis:CulturalInstituteOrSite (Istituto/luogo culturale)', 'cis:Museum (Museo)', 'cis:Library (Biblioteca — NON clv:Biblioteca)', 'cultural-on:Archive (Archivio)', 'cultural-on:Site (Sito)', 'cultural-on:CollectionItem (Oggetto della collezione)'],
    props:   ['cultural-on:hasCollection', 'cultural-on:hasOpeningHours', 'cultural-on:hasSubject']
  },
  'GTFS': {
    classes: ['gtfs:Agency (Azienda trasporti)', 'gtfs:Stop (Fermata)', 'gtfs:Route (Linea)', 'gtfs:Trip (Corsa)', 'gtfs:StopTime (Orario fermata)', 'gtfs:Service (Servizio)'],
    props:   ['gtfs:agency', 'gtfs:route', 'gtfs:stop', 'gtfs:departureTime', 'gtfs:arrivalTime']
  },
  'PUBLICCONTRACT': {
    classes: ['pc:Contract (Contratto pubblico)', 'pc:ContractingAuthority (Stazione appaltante)', 'pc:BusinessEntity (Operatore economico)', 'pc:Award (Aggiudicazione)'],
    props:   ['pc:hasCIG', 'pc:hasCUP', 'pc:hasAmount', 'pc:hasMainObject', 'pc:contractingAuthority', 'pc:awardedTo', 'pc:hasCPV', 'pc:selectionCriteria', 'pc:awardDate']
  },
  'ROUTE': {
    classes: ['route:Route (Percorso/Itinerario)', 'route:RouteSection (Tappa/Sezione)'],
    props:   ['route:routeLength', 'route:numberOfStages', 'route:routeEstDuration', 'route:routeShortName', 'route:routeLongName', 'route:difficulty', 'route:heightDifference']
  },
  'RPO': {
    classes: ['rpo:RoleInOrganization (Ruolo lavorativo)', 'rpo:Employment (Rapporto di lavoro)'],
    props:   ['rpo:hasRole', 'rpo:contractType', 'rpo:contractLevel', 'rpo:weeklyHours', 'rpo:hasCCNL']
  },
  'LEARNING': {
    classes: ['learn:Course (Corso/Percorso formativo)', 'learn:LearningActivity (Attività formativa)', 'learn:Qualification (Titolo rilasciato)'],
    props:   ['learn:ects', 'learn:hours', 'learn:duration', 'learn:awardedTitle']
  },
  'TRANSPARENCY': {
    classes: ['tr:TransparencyObligation (Obbligo di trasparenza)', 'tr:TransparencyRecord (Dato pubblicato per trasparenza)'],
    props:   ['tr:hasTransparencyObligation', 'tr:transparencyCategory', 'tr:mandatoryData']
  },
  'INDICATOR': {
    classes: ['indicator:Indicator (Indicatore)', 'indicator:IndicatorObservation (Osservazione indicatore)'],
    props:   ['indicator:indicatorType', 'indicator:baseline', 'indicator:target', 'sdmx-measure:obsValue', 'dct:source']
  },
  'POT': {
    classes: ['pot:PriceSpecification (Specifica di prezzo)', 'pot:Offer (Offerta/Tariffa)'],
    props:   ['pot:hasCurrencyValue', 'pot:hasCurrency', 'pot:hasUnitOfMeasure']
  },
  'QB': {
    classes: ['qb:DataSet (Dataset statistico)', 'qb:Observation (Osservazione statistica)', 'qb:DimensionProperty (Dimensione)', 'qb:MeasureProperty (Misura)', 'qb:DataStructureDefinition (Struttura dati)'],
    props:   ['qb:dataSet', 'qb:observation', 'sdmx-dimension:refPeriod', 'sdmx-dimension:refArea', 'sdmx-measure:obsValue', 'sdmx-attribute:obsStatus']
  },
  'CPSV-AP': {
    classes: ['cpsv:PublicService (Servizio pubblico)', 'cpsv:Rule (Normativa)', 'cpsv:PublicOrganization (Ente erogatore)'],
    props:   ['cpsv:hasInput', 'cpsv:produces', 'cpsv:hasCompetentAuthority', 'cpsv:isGroupedUnder']
  },
  'IoT': {
    classes: ['iot:Sensor (Sensore)', 'iot:Actuator (Attuatore)', 'iot:FeatureOfInterest (Oggetto misurato)'],
    props:   ['iot:hasValue', 'iot:hasUnitOfMeasure', 'iot:madeObservation', 'iot:observedProperty']
  },
};

const ONTO_URI_TYPE = {
  'ACCO':          'accommodation-facility',
  'PARK':          'parking-facility',
  'GTFS':          'stop',
  'Cultural-ON':   'cultural-institute',
  'CULTURALON':    'cultural-institute',
  'CPSV-AP':       'public-service',
  'COV':           'organization',
  'CPV':           'person',
  'ADMS':          'asset',
  'POI':           'point-of-interest',
  'CLV':           'place',
  'L0':            'resource',
  'SMAPIT':        'school',
  'IOT':           'sensor',
  'RO':            'role',
  'QB':            'observation',
  'SM':            'organization',
  'PUBLICCONTRACT':'public-contract',
  'ROUTE':         'route',
  'RPO':           'role-in-organization',
  'LEARNING':      'course',
  'TRANSPARENCY':  'transparency-obligation',
  'INDICATOR':     'indicator',
  'POT':           'price-specification',
  'TI':            'event',
};

const ONTO_MAIN_CLASS = {
  'ACCO':          'acco:Accommodation',
  'PARK':          'park:ParkingFacility',
  'GTFS':          'gtfs:Stop',
  'CULTURAL-ON':   'cis:CulturalInstituteOrSite',
  'Cultural-ON':   'cis:CulturalInstituteOrSite',
  'CULTURALON':    'cis:CulturalInstituteOrSite',
  'CPSV-AP':       'cpsv:PublicService',
  'COV':           'cov:PublicOrganization',
  'CPV':           'cpv:Person',
  'ADMS':          'adms:SemanticAsset',
  'POI':           'poi:PointOfInterest',
  'CLV':           'clv:Feature',
  'TI':            'l0:EventOrSituation',
  'QB':            'qb:Observation',
  'L0':            'l0:Object',
  'SMAPIT':        'smapit:School',
  'IOT':           'iot:Sensor',
  'RO':            'ro:Role',
  'PUBLICCONTRACT':'pc:Contract',
  'ROUTE':         'route:Route',
  'RPO':           'rpo:RoleInOrganization',
  'LEARNING':      'learn:Course',
  'TRANSPARENCY':  'tr:TransparencyObligation',
  'INDICATOR':     'indicator:Indicator',
  'POT':           'pot:PriceSpecification',
};

const SAFE_PREFIXES = new Set(['rdf','rdfs','owl','xsd','dct','dcat','foaf','geo','skos','vcard','schema','qb','sdmx-dimension','sdmx-measure','sdmx-attribute','clv','cov','cpv','l0','poi','ro','ti','sm','cultural-on','acco','gtfs','park','cpsv','adms','muapit','iot','smapit','dcatapit','cis','pc','route','rpo','learn','tr','indicator','pot','mu','cpev']);

var DET_COL_NORM={'osm_id':'id','osm_type':'_skip','osm_url':'sitoweb','indoor':'_skip','level':'_skip','ref':'_skip','access':'_skip','opening_hours':'_skip','name':'denominazione','operator':'gestore',coory:'lat',coorx:'lon',indirizzo_e_mail_autonomia:'email',indirizzo_e_mail_sede_corsi:'email',indirizzo_pec_sede_corsi:'email',e_mail:'email',email_scuola:'email',mail_scuola:'email',indirizzo_email_autonomia:'email',indirizzo_pec_autonomia:'email',telefono_sede_autonomia:'telefono',tipologia:'tipo',tipologia_sede:'tipo','tipo evento':'tipo_evento','tipologia scheda':'tipologia_scheda','tipologia attivita':'tipo',macrotipologia_autonomia:'tipo',tipologia_autonomia:'tipo',caratteristica_scuola:'tipo',codice:'id',localita:'comune',distr:'_skip',num_sedi_autonomia:'_skip',organico_autonomia:'_skip',organico_sede:'_skip',location:'_skip',codice_sede_riferimento:'_skip',codice_sede_di_direttivo:'_skip',indirizzo_sede_di_direttivo:'_skip',cod_comune_sede_dir:'_skip',comune_sede_di_direttivo:'_skip',cap_sede_dir:'_skip',s_comune_montano:'_skip',denominazione_sede_direttivo:'_skip',nome_poi:'nome',tipo_poi:'tipo',accessibile_h24:'accessibile',ident:'id',cod:'id',ident:'id',nome_poi:'nome',tipo_poi:'tipo',tipo_struttura:'tipo',nome_struttura:'nome',accessibile_h24:'accessibile',accessibilita:'accessibile',cod:'id',codice:'id',code:'id',pk:'id',indirizzo_completo:'indirizzo',email_referente:'email',latitudine:'lat',lat_wgs84:'lat',coordy:'lat',geo_lat:'lat',longitudine:'lon',lon_wgs84:'lon',coordx:'lon',geo_lon:'lon',lng:'lon',stop_lat:'lat',stop_lon:'lon',denominazionescuola:'denominazione',denominazione_scuola:'denominazione',nome_dataset:'denominazione',label:'denominazione',titolo:'denominazione',stop_name:'denominazione',nome_sensore:'denominazione',denominazioneistitutoriferimento:'denominazione',istituzione_scolastica:'denominazione',amministrazione:'denominazione',indirizzoscuola:'indirizzo',indirizzo_scuola:'indirizzo',ubicazione:'indirizzo',localizzazione:'indirizzo',address:'indirizzo',descrizionecomune:'comune',citta:'comune',city:'comune',capscuola:'cap',cap_scuola:'cap',postcode:'cap',codicescuola:'id',codice_scuola:'id',slug:'id',cig:'id',fid:'id',codiceistitutoriferimento:'id',codice_istituzione:'id',codice_ente_bdap:'id',id_consigliere:'id',id_sensore:'id',idsensore:'id',node_id:'id',remoteid:'id',pec:'email',mail:'email',sito_web:'sitoweb',website:'sitoweb',web:'sitoweb',url:'sitoweb',data_inizio:'inizio',data_da:'inizio',data_inizio_evento:'inizio',quando:'inizio',published:'inizio',creation_date:'inizio',issued:'inizio',data_fine:'termine',data_a:'termine',data_fine_evento:'termine',fine:'termine',last_edit_date:'modified',ultimamodifica:'modified',occorrenze:'valore',numero:'valore',totale:'valore',popolazione_residente:'valore',importo:'valore',tipologia:'tipo',tipo_bene:'tipo',tipo_evento:'tipo',tipo_struttura:'tipo',tipo_scuola:'tipo',descrizionetipologiagradoistruzione:'tipo',informazioni:'descrizione',note:'descrizione',oggetto:'descrizione',tel:'telefono',phone:'telefono',anno_rilevazione:'anno',annoscolastico:'anno',anno_scolastico:'anno',longitude:'lon',latitude:'lat'};

var DET_URI_SEG={ACCO:'accommodation-facility',GTFS:'stop',POI:'point-of-interest','IoT':'sensor',COV:'public-organization',CPV:'person',RO:'role',SMAPIT:'school',QB:'observation',CLV:'address',TI:'event',CulturalON:'cultural-institute',ADMS:'asset',CPSV:'service',PARK:'parking-facility',PublicContract:'public-contract',Route:'route',RPO:'role-in-organization',Learning:'course',Transparency:'transparency-obligation',Indicator:'indicator',POT:'price-specification',CPEV:'public-event',AccessCondition:'access-condition',AtlasOfPaths:'path',CulturalHeritage:'cultural-heritage',Project:'project',MU:'measurement',NDC:'data-service'};

var DET_CLASS={ACCO:'acco:Accommodation',GTFS:'gtfs:Stop',POI:'poi:PointOfInterest','IoT':'iot:Sensor',COV:'cov:PublicOrganization',CPV:'cpv:Person',RO:'ro:Role',SMAPIT:'smapit:School',QB:'qb:Observation',CLV:'clv:Address',TI:'l0:EventOrSituation',CulturalON:'cis:CulturalInstituteOrSite','Cultural-ON':'cis:CulturalInstituteOrSite',ADMS:'adms:SemanticAsset',CPSV:'cpsv:PublicService','CPSV-AP':'cpsv:PublicService',PARK:'park:ParkingFacility',PublicContract:'pc:Contract',Route:'route:Route',RPO:'rpo:RoleInOrganization',Learning:'learn:Course',Transparency:'tr:TransparencyObligation',Indicator:'indicator:Indicator',POT:'pot:PriceSpecification',CPEV:'cpev:PublicEvent',AccessCondition:'ac:AccessCondition',AtlasOfPaths:'aop:Path',CulturalHeritage:'ch:CulturalHeritage',Project:'prj:PublicInvestmentProject',MU:'mu:Value',NDC:'ndc:DataService'};

var DET_PREFIXES={'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#','rdfs':'http://www.w3.org/2000/01/rdf-schema#','xsd':'http://www.w3.org/2001/XMLSchema#','dct':'http://purl.org/dc/terms/','dcat':'http://www.w3.org/ns/dcat#','foaf':'http://xmlns.com/foaf/0.1/','skos':'http://www.w3.org/2004/02/skos/core#','geo':'http://www.w3.org/2003/01/geo/wgs84_pos#','vcard':'http://www.w3.org/2006/vcard/ns#','schema':'https://schema.org/','park':'https://w3id.org/italia/onto/PARK/','pot':'https://w3id.org/italia/onto/POT/','pc':'https://w3id.org/italia/onto/PublicContract/','route':'https://w3id.org/italia/onto/Route/','rpo':'https://w3id.org/italia/onto/RPO/','mu':'https://w3id.org/italia/onto/MU/','learn':'https://w3id.org/italia/onto/Learning/','cpev':'https://w3id.org/italia/onto/CPEV/','tr':'https://w3id.org/italia/onto/Transparency/','indicator':'https://w3id.org/italia/onto/Indicator/','l0':'https://w3id.org/italia/onto/l0/','clv':'https://w3id.org/italia/onto/CLV/','sm':'https://w3id.org/italia/onto/SM/','ti':'https://w3id.org/italia/onto/TI/','acco':'https://w3id.org/italia/onto/ACCO/','poi':'https://w3id.org/italia/onto/POI/','iot':'https://w3id.org/italia/onto/IoT/','cov':'https://w3id.org/italia/onto/COV/','cpv':'https://w3id.org/italia/onto/CPV/','ro':'https://w3id.org/italia/onto/RO/','smapit':'https://w3id.org/italia/onto/SMAPIT/','gtfs':'http://vocab.gtfs.org/terms#','cis':'https://w3id.org/italia/onto/Cultural-ON/','adms':'http://www.w3.org/ns/adms#','cpsv':'http://purl.org/vocab/cpsv#','qb':'http://purl.org/linked-data/cube#','sdmx-dimension':'http://purl.org/linked-data/sdmx/2009/dimension#','sdmx-measure':'http://purl.org/linked-data/sdmx/2009/measure#','sdmx-attribute':'http://purl.org/linked-data/sdmx/2009/attribute#','aop':'https://w3id.org/italia/onto/AtlasOfPaths/','ch':'https://w3id.org/italia/onto/CulturalHeritage/','prj':'https://w3id.org/italia/onto/Project/','ndc':'https://w3id.org/italia/onto/NDC/'};

var DET_COL_RULES={denominazione:{pred:'rdfs:label',type:'langlit',lang:'it'},nome:{pred:'rdfs:label',type:'langlit',lang:'it'},nome_iniziativa:{pred:'rdfs:label',type:'langlit',lang:'it'},titolo_evento:{pred:'rdfs:label',type:'langlit',lang:'it'},titolo_manifestazione:{pred:'rdfs:label',type:'langlit',lang:'it'},descrizione:{pred:'dct:description',type:'langlit',lang:'it'},luogo:{pred:'schema:location',type:'langlit',lang:'it'},sede:{pred:'schema:location',type:'langlit',lang:'it'},dove:{pred:'l0:hasLocation',type:'langlit',lang:'it'},ingresso:{pred:'schema:isAccessibleForFree',type:'langlit',lang:'it'},biglietto:{pred:'schema:isAccessibleForFree',type:'langlit',lang:'it'},organizzatore:{pred:'dct:publisher',type:'langlit',lang:'it'},promotore:{pred:'dct:publisher',type:'langlit',lang:'it'},interpreti:{pred:'schema:performer',type:'langlit',lang:'it'},esecutori:{pred:'schema:performer',type:'langlit',lang:'it'},autore:{pred:'dct:creator',type:'langlit',lang:'it'},periodo:{pred:'dct:temporal',type:'langlit',lang:'it'},stagione:{pred:'dct:temporal',type:'langlit',lang:'it'},programmazione:{pred:'dct:temporal',type:'langlit',lang:'it'},stalli:{pred:'park:numberOfParkingSpaces',type:'integer'},posti_auto:{pred:'park:numberOfParkingSpaces',type:'integer'},capacita_posti:{pred:'park:numberOfParkingSpaces',type:'integer'},posti_disabili:{pred:'park:numberOfDisabledParkingSpaces',type:'integer'},tariffa_oraria:{pred:'park:ratePerHour',type:'decimal'},tipo_parcheggio:{pred:'park:parkingType',type:'langlit',lang:'it'},cig:{pred:'pc:hasCIG',type:'literal'},cup:{pred:'pc:hasCUP',type:'literal'},importo_aggiudicazione:{pred:'pc:hasAmount',type:'decimal'},importo_base:{pred:'pc:hasAmount',type:'decimal'},importo_contratto:{pred:'pc:hasAmount',type:'decimal'},oggetto_contratto:{pred:'pc:hasMainObject',type:'langlit',lang:'it'},oggetto_gara:{pred:'pc:hasMainObject',type:'langlit',lang:'it'},stazione_appaltante:{pred:'pc:contractingAuthority',type:'langlit',lang:'it'},aggiudicatario:{pred:'pc:awardedTo',type:'langlit',lang:'it'},cpv_codice:{pred:'pc:hasCPV',type:'literal'},modalita_scelta:{pred:'pc:selectionCriteria',type:'langlit',lang:'it'},data_aggiudicazione:{pred:'pc:awardDate',type:'date'},lunghezza_km:{pred:'route:routelLength',type:'literal'},numero_tappe:{pred:'route:numberOfStages',type:'integer'},durata_stimata:{pred:'route:routeEstDuration',type:'literal'},nome_breve_percorso:{pred:'route:routeShortName',type:'literal'},nome_esteso_percorso:{pred:'route:routeLongName',type:'literal'},difficolta:{pred:'route:difficulty',type:'langlit',lang:'it'},dislivello:{pred:'route:heightDifference',type:'decimal'},qualifica_dipendente:{pred:'rpo:hasRole',type:'langlit',lang:'it'},contratto_lavoro:{pred:'rpo:contractType',type:'langlit',lang:'it'},livello_contrattuale:{pred:'rpo:contractLevel',type:'literal'},ore_settimanali:{pred:'rpo:weeklyHours',type:'decimal'},ccnl:{pred:'rpo:hasCCNL',type:'langlit',lang:'it'},crediti:{pred:'learn:ects',type:'decimal'},ects:{pred:'learn:ects',type:'decimal'},ore_formazione:{pred:'learn:hours',type:'decimal'},durata_corso:{pred:'learn:duration',type:'langlit',lang:'it'},titolo_rilasciato:{pred:'learn:awardedTitle',type:'langlit',lang:'it'},titolo_corso:{pred:'rdfs:label',type:'langlit',lang:'it'},obbligo_trasparenza:{pred:'tr:hasTransparencyObligation',type:'langlit',lang:'it'},categoria_trasparenza:{pred:'tr:transparencyCategory',type:'langlit',lang:'it'},dato_obbligatorio:{pred:'tr:mandatoryData',type:'langlit',lang:'it'},norma_riferimento:{pred:'dct:source',type:'literal'},tipo_indicatore:{pred:'indicator:indicatorType',type:'langlit',lang:'it'},valore_indicatore:{pred:'sdmx-measure:obsValue',type:'decimal'},baseline:{pred:'indicator:baseline',type:'decimal'},target:{pred:'indicator:target',type:'decimal'},fonte_indicatore:{pred:'dct:source',type:'langlit',lang:'it'},partita_iva:{pred:'cov:VATnumber',type:'literal'},codice_ipa:{pred:'cov:IPAcode',type:'literal'},rea:{pred:'cov:REANumber',type:'literal'},data_costituzione:{pred:'cov:foundationDate',type:'date'},codice_univoco_ufficio:{pred:'cov:officeIdentifier',type:'literal'},oggetto_sociale:{pred:'cov:businessObjective',type:'langlit',lang:'it'},acronimo:{pred:'cov:orgAcronym',type:'literal'},cf:{pred:'cpv:taxCode',type:'literal'},codice_fiscale:{pred:'cpv:taxCode',type:'literal'},codice_sesso:{pred:'cpv:sexID',type:'literal'},grado_istruzione:{pred:'cpv:educationLevelID',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level'},eta:{pred:'cpv:age',type:'integer'},nome_completo:{pred:'cpv:fullName',type:'literal'},numero_camere:{pred:'acco:totalRoom',type:'integer'},numero_bagni:{pred:'acco:totalToilet',type:'integer'},codice_struttura:{pred:'acco:accommodationCode',type:'literal'},codice_stelle:{pred:'acco:accoStarRatingID',type:'literal'},nome_ufficiale:{pred:'poi:POIofficialName',type:'langlit',lang:'it'},nome_alternativo:{pred:'poi:POIalternativeName',type:'langlit',lang:'it'},categoria_poi:{pred:'poi:POIcategoryName',type:'langlit',lang:'it'},id_poi:{pred:'poi:POIID',type:'literal'},forma_giuridica:{pred:'cov:hasLegalStatus',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-organizations/legal-status'},natura_giuridica:{pred:'cov:hasLegalStatus',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-organizations/legal-status'},codice_ateco:{pred:'cov:hasActivityType',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-organizations/ateco-2007'},settore_ateco:{pred:'cov:hasActivityType',type:'langlit',lang:'it'},licenza:{pred:'dct:license',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/licences'},tipo_licenza:{pred:'dct:license',type:'langlit',lang:'it'},numero_camere_totali:{pred:'acco:totalRoom',type:'integer'},tipo:{pred:'dct:type',type:'langlit',lang:'it'},categoria:{pred:'dct:type',type:'langlit',lang:'it'},email:{pred:'sm:hasEmail',type:'mailto'},sitoweb:{pred:'sm:hasWebSite',type:'url'},telefono:{pred:'sm:hasTelephone',type:'literal'},fax:{pred:'dct:description',type:'literal'},lat:{pred:'geo:lat',type:'typed',xsd:'xsd:decimal'},lon:{pred:'geo:long',type:'typed',xsd:'xsd:decimal'},modified:{pred:'dct:modified',type:'typed',xsd:'xsd:date'},numero_posti_letto:{pred:'acco:totalRoom',type:'typed',xsd:'xsd:integer',onto:'ACCO'},posti_letto:{pred:'acco:totalRoom',type:'typed',xsd:'xsd:integer',onto:'ACCO'},letti:{pred:'acco:totalBed',type:'typed',xsd:'xsd:integer',onto:'ACCO'},camere:{pred:'acco:totalRoom',type:'typed',xsd:'xsd:integer',onto:'ACCO'},stelle:{pred:'acco:accoStarRatingID',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-accommodation-facilities/accommodation-star-rating',onto:'ACCO'},stop_id:{pred:'dct:identifier',type:'literal',onto:'GTFS'},stop_code:{pred:'gtfs:code',type:'literal',onto:'GTFS'},zone_id:{pred:'gtfs:zone',type:'literal',onto:'GTFS'},location_type:{pred:'gtfs:locationType',type:'typed',xsd:'xsd:integer',onto:'GTFS'},parent_station:{pred:'gtfs:parentStation',type:'literal',onto:'GTFS'},route_id:{pred:'dct:identifier',type:'literal',onto:'GTFS'},route_short_name:{pred:'gtfs:shortName',type:'literal',onto:'GTFS'},route_long_name:{pred:'gtfs:longName',type:'langlit',lang:'it',onto:'GTFS'},route_type:{pred:'gtfs:routeType',type:'typed',xsd:'xsd:integer',onto:'GTFS'},agency_id:{pred:'gtfs:agency',type:'literal',onto:'GTFS'},arrival_time:{pred:'gtfs:arrivalTime',type:'literal',onto:'GTFS'},departure_time:{pred:'gtfs:departureTime',type:'literal',onto:'GTFS'},stop_sequence:{pred:'gtfs:stopSequence',type:'typed',xsd:'xsd:integer',onto:'GTFS'},valore:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},enterococchi_intestinali:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},escherichia_coli:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},limite_enterococchi:{pred:'iot:hasResultQuality',type:'typed',xsd:'xsd:decimal',onto:'IoT'},limite_escherichiacoli:{pred:'iot:hasResultQuality',type:'typed',xsd:'xsd:decimal',onto:'IoT'},conformita:{pred:'iot:hasQualityAnnotation',type:'langlit',lang:'it',onto:'IoT'},unita_misura:{pred:'mu:hasMeasurementUnit',type:'langlit',lang:'it',onto:'MU'},unita_di_misura:{pred:'mu:hasMeasurementUnit',type:'langlit',lang:'it',onto:'MU'},data:{pred:'ti:startTime',type:'typed',xsd:'xsd:date',onto:'TI'},id_area:{pred:'dct:identifier',type:'literal'},valore_medio:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},unita:{pred:'iot:hasUnitOfMeasure',type:'literal',onto:'IoT'},avgspeed:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},anno:{pred:'sdmx-dimension:refPeriod',type:'literal',onto:'QB'},mese:{pred:'sdmx-dimension:refPeriod',type:'literal',onto:'QB'},date:{pred:'sdmx-dimension:refPeriod',type:'typed',xsd:'xsd:date',onto:'QB'},datetime:{pred:'dct:date',type:'typed',xsd:'xsd:dateTime',onto:'QB'},timestamp:{pred:'dct:date',type:'typed',xsd:'xsd:dateTime',onto:'QB'},count:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},total:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},amount:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},value:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},asl:{pred:'sdmx-dimension:refArea',type:'langlit',lang:'it',onto:'QB'},azienda_sanitaria:{pred:'sdmx-dimension:refArea',type:'langlit',lang:'it',onto:'QB'},distretto:{pred:'sdmx-dimension:refArea',type:'langlit',lang:'it',onto:'QB'},eta:{pred:'sdmx-attribute:obsStatus',type:'langlit',lang:'it',onto:'QB'},fascia_eta:{pred:'sdmx-attribute:obsStatus',type:'langlit',lang:'it',onto:'QB'},classe_eta:{pred:'sdmx-attribute:obsStatus',type:'langlit',lang:'it',onto:'QB'},eta_:'skip',numero:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},valore_assoluto:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},frequenza:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},comparto:{pred:'dct:description',type:'langlit',lang:'it',onto:'COV'},inquadramento:{pred:'cov:hasLegalStatus',type:'langlit',lang:'it',onto:'COV'},cognome:{pred:'cpv:familyName',type:'langlit',lang:'it',onto:'CPV'},sesso:{pred:'cpv:sexID',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/sex',onto:'CPV'},cittadinanza:{pred:'dct:description',type:'langlit',lang:'it',onto:'CPV'},data_nascita:{pred:'cpv:dateOfBirth',type:'typed',xsd:'xsd:date',onto:'CPV'},ruolo:{pred:'rdfs:label',type:'langlit',lang:'it',onto:'RO'},legislatura:{pred:'dct:description',type:'langlit',lang:'it',onto:'RO'},voti_validi:{pred:'ro:votesObtained',type:'typed',xsd:'xsd:integer',onto:'RO'},gestore:{pred:'smapit:hasManager',type:'langlit',lang:'it',onto:'SMAPIT'},inizio:{pred:'ti:startTime',type:'typed',xsd:'xsd:dateTime',onto:'TI'},termine:{pred:'ti:endTime',type:'typed',xsd:'xsd:dateTime',onto:'TI'},durata:{pred:'ti:duration',type:'literal',onto:'TI'},dove:{pred:'l0:hasLocation',type:'langlit',lang:'it',onto:'TI'},accessibile:{pred:'dct:description',type:'literal',onto:'POI'},distr:{pred:'_skip',type:'skip'},location:{pred:'_skip',type:'skip'},s_comune_montano:{pred:'_skip',type:'skip'},organico_autonomia:{pred:'_skip',type:'skip'},organico_sede:{pred:'_skip',type:'skip'},accessibile:{pred:'dct:description',type:'literal',onto:'POI'},datazione:{pred:'dct:date',type:'literal',onto:'CulturalON'},numero_inventario:{pred:'dct:identifier',type:'literal',onto:'CulturalON'},version:{pred:'adms:version',type:'literal',onto:'ADMS'},versione:{pred:'adms:version',type:'literal',onto:'ADMS'},stato:{pred:'adms:status',type:'literal',onto:'ADMS'},formato:{pred:'dct:format',type:'literal',onto:'ADMS'},publisher:{pred:'dct:publisher',type:'langlit',lang:'it',onto:'ADMS'},aggiudicatario:{pred:'cpsv:hasParticipant',type:'langlit',lang:'it',onto:'CPSV'},cup:{pred:'dct:identifier',type:'literal',onto:'CPSV'},ufficio:{pred:'cpsv:isGroupedUnder',type:'langlit',lang:'it',onto:'CPSV'},indirizzo:{pred:'_skip',type:'skip'},comune:{pred:'_skip',type:'skip'},cap:{pred:'_skip',type:'skip'},provincia:{pred:'_skip',type:'skip'},civico:{pred:'_skip',type:'skip'},numerocivico:{pred:'_skip',type:'skip'},regione:{pred:'_skip',type:'skip'},via:{pred:'_skip',type:'skip'},strada:{pred:'_skip',type:'skip'},tipologia_provvedimento:{pred:'dct:type',type:'langlit',lang:'it'},numero_provvedimento:{pred:'dct:identifier',type:'literal'},data_approvazione:{pred:'dct:date',type:'date'},ufficio_proponente:{pred:'dct:publisher',type:'langlit',lang:'it'},uo_proponente:{pred:'dct:publisher',type:'langlit',lang:'it'},uo_responsabile:{pred:'dct:contributor',type:'langlit',lang:'it'},spesa_prevista:{pred:'sdmx-measure:obsValue',type:'decimal'},estremi_documenti_fascicolo:{pred:'dct:relation',type:'literal'},estremi_documenti_fascicoli:{pred:'dct:relation',type:'literal'},numero_atto:{pred:'dct:identifier',type:'literal'},data_atto:{pred:'dct:date',type:'date'},tipo_atto:{pred:'dct:type',type:'langlit',lang:'it'},norma:{pred:'dct:source',type:'langlit',lang:'it'},modalita:{pred:'dct:description',type:'langlit',lang:'it'},contenuto:{pred:'dct:description',type:'langlit',lang:'it'},occorrenze:{pred:'sdmx-measure:obsValue',type:'decimal'},iscrizioni_nascita:{pred:'sdmx-measure:obsValue',type:'decimal'},cancellazioni_morte:{pred:'sdmx-measure:obsValue',type:'decimal'},saldo_naturale:{pred:'sdmx-measure:obsValue',type:'decimal'},saldo_migratorio:{pred:'sdmx-measure:obsValue',type:'decimal'},saldo_totale:{pred:'sdmx-measure:obsValue',type:'decimal'},maschi:{pred:'sdmx-measure:obsValue',type:'decimal'},femmine:{pred:'sdmx-measure:obsValue',type:'decimal'},stranieri_maschi:{pred:'sdmx-measure:obsValue',type:'decimal'},stranieri_femmine:{pred:'sdmx-measure:obsValue',type:'decimal'},stranieri_totale:{pred:'sdmx-measure:obsValue',type:'decimal'},tasso_natalita:{pred:'sdmx-measure:obsValue',type:'decimal'},tasso_mortalita:{pred:'sdmx-measure:obsValue',type:'decimal'},numero_famiglie:{pred:'sdmx-measure:obsValue',type:'decimal'},sezione:{pred:'dct:identifier',type:'literal'},foglio:{pred:'dct:identifier',type:'literal'},particella:{pred:'dct:identifier',type:'literal'},subalterno:{pred:'dct:identifier',type:'literal'},rendita:{pred:'sdmx-measure:obsValue',type:'decimal'},consistenza:{pred:'dct:description',type:'literal'},qualita:{pred:'dct:type',type:'langlit',lang:'it'},ettari:{pred:'sdmx-measure:obsValue',type:'decimal'},reddito_dominicale:{pred:'sdmx-measure:obsValue',type:'decimal'},reddito_agrario:{pred:'sdmx-measure:obsValue',type:'decimal'},codice_via:{pred:'clv:hasStreetToponym',type:'literal'},descrizione_via:{pred:'rdfs:label',type:'langlit',lang:'it'},tipo_via:{pred:'dct:type',type:'langlit',lang:'it'},localita:{pred:'clv:hasSpatialCoverage',type:'langlit',lang:'it'},importo_aggiudicazione:{pred:'sdmx-measure:obsValue',type:'decimal'},aggiudicatario:{pred:'dct:publisher',type:'langlit',lang:'it'},data_aggiudicazione:{pred:'dct:date',type:'date'},scelta_contraente:{pred:'dct:description',type:'langlit',lang:'it'},codice_cpv:{pred:'dct:identifier',type:'literal'},richiedente:{pred:'dct:publisher',type:'langlit',lang:'it'},iniziativa:{pred:'rdfs:label',type:'langlit',lang:'it'},qualifica:{pred:'rpo:hasRole',type:'langlit',lang:'it',onto:'RPO'},totale_costo:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_retribuzione:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},voce_retributiva:{pred:'rpo:payComponent',type:'langlit',lang:'it',onto:'RPO'},totale_compensi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},voce_accessoria:{pred:'rpo:allowanceComponent',type:'langlit',lang:'it',onto:'RPO'},voce_costo:{pred:'rpo:costComponent',type:'langlit',lang:'it',onto:'RPO'},totale_uomini:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_donne:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},eta_media_uomini:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},eta_media_donne:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},tipo_distacco:{pred:'rpo:contractType',type:'langlit',lang:'it',onto:'RPO'},titolo_di_studio:{pred:'cpv:educationLevelID',type:'langlit',lang:'it',onto:'CPV'},anzianita:{pred:'rpo:seniority',type:'langlit',lang:'it',onto:'RPO'},nati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},decessi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},immigrati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},emigrati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},numero_componenti:{pred:'sdmx-dimension:refArea',type:'literal',onto:'QB'},di_cui_minorenni:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_famiglie:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_entrate:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_uscite:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},residui_attivi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},residui_passivi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},media_gg_approvazione:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_impegnato:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_mandati_collegati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},permessi_rilasciati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},entro_termini:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},fuori_termini:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},tipologia:{pred:'dct:type',type:'langlit',lang:'it'},anno_protocollo:{pred:'sdmx-dimension:refPeriod',type:'literal',onto:'QB'},tipo_protocollo:{pred:'dct:type',type:'langlit',lang:'it'},tipo_spedizione:{pred:'dct:description',type:'langlit',lang:'it'},numero_protocolli:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},bandito_da:{pred:'dct:publisher',type:'langlit',lang:'it',onto:'CPSV'},oggetto:{pred:'dct:description',type:'langlit',lang:'it',onto:'CPSV'},data_scadenza:{pred:'ti:endTime',type:'typed',xsd:'xsd:date',onto:'CPSV'},data_pubblicazione:{pred:'dct:issued',type:'typed',xsd:'xsd:date',onto:'CPSV'},gazzetta_ufficiale:{pred:'dct:source',type:'literal',onto:'CPSV'},numero_posti:{pred:'cpsv:numberOfVacancies',type:'integer',onto:'CPSV'},numero_posti_riservati:{pred:'cpsv:numberOfVacancies',type:'integer',onto:'CPSV'},gruppo_politico:{pred:'ro:politicalGroup',type:'langlit',lang:'it',onto:'RO'},organo:{pred:'ro:memberOf',type:'langlit',lang:'it',onto:'RO'},orario_ricevimento:{pred:'ti:TimeInterval',type:'langlit',lang:'it'},nome_mercato:{pred:'rdfs:label',type:'langlit',lang:'it',onto:'POI'},fiera_mercato:{pred:'dct:type',type:'langlit',lang:'it',onto:'POI'},giorno:{pred:'ti:startTime',type:'langlit',lang:'it',onto:'TI'},inizio_periodo:{pred:'ti:startTime',type:'langlit',lang:'it',onto:'TI'},fine_periodo:{pred:'ti:endTime',type:'langlit',lang:'it',onto:'TI'},tipo_posteggio:{pred:'dct:type',type:'langlit',lang:'it'},totale_posteggi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},nome_associazione:{pred:'rdfs:label',type:'langlit',lang:'it',onto:'COV'},latitudine:{pred:'geo:lat',type:'typed',xsd:'xsd:decimal'},longitudine:{pred:'geo:long',type:'typed',xsd:'xsd:decimal'},cellulare:{pred:'sm:hasTelephone',type:'literal',onto:'SM'},tragitto:{pred:'rdfs:label',type:'langlit',lang:'it'},totale_alunni:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_rette_trasporto:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},totale_pagamenti_trasporto:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},insegna:{pred:'rdfs:label',type:'langlit',lang:'it'},attivita:{pred:'dct:type',type:'langlit',lang:'it'},ubicazione_esercizio:{pred:'_addr_fullAddress',type:'_clvnode'},n_civico:{pred:'_addr_streetNumber',type:'_clvnode'},tipo_esercizio:{pred:'dct:type',type:'langlit',lang:'it'},categoria_esercizio:{pred:'dct:type',type:'langlit',lang:'it'},ragione_sociale:{pred:'cov:legalName',type:'langlit',lang:'it'},
nome_centro:{pred:'cov:legalName',type:'langlit',lang:'it'},
nome_struttura:{pred:'cov:legalName',type:'langlit',lang:'it'},
nome_presidio:{pred:'cov:legalName',type:'langlit',lang:'it'},
unita_operativa:{pred:'cov:orgAcronym',type:'langlit',lang:'it'},
reparto:{pred:'cov:orgAcronym',type:'langlit',lang:'it'},
codice_esenzione:{pred:'dct:identifier',type:'literal'},
malattia:{pred:'dct:subject',type:'langlit',lang:'it'},
patologia:{pred:'dct:subject',type:'langlit',lang:'it'},
diagnosi:{pred:'dct:subject',type:'langlit',lang:'it'},
livello_centro:{pred:'dct:type',type:'langlit',lang:'it'},
livello_struttura:{pred:'dct:type',type:'langlit',lang:'it'},
centro_capofila_riferimento:{pred:'dct:relation',type:'langlit',lang:'it'},
centro_capofila:{pred:'dct:relation',type:'langlit',lang:'it'},
capofila:{pred:'dct:relation',type:'langlit',lang:'it'},
codice_struttura_sanitaria:{pred:'dct:identifier',type:'literal'},
codice_presidio:{pred:'dct:identifier',type:'literal'},
tipo_fonte:{pred:'dct:type',type:'langlit',lang:'it'},
kwh_prodotti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
consumo_kwh:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
potenza_kw:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
numero_impianti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
pm10:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
pm25:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
no2:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
so2:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
ozono:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
indice_qualita:{pred:'iot:hasQualityAnnotation',type:'langlit',lang:'it',onto:'IoT'},
raccolta_differenziata_perc:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
rifiuti_totali_kg:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
rifiuti_pro_capite:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
tipo_reato:{pred:'dct:type',type:'langlit',lang:'it'},
numero_reati:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
denunce:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
arresti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
tipo_incidente:{pred:'dct:type',type:'langlit',lang:'it'},
veicoli_coinvolti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
feriti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
morti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
condizioni_meteo:{pred:'dct:description',type:'langlit',lang:'it'},
tipo_servizio:{pred:'dct:type',type:'langlit',lang:'it'},
numero_beneficiari:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
spesa_totale:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
spesa_pro_capite:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
tipo_struttura:{pred:'dct:type',type:'langlit',lang:'it'},
posti_letto:{pred:'acco:totalBed',type:'integer'},
accreditata:{pred:'dct:description',type:'literal'},
codice_meccanografico:{pred:'dct:identifier',type:'literal'},
nome_istituto:{pred:'rdfs:label',type:'langlit',lang:'it'},
tipo_istituto:{pred:'dct:type',type:'langlit',lang:'it'},
numero_alunni:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
numero_classi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
numero_docenti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
tasso_abbandono:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
ordine_scuola:{pred:'dct:type',type:'langlit',lang:'it'},
numero_istituti:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
stazione_id:{pred:'dct:identifier',type:'literal'},
nome_stazione:{pred:'rdfs:label',type:'langlit',lang:'it'},
quota_m:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
quota:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
temperatura_c:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
umidita_perc:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
pressione_hpa:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
vento_kmh:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
precipitazioni_mm:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},
rete:{pred:'dct:description',type:'langlit',lang:'it'},
tipo_sensori:{pred:'dct:type',type:'langlit',lang:'it'},
gestore:{pred:'smapit:hasManager',type:'langlit',lang:'it',onto:'SMAPIT'},
tipo_allevamento:{pred:'dct:type',type:'langlit',lang:'it'},
capi:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
biologico:{pred:'dct:description',type:'literal'},
superficie_ha:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
produzione_tonnellate:{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'},
tipo_coltivazione:{pred:'dct:type',type:'langlit',lang:'it'},
pod:{pred:'dct:identifier',type:'literal'},
tipo_contratto:{pred:'dct:type',type:'langlit',lang:'it'},
codice_azienda:{pred:'dct:identifier',type:'literal'},
denominazione:{pred:'cov:legalName',type:'langlit',lang:'it'},
codice_comune:{pred:'dct:spatial',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities'},
codice_provincia:{pred:'clv:hasProvince',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/provinces'},
codice_regione:{pred:'clv:hasRegion',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/regions'},
codice_istat_comune:{pred:'dct:spatial',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities'},
tipo_ente:{pred:'cov:hasLegalStatus',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-organizations/legal-status'},
stato_civile:{pred:'cpv:maritalStatus',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/marital-status-types'},
titolo_di_studio:{pred:'cpv:educationLevelID',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',onto:'CPV'},
tipo_documento:{pred:'dct:type',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-documents/government-documents-types'},
tipologia_atto:{pred:'dct:type',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/classifications-for-documents/municipal-notice-board'},
categoria_poi:{pred:'poi:POIcategoryName',type:'vocab_uri',vocab:'https://w3id.org/italia/controlled-vocabulary/poi-category-classification'},
};

var ONTO_URI={'acco':'https://w3id.org/italia/onto/ACCO/','gtfs':'http://vocab.gtfs.org/terms#',
    'poi':'https://w3id.org/italia/onto/POI/','iot':'https://w3id.org/italia/onto/IoT/',
    'cov':'https://w3id.org/italia/onto/COV/','cpv':'https://w3id.org/italia/onto/CPV/',
    'ro':'https://w3id.org/italia/onto/RO/','smapit':'https://w3id.org/italia/onto/SM/',
    'qb':'http://purl.org/linked-data/cube#','ti':'https://w3id.org/italia/onto/TI/',
    'cis':'http://dati.beniculturali.it/cis/','adms':'http://www.w3.org/ns/adms#',
    'clv':'https://w3id.org/italia/onto/CLV/'};


// ——— FUNZIONI ENGINE ———

function detectSeparator(firstLine) {
  // Conta occorrenze dei separatori candidati nella prima riga
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = 0;
  candidates.forEach(sep => {
    const count = firstLine.split(sep).length - 1;
    if (count > bestCount) { bestCount = count; best = sep; }
  });
  return best;
}

function splitLine(line, sep) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === sep && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g,'').replace(/""/g,'"'));
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim().replace(/^"|"$/g,'').replace(/""/g,'"'));
    return result;
  }

function splitIntoLogicalLines(raw) {
    const logical = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        // Gestisce doppi apici escaped ""
        if (inQuotes && raw[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
        current += ch;
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && raw[i+1] === '\n') i++; // salta \n di \r\n
        if (current.trim()) logical.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) logical.push(current);
    return logical;
  }

function parseCSV(text) {
  if (!text || !text.trim()) return null;

  // Step 1: rileva separatore dalla prima riga logica
  const firstNewline = text.indexOf('\n');
  const firstLine = firstNewline >= 0 ? text.substring(0, firstNewline) : text;
  const sep = detectSeparator(firstLine);

  // Step 2: split in "righe logiche" rispettando newline dentro campi quotati
  function splitIntoLogicalLines(raw) {
    const logical = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        // Gestisce doppi apici escaped ""
        if (inQuotes && raw[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
        current += ch;
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && raw[i+1] === '\n') i++; // salta \n di \r\n
        if (current.trim()) logical.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) logical.push(current);
    return logical;
  }

  // Step 3: split singola riga logica nei campi
  function splitLine(line, sep) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === sep && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g,'').replace(/""/g,'"'));
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim().replace(/^"|"$/g,'').replace(/""/g,'"'));
    return result;
  }

  const logicalLines = splitIntoLogicalLines(text.trim());
  if (!logicalLines.length) return null;

  const headers = splitLine(logicalLines[0], sep);
  const rows = logicalLines.slice(1).filter(l => l.trim()).map(line => {
    const vals = splitLine(line, sep);
    return headers.reduce((o,h,i) => {
      const v = vals[i];
      o[h] = (v !== undefined && v !== null) ? String(v) : '';
      return o;
    }, {});
  });

  return { headers, rows, sep };
}

function detNormH(h){var n=h.toLowerCase().trim().replace(/[àÃ¡Ã¢Ã¤]/g,'a').replace(/[èéÃªÃ«]/g,'e').replace(/[ìÃ­Ã®Ã¯]/g,'i').replace(/[òÃ³Ã´Ã¶]/g,'o').replace(/[ùÃºÃ»Ã¼]/g,'u').replace(/Ã±/g,'n').replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');return DET_COL_NORM[n]||n;}

function detParseCSV(text){
  // Normalizza fine riga
  text=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  // Rileva separatore dalla prima riga
  var firstLine=text.trim().split('\n')[0]||'';
  var sep=',';
  var counts={',':0,';':0,'\t':0,'|':0};
  for(var ci=0;ci<firstLine.length;ci++){var ch=firstLine[ci];if(counts[ch]!==undefined)counts[ch]++;}
  var best=0;
  [';','\t','|',','].forEach(function(s){if(counts[s]>best){best=counts[s];sep=s;}});
  return text.trim().split('\n').map(function(line){
    var res=[],cur='',inQ=false;
    for(var i=0;i<line.length;i++){
      var ch=line[i];
      if(ch==='"'&&!inQ&&cur.trim()===''){inQ=true;}
      else if(ch==='"'&&inQ){
        // controlla se è una doppia virgoletta escaped ("")
        if(i+1<line.length&&line[i+1]==='"'){cur+='"';i++;}
        else{inQ=false;}
      }else if(ch===sep&&!inQ){res.push(cur.trim());cur='';}
      else{cur+=ch;}
    }
    res.push(cur.trim());return res;
  });
}

function detGetMainOnto(ontos){var priority=['GTFS','SMAPIT','ACCO','IoT','CulturalON','Cultural-ON','CulturalHeritage','PublicContract','RPO','Route','AtlasOfPaths','Learning','Transparency','Indicator','PARK','POT','CPEV','AccessCondition','Project','MU','NDC','CPSV-AP','RO','ADMS','QB','CPV','POI','COV','TI','CLV','L0'];for(var i=0;i<priority.length;i++){if(ontos.indexOf(priority[i])>=0)return priority[i];}return ontos[0]||'L0';}

function detFindColIdx(nh,cands){for(var i=0;i<cands.length;i++){var x=nh.indexOf(cands[i]);if(x>=0)return x;}return-1;}

function detHasAddr(nh){return['indirizzo','via','comune','cap','provincia','lat','lon','ubicazione_esercizio','indirizzo_esercizio','n_civico','numero_civico','citta','città','city','stazione','nome_stazione'].some(function(c){return nh.indexOf(c)>=0;});}

function detHasTime(nh,ontos){return ontos.indexOf('TI')>=0&&['inizio','termine','data','quando'].some(function(c){return nh.indexOf(c)>=0;});}

function detFindRule(normH,ontos){
  if(ontos.indexOf('QB')>=0&&normH==='nome')return null; // QB: nome non è un'entità
  if(ontos.indexOf('CPV')>=0&&normH==='nome')return{pred:'cpv:givenName',type:'langlit',lang:'it',onto:'CPV'};
  if(ontos.indexOf('QB')>=0&&(normH==='valore'||normH==='obs_value'||normH==='osservazione'||normH==='numero'||normH==='valore_assoluto'||normH==='frequenza'||normH==='count'||normH==='total'||normH==='amount'))return{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'};
  if(ontos.indexOf('QB')>=0&&normH==='date')return{pred:'sdmx-dimension:refPeriod',type:'typed',xsd:'xsd:date',onto:'QB'};
  if(ontos.indexOf('QB')>=0&&(normH==='datetime'||normH==='timestamp'))return{pred:'dct:date',type:'typed',xsd:'xsd:dateTime',onto:'QB'};
  if(ontos.indexOf('QB')>=0&&normH==='sesso')return{pred:'sdmx-dimension:sex',type:'langlit',lang:'it'};
  if(ontos.indexOf('QB')>=0&&normH==='cittadinanza')return{pred:'sdmx-attribute:obsStatus',type:'langlit',lang:'it'};
  if(ontos.indexOf('QB')>=0&&(normH==='eta'||normH==='fascia_eta'||normH==='classe_eta'))return{pred:'sdmx-attribute:obsStatus',type:'langlit',lang:'it'};
  if(ontos.indexOf('QB')>=0&&(normH==='asl'||normH==='azienda_sanitaria'||normH==='distretto'||normH==='comune'||normH==='regione'||normH==='provincia'))return{pred:'sdmx-dimension:refArea',type:'langlit',lang:'it'};
  var rule=DET_COL_RULES[normH];if(!rule)return null;if(rule.onto&&ontos.indexOf(rule.onto)<0)return null;return rule;
}
function detGetTimeVal(nh,row){var tc=['inizio','data','quando','published','data_inizio','periodo','stagione','programmazione','data_sopralluogo','data_ispezione','data_controllo','data_campionamento','data_rilevamento','data_misura','data_verifica','data_accertamento'];for(var i=0;i<tc.length;i++){var x=nh.indexOf(tc[i]);if(x>=0&&row[x]&&row[x].trim())return row[x].trim();}return null;}

function detAddPrefix(onto,set){var m={ACCO:'acco',GTFS:'gtfs',POI:'poi','IoT':'iot',COV:'cov',CPV:'cpv',RO:'ro',SMAPIT:'smapit',QB:'qb',CLV:'clv',TI:'ti',PARK:'park',POT:'pot',PublicContract:'pc',Route:'route',RPO:'rpo',MU:'mu',Learning:'learn',CPEV:'cpev',Transparency:'tr',Indicator:'indicator',CulturalON:'cis',ADMS:'adms',CPSV:'cpsv',L0:'l0'};if(m[onto])set.add(m[onto]);if(onto==='RO'){set.add('cov');set.add('cpv');}if(onto==='CPSV-AP'||onto==='CPSV'){set.add('cpsv');}if(onto==='QB'){set.add('sdmx-dimension');set.add('sdmx-measure');set.add('sdmx-attribute');}if(onto==='CulturalON'){set.add('schema');}if(onto==='TI'){set.add('schema');}if(onto==='PARK'){set.add('park');}if(onto==='POT'){set.add('pot');}if(onto==='PublicContract'){set.add('pc');set.add('cov');}if(onto==='Route'){set.add('route');}if(onto==='RPO'){set.add('rpo');set.add('cov');set.add('cpv');}if(onto==='MU'){set.add('mu');}if(onto==='Learning'){set.add('learn');}if(onto==='CPEV'){set.add('cpev');}if(onto==='Transparency'){set.add('tr');}if(onto==='Indicator'){set.add('indicator');set.add('qb');}if(onto==='AtlasOfPaths'){set.add('aop');}if(onto==='CulturalHeritage'){set.add('ch');}if(onto==='Project'){set.add('prj');}if(onto==='NDC'){set.add('ndc');set.add('dcat');}}

function sanitizeEmailValue(v){
  v=(v||'').trim();if(!v)return null;
  v=v.replace(/^mailto:/i,'');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))return null;
  return v;
}

function litQ(s,lang){
  s=String(s==null?'':s).replace(/\r/g,'').replace(/\n/g,' ');
  s=s.replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  return lang?'"'+s+'"@'+lang:'"'+s+'"^^xsd:string';
}
function detFormatLit(rule,val){
  if(!val&&val!==0)return null;
  val=String(val).trim();if(!val)return null;
  var BQ='\\"'; // backslash + virgoletta per Turtle
  if(rule.type==='skip')return null;
  if(rule.type==='langlit')return litQ(val,rule.lang||'it');
  if(rule.type==='literal')return litQ(val);
  if(rule.type==='decimal'){var n=parseFloat(val);return isNaN(n)?null:'"'+n+'"^^xsd:decimal';}
  if(rule.type==='integer'){var n2=parseInt(val);return isNaN(n2)?null:'"'+n2+'"^^xsd:integer';}
  if(rule.type==='boolean'){var b=val.toLowerCase();return(b==='si'||b==='true'||b==='1'||b==='yes')?'"true"^^xsd:boolean':'"false"^^xsd:boolean';}
  if(rule.type==='date'){var d=val.replace(/\//g,'-');return'"'+d+'"^^xsd:date';}
  if(rule.type==='datetime')return'"'+val+'"^^xsd:dateTime';
  if(rule.type==='typed'){
    var xsdType=rule.xsd||'xsd:string';
    if(xsdType==='xsd:decimal'){var nd=parseFloat(val);return isNaN(nd)?null:'"'+nd+'"^^xsd:decimal';}
    if(xsdType==='xsd:integer'){var ni=parseInt(val);return isNaN(ni)?null:'"'+ni+'"^^xsd:integer';}
    if(xsdType==='xsd:date'){return'"'+val.replace(/\//g,'-')+'"^^xsd:date';}
    if(xsdType==='xsd:dateTime')return'"'+val+'"^^xsd:dateTime';
    return'"'+val.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"^^'+xsdType;
  }
  if(rule.type==='vocab_uri'){var base=rule.vocab||'';var slug=encodeURIComponent(val.trim().toLowerCase().replace(/\s+/g,'-'));return'<'+base+'/'+slug+'>';}
  if(rule.type==='mailto'){var em=sanitizeEmailValue(val);if(!em)return null;return'<mailto:'+em+'>';}
  if(rule.type==='url'){var u=val.replace(/^<|>$/g,'').trim();if(!u||/[\s()<>"@]/.test(u)||/^\(/.test(u))return null;if(!u.startsWith('http')&&!u.startsWith('ftp'))u='https://'+u;return'<'+u+'>';}
  if(rule.type==='phone')return'"'+val+'"^^xsd:string';
  return litQ(val,'it');
}

function detectDeterministicMappings(cols, rows) {
  const mappings = {}; // col → {prop, type}
  const sampleRow = rows[0] || {};

  for (const col of cols) {
    // Salta colonne con prefisso numerico: "1-FRATELLI D'ITALIA", "9-+EUROPA"
    if (/^\d+[-—]/.test(col)) continue;
    const normalizedCol = normalizeColName(col);
    const val = String(sampleRow[col] || '').trim();
    for (const rule of COLUMN_RULES) {
      const nameMatch = rule.names.test(col) || rule.names.test(normalizedCol);
      const valueMatch = !rule.value || rule.value.test(val);
      if (nameMatch && valueMatch) {
        mappings[col] = { prop: rule.prop, type: rule.type };
        break;
      }
    }
  }
  return mappings;
}

function detectFromCorpus(headers) {
  if(!_workerState._corpusIndex) return [];
  var scores = {};
  headers.forEach(function(h){
    var n = h.toLowerCase().trim().replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');
    var colOntos = _workerState._corpusIndex[n];
    if(!colOntos) return;
    Object.keys(colOntos).forEach(function(onto){
      scores[onto] = (scores[onto]||0) + colOntos[onto];
    });
  });
  // Normalizza i nomi ontologia
  var ontoMap = {'IOT-AP_IT':'IoT','COV-AP_IT':'COV','RO-AP_IT':'RO',
    'CULTURAL-ON':'CulturalON','CPSV-AP':'CPSV','CPVAPIT':'CPV'};
  // Prende le ontologie con score più alto — top 3 + CLV se presente
  var sorted = Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];});
  var top = sorted.slice(0,5).filter(function(o){return scores[o]>=5;});
  var result = top.map(function(o){return ontoMap[o]||o;}).filter(function(o){
    return ['QB','POI','CPV','CLV','CPSV','TI','ACCO',
      'CulturalON','ADMS','RO','COV','GTFS','IoT','SMAPIT'].indexOf(o)>=0;
  });
  // Limita a top 2 + CLV solo se il CSV ha colonne geografiche reali
  var normHeaders = new Set(headers.map(function(h){
    return h.toLowerCase().trim().replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');
  }));
  // Gate strutturale: ogni ontologia viene accettata dal corpus SOLO se
  // il CSV contiene almeno una colonna caratteristica di quell'ontologia.
  var CORPUS_GATE = {
    'CLV':   ['lat','lon','lng','latitudine','longitudine','indirizzo','via','civico','comune','cap','stop_lat','stop_lon','coord_lat','coord_lon'],
    'GTFS':  ['stop_id','stop_name','stop_lat','stop_lon','route_id','agency_id','trip_id','zone_id'],
    'QB':    ['valore','obs_value','numero_residenti','importo','misura','fascia_eta','anno','trimestre','mese'],
    'ACCO':  ['stelle','posti_letto','tipo_struttura','albergo','camere','letti','hotel','agriturismo'],
    'IoT':   ['sensore','id_sensore','proprieta_osservata','tipo_sensore','valore_medio','avgspeed'],
    'SMAPIT':['codice_scuola','tipo_scuola','denominazione_scuola','codice_istituto','ciclo'],
    'CPV':   ['cognome','codice_fiscale','data_nascita','nome_completo','sesso','cittadinanza'],
    'RO':    ['ruolo','tipo_nomina','legislatura','voti_validi','qualifica_dipendente','contratto_lavoro','ccnl','data_assunzione'],
    'ADMS':  ['tipo_asset','versione','stato','formato','licenza','titolo_corso','ore_formazione','crediti','titolo_rilasciato','ente_erogatore'],
    'CPSV':  ['cig','cup','oggetto_contratto','importo_aggiudicazione','stazione_appaltante','aggiudicatario'],
    // TI, POI, COV, CulturalON: nessun gate — possono comparire in molti contesti
  };
  // Filtra: tieni solo ontologie il cui gate è soddisfatto (o non hanno gate)
  var result2 = result.filter(function(o){
    var gate = CORPUS_GATE[o];
    if(!gate) return true;
    return gate.some(function(col){ return normHeaders.has(col); });
  });
  // Limita a top 2 + CLV solo se colonne geografiche reali presenti
  var CLV_COLS = CORPUS_GATE['CLV'];
  var clvReallyPresent = CLV_COLS.some(function(col){return normHeaders.has(col);});
  var mainResult = result2.filter(function(o){return o!=='CLV';}).slice(0,2);
  if((scores['CLV']||0)>=5 && clvReallyPresent) mainResult.push('CLV');
  return [...new Set(mainResult)];
}

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
     (has(['scuola','liceo','comprensivo','istruzione']) && !has(['cig','importo','appalto','museo','biblioteca','ospedale','banca','dae','defibrillatore','aed']) && !allText.includes('dae-') && !allText.includes('defibrillator')))
    result.add('SMAPIT');

  // ACCO — strutture ricettive con varianti PA regionali
  // FN-ACCO FIX: aggiunge "classificazione/categoria_struttura/RTA/B&B" comuni
  // ACCO — R5-FIX: trigger forti sempre; trigger deboli richiedono contesto
  var _accoStrong = has(['albergo','hotel','b&b','ostello','agriturismo','accommodation',
                         'struttura_ricettiva','rta','affittacamere','casa_vacanze','codice_struttura_acco']);
  var _accoCtx    = has(['stelle','posti_letto','numero_posti_letto','camere','letti',
                         'check_in','check_out','classificazione_struttura','categoria_struttura']);
  // ACCO: escludi se contesto esercizi commerciali (insegna+ragione_sociale = bar/ristorante/ecc)
  var _isStrutturaSociale = (hasH(['tipo_struttura']) || hasH(['codice_struttura'])) &&
                           hasH(['nome_struttura','nome_centro','nome_presidio','nome_istituto']);
  var _isEsercizioCommerciale = hasH(['insegna','insegna_commerciale']) && hasH(['ragione_sociale']);
  if((_accoStrong || _accoCtx) && !_narrativeCSV && !_isEsercizioCommerciale && !_isStrutturaSociale)
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
  // IoT con coordinate → POI; IoT con data → TI (misurazioni temporali geolocalizzate)
  if(result.has('IoT') && _hasPOIcoord) result.add('POI');
  if(result.has('IoT') && hasH(['data','datetime','timestamp','date','ora'])) result.add('TI');
  if(has(['tipo_poi','dae','defibrillatore','punto_di_interesse','punto_interesse',
          'point_of_interest','idelem','id_elem',
          'id_area','id_punto','codice_stazione','stazione_monitoraggio','punto_monitoraggio',
          'stazione_id','nome_stazione','id_stazione']) || _hasOSMschema) {
    result.add('POI');
  } else if(has(['insegna','nome_esercizio','insegna_commerciale']) &&
            has(['attivita','tipo_esercizio','categoria_esercizio']) &&
            has(['ubicazione_esercizio','indirizzo_esercizio','n_civico','numero_civico'])) {
    // Esercizi commerciali senza coordinate: insegna + tipo attività + indirizzo → POI
    result.add('POI');
  } else if(_hasPOIcoord && !result.has('GTFS') &&  // B1: ACCO+lat/lon = anche POI
            !result.has('SMAPIT') && !result.has('QB') &&
            !result.has('Cultural-ON')) { // non aggiungere POI su istituti culturali
    if(has(['nome','denominazione','tipo','categoria','descrizione','tipo_incidente','via','strada']) &&
       !has(['importo','spesa','entrata']))
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
  if(result.has('CLV') && !_hasPOIcoord && !result.has('IoT') &&
     !has(['codice_ipa','codice_ente','partita_iva','tipo_poi','nome_poi','dae',
           'data_inizio','data_fine','data_evento','importo','valore','obs_value',
           'qualifica','contratto','ccnl','cig','cup','obbligo_trasparenza',
           'ubicazione_esercizio','n_civico','insegna','ragione_sociale'])) {
    if(result.has('COV') && !has(['codice_ipa','cf_ente','ragione_sociale','tipo_ente','nome_centro','nome_struttura','nome_presidio','unita_operativa'])) result.delete('COV');
    if(result.has('TI')  && !has(['data_inizio','data_fine','data_da','data_a','data_evento','quando','inizio','termine','data','data_rilevazione','data_campionamento','ora','feriti','morti','tipo_incidente'])) result.delete('TI');
    if(result.has('POI') && !has(['tipo_poi','nome_poi','dae','lat','lon','insegna','insegna_commerciale','stazione','nome_stazione','stazione_id','codice_stazione'])) result.delete('POI');
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

  // SM — contatti digitali: telefono o email nei dati di struttura
  if(hasH(['telefono','cellulare','email','pec','sito_web','sitoweb']) && !result.has('GTFS'))
    result.add('SM');

  // RO — ruoli
  if(has(['ruolo','incarico','mandato','consigliere','assessore','sindaco','dirigente',
          'id_consigliere','legislatura','voti_validi']))
    result.add('RO');

  // QB — dati statistici aggregati (R2-FIX: blocca su cataloghi ADMS e dataset trasporto)
  // FIX5: include incidenti/feriti/mortali come dati statistici aggregati
  // QB: NON se è un evento puntuale con data+ora+coordinate (→ POI/TI)
  if(!(hasH(['data']) && hasH(['ora']) && has(['lat','lon'])) && has(['anno','mese','occorrenze','totale','numero','valore','indice',
          'popolazione_residente','numero_famiglie','nati','morti','saldo_naturale',
          'incidenti','feriti','mortali','deceduti','sinistri',
          'count','total','amount','value','measure',
          'dipendenti','personale','addetti','lavoratori','occupati',
          'kwh_prodotti','consumo_kwh','numero_impianti','potenza_kw',
          'raccolta_differenziata_perc','rifiuti_totali_kg','rifiuti_pro_capite',
          'numero_reati','denunce','arresti','numero_beneficiari','spesa_totale',
          'numero_alunni','numero_classi','numero_istituti','numero_docenti',
          'superficie_ha','produzione_tonnellate','numero_aziende','capi',
          'maschi','femmine','fascia_eta','classe_eta']) &&
     !result.has('ACCO') && !result.has('GTFS') && !result.has('IoT') &&
     !result.has('COV') && !result.has('CPV') && !result.has('SMAPIT') &&
     !result.has('CPSV') && !result.has('ADMS') && !result.has('RO') &&
     !result.has('CulturalON') &&
     !has(['nome_dataset','nome_risorsa','numero_righe','distribution_url']) &&
     !has(['stazione_id','codice_stazione','nome_stazione']) &&  // meteo → IoT non QB
     !has(['tratta','capolinea','fermata_origine','fermata_arrivo']) &&
     !has(['codice_civico','cod_civico','numero_civico']))  // B3: codici geo —  QB
    if(!_narrativeCSV) result.add('QB');

  // TI — R6-FIX: richiede date esplicite O combo evento+luogo (non solo titolo/tipo)
  var _tiStrong = has(['data_inizio','data_fine','data_da','data_a','data_inizio_evento','data_fine_evento','inizio','termine','quando','orario_inizio',
                       'orario_fine','data_evento','ora_inizio','ora_fine','data_ora',
                       'data_rilevazione','data_apertura','data_chiusura','data_campionamento','data_rilevamento','data_misura','data_monitoraggio',
                       'date','datetime','timestamp','start_date','end_date','created_at','updated_at','time']) ||
                     (hasH(['data']) && has(['valore','misura','rilevazione','monitoraggio','campione','sensore','iot','misura'])) ||
                     (hasH(['data']) && hasH(['ora'])) ||
                     (hasH(['data']) && has(['feriti','morti','incidenti','tipo_incidente','veicoli_coinvolti']));
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

async function autoDetectOntoAI() {
  const text = document.getElementById('csv-input').value.trim();
  if (!text) return;
  const parsed = parseCSV(text);
    if (!parsed) return;
  
    // SE nessuna API key: usa rilevamento deterministico (no AI)
    if (!hasApiKey()) {
      var detOntos = detectOntologiesDeterministic(
        parsed.headers,
        parsed.rows
      );
      showStatus('Ontologie rilevate (deterministico): ' + detOntos.join(', '));
      setExampleOntos(detOntos);
      return;
    }
  

  // Costruisci campione: header + prime 5 righe
  const sample = [
    parsed.headers.join(','),
    ...parsed.rows.slice(0, 5).map(r => parsed.headers.map(h => r[h] || '').join(','))
  ].join('\n');

  const prompt = `Sei un esperto di Linked Open Data per la PA italiana.
Le ontologie ufficiali sono su https://github.com/italia/dati-semantic-assets

Analizza queste intestazioni CSV e le prime righe di dati:
${sample}

Rispondi SOLO con una lista JSON dei prefissi ontologici più appropriati tra questi valori esatti:
CLV, COV, CPV, L0, POI, SM, RO, TI, ADMS, ACCO, PARK, GTFS, Cultural-ON, CPSV-AP, QB, SKOS, PublicContract, Route, RPO, Learning, Transparency, Indicator, POT

REGOLE IMPORTANTI:
- QB: includi SOLO se ci sono colonne con valori numerici aggregati (conteggi, importi, percentuali, misurazioni). QB serve per statistiche, non per dati anagrafici generici.
- SKOS: includi SOLO se ci sono colonne con codici/categorie testuali espliciti (es. "tipologia", "codice_categoria", "classificazione", "tipo_ente") che rappresentano un vocabolario controllato. NON includere SKOS solo perché i dati sono demografici o sanitari.
- L0: includi sempre quando includi QB o SKOS come ontologia di supporto.
- Se il CSV ha solo colonne Anno/Anno-Mese + valori numerici: suggerisci QB e L0, NON SKOS.
- Se le colonne o i valori contengono "CulturalInstituteOrSite", "beniculturali", "mibact", "museo", "biblioteca", "monumento", "patrimonio" → includi SEMPRE "Cultural-ON"
- ACCO: includi se i dati riguardano strutture ricettive (hotel, albergo, B&B, ostello, stelle). COV NON va usato per strutture ricettive.
- COV: includi SOLO per enti/organizzazioni pubbliche o private. NON per strutture ricettive o luoghi fisici.
- Se i valori contengono "albergo", "hotel", "B&B", "stelle", "letti": usa ACCO + CLV + L0, NON COV.
- POI: includi SEMPRE se ci sono colonne lat/lon con luoghi fisici (dae, defibrillatore, tipo_poi). COV NON va usato per luoghi fisici con coordinate.
- Se colonne "tipo_poi","dae","defibrillatore" presenti: usa POI + CLV + L0, NON COV.
- CPV: includi se ci sono colonne nome/cognome/codice_fiscale/data_nascita che riguardano persone fisiche. NON usare COV per persone fisiche.
- GTFS: includi se ci sono colonne stop_id/stop_name/stop_lat/stop_lon/zone_id/route_id/trip_id che riguardano trasporto pubblico locale (fermate, linee, corse).
- Route: includi se ci sono colonne tipo_percorso/lunghezza_km/difficolta/dislivello/numero_tappe/lat_start/lon_start che riguardano percorsi/itinerari escursionistici o ciclabili. NON usare GTFS per percorsi non TPL.
- IoT: includi se ci sono colonne sensore/sensor/misura/valore/timestamp/proprieta_osservata che riguardano dati da sensori o dispositivi.
- SMAPIT: includi SOLO se ci sono colonne codice_scuola/denominazione_istituto/tipo_scuola/ciclo_scolastico. NON usarlo per percorsi o parcheggi.
- CLV: includi SEMPRE se ci sono colonne indirizzo/lat/lon/cap/comune/via/civico.
- PublicContract: includi se ci sono colonne cig/cup/importo_aggiudicazione/stazione_appaltante/aggiudicatario (appalti pubblici). NON usare CPSV-AP per gli appalti.
- RPO: includi se ci sono colonne qualifica_dipendente/contratto_lavoro/ccnl/ore_settimanali (risorse umane PA). NON usare RO per dipendenti.
- Learning: includi se ci sono colonne crediti/ects/ore_formazione/titolo_rilasciato/durata_corso (corsi/formazione).
- Transparency: includi se ci sono colonne obbligo_trasparenza/categoria_trasparenza/dato_obbligatorio/d_lgs_33 (dati D.Lgs. 33/2013).
- Indicator: includi se ci sono colonne tipo_indicatore/baseline/target/valore_indicatore (KPI e indicatori di performance).
- POT: includi se ci sono colonne prezzo_intero/prezzo_ridotto/biglietto/tariffa_ingresso (prezzi e tariffe servizi). NON usare ACCO per tariffe generiche.
- Se il CSV ha colonna "subject" con URI di istituti culturali → includi "Cultural-ON"

Esempio di risposta valida: ["ACCO", "CLV", "L0"]
Non aggiungere spiegazioni, solo il JSON.`;

  const btn = document.getElementById('btn-ai-onto');
  btn.disabled = true;
  btn.textContent = '—³ Analisi...';

  // EARLY EXIT AI-DETECT: se il deterministico ha già rilevato un catalogo ADMS
  // non chiamare l'AI — il CSV è un registro di file, non dati ontologici
  {
    const csvText = document.getElementById('csv-input')?.value || '';
    const parsed2 = parseCSV(csvText);
    if (parsed2) {
      const cols2 = parsed2.headers || [];
      const catalogMatch = ['nome_dataset','nome_risorsa','numero_righe','formato'].filter(k => cols2.includes(k)).length >= 2;
      const sampleV2 = (parsed2.rows?.slice(0,2) || []).flatMap(r => Object.values(r)).map(v=>String(v).toLowerCase()).join(' ');
      const catalogVal = /\b(csv|json|ttl|xlsx|xml)\b/.test(sampleV2) && /\b\d{4,}\b/.test(sampleV2) && cols2.some(c => /formato|identifier|nome_dataset|nome_risorsa/i.test(c));
      if (catalogMatch || catalogVal) {
        // Forza SOLO ADMS e termina senza chiamare l'AI
if (!window._exampleLocked) {
        document.querySelectorAll('#onto-selector .pill, #onto-selector-adv .pill').forEach(p => {
          p.classList.toggle('active', p.dataset.onto === 'ADMS');
        });
  }
        const msgEl = document.getElementById('auto-onto-msg');
        if (msgEl) { msgEl.textContent = 'ð¤ CSV catalogo: ADMS (AI-detect saltato)'; msgEl.style.display='block'; }
        btn.disabled = false;
        btn.textContent = 'ð¤ AI-detect';
        return;
      }
    }
  }

  try {
    // Per l'AI-detect usa sempre il modello più leggero disponibile per provider
  const AI_DETECT_MODELS = {
    'mistral':   'open-mistral-7b',
    'groq':      'llama-3.1-8b-instant',
    'ollama':    'gpt-oss:20b',
    'anthropic': 'claude-haiku-4-5-20251001',
  };
  let raw;
  const lightModel = AI_DETECT_MODELS[currentProvider];
  if (lightModel) {
    const modelEl = document.getElementById(`${currentProvider}-model`);
    const savedModel = modelEl?.value;
    if (modelEl) modelEl.value = lightModel;
    raw = await callAI(prompt);
    if (modelEl && savedModel) modelEl.value = savedModel; // ripristina
  } else {
    raw = await callAI(prompt); // gemini: usa il modello configurato
  }
    // Estrai il JSON dalla risposta
    const match = raw.match(/\[.*?\]/s);
    if (!match) throw new Error('Risposta non valida');
    const ontos = JSON.parse(match[0]);

    // Attiva le pillole suggerite — UNIONE con quelle già attive dal deterministico
    const alreadyActive = new Set([...document.querySelectorAll('#onto-selector .pill.active, #onto-selector-adv .pill.active')]
      .map(p => p.dataset.onto.toUpperCase()));
    const aiOntos = new Set(ontos.map(o => o.toUpperCase()));
    const merged = new Set([...alreadyActive, ...aiOntos]);
if (!window._exampleLocked) {
    document.querySelectorAll('#onto-selector .pill, #onto-selector-adv .pill').forEach(p => {
      p.classList.toggle('active', merged.has(p.dataset.onto.toUpperCase()));
    });
  }

    // Apri avanzate se necessario
    const advActive = [...document.querySelectorAll('#onto-selector-adv .pill.active')].length > 0;
    if (advActive) {
      document.getElementById('onto-advanced').style.display = 'block';
      document.getElementById('btn-adv').textContent = '—¼ Nascondi ontologie avanzate';
    }

    const msg = document.getElementById('auto-onto-msg');
    msg.textContent = `ð¤ AI suggerisce: ${ontos.join(', ')}`;
    msg.style.display = 'block';
    window._aiDetectDone = true; // segnala che l'AI ha già completato

  } catch(e) {
    showStatus('— AI-detect fallito: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'ð¤ AI-detect';
  }
}

function getMainClass(ontos) {
  const priority = ['GTFS','SMAPIT','ACCO','IOT','CULTURAL-ON','CULTURALON','PUBLICCONTRACT','RPO','ROUTE','LEARNING','TRANSPARENCY','INDICATOR','PARK','POT','CPSV-AP','QB','RO','POI','CPV','COV','TI','ADMS','L0'];
  for (const onto of priority) {
    if (ontos.map(o => o.toUpperCase()).includes(onto)) {
      return ONTO_MAIN_CLASS[onto] || ONTO_MAIN_CLASS[ontos.find(o=>o.toUpperCase()===onto)] || 'l0:Object';
    }
  }
  return 'l0:Object';
}

function getEntityTypeSegment(ontos) {
  const priority = ['GTFS','SMAPIT','IOT','ACCO','PARK','PUBLICCONTRACT','RPO','ROUTE','LEARNING','TRANSPARENCY','INDICATOR','POT','CULTURAL-ON','CULTURALON','CPSV-AP','QB','CPV','POI','COV','RO','TI','CLV','ADMS','L0'];
  const up = ontos.map(o => o.toUpperCase());
  for (const onto of priority) {
    if (up.includes(onto)) {
      return ONTO_URI_TYPE[onto] || 'resource';
    }
  }
  return 'resource';
}


function forceMainClassInTTL(ttl, ontos, entityBase) {
  var mc = getMainClass(ontos); if(!mc||mc==="l0:Object") return ttl;
  var KEEP=["foaf:","clv:","skos:","dct:","dcat:","rdfs:","owl:","geo:","sm:","vcard:","schema:"];
  if(entityBase){var esc=entityBase.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");var re1=new RegExp("(<"+esc+"[^>]+>)\\s+a\\s+([\\w:]+)","g");ttl=ttl.replace(re1,function(m,uri,cls){if(KEEP.some(function(k){return cls.indexOf(k)===0;}))return m;return uri+" a "+mc;});}
  if(ttl.indexOf(mc)<0){var re2=/(<https?:\/\/[^>]+>)\s+a\s+([\w:]+)/g;ttl=ttl.replace(re2,function(m,uri,cls){if(cls==="foaf:Agent")return m;if(KEEP.some(function(k){return cls.indexOf(k)===0;}))return m;return uri+" a "+mc;});}
  return ttl;
}

function buildTTLHeader(paname, ipa) {
  const ipaURI = `https://w3id.org/italia/data/public-organization/${ipa}`;
  return `@prefix owl:   <http://www.w3.org/2002/07/owl#> .
@prefix clv:   <https://w3id.org/italia/onto/CLV/> .
@prefix cov:   <https://w3id.org/italia/onto/COV/> .
@prefix cpv:   <https://w3id.org/italia/onto/CPV/> .
@prefix l0:    <https://w3id.org/italia/onto/l0/> .
@prefix cultural-on: <https://w3id.org/italia/onto/Cultural-ON/> .
@prefix poi:   <https://w3id.org/italia/onto/POI/> .
@prefix ro:    <https://w3id.org/italia/onto/RO/> .
@prefix ti:    <https://w3id.org/italia/onto/TI/> .
@prefix sm:    <https://w3id.org/italia/onto/SM/> .
@prefix dcat:  <http://www.w3.org/ns/dcat#> .
@prefix dct:   <http://purl.org/dc/terms/> .
@prefix foaf:  <http://xmlns.com/foaf/0.1/> .
@prefix geo:   <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .
@prefix skos:  <http://www.w3.org/2004/02/skos/core#> .
@prefix schema:<https://schema.org/> .
@prefix adms:  <https://w3id.org/italia/onto/ADMS/> .
@prefix skos:  <http://www.w3.org/2004/02/skos/core#> .
@prefix qb:    <http://purl.org/linked-data/cube#> .
@prefix sdmx-dimension: <http://purl.org/linked-data/sdmx/2009/dimension#> .
@prefix sdmx-measure:   <http://purl.org/linked-data/sdmx/2009/measure#> .
@prefix sdmx-attribute: <http://purl.org/linked-data/sdmx/2009/attribute#> .
@prefix smapit: <https://w3id.org/italia/onto/SMAPIT/> .

# Titolare del dato
<${ipaURI}>
    a foaf:Agent ;
    foaf:name "${paname}"@it ;
    dct:identifier "${ipa}" .
`;
}

function buildDeterministicTriples(cols, rows, entityBase, deterMappings, typeSegment='resource', ontos=[]) {
  const lines = [];
  // Colonne da saltare completamente (tipo _SKIP_ o pivot non mappabili)
  const skipColSet = new Set(
    Object.entries(deterMappings)
      .filter(([,m]) => m && m.prop === '_SKIP_')
      .map(([col]) => col)
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // URI entità: usa id/codice se disponibile, altrimenti indice
    const idCol = cols.find(c => /^(id|codice|cod|n_enea|numero|num|pk)$/i.test(c));
    const entityId = idCol ? String(row[idCol]).trim().replace(/[^a-zA-Z0-9_-]/g, '_') : String(i + 1);
    const uri = `<${entityBase}${typeSegment}/${entityId}>`;

    const triples = [];
    // Aggiungi classe principale deterministica
    const mainClass = getMainClass(ontos || []);
    triples.push(`    a ${mainClass}`);
    for (const col of cols) {
      // Salta colonne con prefisso numerico: "1-LISTA", "9-+EUROPA"
      if (/^\d+[-—]/.test(col)) continue;
      const m = deterMappings[col];
      if (!m) continue;
      if (m.prop === '_SKIP_') continue; // colonna pivot non mappabile
      const val = (row[col] !== undefined && row[col] !== null) ? String(row[col]).trim() : '';
      if (!val || val === 'null' || val === 'N/A') continue;

      if (m.type === 'xsd:decimal') {
        triples.push(`    ${m.prop} "${val}"^^xsd:decimal`);
      } else if (m.type === 'xsd:date') {
        triples.push(`    ${m.prop} "${val}"^^xsd:date`);
      } else if (m.type === 'xsd:anyURI') {
        triples.push(`    ${m.prop} <${val}>`);
      } else if (m.type === 'boolean') {
        // Per booleani si/no include il nome colonna per chiarezza
        const label = col.replace(/_/g, ' ').toLowerCase();
        triples.push(`    ${m.prop} """${tqe(label+': '+val)}"""@it`);
      } else if (m.type === '@it') {
        triples.push(`    ${m.prop} """${tqe(val)}"""@it`);
      } else {
        triples.push(`    ${m.prop} """${tqe(val)}"""^^xsd:string`);
      }
    }
    if (triples.length > 0) {
      lines.push(`${uri}`);
      lines.push(triples.join(' ;\n') + ' .');
      lines.push('');
    }
  }
  return lines.join('\n');
}

function buildDeterministicTTL(csvText,ontos,ipa,ente){
  if(!csvText||!csvText.trim())return'';
  if(!ontos||!ontos.length)return'';
  var nl='\n',sp='    ',dq='"';
  var rows=detParseCSV(csvText);
  if(!rows||rows.length<2)return'';
  var headers=rows[0];
  var dataRows=rows.slice(1).filter(function(r){return r.some(function(v){return v&&v.trim();});});
  if(!dataRows.length)return'';
  // Auto-correzione shift: se i dati hanno una colonna in più degli header,
  // probabilmente è una colonna _id implicita (numero di riga) → aggiungila all'header
  if(dataRows.length>0 && dataRows[0].length===headers.length+1){
    headers=['_id'].concat(headers);
  }
  var nh=headers.map(detNormH);
  var mainOnto=detGetMainOnto(ontos);
  var seg=DET_URI_SEG[mainOnto]||'resource';
  var mainClass=DET_CLASS[mainOnto]||'l0:Object';
  var base='https://w3id.org/italia/data/'+(ipa||'ipa')+'/';
  var idIdx=detFindColIdx(nh,['id','codice','codicescuola','stop_id','codice_scuola','cig','slug','remoteid','identifier','codice_fiscale','id_area','id_punto','codice_stazione','titolo','titolo_corso','denominazione']);
  if(idIdx<0)idIdx=0;
  var used=new Set(['rdfs','dct','foaf','xsd','l0','geo','sm']);
  ontos.forEach(function(o){detAddPrefix(o,used);});
  if(detHasAddr(nh))used.add('clv');
  if(detHasTime(nh,ontos))used.add('ti');
  var ttl='';
  used.forEach(function(p){if(DET_PREFIXES[p])ttl+='@prefix '+p+': <'+DET_PREFIXES[p]+'> .'+nl;});
  ttl+=nl;
  var orgIpa=ipa||'ipa';
  var orgName=ente||ipa||'Ente';
  ttl+='<https://w3id.org/italia/data/'+orgIpa+'/ds> a foaf:Agent ;'+nl;
  ttl+=sp+'foaf:name '+litQ(orgName,'it')+' ;'+nl;
  ttl+=sp+'dct:identifier '+dq+orgIpa+dq+' .'+nl+nl;
  var dsUri=base+'dataset/ds-'+orgIpa;
  if(ontos.indexOf('QB')>=0||ontos.indexOf('Indicator')>=0){
    ttl+='<'+dsUri+'> a qb:DataSet ;'+nl;
    ttl+=sp+'rdfs:label '+litQ('Dataset '+orgName,'it')+' ;'+nl;
    ttl+=sp+'dct:publisher <https://w3id.org/italia/data/'+orgIpa+'/ds> .'+nl+nl;
    used.add('qb');used.add('sdmx-dimension');used.add('sdmx-measure');used.add('sdmx-attribute');
  }
  dataRows.forEach(function(row){
    var idVal=(row[idIdx]||'').trim().replace(/[^a-zA-Z0-9_\-]/g,'-');
    if(!idVal)idVal='r'+(dataRows.indexOf(row)+1);
    if(ontos.indexOf('QB')>=0&&idIdx===0){idVal=row.map(function(v){return(v||'').trim().replace(/[^a-zA-Z0-9_\-]/g,'-');}).filter(Boolean).join('-');if(!idVal)idVal='obs-'+(dataRows.indexOf(row)+1);}
    var subURI=base+seg+'/'+idVal;
    var triples=[{pred:'a',val:mainClass,raw:true}];
    if(ontos.indexOf('QB')>=0)triples.push({pred:'qb:dataSet',val:'<'+dsUri+'>',raw:true});
    headers.forEach(function(origH,i){
      var normH=nh[i];
      var val=(row[i]||'').trim();
      if(!val||normH==='id')return;
      var rule=detFindRule(normH,ontos);
      if(rule&&rule.type==='_clvnode')return; // gestito da addrMap come nodo clv:Address
      if(!rule){var _n=detNormH(origH);if(_n==='_skip'||_n.startsWith('_'))return;if(val)triples.push({pred:'rdfs:comment',val:'"'+origH+': '+val.replace(/"/g,'\\"' )+('"@it'),raw:true,unmapped:true});return;}
      if(rule.type==='skip')return;      var litVal=detFormatLit(rule,val);
      if(litVal)triples.push({pred:rule.pred,val:litVal,raw:true});
    });
    var addrURI=base+'address/'+idVal;
    triples = triples.filter(function(t){return t.pred!=='clv:hasAddress'||t.raw;});
    if(detHasAddr(nh)&&ontos.indexOf('CLV')>=0)triples.push({pred:'clv:hasAddress',val:'<'+addrURI+'>',raw:true});
    var timeVal=detGetTimeVal(nh,row);
    var timeURI=base+'time/'+idVal;
    if(timeVal&&ontos.indexOf('TI')>=0)triples.push({pred:'ti:atTime',val:'<'+timeURI+'>',raw:true});
    if(triples.length>0){
      ttl+='<'+subURI+'>';
      triples.forEach(function(t,ti){
        var sep=ti===triples.length-1?' .':' ;';
        ttl+=nl+sp+t.pred+' '+t.val+sep;
      });
      ttl+=nl+nl;
    }
    if(detHasAddr(nh)&&ontos.indexOf('CLV')>=0){
      var addrTriples=[];
      var addrMap={indirizzo:'clv:fullAddress',via:'clv:fullAddress',strada:'clv:fullAddress',cap:'clv:postCode',ubicazione_esercizio:'clv:fullAddress',indirizzo_esercizio:'clv:fullAddress'};
      Object.keys(addrMap).forEach(function(col){
        var xi=nh.indexOf(col);
        if(xi>=0&&row[xi]&&row[xi].trim()){var v=row[xi].trim();addrTriples.push({pred:addrMap[col],val:litQ(v,'it')});}
      });
      var latI=nh.indexOf('lat'),lonI=nh.indexOf('lon');
      if(latI>=0&&row[latI])addrTriples.push({pred:'geo:lat',val:dq+row[latI].trim()+dq+'^^xsd:decimal'});
      if(lonI>=0&&row[lonI])addrTriples.push({pred:'geo:long',val:dq+row[lonI].trim()+dq+'^^xsd:decimal'});
      if(addrTriples.length>0){
        ttl+='<'+addrURI+'> a clv:Address'+(addrTriples.length>0?' ;':' .');
        addrTriples.forEach(function(t,ti){var sep=ti===addrTriples.length-1?' .':' ;';ttl+=nl+sp+t.pred+' '+t.val+sep;});
        ttl+=nl+nl;
      }
    }
    if(timeVal&&ontos.indexOf('TI')>=0){
      ttl+='<'+timeURI+'> a ti:TimeInstant ;'+nl;
      ttl+=sp+'ti:startTime '+dq+timeVal+dq+'^^xsd:dateTime .'+nl+nl;
    }
    // —— POI nodo separato se IoT è mainOnto
    if(ontos.indexOf('POI')>=0 && mainOnto!=='POI') {
      var poiURI=base+'point-of-interest/'+idVal;
      var poiTriples=[];
      var labelI2=nh.indexOf('denominazione');if(labelI2<0)labelI2=nh.indexOf('nome');
      if(labelI2>=0&&row[labelI2])poiTriples.push({pred:'rdfs:label',val:litQ((row[labelI2]||'').trim(),'it')});
      var idAreaI=nh.indexOf('id_area');if(idAreaI<0)idAreaI=nh.indexOf('id_punto');if(idAreaI<0)idAreaI=nh.indexOf('codice_stazione');
      if(idAreaI>=0&&row[idAreaI])poiTriples.push({pred:'dct:identifier',val:dq+(row[idAreaI]||'').trim()+dq});
      var latIp=nh.indexOf('lat');if(latIp<0)latIp=nh.indexOf('latitude');
      var lonIp=nh.indexOf('lon');if(lonIp<0)lonIp=nh.indexOf('longitude');
      if(latIp>=0&&row[latIp])poiTriples.push({pred:'geo:lat',val:dq+(row[latIp]||'').trim()+dq+'^^xsd:decimal'});
      if(lonIp>=0&&row[lonIp])poiTriples.push({pred:'geo:long',val:dq+(row[lonIp]||'').trim()+dq+'^^xsd:decimal'});
      if(poiTriples.length>0){
        ttl+='<'+poiURI+'> a poi:PointOfInterest ;'+nl;
        poiTriples.forEach(function(t,ti){var sep=ti===poiTriples.length-1?' .':' ;';ttl+=sp+t.pred+' '+t.val+sep+nl;});
        ttl+=nl;
        used.add('poi');
        ttl+='<'+subURI+'> iot:hasFeatureOfInterest <'+poiURI+'> .'+nl+nl;
      }
    }
    // —— MU nodo valore di misura
    if(ontos.indexOf('MU')>=0) {
      var unitaI=nh.indexOf('unita_misura');if(unitaI<0)unitaI=nh.indexOf('unita_di_misura');if(unitaI<0)unitaI=nh.indexOf('unit_of_measure');
      if(unitaI>=0&&row[unitaI]&&row[unitaI].trim()) {
        var unitaV=(row[unitaI]||'').trim();
        var numVal2='';
        nh.forEach(function(h,i){
          if(numVal2)return;
          var v=(row[i]||'').trim();
          if(!isNaN(parseFloat(v))&&isFinite(v)&&!['lat','lon','latitude','longitude'].includes(h)){numVal2=v;}
        });
        var muURI=base+'measurement/'+idVal;
        ttl+='<'+muURI+'> a mu:Value ;'+nl;
        ttl+=sp+'mu:hasMeasurementUnit '+litQ(unitaV,'it')+' ;'+nl;
        if(numVal2)ttl+=sp+'mu:value '+dq+numVal2+dq+'^^xsd:decimal ;'+nl;
        ttl+=sp+'dct:isPartOf <'+subURI+'> .'+nl+nl;
        used.add('mu');
      }
    }
    if(ontos.indexOf('RO')>=0){
      var nomeI=nh.indexOf('nome'),cognomeI=nh.indexOf('cognome'),ammI=nh.indexOf('denominazione');
      if(ammI<0)ammI=nh.indexOf('amministrazione');
      var nomeV=nomeI>=0?(row[nomeI]||'').trim():'',cognomeV=cognomeI>=0?(row[cognomeI]||'').trim():'';
      var personLabel=[nomeV,cognomeV].filter(Boolean).join(' ');
      if(personLabel){
        var personURI=base+'person/'+idVal;
        ttl+='<'+personURI+'> a cpv:Person ;'+nl+sp+'rdfs:label '+litQ(personLabel,'it')+' .'+nl+nl;
      }
      if(ammI>=0&&row[ammI]){
        var ammV=row[ammI].trim();
        var orgId2=ammV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var orgURI2=base+'organization/'+orgId2;
        if(!ttl.includes('<'+orgURI2+'>')){
          ttl+='<'+orgURI2+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+litQ(ammV,'it')+' .'+nl+nl;
        }
      }
    }
    // —— RPO: nodo persona + organizzazione collegati al ruolo ——————————————
    if(ontos.indexOf('RPO')>=0){
      var nI=nh.indexOf('nome'),cI=nh.indexOf('cognome'),cfI=nh.indexOf('codice_fiscale');
      var enteI=nh.indexOf('ente'),ipaI2=nh.indexOf('codice_ipa');
      var nV=(nI>=0?(row[nI]||'').trim():''),cV=(cI>=0?(row[cI]||'').trim():'');
      var personLabel2=[nV,cV].filter(Boolean).join(' ');
      if(personLabel2){
        var personURI2=base+'person/'+(cfI>=0&&row[cfI]?row[cfI].trim().toLowerCase():idVal);
        ttl+='<'+personURI2+'> a cpv:Person ;'+nl+sp+'rdfs:label '+litQ(personLabel2,'it')+' .'+nl;
        ttl+=sp+'rpo:holdsRole <'+base+'role-in-organization/'+idVal+'> .'+nl+nl;
      }
      var enteV=enteI>=0?(row[enteI]||'').trim():'';
      var ipaV2=ipaI2>=0?(row[ipaI2]||'').trim():'';
      if(enteV){
        var orgKey=ipaV2||enteV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var orgURI3=base+'organization/'+orgKey;
        if(!ttl.includes('<'+orgURI3+'>')){
          ttl+='<'+orgURI3+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+litQ(enteV,'it')+' .'+nl+nl;
        }
      }
    }
    // —— PublicContract: nodo stazione appaltante + aggiudicatario ——————————
    if(ontos.indexOf('PublicContract')>=0){
      var saI=nh.indexOf('stazione_appaltante'),ipaI3=nh.indexOf('codice_ipa');
      var aggI=nh.indexOf('aggiudicatario');
      if(saI>=0&&row[saI]&&row[saI].trim()){
        var saV=row[saI].trim();
        var ipaV3=ipaI3>=0?(row[ipaI3]||'').trim():'';
        var saKey=ipaV3||saV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var saURI=base+'organization/'+saKey;
        if(!ttl.includes('<'+saURI+'>')){
          ttl+='<'+saURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+litQ(saV,'it')+' ;'+nl;
          if(ipaV3)ttl+=sp+'cov:IPAcode '+dq+ipaV3+dq+' ;'+nl;
          ttl+=sp+'dct:identifier '+dq+saKey+dq+' .'+nl+nl;
        }
      }
      if(aggI>=0&&row[aggI]&&row[aggI].trim()){
        var aggV=row[aggI].trim();
        var aggKey=aggV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var aggURI=base+'organization/supplier-'+aggKey;
        if(!ttl.includes('<'+aggURI+'>')){
          ttl+='<'+aggURI+'> a cov:Organization ;'+nl+sp+'rdfs:label '+litQ(aggV,'it')+' .'+nl+nl;
        }
      }
    }
    // —— Route: nodo geografico start/end ——————————————————————————————————
    if(ontos.indexOf('Route')>=0){
      var latSI=nh.indexOf('lat_start'),lonSI=nh.indexOf('lon_start');
      if(latSI>=0&&lonSI>=0&&row[latSI]&&row[lonSI]){
        var startURI=base+'location/start-'+idVal;
        ttl+='<'+startURI+'> a clv:Address ;'+nl;
        ttl+=sp+'geo:lat '+dq+row[latSI].trim()+dq+'^^xsd:decimal ;'+nl;
        ttl+=sp+'geo:long '+dq+row[lonSI].trim()+dq+'^^xsd:decimal .'+nl+nl;
        used.add('clv');used.add('geo');
      }
    }
    // —— POT: nodo prezzo con valuta ————————————————————————————————————————
    if(ontos.indexOf('POT')>=0){
      var prezzoI=nh.indexOf('prezzo_intero'),ridottoI=nh.indexOf('prezzo_ridotto');
      if(prezzoI>=0&&row[prezzoI]&&row[prezzoI].trim()){
        var prezzoURI=base+'price/'+idVal;
        ttl+='<'+prezzoURI+'> a pot:PriceSpecification ;'+nl;
        ttl+=sp+'pot:hasCurrencyValue '+dq+parseFloat(row[prezzoI].trim())+dq+'^^xsd:decimal ;'+nl;
        ttl+=sp+'pot:hasCurrency "EUR"^^xsd:string .'+nl+nl;
        used.add('pot');
      }
    }
    // —— Indicator: nodo osservazione statistica ————————————————————————————
    if(ontos.indexOf('Indicator')>=0){
      var valIndI=nh.indexOf('valore_indicatore');
      if(valIndI>=0&&row[valIndI]&&row[valIndI].trim()){
        var obsURI=base+'observation/'+idVal;
        ttl+='<'+obsURI+'> a qb:Observation ;'+nl;
        ttl+=sp+'qb:dataSet <'+dsUri+'> ;'+nl;
        ttl+=sp+'sdmx-measure:obsValue '+dq+parseFloat(row[valIndI].trim())+dq+'^^xsd:decimal .'+nl+nl;
        used.add('qb');used.add('sdmx-measure');
      }
    }
    // —— Learning: nodo ente erogatore —————————————————————————————————————
    if(ontos.indexOf('Learning')>=0){
      var entErogI=nh.indexOf('ente_erogatore'),ipaErogI=nh.indexOf('codice_ipa');
      if(entErogI>=0&&row[entErogI]&&row[entErogI].trim()){
        var entErogV=row[entErogI].trim();
        var ipaErogV=ipaErogI>=0?(row[ipaErogI]||'').trim():'';
        var entErogKey=ipaErogV||entErogV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var entErogURI=base+'organization/'+entErogKey;
        if(!ttl.includes('<'+entErogURI+'>')){
          ttl+='<'+entErogURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+litQ(entErogV,'it')+' .'+nl+nl;
        }
      }
    }
    // —— Transparency: nodo ente referente —————————————————————————————————
    if(ontos.indexOf('Transparency')>=0){
      var enteTransI=nh.indexOf('ente'),ipaTransI=nh.indexOf('codice_ipa');
      if(enteTransI>=0&&row[enteTransI]&&row[enteTransI].trim()){
        var enteTransV=row[enteTransI].trim();
        var ipaTransV=ipaTransI>=0?(row[ipaTransI]||'').trim():'';
        var enteTransKey=ipaTransV||enteTransV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var enteTransURI=base+'organization/'+enteTransKey;
        if(!ttl.includes('<'+enteTransURI+'>')){
          ttl+='<'+enteTransURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+litQ(enteTransV,'it')+' .'+nl+nl;
        }
      }
    }
  });

  // Auto-correzione lat/lon invertite: se geo:long ha valore nel range lat-Italia (35-48)
  // scambia geo:lat e geo:long su quella riga/soggetto
  ttl = ttl.split('\n').map(function(line) {
    // Sostituisce geo:long "40.xx" con il valore corretto se è nel range latitudine
    var mLon = line.match(/geo:long\s+"([\d.]+)"/);
    if (mLon) {
      var lonVal = parseFloat(mLon[1]);
      if (lonVal >= 35 && lonVal <= 48) {
        // Questo valore sembra una latitudine — cerca la riga geo:lat vicina
        // Non possiamo fare swap riga per riga, segniamo per post-swap
        line = line.replace('geo:long', 'GEO_LONG_SWAP');
      }
    }
    var mLat = line.match(/geo:lat\s+"([\d.]+)"/);
    if (mLat) {
      var latVal = parseFloat(mLat[1]);
      if (latVal >= 6 && latVal <= 19) {
        line = line.replace('geo:lat', 'GEO_LAT_SWAP');
      }
    }
    return line;
  }).join('\n');
  // Esegui lo swap effettivo
  ttl = ttl.replace(/GEO_LONG_SWAP/g, 'geo:lat').replace(/GEO_LAT_SWAP/g, 'geo:long');
  return ttl.trim();
}


// ——— CLOUDFLARE WORKER HANDLER ———————————————————————————————————

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchCSV(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'CSV2RDF-Worker/1.0 (https://github.com/piersoft/CSV-to-RDF)' },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} scaricando ${url}`);
  const buf = await resp.arrayBuffer();
  const ct = resp.headers.get('content-type') || '';
  let text;
  if (ct.includes('charset=utf-8') || ct.includes('charset=UTF-8')) {
    text = new TextDecoder('utf-8').decode(buf);
  } else {
    text = new TextDecoder('utf-8').decode(buf);
    if (text.includes('ï¿½')) text = new TextDecoder('latin1').decode(buf);
  }
  // Rimuovi BOM
  return text.replace(/^ï»¿/, '');
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const reqUrl = new URL(request.url);

    if (reqUrl.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', version: 'v2026.03.27.53' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // —— CKAN PROXY — package_show per dati.gov.it —————————————————————
    if (reqUrl.pathname === '/ckan-proxy') {
      const datasetId = reqUrl.searchParams.get('id');
      if (!datasetId) {
        return new Response(JSON.stringify({ error: 'Parametro ?id= obbligatorio' }), {
          status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      try {
        const ckanUrl = 'https://dati.gov.it/opendata/api/3/action/package_show?id=' + encodeURIComponent(datasetId);
        const ckanResp = await fetch(ckanUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CSV2RDF-PA/1.0 (https://github.com/piersoft/CSV-to-RDF)'
          },
          signal: AbortSignal.timeout(10000)
        });
        const ckanData = await ckanResp.json();
        return new Response(JSON.stringify(ckanData), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch(e) {
        return new Response(JSON.stringify({ error: 'CKAN fetch failed: ' + e.message }), {
          status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    // Ricostruisce l'URL del CSV dalla raw query string per gestire URL con query string propri
    // es: /?url=https://host.it/api?year=2024&month=6 → url=https://host.it/api?year=2024&month=6
    const rawSearch = reqUrl.search; // es: "?url=https://...?year=2024&month=6&ipa=xxx"
    const urlParamMatch = rawSearch.match(/[?&]url=([^]*?)(?:&ipa=|&pa=|&fmt=|&ontos=|$)/);
    const csvUrl = urlParamMatch ? decodeURIComponent(urlParamMatch[1]) : reqUrl.searchParams.get('url');
    if (!csvUrl) {
      return new Response(JSON.stringify({
        error: 'Parametro ?url= obbligatorio',
        esempio: '/?url=https://miaPA.it/dati.csv&ipa=c_a662&pa=Comune+di+Bari',
        docs: 'https://github.com/piersoft/CSV-to-RDF'
      }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    try { new URL(csvUrl); } catch {
      return new Response(JSON.stringify({ error: 'URL non valido: ' + csvUrl }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const ipa    = (reqUrl.searchParams.get('ipa') || 'ente').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const paName = reqUrl.searchParams.get('pa') || 'Ente Pubblico';
    const fmtReq = reqUrl.searchParams.get('fmt') || 'ttl';
    const ontoForced = reqUrl.searchParams.get('onto');

    try {
      const csvText = await fetchCSV(csvUrl);

      const parsed = parseCSV(csvText);
      if (!parsed || !parsed.headers || parsed.headers.length < 2) {
        return new Response(JSON.stringify({ error: 'CSV non valido o meno di 2 colonne' }), {
          status: 422, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const ontos = ontoForced
        ? ontoForced.split(',').map(o => o.trim())
        : detectOntologiesDeterministic(parsed.headers, parsed.rows);

      const ttl = buildDeterministicTTL(csvText, ontos, ipa, paName);

      const meta = {
        csvUrl, ipa, pa: paName, ontologie: ontos,
        righe: parsed.rows.length, colonne: parsed.headers,
        generato: new Date().toISOString(), versione: 'v2026.03.27.53'
      };

      if (fmtReq === 'json') {
        return new Response(JSON.stringify({ meta, ttl }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const header = [
        `# CSV→RDF — ${meta.generato}`,
        `# Sorgente: ${csvUrl}`,
        `# Ente: ${paName} (${ipa})`,
        `# Ontologie: ${ontos.join(', ')}`,
        `# Righe: ${parsed.rows.length}`,
        `# https://piersoft.github.io/CSV-to-RDF/`,
        ''
      ].join('\n');

      return new Response(header + ttl, {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/turtle; charset=utf-8',
          'Content-Disposition': `attachment; filename="${ipa}-${Date.now()}.ttl"`,
          'X-Ontologie': ontos.join(','),
          'X-Righe': String(parsed.rows.length),
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message, csvUrl,
        hint: 'Verifica che il CSV sia pubblicamente accessibile con intestazioni nella prima riga'
      }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }
  }
};

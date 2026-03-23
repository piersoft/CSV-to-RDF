// ═══ COSTANTI GLOBALI ═══

const ONTO_RULES = [
  { keys: ['lat','lon','lng','latitudine','longitudine','coord'],          ontos: ['CLV','L0'] },
  { keys: ['indirizzo','address','via','strada','civico','cap','comune'],  ontos: ['CLV'] },
  { keys: ['telefono','phone','tel','email','mail','sito','web','url'],    ontos: ['SM'] },
  { keys: ['nome','name','denominazione','titolo'],                        ontos: ['L0'] },
  { keys: ['organizzazione','ente','comune','provincia','regione'],        ontos: ['COV'] },
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
    classes: ['clv:Address (Indirizzo)', 'clv:Feature (Caratteristica geografica)', 'clv:Geometry (Geometria)', 'clv:AdminUnit (Unità amministrativa)', 'clv:Road (Strada)', 'clv:StreetNumber (Numero civico)', 'clv:Identifier (Identificativo)', 'clv:GeographicalDistribution (Ripartizione geografica)'],
    props:   ['clv:hasAddress', 'clv:hasGeometry', 'clv:hasAdminUnit', 'clv:hasRoad', 'clv:hasStreetNumber', 'clv:hasSpatialCoverage', 'clv:lat', 'clv:long']
  },
  'COV': {
    classes: ['cov:Organization (Organizzazione)', 'cov:PublicOrganization (Organizzazione pubblica)', 'cov:Company (Impresa)', 'cov:ActivityType (Tipo attività)', 'cov:ContactPoint (Punto di contatto)', 'cov:Email (Email)', 'cov:Telephone (Telefono)'],
    props:   ['cov:hasContactPoint', 'cov:hasActivityType', 'cov:hasLegalStatus', 'cov:hasSubOrganization', 'cov:isPartOf']
  },
  'CPV': {
    classes: ['cpv:Person (Persona — SOLO persone fisiche)', 'cpv:Adult (Adulto)', 'cpv:Minor (Minore)', 'cpv:Senior (Anziano)'],
    props:   ['cpv:givenName', 'cpv:familyName', 'cpv:taxCode', 'cpv:dateOfBirth', 'cpv:hasResidenceAddress']
  },
  'POI': {
    classes: ['poi:PointOfInterest (Punto di interesse — classe generica per luoghi fisici)'],
    props:   ['poi:hasPointOfInterest']
  },
  'RO': {
    classes: ['ro:Role (Ruolo)'],
    props:   ['ro:hasRole', 'ro:isRoleOf', 'ro:withRole']
  },
  'TI': {
    classes: ['ti:TimeInterval (Intervallo temporale)', 'ti:TimeInstant (Istante)'],
    props:   ['ti:startTime', 'ti:endTime', 'ti:hasTimeInterval', 'ti:hasInstant']
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
    classes: ['sm:Email (Email)', 'sm:Telephone (Telefono)', 'sm:WebSite (Sito web)', 'sm:SocialNetworkAccount (Account social)'],
    props:   ['sm:hasEmail', 'sm:hasTelephone', 'sm:hasWebSite', 'sm:hasSocialNetworkAccount']
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
    classes: ['acco:Accommodation (Struttura ricettiva)', 'acco:Hotel (Hotel)', 'acco:Hostel (Ostello)', 'acco:BedAndBreakfast (B&B)', 'acco:Room (Camera)'],
    props:   ['acco:hasRoom', 'acco:hasStar', 'acco:checkIn', 'acco:checkOut', 'acco:hasAmenity']
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

var DET_COL_NORM={coory:'lat',coorx:'lon',indirizzo_e_mail_autonomia:'email',indirizzo_e_mail_sede_corsi:'email',indirizzo_pec_sede_corsi:'email',e_mail:'email',email_scuola:'email',mail_scuola:'email',indirizzo_email_autonomia:'email',indirizzo_pec_autonomia:'email',telefono_sede_autonomia:'telefono',tipologia:'tipo',tipologia_sede:'tipo',macrotipologia_autonomia:'tipo',tipologia_autonomia:'tipo',caratteristica_scuola:'tipo',codice:'id',localita:'comune',distr:'_skip',num_sedi_autonomia:'_skip',organico_autonomia:'_skip',organico_sede:'_skip',location:'_skip',codice_sede_riferimento:'_skip',codice_sede_di_direttivo:'_skip',indirizzo_sede_di_direttivo:'_skip',cod_comune_sede_dir:'_skip',comune_sede_di_direttivo:'_skip',cap_sede_dir:'_skip',s_comune_montano:'_skip',denominazione_sede_direttivo:'_skip',nome_poi:'nome',tipo_poi:'tipo',accessibile_h24:'accessibile',ident:'id',cod:'id',ident:'id',nome_poi:'nome',tipo_poi:'tipo',tipo_struttura:'tipo',nome_struttura:'nome',accessibile_h24:'accessibile',accessibilita:'accessibile',cod:'id',codice:'id',code:'id',pk:'id',indirizzo_completo:'indirizzo',email_referente:'email',latitudine:'lat',lat_wgs84:'lat',coordy:'lat',geo_lat:'lat',longitudine:'lon',lon_wgs84:'lon',coordx:'lon',geo_lon:'lon',lng:'lon',stop_lat:'lat',stop_lon:'lon',denominazionescuola:'denominazione',denominazione_scuola:'denominazione',nome_dataset:'denominazione',label:'denominazione',titolo:'denominazione',stop_name:'denominazione',nome_sensore:'denominazione',denominazioneistitutoriferimento:'denominazione',istituzione_scolastica:'denominazione',amministrazione:'denominazione',indirizzoscuola:'indirizzo',indirizzo_scuola:'indirizzo',ubicazione:'indirizzo',localizzazione:'indirizzo',address:'indirizzo',descrizionecomune:'comune',citta:'comune',city:'comune',capscuola:'cap',cap_scuola:'cap',postcode:'cap',codicescuola:'id',codice_scuola:'id',slug:'id',cig:'id',fid:'id',codiceistitutoriferimento:'id',codice_istituzione:'id',codice_ente_bdap:'id',id_consigliere:'id',id_sensore:'id',idsensore:'id',node_id:'id',remoteid:'id',pec:'email',mail:'email',sito_web:'sitoweb',website:'sitoweb',web:'sitoweb',url:'sitoweb',data_inizio:'inizio',quando:'inizio',published:'inizio',creation_date:'inizio',issued:'inizio',data_fine:'termine',fine:'termine',last_edit_date:'modified',ultimamodifica:'modified',occorrenze:'valore',numero:'valore',totale:'valore',popolazione_residente:'valore',importo:'valore',tipologia:'tipo',tipo_bene:'tipo',tipo_evento:'tipo',tipo_struttura:'tipo',tipo_scuola:'tipo',descrizionetipologiagradoistruzione:'tipo',informazioni:'descrizione',note:'descrizione',oggetto:'descrizione',tel:'telefono',phone:'telefono',anno_rilevazione:'anno',annoscolastico:'anno',anno_scolastico:'anno'};

var DET_URI_SEG={ACCO:'accommodation-facility',GTFS:'stop',POI:'point-of-interest','IoT':'sensor',COV:'public-organization',CPV:'person',RO:'role',SMAPIT:'school',QB:'observation',CLV:'address',TI:'event',CulturalON:'cultural-institute',ADMS:'asset',CPSV:'service',PARK:'parking-facility',PublicContract:'public-contract',Route:'route',RPO:'role-in-organization',Learning:'course',Transparency:'transparency-obligation',Indicator:'indicator',POT:'price-specification'};

var DET_CLASS={ACCO:'acco:Accommodation',GTFS:'gtfs:Stop',POI:'poi:PointOfInterest','IoT':'iot:Sensor',COV:'cov:PublicOrganization',CPV:'cpv:Person',RO:'ro:Role',SMAPIT:'smapit:School',QB:'qb:Observation',CLV:'clv:Address',TI:'l0:EventOrSituation',CulturalON:'cis:CulturalInstituteOrSite',ADMS:'adms:SemanticAsset',CPSV:'cpsv:PublicService',PARK:'park:ParkingFacility',PublicContract:'pc:Contract',Route:'route:Route',RPO:'rpo:RoleInOrganization',Learning:'learn:Course',Transparency:'tr:TransparencyObligation',Indicator:'indicator:Indicator',POT:'pot:PriceSpecification'};

var DET_PREFIXES={'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#','rdfs':'http://www.w3.org/2000/01/rdf-schema#','xsd':'http://www.w3.org/2001/XMLSchema#','dct':'http://purl.org/dc/terms/','dcat':'http://www.w3.org/ns/dcat#','foaf':'http://xmlns.com/foaf/0.1/','skos':'http://www.w3.org/2004/02/skos/core#','geo':'http://www.w3.org/2003/01/geo/wgs84_pos#','vcard':'http://www.w3.org/2006/vcard/ns#','schema':'https://schema.org/','park':'https://w3id.org/italia/onto/PARK/','pot':'https://w3id.org/italia/onto/POT/','pc':'https://w3id.org/italia/onto/PublicContract/','route':'https://w3id.org/italia/onto/Route/','rpo':'https://w3id.org/italia/onto/RPO/','mu':'https://w3id.org/italia/onto/MU/','learn':'https://w3id.org/italia/onto/Learning/','cpev':'https://w3id.org/italia/onto/CPEV/','tr':'https://w3id.org/italia/onto/Transparency/','indicator':'https://w3id.org/italia/onto/Indicator/','l0':'https://w3id.org/italia/onto/l0/','clv':'https://w3id.org/italia/onto/CLV/','sm':'https://w3id.org/italia/onto/SM/','ti':'https://w3id.org/italia/onto/TI/','acco':'https://w3id.org/italia/onto/ACCO/','poi':'https://w3id.org/italia/onto/POI/','iot':'https://w3id.org/italia/onto/IoT/','cov':'https://w3id.org/italia/onto/COV/','cpv':'https://w3id.org/italia/onto/CPV/','ro':'https://w3id.org/italia/onto/RO/','smapit':'https://w3id.org/italia/onto/SMAPIT/','gtfs':'http://vocab.gtfs.org/terms#','cis':'https://w3id.org/italia/onto/Cultural-ON/','adms':'http://www.w3.org/ns/adms#','cpsv':'http://purl.org/vocab/cpsv#','qb':'http://purl.org/linked-data/cube#','sdmx-dimension':'http://purl.org/linked-data/sdmx/2009/dimension#','sdmx-measure':'http://purl.org/linked-data/sdmx/2009/measure#','sdmx-attribute':'http://purl.org/linked-data/sdmx/2009/attribute#'};

var DET_COL_RULES={denominazione:{pred:'rdfs:label',type:'langlit',lang:'it'},nome:{pred:'rdfs:label',type:'langlit',lang:'it'},nome_iniziativa:{pred:'rdfs:label',type:'langlit',lang:'it'},titolo_evento:{pred:'rdfs:label',type:'langlit',lang:'it'},titolo_manifestazione:{pred:'rdfs:label',type:'langlit',lang:'it'},descrizione:{pred:'dct:description',type:'langlit',lang:'it'},luogo:{pred:'schema:location',type:'langlit',lang:'it'},sede:{pred:'schema:location',type:'langlit',lang:'it'},dove:{pred:'l0:hasLocation',type:'langlit',lang:'it'},ingresso:{pred:'schema:isAccessibleForFree',type:'langlit',lang:'it'},biglietto:{pred:'schema:isAccessibleForFree',type:'langlit',lang:'it'},organizzatore:{pred:'dct:publisher',type:'langlit',lang:'it'},promotore:{pred:'dct:publisher',type:'langlit',lang:'it'},interpreti:{pred:'schema:performer',type:'langlit',lang:'it'},esecutori:{pred:'schema:performer',type:'langlit',lang:'it'},autore:{pred:'dct:creator',type:'langlit',lang:'it'},periodo:{pred:'dct:temporal',type:'langlit',lang:'it'},stagione:{pred:'dct:temporal',type:'langlit',lang:'it'},programmazione:{pred:'dct:temporal',type:'langlit',lang:'it'},stalli:{pred:'park:numberOfParkingSpaces',type:'integer'},posti_auto:{pred:'park:numberOfParkingSpaces',type:'integer'},capacita_posti:{pred:'park:numberOfParkingSpaces',type:'integer'},posti_disabili:{pred:'park:numberOfDisabledParkingSpaces',type:'integer'},tariffa_oraria:{pred:'park:ratePerHour',type:'decimal'},tipo_parcheggio:{pred:'park:parkingType',type:'langlit',lang:'it'},cig:{pred:'pc:hasCIG',type:'literal'},cup:{pred:'pc:hasCUP',type:'literal'},importo_aggiudicazione:{pred:'pc:hasAmount',type:'decimal'},importo_base:{pred:'pc:hasAmount',type:'decimal'},importo_contratto:{pred:'pc:hasAmount',type:'decimal'},oggetto_contratto:{pred:'pc:hasMainObject',type:'langlit',lang:'it'},oggetto_gara:{pred:'pc:hasMainObject',type:'langlit',lang:'it'},stazione_appaltante:{pred:'pc:contractingAuthority',type:'langlit',lang:'it'},aggiudicatario:{pred:'pc:awardedTo',type:'langlit',lang:'it'},cpv_codice:{pred:'pc:hasCPV',type:'literal'},modalita_scelta:{pred:'pc:selectionCriteria',type:'langlit',lang:'it'},data_aggiudicazione:{pred:'pc:awardDate',type:'date'},lunghezza_km:{pred:'route:routelLength',type:'literal'},numero_tappe:{pred:'route:numberOfStages',type:'integer'},durata_stimata:{pred:'route:routeEstDuration',type:'literal'},nome_breve_percorso:{pred:'route:routeShortName',type:'literal'},nome_esteso_percorso:{pred:'route:routeLongName',type:'literal'},difficolta:{pred:'route:difficulty',type:'langlit',lang:'it'},dislivello:{pred:'route:heightDifference',type:'decimal'},qualifica_dipendente:{pred:'rpo:hasRole',type:'langlit',lang:'it'},contratto_lavoro:{pred:'rpo:contractType',type:'langlit',lang:'it'},livello_contrattuale:{pred:'rpo:contractLevel',type:'literal'},ore_settimanali:{pred:'rpo:weeklyHours',type:'decimal'},ccnl:{pred:'rpo:hasCCNL',type:'langlit',lang:'it'},crediti:{pred:'learn:ects',type:'decimal'},ects:{pred:'learn:ects',type:'decimal'},ore_formazione:{pred:'learn:hours',type:'decimal'},durata_corso:{pred:'learn:duration',type:'langlit',lang:'it'},titolo_rilasciato:{pred:'learn:awardedTitle',type:'langlit',lang:'it'},titolo_corso:{pred:'rdfs:label',type:'langlit',lang:'it'},obbligo_trasparenza:{pred:'tr:hasTransparencyObligation',type:'langlit',lang:'it'},categoria_trasparenza:{pred:'tr:transparencyCategory',type:'langlit',lang:'it'},dato_obbligatorio:{pred:'tr:mandatoryData',type:'langlit',lang:'it'},norma_riferimento:{pred:'dct:source',type:'literal'},tipo_indicatore:{pred:'indicator:indicatorType',type:'langlit',lang:'it'},valore_indicatore:{pred:'sdmx-measure:obsValue',type:'decimal'},baseline:{pred:'indicator:baseline',type:'decimal'},target:{pred:'indicator:target',type:'decimal'},fonte_indicatore:{pred:'dct:source',type:'langlit',lang:'it'},partita_iva:{pred:'cov:VATnumber',type:'literal'},codice_ipa:{pred:'cov:IPAcode',type:'literal'},rea:{pred:'cov:REANumber',type:'literal'},data_costituzione:{pred:'cov:foundationDate',type:'date'},codice_univoco_ufficio:{pred:'cov:officeIdentifier',type:'literal'},oggetto_sociale:{pred:'cov:businessObjective',type:'langlit',lang:'it'},acronimo:{pred:'cov:orgAcronym',type:'literal'},cf:{pred:'cpv:taxCode',type:'literal'},codice_fiscale:{pred:'cpv:taxCode',type:'literal'},codice_sesso:{pred:'cpv:sexID',type:'literal'},grado_istruzione:{pred:'cpv:educationLevelID',type:'literal'},eta:{pred:'cpv:age',type:'integer'},nome_completo:{pred:'cpv:fullName',type:'literal'},numero_camere:{pred:'acco:totalRoom',type:'integer'},numero_bagni:{pred:'acco:totalToilet',type:'integer'},codice_struttura:{pred:'acco:accommodationCode',type:'literal'},codice_stelle:{pred:'acco:accoStarRatingID',type:'literal'},nome_ufficiale:{pred:'poi:POIofficialName',type:'langlit',lang:'it'},nome_alternativo:{pred:'poi:POIalternativeName',type:'langlit',lang:'it'},categoria_poi:{pred:'poi:POIcategoryName',type:'langlit',lang:'it'},id_poi:{pred:'poi:POIID',type:'literal'},forma_giuridica:{pred:'cov:legalStatus',type:'langlit',lang:'it'},natura_giuridica:{pred:'cov:legalStatus',type:'langlit',lang:'it'},codice_ateco:{pred:'cov:economicActivity',type:'literal'},settore_ateco:{pred:'cov:economicActivity',type:'langlit',lang:'it'},licenza:{pred:'dct:license',type:'url'},tipo_licenza:{pred:'dct:license',type:'langlit',lang:'it'},numero_camere_totali:{pred:'acco:totalRoom',type:'integer'},tipo:{pred:'dct:type',type:'langlit',lang:'it'},categoria:{pred:'dct:type',type:'langlit',lang:'it'},email:{pred:'sm:hasEmail',type:'mailto'},sitoweb:{pred:'sm:hasWebSite',type:'url'},telefono:{pred:'sm:hasTelephone',type:'literal'},fax:{pred:'sm:hasFax',type:'literal'},lat:{pred:'geo:lat',type:'typed',xsd:'xsd:decimal'},lon:{pred:'geo:long',type:'typed',xsd:'xsd:decimal'},modified:{pred:'dct:modified',type:'typed',xsd:'xsd:date'},numero_posti_letto:{pred:'acco:numberOfRooms',type:'typed',xsd:'xsd:integer',onto:'ACCO'},posti_letto:{pred:'acco:numberOfRooms',type:'typed',xsd:'xsd:integer',onto:'ACCO'},letti:{pred:'acco:numberOfBeds',type:'typed',xsd:'xsd:integer',onto:'ACCO'},camere:{pred:'acco:numberOfRooms',type:'typed',xsd:'xsd:integer',onto:'ACCO'},stelle:{pred:'acco:starRating',type:'typed',xsd:'xsd:integer',onto:'ACCO'},stop_id:{pred:'dct:identifier',type:'literal',onto:'GTFS'},stop_code:{pred:'gtfs:code',type:'literal',onto:'GTFS'},zone_id:{pred:'gtfs:zone',type:'literal',onto:'GTFS'},location_type:{pred:'gtfs:locationType',type:'typed',xsd:'xsd:integer',onto:'GTFS'},parent_station:{pred:'gtfs:parentStation',type:'literal',onto:'GTFS'},route_id:{pred:'dct:identifier',type:'literal',onto:'GTFS'},route_short_name:{pred:'gtfs:shortName',type:'literal',onto:'GTFS'},route_long_name:{pred:'gtfs:longName',type:'langlit',lang:'it',onto:'GTFS'},route_type:{pred:'gtfs:routeType',type:'typed',xsd:'xsd:integer',onto:'GTFS'},agency_id:{pred:'gtfs:agency',type:'literal',onto:'GTFS'},arrival_time:{pred:'gtfs:arrivalTime',type:'literal',onto:'GTFS'},departure_time:{pred:'gtfs:departureTime',type:'literal',onto:'GTFS'},stop_sequence:{pred:'gtfs:stopSequence',type:'typed',xsd:'xsd:integer',onto:'GTFS'},valore:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},valore_medio:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},unita:{pred:'iot:hasUnitOfMeasure',type:'literal',onto:'IoT'},avgspeed:{pred:'iot:hasValue',type:'typed',xsd:'xsd:decimal',onto:'IoT'},anno:{pred:'sdmx-dimension:refPeriod',type:'literal',onto:'QB'},mese:{pred:'sdmx-dimension:refPeriod',type:'literal',onto:'QB'},comparto:{pred:'cov:hasSector',type:'langlit',lang:'it',onto:'COV'},inquadramento:{pred:'cov:hasLegalForm',type:'langlit',lang:'it',onto:'COV'},cognome:{pred:'cpv:familyName',type:'langlit',lang:'it',onto:'CPV'},sesso:{pred:'cpv:sex',type:'literal',onto:'CPV'},cittadinanza:{pred:'cpv:citizenship',type:'langlit',lang:'it',onto:'CPV'},data_nascita:{pred:'cpv:dateOfBirth',type:'typed',xsd:'xsd:date',onto:'CPV'},ruolo:{pred:'rdfs:label',type:'langlit',lang:'it',onto:'RO'},legislatura:{pred:'dct:description',type:'langlit',lang:'it',onto:'RO'},voti_validi:{pred:'ro:votesObtained',type:'typed',xsd:'xsd:integer',onto:'RO'},gestore:{pred:'smapit:hasManager',type:'langlit',lang:'it',onto:'SMAPIT'},inizio:{pred:'ti:startDate',type:'typed',xsd:'xsd:dateTime',onto:'TI'},termine:{pred:'ti:endDate',type:'typed',xsd:'xsd:dateTime',onto:'TI'},durata:{pred:'ti:duration',type:'literal',onto:'TI'},dove:{pred:'l0:hasLocation',type:'langlit',lang:'it',onto:'TI'},accessibile:{pred:'poi:hasAccessCondition',type:'literal',onto:'POI'},distr:{pred:'_skip',type:'skip'},location:{pred:'_skip',type:'skip'},s_comune_montano:{pred:'_skip',type:'skip'},organico_autonomia:{pred:'_skip',type:'skip'},organico_sede:{pred:'_skip',type:'skip'},accessibile:{pred:'poi:hasAccessCondition',type:'literal',onto:'POI'},datazione:{pred:'dct:date',type:'literal',onto:'CulturalON'},numero_inventario:{pred:'dct:identifier',type:'literal',onto:'CulturalON'},version:{pred:'adms:version',type:'literal',onto:'ADMS'},versione:{pred:'adms:version',type:'literal',onto:'ADMS'},stato:{pred:'adms:status',type:'literal',onto:'ADMS'},formato:{pred:'dct:format',type:'literal',onto:'ADMS'},publisher:{pred:'dct:publisher',type:'langlit',lang:'it',onto:'ADMS'},aggiudicatario:{pred:'cpsv:hasParticipant',type:'langlit',lang:'it',onto:'CPSV'},cup:{pred:'dct:identifier',type:'literal',onto:'CPSV'},ufficio:{pred:'cpsv:isGroupedUnder',type:'langlit',lang:'it',onto:'CPSV'},indirizzo:{pred:'_skip',type:'skip'},comune:{pred:'_skip',type:'skip'},cap:{pred:'_skip',type:'skip'},provincia:{pred:'_skip',type:'skip'},civico:{pred:'_skip',type:'skip'},numerocivico:{pred:'_skip',type:'skip'},regione:{pred:'_skip',type:'skip'},via:{pred:'_skip',type:'skip'},strada:{pred:'_skip',type:'skip'}};

var ONTO_URI={'acco':'https://w3id.org/italia/onto/ACCO/','gtfs':'http://vocab.gtfs.org/terms#',
    'poi':'https://w3id.org/italia/onto/POI/','iot':'https://w3id.org/italia/onto/IoT/',
    'cov':'https://w3id.org/italia/onto/COV/','cpv':'https://w3id.org/italia/onto/CPV/',
    'ro':'https://w3id.org/italia/onto/RO/','smapit':'https://w3id.org/italia/onto/SM/',
    'qb':'http://purl.org/linked-data/cube#','ti':'https://w3id.org/italia/onto/TI/',
    'cis':'http://dati.beniculturali.it/cis/','adms':'http://www.w3.org/ns/adms#',
    'clv':'https://w3id.org/italia/onto/CLV/'};


// ═══ FUNZIONI ENGINE ═══

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

function detNormH(h){var n=h.toLowerCase().trim().replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');return DET_COL_NORM[n]||n;}

function detParseCSV(text){
  // Normalizza fine riga: \r\n → \n, poi \r isolato → \n (vecchi CSV Mac/dati.gov.it)
  text=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  return text.trim().split('\n').map(function(line){
    var res=[],cur='',inQ=false;
    for(var i=0;i<line.length;i++){var c=line[i];if(c==='"'){inQ=!inQ;}else if(c===','&&!inQ){res.push(cur.trim());cur='';}else cur+=c;}
    res.push(cur.trim());return res;
  });
}

function detGetMainOnto(ontos){var priority=['GTFS','SMAPIT','ACCO','IoT','CulturalON','PublicContract','RPO','Route','Learning','Transparency','Indicator','PARK','POT','CPSV-AP','RO','ADMS','TI','CPV','COV','POI','QB','CLV','L0'];for(var i=0;i<priority.length;i++){if(ontos.indexOf(priority[i])>=0)return priority[i];}return ontos[0]||'L0';}

function detFindColIdx(nh,cands){for(var i=0;i<cands.length;i++){var x=nh.indexOf(cands[i]);if(x>=0)return x;}return-1;}

function detHasAddr(nh){return['indirizzo','via','comune','cap','provincia','lat','lon'].some(function(c){return nh.indexOf(c)>=0;});}

function detHasTime(nh,ontos){return ontos.indexOf('TI')>=0&&['inizio','termine','data','quando'].some(function(c){return nh.indexOf(c)>=0;});}

function detFindRule(normH,ontos){if(ontos.indexOf('CPV')>=0&&normH==='nome')return{pred:'cpv:givenName',type:'langlit',lang:'it',onto:'CPV'};if(ontos.indexOf('QB')>=0&&(normH==='valore'||normH==='obs_value'||normH==='osservazione'))return{pred:'sdmx-measure:obsValue',type:'decimal',onto:'QB'};if(ontos.indexOf('QB')>=0&&normH==='sesso')return{pred:'sdmx-dimension:sex',type:'literal'};if(ontos.indexOf('QB')>=0&&normH==='cittadinanza')return{pred:'sdmx-attribute:obsStatus',type:'literal'};var rule=DET_COL_RULES[normH];if(!rule)return null;if(rule.onto&&ontos.indexOf(rule.onto)<0)return null;return rule;}

function detGetTimeVal(nh,row){var tc=['inizio','data','quando','published','data_inizio','periodo','stagione','programmazione'];for(var i=0;i<tc.length;i++){var x=nh.indexOf(tc[i]);if(x>=0&&row[x]&&row[x].trim())return row[x].trim();}return null;}

function detAddPrefix(onto,set){var m={ACCO:'acco',GTFS:'gtfs',POI:'poi','IoT':'iot',COV:'cov',CPV:'cpv',RO:'ro',SMAPIT:'smapit',QB:'qb',CLV:'clv',TI:'ti',PARK:'park',POT:'pot',PublicContract:'pc',Route:'route',RPO:'rpo',MU:'mu',Learning:'learn',CPEV:'cpev',Transparency:'tr',Indicator:'indicator',CulturalON:'cis',ADMS:'adms',CPSV:'cpsv',L0:'l0'};if(m[onto])set.add(m[onto]);if(onto==='RO'){set.add('cov');set.add('cpv');}if(onto==='CPSV-AP'||onto==='CPSV'){set.add('cpsv');}if(onto==='QB'){set.add('sdmx-dimension');set.add('sdmx-measure');set.add('sdmx-attribute');}if(onto==='CulturalON'){set.add('schema');}if(onto==='TI'){set.add('schema');}if(onto==='PARK'){set.add('park');}if(onto==='POT'){set.add('pot');}if(onto==='PublicContract'){set.add('pc');set.add('cov');}if(onto==='Route'){set.add('route');}if(onto==='RPO'){set.add('rpo');set.add('cov');set.add('cpv');}if(onto==='MU'){set.add('mu');}if(onto==='Learning'){set.add('learn');}if(onto==='CPEV'){set.add('cpev');}if(onto==='Transparency'){set.add('tr');}if(onto==='Indicator'){set.add('indicator');set.add('qb');}}

function detFormatLit(rule,val){
  if(!val&&val!==0)return null;
  val=String(val).trim();if(!val)return null;
  if(rule.type==='skip')return null;
  if(rule.type==='langlit')return'"'+val.replace(/"/g,'\"')+'"@'+(rule.lang||'it');
  if(rule.type==='literal')return'"'+val.replace(/"/g,'\"')+'"^^xsd:string';
  if(rule.type==='decimal'){var n=parseFloat(val);return isNaN(n)?null:'"'+n+'"^^xsd:decimal';}
  if(rule.type==='integer'){var n2=parseInt(val);return isNaN(n2)?null:'"'+n2+'"^^xsd:integer';}
  if(rule.type==='boolean'){var b=val.toLowerCase();return(b==='si'||b==='true'||b==='1'||b==='yes')?'"true"^^xsd:boolean':'"false"^^xsd:boolean';}
  if(rule.type==='date'){var d=val.replace(/\//g,'-');return'"'+d+'"^^xsd:date';}
  if(rule.type==='datetime')return'"'+val+'"^^xsd:dateTime';
  if(rule.type==='mailto'){var em=sanitizeEmailValue(val);if(!em)return null;return'"'+em+'"^^xsd:string';}
  if(rule.type==='url'){var u=val.replace(/^<|>$/g,'').trim();if(!u||/[\s()<>"@]/.test(u)||/^\(/.test(u))return null;if(!u.startsWith('http')&&!u.startsWith('ftp'))u='https://'+u;return'<'+u+'>';}
  if(rule.type==='phone')return'"'+val+'"^^xsd:string';
  return'"'+val.replace(/"/g,'\"')+'"@it';
}

function detectDeterministicMappings(cols, rows) {
  const mappings = {}; // col → {prop, type}
  const sampleRow = rows[0] || {};

  for (const col of cols) {
    // Salta colonne con prefisso numerico: "1-FRATELLI D'ITALIA", "9-+EUROPA"
    if (/^\d+[-–]/.test(col)) continue;
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
  if(!window._corpusIndex) return [];
  var scores = {};
  headers.forEach(function(h){
    var n = h.toLowerCase().trim().replace(/\s+/g,'_').replace(/-/g,'_').replace(/[^\w]/g,'');
    var colOntos = window._corpusIndex[n];
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
  var allText = norm.join(' ') + ' ' + vals;
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
            'lat_wgs84','lon_wgs84','coord_lat','coord_lon','georef_lat','georef_lon']))
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
                         'struttura_ricettiva','rta','affittacamere','casa_vacanze','tipo_esercizio','codice_struttura_acco']);
  var _accoCtx    = has(['stelle','posti_letto','numero_posti_letto','camere','letti',
                         'check_in','check_out','classificazione_struttura','categoria_struttura']);
  if(_accoStrong || _accoCtx)
    result.add('ACCO');

  // IOT — sensori fisici: richiede identificatore sensore O proprietà misurata specifica
  // P5-FIX: "valore/misura" generici NON sono IoT senza id_sensore o proprieta_osservata
  if(has(['id_sensore','idsensore','id_sensore2','iot:sensor','proprieta_osservata','tipo_misura','data_ricezione','avgspeed']) ||
     (has(['sensore','sensor']) && has(['valore','misura','unita'])) ||
     (has(['temperatura','umidita','pressione','precipitazioni','velocita_vento','valore_medio']) && has(['lat','lon'])))
    result.add('IoT');

  // POI — R3-FIX: LATITUDINE/LONGITUDINE MAIUSCOLE + UTMX/UTMY
  var _hasPOIcoord = hasH(['lat','lon','latitudine','longitudine','utmx','utmy',
                            'x_wgs84','y_wgs84','coord_x','coord_y','longitude','latitude',
                            'coordx','coordy','x_coord','y_coord']);
  if(has(['tipo_poi','dae','defibrillatore','punto_di_interesse','punto_interesse',
          'point_of_interest','idelem','id_elem'])) {
    result.add('POI');
  } else if(_hasPOIcoord && !result.has('GTFS') &&  // B1: ACCO+lat/lon = anche POI
            !result.has('SMAPIT') && !result.has('IoT') && !result.has('QB') &&
            !result.has('Cultural-ON')) { // non aggiungere POI su istituti culturali
    if(has(['nome','denominazione','tipo','categoria','descrizione']) &&
       !has(['mortali','feriti','deceduti','incidenti','importo','spesa','entrata']))
      result.add('POI');
  }

  // COV — organizzazioni: FIX1 esclude codice_ipa quando accompagnato da colonne di altri domini
  var _hasCOVStrong = has(['codice_ipa','codice_ente','partita_iva','codice_fiscale_ente','ragione_sociale']) &&
                      !has(['qualifica_dipendente','obbligo_trasparenza','titolo_corso','ore_formazione',
                             'cig','importo_aggiudicazione','tipo_percorso','valore_indicatore']);
  var _hasCOVWeak   = has(['amministrazione','ente','pubblica_amministrazione','organizzazione',
                           'comparto','inquadramento','codice_istituzione','codice_ente_bdap']);
  if(!result.has('ACCO') && !result.has('POI') && !result.has('GTFS') &&
     (_hasCOVStrong || (_hasCOVWeak &&
      !has(['popolazione_residente','numero_famiglie','numero_residenti','nati','morti',
            'incidenti','sinistri','importo_liquidato','spesa_corrente']) &&
      !result.has('QB')))) {
    result.add('COV');
  }

  // QB statistico: anno + aggregati numerici senza anagrafica = dati demografici
  if(!result.has('CPV') && has(['anno']) && (has(['sesso']) || has(['cittadinanza'])) &&
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
          'incidenti','feriti','mortali','deceduti','sinistri']) &&
     !result.has('ACCO') && !result.has('GTFS') && !result.has('IoT') &&
     !result.has('COV') && !result.has('CPV') && !result.has('SMAPIT') &&
     !result.has('CPSV') && !result.has('ADMS') && !result.has('RO') &&
     !result.has('CulturalON') &&
     !has(['nome_dataset','nome_risorsa','numero_righe','distribution_url']) &&
     !has(['tratta','capolinea','fermata_origine','fermata_arrivo']) &&
     !has(['codice_istat','codice_civico','cod_civico','numero_civico']))  // B3: codici geo ≠ QB
    result.add('QB');

  // TI — R6-FIX: richiede date esplicite O combo evento+luogo (non solo titolo/tipo)
  var _tiStrong = has(['data_inizio','data_fine','inizio','termine','quando','orario_inizio',
                       'orario_fine','data_evento','ora_inizio','ora_fine','data_ora',
                       'data_rilevazione','data_apertura','data_chiusura']);
  var _tiEvent  = has(['tipo_evento','nome_iniziativa','nome_evento','manifestazione',
                       'spettacolo','concerto','rassegna','stagione','programmazione']) &&
                  has(['luogo','dove','sede','periodo','durata','orario']);
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
    result.delete('POI'); // istituto culturale geolocalizzato ≠ POI generico
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
  if(window._corpusIndex) {
    var _corpusOntos = detectFromCorpus(headers);
    _corpusOntos.forEach(function(o){if((o==='CulturalON'||o==='Cultural-ON')&&result.has('SMAPIT'))return;if(o==='QB'&&(result.has('ACCO')||result.has('POI')||result.has('SMAPIT')))return;result.add(o);});
  }
    var _hasAnagrafica=norm.some(function(n){return n==='cognome'||n==='codice_fiscale'||n==='cf';});
    if(result.has('QB')&&result.has('CPV')&&!_hasAnagrafica) result.delete('CPV'); // QB stats senza cognome
    if(result.has('QB') && (result.has('TI')||result.has('CulturalON')||result.has('ACCO')||result.has('GTFS'))) result.delete('QB'); // QB non su eventi/strutture
  // Se SMAPIT rilevato, rimuovi ontologie incompatibili
  if(result.has('SMAPIT')){result.delete('CulturalON');result.delete('Cultural-ON');result.delete('QB');result.delete('CPV');}
  if(result.has('Cultural-ON')) result.add('CulturalON'); // alias retrocompatibilità
  // L0 — sempre aggiunto come base
  if(has(['parcheggio','parking','stalli','posti_auto','capacita_posti','tariffa_oraria','posti_disabili'])) result.add('PARK');
  if(has(['prezzo_intero','prezzo_ridotto','biglietto','tariffa_ingresso','costo_biglietto'])&&!result.has('ACCO')) result.add('POT');
  if(has(['cig','cup','importo_aggiudicazione','stazione_appaltante','oggetto_contratto','aggiudicatario','cpv_codice'])) result.add('PublicContract');
  if(has(['tipo_percorso','lunghezza_km','difficolta','dislivello','numero_tappe','sentiero','percorso_ciclabile','itinerario','tracciato','lat_start','lon_start','durata_stimata','nome_breve_percorso','nome_esteso_percorso'])) result.add('Route');
  if(has(['qualifica_dipendente','contratto_lavoro','ccnl','livello_contrattuale','ore_settimanali'])) result.add('RPO');
  // FIX7: MU solo con colonne scientifiche specifiche, non 'unita_misura' generico
  if(has(['grandezza_fisica','conversione_si','unita_si','fattore_conversione'])&&!result.has('IoT')) result.add('MU');
  if(has(['crediti','ects','ore_formazione','titolo_rilasciato','durata_corso']) ||
     (has(['titolo_corso']) && has(['durata_corso','ore_formazione','crediti'])))
    result.add('Learning'); // M5
  if(has(['evento_civico','tipo_evento_civico'])&&result.has('TI')) result.add('CPEV');
  if(has(['obbligo_trasparenza','categoria_trasparenza','dato_obbligatorio','d_lgs_33'])) result.add('Transparency');
  if(has(['tipo_indicatore','baseline','target','fonte_indicatore'])&&!result.has('QB')) result.add('Indicator');
  result.add('L0');
  // Cleanup: ontologie più specifiche escludono quelle generiche sovrapposte
  if(result.has('Route')){
    result.delete('GTFS');   // Route più specifico di GTFS per percorsi non TPL
    result.delete('SMAPIT'); // Route non è una scuola
    // Route non implica POI a meno che non ci siano colonne POI esplicite
    if(!has(['nome_poi','tipo_poi','categoria_poi','id_poi'])) result.delete('POI');
  }
  if(result.has('QB') && result.has('POI') && !has(['tipo_poi','dae','defibrillatore','nome_poi','idelem','id_elem'])) result.delete('POI');
  if(result.has('QB') && result.has('COV') && !_hasCOVStrong) result.delete('COV');
  if(result.has('QB') && result.has('TI') && !_tiEvent && !_tiStrong) result.delete('TI'); // R6
  if(result.has('POT') && result.has('CPV') && !has(['cognome','codice_fiscale','data_nascita']))
    result.delete('CPV'); // POT: tariffe non implicano persone fisiche // P2: QB+ente ≠ COV strutturale
  if(result.has('PublicContract')){
    result.delete('CPSV-AP');
    result.add('CPSV'); // compatibilità corpus
    result.add('COV'); // B4: stazione appaltante è sempre COV
  }
  if(result.has('RPO')){result.delete('RO');result.delete('SMAPIT');}  // RPO (risorse umane) è diverso da scuole
  if(result.has('RO') && result.has('TI') && !_tiEvent) result.delete('TI'); // B2
  if(result.has('Indicator'))   result.add('QB');   // Indicator estende QB per le osservazioni
  if(result.has('Transparency')&&result.has('CPSV')) result.delete('CPSV');
  if(result.has('Learning')&&result.has('TI')&&!has(['data_inizio','data_fine','orario'])) result.delete('TI');
  if(result.has('PARK')&&result.has('SMAPIT')) result.delete('SMAPIT'); // parcheggio non è scuola
  if(result.has('POT')&&result.has('SMAPIT')) result.delete('SMAPIT');  // prezzi non è scuola

  return Array.from(result);
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
  const priority = ['GTFS','SMAPIT','IOT','ACCO','PARK','PUBLICCONTRACT','RPO','ROUTE','LEARNING','TRANSPARENCY','INDICATOR','POT','CULTURAL-ON','CULTURALON','CPSV-AP','QB','CPV','COV','RO','TI','POI','CLV','ADMS','L0'];
  const up = ontos.map(o => o.toUpperCase());
  for (const onto of priority) {
    if (up.includes(onto)) {
      return ONTO_URI_TYPE[onto] || 'resource';
    }
  }
  return 'resource';
}

function sanitizeEmailValue(v){
  if(!v)return v;
  v=v.trim().split(/[;\s]/)[0]; // prende solo prima email
  v=v.replace(/,/g,"."); // virgola→punto (errore comune nei CSV PA)
  if(v.indexOf("@")<0)return ""; // non è un email
  var parts=v.split("@");
  if(parts.length!==2||parts[1].indexOf(".")<0)return ""; // dominio malformato
  return v;
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
      if (/^\d+[-–]/.test(col)) continue;
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
        triples.push(`    ${m.prop} "${label}: ${val.replace(/"/g, "'")}"@it`);
      } else if (m.type === '@it') {
        triples.push(`    ${m.prop} "${val.replace(/"/g, "'")}"@it`);
      } else {
        triples.push(`    ${m.prop} "${val.replace(/"/g, "'")}"^^xsd:string`);
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
  var nh=headers.map(detNormH);
  var mainOnto=detGetMainOnto(ontos);
  var seg=DET_URI_SEG[mainOnto]||'resource';
  var mainClass=DET_CLASS[mainOnto]||'l0:Object';
  var base='https://w3id.org/italia/data/'+(ipa||'ipa')+'/';
  var idIdx=detFindColIdx(nh,['id','codice','codicescuola','stop_id','codice_scuola','cig','slug','remoteid','identifier','codice_fiscale','titolo','titolo_corso','denominazione']);
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
  ttl+=sp+'foaf:name '+dq+orgName+dq+'@it ;'+nl;
  ttl+=sp+'dct:identifier '+dq+orgIpa+dq+' .'+nl+nl;
  var dsUri=base+'dataset/ds-'+orgIpa;
  if(ontos.indexOf('QB')>=0||ontos.indexOf('Indicator')>=0){
    ttl+='<'+dsUri+'> a qb:DataSet ;'+nl;
    ttl+=sp+'rdfs:label '+dq+'Dataset '+orgName+dq+'@it ;'+nl;
    ttl+=sp+'dct:publisher <https://w3id.org/italia/data/'+orgIpa+'/ds> .'+nl+nl;
    used.add('qb');used.add('sdmx-dimension');used.add('sdmx-measure');used.add('sdmx-attribute');
  }
  dataRows.forEach(function(row){
    var idVal=(row[idIdx]||'').trim().replace(/[^a-zA-Z0-9_\-]/g,'-');
    if(!idVal)idVal='r'+(dataRows.indexOf(row)+1);
    var subURI=base+seg+'/'+idVal;
    var triples=[{pred:'a',val:mainClass,raw:true}];
    if(ontos.indexOf('QB')>=0)triples.push({pred:'qb:dataSet',val:'<'+dsUri+'>',raw:true});
    headers.forEach(function(origH,i){
      var normH=nh[i];
      var val=(row[i]||'').trim();
      if(!val||normH==='id')return;
      var rule=detFindRule(normH,ontos);
      if(!rule){if(val)triples.push({pred:'rdfs:comment',val:origH+': '+val,type:'langlit',lang:'it',unmapped:true});return;}
      if(rule.type==='skip')return;
function detFormatLit(rule,val){
  if(!val&&val!==0)return null;
  val=String(val).trim();if(!val)return null;
  if(rule.type==='skip')return null;
  if(rule.type==='langlit')return'"'+val.replace(/"/g,'\"')+'"@'+(rule.lang||'it');
  if(rule.type==='literal')return'"'+val.replace(/"/g,'\"')+'"^^xsd:string';
  if(rule.type==='decimal'){var n=parseFloat(val);return isNaN(n)?null:'"'+n+'"^^xsd:decimal';}
  if(rule.type==='integer'){var n2=parseInt(val);return isNaN(n2)?null:'"'+n2+'"^^xsd:integer';}
  if(rule.type==='boolean'){var b=val.toLowerCase();return(b==='si'||b==='true'||b==='1'||b==='yes')?'"true"^^xsd:boolean':'"false"^^xsd:boolean';}
  if(rule.type==='date'){var d=val.replace(/\//g,'-');return'"'+d+'"^^xsd:date';}
  if(rule.type==='datetime')return'"'+val+'"^^xsd:dateTime';
  if(rule.type==='mailto'){var em=sanitizeEmailValue(val);if(!em)return null;return'"'+em+'"^^xsd:string';}
  if(rule.type==='url'){var u=val.replace(/^<|>$/g,'').trim();if(!u||/[\s()<>"@]/.test(u)||/^\(/.test(u))return null;if(!u.startsWith('http')&&!u.startsWith('ftp'))u='https://'+u;return'<'+u+'>';}
  if(rule.type==='phone')return'"'+val+'"^^xsd:string';
  return'"'+val.replace(/"/g,'\"')+'"@it';
}

      var litVal=detFormatLit(rule,val);
      if(litVal)triples.push({pred:rule.pred,val:litVal,raw:true});
    });
    var addrURI=base+'address/'+idVal;
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
      var addrMap={indirizzo:'clv:hasStreet',via:'clv:hasStreet',strada:'clv:hasStreet',comune:'clv:hasCity',cap:'clv:hasPostalCode',provincia:'clv:hasProvince',regione:'clv:hasRegion',civico:'clv:hasNumber',numerocivico:'clv:hasNumber'};
      Object.keys(addrMap).forEach(function(col){
        var xi=nh.indexOf(col);
        if(xi>=0&&row[xi]&&row[xi].trim()){var v=row[xi].trim().replace(/"/g,"'");addrTriples.push({pred:addrMap[col],val:dq+v+dq+'@it'});}
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
      ttl+=sp+'ti:inDateTime '+dq+timeVal+dq+'^^xsd:dateTime .'+nl+nl;
    }
    if(ontos.indexOf('RO')>=0){
      var nomeI=nh.indexOf('nome'),cognomeI=nh.indexOf('cognome'),ammI=nh.indexOf('denominazione');
      if(ammI<0)ammI=nh.indexOf('amministrazione');
      var nomeV=nomeI>=0?(row[nomeI]||'').trim():'',cognomeV=cognomeI>=0?(row[cognomeI]||'').trim():'';
      var personLabel=[nomeV,cognomeV].filter(Boolean).join(' ');
      if(personLabel){
        var personURI=base+'person/'+idVal;
        ttl+='<'+personURI+'> a cpv:Person ;'+nl+sp+'rdfs:label '+dq+personLabel+dq+'@it .'+nl+nl;
      }
      if(ammI>=0&&row[ammI]){
        var ammV=row[ammI].trim();
        var orgId2=ammV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var orgURI2=base+'organization/'+orgId2;
        if(!ttl.includes('<'+orgURI2+'>')){
          ttl+='<'+orgURI2+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+dq+ammV+dq+'@it .'+nl+nl;
        }
      }
    }
    // ── RPO: nodo persona + organizzazione collegati al ruolo ──────────────
    if(ontos.indexOf('RPO')>=0){
      var nI=nh.indexOf('nome'),cI=nh.indexOf('cognome'),cfI=nh.indexOf('codice_fiscale');
      var enteI=nh.indexOf('ente'),ipaI2=nh.indexOf('codice_ipa');
      var nV=(nI>=0?(row[nI]||'').trim():''),cV=(cI>=0?(row[cI]||'').trim():'');
      var personLabel2=[nV,cV].filter(Boolean).join(' ');
      if(personLabel2){
        var personURI2=base+'person/'+(cfI>=0&&row[cfI]?row[cfI].trim().toLowerCase():idVal);
        ttl+='<'+personURI2+'> a cpv:Person ;'+nl+sp+'rdfs:label '+dq+personLabel2+dq+'@it .'+nl;
        ttl+=sp+'rpo:holdsRole <'+base+'role-in-organization/'+idVal+'> .'+nl+nl;
      }
      var enteV=enteI>=0?(row[enteI]||'').trim():'';
      var ipaV2=ipaI2>=0?(row[ipaI2]||'').trim():'';
      if(enteV){
        var orgKey=ipaV2||enteV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var orgURI3=base+'organization/'+orgKey;
        if(!ttl.includes('<'+orgURI3+'>')){
          ttl+='<'+orgURI3+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+dq+enteV+dq+'@it .'+nl+nl;
        }
      }
    }
    // ── PublicContract: nodo stazione appaltante + aggiudicatario ──────────
    if(ontos.indexOf('PublicContract')>=0){
      var saI=nh.indexOf('stazione_appaltante'),ipaI3=nh.indexOf('codice_ipa');
      var aggI=nh.indexOf('aggiudicatario');
      if(saI>=0&&row[saI]&&row[saI].trim()){
        var saV=row[saI].trim();
        var ipaV3=ipaI3>=0?(row[ipaI3]||'').trim():'';
        var saKey=ipaV3||saV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var saURI=base+'organization/'+saKey;
        if(!ttl.includes('<'+saURI+'>')){
          ttl+='<'+saURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+dq+saV+dq+'@it ;'+nl;
          if(ipaV3)ttl+=sp+'cov:IPAcode '+dq+ipaV3+dq+' ;'+nl;
          ttl+=sp+'dct:identifier '+dq+saKey+dq+' .'+nl+nl;
        }
      }
      if(aggI>=0&&row[aggI]&&row[aggI].trim()){
        var aggV=row[aggI].trim();
        var aggKey=aggV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var aggURI=base+'organization/supplier-'+aggKey;
        if(!ttl.includes('<'+aggURI+'>')){
          ttl+='<'+aggURI+'> a cov:Organization ;'+nl+sp+'rdfs:label '+dq+aggV+dq+'@it .'+nl+nl;
        }
      }
    }
    // ── Route: nodo geografico start/end ──────────────────────────────────
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
    // ── POT: nodo prezzo con valuta ────────────────────────────────────────
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
    // ── Indicator: nodo osservazione statistica ────────────────────────────
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
    // ── Learning: nodo ente erogatore ─────────────────────────────────────
    if(ontos.indexOf('Learning')>=0){
      var entErogI=nh.indexOf('ente_erogatore'),ipaErogI=nh.indexOf('codice_ipa');
      if(entErogI>=0&&row[entErogI]&&row[entErogI].trim()){
        var entErogV=row[entErogI].trim();
        var ipaErogV=ipaErogI>=0?(row[ipaErogI]||'').trim():'';
        var entErogKey=ipaErogV||entErogV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var entErogURI=base+'organization/'+entErogKey;
        if(!ttl.includes('<'+entErogURI+'>')){
          ttl+='<'+entErogURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+dq+entErogV+dq+'@it .'+nl+nl;
        }
      }
    }
    // ── Transparency: nodo ente referente ─────────────────────────────────
    if(ontos.indexOf('Transparency')>=0){
      var enteTransI=nh.indexOf('ente'),ipaTransI=nh.indexOf('codice_ipa');
      if(enteTransI>=0&&row[enteTransI]&&row[enteTransI].trim()){
        var enteTransV=row[enteTransI].trim();
        var ipaTransV=ipaTransI>=0?(row[ipaTransI]||'').trim():'';
        var enteTransKey=ipaTransV||enteTransV.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        var enteTransURI=base+'organization/'+enteTransKey;
        if(!ttl.includes('<'+enteTransURI+'>')){
          ttl+='<'+enteTransURI+'> a cov:PublicOrganization ;'+nl+sp+'rdfs:label '+dq+enteTransV+dq+'@it .'+nl+nl;
        }
      }
    }
  });
  return ttl.trim();
}


// ═══ CLOUDFLARE WORKER HANDLER ═══════════════════════════════════

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
    if (text.includes('�')) text = new TextDecoder('latin1').decode(buf);
  }
  // Rimuovi BOM
  return text.replace(/^﻿/, '');
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const reqUrl = new URL(request.url);

    if (reqUrl.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', version: 'v2026.03.20.169' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const csvUrl = reqUrl.searchParams.get('url');
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
        generato: new Date().toISOString(), versione: 'v2026.03.20.169'
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

// ttl-normalizer.js
// ============================================================================
// Normalizzatore TTL per piersoft/CSV-to-RDF
//
// Post-processor puro (no dipendenze) che ripulisce il TTL generato dal motore
// deterministico `buildDeterministicTTL` (presente identico in index.html e
// worker.js) prima della consegna all'utente.
//
// Fix applicati:
//   SINTATTICI
//     S1. Virgolette URL non escapate dentro rdfs:comment
//         (es: `rdfs:comment "url: "https://x"@it.y"@it` → `rdfs:comment "url: https://x.y"@it`)
//     S2. rdfs:comment senza virgolette (`rdfs:comment chiave: valore ;`)
//         → `rdfs:comment "chiave: valore"@it ;`
//     S3. Separatore orfano `.` → `;` tra tripla chiusa e predicato successivo
//         nella stessa risorsa cpv:Person ... rpo:holdsRole
//     S5. geo:lat / geo:long con `@it` → `^^xsd:decimal`
//
//   SEMANTICI — rimappatura termini non presenti nelle ontologie ufficiali
//               OntoPiA verso i termini corretti.
//     park:ParkingFacility         → park:CarPark
//     rpo:RoleInOrganization       → ro:Role (RPO è anagrafe/stato civile)
//     rpo:holdsRole                → ro:holdsRole
//     learn:Course / learning:Course → learning:DegreeCourse
//     learn:ects / learning:ects   → learning:credit
//     learn:awardedTitle / learning:awardedTitle → learning:achievedTitleName
//     learn:duration / learning:duration → rdfs:comment
//     learn:hours / learning:hours → rdfs:comment
//     tr:hasTransparencyObligation → tr:regulationReference
//     tr:transparencyCategory      → tr:hasTransparencyActivityTypology
//     tr:mandatoryData             → rdfs:comment
//     indicator:indicatorType      → indicator:hasIndicatorType
//     indicator:baseline           → rdfs:comment
//     indicator:target             → rdfs:comment
//     pc:description               → dct:description
//     clv:streetName               → clv:officialStreetName
//   Inoltre: alias prefisso `learn:` → `learning:` con injection del prefisso
//   `@prefix learning: <https://w3id.org/italia/onto/Learning/>` e
//   `@prefix ro: <https://w3id.org/italia/onto/RO/>` se referenziato.
//
// Regression test: 53/53 TTL (dei 53 esempi della select in index.html) passano
// sia parsing Turtle (rdflib) sia validazione semantica contro 30 ontologie
// OntoPiA ufficiali. Riferimento: corpus fixtures_v9.json + ontology_index.json
// scaricato da raw.githubusercontent.com/piersoft/CSV-to-RDF/main.
//
// USO
// ---
// Browser / index.html (IIFE inline):
//   const cleaned = normalizeTTL(ttl);
//
// Cloudflare Worker / worker.js:
//   import { normalizeTTL } from './ttl-normalizer.js';   // ESM
//   // oppure: const { normalizeTTL } = require('./ttl-normalizer.js');
//   const cleaned = normalizeTTL(ttl);
//
// SIMBA (servizio esterno che consuma il worker):
//   const response = await fetch(WORKER_BASE + '/convert?...');
//   const ttl = await response.text();
//   const cleaned = normalizeTTL(ttl);
//
// ============================================================================

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();           // CommonJS (Node/wrangler classic)
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);                  // AMD
  } else {
    root.TTLNormalizer = factory();       // Browser global
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- Mappe ----------------------------------------------------------------

  const CLASS_REMAP = {
    'park:ParkingFacility':          'park:CarPark',
    'rpo:RoleInOrganization':        'ro:Role',
    'learn:Course':                  'learning:DegreeCourse',
    'learning:Course':               'learning:DegreeCourse',
  };

  // `null` come valore → il predicato va convertito in rdfs:comment
  // conservando il local name come etichetta.
  const PROP_REMAP = {
    'rpo:holdsRole':                 'ro:holdsRole',
    'tr:hasTransparencyObligation':  'tr:regulationReference',
    'tr:transparencyCategory':       'tr:hasTransparencyActivityTypology',
    'tr:mandatoryData':               null,
    'indicator:baseline':             null,
    'indicator:target':               null,
    'indicator:indicatorType':       'indicator:hasIndicatorType',
    'pc:description':                'dct:description',
    'clv:streetName':                'clv:officialStreetName',
    'learn:duration':                 null,
    'learn:hours':                    null,
    'learn:ects':                    'learning:credit',
    'learn:awardedTitle':            'learning:achievedTitleName',
    'learning:duration':              null,
    'learning:hours':                 null,
    'learning:ects':                 'learning:credit',
    'learning:awardedTitle':         'learning:achievedTitleName',
  };

  const PREFIX_ALIAS = { 'learn': 'learning' };

  const ONTO_URI = {
    'ro':       'https://w3id.org/italia/onto/RO/',
    'learning': 'https://w3id.org/italia/onto/Learning/',
  };

  // --- Regex helpers --------------------------------------------------------

  // S1 — virgolette URL non escapate (tipico output cpsv/ndc/transparency)
  const RE_S1 = /rdfs:comment\s+"([^"]+?):\s+"([^"]+?)"@it([^"\n]*?)"@it/g;

  // S2 — rdfs:comment chiave: valore (no quote, no @it)
  const RE_S2 = /^(\s+)rdfs:comment\s+([a-zA-Z_][\w]*)\s*:\s*([^"\n;.]+?)\s*([;.])\s*$/gm;

  // S3 — person chiuso con . seguito da rpo:holdsRole orfano
  const RE_S3 = /(<[^>]+\/person\/[^>]+>\s+a\s+cpv:Person\s*;\s*\n\s+rdfs:label\s+"[^"]+"@it\s*)\.\s*\n(\s+rpo:holdsRole\s+<[^>]+>\s*)\./g;

  // S5 — geo:lat/long "N.M"@it → "N.M"^^xsd:decimal
  const RE_S5 = /(geo:(?:lat|long))\s+"([\d.\-+]+)"@it/g;

  function escLit(s) {
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function reEsc(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Fix steps ------------------------------------------------------------

  function fixS1(ttl) {
    return ttl.replace(RE_S1, function (_m, k, url, tail) {
      const full = escLit(k + ': ' + url + (tail || ''));
      return 'rdfs:comment "' + full + '"@it';
    });
  }

  function fixS2(ttl) {
    return ttl.replace(RE_S2, function (_m, indent, key, val, sep) {
      const esc = escLit(val.trim());
      return indent + 'rdfs:comment "' + key + ': ' + esc + '"@it ' + sep;
    });
  }

  function fixS3(ttl) {
    return ttl.replace(RE_S3, function (_m, a, b) { return a + ';\n' + b + '.'; });
  }

  function fixS5(ttl) {
    return ttl.replace(RE_S5, function (_m, p, n) {
      return p + ' "' + n + '"^^xsd:decimal';
    });
  }

  function remapPrefixes(ttl) {
    Object.keys(PREFIX_ALIAS).forEach(function (oldP) {
      const newP = PREFIX_ALIAS[oldP];
      const uri = ONTO_URI[newP];
      // Sostituisce @prefix learn: <...> .
      ttl = ttl.replace(
        new RegExp('@prefix\\s+' + reEsc(oldP) + ':\\s*<[^>]+>\\s*\\.', 'g'),
        '@prefix ' + newP + ': <' + uri + '> .'
      );
      // Sostituisce usi inline: learn:X → learning:X
      ttl = ttl.replace(new RegExp('\\b' + reEsc(oldP) + ':', 'g'), newP + ':');
    });
    return ttl;
  }

  function remapClasses(ttl) {
    Object.keys(CLASS_REMAP).forEach(function (oldC) {
      const newC = CLASS_REMAP[oldC];
      if (oldC === newC) return;
      ttl = ttl.replace(new RegExp('\\b' + reEsc(oldC) + '\\b', 'g'), newC);
    });
    return ttl;
  }

  function remapProperties(ttl) {
    const lines = ttl.split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let done = false;
      for (const oldP in PROP_REMAP) {
        const newP = PROP_REMAP[oldP];
        const re = new RegExp('^(\\s*)(' + reEsc(oldP) + ')\\s+(.*?)(\\s*[;.])\\s*$');
        const m = line.match(re);
        if (!m) continue;
        const indent = m[1], rest = m[3], sep = m[4];
        if (newP === null) {
          const local = oldP.split(':', 2)[1];
          let val = rest
            .replace(/\^\^xsd:\w+$/, '').trim()
            .replace(/@\w+$/, '').trim()
            .replace(/^["']|["']$/g, '');
          val = escLit(val);
          out.push(indent + 'rdfs:comment "' + local + ': ' + val + '"@it' + sep);
        } else {
          out.push(indent + newP + ' ' + rest + sep);
        }
        done = true;
        break;
      }
      if (!done) out.push(line);
    }
    return out.join('\n');
  }

  function ensurePrefixes(ttl) {
    const toAdd = [];
    Object.keys(ONTO_URI).forEach(function (pfx) {
      const used = new RegExp('(?:^|[\\s<;.])' + pfx + ':').test(ttl);
      const declared = ttl.indexOf('@prefix ' + pfx + ':') >= 0;
      if (used && !declared) toAdd.push('@prefix ' + pfx + ': <' + ONTO_URI[pfx] + '> .');
    });
    if (!toAdd.length) return ttl;
    const lines = ttl.split('\n');
    let lastPfx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().indexOf('@prefix') === 0) lastPfx = i;
    }
    if (lastPfx >= 0) {
      lines.splice.apply(lines, [lastPfx + 1, 0].concat(toAdd));
    } else {
      Array.prototype.unshift.apply(lines, toAdd);
    }
    return lines.join('\n');
  }

  // --- Pipeline pubblica ----------------------------------------------------

  function normalizeTTL(ttl) {
    if (!ttl || typeof ttl !== 'string') return ttl;
    let out = ttl;
    out = fixS1(out);
    out = fixS2(out);
    out = fixS3(out);
    out = fixS5(out);
    out = remapPrefixes(out);
    out = remapClasses(out);
    out = remapProperties(out);
    out = ensurePrefixes(out);
    return out;
  }

  return { normalizeTTL: normalizeTTL, version: '1.0.0' };
}));

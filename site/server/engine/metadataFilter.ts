/**
 * DASHTWO Metadata Filter — Build Qdrant payload filters from query context
 *
 * Full version copied from @aeroedge/dashtwo main platform.
 * Detects document type references in the query and narrows vector search
 * to the most relevant document subset.
 */

import type { DashTwoMode } from './modelRouter';
import type { QdrantFilter } from './qdrantClient';

// Pattern → document_type mapping
const DOC_TYPE_PATTERNS: Array<{ pattern: RegExp; documentType: string }> = [
  { pattern: /\bpart\s*1\b/i, documentType: 'part_1' },
  { pattern: /\bpart\s*43\b/i, documentType: 'part_43' },
  { pattern: /\bpart\s*61\b/i, documentType: 'part_61' },
  { pattern: /\bpart\s*67\b/i, documentType: 'part_67' },
  { pattern: /\bpart\s*71\b/i, documentType: 'part_71' },
  { pattern: /\bpart\s*73\b/i, documentType: 'part_73' },
  { pattern: /\bpart\s*91\b/i, documentType: 'part_91' },
  { pattern: /\bpart\s*97\b/i, documentType: 'part_97' },
  { pattern: /\bpart\s*119\b/i, documentType: 'part_119' },
  { pattern: /\bpart\s*121\b/i, documentType: 'part_121' },
  { pattern: /\bpart\s*135\b/i, documentType: 'part_135' },
  { pattern: /\bpart\s*141\b/i, documentType: 'part_141' },
  { pattern: /\bpart\s*142\b/i, documentType: 'part_142' },
  { pattern: /\b14\s*CFR\s*61\b/i, documentType: 'part_61' },
  { pattern: /\b14\s*CFR\s*91\b/i, documentType: 'part_91' },
  { pattern: /\b14\s*CFR\s*43\b/i, documentType: 'part_43' },
  { pattern: /\b14\s*CFR\s*67\b/i, documentType: 'part_67' },
  { pattern: /\b14\s*CFR\s*135\b/i, documentType: 'part_135' },
  { pattern: /\b14\s*CFR\s*121\b/i, documentType: 'part_121' },
  { pattern: /\bpart\s*145\b/i, documentType: 'part_145' },
  // Part 43 appendices
  { pattern: /\bpart\s*43\s*appendix\s*A\b/i, documentType: 'part_43_appendix_a' },
  { pattern: /\bappendix\s*A\s*(?:of\s*)?(?:part\s*)?43\b/i, documentType: 'part_43_appendix_a' },
  { pattern: /\bpart\s*43\s*appendix\s*D\b/i, documentType: 'part_43_appendix_d' },
  { pattern: /\bappendix\s*D\s*(?:of\s*)?(?:part\s*)?43\b/i, documentType: 'part_43_appendix_d' },
  { pattern: /\bpart\s*43\s*appendix\s*E\b/i, documentType: 'part_43_appendix_e' },
  { pattern: /\bappendix\s*E\s*(?:of\s*)?(?:part\s*)?43\b/i, documentType: 'part_43_appendix_e' },
  { pattern: /\bpart\s*43\s*appendix\s*F\b/i, documentType: 'part_43_appendix_f' },
  { pattern: /\bappendix\s*F\s*(?:of\s*)?(?:part\s*)?43\b/i, documentType: 'part_43_appendix_f' },
  // Part 91 Subpart E
  { pattern: /\bpart\s*91\s*subpart\s*E\b/i, documentType: 'part_91_subpart_e' },
  { pattern: /\b91\.4[012]\d\b/i, documentType: 'part_91_subpart_e' },
];

// Content type detection
const CONTENT_TYPE_PATTERNS: Array<{ pattern: RegExp; contentType: string }> = [
  // Reference
  { pattern: /\bAIM\b/i, contentType: 'reference' },
  { pattern: /\badvisory\s+circular\b/i, contentType: 'advisory_circular' },
  { pattern: /\bAC\s+\d+/i, contentType: 'advisory_circular' },
  // Training
  { pattern: /\bPHAK\b/i, contentType: 'training' },
  { pattern: /\bAFH\b/i, contentType: 'training' },
  { pattern: /\bhandbook\b/i, contentType: 'training' },
  // Accident/safety
  { pattern: /\bNTSB\b/i, contentType: 'accident_report' },
  { pattern: /\baccident\s+(?:data|report|statistic|rate|cause)/i, contentType: 'accident_report' },
  { pattern: /\bcrash\b/i, contentType: 'accident_report' },
  // Safety education
  { pattern: /\bglossary\b/i, contentType: 'glossary' },
  { pattern: /\bFAASafety\b/i, contentType: 'safety_education' },
  { pattern: /\bsafety briefing\b/i, contentType: 'safety_education' },
  { pattern: /\bWINGS\b/i, contentType: 'safety_education' },
  { pattern: /\bSAFO\b/i, contentType: 'safety_notice' },
  { pattern: /\bInFO\b/, contentType: 'safety_notice' },
  // Testing standards
  { pattern: /\bACS\b/i, contentType: 'acs' },
  { pattern: /\bPTS\b/i, contentType: 'testing_standards' },
  { pattern: /\bcheckride\b/i, contentType: 'acs' },
  // Military
  { pattern: /\bmilitary\s+(?:flight|manual|aviation)\b/i, contentType: 'flight_training' },
  { pattern: /\bNATOPS\b/i, contentType: 'flight_training' },
  { pattern: /\btest\s+pilot\b/i, contentType: 'flight_training' },
  // NASA/research
  { pattern: /\bNASA\b/i, contentType: 'flight_training' },
  { pattern: /\bNACA\b/i, contentType: 'flight_training' },
  // Medical
  { pattern: /\bmedical\s+(?:certificate|exam|standard|requirement|fitness)\b/i, contentType: 'medical_certification' },
  { pattern: /\bAME\b/i, contentType: 'medical_certification' },
  { pattern: /\bBasicMed\b/i, contentType: 'medical_certification' },
  // Data/statistics
  { pattern: /\bpass\s+rate\b/i, contentType: 'faa_data' },
  { pattern: /\bcheckride\s+(?:stat|pass|fail|rate|data)\b/i, contentType: 'faa_data' },
  { pattern: /\bGA\s+(?:survey|activity|statistic)\b/i, contentType: 'ga_statistics' },
  // ASRS
  { pattern: /\bASRS\b/i, contentType: 'safety_report' },
  // Weather
  { pattern: /\bMETAR\b/i, contentType: 'weather_reference' },
  { pattern: /\bTAF\b/i, contentType: 'weather_reference' },
  { pattern: /\bSIGMET\b/i, contentType: 'weather_reference' },
  { pattern: /\bAIRMET\b/i, contentType: 'weather_reference' },
  // Knowledge test questions
  { pattern: /\b(?:knowledge test|written test|written exam|test question|practice test|sample question|FAA exam)\b/i,
    contentType: 'knowledge_test_question' },
  // Airworthiness directives
  { pattern: /\b(?:airworthiness directive|AD\s+\d|AD compliance)\b/i, contentType: 'airworthiness_directive' },
  { pattern: /\b(?:service bulletin|mandatory inspection)\b/i, contentType: 'airworthiness_directive' },
  // Inspector/examiner handbooks
  { pattern: /\bFSIMS\b/i, contentType: 'inspector_handbook' },
  { pattern: /\b(?:order 8900|inspector.?s? handbook)\b/i, contentType: 'inspector_handbook' },
  { pattern: /\b(?:DPE handbook|examiner.?s? handbook|designee handbook)\b/i, contentType: 'inspector_handbook' },
  // Maintenance guidance
  { pattern: /\b(?:AC 43|acceptable methods)\b/i, contentType: 'maintenance_guidance' },
  { pattern: /\b(?:corrosion (?:control|prevention|treatment))\b/i, contentType: 'maintenance_guidance' },
  { pattern: /\b(?:approved parts|PMA|TSO)\b/i, contentType: 'maintenance_guidance' },
  // Maintenance regulations
  { pattern: /\b(?:part\s*43\s*appendix|appendix\s*[A-F]\s*(?:of\s*)?(?:part\s*)?43)\b/i, contentType: 'maintenance_regulation' },
  { pattern: /\b(?:43\.9|43\.11|43\.3|43\.7|43\.12|43\.13)\b/, contentType: 'maintenance_regulation' },
  { pattern: /\b(?:91\.4[012]\d|subpart\s*E)\b/i, contentType: 'maintenance_regulation' },
  { pattern: /\b(?:part\s*145|repair\s*station\s*cert)/i, contentType: 'maintenance_regulation' },
  { pattern: /\b(?:return\s*to\s*service\s*authority|major\s*vs\.?\s*minor)\b/i, contentType: 'maintenance_regulation' },
  // Maintenance ACs
  { pattern: /\bAC[-\s]*43[-–]\d+/i, contentType: 'maintenance_ac' },
  { pattern: /\bAC[-\s]*20[-–](?:62|37)\b/i, contentType: 'maintenance_ac' },
  { pattern: /\bAC[-\s]*35[-–]\d+/i, contentType: 'maintenance_ac' },
  { pattern: /\bAC[-\s]*39[-–]\d+/i, contentType: 'maintenance_ac' },
  // Maintenance orders & forms
  { pattern: /\b(?:order\s*)?8900[-–]1\b/i, contentType: 'maintenance_order' },
  { pattern: /\b(?:order\s*)?(?:8610|8300|2150)\b/i, contentType: 'maintenance_order' },
  { pattern: /\b(?:form\s*337|FAA[-\s]*337)\b/i, contentType: 'maintenance_form' },
  { pattern: /\b(?:major\s*(?:repair|alteration)|field\s*approval)\b/i, contentType: 'maintenance_form' },
  // AMT Handbooks
  { pattern: /\b(?:AMT|A&P)\s*(?:handbook|general|airframe|powerplant)\b/i, contentType: 'amt_handbook' },
  { pattern: /\b8083[-–]3[012][AB]?\b/i, contentType: 'amt_handbook' },
  // Manufacturer Service Instructions
  { pattern: /\b(?:lycoming|continental|rotax)\s*(?:SI|SB|SL|service)\b/i, contentType: 'manufacturer_sb' },
  { pattern: /\b(?:hartzell|mccauley|sensenich|MT)\s*(?:SB|SL|service)\b/i, contentType: 'manufacturer_sb' },
  { pattern: /\b(?:SI[-\s]*\d{4}|SB[-\s]*\d{3}|SL[-\s]*\d{3})\b/i, contentType: 'manufacturer_sb' },
  // Engine/propeller model data
  { pattern: /\b[TI]?[LS]?IO?[-\s]*\d{3}[A-Z]?(?:[-–]\w+)?\b/, contentType: 'engine_model_data' },
  { pattern: /\b(?:TBO|torque\s*spec|oil\s*spec|wear\s*limit)\b/i, contentType: 'manufacturer_spec' },
  // Oil analysis
  { pattern: /\b(?:oil\s*analysis|oil\s*report|metal\s*wear|spectrographic)\b/i, contentType: 'oil_analysis_reference' },
  { pattern: /\b(?:iron|chromium|silicon|aluminum|copper|tin|lead)\s*(?:ppm|level|content|reading)\b/i, contentType: 'oil_analysis_reference' },
  { pattern: /\bblackstone\b/i, contentType: 'oil_analysis_reference' },
  // Fleet failure data
  { pattern: /\b(?:fleet\s*(?:failure|pattern|statistics)|MTBF|common\s*(?:annual\s*)?findings)\b/i, contentType: 'fleet_failure_data' },
  // Log entry templates
  { pattern: /\b(?:log\s*entry|maintenance\s*entry|write.*(?:log|entry))\b/i, contentType: 'log_entry_template' },
  { pattern: /\b(?:preventive\s*maintenance\s*(?:entry|record|log))\b/i, contentType: 'log_entry_template' },
  // Inspection checklists
  { pattern: /\b(?:annual|100[-\s]*hour)\s*(?:inspection\s*)?(?:checklist|scope)\b/i, contentType: 'inspection_checklist' },
  { pattern: /\b(?:inspection\s*checklist|appendix\s*D\s*scope)\b/i, contentType: 'inspection_checklist' },
  { pattern: /\b(?:condition\s*inspection|progressive\s*inspection)\b/i, contentType: 'inspection_checklist' },
  // Avionics compliance
  { pattern: /\b(?:91\.411|91\.413|91\.207|91\.225|91\.227)\b/, contentType: 'avionics_compliance' },
  { pattern: /\b(?:transponder\s*(?:check|test|certification)|pitot[-\s]*static\s*(?:check|test))\b/i, contentType: 'avionics_compliance' },
  { pattern: /\b(?:ELT\s*(?:inspection|check|test)|ADS[-\s]*B\s*(?:compliance|requirement))\b/i, contentType: 'avionics_compliance' },
  { pattern: /\bMEL\s*(?:reference|deferral|item)\b/i, contentType: 'avionics_compliance' },
  // Experimental/E-AB certification
  { pattern: /\b(?:experimental|E[-\s]*AB|homebuilt)\s*(?:certification|aircraft|maintenance)\b/i, contentType: 'experimental_certification' },
  { pattern: /\b(?:51[-\s]*percent|repairman\s*cert|builder\s*tracking)\b/i, contentType: 'experimental_certification' },
  { pattern: /\b(?:21\.191|AC[-\s]*20[-–]27)\b/i, contentType: 'experimental_certification' },
];

// Certificate-level detection for knowledge test filtering
const CERTIFICATE_PATTERNS: Array<{ pattern: RegExp; certificate: string }> = [
  { pattern: /\bprivate\s+pilot\b/i, certificate: 'private_pilot_airplane' },
  { pattern: /\binstrument\s+(?:rating|pilot)\b/i, certificate: 'instrument_rating_airplane' },
  { pattern: /\bcommercial\s+pilot\b/i, certificate: 'commercial_pilot_airplane' },
  { pattern: /\b(?:CFI|flight\s+instructor)\b/i, certificate: 'flight_instructor_airplane' },
  { pattern: /\b(?:ATP|airline\s+transport)\b/i, certificate: 'airline_transport_pilot_multi' },
  { pattern: /\b(?:AMT|A&P|airframe|powerplant|mechanic)\b/i, certificate: 'amt' },
  { pattern: /\bsport\s+pilot\b/i, certificate: 'sport_pilot_airplane' },
  { pattern: /\b(?:remote\s+pilot|UAS|drone|part\s+107)\b/i, certificate: 'remote_pilot_suas' },
  { pattern: /\b(?:dispatcher|ADX)\b/i, certificate: 'aircraft_dispatcher' },
  { pattern: /\b(?:ground\s+instructor|AGI|BGI|IGI)\b/i, certificate: 'advanced_ground_instructor' },
  { pattern: /\b(?:helicopter|rotorcraft)\b/i, certificate: 'private_pilot_helicopter' },
  { pattern: /\bglider\b/i, certificate: 'private_pilot_glider' },
  { pattern: /\bparachute\s+rigger\b/i, certificate: 'parachute_rigger' },
  { pattern: /\b(?:FOI|fundamentals\s+of\s+instruct)\b/i, certificate: 'fundamentals_of_instructing' },
];

/**
 * Build the default exclusion filter that removes bulk non-regulatory data.
 * Excludes on BOTH content_type and document_type fields since registry data
 * may use either field for identification.
 */
function buildDefaultExclusions(): QdrantFilter {
  return {
    must_not: [
      // Exclude by content_type
      { key: 'content_type', match: { value: 'accident_report' } },
      { key: 'content_type', match: { value: 'registration' } },
      { key: 'content_type', match: { value: 'aircraft_registration' } },
      { key: 'content_type', match: { value: 'airmen_registration' } },
      { key: 'content_type', match: { value: 'faa_registry' } },
      // Exclude by document_type
      { key: 'document_type', match: { value: 'registration' } },
      { key: 'document_type', match: { value: 'aircraft_registration' } },
      { key: 'document_type', match: { value: 'airmen_registration' } },
      { key: 'document_type', match: { value: 'faa_aircraft_registry' } },
      { key: 'document_type', match: { value: 'faa_airmen_registry' } },
    ],
  };
}

/**
 * Build Qdrant payload filter based on query content and mode.
 * Returns null if no specific filter can be determined (full search).
 */
export function buildQdrantFilter(
  query: string,
  _mode: DashTwoMode
): QdrantFilter | null {
  // Check for specific Part references
  const matchedParts: string[] = [];
  for (const { pattern, documentType } of DOC_TYPE_PATTERNS) {
    if (pattern.test(query)) {
      if (!matchedParts.includes(documentType)) {
        matchedParts.push(documentType);
      }
    }
  }

  if (matchedParts.length === 1) {
    return { must: [{ key: 'document_type', match: { value: matchedParts[0] } }] };
  }
  if (matchedParts.length > 1) {
    return { should: matchedParts.map(dt => ({ key: 'document_type', match: { value: dt } })) };
  }

  // Check for content type references
  const matchedContentTypes: string[] = [];
  for (const { pattern, contentType } of CONTENT_TYPE_PATTERNS) {
    if (pattern.test(query)) {
      if (!matchedContentTypes.includes(contentType)) {
        matchedContentTypes.push(contentType);
      }
    }
  }

  const isAccidentRelated = matchedContentTypes.includes('accident_report');

  // Broad query (2+ content types) — let vector search handle it, but still exclude bulk data
  if (matchedContentTypes.length >= 2) {
    if (!isAccidentRelated) {
      return {
        ...buildDefaultExclusions(),
      };
    }
    // Accident-related: only exclude registration, not accident_report
    return {
      must_not: [
        { key: 'content_type', match: { value: 'registration' } },
        { key: 'content_type', match: { value: 'aircraft_registration' } },
        { key: 'content_type', match: { value: 'airmen_registration' } },
        { key: 'content_type', match: { value: 'faa_registry' } },
        { key: 'document_type', match: { value: 'registration' } },
        { key: 'document_type', match: { value: 'aircraft_registration' } },
        { key: 'document_type', match: { value: 'airmen_registration' } },
        { key: 'document_type', match: { value: 'faa_aircraft_registry' } },
        { key: 'document_type', match: { value: 'faa_airmen_registry' } },
      ],
    };
  }

  // Single content type — apply as filter
  if (matchedContentTypes.length === 1) {
    // Knowledge test questions: also include knowledge test guides as secondary source
    if (matchedContentTypes[0] === 'knowledge_test_question') {
      let matchedCertificate: string | null = null;
      for (const { pattern, certificate } of CERTIFICATE_PATTERNS) {
        if (pattern.test(query)) {
          matchedCertificate = certificate;
          break;
        }
      }

      const contentFilter = {
        should: [
          { key: 'content_type', match: { value: 'knowledge_test_question' } },
          { key: 'content_type', match: { value: 'knowledge_test_guide' } },
        ],
      };

      if (matchedCertificate) {
        const certExpansion: Record<string, string[]> = {
          'amt': ['amt', 'amt_general', 'amt_airframe', 'amt_powerplant'],
          'airline_transport_pilot_multi': ['airline_transport_pilot_multi', 'airline_transport_pilot_single',
            'airline_transport_pilot', 'airline_transport_pilot_helicopter'],
          'private_pilot_helicopter': ['private_pilot_helicopter', 'instrument_rating_helicopter'],
          'advanced_ground_instructor': ['advanced_ground_instructor', 'basic_ground_instructor',
            'instrument_ground_instructor', 'ground_instructor'],
        };

        const certValues = certExpansion[matchedCertificate] || [matchedCertificate];

        if (certValues.length === 1) {
          return {
            must: [
              { key: 'content_type', match: { value: 'knowledge_test_question' } },
              { key: 'certificate', match: { value: certValues[0] } },
            ],
          };
        }

        return {
          must: [
            { key: 'content_type', match: { value: 'knowledge_test_question' } },
          ],
          should: certValues.map(c => ({ key: 'certificate', match: { value: c } })),
        };
      }

      return contentFilter;
    }
    return { must: [{ key: 'content_type', match: { value: matchedContentTypes[0] } }] };
  }

  // No specific filters detected — exclude bulk data types that drown out useful results
  return buildDefaultExclusions();
}

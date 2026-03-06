/**
 * Citation Extractor — copied from @aeroedge/dashtwo main platform
 * Maps Qdrant search results to DashTwoCitation format with source URL resolution.
 */

import type { QdrantSearchResult } from './qdrantClient';

export interface DashTwoCitation {
  source: string;
  title: string;
  snippet: string;
  fullText?: string;
  type: 'regulation' | 'aim' | 'ac' | 'document' | 'training' | 'ntsb';
  sourceUrl?: string;
  pageNumber?: number;
}

const REGULATION_PATTERNS = {
  cfr: /(?:14\s*)?CFR\s*(?:§\s*)?(?:Part\s*)?\d+(?:\.\d+)?(?:\([a-z]\))?(?:\(\d+\))?/gi,
  aim: /AIM\s*\d+[-–]\d+[-–]\d+/gi,
  ac: /AC\s*\d+[-–]\d+[A-Z]?/gi,
};

const HANDBOOK_URL_MAP: Record<string, string> = {
  phak: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/phak/pilot_handbook.pdf',
  afh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/airplane_flying_handbook.pdf',
  ifh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-15B.pdf',
  iph: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/instrument_procedures_handbook/FAA-H-8083-16B.pdf',
  aih: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/aviation_instructors_handbook.pdf',
  awh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-28A.pdf',
  rmh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/risk_management_handbook.pdf',
  wbh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-1.pdf',
  hfh: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/helicopter_flying_handbook.pdf',
};

const ACS_PTS_URL_MAP: Record<string, string> = {
  acs_private_airplane: 'https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf',
  acs_commercial_airplane: 'https://www.faa.gov/training_testing/testing/acs/commercial_airplane_acs_7.pdf',
  acs_instrument_airplane: 'https://www.faa.gov/training_testing/testing/acs/instrument_rating_airplane_acs_8.pdf',
  acs_atp_airplane: 'https://www.faa.gov/training_testing/testing/acs/atp_airplane_acs_11.pdf',
  acs_cfi_airplane: 'https://www.faa.gov/training_testing/testing/acs/cfi_airplane_acs_25.pdf',
  acs_remote_pilot: 'https://www.faa.gov/training_testing/testing/acs/uas_acs.pdf',
  acs_mechanic: 'https://www.faa.gov/training_testing/testing/acs/Aviation_Mechanic_Certification_Standards.pdf',
};

const MAINTENANCE_REGULATION_CONTENT_TYPES = new Set([
  'maintenance_regulation', 'maintenance_ac', 'maintenance_order',
  'maintenance_form', 'maintenance_loi', 'avionics_compliance',
]);

const MAINTENANCE_DOCUMENT_CONTENT_TYPES = new Set([
  'amt_handbook', 'manufacturer_si', 'manufacturer_sb', 'manufacturer_sl',
  'manufacturer_spec', 'engine_model_data', 'propeller_model_data',
  'oil_analysis_reference', 'fleet_failure_data', 'log_entry_template',
  'inspection_checklist', 'experimental_certification',
]);

export function extractCitationsFromQdrant(searchResults: QdrantSearchResult[]): DashTwoCitation[] {
  const citations: DashTwoCitation[] = [];
  const seenSources = new Set<string>();

  for (const result of searchResults) {
    const metadata = result.metadata;
    const text = result.text;

    const source = extractSource(metadata, text);
    if (!source) continue;
    if (seenSources.has(source)) continue;
    seenSources.add(source);

    const type = classifyCitationType(source, String(metadata.content_type || ''));
    const title = extractTitle(metadata, source);
    const snippet = truncateSnippet(text, 300);
    const fullText = text.length > 300 ? text : undefined;
    const pageNumber = metadata.page_number ? Number(metadata.page_number) : undefined;
    const sourceUrl = extractSourceUrl(metadata, source, type, pageNumber);

    citations.push({ source, title, snippet, fullText, type, sourceUrl, pageNumber });
  }

  return citations;
}

function extractSourceUrl(
  metadata: Record<string, unknown>,
  source: string,
  type: DashTwoCitation['type'],
  pageNumber: number | undefined
): string | undefined {
  if (metadata.source_url) {
    let url = String(metadata.source_url);
    if (pageNumber && url.endsWith('.pdf')) {
      url += `#page=${pageNumber}`;
    }
    return url;
  }

  if (type === 'regulation') {
    const cfrMatch = source.match(/(\d+\.\d+)/);
    if (cfrMatch) {
      return `https://www.ecfr.gov/current/title-14/section-${cfrMatch[1]}`;
    }
  }

  if (type === 'aim') {
    const aim3 = source.match(/(\d+)[-–](\d+)[-–](\d+)/);
    if (aim3) {
      return `https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap${aim3[1]}_section_${aim3[2]}.html`;
    }
    const aim2 = source.match(/(\d+)[-–](\d+)/);
    if (aim2) {
      return `https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap${aim2[1]}_section_${aim2[2]}.html`;
    }
    return 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/';
  }

  if (type === 'training') {
    const url = resolveTrainingDocUrl(metadata);
    if (url) {
      return pageNumber ? `${url}#page=${pageNumber}` : url;
    }
  }

  if (type === 'ac') {
    return 'https://www.faa.gov/regulations_policies/advisory_circulars';
  }

  if (type === 'ntsb') {
    const ntsbNumber = metadata.ntsb_number ? String(metadata.ntsb_number) : undefined;
    if (ntsbNumber) {
      return `https://data.ntsb.gov/carol-repgen/api/Aviation/ReportMain/GenerateNewestReport/${ntsbNumber}/pdf`;
    }
    return 'https://www.ntsb.gov/Pages/AviationQueryV2.aspx';
  }

  const contentTypeStr = String(metadata.content_type || '');
  const docType = String(metadata.document_type || '');

  if (contentTypeStr === 'maintenance_regulation') {
    const sectionNum = metadata.section_number;
    if (sectionNum) return `https://www.ecfr.gov/current/title-14/section-${sectionNum}`;
    if (docType.startsWith('part_43')) return 'https://www.ecfr.gov/current/title-14/part-43';
    if (docType === 'part_91_subpart_e') return 'https://www.ecfr.gov/current/title-14/part-91/subpart-E';
    if (docType === 'part_145') return 'https://www.ecfr.gov/current/title-14/part-145';
  }

  if (contentTypeStr === 'maintenance_ac') {
    return 'https://www.faa.gov/regulations_policies/advisory_circulars';
  }

  if (contentTypeStr === 'amt_handbook') {
    const amtUrlMap: Record<string, string> = {
      amt_general: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/amt_general_handbook.pdf',
      amt_airframe: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/amt_airframe_handbook_vol1.pdf',
      amt_powerplant: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/amt_powerplant_handbook.pdf',
    };
    const url = amtUrlMap[docType];
    if (url) return pageNumber ? `${url}#page=${pageNumber}` : url;
  }

  if (docType.startsWith('part_')) {
    const sectionNum = metadata.section_number;
    if (sectionNum) return `https://www.ecfr.gov/current/title-14/section-${sectionNum}`;
  }
  if (docType === 'aim' || docType.startsWith('aim_')) {
    return 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/';
  }
  if (docType === 'glossary') {
    return 'https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/';
  }

  return undefined;
}

function resolveTrainingDocUrl(metadata: Record<string, unknown>): string | undefined {
  const handbookId = metadata.handbook_id ? String(metadata.handbook_id) : undefined;
  if (handbookId && HANDBOOK_URL_MAP[handbookId]) return HANDBOOK_URL_MAP[handbookId];

  const acsId = metadata.acs_id ? String(metadata.acs_id) : undefined;
  if (acsId && ACS_PTS_URL_MAP[acsId]) return ACS_PTS_URL_MAP[acsId];

  return undefined;
}

function extractSource(metadata: Record<string, unknown>, text: string): string | null {
  if (metadata.section_number && metadata.part_number) {
    return `14 CFR ${metadata.section_number}`;
  }
  if (metadata.source_reference) return String(metadata.source_reference);
  if (metadata.title) return String(metadata.title);

  for (const [, pattern] of Object.entries(REGULATION_PATTERNS)) {
    pattern.lastIndex = 0;
    const match = text.match(pattern);
    if (match) return match[0];
  }

  const docType = String(metadata.document_type || '');
  if (docType) {
    return docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return null;
}

function classifyCitationType(source: string, contentType: string): DashTwoCitation['type'] {
  const upper = source.toUpperCase();

  if (upper.includes('CFR') || /^\d+\.\d+/.test(source) || contentType === 'regulation') return 'regulation';
  if (upper.includes('AIM') || contentType === 'aim') return 'aim';
  if (upper.includes('AC ') || upper.includes('AC-') || contentType === 'advisory_circular') return 'ac';
  if (contentType && MAINTENANCE_REGULATION_CONTENT_TYPES.has(contentType)) return 'regulation';
  if (contentType === 'maintenance_ac') return 'ac';
  if (upper.includes('PHAK') || upper.includes('AFH') || upper.includes('ACS') || upper.includes('HANDBOOK') || contentType === 'training') return 'training';
  if (contentType === 'amt_handbook') return 'training';
  if (upper.includes('NTSB') || contentType === 'accident_report') return 'ntsb';
  if (contentType && MAINTENANCE_DOCUMENT_CONTENT_TYPES.has(contentType)) return 'document';
  return 'document';
}

function extractTitle(metadata: Record<string, unknown>, source: string): string {
  if (metadata.section_title) return String(metadata.section_title);
  if (metadata.title && metadata.title !== source) return String(metadata.title);

  if (source.includes('CFR')) return `Federal Aviation Regulation ${source}`;
  if (source.includes('AIM')) return `Aeronautical Information Manual ${source}`;
  if (source.includes('AC')) return `Advisory Circular ${source}`;

  return source;
}

function truncateSnippet(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength * 0.5) return truncated.slice(0, lastPeriod + 1);

  return truncated + '...';
}

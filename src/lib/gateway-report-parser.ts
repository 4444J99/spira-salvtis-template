import { DEFAULT_EFFECTS, KNOWN_EFFECTS } from '../data/gateway-effects.ts';

export const EWG_TAPWATER_ORIGIN = 'https://www.ewg.org';
const EWG_TAPWATER_BASE = `${EWG_TAPWATER_ORIGIN}/tapwater/`;

export interface Contaminant {
  name: string;
  legalLimit: number | null;
  healthGuideline: number | null;
  detected: number;
  unit: string;
  exceedsLegal: boolean;
  exceedsHealth: boolean;
  effects: string[];
}

export interface GatewayReport {
  zipCode: string;
  gatewaySource: string;
  utilityName: string;
  contaminants: Contaminant[];
  totalContaminants: number;
  exceedingHealth: number;
  exceedingLegal: number;
  lastUpdated: string;
  isDemo: boolean;
}

export interface EwgUtilitySearchResult {
  utilityName: string | null;
  utilityUrl: string;
}

interface ParsedMeasurement {
  amount: number | null;
  unit: string;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToTextLines(html: string): string[] {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '\n')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:h[1-6]|p|div|li|tr|td|th|section|article)>/gi, '\n')
      .replace(/<[^>]+>/g, '\n')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function lookupEffects(contaminantName: string): string[] {
  const lower = contaminantName.toLowerCase();
  for (const [key, effects] of Object.entries(KNOWN_EFFECTS)) {
    if (lower.includes(key)) return effects;
  }
  return DEFAULT_EFFECTS;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function resolveEwgUtilityUrl(href: string): string | null {
  try {
    const url = new URL(decodeHtmlEntities(href), EWG_TAPWATER_BASE);
    if (url.origin !== EWG_TAPWATER_ORIGIN) return null;
    if (url.pathname !== '/tapwater/system.php') return null;
    if (!url.searchParams.get('pws')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseEwgSearchResult(
  html: string
): EwgUtilitySearchResult | null {
  const utilityLinkPattern =
    /<a\b[^>]*href=["']([^"']*system\.php\?pws=[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = utilityLinkPattern.exec(html)) !== null) {
    const utilityUrl = resolveEwgUtilityUrl(match[1]);
    if (!utilityUrl) continue;
    return {
      utilityName: stripTags(match[2]) || null,
      utilityUrl,
    };
  }

  return null;
}

function extractUtilityName(
  lines: string[],
  html: string,
  zipCode: string
): string {
  const utilityLabelIndex = lines.findIndex(
    (line) => line.toUpperCase() === 'UTILITY'
  );
  if (utilityLabelIndex !== -1) {
    const candidate = lines
      .slice(utilityLabelIndex + 1, utilityLabelIndex + 6)
      .find((line) => !/^(location|serves|source|data)$/i.test(line));
    if (candidate) return candidate;
  }

  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
  const utilityH1 = h1s.find(
    (heading) => !/^find your gateway$/i.test(heading)
  );
  if (utilityH1) return utilityH1;

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    const titleText = stripTags(title[1])
      .replace(/\s*\|.*$/, '')
      .replace(/EWG.*$/, '')
      .trim();
    if (titleText) return titleText;
  }

  return `Gateway utility for ${zipCode}`;
}

function isCandidateContaminantName(line: string): boolean {
  if (line.length < 2 || line.length > 90) return false;
  if (line.includes(':')) return false;
  if (
    /^(overview|contaminants|find your gateway|find a filter|take action|utility)$/i.test(
      line
    )
  ) {
    return false;
  }
  if (/^\d+(?:\.\d+)?x$/i.test(line)) return false;
  if (/[.!?]$/.test(line)) return false;
  const isSectionLabel =
    /^(contaminants detected|exceed guidelines other detected|potential effect|how your levels compare)$/i.test(
      line
    );
  if (isSectionLabel) {
    return false;
  }
  if (
    /^(this utility|legal limit|no legal limit|ewg(?:'|’)?s? health guideline|no ewg health guideline|national average|state average|health risks|pollution sources|filtering options|image)$/i.test(
      line
    )
  ) {
    return false;
  }
  if (/^(view more testing data|more about this contaminant)$/i.test(line)) {
    return false;
  }
  return /[a-z]/i.test(line);
}

function findLabelIndex(
  lines: string[],
  startIndex: number,
  label: RegExp,
  searchWindow: number
): number {
  const end = Math.min(lines.length, startIndex + searchWindow);
  for (let i = startIndex; i < end; i++) {
    if (label.test(lines[i])) return i;
  }
  return -1;
}

function parseMeasurementText(text: string): ParsedMeasurement {
  if (
    /^(?:none|not yet determined|no legal limit|no ewg health guideline)$/i.test(
      text.trim()
    )
  ) {
    return { amount: null, unit: '' };
  }

  const normalized = text.replace(/,/g, '').replace(/μ/g, 'µ');
  const match = normalized.match(
    /(-?\d+(?:\.\d+)?)\s*(pCi\/L|ppt|ppb|ppm|mg\/L|ug\/L|µg\/L)?/i
  );
  if (!match) return { amount: null, unit: '' };

  return {
    amount: Number.parseFloat(match[1]),
    unit: match[2] ?? '',
  };
}

function readMeasurementAtLine(line: string): ParsedMeasurement {
  const tail = line.includes(':') ? line.split(':').slice(1).join(':') : line;
  return parseMeasurementText(tail.trim());
}

function readMeasurementAfterLabel(
  lines: string[],
  startIndex: number,
  label: RegExp,
  searchWindow: number
): ParsedMeasurement {
  const labelIndex = findLabelIndex(lines, startIndex, label, searchWindow);
  if (labelIndex === -1) return { amount: null, unit: '' };

  const labelLine = lines[labelIndex];
  if (
    /no legal limit|no ewg health guideline|not yet determined/i.test(labelLine)
  ) {
    return { amount: null, unit: '' };
  }

  const inline = readMeasurementAtLine(labelLine);
  if (inline.amount !== null) return inline;

  for (
    let i = labelIndex + 1;
    i < Math.min(lines.length, labelIndex + searchWindow);
    i++
  ) {
    if (
      /^(this utility|legal limit|ewg(?:'|’)?s? health guideline|ewg health guideline|national average|state average|health risks|pollution sources|filtering options)$/i.test(
        lines[i]
      )
    ) {
      continue;
    }
    return parseMeasurementText(lines[i]);
  }

  return { amount: null, unit: '' };
}

function findThisUtilityIndex(lines: string[], startIndex: number): number {
  return findLabelIndex(lines, startIndex + 1, /^This Utility\b/i, 9);
}

function parseContaminants(lines: string[]): Contaminant[] {
  const contaminants: Contaminant[] = [];
  const seen = new Set<string>();
  const detectedIndex = lines.findIndex((line) =>
    /^Contaminants Detected$/i.test(line)
  );
  const startIndex = detectedIndex === -1 ? 0 : detectedIndex + 1;

  for (let i = startIndex; i < lines.length; i++) {
    const name = lines[i];
    if (!isCandidateContaminantName(name)) continue;

    const thisUtilityIndex = findThisUtilityIndex(lines, i);
    if (thisUtilityIndex === -1) continue;

    const detected = readMeasurementAfterLabel(
      lines,
      thisUtilityIndex,
      /^This Utility\b/i,
      4
    );
    if (detected.amount === null) continue;

    const key = normalizeKey(name);
    if (seen.has(key)) continue;

    const legal = readMeasurementAfterLabel(
      lines,
      thisUtilityIndex + 1,
      /^(?:Legal Limit|No Legal Limit)\b/i,
      10
    );
    const health = readMeasurementAfterLabel(
      lines,
      thisUtilityIndex + 1,
      /^(?:EWG(?:'|’)?s? Health Guideline|EWG Health Guideline|No EWG Health Guideline|Not yet determined)\b/i,
      10
    );
    const unit = detected.unit || health.unit || legal.unit || 'ppb';

    contaminants.push({
      name,
      detected: detected.amount,
      legalLimit: legal.amount,
      healthGuideline: health.amount,
      unit,
      exceedsLegal: legal.amount !== null && detected.amount > legal.amount,
      exceedsHealth: health.amount !== null && detected.amount > health.amount,
      effects: lookupEffects(name),
    });
    seen.add(key);
  }

  return contaminants;
}

export function parseEwgHtml(
  html: string,
  zipCode: string,
  gatewaySource: string
): GatewayReport | null {
  const lines = htmlToTextLines(html);
  const contaminants = parseContaminants(lines);

  if (contaminants.length === 0) return null;

  return {
    zipCode,
    gatewaySource,
    utilityName: extractUtilityName(lines, html, zipCode),
    contaminants,
    totalContaminants: contaminants.length,
    exceedingHealth: contaminants.filter((c) => c.exceedsHealth).length,
    exceedingLegal: contaminants.filter((c) => c.exceedsLegal).length,
    lastUpdated: new Date().toISOString(),
    isDemo: false,
  };
}

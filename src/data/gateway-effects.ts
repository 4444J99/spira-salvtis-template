/**
 * gateway-effects.ts — contaminant → health-effect tag mapping for the
 * Gateway funnel's EWG report proxy (`src/pages/api/gateway-report.ts`).
 *
 * Externalized per M2 (no hardcoded dynamic data — contaminant thresholds
 * and their effect classifications live in config, never inline in route
 * source). The keys are lower-cased contaminant-name substrings matched
 * against parsed EWG names; the values are effect tags the UI maps to
 * biology icons. Pure data — extend here, not in the route handler.
 */
export const KNOWN_EFFECTS: Record<string, string[]> = {
  'haloacetic acids': ['carcinogenic', 'cellular'],
  'total trihalomethanes': ['carcinogenic', 'cellular'],
  chromium: ['carcinogenic', 'detox'],
  arsenic: ['carcinogenic', 'neurological'],
  lead: ['neurological', 'reproductive', 'cellular'],
  nitrate: ['reproductive', 'cellular'],
  radium: ['carcinogenic'],
  uranium: ['carcinogenic', 'detox'],
  fluoride: ['neurological', 'hormonal'],
  chloroform: ['carcinogenic', 'detox'],
  pfas: ['hormonal', 'reproductive', 'cellular'],
  pfoa: ['hormonal', 'reproductive', 'carcinogenic'],
  pfos: ['hormonal', 'reproductive', 'carcinogenic'],
  manganese: ['neurological'],
  barium: ['cellular'],
  chlorine: ['skin', 'gateway'],
  bromodichloromethane: ['carcinogenic'],
  dibromochloromethane: ['carcinogenic'],
};

/**
 * Default effect tag applied when no key in {@link KNOWN_EFFECTS} matches
 * a contaminant name. Kept alongside the map so the fallback is configured,
 * not buried in the route handler.
 */
export const DEFAULT_EFFECTS: string[] = ['cellular'];

/**
 * Hydration Node — Data Model
 *
 * Defines the type system for the 6-step hydration funnel.
 * Phase A uses demo data; Phase B connects to EWG API.
 *
 * @see docs/superpowers/intakes/2026-04-03-admin-hydration-node-funnel-spec.md
 * @see docs/decisions/2026-04-04-water-hub-placement.md
 */

import bottledWaterPriceData from './runtime/bottled-prices.json' with { type: 'json' };

// --- Step 1: Contaminant Lookup ---

export interface Contaminant {
  name: string;
  legalLimit: number | null;
  healthGuideline: number | null;
  detected: number;
  unit: string;
  exceedsLegal: boolean;
  exceedsHealth: boolean;
  effects: ContaminantEffect[];
}

export type ContaminantEffect =
  | 'hydration'
  | 'skin'
  | 'detox'
  | 'cellular'
  | 'hormonal'
  | 'neurological'
  | 'reproductive'
  | 'carcinogenic';

export interface WaterReport {
  zipCode: string;
  waterSource: WaterSource;
  utilityName: string;
  contaminants: Contaminant[];
  totalContaminants: number;
  exceedingHealth: number;
  exceedingLegal: number;
  lastUpdated: string;
}

export type WaterSource = 'tap' | 'well' | 'bottled' | 'unsure';

// --- Step 1: Cost Comparison ---

export interface BottledWaterCost {
  brand: string;
  perBottle: number;
  perCase: number;
  perGallon: number;
  source: string;
  sourceCheckedAt: string | null;
  unitVolumeOz: number;
  monthlyVolumeAssumption: number;
  trackingIssue: number;
  monthlyEstimate: number;
  yearlyEstimate: number;
}

export type BottledWaterCostInput = Omit<
  BottledWaterCost,
  'monthlyEstimate' | 'yearlyEstimate'
>;

// --- Step 2: Filter Recommendations ---

export interface FilterTier {
  id: string;
  name: string;
  brand: string;
  position: FilterPosition;
  /** Lower bound of the install price (USD), structured for cost math. */
  priceMin: number;
  /** Upper bound of the install price (USD). Equal to priceMin for fixed-price tiers. */
  priceMax: number;
  features: string[];
  removes: string[];
  /**
   * Whether this tier verifiably removes (effectively) every concerning
   * contaminant — drives the match score instead of a substring wildcard on
   * `removes`. Only the whole-house multi-stage tiers earn this.
   */
  coversAllMajor: boolean;
  bestFor: string;
  affiliateUrl: string;
  image?: string;
}

/**
 * Human display string for a tier's price, derived from the structured
 * numeric bounds so the display can never drift from the math.
 */
export function priceRangeLabel(
  tier: Pick<FilterTier, 'priceMin' | 'priceMax'>,
): string {
  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  return tier.priceMin === tier.priceMax
    ? fmt(tier.priceMin)
    : `${fmt(tier.priceMin)}–${fmt(tier.priceMax)}`;
}

/**
 * Representative install cost used for amortized cost comparison — the
 * midpoint of the tier's price band (a single number for fixed-price tiers).
 */
export function representativePrice(
  tier: Pick<FilterTier, 'priceMin' | 'priceMax'>,
): number {
  return (tier.priceMin + tier.priceMax) / 2;
}

export type FilterPosition =
  | 'entry'
  | 'mid-tier'
  | 'high-end'
  | 'upgrade-spa'
  | 'upgrade-ionizer';

export interface FilterRecommendation {
  tier: FilterTier;
  matchScore: number;
  reason: string;
  monthlySavings: number;
  yearlyComparison: {
    bottledWater: number;
    thisFilter: number;
    savings: number;
  };
}

// --- Step 3: Health Survey ---

export interface HealthSurveyQuestion {
  id: string;
  question: string;
  category: 'hydration' | 'detox' | 'fertility' | 'energy' | 'skin';
  options: SurveyOption[];
}

export interface SurveyOption {
  label: string;
  value: number;
  flag?: string;
}

// --- Step Configuration ---

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface FunnelStep {
  id: StepId;
  title: string;
  subtitle: string;
  access: 'free' | 'email-gated' | 'post-conversion';
  color: string;
  icon: string;
}

export interface HydrationConfig {
  steps: FunnelStep[];
  filterTiers: FilterTier[];
  costData: BottledWaterCost[];
}

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Derive monthly/yearly spend from the externalized per-bottle price.
 *
 * Cross-brand comparability invariant: every same-size bottle MUST share one
 * `monthlyVolumeAssumption`, because the funnel compares "what you're spending"
 * across brands at a fixed personal consumption — the only variable should be
 * the per-bottle price, never how much you're assumed to drink. The shared
 * baseline is ~30 bottles/month (≈ 1 standard 16.9 oz bottle/day), a
 * deliberately conservative floor that never overstates the spend the filter
 * pitch is measured against. (W-067 / GH#63 fixed a Safeway-only 36.9 outlier
 * that inflated store-brand cost relative to the premium brands — the reverse
 * of reality, and part of what admin flagged as "not right".)
 *
 * `perBottle` (single-bottle convenience price) drives the estimate; `perCase`
 * and `perGallon` are alternative-format references for the same brand and are
 * intentionally NOT derivable from `perBottle` (different retail SKUs). The
 * dollar values themselves remain unverified placeholders (`sourceCheckedAt:
 * null`, `trackingIssue: 63`) pending real shelf-price verification.
 */
export function deriveBottledWaterCost(
  record: BottledWaterCostInput,
): BottledWaterCost {
  const monthlyEstimate = roundCurrency(
    record.perBottle * record.monthlyVolumeAssumption,
  );

  return {
    ...record,
    monthlyEstimate,
    yearlyEstimate: roundCurrency(monthlyEstimate * 12),
  };
}

// --- Filter Matching Engine ---

interface MatchContaminant {
  name: string;
  exceedsHealth: boolean;
  exceedsLegal: boolean;
}

/**
 * Score each filter tier against a user's contaminant profile.
 * Returns sorted recommendations (best match first) with cost comparison.
 */
export function matchFiltersToContaminants(
  contaminants: MatchContaminant[],
  filters: FilterTier[] = hydrationConfig.filterTiers,
  avgBottledMonthly = 65,
): FilterRecommendation[] {
  const concerning = contaminants.filter(
    (c) => c.exceedsHealth || c.exceedsLegal,
  );

  return filters
    .map((tier) => {
      const removesLower = tier.removes.map((r) => r.toLowerCase());
      let matched = 0;
      for (const c of concerning) {
        // Whole-house multi-stage tiers (coversAllMajor) cover any concerning
        // contaminant; others only count an explicit name match in `removes`.
        if (tier.coversAllMajor) {
          matched++;
          continue;
        }
        const cLower = c.name.toLowerCase();
        if (removesLower.some((r) => cLower.includes(r))) {
          matched++;
        }
      }

      const matchScore =
        concerning.length > 0
          ? Math.round((matched / concerning.length) * 100)
          : 50;

      // Representative install price (midpoint of the structured band),
      // amortized over 3 years — no display-string parsing.
      const monthlyFilterCost = representativePrice(tier) / 36;
      const yearlySavings = avgBottledMonthly * 12 - monthlyFilterCost * 12;

      const reason =
        matchScore >= 80
          ? `Removes ${matched} of ${concerning.length} flagged contaminants in your area`
          : matchScore >= 50
            ? `Covers key contaminants — good starting point for your profile`
            : `Targeted solution — best for ${tier.bestFor.toLowerCase()}`;

      return {
        tier,
        matchScore,
        reason,
        // Premium tiers (spa/ionizer) can cost more than the bottled baseline;
        // never surface a negative "savings" figure in the UI.
        monthlySavings: Math.max(
          0,
          Math.round(avgBottledMonthly - monthlyFilterCost),
        ),
        yearlyComparison: {
          bottledWater: Math.round(avgBottledMonthly * 12),
          thisFilter: Math.round(monthlyFilterCost * 12),
          savings: Math.max(0, Math.round(yearlySavings)),
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// --- Affiliate URLs (M2 — env-overridable, current value as default) ---
// Affiliate slugs are dynamic data: they can change per admin's referral
// agreements. They live in env vars so they can be rotated without a code
// edit. The current known-good value is the fallback so behaviour is
// unchanged until an override is set.
//
// anespa/k8 default to '' — those are the live GH#49 vacuums: the Enagic
// referral links are still an open question to admin (Anespa DX: referral
// link or drop the tier; K8 Kangen: confirm wiring her LeveLuk K8 page — see
// docs/admin/2026-06-05-final-pending-inputs.md). They keep the same
// env-override hook as the four populated tiers so that, the moment admin
// confirms a link, ops can set PUBLIC_AFFILIATE_ANESPA / PUBLIC_AFFILIATE_K8
// in the Cloudflare env to wire revenue WITHOUT a source edit — but the
// fallback stays '' (never default a fabricated URL), so the vacuum gate keeps
// tracking them against GH#49 until a real value lands.
//
// `import.meta.env?.` is optional-chained because this module is also imported
// outside Vite/Astro (the vacuum gate runs it under Node type-stripping, where
// `import.meta.env` is undefined) — the same pattern site.config.ts uses.
const env = import.meta.env;
const AFFILIATE_URLS = {
  ionfaucet:
    env?.PUBLIC_AFFILIATE_IONFAUCET ?? 'https://ionfaucet.com/admin-spiral',
  multipure:
    env?.PUBLIC_AFFILIATE_MULTIPURE ?? 'https://www.multipure.com/admin-wired',
  purehome: env?.PUBLIC_AFFILIATE_PUREHOME ?? 'https://purehome.co/admin',
  coldstream:
    env?.PUBLIC_AFFILIATE_COLDSTREAM ??
    'https://www.coldstreamfilters.com/?v=79cba1185463',
  anespa: env?.PUBLIC_AFFILIATE_ANESPA ?? '',
  k8: env?.PUBLIC_AFFILIATE_K8 ?? '',
} as const;

const bottledWaterCosts = (
  bottledWaterPriceData as BottledWaterCostInput[]
).map(deriveBottledWaterCost);

// --- Demo Data (Phase A) ---

export const hydrationConfig: HydrationConfig = {
  steps: [
    {
      id: 1,
      title: "What's In Your Water?",
      subtitle:
        'Enter your ZIP code to see what contaminants are in your local water supply.',
      access: 'free',
      color: '#119a9e',
      icon: '💧',
    },
    {
      id: 2,
      title: 'Your Personalized Filter Match',
      subtitle:
        'Get tiered filter recommendations matched to your specific contaminants.',
      access: 'email-gated',
      color: '#c9a96e',
      icon: '🔬',
    },
    {
      id: 3,
      title: 'Your Water & Health Profile',
      subtitle:
        'Optional deeper assessment — hydration, detox, fertility, energy, skin.',
      access: 'post-conversion',
      color: '#3dbfc4',
      icon: '🌿',
    },
    {
      id: 4,
      title: 'See It In Action',
      subtitle: 'Personalized demo with a water specialist.',
      access: 'post-conversion',
      color: '#8b5cf6',
      icon: '🎯',
    },
    {
      id: 5,
      title: 'Your Full Report',
      subtitle:
        'Emailed summary with contaminants, recommendations, and cost savings.',
      access: 'post-conversion',
      color: '#f59e0b',
      icon: '📊',
    },
    {
      id: 6,
      title: 'Deep Dive',
      subtitle:
        'Cellular hydration, detox pathways, and advanced wellness resources.',
      access: 'post-conversion',
      color: '#ec4899',
      icon: '🔮',
    },
  ],

  filterTiers: [
    {
      id: 'ionfaucet',
      name: 'IonFaucet',
      brand: 'IonFaucet',
      position: 'entry',
      priceMin: 150,
      priceMax: 300,
      features: ['Point-of-use', 'Easy install', 'No plumbing changes'],
      removes: ['Chlorine', 'Lead', 'Sediment', 'VOCs'],
      coversAllMajor: false,
      bestFor: 'Renters or single-faucet solution',
      affiliateUrl: AFFILIATE_URLS.ionfaucet,
    },
    {
      id: 'multipure',
      name: 'Multipure',
      brand: 'Multipure',
      position: 'mid-tier',
      priceMin: 400,
      priceMax: 800,
      features: ['Whole house option', 'NSF certified', 'Carbon block'],
      removes: [
        'Chlorine',
        'Lead',
        'Mercury',
        'Arsenic',
        'PFAS',
        'Pharmaceuticals',
      ],
      coversAllMajor: false,
      bestFor: 'Families wanting broader protection',
      affiliateUrl: AFFILIATE_URLS.multipure,
    },
    {
      id: 'purehome',
      name: 'PureHome',
      brand: 'PureHome',
      position: 'high-end',
      priceMin: 2000,
      priceMax: 5000,
      features: ['Whole house', 'Multi-stage', 'Professional install'],
      // `coversAllMajor` (below) drives scoring; this list is display-only.
      removes: [
        'All major contaminants',
        'Bacteria',
        'Viruses',
        'Microplastics',
      ],
      coversAllMajor: true,
      bestFor: 'Homeowners wanting complete water sovereignty',
      affiliateUrl: AFFILIATE_URLS.purehome,
    },
    {
      id: 'coldstream',
      name: 'Coldstream',
      brand: 'Coldstream',
      position: 'mid-tier',
      priceMin: 200,
      priceMax: 400,
      features: [
        'Countertop or under-sink',
        'Ceramic filter',
        'No power required',
      ],
      removes: ['Chlorine', 'Lead', 'Bacteria', 'Microplastics', 'Fluoride'],
      coversAllMajor: false,
      bestFor: 'High-quality standalone filtration (UK/EU availability)',
      affiliateUrl: AFFILIATE_URLS.coldstream,
    },
    {
      id: 'anespa',
      name: 'Anespa DX',
      brand: 'Enagic',
      position: 'upgrade-spa',
      priceMin: 2890,
      priceMax: 2890,
      features: ['Shower/bath', 'Hot spring minerals', 'Removes chlorine'],
      removes: ['Chlorine', 'Sediment'],
      coversAllMajor: false,
      bestFor: 'Skin health, spa-quality water at home',
      affiliateUrl: AFFILIATE_URLS.anespa,
    },
    {
      id: 'k8',
      name: 'K8 Kangen',
      brand: 'Enagic',
      position: 'upgrade-ionizer',
      priceMin: 4980,
      priceMax: 4980,
      features: ['8 platinum plates', 'pH 2.5–11.5', 'Medical-grade'],
      removes: ['Chlorine'],
      coversAllMajor: false,
      bestFor: 'Ionized/alkaline water, advanced wellness',
      affiliateUrl: AFFILIATE_URLS.k8,
    },
  ],

  costData: bottledWaterCosts,
};

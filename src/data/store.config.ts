import {
  hydrationConfig,
  priceRangeLabel,
  type FilterTier,
} from './hydration.config.ts';

export type StoreStatus = 'scaffolded' | 'live';
export type StoreProvider =
  | 'undecided'
  | 'stripe'
  | 'ghl'
  | 'shopify'
  | 'snipcart'
  | 'external-affiliate';
export type StoreGateStatus = 'open' | 'approved';

export interface StoreGate {
  id: string;
  label: string;
  status: StoreGateStatus;
  blocks: string;
  issue?: number;
}

export interface StoreCollection {
  id: string;
  title: string;
  description: string;
  state: 'planned' | 'client-input-needed' | 'ready' | 'live';
}

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  collectionId: StoreCollection['id'];
  priceLabel: string;
  checkoutUrl: string;
  provider: StoreProvider;
  sourceIssue: number;
  purchasable: boolean;
}

export interface StoreConfig {
  route: '/store';
  status: StoreStatus;
  checkoutEnabled: boolean;
  provider: StoreProvider;
  sourceIssue: number;
  gates: StoreGate[];
  collections: StoreCollection[];
  products: StoreProduct[];
}

function productDescription(tier: FilterTier): string {
  const removes = tier.removes.slice(0, 3).join(', ');
  return `${tier.bestFor}. Removes ${removes}${tier.removes.length > 3 ? ', and more' : ''}.`;
}

function productFromFilterTier(tier: FilterTier): StoreProduct {
  return {
    id: `filter-${tier.id}`,
    title: tier.name,
    description: productDescription(tier),
    collectionId: 'water-systems',
    priceLabel: priceRangeLabel(tier),
    checkoutUrl: tier.affiliateUrl,
    provider: 'external-affiliate',
    sourceIssue: 10,
    purchasable: tier.affiliateUrl.startsWith('https://'),
  };
}

const liveFilterProducts = hydrationConfig.filterTiers
  .filter((tier) => tier.affiliateUrl.length > 0)
  .map(productFromFilterTier);

export const storeConfig: StoreConfig = {
  route: '/store',
  status: 'live',
  checkoutEnabled: true,
  provider: 'external-affiliate',
  sourceIssue: 10,
  gates: [
    {
      id: 'product-list',
      label: 'Product list',
      status: 'approved',
      blocks:
        'Approved for MVP via the live water-system affiliate catalog already wired into the water funnel.',
      issue: 10,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      status: 'approved',
      blocks:
        'Pricing is sourced from the structured filter-tier price bands in hydration.config.ts.',
      issue: 10,
    },
    {
      id: 'payment-provider',
      label: 'Payment provider',
      status: 'approved',
      blocks:
        'MVP checkout uses external vendor carts through admin-tagged affiliate URLs; Stripe/GHL remain future first-party rails.',
      issue: 38,
    },
    {
      id: 'revenue-terms',
      label: 'Revenue terms',
      status: 'approved',
      blocks:
        'The 10 percent revenue-share terms are documented in docs/client-decisions/2026-04-14-revenue-agreement-accepted.md.',
      issue: 5,
    },
  ],
  collections: [
    {
      id: 'water-systems',
      title: 'Water systems',
      description:
        'Purchasable filter and water-system products routed to vendor checkout through admin-tagged affiliate links.',
      state: 'live',
    },
    {
      id: 'digital-offers',
      title: 'Digital offers',
      description:
        'Downloadable products, planners, and blueprint material wait on the free/email/paid boundary approval.',
      state: 'client-input-needed',
    },
    {
      id: 'subscription',
      title: 'Membership layer',
      description:
        'Recurring access stays parked until the paid-tier matrix and billing rail are approved.',
      state: 'planned',
    },
    {
      id: 'donations',
      title: 'Donations + reset fund',
      description:
        'Cind & Sol donation checkout stays held until fiscal sponsorship or the nonprofit payment rail is approved; current public flow captures interest only.',
      state: 'planned',
    },
    {
      id: 'mail',
      title: 'Mail subscription',
      description:
        'Physical mail and art-print subscriptions remain a future collection after the virtual store foundation is approved.',
      state: 'planned',
    },
  ],
  products: liveFilterProducts,
};

export const purchasableProducts = storeConfig.products.filter(
  (product) => product.purchasable && product.checkoutUrl.length > 0,
);

export const canTransact =
  storeConfig.status === 'live' &&
  storeConfig.checkoutEnabled &&
  storeConfig.provider !== 'undecided' &&
  storeConfig.gates.every((gate) => gate.status === 'approved') &&
  purchasableProducts.length > 0;

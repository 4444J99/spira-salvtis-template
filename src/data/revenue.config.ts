export type PaymentRail = 'undecided' | 'stripe' | 'ghl';

export interface DpSignupFlow {
  route: '/business/dp';
  offerId: 'dp-distributor-position';
  title: string;
  amountUsd: number;
  refundWindowDays: number;
  paymentRail: PaymentRail;
  checkoutEnabled: boolean;
  checkoutUrl: string;
  captureSource: 'dp-signup-interest';
  sourceIssue: 210;
  blockedByIssues: readonly [38];
  revenueIssue: 5;
}

export const dpSignupFlow: DpSignupFlow = {
  route: '/business/dp',
  offerId: 'dp-distributor-position',
  title: 'Distributor Position Sign-Up',
  amountUsd: 99,
  refundWindowDays: 14,
  paymentRail: 'undecided',
  checkoutEnabled: false,
  checkoutUrl: '',
  captureSource: 'dp-signup-interest',
  sourceIssue: 210,
  blockedByIssues: [38],
  revenueIssue: 5,
};

export const canAcceptDpPayment =
  dpSignupFlow.checkoutEnabled &&
  dpSignupFlow.paymentRail !== 'undecided' &&
  dpSignupFlow.checkoutUrl.length > 0;

// Subscription plans and limits
// Based on MASTER_SPEC and Appendix B

export const PLANS = {
  START: 'start',
  GROWTH: 'growth',
  SHOP: 'shop',
  AGENCY: 'agency',
} as const;

export type PlanId = typeof PLANS[keyof typeof PLANS];

export interface PlanLimits {
  maxSites: number;
  maxPagesPerSite: number;
  maxStorageGB: number;
  maxMonthlyVisits: number;
  customDomains: boolean;
  shop: boolean;
  whiteLabel: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  [PLANS.START]: {
    maxSites: 1,
    maxPagesPerSite: 15,
    maxStorageGB: 5,
    maxMonthlyVisits: 10000,
    customDomains: true,
    shop: false,
    whiteLabel: false,
  },
  [PLANS.GROWTH]: {
    maxSites: 3,
    maxPagesPerSite: 50,
    maxStorageGB: 20,
    maxMonthlyVisits: 50000,
    customDomains: true,
    shop: false,
    whiteLabel: false,
  },
  [PLANS.SHOP]: {
    maxSites: 1,
    maxPagesPerSite: 100,
    maxStorageGB: 50,
    maxMonthlyVisits: 100000,
    customDomains: true,
    shop: true,
    whiteLabel: true,
  },
  [PLANS.AGENCY]: {
    maxSites: 20,
    maxPagesPerSite: 100,
    maxStorageGB: 200,
    maxMonthlyVisits: 500000,
    customDomains: true,
    shop: true,
    whiteLabel: true,
  },
};

// Access policies (dunning) - Appendix B
export interface AccessPolicy {
  graceDays: number;
  softLockDays: number;
  hardLockDays: number;
}

export const ACCESS_POLICIES: Record<PlanId, AccessPolicy> = {
  [PLANS.START]: { graceDays: 3, softLockDays: 5, hardLockDays: 7 },
  [PLANS.GROWTH]: { graceDays: 5, softLockDays: 7, hardLockDays: 10 },
  [PLANS.SHOP]: { graceDays: 5, softLockDays: 7, hardLockDays: 10 },
  [PLANS.AGENCY]: { graceDays: 7, softLockDays: 10, hardLockDays: 14 },
};

// Performance Budgets - Appendix F

import { PlanId, PLANS } from './plans';

export interface PerformanceBudget {
  maxJsKb: number; // gzipped
  maxThirdPartyScripts: number;
  maxFontFamilies: number;
  maxFontWeights: number;
}

export const PERFORMANCE_BUDGETS: Record<PlanId, PerformanceBudget> = {
  [PLANS.START]: {
    maxJsKb: 250,
    maxThirdPartyScripts: 3,
    maxFontFamilies: 2,
    maxFontWeights: 4,
  },
  [PLANS.GROWTH]: {
    maxJsKb: 350,
    maxThirdPartyScripts: 6,
    maxFontFamilies: 3,
    maxFontWeights: 6,
  },
  [PLANS.SHOP]: {
    maxJsKb: 350,
    maxThirdPartyScripts: 6,
    maxFontFamilies: 3,
    maxFontWeights: 6,
  },
  [PLANS.AGENCY]: {
    maxJsKb: 500,
    maxThirdPartyScripts: 10,
    maxFontFamilies: 4,
    maxFontWeights: 8,
  },
};

export const BUDGET_WARNING_THRESHOLD = 0.8; // 80%
export const BUDGET_ERROR_THRESHOLD = 1.0; // 100%

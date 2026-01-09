// Core types for the entire system
export * from './site';
export * from './tenant';
export * from './billing';
export * from './tracking';

// Common utility types
export interface Timestamps {
  created_at: number;
  updated_at: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface RequestContext {
  requestId: string;
  tenantId?: string;
  userId?: string;
  role?: string;
  ip?: string;
  userAgent?: string;
}

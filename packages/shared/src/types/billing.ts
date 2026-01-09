import { Timestamps } from './index';
import { PlanId } from '../constants/plans';

export interface BillingAccount extends Timestamps {
  id: string;
  tenant_id: string;
  provider: string; // stripe, paddle, custom
  customer_id?: string;
  default_payment_method?: string;
  status: 'active' | 'past_due' | 'suspended' | 'canceled';
}

export interface Subscription extends Timestamps {
  id: string;
  billing_account_id: string;
  plan_id: PlanId;
  provider_subscription_id?: string;
  status: 'trialing' | 'active' | 'past_due' | 'suspended' | 'canceled';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
}

export interface Invoice extends Timestamps {
  id: string;
  subscription_id: string;
  provider_invoice_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  due_at: number;
  paid_at?: number;
  attempt_count: number;
}

export interface DunningStepLog {
  id: string;
  subscription_id: string;
  step_code: string; // RENEW_D-3, FAIL_IMMEDIATE, SOFT_D+3, etc.
  channel: 'whatsapp' | 'email' | 'in_app';
  recipient: string;
  message_template: string;
  message_id?: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  provider_response?: string;
  sent_at: number;
  delivered_at?: number;
}

export interface AccessPolicy {
  id: string;
  plan_id: PlanId;
  grace_days: number;
  soft_lock_days: number;
  hard_lock_days: number;
  created_at: number;
}

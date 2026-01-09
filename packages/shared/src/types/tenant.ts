import { Timestamps } from './index';
import { PlanId } from '../constants/plans';
import { Role } from '../constants/roles';

export interface Tenant extends Timestamps {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'canceled';
  plan_id: PlanId;
}

export interface User extends Timestamps {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface TenantUser extends Timestamps {
  id: string;
  tenant_id: string;
  user_id: string;
  role: Role;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: number;
}

import { Timestamps } from './index';

export interface Site extends Timestamps {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'staging' | 'published';
  theme_id?: string;
  template_id?: string;
  favicon_url?: string;
  logo_url?: string;
  primary_domain?: string;
}

export interface Page extends Timestamps {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  page_type: 'page' | 'post' | 'service' | 'case' | 'product' | 'landing';
  content_json: string; // JSON string of BlockInstance[]
  status: 'draft' | 'published';
  is_homepage: boolean;
  parent_id?: string;
  // SEO
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  noindex: boolean;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  // Mobile footer
  mobile_footer_enabled: boolean;
  mobile_footer_config?: string; // JSON
  published_at?: number;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  tokens_json: string; // JSON of theme tokens
  is_system: boolean;
  tenant_id?: string;
  created_at: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: 'local_service' | 'professional' | 'health' | 'restaurant' | 'ecommerce';
  thumbnail_url?: string;
  structure_json: string; // Complete site structure
  is_system: boolean;
  tenant_id?: string;
  created_at: number;
}

export interface Block {
  id: string;
  name: string;
  category: 'hero' | 'benefits' | 'social_proof' | 'faq' | 'pricing' | 'form' | 'cta' | 'comparison' | 'portfolio';
  component_type: string;
  config_json: string;
  thumbnail_url?: string;
  is_system: boolean;
  tenant_id?: string;
  created_at: number;
}

export interface PublishVersion extends Timestamps {
  id: string;
  site_id: string;
  version_number: number;
  snapshot_json: string;
  environment: 'staging' | 'production';
  status: 'pending' | 'building' | 'deploying' | 'purging_cache' | 'done' | 'failed';
  build_id?: string;
  deployed_url?: string;
  published_by: string;
  error_message?: string;
  completed_at?: number;
}

export interface Domain extends Timestamps {
  id: string;
  site_id: string;
  domain: string;
  type: 'custom' | 'subdomain';
  status: 'pending_validation' | 'pending_ssl' | 'active' | 'failed';
  cloudflare_hostname_id?: string;
  verification_token?: string;
  ssl_status?: string;
  ssl_expires_at?: number;
  activated_at?: number;
}

export interface Redirect {
  id: string;
  site_id: string;
  source_path: string;
  destination_path: string;
  status_code: 301 | 302;
  created_at: number;
}

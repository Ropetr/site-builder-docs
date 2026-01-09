import { Timestamps } from './index';

export interface TrackingConfig extends Timestamps {
  id: string;
  site_id: string;
  gtm_container_id?: string;
  ga4_measurement_id?: string;
  ads_conversion_id?: string;
  facebook_pixel_id?: string;
  tiktok_pixel_id?: string;
  consent_mode_enabled: boolean;
  consent_categories?: string; // JSON array
}

export interface ConsentCategory {
  id: string;
  name: string;
  required: boolean;
  default: boolean;
}

export const DEFAULT_CONSENT_CATEGORIES: ConsentCategory[] = [
  { id: 'necessary', name: 'Necessários', required: true, default: true },
  { id: 'analytics', name: 'Analíticos', required: false, default: false },
  { id: 'marketing', name: 'Marketing', required: false, default: false },
  { id: 'preferences', name: 'Preferências', required: false, default: false },
];

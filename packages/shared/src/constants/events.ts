// Canonical Events - Appendix A
// All events use snake_case

export const EVENTS = {
  // Base events
  PAGE_VIEW: 'page_view',
  CLICK_CTA: 'click_cta',
  GENERATE_LEAD: 'generate_lead',
  CONTACT: 'contact',

  // Mobile footer events
  CLICK_CALL: 'click_call',
  CLICK_WHATSAPP: 'click_whatsapp',
  CLICK_DIRECTIONS: 'click_directions',

  // E-commerce events
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

// Event parameter types
export interface BaseEventParams {
  event: EventName;
  page_path: string;
  device: 'mobile' | 'tablet' | 'desktop';
  timestamp_ms: number;
  label?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
}

export interface EcommerceEventParams extends BaseEventParams {
  currency: string;
  value: number;
  items: EcommerceItem[];
  transaction_id?: string;
}

// Micro vs Macro conversions
export const MICRO_CONVERSIONS: EventName[] = [
  EVENTS.CLICK_WHATSAPP,
  EVENTS.CLICK_CALL,
  EVENTS.CLICK_DIRECTIONS,
  EVENTS.ADD_TO_CART,
  EVENTS.BEGIN_CHECKOUT,
];

export const MACRO_CONVERSIONS: EventName[] = [
  EVENTS.GENERATE_LEAD,
  EVENTS.PURCHASE,
];

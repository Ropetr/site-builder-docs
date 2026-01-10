/**
 * Template and Block Type Definitions
 */

export interface Block {
  id: string;
  type: string;
  category: 'hero' | 'features' | 'pricing' | 'testimonials' | 'form' | 'content' | 'footer' | 'navigation';
  name: string;
  description?: string;
  preview_url?: string;
  schema: BlockSchema;
  default_props: Record<string, unknown>;
  styles?: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export interface BlockSchema {
  props: Record<string, PropDefinition>;
  slots?: Record<string, SlotDefinition>;
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'image' | 'rich-text' | 'select' | 'color' | 'array';
  label: string;
  default?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SlotDefinition {
  label: string;
  accepts?: string[]; // Block types allowed in this slot
  maxItems?: number;
}

export interface Template {
  id: string;
  name: string;
  category: 'landing' | 'marketing' | 'ecommerce' | 'blog' | 'portfolio' | 'saas';
  description?: string;
  preview_url?: string;
  structure: TemplateStructure;
  metadata: TemplateMetadata;
  created_at: number;
  updated_at: number;
}

export interface TemplateStructure {
  pages: TemplatePage[];
  theme_id?: string;
  global_blocks?: string[]; // Block IDs for header/footer
}

export interface TemplatePage {
  slug: string;
  title: string;
  meta_description?: string;
  blocks: PageBlock[];
}

export interface PageBlock {
  block_id: string;
  props: Record<string, unknown>;
  children?: PageBlock[];
}

export interface TemplateMetadata {
  author?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimated_setup_time?: number; // minutes
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    unit: number; // base unit in px
    container: {
      maxWidth: string;
      padding: string;
    };
  };
  borderRadius: {
    sm: string;
    base: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    base: string;
    lg: string;
  };
  created_at: number;
  updated_at: number;
}

// Runtime types for rendering
export interface PageData {
  slug: string;
  title: string;
  meta_description?: string;
  blocks: ResolvedBlock[];
  theme: Theme;
  global_blocks?: {
    header?: ResolvedBlock;
    footer?: ResolvedBlock;
  };
}

export interface ResolvedBlock {
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, unknown>;
  children?: ResolvedBlock[];
}

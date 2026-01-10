-- Seed data for blocks and themes

-- Default theme
INSERT INTO themes (id, name, config, created_at, updated_at)
VALUES (
  'theme-default',
  'Default Theme',
  json('{
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "surface": "#f9fafb",
      "text": "#111827",
      "textSecondary": "#6b7280",
      "border": "#e5e7eb",
      "error": "#ef4444",
      "success": "#10b981"
    },
    "typography": {
      "fontFamily": {
        "heading": "Inter, system-ui, sans-serif",
        "body": "Inter, system-ui, sans-serif"
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    },
    "spacing": {
      "unit": 4,
      "container": {
        "maxWidth": "1280px",
        "padding": "1rem"
      }
    },
    "borderRadius": {
      "sm": "0.25rem",
      "base": "0.5rem",
      "lg": "1rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "base": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    }
  }'),
  unixepoch(),
  unixepoch()
);

-- Hero block
INSERT INTO blocks (id, type, category, name, description, schema, default_props, created_at, updated_at)
VALUES (
  'block-hero-01',
  'hero',
  'hero',
  'Hero with CTA',
  'Full-width hero section with headline, subheadline, and call-to-action button',
  json('{
    "props": {
      "headline": {
        "type": "string",
        "label": "Headline",
        "default": "Build beautiful sites in minutes",
        "required": true
      },
      "subheadline": {
        "type": "string",
        "label": "Subheadline",
        "default": "No-code site builder with powerful customization"
      },
      "ctaText": {
        "type": "string",
        "label": "CTA Button Text",
        "default": "Get Started"
      },
      "ctaUrl": {
        "type": "string",
        "label": "CTA URL",
        "default": "/signup"
      },
      "backgroundImage": {
        "type": "image",
        "label": "Background Image"
      },
      "alignment": {
        "type": "select",
        "label": "Text Alignment",
        "default": "center",
        "options": [
          {"label": "Left", "value": "left"},
          {"label": "Center", "value": "center"},
          {"label": "Right", "value": "right"}
        ]
      }
    }
  }'),
  json('{
    "headline": "Build beautiful sites in minutes",
    "subheadline": "No-code site builder with powerful customization",
    "ctaText": "Get Started",
    "ctaUrl": "/signup",
    "alignment": "center"
  }'),
  unixepoch(),
  unixepoch()
);

-- Features block
INSERT INTO blocks (id, type, category, name, description, schema, default_props, created_at, updated_at)
VALUES (
  'block-features-01',
  'features',
  'features',
  'Feature Grid',
  'Grid layout showcasing 3 or more features',
  json('{
    "props": {
      "title": {
        "type": "string",
        "label": "Section Title",
        "default": "Features"
      },
      "subtitle": {
        "type": "string",
        "label": "Section Subtitle"
      },
      "items": {
        "type": "array",
        "label": "Feature Items",
        "default": []
      },
      "columns": {
        "type": "select",
        "label": "Number of Columns",
        "default": 3,
        "options": [
          {"label": "2", "value": 2},
          {"label": "3", "value": 3},
          {"label": "4", "value": 4}
        ]
      }
    }
  }'),
  json('{
    "title": "Features",
    "subtitle": "Everything you need to build your site",
    "columns": 3,
    "items": [
      {
        "icon": "⚡",
        "title": "Fast Performance",
        "description": "Lightning-fast load times with edge deployment"
      },
      {
        "icon": "🎨",
        "title": "Beautiful Design",
        "description": "Professional templates and themes"
      },
      {
        "icon": "🔧",
        "title": "Easy to Use",
        "description": "No-code editor with drag and drop"
      }
    ]
  }'),
  unixepoch(),
  unixepoch()
);

-- Form block
INSERT INTO blocks (id, type, category, name, description, schema, default_props, created_at, updated_at)
VALUES (
  'block-form-01',
  'contact-form',
  'form',
  'Contact Form',
  'Contact form with name, email, and message fields',
  json('{
    "props": {
      "title": {
        "type": "string",
        "label": "Form Title",
        "default": "Contact Us"
      },
      "submitText": {
        "type": "string",
        "label": "Submit Button Text",
        "default": "Send Message"
      },
      "successMessage": {
        "type": "string",
        "label": "Success Message",
        "default": "Thank you! We will get back to you soon."
      },
      "fields": {
        "type": "array",
        "label": "Form Fields",
        "default": []
      }
    }
  }'),
  json('{
    "title": "Contact Us",
    "submitText": "Send Message",
    "successMessage": "Thank you! We will get back to you soon.",
    "fields": [
      {"name": "name", "type": "text", "label": "Name", "required": true},
      {"name": "email", "type": "email", "label": "Email", "required": true},
      {"name": "message", "type": "textarea", "label": "Message", "required": true}
    ]
  }'),
  unixepoch(),
  unixepoch()
);

-- Pricing block
INSERT INTO blocks (id, type, category, name, description, schema, default_props, created_at, updated_at)
VALUES (
  'block-pricing-01',
  'pricing',
  'pricing',
  'Pricing Table',
  'Pricing table with multiple tiers',
  json('{
    "props": {
      "title": {
        "type": "string",
        "label": "Section Title",
        "default": "Pricing"
      },
      "subtitle": {
        "type": "string",
        "label": "Section Subtitle"
      },
      "plans": {
        "type": "array",
        "label": "Pricing Plans",
        "default": []
      }
    }
  }'),
  json('{
    "title": "Simple Pricing",
    "subtitle": "Choose the plan that works for you",
    "plans": [
      {
        "name": "Starter",
        "price": "$9",
        "period": "/month",
        "features": ["1 Site", "Custom Domain", "Basic Support"],
        "ctaText": "Start Free Trial",
        "ctaUrl": "/signup?plan=starter"
      },
      {
        "name": "Pro",
        "price": "$29",
        "period": "/month",
        "features": ["5 Sites", "Custom Domains", "Priority Support", "Advanced Analytics"],
        "ctaText": "Start Free Trial",
        "ctaUrl": "/signup?plan=pro",
        "highlighted": true
      },
      {
        "name": "Business",
        "price": "$99",
        "period": "/month",
        "features": ["Unlimited Sites", "Custom Domains", "24/7 Support", "Advanced Analytics", "White Label"],
        "ctaText": "Contact Sales",
        "ctaUrl": "/contact"
      }
    ]
  }'),
  unixepoch(),
  unixepoch()
);

-- Footer block
INSERT INTO blocks (id, type, category, name, description, schema, default_props, created_at, updated_at)
VALUES (
  'block-footer-01',
  'footer',
  'footer',
  'Footer',
  'Site footer with links and social media',
  json('{
    "props": {
      "companyName": {
        "type": "string",
        "label": "Company Name",
        "default": "Your Company"
      },
      "copyright": {
        "type": "string",
        "label": "Copyright Text",
        "default": "All rights reserved"
      },
      "links": {
        "type": "array",
        "label": "Footer Links",
        "default": []
      },
      "socialLinks": {
        "type": "array",
        "label": "Social Media Links",
        "default": []
      }
    }
  }'),
  json('{
    "companyName": "Your Company",
    "copyright": "© 2024 Your Company. All rights reserved.",
    "links": [
      {"label": "Privacy Policy", "url": "/privacy"},
      {"label": "Terms of Service", "url": "/terms"},
      {"label": "Contact", "url": "/contact"}
    ],
    "socialLinks": [
      {"platform": "twitter", "url": "https://twitter.com/yourcompany"},
      {"platform": "linkedin", "url": "https://linkedin.com/company/yourcompany"}
    ]
  }'),
  unixepoch(),
  unixepoch()
);

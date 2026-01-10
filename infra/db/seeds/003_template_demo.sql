-- Demo template with real structure
-- Landing page template using existing blocks

INSERT INTO templates (id, name, category, description, structure, metadata, created_at, updated_at)
VALUES (
  'template-landing-01',
  'SaaS Landing Page',
  'saas',
  'Modern landing page template for SaaS products with hero, features, pricing, and contact form',
  json('{
    "pages": [
      {
        "slug": "index",
        "title": "Welcome to Your SaaS",
        "meta_description": "The best SaaS solution for your business needs",
        "blocks": [
          {
            "block_id": "block-hero-01",
            "props": {
              "headline": "Build Amazing Products Faster",
              "subheadline": "The all-in-one platform to create, manage, and scale your business",
              "ctaText": "Start Free Trial",
              "ctaUrl": "/signup",
              "alignment": "center"
            }
          },
          {
            "block_id": "block-features-01",
            "props": {
              "title": "Everything You Need",
              "subtitle": "Powerful features to help you succeed",
              "columns": 3,
              "items": [
                {
                  "icon": "⚡",
                  "title": "Lightning Fast",
                  "description": "Optimized performance with global edge deployment"
                },
                {
                  "icon": "🔒",
                  "title": "Secure by Default",
                  "description": "Enterprise-grade security built into every layer"
                },
                {
                  "icon": "📊",
                  "title": "Powerful Analytics",
                  "description": "Deep insights into your business metrics"
                },
                {
                  "icon": "🎨",
                  "title": "Beautiful Design",
                  "description": "Stunning templates that convert visitors"
                },
                {
                  "icon": "🚀",
                  "title": "Easy Deployment",
                  "description": "Deploy to production in one click"
                },
                {
                  "icon": "💬",
                  "title": "24/7 Support",
                  "description": "Always here when you need help"
                }
              ]
            }
          },
          {
            "block_id": "block-pricing-01",
            "props": {
              "title": "Simple, Transparent Pricing",
              "subtitle": "Choose the plan that fits your needs",
              "plans": [
                {
                  "name": "Starter",
                  "price": "$29",
                  "period": "/month",
                  "features": [
                    "1 Site",
                    "Custom Domain",
                    "5GB Storage",
                    "Basic Analytics",
                    "Email Support"
                  ],
                  "ctaText": "Start Free Trial",
                  "ctaUrl": "/signup?plan=starter"
                },
                {
                  "name": "Professional",
                  "price": "$99",
                  "period": "/month",
                  "features": [
                    "5 Sites",
                    "Custom Domains",
                    "50GB Storage",
                    "Advanced Analytics",
                    "Priority Support",
                    "Custom Integrations"
                  ],
                  "ctaText": "Start Free Trial",
                  "ctaUrl": "/signup?plan=professional",
                  "highlighted": true
                },
                {
                  "name": "Enterprise",
                  "price": "$299",
                  "period": "/month",
                  "features": [
                    "Unlimited Sites",
                    "Custom Domains",
                    "500GB Storage",
                    "Advanced Analytics",
                    "24/7 Support",
                    "Custom Integrations",
                    "White Label",
                    "SLA Guarantee"
                  ],
                  "ctaText": "Contact Sales",
                  "ctaUrl": "/contact"
                }
              ]
            }
          },
          {
            "block_id": "block-form-01",
            "props": {
              "title": "Get in Touch",
              "submitText": "Send Message",
              "successMessage": "Thanks! We will get back to you within 24 hours.",
              "fields": [
                {"name": "name", "type": "text", "label": "Your Name", "required": true},
                {"name": "email", "type": "email", "label": "Email Address", "required": true},
                {"name": "company", "type": "text", "label": "Company Name", "required": false},
                {"name": "message", "type": "textarea", "label": "How can we help?", "required": true}
              ]
            }
          },
          {
            "block_id": "block-footer-01",
            "props": {
              "companyName": "Your SaaS Company",
              "copyright": "© 2024 Your SaaS Company. All rights reserved.",
              "links": [
                {"label": "About Us", "url": "/about"},
                {"label": "Features", "url": "/#features"},
                {"label": "Pricing", "url": "/#pricing"},
                {"label": "Contact", "url": "/#contact"},
                {"label": "Privacy Policy", "url": "/privacy"},
                {"label": "Terms of Service", "url": "/terms"}
              ],
              "socialLinks": [
                {"platform": "Twitter", "url": "https://twitter.com/yourcompany"},
                {"platform": "LinkedIn", "url": "https://linkedin.com/company/yourcompany"},
                {"platform": "GitHub", "url": "https://github.com/yourcompany"}
              ]
            }
          }
        ]
      }
    ],
    "theme_id": "theme-default"
  }'),
  json('{
    "author": "Site Builder Team",
    "tags": ["landing", "saas", "marketing"],
    "difficulty": "beginner",
    "estimated_setup_time": 5
  }'),
  unixepoch(),
  unixepoch()
);

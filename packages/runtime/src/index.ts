/**
 * Site Builder Runtime Worker
 * Serves published sites from R2 storage
 */

import { Hono } from 'hono';
import { cache } from 'hono/cache';
import type { PageData, ResolvedBlock } from '@site-builder/shared';

export interface Env {
  SITES: R2Bucket; // Published sites storage
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Cache static assets for 1 hour
app.use('/assets/*', cache({
  cacheName: 'runtime-assets',
  cacheControl: 'public, max-age=3600',
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'runtime',
    environment: c.env.ENVIRONMENT || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main site rendering endpoint
 * Matches custom domains and serves published sites
 */
app.get('/*', async (c) => {
  const hostname = new URL(c.req.url).hostname;
  const path = c.req.path === '/' ? '/index' : c.req.path;

  try {
    // 1. Resolve domain to site_id
    const siteId = await resolveDomainToSite(c.env.DB, c.env.CACHE, hostname);

    if (!siteId) {
      return c.html(render404Page(), 404);
    }

    // 2. Get published version metadata
    const versionKey = `site:${siteId}:published`;
    const versionIdStr = await c.env.CACHE.get(versionKey);

    if (!versionIdStr) {
      return c.html(renderUnpublishedPage(), 503);
    }

    // 3. Fetch page data from R2
    const pageKey = `${siteId}/${versionIdStr}${path}.json`;
    const pageObject = await c.env.SITES.get(pageKey);

    if (!pageObject) {
      // Try 404 page
      const notFoundObject = await c.env.SITES.get(`${siteId}/${versionIdStr}/404.json`);
      if (notFoundObject) {
        const notFoundData = await notFoundObject.json<PageData>();
        return c.html(renderPage(notFoundData), 404);
      }
      return c.html(render404Page(), 404);
    }

    const pageData = await pageObject.json<PageData>();

    // 4. Render page to HTML
    const html = renderPage(pageData);

    // 5. Return with appropriate headers
    return c.html(html, 200, {
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Site-Id': siteId,
      'X-Version-Id': versionIdStr,
    });

  } catch (error) {
    console.error('Runtime error:', error);
    return c.html(render500Page(), 500);
  }
});

/**
 * Resolve hostname to site ID
 */
async function resolveDomainToSite(
  db: D1Database,
  cache: KVNamespace,
  hostname: string
): Promise<string | null> {
  // Check cache first
  const cacheKey = `domain:${hostname}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Query database
  const result = await db
    .prepare('SELECT site_id FROM domains WHERE domain = ? AND status = ? LIMIT 1')
    .bind(hostname, 'active')
    .first<{ site_id: string }>();

  if (!result) return null;

  // Cache for 5 minutes
  await cache.put(cacheKey, result.site_id, { expirationTtl: 300 });

  return result.site_id;
}

/**
 * Render page data to HTML
 */
function renderPage(pageData: PageData): string {
  const { title, meta_description, blocks, theme, global_blocks } = pageData;

  const headContent = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    ${meta_description ? `<meta name="description" content="${escapeHtml(meta_description)}">` : ''}
    <style>${generateThemeCSS(theme)}</style>
  `;

  const bodyContent = `
    ${global_blocks?.header ? renderBlock(global_blocks.header) : ''}
    <main>
      ${blocks.map(block => renderBlock(block)).join('\n')}
    </main>
    ${global_blocks?.footer ? renderBlock(global_blocks.footer) : ''}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${headContent}
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

/**
 * Render individual block
 */
function renderBlock(block: ResolvedBlock): string {
  const { type, props, styles, children } = block;

  // Render based on block type
  switch (type) {
    case 'hero':
      return renderHeroBlock(props, styles);
    case 'features':
      return renderFeaturesBlock(props, styles);
    case 'contact-form':
      return renderContactFormBlock(props, styles);
    case 'pricing':
      return renderPricingBlock(props, styles);
    case 'footer':
      return renderFooterBlock(props, styles);
    default:
      console.warn(`Unknown block type: ${type}`);
      return `<div data-block-type="${type}"><!-- Unknown block type --></div>`;
  }
}

/**
 * Hero block renderer
 */
function renderHeroBlock(props: Record<string, any>, styles?: Record<string, any>): string {
  const { headline, subheadline, ctaText, ctaUrl, backgroundImage, alignment = 'center' } = props;

  const bgStyle = backgroundImage
    ? `background-image: url('${escapeHtml(backgroundImage)}'); background-size: cover; background-position: center;`
    : '';

  return `
    <section class="hero" style="text-align: ${alignment}; ${bgStyle} padding: 4rem 1rem; min-height: 500px; display: flex; align-items: center; justify-content: center;">
      <div class="hero-content" style="max-width: 800px;">
        <h1 style="font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); margin-bottom: 1rem;">
          ${escapeHtml(headline)}
        </h1>
        ${subheadline ? `<p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); margin-bottom: 2rem;">${escapeHtml(subheadline)}</p>` : ''}
        ${ctaText && ctaUrl ? `<a href="${escapeHtml(ctaUrl)}" class="btn btn-primary">${escapeHtml(ctaText)}</a>` : ''}
      </div>
    </section>
  `;
}

/**
 * Features block renderer
 */
function renderFeaturesBlock(props: Record<string, any>, styles?: Record<string, any>): string {
  const { title, subtitle, items = [], columns = 3 } = props;

  return `
    <section class="features" style="padding: 4rem 1rem;">
      <div class="container">
        ${title ? `<h2 style="text-align: center; font-size: var(--font-size-3xl); margin-bottom: 1rem;">${escapeHtml(title)}</h2>` : ''}
        ${subtitle ? `<p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 3rem;">${escapeHtml(subtitle)}</p>` : ''}
        <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          ${items.map((item: any) => `
            <div class="feature-item" style="text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${item.icon || ''}</div>
              <h3 style="font-size: var(--font-size-xl); margin-bottom: 0.5rem;">${escapeHtml(item.title)}</h3>
              <p style="color: var(--color-text-secondary);">${escapeHtml(item.description)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Contact form block renderer
 */
function renderContactFormBlock(props: Record<string, any>, styles?: Record<string, any>): string {
  const { title, submitText, fields = [] } = props;

  return `
    <section class="contact-form" style="padding: 4rem 1rem;">
      <div class="container" style="max-width: 600px; margin: 0 auto;">
        ${title ? `<h2 style="text-align: center; margin-bottom: 2rem;">${escapeHtml(title)}</h2>` : ''}
        <form method="POST" action="/api/submit-form" style="display: flex; flex-direction: column; gap: 1rem;">
          ${fields.map((field: any) => {
            if (field.type === 'textarea') {
              return `
                <div>
                  <label style="display: block; margin-bottom: 0.5rem;">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>
                  <textarea name="${escapeHtml(field.name)}" ${field.required ? 'required' : ''} style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--border-radius-base);"></textarea>
                </div>
              `;
            }
            return `
              <div>
                <label style="display: block; margin-bottom: 0.5rem;">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>
                <input type="${escapeHtml(field.type)}" name="${escapeHtml(field.name)}" ${field.required ? 'required' : ''} style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--border-radius-base);">
              </div>
            `;
          }).join('')}
          <button type="submit" class="btn btn-primary">${escapeHtml(submitText)}</button>
        </form>
      </div>
    </section>
  `;
}

/**
 * Pricing block renderer
 */
function renderPricingBlock(props: Record<string, any>, styles?: Record<string, any>): string {
  const { title, subtitle, plans = [] } = props;

  return `
    <section class="pricing" style="padding: 4rem 1rem;">
      <div class="container">
        ${title ? `<h2 style="text-align: center; font-size: var(--font-size-3xl); margin-bottom: 1rem;">${escapeHtml(title)}</h2>` : ''}
        ${subtitle ? `<p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 3rem;">${escapeHtml(subtitle)}</p>` : ''}
        <div class="pricing-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
          ${plans.map((plan: any) => `
            <div class="pricing-card" style="border: 1px solid var(--color-border); border-radius: var(--border-radius-lg); padding: 2rem; ${plan.highlighted ? 'border-color: var(--color-primary); box-shadow: var(--shadow-lg);' : ''}">
              <h3 style="font-size: var(--font-size-2xl); margin-bottom: 1rem;">${escapeHtml(plan.name)}</h3>
              <div style="font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); margin-bottom: 0.5rem;">
                ${escapeHtml(plan.price)}<span style="font-size: var(--font-size-base); font-weight: normal;">${escapeHtml(plan.period)}</span>
              </div>
              <ul style="list-style: none; padding: 0; margin: 2rem 0;">
                ${plan.features.map((feature: string) => `<li style="padding: 0.5rem 0;">✓ ${escapeHtml(feature)}</li>`).join('')}
              </ul>
              <a href="${escapeHtml(plan.ctaUrl)}" class="btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}" style="width: 100%; text-align: center; display: block;">${escapeHtml(plan.ctaText)}</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Footer block renderer
 */
function renderFooterBlock(props: Record<string, any>, styles?: Record<string, any>): string {
  const { companyName, copyright, links = [], socialLinks = [] } = props;

  return `
    <footer style="background: var(--color-surface); padding: 3rem 1rem 1rem; border-top: 1px solid var(--color-border);">
      <div class="container" style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
          <div>
            <h3 style="font-weight: var(--font-weight-bold); margin-bottom: 1rem;">${escapeHtml(companyName)}</h3>
            ${socialLinks.map((link: any) => `
              <a href="${escapeHtml(link.url)}" style="margin-right: 1rem;">${escapeHtml(link.platform)}</a>
            `).join('')}
          </div>
          <div>
            ${links.map((link: any) => `
              <a href="${escapeHtml(link.url)}" style="display: block; margin-bottom: 0.5rem; color: var(--color-text-secondary);">${escapeHtml(link.label)}</a>
            `).join('')}
          </div>
        </div>
        <div style="text-align: center; padding-top: 2rem; border-top: 1px solid var(--color-border); color: var(--color-text-secondary);">
          ${escapeHtml(copyright)}
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generate CSS from theme
 */
function generateThemeCSS(theme: any): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-border: ${theme.colors.border};
      --color-error: ${theme.colors.error};
      --color-success: ${theme.colors.success};

      --font-family-heading: ${theme.typography.fontFamily.heading};
      --font-family-body: ${theme.typography.fontFamily.body};

      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      --font-size-3xl: ${theme.typography.fontSize['3xl']};
      --font-size-4xl: ${theme.typography.fontSize['4xl']};

      --font-weight-normal: ${theme.typography.fontWeight.normal};
      --font-weight-medium: ${theme.typography.fontWeight.medium};
      --font-weight-semibold: ${theme.typography.fontWeight.semibold};
      --font-weight-bold: ${theme.typography.fontWeight.bold};

      --border-radius-sm: ${theme.borderRadius.sm};
      --border-radius-base: ${theme.borderRadius.base};
      --border-radius-lg: ${theme.borderRadius.lg};
      --border-radius-full: ${theme.borderRadius.full};

      --shadow-sm: ${theme.shadows.sm};
      --shadow-base: ${theme.shadows.base};
      --shadow-lg: ${theme.shadows.lg};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-family-body);
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-background);
      line-height: 1.6;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-family-heading);
      line-height: 1.2;
    }

    .container {
      max-width: ${theme.spacing.container.maxWidth};
      margin: 0 auto;
      padding: ${theme.spacing.container.padding};
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius-base);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-background);
    }
  `;
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 404 Page
 */
function render404Page(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .error { text-align: center; }
    h1 { font-size: 4rem; margin: 0; color: #111827; }
    p { font-size: 1.25rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="error">
    <h1>404</h1>
    <p>Page not found</p>
  </div>
</body>
</html>`;
}

/**
 * 500 Page
 */
function render500Page(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 - Internal Error</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .error { text-align: center; }
    h1 { font-size: 4rem; margin: 0; color: #ef4444; }
    p { font-size: 1.25rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="error">
    <h1>500</h1>
    <p>Something went wrong</p>
  </div>
</body>
</html>`;
}

/**
 * Unpublished site page
 */
function renderUnpublishedPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Not Published</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .error { text-align: center; }
    h1 { font-size: 2rem; margin: 0; color: #111827; }
    p { font-size: 1.125rem; color: #6b7280; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Site Not Published</h1>
    <p>This site hasn't been published yet.</p>
  </div>
</body>
</html>`;
}

export default app;

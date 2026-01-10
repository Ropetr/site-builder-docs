/**
 * Publish Worker - Queue Consumer
 * Processes publish/rollback jobs and uploads to R2
 */

import type { PageData, Theme, Block } from '@site-builder/shared';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SITES: R2Bucket;
}

interface PublishJob {
  type: 'publish_site' | 'rollback_site';
  versionId: string;
  siteId: string;
  tenantId: string;
  userId: string;
}

export default {
  async queue(batch: MessageBatch<PublishJob>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const job = message.body;

        if (job.type === 'publish_site') {
          await publishSite(job, env);
        } else if (job.type === 'rollback_site') {
          await rollbackSite(job, env);
        }

        message.ack();
      } catch (error) {
        console.error('Job failed:', error);
        message.retry();
      }
    }
  },
};

/**
 * Publish site to R2
 */
async function publishSite(job: PublishJob, env: Env) {
  const { versionId, siteId } = job;

  console.log(`Publishing site ${siteId}, version ${versionId}`);

  // 1. Get publish version
  const version = await env.DB
    .prepare('SELECT * FROM publish_versions WHERE id = ?')
    .bind(versionId)
    .first();

  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }

  // 2. Get site details
  const site = await env.DB
    .prepare('SELECT * FROM sites WHERE id = ?')
    .bind(siteId)
    .first();

  if (!site) {
    throw new Error(`Site ${siteId} not found`);
  }

  // 3. Get theme
  const theme = await env.DB
    .prepare('SELECT * FROM themes WHERE id = ?')
    .bind(site.theme_id || 'theme-default')
    .first();

  const themeConfig = theme ? JSON.parse(theme.config as string) : getDefaultTheme();

  // 4. Get blocks definitions
  const blocks = await env.DB
    .prepare('SELECT * FROM blocks')
    .all();

  const blocksMap = new Map<string, Block>();
  for (const block of blocks.results) {
    blocksMap.set(block.id as string, {
      id: block.id as string,
      type: block.type as string,
      category: block.category as any,
      name: block.name as string,
      schema: JSON.parse(block.schema as string),
      default_props: JSON.parse(block.default_props as string),
      created_at: block.created_at as number,
      updated_at: block.updated_at as number,
    });
  }

  // 5. Process pages from snapshot
  const pagesSnapshot = JSON.parse(version.pages_snapshot as string);

  for (const page of pagesSnapshot) {
    const pageContent = typeof page.content === 'string'
      ? JSON.parse(page.content)
      : page.content;

    // Build PageData for runtime
    const pageData: PageData = {
      slug: page.slug,
      title: page.title,
      meta_description: page.meta_description,
      blocks: pageContent.blocks.map((b: any) => resolveBlock(b, blocksMap)),
      theme: themeConfig,
    };

    // Upload to R2
    const key = `${siteId}/${versionId}${page.slug === 'index' ? '/index' : '/' + page.slug}.json`;
    await env.SITES.put(key, JSON.stringify(pageData), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });

    console.log(`Uploaded page: ${key}`);
  }

  // 6. Update version status to published
  const now = Math.floor(Date.now() / 1000);
  await env.DB
    .prepare('UPDATE publish_versions SET status = ?, published_at = ? WHERE id = ?')
    .bind('published', now, versionId)
    .run();

  // 7. Update KV cache for runtime lookup
  await env.CACHE.put(`site:${siteId}:published`, versionId);

  console.log(`Site ${siteId} published successfully!`);
}

/**
 * Rollback site to previous version
 */
async function rollbackSite(job: PublishJob, env: Env) {
  const { versionId, siteId } = job;

  console.log(`Rolling back site ${siteId} to version ${versionId}`);

  // Just update the KV cache pointer to the old version
  // The R2 files are already there from previous publish
  await env.CACHE.put(`site:${siteId}:published`, versionId);

  console.log(`Site ${siteId} rolled back to version ${versionId}`);
}

/**
 * Resolve block instance to ResolvedBlock
 */
function resolveBlock(block: any, blocksMap: Map<string, Block>): any {
  const blockDef = blocksMap.get(block.block_id);

  if (!blockDef) {
    console.warn(`Block definition not found: ${block.block_id}`);
    return {
      type: 'unknown',
      props: block.props || {},
    };
  }

  return {
    type: blockDef.type,
    props: block.props || blockDef.default_props,
    styles: block.styles,
    children: block.children?.map((c: any) => resolveBlock(c, blocksMap)),
  };
}

/**
 * Default theme fallback
 */
function getDefaultTheme(): Theme {
  return {
    id: 'theme-default',
    name: 'Default Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      success: '#10b981',
    },
    typography: {
      fontFamily: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    spacing: {
      unit: 4,
      container: {
        maxWidth: '1280px',
        padding: '1rem',
      },
    },
    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    created_at: Date.now(),
    updated_at: Date.now(),
  };
}

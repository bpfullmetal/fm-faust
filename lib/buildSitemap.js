import { getGraphqlEndpoint } from '@faustwp/core';
import { getFrontendUrl } from './getFrontendUrl';

const SITEMAP_PAGES_QUERY = `
  query SitemapPages {
    pages(first: 100, where: { status: PUBLISH }) {
      nodes {
        uri
        modified
      }
    }
  }
`;

const SITEMAP_PROJECTS_QUERY = `
  query SitemapProjects($after: String) {
    projects(first: 100, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        uri
        modified
      }
    }
  }
`;

/** Next.js routes not guaranteed from WP pages query (or worth pinning explicitly). */
const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: 1 },
  { path: '/work', changefreq: 'weekly', priority: 0.9 },
  { path: '/about', changefreq: 'monthly', priority: 0.8 },
  { path: '/contact', changefreq: 'monthly', priority: 0.7 },
  { path: '/press', changefreq: 'weekly', priority: 0.7 },
];

async function fetchGraphql(query, variables = {}) {
  const endpoint = getGraphqlEndpoint();
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL sitemap request failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'GraphQL sitemap query error');
  }

  return json.data;
}

function normalizePath(uri) {
  if (!uri || uri === '/') return '/';
  const trimmed = String(uri).replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function toAbsoluteUrl(frontendUrl, path) {
  const base = frontendUrl.replace(/\/$/, '');
  if (path === '/') return `${base}/`;
  return `${base}${path}`;
}

function formatLastmod(modified) {
  if (!modified) return null;
  const date = new Date(modified);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  let entry = `<url><loc>${escapeXml(loc)}</loc>`;
  if (lastmod) entry += `<lastmod>${escapeXml(lastmod)}</lastmod>`;
  if (changefreq) entry += `<changefreq>${changefreq}</changefreq>`;
  if (priority != null) entry += `<priority>${priority}</priority>`;
  entry += '</url>';
  return entry;
}

export async function buildSitemapXml(req) {
  const frontendUrl = getFrontendUrl(req);
  const urlMap = new Map();

  const addUrl = (path, meta = {}) => {
    const normalized = normalizePath(path);
    if (
      normalized.startsWith('/preview') ||
      normalized.startsWith('/api/')
    ) {
      return;
    }

    const loc = toAbsoluteUrl(frontendUrl, normalized);
    const existing = urlMap.get(loc);
    urlMap.set(loc, {
      loc,
      lastmod: meta.lastmod || existing?.lastmod || null,
      changefreq: meta.changefreq || existing?.changefreq,
      priority: meta.priority ?? existing?.priority,
    });
  };

  for (const page of STATIC_PATHS) {
    addUrl(page.path, {
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  const pagesData = await fetchGraphql(SITEMAP_PAGES_QUERY);
  for (const node of pagesData?.pages?.nodes || []) {
    addUrl(node.uri, { lastmod: formatLastmod(node.modified) });
  }

  let projectsAfter = null;
  let hasMoreProjects = true;

  while (hasMoreProjects) {
    const data = await fetchGraphql(SITEMAP_PROJECTS_QUERY, {
      after: projectsAfter,
    });

    for (const node of data?.projects?.nodes || []) {
      addUrl(node.uri, {
        lastmod: formatLastmod(node.modified),
        changefreq: 'monthly',
        priority: 0.8,
      });
    }

    hasMoreProjects = Boolean(data?.projects?.pageInfo?.hasNextPage);
    projectsAfter = data?.projects?.pageInfo?.endCursor || null;
  }

  const urls = Array.from(urlMap.values()).sort((a, b) =>
    a.loc.localeCompare(b.loc)
  );

  const body = urls.map(buildUrlEntry).join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

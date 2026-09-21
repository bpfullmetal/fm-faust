/**
 * Public site URL for the headless frontend (not the WordPress backend).
 * Used by sitemap.xml and robots.txt.
 */
export function getFrontendUrl(req) {
  const fromEnv =
    process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (req?.headers) {
    const protocol =
      req.headers['x-forwarded-proto']?.split(',')[0]?.trim() || 'https';
    const host =
      req.headers['x-forwarded-host']?.split(',')[0]?.trim() ||
      req.headers.host;

    if (host) {
      return `${protocol}://${host}`;
    }
  }

  return 'http://localhost:3000';
}

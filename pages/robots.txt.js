import { getFrontendUrl } from '../lib/getFrontendUrl';

export default function Robots() {
  return null;
}

export function getServerSideProps({ req, res }) {
  const frontendUrl = getFrontendUrl(req);

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /preview',
    'Disallow: /api/',
    '',
    `Sitemap: ${frontendUrl}/sitemap.xml`,
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.write(body);
  res.end();

  return { props: {} };
}

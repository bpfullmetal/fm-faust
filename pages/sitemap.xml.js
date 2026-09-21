import '../faust.config';
import { buildSitemapXml } from '../lib/buildSitemap';

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ req, res }) {
  try {
    const xml = await buildSitemapXml(req);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    res.statusCode = 500;
    res.end();
  }

  return { props: {} };
}

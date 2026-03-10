const { withFaust, getWpHostname } = require('@faustwp/core');
const { createSecureHeaders } = require('next-secure-headers');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['node_modules'],
  },
  async redirects() {
    return [
      {
        source: '/about-1',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about-2-1',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/#/project',
        destination: '/project/one-girl-cookies-ii',
        permanent: true,
      },
      {
        source: '/#/west-end-avenue',
        destination: '/project/west-end-ave',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-1',
        destination: '/project/upper-west-side-studio',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-4-2-1-1',
        destination: '/project/upper-west-side-apartment',
        permanent: true,
      },
      {
        source: '/#/tribeca-loft',
        destination: '/project/tribeca-loft',
        permanent: true,
      },
      {
        source: '/#/robert-marc-showroom',
        destination: '/project/robert-marc-showroom',
        permanent: true,
      },
      {
        source: '/#/prospect-park-south',
        destination: '/project/prospect-park-south-home',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-2',
        destination: '/projects/pound-ridge-pool-house',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-2-1',
        destination: '/project/philbrook-pavillion',
        permanent: true,
      },
      {
        source: '/#/park-slope-townhouse',
        destination: '/project/park-slope-townhouse',
        permanent: true,
      },
      {
        source: '/#/berlinnewyorkdialogues-1-1',
        destination: '/project/one-girl-cookies',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-4-2-1-2',
        destination: '/project/morton-square-penthouse',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-5-1',
        destination: '/project/meat-packing-loft',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-3-2',
        destination: '/project/leroy-street-roof',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-3-1',
        destination: '/project/kids-of-kathmandu',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-3-1-2',
        destination: '/project/high-rise-pied-a-terre',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-3-1',
        destination: '/project/greenwich-village-townhouse',
        permanent: true,
      },
      {
        source: '/#/pound-ridge-2-3',
        destination: '/project/flat-iron-loft',
        permanent: true,
      },
      {
        source: '/#/chelsea-apartment',
        destination: '/project/chelsea-apartment',
        permanent: true,
      },
      {
        source: '/#/bond-st-townhouse',
        destination: '/project/bond-st-townhouse',
        permanent: true,
      },
      {
        source: '/#/boerum-hill-duplex',
        destination: '/project/boerum-hill-upper-duplex',
        permanent: true,
      },
      {
        source: '/#/boerum-hill-duplex-1',
        destination: '/project/boerum-hill-lower-duplex',
        permanent: true,
      },
      {
        source: '/#/bethune-street-townhouse',
        destination: '/project/bethune-street-townhouse',
        permanent: true,
      },
      {
        source: '/#/berlinnewyorkdialogues',
        destination: '/project/berlin-new-york-dialogues',
        permanent: true,
      },
      {
        source: '/#/berlinnewyorkdialogues-1',
        destination: '/project/195-hudson-street-lobby',
        permanent: true,
      }
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: getWpHostname() },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  async headers() {
    return [{ source: '/:path*', headers: createSecureHeaders({
      xssProtection: false
    }) }];
  },
});

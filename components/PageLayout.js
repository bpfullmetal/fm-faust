import * as React from 'react';
import { useQuery, gql } from '@apollo/client';
import Head from 'next/head';
import {BookConsultation, Footer, Header} from './';
// import SEO from './SEO';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment, FmSettingsFragment, NavigationMenuItemFragment } from '../fragments';

export const PageLayout = ({ className, children, options = {}, pageData = null, pageTitle }) => {
  const { data } = useQuery(PageLayout.query, {
    variables: PageLayout.variables(),
  });

  // const { title: siteTitle, description: siteDescription } =
  //   data?.generalSettings;
  const fmSettings = data?.settings?.fmSettings;
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];

  const description = pageData?.excerpt ? pageData.excerpt().replace(/<[^>]*>?/gm, '').trim() : null

  return (
    <>
      {/* {
        pageData && (
          <SEO
            title={pageData?.title()}
            description={ description }
            image={ pageData?.featuredImage ? pageData.featuredImage.node.mediaItemUrl : null }
            url={pageData?.uri}
          />
        )
      }

      <Head>
        <title>{`${pageTitle} - Frances Mildred`}</title>
      </Head> */}

      {!options.hiddenHeader && <Header menuItems={primaryMenu} options={options} />}

      <main className={className}>
        {children}

        {(!options.hiddenBookSection && fmSettings) && <BookConsultation fmSettings={fmSettings} />}
      </main>

      <Footer fmSettings={fmSettings} menuItems={footerMenu} />
    </>
  );
};

PageLayout.query = gql`
  ${BlogInfoFragment}
  ${FmSettingsFragment}
  ${NavigationMenuItemFragment}
  query GetLayout(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    generalSettings {
      ...BlogInfoFragment
    }
    settings {
      ...FmSettingsFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`

PageLayout.variables = () => {
  return {
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
  };
};

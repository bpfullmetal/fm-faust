import * as React from 'react';
import { useQuery, gql } from '@apollo/client';
import {BookConsultation, Footer, Header} from './';
import { SEO } from './SEO';
import * as MENUS from '../constants/menus';
import { FmSettingsFragment, NavigationMainMenuItemFragment } from '../fragments';

export const PageLayout = ({ className, children, options = {}, pageData = null }) => {
  const { data } = useQuery(PageLayout.query, {
    variables: PageLayout.variables(),
  });
  
  const fmSettings = data?.settings?.fmSettings;
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];

  const description = pageData?.excerpt ? pageData.excerpt.replace(/<[^>]*>?/gm, '').trim() : null

  const layout = (
    <>
      {!options.hiddenHeader && <Header menuItems={primaryMenu} options={options} />}

      <main className={className}>
        {children}

        {(!options.hiddenBookSection && fmSettings) && <BookConsultation fmSettings={fmSettings} />}
      </main>

      <Footer
        fmSettings={fmSettings}
        menuItems={footerMenu}
        fillRemaining={options.fillFooter}
      />
    </>
  );

  return (
    <>
      {
        pageData && (
          <SEO
            title={pageData?.title}
            description={ description }
            imageUrl={ pageData?.featuredImage ? pageData.featuredImage.node.mediaItemUrl : null }
            url={pageData?.uri}
          />
        )
      }

      {options.fillFooter ? (
        <div className="flex w-full flex-col min-h-screen">{layout}</div>
      ) : (
        layout
      )}
    </>
  );
};

PageLayout.query = gql`
  ${FmSettingsFragment}
  ${NavigationMainMenuItemFragment}
  query GetLayout(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    settings {
      ...FmSettingsFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMainMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMainMenuItemFragment
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

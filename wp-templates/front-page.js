import React from 'react';
import { useQuery, gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { NavigationMenuItemFragment } from '../fragments';
import { Header, PageLayout } from '../components';
import {
  BlockLogoBanner,
  BlockFeaturedContent,
  BlockFeaturedProject,
  BlockProjectsCarousel,
} from '../components/Blocks';

export default function Component() {
  const { data } = useQuery(Component.query, {
    variables: Component.variables(),
  });

  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const editorBlocks = data?.page?.editorBlocks ?? [];

  const [shouldRenderHeader, setShouldRenderheader] = React.useState(false);

  React.useEffect(() => {
    if ( editorBlocks.length ) {
      const hasHeader = editorBlocks.find(
        block => block.__typename === 'AcfHeaderNav'
      )
      if ( hasHeader) {
        setShouldRenderheader(false)
      }
    }
  }, [])

  return (
    <PageLayout
      pageData={data.page}
      className="default-page"
      options={{
        hiddenHeader: !shouldRenderHeader,
        currentURI: data.page?.uri,
      }}
    >
      {editorBlocks && (
        <div>
          {editorBlocks.map((block, i) => {
            switch (block.__typename) {
              case 'AcfLogoBanner':
                return (
                  <BlockLogoBanner
                    key={`${block.__typename}-${i}`}
                    data={block.blockLogoBanner}
                  />
                );
              case 'AcfFeaturedProject':
                if (!block.blockFeaturedProjects) {
                  return <React.Fragment key={`${block.__typename}-${i}`}></React.Fragment>
                }
                return (
                  <BlockFeaturedProject
                    key={`${block.__typename}-${i}`}
                    data={block.blockFeaturedProjects}
                  />
                );
              case 'AcfFeaturedContent':
                if (!block.blockFeaturedContent) {
                  return <React.Fragment key={`${block.__typename}-${i}`}></React.Fragment>
                }
                return (
                  <BlockFeaturedContent
                    key={`${block.__typename}-${i}`}
                    data={block.blockFeaturedContent}
                  />
                );
              case 'AcfProjectsCarousel':
                if (!block.blockProjectsCarousel) {
                  return <React.Fragment key={`${block.__typename}-${i}`}></React.Fragment>
                }
                return (
                  <BlockProjectsCarousel
                    key={`${block.__typename}-${i}`}
                    data={block.blockProjectsCarousel}
                  />
                );
              case 'AcfHeaderNav':
                return (
                  <Header
                    key={`${block.__typename}-${i}`}
                    menuItems={primaryMenu}
                  />
                );
              default:
                return (
                  <div
                    key={`${block.__typename}-${i}`}
                    dangerouslySetInnerHTML={{
                      __html: block.renderedHtml,
                    }}
                  ></div>
                );
            }
          })}
        </div>
      )}
    </PageLayout>
  );
}

Component.query = gql`
  ${NavigationMenuItemFragment}
  query GetPageData(
    $id: ID!
    $headerLocation: MenuLocationEnum
  ) {
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    page(id: $id) {
      id
      title
      uri
      featuredImage {
        node {
          mediaItemUrl
        }
      }
      editorBlocks {
        renderedHtml
        __typename
        ... on AcfLogoBanner {
          blockLogoBanner {
            backgroundImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
            backgroundVideo {
              node {
                mediaItemUrl
              }
            }
          }
        }
        ... on AcfHeaderNav {
          apiVersion
        }
        ... on AcfFeaturedProject {
          blockFeaturedProjects {
            projects {
              backgroundImage {
                node {
                  altText
                  sourceUrl
                  mediaDetails {
                    width
                    height
                  }
                }
              }
              description
              link {
                target
                title
                url
              }
              project {
                nodes {
                  ... on Project {
                    id
                    featuredImage {
                      node {
                        altText
                        sourceUrl
                        mediaDetails {
                          width
                          height
                        }
                      }
                    }
                    title
                    link
                  }
                }
              }
            }
          }
        }
        ... on AcfFeaturedContent {
          blockFeaturedContent {
            content {
              contentType
              imageBlock {
                image {
                  node {
                    altText
                    sourceUrl
                    mediaDetails {
                      width
                      height
                    }
                  }
                }
                link {
                  target
                  title
                  url
                }
              }
              text
            }
            title
          }
        }
        ... on AcfProjectsCarousel {
          blockProjectsCarousel {
            manualSelection
          }
        }
      }
    }
  }
`;

Component.variables = () => {
  return {
    headerLocation: MENUS.PRIMARY_LOCATION,
    id: 'cG9zdDo3NjU=',
  };
};

// ... on AcfProjectsCarousel {
//   blockProjectsCarousel {
//     manualSelection
//     projects {
//       image {
//         node {
//           altText
//           sourceUrl
//           mediaDetails {
//             width
//             height
//           }
//         }
//       }
//       project {
//         nodes {
//           ... on Project {
//             id
//             projectSingleAlternateImages {
//               verticalImage {
//                 node {
//                   altText
//                   sourceUrl
//                   mediaDetails {
//                     width
//                     height
//                   }
//                 }
//               }
//             }
//             featuredImage {
//               node {
//                 altText
//                 sourceUrl
//                 mediaDetails {
//                   width
//                   height
//                 }
//               }
//             }
//             link
//             title
//           }
//         }
//       }
//       title
//     }
//     projectsMax
//     title
//   }
// }
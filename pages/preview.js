import React from 'react';
import { gql } from '@apollo/client';
import { getApolloAuthClient, useAuth } from '@faustwp/core';
import { PageLayout } from '../components';
import ProjectContent from '../components/Project/ProjectContent';

export default function Preview({ previewId }) {
  const { isAuthenticated, isReady, loginUrl } = useAuth();
  const client = getApolloAuthClient();
  const id = previewId ? parseInt(previewId, 10) : null;
  const isPreview = true;

  const scrollContainerRef = React.useRef();
  const [previewProject, setPreviewProject] = React.useState();

  if (!isAuthenticated && loginUrl) {
    location.href = loginUrl;
  }

  if (id && isAuthenticated && isReady) {
    client
      .query({
        query: gqlquery,
        variables: {
          id,
          idType: isPreview ? 'DATABASE_ID' : 'URI',
          asPreview: isPreview,
        },
      })
      .then(({ data }) => {
        setPreviewProject(data.contentNode);
      });
  }

  return (
    <PageLayout
      options={{ currentURI: '/work/', scrollIndicator: scrollContainerRef }}
      pageData={previewProject}
    >
      {previewProject ? (
        <ProjectContent
          project={previewProject}
          scrollContainerRef={scrollContainerRef}
          isPreview
        />
      ) : (
        <div className="h-screen"></div>
      )}
    </PageLayout>
  );
}

const gqlquery = gql`
  query GetContentNode(
    $id: ID!
    $idType: ContentNodeIdTypeEnum!
    $asPreview: Boolean!
  ) {
    contentNode(id: $id, idType: $idType, asPreview: $asPreview) {
      ... on Project {
        title
        editorBlocks {
          name
          clientId
          blockEditorCategoryName
          ... on CoreColumns {
            anchor
            apiVersion
            name
            attributes {
              align
              verticalAlignment
              isStackedOnMobile
              cssClassName
              layout
              style
            }
            innerBlocks {
              blockEditorCategoryName
              ... on CoreImage {
                anchor
                apiVersion
                attributes {
                  id
                }
                mediaDetails {
                  file
                  filePath
                  height
                  width
                }
                name
              }
              ... on CoreColumn {
                anchor
                apiVersion
                name
                attributes {
                  cssClassName
                  width
                  verticalAlignment
                  layout
                  style
                }
                innerBlocks {
                  ... on CoreImage {
                    mediaDetails {
                      filePath
                      height
                      width
                      file
                    }
                    attributes {
                      id
                    }
                    name
                  }
                  ... on CoreParagraph {
                    attributes {
                      align
                      content
                      cssClassName
                      style
                    }
                    name
                  }
                }
              }
            }
          }
        }
        projectsSingle {
          projectDetails {
            attributes {
              label
              attributeListings {
                link
                title
              }
            }
            label
          }
          projectImages {
            description
            image {
              node {
                altText
                mediaItemUrl
                mediaDetails {
                  width
                  height
                }
              }
            }
            video {
              node {
                altText
                mediaItemUrl
                mediaDetails {
                  height
                  width
                }
              }
            }
          }
        }
        featuredImage {
          node {
            altText
            mediaDetails {
              height
              width
            }
            mediaItemUrl
          }
        }
        projectSingleAlternateImages {
          verticalImage {
            node {
              altText
              mediaItemUrl
              mediaDetails {
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

export async function getServerSideProps(ctx) {
  return {
    props: {
      previewId: ctx.query?.p ?? null,
    },
  };
}

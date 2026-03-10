import React from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import ProjectContent from '../../../components/Project/ProjectContent';
import { NotFoundProject, PageLayout } from '../../../components';

export default function Page(props) {
  const { query } = useRouter();
  const projectUri = query.projectSlug;

  const scrollContainerRef = React.useRef();

  const { data, loading } = useQuery(gqlquery, {
    variables: { id: `/project/${projectUri}/` },
  });

  const project = data?.project;

  if (!loading && !project) {
    return <NotFoundProject />
  }

  return (
    <PageLayout
      options={{ currentURI: '/work/', scrollIndicator: scrollContainerRef }}
      pageData={project}
    >
      {project ? (
        <ProjectContent
          project={project}
          scrollContainerRef={scrollContainerRef}
        />
      ) : (
        <div className="h-screen"></div>
      )}
    </PageLayout>
  );
}

const gqlquery = gql`
  query GetProjectData($id: ID!) {
    project(id: $id, idType: URI) {
      uri
      title
      date
      id
      content
      excerpt
      featuredImage {
        node {
          mediaItemUrl
          altText
        }
      }
      editorBlocks {
        name
        clientId
        blockEditorCategoryName
        ... on FreeformLayoutFreeformLayout {
          apiVersion
          blockEditorCategoryName
          # attributes {
          #   activeBreakpoint
          #   className
          #   layout
          #   lock
          #   metadata
          # }
        }
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
                    content
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
            attributeListings {
              link
              title
            }
            label
          }
          label
        }
        projectImages {
          description
          image {
            node {
              id
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
              mediaItemUrl
            }
          }
        }
      }
    }
  }
`;

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, { Page });
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

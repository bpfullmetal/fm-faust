import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import ProjectContent from '../../../components/Project/ProjectContent';
import { NotFoundProject, PageLayout } from '../../../components';

export default function Page({ projectSlug }) {
  const scrollContainerRef = React.useRef();
  const projectUri = Array.isArray(projectSlug) ? projectSlug[0] : projectSlug;

  const { data, loading } = useQuery(gqlquery, {
    skip: !projectUri,
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

export async function getStaticProps(ctx) {
  const faustProps = await getNextStaticProps(ctx, { Page });
  const projectSlug = Array.isArray(ctx.params?.projectSlug)
    ? ctx.params.projectSlug[0]
    : ctx.params?.projectSlug ?? null;

  return {
    ...faustProps,
    props: {
      ...faustProps.props,
      projectSlug,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

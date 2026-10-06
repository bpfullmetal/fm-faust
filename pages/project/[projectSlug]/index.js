import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import ProjectContent from '../../../components/Project/ProjectContent';
import { PageLayout } from '../../../components';

function projectUriFromSlug(projectSlug) {
  if (!projectSlug) return null;
  const slug = Array.isArray(projectSlug) ? projectSlug[0] : projectSlug;
  return `/project/${slug}/`;
}

export default function Page(props) {
  const scrollContainerRef = React.useRef();
  const projectSlug = Array.isArray(props.projectSlug)
    ? props.projectSlug[0]
    : props.projectSlug;

  const variables =
    props.__PAGE_VARIABLES__ ??
    (projectUriFromSlug(projectSlug)
      ? { id: projectUriFromSlug(projectSlug) }
      : undefined);

  const { data } = useQuery(Page.query, {
    skip: !variables?.id,
    variables,
  });

  const project = data?.project;

  if (!project) {
    return null;
  }

  return (
    <PageLayout
      options={{ currentURI: '/work/', scrollIndicator: scrollContainerRef }}
      pageData={project}
      className="project-page"
    >
      <ProjectContent
        project={project}
        scrollContainerRef={scrollContainerRef}
      />
    </PageLayout>
  );
}

Page.query = gql`
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

Page.variables = (context) => {
  const uri = projectUriFromSlug(context?.params?.projectSlug);
  return uri ? { id: uri } : { id: '' };
};

export async function getStaticProps(ctx) {
  const projectSlug = Array.isArray(ctx.params?.projectSlug)
    ? ctx.params.projectSlug[0]
    : ctx.params?.projectSlug ?? null;

  if (!projectSlug) {
    return { notFound: true };
  }

  const faustProps = await getNextStaticProps(ctx, { Page });

  if ('notFound' in faustProps && faustProps.notFound) {
    return faustProps;
  }

  if ('redirect' in faustProps && faustProps.redirect) {
    return faustProps;
  }

  const project = faustProps.props?.data?.project;
  if (!project) {
    return { notFound: true };
  }

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

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

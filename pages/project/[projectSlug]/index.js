import React from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import ProjectContent from '../../../components/Project/ProjectContent';

export default function Page(props) {
  const { query } = useRouter();

  const projectUri = query.projectSlug;

  const { data } = useQuery(gqlquery, {
    variables: { id: `/project/${projectUri}/`, uri: projectUri },
  });

  const project = data?.project ?? null;
  const nextProjects = data?.projects?.nodes ?? [];

  if (!project) return <></>;

  return (
    <ProjectContent project={project} nextProject={nextProjects.length ? nextProjects[0] : null} />
  );
}

const gqlquery = gql`
  query GetProjectData(
    $id: ID!
    $uri: String!
  ) {
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
          sourceUrl
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
              altText
              sourceUrl
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
    
    projects(after: $uri, where: {orderby: {field: DATE, order: DESC}}) {
      nodes {
        id
        title
        link
        date
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
      }
    }
  }
`;

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page});
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

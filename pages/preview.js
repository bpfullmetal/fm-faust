import React from 'react';
import { usePreview } from '@faustwp/core';
import { useRouter } from 'next/router';
import { getClient, gql, useQuery } from '@apollo/client';
// import ProjectContent from '../../../components/Project/ProjectContent';

export default function Preview(props) {
  const { query } = useRouter();
  const { p: projectId, preview, typeName } = query;

  const previewData = usePreview();

  console.log('previewData: ', previewData)

  const { data } = useQuery(gqlquery, {
    variables: { id: `${projectId}` },
  });

  console.log('data: ', data);

  // const project = data?.project ?? null;
  // const nextProjects = data?.projects?.nodes ?? [];

  return <></>

  if (!project) return <></>;

  return (
    <ProjectContent project={project} nextProject={nextProjects.length ? nextProjects[0] : null} />
  );
}

const gqlquery = gql`
  query GetProjectData(
    $id: ID!
  ) {
    project(id: $id) {
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
  }
`;

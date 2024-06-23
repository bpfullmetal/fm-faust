import React from 'react';
import { gql } from '@apollo/client';
import { getApolloAuthClient, useAuth } from '@faustwp/core';
import { useRouter } from 'next/router';
import ProjectContent from '../components/Project/ProjectContent';

export default function Preview(props) {
  const { isAuthenticated, isReady, loginUrl } = useAuth();
  const { query } = useRouter();
  const client = getApolloAuthClient();

  const id = query.p ? parseInt(query.p) : null;
  const isPreview = true;
  
  const [previewProject, setPreviewProject] = React.useState();

  if (!isAuthenticated && loginUrl) {
    location.href = loginUrl;
  }
  
  if (id && isAuthenticated && isReady) {
    client.query({
      query: gqlquery,
      variables: {
        id,
        idType: isPreview ? 'DATABASE_ID' : 'URI',
        asPreview: isPreview,
      },
    }).then(({ data }) => {
      setPreviewProject(data.contentNode);
    });
  }

  if (!previewProject) return <></>;

  return (
    <ProjectContent project={previewProject} isPreview />
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
      }
    }
  }
`;

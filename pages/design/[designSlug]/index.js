import React from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { DesignPageContent } from '../../../components';

export default function Page(props) {
  const { query } = useRouter();

  const currentCategory = query.designSlug;

  const { data } = useQuery(GET_PAGE_DATA_QUERY);

  const allCategoriesData = data?.categories?.edges ?? [];
  const allProjectsData = data?.projects?.edges ?? [];

  return (
    <DesignPageContent
      allCategoriesData={allCategoriesData}
      allProjectsData={allProjectsData}
      currentCategory={currentCategory}
    />
  );
}

const GET_PAGE_DATA_QUERY = gql`
  query {
    categories(where: {order: ASC, orderby: COUNT}) {
      edges {
        node {
          name
          slug
        }
      }
    }
    projects(first: 20, where: {orderby: {field: DATE, order: DESC}}) {
      edges {
        node {
          id
          featuredImage {
            node {
              altText
              mediaItemUrl
            }
          }
          title
          link
          uri
          projectsSingle {
            projectImages {
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
                  mediaItemUrl
                }
              }
              category {
                nodes {
                  slug
                }
              }
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

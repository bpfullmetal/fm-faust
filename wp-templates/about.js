import React from 'react';
import Image from 'next/image';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { PageLayout } from '../components';
import {
  ByTheNumberBlock,
  OpeningJobItem,
  TeamStudioFeatured,
  TeamStudioItem,
} from '../components/About';
import Helper from '../helper';
// import About from '../pages/about';

export default function Component(props) {
  // const { data, loading, error } = useQuery(Component.query, {
  //   variables: Component.variables(),
  // });

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error.message}</p>;
  // return <About data={data} />
  return <></>
}

Component.query = gql`
  query GetPageDataByURI($uri: ID!) {
    page(id: $uri, idType: URI) {
      uri
      pageAbout {
        intro {
          menuName
          introText
          introSubtext
          byTheNumber {
            heading
            metrics {
              count
              metric
            }
          }
          backgroundImage {
            node {
              altText
              mediaItemUrl
            }
          }
          backgroundVideo {
            node {
              mediaItemUrl
            }
          }
        }
        ourTeam {
          description
          menuName
          featuredImage {
            node {
              altText
              mediaItemUrl
            }
          }
          featuredTeamMembers {
            bio
            bioMore
            role
            name
            image {
              node {
                altText
                mediaItemUrl
              }
            }
          }
          teamMembers {
            bio
            bioMore
            name
            role
          }
        }
        studioOpenings {
          menuName
          jobListings {
            active
            applicationLink
            description
            howToApply
            title
          }
          jobsNoListings {
            heading
            textContent
          }
        }
      }
    }
  }
`;

// Page.variables = () => {
//   return {
//     id: 'cG9zdDo1'
//   };
// };

Component.variables = (seedQuery, context, data) => {
  return {
    uri: 'about',
  };
};

// export function getStaticProps(ctx) {
//   return getNextStaticProps(ctx, {Page, props: {title: 'About Page'}});
// }

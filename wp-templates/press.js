import { gql, useQuery } from '@apollo/client';
export default function Component(props) {
  return <></>
}

Component.query = gql`
  query GetPageDataByURI($uri: ID!) {
    page(id: $uri, idType: URI) {
      uri
      title
      pressPageFields {
        pressArticles(first: $first, after: $after) {
          edges {
            node {
              ... on Press {
                id
                title
                pressFields {
                  link
                  publication
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

Component.variables = (seedQuery, context, data) => {
  return {
    uri: 'press',
  };
};

// export function getStaticProps(ctx) {
//   return getNextStaticProps(ctx, {Page, props: {title: 'Press Page'}});
// }


import { gql } from '@apollo/client';

export default function Component(props) {
  return <></>
}

Component.query = gql`
  query GetPageDataByURI($uri: ID!) {
    page(id: $uri, idType: URI) {
      uri
      pressPageFields {
      pressArticles(first: 10) {
        edges {
          node {
            ... on Press {
              id
              pressFields {
                fieldGroupName
                link
                publicatio
              }
            }
          }
          cursor
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
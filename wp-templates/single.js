import { gql } from '@apollo/client';
import { useFaustQuery } from '@faustwp/core';
import { PageLayout } from '../components';

const GET_POST_QUERY = gql`
  query GetPost($databaseId: ID!, $asPreview: Boolean = false) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
      date
      author {
        node {
          name
        }
      }
    }
  }
`;

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { post } = useFaustQuery(GET_POST_QUERY);

  const { content } = post ?? {};

  return (
    <PageLayout
      options={{ currentURI: props?.data?.page?.uri, hiddenBookSection: true }}
      pageData={props?.data?.page}
    >
      <article>
        <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
        {children}
      </article>
    </PageLayout>
  );
}

Component.queries = [
  {
    query: GET_POST_QUERY,
    variables: ({ databaseId }, ctx) => ({
      databaseId,
      asPreview: ctx?.asPreview,
    }),
  },
];

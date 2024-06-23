import { gql } from '@apollo/client';
import { PageLayout } from '../components';

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  return (
    <PageLayout
      options={{ currentURI: props?.data?.page?.uri, hiddenBookSection: true }}
      pageData={props?.data?.page}
    />
  );
}

Component.variables = ({ databaseId }, ctx) => {
  return {
    databaseId,
    asPreview: ctx?.asPreview,
  };
};

Component.query = gql`
  query GetPageData(
    $databaseId: ID!
    $asPreview: Boolean = false
  ) {
    page(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
    }
  }
`;

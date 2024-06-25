import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { PageLayout } from '../../components';

export default function Page(props) {
  const router = useRouter();

  const [pageEntrance, setPageEntrance] = React.useState(false);

  const { data } = useQuery(Page.query);

  const categories = data?.categories?.edges ?? [];

  useEffect(() => {
    setPageEntrance(true);
  }, []);

  if (categories.length) {
    router.push(`/design/${categories[0].node.slug}`);
  }

  return (
    <PageLayout
      className="discover h-screen"
      options={{ currentURI: '/design', hiddenBookSection: true }}
      pageData={{ title: 'Design' }}
    >
      <section className={`w-full h-full bg-dark_blue ${pageEntrance ? 'fade-in' : ''}`}>
      </section>
    </PageLayout>
  );
}

Page.query = gql`
  query {
    categories(first: 1, where: {order: ASC, orderby: COUNT}) {
      edges {
        node {
          name
          slug
        }
      }
    }
  }
`;

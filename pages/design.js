import React from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';

export default function Page(props) {
  const router = useRouter();

  const { data } = useQuery(Page.query);

  const categories = data?.categories?.edges ?? [];

  if (categories.length) {
    router.push(`/design/${categories[0].node.slug}`);
  }

  return (
    <PageLayout options={{ currentURI: '/design', hiddenBookSection: true }} pageData={{ title: 'Design' }} />
  );
}

Page.query = gql`
  query {
    categories(limit: 1, where: {order: ASC, orderby: COUNT}) {
      edges {
        node {
          name
          slug
        }
      }
    }
  }
`;

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page, props: {title: 'Design Page'}});
}

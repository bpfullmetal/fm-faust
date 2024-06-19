import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { PageLayout } from '../components';

export default function Page(props) {
  const { data } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  return (
    <PageLayout options={{ currentURI: data.page.uri, hiddenBookSection: true }} pageData={data.page} />
  );
}

Page.query = gql`
  query GetPageData(
    $id: ID!
  ) {
    page(id: $id) {
      uri
    }
  }
`;

Page.variables = () => {
  return {
    id: 'cG9zdDo5'
  };
};

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page, props: {title: 'Contact Page'}});
}

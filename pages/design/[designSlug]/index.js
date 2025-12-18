// import React from 'react';
// import { useRouter } from 'next/router';
// import { gql, useQuery } from '@apollo/client';
// import { getNextStaticProps } from '@faustwp/core';
// import { DesignPageContent } from '../../../components';

// export default function Page(props) {
//   const { query } = useRouter();

//   const currentCategory = query.designSlug;

//   const { data } = useQuery(GET_PAGE_DATA_QUERY);

//   const allCategoriesData = data?.categories?.edges ?? [];
//   const allProjectsData = data?.projects?.edges ?? [];

//   return (
//     <DesignPageContent
//       allCategoriesData={allCategoriesData}
//       allProjectsData={allProjectsData}
//       currentCategory={currentCategory}
//     />
//   );
// }

// const GET_PAGE_DATA_QUERY = gql`
//   query {
//     categories(where: {order: ASC, orderby: COUNT}) {
//       edges {
//         node {
//           name
//           slug
//         }
//       }
//     }
//     projects(first: 20, where: {orderby: {field: DATE, order: DESC}}) {
//       edges {
//         node {
//           id
//           featuredImage {
//             node {
//               altText
//               mediaItemUrl
//             }
//           }
//           title
//           link
//           uri
//           projectsSingle {
//             projectImages {
//               image {
//                 node {
//                   altText
//                   mediaItemUrl
//                   mediaDetails {
//                     width
//                     height
//                   }
//                 }
//               }
//               video {
//                 node {
//                   mediaItemUrl
//                 }
//               }
//               category {
//                 nodes {
//                   slug
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

// export function getStaticProps(ctx) {
//   return getNextStaticProps(ctx, {Page});
// }

// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: 'blocking',
//   };
// }

import Link from 'next/link'
import { PageLayout } from '../../../components';

const NotFoundPage = () => {
  return (
    <PageLayout className="relative">
      <main className="bg-dark_blue h-screen">
        <section className="relative w-full max-w-main mx-auto px-5 sm:px-12 py-32 sm:py-32">
          <h1 className="text-xl">Oops, this page doesn’t exist.</h1>
          <p>
            View some of our{' '}
            <Link href="/work">
              case studies
            </Link>{' '}
            instead :)
          </p>
        </section>
      </main>
    </PageLayout>
  );
};

export default NotFoundPage;

export const Head = () => <title>Not found</title>;

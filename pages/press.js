import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import Image from 'next/image';
import Link from 'next/link'
import { PageLayout } from '../components';
import Helper from '../helper';

export default function Page(props) {
  const queryVariables = React.useMemo(() => Page.variables(), []);
  const { data, fetchMore } = useQuery(Page.query, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
  });

  console.log('WORDPRESS URL', process.env.NEXT_PUBLIC_WORDPRESS_URL);

  console.log('DATA', data)

  const pressConnection = data?.page?.pressPageFields?.pressArticles;
  const edges = React.useMemo(
    () => pressConnection?.edges ?? [],
    [pressConnection?.edges]
  );

  const endCursor = pressConnection?.pageInfo?.endCursor ?? null;
  const hasNextPage = pressConnection?.pageInfo?.hasNextPage ?? false;

  const postsPerPage = 6;
  const [allPress, setAllPress] = React.useState([]);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [pressRefs, setWorkPressRefs] = React.useState([]);
  const morePressRef = React.useRef();
  const lastRequestedCursorRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);

  React.useEffect(() => {
    if (!edges.length) return;

    setAllPress((currentPress) => {
      if (!currentPress.length) {
        return edges;
      }

      const existingIds = new Set(
        currentPress.map((edge) => edge?.node?.id).filter(Boolean)
      );
      const mergedPress = [...currentPress];

      edges.forEach((edge) => {
        const nodeId = edge?.node?.id;

        if (!nodeId || !existingIds.has(nodeId)) {
          mergedPress.push(edge);

          if (nodeId) {
            existingIds.add(nodeId);
          }
        }
      });

      return mergedPress;
    });

    if (!hasNextPage) {
      lastRequestedCursorRef.current = null;
      isFetchingRef.current = false;
    }
  }, [edges, hasNextPage]);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.getAttribute("data-ref-type") === "press") {
          entry.target.classList.add("reveal");
        }
        if (entry.target.getAttribute("data-ref-type") === "more-press") {
          if (!hasNextPage || !endCursor) return;
          if (isLoadingMore || isFetchingRef.current) return;
          if (lastRequestedCursorRef.current === endCursor) return;

          isFetchingRef.current = true;
          lastRequestedCursorRef.current = endCursor;
          setIsLoadingMore(true);

          fetchMore({
            variables: {
              id: queryVariables.id,
              first: postsPerPage,
              after: endCursor,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              const previousConnection = previousResult?.page?.pressPageFields?.pressArticles;
              const nextConnection = fetchMoreResult?.page?.pressPageFields?.pressArticles;

              if (!previousConnection || !nextConnection?.edges?.length) {
                return previousResult;
              }

              const existingIds = new Set(
                previousConnection.edges.map((edge) => edge?.node?.id).filter(Boolean)
              );
              const mergedEdges = [...previousConnection.edges];

              nextConnection.edges.forEach((edge) => {
                const nodeId = edge?.node?.id;

                if (!nodeId || !existingIds.has(nodeId)) {
                  mergedEdges.push(edge);

                  if (nodeId) {
                    existingIds.add(nodeId);
                  }
                }
              });

              return {
                ...previousResult,
                page: {
                  ...previousResult.page,
                  pressPageFields: {
                    ...previousResult.page.pressPageFields,
                    pressArticles: {
                      ...previousConnection,
                      pageInfo: nextConnection.pageInfo,
                      edges: mergedEdges,
                    },
                  },
                },
              };
            },
          }).finally(() => {
            isFetchingRef.current = false;
            setIsLoadingMore(false);
          });
        }
      }
    });
  };

  const press = allPress;

  React.useEffect(() => {
    if (!allPress.length) return;

    setWorkPressRefs((currentRefs) => {
      if (currentRefs.length >= allPress.length) {
        return currentRefs;
      }

      return [
        ...currentRefs,
        ...Array(allPress.length - currentRefs.length)
          .fill(1)
          .map((_) => React.createRef()),
      ];
    });

    Helper.setupIntersectionObserver(morePressRef, handleIntersection, {
      threshold: 0.5,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPress]);

  React.useEffect(() => {
    pressRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection, {
        threshold: 0.2,
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressRefs]);
  
  return (
    <PageLayout className="press" options={{ currentURI: data?.page?.uri }} pageData={data?.page}>
      <div className="min-h-screen bg-dark_blue">
        <section className="w-full max-w-wide mx-auto px-5 sm:px-12 gap-x-8 py-8">
          <h1 className="text-3xl font-bold text-white block py-8 px-4"> {data?.page?.title} </h1>
          {press.map((article, i) => {
            const isPreload = false;
            return (
              <div
                className={`${
                  isPreload ? '!hidden' : ''
                } press-block${i < postsPerPage ? ' reveal' : ''} animate-reveal text-white text-xl leading-none tracking-[0.4px] sm:text-2xl sm:tracking-[0.48px]${ i === press.length - 1 ? '' : ' border-b border-white' }`}
                key={article.node?.id ?? `press-${i}`}
                data-ref-type="press"
                data-title={article.node.title}
                ref={pressRefs[i]}
              >
              
                <Link className="press-link py-6 px-4 block pr-20" href={article.node?.pressFields?.link ?? '#'} target="_blank" rel="noopener noreferrer">
                  
                    {article.node?.pressFields?.publication && (
                      <span className="text-xs uppercase publication">{article.node?.pressFields?.publication}</span>
                    )}
                    <p className="mt-2">{article.node.title}</p>
                    <div className="press-arrow absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 opacity-0">
                      <svg className="w-full h-full" width="134" height="134" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="66.9453" cy="66.9453" r="66.9453" fill="#521414"/>
                        <path d="M66.9453 0C103.918 0 133.891 29.9724 133.891 66.9453H0C0 29.9724 29.9724 0 66.9453 0Z" fill="#1A4B7C"/>
                        <path d="M101.434 71.7217H94.7744V39.0918H62.1436V32.4316H101.434V71.7217Z" fill="white"/>
                        <path d="M31.9355 96.9912L92.999 35.9278L97.3938 40.3227L36.3304 101.386L31.9355 96.9912Z" fill="white"/>
                      </svg>

                    </div>
                </Link>
              </div>
            );
          })}
          <div
            className="h-3"
            data-ref-type="more-press"
            ref={morePressRef}
          />
        </section>
      </div>
    </PageLayout>
  );
}

Page.query = gql`
  query GetPageDataByURI($id: ID!, $first: Int!, $after: String) {
    page(id: $id, idType: DATABASE_ID) {
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

Page.variables = (seedQuery, context, data) => {
  return {
    id: process.env.NEXT_PUBLIC_WORDPRESS_URL?.includes('stg') ? '2709' : '2702',
    first: 6,
    after: null,
  };
};

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page, props: {title: 'Press Page'}});
}

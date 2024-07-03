import * as React from 'react';
import Image from 'next/image';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link'

const NextProject = ({ currentProject }) => {
  const { data } = useQuery(GET_ALL_PROJECTS_QUERY);

  const allProjects = data?.projects?.nodes ?? [];

  const currentProjectIndex = allProjects.findIndex(project => project.uri === currentProject.uri);

  if (currentProjectIndex < 0 || currentProjectIndex + 1 >= allProjects.length) {
    return <></>;
  }

  return <NextProjectContent nextProjectId={allProjects[currentProjectIndex + 1].id} />
};

export default NextProject;

const NextProjectContent = ({ nextProjectId }) => {
  const { data } = useQuery(GET_NEXT_PROJECT_QUERY, { variables: { id: nextProjectId }});

  const nextProject = data?.project;

  const [isMobile, setIsMobile] = React.useState(false);

  const nextProjectAfterEleRef = React.useRef();
  const imageMaskRef = React.useRef();

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleScroll = () => {
    const imageMaskEle = imageMaskRef.current;
    const nextProjectAfterEle = nextProjectAfterEleRef.current;

    if (imageMaskEle && nextProjectAfterEle) {
      const initialMaskWidth = 660;
      const initialMaskHeight = 440;
      let maskScale = 1;
      let translateX = (window.innerWidth - initialMaskWidth) / 2;
      let translateY = (window.innerHeight - initialMaskHeight) / 2;
      const scrollMovePos =
        window.innerHeight * 1.5 -
        nextProjectAfterEle.getBoundingClientRect().top;

      if (scrollMovePos > 0 && scrollMovePos < window.innerHeight * 1.5) {
        maskScale =
          1 +
          ((Math.floor(window.innerWidth / initialMaskWidth) * scrollMovePos) /
            window.innerHeight) *
            2;
        if (maskScale > 3) {
          maskScale = 3;
        }
        translateX =
          ((window.innerWidth - initialMaskWidth * maskScale) / 2 / maskScale) *
          1;
        translateY =
          ((window.innerHeight - initialMaskHeight * maskScale) /
            2 /
            maskScale) *
          1;
        imageMaskEle.style.transform = `scale(${maskScale}) translate(${translateX}px, ${translateY}px)`;
      }
    }
  };

  return (
    <>
      {nextProject && (
        <section
          className={`${
            !isMobile ? ' next-project mb-[50vh] sticky top-0' : ''
          }`}
        >
          <div
            className={`flex items-center flex-col items-baseline md:items-center md:justify-center relative ${
              !isMobile ? 'w-screen h-screen' : 'py-32 px-8'
            }`}
          >
            {nextProject.featuredImage?.node?.mediaItemUrl && (
              <Link
                passHref
                href={nextProject.link}
              >
                <a className={!isMobile ? 'static' : 'relative w-full h-auto'}>
                  <Image
                    loading="eager"
                    className={!isMobile ? 'w-full h-full' : 'relative w-full h-auto'}
                    src={nextProject.featuredImage.node.mediaItemUrl}
                    layout="fill"
                    // width={nextProject.featuredImage.node.mediaDetails.width}
                    // height={nextProject.featuredImage.node.mediaDetails.height}
                    alt={
                      nextProject.featuredImage.node.altText ||
                      nextProject.title
                    }
                    unoptimized={true}
                    // sizes="(min-width: 1024px) 60vw, 70vw"
                  />
                </a>
              </Link>
            )}
            <svg width="0" height="0">
              <clipPath id="next-project-image-mask">
                <path
                  ref={imageMaskRef}
                  d="M 0.034 -0.034 L 660 -0.049 L 660 440 L 0 440 L 0 0 L 0.034 -0.034 Z"
                />
              </clipPath>
            </svg>
            <p
              className={`mt-4 md:mt-0 md:mb-8 text-[12px] tracking-[4px] sm:text-lg uppercase relative ${
                !nextProject.featuredImage || isMobile
                  ? 'text-black'
                  : 'text-white'
              }`}
            >
              Next Project
            </p>
            <p
              className={`relative max-w-[600px] text-lg md:text-[58px] md:leading-[58px] md:text-center${
                !nextProject.featuredImage || isMobile
                  ? ' text-black'
                  : ''
              }`}
            >
              <Link href={nextProject.link}>
                {nextProject.title}
              </Link>
            </p>
            {isMobile && (
              <Link
                className="uppercase text-black"
                href={nextProject.link}
              >
                View project
              </Link>
            )}
          </div>
        </section>
      )}

      <section
        className="next-project-after"
        ref={nextProjectAfterEleRef}
      ></section>
    </>
  );
};

const GET_ALL_PROJECTS_QUERY = gql`
  query {
    projects(first: 20, where: {orderby: {field: MENU_ORDER, order: ASC}}) {
      nodes {
        id
        title
        link
        uri
        date
        menuOrder
        featuredImage {
          node {
            altText
            mediaItemUrl
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

const GET_NEXT_PROJECT_QUERY = gql`
  query GetNextProject(
    $id: ID!
  ) {
    project(id: $id) {
      title
      link
      featuredImage {
        node {
          altText
          mediaItemUrl
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

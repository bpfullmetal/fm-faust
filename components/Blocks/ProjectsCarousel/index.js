import * as React from 'react';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import ProjectsCarousel from './Carousel';

const BlockProjectsCarousel = () => {
  const { data: respData } = useQuery(gqlquery);

  const editorBlocks = respData?.page?.editorBlocks ?? [];
  let projects = respData?.projects?.edges ?? [];

  const data = editorBlocks.find(block => block.blockProjectsCarousel)?.blockProjectsCarousel;

  if (!data) return <></>;

  const carouselData = {...data};
  carouselData.projects = carouselData.projects.filter( project => project?.project?.nodes?.length )

  const slideCount = carouselData.manualSelection
    ? carouselData.projects.length
    : carouselData.projectsMax;

  if ( !projects.length && !carouselData.projects.length ) {
    return <></>
  }
  return (
    <section
      className={`flex flex-col mt-36 mb-20 overflow-x-hidden pl-5 sm:mt-44 sm:pl-12 lg:pl-20 ${
        slideCount < 4 ? 'xl:ml-our_latest_work' : ''
      }`}
    >
      <div className="flex justify-between text-dark_green text-xl leading-tight mb-5 sm:justify-start sm:text-[22px]">
        {carouselData.title && <p>{carouselData.title}</p>}
        <p className="animate-underline ml-6 mr-5">
          <Link href="/work">View all work</Link>
        </p>
      </div>
      {carouselData.manualSelection && carouselData.projects.length && (
        <ProjectsCarousel
          slides={carouselData.projects.map((project) => {
            const projectNode = project.project.nodes.length ? project.project.nodes[0] : null
            let image = null
            if ( project.image?.node ) {
              image = project.image.node
            } else {
              if ( projectNode.projectSingleAlternateImages?.verticalImage ) {
                image = projectNode.projectSingleAlternateImages.verticalImage.node
              } else {
                if ( projectNode.featuredImage ) {
                  image = projectNode.featuredImage.node
                }
              }
            }

            return {
              image: {
                ...image,
                sourceUrl: image.mediaItemUrl
              },
              title: project.title
                ? project.title
                : projectNode?.title || '',
              id: projectNode.id,
              link: projectNode.uri,
            };
          })}
        />
      )}
      {!carouselData.manualSelection && (
        <>
          {projects.length > 0 ? (
            <ProjectsCarousel
              slides={projects.map((project) => {
                let image = null
                if ( project.node.featuredImage ) {
                  image = project.node.featuredImage.node
                }
                return {
                  image: image,
                  title: project.node.title,
                  id: project.node.id,
                  link: project.node.link,
                };
              })}
            />
          ) : (<>No projects found</>)}
        </>
      )}
    </section>
  );
};

export default BlockProjectsCarousel;

const gqlquery = gql`
  query {
    page(id: "cG9zdDo3NjU=") {
      editorBlocks {
        ... on AcfProjectsCarousel {
          blockProjectsCarousel {
            manualSelection
            projects {
              image {
                node {
                  altText
                  mediaItemUrl
                  mediaDetails {
                    width
                    height
                  }
                }
              }
              project {
                nodes {
                  ... on Project {
                    id
                    projectSingleAlternateImages {
                      verticalImage {
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
                    uri
                    link
                    title
                  }
                }
              }
              title
            }
            projectsMax
            title
          }
        }
      }
    }
    projects {
      edges {
        node {
          id
          projectSingleAlternateImages {
            verticalImage {
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
          title
          link
          uri
        }
      }
    }
  }
`;

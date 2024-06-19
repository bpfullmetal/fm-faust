import * as React from 'react';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import ProjectsCarousel from './Carousel';

const BlockProjectsCarousel = () => {
  const { data: respData } = useQuery(gqlquery);

  const editorBlocks = respData?.page?.editorBlocks ?? [];
  const projects = respData?.projects?.edges ?? [];

  const data = editorBlocks.find(block => block.blockProjectsCarousel)?.blockProjectsCarousel;

  if (!data) return <></>;

  const carouselData = {
    title: data.title,
    manualSelection: data.manualSelection,
    projectsMax: data.projectsMax,
    projects: data.projects?.length ? data.projects.map(project => ({
      image: project.image ? {
        altText: project.image.node.altText,
        sourceUrl: project.image.node.sourceUrl,
        mediaDetails: {
          width: project.image.node.mediaDetails.width,
          height: project.image.node.mediaDetails.height,
        }
      } : null,
      title: project.title,
      project: {
        featuredImage: project.project.nodes.length ? project.project.nodes[0].featuredImage.node.sourceUrl ? {
          sourceUrl: project.project.nodes[0].featuredImage.node.sourceUrl,
          altText: project.project.nodes[0].featuredImage.node.altText,
          mediaDetails: {
            width: project.project.nodes[0].featuredImage.node.mediaDetails.width,
            height: project.project.nodes[0].featuredImage.node.mediaDetails.height
          }
        } : null : null,
        projectSingleAlternateImages: project.project.nodes.length ? project.project.nodes[0].projectSingleAlternateImages?.verticalImage?.node?.sourceUrl ? {
          sourceUrl: project.project.nodes[0].projectSingleAlternateImages.verticalImage.node.sourceUrl,
          altText: project.project.nodes[0].projectSingleAlternateImages.verticalImage.node.altText,
          mediaDetails: {
            width: project.project.nodes[0].projectSingleAlternateImages.verticalImage.node.mediaDetails.width,
            height: project.project.nodes[0].projectSingleAlternateImages.verticalImage.node.mediaDetails.height
          }
        } : null : null,
        title: project.title ?? project.project.nodes.length ? project.project.nodes[0].title : '',
        id: project.project.nodes.length ? project.project.nodes[0].id : '',
        link: project.project.nodes.length ? project.project.nodes[0].link : '',
      }
    })) : []
  };

  const slideCount = carouselData.manualSelection
    ? carouselData.projects.length
    : carouselData.projectsMax;

  return (
    <section
      className={`flex flex-col mt-36 mb-20 overflow-x-hidden pl-5 sm:mt-44 sm:pl-12 lg:pl-20 ${
        slideCount < 4 ? 'xl:ml-our_latest_work' : ''
      }`}
    >
      <div className="flex justify-between text-dark_green text-xl leading-tight mb-5 sm:justify-start sm:text-[22px]">
        {carouselData.title && <p>{carouselData.title}</p>}
        <p className="animate-underline ml-6 mr-5">
          <Link href="/">View all work</Link>
        </p>
      </div>
      {carouselData.manualSelection && carouselData.projects.length && (
        <ProjectsCarousel
          slides={carouselData.projects.map((project) => {
            let image = null
            if ( project.image ) {
              image = project.image
            } else {
              if ( project.project.projectSingleAlternateImages?.sourceUrl ) {
                image = project.project.projectSingleAlternateImages
              } else {
                if ( project.project.featuredImage?.sourceUrl ) {
                  image = project.project.featuredImage
                }
              }
            }

            return {
              image: image,
              title: project.title
                ? project.title
                : project.project.title,
              id: project.project.id,
              link: project.project.link,
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
                  sourceUrl
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
                          sourceUrl
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
                        sourceUrl
                        mediaDetails {
                          width
                          height
                        }
                      }
                    }
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
                sourceUrl
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
              sourceUrl
              mediaDetails {
                width
                height
              }
            }
          }
          title
          link
        }
      }
    }
  }
`;

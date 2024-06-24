import * as React from 'react';
import Image from 'next/image';
import Helper from '../../helper';
import { PageLayout } from '../../components';
import ProjectCarouselModal from './CarouselModal';
import NextProject from './NextProject';

const ProjectContent = ({ project, isPreview = false }) => {
  const { title, featuredImage, projectsSingle } = project;
  const positions = ['right', 'left', 'center'];

  const scrollContainerRef = React.useRef();
  const [isMobile, setIsMobile] = React.useState(false);
  const [projectImages, setProjectImages] = React.useState(
    projectsSingle?.projectImages
      ? projectsSingle.projectImages.filter(
          (imageBlock) => imageBlock.image?.node || imageBlock.video?.node
        )
      : []
  );
  const [revealProjectInfo, setRevealProjectInfo] = React.useState(false);
  const [projectRefs] = React.useState(
    Array(projectImages.length)
      .fill()
      .map((_) => React.useRef())
  );
  const [clickedImageOrder, setClickedImageOrder] = React.useState(-1);
  const [imageBlockPositions, setImageBlockPositions] = React.useState([]);
  const [imageBlockSizes, setImageBlockSizes] = React.useState([]);
  const [imageBlockDetails, setImageBlockDetails] = React.useState([]);

  React.useEffect(() => {
    let prevPosition = getRandomPosition();
    let prevSize = getRandomSize();

    const randomPositions = projectImages.map((_) => {
      const pos = getRandomPosition(prevPosition);
      prevPosition = pos;
      return pos;
    });

    setImageBlockPositions(randomPositions);

    setImageBlockDetails(
      projectImages.map((imageBlock, i) => {
        return {
          type: imageBlock.video ? 'video' : 'image',
          isLoaded: false,
        };
      })
    );

    setImageBlockSizes(
      projectImages.map((imageBlock, i) => {
        const orientation = imageBlock.image
          ? imageBlock.image.node.mediaDetails.width <=
            imageBlock.image.node.mediaDetails.height
            ? 'portrait'
            : 'landscape'
          : imageBlock.video.node.mediaDetails.width <=
            imageBlock.video.node.mediaDetails.height
          ? 'portrait'
          : 'landscape';
        const blockSize = orientation === 'portrait' ? ['small'] : ['large'];
        prevSize = blockSize;
        return blockSize;
      })
    );
  }, [projectImages]);

  React.useEffect(() => {
    projectRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection, {
        threshold: 0.35,
      })
    );
  }, [projectRefs]);

  const handleDisplayImage = (image, imageRef) => {
    // console.log('image', image.target?.classList)
    // console.log('ref', imageRef.current?.classList)
    // if ( image?.target?.classList && imageRef?.current?.classList?.contains('reveal') ) {
    //   image.target.classList.add('reveal')
    // }
    image.target.classList.add('loaded')
  }

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if ( !entry.isIntersecting || entry.target.classList.contains('reveal') ) return;

    const featuredImageWrapper = entry.target.querySelector('.featured-image-wrapper');
    if ( featuredImageWrapper?.classList?.contains('loaded') ) {
      entry.target.classList.add('reveal');
    }
  };

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

  const size2Class = {
    small: 'w-full md:w-6/12',
    medium: 'w-full md:w-7/12',
    large: 'w-full md:w-8/12',
    full: 'w-full md:w-10/12',
  };

  const pos2Class = {
    right: 'mr-0 sm:flex-row gap-y-3 gap-x-12',
    center: 'jusitfy-center mx-auto w-full gap-y-3 gap-x-12',
    left: 'sm:flex-row-reverse gap-x-12 ml-0 gap-y-3 gap-x-12',
  };

  const getRandomPosition = (prevPosition = -1) => {
    let position;

    do {
      position = positions[Math.floor(Math.random() * positions.length)];
    } while (position === prevPosition);

    return position;
  };

  const getRandomSize = (orientation = '', prevSize = -1) => {
    const sizes =
      orientation === 'portrait'
        ? ['small', 'medium']
        : ['small', 'medium', 'large'];

    let size;

    do {
      size = sizes[Math.floor(Math.random() * sizes.length)];
    } while (size === prevSize);

    return size;
  };

  return (
    <PageLayout
      options={{ currentURI: '/work/', scrollIndicator: scrollContainerRef }}
      pageData={project}
    >
      <>
        {featuredImage && (
          <section className="h-home_banner">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                className="featured-image-wrapper w-full h-full object-cover rounded-none"
                src={featuredImage.node.mediaItemUrl}
                layout="fill"
                loading="eager"
                alt={featuredImage.node.altText || title}
              />
              <h1 className="absolute max-w-[480px] text-4xl font-medium !leading-none text-center md:max-w-[580px] md:text-5xl lg:max-w-[680px] lg:text-[58px]">
                {title}
              </h1>
            </div>
          </section>
        )}

        <section className="work-project flex flex-col bg-[#300808]">
          <div className="w-full max-w-main mx-auto px-5 sm:px-12 pb-16 sm:pb-40">
            {!featuredImage && (
              <h1 className="mx-auto mt-12 mb-12 max-w-[480px] text-3xl font-medium !leading-none text-center md:max-w-[580px] md:text-4xl lg:max-w-[680px] lg:text-[38px] text-center">
                {title}
              </h1>
            )}
            {(project.content ||
              projectsSingle?.projectDetails?.attributes?.length) && (
              <div className="flex flex-col mt-8">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setRevealProjectInfo((old) => !old)}
                >
                  <div
                    className={`relative flex items-center justify-center w-6 h-6 mr-2 sm:mr-6 transition-all ease-out duration-300 ${
                      revealProjectInfo ? 'rotate-[135deg]' : 'rotate-0'
                    }`}
                  >
                    <div className="absolute w-4 h-0.5 bg-taupe"></div>
                    <div className="absolute w-0.5 h-4 bg-taupe"></div>
                  </div>
                  <p className="text-taupe text-xl leading-[44px] sm:text-[26px]">
                    {projectsSingle.projectDetails.label ||
                      'Project Information'}
                  </p>
                </div>
                <div
                  className={`text-taupe w-full md:w-1/2 h-0 ${
                    revealProjectInfo ? 'h-full pt-2' : 'pt-0'
                  } flex flex-col pl-8 sm:pl-12 pr-4 md:pr-0 overflow-hidden transition-all`}
                >
                  {/* {project.content && (
                    <div
                      className="space-y-12"
                      dangerouslySetInnerHTML={{
                        __html: project.projectsSingle.projectDetails.content,
                      }}
                    />
                  )} */}
                  {projectsSingle.projectDetails.attributes && (
                    <div className="project-details">
                      {projectsSingle.projectDetails.attributes.map(
                        (attribute, i) => (
                          <div
                            key={`project-details-${i}`}
                            className="flex flex-col pt-9 space-y-2"
                          >
                            {attribute.label && (
                              <p className="text-taupe text-xs">
                                {attribute.label}
                              </p>
                            )}
                            {attribute.attributeListings && (
                              <div className="text-taupe text-lg leading-[34px] sm:text-[20px]">
                                {attribute.attributeListings.map(
                                  (attItem, a) => {
                                    return (
                                      <div key={`project-attribute-${a}`}>
                                        {attItem.link ? (
                                          <a
                                            target="_blank"
                                            href={attItem.link}
                                            rel="noreferrer"
                                          >
                                            <span>{attItem.title}</span>
                                          </a>
                                        ) : (
                                          <>{attItem.title}</>
                                        )}
                                        {a !==
                                          attribute.attributeListings.length -
                                            1 && <span>, </span>}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {projectImages.length ? (
              <div
                id="project-images-container"
                ref={scrollContainerRef}
                className="flex flex-col mt-8 md:mt-20"
              >
                {projectImages.map((block, i) => {
                  const blockPos = imageBlockPositions[i];
                  const blockSize = imageBlockSizes[i];
                  const imageBlock = block.image ? block.image : block.video;
                  if (!imageBlock) return <></>;
                  const orientation =
                    imageBlock.node.mediaDetails.width <=
                    imageBlock.node.mediaDetails.height
                      ? 'portrait'
                      : 'landscape';
                      
                  return (
                    <div
                      ref={projectRefs[i]}
                      className={`project-block${
                        projectImages.length !== i + 1 ? ' mb-20 md:mb-40' : ''
                      } flex flex-col-reverse items-start ${
                        pos2Class[blockPos]
                      } sm:items-center`}
                      key={`project-image-${i}`}
                    >
                      <div className="description-reveal flex-1 text-taupe text-sm_extra leading-[24px]">
                        {block.description && block.description}
                      </div>
                      {(block.image || block.video) && (
                        <div
                          className={`image-reveal image-to-lightbox ${size2Class[blockSize]} relative ${orientation === 'landscape'
                            ? 'aspect-[4/3]'
                            : 'aspect-[3/4]'}`}
                          onClick={() =>
                            !isMobile ? setClickedImageOrder(i) : null
                          }
                        >
                          {block.video ? (
                            <div>
                              <video
                                autoPlay
                                muted
                                loop
                                onLoadedData={() =>
                                  setImageBlockDetails(
                                    imageBlockDetails.map((item, index) =>
                                      index === i
                                        ? { ...item, isLoaded: true }
                                        : item
                                    )
                                  )
                                }
                                className="w-full h-full"
                              >
                                <source
                                  src={block.video.node.mediaItemUrl}
                                  type="video/mp4"
                                />
                              </video>
                            </div>
                          ) : (
                            <Image
                              className={`featured-image-wrapper w-full h-auto rounded featured-image-${block.image.node.id}`}
                              src={block.image.node.mediaItemUrl}
                              width={orientation === 'landscape' ? 800 : 600}
                              height={orientation === 'landscape' ? 600 : 800}
                              layout="fill"
                              objectFit="cover"
                              objectPosition="center"
                              sizes="(min-width: 1024px) 40vw, 100vw"
                              loading="eager"
                              onLoad={event => handleDisplayImage(event, projectRefs[i])}	
                              quality={60}
                              alt={
                                block.image.node.altText ||
                                block.description ||
                                `${title} image ${i + 1}`
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : <></>}
          </div>
        </section>

        {!isPreview && <NextProject currentProject={project} />}

        {clickedImageOrder > -1 && (
          <ProjectCarouselModal
            imageBlocks={projectImages}
            initialSlide={clickedImageOrder}
            onClose={() => setClickedImageOrder(-1)}
          />
        )}
      </>
    </PageLayout>
  );
};

export default ProjectContent;

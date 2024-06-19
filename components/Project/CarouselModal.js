import * as React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import ArrowLeftIcon from '../../assets/images/arrow-left.svg';
import ArrowRightIcon from '../../assets/images/arrow-right.svg';
import CloseIcon from '../../assets/images/close.svg';

const ProjectCarouselModal = ({ imageBlocks, initialSlide, onClose }) => {
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(initialSlide);

  const backgroundRef = React.useRef(null);

  React.useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        onClose();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  const handleClickBackground = (event) => {
    // Check if the click target is the background element or one of its children
    if (event.target === backgroundRef.current) {
      onClose();
    }
  };

  const croppedImageBlocks = React.useMemo(() => {
    return imageBlocks.map((block) => {
      const mediaNode = block.video?.node || block.image?.node;
      let width = window.innerWidth * 0.98;
      let height = window.innerHeight * 0.98;
      let isLandscape =
        mediaNode &&
        mediaNode.mediaDetails.width > mediaNode.mediaDetails.height;
      const aspectRatio = mediaNode
        ? mediaNode.mediaDetails.width / mediaNode.mediaDetails.height
        : 0;
      if (mediaNode) {
        if (isLandscape) {
          const croppedHeight = width / aspectRatio;
          if (croppedHeight > height) {
            width = height * aspectRatio;
          } else {
            height = croppedHeight;
          }
        } else {
          const croppedWidth = height * aspectRatio;
          if (croppedWidth > width) {
            height = width / aspectRatio;
          } else {
            width = croppedWidth;
          }
        }
      }

      let isLargeLandscape = Boolean(width > window.innerWidth * 0.98 - 200);

      return { ...block, width, height, isLargeLandscape };
    });
  }, [imageBlocks]);

  return (
    <div
      className="project-carousel-modal fixed w-screen h-screen top-0 left-0 bg-[#FFFFFFE6] z-30"
      aria-modal={true}
      ref={backgroundRef}
      onClick={handleClickBackground}
    >
      <div
        className="absolute flex items-center justify-center top-6 right-6 cursor-pointer z-[99] w-8 h-8"
        onClick={onClose}
      >
        <Image className="w-full h-full" src={CloseIcon} alt="close" />
      </div>

      <Swiper
        initialSlide={initialSlide}
        slidesPerView={1}
        onActiveIndexChange={(swiper) =>
          setActiveSlideIndex(swiper.activeIndex)
        }
      >
        <SlidePrevArrow
          disabled={activeSlideIndex < 1}
          width={croppedImageBlocks?.[activeSlideIndex]?.width}
          isLargeLandscape={
            croppedImageBlocks?.[activeSlideIndex]?.isLargeLandscape
          }
        />

        {croppedImageBlocks.map((block, i) => {
          return (
            <SwiperSlide
              className="relative flex justify-center items-center"
              key={i}
            >
              <SlidePrevBlock disabled={i === 0} />

              {(block.image || block.video) && (
                <div className="flex flex-col items-center justify-center h-full">
                  {block.video ? (
                    <video
                      autoPlay
                      muted
                      loop
                      style={{
                        width: block.width || block.video.node.mediaDetails.width,
                        height: block.height || block.video.node.mediaDetails.height,
                        objectFit: 'cover',
                      }}
                    >
                      <source
                        src={block.video.node.mediaItemUrl}
                        type="video/mp4"
                      />
                    </video>
                  ) : (
                    <Image
                      src={block.image.node.sourceUrl}
                      alt={block.image.node.altText || block.description || ''}
                      width={block.width || block.video.node.mediaDetails.width}
                      height={block.height || block.video.node.mediaDetails.height}
                      style={{
                        // width: block.width || block.video.node.mediaDetails.width,
                        // height: block.height || block.video.node.mediaDetails.height,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>
              )}

              <SlideNextBlock disabled={i === croppedImageBlocks.length - 1} />
            </SwiperSlide>
          );
        })}

        <SlideNextArrow
          disabled={activeSlideIndex + 1 >= croppedImageBlocks.length}
          width={croppedImageBlocks?.[activeSlideIndex]?.width}
          isLargeLandscape={
            croppedImageBlocks?.[activeSlideIndex]?.isLargeLandscape
          }
        />
      </Swiper>
    </div>
  );
};

export default ProjectCarouselModal;

const SlidePrevBlock = ({ disabled }) => {
  const swiper = useSwiper();

  return (
    <div
      className={`absolute top-0 left-0 w-1/2 h-full ${
        disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
      } z-10`}
      onClick={() => !disabled && swiper.slidePrev()}
    ></div>
  );
};

const SlideNextBlock = ({ disabled }) => {
  const swiper = useSwiper();

  return (
    <div
      className={`absolute top-0 right-0 w-1/2 h-full ${
        disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
      } z-10`}
      onClick={() => !disabled && swiper.slideNext()}
    ></div>
  );
};

const SlidePrevArrow = ({ disabled, width, isLargeLandscape }) => {
  const swiper = useSwiper();

  return (
    <div
      className={`fixed top-[50%] ${
        disabled ? 'opacity-25' : 'transition hover:scale-[1.2] cursor-pointer'
      } z-10`}
      style={{
        left: isLargeLandscape ? 32 : (window.innerWidth - width) / 2 - 80,
      }}
      onClick={() => !disabled && swiper.slidePrev()}
    >
      <Image src={ArrowLeftIcon} alt="arrow left" />
    </div>
  );
};

const SlideNextArrow = ({ disabled, width, isLargeLandscape }) => {
  const swiper = useSwiper();

  return (
    <div
      className={`fixed top-[50%] ${
        disabled ? 'opacity-25' : 'transition hover:scale-[1.2] cursor-pointer'
      } z-10`}
      style={{
        right: isLargeLandscape ? 32 : (window.innerWidth - width) / 2 - 80,
      }}
      onClick={() => !disabled && swiper.slideNext()}
    >
      <Image src={ArrowRightIcon} alt="arrow right" />
    </div>
  );
};

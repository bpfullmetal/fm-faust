import * as React from 'react';
import Image from 'next/image';
import LetterA from '../../assets/js/icons/letter-a';
import LetterC from '../../assets/js/icons/letter-c';
import LetterD from '../../assets/js/icons/letter-d';
import LetterE from '../../assets/js/icons/letter-e';
import LetterF from '../../assets/js/icons/letter-f';
import LetterI from '../../assets/js/icons/letter-i';
import LetterL from '../../assets/js/icons/letter-l';
import LetterM from '../../assets/js/icons/letter-m';
import LetterN from '../../assets/js/icons/letter-n';
import LetterR from '../../assets/js/icons/letter-r';
import LetterS from '../../assets/js/icons/letter-s';

const BlockLogoBanner = ({ data }) => {
  const [startAnimate, setStartAnimate] = React.useState(false);
  const [prevScrollY, setPrevScrollY] = React.useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [videoCanAutoplay, setVideoCanAutoplay] = React.useState(true);

  const videoRef = React.useRef();

  React.useEffect(() => {

    if ('mediaSession' in navigator) {
      // Check if the browser supports autoplay
      const supportsAutoplay = document.createElement('video').autoplay === true;
    
      // Check if autoplay is allowed by the browser's settings
      const autoplayAllowed = supportsAutoplay && MediaSession.permission === 'granted';
    
      if ( !autoplayAllowed ) {
        setVideoCanAutoplay(false)
      } 
    }

    setTimeout(() => {
      setStartAnimate(true);
    }, 1000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (prevScrollY < 1 && window.scrollY === 1) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
    setPrevScrollY(window.scrollY);
  };

  const handleBannerClick = () => {
    if (window.scrollY < 1) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleVideoOnLoad = () => {
    setIsVideoLoaded(true);
    // videoRef.current.play()
  };

  if (!data.backgroundImage && !data.backgroundVideo) return <></>;

  return (
    <section
      className="relative h-home_banner home-banner"
      onClick={handleBannerClick}
    >
      {
        data.backgroundVideo 
          ? (
            <div className="banner-image-wrapper absolute w-full h-full object-cover">
              {
                isVideoLoaded 
                ? null 
                : data?.backgroundImage?.node 
                  ? (
                    <Image
                      className="w-full h-full object-cover absolute"
                      src={data.backgroundImage.node.mediaItemUrl}
                      loading="eager"
                      alt={data.backgroundImage.node.altText}
                      width={data.backgroundImage.node.mediaDetails.width}
                      height={data.backgroundImage.node.mediaDetails.height}
                      priority={true}
                      unoptimized={true}
                    />
                  ) 
                  : null
              }
              <video
                autoPlay
                muted
                ref={videoRef}
                loop
                style={ isVideoLoaded ? {opacity: 1} : {opacity: 0} }
                controls={false}
                // onLoadedMetadata={handleVideoOnLoad}
                onCanPlay={handleVideoOnLoad}
                // onLoadedData={handleVideoOnLoad}
                onError={(e) => console.error('video error', e)}
                className="absolute w-full h-full object-cover"
              >
                <source
                  src={data.backgroundVideo.node.mediaItemUrl}
                  type="video/mp4"
                >
                  
                </source>
              </video>
            </div>
          ) 
          : data?.backgroundImage?.node 
            ? (
              <div className="banner-image-wrapper">
                <Image
                  className="w-full h-full object-cover absolute"
                  src={data.backgroundImage.node.mediaItemUrl}
                  alt={data.backgroundImage.node.altText}
                  width={data.backgroundImage.node.mediaDetails.width}
                  height={data.backgroundImage.node.mediaDetails.height}
                  priority={true}
                  unoptimized={true}
                />
              </div>
            ) 
            : null
      }
      <div className="relative h-full flex flex-col items-center justify-center uppercase">
        <div className="flex justify-between space-x-6 sm:space-x-8">
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterF />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterR />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterA />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterN />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterC />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterE />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterS />
          </div>
        </div>
        <div
          className={`transition-[height] ease-in-out duration-1000 ${
            startAnimate ? 'h-1/2' : 'h-10'
          }`}
        ></div>
        <div className="flex justify-between space-x-6 sm:space-x-8">
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterM />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterI />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterL />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterD />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterR />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterE />
          </div>
          <div className="letter flex justify-center w-8 h-[30px] sm:h-9">
            <LetterD />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockLogoBanner;

import * as React from 'react';
import Image from 'next/image';
import Helper from '../../helper';

const BlockFeaturedContent = ({ data }) => {
  const featuredContent = data;
  let revealRefsCount = 0;
  if (featuredContent.title) {
    revealRefsCount++;
  }
  if (featuredContent?.content?.length) {
    revealRefsCount += featuredContent.content.length;
  }

  const [scrollRevealRefs] = React.useState(
    Array(revealRefsCount)
      .fill()
      .map((_) => React.useRef()),
  );

  React.useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '0px', // No margin
      threshold: 0.5, // Trigger when 50% of the target is in the viewport
    };

    scrollRevealRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection, options)
    );
  }, []);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if (!entry.isIntersecting) return;

    entry.target.classList.add('reveal');
  };

  if ( featuredContent.title === null && (!featuredContent.content || !featuredContent.content.length) ) {
    return <></>;
  }

  return (
    <section className="flex flex-col max-w-main mx-auto pt-14 px-5 space-y-32 sm:px-12 md:flex-row md:space-y-0">
      {featuredContent.title && (
        <div className="lg:pl-8">
          <p
            className="scroll-reveal text-dark_green text-xl leading-[44px] whitespace-nowrap sm:text-[22px] sm:mr-16"
            ref={scrollRevealRefs[0]}
          >
            {featuredContent.title}
          </p>
        </div>
      )}
      {featuredContent.content && (
        <div className="max-w-[680px] ml-auto lg:max-w-[800px]">
          {featuredContent.content.map((content, i) => {
            switch (content.contentType[0]) {
              case 'image':
                return (
                  <div
                    key={`featured-content-${i}`}
                    className="scroll-reveal mb-6 sm:mb-8"
                    ref={scrollRevealRefs[i + 1]}
                  >
                    {content.imageBlock.image && (<Image
                      src={content.imageBlock.image.node.mediaItemUrl}
                      alt={
                        content.imageBlock.image.node.altText ||
                        content.imageBlock.link.title
                      }
                      unoptimized={true}
                      width={content.imageBlock.image.node.mediaDetails.width}
                      height={content.imageBlock.image.node.mediaDetails.height}
                    />)}
                  </div>
                );
              case 'text':
                return (
                  <p
                    key={`featured-content-${i}`}
                    className="scroll-reveal text-dark_green text-lg mb-6 sm:text-xl sm:mb-8"
                    ref={scrollRevealRefs[i + 1]}
                  >
                    {content.text}
                  </p>
                );
            }
          })}
        </div>
      )}
    </section>
  );
};

export default BlockFeaturedContent;

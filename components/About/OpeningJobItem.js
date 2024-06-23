import * as React from 'react';
import Helper from '../../helper';

const OpeningJobItem = ({ data, order, opened = false }) => {
  const [isEntered, setIsEntered] = React.useState(false);
  const [isOpened, setIsOpened] = React.useState(opened);
  const [beginApplyAnimate, setBeginApplyAnimate] = React.useState(false);
  const contentRef = React.useRef();
  const applyRef = React.useRef();
  const applyContentRefs = Array(3)
    .fill()
    .map((_) => {
      return React.useRef();
    });

  React.useEffect(() => {
    Helper.setupIntersectionObserver(contentRef, handleIntersection);
    Helper.setupIntersectionObserver(applyRef, handleIntersection);
  }, [applyRef, contentRef]);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if (!entry.isIntersecting && !entry.isVisible) return;

    const revealEl = entry.target;
    switch (entry.target.getAttribute('data-animate-ref')) {
      case 'content':
        setTimeout(() => setIsEntered(true), 500 * order);
        break;
      case 'apply':
        setBeginApplyAnimate(true);

        applyContentRefs.forEach((ref, i) => {
          setTimeout(() => ref.current?.classList?.add('reveal'), 1000 + i * 250);
        });

        revealEl.classList.add('animate');
        break;
    }
  };

  const handleOpenJobItem = React.useCallback(() => {
    if (!isOpened) {
      const contentEle = contentRef.current;
      if (contentEle) {
        window.scrollTo({ top: contentEle.offsetTop - 60, behavior: 'smooth' });
      }
    }

    setIsOpened((old) => !old);
  }, [contentRef, isOpened]);

  return (
    <div
      className={`animate-reveal flex flex-col ${isEntered ? 'reveal' : ''}`}
      data-animate-ref="content"
      ref={contentRef}
    >
      <div
        className="flex items-center cursor-pointer"
        onClick={handleOpenJobItem}
      >
        <div className="relative flex items-center justify-center w-[30px] h-[30px] border border-black rounded-full mr-2.5">
          <div className="absolute w-3 h-0.5 bg-black"></div>
          {!isOpened && <div className="absolute w-0.5 h-3 bg-black"></div>}
        </div>
        <p className="text-black text-lg">{data.title}</p>
      </div>

      <div
        className={`h-0 ${
          isOpened ? '!h-full mt-4' : 'mt-0'
        } flex flex-col ml-10 space-y-5 overflow-hidden transition-all text-black`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: data.description,
          }}
        />
        {data.howToApply && (
          <div
            className={`w-full flex flex-col bg-white p-9 rounded transition-all duration-1000 delay-300 origin-left scale-x-0 ${
              beginApplyAnimate ? 'scale-x-100' : ''
            }`}
            data-animate-ref="apply"
            ref={applyRef}
          >
            <div
              className={`animate-reveal text-black text-2xl leading-[30px] ${
                data.applicationLink ? 'underline' : ''
              } mb-2`}
              ref={applyContentRefs[0]}
            >
              {data.applicationLink ? (
                <a target="_blank" href={data.applicationLink} rel="noreferrer">How to apply</a>
              ) : (
                <p>How to apply</p>
              )}
            </div>
            <p
              className="animate-reveal text-black text-lg leading-[30px]"
              ref={applyContentRefs[1]}
            >
              {data.howToApply}
            </p>
            <div
              className="animate-reveal text-black text-sm underline uppercase tracking-[1px] mt-16"
              ref={applyContentRefs[2]}
            >
              {data.applicationLink && (
                <a target="_blank" href={data.applicationLink} rel="noreferrer">Apply here</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningJobItem;

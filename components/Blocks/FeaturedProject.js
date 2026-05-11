import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link'

const BlockFeaturedProject = ({ data }) => {
  const getRandomProject = (projects) => {
    const publishedProjects = projects.filter(project => project.project.nodes.length)

    if (!Array.isArray(publishedProjects) || publishedProjects.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * publishedProjects.length);
    return publishedProjects[randomIndex];
  };

  const randomProject = React.useMemo(() => {
    return getRandomProject(data.projects);
  }, [data.projects]);
  
  const projectImage = randomProject?.backgroundImage
    ? randomProject?.backgroundImage?.node
    : randomProject.project
    ? randomProject.project.nodes[0].featuredImage
      ? randomProject.project.nodes[0].featuredImage.node
      : null
    : null;
  const projectDescription = randomProject?.description
    ? randomProject.description
    : randomProject?.project
    ? randomProject?.project?.nodes?.[0]?.title
      ? randomProject.project.nodes[0].title
      : null
    : null;
  const projectLink = randomProject?.link
    ? randomProject.link
    : randomProject?.project?.nodes?.[0]?.uri
      ? {
          target: '',
          title: randomProject.link?.title ?? 'View Project',
          url: randomProject?.project?.nodes?.[0]?.uri ?? '',
        }
      : null;

  const [projectAnimate, setProjectAnimate] = React.useState('top');

  const projectRef = React.useRef();
  const wrapperRef = React.useRef();

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const projectEle = projectRef.current;
    const wrapperEle = wrapperRef.current;
    if (projectEle && wrapperEle) {
      if (window.scrollY > projectEle.getBoundingClientRect().height + 200) {
        setProjectAnimate('fixed');

        if (window.scrollY > wrapperEle.getBoundingClientRect().height) {
          setProjectAnimate('bottom');
        }
      } else {
        setProjectAnimate('top');
      }
    }
  };

  return (
    <section className="featured-project relative flex items-center w-full !min-h-[56vw] !sm:min-h-screen overflow-hidden">
      {projectImage && (
        <Image
          className="rounded-none"
          src={projectImage.mediaItemUrl}
          alt={projectImage.altText}
          loading="eager"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          fill
          priority={true}
          unoptimized={true}
          // sizes="80vw"
          // width={projectImage.mediaDetails.width}
          // height={projectImage.mediaDetails.height}
        />
      )}
      {(projectDescription || projectLink) && (
        <div className="absolute w-full h-full" ref={wrapperRef}>
          <div
            className={`${
              projectAnimate === 'fixed'
                ? 'max-md:absolute max-md:bottom-[100px] md:fixed md:bottom-[100px]'
                : 'absolute'
            } ${
              projectAnimate === 'top'
                ? 'top-[100px]'
                : projectAnimate === 'bottom'
                ? 'bottom-[20px] sm:bottom-[100px]'
                : ''
            } max-w-main mx-auto px-5 sm:px-12`}
            ref={projectRef}
          >
            {projectDescription && (
              <p className="max-w-[630px] text-white text-3xl leading-[37px] mb-4 sm:text-4xl sm:leading-[44px] lg:pl-8">
                {projectDescription}
              </p>
            )}
            {projectLink && (
              <Link
                href={projectLink.url}
                className="text-base text-white leading-tight tracking-[0.48px] underline sm:text-2xl lg:pl-8"
              >
                {projectLink.title}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BlockFeaturedProject;

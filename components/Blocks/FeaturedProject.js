import * as React from 'react';
import Image from 'next/image';

const BlockFeaturedProject = ({ data }) => {
  const [featuredProjectData] = React.useState({
    projects: data.projects.map(project => ({
      backgroundImage: project.backgroundImage?.node ? {
        node: {
          altText: project.backgroundImage.node.altText,
          sourceUrl: project.backgroundImage.node.sourceUrl,
          mediaDetails: {
            width: project.backgroundImage.node.mediaDetails.width,
            height: project.backgroundImage.node.mediaDetails.height
          }
        }
      } : null,
      description: project.description,
      link: project.link ? {
        title: project.link.title,
        url: project.link.url
      } : null,
      project: project.project.nodes?.length ? {
        featuredImage: {
          altText: project.project.nodes[0].featuredImage.node.altText,
          sourceUrl: project.project.nodes[0].featuredImage.node.sourceUrl,
          mediaDetails: {
            width: project.project.nodes[0].featuredImage.node.mediaDetails.width,
            height: project.project.nodes[0].featuredImage.node.mediaDetails.height
          }
        },
        link: project.project.nodes[0].link,
        title: project.project.nodes[0].title
      } : null
    }))
  });

  const getRandomProject = (projects) => {
    if (!Array.isArray(projects) || projects.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * projects.length);
    return projects[randomIndex];
  };

  const randomProject = React.useMemo(() => {
    return getRandomProject(featuredProjectData.projects);
  }, [featuredProjectData.projects]);

  const projectImage = randomProject?.backgroundImage
    ? randomProject?.backgroundImage?.node
    : randomProject?.project?.featuredImage;
  const projectDescription = randomProject.description
    ? randomProject.description
    : randomProject.project?.title;
  const projectLink = randomProject.link
    ? randomProject.link
    : randomProject.project
    ? {
        target: '',
        title: 'View Project',
        url: randomProject.project.link ?? '',
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
    <section className="featured-project relative flex items-center">
      {projectImage && (
        <Image
          className="!min-h-screen w-full rounded-none object-cover"
          src={projectImage.sourceUrl}
          alt={projectImage.altText}
          layout="fill"
          // width={projectImage.mediaDetails.width}
          // height={projectImage.mediaDetails.height}
        />
      )}
      {(projectDescription || projectLink) && (
        <div className="absolute w-full h-full" ref={wrapperRef}>
          <div
            className={`${
              projectAnimate === 'fixed' ? 'fixed bottom-[100px]' : 'absolute'
            } ${
              projectAnimate === 'top'
                ? 'top-[100px]'
                : projectAnimate === 'bottom'
                ? 'bottom-[100px]'
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
              <a
                className="text-base text-white leading-tight tracking-[0.48px] underline sm:text-2xl lg:pl-8"
                href={projectLink.url}
              >
                {projectLink.title}
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BlockFeaturedProject;

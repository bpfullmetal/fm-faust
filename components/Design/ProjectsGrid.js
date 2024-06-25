import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link'
import Helper from '../../helper';

const DesignProjectsGrid = ({
  category,
  projects,
  handleOnClickImage,
}) => {
  const projectRefs = Array(projects.length)
    .fill()
    .map((_) => React.useRef());

  React.useEffect(() => {
    setupIntersectionObservers();
  }, [projects]);

  const setupIntersectionObservers = () => {
    projectRefs.forEach((ref, i) =>
      Helper.setupIntersectionObserver(ref, (entries) =>
        handleIntersection(entries, i)
      )
    );
  };

  const handleIntersection = (entries, i) => {
    const [entry] = entries;
    if (!entry.isIntersecting && !entry.isVisible) return;

    let gridColumns = 1;
    if (window.innerWidth > 1023) {
      gridColumns = 3;
    } else if (window.innerWidth > 639) {
      gridColumns = 2;
    }
    const revealEl = entry.target;
    revealEl.classList.add('animate');
    setTimeout(
      () => revealEl.classList.add('fade-in'),
      (i % gridColumns) * 500
    );
  };

  if (projectRefs.length < 1) return <></>;

  return (
    <div className="projects-grid">
      {Array.from(projects).map((project, i) => (
        <div
          className="projects-grid__item flex flex-col"
          key={`${category}-${i}`}
          ref={projectRefs[i]}
        >
          {project.image && (
            <div
              className="image-to-lightbox"
              onClick={() => handleOnClickImage(i, project.link)}
            >
              <Image
                className="rounded"
                src={project.image.node.mediaItemUrl}
                width={project.image.node.mediaDetails.width}
                height={project.image.node.mediaDetails.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                alt={
                  project.image ? project.image.node.altText : project.title
                }
              />
            </div>
          )}
          <p className="text-xl leading-none tracking-[0.48px] mb-1 sm:text-lg mt-2">
            <Link href={project.link}>{project.title}</Link>
          </p>
        </div>
      ))}
    </div>
  );
};

export default DesignProjectsGrid;

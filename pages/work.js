import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import Image from 'next/image';
import { PageLayout } from '../components';
import Helper from '../helper';
import projectPlaceholder from '../assets/images/project-placeholder.jpg';

const ProjectBlockDetail = ({ project }) => {
  return (
    <div className="flex flex-col items-start mt-5 space-y-3 lg:flex-row lg:items-center lg:space-x-7 lg:space-y-0">
      <a
        className="text-dark_green text-xl leading-none tracking-[0.4px] sm:text-2xl sm:tracking-[0.48px]"
        href={project.link}
      >
        {project.title}
      </a>
    </div>
  );
};

export default function Page(props) {
  const { data } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  const edges = data?.projects?.edges ?? [];

  const [isPageEntered, setIsPageEntered] = React.useState(false);
  const postsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allProjects, setAllProjects] = React.useState([]);
  const [workProjectRefs, setWorkProjectRefs] = React.useState([]);
  const moreProjectsRef = React.useRef();

  React.useEffect(() => setIsPageEntered(true), []);

  React.useEffect(() => {
    // Concatenate new posts to the existing list
    if (Array.isArray(edges)) {
      const sortedProjects = Array.from(edges).sort((a, b) => {
        if (b.node.menuOrder === 0) return -1;
        return a.node.menuOrder - b.node.menuOrder;
      });
      setAllProjects(sortedProjects);
    }
  }, [edges]);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.getAttribute("data-ref-type") === "project") {
          entry.target.classList.add("reveal");
        }
        if (entry.target.getAttribute("data-ref-type") === "more-projects") {
          // Load more posts when user reaches the bottom
          if (postsPerPage * currentPage > allProjects.length) return;
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    });
  };

  const projects = allProjects.slice(0, currentPage * postsPerPage);

  React.useEffect(() => {
    // Create refs based on the length of allProjects
    if (!allProjects.length) return;
    const newRefs = Array(allProjects.length)
      .fill(1)
      .map((_) => React.createRef());

    // Set the new refs to workProjectRefs
    setWorkProjectRefs(newRefs);

    Helper.setupIntersectionObserver(moreProjectsRef, handleIntersection, {
      threshold: 0.5,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjects]);

  React.useEffect(() => {
    workProjectRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection, {
        threshold: 0.2,
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <PageLayout className="work" options={{ currentURI: data.page.uri }}>
      <div className="min-h-screen">
        <section className="w-full grid grid-cols-1 md:grid-cols-2 max-w-wide mx-auto px-5 sm:px-12 gap-x-8">
          {projects.map((project, i) => {
            const isPreload = (i + 1) / postsPerPage > currentPage - 1;
            return (
              <div
                className={`${
                  isPreload ? "!hidden" : ""
                } work-project-block animate-reveal py-4 mb-8`}
                key={`work-project-${i}`}
                data-ref-type="project"
                data-title={project.node.title}
                ref={workProjectRefs[i]}
              >
                {project.node.featuredImage && (
                  <a className="w-full h-full" href={project.node.link}>
                    <div
                      style={{
                        height: 1,
                        paddingTop: "66.67%",
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        // className="w-full h-full aspect-[3/2] rounded"
                        className="absolute top-0 w-full rounded"
                        src={project?.node?.featuredImage?.node?.sourceUrl}
                        alt={
                          project?.node?.featuredImage?.node?.altText ||
                          project?.node?.title
                        }
                        layout="fill"
                      />
                    </div>
                  </a>
                )}
                {!project.node.featuredImage && (
                  <a className="w-full h-full" href={project.node.link}>
                    <Image src={projectPlaceholder} alt={project.node.title} />
                  </a>
                )}
                <ProjectBlockDetail project={project.node} />
              </div>
            );
          })}
          <div
            className="h-3"
            data-ref-type="more-projects"
            ref={moreProjectsRef}
          />
        </section>
      </div>
    </PageLayout>
  );
}

Page.query = gql`
  query GetPageData(
    $id: ID!
  ) {
    page(id: $id) {
      uri
    }
    projects {
      edges {
        node {
          id
          menuOrder
          link
          title
          featuredImage {
            node {
              altText
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

Page.variables = () => {
  return {
    id: 'cG9zdDoxNQ=='
  };
};

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page, props: {title: 'Work Page'}});
}

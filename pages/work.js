import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import Image from 'next/image';
import Link from 'next/link'
import { PageLayout } from '../components';
import Helper from '../helper';
import projectPlaceholder from '../assets/images/project-placeholder.jpg';

const ProjectBlockDetail = ({ project }) => {
  return (
    <div className="flex flex-col items-start mt-5 space-y-3 lg:flex-row lg:items-center lg:space-x-7 lg:space-y-0">
      <Link passHref href={project.link}>
        <a className="text-dark_green text-xl leading-none tracking-[0.4px] sm:text-2xl sm:tracking-[0.48px]">
          {project.title}
        </a>
      </Link>
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
    <PageLayout className="work" options={{ currentURI: data.page.uri }} pageData={data.page}>
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
                  <Link passHref href={project.node.uri}>
                    <a className="w-full h-auto">
                      <div
                        style={{
                          // height: 0,
                          // paddingTop: "66.67%",
                          position: 'relative',
                        }}
                      >
                        <Image
                          // className="w-full h-full aspect-[3/2] rounded"
                          className="w-full rounded"
                          src={project?.node?.featuredImage?.node?.mediaItemUrl}
                          style={{objectFit: "cover"}}
                          // layout="fill"
                          sizes="(min-width: 768px) 50vw, 100vw"
                          width={655}
                          height={437}
                          objectFit='cover'
                          alt={
                            project?.node?.featuredImage?.node?.altText ||
                            project?.node?.title
                          }
                        />
                      </div>
                    </a>
                  </Link>
                )}
                {!project.node.featuredImage && (
                  <Link passHref href={project.node.uri}>
                    <a className="w-full h-full">
                      <Image src={projectPlaceholder} alt={project.node.title} />
                    </a>
                  </Link>
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
      title
    }
    projects(where: {orderby: {field: MENU_ORDER, order: ASC}}) {
      edges {
        node {
          id
          menuOrder
          link
          uri
          title
          featuredImage {
            node {
              altText
              mediaItemUrl
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

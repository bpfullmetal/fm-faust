import React from 'react';
import Image from 'next/image';
import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { PageLayout } from '../components';

import {
  ByTheNumberBlock,
  OpeningJobItem,
  TeamStudioFeatured,
  TeamStudioItem,
} from '../components/About';
import Helper from '../helper';

export default function Page(props) {
  const { data } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  const pageContent = data.page.pageAbout;
  const { intro, ourTeam, studioOpenings } = pageContent;

  const [isPageEntered, setIsPageEntered] = React.useState(false);
  const [currentNavMenuItem, setCurrentNavMenuItem] = React.useState('about');
  const [jobListings, setJobListings] = React.useState([]);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [teamMembersAnimate, setTeamMembersAnimate] = React.useState(
    Array(ourTeam?.teamMembers?.length || 0).fill(false)
  );

  const stringToSlug = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric characters with dashes
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
  };

  const { navMenuItems } = React.useMemo(() => {
    const navMenuItems = []

    const { intro, ourTeam, studioOpenings } = pageContent;

    if (intro.menuName) {
      navMenuItems.push({
        id: stringToSlug(intro.menuName),
        name: intro.menuName,
        link: `#${stringToSlug(intro.menuName)}`,
      });
    }
    
    if (ourTeam.menuName) {
      navMenuItems.push({
        id: stringToSlug(ourTeam.menuName),
        name: ourTeam.menuName,
        link: `#${stringToSlug(ourTeam.menuName)}`,
      });
    }
    
    if (studioOpenings.menuName) {
      navMenuItems.push({
        id: stringToSlug(studioOpenings.menuName),
        name: studioOpenings.menuName,
        link: `#${stringToSlug(studioOpenings.menuName)}`,
      });
    }

    return { navMenuItems };
  }, [pageContent]);

  const navSectionRefs = Array(3)
    .fill()
    .map((_) => {
      return React.useRef();
    });

  const ourTeamRefs = Array(3)
    .fill()
    .map((_) => {
      return React.useRef();
    });

  const teamMemberRefs = Array(ourTeam?.teamMembers?.length || 0)
    .fill()
    .map((_) => {
      return React.useRef();
    });

  const openingsTitleRef = React.useRef();

  React.useEffect(() => {
    setJobListings(studioOpenings.jobListings?.filter((job) => job.active));

    setTimeout(() => setIsPageEntered(true), 500);
  }, []);

  React.useEffect(() => {
    Helper.setupIntersectionObserver(navSectionRefs[0], handleIntersection)
  }, [navSectionRefs[0]]);

  React.useEffect(() => {
    Helper.setupIntersectionObserver(navSectionRefs[1], handleIntersection, { threshold: 0.1 })
  }, [navSectionRefs[1]]);

  React.useEffect(() => {
    Helper.setupIntersectionObserver(navSectionRefs[2], handleIntersection)
  }, [navSectionRefs[2]]);

  React.useEffect(() => {
    ourTeamRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection)
    );
  }, [ourTeamRefs]);

  React.useEffect(() => {
    teamMemberRefs.forEach((ref) =>
      Helper.setupIntersectionObserver(ref, handleIntersection)
    );
  }, [teamMemberRefs]);

  React.useEffect(() => {
    Helper.setupIntersectionObserver(openingsTitleRef, handleIntersection);
  }, [openingsTitleRef]);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if (!entry.isIntersecting && !entry.isVisible) return;

    const revealEl = entry.target;
    switch (entry.target.getAttribute('data-animate-ref')) {
      case 'team-member':
        const teamMemberIndex = parseInt(
          entry.target.getAttribute('data-index')
        );
        if (!revealEl.classList.value.includes('animate')) {
          if (window.innerWidth < 768) {
            setTeamMembersAnimate((old) =>
              Array.from(old).map((v, j) => (teamMemberIndex === j ? true : v))
            );
          } else {
            if (teamMemberIndex % 2) {
              setTimeout(
                () =>
                  setTeamMembersAnimate((old) =>
                    Array.from(old).map((v, j) =>
                      teamMemberIndex === j ? true : v
                    )
                  ),
                500
              );
            } else {
              setTeamMembersAnimate((old) =>
                Array.from(old).map((v, j) =>
                  teamMemberIndex === j ? true : v
                )
              );
            }
          }
          revealEl.classList.add('animate');
        }
        break;
      case 'section':
        const sectionIndex = parseInt(
          revealEl.getAttribute('data-section-index')
        );
        if (navMenuItems[sectionIndex]) {
          setCurrentNavMenuItem(navMenuItems[sectionIndex].id);
        }
        break;
      case 'our-team':
        const orderIndex = parseInt(revealEl.getAttribute('data-index'));
        if (orderIndex === 2) {
          setTimeout(() => revealEl.classList.add('reveal'), 500);
        } else {
          revealEl.classList.add('reveal');
        }
        break;
      default:
        revealEl.classList.add('reveal');
    }
  };

  return (
    <PageLayout className="about relative" options={{ currentURI: data.page.uri }} pageData={data.page}>
      <div className={`hidden fixed top-2/4 left-10 md:flex flex-col z-10`}>
        {navMenuItems.map((item) => (
          <div className="uppercase" key={item.id}>
            <a
              className={`flex items-center ${
                currentNavMenuItem === 'careers' ? 'text-black' : ''
              }`}
              href={item.link}
            >
              <div
                className={`w-1.5 h-1.5 rounded ${
                  currentNavMenuItem === item.id
                    ? currentNavMenuItem === 'careers'
                      ? 'bg-black'
                      : 'bg-white'
                    : ''
                } mr-2`}
              ></div>
              {item.name}
            </a>
          </div>
        ))}
      </div>

      <section
        id={stringToSlug(intro?.menuName ?? '')}
        className="relative flex"
        ref={navSectionRefs[0]}
        data-section-index="0"
        data-animate-ref="section"
        data-background="dark"
      >
        {
          intro.backgroundVideo ? (
            <div className="absolute w-full h-full object-cover">
              {
                isVideoLoaded
                ? null
                : intro.backgroundImage?.node?.mediaItemUrl 
                  ? <Image
                      className="featured-image-wrapper w-full h-full object-cover absolute"
                      src={intro.backgroundImage.node.mediaItemUrl}
                      alt={intro.backgroundImage.node.altText}
                      layout="fill"
                      priority={true}
                      unoptimized={true}
                    />
                  : null
              }
              <video
                autoPlay
                muted
                loop
                onLoadedData={() => setIsVideoLoaded(true)}
                className="featured-image-wrapper absolute w-full h-full object-cover"
              >
                <source
                  src={intro.backgroundVideo.node.mediaItemUrl}
                  type="video/mp4"
                ></source>
              </video>
            </div>
          ) : intro.backgroundImage?.node?.mediaItemUrl
              ? (
                <Image
                  className="featured-image-wrapper w-full h-full object-cover absolute inset-0"
                  src={intro.backgroundImage.node.mediaItemUrl}
                  alt={intro.backgroundImage.node.altText}
                  priority={true}
                  layout="fill"
                  unoptimized={true}
                />
              )
              : <div className="absolute w-full h-full bg-dark_red"></div>
        }

        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        <div className="relative w-full max-w-main mx-auto px-5 sm:px-12">
          <div className="relative max-w-[860px] flex flex-col items-between ml-auto">
            { (intro.introText || intro.introSubtext ) && (
              <div className="">
                {
                  intro.introText && (
                    <h2
                      className={`animate-reveal text-3xl leading-[40px] pt-24 ${
                        isPageEntered ? 'reveal' : ''
                      }`}
                    >
                      {intro.introText}
                    </h2>
                  )
                }
                {
                  intro.introSubtext && (
                    <p
                      className={`animate-reveal text-lg leading-[30px] pt-8 pb-24 ${
                        isPageEntered ? 'reveal' : ''
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: intro.introSubtext,
                      }}
                    />
                  )
                }
              </div>
            )}
            {intro.byTheNumber.metrics?.length && (
              <ByTheNumberBlock data={intro.byTheNumber} />
            )}
          </div>
        </div>
      </section>

      <section
        id={stringToSlug(ourTeam?.menuName ?? '')}
        className="bg-dark_red py-48"
        ref={navSectionRefs[1]}
        data-section-index="1"
        data-animate-ref="section"
        data-background="dark"
      >
        <div className="flex flex-col justify-end w-full max-w-main mx-auto px-5 sm:px-12 lg:flex-row">
          <div className="flex h-fit mb-4 lg:justify-end lg:mb-0">
            <p
              className="animate-reveal text-4xl leading-none tracking-[0.36px] lg:w-[200px] lg:text-[65px] lg:leading-[65px] lg:tracking-[0.65px] lg:mr-10"
              ref={ourTeamRefs[0]}
              data-animate-ref="our-team"
              data-index="1"
            >
              Our Team
            </p>
          </div>

          <div className="max-w-[860px] flex flex-col">
            {(ourTeam?.featuredImage?.node?.mediaItemUrl || ourTeam.description) && (
              <div className="flex flex-col mb-48">
                {ourTeam?.featuredImage?.node?.mediaItemUrl && (
                  <div className="animate-reveal" ref={ourTeamRefs[1]}>
                    <Image
                      src={ourTeam?.featuredImage?.node?.mediaItemUrl}
                      alt={ourTeam?.featuredImage?.node?.altText || 'Our team'}
                      // width={ourTeam?.featuredImage?.node?.mediaDetails?.width}
                      // height={ourTeam?.featuredImage?.node?.mediaDetails?.height}
                      layout="fill"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized={true}
                    />
                  </div>
                )}
                {ourTeam.description && (
                  <p
                    className="animate-reveal max-w-[600px] text-sm_extra leading-8 mt-5"
                    ref={ourTeamRefs[2]}
                  >
                    {ourTeam.description}
                  </p>
                )}
              </div>
            )}

            {ourTeam.featuredTeamMembers &&
              ourTeam.featuredTeamMembers.map((teamMember, i) => (
                <div
                  key={`featured-team-member-${i}`}
                  className={`flex flex-col${i % 2 !== 0 ? ' items-end' : ''}${
                    i !== ourTeam.featuredTeamMembers.length - 1 ? ' mb-12 lg:mb-24' : ''
                  }`}
                >
                  <TeamStudioFeatured data={{ ...teamMember }} />
                </div>
              ))}

            {ourTeam.teamMembers && (
              <div className="flex flex-wrap mt-20 lg:mt-32">
                {ourTeam.teamMembers.map((teamMember, i) => (
                  <div
                    data-animate-ref="team-member"
                    data-index={i}
                    key={`team-members-${i}`}
                    ref={teamMemberRefs[i]}
                    className="w-full lg:w-[360px]"
                  >
                    <TeamStudioItem
                      data={teamMember}
                      animate={teamMembersAnimate[i]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id={stringToSlug(studioOpenings?.menuName ?? '')}
        className="bg-light_gray py-24"
        ref={navSectionRefs[2]}
        data-section-index="2"
        data-animate-ref="section"
        data-background="light"
      >
        <div className="flex justify-end w-full max-w-main mx-auto px-5 sm:px-12">
          <div className="w-full max-w-[860px] flex flex-col">
            <h2
              className="animate-reveal text-[65px] text-black leading-[65px] tracking-[0.65px]"
              ref={openingsTitleRef}
            >
              Studio Openings
            </h2>

            <div className="flex flex-col my-16 space-y-5">
              {jobListings?.length ? (
                jobListings.map((pos, i) => (
                  <React.Fragment key={i}>
                    <OpeningJobItem data={pos} order={i} opened={i === 0} />
                  </React.Fragment>
                ))
              ) : (
                <div className="text-black">
                  {studioOpenings.jobsNoListings?.heading && (
                    <h3 className="text-2xl">
                      {studioOpenings.jobsNoListings.heading}
                    </h3>
                  )}
                  {studioOpenings.jobsNoListings?.textContent && (
                    <div>{studioOpenings.jobsNoListings.textContent}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

Page.query = gql`
  query GetPageDataByURI($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      uri
      pageAbout {
        intro {
          menuName
          introText
          introSubtext
          byTheNumber {
            heading
            metrics {
              count
              metric
            }
          }
          backgroundImage {
            node {
              altText
              mediaItemUrl
            }
          }
          backgroundVideo {
            node {
              mediaItemUrl
            }
          }
        }
        ourTeam {
          description
          menuName
          featuredImage {
            node {
              altText
              mediaItemUrl
            }
          }
          featuredTeamMembers {
            bio
            bioMore
            role
            name
            image {
              node {
                altText
                mediaItemUrl
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
          teamMembers {
            bio
            bioMore
            name
            role
          }
        }
        studioOpenings {
          menuName
          jobListings {
            active
            applicationLink
            description
            howToApply
            title
          }
          jobsNoListings {
            heading
            textContent
          }
        }
      }
    }
  }
`;

Page.variables = (seedQuery, context, data) => {
  return {
    uri: 'about',
  };
};

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, {Page, props: {title: 'About Page'}});
}

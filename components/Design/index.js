import React from 'react';
import CategoryModal from './CategoryModal';
import DesignProjectsGrid from './ProjectsGrid';
import { PageLayout } from '../PageLayout';
import ProjectCarouselModal from '../Project/CarouselModal';

export const DesignPageContent = ({
  allCategoriesData,
  allProjectsData,
  currentCategory,
}) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeCategories, setActiveCategories] = React.useState(allCategoriesData);
  const [clickedImageOrder, setClickedImageOrder] = React.useState(-1);
  const [selectedCat, setSelectedCat] = React.useState(
    (Array.isArray(allCategoriesData) && allCategoriesData.length ) ? allCategoriesData[0].node : null
  );
  const [filteredProjectImages, setFilteredProjectImages] = React.useState([]);
  const [animationEntrances, setAnimationEntrances] = React.useState({
    background: false,
    title1: false,
    title2: false,
    project: false,
  });

  React.useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 600);
    };

    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [])

  React.useEffect(() => {
    const timingsArray = currentCategory ? [0, 0, 0, 250] : [0, 250, 750, 1250];
    timingsArray.forEach((ms, i) => {
      setTimeout(
        () =>
          setAnimationEntrances({
            background: i >= 0,
            title1: i >= 1,
            title2: i >= 2,
            project: i >= 3,
          }),
        ms
      );
    });
  }, [currentCategory]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  }

  const handleClickImage = (index, url) => {
    if ( isMobile ) {
      window.location.href = url;
      return
    }
    setClickedImageOrder(index) 
  }

  React.useEffect(() => {
    const categoryNode = (
      allCategoriesData.find((cat) => cat.node.slug === currentCategory) ||
      allCategoriesData[0]
    )?.node;
    setSelectedCat(categoryNode);

    if (allProjectsData.length) {
      const allProjectImages = allProjectsData.flatMap((project) => {
        if ( project.node.projectsSingle.projectImages ) {
          return project.node.projectsSingle.projectImages.filter( projectImage => {
            if ( !projectImage.category ) return false
            return true
          })
        }
        return []
      })
  
      let matchedImages = allProjectsData.flatMap((project) => {
        if ( project.node.projectsSingle.projectImages ) {
          let projectImages = project.node.projectsSingle.projectImages.filter( projectImage => {
            if ( !projectImage.category ) return false
            return projectImage.category.nodes.some(({ slug }) => slug === categoryNode.slug)
          })
          if ( projectImages.length ) {
            projectImages = projectImages.map( image => {
              return {
                image: image.image,
                video: image.video,
                title: project.node.title,
                link: project.node.uri,
                categories: image.category.nodes
              }
            })
            return projectImages
          }
        }
        return [];
      });
      
      matchedImages = shuffleArray(matchedImages)
      
      const filteredCategories = allCategoriesData.filter(category =>
        allProjectImages.some(image =>
          image.category.nodes.some(imageCategory =>
            imageCategory.slug === category.node.slug
          )
        )
      );
      
      setActiveCategories(filteredCategories)
  
      setFilteredProjectImages(matchedImages);
    }
  }, [allCategoriesData, allProjectsData, currentCategory]);

  return (
    <PageLayout
      className="discover"
      options={{ currentURI: '/design', hiddenBookSection: true }}
      pageData={{ title: 'Design' }}
    >
      <section
        className={`bg-dark_blue py-32 sm:py-32 min-h-screen ${
          currentCategory
            ? 'no-animation'
            : animationEntrances.background
            ? 'fade-in'
            : ''
        }`}
      >
        <div className="flex flex-col w-full max-w-main mx-auto px-5 md:px-12">
          <div className="title flex items-center text-2xl leading-[44px] mb-16 sm:text-4xl sm:mb-32">
            <p
              className={
                currentCategory
                  ? 'no-animation'
                  : animationEntrances.title1
                  ? 'fade-in-top'
                  : ''
              }
            >
              Design for &nbsp;
            </p>
            <p
              className={
                currentCategory
                  ? 'no-animation'
                  : animationEntrances.title2
                  ? 'fade-in-top'
                  : ''
              }
            >
              <span
                className="underline cursor-pointer"
                onClick={() => setOpenModal(true)}
              >
                {selectedCat?.name}
              </span>{' '}
              +
            </p>
          </div>

          {(animationEntrances.project && filteredProjectImages.length) ? (
            <DesignProjectsGrid
              category={selectedCat?.slug}
              handleOnClickImage={ handleClickImage }
              projects={filteredProjectImages}
            />
          ) : <></>}
        </div>
      </section>

      {openModal && (
        <CategoryModal
          selectedCat={selectedCat}
          categories={activeCategories}
          onClose={() => setOpenModal(false)}
        />
      )}
      {(clickedImageOrder > -1 && filteredProjectImages) ? (
        <ProjectCarouselModal
          imageBlocks={filteredProjectImages}
          initialSlide={clickedImageOrder}
          onClose={() => setClickedImageOrder(-1)}
        />
      ) : <></>}
    </PageLayout>
  );
}

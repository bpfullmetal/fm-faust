import * as React from 'react';
import Link from 'next/link'

const CategoryModal = ({ categories, selectedCat, onClose }) => {
  const [isEntered, setIsEntered] = React.useState(false);

  React.useEffect(() => {
    setIsEntered(true);
  }, []);

  return (
    <div
      className={`fixed w-screen h-screen top-0 flex ${
        isEntered ? 'bg-[#1a4b7cc0]' : ''
      } transition duration-300 z-30`}
      onClick={onClose}
    >
      <div className="flex flex-col w-full max-w-main mx-auto px-5 sm:px-12">
        <div
          className={`ml-40 mt-12 pl-8 pt-40 transition delay-100 ${
            isEntered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {categories
            .filter((cat) => cat.node.slug !== selectedCat.slug)
            .map((category) => (
              <Link
                passHref
                key={category.node.slug}
                href={`/design/${category.node.slug}`}
              >
                <a className="title flex items-center w-fit text-3xl leading-[44px] capitalize my-2 sm:text-4xl">
                  {category.node.name}
                </a>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

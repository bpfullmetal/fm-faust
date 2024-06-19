const setupIntersectionObserver = (ref, handleIntersection, options = null) => {
  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '0px', // No margin
    threshold: 0.3, // Trigger when 30% of the target is in the viewport
    ...options,
  };

  const observer = new IntersectionObserver(
    handleIntersection,
    observerOptions
  );
  if (ref.current) {
    observer.observe(ref.current);
  }
  return () => {
    observer.unobserve(ref.current);
  };
};

const Helper = {
  setupIntersectionObserver,
};

export default Helper;

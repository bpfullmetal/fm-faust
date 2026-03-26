import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Helper from '../../helper';
import ProjectCarouselModal from './CarouselModal';
import NextProject from './NextProject';
import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useRef, useState } from 'react';

const ProjectContent = ({ project, scrollContainerRef, isPreview = false }) => {
  // --- helpers for block content ---
  const isEmptyHtml = (html) => {
    if (!html) return true;
    const stripped = String(html)
      .replace(/<\s*br\s*\/?\s*>/gi, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .trim();
    return stripped.length === 0;
  };

  const blockHasRenderableContent = (block) => {
    if (!block) return false;

    // Paragraph
    if (block.name === 'core/paragraph') {
      console.log('block attributes', block?.attributes)
      return !isEmptyHtml(block?.attributes?.content);
    }

    // Image (treat as content if it has an id, URL, or a file path)
    if (block.name === 'core/image') {
      const attachmentId = block?.attributes?.id || block?.attributes?.attachmentId;
      const fp = block?.mediaDetails?.filePath;
      const imageUrl = block?.attributes?.url || block?.attributes?.src || block?.sourceUrl;
      return !!attachmentId || !!fp || !!imageUrl;
    }

    // Containers
    const inner = block?.innerBlocks;
    if (Array.isArray(inner) && inner.length) {
      return inner.some((b) => blockHasRenderableContent(b));
    }

    return false;
  };

  const { title, featuredImage, projectsSingle, editorBlocks } = project;
  
  const [isMobile, setIsMobile] = React.useState(false);
  const [clickedImageOrder, setClickedImageOrder] = React.useState(-1);

  const wpUploadsBase =
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WP_URL ||
    '';

  const resolveCoreImageSrc = (block) => {
    const directUrl = block?.attributes?.url || block?.attributes?.src || block?.sourceUrl;
    if (directUrl) return directUrl;

    const fp = block?.mediaDetails?.filePath;
    if (!fp) return null;
    if (fp.startsWith('http://') || fp.startsWith('https://')) return fp;
    if (!wpUploadsBase) return fp; // best effort
    if (fp.startsWith('/')) return `${wpUploadsBase}${fp}`;
    return `${wpUploadsBase}/${fp}`;
  };

  const normalizeFreeformBlocks = (blocks) => {
      return (blocks || [])
        .filter((b) => b?.name === 'freeform-layout/freeform-layout' && b?.attributes)
        .map((b) => {
          const layout = safeJson(b.attributes?.layout, {});
          const metadata = safeJson(b.attributes?.metadata, {});
          return {
            ...b,
            attributes: {
              ...b.attributes,
              layout,
              metadata,
            },
          };
        });
    };
  
    const mediaIds = useMemo(() => {
      const ids = [];
      const freeformBlocks = normalizeFreeformBlocks(editorBlocks);
  
      for (const block of freeformBlocks) {
        const activeBreakpoint = block?.attributes?.activeBreakpoint || 'desktop';
        const items = block?.attributes?.layout?.[activeBreakpoint] || [];
        for (const item of items) {
          if (item?.type === 'image' && item?.attachmentId) {
            ids.push(String(item.attachmentId));
          }
        }
      }
  
      return Array.from(new Set(ids));
    }, [editorBlocks]);
  
    const { data: mediaData } = useQuery(GET_MEDIA_ITEMS, {
      variables: { ids: mediaIds },
      skip: mediaIds.length === 0,
    });
  
    const mediaById = useMemo(() => {
      const map = {};
      const nodes = mediaData?.mediaItems?.nodes || [];
      for (const n of nodes) {
        if (n?.databaseId != null) map[String(n.databaseId)] = n;
      }
      return map;
    }, [mediaData]);

      // --- projectImages derived from core/column image blocks (exclude paragraph-only columns) ---
    const { projectImages, columnFirstImageIndexByBlock } = useMemo(() => {
      const images = [];
      const colFirstIndexByBlock = new Map();

      const findImagesInBlocks = (blocks, out = []) => {
        for (const b of blocks || []) {
          if (!b?.name) continue;
          if (b.name === 'core/image') out.push(b);
          if (Array.isArray(b?.innerBlocks) && b.innerBlocks.length) {
            findImagesInBlocks(b.innerBlocks, out);
          }
        }
        return out;
      };

      const walk = (blocks) => {
        for (const b of blocks || []) {
          // console.log('core/column style', b?.cssClassName);
          if (!b?.name) continue;

          if (b.name === 'core/column' && blockHasRenderableContent(b)) {
            
            const startIndex = images.length;

            const imgBlocks = findImagesInBlocks(b?.innerBlocks || []);
            for (const imgBlock of imgBlocks) {
              const attachmentId =
                imgBlock?.attributes?.id || imgBlock?.attributes?.attachmentId;

              const media =
                attachmentId != null ? mediaById[String(attachmentId)] : null;

              const src = media?.sourceUrl || resolveCoreImageSrc(imgBlock);
              if (!src) continue;

              const w = Number(media?.mediaDetails?.width || imgBlock?.mediaDetails?.width);
              const h = Number(media?.mediaDetails?.height || imgBlock?.mediaDetails?.height);

              const alt = media?.altText || imgBlock?.attributes?.alt || '';

              const carouselIndex = images.length;

              images.push({
                carouselIndex, // <-- add index directly to object
                image: {
                  node: {
                    mediaItemUrl: src,
                    altText: alt,
                    id: String(attachmentId || src),
                    mediaDetails: {
                      width: Number.isFinite(w) ? w : null,
                      height: Number.isFinite(h) ? h : null,
                    },
                  },
                },
              });
            }

            const firstIndex = images.length > startIndex ? startIndex : null;
            colFirstIndexByBlock.set(b, firstIndex);
          }

          if (Array.isArray(b?.innerBlocks) && b.innerBlocks.length) {
            walk(b.innerBlocks);
          }
        }
      };

      walk(editorBlocks);

      return { projectImages: images, columnFirstImageIndexByBlock: colFirstIndexByBlock };
    }, [editorBlocks, mediaById]);

    // --- collect all core/column blocks with content, and index map ---
    const coreColumnsWithContent = useMemo(() => {
      const cols = [];

      const walk = (blocks) => {
        for (const b of blocks || []) {
          if (b?.name === 'core/column' && blockHasRenderableContent(b)) {
            cols.push(b);
          }
          if (Array.isArray(b?.innerBlocks) && b.innerBlocks.length) {
            walk(b.innerBlocks);
          }
        }
      };

      walk(editorBlocks);
      return cols;
    }, [editorBlocks]);

    const coreColumnIndexById = useMemo(() => {
      const map = {};
      coreColumnsWithContent.forEach((b, idx) => {
        const k = b?.clientId || b?.id;
        if (k != null) map[String(k)] = idx;
      });
      return map;
    }, [coreColumnsWithContent]);

    const [projectRefs, setProjectRefs] = React.useState([]);
    useEffect(() => {
      setProjectRefs((prev) => {
        const next = Array(coreColumnsWithContent.length)
          .fill(null)
          .map((_, i) => prev[i] || React.createRef());
        return next;
      });
    }, [coreColumnsWithContent.length]);

  React.useEffect(() => {
    // Observe the actual rendered project blocks to avoid ref/index mismatches.
    const t = window.setTimeout(() => {
      const containerEl =
        scrollContainerRef?.current || document.getElementById('project-images-container');
      if (!containerEl) return;

      const els = Array.from(containerEl.querySelectorAll('.project-block')).filter(Boolean);
      if (!els.length) return;

      const observer = new window.IntersectionObserver(
        (entries) => {
          handleIntersection(entries);
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -10% 0px',
        }
      );

      els.forEach((el) => observer.observe(el));
      // stash on window for quick debugging if needed
      containerEl.__projectObserver = observer;
    }, 0);

    return () => {
      window.clearTimeout(t);
      const containerEl =
        scrollContainerRef?.current || document.getElementById('project-images-container');
      try {
        containerEl?.__projectObserver?.disconnect();
      } catch (e) {}
      if (containerEl) containerEl.__projectObserver = null;
    };
  }, [editorBlocks, scrollContainerRef]);

  const handleDisplayImage = (event) => {
    const imgEl = event?.currentTarget || event?.target;
    if (!imgEl) return;

    const projectBlock = imgEl.closest('.project-block');
    imgEl.classList.add('loaded');

    if (projectBlock && projectBlock.classList.contains('should-reveal')) {
      projectBlock.classList.add('reveal');
    }
  };

  const handleIntersection = (entries) => {
    const list = Array.isArray(entries) ? entries : [entries];
    if (!list.length) return;

    list.forEach((entry) => {
      if (!entry) return;
      if (!entry.isIntersecting) return;
      if (entry.target.classList.contains('reveal')) return;

      const featuredImageWrapper = entry.target.querySelector('.featured-image-wrapper');

      // Image columns: wait for the image to load before revealing
      if (featuredImageWrapper) {
        if (featuredImageWrapper.classList.contains('loaded')) {
          entry.target.classList.add('reveal');
        } else {
          entry.target.classList.add('should-reveal');
        }
        return;
      }

      // Paragraph-only columns: reveal immediately on intersection
      const hasParagraph =
        entry.target.classList.contains('wp-inner-paragraph') ||
        !!entry.target.querySelector('.wp-block-paragraph');

      if (hasParagraph) {
        entry.target.classList.add('reveal');
        // Optional: mark paragraphs as loaded for CSS hooks if needed
        const p = entry.target.querySelector('.wp-block-paragraph');
        if (p) p.classList.add('loaded');
        return;
      }

      // Fallback: if it's some other content, reveal immediately
      entry.target.classList.add('reveal');
    });
  };

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
  }, []);

  // --- Render-order ref assignment for core/column blocks ---
  const columnRenderCursor = useRef(0);
  columnRenderCursor.current = 0;

  const nextColumnRef = () => {
    const i = columnRenderCursor.current;
    columnRenderCursor.current += 1;
    return projectRefs[i];
  };

  return (
    <>
      {featuredImage && (
        <section className="h-home_banner">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              className="featured-image-wrapper w-full h-full object-cover rounded-none"
              src={featuredImage.node.mediaItemUrl}
              fill
              // sizes="(min-width: 1024px) 50vw, 70vw"
              quality={100}
              loading="eager"
              priority={true}
              alt={featuredImage.node.altText || title}
            />
            <h1 className="absolute max-w-[480px] text-4xl font-medium !leading-none text-center md:max-w-[580px] md:text-5xl lg:max-w-[680px] lg:text-[58px]">
              {title}
            </h1>
          </div>
        </section>
      )}

      <section className="work-project flex flex-col bg-[#300808]">
        <div className="w-full mx-auto">
          {!featuredImage && (
            <h1 className="mx-auto mt-12 mb-12 max-w-[480px] text-3xl font-medium !leading-none text-center md:max-w-[580px] md:text-4xl lg:max-w-[680px] lg:text-[38px] text-center">
              {title}
            </h1>
          )}

          {editorBlocks.length ? (
            <div
              id="project-images-container"
              ref={scrollContainerRef}
              className="flex flex-col mt-8 mt-[4vw] md:mt-[4vw]"
            >
              {(editorBlocks || []).map((block, idx) => {
                // Skip freeform blocks here (already rendered above)
                if (block?.name === 'freeform-layout/freeform-layout') return null;
                return (
                  <BlockRenderer
                    key={block?.clientId || block?.id || `block-${idx}`}
                    block={block}
                    mediaById={mediaById}
                    resolveCoreImageSrc={resolveCoreImageSrc}
                    projectRefs={projectRefs}
                    coreColumnIndexById={coreColumnIndexById}
                    onImageLoad={handleDisplayImage}
                    defaultAlt={title}
                    nextColumnRef={nextColumnRef}
                    hasRenderableContent={blockHasRenderableContent}
                    isMobile={isMobile}
                    columnFirstImageIndexByBlock={columnFirstImageIndexByBlock}
                    onOpenImage={(i) => setClickedImageOrder(i)}
                  />
                );
              })}
            </div>
          ) : <></>}

          {(
            projectsSingle?.projectDetails?.attributes?.length) && (
            <div className="flex flex-col mt-8 items-center pt-24 pb-32">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setRevealProjectInfo((old) => !old)}
              >
                <h3 className="text-taupe text-xl leading-[44px] sm:text-[26px] mb-6">
                  {projectsSingle.projectDetails.label ||
                    'Credits'}
                </h3>
              </div>
              <div
                className={`text-taupe w-full md:w-1/2 h-0 h-full pt-2 flex flex-col items-center text-center`}
              >
                <div className="project-details">
                  {projectsSingle.projectDetails.attributes.map(
                    (attribute, i) => (
                      <div
                        key={`project-details-${i}`}
                        className="flex flex-col pt-6 space-y-2"
                      >
                        <p className="text-taupe text-lg">
                          {attribute.label && (
                            <strong>{attribute.label}:</strong>
                          )}
                          {attribute.attributeListings && (
                            <>
                              {attribute.attributeListings.map(
                                (attItem, a) => {
                                  return (
                                    <span className="ml-2" key={`project-attribute-${a}`}>
                                      {attItem.link ? (
                                        <Link
                                          key={`project-attribute-${a}`}
                                          target="_blank"
                                          className="underline"
                                          href={attItem.link}
                                          rel="noreferrer"
                                        >
                                          <span>{attItem.title}</span>
                                        </Link>
                                      ) : (
                                        <>{attItem.title}</>
                                      )}
                                      {a !==
                                        attribute.attributeListings.length -
                                          1 && <span>, </span>}
                                    </span>
                                  );
                                }
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!isPreview && <NextProject currentProject={project} />}

      {clickedImageOrder > -1 && (
        <ProjectCarouselModal
          imageBlocks={projectImages}
          initialSlide={clickedImageOrder}
          onClose={() => setClickedImageOrder(-1)}
        />
      )}
    </>
  );
};

function BlockRenderer({
  block,
  mediaById,
  resolveCoreImageSrc,
  projectRefs,
  coreColumnIndexById,
  onImageLoad,
  defaultAlt,
  nextColumnRef,
  hasRenderableContent,
  isMobile,
  columnFirstImageIndexByBlock,
  onOpenImage,
}) {
  if (!block) return null;
  // Helper to collect wp-inner-* classes from descendants
  const getInnerTypeClasses = (blocks) => {
    const set = new Set();

    const walk = (arr) => {
      (arr || []).forEach((b) => {
        if (!b?.name) return;

        // e.g. core/image -> wp-inner-image, core/paragraph -> wp-inner-paragraph
        if (b.name.startsWith('core/')) {
          const type = b.name.replace('core/', '').trim();
          if (type) set.add(`wp-inner-${type}`);
        }

        if (Array.isArray(b?.innerBlocks) && b.innerBlocks.length) {
          walk(b.innerBlocks);
        }
      });
    };

    walk(blocks);
    return Array.from(set);
  };
  // console.log('block', block, 'mediabyid', mediaById)
  // WP core block names are usually like: "core/columns", "core/column", "core/paragraph", "core/image"
  switch (block.name) {
    case 'core/columns': {
      const inner = block?.innerBlocks || [];
      const attrs = block?.attributes || {};
      const align = attrs?.align;
      const stackedOnMobile = attrs?.isStackedOnMobile;
      const vAlign = attrs?.verticalAlignment;
      
      const className = [
        'wp-block-columns',
        attrs?.cssClassName,
        align ? `align${align}` : null,
        vAlign ? `are-vertically-aligned-${vAlign}` : null,
        stackedOnMobile === false ? 'is-not-stacked-on-mobile' : null,
      ]
        .filter(Boolean)
        .join(' ');

      // Let theme CSS handle the real layout whenever possible.
      return (
        <div className={className}>
          {inner.map((b, i) => (
            <BlockRenderer
              key={b?.clientId || b?.id || `columns-${i}`}
              block={b}
              mediaById={mediaById}
              resolveCoreImageSrc={resolveCoreImageSrc}
              projectRefs={projectRefs}
              coreColumnIndexById={coreColumnIndexById}
              onImageLoad={onImageLoad}
              defaultAlt={defaultAlt}
              nextColumnRef={nextColumnRef}
              hasRenderableContent={hasRenderableContent}
              isMobile={isMobile}
              columnFirstImageIndexByBlock={columnFirstImageIndexByBlock}
              onOpenImage={onOpenImage}
            />
          ))}
        </div>
      );
    }

    case 'core/column': {
      const inner = block?.innerBlocks || [];
      const attrs = block?.attributes || {};
      const innerTypeClasses = getInnerTypeClasses(inner);
      const vAlign = attrs?.verticalAlignment;
      const isEmptyColumn =
        typeof hasRenderableContent === 'function' ? !hasRenderableContent(block) : inner.length === 0;
      // console.log('columns', block?.attributes?.style, block?.attributes?.layout, block?.attributes?.cssClassName, block?.attributes?.width)
      const width = attrs?.width; // typically something like "33.33%" or "250px" depending on editor
      const normalizedWidth = typeof width === 'string' ? width.trim() : width;
      const widthIsPercent =
        typeof normalizedWidth === 'string' && normalizedWidth.endsWith('%');
      const safeWidth = widthIsPercent
        ? `calc(${normalizedWidth} - 2vw)`
        : normalizedWidth;
      // console.log('attrs', attrs)
      const className = [
        'wp-block-column',
        'image-reveal',
        'image-to-lightbox',
        'project-block',
        attrs?.cssClassName,
        vAlign ? `is-vertically-aligned-${vAlign}` : null,
        isEmptyColumn ? 'is-empty-column' : null,
        ...innerTypeClasses,
      ]
        .filter(Boolean)
        .join(' ');
      const style = safeWidth
        ? {
            flex: widthIsPercent ? `0 1 ${safeWidth}` : `0 0 ${safeWidth}`,
            flexBasis: safeWidth,
            width: safeWidth,
            minWidth: 0,
            maxWidth: safeWidth,
          }
        : {
            flex: '1 1 0%',
            minWidth: 0,
          };

      const imageIndex = columnFirstImageIndexByBlock instanceof Map
      ? columnFirstImageIndexByBlock.get(block) ?? null
      : null;

      const handleColumnClick = () => {
        if (isMobile) return;
        if (imageIndex == null) return;
        if (typeof onOpenImage === 'function') onOpenImage(imageIndex);
      };
      // const colIndex = colKey && coreColumnIndexById ? coreColumnIndexById[colKey] : undefined;

      // Prefer stable id-based mapping when available; otherwise assign refs by render order.
      // const colRef =
      //   colIndex != null && projectRefs && projectRefs[colIndex]
      //     ? projectRefs[colIndex]
      //     : typeof nextColumnRef === 'function'
      //     ? nextColumnRef()
      //     : undefined;
      return (
        <div
          className={className}
          style={style}
          onClick={imageIndex != null ? handleColumnClick : undefined}
        >
          <div className="wp-block-column__inner">
            {!isEmptyColumn &&
              inner.map((b, i) => (
                <BlockRenderer
                  key={b?.clientId || b?.id || `column-${i}`}
                  block={b}
                  mediaById={mediaById}
                  resolveCoreImageSrc={resolveCoreImageSrc}
                  projectRefs={projectRefs}
                  coreColumnIndexById={coreColumnIndexById}
                  onImageLoad={onImageLoad}
                  defaultAlt={defaultAlt}
                  nextColumnRef={nextColumnRef}
                  hasRenderableContent={hasRenderableContent}
                />
              ))}
          </div>
        </div>
      );
    }

    case 'core/paragraph': {
      const html = block?.attributes?.content || '';
      // Drop empty paragraphs (common in WP editor output)
      console.log('block', block)
      const className = ['wp-block-paragraph'].filter(Boolean).join(' ');
      const stripped = String(html)
        .replace(/<\s*br\s*\/?\s*>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .trim();
      if (!stripped.length) return null;
      return <p className={`text-taupe wp-block-paragraph${block?.attributes?.align ? ` text-${block.attributes.align}` : ''}${block?.attributes?.cssClassName ? ` ${block.attributes.cssClassName}` : ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case 'core/image': {
      // Prefer mediaById if an attachmentId is present (some setups include it), otherwise fall back to filePath or url.
      const attachmentId = block?.attributes?.id || block?.attributes?.attachmentId;
      const media = attachmentId != null ? mediaById[String(attachmentId)] : null;
      const src = media?.sourceUrl || resolveCoreImageSrc(block);
      const alt = media?.altText || block?.attributes?.alt || '';
      if (!src) return null;

      // Get real width/height if available
      const w = Number(media?.mediaDetails?.width || block?.mediaDetails?.width);
      const h = Number(media?.mediaDetails?.height || block?.mediaDetails?.height);
      const hasDims = Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;

      // Prefer native aspect-ratio (clean, supports any ratio). Fallback to padding-bottom when dims are missing.
      const wrapperStyle = hasDims
        ? { position: 'relative', width: '100%', aspectRatio: `${w} / ${h}` }
        : { position: 'relative', width: '100%', paddingBottom: '75%' };

      const isLandscape = hasDims ? w >= h : true;

      const sizes = isLandscape
        ? '(max-width: 768px) 100vw, 100vw'
        : '(max-width: 768px) 100vw, 50vw';

      return (
        <figure className="wp-block-image">
          <div style={wrapperStyle}>
            <Image
              className="featured-image-wrapper w-full h-auto"
              src={src}
              alt={alt || defaultAlt || ''}
              fill
              sizes={sizes}
              quality={85}
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onLoad={(event) => {
                if (typeof onImageLoad === 'function') onImageLoad(event);
              }}
            />
          </div>
        </figure>
      );
    }

    default: {
      // If it's a container block we got via fragments, try rendering its innerBlocks anyway.
      const inner = block?.innerBlocks;
      if (Array.isArray(inner) && inner.length) {
        return (
          <>
            {inner.map((b, i) => (
              <BlockRenderer
                key={b?.clientId || b?.id || `inner-${i}`}
                block={b}
                mediaById={mediaById}
                resolveCoreImageSrc={resolveCoreImageSrc}
                projectRefs={projectRefs}
                coreColumnIndexById={coreColumnIndexById}
                onImageLoad={onImageLoad}
                defaultAlt={defaultAlt}
                nextColumnRef={nextColumnRef}
                hasRenderableContent={hasRenderableContent}
              />
            ))}
          </>
        );
      }
      return null;
    }
  }
}

const GET_MEDIA_ITEMS = gql`
  query GetMediaItems($ids: [ID!]!) {
    mediaItems(where: { in: $ids }) {
      nodes {
        databaseId
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;


export default ProjectContent;

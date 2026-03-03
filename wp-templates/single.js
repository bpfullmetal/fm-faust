import { gql, useQuery } from '@apollo/client';
import { useFaustQuery } from '@faustwp/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageLayout } from '../components';

const safeJson = (val, fallback = {}) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
};

const GET_POST_QUERY = gql`
  query GetPost($databaseId: ID!, $asPreview: Boolean = false) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
      date
      author {
        node {
          name
        }
      }
      editorBlocks {
        name
        clientId
        blockEditorCategoryName
        ... on FreeformLayoutFreeformLayout {
          apiVersion
          blockEditorCategoryName
          # attributes {
          #   activeBreakpoint
          #   className
          #   layout
          #   lock
          #   metadata
          # }
        }
        ... on CoreColumns {
          anchor
          apiVersion
          name
          attributes {
            align
            verticalAlignment
            isStackedOnMobile
            cssClassName
            layout
            style
          }
          innerBlocks {
            blockEditorCategoryName
            ... on CoreImage {
              anchor
              apiVersion
              mediaDetails {
                file
                filePath
                height
                width
              }
              name
            }
            ... on CoreColumn {
              anchor
              apiVersion
              name
              attributes {
                cssClassName
                width
                verticalAlignment
                layout
                style
              }
              innerBlocks {
                ... on CoreImage {
                  mediaDetails {
                    filePath
                    height
                    width
                    file
                  }
                  name
                }
                ... on CoreParagraph {
                  attributes {
                    content
                  }
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_MEDIA_ITEMS = gql`
  query GetMediaItems($ids: [ID!]!) {
    mediaItems(where: { in: $ids }) {
      nodes {
        databaseId
        sourceUrl
        altText
      }
    }
  }
`;

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { post } = useFaustQuery(GET_POST_QUERY);
  
  const editorBlocks = useMemo(() => post?.editorBlocks || [], [post]);

  const wpUploadsBase =
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WP_URL ||
    '';

  const resolveCoreImageSrc = (block) => {
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

  const { content } = post ?? {};
  return (
    <PageLayout
      options={{ currentURI: props?.data?.page?.uri, hiddenBookSection: true }}
      pageData={props?.data?.page}
    >
      <article>
        <EditorBlocks
          blocks={editorBlocks}
          mediaById={mediaById}
          normalizeFreeformBlocks={normalizeFreeformBlocks}
          resolveCoreImageSrc={resolveCoreImageSrc}
        />
      </article>
    </PageLayout>
  );
}

function FreeformCanvas({
  blockKey,
  items,
  activeBreakpoint,
  canvasMeta,
  mediaById,
  bottomSpacingPx,
}) {
  const wrapRef = useRef(null);
  const [widthPx, setWidthPx] = useState(0);
  const spacing = Number(bottomSpacingPx) || 24;

  // Track canvas width so we can compute a real pixel height.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = entry?.contentRect?.width;
      if (typeof w === 'number') setWidthPx(w);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const requiredHeightPx = useMemo(() => {
    const W = widthPx;
    const minContentH = activeBreakpoint === 'mobile' ? 400 : 600;
    if (!items?.length || !W) return minContentH + spacing;

    let maxBottomPx = 0;

    for (const it of items) {
      if (!it) continue;

      // Pixel items.
      if (it.unit !== 'pct') {
        const y = Number(it.y) || 0;
        const h = Number(it.h) || 0;
        maxBottomPx = Math.max(maxBottomPx, y + h);
        continue;
      }

      // Percent items: y/h are % of WIDTH (vw-like).
      const yPct = Number(it.y) || 0;
      const yPx = (W * yPct) / 100;

      // Use stored h% for all pct items (including images). Images fill their box via <img height:100% />.
      const hPct = Number(it.h) || 0;
      const hPx = (W * hPct) / 100;
      maxBottomPx = Math.max(maxBottomPx, yPx + hPx);
    }

    const contentHeightPx = Math.max(minContentH, Math.ceil(maxBottomPx));
    return contentHeightPx + spacing;
  }, [items, widthPx, activeBreakpoint, spacing]);

  return (
    <div>
      <div
        key={blockKey}
        ref={wrapRef}
        style={{
          position: 'relative',
          width: '100%',
          height: requiredHeightPx,
          paddingBottom: spacing,
          boxSizing: 'border-box',
          marginBottom: spacing,
        }}
      >
        {items.map((item) => {
          const asPct = item?.unit === 'pct';

          const W = widthPx || 0;
          const topPx = asPct ? (W * (Number(item.y) || 0)) / 100 : null;
          const heightPx = asPct ? (W * (Number(item.h) || 0)) / 100 : null;

          const commonStyle = {
            position: 'absolute',
            left: asPct ? `${item.x}%` : item.x,
            top: asPct ? topPx : item.y,
            width: asPct ? `${item.w}%` : item.w,
            height: asPct ? heightPx : item.h,
            zIndex: item.z,
            color: 'black',
            overflow: item.type === 'image' ? 'hidden' : 'visible',
          };

          if (item.type === 'image') {
            const media = mediaById[String(item.attachmentId)];
            const src = media?.sourceUrl;
            const alt = media?.altText || '';
            if (!src) return null;

            return (
              <div key={item.id} style={commonStyle}>
                <img
                  src={src}
                  alt={alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              style={commonStyle}
              dangerouslySetInnerHTML={{ __html: item.html || '' }}
            />
          );
        })}
      </div>
      <div className="relative h-8"></div>
    </div>
  );
}

function EditorBlocks({
  blocks,
  mediaById,
  normalizeFreeformBlocks,
  resolveCoreImageSrc,
}) {
  const freeformBlocks = useMemo(() => normalizeFreeformBlocks(blocks), [blocks, normalizeFreeformBlocks]);

  return (
    <>
      {/* Render freeform-layout blocks via existing FreeformCanvas */}
      {freeformBlocks.map((block) => {
        const activeBreakpoint = block?.attributes?.activeBreakpoint || 'desktop';
        const items = block?.attributes?.layout?.[activeBreakpoint] || [];
        const canvasByBp = block?.attributes?.metadata?.canvasByBreakpoint || {};
        const canvasMeta = canvasByBp?.[activeBreakpoint];

        return (
          <FreeformCanvas
            key={block.clientId}
            blockKey={block.clientId}
            items={items}
            activeBreakpoint={activeBreakpoint}
            canvasMeta={canvasMeta}
            mediaById={mediaById}
            bottomSpacingPx={block?.attributes?.metadata?.bottomSpacingPx}
          />
        );
      })}

      {/* Render all other supported core blocks */}
      {(blocks || []).map((block) => {
        // Skip freeform blocks here (already rendered above)
        if (block?.name === 'freeform-layout/freeform-layout') return null;
        return (
          <BlockRenderer
            key={block?.clientId || block?.id || Math.random()}
            block={block}
            mediaById={mediaById}
            resolveCoreImageSrc={resolveCoreImageSrc}
          />
        );
      })}
    </>
  );
}

function BlockRenderer({ block, mediaById, resolveCoreImageSrc }) {
  if (!block) return null;
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
          {inner.map((b) => (
            <BlockRenderer
              key={b?.clientId || b?.id || Math.random()}
              block={b}
              mediaById={mediaById}
              resolveCoreImageSrc={resolveCoreImageSrc}
            />
          ))}
        </div>
      );
    }

    case 'core/column': {
      const inner = block?.innerBlocks || [];
      const attrs = block?.attributes || {};
      const width = attrs?.width; // typically something like "33.33%" or "250px" depending on editor
      const vAlign = attrs?.verticalAlignment;
      console.log('attrs', attrs)
      const className = [
        'wp-block-column',
        attrs?.cssClassName,
        vAlign ? `is-vertically-aligned-${vAlign}` : null,
      ]
        .filter(Boolean)
        .join(' ');

      const style = {
        ...(width ? { flexBasis: width, width } : null),
        minWidth: 0,
      };

      return (
        <div className={className} style={style}>
          {inner.map((b) => (
            <BlockRenderer
              key={b?.clientId || b?.id || Math.random()}
              block={b}
              mediaById={mediaById}
              resolveCoreImageSrc={resolveCoreImageSrc}
            />
          ))}
        </div>
      );
    }

    case 'core/paragraph': {
      const html = block?.attributes?.content || '';
      return <p className="wp-block-paragraph" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case 'core/image': {
      // Prefer mediaById if an attachmentId is present (some setups include it), otherwise fall back to filePath.
      const attachmentId = block?.attributes?.id || block?.attributes?.attachmentId;
      const media = attachmentId != null ? mediaById[String(attachmentId)] : null;
      const src = media?.sourceUrl || resolveCoreImageSrc(block);
      const alt = media?.altText || '';
      if (!src) return null;

      return (
        <figure className="wp-block-image">
          <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        </figure>
      );
    }

    default: {
      // If it's a container block we got via fragments, try rendering its innerBlocks anyway.
      const inner = block?.innerBlocks;
      if (Array.isArray(inner) && inner.length) {
        return (
          <>
            {inner.map((b) => (
              <BlockRenderer
                key={b?.clientId || b?.id || Math.random()}
                block={b}
                mediaById={mediaById}
                resolveCoreImageSrc={resolveCoreImageSrc}
              />
            ))}
          </>
        );
      }
      return null;
    }
  }
}

Component.queries = [
  {
    query: GET_POST_QUERY,
    variables: ({ databaseId }, ctx) => ({
      databaseId,
      asPreview: ctx?.asPreview,
    }),
  },
];

import { lazy, Suspense, useState, useEffect, useCallback } from 'react';

const componentMap = {
  heroBanner: lazy(() => import('../common/HeroBanner')),
  justForYou: lazy(() => import('../product/ProductCatalogue')),
  contentBlock: lazy(() => import('../common/ContentBlock')),
  categoryGrid: lazy(() => import('../category/CategoryGrid')),
  // productCarousel: lazy(() => import('../product/ProductCarousel')),
};

export default function DynamicPageRenderer({ template: initialTemplate = [], screen = null }) {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (initialTemplate?.length > 0) {
      setLoadedCount(1);
    } else {
      setLoadedCount(0);
    }
  }, [initialTemplate]);

  const template = initialTemplate.slice(0, loadedCount);

  const getOnLoadedCallback = useCallback((index) => {
    return () => {
      if (index === loadedCount - 1 && loadedCount < initialTemplate.length) {
        setLoadedCount((prev) => prev + 1);
      }
    };
  }, [loadedCount, initialTemplate.length]);

  return (
    <div className="xpo_flex xpo_flex-col xpo_gap-8">
      {template.length > 0 ? (
        template.map(({ type, props }, index) => {
          const Component = componentMap?.[type];
          if (!Component) return null;

          const stableKey = `component-${index}`;

          return (
            <div key={stableKey}>
              <Suspense
                fallback={
                  <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-12">
                    <div className="xpo_animate-pulse">Loading {type}...</div>
                  </div>
                }
              >
                <Component
                  {...props}
                  onLoaded={getOnLoadedCallback(index)}
                />
              </Suspense>
            </div>
          );
        })
      ) : (
        <div className="xpo_text-center xpo_py-12">No content available</div>
      )}
    </div>
  );
}

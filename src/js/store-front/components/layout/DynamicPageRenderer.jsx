import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { useLocale } from "../../hooks/useLocale";
import { sprintf } from 'sprintf-js';

const componentMap = {
  heroBanner: lazy(() => import('../common/HeroBanner')),
  justForYou: lazy(() => import('../product/ProductCatalogue')),
  contentBlock: lazy(() => import('../common/ContentBlock')),
  categoryGrid: lazy(() => import('../category/CategoryGrid')),
};

export default function DynamicPageRenderer({ template: initialTemplate = [], screen = null }) {
  const { __ } = useLocale();
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
    <div className="flex flex-col gap-8">
      {template.length > 0 ? (
        template.map(({ type, props }, index) => {
          const Component = componentMap?.[type];
          if (!Component) return null;

          const stableKey = `component-${index}`;

          return (
            <div key={stableKey}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-pulse">{sprintf(__('Loading %s...', 'site-core'), type)}</div>
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
        <div className="text-center py-12">{__('No content available', 'site-core')}</div>
      )}
    </div>
  );
}

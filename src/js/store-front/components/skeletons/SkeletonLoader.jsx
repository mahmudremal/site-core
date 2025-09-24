export const SkeletonLoader = ({ className }) => (
  <div className={`xpo_animate-pulse xpo_bg-gray-300 xpo_rounded ${className}`}></div>
);


export const GallerySkeleton = () => (
  <div>
    <SkeletonLoader className="xpo_w-full xpo_h-96 xpo_mb-4" />
    <div className="xpo_grid xpo_grid-cols-4 xpo_gap-2">
      {[...Array(4).keys()].map(i => <SkeletonLoader key={i} className="xpo_w-full xpo_h-24" />)}
    </div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div>
    <SkeletonLoader className="xpo_h-8 xpo_w-3/4 xpo_mb-4" />
    <div className="xpo_flex xpo_items-center xpo_mb-4">
      <SkeletonLoader className="xpo_h-5 xpo_w-32 xpo_mr-2" />
      <SkeletonLoader className="xpo_h-4 xpo_w-24" />
    </div>
    <SkeletonLoader className="xpo_h-8 xpo_w-48 xpo_mb-6" />
    <div className="xpo_space-y-2 xpo_mb-6">
      <SkeletonLoader className="xpo_h-4 xpo_w-full" />
      <SkeletonLoader className="xpo_h-4 xpo_w-5/6" />
      <SkeletonLoader className="xpo_h-4 xpo_w-4/5" />
    </div>
    <SkeletonLoader className="xpo_h-6 xpo_w-16 xpo_mb-2" />
    <div className="xpo_flex xpo_space-x-2 xpo_mb-6">
      {[...Array(3)].map((_, i) => (
        <SkeletonLoader key={i} className="xpo_w-8 xpo_h-8 xpo_rounded-full" />
      ))}
    </div>
    <SkeletonLoader className="xpo_h-6 xpo_w-20 xpo_mb-2" />
    <SkeletonLoader className="xpo_h-10 xpo_w-32 xpo_mb-6" />
    <div className="xpo_flex xpo_space-x-4 xpo_mb-8">
      <SkeletonLoader className="xpo_h-12 xpo_w-40" />
      <SkeletonLoader className="xpo_h-12 xpo_w-40" />
    </div>
    <SkeletonLoader className="xpo_h-32 xpo_w-full" />
  </div>
);


export const ProductCardSkeleton = () => {
  return (
    <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-4 xpo_animate-pulse">
      <div className="xpo_bg-gray-300 xpo_h-48 xpo_rounded-lg xpo_mb-4"></div>
      <div className="xpo_space-y-3">
        <div className="xpo_bg-gray-300 xpo_h-4 xpo_rounded xpo_w-3/4"></div>
        <div className="xpo_bg-gray-300 xpo_h-4 xpo_rounded xpo_w-1/2"></div>
        <div className="xpo_bg-gray-300 xpo_h-6 xpo_rounded xpo_w-1/3"></div>
      </div>
    </div>
  );
};


export const RecommendedCrossCollectionsSkeleton = ({ count = 6 }) => {
  return (
    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6 xpo_mb-12">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="xpo_group xpo_relative xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_overflow-hidden"
          aria-hidden="true"
        >
          <div className="xpo_relative xpo_h-48 xpo_overflow-hidden">
            <SkeletonLoader className="xpo_w-full xpo_h-full" />

            <div className="xpo_absolute xpo_inset-0 xpo_bg-gradient-to-t xpo_from-gray-300 xpo_via-transparent xpo_to-transparent xpo_opacity-60"></div>

            <SkeletonLoader className="xpo_absolute xpo_top-4 xpo_right-4 xpo_w-16 xpo_h-6 xpo_rounded-full" />

            <SkeletonLoader className="xpo_absolute xpo_top-4 xpo_left-4 xpo_w-20 xpo_h-6 xpo_rounded-full" />

            <div className="xpo_absolute xpo_bottom-4 xpo_left-4 xpo_right-4 xpo_space-y-3">
              <SkeletonLoader className="xpo_w-3/4 xpo_h-6 xpo_rounded" />
              <SkeletonLoader className="xpo_w-full xpo_h-4 xpo_rounded" />
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <SkeletonLoader className="xpo_w-16 xpo_h-5 xpo_rounded" />
                <SkeletonLoader className="xpo_w-20 xpo_h-8 xpo_rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const AddressListCardLoader = ({ count = 2 }) => {
  return (
    <div>
      <div className="xpo_grid xpo_grid-cols-1 xpo_gap-2">
        {[...Array(count).keys()].map(i => <SkeletonLoader key={i} className="xpo_w-full xpo_h-24 xpo_mb-4" />)}
      </div>
    </div>
  )
}

export const ReviewBarSkeleton = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count).keys()].map(i => (
        <div key={i}>
          <div className="xpo_relative xpo_rounded-lg">
              <SkeletonLoader className="xpo_w-full xpo_h-[124px]" />
              <SkeletonLoader className="xpo_h-12 xpo_w-12 xpo_rounded-full xpo_absolute xpo_top-3 xpo_left-3" />
              <SkeletonLoader className="xpo_h-3 xpo_w-28 xpo_rounded-lg xpo_absolute xpo_top-4 xpo_left-20" />
              <SkeletonLoader className="xpo_h-3 xpo_w-20 xpo_rounded-lg xpo_absolute xpo_top-8 xpo_left-20" />
              <SkeletonLoader className="xpo_h-3 xpo_w-20 xpo_rounded-lg xpo_absolute xpo_top-6 xpo_right-4" />
              <SkeletonLoader className="xpo_h-8 xpo_w-[90%] xpo_rounded-lg xpo_absolute xpo_bottom-5 xpo_left-3" />
            </div>
        </div>
      ))}
    </>
  )
}


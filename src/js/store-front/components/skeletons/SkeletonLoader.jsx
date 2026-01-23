export const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`}></div>
);


export const GallerySkeleton = () => (
  <div>
    <SkeletonLoader className="w-full h-96 mb-4" />
    <div className="grid grid-cols-4 gap-2">
      {[...Array(4).keys()].map(i => <SkeletonLoader key={i} className="w-full h-24" />)}
    </div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div>
    <SkeletonLoader className="h-8 w-3/4 mb-4" />
    <div className="flex items-center mb-4">
      <SkeletonLoader className="h-5 w-32 mr-2" />
      <SkeletonLoader className="h-4 w-24" />
    </div>
    <SkeletonLoader className="h-8 w-48 mb-6" />
    <div className="space-y-2 mb-6">
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
      <SkeletonLoader className="h-4 w-4/5" />
    </div>
    <SkeletonLoader className="h-6 w-16 mb-2" />
    <div className="flex space-x-2 mb-6">
      {[...Array(3)].map((_, i) => (
        <SkeletonLoader key={i} className="w-8 h-8 rounded-full" />
      ))}
    </div>
    <SkeletonLoader className="h-6 w-20 mb-2" />
    <SkeletonLoader className="h-10 w-32 mb-6" />
    <div className="flex space-x-4 mb-8">
      <SkeletonLoader className="h-12 w-40" />
      <SkeletonLoader className="h-12 w-40" />
    </div>
    <SkeletonLoader className="h-32 w-full" />
  </div>
);


export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse">
      <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gray-300 h-4 rounded w-3/4"></div>
        <div className="bg-gray-300 h-4 rounded w-1/2"></div>
        <div className="bg-gray-300 h-6 rounded w-1/3"></div>
      </div>
    </div>
  );
};


export const RecommendedCrossCollectionsSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="group relative bg-white rounded-2xl shadow-lg overflow-hidden"
          aria-hidden="true"
        >
          <div className="relative h-48 overflow-hidden">
            <SkeletonLoader className="w-full h-full" />

            <div className="absolute inset-0 bg-gradient-to-t from-gray-300 via-transparent to-transparent opacity-60"></div>

            <SkeletonLoader className="absolute top-4 right-4 w-16 h-6 rounded-full" />

            <SkeletonLoader className="absolute top-4 left-4 w-20 h-6 rounded-full" />

            <div className="absolute bottom-4 left-4 right-4 space-y-3">
              <SkeletonLoader className="w-3/4 h-6 rounded" />
              <SkeletonLoader className="w-full h-4 rounded" />
              <div className="flex items-center justify-between">
                <SkeletonLoader className="w-16 h-5 rounded" />
                <SkeletonLoader className="w-20 h-8 rounded-lg" />
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
      <div className="grid grid-cols-1 gap-2">
        {[...Array(count).keys()].map(i => <SkeletonLoader key={i} className="w-full h-24 mb-4" />)}
      </div>
    </div>
  )
}

export const ReviewBarSkeleton = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count).keys()].map(i => (
        <div key={i}>
          <div className="relative rounded-lg">
            <SkeletonLoader className="w-full h-[124px]" />
            <SkeletonLoader className="h-12 w-12 rounded-full absolute top-3 left-3" />
            <SkeletonLoader className="h-3 w-28 rounded-lg absolute top-4 left-20" />
            <SkeletonLoader className="h-3 w-20 rounded-lg absolute top-8 left-20" />
            <SkeletonLoader className="h-3 w-20 rounded-lg absolute top-6 right-4" />
            <SkeletonLoader className="h-8 w-[90%] rounded-lg absolute bottom-5 left-3" />
          </div>
        </div>
      ))}
    </>
  )
}


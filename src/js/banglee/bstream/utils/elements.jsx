export const LoadingSkeleton = () => (
    <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 lg:xpo_grid-cols-4 xl:xpo_grid-cols-5 xpo_gap-4">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="xpo_animate-pulse">
                <div className="xpo_bg-gray-300 xpo_rounded-lg xpo_aspect-video xpo_mb-3"></div>
                <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_mb-2"></div>
                <div className="xpo_h-3 xpo_bg-gray-300 xpo_rounded xpo_w-3/4"></div>
            </div>
        ))}
    </div>
);

export const ErrorState = () => (
    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_py-12 xpo_px-4 xpo_text-center">
      <div className="xpo_bg-red-50 xpo_rounded-full xpo_p-3 xpo_mb-4">
        <AlertCircle className="xpo_w-8 xpo_h-8 xpo_text-red-500" />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">
        Oops! Something went wrong
      </h3>
      <p className="xpo_text-gray-600 xpo_mb-4 xpo_max-w-md">
        {error}
      </p>
      <button
        onClick={handleRetry}
        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-primary-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-primary-700 xpo_transition-colors xpo_duration-200"
      >
        <RefreshCw className="xpo_w-4 xpo_h-4 xpo_mr-2" />
        Try Again
      </button>
    </div>
);

export const EmptyState = () => (
    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_py-12 xpo_px-4 xpo_text-center">
      <div className="xpo_bg-gray-50 xpo_rounded-full xpo_p-3 xpo_mb-4">
        <Wifi className="xpo_w-8 xpo_h-8 xpo_text-gray-400" />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">
        No videos found
      </h3>
      <p className="xpo_text-gray-600">
        Check back later for new content!
      </p>
    </div>
);
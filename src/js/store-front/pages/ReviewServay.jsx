import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import { 
  Star, 
  Package, 
  Truck, 
  Headphones, 
  MessageSquare, 
  CheckCircle, 
  Camera,
  Upload,
  X,
  Shield,
  ThumbsUp
} from 'lucide-react';
// import api from '../services/api';


// Mock API and useParams for demonstration
const api = {
  get: (url) => Promise.resolve({
    data: {
      id: '12345',
      customer: { name: 'John Doe', email: 'john@example.com' },
      items: [
        {
          id: 1209,
          title: "Aegis AG-5000 2TB External Hard Drive",
          metadata: {
            sku: "AG5000HDD",
            price: "6500",
            sale_price: "5999",
            gallery: [
              { url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80" }
            ]
          }
        },
        {
          id: 1210,
          title: "Premium Bluetooth Headphones",
          metadata: {
            sku: "BTH001",
            price: "199",
            sale_price: "149",
            gallery: [
              { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" }
            ]
          }
        }
      ]
    }
  }),
  post: (url, data) => Promise.resolve({ data: { success: true } })
};

const useParams = () => ({ order_id: '12345' });

const ReviewSurvey = () => {
  const { order_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [overallExperience, setOverallExperience] = useState({
    rating: 0,
    delivery_rating: 0,
    support_rating: 0,
    would_recommend: false
  });

  const ratingCategories = [
    { key: 'product_quality', label: 'Product Quality', icon: Star },
    { key: 'packaging_rating', label: 'Packaging', icon: Package },
    { key: 'delivery_rating', label: 'Delivery Experience', icon: Truck },
    { key: 'support_rating', label: 'Customer Support', icon: Headphones }
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`orders/${order_id}`);
        const orderData = response.data;
        
        setOrder(orderData);
        setProducts(orderData.items || []);
        
        // Initialize reviews for each product
        const initialReviews = orderData.items?.map(product => ({
          product_id: product.id,
          variation_id: product.variation_id || null,
          product_quality: 0,
          packaging_rating: 0,
          delivery_rating: 0,
          support_rating: 0,
          overall_rating: 0,
          comments: '',
          images: [],
          would_recommend: false
        })) || [];
        
        setReviews(initialReviews);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (order_id) {
      fetchOrder();
    }
  }, [order_id]);

  const updateReview = (productIndex, field, value) => {
    setReviews(prev => prev.map((review, index) => 
      index === productIndex 
        ? { 
            ...review, 
            [field]: value,
            ...(field !== 'overall_rating' && field !== 'comments' && field !== 'images' && field !== 'would_recommend' 
              ? { overall_rating: Math.round((review.product_quality + review.packaging_rating + review.delivery_rating + review.support_rating + (field === 'product_quality' ? value : review.product_quality)) / 4) }
              : {})
          }
        : review
    ));
  };

  const updateOverallExperience = (field, value) => {
    setOverallExperience(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStarRating = (rating, onRatingChange, size = 'w-6 h-6') => {
    return (
      <div className="xpo_flex xpo_items-center xpo_space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${size} xpo_transition-colors xpo_duration-200`}
          >
            <Star
              className={`xpo_w-full xpo_h-full ${
                star <= rating
                  ? 'xpo_text-yellow-400 xpo_fill-yellow-400'
                  : 'xpo_text-gray-300 hover:xpo_text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="xpo_ml-2 xpo_text-sm xpo_text-gray-600">
          {rating > 0 && `${rating}/5`}
        </span>
      </div>
    );
  };

  const handleImageUpload = (productIndex, files) => {
    // Handle image upload logic here
    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    updateReview(productIndex, 'images', [
      ...reviews[productIndex].images,
      ...newImages
    ]);
  };

  const removeImage = (productIndex, imageIndex) => {
    const updatedImages = reviews[productIndex].images.filter((_, index) => index !== imageIndex);
    updateReview(productIndex, 'images', updatedImages);
  };

  const handleSubmitReviews = async () => {
    setSubmitting(true);
    try {
      const reviewData = {
        order_id,
        reviews: reviews.map(review => ({
          ...review,
          images: review.images.map(img => img.file) // Send only files
        })),
        overall_experience: overallExperience
      };

      await api.post('reviews/submit', reviewData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting reviews:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateOverallProgress = () => {
    if (reviews.length === 0) return 0;
    const completedReviews = reviews.filter(review => 
      review.overall_rating > 0 && review.comments.trim() !== ''
    ).length;
    return Math.round((completedReviews / reviews.length) * 100);
  };

  if (loading) {
    return (
      <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center">
        <div className="xpo_text-center">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-indigo-600 xpo_mx-auto"></div>
          <p className="xpo_mt-4 xpo_text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center">
        <div className="xpo_max-w-md xpo_mx-auto xpo_text-center xpo_bg-white xpo_p-8 xpo_rounded-lg xpo_shadow-lg">
          <CheckCircle className="xpo_w-16 xpo_h-16 xpo_text-green-500 xpo_mx-auto xpo_mb-4" />
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-4">
            Thank You for Your Review!
          </h2>
          <p className="xpo_text-gray-600 xpo_mb-6">
            Your feedback helps us improve our products and services. We truly appreciate you taking the time to share your experience.
          </p>
          <div className="xpo_flex xpo_items-center xpo_justify-center xpo_text-sm xpo_text-gray-500">
            <Shield className="xpo_w-4 xpo_h-4 xpo_mr-2" />
            Verified Purchase Review
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50">
      {/* Header */}
      <div className="xpo_bg-white xpo_shadow-sm xpo_border-b">
        <div className="xpo_max-w-4xl xpo_mx-auto xpo_px-4 xpo_py-6">
          <div className="xpo_flex xpo_items-center xpo_justify-between">
            <div>
              <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800">
                Share Your Experience
              </h1>
              <p className="xpo_text-gray-600 xpo_mt-1">
                Order #{order?.id} • {order?.customer?.name}
              </p>
            </div>
            <div className="xpo_flex xpo_items-center xpo_space-x-2">
              <Shield className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
              <span className="xpo_text-sm xpo_text-green-600 xpo_font-medium">
                Verified Purchase
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="xpo_mt-4">
            <div className="xpo_flex xpo_justify-between xpo_text-sm xpo_text-gray-600 xpo_mb-2">
              <span>Review Progress</span>
              <span>{calculateOverallProgress()}% Complete</span>
            </div>
            <div className="xpo_w-full xpo_bg-gray-200 xpo_rounded-full xpo_h-2">
              <div 
                className="xpo_bg-indigo-600 xpo_h-2 xpo_rounded-full xpo_transition-all xpo_duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="xpo_max-w-4xl xpo_mx-auto xpo_px-4 xpo_py-8">
        {/* Product Reviews */}
        <div className="xpo_space-y-8">
          {products.map((product, productIndex) => (
            <div key={product.id} className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_overflow-hidden">
              {/* Product Header */}
              <div className="xpo_p-6 xpo_border-b xpo_bg-gray-50">
                <div className="xpo_flex xpo_items-start xpo_space-x-4">
                  <img
                    src={product.metadata?.gallery?.[0]?.url || product.thumbnail || 'https://via.placeholder.com/80'}
                    alt={product.title}
                    className="xpo_w-20 xpo_h-20 xpo_object-cover xpo_rounded-lg"
                  />
                  <div className="xpo_flex-1">
                    <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-2">
                      {product.title}
                    </h3>
                    <p className="xpo_text-gray-600 xpo_text-sm">
                      SKU: {product.metadata?.sku || 'N/A'}
                    </p>
                    {product.variation_id && (
                      <p className="xpo_text-gray-500 xpo_text-sm xpo_mt-1">
                        Variation ID: {product.variation_id}
                      </p>
                    )}
                  </div>
                  <div className="xpo_text-right">
                    <p className="xpo_text-lg xpo_font-semibold xpo_text-indigo-600">
                      ${product.metadata?.sale_price || product.metadata?.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="xpo_p-6">
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-6 xpo_mb-6">
                  {ratingCategories.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="xpo_space-y-2">
                      <div className="xpo_flex xpo_items-center xpo_space-x-2">
                        <Icon className="xpo_w-5 xpo_h-5 xpo_text-indigo-600" />
                        <label className="xpo_text-sm xpo_font-medium xpo_text-gray-700">
                          {label}
                        </label>
                      </div>
                      {renderStarRating(
                        reviews[productIndex]?.[key] || 0,
                        (rating) => updateReview(productIndex, key, rating)
                      )}
                    </div>
                  ))}
                </div>

                {/* Overall Rating Display */}
                <div className="xpo_bg-indigo-50 xpo_p-4 xpo_rounded-lg xpo_mb-6">
                  <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">
                      Overall Rating
                    </span>
                    {renderStarRating(
                      reviews[productIndex]?.overall_rating || 0,
                      () => {},
                      'w-7 h-7'
                    )}
                  </div>
                </div>

                {/* Written Review */}
                <div className="xpo_mb-6">
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    <MessageSquare className="xpo_inline xpo_w-4 xpo_h-4 xpo_mr-1" />
                    Tell us about your experience with this product
                  </label>
                  <textarea
                    value={reviews[productIndex]?.comments || ''}
                    onChange={(e) => updateReview(productIndex, 'comments', e.target.value)}
                    placeholder="What did you like about this product? How was the quality? Any suggestions for improvement?"
                    className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-indigo-500 focus:xpo_border-transparent xpo_resize-none"
                    rows="4"
                  />
                </div>

                {/* Photo Upload */}
                <div className="xpo_mb-6">
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    <Camera className="xpo_inline xpo_w-4 xpo_h-4 xpo_mr-1" />
                    Add Photos (Optional)
                  </label>
                  <div className="xpo_border-2 xpo_border-dashed xpo_border-gray-300 xpo_rounded-lg xpo_p-6 xpo_text-center hover:xpo_border-indigo-400 xpo_transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(productIndex, e.target.files)}
                      className="xpo_hidden"
                      id={`image-upload-${productIndex}`}
                    />
                    <label
                      htmlFor={`image-upload-${productIndex}`}
                      className="xpo_cursor-pointer"
                    >
                      <Upload className="xpo_w-8 xpo_h-8 xpo_text-gray-400 xpo_mx-auto xpo_mb-2" />
                      <p className="xpo_text-sm xpo_text-gray-600">
                        Click to upload photos or drag and drop
                      </p>
                      <p className="xpo_text-xs xpo_text-gray-400 xpo_mt-1">
                        PNG, JPG up to 5MB each
                      </p>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {reviews[productIndex]?.images?.length > 0 && (
                    <div className="xpo_mt-4 xpo_flex xpo_flex-wrap xpo_gap-2">
                      {reviews[productIndex].images.map((image, imageIndex) => (
                        <div key={imageIndex} className="xpo_relative">
                          <img
                            src={image.url}
                            alt={`Review image ${imageIndex + 1}`}
                            className="xpo_w-20 xpo_h-20 xpo_object-cover xpo_rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(productIndex, imageIndex)}
                            className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_bg-red-500 xpo_text-white xpo_rounded-full xpo_p-1 hover:xpo_bg-red-600"
                          >
                            <X className="xpo_w-3 xpo_h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Would Recommend */}
                <div className="xpo_flex xpo_items-center xpo_space-x-3">
                  <input
                    type="checkbox"
                    id={`recommend-${productIndex}`}
                    checked={reviews[productIndex]?.would_recommend || false}
                    onChange={(e) => updateReview(productIndex, 'would_recommend', e.target.checked)}
                    className="xpo_h-4 xpo_w-4 xpo_text-indigo-600 focus:xpo_ring-indigo-500 xpo_border-gray-300 xpo_rounded"
                  />
                  <label
                    htmlFor={`recommend-${productIndex}`}
                    className="xpo_flex xpo_items-center xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_cursor-pointer"
                  >
                    <ThumbsUp className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                    I would recommend this product to others
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Experience */}
        <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mt-8">
          <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-6">
            Overall Shopping Experience
          </h3>
          
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-3 xpo_gap-6 xpo_mb-6">
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                <Star className="xpo_inline xpo_w-4 xpo_h-4 xpo_mr-1" />
                Overall Experience
              </label>
              {renderStarRating(
                overallExperience.rating,
                (rating) => updateOverallExperience('rating', rating)
              )}
            </div>
            
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                <Truck className="xpo_inline xpo_w-4 xpo_h-4 xpo_mr-1" />
                Delivery Experience
              </label>
              {renderStarRating(
                overallExperience.delivery_rating,
                (rating) => updateOverallExperience('delivery_rating', rating)
              )}
            </div>
            
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                <Headphones className="xpo_inline xpo_w-4 xpo_h-4 xpo_mr-1" />
                Customer Support
              </label>
              {renderStarRating(
                overallExperience.support_rating,
                (rating) => updateOverallExperience('support_rating', rating)
              )}
            </div>
          </div>

          <div className="xpo_flex xpo_items-center xpo_space-x-3">
            <input
              type="checkbox"
              id="would-recommend-store"
              checked={overallExperience.would_recommend}
              onChange={(e) => updateOverallExperience('would_recommend', e.target.checked)}
              className="xpo_h-4 xpo_w-4 xpo_text-indigo-600 focus:xpo_ring-indigo-500 xpo_border-gray-300 xpo_rounded"
            />
            <label
              htmlFor="would-recommend-store"
              className="xpo_flex xpo_items-center xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_cursor-pointer"
            >
              <ThumbsUp className="xpo_w-4 xpo_h-4 xpo_mr-1" />
              I would recommend this store to others
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="xpo_mt-8 xpo_text-center">
          <button
            onClick={handleSubmitReviews}
            disabled={submitting || calculateOverallProgress() === 0}
            className="xpo_bg-indigo-600 xpo_text-white xpo_px-8 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-indigo-700 xpo_disabled:bg-gray-400 xpo_disabled:cursor-not-allowed xpo_transition-colors focus:xpo_ring-4 focus:xpo_ring-indigo-200"
          >
            {submitting ? (
              <>
                <div className="xpo_inline-block xpo_animate-spin xpo_rounded-full xpo_h-4 xpo_w-4 xpo_border-b-2 xpo_border-white xpo_mr-2"></div>
                Submitting Reviews...
              </>
            ) : (
              'Submit Reviews'
            )}
          </button>
          <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-2">
            Your review will help other customers make informed decisions
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSurvey;
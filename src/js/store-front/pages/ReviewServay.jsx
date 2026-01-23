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
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${size} transition-colors duration-200`}
          >
            <Star
              className={`w-full h-full ${star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
                }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Thank You for Your Review!
          </h2>
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve our products and services. We truly appreciate you taking the time to share your experience.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            Verified Purchase Review
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Share Your Experience
              </h1>
              <p className="text-gray-600 mt-1">
                Order #{order?.id} • {order?.customer?.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Verified Purchase
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Review Progress</span>
              <span>{calculateOverallProgress()}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Product Reviews */}
        <div className="space-y-8">
          {products.map((product, productIndex) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Product Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start space-x-4">
                  <img
                    src={product.metadata?.gallery?.[0]?.url || product.thumbnail || 'https://placehold.co/80'}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      SKU: {product.metadata?.sku || 'N/A'}
                    </p>
                    {product.variation_id && (
                      <p className="text-gray-500 text-sm mt-1">
                        Variation ID: {product.variation_id}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-indigo-600">
                      ${product.metadata?.sale_price || product.metadata?.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {ratingCategories.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-indigo-600" />
                        <label className="text-sm font-medium text-gray-700">
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
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">
                      Overall Rating
                    </span>
                    {renderStarRating(
                      reviews[productIndex]?.overall_rating || 0,
                      () => { },
                      'w-7 h-7'
                    )}
                  </div>
                </div>

                {/* Written Review */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="inline w-4 h-4 mr-1" />
                    Tell us about your experience with this product
                  </label>
                  <textarea
                    value={reviews[productIndex]?.comments || ''}
                    onChange={(e) => updateReview(productIndex, 'comments', e.target.value)}
                    placeholder="What did you like about this product? How was the quality? Any suggestions for improvement?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="inline w-4 h-4 mr-1" />
                    Add Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(productIndex, e.target.files)}
                      className="hidden"
                      id={`image-upload-${productIndex}`}
                    />
                    <label
                      htmlFor={`image-upload-${productIndex}`}
                      className="cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload photos or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG up to 5MB each
                      </p>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {reviews[productIndex]?.images?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reviews[productIndex].images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative">
                          <img
                            src={image.url}
                            alt={`Review image ${imageIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(productIndex, imageIndex)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Would Recommend */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`recommend-${productIndex}`}
                    checked={reviews[productIndex]?.would_recommend || false}
                    onChange={(e) => updateReview(productIndex, 'would_recommend', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`recommend-${productIndex}`}
                    className="flex items-center text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    I would recommend this product to others
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Experience */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Overall Shopping Experience
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Overall Experience
              </label>
              {renderStarRating(
                overallExperience.rating,
                (rating) => updateOverallExperience('rating', rating)
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="inline w-4 h-4 mr-1" />
                Delivery Experience
              </label>
              {renderStarRating(
                overallExperience.delivery_rating,
                (rating) => updateOverallExperience('delivery_rating', rating)
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Headphones className="inline w-4 h-4 mr-1" />
                Customer Support
              </label>
              {renderStarRating(
                overallExperience.support_rating,
                (rating) => updateOverallExperience('support_rating', rating)
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="would-recommend-store"
              checked={overallExperience.would_recommend}
              onChange={(e) => updateOverallExperience('would_recommend', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="would-recommend-store"
              className="flex items-center text-sm font-medium text-gray-700 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              I would recommend this store to others
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmitReviews}
            disabled={submitting || calculateOverallProgress() === 0}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:ring-4 focus:ring-indigo-200"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Reviews...
              </>
            ) : (
              'Submit Reviews'
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your review will help other customers make informed decisions
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSurvey;
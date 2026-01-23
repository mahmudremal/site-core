import { sleep, notify } from '@functions';
import api from "../../services/api";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SkeletonLoader } from '../skeletons/SkeletonLoader';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';


export default function Reviews({ visible = true }) {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const { id: post_id = null } = useParams();
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(null);

    const fetchReviews = (params) => {
        setLoading(true);
        sleep(2000).then(() => {
            // return;
            api.get(`products/${post_id}/reviews`, { params })
                .then(res => res.data)
                .then(res => setReviews(res))
                .catch(err => notify.error(err))
                .finally(() => setLoading(false));
        });
    }

    useEffect(() => {
        if (!post_id) return;
        if (!visible || reviews) return;
        fetchReviews({ page: 1, limit: 10 });
    }, [visible]);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">{__('Customer Reviews', 'site-core')}</h3>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3).keys()].map(i => (
                        <div key={i} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center mb-2">
                                <SkeletonLoader className="h-5 w-32 mr-2" />
                                <SkeletonLoader className="h-4 w-20 ml-auto" />
                            </div>
                            <SkeletonLoader className="h-4 w-full" />
                            <SkeletonLoader className="h-4 w-3/4 mt-2" />
                        </div>
                    ))}
                </div>
            ) : reviews?.length ? (
                reviews.map((review, index) =>
                    <div key={index} className="review border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-center mb-2">
                            <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                            </div>
                            <span className="ml-2 font-medium">{review.user_name || review.name}</span>
                            <span className="ml-auto text-sm text-gray-500">
                                {review.created_at || review.date}
                            </span>
                        </div>
                        <p className="text-gray-700">{review.comment || review.review}</p>
                    </div>
                )
            ) : (
                <p className="text-gray-500">{__('No reviews available', 'site-core')}</p>
            )}
        </div>
    )
}
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
            api.get(`products/${post_id}/reviews`, {params})
            .then(res => res.data)
            .then(res => setReviews(res))
            .catch(err => notify.error(err))
            .finally(() => setLoading(false));
        });
    }
    
    useEffect(() => {
        if (!post_id) return;
        if (!visible || reviews) return;
        fetchReviews({page: 1, limit: 10});
    }, [visible]);

    return (
        <div>
            <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-4">{__('Customer Reviews', 'site-core')}</h3>
            {loading ? (
                <div className="xpo_space-y-4">
                    {[...Array(3).keys()].map(i => (
                        <div key={i} className="xpo_border-b xpo_border-gray-200 xpo_pb-4">
                            <div className="xpo_flex xpo_items-center xpo_mb-2">
                                <SkeletonLoader className="xpo_h-5 xpo_w-32 xpo_mr-2" />
                                <SkeletonLoader className="xpo_h-4 xpo_w-20 xpo_ml-auto" />
                            </div>
                            <SkeletonLoader className="xpo_h-4 xpo_w-full" />
                            <SkeletonLoader className="xpo_h-4 xpo_w-3/4 xpo_mt-2" />
                        </div>
                    ))}
                </div>
            ) : reviews?.length ? (
                reviews.map((review, index) => 
                    <div key={index} className="xpo_review xpo_border-b xpo_border-gray-200 xpo_pb-4 xpo_mb-4">
                        <div className="xpo_flex xpo_items-center xpo_mb-2">
                            <div className="xpo_flex xpo_items-center xpo_space-x-1">
                            {renderStars(review.rating)}
                            </div>
                            <span className="xpo_ml-2 xpo_font-medium">{review.user_name || review.name}</span>
                            <span className="xpo_ml-auto xpo_text-sm xpo_text-gray-500">
                            {review.created_at || review.date}
                            </span>
                        </div>
                        <p className="xpo_text-gray-700">{review.comment || review.review}</p>
                    </div>
                )
            ) : (
            <p className="xpo_text-gray-500">{__('No reviews available', 'site-core')}</p>
            )}
        </div>
    )
}
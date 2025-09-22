import { useParams } from "react-router-dom";
// import api from "../../services/api";
// import { ProductCard2 } from "./ProductCard";
// import { useEffect, useState } from "react";
// import { notify, sleep } from '@functions';
// import { ProductCardSkeleton } from "../skeletons/SkeletonLoader";
import ProductCatalogue from "./ProductCatalogue";
import { useLocale } from "../../hooks/useLocale";
import { useCurrency } from "../../hooks/useCurrency";

export default function RelatedProducts() {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const {id: post_id = 0 } = useParams();

    return (
        <div className="xpo_related xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-lg xpo_p-8 xpo_mb-12">
            <h3 className="xpo_text-2xl xpo_font-bold xpo_mb-6">{__('Related Products', 'site-core')}</h3>
            <ProductCatalogue tools={false} endpoint={`products/${post_id}/related`} card_bg="" />
        </div>
    )
}
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
    const { id: post_id = 0 } = useParams();

    return (
        <div className="related bg-scwhite/70 rounded-lg shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6">{__('Related Products', 'site-core')}</h3>
            <ProductCatalogue tools={false} endpoint={`products/${post_id}/related`} card_bg="" />
        </div>
    )
}
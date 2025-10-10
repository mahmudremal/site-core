import { Link } from "react-router-dom";
import { getBadgeColor } from "./helpers";
import { useCart } from "../../hooks/useCart";
import { usePopup } from "../../hooks/usePopup";
import { useWishlist } from "../../hooks/useWishlist";
import { Eye, Heart, Loader2, Plus, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import api from "../../services/api";
import { sleep, notify } from '@functions';
import { useState } from "react";
import ProductQuickView from "./ProductQuickView";
import { Popup } from '@js/utils';
import { useLocale } from "../../hooks/useLocale";
import { useCurrency } from "../../hooks/useCurrency";
import { sprintf } from "sprintf-js";
import MoonlitSky from "../backgrounds/MoonlitSky";

export default function ProductCard({ product, className = '' }) {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const { id, slug, name, price, image } = product;

    return (
        <Link key={product.id} to={product?.permalink??`/products/${product.slug}/`} className={`xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-md xpo_p-4 hover:xpo_shadow-xl xpo_transition-shadow ${className}`}>
            <img alt={product.title} src={product.image} className="xpo_w-full xpo_h-40 xpo_object-cover xpo_rounded" />
            <h3 className="xpo_mt-2 xpo_font-semibold">{product.title}</h3>
            <p className="xpo_text-gray-700">{money(product?.metadata?.price, product?.metadata?.currency)}</p>
        </Link>
    )
    
    // return (
    //     <Link key={id} tabIndex={0} role="button" to={product?.permalink??`/products/${slug}/`} aria-label={`View product ${name}`} className="xpo_bg-gray-50 xpo_p-4 xpo_rounded-lg xpo_cursor-pointer hover:xpo_shadow-lg xpo_transition-shadow">
    //         <img alt={name} src={image} className="xpo_w-full xpo_h-48 xpo_object-cover xpo_rounded" />
    //         <h4 className="xpo_text-lg xpo_font-semibold xpo_mt-4">{name}</h4>
    //         <p className="xpo_text-indigo-600 xpo_font-bold">${price}</p>
    //     </Link>
    // )
}

export const ProductCard2 = ({ product: prod, viewMode = 'card' }) => {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const [popup, setPopup] = useState(null);
    const { cart, add_to_cart } = useCart();
    const { is_in_wishlist, toggle_wishlist } = useWishlist();
    const [adding, setAdding] = useState(null);
    const [product, setProduct] = useState({...prod});
    
    const toggleWishlist = (e, product) => {
        e.preventDefault();e.stopPropagation();
        toggle_wishlist({ product });
    };

    const addToCart = (e, product) => {
        e.preventDefault();e.stopPropagation();
        setAdding(true);add_to_cart({item: product})
        .finally(() => setAdding(false));
    };

    const quickView = (e, product) => {
        e.preventDefault();e.stopPropagation();
        setPopup(<ProductQuickView prod={product} />);
    };

    const isInWishlist = is_in_wishlist({product_id: product?.id});
    
    return (
        <>
            <Link to={product?.permalink??`/products/${product.slug}`} className={`xpo_group xpo_bg-scwhite/70 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_overflow-hidden hover:xpo_shadow-lg xpo_transition-all xpo_duration-300 xpo_cursor-pointer ${viewMode === 'list' ? 'xpo_flex xpo_items-center xpo_p-4' : 'xpo_p-4'}`}>
                <div className={`xpo_relative ${viewMode === 'list' ? 'xpo_w-32 xpo_h-32 xpo_flex-shrink-0 xpo_mr-6' : 'xpo_mb-4'}`}>
                    <div className="xpo_relative xpo_rounded-lg group-hover:xpo_scale-105 xpo_transition-transform xpo_duration-300">
                        <img alt={product.title} src={product.image || product?.metadata?.gallery?.[0]?.url} className={`xpo_w-full xpo_object-cover xpo_rounded-t-xl ${viewMode === 'list' ? 'xpo_h-full' : 'xpo_h-48'}`} />
                        <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full"></div>
                    </div>
                    
                    {product.badge && (
                        <div className={`xpo_absolute xpo_top-2 xpo_left-2 ${getBadgeColor(product.badge)} xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded-full`}>{product.badge}</div>
                    )}

                    {product.viewedRecently && (
                        <div className="xpo_absolute xpo_top-2 xpo_right-2 xpo_bg-blue-500 xpo_text-white xpo_p-1 xpo_rounded-full">
                            <Eye className="xpo_w-3 xpo_h-3" />
                        </div>
                    )}

                    <div className="xpo_absolute xpo_bottom-2 xpo_right-2 xpo_flex xpo_gap-1 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-opacity">
                        <button onClick={(e) => toggleWishlist(e, product)} className={`xpo_p-2 xpo_rounded-full xpo_shadow-lg xpo_transition-colors ${isInWishlist ? 'xpo_bg-red-500 xpo_text-white' : 'xpo_bg-scwhite/70 xpo_text-gray-600 hover:xpo_text-red-500'}`}>
                            <Heart className="xpo_w-4 xpo_h-4" />
                        </button>
                        <button onClick={(e) => quickView(e, product)} className="xpo_p-2 xpo_bg-scwhite/70 xpo_text-gray-600 xpo_rounded-full xpo_shadow-lg hover:xpo_text-blue-500 xpo_transition-colors">
                            <Eye className="xpo_w-4 xpo_h-4" />
                        </button>
                    </div>
                </div>

                <div className={viewMode === 'list' ? 'xpo_flex-1' : ''}>
                    <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-2">
                        <div className="xpo_flex xpo_text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`xpo_w-4 xpo_h-4 ${i < Math.floor(product.rating) ? 'xpo_fill-current' : 'xpo_text-gray-200'}`} />)}
                        </div>
                        <span className="xpo_text-sm xpo_text-gray-500">{sprintf(__('(%d)', 'site-core'), product.reviews || 0)}</span>
                    </div>

                    <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2 group-hover:xpo_text-blue-600 xpo_transition-colors">{product.title}</h3>

                    <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
                        <span className="xpo_text-xs xpo_text-gray-500 xpo_bg-gray-100 xpo_px-2 xpo_py-1 xpo_rounded-full">{product.category}</span>
                        <span className="xpo_text-xs xpo_text-gray-500">{product.brand}</span>
                    </div>

                    <div className={`xpo_flex xpo_items-center ${viewMode === 'list' ? 'xpo_justify-between' : 'xpo_justify-between'} xpo_mt-auto`}>
                        <div>
                            <span className="xpo_font-bold xpo_text-lg xpo_text-gray-900">{money(product.metadata.sale_price, product.metadata.currency)}</span>
                            {product.metadata.price > product.metadata.sale_price && (
                                <span className="xpo_text-sm xpo_text-gray-400 xpo_line-through xpo_ml-2">
                                    {money(product.metadata.price, product.metadata.currency)}
                                </span>
                            )}
                        </div>
                        
                        <button disabled={adding} onClick={(e) => addToCart(e, product)} className="xpo_bg-black xpo_flex xpo_gap-2 xpo_items-center xpo_text-white xpo_p-2 xpo_px-4 xpo_rounded-lg hover:xpo_bg-gray-800 xpo_transition-colors xpo_opacity-0 group-hover:xpo_opacity-100">
                            <span className="xpo_leading-none xpo_text-sm">{__('Add to Cart', 'site-core')}</span>
                            {adding ? <Loader2 className="xpo_animate-spin xpo_w-4 xpo_h-4" /> : <ShoppingCart className="xpo_w-4 xpo_h-4" />}
                        </button>
                    </div>
                </div>
            </Link>
            {popup && (
                <Popup
                    className="xpo_fixed xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center"
                    bodyClassName="xpo_relative xpo_z-10 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_text-scprimary dark:xpo_text-scwhite xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]"
                    backdropClassName="xpo_absolute xpo_inset-0 xpo_bg-black/40 dark:xpo_bg-scprimary/40 xpo_bg-opacity-30"
                    onClose={() => setPopup(null)}
                >
                    <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_hidden dark:xpo_block">
                        <MoonlitSky moon={false} />
                    </div>
                    <div className="xpo_relative xpo_z-10">{popup}</div>
                </Popup>
            )}
        </>
    )
}

export const ProductCard3 = ({ product: prod, viewMode = 'card' }) => {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const [popup, setPopup] = useState(null);
    const { cart, add_to_cart } = useCart();
    const { is_in_wishlist, toggle_wishlist } = useWishlist();
    const [adding, setAdding] = useState(false);
    const [product, setProduct] = useState({...prod});

    const toggleWishlist = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        toggle_wishlist({ product });
    };

    const addToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        add_to_cart({item: product})
            .finally(() => setAdding(false));
    };

    const quickView = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setPopup(<ProductQuickView prod={product} />);
    };

    const isInWishlist = is_in_wishlist({product_id: product?.id});
    
    return (
        <>
            <Link 
                to={product?.permalink ?? `/products/${product.slug}`} 
                className="xpo_group xpo_bg-scwhite/70 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_p-4 hover:xpo_shadow-lg xpo_transition-all xpo_duration-300 hover:xpo_border-gray-300 xpo_block"
            >
                <div className="xpo_relative xpo_mb-4">
                    <img 
                        alt={product.title || product.name} 
                        src={product.image || product?.metadata?.gallery?.[0]?.url} 
                        className="xpo_w-full xpo_h-48 xpo_object-cover xpo_rounded-lg group-hover:xpo_scale-105 xpo_transition-transform xpo_duration-300" 
                    />
                    
                    {product.badge && (
                        <div className={`xpo_absolute xpo_top-3 xpo_left-3 xpo_text-xs xpo_font-semibold xpo_px-2 xpo_py-1 xpo_rounded-full ${getBadgeColor(product.badge)}`}>
                            {product.badge}
                        </div>
                    )}

                    {product.viewedRecently && (
                        <div className="xpo_absolute xpo_top-3 xpo_right-14 xpo_bg-blue-500 xpo_text-white xpo_p-1 xpo_rounded-full">
                            <Eye className="xpo_w-3 xpo_h-3" />
                        </div>
                    )}
                    
                    <button 
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`xpo_absolute xpo_top-3 xpo_right-3 xpo_p-2 xpo_rounded-full xpo_shadow-md xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-all ${isInWishlist ? 'xpo_bg-red-500 xpo_text-white' : 'xpo_bg-scwhite/70 xpo_text-gray-600 hover:xpo_text-red-500 hover:xpo_bg-gray-50'}`}
                    >
                        <Heart className={`xpo_w-4 xpo_h-4 ${isInWishlist ? 'xpo_fill-current' : ''}`} />
                    </button>

                    {product.metadata?.price && product.originalPrice && (
                        <div className="xpo_absolute xpo_bottom-3 xpo_left-3 xpo_bg-red-500 xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded-full">
                            {Math.round(((product.originalPrice - product.metadata.price) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}

                    <button 
                        onClick={(e) => quickView(e, product)}
                        className="xpo_absolute xpo_bottom-3 xpo_right-3 xpo_bg-scwhite/70 xpo_p-2 xpo_rounded-full xpo_shadow-md xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-opacity hover:xpo_bg-gray-50 hover:xpo_text-blue-500"
                    >
                        <Eye className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                    </button>
                </div>
                
                <h3 className="xpo_font-medium xpo_text-gray-900 xpo_mb-2 group-hover:xpo_text-blue-600 xpo_transition-colors xpo_line-clamp-2">
                    {product.title || product.name}
                </h3>
                
                <div className="xpo_flex xpo_items-center xpo_mb-3">
                    <div className="xpo_flex xpo_text-yellow-400 xpo_mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`xpo_w-4 xpo_h-4 ${i < Math.floor(product.rating) ? 'xpo_fill-current' : 'xpo_text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="xpo_text-sm xpo_text-gray-600">
                        {product.rating?.toFixed(1)} ({product.reviews || 0})
                    </span>
                </div>
                
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <span className="xpo_font-bold xpo_text-lg xpo_text-gray-900">
                            {money(product.metadata?.sale_price || product.metadata?.price, product.metadata?.currency)}
                        </span>
                        {product.originalPrice && product.originalPrice > (product.metadata?.sale_price || product.metadata?.price) && (
                            <span className="xpo_text-sm xpo_text-gray-400 xpo_line-through">
                                {money(product.originalPrice, product.metadata?.currency)}
                            </span>
                        )}
                    </div>
                    {product.originalPrice && (
                        <span className="xpo_text-sm xpo_text-green-600 xpo_font-medium">
                            Save {money(product.originalPrice - (product.metadata?.sale_price || product.metadata?.price), product.metadata?.currency)}
                        </span>
                    )}
                </div>
                
                <div className="xpo_flex xpo_gap-2">
                    <button 
                        disabled={adding}
                        onClick={(e) => addToCart(e, product)}
                        className="xpo_flex-1 xpo_bg-gray-900 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-medium hover:xpo_bg-gray-800 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
                    >
                        {adding ? (
                            <>
                                <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
                                {__('Adding...', 'site-core')}
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="xpo_w-4 xpo_h-4" />
                                {__('Add to Cart', 'site-core')}
                            </>
                        )}
                    </button>
                    <button 
                        onClick={(e) => quickView(e, product)}
                        className="xpo_p-2 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors"
                    >
                        <Eye className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                    </button>
                </div>
            </Link>

            {popup && (
                <Popup
                    className="xpo_fixed xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center"
                    bodyClassName="xpo_relative xpo_z-10 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_text-scprimary dark:xpo_text-scwhite xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]"
                    backdropClassName="xpo_absolute xpo_inset-0 xpo_bg-black/40 dark:xpo_bg-scprimary/40 xpo_bg-opacity-30"
                    onClose={() => setPopup(null)}
                >
                    <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_hidden dark:xpo_block">
                        <MoonlitSky moon={false} />
                    </div>
                    <div className="xpo_relative xpo_z-10">{popup}</div>
                </Popup>
            )}
        </>
    );
};
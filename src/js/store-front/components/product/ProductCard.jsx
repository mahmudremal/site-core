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
        <Link key={product.id} to={product?.permalink ?? `/products/${product.slug}/`} className={`bg-scwhite/70 rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow ${className}`}>
            <img alt={product.title} src={product.image} className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-semibold">{product.title}</h3>
            <p className="text-gray-700">{money(product?.metadata?.price, product?.metadata?.currency)}</p>
        </Link>
    )

    // return (
    //     <Link key={id} tabIndex={0} role="button" to={product?.permalink??`/products/${slug}/`} aria-label={`View product ${name}`} className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
    //         <img alt={name} src={image} className="w-full h-48 object-cover rounded" />
    //         <h4 className="text-lg font-semibold mt-4">{name}</h4>
    //         <p className="text-indigo-600 font-bold">${price}</p>
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
    const [product, setProduct] = useState({ ...prod });

    const toggleWishlist = (e, product) => {
        e.preventDefault(); e.stopPropagation();
        toggle_wishlist({ product });
    };

    const addToCart = (e, product) => {
        e.preventDefault(); e.stopPropagation();
        setAdding(true); add_to_cart({ item: product })
            .finally(() => setAdding(false));
    };

    const quickView = (e, product) => {
        e.preventDefault(); e.stopPropagation();
        setPopup(<ProductQuickView prod={product} />);
    };

    const isInWishlist = is_in_wishlist({ product_id: product?.id });

    return (
        <>
            <Link to={product?.permalink ?? `/products/${product.slug}`} className={`group bg-scwhite/70 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}`}>
                <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0 mr-6' : 'mb-4'}`}>
                    <div className="relative rounded-lg group-hover:scale-105 transition-transform duration-300">
                        <img alt={product.title} src={product.image || product?.metadata?.gallery?.[0]?.url} className={`w-full object-cover rounded-t-xl ${viewMode === 'list' ? 'h-full' : 'h-48'}`} />
                        <div className="absolute top-0 left-0 w-full h-full"></div>
                    </div>

                    {product.badge && (
                        <div className={`absolute top-2 left-2 ${getBadgeColor(product.badge)} text-white text-xs font-bold px-2 py-1 rounded-full`}>{product.badge}</div>
                    )}

                    {product.viewedRecently && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                            <Eye className="w-3 h-3" />
                        </div>
                    )}

                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => toggleWishlist(e, product)} className={`p-2 rounded-full shadow-lg transition-colors ${isInWishlist ? 'bg-red-500 text-white' : 'bg-scwhite/70 text-gray-600 hover:text-red-500'}`}>
                            <Heart className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => quickView(e, product)} className="p-2 bg-scwhite/70 text-gray-600 rounded-full shadow-lg hover:text-blue-500 transition-colors">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                        <span className="text-sm text-gray-500">{sprintf(__('(%s)', 'site-core'), product?.reviews || 0)}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{product.title}</h3>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                        <span className="text-xs text-gray-500">{product.brand}</span>
                    </div>

                    <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'} mt-auto`}>
                        <div>
                            <span className="font-bold text-lg text-gray-900">{money(product.metadata.sale_price, product.metadata.currency)}</span>
                            {product.metadata.price > product.metadata.sale_price && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                    {money(product.metadata.price, product.metadata.currency)}
                                </span>
                            )}
                        </div>

                        <button disabled={adding} onClick={(e) => addToCart(e, product)} className="bg-black flex gap-2 items-center text-white p-2 px-4 rounded-lg hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                            <span className="leading-none text-sm">{__('Add to Cart', 'site-core')}</span>
                            {adding ? <Loader2 className="animate-spin w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </Link>
            {popup && (
                <Popup
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    bodyClassName="relative z-10 bg-scwhite dark:bg-scprimary text-scprimary dark:text-scwhite rounded-xl shadow-lg p-6 max-w-full min-w-[90vw] md:min-w-[28rem]"
                    backdropClassName="absolute inset-0 bg-black/40 dark:bg-scprimary/40 bg-opacity-30"
                    onClose={() => setPopup(null)}
                >
                    <div className="absolute top-0 left-0 w-full h-full hidden dark:block">
                        <MoonlitSky moon={false} />
                    </div>
                    <div className="relative z-10">{popup}</div>
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
    const [product, setProduct] = useState({ ...prod });

    const toggleWishlist = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        toggle_wishlist({ product });
    };

    const addToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        add_to_cart({ item: product })
            .finally(() => setAdding(false));
    };

    const quickView = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setPopup(<ProductQuickView prod={product} />);
    };

    const isInWishlist = is_in_wishlist({ product_id: product?.id });

    return (
        <>
            <Link
                to={product?.permalink ?? `/products/${product.slug}`}
                className="group bg-scwhite/70 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 block"
            >
                <div className="relative mb-4">
                    <img
                        alt={product.title || product.name}
                        src={product.image || product?.metadata?.gallery?.[0]?.url}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />

                    {product.badge && (
                        <div className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${getBadgeColor(product.badge)}`}>
                            {product.badge}
                        </div>
                    )}

                    {product.viewedRecently && (
                        <div className="absolute top-3 right-14 bg-blue-500 text-white p-1 rounded-full">
                            <Eye className="w-3 h-3" />
                        </div>
                    )}

                    <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all ${isInWishlist ? 'bg-red-500 text-white' : 'bg-scwhite/70 text-gray-600 hover:text-red-500 hover:bg-gray-50'}`}
                    >
                        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>

                    {product.metadata?.price && product.originalPrice && (
                        <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(((product.originalPrice - product.metadata.price) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}

                    <button
                        onClick={(e) => quickView(e, product)}
                        className="absolute bottom-3 right-3 bg-scwhite/70 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:text-blue-500"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.title || product.name}
                </h3>

                <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'stroke-gray-400'}`} />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">
                        {sprintf(__('%s (%s)', 'site-core'), product?.rating?.toFixed?.(1), product?.reviews || 0)}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">
                            {money(product.metadata?.sale_price || product.metadata?.price, product.metadata?.currency)}
                        </span>
                        {product.originalPrice && product.originalPrice > (product.metadata?.sale_price || product.metadata?.price) && (
                            <span className="text-sm text-gray-400 line-through">
                                {money(product.originalPrice, product.metadata?.currency)}
                            </span>
                        )}
                    </div>
                    {product.originalPrice && (
                        <span className="text-sm text-green-600 font-medium">
                            {sprintf(__('Save %s', 'site-core'), money(product.originalPrice - (product.metadata?.sale_price || product.metadata?.price), product.metadata?.currency))}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        disabled={adding}
                        onClick={(e) => addToCart(e, product)}
                        className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {adding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {__('Adding...', 'site-core')}
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                {__('Add to Cart', 'site-core')}
                            </>
                        )}
                    </button>
                    <button
                        onClick={(e) => quickView(e, product)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </Link>

            {popup && (
                <Popup
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    bodyClassName="relative z-10 bg-scwhite dark:bg-scprimary text-scprimary dark:text-scwhite rounded-xl shadow-lg p-6 max-w-full min-w-[90vw] md:min-w-[28rem]"
                    backdropClassName="absolute inset-0 bg-black/40 dark:bg-scprimary/40 bg-opacity-30"
                    onClose={() => setPopup(null)}
                >
                    <div className="absolute top-0 left-0 w-full h-full hidden dark:block">
                        <MoonlitSky moon={false} />
                    </div>
                    <div className="relative z-10">{popup}</div>
                </Popup>
            )}
        </>
    );
};
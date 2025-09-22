import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const placeholderProducts = Array.from({ length: 120 }).map((_, i) => ({
  id: i + 1,
  slug: i + 1,
  name: `Product ${i + 1}`,
  price: (Math.random() * 100 + 10).toFixed(2),
  image: `https://picsum.photos/seed/${i + 1}/200/200`,
}));

export default function ProductsGrid() {
  const [products, setProducts] = useState(placeholderProducts.slice(0, 8));
  const [loadingMore, setLoadingMore] = useState(false);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loadingMore &&
        products.length < placeholderProducts.length
      ) {
        setLoadingMore(true);
        setTimeout(() => {
          setProducts((prev) => [
            ...prev,
            ...placeholderProducts.slice(prev.length, prev.length + 4),
          ]);
          setLoadingMore(false);
        }, 1000);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, products]);

  
  return (
      <section className="xpo_just_for_you">
        <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-6">Just For You</h2>
        <div className="xpo_grid xpo_grid-cols-2 sm:xpo_grid-cols-3 md:xpo_grid-cols-4 xpo_gap-6">
          {products.map((product) => (
            <Link key={product.id} to={product?.permalink??`/products/${product.slug}/`} className="xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-md xpo_p-4 hover:xpo_shadow-xl xpo_transition-shadow">
              <img
                src={product.image}
                alt={product.name}
                className="xpo_w-full xpo_h-40 xpo_object-cover xpo_rounded"
              />
              <h3 className="xpo_mt-2 xpo_font-semibold">{product.name}</h3>
              <p className="xpo_text-gray-700">${product.price}</p>
            </Link>
          ))}
        </div>
        {loadingMore && (
          <p className="xpo_text-center xpo_mt-4 xpo_text-gray-500">Loading more products...</p>
        )}
      </section>
  )
}
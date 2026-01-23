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
    <section className="just_for_you">
      <h2 className="text-2xl font-bold mb-6">Just For You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={product?.permalink ?? `/products/${product.slug}/`} className="bg-scwhite/70 rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="mt-2 font-semibold">{product.name}</h3>
            <p className="text-gray-700">${product.price}</p>
          </Link>
        ))}
      </div>
      {loadingMore && (
        <p className="text-center mt-4 text-gray-500">Loading more products...</p>
      )}
    </section>
  )
}
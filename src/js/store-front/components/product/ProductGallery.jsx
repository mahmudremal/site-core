import { useEffect, useState } from "react";
import { GallerySkeleton } from "../skeletons/SkeletonLoader";


export const ProductGallery = ({ images, loading }) => {
  const [mainImage, setMainImage] = useState('data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');

  useEffect(() => {
    if (images?.length) {
      setMainImage(images.find(i => i?.url).url);
    }
  }, [images]);

  if (loading) {
    return <GallerySkeleton />;
  }

  if (!images?.length) return null;

  return (
    <div>
      {mainImage && (<img src={mainImage} alt="Product main" className="w-full h-96 object-cover rounded-lg mb-4" />)}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <img key={i} src={img?.url} alt={`Thumbnail ${i + 1}`} onClick={() => setMainImage(img?.url)} className={`w-full h-24 object-cover rounded cursor-pointer border-2 ${mainImage === img?.url ? 'border-indigo-500' : 'border-transparent'} hover:border-indigo-500`} />
        ))}
      </div>
    </div>
  );
};

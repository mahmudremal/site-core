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
      {mainImage && (<img src={mainImage} alt="Product main" className="xpo_w-full xpo_h-96 xpo_object-cover xpo_rounded-lg xpo_mb-4" />)}
      <div className="xpo_grid xpo_grid-cols-4 xpo_gap-2">
        {images.map((img, i) => (
          <img key={i} src={img?.url} alt={`Thumbnail ${i + 1}`} onClick={() => setMainImage(img?.url)} className={`xpo_w-full xpo_h-24 xpo_object-cover xpo_rounded xpo_cursor-pointer xpo_border-2 ${mainImage === img?.url ? 'xpo_border-indigo-500' : 'xpo_border-transparent'} hover:xpo_border-indigo-500`} />
        ))}
      </div>
    </div>
  );
};

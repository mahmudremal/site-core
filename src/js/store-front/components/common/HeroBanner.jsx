import React from 'react';

const HeroBanner = ({ bannerId }) => {
  // In a real application, you would fetch banner data based on bannerId
  const banners = {
    'spring-sale': {
      imageUrl: 'https://picsum.photos/id/1018/1000/400',
      title: 'Spring Sale',
      subtitle: 'Up to 50% off on selected items',
    },
  };

  const banner = banners[bannerId] || {
    imageUrl: 'https://picsum.photos/id/1015/1000/400',
    title: 'Welcome to XPO Shop',
    subtitle: 'Your one-stop shop for everything',
  };

  return (
    <section className="xpo_relative xpo_overflow-hidden xpo_rounded-lg xpo_shadow-lg xpo_mb-12">
      <img
        src={banner.imageUrl}
        alt="Banner"
        className="xpo_w-full xpo_h-64 xpo_object-cover"
      />
      <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-30 xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_text-center xpo_p-4">
        <h1 className="xpo_text-scwhite/70  xpo_text-4xl xpo_font-bold">{banner.title}</h1>
        <p className="xpo_text-scwhite/70  xpo_text-lg xpo_mt-2">{banner.subtitle}</p>
      </div>
    </section>
  );
};

export default HeroBanner;

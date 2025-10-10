import { useState, useEffect, useCallback } from 'react';
import { site_url } from '@functions';
import QRCode from 'react-qr-code';

const OSIcons = {
  ios: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,
  android: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>`,
  hermony: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`
};

const HeroSection = ({ slides = [], autoSlideInterval = 5000, onLoaded = null }) => {
  const defaultSlides = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=800&fit=crop',
      title: 'Discover Serenity Under Moonlit Skies',
      subtitle: 'Curated products that bring peace and harmony to your everyday life',
      ctaText: 'Explore Collection',
      ctaLink: '/collections/special',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=800&fit=crop',
      title: 'Nature-Inspired Living',
      subtitle: 'Premium eco-friendly essentials designed for mindful moments',
      ctaText: 'Shop Now',
      ctaLink: '/collections/sale',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=800&fit=crop',
      title: 'Your Journey to Tranquility Begins Here',
      subtitle: 'Experience products that nurture your soul and embrace nature',
      ctaText: 'Discover More',
      ctaLink: '/collections/discover',
    },
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);

  useEffect(() => {
    if (autoSlideInterval > 0 && !isPaused) {
      const interval = setInterval(nextSlide, autoSlideInterval);
      return () => clearInterval(interval);
    }
  }, [autoSlideInterval, isPaused, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  const AppPromo = () => (
    <div className="xpo_bg-scwhite/50 xpo_backdrop-blur-md xpo_p-6 xpo_rounded-2xl xpo_shadow-2xl xpo_border xpo_border-scprimary/10 xpo_flex xpo_flex-col xpo_items-center xpo_text-center xpo_space-y-5 xpo_h-fit xpo_transition-all xpo_duration-300 hover:xpo_shadow-3xl hover:xpo_scale-[1.02]">
      <div className="xpo_space-y-2">
        <h3 className="xpo_text-xl xpo_font-bold xpo_text-scprimary xpo_tracking-tight">Download Our App</h3>
        <p className="xpo_text-sm xpo_text-scprimary/60 xpo_leading-relaxed">Scan to experience tranquility on-the-go</p>
      </div>
      
      <div className="xpo_inline-block xpo_bg-scwhite/50 xpo_p-4 xpo_rounded-xl xpo_shadow-lg xpo_border xpo_border-scprimary/5">
        <QRCode
          size={160}
          value={site_url(`/apps`)}
          bgColor="#FFFFFF00"
          fgColor="#0A1D37"
          className="xpo_w-40 xpo_h-40"
        />
      </div>

      <div className="xpo_flex xpo_flex-col xpo_gap-3 xpo_w-full">
        <a
          href="https://apps.apple.com/us/app/moonlit-meadow/id123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-3 xpo_px-5 xpo_py-3 xpo_bg-scprimary xpo_text-scwhite xpo_text-sm xpo_font-semibold xpo_rounded-xl xpo_shadow-md hover:xpo_shadow-xl xpo_transition-all xpo_duration-300 hover:xpo_scale-105 xpo_group"
          aria-label="Download on iOS App Store"
        >
          <span className="xpo_w-6 xpo_h-6 xpo_transition-transform xpo_group-hover:xpo_scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.ios }} />
          <span>App Store</span>
        </a>
        
        <a
          href="https://play.google.com/store/apps/details?id=com.moonlitmeadow.app"
          target="_blank"
          rel="noopener noreferrer"
          className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-3 xpo_px-5 xpo_py-3 xpo_bg-scaccent xpo_text-scwhite xpo_text-sm xpo_font-semibold xpo_rounded-xl xpo_shadow-md hover:xpo_shadow-xl xpo_transition-all xpo_duration-300 hover:xpo_scale-105 xpo_group"
          aria-label="Download on Google Play Store"
        >
          <span className="xpo_w-6 xpo_h-6 xpo_transition-transform xpo_group-hover:xpo_scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.android }} />
          <span>Google Play</span>
        </a>

        <a
          href="https://appgallery.huawei.com/app/moonlitmeadow"
          target="_blank"
          rel="noopener noreferrer"
          className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-3 xpo_px-5 xpo_py-3 xpo_bg-scprimary-700 xpo_text-scwhite xpo_text-sm xpo_font-semibold xpo_rounded-xl xpo_shadow-md hover:xpo_shadow-xl xpo_transition-all xpo_duration-300 hover:xpo_scale-105 xpo_group"
          aria-label="Download on Huawei AppGallery"
        >
          <span className="xpo_w-6 xpo_h-6 xpo_transition-transform xpo_group-hover:xpo_scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.hermony }} />
          <span>AppGallery</span>
        </a>
      </div>

      <p className="xpo_text-xs xpo_text-scprimary/50 xpo_mt-2">Available on all platforms</p>
    </div>
  );

  return (
    <section 
      className="xpo_relative xpo_w-full xpo_overflow-hidden xpo_bg-gradient-to-b xpo_from-scprimary-50/10 xpo_to-scwhite-50/50 xpo_py-6 md:xpo_py-8 xpo_rounded-xl"
      role="region"
      aria-label="Hero banner with product carousel"
    >
      <div className="xpo_container xpo_mx-auto xpo_px-4">
        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-6 xpo_gap-6 xpo_items-stretch">
          
          <div className="lg:xpo_col-span-5 xpo_w-full">
            <div 
              className="xpo_relative xpo_w-full xpo_h-[450px] md:xpo_h-[550px] lg:xpo_h-[600px] xpo_overflow-hidden xpo_rounded-3xl xpo_shadow-2xl xpo_group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured products carousel"
            >
              {activeSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`xpo_absolute xpo_inset-0 xpo_transition-all xpo_duration-700 xpo_ease-in-out ${
                    index === currentSlide 
                      ? 'xpo_opacity-100 xpo_scale-100' 
                      : 'xpo_opacity-0 xpo_scale-105'
                  }`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${activeSlides.length}`}
                  aria-hidden={index !== currentSlide}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="xpo_w-full xpo_h-full xpo_object-cover xpo_brightness-[0.85]"
                  />
                  
                  <div className="xpo_absolute xpo_inset-0 xpo_bg-gradient-to-br xpo_from-scprimary/60 xpo_via-scprimary/30 xpo_to-transparent" />
                  
                  <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_flex-col xpo_justify-center xpo_p-8 md:xpo_p-12 lg:xpo_p-16">
                    <div className="xpo_max-w-3xl xpo_space-y-6">
                      <h1 className="xpo_text-3xl md:xpo_text-5xl lg:xpo_text-6xl xpo_font-bold xpo_text-scwhite xpo_leading-tight xpo_drop-shadow-2xl xpo_animate-fade-in">
                        {slide.title}
                      </h1>
                      <p className="xpo_text-base md:xpo_text-xl lg:xpo_text-2xl xpo_text-scwhite/95 xpo_leading-relaxed xpo_drop-shadow-lg xpo_max-w-2xl">
                        {slide.subtitle}
                      </p>
                      {slide.ctaText && (
                        <a
                          href={slide.ctaLink}
                          className="xpo_inline-flex xpo_items-center xpo_gap-3 xpo_px-8 xpo_py-4 xpo_bg-scaccent xpo_text-scwhite xpo_text-base md:xpo_text-lg xpo_font-semibold xpo_rounded-full xpo_shadow-2xl hover:xpo_bg-scaccent-600 xpo_transition-all xpo_duration-300 xpo_transform hover:xpo_scale-105 hover:xpo_shadow-3xl xpo_mt-4"
                          aria-label={slide.ctaText}
                        >
                          {slide.ctaText}
                          <svg className="xpo_w-5 xpo_h-5 xpo_transition-transform xpo_group-hover:xpo_translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={prevSlide}
                className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_-translate-y-1/2 xpo_w-10 xpo_h-10 md:xpo_w-12 md:xpo_h-12 xpo_bg-scwhite/20 xpo_backdrop-blur-sm xpo_text-scwhite xpo_rounded-full xpo_shadow-lg hover:xpo_bg-scwhite/30 xpo_transition-all xpo_duration-300 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_flex xpo_items-center xpo_justify-center"
                aria-label="Previous slide"
              >
                <svg className="xpo_w-6 xpo_h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="xpo_absolute xpo_right-4 xpo_top-1/2 xpo_-translate-y-1/2 xpo_w-10 xpo_h-10 md:xpo_w-12 md:xpo_h-12 xpo_bg-scwhite/20 xpo_backdrop-blur-sm xpo_text-scwhite xpo_rounded-full xpo_shadow-lg hover:xpo_bg-scwhite/30 xpo_transition-all xpo_duration-300 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_flex xpo_items-center xpo_justify-center"
              >
                <svg className="xpo_w-6 xpo_h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div 
                role="tablist"
                aria-label="Slide controls"
                className="xpo_absolute xpo_bottom-6 xpo_left-1/2 xpo_transform xpo_-translate-x-1/2 xpo_flex xpo_gap-3 xpo_bg-scwhite/10 xpo_backdrop-blur-sm xpo_px-4 xpo_py-2 xpo_rounded-full"
              >
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`xpo_h-2 xpo_rounded-full xpo_transition-all xpo_duration-300 ${
                      index === currentSlide
                        ? 'xpo_w-8 xpo_bg-scwhite xpo_shadow-lg'
                        : 'xpo_w-2 xpo_bg-scwhite/50 hover:xpo_bg-scwhite/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-selected={index === currentSlide}
                    role="tab"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:xpo_col-span-1 xpo_w-full lg:xpo_sticky lg:xpo_top-2 xpo_self-start">
            <AppPromo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
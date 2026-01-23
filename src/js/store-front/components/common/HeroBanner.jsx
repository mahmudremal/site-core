import { useState, useEffect, useCallback } from 'react';
import { useLocale } from "../../hooks/useLocale";
import { site_url } from '@functions';
import QRCode from 'react-qr-code';

const OSIcons = {
  ios: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,
  android: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>`,
  hermony: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`
};

const HeroSection = ({ slides = [], autoSlideInterval = 5000, onLoaded = null }) => {
  const { __ } = useLocale();
  const defaultSlides = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=800&fit=crop',
      title: __('Discover Serenity Under Moonlit Skies', 'site-core'),
      subtitle: __('Curated products that bring peace and harmony to your everyday life', 'site-core'),
      ctaText: __('Explore Collection', 'site-core'),
      ctaLink: '/collections/special',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=800&fit=crop',
      title: __('Nature-Inspired Living', 'site-core'),
      subtitle: __('Premium eco-friendly essentials designed for mindful moments', 'site-core'),
      ctaText: __('Shop Now', 'site-core'),
      ctaLink: '/collections/sale',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=800&fit=crop',
      title: __('Your Journey to Tranquility Begins Here', 'site-core'),
      subtitle: __('Experience products that nurture your soul and embrace nature', 'site-core'),
      ctaText: __('Discover More', 'site-core'),
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
    <div className="bg-scwhite/50 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-scprimary/10 flex flex-col items-center text-center space-y-5 h-fit transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-scprimary tracking-tight">{__('Download Our App', 'site-core')}</h3>
        <p className="text-sm text-scprimary/60 leading-relaxed">{__('Scan to experience tranquility on-the-go', 'site-core')}</p>
      </div>

      <div className="inline-block bg-scwhite/50 p-4 rounded-xl shadow-lg border border-scprimary/5">
        <QRCode
          size={160}
          value={site_url(`/apps`)}
          bgColor="#FFFFFF00"
          fgColor="#0A1D37"
          className="w-40 h-40"
        />
      </div>

      <div className="flex flex-col gap-3 w-full">
        <a
          href="https://apps.apple.com/us/app/moonlit-meadow/id123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 bg-scprimary text-scwhite text-sm font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label={__('Download on iOS App Store', 'site-core')}
        >
          <span className="w-6 h-6 transition-transform group-hover:scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.ios }} />
          <span>{__('App Store', 'site-core')}</span>
        </a>

        <a
          href="https://play.google.com/store/apps/details?id=com.moonlitmeadow.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 bg-scaccent text-scwhite text-sm font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label={__('Download on Google Play Store', 'site-core')}
        >
          <span className="w-6 h-6 transition-transform group-hover:scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.android }} />
          <span>{__('Google Play', 'site-core')}</span>
        </a>

        <a
          href="https://appgallery.huawei.com/app/moonlitmeadow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 bg-scprimary-700 text-scwhite text-sm font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label={__('Download on Huawei AppGallery', 'site-core')}
        >
          <span className="w-6 h-6 transition-transform group-hover:scale-110" dangerouslySetInnerHTML={{ __html: OSIcons.hermony }} />
          <span>{__('AppGallery', 'site-core')}</span>
        </a>
      </div>

      <p className="text-xs text-scprimary/50 mt-2">{__('Available on all platforms', 'site-core')}</p>
    </div>
  );

  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-b from-scprimary-50/10 to-scwhite-50/50 py-6 md:py-8 rounded-xl"
      role="region"
      aria-label="Hero banner with product carousel"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-stretch">

          <div className="lg:col-span-5 w-full">
            <div
              className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-3xl shadow-2xl group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-roledescription="carousel"
              aria-label={__('Featured products carousel', 'site-core')}
            >
              {activeSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105'
                    }`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${activeSlides.length}`}
                  aria-hidden={index !== currentSlide}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover brightness-[0.85]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-br from-scprimary/60 via-scprimary/30 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16">
                    <div className="max-w-3xl space-y-6">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-scwhite leading-tight drop-shadow-2xl animate-fade-in">
                        {slide.title}
                      </h1>
                      <p className="text-base md:text-xl lg:text-2xl text-scwhite/95 leading-relaxed drop-shadow-lg max-w-2xl">
                        {slide.subtitle}
                      </p>
                      {slide.ctaText && (
                        <a
                          href={slide.ctaLink}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-scaccent text-scwhite text-base md:text-lg font-semibold rounded-full shadow-2xl hover:bg-scaccent-600 transition-all duration-300 transform hover:scale-105 hover:shadow-3xl mt-4"
                          aria-label={slide.ctaText}
                        >
                          {slide.ctaText}
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-scwhite/20 backdrop-blur-sm text-scwhite rounded-full shadow-lg hover:bg-scwhite/30 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                aria-label={__('Previous slide', 'site-core')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                aria-label={__('Next slide', 'site-core')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-scwhite/20 backdrop-blur-sm text-scwhite rounded-full shadow-lg hover:bg-scwhite/30 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div
                role="tablist"
                aria-label="Slide controls"
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-scwhite/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'w-8 bg-scwhite shadow-lg'
                        : 'w-2 bg-scwhite/50 hover:bg-scwhite/70'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-selected={index === currentSlide}
                    role="tab"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 w-full lg:sticky lg:top-2 self-start">
            <AppPromo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
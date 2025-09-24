import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { gsap } from 'gsap';

const MoonlitMeadowLogo = () => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const dotRef = useRef(null);

  useEffect(() => {
    // Clear previous animations
    gsap.killTweensOf([...starsRef.current, dotRef.current]);

    // Very subtle star animation
    starsRef.current.forEach((star, i) => {
      if (star) {
        gsap.to(star, {
          opacity: gsap.utils.random(0.4, 0.8),
          duration: gsap.utils.random(8, 15),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 10),
        });
      }
    });

    // Subtle dot pulse
    gsap.to(dotRef.current, {
      opacity: gsap.utils.random(0.6, 1),
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, [theme]);

  return (
    <div className="xpo_relative xpo_flex xpo_items-center xpo_h-9" style={{ width: '242px' }}>
      <svg 
        ref={containerRef}
        viewBox="0 0 242 36" 
        className="xpo_w-full xpo_h-full"
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#F5F7FA' : '#0A1D37'} />
            <stop offset="100%" stopColor={theme === 'dark' ? '#E9EDF3' : '#37567f'} />
          </linearGradient>
        </defs>

        {/* Minimal decorative stars */}
        <circle
          ref={el => starsRef.current[0] = el}
          cx="8"
          cy="8"
          r="1"
          fill={theme === 'dark' ? '#DCE2EB' : '#6C5DD3'}
          opacity="0.6"
        />
        <circle
          ref={el => starsRef.current[1] = el}
          cx="16"
          cy="14"
          r="0.8"
          fill={theme === 'dark' ? '#DCE2EB' : '#6C5DD3'}
          opacity="0.5"
        />
        <circle
          ref={el => starsRef.current[2] = el}
          cx="12"
          cy="22"
          r="0.6"
          fill={theme === 'dark' ? '#DCE2EB' : '#6C5DD3'}
          opacity="0.4"
        />

        {/* Main text */}
        <text
          x="28"
          y="24"
          fontSize="22"
          fontWeight="500"
          fontFamily="'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
          fill="url(#textGradient)"
          className="xpo_transition-colors xpo_duration-500"
          style={{ letterSpacing: '-0.01em' }}
        >
          MoonlitMeadow
        </text>

        {/* Simple accent dot */}
        <circle
          ref={dotRef}
          cx="230"
          cy="18"
          r="3"
          fill="#6C5DD3"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export default MoonlitMeadowLogo;
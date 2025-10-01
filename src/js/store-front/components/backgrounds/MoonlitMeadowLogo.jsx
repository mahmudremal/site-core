import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { gsap } from 'gsap';

const MoonlitMeadowLogo = () => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const textRef = useRef(null);
  const iconRef = useRef(null);
  const separatorRef = useRef(null);

  useEffect(() => {
    // Clear previous animations
    gsap.killTweensOf([...starsRef.current, iconRef.current]);

    // Very subtle star twinkling - enterprise appropriate
    starsRef.current.forEach((star, i) => {
      if (star) {
        gsap.to(star, {
          opacity: gsap.utils.random(0.6, 1),
          duration: gsap.utils.random(6, 12), // Very slow and subtle
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 8),
        });
      }
    });

    // Subtle icon glow on hover state
    gsap.set(iconRef.current, {
      filter: theme === 'dark' 
        ? 'drop-shadow(0 0 2px rgba(108, 93, 211, 0.3))' 
        : 'drop-shadow(0 1px 2px rgba(10, 29, 55, 0.1))'
    });

  }, [theme]);

  // Minimal stars for enterprise look - positioned in the icon area
  const starPositions = [
    { cx: 8, cy: 6, r: 0.4 },
    { cx: 14, cy: 4, r: 0.3 },
    { cx: 11, cy: 9, r: 0.35 },
  ];

  return (
    <div className="xpo_relative xpo_flex xpo_items-center xpo_h-9">
      <svg 
        ref={containerRef}
        // 0 0 242 36
        viewBox="0 0 202 36" 
        // xpo_w-full
        className="xpo_h-full"
      >
        <defs>
          {/* Enterprise-grade gradients */}
          <linearGradient id="primaryTextGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#F5F7FA' : '#0A1D37'} />
            <stop offset="100%" stopColor={theme === 'dark' ? '#DCE2EB' : '#37567f'} />
          </linearGradient>
          
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8D7AE5" />
            <stop offset="50%" stopColor="#6C5DD3" />
            <stop offset="100%" stopColor="#5E50BB" />
          </linearGradient>

          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5DD3" />
            <stop offset="100%" stopColor="#4C4097" />
          </linearGradient>

          <filter id="subtleGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Icon section with geometric design */}
        <g ref={iconRef} className="xpo_transition-all xpo_duration-300">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="url(#iconGradient)"
            opacity="0.1"
            stroke="url(#accentGradient)"
            strokeWidth="0.5"
          />
          
          {/* Stylized 'M' incorporating meadow/nature theme */}
          <path
            d="M8 24 L8 12 L12 20 L16 12 L20 12 L20 20 L28 12 L28 24"
            stroke="url(#accentGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Small decorative elements */}
          <path
            d="M10 26 Q12 25 14 26 Q16 25 18 26"
            stroke="url(#accentGradient)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Subtle stars in icon */}
          {starPositions.map((star, i) => (
            <circle
              key={`icon-star-${i}`}
              ref={el => starsRef.current[i] = el}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill={theme === 'dark' ? '#F5F7FA' : '#6C5DD3'}
              className="xpo_transition-colors xpo_duration-500"
              opacity="0.7"
            />
          ))}
        </g>

        {/* Vertical separator */}
        <line
          x1="42"
          y1="8"
          x2="42"
          y2="28"
          opacity="0.3"
          strokeWidth="1"
          ref={separatorRef}
          stroke={theme === 'dark' ? '#37567f' : '#DCE2EB'}
          className="xpo_transition-colors xpo_duration-500"
        />

        {/* Main text - horizontal layout */}
        <g ref={textRef} className="xpo_transition-all xpo_duration-500">
          {/* Company name in single line */}
          <text
            x="54"
            y="20"
            fontSize="18"
            fontWeight="600"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            fill="url(#primaryTextGradient)"
            className="xpo_transition-colors xpo_duration-500"
            style={{ letterSpacing: '0.02em' }}
          >
            MoonlitMeadow
          </text>
          
          {/* Subtle tagline */}
          <text
            x="54"
            y="32"
            fontSize="8"
            fontWeight="400"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            fill={theme === 'dark' ? '#9FA8B4' : '#597b9a'}
            className="xpo_transition-colors xpo_duration-500"
            opacity="0.8"
            style={{ letterSpacing: '0.05em' }}
          >
            PREMIUM MARKETPLACE
          </text>
        </g>

        {/* Subtle accent dot */}
        {/* <circle
          r="2"
          cy="18"
          cx="238"
          opacity="0.6"
          fill="url(#accentGradient)"
          className="xpo_transition-opacity xpo_duration-500"
        /> */}
      </svg>
    </div>
  );
};

export default MoonlitMeadowLogo;
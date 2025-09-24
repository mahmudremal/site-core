import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { gsap } from 'gsap';

const MoonlitMeadowLogo = () => {
  const { theme } = useTheme();
  const moonRef = useRef(null);
  const sunRef = useRef(null);
  const starRefs = useRef([]);
  const textRef = useRef(null);
  const textGlowFilterRef = useRef(null);
  const cloudPath1Ref = useRef(null);
  const cloudPath2Ref = useRef(null);

  useEffect(() => {
    gsap.killTweensOf([
      moonRef.current, sunRef.current, ...starRefs.current,
      textGlowFilterRef.current, cloudPath1Ref.current, cloudPath2Ref.current
    ]);

    if (theme === 'dark') {
      gsap.set(moonRef.current, { opacity: 1, display: 'block' });
      gsap.set(sunRef.current, { opacity: 0, display: 'none' });
      gsap.set(starRefs.current, { opacity: 1, display: 'block' });
      gsap.set(textRef.current, { fill: 'rgb(245, 247, 250)' });
      gsap.set(textGlowFilterRef.current, { attr: { 'stdDeviation': 0, 'flood-color': 'rgba(245, 247, 250, 0.5)' } });
      gsap.set([cloudPath1Ref.current, cloudPath2Ref.current], { opacity: 0.15, fill: 'hsl(220, 15%, 20%)', display: 'block' });

      gsap.to(moonRef.current, {
        boxShadow: '0 0 8px 3px rgba(249, 250, 252, 0.3), 0 0 15px 5px rgba(249, 250, 252, 0.15)',
        duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      starRefs.current.forEach((star) => {
        gsap.to(star, {
          opacity: gsap.utils.random(0.4, 1), scale: gsap.utils.random(0.8, 1.2),
          duration: gsap.utils.random(1, 2.5), repeat: -1, yoyo: true, ease: 'power1.inOut',
          delay: gsap.utils.random(0, 2),
        });
      });

      gsap.to(textGlowFilterRef.current, {
        attr: { 'stdDeviation': 1.5 },
        duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      gsap.to(cloudPath1Ref.current, {
        x: '+=10', duration: 15, repeat: -1, yoyo: true, ease: 'none',
      });
      gsap.to(cloudPath2Ref.current, {
        x: '-=8', duration: 18, repeat: -1, yoyo: true, ease: 'none', delay: 2,
      });

    } else {
      gsap.set(moonRef.current, { opacity: 0, display: 'none' });
      gsap.set(sunRef.current, { opacity: 1, display: 'block' });
      gsap.set(starRefs.current, { opacity: 0, display: 'none' });
      gsap.set(textRef.current, { fill: 'rgb(10, 29, 55)' });
      gsap.set(textGlowFilterRef.current, { attr: { 'stdDeviation': 0, 'flood-color': 'rgba(10, 29, 55, 0.3)' } });
      gsap.set([cloudPath1Ref.current, cloudPath2Ref.current], { opacity: 0.4, fill: 'hsl(0, 0%, 95%)', display: 'block' });

      gsap.to(sunRef.current, {
        boxShadow: '0 0 6px 2px rgba(255, 215, 0, 0.4), 0 0 12px 4px rgba(255, 215, 0, 0.2)',
        duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      gsap.to(textGlowFilterRef.current, {
        attr: { 'stdDeviation': 1 },
        duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      gsap.to(cloudPath1Ref.current, {
        x: '+=15', duration: 20, repeat: -1, yoyo: true, ease: 'none',
      });
      gsap.to(cloudPath2Ref.current, {
        x: '-=12', duration: 22, repeat: -1, yoyo: true, ease: 'none', delay: 1,
      });
    }
  }, [theme]);

  const starPositions = Array.from({ length: 5 }).map(() => ({
    cx: gsap.utils.random(5, 95), cy: gsap.utils.random(5, 40), r: gsap.utils.random(0.5, 1.2),
  }));

  return (
    <div className="xpo_relative xpo_w-80 xpo_h-24 xpo_overflow-hidden">
      <svg viewBox="0 0 100 100" className="xpo_absolute xpo_inset-0 xpo_w-full xpo_h-full">
        <defs>
          <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgb(249, 250, 252)" />
            <stop offset="100%" stopColor="rgb(220, 226, 235)" />
          </radialGradient>
          <filter id="moonShadow">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(249, 250, 252, 0.6)" />
          </filter>

          <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgb(255, 215, 0)" />
            <stop offset="100%" stopColor="rgb(255, 165, 0)" />
          </radialGradient>
          <filter id="sunGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255, 215, 0, 0.8)" />
          </filter>

          <filter id="textGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
            <feFlood ref={textGlowFilterRef} floodColor="rgba(245, 247, 250, 0.5)" floodOpacity="1" result="flood" />
            <feComposite in="flood" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g>
          <path
            ref={cloudPath1Ref}
            d="M-10 40 Q 0 20, 10 40 T 30 40 T 50 40 T 70 40 Q 60 20, 50 40 Z"
            fill={theme === 'dark' ? 'hsl(220, 15%, 20%)' : 'hsl(0, 0%, 95%)'}
            className="xpo_transition-colors xpo_duration-500"
            transform="translate(0, 0)"
          />
          <path
            ref={cloudPath2Ref}
            d="M-5 50 Q 5 30, 15 50 T 35 50 T 55 50 T 75 50 Q 65 30, 55 50 Z"
            fill={theme === 'dark' ? 'hsl(220, 15%, 20%)' : 'hsl(0, 0%, 95%)'}
            className="xpo_transition-colors xpo_duration-500"
            transform="translate(10, -5)"
          />
        </g>

        {starPositions.map((star, i) => (
          <circle
            key={`star-${i}`}
            ref={el => starRefs.current[i] = el}
            cx={star.cx} cy={star.cy} r={star.r}
            fill="rgb(255, 255, 255)"
            className="xpo_transition-opacity xpo_duration-500"
            style={{ opacity: theme === 'dark' ? 1 : 0 }}
          />
        ))}

        <circle
          ref={moonRef}
          cx="85" cy="30" r="8"
          fill="url(#moonGradient)"
          className="xpo_transition-opacity xpo_duration-500"
          style={{ filter: 'url(#moonShadow)', opacity: theme === 'dark' ? 1 : 0, display: theme === 'dark' ? 'block' : 'none' }}
        />
        <circle
          ref={sunRef}
          cx="85" cy="30" r="8"
          fill="url(#sunGradient)"
          className="xpo_transition-opacity xpo_duration-500"
          style={{ filter: 'url(#sunGlow)', opacity: theme === 'light' ? 1 : 0, display: theme === 'light' ? 'block' : 'none' }}
        />

        <text
          ref={textRef}
          x="50" y="60"
          textAnchor="middle"
          fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif"
          fill={theme === 'dark' ? 'rgb(245, 247, 250)' : 'rgb(10, 29, 55)'}
          className="xpo_transition-colors xpo_duration-500"
          filter="url(#textGlow)"
        >
          MoonlitMeadow
        </text>
      </svg>
    </div>
  );
};

export default MoonlitMeadowLogo;

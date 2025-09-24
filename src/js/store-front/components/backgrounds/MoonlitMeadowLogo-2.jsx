import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { gsap } from 'gsap';

const MoonlitMeadowLogo = () => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const textRef = useRef(null);
  const moonlitRef = useRef(null);
  const meadowRef = useRef(null);
  const underlineRef = useRef(null);
  const cloud1Ref = useRef(null);
  const cloud2Ref = useRef(null);

  useEffect(() => {
    // Clear previous animations
    gsap.killTweensOf([...starsRef.current, textRef.current, moonlitRef.current, meadowRef.current, underlineRef.current, cloud1Ref.current, cloud2Ref.current]);

    if (theme === 'dark') {
      // Dark theme styling
      gsap.set(starsRef.current, { opacity: 1, display: 'block' });
      gsap.set([cloud1Ref.current, cloud2Ref.current], { opacity: 0.15, fill: 'hsl(220, 15%, 25%)' });
      
      // Animate stars with varied timing
      starsRef.current.forEach((star, i) => {
        if (star) {
          gsap.to(star, {
            opacity: gsap.utils.random(0.3, 1),
            scale: gsap.utils.random(0.7, 1.3),
            rotation: gsap.utils.random(0, 360),
            duration: gsap.utils.random(2, 4),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: gsap.utils.random(0, 3),
          });
        }
      });

      // Text entrance animation
      gsap.fromTo(moonlitRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)', delay: 0.3 }
      );
      
      gsap.fromTo(meadowRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)', delay: 0.6 }
      );

      // Underline animation
      gsap.fromTo(underlineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.5, ease: 'power2.out', delay: 1 }
      );

      // Continuous glow effect
      gsap.to(textRef.current, {
        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.2))',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

    } else {
      // Light theme styling
      gsap.set(starsRef.current, { opacity: 0, display: 'none' });
      gsap.set([cloud1Ref.current, cloud2Ref.current], { opacity: 0.4, fill: 'hsl(0, 0%, 90%)' });
      
      // Text entrance animation
      gsap.fromTo(moonlitRef.current, 
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)', delay: 0.2 }
      );
      
      gsap.fromTo(meadowRef.current, 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)', delay: 0.4 }
      );

      // Underline animation
      gsap.fromTo(underlineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.8 }
      );

      // Subtle text shadow effect
      gsap.to(textRef.current, {
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Cloud animations (common for both themes)
    gsap.to(cloud1Ref.current, {
      x: '+=12',
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: 'none',
    });
    
    gsap.to(cloud2Ref.current, {
      x: '-=10',
      duration: 22,
      repeat: -1,
      yoyo: true,
      ease: 'none',
      delay: 3,
    });

  }, [theme]);

  // Generate star positions with better distribution
  const starPositions = [
    { cx: 15, cy: 15, r: 1, points: '0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2' },
    { cx: 25, cy: 35, r: 0.8, points: '0,-3 0.9,-0.9 3,0 0.9,0.9 0,3 -0.9,0.9 -3,0 -0.9,-0.9' },
    { cx: 75, cy: 20, r: 1.2, points: '0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5' },
    { cx: 85, cy: 45, r: 0.9, points: '0,-3.5 1.05,-1.05 3.5,0 1.05,1.05 0,3.5 -1.05,1.05 -3.5,0 -1.05,-1.05' },
    { cx: 8, cy: 55, r: 0.7, points: '0,-2.5 0.75,-0.75 2.5,0 0.75,0.75 0,2.5 -0.75,0.75 -2.5,0 -0.75,-0.75' },
    { cx: 92, cy: 65, r: 1.1, points: '0,-4.5 1.35,-1.35 4.5,0 1.35,1.35 0,4.5 -1.35,1.35 -4.5,0 -1.35,-1.35' },
  ];

  return (
    <div className="xpo_relative xpo_w-80 xpo_h-32 xpo_overflow-hidden xpo_bg-gradient-to-br xpo_from-transparent xpo_to-transparent">
      <svg 
        ref={containerRef}
        viewBox="0 0 100 100" 
        className="xpo_absolute xpo_inset-0 xpo_w-full xpo_h-full"
      >
        <defs>
          {/* Dark theme gradients */}
          <linearGradient id="darkMoonlitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="darkMeadowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="50%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>

          {/* Light theme gradients */}
          <linearGradient id="lightMoonlitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="lightMeadowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Underline gradient */}
          <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#fbbf24' : '#d97706'} />
            <stop offset="50%" stopColor={theme === 'dark' ? '#f59e0b' : '#ea580c'} />
            <stop offset="100%" stopColor={theme === 'dark' ? '#fbbf24' : '#d97706'} />
          </linearGradient>

          {/* Star gradient */}
          <radialGradient id="starGradient">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="70%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>

        {/* Background clouds */}
        <g className="xpo_opacity-20">
          <path
            ref={cloud1Ref}
            d="M-15 25 Q -5 15, 5 25 T 25 25 T 45 25 T 65 25 Q 55 15, 45 25 Z"
            fill={theme === 'dark' ? 'hsl(220, 15%, 25%)' : 'hsl(0, 0%, 90%)'}
            className="xpo_transition-colors xpo_duration-500"
          />
          <path
            ref={cloud2Ref}
            d="M-10 75 Q 0 65, 10 75 T 30 75 T 50 75 T 70 75 Q 60 65, 50 75 Z"
            fill={theme === 'dark' ? 'hsl(220, 15%, 25%)' : 'hsl(0, 0%, 90%)'}
            className="xpo_transition-colors xpo_duration-500"
          />
        </g>

        {/* Stars */}
        {starPositions.map((star, i) => (
          <polygon
            key={`star-${i}`}
            ref={el => starsRef.current[i] = el}
            points={star.points}
            fill="url(#starGradient)"
            className="xpo_transition-opacity xpo_duration-500"
            style={{ 
              opacity: theme === 'dark' ? 1 : 0,
              transformOrigin: `${star.cx}px ${star.cy}px`
            }}
            transform={`translate(${star.cx}, ${star.cy})`}
          />
        ))}

        {/* Main text */}
        <g ref={textRef}>
          <text
            ref={moonlitRef}
            x="50"
            y="45"
            textAnchor="middle"
            fontSize="16"
            fontWeight="300"
            fontFamily="'Playfair Display', Georgia, serif"
            fill={theme === 'dark' ? 'url(#darkMoonlitGradient)' : 'url(#lightMoonlitGradient)'}
            className="xpo_transition-colors xpo_duration-500"
            style={{ letterSpacing: '0.1em' }}
          >
            Moonlit
          </text>
          
          <text
            ref={meadowRef}
            x="50"
            y="65"
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fontFamily="'Playfair Display', Georgia, serif"
            fill={theme === 'dark' ? 'url(#darkMeadowGradient)' : 'url(#lightMeadowGradient)'}
            className="xpo_transition-colors xpo_duration-500"
            style={{ letterSpacing: '0.05em' }}
          >
            MEADOW
          </text>
        </g>

        {/* Decorative underline */}
        <line
          ref={underlineRef}
          x1="25"
          y1="72"
          x2="75"
          y2="72"
          stroke="url(#underlineGradient)"
          strokeWidth="1.5"
          className="xpo_transition-colors xpo_duration-500"
          style={{ transformOrigin: 'center' }}
        />

        {/* Decorative dots */}
        <circle cx="20" cy="72" r="1.5" fill={theme === 'dark' ? '#fbbf24' : '#d97706'} className="xpo_transition-colors xpo_duration-500" />
        <circle cx="80" cy="72" r="1.5" fill={theme === 'dark' ? '#fbbf24' : '#d97706'} className="xpo_transition-colors xpo_duration-500" />
      </svg>
    </div>
  );
};

export default MoonlitMeadowLogo;
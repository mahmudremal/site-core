import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MoonlitMeadowLogo() {
  const containerRef = useRef(null);
  const firefliesRef = useRef([]);
  const starsRef = useRef([]);
  const shootingStarRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.girl-sway', {
        rotation: 1.5,
        transformOrigin: 'center bottom',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.hair-flow', {
        d: 'M-4 -12 Q-6 -14 -8 -13 Q-9 -11 -7 -9 M4 -12 Q6 -14 8 -13 Q9 -11 7 -9',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      starsRef.current.forEach((star) => {
        gsap.to(star, {
          opacity: Math.random() * 0.4 + 0.2,
          duration: Math.random() * 3 + 2,
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 3,
          ease: 'sine.inOut'
        });
      });

      firefliesRef.current.forEach((firefly) => {
        const tl = gsap.timeline({ repeat: -1 });
        const xMove = Math.random() * 80 - 40;
        const yMove = Math.random() * 60 - 30;
        
        tl.to(firefly, {
          x: `+=${xMove}`,
          y: `+=${yMove}`,
          duration: Math.random() * 4 + 3,
          ease: 'sine.inOut'
        })
        .to(firefly, {
          x: `-=${xMove}`,
          y: `-=${yMove}`,
          duration: Math.random() * 4 + 3,
          ease: 'sine.inOut'
        });

        gsap.to(firefly, {
          opacity: 0.2,
          duration: Math.random() * 1.5 + 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

      const shootingStar = () => {
        if (shootingStarRef.current) {
          gsap.set(shootingStarRef.current, {
            x: Math.random() * 300 + 100,
            y: Math.random() * 80 + 30,
            opacity: 0
          });

          gsap.to(shootingStarRef.current, {
            x: '+=200',
            y: '+=120',
            opacity: 1,
            duration: 2,
            ease: 'power1.in',
            onComplete: () => {
              gsap.to(shootingStarRef.current, {
                opacity: 0,
                duration: 0.5
              });
              gsap.delayedCall(Math.random() * 12 + 6, shootingStar);
            }
          });
        }
      };

      gsap.delayedCall(4, shootingStar);

      gsap.to('.grass-sway', {
        rotation: 2,
        transformOrigin: 'bottom center',
        duration: 2.5,
        stagger: 0.05,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.moon-glow', {
        opacity: 0.15,
        scale: 1.05,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="xpo_w-full xpo_h-screen xpo_bg-gradient-to-b xpo_from-gray-900 xpo_via-slate-900 xpo_to-slate-800 xpo_flex xpo_items-center xpo_justify-center xpo_overflow-hidden">
      <svg viewBox="0 0 800 600" className="xpo_w-full xpo_h-auto">
        <defs>
          <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0e1a" />
            <stop offset="40%" stopColor="#151b2e" />
            <stop offset="100%" stopColor="#1a1f35" />
          </linearGradient>
          
          <linearGradient id="moonLight" x1="30%" y1="30%" x2="70%" y2="70%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          
          <radialGradient id="moonHalo">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#fde68a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="fireflyGlow">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="600" fill="url(#nightSky)" />

        {[...Array(80)].map((_, i) => (
          <circle
            key={`star-${i}`}
            ref={el => starsRef.current[i] = el}
            cx={Math.random() * 800}
            cy={Math.random() * 300}
            r={Math.random() * 1 + 0.3}
            fill="#e0e7ff"
            opacity="0.6"
          />
        ))}

        <g ref={shootingStarRef} opacity="0">
          <line x1="0" y1="0" x2="-40" y2="-25" stroke="#e0e7ff" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
          <circle cx="0" cy="0" r="1.5" fill="#fef3c7" filter="url(#softGlow)" />
        </g>

        <circle className="moon-glow" cx="620" cy="120" r="120" fill="url(#moonHalo)" opacity="0.2" />
        <circle cx="620" cy="120" r="45" fill="url(#moonLight)" filter="url(#softGlow)" />
        <ellipse cx="628" cy="115" rx="6" ry="8" fill="#f59e0b" opacity="0.15" />
        <ellipse cx="610" cy="128" rx="8" ry="6" fill="#f59e0b" opacity="0.12" />
        <ellipse cx="618" cy="108" rx="4" ry="5" fill="#f59e0b" opacity="0.1" />

        <g transform="translate(400, 370)">
          <path
            d="M-140 0 L-140 -100 L-105 -30 L-70 -100 L-35 -100 L-35 -30"
            stroke="url(#logoGrad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          
          <path
            d="M35 -100 L35 -30 L70 -100 L105 -30 L140 -100 L140 0"
            stroke="url(#logoGrad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          <g className="girl-sway" transform="translate(0, -130)">
            <ellipse cx="0" cy="8" rx="12" ry="16" fill="#2d3748" />
            
            <ellipse cx="0" cy="-6" rx="9" ry="11" fill="#d4a574" />
            
            <path
              className="hair-flow"
              d="M-4 -12 Q-6 -14 -8 -13 Q-9 -11 -7 -9 M4 -12 Q6 -14 8 -13 Q9 -11 7 -9"
              stroke="#1a1a1a"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
            <ellipse cx="0" cy="-14" rx="7" ry="6" fill="#1a1a1a" />
            
            <path
              d="M-12 8 Q-14 16 -13 24 L-8 28 L-8 22 L8 22 L8 28 L13 24 Q14 16 12 8 Z"
              fill="#4c1d95"
            />
            
            <rect x="-7" y="24" width="4" height="16" rx="2" fill="#2d3748" />
            <rect x="3" y="24" width="4" height="16" rx="2" fill="#2d3748" />
            
            <path
              d="M-12 10 Q-20 12 -24 18 L-22 20"
              stroke="#d4a574"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
            <path
              d="M12 10 Q20 12 24 18 L22 20"
              stroke="#d4a574"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            <ellipse cx="-25" cy="21" rx="2.5" ry="3" fill="#d4a574" />
            <ellipse cx="25" cy="21" rx="2.5" ry="3" fill="#d4a574" />
          </g>
        </g>

        <path d="M0 480 Q200 470 400 475 Q600 480 800 475 L800 600 L0 600 Z" fill="#1a2e1a" opacity="0.9" />
        <path d="M0 500 Q200 495 400 498 Q600 500 800 497 L800 600 L0 600 Z" fill="#0f1f0f" opacity="0.8" />

        {[...Array(120)].map((_, i) => {
          const x = (i * 6.7) % 800;
          const height = Math.random() * 25 + 15;
          const bend = Math.random() * 8 - 4;
          return (
            <path
              key={`grass-${i}`}
              className="grass-sway"
              d={`M${x} 600 Q${x + bend} ${600 - height / 2} ${x + bend * 2} ${600 - height}`}
              stroke="#2d5016"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}

        {[...Array(18)].map((_, i) => (
          <g
            key={`firefly-${i}`}
            ref={el => firefliesRef.current[i] = el}
            transform={`translate(${Math.random() * 700 + 50}, ${Math.random() * 350 + 150})`}
          >
            <circle cx="0" cy="0" r="8" fill="url(#fireflyGlow)" opacity="0.6" />
            <circle cx="0" cy="0" r="1.5" fill="#fbbf24" filter="url(#strongGlow)" />
          </g>
        ))}

        {[...Array(25)].map((_, i) => (
          <circle
            key={`flower-${i}`}
            cx={Math.random() * 800}
            cy={Math.random() * 60 + 510}
            r={Math.random() * 1.5 + 0.8}
            fill="#a78bfa"
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
}
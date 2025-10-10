import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
// import Scene from "./Scene";

export default function MoonlitSky({ moon = true }) {
  const skyRef = useRef(null);

  // Store moon initial positions so they don’t re-randomize on re-render
  const [moonPositions] = useState(() =>
    moon ? Array.from({ length: 1 }).map(() => ({
      top: `${Math.random() * 30}%`,
      left: `${Math.random() * 80}%`,
      size: 40 + Math.random() * 20,
    })) : []
  );

  useEffect(() => {
    const stars = skyRef.current.querySelectorAll(".star");
    const moons = skyRef.current.querySelectorAll(".moon");

    stars.forEach((star) => {
      gsap.to(star, {
        x: () => gsap.utils.random(-50, 50),
        y: () => gsap.utils.random(-50, 50),
        duration: gsap.utils.random(10, 20),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    moons.forEach((moon) => {
      gsap.to(moon, {
        x: () => gsap.utils.random(-15, 15), // only drift
        y: () => gsap.utils.random(-15, 15),
        duration: gsap.utils.random(20, 40),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }, []);

  const starsArray = Array.from({ length: 60 });

  return (
    <div ref={skyRef} className="xpo_relative xpo_min-h-screen xpo_h-full xpo_bg-gradient-to-b xpo_from-scprimary-900 xpo_via-scprimary-700 xpo_to-scprimary-500 xpo_overflow-hidden">
      {starsArray.map((_, i) => (
        <div
          key={`star-${i}`}
          className="star xpo_absolute xpo_rounded-full xpo_bg-scwhite-50"
          style={{
            width: "2px",
            height: "2px",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random(),
          }}
        />
      ))}

      {moonPositions.map((pos, i) => (
        <div
          key={`moon-${i}`}
          className="moon xpo_absolute xpo_rounded-full xpo_bg-scwhite-200"
          style={{
            width: `${pos.size}px`,
            height: `${pos.size}px`,
            top: pos.top,
            left: pos.left,
            boxShadow: "0 0 40px 15px rgba(245,247,250,0.6)",
          }}
        />
      ))}
      
      {/* <div className="xpo_absolute xpo_z-10">
        <Scene />
      </div> */}
    </div>
  );
}

export const MoonlitSkyBg = ({ moon = true }) => {
  return (
    <div className="xpo_fixed xpo_max-h-screen xpo_z-[-1] xpo_inset-0 xpo_pointer-events-none xpo_select-none xpo_hidden dark:xpo_block">
      <MoonlitSky moon={moon} />
    </div>
  )
}